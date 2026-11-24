/* Entregables resueltos y con corrección automática.
   Cada apartado trae sus casillas (qs), una pista y la solución; la solución es una función que recibe
   los ayudantes de app.js (cw, mat, tbl, kv, dev) para pintar palabras y matrices con el mismo estilo. */
(function () {
  'use strict';
  const R = String.raw;
  const B = s => [...s].map(Number);
  const rows = list => list.map(B);

  // Datos del E4, verificados enumerando las 32 palabras y los 2^10 patrones de error/borrado
  const W = ['000101110', '100101001', '001001101', '100110110', '110001100'];
  const GS = ['111110000', '011101000', '101100100', '110100010', '111000001'];
  const H = ['100010111', '010011011', '001011101', '000111110'];
  const GS2 = ['1111110000', '0011101000', '0101100100', '0110100010', '0111000001'];
  const H2 = ['1000010000', '0100010111', '0010011011', '0001011101', '0000111110'];
  const p = 1e-4, q = 1e-5;
  const bin = (n, k) => { let r = 1; for (let i = 0; i < k; i++) r = r * (n - i) / (i + 1); return r; };
  const sumW = (A, n, x) => A.reduce((s, a, i) => (i && a ? s + a * x ** i * (1 - x) ** (n - i) : s), 0);
  const A1 = [1, 0, 0, 4, 14, 8, 0, 4, 1, 0];
  const A2 = [1, 0, 0, 0, 18, 0, 8, 0, 5, 0, 0];
  const NB = [0, 0, 0, 0, 18, 108, 210, 120, 45, 10, 1]; // patrones de borrado que dejan más de una palabra compatible
  const pND = sumW(A1, 9, p);
  const pCorrT = 1 - (1 - p) ** 9 - 9 * p * (1 - p) ** 8;              // con α₀, α₁ (hasta t)
  const pCorrEx = pCorrT - 6 * p ** 2 * (1 - p) ** 7;                   // exacta, con α₂ = 6
  const pHibEx = 7.195141559697851e-11;                                 // enumeración de los 1024 patrones
  const pHibCota = (() => { let s = 0; for (let i = 3; i <= 10; i++) s += bin(10, i) * p ** i * (1 - p) ** (10 - i); return s; })();
  const pDet = 4.4968811157432865e-7;
  const pBorr = NB.reduce((s, x, e) => s + x * q ** e * (1 - q) ** (10 - e), 0);

  const e4 = {
    id: 'e4', title: 'E4 · Hamming y SEC-DED', short: 'E4 · Hamming y SEC-DED', course: 'Curso 2026/27', pdf: 'E4-2026-27_enunciado.pdf',
    intro: 'Código lineal C(9,5) para una memoria, su extensión SEC-DED con un bit de paridad global y su comportamiento en un canal con borrado. Escribe tus resultados en las casillas y pulsa Comprobar: cada apartado se corrige solo y trae la solución paso a paso.',
    history: R`<p>Hamming solo podía usar el ordenador de relés de los Laboratorios Bell los fines de semana, y la máquina se paraba cada vez que detectaba un error. De esa frustración salieron, en 1950, los primeros códigos que <b>corrigen</b> un error simple (SEC). Cuando las memorias necesitaron además <b>detectar</b> los dobles llegaron los SEC-DED; en 1970 Hsiao (IBM) propuso usar columnas de peso impar en la matriz de comprobación, y así siguen funcionando hoy las ECC de microcontroladores y FPGA.</p>`,
    convention: R`Convención de clase: sistemático con la redundancia a la izquierda, \(G_s=(P\mid I_k)\) y \(H=(I_{n-k}\mid P^t)\). En el problema 2 el bit de paridad global va en la <b>primera</b> posición, \(v'=(p,v_0,\dots,v_8)\): así el código sigue siendo sistemático y es la colocación con la que encajan las palabras del problema 3.`,
    problems: [
      {
        title: 'Problema 1 · Código lineal de la memoria',
        statement: R`<p>Una memoria almacena bloques de 5 bits de datos protegidos con un código lineal. Estas palabras, linealmente independientes, pertenecen al código:</p>
          <p class="mono">w₁ = 000101110 &nbsp; w₂ = 100101001 &nbsp; w₃ = 001001101 &nbsp; w₄ = 100110110 &nbsp; w₅ = 110001100</p>
          <p>En f) y g) el canal es un BSC con \(p=10^{-4}\).</p>`,
        parts: [
          { tag: 'a', q: R`Dimensiones \(n\) y \(k\) del código.`,
            qs: [{ label: 'n', ans: 9, tol: 0 }, { label: 'k', ans: 5, tol: 0 }],
            hint: R`La longitud de las palabras da \(n\). Cinco palabras independientes generan \(2^5\) palabras, y la memoria guarda 5 bits de datos.`,
            sol: h => R`<p>Cada palabra tiene 9 bits: \(n=9\). Hay 5 palabras linealmente independientes, que son una base del código (la memoria guarda 5 bits de datos, \(2^5=32\) palabras): \(k=5\). Redundancia \(n-k=4\), tasa \(k/n=5/9\approx0{,}556\).</p>` },
          { tag: 'b', q: R`Matriz generadora y de paridad en forma sistemática.`,
            qs: [{ label: 'Gₛ (5×9), filas separadas por ;', kind: 'matrix', ans: GS.join('') }, { label: 'H (4×9), filas separadas por ;', kind: 'matrix', ans: H.join('') }],
            hint: R`Las cinco palabras ya son una \(G\) válida, pero no sistemática. Suma filas (Gauss en GF(2)) hasta que las 5 últimas columnas sean \(I_5\).`,
            sol: h => R`<p>Ponemos las palabras como filas de \(G\) y hacemos Gauss para conseguir \(I_5\) en las cinco últimas columnas. Cada fila de \(G_s\) es una suma de palabras dadas, así que sigue siendo palabra código:</p>
              ${h.tbl(['fila de Gₛ', 'combinación', 'resultado'], [['g₁', 'w₁+w₂+w₃+w₄+w₅', h.cw(B(GS[0]), 4)], ['g₂', 'w₂+w₃+w₅', h.cw(B(GS[1]), 4)], ['g₃', 'w₂+w₃', h.cw(B(GS[2]), 4)], ['g₄', 'w₁+w₅', h.cw(B(GS[3]), 4)], ['g₅', 'w₃+w₅', h.cw(B(GS[4]), 4)]])}
              <div class="mats">${h.mat('Gₛ = (P | I₅)', rows(GS), 4)}${h.mat('H = (I₄ | Pᵗ)', rows(H))}</div>
              <p>Ecuaciones de paridad, con \(u=(v_4,\dots,v_8)\): \(v_0=u_0+u_2+u_3+u_4\), \(v_1=u_0+u_1+u_3+u_4\), \(v_2=u_0+u_1+u_2+u_4\), \(v_3=u_0+u_1+u_2+u_3\).</p>
              <p class="small muted">Comprobación: \(G_s H^t=0\), y las cinco palabras dadas tienen síndrome nulo.</p>` },
          { tag: 'c', q: R`Distancia mínima del código.`,
            qs: [{ label: 'dmin', ans: 3, tol: 0 }],
            hint: R`Mira las columnas de \(H\): ¿son todas distintas y no nulas? ¿Hay tres que sumen cero?`,
            sol: h => R`<p>Las columnas de \(H\) son 1000, 0100, 0010, 0001, 1111, 0111, 1011, 1101, 1110: todas distintas y no nulas, así que no hay dos linealmente dependientes y \(d_{min}\ge3\). Pero hay tres que suman cero, por ejemplo \(h_0+h_5+h_4=1000+0111+1111=0\), luego \(d_{min}=3\).</p>
              <p>Se confirma con la lista de pesos (apartado d): la palabra no nula más ligera pesa 3, por ejemplo ${h.cw(B('000110001'), 4)}. Con \(d_{min}=3\): \(s_{max}=2\), \(t_{max}=1\).</p>` },
          { tag: 'd', q: R`Distribución de palabras código \(A_i\).`,
            qs: [{ label: 'A₀, A₁, …, A₉ separados por comas', kind: 'list', ans: A1 }],
            hint: R`Son \(2^5=32\) palabras: genera todas con \(v=u\,G_s\) y cuenta pesos. Comprueba que suman 32.`,
            sol: h => R`<p>Enumerando las 32 palabras:</p>
              ${h.tbl(['i', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'], [['Aᵢ', ...A1]])}
              <p>\(1+4+14+8+4+1=32\). El código no es invariante al complemento (no contiene 111111111), por eso la distribución no es simétrica.</p>
              <div data-widget="lineal" data-mode="g" data-text="${W.join('; ')}" data-p="0.0001"></div>` },
          { tag: 'e', q: R`Distribución de pesos de los líderes de cogrupo \(\alpha_i\), hasta la capacidad de corrección.`,
            qs: [{ label: 'α₀', ans: 1, tol: 0 }, { label: 'α₁', ans: 9, tol: 0 }],
            hint: R`\(t=1\). Hay \(2^{n-k}=16\) síndromes. ¿Cuántos errores simples distintos hay y dan todos síndromes distintos?`,
            sol: h => R`<p>\(t=1\): \(\alpha_0=1\) (el error nulo) y \(\alpha_1=\binom91=9\), porque las 9 columnas de \(H\) son distintas y cada error simple ocupa su propio cogrupo.</p>
              <p>Quedan \(16-1-9=6\) cogrupos, que tienen líder de peso 2 (\(\alpha_2=6\)): el código <b>no es perfecto</b>, porque \(1+9=10\lt 16\).</p>` },
          { tag: 'f', q: R`Receptor detector con \(p=10^{-4}\): probabilidad de que un error pase inadvertido.`,
            qs: [{ label: 'P_ND', ans: pND, rel: 0.02 }],
            hint: R`Un error no se detecta cuando el patrón es una palabra código no nula: \(P_{ND}=\sum_{i\ge1}A_i\,p^i(1-p)^{n-i}\).`,
            sol: h => R`\[ P_{ND}=4p^3(1-p)^6+14p^4(1-p)^5+8p^5(1-p)^4+4p^7(1-p)^2+p^8(1-p) \]
              \[ P_{ND}\approx 4p^3=4\cdot10^{-12}\qquad(\text{exacta: }3{,}999\cdot10^{-12}) \]` },
          { tag: 'g', q: R`Receptor corrector (palabra más próxima): probabilidad de entregar una palabra distinta de la transmitida.`,
            qs: [{ label: 'P(error de corrección)', ans: pCorrT, alt: [pCorrEx], rel: 0.03 }],
            hint: R`Se acierta cuando el error es un líder de cogrupo: \(P_E=1-\sum_i\alpha_i\,p^i(1-p)^{n-i}\).`,
            sol: h => R`<p>Con los líderes hasta \(t=1\), como pide el enunciado:</p>
              \[ P_E=1-(1-p)^9-9p(1-p)^8\approx\binom92p^2=36\cdot10^{-8}=3{,}6\cdot10^{-7} \]
              <p>Si además se usan los 6 líderes de peso 2 (el decodificador también acierta en esos dobles), la exacta es \(P_E=1-(1-p)^9-9p(1-p)^8-6p^2(1-p)^7\approx30p^2=3{,}0\cdot10^{-7}\). Las dos respuestas se dan por buenas.</p>
              <div class="callout idea"><b>Compara con f)</b><span>Corregir cuesta mucho: \(3{,}6\cdot10^{-7}\) frente a \(4\cdot10^{-12}\). Un doble error, que el detector siempre ve, el corrector lo convierte casi siempre en un triple.</span></div>` }
        ]
      },
      {
        title: 'Problema 2 · Código SEC-DED con paridad global',
        statement: R`<p>Se añade un bit de paridad global de todos los bits de la palabra del problema 1 para corregir errores simples y detectar dobles. Canal BSC con \(p=10^{-4}\).</p>`,
        parts: [
          { tag: 'a', q: R`\(G\) y \(H\) sistemáticas del código extendido y su distancia mínima.`,
            qs: [{ label: "n'", ans: 10, tol: 0 }, { label: "k'", ans: 5, tol: 0 }, { label: "G'ₛ (5×10), paridad global en la 1.ª posición", kind: 'matrix', ans: GS2.join('') }, { label: "H' (5×10)", kind: 'matrix', ans: H2.join('') }, { label: "d'min", ans: 4, tol: 0 }],
            hint: R`A cada fila de \(G_s\) le añades delante la paridad de sus bits. La nueva redundancia son 5 bits: \(H'=(I_5\mid P'^t)\).`,
            sol: h => R`<p>\(v'=(p_g, v_0,\dots,v_8)\) con \(p_g=v_0+\dots+v_8\). Basta con extender cada fila de \(G_s\): la primera pesa 5 (impar, \(p_g=1\)) y las demás pesan 4 (\(p_g=0\)). Queda C(10,5), con 5 bits de redundancia:</p>
              <div class="mats">${h.mat("G'ₛ = (P' | I₅)", rows(GS2), 5)}${h.mat("H' = (I₅ | P'ᵗ)", rows(H2))}</div>
              <p>Curiosidad: \(p_g=u_0\), porque solo la primera fila tiene peso impar.</p>
              <p><b>Distancia mínima.</b> Las palabras de peso impar (3, 5, 7) ganan un 1 y pasan a peso par; las de peso par no cambian. Ya no hay pesos impares, así que \(d'_{min}=3+1=4\).</p>
              <p class="small muted">Forma equivalente no sistemática: \(H'=\begin{pmatrix}0 & H\\ 1 & 1\cdots1\end{pmatrix}\): la última fila es la ecuación de paridad global.</p>` },
          { tag: 'b', q: R`Justifica que corrige cualquier error simple y detecta cualquier doble.`,
            qs: [{ label: 'Modo con d′min = 4', kind: 'choice', ans: 't1s2', opts: [['t1s2', 't = 1 y s = 2'], ['t2s1', 't = 2 y s = 1'], ['t1s1', 't = 1 y s = 1'], ['t0s3', 'solo t = 0, s = 3']] },
              { label: 'Peso de todas las columnas de H′', kind: 'choice', ans: 'impar', opts: [['impar', 'Impar'], ['par', 'Par'], ['mixto', 'Unas pares y otras impares']] }],
            hint: R`\(d_{min}=s+t+1\). Y mira el peso de las columnas de \(H'\): ¿qué paridad tiene el síndrome de un error simple? ¿Y el de uno doble?`,
            sol: h => R`<p><b>Por distancia.</b> \(d'_{min}=4=s+t+1\) con \(t=1\), \(s=2\): las esferas de radio 1 alrededor de cada palabra no se tocan y un doble error queda a distancia \(\ge2\) de cualquier palabra, así que nunca cae en la esfera de otra.</p>
              <p><b>Por síndromes.</b> Las columnas de \(H'\) son 10000, 01000, 00100, 00010, 00001, 11111, 00111, 01011, 01101, 01110: todas distintas y de <b>peso impar</b> (la idea de Hsiao).</p>
              <ul><li>Error simple en la posición \(j\): \(s=h_j\), de peso impar y distinto para cada \(j\) → se identifica y se corrige.</li>
              <li>Error doble: \(s=h_i+h_j\), suma de dos impares → peso par y no nulo (las columnas son distintas). Nunca coincide con una columna, así que no se confunde con un simple → se detecta.</li></ul>
              <p>Regla del receptor: \(s=0\) acepta; \(s\) de peso impar igual a una columna corrige; \(s\) de peso par (o impar que no es columna) avisa de error.</p>` },
          { tag: 'c', q: R`Distribución de palabras código \(A'_i\).`,
            qs: [{ label: "A'₀, …, A'₁₀ separados por comas", kind: 'list', ans: A2 }],
            hint: R`Cada palabra de peso impar \(i\) pasa a peso \(i+1\); cada una de peso par se queda igual.`,
            sol: h => R`<p>\(A'_4=A_3+A_4=4+14=18\), \(A'_6=A_5=8\), \(A'_8=A_7+A_8=4+1=5\):</p>
              ${h.tbl(['i', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'], [["A'ᵢ", ...A2]])}
              <p>\(1+18+8+5=32\).</p>` },
          { tag: 'd', q: R`Receptor híbrido (corrige simples, detecta dobles) con \(p=10^{-4}\). Compara con el apartado g) del problema 1.`,
            qs: [{ label: 'P(error) del receptor híbrido', ans: pHibEx, alt: [pHibCota], rel: 0.04 }, { label: 'P(detecta y no corrige) ≈ C(10,2)p²', ans: pDet, rel: 0.03 }],
            hint: R`Zonas de \(\omega(e)\): 0 bien; 1 se corrige; 2 se detecta; 3 o más es la zona de error residual. Para afinar: un triple solo engaña al receptor si cae a distancia 1 de una palabra de peso 4.`,
            sol: h => R`<p><b>Fórmula de clase</b> (todo lo que tiene 3 o más errores cuenta como error residual):</p>
              \[ P_E\le\sum_{i=3}^{10}\binom{10}{i}p^i(1-p)^{10-i}\approx\binom{10}{3}p^3=1{,}2\cdot10^{-10} \]
              <p><b>Exacta.</b> De los 120 triples, solo fallan los que están a distancia 1 de una palabra de peso 4: \(4A'_4=72\) (el receptor los "corrige" hacia esa palabra). Los otros 48 dan un síndrome que no es columna y se detectan. Los cuádruples que son palabra código pasan sin verse:</p>
              \[ P_E\approx 72p^3+18p^4\approx7{,}2\cdot10^{-11} \]
              <p>Las dos se dan por buenas. Además, con probabilidad \(\approx\binom{10}{2}p^2=4{,}5\cdot10^{-7}\) el receptor avisa de un error que no puede corregir.</p>
              <div class="callout idea"><b>Comparación con P1 g)</b><span>El corrector puro del problema 1 se equivocaba con \(3{,}6\cdot10^{-7}\). Con un solo bit más, el híbrido baja a \(\approx7\cdot10^{-11}\), unas 5000 veces menos: los dobles, que antes se corregían mal, ahora se detectan. A cambio pierde tasa (5/10 frente a 5/9) y hay que gestionar los avisos.</span></div>` }
        ]
      },
      {
        title: 'Problema 3 · Canal con borrado',
        statement: R`<p>El canal borra cada posición con probabilidad \(q\), de forma independiente, y el receptor sabe qué posiciones se han borrado. Corrige cuando hay una única palabra código compatible con las posiciones conocidas; si hay más de una, es error de corrección. En b), c) y d) el código es el SEC-DED del problema 2, con la paridad global en la primera posición.</p>`,
        parts: [
          { tag: 'a', q: R`Capacidad correctora de un código con \(d_{min}\) en un canal con borrado.`,
            qs: [{ label: 'Número de borrados que se corrigen siempre', kind: 'choice', ans: 'd1', opts: [['t', '⌊(dmin−1)/2⌋'], ['d1', 'dmin − 1'], ['d', 'dmin'], ['nk', 'n − k']] }],
            hint: R`Si dos palabras distintas coinciden en todas las posiciones conocidas, ¿dónde están las diferencias?`,
            sol: h => R`<p>Si dos palabras código \(v\ne v'\) son compatibles con lo recibido, coinciden en todas las posiciones no borradas: todas sus diferencias están en las \(e\) posiciones borradas. Entonces \(d(v,v')\le e\). Si \(e\le d_{min}-1\) eso es imposible, así que la palabra es única.</p>
              <p><b>Corrige siempre hasta \(d_{min}-1\) borrados</b>: el doble que en un BSC (\(t=\lfloor(d_{min}-1)/2\rfloor\)), porque el receptor ya sabe dónde están los errores.</p>
              <p>Con \(e\ge d_{min}\) puede fallar: falla exactamente cuando las posiciones borradas contienen el soporte de alguna palabra código no nula. Con \(e\gt n-k\) falla siempre (quedan menos de \(k\) bits conocidos). Por eso \(P_{\text{error corr}}\approx A_{d_{min}}\,q^{d_{min}}\).</p>` },
          { tag: 'b', q: R`Capacidad correctora del SEC-DED en el canal con borrado.`,
            qs: [{ label: 'Borrados que corrige siempre', ans: 3, tol: 0 }, { label: 'Patrones de 4 borrados (de 210) que no se pueden corregir', ans: 18, tol: 0 }, { label: '¿A partir de cuántos borrados falla siempre?', ans: 6, tol: 0 }],
            hint: R`\(d'_{min}=4\). Un patrón de 4 borrados falla si coincide con el soporte de una palabra de peso 4. ¿Cuántas hay?`,
            sol: h => R`<p>\(d'_{min}=4\): corrige <b>cualquier</b> combinación de hasta 3 borrados.</p>
              <p>Con 4 borrados solo falla si las 4 posiciones son el soporte de una palabra de peso 4: \(A'_4=18\) patrones de \(\binom{10}{4}=210\) (un 8,6 %). Con 6 o más borrados quedan 4 bits conocidos o menos, menos que \(k=5\), y siempre hay varias palabras compatibles.</p>
              ${h.tbl(['borrados e', '0–3', '4', '5', '6', '7', '8', '9', '10'], [['patrones que fallan', '0', '18 / 210', '108 / 252', '210 / 210', '120 / 120', '45 / 45', '10 / 10', '1 / 1']])}` },
          { tag: 'c', q: R`Corrige \(r_a=\)11001b0110, \(r_b=\)01b0b0b1b1 y \(r_c=\)b0bb1b01b1. Da un ejemplo de corrección indebida con 4 borrados.`,
            qs: [{ label: 'Palabra corregida para rₐ', kind: 'bits', ans: '1100110110' }, { label: 'Palabra corregida para r_b', kind: 'bits', ans: '0100000111' },
              { label: 'r_c', kind: 'choice', ans: 'amb', opts: [['uno', 'Una sola palabra compatible'], ['amb', 'Dos palabras compatibles: error de corrección'], ['cero', 'Ninguna palabra compatible']] }],
            hint: R`Escribe las ecuaciones de \(H'\) y despeja los bits borrados: \(v_0=v_5\), \(v_1=v_5+v_7+v_8+v_9\), \(v_2=v_5+v_6+v_8+v_9\), \(v_3=v_5+v_6+v_7+v_9\), \(v_4=v_5+v_6+v_7+v_8\).`,
            sol: h => R`<p>Ecuaciones de paridad de \(H'\), con la información en \(v_5\dots v_9\): \(v_0=v_5\), \(v_1=v_5+v_7+v_8+v_9\), \(v_2=v_5+v_6+v_8+v_9\), \(v_3=v_5+v_6+v_7+v_9\), \(v_4=v_5+v_6+v_7+v_8\). Los bits borrados son incógnitas.</p>
              <p><b>\(r_a\)</b>: 1 borrado (\(v_5\)), menos de \(d'_{min}\), así que se corrige seguro. \(v_0=v_5\Rightarrow v_5=1\) → ${h.cw(B('1100110110'), 5)}. Comprobación: \(v_1=1+1+1+0=1\) ✓, \(v_4=1+0+1+1=1\) ✓.</p>
              <p><b>\(r_b\)</b>: 4 borrados (\(v_2,v_4,v_6,v_8\)). Las posiciones {2, 4, 6, 8} no son el soporte de ninguna palabra de peso 4, así que la solución es única. Con \(v_5=0\), \(v_7=1\), \(v_9=1\): de \(v_1\): \(1=0+1+v_8+1\Rightarrow v_8=1\); de \(v_3\): \(0=0+v_6+1+1\Rightarrow v_6=0\); \(v_2=0+0+1+1=0\); \(v_4=0+0+1+1=0\) → ${h.cw(B('0100000111'), 5)}.</p>
              <p><b>\(r_c\)</b>: 5 borrados (\(v_0,v_2,v_3,v_5,v_8\)). Quedan dos palabras compatibles, ${h.cw(B('0010100101'), 5)} y ${h.cw(B('1011110111'), 5)}, que difieren en 1001010010, palabra de peso 4 con soporte {0, 3, 5, 8} dentro de los borrados. <b>Error de corrección</b>: el receptor no puede decidir.</p>
              <p><b>Corrección indebida con 4 borrados.</b> Se transmite 0000000000 y se borran las posiciones {0, 4, 5, 9}, el soporte de la palabra ${h.cw(B('1000110001'), 5)}. Llega b000bb000b, compatible con las dos; si el receptor entrega 1000110001, entrega una palabra que no se transmitió. Vale cualquier palabra transmitida con los borrados sobre el soporte de una de las 18 palabras de peso 4.</p>` },
          { tag: 'd', q: R`Probabilidad de error de corrección del SEC-DED con \(q=10^{-5}\).`,
            qs: [{ label: 'P(error de corrección)', ans: pBorr, rel: 0.03 }],
            hint: R`Suma, para cada número de borrados \(e\), los patrones que fallan por \(q^e(1-q)^{10-e}\). Domina el primer término.`,
            sol: h => R`\[ P=\sum_e N_e\,q^e(1-q)^{10-e}=18q^4(1-q)^6+108q^5(1-q)^5+210q^6(1-q)^4+\dots \]
              \[ P\approx A'_4\,q^4=18\cdot10^{-20}=1{,}8\cdot10^{-19} \]
              <p class="small muted">La cota sin conocer \(A'_4\), \(\binom{10}{4}q^4=2{,}1\cdot10^{-18}\), es unas 12 veces mayor.</p>` }
        ]
      }
    ]
  };

  window.ENTREGAS = [e4];
})();
