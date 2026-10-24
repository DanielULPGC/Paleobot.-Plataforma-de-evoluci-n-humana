/* Reproduce PB-01 en el módulo importado. No comprueba su corrección.
   Datos sintéticos, sin navegador, sin red y sin ejecución del Atlas completo. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
assert.ok(Number(process.versions.node.split('.')[0])>=20,'Se requiere Node 20 o superior');
const file='experimental/atlas-r98/fuentes/Auditoria_R98/assets/js/40-media/066-paleobot-v81-map-and-species-media-repair.js';
const code=fs.readFileSync(path.join(root,file),'utf8');
const hash=crypto.createHash('sha256').update(code).digest('hex');
assert.equal(hash,'72f59642fdbf4b1eca60ea71a7f55896fccea849da5f569a8013e5647624dc42',
  'El módulo cambió: la reproducción histórica no evalúa una corrección. Añada una prueba específica y documente el cambio.');
const audit=JSON.parse(fs.readFileSync(path.join(root,'src/entrada_ligera/image_audit.json'),'utf8'));
const records=JSON.parse(fs.readFileSync(path.join(root,'src/entrada_ligera/catalog.json'),'utf8')).records;
class FakeImg {
  constructor(id,url,map=false){
    this.id=id;this.src=url;this.alt=id;this.dataset=map?{visualRole:'map'}:{};
    this.classList={contains:c=>c==='sp-img-thumb',remove:()=>{}};
    this.host={dataset:{id}};
  }
  closest(){return this.host;}
  getAttribute(key){return key==='src'?this.src:null;}
  removeAttribute(key){if(key==='data-pb-v61-bound')delete this.dataset.pbV61Bound;}
  get currentSrc(){return this.src;}
}
const images=Object.entries(audit.verified).map(([id,item])=>new FakeImg(id,item.image_url));
const map=new FakeImg('proconsul',audit.verified.proconsul.image_url,true);images.push(map);
const document={readyState:'loading',documentElement:{dataset:{}},addEventListener:()=>{},
 querySelectorAll:()=>images,getElementById:()=>null};
const window={DB:records,getSpeciesThumb:sp=>audit.verified[sp.id]?.image_url||'',
 getSpeciesImage:sp=>audit.verified[sp.id]?.image_url||'',setTimeout:()=>0,requestAnimationFrame:()=>0};
const context=vm.createContext({window,document,HTMLImageElement:FakeImg,
 MutationObserver:class{observe(){}},setTimeout:()=>0});
vm.runInContext(code,context,{timeout:1000,filename:path.basename(file)});
window.PaleoBotV81MapAndSpeciesMediaRepair.repairSpeciesImages();
const replaced=images.slice(0,-1).filter(i=>i.src.startsWith('data:image/svg')).map(i=>i.id).sort();
assert.deepEqual(replaced,['boisei','proconsul','soloensis']);
assert.equal(images.slice(0,-1).length,47);
const preserved=images.slice(0,-1).filter(i=>i.src===audit.verified[i.id].image_url).length;
assert.equal(preserved,44);assert.equal(map.src,audit.verified.proconsul.image_url);
const result={executed_at:new Date().toISOString(),scope:'MODULE_066_SYNTHETIC_DOM_ONLY',
 source:file,source_sha256:hash,known_defect_reproduced:true,affected_ids:replaced,
 documented_resources:47,urls_preserved:preserved,map_control_preserved:true,
 full_application_executed:false,network_used:false,real_browser:false,moodle:false,
 corrected:false,release_gate:'NO_GO'};
fs.mkdirSync(path.join(root,'local-results'),{recursive:true});
fs.writeFileSync(path.join(root,'local-results/pb01.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
