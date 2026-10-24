/* Ensayo aislado del módulo multimedia original, con DOM simulado.
   No abre navegador ni conexiones, no importa el runtime completo y no lo modifica. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const root = __dirname;
const srcPath = path.join(root, 'evidencias_codigo/066-paleobot-v81-map-and-species-media-repair.js');
const code = fs.readFileSync(srcPath, 'utf8');
assert.equal(crypto.createHash('sha256').update(code).digest('hex'),'72f59642fdbf4b1eca60ea71a7f55896fccea849da5f569a8013e5647624dc42','La fuente no coincide con la revisada');
const audit = JSON.parse(fs.readFileSync(path.join(root, 'evidencias_codigo/image_audit.json')));
const records = JSON.parse(fs.readFileSync(path.join(root, 'evidencias_codigo/registros_prueba.json')));
class FakeImg {
  constructor(id, url, map=false) {
    this.id=id; this.src=url; this.alt=id; this.dataset=map?{visualRole:'map'}:{};
    this.classList={contains:c=>c==='sp-img-thumb',remove:()=>{}};
    this.host={dataset:{id}};
  }
  closest(){return this.host;}
  getAttribute(k){return k==='src'?this.src:null;}
  removeAttribute(k){if(k==='data-pb-v61-bound') delete this.dataset.pbV61Bound;}
  get currentSrc(){return this.src;}
}
const imgs=Object.entries(audit.verified).map(([id,x])=>new FakeImg(id,x.image_url));
const mapControl=new FakeImg('proconsul',audit.verified.proconsul.image_url,true);
imgs.push(mapControl);
const listeners=[];
const document={readyState:'loading',documentElement:{dataset:{}},
  addEventListener:(...x)=>listeners.push(x),querySelectorAll:()=>imgs,getElementById:()=>null};
const window={DB:records,getSpeciesThumb:sp=>audit.verified[sp.id]?.image_url||'',
  getSpeciesImage:sp=>audit.verified[sp.id]?.image_url||'',setTimeout:()=>0,requestAnimationFrame:()=>0};
const context=vm.createContext({window,document,HTMLImageElement:FakeImg,
  MutationObserver:class {constructor(){} observe(){}},setTimeout:()=>0});
vm.runInContext(code,context,{timeout:1000,filename:path.basename(srcPath)});
window.PaleoBotV81MapAndSpeciesMediaRepair.repairSpeciesImages();
const changes=imgs.slice(0,-1).filter(i=>i.src.startsWith('data:image/svg')).map(i=>({id:i.id,before:audit.verified[i.id].image_url,after_prefix:i.src.slice(0,70),alt:i.alt}));
assert.deepEqual(changes.map(x=>x.id).sort(),['boisei','proconsul','soloensis']);
assert.equal(mapControl.src,audit.verified.proconsul.image_url);
assert.equal(imgs.slice(0,-1).length,47);
assert.equal(imgs.slice(0,-1).filter(i=>i.src===audit.verified[i.id].image_url).length,44);
const result={date:'2026-10-24',test:'Original module 066 with 47 documented image URLs and one map control',
  source_sha256:crypto.createHash('sha256').update(code).digest('hex'),
  isolation:{synthetic_dom:true,real_browser:false,moodle:false,network:false,full_app:false},
  records:47,valid_urls_replaced:changes,valid_urls_preserved:44,map_exclusion_preserved:true,
  verdict:'REPRODUCED_IN_ISOLATION; FINAL_BROWSER_PRESENTATION_NOT_TESTED',
  remediation:'La detección debe distinguir origen de reserva y recurso canónico de la propia ficha; no autoriza retirar el reparador completo sin regresión de imágenes, mapas y errores.'};
fs.writeFileSync(path.join(root,'resultado_reproduccion_actual.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
