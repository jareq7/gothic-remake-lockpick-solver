// Does the app get LEFT and RIGHT right? Built exactly around the user's chest:
// plate 4 pulls pin 1 the OPPOSITE way, and pin 1 sits at the right-hand edge.
// If any sign is flipped anywhere — probe, links, solver, or the step instructions —
// this must blow up, because the simulated game refuses illegal moves like the real one.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };

// hole indices are 0..6 => hole 7 on screen is index 6 (far right)
const C = {
  n: 5,
  //        pin1 pin2 pin3 pin4 pin5     <- effect of moving this plate RIGHT (→)
  E: [ [ 1,  0,  0,  0,  1],    // plate 1
       [ 0,  1,  0,  0,  0],    // plate 2
       [ 0,  0,  1,  0,  0],    // plate 3
       [-1,  0,  0,  1,  0],    // plate 4: → moves ITS pin right, pin 1 the OTHER way
       [ 0,  0,  0,  0,  1] ],  // plate 5
  pins: [6, 0, 1, 1, 2],        // pin 1 parked at the far-right hole, like yours
};

const { byId } = boot();
const ok = discover(byId, C);
check("rozpoznanie przechodzi", ok === true);

// 1. Did the app WRITE DOWN the opposite pull correctly?
const plate4 = byId.get("linkList").children[3].innerHTML;
check("płytka 4: zapisana jako ciągnąca zapadkę 1 W PRZECIWNĄ stronę",
      plate4.includes("zapadkę <b>1</b>") && plate4.includes("w przeciwną"), plate4);
check("i płytka 1: zapadkę 5 w tę samą",
      byId.get("linkList").children[0].innerHTML.includes("w tę samą stronę"),
      byId.get("linkList").children[0].innerHTML);

// 2. Walk the whole sequence against a game that GRINDS on an illegal move, exactly like
//    the real one. Any left/right inversion shows up here as an impossible move.
const lock = C.pins.slice();
let g = 0, ground = null;
while (!byId.get("stepDone").disabled && g++ < 400) {
  const plate = parseInt(byId.get("nowPlate").textContent.replace(/\D/g, ""), 10) - 1;
  const caps = byId.get("nowKeys").children;
  const dir = caps[0].textContent === "→" ? 1 : -1;
  const word = byId.get("nowCount").innerHTML;

  // the words must agree with the arrow — no "→" labelled "w lewo"
  if ((dir === 1 && !word.includes("w prawo")) || (dir === -1 && !word.includes("w lewo"))) {
    ground = `instrukcja kłóci się ze strzałką: ${caps[0].textContent} / ${word}`;
    break;
  }

  for (let k = 0; k < caps.length; k++) {
    const next = lock.map((v, j) => v + dir * C.E[plate][j]);
    const bad = next.findIndex(v => v < 0 || v > 6);
    if (bad >= 0) {
      ground = `ZGRZYT: płytka ${plate+1} ${dir===1?"→":"←"} wypycha zapadkę ${bad+1} poza krawędź`;
      break;
    }
    for (let j = 0; j < C.n; j++) lock[j] = next[j];
  }
  if (ground) break;
  byId.get("stepDone").click();
}

check("żaden krok nie zgrzyta w grze", ground === null, ground || "");
check("zamek faktycznie się otwiera", JSON.stringify(lock) === JSON.stringify([3,3,3,3,3]),
      JSON.stringify(lock));

// 3. The first step in particular must not be the impossible one you hit.
const { byId: b2 } = boot();
discover(b2, C);
const firstPlate = parseInt(b2.get("nowPlate").textContent.replace(/\D/g,""),10) - 1;
const firstDir = b2.get("nowKeys").children[0].textContent === "→" ? 1 : -1;
const after = C.pins.map((v,j) => v + firstDir * C.E[firstPlate][j]);
check("pierwszy krok jest wykonalny przy zapadce 1 na krawędzi",
      after.every(v => v >= 0 && v <= 6),
      `płytka ${firstPlate+1} ${firstDir===1?"→":"←"} => ${after}`);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
