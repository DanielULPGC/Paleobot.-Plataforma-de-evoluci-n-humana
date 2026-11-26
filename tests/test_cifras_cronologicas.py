"""Las cifras cronológicas visibles de la consulta ligera salen de `chronology.records`, no del campo heredado `anos`.

`catalog.json` conserva el catálogo original (su huella está protegida por el verificador). El campo `anos` de ese
original es anterior a las revisiones (Grün et al., 2020; Vidal et al., 2022; Sutikna et al., 2016; etc.) y no debe
llegar a la página: estas pruebas fallan si alguien lo hace visible o si las cifras revisadas desaparecen.
"""
import json, re, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CAT = json.loads((ROOT / "src/entrada_ligera/catalog.json").read_text(encoding="utf-8"))
HTML = (ROOT / "ligera/index.html").read_text(encoding="utf-8")


class CifrasCronologicas(unittest.TestCase):
    def test_build_no_usa_el_campo_heredado(self):
        for nombre in ("build.py", "interaccion.js"):
            src = (ROOT / "src/entrada_ligera" / nombre).read_text(encoding="utf-8")
            self.assertIsNone(re.search(r"""\[\s*['"]anos['"]\s*\]|\.get\(\s*['"]anos['"]|\.anos\b""", src), nombre)

    def test_cada_ficha_tiene_cronologia_revisada(self):
        self.assertEqual({r["id"] for r in CAT["records"]}, set(CAT["chronology"]["records"]))

    def test_cifras_revisadas_visibles(self):
        # Valores que el catálogo original da distintos (400 ka, 195 ka, 50 ka) y que el sitio debe mostrar revisados.
        revisadas = {"rhodesiensis": "299 ± 25 ka", "omo_i": "233 ± 22 ka", "flores": "~100–60 ka"}
        original = {"rhodesiensis": "400 ka", "omo_i": "195 ka", "flores": "50 ka"}
        for k, texto in revisadas.items():
            ficha = re.search(r'<details class="species" id="sp-%s".*?</details>' % k, HTML, re.S).group(0)
            plano = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", ficha))
            self.assertIn(texto, plano, k)
            m = re.search(r"Dato cronológico revisado:[^.]*", plano)
            self.assertIsNotNone(m, k)
            self.assertNotIn(original[k], m.group(0), k)


if __name__ == "__main__":
    unittest.main()
