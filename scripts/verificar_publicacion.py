#!/usr/bin/env python3
"""Comprueba recursos estáticos por HTTP bajo el prefijo de un proyecto Pages.

No ejecuta JavaScript, no solicita recursos externos y no acredita Moodle.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import threading
from html.parser import HTMLParser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import quote, unquote, urljoin, urlsplit
from urllib.request import urlopen

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "/Paleobot.-Plataforma-de-evoluci-n-humana/"
ATLAS = "experimental/atlas-r98/fuentes/Auditoria_R98/"
ENTRIES = [
    "index.html",
    "ligera/index.html",
    "atlas/index.html",
    "atlas/recorrido/index.html",
    "atlas/recorrido/portada-sylva.html",
    "baselines/entrada-ligera-v9.html",
    "experimental/atlas-r98/PaleoBot_Atlas_Original_Directo_R98_PILOTO.html",
    ATLAS + "index.html",
    ATLAS + "science/chronology.html",
]


class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {"script", "img", "source", "iframe"}:
            value = values.get("src")
        elif tag in {"link", "a"}:
            value = values.get("href")
        else:
            return
        if value:
            self.references.append(value)


def verify(root: Path = ROOT, *, http: bool = True, prefix: str = PREFIX):
    root = Path(root).resolve()
    if not prefix.startswith("/") or not prefix.endswith("/"):
        raise ValueError("El prefijo debe comenzar y terminar con /")
    origin = "http://127.0.0.1"
    issues = []
    targets = set(ENTRIES)
    pages = []
    css_queue = []
    external_references_skipped = 0

    def resolve(reference: str, source: str):
        nonlocal external_references_skipped
        parsed = urlsplit(reference)
        if parsed.scheme or parsed.netloc:
            external_references_skipped += 1
            return
        if not parsed.path:
            return
        resolved = urlsplit(urljoin(origin + prefix + source, reference))
        decoded = unquote(resolved.path)
        if not decoded.startswith(prefix):
            issues.append({"source": source, "reference": reference,
                           "reason": "outside_project_prefix"})
            return
        relative = decoded[len(prefix):]
        candidate = (root / relative).resolve()
        if not candidate.is_relative_to(root) or not (candidate.is_file() or candidate.is_dir() and (candidate / "index.html").is_file()):
            issues.append({"source": source, "reference": reference,
                           "reason": "missing_local_resource"})
            return
        targets.add(relative)
        if candidate.suffix == ".css":
            css_queue.append(relative)

    for relative in ENTRIES:
        file = root / relative
        if not file.is_file():
            issues.append({"source": relative, "reason": "missing_entry"})
            continue
        parser = References()
        parser.feed(file.read_text(encoding="utf-8"))
        before = len(issues)
        for reference in parser.references:
            resolve(reference, relative)
        pages.append({"path": relative, "references": len(parser.references),
                      "local_issues": len(issues) - before})

    visited_css = set()
    css_url = re.compile(r"url\(\s*([\"']?)(.*?)\1\s*\)", re.IGNORECASE | re.DOTALL)
    while css_queue:
        relative = css_queue.pop()
        if relative in visited_css:
            continue
        visited_css.add(relative)
        for match in css_url.finditer((root / relative).read_text(encoding="utf-8")):
            resolve(match.group(2).strip(), relative)

    expected = json.loads((root / "provenance/PB_GH_02_ENTRADAS.json").read_text())["sha256"]["index.html"]
    actual = hashlib.sha256((root / "index.html").read_bytes()).hexdigest()
    main_matches = actual == expected
    if not main_matches:
        issues.append({"source": "index.html", "reason": "wrong_main_entry",
                       "expected_sha256": expected, "actual_sha256": actual})
    nojekyll = (root / ".nojekyll").is_file()
    if not nojekyll:
        issues.append({"source": ".nojekyll", "reason": "missing_static_pages_marker"})

    http_checked = 0
    http_failures = []
    if http:
        class Handler(SimpleHTTPRequestHandler):
            def __init__(self, *args, **kwargs):
                super().__init__(*args, directory=str(root), **kwargs)

            def do_GET(self):
                requested = urlsplit(self.path)
                if not requested.path.startswith(prefix):
                    self.send_error(404)
                    return
                self.path = "/" + requested.path[len(prefix):]
                super().do_GET()

            def log_message(self, *_args):
                pass

        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        worker = threading.Thread(target=server.serve_forever, daemon=True)
        worker.start()
        endpoint = f"http://127.0.0.1:{server.server_port}"
        try:
            for relative in ["", *sorted(targets)]:
                try:
                    with urlopen(endpoint + prefix + quote(relative, safe="/"), timeout=5) as response:
                        body = response.read()
                        if response.status != 200:
                            raise ValueError("Unexpected HTTP status")
                        expected_file = root / (relative or "index.html")
                        if expected_file.is_dir():
                            expected_file = expected_file / "index.html"
                        if body != expected_file.read_bytes():
                            raise ValueError("HTTP bytes differ")
                    http_checked += 1
                except (OSError, ValueError) as exc:
                    http_failures.append({"path": relative or "(project root)",
                                          "error": type(exc).__name__})
        finally:
            server.shutdown()
            server.server_close()
            worker.join(timeout=5)
    return {
        "scope": "STATIC_FILES_AND_LOCAL_HTTP_ONLY",
        "prefix": prefix,
        "passed": not issues and not http_failures,
        "main_entry_matches_declared": main_matches,
        "main_entry_sha256": actual,
        "nojekyll_present": nojekyll,
        "pages": pages,
        "css_files_inspected": len(visited_css),
        "local_resources": len(targets),
        "reference_issues": issues,
        "http_requests_passed": http_checked,
        "http_failures": http_failures,
        "external_references_skipped": external_references_skipped,
        "external_requests_executed": 0,
        "javascript_executed": False,
        "browser_executed": False,
        "moodle_executed": False,
        "release_gate": "NO_GO",
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    args = parser.parse_args()
    result = verify(args.root)
    out = args.root / "local-results"
    out.mkdir(exist_ok=True)
    (out / "publication.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result["passed"] else 1)
