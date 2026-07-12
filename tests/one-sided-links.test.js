// Your recorded chest, loaded exactly as it sits in the library. The app must now refuse to
// present these links as trustworthy: six of the seven pairs are one-way.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");
let fails=0;
const check=(l,c,e="")=>{console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++;};

const YOURS = [
  [ 1,  0,  0,  0,  1],   // 1: pulls 5 same
  [ 1,  1, -1,  0, -1],   // 2: pulls 1 same, 3 opp, 5 opp
  [ 0, -1,  1,  0,  0],   // 3: pulls 2 opp
  [ 1, -1,  0,  1,  0],   // 4: pulls 1 same, 2 opp
  [ 0,  0,  0, -1,  1],   // 5: pulls 4 opp
];
const START = [6, 0, 1, 1, 4];

const { byId } = boot({
  "wytrych-locks-v1": JSON.stringify([{ name:"Brama w piwnicy", n:5, E:YOURS, pos:START }]),
});
byId.get("savedList").children[0].children[0].click();

const w = byId.get("asymWarn");
check("ostrzega o jednostronnych powiązaniach", !hidden(byId,"asymWarn"), "brak ostrzeżenia");
check("liczy je poprawnie (6 z 7 par)", w.innerHTML.includes("6 powiązań działa"), w.innerHTML);
check("wskazuje konkretne pary", w.innerHTML.includes("płytka <b>4</b> rusza zapadkę <b>2</b>"),
      w.innerHTML);
check("tłumaczy, że w tej grze sprzężenia są wzajemne", w.innerHTML.includes("wzajemnie"));

// A clean, mutually-consistent chest must NOT be nagged.
const CLEAN = [
  [ 1,  0,  0,  0,  1],
  [ 0,  1, -1,  0,  0],
  [ 0, -1,  1,  0,  0],
  [ 0,  0,  0,  1, -1],
  [ 1,  0,  0, -1,  1],
];
const { byId: b2 } = boot({
  "wytrych-locks-v1": JSON.stringify([{ name:"Czysta", n:5, E:CLEAN, pos:[2,2,4,1,3] }]),
});
b2.get("savedList").children[0].children[0].click();
check("przy wzajemnych powiązaniach nie marudzi", hidden(b2,"asymWarn"),
      b2.get("asymWarn").innerHTML);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
