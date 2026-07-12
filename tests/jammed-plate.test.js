// A chest where plate 2 is jammed solid at the start: neither direction is legal, because
// it is coupled to pins already hard against opposite edges. Discovery must not deadlock.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");
let fails=0;
const check=(l,c,e="")=>{console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++;};

// Plate 2 is jammed solid in the starting layout, exactly like yours:
//   →  drives pin 5 off the RIGHT edge   (pin 5 sits in hole 7)
//   ←  drives pin 1 off the LEFT edge    (pin 1 sits in hole 1)
// It cannot move at all until other plates make room. The chest IS solvable (8 presses).
// All couplings are mutual, so the one-sided-link warning must stay quiet.
const C = {
  n: 5,
  //     p1  p2  p3  p4  p5
  E: [ [ 1,  1,  0,  0,  0],
       [ 1,  1, -1,  0,  1],
       [ 0, -1,  1,  0,  0],
       [ 0,  0,  0,  1, -1],
       [ 0,  1,  0, -1,  1] ],
  pins: [0, 3, 1, 1, 6],
};

const stuckR = C.pins.some((v,j)=> { const np = v + C.E[1][j]; return np<0||np>6; });
const stuckL = C.pins.some((v,j)=> { const np = v - C.E[1][j]; return np<0||np>6; });
check("płytka 2 jest w pozycji startowej zablokowana w OBIE strony", stuckR && stuckL,
      `prawo:${stuckR} lewo:${stuckL}`);

const { byId } = boot();
const ok = discover(byId, C);
check("rozpoznanie NIE zakleszcza się — kończy się", ok === true, "utknęło");
check("i poznaje wszystkie 5 płytek", byId.get("linkList").children.length === 5,
      String(byId.get("linkList").children.length));

// The links it recovered must be the true ones — check the tricky plate 2 row.
const p2 = byId.get("linkList").children[1].innerHTML;
check("płytka 2: zapadka 1 w tę samą stronę",
      /zapadkę <b>1<\/b> <span class="same">/.test(p2), p2);
check("płytka 2: zapadka 3 w przeciwną",
      /zapadkę <b>3<\/b> <span class="opp">/.test(p2), p2);
check("brak fałszywego ostrzeżenia o jednostronności", hidden(byId,"asymWarn"),
      byId.get("asymWarn").innerHTML);

// The sequence must run clean against the real game.
const lock = C.pins.slice();
let g=0, ground=null;
while(!byId.get("stepDone").disabled && g++<400){
  const p = parseInt(byId.get("nowPlate").textContent.replace(/\D/g,""),10)-1;
  const caps = byId.get("nowKeys").children;
  const d = caps[0].textContent === "→" ? 1 : -1;
  for(let k=0;k<caps.length;k++){
    const nx = lock.map((v,j)=> v + d*C.E[p][j]);
    const b = nx.findIndex(v=>v<0||v>6);
    if (b>=0) { ground = `płytka ${p+1} ${d===1?"→":"←"} wypycha zapadkę ${b+1}`; break; }
    for(let j=0;j<5;j++) lock[j]=nx[j];
  }
  if (ground) break;
  byId.get("stepDone").click();
}
check("sekwencja nie zgrzyta ani razu", ground===null, ground||"");
check("i otwiera zamek", JSON.stringify(lock)===JSON.stringify([3,3,3,3,3]), JSON.stringify(lock));

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
