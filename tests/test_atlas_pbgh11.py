"""PB-GH-11: el verificador protege la columna vertebral aditiva del atlas interactivo (atlas/assets/*/95-sistema/).

Cada comprobación nueva pasa sobre el repositorio y falla con un caso preparado. Se copia el repositorio una vez por
clase; cada prueba modifica sus archivos y los restaura al terminar.
"""
from pathlib import Path
import importlib.util, re, shutil, tempfile, unittest

ROOT=Path(__file__).resolve().parents[1]
ENLACES='Atlas: hojas y scripts de 95-sistema enlazados tras los importados, con ?v=pbgh11, y carga-fin.css como último <link>'
CSP='Atlas: CSP de atlas/index.html idéntica a la vigente (no se relaja)'
SEGURO='Atlas: 95-sistema sin manejadores en línea, eval, new Function, escuchas en captura ni peticiones a hosts nuevos'
VISTAS='?view=: lista blanca de 077 igual a las 31 secciones de vista y enlace-vista.js limitado a ids literales de .view-section'
IMAGENES='Atlas: imágenes locales generadas (95-sistema/imagenes-locales-datos.js) sincronizadas con img/taxones/MANIFIESTO.json'
COSTAS='Atlas: fondo local de costas (95-sistema/costas-datos.js) idéntico a su huella de Natural Earth'
GOBIERNO='Procedencia PB-GH-11: estado anterior archivado, motivo, evidencia, impacto y retorno de cada archivo de gobierno modificado'
NUEVAS=(ENLACES,CSP,SEGURO,VISTAS,IMAGENES,COSTAS,GOBIERNO)
INDEX='atlas/index.html'
JS='atlas/assets/js/95-sistema/'
PUENTE='atlas/assets/js/20-navigation/077-paleobot-integrated-route-bridge.js'

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result

class AtlasPBGH11(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory(prefix='paleobot-pbgh11-')
        cls.repo=Path(cls.temp.name)/'paleobot'
        shutil.copytree(ROOT,cls.repo,ignore=shutil.ignore_patterns('.git','local-results','dist','__pycache__'))
        cls.verifier=module('paleobot_verifier_pbgh11',cls.repo/'scripts/verificar_repo.py')
        cls.verifier.ROOT=cls.repo
        cls.node=shutil.which('node')

    @classmethod
    def tearDownClass(cls):cls.temp.cleanup()

    def setUp(self):self.copias={}

    def tearDown(self):
        for ruta,datos in self.copias.items():
            if datos is None:(self.repo/ruta).unlink(missing_ok=True)
            else:(self.repo/ruta).write_bytes(datos)

    def cambiar(self,ruta,antes,despues,veces=1):
        f=self.repo/ruta
        if ruta not in self.copias:self.copias[ruta]=f.read_bytes()
        t=f.read_text(encoding='utf-8');self.assertIn(antes,t,'caso preparado sin efecto: '+ruta)
        f.write_text(t.replace(antes,despues,veces),encoding='utf-8')

    def anadir(self,ruta,texto):
        f=self.repo/ruta
        if ruta not in self.copias:self.copias[ruta]=f.read_bytes() if f.exists() else None
        f.write_text((f.read_text(encoding='utf-8') if f.exists() else '')+texto,encoding='utf-8')

    def borrar(self,ruta):
        f=self.repo/ruta;self.copias.setdefault(ruta,f.read_bytes());f.unlink()

    def checks(self):
        self.verifier.CHECKS=[]
        self.verifier.comprobaciones_atlas_pbgh11(self.repo,self.node)
        return {x['name']:x['pass'] for x in self.verifier.CHECKS}

    def result(self,name):return self.checks()[name]

    def test_todas_pasan_sobre_el_repositorio(self):
        resultado=self.checks()
        self.assertEqual(set(NUEVAS),set(resultado))
        self.assertTrue(all(resultado.values()),[n for n,v in resultado.items() if not v])

    # Enlaces de 95-sistema
    def test_rechaza_enlace_de_95_sistema_sin_version(self):
        self.cambiar(INDEX,'assets/js/95-sistema/dialogos.js?v=pbgh11','assets/js/95-sistema/dialogos.js')
        self.assertFalse(self.result(ENLACES))

    def test_rechaza_archivo_de_95_sistema_sin_enlazar(self):
        self.anadir(JS+'nuevo-sin-enlace.js','/* sin enlazar */\n')
        self.assertFalse(self.result(ENLACES))

    def test_rechaza_95_sistema_antes_de_los_importados(self):
        linea='<script id="pb-dialogos" src="assets/js/95-sistema/dialogos.js?v=pbgh11" defer></script>'
        self.cambiar(INDEX,linea,'')
        self.cambiar(INDEX,'<link rel="stylesheet" href="assets/css/00-core/001-style.css?v=fix7">','<link rel="stylesheet" href="assets/css/00-core/001-style.css?v=fix7">\n'+linea)
        self.assertFalse(self.result(ENLACES))

    def test_rechaza_un_link_despues_de_carga_fin(self):
        # Un <link> cualquiera (ni importado ni de 95-sistema) tras carga-fin.css basta para fallar.
        fin='<link id="pb-carga-fin-css" rel="stylesheet" href="assets/css/95-sistema/carga-fin.css?v=pbgh11">'
        self.cambiar(INDEX,fin,fin+'\n<link rel="preload" href="../assets/fuentes/lexend-latin.woff2" as="font">')
        self.assertFalse(self.result(ENLACES))

    # CSP
    def test_rechaza_csp_relajada(self):
        self.cambiar(INDEX,"script-src 'self';","script-src 'self' 'unsafe-inline';")
        self.assertFalse(self.result(CSP))

    def test_rechaza_csp_con_host_nuevo(self):
        self.cambiar(INDEX,"connect-src 'self';","connect-src 'self' https://analitica.example.org;")
        self.assertFalse(self.result(CSP))

    # Seguridad de 95-sistema
    def test_rechaza_escucha_en_captura(self):
        self.anadir(JS+'barra.js',"\nwindow.addEventListener('click', function (e) { void e; }, true);\n")
        self.assertFalse(self.result(SEGURO))

    def test_rechaza_escucha_en_captura_con_opciones(self):
        self.anadir(JS+'barra.js',"\ndocument.addEventListener('keydown', f, { capture: true });\n")
        self.assertFalse(self.result(SEGURO))

    def test_rechaza_eval_y_new_function(self):
        self.anadir(JS+'ficha.js','\nvar x = eval("1");\n')
        self.assertFalse(self.result(SEGURO))
        self.tearDown();self.setUp()
        self.anadir(JS+'ficha.js','\nvar y = new Function("return 1");\n')
        self.assertFalse(self.result(SEGURO))

    def test_rechaza_manejador_en_linea_en_plantilla(self):
        self.anadir(JS+'mapa.js','\nvar p = \'<img src="a.png" onerror="this.remove()">\';\n')
        self.assertFalse(self.result(SEGURO))

    def test_rechaza_peticion_a_host_nuevo(self):
        self.anadir(JS+'buscador.js',"\nfetch('https://api.example.org/x');\n")
        self.assertFalse(self.result(SEGURO))

    def test_rechaza_url_remota_en_hoja(self):
        self.anadir('atlas/assets/css/95-sistema/vistas.css','\n.x{background:url(https://cdn.example.org/a.png)}\n')
        self.assertFalse(self.result(SEGURO))

    def test_comentarios_no_cuentan(self):
        self.anadir(JS+'mapa.js','\n/* antes: addEventListener(\'click\', f, true) y fetch(\'https://api.example.org\') */\n')
        self.assertTrue(self.result(SEGURO))

    def test_script_movido_de_index_deja_de_estar_exento_si_cambia(self):
        # en-linea-salto-atlas.js conserva escuchas en captura porque es literalmente el script que estaba en línea.
        self.cambiar(JS+'en-linea-salto-atlas.js','function protectNutcrackerExternal(ev){','function protectNutcrackerExternal(ev){ /* cambio */')
        self.assertFalse(self.result(SEGURO))

    # ?view=
    def test_rechaza_lista_blanca_con_una_vista_menos(self):
        self.cambiar(PUENTE,"'biogeo']","]")
        self.cambiar(PUENTE,"'itinerarios',]","'itinerarios']")
        self.assertFalse(self.result(VISTAS))

    def test_rechaza_lista_blanca_con_un_valor_que_no_es_vista(self):
        self.cambiar(PUENTE,"'biogeo']","'biogeo','portada']")
        self.assertFalse(self.result(VISTAS))

    def test_rechaza_enlace_vista_sin_su_guarda(self):
        self.cambiar(JS+'enlace-vista.js',"if (!/^[a-z]+$/.test(pedida)) return;","if (!pedida) return;")
        self.assertFalse(self.result(VISTAS))

    # Generadores
    def test_rechaza_imagenes_locales_desincronizadas(self):
        f=JS+'imagenes-locales-datos.js'
        t=(self.repo/f).read_text(encoding='utf-8');m=re.search(r'"afarensis"',t)
        self.assertIsNotNone(m)
        self.cambiar(f,'"afarensis"','"afarensis_x"')
        self.assertFalse(self.result(IMAGENES))

    def test_rechaza_costas_alteradas(self):
        self.anadir(JS+'costas-datos.js','\n')
        self.assertFalse(self.result(COSTAS))

    # Procedencia
    def test_rechaza_gobierno_sin_estado_anterior_archivado(self):
        self.borrar('docs/historial/PB_GH_10/scripts/verificar_repo.py.snapshot')
        self.assertFalse(self.result(GOBIERNO))

if __name__=='__main__':unittest.main()
