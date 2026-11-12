(() => {
  'use strict';
  const KEY='supervivencia-enhancements-v1';
  const META='supervivencia-item-meta-v1';
  const FAMILY='supervivencia-family-extra-v1';
  const VERSION='v40';
  const $=(s,r=document)=>r.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=(k,d={})=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch(_){return d}};
  const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(_){return false}};
  let meta=read(META,{}), family=read(FAMILY,{allergies:'',medication:''});
  const groups={
    kit:[['Aigua i aliments',['water','food']],['Llum i energia',['flash','batteries','power','chargers','radio']],['Salut i higiene',['firstaid','hygiene','paper','masks']],['Protecció i eines',['candles','matches','blankets','tools','gloves']],['Documents i diners',['cash','docs']]],
    bag:[['Aigua i alimentació',['water','food']],['Llum i comunicació',['flash','radio','power']],['Salut i protecció',['firstaid','mask','gloves']],['Roba i eines',['thermal','multitool','clothes','rain']],['Documents i diners',['docs','cash']],['Higiene',['hygiene']]]
  };
  function setMeta(id,field,value,type){meta[type+'-'+id]={...(meta[type+'-'+id]||{}),[field]:value};write(META,meta)}
  function checklistEnhance(){
    const page=$('.page'); if(!page)return;
    const list=$('.list',page); if(!list||list.dataset.enhanced)return;
    const type=$('input[data-type]',list)?.dataset.type;if(!type)return;
    list.dataset.enhanced='1';
    const labels=[...list.querySelectorAll('.check')];
    const bucket=groups[type]||[['Material',['water','food','flash','radio','power','firstaid','thermal','multitool','gloves','clothes','rain','hygiene','docs','cash','whistle','mask']]];
    list.innerHTML=bucket.map(([name,ids])=>{
      const rows=labels.filter(l=>ids.includes($('input',l)?.dataset.id));
      if(!rows.length)return '';
      return '<details class="check-category" open><summary>'+name+' <span>'+rows.filter(l=>$('input',l).checked).length+'/'+rows.length+'</span></summary><div class="check-category-body">'+rows.map(l=>{
        const input=$('input',l),id=input.dataset.id,old=meta[type+'-'+id]||{};
        return '<div class="check-enhanced">'+l.outerHTML+'<div class="item-meta"><label>Quantitat<input type="text" data-meta-type="'+type+'" data-meta-id="'+id+'" data-meta-field="qty" value="'+esc(old.qty||'')+'" placeholder="Ex. 6 unitats"></label><label>Caducitat / revisió<input type="date" data-meta-type="'+type+'" data-meta-id="'+id+'" data-meta-field="expiry" value="'+esc(old.expiry||'')+'"></label></div></div>';
      }).join('')+'</div></details>';
    }).join('');
    list.querySelectorAll('input[type=checkbox]').forEach(el=>el.addEventListener('change',()=>{const t=el.dataset.type,id=el.dataset.id;const data=read('supervivencia-v2',{});data[t]=data[t]||{};data[t][id]=el.checked;write('supervivencia-v2',data);el.closest('.check')?.classList.toggle('done',el.checked);const all=[...list.querySelectorAll('input[type=checkbox]')],done=all.filter(x=>x.checked).length,pc=Math.round(done/all.length*100),pcLabel=$('.progress-row strong'),pcBar=$('.progress i');if(pcLabel)pcLabel.textContent=pc+'%';if(pcBar)pcBar.style.width=pc+'%';const details=el.closest('details');if(details){const inputs=[...details.querySelectorAll('input[type=checkbox]')];$('summary span',details).textContent=inputs.filter(x=>x.checked).length+'/'+inputs.length;}refreshScore();}));
    list.querySelectorAll('[data-meta-field]').forEach(el=>el.addEventListener('change',()=>setMeta(el.dataset.metaId,el.dataset.metaField,el.value,el.dataset.metaType)));
  }
  function familyEnhance(){
    const form=$('#familyForm');if(!form||form.dataset.extra)return;form.dataset.extra='1';
    const extra=document.createElement('div');extra.className='family-extra';
    extra.innerHTML='<div class="field"><label>Al·lèrgies importants</label><textarea name="allergies" placeholder="Persona, al·lèrgia i què cal fer">'+esc(family.allergies||'')+'</textarea></div><div class="field"><label>Medicació i necessitats mèdiques</label><textarea name="medication" placeholder="Medicació, dosi, pauta i necessitats importants">'+esc(family.medication||'')+'</textarea></div>';
    const submit=form.querySelector('button[type=submit]');form.insertBefore(extra,submit);
    form.addEventListener('input',()=>{const f=new FormData(form);family={allergies:f.get('allergies')||'',medication:f.get('medication')||''};write(FAMILY,family);});
  }
  function addOfflineNotice(){
    const main=$('#main');if(!main||$('#offlineStatus'))return;
    const n=document.createElement('div');n.id='offlineStatus';n.className='offline-status';n.innerHTML='<span>●</span> Funciona sense internet <small>Un cop carregada i actualitzada</small>';
    main.prepend(n);
  }
  function addDataTools(){
    if($('#dataTools'))return;
    const page=$('.page');if(!page)return;
    const card=document.createElement('section');card.className='info data-tools';card.id='dataTools';
    card.innerHTML='<h2>🔐 Les teves dades</h2><p>Les dades es guarden només en aquest dispositiu. Exporta una còpia JSON per conservar-ho tot.</p><div class="data-actions"><button class="btn blue" id="exportBackup">⬇ Exportar còpia JSON</button><button class="btn light" id="importBackup">⬆ Importar còpia JSON</button><input id="backupFile" type="file" accept="application/json,.json" hidden><button class="btn light" id="printPlan">🖨️ Imprimir / desar PDF</button></div><p class="small" id="backupStatus" aria-live="polite"></p>';
    page.append(card);
    $('#exportBackup').onclick=()=>{const payload={app:'Supervivència',version:VERSION,exportedAt:new Date().toISOString(),data:Object.fromEntries(Object.keys(localStorage).filter(k=>k.startsWith('supervivencia-')).map(k=>[k,localStorage.getItem(k)]))};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='supervivencia-copia-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);$('#backupStatus').textContent='Còpia exportada. Desa-la fora del telèfon.'};
    $('#importBackup').onclick=()=>$('#backupFile').click();
    $('#backupFile').onchange=async e=>{const file=e.target.files?.[0];if(!file)return;try{const obj=JSON.parse(await file.text()),entries=obj.data||obj;if(!entries||typeof entries!=='object')throw Error('Format no vàlid');if(!confirm('La importació substituirà les dades locals de Supervivència. Vols continuar?'))return;Object.entries(entries).forEach(([k,v])=>{if(k.startsWith('supervivencia-')&&typeof v==='string')localStorage.setItem(k,v)});alert('Còpia importada. L’app es tornarà a carregar.');location.reload()}catch(err){$('#backupStatus').textContent='No s’ha pogut importar: '+err.message}finally{e.target.value=''}};
    $('#printPlan').onclick=()=>{const f=read('supervivencia-v2',{}).family||{},x=read(FAMILY,{});const w=window.open('','_blank');if(!w){alert('Permet les finestres emergents per imprimir el pla.');return;}w.document.write('<!doctype html><html lang="ca"><meta charset="utf-8"><title>Pla familiar · Supervivència</title><style>body{font:16px Arial;max-width:800px;margin:32px auto;color:#17243a}h1{color:#a82020}h2{margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:6px}p{white-space:pre-wrap;line-height:1.5}.muted{color:#667}</style><h1>Pla familiar d’emergència</h1><p>Imprès el '+new Date().toLocaleDateString('ca-ES')+'</p>'+[['Família',f.name],['Adreça',f.address],['Contacte principal',f.contact],['Punt de trobada',f.meeting],['Punt alternatiu',f.meeting2],['Contacte fora de la zona',f.outside],['Membres i telèfons',f.members],['Al·lèrgies',x.allergies],['Medicació',x.medication],['Altres instruccions',f.notes]].map(([a,b])=>'<h2>'+a+'</h2><p>'+(esc(b||'No indicat'))+'</p>').join('')+'<p class="muted">Guarda aquest document en un lloc accessible. Protegeix les dades personals.</p><script>window.onload=()=>window.print()<\/script></html>');w.document.close()};
  }
  function refreshScore(){
    const data=read('supervivencia-v2',{}),kit=Object.values(data.kit||{}).filter(Boolean).length/18*100,bag=Object.values(data.bag||{}).filter(Boolean).length/16*100,f=data.family||{},filled=['contact','meeting','meeting2','outside','members'].filter(k=>String(f[k]||'').trim()).length+(family.allergies?1:0)+(family.medication?1:0),plan=Math.min(100,filled/7*100),score=Math.round(kit*.35+bag*.35+plan*.3);
    const ring=$('.score-ring span'),status=$('.score strong');if(ring)ring.textContent=score+'%';if($('.score-ring'))$('.score-ring').style.setProperty('--p',(score*3.6)+'deg');if(status)status.textContent=score>=80?'Molt bé! Estàs ben preparat.':score>=50?'Vas pel bon camí.':'Comença pels bàsics.';
    const p=$('.score .small');if(p)p.textContent='Kit, motxilla i pla familiar. Següent pas: '+(kit<=bag&&kit<=plan?'completa el Kit de casa':bag<=plan?'completa la Motxilla':'completa el Pla familiar')+'. Toca per veure com millorar-lo.';
  }
  function addNavAndHome(){
    const nav=$('.bottom-nav');if(nav&&!nav.dataset.updated){nav.dataset.updated='1';nav.innerHTML='<button data-route="home"><span>🏠</span><small>Inici</small></button><button data-route="kit"><span>🧰</span><small>Kit</small></button><button data-route="now" class="nav-now"><span>🚨</span><small>Ara</small></button><button data-route="bag"><span>🎒</span><small>Motxilla</small></button><button data-route="phone"><span>☎️</span><small>Guia</small></button>';nav.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.route;window.scrollTo(0,0)}));}
    const page=$('.page');if(page&&location.hash.replace('#','')==='home'&&!page.querySelector('[data-extra-go=more]')){const grid=$('.grid',page);if(grid){const tile=document.createElement('article');tile.className='card tile';tile.dataset.extraGo='more';tile.innerHTML='<span class="emoji">☰</span><div><h3>Més eines</h3><p>Mapes, ràdio, guies, simulador i còpies de seguretat</p></div>';tile.onclick=()=>location.hash='more';grid.append(tile)}}
  }
  function reduceEmergencySteps(){if(!location.hash.startsWith('#emergency-'))return;const steps=$('.steps');if(!steps)return;const rows=[...steps.children];if(rows.length>5){const last=rows.splice(4);const combined=last.map(x=>x.querySelector('p')?.textContent).filter(Boolean).join(' ');rows.push(Object.assign(document.createElement('div'),{className:'step',innerHTML:'<span>5</span><p>'+esc(combined)+'</p>'}));steps.replaceChildren(...rows)}}
  function installHelp(){const b=$('#installBtn');if(!b||b.dataset.iosHelp)return;b.dataset.iosHelp='1';b.addEventListener('click',()=>{const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);if(ios)alert('Per instal·lar-la a iPhone o iPad:\n1. Prem Compartir (el quadrat amb la fletxa).\n2. Tria «Afegeix a la pantalla d’inici».\n3. Confirma amb «Afegeix».\n\nSi no apareix l’opció, obre aquesta pàgina amb Safari.');});}
  function reviewReminder(){
    const page=$('.page');if(!page||$('#bagReviewReminder'))return;
    if(location.hash.replace('#','')==='bag'){
      const last=localStorage.getItem('supervivencia-bag-reviewed-v1'),due=!last||(Date.now()-Number(last))>183*86400000;
      const box=document.createElement('section');box.id='bagReviewReminder';box.className='info '+(due?'review-due':'');
      box.innerHTML='<strong>📅 Revisió de la motxilla cada 6 mesos</strong><p>'+(due?'Toca revisar aigua, aliments, piles, medicació, talles i caducitats.':'Darrera revisió: '+new Date(Number(last)).toLocaleDateString('ca-ES')+'.')+'</p><button class="btn light" id="markBagReviewed">He revisat la motxilla avui</button>';
      const hero=$('.hero',page);if(hero)hero.after(box);else page.prepend(box);
      $('#markBagReviewed').onclick=()=>{localStorage.setItem('supervivencia-bag-reviewed-v1',String(Date.now()));box.classList.remove('review-due');$('p',box).textContent='Darrera revisió: '+new Date().toLocaleDateString('ca-ES')+'.';};
    }
  }
  function decorate(){
    addNavAndHome();addOfflineNotice();reviewReminder();
    if(location.hash.replace('#','')==='kit'||location.hash.replace('#','')==='bag')checklistEnhance();
    if(location.hash.replace('#','')==='family')familyEnhance();
    if(location.hash.replace('#','')==='more')addDataTools();
    if(location.hash.replace('#','')==='home')refreshScore();
    reduceEmergencySteps();installHelp();
  }
  const old=window.decorateFeatures;
  window.decorateFeatures=()=>{if(old)old();decorate()};
  document.addEventListener('input',e=>{if(e.target.matches('[data-meta-field]'))setMeta(e.target.dataset.metaId,e.target.dataset.metaField,e.target.value,e.target.dataset.metaType)});
  window.addEventListener('hashchange',()=>setTimeout(decorate,0));
  window.addEventListener('load',()=>setTimeout(decorate,0));
  setTimeout(decorate,60);
})();
