// Two languages, one dictionary. The dangerous failure here is a message that exists in one
// language only — a player would then meet a blank, or worse, a half-translated warning about
// bending their pick. So: every key must exist in both, and the app must work end-to-end in EN.
const { boot, holesFor, pins, btn, hidden, discover } = require("./harness");
const fs = require("fs"), path = require("path");

let fails = 0;
const check = (l,c,e="") => { console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++; };

// ---------- 1. no key may exist in one language only ----------
const src = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const dictSrc = src.slice(src.indexOf("var STR = {"), src.indexOf("function t(key"));
const keysOf = (lang) => {
  const start = dictSrc.indexOf(`    ${lang}: {`);
  const end = lang === "pl" ? dictSrc.indexOf("    en: {") : dictSrc.length;
  return new Set([...dictSrc.slice(start, end).matchAll(/^      (\w+):/gm)].map(m => m[1]));
};
const pl = keysOf("pl"), en = keysOf("en");
const onlyPl = [...pl].filter(k => !en.has(k));
const onlyEn = [...en].filter(k => !pl.has(k));
check(`słownik ma ${pl.size} kluczy po polsku i ${en.size} po angielsku`, pl.size > 60);
check("żaden klucz nie istnieje tylko po polsku", onlyPl.length === 0, onlyPl.join(", "));
check("żaden klucz nie istnieje tylko po angielsku", onlyEn.length === 0, onlyEn.join(", "));

// ---------- 2. the whole flow works in English ----------
const C = { n:5,
  E: [[1,0,1,0,0],[0,1,0,0,-1],[0,0,1,0,0],[0,0,0,1,0],[0,0,0,0,1]],
  pins: [2,1,1,2,3] };

let { byId } = boot({ "wytrych-lang-v1": '"en"' });
check("po angielsku fazy są po angielsku",
      byId.get("phases").children[0].text.includes("Setup"),
      byId.get("phases").children[0].text);
check("przełącznik oferuje powrót na PL", byId.get("langToggle").textContent === "PL");

discover(byId, C);
check("sekwencja po angielsku", /^Step 1 of \d+$/.test(byId.get("solveTitle").textContent),
      byId.get("solveTitle").textContent);
check("instrukcja kroku po angielsku",
      /Push <b>(right|left)<\/b> \d+ times?, then click/.test(byId.get("nowCount").innerHTML),
      byId.get("nowCount").innerHTML);
check("powiązania po angielsku",
      byId.get("linkList").children[0].innerHTML.includes("Plate 1") &&
      /the (same|opposite) way/.test(byId.get("linkList").children[0].innerHTML),
      byId.get("linkList").children[0].innerHTML);
check("pasek kciuka po angielsku",
      /Plate \d [→←] (right|left)/.test(byId.get("tbText").innerHTML),
      byId.get("tbText").innerHTML);
check("prośba o Reset po angielsku",
      byId.get("tbText").innerHTML.includes("Reset in game"), byId.get("tbText").innerHTML);

let g = 0;
while (!byId.get("stepDone").disabled && g++ < 400) byId.get("stepDone").click();
check("i zamek się otwiera",
      JSON.stringify(pins(byId,5)) === JSON.stringify([3,3,3,3,3]) &&
      byId.get("solveTitle").textContent === "Open",
      byId.get("solveTitle").textContent);

// ---------- 3. switching language does not touch the lock ----------
({ byId } = boot());
discover(byId, C);
const before = JSON.stringify(pins(byId,5));
const stepsBefore = byId.get("solveTitle").textContent;
byId.get("langToggle").click();
check("przełączenie języka nie rusza zamka", JSON.stringify(pins(byId,5)) === before);
check("ani nie gubi sekwencji",
      byId.get("solveTitle").textContent.replace(/\D+/g, "") === stepsBefore.replace(/\D+/g, ""),
      `${stepsBefore} -> ${byId.get("solveTitle").textContent}`);
check("a interfejs jest już po angielsku",
      byId.get("solveTitle").textContent.startsWith("Step"), byId.get("solveTitle").textContent);
check("wybór języka zapisany", byId.get("langToggle").textContent === "PL");

// ---------- 4. a fresh visitor gets their own language ----------
check("domyślnie polski, gdy przeglądarka nie mówi inaczej",
      boot().byId.get("langToggle").textContent === "EN");

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
