// The five ergonomics changes must not cost correctness.
// The one that could: "Reszta bez zmian". It is a shortcut past reading every pin — the very
// thing that used to bend picks. The difference: it is an explicit claim, not a pre-filled
// default. These tests pin down that it stays explicit, and that the shortcuts stay honest.
const { boot, holesFor, pinOf, pins, btn, hidden, discover } = require("./harness");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };
const holeOf = (byId, plate, h) => holesFor(byId, plate)[h];

const C = { n:5,
  E: [[1,0,1,0,0],[0,1,0,0,-1],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
  pins: [2,1,1,2,3] };

// ---------- 1. never propose a direction the plate's own pin cannot take ----------
// Plate 3's pin is jammed against the RIGHT edge; a right push would drive it off.
const E2 = [[1,0,0,0,0],[0,1,0,0,0],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]];
let { byId } = boot();
btn(byId,"plateCount","5").click();
[2,2,6,2,2].forEach((h,i) => holeOf(byId,i,h).click());   // pin 3 at hole 7
byId.get("toProbe").click();

const first = byId.get("probeTitle").innerHTML;
check("na start bierze płytkę z dala od krawędzi, nie tę zapartą",
      !/Płytka 3:/.test(first), first);

// answer the first probe truthfully so the app learns which way "→" pushes a pin
let lock = [2,2,6,2,2];
let p0 = parseInt(first.replace(/\D/g,""),10) - 1;
lock[p0] += 1;
holeOf(byId, p0, lock[p0]).click();
byId.get("probeRest").click();
byId.get("probeConfirm").click();

// walk to plate 3 and check the direction it asks for
for (let guard=0; guard<10; guard++){
  const t = byId.get("probeTitle").innerHTML;
  const pl = parseInt(t.replace(/\D/g,""),10) - 1;
  if (pl === 2) {
    check("dla płytki z zapadką przy PRAWEJ krawędzi proponuje ruch w LEWO",
          t.includes("←"), t);
    break;
  }
  const prev = lock.slice();
  lock[pl] += t.includes("→") ? 1 : -1;
  if (lock[pl] !== prev[pl]) holeOf(byId, pl, lock[pl]).click();
  byId.get("probeRest").click();
  byId.get("probeConfirm").click();
}

// ---------- 2. only the three reachable holes are live ----------
({ byId } = boot());
btn(byId,"plateCount","5").click();
C.pins.forEach((h,i) => holeOf(byId,i,h).click());
byId.get("toProbe").click();
const prevPin = C.pins[1];                       // some plate we are not moving
const live = [0,1,2,3,4,5,6].filter(h => !holeOf(byId,1,h).disabled);
check("klikalne są tylko otwory osiągalne jednym ruchem",
      JSON.stringify(live) === JSON.stringify([prevPin-1, prevPin, prevPin+1].filter(h=>h>=0&&h<=6)),
      JSON.stringify(live));

// ---------- 3. "Reszta bez zmian" is a CLAIM, never a default ----------
check("nic nie jest z góry potwierdzone",
      byId.get("probeCount").innerHTML.includes("0 z 5"), byId.get("probeCount").innerHTML);
check("i dalej nie puszcza", byId.get("probeConfirm").disabled === true);
byId.get("probeRest").click();
check("dopiero świadome kliknięcie 'Reszta' potwierdza pozostałe",
      byId.get("probeConfirm").disabled === false);
check("po potwierdzeniu wszystkiego 'Reszta' jest wyłączona",
      byId.get("probeRest").disabled === true);

// ---------- 4. the shortcut must still recover the true links, on many chests ----------
let seed = 5150;
const rnd = () => (seed = (seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const ri = (a,b) => a + Math.floor(rnd()*(b-a+1));
let ran = 0, unsafe = 0, notOpen = 0;
for (let t = 0; t < 60; t++) {
  const n = ri(4,6);
  const E = [];
  for (let i=0;i<n;i++){ const r=new Array(n).fill(0); r[i]=rnd()<.5?1:-1;
    for(let j=0;j<n;j++) if(j!==i&&rnd()<.35) r[j]=rnd()<.5?1:-1; E.push(r); }
  let pn = new Array(n).fill(3);
  for(let k=0;k<40;k++){ const p=ri(0,n-1), d=rnd()<.5?1:-1;
    const nx=pn.map((v,j)=>v+d*E[p][j]); if(nx.every(v=>v>=0&&v<=6)) pn=nx; }
  const chest = { n, E, pins: pn };
  const b = boot().byId;
  if (!discover(b, chest)) continue;
  ran++;
  const L = pn.slice();
  let g = 0;
  while (!b.get("stepDone").disabled && g++ < 400) {
    const pl = parseInt(b.get("nowPlate").textContent.replace(/\D/g,""),10) - 1;
    const caps = b.get("nowKeys").children;
    const d = caps[0].textContent === "→" ? 1 : -1;
    let bad = false;
    for (let k=0;k<caps.length;k++){
      const nx = L.map((v,j)=> v + d*E[pl][j]);
      if (nx.some(v=>v<0||v>6)) { bad = true; break; }
      for (let j=0;j<n;j++) L[j]=nx[j];
    }
    if (bad) { unsafe++; break; }
    b.get("stepDone").click();
  }
  if (!L.every(v=>v===3)) notOpen++;
}
console.log(`   [zamków przejechanych skrótem: ${ran}]`);
check("skrót NIE psuje rozpoznania: żadnego ruchu odrzuconego przez grę", unsafe === 0, String(unsafe));
check("i każdy zamek się otwiera", notOpen === 0, String(notOpen));

// ---------- 5. phases and the prose switch ----------
({ byId } = boot());
const ph = byId.get("phases").children;
check("faza 1 podświetlona na starcie", ph[0].className.includes("is-now"), ph[0].className);
check("przełącznik opisów startuje włączony",
      byId.get("helpToggle").textContent === "Ukryj opisy");
byId.get("helpToggle").click();
check("po kliknięciu opisy znikają", byId.get("helpToggle").textContent === "Pokaż opisy");

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
