/* PB-GH-11 · Sin capa docente no universitaria (26-11-2026), capa final y aditiva.
   Decisión de la titular: el atlas deja de ofrecer «Modo clase» y todo lo dirigido a Primaria y a ESO/Bachillerato.
   El código heredado (002-script.js, 040-064) no se edita: esta capa retira del DOM lo que él genera, antes y
   después de cada pintado (MutationObserver). Se retira:
     · los botones «Modo clase» (data-action="activateClassMode") y el rótulo «Modo clase» de la tarjeta «Enseñar»;
     · el generador de situaciones de aprendizaje (4.º ESO, 1.º y 2.º de Bachillerato) y su título;
     · la tarjeta «Educación Primaria» de los itinerarios por perfil;
     · del diagnóstico técnico, las líneas «modo clase funcional» y «Síntesis de sesión»;
     · las tarjetas del centro docente dirigidas solo a ESO/Bachillerato y los rótulos de etapa no universitaria
       en las que son mixtas (queda «Grado», «MUFP», «TFG/TFM», etc.). */
(function () {
  'use strict';
  var ETAPAS = /\b(?:Educaci[oó]n Primaria|Primaria|ESO(?: avanzado)?|Bachillerato)\b/;

  function quitar(n) { if (n && n.parentNode) n.parentNode.removeChild(n); }

  // Devuelve true si la etiqueta es solo de etapa no universitaria. Si el elemento contiene otros nodos (p. ej. un
  // botón «Abrir…»), solo se toca su primer texto y nunca se pide retirar la tarjeta.
  function limpiarEtiqueta(el) {
    var simple = el.children.length === 0;
    var nodo = simple ? el : el.firstChild;
    var t = ((nodo && nodo.textContent) || '').trim();
    if (!t || !ETAPAS.test(t)) return false;
    var partes = t.split(/\s*[\/,]\s*|\s+y\s+/).map(function (x) { return x.trim(); }).filter(Boolean);
    var quedan = partes.filter(function (x) { return !ETAPAS.test(x); });
    if (!quedan.length) { if (simple) return true; if (nodo.nodeType === 3) nodo.textContent = ''; return false; }
    if (quedan.length !== partes.length) {
      if (simple) el.textContent = quedan.join(' / ');
      else if (nodo.nodeType === 3) nodo.textContent = quedan.join(' / ') + ' ';
    }
    return false;
  }

  function tarjetaDe(el, contenedor) { while (el && el.parentNode !== contenedor) el = el.parentNode; return el; }

  function pasar() {
    document.querySelectorAll('[data-action="activateClassMode"]').forEach(quitar);
    document.querySelectorAll('.atlas-workbench-card strong').forEach(function (s) {
      if (s.textContent.trim() === 'Modo clase') s.textContent = 'Aula';
    });
    var centro = document.getElementById('teachingCenterContent');
    if (centro) {
      centro.querySelectorAll('.teaching-section-title').forEach(function (t) {
        if (/Generador de Situaciones de Aprendizaje/.test(t.textContent)) {
          var sig = t.nextElementSibling; quitar(t); if (sig && sig.classList.contains('sa-gen-wrap')) quitar(sig);
        }
      });
      centro.querySelectorAll('.sa-gen-wrap').forEach(quitar);
      // Diagnóstico técnico: ya no comprueba «modo clase funcional» ni la síntesis de sesión (generador de SA).
      centro.querySelectorAll('.teaching-audit-item').forEach(function (i) {
        var t = (i.textContent || '').replace(/\s+/g, ' ').trim();
        if (/Faltan: modo clase funcional\s*$/.test(t) || /^S[ií]ntesis de sesi[oó]n/.test(t)) quitar(i);
      });
      centro.querySelectorAll('.teaching-chip, .teaching-ticket-chip, .teaching-ticket-meta, .teaching-activity-meta, .teaching-template-meta').forEach(function (e) {
        if (e.dataset.pbSinEtapa) return;
        e.dataset.pbSinEtapa = '1';
        if (limpiarEtiqueta(e)) {
          var rejilla = e.closest('.teaching-grid, .teaching-ticket-grid, .teaching-activity-grid');
          var tarjeta = rejilla ? tarjetaDe(e, rejilla) : null;
          if (tarjeta) quitar(tarjeta); else quitar(e);
        }
      });
    }
    var vista = document.getElementById('view-itinerarios');
    if (vista) {
      vista.querySelectorAll('h4').forEach(function (h) {
        if (/^Educaci[oó]n Primaria$/.test(h.textContent.trim())) quitar(h.closest('article, .design-profile-card, [class*="profile"], li, div'));
      });
    }
  }

  var pendiente = false;
  function programar() { if (pendiente) return; pendiente = true; setTimeout(function () { pendiente = false; pasar(); }, 60); }
  function iniciar() {
    pasar();
    try { new MutationObserver(programar).observe(document.body, { childList: true, subtree: true }); } catch (e) { /* sin observador: queda el pase inicial */ }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
})();
