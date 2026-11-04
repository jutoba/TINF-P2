/* Núcleo de cálculo del 2.º parcial: canales, códigos lineales y cíclicos sobre GF(2), FEC y ARQ.
   Funciona en navegador (window.TC) y en Node (module.exports). */
(function (root) {
  'use strict';
  const TC = {};
  const EPS = 1e-12;

  /* ---------- Fracciones exactas (BigInt) ---------- */
  function bgcd(a, b) { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) { [a, b] = [b, a % b]; } return a; }
  class Frac {
    constructor(n, d = 1n) {
      n = BigInt(n); d = BigInt(d);
      if (d === 0n) throw new Error('División por cero');
      if (d < 0n) { n = -n; d = -d; }
      const g = bgcd(n, d) || 1n;
      this.n = n / g; this.d = d / g;
    }
    div(o) { return new Frac(this.n * o.d, this.d * o.n); }
    num() { return Number(this.n) / Number(this.d); }
    toString() { return this.d === 1n ? String(this.n) : `${this.n}/${this.d}`; }
    static parse(s) {
      s = String(s).trim().replace(',', '.');
      if (!s) throw new Error('Valor vacío');
      if (s.includes('/')) { const [a, b] = s.split('/'); return Frac.parse(a).div(Frac.parse(b)); }
      if (!/^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s)) throw new Error(`"${s}" no es un número`);
      let [mant, exp] = s.toLowerCase().split('e');
      exp = exp ? parseInt(exp, 10) : 0;
      let neg = false;
      if (mant[0] === '-' || mant[0] === '+') { neg = mant[0] === '-'; mant = mant.slice(1); }
      const [ip, fp = ''] = mant.split('.');
      let n = BigInt((ip || '0') + fp);
      let d = 10n ** BigInt(fp.length);
      if (exp > 0) n *= 10n ** BigInt(exp); else if (exp < 0) d *= 10n ** BigInt(-exp);
      return new Frac(neg ? -n : n, d);
    }
  }
  TC.Frac = Frac;

  /* ---------- Utilidades numéricas ---------- */
  TC.log2 = x => Math.log(x) / Math.LN2;
  TC.fmt = (x, d = 4) => {
    if (!isFinite(x)) return '∞';
    const r = Math.round(x * 10 ** d) / 10 ** d;
    return r.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });
  };
  /* Notación científica para probabilidades pequeñas */
  TC.sci = (x, d = 3) => {
    if (x === 0) return '0';
    if (!isFinite(x)) return '∞';
    if (Math.abs(x) >= 1e-3 && Math.abs(x) < 1e6) return TC.fmt(x, Math.max(d + 1, 4));
    const [m, e] = x.toExponential(d - 1).split('e');
    return `${m.replace('.', ',')}·10^${Number(e)}`;
  };
  TC.H = ps => ps.reduce((s, p) => (p > EPS ? s - p * TC.log2(p) : s), 0);
  TC.h2 = p => TC.H([p, 1 - p]);
  TC.parseList = function (text) {
    const s = String(text).trim().replace(/[{}()[\]]/g, ' ');
    if (!s) return [];
    let toks = s.split(/[\s;]+/).filter(Boolean);
    if (toks.some(t => /,.*,/.test(t) || /\d\.\d*,/.test(t))) toks = s.split(/[\s;,]+/).filter(Boolean);
    else toks = toks.flatMap(t => (t.endsWith(',') ? [t.slice(0, -1)] : [t]));
    return toks.map(t => Frac.parse(t));
  };
  TC.parseMatrix = function (text) {
    const rows = String(text).trim().split(/\n|;|\|/).map(r => r.trim()).filter(Boolean);
    if (!rows.length) throw new Error('Escribe la matriz, una fila por línea.');
    return rows.map(r => TC.parseList(r));
  };

  /* ---------- Combinatoria ---------- */
  const binomMemo = new Map();
  TC.binomB = function (n, k) {
    if (k < 0 || k > n) return 0n;
    k = Math.min(k, n - k);
    const key = n * 1024 + k;
    if (binomMemo.has(key)) return binomMemo.get(key);
    let r = 1n;
    for (let i = 1; i <= k; i++) r = (r * BigInt(n - k + i)) / BigInt(i);
    binomMemo.set(key, r);
    return r;
  };
  TC.binom = (n, k) => Number(TC.binomB(n, k));
  /* Σ_{i=a}^{b} C(n,i) p^i (1-p)^(n-i) */
  TC.sumBin = function (n, a, b, p) {
    const lo = Math.max(a, 0), hi = Math.min(b, n);
    if (lo > hi) return 0;
    if (p <= 0) return lo === 0 ? 1 : 0;
    if (p >= 1) return hi === n ? 1 : 0;
    // Primer término por logaritmos y el resto por recurrencia: C(n,i) desborda los dobles con n grande
    let lnT = lo * Math.log(p) + (n - lo) * Math.log1p(-p);
    for (let j = 1; j <= lo; j++) lnT += Math.log((n - lo + j) / j);
    let t = Math.exp(lnT), s = 0; const ratio = p / (1 - p);
    for (let i = lo; i <= hi; i++) { s += t; t *= ((n - i) / (i + 1)) * ratio; }
    return s;
  };
  TC.sumA = function (A, n, p, from = 1) {
    let s = 0;
    for (let i = from; i <= n; i++) if (A[i]) s += Number(A[i]) * Math.pow(p, i) * Math.pow(1 - p, n - i);
    return s;
  };

  /* ---------- Polinomios sobre GF(2): BigInt, bit i = coeficiente de x^i ---------- */
  const popc = a => { let c = 0; while (a) { a &= a - 1n; c++; } return c; };
  TC.pweight = popc;
  TC.pdeg = a => (a === 0n ? -1 : a.toString(2).length - 1);
  TC.pmul = (a, b) => { let r = 0n, s = 0n; while (b >> s) { if ((b >> s) & 1n) r ^= a << s; s++; } return r; };
  TC.pdivmod = function (a, b) {
    if (b === 0n) throw new Error('División entre 0');
    const db = TC.pdeg(b);
    let q = 0n, r = a, dr = TC.pdeg(r);
    while (dr >= db) { const sh = BigInt(dr - db); q ^= 1n << sh; r ^= b << sh; dr = TC.pdeg(r); }
    return { q, r };
  };
  TC.pmod = (a, b) => TC.pdivmod(a, b).r;
  TC.pdiv = (a, b) => TC.pdivmod(a, b).q;
  TC.pgcd = (a, b) => { while (b) { [a, b] = [b, TC.pmod(a, b)]; } return a; };
  TC.xn1 = n => (1n << BigInt(n)) | 1n;
  TC.pexps = function (a, desc) { const out = []; const d = TC.pdeg(a); for (let i = 0; i <= d; i++) if ((a >> BigInt(i)) & 1n) out.push(i); return desc ? out.reverse() : out; };
  TC.ptex = function (a, desc) {
    if (a === 0n) return '0';
    return TC.pexps(a, desc).map(i => (i === 0 ? '1' : i === 1 ? 'x' : `x^{${i}}`)).join('+');
  };
  TC.pvec = (a, n) => Array.from({ length: n }, (_, i) => Number((a >> BigInt(i)) & 1n));
  TC.vecp = v => v.reduce((acc, b, i) => (b ? acc | (1n << BigInt(i)) : acc), 0n);
  TC.vstr = v => v.join('');
  const SUP = { '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9' };
  /* Acepta "1+x+x^3", "x4+x2+x+1", "1+x³", "(1+x)(1+x+x^3)" o bits v0 v1…: "1101" */
  TC.parsePoly = function (text) {
    let s = String(text).trim().toLowerCase().replace(/\s+/g, '').replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]+/g, m => '^' + [...m].map(c => SUP[c]).join('')).replace(/[·*]/g, '').replace(/\{|\}/g, '');
    if (!s) throw new Error('Escribe un polinomio, por ejemplo 1+x+x^3.');
    if (/^[01]{2,}$/.test(s)) return TC.vecp([...s].map(Number));
    const one = t => {
      let r = 0n;
      t.split('+').filter(Boolean).forEach(term => {
        const m = term.match(/^(?:1|x(?:\^?(\d+))?|0)$/);
        if (!m) throw new Error(`No entiendo el término "${term}". Escríbelo como x^3 o x3.`);
        if (term === '0') return;
        const e = term === '1' ? 0 : m[1] !== undefined ? Number(m[1]) : 1;
        r ^= 1n << BigInt(e);
      });
      return r;
    };
    if (s.includes('(')) {
      const parts = s.match(/\([^()]*\)|[^()]+/g) || [];
      return parts.reduce((acc, p) => TC.pmul(acc, one(p.replace(/[()]/g, ''))), 1n);
    }
    return one(s);
  };
  TC.parseBits = function (text, n) {
    const b = String(text).replace(/[^01]/g, '');
    if (!b) throw new Error('Escribe los bits, por ejemplo 0110101.');
    if (n !== undefined && b.length !== n) throw new Error(`Hacen falta ${n} bits y has escrito ${b.length}.`);
    return [...b].map(Number);
  };

  /* Factores irreducibles de un polinomio por división de prueba */
  TC.factor = function (a, maxDeg = 18) {
    const out = []; let rem = a, partial = false;
    if (rem === 0n) return { factors: [], partial };
    while (!(rem & 1n)) { out.push(2n); rem >>= 1n; }
    let c = 3n; // 1+x es el primer candidato con término independiente
    while (TC.pdeg(rem) >= 1 && 2 * TC.pdeg(c) <= TC.pdeg(rem)) {
      if (TC.pdeg(c) > maxDeg) { partial = true; break; }
      while (TC.pmod(rem, c) === 0n) { out.push(c); rem = TC.pdiv(rem, c); }
      c += 2n;
    }
    if (rem !== 1n && rem !== 0n) out.push(rem);
    out.sort((x, y) => TC.pdeg(x) - TC.pdeg(y) || (x < y ? -1 : 1));
    return { factors: out, partial };
  };
  TC.isIrreducible = a => { if (TC.pdeg(a) < 1) return false; const f = TC.factor(a); return f.factors.length === 1 && !f.partial; };
  /* Orden de x módulo p: menor t con p | x^t + 1 */
  TC.order = function (p, cap = 70000) {
    if (!(p & 1n) || TC.pdeg(p) < 1) return null;
    if (p === 3n) return 1;
    let cur = TC.pmod(2n, p), t = 1;
    while (cur !== 1n) { cur = TC.pmod(cur << 1n, p); t++; if (t > cap) return null; }
    return t;
  };
  TC.isPrimitive = function (p) {
    const d = TC.pdeg(p);
    if (d < 1 || d > 16 || !TC.isIrreducible(p)) return false;
    if (d === 1) return false;
    return TC.order(p) === 2 ** d - 1;
  };

  /* ---------- División con pasos, como en clase ---------- */
  TC.divSteps = function (a, b) {
    const steps = []; const db = TC.pdeg(b); let r = a, q = 0n;
    while (TC.pdeg(r) >= db) {
      const sh = TC.pdeg(r) - db, sub = b << BigInt(sh);
      q ^= 1n << BigInt(sh);
      const nr = r ^ sub;
      steps.push({ cur: r, term: sh, sub, next: nr });
      r = nr;
    }
    return { steps, q, r };
  };

  /* ---------- Álgebra lineal sobre GF(2) (filas como arrays de 0/1) ---------- */
  const rowsToInts = M => M.map(r => TC.vecp(r));
  /* Rango y forma escalonada reducida eligiendo pivotes por el orden de columnas dado */
  function rref(M, colOrder) {
    const A = M.map(r => r.slice()); const piv = []; let row = 0;
    for (const c of colOrder) {
      let p = -1; for (let i = row; i < A.length; i++) if (A[i][c]) { p = i; break; }
      if (p < 0) continue;
      [A[row], A[p]] = [A[p], A[row]];
      for (let i = 0; i < A.length; i++) if (i !== row && A[i][c]) A[i] = A[i].map((x, j) => x ^ A[row][j]);
      piv.push(c); row++;
      if (row === A.length) break;
    }
    return { A, piv, rank: row };
  }
  TC.rank = M => rref(M, M[0].map((_, j) => j)).rank;
  TC.vmat = (v, M) => M[0].map((_, j) => M.reduce((s, row, i) => s ^ (v[i] & row[j]), 0));
  TC.matvecT = (v, H) => H.map(row => row.reduce((s, x, j) => s ^ (x & v[j]), 0));

  /* Ecuaciones "v0=u1+u2" (una por línea o separadas por ;). Si solo dan las de paridad, se añade la identidad al final (P | I_k) */
  TC.parseEquations = function (text) {
    const lines = String(text).split(/\n|;/).map(s => s.trim().toLowerCase().replace(/\s+/g, '')).filter(Boolean);
    if (!lines.length) throw new Error('Escribe las ecuaciones, por ejemplo v0=u1+u2.');
    const eq = {}; let maxU = -1, maxV = -1;
    lines.forEach(l => {
      const m = l.match(/^v(\d+)=(.+)$/);
      if (!m) throw new Error(`No entiendo "${l}". Escribe v0=u1+u2.`);
      const us = m[2].split('+').map(t => { const x = t.match(/^u(\d+)$/); if (!x) throw new Error(`No entiendo "${t}" en "${l}".`); return Number(x[1]); });
      eq[Number(m[1])] = us; maxV = Math.max(maxV, Number(m[1])); us.forEach(u => (maxU = Math.max(maxU, u)));
    });
    const k = maxU + 1; let G;
    const given = maxV + 1;
    // Forma completa de clase: las k últimas ecuaciones son v_{n-k+i} = u_i
    const hasId = given > k && Array.from({ length: k }, (_, i) => eq[given - k + i]).every((us, i) => us && us.length === 1 && us[0] === i);
    if (hasId) G = Array.from({ length: k }, (_, i) => Array.from({ length: given }, (_, j) => ((eq[j] || []).includes(i) ? 1 : 0)));
    else { const m = given; G = Array.from({ length: k }, (_, i) => [...Array.from({ length: m }, (_, j) => ((eq[j] || []).includes(i) ? 1 : 0)), ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]); }
    return G;
  };
  TC.parseG = function (text) {
    const rows = String(text).trim().split(/\n|;|\|/).map(r => r.replace(/[^01]/g, '')).filter(Boolean).map(r => [...r].map(Number));
    if (!rows.length) throw new Error('Escribe la matriz G, una fila por línea.');
    rows.forEach((r, i) => { if (r.length !== rows[0].length) throw new Error(`La fila ${i + 1} tiene otra longitud.`); });
    return rows;
  };

  /* Distribución de pesos enumerando las 2^k palabras (código de Gray) */
  function enumWeights(G) {
    const n = G[0].length, k = G.length; const rows = rowsToInts(G);
    const A = new Array(n + 1).fill(0n); A[0] = 1n;
    let cur = 0n; const tot = 2 ** k;
    for (let i = 1; i < tot; i++) { let b = 0, t = i; while (!(t & 1)) { t >>= 1; b++; } cur ^= rows[b]; A[popc(cur)]++; }
    return A;
  }
  /* MacWilliams: pesos de C a partir de los de su dual */
  function macWilliams(B, n, r) {
    const A = new Array(n + 1).fill(0n); const div = 1n << BigInt(r);
    for (let j = 0; j <= n; j++) {
      let s = 0n;
      for (let i = 0; i <= n; i++) {
        if (!B[i]) continue;
        let K = 0n;
        for (let l = 0; l <= j; l++) { const t = TC.binomB(i, l) * TC.binomB(n - i, j - l); K += l % 2 ? -t : t; }
        s += B[i] * K;
      }
      A[j] = s / div;
    }
    return A;
  }

  /* ---------- Código lineal C(n,k) a partir de G ---------- */
  TC.linear = function (Gin) {
    const k0 = Gin.length, n = Gin[0].length;
    const rank = TC.rank(Gin);
    if (rank !== k0) throw new Error(`Las filas de G no son linealmente independientes (rango ${rank}).`);
    const k = k0, r = n - k;
    if (r <= 0) throw new Error('Hace falta k < n.');
    const order = Array.from({ length: k }, (_, i) => n - k + i).concat(Array.from({ length: r }, (_, i) => i));
    const R = rref(Gin, order);
    const sysRight = R.piv.every((c, i) => c === n - k + i);
    let Gs = null, P = null, H;
    if (sysRight) {
      Gs = R.A; P = Gs.map(row => row.slice(0, r));
      H = Array.from({ length: r }, (_, i) => [...Array.from({ length: r }, (_, j) => (i === j ? 1 : 0)), ...P.map(row => row[i])]);
    } else {
      const piv = R.piv, free = order.filter(c => !piv.includes(c));
      H = free.map(f => { const v = new Array(n).fill(0); v[f] = 1; R.A.forEach((row, i) => { if (row[f]) v[piv[i]] = 1; }); return v; });
    }
    const code = { n, k, r, G: Gin, Gs, P, H, sysRight };
    Object.assign(code, TC.weightInfo(code));
    return code;
  };
  TC.weightInfo = function (c) {
    let A = null, method = null;
    if (c.k <= 18) { A = enumWeights(c.G); method = 'enum'; }
    else if (c.r <= 18) { A = macWilliams(enumWeights(c.H), c.n, c.r); method = 'dual'; }
    let dmin = null;
    if (A) { for (let i = 1; i <= c.n; i++) if (A[i]) { dmin = i; break; } }
    const out = { A, dmin, method };
    if (dmin) { out.smax = dmin - 1; out.tmax = Math.floor((dmin - 1) / 2); out.modes = TC.modes(dmin); }
    return out;
  };
  TC.modes = dmin => { const tm = Math.floor((dmin - 1) / 2); const m = []; for (let t = 0; t <= tm; t++) m.push({ s: dmin - 1 - t, t }); return m; };
  TC.hammingBound = (n, t) => { let s = 0n; for (let i = 0; i <= t; i++) s += TC.binomB(n, i); return s; };
  TC.isPerfect = (n, k, t) => TC.hammingBound(n, t) === 1n << BigInt(n - k);
  TC.encode = (u, G) => TC.vmat(u, G);
  TC.syndrome = (v, H) => TC.matvecT(v, H);
  TC.words = c => { const w = []; for (let i = 0; i < 2 ** c.k; i++) { const u = Array.from({ length: c.k }, (_, j) => (i >> (c.k - 1 - j)) & 1); w.push({ u, v: TC.vmat(u, c.G) }); } return w; };

  /* Tabla de síndromes: los líderes se buscan de menor a mayor peso; dentro de un peso, por posiciones crecientes */
  TC.cosets = function (H, n, cap = 4e6) {
    const r = H.length; if (r > 16) return null;
    const cols = Array.from({ length: n }, (_, j) => H.reduce((acc, row, i) => acc | (row[j] << (r - 1 - i)), 0));
    const total = 2 ** r; const table = new Map(); table.set(0, { pos: [], w: 0, ties: 1 });
    const alpha = new Array(n + 1).fill(0); alpha[0] = 1;
    let w = 0, used = 0;
    while (table.size < total && w < n) {
      w++;
      const fresh = new Map();
      const idx = Array.from({ length: w }, (_, i) => i);
      for (;;) {
        let s = 0; for (const i of idx) s ^= cols[i];
        used++; if (used > cap) return null;
        if (!table.has(s)) { if (!fresh.has(s)) fresh.set(s, { pos: idx.slice(), w, ties: 1 }); else fresh.get(s).ties++; }
        let t = w - 1; while (t >= 0 && idx[t] === n - w + t) t--;
        if (t < 0) break;
        idx[t]++; for (let j = t + 1; j < w; j++) idx[j] = idx[j - 1] + 1;
      }
      fresh.forEach((v, s) => { table.set(s, v); alpha[w]++; });
    }
    const toBits = s => Array.from({ length: r }, (_, i) => (s >> (r - 1 - i)) & 1);
    const rows = [...table.entries()].map(([s, v]) => ({ s: toBits(s), sInt: s, e: Array.from({ length: n }, (_, j) => (v.pos.includes(j) ? 1 : 0)), w: v.w, ties: v.ties }));
    rows.sort((a, b) => a.w - b.w || (TC.vstr(b.e) > TC.vstr(a.e) ? 1 : -1));
    return { rows, alpha, complete: table.size === total };
  };
  TC.decode = function (rv, code, cos) {
    const s = TC.syndrome(rv, code.H);
    const si = s.reduce((a, b) => (a << 1) | b, 0);
    const row = cos.rows.find(x => x.sInt === si);
    const v = rv.map((b, i) => b ^ row.e[i]);
    const u = code.sysRight ? v.slice(code.r) : null;
    return { s, e: row.e, w: row.w, ties: row.ties, v, u };
  };
  /* P(error de corrección) exacta con la distribución de líderes */
  TC.pErrCorr = (alpha, n, p) => 1 - alpha.reduce((acc, a, i) => acc + a * Math.pow(p, i) * Math.pow(1 - p, n - i), 0);

  /* ---------- Código cíclico ---------- */
  TC.cyclic = function (n, g) {
    if (!Number.isInteger(n) || n < 2 || n > 511) throw new Error('n debe ser un entero entre 2 y 511.');
    const dg = TC.pdeg(g);
    if (dg < 1) throw new Error('g(x) debe tener grado mayor o igual que 1.');
    if (dg >= n) throw new Error(`g(x) tiene grado ${dg} y debe ser menor que n = ${n}.`);
    const res = TC.pdivmod(TC.xn1(n), g);
    const isFactor = res.r === 0n;
    const k = n - dg, r = dg;
    const c = { n, k, r, g, dg, isFactor, h: isFactor ? res.q : null, g0: !!(g & 1n) };
    if (!isFactor) return c;
    if (k <= 64) {
      c.G = Array.from({ length: k }, (_, i) => TC.pvec(g << BigInt(i), n));
      c.Gs = Array.from({ length: k }, (_, i) => { const b = TC.pmod(1n << BigInt(r + i), g); return [...TC.pvec(b, r), ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]; });
      c.P = c.Gs.map(row => row.slice(0, r));
      c.H = Array.from({ length: r }, (_, i) => [...Array.from({ length: r }, (_, j) => (i === j ? 1 : 0)), ...c.P.map(row => row[i])]);
      c.sysRight = true;
      Object.assign(c, TC.weightInfo(c));
    } else if (r <= 18) {
      // k grande: H a partir de los restos, y pesos por el dual
      const Hrows = Array.from({ length: r }, () => new Array(n).fill(0));
      for (let j = 0; j < n; j++) { const b = TC.pmod(1n << BigInt(j), g); for (let i = 0; i < r; i++) Hrows[i][j] = Number((b >> BigInt(i)) & 1n); }
      c.H = Hrows; c.sysRight = true;
      Object.assign(c, TC.weightInfo(c));
    }
    const hrec = c.h === null ? null : (function () { let rec = 0n; const d = TC.pdeg(c.h); for (let i = 0; i <= d; i++) if ((c.h >> BigInt(i)) & 1n) rec |= 1n << BigInt(d - i); return rec; })();
    c.hrec = hrec;
    if (k <= 64) c.Hh = Array.from({ length: r }, (_, i) => TC.pvec(hrec << BigInt(i), n));
    const fg = TC.factor(g);
    c.gFactors = fg.factors;
    c.hasXp1 = TC.pmod(g, 3n) === 0n;
    c.primFactor = fg.factors.find(f => TC.pdeg(f) >= 2 && TC.isPrimitive(f) && n <= 2 ** TC.pdeg(f) - 1) || null;
    return c;
  };
  TC.encodeDirect = (u, g) => TC.pmul(u, g);
  TC.encodeSys = function (u, c) {
    const shifted = u << BigInt(c.r);
    const d = TC.pdivmod(shifted, c.g);
    return { v: d.r ^ shifted, b: d.r, shifted, q: d.q };
  };
  /* Rotación cíclica i posiciones: x^i v(x) mod (x^n+1) */
  TC.rotate = (v, i, n) => TC.pmod(v << BigInt(i), TC.xn1(n));
  /* Número de palabras código de grado exacto d */
  TC.wordsOfDegree = (d, n, r) => (d < r || d > n - 1 ? 0n : 1n << BigInt(d - r));
  /* Análisis de un patrón de error */
  TC.analyzeError = function (e, c) {
    const exps = TC.pexps(e); const w = exps.length;
    const low = exps[0], high = exps[w - 1]; const l = high - low + 1;
    const rem = TC.pmod(e, c.g); const detected = rem !== 0n;
    const reasons = [];
    if (c.dmin && w < c.dmin) reasons.push(`peso ${w} menor que d<sub>min</sub> = ${c.dmin}`);
    if (c.hasXp1 && w % 2 === 1) reasons.push(`peso impar y g(x) tiene el factor (1+x)`);
    if (l <= c.r) reasons.push(`ráfaga de longitud ${l} ≤ n−k = ${c.r}`);
    if (c.primFactor && w === 2) reasons.push(`error doble y g(x) tiene un factor primitivo`);
    return { exps, w, low, high, l, rem, detected, reasons, quotient: detected ? null : TC.pdiv(e, c.g) };
  };
  TC.burst = function (n, k, l) {
    const m = n - k;
    const total = l >= 2 ? 2n ** BigInt(l - 2) : 1n;
    if (l <= m) return { total, undet: 0n, frac: 0, m, kind: 'menor' };
    if (l === m + 1) return { total, undet: 1n, frac: 1 / 2 ** (m - 1), m, kind: 'igual' };
    return { total, undet: 2n ** BigInt(l - m - 2), frac: 1 / 2 ** m, m, kind: 'mayor' };
  };

  /* ---------- Circuitos (trazas registro a registro, como en clase) ---------- */
  /* Codificador con n-k etapas basado en g(x): entran u_{k-1}, …, u_0 */
  TC.traceG = function (uBits, g) {
    const r = TC.pdeg(g); let b = new Array(r).fill(0); const rows = [{ inp: '-', regs: b.slice() }];
    for (let i = uBits.length - 1; i >= 0; i--) {
      const fb = uBits[i] ^ b[r - 1]; const nb = new Array(r);
      nb[0] = fb;
      for (let j = 1; j < r; j++) nb[j] = b[j - 1] ^ (Number((g >> BigInt(j)) & 1n) & fb);
      b = nb; rows.push({ inp: String(uBits[i]), regs: b.slice() });
    }
    return { rows, parity: b.slice(), word: [...b, ...uBits] };
  };
  /* Codificador con k etapas basado en h(x): v_{n-k-j} = Σ_{i=0}^{k-1} h_i v_{n-i-j} */
  TC.traceH = function (uBits, h, n) {
    const k = uBits.length, r = n - k; const v = new Array(n).fill(0);
    uBits.forEach((b, i) => { v[r + i] = b; });
    const rows = [{ out: '-', regs: uBits.slice() }];
    for (let j = 1; j <= r; j++) {
      let s = 0; for (let i = 0; i < k; i++) if ((h >> BigInt(i)) & 1n) s ^= v[n - i - j];
      v[r - j] = s;
      rows.push({ out: String(s), regs: v.slice(r - j, r - j + k) });
    }
    return { rows, word: v };
  };
  /* Circuito de síndrome: entran r_{n-1}, …, r_0 */
  TC.traceS = function (rBits, g) {
    const r = TC.pdeg(g); let s = new Array(r).fill(0); const rows = [{ inp: '-', regs: s.slice() }];
    for (let i = rBits.length - 1; i >= 0; i--) {
      const fb = s[r - 1]; const ns = new Array(r);
      ns[0] = rBits[i] ^ fb;
      for (let j = 1; j < r; j++) ns[j] = s[j - 1] ^ (Number((g >> BigInt(j)) & 1n) & fb);
      s = ns; rows.push({ inp: String(rBits[i]), regs: s.slice() });
    }
    return { rows, s: s.slice() };
  };

  /* ---------- Canales ---------- */
  TC.isPermOf = (a, b) => { const x = a.map(String).sort(), y = b.map(String).sort(); return x.length === y.length && x.every((t, i) => t === y[i]); };
  /* Blahut-Arimoto: capacidad de un DMC y distribución de entrada que la alcanza */
  TC.blahut = function (Q, tol = 1e-10, maxIt = 20000) {
    const m = Q.length, n = Q[0].length; let p = new Array(m).fill(1 / m); let C = 0;
    for (let it = 0; it < maxIt; it++) {
      const qy = new Array(n).fill(0);
      for (let j = 0; j < n; j++) for (let i = 0; i < m; i++) qy[j] += p[i] * Q[i][j];
      const D = Q.map(row => row.reduce((s, q, j) => (q > 0 ? s + q * TC.log2(q / qy[j]) : s), 0));
      const IL = TC.log2(p.reduce((s, pi, i) => s + pi * 2 ** D[i], 0));
      const IU = Math.max(...D);
      C = IL;
      p = (function () { const w = p.map((pi, i) => pi * 2 ** D[i]); const t = w.reduce((a, b) => a + b, 0); return w.map(x => x / t); })();
      if (IU - IL < tol) break;
    }
    return { C, p };
  };
  TC.channel = function (Qf) {
    const Q = Qf.map(r => r.map(x => x.num()));
    const m = Q.length, n = Q[0].length;
    Qf.forEach((r, i) => {
      if (r.length !== n) throw new Error(`La fila ${i + 1} tiene otro número de columnas.`);
      const s = r.reduce((a, f) => a + f.num(), 0);
      if (Math.abs(s - 1) > 1e-9) throw new Error(`La fila ${i + 1} suma ${TC.fmt(s, 4)} y debe sumar 1: Q = p(y/x), una fila por símbolo de entrada.`);
    });
    const rowsS = Qf.map(r => r.map(String));
    const rowsPerm = rowsS.every(r => TC.isPermOf(r, rowsS[0]));
    const colsS = rowsS[0].map((_, j) => rowsS.map(r => r[j]));
    const colsPerm = colsS.every(c => TC.isPermOf(c, colsS[0]));
    const colSum = Q[0].map((_, j) => Q.reduce((s, r) => s + r[j], 0));
    const colsEqual = colSum.every(s => Math.abs(s - colSum[0]) < 1e-9);
    const type = rowsPerm && colsPerm ? 'simetrico' : rowsPerm && colsEqual ? 'debil' : 'general';
    const Hfila = TC.H(Q[0]);
    const ba = TC.blahut(Q);
    const C = type === 'general' ? ba.C : TC.log2(n) - Hfila;
    const p = type === 'general' ? ba.p : new Array(m).fill(1 / m);
    const py = Q[0].map((_, j) => p.reduce((s, pi, i) => s + pi * Q[i][j], 0));
    const noOverlap = Q[0].every((_, j) => Q.filter(r => r[j] > 0).length <= 1);
    return { Q, m, n, type, rowsPerm, colsPerm, colsEqual, colSum, Hfila, C, p, py, Hy: TC.H(py), noOverlap };
  };
  TC.bscCascade = (p, times = 2) => { let q = p; for (let i = 1; i < times; i++) q = q * (1 - p) + (1 - q) * p; return q; };
  TC.hartley = (B, snrDb) => B * TC.log2(1 + 10 ** (snrDb / 10));

  /* ---------- FEC y ARQ ---------- */
  TC.seqBits = function (k, n, R, Tas) {
    const Xp = n / R; const frames = Tas / Xp;
    const wt = Math.max(1, Math.ceil(frames));
    return { Xp, frames, wt, rsimple: Math.ceil(TC.log2(wt + 1)), rselect: Math.ceil(TC.log2(2 * wt)) };
  };
  TC.arq = function ({ k, n, p, R, Tas, s, t = 0, A = null }) {
    const m = n - k;
    const RT = R * Tas;
    const pNo = Math.pow(1 - p, n);
    const prtx = TC.sumBin(n, t + 1, s, p);
    const per = TC.sumBin(n, s + 1, n, p);
    const pCorr = t > 0 ? TC.sumBin(n, 1, t, p) : 0;
    const pAllDetect = 1 - pNo;
    let prtxExact = null, perExact = null;
    if (A && t === 0) { perExact = TC.sumA(A, n, p, 1); prtxExact = 1 - pNo - perExact; }
    const P = prtxExact !== null ? prtxExact : prtx;
    const rho = {
      fec: k / n,
      pe: (1 - P) * k / (n + RT),
      rs: (1 - P) * k / (n + RT * P),
      rsel: (1 - P) * k / n
    };
    const cef = { fec: rho.fec * R, pe: rho.pe * R, rs: rho.rs * R, rsel: rho.rsel * R };
    const kopt = Math.sqrt((m + RT) / p);
    return { m, RT, pNo, prtx, per, pCorr, pAllDetect, prtxExact, perExact, P, rho, cef, kopt, Tt: TC.seqBits(k, n, R, Tas) };
  };

  /* ---------- Aleatorios (para ejercicios) ---------- */
  TC.rng = function (seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return (s >>> 0) / 4294967296; }; };
  TC.randInt = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  if (typeof module !== 'undefined' && module.exports) module.exports = TC;
  else root.TC = TC;
})(typeof window !== 'undefined' ? window : globalThis);
