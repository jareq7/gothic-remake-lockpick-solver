// Shared fake-DOM harness: runs the REAL app script from index.html.
const fs = require("fs"), vm = require("vm"), path = require("path");
const HTML = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
const APP = [...HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]).find(j => j.includes("function solve("));
if (!APP) throw new Error("nie znaleziono skryptu aplikacji");

class El {
  constructor(t){this.tag=t;this.children=[];this.listeners={};this.attrs={};this.style={};this.classes=new Set();this._t="";this.value="";this.disabled=false;
    this.classList={add:c=>this.classes.add(c),remove:c=>this.classes.delete(c),contains:c=>this.classes.has(c),
      toggle:(c,o)=>o===undefined?(this.classes.has(c)?this.classes.delete(c):this.classes.add(c)):(o?this.classes.add(c):this.classes.delete(c))};}
  set innerHTML(v){this.children=[];this._t=String(v);} get innerHTML(){return this._t;}
  set textContent(v){this._t=String(v);} get textContent(){return this._t;}
  set className(v){this.classes=new Set(String(v).split(/\s+/).filter(Boolean));}
  addEventListener(t,f){(this.listeners[t]||=[]).push(f);} setAttribute(k,v){this.attrs[k]=v;}
  appendChild(c){this.children.push(c);return c;} focus(){}
  click(){(this.listeners.click||[]).forEach(f=>f({}));}
  get text(){return this._t || this.children.map(c=>c.text).join(" ");}
}

function boot(store = {}) {
  const byId = new Map();
  const document = { getElementById: id => { if(!byId.has(id)) byId.set(id, new El("div")); return byId.get(id); },
                     createElement: t => new El(t), documentElement: new El("html") };
  const localStorage = { getItem: k => k in store ? store[k] : null, setItem: (k,v) => { store[k] = String(v); } };
  const ctx = { document, localStorage, console, JSON, Math, Array, Int32Array, Int8Array, String, Number, Object };
  vm.createContext(ctx); vm.runInContext(APP, ctx);
  return { byId, store };
}

const rowFor   = (b,p) => [...b.get("plates").children].find(r => r.children[0].textContent === String(p+1));
const holesFor = (b,p) => rowFor(b,p).children[1].children;
const pinOf    = (b,p) => [...holesFor(b,p)].findIndex(h => h.children.length > 0);
const pins     = (b,n) => Array.from({length:n}, (_,i) => pinOf(b,i));
const btn      = (b,id,l) => b.get(id).children.find(x => x.textContent === l);
const hidden   = (b,id) => b.get(id).classes.has("hidden");

// Play step 1 + step 2 truthfully against a simulated game that refuses illegal moves —
// including the case where a plate is jammed solid and has to be skipped and revisited.
function discover(byId, C, misread) {
  btn(byId, "plateCount", String(C.n)).click();
  for (let i=0;i<C.n;i++) holesFor(byId,i)[C.pins[i]].click();
  byId.get("toProbe").click();

  const lock = C.pins.slice();
  const legal = (p,d) => lock.every((v,j)=>{ const np = v + d*C.E[p][j]; return np>=0 && np<=6; });
  const apply = (p,d) => { for (let j=0;j<C.n;j++) lock[j] += d*C.E[p][j]; };
  const readBack = (round) => {
    for (let j=0;j<C.n;j++){
      let hole = lock[j];
      if (misread && misread.round === round && misread.plate === j)
        hole = Math.min(6, Math.max(0, hole + misread.delta));
      holesFor(byId,j)[hole].click();
    }
  };

  for (let guard=0; guard<200; guard++){
    if (hidden(byId,"cardProbe")) return true;              // discovery finished

    const title = byId.get("probeTitle").innerHTML;
    const plate = parseInt(title.replace(/\D/g,""),10) - 1;  // "Płytka N: przesuń ..."
    const dir = title.includes("→") ? 1 : -1;

    if (!legal(plate, dir)) {
      byId.get("probeJam").click();
      // still asking for the same plate? then the other way is jammed too — skip it
      const t2 = byId.get("probeTitle").innerHTML;
      const d2 = t2.includes("→") ? 1 : -1;
      if (d2 === dir || !legal(plate, d2)) { byId.get("probeSkip").click(); continue; }
      apply(plate, d2); readBack(guard); byId.get("probeConfirm").click(); continue;
    }
    apply(plate, dir); readBack(guard); byId.get("probeConfirm").click();
  }
  return false;
}

// The app's own BFS, lifted straight out of index.html so tests can never drift from it.
function extract(name) {
  const start = APP.indexOf(`function ${name}(`);
  let depth = 0, i = start, seen = false;
  for (;;) {
    if (APP[i] === "{") { depth++; seen = true; }
    else if (APP[i] === "}") { depth--; if (seen && depth === 0) break; }
    i++;
  }
  return APP.slice(start, i + 1);
}
const HOLES = 7, TARGET = 3;
const solve = new Function("HOLES", "TARGET", extract("solve") + "; return solve;")(HOLES, TARGET);

module.exports = { boot, El, rowFor, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET };
