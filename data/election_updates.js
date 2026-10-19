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

This game Poll of Polls uses the latest available poll from:
N12 / Channel 12
i24NEWS
KAN 11

The current source polls were published between 12 and 18 October 2026.
*/

window.ELECTION_UPDATES = {

  pollOfPolls: {
    label: "61 Poll of Polls",
    updated: "19 October 2026",
    methodology: "Equal average of the latest N12, i24NEWS and KAN 11 election polls. Parties averaging fewer than 4 seats are treated as below the game threshold and removed before the remaining parties are allocated exactly 120 seats using the largest remainder method.",
    sources: [
                  {
        id: "channel12",
        name: "N12 / Channel 12",
        pollster: "Midgam",
        date: "12 October 2026",
        seats: {
          likud: 20,
          yashar: 23,
          byachad: 13,
          democrats: 9,
          yisrael_beitenu: 9,
          shas: 8,
          otzma_yehudit: 8,
          utj: 7,
          joint_arab_list: 8,
          raam: 5,
          hatzionut_hadati: 6,
          amcha_yisrael: 0
        }
      },
                  {
        id: "i24",
        name: "i24NEWS",
        pollster: "Direct Polls",
        date: "18 October 2026",
        seats: {
          likud: 25,
          yashar: 21,
          byachad: 13,
          democrats: 9,
          yisrael_beitenu: 6,
          shas: 8,
          otzma_yehudit: 10,
          utj: 8,
          joint_arab_list: 8,
          raam: 6,
          hatzionut_hadati: 6,
          amcha_yisrael: 0
        }
      },
                  {
        id: "kan11",
        name: "KAN 11",
        pollster: "Kantar",
        date: "18 October 2026",
        seats: {
          likud: 21,
          yashar: 23,
          byachad: 12,
          democrats: 9,
          yisrael_beitenu: 8,
          shas: 8,
          otzma_yehudit: 8,
          utj: 7,
          joint_arab_list: 8,
          raam: 5,
          hatzionut_hadati: 7,
          amcha_yisrael: 0
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
    amcha_yisrael: true
  },

  preferredPM: {
    polls: [
      {
        date: "11 October 2026",
        source: "KAN News / Kantar",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 43, right: "Benjamin Netanyahu", rightValue: 38 }
        ]
      },
      {
        date: "8 October 2026",
        source: "Maariv / Lazar Research",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 46, right: "Benjamin Netanyahu", rightValue: 40 }
        ]
      },
      {
        date: "5 October 2026",
        source: "N12 / Midgam",
        comparisons: [
          { left: "Gadi Eisenkot", leftValue: 41, right: "Benjamin Netanyahu", rightValue: 38 }
        ]
      }
    ],
    note: "Head to head suitability for Prime Minister. Polls use different samples and methodologies and should be read separately."
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
  game.electionMeta.dataVersion = "5.4";

  game.electionMeta.seatPoll = {
    label: pop.label,
    date: pop.updated,
    source: sources.map(source => source.name).join(", "),
    note: "Seat projections use the arithmetic mean of the included polls. Parties averaging fewer than 4 seats are treated as below the game threshold. Their seats are removed before the remaining parties are allocated exactly 120 seats using the largest remainder method.",
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
