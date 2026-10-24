// Extracted from paleobot_best_science_didactic_v66_7_speed_audited.html
// MEJORA v23-4: navegación ← → entre fichas
function panelNavigate(dir) {
  if (!currentSpecies) return;
  const visible = DB.filter(matchesActiveFilters);
  const idx = visible.findIndex(s => s.id === currentSpecies.id);
  if (idx === -1) return;
  const next = visible[idx + dir];
  if (next) showDetail(next);
}

function _updatePanelNav(sp) {
  const visible = DB.filter(matchesActiveFilters);
  const idx = visible.findIndex(s => s.id === sp.id);
  const prev = document.getElementById('panelPrev');
  const next = document.getElementById('panelNext');
  const counter = document.getElementById('panelNavCounter');
  if (prev)    prev.disabled    = idx <= 0;
  if (next)    next.disabled    = idx >= visible.length - 1;
  if (counter) counter.textContent = visible.length ? `${idx + 1}/${visible.length}` : '';
}
