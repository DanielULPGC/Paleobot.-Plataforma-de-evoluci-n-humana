"""PB-GH-11 (T8): decisiones de la titular del 20-11-2026 sobre el atlas interactivo.

1. El simulador «Out of Africa» (008) rotula MIS 8 entre 300 y 243 ka (antes, «MIS 1 · Holoceno»): la tabla M12_MIS
   cubre sin huecos ni solapes todo el intervalo del simulador (0-315 ka) con los límites de la escala del propio atlas
   (006, MIS_STAGES; Lisiecki y Raymo, 2005) y currentMis() no devuelve un estadio de la tabla fuera de ella.
2. La ficha académica imprimible ya no lleva la imagen QR de api.qrserver.com y conserva la dirección del recurso.
3. Las 21 imágenes principales locales que son otra obra que la citada por la ficha tienen pie propio.

Las pruebas leen los archivos del repositorio; las de 008 evalúan su tabla y su función con Node (sin navegador).
"""
from pathlib import Path
import json, re, shutil, subprocess, unittest

ROOT = Path(__file__).resolve().parents[1]
SIM = ROOT / 'atlas/assets/js/10-legacy-ui/008-paleobot-v34-m11m20-layer.js'
ESCALA = ROOT / 'atlas/assets/js/00-core/006-script.js'
NUCLEO = ROOT / 'atlas/assets/js/00-core/002-script.js'
LOCALES = ROOT / 'atlas/assets/js/95-sistema/imagenes-locales.js'
DATOS = ROOT / 'atlas/assets/js/95-sistema/imagenes-locales-datos.js'
NODE = shutil.which('node')


def tabla_y_funcion():
    texto = SIM.read_text(encoding='utf-8')
    tabla = re.search(r'const M12_MIS = \[.*?\n  \];', texto, re.S).group(0)
    fuera = re.search(r'  const M12_MIS_FUERA = .*?;\n', texto).group(0)
    funcion = re.search(r'  function currentMis\(ka\)\{.*?\}\n', texto).group(0)
    return tabla + '\n' + fuera + funcion


def evaluar(programa):
    salida = subprocess.run([NODE, '-e', programa], capture_output=True, text=True, timeout=60)
    if salida.returncode:
        raise AssertionError(salida.stderr)
    return json.loads(salida.stdout)


@unittest.skipUnless(NODE, 'Node no disponible')
class SimuladorMIS(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        codigo = tabla_y_funcion()
        cls.r = evaluar(codigo + r"""
const r = { tabla: M12_MIS, a279: currentMis(279).mis, porKa: {}, fuera: {} };
for (let d = 0; d <= 3150; d++) { const ka = d / 10; r.porKa[ka] = currentMis(ka).mis; }
for (const ka of [-1, 315.5, 337.5, 400, NaN, undefined]) r.fuera[String(ka)] = currentMis(ka).mis;
console.log(JSON.stringify(r));
""")

    def test_a_279_ka_el_rotulo_es_mis_8(self):
        self.assertEqual(self.r['a279'], 'MIS 8')

    def test_tabla_continua_sin_huecos_ni_solapes(self):
        tabla = self.r['tabla']
        for anterior, siguiente in zip(tabla, tabla[1:]):
            self.assertEqual(anterior['end'], siguiente['start'], f"{anterior['mis']} → {siguiente['mis']}")
            self.assertGreater(anterior['start'], anterior['end'])
        self.assertEqual(tabla[-1]['end'], 0)
        self.assertGreaterEqual(tabla[0]['start'], 315, 'la tabla debe cubrir todo el recorrido del simulador (0-315 ka)')

    def test_cada_edad_del_simulador_tiene_su_estadio(self):
        tabla = self.r['tabla']
        for ka, mis in self.r['porKa'].items():
            ka = float(ka)
            # Un límite compartido pertenece al estadio más antiguo (orden de la tabla, como antes de la T8).
            esperado = next(m['mis'] for m in tabla if m['end'] <= ka <= m['start'])
            self.assertEqual(mis, esperado, ka)

    def test_fuera_de_tabla_no_devuelve_un_estadio(self):
        estadios = {m['mis'] for m in self.r['tabla']}
        for ka, mis in self.r['fuera'].items():
            if ka in ('-1', '337.5', '400', 'NaN', 'undefined'):
                self.assertNotIn(mis, estadios, ka)
        self.assertEqual(self.r['fuera']['315.5'], 'MIS 9')

    def test_limites_iguales_a_la_escala_del_atlas(self):
        escala = ESCALA.read_text(encoding='utf-8')
        for m in self.r['tabla']:
            n = int(m['mis'].split()[1])
            fila = re.search(r'\{ stage:%d,\s+warm:(true|false),\s+start:(\d+),\s+end:(\d+)' % n, escala)
            self.assertIsNotNone(fila, m['mis'])
            self.assertEqual((int(fila.group(2)), int(fila.group(3))), (m['start'], m['end']), m['mis'])


class FichaImprimible(unittest.TestCase):
    def test_sin_imagen_qr_y_con_la_direccion_en_texto(self):
        texto = NUCLEO.read_text(encoding='utf-8')
        cuerpo = re.search(r'function buildAcademicPrintSheet\(sp\) \{.*?\n\}\n', texto, re.S).group(0)
        self.assertNotIn('https://api.qrserver.com', texto)
        self.assertNotIn('academic-qr', cuerpo)
        self.assertIn('<h2>Recurso</h2>', cuerpo)
        self.assertIn('${safeResourceUrl}', cuerpo)


class PiesDeImagen(unittest.TestCase):
    def test_cada_pie_propio_tiene_copia_local(self):
        datos = json.loads(re.search(r'window\.PB_ATLAS_IMAGENES_LOCALES = (\{.*\});', DATOS.read_text(encoding='utf-8')).group(1))
        locales = LOCALES.read_text(encoding='utf-8')
        bloque = re.search(r'var PIES = \{(.*?)\n  \};', locales, re.S).group(1)
        claves = re.findall(r'^    (\w+): \{', bloque, re.M)
        self.assertEqual(len(claves), 21)
        for clave in claves:
            self.assertIn(clave, datos)


if __name__ == '__main__':
    unittest.main()
