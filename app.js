/* Interfaz: navegación, widgets (calculadoras), práctica, exámenes, teoría. */
(function () {
  'use strict';
  const TC = window.TC, C = window.CONTENT;
  const fmt = TC.fmt, sci = TC.sci;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const store = {
    get(k, d) { try { const v = localStorage.getItem('tinf2:' + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('tinf2:' + k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
  };
  const EXAM_DATE = '2027-01-26'; // segundo parcial: martes 26 de enero de 2027
  let uidN = 0; const uid = p => (p || 'w') + (++uidN);
  const S = String.raw;

  /* ---------- Piezas comunes ---------- */
  const digits = bits => bits.map(b => (b ? '<span class="d1">1</span>' : '0')).join('');
  // Palabra con los r primeros bits (redundancia) sobre fondo tintado
  const cw = (bits, r = 0) => `<span class="cw">${r ? `<span class="red">${digits(bits.slice(0, r))}</span>` : ''}${digits(bits.slice(r))}</span>`;
  const cwFlip = (bits, e) => `<span class="cw">${bits.map((b, i) => (e[i] ? `<span class="flip">${b}</span>` : b ? '<span class="d1">1</span>' : '0')).join('')}</span>`;
  const matBlock = (name, rows, bar = 0) => `<div><span class="nm">${name}</span><div class="matrix">${rows.map(r => `<span class="ln">${bar ? `<span class="red">${digits(r.slice(0, bar))}</span>` : ''}${digits(r.slice(bar))}</span>`).join('')}</div></div>`;
  const kv = items => '<div class="kv">' + items.map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('') + '</div>';
  const tbl = (head, rows, cls = '') => `<div class="tbl-wrap"><table class="${cls}"><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r => `<tr>${r.map(c => (typeof c === 'object' && c !== null && 'h' in c) ? `<td class="${c.c || ''}">${c.h}</td>` : `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const num = (x, d = 4) => ({ h: fmt(x, d), c: 'num' });
  const pill = (txt, k) => `<span class="pill ${k}">${txt}</span>`;
  const errBox = e => `<div class="err">${esc(e.message || e)}</div>`;
  const tx = (x, d = 4) => fmt(x, d).replace(/,/g, '{,}');
  const txs = (x, d = 3) => sci(x, d).replace(/,/g, '{,}').replace(/·10\^(-?\d+)/, S`\cdot 10^{$1}`);
  const pct = (x, d = 2) => fmt(100 * x, d) + ' %';
  const dev = (title, parts) => `<div class="dev"><span class="lbl">${title}</span>${parts.join('')}</div>`;
  const P = t => `<p class="small">${t}</p>`;
  const T = t => S`\(${t}\)`;
  const ptex = (a, d) => T(TC.ptex(a, d));
  const bignum = x => { const s = String(x); return s.length > 15 ? Number(x).toExponential(3).replace('e+', '·10^') : s; };
  const legend = '<div class="legend"><span><i></i>bits de redundancia</span><span>bits de información sin fondo</span></div>';

  function typeset(el) {
    if (window.MathJax && MathJax.typesetPromise) { MathJax.typesetClear && MathJax.typesetClear([el]); MathJax.typesetPromise([el]).catch(() => {}); }
  }
  window.__typeset = () => typeset($('#view'));

  /* ---------- Diagramas ---------- */
  function bloquesSVG() {
    const b = (x, w, t, sub, hl) => `<rect x="${x}" y="34" width="${w}" height="46" rx="6" style="fill:${hl ? 'var(--accent-soft)' : 'var(--surface)'};stroke:${hl ? 'var(--accent)' : 'var(--muted)'};stroke-width:1.5"/><text x="${x + w / 2}" y="62" text-anchor="middle" style="fill:var(--ink);font-size:12.5px">${t}</text>${sub ? `<text x="${x + w / 2}" y="100" text-anchor="middle" style="fill:var(--muted);font-size:11px">${sub}</text>` : ''}`;
    const a = (x1, x2, t) => `<path d="M${x1},57 L${x2 - 2},57" style="stroke:var(--muted);stroke-width:1.5;fill:none" marker-end="url(#ab)"/><text x="${(x1 + x2) / 2}" y="26" text-anchor="middle" style="fill:var(--bit);font-size:12px;font-weight:600">${t}</text>`;
    return `<div class="diagram"><svg viewBox="0 0 700 112" width="700" role="img" aria-label="Fuente, codificador de canal, canal, decodificador y aplicación">
      <defs><marker id="ab" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>
      ${b(6, 80, 'Fuente')}${a(86, 148, 'u · k bits')}${b(148, 92, 'Codificador', 'C(n,k), añade n−k bits', true)}${a(240, 302, 'v · n bits')}${b(302, 96, 'Canal p(y/x)', 'mete el error e', false)}${a(398, 460, 'r = v + e')}${b(460, 100, 'Decodificador', 's = r·Hᵗ', true)}${a(560, 616, 'û')}${b(616, 78, 'Aplicación')}
    </svg></div>`;
  }
  function channelSVG(Q, xl, yl) {
    const m = Q.length, n = Q[0].length; const rows = Math.max(m, n);
    const H = 34 + rows * 46, W = 360; const yx = i => 22 + (H - 44) * (m === 1 ? 0.5 : i / (m - 1)), yy = j => 22 + (H - 44) * (n === 1 ? 0.5 : j / (n - 1));
    const edges = []; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (Q[i][j] > 1e-12) edges.push([i, j, Q[i][j]]);
    const showLbl = edges.length <= 10;
    let out = '';
    edges.forEach(([i, j, q], c) => {
      const x1 = 58, x2 = W - 58, y1 = yx(i), y2 = yy(j); const t = 0.28 + ((c % 3) * 0.12);
      out += `<path d="M${x1},${y1} L${x2},${y2}" style="stroke:var(--accent);fill:none;stroke-width:${(0.8 + q * 2.4).toFixed(2)};stroke-opacity:.75"/>`;
      if (showLbl) { const lx = x1 + (x2 - x1) * t, ly = y1 + (y2 - y1) * t - 3; out += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle" style="fill:var(--bit);font-size:11px;font-weight:600;paint-order:stroke;stroke:var(--surface);stroke-width:3px">${fmt(q, 3)}</text>`; }
    });
    for (let i = 0; i < m; i++) out += `<circle cx="58" cy="${yx(i)}" r="4.5" style="fill:var(--ink)"/><text x="42" y="${yx(i) + 4}" text-anchor="end" style="fill:var(--ink);font-size:13px">${esc(xl ? xl[i] : 'x' + (i + 1))}</text>`;
    for (let j = 0; j < n; j++) out += `<circle cx="${W - 58}" cy="${yy(j)}" r="4.5" style="fill:var(--ink)"/><text x="${W - 42}" y="${yy(j) + 4}" style="fill:var(--ink);font-size:13px">${esc(yl ? yl[j] : 'y' + (j + 1))}</text>`;
    return `<div class="diagram"><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Diagrama de transiciones del canal">${out}</svg></div>`;
  }
  /* Registro de desplazamiento con realimentación: codificador/síndrome con n−k etapas */
  function lfsrSVG(g, kind) {
    const r = TC.pdeg(g); const step = 92, x0 = kind === 's' ? 96 : 60, boxW = 46, y = 92, top = 34;
    const W = x0 + r * step + 150, H = 150;
    const name = i => (kind === 's' ? 's' : 'b') + i; let out = '';
    const stroke = 'style="stroke:var(--muted);stroke-width:1.5;fill:none"';
    const xor = (x, yy) => `<circle cx="${x}" cy="${yy}" r="9" style="fill:var(--surface);stroke:var(--accent);stroke-width:1.5"/><path d="M${x - 5},${yy} H${x + 5} M${x},${yy - 5} V${yy + 5}" style="stroke:var(--accent);stroke-width:1.5"/>`;
    for (let i = 0; i < r; i++) {
      const bx = x0 + i * step;
      out += `<rect x="${bx}" y="${y - 17}" width="${boxW}" height="34" rx="4" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/><text x="${bx + boxW / 2}" y="${y + 5}" text-anchor="middle" style="fill:var(--ink);font-size:13px">${name(i)}</text>`;
      if (i < r - 1) {
        const nx = bx + step, hasTap = (g >> BigInt(i + 1)) & 1n, xc = bx + boxW + (step - boxW) / 2;
        if (hasTap) {
          out += `<path d="M${bx + boxW},${y} H${xc - 9} M${xc + 9},${y} H${nx - 2}" ${stroke} marker-end="url(#ac)"/>` + xor(xc, y);
          out += `<path d="M${xc},${top} V${y - 11}" ${stroke} marker-end="url(#ac)"/><text x="${xc + 6}" y="${top + 24}" style="fill:var(--bit);font-size:11.5px;font-weight:600">g${i + 1}</text>`;
        } else out += `<path d="M${bx + boxW},${y} H${nx - 2}" ${stroke} marker-end="url(#ac)"/>`;
      }
    }
    const end = x0 + r * step - (step - boxW);
    if (kind === 's') {
      const xc = x0 - 28;
      out += `<path d="M6,${y} H${xc - 9}" ${stroke} marker-end="url(#ac)"/><text x="8" y="${y - 8}" style="fill:var(--ink);font-size:12px">r</text>` + xor(xc, y);
      out += `<path d="M${xc + 9},${y} H${x0 - 2}" ${stroke} marker-end="url(#ac)"/>`;
      out += `<path d="M${end},${y} H${end + 30} V${top} H${xc} V${y - 11}" ${stroke} marker-end="url(#ac)"/>`;
      out += `<text x="${end + 38}" y="${y + 4}" style="fill:var(--muted);font-size:11.5px">al final,</text><text x="${end + 38}" y="${y + 19}" style="fill:var(--muted);font-size:11.5px">registros = s(x)</text>`;
    } else {
      const xc = end + 36;
      out += `<path d="M${end},${y} H${xc - 9}" ${stroke} marker-end="url(#ac)"/>` + xor(xc, y);
      out += `<path d="M${xc},${y + 44} V${y + 11}" ${stroke} marker-end="url(#ac)"/><text x="${xc + 7}" y="${y + 44}" style="fill:var(--ink);font-size:12px">u</text>`;
      out += `<path d="M${xc},${y - 11} V${top} H${x0 - 22} V${y} H${x0 - 2}" ${stroke} marker-end="url(#ac)"/>`;
      out += `<rect x="${(x0 + xc) / 2 - 24}" y="${top - 11}" width="48" height="22" rx="4" style="fill:var(--accent-soft);stroke:var(--accent)"/><text x="${(x0 + xc) / 2}" y="${top + 4}" text-anchor="middle" style="fill:var(--accent);font-size:11px">puerta</text>`;
      out += `<text x="${xc + 18}" y="${y - 6}" style="fill:var(--muted);font-size:11.5px">k pulsos: entra u</text><text x="${xc + 18}" y="${y + 9}" style="fill:var(--muted);font-size:11.5px">n−k pulsos: sale b</text>`;
    }
    return `<div class="diagram"><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Registro de desplazamiento con ${r} etapas"><defs><marker id="ac" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>${out}</svg></div>`;
  }
  /* Codificador con k etapas, basado en h(x) */
  function hSVG(h, k) {
    const step = 76, x0 = 60, y = 96, top = 36, boxW = 46; const W = x0 + k * step + 120, H = 136; let out = '';
    const stroke = 'style="stroke:var(--muted);stroke-width:1.5;fill:none"';
    for (let i = 0; i < k; i++) {
      const bx = x0 + i * step; // la etapa más a la derecha guarda h_0
      out += `<rect x="${bx}" y="${y - 17}" width="${boxW}" height="34" rx="4" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.5"/><text x="${bx + boxW / 2}" y="${y + 5}" text-anchor="middle" style="fill:var(--ink);font-size:12px">r${k - 1 - i}</text>`;
      if (i < k - 1) out += `<path d="M${bx + boxW},${y} H${bx + step - 2}" ${stroke} marker-end="url(#ad)"/>`;
      const hi = k - 1 - i; // coeficiente h_i
      if ((h >> BigInt(hi)) & 1n) {
        const x = bx + boxW / 2;
        out += `<path d="M${x},${y - 17} V${top + 9}" ${stroke} marker-end="url(#ad)"/><circle cx="${x}" cy="${top}" r="9" style="fill:var(--surface);stroke:var(--accent);stroke-width:1.5"/><path d="M${x - 5},${top} H${x + 5} M${x},${top - 5} V${top + 5}" style="stroke:var(--accent);stroke-width:1.5"/><text x="${x + 6}" y="${y - 28}" style="fill:var(--bit);font-size:11.5px;font-weight:600">h${hi}</text>`;
      }
    }
    const end = x0 + (k - 1) * step + boxW;
    out += `<path d="M${end + 30},${top} H${x0 - 22} V${y} H${x0 - 2}" ${stroke} marker-end="url(#ad)"/><path d="M${end},${y} H${end + 54}" ${stroke} marker-end="url(#ad)"/><text x="${end + 8}" y="${y + 22}" style="fill:var(--muted);font-size:11.5px">al canal</text>`;
    return `<div class="diagram"><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Codificador con ${k} etapas basado en h(x)"><defs><marker id="ad" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--muted)"/></marker></defs>${out}</svg></div>`;
  }
  /* Cronograma de las técnicas ARQ: la trama 2 llega con error */
  function arqSVG(kind) {
    const u = 58, x0 = 30, yE = 34, yR = 124, Tas = 1.5, prop = 0.6; const seq = [];
    if (kind === 'pe') { let t = 0; [[1, 0], [2, 1], [2, 0], [3, 0], [4, 0]].forEach(([id, bad]) => { seq.push({ id, t, bad }); t += 1 + Tas; }); }
    // El NAK llega durante la trama 4: se termina de enviar y se repite después
    else if (kind === 'rs') { [[1, 0, 0], [2, 1, 1], [3, 2, 0], [4, 3, 0], [2, 4, 0], [3, 5, 0], [4, 6, 0], [5, 7, 0]].forEach(([id, t, bad]) => seq.push({ id, t, bad, drop: t > 1 && t < 4 })); }
    else { [[1, 0, 0], [2, 1, 1], [3, 2, 0], [4, 3, 0], [2, 4, 0], [5, 5, 0], [6, 6, 0], [7, 7, 0]].forEach(([id, t, bad]) => seq.push({ id, t, bad })); }
    const tmax = Math.max(...seq.map(s => s.t)) + 1 + prop + 0.3;
    const W = Math.ceil(x0 + tmax * u + 20), H = 164;
    const X = t => x0 + t * u; let out = '';
    out += `<path d="M${x0},${yE} H${W - 6}" style="stroke:var(--ink);stroke-width:1.5"/><path d="M${x0},${yR} H${W - 6}" style="stroke:var(--ink);stroke-width:1.5"/><text x="6" y="${yE + 4}" style="fill:var(--ink);font-size:13px;font-weight:600">E</text><text x="6" y="${yR + 4}" style="fill:var(--ink);font-size:13px;font-weight:600">R</text>`;
    seq.forEach(s => {
      const col = s.bad ? 'var(--bad)' : s.drop ? 'var(--muted)' : 'var(--accent)';
      out += `<rect x="${X(s.t) + 1}" y="${yE - 20}" width="${u - 2}" height="20" rx="2" style="fill:var(--surface);stroke:${col};stroke-width:1.5"/><text x="${X(s.t) + u / 2}" y="${yE - 5}" text-anchor="middle" style="fill:${col};font-size:12px;font-weight:600">${s.id}</text>`;
      out += `<path d="M${X(s.t) + 1},${yE} L${X(s.t + prop) + 1},${yR} L${X(s.t + 1 + prop) - 1},${yR} L${X(s.t + 1) - 1},${yE} Z" style="fill:${col};fill-opacity:.1;stroke:${col};stroke-opacity:.5"/>`;
      const rx = X(s.t + prop + 0.5);
      if (s.bad) out += `<text x="${rx}" y="${yR + 18}" text-anchor="middle" style="fill:var(--bad);font-size:11.5px;font-weight:600">s≠0</text>`;
      else if (s.drop) out += `<text x="${rx}" y="${yR + 18}" text-anchor="middle" style="fill:var(--muted);font-size:11px">se tira</text>`;
      else if (kind === 'rsel' && s.t > 1 && s.t < 4) out += `<text x="${rx}" y="${yR + 18}" text-anchor="middle" style="fill:var(--accent);font-size:11px">buffer</text>`;
      else out += `<text x="${rx}" y="${yR + 18}" text-anchor="middle" style="fill:var(--good);font-size:11px">aplic.</text>`;
      if (kind === 'pe') { const a0 = s.t + 1 + prop; const a1 = s.t + 1 + Tas; out += `<path d="M${X(a0)},${yR} L${X(a1)},${yE}" style="stroke:${s.bad ? 'var(--bad)' : 'var(--muted)'};stroke-width:1.2;stroke-dasharray:3 3"/><text x="${X((a0 + a1) / 2) + 16}" y="${(yE + yR) / 2}" style="fill:${s.bad ? 'var(--bad)' : 'var(--muted)'};font-size:10.5px">${s.bad ? 'NAK' : 'ACK'}</text>`; }
    });
    if (kind !== 'pe') { const bad = seq.find(s => s.bad); const a0 = bad.t + 1 + prop; const a1 = bad.t + 1 + Tas; out += `<path d="M${X(a0)},${yR} L${X(a1)},${yE}" style="stroke:var(--bad);stroke-width:1.5;stroke-dasharray:4 3"/><text x="${X((a0 + a1) / 2) + 18}" y="${(yE + yR) / 2}" style="fill:var(--bad);font-size:11px;font-weight:600">NAK</text>`; }
    return `<div class="diagram"><svg viewBox="0 0 ${W} ${H}" width="${W}" role="img" aria-label="Cronograma ARQ cuando la trama 2 llega con error">${out}</svg></div>`;
  }

  /* ---------- Renderizadores (puros: estado → HTML) ---------- */
  const R = {};

  R.canal = st => {
    const fr = TC.parseMatrix(st.matrix);
    const ch = TC.channel(fr);
    const lg = n => S`\log_2 ${n}`;
    const types = { simetrico: ['Simétrico', 'ok'], debil: ['Débilmente simétrico', 'info'], general: ['Sin fórmula directa', 'mid'] };
    const tests = `<div class="row">${pill(types[ch.type][0], types[ch.type][1])}<span class="small">Filas permutación unas de otras: <b>${ch.rowsPerm ? 'sí' : 'no'}</b>. Columnas permutación: <b>${ch.colsPerm ? 'sí' : 'no'}</b>. Columnas suman igual: <b>${ch.colsEqual ? 'sí' : 'no'}</b>.</span></div>`;
    let d;
    if (ch.type !== 'general') {
      d = dev('Desarrollo', [P(S`Las filas son permutaciones, así que \(H(Y/X)=\sum p(x)H(Y/X=x)=H(\text{fila})\) sea cual sea \(p(x)\). Solo queda maximizar \(H(Y)\). Con entrada uniforme la salida también es uniforme y \(H(Y)=\log|\mathcal Y|\):`),
        S`\[ C=\log_2|\mathcal Y|-H(\text{fila})=${lg(ch.n)}-H(${Q2t(fr[0])})=${tx(TC.log2(ch.n))}-${tx(ch.Hfila)}=\mathbf{${tx(ch.C)}}\ \text{bits/uso} \]`]);
    } else {
      d = dev('Desarrollo', [P(S`Las filas no son todas permutaciones, o las columnas no suman igual, así que no vale \(\log|\mathcal Y|-H(\text{fila})\). Hay que escribir \(I(X;Y)=H(Y)-H(Y/X)\) en función de \(p(x)\) y maximizar a mano. Esta calculadora lo resuelve numéricamente con Blahut-Arimoto para que compruebes tu resultado:`),
        S`\[ C=\max_{p(x)}I(X;Y)=\mathbf{${tx(ch.C)}}\ \text{bits/uso}\quad\text{con } p(x)=(${ch.p.map(x => tx(x, 3)).join(';\ ')}) \]`,
        ch.noOverlap ? P(S`Las salidas no se solapan: \(H(X/Y)=0\), así que \(C=\max H(X)\).`) : '']);
    }
    return (ch.n <= 8 && ch.m <= 8 ? channelSVG(ch.Q) : '') + tests + kv([['C (bits/uso)', fmt(ch.C, 4)], ['p(x) óptima', ch.p.map(x => fmt(x, 3)).join(' ; ')], ['p(y) resultante', ch.py.map(x => fmt(x, 3)).join(' ; ')], ['H(Y) con esa p(x)', fmt(ch.Hy, 4)]]) + d;
  };
  const Q2t = row => row.map(f => { const s = f.toString(); if (!s.includes('/')) return tx(f.num(), 4); const [a, b] = s.split('/'); return S`\tfrac{${a}}{${b}}`; }).join(',\ ');

  R.bsc = st => {
    const p = TC.Frac.parse(st.p).num(); const times = Math.max(1, parseInt(st.times || '1', 10));
    if (p < 0 || p > 1) throw new Error('p debe estar entre 0 y 1.');
    const pe = TC.bscCascade(p, times); const C_ = 1 - TC.h2(pe);
    const v = st.v ? TC.Frac.parse(st.v).num() : null;
    const Q = [[1 - pe, pe], [pe, 1 - pe]];
    const ps = times > 1 ? "p'" : 'p';
    const hFormula = S`H(${ps})=-${ps}\log_2 ${ps}-(1-${ps})\log_2(1-${ps})`;
    const hTerm = x => -x * TC.log2(x);
    const hDev = pe > 0 && pe < 1
      ? S`\[ ${hFormula} \]` + S`\[ H(${ps})=-${tx(pe)}\log_2 ${tx(pe)}-${tx(1 - pe)}\log_2 ${tx(1 - pe)} \]` + S`\[ H(${ps})=${tx(hTerm(pe))}+${tx(hTerm(1 - pe))}=\mathbf{${tx(TC.h2(pe))}}\ \text{bits} \]`
      : S`\[ ${hFormula}=\mathbf{0}\ \text{bits}\quad (\text{con } 0\log_2 0=0) \]`;
    return channelSVG(Q, ['0', '1'], ['0', '1']) + kv([[times > 1 ? `p equivalente (${times} BSC)` : 'p', fmt(pe, 5)], ['H(p)', fmt(TC.h2(pe), 4)], ['C (bits/uso)', fmt(C_, 4)], ...(v ? [['V = C·v (bit/s)', fmt(C_ * v, 1)]] : [])]) +
      dev('Desarrollo', [times > 1 ? P(S`Dos BSC en cascada: el bit sale mal si falla exactamente uno. \(p'=2p(1-p)\); sale bien con \((1-p)^2+p^2\). La cascada sigue siendo un BSC.`) : '',
        hDev,
        S`\[ C=1-H(p)=1-H(${tx(pe, 4)})=1-${tx(TC.h2(pe))}=\mathbf{${tx(C_)}}\ \text{bits/uso con } p(x)=(\tfrac12,\tfrac12) \]`]);
  };
  R.bec = st => {
    const a = TC.Frac.parse(st.a).num(); if (a < 0 || a > 1) throw new Error('α debe estar entre 0 y 1.');
    const p = st.px ? TC.Frac.parse(st.px).num() : 0.5;
    const Hy = TC.h2(a) + (1 - a) * TC.h2(p); const I = Hy - TC.h2(a);
    return channelSVG([[1 - a, a, 0], [0, a, 1 - a]], ['0', '1'], ['0', 'e', '1']) + kv([['C = 1−α', fmt(1 - a, 4)], ['H(Y/X) = H(α)', fmt(TC.h2(a), 4)], [`H(Y) con P(X=0)=${fmt(p, 3)}`, fmt(Hy, 4)], ['I(X;Y) con esa p', fmt(I, 4)]]) +
      dev('Desarrollo', [P(S`Agrupando: \(H(Y)=H(\alpha)+(1-\alpha)H(p)\), con \(p=P(X=0)\). Entonces \(I(X;Y)=H(Y)-H(\alpha)=(1-\alpha)H(p)\), máxima con \(p=\tfrac12\).`), S`\[ C=\max_p (1-\alpha)H(p)=1-\alpha=\mathbf{${tx(1 - a)}}\ \text{bits/uso} \]`]);
  };
  R.hartley = st => {
    const B = TC.Frac.parse(st.b).num(), db = TC.Frac.parse(st.snr).num(); const lin = 10 ** (db / 10); const c = TC.hartley(B, db);
    return kv([['S/N lineal', fmt(lin, 2)], ['C (bit/s)', fmt(c, 0)], ['C/B (bit/s/Hz)', fmt(c / B, 3)]]) + dev('Desarrollo', [S`\[ \frac SN=10^{${tx(db, 2)}/10}=${tx(lin, 2)},\quad C=B\log_2\!\left(1+\frac SN\right)=${tx(B, 0)}\cdot\log_2(${tx(1 + lin, 2)})=\mathbf{${tx(c, 0)}}\ \text{bit/s} \]`]);
  };

  /* Bloque común de distancia, modos y perfección */
  function codeSummary(c) {
    if (!c.dmin) return '<p class="note">Este código es demasiado grande para enumerar sus palabras (k y n−k por encima de 18).</p>';
    const bound = TC.hammingBound(c.n, c.tmax); const perf = bound === 1n << BigInt(c.r);
    const rows = c.A.map((a, i) => (a ? [i, bignum(a)] : null)).filter(Boolean);
    const shown = rows.length <= 14 ? rows : rows.slice(0, 12);
    return kv([['n, k, n−k', `${c.n}, ${c.k}, ${c.r}`], ['Tasa k/n', fmt(c.k / c.n, 4)], ['dmin', c.dmin], ['s máx = dmin−1', c.smax], ['t máx = ⌊(dmin−1)/2⌋', c.tmax], ['Σ C(n,i), i≤t', bignum(bound)], ['2^(n−k) líderes', bignum(1n << BigInt(c.r))], ['¿Perfecto?', perf ? 'sí' : 'no']]) +
      `<div class="row"><span class="small"><b>Modos (dmin = s+t+1):</b></span>${c.modes.map(m => pill(`s=${m.s}, t=${m.t}`, m.t === 0 ? 'info' : m.t === c.tmax ? 'ok' : 'mid')).join('')}</div>` +
      `<p class="small"><b>Distribución de pesos</b>${c.method === 'dual' ? ' (calculada desde el código dual con MacWilliams)' : ''}: ${shown.map(([i, a]) => `A<sub>${i}</sub>=${a}`).join(', ')}${rows.length > shown.length ? '…' : ''}</p>`;
  }

  R.lineal = st => {
    const G = st.mode === 'g' ? TC.parseG(st.text) : TC.parseEquations(st.text);
    const c = TC.linear(G);
    let out = legend + '<div class="mats">' + matBlock(`G (${c.k}×${c.n})`, G, c.sysRight && same(G, c.Gs) ? c.r : 0);
    if (c.Gs && !same(G, c.Gs)) out += matBlock('Gs = (P | I)', c.Gs, c.r);
    out += matBlock(`H (${c.r}×${c.n}) = (I | Pᵗ)`, c.H) + '</div>';
    out += codeSummary(c);
    if (c.k <= 5) out += `<details><summary>Las ${2 ** c.k} palabras código</summary><div class="body">${tbl(['u', 'v = u·G', 'peso'], TC.words(c).map(w => [cw(w.u), cw(w.v, c.sysRight ? c.r : 0), w.v.reduce((a, b) => a + b, 0)]))}</div></details>`;
    const cos = c.r <= 12 ? TC.cosets(c.H, c.n) : null;
    if (cos && c.r <= 6) out += `<details ${c.r <= 4 ? 'open' : ''}><summary>Tabla de corrección: ${2 ** c.r} síndromes</summary><div class="body">${tbl(['síndrome s', 'líder e', 'peso'], cos.rows.map(x => [cw(x.s), cw(x.e) + (x.ties > 1 ? ` <span class="small muted">empata con ${x.ties - 1} más</span>` : ''), x.w]))}<p class="small">Líderes por peso: ${cos.alpha.map((a, i) => (a ? `α<sub>${i}</sub>=${a}` : '')).filter(Boolean).join(', ')}.</p></div></details>`;
    if (st.r && st.r.trim() && cos) {
      const r = TC.parseBits(st.r, c.n); const d = TC.decode(r, c, cos);
      out += dev('Decodificar la palabra recibida', [`<p class="small">r = ${cw(r)} → s = r·Hᵗ = ${cw(d.s)}${d.s.some(Boolean) ? '' : ' (nulo: r es palabra código)'}.</p>`, `<p class="small">Líder con ese síndrome: ê = ${cw(d.e)}${d.ties > 1 ? ` <span class="pill mid">hay ${d.ties} empates de peso ${d.w}: la elección es arbitraria</span>` : ''}.</p>`, `<p class="small">v̂ = r + ê = ${cwFlip(d.v, d.e)}${d.u ? ` → û = ${cw(d.u)}` : ''}.</p>`]);
    }
    if (st.p && st.p.trim() && c.A) {
      const p = TC.Frac.parse(st.p).num();
      const pnd = TC.sumA(c.A, c.n, p, 1);
      out += dev(`Probabilidades con p = ${fmt(p, 6)}`, [
        S`\[ P_{ND}=\sum_{i=d_{min}}^{n}A_i\,p^i(1-p)^{n-i}=${txs(pnd, 4)} \]`,
        cos ? S`\[ P_{\text{error corr}}=1-\sum_{i}\alpha_i\,p^i(1-p)^{n-i}=${txs(TC.pErrCorr(cos.alpha, c.n, p), 4)} \]` : '']);
    }
    return out;
  };
  const same = (A, B) => A && B && A.length === B.length && A.every((r, i) => r.join('') === B[i].join(''));

  R.ciclico = st => {
    const n = parseInt(st.n, 10); const g = TC.parsePoly(st.g);
    const c = TC.cyclic(n, g);
    let out = `<p>g(x) = ${ptex(g)}, grado ${c.dg}.</p>`;
    if (!c.g0) return out + `<div class="err">g(x) debe tener término independiente 1 (teorema de clase: g₀ = 1).</div>`;
    if (!c.isFactor) {
      const r = TC.pmod(TC.xn1(n), g);
      return out + `<div class="err">g(x) no es factor de x<sup>${n}</sup>+1: el resto de la división es ${ptex(r)}. No genera ningún código cíclico de longitud ${n}.</div>`;
    }
    out += kv([['h(x) = (xⁿ+1)/g(x)', 'grado ' + c.k], ['Etapas basado en g(x)', c.r], ['Etapas basado en h(x)', c.k], ['Mejor circuito', c.r <= c.k ? 'g(x)' : 'h(x)']]);
    out += `<p class="small">h(x) = ${ptex(c.h)}</p>`;
    out += `<p class="small">Factores de g(x): ${c.gFactors.map(f => `(${ptex(f)})`).join(' ')}.</p>`;
    out += codeSummary(c);
    out += `<div class="tbl-wrap"><table class="text"><tr><th>Garantías de detección</th><th></th></tr>
      <tr><td>Errores simples</td><td>Todos (g(x) ≠ 1)</td></tr>
      <tr><td>Errores de peso impar</td><td>${c.hasXp1 ? 'Todos: g(x) tiene el factor (1+x)' : 'No garantizado: g(x) no tiene el factor (1+x)'}</td></tr>
      <tr><td>Errores dobles</td><td>${c.primFactor ? `Todos: factor primitivo ${ptex(c.primFactor)} y n ≤ 2<sup>${TC.pdeg(c.primFactor)}</sup>−1` : c.dmin && c.dmin > 2 ? `Todos, porque d<sub>min</sub> = ${c.dmin} &gt; 2` : 'No garantizado'}</td></tr>
      <tr><td>Ráfagas l ≤ ${c.r}</td><td>Todas</td></tr>
      <tr><td>Ráfagas l = ${c.r + 1}</td><td>Todas menos una por posición, xⁱ·g(x); fracción 1/2<sup>${c.r - 1}</sup></td></tr>
      <tr><td>Ráfagas l &gt; ${c.r + 1}</td><td>Fracción indetectable 1/2<sup>${c.r}</sup></td></tr></table></div>`;
    if (c.G && c.n <= 40) out += legend + `<div class="mats">${matBlock('G', c.G)}${matBlock('Gs = (P | I)', c.Gs, c.r)}${matBlock('H = (I | Pᵗ)', c.H)}</div>`;
    if (st.u && st.u.trim()) {
      const u = TC.parsePoly(st.u);
      if (TC.pdeg(u) >= c.k) throw new Error(`u(x) debe tener grado menor que k = ${c.k}.`);
      const e = TC.encodeSys(u, c); const vb = TC.pvec(e.v, n);
      out += dev('Codificación sistemática de u(x)', [S`\[ x^{n-k}u(x)=${TC.ptex(e.shifted, true)},\quad b(x)=\text{resto}\frac{x^{n-k}u(x)}{g(x)}=${TC.ptex(e.b, true)} \]`, S`\[ v(x)=b(x)+x^{n-k}u(x)=${TC.ptex(e.v)} \]`, `<p class="small">v = ${cw(vb, c.r)}</p>`, P(`Directa: v(x) = u(x)·g(x) = ${T(TC.ptex(TC.encodeDirect(u, g)))} (también es palabra código, pero no es sistemática).`)]);
    }
    if (st.e && st.e.trim()) {
      const rows = st.e.split(/\n|;/).map(s => s.trim()).filter(Boolean).map(line => {
        const e = TC.parsePoly(line); const a = TC.analyzeError(e, c);
        return [ptex(e), a.w, a.l, a.detected ? pill('se detecta', 'ok') : pill('no se detecta', 'no'), a.detected ? (a.reasons.join('; ') || `resto de e(x)/g(x) = ${ptex(a.rem)} ≠ 0`) : `e(x) = (${T(TC.ptex(a.quotient))})·g(x): es palabra código`];
      });
      out += `<h4>Patrones de error</h4>` + tbl(['e(x)', 'peso', 'ráfaga l', '', 'por qué'], rows, 'text');
    }
    return out;
  };

  R.factor = st => {
    const n = parseInt(st.n, 10);
    if (!Number.isInteger(n) || n < 2 || n > 255) throw new Error('Escribe un n entre 2 y 255.');
    const f = TC.factor(TC.xn1(n));
    const L = f.factors.length;
    const degs = new Set([0]); f.factors.forEach(q => { [...degs].forEach(d => degs.add(d + TC.pdeg(q))); });
    const opts = [...degs].filter(d => d > 0 && d < n).sort((a, b) => a - b);
    const repeated = new Set(f.factors.map(String)).size !== L;
    return `<p>x<sup>${n}</sup> + 1 = ${f.factors.map(q => `(${ptex(q)})`).join(' ')}</p>` + (f.partial ? '<p class="note">Queda un factor de grado alto sin separar.</p>' : '') +
      kv([['Factores L', L], ['Códigos cíclicos 2ᴸ−2', repeated ? 'menos (hay factores repetidos)' : bignum(2 ** L - 2)], ['n−k posibles', opts.length]]) +
      tbl(['Factor', 'grado', '¿primitivo?', 'solo este factor da'], f.factors.map(q => { const d = TC.pdeg(q); return [ptex(q), d, d >= 2 && d <= 16 ? (TC.isPrimitive(q) ? pill('sí', 'ok') + (2 ** d - 1 === n ? ' Hamming' : '') : 'no') : '—', `C(${n},${n - d})`]; })) +
      `<p class="small"><b>Valores posibles de n−k</b> (grados de g(x), sumando factores): ${opts.join(', ')}.</p>`;
  };

  R.division = st => {
    const a = TC.parsePoly(st.a), b = TC.parsePoly(st.b); if (b === 0n) throw new Error('El divisor no puede ser 0.');
    const d = TC.divSteps(a, b);
    return `<div class="steps-div">${d.steps.map((s, i) => `<div class="dev"><span class="lbl">Paso ${i + 1}</span><p class="small">Tomo ${T(TC.ptex(1n << BigInt(s.term)))} y sumo ${T(TC.ptex(1n << BigInt(s.term)))}·g(x) = ${ptex(s.sub, true)}. Queda ${ptex(s.next, true)}.</p></div>`).join('') || '<p class="small">El grado del dividendo ya es menor que el del divisor: el resto es el propio dividendo.</p>'}</div>` +
      kv([['Cociente', `<span style="font-weight:400">${ptex(d.q, true)}</span>`], ['Resto', `<span style="font-weight:400">${ptex(d.r, true)}</span>`], ['¿Divisible?', d.r === 0n ? 'sí' : 'no']]);
  };

  R.circuito = st => {
    const kind = st.kind || 'g', g = TC.parsePoly(st.g), n = parseInt(st.n, 10);
    const c = TC.cyclic(n, g); if (!c.isFactor) throw new Error(`g(x) no es factor de x^${n}+1.`);
    if (kind === 's') {
      const r = TC.parseBits(st.bits, n); const t = TC.traceS(r, g);
      return lfsrSVG(g, 's') + `<p class="small">Entran r<sub>${n - 1}</sub>, …, r<sub>0</sub>, el bit de mayor grado primero. Tras ${n} pulsos los registros guardan s(x) = resto de r(x)/g(x).</p>` +
        tbl(['Entrada', ...t.rows[0].regs.map((_, i) => 's' + i)], t.rows.map(x => [x.inp, ...x.regs])) + `<p>s = ${cw(t.s)} ${t.s.some(Boolean) ? pill('r no es palabra código', 'no') : pill('r es palabra código', 'ok')}</p>`;
    }
    const u = TC.parseBits(st.bits, c.k);
    if (kind === 'g') {
      const t = TC.traceG(u, g);
      return lfsrSVG(g, 'g') + `<p class="small">${c.r} etapas. Entran u<sub>${c.k - 1}</sub>, …, u<sub>0</sub> con la puerta abierta; luego se cierra y salen los registros, que guardan b(x).</p>` +
        tbl(['Entrada', ...t.rows[0].regs.map((_, i) => 'b' + i)], t.rows.map(x => [x.inp, ...x.regs])) + `<p>v = ${cw(t.word, c.r)}</p>`;
    }
    const t = TC.traceH(u, c.h, n);
    return hSVG(c.h, c.k) + `<p class="small">${c.k} etapas: se cargan los k bits de u y cada pulso calcula un bit de paridad con v<sub>n−k−j</sub> = Σ h<sub>i</sub>·v<sub>n−i−j</sub>.</p>` +
      tbl(['Paridad calculada', ...t.rows[0].regs.map((_, i) => 'r' + i)], t.rows.map(x => [x.out, ...x.regs])) + `<p>v = ${cw(t.word, c.r)}</p>`;
  };

  R.rafaga = st => {
    const n = parseInt(st.n, 10), k = parseInt(st.k, 10), l = parseInt(st.l, 10);
    if (!(k > 0 && k < n) || !(l >= 1 && l <= n)) throw new Error('Hace falta 0 < k < n y 1 ≤ l ≤ n.');
    const b = TC.burst(n, k, l);
    const why = { menor: `l ≤ n−k: la ráfaga tiene grado menor que g(x), así que no puede ser múltiplo de g(x).`, igual: `l = n−k+1: la única ráfaga indetectable es g(x) en esa posición.`, mayor: `l > n−k+1: B(x) = a(x)·g(x), con a(x) de grado l−1−(n−k), con sus extremos a 1.` }[b.kind];
    return kv([['n−k', b.m], ['Ráfagas de longitud l (por posición)', bignum(b.total)], ['Indetectables', bignum(b.undet)], ['Fracción indetectable', b.frac ? `1/${2 ** Math.round(-TC.log2(b.frac))}` : '0']]) + `<p class="small">${why}</p>` +
      (b.kind === 'mayor' ? dev('Cuenta', [S`\[ \frac{2^{\,l-(n-k)-2}}{2^{\,l-2}}=\frac{2^{${l - b.m - 2}}}{2^{${l - 2}}}=\frac1{2^{${b.m}}} \]`]) : '');
  };

  R.arq = st => {
    const k = parseInt(st.k, 10), n = parseInt(st.n, 10); const p = TC.Frac.parse(st.p).num(), Rb = TC.Frac.parse(st.r).num(), Tas = TC.Frac.parse(st.tas).num();
    if (!(k > 0 && n > k)) throw new Error('Hace falta n > k > 0.');
    const dmin = st.dmin && st.dmin.trim() ? parseInt(st.dmin, 10) : null;
    const tMax = dmin ? Math.floor((dmin - 1) / 2) : 0;
    const t = dmin ? Math.min(parseInt(st.t || '0', 10) || 0, tMax) : 0;
    const s = dmin ? dmin - 1 - t : n;
    const a = TC.arq({ k, n, p, R: Rb, Tas, s, t });
    const seq = TC.seqBits(k, n, Rb, Tas);
    const rows = [
      ['FEC (corrección pura)', '—', num(a.rho.fec * 100, 2), fmt(a.cef.fec, 0)],
      ['ARQ parada y espera', sci(a.prtx), num(a.rho.pe * 100, 2), fmt(a.cef.pe, 0)],
      ['ARQ envío continuo, rechazo simple', sci(a.prtx), num(a.rho.rs * 100, 2), fmt(a.cef.rs, 0)],
      ['ARQ envío continuo, rechazo selectivo', sci(a.prtx), num(a.rho.rsel * 100, 2), fmt(a.cef.rsel, 0)]
    ];
    const rsk = k - seq.rsimple, rselk = k - seq.rselect;
    return kv([['m = n−k', a.m], ['Xp = n/R (s)', sci(seq.Xp)], ['R·Tas (bits)', fmt(a.RT, 2)], ['Modo', dmin ? `s=${s}, t=${t}` : 'detecta todo'], ['P(no error) = (1−p)ⁿ', fmt(a.pNo, 6)], ['P(error en bloque)', sci(a.pAllDetect)], ['P_RTX', sci(a.prtx)], ['P_ER', dmin ? sci(a.per) : 'hace falta dmin'], ...(t > 0 ? [['P(corregir)', sci(a.pCorr)]] : [])]) +
      tbl(['Técnica', 'P_RTX', 'ρ (%)', 'Cef (bit/s)'], rows, 'text') +
      dev('Fórmulas con tus números', [
        dmin ? S`\[ P_{RTX}=\sum_{i=${t + 1}}^{${s}}\binom{${n}}{i}p^i(1-p)^{${n}-i}=${txs(a.prtx, 4)},\qquad P_{ER}\approx\sum_{i=${s + 1}}^{${n}}\binom{${n}}{i}p^i(1-p)^{${n}-i}=${txs(a.per, 4)} \]` : S`\[ P_{RTX}\approx 1-(1-p)^{n}=1-(1-${txs(p, 3)})^{${n}}=${txs(a.prtx, 4)} \]`,
        S`\[ \rho_{P\!E}=(1-P_{RTX})\frac{k}{k+m+T_{as}R}=(1-${txs(a.prtx, 3)})\frac{${k}}{${n}+${tx(a.RT, 2)}}=${tx(a.rho.pe * 100, 2)}\,\% \]`,
        S`\[ \rho_{RS}=(1-P_{RTX})\frac{k}{k+m+T_{as}R\,P_{RTX}}=${tx(a.rho.rs * 100, 2)}\,\%,\qquad \rho_{Rsel}=(1-P_{RTX})\frac{k}{k+m}=${tx(a.rho.rsel * 100, 2)}\,\% \]`]) +
      dev('Ventanas y número de secuencia', [
        P(`En un T<sub>as</sub> caben ${fmt(seq.frames, 2)} tramas, así que W<sub>T</sub> ≥ ${seq.wt}.`),
        P(`Parada y espera: 1 bit. Rechazo simple (W<sub>T</sub> ≤ MAXSEQ): <b>${seq.rsimple} bits</b>. Rechazo selectivo (W<sub>T</sub>+W<sub>R</sub> ≤ MAXSEQ+1, con W<sub>R</sub> = W<sub>T</sub>): <b>${seq.rselect} bits</b>.`),
        rsk > 0 && rselk > 0 ? P(`Esos bits salen de los k bits de datos. Descontándolos: ρ<sub>PE</sub> = ${fmt((1 - a.prtx) * (k - 1) / (n + a.RT) * 100, 2)} %, ρ<sub>RS</sub> = ${fmt((1 - a.prtx) * rsk / (n + a.RT * a.prtx) * 100, 2)} %, ρ<sub>Rsel</sub> = ${fmt((1 - a.prtx) * rselk / n * 100, 2)} %.`) : P('Con este k los bits de secuencia no caben en la trama: hace falta un bloque mayor.'),
        P(`Longitud óptima de bloque (P y E): k<sub>opt</sub> ≈ √((m + R·T<sub>as</sub>)/p) = ${fmt(a.kopt, 0)} bits.`)]);
  };

  /* ---------- Formularios ---------- */
  const fld = (id, k, label, val, o = {}) => {
    const v = val === undefined || val === null ? '' : val;
    if (o.type === 'select') return `<div class="field${o.span ? ' span' : ''}"><label for="${id}-${k}">${label}</label><select id="${id}-${k}" data-k="${k}">${o.opts.map(([ov, ol]) => `<option value="${ov}" ${String(ov) === String(v) ? 'selected' : ''}>${ol}</option>`).join('')}</select></div>`;
    if (o.type === 'area') return `<div class="field span"><label for="${id}-${k}">${label}</label><textarea id="${id}-${k}" data-k="${k}" spellcheck="false">${esc(v)}</textarea></div>`;
    return `<div class="field${o.span ? ' span' : ''}"><label for="${id}-${k}">${label}</label><input type="text" class="${o.mono ? 'mono' : ''}" id="${id}-${k}" data-k="${k}" value="${esc(v)}" placeholder="${esc(o.ph || '')}" autocomplete="off" spellcheck="false"></div>`;
  };
  const lines = s => String(s || '').split(';').map(x => x.trim()).filter(Boolean).join('\n');
  const WIDGETS = {
    canal: { title: 'Capacidad desde la matriz Q', form: (id, st) => fld(id, 'matrix', 'Matriz Q = p(y/x): una fila por símbolo de entrada (fracciones o decimales)', lines(st.matrix), { type: 'area' }) },
    bsc: { title: 'Canal binario simétrico (BSC)', form: (id, st) => fld(id, 'p', 'Probabilidad de error p', st.p, { mono: true }) + fld(id, 'times', 'BSC en cascada', st.times || '1', { mono: true }) + fld(id, 'v', 'Cadencia v (símb/s, opcional)', st.v, { mono: true }) },
    bec: { title: 'Canal binario con borrado', form: (id, st) => fld(id, 'a', 'Probabilidad de borrado α', st.a, { mono: true }) + fld(id, 'px', 'P(X=0) para ver I(X;Y)', st.px || '0.5', { mono: true }) },
    hartley: { title: 'Canal continuo (Shannon-Hartley)', form: (id, st) => fld(id, 'b', 'Ancho de banda B (Hz)', st.b, { mono: true }) + fld(id, 'snr', 'S/N (dB)', st.snr, { mono: true }) },
    lineal: { title: 'Código lineal', form: (id, st) => fld(id, 'mode', 'Lo que tienes', st.mode || 'eq', { type: 'select', opts: [['eq', 'Ecuaciones de paridad'], ['g', 'Matriz G']] }) + fld(id, 'text', 'Una ecuación o fila por línea (v0=u1+u2, o 011100). Si solo das las de paridad, añado la identidad a la derecha', lines(st.text), { type: 'area' }) + fld(id, 'r', 'Palabra recibida r (opcional)', st.r, { mono: true }) + fld(id, 'p', 'p del canal (opcional)', st.p, { mono: true }) },
    ciclico: { title: 'Código cíclico', form: (id, st) => fld(id, 'n', 'n', st.n, { mono: true }) + fld(id, 'g', 'g(x): vale 1+x+x^3, x4+x2+1 o (1+x)(1+x+x^3)', st.g, { mono: true }) + fld(id, 'u', 'u(x) a codificar (opcional)', st.u, { mono: true }) + fld(id, 'e', 'Patrones de error e(x), uno por línea (opcional)', lines(st.e), { type: 'area' }) },
    factor: { title: 'Factorizar xⁿ+1', form: (id, st) => fld(id, 'n', 'n', st.n, { mono: true }) },
    division: { title: 'División de polinomios en GF(2)', form: (id, st) => fld(id, 'a', 'Dividendo', st.a, { mono: true }) + fld(id, 'b', 'Divisor', st.b, { mono: true }) },
    circuito: { title: 'Circuitos, registro a registro', form: (id, st) => fld(id, 'kind', 'Circuito', st.kind || 'g', { type: 'select', opts: [['g', 'Codificador basado en g(x)'], ['h', 'Codificador basado en h(x)'], ['s', 'Cálculo del síndrome']] }) + fld(id, 'n', 'n', st.n, { mono: true }) + fld(id, 'g', 'g(x)', st.g, { mono: true }) + fld(id, 'bits', 'u (codificador) o r (síndrome), bits v₀v₁…', st.bits, { mono: true }) },
    rafaga: { title: 'Ráfagas indetectables', form: (id, st) => fld(id, 'n', 'n', st.n, { mono: true }) + fld(id, 'k', 'k', st.k, { mono: true }) + fld(id, 'l', 'Longitud l', st.l, { mono: true }) },
    arq: { title: 'FEC y ARQ: prestaciones', form: (id, st) => fld(id, 'k', 'k (bits de datos)', st.k, { mono: true }) + fld(id, 'n', 'n', st.n, { mono: true }) + fld(id, 'p', 'p', st.p, { mono: true }) + fld(id, 'r', 'R (bit/s)', st.r, { mono: true }) + fld(id, 'tas', 'Tas (s)', st.tas, { mono: true }) + fld(id, 'dmin', 'dmin (vacío: detecta todo)', st.dmin, { mono: true }) + fld(id, 't', 't que corrige en modo híbrido', st.t || '0', { mono: true }) }
  };
  const STATIC = { bloques: bloquesSVG, arqpe: () => arqSVG('pe'), arqrs: () => arqSVG('rs'), arqrsel: () => arqSVG('rsel') };
  const WIDGET_LINK = { canal: 'canal', bsc: 'canal', bec: 'canal', hartley: 'canal', lineal: 'lineal', ciclico: 'ciclico', factor: 'diseno', division: 'diseno', circuito: 'circuito', rafaga: 'diseno', arq: 'arq' };

  function mountWidget(el, type, st, opts = {}) {
    if (STATIC[type]) { el.innerHTML = STATIC[type](); return; }
    const W = WIDGETS[type];
    if (!W) { el.innerHTML = errBox('Widget desconocido: ' + type); return; }
    const id = uid(type);
    el.innerHTML = `<div class="panel"><div class="row"><h4>${W.title}</h4>${opts.calcLink ? `<a class="btn sm ghost" href="#calc-${opts.calcLink}" style="margin-left:auto">Abrir en calculadora →</a>` : ''}</div><div class="form">${W.form(id, st)}</div><div class="result" id="${id}-res"></div></div>`;
    const res = $('#' + id + '-res', el);
    let drawn = false;
    const draw = () => {
      try { res.innerHTML = R[type](st); } catch (e) { res.innerHTML = errBox(e); }
      if (drawn) typeset(res);
      drawn = true;
    };
    draw();
    let tmo;
    el.addEventListener('input', ev => {
      const k = ev.target.dataset && ev.target.dataset.k; if (!k) return;
      st[k] = ev.target.value;
      if (opts.persist) store.set('calc:' + opts.persist, st);
      clearTimeout(tmo);
      tmo = setTimeout(draw, 250);
    });
  }
  function mountAll(root) {
    $$('[data-widget]', root).forEach(el => {
      if (el.dataset.mounted) return; el.dataset.mounted = '1';
      const st = Object.assign({}, el.dataset); delete st.widget; delete st.mounted;
      mountWidget(el, el.dataset.widget, st, { calcLink: WIDGET_LINK[el.dataset.widget] });
    });
  }

  /* ---------- Navegación ---------- */
  const CALCS = [
    ['canal', 'Capacidad de canal', ['canal', 'bsc', 'bec', 'hartley']],
    ['lineal', 'Código lineal', ['lineal']],
    ['ciclico', 'Código cíclico', ['ciclico']],
    ['diseno', 'Diseño: factores, divisiones y ráfagas', ['factor', 'division', 'rafaga']],
    ['circuito', 'Circuitos registro a registro', ['circuito']],
    ['arq', 'FEC y ARQ', ['arq']]
  ];
  const CALC_DEFAULTS = {
    canal: { matrix: '0.7 0.2 0 0.1; 0.1 0.7 0.2 0; 0 0.1 0.7 0.2; 0.2 0 0.1 0.7' }, bsc: { p: '0.1', times: '2', v: '10000' }, bec: { a: '0.2', px: '0.5' }, hartley: { b: '3100', snr: '30' },
    lineal: { mode: 'eq', text: 'v0=u1+u2; v1=u0+u1+u2; v2=u0+u2', r: '011111', p: '0.01' },
    ciclico: { n: '15', g: '(1+x)(1+x+x^2)(1+x+x^4)(1+x+x^2+x^3+x^4)', u: '1+x', e: 'x+x^3+x^5+x^7+x^13+x^14; 1+x+x^2+x^3+x^4+x^5+x^6+x^7+x^8+x^9' },
    factor: { n: '31' }, division: { a: 'x^14+x^11+x^10', b: 'x^10+x^8+x^5+x^4+x^2+x+1' }, rafaga: { n: '15', k: '10', l: '8' },
    circuito: { kind: 'g', n: '7', g: '1+x+x^3', bits: '1011' },
    arq: { k: '1000', n: '1048', p: '5e-6', r: '1200', tas: '0.24', dmin: '', t: '0' }
  };

  function navHTML(route) {
    const visited = store.get('visited', {});
    const a = (href, txt, n, on, tick) => `<a href="${href}" class="${on ? 'on' : ''}">${n !== undefined ? `<span class="n">${n}</span>` : ''}<span>${txt}</span>${tick ? '<span class="tick">✓</span>' : ''}</a>`;
    const r = route.join('-');
    const temaNames = { 4: 'Tema 4 · Capacidad de canal', 5: 'Tema 5 · Códigos lineales', 6: 'Tema 6 · Códigos cíclicos', 7: 'Tema 7 · FEC y ARQ' };
    return `<a class="brand" href="#inicio"><span class="bits">1101 000 → 0110 100</span><b>Cuaderno de Canal</b><span>Teoría de la Información · 2.º parcial</span></a>
      <nav class="nav-group"><span>Empieza aquí</span>${a('#inicio', 'Plan y qué cae', undefined, r === 'inicio')}${a('#chuleta', 'Chuleta de fórmulas', undefined, r === 'chuleta')}</nav>
      ${[4, 5, 6, 7].map(tm => `<nav class="nav-group"><span>${temaNames[tm]}</span>${C.lessons.filter(l => l.tema === tm).map(l => a('#aprende-' + l.id, l.title, l.n, r === 'aprende-' + l.id, visited[l.id])).join('')}</nav>`).join('')}
      <nav class="nav-group"><span>Practica</span>${a('#practica', 'Ejercicios con corrección', undefined, route[0] === 'practica')}${a('#teoria', 'Test de teoría', undefined, r === 'teoria')}</nav>
      ${ENT.length ? `<nav class="nav-group"><span>Entregables</span>${ENT.map(e => a('#entrega-' + e.id, e.short, undefined, r === 'entrega-' + e.id)).join('')}</nav>` : ''}
      <nav class="nav-group"><span>Exámenes: solo 2.º parcial</span>${C.exams.map(e => a('#examenes-' + e.id, e.title, undefined, r === 'examenes-' + e.id)).join('')}</nav>
      <nav class="nav-group"><span>Calculadoras</span>${CALCS.map(([id, t]) => a('#calc-' + id, t, undefined, r === 'calc-' + id)).join('')}</nav>
      <div class="theme-btn row"><button class="btn sm" type="button" id="themeBtn">Tema: <span id="themeLbl"></span></button></div>`;
  }

  /* ---------- Páginas ---------- */
  const PAGES = {};
  const crumbs = { inicio: 'Inicio', aprende: 'Aprende', calc: 'Calculadoras', practica: 'Practica', examenes: 'Exámenes', teoria: 'Test de teoría', chuleta: 'Chuleta', entrega: 'Entregables' };

  PAGES.inicio = () => {
    const done = store.get('plan', {}); const date = store.get('examDate', EXAM_DATE);
    return `<div class="page">
      <section class="hero">
        <div class="bitline" aria-hidden="true">v = u·G · r = v + e · s = r·Hᵗ = e·Hᵗ · v̂ = r + ê</div>
        <h1>Cuaderno de Canal</h1>
        <p class="lead">El segundo parcial de Teoría de la Información, temas 4 a 7, desde cero. Lecciones con tus apuntes y tu notación, calculadoras que enseñan los pasos, ejercicios que se corrigen solos y los siete exámenes de 2023 a 2026, recortados para que solo quede la parte del segundo parcial.</p>
      </section>
      <section class="temas">${C.temas.map(t => `<a class="tile" href="#aprende-${t.first}"><span class="t-eyebrow">Tema ${t.n}</span><h4>${t.title}</h4><span class="small muted">${t.desc}</span></a>`).join('')}</section>
      <section class="grid2">
        <div class="tile"><span class="t-eyebrow">15–20 min · sin apuntes · 30–40 %</span><h3>Teoría</h3><p class="small">Preguntas cortas en la misma hoja. Caen definiciones, propiedades de g(x) y demostraciones breves, como que el síndrome solo depende del error.</p><a class="btn sm" href="#teoria">Entrenar teoría</a></div>
        <div class="tile"><span class="t-eyebrow">50–60 min · sin apuntes · 60–70 %</span><h3>Problemas</h3><p class="small">Normalmente uno corto, de capacidad o de código lineal, y uno largo de código cíclico que acaba en FEC y ARQ. Cada problema va en hojas aparte.</p><a class="btn sm" href="#examenes-ene26">Ver enero de 2026</a></div>
      </section>
      <section class="sec">
        <h2>Fecha de tu examen</h2>
        <p>Segundo parcial: <b>martes 26 de enero de 2027</b>.</p>
        <div class="row"><label class="small" for="examDateIn">Si cambia, ajústala aquí (se guarda solo en este navegador para la cuenta atrás de arriba):</label><input id="examDateIn" class="date-in" type="date" value="${esc(date)}"></div>
      </section>
      <section class="sec">
        <h2>Qué ha caído en el segundo parcial</h2>
        ${tbl(['', 'Problema corto', 'Problema largo', 'Teoría'], C.fell.map(r => [`<a href="#examenes-${r[0]}"><b>${r[1]}</b></a>`, r[2], r[3], r[4]]), 'text')}
        <div class="callout idea"><b>La conclusión</b><span>El código cíclico está en los siete exámenes. Siempre piden lo mismo: g(x) y sus propiedades, si un error se detecta y por qué, los modos s/t y las fórmulas de probabilidad. FEC o ARQ aparecen en seis de los siete. La capacidad cae en problemas en 2025 y 2026, y en teoría en 2023, 2024 y 2026. Domina primero las lecciones 6, 8, 9 y 10.</span></div>
      </section>
      <section class="sec">
        <h2>Plan de estudio</h2>
        <div class="plan">${C.plan.map(d => `<div class="day"><div><b>${d[0]}</b><span class="small">${d[1]}</span></div><div>${d[2].map(([k, t, href]) => `<label class="todo ${done[k] ? 'done' : ''}"><input type="checkbox" data-plan="${k}" ${done[k] ? 'checked' : ''}><span><a href="${href}">${t}</a></span></label>`).join('')}</div></div>`).join('')}</div>
        <p class="small muted">Las casillas se guardan en este navegador.</p>
      </section>
      <section class="sec">
        <h2>Erratas de las soluciones oficiales</h2>
        <p class="small muted">Las he detectado recalculando cada resultado. En cada examen tienes la corrección junto al apartado.</p>
        ${tbl(['Examen', 'Qué dice', 'Qué es correcto'], C.erratas.map(r => [`<a href="#examenes-${r[0]}">${r[1]}</a>`, r[2], r[3]]), 'text')}
      </section>
      <section class="sec">
        <h2>Consejos para el examen</h2>
        <div class="prose"><ul>
          <li>Empieza cada problema de código con los parámetros: n, k, n−k, d<sub>min</sub>, s<sub>max</sub> y t<sub>max</sub>. Casi todos los apartados salen de ahí.</li>
          <li>Para decidir si un error se detecta, prueba en este orden: ¿peso menor que d<sub>min</sub>? ¿peso impar con factor (1+x)? ¿ráfaga con l ≤ n−k? Si nada de eso vale, mira si es xⁱ·g(x) o divide entre g(x).</li>
          <li>Convención de clase: sistemático con la redundancia a la izquierda, G<sub>s</sub> = (P | I<sub>k</sub>) y H = (I<sub>n−k</sub> | Pᵗ). Las palabras se leen v₀ v₁ … y la potencia baja va a la izquierda.</li>
          <li>Distingue el exacto del aproximado. Si no conoces A<sub>i</sub> o α<sub>i</sub>, escribe la suma con C(n,i) y usa ≈.</li>
          <li>En ARQ, separa siempre ω(e) en sus zonas: no hay error, se corrige, se detecta y pide RTX, error residual. Las tres probabilidades salen de ese dibujo.</li>
        </ul></div>
      </section>
    </div>`;
  };

  PAGES.aprende = (id) => {
    const i = C.lessons.findIndex(l => l.id === id);
    const l = C.lessons[i >= 0 ? i : 0];
    const v = store.get('visited', {}); v[l.id] = true; store.set('visited', v);
    const idx = C.lessons.indexOf(l);
    const prev = C.lessons[idx - 1], next = C.lessons[idx + 1];
    const practice = (l.practice || []).map(k => (GEN[k] ? `<a class="btn sm" href="#practica-${k}">${GEN[k].title}</a>` : '')).join('');
    return `<div class="page"><header class="sec"><span class="eyebrow">Tema ${l.tema} · Lección ${l.n} de ${C.lessons.length}</span><h1>${l.title}</h1></header>${l.html}
      <section class="sec"><h3>Ahora practica</h3><div class="row">${practice}</div>
      <div class="row" style="justify-content:space-between;margin-top:8px">${prev ? `<a class="btn" href="#aprende-${prev.id}">← ${prev.title}</a>` : '<span></span>'}${next ? `<a class="btn pri" href="#aprende-${next.id}">${next.title} →</a>` : '<a class="btn pri" href="#examenes-ene26">Hacer el examen de enero de 2026 →</a>'}</div></section></div>`;
  };
  PAGES.calc = (id) => {
    const c = CALCS.find(x => x[0] === id) || CALCS[0];
    return `<div class="page"><header class="sec"><span class="eyebrow">Calculadora</span><h1>${c[1]}</h1><p class="lead">Cambia los datos y el resultado se recalcula con los pasos. Úsala para comprobar lo que hagas a mano.</p></header>${c[2].map(w => `<div data-calc="${w}"></div>`).join('')}</div>`;
  };
  PAGES.chuleta = () => `<div class="page wide"><header class="sec"><span class="eyebrow">Repaso</span><h1>Chuleta de fórmulas</h1><p class="lead">En el examen no puedes llevarla: todo es sin libros ni apuntes. Repásala justo antes.</p></header><div class="cheat">${C.cheat}</div></div>`;

  /* ---------- Teoría ---------- */
  PAGES.teoria = () => {
    const topics = ['Todas', ...new Set(C.cards.map(c => c.t))];
    return `<div class="page"><header class="sec"><span class="eyebrow">Parte de teoría · sin apuntes</span><h1>Test de teoría</h1><p class="lead">${C.cards.length} preguntas sacadas de la parte de 2.º parcial de los exámenes y de tus apuntes. Intenta contestar por escrito antes de ver la respuesta.</p></header>
      <div class="row"><div class="chips" id="topicChips">${topics.map((t, i) => `<button type="button" class="chip ${i === 0 ? 'on' : ''}" data-topic="${t}">${t}</button>`).join('')}</div></div>
      <div class="row"><button class="btn" type="button" id="modeCards">Tarjetas</button><button class="btn" type="button" id="modeSim">Simulacro de 4 preguntas (15 min)</button><button class="btn" type="button" id="modeList">Ver todas</button><span class="score" id="cardScore"></span></div>
      <div id="theoryArea"></div></div>`;
  };
  function theoryInit(root) {
    let topic = 'Todas', mode = 'cards', idx = 0, order = [];
    const marks = store.get('cards', {});
    const pool = () => C.cards.map((c, i) => ({ c, i })).filter(o => topic === 'Todas' || o.c.t === topic);
    const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const area = $('#theoryArea', root);
    const scoreTxt = () => { const p = pool(); const k = p.filter(o => marks[o.i] === 'ok').length; $('#cardScore', root).textContent = `Sabes ${k} de ${p.length}`; };
    const renderCards = () => {
      if (!order.length) { order = shuffle(pool()).sort((a, b) => (marks[a.i] === 'ok') - (marks[b.i] === 'ok')); idx = 0; }
      const o = order[idx % order.length];
      area.innerHTML = `<div class="card"><span class="src">${o.c.t} · ${o.c.src} · ${idx % order.length + 1}/${order.length}</span><div class="prose"><p><b>${o.c.q}</b></p></div>
        <div class="row"><button class="btn pri" type="button" id="showAns">Ver respuesta</button></div><div class="ans" id="ans" hidden><div class="prose">${o.c.a}</div>
        <div class="row"><button class="btn" type="button" data-mark="ok">La sabía</button><button class="btn" type="button" data-mark="no">Repasar</button></div></div></div>`;
      $('#showAns', area).onclick = () => { $('#ans', area).hidden = false; typeset(area); };
      $$('[data-mark]', area).forEach(b => b.onclick = () => { marks[o.i] = b.dataset.mark; store.set('cards', marks); idx++; scoreTxt(); renderCards(); });
      typeset(area); scoreTxt();
    };
    const renderList = () => { area.innerHTML = pool().map(o => `<details><summary><span>${o.c.q}</span> <span class="src small muted" style="margin-left:auto">${o.c.src}</span></summary><div class="body prose">${o.c.a}</div></details>`).join(''); typeset(area); scoreTxt(); };
    let simTimer = null;
    const renderSim = () => {
      const picks = shuffle(pool().slice()).slice(0, 4);
      let left = 15 * 60;
      area.innerHTML = `<div class="panel"><div class="row"><b>Simulacro</b><span class="timer" id="simT">15:00</span><button class="btn sm" type="button" id="simDone" style="margin-left:auto">Corregir</button></div>
        ${picks.map((o, k) => `<div class="part"><p class="q-text"><b class="tag">P${k + 1}</b>${o.c.q}</p><textarea id="sim-${k}" placeholder="Escribe tu respuesta"></textarea><div class="ans" hidden data-sim="${k}"><div class="prose">${o.c.a}</div></div></div>`).join('')}</div>`;
      clearInterval(simTimer);
      const reveal = () => { clearInterval(simTimer); $$('[data-sim]', area).forEach(a => a.hidden = false); typeset(area); };
      simTimer = setInterval(() => { left--; const t = $('#simT', area); if (!t) { clearInterval(simTimer); return; } t.textContent = `${String(Math.floor(Math.max(left, 0) / 60)).padStart(2, '0')}:${String(Math.max(left, 0) % 60).padStart(2, '0')}`; if (left <= 0) reveal(); }, 1000);
      $('#simDone', area).onclick = reveal; typeset(area); scoreTxt();
    };
    const go = () => { clearInterval(simTimer); if (mode === 'cards') renderCards(); else if (mode === 'list') renderList(); else renderSim(); };
    $$('[data-topic]', root).forEach(b => b.onclick = () => { topic = b.dataset.topic; $$('[data-topic]', root).forEach(x => x.classList.toggle('on', x === b)); order = []; go(); });
    $('#modeCards', root).onclick = () => { mode = 'cards'; order = []; go(); };
    $('#modeList', root).onclick = () => { mode = 'list'; go(); };
    $('#modeSim', root).onclick = () => { mode = 'sim'; go(); };
    go();
  }

  /* ---------- Exámenes ---------- */
  PAGES.examenes = (id) => {
    const e = C.exams.find(x => x.id === id) || C.exams[0];
    return `<div class="page"><header class="sec"><span class="eyebrow">${e.date} · Segundo parcial${e.minutes ? ` · ${e.minutes} minutos` : ''}</span><h1>${e.title}</h1><p class="lead">${e.intro}</p>
      ${e.warn ? `<div class="callout ojo"><b>Sobre este PDF</b><span>${e.warn}</span></div>` : ''}
      <div class="row">${e.minutes ? `<button class="btn" type="button" id="exTimerBtn">Empezar cronómetro de ${e.minutes} min</button><span class="timer" id="exTimer"></span>` : ''}<button class="btn" type="button" id="exAll">Mostrar todas las soluciones</button></div>
      <p class="small muted">Intenta cada apartado en papel. Si te atascas, abre la pista; luego compara con la solución.</p></header>
      ${e.problems.map((p, pi) => `<section class="sec"><h2>${p.title}</h2>${p.statement ? `<div class="statement">${p.statement}</div>` : ''}
        ${p.parts.map((pt, k) => `<div class="part"><p class="q-text"><b class="tag">${pt.tag})</b>${pt.q}${pt.pts !== undefined ? ` <span class="muted small">(${String(pt.pts).replace('.', ',')} pt)</span>` : ''}</p>
          <div class="row">${pt.hint ? `<button class="btn sm" type="button" data-hint="${pi}-${k}">Pista</button>` : ''}<button class="btn sm" type="button" data-sol="${pi}-${k}">Solución</button></div>
          ${pt.hint ? `<div class="callout idea" data-hintbox="${pi}-${k}" hidden><b>Pista</b><span>${pt.hint}</span></div>` : ''}
          <div class="example" data-solbox="${pi}-${k}" hidden><span class="lbl">Solución</span>${pt.sol}${pt.errata ? `<div class="callout ojo"><b>Errata de la solución oficial</b><span>${pt.errata}</span></div>` : ''}</div></div>`).join('')}</section>`).join('')}</div>`;
  };
  let examTimer = null;
  function examInit(root) {
    const toggle = (sel, key) => { const box = $(`[${sel}="${key}"]`, root); box.hidden = !box.hidden; if (!box.hidden) { mountAll(box); typeset(box); } };
    $$('[data-hint]', root).forEach(b => b.onclick = () => toggle('data-hintbox', b.dataset.hint));
    $$('[data-sol]', root).forEach(b => b.onclick = () => toggle('data-solbox', b.dataset.sol));
    const all = $('#exAll', root);
    if (all) all.onclick = () => { $$('[data-solbox]', root).forEach(b => { b.hidden = false; mountAll(b); }); typeset(root); };
    const tb = $('#exTimerBtn', root);
    if (tb) tb.onclick = () => {
      clearInterval(examTimer); const mins = parseInt(tb.textContent.match(/\d+/)[0], 10); let left = mins * 60; const t = $('#exTimer', root);
      tb.textContent = `Reiniciar (${mins} min)`;
      examTimer = setInterval(() => { left--; if (!document.body.contains(t)) { clearInterval(examTimer); return; } t.textContent = left > 0 ? `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}` : 'Tiempo'; if (left <= 0) clearInterval(examTimer); }, 1000);
    };
  }

  /* ---------- Práctica ---------- */
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  const randBits = (r, n) => { let v; do { v = Array.from({ length: n }, () => (r() < 0.5 ? 1 : 0)); } while (!v.some(Boolean)); return v; };
  const YN = [['si', 'Sí'], ['no', 'No']];
  const CYC = [[7, '1+x+x^3'], [7, '1+x^2+x^3'], [7, '(1+x)(1+x+x^3)'], [7, '(1+x)(1+x^2+x^3)'], [15, '1+x+x^4'], [15, '(1+x)(1+x+x^4)'], [15, '1+x^3+x^4'], [15, '(1+x)(1+x^3+x^4)'], [15, '(1+x+x^4)(1+x+x^2+x^3+x^4)'], [15, 'x^10+x^8+x^5+x^4+x^2+x+1'], [15, '(1+x)(1+x+x^2)(1+x+x^4)(1+x+x^2+x^3+x^4)'], [31, '1+x^2+x^5'], [31, '(1+x)(1+x^2+x^5)'], [31, '1+x^3+x^5']];
  const pickCyc = r => { const [n, gs] = pick(r, CYC); const g = TC.parsePoly(gs); return { n, gs: TC.ptex(g).replace(/[{}]/g, ''), g, c: TC.cyclic(n, g) }; };
  const GEN = {};

  /* Tema 4 */
  GEN.bsc = { title: 'Capacidad de un BSC', lesson: 'capacidad', make(r) {
    const p = pick(r, [0.01, 0.02, 0.05, 0.1, 0.11, 0.15, 0.2, 0.25, 0.3]); const v = pick(r, [1200, 9600, 10000, 19200, 64000]);
    const C_ = 1 - TC.h2(p);
    return { statement: `<p>Un canal binario simétrico tiene probabilidad de error de bit p = ${fmt(p, 3)} y transmite v = ${v} símbolos por segundo.</p>`,
      qs: [{ label: 'H(p) en bits', ans: TC.h2(p), tol: 0.003 }, { label: 'C en bits/uso', ans: C_, tol: 0.003 }, { label: 'V = C·v en bit/s', ans: C_ * v, rel: 0.01 }],
      sol: `<div data-widget="bsc" data-p="${p}" data-v="${v}" data-times="1"></div>` };
  } };
  GEN.cascada = { title: 'BSC en cascada', lesson: 'capacidad', make(r) {
    const p = pick(r, [0.01, 0.05, 0.1, 0.2, 0.25, 0.3]); const pe = TC.bscCascade(p);
    return { statement: `<p>Se concatenan dos BSC iguales de parámetro p = ${fmt(p, 3)}. Calcula la capacidad del canal resultante.</p>`,
      qs: [{ label: 'Probabilidad de error equivalente p′', ans: pe, tol: 0.001 }, { label: 'C en bits/uso', ans: 1 - TC.h2(pe), tol: 0.003 }, { label: 'Distribución de entrada', kind: 'choice', ans: 'u', opts: [['u', 'Uniforme (½, ½)'], ['n', 'Depende de p']] }],
      sol: `<div data-widget="bsc" data-p="${p}" data-times="2"></div>` };
  } };
  GEN.simetrico = { title: 'Canales desde Q: ¿simétricos?', lesson: 'capacidad', make(r) {
    const kind = pick(r, ['sim', 'sim', 'debil']);
    let Q, txt;
    if (kind === 'sim') {
      const base = pick(r, [['1/2', '1/4', '1/4'], ['1/2', '1/3', '1/6'], ['0.7', '0.2', '0.1'], ['0.5', '0.3', '0.2'], ['0.6', '0.3', '0.1', '0'], ['0.7', '0.2', '0', '0.1'], ['1/2', '1/4', '1/8', '1/8']]);
      const n = base.length; Q = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => base[(j - i + n) % n]));
    } else {
      const v = pick(r, [[['1/3', '1/6', '1/2'], ['1/3', '1/2', '1/6']], [['0.5', '0.3', '0.2', '0'], ['0', '0.2', '0.3', '0.5']], [['2/5', '1/5', '1/5', '1/5', '0'], ['0', '2/5', '1/5', '1/5', '1/5'], ['1/5', '0', '1/5', '1/5', '2/5']], [['1/2', '1/4', '1/4'], ['1/4', '1/4', '1/2']]]); Q = v;
    }
    txt = Q.map(x => x.join(' ')).join('; ');
    const ch = TC.channel(TC.parseMatrix(txt));
    return { statement: `<p>Un canal tiene esta matriz de transición, con una fila por símbolo de entrada:</p><div class="tbl-wrap"><table>${Q.map(row => `<tr>${row.map(x => `<td class="num">${x}</td>`).join('')}</tr>`).join('')}</table></div>`,
      qs: [{ label: 'Tipo de canal', kind: 'choice', ans: ch.type, opts: [['simetrico', 'Simétrico'], ['debil', 'Débilmente simétrico'], ['general', 'Ninguno de los dos']] }, { label: 'H(fila) en bits', ans: ch.Hfila, tol: 0.004 }, { label: 'C en bits/uso', ans: ch.C, tol: 0.004 }],
      sol: `<div data-widget="canal" data-matrix="${txt}"></div>` };
  } };
  GEN.borrado = { title: 'Canal con borrado', lesson: 'capacidad', make(r) {
    const a = pick(r, [0.05, 0.1, 0.2, 0.25, 0.3, 0.5]); const p = pick(r, [0.5, 0.25, 0.1, 0.3]);
    return { statement: `<p>Un canal binario con borrado tiene α = ${fmt(a, 3)}. La fuente emite P(X=0) = ${fmt(p, 3)}.</p>`,
      qs: [{ label: 'H(Y/X) en bits', ans: TC.h2(a), tol: 0.004 }, { label: 'H(Y) en bits con esa fuente', ans: TC.h2(a) + (1 - a) * TC.h2(p), tol: 0.005 }, { label: 'I(X;Y) en bits con esa fuente', ans: (1 - a) * TC.h2(p), tol: 0.005 }, { label: 'C en bits/uso', ans: 1 - a, tol: 0.001 }],
      sol: `<div data-widget="bec" data-a="${a}" data-px="${p}"></div>` };
  } };

  /* Tema 5 */
  function randLinear(r) {
    for (let tr = 0; tr < 200; tr++) {
      const k = TC.randInt(r, 3, 4), m = TC.randInt(r, 3, 4);
      const eqs = Array.from({ length: m }, () => randBits(r, k));
      const G = Array.from({ length: k }, (_, i) => [...eqs.map(e => e[i]), ...Array.from({ length: k }, (_, j) => (i === j ? 1 : 0))]);
      const c = TC.linear(G);
      const txt = eqs.map((e, j) => `v${j}=${e.map((b, i) => (b ? 'u' + i : null)).filter(Boolean).join('+')}`).join('; ');
      if (c.dmin >= 3 && same(TC.parseEquations(txt), G)) return { k, m, eqs, G, c, txt };
    }
    const G = [[1, 1, 0, 1, 0, 0, 0], [0, 1, 1, 0, 1, 0, 0], [1, 1, 1, 0, 0, 1, 0], [1, 0, 1, 0, 0, 0, 1]];
    return { k: 4, m: 3, G, c: TC.linear(G), txt: 'v0=u0+u2+u3; v1=u0+u1+u2; v2=u1+u2+u3' };
  }
  GEN.lineal = { title: 'Código desde sus ecuaciones', lesson: 'matriz', make(r) {
    const L = randLinear(r); const c = L.c;
    const perf = TC.isPerfect(c.n, c.k, c.tmax);
    return { statement: `<p>Un código lineal sistemático tiene estas ecuaciones de paridad, con la redundancia en las primeras posiciones: <span class="mono">${L.txt.replace(/;/g, ' ·')}</span>.</p>`,
      qs: [{ label: 'n', ans: c.n, tol: 0 }, { label: 'k', ans: c.k, tol: 0 }, { label: 'Tasa k/n', ans: c.k / c.n, tol: 0.005 }, { label: 'dmin', ans: c.dmin, tol: 0 }, { label: `A${c.dmin}: palabras de peso dmin`, ans: Number(c.A[c.dmin]), tol: 0 }, { label: 'smax', ans: c.smax, tol: 0 }, { label: 'tmax', ans: c.tmax, tol: 0 }, { label: '¿Es perfecto?', kind: 'choice', ans: perf ? 'si' : 'no', opts: YN }],
      sol: `<div data-widget="lineal" data-mode="eq" data-text="${L.txt}"></div>` };
  } };
  GEN.sindrome = { title: 'Síndrome y corrección', lesson: 'correccion', make(r) {
    const L = randLinear(r); const c = L.c; const cos = TC.cosets(c.H, c.n);
    const u = randBits(r, c.k); const v = TC.encode(u, c.Gs); const pos = TC.randInt(r, 0, c.n - 1);
    const e = v.map((_, i) => (i === pos ? 1 : 0)); const rv = v.map((b, i) => b ^ e[i]); const d = TC.decode(rv, c, cos);
    return { statement: `<p>Código con ecuaciones <span class="mono">${L.txt.replace(/;/g, ' ·')}</span>, usado en corrección máxima. Se recibe r = <span class="mono">${rv.join('')}</span>.</p>`,
      qs: [{ label: 's = r·Hᵗ (bits)', ans: d.s.join(''), kind: 'bits' }, { label: 'ê (líder de cogrupo)', ans: d.e.join(''), kind: 'bits' }, { label: 'v̂ = r + ê', ans: d.v.join(''), kind: 'bits' }, { label: 'û que se entrega', ans: d.u.join(''), kind: 'bits' }],
      sol: `<div data-widget="lineal" data-mode="eq" data-text="${L.txt}" data-r="${rv.join('')}"></div>` };
  } };
  GEN.probcod = { title: 'Probabilidades exactas', lesson: 'correccion', make(r) {
    const L = randLinear(r); const c = L.c; const cos = TC.cosets(c.H, c.n); const p = pick(r, [0.1, 0.05, 0.01, 0.02, 0.2]);
    const pnd = TC.sumA(c.A, c.n, p, 1), pec = TC.pErrCorr(cos.alpha, c.n, p);
    return { statement: `<p>Código con ecuaciones <span class="mono">${L.txt.replace(/;/g, ' ·')}</span> sobre un BSC con p = ${fmt(p, 3)}. Calcula exactamente, con su distribución de pesos y de líderes.</p>`,
      qs: [{ label: 'α₁: líderes de peso 1', ans: cos.alpha[1], tol: 0 }, { label: 'α₂: líderes de peso 2', ans: cos.alpha[2], tol: 0 }, { label: 'P(no hay error) = (1−p)ⁿ', ans: Math.pow(1 - p, c.n), rel: 0.01 }, { label: 'P_ND (detección pura)', ans: pnd, rel: 0.02 }, { label: 'P(error de corrección)', ans: pec, rel: 0.02 }],
      sol: `<div data-widget="lineal" data-mode="eq" data-text="${L.txt}" data-p="${p}"></div>` };
  } };
  GEN.perfecto = { title: 'Dimensionar con la cota de Hamming', lesson: 'correccion', make(r) {
    const n = pick(r, [7, 15, 23, 31, 63]); const dmin = pick(r, n === 23 ? [3, 5, 7] : [3, 4, 5, 7]); const t = Math.floor((dmin - 1) / 2);
    const bound = TC.hammingBound(n, t); let m = 0; while ((1n << BigInt(m)) < bound) m++;
    const perf = (1n << BigInt(m)) === bound;
    return { statement: `<p>Se busca un código C(n,k) con n = ${n} y d<sub>min</sub> = ${dmin}, usando la cota de Hamming: 2<sup>n−k</sup> ≥ Σ<sub>i≤t</sub> C(n,i).</p>`,
      qs: [{ label: 'tmax', ans: t, tol: 0 }, { label: 'Σ C(n,i), i ≤ t', ans: Number(bound), tol: 0 }, { label: 'n−k mínimo', ans: m, tol: 0 }, { label: 'k máximo que permite la cota', ans: n - m, tol: 0 }, { label: '¿Con ese k la cota se alcanza con igualdad?', kind: 'choice', ans: perf ? 'si' : 'no', opts: YN }],
      sol: `<p>t = ⌊(${dmin}−1)/2⌋ = ${t}. Suma: ${bound}. El menor m con 2<sup>m</sup> ≥ ${bound} es ${m}, así que k ≤ ${n - m}. ${perf ? 'La cota se alcanza con igualdad: un código con esos parámetros sería perfecto.' : 'No se alcanza con igualdad: no sería perfecto.'} La cota es necesaria, no garantiza que el código exista.</p>` };
  } };

  /* Tema 6 */
  GEN.sistem = { title: 'Codificación sistemática', lesson: 'ciclicos', make(r) {
    const { n, gs, g, c } = pickCyc(r);
    const ub = randBits(r, c.k); const u = TC.vecp(ub); const e = TC.encodeSys(u, c);
    return { statement: `<p>Código cíclico C(${n},${c.k}) con g(x) = <span class="mono">${gs}</span>. Codifica sistemáticamente u = <span class="mono">${ub.join('')}</span>, es decir u(x) = \\(${TC.ptex(u)}\\).</p>`,
      qs: [{ label: `b(x) como ${c.r} bits, empezando por b₀`, ans: TC.pvec(e.b, c.r).join(''), kind: 'bits' }, { label: 'Palabra código v', ans: TC.pvec(e.v, n).join(''), kind: 'bits' }, { label: 'Peso de v', ans: TC.pweight(e.v), tol: 0 }],
      sol: `<div data-widget="division" data-a="${TC.ptex(e.shifted, true).replace(/[{}]/g, '')}" data-b="${gs}"></div><div data-widget="ciclico" data-n="${n}" data-g="${gs}" data-u="${TC.ptex(u).replace(/[{}]/g, '')}"></div>` };
  } };
  GEN.parametros = { title: 'Parámetros de un código cíclico', lesson: 'ciclicos', make(r) {
    const { n, gs, c } = pickCyc(r); const d = c.r + TC.randInt(r, 0, Math.min(3, c.k - 1));
    return { statement: `<p>Código cíclico de longitud ${n} generado por g(x) = <span class="mono">${gs}</span>.</p>`,
      qs: [{ label: 'k', ans: c.k, tol: 0 }, { label: 'Número de palabras código', ans: 2 ** c.k, tol: 0 }, { label: `Palabras código de grado exacto ${d}`, ans: Number(TC.wordsOfDegree(d, n, c.r)), tol: 0 }, { label: 'Etapas del codificador basado en g(x)', ans: c.r, tol: 0 }, { label: 'Etapas del codificador basado en h(x)', ans: c.k, tol: 0 }, { label: 'h(x) (escríbelo como 1+x+x^3)', kind: 'poly', ans: c.h }, { label: '¿Detecta todos los errores de peso impar?', kind: 'choice', ans: c.hasXp1 ? 'si' : 'no', opts: YN }],
      sol: `<div data-widget="ciclico" data-n="${n}" data-g="${gs}"></div>` };
  } };
  GEN.errores = { title: '¿Se detecta este error?', lesson: 'deteccion', make(r) {
    const { n, gs, g, c } = pickCyc(r); const list = []; const kinds = ['multiplo', 'rafaga', 'peso', 'azar'];
    for (let i = 0; i < 4; i++) {
      const kd = pick(r, kinds); let e;
      if (kd === 'multiplo') { const a = TC.vecp(randBits(r, Math.max(1, c.k))); e = TC.pmul(a, g); }
      else if (kd === 'rafaga') { const l = TC.randInt(r, 2, Math.min(n - 1, c.r + 1)); const st = TC.randInt(r, 0, n - l); const mid = randBits(r, l); mid[0] = 1; mid[l - 1] = 1; e = TC.vecp(mid) << BigInt(st); }
      else if (kd === 'peso') { const pos = new Set(); while (pos.size < Math.max(1, Math.min(2, c.dmin - 1))) pos.add(TC.randInt(r, 0, n - 1)); e = [...pos].reduce((acc, x) => acc | (1n << BigInt(x)), 0n); }
      else e = TC.vecp(randBits(r, n));
      list.push(e);
    }
    return { statement: `<p>Código C(${n},${c.k}) con g(x) = <span class="mono">${gs}</span> y d<sub>min</sub> = ${c.dmin}. Para cada patrón, decide si el decodificador lo detecta en modo detección pura.</p>`,
      qs: list.map((e, i) => ({ label: `\\(e_${i + 1}(x)=${TC.ptex(e)}\\)`, kind: 'choice', ans: TC.pmod(e, g) === 0n ? 'no' : 'si', opts: [['si', 'Se detecta'], ['no', 'No se detecta']] })),
      sol: `<div data-widget="ciclico" data-n="${n}" data-g="${gs}" data-e="${list.map(e => TC.ptex(e).replace(/[{}]/g, '')).join('; ')}"></div>` };
  } };
  GEN.rafagas = { title: 'Ráfagas indetectables', lesson: 'deteccion', make(r) {
    const n = pick(r, [15, 31, 63, 127]); const m = pick(r, n === 15 ? [4, 5, 8] : [5, 6, 8, 10, 12]); const k = n - m;
    const l = pick(r, [m - 1, m, m + 1, m + 2, m + 3, m + 5]); const b = TC.burst(n, k, l);
    return { statement: `<p>Código cíclico C(${n},${k}). Considera las ráfagas de longitud l = ${l} en una posición dada.</p>`,
      qs: [{ label: 'Número de ráfagas de esa longitud', ans: Number(b.total), tol: 0 }, { label: 'Ráfagas indetectables', ans: Number(b.undet), tol: 0 }, { label: 'Fracción indetectable (vale 1/32)', ans: b.frac, rel: 0.01 }],
      sol: `<div data-widget="rafaga" data-n="${n}" data-k="${k}" data-l="${l}"></div>` };
  } };
  GEN.diseno = { title: 'Diseño desde la factorización', lesson: 'deteccion', make(r) {
    const n = pick(r, [7, 15, 31]); const f = TC.factor(TC.xn1(n)).factors; const L = f.length;
    const degs = new Set([0]); f.forEach(q => [...degs].forEach(d => degs.add(d + TC.pdeg(q))));
    const m = TC.randInt(r, 2, n - 2); const ok = degs.has(m);
    return { statement: `<p>Sabes que x<sup>${n}</sup>+1 = ${f.map(q => `(\\(${TC.ptex(q)}\\))`).join('')}.</p>`,
      qs: [{ label: 'Número de factores L', ans: L, tol: 0 }, { label: 'Códigos cíclicos de longitud n (2ᴸ−2)', ans: 2 ** L - 2, tol: 0 }, { label: `¿Existe un código cíclico C(${n},${n - m})?`, kind: 'choice', ans: ok ? 'si' : 'no', opts: YN }],
      sol: `<div data-widget="factor" data-n="${n}"></div><p class="small">C(${n},${n - m}) necesita g(x) de grado ${m}. ${ok ? 'Ese grado sí sale sumando factores.' : 'Ningún producto de factores tiene ese grado.'}</p>` };
  } };

  /* Tema 7 */
  GEN.modos = { title: 'Modos s, t y zonas de error', lesson: 'hibridas', make(r) {
    const dmin = pick(r, [4, 5, 6, 7, 8, 9]); const n = pick(r, [15, 23, 31]); const tm = Math.floor((dmin - 1) / 2); const t = TC.randInt(r, 1, Math.max(1, tm)); const s = dmin - 1 - t;
    return { statement: `<p>Código C(${n},k) con d<sub>min</sub> = ${dmin}, usado en ARQ corrigiendo hasta t = ${t} errores.</p>`,
      qs: [{ label: 's máx en detección pura', ans: dmin - 1, tol: 0 }, { label: 't máx', ans: tm, tol: 0 }, { label: 's con ese t', ans: s, tol: 0 }, { label: 'Primer peso que pide RTX', ans: t + 1, tol: 0 }, { label: 'Último peso que pide RTX seguro', ans: s, tol: 0 }, { label: 'Primer peso de la zona de error residual', ans: s + 1, tol: 0 }],
      sol: `<p>d<sub>min</sub> = s + t + 1, así que s = ${dmin} − 1 − ${t} = ${s}. Las zonas de ω(e): 0 no hay error; 1 a ${t} se corrige; ${t + 1} a ${s} se detecta y pide RTX; ${s + 1} o más se asume error residual.</p>` };
  } };
  GEN.arqnum = { title: 'Prestaciones de ARQ', lesson: 'arq', make(r) {
    const [n, k] = pick(r, [[31, 25], [1048, 1000], [23, 12], [127, 119], [512, 480], [2048, 2016]]); const p = pick(r, [1e-3, 1e-4, 1e-5, 5e-6]); const R_ = pick(r, [9600, 19200, 64000, 1e6]); const Tas = pick(r, [1e-3, 5e-3, 0.01, 0.1, 0.24]);
    const P_ = 1 - Math.pow(1 - p, n); const RT = R_ * Tas;
    return { statement: `<p>C(${n},${k}) en detección pura, sobre un canal con p = ${sci(p)}, R = ${R_} bit/s y T<sub>as</sub> = ${fmt(Tas, 3)} s. Supón que el código detecta todos los errores. Da ρ en tanto por uno.</p>`,
      qs: [{ label: 'P_RTX ≈ 1−(1−p)ⁿ', ans: P_, rel: 0.02 }, { label: 'R·Tas (bits)', ans: RT, rel: 0.001 }, { label: 'ρ en FEC', ans: k / n, tol: 0.002 }, { label: 'ρ parada y espera', ans: (1 - P_) * k / (n + RT), rel: 0.01 }, { label: 'ρ rechazo simple', ans: (1 - P_) * k / (n + RT * P_), rel: 0.01 }, { label: 'ρ rechazo selectivo', ans: (1 - P_) * k / n, rel: 0.01 }],
      sol: `<div data-widget="arq" data-k="${k}" data-n="${n}" data-p="${p}" data-r="${R_}" data-tas="${Tas}"></div>` };
  } };
  GEN.ventanas = { title: 'Ventanas y número de secuencia', lesson: 'envio', make(r) {
    const [n, k] = pick(r, [[23, 12], [127, 106], [255, 231], [1048, 1000]]); const R_ = pick(r, [64000, 1e6, 2e6, 1e7]); const Tas = pick(r, [1e-3, 2e-3, 0.005, 0.01]);
    const s = TC.seqBits(k, n, R_, Tas);
    return { statement: `<p>C(${n},${k}) con R = ${R_} bit/s y T<sub>as</sub> = ${fmt(Tas, 4)} s. Dimensiona el número de secuencia.</p>`,
      qs: [{ label: 'Xp = n/R (s)', ans: s.Xp, rel: 0.005 }, { label: 'Ventana emisora mínima Wₜ (tramas en un Tas, redondeando hacia arriba)', ans: s.wt, tol: 0 }, { label: 'Bits de secuencia en parada y espera', ans: 1, tol: 0 }, { label: 'Bits en rechazo simple', ans: s.rsimple, tol: 0 }, { label: 'Bits en rechazo selectivo', ans: s.rselect, tol: 0 }],
      sol: `<p>Xp = ${sci(s.Xp)} s. En un T<sub>as</sub> caben ${fmt(s.frames, 2)} tramas, luego W<sub>T</sub> ≥ ${s.wt}. Rechazo simple: W<sub>T</sub> ≤ MAXSEQ = 2<sup>b</sup>−1, b = ${s.rsimple}. Rechazo selectivo: W<sub>T</sub>+W<sub>R</sub> ≤ MAXSEQ+1 con W<sub>R</sub> = W<sub>T</sub>: 2·${s.wt} ≤ 2<sup>b</sup>, b = ${s.rselect}.</p>` };
  } };

  const GEN_GROUPS = [['Tema 4 · Capacidad de canal', ['bsc', 'cascada', 'simetrico', 'borrado']], ['Tema 5 · Códigos lineales', ['lineal', 'sindrome', 'probcod', 'perfecto']], ['Tema 6 · Códigos cíclicos', ['parametros', 'sistem', 'errores', 'rafagas', 'diseno']], ['Tema 7 · FEC y ARQ', ['modos', 'arqnum', 'ventanas']]];
  PAGES.practica = (kind) => {
    const stats = store.get('stats', {});
    if (!kind || !GEN[kind]) {
      return `<div class="page"><header class="sec"><span class="eyebrow">Practica</span><h1>Ejercicios con corrección</h1><p class="lead">Cada ejercicio se genera con números nuevos. Escribe tus resultados (vale coma decimal, fracciones y 3e-8), pulsa Comprobar y mira la solución paso a paso.</p></header>
        ${GEN_GROUPS.map(([g, ks]) => `<section class="sec"><h3>${g}</h3><div class="grid2">${ks.map(k => { const s = stats[k] || { ok: 0, tot: 0 }; return `<a class="tile" href="#practica-${k}"><span class="t-eyebrow">${s.tot ? `${s.ok}/${s.tot} bien` : 'sin hacer'}</span><b>${GEN[k].title}</b><span class="small muted">Lección: ${(C.lessons.find(l => l.id === GEN[k].lesson) || {}).title || ''}</span></a>`; }).join('')}</div></section>`).join('')}</div>`;
    }
    return `<div class="page"><header class="sec"><span class="eyebrow"><a href="#practica">Practica</a></span><h1>${GEN[kind].title}</h1></header><div id="exArea"></div></div>`;
  };
  function parseNumIn(s) { try { const t = String(s).trim().replace('%', '').replace(/\s/g, '').replace(/·10\^/, 'e').replace(/\*10\^/, 'e'); if (!t) return NaN; return TC.Frac.parse(t).num(); } catch (e) { return NaN; } }
  // "33.984,28" y "41.728" pueden llevar punto de millares: se aceptan las dos lecturas
  const parseNumAll = s => { const t = String(s).trim(); const out = [parseNumIn(t)]; if (/^[1-9]\d{0,2}(\.\d{3})+(,\d+)?$/.test(t)) out.push(parseNumIn(t.replace(/\./g, ''))); return out; };
  function checkQ(q, raw) {
    if (q.kind === 'choice') return raw === q.ans;
    if (q.kind === 'bits' || q.kind === 'matrix') return String(raw).replace(/[^01]/g, '') === q.ans;
    if (q.kind === 'poly') { try { return TC.parsePoly(raw) === q.ans; } catch (e) { return false; } }
    if (q.kind === 'list') { const v = String(raw).split(/[;,\s]+/).filter(Boolean).map(Number); return v.length === q.ans.length && v.every((x, i) => x === q.ans[i]); }
    const targets = [q.ans, ...(q.alt || [])];
    return parseNumAll(raw).some(v => {
      if (!isFinite(v)) return false;
      return targets.some(a => (q.rel !== undefined ? Math.abs(v - a) <= q.rel * Math.abs(a) + 1e-15 : Math.abs(v - a) <= (q.tol || 0) + 1e-9));
    });
  }
  const ansText = q => {
    if (q.kind === 'choice') return q.opts.find(o => o[0] === q.ans)[1];
    if (q.kind === 'list') return q.ans.join(', ');
    if (q.kind === 'matrix') { const L = q.ans.length; const w = q.label.match(/(\d+)\s*×\s*(\d+)/); const c = w ? +w[2] : L; return q.ans.match(new RegExp(`.{1,${c}}`, 'g')).join(' ; '); }
    if (q.kind === 'poly') return T(TC.ptex(q.ans));
    if (typeof q.ans === 'number') return Math.abs(q.ans) < 1e-3 && q.ans !== 0 ? sci(q.ans) : fmt(q.ans, 5);
    return q.ans;
  };
  function practiceInit(root, kind) {
    if (!GEN[kind]) return;
    const area = $('#exArea', root);
    const fresh = () => {
      const seed = (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
      const ex = GEN[kind].make(TC.rng(seed));
      area.innerHTML = `<div class="statement">${ex.statement}</div>
        <div class="panel"><div class="q-list">${ex.qs.map((q, i) => `<div class="q"><label for="pq-${i}">${q.label}</label>${q.kind === 'choice' ? `<select id="pq-${i}"><option value="">Elige…</option>${q.opts.map(o => `<option value="${o[0]}">${o[1]}</option>`).join('')}</select>` : `<input type="text" class="mono" id="pq-${i}" autocomplete="off" spellcheck="false">`}<span class="mark" id="pm-${i}"></span></div>`).join('')}</div>
        <div class="row"><button class="btn pri" type="button" id="pCheck">Comprobar</button><button class="btn" type="button" id="pSol">Ver solución</button><button class="btn" type="button" id="pNew">Otro ejercicio</button><span class="score" id="pScore"></span></div>
        <div id="pFeedback"></div></div>
        <div class="example" id="pSolBox" hidden><span class="lbl">Solución</span>${ex.sol}</div>`;
      let counted = false;
      $('#pCheck', area).onclick = () => {
        let ok = 0; const fb = [];
        ex.qs.forEach((q, i) => { const v = $('#pq-' + i, area).value; const good = checkQ(q, v); if (good) ok++; else fb.push(`<li>${q.label}: ${v.trim() ? 'no coincide' : 'sin contestar'}.</li>`); const m = $('#pm-' + i, area); m.textContent = good ? '✓' : '✗'; m.className = 'mark ' + (good ? 'ok' : 'no'); });
        $('#pScore', area).textContent = `${ok}/${ex.qs.length} correctas`;
        $('#pFeedback', area).innerHTML = fb.length ? `<ul class="small">${fb.join('')}</ul><p class="small muted">Revisa y vuelve a comprobar, o abre la solución.</p>` : '<p class="pill ok">Todo correcto</p>';
        typeset($('#pFeedback', area));
        if (!counted) {
          counted = true;
          const all = store.get('stats', {});
          const k = all[kind] || { ok: 0, tot: 0 };
          k.tot++;
          if (ok === ex.qs.length) k.ok++;
          all[kind] = k;
          store.set('stats', all);
        }
      };
      $('#pSol', area).onclick = () => {
        const box = $('#pSolBox', area); box.hidden = false;
        if (!box.dataset.ans) { box.dataset.ans = '1'; box.insertAdjacentHTML('afterbegin', `<div class="kv">${ex.qs.map(q => `<div><span>${q.label}</span><b>${q.kind === 'poly' ? ansText(q) : esc(ansText(q))}</b></div>`).join('')}</div>`); }
        mountAll(box); typeset(box);
      };
      $('#pNew', area).onclick = fresh;
      typeset(area);
    };
    fresh();
  }

  /* ---------- Entregables: enunciado resuelto con corrección por apartado ---------- */
  const ENT = window.ENTREGAS || [];
  const entHelpers = { cw, mat: matBlock, tbl, kv, dev };
  const ansFull = q => esc(ansText(q)) + (q.alt ? q.alt.map(a => ` <span class="muted">o ${esc(sci(a))}</span>`).join('') : '');
  PAGES.entrega = (id) => {
    const e = ENT.find(x => x.id === id) || ENT[0];
    if (!e) return '<div class="page"><p>No hay entregables.</p></div>';
    const saved = store.get('ent:' + e.id, {});
    const input = (key, q) => q.kind === 'choice'
      ? `<select id="eq-${key}" data-eq="${key}"><option value="">Elige…</option>${q.opts.map(o => `<option value="${o[0]}" ${saved[key] === o[0] ? 'selected' : ''}>${o[1]}</option>`).join('')}</select>`
      : `<input type="text" class="mono" id="eq-${key}" data-eq="${key}" value="${esc(saved[key] || '')}" autocomplete="off" spellcheck="false">`;
    const total = e.problems.reduce((s, p) => s + p.parts.reduce((t, pt) => t + pt.qs.length, 0), 0);
    return `<div class="page"><header class="sec"><span class="eyebrow">Entregable · ${e.course}</span><h1>${e.title}</h1><p class="lead">${e.intro}</p>
      <details><summary>Un poco de historia</summary><div class="body prose">${e.history}</div></details>
      <div class="callout ojo"><b>Convenciones</b><span>${e.convention}</span></div>
      <p class="small muted">Números: vale coma decimal, fracciones y 3,6e-7. Matrices: filas de bits separadas por ; o por saltos de línea. Tus respuestas se guardan en este navegador.</p>
      <div class="row"><button class="btn pri" type="button" id="entAll">Corregir todo</button><button class="btn" type="button" id="entSols">Mostrar todas las soluciones</button><button class="btn ghost" type="button" id="entReset">Borrar mis respuestas</button><span class="score" id="entScore">${total} casillas</span></div></header>
      ${e.problems.map((p, pi) => `<section class="sec"><h2>${p.title}</h2><div class="statement">${p.statement}</div>
        ${p.parts.map((pt, k) => { const id = `${pi}-${k}`; return `<div class="part" data-part="${id}"><p class="q-text"><b class="tag">${pt.tag})</b>${pt.q}</p>
          <div class="q-list">${pt.qs.map((q, j) => { const key = `${id}-${j}`; return `<div class="q"><label for="eq-${key}">${q.label}</label>${q.kind === 'matrix' ? `<textarea id="eq-${key}" data-eq="${key}" spellcheck="false" style="min-height:70px">${esc(saved[key] || '')}</textarea>` : input(key, q)}<span class="mark" id="em-${key}"></span></div>`; }).join('')}</div>
          <div class="row"><button class="btn sm pri" type="button" data-echeck="${id}">Comprobar</button>${pt.hint ? `<button class="btn sm" type="button" data-ehint="${id}">Pista</button>` : ''}<button class="btn sm" type="button" data-esol="${id}">Solución</button><span class="score" data-escore="${id}"></span></div>
          ${pt.hint ? `<div class="callout idea" data-ehintbox="${id}" hidden><b>Pista</b><span>${pt.hint}</span></div>` : ''}
          <div class="example" data-esolbox="${id}" hidden><span class="lbl">Solución</span>${kv(pt.qs.map(q => [q.label, ansFull(q)]))}${pt.sol(entHelpers)}</div></div>`; }).join('')}</section>`).join('')}</div>`;
  };
  function entregaInit(root, id) {
    const e = ENT.find(x => x.id === id) || ENT[0]; if (!e) return;
    const saved = store.get('ent:' + e.id, {});
    const partOf = id => { const [pi, k] = id.split('-').map(Number); return e.problems[pi].parts[k]; };
    const checkPart = id => {
      const pt = partOf(id); let ok = 0;
      pt.qs.forEach((q, j) => { const key = `${id}-${j}`; const raw = $('#eq-' + key, root).value; const m = $('#em-' + key, root); if (!String(raw).trim()) { m.textContent = ''; m.className = 'mark'; return; } const good = checkQ(q, raw); if (good) ok++; m.textContent = good ? '✓' : '✗'; m.className = 'mark ' + (good ? 'ok' : 'no'); });
      $(`[data-escore="${id}"]`, root).textContent = `${ok}/${pt.qs.length}`;
      return [ok, pt.qs.length];
    };
    const toggle = (sel, key, show) => { const box = $(`[${sel}="${key}"]`, root); if (!box) return; box.hidden = show === undefined ? !box.hidden : !show; if (!box.hidden) { mountAll(box); typeset(box); } };
    root.addEventListener('input', ev => { const k = ev.target.dataset && ev.target.dataset.eq; if (!k) return; saved[k] = ev.target.value; store.set('ent:' + e.id, saved); });
    root.addEventListener('change', ev => { const k = ev.target.dataset && ev.target.dataset.eq; if (!k) return; saved[k] = ev.target.value; store.set('ent:' + e.id, saved); });
    $$('[data-echeck]', root).forEach(b => b.onclick = () => checkPart(b.dataset.echeck));
    $$('[data-ehint]', root).forEach(b => b.onclick = () => toggle('data-ehintbox', b.dataset.ehint));
    $$('[data-esol]', root).forEach(b => b.onclick = () => toggle('data-esolbox', b.dataset.esol));
    $('#entAll', root).onclick = () => { let ok = 0, tot = 0; $$('[data-part]', root).forEach(el => { const [a, b] = checkPart(el.dataset.part); ok += a; tot += b; }); $('#entScore', root).textContent = `${ok}/${tot} correctas`; };
    $('#entSols', root).onclick = () => $$('[data-esolbox]', root).forEach(b => toggle('data-esolbox', b.dataset.esolbox, true));
    $('#entReset', root).onclick = () => { if (!confirm('¿Borrar todas tus respuestas de este entregable?')) return; store.set('ent:' + e.id, {}); route(); };
    if (Object.keys(saved).length) $$('[data-part]', root).forEach(el => checkPart(el.dataset.part));
  }

  /* ---------- Router (solo #nombre: letras, dígitos y guiones) ---------- */
  function route() {
    const h = (location.hash || '#inicio').replace(/^#\/?/, '').replace('/', '-');
    const dash = h.indexOf('-');
    const head = dash < 0 ? h : h.slice(0, dash), tail = dash < 0 ? undefined : h.slice(dash + 1);
    const page = PAGES[head] ? head : 'inicio';
    const view = $('#view');
    view.innerHTML = PAGES[page](tail);
    $('#side').innerHTML = navHTML(tail ? [page, tail] : [page]);
    const t = $('h1', view); $('#crumb').textContent = crumbs[page] + (t && page !== 'inicio' ? ' · ' + t.textContent : '');
    if (page === 'calc') {
      $$('[data-calc]', view).forEach(el => { const w = el.dataset.calc; const st = Object.assign({}, CALC_DEFAULTS[w] || {}, store.get('calc:' + w, {})); mountWidget(el, w, st, { persist: w }); });
    }
    if (page === 'teoria') theoryInit(view);
    if (page === 'examenes') examInit(view);
    if (page === 'practica') practiceInit(view, tail);
    if (page === 'entrega') entregaInit(view, tail);
    if (page === 'inicio') {
      $$('[data-plan]', view).forEach(cb => cb.onchange = () => { const d = store.get('plan', {}); d[cb.dataset.plan] = cb.checked; store.set('plan', d); cb.closest('.todo').classList.toggle('done', cb.checked); });
      $('#examDateIn', view).onchange = ev => { store.set('examDate', ev.target.value); tick(); };
    }
    mountAll(view);
    typeset(view);
    wireSide();
    closeSide();
    window.scrollTo(0, 0);
  }

  /* ---------- Tema, menú, cuenta atrás ---------- */
  function applyTheme() {
    const t = store.get('theme', 'system');
    if (t === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
    const l = $('#themeLbl'); if (l) l.textContent = { system: 'sistema', light: 'claro', dark: 'oscuro' }[t];
  }
  function wireSide() {
    const b = $('#themeBtn'); if (b) b.onclick = () => { const order = ['system', 'light', 'dark']; const t = store.get('theme', 'system'); store.set('theme', order[(order.indexOf(t) + 1) % 3]); applyTheme(); };
    applyTheme();
  }
  function closeSide() { $('#side').classList.remove('open'); const s = $('.scrim'); if (s) s.remove(); }
  $('#menuBtn').onclick = () => { const side = $('#side'); side.classList.add('open'); const s = document.createElement('div'); s.className = 'scrim'; s.onclick = closeSide; document.body.appendChild(s); };
  function tick() {
    const el = $('#countdown'); const d0 = store.get('examDate', EXAM_DATE);
    if (!d0) { el.innerHTML = '<a href="#inicio">Pon la fecha del examen</a>'; return; }
    const ms = new Date(d0 + 'T09:00:00') - new Date();
    if (ms <= 0) { el.innerHTML = '<b>Examen pasado</b>'; return; }
    const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24;
    el.innerHTML = `Examen en <b>${d} d ${h} h</b>`;
  }
  tick(); setInterval(tick, 30000);
  window.addEventListener('hashchange', route);
  applyTheme();
  route();
})();
