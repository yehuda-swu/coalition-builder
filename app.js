const parties = [
  {id:'likud',name:'Likud',leader:'Bibi Netanyahu',seats:23,sector:'Right',logo:'assets/logos/likud.webp',photo:'assets/leaders/bibi.webp',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'No'}},
  {id:'yashar',name:'Yashar',leader:'Gadi Eisenkot',seats:24,sector:'Left',logo:'assets/logos/yashar.png',photo:'assets/leaders/eisenkot.webp',bibi:'No',positions:{security:'Neutral',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'byachad',name:"B'Yachad",leader:'Naftali Bennett',seats:16,sector:'Right',logo:'assets/logos/byachad.webp',photo:'assets/leaders/bennett.webp',bibi:'No',positions:{security:'Neutral',inquiry:'Yes',judicial:'No',arab:'Neutral',charedi:'Yes'}},
  {id:'democrats',name:'The Democrats',leader:'Yair Golan',seats:9,sector:'Far Left',logo:'assets/logos/democrats.webp',photo:'assets/leaders/golan.webp',bibi:'No',positions:{security:'Yes',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'yisrael_beitenu',name:'Yisrael Beitenu',leader:'Avigdor Lieberman',seats:11,sector:'Right',logo:'assets/logos/yisrael_beitenu.webp',photo:'assets/leaders/lieberman.webp',bibi:'No',positions:{security:'Yes',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'hatzionut_hadati',name:'Hatzionut HaDatit',leader:'Bezalel Smotrich',seats:4,sector:'Far Right',logo:'assets/logos/hatzionut_hadati.webp',photo:'assets/leaders/smotrich.webp',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'Yes'}},
  {id:'otzma_yehudit',name:'Otzma Yehudit',leader:'Itamar Ben Gvir',seats:8,sector:'Far Right',logo:'assets/logos/otzma_yehudit.webp',photo:'assets/leaders/ben_gvir.webp',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'No'}},
  {id:'utj',name:'UTJ',leader:'Moshe Gafni and Yitzhak Goldknopf',seats:8,sector:'Ultra Orthodox Jewish',logo:'assets/logos/utj.webp',photo:'assets/leaders/gafni_goldknopf.webp',bibi:'Maybe',positions:{security:'Neutral',inquiry:'Neutral',judicial:'Neutral',arab:'Neutral',charedi:'No'}},
  {id:'shas',name:'Shas',leader:'Arye Deri',seats:7,sector:'Ultra Orthodox Jewish',logo:'assets/logos/shas.webp',photo:'assets/leaders/deri.webp',bibi:'Maybe',positions:{security:'Neutral',inquiry:'Neutral',judicial:'Neutral',arab:'Neutral',charedi:'No'}},
  {id:'joint_arab_list',name:'Joint Arab List',leader:'Youssef Jabareen',seats:5,sector:'Arab',logo:'assets/logos/joint_arab_list.webp',photo:'assets/leaders/jabareen.webp',bibi:'No',positions:{security:'Yes',inquiry:'Neutral',judicial:'Neutral',arab:'Yes',charedi:'Neutral'}},
  {id:'raam',name:"Ra'am",leader:'Mansour Abbas',seats:5,sector:'Arab',logo:'assets/logos/raam.webp',photo:'assets/leaders/abbas.webp',bibi:'Maybe',positions:{security:'Yes',inquiry:'Neutral',judicial:'Neutral',arab:'Yes',charedi:'Neutral'}}
];

const sectors = [
  {name:'All',icon:'◉',colour:'#0b2f5b'},
  {name:'Far Left',icon:'✊',colour:'#d1495b'},
  {name:'Left',icon:'🕊',colour:'#2a9d8f'},
  {name:'Right',icon:'🛡',colour:'#2f5ea8'},
  {name:'Far Right',icon:'⚑',colour:'#e67e22'},
  {name:'Ultra Orthodox Jewish',icon:'🎩',colour:'#7a4fa3'},
  {name:'Arab',icon:'عربي',colour:'#4c956c'}
];

const issueLabels = {
  security:'Security and Palestinians',
  inquiry:'October 7 Inquiry',
  judicial:'Judicial Reform',
  arab:'Work with anti Zionist Arab parties',
  charedi:'Charedi integration'
};

const state = {
  selected:new Set(),
  sector:'All',
  stage:'welcome',
  compromises:3
};

const app = document.getElementById('app');

function sectorColour(name){
  return (sectors.find(s=>s.name===name) || sectors[0]).colour;
}
function selectedParties(){
  return parties.filter(p=>state.selected.has(p.id));
}
function totalSeats(){
  return selectedParties().reduce((n,p)=>n+p.seats,0);
}
function esc(s){
  return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function render(){
  if(state.stage==='welcome'){
    renderWelcome();
  } else {
    renderGame();
  }
}

function renderWelcome(){
  app.innerHTML = `
    <div class="app">
      <section class="splash">
        <div class="splashOverlay"></div>
        <div class="splashInner">
          <div class="seriesTag">Israel Democracy Interactive</div>
          <div class="splashBadge">120 seats · 61 needed</div>
          <h1>Coalition Builder</h1>
          <p>Can you form Israel's next government?</p>
          <div class="welcomeRules">
            <div><strong>1</strong><span>Choose parties</span></div>
            <div><strong>2</strong><span>Reach 61 seats</span></div>
            <div><strong>3</strong><span>Navigate policy disagreements</span></div>
          </div>
          <button class="primary large" id="start">Start challenge</button>
          <div class="welcomeNote">The final political test is revealed only after you build a majority.</div>
        </div>
      </section>
    </div>`;
  document.getElementById('start').addEventListener('click',()=>{
    state.stage='build';
    render();
  });
}

function renderGame(){
  const total = totalSeats();
  const filtered = state.sector==='All' ? parties : parties.filter(p=>p.sector===state.sector);
  const progress = Math.min(100,(total/61)*100);

  app.innerHTML = `
    <div class="app">
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <div class="brandMark">61</div>
            <div>
              <div>Coalition Builder</div>
              <small>Israel Democracy Interactive</small>
            </div>
          </div>
          <button class="ghost" id="resetTop">Reset</button>
        </header>

        <section class="dashboard">
          <div class="majorityPanel">
            <div class="majorityCopy">
              <span class="eyebrowDark">Your coalition</span>
              <div class="bigSeatCount"><span>${total}</span><small>/ 61</small></div>
              <p>${total>=61 ? 'Majority reached. Now test whether it can survive.' : `${61-total} more seats needed for a majority.`}</p>
            </div>
            ${knessetVisual()}
          </div>

          <div class="progressWrap">
            <div class="progressHead"><span>Progress to a majority</span><span>${total} / 61</span></div>
            <div class="progress"><div class="progressFill" style="width:${progress}%"></div></div>
          </div>
        </section>

        <section class="sectorSection">
          <div class="sectionHead">
            <div>
              <h2>Explore the political sectors</h2>
              <p>Filter the parties, then invite them into your coalition.</p>
            </div>
          </div>
          <div class="sectorGrid">
            ${sectors.map(s=>`
              <button class="sectorTile ${state.sector===s.name?'active':''}" data-sector="${esc(s.name)}" style="--sector:${s.colour}">
                <span class="sectorIcon">${s.icon}</span>
                <span class="sectorName">${esc(s.name)}</span>
              </button>`).join('')}
          </div>
        </section>

        <section>
          <div class="sectionHead">
            <div>
              <h2>${state.sector==='All'?'All parties':esc(state.sector)}</h2>
              <p>${filtered.length} ${filtered.length===1?'party':'parties'} in view</p>
            </div>
          </div>
          <div class="partyGrid">${filtered.map(p=>partyCard(p)).join('')}</div>
        </section>

        ${coalitionPanel(total)}
        ${policyPanel(total)}
        ${revealPanel()}

        <div class="footerNote">Workshop scenario based on the polling numbers and policy positions supplied for this activity.</div>
      </div>
      ${stickyCoalition(total)}
    </div>`;

  bindGameEvents();
}

function knessetVisual(){
  const chosen = selectedParties();
  const seatColours = [];
  chosen.forEach(p=>{
    for(let i=0;i<p.seats;i++) seatColours.push(sectorColour(p.sector));
  });

  const seats = [];
  const rows = [24,22,20,18,16,12,8];
  const centreX = 210;
  const centreY = 196;
  const radii = [172,151,130,109,88,67,46];

  rows.forEach((count,row)=>{
    const radius = radii[row];
    const start = Math.PI * 1.08;
    const end = Math.PI * 1.92;
    for(let i=0;i<count;i++){
      const t = count===1 ? 0.5 : i/(count-1);
      const angle = start + (end-start)*t;
      const x = centreX + Math.cos(angle)*radius;
      const y = centreY + Math.sin(angle)*radius;
      const index = seats.length;
      const fill = seatColours[index] || '#dce5ed';
      const selected = index < seatColours.length ? 'filled' : '';
      seats.push(`<circle class="kSeat ${selected}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.2" fill="${fill}"></circle>`);
    }
  });

  return `
    <div class="knessetWrap">
      <svg viewBox="0 0 420 215" role="img" aria-label="${totalSeats()} of 120 Knesset seats currently selected">
        <path d="M35 195 Q210 15 385 195" fill="none" stroke="#d8e3ec" stroke-width="1.5"></path>
        ${seats.join('')}
        <line x1="210" y1="198" x2="210" y2="172" stroke="#c79a2b" stroke-width="3"></line>
        <text x="210" y="211" text-anchor="middle" class="majorityMarker">61</text>
      </svg>
      <div class="knessetCaption">120 seat Knesset</div>
    </div>`;
}

function partyCard(p){
  const selected = state.selected.has(p.id);
  return `
    <article class="partyCard ${selected?'selected':''}" style="--sector:${sectorColour(p.sector)}">
      <div class="cardMedia">
        <div class="leaderPhotoWrap">
          <img class="leaderPhoto" src="${p.photo}" alt="${esc(p.leader)}">
        </div>
        <div class="partyLogoWrap">
          <img class="partyLogo" src="${p.logo}" alt="${esc(p.name)} logo">
        </div>
        <div class="seatBadge">${p.seats}<span>seats</span></div>
      </div>
      <div class="partyBody">
        <div class="partyName">${esc(p.name)}</div>
        <div class="leader">${esc(p.leader)}</div>
        <div class="partyMeta">
          <span class="sectorPill" style="background:${sectorColour(p.sector)}">${esc(p.sector)}</span>
        </div>
        <button class="selectBtn" data-party="${p.id}">
          ${selected ? 'Remove from coalition' : 'Invite to coalition'}
        </button>
      </div>
    </article>`;
}

function stickyCoalition(total){
  const chosen = selectedParties();
  const chips = chosen.slice(0,5).map(p=>`<span class="coalitionChip" style="--sector:${sectorColour(p.sector)}">${esc(p.name)}</span>`).join('');
  const extra = chosen.length>5 ? `<span class="coalitionMore">+${chosen.length-5}</span>` : '';
  return `
    <div class="stickyCoalition">
      <div class="stickyInner">
        <div>
          <div class="stickyLabel">Current coalition</div>
          <div class="coalitionChips">${chips || '<span class="coalitionEmpty">Choose your first party</span>'}${extra}</div>
        </div>
        <div class="stickyScore ${total>=61?'reached':''}">
          <strong>${total}</strong><span>/ 61</span>
        </div>
      </div>
    </div>`;
}

function coalitionPanel(total){
  const chosen = selectedParties();
  const rows = chosen.length
    ? chosen.map(p=>`
        <div class="coalitionRow">
          <span><i style="background:${sectorColour(p.sector)}"></i>${esc(p.name)}</span>
          <strong>${p.seats}</strong>
        </div>`).join('')
    : `<div class="empty">No parties selected yet.</div>`;

  const status = total>=61
    ? `<div class="callout success majorityReached">
         <div class="successIcon">✓</div>
         <div>
           <h2>Majority reached</h2>
           <p>You have ${total} seats. Now find out whether this coalition can manage its policy disagreements.</p>
           <button class="secondary" id="checkPolicy">Check policy compatibility</button>
         </div>
       </div>`
    : '';

  return `
    <section class="coalitionBox">
      <div class="sectionHead compact">
        <div><h2>Your coalition</h2><p>Selected parties and seats</p></div>
      </div>
      <div class="coalitionRows">${rows}</div>
    </section>
    ${status}`;
}

function policyPanel(total){
  if(state.stage!=='policy' && state.stage!=='reveal') return '';
  if(total<61) return '';

  const chosen = selectedParties();
  const issues = Object.keys(issueLabels);

  const summary = issues.map(k=>{
    const vals = chosen.map(p=>p.positions[k]);
    const yes = vals.filter(v=>v==='Yes').length;
    const no = vals.filter(v=>v==='No').length;
    const neutral = vals.filter(v=>v==='Neutral').length;
    const hasConflict = yes>0 && no>0;
    return `
      <div class="issueCard ${hasConflict?'conflict':''}">
        <div class="issueName">${issueLabels[k]}</div>
        <div class="issueCounts">
          <span class="miniYes">${yes} support</span>
          <span class="miniNo">${no} oppose</span>
          <span class="miniNeutral">${neutral} neutral</span>
        </div>
        <div class="issueVerdict">${hasConflict?'Potential disagreement':'No direct yes and no clash'}</div>
      </div>`;
  }).join('');

  const table = `
    <div class="tableScroll">
      <table class="policyTable">
        <thead>
          <tr><th>Party</th>${issues.map(k=>`<th>${issueLabels[k]}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${chosen.map(p=>`
            <tr>
              <td><strong>${esc(p.name)}</strong></td>
              ${issues.map(k=>`<td class="status${p.positions[k]}">${p.positions[k]}</td>`).join('')}
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  const next = state.stage==='policy'
    ? `<div class="callout warn">
         <div class="compromiseTokens">
           <span>Coalitions require compromise</span>
           <div class="tokenRow"><i></i><i></i><i></i></div>
         </div>
         <h2>Could these parties negotiate through the differences?</h2>
         <p>Policy disagreements do not automatically make a coalition impossible. If you think these parties could find compromises, continue to the final political test.</p>
         <button class="secondary" id="showReveal">Continue to final test</button>
       </div>`
    : '';

  return `
    <section id="policySection" class="analysisSection">
      <div class="stageLabel">Stage two</div>
      <h2>Policy compatibility</h2>
      <p class="analysisIntro">Compare the five issues before deciding whether your coalition can hold together.</p>
      <div class="issueSummary">${summary}</div>
      ${table}
    </section>
    ${next}`;
}

function revealPanel(){
  if(state.stage!=='reveal') return '';

  const chosen = selectedParties();
  const yes = chosen.filter(p=>p.bibi==='Yes');
  const no = chosen.filter(p=>p.bibi==='No');
  const maybe = chosen.filter(p=>p.bibi==='Maybe');

  const yesSeats = yes.reduce((n,p)=>n+p.seats,0);
  const maybeSeats = maybe.reduce((n,p)=>n+p.seats,0);
  const noSeats = no.reduce((n,p)=>n+p.seats,0);
  const maximumPossible = yesSeats + maybeSeats;

  const cards = chosen.map(p=>`
    <div class="revealCard ${p.bibi.toLowerCase()}">
      <img src="${p.photo}" alt="${esc(p.leader)}">
      <div>
        <strong>${esc(p.name)}</strong>
        <span>${esc(p.leader)}</span>
      </div>
      <div class="stance ${p.bibi==='Yes'?'yesTxt':p.bibi==='No'?'noTxt':'maybeTxt'}">${p.bibi}</div>
    </div>`).join('');

  let verdict;
  if(yesSeats>=61){
    verdict = `The parties marked Yes alone account for ${yesSeats} seats.`;
  } else if(maximumPossible>=61){
    verdict = `The confirmed Yes parties have ${yesSeats} seats. Including the parties marked Maybe, the coalition could reach ${maximumPossible}.`;
  } else {
    verdict = `Even if every Maybe party joined, this combination reaches only ${maximumPossible} seats. The coalition has lost its majority.`;
  }

  return `
    <section id="revealSection" class="revealSection">
      <div class="revealIntro">
        <div class="revealPulse"></div>
        <div class="stageLabel light">Final test</div>
        <div class="revealKicker">One more factor</div>
        <h2>Will every party serve in a coalition led by Benjamin Netanyahu?</h2>
        <p>Policy overlap is not always decisive. Positions towards Netanyahu can determine whether otherwise compatible parties are willing to govern together.</p>
      </div>

      <div class="revealGrid">${cards}</div>

      <div class="revealMetrics">
        <div class="metric"><div class="metricLabel">Yes</div><div class="metricValue">${yesSeats}</div></div>
        <div class="metric"><div class="metricLabel">Maybe</div><div class="metricValue">${maybeSeats}</div></div>
        <div class="metric"><div class="metricLabel">No</div><div class="metricValue">${noSeats}</div></div>
      </div>

      <div class="callout danger">
        <h2>What happened?</h2>
        <p>${verdict}</p>
        <button class="secondary" id="rebuild">Return to negotiations</button>
      </div>
    </section>`;
}

function bindGameEvents(){
  document.getElementById('resetTop').addEventListener('click',resetGame);

  document.querySelectorAll('[data-sector]').forEach(b=>{
    b.addEventListener('click',()=>{
      state.sector = b.dataset.sector;
      render();
    });
  });

  document.querySelectorAll('[data-party]').forEach(b=>{
    b.addEventListener('click',()=>{
      const id = b.dataset.party;
      state.selected.has(id) ? state.selected.delete(id) : state.selected.add(id);
      if(totalSeats()<61) state.stage='build';
      render();
    });
  });

  const check = document.getElementById('checkPolicy');
  if(check){
    check.addEventListener('click',()=>{
      state.stage='policy';
      render();
      setTimeout(()=>document.getElementById('policySection')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    });
  }

  const reveal = document.getElementById('showReveal');
  if(reveal){
    reveal.addEventListener('click',()=>{
      state.stage='reveal';
      render();
      setTimeout(()=>document.getElementById('revealSection')?.scrollIntoView({behavior:'smooth',block:'start'}),80);
    });
  }

  const rebuild = document.getElementById('rebuild');
  if(rebuild){
    rebuild.addEventListener('click',()=>{
      state.stage='build';
      render();
      window.scrollTo({top:0,behavior:'smooth'});
    });
  }
}

function resetGame(){
  state.selected.clear();
  state.sector='All';
  state.stage='build';
  render();
  window.scrollTo({top:0,behavior:'smooth'});
}

if('serviceWorker' in navigator){
  window.addEventListener('load',()=>{
    navigator.serviceWorker.register('service_worker.js').catch(()=>{});
  });
}

render();
