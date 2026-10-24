/* A3-C2.1 — independent, read-only view. No storage, external requests or R92 mutation. */
(function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const labels={POSSIBLE_REPORTED_SUPPORT_OVERLAP:'Posible solapamiento del soporte publicado',NO_REPORTED_SUPPORT_OVERLAP:'Sin solapamiento con las ventanas publicadas',INDETERMINATE:'Indeterminado'};
  let model=null,rows=[],selected=new Set();
  function el(tag,text,cls){const n=document.createElement(tag);if(text!==undefined&&text!==null)n.textContent=String(text);if(cls)n.className=cls;return n;}
  function clear(n){n.replaceChildren();}
  function statusNode(status){return el('span',labels[status]||status,'state '+(status.startsWith('POSSIBLE')?'possible':status.startsWith('NO_')?'none':'unknown'));}
  function validDoi(value){return /^10\.\d{4,9}\/[\w.()/:;+-]+$/i.test(value)&&!/[<>"'\s]/.test(value);}
  function refNode(ref){const li=el('li');li.append(el('span',[ref.author,ref.year,ref.title,ref.journal].filter(Boolean).join('. ')));if(validDoi(ref.doi)){li.append(' · ');const a=el('a','DOI: '+ref.doi);a.href='https://doi.org/'+ref.doi;a.target='_blank';a.rel='noopener noreferrer';li.append(a);}return li;}
  function range(){const young=$('a3-young').value,old=$('a3-old').value;if(young.trim()===''||old.trim()==='')throw new RangeError('Indique ambos límites cronológicos.');const a=Number(young),b=Number(old);if(!Number.isFinite(a)||!Number.isFinite(b)||a<0||b>30000||a>b)throw new RangeError('Se requiere 0 ≤ límite reciente ≤ límite antiguo ≤ 30000 ka.');return [a,b];}
  function render(){
    const [young,old]=range();rows=model.query({text:$('a3-search').value,young,old,includeIndeterminate:$('a3-include-unknown').checked});
    const body=$('a3-results'),fragment=document.createDocumentFragment();
    rows.forEach(row=>{
      const tr=el('tr'),c=el('td'),input=el('input');input.type='checkbox';input.value=row.info.id;input.checked=selected.has(row.info.id);input.setAttribute('aria-label','Seleccionar '+row.info.name);input.addEventListener('change',()=>{
        if(input.checked&&selected.size>=3){input.checked=false;$('a3-query-error').textContent='La comparación admite como máximo tres fichas.';return;}
        if(input.checked)selected.add(row.info.id);else selected.delete(row.info.id);selection();
      });c.append(input);tr.append(c);
      const name=el('td');name.append(el('strong',row.info.name),el('small',row.info.id));tr.append(name);
      const chron=el('td');chron.append(el('span',row.info.chronology));if(!row.info.reviewed)chron.append(el('small','Texto heredado; no constituye una cronología cualificada.'));tr.append(chron);
      const state=el('td');state.append(statusNode(row.decision.status));tr.append(state);
      tr.append(el('td',row.info.provenance));fragment.append(tr);
    });
    body.replaceChildren(fragment);$('a3-count').textContent=rows.length+' de 50 fichas';$('a3-query-error').textContent='';
  }
  function selection(){$('a3-selection').textContent=selected.size?Array.from(selected).map(id=>model.information(id).name).join(' · '):'No hay fichas seleccionadas.';$('a3-compare').disabled=selected.size<2;}
  function compare(){
    const box=$('a3-comparison');clear(box);
    if(selected.size<2||selected.size>3){box.append(el('p','Seleccione dos o tres fichas.'));return;}
    const comparison=model.compare([...selected]),grid=el('div',null,'comparison-grid');
    comparison.records.forEach(info=>{
      const card=el('article',null,'comparison-card');card.append(el('h3',info.name),el('p',info.chronology),el('p',info.provenance));
      if(info.method)card.append(el('p','Método/contexto: '+info.method));
      const refs=model.bibliography(info.id);if(refs.length){const h=el('h4','Bibliografía conservada'),ul=el('ul');refs.forEach(ref=>ul.append(refNode(ref)));card.append(h,ul);}
      grid.append(card);
    });box.append(grid);
    comparison.pairs.forEach(pair=>{const p=el('div',null,'comparison-pair');p.append(el('strong',model.information(pair.left).name+' / '+model.information(pair.right).name),el('p',labels[pair.status]));if(pair.intervals_ka.length)p.append(el('p','Intersección de ventanas (ka BP): '+JSON.stringify(pair.intervals_ka)));p.append(el('small','Coexistencia biológica: no evaluada.'));box.append(p);});
  }
  function download(name,content,mime){
    const blob=new Blob([content],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function exportRows(type){const data={schema:'paleobot-a3-c2-query-v1',status:'EXPERIMENTAL_NOT_DEPLOYMENT_APPROVED',provenance:model.sourceProvenance,query:{text:$('a3-search').value,young_ka:Number($('a3-young').value),old_ka:Number($('a3-old').value),include_indeterminate:$('a3-include-unknown').checked},rows:rows.map(row=>({...row,bibliography:model.bibliography(row.info.id)}))};if(type==='json')download('paleobot-a3-consulta.json',JSON.stringify(data,null,2),'application/json;charset=utf-8');else download('paleobot-a3-consulta.csv',model.csv(rows),'text/csv;charset=utf-8');}
  async function init(){
    try{
      const response=await fetch('catalog.json',{cache:'no-store',credentials:'same-origin'});if(!response.ok)throw new Error('HTTP '+response.status);
      const payload=await response.json();model=window.PaleoBotA3Factory(window.PaleoBotChronologyA2,payload);
      $('a3-provenance').textContent='R92: '+model.sourceProvenance.base_r92_sha256+' · A2: '+model.sourceProvenance.a2_package_sha256+'. Los resultados no autorizan la promoción del runtime.';
      $('a3-ready').hidden=false;
      $('a3-search-button').addEventListener('click',()=>{try{render();}catch(e){$('a3-query-error').textContent=e.message;}});
      $('a3-reset').addEventListener('click',()=>{selected.clear();$('a3-search').value='';$('a3-young').value='0';$('a3-old').value='30000';$('a3-include-unknown').checked=true;clear($('a3-comparison'));selection();render();});
      $('a3-compare').addEventListener('click',compare);
      $('a3-export-json').addEventListener('click',()=>exportRows('json'));
      $('a3-export-csv').addEventListener('click',()=>exportRows('csv'));
      $('a3-search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();$('a3-search-button').click();}});
      selection();render();document.documentElement.dataset.a3C21='ready';
    }catch(e){$('a3-error').hidden=false;$('a3-error').textContent='No se ha podido validar el catálogo científico. La consulta permanece bloqueada. '+e.message;document.documentElement.dataset.a3C21='blocked';}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
