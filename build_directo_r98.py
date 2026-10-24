#!/usr/bin/env python3
"""Construye un prototipo de archivo Moodle directo desde el atlas R98 aportado.

No altera el ZIP original. Conserva los módulos en su orden, incorpora solo los
recursos de imagen documentados en la entrada ligera y añade la cronología A3.
Su ejecución no constituye una prueba en el Moodle institucional.
"""

from __future__ import annotations

import base64
import hashlib
import html
import json
import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "Auditoria_R98"
AUDIT = ROOT / "PaleoBot_Moodle_Entrada_Ligera_v11_NO_GO" / "image_audit.json"
OUT = ROOT.parent / "PaleoBot_Atlas_Original_Directo_R98_PILOTO.html"


def image_placeholder(name: str) -> str:
    safe = html.escape(name)
    svg = (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360">'
        '<rect width="600" height="360" fill="#f0f1eb"/>'
        '<rect x="18" y="18" width="564" height="324" rx="14" fill="none" stroke="#677b70"/>'
        f'<text x="300" y="150" text-anchor="middle" fill="#183d2d" font-size="24">{safe}</text>'
        '<text x="300" y="198" text-anchor="middle" fill="#355443" font-size="20">Imagen pendiente de revisión</text>'
        '<text x="300" y="240" text-anchor="middle" fill="#355443" font-size="16">Consulte las fuentes de la ficha</text>'
        '</svg>'
    )
    return "data:image/svg+xml," + quote(svg, safe="")


def audit_images():
    old = json.loads((SOURCE / "science/catalog.json").read_text(encoding="utf-8"))
    audit = json.loads(AUDIT.read_text(encoding="utf-8"))
    verified, pending = audit["verified"], audit["pending"]
    assert len(old["records"]) == 50 and len(verified) == 47 and len(pending) == 3
    replacements = {}
    for sp in old["records"]:
        key = sp["id"]
        new = verified[key]["image_url"] if key in verified else image_placeholder(sp["nombre"])
        replacements[sp["imagen"]] = new
        sp["imagen"] = new
        if key in pending:
            sp["imagen_nota"] = pending[key]["reason"]
    assert len(replacements) == 50
    return replacements, old, audit


def change_images(code: str, replacements: dict[str, str], check_db=False) -> str:
    for original, reviewed in replacements.items():
        count = code.count(original)
        if check_db:
            assert count >= 1, f"Falta en DB: {original}"
        code = code.replace(original, reviewed)
    return code


def inline_code(tag: str, code: str, label: str, ident: str = "") -> tuple[str, str]:
    assert f"</{tag}" not in code.lower(), label
    payload = "\n" + code + "\n"
    checksum = base64.b64encode(hashlib.sha256(payload.encode("utf-8")).digest()).decode("ascii")
    ident = f' id="{html.escape(ident, quote=True)}"' if ident else ""
    return f'<{tag}{ident} data-source="{html.escape(label, quote=True)}">{payload}</{tag}>', f"'sha256-{checksum}'"


def nested_rules(css: str, scope: str) -> str:
    """Prefija los selectores de la hoja pequeña A3, incluido su @media."""
    result, i = [], 0
    while i < len(css):
        j = css.find("{", i)
        if j < 0:
            result.append(css[i:])
            break
        head = css[i:j].strip()
        depth, k = 1, j + 1
        while depth and k < len(css):
            if css[k] == "{": depth += 1
            if css[k] == "}": depth -= 1
            k += 1
        assert depth == 0
        body = css[j + 1:k - 1]
        if head.startswith("@media"):
            result.append(head + "{" + nested_rules(body, scope) + "}")
        elif head.startswith("@"):
            result.append(head + "{" + body + "}")
        else:
            heads = []
            for selector in head.split(","):
                selector = selector.strip()
                if selector in (":root", "html", "body", "main"):
                    heads.append(scope)
                else:
                    heads.append(scope + " " + selector)
            result.append(",".join(heads) + "{" + body + "}")
        i = k
    return "".join(result)


def build() -> None:
    replacements, catalog, audit = audit_images()
    page = (SOURCE / "index.html").read_text(encoding="utf-8")
    # A diferencia de un recurso multiarchivo, la página directa necesita una
    # CSP con hashes de sus bloques. La cabecera HTTP de Moodle sigue mandando.
    page, meta_count = re.subn(r'<meta http-equiv="Content-Security-Policy"[^>]*>',
                               '<!-- PALEOBOT_DIRECT_CSP -->', page, count=1)
    assert meta_count == 1
    page = page.replace('href="science/chronology.html"', 'href="#a3-critical"')
    page = page.replace('<strong>50</strong> taxones con imagen y ficha',
                        '<strong>50</strong> fichas; imágenes en revisión')
    page = page.replace('<strong id="headerStatMedia">50/50</strong>',
                        '<strong id="headerStatMedia">47/50</strong>')
    page = page.replace('PaleoBot no ha podido cargar sus ficheros.',
                        'PaleoBot no ha podido iniciar sus módulos.')
    page = page.replace('Si ves este aviso en Moodle, comprueba: 1) que el ZIP está descomprimido en el recurso y el archivo principal es <code>index.html</code>, en la raíz; 2) que la opción de administración «Usar argumento',
                        'Comprueba que Moodle permite ejecutar este archivo HTML. Si persiste el fallo, utilice la entrada ligera verificada. «Usar argumento')
    page = page.replace('Atlas Paleoantropológico Interactivo Consolidado (DEA · ULPGC)',
                        'Atlas Paleoantropológico Interactivo · prueba de archivo directo')

    style_hashes, script_hashes = [], []
    deferred: list[tuple[str, str]] = []
    included_scripts: list[str] = []
    included_styles: list[str] = []
    export_css = {}
    for rel in ('assets/css/00-core/003-style.css', 'assets/css/00-core/004-style.css',
                'assets/css/00-core/006-style.css', 'assets/css/00-core/026-style.css'):
        css = (SOURCE / rel).read_text(encoding='utf-8')
        export_css[rel] = css
        _, digest = inline_code('style', css, 'estilo-impresion-' + rel)
        style_hashes.append(digest)  # Los diálogos de impresión heredan la CSP.
    css_json = json.dumps(export_css, ensure_ascii=False).replace('<', '\\u003c')
    export_block, export_hash = inline_code('script', 'window.PB_EXPORT_CSS=' + css_json + ';', 'estilos-de-impresion')
    script_hashes.append(export_hash)
    page = page.replace('<script src="assets/img/manifest.js"></script>',
                        export_block + '\n<script src="assets/img/manifest.js"></script>', 1)

    def replace_link(match: re.Match) -> str:
        tag = match.group(0)
        src = re.search(r'\bhref="(assets/[^"]+)"', tag)
        if not src or not re.search(r'\brel="stylesheet"', tag):
            return tag
        path = SOURCE / src.group(1)
        if not path.is_file():
            raise FileNotFoundError(path)
        code = path.read_text(encoding="utf-8")
        if src.group(1).endswith('/leaflet.css'):
            image_dir = SOURCE / 'assets/vendor/leaflet/1.9.4/images'
            for name in ('layers.png', 'layers-2x.png', 'marker-icon.png',
                         'marker-icon-2x.png', 'marker-shadow.png'):
                asset = base64.b64encode((image_dir / name).read_bytes()).decode('ascii')
                code = code.replace('images/' + name, 'data:image/png;base64,' + asset)
        ident = (re.search(r'\bid="([^"]+)"', tag) or [None, ""])[1]
        block, digest = inline_code('style', code, src.group(1), ident)
        included_styles.append(src.group(1)); style_hashes.append(digest)
        return block

    page = re.sub(r'<link\b[^>]*>', replace_link, page, flags=re.I)

    def replace_script(match: re.Match) -> str:
        tag = match.group(0)
        src = re.search(r'\bsrc="(assets/[^"]+)"', tag)
        if not src:
            return tag
        path = SOURCE / src.group(1)
        if not path.is_file():
            raise FileNotFoundError(path)
        code = path.read_text(encoding="utf-8")
        for rel in export_css:
            link = '<link rel="stylesheet" href="' + rel + '">'
            if link in code:
                code = code.replace(link, '<style>\n${window.PB_EXPORT_CSS[' + json.dumps(rel) + ']}\n</style>')
        if src.group(1).endswith('002-script.js'):
            code = change_images(code, replacements, check_db=True)
            reviewed = {}
            for key, item in audit['verified'].items():
                reviewed[key] = {
                    'url': item['image_url'], 'tipo': 'Recurso visual documentado',
                    'titulo': item['object'],
                    'nota': item['alt'] + '. ' + item['changes'],
                    'fuente': item['credit'], 'licencia': item['license'],
                    'sourceUrl': item['source_page'],
                }
            for key, item in audit['pending'].items():
                sp = next(x for x in catalog['records'] if x['id'] == key)
                reviewed[key] = {
                    'url': sp['imagen'], 'thumbUrl': sp['imagen'],
                    'tipo': 'Aviso informativo', 'titulo': 'Imagen no incorporada: ' + sp['nombre'],
                    'nota': item['reason'], 'fuente': 'PaleoBot',
                    'licencia': 'Sin imagen reutilizada', 'sourceUrl': item['reference_page'],
                }
            marker = 'function getSpeciesMedia(sp) {'
            assert code.count(marker) == 1
            update = ('const PB_DIRECT_REVIEWED_MEDIA=' +
                      json.dumps(reviewed, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c') +
                      ';\nfor (const sp of DB) { const media = PB_DIRECT_REVIEWED_MEDIA[sp.id]; '
                      'if (media) MEDIA_OVERRIDES[sp.id] = media; }\n')
            code = code.replace(marker, update + marker, 1)
        if src.group(1).endswith('078-paleobot-a3-catalog.js'):
            code = change_images(code, replacements)
        ident = (re.search(r'\bid="([^"]+)"', tag) or [None, ""])[1]
        if src.group(1).endswith('071-paleobot-v69-lazy-loader.js'):
            # Sus dos módulos se incluyen directamente al final: la carga
            # dinámica por URL dejaría de funcionar en un solo archivo.
            return '<!-- Módulos diferidos incorporados al final del archivo directo -->'
        block, digest = inline_code('script', code, src.group(1), ident)
        included_scripts.append(src.group(1)); script_hashes.append(digest)
        if re.search(r'\bdefer(?:\s|=|>)', tag):
            deferred.append((src.group(1), block))
            return f'<!-- Módulo diferido {html.escape(src.group(1))} -->'
        return block

    page = re.sub(r'<script\b[^>]*\bsrc="assets/[^"]+"[^>]*>\s*</script>',
                  replace_script, page, flags=re.I)
    assert len(included_scripts) == 72 and len(included_styles) == 55, (len(included_scripts), len(included_styles))
    assert len(set(included_scripts)) == len(included_scripts)

    # En el paquete original la consulta A3 es otra página. Se inserta después
    # del atlas y se mantiene su aviso de uso experimental y su tipado de fechas.
    science_page = (SOURCE / 'science/chronology.html').read_text(encoding='utf-8')
    match = re.search(r'<main id="main">(.*?)</main>', science_page, re.S)
    assert match
    appendix = '<section id="a3-critical" class="a3-critical" aria-label="Cronología crítica">' + match.group(1) + '</section>'
    science_css = (SOURCE / 'assets/css/60-science/053-paleobot-a3-scientific-workspace.css').read_text(encoding='utf-8')
    css_block, css_hash = inline_code('style', nested_rules(science_css, '#a3-critical'), 'cronologia-A3-aislada')
    style_hashes.append(css_hash)
    page = page.replace('</head>', css_block + '\n</head>', 1)

    payload = json.dumps(catalog, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
    payload_block, payload_hash = inline_code('script', 'window.PB_A3_CATALOG_INLINE=' + payload + ';', 'catalogo-A3')
    script_hashes.append(payload_hash)
    code = (SOURCE / 'assets/js/60-science/077-paleobot-a3-scientific-workspace.js').read_text(encoding='utf-8')
    old_fetch = "const response=await fetch('catalog.json',{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw new Error('HTTP '+response.status);\n      const payload=await response.json();"
    assert code.count(old_fetch) == 1
    code = code.replace(old_fetch, "const payload=window.PB_A3_CATALOG_INLINE;if(!payload)throw new Error('Catálogo local ausente');")
    critical_block, critical_hash = inline_code('script', code, 'cronologia-A3-interactiva')
    script_hashes.append(critical_hash)

    lazy = []
    for name in ('036-paleobot-v65-hero-readability-routing-fix-runtim.js',
                 '070-paleobot-v85-speed-guard.js'):
        found = list((SOURCE / 'assets/js').rglob(name)); assert len(found) == 1
        relative = found[0].relative_to(SOURCE).as_posix()
        block, digest = inline_code('script', found[0].read_text(encoding='utf-8'), relative)
        lazy.append(block); script_hashes.append(digest); included_scripts.append(relative)

    note = ('<!-- Las fechas heredadas en otras vistas del Atlas son orientativas; '
            'utilice la cronología crítica A3 para leer la evidencia fechada. -->')
    tail = appendix + note + '\n' + '\n'.join(x[1] for x in deferred) + '\n' + payload_block + '\n' + critical_block + '\n' + '\n'.join(lazy)
    assert page.rstrip().endswith('</body>\n</html>')
    before, end = page.rsplit('</body>', 1)
    page = before + tail + '\n</body>' + end

    # Mantener las restricciones de R98 sin auto-bloquear la nueva modalidad
    # de archivo único. No se usa unsafe-inline: hashes de todos los bloques.
    orig = re.search(r'<meta http-equiv="Content-Security-Policy" content="([^"]+)">',
                     (SOURCE / 'index.html').read_text(encoding='utf-8'))
    assert orig
    policy = orig.group(1)
    policy = policy.replace("script-src 'self'", "script-src 'self' " + ' '.join(script_hashes))
    policy = policy.replace("style-src 'self'", "style-src 'self' " + ' '.join(style_hashes))
    policy = policy.replace("style-src-elem 'self'", "style-src-elem 'self' " + ' '.join(style_hashes))
    assert 'unsafe-inline' not in policy
    page = page.replace('<!-- PALEOBOT_DIRECT_CSP -->',
                        '<meta http-equiv="Content-Security-Policy" content="' + policy + '">', 1)
    assert 'href="science/chronology.html"' not in page
    leftovers = re.findall(r'<(?:script|link)[^>]+(?:src|href)="assets/[^">]+', page)
    assert not leftovers, leftovers[:6]
    assert page.count('id="a3-critical"') == 1 and len(script_hashes) == 77
    OUT.write_text(page, encoding='utf-8')
    print(f'Archivo: {OUT} ({OUT.stat().st_size:,} bytes)')
    print(f'Módulos: {len(included_scripts)} JS, {len(included_styles)+1} CSS, 50 fichas; imágenes documentadas: {len(audit["verified"])}')


if __name__ == '__main__':
    build()
