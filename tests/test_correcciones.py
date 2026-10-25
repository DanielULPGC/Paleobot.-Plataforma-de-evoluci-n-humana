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

if __name__=='__main__':
    unittest.main()
