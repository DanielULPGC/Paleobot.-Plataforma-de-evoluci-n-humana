"""PB-GH-10: el verificador protege el sistema base, la entrada DEA, el recorrido, la consulta ligera y el contenido."""
from pathlib import Path
import importlib.util, shutil, tempfile, unittest

ROOT=Path(__file__).resolve().parents[1]
TOKENS='Tokens de la consulta ligera sincronizados con assets/paleobot-base.css'
LEXEND='Lexend local idéntica al original y con su licencia'
DEA='Entrada DEA enlaza la hoja base, con CSP estricta, aviso sin JavaScript, diez secciones y sin estilos en línea'
DEA_CSS='Hoja de la entrada DEA solo con tokens de color y de tamaño de letra'
FUENTES='Recorrido, DEA y consulta ligera sin Google Fonts; las diez páginas del recorrido enlazan la hoja base'
LIGERA='Consulta ligera con imágenes locales registradas, sin Wikimedia como origen y con crédito y licencia'
PORTADA='Portada conserva el acceso «DEA» con su rótulo visible en pantallas estrechas'
NADA='No se elimina nada: datos, glosario, imágenes y mapa intactos y textos de las seis sesiones presentes'
CONTRASTE='Parejas de tokens de assets/paleobot-base.css con contraste suficiente en claro, oscuro y proyección'
NUEVAS=(TOKENS,LEXEND,DEA,DEA_CSS,FUENTES,LIGERA,PORTADA,NADA,CONTRASTE)

def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    result=importlib.util.module_from_spec(spec);spec.loader.exec_module(result)
    return result

class DisenoPBGH10(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory(prefix='paleobot-pbgh10-')
        self.repo=Path(self.temp.name)/'paleobot'
        shutil.copytree(ROOT,self.repo,ignore=shutil.ignore_patterns('.git','local-results','dist','__pycache__'))
        self.verifier=module('paleobot_verifier_pbgh10',self.repo/'scripts/verificar_repo.py')
        self.verifier.ROOT=self.repo

    def tearDown(self):self.temp.cleanup()

    def checks(self):
        self.verifier.CHECKS=[]
        return {x['name']:x['pass'] for x in self.verifier.verify(include_syntax=False)['checks']}

    def result(self,name):return self.checks()[name]

    def editar(self,ruta,antes,despues):
        f=self.repo/ruta;t=f.read_text(encoding='utf-8')
        self.assertIn(antes,t,ruta)
        f.write_text(t.replace(antes,despues,1),encoding='utf-8')

    def test_comprobaciones_nuevas_pasan(self):
        resultado=self.checks()
        for nombre in NUEVAS:self.assertTrue(resultado[nombre],nombre)

    def test_rechaza_token_desincronizado(self):
        self.editar('src/entrada_ligera/estilos.css','--acento: #8a3b12;','--acento: #8a3b13;')
        self.assertFalse(self.result(TOKENS))

    def test_rechaza_lexend_alterada(self):
        f=self.repo/'assets/fuentes/lexend-latin.woff2';f.write_bytes(f.read_bytes()+b'\0')
        self.assertFalse(self.result(LEXEND))

    def test_rechaza_lexend_sin_licencia(self):
        (self.repo/'assets/fuentes/LICENCIA-Lexend.md').unlink()
        self.assertFalse(self.result(LEXEND))

    def test_rechaza_csp_con_unsafe_inline(self):
        self.editar('dea/index.html',"style-src 'self';","style-src 'self' 'unsafe-inline';")
        self.assertFalse(self.result(DEA))

    def test_rechaza_estilo_en_linea_en_dea(self):
        self.editar('dea/index.html','<section id="mapa" ','<section style="color:red" id="mapa" ')
        self.assertFalse(self.result(DEA))

    def test_rechaza_dea_sin_noscript_ni_hoja_base(self):
        self.editar('dea/index.html','<noscript>','<div>')
        self.assertFalse(self.result(DEA))

    def test_rechaza_color_en_bruto_en_dea_css(self):
        self.editar('dea/dea.css','.mapas .guia { stroke: var(--tinta-2);','.mapas .guia { stroke: #4a524e;')
        self.assertFalse(self.result(DEA_CSS))

    def test_rechaza_tamano_de_letra_fuera_de_escala(self):
        self.editar('dea/dea.css','.ficha .fechas { color: var(--tinta-2); font-size: var(--t-s); }','.ficha .fechas { color: var(--tinta-2); font-size: 14px; }')
        self.assertFalse(self.result(DEA_CSS))

    def test_rechaza_excepcion_svg_en_otro_selector(self):
        self.editar('dea/dea.css','.ficha .fechas { color: var(--tinta-2); font-size: var(--t-s); }','.ficha .fechas { color: var(--tinta-2); font-size: 2.4px; }')
        self.assertFalse(self.result(DEA_CSS))

    def test_rechaza_google_fonts_en_el_recorrido(self):
        self.editar('atlas/recorrido/clima.html','</head>','<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend">\n</head>')
        self.assertFalse(self.result(FUENTES))

    def test_rechaza_pagina_del_recorrido_sin_hoja_base(self):
        self.editar('atlas/recorrido/aula.html','href="../../assets/paleobot-base.css"','href="../../assets/otra.css"')
        self.assertFalse(self.result(FUENTES))

    def test_rechaza_imagen_remota_en_la_ligera(self):
        self.editar('ligera/index.html','src="../img/taxones/proconsul.jpg"','src="https://upload.wikimedia.org/wikipedia/commons/x/proconsul.jpg"')
        self.assertFalse(self.result(LIGERA))

    def test_rechaza_imagen_local_inexistente(self):
        (self.repo/'img/taxones/proconsul.jpg').unlink()
        self.assertFalse(self.result(LIGERA))

    def test_rechaza_imagen_sin_licencia_en_la_ligera(self):
        self.editar('ligera/index.html','<a href="https://creativecommons.org/licenses/by-sa/3.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 3.0</a>. Sin modificaciones locales. Copia guardada en este sitio: miniatura de hasta 500 px de ancho servida por Wikimedia Commons; sin otros cambios.</figcaption></figure><p>Proconsul','Sin modificaciones locales.</figcaption></figure><p>Proconsul')
        self.assertFalse(self.result(LIGERA))

    def test_rechaza_portada_sin_acceso_dea(self):
        self.editar('atlas/recorrido/portada-sylva.html','<span>DEA</span>','<span></span>')
        self.assertFalse(self.result(PORTADA))

    def test_rechaza_cambio_en_los_datos_del_recorrido(self):
        f=self.repo/'atlas/recorrido/datos.js';f.write_text(f.read_text(encoding='utf-8')+'\n',encoding='utf-8')
        self.assertFalse(self.result(NADA))

    def test_rechaza_texto_de_sesion_perdido(self):
        self.editar('dea/dea.js',"titulo: 'Paisajes y climas del origen'","titulo: 'Paisajes del origen'")
        self.assertFalse(self.result(NADA))

    def test_rechaza_proyeccion_oscura_que_hereda_tinta_clara(self):
        # A1 de la verificación independiente: el bloque oscuro de .proyeccion no redefinía --tinta-2.
        self.editar('assets/paleobot-base.css','--tinta-2: #cfd4d0; ','')
        self.assertFalse(self.result(CONTRASTE))

    def test_rechaza_foco_sin_contraste_en_oscuro(self):
        self.editar('assets/paleobot-base.css','--foco: #8ab4f8;','--foco: #2a2f2d;')
        self.assertFalse(self.result(CONTRASTE))

if __name__=='__main__':unittest.main()
