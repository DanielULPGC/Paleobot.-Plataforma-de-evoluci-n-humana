// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v69-quiz-start-repair
(function(){
  'use strict';

  function enableQuizStartButtons(){
    document.querySelectorAll('[data-quiz-next]').forEach(btn => {
      btn.disabled = false;
      btn.removeAttribute('disabled');
      btn.setAttribute('aria-disabled', 'false');
    });
  }

  function fallbackClassicQuiz(){
    const db = Array.isArray(window.DB) ? window.DB.filter(sp => sp && sp.nombre) : [];
    const sp = db[Math.floor(Math.random() * db.length)];
    const intro = document.getElementById('examIntro');
    const q = document.getElementById('examQ');
    if (!sp || !q) return false;
    if (intro) intro.style.display = 'none';
    q.style.display = 'block';
    const clades = window.CLADE_NAMES || {};
    const answer = clades[sp.clado] || sp.ubicacion || sp.anos || sp.holo;
    const pool = [...new Set(db.map(item => clades[item.clado] || item.ubicacion || item.anos || item.holo).filter(Boolean))];
    const options = [answer, ...pool.filter(item => item !== answer).sort(() => Math.random() - 0.5).slice(0, 3)]
      .filter(Boolean)
      .sort(() => Math.random() - 0.5);
    q.innerHTML = [
      '<p class="exam-question-title">¿Qué opción se asocia mejor con <strong>' + escapeHtmlText(sp.nombre) + '</strong>?</p>',
      options.map(opt => '<button type="button" class="exam-opt" data-pb-v69-answer="' + (opt === answer ? '1' : '0') + '">' + escapeHtmlText(opt) + '</button>').join(''),
      '<div class="exam-action-row"><button type="button" class="exam-btn" data-quiz-back="intro">Volver</button></div>'
    ].join('');
    return true;
  }

  function startClassicQuiz(){
    enableQuizStartButtons();
    try {
      if (typeof window.runExam === 'function') {
        window.runExam();
        if (document.getElementById('examQ')?.textContent.trim()) return true;
      }
    } catch(err) {
      console.warn('[PB69] Recuperando autoevaluación clásica:', err);
    }
    try {
      if (typeof runExam === 'function') {
        runExam();
        if (document.getElementById('examQ')?.textContent.trim()) return true;
      }
    } catch(err) {
      console.warn('[PB69] Recuperando runExam legacy:', err);
    }
    return fallbackClassicQuiz();
  }

  document.addEventListener('click', function(event){
    const trigger = event.target.closest && event.target.closest('[data-quiz-next]');
    if (!trigger) return;
    if (trigger.dataset.quizNext !== 'classic') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    startClassicQuiz();
  }, true);

  document.addEventListener('click', function(event){
    const answer = event.target.closest && event.target.closest('[data-pb-v69-answer]');
    if (!answer) return;
    const ok = answer.dataset.pbV69Answer === '1';
    answer.closest('#examQ')?.querySelectorAll('[data-pb-v69-answer]').forEach(btn => {
      btn.disabled = true;
      btn.classList.toggle('exam-correct', btn.dataset.pbV69Answer === '1');
    });
    answer.classList.toggle('exam-wrong', !ok);
  }, true);

  ['DOMContentLoaded','paleobot:viewchange'].forEach(name => {
    document.addEventListener(name, () => window.setTimeout(enableQuizStartButtons, 80));
  });
  if (document.readyState !== 'loading') window.setTimeout(enableQuizStartButtons, 80);

  window.PaleoBotV69QuizStartRepair = { startClassicQuiz, enableQuizStartButtons };
})();
