const { boot, holesFor, pinOf, pins, btn, hidden, discover, solve, HOLES, TARGET } = require("./harness");
// Verifies the BFS lifted straight out of index.html (never a copy — it cannot drift):
// every returned path must be edge-safe at every step and must end with all pins centred.

// --- deterministic PRNG so failures reproduce ---
let seed = 12345;
const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));

function randomLock(n, linkChance) {
  const E = [];
  for (let i = 0; i < n; i++) {
    const row = new Array(n).fill(0);
    row[i] = rnd() < 0.5 ? 1 : -1;                 // the plate you move always moves
    for (let j = 0; j < n; j++) {
      if (j !== i && rnd() < linkChance) row[j] = rnd() < 0.5 ? 1 : -1;
    }
    E.push(row);
  }
  return E;
}

// Replay the path against the same rules the game uses.
function replay(n, start, E, path) {
  const pos = start.slice();
  for (const mv of path) {
    for (let t = 0; t < n; t++) {
      const np = pos[t] + mv.dir * E[mv.plate][t];
      if (E[mv.plate][t] !== 0 && (np < 0 || np > HOLES - 1)) {
        return { ok: false, why: `ILLEGAL: plate ${mv.plate + 1} dir ${mv.dir} pushes pin ${t + 1} to ${np}` };
      }
    }
    for (let t = 0; t < n; t++) pos[t] += mv.dir * E[mv.plate][t];
  }
  if (!pos.every(p => p === TARGET)) return { ok: false, why: `ENDS AT ${pos} not centred` };
  return { ok: true };
}

let tested = 0, solved = 0, unsolvable = 0, bad = 0, maxLen = 0, maxMs = 0;

for (let trial = 0; trial < 4000; trial++) {
  const n = ri(4, 7);
  const E = randomLock(n, [0.15, 0.3, 0.5][ri(0, 2)]);
  const start = Array.from({ length: n }, () => ri(0, 6));

  const t0 = process.hrtime.bigint();
  const path = solve(n, start, E);
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  if (ms > maxMs) maxMs = ms;

  tested++;
  if (path === null) { unsolvable++; continue; }
  solved++;
  if (path.length > maxLen) maxLen = path.length;

  const r = replay(n, start, E, path);
  if (!r.ok) {
    bad++;
    if (bad <= 3) console.log(`FAIL n=${n} start=${start} E=${JSON.stringify(E)} -> ${r.why}`);
  }
}

// Worst case for speed: 7 plates, dense links.
const t0 = process.hrtime.bigint();
solve(7, [0, 6, 0, 6, 0, 6, 0], randomLock(7, 0.6));
const worstMs = Number(process.hrtime.bigint() - t0) / 1e6;

console.log(`\ntested       ${tested}`);
console.log(`solved       ${solved}`);
console.log(`unsolvable   ${unsolvable}  (${(100 * unsolvable / tested).toFixed(1)}% of random matrices)`);
console.log(`INVALID PATHS ${bad}   <-- must be 0`);
console.log(`longest path ${maxLen} moves`);
console.log(`slowest solve ${maxMs.toFixed(1)} ms (random) / ${worstMs.toFixed(1)} ms (7 plates, dense)`);
