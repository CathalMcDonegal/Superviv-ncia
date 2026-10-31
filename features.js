(() => {
  const MAP_URL = 'mapa-offline.svg?v=1';
  const FOOD_KEY = 'supervivencia-food-v1';
  const RADIO = [
    ['HF','7.110 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺'],
    ['HF','3.760 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺'],
    ['HF','14.300 MHz','Centre d’activitat d’emergències IARU Regió 1','Veu · SSB','🇪🇺'],
    ['VHF','145.500 MHz','Freqüència simplex de crida / coordinació','FM','📻'],
    ['UHF','433.500 MHz','Freqüència simplex de crida / coordinació','FM','📻'],
    ['VHF','145.550 MHz','Ús FM indicat a Espanya en la taula IARU R1','FM','🇪🇸'],
    ['UHF','433.550 MHz','Ús FM indicat a Espanya en la taula IARU R1','FM','🇪🇸']
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
    return `<div class="food-submenu" data-food-menu="${type}">
      <div class="food-title">🥫 Exemples de menjar per tenir preparat</div>
      <div class="food-grid">${FOOD.map(([id, icon, name]) => {
        const key = `${type}-${id}`;
        return `<label class="food-option ${saved[key] ? 'done' : ''}"><input type="checkbox" data-food-item="${id}" data-food-type="${type}" ${saved[key] ? 'checked' : ''}><span>${icon}</span><span>${name}</span></label>`;
      }).join('')}</div>
      <p>Selecciona també els aliments que ja tens preparats. Les seleccions es guarden al dispositiu.</p>
    </div>`;
  }
  function syncFoodVisibility(input) {
    const menu = input.closest('.check')?.nextElementSibling;
    if (!menu?.classList.contains('food-submenu')) return;
    menu.hidden = input.checked;
  }
  function addFoodMenus() {
    document.querySelectorAll('input[data-id="food"]').forEach(input => {
      const label = input.closest('.check');
      if (!label) return;
      const type = input.dataset.type || 'kit';
      if (!label.nextElementSibling?.classList.contains('food-submenu')) label.insertAdjacentHTML('afterend', foodMenu(type));
      syncFoodVisibility(input);
    });
  }
  function toolCards() {
    return `<article class="card tile feature-tile" data-feature="map"><span class="emoji">🗺️</span><div><h3>Mapa offline</h3><p>Mapa integrat, sense buscador ni connexió.</p></div></article>
      <article class="card tile feature-tile" data-feature="radio"><span class="emoji">📡</span><div><h3>Freqüències d’emergència</h3><p>HF · VHF · UHF per comunicacions d’emergència.</p></div></article>`;
  }
  function addTools() {
    document.querySelectorAll('.feature-tools').forEach(x => x.remove());
    const pages = document.querySelectorAll('.page');
    if (!pages.length) return;
    const page = pages[0];
    const box = document.createElement('div');
    box.className = 'feature-tools';
    box.innerHTML = `<div class="section-title"><h2>🧭 Eines d’emergència</h2></div><div class="grid">${toolCards()}</div>`;
    page.appendChild(box);
  }
  function mapPage() {
    return `<div class="page feature-page"><button class="back-link" data-feature-back>‹ Tornar</button><section class="hero"><div class="hero-kicker">🗺️ SENSE CONNEXIÓ</div><h1>Mapa offline</h1><p>Mapa esquemàtic de Catalunya disponible sense internet. Pots ampliar-lo i reduir-lo.</p></section><div class="map-card"><div class="map-controls"><button data-zoom="in">＋</button><button data-zoom="out">−</button><button data-zoom="reset">⟳</button></div><div class="map-viewport" id="mapViewport"><img id="offlineMap" src="${MAP_URL}" alt="Mapa offline de Catalunya"></div></div><div class="info"><strong>ℹ️ Ús offline</strong><p>Aquest mapa està incorporat dins de l’app i no necessita GPS, buscador ni connexió a internet.</p></div></div>`;
  }
  function radioPage() {
    return `<div class="page feature-page"><button class="back-link" data-feature-back>‹ Tornar</button><section class="hero hero-radio"><div class="hero-kicker">📡 RADIOCOMUNICACIONS</div><h1>Freqüències d’emergència</h1><p>Freqüències de referència per radioaficionats. Escolta abans de transmetre i prioritza sempre el trànsit d’emergència.</p></section><div class="radio-note">⚠️ Les freqüències són centres d’activitat, no canals exclusius d’emergència. Pot haver-hi QRM i ús local.</div><div class="freq-list">${RADIO.map(r=>`<div class="freq-card"><div class="freq-top"><span>${r[4]} ${r[0]}</span><strong>${r[1]}</strong></div><p>${r[2]}</p><small>${r[3]}</small></div>`).join('')}</div><div class="info"><strong>📻 Regla ràpida</strong><p>En cas d’emergència, mantén l’escolta, deixa lliure la freqüència quan hi hagi trànsit prioritari i segueix les instruccions dels coordinadors.</p></div></div>`;
  }
  function renderFeature() {
    const route = location.hash.replace('#','');
    const main = document.querySelector('#main');
    if (!main) return false;
    if (route === 'map') { main.innerHTML = mapPage(); bindMap(); return true; }
    if (route === 'radio') { main.innerHTML = radioPage(); return true; }
    return false;
  }
  function bindMap() {
    let scale = 1;
    const img = document.getElementById('offlineMap');
    if (!img) return;
    const apply = () => { img.style.transform = `scale(${scale})`; };
    document.querySelectorAll('[data-zoom]').forEach(b => b.addEventListener('click', () => {
      const z = b.dataset.zoom;
      if (z === 'in') scale = Math.min(3.5, scale + .25);
      if (z === 'out') scale = Math.max(.75, scale - .25);
      if (z === 'reset') scale = 1;
      apply();
    }));
    let sx=0, sy=0, ox=0, oy=0, dragging=false;
    const vp=document.getElementById('mapViewport');
    vp.addEventListener('pointerdown',e=>{dragging=true;sx=e.clientX;sy=e.clientY;ox=vp.scrollLeft;oy=vp.scrollTop;vp.setPointerCapture(e.pointerId)});
    vp.addEventListener('pointermove',e=>{if(!dragging)return;vp.scrollLeft=ox-(e.clientX-sx);vp.scrollTop=oy-(e.clientY-sy)});
    vp.addEventListener('pointerup',()=>dragging=false);
    vp.addEventListener('pointercancel',()=>dragging=false);
  }
  document.addEventListener('change', e => {
    const input = e.target;
    if (input.matches('input[data-id="food"]')) { syncFoodVisibility(input); return; }
    if (input.matches('input[data-food-item]')) {
      const saved = loadFood();
      const key = `${input.dataset.foodType || 'kit'}-${input.dataset.foodItem}`;
      saved[key] = input.checked;
      saveFood(saved);
      input.closest('.food-option')?.classList.toggle('done', input.checked);
    }
  });
  function decorate() { addFoodMenus(); if (!renderFeature()) addTools(); }
  document.addEventListener('click', e => {
    const feature = e.target.closest('[data-feature]');
    if (feature) { location.hash = feature.dataset.feature; return; }
    if (e.target.closest('[data-feature-back]')) { location.hash = '#home'; return; }
  });
  addEventListener('hashchange', () => setTimeout(decorate, 0));
  addEventListener('load', () => setTimeout(decorate, 0));
  setTimeout(decorate, 50);
})();
