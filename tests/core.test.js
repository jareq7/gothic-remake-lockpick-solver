// Regression suite for everything that survived the discovery rewrite.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };

const C = { n:5,
  E: [[1,0,1,0,0],[0,1,0,0,-1],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
  pins: [2,1,1,2,3] };

// ---------- numbering, links panel, reset, step 0 ----------
let { byId, store } = boot();
btn(byId,"plateCount","5").click();
for (let i=0;i<5;i++) holesFor(byId,i)[C.pins[i]].click();
check("płytka 1 na dole, ostatnia na górze",
      byId.get("plates").children[4].children[0].textContent === "1" &&
      byId.get("plates").children[0].children[0].textContent === "5");
check("w kroku 1 nie ma panelu powiązań ani Resetu",
      hidden(byId,"cardLinks") && hidden(byId,"resetToStart"));

({ byId, store } = boot());
discover(byId, C);

check("po rozpoznaniu podgląd stoi na układzie z kroku 1 (Reset w grze)",
      JSON.stringify(pins(byId,5)) === JSON.stringify(C.pins), JSON.stringify(pins(byId,5)));
check("aplikacja prosi o Reset w grze", !hidden(byId,"resetNote"));
check("krok 0 oznaczony", !hidden(byId,"atStart"));
check("powiązania widoczne bez rozwijania", !hidden(byId,"cardLinks") &&
      byId.get("linkList").children.length === 5);
check("odtworzone powiązania są prawdziwe",
      byId.get("linkList").children[1].innerHTML.includes("zapadkę <b>5</b>") &&
      byId.get("linkList").children[1].innerHTML.includes("w przeciwną"),
      byId.get("linkList").children[1].innerHTML);
check("klawisze to strzałki",
      byId.get("nowKeys").children.every(k => k.textContent === "→" || k.textContent === "←"));

const linksBefore = byId.get("linkList").children.map(c=>c.innerHTML).join("|");
byId.get("stepDone").click();
byId.get("stepDone").click();
check("po ruchach znacznik kroku 0 gaśnie", hidden(byId,"atStart"));
byId.get("resetToStart").click();
check("Reset wraca dokładnie do kroku 0",
      JSON.stringify(pins(byId,5)) === JSON.stringify(C.pins), JSON.stringify(pins(byId,5)));
check("Reset nie gubi powiązań",
      byId.get("linkList").children.map(c=>c.innerHTML).join("|") === linksBefore);

let g=0;
while(!byId.get("stepDone").disabled && g++<400) byId.get("stepDone").click();
check("sekwencja otwiera zamek",
      JSON.stringify(pins(byId,5)) === JSON.stringify([3,3,3,3,3]), JSON.stringify(pins(byId,5)));

// ---------- the library ----------
({ byId, store } = boot());
discover(byId, C);
byId.get("lockName").value = "Brama w piwnicy";
byId.get("saveLock").click();
const saved = JSON.parse(store["wytrych-locks-v1"])[0];
check("zapisano prawdziwe powiązania", JSON.stringify(saved.E) === JSON.stringify(C.E),
      JSON.stringify(saved.E));
check("zapisano układ startowy (nie stan po rozpoznaniu)",
      JSON.stringify(saved.pos) === JSON.stringify(C.pins), JSON.stringify(saved.pos));

({ byId } = boot(store));
byId.get("reset").click();
btn(byId,"plateCount","5").click();
for (let i=0;i<5;i++) holesFor(byId,i)[C.pins[i]].click();
check("rozpoznaje skrzynię po układzie startowym",
      !hidden(byId,"matchBanner") && byId.get("matchBanner").innerHTML.includes("Brama w piwnicy"));
byId.get("loadMatch").click();
check("wczytanie pomija rozpoznanie i daje sekwencję",
      hidden(byId,"cardProbe") && /^Krok 1 z \d+$/.test(byId.get("solveTitle").textContent),
      byId.get("solveTitle").textContent);
g=0;
while(!byId.get("stepDone").disabled && g++<400) byId.get("stepDone").click();
check("i ta sekwencja otwiera zamek",
      JSON.stringify(pins(byId,5)) === JSON.stringify([3,3,3,3,3]));

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
