/* A3-C2.1: read-only scientific consultation. No mutation of the R92 runtime. */
(function(root,factory){
  'use strict';
  if(typeof module==='object' && module.exports) module.exports=factory;
  else root.PaleoBotA3Factory=factory;
})(globalThis,function(C,payload){
  'use strict';
  const STATES=Object.freeze({POSSIBLE:'POSSIBLE_REPORTED_SUPPORT_OVERLAP',NONE:'NO_REPORTED_SUPPORT_OVERLAP',UNKNOWN:'INDETERMINATE'});
  if(!C||typeof C.validate!=='function'||!payload||payload.schema!=='paleobot-a3-c2-catalog-v1')throw new TypeError('Invalid A3 inputs');
  const source=payload.chronology;
  if(source.status!=='STAGED_NOT_DEPLOYABLE'||source.release_gate.a3!=='NO_GO')throw new TypeError('Unqualified source state');
  const records=source.records, ids=source.coverage.reviewed_ids, legacy=source.coverage.legacy_unreviewed_ids;
  const items=payload.records;
  if(!Array.isArray(items)||items.length!==50||ids.length!==50||legacy.length!==0)throw new TypeError('Invalid coverage');
  const byId=new Map();
  for(const sp of items){if(!sp||typeof sp.id!=='string'||byId.has(sp.id))throw new TypeError('Duplicate or invalid ID');byId.set(sp.id,sp);}
  if(new Set([...ids,...legacy]).size!==50||[...ids,...legacy].some(id=>!byId.has(id)))throw new TypeError('Coverage mismatch');
  for(const [id,r] of Object.entries(records)){if(!byId.has(id)||r.id!==id||!ids.includes(id))throw new TypeError('Chronology identity mismatch');C.validate(r);if(r.legacy_projectable!==false||r.semantic_scope==='taxon_occupancy')throw new TypeError('Unsafe projection');}
  if(Object.keys(records).length!==50||JSON.stringify(records.penghu.intervals_ka)!=='[[10,70],[130,190]]')throw new TypeError('Unexpected qualified chronology');
  // Clones prevent callers from changing the validated registry or the catalogue.
  const frozenRecords=structuredClone(records), frozenItems=structuredClone(items);
  function freezeDeep(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freezeDeep);Object.freeze(v);}return v;}
  freezeDeep(frozenRecords);freezeDeep(frozenItems);
  const map=new Map(frozenItems.map(s=>[s.id,s]));
  function record(id){return Object.hasOwn(frozenRecords,id)?frozenRecords[id]:null;}
  function item(id){return map.get(id)||null;}
  function information(id){
    const s=item(id);if(!s)throw new RangeError('Unknown ID');
    const r=record(id);
    return {id,name:s.nombre,chronology:r?r.display:String(s.anos||'Sin dato'),reviewed:!!r,kind:r?r.kind:'legacy_unreviewed',entity_type:r?r.entity_type:'unclassified',source_ids:r?[...r.source_ids]:[],method:r?r.method:null,provenance:r?(r.status==='R05_T5_REVIEWED_NO_GO'?'R05-T5/C6.3.5':r.status==='R05_T4_REVIEWED_NO_GO'?'R05-T4/C6.3.4':r.status==='R05_T3_REVIEWED_NO_GO'?'R05-T3/C6.3.3':r.status==='R05_T2_REVIEWED_NO_GO'?'R05-T2/C6.3.2':r.status==='R05_T1_REVIEWED_NO_GO'?'R05-T1/C6.3.1':'A2/C1'):'R92 — sin revisión A1/A2',biological_coexistence:'NOT_ASSESSED'};
  }
  function windowBounds(young,old){
    if(!Number.isFinite(young)||!Number.isFinite(old)||young<0||old>30000||young>old)throw new RangeError('Invalid ka window');
    return [young,old];
  }
  function decision(id,young,old){
    const [a,b]=windowBounds(young,old),r=record(id);
    if(!item(id))throw new RangeError('Unknown ID');
    if(!r)return {status:STATES.UNKNOWN,reason:'LEGACY_UNREVIEWED',intervals_ka:[],biological_coexistence:'NOT_ASSESSED'};
    const query={schema:'paleobot-chronology-v1',id:'query-window',entity_type:'archaeological_context',kind:'closed_interval',display:'Ventana de consulta',units:'ka_BP',source_ids:[],method:'Consulta del usuario',dating_relation:'unreported',intervals_ka:[[a,b]]};
    const result=C.reportedOverlap(r,query);
    return {...result,reason:result.status===STATES.UNKNOWN?'NO_FINITE_REPORTED_SUPPORT':result.status===STATES.NONE?'NO_OVERLAP_WITH_REPORTED_WINDOWS':'REPORTED_WINDOWS_INTERSECT',biological_coexistence:'NOT_ASSESSED'};
  }
  function compare(ids){
    if(!Array.isArray(ids)||ids.length<2||ids.length>3||new Set(ids).size!==ids.length||ids.some(id=>!item(id)))throw new TypeError('Select two or three distinct records');
    const pairs=[];
    for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){
      const a=record(ids[i]),b=record(ids[j]);
      const r=a&&b?C.reportedOverlap(a,b):{status:STATES.UNKNOWN,intervals_ka:[],biological_coexistence:'NOT_ASSESSED'};
      pairs.push({left:ids[i],right:ids[j],...r,biological_coexistence:'NOT_ASSESSED'});
    }
    return {records:ids.map(information),pairs};
  }
  function query({text='',young=0,old=30000,includeIndeterminate=true}={}){
    windowBounds(young,old);
    const term=String(text).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return frozenItems.map(s=>({info:information(s.id),decision:decision(s.id,young,old)})).filter(row=>{
      const name=(row.info.name+' '+row.info.id).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
      return (!term||name.includes(term))&&(includeIndeterminate||row.decision.status!==STATES.UNKNOWN);
    });
  }
  function bibliography(id){
    const s=item(id),r=record(id);if(!s)throw new RangeError('Unknown ID');
    const refs=s.experto&&Array.isArray(s.experto.referencias)?s.experto.referencias:[];
    return refs.map(ref=>({author:String(ref.a||''),year:ref.y||null,title:String(ref.t||''),journal:String(ref.j||''),doi:String(ref.d||'')}));
  }
  function csv(rows){
    const header=['id','nombre','tipo','cronologia','estado','ventanas_ka','procedencia'];
    const quote=x=>'"'+String(x??'').replace(/"/g,'""')+'"';
    return '\uFEFF'+[header,...rows.map(row=>[row.info.id,row.info.name,row.info.kind,row.info.chronology,row.decision.status,JSON.stringify(row.decision.intervals_ka),row.info.provenance])].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
  }
  return Object.freeze({schema:'paleobot-a3-c2-consultation-v1',status:'EXPERIMENTAL_NOT_DEPLOYMENT_APPROVED',states:STATES,ids:Object.freeze(frozenItems.map(s=>s.id)),reviewedIds:Object.freeze([...ids]),record,item,information,decision,compare,query,bibliography,csv,sourceProvenance:freezeDeep(structuredClone(source.provenance))});
});
