"""PB-GH-03: las correcciones del Atlas v1 solo pasan si están documentadas y el original se conserva."""
from pathlib import Path
import importlib.util, shutil, tempfile, unittest

ROOT=Path(__file__).resolve().parents[1]
ATLAS_JS='atlas/assets/js/00-core/002-script.js'
CHECK_ATLAS='169 archivos Atlas v1 conservan las huellas importadas o una corrección documentada'

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result

class AtlasCorrections(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='paleobot-pbgh03-')
        self.repo=Path(self.temp.name)/'paleobot'
        shutil.copytree(ROOT,self.repo,ignore=shutil.ignore_patterns('.git','local-results','dist','__pycache__'))
        self.verifier=module('paleobot_verifier_pbgh03',self.repo/'scripts/verificar_repo.py')
        self.verifier.ROOT=self.repo

    def tearDown(self):self.temp.cleanup()

    def result(self,name):
        self.verifier.CHECKS=[]
        result=self.verifier.verify(include_syntax=False)
        return next(x for x in result['checks'] if x['name']==name)['pass']

    def test_correccion_documentada_pasa(self):
        self.assertTrue(self.result(CHECK_ATLAS))

    def test_rechaza_cambio_no_documentado(self):
        target=self.repo/ATLAS_JS
        target.write_text(target.read_text(encoding='utf-8')+'\n// cambio sin registrar\n',encoding='utf-8')
        self.assertFalse(self.result(CHECK_ATLAS))

    def test_rechaza_correccion_sin_original_archivado(self):
        (self.repo/'docs/historial/BASE_4D320EE'/(ATLAS_JS+'.snapshot')).unlink()
        self.assertFalse(self.result(CHECK_ATLAS))

    def test_rechaza_cadena_sin_estado_intermedio(self):
        (self.repo/'docs/historial/PB_GH_03'/(ATLAS_JS+'.snapshot')).unlink()
        self.assertFalse(self.result('Cadena de correcciones del Atlas con estados intermedios archivados'))

    def test_rechaza_reintroducir_error_de_cronologia(self):
        target=self.repo/ATLAS_JS
        t=target.read_text(encoding='utf-8').replace('anos: "~100–60 ka"','anos: "50 ka"',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Atlas v1 sin los errores de cronología corregidos en PB-GH-04'))

    def test_rechaza_reintroducir_imagen_sin_permiso(self):
        target=self.repo/'atlas/assets/js/00-core/005-script.js'
        target.write_text(target.read_text(encoding='utf-8')+'\n// B44_02.jpg\n',encoding='utf-8')
        self.assertFalse(self.result('Atlas v1 no carga la imagen sin permiso de reutilización'))

    def test_rechaza_selector_que_marca_body(self):
        target=self.repo/'atlas/assets/js/20-navigation/037-paleobot-v55-nav.js'
        t=target.read_text(encoding='utf-8').replace("[data-pb-v50-block]:not(body)","[data-pb-v50-block]",1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Selectores de bloque no marcan body como pestaña'))

    def test_rechaza_menu_portada_sin_nombre_accesible(self):
        target=self.repo/'atlas/recorrido/portada-sylva.html'
        t=target.read_text(encoding='utf-8').replace(' aria-label="Parentesco"','',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Menú de la portada con nombre accesible en pantallas estrechas'))

    def test_rechaza_manifiesto_con_fichero_inexistente(self):
        target=self.repo/'atlas/imsmanifest.xml'
        t=target.read_text(encoding='utf-8').replace('<file href="recorrido/portada-sylva.html"/>','<file href="recorrido/no-existe.html"/>',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Manifiesto IMS completo e incluye la portada'))

    def test_rechaza_reintroducir_boton_ia(self):
        target=self.repo/'atlas/assets/js/10-legacy-ui/007-paleobot-v34-layer.js'
        target.write_text(target.read_text(encoding='utf-8')+'\n// <button data-quiz-next="generative">Preguntas con IA</button>\n',encoding='utf-8')
        self.assertFalse(self.result('Sin botones ni rótulos de IA en la interfaz'))

    def test_rechaza_retirada_sin_original_archivado(self):
        (self.repo/'docs/historial/BASE_4D320EE/atlas/LEEME-MOODLE.md.snapshot').unlink()
        self.assertFalse(self.result(CHECK_ATLAS))

    def test_rechaza_reintroducir_instrucciones_moodle(self):
        (self.repo/'atlas/LEEME-MOODLE.md').write_text('# LEEME MOODLE\n',encoding='utf-8')
        self.assertFalse(self.result('Sin textos de Moodle en la interfaz ni instrucciones de subida'))

    def test_rechaza_dea_con_recurso_externo(self):
        target=self.repo/'dea/index.html'
        t=target.read_text(encoding='utf-8').replace('<link rel="stylesheet" href="dea.css">','<link rel="stylesheet" href="https://cdn.example.org/x.css">',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Entrada DEA completa y con recursos locales'))

    def test_rechaza_dea_con_conexion_de_red(self):
        target=self.repo/'dea/dea.js'
        target.write_text(target.read_text(encoding='utf-8')+'\nfetch("/x");\n',encoding='utf-8')
        self.assertFalse(self.result('Entrada DEA con CSP estricta y sin conexiones de red'))

    def test_rechaza_glosario_dea_desincronizado(self):
        target=self.repo/'dea/glosario.js'
        target.write_text(target.read_text(encoding='utf-8').replace('"bipedismo"','"bipedalismo"',1),encoding='utf-8')
        self.assertFalse(self.result('Glosario DEA sincronizado con el del atlas'))

    def test_rechaza_retirar_la_referencia_marcada(self):
        target=self.repo/'ligera/index.html'
        t=target.read_text(encoding='utf-8').replace(' <em>(Referencia no localizada en las comprobaciones realizadas; pendiente de verificación.)</em>','',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Referencia no localizada marcada y conservada'))

    def test_rechaza_portada_que_pierde_un_enlace(self):
        target=self.repo/'atlas/recorrido/portada-sylva.html'
        t=target.read_text(encoding='utf-8').replace('href="territorio.html"','href="#"',1)
        target.write_text(t,encoding='utf-8')
        self.assertFalse(self.result('Portada enlaza la entrada DEA sin perder enlaces'))

    def test_rechaza_copia_de_imagen_alterada(self):
        target=self.repo/'img/taxones/afarensis.jpg'
        target.write_bytes(target.read_bytes()+b'x')
        self.assertFalse(self.result('Copias de imágenes íntegras, registradas y con licencia'))

    def test_rechaza_imagen_sin_registrar(self):
        (self.repo/'img/taxones/sin-registro.jpg').write_bytes(b'\xff\xd8\xff')
        self.assertFalse(self.result('Copias de imágenes íntegras, registradas y con licencia'))

    def test_rechaza_creditos_desincronizados(self):
        target=self.repo/'dea/imagenes.js'
        target.write_text(target.read_text(encoding='utf-8').replace('CC BY-SA 3.0','Sin licencia',1),encoding='utf-8')
        self.assertFalse(self.result('Imágenes y créditos de la entrada DEA sincronizados con el manifiesto'))

if __name__=='__main__':
    unittest.main()
