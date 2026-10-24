/* A3-C4.1 — typed evidence policy. No network, storage, or inferred taxon durations. */
(function(root,factory){
'use strict';
if(typeof module==='object'&&module.exports)module.exports=factory;
else root.PaleoBotA3Temporal=factory(root.PaleoBotChronologyA2,root.PaleoBotA3Factory,root.PaleoBotA3Catalog);
})(globalThis,function(C,makeModel,payload){
'use strict';
if(!C||typeof C.validate!=='function'||typeof makeModel!=='function'||!payload)throw new TypeError('A3 source unavailable');
const model=makeModel(C,payload);
const S=model.states, reviewed=new Set(model.reviewedIds);
const source=payload.chronology;
if(source.release_gate.a3!=='NO_GO'||source.status!=='STAGED_NOT_DEPLOYABLE')throw new TypeError('Unqualified source');
const NONE=S.NONE,YES=S.POSSIBLE,UNKNOWN=S.UNKNOWN;
const deepFreeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(deepFreeze);Object.freeze(v);}return v;};
const clone=v=>structuredClone(v);
const cache=new Map();let revision=0,includeIndeterminate=true;
const baseline=new Map(payload.records.map(sp=>[sp.id,JSON.stringify([sp.id,sp.anos,sp.val_time])]));
const place=deepFreeze({
 rhodesiensis:{region:'africa',label:'Kabwe, Zambia',source_ids:['grun2020']},
 omo_i:{region:'africa',label:'Omo Kibish, Etiopía',source_ids:['vidal2022']},
 penghu:{region:'asia',label:'Canal de Penghu, Taiwán',source_ids:['tsutaya2025']},
 longi:{region:'asia',label:'Harbin, China',source_ids:['fu_proteome2025','fu_mtdna2025']}
});
function identity(sp){
 if(!sp||typeof sp!=='object'||typeof sp.id!=='string'||!baseline.has(sp.id))throw new TypeError('Unknown chronology record');
 if(JSON.stringify([sp.id,sp.anos,sp.val_time])!==baseline.get(sp.id))throw new TypeError('STALE_CHRONOLOGY_SOURCE');
 return sp.id;
}
function bounds(young,old){
 if(typeof young!=='number'||typeof old!=='number'||!Number.isFinite(young)||!Number.isFinite(old)||young<0||young>old||old>30)throw new RangeError('Invalid Ma window');
 return [young*1000,old*1000];
}
function reviewedSourceStatus(r){if(!r)return 'LEGACY_UNREVIEWED';if(r.status==='R05_T5_REVIEWED_NO_GO')return 'R05_T5_REVIEWED';if(r.status==='R05_T4_REVIEWED_NO_GO')return 'R05_T4_REVIEWED';if(r.status==='R05_T3_REVIEWED_NO_GO')return 'R05_T3_REVIEWED';if(r.status==='R05_T2_REVIEWED_NO_GO')return 'R05_T2_REVIEWED';if(r.status==='R05_T1_REVIEWED_NO_GO')return 'R05_T1_REVIEWED';return 'A2_REVIEWED';}
function snapshot(sp){const id=identity(sp),r=model.record(id);return deepFreeze({id,reviewed:!!r,record:r?clone(r):null,source_status:reviewedSourceStatus(r)});}
function invalidate(){cache.clear();revision++;return revision;}
function setIncludeIndeterminate(value){if(typeof value!=='boolean')throw new TypeError('Boolean required');if(includeIndeterminate!==value){includeIndeterminate=value;invalidate();}return includeIndeterminate;}
function decision(sp,young,old){
 const id=identity(sp),[a,b]=bounds(young,old),key=JSON.stringify([id,baseline.get(id),revision,a,b]);
 if(cache.has(key))return cache.get(key);
 const d=model.decision(id,a,b);
 const result=deepFreeze({...d,entity_type:model.record(id)?.entity_type||'unclassified',source_status:reviewedSourceStatus(model.record(id)),biological_coexistence:'NOT_ASSESSED'});
 cache.set(key,result);return result;
}
function include(sp,young,old,options={}){
 const d=decision(sp,young,old),allow=options.includeIndeterminate===undefined?includeIndeterminate:options.includeIndeterminate;
 if(typeof allow!=='boolean')throw new TypeError('Invalid unknown policy');
 return d.status===YES||(d.status===UNKNOWN&&allow);
}
function filterRows(pool,young,old,options={}){
 if(!Array.isArray(pool))throw new TypeError('Pool required');
 const rows=pool.map(sp=>({sp,decision:decision(sp,young,old)}));
 const allow=options.includeIndeterminate===undefined?includeIndeterminate:options.includeIndeterminate;
 if(typeof allow!=='boolean')throw new TypeError('Invalid unknown policy');
 const counts={possible:0,no_reported_overlap:0,indeterminate:0};
 rows.forEach(x=>{if(x.decision.status===YES)counts.possible++;else if(x.decision.status===NONE)counts.no_reported_overlap++;else counts.indeterminate++;});
 return {rows:rows.filter(x=>x.decision.status===YES||(allow&&x.decision.status===UNKNOWN)),counts,revision,includeIndeterminate:allow};
}
function legacyRange(sp){
 const id=identity(sp),r=model.record(id);
 if(r)return deepFreeze({start:NaN,end:NaN,unit:'Ma',status:'NOT_PROJECTABLE',scientific:false,source_status:reviewedSourceStatus(r),reason:'Specimen age is not a taxon duration'});
 // Compatibility-only parser for unreviewed records. Never used for scientific decisions.
 const raw=String(sp.anos||'').toLowerCase().replace(/[–—]/g,'-').replace(/[~≈]/g,'').replace(/,/g,'.').trim();
 const n='(\\d+(?:\\.\\d+)?)';let m,old,young;
 const patterns=[
  [new RegExp(n+'\\s*ma\\s*-\\s*'+n+'\\s*ka'),1,.001],
  [new RegExp(n+'\\s*-\\s*'+n+'\\s*ma'),1,1],
  [new RegExp(n+'\\s*-\\s*'+n+'\\s*ka'),.001,.001],
  [new RegExp(n+'\\s*ma'),1,0],
  [new RegExp(n+'\\s*ka'),.001,0]
 ];
 for(const [re,a,b] of patterns){m=raw.match(re);if(m){old=Number(m[1])*a;young=b?Number(m[2])*b:old;break;}}
 if(!m)return deepFreeze({start:NaN,end:NaN,unit:'Ma',status:'LEGACY_UNPARSED',scientific:false});
 return deepFreeze({start:Math.max(old,young),end:Math.min(old,young),unit:'Ma',status:'LEGACY_UNREVIEWED',scientific:false});
}
function reportedOverlap(a,b){
 const left=identity(a),right=identity(b),ar=model.record(left),br=model.record(right);
 const result=ar&&br?C.reportedOverlap(ar,br):{status:UNKNOWN,intervals_ka:[]};
 return deepFreeze({...result,biological_coexistence:'NOT_ASSESSED',reason:'Temporal evidence compatibility is not biological coexistence'});
}
function occupancy(sp,ma){
 const id=identity(sp);bounds(ma,ma);
 const r=model.record(id);
 // Positive presence requires separately reviewed taxon occupancy evidence, absent in this A2 corpus.
 if(!r||r.entity_type!=='taxon'||r.semantic_scope!=='taxon_occupancy'||r.legacy_projectable!==true)return deepFreeze({status:'INDETERMINATE',established:false,reason:'NO_QUALIFIED_OCCUPANCY'});
 const d=decision(sp,ma,ma);
 return deepFreeze({status:d.status,established:d.status===YES,reason:'QUALIFIED_TAXON_OCCUPANCY'});
}
function regionEvidence(pool,ma,region){
 bounds(ma,ma);
 const supported=[],uncertain=[];
 for(const sp of pool){
  const id=identity(sp),r=model.record(id),loc=place[id];
  if(!r||!loc||loc.region!==region)continue;
  const d=decision(sp,ma,ma);
  if(d.status===YES)supported.push({id,name:model.item(id).nombre,place:loc.label,source_ids:[...r.source_ids],status:d.status,biological_presence:'NOT_ASSESSED'});
  else if(d.status===UNKNOWN)uncertain.push({id,name:model.item(id).nombre,place:loc.label,source_ids:[...r.source_ids],status:d.status});
 }
 return deepFreeze({region,ma,supported,uncertain,legacy_unreviewed:pool.filter(sp=>!reviewed.has(identity(sp))).length,biological_presence:'NOT_ASSESSED'});
}
function evidenceMatrix(pool,young,old){
 bounds(young,old);if(!Array.isArray(pool))throw new TypeError('Pool required');
 const rows=pool.map(sp=>({id:identity(sp),name:model.item(sp.id).nombre,chronology:model.information(sp.id).chronology,kind:model.information(sp.id).kind,decision:decision(sp,young,old)}));
 const pairs=[];
 for(let i=0;i<pool.length;i++)for(let j=i+1;j<pool.length;j++){
  const d=reportedOverlap(pool[i],pool[j]);
  if(d.status===YES)pairs.push({left:pool[i].id,right:pool[j].id,...d});
 }
 return deepFreeze({rows,pairs,biological_coexistence:'NOT_ASSESSED',ecological_interactions:'NOT_ASSESSED',source_revision:source.provenance||null});
}
// A3-C4.2 — presentation data, never a source for occupancy or taxon duration.
function presentation(sp){
 const id=identity(sp),r=model.record(id);
 if(!r)return deepFreeze({id,kind:'legacy_unreviewed',label:String(sp.anos||'Sin dato'),reviewed:false,geometry:[],source_ids:[],meaning:'LEGACY_UNREVIEWED',duration:'NOT_ASSESSED'});
 const geometry=[];
 if(r.kind==='point_estimate'){
  geometry.push({kind:'point',ma:r.estimate_ka/1000,uncertainty_ka:r.uncertainty?.value_ka??null,uncertainty_definition:r.uncertainty?.definition||null});
 }else if(r.kind==='minimum_age'||r.kind==='maximum_age'){
  geometry.push({kind:r.kind,ma:r.estimate_ka/1000,uncertainty_ka:r.uncertainty?.value_ka??null,uncertainty_definition:r.uncertainty?.definition||null});
 }else if(r.kind==='alternative_intervals'||r.kind==='closed_interval'){
  for(const [young,old] of r.intervals_ka)geometry.push({kind:'reported_window',young_ma:young/1000,old_ma:old/1000});
 }
 return deepFreeze({id,kind:r.kind,label:r.display,reviewed:true,geometry,source_ids:[...r.source_ids],meaning:'SPECIMEN_OR_LINEAGE_EVIDENCE',duration:'NOT_ASSESSED',method:r.method,entity_type:r.entity_type});
}
function exportChronology(sp){
 const p=presentation(sp);
 const windows=p.geometry.filter(g=>g.kind==='reported_window').map(g=>({young:g.young_ma,old:g.old_ma}));
 const single=windows.length===1?{young:windows[0].young,old:windows[0].old}:null;
 return deepFreeze({
  texto:p.label,
  source_status:reviewedSourceStatus(model.record(sp.id)),
  kind:p.kind,
  entity_type:p.entity_type||null,
  geometry:clone(p.geometry),
  single_interval_ma:single,
  legacy_text:sp.anos||'',
  legacy_val_time_Ma:sp.val_time??null,
  legacy_semantics:p.reviewed?'COMPATIBILITY_ONLY':'UNREVIEWED_SOURCE',
  scientific_duration:'NOT_ASSESSED'
 });
}
function biomolecularCaution(sp){
 const p=presentation(sp);
 if(p.reviewed)return 'La preservación de ADN o proteínas no se infiere automáticamente a partir de la cronología revisada; exige contexto tafonómico y evidencia molecular específica.';
 return 'La preservación biomolecular no se evalúa mediante el valor cronológico heredado; requiere revisión tafonómica y molecular específica.';
}
function chronologicalRows(pool){
 if(!Array.isArray(pool))throw new TypeError('Pool required');
 return pool.map(sp=>({sp,presentation:presentation(sp)}));
}
function presentationSummary(pool){
 const rows=chronologicalRows(pool),reviewedRows=rows.filter(x=>x.presentation.reviewed);
 return deepFreeze({total:rows.length,reviewed:reviewedRows.length,legacy_unreviewed:rows.length-reviewedRows.length,labels:reviewedRows.map(x=>({id:x.sp.id,label:x.presentation.label})),duration:'NOT_ASSESSED',biological_presence:'NOT_ASSESSED'});
}
function ccSeries(pool){
 const rows=chronologicalRows(pool),points=[],excluded=[];
 for(const {sp,presentation:p} of rows){
  if(!Number.isFinite(sp.cc)||sp.cc<0){excluded.push({id:sp.id,reason:'CC_NOT_AVAILABLE'});continue;}
  const point=p.geometry.length===1&&p.geometry[0].kind==='point'?p.geometry[0]:null;
  if(point&&Number.isFinite(point.ma))points.push({id:sp.id,name:sp.nombre,clado:sp.clado,cc:sp.cc,ma:point.ma,uncertainty_ka:point.uncertainty_ka,uncertainty_definition:point.uncertainty_definition,label:p.label,source_ids:p.source_ids,cc_status:'LEGACY_UNREVIEWED'});
  else excluded.push({id:sp.id,reason:p.reviewed?'AGE_NOT_POINT_ESTIMATE':'LEGACY_UNREVIEWED'});
 }
 return deepFreeze({points,excluded,regression:'NOT_ASSESSED',population_trend:'NOT_ASSESSED'});
}
function topologyLayout(tree,leafOrder){
 if(!tree||!Array.isArray(leafOrder)||new Set(leafOrder).size!==leafOrder.length)throw new TypeError('Invalid tree or leaf order');
 const positions=new Map(leafOrder.map((id,i)=>[id,i]));
 const seen=new Set(),nodeIds=new Set();let maxDepth=0;
 function visit(item,depth){
  maxDepth=Math.max(maxDepth,depth);
  if(item.leaf){if(!positions.has(item.leaf)||seen.has(item.leaf))throw new TypeError('Invalid leaf');seen.add(item.leaf);return {type:'leaf',id:item.leaf,depth,y:positions.get(item.leaf)};}
  if(!item.node||nodeIds.has(item.node)||!Array.isArray(item.children)||!item.children.length)throw new TypeError('Invalid node');
  nodeIds.add(item.node);const children=item.children.map(c=>visit(c,depth+1));
  return {type:'node',id:item.node,depth,y:children.reduce((s,c)=>s+c.y,0)/children.length,children};
 }
 const root=visit(tree,0);const denominator=Math.max(1,maxDepth);
 function project(item){return {...item,x:item.type==='leaf'?1:item.depth/denominator,children:item.children?.map(project)};}
 return deepFreeze({root:project(root),leafCount:seen.size,nodeCount:nodeIds.size,layout_only:true,chronology:'NOT_ASSESSED'});
}
function builderLayout(nodes,width,height,clades={}){
 if(!Array.isArray(nodes)||!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new TypeError('Invalid layout');
 const ids=nodes.map(n=>n.id);if(new Set(ids).size!==ids.length)throw new TypeError('Duplicate nodes');
 ids.forEach(id=>{if(!model.item(id))throw new TypeError('Unknown node');});
 const ordered=[...ids].sort((a,b)=>a.localeCompare(b,'en'));
 const groups=['basal','australo','paran','homo'];const lanes=new Map();
 for(const id of ordered){const group=groups.includes(clades[id])?clades[id]:'homo';if(!lanes.has(group))lanes.set(group,[]);lanes.get(group).push(id);}
 const result=[];
 const padX=Math.min(40,width/4),padY=Math.min(40,height/4);
 for(const [group,items] of lanes){const lane=groups.indexOf(group);items.forEach((id,i)=>result.push({id,x:Math.round(padX+(i+.5)*Math.max(0,width-2*padX)/items.length),y:Math.round(padY+(lane+.5)*Math.max(0,height-2*padY)/4)}));}
 return deepFreeze({nodes:result,layout_only:true,chronology:'NOT_ASSESSED'});
}


// A3-C5.2 — single source for provenance-aware presentation and exports.
function displayMetadata(sp){
 const id=identity(sp),p=presentation(sp),r=model.record(id);
 const status_label=p.reviewed?(r.status==='R05_T5_REVIEWED_NO_GO'?'Cronología revisada en R05-T5/C6.3.5':r.status==='R05_T4_REVIEWED_NO_GO'?'Cronología revisada en R05-T4/C6.3.4':r.status==='R05_T3_REVIEWED_NO_GO'?'Cronología revisada en R05-T3/C6.3.3':r.status==='R05_T2_REVIEWED_NO_GO'?'Cronología revisada en R05-T2/C6.3.2':r.status==='R05_T1_REVIEWED_NO_GO'?'Cronología revisada en R05-T1/C6.3.1':'Cronología revisada en A2'):'Referencia histórica R92, sin revisión cronológica A1/A2';
 const scope_note=!p.reviewed?'No utilizar como duración, presencia, coexistencia ni datación contrastada.':
  r.kind==='point_estimate'?'Estimación de un espécimen; no establece la duración del taxón.':
  r.kind==='minimum_age'?'Edad mínima; no equivale a una fecha exacta ni a la duración del taxón.':
  r.kind==='maximum_age'?'Edad máxima; no equivale a una duración taxonómica.':
  r.kind==='alternative_intervals'?'Ventanas alternativas de un espécimen; no representan ocupación continua ni duración taxonómica.':
  r.kind==='closed_interval'?'Intervalo publicado para la entidad indicada; no extrapolar a un taxón.':
  'Cronología del linaje no resuelta; no se infiere una duración.';
 const source_label=p.reviewed?((r.status==='R05_T5_REVIEWED_NO_GO'?'Identificadores de fuente R05-T5/C6.3.5: ':r.status==='R05_T4_REVIEWED_NO_GO'?'Identificadores de fuente R05-T4/C6.3.4: ':r.status==='R05_T3_REVIEWED_NO_GO'?'Identificadores de fuente R05-T3/C6.3.3: ':r.status==='R05_T2_REVIEWED_NO_GO'?'Identificadores de fuente R05-T2/C6.3.2: ':r.status==='R05_T1_REVIEWED_NO_GO'?'Identificadores de fuente R05-T1/C6.3.1: ':'Identificadores de fuente A2: ')+r.source_ids.join(', ')):'Fuente: catálogo histórico R92; revisión pendiente.';
 return deepFreeze({id,label:p.label,text:p.label+' · '+status_label,status_label,scope_note,source_label,source_ids:[...p.source_ids],source_status:reviewedSourceStatus(r),kind:p.kind,entity_type:r?.entity_type||null,dating_relation:r?.dating_relation||null,method:r?.method||null,scientific_duration:'NOT_ASSESSED',biological_presence:'NOT_ASSESSED',release_gate:'NO_GO'});
}
function narrative(sp){
 const id=identity(sp);
 // Narrative routing follows the validated chronology registry: 50 reviewed records, 0 legacy-unreviewed; no occupancy semantics are inferred.
 return model.record(id)?model.item(id):sp;
}

function format(sp){const id=identity(sp);return model.information(id).chronology;}
return Object.freeze({schema:'paleobot-a3-c4.3-temporal-policy-v1',status:'EXPERIMENTAL_NO_GO',states:S,revision:()=>revision,includeIndeterminate:()=>includeIndeterminate,setIncludeIndeterminate,invalidate,identity,snapshot,decision,include,filterRows,legacyRange,reportedOverlap,occupancy,regionEvidence,evidenceMatrix,format,record:id=>model.record(id),ids:model.ids,sourceProvenance:model.sourceProvenance,presentation,exportChronology,displayMetadata,narrative,biomolecularCaution,chronologicalRows,presentationSummary,ccSeries,topologyLayout,builderLayout});
});
