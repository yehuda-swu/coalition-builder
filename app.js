const parties = [
  {id:'likud',name:'Likud',leader:'Bibi Netanyahu',seats:23,sector:'Right',logo:'assets/logos/likud.webp',photo:'assets/leaders/bibi.jpg',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'No'}},
  {id:'yashar',name:'Yashar',leader:'Gadi Eisenkot',seats:24,sector:'Left',logo:'assets/logos/yashar.png',bibi:'No',positions:{security:'Neutral',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'byachad',name:"B'Yachad",leader:'Naftali Bennett',seats:16,sector:'Right',logo:'assets/logos/byachad.webp',bibi:'No',positions:{security:'Neutral',inquiry:'Yes',judicial:'No',arab:'Neutral',charedi:'Yes'}},
  {id:'democrats',name:'The Democrats',leader:'Yair Golan',seats:9,sector:'Far Left',logo:'assets/logos/democrats.webp',bibi:'No',positions:{security:'Yes',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'yisrael_beitenu',name:'Yisrael Beitenu',leader:'Avigdor Lieberman',seats:11,sector:'Right',logo:'assets/logos/yisrael_beitenu.webp',bibi:'No',positions:{security:'Yes',inquiry:'Yes',judicial:'No',arab:'Yes',charedi:'Yes'}},
  {id:'hatzionut_hadati',name:'Hatzionut HaDatit',leader:'Bezalel Smotrich',seats:4,sector:'Far Right',logo:'assets/logos/hatzionut_hadati.webp',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'Yes'}},
  {id:'otzma_yehudit',name:'Otzma Yehudit',leader:'Itamar Ben Gvir',seats:8,sector:'Far Right',logo:'assets/logos/otzma_yehudit.webp',photo:'assets/leaders/ben_gvir.jpg',bibi:'Yes',positions:{security:'Yes',inquiry:'No',judicial:'Yes',arab:'No',charedi:'No'}},
  {id:'utj',name:'UTJ',leader:'Moshe Gafni and Yitzhak Goldknopf',seats:8,sector:'Ultra Orthodox Jewish',logo:'assets/logos/utj.webp',bibi:'Maybe',positions:{security:'Neutral',inquiry:'Neutral',judicial:'Neutral',arab:'Neutral',charedi:'No'}},
  {id:'shas',name:'Shas',leader:'Arye Deri',seats:7,sector:'Ultra Orthodox Jewish',logo:'assets/logos/shas.webp',bibi:'Maybe',positions:{security:'Neutral',inquiry:'Neutral',judicial:'Neutral',arab:'Neutral',charedi:'No'}},
  {id:'joint_arab_list',name:'Joint Arab List',leader:'Youssef Jabareen',seats:5,sector:'Arab',logo:'assets/logos/joint_arab_list.webp',bibi:'No',positions:{security:'Yes',inquiry:'Neutral',judicial:'Neutral',arab:'Yes',charedi:'Neutral'}},
  {id:'raam',name:"Ra'am",leader:'Mansour Abbas',seats:5,sector:'Arab',logo:'assets/logos/raam.webp',bibi:'Maybe',positions:{security:'Yes',inquiry:'Neutral',judicial:'Neutral',arab:'Yes',charedi:'Neutral'}}
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

const state = {selected:new Set(),sector:'All',stage:'welcome'};
const app = document.getElementById('app');

function initials(name){
  return name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase();
}
function sectorColour(name){return (sectors.find(s=>s.name===name)||sectors[0]).colour}
function selectedParties(){return parties.filter(p=>state.selected.has(p.id))}
function totalSeats(){return selectedParties().reduce((n,p)=>n+p.seats,0)}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function render(){
  if(state.stage==='welcome') return renderWelcome();
  renderGame();
}

function renderWelcome(){
  app.innerHTML=`<div class="app"><div class="shell">
    <section class="hero">
      <div class="eyebrow">Interactive Israel democracy activity</div>
      <h1>Coalition Builder</h1>
      <p>Can you form Israel's next government? Build a coalition of at least 61 seats, test the parties against five policy questions, then face one final political reality.</p>
      <button class="primary" id="start">Start the challenge</button>
    </section>
    <div class="footerNote">This prototype uses the polling scenario and policy positions supplied for the workshop.</div>
  </div></div>`;
  document.getElementById('start').addEventListener('click',()=>{state.stage='build';render()});
}

function renderGame(){
  const total=totalSeats();
  const count=state.selected.size;
  const progress=Math.min(100,(total/61)*100);
  const filtered=state.sector==='All'?parties:parties.filter(p=>p.sector===state.sector);
  app.innerHTML=`<div class="app"><div class="shell">
    <div class="topbar"><div class="brand"><div class="brandMark">61</div><div>Coalition Builder</div></div><button class="ghost" id="resetTop">Reset</button></div>
    <div class="metrics">
      <div class="metric"><div class="metricLabel">Coalition seats</div><div class="metricValue">${total}</div></div>
      <div class="metric"><div class="metricLabel">Target</div><div class="metricValue">61</div></div>
      <div class="metric"><div class="metricLabel">Parties selected</div><div class="metricValue">${count}</div></div>
    </div>
    <div class="progressWrap"><div class="progressHead"><span>Progress to a majority</span><span>${total} / 61</span></div><div class="progress"><div class="progressFill" style="width:${progress}%"></div></div></div>
    <div class="sectionHead"><div><h2>Explore the political sectors</h2><p>Filter by sector, then invite parties into your coalition.</p></div></div>
    <div class="sectorGrid">${sectors.map(s=>`<button class="sectorTile ${state.sector===s.name?'active':''}" data-sector="${esc(s.name)}" style="background:${s.colour}"><span class="sectorIcon">${s.icon}</span><span class="sectorName">${esc(s.name)}</span></button>`).join('')}</div>
    <div class="sectionHead"><div><h2>${state.sector==='All'?'All parties':esc(state.sector)}</h2><p>${filtered.length} ${filtered.length===1?'party':'parties'} in view</p></div></div>
    <div class="partyGrid">${filtered.map(p=>partyCard(p)).join('')}</div>
    ${coalitionPanel(total)}
    ${policyPanel(total)}
    ${revealPanel()}
    <div class="footerNote">Each participant can run this page independently in their own browser. No login is required.</div>
  </div></div>`;
  bindGameEvents();
}

function partyCard(p){
  const selected=state.selected.has(p.id);
  const photo=p.photo?`<img class="leaderPhoto" src="${p.photo}" alt="${esc(p.leader)}">`:`<div class="avatar">${initials(p.leader)}</div>`;
  return `<article class="partyCard ${selected?'selected':''}">
    <div class="partyTop"><div class="partyLogoWrap"><img class="partyLogo" src="${p.logo}" alt="${esc(p.name)} logo"></div>${photo}<div class="partyInfo"><div class="partyName">${esc(p.name)}</div><div class="leader">${esc(p.leader)}</div></div></div>
    <div><span class="seatPill">${p.seats} seats</span></div>
    <div class="partyFooter"><span class="sectorPill" style="background:${sectorColour(p.sector)}">${esc(p.sector)}</span><button class="selectBtn" data-party="${p.id}">${selected?'Remove':'Invite to coalition'}</button></div>
  </article>`;
}

function coalitionPanel(total){
  const chosen=selectedParties();
  const rows=chosen.length?chosen.map(p=>`<div class="coalitionRow"><span>${esc(p.name)}</span><strong>${p.seats}</strong></div>`).join(''):`<div class="empty">No parties selected yet.</div>`;
  const status=total>=61?`<div class="callout success"><h2>You have reached a majority</h2><p>Your coalition has ${total} seats. Numbers alone are not enough. Now check whether the parties agree on the major issues.</p><button class="secondary" id="checkPolicy">Check policy compatibility</button></div>`:'';
  return `<section class="coalitionBox"><h2>Your coalition</h2><div class="coalitionRows">${rows}</div></section>${status}`;
}

function policyPanel(total){
  if(state.stage!=='policy' && state.stage!=='reveal') return '';
  if(total<61) return '';
  const chosen=selectedParties();
  const issues=Object.keys(issueLabels);
  const summary=issues.map(k=>{
    const vals=chosen.map(p=>p.positions[k]);
    const yes=vals.filter(v=>v==='Yes').length,no=vals.filter(v=>v==='No').length,neutral=vals.filter(v=>v==='Neutral').length;
    return `<div class="issueCard"><div class="issueName">${issueLabels[k]}</div><div class="issueCounts">${yes} support · ${no} oppose · ${neutral} neutral</div></div>`;
  }).join('');
  const table=`<div style="overflow:auto"><table class="policyTable"><thead><tr><th>Party</th>${issues.map(k=>`<th>${issueLabels[k]}</th>`).join('')}</tr></thead><tbody>${chosen.map(p=>`<tr><td><strong>${esc(p.name)}</strong></td>${issues.map(k=>`<td class="status${p.positions[k]}">${p.positions[k]}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const next=state.stage==='policy'?`<div class="callout warn"><h2>Could these parties compromise?</h2><p>Coalition government often requires parties to live with policy differences. If you think these disagreements could be negotiated, continue to the final test.</p><button class="secondary" id="showReveal">Continue to final test</button></div>`:'';
  return `<section id="policySection" class="callout"><h2>Policy compatibility</h2><p>These are the positions supplied for the workshop. Green means support, red means opposition and blue means neutral.</p><div class="issueSummary">${summary}</div>${table}</section>${next}`;
}

function revealPanel(){
  if(state.stage!=='reveal') return '';
  const chosen=selectedParties();
  const yes=chosen.filter(p=>p.bibi==='Yes');
  const no=chosen.filter(p=>p.bibi==='No');
  const maybe=chosen.filter(p=>p.bibi==='Maybe');
  const yesSeats=yes.reduce((n,p)=>n+p.seats,0), maybeSeats=maybe.reduce((n,p)=>n+p.seats,0), noSeats=no.reduce((n,p)=>n+p.seats,0);
  const cards=chosen.map(p=>`<div class="revealCard"><strong>${esc(p.name)}</strong><div class="leader">${esc(p.leader)}</div><div class="stance ${p.bibi==='Yes'?'yesTxt':p.bibi==='No'?'noTxt':'maybeTxt'}">${p.bibi==='Yes'?'Would sit with Netanyahu':p.bibi==='No'?'Would not sit with Netanyahu':'Position uncertain or negotiable'}</div></div>`).join('');
  const verdict=yesSeats>=61?`Your coalition still contains at least 61 seats from parties marked as willing to serve under Netanyahu.`:`Your coalition does not contain 61 confirmed seats from parties marked as willing to serve under Netanyahu. The policy puzzle has become a political leadership puzzle.`;
  return `<section id="revealSection"><div class="revealIntro"><div class="eyebrow">One final factor</div><h2>Will every party sit in a Netanyahu led coalition?</h2><p>Policy agreement is not always enough. Some parties may refuse to serve under Benjamin Netanyahu even where there is substantial policy overlap.</p></div><div class="revealGrid">${cards}</div><div class="revealMetrics"><div class="metric"><div class="metricLabel">Confirmed yes</div><div class="metricValue">${yesSeats}</div></div><div class="metric"><div class="metricLabel">Maybe</div><div class="metricValue">${maybeSeats}</div></div><div class="metric"><div class="metricLabel">Refuse</div><div class="metricValue">${noSeats}</div></div></div><div class="callout danger"><h2>What happened?</h2><p>${verdict}</p><button class="secondary" id="rebuild">Rebuild the coalition</button></div></section>`;
}

function bindGameEvents(){
  document.getElementById('resetTop').addEventListener('click',resetGame);
  document.querySelectorAll('[data-sector]').forEach(b=>b.addEventListener('click',()=>{state.sector=b.dataset.sector;render()}));
  document.querySelectorAll('[data-party]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.party;
    state.selected.has(id)?state.selected.delete(id):state.selected.add(id);
    if(totalSeats()<61) state.stage='build';
    render();
  }));
  const check=document.getElementById('checkPolicy'); if(check) check.addEventListener('click',()=>{state.stage='policy';render();setTimeout(()=>document.getElementById('policySection')?.scrollIntoView({behavior:'smooth'}),50)});
  const reveal=document.getElementById('showReveal'); if(reveal) reveal.addEventListener('click',()=>{state.stage='reveal';render();setTimeout(()=>document.getElementById('revealSection')?.scrollIntoView({behavior:'smooth'}),50)});
  const rebuild=document.getElementById('rebuild'); if(rebuild) rebuild.addEventListener('click',()=>{state.stage='build';render();window.scrollTo({top:0,behavior:'smooth'})});
}

function resetGame(){state.selected.clear();state.sector='All';state.stage='build';render();window.scrollTo({top:0,behavior:'smooth'})}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service_worker.js').catch(()=>{}))}
render();
