"""Regresiones del incidente: entrada incorrecta y rutas de proyecto Pages."""
import importlib.util
import shutil
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("publication", ROOT / "scripts/verificar_publicacion.py")
PUBLICATION = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PUBLICATION)


class PublicationControls(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="paleobot-pages-")
        self.repo = Path(self.temp.name) / "paleobot"
        shutil.copytree(ROOT, self.repo,
                        ignore=shutil.ignore_patterns(".git", "local-results", "dist", "__pycache__"))

    def tearDown(self):
        self.temp.cleanup()

    def test_archivos_servidos_bajo_prefijo_del_proyecto(self):
        result = PUBLICATION.verify(self.repo)
        self.assertTrue(result["passed"], result)
        self.assertGreater(result["http_requests_passed"], 100)
        self.assertEqual(result["external_requests_executed"], 0)

    def test_rechaza_indice_distinto_de_la_entrada_declarada(self):
        atlas = self.repo / PUBLICATION.ATLAS / "index.html"
        shutil.copyfile(atlas, self.repo / "index.html")
        result = PUBLICATION.verify(self.repo, http=False)
        self.assertFalse(result["passed"])
        self.assertIn("wrong_main_entry", {x["reason"] for x in result["reference_issues"]})

    def test_rechaza_ruta_absoluta_que_sale_del_prefijo(self):
        page = self.repo / PUBLICATION.ATLAS / "index.html"
        page.write_text(page.read_text() + '\n<link rel="stylesheet" href="/assets/incorrect.css">')
        target = self.repo / "assets/incorrect.css"
        target.parent.mkdir(exist_ok=True)
        target.write_text("body { color: black; }")
        result = PUBLICATION.verify(self.repo, http=False)
        self.assertFalse(result["passed"])
        self.assertIn("outside_project_prefix", {x["reason"] for x in result["reference_issues"]})


if __name__ == "__main__":
    unittest.main()
