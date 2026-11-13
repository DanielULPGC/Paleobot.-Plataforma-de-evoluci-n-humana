#!/usr/bin/env python3
"""Build a low-load, static entry from the preserved PaleoBot A3 catalog."""

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


def incierta(entry: dict) -> str:
    """Clase de la etiqueta de incertidumbre del sistema para las cronologías sin determinar o sin tipo revisado."""
    known = {"point_estimate", "minimum_age", "maximum_age", "closed_interval", "alternative_intervals"}
    return ' class="pb-etiqueta"' if entry.get("kind") not in known else ""


def chronology_type(entry: dict) -> str:
    return {
        "point_estimate": "Estimación puntual",
        "minimum_age": "Edad mínima",
        "maximum_age": "Edad máxima",
        "closed_interval": "Ventana publicada",
        "alternative_intervals": "Ventanas alternativas",
        "unknown": "Cronología no determinada",
    }.get(entry.get("kind"), "Tipo pendiente de revisión")


# Copias locales verificadas de las imágenes (PB-GH-08): img/taxones/ y su MANIFIESTO.json. Las claves son las de
# image_audit.json (mismas 47 claves; misma ficha de origen en Commons). Se escriben aquí porque scripts/construir.py
# construye en una carpeta temporal sin acceso a img/; si el manifiesto está a mano (construcción desde src/), se
# comprueba que coincide. Clave -> (archivo, ancho, alto, SHA-256 del archivo).
COPIAS_LOCALES = {
    "aethiopicus": ("aethiopicus.jpg", 500, 401, "d0270a2cbf1741ae39d388b03796c6e5026cde5acc1fc739c0745b3e5ceaa473"),
    "afarensis": ("afarensis.jpg", 500, 565, "5fc98e2ce0598329eb7a1946b44459cd4d9dab9b130174b7233d4c66b54b51d8"),
    "africanus": ("africanus.jpg", 500, 902, "e8c4e5e3eecef1354bd86bf1eb5de7f1df348401d33fc431171c325cbc612140"),
    "anamensis": ("anamensis.jpg", 500, 375, "4bf96b9da0868b01f42a5d588ae4b56e0de5c40159b9da1c0a99210676f6d7e8"),
    "antecessor": ("antecessor.jpg", 500, 397, "1f1356acc8326207ae7f956dfee7ed092173c9c51af1f2a15863954c4c82e67d"),
    "bahrelghazali": ("bahrelghazali.png", 341, 341, "448b01a7443035f68625c5d4d433a9941381f5617ac3ffad92c22bf3f53dd59f"),
    "bodoensis": ("bodoensis.jpg", 500, 538, "dd0969679f6071eaef8405760a4e9de2019bfeb01f1086c1465d6014fddda7da"),
    "boisei": ("boisei.jpg", 500, 768, "319fe20deba3a64a97454b0563d56991fc332e8ee38eb9457c30ec29040ab022"),
    "cepranensis": ("cepranensis.png", 500, 404, "343a6b0b1755b47bfb195dd8624984b0a61cfdbcb9f7f799611403fb42910c06"),
    "daliensis": ("daliensis.jpg", 500, 480, "17560c526f121ef4cf1c9d04764ed3f5ff3e07f0f2bbcc63954cb444fec2d495"),
    "denisova": ("denisova.jpg", 500, 333, "f04f7d45300fa58ac27c8dbf410bd24079bef514175254751c207c908935f851"),
    "deyiremeda": ("deyiremeda.png", 500, 500, "8d468866668e7f92ac596af83abf2c534a589ec5ed3ef3b3cb752c5b8939f5c9"),
    "dryopithecus": ("dryopithecus.jpg", 500, 469, "c56193ed1f6b6c70f5c52702d424a76280fb8dc3857b7216fa3b54b29d07fe31"),
    "erectus": ("erectus.jpg", 500, 544, "8070441a7c8f810b17b667e9344236ae547288895e0706bfef11dc158e03e549"),
    "ergaster": ("ergaster.jpg", 500, 375, "1b4146403a489862caaf8fc22c5a23b525fb67b292818ca7b92d003b298ed079"),
    "flores": ("flores.jpg", 500, 667, "52104027434a751b37625f6fec1319e7003307040c466c3f642d0ed72fe10722"),
    "garhi": ("garhi.jpg", 500, 573, "4c9bfb6d283a76374613ebc7d04b8da66ec932afed406c88858cd5992475d3a1"),
    "georgicus": ("georgicus.jpg", 500, 500, "74c9d9df0a0269aed30de80fb9318b7e0d6679fa2ffb333c2b015965d2b3de66"),
    "graecopithecus": ("graecopithecus.jpg", 500, 618, "80b725a47f3d2838be2bca8154b925daa496af0a5c03a976ff5e4687fda03eb6"),
    "habilis": ("habilis.jpg", 500, 500, "fb1f2b9703204659043b395fd0a124b0860928c9074fd32dd93c657fb46db2a1"),
    "heidelbergensis": ("heidelbergensis.jpg", 500, 483, "e314990ed2c24667b09c6d971d65a149ed466762b7158184fb0276e443e5623e"),
    "helmei": ("helmei.jpg", 500, 471, "e2452de896c918c6b77099974b044ac32d54790a4c08e2726a6c1a3e664070eb"),
    "idaltu": ("idaltu.jpg", 500, 375, "5c971075cea5275b6e55134d64f81f5aa10697150c3fd46ed3c624a74e786efd"),
    "jebel_irhoud": ("jebel_irhoud.jpg", 500, 532, "3946a4810a53018daa97dde817dc52b3d00c343751787645f3075a64234567a6"),
    "juluensis": ("juluensis.jpg", 500, 326, "04713bb8f995c26427961891b78214236cd5e83d6cc15ec7e8e0d1ffb50546f8"),
    "kadabba": ("kadabba.jpg", 392, 286, "2fdaadd72adaf6d569e083eabace25b583d9224c2b287d6b60c78cb634b37306"),
    "kenyanthropus": ("kenyanthropus.jpg", 500, 333, "6c85bbd2eed50ac2157e987cefd01ae79656878d2143eb61893ca19b60fd4c96"),
    "longi": ("longi.jpg", 500, 543, "00e529ee8bf53a793e0a04814d248d1d951367c54eedd4b64355c5fa4dd2a1e9"),
    "luzon": ("luzon.jpg", 500, 386, "c862f0f1d03053809e461c9d43b89654b3d670f9f68210695f8175ad7fa561cf"),
    "morotopithecus": ("morotopithecus.jpg", 500, 536, "83fa6f13bbcc58424ad9cc7f653dc92110ab3039e2938945684d6704d100a1ae"),
    "nakalipithecus": ("nakalipithecus.jpg", 500, 486, "b610fcfe79004a0b5b39842204f16f894d1df363d2857ac98f2293f6170dd571"),
    "naledi": ("naledi.jpg", 500, 751, "1deafcdf77ac89647d7bda4602a2b1581826c672606c621c322d097bfcfc8a76"),
    "neander": ("neander.jpg", 500, 630, "91322001ae422adbd21a861b807f3813d24f29bc6ec9bb4e5d48402963d24c4d"),
    "omo_i": ("omo_i.jpg", 500, 547, "4493b604e9da97b8c130b215fb11807b1dc1a24df0114ab51282de2a81d3c816"),
    "orrorin": ("orrorin.jpg", 370, 370, "114a1a3e048bc3e7d4a1950bf86b4d007c6a2fb9136dd61e9a73498a2a9729e7"),
    "penghu": ("penghu.jpg", 500, 353, "990956c2ca5632e3182c3a712bd2eb774eac02b20b733354daa37fe3dc8946a1"),
    "pierolapithecus": ("pierolapithecus.jpg", 500, 695, "0052345ec6723dd2a7ecf9eb27c07f18ecba20bf66f4190fad223547f02f3764"),
    "proconsul": ("proconsul.jpg", 500, 503, "8cd71504fdf54eb63eca9957371559bb32a369c85c48b5ec311e67a0b82aafe9"),
    "prometheus": ("prometheus.jpg", 500, 667, "ab38a4c2baa5a839f9f11ed74c473213414390fd67550bb6d69c1e61cd49819b"),
    "ramidus": ("ramidus.jpg", 500, 556, "1a78ddf2846f7a948152c13ccee8d8903535fa2f3c38acd9dc0a949be8ba208c"),
    "rhodesiensis": ("rhodesiensis.jpg", 500, 533, "d48bf98c0ad70a8155a65664305bb471944e3d9f34053831776c42deaaaaac89"),
    "robustus": ("robustus.jpg", 500, 336, "314df81fb3713d5eb498c7b74afc4f6eee9cdd5f8baae25c13e1217c97f6c837"),
    "rudolfensis": ("rudolfensis.jpg", 500, 694, "89fa9630b229486aaba2908e069f9e0017c33891ad26f874d2b88d26ff5618b3"),
    "sahel": ("sahel.jpg", 500, 421, "ab8250614b4c3d9b21220b3babb63a319af54d0cb7a0221ed7ac7b4cdbed39e4"),
    "sapiens": ("sapiens.jpg", 500, 370, "f6fa01c69a625a945a6e005948ae9c93281c691760b470ad53b22bb17c9b779f"),
    "sediba": ("sediba.jpg", 500, 589, "91dc58528656fa0dc7a3a7920da8c5d89db3049987ffa6f18c4edd9c6e43d7b3"),
    "soloensis": ("soloensis.jpg", 500, 371, "cb46e66c4ebea3084040fae03a5bcd5d92283c22a13ce0738028aeeb364b840a"),
}
COPIA_LOCAL_RUTA = "../img/taxones/"
COPIA_LOCAL_NOTA = "Miniatura de hasta 500 px de ancho servida por Wikimedia Commons; sin otros cambios."


def comprobar_copias_locales(verified: dict) -> None:
    """Si el manifiesto del sitio está accesible, la tabla anterior debe coincidir con él (archivo, medidas, huella, origen)."""
    manifiesto = ROOT.parents[1] / "img" / "taxones" / "MANIFIESTO.json"
    if not manifiesto.is_file():
        return
    imagenes = json.loads(manifiesto.read_text(encoding="utf-8"))["images"]
    assert set(imagenes) == set(COPIAS_LOCALES), "MANIFIESTO.json y COPIAS_LOCALES no tienen las mismas claves"
    for clave, (archivo, ancho, alto, huella) in COPIAS_LOCALES.items():
        dato = imagenes[clave]
        assert (dato["file"], dato["width"], dato["height"], dato["sha256"]) == (archivo, ancho, alto, huella), clave
        assert dato["source_page"] == verified[clave]["source_page"], clave
        assert dato["changes"] == COPIA_LOCAL_NOTA, clave


# Referencias del catálogo cuyo DOI falla en la comprobación automática (docs/fiabilidad/DOI_CORRESPONDENCIAS.json).
# Se conservan tal cual, con su enlace, y se marcan a la vista; no se retiran (PB-GH-07 y PB-GH-09).
# DOI citado -> DOI del registro de Crossref que cuadra en primer apellido, año y título.
DOI_COMPROBADOS = {
    "10.1038/s41586-019-1396-2": "10.1038/s41586-019-1376-z",
    "10.1073/pnas.0901987106": "10.1073/pnas.0901280106",
    "10.1073/pnas.1316780111": "10.1073/pnas.1316780110",
    "10.1126/science.1158207": "10.1126/science.1154197",
}
# DOI que existe pero pertenece a otro artículo, sin que se haya localizado la referencia citada.
REFERENCIAS_SIN_LOCALIZAR = {"10.1002/ajpa.24122"}
AVISO_SIN_LOCALIZAR = (
    " <em>(Aviso: el DOI citado pertenece a otro artículo y la referencia no se ha localizado en Crossref; "
    "pendiente de verificación.)</em>"
)


def aviso_doi(doi: str) -> str:
    """Nota visible para un DOI que falla; cadena vacía si el DOI no está señalado."""
    if doi in DOI_COMPROBADOS:
        bueno = DOI_COMPROBADOS[doi]
        return (
            " <em>(Aviso: el DOI citado no existe. Registro comprobado en Crossref para esta referencia: "
            f'<a href="https://doi.org/{e(bueno)}" target="_blank" rel="noopener noreferrer">DOI: {e(bueno)}</a>.)</em>'
        )
    return AVISO_SIN_LOCALIZAR if doi in REFERENCIAS_SIN_LOCALIZAR else ""


def prosa(value: object) -> str:
    """Texto escapado; si menciona un DOI señalado, añade la nota justo detrás sin tocar el texto."""
    text = e(value)
    for doi in DOI_COMPROBADOS:
        if doi in text:
            text = text.replace(doi, doi + aviso_doi(doi))
    return text


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
        aviso = aviso_doi(doi)
        lines.append(f"<li>{e(desc)}{link}{aviso}</li>")
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
    assert set(COPIAS_LOCALES) <= set(verified)
    comprobar_copias_locales(verified)
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
            if key in COPIAS_LOCALES:
                archivo, ancho, alto, _ = COPIAS_LOCALES[key]
                imagen = (
                    f'<img src="{e(COPIA_LOCAL_RUTA + archivo)}" width="{ancho}" height="{alto}" alt="{e(audit["alt"])}" '
                    'loading=lazy decoding=async>'
                )
                copia = f' Copia guardada en este sitio: {e(COPIA_LOCAL_NOTA[0].lower() + COPIA_LOCAL_NOTA[1:])}'
            else:  # sin copia local verificada: comportamiento anterior (imagen remota que se pide al abrir la ficha)
                imagen = f'<img data-src="{e(audit["image_url"])}" alt="{e(audit["alt"])}" loading=lazy hidden>'
                copia = ""
            figure = (
                f'<figure class=media>{imagen}'
                f'<figcaption><strong>{e(audit["object"])}</strong> · {e(audit["credit"])}. '
                f'<a href="{e(audit["source_page"])}" target="_blank" rel="noopener noreferrer">Ficha de la imagen</a> · '
                f'<a href="{e(audit["license_url"])}" target="_blank" rel="noopener noreferrer">{e(audit["license"])}' 
                f'</a>{upstream}. {e(audit["changes"])}.{copia}</figcaption></figure>'
            )
        elif key in pending:
            caution = pending[key]
            assert safe_url(caution["reference_page"])
            figure = (
                '<div class="media-pending"><strong class="pb-etiqueta">Imagen pendiente de revisión</strong>. '
                f'{e(caution["reason"])} '
                f'<a href="{e(caution["reference_page"])}" target="_blank" rel="noopener noreferrer">Consultar referencia fiable</a>.</div>'
            )
        elif image:
            figure = (
                '<div class="media-pending"><strong class="pb-etiqueta">Imagen pendiente de revisión</strong>. '
                'El catálogo incluye un enlace propuesto; aún falta comprobar identificación, autoría y permiso de uso. '
                f'<a href="{e(source_page(image))}" target="_blank" rel="noopener noreferrer">Abrir enlace propuesto (puede no existir)</a>.</div>'
            )
        else:
            figure = '<p>La ficha no dispone de una imagen enlazada.</p>'
        description = prosa(sp.get("descripcion") or "Descripción no disponible")
        detail = sp.get("experto") or {}
        specialist = "".join(
            f"<p><strong>{label}:</strong> {prosa(detail.get(field))}</p>"
            for field, label in (("descripcion_tecnica", "Características"), ("anatomia_craneal", "Anatomía craneal"), ("anatomia_postcraneal", "Anatomía poscraneal"), ("paleoecologia", "Paleoecología"), ("debate", "Debate"))
            if detail.get(field)
        )
        cards.append(
            f'<details class="species" id="sp-{e(key)}" data-search="{e((sp["nombre"] + " " + region).casefold())}">'
            f'<summary><strong>{e(sp["nombre"])}</strong><span{incierta(age)}>{chronology_type(age)}</span></summary>'
            f'<div class=species-body>{figure}<p>{description}</p>'
            f'<p><strong>Localidad del catálogo:</strong> {e(region)}. <strong>Dato cronológico revisado:</strong> {e(age.get("display") or "Indeterminado")}.</p>'
            f'<p><strong>Tipo de evidencia:</strong> {chronology_type(age)}; {e(age.get("entity_type") or "entidad no indicada")}. '
            f'<strong>Método:</strong> {e(age.get("method") or "No indicado")}. '
            f'<strong>Relación de la datación:</strong> {e(age.get("dating_relation") or "No indicada")}.</p>'
            f'{specialist}<h3>Referencias del catálogo</h3>{bibliography(sp)}</div></details>'
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
<title>PaleoBot · Consulta ligera</title><link rel="stylesheet" href="estilos.css"></head><body>
<a class="skip" href="#contenido">Saltar al contenido</a>
<header class="hero"><div class="wrap"><p class="kicker">PaleoBot · Consulta ligera</p>
<h1>Explorar el registro de la evolución humana</h1>
<p>Consulta de 50 fichas, evidencias cronológicas, localidades y referencias del catálogo existente.</p>
<nav aria-label="Secciones"><a href="#fichas">Fichas</a><a href="#cronologia">Cronología</a><a href="#localidades">Localidades</a><a href="#metodo">Cómo interpretar</a></nav></div></header>
<main id="contenido" class="wrap">
<section class="notice" aria-label="Estado de la versión">Conserva los datos del catálogo original de PaleoBot. Hay {len(verified)} fichas con recursos visuales documentados (fotografías, figuras, ilustraciones o mapas) y {len(records) - len(verified)} fichas con imagen pendiente de revisión; estas últimas no cargan archivos visuales. Los datos cronológicos describen evidencias publicadas; no representan automáticamente la duración de un taxón.</section>
<section id="fichas"><div class="section-head"><h2>Fichas del catálogo</h2><p>El encabezado indica el tipo de datación; abra la ficha para leer el dato revisado, sus cautelas y la bibliografía.</p></div>
<label class="search">Filtrar por nombre o localidad <input id="search" type="search" placeholder="Ej.: Dmanisi o Etiopía" autocomplete="off"></label>
<p id="search-status" aria-live="polite">50 fichas disponibles.</p>
<div id="cards">{''.join(cards)}</div></section>
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
<details class="diagnostico"><summary>Diagnóstico técnico de imágenes</summary>
<section id="diagnostico" class="method" aria-label="Diagnóstico de imágenes"><h2>Comprobar las imágenes</h2>
<p>Las imágenes de las fichas son copias guardadas en este sitio (carpeta <code>img/taxones</code>); si este archivo se abre suelto, fuera del sitio, no se verán.</p>
<p>Una imagen puede no cargarse aunque la ficha y los botones funcionen. Pruebe tres recursos y lea el resultado aquí; las otras imágenes se comprueban al abrir su ficha.</p>
<button id="probe-images" type="button">Probar tres imágenes</button>
<p id="image-status" role="status">Aún no se han solicitado imágenes en esta sesión.</p>
<p id="image-security">Todavía no se ha detectado un bloqueo de imágenes por la política de seguridad del navegador.</p>
<p>Si alguna falla, su ficha conserva el enlace a la fuente. El resultado indica qué ocurre en este navegador, no acredita por sí solo la causa de un fallo de red.</p></section></details>
</main><footer><div class="wrap">PaleoBot · Material experimental A3 · Integración docente pendiente de validación. La consulta básica funciona sin JavaScript.</div></footer>
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
