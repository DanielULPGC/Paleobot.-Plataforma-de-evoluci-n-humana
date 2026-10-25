#!/usr/bin/env python3
"""Construye fuera de las fuentes. --check solo compara, sin publicar."""
from __future__ import annotations
import argparse, hashlib, json, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def digest(f):return hashlib.sha256(Path(f).read_bytes()).hexdigest()

def build(target='all',check=False):
    results=[]
    with tempfile.TemporaryDirectory(prefix='paleobot-build-') as temp:
        tmp=Path(temp)
        if target in ('all','light'):
            dest=tmp/'light';dest.mkdir()
            for name in ['build.py','catalog.json','image_audit.json','estilos.css','interaccion.js']:
                shutil.copyfile(ROOT/'src/entrada_ligera'/name,dest/name)
            run=subprocess.run([sys.executable,str(dest/'build.py')],cwd=dest,capture_output=True,text=True,timeout=30)
            if run.returncode:raise RuntimeError('Generador ligero: '+run.stderr[-1500:])
            results.append(('light',dest/'PaleoBot_Moodle_Entrada_Directa_v11.html',ROOT/'index.html','entrada-ligera-v11.html'))
        if target in ('all','atlas'):
            dest=tmp/'atlas/fuentes';shutil.copytree(ROOT/'experimental/atlas-r98/fuentes',dest)
            run=subprocess.run([sys.executable,str(dest/'build_directo_r98.py')],cwd=dest,capture_output=True,text=True,timeout=40)
            if run.returncode:raise RuntimeError('Generador Atlas: '+run.stderr[-1500:])
            results.append(('atlas',dest.parent/'PaleoBot_Atlas_Original_Directo_R98_PILOTO.html',ROOT/'experimental/atlas-r98/PaleoBot_Atlas_Original_Directo_R98_PILOTO.html','atlas-r98-piloto.html'))
        report=[]
        for name,generated,reference,filename in results:
            item={'target':name,'sha256':digest(generated),'bytes':generated.stat().st_size,
                  'matches_preserved':generated.read_bytes()==reference.read_bytes()}
            if check and not item['matches_preserved']:raise RuntimeError('La construcción difiere del HTML preservado: '+name)
            if not check:
                out=ROOT/'dist'/filename;out.parent.mkdir(exist_ok=True);shutil.copyfile(generated,out)
                item['output']=str(out.relative_to(ROOT))
            report.append(item)
    return {'mode':'compare_only' if check else 'write_dist_only','builds':report,
            'application_sources_modified':False,'release_gate':'NO_GO','moodle_executed':False}

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    parser.add_argument('--target',choices=['all','light','atlas'],default='all')
    args=parser.parse_args()
    try:
        result=build(args.target,args.check)
        output=ROOT/'local-results';output.mkdir(exist_ok=True)
        (output/'build.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps(result,ensure_ascii=False,indent=2))
    except (OSError,RuntimeError,subprocess.SubprocessError) as exc:
        print('BUILD_FAILED: '+str(exc),file=sys.stderr);sys.exit(1)
