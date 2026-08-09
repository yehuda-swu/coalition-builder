
const {parties,sectors,issues,majority} = window.GAME_DATA;

const state = {
  selected:new Set(),
  sector:"All",
  stage:"welcome",
  mode:null,
  policyDecisions:{},
  classStep:"build"
};

const app=document.getElementById("app");

function chosen(){return parties.filter(p=>state.selected.has(p.id))}
function totalSeats(){return chosen().reduce((n,p)=>n+p.seats,0)}
function sectorColour(name){return (sectors.find(s=>s.name===name)||sectors[0]).colour}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function analyseIssue(key){
  const c=chosen();

  // Joint Arab List is an automatic coalition dealbreaker.
  // If it is selected, the Arab party participation issue must fail immediately
  // and no compromise or concession option should ever be shown.
  if(key==="arab" && c.some(p=>p.id==="joint_arab_list")){
    const joint=c.find(p=>p.id==="joint_arab_list");
    return {
      key,
      support:[joint],
      oppose:c.filter(p=>p.id!=="joint_arab_list"),
      flexible:[],
      supportRed:[joint],
      opposeRed:[],
      category:"Red line conflict",
      explanation:"Joint Arab List will not join any governing coalition. This is an automatic dealbreaker and cannot be resolved through compromise."
    };
  }

  // If no Arab party is selected, this issue is not triggered.
  if(key==="arab"){
    const selectedArab=c.filter(p=>p.sector==="Arab");
    if(selectedArab.length===0){
      return {
        key,
        support:[],
        oppose:[],
        flexible:c,
        supportRed:[],
        opposeRed:[],
        category:"Compatible",
        explanation:"No non Zionist Arab party is included in this coalition, so this issue is not currently triggered."
      };
    }
  }

  const support=c.filter(p=>p.positions[key].stance==="Support");
  const oppose=c.filter(p=>p.positions[key].stance==="Oppose");
  const flexible=c.filter(p=>p.positions[key].stance==="Flexible");

  const supportAbsolute=support.filter(p=>p.positions[key].strength==="Absolute Red Line");
  const opposeAbsolute=oppose.filter(p=>p.positions[key].strength==="Absolute Red Line");
  const supportRed=support.filter(p=>["Red line","Red Line"].includes(p.positions[key].strength));
  const opposeRed=oppose.filter(p=>["Red line","Red Line"].includes(p.positions[key].strength));

  let category="Compatible";
  let explanation="There is no direct support and opposition clash on this issue.";

  if(support.length&&oppose.length){
    if((supportAbsolute.length&&oppose.length)||(opposeAbsolute.length&&support.length)){
      category="Red line conflict";
      explanation="The coalition contains an absolute position that directly conflicts with another party. This cannot be solved through compromise.";
    }else if(supportRed.length&&opposeRed.length){
      category="Red line conflict";
      explanation="Both sides contain a stated red line. This issue cannot be solved through compromise.";
    }else if(supportRed.length||opposeRed.length){
      category="Concession required";
      explanation="One side treats this issue as a red line. The flexible side would have to concede.";
    }else{
      category="Negotiable";
      explanation="The parties disagree, but neither side treats the issue as an absolute condition.";
    }
  }

  return {
    key,support,oppose,flexible,
    supportRed:[...supportRed,...supportAbsolute],
    opposeRed:[...opposeRed,...opposeAbsolute],
    category,explanation
  };
}

function policyAnalysis(){return Object.keys(issues).map(analyseIssue)}
function hardPolicyConflicts(){return policyAnalysis().filter(i=>i.category==="Red line conflict")}
function unresolvedNegotiations(){return policyAnalysis().filter(i=>(i.category==="Negotiable"||i.category==="Concession required")&&!state.policyDecisions[i.key])}
function failedNegotiations(){return policyAnalysis().filter(i=>state.policyDecisions[i.key]==="fail")}


function coalitionEligibilityConflicts(){
  return chosen()
    .filter(p=>p.coalitionEligible===false)
    .map(p=>({
      party:p,
      reason:p.coalitionEligibilityReason || `${p.name} will not join a governing coalition.`
    }));
}

function relationshipConflicts(){
  const c=chosen();
  const byId=Object.fromEntries(c.map(p=>[p.id,p]));
  const found=[],seen=new Set();
  c.forEach(p=>(p.veto||[]).forEach(otherId=>{
    if(byId[otherId]){
      const pair=[p.id,otherId].sort().join("|");
      if(!seen.has(pair)){
        seen.add(pair);
        found.push({a:p,b:byId[otherId]});
      }
    }
  }));
  return found;
}
function leadershipAnalysis(){
  const c=chosen();
  const requires=c.filter(p=>p.leadership==="Requires Netanyahu");
  const refuses=c.filter(p=>p.leadership==="Refuses Netanyahu");
  const flexible=c.filter(p=>p.leadership==="Flexible");
  const conflict=requires.length>0&&refuses.length>0;
  let route="Leadership remains open";
  if(requires.length&&!refuses.length) route="Netanyahu led coalition possible";
  if(refuses.length&&!requires.length) route="Non Netanyahu coalition possible";
  return {requires,refuses,flexible,conflict,route};
}
function coalitionReport(){
  const total=totalSeats(),eligibility=coalitionEligibilityConflicts(),relationships=relationshipConflicts(),hardPolicies=hardPolicyConflicts(),failed=failedNegotiations(),leadership=leadershipAnalysis();
  const reasons=[];
  if(total<majority) reasons.push(`The coalition has only ${total} seats and needs at least ${majority}.`);
  eligibility.forEach(x=>reasons.push(`${x.party.name}: ${x.reason}`));
  relationships.forEach(x=>reasons.push(`${x.a.name} and ${x.b.name} have an absolute coalition veto in this scenario.`));
  hardPolicies.forEach(i=>reasons.push(`${issues[i.key]} contains opposing red lines.`));
  failed.forEach(i=>reasons.push(`${issues[i.key]} was marked as a deal breaker.`));
  if(leadership.conflict) reasons.push("Some parties require Netanyahu while others refuse to serve under him.");
  return {total,eligibility,relationships,hardPolicies,failed,leadership,success:total>=majority&&eligibility.length===0&&relationships.length===0&&hardPolicies.length===0&&failed.length===0&&!leadership.conflict,reasons};
}

function render(){
  if(state.stage==="welcome") return renderWelcome();
  if(state.stage==="report") return renderReport();
  if(state.mode==="classroom") return renderClassroom();
  if(state.mode==="workshop") return renderWorkshop();
  return renderIndividual();
}

function renderWelcome(){
  app.innerHTML=`
  <section class="posterWelcome">
    <div class="modeChooser">
      <img src="assets/branding/welcome.webp" alt="61 Build the Coalition welcome artwork" class="welcomePoster">
      <div class="modePanel">
        <h2>How would you like to play?</h2>
        <div class="modeButtons">
          <button class="modeBtn" id="individualMode"><strong>Individual Mode</strong><span>Students play independently on their own devices.</span></button>
          <button class="modeBtn" id="classroomMode"><strong>Classroom Mode</strong><span>One teacher controls the game while one class discusses each decision together.</span></button>
          <button class="modeBtn" id="workshopMode"><strong>Workshop Mode</strong><span>Designed for halls, assemblies and large groups. The audience votes and the facilitator records the choice.</span></button>
        </div>
      </div>
    </div>
  </section>`;
  document.getElementById("individualMode").addEventListener("click",()=>{state.mode="individual";state.stage="build";render();});
  document.getElementById("classroomMode").addEventListener("click",()=>{state.mode="classroom";state.stage="build";state.classStep="build";render();});
  document.getElementById("workshopMode").addEventListener("click",()=>{state.mode="workshop";state.stage="build";state.classStep="build";render();});
}

function commonTopbar(label){
  return `<header class="topbar">
    <div class="brand">
      <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK">
      <div class="brandText"><span>61: Build the Coalition</span><small>${label}</small></div>
    </div>
    <div class="topActions">
      <button class="ghost" id="switchModeBtn">Change mode</button>
      <button class="ghost" id="resetBtn">Reset</button>
    </div>
  </header>`;
}

function renderIndividual(){
  const total=totalSeats(),filtered=state.sector==="All"?parties:parties.filter(p=>p.sector===state.sector),progress=Math.min(100,total/majority*100);
  app.innerHTML=`<div class="app"><div class="shell">
    ${commonTopbar("Individual Mode")}
    ${dashboard(total,progress)}
    ${relationshipAlert()}
    <section><div class="sectionHead"><div><h2>Political sectors</h2><p>Explore the parties and invite them into your coalition.</p></div></div>${sectorButtons()}</section>
    <section><div class="sectionHead"><div><h2>${state.sector==="All"?"All parties":esc(state.sector)}</h2><p>${filtered.length} ${filtered.length===1?"party":"parties"} in view</p></div></div><div class="partyGrid">${filtered.map(p=>partyCard(p)).join("")}</div></section>
    ${coalitionPanel()}
    ${state.classStep==="policy"?policyPanel(false):""}
    ${state.classStep==="relationships"?individualRelationshipStage():""}
    ${state.classStep==="leadership"?leadershipPanel(false):""}
    <div class="footerNote">Educational simulation using the agreed polling scenario and coalition rules.</div>
  </div>${stickyCoalition()}</div>`;
  bindSharedEvents();
}

function renderClassroom(){
  const total=totalSeats(),progress=Math.min(100,total/majority*100);
  app.innerHTML=`<div class="app classroomApp"><div class="shell classroomShell">
    ${commonTopbar("Classroom Mode")}
    ${classroomStageHeader()}
    ${dashboard(total,progress)}
    ${state.classStep==="build"?classroomBuildStage():""}
    ${state.classStep==="policy"?classroomPolicyStage():""}
    ${state.classStep==="relationships"?classroomRelationshipStage():""}
    ${state.classStep==="leadership"?classroomLeadershipStage():""}
  </div></div>`;
  bindSharedEvents();
}


function renderWorkshop(){
  const total=totalSeats(),progress=Math.min(100,total/majority*100);
  app.innerHTML=`<div class="app workshopApp"><div class="shell workshopShell">
    ${commonTopbar("Workshop Mode")}
    ${workshopStageHeader()}
    ${dashboard(total,progress)}
    ${state.classStep==="build"?workshopBuildStage():""}
    ${state.classStep==="policy"?workshopPolicyStage():""}
    ${state.classStep==="relationships"?workshopRelationshipStage():""}
    ${state.classStep==="leadership"?workshopLeadershipStage():""}
  </div></div>`;
  bindSharedEvents();
}

function workshopStageHeader(){
  const map={
    build:["Audience Challenge","Build a majority","Ask the audience which party should join next. Record the winning choice on screen."],
    policy:["Audience Negotiation","Can they compromise?","Invite arguments from the room, then record the audience decision."],
    relationships:["Coalition Reality Check","Will these parties actually govern together?","Reveal party to party vetoes only after the audience has built and negotiated the coalition."],
    leadership:["Final Reveal","Who can lead the government?","Reveal each party's Netanyahu position and see whether the coalition survives."]
  };
  const [k,t,d]=map[state.classStep];
  return `<section class="workshopStageHeader"><div class="stageLabel">${k}</div><h1>${t}</h1><p>${d}</p><div class="audiencePrompt">AUDIENCE VOTE</div></section>`;
}

function workshopBuildStage(){
  const total=totalSeats();
  return `
    <section class="workshopPartyBoard">
      ${parties.map(p=>workshopPartyTile(p)).join("")}
    </section>
    <section class="workshopCoalitionBanner">
      <div><span>Current coalition</span><strong>${chosen().length?chosen().map(p=>esc(p.name)).join(" · "):"No parties selected yet"}</strong></div>
      <div class="workshopScore">${total}<small>/ ${majority}</small></div>
    </section>
    ${total>=majority?`<div class="classAction"><button class="secondary hugeBtn" id="classPolicyStart">Put this coalition to the test</button></div>`:""}`;
}

function workshopPartyTile(p){
  const selected=state.selected.has(p.id);
  return `<button class="workshopPartyTile ${selected?"selected":""}" data-party="${p.id}" style="--sector:${sectorColour(p.sector)}">
    <div class="workshopSeat">${p.seats}</div>
    <img src="${p.photo}" alt="${esc(p.leader)}">
    <div><strong>${esc(p.name)}</strong><span>${esc(p.leader)}</span></div>
  </button>`;
}

function workshopPolicyStage(){
  const hard=hardPolicyConflicts();
  return `
    ${hard.length?`<div class="redLineAlert"><div class="redLineIcon">!</div><div><strong>${hard.length} automatic red line conflict${hard.length===1?"":"s"}</strong><span>No audience vote can override an opposing red line. Change the coalition.</span></div></div>`:""}
    <section class="workshopIssueBoard">${policyAnalysis().map(workshopIssueBlock).join("")}</section>
    <div class="classAction">
      ${hard.length?`<button class="dangerBtn hugeBtn" id="classBackBuild">Change coalition</button>`:
      `<button class="secondary hugeBtn" id="classLeadershipStart" ${unresolvedNegotiations().length?'disabled style="opacity:.45;cursor:not-allowed"':""}>Continue to party relationships</button>`}
    </div>`;
}

function workshopIssueBlock(i){
  const decision=state.policyDecisions[i.key];
  const positions=[
    ...i.support.map(p=>`${p.name}: SUPPORTS${(p.positions[i.key].strength==="Red line"||p.positions[i.key].strength==="Red Line")?" · RED LINE":p.positions[i.key].strength==="Absolute Red Line"?" · ABSOLUTE":""}`),
    ...i.oppose.map(p=>`${p.name}: OPPOSES${(p.positions[i.key].strength==="Red line"||p.positions[i.key].strength==="Red Line")?" · RED LINE":p.positions[i.key].strength==="Absolute Red Line"?" · ABSOLUTE":""}`),
    ...i.flexible.map(p=>`${p.name}: FLEXIBLE`)
  ];
  let controls="";
  if(i.category==="Negotiable"||i.category==="Concession required"){
    controls=`<div class="workshopVoteControls">
      <div class="workshopVoteQuestion">${i.category==="Concession required"?"Will the flexible side concede?":"Can they compromise?"}</div>
      <button class="choiceBtn workshopVoteBtn ${decision==="compromise"?"activeGood":""}" data-policy="${i.key}" data-decision="compromise">YES</button>
      <button class="choiceBtn workshopVoteBtn ${decision==="fail"?"activeBad":""}" data-policy="${i.key}" data-decision="fail">NO</button>
    </div>`;
  }else if(i.category==="Red line conflict"){
    controls=`<div class="hardStop"><strong>RED LINE</strong><span>This disagreement cannot be settled by an audience vote.</span></div>`;

  return `<article class="workshopIssueCard ${i.category==="Red line conflict"?"hard":""}">
    <div class="issueTop"><div><div class="issueName">${issues[i.key]}</div><div class="issueExplanation">${esc(i.explanation)}</div></div><span class="issueStatus">${i.category}</span></div>
    <div class="workshopPositions">${positions.map(x=>`<span>${esc(x)}</span>`).join("")}</div>${controls}
  </article>`;
}

function workshopLeadershipStage(){
  const a=leadershipAnalysis();
  return `
    <section class="workshopLeadershipHero">
      <div class="audiencePrompt lightPrompt">FINAL REVEAL</div>
      <h2>Can this coalition agree on Netanyahu?</h2>
      <p>A fully anti Netanyahu coalition can still form a government. A Netanyahu coalition can also succeed. The agreement collapses only when the coalition contains incompatible leadership commitments.</p>
    </section>
    <div class="workshopLeadershipGrid">
      ${chosen().map(p=>`<div class="workshopLeaderCard"><img src="${p.photo}" alt="${esc(p.leader)}"><strong>${esc(p.name)}</strong><span>${esc(p.leadership)}</span></div>`).join("")}
    </div>
    <div class="classAction"><button class="${a.conflict?"dangerBtn":"secondary"} hugeBtn" id="classFinish">${a.conflict?"Reveal coalition collapse":"Reveal result"}</button></div>`;
}

function classroomStageHeader(){
  const map={
    build:["Stage One","Build a majority","Choose parties together until the class reaches at least 61 seats."],
    policy:["Stage Two","Negotiate the policy differences","Discuss each issue as a class and decide what the parties would do."],
    relationships:["Stage Three","Test the party relationships","Now reveal whether any selected parties have ruled out governing together."],
    leadership:["Final Stage","Resolve the leadership question","Can these parties agree on Benjamin Netanyahu?"]
  };
  const [k,t,d]=map[state.classStep];
  return `<section class="classStageHeader"><div class="stageLabel">${k}</div><h1>${t}</h1><p>${d}</p></section>`;
}

function classroomBuildStage(){
  const total=totalSeats();
  return `
  ${relationshipAlert()}
  <section class="classPartySection">
    <div class="classPartyGrid">${parties.map(p=>classPartyTile(p)).join("")}</div>
  </section>
  <section class="classCoalitionPanel">
    <div><h2>Current coalition</h2><p>${chosen().length?chosen().map(p=>esc(p.name)).join(" · "):"No parties selected yet"}</p></div>
    <strong>${total} / ${majority}</strong>
  </section>
  ${total>=majority?`<div class="classAction"><button class="secondary hugeBtn" id="classPolicyStart">Begin negotiations</button></div>`:""}`;
}

function classroomPolicyStage(){
  const hard=hardPolicyConflicts();
  const analyses=policyAnalysis();
  return `
  ${hard.length?`<div class="redLineAlert"><div class="redLineIcon">!</div><div><strong>${hard.length} red line conflict${hard.length===1?"":"s"} detected</strong><span>The class must change the coalition before continuing.</span></div></div>`:""}
  <section class="classIssueBoard">${analyses.map(classIssueBlock).join("")}</section>
  <div class="classAction">
    ${hard.length?`<button class="dangerBtn hugeBtn" id="classBackBuild">Change coalition</button>`:
    `<button class="secondary hugeBtn" id="classLeadershipStart" ${unresolvedNegotiations().length?'disabled style="opacity:.45;cursor:not-allowed"':""}>Continue to party relationships</button>`}
  </div>`;
}

function classIssueBlock(i){
  const decision=state.policyDecisions[i.key];
  const selectedNames=[...i.support.map(p=>`${p.name}: supports${(p.positions[i.key].strength==="Red line"||p.positions[i.key].strength==="Red Line")?" · RED LINE":p.positions[i.key].strength==="Absolute Red Line"?" · ABSOLUTE":""}`),...i.oppose.map(p=>`${p.name}: opposes${(p.positions[i.key].strength==="Red line"||p.positions[i.key].strength==="Red Line")?" · RED LINE":p.positions[i.key].strength==="Absolute Red Line"?" · ABSOLUTE":""}`),...i.flexible.map(p=>`${p.name}: flexible`)];
  let controls="";
  if(i.category==="Negotiable"||i.category==="Concession required"){
    controls=`<div class="classDecisionButtons">
      <button class="choiceBtn largeChoice ${decision==="compromise"?"activeGood":""}" data-policy="${i.key}" data-decision="compromise">${i.category==="Concession required"?"Flexible side concedes":"Compromise reached"}</button>
      <button class="choiceBtn largeChoice ${decision==="fail"?"activeBad":""}" data-policy="${i.key}" data-decision="fail">Deal breaker</button>
    </div>`;
  } else if(i.category==="Red line conflict"){
    controls=`<div class="hardStop"><strong>No compromise available</strong><span>Opposing red lines are present. The coalition must change.</span></div>`;
  }
  return `<article class="classIssueCard ${i.category==="Red line conflict"?"hard":""}">
    <div class="issueTop"><div><div class="issueName">${issues[i.key]}</div><div class="issueExplanation">${esc(i.explanation)}</div></div><span class="issueStatus">${i.category}</span></div>
    <div class="classPositions">${selectedNames.map(x=>`<span>${esc(x)}</span>`).join("")}</div>${controls}
  </article>`;
}


function classroomRelationshipStage(){
  const eligibility=coalitionEligibilityConflicts();
  const conflicts=relationshipConflicts();
  const blocked=eligibility.length>0 || conflicts.length>0;
  return `
    <section class="relationshipReveal">
      <div class="stageLabel">Stage Three</div>
      <h2>Party relationship check</h2>
      <p>You have already built a majority and tested the policy positions. Now reveal whether the selected parties can actually enter the same governing coalition.</p>
    </section>

    ${eligibility.length?`<div class="coalitionEligibilityBoard">
      ${eligibility.map(x=>`<div class="coalitionEligibilityCard">
        <div class="eligibilityStamp">COALITION PARTICIPATION RED LINE</div>
        <h3>${esc(x.party.name)}</h3>
        <p>${esc(x.reason)}</p>
        <strong>Your coalition cannot form with ${esc(x.party.name)} included.</strong>
      </div>`).join("")}
    </div>`:""}

    ${conflicts.length?`<div class="relationshipConflictBoard">
      ${conflicts.map(x=>`<div class="relationshipConflictCard">
        <div class="relationshipVs"><span>${esc(x.a.name)}</span><strong>VS</strong><span>${esc(x.b.name)}</span></div>
        <p>These parties have an absolute coalition veto in this workshop scenario.</p>
      </div>`).join("")}
    </div>`:""}

    ${blocked
      ? `<div class="callout danger"><h2>Coalition cannot currently form</h2><p>One or more hard coalition rules have been triggered. Return to the coalition and find another route to 61.</p><button class="dangerBtn hugeBtn" id="relationshipBackBuild">Return to coalition</button></div>`
      : `<div class="callout success"><h2>Relationship test passed</h2><p>Your selected parties have passed the coalition participation and party relationship tests. You can now reveal the leadership question.</p><button class="secondary hugeBtn" id="relationshipContinue">Continue to leadership</button></div>`
    }`;
}

function workshopRelationshipStage(){
  const eligibility=coalitionEligibilityConflicts();
  const conflicts=relationshipConflicts();
  const blocked=eligibility.length>0 || conflicts.length>0;
  return `
    <section class="workshopLeadershipHero">
      <div class="audiencePrompt lightPrompt">COALITION REALITY CHECK</div>
      <h2>Will these parties actually govern together?</h2>
      <p>The audience has already built a majority and negotiated the policy issues. Now reveal hard coalition participation rules and direct party vetoes.</p>
    </section>

    ${eligibility.length?`<div class="coalitionEligibilityBoard workshopEligibility">
      ${eligibility.map(x=>`<div class="coalitionEligibilityCard">
        <div class="eligibilityStamp">COALITION PARTICIPATION RED LINE</div>
        <h3>${esc(x.party.name)}</h3>
        <p>${esc(x.reason)}</p>
        <strong>This coalition cannot form while ${esc(x.party.name)} remains included.</strong>
      </div>`).join("")}
    </div>`:""}

    ${conflicts.length?`<div class="workshopConflictGrid">
      ${conflicts.map(x=>`<div class="workshopConflictCard">
        <div class="workshopConflictNames"><strong>${esc(x.a.name)}</strong><span>will not sit with</span><strong>${esc(x.b.name)}</strong></div>
      </div>`).join("")}
    </div>`:""}

    ${blocked
      ? `<div class="classAction"><button class="dangerBtn hugeBtn" id="relationshipBackBuild">Audience must rebuild the coalition</button></div>`
      : `<div class="callout success"><h2>Coalition relationship test passed</h2><p>No hard coalition participation rule or direct party veto has been triggered.</p></div>
         <div class="classAction"><button class="secondary hugeBtn" id="relationshipContinue">Continue to final reveal</button></div>`
    }`;
}

function classroomLeadershipStage(){
  const a=leadershipAnalysis();
  return `
  <section class="classLeadershipHero">
    <h2>Can these parties agree on Netanyahu?</h2>
    <p>A coalition can be Netanyahu led or non Netanyahu. The problem is a direct clash between parties that require him and parties that refuse to serve under him.</p>
  </section>
  <div class="classLeadershipGrid">${chosen().map(p=>`<div class="classLeaderCard"><img src="${p.photo}" alt="${esc(p.leader)}"><div><strong>${esc(p.name)}</strong><span>${esc(p.leadership)}</span></div></div>`).join("")}</div>
  <div class="classAction"><button class="${a.conflict?"dangerBtn":"secondary"} hugeBtn" id="classFinish">${a.conflict?"Show why it fails":"Show coalition result"}</button></div>`;
}

function dashboard(total,progress){
  return `<section><div class="majorityPanel"><div class="majorityCopy"><div class="eyebrow">Your coalition</div><div class="bigSeatCount"><span>${total}</span><small>/ ${majority}</small></div><p>${total>=majority?"Majority reached. Now test whether the agreement can survive.":`${majority-total} more seats needed for a majority.`}</p></div>${knessetVisual()}</div><div class="progressWrap"><div class="progressHead"><span>Progress to a majority</span><span>${total} / ${majority}</span></div><div class="progress"><div class="progressFill" style="width:${progress}%"></div></div></div></section>`;
}
function relationshipAlert(){
  const r=relationshipConflicts();
  return r.length?`<div class="redLineAlert"><div class="redLineIcon">!</div><div><strong>Party relationship veto detected</strong><span>${r.map(x=>`${esc(x.a.name)} and ${esc(x.b.name)}`).join(", ")} cannot govern together in this scenario.</span></div></div>`:"";
}
function sectorButtons(){return `<div class="sectorGrid">${sectors.map(s=>`<button class="sectorTile ${state.sector===s.name?"active":""}" style="--sector:${s.colour}" data-sector="${esc(s.name)}"><span class="sectorIcon">${s.icon}</span><span class="sectorName">${esc(s.name)}</span></button>`).join("")}</div>`}
function partyCard(p){
  const selected=state.selected.has(p.id);
  return `<article class="partyCard ${selected?"selected":""}" style="--sector:${sectorColour(p.sector)}"><div class="cardMedia"><img class="leaderPhoto" src="${p.photo}" alt="${esc(p.leader)}"><div class="partyLogoWrap"><img class="partyLogo" src="${p.logo}" alt="${esc(p.name)} logo"></div><div class="seatBadge">${p.seats}<span>seats</span></div></div><div class="partyBody"><div class="partyName">${esc(p.name)}</div><div class="leader">${esc(p.leader)}</div><span class="sectorPill" style="background:${sectorColour(p.sector)}">${esc(p.sector)}</span><button class="selectBtn" data-party="${p.id}">${selected?"Remove from coalition":"Invite to coalition"}</button></div></article>`;
}
function classPartyTile(p){
  const selected=state.selected.has(p.id);
  return `<button class="classPartyTile ${selected?"selected":""}" data-party="${p.id}" style="--sector:${sectorColour(p.sector)}">
    <img src="${p.photo}" alt="${esc(p.leader)}">
    <div class="classPartyText"><strong>${esc(p.name)}</strong><span>${esc(p.leader)}</span></div>
    <div class="classSeatCount">${p.seats}</div>
  </button>`;
}
function coalitionPanel(){
  const total=totalSeats(),rows=chosen().length?chosen().map(p=>`<div class="coalitionRow"><span><i style="background:${sectorColour(p.sector)}"></i>${esc(p.name)}</span><strong>${p.seats}</strong></div>`).join(""):`<div class="empty">No parties selected yet.</div>`;
  const action=total>=majority&&state.classStep==="build"?`<div class="callout success"><h2>Majority reached</h2><p>You have ${total} seats. Now test the coalition against policy red lines.</p><button class="secondary" id="policyStart">Begin policy negotiations</button></div>`:"";
  return `<section class="coalitionBox"><div class="sectionHead"><div><h2>Your coalition</h2><p>Selected parties and seats</p></div></div>${rows}</section>${action}`;
}
function policyPanel(){
  const hard=hardPolicyConflicts();
  return `<section class="analysisSection" id="policySection">
    <div class="stageLabel">Stage two</div>
    <h2>Policy negotiations</h2>
    <p class="analysisIntro">Some disagreements are negotiable. Opposing red lines are not.</p>

    ${hard.length?`<div class="redLineAlert">
      <div class="redLineIcon">!</div>
      <div>
        <strong>${hard.length} policy red line conflict${hard.length===1?"":"s"}</strong>
        <span>You must change the coalition before continuing.</span>
      </div>
    </div>`:""}

    <div class="issueStack">${policyAnalysis().map(i=>classIssueBlock(i)).join("")}</div>

    <div class="callout ${hard.length?"danger":"warn"}">
      <h2>${hard.length?"Coalition blocked by red lines":"Ready to continue?"}</h2>
      <p>${hard.length?"Remove or replace a party to resolve the automatic red line conflict.":"Resolve every negotiable disagreement before moving to the party relationship check."}</p>
      ${hard.length
        ? `<button class="dangerBtn" id="returnBuild">Return to coalition</button>`
        : `<button class="secondary" id="continueRelationships" ${unresolvedNegotiations().length?'disabled style="opacity:.45;cursor:not-allowed"':""}>Continue to party relationships</button>`
      }
    </div>
  </section>`;
}

function leadershipPanel(){return classroomLeadershipStage()}

function individualRelationshipStage(){
  const eligibility=coalitionEligibilityConflicts();
  const conflicts=relationshipConflicts();
  const blocked=eligibility.length>0 || conflicts.length>0;
  return `<section class="analysisSection" id="relationshipSection">
    <div class="stageLabel">Stage three</div>
    <h2>Party relationship check</h2>
    <p class="analysisIntro">Only now do you discover whether every selected party can actually enter the governing coalition.</p>

    ${eligibility.length?`<div class="coalitionEligibilityBoard">
      ${eligibility.map(x=>`<div class="coalitionEligibilityCard">
        <div class="eligibilityStamp">COALITION PARTICIPATION RED LINE</div>
        <h3>${esc(x.party.name)}</h3>
        <p>${esc(x.reason)}</p>
        <strong>Your coalition cannot form with ${esc(x.party.name)} included.</strong>
      </div>`).join("")}
    </div>`:""}

    ${conflicts.length?`<div class="relationshipConflictBoard">
      ${conflicts.map(x=>`<div class="relationshipConflictCard">
        <div class="relationshipVs"><span>${esc(x.a.name)}</span><strong>VS</strong><span>${esc(x.b.name)}</span></div>
        <p>These parties have an absolute coalition veto in this scenario.</p>
      </div>`).join("")}
    </div>`:""}

    ${blocked
      ? `<div class="callout danger"><h2>Your coalition has hit a hard rule</h2><p>Return to coalition building and find another route to 61.</p><button class="dangerBtn" id="relationshipBackBuild">Return to coalition</button></div>`
      : `<div class="callout success"><h2>Relationship test passed</h2><p>All selected parties can proceed to the leadership stage.</p><button class="secondary" id="relationshipContinue">Continue to leadership</button></div>`
    }
  </section>`;
}

function stickyCoalition(){
  const total=totalSeats(),c=chosen(),chips=c.slice(0,5).map(p=>`<span class="coalitionChip" style="--sector:${sectorColour(p.sector)}">${esc(p.name)}</span>`).join("");
  return `<div class="stickyCoalition"><div class="stickyInner"><div><div class="stickyLabel">Current coalition</div><div class="coalitionChips">${chips||'<span class="coalitionEmpty">Choose your first party</span>'}${c.length>5?`<span class="coalitionMore">+${c.length-5}</span>`:""}</div></div><div class="stickyScore ${total>=majority?"reached":""}"><strong>${total}</strong><span>/ ${majority}</span></div></div></div>`;
}
function knessetVisual(){
  const colours=[];chosen().forEach(p=>{for(let i=0;i<p.seats;i++) colours.push(sectorColour(p.sector));});
  const seats=[],rows=[24,22,20,18,16,12,8],radii=[172,151,130,109,88,67,46],cx=210,cy=196;
  rows.forEach((count,row)=>{const start=Math.PI*1.08,end=Math.PI*1.92,r=radii[row];for(let i=0;i<count;i++){const t=count===1?.5:i/(count-1),a=start+(end-start)*t,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;seats.push(`<circle class="kSeat" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.2" fill="${colours[seats.length]||"#dce5ed"}"></circle>`);}});
  return `<div class="knessetWrap"><svg viewBox="0 0 420 215"><path d="M35 195 Q210 15 385 195" fill="none" stroke="#d8e3ec" stroke-width="1.5"></path>${seats.join("")}<line x1="210" y1="198" x2="210" y2="172" stroke="#c99a2e" stroke-width="3"></line><text x="210" y="211" text-anchor="middle" class="majorityMarker">${majority}</text></svg><div class="knessetCaption">120 seat Knesset</div></div>`;
}

function renderReport(){
  const r=coalitionReport(),c=chosen(),compromises=policyAnalysis().filter(i=>state.policyDecisions[i.key]==="compromise").length;
  app.innerHTML=`<section class="outcomeScreen"><div class="outcomeCard ${r.success?"success":"failure"}">
    <img src="assets/branding/swu_uk_horizontal.webp" alt="StandWithUs UK" style="width:190px;margin-bottom:18px">
    <div class="outcomeIcon">${r.success?"✓":"!"}</div>
    <h1 class="outcomeTitle">${r.success?"You built the coalition":"This coalition is doomed to fail"}</h1>
    <p class="outcomeLead">${r.success?"Your coalition passed the numbers, relationship, policy and leadership tests.":"Your coalition failed one or more tests. The report below explains why."}</p>
    <div class="resultGrid">
      <div class="resultMetric"><strong>${r.total}</strong><span>coalition seats</span></div>
      <div class="resultMetric"><strong>${c.length}</strong><span>parties</span></div>
      <div class="resultMetric"><strong>${compromises}</strong><span>negotiated issues</span></div>
      <div class="resultMetric"><strong>${r.leadership.conflict?"Conflict":"Compatible"}</strong><span>leadership</span></div>
    </div>
    ${!r.success?`<div class="reasonList">${r.reasons.map(x=>`<div>✕ ${esc(x)}</div>`).join("")}</div>`:""}
    <div class="outcomeActions"><button class="secondary" id="adjustBtn">Adjust coalition</button><button class="ghost" id="newGameBtn">Build another coalition</button></div>
  </div></section>`;
  document.getElementById("adjustBtn").addEventListener("click",()=>{state.stage="build";state.classStep="build";render();});
  document.getElementById("newGameBtn").addEventListener("click",resetGame);
}

function bindSharedEvents(){
  document.getElementById("resetBtn").addEventListener("click",resetGame);
  document.getElementById("switchModeBtn").addEventListener("click",()=>{state.stage="welcome";state.mode=null;state.selected.clear();state.policyDecisions={};state.classStep="build";render();});
  document.querySelectorAll("[data-sector]").forEach(b=>b.addEventListener("click",()=>{state.sector=b.dataset.sector;render();}));
  document.querySelectorAll("[data-party]").forEach(b=>b.addEventListener("click",()=>{
    const id=b.dataset.party;state.selected.has(id)?state.selected.delete(id):state.selected.add(id);state.policyDecisions={};render();
  }));
  document.querySelectorAll("[data-policy]").forEach(b=>b.addEventListener("click",()=>{state.policyDecisions[b.dataset.policy]=b.dataset.decision;render();}));

  const ps=document.getElementById("policyStart");
  if(ps) ps.addEventListener("click",()=>{state.classStep="policy";render();});
  const returnBuild=document.getElementById("returnBuild");
  if(returnBuild) returnBuild.addEventListener("click",()=>{state.classStep="build";render();window.scrollTo({top:0,behavior:"smooth"});});
  const continueRelationships=document.getElementById("continueRelationships");
  if(continueRelationships) continueRelationships.addEventListener("click",()=>{
    if(failedNegotiations().length){state.stage="report";render();return;}
    state.classStep="relationships";
    render();
    setTimeout(()=>document.getElementById("relationshipSection")?.scrollIntoView({behavior:"smooth"}),50);
  });
  const cps=document.getElementById("classPolicyStart");
  if(cps) cps.addEventListener("click",()=>{state.classStep="policy";render();});
  const cb=document.getElementById("classBackBuild");
  if(cb) cb.addEventListener("click",()=>{state.classStep="build";render();});
  const relBack=document.getElementById("relationshipBackBuild");
  if(relBack) relBack.addEventListener("click",()=>{state.classStep="build";render();window.scrollTo({top:0,behavior:"smooth"});});
  const relContinue=document.getElementById("relationshipContinue");
  if(relContinue) relContinue.addEventListener("click",()=>{state.classStep="leadership";render();});
  const cls=document.getElementById("classLeadershipStart");
  if(cls) cls.addEventListener("click",()=>{if(failedNegotiations().length){state.stage="report";render();} else {state.classStep="relationships";render();}});
  const cf=document.getElementById("classFinish");
  if(cf) cf.addEventListener("click",()=>{state.stage="report";render();});
}

function resetGame(){
  state.selected.clear();state.sector="All";state.stage="build";state.policyDecisions={};state.classStep="build";render();window.scrollTo({top:0,behavior:"smooth"});
}

if("serviceWorker" in navigator){window.addEventListener("load",()=>navigator.serviceWorker.register("service_worker.js").catch(()=>{}))}
render();
