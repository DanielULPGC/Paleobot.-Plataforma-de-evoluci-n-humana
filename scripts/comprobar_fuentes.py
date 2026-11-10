#!/usr/bin/env python3
"""Comprueba en línea las fuentes del sitio y escribe un informe.

1. DOI: reúne los DOI citados en el recorrido (atlas/recorrido), en el catálogo de la consulta
   ligera y en el atlas, y los busca en Crossref; los que no están allí se prueban en doi.org
   (otras agencias de registro). En el recorrido compara además el año y el primer apellido de
   la cita con los metadatos.
2. UNESCO: abre las cinco fichas del Patrimonio Mundial que cita la sesión 5 de la entrada DEA
   y extrae el nombre y los años de inscripción.

No modifica el sitio: solo escribe docs/fiabilidad/INFORME_FUENTES.json y .md.
Necesita red (se ejecuta en GitHub Actions; el entorno de trabajo no alcanza estos servicios).
"""
from __future__ import annotations

import html
import json
import re
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs/fiabilidad"
UA = "PaleoBotDEA/1.0 (https://github.com/DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana; comprobacion de fuentes)"
DOI_RE = re.compile(r"10\.\d{4,9}/(?:\(SICI\)[^\s\"'`\\]+|[^\s\"'`<>\\,;\]}]+)")
UNESCO = {  # ficha → años que afirma la sesión 5 de la entrada DEA
    "10": {"sitio": "Bajo valle del Awash (Etiopía)", "esperado": ["1980"]},
    "17": {"sitio": "Bajo valle del Omo (Etiopía)", "esperado": ["1980"]},
    "801": {"sitio": "Parques nacionales del lago Turkana (Kenia)", "esperado": ["1997"]},
    "39": {"sitio": "Área de conservación del Ngorongoro (Tanzania)", "esperado": ["1979", "2010"]},
    "915": {"sitio": "Sitios de homínidos fósiles de Sudáfrica", "esperado": ["1999", "2005"]},
}


def plain(text: str) -> str:
    return "".join(c for c in unicodedata.normalize("NFD", text.lower()) if unicodedata.category(c) != "Mn")


def get(url: str, accept: str = "application/json", tries: int = 3) -> tuple[int, bytes]:
    last = 0
    for attempt in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": accept})
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.status, resp.read(2_000_000)
        except urllib.error.HTTPError as exc:
            last = exc.code
            if exc.code in (404, 410):
                return exc.code, b""
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            last = 0
        time.sleep(3 * (attempt + 1))
    return last, b""


def collect() -> dict[str, dict]:
    found: dict[str, dict] = {}

    def add(doi: str, origin: str, cita: str | None = None) -> None:
        doi = doi.strip().rstrip(".")
        while doi.endswith(")") and doi.count(")") > doi.count("("):  # paréntesis de cierre que es del texto, no del DOI
            doi = doi[:-1].rstrip(".")
        if doi.endswith("/") or len(doi) < 9:
            return
        rec = found.setdefault(doi.lower(), {"doi": doi, "origenes": [], "cita": None})
        if origin not in rec["origenes"]:
            rec["origenes"].append(origin)
        if cita and not rec["cita"]:
            rec["cita"] = cita

    datos = (ROOT / "atlas/recorrido/datos.js").read_text(encoding="utf-8")
    for m in re.finditer(r"cita:\s*'((?:[^'\\]|\\.)*)'\s*,\s*doi:\s*'([^']+)'", datos):
        add(m.group(2), "recorrido y entrada DEA", m.group(1).replace("\\'", "'"))
    for doi in DOI_RE.findall(datos):
        add(doi, "recorrido y entrada DEA")
    for path in sorted((ROOT / "atlas/recorrido").glob("*.html")) + sorted((ROOT / "atlas/recorrido").glob("*.md")):
        for doi in DOI_RE.findall(html.unescape(path.read_text(encoding="utf-8", errors="ignore"))):
            add(doi, "recorrido y entrada DEA")
    catalogo = json.loads((ROOT / "src/entrada_ligera/catalog.json").read_text(encoding="utf-8"))
    especies = catalogo if isinstance(catalogo, list) else next(v for v in catalogo.values() if isinstance(v, list))
    for especie in especies:
        for ref in (especie.get("experto") or {}).get("referencias") or []:
            if isinstance(ref, dict) and str(ref.get("d") or "").startswith("10."):
                cita = f"{ref.get('a') or ''} ({ref.get('y') or ''}). {ref.get('t') or ''}. {ref.get('j') or ''}"
                add(str(ref["d"]), "consulta ligera", cita)
                found[str(ref["d"]).strip().rstrip(".").lower()].setdefault("titulo_citado", str(ref.get("t") or ""))
    for doi in DOI_RE.findall((ROOT / "src/entrada_ligera/catalog.json").read_text(encoding="utf-8")):
        add(doi, "consulta ligera")
    for path in sorted((ROOT / "atlas/assets/js").rglob("*.js")):
        for doi in DOI_RE.findall(path.read_text(encoding="utf-8", errors="ignore")):
            add(doi, "atlas")
    return found


def check_doi(rec: dict) -> dict:
    doi = rec["doi"]
    status, body = get("https://api.crossref.org/works/" + urllib.parse.quote(doi, safe="/"))
    out = {"doi": doi, "origenes": rec["origenes"], "estado": None, "comparada_con_cita": bool(rec.get("cita"))}
    if status == 200:
        msg = json.loads(body)["message"]
        year = None
        for key in ("issued", "published-print", "published-online", "published"):
            parts = (msg.get(key) or {}).get("date-parts") or [[None]]
            if parts[0] and parts[0][0]:
                year = parts[0][0]
                break
        authors = [a.get("family") or a.get("name") or "" for a in msg.get("author", [])]
        out.update(estado="en Crossref", titulo=(msg.get("title") or [""])[0][:200], revista=(msg.get("container-title") or [""])[0],
                   anio=year, primer_autor=authors[0] if authors else None)
        if rec.get("cita"):
            cita = rec["cita"]
            avisos = []
            years = re.findall(r"\((\d{4})[a-z]?\)", cita)
            if year and years and str(year) not in years and str(year - 1) not in years and str(year + 1) not in years:
                avisos.append(f"año de la cita {years[0]} frente a {year} en Crossref")
            if authors and authors[0] and plain(authors[0]).split()[-1] not in plain(cita):
                avisos.append(f"primer apellido en Crossref «{authors[0]}» no aparece en la cita")
            citado = rec.get("titulo_citado") or ""
            if citado:
                palabras = lambda t: {w for w in re.findall(r"[a-z0-9]{4,}", plain(t))}
                a, b = palabras(citado), palabras(out["titulo"])
                if a and b and len(a & b) / len(a) < 0.34:
                    avisos.append("el título citado no coincide con el del DOI en Crossref")
            out["cita"] = cita[:220]
            out["avisos"] = avisos
    elif status == 404:
        s2, b2 = get("https://doi.org/api/handles/" + urllib.parse.quote(doi, safe="/"))
        code = None
        if s2 == 200:
            try:
                code = json.loads(b2).get("responseCode")
            except ValueError:
                code = None
        out["estado"] = "fuera de Crossref, resuelve en doi.org" if code == 1 else "no localizado"
    else:
        out["estado"] = f"sin comprobar (respuesta {status})"
    return out


def check_unesco() -> list[dict]:
    rows = []
    for num, info in UNESCO.items():
        url = f"https://whc.unesco.org/en/list/{num}"
        status, body = get(url, accept="text/html")
        row = {"ficha": url, "sitio": info["sitio"], "esperado": info["esperado"], "respuesta": status}
        if status == 200:
            text = html.unescape(re.sub(r"<[^>]+>", " ", body.decode("utf-8", errors="ignore")))
            text = re.sub(r"\s+", " ", text)
            title = re.search(r"<title>(.*?)</title>", body.decode("utf-8", errors="ignore"), re.S)
            row["titulo"] = html.unescape(title.group(1)).strip()[:160] if title else None
            insc = re.search(r"Date of Inscription\s*:?\s*(\d{4})", text)
            row["inscripcion"] = insc.group(1) if insc else None
            row["extensiones"] = sorted(set(re.findall(r"(?:Extension|Significant modification|Minor modification)[^0-9]{0,40}(\d{4})", text)))
            hallados = set([row["inscripcion"]] + row["extensiones"]) - {None}
            row["coincide"] = all(y in hallados or y in text for y in info["esperado"]) and row["inscripcion"] == info["esperado"][0]
        rows.append(row)
        time.sleep(2)
    return rows


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    recs = collect()
    results = []
    for i, key in enumerate(sorted(recs)):
        results.append(check_doi(recs[key]))
        time.sleep(0.25)
        if i % 25 == 0:
            print(f"{i}/{len(recs)} DOI")
    unesco = check_unesco()
    estados: dict[str, int] = {}
    for r in results:
        estados[r["estado"]] = estados.get(r["estado"], 0) + 1
    report = {"fecha": time.strftime("%Y-%m-%d", time.gmtime()), "total_doi": len(results), "estados": estados,
              "con_avisos": sum(1 for r in results if r.get("avisos")), "doi": results, "unesco": unesco}
    (OUT / "INFORME_FUENTES.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    lines = ["# Informe de comprobación de fuentes", "",
             f"Generado el {report['fecha']} por `scripts/comprobar_fuentes.py` (GitHub Actions). Es una comprobación automática: "
             "confirma que cada DOI existe y, en el recorrido, que el año y el primer apellido de la cita cuadran con Crossref. "
             "No sustituye la revisión de una persona experta.", "",
             "## DOI", "", f"Total: {len(results)}.", "", "| Estado | DOI |", "| --- | --- |"]
    lines += [f"| {k} | {v} |" for k, v in sorted(estados.items())]
    problemas = [r for r in results if r["estado"] != "en Crossref" or r.get("avisos")]
    lines += ["", "### DOI que requieren revisión", ""]
    if problemas:
        lines += ["| DOI | Dónde se usa | Resultado |", "| --- | --- | --- |"]
        for r in problemas:
            detalle = r["estado"] if r["estado"] != "en Crossref" else "; ".join(r["avisos"])
            lines.append(f"| `{r['doi']}` | {', '.join(r['origenes'])} | {detalle} |")
    else:
        lines.append("Ninguno.")
    lines += ["", "## Patrimonio Mundial (sesión 5 de la entrada DEA)", "", "| Sitio | Años que afirma la sesión | Ficha de la UNESCO | Resultado |", "| --- | --- | --- | --- |"]
    for u in unesco:
        if u["respuesta"] == 200:
            res = ("coincide" if u.get("coincide") else "revisar") + f": inscripción {u.get('inscripcion')}; otras fechas {', '.join(u.get('extensiones') or []) or 'ninguna'}"
        else:
            res = f"sin comprobar (respuesta {u['respuesta']})"
        lines.append(f"| {u['sitio']} | {', '.join(u['esperado'])} | [{u['ficha']}]({u['ficha']}) | {res} |")
    (OUT / "INFORME_FUENTES.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(json.dumps({"total_doi": len(results), "estados": estados, "con_avisos": report["con_avisos"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
