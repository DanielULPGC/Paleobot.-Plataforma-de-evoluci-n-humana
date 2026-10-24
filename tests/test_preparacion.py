"""Controles negativos en copias descartables. No alteran el árbol preparado."""
from pathlib import Path
import hashlib, importlib.util, json, shutil, tempfile, unittest

ROOT=Path(__file__).resolve().parents[1]

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result

class PreparationControls(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='paleobot-negative-')
        self.repo=Path(self.temp.name)/'paleobot'
        shutil.copytree(ROOT,self.repo,ignore=shutil.ignore_patterns('.git','local-results','dist','__pycache__'))
        self.verifier=module('paleobot_verifier',self.repo/'scripts/verificar_repo.py')
        self.verifier.ROOT=self.repo

    def tearDown(self):self.temp.cleanup()

    def rejected(self,name):
        # Los controles negativos no repiten la sintaxis de 159 unidades sin cambios.
        # La verificación normal y CI sí la ejecutan, sin opción CLI para omitirla.
        self.verifier.CHECKS=[]
        result=self.verifier.verify(include_syntax=False)
        check=next(x for x in result['checks'] if x['name']==name)
        self.assertFalse(check['pass'],name)
        self.assertGreater(result['failed'],0)
        self.assertFalse(result['syntax_executed'])

    def test_rechaza_promocion_sin_prueba(self):
        f=self.repo/'provenance/ESTADO.json';d=json.loads(f.read_text());d['release_gate']='GO'
        f.write_text(json.dumps(d))
        self.rejected('NO_GO no promovido')

    def test_rechaza_evidencia_historica_alterada(self):
        f=self.repo/'docs/auditoria/registro_decisiones.csv'
        f.write_bytes(f.read_bytes()+b'\nALTERADO\n')
        self.rejected('Integridad del expediente importado')

    def test_detecta_id_cientifico_duplicado(self):
        f=self.repo/'src/entrada_ligera/catalog.json';d=json.loads(f.read_text())
        d['records'][1]['id']=d['records'][0]['id'];f.write_text(json.dumps(d))
        self.rejected('50 IDs canónicos únicos')

    def test_detecta_recurso_local_ausente(self):
        f=self.repo/'experimental/atlas-r98/fuentes/Auditoria_R98/assets/js/00-core/001-paleobot-v63-error-capture.js'
        f.unlink()
        self.rejected('Rutas estáticas de tres HTML')

    def test_detecta_identificador_privado(self):
        value='libfile_'+'a'*32
        (self.repo/'accidental.txt').write_text(value)
        self.rejected('Sin identificadores privados de plataforma en texto')

    def test_comentario_de_cuarentena_no_es_carga(self):
        self.verifier.CHECKS=[]
        result=self.verifier.verify(include_syntax=False)
        check=next(x for x in result['checks'] if x['name']=='Cuarentena no cargada desde el índice')
        self.assertTrue(check['pass'])
        self.assertEqual(result['failed'],0)

    def test_build_check_detecta_html_divergente(self):
        f=self.repo/'ligera/index.html';f.write_bytes(f.read_bytes()+b'\n<!-- changed -->\n')
        builder=module('paleobot_builder',self.repo/'scripts/construir.py');builder.ROOT=self.repo
        with self.assertRaisesRegex(RuntimeError,'difiere'):
            builder.build('light',check=True)

    def test_build_normal_preserva_fuentes_y_escribe_dist(self):
        tracked=[self.repo/'ligera/index.html',*list((self.repo/'src/entrada_ligera').glob('*'))]
        before={str(f):hashlib.sha256(f.read_bytes()).hexdigest() for f in tracked if f.is_file()}
        builder=module('paleobot_builder2',self.repo/'scripts/construir.py');builder.ROOT=self.repo
        result=builder.build('light',check=False)
        after={f:hashlib.sha256(Path(f).read_bytes()).hexdigest() for f in before}
        self.assertEqual(before,after)
        self.assertEqual(result['mode'],'write_dist_only')
        self.assertEqual((self.repo/'dist/entrada-ligera-v11.html').read_bytes(),(self.repo/'ligera/index.html').read_bytes())

if __name__=='__main__':unittest.main()
