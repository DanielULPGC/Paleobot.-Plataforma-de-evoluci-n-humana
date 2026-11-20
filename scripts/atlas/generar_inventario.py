#!/usr/bin/env python3
"""Genera 02_inventario.json combinando el inventario en bruto del navegador (inv_bruto_escritorio.json),
VIEW_META/COMPLEXITY_MODES (meta.json) y el humo (humo_escritorio.json). Uso:
python3 -I generar_inventario.py <carpeta piso> <salida.json>"""
import json, sys, collections, re
P = sys.argv[1]; OUT = sys.argv[2]
inv = json.load(open(P + '/inv_bruto_escritorio.json'))
meta = json.load(open(P + '/meta.json'))
humo = json.load(open(P + '/humo_escritorio.json'))
bloques = humo['funciones']['bloques']['chips']
bloque_de = {v: b for b, vs in bloques.items() for v in vs}
chips = dict(x.split('|', 1) for x in meta['chips'])
indice = collections.defaultdict(list)
for x in meta['index']:
    v, t = x.split('|', 1); indice[v].append(t)
niveles = meta['niveles']
FAMILIAS = {  # data-* que expresan una acción, con nombre legible
 'data-open-species': 'abrir ficha de especie', 'data-map-select': 'elegir taxón en el mapa', 'data-map-lens': 'lente regional del mapa',
 'data-map-layer': 'capa del mapa', 'data-map-zoom': 'zoom del mapa', 'data-map-toggle': 'mostrar/ocultar en el mapa', 'data-v34-fauna': 'fauna asociada',
 'data-africa-region': 'elegir región africana', 'data-africa-question-region': 'pregunta por región', 'data-america-site': 'elegir yacimiento americano',
 'data-asia-case': 'caso asiático', 'data-europe-case': 'caso europeo', 'data-clima-layer': 'capa climática', 'data-clima-scale': 'escala temporal del clima',
 'data-doi-open': 'abrir DOI', 'data-m19-cell': 'celda bioma × periodo', 'data-node': 'nodo del cladograma', 'data-soc-open': 'abrir debate socrático',
 'data-soc-thesis': 'elegir tesis', 'data-strat-site': 'elegir yacimiento estratigráfico', 'data-strat-layer': 'elegir capa', 'data-strat-toggle-inference': 'mostrar inferencia',
 'data-strat-toggle-compare': 'comparar yacimientos', 'data-tapho-region': 'región anatómica', 'data-tapho-var': 'variable tafonómica', 'data-tapho-species': 'taxón tafonómico',
 'data-introg-event': 'evento de introgresión', 'data-coex-filter': 'filtro de coexistencia', 'data-v34-dispersal-speed': 'velocidad del simulador',
 'data-dispersal-play': 'reproducir dispersión', 'data-dispersal-time': 'tiempo del simulador', 'data-builder-species': 'añadir especie al constructor',
 'data-builder-action': 'acción del constructor', 'data-builder-model': 'cargar modelo', 'data-builder-search': 'filtrar especies del constructor',
 'data-builder-reference-node': 'nodo de referencia', 'data-dating-method': 'elegir método de datación', 'data-dating-site': 'elegir yacimiento de datación',
 'data-primate-choice': 'elegir primate', 'data-teaching-export': 'descargar plantilla/exportación', 'data-sa-param': 'parámetro de situación de aprendizaje',
 'data-sa-generate': 'generar situación de aprendizaje', 'data-sa-export': 'exportar situación de aprendizaje TXT', 'data-pbnm-external': 'enlace externo (Nutcracker)',
 'data-copy-link': 'copiar enlace', 'data-resource-link-filter': 'filtro de recursos', 'data-pbnm-view': 'vista del archivo Nutcracker', 'data-pbnm-search': 'buscar en el archivo Nutcracker',
 'data-itinerary-select': 'elegir itinerario', 'data-view': 'ir a otra vista', 'data-target-view': 'siguiente vista recomendada', 'data-clima-tip-title': 'información emergente del clima',
}
vistas = []
for vid, v in inv['views'].items():
    fam = collections.Counter(); ejemplos = collections.defaultdict(list); acciones = collections.OrderedDict(); entradas = []
    for c in v['ctl']:
        if not c['vis']: continue
        for a, x in c['a'].items():
            if a in FAMILIAS:
                fam[a] += 1
                if len(ejemplos[a]) < 3 and c['txt']: ejemplos[a].append(c['txt'][:40])
            if a in ('data-action', 'data-pb-v50-action'): acciones[x] = c['txt'][:40]
        if c['tag'] in ('input', 'select', 'textarea'):
            entradas.append((c['a'].get('id') or c['a'].get('aria-label') or c['txt'])[:50])
    m = meta['meta'].get(vid, {})
    vistas.append({
        'id': vid, 'seccion': f'#view-{vid}', 'rotulo': chips.get(vid), 'bloque': bloque_de.get(vid), 'familiaMeta': m.get('family'),
        'titulo': m.get('title') or (v['hs'][0] if v['hs'] else ''), 'pregunta': m.get('goal'),
        'comoSeLlega': {'chipBloque': f"#pbV50Blocks [data-pb-v50-view=\"{vid}\"] (bloque «{bloque_de.get(vid)}»)", 'indicePortada': indice.get(vid, []),
                        'enlaceProfundo': f'atlas/index.html?view={vid}#main-content', 'api': f"window.switchView('{vid}')"},
        'niveles': [n for n, vs in niveles.items() if vs is None or vid in vs],
        'encabezados': v['hs'][:6], 'muestra': {'svg': v['svg'], 'canvas': v['canvas'], 'tablas': v['tables'], 'imagenes': v['imgs'], 'caracteres': v['txtLen'], 'altoPx1366': v['h']},
        'controlesVisibles': v['nvis'],
        'funciones': [{'atributo': a, 'que': FAMILIAS[a], 'n': n, 'ejemplos': ejemplos[a]} for a, n in fam.most_common()],
        'acciones': [{'accion': k, 'rotulo': t} for k, t in acciones.items()], 'entradas': entradas,
        'humo': {k: humo['vistas'].get(vid, {}).get(k) for k in ('ok', 'via', 'excepciones')},
    })
glob = {
 'portada': {'selector': '#pb-hub', 'funciones': ['5 bloques (data-hub-block) que abren su lista de herramientas (#pb-hub-tools-grid) con «← Volver a los bloques»', 'Índice completo del atlas (#pb-landing-index-grid, 32 accesos)', 'Laboratorio de observación (3 evidencias → filogenia, tafonomía, introgresión)', 'Elige la profundidad: Recorrido esencial (enlace a recorrido/) / Laboratorio completo', 'Procedencia y licencias de las imágenes de portada (details)', 'Barra «Ir directamente al atlas interactivo» (#pb-skip-intro-bar) y «o entrar directamente…» (#pb-hub-skip)', 'Enlace de salto «Saltar al contenido principal»'],
             'humo': {k: humo['funciones'][k]['ok'] for k in ('portada.bloque', 'portada.indice', 'entrar')}},
 'barraBloques': {'selector': '#pbV50Blocks', 'funciones': ['4 pestañas de bloque (role=tab, data-pb-v50-block)', 'chips de vista por bloque (31 vistas)', 'Bibliografía', 'Glosario', 'Exportar (CSV de especies visibles)', 'Diagnóstico (runSelfAudit)'], 'chipsPorBloque': bloques},
 'consultaYFiltros': {'selector': '.v36-workspace-shell (barra «Consulta y filtros»)', 'funciones': ['Buscar (#searchInput; atajo «/»; filtra el catálogo y el contador)', 'Modo clase (activateClassMode; conmuta class-mode-active, cambia a nivel básico y a Centro docente)', 'Limpiar filtros (resetGlobalFilters)', 'Filtros avanzados (despliega clado: Todos/Basales/Australopithecus/Paranthropus/Homo y filtro temporal con dos deslizadores y 3 preajustes)', 'Nivel de complejidad (#nivelEducativo: Doctorado/Universitario/Básico)', 'Orientación de la vista actual (#viewOrientation: rango, título, familia, pregunta)', 'Resumen de filtros activos (#activeFilterSummary, aria-live)', 'Volver atrás (data-back-action; historial de 40 vistas)']},
 'cajonHerramientas': {'selector': '#pb-mobile-tools-toggle → #pb-floating-tools + #pb-a11y-toolbar-root', 'funciones': ['Síntesis de sesión', 'Modo presentación', 'Autoevaluación (examen clásico, 10 preguntas, exportar progreso .txt)', 'Glosario', 'Matriz de caracteres', 'Comparador', 'Gráfico de encefalización (estadísticas)', 'Bibliografía', 'Exportar CSV de especies visibles', 'Imprimir ficha o vista actual', 'Guía del alumnado', 'Simulación de daltonismo: Normal/Deut./Prot./Achr.', 'Contraste alto', 'A−/A+ (tamaño de letra, 100 % visible)', 'Restablecer accesibilidad (↺)', 'Buscar (búsqueda global)'], 'aparece': 'solo tras entrar al área de trabajo (body.pb-workspace-entered)'},
 'otros': ['Volver arriba (.scroll-top-btn)', 'Insignia «PaleoBot» (#pb-v55-badge)', 'Información emergente del clima (#climaTooltip) y del glosario (#glossFloatTip)', 'Hoja de impresión académica (#academicPrintSheet)', 'Filtros SVG de daltonismo (#pb-colorblind-filters)'],
 'ocultosEnElDOM': ['.main-cover.paleobot-cover-v45 (portada v45 con nav y 6 módulos)', '.v35-block-portal-shell', '#pbV50Hero', '.header (portada antigua con buscador #landingSearchInput)', '.v34-pro-dashboard', '.atlas-workbench', '.design-entry-panel', '.visual-use-guide', '.quick-start-panel', '.learning-compass', '.persona-guide-panel', '.paleogenomics-entry-panel', '.complexity-guide', '#deaWelcome (bienvenida DEA con objetivos, rúbrica e «Empezar aquí (Itinerario I — DEA)»)', '.toolbar antigua (nav-objective-strip, nav-family-strip, view-switch con 31 botones .view-btn, filtros de clado, filtro temporal)'],
}
dialogos = []
for k in ('ficha', 'ficha.pestanas', 'comparar', 'bibliografia', 'glosario', 'examen', 'matriz', 'estadisticas', 'sintesis', 'guia', 'busqueda.global', 'presentacion', 'socratico', 'paleolab'):
    f = humo['funciones'].get(k, {})
    dialogos.append({'funcion': k, 'ok': f.get('ok'), 'focoEntra': (f.get('abierto') or {}).get('focoDentro'), 'tabulacionesFuera25': f.get('tabFuera'), 'escapeCierra': f.get('cierraConEscape'), 'focoVuelve': f.get('focoVuelve'), 'extra': f.get('extra')})
selectores = {'ficha': '#detailView', 'comparar': '#compareModal', 'bibliografia': '#biblioModal', 'glosario': '#glossaryModal', 'examen': '#examModal', 'matriz': '#matrixModal', 'estadisticas': '#statsModal', 'sintesis': '#sessionSynthesisModal', 'guia': '#studentGuideModal', 'busqueda.global': '#globalSearchModal', 'presentacion': '#presOverlay (+ #presMapModal «Ampliar mapa»)', 'socratico': '#socraticOverlay', 'paleolab': '#splDialog (PaleoLab 50: comparador, modos, filtros, búsqueda, zoom, ficha completa, visor 3D)', 'otros': ['#lightbox', '#researchGapModal («¿Qué no sabemos aún?»)', '#pbV50MapModal', '#matrixModal']}
funciones = {k: {kk: vv for kk, vv in f.items() if kk in ('ok', 'error', 'archivo', 'excepciones', 'excepcionesPlay', 'resultado', 'estado', 'universitario', 'basico', 'doctorado', 'antes', 'homo', 'homo2Ma', 'trasLimpiar', 'llamadas')} for k, f in humo['funciones'].items()}
res = {'fuente': 'medición en Chromium (Playwright) a 1366×800 sobre c971001; ver 07_scripts', 'totales': {'vistas': len(vistas), 'dialogos': 14, 'accionesGlobales': 22, 'funcionesHumo': len(humo['funciones'])},
       'vistas': vistas, 'global': glob, 'dialogos': dialogos, 'selectoresDialogo': selectores, 'atajos': ['«/» enfoca el buscador', 'Escape cierra diálogos', 'Flechas en pestañas de la ficha', 'Flecha derecha avanza en presentación', 'Tab/Mayús+Tab'],
       'exportaciones': ['CSV de especies visibles (paleobot_AAAA-MM-DD.csv)', 'SVG de filogenia (paleobot-cladograma-AAAAMMDD.svg)', 'SVG del constructor', 'TXT de situación de aprendizaje', '10 plantillas TXT/CSV del Centro docente (data-teaching-export)', 'Progreso del examen (.txt)', 'Imprimir ficha (window.print + #academicPrintSheet)', 'Exportar presentación/ficha/académica (v47: data-v47-export*)'],
       'funcionesHumo': funciones, 'enlacesProfundos': 'atlas/index.html?view=<id>#main-content (077-integrated-route-bridge)'}
json.dump(res, open(OUT, 'w'), ensure_ascii=False, indent=1)
print(len(vistas), sum(len(v['funciones']) + len(v['acciones']) + len(v['entradas']) for v in vistas))
