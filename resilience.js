(() => {
  'use strict';
  const KEY='supervivencia-blackout-check-v1';
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const read=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){return {}}};
  const save=o=>{try{localStorage.setItem(KEY,JSON.stringify(o));return true}catch(_){return false}};
  const blackoutItems=[
    ['torch','Llanternes i piles carregades preparades'],
    ['radio','Ràdio de piles o maneta i freqüència local coneguda'],
    ['power','Bateries externes carregades i cables compatibles'],
    ['water','Aigua potable disponible i recipients nets'],
    ['food','Aliments que no necessiten nevera ni cuinar'],
    ['meds','Medicació imprescindible i productes de suport'],
    ['fridge','Nevera i congelador tancats; obrir-los només quan calgui'],
    ['heat','Cap generador, barbacoa, fogó o braser dins de casa o garatge'],
    ['lifts','No utilitzar ascensors; ajudar qui en depèn'],
    ['contacts','Contactes familiars i punt de trobada accessibles en paper']
  ];
  function tile(icon,title,desc,route,cls){
    return '<article class="card tile feature-tile '+(cls||'')+'" data-resilience-go="'+route+'"><span class="emoji">'+icon+'</span><div><h3>'+title+'</h3><p>'+desc+'</p></div></article>';
  }
  function homePage(){
    return '<div class="page resilience-page"><button class="back-link" data-resilience-back>‹ Tornar</button>'+
      '<section class="hero resilience-hero"><div class="hero-kicker">🛡️ CENTRE DE PREPARACIÓ</div><h1>Centre d’emergències</h1><p>Accés ràpid a les actuacions, guies i fonts oficials. Prepara’t abans que passi i consulta les instruccions amb calma.</p><a class="call112" href="tel:112">📞 TRUCAR AL 112</a></section>'+
      '<div class="resilience-alert"><b>Recorda:</b> en una emergència real, protegeix-te primer, truca al 112 quan calgui i segueix sempre les instruccions de les autoritats.</div>'+
      '<div class="grid">'+tile('⚡','Apagada elèctrica','Guia pràctica i checklist que es desa al mòbil','blackout')+
      tile('🩺','Primers auxilis','PAS, RCP, ennuegament, hemorràgies i guies oficials','firstaid')+
      tile('📡','Alertes i informació','Meteocat, AEMET, Pla Alfa, ACA i Protecció Civil','alerts')+
      tile('🏕️','Muntanya i natura','Orientació, pèrdua, aigua, refugi i mapes offline','outdoor')+
      tile('🧭','Brúixola i GPS','Rumb, punts guardats i registre de recorregut','navigation')+
      tile('📘','Totes les guies','Consulta el manual complet de l’aplicació','guides')+'</div>'+
      '<section class="info"><h2>📥 Abans de sortir o d’una emergència</h2><p>Obre l’app amb connexió perquè les guies i els recursos quedin desats. Descarrega també els mapes de la zona a Organic Maps: el mapa en línia de Supervivència no funciona sense internet.</p><a href="https://organicmaps.app/" target="_blank" rel="noopener">Preparar mapes offline amb Organic Maps ↗</a></section>'+
      '<p class="small">Les dades personals i les llistes es guarden al dispositiu. Les alertes externes necessiten connexió i no es reprodueixen en directe dins d’aquesta app.</p></div>';
  }
  function blackoutPage(){
    const s=read();
    const rows=blackoutItems.map(x=>'<label class="prep-check"><input type="checkbox" data-blackout="'+x[0]+'" '+(s[x[0]]?'checked':'')+'><span>'+x[1]+'</span></label>').join('');
    return '<div class="page resilience-page"><button class="back-link" data-resilience-back>‹ Centre d’emergències</button>'+
      '<section class="hero"><div class="hero-kicker">⚡ GUIA D’AUTONOMIA</div><h1>Si marxa la llum</h1><p>Prioritza la seguretat, la informació i les necessitats de les persones de casa.</p></section>'+
      '<a class="call112" href="tel:112">📞 Trucar al 112 si hi ha perill o una emergència mèdica</a>'+
      '<section class="info"><h2>En els primers minuts</h2><ol class="resilience-steps"><li>Comprova si l’avaria afecta només casa teva o també el carrer. No manipulis quadres elèctrics mullats o danyats.</li><li>Fes servir llanternes. Evita espelmes i flames obertes.</li><li>Desconnecta aparells sensibles si hi ha risc de sobretensió i deixa una llum encesa per detectar quan torni el corrent.</li><li>Mantén tancades la nevera i el congelador. Obre’ls només quan sigui necessari.</li><li>Posa el mòbil en estalvi d’energia i escolta una ràdio de piles o maneta.</li><li>Comprova si algú depèn d’un equip mèdic elèctric. Si la continuïtat assistencial està en risc, contacta amb els serveis sanitaris o el 112 segons la gravetat.</li></ol></section>'+
      '<section class="info"><h2>☠️ Evita la intoxicació per monòxid de carboni</h2><p><b>Mai</b> facis servir generadors, barbacoes, fogons de càmping, brasers o motors dins de casa, garatges, tendes o espais tancats, encara que hi hagi finestres obertes. El monòxid de carboni no fa olor ni es veu.</p><p>Si diverses persones tenen mal de cap, mareig, nàusees o confusió, sortiu immediatament a l’aire lliure i truqueu al 112 des de fora. No torneu a entrar.</p></section>'+
      '<section class="info"><h2>🥫 Aliments i aigua</h2><ul><li>No tastis aliments per comprovar si encara són bons. Si tens dubtes sobre la conservació o la temperatura, descarta’ls.</li><li>No beguis aigua de fonts o xarxes si hi ha una alerta de contaminació. Segueix les indicacions oficials.</li><li>No cuinis amb equips de combustió a l’interior. Prioritza aliments preparats que no necessitin cocció.</li><li>Quan torni la llum, connecta els equips d’un en un i comprova que no hi hagi danys.</li></ul></section>'+
      '<section class="info"><div class="offline-section-head"><h2>Checklist personal</h2><button class="offline-edit" id="blackoutReset">Reiniciar</button></div><p>Marca el que ja tens resolt. Es desa automàticament en aquest telèfon.</p><div class="prep-checks">'+rows+'</div><p class="small" id="blackoutSaved">Progrés: '+blackoutItems.filter(x=>s[x[0]]).length+' de '+blackoutItems.length+' punts.</p></section>'+
      '<p class="small">Consells basats en les recomanacions de Protecció Civil de Catalunya. En cada incident, prevalen les instruccions oficials.</p><a href="https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/consells_autoproteccio_emergencia/preparat_per_les_emergencies/" target="_blank" rel="noopener">Protecció Civil · Preparat per a les emergències ↗</a></div>';
  }
  function firstAidPage(){
    const links=[
      ['❤️','Aturada cardíaca, RCP i DEA','Reconeixement, compressions i ús del desfibril·lador.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/aturada-cardiaca/'],
      ['🫁','Ennuegament','Diferencia tos efectiva i obstrucció greu.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/ennuegaments/index.html'],
      ['🩸','Hemorràgies','Pressió directa i actuació davant d’un sagnat greu.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/hemorragies/index.html'],
      ['🌡️','Cop de calor','Refredament ràpid i senyals d’alarma.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/cop-calor/'],
      ['🔥','Cremades','Què fer i quins remeis cal evitar.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/cremades/'],
      ['🧠','Ictus','Reconeix els senyals i truca al 112 sense demora.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/ictus/'],
      ['⚡','Convulsions','Protecció de la persona i quan demanar ajuda.','https://canalsalut.gencat.cat/ca/salut-a-z/p/primers-auxilis/convulsions/']
    ];
    return '<div class="page resilience-page"><button class="back-link" data-resilience-back>‹ Centre d’emergències</button><section class="hero"><div class="hero-kicker">🩺 ACTUACIÓ IMMEDIATA</div><h1>Primers auxilis</h1><p>Protegir, alertar i socórrer (PAS). No et posis en perill i no substitueixis la formació pràctica.</p></section><a class="call112" href="tel:112">📞 TRUCAR AL 112</a><div class="info"><h2>Abans d’ajudar: PAS</h2><ol><li><b>Protegir:</b> comprova que l’entorn sigui segur per a tu, la víctima i les persones del voltant.</li><li><b>Alertar:</b> truca al 112, posa el telèfon en mans lliures i explica què ha passat, on sou i quantes persones necessiten ajuda.</li><li><b>Socórrer:</b> segueix les instruccions de l’operador i ajuda només dins de les teves possibilitats.</li></ol></div><div class="resilience-link-list">'+links.map(x=>'<a class="resilience-link" href="'+x[3]+'" target="_blank" rel="noopener"><span>'+x[0]+'</span><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><strong>↗</strong></a>').join('')+'</div><div class="info"><h2>🎥 Vídeos del SEM</h2><p>Vídeos divulgatius curts elaborats per professionals del Sistema d’Emergències Mèdiques, incloent RCP, DEA, ictus, convulsions i ennuegament.</p><a href="https://sem.gencat.cat/ca/emergencies-mediques/primers-auxilis/" target="_blank" rel="noopener">Veure els vídeos oficials del SEM ↗</a></div><div class="resilience-note">No improvisis maniobres avançades. En una emergència, segueix les instruccions telefòniques del 112. Les tècniques poden variar segons l’edat i la situació.</div></div>';
  }
  function alertsPage(){
    const links=[
      ['📢','Protecció Civil','Avisos, consells i instruccions oficials per a la població.','https://interior.gencat.cat/ca/arees_dactuacio/proteccio_civil/'],
      ['🌦️','Meteocat','Predicció i avisos meteorològics per municipi i comarca.','https://www.meteo.cat/prediccio/general'],
      ['⛈️','AEMET · Avisos','Avisos oficials de fenòmens meteorològics adversos.','https://www.aemet.es/ca/eltiempo/prediccion/avisos'],
      ['🔥','Pla Alfa','Nivell de perill d’incendi forestal per municipi a Catalunya.','https://interior.gencat.cat/ca/serveis/informacio-geografica/visors-i-aplicacions/pla-alfa'],
      ['🌊','ACA · Estat de rius i avisos','Informació hidrològica i avisos de l’Agència Catalana de l’Aigua.','https://aca.gencat.cat/ca/laigua/estat-del-medi-hidric/'],
      ['🚨','CAT112','Informació del servei d’emergències de Catalunya.','https://112.gencat.cat/ca/'],
      ['🛰️','Mapa de Protecció Civil','Consulta els riscos i elements de protecció civil del territori.','https://interior.gencat.cat/ca/serveis/informacio-geografica/visors-i-aplicacions/']
    ];
    return '<div class="page resilience-page"><button class="back-link" data-resilience-back>‹ Centre d’emergències</button><section class="hero"><div class="hero-kicker">📡 INFORMACIÓ OFICIAL</div><h1>Alertes i riscos</h1><p>Accés directe a fonts oficials de Catalunya i Espanya. Consulta sempre l’hora d’actualització de cada servei.</p></section><div class="resilience-note"><b>Important:</b> aquesta pantalla no rep alertes en directe ni substitueix ES-Alert. Mantén activades les alertes d’emergència del telèfon i segueix les instruccions oficials.</div><div class="resilience-link-list">'+links.map(x=>'<a class="resilience-link" href="'+x[3]+'" target="_blank" rel="noopener"><span>'+x[0]+'</span><div><b>'+x[1]+'</b><small>'+x[2]+'</small></div><strong>↗</strong></a>').join('')+'</div><div class="info"><h2>📱 Alertes al mòbil</h2><p>Comprova que les alertes d’emergència sense fil estiguin activades a la configuració del dispositiu. No silenciïs ni ignoris un avís ES-Alert: llegeix-lo completament i segueix-ne les instruccions.</p><p class="small">La ruta exacta dels ajustos pot variar segons el model i la versió d’Android o iOS.</p></div><div class="info"><h2>📻 Si falla Internet o la xarxa mòbil</h2><p>Fes servir una ràdio de piles o maneta, escolta emissores locals i consulta els avisos per canals oficials quan recuperis connexió. Les pàgines enllaçades no són disponibles offline.</p></div></div>';
  }
  function outdoorPage(){
    return '<div class="page resilience-page"><button class="back-link" data-resilience-back>‹ Centre d’emergències</button><section class="hero"><div class="hero-kicker">🏕️ MUNTANYA I NATURA</div><h1>Abans i durant una sortida</h1><p>Prepara la ruta i evita que un petit incident es converteixi en una emergència.</p></section><div class="info"><h2>Abans de sortir</h2><ul><li>Consulta la previsió i els avisos de Meteocat i Protecció Civil.</li><li>Explica a algú la ruta, els participants i l’hora prevista de retorn.</li><li>Descarrega el mapa de la zona i comprova que es pot obrir sense cobertura.</li><li>Porta aigua, menjar, roba per capes, frontal, farmaciola i bateria externa.</li><li>Adapta l’itinerari al nivell del grup i fixa una hora de retorn.</li></ul></div><div class="info"><h2>Si et perds</h2><ol><li>Atura’t en un lloc segur. No continuïs a l’atzar ni improvisis dreceres.</li><li>Comprova si algú està ferit, protegeix-te del fred, calor, vent i pluja.</li><li>Si necessites rescat, truca al 112 i facilita coordenades o comparteix la ubicació.</li><li>No entris en barrancs, lleres ni pendents desconeguts per intentar baixar.</li><li>Estalvia bateria, fes-te visible i segueix les instruccions dels equips de rescat.</li></ol><a href="https://web.gencat.cat/ca/ciutadania/emergencies-seguretat/seguretat-muntanya" target="_blank" rel="noopener">Consells oficials de seguretat a la muntanya ↗</a></div><div class="grid">'+tile('🧭','Orientació i retorn','Brúixola, GPS i punts guardats','navigation')+tile('🗺️','Mapa i serveis','Mapa, refugis, aigua i punts útils','map')+tile('📘','Guies de natura','Aigua segura, refugi, foc i pèrdua','guides')+'</div><div class="info"><h2>🗺️ Mapes sense cobertura</h2><p>Descarrega prèviament les zones que necessitis. El mapa d’aquesta aplicació utilitza cartografia en línia; no descarrega les rajoles per si sol.</p><a href="https://organicmaps.app/" target="_blank" rel="noopener">Obrir Organic Maps ↗</a></div></div>';
  }
  function render(){
    const route=location.hash.replace('#','');
    const main=$('#main');
    if(!main)return false;
    const pages={resilience:homePage,blackout:blackoutPage,firstaid:firstAidPage,alerts:alertsPage,outdoor:outdoorPage};
    if(!pages[route])return false;
    main.innerHTML=pages[route]();
    main.querySelectorAll('[data-resilience-back]').forEach(b=>b.addEventListener('click',()=>{location.hash=route==='resilience'?'home':'resilience'}));
    main.querySelectorAll('[data-resilience-go]').forEach(b=>b.addEventListener('click',()=>{location.hash=b.dataset.resilienceGo}));
    main.querySelectorAll('[data-blackout]').forEach(b=>b.addEventListener('change',()=>{
      const s=read();s[b.dataset.blackout]=b.checked;save(s);
      const n=$('#blackoutSaved');if(n)n.textContent='Progrés: '+blackoutItems.filter(x=>s[x[0]]).length+' de '+blackoutItems.length+' punts. Desat al dispositiu.';
    }));
    $('#blackoutReset')?.addEventListener('click',()=>{if(confirm('Vols reiniciar aquesta checklist?')){save({});render();}});
    return true;
  }
  function decorate(){
    const old=window.decorateFeatures;
    window.decorateFeatures=()=>{
      if(old)old();
      const route=location.hash.replace('#','');
      if(render())return;
      if(route==='home'||route===''){
        const grid=$('#main .page .grid');
        if(grid&&!grid.querySelector('[data-resilience-go="resilience"]'))grid.insertAdjacentHTML('beforeend',tile('🛡️','Centre d’emergències','Apagades, primers auxilis i alertes oficials','resilience','resilience-home-tile'));
      }
      if(route==='more'){
        const grid=$('#main .page .grid');
        if(grid&&!grid.querySelector('[data-resilience-go="resilience"]'))grid.insertAdjacentHTML('beforeend',tile('🛡️','Centre d’emergències','Apagades, primers auxilis i alertes oficials','resilience','resilience-home-tile'));
      }
    };
  }
  decorate();
  document.addEventListener('click',e=>{
    const tile=e.target.closest('[data-resilience-go]');
    if(tile){location.hash=tile.dataset.resilienceGo;return;}
  });
  addEventListener('hashchange',()=>{if(render())window.scrollTo(0,0);});
  addEventListener('load',()=>{if(render())window.scrollTo(0,0);});
  setTimeout(()=>{if(render())window.scrollTo(0,0);},120);
})();