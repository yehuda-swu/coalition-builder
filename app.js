
const parties = [
  {
    id:'likud', name:'Likud', leader:'Bibi Netanyahu', seats:23, sector:'Right',
    logo:'assets/logos/likud.webp', photo:'assets/leaders/netanyahu.webp',
    leadership:'Requires Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Oppose',strength:'Flexible'},
      judicial:{stance:'Support',strength:'Flexible'},
      arab:{stance:'Oppose',strength:'Red line'},
      charedi:{stance:'Oppose',strength:'Flexible'}
    }
  },
  {
    id:'yashar', name:'Yashar', leader:'Gadi Eisenkot', seats:24, sector:'Left',
    logo:'assets/logos/yashar.png', photo:'assets/leaders/eisenkot.webp',
    leadership:'Refuses Netanyahu',
    positions:{
      security:{stance:'Flexible',strength:'Flexible'},
      inquiry:{stance:'Support',strength:'Flexible'},
      judicial:{stance:'Oppose',strength:'Flexible'},
      arab:{stance:'Flexible',strength:'Flexible'},
      charedi:{stance:'Support',strength:'Flexible'}
    }
  },
  {
    id:'byachad', name:"B'Yachad", leader:'Naftali Bennett', seats:16, sector:'Right',
    logo:'assets/logos/byachad.webp', photo:'assets/leaders/bennett.webp',
    leadership:'Refuses Netanyahu',
    positions:{
      security:{stance:'Flexible',strength:'Flexible'},
      inquiry:{stance:'Support',strength:'Flexible'},
      judicial:{stance:'Oppose',strength:'Flexible'},
      arab:{stance:'Oppose',strength:'Red line'},
      charedi:{stance:'Support',strength:'Flexible'}
    }
  },
  {
    id:'democrats', name:'The Democrats', leader:'Yair Golan', seats:9, sector:'Far Left',
    logo:'assets/logos/democrats.webp', photo:'assets/leaders/golan.webp',
    leadership:'Refuses Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Support',strength:'Flexible'},
      judicial:{stance:'Oppose',strength:'Flexible'},
      arab:{stance:'Support',strength:'Flexible'},
      charedi:{stance:'Support',strength:'Flexible'}
    }
  },
  {
    id:'yisrael_beitenu', name:'Yisrael Beitenu', leader:'Avigdor Lieberman', seats:11, sector:'Right',
    logo:'assets/logos/yisrael_beitenu.webp', photo:'assets/leaders/lieberman.webp',
    leadership:'Refuses Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Support',strength:'Flexible'},
      judicial:{stance:'Oppose',strength:'Flexible'},
      arab:{stance:'Support',strength:'Flexible'},
      charedi:{stance:'Support',strength:'Red line'}
    }
  },
  {
    id:'hatzionut_hadati', name:'Hatzionut HaDatit', leader:'Bezalel Smotrich', seats:4, sector:'Far Right',
    logo:'assets/logos/hatzionut_hadati.webp', photo:'assets/leaders/smotrich.webp',
    leadership:'Requires Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Oppose',strength:'Flexible'},
      judicial:{stance:'Support',strength:'Flexible'},
      arab:{stance:'Oppose',strength:'Red line'},
      charedi:{stance:'Support',strength:'Flexible'}
    }
  },
  {
    id:'otzma_yehudit', name:'Otzma Yehudit', leader:'Itamar Ben Gvir', seats:8, sector:'Far Right',
    logo:'assets/logos/otzma_yehudit.webp', photo:'assets/leaders/ben_gvir.webp',
    leadership:'Requires Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Oppose',strength:'Flexible'},
      judicial:{stance:'Support',strength:'Flexible'},
      arab:{stance:'Oppose',strength:'Red line'},
      charedi:{stance:'Oppose',strength:'Flexible'}
    }
  },
  {
    id:'utj', name:'UTJ', leader:'Moshe Gafni and Yitzhak Goldknopf', seats:8, sector:'Ultra Orthodox Jewish',
    logo:'assets/logos/utj.webp', photo:'assets/leaders/gafni_goldknopf.webp',
    leadership:'Flexible',
    positions:{
      security:{stance:'Flexible',strength:'Flexible'},
      inquiry:{stance:'Flexible',strength:'Flexible'},
      judicial:{stance:'Flexible',strength:'Flexible'},
      arab:{stance:'Flexible',strength:'Flexible'},
      charedi:{stance:'Oppose',strength:'Red line'}
    }
  },
  {
    id:'shas', name:'Shas', leader:'Arye Deri', seats:7, sector:'Ultra Orthodox Jewish',
    logo:'assets/logos/shas.webp', photo:'assets/leaders/deri.webp',
    leadership:'Flexible',
    positions:{
      security:{stance:'Flexible',strength:'Flexible'},
      inquiry:{stance:'Flexible',strength:'Flexible'},
      judicial:{stance:'Flexible',strength:'Flexible'},
      arab:{stance:'Flexible',strength:'Flexible'},
      charedi:{stance:'Oppose',strength:'Red line'}
    }
  },
  {
    id:'joint_arab_list', name:'Joint Arab List', leader:'Youssef Jabareen', seats:5, sector:'Arab',
    logo:'assets/logos/joint_arab_list.webp', photo:'assets/leaders/jabareen.webp',
    leadership:'Refuses Netanyahu',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Flexible',strength:'Flexible'},
      judicial:{stance:'Flexible',strength:'Flexible'},
      arab:{stance:'Support',strength:'Flexible'},
      charedi:{stance:'Flexible',strength:'Flexible'}
    }
  },
  {
    id:'raam', name:"Ra'am", leader:'Mansour Abbas', seats:5, sector:'Arab',
    logo:'assets/logos/raam.webp', photo:'assets/leaders/abbas.webp',
    leadership:'Flexible',
    positions:{
      security:{stance:'Support',strength:'Flexible'},
      inquiry:{stance:'Flexible',strength:'Flexible'},
      judicial:{stance:'Flexible',strength:'Flexible'},
      arab:{stance:'Support',strength:'Flexible'},
      charedi:{stance:'Flexible',strength:'Flexible'}
    }
  }
];

const sectors = [
  {name:'All',icon:'◉',colour:'#082f5f'},
  {name:'Far Left',icon:'✊',colour:'#d1495b'},
  {name:'Left',icon:'🕊',colour:'#2a9d8f'},
  {name:'Right',icon:'🛡',colour:'#2f5ea8'},
  {name:'Far Right',icon:'⚑',colour:'#e67e22'},
  {name:'Ultra Orthodox Jewish',icon:'🎩',colour:'#7a4fa3'},
  {name:'Arab',icon:'عربي',colour:'#4c956c'}
];

const issueLabels = {
  security:'Security and Palestinian issue',
  inquiry:'October 7 Inquiry',
  judicial:'Judicial Reform',
  arab:'Work with non Zionist Arab parties',
  charedi:'Charedi integration'
};

const state = {
  selected:new Set(),
  sector:'All',
  stage:'welcome',
  policyDecisions:{},
  teacherOpen:false,
  timerMinutes:0,
  timerEnd:null,
  showHints:true
};

const app = document.getElementById('app');
let timerInterval = null;

function sectorColour(name){ return (sectors.find(s=>s.name===name)||sectors[0]).colour; }
function chosen(){ return parties.filter(p=>state.selected.has(p.id)); }
function totalSeats(){ return chosen().reduce((n,p)=>n+p.seats,0); }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function analyseIssue(key){
  const c = chosen();
  const support = c.filter(p=>p.positions[key].stance==='Support');
  const oppose = c.filter(p=>p.positions[key].stance==='Oppose');
  const flexible = c.filter(p=>p.positions[key].stance==='Flexible');

  const supportRed = support.filter(p=>p.positions[key].strength==='Red line');
  const opposeRed = oppose.filter(p=>p.positions[key].strength==='Red line');

  let category = 'Compatible';
  let explanation = 'There is no direct support and opposition clash on this issue.';
  let requiredConcession = null;

  if(support.length && oppose.length){
    if(supportRed.length && opposeRed.length){
      category = 'Red line conflict';
      explanation = 'Both sides contain a stated red line. This issue cannot be resolved through a standard coalition compromise.';
    } else if(supportRed.length || opposeRed.length){
      category = 'Concession required';
      if(supportRed.length){
        requiredConcession = 'Oppose';
        explanation = 'The support side contains a red line. Any party on the opposing side would have to concede on this issue.';
      }else{
        requiredConcession = 'Support';
        explanation = 'The opposition side contains a red line. Any party on the supporting side would have to concede on this issue.';
      }
    }else{
      category = 'Negotiable';
      explanation = 'The coalition contains disagreement, but neither side treats the issue as a red line.';
    }
  }

  return {key,support,oppose,flexible,supportRed,opposeRed,category,explanation,requiredConcession};
}

function getPolicyAnalysis(){
  return Object.keys(issueLabels).map(analyseIssue);
}
function hardPolicyConflicts(){
  return getPolicyAnalysis().filter(i=>i.category==='Red line conflict');
}
function unresolvedNegotiations(){
  return getPolicyAnalysis().filter(i=>
    (i.category==='Negotiable' || i.category==='Concession required') &&
    !state.policyDecisions[i.key]
  );
}
function failedNegotiations(){
  return getPolicyAnalysis().filter(i=>state.policyDecisions[i.key]==='fail');
}
function leadershipAnalysis(){
  const c=chosen();
  const requires=c.filter(p=>p.leadership==='Requires Netanyahu');
  const refuses=c.filter(p=>p.leadership==='Refuses Netanyahu');
  const flexible=c.filter(p=>p.leadership==='Flexible');
  const conflict=requires.length>0 && refuses.length>0;
  let route='Leadership remains open';
  if(requires.length && !refuses.length) route='Netanyahu led coalition possible';
  if(refuses.length && !requires.length) route='Non Netanyahu coalition possible';
  return {requires,refuses,flexible,conflict,route};
}

function render(){
  if(state.stage==='welcome') renderWelcome();
  else if(state.stage==='success') renderOutcome(true);
  else if(state.stage==='failure') renderOutcome(false);
  else renderGame();
}

function renderWelcome(){
  app.innerHTML=`
  <section class="splash">
    <div class="splashInner">
      <img src="assets/branding/swu_uk_horizontal.webp" class="swuLogo" alt="StandWithUs United Kingdom">
      <div class="gameNumber">61</div>
      <div class="gameTitle">Build the Coalition</div>
      <p class="gameSubtitle">Can you negotiate a governing coalition for Israel while balancing numbers, policy and political leadership?</p>
      <div class="welcomeCards">
        <div><strong>1</strong><span>Build a majority of at least 61 seats</span></div>
        <div><strong>2</strong><span>Navigate flexible positions and political red lines</span></div>
        <div><strong>3</strong><span>Resolve the leadership question</span></div>
      </div>
      <button class="primary large" id="startBtn">Start game</button>
    </div>
  </section>`;
  document.getElementById('startBtn').addEventListener('click',()=>{state.stage='build';render();});
}

function renderGame(){
  const total=totalSeats();
  const filtered=state.sector==='All'?parties:parties.filter(p=>p.sector===state.sector);
  const progress=Math.min(100,total/61*100);

  app.innerHTML=`
  <div class="app">
    <div class="shell">
      <header class="topbar">
        <div class="brand">
          <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK">
          <div class="brandText"><span>61: Build the Coalition</span><small>Israel democracy interactive</small></div>
        </div>
        <div class="topActions">
          <span id="timerDisplay" class="timerDisplay"></span>
          <button class="ghost" id="teacherBtn">Teacher</button>
          <button class="ghost" id="resetBtn">Reset</button>
        </div>
      </header>

      <section>
        <div class="majorityPanel">
          <div class="majorityCopy">
            <div class="eyebrow">Your coalition</div>
            <div class="bigSeatCount"><span>${total}</span><small>/ 61</small></div>
            <p>${total>=61?'Majority reached. Now test whether the agreement can survive.':`${61-total} more seats needed for a majority.`}</p>
          </div>
          ${knessetVisual()}
        </div>
        <div class="progressWrap">
          <div class="progressHead"><span>Progress to a majority</span><span>${total} / 61</span></div>
          <div class="progress"><div class="progressFill" style="width:${progress}%"></div></div>
        </div>
      </section>

      <section>
        <div class="sectionHead"><div><h2>Political sectors</h2><p>Explore the parties by sector, then invite them into your coalition.</p></div></div>
        <div class="sectorGrid">
          ${sectors.map(s=>`<button class="sectorTile ${state.sector===s.name?'active':''}" style="--sector:${s.colour}" data-sector="${esc(s.name)}"><span class="sectorIcon">${s.icon}</span><span class="sectorName">${esc(s.name)}</span></button>`).join('')}
        </div>
      </section>

      <section>
        <div class="sectionHead"><div><h2>${state.sector==='All'?'All parties':esc(state.sector)}</h2><p>${filtered.length} ${filtered.length===1?'party':'parties'} in view</p></div></div>
        <div class="partyGrid">${filtered.map(p=>partyCard(p)).join('')}</div>
      </section>

      ${coalitionPanel(total)}
      ${state.stage==='policy'||state.stage==='leadership'?policyPanel():''}
      ${state.stage==='leadership'?leadershipPanel():''}

      <div class="footerNote">Educational simulation using the polling scenario and party positions selected for this workshop.</div>
    </div>
    ${stickyCoalition(total)}
    ${state.teacherOpen?teacherModal():''}
  </div>`;
  bindEvents();
  updateTimerDisplay();
}

function knessetVisual(){
  const colours=[];
  chosen().forEach(p=>{for(let i=0;i<p.seats;i++) colours.push(sectorColour(p.sector));});
  const seats=[];
  const rows=[24,22,20,18,16,12,8], radii=[172,151,130,109,88,67,46], cx=210, cy=196;
  rows.forEach((count,row)=>{
    const start=Math.PI*1.08,end=Math.PI*1.92,r=radii[row];
    for(let i=0;i<count;i++){
      const t=count===1?.5:i/(count-1),a=start+(end-start)*t,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      const fill=colours[seats.length]||'#dce5ed';
      seats.push(`<circle class="kSeat" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.2" fill="${fill}"></circle>`);
    }
  });
  return `<div class="knessetWrap"><svg viewBox="0 0 420 215" role="img" aria-label="${totalSeats()} of 120 Knesset seats selected"><path d="M35 195 Q210 15 385 195" fill="none" stroke="#d8e3ec" stroke-width="1.5"></path>${seats.join('')}<line x1="210" y1="198" x2="210" y2="172" stroke="#c99a2e" stroke-width="3"></line><text x="210" y="211" text-anchor="middle" class="majorityMarker">61</text></svg><div class="knessetCaption">120 seat Knesset</div></div>`;
}

function partyCard(p){
  const selected=state.selected.has(p.id);
  return `<article class="partyCard ${selected?'selected':''}" style="--sector:${sectorColour(p.sector)}">
    <div class="cardMedia"><img class="leaderPhoto" src="${p.photo}" alt="${esc(p.leader)}"><div class="partyLogoWrap"><img class="partyLogo" src="${p.logo}" alt="${esc(p.name)} logo"></div><div class="seatBadge">${p.seats}<span>seats</span></div></div>
    <div class="partyBody"><div class="partyName">${esc(p.name)}</div><div class="leader">${esc(p.leader)}</div><span class="sectorPill" style="background:${sectorColour(p.sector)}">${esc(p.sector)}</span><button class="selectBtn" data-party="${p.id}">${selected?'Remove from coalition':'Invite to coalition'}</button></div>
  </article>`;
}

function coalitionPanel(total){
  const rows=chosen().length?chosen().map(p=>`<div class="coalitionRow"><span><i style="background:${sectorColour(p.sector)}"></i>${esc(p.name)}</span><strong>${p.seats}</strong></div>`).join(''):`<div class="empty">No parties selected yet.</div>`;
  const action=total>=61&&state.stage==='build'?`<div class="callout success"><h2>Majority reached</h2><p>You have ${total} seats. Numbers are only the first hurdle. Now test whether your parties can negotiate their policy differences without crossing a red line.</p><button class="secondary" id="policyStart">Begin policy negotiations</button></div>`:'';
  return `<section class="coalitionBox"><div class="sectionHead"><div><h2>Your coalition</h2><p>Selected parties and seats</p></div></div>${rows}</section>${action}`;
}

function policyPanel(){
  const analysis=getPolicyAnalysis();
  const hard=hardPolicyConflicts();

  return `<section class="analysisSection" id="policySection">
    <div class="stageLabel">Stage two</div>
    <h2>Policy negotiations</h2>
    <p class="analysisIntro">The game now distinguishes between ordinary disagreements, one sided red lines, and direct red line clashes.</p>

    ${hard.length?`<div class="redLineAlert">
      <div class="redLineIcon">!</div>
      <div><strong>${hard.length} automatic red line conflict${hard.length===1?'':'s'}</strong><span>These issues cannot be solved by pressing a compromise button. You will need to change the coalition.</span></div>
    </div>`:''}

    <div class="issueStack">${analysis.map(issueBlock).join('')}</div>

    <div class="callout ${hard.length?'danger':'warn'}">
      <h2>${hard.length?'Coalition blocked by red lines':'Ready to continue?'}</h2>
      <p>${hard.length?'At least one issue contains opposing red lines. Remove or replace a party before this coalition can continue to the leadership stage.':'Every negotiable disagreement must be resolved or marked as a deal breaker before you can continue.'}</p>
      ${hard.length
        ? `<button class="dangerBtn" id="returnBuild">Return to coalition</button>`
        : `<button class="secondary" id="continueLeadership" ${unresolvedNegotiations().length?'disabled style="opacity:.45;cursor:not-allowed"':''}>Continue to leadership</button>`
      }
    </div>
  </section>`;
}

function issueBlock(i){
  const decision=state.policyDecisions[i.key];

  const personChip=(p,label,kind)=>{
    const isRed=p.positions[i.key].strength==='Red line';
    return `<span class="positionChip ${kind} ${isRed?'redLineChip':''}">${esc(p.name)}: ${label}${isRed?' · RED LINE':''}</span>`;
  };

  const chips=[
    ...i.support.map(p=>personChip(p,'supports','support')),
    ...i.oppose.map(p=>personChip(p,'opposes','oppose')),
    ...i.flexible.map(p=>personChip(p,'flexible','flexible'))
  ].join('');

  let controls='';
  if(i.category==='Negotiable'){
    controls=`<div class="negotiationChoice">
      <button class="choiceBtn ${decision==='compromise'?'activeGood':''}" data-policy="${i.key}" data-decision="compromise">Compromise reached</button>
      <button class="choiceBtn ${decision==='fail'?'activeBad':''}" data-policy="${i.key}" data-decision="fail">Deal breaker</button>
    </div>`;
  }else if(i.category==='Concession required'){
    controls=`<div class="concessionBox">
      <strong>One side must concede</strong>
      <span>${esc(i.explanation)}</span>
      <div class="negotiationChoice">
        <button class="choiceBtn ${decision==='concede'?'activeGood':''}" data-policy="${i.key}" data-decision="concede">Flexible side concedes</button>
        <button class="choiceBtn ${decision==='fail'?'activeBad':''}" data-policy="${i.key}" data-decision="fail">Deal breaker</button>
      </div>
    </div>`;
  }else if(i.category==='Red line conflict'){
    controls=`<div class="hardStop"><strong>No standard compromise available</strong><span>Two opposing red lines are present. Change the coalition to continue.</span></div>`;
  }

  const categoryClass=i.category==='Red line conflict'?'hard':i.category==='Concession required'?'concession':i.category==='Negotiable'?'negotiable':'compatible';

  return `<div class="issueNegotiation ${categoryClass}">
    <div class="issueTop">
      <div class="issueName">${issueLabels[i.key]}</div>
      <span class="issueStatus ${categoryClass}">${i.category}</span>
    </div>
    <div class="issueExplanation">${esc(i.explanation)}</div>
    <div class="positionChips">${chips}</div>
    ${controls}
  </div>`;
}

function leadershipPanel(){
  const a=leadershipAnalysis();
  return `<section class="leadershipSection" id="leadershipSection">
    <div class="leadershipHero"><div class="stageLabel" style="color:#9edfff">Final political test</div><h2>Can these parties agree on Benjamin Netanyahu?</h2><p>A coalition does not have to include Netanyahu. A fully anti Netanyahu coalition can still govern if it reaches 61 seats and resolves its policy differences. The problem comes when some coalition partners require Netanyahu while others refuse to serve under him.</p></div>
    <div class="leadershipGrid">
      ${chosen().map(p=>`<div class="leaderRuleCard"><img src="${p.photo}" alt="${esc(p.leader)}"><div><strong>${esc(p.name)}</strong><span>${esc(p.leader)}</span></div><div class="stance ${p.leadership.startsWith('Requires')?'requires':p.leadership.startsWith('Refuses')?'refuses':'flexible'}">${esc(p.leadership)}</div></div>`).join('')}
    </div>
    <div class="leadershipSummary">
      <div class="metric"><div class="metricLabel">Requires Netanyahu</div><div class="metricValue">${a.requires.reduce((n,p)=>n+p.seats,0)}</div></div>
      <div class="metric"><div class="metricLabel">Flexible</div><div class="metricValue">${a.flexible.reduce((n,p)=>n+p.seats,0)}</div></div>
      <div class="metric"><div class="metricLabel">Refuses Netanyahu</div><div class="metricValue">${a.refuses.reduce((n,p)=>n+p.seats,0)}</div></div>
    </div>
    <div class="callout ${a.conflict?'danger':'success'}"><h2>${a.conflict?'Leadership conflict detected':a.route}</h2><p>${a.conflict?'Your coalition contains parties that require Netanyahu and parties that refuse to serve under him. Unless one side abandons its stated position, the coalition agreement cannot hold.':'There is no direct leadership veto inside this coalition. The parties have a viable route to forming a government.'}</p><button class="${a.conflict?'dangerBtn':'secondary'}" id="finishGame">${a.conflict?'See failure result':'Form the government'}</button></div>
  </section>`;
}

function stickyCoalition(total){
  const c=chosen(),chips=c.slice(0,5).map(p=>`<span class="coalitionChip" style="--sector:${sectorColour(p.sector)}">${esc(p.name)}</span>`).join('');
  return `<div class="stickyCoalition"><div class="stickyInner"><div><div class="stickyLabel">Current coalition</div><div class="coalitionChips">${chips||'<span class="coalitionEmpty">Choose your first party</span>'}${c.length>5?`<span class="coalitionMore">+${c.length-5}</span>`:''}</div></div><div class="stickyScore ${total>=61?'reached':''}"><strong>${total}</strong><span>/ 61</span></div></div></div>`;
}

function teacherModal(){
  return `<div class="modalBackdrop" id="modalBackdrop"><div class="modal"><h3>Teacher controls</h3><p>These controls only affect this device.</p><div class="teacherGrid">
    <div class="teacherRow"><span>Hints</span><button class="ghost" id="toggleHints">${state.showHints?'On':'Off'}</button></div>
    <div class="teacherRow"><span>Timer</span><div><button class="ghost timerBtn" data-minutes="0">Off</button> <button class="ghost timerBtn" data-minutes="10">10 min</button> <button class="ghost timerBtn" data-minutes="20">20 min</button></div></div>
    <div class="teacherRow"><span>Reset game</span><button class="dangerBtn" id="teacherReset">Reset</button></div>
    <div class="teacherRow"><span>Close</span><button class="secondary" id="closeTeacher">Done</button></div>
  </div></div></div>`;
}

function bindEvents(){
  document.getElementById('resetBtn').addEventListener('click',resetGame);
  document.getElementById('teacherBtn').addEventListener('click',()=>{state.teacherOpen=true;render();});
  document.querySelectorAll('[data-sector]').forEach(b=>b.addEventListener('click',()=>{state.sector=b.dataset.sector;render();}));
  document.querySelectorAll('[data-party]').forEach(b=>b.addEventListener('click',()=>{
    const id=b.dataset.party;
    state.selected.has(id)?state.selected.delete(id):state.selected.add(id);
    state.policyDecisions={};
    if(totalSeats()<61) state.stage='build';
    render();
  }));

  const ps=document.getElementById('policyStart');
  if(ps) ps.addEventListener('click',()=>{state.stage='policy';render();setTimeout(()=>document.getElementById('policySection')?.scrollIntoView({behavior:'smooth'}),50);});

  document.querySelectorAll('[data-policy]').forEach(b=>b.addEventListener('click',()=>{
    state.policyDecisions[b.dataset.policy]=b.dataset.decision;
    render();
    setTimeout(()=>document.getElementById('policySection')?.scrollIntoView({behavior:'smooth'}),20);
  }));

  const rb=document.getElementById('returnBuild');
  if(rb) rb.addEventListener('click',()=>{state.stage='build';render();window.scrollTo({top:0,behavior:'smooth'});});

  const cl=document.getElementById('continueLeadership');
  if(cl) cl.addEventListener('click',()=>{
    if(failedNegotiations().length){state.stage='failure';render();return;}
    state.stage='leadership';render();setTimeout(()=>document.getElementById('leadershipSection')?.scrollIntoView({behavior:'smooth'}),50);
  });

  const fg=document.getElementById('finishGame');
  if(fg) fg.addEventListener('click',()=>{state.stage=leadershipAnalysis().conflict?'failure':'success';render();});

  if(state.teacherOpen){
    document.getElementById('closeTeacher').addEventListener('click',()=>{state.teacherOpen=false;render();});
    document.getElementById('modalBackdrop').addEventListener('click',e=>{if(e.target.id==='modalBackdrop'){state.teacherOpen=false;render();}});
    document.getElementById('teacherReset').addEventListener('click',resetGame);
    document.getElementById('toggleHints').addEventListener('click',()=>{state.showHints=!state.showHints;render();});
    document.querySelectorAll('.timerBtn').forEach(b=>b.addEventListener('click',()=>{setTimer(Number(b.dataset.minutes));state.teacherOpen=false;render();}));
  }
}

function renderOutcome(success){
  const total=totalSeats(), c=chosen(), a=leadershipAnalysis();
  const failures=failedNegotiations();
  const hard=hardPolicyConflicts();
  const reasons=[];

  if(total<61) reasons.push(`The coalition has only ${total} seats and needs at least 61.`);
  hard.forEach(i=>reasons.push(`${issueLabels[i.key]} contains opposing red lines.`));
  failures.forEach(i=>reasons.push(`${issueLabels[i.key]} was marked as a deal breaker.`));
  if(a.conflict) reasons.push('Some parties require Netanyahu while others refuse to serve under him.');

  const compromises=getPolicyAnalysis().filter(i=>
    (i.category==='Negotiable' && state.policyDecisions[i.key]==='compromise') ||
    (i.category==='Concession required' && state.policyDecisions[i.key]==='concede')
  ).length;

  const leadershipText=a.requires.length&&!a.refuses.length?'Netanyahu led':a.refuses.length&&!a.requires.length?'Non Netanyahu':a.requires.length&&a.refuses.length?'Conflicted':'Open';

  app.innerHTML=`<section class="outcomeScreen"><div class="outcomeCard ${success?'success':'failure'}">
    <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK" style="width:190px;margin-bottom:18px">
    <div class="outcomeIcon">${success?'✓':'!'}</div>
    <h1 class="outcomeTitle">${success?'You built the coalition':'This coalition is doomed to fail'}</h1>
    <p class="outcomeLead">${success?'Your parties have enough seats, survived the policy red line test, negotiated the remaining disagreements, and have a compatible route on political leadership.':'The agreement cannot currently produce a stable government. Review the reasons below and return to negotiations.'}</p>

    <div class="resultGrid">
      <div class="resultMetric"><strong>${total}</strong><span>coalition seats</span></div>
      <div class="resultMetric"><strong>${c.length}</strong><span>parties</span></div>
      <div class="resultMetric"><strong>${compromises}</strong><span>negotiated issues</span></div>
      <div class="resultMetric"><strong>${leadershipText}</strong><span>leadership route</span></div>
    </div>

    ${success
      ? `<div class="headlineCard"><div class="headlineLabel">Coalition agreement reached</div><h3>Government formation appears possible</h3><p>After surviving the policy red line test and resolving the leadership question, your coalition has the parliamentary support needed to form a government.</p></div>`
      : `<div class="headlineCard failureNews"><div class="headlineLabel">Coalition talks collapse</div><h3>Negotiations break down</h3><p>Despite attempts to assemble a majority, an unresolved policy red line or leadership conflict prevents these parties from governing together.</p></div>`
    }

    ${!success?`<div class="reasonList">${reasons.map(r=>`<div>✕ ${esc(r)}</div>`).join('')}</div>`:''}

    <div class="outcomeActions">
      <button class="secondary" id="adjustBtn">Adjust coalition</button>
      <button class="ghost" id="newGameBtn">Build another coalition</button>
    </div>
  </div></section>`;

  document.getElementById('adjustBtn').addEventListener('click',()=>{state.stage='build';render();});
  document.getElementById('newGameBtn').addEventListener('click',resetGame);
}

function resetGame(){
  state.selected.clear(); state.sector='All'; state.stage='build'; state.policyDecisions={}; state.teacherOpen=false; clearTimer(); render(); window.scrollTo({top:0,behavior:'smooth'});
}
function setTimer(minutes){
  clearTimer();
  state.timerMinutes=minutes;
  if(minutes>0){
    state.timerEnd=Date.now()+minutes*60*1000;
    timerInterval=setInterval(updateTimerDisplay,1000);
  }
}
function clearTimer(){ if(timerInterval) clearInterval(timerInterval); timerInterval=null; state.timerMinutes=0; state.timerEnd=null; }
function updateTimerDisplay(){
  const el=document.getElementById('timerDisplay'); if(!el) return;
  if(!state.timerEnd){el.textContent='';return;}
  const left=Math.max(0,state.timerEnd-Date.now());
  const m=Math.floor(left/60000),s=Math.floor((left%60000)/1000);
  el.textContent=`${m}:${String(s).padStart(2,'0')}`;
  if(left<=0){clearTimer();el.textContent='Time';}
}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('service_worker.js').catch(()=>{}));}
render();
