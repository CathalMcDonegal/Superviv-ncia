(() => {
  const FOOD_KEY = 'supervivencia-food-v1';
  const OSM_TILE = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
  const RADIO = [
    ['VHF','145.500 MHz','Freqüència simplex de crida / coordinació','FM','📻'],
    ['VHF','145.550 MHz','Ús FM indicat a Espanya en la taula IARU R1','FM','🇪🇸'],
    ['UHF','433.500 MHz','Freqüència simplex de crida / coordinació','FM','📻'],
    ['UHF','433.550 MHz','Ús FM indicat a Espanya en la taula IARU R1','FM','🇪🇸'],
    ['HF','7.110 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺'],
    ['HF','3.760 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺'],
    ['HF','14.300 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺']
  ];
  const FOOD = [
    ['llegums','🫘','Llegums cuits'], ['tonyina','🐟','Tonyina i peix en llauna'],
    ['carn','🥫','Conserves de carn'], ['verdures','🍅','Tomàquet i verdures en conserva'],
    ['galetes','🥨','Galetes i crackers'], ['fruits-secs','🥜','Fruits secs'],
    ['barretes','🍫','Barretes energètiques'], ['fruita','🍑','Fruita en conserva'],
    ['llet','🥛','Llet UHT'], ['sucs','🧃','Sucs de llarga durada'],
    ['arros-pasta','🍚','Arròs i pasta'], ['cereals','🌾','Cereals']
  ];
  function loadFood() { try { return JSON.parse(localStorage.getItem(FOOD_KEY) || '{}'); } catch (_) { return {}; } }
  function saveFood(data) { localStorage.setItem(FOOD_KEY, JSON.stringify(data)); }
  function foodMenu(type) {
    const saved = loadFood();
    return `<div class="food-submenu" data-food-menu="${type}"><div class="food-title">🥫 Exemples de menjar per tenir preparat</div><div class="food-grid">${FOOD.map(([id, icon, name]) => { const key = `${type}-${id}`; return `<label class="food-option ${saved[key] ? 'done' : ''}"><input type="checkbox" data-food-item="${id}" data-food-type="${type}" ${saved[key] ? 'checked' : ''}><span>${icon}</span><span>${name}</span></label>`; }).join('')}</div><p>Selecciona també els aliments que ja tens preparats. Les seleccions es guarden al dispositiu.</p></div>`;
  }
  function syncFoodVisibility(input) { const menu = input.closest('.check')?.nextElementSibling; if (!menu?.classList.contains('food-submenu')) return; menu.hidden = input.checked; }
  function addFoodMenus() { document.querySelectorAll('input[data-id="food"]').forEach(input => { const label = input.closest('.check'); if (!label) return; const type = input.dataset.type || 'kit'; if (!label.nextElementSibling?.classList.contains('food-submenu')) label.insertAdjacentHTML('afterend', foodMenu(type)); syncFoodVisibility(input); }); }
  function toolCards() {
    return `<article class="card tile feature-tile" data-feature="map"><span class="emoji">🗺️</span><div><h3>Mapa real</h3><p>Mapa de carrers i carreteres amb OpenStreetMap.</p></div></article><article class="card tile feature-tile" data-feature="radio"><span class="emoji">📡</span><div><h3>Freqüències d’emergència</h3><p>HF · VHF · UHF per comunicacions d’emergència.</p></div></article>`;
  }
  function addTools() { document.querySelectorAll('.feature-tools').forEach(x => x.remove()); const pages = document.querySelectorAll('.page'); if (!pages.length) return; const page = pages[0]; const box = document.createElement('div'); box.className = 'feature-tools'; box.innerHTML = `<div class="section-title"><h2>🧭 Eines d’emergència</h2></div><div class="grid">${toolCards()}</div>`; page.appendChild(box); }
  const mapState = { lat: 41.75, lon: 1.75, zoom: 8, poi: true };
  function deg2num(lat, lon, z) { const n = 2 ** z; const x = (lon + 180) / 360 * n; const latRad = lat * Math.PI / 180; const y = (1 - Math.asinh(Math.tan(latRad)) / Math.PI) / 2 * n; return {x,y}; }
  function num2deg(x,y,z) { const n=2**z; const lon=x/n*360-180; const latRad=Math.atan(Math.sinh(Math.PI*(1-2*y/n))); return {lat:latRad*180/Math.PI,lon}; }
  function tileHtml(x,y,z,cls='') { const n=2**z; const xx=((x%n)+n)%n; if(y<0||y>=n)return ''; return `<img class="osm-tile ${cls}" draggable="false" src="${OSM_TILE.replace('{z}',z).replace('{x}',xx).replace('{y}',y)}" alt="">`; }
  function mapPage() {
    return `<div class="page feature-page"><button class="back-link" data-feature-back>‹ Tornar</button><section class="hero"><div class="hero-kicker">🗺️ MAPA REAL</div><h1>Mapa d’emergència</h1><p>Mapa real de carrers, carreteres i poblacions. Pots ampliar, reduir, arrossegar-lo i situar-te amb el GPS.</p></section><div class="map-card real-map-card"><div class="map-toolbar"><button class="map-action" data-map-action="locate">📍 La meva ubicació</button><button class="map-action" data-map-action="poi">🚨 Serveis d’emergència</button><button class="map-reset" data-map-action="reset">⟳ Centrar</button></div><div class="map-controls"><button data-map-action="in" aria-label="Ampliar">＋</button><button data-map-action="out" aria-label="Reduir">−</button></div><div class="map-viewport real-map" id="mapViewport"><div class="map-canvas" id="mapCanvas"></div><div class="map-loading" id="mapLoading">Carregant mapa…</div><div class="map-location" id="mapLocation" hidden>📍</div><div class="map-pois" id="mapPois"></div></div></div><div class="map-attribution">© OpenStreetMap contributors</div><div class="map-legend"><strong>🚨 Segona capa</strong><span>Activa «Serveis d’emergència» per mostrar hospitals, bombers, policia, benzineres i punts d’aigua de la zona visible.</span></div><div class="info"><strong>ℹ️ Connexió</strong><p>El mapa real necessita internet per carregar la cartografia. La resta de l’app continua funcionant sense connexió.</p></div></div>`;
  }
  function renderTiles() {
    const vp=document.getElementById('mapViewport'), canvas=document.getElementById('mapCanvas'), loading=document.getElementById('mapLoading'); if(!vp||!canvas)return;
    const z=mapState.zoom, center=deg2num(mapState.lat,mapState.lon,z), size=256, cols=Math.ceil(vp.clientWidth/size)+2, rows=Math.ceil(vp.clientHeight/size)+2;
    const startX=Math.floor(center.x-cols/2), startY=Math.floor(center.y-rows/2), offsetX=vp.clientWidth/2-(center.x-startX)*size, offsetY=vp.clientHeight/2-(center.y-startY)*size;
    canvas.innerHTML=''; canvas.style.width=`${cols*size}px`; canvas.style.height=`${rows*size}px`; canvas.style.transform=`translate(${offsetX}px,${offsetY}px)`;
    for(let y=0;y<rows;y++) for(let x=0;x<cols;x++){ const node=document.createElement('div'); node.className='osm-tile-wrap'; node.style.left=`${x*size}px`; node.style.top=`${y*size}px`; node.innerHTML=tileHtml(startX+x,startY+y,z); canvas.appendChild(node); }
    loading.hidden=false; let count=0; canvas.querySelectorAll('img').forEach(im=>{im.onload=()=>{count++;if(count>=Math.min(3,canvas.querySelectorAll('img').length))loading.hidden=true};im.onerror=()=>{count++;if(count>=Math.min(3,canvas.querySelectorAll('img').length))loading.hidden=true};});
    if(mapState.poi) loadPOIs();
  }
  function mapMove(dx,dy){ const z=mapState.zoom,c=deg2num(mapState.lat,mapState.lon,z); const next=num2deg(c.x-dx/256,c.y-dy/256,z); mapState.lat=Math.max(-85,Math.min(85,next.lat)); mapState.lon=next.lon; renderTiles(); }
  function locate(){ if(!navigator.geolocation){alert('Aquest dispositiu no permet obtenir la ubicació.');return;} const loading=document.getElementById('mapLoading'); if(loading){loading.textContent='Obtenint ubicació…';loading.hidden=false;} navigator.geolocation.getCurrentPosition(p=>{mapState.lat=p.coords.latitude;mapState.lon=p.coords.longitude;mapState.zoom=Math.max(mapState.zoom,14); const marker=document.getElementById('mapLocation'); if(marker){marker.hidden=false;marker.style.left='50%';marker.style.top='50%';} renderTiles();},()=>alert('No s’ha pogut obtenir la ubicació. Revisa el permís de localització.'),{enableHighAccuracy:true,timeout:10000,maximumAge:60000}); }
  let poiT;function loadPOIs(){clearTimeout(poiT);poiT=setTimeout(loadPOIsNow,700)}async function loadPOIsNow(){ const box=document.getElementById('mapPois'); if(!box)return; box.innerHTML='<div class="poi-status">Carregant serveis…</div>'; const z=mapState.zoom,c=deg2num(mapState.lat,mapState.lon,z), span=Math.min(0.5,120/2**z); const s=Math.max(-85,mapState.lat-span),n=Math.min(85,mapState.lat+span),w=mapState.lon-span,e=mapState.lon+span; const q=`[out:json][timeout:10];(node[amenity=hospital](${s},${w},${n},${e});node[amenity=police](${s},${w},${n},${e});node[amenity=fire_station](${s},${w},${n},${e});node[amenity=fuel](${s},${w},${n},${e});node[amenity=drinking_water](${s},${w},${n},${e}););out center;`; try{const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'data='+encodeURIComponent(q)}); if(!r.ok)throw new Error('HTTP '+r.status); const data=await r.json(); box.innerHTML=''; const icons={hospital:'🏥',police:'👮',fire_station:'🚒',fuel:'⛽',drinking_water:'💧'}; data.elements.slice(0,80).forEach(p=>{const lat=p.lat??p.center?.lat,lon=p.lon??p.center?.lon;if(lat==null||lon==null)return; const pos=deg2num(lat,lon,z), left=50+(pos.x-c.x)*256/document.getElementById('mapViewport').clientWidth*100, top=50+(pos.y-c.y)*256/document.getElementById('mapViewport').clientHeight*100; const m=document.createElement('button');m.className='poi-marker';m.style.left=left+'%';m.style.top=top+'%';m.title=p.tags?.name||'Servei d’emergència';m.textContent=icons[p.tags?.amenity]||'🚨';box.appendChild(m);}); }catch(e){box.innerHTML='<div class="poi-status">No s’han pogut carregar els serveis ara mateix.</div>';}}
  function bindMap(){ const vp=document.getElementById('mapViewport'); if(!vp)return; renderTiles(); let sx=0,sy=0,drag=false,lastX=0,lastY=0; let tx=0,ty=0;const cv=document.getElementById('mapCanvas'),pv=document.getElementById('mapPois'),end=()=>{if(!drag)return;drag=false;cv.style.translate='';pv.style.translate='';const a=tx,b=ty;tx=ty=0;if(a||b)mapMove(a,b)}; vp.addEventListener('pointerdown',e=>{drag=true;tx=ty=0;lastX=e.clientX;lastY=e.clientY;vp.setPointerCapture(e.pointerId)}); vp.addEventListener('pointermove',e=>{if(!drag)return;tx+=e.clientX-lastX;ty+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY;const t=`${tx}px ${ty}px`;cv.style.translate=t;pv.style.translate=t}); vp.addEventListener('pointerup',end);vp.addEventListener('pointercancel',end); document.querySelectorAll('[data-map-action]').forEach(b=>b.addEventListener('click',()=>{const a=b.dataset.mapAction;if(a==='in')mapState.zoom=Math.min(18,mapState.zoom+1);if(a==='out')mapState.zoom=Math.max(3,mapState.zoom-1);if(a==='reset'){mapState.lat=41.75;mapState.lon=1.75;mapState.zoom=8;}if(a==='locate')return locate();if(a==='poi'){mapState.poi=!mapState.poi;b.classList.toggle('active',mapState.poi);if(mapState.poi)loadPOIs();else document.getElementById('mapPois').innerHTML='';return;}renderTiles();})); window.addEventListener('resize',renderTiles,{once:true}); }
  function radioPage(){ return `<div class="page feature-page"><button class="back-link" data-feature-back>‹ Tornar</button><section class="hero hero-radio"><div class="hero-kicker">📡 RADIOCOMUNICACIONS</div><h1>Freqüències d’emergència</h1><p>Freqüències de referència per radioaficionats. Escolta abans de transmetre i prioritza sempre el trànsit d’emergència.</p></section><div class="radio-note">⚠️ Les freqüències són centres d’activitat, no canals exclusius d’emergència. Pot haver-hi QRM i ús local.</div><div class="freq-list">${RADIO.map(r=>`<div class="freq-card"><div class="freq-top"><span>${r[4]} ${r[0]}</span><strong>${r[1]}</strong></div><p>${r[2]}</p><small>${r[3]}</small></div>`).join('')}</div><div class="info"><strong>📻 Regla ràpida</strong><p>En cas d’emergència, mantén l’escolta, deixa lliure la freqüència quan hi hagi trànsit prioritari i segueix les instruccions dels coordinadors.</p></div></div>`; }

  const PHONE_DATA = [
    {area:'Catalunya',group:'Emergències',icon:'🚨',name:'Emergències (112)',number:'112',note:'Policia, bombers, ambulàncies, rescats i qualsevol situació de risc. Gratuït, 24 h.',urgent:true},
    {area:'Catalunya',group:'Salut',icon:'🩺',name:'061 · Salut Respon',number:'061',note:'Consultes i problemes de salut que no siguin una emergència vital. 24 h.'},
    {area:'Catalunya',group:'Administració',icon:'🏛️',name:'Generalitat · informació',number:'012',note:'Informació i tràmits de la Generalitat.'},
    {area:'Catalunya',group:'Atenció i protecció',icon:'🛟',name:'Atenció a les dones · violència masclista',number:'900900120',note:'Atenció gratuïta i confidencial, 24 h.'},
    {area:'Catalunya',group:'Atenció i protecció',icon:'🧒',name:'Infància Respon',number:'116111',note:'Ajuda davant situacions de risc o maltractament a infants i adolescents.'},
    {area:'Catalunya',group:'Carreteres',icon:'🚗',name:'Servei Català de Trànsit · informació',number:'012',note:'Informació viària. Des de fora de Catalunya: 932 142 124.'},
    {area:'Espanya',group:'Emergències',icon:'🚨',name:'Emergències generals',number:'112',note:'Número únic d’emergències a tot l’Estat. Gratuït.',urgent:true},
    {area:'Espanya',group:'Seguretat',icon:'👮',name:'Policia Nacional',number:'091',note:'Policia Nacional.'},
    {area:'Espanya',group:'Seguretat',icon:'🛡️',name:'Guàrdia Civil',number:'062',note:'Guàrdia Civil.'},
    {area:'Espanya',group:'Atenció i protecció',icon:'🟣',name:'Atenció a víctimes de violència de gènere',number:'016',note:'Atenció gratuïta. No deixa rastre a la factura, però cal esborrar la trucada del registre del dispositiu.'},
    {area:'Espanya',group:'Atenció i protecció',icon:'💚',name:'Atenció a la conducta suïcida',number:'024',note:'Línia d’ajuda per a persones amb pensaments o risc de conducta suïcida.'},
    {area:'Europa',group:'Emergències',icon:'🇪🇺',name:'Número europeu d’emergències',number:'112',note:'Funciona als 27 països de la Unió Europea i en altres països europeus. Gratuït.',urgent:true},
    {area:'Estrangers',group:'Ajuda i assistència',icon:'🌍',name:'Emergències amb atenció multilingüe',number:'112',note:'A Catalunya poden atendre en català, castellà, anglès, francès i alemany; per a altres llengües poden activar interpretació.',urgent:true},
    {area:'Estrangers',group:'Viatges',icon:'🛂',name:'Consolat o ambaixada del teu país',number:'',note:'El telèfon d’emergència consular depèn de la nacionalitat i del país on et trobis. Desa’l abans de viatjar.',link:'https://www.exteriores.gob.es/'},
    {area:'Estrangers',group:'Viatges',icon:'🧳',name:'Assegurança de viatge',number:'',note:'Afegeix el telèfon d’assistència de la teva assegurança a Contactes personals.'}
  ];
  const PHONE_KEY = 'supervivencia-phone-contacts-v1';
  function readPhoneContacts(){try{return JSON.parse(localStorage.getItem(PHONE_KEY)||'[]')}catch(_){return[]}}
  function phonePage(){
    return `<div class="page feature-page"><button class="back-link" data-feature-back>‹ Tornar</button>
      <section class="hero hero-phone"><div class="hero-kicker">☎️ CONTACTES ESSENCIALS</div><h1>Guia telefònica</h1><p>Telèfons útils per a emergències, salut, seguretat i viatges. Disponible sense connexió.</p><a class="phone-call-main" href="tel:112">📞 TRUCAR AL 112</a></section>
      <div class="phone-warning">⚠️ El 112 és només per a emergències reals. Per a consultes sanitàries no vitals, utilitza el 061 a Catalunya.</div>
      <input class="phone-search" id="phoneSearch" type="search" placeholder="🔎 Cerca servei o número…" autocomplete="off">
      <div class="phone-tabs" id="phoneTabs">${['Catalunya','Espanya','Europa','Estrangers','Personals'].map((x,i)=>`<button class="phone-tab ${i===0?'active':''}" data-phone-area="${x}">${['🏴','🇪🇸','🇪🇺','🌍','👥'][i]} ${x}</button>`).join('')}</div>
      <div id="phoneList"></div>
      <section class="phone-personal"><h2>➕ Afegir contacte personal</h2><form id="phoneForm" class="form"><div class="field"><label>Nom o servei</label><input name="name" required placeholder="Ex. Assegurança de la llar"></div><div class="field"><label>Telèfon</label><input name="number" type="tel" required placeholder="Ex. +34 600 000 000"></div><div class="field"><label>Categoria</label><input name="group" placeholder="Ex. Família, assegurança, veïns"></div><button class="btn blue" type="submit">💾 Guardar contacte</button></form></section>
      <p class="small phone-source">Els números d’emergència s’han de verificar periòdicament. Fonts oficials: Generalitat de Catalunya, CAT112 i Administració General de l’Estat.</p>
    </div>`;
  }
  function renderPhoneList(){
    const list=document.getElementById('phoneList');if(!list)return;
    const area=document.querySelector('[data-phone-area].active')?.dataset.phoneArea||'Catalunya';
    const q=(document.getElementById('phoneSearch')?.value||'').toLocaleLowerCase('ca').trim();
    const custom=readPhoneContacts().map((c,i)=>({...c,area:'Personals',icon:'👤',id:i}));
    const entries=(area==='Personals'?custom:PHONE_DATA.filter(x=>x.area===area)).filter(x=>!q||[x.name,x.number,x.note,x.group].join(' ').toLocaleLowerCase('ca').includes(q));
    list.innerHTML=entries.length?entries.map(x=>`<article class="phone-card ${x.urgent?'phone-urgent':''}"><div class="phone-card-top"><span class="phone-icon">${x.icon}</span><div class="phone-copy"><strong>${escapePhone(x.name)}</strong><small>${escapePhone(x.group||'Contacte personal')}</small></div>${x.number? `<a class="phone-number" href="tel:${x.number.replace(/[^+0-9]/g,'')}">${escapePhone(x.number)}</a>`:''}</div><p>${escapePhone(x.note||'')}</p>${x.link?'<a class="phone-link" href="'+x.link+'" target="_blank" rel="noopener">Web oficial i directori consular ↗</a>':''}${area==='Personals'?'<button class="phone-delete" data-phone-delete="'+x.id+'">Eliminar contacte</button>':''}</article>`).join(''):'<div class="info">No hi ha contactes que coincideixin amb la cerca.</div>';
    list.querySelectorAll('[data-phone-delete]').forEach(b=>b.addEventListener('click',()=>{const c=readPhoneContacts();c.splice(Number(b.dataset.phoneDelete),1);localStorage.setItem(PHONE_KEY,JSON.stringify(c));renderPhoneList()}));
  }
  function escapePhone(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function bindPhone(){
    document.querySelectorAll('[data-phone-area]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-phone-area]').forEach(x=>x.classList.toggle('active',x===b));renderPhoneList()}));
    document.getElementById('phoneSearch')?.addEventListener('input',renderPhoneList);
    document.getElementById('phoneForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const c=readPhoneContacts();c.push({name:fd.get('name'),number:fd.get('number'),group:fd.get('group')||'Personal',note:'Contacte guardat en aquest dispositiu.'});localStorage.setItem(PHONE_KEY,JSON.stringify(c));e.currentTarget.reset();document.querySelectorAll('[data-phone-area]').forEach(x=>x.classList.toggle('active',x.dataset.phoneArea==='Personals'));renderPhoneList();alert('Contacte guardat al dispositiu.')});
    renderPhoneList();
  }
  function renderFeature(){ const route=location.hash.replace('#',''); const main=document.querySelector('#main'); if(!main)return false; if(route==='phone')return false; if(route==='map'){main.innerHTML=mapPage();bindMap();return true;} if(route==='radio'){main.innerHTML=radioPage();return true;}if(route==='phone'){main.innerHTML=phonePage();bindPhone();return true;}return false; }
  document.addEventListener('change',e=>{const input=e.target;if(input.matches('input[data-id="food"]')){syncFoodVisibility(input);return;}if(input.matches('input[data-food-item]')){const saved=loadFood();const key=`${input.dataset.foodType||'kit'}-${input.dataset.foodItem}`;saved[key]=input.checked;saveFood(saved);input.closest('.food-option')?.classList.toggle('done',input.checked);}});
  function decorate(){addFoodMenus();if(!renderFeature()&&['','home'].includes(location.hash.replace('#','')))addTools();if(location.hash.replace('#','')==='more'){const page=document.querySelector('.page');if(page&&!page.querySelector('[data-feature="phone"]')){const card=document.createElement('article');card.className='card tile feature-tile';card.dataset.feature='phone';card.innerHTML='<span class="emoji">☎️</span><div><h3>Guia telefònica</h3><p>Catalunya · Espanya · Europa · Estrangers</p></div>';page.querySelector('.grid')?.appendChild(card);}}}
  document.addEventListener('click',e=>{const feature=e.target.closest('[data-feature]');if(feature){location.hash=feature.dataset.feature;return;}if(e.target.closest('[data-feature-back]')){back();return;}});
  window.renderPhoneFeature=()=>location.hash.replace('#','')==='phone' ? renderFeature() : false;
  window.decorateFeatures=decorate;addEventListener('load',()=>setTimeout(decorate,0));setTimeout(decorate,50);
})();