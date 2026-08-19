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

This version includes:
Channel 12
Channel 13
KAN 11
Israel Hayom
i24NEWS
Channel 14

i24NEWS and Channel 14 are intentionally included.

The current source poll figures were published between 2 and 6 August 2026.
*/

window.ELECTION_UPDATES = {

  pollOfPolls: {
    label: "61 Poll of Polls",
    updated: "19 August 2026",
    methodology: "Equal average of the latest N12, i24NEWS and KAN 11 election polls. Genuine party averages are converted into exactly 120 whole seats using the largest remainder method.",
    sources: [
      {
        id: "channel12",
        name: "N12 / Channel 12",
        pollster: "Midgam",
        date: "19 August 2026",
        seats: {
          likud: 22,
          yashar: 24,
          byachad: 15,
          democrats: 11,
          yisrael_beitenu: 10,
          shas: 7,
          otzma_yehudit: 8,
          utj: 8,
          joint_arab_list: 5,
          raam: 5,
          hatzionut_hadati: 5
        }
      },
      {
        id: "i24",
        name: "i24NEWS",
        pollster: "Direct Polls",
        date: "6 August 2026",
        seats: {
          likud: 28,
          yashar: 23,
          byachad: 7,
          democrats: 10,
          yisrael_beitenu: 9,
          shas: 8,
          otzma_yehudit: 8,
          utj: 9,
          joint_arab_list: 8,
          raam: 5,
          hatzionut_hadati: 5
        }
      },
      {
        id: "kan11",
        name: "KAN 11",
        pollster: "Kantar",
        date: "17 August 2026",
        seats: {
          likud: 23,
          yashar: 23,
          byachad: 14,
          democrats: 10,
          yisrael_beitenu: 10,
          shas: 7,
          otzma_yehudit: 10,
          utj: 8,
          joint_arab_list: 6,
          raam: 5,
          hatzionut_hadati: 4
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
    raam: true
  },

  preferredPM: {
    date: "10 August 2026",
    source: "KAN News",
    comparisons: [
      {
        left: "Benjamin Netanyahu",
        leftValue: 41,
        right: "Gadi Eisenkot",
        rightValue: 34
      },
      {
        left: "Benjamin Netanyahu",
        leftValue: 41,
        right: "Naftali Bennett",
        rightValue: 31
      },
      {
        left: "Gadi Eisenkot",
        leftValue: 31,
        right: "Naftali Bennett",
        rightValue: 20
      }
    ]
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
  // Give every party the whole number below its genuine average.
  const allocations = playable.map(party => {
    const average = rawAverage[party.id];
    const floorSeats = Math.floor(average);

    return {
      id: party.id,
      average,
      floorSeats,
      remainder: average - floorSeats,
      finalSeats: floorSeats
    };
  });

  let allocated = allocations.reduce(
    (sum, item) => sum + item.floorSeats,
    0
  );

  // Step 3
  // If fewer than 120 seats have been allocated, give the remaining seats
  // to the parties with the largest decimal remainders.
  if(allocated < 120){
    const seatsToAdd = 120 - allocated;

    const order = [...allocations].sort((a,b) => {
      if(b.remainder !== a.remainder){
        return b.remainder - a.remainder;
      }

      // Stable tie breaker: higher raw average first.
      if(b.average !== a.average){
        return b.average - a.average;
      }

      return a.id.localeCompare(b.id);
    });

    for(let i=0; i<seatsToAdd; i++){
      order[i % order.length].finalSeats += 1;
    }
  }

  // Step 4
  // If the floor values themselves somehow exceed 120, remove seats from
  // the smallest remainders first until the chamber is exactly 120.
  if(allocated > 120){
    let seatsToRemove = allocated - 120;

    const order = [...allocations].sort((a,b) => {
      if(a.remainder !== b.remainder){
        return a.remainder - b.remainder;
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
  game.electionMeta.dataVersion = "4.7";

  game.electionMeta.seatPoll = {
    label: pop.label,
    date: pop.updated,
    source: sources.map(source => source.name).join(", "),
    note: "Seat projections use the genuine arithmetic mean from the included polls, then allocate the final whole seats using the largest remainder method so the Knesset totals exactly 120 seats.",
    sourceCount: sources.length
  };

  game.electionMeta.preferredPM = {
    label: "Preferred Prime Minister polling",
    date: updates.preferredPM.date,
    source: updates.preferredPM.source,
    note: "These are separate head to head questions rather than one combined vote.",
    comparisons: updates.preferredPM.comparisons
  };

  game.electionMeta.pollOfPollsDetail = {
    sources,
    rawAverage,
    finalSeats: finalById,
    allocationMethod: "Largest remainder method"
  };

})();
