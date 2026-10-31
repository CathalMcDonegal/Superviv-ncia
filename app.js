const KEY = 'supervivencia-v2';

const defaults = {
  kit: {},
  bag: {},
  family: { name: '', address: '', contact: '', meeting: '', notes: '' }
};

let data = loadData();
let route = location.hash.replace('#', '') || 'home';
let historyStack = [];
let deferredPrompt = null;

const kits = {
  kit: [
    ['water','💧','Aigua potable'], ['food','🥫','Aliments de llarga durada'], ['flash','🔦','Llanterna'],
    ['batteries','🔋','Piles de recanvi'], ['radio','📻','Ràdio'], ['firstaid','🩹','Farmaciola'],
    ['candles','🕯️','Espelmes'], ['matches','🔥','Encenedor o llumins'], ['power','🔌','Power banks'],
    ['chargers','🔗','Carregadors'], ['blankets','🧣','Mantes'], ['hygiene','🧼','Productes d’higiene'],
    ['paper','🧻','Paper higiènic'], ['cash','💶','Efectiu'], ['docs','📄','Còpies de documents'],
    ['tools','🛠️','Eines bàsiques'], ['gloves','🧤','Guants'], ['masks','😷','Mascaretes']
  ],
  bag: [
    ['water','💧','Aigua'], ['food','🥨','Menjar energètic'], ['flash','🔦','Llanterna'], ['radio','📻','Ràdio petita'],
    ['power','🔋','Power bank'], ['firstaid','🩹','Farmaciola bàsica'], ['thermal','🧣','Manta tèrmica'],
    ['multitool','🛠️','Eina multiús'], ['gloves','🧤','Guants'], ['clothes','👕','Roba de recanvi'],
    ['rain','🧥','Impermeable'], ['hygiene','🧼','Higiene'], ['docs','📄','Documents'], ['cash','💶','Diners'],
    ['whistle','📣','Xiulet'], ['mask','😷','Mascareta']
  ]
};

const emergencies = [
  ['🔥','Incendi',['Allunya’t del foc i del fum.','Tanca portes si pots fer-ho sense risc.','No utilitzis l’ascensor.','Truca al 112 si necessites ajuda.']],
  ['🌊','Inundació',['Allunya’t de rieres, torrents i zones baixes.','No travessis corrents d’aigua a peu ni amb vehicle.','Ves a una zona segura i segueix les indicacions oficials.']],
  ['⚡','Tall de llum',['Fes servir llanternes en lloc d’espelmes sempre que sigui possible.','Desconnecta aparells sensibles.','Estalvia bateria del mòbil.']],
  ['⛈️','Tempesta',['Busca refugi a l’interior.','Allunya’t de finestres i elements metàl·lics.','Evita zones exposades i segueix els avisos oficials.']],
  ['🌍','Terratrèmol',['Protegeix-te sota una taula resistent o al costat d’un element estable.','Allunya’t de vidres i objectes que puguin caure.','Quan acabi, comprova si hi ha ferits i segueix les indicacions oficials.']],
  ['☣️','Risc químic',['Entra en un edifici si és segur.','Tanca portes i finestres.','Segueix les instruccions de les autoritats.']],
  ['🚪','Evacuació',['Agafa la motxilla d’emergència.','Surt per la ruta indicada i no utilitzis l’ascensor.','No tornis fins que les autoritats ho indiquin.']],
  ['📵','Sense comunicacions',['Estalvia bateria.','Prova SMS si les dades no funcionen.','Escolta la ràdio i utilitza els punts de trobada familiars.']]
];

const tipsData = [
  ['💧','Aigua','Mantén una reserva d’aigua potable i prioritza-la per beure.'],
  ['🔋','Bateria','Carrega regularment els power banks i mantén un carregador preparat.'],
  ['🥫','Aliments','Prioritza aliments que es puguin consumir sense cuinar o amb poca preparació.'],
  ['📻','Informació','Una ràdio independent del mòbil és útil si hi ha problemes de xarxa o electricitat.'],
  ['🚗','Cotxe','Mantén combustible suficient i alguns elements bàsics al vehicle.'],
  ['👨‍👩‍👧','Família','Tothom ha de saber on trobar el kit, la motxilla i el punt de trobada.'],
  ['🐾','Animals','Prepara aigua, menjar, medicació i transportador o corretja.']
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    return saved ? { ...defaults, ...saved, family: { ...defaults.family, ...(saved.family || {}) } } : structuredClone(defaults);
  } catch (_) { return structuredClone(defaults); }
}
function save() { localStorage.setItem(KEY, JSON.stringify(data)); }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[ch]));
}
function percent(type) {
  const list = kits[type];
  const done = list.filter(item => data[type][item[0]]).length;
  return Math.round(done / list.length * 100);
}
function overallPercent() { return Math.round((percent('kit') + percent('bag')) / 2); }
function go(next, addHistory = true) {
  if (next === route) return;
  if (addHistory) historyStack.push(route);
  route = next;
  location.hash = next;
  render();
  window.scrollTo(0, 0);
}
function back() {
  const previous = historyStack.pop();
  go(previous || 'home', false);
}

function home() {
  const p = overallPercent();
  const status = p >= 80 ? 'Molt bé! Estàs ben preparat.' : p >= 50 ? 'Vas pel bon camí.' : 'Comença pels bàsics.';
  return `<div class="page">
    <section class="hero hero-home"><div class="hero-kicker">🛡️ PREPARACIÓ FAMILIAR</div><h1>Estigues preparat.</h1><p>Una app senzilla per preparar casa, motxilla i família i saber què fer quan passa una emergència.</p><button class="btn primary cta" data-go="now">🚨 Què faig ara?</button></section>
    <div class="grid">
      <article class="card tile" data-go="kit"><span class="emoji">🏠</span><div><h3>Kit de casa</h3><p>${percent('kit')}% preparat</p></div></article>
      <article class="card tile" data-go="bag"><span class="emoji">🎒</span><div><h3>Motxilla</h3><p>${percent('bag')}% preparada</p></div></article>
      <article class="card tile urgent" data-go="now"><span class="emoji">🚨</span><div><h3>Què faig ara?</h3><p>Accions ràpides</p></div></article>
      <article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Contactes i punt de trobada</p></div></article>
    </div>
    <div class="section-title"><h2>📊 Nivell de preparació</h2></div>
    <div class="card score"><div class="score-ring" style="--p:${p * 3.6}deg"><span>${p}%</span></div><div><strong>${status}</strong><p class="small">Completa els dos checklists per millorar el teu nivell.</p></div></div>
    <div class="grid"><article class="card tile" data-go="tips"><span class="emoji">💡</span><div><h3>Tips</h3><p>Consells pràctics</p></div></article><article class="card tile" data-go="family"><span class="emoji">📋</span><div><h3>Pla familiar</h3><p>Prepara’l avui</p></div></article></div>
  </div>`;
}

function progressCard(type) {
  const p = percent(type);
  return `<div class="progress-card card"><div class="progress-row"><span>${type === 'kit' ? '🏠 Kit de casa' : '🎒 Motxilla d’emergència'}</span><strong>${p}%</strong></div><div class="progress"><i style="width:${p}%"></i></div></div>`;
}
function checklist(type) {
  return `<div class="list">${kits[type].map(item => {
    const checked = !!data[type][item[0]];
    return `<label class="check ${checked ? 'done' : ''}"><input type="checkbox" data-type="${type}" data-id="${item[0]}" ${checked ? 'checked' : ''}><span class="check-icon">${item[1]}</span><span>${item[2]}</span></label>`;
  }).join('')}</div>`;
}
function checklistPage(type) {
  const title = type === 'kit' ? '🏠 Kit de casa' : '🎒 Motxilla d’emergència';
  const text = type === 'kit' ? 'Elements bàsics que convé tenir preparats a casa.' : 'Una motxilla preparada per sortir ràpidament si cal.';
  return `<div class="page"><button class="back-link" data-back>‹ Tornar</button><section class="hero"><h1>${title}</h1><p>${text}</p></section>${progressCard(type)}<div class="section-title"><h2>Checklist</h2><button class="reset" data-reset="${type}">Reinicia</button></div>${checklist(type)}<div class="info"><strong>💡 Revisa-ho periòdicament</strong><p>Comprova caducitats, piles, càrregues i que tot continua en bon estat.</p></div></div>`;
}
function nowPage() {
  return `<div class="page"><section class="hero hero-danger"><div class="hero-kicker">🚨 ACCIONS RÀPIDES</div><h1>Què faig ara?</h1><p>Tria la situació. En una emergència real, protegeix-te primer i segueix sempre les instruccions oficials.</p><a class="call112" href="tel:112">📞 Trucar al 112</a></section><div class="emergency-grid">${emergencies.map((e,i)=>`<button class="emergency" data-go="emergency-${i}"><span class="eicon">${e[0]}</span><span><strong>${e[1]}</strong><small>${e[2][0]}</small></span><b>›</b></button>`).join('')}</div></div>`;
}
function emergencyPage(index) {
  const e = emergencies[Number(index)];
  return `<div class="page"><button class="back-link" data-back>‹ Tornar a emergències</button><section class="hero hero-danger"><div class="big-emoji">${e[0]}</div><h1>${e[1]}</h1><p>Passos inicials i senzills.</p></section><div class="steps">${e[2].map((step,i)=>`<div class="step"><span>${i+1}</span><p>${step}</p></div>`).join('')}</div><a class="call112" href="tel:112">📞 Trucar al 112</a><div class="info"><strong>Recorda</strong><p>Mantén la calma, protegeix-te primer i facilita informació clara als serveis d’emergència.</p></div></div>`;
}
function tipsPage() {
  return `<div class="page"><section class="hero"><div class="hero-kicker">💡 CONSELLS</div><h1>Tips pràctics</h1><p>Petites accions que poden marcar la diferència.</p></section><div class="tips">${tipsData.map(t=>`<article class="tip"><span>${t[0]}</span><div><strong>${t[1]}</strong><p>${t[2]}</p></div></article>`).join('')}</div></div>`;
}
function familyPage() {
  const f = data.family;
  return `<div class="page"><section class="hero"><div class="hero-kicker">👨‍👩‍👧 FAMÍLIA</div><h1>Pla familiar</h1><p>Guarda la informació bàsica al dispositiu. Les dades es mantenen localment.</p></section><div class="info"><form id="familyForm" class="form"><div class="field"><label>Nom de la família</label><input name="name" value="${escapeHtml(f.name)}" placeholder="Ex. Família Garcia"></div><div class="field"><label>Adreça</label><input name="address" value="${escapeHtml(f.address)}" placeholder="Adreça de casa"></div><div class="field"><label>Contacte principal</label><input name="contact" value="${escapeHtml(f.contact)}" placeholder="Nom i telèfon"></div><div class="field"><label>Punt de trobada</label><input name="meeting" value="${escapeHtml(f.meeting)}" placeholder="Ex. plaça, parc..."></div><div class="field"><label>Informació important</label><textarea name="notes" placeholder="Medicació, animals, necessitats...">${escapeHtml(f.notes)}</textarea></div><button class="btn blue" type="submit">💾 Guardar pla</button></form></div><div class="info"><strong>📍 Punt de trobada</strong><p>Tria un lloc conegut, accessible i fora de possibles zones de risc.</p></div></div>`;
}
function morePage() {
  return `<div class="page"><section class="hero"><h1>☰ Més</h1><p>Opcions i informació de l’app.</p></section><div class="grid"><article class="card tile" data-go="tips"><span class="emoji">💡</span><div><h3>Tips</h3><p>Consells ràpids</p></div></article><article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Informació important</p></div></article><article class="card tile" data-about><span class="emoji">ℹ️</span><div><h3>Sobre l’app</h3><p>Supervivència · Emergències</p></div></article></div></div>`;
}

function render() {
  const main = document.querySelector('#main');
  if (!main) return;
  let html;
  if (route === 'home') html = home();
  else if (route === 'kit') html = checklistPage('kit');
  else if (route === 'bag') html = checklistPage('bag');
  else if (route === 'now') html = nowPage();
  else if (route === 'tips') html = tipsPage();
  else if (route === 'family') html = familyPage();
  else if (route === 'more') html = morePage();
  else if (route.startsWith('emergency-')) html = emergencyPage(route.split('-')[1]);
  else { route = 'home'; html = home(); }
  main.innerHTML = html;
  main.focus({ preventScroll: true });
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
  document.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', back));
  document.querySelectorAll('[data-reset]').forEach(el => el.addEventListener('click', () => resetChecklist(el.dataset.reset)));
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.addEventListener('change', () => toggleCheck(el)));
  const form = document.querySelector('#familyForm');
  if (form) form.addEventListener('submit', saveFamily);
  const about = document.querySelector('[data-about]');
  if (about) about.addEventListener('click', () => alert('Supervivència · Emergències\n\nGuia pràctica per preparar casa, motxilla i família.\n\nLes dades personals i els checklists es guarden només al dispositiu.'));
  updateNav();
  document.querySelector('#backBtn').hidden = route === 'home';
}
function toggleCheck(el) { data[el.dataset.type][el.dataset.id] = el.checked; save(); render(); }
function resetChecklist(type) { if (confirm('Vols desmarcar tota aquesta llista?')) { data[type] = {}; save(); render(); } }
function saveFamily(event) { event.preventDefault(); const form = new FormData(event.currentTarget); data.family = Object.fromEntries(form.entries()); save(); alert('Pla familiar guardat.'); render(); }
function updateNav() {
  const current = route.startsWith('emergency-') ? 'now' : ['home','kit','bag','now','more'].includes(route) ? route : 'more';
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.route === current));
}

document.querySelectorAll('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.route)));
document.querySelector('#backBtn').addEventListener('click', back);
window.addEventListener('hashchange', () => { route = location.hash.replace('#','') || 'home'; render(); });
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); deferredPrompt = event; document.querySelector('#installBtn').hidden = false; });
document.querySelector('#installBtn').addEventListener('click', async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt = null; document.querySelector('#installBtn').hidden = true; });
window.addEventListener('appinstalled', () => { document.querySelector('#installBtn').hidden = true; });
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));

render();
