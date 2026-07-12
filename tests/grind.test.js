// Your chest, your numbers. Pins read off your screenshot (0-indexed holes):
//   pin1 = hole 7 (idx 6), pin2 = hole 1 (idx 0), pin3 = hole 2, pin4 = hole 2, pin5 = hole 5
// Recorded links said plate 4 pulls pin 2 "the opposite way". The grind proves it pulls it
// the SAME way — pin 2 was already hard against the left edge and could not go further left.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");
let fails=0;
const check=(l,c,e="")=>{console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++;};

// Links exactly as your app recorded them (from your screenshot), all self-effects "→ = right":
//   1: pulls 5 same
//   2: pulls 1 same, 3 opposite, 5 opposite
//   3: pulls 2 opposite
//   4: pulls 1 same, 2 OPPOSITE   <-- the lie
//   5: pulls 4 opposite
const WRONG_E = [
  [ 1,  0,  0,  0,  1],
  [ 1,  1, -1,  0, -1],
  [ 0, -1,  1,  0,  0],
  [ 1, -1,  0,  1,  0],
  [ 0,  0,  0, -1,  1],
];
// The truth, per the grind: plate 4 pulls pin 2 the SAME way (it shoved it further left).
const TRUE_E = WRONG_E.map(r => r.slice());
TRUE_E[3][1] = 1;

// Your pins: 7, 1, 2, 2, 5  (0-indexed)
const START = [6, 0, 1, 1, 4];

const { byId } = boot({
  "wytrych-locks-v1": JSON.stringify([
    { name: "Brama w piwnicy", n: 5, E: WRONG_E, pos: START.slice() },
  ]),
});
byId.get("savedList").children[0].children[0].click();

check("skrzynia twierdzi, że płytka 4 ciągnie zapadkę 2 w PRZECIWNĄ",
      byId.get("linkList").children[3].innerHTML.includes("w przeciwną"),
      byId.get("linkList").children[3].innerHTML);
check("i pewnie podaje sekwencję", /^Krok 1 z \d+$/.test(byId.get("solveTitle").textContent),
      byId.get("solveTitle").textContent);

// what the app tells you to do first, and what the real game would say to it
const plate = parseInt(byId.get("nowPlate").textContent.replace(/\D/g,""),10) - 1;
const dir = byId.get("nowKeys").children[0].textContent === "→" ? 1 : -1;
const after = START.map((v,j) => v + dir*TRUE_E[plate][j]);
const blocked = after.findIndex(v => v < 0 || v > 6);
console.log(`   [krok 1 wg aplikacji: płytka ${plate+1} ${dir===1?"→":"←"}]`);
check("pierwszy krok jest w grze NIEMOŻLIWY — blokuje go zapadka 2 przy krawędzi",
      blocked === 1, blocked < 0 ? "ruch przechodzi" : `blokuje zapadka ${blocked+1}`);

// you press Zgrzyt, on step 1, from a position we both know for certain
byId.get("grind").click();
check("zgrzyt na kroku 1 jest uznany za twardy dowód",
      !hidden(byId,"solveBad") && byId.get("solveBad").innerHTML.includes("odwrotnym znakiem"),
      byId.get("solveBad").innerHTML);

const cards = byId.get("fixList").children.slice(1);
check("proponuje tropy", cards.length > 0, String(cards.length));

const idx = cards.findIndex(c => {
  const h = c.children[0].innerHTML;
  return h.includes("płytkę 4") && h.includes("zapadkę 2");
});
check("wśród tropów jest DOKŁADNIE ta pomyłka: płytka 4 ↔ zapadka 2", idx >= 0,
      cards.map(c => c.children[0].innerHTML).join("\n      "));
console.log(`   [prawdziwa przyczyna na pozycji ${idx+1} z ${cards.length}]`);

cards[idx].children[1].click();
check("po poprawce płytka 4 ciągnie zapadkę 2 w TĘ SAMĄ stronę",
      byId.get("linkList").children[3].innerHTML.includes("zapadkę <b>2</b>") &&
      /zapadkę <b>2<\/b> <span class="same">/.test(byId.get("linkList").children[3].innerHTML),
      byId.get("linkList").children[3].innerHTML);

// and the corrected sequence must run clean against the real game
const lock = START.slice();
let g=0, ground=null;
while(!byId.get("stepDone").disabled && g++<400){
  const p = parseInt(byId.get("nowPlate").textContent.replace(/\D/g,""),10)-1;
  const caps = byId.get("nowKeys").children;
  const d = caps[0].textContent === "→" ? 1 : -1;
  for(let k=0;k<caps.length;k++){
    const nx = lock.map((v,j)=> v + d*TRUE_E[p][j]);
    const bad = nx.findIndex(v=>v<0||v>6);
    if (bad>=0) { ground = `płytka ${p+1} ${d===1?"→":"←"} wypycha zapadkę ${bad+1}`; break; }
    for(let j=0;j<5;j++) lock[j]=nx[j];
  }
  if (ground) break;
  byId.get("stepDone").click();
}
check("poprawiona sekwencja nie zgrzyta ani razu", ground===null, ground||"");
check("i otwiera zamek", JSON.stringify(lock)===JSON.stringify([3,3,3,3,3]), JSON.stringify(lock));

// --- a grind reported deep in the sequence must NOT be guessed at ---
const { byId: b3 } = boot({
  "wytrych-locks-v1": JSON.stringify([{ name:"X", n:5, E:WRONG_E, pos:START.slice() }]),
});
b3.get("savedList").children[0].children[0].click();
b3.get("stepDone").click();
b3.get("grind").click();
check("zgrzyt zgłoszony po kilku ruchach: aplikacja NIE zgaduje, tylko każe wrócić do kroku 0",
      b3.get("solveBad").innerHTML.includes("Wróć do kroku 0") && hidden(b3,"fixList"),
      b3.get("solveBad").innerHTML);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
