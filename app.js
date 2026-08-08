const {parties,sectors,issues,majority} = window.GAME_DATA;

const state = {
  selected:new Set(),
  sector:"All",
  stage:"welcome",
  policyDecisions:{},
  teacherOpen:false
};

const app = document.getElementById("app");

function chosen(){ return parties.filter(p=>state.selected.has(p.id)); }
function totalSeats(){ return chosen().reduce((n,p)=>n+p.seats,0); }
function sectorColour(name){ return (sectors.find(s=>s.name===name)||sectors[0]).colour; }
function esc(s){ return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function analyseIssue(key){
  const c=chosen();
  const support=c.filter(p=>p.positions[key].stance==="Support");
  const oppose=c.filter(p=>p.positions[key].stance==="Oppose");
  const flexible=c.filter(p=>p.positions[key].stance==="Flexible");
  const supportRed=support.filter(p=>p.positions[key].strength==="Red line");
  const opposeRed=oppose.filter(p=>p.positions[key].strength==="Red line");

  let category="Compatible";
  let explanation="There is no direct support and opposition clash on this issue.";

  if(support.length && oppose.length){
    if(supportRed.length && opposeRed.length){
      category="Red line conflict";
      explanation="Both sides contain a stated red line. This issue cannot be resolved through an ordinary coalition compromise.";
    }else if(supportRed.length || opposeRed.length){
      category="Concession required";
      explanation="One side treats this issue as a red line. The flexible side would have to concede.";
    }else{
      category="Negotiable";
      explanation="The parties disagree, but neither side treats the issue as a red line.";
    }
  }
  return {key,support,oppose,flexible,supportRed,opposeRed,category,explanation};
}

function policyAnalysis(){ return Object.keys(issues).map(analyseIssue); }
function hardPolicyConflicts(){ return policyAnalysis().filter(i=>i.category==="Red line conflict"); }
function unresolvedNegotiations(){
  return policyAnalysis().filter(i=>
    (i.category==="Negotiable" || i.category==="Concession required") &&
    !state.policyDecisions[i.key]
  );
}
function failedNegotiations(){ return policyAnalysis().filter(i=>state.policyDecisions[i.key]==="fail"); }

function relationshipConflicts(){
  const c=chosen();
  const byId=Object.fromEntries(c.map(p=>[p.id,p]));
  const found=[];
  const seen=new Set();

  c.forEach(p=>{
    (p.veto||[]).forEach(otherId=>{
      if(byId[otherId]){
        const pair=[p.id,otherId].sort().join("|");
        if(!seen.has(pair)){
          seen.add(pair);
          found.push({a:p,b:byId[otherId]});
        }
      }
    });
  });
  return found;
}

function leadershipAnalysis(){
  const c=chosen();
  const requires=c.filter(p=>p.leadership==="Requires Netanyahu");
  const refuses=c.filter(p=>p.leadership==="Refuses Netanyahu");
  const flexible=c.filter(p=>p.leadership==="Flexible");
  const conflict=requires.length>0 && refuses.length>0;
  let route="Leadership remains open";
  if(requires.length && !refuses.length) route="Netanyahu led coalition possible";
  if(refuses.length && !requires.length) route="Non Netanyahu coalition possible";
  return {requires,refuses,flexible,conflict,route};
}

function coalitionReport(){
  const total=totalSeats();
  const relationships=relationshipConflicts();
  const hardPolicies=hardPolicyConflicts();
  const failed=failedNegotiations();
  const leadership=leadershipAnalysis();

  const reasons=[];
  if(total<majority) reasons.push(`The coalition has only ${total} seats and needs at least ${majority}.`);
  relationships.forEach(x=>reasons.push(`${x.a.name} and ${x.b.name} have an absolute coalition veto in this scenario.`));
  hardPolicies.forEach(i=>reasons.push(`${issues[i.key]} contains opposing red lines.`));
  failed.forEach(i=>reasons.push(`${issues[i.key]} was marked as a deal breaker.`));
  if(leadership.conflict) reasons.push("Some parties require Netanyahu while others refuse to serve under him.");

  return {
    total,
    relationships,
    hardPolicies,
    failed,
    leadership,
    success: total>=majority && relationships.length===0 && hardPolicies.length===0 && failed.length===0 && !leadership.conflict,
    reasons
  };
}

function render(){
  if(state.stage==="welcome") renderWelcome();
  else if(state.stage==="report") renderReport();
  else renderGame();
}

function renderWelcome(){
  app.innerHTML=`
    <section class="posterWelcome">
      <div class="posterStage">
        <img src="assets/branding/welcome.webp" alt="61 Build the Coalition welcome artwork" class="welcomePoster">
        <button class="posterStart" id="startBtn">Start game</button>
      </div>
    </section>`;
  document.getElementById("startBtn").addEventListener("click",()=>{state.stage="build";render();});
}

function renderGame(){
  const total=totalSeats();
  const filtered=state.sector==="All"?parties:parties.filter(p=>p.sector===state.sector);
  const progress=Math.min(100,total/majority*100);
  const relations=relationshipConflicts();

  app.innerHTML=`
    <div class="app">
      <div class="shell">
        <header class="topbar">
          <div class="brand">
            <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK">
            <div class="brandText"><span>61: Build the Coalition</span><small>Israel democracy interactive</small></div>
          </div>
          <button class="ghost" id="resetBtn">Reset</button>
        </header>

        <section>
          <div class="majorityPanel">
            <div class="majorityCopy">
              <div class="eyebrow">Your coalition</div>
              <div class="bigSeatCount"><span>${total}</span><small>/ ${majority}</small></div>
              <p>${total>=majority?"Majority reached. Now test whether the agreement can survive.":`${majority-total} more seats needed for a majority.`}</p>
            </div>
            ${knessetVisual()}
          </div>
          <div class="progressWrap">
            <div class="progressHead"><span>Progress to a majority</span><span>${total} / ${majority}</span></div>
            <div class="progress"><div class="progressFill" style="width:${progress}%"></div></div>
          </div>
        </section>

        ${relations.length?`
          <div class="redLineAlert">
            <div class="redLineIcon">!</div>
            <div><strong>Party relationship veto detected</strong><span>${relations.map(x=>`${esc(x.a.name)} and ${esc(x.b.name)}`).join(", ")} cannot currently govern together in this scenario.</span></div>
          </div>`:""}

        <section>
          <div class="sectionHead"><div><h2>Political sectors</h2><p>Explore the parties and invite them into your coalition.</p></div></div>
          <div class="sectorGrid">
            ${sectors.map(s=>`<button class="sectorTile ${state.sector===s.name?"active":""}" style="--sector:${s.colour}" data-sector="${esc(s.name)}"><span class="sectorIcon">${s.icon}</span><span class="sectorName">${esc(s.name)}</span></button>`).join("")}
          </div>
        </section>

        <section>
          <div class="sectionHead"><div><h2>${state.sector==="All"?"All parties":esc(state.sector)}</h2><p>${filtered.length} ${filtered.length===1?"party":"parties"} in view</p></div></div>
          <div class="partyGrid">${filtered.map(p=>partyCard(p)).join("")}</div>
        </section>

        ${coalitionPanel()}
        ${state.stage==="policy"||state.stage==="leadership"?policyPanel():""}
        ${state.stage==="leadership"?leadershipPanel():""}

        <div class="footerNote">Educational simulation using the agreed polling scenario and coalition rules.</div>
      </div>
      ${stickyCoalition()}
    </div>`;

  bindEvents();
}

function knessetVisual(){
  const colours=[];
  chosen().forEach(p=>{for(let i=0;i<p.seats;i++) colours.push(sectorColour(p.sector));});
  const seats=[];
  const rows=[24,22,20,18,16,12,8],radii=[172,151,130,109,88,67,46],cx=210,cy=196;
  rows.forEach((count,row)=>{
    const start=Math.PI*1.08,end=Math.PI*1.92,r=radii[row];
    for(let i=0;i<count;i++){
      const t=count===1?.5:i/(count-1),a=start+(end-start)*t,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;
      seats.push(`<circle class="kSeat" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.2" fill="${colours[seats.length]||"#dce5ed"}"></circle>`);
    }
  });
  return `<div class="knessetWrap"><svg viewBox="0 0 420 215"><path d="M35 195 Q210 15 385 195" fill="none" stroke="#d8e3ec" stroke-width="1.5"></path>${seats.join("")}<line x1="210" y1="198" x2="210" y2="172" stroke="#c99a2e" stroke-width="3"></line><text x="210" y="211" text-anchor="middle" class="majorityMarker">${majority}</text></svg><div class="knessetCaption">120 seat Knesset</div></div>`;
}

function partyCard(p){
  const selected=state.selected.has(p.id);
  return `<article class="partyCard ${selected?"selected":""}" style="--sector:${sectorColour(p.sector)}">
    <div class="cardMedia"><img class="leaderPhoto" src="${p.photo}" alt="${esc(p.leader)}"><div class="partyLogoWrap"><img class="partyLogo" src="${p.logo}" alt="${esc(p.name)} logo"></div><div class="seatBadge">${p.seats}<span>seats</span></div></div>
    <div class="partyBody"><div class="partyName">${esc(p.name)}</div><div class="leader">${esc(p.leader)}</div><span class="sectorPill" style="background:${sectorColour(p.sector)}">${esc(p.sector)}</span><button class="selectBtn" data-party="${p.id}">${selected?"Remove from coalition":"Invite to coalition"}</button></div>
  </article>`;
}

function coalitionPanel(){
  const total=totalSeats();
  const rows=chosen().length?chosen().map(p=>`<div class="coalitionRow"><span><i style="background:${sectorColour(p.sector)}"></i>${esc(p.name)}</span><strong>${p.seats}</strong></div>`).join(""):`<div class="empty">No parties selected yet.</div>`;
  const action=total>=majority&&state.stage==="build"?`<div class="callout success"><h2>Majority reached</h2><p>You have ${total} seats. Now test the coalition against policy red lines.</p><button class="secondary" id="policyStart">Begin policy negotiations</button></div>`:"";
  return `<section class="coalitionBox"><div class="sectionHead"><div><h2>Your coalition</h2><p>Selected parties and seats</p></div></div>${rows}</section>${action}`;
}

function policyPanel(){
  const analysis=policyAnalysis();
  const hard=hardPolicyConflicts();

  return `<section class="analysisSection" id="policySection">
    <div class="stageLabel">Stage two</div><h2>Policy negotiations</h2>
    <p class="analysisIntro">Some disagreements are negotiable. Opposing red lines are not.</p>

    ${hard.length?`<div class="redLineAlert"><div class="redLineIcon">!</div><div><strong>${hard.length} policy red line conflict${hard.length===1?"":"s"}</strong><span>You must change the coalition before continuing.</span></div></div>`:""}

    <div class="issueStack">${analysis.map(issueBlock).join("")}</div>

    <div class="callout ${hard.length?"danger":"warn"}">
      <h2>${hard.length?"Coalition blocked by red lines":"Ready to continue?"}</h2>
      <p>${hard.length?"Remove or replace a party to resolve the automatic red line conflict.":"Resolve every negotiable disagreement before moving to leadership."}</p>
      ${hard.length?`<button class="dangerBtn" id="returnBuild">Return to coalition</button>`:`<button class="secondary" id="continueLeadership" ${unresolvedNegotiations().length?'disabled style="opacity:.45;cursor:not-allowed"':""}>Continue to leadership</button>`}
    </div>
  </section>`;
}

function issueBlock(i){
  const decision=state.policyDecisions[i.key];
  const chip=(p,label,kind)=>`<span class="positionChip ${kind} ${p.positions[i.key].strength==="Red line"?"redLineChip":""}">${esc(p.name)}: ${label}${p.positions[i.key].strength==="Red line"?" · RED LINE":""}</span>`;
  const chips=[
    ...i.support.map(p=>chip(p,"supports","support")),
    ...i.oppose.map(p=>chip(p,"opposes","oppose")),
    ...i.flexible.map(p=>chip(p,"flexible","flexible"))
  ].join("");

  let controls="";
  if(i.category==="Negotiable"||i.category==="Concession required"){
    controls=`<div class="negotiationChoice">
      <button class="choiceBtn ${decision==="compromise"?"activeGood":""}" data-policy="${i.key}" data-decision="compromise">${i.category==="Concession required"?"Flexible side concedes":"Compromise reached"}</button>
      <button class="choiceBtn ${decision==="fail"?"activeBad":""}" data-policy="${i.key}" data-decision="fail">Deal breaker</button>
    </div>`;
  }
  if(i.category==="Red line conflict") controls=`<div class="hardStop"><strong>No compromise available</strong><span>Opposing red lines are present.</span></div>`;

  return `<div class="issueNegotiation ${i.category==="Red line conflict"?"hard":""}">
    <div class="issueTop"><div class="issueName">${issues[i.key]}</div><span class="issueStatus ${i.category==="Red line conflict"?"hard":""}">${i.category}</span></div>
    <div class="issueExplanation">${esc(i.explanation)}</div>
    <div class="positionChips">${chips}</div>${controls}
  </div>`;
}

function leadershipPanel(){
  const a=leadershipAnalysis();
  return `<section class="leadershipSection" id="leadershipSection">
    <div class="leadershipHero"><div class="stageLabel" style="color:#9edfff">Final political test</div><h2>Can these parties agree on Benjamin Netanyahu?</h2><p>A coalition can be Netanyahu led or non Netanyahu. It fails when selected parties contain an absolute conflict over his leadership.</p></div>
    <div class="leadershipGrid">${chosen().map(p=>`<div class="leaderRuleCard"><img src="${p.photo}" alt="${esc(p.leader)}"><div><strong>${esc(p.name)}</strong><span>${esc(p.leader)}</span></div><div class="stance ${p.leadership.startsWith("Requires")?"requires":p.leadership.startsWith("Refuses")?"refuses":"flexible"}">${esc(p.leadership)}</div></div>`).join("")}</div>
    <div class="callout ${a.conflict?"danger":"success"}"><h2>${a.conflict?"Leadership conflict detected":a.route}</h2><p>${a.conflict?"Some parties require Netanyahu while others refuse to serve under him.":"No direct leadership veto remains."}</p><button class="${a.conflict?"dangerBtn":"secondary"}" id="finishGame">View coalition report</button></div>
  </section>`;
}

function stickyCoalition(){
  const total=totalSeats(),c=chosen(),chips=c.slice(0,5).map(p=>`<span class="coalitionChip" style="--sector:${sectorColour(p.sector)}">${esc(p.name)}</span>`).join("");
  return `<div class="stickyCoalition"><div class="stickyInner"><div><div class="stickyLabel">Current coalition</div><div class="coalitionChips">${chips||'<span class="coalitionEmpty">Choose your first party</span>'}${c.length>5?`<span class="coalitionMore">+${c.length-5}</span>`:""}</div></div><div class="stickyScore ${total>=majority?"reached":""}"><strong>${total}</strong><span>/ ${majority}</span></div></div></div>`;
}

function renderReport(){
  const r=coalitionReport();
  const c=chosen();
  const policy=policyAnalysis();
  const compromises=policy.filter(i=>state.policyDecisions[i.key]==="compromise").length;

  app.innerHTML=`<section class="outcomeScreen"><div class="outcomeCard ${r.success?"success":"failure"}">
    <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK" style="width:190px;margin-bottom:18px">
    <div class="outcomeIcon">${r.success?"✓":"!"}</div>
    <h1 class="outcomeTitle">${r.success?"You built the coalition":"This coalition is doomed to fail"}</h1>
    <p class="outcomeLead">${r.success?"Your coalition passed the numbers, relationship, policy and leadership tests.":"Your coalition failed one or more tests. The report below explains exactly why."}</p>

    <div class="reportGrid">
      ${reportCard("Seats",r.total>=majority,`${r.total} seats`,r.total>=majority?"Majority achieved":`${majority-r.total} seats short`)}
      ${reportCard("Party relationships",r.relationships.length===0,r.relationships.length===0?"Compatible":`${r.relationships.length} veto conflict${r.relationships.length===1?"":"s"}`,r.relationships.length===0?"No absolute party veto detected":"One or more selected parties refuse to govern together")}
      ${reportCard("Policy",r.hardPolicies.length===0 && r.failed.length===0,r.hardPolicies.length===0 && r.failed.length===0?"Passed":`${r.hardPolicies.length+r.failed.length} blocking issue${r.hardPolicies.length+r.failed.length===1?"":"s"}`,`${compromises} negotiated issue${compromises===1?"":"s"}`)}
      ${reportCard("Leadership",!r.leadership.conflict,!r.leadership.conflict?r.leadership.route:"Conflict","Netanyahu question")}
    </div>

    ${r.success?`
      <div class="headlineCard"><div class="headlineLabel">Coalition agreement reached</div><h3>Government formation appears possible</h3><p>Your parties have assembled a majority and passed each coalition test in this educational scenario.</p></div>`
      : `<div class="headlineCard failureNews"><div class="headlineLabel">Coalition talks collapse</div><h3>Negotiations break down</h3><p>A parliamentary majority is not enough when party vetoes, policy red lines or leadership commitments remain unresolved.</p></div>
         <div class="reasonList">${r.reasons.map(x=>`<div>✕ ${esc(x)}</div>`).join("")}</div>`
    }

    <div class="outcomeActions">
      <button class="secondary" id="adjustBtn">Adjust coalition</button>
      <button class="ghost" id="newGameBtn">Build another coalition</button>
    </div>
  </div></section>`;

  document.getElementById("adjustBtn").addEventListener("click",()=>{state.stage="build";render();});
  document.getElementById("newGameBtn").addEventListener("click",resetGame);
}

function reportCard(title,pass,value,note){
  return `<div class="reportCard ${pass?"pass":"fail"}"><div class="reportStatus">${pass?"✓":"✕"}</div><div><span>${esc(title)}</span><strong>${esc(value)}</strong><small>${esc(note)}</small></div></div>`;
}

function bindEvents(){
  document.getElementById("resetBtn").addEventListener("click",resetGame);
  document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>{state.sector=b.dataset.sector;render();}));
  document.querySelectorAll("[data-party]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.party;
    state.selected.has(id)?state.selected.delete(id):state.selected.add(id);
    state.policyDecisions={};
    if(totalSeats()<majority) state.stage="build";
    render();
  }));

  const ps=document.getElementById("policyStart");
  if(ps) ps.addEventListener("click",()=>{
    if(relationshipConflicts().length){state.stage="report";render();return;}
    state.stage="policy";render();
    setTimeout(()=>document.getElementById("policySection")?.scrollIntoView({behavior:"smooth"}),50);
  });

  document.querySelectorAll("[data-policy]").forEach(b=>b.addEventListener("click",()=>{
    state.policyDecisions[b.dataset.policy]=b.dataset.decision;
    render();
    setTimeout(()=>document.getElementById("policySection")?.scrollIntoView({behavior:"smooth"}),30);
  }));

  const rb=document.getElementById("returnBuild");
  if(rb) rb.addEventListener("click",()=>{state.stage="build";render();window.scrollTo({top:0,behavior:"smooth"});});

  const cl=document.getElementById("continueLeadership");
  if(cl) cl.addEventListener("click",()=>{
    if(failedNegotiations().length){state.stage="report";render();return;}
    state.stage="leadership";render();
    setTimeout(()=>document.getElementById("leadershipSection")?.scrollIntoView({behavior:"smooth"}),50);
  });

  const fg=document.getElementById("finishGame");
  if(fg) fg.addEventListener("click",()=>{state.stage="report";render();});
}

function resetGame(){
  state.selected.clear();
  state.sector="All";
  state.stage="build";
  state.policyDecisions={};
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("service_worker.js").catch(()=>{}));
}
render();
