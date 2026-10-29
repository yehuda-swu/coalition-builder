/*
61: BUILD THE COALITION
ELECTION UPDATE

CURRENT COUNT SNAPSHOT

This update replaces the election night exit poll seat allocation with the
latest provisional count available on 29 October 2026.

Approximately 94.4% of votes have been counted. Counting is still ongoing.

This is not the final result.
*/

window.ELECTION_UPDATES = {

  pollOfPolls: {
    mode: "current_count",
    label: "Current Seat Count",
    updated: "29 October 2026, 11:09:16 AM",
    methodology: "Current count snapshot with approximately 94.4% of votes counted. No averaging or seat redistribution is applied because the reported seats already total 120.",
    notice: "Updated: October 29, 2026, at 11:09:16 AM. Approximately 94.4% of votes counted. Counting is still ongoing. This is not the final result.",
    displayOrder: ["likud","yashar","byachad","joint_arab_list","democrats","raam","yisrael_beitenu","otzma_yehudit","utj","shas","hatzionut_hadati"],
    headlinePartyIds: ["likud","yashar","byachad"],
    failedThreshold: ["Amcha Yisrael","Reservists-Economic","The Haredi Public"],
    failedThresholdPartyIds: ["amcha_yisrael","reservists_economic","haredi_public"],
    sources: [
      {
        id: "current_count",
        shortName: "Count",
        name: "Current vote count",
        pollster: "Current count snapshot",
        date: "29 October 2026, 11:09:16 AM",
        seats: {
          likud:26,
          yashar:21,
          joint_arab_list:11,
          byachad:12,
          democrats:8,
          yisrael_beitenu:7,
          raam:8,
          utj:7,
          otzma_yehudit:7,
          shas:7,
          hatzionut_hadati:6,
          amcha_yisrael:0,
          reservists_economic:0,
          haredi_public:0
        }
      }
    ]
  },

  active: {
    likud: true,
    yashar: true,
    byachad: true,
    democrats: true,
    yisrael_beitenu: true,
    hatzionut_hadati: true,
    otzma_yehudit: true,
    utj: true,
    shas: true,
    joint_arab_list: true,
    raam: true,
    amcha_yisrael: true,
    reservists_economic: true,
    haredi_public: true
  },

  preferredPM: {
    polls: [
      {
        date: "24 October 2026",
        source: "N12 / Midgam",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 44, right: "Benjamin Netanyahu", rightValue: 38, other: "Other or undecided", otherValue: 18 }
        ]
      },
      {
        date: "23 October 2026",
        source: "KAN 11 / Kantar",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 44, right: "Benjamin Netanyahu", rightValue: 38, other: "Other or undecided", otherValue: 18 }
        ]
      },
      {
        date: "23 October 2026",
        source: "Maariv / Lazar",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 49, right: "Benjamin Netanyahu", rightValue: 41, other: "Other or undecided", otherValue: 10 }
        ]
      }
    ],
    note: "Preferred Prime Minister polling. Each poll is shown separately because samples and methodologies differ."
  }
};


/*
DO NOT EDIT BELOW THIS LINE
*/

(function applyElectionUpdates(){

  const updates = window.ELECTION_UPDATES;
  const game = window.GAME_DATA;

  if(!updates || !game) return;

  const pop = updates.pollOfPolls;
  const sources = pop.sources || [];

  const failedThresholdIds = new Set(pop.failedThresholdPartyIds || []);

  game.parties.forEach(party => {
    if(Object.prototype.hasOwnProperty.call(updates.active, party.id)){
      party.active = updates.active[party.id];
    }
    party.failedThreshold = failedThresholdIds.has(party.id);
  });

  const playable = game.parties.filter(p => p.active !== false);

  // Step 1
  // Calculate the genuine arithmetic mean for every playable party.
  const rawAverage = {};

  playable.forEach(party => {
    const values = sources
      .map(source => source.seats?.[party.id])
      .filter(value => typeof value === "number");

    rawAverage[party.id] = values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : party.seats;
  });

  // Step 2
  // Game threshold rule: a party averaging fewer than 4 seats is treated
  // as below the threshold and receives 0 seats.
  const allocations = playable.map(party => {
    const average = rawAverage[party.id];
    const qualifies = average >= 4;
    const floorSeats = qualifies ? Math.floor(average) : 0;

    return {
      id: party.id,
      average,
      qualifies,
      floorSeats,
      remainder: qualifies ? average - floorSeats : 0,
      finalSeats: floorSeats
    };
  });

  let allocated = allocations.reduce(
    (sum, item) => sum + item.floorSeats,
    0
  );

  // Step 3
  // Redistribute the remaining seats only among parties that clear the
  // game's 4-seat threshold, using the largest remainder method.
  if(allocated < 120){
    let seatsToAdd = 120 - allocated;

    const order = allocations
      .filter(item => item.qualifies)
      .sort((a,b) => {
        const remainderDiff = b.remainder - a.remainder;
        if(Math.abs(remainderDiff) > 1e-9){
          return remainderDiff;
        }
        if(b.average !== a.average){
          return b.average - a.average;
        }
        return a.id.localeCompare(b.id);
      });

    let index = 0;
    while(seatsToAdd > 0 && order.length){
      order[index % order.length].finalSeats += 1;
      seatsToAdd -= 1;
      index += 1;
    }
  }

  // Step 4
  // Safety check if rounding ever produces more than 120 seats.
  if(allocated > 120){
    let seatsToRemove = allocated - 120;

    const order = allocations
      .filter(item => item.qualifies)
      .sort((a,b) => {
        const remainderDiff = a.remainder - b.remainder;
        if(Math.abs(remainderDiff) > 1e-9){
          return remainderDiff;
        }
        if(a.average !== b.average){
          return a.average - b.average;
        }
        return a.id.localeCompare(b.id);
      });

    let index = 0;
    while(seatsToRemove > 0 && order.length){
      const item = order[index % order.length];
      if(item.finalSeats > 0){
        item.finalSeats -= 1;
        seatsToRemove -= 1;
      }
      index += 1;
    }
  }

  const finalById = Object.fromEntries(
    allocations.map(item => [item.id, item.finalSeats])
  );

  game.parties.forEach(party => {
    if(finalById[party.id] !== undefined){
      party.seats = finalById[party.id];
    }
  });

  game.electionMeta = game.electionMeta || {};
  game.electionMeta.dataVersion = "6.3";

  game.electionMeta.seatPoll = {
    kind: pop.mode || "polling",
    label: pop.label,
    date: pop.updated,
    source: sources.map(source => source.name).join(", "),
    note: pop.notice || pop.methodology,
    sourceCount: sources.length
  };

  game.electionMeta.preferredPM = {
    label: "Preferred Prime Minister polling",
    polls: updates.preferredPM.polls || [],
    note: updates.preferredPM.note || "These are separate head to head questions rather than one combined vote."
  };

  game.electionMeta.pollOfPollsDetail = {
    mode: pop.mode || "polling",
    sources,
    rawAverage,
    finalSeats: finalById,
    notice: pop.notice || "",
    displayOrder: pop.displayOrder || [],
    headlinePartyIds: pop.headlinePartyIds || [],
    failedThreshold: pop.failedThreshold || [],
    failedThresholdPartyIds: pop.failedThresholdPartyIds || [],
    allocationMethod: pop.mode === "current_count" ? "Current reported seat count" : "Poll average, then largest remainder method"
  };

})();
