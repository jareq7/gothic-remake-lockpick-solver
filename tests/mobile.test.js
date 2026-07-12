// The phone bar is a second way to drive the app. If it ever drifts from the buttons in the
// cards, the two would disagree about the state of a real lock. So: same handlers, same
// blocking rules, and it must always say what you are supposed to be doing right now.
const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve } = require("./harness");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };

const C = { n:5,
  E: [[1,0,1,0,0],[0,1,0,0,-1],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
  pins: [2,1,1,2,3] };

// ---------- step 1 ----------
let { byId } = boot();
btn(byId,"plateCount","5").click();
check("pasek prowadzi za rękę, zanim cokolwiek ustawisz",
      byId.get("tbText").innerHTML.includes("zostało 5"), byId.get("tbText").innerHTML);
check("i BLOKUJE dalej, dopóki nie ustawisz wszystkich zapadek",
      byId.get("tbAction").disabled === true && byId.get("toProbe").disabled === true);
for (let i=0;i<5;i++) holesFor(byId,i)[C.pins[i]].click();
check("po ustawieniu zapadek pasek to potwierdza",
      byId.get("tbText").innerHTML.includes("Zapadki ustawione"), byId.get("tbText").innerHTML);

byId.get("tbAction").click();                       // drive the app from the bar alone
check("przycisk paska wchodzi w rozpoznanie", !hidden(byId,"cardProbe"));

// ---------- step 2: the bar must enforce the same rule as the card ----------
check("pasek mówi, którą płytkę i w którą stronę",
      /Płytka 1 → w prawo/.test(byId.get("tbText").innerHTML), byId.get("tbText").innerHTML);
check("pasek liczy odczytane zapadki",
      byId.get("tbText").innerHTML.includes("odczytane 0/5"), byId.get("tbText").innerHTML);
check("BLOKUJE dalej, dopóki nie odczytasz wszystkich — tak jak przycisk w karcie",
      byId.get("tbAction").disabled === true && byId.get("probeConfirm").disabled === true);

// read four of five: still blocked
const lock = C.pins.map((v,j) => v + C.E[0][j]);
for (let j=0;j<4;j++) holesFor(byId,j)[lock[j]].click();
check("cztery z pięciu — nadal zablokowany", byId.get("tbAction").disabled === true,
      byId.get("tbText").innerHTML);
holesFor(byId,4)[lock[4]].click();
check("piąta odczytana — odblokowany", byId.get("tbAction").disabled === false);

byId.get("tbAction").click();
check("pasek przesuwa rozpoznanie na płytkę 2",
      /Płytka 2/.test(byId.get("tbText").innerHTML), byId.get("tbText").innerHTML);

// ---------- finish discovery normally, then drive step 3 from the bar ----------
({ byId } = boot());
discover(byId, C);
check("po rozpoznaniu pasek przypomina o Resecie w grze",
      byId.get("tbText").innerHTML.includes("Reset w grze"), byId.get("tbText").innerHTML);
check("i pokazuje bieżący krok z liczbą naciśnięć",
      /Płytka \d [→←] w (prawo|lewo) ×\d/.test(byId.get("tbText").innerHTML),
      byId.get("tbText").innerHTML);

// the bar's button and the card's button must move the lock identically
const viaBar = boot(); discover(viaBar.byId, C);
const viaCard = boot(); discover(viaCard.byId, C);
let g = 0;
while (!viaBar.byId.get("tbAction").disabled && g++ < 400) viaBar.byId.get("tbAction").click();
let h = 0;
while (!viaCard.byId.get("stepDone").disabled && h++ < 400) viaCard.byId.get("stepDone").click();
check("prowadzenie z paska i z karty daje IDENTYCZNY stan zamka",
      JSON.stringify(pins(viaBar.byId,5)) === JSON.stringify(pins(viaCard.byId,5)),
      `${JSON.stringify(pins(viaBar.byId,5))} vs ${JSON.stringify(pins(viaCard.byId,5))}`);
check("i oba otwierają zamek",
      JSON.stringify(pins(viaBar.byId,5)) === JSON.stringify([3,3,3,3,3]));
check("na koniec pasek ogłasza otwarcie i gasi przycisk",
      viaBar.byId.get("tbText").innerHTML.includes("Zamek otwarty") &&
      viaBar.byId.get("tbAction").disabled === true,
      viaBar.byId.get("tbText").innerHTML);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
