const KEY = 'supervivencia-v2';

const defaults = {
  kit: {},
  bag: {},
  family: { name: '', address: '', contact: '', meeting: '', meeting2: '', outside: '', members: '', notes: '' }
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
  ['🔥','Incendi',['Avisa tothom i surt de casa de pressa. No recullis res.','Si hi ha fum, avança agatat: l’aire net és a prop del terra.','Abans d’obrir una porta, toca-la amb el dors de la mà. Si és calenta, no l’obris.','No facis servir l’ascensor.','Ja a fora, truca al 112 i no tornis a entrar.','Si no pots sortir: tanca’t en una habitació, tapa les escletxes amb draps humits i fes-te veure per la finestra.'],['Incendi forestal: si no hi ha ordre d’evacuar, confina’t en un edifici sòlid amb portes, finestres i persianes tancades.','No fugis a peu pel bosc. Segueix les indicacions de Protecció Civil.']],
  ['🌊','Inundació',['Puja a un pis alt i allunya’t de rius, rieres i barrancs.','No creuis mai un carrer inundat, ni a peu ni amb cotxe: pocs centímetres d’aigua poden arrossegar-te.','No baixis a garatges ni a soterranis.','Si pots fer-ho sense mullar-te, talla la llum i el gas.','Segueix els avisos d’ES-Alert i de Protecció Civil.'],['No beguis aigua de l’aixeta fins que les autoritats ho confirmin.','No facis servir aparells elèctrics mullats.']],
  ['⚡','Tall de llum',['Fes servir llanternes. Evita les espelmes.','Desconnecta els aparells sensibles i deixa una llum encesa per saber quan torna el corrent.','Obre la nevera i el congelador el mínim possible.','Mai no facis servir generadors, fogons o brasers a l’interior: hi ha risc de monòxid de carboni.','Escolta la ràdio de piles i posa el mòbil en estalvi d’energia.','Ajuda les persones que depenen d’aparells elèctrics.'],['Quan torni el corrent, connecta els aparells d’un en un.','Llença els aliments descongelats o dubtosos.']],
  ['⛈️','Tempesta',['Entra en un edifici o en un cotxe tancat.','Allunya’t de finestres i desconnecta els aparells elèctrics.','A l’aire lliure: lluny d’arbres sols, cims i aigua. Ajup’t amb els peus junts.','Si entre el llamp i el tro passen menys de 30 segons, busca refugi. Espera 30 minuts després de l’últim tro.','No travessis rieres ni passos inundables.'],['Revisa danys, cables caiguts i arbres inestables. Mantén-te’n lluny i avisa el 112.']],
  ['🌍','Terratrèmol',['Ajup-te, cobreix-te i agafa’t sota una taula robusta o contra una paret interior.','Allunya’t de vidres, miralls i objectes que puguin caure.','No correguis cap a l’exterior ni facis servir l’ascensor.','Si ets a fora: lluny d’edificis, cables i fanals.','Si condueixes: atura’t en un lloc obert.'],['Revisa si hi ha ferits. No moguis ningú amb lesions greus.','Si fa olor de gas: obre finestres, surt i no encenguis llums.','Calça’t. Poden venir rèpliques.','No tornis a un edifici danyat fins que ho autoritzin.']],
  ['☣️','Risc químic',['Confina’t: entra a l’edifici més proper i tanca portes i finestres.','Atura la ventilació i l’aire condicionat.','Tapa les escletxes amb draps humits i cinta.','Ves a una habitació interior, millor sense finestres.','Sintonitza la ràdio i segueix les indicacions de Protecció Civil.','No vagis a buscar els fills a l’escola: els protegeixen allà. No col·lapsis les línies de telèfon.'],['Si t’has exposat: treu-te la roba, renta’t amb aigua i sabó i avisa el 112.','No surtis fins que anunciïn el final del confinament.']],
  ['🚪','Evacuació',['Agafa la motxilla, els documents, la medicació, el mòbil i el carregador.','Tanca aigua, gas i llum. Tanca la porta amb clau.','Deixa una nota amb el lloc on aneu.','Segueix només els itineraris que indiquin les autoritats.','Avisa els veïns, sobretot els grans, i porta les mascotes.','Si vas amb cotxe: dipòsit ple i finestres tancades.'],['Troba la família al punt de trobada pactat.','No tornis a casa fins que ho autoritzin.']],
  ['📵','Sense comunicacions',['El 112 és gratuït i funciona amb qualsevol xarxa mòbil disponible. Només per a emergències.','Envia SMS o missatges de text: ocupen menys que les trucades.','Fes trucades curtes per no saturar la xarxa.','Estalvia bateria: baixa la brillantor i activa l’estalvi d’energia.','Avisa el contacte fora de la zona que estàs bé i on ets.','Escolta la ràdio i les alertes ES-Alert.'],['Si no hi ha xarxa, ves al punt de trobada pactat.']]
];

const tipsData = [
  ['💧','Aigua','Mantén una reserva d’aigua potable i prioritza-la per beure.'],
  ['🔋','Bateria','Carrega regularment els power banks i mantén un carregador preparat.'],
  ['🥫','Aliments','Prioritza aliments que es puguin consumir sense cuinar o amb poca preparació.'],
  ['📻','Informació','Una ràdio independent del mòbil és útil si hi ha problemes de xarxa o electricitat.'],
  ['🚗','Cotxe','Mantén combustible suficient i alguns elements bàsics al vehicle.'],
  ['👨‍👩‍👧','Família','Tothom ha de saber on trobar el kit, la motxilla i el punt de trobada.'],
  ['🐾','Animals','Prepara aigua, menjar, medicació i transportador o corretja.'],
  ['📅','Caducitats','Revisa aliments i medicines cada 6 mesos i renova l’aigua emmagatzemada.'],
  ['🔧','Claus de pas','Aprèn on són les claus de l’aigua, el gas i la llum.'],
  ['🗺️','Mapes','Descarrega els mapes de la teva zona per fer-los servir sense connexió.'],
  ['📸','Documents','Fes fotos dels documents importants i guarda-les al mòbil.'],
  ['🔔','Alertes','Activa les alertes ES-Alert i segueix Protecció Civil de la Generalitat.'],
  ['🩺','Primers auxilis','Fes un curs de primers auxilis i de reanimació (RCP).'],
  ['🤝','Veïns','Pregunta als veïns grans o vulnerables si necessiten ajuda.'],
  ['🔁','Simulacre','Fes un simulacre amb la família un cop l’any.']
];

function loadData() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    return saved ? { ...defaults, ...saved, family: { ...defaults.family, ...(saved.family || {}) } } : structuredClone(defaults);
  } catch (_) { return structuredClone(defaults); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (_) {} }
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>\"]/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '\"':'&quot;' }[ch]));
}
function percent(type) {
  const list = kits[type];
  const done = list.filter(item => data[type][item[0]]).length;
  return Math.round(done / list.length * 100);
}
function planPercent() { const f = data.family; return Math.round(['contact','meeting','meeting2','outside','members'].filter(k => String(f[k] || '').trim()).length / 5 * 100); }
function overallPercent() { return Math.round(percent('kit') * .35 + percent('bag') * .35 + planPercent() * .3); }
let depth = 0;
function go(next) {
  if (next !== route) depth++;
  if (location.hash.replace('#', '') !== next) location.hash = next;
  route = next;
  render();
  window.scrollTo(0, 0);
}
function back() { if (depth > 0) { depth--; history.back(); } else { location.hash = 'home'; } }

function home() {
  const p = overallPercent();
  const status = p >= 80 ? 'Molt bé! Estàs ben preparat.' : p >= 50 ? 'Vas pel bon camí.' : 'Comença pels bàsics.';
  return `<div class="page">
    <section class="hero hero-home"><div class="hero-kicker">🛡️ PREPARACIÓ FAMILIAR</div><h1>Estigues preparat.</h1><p>Una app senzilla per preparar casa, motxilla i família i saber què fer quan passa una emergència.</p><button class="btn primary cta" data-go="now">🚨 Què faig ara?</button></section>
    <div class="grid">
      <article class="card tile" data-go="kit"><span class="emoji">🏠</span><div><h3>Kit de casa</h3><p>${percent('kit')}% preparat</p></div></article>
      <article class="card tile" data-go="bag"><span class="emoji">🎒</span><div><h3>Motxilla</h3><p>${percent('bag')}% preparada</p></div></article>
      <article class="card tile" data-go="tips"><span class="emoji">💡</span><div><h3>Tips</h3><p>Consells pràctics</p></div></article>
      <article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Contactes i punt de trobada</p></div></article>
      <article class="card tile phone-home-tile" data-go="phone"><span class="emoji">☎️</span><div><h3>Guia telefònica</h3><p>Accés ràpid a emergències i telèfons útils</p></div></article>
    </div>
    <div class="section-title"><h2>📊 Nivell de preparació</h2></div>
    <div class="card score" data-go="level" style="cursor:pointer"><div class="score-ring" style="--p:${p * 3.6}deg"><span>${p}%</span></div><div><strong>${status}</strong><p class="small">Kit, motxilla i pla familiar. Toca per veure com millorar-lo.</p></div></div>
    <a class="call112" href="tel:112">📞 Trucar al 112</a>
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
  return `<div class="page"><button class="back-link" data-back>‹ Tornar a emergències</button><section class="hero hero-danger"><div class="big-emoji">${e[0]}</div><h1>${e[1]}</h1><p>Passos inicials i senzills.</p></section><div class="steps">${e[2].map((step,i)=>`<div class="step"><span>${i+1}</span><p>${step}</p></div>`).join('')}</div>${e[3] ? `<div class="info"><strong>Després</strong><ul>${e[3].map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}<a class="call112" href="tel:112">📞 Trucar al 112</a><div class="info"><strong>Recorda</strong><p>Mantén la calma, protegeix-te primer i facilita informació clara als serveis d’emergència.</p></div></div>`;
}
function tipsPage() {
  return `<div class="page"><section class="hero"><div class="hero-kicker">💡 CONSELLS</div><h1>Tips pràctics</h1><p>Petites accions que poden marcar la diferència.</p></section><div class="tips">${tipsData.map(t=>`<article class="tip"><span>${t[0]}</span><div><strong>${t[1]}</strong><p>${t[2]}</p></div></article>`).join('')}</div></div>`;
}
function familyPage() {
  const f = data.family;
  return `<div class="page"><section class="hero"><div class="hero-kicker">👨‍👩‍👧 FAMÍLIA</div><h1>Pla familiar</h1><p>Guarda la informació bàsica al dispositiu. Les dades es mantenen localment.</p></section><div class="info"><form id="familyForm" class="form"><div class="field"><label>Nom de la família</label><input name="name" value="${escapeHtml(f.name)}" placeholder="Ex. Família Garcia"></div><div class="field"><label>Adreça</label><input name="address" value="${escapeHtml(f.address)}" placeholder="Adreça de casa"></div><div class="field"><label>Contacte principal</label><input name="contact" value="${escapeHtml(f.contact)}" placeholder="Nom i telèfon"></div><div class="field"><label>Punt de trobada</label><input name="meeting" value="${escapeHtml(f.meeting)}" placeholder="Ex. plaça, parc..."></div><div class="field"><label>Punt de trobada alternatiu</label><input name="meeting2" value="${escapeHtml(f.meeting2)}" placeholder="Fora del barri"></div><div class="field"><label>Contacte fora de la zona</label><input name="outside" value="${escapeHtml(f.outside)}" placeholder="Nom i telèfon"></div><div class="field"><label>Membres i telèfons</label><textarea name="members" placeholder="Un per línia: nom, telèfon, notes">${escapeHtml(f.members)}</textarea></div><div class="field"><label>Informació important</label><textarea name="notes" placeholder="Medicació, animals, necessitats...">${escapeHtml(f.notes)}</textarea></div><button class="btn blue" type="submit">💾 Guardar pla</button><p class="small" id="saveNote">Es guarda automàticament.</p></form></div><div class="info"><strong>📍 Punt de trobada</strong><p>Tria un lloc conegut, accessible i fora de possibles zones de risc.</p></div></div>`;
}
function levelPage() {
  const t = overallPercent(), parts = [['🏠 Kit de casa', percent('kit'), 'kit'], ['🎒 Motxilla', percent('bag'), 'bag'], ['👨‍👩‍👧 Pla familiar', planPercent(), 'family']];
  const w = [...parts].sort((a, b) => a[1] - b[1])[0];
  const lab = t >= 90 ? 'Llest per a tot' : t >= 75 ? 'Ben preparat' : t >= 50 ? 'Preparat' : t >= 25 ? 'En camí' : 'Primers passos';
  return `<div class="page"><button class="back-link" data-back>‹ Tornar</button><section class="hero"><div class="hero-kicker">📊 NIVELL</div><h1>${t}% · ${lab}</h1><p>Kit de casa i motxilla pesen un 35% cadascun; el pla familiar, un 30%.</p></section>${parts.map(x => `<div class="progress-card card"><div class="progress-row"><span>${x[0]}</span><strong>${x[1]}%</strong></div><div class="progress"><i style="width:${x[1]}%"></i></div></div>`).join('')}${t < 100 ? `<button class="btn blue" style="width:100%;margin-top:14px" data-go="${w[2]}">Millora: ${w[0]}</button>` : ''}</div>`;
}
function morePage() {
  return `<div class="page"><section class="hero"><h1>☰ Més</h1><p>Opcions i informació de l’app.</p></section><div class="grid"><article class="card tile" data-go="tips"><span class="emoji">💡</span><div><h3>Tips</h3><p>Consells ràpids</p></div></article><article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Informació important</p></div></article><article class="card tile" data-about><span class="emoji">ℹ️</span><div><h3>Sobre l’app</h3><p>Supervivència · Emergències</p></div></article></div></div>`;
}


const PHONE_CONTACTS_KEY = 'supervivencia-phone-contacts-v1';
const PHONE_CONTACTS = [
  ['🚨','Emergències (112)','112','Policia, bombers, ambulàncies i rescats. Només per a emergències reals.','Catalunya'],
  ['🩺','Salut Respon','061','Consultes sanitàries no urgents a Catalunya.','Catalunya'],
  ['🏛️','Generalitat · informació','012','Informació i tràmits de la Generalitat.','Catalunya'],
  ['🛟','Atenció a les dones','900 900 120','Atenció gratuïta i confidencial, 24 hores.','Catalunya'],
  ['🧒','Infància Respon','116 111','Ajuda davant situacions de risc per a infants i adolescents.','Catalunya'],
  ['🚨','Emergències generals','112','Número únic d’emergències.','Espanya'],
  ['👮','Policia Nacional','091','Atenció policial.','Espanya'],
  ['🛡️','Guàrdia Civil','062','Atenció de la Guàrdia Civil.','Espanya'],
  ['🟣','Atenció violència de gènere','016','Atenció gratuïta. En cas de perill immediat, truca al 112.','Espanya'],
  ['💚','Atenció conducta suïcida','024','Línia d’ajuda en situacions de crisi emocional o risc suïcida.','Espanya'],
  ['🇪🇺','Emergències a la Unió Europea','112','Número europeu d’emergències.','Europa']
];
function phonePage() {
  return `<div class="page"><button class="back-link" data-back>‹ Tornar</button>
    <section class="hero hero-phone"><div class="hero-kicker">☎️ CONTACTES ESSENCIALS</div><h1>Guia telefònica</h1><p>Telèfons útils per a emergències, salut i assistència.</p><a class="phone-call-main" href="tel:112">📞 TRUCAR AL 112</a></section>
    <div class="phone-warning">⚠️ El 112 és només per a emergències reals. Per a consultes sanitàries no vitals a Catalunya, utilitza el 061.</div>
    <input class="phone-search" id="phoneSearch" type="search" placeholder="🔎 Cerca servei o número…" autocomplete="off">
    <div class="phone-tabs">${['Catalunya','Espanya','Europa','Personals'].map((x,i)=>`<button type="button" class="phone-tab ${i===0?'active':''}" data-phone-area="${x}">${['🏴','🇪🇸','🇪🇺','👥'][i]} ${x}</button>`).join('')}</div>
    <div id="phoneList"></div>
    <section class="phone-personal"><h2>➕ Afegir contacte personal</h2><form id="phoneForm" class="form"><div class="field"><label>Nom o servei</label><input name="name" required placeholder="Ex. Assegurança de la llar"></div><div class="field"><label>Telèfon</label><input name="number" type="tel" required placeholder="Ex. +34 600 000 000"></div><div class="field"><label>Categoria</label><input name="group" placeholder="Ex. Família, assegurança, veïns"></div><button class="btn blue" type="submit">💾 Guardar contacte</button></form></section>
  </div>`;
}
function bindPhonePage() {
  let area='Catalunya';
  const read=()=>{try{return JSON.parse(localStorage.getItem(PHONE_CONTACTS_KEY)||'[]')}catch(_){return []}};
  const renderList=()=>{
    const q=(document.getElementById('phoneSearch')?.value||'').toLocaleLowerCase('ca').trim();
    const rows=area==='Personals'?read().map((x,i)=>({icon:'👤',name:x.name,number:x.number,note:x.note||x.group||'Contacte personal',id:i})):PHONE_CONTACTS.filter(x=>x[4]===area).map(x=>({icon:x[0],name:x[1],number:x[2],note:x[3]}));
    const filtered=rows.filter(x=>!q||[x.name,x.number,x.note].join(' ').toLocaleLowerCase('ca').includes(q));
    const list=document.getElementById('phoneList'); if(!list)return;
    list.innerHTML=filtered.length?filtered.map(x=>`<article class="phone-card ${x.number==='112'?'phone-urgent':''}"><div class="phone-card-top"><span class="phone-icon">${x.icon}</span><div class="phone-copy"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.note)}</small></div><a class="phone-number" href="tel:${String(x.number).replace(/[^+0-9]/g,'')}">${escapeHtml(x.number)}</a></div>${area==='Personals'?'<button type="button" class="phone-delete" data-phone-delete="'+x.id+'">Eliminar contacte</button>':''}</article>`).join(''):'<div class="info">No hi ha contactes que coincideixin amb la cerca.</div>';
    list.querySelectorAll('[data-phone-delete]').forEach(b=>b.addEventListener('click',()=>{const c=read();c.splice(Number(b.dataset.phoneDelete),1);localStorage.setItem(PHONE_CONTACTS_KEY,JSON.stringify(c));renderList()}));
  };
  document.querySelectorAll('[data-phone-area]').forEach(b=>b.addEventListener('click',()=>{area=b.dataset.phoneArea;document.querySelectorAll('[data-phone-area]').forEach(x=>x.classList.toggle('active',x===b));renderList()}));
  document.getElementById('phoneSearch')?.addEventListener('input',renderList);
  document.getElementById('phoneForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const c=read();c.push({name:fd.get('name'),number:fd.get('number'),group:fd.get('group')||'Personal'});localStorage.setItem(PHONE_CONTACTS_KEY,JSON.stringify(c));e.currentTarget.reset();area='Personals';document.querySelectorAll('[data-phone-area]').forEach(x=>x.classList.toggle('active',x.dataset.phoneArea===area));renderList();});
  renderList();
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
  else if (route === 'level') html = levelPage();
  else if (route === 'phone') html = phonePage();
  else if (route === 'map' || route === 'radio') html = '';
  else if (route.startsWith('emergency-')) html = emergencyPage(route.split('-')[1]);
  else { route = 'home'; html = home(); }
  main.innerHTML = html;
  if (route === 'phone') bindPhonePage();
  main.focus({ preventScroll: true });
  document.querySelectorAll('[data-go]').forEach(el => el.addEventListener('click', () => go(el.dataset.go)));
  document.querySelectorAll('[data-back]').forEach(el => el.addEventListener('click', back));
  document.querySelectorAll('[data-reset]').forEach(el => el.addEventListener('click', () => resetChecklist(el.dataset.reset)));
  document.querySelectorAll('input[type="checkbox"]').forEach(el => el.addEventListener('change', () => toggleCheck(el)));
  const form = document.querySelector('#familyForm');
  if (form) { form.addEventListener('submit', saveFamily); form.addEventListener('input', () => saveFamily({ preventDefault() {}, currentTarget: form })); }
  const about = document.querySelector('[data-about]');
  if (about) about.addEventListener('click', () => alert('Supervivència · Emergències\n\nGuia pràctica per preparar casa, motxilla i família.\n\nLes dades personals i els checklists es guarden només al dispositiu.'));
  updateNav();
  document.querySelector('#backBtn').hidden = route === 'home';
  if (window.decorateFeatures) window.decorateFeatures();
}
function toggleCheck(el) { data[el.dataset.type][el.dataset.id] = el.checked; save(); render(); }
function resetChecklist(type) { if (confirm('Vols desmarcar tota aquesta llista?')) { data[type] = {}; save(); render(); } }
function saveFamily(event) { event.preventDefault(); const form = new FormData(event.currentTarget); data.family = Object.fromEntries(form.entries()); save(); const n = document.querySelector('#saveNote'); if (n) n.textContent = '✔ Guardat al dispositiu'; }
function updateNav() {
  const current = route.startsWith('emergency-') ? 'now' : ['home','kit','bag','now','phone','more'].includes(route) ? route : 'more';
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.toggle('active', b.dataset.route === current));
}

document.querySelectorAll('.bottom-nav button').forEach(btn => btn.addEventListener('click', () => go(btn.dataset.route)));
document.querySelector('#backBtn').addEventListener('click', back);
window.addEventListener('hashchange', () => { route = location.hash.replace('#','') || 'home'; render(); window.scrollTo(0, 0); });

render();
