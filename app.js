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
      <article class="card tile offline-tile" data-go="offline"><span class="emoji">🆘</span><div><h3>Mode emergència</h3><p>Accés ràpid sense internet</p></div></article>
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
  return `<div class="page"><section class="hero hero-danger"><div class="hero-kicker">🚨 ACCIONS RÀPIDES</div><h1>Què faig ara?</h1><p>Tria la situació. En una emergència real, protegeix-te primer i segueix sempre les instruccions oficials.</p><a class="call112" href="tel:112">📞 Trucar al 112</a><button class="btn blue sos-location" type="button" data-share-location>📍 Compartir la meva ubicació</button><p class="small">Si hi ha perill immediat, truca primer al 112.</p></section><div class="emergency-grid">${emergencies.map((e,i)=>`<button class="emergency" data-go="emergency-${i}"><span class="eicon">${e[0]}</span><span><strong>${e[1]}</strong><small>${e[2][0]}</small></span><b>›</b></button>`).join('')}</div></div>`;
}
function emergencyPage(index) {
  const e = emergencies[Number(index)];
  return `<div class="page"><button class="back-link" data-back>‹ Tornar a emergències</button><section class="hero hero-danger"><div class="big-emoji">${e[0]}</div><h1>${e[1]}</h1><p>Passos inicials i senzills.</p></section><div class="steps">${e[2].map((step,i)=>`<div class="step"><span>${i+1}</span><p>${step}</p></div>`).join('')}</div>${e[3] ? `<div class="info"><strong>Després</strong><ul>${e[3].map(x => `<li>${x}</li>`).join('')}</ul></div>` : ''}<a class="call112" href="tel:112">📞 Trucar al 112</a><button class="btn blue sos-location" type="button" data-share-location>📍 Compartir la meva ubicació</button><div class="info"><strong>Recorda</strong><p>Mantén la calma, protegeix-te primer i facilita informació clara als serveis d’emergència.</p></div></div>`;
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
  return `<div class="page"><section class="hero"><h1>☰ Més</h1><p>Opcions i informació de l’app.</p></section><div class="grid"><article class="card tile offline-tile" data-go="offline"><span class="emoji">🆘</span><div><h3>Mode emergència</h3><p>Accions i dades essencials</p></div></article><article class="card tile" data-go="tips"><span class="emoji">💡</span><div><h3>Tips</h3><p>Consells ràpids</p></div></article><article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Informació important</p></div></article><article class="card tile" data-about><span class="emoji">ℹ️</span><div><h3>Sobre l’app</h3><p>Supervivència · Emergències</p></div></article></div></div>`;
}


const PHONE_CONTACTS_KEY = 'supervivencia-phone-contacts-v1';
const PHONE_INTEREST_KEY = 'supervivencia-phone-interest-v1';
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
  ['🇪🇺','Emergències a la Unió Europea','112','Número europeu d’emergències.','Europa'],
  ['🌍','Emergències amb atenció multilingüe','112','A Catalunya poden atendre en diverses llengües; si cal, poden activar interpretació.','Europa']
];
const TRAVEL_RECORDS_KEY = 'supervivencia-travel-records-v1';
function readTravelRecords() { try { return JSON.parse(localStorage.getItem(TRAVEL_RECORDS_KEY) || '[]'); } catch (_) { return []; } }
function saveTravelRecords(rows) { localStorage.setItem(TRAVEL_RECORDS_KEY, JSON.stringify(rows)); }
function readInterestContacts() { try { return JSON.parse(localStorage.getItem(PHONE_INTEREST_KEY) || '{}'); } catch (_) { return {}; } }
function saveInterestContacts(rows) { localStorage.setItem(PHONE_INTEREST_KEY, JSON.stringify(rows)); }
function phonePage() {
  return '<div class="page"><button class="back-link" data-back>‹ Tornar</button>' +
    '<section class="hero hero-phone"><div class="hero-kicker">☎️ CONTACTES ESSENCIALS</div><h1>Guia telefònica</h1><p>Telèfons útils per a emergències, salut, seguretat i viatges.</p><a class="phone-call-main" href="tel:112">📞 TRUCAR AL 112</a></section>' +
    '<div class="phone-warning">⚠️ El 112 és només per a emergències reals. Per a consultes sanitàries no vitals a Catalunya, utilitza el 061.</div>' +
    '<input class="phone-search" id="phoneSearch" type="search" placeholder="🔎 Cerca servei o número…" autocomplete="off">' +
    '<div class="phone-tabs" id="phoneTabs">' +
    ['Catalunya','Espanya','Europa','Viatges a l’estranger','Personals'].map((x,i)=>'<button type="button" class="phone-tab '+(i===0?'active':'')+'" data-phone-area="'+x+'">'+['🏴','🇪🇸','🇪🇺','✈️','👥'][i]+' '+x+'</button>').join('') +
    '</div><div id="phoneList"></div></div>';
}
function bindPhonePage() {
  let area='Catalunya';
  const readPersonal=()=>{try{return JSON.parse(localStorage.getItem(PHONE_CONTACTS_KEY)||'[]')}catch(_){return []}};
  const deleteButton=(kind,index,label)=>'<button type="button" class="phone-delete phone-delete-icon" data-phone-delete-kind="'+kind+'" data-phone-delete-id="'+index+'" aria-label="Eliminar '+escapeHtml(label)+'" title="Eliminar contacte">🗑️</button>';
  const contactForm=(personal)=>'<section class="phone-personal phone-add-section"><h2>➕ '+(personal?'Afegir contacte personal':'Afegir contacte d’interès')+'</h2><form id="phoneAddForm" class="form">' +
    '<div class="field"><label>'+(personal?'Nom o servei':'Nom del contacte o servei')+'</label><input name="name" required placeholder="'+(personal?'Ex. Assegurança de la llar':'Ex. Hospital, farmàcia, protecció civil')+'"></div>' +
    '<div class="field"><label>Telèfon</label><input name="number" type="tel" required placeholder="Ex. +34 600 000 000"></div>' +
    '<div class="field"><label>'+(personal?'Categoria':'Informació / categoria')+'</label><input name="group" placeholder="'+(personal?'Ex. Família, assegurança, veïns':'Adreça, horari o tipus de servei')+'"></div>' +
    '<button class="btn blue" type="submit">💾 Guardar contacte</button></form></section>';
  const renderList=()=>{
    const q=(document.getElementById('phoneSearch')?.value||'').toLocaleLowerCase('ca').trim();
    const list=document.getElementById('phoneList'); if(!list)return;
    if(area==='Viatges a l’estranger') {
      const all=readTravelRecords();
      const rows=all.map((x,i)=>({...x,_index:i})).filter(x=>!q||[x.country,x.city,x.consulate,x.address,x.phone,x.emergency,x.email,x.notes].join(' ').toLocaleLowerCase('ca').includes(q));
      list.innerHTML='<section class="travel-intro"><strong>✈️ Els teus contactes consulars</strong><p>Guarda aquí els consolats i les ambaixades dels països que visites. Els registres es conserven automàticament en aquest dispositiu i apareixeran sempre que tornis a aquesta pestanya.</p></section>' +
        (rows.length?rows.map(x=>'<article class="phone-card travel-card"><div class="travel-card-head"><span class="travel-flag">🌍</span><div class="phone-copy"><strong>'+escapeHtml(x.consulate||'Consolat / ambaixada')+'</strong><small>'+escapeHtml([x.city,x.country].filter(Boolean).join(', '))+'</small></div>'+deleteButton('travel',x._index,x.consulate||'consolat')+'</div>' +
        (x.address?'<p><b>📍 Adreça:</b> '+escapeHtml(x.address)+'</p>':'') +
        (x.phone?'<p><b>☎️ Telèfon:</b> <a class="travel-contact-link" href="tel:'+String(x.phone).replace(/[^+0-9]/g,'')+'">'+escapeHtml(x.phone)+'</a></p>':'') +
        (x.emergency?'<p><b>🚨 Emergències consulars:</b> <a class="travel-contact-link" href="tel:'+String(x.emergency).replace(/[^+0-9]/g,'')+'">'+escapeHtml(x.emergency)+'</a></p>':'') +
        (x.email?'<p><b>✉️ Correu:</b> <a class="travel-contact-link" href="mailto:'+escapeHtml(x.email)+'">'+escapeHtml(x.email)+'</a></p>':'') +
        (x.website && /^https?:\/\//i.test(x.website)?'<p><a class="phone-link" href="'+escapeHtml(x.website)+'" target="_blank" rel="noopener">Web oficial ↗</a></p>':'') +
        (x.notes?'<p><b>ℹ️ Notes:</b> '+escapeHtml(x.notes)+'</p>':'') +
        '<small class="travel-saved">Guardat automàticament al dispositiu</small></article>').join(''):'<div class="info">Encara no tens cap consolat guardat. Afegeix-ne el primer amb el formulari.</div>') +
        '<section class="phone-personal travel-form-wrap"><h2>➕ Afegir consolat o ambaixada</h2><form id="travelForm" class="form">' +
        '<div class="field"><label>País que visites *</label><input name="country" required placeholder="Ex. Estats Units"></div>' +
        '<div class="field"><label>Ciutat *</label><input name="city" required placeholder="Ex. Nova York"></div>' +
        '<div class="field"><label>Nom del consolat / ambaixada *</label><input name="consulate" required placeholder="Ex. Consolat General d’Espanya a Nova York"></div>' +
        '<div class="field"><label>Adreça completa</label><textarea name="address" placeholder="Carrer, número, codi postal i ciutat"></textarea></div>' +
        '<div class="field"><label>Telèfon principal</label><input name="phone" type="tel" placeholder="+1 ..."></div>' +
        '<div class="field"><label>Telèfon d’emergències consulars</label><input name="emergency" type="tel" placeholder="+1 ..."></div>' +
        '<div class="field"><label>Correu electrònic</label><input name="email" type="email" placeholder="contacte@..."></div>' +
        '<div class="field"><label>Pàgina web oficial</label><input name="website" type="url" placeholder="https://..."></div>' +
        '<div class="field"><label>Notes / horari / cita prèvia</label><textarea name="notes" placeholder="Horari, zona consular, documentació..."></textarea></div>' +
        '<button class="btn blue" type="submit">💾 Guardar aquest consolat</button></form></section>';
      document.getElementById('travelForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row=Object.fromEntries(fd.entries());const rows=readTravelRecords();rows.push({...row,savedAt:new Date().toISOString()});saveTravelRecords(rows);renderList();});
    } else {
      const interest=readInterestContacts();
      let rows=[];
      if(area==='Personals') {
        rows=readPersonal().map((x,i)=>({icon:'👤',name:x.name,number:x.number,note:x.note||x.group||'Contacte personal',id:i,kind:'personal'}));
      } else {
        const fixed=PHONE_CONTACTS.filter(x=>x[4]===area).map(x=>({icon:x[0],name:x[1],number:x[2],note:x[3],kind:'fixed'}));
        const custom=(Array.isArray(interest[area])?interest[area]:[]).map((x,i)=>({icon:'📌',name:x.name,number:x.number,note:x.note||x.group||'Contacte d’interès',id:i,kind:'interest'}));
        rows=[...fixed,...custom];
      }
      const filtered=rows.filter(x=>!q||[x.name,x.number,x.note].join(' ').toLocaleLowerCase('ca').includes(q));
      list.innerHTML=(filtered.length?filtered.map(x=>'<article class="phone-card '+(x.number==='112'?'phone-urgent':'')+'"><div class="phone-card-top"><span class="phone-icon">'+x.icon+'</span><div class="phone-copy"><strong>'+escapeHtml(x.name)+'</strong><small>'+escapeHtml(x.note)+'</small></div>'+(x.number?'<a class="phone-number" href="tel:'+String(x.number).replace(/[^+0-9]/g,'')+'">'+escapeHtml(x.number)+'</a>':'')+(x.kind==='fixed'?'':deleteButton(x.kind,x.id,x.name))+'</div></article>').join(''):'<div class="info">No hi ha contactes que coincideixin amb la cerca.</div>')+contactForm(area==='Personals');
      list.querySelector('#phoneAddForm')?.addEventListener('submit',e=>{e.preventDefault();const fd=new FormData(e.currentTarget);const row={name:fd.get('name'),number:fd.get('number'),group:fd.get('group')||'',savedAt:new Date().toISOString()};if(area==='Personals'){const c=readPersonal();c.push(row);localStorage.setItem(PHONE_CONTACTS_KEY,JSON.stringify(c));}else{const all=readInterestContacts();if(!Array.isArray(all[area]))all[area]=[];all[area].push(row);saveInterestContacts(all);}renderList();});
    }
    list.querySelectorAll('[data-phone-delete-kind]').forEach(b=>b.addEventListener('click',()=>{const kind=b.dataset.phoneDeleteKind;const index=Number(b.dataset.phoneDeleteId);if(kind==='travel'){const c=readTravelRecords();c.splice(index,1);saveTravelRecords(c);}else if(kind==='personal'){const c=readPersonal();c.splice(index,1);localStorage.setItem(PHONE_CONTACTS_KEY,JSON.stringify(c));}else if(kind==='interest'){const c=readInterestContacts();if(Array.isArray(c[area])){c[area].splice(index,1);saveInterestContacts(c);}}renderList();}));
  };
  document.querySelectorAll('[data-phone-area]').forEach(b=>b.addEventListener('click',()=>{area=b.dataset.phoneArea;document.querySelectorAll('[data-phone-area]').forEach(x=>x.classList.toggle('active',x===b));renderList();}));
  document.getElementById('phoneSearch')?.addEventListener('input',renderList);
  renderList();
}

function shareEmergencyLocation(button) {
  if (!navigator.geolocation) { alert('Aquest dispositiu no permet obtenir la ubicació. Truca al 112 i explica on ets.'); return; }
  const original=button.textContent;button.disabled=true;button.textContent='Obtenint ubicació…';
  navigator.geolocation.getCurrentPosition(async pos=>{
    const lat=pos.coords.latitude.toFixed(6),lon=pos.coords.longitude.toFixed(6),accuracy=Math.round(pos.coords.accuracy||0);
    const url='https://www.google.com/maps?q='+lat+','+lon;
    const message='Necessito ajuda. La meva ubicació aproximada és: '+lat+', '+lon+' (precisió estimada '+accuracy+' m). Mapa: '+url;
    try {
      if(navigator.share) await navigator.share({title:'La meva ubicació',text:message,url});
      else if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(message);alert('Ubicació copiada. Ara la pots enganxar en un missatge.');}
      else {location.href='sms:?body='+encodeURIComponent(message);}
    } catch(err) { if(err?.name!=='AbortError') alert('No s’ha pogut compartir automàticament. Coordenades: '+lat+', '+lon+' · '+url); }
    button.disabled=false;button.textContent=original;
  },err=>{
    button.disabled=false;button.textContent=original;
    alert(err.code===1?'Has denegat el permís de localització. Activa’l a la configuració del navegador.':'No s’ha pogut obtenir la ubicació. Busca un punt de referència i comunica’l al 112.');
  },{enableHighAccuracy:true,timeout:15000,maximumAge:30000});
}

function emergencyOfflinePage() {
  const f=data.family||{};
  const familyName=String(f.name||'').trim();
  const personal=String(f.contact||'').trim();
  const outside=String(f.outside||'').trim();
  const meeting=String(f.meeting||'').trim();
  const backup=String(f.meeting2||'').trim();
  const members=String(f.members||'').trim();
  const notes=String(f.notes||'').trim();
  const row=(label,value)=>value?'<div class="offline-data-row"><small>'+label+'</small><strong>'+escapeHtml(value).replace(/\n/g,'<br>')+'</strong></div>':'';
  return `<div class="page offline-page"><section class="hero hero-danger"><div class="hero-kicker">🆘 PRIORITAT · SEGURETAT</div><h1>Mode emergència</h1><p>Informació essencial i dades familiars guardades en aquest dispositiu.</p><a class="call112" href="tel:112">📞 Trucar al 112</a><button class="btn blue sos-location" type="button" data-share-location>📍 Compartir la meva ubicació</button></section>
  <section class="offline-priority"><h2>Primer, fes això</h2><ol><li><b>Protegeix-te.</b> Allunya’t del perill immediat i no t’exposis per rescatar objectes.</li><li><b>Truca al 112</b> si hi ha ferits, risc greu, incendi, rescat o perill immediat. Explica què passa, on ets i quantes persones necessiten ajuda.</li><li><b>Segueix les autoritats.</b> Evacua o confina’t segons les instruccions; no improvisis rutes perilloses.</li><li><b>Estalvia bateria.</b> Activa l’estalvi d’energia i envia missatges curts si la xarxa està saturada.</li></ol></section>
  <section class="info offline-family"><div class="offline-section-head"><h2>👨‍👩‍👧 Dades del teu pla familiar</h2><button type="button" class="offline-edit" data-go="family">Editar</button></div>
  ${row('Família',familyName)}${row('Adreça',f.address)}${row('Contacte principal',personal)}${row('Punt de trobada',meeting)}${row('Punt alternatiu',backup)}${row('Contacte fora de la zona',outside)}${row('Membres i telèfons',members)}${row('Informació important',notes)}
  ${(!familyName&&!f.address&&!personal&&!meeting&&!backup&&!outside&&!members&&!notes)?'<p class="small">Encara no has desat dades familiars. Pots configurar-les ara; es guarden al dispositiu.</p>':''}</section>
  <div class="grid offline-shortcuts"><article class="card tile" data-go="now"><span class="emoji">🚨</span><div><h3>Guies d’emergència</h3><p>Incendi, inundació, tempesta i més</p></div></article><article class="card tile" data-go="phone"><span class="emoji">☎️</span><div><h3>Telèfons útils</h3><p>Contactes guardats i serveis</p></div></article><article class="card tile" data-go="family"><span class="emoji">👨‍👩‍👧</span><div><h3>Pla familiar</h3><p>Actualitza les dades</p></div></article></div>
  <div class="info offline-note"><strong>ℹ️ Què funciona sense internet?</strong><p>Aquesta pantalla, les guies i les dades familiars ja guardades es poden consultar quan l’app i els seus fitxers s’han carregat prèviament. La trucada al 112 necessita cobertura mòbil; el GPS necessita permís i pot fallar. Compartir la ubicació pot requerir connexió. Els mapes en línia no funcionen sense internet.</p><p><b>Privacitat:</b> les dades familiars es llegeixen del teu dispositiu i no s’envien automàticament.</p><button class="btn light" type="button" data-go="offline-check">🧪 Comprovar el mode sense connexió</button></div></div>`;
}

function offlineCheckPage() {
  const online = navigator.onLine;
  const familySaved = !!localStorage.getItem(KEY);
  const swSupported = 'serviceWorker' in navigator;
  const cacheSupported = 'caches' in window;
  return `<div class="page offline-page"><button class="back-link" data-back>‹ Tornar</button><section class="hero"><div class="hero-kicker">🧪 COMPROVACIÓ</div><h1>Preparació sense connexió</h1><p>Aquesta comprovació mira el que el navegador pot verificar ara mateix. No substitueix una prova real en mode avió.</p></section>
  <div class="info offline-check-list"><div><b>${online?'🟢 Connexió disponible':'🟠 Sense connexió detectada'}</b><small>Estat de xarxa del dispositiu</small></div><div><b>${swSupported?'🟢 Service Worker disponible':'🔴 Service Worker no disponible'}</b><small>Necessari per mantenir recursos locals</small></div><div><b>${cacheSupported?'🟢 Cache API disponible':'🔴 Cache API no disponible'}</b><small>Permet consultar fitxers emmagatzemats</small></div><div><b>${familySaved?'🟢 Dades locals trobades':'🟡 Encara no hi ha dades familiars desades'}</b><small>La informació personal es conserva en aquest dispositiu</small></div><p id="offlineCacheStatus" class="small">Comprovant els fitxers locals…</p><button class="btn blue" id="offlineRunCheck">Tornar a comprovar</button></div>
  <div class="info"><h2>Prova real recomanada</h2><ol><li>Obre l’app amb internet i espera que carregui completament.</li><li>Activa el mode avió i comprova que Wi-Fi també estigui desactivat.</li><li>Tanca i torna a obrir l’app des de la icona instal·lada.</li><li>Entra al Mode emergència, les guies i el pla familiar.</li><li>Comprova que les dades guardades continuen apareixent.</li></ol><p class="guide-note">Les trucades necessiten cobertura mòbil; GPS, brúixola i compartir ubicació depenen del dispositiu i dels permisos. Els mapes i les consultes externes necessiten internet.</p></div></div>`;
}
async function runOfflineAssetCheck() {
  const el=document.getElementById('offlineCacheStatus'); if(!el)return;
  if(!('caches' in window)){el.textContent='Aquest navegador no exposa la memòria cau.';return;}
  try {
    const keys=await caches.keys(); const cacheNames=keys.filter(k=>k.startsWith('supervivencia-'));
    const cached=new Set();
    for(const name of cacheNames){const c=await caches.open(name);for(const req of await c.keys())cached.add(new URL(req.url).pathname.split('/').pop());}
    const required=['index.html','styles.css','app.js','features.js','preparedness.js'];
    const missing=required.filter(x=>!cached.has(x));
    el.textContent=missing.length?'Fitxers que no consten a la memòria cau: '+missing.join(', '):'🟢 Fitxers principals localitzats a la memòria cau: index, estils, app, guies i preparació.';
  } catch(_){el.textContent='No s’ha pogut llegir la memòria cau. Prova-ho des de l’app instal·lada.';}
}
function render() {
  const main = document.querySelector('#main');
  if (!main) return;
  let html;
  if (route === 'home') html = home();
  else if (route === 'kit') html = checklistPage('kit');
  else if (route === 'bag') html = checklistPage('bag');
  else if (route === 'now') html = nowPage();
  else if (route === 'offline') html = emergencyOfflinePage();
  else if (route === 'offline-check') html = offlineCheckPage();
  else if (route === 'tips') html = tipsPage();
  else if (route === 'family') html = familyPage();
  else if (route === 'more') html = morePage();
  else if (route === 'level') html = levelPage();
  else if (route === 'phone') html = phonePage();
  else if (route === 'map' || route === 'radio' || route === 'navigation') html = '';
  else if (route.startsWith('emergency-')) html = emergencyPage(route.split('-')[1]);
  else { route = 'home'; html = home(); }
  main.innerHTML = html;
  if (route === 'phone') bindPhonePage();
  if (route === 'offline-check') { runOfflineAssetCheck(); main.querySelector('#offlineRunCheck')?.addEventListener('click',runOfflineAssetCheck); }
  main.querySelectorAll('[data-share-location]').forEach(button=>button.addEventListener('click',()=>shareEmergencyLocation(button)));
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
