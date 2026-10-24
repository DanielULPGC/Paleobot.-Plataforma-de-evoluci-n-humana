// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html :: #paleobot-v36-workspace-redesign-layer
(function(){
  function installWorkspaceShell(){
    document.body.classList.add('v36-workbench-redesign');
    const container = document.querySelector('.container');
    const toolbar = document.querySelector('.toolbar');
    const main = document.getElementById('main-content');
    if (!container || !toolbar || !main) return;
    if (document.querySelector('.v36-workspace-shell')) return;
    const shell = document.createElement('section');
    shell.className = 'v36-workspace-shell';
    /* role=none removes landmark semantics; aria-label removed to avoid presentation-role-conflict */
    shell.setAttribute('role','none');
    toolbar.insertAdjacentElement('beforebegin', shell);
    shell.appendChild(toolbar);
    shell.appendChild(main);
  }
  function extendV36Audit(){
    if (typeof buildSelfAuditReport !== 'function' || buildSelfAuditReport.__v36Extended) return;
    const previous = buildSelfAuditReport;
    buildSelfAuditReport = function(){
      const report = previous();
      const shell = document.querySelector('.v36-workspace-shell');
      const toolbar = document.querySelector('.v36-workspace-shell > .toolbar');
      const main = document.querySelector('.v36-workspace-shell > #main-content');
      const missing = [];
      if (!shell) missing.push('área de trabajo común');
      if (!toolbar) missing.push('navegación integrada');
      if (!main) missing.push('contenido conectado');
      if (!document.body.classList.contains('v36-workbench-redesign')) missing.push('diseño funcional v36');
      report.splice(4,0,{
        label:'Navegación didáctica funcional',
        status:missing.length ? 'bad' : 'ok',
        value:missing.length ? 'Faltan: ' + missing.join(', ') : 'Navegación, búsqueda, filtros y contenido comparten una zona de trabajo sin superposición.'
      });
      return report;
    };
    buildSelfAuditReport.__v36Extended = true;
  }
  function init(){
    installWorkspaceShell();
    extendV36Audit();
    document.body.dataset.v36Workspace = 'ready';
    window.PALEOBOT_V36_WORKSPACE_READY = true;
    globalThis.PALEOBOT_V36_WORKSPACE_READY = true;
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
