const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");
// Discovery now asks you to READ the lock after each move, not to spot twitches.
// The point of this suite: a sequence must never contain a move the game would refuse.

let fails=0;
const check=(l,c,e="")=>{console.log(`${c?"  ok  ":"FAIL  "}${l}${c?"":"  <-- "+e}`); if(!c)fails++;};

let seed=31337;
const rnd=()=>(seed=(seed*1103515245+12345)&0x7fffffff)/0x7fffffff;
const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));

// A chest the game could actually produce: scramble from solved with legal moves.
function makeChest(n){
  const E=[];
  for(let i=0;i<n;i++){const r=new Array(n).fill(0); r[i]=rnd()<.5?1:-1;
    for(let j=0;j<n;j++) if(j!==i&&rnd()<.35) r[j]=rnd()<.5?1:-1; E.push(r);}
  let pins=new Array(n).fill(3);
  for(let k=0;k<40;k++){const p=ri(0,n-1),d=rnd()<.5?1:-1;
    const nx=pins.map((v,j)=>v+d*E[p][j]); if(nx.every(v=>v>=0&&v<=6)) pins=nx;}
  return {n,E,pins};
}

// ============ 1. honest discovery over many chests: never a move the game would refuse ============
let ran=0, unsafe=0, wrongLinks=0, notOpened=0;
for(let t=0;t<120;t++){
  const C = makeChest(ri(4,6));
  const { byId } = boot();
  if (!discover(byId, C)) continue;
  ran++;

  // the app must have recovered the TRUE links
  const shown = byId.get("linkList").children.length;
  if (shown !== C.n) { wrongLinks++; continue; }

  // walk the sequence against the real lock, refusing any illegal move exactly like the game
  const lock = C.pins.slice();
  let guard=0;
  while(!byId.get("stepDone").disabled && guard++<400){
    // what is the app telling us to do? read it off the current step
    const plate = parseInt(byId.get("nowPlate").textContent.replace(/\D/g,""),10)-1;
    const presses = byId.get("nowKeys").children.length;
    const dir = byId.get("nowKeys").children[0].textContent === "→" ? 1 : -1;
    for(let k=0;k<presses;k++){
      const next = lock.map((v,j)=> v + dir*C.E[plate][j]);
      if (!next.every(v=>v>=0&&v<=6)) { unsafe++; guard=999; break; }   // the game would grind
      for(let j=0;j<C.n;j++) lock[j] = next[j];
    }
    if (guard===999) break;
    byId.get("stepDone").click();
  }
  if (guard!==999 && !lock.every(v=>v===3)) notOpened++;
}
console.log(`   [zamków przejechanych do końca: ${ran}]`);
check("uczciwe rozpoznanie odtwarza WSZYSTKIE powiązania", wrongLinks===0, String(wrongLinks));
check("żadna sekwencja nie zawiera ruchu, który gra by odrzuciła", unsafe===0, String(unsafe));
check("każda sekwencja realnie otwiera zamek", notOpened===0, String(notOpened));

// ============ 2. a missed twitch is now IMPOSSIBLE to submit ============
const C2 = { n:4, E:[[1,0,0,1],[0,1,0,0],[0,0,1,0],[0,0,0,1]], pins:[2,2,2,2] };
let { byId } = boot();
btn(byId,"plateCount","4").click();
for(let i=0;i<4;i++) holesFor(byId,i)[C2.pins[i]].click();
byId.get("toProbe").click();

check("dopóki nie odczytasz wszystkich zapadek, nie da się iść dalej",
      byId.get("probeConfirm").disabled === true);
holesFor(byId,0)[3].click();     // read only the plate we moved...
check("licznik pokazuje, ilu brakuje", byId.get("probeCount").innerHTML.includes("1 z 4"),
      byId.get("probeCount").innerHTML);
check("przycisk wciąż zablokowany", byId.get("probeConfirm").disabled === true);
holesFor(byId,1)[2].click(); holesFor(byId,2)[2].click(); holesFor(byId,3)[3].click();
check("po odczytaniu wszystkich można iść dalej", byId.get("probeConfirm").disabled === false);

// ============ 3. an impossible reading is refused ============
({ byId } = boot());
btn(byId,"plateCount","4").click();
for(let i=0;i<4;i++) holesFor(byId,i)[2].click();
byId.get("toProbe").click();
holesFor(byId,0)[5].click();                    // three holes in one move
for(let j=1;j<4;j++) holesFor(byId,j)[2].click();
byId.get("probeConfirm").click();
check("zapadka nie może przeskoczyć kilku otworów jednym ruchem",
      !hidden(byId,"probeError") && byId.get("probeError").innerHTML.includes("przeskoczyć"),
      byId.get("probeError").innerHTML);

console.log(fails===0 ? "\nWSZYSTKO PRZESZŁO" : `\n${fails} BŁĘDÓW`);
process.exit(fails?1:0);
