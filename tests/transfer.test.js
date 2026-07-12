// Chests move between browsers by copy-paste. Import is a door into the data that drives a
// real lock — so it must round-trip faithfully AND refuse anything malformed, rather than
// letting a broken chest through to produce a pick-bending sequence.
const { boot, holesFor, pins, btn, hidden, discover } = require("./harness");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };

const C = { n:5,
  E: [[1,0,1,0,0],[0,1,0,0,-1],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
  pins: [2,1,1,2,3] };

// ---------- export, then import into a FRESH browser ----------
let { byId, store } = boot();
discover(byId, C);
byId.get("lockName").value = "Brama w piwnicy";
byId.get("saveLock").click();

byId.get("doExport").click();
const code = byId.get("transferText").value;
check("eksport daje kod", code.length > 0);
check("i mówi, ile skrzyń poszło",
      byId.get("transferMsg").textContent.includes("1"), byId.get("transferMsg").textContent);

// a different browser: empty storage, nothing shared
let fresh = boot();
check("nowa przeglądarka nie zna żadnych skrzyń",
      fresh.byId.get("savedList").children.length === 0);

fresh.byId.get("transferText").value = code;
fresh.byId.get("doImport").click();
check("po imporcie skrzynia jest na liście",
      fresh.byId.get("savedList").children.length === 1 &&
      fresh.byId.get("savedList").children[0].children[0].text.includes("Brama w piwnicy"),
      String(fresh.byId.get("savedList").children.length));

const saved = JSON.parse(fresh.store["wytrych-locks-v1"])[0];
check("powiązania przeniesione co do znaku", JSON.stringify(saved.E) === JSON.stringify(C.E),
      JSON.stringify(saved.E));
check("układ startowy przeniesiony", JSON.stringify(saved.pos) === JSON.stringify(C.pins));

// and it must actually work: open it and walk the sequence against the real game
fresh.byId.get("savedList").children[0].children[0].click();
const lock = C.pins.slice();
let g = 0, ground = null;
while (!fresh.byId.get("stepDone").disabled && g++ < 400) {
  const p = parseInt(fresh.byId.get("nowPlate").textContent.replace(/\D/g,""),10) - 1;
  const caps = fresh.byId.get("nowKeys").children;
  const d = caps[0].textContent === "→" ? 1 : -1;
  for (let k=0;k<caps.length;k++){
    const nx = lock.map((v,j)=> v + d*C.E[p][j]);
    if (nx.some(v=>v<0||v>6)) { ground = "zgrzyt"; break; }
    for (let j=0;j<5;j++) lock[j] = nx[j];
  }
  if (ground) break;
  fresh.byId.get("stepDone").click();
}
check("zaimportowana skrzynia otwiera zamek bez zgrzytu",
      ground === null && JSON.stringify(lock) === JSON.stringify([3,3,3,3,3]),
      ground || JSON.stringify(lock));

// ---------- the door must be guarded ----------
const junk = [
  ["nie-JSON",                 "to nie jest json"],
  ["pusty tekst",              "   "],
  ["JSON, ale nie skrzynie",   '{"cokolwiek": 1}'],
  ["macierz złej wielkości",   '{"locks":[{"name":"X","n":5,"E":[[1,0],[0,1]],"pos":[2,1,1,2,3]}]}'],
  ["wartość spoza -1/0/1",     '{"locks":[{"name":"X","n":4,"E":[[1,0,0,3],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"pos":[2,1,1,2]}]}'],
  ["płytka nie rusza siebie",  '{"locks":[{"name":"X","n":4,"E":[[0,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"pos":[2,1,1,2]}]}'],
  ["zapadka poza otworami",    '{"locks":[{"name":"X","n":4,"E":[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],"pos":[9,1,1,2]}]}'],
];
for (const [label, payload] of junk) {
  const b = boot().byId;
  b.get("transferText").value = payload;
  b.get("doImport").click();
  check(`odrzuca: ${label}`, b.get("savedList").children.length === 0,
        b.get("transferMsg").textContent);
}

// ---------- a good chest inside a batch with junk still gets through ----------
const mixed = JSON.parse(code);
mixed.locks.push({ name: "Zepsuta", n: 4, E: [[5,0,0,0]], pos: [1,1,1,1] });
const b2 = boot().byId;
b2.get("transferText").value = JSON.stringify(mixed);
b2.get("doImport").click();
check("z mieszanej paczki bierze dobrą skrzynię, a złą odrzuca",
      b2.get("savedList").children.length === 1 &&
      b2.get("transferMsg").textContent.includes("odrzucono 1"),
      b2.get("transferMsg").textContent);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
