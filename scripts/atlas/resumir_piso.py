#!/usr/bin/env python3
"""Resume piso_<vp>.json (recorrido.cjs). Uso: python3 -I resumir_piso.py piso_telefono.json [...]"""
import json, sys, collections
for p in sys.argv[1:]:
    d = json.load(open(p))
    for vp, r in d.items():
        print(f"=== {vp} carga {r['cargaMs']} ms, listo {r['listoMs']} ms, CLS carga {r['clsCarga']}, peso {r['peso']}")
        e = r.get('entrar', {}); print('entrar', e)
        for k in ('portada', 'navegacion', 'areaTrabajo'):
            m = r.get(k, {}); print(k, 'docW', m.get('docW'), 'desborda', m.get('desbordaX'), 'fuentes', len(m.get('fuentes', {})), 'colores', len(m.get('colores', {})), 'fondos', len(m.get('fondos', {})), '<24', m.get('menor24'), '<44', m.get('menor44'), 'ctl', m.get('controles'), 'emoji', m.get('emoji'), 'h1', m.get('h1'), 'grad', m.get('gradientes'), 'bsf', m.get('bordeSombraFondo'))
        for k in ('portadaAxe', 'documentoAxe'):
            print(k, [(v['id'], v['impact'], v['n']) for v in r.get(k, [])])
        agg = collections.Counter(); fs = set(); col = set(); fam = set(); rad = set(); sh = set(); sp = set()
        print('vista | cls | desbordaX | fuentes | colores | <24 | <44 | ctl | emoji | saltosH | axe(n reglas: nodos)')
        for v, o in r['vistas'].items():
            m = o.get('piso') or {}
            fs |= set(m.get('fuentes', {})); col |= set(m.get('colores', {})); fam |= set(m.get('familias', {})); rad |= set(m.get('radios', {})); sh |= set(m.get('sombras', {})); sp |= set(m.get('espaciados', {}))
            ax = o.get('axe') or []
            for a in ax: agg[(a['id'], a['impact'])] += a['n']
            print(v, '|', o.get('cls'), '|', m.get('desbordaX'), m.get('anchos', [])[:2], '|', len(m.get('fuentes', {})), '|', len(m.get('colores', {})), '|', m.get('menor24'), '|', m.get('menor44'), '|', m.get('controles'), '|', m.get('emoji'), '|', m.get('saltosEncabezado'), '|', ' '.join(f"{a['id']}:{a['n']}" for a in ax), '|', 'EXC' if o.get('excepciones') else '', o.get('error', ''))
        print('TOTAL distintos en vistas: fuentes', len(fs), 'colores', len(col), 'familias', sorted(fam), 'radios', len(rad), 'sombras', len(sh), 'espaciados', len(sp))
        print('fuentes', sorted(fs, key=lambda x: float(x[:-2]))[:70])
        print('axe agregado', agg.most_common(25))
