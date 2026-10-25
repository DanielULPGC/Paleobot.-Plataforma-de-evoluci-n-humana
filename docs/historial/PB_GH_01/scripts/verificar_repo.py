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
    check('Sin publicación registrada',status['remote_push'] is False and status['pages_deployed'] is False)
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
    main=Page();main.feed((ROOT/'index.html').read_text())
    check('50 fichas HTML en la entrada',sum(i.startswith('sp-') for i in main.ids)==50)
    check('Entrada sin IDs duplicados',not [x for x,n in Counter(main.ids).items() if n>1])
    check('Anclas de entrada con destino',all(a in main.ids for a in main.anchors if a))
    text=(ROOT/'index.html').read_text()
    check('Aviso v9/v11 conservado','v9 funciona en Moodle según la prueba del usuario' in text and 'diagnóstico de v11 están pendientes' in text)
    atlasroot=ROOT/'experimental/atlas-r98/fuentes/Auditoria_R98'
    missing=[]
    for html in [ROOT/'index.html',atlasroot/'index.html',atlasroot/'science/chronology.html']:
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
