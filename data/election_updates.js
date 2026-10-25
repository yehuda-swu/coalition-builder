/*
61: BUILD THE COALITION
ELECTION UPDATES

Routine polling updates should normally be made in this file only.

THE 61 POLL OF POLLS

Method:
1. Use the latest available poll from each included publisher.
2. Give every included poll equal weight.
3. Average the projected seats for each playable party.
4. Take the whole number below each party's genuine average.
5. Allocate the remaining seats by largest decimal remainder until the Knesset totals exactly 120 seats.

This game Poll of Polls uses the latest available poll from four independent polling sources:
N12 / Channel 12
KAN 11
Channel 16 / 103FM
i24NEWS

The final source polls were published between 22 and 23 October 2026.
*/

window.ELECTION_UPDATES = {

  pollOfPolls: {
    label: "Final pre-election Poll of Polls",
    updated: "25 October 2026",
    methodology: "Equal average of the latest N12 / Midgam, KAN 11 / Kantar, Channel 16 / Maagar Mochot and i24NEWS / Direct Polls election polls. Parties averaging fewer than 4 seats are treated as below the game threshold and removed before the remaining parties are allocated exactly 120 seats using the largest remainder method.",
    sources: [
      {
        id: "channel12", shortName: "N12", name: "N12 / Channel 12", pollster: "Midgam", date: "23 October 2026",
        seats: {likud:21,yashar:23,byachad:15,democrats:10,yisrael_beitenu:8,shas:8,otzma_yehudit:8,utj:7,joint_arab_list:9,raam:5,hatzionut_hadati:6,amcha_yisrael:0,reservists_economic:0,haredi_public:0}
      },
      {
        id: "kan11", shortName: "KAN 11", name: "KAN 11", pollster: "Kantar", date: "23 October 2026",
        seats: {likud:20,yashar:22,byachad:14,democrats:8,yisrael_beitenu:8,shas:7,otzma_yehudit:8,utj:8,joint_arab_list:9,raam:5,hatzionut_hadati:7,amcha_yisrael:0,reservists_economic:4,haredi_public:0}
      },
      {
        id: "channel16", shortName: "Ch. 16", name: "Channel 16 / 103FM", pollster: "Maagar Mochot", date: "22 October 2026",
        seats: {likud:17,yashar:20,byachad:14,democrats:9,yisrael_beitenu:7,shas:7,otzma_yehudit:9,utj:8,joint_arab_list:9,raam:5,hatzionut_hadati:7,amcha_yisrael:4,reservists_economic:4,haredi_public:0}
      },
      {
        id: "i24", shortName: "i24", name: "i24NEWS", pollster: "Direct Polls", date: "23 October 2026",
        seats: {likud:26,yashar:21,byachad:12,democrats:8,yisrael_beitenu:6,shas:8,otzma_yehudit:8,utj:7,joint_arab_list:9,raam:5,hatzionut_hadati:6,amcha_yisrael:4,reservists_economic:0,haredi_public:0}
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

  game.parties.forEach(party => {
    if(Object.prototype.hasOwnProperty.call(updates.active, party.id)){
      party.active = updates.active[party.id];
    }
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
  game.electionMeta.dataVersion = "5.8";

  game.electionMeta.seatPoll = {
    label: pop.label,
    date: pop.updated,
    source: sources.map(source => source.name).join(", "),
    note: "Final pre-election snapshot. Seat projections use the arithmetic mean of four independent polling sources. Parties averaging fewer than 4 seats are treated as below the game threshold, then qualifying parties are allocated exactly 120 seats using the largest remainder method.",
    sourceCount: sources.length
  };

  game.electionMeta.preferredPM = {
    label: "Preferred Prime Minister polling",
    polls: updates.preferredPM.polls || [],
    note: updates.preferredPM.note || "These are separate head to head questions rather than one combined vote."
  };

  game.electionMeta.pollOfPollsDetail = {
    sources,
    rawAverage,
    finalSeats: finalById,
    allocationMethod: "4-seat game threshold, then largest remainder method"
  };

})();
