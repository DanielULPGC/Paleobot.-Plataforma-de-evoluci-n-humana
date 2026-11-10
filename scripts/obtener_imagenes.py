#!/usr/bin/env python3
"""Obtiene copias locales de las imágenes verificadas del expediente visual.

Fuente de verdad: src/entrada_ligera/image_audit.json (bloque «verified»). Solo se descargan
las direcciones que figuran allí, siempre de Wikimedia Commons, como miniatura de hasta 500 px
de ancho. Cada copia queda registrada en img/taxones/MANIFIESTO.json con su huella SHA-256,
tamaño, dimensiones, autoría, licencia y página de origen.

Uso:
  python3 scripts/obtener_imagenes.py           # descarga (necesita red) y escribe el manifiesto
  python3 scripts/obtener_imagenes.py --check   # sin red: comprueba ficheros contra el manifiesto
"""
from __future__ import annotations

import hashlib
import json
import struct
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
AUDIT = ROOT / "src/entrada_ligera/image_audit.json"
DEST = ROOT / "img/taxones"
MANIFEST = DEST / "MANIFIESTO.json"
WIDTH = 500  # el mismo ancho que la dirección verificada en el expediente
MAX_BYTES = 1_500_000
ALLOWED_HOSTS = {"commons.wikimedia.org", "upload.wikimedia.org", "thumb.wikimedia.org"}
PREFIX = "https://commons.wikimedia.org/wiki/Special:FilePath/"
USER_AGENT = "PaleoBotDEA/1.0 (https://github.com/DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana; recurso docente)"
CHANGES = f"Miniatura de hasta {WIDTH} px de ancho servida por Wikimedia Commons; sin otros cambios."


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def kind_and_size(data: bytes) -> tuple[str, int, int]:
    """Devuelve (extensión, ancho, alto) leyendo la cabecera; rechaza lo que no sea JPEG o PNG."""
    if data[:8] == b"\x89PNG\r\n\x1a\n" and data[12:16] == b"IHDR":
        w, h = struct.unpack(">II", data[16:24])
        return "png", w, h
    if data[:3] == b"\xff\xd8\xff":
        i = 2
        while i + 9 < len(data):
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xD8, 0x01) or 0xD0 <= marker <= 0xD7:
                i += 2
                continue
            (length,) = struct.unpack(">H", data[i + 2:i + 4])
            if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return "jpg", w, h
            i += 2 + length
    raise ValueError("el contenido no es una imagen JPEG o PNG reconocible")


def thumb_url(image_url: str) -> str:
    if not image_url.startswith(PREFIX):
        raise ValueError("dirección fuera de Special:FilePath de Wikimedia Commons")
    base = image_url.split("?", 1)[0]
    return f"{base}?width={WIDTH}"


def fetch(url: str) -> tuple[bytes, str]:
    last: Exception | None = None
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "image/jpeg,image/png"})
            with urllib.request.urlopen(req, timeout=40) as resp:
                final = resp.geturl()
                host = urllib.parse.urlsplit(final).hostname or ""
                if host not in ALLOWED_HOSTS:
                    raise ValueError(f"redirección a un servidor no permitido: {host}")
                data = resp.read(MAX_BYTES + 1)
                if len(data) > MAX_BYTES:
                    raise ValueError("la imagen supera el tamaño máximo permitido")
                return data, final
        except (urllib.error.URLError, TimeoutError, ConnectionError) as exc:
            last = exc
            time.sleep(5 * (attempt + 1))
    raise RuntimeError(f"no se pudo descargar tras varios intentos: {last}")


def download() -> int:
    verified = json.loads(AUDIT.read_text(encoding="utf-8"))["verified"]
    DEST.mkdir(parents=True, exist_ok=True)
    images: dict[str, dict] = {}
    failures: list[str] = []
    for key in sorted(verified):
        rec = verified[key]
        try:
            data, final = fetch(thumb_url(rec["image_url"]))
            ext, width, height = kind_and_size(data)
            name = f"{key}.{ext}"
            (DEST / name).write_bytes(data)
            images[key] = {
                "file": name, "bytes": len(data), "sha256": sha256(data), "width": width, "height": height,
                "retrieved_from": final, "source_page": rec["source_page"], "object": rec["object"],
                "alt": rec["alt"], "credit": rec["credit"], "license": rec["license"],
                "license_url": rec["license_url"], "changes": CHANGES,
            }
            print(f"ok  {key}: {name} {width}x{height} {len(data)} bytes")
        except Exception as exc:  # se informa de todas las incidencias antes de terminar
            failures.append(f"{key}: {exc}")
            print(f"ERR {key}: {exc}")
        time.sleep(1.5)
    manifest = {
        "source": "src/entrada_ligera/image_audit.json",
        "audit_status": json.loads(AUDIT.read_text(encoding="utf-8")).get("status"),
        "retrieved": time.strftime("%Y-%m-%d", time.gmtime()),
        "width_requested": WIDTH,
        "note": "Copias de Wikimedia Commons bajo las licencias indicadas en cada entrada; la atribución se muestra junto a cada imagen.",
        "failures": failures,
        "images": images,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(images)} imágenes, {len(failures)} incidencias")
    return 1 if failures else 0


def check() -> int:
    if not MANIFEST.is_file():
        print("Falta img/taxones/MANIFIESTO.json")
        return 1
    manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    verified = json.loads(AUDIT.read_text(encoding="utf-8"))["verified"]
    problems: list[str] = []
    for key, item in manifest["images"].items():
        path = DEST / item["file"]
        if key not in verified:
            problems.append(f"{key}: no figura como verificada en el expediente")
            continue
        if not path.is_file():
            problems.append(f"{key}: falta {item['file']}")
            continue
        data = path.read_bytes()
        if sha256(data) != item["sha256"] or len(data) != item["bytes"]:
            problems.append(f"{key}: la copia no coincide con su huella")
            continue
        ext, width, height = kind_and_size(data)
        if (width, height) != (item["width"], item["height"]) or not item["file"].endswith("." + ext):
            problems.append(f"{key}: dimensiones o formato distintos de los registrados")
        rec = verified[key]
        for field in ("source_page", "credit", "license", "license_url", "object", "alt"):
            if item.get(field) != rec.get(field) or not item.get(field):
                problems.append(f"{key}: el campo {field} no coincide con el expediente")
    registered = {item["file"] for item in manifest["images"].values()} | {MANIFEST.name, "CREDITOS.md"}
    extra = sorted(p.name for p in DEST.iterdir() if p.is_file() and p.name not in registered)
    if extra:
        problems.append("ficheros sin registrar: " + ", ".join(extra))
    for line in problems:
        print(line)
    print(f"{len(manifest['images'])} imágenes registradas; {len(problems)} problemas")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(check() if "--check" in sys.argv[1:] else download())
