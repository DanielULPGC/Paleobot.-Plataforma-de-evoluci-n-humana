"""La consulta ligera lista dos subespecies de H. erectus que solo existen en el atlas: sus datos deben seguir siendo los del atlas."""
import importlib.util, json, unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class SubespeciesLigera(unittest.TestCase):
    def test_coinciden_con_el_atlas(self):
        spec = importlib.util.spec_from_file_location("build_ligera", ROOT / "src/entrada_ligera/build.py")
        build = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(build)
        atlas = {t["id"]: t for t in json.loads((ROOT / "atlas/data/taxones.json").read_text(encoding="utf-8"))["taxones"]}
        self.assertEqual([s["id"] for s in build.SUBESPECIES_ATLAS], ["erectus_erectus", "erectus_pekinensis"])
        for s in build.SUBESPECIES_ATLAS:
            t = atlas[s["id"]]
            self.assertEqual((s["nombre"], s["region"], s["nota"]), (t["nombre"], t["regionNombre"], t["notasIncertidumbre"]))
            self.assertEqual((s["desde_ma"], s["hasta_ma"]), (t["rangoMa"]["desde"], t["rangoMa"]["hasta"]))

    def test_ligera_publicada_las_incluye(self):
        html = (ROOT / "ligera/index.html").read_text(encoding="utf-8")
        for k in ("erectus_erectus", "erectus_pekinensis"):
            self.assertIn(f'id="sub-{k}"', html)
        self.assertEqual(html.count('<details class="species"'), 50)


if __name__ == "__main__":
    unittest.main()
