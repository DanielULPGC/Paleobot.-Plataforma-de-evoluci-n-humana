// Pasos reutilizables del atlas (PB-GH-11). Cada paso ejerce una función REAL de la interfaz (clic, teclado)
// y devuelve observaciones comparables (sin capturas). Los usan humo.cjs (JSON comparable) y recorrido.cjs
// (capturas y piso). Convención de resultado: { paso, ok, [items: {nombre: bool}], [campos de diálogo] }.
// Campos de diálogo (probarDialogo): abre, focoEntra, cierraConEscape, focoVuelve, ariaHiddenAbierto, tabFuera.
'use strict';

const VISTAS = ['timeline', 'tree', 'phylo', 'contexto', 'clima', 'paleoecologia', 'continentes', 'africa', 'america',
  'asia', 'europe', 'map', 'yacimientos', 'debates', 'socratico', 'estratigrafia', 'tafonomia', 'introgresion',
  'genomica', 'paleoproteomica', 'holotipos', 'coexistencias', 'revisiones', 'dispersal', 'constructor', 'datacion',
  'primatologia', 'aula', 'recursos', 'itinerarios', 'biogeo'];

// Estado de un diálogo y del foco (para medir entrada, trampa, Escape y retorno).
async function estadoDialogo(page, sel) {
  return page.evaluate((sel) => {
    const d = document.querySelector(sel);
    if (!d) return { existe: false };
    const r = d.getBoundingClientRect(); const s = getComputedStyle(d);
    const visible = r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && s.opacity !== '0';
    const a = document.activeElement;
    // aria-hidden en el propio diálogo o en un antecesor: para un lector de pantalla no existe.
    let oculto = false; for (let e = d; e && e !== document; e = e.parentElement) if (e.getAttribute && e.getAttribute('aria-hidden') === 'true') { oculto = true; break; }
    return { existe: true, visible, activa: d.classList.contains('active') || d.hasAttribute('open'), ariaHidden: d.getAttribute('aria-hidden'), ariaHiddenEfectivo: oculto,
      focoDentro: !!(a && d.contains(a)), foco: a ? (a.id || a.tagName.toLowerCase()) + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : '') : null,
      texto: visible ? d.innerText.replace(/\s+/g, ' ').trim().length : 0 };
  }, sel);
}

async function foco(page) {
  return page.evaluate(() => { const a = document.activeElement; if (!a) return null; return (a.id || a.tagName.toLowerCase()) + (a.dataset && (a.dataset.action || a.dataset.pbV50Action) ? '[' + (a.dataset.action || a.dataset.pbV50Action) + ']' : '') + (a.className && typeof a.className === 'string' ? '.' + a.className.split(' ')[0] : ''); });
}

async function visible(page, sel) {
  const h = await page.$(sel); if (!h) return false; try { return await h.isVisible(); } catch (e) { return false; }
}

// PB-GH-11 (T3): desde la barra de trabajo (L2), las pestañas de familia, los chips de vista y, en teléfono,
// las herramientas rápidas viven en el panel «Vistas» (#pbBarraPanel), cerrado por defecto. Si el control
// pedido no está a la vista y existe el botón «Vistas», se abre el panel como lo haría el alumnado. En
// versiones anteriores (sin el botón) no hace nada: el humo sigue midiendo la línea base igual que antes.
async function asegurarVistas(page, sel) {
  if (sel && (await visible(page, sel))) return false;
  const b = await page.$('#pbBarraVistasBoton');
  if (!b || !(await b.isVisible().catch(() => false))) return false;
  if ((await b.getAttribute('aria-expanded')) !== 'true') { await b.click().catch(() => {}); await page.waitForTimeout(300); }
  return true;
}

// PB-GH-11 (T4): la franja «Consulta y filtros» (L2) pliega en teléfono y tableta «Modo clase», «Limpiar
// filtros», «Filtros avanzados» y el nivel bajo «Más opciones» (#pbConsultaMas). Si el control pedido no está
// a la vista y existe ese botón, se despliega como lo haría el alumnado. Sin el botón (línea base), nada.
async function asegurarConsulta(page, sel) {
  if (sel && (await visible(page, sel))) return false;
  const b = await page.$('#pbConsultaMas');
  if (!b || !(await b.isVisible().catch(() => false))) return false;
  if ((await b.getAttribute('aria-expanded')) !== 'true') { await b.click().catch(() => {}); await page.waitForTimeout(250); }
  return true;
}

// Abre un diálogo con un clic real y mide foco, trampa de Tab, Escape y retorno del foco.
// abrirSel: selector del disparador; dialogoSel: selector del diálogo.
async function probarDialogo(page, nombre, abrirSel, dialogoSel, extra) {
  const out = { paso: nombre, ok: false };
  try {
    const btn = await page.$(abrirSel);
    if (!btn) { out.error = 'sin disparador ' + abrirSel; out.abre = false; return out; }
    if (!(await btn.isVisible())) { out.disparadorOculto = true; }
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.focus().catch(() => {});
    const opener = await foco(page);
    await btn.click({ timeout: 3000, force: !!out.disparadorOculto }).catch(async (e) => { out.clicError = String(e).split('\n')[0].slice(0, 120); await page.evaluate((s) => document.querySelector(s)?.click(), abrirSel).catch(() => {}); });
    // Varios módulos escriben aria-hidden y mueven el foco con temporizadores: se espera a que se asiente.
    await page.waitForTimeout(1200);
    out.abierto = await estadoDialogo(page, dialogoSel);
    out.abre = !!(out.abierto && out.abierto.visible);
    out.focoEntra = !!(out.abierto && out.abierto.focoDentro);
    out.ariaHiddenAbierto = !!(out.abierto && out.abierto.ariaHiddenEfectivo);
    if (extra) { try { out.extra = await extra(page); } catch (e) { out.extraError = String(e).split('\n')[0].slice(0, 160); } }
    // Trampa: 25 tabulaciones; ¿cuántas veces sale el foco del diálogo?
    let fuera = 0;
    for (let i = 0; i < 25; i++) { await page.keyboard.press('Tab'); const dentro = await page.evaluate((s) => { const d = document.querySelector(s); return !!(d && d.contains(document.activeElement)); }, dialogoSel); if (!dentro) fuera++; }
    out.tabFuera = fuera;
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    out.trasEscape = await estadoDialogo(page, dialogoSel);
    out.cierraConEscape = out.abre && !out.trasEscape.visible;
    if (out.abre && !out.cierraConEscape) {
      // cerrar por su botón para seguir
      await page.evaluate((s) => { const d = document.querySelector(s); const c = d && d.querySelector('.close-modal,[data-pres-close],[data-modal-toggle],[aria-label^="Cerrar"],.spl-close,button[value=close]'); if (c) c.click(); }, dialogoSel);
      await page.waitForTimeout(400);
    }
    out.focoTrasCerrar = await foco(page);
    out.disparador = opener;
    out.focoVuelve = out.abre && out.focoTrasCerrar === opener;
    out.ok = out.abre;
  } catch (e) { out.error = String(e).split('\n')[0].slice(0, 200); }
  return out;
}

async function entrar(page) {
  const out = { paso: 'entrar' };
  try { await page.click('#pb-skip-intro-bar', { timeout: 3000 }); } catch (e) { out.error = String(e).split('\n')[0].slice(0, 100); }
  await page.waitForTimeout(800);
  out.entrado = await page.evaluate(() => document.body.classList.contains('pb-workspace-entered'));
  out.foco = await foco(page);
  out.ok = out.entrado;
  return out;
}

async function abrirCajon(page) {
  const t = await page.$('#pb-mobile-tools-toggle');
  if (!t || !(await t.isVisible())) return false;
  const exp = await t.getAttribute('aria-expanded');
  if (exp !== 'true') { await t.click().catch(() => {}); await page.waitForTimeout(400); }
  return true;
}
async function cerrarCajon(page) {
  const t = await page.$('#pb-mobile-tools-toggle');
  if (t && (await t.getAttribute('aria-expanded')) === 'true') { await t.click().catch(() => {}); await page.waitForTimeout(300); }
}

// Medidas comparables de una vista: alcanzable = con los <details> de la vista abiertos (plegar bajo un
// desplegable cuenta como conservar; ocultar con display:none, no).
async function medirVista(page, id) {
  return page.evaluate((id) => {
    const s = document.getElementById('view-' + id); if (!s) return null;
    // content-visibility:auto (041-speed-guard) hace que innerText omita lo que está fuera de pantalla: para medir
    // lo alcanzable sin depender del desplazamiento se fuerza su pintado solo durante la medida.
    const cv = document.createElement('style'); cv.textContent = '#view-' + id + ' *{content-visibility:visible!important}'; document.head.appendChild(cv);
    const cerrados = [...s.querySelectorAll('details:not([open])')]; cerrados.forEach((d) => { d.open = true; });
    const vis = (e) => { const r = e.getBoundingClientRect(); const st = getComputedStyle(e); return r.width > 0 && r.height > 0 && st.display !== 'none' && st.visibility !== 'hidden'; };
    const ctl = [...s.querySelectorAll('button,a[href],input,select,textarea,summary,[role=button],[tabindex="0"]')].filter(vis);
    const r = s.getBoundingClientRect();
    const norm = (t) => t.replace(/\s+/g, ' ').trim().slice(0, 90);
    const enc = [...new Set([...s.querySelectorAll('h2,h3,h4')].filter((h) => h.getClientRects().length > 0 && getComputedStyle(h).visibility !== 'hidden').map((h) => norm(h.textContent)).filter(Boolean))];
    const texto = s.innerText.replace(/\s+/g, ' ').trim().length;
    // PB-GH-11 (T3): texto alcanzable de la cabecera de vista (hero + tarjeta de Bloom .pb-dap), con los
    // <details> abiertos. Se compara antes/después de la T3 (la línea base de la T1 no lo tiene).
    const cab = [...s.querySelectorAll('.view-hero, .pb-dap')].filter((e) => !e.parentElement.closest('.view-hero, .pb-dap'));
    const textoCabecera = cab.reduce((n, e) => n + e.innerText.replace(/\s+/g, ' ').trim().length, 0);
    const datos = { alto: Math.round(r.height), controles: ctl.length, texto, textoCabecera, encabezados: enc,
      svg: s.querySelectorAll('svg').length, canvas: s.querySelectorAll('canvas').length, imgs: s.querySelectorAll('img').length, tablas: s.querySelectorAll('table').length,
      imgsRotas: [...s.querySelectorAll('img')].filter((i) => i.complete && i.naturalWidth === 0 && vis(i)).length };
    cerrados.forEach((d) => { d.open = false; });
    cv.remove();
    datos.pintada = datos.alto > 50 && texto > 40;
    return datos;
  }, id);
}

// Navega a una vista como el alumnado: pestaña de bloque + chip de la vista si están visibles; si no, switchView.
async function irVistaUI(page, id, conMedida = true) {
  const out = { vista: id, via: '' };
  const chip = `#pbV50Blocks [data-pb-v50-view="${id}"]`;
  await asegurarVistas(page, chip);
  if (!(await visible(page, chip))) {
    for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
      const tab = await page.$(`#pbV50Blocks [data-pb-v50-block="${blq}"]`);
      if (tab && (await tab.isVisible())) { await tab.click().catch(() => {}); await page.waitForTimeout(250); if (await visible(page, chip)) break; }
    }
  }
  const errAntes = page._consola.filter((c) => c.tipo === 'pageerror').length;
  if (await visible(page, chip)) {
    await page.click(chip, { timeout: 3000 }).catch((e) => { out.clicError = String(e).split('\n')[0].slice(0, 100); });
    out.via = 'chip';
  } else {
    out.via = 'switchView';
    out.estado = await page.evaluate((id) => { try { window.switchView(id); return 'ok'; } catch (e) { return 'excepcion: ' + String(e).slice(0, 140); } }, id);
  }
  await page.waitForTimeout(700);
  out.activa = await page.evaluate((id) => !!document.getElementById('view-' + id)?.classList.contains('active'), id);
  if (!out.activa) {
    // segundo intento por la API pública (el chip pudo quedar desconectado por un repintado de la barra)
    await page.evaluate((id) => { try { window.switchView(id); } catch (e) {} }, id);
    await page.waitForTimeout(500);
    out.activa = await page.evaluate((id) => !!document.getElementById('view-' + id)?.classList.contains('active'), id);
    out.segundoIntento = true;
  }
  const nuevos = page._consola.filter((c) => c.tipo === 'pageerror').slice(errAntes);
  if (nuevos.length) out.excepciones = [...new Set(nuevos.map((c) => c.texto.slice(0, 160)))];
  if (conMedida) out.datos = await medirVista(page, id);
  out.ok = out.activa && !out.excepciones;
  return out;
}

// Recorre la vista desplazándose (carga diferida, content-visibility) y vuelve a su inicio.
async function barrerVista(page, id) {
  await page.evaluate(async (id) => {
    const s = document.getElementById('view-' + id); if (!s) return;
    const r = s.getBoundingClientRect(); const top = r.top + scrollY;
    for (let y = top; y < top + r.height; y += Math.round(innerHeight * 0.8)) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 70)); }
    window.scrollTo(0, top);
  }, id);
  await page.waitForTimeout(350);
}

// Espera una descarga provocada por `accion`; devuelve el nombre sugerido o null.
async function descarga(page, accion, ms = 4000) {
  let nombre = null;
  const dl = page.waitForEvent('download', { timeout: ms }).then((d) => { nombre = d.suggestedFilename(); return d.cancel().catch(() => {}); }).catch(() => {});
  await accion();
  await dl;
  return nombre;
}

async function abrirFicha(page, id) {
  await irVistaUI(page, 'timeline', false);
  await page.evaluate((id) => document.querySelector(`#view-timeline [data-open-species="${id}"]`)?.scrollIntoView({ block: 'center' }), id);
  await page.click(`#view-timeline [data-open-species="${id}"]`, { timeout: 3000 }).catch(async () => { await page.evaluate((id) => document.querySelector(`#view-timeline [data-open-species="${id}"]`)?.click(), id); });
  await page.waitForTimeout(1200);
  return (await estadoDialogo(page, '#detailView')).visible;
}

async function abrirDesdeCajon(page, accion) {
  await abrirCajon(page);
  await page.evaluate((a) => document.querySelector(`#pb-floating-tools [data-action="${a}"]`)?.click(), accion);
  await page.waitForTimeout(800);
}

// ---------- Funciones del inventario (cada una devuelve {paso, ok, ...}) ----------
const FUNCIONES = {
  async 'portada.bloque'(page) {
    const out = { paso: 'portada.bloque' };
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.click('.pb-hub-card[data-hub-block="cronologia"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(500);
    out.herramientas = await page.$$eval('#pb-hub-tools-grid button, #pb-hub-tools-grid a', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.innerText.replace(/\s+/g, ' ').trim().slice(0, 40)));
    await page.click('#pb-hub-back', { timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(300);
    out.ok = out.herramientas.length > 0;
    return out;
  },
  async 'portada.indice'(page) {
    const n = await page.$$eval('#pb-landing-index-grid button, #pb-landing-index-grid a', (b) => b.map((x) => (x.dataset.hubView || x.dataset.view || x.getAttribute('href') || '') + '|' + x.innerText.trim().slice(0, 30)));
    return { paso: 'portada.indice', enlaces: n.length, destinos: n, ok: n.length > 0 };
  },
  async 'bloques'(page) {
    const out = { paso: 'bloques', chips: {} };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
      await asegurarVistas(page, `#pbV50Blocks [data-pb-v50-block="${blq}"]`);
      await page.click(`#pbV50Blocks [data-pb-v50-block="${blq}"]`, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
      out.chips[blq] = await page.$$eval('#pbV50Blocks [data-pb-v50-view]', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.dataset.pbV50View));
    }
    out.totalVistasEnChips = new Set(Object.values(out.chips).flat()).size;
    out.items = Object.fromEntries(VISTAS.map((v) => [v, Object.values(out.chips).some((l) => l.includes(v))]));
    out.ok = Object.values(out.chips).every((v) => v.length > 0);
    return out;
  },
  // PB-GH-11 (T3): los 31 accesos desde la navegación (panel «Vistas» si existe; si no, la barra de bloques
  // como en la línea base), con ratón: cada chip se pulsa y su vista debe activarse. Mide además el alto de
  // la barra y si queda fija arriba al desplazarse.
  async 'barra.vistas'(page) {
    // items sin prototipo: una vista se llama «constructor» y {}.constructor es una función (verdadero).
    const out = { paso: 'barra.vistas', items: Object.create(null) };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await page.waitForTimeout(300);
    out.barra = await page.evaluate(async () => {
      const b = document.getElementById('pbV50Blocks'); if (!b) return null;
      const alto = Math.round(b.getBoundingClientRect().height);
      window.scrollBy(0, 2500); await new Promise((r) => setTimeout(r, 250));
      const top = Math.round(b.getBoundingClientRect().top);
      return { alto, topTrasDesplazar: top, fija: top === 0 };
    });
    for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
      const tab = `#pbV50Blocks [data-pb-v50-block="${blq}"]`;
      await asegurarVistas(page, tab);
      await page.click(tab, { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(350);
      const chips = await page.$$eval('#pbV50Blocks [data-pb-v50-view]', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).map((x) => x.dataset.pbV50View));
      for (const v of chips) {
        if (out.items[v]) continue;
        const sel = `#pbV50Blocks [data-pb-v50-view="${v}"]`;
        await asegurarVistas(page, sel);
        if (!(await visible(page, sel))) { await asegurarVistas(page, tab); await page.click(tab, { timeout: 3000 }).catch(() => {}); await page.waitForTimeout(300); }
        await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
        await page.waitForTimeout(450);
        out.items[v] = await page.evaluate((v) => !!document.getElementById('view-' + v)?.classList.contains('active'), v);
      }
    }
    // Segunda pasada para las vistas que no aparecieron en la primera lectura de chips (repintados tardíos).
    for (const v of VISTAS.filter((x) => !out.items[x])) {
      const sel = `#pbV50Blocks [data-pb-v50-view="${v}"]`;
      for (const blq of ['explorar', 'interpretar', 'investigar', 'aprender']) {
        const tab = `#pbV50Blocks [data-pb-v50-block="${blq}"]`;
        await asegurarVistas(page, tab);
        await page.click(tab, { timeout: 3000 }).catch(() => {});
        await page.waitForTimeout(700);
        if (await visible(page, sel)) break;
      }
      if (await visible(page, sel)) {
        await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
        await page.waitForTimeout(600);
        out.items[v] = await page.evaluate((v) => !!document.getElementById('view-' + v)?.classList.contains('active'), v);
      } else out.items[v] = false;
    }
    out.alcanzables = Object.values(out.items).filter(Boolean).length;
    out.ok = out.alcanzables === VISTAS.length;
    return out;
  },
  // PB-GH-11 (T3): elegir vista con el teclado (Intro en la pestaña de familia y en el chip): ¿dónde queda el
  // foco? Debe quedar en el chip de la vista elegida (fila 6), no en <body>; y la vista se anuncia
  // (aria-current="page"). En la línea base el foco caía en <body>.
  async 'navegacion.teclado'(page) {
    const out = { paso: 'navegacion.teclado', items: {}, focos: {} };
    const destinos = { map: 'explorar', tree: 'interpretar', datacion: 'investigar', aula: 'aprender' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    for (const [v, blq] of Object.entries(destinos)) {
      const boton = await page.$('#pbBarraVistasBoton');
      if (boton && (await boton.getAttribute('aria-expanded')) !== 'true') { await boton.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(300); }
      await page.focus(`#pbV50Blocks [data-pb-v50-block="${blq}"]`).catch(() => {});
      await page.keyboard.press('Enter'); await page.waitForTimeout(600);
      await page.focus(`#pbV50Blocks [data-pb-v50-view="${v}"]`).catch(() => {});
      await page.keyboard.press('Enter'); await page.waitForTimeout(900);
      const r = await page.evaluate((v) => { const a = document.activeElement; return { foco: (a.dataset && a.dataset.pbV50View) || a.tagName.toLowerCase(), actual: a.getAttribute && a.getAttribute('aria-current'), activa: !!document.getElementById('view-' + v)?.classList.contains('active') }; }, v);
      out.focos[v] = r;
      out.items[v + ' · foco en el chip'] = r.foco === v;
      out.items[v + ' · aria-current'] = r.actual === 'page';
      out.items[v + ' · vista activa'] = r.activa;
    }
    out.ok = Object.entries(out.items).filter(([k]) => k.endsWith('vista activa')).every(([, b]) => b);
    return out;
  },
  async 'buscador.barra'(page) {
    const out = { paso: 'buscador.barra' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    const inp = await page.$('#searchInput');
    out.visible = inp ? await inp.isVisible() : false;
    await page.evaluate(() => document.activeElement?.blur());
    await page.keyboard.press('/');
    await page.waitForTimeout(200);
    out.atajoBarra = await foco(page);
    if (inp) { await inp.fill('').catch(() => {}); await inp.type('afarensis', { delay: 15 }).catch(() => {}); await page.waitForTimeout(900); }
    out.resultado = await page.evaluate(() => {
      const gs = document.getElementById('globalSearchModal');
      const vis = (e) => e && e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      const tl = [...document.querySelectorAll('#view-timeline [data-open-species]')].filter(vis).length;
      return { modalBusqueda: vis(gs), itemsCronologiaVisibles: tl, contador: document.getElementById('countLabel')?.innerText || '' };
    });
    await page.keyboard.press('Escape');
    out.items = { atajo: /searchInput/.test(out.atajoBarra || ''), filtra: out.resultado.modalBusqueda || out.resultado.itemsCronologiaVisibles > 0 };
    out.ok = out.items.filtra;
    return out;
  },
  async 'filtros.clado'(page) {
    const out = { paso: 'filtros.clado' };
    const contar = () => page.evaluate(() => [...document.querySelectorAll('#view-timeline [data-open-species]')].filter((e) => e.getBoundingClientRect().width > 0).length);
    await irVistaUI(page, 'timeline', false);
    out.antes = await contar();
    await asegurarConsulta(page, '[data-pb-v50-filter-toggle]');
    const tog = await page.$('[data-pb-v50-filter-toggle]');
    if (tog && (await tog.isVisible())) { await tog.click().catch(() => {}); await page.waitForTimeout(400); }
    const chip = await page.$('[data-clade-filter="homo"]');
    if (chip && (await chip.isVisible())) { await chip.click().catch(() => {}); await page.waitForTimeout(600); out.homo = await contar(); }
    const pre = await page.$('[data-time-preset="2,2"]');
    if (pre && (await pre.isVisible())) { await pre.click().catch(() => {}); await page.waitForTimeout(600); out.homo2Ma = await contar(); }
    const reset = await page.$('[data-action="resetGlobalFilters"]');
    if (reset && (await reset.isVisible())) { await reset.click().catch(() => {}); await page.waitForTimeout(600); }
    out.trasLimpiar = await contar();
    out.items = { clado: out.homo !== undefined && out.homo < out.antes, tiempo: out.homo2Ma !== undefined && out.homo2Ma <= (out.homo || 0), limpiar: out.trasLimpiar === out.antes };
    out.ok = out.items.clado && out.items.limpiar;
    return out;
  },
  async 'nivel'(page) {
    const out = { paso: 'nivel' };
    await asegurarConsulta(page, '#nivelEducativo');
    await asegurarVistas(page, '#pbV50Blocks [data-pb-v50-view]');
    const n = () => page.$$eval('#pbV50Blocks [data-pb-v50-view]', (b) => b.filter((x) => x.getBoundingClientRect().width > 0).length);
    out.universitario = await n();
    let err = null;
    await page.selectOption('#nivelEducativo', 'basico').catch((e) => { err = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(600); out.basico = await n();
    out.valorBasico = await page.$eval('#nivelEducativo', (s) => s.value).catch(() => null);
    await page.selectOption('#nivelEducativo', 'doctorado').catch(() => {}); await page.waitForTimeout(600); out.doctorado = await n();
    await page.selectOption('#nivelEducativo', 'universitario').catch(() => {}); await page.waitForTimeout(600);
    if (err) out.error = err;
    out.ok = !err && out.valorBasico === 'basico';
    return out;
  },
  async 'ficha'(page) {
    await irVistaUI(page, 'timeline', false); await barrerVista(page, 'timeline');
    return probarDialogo(page, 'ficha', '#view-timeline [data-open-species="afarensis"]', '#detailView', async (p) => p.evaluate(() => {
      const d = document.getElementById('detailView');
      const vis = (e) => e.getBoundingClientRect().width > 0 && getComputedStyle(e).display !== 'none';
      return { titulo: document.getElementById('detailViewTitle')?.innerText.slice(0, 60), pestanas: [...d.querySelectorAll('[role=tab]')].filter(vis).map((t) => t.innerText.trim().slice(0, 30)),
        imgs: [...d.querySelectorAll('img')].filter(vis).length, leaflet: !!d.querySelector('.leaflet-container') };
    }));
  },
  async 'ficha.pestanas'(page) {
    const out = { paso: 'ficha.pestanas', items: {} };
    await abrirFicha(page, 'neander');
    const tabs = await page.$$('#detailView [role=tab]');
    for (const t of tabs) {
      if (!(await t.isVisible())) continue;
      const n = (await t.innerText()).trim().slice(0, 25);
      await t.click().catch(() => {}); await page.waitForTimeout(250);
      out.items[n] = (await t.getAttribute('aria-selected')) === 'true';
    }
    if (tabs.length) { await tabs[0].focus().catch(() => {}); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(200); out.flechaDerecha = await foco(page); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(400);
    out.ok = Object.keys(out.items).length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'lightbox'(page) {
    await abrirFicha(page, 'neander');
    return probarDialogo(page, 'lightbox', '#detailView img[data-lightbox-open]', '#lightbox');
  },
  async 'ficha.lagunas'(page) {
    // «¿Qué no sabemos aún?» (#researchGapModal) desde la ficha
    await abrirFicha(page, 'neander');
    return probarDialogo(page, 'ficha.lagunas', '#detailView .research-gap-btn[data-detail-action]', '#researchGapModal');
  },
  async 'minimapa.capas'(page) {
    const out = { paso: 'minimapa.capas', items: {} };
    await abrirFicha(page, 'neander');
    out.leaflet = await page.evaluate(() => typeof window.L !== 'undefined' && !!document.querySelector('#detailView .leaflet-container'));
    const capas = await page.$$('#detailView .leaflet-control-layers-selector');
    const ctl = await page.$('#detailView .leaflet-control-layers');
    if (ctl) await ctl.hover().catch(() => {});
    for (let i = 0; i < capas.length; i++) {
      const c = capas[i];
      const nombre = await c.evaluate((e) => (e.closest('label')?.innerText || '').trim().slice(0, 30)).catch(() => '') || 'capa' + i;
      await c.click({ force: true }).catch(() => {}); await page.waitForTimeout(250);
      out.items[nombre] = await c.isChecked().catch(() => false);
    }
    await page.keyboard.press('Escape');
    out.ok = out.leaflet && capas.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'comparar'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'comparar', '#pb-floating-tools [data-action="openCompare"], [data-pb-v50-action="openCompare"]', '#compareModal', async (p) => {
      const o = {};
      const inp = await p.$('#compareModal input[type=search], #compareModal input[type=text], #compareModal input');
      for (const q of ['afarensis', 'erectus']) {
        if (!inp) break;
        await inp.fill('').catch(() => {}); await inp.type(q, { delay: 10 }).catch(() => {}); await p.waitForTimeout(400);
        const op = await p.$('#compareModal [role=option], #compareModal .cmp-picker-option, #compareModal .cmp-dropdown button, #compareModal li button');
        if (op) { await op.click().catch(() => {}); await p.waitForTimeout(400); } else { await p.keyboard.press('Enter'); await p.waitForTimeout(300); }
      }
      o.contador = await p.$eval('#cmpCountLabel', (e) => e.innerText).catch(() => '');
      return o;
    });
    await cerrarCajon(page);
    return r;
  },
  async 'bibliografia'(page) {
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await asegurarVistas(page, '#pbV50Blocks [data-pb-v50-action="abrirBiblio"]');
    return probarDialogo(page, 'bibliografia', '#pbV50Blocks [data-pb-v50-action="abrirBiblio"]', '#biblioModal', async (p) => p.evaluate(() => {
      const m = document.getElementById('biblioModal');
      return { doi: m.querySelectorAll('a[href*="doi.org"]').length };
    }));
  },
  async 'glosario'(page) {
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await asegurarVistas(page, '#pbV50Blocks [data-pb-v50-action="openGlossary"]');
    return probarDialogo(page, 'glosario', '#pbV50Blocks [data-pb-v50-action="openGlossary"]', '#glossaryModal', async (p) => {
      const inp = await p.$('#glossaryModal input');
      if (inp) { await inp.type('bipedismo', { delay: 10 }).catch(() => {}); await p.waitForTimeout(500); }
      return p.evaluate(() => ({ tarjetas: [...document.querySelectorAll('#glossaryModal .glossary-card, #glossaryModal dt, #glossaryModal article')].filter((e) => e.getBoundingClientRect().width > 0).length }));
    });
  },
  async 'examen'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'examen', '#pb-floating-tools [data-action="startExam"]', '#examModal', async (p) => {
      await p.click('#examModal [data-quiz-next="classic"]', { timeout: 2000 }).catch(() => {});
      await p.waitForTimeout(500);
      const opc = await p.$$('#examModal #examQ button');
      if (opc.length) { await opc[0].click().catch(() => {}); await p.waitForTimeout(400); }
      return { opciones: opc.length };
    });
    await cerrarCajon(page); return r;
  },
  async 'matriz'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'matriz', '#pb-floating-tools [data-action="openMatrix"]', '#matrixModal', async (p) => p.evaluate(() => ({ filas: document.querySelectorAll('#matrixTableContent tr').length }))); await cerrarCajon(page); return r; },
  async 'estadisticas'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'estadisticas', '#pb-floating-tools [data-action="abrirEstadisticas"]', '#statsModal'); await cerrarCajon(page); return r; },
  async 'sintesis'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'sintesis', '#pb-floating-tools [data-action="openSessionSynthesis"]', '#sessionSynthesisModal'); await cerrarCajon(page); return r; },
  async 'guia'(page) { await abrirCajon(page); const r = await probarDialogo(page, 'guia', '#pb-floating-tools [data-action="openStudentGuide"]', '#studentGuideModal'); await cerrarCajon(page); return r; },
  async 'guia.pestanas'(page) {
    const out = { paso: 'guia.pestanas', items: {} };
    await abrirDesdeCajon(page, 'openStudentGuide');
    const tabs = await page.$$('#studentGuideModal [data-sg-tab]');
    for (const t of tabs) {
      if (!(await t.isVisible())) continue;
      const clave = await t.getAttribute('data-sg-tab');
      await t.click().catch(() => {}); await page.waitForTimeout(300);
      out.items[clave] = await t.evaluate((e) => e.getAttribute('aria-selected') === 'true' || e.classList.contains('active'));
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = Object.keys(out.items).length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'busqueda.global'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'busqueda.global', '#pb-a11y-toolbar-root [data-action="openGlobalSearch"]', '#globalSearchModal', async (p) => {
      const inp = await p.$('#globalSearchModal input'); if (inp) { await inp.type('Olduvai', { delay: 10 }).catch(() => {}); await p.waitForTimeout(600); }
      return p.evaluate(() => ({ resultados: [...document.querySelectorAll('#globalSearchModal button, #globalSearchModal a, #globalSearchModal li')].filter((e) => e.getBoundingClientRect().width > 0).length }));
    });
    await cerrarCajon(page); return r;
  },
  async 'presentacion'(page) {
    await abrirCajon(page);
    const r = await probarDialogo(page, 'presentacion', '#pb-floating-tools [data-action="openPresentation"]', '#presOverlay', async (p) => {
      const t1 = await p.$eval('#presOverlay', (e) => e.innerText.slice(0, 80)).catch(() => '');
      await p.keyboard.press('ArrowRight'); await p.waitForTimeout(500);
      const t2 = await p.$eval('#presOverlay', (e) => e.innerText.slice(0, 80)).catch(() => '');
      return { avanzaConFlecha: t1 !== t2 };
    });
    await cerrarCajon(page); return r;
  },
  async 'presentacion.controles'(page) {
    // «Solo CC» (#presFilterBtn) y «Auto» (#presAutoBtn): cambian de estado y vuelven.
    const out = { paso: 'presentacion.controles', items: {} };
    await abrirDesdeCajon(page, 'openPresentation');
    const estado = (sel) => page.evaluate((sel) => { const b = document.querySelector(sel); const o = document.getElementById('presOverlay'); return b ? [b.getAttribute('aria-pressed'), b.className, b.innerText.trim(), (o?.querySelectorAll('.pres-dot') || []).length].join('|') : null; }, sel);
    for (const [k, sel] of [['soloCC', '#presFilterBtn'], ['auto', '#presAutoBtn']]) {
      const a = await estado(sel);
      if (a === null) { out.items[k] = false; continue; }
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(500);
      const b = await estado(sel);
      out.items[k] = a !== b;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(400);
    }
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = Object.values(out.items).every(Boolean);
    return out;
  },
  async 'presentacion.ampliarMapa'(page) {
    await abrirDesdeCajon(page, 'openPresentation');
    const r = await probarDialogo(page, 'presentacion.ampliarMapa', '#presOverlay [data-pres-map-expand]', '#presMapModal');
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    return r;
  },
  async 'exportar.csv'(page) {
    const out = { paso: 'exportar.csv' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await asegurarVistas(page, '#pbV50Blocks [data-pb-v50-action="exportToCSV"]');
    out.archivo = await descarga(page, () => page.click('#pbV50Blocks [data-pb-v50-action="exportToCSV"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'exportar.svg.filogenia'(page) {
    const out = { paso: 'exportar.svg.filogenia' };
    await irVistaUI(page, 'phylo', false);
    out.archivo = await descarga(page, () => page.click('#view-phylo [data-action="exportPhyloSvg"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'exportar.svg.constructor'(page) {
    const out = { paso: 'exportar.svg.constructor' };
    await irVistaUI(page, 'constructor', false);
    const esp = await page.$$('#view-constructor [data-builder-species]');
    for (const b of esp.slice(0, 2)) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(300); }
    out.archivo = await descarga(page, () => page.click('#view-constructor [data-action="exportBuilderSvg"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }));
    out.ok = !!out.archivo; return out;
  },
  async 'aula.exportaciones'(page) {
    // Las 10 exportaciones del Centro docente (data-teaching-export)
    const out = { paso: 'aula.exportaciones', items: {}, archivos: {} };
    await irVistaUI(page, 'aula', false);
    const claves = await page.$$eval('#view-aula [data-teaching-export]', (b) => b.map((x) => x.dataset.teachingExport));
    for (const k of claves) {
      const sel = `#view-aula [data-teaching-export="${k}"]`;
      await page.evaluate((s) => document.querySelector(s)?.scrollIntoView({ block: 'center' }), sel);
      const f = await descarga(page, () => page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel)));
      out.items[k] = !!f; out.archivos[k] = f;
    }
    out.total = claves.length;
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'recursos.filtros'(page) {
    const out = { paso: 'recursos.filtros', items: {}, visibles: {} };
    await irVistaUI(page, 'recursos', false);
    const claves = await page.$$eval('#view-recursos [data-resource-link-filter]', (b) => b.map((x) => x.dataset.resourceLinkFilter));
    for (const k of claves) {
      const sel = `#view-recursos [data-resource-link-filter="${k}"]`;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(300);
      const r = await page.evaluate((s) => { const b = document.querySelector(s); const vis = [...document.querySelectorAll('#view-recursos [data-copy-link]')].filter((e) => e.getBoundingClientRect().width > 0).length; return { activo: !!b && (b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true'), vis }; }, sel);
      out.items[k] = r.activo; out.visibles[k] = r.vis;
    }
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'recursos.copiarEnlace'(page) {
    const out = { paso: 'recursos.copiarEnlace' };
    await irVistaUI(page, 'recursos', false);
    await page.evaluate(() => {
      window.__copiado = [];
      try { const c = navigator.clipboard; if (c) { c.writeText = (t) => { window.__copiado.push(String(t)); return Promise.resolve(); }; } } catch (e) {}
      const ex = document.execCommand.bind(document); document.execCommand = (cmd, ...r) => { if (cmd === 'copy') window.__copiado.push('execCommand:' + (document.getSelection()?.toString() || '')); return ex(cmd, ...r); };
    });
    const b = await page.$('#view-recursos [data-copy-link]');
    const esperado = b ? await b.getAttribute('data-copy-link') : null;
    const antes = b ? await b.innerText() : '';
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.copiado = await page.evaluate(() => window.__copiado);
    out.rotuloCambia = b ? (await b.innerText().catch(() => antes)) !== antes : false;
    out.ok = !!esperado && out.copiado.some((t) => t.includes(esperado));
    return out;
  },
  async 'imprimir'(page) {
    const out = { paso: 'imprimir' };
    await page.evaluate(() => { window.__printCalls = 0; window.print = () => { window.__printCalls++; }; });
    await abrirCajon(page);
    await page.click('#pb-floating-tools [data-action="printFicha"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(500); out.llamadas = await page.evaluate(() => window.__printCalls);
    await cerrarCajon(page); out.ok = out.llamadas > 0; return out;
  },
  async 'diagnostico'(page) {
    // Hoy (línea base) solo produce algo visible dentro de Centro docente (04, fila 19).
    const out = { paso: 'diagnostico' };
    await page.evaluate(() => document.getElementById('main-content')?.scrollIntoView());
    await asegurarVistas(page, '#pbV50Blocks [data-pb-v50-action="runSelfAudit"]');
    await page.click('#pbV50Blocks [data-pb-v50-action="runSelfAudit"]', { timeout: 3000 }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); });
    await page.waitForTimeout(800);
    out.informeVisible = await page.evaluate(() => { const r = document.getElementById('teachingAuditReport'); return !!r && r.getBoundingClientRect().width > 0 && r.innerText.trim().length > 20; });
    out.dialogos = await page.evaluate(() => [...document.querySelectorAll('.modal-overlay.active,.pb-v50-modal.active')].filter((e) => e.getBoundingClientRect().width > 0).map((e) => e.id));
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    out.ok = out.informeVisible || out.dialogos.length > 0; return out;
  },
  async 'accesibilidad'(page) {
    const out = { paso: 'accesibilidad', items: {} };
    await abrirCajon(page);
    const raiz = () => page.evaluate(() => ({ fs: getComputedStyle(document.documentElement).fontSize, cls: document.documentElement.className }));
    out.inicio = await raiz();
    const pulsar = async (sel) => { const b = await page.$(sel); if (b && (await b.isVisible())) { await b.click().catch(() => {}); await page.waitForTimeout(300); return await raiz(); } return null; };
    out.amas = await pulsar('#pb-a11y-toolbar-root [data-font-action="increase"], #pb-a11y-toolbar-root button[aria-label="Aumentar tamaño de fuente"]');
    out.items.aumentar = !!out.amas && out.amas.fs !== out.inicio.fs;
    out.reset = await pulsar('#pb-a11y-toolbar-root [data-font-action="reset"], #pb-a11y-toolbar-root button[aria-label="Restablecer tamaño de fuente"]');
    out.items.restablecer = !!out.reset && out.reset.fs === out.inicio.fs;
    out.contraste = await pulsar('#pb-a11y-toolbar-root button:has-text("Contraste"), [data-action="toggleHighContrast"]');
    out.items.contraste = !!out.contraste && /contrast/.test(out.contraste.cls);
    if (out.items.contraste) await pulsar('#pb-a11y-toolbar-root button:has-text("Contraste"), [data-action="toggleHighContrast"]');
    await cerrarCajon(page);
    out.ok = out.items.aumentar; return out;
  },
  async 'daltonismo'(page) {
    // Simulación de daltonismo: botones [data-color-mode] del cajón (Normal, Deut., Prot., Achr., …)
    const out = { paso: 'daltonismo', items: {}, estados: {} };
    await abrirCajon(page);
    const modos = await page.$$eval('#pb-a11y-toolbar-root [data-color-mode]', (b) => b.map((x) => x.dataset.colorMode));
    const estado = () => page.evaluate(() => [document.documentElement.className, document.body.className.split(' ').filter((c) => /cvd|deut|prot|trit|achr|color|daltoni/i.test(c)).join(' '), getComputedStyle(document.documentElement).filter, getComputedStyle(document.body).filter, document.documentElement.dataset.colorMode || '', document.body.dataset.colorMode || ''].join('|'));
    const inicial = await estado();
    for (const m of modos) {
      const sel = `#pb-a11y-toolbar-root [data-color-mode="${m}"]`;
      await page.click(sel, { timeout: 3000 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), sel));
      await page.waitForTimeout(300);
      const e = await estado(); out.estados[m] = e;
      const pulsado = await page.$eval(sel, (b) => b.classList.contains('active') || b.getAttribute('aria-pressed') === 'true').catch(() => false);
      out.items[m] = pulsado && (m === 'normal' || m === 'none' ? true : e !== inicial);
    }
    if (modos.length) { const n = modos[0]; await page.evaluate((s) => document.querySelector(s)?.click(), `#pb-a11y-toolbar-root [data-color-mode="${n}"]`); }
    await cerrarCajon(page);
    out.ok = modos.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'modo.clase'(page) {
    const out = { paso: 'modo.clase' };
    await asegurarConsulta(page, '.v36-workspace-shell [data-action="activateClassMode"]');
    const b = await page.$('.v36-workspace-shell [data-action="activateClassMode"]');
    out.visible = b ? await b.isVisible() : false;
    if (b) { await b.click({ force: !out.visible }).catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(700); }
    out.activa = await page.evaluate(() => document.body.classList.contains('class-mode-active'));
    if (b) { await b.click({ force: true }).catch(() => {}); await page.waitForTimeout(500); }
    out.trasSegundoClic = await page.evaluate(() => document.body.classList.contains('class-mode-active'));
    out.items = { activa: out.activa, desactiva: out.activa && !out.trasSegundoClic };
    out.ok = !!b && out.activa; return out;
  },
  async 'volver'(page) {
    const out = { paso: 'volver' };
    await irVistaUI(page, 'timeline', false); await irVistaUI(page, 'map', false);
    const b = await page.$('[data-back-action]');
    out.visible = b ? await b.isVisible() : false;
    if (b && out.visible) { await b.click().catch(() => {}); await page.waitForTimeout(500); }
    else await page.evaluate(() => document.querySelector('[data-back-action]')?.click());
    out.vista = await page.evaluate(() => document.querySelector('.view-section.active')?.id);
    out.ok = out.vista === 'view-timeline'; return out;
  },
  async 'mapa.yacimiento'(page) {
    const out = { paso: 'mapa.yacimiento', items: {} };
    await irVistaUI(page, 'map', false);
    const pts = await page.$$('#view-map [data-map-select]');
    const vis = []; for (const p of pts) if (await p.isVisible()) vis.push(p);
    out.puntosVisibles = vis.length;
    if (vis.length) { await vis[Math.min(5, vis.length - 1)].click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(600); }
    for (const sel of ['[data-map-zoom]', '[data-map-layer]', '[data-map-toggle]']) { const b = await page.$(`#view-map ${sel}`); out.items[sel] = !!(b && (await b.isVisible())); if (out.items[sel]) { await b.click().catch(() => {}); await page.waitForTimeout(300); } }
    out.ok = out.puntosVisibles > 0; return out;
  },
  async 'mapa.lentes'(page) {
    // Lente regional del mapa: 5 botones [data-map-lens] con rótulo
    const out = { paso: 'mapa.lentes', items: {} };
    await irVistaUI(page, 'map', false);
    const claves = await page.$$eval('#view-map button[data-map-lens]', (b) => [...new Set(b.filter((x) => x.innerText.trim()).map((x) => x.dataset.mapLens))]);
    for (const k of claves) {
      const sel = `#view-map button[data-map-lens="${k}"]`;
      const b = page.locator(sel).filter({ hasText: /\S/ }).first();
      await b.scrollIntoViewIfNeeded().catch(() => {});
      await b.click({ timeout: 3000 }).catch(() => page.evaluate((s) => [...document.querySelectorAll(s)].find((x) => x.innerText.trim())?.click(), sel));
      await page.waitForTimeout(400);
      out.items[k] = await page.evaluate((s) => [...document.querySelectorAll(s)].some((x) => x.getAttribute('aria-pressed') === 'true' || x.classList.contains('active')), sel);
    }
    out.ok = claves.length > 0 && Object.values(out.items).every(Boolean);
    return out;
  },
  async 'socratico'(page) {
    await irVistaUI(page, 'socratico', false);
    return probarDialogo(page, 'socratico', '#view-socratico [data-soc-open]', '#socraticOverlay');
  },
  async 'paleolab'(page) {
    return probarDialogo(page, 'paleolab', '[data-action="openPaleoLab"]', '#splDialog');
  },
  async 'itinerario'(page) {
    const out = { paso: 'itinerario' };
    await irVistaUI(page, 'itinerarios', false);
    const t0 = await page.evaluate(() => document.getElementById('view-itinerarios').innerText.length);
    const b = await page.$('#view-itinerarios [data-itinerary-select]');
    if (b) { await b.click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(600); }
    out.cambia = (await page.evaluate(() => document.getElementById('view-itinerarios').innerText.length)) !== t0;
    out.ok = !!b; return out;
  },
  async 'aula.sa'(page) {
    const out = { paso: 'aula.sa' };
    await irVistaUI(page, 'aula', false);
    const b = await page.$('#view-aula [data-sa-generate]');
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch((e) => { out.error = String(e).split('\n')[0].slice(0, 100); }); await page.waitForTimeout(700); }
    out.exportarVisible = await page.evaluate(() => { const o = document.querySelector('#view-aula [data-sa-export]'); return o ? o.getBoundingClientRect().width > 0 : false; });
    if (out.exportarVisible) out.archivo = await descarga(page, () => page.click('#view-aula [data-sa-export]', { timeout: 3000 }).catch(() => {}));
    out.items = { generar: !!b, exportarTXT: !!out.archivo };
    out.ok = !!b; return out;
  },
  async 'simulador'(page) {
    const out = { paso: 'simulador' };
    const r = await irVistaUI(page, 'dispersal', false); out.excepciones = r.excepciones || [];
    const b = await page.$('#view-dispersal [data-dispersal-play]');
    const n0 = page._consola.filter((c) => c.tipo === 'pageerror').length;
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(900); }
    out.excepcionesPlay = [...new Set(page._consola.filter((c) => c.tipo === 'pageerror').slice(n0).map((c) => c.texto.slice(0, 120)))];
    out.ok = !!b && out.excepciones.length === 0 && out.excepcionesPlay.length === 0; return out;
  },
  async 'datacion'(page) {
    const out = { paso: 'datacion' };
    await irVistaUI(page, 'datacion', false);
    const b = await page.$('#view-datacion [data-dating-method]');
    const t0 = await page.evaluate(() => document.getElementById('view-datacion').innerText.length);
    if (b) { await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.cambiaTexto = (await page.evaluate(() => document.getElementById('view-datacion').innerText.length)) !== t0;
    out.ok = !!b; return out;
  },
  async 'constructor'(page) {
    const out = { paso: 'constructor' };
    await irVistaUI(page, 'constructor', false);
    const n0 = await page.evaluate(() => document.querySelectorAll('#view-constructor svg *').length);
    const b = await page.$('#view-constructor [data-builder-species]');
    if (b) { await b.scrollIntoViewIfNeeded().catch(() => {}); await b.click().catch(() => {}); await page.waitForTimeout(500); }
    out.nodosSvg = await page.evaluate(() => document.querySelectorAll('#view-constructor svg *').length);
    out.items = { anade: out.nodosSvg > n0 };
    out.ok = !!b; return out;
  },
  async 'tafonomia'(page) {
    const out = { paso: 'tafonomia' };
    await irVistaUI(page, 'tafonomia', false);
    const s = await page.$('#tapho-sediment');
    if (s) { await s.scrollIntoViewIfNeeded().catch(() => {}); await s.focus().catch(() => {}); const v0 = await s.inputValue().catch(() => ''); await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300); out.valor = await s.inputValue().catch(() => ''); out.items = { deslizador: out.valor !== v0 }; }
    out.ok = !!s; return out;
  },

  // ---------- PB-GH-11 (T4): rutas principales ----------
  // Elegir Cronología, Mapa y África desde «Vistas» con el ratón, como el alumnado (con 2,5 s de lectura del
  // panel antes de pulsar): ¿dónde quedan la barra, el
  // título de la vista y el primer dato (tarjeta, mapa)? Items: barra arriba, título en el primer tercio de la
  // pantalla y primer dato dentro del primer pantallazo. Las cifras van en «medidas» (informativas).
  async 'vista.posicion'(page) {
    const out = { paso: 'vista.posicion', items: Object.create(null), medidas: Object.create(null) };
    await entrar(page);
    const datoSel = { timeline: '#timelineList [data-open-species]', map: '#mapContainer', africa: '.africa-map-svg' };
    for (const v of ['timeline', 'map', 'africa']) {
      const chip = `#pbV50Blocks [data-pb-v50-view="${v}"]`;
      await asegurarVistas(page, chip);
      if (!(await visible(page, chip))) { await page.click('#pbV50Blocks [data-pb-v50-block="explorar"]', { timeout: 2000 }).catch(() => {}); await page.waitForTimeout(350); }
      // Espera realista (verificación de la T4): quien lee el panel tarda en elegir; con 2,5 s el gesto que abrió
      // el panel ya no cuenta y se prueba que la vista se coloca por la elección misma.
      await page.waitForTimeout(2500);
      await page.click(chip, { timeout: 2500 }).catch(() => page.evaluate((s) => document.querySelector(s)?.click(), chip));
      await page.waitForTimeout(1800);
      const m = await page.evaluate(([v, sel]) => {
        const s = document.getElementById('view-' + v);
        const t = s && s.querySelector('.view-hero-title-row h2, .view-hero h2');
        const d = [...document.querySelectorAll('#view-' + v + ' ' + sel)].find((e) => e.getBoundingClientRect().width > 40);
        const b = document.getElementById('pbV50Blocks');
        const top = (e) => (e ? Math.round(e.getBoundingClientRect().top) : null);
        return { alto: innerHeight, barra: top(b), titulo: top(t), dato: top(d), activa: !!(s && s.classList.contains('active')) };
      }, [v, datoSel[v]]);
      out.medidas[v] = m;
      out.items[v + ' · barra arriba'] = m.barra === 0;
      out.items[v + ' · título en el primer tercio'] = m.titulo !== null && m.titulo >= 0 && m.titulo < m.alto / 3;
      out.items[v + ' · primer dato en el primer pantallazo'] = m.dato !== null && m.dato >= 0 && m.dato < m.alto;
    }
    out.ok = Object.keys(out.medidas).every((v) => out.medidas[v].activa);
    return out;
  },
  // Fondo local de costas del mapa (fila 8): trazado presente y puntos de control (un marcador conocido en
  // tierra y dos puntos de mar), con la geometría pintada (isPointInFill), sin depender de la red.
  async 'mapa.costas'(page) {
    const out = { paso: 'mapa.costas', items: Object.create(null) };
    await page.evaluate(() => { try { window.switchView('map'); } catch (e) {} });
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => {
      const p = document.querySelector('#mapSvg > .pb-costas path');
      if (!p) return { trazados: 0 };
      const P = (lon, lat) => p.isPointInFill(new DOMPoint(((lon + 180) / 360) * 1000, ((90 - lat) / 180) * 500));
      const dot = document.querySelector('.map-node[data-id="georgicus"] .map-dot-core');
      return { trazados: document.querySelectorAll('#mapSvg > .pb-costas path').length, anillos: +(document.querySelector('#mapSvg > .pb-costas')?.dataset.pbCostas || 0),
        dmanisi: P(44.2, 41.33), olduvai: P(35.35, -2.99), golfoGuinea: P(0, 0), pacifico: P(-150, 0),
        marcadorGeorgicus: dot ? p.isPointInFill(new DOMPoint(+dot.getAttribute('cx'), +dot.getAttribute('cy'))) : null };
    });
    out.medidas = r;
    out.items = Object.assign(Object.create(null), { 'trazado de costas': r.trazados > 0, 'Dmanisi en tierra': !!r.dmanisi, 'Olduvai en tierra': !!r.olduvai,
      'golfo de Guinea en el mar': r.golfoGuinea === false, 'Pacífico en el mar': r.pacifico === false, 'marcador de georgicus en tierra': !!r.marcadorGeorgicus });
    out.ok = r.trazados > 0;
    return out;
  },
  // Intro en el buscador de la franja (fila 18): una coincidencia abre la ficha; varias, la búsqueda global con
  // el término y título visible.
  async 'buscador.intro'(page) {
    const out = { paso: 'buscador.intro', items: Object.create(null) };
    await entrar(page);
    const escribir = async (t) => {
      await page.evaluate(() => { const i = document.getElementById('searchInput'); i.value = ''; i.scrollIntoView({ block: 'center' }); });
      await page.click('#searchInput', { timeout: 2500 }).catch(() => page.focus('#searchInput'));
      await page.keyboard.type(t, { delay: 10 }); await page.keyboard.press('Enter'); await page.waitForTimeout(1300);
    };
    await escribir('afarensis');
    const r1 = await page.evaluate(() => ({ ficha: !!document.getElementById('detailView')?.classList.contains('active'), titulo: document.getElementById('detailViewTitle')?.textContent || '' }));
    await page.keyboard.press('Escape'); await page.waitForTimeout(600);
    await escribir('homo');
    const r2 = await page.evaluate(() => { const m = document.getElementById('globalSearchModal'); const lb = m && document.getElementById(m.getAttribute('aria-labelledby') || ''); return { modal: !!(m && m.classList.contains('active')), termino: document.getElementById('gsInput')?.value || '', resultados: document.querySelectorAll('#gs-listbox .gs-result').length, titulo: lb ? lb.textContent.trim() : '', tituloVisible: !!(lb && lb.getBoundingClientRect().width > 0 && lb.tagName === 'H2') }; });
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    out.medidas = { r1, r2 };
    out.items = Object.assign(Object.create(null), { 'una coincidencia abre la ficha': r1.ficha && /afarensis/i.test(r1.titulo), 'varias abren la búsqueda global': r2.modal, 'con el término escrito': r2.termino === 'homo' && r2.resultados > 1, 'búsqueda global con título visible': r2.tituloVisible });
    out.ok = r1.ficha || r2.modal;
    return out;
  },
  // Ficha como página de manual: cabecera (nombre, intervalo, estado), imagen principal local cargada,
  // minimapa con alternativa textual (nombre accesible y párrafo con coordenadas) y anchura del panel.
  async 'ficha.manual'(page) {
    const out = { paso: 'ficha.manual', items: Object.create(null) };
    const abierta = await abrirFicha(page, 'afarensis');
    await page.waitForTimeout(800);
    const r = await page.evaluate(() => {
      const d = document.getElementById('detailView');
      const img = d.querySelector('#pane-gen .species-header-image');
      const mapa = d.querySelector('.detail-leaflet-map');
      const alt = mapa && document.getElementById(mapa.getAttribute('aria-describedby') || '');
      return { ancho: Math.round(d.getBoundingClientRect().width), vw: innerWidth,
        titulo: (document.getElementById('detailViewTitle')?.textContent || '').trim(),
        intervalo: !!d.querySelector('.panel-header-meta .sp-tag'), estado: (d.querySelector('.panel-header-meta .badge-estado')?.textContent || '').trim(),
        acciones: ['.panel-back-btn', '#panelPrev', '#panelNavCounter', '#panelNext', '.panel-close'].every((s) => { const e = d.querySelector(s); return e && e.getBoundingClientRect().width > 0; }),
        imgLocal: !!img && /\/img\/taxones\//.test(img.currentSrc || img.src), imgCargada: !!img && img.naturalWidth > 0,
        imagenPrimero: !!img && d.querySelector('#pane-gen').firstElementChild === img.closest('.species-media-figure'),
        mapaNombre: mapa ? mapa.getAttribute('aria-label') || '' : '', mapaAlt: alt ? alt.textContent : '' };
    });
    out.medidas = r;
    out.items = Object.assign(Object.create(null), { 'abre': !!abierta, 'cabecera con nombre, intervalo y estado': !!r.titulo && r.intervalo && !!r.estado, 'volver, ‹ n/50 › y cerrar visibles': r.acciones,
      'imagen principal local': r.imgLocal && r.imgCargada, 'minimapa con alternativa textual': /\d/.test(r.mapaAlt) && /Minimapa/.test(r.mapaNombre),
      'panel lateral en escritorio o pantalla completa en teléfono': r.vw >= 1024 ? r.ancho <= 52 * 16 + 1 : r.ancho === r.vw });
    await page.keyboard.press('Escape');
    out.ok = !!abierta;
    return out;
  },

  // ---------- PB-GH-11 (T5): medidas de la tanda (no existen en la línea base: salen como «otras») ----------
  // Regiones desplazables: en las vistas de gráficos y tablas anchas, todo contenedor que se desplaza recibe
  // foco (tabindex=0) y nombre; en Clima, con el contenedor enfocado, la flecha derecha lo desplaza.
  async 'regiones.foco'(page) {
    const out = { paso: 'regiones.foco', medidas: {} };
    out.items = Object.create(null);
    for (const v of ['clima', 'contexto', 'coexistencias', 'primatologia', 'aula', 'constructor', 'paleoecologia']) {
      await irVistaUI(page, v, false); await barrerVista(page, v); await page.waitForTimeout(1500);
      const r = await page.evaluate((v) => {
        const s = document.getElementById('view-' + v);
        const desp = [...s.querySelectorAll('*')].filter((e) => { const c = getComputedStyle(e); return e.getClientRects().length && ((/(auto|scroll)/.test(c.overflowX) && e.scrollWidth > e.clientWidth + 2) || (/(auto|scroll)/.test(c.overflowY) && e.scrollHeight > e.clientHeight + 2)); });
        const sinFoco = desp.filter((e) => e.getAttribute('tabindex') !== '0' && !e.querySelector('a[href],button,input,select,textarea,[tabindex="0"]'));
        const sinNombre = desp.filter((e) => e.getAttribute('tabindex') === '0' && !(e.getAttribute('aria-label') || e.getAttribute('aria-labelledby')));
        return { desplazables: desp.length, sinFoco: sinFoco.length, sinNombre: sinNombre.length };
      }, v);
      out.medidas[v] = r; out.items[v + ': regiones con foco y nombre'] = r.sinFoco === 0 && r.sinNombre === 0;
    }
    await irVistaUI(page, 'clima', false); await page.waitForTimeout(1200);
    const ok = await page.evaluate(() => { const c = document.getElementById('climaScroll'); if (!c || c.scrollWidth <= c.clientWidth + 2) return null; c.scrollLeft = 0; c.focus(); return document.activeElement === c; });
    if (ok !== null) {
      for (let k = 0; k < 6; k++) await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(400);
      out.medidas.climaScrollLeft = await page.evaluate(() => document.getElementById('climaScroll').scrollLeft);
      out.items['clima: flecha derecha desplaza el gráfico enfocado'] = !!ok && out.medidas.climaScrollLeft > 0;
    }
    out.ok = Object.values(out.items).every(Boolean); return out;
  },
  // Elementos fijos (salvo la barra, sus paneles y los diálogos) que tapan texto: tres posiciones por vista y
  // la Bibliografía abierta. Debe ser 0 (fila 22).
  async 'flotantes.tapan'(page) {
    const out = { paso: 'flotantes.tapan', medidas: {} };
    out.items = Object.create(null);
    const contar = (raizSel) => page.evaluate((raizSel) => {
      const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) > 0.05; };
      const raiz = document.querySelector(raizSel); if (!raiz) return -1;
      const fijos = [...document.querySelectorAll('body *')].filter((e) => getComputedStyle(e).position === 'fixed' && vis(e) && !e.contains(raiz) && !raiz.contains(e))
        .filter((e) => !e.closest('#pbV50Blocks, #pbBarraPanel, #pbHerramientasPanel, .modal-overlay, .detail-panel, .pres-overlay, .socratic-overlay, .lightbox, dialog, #pb-floating-status, .skip-link'));
      let n = 0; const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT);
      for (let t = w.nextNode(); t; t = w.nextNode()) {
        if (!t.textContent.trim() || !t.parentElement || !vis(t.parentElement)) continue;
        const rg = document.createRange(); rg.selectNodeContents(t);
        for (const q of rg.getClientRects()) for (const f of fijos) { const fr = f.getBoundingClientRect(); if (q.left < fr.right - 1 && q.right > fr.left + 1 && q.top < fr.bottom - 1 && q.bottom > fr.top + 1) n++; }
      }
      return n;
    }, raizSel);
    for (const v of ['timeline', 'phylo', 'paleoecologia', 'tafonomia', 'paleoproteomica', 'continentes']) {
      await irVistaUI(page, v, false); await page.waitForTimeout(800);
      let n = 0;
      for (const f of [0.1, 0.5, 0.9]) {
        await page.evaluate(([v, f]) => { const s = document.getElementById('view-' + v); const r = s.getBoundingClientRect(); window.scrollTo(0, r.top + scrollY + Math.max(0, r.height - innerHeight) * f); }, [v, f]);
        await page.waitForTimeout(300); n += Math.max(0, await contar('#view-' + v));
      }
      out.medidas[v] = n; out.items[v + ': ningún fijo tapa texto'] = n === 0;
    }
    await page.evaluate(() => document.querySelector('[data-action="abrirBiblio"]')?.click()); await page.waitForTimeout(1400);
    out.medidas.bibliografia = await contar('#biblioModal .modal-content');
    out.items['bibliografía: ningún fijo tapa texto'] = out.medidas.bibliografia === 0;
    await page.keyboard.press('Escape');
    out.ok = Object.values(out.items).every(Boolean); return out;
  },
  // Sin JavaScript (fila 24): un solo h1 visible y el aviso con enlaces a la consulta ligera y a DEA.
  async 'sinjs'(page) {
    const out = { paso: 'sinjs' };
    const base = new URL(page.url()).origin;
    const ctx = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: page.viewportSize() });
    await ctx.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, (r) => r.abort());
    const p = await ctx.newPage();
    await p.goto(base + '/atlas/index.html', { waitUntil: 'load' }).catch(() => {}); await p.waitForTimeout(600);
    out.medidas = await p.evaluate(() => ({
      h1: [...document.querySelectorAll('h1')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }).length,
      enlaces: [...document.querySelectorAll('.pb-sin-js a')].map((a) => a.getAttribute('href')),
      bodyVisible: getComputedStyle(document.body).visibility === 'visible' }));
    await ctx.close();
    out.items = Object.assign(Object.create(null), { 'un solo h1 visible': out.medidas.h1 === 1, 'enlace a la consulta ligera': out.medidas.enlaces.includes('../ligera/index.html'),
      'enlace a la entrada DEA': out.medidas.enlaces.includes('../dea/'), 'página visible sin JavaScript': out.medidas.bodyVisible });
    out.ok = Object.values(out.items).every(Boolean); return out;
  },
  // CLS (fila 13), mismo criterio que recorrido.cjs (hadRecentInput excluido): carga (entradas almacenadas
  // desde el inicio) y cambio a las vistas que más saltaban en la línea base.
  async 'cls'(page) {
    const out = { paso: 'cls', medidas: {} };
    out.items = Object.create(null);
    out.medidas.carga = await page.evaluate(() => new Promise((ok) => { let s = 0; const o = new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) s += e.value; }); o.observe({ type: 'layout-shift', buffered: true }); setTimeout(() => { o.disconnect(); ok(+s.toFixed(3)); }, 300); }));
    out.items['carga < 0,1'] = out.medidas.carga < 0.1;
    for (const v of ['aula', 'debates', 'socratico', 'estratigrafia', 'revisiones', 'constructor', 'datacion', 'primatologia', 'coexistencias', 'africa', 'tree']) {
      await page.evaluate(() => { window.__clsT5 = 0; window.__clsT5o?.disconnect(); window.__clsT5o = new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__clsT5 += e.value; }); window.__clsT5o.observe({ type: 'layout-shift', buffered: false }); });
      await irVistaUI(page, v, false); await page.waitForTimeout(600);
      const c = await page.evaluate(() => +(window.__clsT5 || 0).toFixed(3));
      out.medidas[v] = c; out.items[v + ' < 0,1'] = c < 0.1;
    }
    out.ok = Object.values(out.items).every(Boolean); return out;
  },
};

// Enlace profundo ?view=<id>#main-content de las 31 vistas (lo usa el recorrido). Recibe una función que abre
// una página nueva; cada vista se comprueba con almacenamiento local vacío (sin «última vista» recordada).
async function enlacesProfundos(page, base, listo) {
  const out = { paso: 'enlaces.profundos', items: Object.create(null) };
  await page.context().addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  for (const v of VISTAS) {
    await page.goto(`${base}/atlas/index.html?view=${v}#main-content`, { waitUntil: 'load' }).catch(() => {});
    await listo(page, 5000);
    await page.waitForTimeout(500);
    out.items[v] = await page.evaluate((v) => !!document.getElementById('view-' + v)?.classList.contains('active'), v);
  }
  // PB-GH-11 (T5, corrección tras la verificación del director): activar la vista no basta; tras la carga
  // (4,5 s) el espacio de trabajo debe estar entrado, la barra arriba y el título de la vista a la vista
  // (entre 0 y 260 px del borde), con y sin el ancla #main-content (la forma de atlas/recorrido/integracion.js).
  out.posicion = {};
  for (const v of ['timeline', 'africa', 'biogeo', 'constructor']) {
    for (const h of ['', '#main-content']) {
      await page.goto(`${base}/atlas/index.html?view=${v}${h}`, { waitUntil: 'load' }).catch(() => {});
      await listo(page, 5000);
      await page.waitForTimeout(4500);
      const r = await page.evaluate((v) => { const s = document.getElementById('view-' + v); const t = s && s.querySelector('.view-hero-title-row h2, .view-hero h2, h2'); const b = document.getElementById('pbV50Blocks');
        return { activa: !!(s && s.classList.contains('active')), entrado: document.body.classList.contains('pb-workspace-entered'), barra: b ? Math.round(b.getBoundingClientRect().top) : null, titulo: t ? Math.round(t.getBoundingClientRect().top) : null }; }, v);
      out.posicion[v + h] = r;
      out.items[`posición ${v}${h ? ' con #main-content' : ''}: título a la vista bajo la barra`] = r.activa && r.entrado && r.barra !== null && Math.abs(r.barra) <= 2 && r.titulo >= 0 && r.titulo <= 260;
    }
  }
  out.ok = Object.values(out.items).every(Boolean);
  return out;
}

module.exports = { VISTAS, FUNCIONES, asegurarVistas, asegurarConsulta, irVistaUI, medirVista, barrerVista, entrar, abrirCajon, cerrarCajon, estadoDialogo, probarDialogo, foco, abrirFicha, descarga, enlacesProfundos };
