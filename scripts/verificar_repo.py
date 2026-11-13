#!/usr/bin/env python3
"""Verifica preparación y coherencia; no certifica la ejecución en Moodle."""
from __future__ import annotations
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
import csv, hashlib, json, re, shutil, subprocess, sys, tempfile
from urllib.parse import unquote, urlsplit

ROOT=Path(__file__).resolve().parents[1]
CHECKS=[]
def check(name,condition,detail=''):
    CHECKS.append({'name':name,'pass':bool(condition),'detail':detail})
def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def load(name):return json.loads((ROOT/name).read_text(encoding='utf-8'))

class Page(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.ids=[];self.anchors=[];self.assets=[];self.scripts=[];self.styles=[];self.csp='';self.current=None
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='a' and a.get('href','').startswith('#'):self.anchors.append(unquote(a['href'][1:]))
        if tag in ('script','link','img'):
            value=a.get('src') if tag in ('script','img') else a.get('href')
            if value:self.assets.append(value)
        if tag=='meta' and a.get('http-equiv','').lower()=='content-security-policy':self.csp=a.get('content','')
        if tag in ('script','style'):self.current={'tag':tag,'attrs':a,'text':''}
    def handle_data(self,data):
        if self.current is not None:self.current['text']+=data
    def handle_endtag(self,tag):
        if self.current and self.current['tag']==tag:
            (self.scripts if tag=='script' else self.styles).append(self.current);self.current=None

def verify(include_syntax=True):
    check('Python 3.10+',sys.version_info>=(3,10))
    node=shutil.which('node');check('Node disponible',node is not None)
    if node:
        ver=subprocess.check_output([node,'--version'],text=True).strip()
        check('Node 20+',int(ver.lstrip('v').split('.')[0])>=20,ver)
    status=load('provenance/ESTADO.json')
    check('NO_GO no promovido',status['release_gate']=='NO_GO')
    check('Moodle y lector pendientes',status['moodle']=='NOT_RUN' and status['screen_reader']=='NOT_RUN')
    observed=status.get('remote_observation',{})
    check('Procedencia remota explícita',status.get('remote_repository')=='https://github.com/DanielULPGC/Paleobot.-Plataforma-de-evoluci-n-humana' and bool(re.fullmatch(r'[0-9a-f]{40}',observed.get('source_commit',''))))
    deployment=status.get('correction_deployment')
    check('Publicación observada separada de validación',observed.get('pages_enabled') is True and deployment in ('NOT_VERIFIED','VERIFIED') and (deployment!='VERIFIED' or bool(status.get('deployment_evidence'))) and status['release_gate']=='NO_GO')
    cat=load('src/entrada_ligera/catalog.json');ids=[s['id'] for s in cat['records']]
    check('50 IDs canónicos únicos',len(ids)==len(set(ids))==50)
    check('50 contratos con IDs coincidentes',set(ids)==set(cat['chronology']['records']))
    visual=load('src/entrada_ligera/image_audit.json');good=set(visual['verified']);pending=set(visual['pending'])
    check('47 recursos y tres pendientes',len(good)==47 and len(pending)==3)
    check('Cobertura visual sin solapamiento',not good.intersection(pending) and good|pending==set(ids))
    check('Tres pendientes conservados',pending=={'anoiapithecus','chororapithecus','gautengensis'})
    check('Cuatro candidatas excluidas',len(visual['excluded_candidates'])==4)
    urls=[x['image_url'] for x in visual['verified'].values()]
    check('47 URL https documentadas',len(set(urls))==47 and all(urlsplit(u).scheme=='https' for u in urls))
    decisions=load('docs/auditoria/registro_decisiones.json')['registros']
    check('36 decisiones únicas',len(decisions)==len({x['id'] for x in decisions})==36)
    check('Cada decisión tiene motivo, evidencia, impacto y retorno',all(all(x.get(k) for k in
      ['justificacion','evidencia','pendiente','consecuencia_del_error','criterio_de_cierre','reversion_propuesta']) for x in decisions))
    check('36 borradores de incidencias',{f.stem for f in (ROOT/'docs/incidencias').glob('PB-*.md')}=={x['id'] for x in decisions})
    inv=load('docs/auditoria/inventario_artefactos.json')
    check('272 entradas de inventario',len(inv)==272)
    check('115 archivos con hash recuperado',sum(bool(x['sha256']) for x in inv)==115)
    check('Inventario sin enlaces privados',all('id_archivo' not in x and 'enlace' not in x for x in inv))
    for name,size in [('registro_decisiones.csv',36),('inventario_artefactos.csv',272)]:
        with (ROOT/'docs/auditoria'/name).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
        check('Filas CSV '+name,len(rows)==size)
    # El archivo de auditoría se mantiene fijo. Las fuentes de trabajo se construyen por separado.
    audit_hashes=load('provenance/AUDITORIA_SHA256.json')
    bad=[name for name,sha in audit_hashes.items() if not (ROOT/name).is_file() or digest(ROOT/name)!=sha]
    check('Integridad del expediente importado',not bad,', '.join(bad[:4]))
    baseline=load('provenance/BASELINE_IMPORTADA.json')['sha256']
    entries=load('provenance/PB_GH_02_ENTRADAS.json')['sha256']
    migration=load('provenance/PB_GH_02_MIGRACION.json')
    preserved=[row for row in migration['files'] if any((ROOT/p).is_file() and digest(ROOT/p)==row['sha256'] for p in row['retained_paths'])]
    check('330 archivos auditados preservados por contenido',len(migration['files'])==len(preserved)==330 and migration['source_commit']==status.get('audit_source_commit'))
    current_base=load('provenance/PB_GH_02_BASE_ACTUAL.json')
    current_preserved=[row for row in current_base['files'] if any((ROOT/p).is_file() and digest(ROOT/p)==row['sha256'] for p in row['retained_paths'])]
    check('Archivos de la base de trabajo preservados',len(current_base['files'])==len(current_preserved)==current_base['source_files'] and current_base['source_commit']==observed.get('source_commit'))
    atlas_import=load('provenance/ATLAS_V1_IMPORT.json')
    # PB-GH-03: un archivo del Atlas puede diferir de su huella importada solo si la
    # corrección está documentada y el original se conserva, con esa huella, en su snapshot.
    # PB-GH-04 encadena una segunda ronda: la última corrección de cada ruta debe partir
    # exactamente del estado anterior, conservado en su propio snapshot.
    rondas=[load(n)['corrections'] for n in ('provenance/PB_GH_03_CORRECCIONES.json','provenance/PB_GH_04_CORRECCIONES.json','provenance/PB_GH_05_CORRECCIONES.json','provenance/PB_GH_06_CORRECCIONES.json','provenance/PB_GH_07_CORRECCIONES.json','provenance/PB_GH_09_CORRECCIONES.json','provenance/PB_GH_10_CORRECCIONES.json') if (ROOT/n).is_file()]
    fixes={}
    cadena_ok=True
    for ronda in rondas:
        for c in ronda:
            prev=fixes.get(c['path'])
            if prev is not None:
                cadena_ok=cadena_ok and c.get('previous_sha256')==prev['corrected_sha256'] and (ROOT/c.get('previous_snapshot','')).is_file() and digest(ROOT/c['previous_snapshot'])==prev['corrected_sha256']
            fixes[c['path']]=c
    check('Cadena de correcciones del Atlas con estados intermedios archivados',cadena_ok)
    def documentado(ruta,sha):
        # Coincide con su huella, o la difiere una corrección registrada que conserva el original.
        # PB-GH-06: una retirada (removed) exige que el fichero ya no exista y que su original esté archivado.
        f=ROOT/ruta
        if f.is_file() and digest(f)==sha:return True
        c=fixes.get(ruta)
        if not c or c['import_sha256']!=sha or not (ROOT/c['snapshot']).is_file() or digest(ROOT/c['snapshot'])!=sha:return False
        if c.get('removed'):return not f.exists() and c.get('corrected_sha256') is None
        return f.is_file() and digest(f)==c['corrected_sha256']
    def atlas_ok(p,sha):return documentado('atlas/'+p,sha)
    check('Entradas actuales coinciden con su procedencia',all(documentado(p,sha) for p,sha in entries.items()))
    check('169 archivos Atlas v1 conservan las huellas importadas o una corrección documentada',len(atlas_import['sha256'])==169 and all(atlas_ok(p,sha) for p,sha in atlas_import['sha256'].items()))
    check('Correcciones PB-GH-03 con motivo, evidencia, impacto y retorno',bool(fixes) and all(all(c.get(k) for k in ('change','reason','evidence','impact','return')) for ronda in rondas for c in ronda))
    atlas_db=(ROOT/'atlas/assets/js/00-core/002-script.js').read_text(encoding='utf-8')
    errores_cronologia=[p for p in (r'nombre: "H\. neanderthalensis", anos: "[^"]*", [^\n]*datacion: "14C"', r'nombre: "Homo floresiensis", anos: "50 ka"', r"datacion: \"U-Pb\", cc: 408", r'nombre: "Homo cepranensis", anos: "~900', 'ajpa.24122', 'Sutton et al. \\(2023\\)') if re.search(p,atlas_db)]
    check('Atlas v1 sin los errores de cronología corregidos en PB-GH-04',not errores_cronologia,', '.join(errores_cronologia))
    atlas_text=' '.join(f.read_text(encoding='utf-8',errors='ignore') for f in (ROOT/'atlas').rglob('*') if f.suffix in ('.js','.html','.json'))
    # PB-GH-05: regresiones de accesibilidad y texto del sitio publicado.
    js_dir=ROOT/'atlas/assets/js'
    selector_body=[str(f.relative_to(ROOT)) for f in js_dir.rglob('*.js') if "querySelectorAll('[data-pb-v50-block]')" in f.read_text(encoding='utf-8',errors='ignore')]
    check('Selectores de bloque no marcan body como pestaña',not selector_body,', '.join(selector_body[:3]))
    limpieza=(js_dir/'00-core/076-paleobot-clean-branding.js').read_text(encoding='utf-8')
    check('Limpieza de marca conserva los espacios de borde',"before.match(/^\\s*/)[0] + clean(before)" in limpieza)
    portada=(ROOT/'atlas/recorrido/portada-sylva.html').read_text(encoding='utf-8')
    check('Menú de la portada con nombre accesible en pantallas estrechas',all(f'href="{h}" style="--d:{d}ms" aria-label=' in portada for h,d in (('parentesco.html',180),('territorio.html',230),('ficha.html',280),('atlas.html',330))))
    manifiesto=(ROOT/'atlas/imsmanifest.xml').read_text(encoding='utf-8')
    hrefs=re.findall(r'<file href="([^"]+)"',manifiesto)
    check('Manifiesto IMS completo e incluye la portada',all((ROOT/'atlas'/h).is_file() for h in hrefs) and 'recorrido/portada-sylva.html' in hrefs)
    # PB-GH-06: sin puntos de entrada a funciones de IA ni instrucciones de Moodle en lo publicado.
    publicado=[ROOT/'index.html',ROOT/'ligera/index.html',ROOT/'atlas/index.html',*sorted((ROOT/'atlas/recorrido').glob('*.html'))]
    ia_ui=[str(f.relative_to(ROOT)) for f in [*publicado,*js_dir.rglob('*.js')] if re.search(r'data-quiz-next="generative">Preguntas con IA|data-detail-action="generateFacialDescription"|no usa IA',f.read_text(encoding='utf-8',errors='ignore'))]
    check('Sin botones ni rótulos de IA en la interfaz',not ia_ui,', '.join(ia_ui[:3]))
    moodle_ui=[str(f.relative_to(ROOT)) for f in [*publicado,*js_dir.rglob('*.js')] if re.search(r"FORMATO MOODLE|evidencia de trabajo en Moodle|Entrada ligera para Moodle",f.read_text(encoding='utf-8',errors='ignore'))]
    check('Sin textos de Moodle en la interfaz ni instrucciones de subida',not moodle_ui and not (ROOT/'atlas/LEEME-MOODLE.md').exists(),', '.join(moodle_ui[:3]))
    # PB-GH-07: entrada del Diploma de Estudios Africanos (dea/), sin peticiones externas.
    dea=ROOT/'dea'
    dea_html=(dea/'index.html').read_text(encoding='utf-8') if (dea/'index.html').is_file() else ''
    dea_js=(dea/'dea.js').read_text(encoding='utf-8') if (dea/'dea.js').is_file() else ''
    dea_srcs=re.findall(r'<(?:script|link)[^>]+(?:src|href)="([^"]+)"',dea_html)
    check('Entrada DEA completa y con recursos locales',bool(dea_html) and all(not s.startswith(('http:','https:','//')) and (dea/s).resolve().is_file() for s in dea_srcs) and (dea/'mapa-africa.js').is_file())
    check('Entrada DEA con CSP estricta y sin conexiones de red',"script-src 'self'" in dea_html and "connect-src 'none'" in dea_html and not re.search(r'fetch\(|XMLHttpRequest|sendBeacon|WebSocket',dea_js))
    gen=subprocess.run([node,str(ROOT/'scripts/generar_glosario_dea.cjs'),'--check'],capture_output=True,text=True,timeout=30) if node else None
    check('Glosario DEA sincronizado con el del atlas',bool(gen) and gen.returncode==0,(gen.stdout or gen.stderr).strip() if gen else 'sin Node')
    # PB-GH-08: copias locales de las imágenes verificadas, con huella, autoría y licencia.
    copias=subprocess.run([sys.executable,'-B',str(ROOT/'scripts/obtener_imagenes.py'),'--check'],capture_output=True,text=True,timeout=60)
    check('Copias de imágenes íntegras, registradas y con licencia',copias.returncode==0,copias.stdout.strip().splitlines()[-1] if copias.stdout.strip() else copias.stderr.strip()[:200])
    gen_img=subprocess.run([node,str(ROOT/'scripts/generar_imagenes_dea.cjs'),'--check'],capture_output=True,text=True,timeout=30) if node else None
    check('Imágenes y créditos de la entrada DEA sincronizados con el manifiesto',bool(gen_img) and gen_img.returncode==0,(gen_img.stdout or gen_img.stderr).strip() if gen_img else 'sin Node')
    check('Portada enlaza la entrada DEA sin perder enlaces',all(h in portada for h in ('href="../../dea/"','href="parentesco.html"','href="territorio.html"','href="ficha.html"','href="atlas.html"','href="index.html"')))
    ligera_html=(ROOT/'ligera/index.html').read_text(encoding='utf-8')
    check('Referencia no localizada marcada y conservada','10.1002/ajpa.24122</a> <em>(Aviso: el DOI citado pertenece a otro artículo' in ligera_html)
    # PB-GH-09: los DOI que fallan se marcan con el registro comprobado; la tabla, la consulta ligera y el atlas dicen lo mismo.
    tabla=load('docs/fiabilidad/DOI_CORRESPONDENCIAS.json')['correspondencias']
    visibles={c['doi_citado']:c['doi_comprobado'] for c in tabla if c['visible_para_el_alumnado'] and c['doi_comprobado']}
    informe=load('docs/fiabilidad/INFORME_FUENTES.json')
    candidatos={r['doi'].lower():{c['doi'].lower() for c in r.get('candidatos') or []} for r in informe['doi']}
    check('Cada DOI comprobado procede del informe de Crossref',all(c['doi_comprobado'].lower() in candidatos.get(c['doi_citado'].lower(),set()) for c in tabla if c['doi_comprobado']))
    check('Todos los DOI con incidencia del informe constan en la tabla',{r['doi'].lower() for r in informe['doi'] if r['estado']=='no localizado' or r.get('avisos')}<={c['doi_citado'].lower() for c in tabla})
    build_src=(ROOT/'src/entrada_ligera/build.py').read_text(encoding='utf-8')
    modulo=(ROOT/'atlas/assets/js/90-guards/084-paleobot-doi-avisos.js').read_text(encoding='utf-8')
    check('DOI con aviso: mismos pares en tabla, consulta ligera y atlas',len(visibles)==4 and all(f'"{a}": "{b}"' in build_src and f"'{a}': '{b}'" in modulo for a,b in visibles.items()))
    check('DOI con aviso: se conserva el enlace original y se añade el comprobado',all(f'href="https://doi.org/{a}"' in ligera_html and f'href="https://doi.org/{b}"' in ligera_html for a,b in visibles.items()))
    check('Módulo de avisos cargado por el atlas','90-guards/084-paleobot-doi-avisos.js' in (ROOT/'atlas/index.html').read_text(encoding='utf-8'))
    flujo=(ROOT/'.github/workflows/comprobar-fuentes.yml').read_text(encoding='utf-8')
    check('Comprobación de fuentes solo manual','workflow_dispatch' in flujo and 'push:' not in flujo and 'schedule' not in flujo)
    check('Atlas v1 no carga la imagen sin permiso de reutilización','B44_02.jpg' not in atlas_text)
    check('Atlas v1 sin la cita ICS no localizada','epiiugs/2023/023025' not in atlas_text)
    # PB-GH-10: sistema base «Papel y tierra» (assets/) consumido por DEA, recorrido y consulta ligera.
    base_css=(ROOT/'assets/paleobot-base.css').read_text(encoding='utf-8') if (ROOT/'assets/paleobot-base.css').is_file() else ''
    estilos_lig=(ROOT/'src/entrada_ligera/estilos.css').read_text(encoding='utf-8')
    sinc=re.search(r'/\* === sincronizado con assets/paleobot-base\.css · inicio === \*/\n(.*?)\n?/\* === sincronizado con assets/paleobot-base\.css · fin === \*/',estilos_lig,re.S)
    # Copia literal de la hoja base sin su comentario de cabecera; única diferencia admitida: la ruta de Lexend.
    base_sin_cabecera=re.sub(r'\A/\*.*?\*/\s*','',base_css,count=1,flags=re.S).replace('url("fuentes/lexend-latin.woff2")','url("../assets/fuentes/lexend-latin.woff2")')
    check('Tokens de la consulta ligera sincronizados con assets/paleobot-base.css',bool(base_css) and bool(sinc) and sinc.group(1).strip()==base_sin_cabecera.strip())
    # Contraste de las parejas de tokens calculado desde la propia hoja base, en los cuatro temas (claro, oscuro,
    # proyección clara y proyección oscura): texto ≥ 4,5:1; contornos de control y foco ≥ 3:1. El tema de proyección
    # oscura se compone como lo hereda <body>: claro, oscuro, .proyeccion y su bloque oscuro, en ese orden.
    def tokens_de(cuerpo):return dict(re.findall(r'(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{6})\b',cuerpo or ''))
    def bloque(patron):
        m=re.search(patron,base_sin_coment,re.S);return m.group(1) if m else ''
    def luminancia(h):
        c=[int(h[i:i+2],16)/255 for i in (1,3,5)];c=[x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4 for x in c]
        return .2126*c[0]+.7152*c[1]+.0722*c[2]
    def razon(a,b):
        a,b=luminancia(a),luminancia(b);return (max(a,b)+.05)/(min(a,b)+.05)
    base_sin_coment=re.sub(r'/\*.*?\*/','',base_css,flags=re.S)
    t_claro=tokens_de(bloque(r'(?<![\w-]):root\s*\{([^}]*)\}'))
    t_oscuro=tokens_de(bloque(r'@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-tema="claro"\]\)\s*\{([^}]*)\}'))
    t_proy=tokens_de(bloque(r'(?:^|\n)\.proyeccion\s*\{([^}]*)\}'))
    t_proy_osc=tokens_de(bloque(r'\.proyeccion\s*\{([^}]*)\}\s*\}'))
    temas={'claro':t_claro,'oscuro':{**t_claro,**t_oscuro},'proyección clara':{**t_claro,**t_proy},'proyección oscura':{**t_claro,**t_oscuro,**t_proy,**t_proy_osc}}
    fondos=('--papel','--superficie','--hundido')
    parejas=[(t,f,4.5) for t in ('--tinta','--tinta-2','--tinta-3','--acento') for f in fondos]
    parejas+=[('--acento','--acento-suave',4.5),('--tinta','--acento-suave',4.5),('--sobre-acento','--acento',4.5),('--debatida','--debatida-fondo',4.5),('--bien','--bien-fondo',4.5),('--mal','--mal-fondo',4.5),('--bien','--papel',4.5),('--mal','--papel',4.5)]
    parejas+=[(c,f,3) for c in ('--borde-control','--foco') for f in fondos]
    bajos=[]
    for nombre_tema,valores in temas.items():
        for a,b,minimo in parejas:
            if a not in valores or b not in valores:bajos.append(f'{nombre_tema}: falta {a if a not in valores else b}');continue
            r=razon(valores[a],valores[b])
            if r<minimo:bajos.append(f'{nombre_tema}: {a}/{b} {r:.2f}:1')
    check('Parejas de tokens de assets/paleobot-base.css con contraste suficiente en claro, oscuro y proyección',bool(t_claro) and bool(t_oscuro) and bool(t_proy) and bool(t_proy_osc) and not bajos,', '.join(bajos[:3]))
    lexend=ROOT/'assets/fuentes/lexend-latin.woff2';licencia_lexend=ROOT/'assets/fuentes/LICENCIA-Lexend.md'
    check('Lexend local idéntica al original y con su licencia',lexend.is_file() and digest(lexend)==digest(ROOT/'atlas/recorrido/inner-green-assets/lexend-latin.woff2') and licencia_lexend.is_file() and 'SIL Open Font License, Version 1.1' in licencia_lexend.read_text(encoding='utf-8') and digest(lexend) in licencia_lexend.read_text(encoding='utf-8'))
    dea_csp=(re.search(r'http-equiv="Content-Security-Policy" content="([^"]*)"',dea_html) or [None,''])[1]
    secciones_dea=('inicio','tiempo','mapa','especies','comparar','metodos','clima','glosario','repaso','trabajo')
    check('Entrada DEA enlaza la hoja base, con CSP estricta, aviso sin JavaScript, diez secciones y sin estilos en línea',
      'href="../assets/paleobot-base.css"' in dea_html and "default-src 'self'" in dea_csp and "style-src 'self'" in dea_csp and "connect-src 'none'" in dea_csp
      and 'unsafe-inline' not in dea_csp and not re.search(r'https?:|//',dea_csp) and '<noscript>' in dea_html
      and all(f'<section id="{s}" ' in dea_html for s in secciones_dea) and len(re.findall(r'<section id=',dea_html))==10
      and not re.search(r'\sstyle\s*=',dea_html) and '<style' not in dea_html)
    # dea.css solo consume tokens. Excepciones documentadas y cerradas: la escala raíz (A−/A+ y proyección)
    # el h1 del modo proyección (L2-9: paso mayor de la escala × 1,25) y el texto de los SVG del mapa, en unidades
    # del viewBox (2.4px), en dos selectores concretos.
    excepciones_fs={'html':'calc(100% * var(--escala))','html.proyeccion':'calc(130% * var(--escala))','body.proyeccion h1':'calc(var(--t-3xl) * 1.25)','.mapas .numero-punto':'2.4px','#mapa-svg .rotulo-mapa':'2.4px'}
    dea_css=re.sub(r'/\*.*?\*/','',(dea/'dea.css').read_text(encoding='utf-8'),flags=re.S)
    tamanos_fuera=[]
    for selector,cuerpo in re.findall(r'([^{}]+)\{([^{}]*)\}',dea_css):
        for valor in re.findall(r'(?<![-\w])font-size\s*:\s*([^;]+)',cuerpo):
            valor=valor.strip();sel=' '.join(selector.split())
            if not re.fullmatch(r'var\(--t-[a-z0-9]+\)',valor) and excepciones_fs.get(sel)!=valor:tamanos_fuera.append(sel+': '+valor)
    colores=re.findall(r'#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(',dea_css)
    check('Hoja de la entrada DEA solo con tokens de color y de tamaño de letra',not tamanos_fuera and not colores,', '.join(tamanos_fuera[:3]+colores[:3]))
    recorrido=[ROOT/'atlas/recorrido'/f'{n}.html' for n in ('index','introduccion','cronologia','territorio','parentesco','ficha','metodos','clima','aula','atlas')]
    paginas_fuentes=[*recorrido,ROOT/'atlas/recorrido/portada-sylva.html',ROOT/'ligera/index.html',dea/'index.html',dea/'dea.css',ROOT/'src/entrada_ligera/estilos.css',ROOT/'assets/paleobot-base.css',ROOT/'atlas/recorrido/integracion.css']
    con_google=[str(f.relative_to(ROOT)) for f in paginas_fuentes if re.search(r'fonts\.(?:googleapis|gstatic)\.com',f.read_text(encoding='utf-8'))]
    sin_base=[f.name for f in recorrido if 'href="../../assets/paleobot-base.css"' not in f.read_text(encoding='utf-8')]
    check('Recorrido, DEA y consulta ligera sin Google Fonts; las diez páginas del recorrido enlazan la hoja base',not con_google and not sin_base,', '.join(con_google[:3]+sin_base[:3]))
    manifiesto_img=load('img/taxones/MANIFIESTO.json')['images']
    archivos_img={x['file'] for x in manifiesto_img.values()}
    figuras=re.findall(r'<figure class=media>(.*?)</figure>',ligera_html,re.S)
    srcs_lig=re.findall(r'<img\b[^>]*\bsrc="([^"]+)"',ligera_html)
    malas=[s for s in srcs_lig if 'upload.wikimedia.org' in s or not s.startswith('../img/taxones/') or s.rsplit('/',1)[-1] not in archivos_img or not (ROOT/'img/taxones'/s.rsplit('/',1)[-1]).is_file()]
    sin_credito=[f[:60] for f in figuras if '<img' in f and not ('Ficha de la imagen' in f and re.search(r'creativecommons\.org/|[Dd]ominio público',f))]
    check('Consulta ligera con imágenes locales registradas, sin Wikimedia como origen y con crédito y licencia',len(srcs_lig)==len(good)==47 and not malas and not sin_credito and 'upload.wikimedia.org' not in ' '.join(srcs_lig),', '.join(malas[:3]+sin_credito[:2]))
    acceso_dea=re.search(r'<a class="dock-item"[^>]*href="\.\./\.\./dea/"[^>]*aria-label="Diploma de Estudios Africanos">.*?<span>DEA</span>',portada,re.S)
    check('Portada conserva el acceso «DEA» con su rótulo visible en pantallas estrechas',bool(acceso_dea) and '.dock-item span:not(.glyph){ display:block; }' in portada and 'data-rotulo="Recorrido"' in portada)
    # «No se elimina nada»: datos y archivos generados intactos respecto a 693055f y textos de las seis sesiones presentes.
    pb10=load('provenance/PB_GH_10_CORRECCIONES.json') if (ROOT/'provenance/PB_GH_10_CORRECCIONES.json').is_file() else {}
    protegido=pb10.get('contenido_protegido',{})
    cambiados=[p for p,s in protegido.items() if not (ROOT/p).is_file() or digest(ROOT/p)!=s]
    snap_sesiones=ROOT/'docs/historial/PB_GH_09/dea/dea.js.snapshot'
    textos_sesion=[]
    if snap_sesiones.is_file():
        previo=snap_sesiones.read_text(encoding='utf-8');i=previo.find('var SESIONES = [');j=previo.find('\n  ];',i)
        if i!=-1 and j!=-1:textos_sesion=re.findall(r"'((?:[^'\\]|\\.)*)'",previo[i:j])
    perdidos=[t[:40] for t in textos_sesion if "'"+t+"'" not in dea_js]
    check('No se elimina nada: datos, glosario, imágenes y mapa intactos y textos de las seis sesiones presentes',len(protegido)==4 and not cambiados and len(textos_sesion)>=100 and not perdidos,', '.join(cambiados+perdidos[:3]))
    frozen=['baselines/entrada-ligera-v9.html','experimental/atlas-r98/fuentes/Auditoria_R98/assets/vendor/leaflet/1.9.4/LICENSE.txt']
    check('Referencia v9 y licencia Leaflet intactas',all(digest(ROOT/name)==baseline[name] for name in frozen))
    check('Catálogo original preservado',digest(ROOT/'src/entrada_ligera/catalog.json')==baseline['src/entrada_ligera/catalog.json'])
    imports=load('provenance/importacion.json')['items']
    changed=[x for x in imports if x['original_sha256']!=x['imported_sha256']]
    check('Solo inventarios transformados',len(changed)==2 and all(x['transformation']=='omit_private_platform_id_and_link' for x in changed))
    imported_json=[]
    for file in ROOT.rglob('*.json'):
        if any(p in ('.git','local-results','dist','__pycache__') for p in file.relative_to(ROOT).parts):continue
        try:json.loads(file.read_text(encoding='utf-8'))
        except (ValueError,UnicodeError):imported_json.append(str(file.relative_to(ROOT)))
    check('JSON legibles',not imported_json,', '.join(imported_json[:3]))
    main=Page();main.feed((ROOT/'ligera/index.html').read_text())
    check('50 fichas HTML en la entrada',sum(i.startswith('sp-') for i in main.ids)==50)
    check('Entrada sin IDs duplicados',not [x for x,n in Counter(main.ids).items() if n>1])
    check('Anclas de entrada con destino',all(a in main.ids for a in main.anchors if a))
    text=(ROOT/'ligera/index.html').read_text()
    # PB-GH-06: el aviso de prueba en Moodle se retira por indicación de la titular (registro en PB_GH_06_CORRECCIONES.json).
    check('Consulta ligera sin referencias a Moodle','moodle' not in text.lower() and 'Comprobar las imágenes' in text)
    atlasroot=ROOT/'experimental/atlas-r98/fuentes/Auditoria_R98'
    missing=[]
    for html in [ROOT/'ligera/index.html',atlasroot/'index.html',atlasroot/'science/chronology.html']:
        parsed=Page();parsed.feed(html.read_text())
        for value in parsed.assets:
            u=urlsplit(value)
            if u.scheme or u.netloc or not u.path:continue
            candidate=(html.parent/unquote(u.path)).resolve()
            if not candidate.is_relative_to(ROOT.resolve()) or not candidate.is_file():missing.append(str(html.relative_to(ROOT))+':'+value)
    check('Rutas estáticas de tres HTML',not missing,', '.join(missing[:5]))
    atlas_page=Page();atlas_page.feed((atlasroot/'index.html').read_text())
    check('Cuarentena no cargada desde el índice',not any('_quarantine' in u or '036d-paleobot-v79' in u for u in atlas_page.assets))
    pilot=Page();pilot.feed((ROOT/'experimental/atlas-r98/PaleoBot_Atlas_Original_Directo_R98_PILOTO.html').read_text())
    cspbad=[]
    import base64
    for block in pilot.scripts+pilot.styles:
        token="'sha256-"+base64.b64encode(hashlib.sha256(block['text'].encode()).digest()).decode()+"'"
        if token not in pilot.csp:cspbad.append(block['attrs'].get('data-source','inline'))
    check('Hashes CSP de los 133 bloques del piloto',len(pilot.scripts)==77 and len(pilot.styles)==56 and not cspbad)
    # Verificación de esta preparación: el repositorio no publica ni toma credenciales.
    workflow=(ROOT/'.github/workflows/verificar.yml').read_text()
    check('Pages estático explícito', (ROOT/'.nojekyll').is_file())
    check('Checkout fijado a commit oficial','actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1' in workflow)
    check('CI con permisos de lectura y sin despliegue','contents: read' in workflow and 'persist-credentials: false' in workflow and 'pull_request_target' not in workflow and 'deploy-pages' not in workflow)
    files=[f for f in ROOT.rglob('*') if f.is_file() and not any(p in ('.git','local-results','dist','__pycache__') for p in f.relative_to(ROOT).parts)]
    check('Archivos por debajo de 25 MiB',all(f.stat().st_size<25*1024*1024 for f in files))
    folded=[str(f.relative_to(ROOT)).casefold() for f in files]
    check('Rutas compatibles sin colisiones de mayúsculas',len(folded)==len(set(folded)))
    private=[];secret=[]
    platform=re.compile(r'libfile_[0-9a-f]{12,}|https://chatgpt\.com/library\?')
    token=re.compile(r'\bsk-(?:ant-)?[A-Za-z0-9_-]{32,}\b|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bAKIA[A-Z0-9]{16}\b|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----')
    for f in files:
        if f.suffix in ['.docx','.png','.jpg']:continue
        s=f.read_text(encoding='utf-8',errors='replace')
        # Las reglas del propio verificador describen patrones, no identificadores reales.
        if platform.search(s):private.append(str(f.relative_to(ROOT)))
        if token.search(s):secret.append(str(f.relative_to(ROOT)))
    check('Sin identificadores privados de plataforma en texto',not private,', '.join(private[:5]))
    check('Sin patrones de credenciales reconocidos',not secret,', '.join(secret[:5]))
    forbidden=[str(f.relative_to(ROOT)) for f in files if f.name=='.env' or f.suffix in ['.pem','.key','.zip','.bundle']]
    check('Sin archivos de credenciales ni ZIP ancestrales',not forbidden,', '.join(forbidden[:4]))
    # La sintaxis se vuelve a comprobar en las ubicaciones preparadas para CI.
    syntax_count=0;syntax_errors=[]
    if node and include_syntax:
        for f in files:
            if f.suffix not in ['.js','.cjs']:continue
            r=subprocess.run([node,'--check',str(f)],capture_output=True,text=True,timeout=20);syntax_count+=1
            if r.returncode:syntax_errors.append(str(f.relative_to(ROOT)))
        for name,parsed in [('index.html',main),('atlas-piloto',pilot)]:
            for i,b in enumerate(parsed.scripts,1):
                if b['attrs'].get('type','') in ['application/json','application/ld+json']:continue
                with tempfile.NamedTemporaryFile('w',suffix='.js',encoding='utf-8',delete=False) as f:
                    f.write(b['text']);temporary=Path(f.name)
                try:
                    r=subprocess.run([node,'--check',str(temporary)],capture_output=True,text=True,timeout=20);syntax_count+=1
                finally:
                    temporary.unlink(missing_ok=True)
                if r.returncode:syntax_errors.append(name+':'+str(i))
    if include_syntax:
        check('Sintaxis JavaScript de archivos y bloques',node is not None and not syntax_errors,str(syntax_count)+' unidades; '+', '.join(syntax_errors[:4]))
    return {'checks':CHECKS,'passed':sum(x['pass'] for x in CHECKS),'failed':sum(not x['pass'] for x in CHECKS),
      'javascript_units_checked':syntax_count,'syntax_executed':bool(node and include_syntax),
      'application_files':len(files),'release_gate':'NO_GO',
      'real_browser_executed':False,'screen_reader_executed':False,'moodle_executed':False,
      'note':'PASS de preparación y estructura no equivale a corrección de PB-01 o validación docente.'}

if __name__=='__main__':
    try:
        report=verify();dest=ROOT/'local-results';dest.mkdir(exist_ok=True)
        (dest/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({k:v for k,v in report.items() if k!='checks'},ensure_ascii=False,indent=2))
        for item in CHECKS:
            if not item['pass']:print('FAILED: '+item['name']+' '+item['detail'],file=sys.stderr)
        sys.exit(1 if report['failed'] else 0)
    except (OSError,ValueError,KeyError,subprocess.SubprocessError) as exc:
        print('VERIFICATION_ERROR: '+str(exc),file=sys.stderr);sys.exit(1)
