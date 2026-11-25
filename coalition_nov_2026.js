/*
  61: Build the Coalition | Coalition negotiations update
  Snapshot: 25 November 2026, 16:45 London time
  Extension for the existing StandWithUs UK game.

  Key educational distinction:
    A meeting is not a coalition agreement.
    An agreed coalition framework is not a formed government.
    A mathematically possible majority does not guarantee party agreement.

  The election data, all original assets and the existing three game modes
  are preserved. This script runs after the existing app.js script.
*/
(function installCoalitionNegotiations(){
  'use strict';
  if (!window.GAME_DATA || typeof render !== 'function' || typeof state === 'undefined') {
    console.error('Coalition update requires the existing game files.');
    return;
  }

  const RELEASE = '25 November 2026';
  const urls = {
    agreement:'https://www.reuters.com/world/middle-east/israels-eisenkot-clinches-first-coalition-agreement-bid-form-government-2026-11-24/',
    unity:'https://www.timesofisrael.com/bennett-backs-unity-government-under-eisenkot-nixes-netanyahu-as-next-pm-rules-out-defection/',
    haredi:'https://www.timesofisrael.com/no-breakthrough-in-latest-yashar-likud-unity-talks-progress-reported-with-utj/',
    inquiry:'https://www.reuters.com/world/middle-east/israeli-opposition-advances-october-7-attack-probe-opposed-by-netanyahu-2026-11-25/'
  };

  const get = id => parties.find(p => p.id === id);
  const has = id => state.selected.has(id);
  const bothUnity = () => has('yashar') && has('likud');
  const isHarediNegotiation = () => (has('utj') || has('shas')) &&
    (has('yashar') || has('byachad') || has('yisrael_beitenu'));

  state.unityLeadership = null;

  // Liberman has publicly opened talks with Haredi parties and said he can
  // accept painful compromises. These are no longer automatic mutual vetoes.
  // They remain complex negotiations on policy and electoral credibility.
  const lieberman = get('yisrael_beitenu');
  if (lieberman) {
    lieberman.veto = (lieberman.veto || []).filter(id => id !== 'utj' && id !== 'shas');
  }

  // Preserve all other direct vetoes, notably Yashar/Otzma, Democrats/Likud,
  // and the formal coalition exclusion of the Joint Arab List.
  const originalAnalyseIssue = analyseIssue;
  analyseIssue = function(key){
    const result = originalAnalyseIssue(key);
    if (key === 'charedi' && isHarediNegotiation() && result.category === 'Red line conflict') {
      // Not an endorsement of a particular draft law. The negotiation is real;
      // a successful outcome remains a player choice rather than a fact.
      return {
        ...result,
        category:'Negotiable',
        explanation:'Draft exemptions and wider service remain disputed. Negotiations are now taking place despite earlier red lines. A compromise here is hypothetical, not a signed agreement.'
      };
    }
    return result;
  };

  const originalLeadershipAnalysis = leadershipAnalysis;
  leadershipAnalysis = function(){
    const original = originalLeadershipAnalysis();
    if (!bothUnity()) return original;

    // A unity scenario can only be simulated successfully if Likud drops its
    // Netanyahu premiership requirement. Eisenkot has not agreed to be led
    // by Netanyahu, and no such Likud concession is confirmed as of this date.
    const otherRequires = original.requires.filter(p => p.id !== 'likud');
    const hypotheticalDeal = state.unityLeadership === 'eisenkot' &&
      otherRequires.length === 0 && original.refuses.length > 0;

    let route = 'Yashar and Likud are negotiating, but there is no leadership agreement.';
    if (state.unityLeadership === 'eisenkot') {
      route = hypotheticalDeal
        ? 'Hypothetical: Likud accepts Eisenkot as Prime Minister and Netanyahu does not serve in the government.'
        : 'Other selected parties still insist on Netanyahu, so the leadership dispute remains.';
    } else if (state.unityLeadership === 'rotation') {
      route = 'A rotation has been discussed, but the parties have not agreed to one. The route remains blocked.';
    } else if (state.unityLeadership === 'netanyahu') {
      route = 'Yashar and Bennett reject a government headed by Netanyahu.';
    }
    return {...original, conflict: !hypotheticalDeal, route, hypotheticalDeal};
  };

  const originalReport = coalitionReport;
  coalitionReport = function(){
    const report = originalReport();
    if (bothUnity()) {
      report.unityScenario = true;
      report.unityConditional = report.success && state.unityLeadership === 'eisenkot';
      if (!report.leadership.conflict && report.unityConditional) {
        report.unityNote = 'This outcome represents a hypothetical concession by Likud, not a completed unity agreement.';
      } else if (report.leadership.conflict) {
        report.reasons.push('Unity negotiations have not resolved who leads the government. Eisenkot rejects Netanyahu as Prime Minister, while Likud has not accepted Eisenkot as leader.');
      }
    }
    return report;
  };

  const originalStrength = typeof coalitionStrength === 'function' ? coalitionStrength : null;
  if (originalStrength) {
    coalitionStrength = function(){
      const result = originalStrength();
      if (bothUnity() && state.unityLeadership === 'eisenkot') {
        result.score = Math.max(5, result.score - 18);
        result.factors = result.factors || [];
        result.factors.push({points:-18, label:'Unity relies on an unconfirmed major leadership concession from Likud.'});
        if (result.score < 30) {
          result.label = 'EXTREMELY FRAGILE';
          result.message = 'Even if the parties agreed, this unity government would face major political tensions.';
        } else if (result.score < 50) {
          result.label = 'FRAGILE';
          result.message = 'This hypothetical unity government would need difficult compromises to survive.';
        } else if (result.score < 70) {
          result.label = 'TESTED';
          result.message = 'This hypothetical government would face significant political pressure.';
        }
      }
      return result;
    };
  }

  function unityChoices(){
    const options = [
      {id:'eisenkot', title:'Eisenkot leads', desc:'Likud accepts Eisenkot as Prime Minister. Netanyahu stays outside government.', tag:'Hypothetical concession'},
      {id:'rotation', title:'Rotation proposal', desc:'Eisenkot serves first, followed by Netanyahu. No agreement has been reached.', tag:'Still disputed'},
      {id:'netanyahu', title:'Netanyahu leads', desc:'Likud retains the premiership. Yashar and Bennett reject this route.', tag:'Blocked by Yashar'}
    ];
    return `<div class="novChoiceGrid" role="group" aria-label="Unity government leadership options">
      ${options.map(o=>`<button type="button" data-unity-choice="${o.id}" aria-pressed="${state.unityLeadership===o.id}" class="novChoice ${state.unityLeadership===o.id?'isSelected':''}">
        <strong>${o.title}</strong><span>${o.desc}</span><small>${o.tag}</small></button>`).join('')}
    </div>`;
  }

  function newsBoard(){
    // Keep the initial briefing prominent, while later stages stay concise.
    if (state.classStep !== 'build' || state.stage === 'report') {
      return `<div class="novMini" aria-label="Coalition negotiations context"><strong>25 NOVEMBER UPDATE</strong><span>Yashar and Yisrael Beytenu have agreed coalition terms. Unity negotiations with Likud remain unresolved. The Democrats have paused talks, while UTJ discussions continue.</span></div>`;
    }
    const united = bothUnity();
    const withPact = has('yashar') && has('yisrael_beitenu');
    const haredi = has('yashar') && (has('utj') || has('shas'));
    const withDems = has('democrats') && united;

    return `<section class="novBoard" aria-label="Latest coalition negotiations">
      <div class="novTopline"><div><span class="novEyebrow">THE COALITION NEGOTIATIONS</span>
        <h2>Who can form Israel's next government?</h2>
        <p>Based on reported negotiations up to ${RELEASE}. A possible deal is not a confirmed government.</p></div>
        <div class="novDate">UPDATED<br><strong>25 NOV 2026</strong></div></div>
      <div class="novFigures"><div><strong>48</strong><span>Eisenkot's four party bloc</span></div>
        <div><strong>53</strong><span>Netanyahu's previous bloc</span></div>
        <div><strong>61</strong><span>Seats needed for a majority</span></div></div>
      <div class="novStories">
        <div><b>01 &nbsp; FIRST AGREEMENT</b><p>Yashar and Yisrael Beytenu have agreed coalition terms. Lieberman still opposes a Netanyahu premiership.</p></div>
        <div><b>02 &nbsp; UNITY TALKS</b><p>Yashar and Likud are meeting. Bennett backs unity led by Eisenkot, but leadership remains unresolved.</p></div>
        <div><b>03 &nbsp; THE OTHER PATH</b><p>UTJ is discussing conscription terms. Lieberman is now willing to consider compromises with the Charedi parties.</p></div>
        <div><b>04 &nbsp; DEMOCRATS PAUSE</b><p>Yair Golan's Democrats have suspended talks with Yashar over the unity negotiations.</p></div>
      </div>
      ${withPact?'<p class="novSpecific novGood"><strong>Your coalition includes the first agreed partners.</strong> Yashar and Yisrael Beytenu have agreed terms, but the wider coalition is not complete.</p>':''}
      ${haredi?'<p class="novSpecific"><strong>Charedi negotiations:</strong> Draft exemptions and service requirements remain unresolved. You may test a possible compromise during the policy stage.</p>':''}
      ${withDems?'<p class="novSpecific novWarning"><strong>Major obstacle:</strong> The Democrats have suspended talks over the Likud negotiations and oppose joining a Netanyahu unity government.</p>':''}
      ${united?`<div class="novUnity"><div class="novUnityHeading"><div><span class="novEyebrow">UNITY NEGOTIATION CHALLENGE</span><h3>Who becomes Prime Minister?</h3><p>The numbers alone do not settle the leadership dispute. Select a proposal to test the political consequences.</p></div><span class="novSeatLabel">Yashar + Likud<br><strong>48 seats</strong></span></div>
        ${unityChoices()}
        <p class="novOutcome"><strong>Current position:</strong> ${leadershipAnalysis().route} ${state.unityLeadership==='eisenkot'?'This is an educational alternative, not a reported breakthrough.':''}</p>
        <p class="novCaution">Yashar's objections to Ben Gvir remain in place. The original policy negotiations on judicial reform, conscription and the October 7 inquiry still apply.</p>
      </div>`:''}
      <details class="novSources"><summary>Sources and teaching notes</summary>
        <p>This game separates confirmed developments from negotiating positions and hypothetical concessions. The stability score is a teaching device, not a forecast.</p>
        <p><a href="${urls.agreement}" target="_blank" rel="noopener noreferrer">Reuters: first coalition agreement and Democrats' response</a> · <a href="${urls.unity}" target="_blank" rel="noopener noreferrer">The Times of Israel: Bennett and unity</a> · <a href="${urls.haredi}" target="_blank" rel="noopener noreferrer">The Times of Israel: conscription and negotiations</a> · <a href="${urls.inquiry}" target="_blank" rel="noopener noreferrer">Reuters: October 7 inquiry vote</a></p>
      </details>
    </section>`;
  }

  function contextualOutcome(){
    if (state.stage !== 'report' || !bothUnity()) return '';
    const leadership=leadershipAnalysis();
    if (leadership.hypotheticalDeal) {
      return `<aside class="novResultNote"><strong>Important: hypothetical unity agreement</strong><p>The game has accepted a scenario in which Likud makes a major leadership concession. As of ${RELEASE}, no such agreement has been reached. Discuss whether Likud and its voters would accept these terms.</p></aside>`;
    }
    return `<aside class="novResultNote novBlocked"><strong>Unity negotiations remain unresolved</strong><p>The chosen leadership arrangement has not been accepted by the parties. The game reflects the political deadlock, not just the seat arithmetic.</p></aside>`;
  }

  const originalClassLeadership = classroomLeadershipStage;
  classroomLeadershipStage = function(){
    if (!bothUnity()) return originalClassLeadership();
    const a = leadershipAnalysis();
    return `<section class="novLeadershipStage"><span class="novEyebrow">FINAL NEGOTIATION</span><h2>Unity government: who leads?</h2>
      <p>Yashar wants Eisenkot to lead. Likud has not accepted that demand. Try a leadership arrangement before revealing the result.</p>
      ${unityChoices()}
      <p class="novOutcome">${a.route}</p>
      <div class="classAction"><button class="${a.conflict?'dangerBtn':'secondary'} hugeBtn" id="classFinish">${a.conflict?'Reveal why talks fail':'Reveal hypothetical result'}</button></div>
    </section>`;
  };
  const originalWorkshopLeadership = workshopLeadershipStage;
  workshopLeadershipStage = function(){
    if (!bothUnity()) return originalWorkshopLeadership();
    const a=leadershipAnalysis();
    return `<section class="novLeadershipStage novWorkshopLeadership"><span class="novEyebrow">FINAL AUDIENCE VOTE</span>
      <h2>Who should lead a unity government?</h2><p>Ask students to choose the arrangement they believe could win agreement from both parties.</p>
      ${unityChoices()}<p class="novOutcome">${a.route}</p>
      <div class="classAction"><button class="${a.conflict?'dangerBtn':'secondary'} hugeBtn" id="classFinish">${a.conflict?'Reveal deadlock':'Reveal hypothetical result'}</button></div>
    </section>`;
  };

  const originalRender = render;
  render = function(){
    originalRender();
    // The welcome poster is retained exactly as supplied in the existing game.
    if (state.stage === 'welcome') return;
    const shell = document.querySelector('.shell');
    if (!shell) return;
    const top = shell.querySelector('.topbar');
    if (top) top.insertAdjacentHTML('afterend', newsBoard());
    else shell.insertAdjacentHTML('afterbegin', newsBoard());
    if (state.stage === 'report') {
      const outcome = contextualOutcome();
      if (outcome) shell.insertAdjacentHTML('beforeend',outcome);
    }
    document.querySelectorAll('[data-unity-choice]').forEach(button=>{
      button.addEventListener('click',()=>{
        state.unityLeadership = button.getAttribute('data-unity-choice');
        render();
      });
    });
  };

  // Refresh the initial page after adding the new rules and contextual panels.
  render();
})();
