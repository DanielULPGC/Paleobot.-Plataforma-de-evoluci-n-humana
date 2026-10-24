/* A3-C4.1: evidence-only replacement for the legacy coexistence renderer. */
(function(root,factory){
'use strict';
if(typeof module==='object'&&module.exports)module.exports=factory;
else root.PaleoBotA3EvidenceViews=factory(root.PaleoBotA3Temporal);
})(globalThis,function(T){
'use strict';
if(!T||T.status!=='EXPERIMENTAL_NO_GO')throw new TypeError('A3 temporal policy unavailable');
const S=T.states;
function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n;}
function append(parent,...children){for(const c of children)parent.appendChild(c);return parent;}
function clear(parent){parent.replaceChildren();}
function label(d){
 if(d.status===S.POSSIBLE)return 'Soporte temporal compatible';
 if(d.status===S.NONE)return 'Sin solapamiento en las ventanas documentadas';
 return 'Indeterminado';
}
function intervalText(a){return a.length?a.map(x=>`${x[0]}–${x[1]} ka`).join(' o '):'Sin intervalo finito evaluable';}
function note(){return el('p','Consulta experimental. Una edad de espécimen, localidad u horizonte fosilífero no es una duración taxonómica. El solapamiento de evidencias no demuestra presencia continua, coexistencia biológica, simpatría, competencia, desplazamiento ni ausencia histórica. Las fichas que permanecen sin revisión cronológica tipada se muestran como indeterminadas.','a3-evidence-note');}
function table(headers,rows){
 const t=el('table',null,'a3-evidence-table');const head=el('thead'),tr=el('tr');
 for(const h of headers)tr.appendChild(el('th',h));head.appendChild(tr);t.appendChild(head);
 const body=el('tbody');for(const cells of rows){const row=el('tr');for(const c of cells){const td=el('td');if(c&&typeof c==='object'&&c.nodeType)td.appendChild(c);else td.textContent=String(c??'');row.appendChild(td);}body.appendChild(row);}t.appendChild(body);return t;
}
function renderBin(panel,pool,young,old){
 const result=T.evidenceMatrix(pool,young,old);
 clear(panel);panel.classList.add('a3-evidence-panel');
 append(panel,el('h3',`Evidencias: ${young}–${old} Ma`),note());
 const counts=T.filterRows(pool,young,old).counts;
 panel.appendChild(el('p',`${counts.possible} compatibles; ${counts.no_reported_overlap} sin solapamiento documentado; ${counts.indeterminate} indeterminados. No son recuentos de especies presentes.`));
 panel.appendChild(table(['Registro','Cronología y entidad','Evaluación','Ventanas compatibles'],result.rows.map(row=>[row.name,`${row.chronology} · ${row.kind}`,label(row.decision),intervalText(row.decision.intervals_ka)])));
 return result;
}
function renderCoexistence(container,pool,young,old,options={}){
 const result=T.evidenceMatrix(pool,young,old);
 clear(container);container.classList.add('a3-evidence-panel');
 append(container,el('h3','Compatibilidad cronológica de evidencias'),note());
 const counts=T.filterRows(pool,young,old).counts;
 container.appendChild(el('p',`${counts.possible} registros compatibles; ${counts.no_reported_overlap} sin solapamiento documentado; ${counts.indeterminate} indeterminados. Pares con soporte temporal compatible: ${result.pairs.length}. Coexistencia biológica: no evaluada.`));
 const rows=result.rows.map(row=>{
  const button=el('button','Abrir ficha');button.type='button';button.addEventListener('click',()=>{if(typeof options.openSpecies==='function')options.openSpecies(row.id);});
  return [row.name,`${row.chronology} · ${row.kind}`,label(row.decision),intervalText(row.decision.intervals_ka),button];
 });
 container.appendChild(table(['Registro','Cronología y entidad','Resultado','Ventanas compatibles','Ficha'],rows));
 const detail=el('section',null,'a3-evidence-panel');detail.id='a3CoexEvidenceDetail';container.appendChild(detail);
 const controls=el('div',null,'a3-evidence-panel');
 const youngInput=el('input');youngInput.type='number';youngInput.min='0';youngInput.max='30';youngInput.step='0.001';youngInput.value=String(young);
 const oldInput=el('input');oldInput.type='number';oldInput.min='0';oldInput.max='30';oldInput.step='0.001';oldInput.value=String(old);
 const yLabel=el('label','Límite reciente (Ma) ');yLabel.appendChild(youngInput);
 const oLabel=el('label','Límite antiguo (Ma) ');oLabel.appendChild(oldInput);
 const run=el('button','Examinar ventana');run.type='button';
 const error=el('p');error.setAttribute('role','status');
 run.addEventListener('click',()=>{
  try{renderBin(detail,pool,Number(youngInput.value),Number(oldInput.value));error.textContent='';}
  catch(e){error.textContent='Ventana inválida. Compruebe los límites y su orden.';}
 });
 append(controls,yLabel,oLabel,run,error);container.appendChild(controls);
 // Explicit, bounded bins; counts refer to evidence support, never biological presence.
 const bins=[];const step=.1;
 for(let t=old;t>young+1e-9;t=Math.max(young,+(t-step).toFixed(6))){
  const lower=Math.max(young,+(t-step).toFixed(6));
  const c=T.filterRows(pool,lower,t).counts;
  const button=el('button','Examinar');button.type='button';button.addEventListener('click',()=>renderBin(detail,pool,lower,t));
  bins.push([`${lower}–${t} Ma`,c.possible,c.indeterminate,button]);
  if(bins.length>300)throw new RangeError('Too many bins');
 }
 const section=el('details');section.appendChild(el('summary',`Tramos de 100 ka (${bins.length})`));
 section.appendChild(el('p','Cada tramo informa compatibilidad de soporte; las ventanas alternativas no se unen ni se convierten en ocupación continua.'));
 section.appendChild(table(['Tramo','Soporte compatible','Indeterminados','Detalle'],bins));container.appendChild(section);
 return result;
}
return Object.freeze({renderCoexistence,renderBin,label});
});
