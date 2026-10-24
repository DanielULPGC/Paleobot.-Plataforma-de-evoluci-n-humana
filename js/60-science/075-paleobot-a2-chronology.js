/* Exact A2 function bodies; only the CommonJS export is adapted for the browser. */
(function(root){
'use strict';
// A2 isolated scientific prototype. NOT loaded by PaleoBot's production index.
const KINDS=new Set(['point_estimate','minimum_age','maximum_age','closed_interval','alternative_intervals','unknown']);
const ENTITIES=new Set(['specimen','population','taxon','lineage','archaeological_context']);
function fail(message){throw new TypeError('CHRONOLOGY: '+message)}
function finite(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=30000}
function validate(record){
 if(!record||typeof record!=='object'||Array.isArray(record))fail('record');
 if(record.schema!=='paleobot-chronology-v1')fail('schema');
 if(typeof record.id!=='string'||!record.id)fail('id');
 if(!ENTITIES.has(record.entity_type))fail('entity_type');
 if(!KINDS.has(record.kind))fail('kind');
 if(typeof record.display!=='string'||!record.display.trim())fail('display');
 if(record.units!=='ka_BP')fail('units');
 if(!Array.isArray(record.source_ids)||!record.source_ids.every(x=>typeof x==='string'&&x))fail('source_ids');
 if(typeof record.method!=='string'||!record.method)fail('method');
 if(!['direct','indirect','mixed','unreported'].includes(record.dating_relation))fail('dating_relation');
 const numeric=['point_estimate','minimum_age','maximum_age'].includes(record.kind);
 if(numeric!==Object.hasOwn(record,'estimate_ka'))fail('estimate_ka presence');
 if(numeric&&!finite(record.estimate_ka))fail('estimate_ka');
 if(Object.hasOwn(record,'uncertainty')){
  const u=record.uncertainty;
  if(!numeric||!u||!finite(u.value_ka)||typeof u.definition!=='string'||!u.definition.trim())fail('uncertainty');
 }
 const intervalKind=['closed_interval','alternative_intervals'].includes(record.kind);
 if(intervalKind!==Object.hasOwn(record,'intervals_ka'))fail('intervals_ka presence');
 if(intervalKind){
  const a=record.intervals_ka;
  if(!Array.isArray(a)||a.length<1||(record.kind==='closed_interval'&&a.length!==1))fail('interval count');
  for(let i=0;i<a.length;i++){
   const p=a[i];if(!Array.isArray(p)||p.length!==2||!finite(p[0])||!finite(p[1])||p[0]>p[1])fail('interval bounds');
   if(i>0&&a[i-1][1]>=p[0])fail('intervals must be ordered, disjoint and non-touching');
  }
 }
 if(record.legacy_visual_anchor_Ma!==undefined&&(!finite(record.legacy_visual_anchor_Ma)||record.legacy_visual_anchor_Ma>30))fail('legacy anchor');
 if(record.legacy_projectable!==undefined&&typeof record.legacy_projectable!=='boolean')fail('legacy_projectable');
 if(record.legacy_projectable===true&&!(record.entity_type==='taxon'&&record.kind==='closed_interval'&&record.semantic_scope==='taxon_occupancy'))fail('unsafe legacy projection');
 return true;
}
function reportedWindows(record){
 validate(record);
 if(!['closed_interval','alternative_intervals'].includes(record.kind))return {status:'INDETERMINATE',intervals_ka:[],reason:'No finite reported interval support; an estimate or minimum is not a taxon duration.'};
 return {status:'REPORTED_SUPPORT',intervals_ka:record.intervals_ka.map(x=>x.slice()),reason:'Reported age windows, not proof of continuous occupancy or exhaustive historical absence.'};
}
function intersect(a,b){
 const hits=[];
 for(const x of a)for(const y of b){const young=Math.max(x[0],y[0]),old=Math.min(x[1],y[1]);if(young<=old)hits.push([young,old]);}
 hits.sort((x,y)=>x[0]-y[0]||x[1]-y[1]);
 const result=[];
 for(const x of hits){const last=result[result.length-1];if(last&&x[0]<=last[1])last[1]=Math.max(last[1],x[1]);else result.push(x.slice());}
 return result;
}
function reportedOverlap(a,b){
 const aa=reportedWindows(a),bb=reportedWindows(b);
 if(aa.status!=='REPORTED_SUPPORT'||bb.status!=='REPORTED_SUPPORT')return {status:'INDETERMINATE',intervals_ka:[],biological_coexistence:'NOT_ASSESSED'};
 const hits=intersect(aa.intervals_ka,bb.intervals_ka);
 return {status:hits.length?'POSSIBLE_REPORTED_SUPPORT_OVERLAP':'NO_REPORTED_SUPPORT_OVERLAP',intervals_ka:hits,biological_coexistence:'NOT_ASSESSED'};
}
function projectLegacyRange(record){
 validate(record);
 if(record.legacy_projectable!==true)return {ok:false,reason:'LEGACY_SEMANTIC_PROJECTION_NOT_QUALIFIED'};
 const [young,old]=record.intervals_ka[0];
 return {ok:true,start:old/1000,end:young/1000,unit:'Ma'};
}
root.PaleoBotChronologyA2=Object.freeze({validate,reportedWindows,reportedOverlap,projectLegacyRange});

})(globalThis);
