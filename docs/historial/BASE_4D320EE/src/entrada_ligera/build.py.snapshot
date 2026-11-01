#!/usr/bin/env python3
"""Build a low-load, static Moodle entry from the preserved PaleoBot A3 catalog."""

from __future__ import annotations

import hashlib
import html
import json
import re
from collections import defaultdict
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "catalog.json"
IMAGE_AUDIT = ROOT / "image_audit.json"
OUT = ROOT / "index.html"
OUT_SINGLE = ROOT / "PaleoBot_Moodle_Entrada_Directa_v11.html"


def e(value: object) -> str:
    return html.escape(str(value if value is not None else ""), quote=True)


def safe_url(url: object) -> str:
    value = str(url or "")
    parts = urlsplit(value)
    return value if parts.scheme == "https" and parts.netloc else ""


def source_page(image_url: str) -> str:
    """Link to a Commons description when possible, not to a broken thumbnail."""
    parsed = urlsplit(image_url)
    if parsed.netloc not in {"upload.wikimedia.org", "commons.wikimedia.org"}:
        return image_url
    pieces = parsed.path.split("/")
    name = pieces[-2] if "/thumb/" in parsed.path else pieces[-1]
    name = unquote(name)
    if not name or "/" in name:
        return image_url
    return "https://commons.wikimedia.org/wiki/File:" + quote(name)


def chronology_key(entry: dict) -> int:
    if entry.get("kind") in ("point_estimate", "minimum_age"):
        return round(entry.get("estimate_ka", 0))
    intervals = entry.get("intervals_ka") or []
    return round(max((pair[1] for pair in intervals), default=-1))


def chronology_type(entry: dict) -> str:
    return {
        "point_estimate": "Estimación puntual",
        "minimum_age": "Edad mínima",
        "maximum_age": "Edad máxima",
        "closed_interval": "Ventana publicada",
        "alternative_intervals": "Ventanas alternativas",
        "unknown": "Cronología no determinada",
    }.get(entry.get("kind"), "Tipo pendiente de revisión")


def bibliography(species: dict) -> str:
    refs = species.get("experto", {}).get("referencias") or []
    if not refs:
        return "<p>No hay referencias detalladas en esta ficha del catálogo.</p>"
    lines = []
    for ref in refs:
        if not isinstance(ref, dict):
            continue
        desc = ". ".join(filter(None, [str(ref.get("a") or ""), str(ref.get("y") or ""), str(ref.get("t") or ""), str(ref.get("j") or "")]))
        doi = str(ref.get("d") or "").strip()
        link = (
            f' <a href="https://doi.org/{e(doi)}" target="_blank" rel="noopener noreferrer">DOI: {e(doi)}</a>'
            if re.fullmatch(r"10\.\d{4,9}/[^\s<>\"']+", doi) else ""
        )
        lines.append(f"<li>{e(desc)}{link}</li>")
    return "<ul class=references>" + "".join(lines) + "</ul>" if lines else "<p>Sin referencias detalladas.</p>"


def build() -> None:
    raw = DATA.read_bytes()
    payload = json.loads(raw)
    records = payload["records"]
    chrono = payload["chronology"]["records"]
    image_audit = json.loads(IMAGE_AUDIT.read_text(encoding="utf-8"))
    verified = image_audit["verified"]
    pending = image_audit.get("pending", {})
    ids = [sp["id"] for sp in records]
    assert len(ids) == len(set(ids)) == 50
    assert set(ids) == set(chrono)
    assert set(verified) <= set(ids)
    assert set(pending) <= set(ids) - set(verified)
    region_groups: dict[str, list[dict]] = defaultdict(list)
    cards = []
    for sp in records:
        key = sp["id"]
        age = chrono[key]
        region = str(sp.get("ubicacion") or "Localidad no indicada")
        region_groups[region].append(sp)
        image = safe_url(sp.get("imagen"))
        if key in verified:
            audit = verified[key]
            assert safe_url(audit["image_url"]) and safe_url(audit["source_page"])
            assert safe_url(audit["license_url"])
            upstream = (
                f' · <a href="{e(audit["upstream_page"])}" target="_blank" rel="noopener noreferrer">Publicación de origen</a>'
                if safe_url(audit.get("upstream_page")) else ""
            )
            figure = (
                f'<figure class=media><img data-src="{e(audit["image_url"])}" alt="{e(audit["alt"])}" loading=lazy hidden>'
                f'<figcaption><strong>{e(audit["object"])}</strong> · {e(audit["credit"])}. '
                f'<a href="{e(audit["source_page"])}" target="_blank" rel="noopener noreferrer">Ficha de la imagen</a> · '
                f'<a href="{e(audit["license_url"])}" target="_blank" rel="noopener noreferrer">{e(audit["license"])}' 
                f'</a>{upstream}. {e(audit["changes"])}</figcaption></figure>'
            )
        elif key in pending:
            caution = pending[key]
            assert safe_url(caution["reference_page"])
            figure = (
                '<div class="media-pending"><strong>Imagen pendiente de revisión.</strong> '
                f'{e(caution["reason"])} '
                f'<a href="{e(caution["reference_page"])}" target="_blank" rel="noopener noreferrer">Consultar referencia fiable</a>.</div>'
            )
        elif image:
            figure = (
                '<div class="media-pending"><strong>Imagen pendiente de revisión.</strong> '
                'El catálogo incluye un enlace propuesto; aún falta comprobar identificación, autoría y permiso de uso. '
                f'<a href="{e(source_page(image))}" target="_blank" rel="noopener noreferrer">Abrir enlace propuesto (puede no existir)</a>.</div>'
            )
        else:
            figure = '<p>La ficha no dispone de una imagen enlazada.</p>'
        description = e(sp.get("descripcion") or "Descripción no disponible")
        detail = sp.get("experto") or {}
        specialist = "".join(
            f"<p><strong>{label}:</strong> {e(detail.get(field))}</p>"
            for field, label in (("descripcion_tecnica", "Características"), ("anatomia_craneal", "Anatomía craneal"), ("anatomia_postcraneal", "Anatomía poscraneal"), ("paleoecologia", "Paleoecología"), ("debate", "Debate"))
            if detail.get(field)
        )
        cards.append(
            f'<details class="species" id="sp-{e(key)}" data-search="{e((sp["nombre"] + " " + region).casefold())}">'
            f'<summary><strong>{e(sp["nombre"])}</strong><span>{chronology_type(age)}</span></summary>'
            f'<div class=species-body>{figure}<p>{description}</p>'
            f'<p><strong>Localidad del catálogo:</strong> {e(region)}. <strong>Dato cronológico revisado:</strong> {e(age.get("display") or "Indeterminado")}.</p>'
            f'<p><strong>Tipo de evidencia:</strong> {chronology_type(age)}; {e(age.get("entity_type") or "entidad no indicada")}. '
            f'<strong>Método:</strong> {e(age.get("method") or "No indicado")}. '
            f'<strong>Relación de la datación:</strong> {e(age.get("dating_relation") or "No indicada")}.</p>'
            f'{specialist}<h4>Referencias del catálogo</h4>{bibliography(sp)}</div></details>'
        )

    ordered = sorted(records, key=lambda sp: chronology_key(chrono[sp["id"]]), reverse=True)
    timeline = "".join(
        f'<li><a href="#sp-{e(sp["id"])}">{e(sp["nombre"])}</a><span>{e(chrono[sp["id"]].get("display") or "Indeterminado")}</span>'
        f'<small>{chronology_type(chrono[sp["id"]])}</small></li>'
        for sp in ordered
    )
    geography = "".join(
        f'<details class=place><summary>{e(place)} <span>{len(group)} fichas</span></summary><ul>'
        + "".join(f'<li><a href="#sp-{e(sp["id"])}">{e(sp["nombre"])}</a></li>' for sp in group)
        + "</ul></details>"
        for place, group in sorted(region_groups.items(), key=lambda item: item[0].casefold())
    )
    digest = hashlib.sha256(raw).hexdigest()
    page = f'''<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PaleoBot · Entrada ligera para Moodle</title><link rel="stylesheet" href="estilos.css"></head><body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="hero"><div class="wrap"><p class="kicker">PALEOBOT · CATÁLOGO A3 · ENTRADA LIGERA</p>
<h1>Explorar el registro de la evolución humana</h1>
<p>Consulta de 50 fichas, evidencias cronológicas, localidades y referencias del catálogo existente.</p>
<nav aria-label="Secciones"><a href="#fichas">Fichas</a><a href="#cronologia">Cronología</a><a href="#localidades">Localidades</a><a href="#metodo">Cómo interpretar</a></nav></div></header>
<main id="contenido" class="wrap">
<section class="notice" aria-label="Estado de la versión"><strong>La entrada ligera v9 funciona en Moodle según la prueba del usuario. Las imágenes añadidas en v10 y el diagnóstico de v11 están pendientes de prueba allí.</strong>
Conserva los datos del catálogo A3. Hay {len(verified)} fichas con recursos visuales documentados (fotografías, figuras, ilustraciones o mapas) y {len(records) - len(verified)} fichas con imagen pendiente de revisión; estas últimas no cargan archivos visuales. Los datos cronológicos describen evidencias publicadas; no representan automáticamente la duración de un taxón.</section>
<section id="fichas"><div class="section-head"><h2>Fichas del catálogo</h2><p>El encabezado indica el tipo de datación; abra la ficha para leer el dato revisado, sus cautelas y la bibliografía. La consulta básica funciona sin JavaScript.</p></div>
<label class="search">Filtrar por nombre o localidad <input id="search" type="search" placeholder="Ej.: Dmanisi o Etiopía" autocomplete="off"></label>
<p id="search-status" aria-live="polite">50 fichas disponibles.</p>
<div id="cards">{''.join(cards)}</div></section>
<section id="diagnostico" class="method" aria-label="Diagnóstico de imágenes"><h2>Comprobar las imágenes en Moodle</h2>
<p>Una imagen puede no cargarse aunque la ficha y los botones funcionen. Pruebe tres recursos y lea el resultado aquí; las otras imágenes se comprueban al abrir su ficha. Esta prueba no modifica el curso.</p>
<button id="probe-images" type="button">Probar tres imágenes</button>
<p id="image-status" role="status">Aún no se han solicitado imágenes en esta sesión.</p>
<p id="image-security">Todavía no se ha detectado un bloqueo de imágenes por la política de seguridad del navegador.</p>
<p>Si alguna falla, su ficha conserva el enlace a la fuente. El resultado indica qué ocurre en este navegador, no acredita por sí solo la causa de un fallo de red.</p></section>
<section id="cronologia"><div class="section-head"><h2>Línea de evidencias cronológicas</h2>
<p>Ordenada por la edad más antigua indicada en cada registro. Una datación de fósil, localidad o contexto no equivale a la existencia continua de una especie.</p></div>
<ol class="timeline">{timeline}</ol></section>
<section id="localidades"><div class="section-head"><h2>Índice de localidades</h2>
<p>Agrupación literal de las localidades del catálogo. Las menciones amplias, como «Asia» o «global», no son puntos cartográficos ni coordenadas.</p></div>{geography}</section>
<section id="metodo" class="method"><h2>Cómo interpretar el material</h2>
<ul><li>Compruebe si el dato fechado corresponde a un espécimen, un contexto o una agrupación de hallazgos.</li>
<li>Distinga las estimaciones puntuales de las edades mínimas, las ventanas publicadas y los resultados indeterminados.</li>
<li>Compare las afirmaciones de cada ficha con sus referencias. Un vacío del registro no demuestra ausencia biológica.</li>
<li>Use la imagen enlazada solo tras confirmar qué representa, su autoría y las condiciones de reutilización.</li></ul>
<p>Catálogo de procedencia: <code>catalog.json</code>, SHA-256 <code>{digest}</code>. Procedencia visual contrastada: <code>image_audit.json</code>.</p></section>
</main><footer><div class="wrap">PaleoBot · Material experimental A3 · Integración docente pendiente de validación.</div></footer>
<script src="interaccion.js" defer></script></body></html>'''
    OUT.write_text(page, encoding="utf-8")
    css = (ROOT / "estilos.css").read_text(encoding="utf-8")
    js = (ROOT / "interaccion.js").read_text(encoding="utf-8")
    assert "</style" not in css.lower() and "</script" not in js.lower()
    standalone = page.replace(
        '<link rel="stylesheet" href="estilos.css">', '<style>\n' + css + '\n</style>', 1
    ).replace(
        '<script src="interaccion.js" defer></script>', '<script>\n' + js + '\n</script>', 1
    )
    assert standalone != page
    OUT_SINGLE.write_text(standalone, encoding="utf-8")
    print(f"{len(records)} fichas · {len(region_groups)} localidades · {len(page.encode())} bytes HTML · catálogo SHA-256 {digest}")


if __name__ == "__main__":
    build()
