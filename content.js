/* Contenido del 2.º parcial (temas 4 a 7): lecciones, teoría, exámenes y chuleta.
   Los <div data-widget="..."> se convierten en calculadoras o diagramas al pintar la página. */
window.CONTENT = (function () {
  const R = String.raw;

  const temas = [
    { n: 4, first: 'capacidad', title: 'Capacidad de canal', desc: 'BSC, borrado, simétricos y 2.º teorema de Shannon' },
    { n: 5, first: 'lineales', title: 'Códigos lineales', desc: 'G, H, síndrome, d_min, tabla estándar y Hamming' },
    { n: 6, first: 'ciclicos', title: 'Códigos cíclicos', desc: 'g(x), h(x), circuitos, ráfagas y recortados' },
    { n: 7, first: 'arq', title: 'FEC y ARQ', desc: 'Cadencia eficaz, parada y espera, envío continuo e híbridos' }
  ];

  const lessons = [
    /* ------------------------------------------------------------------ */
    {
      id: 'capacidad', n: 1, tema: 4, title: 'Capacidad de un canal discreto',
      practice: ['bsc', 'cascada', 'simetrico', 'borrado'],
      html: R`
<div class="sec prose">
  <p class="lead">Un canal mete errores. La capacidad mide cuántos bits de información pueden cruzarlo por cada símbolo que envías, usando el mejor código posible. Se apoya en la información mutua, que ya viste en el primer parcial.</p>
  <div data-widget="bloques"></div>
</div>

<div class="sec prose">
  <h3>1. Definición</h3>
  <p>Un canal discreto sin memoria se describe con su alfabeto de entrada \(\mathcal X\), su alfabeto de salida \(\mathcal Y\) y la matriz de transición \(Q=p(y/x)\), con una fila por cada símbolo de entrada. Cada fila suma 1.</p>
  <div class="fbox"><span class="lbl">Capacidad</span>\[ C=\max_{p(x)} I(X;Y)\quad\text{bits por uso del canal} \]
  \[ I(X;Y)=H(X)-H(X/Y)=H(Y)-H(Y/X) \]</div>
  <p>El canal fija \(Q\), y tú eliges cómo usar la entrada: por eso se maximiza sobre \(p(x)\). En el examen piden siempre la capacidad <b>y la distribución de entrada que la consigue</b>.</p>
  <p>Si el canal transmite \(v\) símbolos por segundo (baudios), la cadencia máxima de información es:</p>
  <div class="fbox"><span class="lbl">Cadencia máxima</span>\[ V=C\cdot v\quad\text{bit/s} \]</div>
  <p class="small muted">Ejemplo de las transparencias: v = 10.000 símb/s y C = 0,8 bits/símbolo dan V = 8.000 bit/s de información.</p>
</div>

<div class="sec prose">
  <h3>2. Las dos formas de empezar</h3>
  <ul>
    <li>Si conocer la salida determina la entrada, \(H(X/Y)=0\) y \(C=\max H(X)\). Usa \(I=H(X)-H(X/Y)\).</li>
    <li>En casi todos los demás casos, usa \(I=H(Y)-H(Y/X)\). \(H(Y/X)=\sum_x p(x)H(Y/X=x)\) se saca de las filas de \(Q\), y \(p(y)=\sum_x p(x)\,p(y/x)\).</li>
  </ul>
</div>

<div class="sec prose">
  <h3>3. Canales típicos</h3>
  <p><b>Binario sin ruido.</b> \(Q=I\): \(C=\max H(X)=1\) bit, con \(p(x)=(\tfrac12,\tfrac12)\).</p>
  <p><b>Ruidoso con salidas no solapadas.</b> Dos salidas por entrada, pero ninguna se comparte. Por ejemplo, \(Q=\begin{pmatrix}\tfrac12&\tfrac12&0&0\\0&0&\tfrac12&\tfrac12\end{pmatrix}\). La salida revela la entrada, \(H(X/Y)=0\) y \(C=1\) bit.</p>
  <p><b>Máquina de escribir ruidosa.</b> 26 letras: cada tecla sale bien o como la siguiente, con probabilidad ½. \(H(Y/X)=1\) bit y \(C=\log_2 26-1=\log_2 13=3{,}70\) bits. Se consigue también escribiendo solo una letra de cada dos, \(p(x)=(\tfrac1{13},0,\tfrac1{13},0,\dots)\), porque así las salidas no se solapan y no hay ningún error.</p>
  <p><b>BSC, canal binario simétrico.</b> Probabilidad de error \(p\) igual para los dos símbolos:</p>
  <div class="fbox"><span class="lbl">BSC</span>\[ Q=\begin{pmatrix}1-p&p\\p&1-p\end{pmatrix},\quad H(Y/X)=H(p),\quad C=1-H(p)\ \text{bits},\quad p(x)=(\tfrac12,\tfrac12) \]</div>
  <p>Con \(p=\tfrac12\), \(C=0\): la salida no dice nada de la entrada.</p>
  <div data-widget="bsc" data-p="0.1" data-times="1" data-v="10000"></div>
  <div class="example"><span class="lbl">Examen enero 2025 · dos BSC en cascada</span>
    <p>El bit sale mal si falla exactamente uno de los dos: \(p'=2p(1-p)\). La cascada es otro BSC, luego \(C=1-H\big(2p(1-p),\ (1-p)^2+p^2\big)\) con entrada uniforme. Prueba a poner 2 en la casilla de cascada de arriba.</p>
  </div>
  <p><b>Canal binario con borrado.</b> El canal avisa: con probabilidad \(\alpha\) entrega el símbolo \(e\) y dice que no sabe qué era.</p>
  <div class="fbox"><span class="lbl">Borrado</span>\[ Q=\begin{pmatrix}1-\alpha&\alpha&0\\0&\alpha&1-\alpha\end{pmatrix},\quad H(Y/X)=H(\alpha) \]
  \[ H(Y)=H(\alpha)+(1-\alpha)H(p),\quad C=\max_{p}\,(1-\alpha)H(p)=1-\alpha\ \text{bits},\ \ p=\tfrac12 \]</div>
  <p>\(H(Y)\) sale agrupando: \(Z\) indica si hubo borrado o no, \(H(Y)=H(Z)+H(Y/Z)\). No se llega a \(\log|\mathcal Y|\), porque \(p(y)\) casi nunca puede ser uniforme. Se pierde justo la fracción \(\alpha\) de los bits.</p>
  <div data-widget="bec" data-a="0.2" data-px="0.5"></div>
</div>

<div class="sec prose">
  <h3>4. Canales simétricos y débilmente simétricos</h3>
  <div class="phrase">
    <div>Canal</div><div>Condición sobre Q</div>
    <div><b>Simétrico</b></div><div>Filas permutaciones entre sí, y columnas permutaciones entre sí.</div>
    <div><b>Débilmente simétrico</b></div><div>Filas permutaciones entre sí, y todas las columnas suman lo mismo.</div>
  </div>
  <div class="fbox"><span class="lbl">Capacidad de ambos</span>\[ C=\log_2|\mathcal Y|-H(\text{fila de }Q),\qquad p(x)\text{ uniforme} \]</div>
  <p>Todo canal simétrico es débilmente simétrico; al revés no. La demostración cae en teoría (enero 2023 y enero 2026):</p>
  <ol class="steps">
    <li><div><b>Filas.</b> \(H(Y/X)=\sum_x p(x)H(Y/X=x)=\sum_x p(x)H(\text{fila})=H(\text{fila})\), porque todas las filas tienen la misma entropía. No depende de \(p(x)\).</div></li>
    <li><div><b>Reduzco el máximo.</b> \(C=\max_{p(x)}\big(H(Y)-H(\text{fila})\big)=\max_{p(x)}H(Y)-H(\text{fila})\).</div></li>
    <li><div><b>Columnas.</b> \(H(Y)\le\log|\mathcal Y|\), con igualdad si \(Y\) es uniforme. Con entrada uniforme, \(p(y)=\sum_x\frac1{|\mathcal X|}Q_{xy}\) es la suma de una columna entre \(|\mathcal X|\), igual para todas. Luego \(Y\) es uniforme y se alcanza la cota.</div></li>
  </ol>
  <div class="example"><span class="lbl">Ejemplos de clase</span>
    <p>Simétrico: filas \((0{,}5;\ 0{,}3;\ 0{,}2)\) y permutaciones: \(C=\log_2 3-H(0{,}5;\ 0{,}3;\ 0{,}2)=1{,}585-1{,}485=0{,}1\) bits.</p>
    <p>Débilmente simétrico: \(Q=\begin{pmatrix}\tfrac13&\tfrac16&\tfrac12\\\tfrac13&\tfrac12&\tfrac16\end{pmatrix}\): \(C=\log_2 3-H(\tfrac13,\tfrac16,\tfrac12)=0{,}126\) bits.</p>
  </div>
  <div data-widget="canal" data-matrix="1/3 1/6 1/2; 1/3 1/2 1/6"></div>
</div>

<div class="sec prose">
  <h3>5. Canales sin fórmula: se maximiza a mano</h3>
  <p>Si las filas no son permutaciones, escribe \(I(X;Y)\) en función de \(p(x)\). Tres patrones cubren lo que ha caído.</p>
  <div class="example"><span class="lbl">Examen enero 2026 · a</span>
    <p>\(Q=\begin{pmatrix}1&0\\\tfrac12&\tfrac12\\0&1\end{pmatrix}\). Entradas con probabilidades \(a,b,c\). \(H(Y/X)=b\), porque solo la fila central tiene incertidumbre (1 bit). \(H(Y)=H(a+\tfrac b2,\ c+\tfrac b2)\le 1\), con igualdad si \(a=c\). Entonces \(I=1-b\), máxima con \(b=0\): \(C=1\) bit con \(p(x)=(\tfrac12,0,\tfrac12)\). Conviene no usar la entrada ruidosa.</p>
  </div>
  <div class="example"><span class="lbl">Examen enero 2026 · c</span>
    <p>\(Q\) de cuatro entradas donde cada una sale bien con \(1-x\) o se pierde en un símbolo común con \(x\). Es un borrado cuaternario. \(H(Y/X)=H(x)\) y, agrupando, \(H(Y)=(1-x)H(p_0,p_1,p_2,p_3)+H(x)\). Entonces \(I=(1-x)H(p_0,\dots,p_3)\), máxima con entrada uniforme: \(C=2(1-x)\) bits.</p>
  </div>
  <div class="example"><span class="lbl">Clase · canal en Z</span>
    <p>\(Q=\begin{pmatrix}1&0\\\tfrac12&\tfrac12\end{pmatrix}\). Con \(P(X=1)=\pi\): \(p(Y=1)=\pi/2\), \(H(Y/X)=\pi\) e \(I=H(\pi/2)-\pi\). Derivando sale \(\pi=\tfrac25\) y \(C=\log_2\tfrac54=0{,}322\) bits. Compruébalo aquí:</p>
    <div data-widget="canal" data-matrix="1 0; 1/2 1/2"></div>
  </div>
</div>

<div class="sec prose">
  <h3>6. Propiedades de la capacidad</h3>
  <ul>
    <li>\(C\ge0\), porque \(I(X;Y)\ge0\).</li>
    <li>\(C\le\log|\mathcal X|\) y \(C\le\log|\mathcal Y|\), porque \(I\le H(X)\) e \(I\le H(Y)\).</li>
    <li>\(I(X;Y)\) es continua en \(p(x)\) y tiene forma de ∩ (las transparencias la llaman convexa). Por eso un máximo local es el máximo global y se puede buscar derivando.</li>
  </ul>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'shannon2', n: 2, tema: 4, title: 'Segundo teorema de Shannon y canales continuos',
      practice: ['bsc', 'simetrico'],
      html: R`
<div class="sec prose">
  <p class="lead">La capacidad no es solo un máximo matemático. Shannon demostró que es la frontera exacta: por debajo se puede transmitir casi sin errores y por encima no.</p>
</div>
<div class="sec prose">
  <h3>1. Códigos de canal</h3>
  <p>Una estrategia natural contra los errores es la redundancia. Repetir cada bit tres veces crea el repertorio \(\{000,111\}\) y el receptor decide por mayoría. Pero la línea rinde un tercio: a 30.000 bit/s solo llevas 10.000 bit/s de información.</p>
  <p>Un código \((M,n)\) asigna a cada uno de los \(M\) símbolos de la fuente una palabra de \(n\) bits. Su cadencia es:</p>
  <div class="fbox"><span class="lbl">Cadencia de un código</span>\[ R=\frac{k}{n}=\frac{\log_2 M}{n}\ \ \frac{\text{bits de fuente}}{\text{bits de canal}},\qquad M=2^{nR} \]</div>
  <div class="callout ojo"><b>Ojo con la notación</b><span>Aquí \(R=k/n\) es la cadencia de un código y no tiene unidades de tiempo. En ARQ, \(R\) es el régimen binario del canal en bit/s. La solución oficial de enero de 2023 avisa de este cambio.</span></div>
</div>
<div class="sec prose">
  <h3>2. El teorema</h3>
  <div class="fbox"><span class="lbl">2.º teorema de Shannon (codificación de canal)</span>
    <p><b>Directo:</b> para cualquier cadencia \(R\lt C\) existe una secuencia de códigos \((2^{nR},n)\) cuya probabilidad de error tiende a 0 cuando \(n\to\infty\).</p>
    <p><b>Inverso:</b> ninguna cadencia \(R\gt C\) es alcanzable: no existe una secuencia de códigos con probabilidad de error tendiendo a 0.</p>
  </div>
  <ul>
    <li>Se puede bajar el error tanto como se quiera <b>manteniendo \(k/n\) constante</b>: no hace falta aumentar la redundancia, sino alargar las palabras. Esta frase la pidieron en junio de 2024.</li>
    <li>Es un teorema de existencia: no dice cómo construir el código. Para eso están los temas 5 y 6.</li>
  </ul>
  <p>Relación con ARQ (enero 2023): la cadencia eficaz siempre queda por debajo de la capacidad. En un BSC, \(C=1-H(p)\approx1\) y \(\rho=C_{ef}/R\lt 1\), así que estamos en la zona donde el teorema permite una probabilidad de error residual tan pequeña como se quiera.</p>
</div>
<div class="sec prose">
  <h3>3. Canales continuos</h3>
  <div class="fbox"><span class="lbl">Shannon-Hartley</span>\[ C=B\log_2\!\left(1+\frac SN\right)\ \text{bit/s},\qquad \frac SN\Big|_{\text{lineal}}=10^{(S/N)_{dB}/10} \]</div>
  <p>Con S/N = 30 dB, que es 1.000 en lineal: canal telefónico de 3,1 kHz, C ≈ 31 kbit/s. Canal de TV de 8 MHz, C ≈ 80 Mbit/s.</p>
  <div data-widget="hartley" data-b="3100" data-snr="30"></div>
  <div class="example"><span class="lbl">Clase · ¿cuál de estos tres canales lleva más información?</span>
    <p>Analógico con W = 1300 Hz y S/N = 20 dB: \(C=1300\log_2 101=8.656\) bit/s.</p>
    <p>Digital binario con 10.000 símb/s y \(P_e=10^{-3}\): \(C=1-H(10^{-3})=0{,}9886\) bits/uso, luego \(V=9.886\) bit/s.</p>
    <p>Digital ternario con 6.200 símb/s y \(P_e=10^{-4}\): si el error se reparte a partes iguales, \(C=\log_2 3-H(1-10^{-4},\ \tfrac12 10^{-4},\ \tfrac12 10^{-4})\approx1{,}583\) y \(V\approx9.817\) bit/s.</p>
    <p>Gana el binario por poco, aunque el ternario lleve más bits por símbolo: importa el producto \(C\cdot v\).</p>
  </div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'lineales', n: 3, tema: 5, title: 'Álgebra binaria y códigos lineales',
      practice: ['lineal'],
      html: R`
<div class="sec prose">
  <p class="lead">Un código de canal elige \(2^k\) palabras de entre las \(2^n\) posibles y deja las demás como margen: si llega una de esas, hubo error. Si además las elegidas forman un subespacio vectorial, todo se calcula con matrices.</p>
</div>
<div class="sec prose">
  <h3>1. Álgebra binaria: GF(2)</h3>
  <p>Solo existen 0 y 1. La suma es XOR y el producto es AND. Sumar y restar son lo mismo, porque \(1+1=0\).</p>
  <div class="tbl-wrap"><table><tr><th>+</th><th>0</th><th>1</th><th></th><th>·</th><th>0</th><th>1</th></tr><tr><th>0</th><td>0</td><td>1</td><td></td><th>0</th><td>0</td><td>0</td></tr><tr><th>1</th><td>1</td><td>0</td><td></td><th>1</th><td>0</td><td>1</td></tr></table></div>
  <ul>
    <li><b>Grupo:</b> una operación asociativa con neutro e inversos. <b>Conmutativo</b> si además \(a*b=b*a\).</li>
    <li><b>Cuerpo:</b> grupo conmutativo con +, los elementos no nulos forman grupo conmutativo con ·, y · es distributiva. Con alfabeto finito es un cuerpo de Galois: \(\{0,1\}\) es GF(2).</li>
    <li>\(V_n\): las \(2^n\) n-tuplas forman un espacio vectorial sobre GF(2), de dimensión \(n\).</li>
    <li><b>Subespacio</b> \(S\subseteq V_n\): contiene al \(\vec 0\) y la suma de dos elementos sigue dentro.</li>
    <li>\(\vec u\cdot\vec v=u_0v_0+\dots+u_{n-1}v_{n-1}\). Son <b>ortogonales</b> si vale 0.</li>
    <li><b>Espacio dual</b> \(S_d\): los vectores ortogonales a todos los de \(S\). Si \(\dim S=k\), \(\dim S_d=n-k\).</li>
  </ul>
</div>
<div class="sec prose">
  <h3>2. Qué es un código lineal</h3>
  <div class="fbox"><span class="lbl">Definición</span><p>Un código de longitud \(n\) y \(2^k\) palabras es <b>lineal</b> \(C(n,k)\) si y solo si sus \(2^k\) palabras forman un subespacio vectorial de dimensión \(k\) de \(V_n\). Es decir: el \(\vec 0\) es palabra código y la suma de dos palabras código es palabra código.</p></div>
  <p>Clasificación de clase: lineales (bloque o convolucionales; los de bloque, cíclicos o no y sistemáticos o no) y no lineales. <b>Bloque</b> significa que los \(n\) bits solo dependen de los \(k\) bits actuales.</p>
  <ul>
    <li>Bits de redundancia: \(m=n-k\). Eficiencia o tasa: \(k/n\).</li>
    <li>Debe cumplirse \(0\lt k\lt n\). Por eso no vale cualquier subespacio (junio 2023): quedan fuera el trivial y el propio \(V_n\), porque no aporta redundancia.</li>
  </ul>
</div>
<div class="sec prose">
  <h3>3. Matriz generadora G</h3>
  <p>Todo subespacio tiene una base de \(k\) vectores linealmente independientes. Ponlos en filas y tienes \(G\), de tamaño \(k\times n\):</p>
  <div class="fbox"><span class="lbl">Codificar</span>\[ \vec v=\vec u\cdot G=u_0\vec g_0+u_1\vec g_1+\dots+u_{k-1}\vec g_{k-1} \]</div>
  <div class="example"><span class="lbl">Ejemplo de clase · C(7,4)</span>
    <p>\(G=\begin{pmatrix}1&1&0&1&0&0&0\\0&1&1&0&1&0&0\\1&1&1&0&0&1&0\\1&0&1&0&0&0&1\end{pmatrix}\). Con \(\vec u=(1101)\) se suman las filas 1, 2 y 4: \(\vec v=(0001101)\).</p>
  </div>
</div>
<div class="sec prose">
  <h3>4. Estructura sistemática</h3>
  <p>Los \(k\) bits de información aparecen tal cual en la palabra. En clase van a la derecha y la redundancia a la izquierda:</p>
  <div class="fbox"><span class="lbl">Forma sistemática</span>\[ G_s=(P\ |\ I_k),\qquad v_{n-k+i}=u_i,\qquad v_j=u_0p_{0j}+u_1p_{1j}+\dots+u_{k-1}p_{k-1,j} \]</div>
  <p>Las ecuaciones de \(v_j\), \(j\lt n-k\), son las <b>ecuaciones de paridad</b>. Para pasar de ecuaciones a \(G\): cada columna de \(P\) es una ecuación y cada fila es un \(u_i\). A \(G_s\) se llega desde cualquier \(G\) con operaciones de filas.</p>
  <div class="example"><span class="lbl">Bit de paridad simple · C(6,5)</span>
    <p>\(v_0=u_0+u_1+u_2+u_3+u_4\) y \(v_{i+1}=u_i\). Solo detecta errores de peso impar: tiene \(d_{min}=2\).</p>
  </div>
  <p>El circuito es directo: un registro con \(\vec u\), una puerta XOR por cada ecuación de paridad y un registro de salida con la redundancia.</p>
  <div data-widget="lineal" data-mode="eq" data-text="v0=u0+u2+u3; v1=u0+u1+u2; v2=u1+u2+u3"></div>
  <div class="callout ojo"><b>Trampa de junio de 2026</b><span>El enunciado da las ecuaciones con la información al final, pero la solución oficial escribe \(G\) como \((I\,|\,P)\). Son códigos equivalentes por permutación de columnas: misma \(d_{min}\) y mismos pesos. En tu examen, sigue el orden del enunciado.</span></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'matriz', n: 4, tema: 5, title: 'Matriz H, síndrome y detección',
      practice: ['lineal', 'sindrome', 'probcod'],
      html: R`
<div class="sec prose">
  <p class="lead">En recepción hay que responder a una pregunta: ¿esto que ha llegado es una palabra código? La matriz de paridad lo contesta con una sola multiplicación.</p>
</div>
<div class="sec prose">
  <h3>1. Matriz de comprobación de paridad</h3>
  <p>Para toda \(G\) existe \(H\) de tamaño \((n-k)\times n\) con filas linealmente independientes y ortogonales a las de \(G\). Por tanto, \(\vec v\cdot H^t=\vec 0\) para toda palabra código, y solo para ellas.</p>
  <div class="fbox"><span class="lbl">Cálculo de H</span>\[ G_s=(P\ |\ I_k)\ \Rightarrow\ H=(I_{n-k}\ |\ P^t) \]</div>
  <p>Las filas de \(H\) generan el código dual.</p>
</div>
<div class="sec prose">
  <h3>2. Síndrome</h3>
  <p>El canal suma un vector de error: \(\vec r=\vec v+\vec e\), con \(e_i=1\) si el bit \(i\) cambió.</p>
  <div class="fbox"><span class="lbl">Síndrome</span>\[ \vec s=\vec r\cdot H^t=(\vec v+\vec e)H^t=\underbrace{\vec vH^t}_{\vec 0}+\vec eH^t=\vec e\cdot H^t \]</div>
  <p>Esta línea es la demostración que pidieron en enero de 2023: <b>el síndrome solo depende del error</b>, no de la palabra enviada. Tres casos:</p>
  <div class="tbl-wrap"><table class="text">
    <tr><th>Síndrome</th><th>Vector error</th><th>Significado</th></tr>
    <tr><td>\(\vec s\ne\vec 0\)</td><td>\(\vec e\notin C\)</td><td>Hay error y se ha detectado.</td></tr>
    <tr><td>\(\vec s=\vec 0\)</td><td>\(\vec e=\vec 0\)</td><td>No hay error.</td></tr>
    <tr><td>\(\vec s=\vec 0\)</td><td>\(\vec e\ne\vec 0,\ \vec e\in C\)</td><td><b>Error indetectable:</b> el canal convirtió una palabra código en otra.</td></tr>
  </table></div>
  <p>\(\vec s=\vec eH^t\) es un sistema de \(n-k\) ecuaciones con \(n\) incógnitas: tiene \(2^k\) soluciones. Por eso no basta el síndrome para conocer el error y hay que quedarse con la más probable. Cada bit \(e_j=1\) suma la columna \(j\) de \(H\): el síndrome de un error simple es esa columna.</p>
  <div class="example"><span class="lbl">Ejemplo de clase · C(7,4)</span>
    <p>\(H=\begin{pmatrix}1&0&0&1&0&1&1\\0&1&0&1&1&1&0\\0&0&1&0&1&1&1\end{pmatrix}\). Se envía \(\vec v=(1001011)\) y llega \(\vec r=(1001001)\).</p>
    <p>\(\vec s=(111)\). Es igual a la columna 5 (empezando en 0), luego la solución más ligera es \(\vec e=(0000010)\).</p>
  </div>
</div>
<div class="sec prose">
  <h3>3. Peso, distancia y \(d_{min}\)</h3>
  <ul>
    <li><b>Peso de Hamming</b> \(\omega(\vec v)\): número de unos.</li>
    <li><b>Distancia de Hamming</b> \(d(\vec v,\vec w)\): número de bits en que difieren. Cumple \(d(\vec v,\vec w)=\omega(\vec v+\vec w)\) y la desigualdad triangular.</li>
    <li>En un código lineal, \(\vec v+\vec w\) es otra palabra código. Por eso:</li>
  </ul>
  <div class="fbox"><span class="lbl">Distancia mínima</span>\[ d_{min}=\min\{d(\vec v,\vec w):\vec v\ne\vec w\}=\min\{\omega(\vec x):\vec x\in C,\ \vec x\ne\vec 0\} \]</div>
  <p>También se lee de \(H\): si una palabra de peso \(l\) pertenece al código, hay \(l\) columnas de \(H\) que suman 0.</p>
  <div class="fbox"><span class="lbl">d_min desde H</span><p>\(d_{min}\) = mínimo número de columnas de \(H\) que suman \(\vec 0\).</p></div>
  <p>Para \(H\) de arriba: no hay columna nula (\(d_{min}\ne1\)), ni dos iguales (\(d_{min}\ne2\)), y sí tres que suman 0. Por tanto, \(d_{min}=3\).</p>
</div>
<div class="sec prose">
  <h3>4. Capacidad de detección y probabilidad indetectable</h3>
  <div class="fbox"><span class="lbl">Capacidad detectora</span>\[ s_{max}=d_{min}-1 \]<p>Detecta <b>siempre</b> todos los errores de peso \(\le s_{max}\). Con peso mayor puede detectarlos o no.</p></div>
  <p>Un error concreto ocurre con \(p(\vec e)=p^{\omega(\vec e)}(1-p)^{n-\omega(\vec e)}\). El indetectable es el que coincide con una palabra código no nula. Con \(A_i\) = número de palabras de peso \(i\) (distribución de pesos):</p>
  <div class="fbox"><span class="lbl">Error residual en detección pura</span>
    \[ P_{ND}=\sum_{i=d_{min}}^{n}A_i\,p^i(1-p)^{n-i}\quad\text{(exacta)} \]
    \[ P_{ND}\le\sum_{i=d_{min}}^{n}\binom ni p^i(1-p)^{n-i}\quad\text{(si no conoces }A_i\text{)} \]</div>
  <p>\(A_0=1\) y \(A_i=0\) si \(0\lt i\lt d_{min}\). Por ejemplo, para el C(7,4): \(A_3=7,\ A_4=7,\ A_7=1\), luego \(P_{ND}=7p^3(1-p)^4+7p^4(1-p)^3+p^7\).</p>
  <div class="callout idea"><b>Probabilidad de detectar un error de peso i, si sabes que ocurrió</b><span>Hay \(\binom ni\) patrones de peso \(i\) y \(A_i\) son indetectables. Enero 2024: con \(A_3=4\) y \(\binom63=20\), se escapan \(4/20\) y se detecta el 80 %.</span></div>
  <div data-widget="lineal" data-mode="eq" data-text="v0=u1+u2; v1=u0+u1+u2; v2=u0+u2" data-p="0.01"></div>
  <div class="callout idea"><b>Pesos pares e impares (junio 2026)</b><span>En todo código lineal, el número de palabras de peso impar es 0 o igual al de peso par. Si existe \(c_i\) impar, sumarla a cada palabra par da una impar distinta, y sumarla a cada impar da una par distinta. Cada conjunto se inyecta en el otro: tienen el mismo tamaño, \(2^{k-1}\).</span></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'correccion', n: 5, tema: 5, title: 'Corrección, tabla estándar y Hamming',
      practice: ['sindrome', 'probcod', 'perfecto'],
      html: R`
<div class="sec prose">
  <p class="lead">Detectar es fácil. Para corregir hay que decidir qué palabra se envió, y esa decisión a veces será errónea.</p>
</div>
<div class="sec prose">
  <h3>1. El criterio de decisión</h3>
  <p>Si \(p\lt\tfrac12\), los errores ligeros son los más probables. Por eso se decide la palabra <b>más cercana</b> a la recibida:</p>
  <div class="fbox"><span class="lbl">Máxima verosimilitud</span>\[ \hat{\vec v}=\vec v_i\ \text{ con } \min\,d(\vec v_i,\vec r)=\min\,\omega(\vec e_i) \]</div>
  <div class="fbox"><span class="lbl">Capacidad correctora</span>\[ t_{max}=\left\lfloor\frac{d_{min}-1}{2}\right\rfloor \]<p>Es el mayor peso que <b>siempre</b> se corrige bien. Si \(d_{min}=5\) o \(d_{min}=6\), \(t_{max}=2\).</p></div>
</div>
<div class="sec prose">
  <h3>2. Métodos mixtos</h3>
  <p>Se reparte la distancia entre corregir y detectar:</p>
  <div class="fbox"><span class="lbl">Modos</span>\[ d_{min}=s+t+1,\qquad t\le s \]</div>
  <div class="tbl-wrap"><table>
    <tr><th>\(d_{min}=7\)</th><th>Nombre</th><th>\(\omega(e)\) se corrige</th><th>se detecta</th><th>error residual</th></tr>
    <tr><td>s=6, t=0</td><td>Detección pura</td><td>—</td><td>1 a 6</td><td>≥ 7</td></tr>
    <tr><td>s=5, t=1</td><td>Mixto</td><td>1</td><td>2 a 5</td><td>≥ 6</td></tr>
    <tr><td>s=4, t=2</td><td>Mixto</td><td>1 y 2</td><td>3 y 4</td><td>≥ 5</td></tr>
    <tr><td>s=3, t=3</td><td>Corrección pura</td><td>1 a 3</td><td>—</td><td>≥ 4</td></tr>
  </table></div>
  <p>Con \(d_{min}=8\): (7,0), (6,1), (5,2), (4,3). Con \(d_{min}\) par, en corrección máxima sobra algo de detección.</p>
</div>
<div class="sec prose">
  <h3>3. Tabla estándar</h3>
  <p>Coloca las \(2^n\) n-tuplas en \(2^{n-k}\) filas y \(2^k\) columnas (pregunta de enero 2023):</p>
  <ol class="steps">
    <li><div>En la primera fila, las palabras código, con \(\vec 0\) en la primera columna.</div></li>
    <li><div>Elige un error corregible: una n-tupla que aún no esté en la tabla y del menor peso posible. Es el <b>líder de cogrupo</b>.</div></li>
    <li><div>Rellena su fila: en cada columna, el líder más la palabra código de arriba. La fila es un <b>cogrupo</b>.</div></li>
    <li><div>Repite hasta llenar la tabla.</div></li>
  </ol>
  <p>Dentro de un cogrupo todos los elementos son distintos: si \(\vec e+\vec v_i=\vec e+\vec v_j\), entonces \(\vec v_i=\vec v_j\). En filas distintas también: si \(\vec e_l+\vec v_i=\vec e_m+\vec v_j\), \(\vec e_m\) ya estaría en la fila de \(\vec e_l\).</p>
  <p><b>Se corrige bien si y solo si el error del canal es un líder de cogrupo.</b> Todos los elementos de un cogrupo tienen el mismo síndrome, \((\vec e_l+\vec v)H^t=\vec e_lH^t\). Por eso basta guardar la tabla de síndromes:</p>
  <ol class="steps">
    <li><div>Calcula \(\vec s=\vec rH^t\).</div></li>
    <li><div>Busca el líder con ese síndrome: \(\hat{\vec e}\).</div></li>
    <li><div>Corrige: \(\hat{\vec v}=\vec r+\hat{\vec e}\). La información son los últimos \(k\) bits.</div></li>
  </ol>
  <div class="example"><span class="lbl">Examen enero 2024 · corregir mal</span>
    <p>C(6,3) con \(d_{min}=3\). Se envía \(\vec u=(100)\), \(\vec v=(011100)\). El canal mete \(\vec e=(000011)\), peso 2, y llega \(\vec r=(011111)\). Síndrome: \((001)\), que corresponde al líder de peso 1 \(\hat{\vec e}=(001000)\). Decodifica \(\hat{\vec v}=(010111)\) y entrega \((111)\). Es un <b>error de corrección</b>: se detectó pero se corrigió a otra palabra.</p>
  </div>
  <div data-widget="lineal" data-mode="eq" data-text="v0=u1+u2; v1=u0+u1+u2; v2=u0+u2" data-r="011111"></div>
</div>
<div class="sec prose">
  <h3>4. Probabilidad de error de corrección</h3>
  <p>Con \(\alpha_i\) = número de líderes de cogrupo de peso \(i\):</p>
  <div class="fbox"><span class="lbl">Corrección pura</span>
    \[ P_{\text{error}}=1-\sum_{i=0}^{n}\alpha_i\,p^i(1-p)^{n-i}\quad\text{(exacta)} \]
    \[ P_{\text{error}}\approx1-\sum_{i=0}^{t_{max}}\binom ni p^i(1-p)^{n-i}=\sum_{i=t_{max}+1}^{n}\binom ni p^i(1-p)^{n-i} \]</div>
  <p>Hasta \(t_{max}\), todos los errores son líderes: \(\alpha_i=\binom ni\). Por encima quedan los huecos que sobren. En un <b>modo mixto</b>, todo error de peso \(\gt s\) se considera residual, y el resultado es una cota:</p>
  <div class="fbox"><span class="lbl">Modo mixto</span>\[ P_{ER}\le\sum_{i=s+1}^{n}\binom ni p^i(1-p)^{n-i} \]</div>
  <div class="example"><span class="lbl">Examen junio 2026</span>
    <p>C(7,3) con \(d_{min}=4\): 16 síndromes. 1 de peso 0, los 7 de peso 1, quedan 8: 7 de peso 2 y 1 de peso 3. Con \(q=1-p\): \(P=1-q^7-7pq^6-7p^2q^5-p^3q^4\).</p>
  </div>
</div>
<div class="sec prose">
  <h3>5. Cota de Hamming y códigos perfectos</h3>
  <p>Hay \(2^{n-k}\) líderes. Para corregir todos los errores de peso \(\le t\), tienen que caber:</p>
  <div class="fbox"><span class="lbl">Cota de Hamming</span>\[ 2^{n-k}\ge\sum_{i=0}^{t}\binom ni \]</div>
  <p>Es la relación entre distancia y redundancia que pidieron en junio de 2024. Para Hamming C(7,4): \(2^3=8=1+7\). Se usa también para dimensionar: \(C(15,k)\) con \(d_{min}=4\) tiene \(t=1\), luego \(2^{15-k}\ge16\) y \(k\le11\).</p>
  <div class="fbox"><span class="lbl">Código perfecto</span><p>Se cumple con igualdad: los líderes son exactamente todos los errores de peso \(\le t_{max}\) y ninguno más. No queda ningún hueco, \(\alpha_i=0\) para \(i\gt t_{max}\).</p></div>
  <p>Perfectos: los Hamming y el Golay C(23,12): \(1+23+253+1771=2048=2^{11}\).</p>
</div>
<div class="sec prose">
  <h3>6. Códigos de Hamming</h3>
  <div class="fbox"><span class="lbl">Hamming</span>\[ \forall m\ge3:\quad n=2^m-1,\quad k=2^m-m-1,\quad n-k=m,\quad d_{min}=3 \]</div>
  <p>Las columnas de \(H\) son <b>todas las m-tuplas no nulas</b>. Por eso no hay columnas iguales (\(d_{min}\gt2\)) y siempre hay tres que suman 0 (\(d_{min}=3\)). Cada error simple da un síndrome distinto y se usan todos: es perfecto. Ejemplos: C(7,4), C(15,11), C(31,26), C(63,57).</p>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'ciclicos', n: 6, tema: 6, title: 'Códigos cíclicos y polinomio generador',
      practice: ['parametros', 'sistem', 'diseno'],
      html: R`
<div class="sec prose">
  <p class="lead">Si además de lineal el código es cerrado bajo rotaciones, las palabras se pueden tratar como polinomios. De ahí salen circuitos muy simples y una capacidad de detección muy potente.</p>
</div>
<div class="sec prose">
  <h3>1. Definición y notación polinomial</h3>
  <div class="fbox"><span class="lbl">Código cíclico</span><p>Código lineal en el que toda rotación de una palabra código es palabra código: \(\vec v\in C\Rightarrow\vec v^{(i)}\in C\).</p>
  \[ \vec v=(v_0,v_1,\dots,v_{n-1})\ \Rightarrow\ \vec v^{(1)}=(v_{n-1},v_0,\dots,v_{n-2}) \]
  \[ v(x)=v_0+v_1x+v_2x^2+\dots+v_{n-1}x^{n-1} \]</div>
  <p>El bit de la izquierda es el de menor grado. Rotar \(i\) posiciones es multiplicar por \(x^i\) y quedarse con el resto entre \(x^n+1\):</p>
  <div class="fbox"><span class="lbl">Rotación</span>\[ x^iv(x)=q(x)(x^n+1)+v^{(i)}(x)\ \Rightarrow\ v^{(i)}(x)=\text{resto}\frac{x^iv(x)}{x^n+1} \]</div>
  <div class="example"><span class="lbl">Ejemplo</span><p>\(\vec v=(1010100)\), \(v(x)=1+x^2+x^4\). Para \(i=3\): \(x^3+x^5+x^7\) entre \(x^7+1\) da resto \(1+x^3+x^5\), o sea \(\vec v^{(3)}=(1001010)\).</p></div>
</div>
<div class="sec prose">
  <h3>2. El polinomio generador g(x)</h3>
  <p>Es el polinomio código no nulo de menor grado. De él sale todo, y estas propiedades caen casi siempre en teoría:</p>
  <div class="fbox"><span class="lbl">Propiedades de g(x)</span>
    <ul style="margin:0;padding-left:1.2em">
      <li>Es <b>único</b>: si hubiera dos del mismo grado, su suma sería palabra código de grado menor. Absurdo.</li>
      <li>Su término independiente vale 1, \(g_0=1\): si no, rotarlo una posición a la izquierda daría grado menor.</li>
      <li>Tiene grado \(r=n-k\).</li>
      <li>\(v(x)\in C\iff v(x)\) es múltiplo de \(g(x)\) con grado \(\le n-1\).</li>
      <li>Es <b>factor de</b> \(x^n+1\). Y al revés: todo factor de grado \(n-k\) genera un C(n,k) cíclico.</li>
    </ul></div>
  <p>Por qué \(r=n-k\): las palabras son \(a(x)g(x)\) con \(\text{grado}\,a(x)\le n-r-1\), lo que da \(2^{n-r}\) palabras. Como tienen que ser \(2^k\), \(r=n-k\).</p>
  <div class="callout idea"><b>Palabras de un grado dado (junio 2026)</b><span>Las de grado exacto \(d\) son \(a(x)g(x)\) con \(a(x)\) de grado \(d-r\): hay \(2^{d-r}\). En C(63,51): grado 12, solo \(g(x)\); grado 13, dos: \(xg(x)\) y \((1+x)g(x)\). Una de grado 20: \(x^8g(x)\).</span></div>
</div>
<div class="sec prose">
  <h3>3. Cuántos códigos hay de longitud n</h3>
  <p>Factoriza \(x^n+1\) en \(L\) factores. Cada combinación de factores es un candidato a \(g(x)\): \(2^L\) combinaciones. Se descartan \(g=1\) (\(k=n\)) y \(g=x^n+1\) (\(k=0\)):</p>
  <div class="fbox"><span class="lbl">Número de códigos cíclicos</span>\[ 2^L-2 \]</div>
  <div class="example"><span class="lbl">Ejemplo: n = 7</span>
    <p>\(x^7+1=(1+x)(1+x+x^3)(1+x^2+x^3)\): \(2^3-2=6\) códigos. Por ejemplo: \(g=1+x\) da C(7,6); \(g=1+x+x^3\) da C(7,4); \(g=(1+x)(1+x+x^3)\) da C(7,3).</p>
    <p>Consecuencia: \(g(x)=1+x^2+x^3\) no genera un C(10,7), porque no divide a \(x^{10}+1\).</p>
  </div>
  <div data-widget="factor" data-n="15"></div>
</div>
<div class="sec prose">
  <h3>4. Codificación</h3>
  <p><b>Directa, no sistemática:</b> \(v(x)=u(x)\cdot g(x)\).</p>
  <p><b>Sistemática:</b> la información queda en los grados altos y la redundancia es el resto de la división.</p>
  <div class="fbox"><span class="lbl">Codificación sistemática</span>\[ b(x)=\text{resto}\frac{x^{n-k}u(x)}{g(x)},\qquad v(x)=b(x)+x^{n-k}u(x) \]\[ \vec v=(b_0,b_1,\dots,b_{n-k-1},u_0,u_1,\dots,u_{k-1}) \]</div>
  <div class="example"><span class="lbl">Ejemplo de clase · C(7,4), g = 1+x+x³</span>
    <p>\(\vec u=(1001)\): \(u(x)=1+x^3\). \(x^3u(x)=x^3+x^6\). Dividiendo entre \(g(x)\) queda \(b(x)=x+x^2\). Entonces \(v(x)=x+x^2+x^3+x^6\), o sea \(\vec v=(0111001)\).</p>
  </div>
  <div data-widget="division" data-a="x^6+x^3" data-b="x^3+x+1"></div>
</div>
<div class="sec prose">
  <h3>5. Matrices G, G<sub>s</sub> y H</h3>
  <div class="fbox"><span class="lbl">G: rotaciones de g(x)</span>\[ G=\begin{pmatrix}g_0&g_1&\cdots&g_{n-k}&0&\cdots&0\\0&g_0&g_1&\cdots&g_{n-k}&\cdots&0\\&&\ddots&&&\ddots&\\0&\cdots&0&g_0&g_1&\cdots&g_{n-k}\end{pmatrix} \]</div>
  <p><b>Gs, dos caminos.</b> Diagonaliza \(G\) con operaciones de filas hasta \((P\,|\,I_k)\). O calcula cada fila como la palabra sistemática de \(u(x)=x^i\): \(\text{fila}_i=(b_i(x)\ |\ x^i)\) con \(b_i(x)=\text{resto}\,x^{n-k+i}/g(x)\).</p>
  <p><b>H, dos caminos.</b> Con \(G_s\): \(H=(I_{n-k}\,|\,P^t)\). O con el polinomio de paridad \(h(x)\):</p>
  <div class="fbox"><span class="lbl">Polinomio de paridad</span>\[ x^n+1=g(x)h(x),\quad \text{grado }h=k \]\[ H=\begin{pmatrix}h_k&h_{k-1}&\cdots&h_0&0&\cdots&0\\0&h_k&\cdots&h_1&h_0&\cdots&0\\&&\ddots&&&\ddots&\\0&\cdots&0&h_k&\cdots&h_1&h_0\end{pmatrix} \]</div>
  <p>Las filas de esta \(H\) son rotaciones del polinomio recíproco \(x^kh(x^{-1})\), que genera el código dual C(n,n−k). En el producto \(v(x)h(x)=a(x)(x^n+1)\) faltan los grados de \(k\) a \(n-1\): de ahí salen las \(n-k\) ecuaciones \(\sum_{i=0}^{k}h_iv_{n-i-j}=0\).</p>
  <div data-widget="ciclico" data-n="7" data-g="1+x+x^3" data-u="1+x^3"></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'circuitos', n: 7, tema: 6, title: 'Circuitos: codificadores y síndrome',
      practice: ['parametros', 'sistem'],
      html: R`
<div class="sec prose">
  <p class="lead">La gran ventaja práctica de los cíclicos: la división entre \(g(x)\) se hace con un registro de desplazamiento y unas pocas puertas XOR.</p>
</div>
<div class="sec prose">
  <h3>1. Codificador basado en g(x): n−k etapas</h3>
  <p>Mientras entran los \(k\) bits de información, empezando por \(u_{k-1}\), la puerta está abierta: el registro va calculando el resto. Tras \(k\) pulsos contiene \(b(x)\). Se cierra la puerta y se saca la redundancia.</p>
  <div data-widget="circuito" data-kind="g" data-n="7" data-g="1+x+x^3" data-bits="1011"></div>
  <p class="small muted">Es la tabla de clase: u = (1011) da los estados 110, 101, 100, 100, y v = (100 1011).</p>
</div>
<div class="sec prose">
  <h3>2. Codificador basado en h(x): k etapas</h3>
  <p>Se cargan los \(k\) bits de información en el registro. Cada pulso calcula el siguiente bit de redundancia con las ecuaciones de paridad:</p>
  <div class="fbox"><span class="lbl">Ecuación del circuito</span>\[ v_{n-k-j}=\sum_{i=0}^{k-1}h_iv_{n-i-j},\qquad 1\le j\le n-k \]</div>
  <div data-widget="circuito" data-kind="h" data-n="7" data-g="1+x+x^3" data-bits="1011"></div>
</div>
<div class="sec prose">
  <h3>3. Cuál se elige</h3>
  <div class="callout idea"><b>Pregunta fija de examen</b><span>Elige el que tenga <b>menos registros</b>: \(n-k\) con \(g(x)\) y \(k\) con \(h(x)\). C(63,51): 12 frente a 51, mejor \(g(x)\). C(15,4): 11 frente a 4, mejor \(h(x)\). La regla: \(g(x)\) si \(n-k\lt k\).</span></div>
</div>
<div class="sec prose">
  <h3>4. Cálculo del síndrome</h3>
  <p>El síndrome polinómico es el resto de dividir lo recibido entre \(g(x)\):</p>
  <div class="fbox"><span class="lbl">Síndrome</span>\[ r(x)=q(x)g(x)+s(x),\qquad s(x)=\text{resto}\frac{r(x)}{g(x)} \]</div>
  <p>\(s(x)=0\) si y solo si \(r(x)\) es múltiplo de \(g(x)\). El circuito es el mismo del codificador, pero alimentado por la izquierda, porque ahora dividimos \(r(x)\) y no \(x^{n-k}u(x)\).</p>
  <div data-widget="circuito" data-kind="s" data-n="7" data-g="1+x+x^3" data-bits="0010110"></div>
  <p><b>Teorema.</b> Si \(s(x)\) es el síndrome de \(r(x)\), el resto de \(x\,s(x)/g(x)\) es el síndrome de \(r^{(1)}(x)\). Basta dar un pulso más al registro para tener el síndrome de la palabra rotada.</p>
</div>
<div class="sec prose">
  <h3>5. Corrección en serie: decodificador Meggitt</h3>
  <p>En un lineal, un circuito combinacional pasa de síndrome a líder con \(n\) salidas. En un cíclico basta decidir un bit, porque los demás se corrigen rotando:</p>
  <ol class="steps">
    <li><div>Calcula el síndrome de \(r(x)\) y guarda \(r\) en un registro de \(n\) etapas.</div></li>
    <li><div>Un detector decide si \(e_{n-1}=1\) mirando el síndrome. Corrige ese bit: \(\hat v_{n-1}=r_{n-1}+e_{n-1}\).</div></li>
    <li><div>Rota \(r(x)\) y el síndrome un pulso. Repite con el siguiente bit, hasta \(n\) veces.</div></li>
  </ol>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'deteccion', n: 8, tema: 6, title: 'Detección, ráfagas, Hamming y recortados',
      practice: ['errores', 'rafagas', 'diseno'],
      html: R`
<div class="sec prose">
  <p class="lead">Esta lección da más puntos que ninguna otra. "Razone si detecta este error" y "diseñe un código" han caído en casi todos los exámenes.</p>
</div>
<div class="sec prose">
  <h3>1. La idea</h3>
  <p>Igual que en los lineales, se detectan siempre los errores de peso menor que \(d_{min}\). Y el indetectable es el que cae dentro del código: \(\vec e\in C\iff e(x)\) es múltiplo de \(g(x)\). Por tanto, un cíclico detecta muchos más errores de los que garantiza su \(d_{min}\).</p>
</div>
<div class="sec prose">
  <h3>2. Errores ráfaga</h3>
  <p>Una ráfaga de longitud \(l\) tiene el primer y el último bit erróneos y entre ellos cualquier cosa:</p>
  <div class="fbox"><span class="lbl">Ráfaga</span>\[ e(x)=x^{i}B(x),\quad B(x)=1+b_1x+\dots+b_{l-2}x^{l-2}+x^{l-1} \]<p>En una posición hay \(2^{l-2}\) ráfagas distintas de longitud \(l\).</p></div>
  <div class="tbl-wrap"><table>
    <tr><th>Longitud</th><th>Indetectables</th><th>Fracción indetectable</th></tr>
    <tr><td>\(l\le n-k\)</td><td>0: todas detectadas</td><td>0</td></tr>
    <tr><td>\(l=n-k+1\)</td><td>1, la propia \(g(x)\)</td><td>\(\dfrac1{2^{\,n-k-1}}\)</td></tr>
    <tr><td>\(l\gt n-k+1\)</td><td>\(2^{\,l-(n-k)-2}\)</td><td>\(\dfrac{2^{\,l-(n-k)-2}}{2^{\,l-2}}=\dfrac1{2^{\,n-k}}\)</td></tr>
  </table></div>
  <div class="fbox"><span class="lbl">Demostración para l ≤ n−k (enero 2026)</span><p>\(B(x)\) tiene grado \(l-1\lt n-k\). \(g(x)\) es el polinomio código de grado mínimo, \(n-k\). Luego \(B(x)\) no es palabra código, y como \(x^i\) no comparte factores con \(g(x)\) (porque \(g_0=1\)), \(x^iB(x)\) tampoco es múltiplo de \(g(x)\).</p></div>
  <div data-widget="rafaga" data-n="15" data-k="10" data-l="8"></div>
  <div class="callout ojo"><b>Errata en la solución de enero 2023</b><span>C(15,10) con \(l=8\): la oficial dice que la fracción es \(1/2^{n-k}=1/2\). Pero \(1/2^5=1/32\). Hay \(2^{6}=64\) ráfagas y \(2^{\,8-5-2}=2\) indetectables.</span></div>
</div>
<div class="sec prose">
  <h3>3. Errores simples, impares y dobles</h3>
  <div class="fbox"><span class="lbl">Simples</span><p>\(e(x)=x^i\) no es múltiplo de \(g(x)\) si \(g(x)\ne1\): <b>todos detectados</b>.</p></div>
  <div class="fbox"><span class="lbl">Impares</span><p>Si \(g(x)\) tiene el factor \((1+x)\), se detectan <b>todos los errores de peso impar</b>. Demostración: si \(e(x)=a(x)(1+x)g'(x)\), entonces \(e(1)=0\). Pero un número impar de términos da \(e(1)=1\). Absurdo.</p></div>
  <div class="fbox"><span class="lbl">Dobles</span><p>Si \(g(x)\) tiene un factor <b>primitivo</b> de grado \(r\) y \(n\le2^r-1\), se detectan <b>todos los errores dobles</b>.</p></div>
  <p><b>Polinomio primitivo de grado r:</b> es irreducible, es factor de \(x^{2^r-1}+1\) y no lo es de \(x^t+1\) con \(t\lt2^r-1\). Por ejemplo, \(1+x+x^3\): factor de \(x^7+1\), no de \(x^6+1,\ x^5+1,\dots\) Genera un código con \(d_{min}\ge3\).</p>
  <div class="callout idea"><b>El orden de comprobación en el examen</b><span>
    1) ¿Peso \(\lt d_{min}\)? Se detecta. 2) ¿Peso impar y factor \((1+x)\)? Se detecta. 3) ¿Ráfaga con \(l\le n-k\)? Se detecta. 4) ¿Tiene forma \(x^i g(x)\)? <b>No</b> se detecta. 5) Si nada encaja, divide \(e(x)\) entre \(g(x)\) y mira el resto.</span></div>
  <div data-widget="ciclico" data-n="15" data-g="x^10+x^8+x^5+x^4+x^2+x+1" data-e="x^5+x^6+x^8+x^9+x^10+x^11+x^12+x^13; x+x^5+x^6+x^8+x^9+x^13; x^4+x^5+x^6+x^8+x^9+x^12+x^14"></div>
  <p class="small muted">Son los tres errores del examen de junio de 2024. El tercero es \(x^4g(x)\).</p>
</div>
<div class="sec prose">
  <h3>4. Hamming cíclico y Hamming extendido</h3>
  <p><b>Teorema.</b> Un Hamming cíclico de longitud \(n=2^m-1\), \(m\ge3\), lo genera un polinomio primitivo \(p(x)\) de grado \(m\). Tiene \(d_{min}=3\).</p>
  <p><b>Mejora a \(d_{min}=4\).</b> Con \(g(x)=(1+x)p(x)\) se detectan los impares, gracias a \((1+x)\), y los dobles, gracias a \(p(x)\). Entonces \(\omega(e)=1,2,3\) se detectan siempre: \(d_{min}=4\), C(n,k−1).</p>
  <p>Ejemplo de clase: \(p(x)=1+x+x^3\) da C(7,4); \(g(x)=(1+x)(1+x+x^3)\) da C(7,3) con \(d_{min}=4\).</p>
</div>
<div class="sec prose">
  <h3>5. Códigos recortados</h3>
  <p>Se quitan las palabras cuya información empieza con \(l\) ceros y no se transmiten esos ceros:</p>
  <div class="fbox"><span class="lbl">Recortado</span>\[ C(n,k)\to C_R(n-l,\ k-l) \]</div>
  <ul>
    <li>Conserva \(d_{min}\) y las propiedades detectoras y correctoras.</li>
    <li>Los circuitos son casi iguales.</li>
    <li>Es lineal, pero <b>no es cíclico</b>.</li>
  </ul>
</div>
<div class="sec prose">
  <h3>6. Diseñar un código: el procedimiento</h3>
  <ol class="steps">
    <li><div>Saca \(n\) y \(n-k\) del enunciado. Por ejemplo, 15 octetos con 1 de CRC: \(n=120\), \(n-k=8\).</div></li>
    <li><div><b>¿Longitud de Hamming?</b> Si \(n=2^m-1\), usa un \(p(x)\) primitivo de grado \(n-k\).</div></li>
    <li><div><b>¿Mejor \(d_{min}\)?</b> Con la misma redundancia, \((1+x)p(x)\) da \(d_{min}=4\) usando un primitivo de grado \(n-k-1\).</div></li>
    <li><div><b>¿No sale n exacto?</b> Elige el Hamming inmediatamente mayor y recorta. Para \(n=28,\ d_{min}=4\): \((1+x)p(x)\) con grado 5 da C(31,25), y recortando 3 bits, \(C_R(28,22)\).</div></li>
    <li><div><b>¿Ráfagas de \(b\) bits?</b> Hace falta \(n-k\ge b\): se multiplican factores de \(x^n+1\) hasta ese grado.</div></li>
    <li><div>Entre candidatos iguales, prefiere \(g(x)\) con <b>menos términos</b>: el circuito lleva menos XOR.</div></li>
  </ol>
  <div class="example"><span class="lbl">Examen enero 2024</span>
    <p>\(n=120,\ n-k=8\). Con \(p(x)\) de grado 8 sería \(d_{min}=3\). Mejor \(g(x)=(1+x)p(x)\) con \(p\) de grado 7: da \(d_{min}=4\). Se elige \(p(x)=1+x+x^7\), con menos términos: \(g(x)=1+x^2+x^7+x^8\). Genera C(127,119), y recortando 7 bits queda \(C_R(120,112)\).</p>
  </div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'arq', n: 9, tema: 7, title: 'FEC y ARQ de parada y espera',
      practice: ['arqnum', 'modos'],
      html: R`
<div class="sec prose">
  <p class="lead">Ya sabemos detectar y corregir. Ahora toca decidir qué hacer con un error y cuánto cuesta en velocidad real.</p>
</div>
<div class="sec prose">
  <h3>1. Dos estrategias</h3>
  <div class="phrase">
    <div>FEC (Forward Error Correction)</div><div>ARQ (Automatic Retransmission reQuest)</div>
    <div>El receptor corrige. Código en corrección pura.</div><div>El receptor detecta y pide que se repita. Código en detección.</div>
    <div>Vía única para canales unidireccionales, difusión y almacenamiento.</div><div>Exige canal de retorno y un buffer en el emisor.</div>
    <div>Latencia fija; útil en tiempo real.</div><div>Latencia variable. Error residual mucho menor.</div>
    <div>Para que sea fiable hace falta mucha redundancia.</div><div>Rinde peor cuanto peor es el canal.</div>
  </div>
</div>
<div class="sec prose">
  <h3>2. Prestaciones de FEC</h3>
  <p>La medida de rendimiento es la <b>cadencia eficaz</b>: bits de datos de usuario entre el tiempo medio que el canal está ocupado para transmitirlos. El factor de rendimiento la compara con el régimen binario \(R\):</p>
  <div class="fbox"><span class="lbl">Definiciones</span>\[ C_{ef}=\frac{k}{\bar T_{oc}},\qquad \rho=\frac{C_{ef}}{R} \]</div>
  <div class="fbox"><span class="lbl">FEC</span>\[ C_{ef}=\frac kn R,\qquad \rho=\frac k{k+m} \]\[ P_{ER}=P(\text{corregir mal})=1-\sum_{i=0}^{n}\alpha_ip^i(1-p)^{n-i}\approx\sum_{i=t+1}^{n}\binom nip^i(1-p)^{n-i} \]</div>
</div>
<div class="sec prose">
  <h3>3. Hipótesis de ARQ</h3>
  <ul>
    <li>Tráfico de datos unidireccional, de E a R.</li>
    <li>Las tramas de control (ACK, NAK) no tienen errores.</li>
    <li>Bloques iguales: \(k\) bits de datos protegidos con \(C(n,k)\), \(m=n-k\).</li>
    <li>Siempre hay datos que transmitir.</li>
  </ul>
</div>
<div class="sec prose">
  <h3>4. Parada y espera</h3>
  <p>Se envía una trama y se espera el asentimiento antes de la siguiente.</p>
  <div data-widget="arqpe"></div>
  <ul>
    <li><b>Tiempo de transmisión:</b> \(X_p=n/R=(k+m)/R\).</li>
    <li><b>Tiempo de asentimiento</b> \(T_{as}\): desde que se envía el último bit hasta que se puede enviar la siguiente. Suma propagación de datos, proceso del síndrome, transmisión de la trama de control (\(l/R\)), propagación de la trama de control y su proceso.</li>
  </ul>
  <div class="tbl-wrap"><table><tr><th>\(N_T\)</th><th>\(T_{oc}\)</th><th>\(p(N_T)\)</th></tr>
    <tr><td>1</td><td>\(X_p+T_{as}\)</td><td>\(1-P_{RTX}\)</td></tr>
    <tr><td>2</td><td>\(2(X_p+T_{as})\)</td><td>\(P_{RTX}(1-P_{RTX})\)</td></tr>
    <tr><td>\(i\)</td><td>\(i(X_p+T_{as})\)</td><td>\(P_{RTX}^{\,i-1}(1-P_{RTX})\)</td></tr></table></div>
  <p>El número de transmisiones sigue una geométrica, de media \(\bar N_T=\dfrac1{1-P_{RTX}}\). Por tanto:</p>
  <div class="fbox"><span class="lbl">Parada y espera</span>\[ \bar T_{oc}=\frac{X_p+T_{as}}{1-P_{RTX}},\qquad C_{ef}=(1-P_{RTX})\,\frac{k}{k+m+T_{as}R}\,R,\qquad \rho=(1-P_{RTX})\,\frac{k}{k+m+T_{as}R} \]</div>
</div>
<div class="sec prose">
  <h3>5. Probabilidad de retransmisión y de error residual</h3>
  <p>Se retransmite cuando se detecta un error. Es decir, cuando \(\vec e\notin C\):</p>
  <div class="fbox"><span class="lbl">Retransmisión</span>
    \[ P_{RTX}=1-(1-p)^n-\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\quad\text{(exacta)} \]
    \[ P_{RTX}\approx\sum_{i=1}^{s}\binom nip^i(1-p)^{n-i}\quad\text{(sin }A_i\text{)} \]
    \[ P_{RTX}\approx1-(1-p)^n\approx np\quad\text{(sin }d_{min}\text{ y con }p\text{ pequeña: "detecta todo"})\]</div>
  <div class="fbox"><span class="lbl">Error residual</span>\[ P_{ER}=\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\le\sum_{i=d_{min}}^{n}\binom nip^i(1-p)^{n-i} \]</div>
  <div class="callout idea"><b>Reparto de probabilidades de una trama</b><span>\(P(\text{entrega correcta})+P_{RTX}+P_{ER}=1\). Y si te preguntan cuántas veces se envía: una vez, \(1-P_{RTX}\); dos, \(P_{RTX}(1-P_{RTX})\); tres o más, \(P_{RTX}^2\).</span></div>
  <div class="callout ojo"><b>¿Hay que calcular el resto de la serie?</b><span>Si el enunciado dice "exacta", usa \(A_i\). Si no te dan \(A_i\), escribe la suma con \(\binom ni\), con ≈ o ≤. A menudo basta el primer término, porque \(p\ll1\): \(P_{ER}\approx\binom{n}{d_{min}}p^{d_{min}}(1-p)^{n-d_{min}}\).</span></div>
</div>
<div class="sec prose">
  <h3>6. Longitud óptima de bloque</h3>
  <p>Un bloque corto gasta mucho en redundancia y asentimientos, y uno largo se retransmite casi siempre. Con \(dC_{ef}/dk=0\):</p>
  <div class="fbox"><span class="lbl">Parada y espera</span>\[ k_{opt}\approx\sqrt{\frac{m+RT_{as}}{p}} \]</div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'envio', n: 10, tema: 7, title: 'Envío continuo y ventanas',
      practice: ['arqnum', 'ventanas'],
      html: R`
<div class="sec prose">
  <p class="lead">Parada y espera desperdicia todo el \(T_{as}\) en cada trama. Si el canal es full duplex se puede seguir enviando mientras llega el asentimiento.</p>
</div>
<div class="sec prose">
  <h3>1. Rechazo simple (retroactivo)</h3>
  <p>Al recibir un NAK, se vuelve atrás y se repite desde la trama errónea. El receptor tira las siguientes, aunque lleguen bien.</p>
  <div data-widget="arqrs"></div>
  <div class="tbl-wrap"><table><tr><th>\(N_T\)</th><th>\(T_{oc}\)</th><th>\(p(N_T)\)</th></tr>
    <tr><td>1</td><td>\(X_p\)</td><td>\(1-P_{RTX}\)</td></tr>
    <tr><td>2</td><td>\(X_p+(X_p+T_{as})\)</td><td>\(P_{RTX}(1-P_{RTX})\)</td></tr>
    <tr><td>\(i\)</td><td>\(X_p+(i-1)(X_p+T_{as})\)</td><td>\(P_{RTX}^{\,i-1}(1-P_{RTX})\)</td></tr></table></div>
  <div class="fbox"><span class="lbl">Rechazo simple</span>\[ C_{ef}=(1-P_{RTX})\,\frac{k}{k+m+RT_{as}P_{RTX}}\,R \]</div>
  <p>Hace falta memoria en el emisor: tantas tramas como quepan en un \(T_{as}\). Y números de secuencia.</p>
</div>
<div class="sec prose">
  <h3>2. Rechazo selectivo</h3>
  <p>Solo se repite la trama errónea. El receptor guarda en un buffer las siguientes hasta poder entregarlas en orden. Hace falta memoria en emisor y en receptor.</p>
  <div data-widget="arqrsel"></div>
  <p>Cada transmisión cuesta solo \(X_p\):</p>
  <div class="fbox"><span class="lbl">Rechazo selectivo</span>\[ \bar T_{oc}=\frac{X_p}{1-P_{RTX}},\qquad C_{ef}=(1-P_{RTX})\,\frac{k}{k+m}\,R \]</div>
</div>
<div class="sec prose">
  <h3>3. Comparación</h3>
  <div class="tbl-wrap"><table>
    <tr><th>Técnica</th><th>\(\rho\)</th></tr>
    <tr><td>FEC</td><td>\(\dfrac k{k+m}\)</td></tr>
    <tr><td>Parada y espera</td><td>\((1-P_{RTX})\dfrac k{k+m+T_{as}R}\)</td></tr>
    <tr><td>Rechazo simple</td><td>\((1-P_{RTX})\dfrac k{k+m+T_{as}R\,P_{RTX}}\)</td></tr>
    <tr><td>Rechazo selectivo</td><td>\((1-P_{RTX})\dfrac k{k+m}\)</td></tr>
  </table></div>
  <div class="example"><span class="lbl">Ejercicio de clase</span>
    <p>C(1048,1000), R = 1200 bit/s, p = 5·10⁻⁶, t<sub>prop</sub> = 100 ms, trama de control de 48 bits.</p>
    <p>\(T_{as}=0{,}1+\tfrac{48}{1200}+0{,}1=0{,}24\) s y \(P_{RTX}\approx1-(1-p)^{1048}=5{,}2\cdot10^{-3}\).</p>
    <div class="tbl-wrap"><table><tr><th></th><th>Parada y espera</th><th>Rechazo simple</th><th>Rechazo selectivo</th></tr><tr><td>\(C_{ef}\)</td><td>893 bit/s</td><td>1137 bit/s</td><td>1139 bit/s</td></tr><tr><td>\(\rho\)</td><td>74 %</td><td>94,8 %</td><td>94,9 %</td></tr></table></div>
  </div>
  <div data-widget="arq" data-k="1000" data-n="1048" data-p="5e-6" data-r="1200" data-tas="0.24"></div>
  <div class="callout idea"><b>Cómo elegir (junio 2023)</b><span>Sin canal de retorno o con vídeo en tiempo real: <b>FEC</b>. Con retorno y \(R\,T_{as}\gg n\): rechazo simple, porque \(R\,T_{as}P_{RTX}\) suele ser pequeño, rinde casi igual que el selectivo y es mucho más sencillo. Parada y espera solo si \(n\gg R\,T_{as}\).</span></div>
</div>
<div class="sec prose">
  <h3>4. Número de secuencia y ventanas</h3>
  <p>Hay que numerar las tramas: si se pierde un ACK, el receptor no puede distinguir una repetición de una trama nueva. Con \(b\) bits, los números van de 0 a \(\text{MAXSEQ}=2^b-1\). Esos bits salen de los datos, salvo que el enunciado diga lo contrario: los \(k\) bits útiles bajan.</p>
  <p><b>Ventana:</b> conjunto de números de secuencia que se pueden enviar (\(W_T\)) o recibir (\(W_R\)). Para no perder eficiencia, \(W_T\) debe cubrir las tramas que caben en un \(T_{as}\).</p>
  <div class="fbox"><span class="lbl">Límites</span>
    \[ \text{Parada y espera: } 1\text{ bit} \]
    \[ \text{Rechazo simple } (W_R=1):\quad W_T\le\text{MAXSEQ} \]
    \[ \text{Rechazo selectivo}:\quad W_T+W_R\le\text{MAXSEQ}+1 \]</div>
  <div class="example"><span class="lbl">Ejercicio de clase · Golay C(23,12), R = 2 Mbit/s, p = 10⁻³, T<sub>as</sub> = 1 ms</span>
    <p>Caben \(10^{-3}/(23/2\cdot10^6)\approx87\) tramas. Rechazo simple: \(W_T\ge87\Rightarrow\text{MAXSEQ}=127\): 7 bits, quedan \(k'=5\) datos. Rechazo selectivo: \(W_T=W_R=87\Rightarrow\text{MAXSEQ}=255\): 8 bits, quedan \(k'=4\). Parada y espera: 1 bit, \(k'=11\).</p>
    <div class="tbl-wrap"><table><tr><th></th><th>FEC</th><th>Parada y espera</th><th>Rechazo simple</th><th>Rechazo selectivo</th></tr><tr><td>\(\rho\) sin contar secuencia</td><td>52,2 %</td><td>0,58 %</td><td>17 %</td><td>51 %</td></tr><tr><td>\(\rho\) contando secuencia</td><td>52,2 %</td><td>0,53 %</td><td>7,08 %</td><td>17 %</td></tr></table></div>
    <p class="small">Con FEC, \(P_{ER}\approx8{,}7\cdot10^{-9}\): llega un dato erróneo cada unos 22 minutos, porque se transmite un bloque cada 11,5 µs. Con ARQ, en detección pura \(P_{ER}\lt2{,}5\cdot10^{-16}\).</p>
  </div>
  <div data-widget="arq" data-k="12" data-n="23" data-p="1e-3" data-r="2000000" data-tas="0.001" data-dmin="7"></div>
</div>`
    },
    /* ------------------------------------------------------------------ */
    {
      id: 'hibridas', n: 11, tema: 7, title: 'ARQ con técnicas híbridas',
      practice: ['modos', 'arqnum'],
      html: R`
<div class="sec prose">
  <p class="lead">Las técnicas híbridas combinan los dos mundos: se corrigen los errores ligeros, más frecuentes, y se pide retransmisión solo con los pesados.</p>
</div>
<div class="sec prose">
  <h3>1. Híbrido en modo mixto</h3>
  <p>Usa el mismo código en modo \((s,t)\). La fórmula de \(C_{ef}\) de cada técnica no cambia. Lo que cambia es \(P_{RTX}\), porque ya solo hay que retransmitir los errores que no se corrigen:</p>
  <div class="tbl-wrap"><table>
    <tr><th>Con \(d_{min}=7,\ s=4,\ t=2\)</th><th>\(\omega(e)\)</th><th>Probabilidad</th></tr>
    <tr><td>Sin error</td><td>0</td><td>\((1-p)^n\)</td></tr>
    <tr><td>Se corrige</td><td>1 y 2</td><td>\(\sum_{i=1}^{2}\binom nip^i(1-p)^{n-i}\)</td></tr>
    <tr><td>Se detecta y pide RTX</td><td>3 y 4</td><td>\(P_{RTX}=\sum_{i=3}^{4}\binom nip^i(1-p)^{n-i}\)</td></tr>
    <tr><td>Error residual</td><td>≥ 5</td><td>\(P_{ER}=\sum_{i=5}^{n}\binom nip^i(1-p)^{n-i}\)</td></tr>
  </table></div>
  <div class="fbox"><span class="lbl">General, modo (s, t)</span>\[ P_{RTX}\approx\sum_{i=t+1}^{s}\binom nip^i(1-p)^{n-i},\qquad P_{ER}\approx\sum_{i=s+1}^{n}\binom nip^i(1-p)^{n-i},\qquad C_{ef}=(1-P_{RTX})\frac{k}{\cdots}R \]</div>
  <p>Con \(d_{min}=5\), los modos son \((4,0)\), \((3,1)\) y \((2,2)\). Solo \((3,1)\) es un híbrido real: en \((2,2)\) no queda zona de detección, así que es FEC.</p>
  <div class="example"><span class="lbl">Examen junio 2026 · C(63,51) con d<sub>min</sub> = 5</span>
    <div class="tbl-wrap"><table><tr><th></th><th>\(P_{ER}\)</th><th>\(P_{RTX}\)</th><th>\(C_{ef}\)</th></tr>
      <tr><td>FEC (s=2, t=2)</td><td>\(\sum_{i=3}^{63}\)</td><td>—</td><td>\(\tfrac{51}{63}R\)</td></tr>
      <tr><td>ARQ detección (s=4, t=0)</td><td>\(\sum_{i=5}^{63}\)</td><td>\(\sum_{i=1}^{4}\)</td><td>\((1-P_{RTX})\tfrac{51}{63+T_{as}R}R\)</td></tr>
      <tr><td>ARQ híbrido (s=3, t=1)</td><td>\(\sum_{i=4}^{63}\)</td><td>\(\sum_{i=2}^{3}\)</td><td>\((1-P_{RTX})\tfrac{51}{63+T_{as}R}R\)</td></tr></table></div>
    <p class="small">Donde cada suma es \(\binom{63}ip^i(1-p)^{63-i}\). Las \(C_{ef}\) son de parada y espera: el enunciado no fija otra técnica.</p>
  </div>
  <div data-widget="arq" data-k="51" data-n="63" data-p="1e-3" data-r="1000000" data-tas="0.001" data-dmin="5" data-t="1"></div>
</div>
<div class="sec prose">
  <h3>2. Híbrido con códigos distintos por transmisión</h3>
  <p>La primera transmisión va en detección pura. Si falla, la siguiente se usa de otra forma. Para calcular \(C_{ef}\), haz la tabla de \(N_T\), \(T_{oc}\) y \(p(N_T)\): siempre sale con el mismo método, \(C_{ef}=k/\bar T_{oc}\).</p>
  <div class="example"><span class="lbl">Clase · rechazo selectivo con dos códigos</span>
    <p>1.ª transmisión con \(C_1\) y \(d_1\): \(P_{RTX1}\). Las demás con \(C_2\) y \(d_2\): \(P_{RTX2}\).</p>
    <div class="tbl-wrap"><table><tr><th>\(N_T\)</th><th>\(T_{oc}\)</th><th>\(p(N_T)\)</th></tr>
      <tr><td>1</td><td>\(X_p\)</td><td>\(1-P_{RTX1}\)</td></tr><tr><td>2</td><td>\(2X_p\)</td><td>\(P_{RTX1}(1-P_{RTX2})\)</td></tr><tr><td>\(i\)</td><td>\(iX_p\)</td><td>\(P_{RTX1}P_{RTX2}^{\,i-2}(1-P_{RTX2})\)</td></tr></table></div>
  </div>
  <div class="example"><span class="lbl">Clase · parada y espera: 1.ª en detección, 2.ª en corrección pura</span>
    <p>Golay C(23,12): la primera detecta (\(s=6,t=0\)). Si falla, la segunda corrige (\(s=3,t=3\)) y el resultado se entrega sin más: como mucho, dos transmisiones.</p>
    <div class="tbl-wrap"><table><tr><th>\(N_T\)</th><th>\(T_{oc}\)</th><th>\(p(N_T)\)</th></tr><tr><td>1</td><td>\(X_p+T_{as}\)</td><td>\(1-P_{RTX}\)</td></tr><tr><td>2</td><td>\(2X_p+T_{as}\)</td><td>\(P_{RTX}\)</td></tr></table></div>
    <p>\(\bar T_{oc}=(X_p+T_{as})(1-P_{RTX})+(2X_p+T_{as})P_{RTX}\), y \(C_{ef}=k/\bar T_{oc}\).</p>
  </div>
  <div class="example"><span class="lbl">Examen enero 2023 · C(31,25), envío continuo</span>
    <p>Mismo esquema: \(\bar T_{oc}=X_p(1-P_{RTX})+2X_pP_{RTX}=X_p(1+P_{RTX})\), con \(P_{RTX}=\sum_{i=1}^{3}\binom{31}ip^i(1-p)^{31-i}\). Entonces \(C_{ef}=\dfrac{k}{(k+m)(1+P_{RTX})}R\).</p>
  </div>
</div>
<div class="sec prose">
  <h3>3. Concatenación de códigos</h3>
  <p>Otra combinación es FEC + FEC: un código externo y otro interno, cada uno resistente a un tipo de error. En recepción se decodifica primero el interno y luego el externo.</p>
  <div class="example"><span class="lbl">Examen enero 2023 · cabecera y trama</span>
    <p>La cabecera se protege con C(15,k) corrector y la trama completa con un CRC detector, C(n,n−16) y \(d_{min}=4\). Primero se corrige la cabecera y luego se comprueba toda la trama. Si el CRC falla, se pide retransmisión.</p>
  </div>
</div>`
    }
  ];

  /* ------------------------------------------------------------------ */
  const cards = [
    // Tema 4
    { t: 'Capacidad', src: 'Transparencias', q: R`Define la capacidad de un canal discreto sin memoria.`, a: R`<p>\(C=\max_{p(x)}I(X;Y)\), en bits por uso del canal. Es la máxima información por símbolo que puede atravesar el canal.</p>` },
    { t: 'Capacidad', src: 'Examen ene 2023 (hoja del 1.er parcial, materia del tema 4)', q: R`¿Qué condiciones cumple un canal simétrico? ¿Por qué entonces \(C=\log|\mathcal Y|-H(\text{fila de }Q)\)?`, a: R`<p>Filas de \(Q\) permutaciones entre sí y columnas permutaciones entre sí. \(I(X;Y)=H(Y)-H(Y/X)\), con \(H(Y/X)=\sum_xp(x)H(\text{fila})=H(\text{fila})\). Entonces \(C=\max H(Y)-H(\text{fila})\). Una entrada uniforme da salida uniforme, luego \(\max H(Y)=\log|\mathcal Y|\).</p>` },
    { t: 'Capacidad', src: 'Examen ene 2026', q: R`a) Define canal simétrico. b) Escribe su capacidad. c) Demuéstrala.`, a: R`<p>a) Las filas de \(Q\) son permutaciones entre sí, y las columnas también. b) \(C=\log_2|\mathcal Y|-H(\text{fila de }Q)\). c) \(H(Y/X)=\sum_xp(x)H(Y/X=x)=H(\text{fila})\), constante. Entonces \(C=\max_{p(x)}H(Y)-H(\text{fila})\), y \(H(Y)\le\log|\mathcal Y|\) se alcanza con entrada uniforme, porque cada \(p(y)\) es la suma de una columna entre \(|\mathcal X|\), igual para todas.</p>` },
    { t: 'Capacidad', src: 'Transparencias', q: R`¿Qué diferencia un canal débilmente simétrico de uno simétrico?`, a: R`<p>Sus filas también son permutaciones, pero a las columnas solo se les pide que sumen todas lo mismo. La capacidad se calcula igual. Todo simétrico es débilmente simétrico, no al revés.</p>` },
    { t: 'Capacidad', src: 'Transparencias', q: R`Capacidad del BSC y del canal con borrado. ¿Con qué entrada?`, a: R`<p>BSC: \(C=1-H(p)\). Borrado: \(C=1-\alpha\). En ambos, \(p(x)=(\tfrac12,\tfrac12)\).</p>` },
    { t: 'Capacidad', src: 'Transparencias', q: R`Enuncia las propiedades de la capacidad.`, a: R`<p>\(C\ge0\); \(C\le\log|\mathcal X|\); \(C\le\log|\mathcal Y|\). \(I(X;Y)\) es continua y con forma de ∩ en \(p(x)\): un máximo local es global.</p>` },
    { t: 'Capacidad', src: 'Examen jun 2024 (hoja del 1.er parcial, materia del tema 4)', q: R`Enuncia de la forma más completa que sepas el segundo teorema de Shannon.`, a: R`<p>La capacidad es el máximo de bits que pueden cruzar un canal por uso, con probabilidad de error tan pequeña como se quiera y manteniendo \(k/n\) constante. <b>Directo:</b> para \(R\lt C\) existe una secuencia de códigos \((2^{nR},n)\) con \(P_e\to0\) cuando \(n\to\infty\). <b>Inverso:</b> ninguna \(R\gt C\) es alcanzable. Es de existencia: no dice cómo construir el código.</p>` },
    { t: 'Capacidad', src: 'Examen ene 2023', q: R`¿Qué relación tienen las fórmulas de cadencia eficaz de ARQ con el 2.º teorema de Shannon?`, a: R`<p>El teorema dice que si \(R\lt C\) se puede hacer \(P_{err}\to0\). En ARQ y FEC, la cadencia eficaz siempre es menor que \(C=1-H(p)\approx1\) por uso: \(\rho=C_{ef}/R\lt1\). Se está por debajo de la capacidad, y por eso se consigue una probabilidad residual tan pequeña como se desee. Ojo: en ARQ \(R\) es régimen binario y en el teorema \(R=k/n\).</p>` },
    { t: 'Capacidad', src: 'Transparencias', q: R`Escribe la capacidad de un canal continuo.`, a: R`<p>\(C=B\log_2(1+S/N)\) bit/s. Con \(B=3{,}1\) kHz y S/N = 30 dB, \(C\approx31\) kbit/s.</p>` },
    // Tema 5
    { t: 'Lineales', src: 'Examen ene 2023', q: R`Define código lineal y código cíclico.`, a: R`<p><b>Lineal:</b> conjunto de \(2^k\) palabras de longitud \(n\) que forman un subespacio vectorial de \(V_n\); es decir, la suma de dos palabras también es palabra. <b>Cíclico:</b> código lineal en el que las rotaciones de cada palabra también pertenecen al código.</p>` },
    { t: 'Lineales', src: 'Examen jun 2023', q: R`¿Cualquier subespacio de dimensión k de \(V_n\) sobre GF(2) puede formar un código lineal C(n,k)?`, a: R`<p>Todo subespacio contiene al \(\vec 0\) y es cerrado por combinaciones, así que cumple la definición. Pero tiene que cumplirse \(0\lt k\lt n\): quedan excluidos el subespacio trivial y el propio \(V_n\), que no tiene redundancia.</p>` },
    { t: 'Lineales', src: 'Examen jun 2026', q: R`Define qué es un código de canal y para qué se utiliza.`, a: R`<p>Es una correspondencia entre los \(2^k\) mensajes de la fuente y \(2^k\) palabras de \(n\gt k\) bits. Añade \(n-k\) bits de redundancia controlada para detectar o corregir los errores del canal.</p><p class="small muted">La solución oficial copia aquí la definición de código de fuente (longitud variable), que no responde a la pregunta.</p>` },
    { t: 'Lineales', src: 'Examen jun 2026', q: R`Razona por qué en un código lineal el número de palabras de peso impar es nulo o igual al de peso par.`, a: R`<p>Sean \(C_i\) las palabras impares y \(C_p\) las pares. Si \(C_i\) no es nulo, toma \(c\in C_i\). Sumar \(c\) a cada palabra de \(C_p\) da palabras impares distintas: \(|C_i|\ge|C_p|\). Sumar \(c\) a cada palabra de \(C_i\) da palabras pares distintas: \(|C_p|\ge|C_i|\). Por tanto, son iguales.</p>` },
    { t: 'Lineales', src: 'Examen ene 2023', q: R`Demuestra que el síndrome no depende de la palabra enviada, solo del error.`, a: R`<p>\(\vec r=\vec v+\vec e\). \(\vec s=\vec rH^t=\vec vH^t+\vec eH^t\). Como \(\vec vH^t=\vec 0\), queda \(\vec s=\vec eH^t\).</p>` },
    { t: 'Lineales', src: 'Apuntes', q: R`¿Cómo se relaciona \(d_{min}\) con la matriz H? ¿Y con los pesos?`, a: R`<p>\(d_{min}\) es el mínimo número de columnas de \(H\) que suman \(\vec 0\). También es el menor peso de una palabra código no nula, porque \(d(\vec v,\vec w)=\omega(\vec v+\vec w)\) y la suma es otra palabra código.</p>` },
    { t: 'Lineales', src: 'Apuntes', q: R`Da \(s_{max}\) y \(t_{max}\) y la relación en un método mixto.`, a: R`<p>\(s_{max}=d_{min}-1\). \(t_{max}=\lfloor(d_{min}-1)/2\rfloor\). Mixto: \(d_{min}=s+t+1\), con \(t\le s\).</p>` },
    { t: 'Lineales', src: 'Examen jun 2023', q: R`Al recibir una palabra errónea, ¿con qué criterio decidimos a qué palabra corregir?`, a: R`<p>\(\hat{\vec v}=\vec r+\vec e_i\), con \(\vec e_i\) el líder de cogrupo con el mismo síndrome que \(\vec r\). Es la palabra código más cercana a la recibida: máxima verosimilitud si \(p\lt\tfrac12\).</p>` },
    { t: 'Lineales', src: 'Examen ene 2023', q: R`Describe cómo se construye la tabla estándar.`, a: R`<p>Matriz de \(2^k\) columnas y \(2^{n-k}\) filas. 1) En la primera fila, las palabras código, con \(\vec 0\) primero. 2) Escoge una n-tupla no incluida aún, lo más ligera posible: es el líder. 3) Rellena su fila con líder + palabra código de cada columna. 4) Repite hasta llenar.</p>` },
    { t: 'Lineales', src: 'Examen ene 2023', q: R`¿Qué es la probabilidad de error residual de un código lineal en modo detección? Da la expresión en un BSC.`, a: R`<p>Es la probabilidad de que el error del canal coincida con una palabra código no nula, porque entonces no se detecta. \(P_{ND}=\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\).</p>` },
    { t: 'Lineales', src: 'Examen jun 2024', q: R`¿Cuánto vale la probabilidad de error residual en detección pura, en corrección pura y en modo mixto?`, a: R`<p>Detección pura: \(\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\). Corrección pura: \(1-\sum_{i=0}^{n}\alpha_ip^i(1-p)^{n-i}\). Modo mixto, cota: \(\le\sum_{i=s+1}^{n}\binom nip^i(1-p)^{n-i}\), con \(d_{min}=s+t+1\) y \(0\lt t\lt s\).</p>` },
    { t: 'Lineales', src: 'Examen jun 2024', q: R`¿Qué expresión relaciona la distancia de Hamming con los bits de redundancia? Particulariza para el Hamming C(7,4).`, a: R`<p>Cota de Hamming: \(2^{n-k}\ge\sum_{i=0}^{t}\binom ni\) con \(t=\lfloor(d_{min}-1)/2\rfloor\): los líderes deben cubrir todos los errores de peso \(\le t\). C(7,4) con \(d_{min}=3,\ t=1\): \(2^3\ge1+7\), con igualdad.</p>` },
    { t: 'Lineales', src: 'Apuntes', q: R`¿Qué es un código perfecto? Da ejemplos.`, a: R`<p>Sus líderes de cogrupo son todos los errores de peso \(\le t_{max}\) y ninguno más: \(2^{n-k}=\sum_{i=0}^{t_{max}}\binom ni\). Ejemplos: los Hamming y el Golay C(23,12).</p>` },
    { t: 'Lineales', src: 'Apuntes', q: R`Da los parámetros de un código de Hamming y cómo es su H.`, a: R`<p>\(m\ge3\): \(n=2^m-1\), \(k=2^m-m-1\), \(n-k=m\), \(d_{min}=3\). Las columnas de \(H\) son todas las m-tuplas no nulas.</p>` },
    { t: 'Lineales', src: 'Examen ene 2023 y ene 2026', q: R`Indica las capacidades detectoras y correctoras de un C(n,k) con \(d_{min}\) en un canal de borrado.`, a: R`<p>Todos los bits erróneos se detectan porque el canal los marca: \(s=n\). Una palabra se confunde con otra solo si se borran justo los bits en que difieren, es decir, un patrón que pertenece al código. Por eso, \(t=d_{min}-1\).</p>` },
    // Tema 6
    { t: 'Cíclicos', src: 'Examen ene 2023 y ene 2026', q: R`Enuncia las propiedades del polinomio generador de un C(n,k) cíclico.`, a: R`<p>Es el polinomio código de menor grado. Es único de su grado. \(v(x)\in C\iff v(x)\) es múltiplo de \(g(x)\). Es factor de \(1+x^n\). Su grado es \(n-k\). Su término independiente es 1.</p>` },
    { t: 'Cíclicos', src: 'Examen jun 2023', q: R`Si \(x^n+1\) se factoriza en L factores, ¿cuántos códigos cíclicos hay de longitud n?`, a: R`<p>Cualquier combinación de factores es factor de \(x^n+1\): \(2^L\) combinaciones. Como \(0\lt k\lt n\), se descartan \(g(x)=1\) y \(g(x)=x^n+1\). Quedan \(2^L-2\).</p>` },
    { t: 'Cíclicos', src: 'Examen jun 2023', q: R`¿Por qué solo hay una ráfaga de longitud n−k+1 indetectable, en cada posición?`, a: R`<p>Porque una ráfaga de esa longitud tiene grado \(n-k\) y la única palabra código de ese grado es \(g(x)\), que es único.</p>` },
    { t: 'Cíclicos', src: 'Examen ene 2026', q: R`Demuestra que un C(n,k) cíclico detecta todas las ráfagas con \(l\le n-k\), sea cual sea su \(d_{min}\).`, a: R`<p>Desplazada al origen, la ráfaga es \(B(x)=1+e_1x+\dots+x^{l-1}\), de grado \(l-1\lt n-k\). \(g(x)\) es el polinomio código de grado mínimo, \(n-k\). Luego \(B(x)\) no es múltiplo de \(g(x)\), y tampoco \(x^iB(x)\), porque \(g_0=1\). El error no pertenece al código.</p>` },
    { t: 'Cíclicos', src: 'Examen ene 2023', q: R`Calcula el número de ráfagas indetectables de longitud 8 en un C(15,10).`, a: R`<p>\(n-k=5\) y \(l=8\gt6\). Indetectables: \(2^{l-(n-k)-2}=2^{1}=2\), de las \(2^{l-2}=64\) posibles. Fracción: \(1/2^{5}=1/32\).</p><p class="small muted">La solución oficial escribe \(1/2\): es una errata.</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Cuándo detecta un cíclico todos los errores impares? ¿Y todos los dobles?`, a: R`<p><b>Impares:</b> si \((1+x)\) es factor de \(g(x)\), porque un error impar cumple \(e(1)=1\) y un múltiplo de \((1+x)\) cumple \(e(1)=0\). <b>Dobles:</b> si \(g(x)\) tiene un factor primitivo de grado \(r\) y \(n\le2^r-1\).</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Qué es un polinomio primitivo?`, a: R`<p>De grado \(r\): irreducible, factor de \(x^{2^r-1}+1\) y no factor de \(x^t+1\) para \(t\lt2^r-1\). Un primitivo de grado \(m\ge3\) genera un Hamming cíclico.</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Cómo se codifica sistemáticamente con g(x)?`, a: R`<p>\(b(x)=\text{resto}\,\dfrac{x^{n-k}u(x)}{g(x)}\) y \(v(x)=b(x)+x^{n-k}u(x)\). Es decir, \(\vec v=(b_0\dots b_{n-k-1}\,u_0\dots u_{k-1})\).</p>` },
    { t: 'Cíclicos', src: 'Apuntes y exámenes', q: R`Codificador basado en g(x) o en h(x): ¿cuántos registros tiene cada uno y cuál eliges?`, a: R`<p>Basado en \(g(x)\): \(n-k\) registros. Basado en \(h(x)\): \(k\) registros. Se elige el que tenga menos.</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Qué es un código cíclico recortado?`, a: R`<p>\(C(n,k)\to C_R(n-l,k-l)\): se quitan las palabras cuya información empieza con \(l\) ceros. Conserva \(d_{min}\) y las propiedades detectoras y correctoras, usa casi el mismo circuito, pero es lineal y <b>no cíclico</b>.</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Cómo se mejora un Hamming cíclico hasta \(d_{min}=4\)?`, a: R`<p>\(g(x)=(1+x)p(x)\) con \(p(x)\) primitivo. \(p(x)\) detecta los errores simples y dobles, y \((1+x)\) los impares. Por tanto, detecta peso 1, 2 y 3: \(d_{min}=4\), C(n,k−1).</p>` },
    { t: 'Cíclicos', src: 'Apuntes', q: R`¿Cómo se obtiene H desde h(x)?`, a: R`<p>\(h(x)=(x^n+1)/g(x)\), de grado \(k\). Las filas de \(H\) son las \(n-k\) rotaciones de \((h_k,h_{k-1},\dots,h_0,0,\dots,0)\), es decir, del recíproco \(x^kh(x^{-1})\). Este recíproco genera el código dual, C(n,n−k).</p>` },
    // Tema 7
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`Compara FEC y ARQ.`, a: R`<p><b>FEC:</b> código en corrección, sin canal de retorno, sirve en canales unidireccionales, difusión y almacenamiento. Rendimiento \(k/n\) y latencia fija. <b>ARQ:</b> código en detección, exige canal de retorno y buffer, y latencia variable. Menor error residual, pero el rendimiento baja si el canal empeora.</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`¿Qué hipótesis se hacen para calcular las prestaciones de ARQ?`, a: R`<p>Tráfico unidireccional, tramas de control sin errores, bloques iguales de \(k\) bits con C(n,k), y siempre hay datos que transmitir.</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`¿Qué es la cadencia eficaz y qué es \(T_{as}\)?`, a: R`<p>\(C_{ef}=k/\bar T_{oc}\): bits de usuario entre el tiempo medio que el canal está ocupado. \(T_{as}\) va desde que se envía el último bit hasta que se puede enviar la siguiente trama: propagación de datos, cálculo del síndrome, transmisión y propagación de la trama de control y su proceso.</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`Escribe \(C_{ef}\) en FEC, parada y espera, rechazo simple y rechazo selectivo.`, a: R`<p>FEC: \(\tfrac{k}{k+m}R\). PyE: \((1-P_{RTX})\tfrac{k}{k+m+T_{as}R}R\). Rechazo simple: \((1-P_{RTX})\tfrac{k}{k+m+T_{as}RP_{RTX}}R\). Rechazo selectivo: \((1-P_{RTX})\tfrac{k}{k+m}R\).</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`Escribe \(P_{RTX}\) exacta y sus aproximaciones.`, a: R`<p>Exacta: \(1-(1-p)^n-\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\). Sin \(A_i\): \(\sum_{i=1}^{s}\binom nip^i(1-p)^{n-i}\). Sin \(d_{min}\), detectándolo todo: \(1-(1-p)^n\approx np\).</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`¿Qué limitación de ventana hay en rechazo simple y en rechazo selectivo?`, a: R`<p>Con \(b\) bits, MAXSEQ \(=2^b-1\). Rechazo simple: \(W_T\le\) MAXSEQ, con \(W_R=1\). Rechazo selectivo: \(W_T+W_R\le\) MAXSEQ+1.</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`Da la longitud óptima de bloque en parada y espera.`, a: R`<p>\(k_{opt}\approx\sqrt{(m+RT_{as})/p}\). Sale de \(dC_{ef}/dk=0\): un bloque corto gasta en redundancia y asentimiento, y uno largo se repite demasiado.</p>` },
    { t: 'FEC y ARQ', src: 'Apuntes', q: R`¿Qué es un ARQ híbrido? Da \(P_{RTX}\) y \(P_{ER}\) en modo (s,t).`, a: R`<p>El código corrige hasta \(t\) errores y detecta hasta \(s\). \(P_{RTX}\approx\sum_{i=t+1}^{s}\binom nip^i(1-p)^{n-i}\) y \(P_{ER}\approx\sum_{i=s+1}^{n}\binom nip^i(1-p)^{n-i}\). Se mantienen las fórmulas de \(C_{ef}\) de cada técnica.</p>` }
  ];

  /* ------------------------------------------------------------------ */
  const exams = [
    /* ---------------- JUNIO 2026 ---------------- */
    {
      id: 'jun26', title: 'Junio 2026', date: '24 de junio de 2026', minutes: 75,
      intro: 'Teoría (15 min, 30 %) y dos problemas (60 min, 70 %). El primer parcial de este PDF no aparece aquí.',
      problems: [
        { title: 'Teoría', statement: '', parts: [
          { tag: '1', pts: 2, q: R`Razona por qué en todo código lineal el número de palabras de peso impar es nulo o igual al de peso par.`, hint: R`La suma de una palabra impar y una par es impar. Fija una impar y súmala a todas.`,
            sol: R`<p>Sean \(C_i\) las impares y \(C_p\) las pares. Si \(C_i\) no es nulo, toma \(c_i\in C_i\).</p><p>\(\{c_i+c_k:c_k\in C_p\}\) son palabras impares distintas, tantas como \(C_p\): \(|C_i|\ge|C_p|\). Análogamente, \(\{c_i+c_k:c_k\in C_i\}\) son pares distintas: \(|C_p|\ge|C_i|\). Por tanto, \(|C_i|=|C_p|\).</p>` },
          { tag: '2', pts: 1, q: R`Define qué es un código de codificación de canal y para qué se utiliza.`, hint: R`Piensa en la redundancia. No lo confundas con un código de fuente.`,
            sol: R`<p>Es una correspondencia entre los \(2^k\) mensajes de la fuente y \(2^k\) palabras de \(n\gt k\) bits. Añade \(n-k\) bits de redundancia controlada para que el receptor pueda detectar o corregir los errores del canal.</p>`,
            errata: R`La oficial dice "correspondencia entre cada símbolo de la fuente y una secuencia de longitud variable de símbolos del alfabeto del código fuente". Esa es la definición de código de fuente (primer parcial), no de canal.` }
        ] },
        { title: 'Problema 1 · 3 puntos · 15 min',
          statement: R`<p>Considera el código generado por: \(v_0=u_0+u_1\), \(v_1=u_0+u_2\), \(v_2=u_1+u_2\), \(v_3=u_0+u_1+u_2\), \(v_4=u_0\), \(v_5=u_1\), \(v_6=u_2\), con palabra fuente \((u_0u_1u_2)\) y palabra código \((v_0v_1v_2v_3v_4v_5v_6)\).</p>`,
          parts: [
            { tag: 'a', q: R`Escribe la matriz generadora G y la matriz de paridad H.`, hint: R`Cada \(u_i\) es una fila de \(G\): mira en qué ecuaciones aparece. Luego \(H=(I_{n-k}\,|\,P^t)\).`,
              sol: R`<p>Con el orden del enunciado (información al final):</p><p class="mono">G = 1101100 · 1011010 · 0111001</p><p class="mono">H = 1000110 · 0100101 · 0010011 · 0001111</p>`,
              errata: R`La oficial da \(G=(1001101;\ 0101011;\ 0010111)\) y \(H=(1101000;\ 1010100;\ 0110010;\ 1110001)\): pone la información a la izquierda, sin seguir el orden \(v_0\dots v_6\) del enunciado. Es un código equivalente por permutación de columnas: misma \(d_{min}\) y mismos pesos, pero no las mismas ecuaciones.` },
            { tag: 'b', q: R`Calcula la distancia mínima.`, hint: R`Con \(k=3\) son 7 palabras no nulas: calcula sus pesos.`,
              sol: R`<p>Las 7 palabras no nulas pesan 4: \(A_4=7\). Luego \(d_{min}=4\), y por eso \(t_{max}=1\), \(s_{max}=3\).</p>` },
            { tag: 'c', q: R`Código sobre un BSC en máxima corrección. Escribe una tabla de corrección basada en la tabla estándar.`, hint: R`\(2^4=16\) síndromes. Primero peso 0, luego los 7 de peso 1 y luego los de peso 2 que no repitan síndrome.`,
              sol: R`<p>Tabla de \(2^4=16\) filas y \(2^3=8\) columnas: 16 síndromes. Con \(H^t\) se calcula el síndrome de cada error ligero:</p><div data-widget="lineal" data-mode="eq" data-text="v0=u0+u1; v1=u0+u2; v2=u1+u2; v3=u0+u1+u2; v4=u0; v5=u1; v6=u2"></div><p class="small">Hay empates, y otros líderes de peso 2 también valdrían. Por eso la pregunta dice "una posible tabla".</p>` },
            { tag: 'd', q: R`Calcula la probabilidad de error de corrección pura.`, hint: R`Cuenta los líderes por peso. Con \(q=1-p\).`,
              sol: R`<p>Se corrigen los 7 errores de peso 1, 7 de peso 2 y 1 de peso 3, además de "sin error":</p>\[ P_{NC}=1-q^7-7pq^6-7p^2q^5-p^3q^4 \]` }
          ] },
        { title: 'Problema 2 · 7 puntos · 45 min',
          statement: R`<p>Código cíclico C(63,51) con distancia mínima 5 y \(g(x)=1+x^3+x^4+x^5+x^8+x^{10}+x^{12}\). Canal con régimen binario R, tiempo de asentimiento \(T_{as}\) en ms y probabilidad de error de bit p.</p>`,
          parts: [
            { tag: 'a', q: R`Número de palabras código de grado 12 y de grado 13.`, hint: R`Las palabras son \(a(x)g(x)\). ¿Qué grado tiene \(a(x)\)?`,
              sol: R`<p>Grado 12: 1 palabra, \(g(x)\). Grado 13: 2 palabras, \(xg(x)\) y \((1+x)g(x)\). En general, \(2^{d-12}\).</p>` },
            { tag: 'b', q: R`Razona si es un código perfecto.`, hint: R`Compara \(2^{n-k}\) con los errores corregibles.`,
              sol: R`<p>Líderes: \(2^{12}=4096\). \(d_{min}=5\Rightarrow t_{max}=2\): errores corregibles \(1+63+\binom{63}2=1+63+1953=2017\lt4096\). <b>No es perfecto.</b></p>` },
            { tag: 'c', q: R`¿Circuito codificador basado en g(x) o en h(x)?`, sol: R`<p>Basado en \(g(x)\): 12 registros. Basado en \(h(x)\): 51. Mejor \(g(x)\).</p>` },
            { tag: 'd', q: R`¿Detecta estos errores? \(e_1=x+x^7+x^{12}\); \(e_2=x^{35}+x^{43}\); \(e_3=x^3+x^6+x^7+x^8+x^{11}+x^{13}+x^{15}\).`, hint: R`Calcula primero la longitud de ráfaga. Mira si alguno tiene la misma forma que \(g(x)\) desplazado.`,
              sol: R`<p>\(e_1\): ráfaga de \(l=12\le n-k\): se detecta. (También, peso 3 \(\lt5\).) \(e_2\): ráfaga de \(l=9\): se detecta. \(e_3=x^3g(x)\): es palabra código, <b>no se detecta</b>.</p><div data-widget="ciclico" data-n="63" data-g="1+x^3+x^4+x^5+x^8+x^10+x^12" data-e="x+x^7+x^12; x^35+x^43; x^3+x^6+x^7+x^8+x^11+x^13+x^15"></div>`,
              errata: R`La oficial escribe \(e_3=x^2g(x)\). Es \(x^3g(x)\): \(x^3\cdot1=x^3\). La conclusión no cambia.` },
            { tag: 'e', q: R`Calcula una palabra de grado 20.`, sol: R`<p>\(x^8g(x)=x^8+x^{11}+x^{12}+x^{13}+x^{16}+x^{18}+x^{20}\). Vale cualquier \(a(x)g(x)\) con \(a(x)\) de grado 8.</p>` },
            { tag: 'f', q: R`Enumera los modos de uso.`, sol: R`<p>\(d_{min}=5=s+t+1\): \((s,t)=(4,0)\) detección pura; \((3,1)\) híbrido; \((2,2)\) corrección pura.</p>` },
            { tag: 'g', q: R`FEC: \(P_{ER}\) y \(C_{ef}\) en función de los parámetros.`, sol: R`\[ P_{ER}=P(\omega(e)\gt2)=\sum_{i=3}^{63}\binom{63}ip^i(1-p)^{63-i},\qquad C_{ef}=\frac kn R=\frac{51}{63}R \]` },
            { tag: 'h', q: R`ARQ: \(P_{ER}\) y \(C_{ef}\).`, sol: R`<p>Detección pura, \((4,0)\). Sin más datos, parada y espera:</p>\[ P_{ER}=\sum_{i=5}^{63}\binom{63}ip^i(1-p)^{63-i},\qquad P_{RTX}=\sum_{i=1}^{4}\binom{63}ip^i(1-p)^{63-i} \]\[ C_{ef}=(1-P_{RTX})\frac{51}{63+T_{as}R}R \]<p class="small">Como \(T_{as}\) viene en ms y \(R\) en bit/s, en la cuenta es \(T_{as}\cdot10^{-3}\cdot R\). La oficial no lo escribe, pero tenlo en cuenta.</p>` },
            { tag: 'i', q: R`ARQ híbrido: \(P_{ER}\) y \(C_{ef}\) para cada técnica posible.`, hint: R`¿Cuál de los modos deja zona de corrección y de detección?`,
              sol: R`<p>Solo \((s,t)=(3,1)\). En \((2,2)\) no queda detección y es FEC.</p>\[ P_{ER}=\sum_{i=4}^{63}\binom{63}ip^i(1-p)^{63-i},\quad P_{RTX}=\sum_{i=2}^{3}\binom{63}ip^i(1-p)^{63-i},\quad C_{ef}=(1-P_{RTX})\frac{51}{63+T_{as}R}R \]` }
          ] }
      ]
    },
    /* ---------------- ENERO 2026 ---------------- */
    {
      id: 'ene26', title: 'Enero 2026', date: '26 de enero de 2026', minutes: 70,
      intro: 'Teoría (15 min, 40 %) y dos problemas (55 min, 60 %). El primer parcial de este PDF no aparece aquí.',
      problems: [
        { title: 'Teoría', statement: '', parts: [
          { tag: '1', pts: 1, q: R`a) Define canal simétrico. b) Escribe su capacidad. c) Demuéstrala.`, hint: R`\(I=H(Y)-H(Y/X)\). Las filas dan \(H(Y/X)\); las columnas, el máximo de \(H(Y)\).`,
            sol: R`<p>a) Filas de \(Q\) permutaciones entre sí y columnas permutaciones entre sí.</p><p>b) \(C=\log_2|\mathcal Y|-H(\text{fila de }Q)\).</p><p>c) \(H(Y/X)=\sum_xp(x)H(Y/X=x)=\sum_xp(x)H(\text{fila})=H(\text{fila})\). Luego \(C=\max_{p(x)}H(Y)-H(\text{fila})\). \(H(Y)\le\log|\mathcal Y|\), con igualdad si \(Y\) es uniforme, y eso se consigue con entrada uniforme.</p>` },
          { tag: '2', pts: 1, q: R`Capacidades detectoras y correctoras de un cíclico C(n,k) con \(d_{min}\) sobre un canal de borrado.`,
            sol: R`<p>Todo bit erróneo llega marcado como \(e\): \(s=n\). Para confundir la palabra con otra tienen que borrarse los bits que las diferencian, que son un patrón del código. Por eso, \(t=d_{min}-1\).</p>` },
          { tag: '3', pts: 1, q: R`Enuncia tres propiedades del polinomio generador.`, sol: R`<p>Tres cualesquiera: es el polinomio código de menor grado; es único de su grado; \(v(x)\in C\iff v(x)\) es múltiplo de \(g(x)\); es factor de \(1+x^n\); tiene grado \(n-k\).</p>` },
          { tag: '4', pts: 1, q: R`Demuestra que un cíclico detecta todas las ráfagas de \(l\le n-k\), con cualquier \(d_{min}\).`,
            sol: R`<p>Desplazada al origen: \(e(x)=1+e_1x+\dots+e_{l-2}x^{l-2}+x^{l-1}\), de grado \(l-1\lt n-k\). No puede ser palabra código, porque \(g(x)\) es el de grado mínimo, \(n-k\).</p>` }
        ] },
        { title: 'Problema 1 · 3 puntos · 10 min',
          statement: R`<p>Calcula la capacidad de los siguientes canales, y la distribución a la entrada que la consigue.</p>`,
          parts: [
            { tag: 'a', q: R`\(Q=\begin{pmatrix}1&0\\\tfrac12&\tfrac12\\0&1\end{pmatrix}\)`, hint: R`Llama \(a,b,c\) a las entradas. ¿Cuánto vale \(H(Y/X)\)?`,
              sol: R`<p>\(H(Y/X)=b\) y \(H(Y)=H(a+\tfrac b2,\ c+\tfrac b2)\). \(H(Y)\) es máxima con \(a=c\): \(I=1-b\), que es máxima con \(b=0\).</p><p>\(C=1\) bit/uso, con \(p(x)=(\tfrac12,0,\tfrac12)\).</p>` },
            { tag: 'b', q: R`\(Q=\begin{pmatrix}\tfrac25&\tfrac15&\tfrac15&\tfrac15&0\\0&\tfrac25&\tfrac15&\tfrac15&\tfrac15\\\tfrac15&0&\tfrac15&\tfrac15&\tfrac25\end{pmatrix}\)`,
              sol: R`<p>Filas permutaciones y columnas que suman todas \(\tfrac35\): débilmente simétrico.</p><div data-widget="canal" data-matrix="2/5 1/5 1/5 1/5 0; 0 2/5 1/5 1/5 1/5; 1/5 0 1/5 1/5 2/5"></div><p>\(C=\log_25-H(\tfrac25,\tfrac15,\tfrac15,\tfrac15)=\tfrac25\) bits/uso, con entrada uniforme.</p>` },
            { tag: 'c', q: R`\(Q=\begin{pmatrix}1-x&0&0&0&x\\0&1-x&0&0&x\\0&0&1-x&0&x\\0&0&0&1-x&x\end{pmatrix}\)`, hint: R`Es un canal con borrado de cuatro entradas. Usa la propiedad de agrupamiento.`,
              sol: R`<p>\(H(Y/X)=H(x)\). \(H(Y)=H(p_0(1-x),\dots,p_3(1-x),x)=(1-x)H(p_0,\dots,p_3)+H(x)\).</p><p>\(C=\max[(1-x)H(p_0,\dots,p_3)]=2(1-x)\) bits/uso, con \(p_i=\tfrac14\).</p>` }
          ] },
        { title: 'Problema 2 · 7 puntos · 45 min',
          statement: R`<p>Código cíclico C(15,4) con distancia mínima 8 y \(g(x)=(1+x)(1+x+x^2)(1+x+x^4)(1+x+x^2+x^3+x^4)\).</p>`,
          parts: [
            { tag: 'a', pts: 0.5, q: R`Calcula su matriz generadora sistemática.`, hint: R`Multiplica \(g(x)\); \(G\) son 4 rotaciones. Después, combina filas hasta tener \(I_4\) a la derecha.`,
              sol: R`<p>\(g(x)=1+x^3+x^4+x^6+x^8+x^9+x^{10}+x^{11}\).</p><p class="mono">G = 100110101111000 · 010011010111100 · 001001101011110 · 000100110101111</p><p class="mono">Gs = 100110101111000 · 110101111000100 · 011010111100010 · 001101011110001</p><p class="small">Filas de \(G_s\): (1), (1)+(2), (2)+(3), (3)+(4).</p>` },
            { tag: 'b', pts: 1, q: R`Comprueba si es perfecto.`,
              sol: R`<p>Tabla: \(2^4=16\) columnas y \(2^{11}=2048\) filas. \(d_{min}=8\Rightarrow t_{max}=3\): \(1+\binom{15}1+\binom{15}2+\binom{15}3=576\lt2048\). <b>No es perfecto.</b></p>` },
            { tag: 'c', pts: 0.5, q: R`Enumera los modos.`, sol: R`<p>\(s_{max}=7,\ t_{max}=3\). \((7,0)\), \((6,1)\), \((5,2)\), \((4,3)\).</p>` },
            { tag: 'd', pts: 1, q: R`En detección pura, razona sus capacidades de detección, incluidas las ráfagas.`,
              sol: R`<ul><li>\(s_{max}=7\): todos los errores de peso 1 a 7.</li><li>\(n-k=11\): todas las ráfagas de longitud \(\le11\).</li><li>\(g(x)\) tiene el factor \((1+x)\): todos los errores de peso impar.</li></ul>` },
            { tag: 'e', pts: 0.5, q: R`¿Qué circuito codificador eliges y por qué?`,
              sol: R`<p>\(h(x)=(x^{15}+1)/g(x)=1+x^3+x^4\). Basado en \(h(x)\): 4 registros. Basado en \(g(x)\): 11. <b>Elijo \(h(x)\).</b></p>` },
            { tag: 'f', pts: 1, q: R`Razona si se detectan: \(e_1=x+x^3+x^5+x^7+x^{13}+x^{14}\); \(e_2=x^3+x^5+x^6+x^8+x^{10}+x^{11}+x^{12}+x^{13}+x^{14}\); \(e_3=1+x+\dots+x^9\); \(e_4=1+x+\dots+x^9+x^{11}\).`, hint: R`Cuenta el peso de cada uno y mira la longitud de ráfaga.`,
              sol: R`<p>\(e_1\): peso 6 \(\lt d_{min}\). \(e_2\): peso 9, impar. \(e_3\): ráfaga de \(l=10\le11\). \(e_4\): peso 11, impar. Se detectan todos.</p><div data-widget="ciclico" data-n="15" data-g="(1+x)(1+x+x^2)(1+x+x^4)(1+x+x^2+x^3+x^4)" data-e="x+x^3+x^5+x^7+x^13+x^14; x^3+x^5+x^6+x^8+x^10+x^11+x^12+x^13+x^14; 1+x+x^2+x^3+x^4+x^5+x^6+x^7+x^8+x^9; 1+x+x^2+x^3+x^4+x^5+x^6+x^7+x^8+x^9+x^11"></div>` },
            { tag: 'g', pts: 1, q: R`Sistema ARQ, BSC con p, corrigiendo hasta peso 2. Calcula la probabilidad de solicitar retransmisión.`,
              sol: R`<p>\(t=2\Rightarrow s=5\). Se retransmite con \(\omega(e)=3,4,5\):</p>\[ P_{RTX}=\sum_{i=3}^{5}\binom{15}ip^i(1-p)^{15-i} \]` },
            { tag: 'h', pts: 1, q: R`Calcula la distribución de pesos.`, hint: R`16 palabras, y \(g(x)\) tiene 15 rotaciones distintas.`,
              sol: R`<p>Hay \(2^4=16\) palabras: \(\vec 0\) y las 15 rotaciones de \(g(x)\), que pesa 8. \(A_0=1,\ A_8=15\).</p>` },
            { tag: 'i', pts: 0.5, q: R`En detección pura, calcula exactamente \(P_{ER}\).`, sol: R`\[ P_{ER}=15\,p^8(1-p)^7 \]` }
          ] }
      ]
    },
    /* ---------------- ENERO 2025 ---------------- */
    {
      id: 'ene25', title: 'Enero 2025', date: '27 de enero de 2025', minutes: 50,
      intro: 'Tres problemas (50 min). El PDF no trae la parte de teoría, y el primer parcial no aparece aquí.',
      problems: [
        { title: 'Problema 1 · 1 punto · 10 min',
          statement: R`<p>Calcula la capacidad de los siguientes canales, y la distribución a la entrada que la consigue.</p>`,
          parts: [
            { tag: 'a', q: R`Concatenación de dos BSC iguales de parámetro p.`, hint: R`¿Cuándo sale mal un bit tras los dos canales?`,
              sol: R`<p>Sale mal si falla uno de los dos: \(2p(1-p)\). Sale bien con \((1-p)^2+p^2\).</p>\[ C=1-H\big(2p(1-p),\ (1-p)^2+p^2\big)\ \text{bits, con entrada uniforme} \]` },
            { tag: 'b', q: R`\(Q=\begin{pmatrix}0{,}7&0{,}2&0&0{,}1\\0{,}1&0{,}7&0{,}2&0\\0&0{,}1&0{,}7&0{,}2\\0{,}2&0&0{,}1&0{,}7\end{pmatrix}\)`,
              sol: R`<p>Simétrico: \(C=\log_24-H(0{,}7;\ 0{,}2;\ 0{,}1)=2-1{,}1568=0{,}8432\) bits, con entrada uniforme.</p><div data-widget="canal" data-matrix="0.7 0.2 0 0.1; 0.1 0.7 0.2 0; 0 0.1 0.7 0.2; 0.2 0 0.1 0.7"></div>`,
              errata: R`La oficial da \(2-1{,}5678=0{,}4322\). \(H(0{,}7;\ 0{,}2;\ 0{,}1)\) vale 1,1568: tiene dos cifras cambiadas.` }
          ] },
        { title: 'Problema 2 · 4 puntos · 15 min',
          statement: R`<p>Se conocen estas factorizaciones y polinomios primitivos:</p>
            <p>\(x^{15}+1=(x+1)(x^2+x+1)(x^4+x+1)(x^4+x^3+x^2+x+1)(x^4+x^3+1)\)</p>
            <p>\(x^{31}+1=(x+1)(x^5+x^2+1)(x^5+x^3+1)(x^5+x^3+x^2+x+1)(x^5+x^4+x^2+x+1)(x^5+x^4+x^3+x+1)(x^5+x^4+x^3+x^2+1)\)</p>
            <p>Primitivos: grado 2, \(1+x+x^2\); grado 3, \(1+x+x^3\); grado 4, \(1+x+x^4\); grado 5, \(1+x^2+x^5\), \(1+x+x^2+x^4+x^5\), \(1+x^2+x^3+x^4+x^5\).</p>`,
          parts: [
            { tag: 'a', q: R`Diseña un código (dimensiones y g(x)) que proteja mensajes de 25 bits con la mayor \(d_{min}\).`, hint: R`\(k=25\) obliga a \(n=31\). ¿Qué grado debe tener \(g(x)\)?`,
              sol: R`<p>C(31,25): \(n-k=6\). Elijo \((x+1)\), que detecta impares, y \((x^5+x^2+1)\), primitivo: \(g(x)=(x+1)(x^5+x^2+1)\), con \(d_{min}=4\).</p>` },
            { tag: 'b', q: R`Diseña un código que proteja mensajes de k bits frente a ráfagas de 20 bits.`, hint: R`Para detectar ráfagas de 20 bits, \(n-k\ge20\).`,
              sol: R`<p>\(n-k=20\), y debe ser \(n=31\): C(31,11). Necesito \(g(x)\) de grado 20, por ejemplo \(g(x)=(x^5+x^2+1)(x^5+x^3+1)(x^5+x^3+x^2+x+1)(x^5+x^4+x^2+x+1)\). Sale \(d_{min}=11\).</p>` },
            { tag: 'c', q: R`Para cada factorización, ¿hay códigos adecuados para k = 12? Especifícalos.`, hint: R`Calcula el grado de \(g(x)\) en cada caso y mira si se puede formar sumando grados de factores.`,
              sol: R`<p>\(n=31\): C(31,12) necesita grado 19. Los grados disponibles son 1 y 5, así que solo salen \(5a\) o \(5a+1\): <b>no se puede</b>.</p><p>\(n=15\): C(15,12) necesita grado 3: \(g(x)=(x+1)(x^2+x+1)=1+x^3\). <b>Sí se puede</b>.</p><div data-widget="factor" data-n="31"></div>` }
          ],
          note: ''
        },
        { title: 'Problema 3 · 5 puntos · 20 min',
          statement: R`<p>Mensajes protegidos con C(31,25) y \(d_{min}=4\), sobre un canal con probabilidad de error de bit p.</p>`,
          parts: [
            { tag: 'a', q: R`Maximizando la detección, calcula la probabilidad de que: el canal introduzca errores; se entregue un mensaje incorrecto; el decodificador detecte un error.`, hint: R`\(s=3,\ t=0\). Dibuja las zonas de \(\omega(e)\).`,
              sol: R`<p>\(s=3,\ t=0\).</p>\[ P_{\text{canal}}=1-(1-p)^{31},\quad P_{ER}=\sum_{i=4}^{31}\binom{31}ip^i(1-p)^{31-i},\quad P_{\text{detectar}}=\sum_{i=1}^{3}\binom{31}ip^i(1-p)^{31-i} \]` },
            { tag: 'b', q: R`Maximizando la corrección: mensaje incorrecto; detecta; corrige.`,
              sol: R`<p>\(s=2,\ t=1\).</p>\[ P_{ER}=\sum_{i=3}^{31}\binom{31}ip^i(1-p)^{31-i},\quad P_{\text{detectar}}=\binom{31}2p^2(1-p)^{29},\quad P_{\text{corregir}}=31p(1-p)^{30} \]` },
            { tag: 'c', q: R`En a), ARQ de envío continuo y rechazo simple con \(p=10^{-3}\), \(T_{as}=10^{-3}\) s y \(R=10^6\) bit/s. Calcula \(C_{ef}\) y la probabilidad de entregar un mensaje incorrecto.`, hint: R`Con \(p\) pequeña, en \(P_{RTX}\) manda el primer término, y en \(P_{ER}\) también.`,
              sol: R`<p>\(P_{RTX}\approx31p(1-p)^{30}\approx0{,}03\).</p>\[ C_{ef}=(1-P_{RTX})\frac{k}{k+m+RT_{as}P_{RTX}}R=(1-0{,}03)\frac{25}{31+10^6\cdot10^{-3}\cdot0{,}03}10^6\approx0{,}39\cdot10^6\ \text{bit/s} \]\[ P_{ER}\approx\binom{31}4p^4(1-p)^{27}=3{,}06\cdot10^{-8} \]<div data-widget="arq" data-k="25" data-n="31" data-p="1e-3" data-r="1000000" data-tas="0.001" data-dmin="4"></div>` }
          ] }
      ]
    },
    /* ---------------- JUNIO 2024 ---------------- */
    {
      id: 'jun24', title: 'Junio 2024', date: '27 de junio de 2024', minutes: 65,
      intro: 'Teoría (15 min, 40 %) y un problema (6 puntos). El primer parcial no aparece aquí.',
      warn: R`El PDF trae la solución manuscrita del problema pero no su enunciado. Lo he reconstruido desde esa solución: los apartados son fieles, pero la redacción no es la original. El valor \(p=0{,}01\) del apartado j lo he deducido de los números de la solución.`,
      problems: [
        { title: 'Teoría', statement: '', parts: [
          { tag: '1', pts: 2, q: R`¿Cuánto vale la probabilidad de error residual en detección pura, corrección pura y modo mixto? Da las fórmulas exactas allí donde sea posible.`,
            sol: R`\[ P_{ER,\text{det}}=\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i} \]\[ P_{ER,\text{corr}}=1-\sum_{i=0}^{n}\alpha_ip^i(1-p)^{n-i} \]\[ P_{ER,\text{mixto}}\le\sum_{i=s+1}^{n}\binom nip^i(1-p)^{n-i} \]<p>\(A_i\): palabras de peso \(i\). \(\alpha_i\): líderes de peso \(i\). Mixto con \(d_{min}=s+t+1,\ 0\lt t\lt s\).</p>` },
          { tag: '2', pts: 2, q: R`¿Qué expresión relaciona la distancia de Hamming de un lineal y sus bits de redundancia? Particularízala para Hamming C(7,4).`,
            sol: R`<p>Cota de Hamming: \(2^{n-k}\ge\sum_{i=0}^{t}\binom ni\), con \(t=\lfloor(d_{min}-1)/2\rfloor\). Para C(7,4), \(d_{min}=3\) y \(t=1\): \(2^3\ge1+7\), es decir, \(8=8\).</p>` }
        ] },
        { title: 'Problema · 6 puntos',
          statement: R`<p>Código cíclico C(15,5) con \(g(x)=x^{10}+x^8+x^5+x^4+x^2+x+1\) y \(d_{min}=7\). <span class="tag-src">reconstruido</span></p>`,
          parts: [
            { tag: 'a', pts: 0.6, q: R`Codifica sistemáticamente \(u(x)=x^4+x+1\).`, hint: R`\(v(x)=b(x)+x^{n-k}u(x)\), con \(n-k=10\).`,
              sol: R`<p>\(x^{10}u(x)=x^{14}+x^{11}+x^{10}\). Dividiendo entre \(g(x)\): cociente \(x^4+x^2+x\), resto \(b(x)=x^8+x^7+x^6+x\).</p><div data-widget="division" data-a="x^14+x^11+x^10" data-b="x^10+x^8+x^5+x^4+x^2+x+1"></div>\[ v(x)=x+x^6+x^7+x^8+x^{10}+x^{11}+x^{14} \]` },
            { tag: 'b', pts: 0.6, q: R`Calcula G, G<sub>s</sub> y H.`,
              sol: R`<p>\(G\) son las 5 rotaciones de \(g(x)\). \(G_s\) sale diagonalizando, y \(H=(I_{10}\,|\,P^t)\). También se puede obtener \(H\) desde \(h(x)\):</p><div data-widget="ciclico" data-n="15" data-g="x^10+x^8+x^5+x^4+x^2+x+1"></div>` },
            { tag: 'c', pts: 0.6, q: R`¿Es \(r(x)=x^{14}+x^{13}+x^{10}+x^6+x^3\) palabra código?`, hint: R`Cuenta su peso. Es más rápido que dividir.`,
              sol: R`<p>\(\omega(r)=5\lt d_{min}=7\): <b>no</b> es palabra código.</p>` },
            { tag: 'd', pts: 0.6, q: R`Calcula h(x).`, sol: R`<p>\(h(x)=(x^{15}+1)/g(x)=1+x+x^3+x^5\).</p>` },
            { tag: 'e', pts: 0.6, q: R`¿Detecta todos los errores de peso impar?`, hint: R`¿Es \(g(x)\) múltiplo de \((1+x)\)? Evalúa \(g(1)\): cuenta sus términos.`,
              sol: R`<p>\(g(x)/(1+x)\) tiene resto no nulo: \(g(x)\) tiene 7 términos, así que \(g(1)=1\). No tiene el factor \((1+x)\) y <b>no garantiza detectar los impares</b>.</p>` },
            { tag: 'f', pts: 0.6, q: R`En detección pura: probabilidad de error residual y de detectar.`,
              sol: R`<p>\(s=6,\ t=0\).</p>\[ P_{ER}=P(\omega(e)\gt6)\approx\sum_{i=7}^{15}\binom{15}ip^i(1-p)^{15-i}\approx\binom{15}7p^7(1-p)^8 \]\[ P_{\text{det}}=\sum_{i=1}^{6}\binom{15}ip^i(1-p)^{15-i}\approx\binom{15}1p(1-p)^{14} \]` },
            { tag: 'g', pts: 0.6, q: R`¿Cuántas ráfagas son indetectables de longitud 9 y de longitud 11?`,
              sol: R`<p>\(n-k=10\). \(l=9\le10\): se detectan todas, 0 indetectables. \(l=11=n-k+1\): se detectan todas menos \(g(x)\): 1 indetectable.</p>` },
            { tag: 'h', pts: 0.6, q: R`En corrección máxima: probabilidad de corregir y de error residual.`,
              sol: R`<p>\(s=3,\ t=3\).</p>\[ P_{\text{corr}}=\sum_{i=1}^{3}\binom{15}ip^i(1-p)^{15-i}\approx15\,p(1-p)^{14},\quad P_{ER}=\sum_{i=4}^{15}\binom{15}ip^i(1-p)^{15-i}\approx\binom{15}4p^4(1-p)^{11} \]` },
            { tag: 'i', pts: 0.6, q: R`¿Se detectan? \(e_1=x^5+x^6+x^8+x^9+x^{10}+x^{11}+x^{12}+x^{13}\); \(e_2=x+x^5+x^6+x^8+x^9+x^{13}\); \(e_3=x^4+x^5+x^6+x^8+x^9+x^{12}+x^{14}\).`,
              sol: R`<p>\(e_1\): ráfaga de \(l=9\): se detecta. \(e_2\): peso 6 \(\lt d_{min}\): se detecta. \(e_3=x^4g(x)\): no se detecta.</p>` },
            { tag: 'j', pts: 0.6, q: R`En modo \(s=4,\ t=2\), con \(p=0{,}01\): probabilidad de error residual y de corregir.`,
              sol: R`\[ P_{ER}=P(\omega(e)\gt4)\approx\binom{15}5p^5(1-p)^{10}=2{,}72\cdot10^{-7} \]\[ P_{\text{corr}}=\binom{15}1p(1-p)^{14}+\binom{15}2p^2(1-p)^{13}=0{,}1395 \]<p class="small">La suma completa de \(P_{ER}\) da \(2{,}76\cdot10^{-7}\).</p>`,
              errata: R`La hoja escribe \(2{,}94\cdot10^{-7}\). Con \(p=0{,}01\), que es lo que da el 0,1395 de abajo, \(3003\cdot10^{-10}\cdot0{,}99^{10}=2{,}72\cdot10^{-7}\).` }
          ] }
      ]
    },
    /* ---------------- ENERO 2024 ---------------- */
    {
      id: 'ene24', title: 'Enero 2024', date: '15 de enero de 2024', minutes: 50,
      intro: 'Dos problemas (50 min). El PDF no trae la parte de teoría, y el primer parcial no aparece aquí.',
      problems: [
        { title: 'Problema 1 · 3 puntos · 15 min',
          statement: R`<p>Los bloques de un sistema de transmisión pueden llevar hasta 15 octetos, de los cuales uno es de redundancia (CRC). Estos polinomios son primitivos: \(1+x+x^6\); \(1+x^3+x^6\); \(1+x+x^7\); \(1+x+x^3+x^5+x^7\); \(1+x^2+x^5+x^6+x^8\); \(1+x^8+x^9\). Considerando las alternativas, diseña un código para esta longitud de bloque, buscando ante todo minimizar la probabilidad de error.</p>`,
          parts: [
            { tag: 'a', q: R`Elige el código y justifícalo.`, hint: R`Saca \(n\) y \(n-k\) en bits. ¿Qué polinomios dan grado 8? ¿Se puede mejorar \(d_{min}\) con el factor \((1+x)\)?`,
              sol: R`<p>\(n=15\cdot8=120\) bits, \(n-k=8\), \(k=112\): C(120,112).</p><p>Todos los polinomios generan \(d_{min}=3\). Con grado 8 está el 5.º: \(d_{min}=3\). Es mejor \(g(x)=p(x)(1+x)\), con \(p\) de grado 7, porque da \(d_{min}=4\), con menor probabilidad de error.</p><p>Candidatos: el 3.º y el 4.º. El 3.º tiene menos términos, así que el codificador es más sencillo:</p>\[ g(x)=(1+x+x^7)(1+x)=1+x^2+x^7+x^8 \]<p>Genera C(127,119): se recortan 7 símbolos hasta \(C_R(120,112)\).</p><div data-widget="ciclico" data-n="127" data-g="(1+x+x^7)(1+x)"></div>` }
          ] },
        { title: 'Problema 2 · 7 puntos · 35 min',
          statement: R`<p>Código lineal sistemático con estas ecuaciones de paridad: \(v_0=u_1+u_2\), \(v_1=u_0+u_1+u_2\), \(v_2=u_0+u_2\).</p>`,
          parts: [
            { tag: 'a', q: R`Dimensiones, matriz generadora y matriz de paridad.`,
              sol: R`<p>3 bits de fuente y 3 de redundancia: C(6,3).</p><p class="mono">G = 011100 · 110010 · 111001</p><p class="mono">H = 100011 · 010111 · 001101</p>` },
            { tag: 'b', q: R`Distribución de pesos.`,
              sol: R`<p>\(000\to000000\); \(001\to111001\); \(010\to110010\); \(011\to001011\); \(100\to011100\); \(101\to100101\); \(110\to101110\); \(111\to010111\).</p><p>\(A_0=1,\ A_3=4,\ A_4=3\).</p>` },
            { tag: 'c', q: R`Distancia mínima.`, sol: R`<p>\(d_{min}=3\): mínimo peso de una palabra código no nula.</p>` },
            { tag: 'd', q: R`¿Es perfecto?`, hint: R`¿Cuántos líderes hay y cuántos errores de peso \(\le t\)?`,
              sol: R`<p>\(2^3=8\) líderes y \(t=1\): se corrigen 1 + 6 = 7 errores. Queda un líder adicional, de peso 2: <b>no es perfecto</b>.</p>` },
            { tag: 'e', q: R`Con BSC de parámetro p: P exacta de error residual en detección. Si el canal metió un error de peso 1, P de corregirlo en modo corrección. Si metió uno de peso 3, P de detectarlo en detección.`,
              sol: R`<p>\(P_{ER}=4p^3(1-p)^3+3p^4(1-p)^2\).</p><p>Peso 1: se corrige siempre, \(P=1\).</p><p>Peso 3: hay \(\binom63=20\) patrones y 4 son palabras código. No se detecta con \(4/20=0{,}2\); se detecta con \(0{,}8\).</p>` },
            { tag: 'f', q: R`Se envía \(\vec u=(100)\) y el canal mete \(\vec e=(000011)\). Verifica que se detecta y deduce qué entrega el decodificador en corrección.`, hint: R`\(\vec s=\vec eH^t\). Busca en la tabla el error de peso 1 con ese síndrome.`,
              sol: R`<p>\(\vec s=\vec eH^t=(001)\ne\vec 0\): se detecta.</p><p>\((001)\) corresponde al líder \(\hat{\vec e}=(001000)\).</p><p>\(\vec v=(011100)\), \(\vec r=(011111)\), \(\hat{\vec v}=\vec r+\hat{\vec e}=(010111)\). Entrega \((111)\): <b>error de corrección</b>.</p><div data-widget="lineal" data-mode="eq" data-text="v0=u1+u2; v1=u0+u1+u2; v2=u0+u2" data-r="011111"></div>` },
            { tag: 'g', q: R`En detección, ARQ de envío continuo y rechazo simple: P de transmitir una vez, exactamente dos, tres o más, y de entregar una palabra errónea.`,
              sol: R`\[ P_{RTX}=1-(1-p)^6-4p^3(1-p)^3-3p^4(1-p)^2 \]<p>Una vez: \(1-P_{RTX}=(1-p)^6+4p^3(1-p)^3+3p^4(1-p)^2\).</p><p>Exactamente dos: \(P_{RTX}(1-P_{RTX})\).</p><p>Tres o más: \(\sum_{i\ge3}P_{RTX}^{\,i-1}(1-P_{RTX})=P_{RTX}^2\).</p><p>Palabra errónea: \(P_{ER}=4p^3(1-p)^3+3p^4(1-p)^2\).</p><p class="small">En la hoja, el primer término parece \((1-p)^4\). Con \(n=6\) debe ser \((1-p)^6\).</p>` }
          ] }
      ]
    },
    /* ---------------- JUNIO 2023 ---------------- */
    {
      id: 'jun23', title: 'Junio 2023', date: '26 de junio de 2023', minutes: 70,
      intro: 'Teoría (20 min, 40 %) y dos problemas. El primer parcial no aparece aquí.',
      warn: R`El PDF solo trae las soluciones de los problemas y de la pregunta 5, sin enunciado. Los he reconstruido desde esas soluciones: los datos y los resultados son los originales, pero la redacción no.`,
      problems: [
        { title: 'Teoría', statement: '', parts: [
          { tag: '1', pts: 0.5, q: R`¿Cualquier subespacio de dimensión k de \(V_n\) sobre GF(2) puede formar un código lineal C(n,k)?`,
            sol: R`<p>Todo subespacio cumple que el vector cero pertenece a él y que las combinaciones de vectores también. Pero debe cumplirse \(0\lt k\lt n\): quedan excluidos el subespacio trivial y el propio \(V_n\).</p>` },
          { tag: '2', pts: 0.5, q: R`Al recibir una palabra errónea \(\vec r\), ¿con qué criterio decidimos la palabra a la que corregimos?`,
            sol: R`<p>\(\hat{\vec v}=\vec r+\vec e_i\), con \(\vec e_i\) el líder de cogrupo con el mismo síndrome que \(\vec r\). Corresponde a la palabra más cercana a la recibida.</p>` },
          { tag: '3', pts: 0.5, q: R`¿Por qué en un cíclico C(n,k) solo hay una ráfaga de longitud n−k+1 indetectable?`, sol: R`<p>Porque es la que corresponde al polinomio generador, que es único.</p>` },
          { tag: '4', pts: 0.5, q: R`Si \(x^n+1\) se factoriza en L factores, ¿cuántos códigos cíclicos hay de longitud n?`,
            sol: R`<p>Hay \(2^L\) combinaciones. Como \(0\lt k\lt n\), se descartan \(g(x)=1\) y \(g(x)=x^n+1\): quedan \(2^L-2\).</p>` },
          { tag: '5', q: R`Elige la técnica de control de errores en cada escenario: 1) difusión de vídeo por cable, sin canal de retorno. 2) Bloques de \(n=10^4\) bits, \(R\,T_{as}=5\cdot10^6\) bits, \(p=10^{-9}\). 3) \(R\,T_{as}=288\) bits y \(p=10^{-3}\). 4) Vídeo en tiempo real. <span class="tag-src">reconstruido</span>`,
            sol: R`<p>1) Solo se puede usar <b>FEC</b>: no hay canal de retorno y la latencia no para el vídeo.</p><p>2) \(P_{RTX}\approx np=10^{-5}\). Parada y espera: \(\rho=(1-P_{RTX})\tfrac{k}{10^4+5\cdot10^6}\), no vale. Rechazo simple: \(\tfrac{k}{10^4+50}\). Rechazo selectivo: \(\tfrac{k}{10^4}\). FEC no, por su mala \(P_{\text{error}}\). Simple rinde casi igual que selectivo y es mucho más sencillo: <b>rechazo simple</b>.</p><p>3) \(P_{RTX}\approx n\cdot10^{-3}\). Por lo mismo, <b>rechazo simple</b>. Incluso <b>parada y espera</b>, si \(n\) es mayor que 288 bits.</p><p>4) <b>FEC</b>, igual que en 1: así no afecta la latencia.</p>` }
        ] },
        { title: 'Problema 1',
          statement: R`<p>Código cíclico con \(g(x)=x^4+x^2+x+1\) y longitud 7. <span class="tag-src">reconstruido</span></p>`,
          parts: [
            { tag: 'a', pts: 0.5, q: R`Factoriza g(x).`, hint: R`Tiene un número par de términos: \(g(1)=0\), luego \((1+x)\) es factor.`, sol: R`<p>\(g(x)=(1+x)(1+x^2+x^3)\).</p>` },
            { tag: 'b', pts: 0.7, q: R`Dimensiones.`, sol: R`<p>\(n-k=4\), \(n=7\): C(7,3).</p>` },
            { tag: 'c', pts: 0.7, q: R`\(d_{min}\).`, sol: R`<p>\(d_{min}=4\): el factor \((1+x)\) detecta los impares y \(1+x^2+x^3\), primitivo, los dobles. Es un Hamming extendido.</p>` },
            { tag: 'd', pts: 0.7, q: R`G y G<sub>s</sub>.`, sol: R`<p class="mono">G = 1110100 · 0111010 · 0011101</p><p class="mono">Gs = 1110100 · 0111010 · 1101001</p>` },
            { tag: 'e', pts: 0.7, q: R`Palabras código y distribución de pesos.`,
              sol: R`<p>0000000, 1110100, 0111010, 0011101, 1101001, 1001110, 1010011, 0100111.</p><p>\(A_0=1,\ A_4=7\), el resto 0.</p>` },
            { tag: 'f', pts: 0.7, q: R`Error residual en detección pura y en modo híbrido.`, hint: R`Con \(d_{min}=4\), el híbrido es \(s=2,\ t=1\).`,
              sol: R`<p>Detección pura: \(P_E=7p^4(1-p)^3\).</p><p>Híbrido: \(P_E=P(\omega(e)\gt2)\approx\sum_{i=3}^{7}\binom7ip^i(1-p)^{7-i}\approx35p^3(1-p)^4\).</p>` }
          ] },
        { title: 'Problema 2',
          statement: R`<p>Mensajes de \(k=48\) bits, BSC con \(p=10^{-3}\), \(R=19.200\) bit/s y \(T_{as}=5\) ms. <span class="tag-src">reconstruido</span></p>`,
          parts: [
            { tag: 'a', q: R`Sin código: probabilidad de error y rendimiento.`,
              sol: R`\[ P_{\text{error}}=1-(1-p)^{48}\approx48p=4{,}8\cdot10^{-2},\qquad C_{ef}=R,\quad\rho=100\,\% \]` },
            { tag: 'b', q: R`FEC con C(23,12), \(d_{min}=7\): probabilidad de error del mensaje y rendimiento.`, hint: R`Cada mensaje son 4 bloques. ¿Qué tiene de especial este código con \(t=3\)?`,
              sol: R`<p>\(t=3\), 4 paquetes por mensaje. Líderes: \(\alpha_0=1,\ \alpha_1=23,\ \alpha_2=253,\ \alpha_3=1771\). Suman \(2048=2^{11}\): es perfecto, \(\alpha_4=0\).</p>\[ P_{NC}=1-\sum_{i=0}^{3}\alpha_ip^i(1-p)^{23-i}=8{,}72\cdot10^{-9} \]\[ P_{\text{error}}=1-(1-P_{NC})^4=3{,}5\cdot10^{-8},\qquad\rho=\tfrac{12}{23}=52{,}17\,\% \]` },
            { tag: 'c', q: R`Parada y espera híbrida con \(t'=2\).`,
              sol: R`<p>\(d_{min}=s+t'+1\Rightarrow s=4\).</p>\[ P_{\text{resid}}\approx\binom{23}5p^5(1-p)^{18}=3{,}3\cdot10^{-11},\quad P_{\text{error}}=1-(1-P_{\text{resid}})^4=1{,}32\cdot10^{-10} \]\[ P_{RTX}=1-\sum_{i=0}^{2}\alpha_ip^i(1-p)^{23-i}=1{,}745\cdot10^{-6} \]\[ \rho=(1-P_{RTX})\frac{12}{23+5\cdot10^{-3}\cdot19200}=10{,}084\,\%\quad(1936\text{ bit/s}) \]` }
          ] }
      ]
    },
    /* ---------------- ENERO 2023 ---------------- */
    {
      id: 'ene23', title: 'Enero 2023', date: '13 de enero de 2023', minutes: 70,
      intro: 'Teoría (20 min, 40 %) y dos problemas. La primera parte de este PDF no aparece aquí, salvo la pregunta del canal simétrico, que está en su hoja pero es del tema 4: la tienes en el test de teoría.',
      warn: R`El PDF solo trae la solución de los problemas 3 y 4, sin enunciado. Los he reconstruido desde esas soluciones: los datos y los resultados son los originales, pero la redacción de los apartados no.`,
      problems: [
        { title: 'Teoría', statement: '', parts: [
          { tag: '1', pts: 1, q: R`Define código lineal y código cíclico.`, sol: R`<p>Lineal: \(2^k\) palabras de longitud \(n\) que forman un subespacio de \(V_n\) (la suma de dos palabras es palabra). Cíclico: lineal en el que las rotaciones de cada palabra también son palabras.</p>` },
          { tag: '2', pts: 1, q: R`Demuestra que el síndrome no depende de la palabra enviada.`, sol: R`<p>\(\vec r=\vec v+\vec e\). \(\vec s=\vec rH^t=\vec vH^t+\vec eH^t=\vec eH^t\), porque \(\vec vH^t=\vec 0\).</p>` },
          { tag: '3', pts: 1, q: R`¿Qué es la probabilidad de error residual de un C(n,k) en detección? Da la expresión sobre un BSC.`, sol: R`<p>Es la probabilidad de que el error coincida con una palabra código: \(P_{ND}=\sum_{i=d_{min}}^{n}A_ip^i(1-p)^{n-i}\).</p>` },
          { tag: '4', pts: 1, q: R`Describe cómo se construye la tabla estándar.`, sol: R`<p>\(2^k\) columnas y \(2^{n-k}\) filas. 1) Primera fila: las palabras código, con \(\vec 0\) primero. 2) Elige una n-tupla no incluida, lo más ligera posible: el líder. 3) Rellena la fila con líder + palabra de cada columna. 4) Repite.</p>` },
          { tag: '5', pts: 1, q: R`Capacidades detectoras y correctoras de C(n,k) con distancia d sobre un canal de borrado.`, sol: R`<p>Todos los bits erróneos se detectan: \(s=n\). Para confundirse hay que borrar los bits que diferencian dos palabras, un patrón del código: \(t=d_{min}-1\).</p>` },
          { tag: '6', pts: 1, q: R`Indica todas las propiedades del polinomio generador.`, sol: R`<p>Es el polinomio de menor grado; toda palabra es múltiplo suyo; es factor de \(1+x^n\); tiene grado \(n-k\); es único.</p>` },
          { tag: '7', pts: 1, q: R`Calcula el número de ráfagas indetectables de longitud 8 en C(15,10).`, hint: R`Compara \(l\) con \(n-k+1\).`,
            sol: R`<p>\(n-k=5\), \(l=8\gt6\). Indetectables: \(2^{l-(n-k)-2}=2^1=2\), de \(2^{l-2}=64\). Fracción: \(1/2^5=1/32\).</p>`,
            errata: R`La oficial escribe \(\frac1{2^{n-k}}=\frac12\) y "la mitad de las ráfagas". Con \(n-k=5\), es \(\frac1{32}\). Además, esa es la fracción indetectable, no la detectable.` },
          { tag: '8', pts: 1, q: R`¿Qué relación tiene la cadencia eficaz de ARQ con el 2.º teorema de Shannon?`,
            sol: R`<p>El teorema: si \(R\lt C\), se puede hacer \(P_{err}\to0\). En ARQ y FEC, la cadencia eficaz es menor que \(C=1-H(p)\approx1\) por uso del canal: \(\eta=C_{ef}/R\lt1\). Se puede transmitir con probabilidad residual tan pequeña como se desee. Atención al cambio de notación.</p>` }
        ] },
        { title: 'Problema 3',
          statement: R`<p>Se sabe que \(p(x)=1+x^2+x^5\) es primitivo. <span class="tag-src">reconstruido</span></p>`,
          parts: [
            { tag: 'a', pts: 1.5, q: R`Diseña un cíclico de longitud 31 que detecte también los errores impares, y da su \(d_{min}\).`,
              sol: R`<p>\(p(x)\) primitivo es factor de \(x^{31}+1\). \(g(x)=(x+1)p(x)=1+x+x^2+x^3+x^5+x^6\). Genera C(31,25), con \(d_{min}=4\).</p>` },
            { tag: 'b', pts: 2.5, q: R`¿Se detectan? \(e_1=1+x^4+x^{12}\); \(e_2=1+x^2+x^4+x^6+x^8\); \(e_3=x+x^{10}\); \(e_4=x^7+x^8+x^9+x^{10}+x^{11}+x^{12}\); \(e_5=x^2+x^3+x^4+x^5+x^7+x^8\).`,
              sol: R`<p>\(e_1\): peso 3 \(\lt d_{min}\). Se detecta siempre.</p><p>\(e_2\): peso impar, con factor \((1+x)\). Se detecta.</p><p>\(e_3\): peso 2 \(\lt d_{min}\). Se detecta.</p><p>\(e_4\): ráfaga de \(l=6\le n-k\). Se detecta.</p><p>\(e_5=x^2g(x)\in C\). <b>No se detecta nunca.</b></p>` },
            { tag: 'c', pts: 2, q: R`Envío continuo con rechazo selectivo. La 1.ª transmisión usa detección pura y la retransmisión, corrección pura. Calcula \(C_{ef}\).`, hint: R`Haz la tabla \(N_T,\ T_{oc},\ p(N_T)\): solo hay dos filas.`,
              sol: R`<p>\(d_{min}=4\): 1.ª, \((s=3,t=0)\), luego \(P_{RTX}=\sum_{i=1}^{3}\binom{31}ip^i(1-p)^{31-i}\). 2.ª, \((s=2,t=1)\): si detecta un error, lo da erróneo a la aplicación.</p><div class="tbl-wrap"><table><tr><th>\(N_T\)</th><th>\(p(N_T)\)</th><th>\(T_{oc}\)</th></tr><tr><td>1</td><td>\(1-P_{RTX}\)</td><td>\(X_p\)</td></tr><tr><td>2</td><td>\(P_{RTX}\)</td><td>\(2X_p\)</td></tr></table></div>\[ \bar T_{oc}=X_p(1-P_{RTX})+2X_pP_{RTX}=X_p(1+P_{RTX}),\qquad C_{ef}=\frac{k}{(k+m)(1+P_{RTX})}R \]` }
          ] },
        { title: 'Problema 4',
          statement: R`<p>Una trama tiene cabecera de 15 bits protegida con \(C_{cab}(15,k)\), corrector puro con \(d_{min}=5\), y un CRC de 16 bits sobre toda la trama, \(C_{trama}(n,n-16)\), detector puro con \(d_{min}=4\). El receptor corrige primero la cabecera y luego comprueba la trama con el CRC. <span class="tag-src">reconstruido</span></p>`,
          parts: [
            { tag: 'a', q: R`Calcula la redundancia mínima de la cabecera.`, hint: R`Cota de Hamming con \(t=2\).`,
              sol: R`\[ \binom{15}0+\binom{15}1+\binom{15}2\le2^{n-k}\Rightarrow1+15+105=121\le2^{n-k} \]<p>\(n-k\ge7\), porque \(2^7=128\ge121\).</p>` },
            { tag: 'b1', q: R`Verdadero o falso: dos errores en la cabecera provocan retransmisión.`, sol: R`<p><b>Falso.</b> Con \(t=2\), \(C_{cab}\) los corrige bien y el CRC no detecta error.</p>` },
            { tag: 'b2', q: R`Verdadero o falso: tres errores en la cabecera provocan retransmisión.`,
              sol: R`<p><b>Normalmente cierto.</b> Aunque \(C_{cab}\) corrija mal, el CRC normalmente detecta error y pide RTX. Podría ser falso si, al corregir, se llega a una palabra a 5 bits de la enviada y excede la \(d_{min}=4\) del CRC.</p>` },
            { tag: 'b3', q: R`Verdadero o falso: se detecta una ráfaga de 17 bits cuyo primer bit cae en el último bit de la cabecera.`,
              sol: R`<p><b>Cierto.</b> El primer bit erróneo está en la cabecera y \(C_{cab}\) lo corrige bien. Queda una ráfaga de 16 bits o menos, y el CRC detecta todas las ráfagas de hasta 16 bits.</p>` },
            { tag: 'b4', q: R`Verdadero o falso: se detectan todos los errores de hasta peso 3 en el resto de la trama.`,
              sol: R`<p><b>Cierto.</b> \(C_{trama}\) tiene \(d_{min}=4\) y detecta los de peso \(\le3\).</p>` }
          ] }
      ]
    }
  ];

  /* ------------------------------------------------------------------ */
  const fell = [
    ['jun26', 'Jun 2026', 'Lineal C(7,3) desde ecuaciones: G, H, d<sub>min</sub>, tabla de corrección, P de error', 'Cíclico C(63,51): grados, perfecto, circuito, errores, modos, fórmulas de FEC, ARQ e híbrido', 'Pesos impares, definición de código de canal'],
    ['ene26', 'Ene 2026', 'Capacidad de tres canales (uno débilmente simétrico)', 'Cíclico C(15,4): G<sub>s</sub>, perfecto, modos, errores, circuito, P<sub>RTX</sub>, A<sub>i</sub>, P<sub>ER</sub>', 'Canal simétrico con demostración, borrado, g(x), demostración de ráfagas'],
    ['ene25', 'Ene 2025', 'Capacidad: cascada de BSC, simétrico', 'Diseño desde factorizaciones; C(31,25) con probabilidades y rechazo simple numérico', 'No está en el PDF'],
    ['jun24', 'Jun 2024', '—', 'Cíclico C(15,5): sistemática, G, H, h(x), impares, ráfagas, errores, modos', 'Tres errores residuales, cota de Hamming'],
    ['ene24', 'Ene 2024', 'Diseño de CRC con primitivos y recorte', 'Lineal C(6,3) completo: pesos, perfecto, corrección errónea, ARQ', 'No está en el PDF'],
    ['jun23', 'Jun 2023', 'Cíclico C(7,3): factores, G<sub>s</sub>, A<sub>i</sub>, P<sub>E</sub>', 'FEC frente a híbrido con Golay C(23,12), numérico', 'Subespacios, criterio de corrección, ráfaga única, 2ᴸ−2, escenarios'],
    ['ene23', 'Ene 2023', 'C(31,25): errores y ARQ con corrección en la 2.ª transmisión', 'Cabecera y CRC: cota de Hamming, verdadero o falso', 'Ocho preguntas de todos los temas']
  ];

  const plan = [
    ['Bloque 1', 'Tema 4 · Capacidad', [['l1', 'Lección 1: capacidad', '#aprende-capacidad'], ['l2', 'Lección 2: 2.º teorema', '#aprende-shannon2'], ['p1', 'Practica canales desde Q y borrado', '#practica-simetrico'], ['e1', 'Problema 1 de enero de 2026', '#examenes-ene26']]],
    ['Bloque 2', 'Tema 5 · Lineales', [['l3', 'Lección 3: G y forma sistemática', '#aprende-lineales'], ['l4', 'Lección 4: H, síndrome y detección', '#aprende-matriz'], ['l5', 'Lección 5: corrección y Hamming', '#aprende-correccion'], ['p2', 'Practica síndrome y probabilidades', '#practica-sindrome'], ['e2', 'Problema 2 de enero de 2024', '#examenes-ene24']]],
    ['Bloque 3', 'Tema 6 · Cíclicos', [['l6', 'Lección 6: g(x), h(x) y matrices', '#aprende-ciclicos'], ['l7', 'Lección 7: circuitos', '#aprende-circuitos'], ['l8', 'Lección 8: detección, ráfagas y diseño', '#aprende-deteccion'], ['p3', 'Practica "¿se detecta este error?"', '#practica-errores'], ['e3', 'Examen de junio de 2024', '#examenes-jun24']]],
    ['Bloque 4', 'Tema 7 · FEC y ARQ', [['l9', 'Lección 9: FEC y parada y espera', '#aprende-arq'], ['l10', 'Lección 10: envío continuo y ventanas', '#aprende-envio'], ['l11', 'Lección 11: técnicas híbridas', '#aprende-hibridas'], ['p4', 'Practica prestaciones de ARQ', '#practica-arqnum'], ['e4', 'Problema 2 de junio de 2023', '#examenes-jun23']]],
    ['Simulacros', 'Con cronómetro', [['x1', 'Enero de 2026 completo', '#examenes-ene26'], ['x2', 'Junio de 2026 completo', '#examenes-jun26'], ['x3', 'Enero de 2025', '#examenes-ene25'], ['x4', 'Enero de 2023', '#examenes-ene23'], ['t1', 'Test de teoría completo, dos veces', '#teoria'], ['ch', 'Chuleta, justo antes del examen', '#chuleta']]]
  ];

  const erratas = [
    ['jun26', 'Jun 2026 · Teoría 2', 'Define "código de canal" como correspondencia de longitud variable', 'Eso es un código de fuente. Uno de canal asigna k bits a n bits con redundancia.'],
    ['jun26', 'Jun 2026 · P1a', 'G y H con la información a la izquierda', 'El enunciado la pone al final: G = 1101100, 1011010, 0111001. Es un código equivalente.'],
    ['jun26', 'Jun 2026 · P2d', 'e₃(x) = x²·g(x)', 'e₃(x) = x³·g(x).'],
    ['ene25', 'Ene 2025 · P1b', 'H(0,7; 0,2; 0,1) = 1,5678 y C = 0,4322', 'H = 1,1568 y C = 0,8432 bits.'],
    ['ene25', 'Ene 2025 · P2', 'Factor x⁵+x⁴+x²+1 en la tabla de x³¹+1', 'Ese polinomio ni siquiera divide a x³¹+1. El factor real es x⁵+x⁴+x³+x²+1.'],
    ['jun24', 'Jun 2024 · j', 'P_ER = 2,94·10⁻⁷', 'Con p = 0,01 sale 2,72·10⁻⁷ con el primer término, y 2,76·10⁻⁷ con la suma.'],
    ['ene23', 'Ene 2023 · Teoría 7', 'Fracción 1/2^(n−k) = 1/2', 'Es 1/32. Hay 2 ráfagas indetectables de 64.']
  ];

  /* ------------------------------------------------------------------ */
  const cheat = R`
<div class="fbox"><span class="lbl">Capacidad</span>\[ C=\max_{p(x)}I(X;Y)=\max(H(Y)-H(Y/X)),\quad V=C\cdot v \]\[ \text{Sim. y déb. sim.: } C=\log_2|\mathcal Y|-H(\text{fila}),\ p(x)\text{ unif.} \]\[ \text{BSC: }1-H(p)\quad\text{Borrado: }1-\alpha \]\[ \text{2 BSC: }p'=2p(1-p)\quad C_{cont}=B\log_2(1+\tfrac SN) \]</div>
<div class="fbox"><span class="lbl">Clasificar Q</span><p class="small">Simétrico: filas y columnas permutaciones. Débilmente: filas permutaciones, columnas suman igual. Si no: escribe I(X;Y) y maximiza.</p></div>
<div class="fbox"><span class="lbl">2.º teorema</span><p class="small">R &lt; C: existen códigos (2ⁿᴿ, n) con Pₑ → 0 al crecer n, con k/n constante. R &gt; C: imposible. No dice cómo construirlos.</p></div>
<div class="fbox"><span class="lbl">Lineal</span>\[ \vec v=\vec uG,\ \ G_s=(P|I_k),\ \ H=(I_{n-k}|P^t),\ \ \vec vH^t=\vec 0 \]\[ \vec r=\vec v+\vec e,\ \ \vec s=\vec rH^t=\vec eH^t,\ \ \hat{\vec v}=\vec r+\hat{\vec e} \]</div>
<div class="fbox"><span class="lbl">Distancia y modos</span>\[ d_{min}=\min\omega(\vec v)=\min\text{ col. de }H\text{ que suman }0 \]\[ s_{max}=d_{min}-1,\ \ t_{max}=\lfloor\tfrac{d_{min}-1}2\rfloor,\ \ d_{min}=s+t+1 \]\[ \text{Perfecto: }2^{n-k}=\sum_{i=0}^{t_{max}}\binom ni \]\[ \text{Hamming: }n=2^m-1,\ k=n-m,\ d_{min}=3 \]</div>
<div class="fbox"><span class="lbl">Probabilidades del código</span>\[ P_{ND}=\sum_{i=d_{min}}^nA_ip^iq^{n-i}\le\sum_{i=d_{min}}^n\binom nip^iq^{n-i} \]\[ P_{\text{err corr}}=1-\sum_{i=0}^n\alpha_ip^iq^{n-i}\approx\sum_{i=t+1}^n\binom nip^iq^{n-i} \]\[ P_{ER\text{ mixto}}\le\sum_{i=s+1}^n\binom nip^iq^{n-i},\quad q=1-p \]</div>
<div class="fbox"><span class="lbl">Cíclico</span>\[ x^n+1=g(x)h(x),\ \text{grado }g=n-k,\ \text{grado }h=k \]\[ 2^L-2\text{ códigos};\ v(x)=a(x)g(x);\ \text{de grado }d:\ 2^{d-(n-k)} \]\[ b(x)=\text{resto}\tfrac{x^{n-k}u(x)}{g(x)},\ \ v(x)=b(x)+x^{n-k}u(x) \]\[ s(x)=\text{resto}\tfrac{r(x)}{g(x)},\quad v^{(i)}(x)=\text{resto}\tfrac{x^iv(x)}{x^n+1} \]\[ \text{Circuitos: }g\to n-k\text{ etapas},\ h\to k\text{ etapas} \]</div>
<div class="fbox"><span class="lbl">Detección en cíclicos</span><p class="small">Simples: siempre. Impares: si (1+x) | g(x). Dobles: factor primitivo de grado r y n ≤ 2ʳ−1.</p><div class="tbl-wrap"><table><tr><th>l</th><th>Indet.</th><th>Fracción</th></tr><tr><td>≤ n−k</td><td>0</td><td>0</td></tr><tr><td>n−k+1</td><td>1</td><td>1/2ⁿ⁻ᵏ⁻¹</td></tr><tr><td>&gt; n−k+1</td><td>2^(l−(n−k)−2)</td><td>1/2ⁿ⁻ᵏ</td></tr></table></div><p class="small">Total de ráfagas de longitud l: 2ˡ⁻². Mejor d_min: (1+x)·p(x) da d_min = 4. Recortado: C(n−l, k−l), lineal, no cíclico.</p></div>
<div class="fbox"><span class="lbl">Prestaciones</span>\[ C_{ef}=\frac k{\bar T_{oc}},\ \ \rho=\frac{C_{ef}}R,\ \ X_p=\frac nR,\ \ m=n-k \]\[ \rho_{FEC}=\frac kn \]\[ \rho_{PE}=(1-P_{RTX})\frac k{k+m+T_{as}R} \]\[ \rho_{RS}=(1-P_{RTX})\frac k{k+m+T_{as}RP_{RTX}} \]\[ \rho_{Rsel}=(1-P_{RTX})\frac k{k+m} \]\[ k_{opt}\approx\sqrt{(m+RT_{as})/p} \]</div>
<div class="fbox"><span class="lbl">ARQ: probabilidades</span>\[ P_{RTX}=1-q^n-\sum_{i=d_{min}}^nA_ip^iq^{n-i}\approx\sum_{i=t+1}^{s}\binom nip^iq^{n-i} \]\[ \text{Detecta todo: }P_{RTX}\approx1-q^n\approx np \]\[ \text{N.º veces: }P(N)=P_{RTX}^{N-1}(1-P_{RTX}),\ \ \bar N=\tfrac1{1-P_{RTX}} \]</div>
<div class="fbox"><span class="lbl">Ventanas</span><p class="small">MAXSEQ = 2ᵇ−1. Parada y espera: 1 bit. Rechazo simple: W_T ≤ MAXSEQ. Rechazo selectivo: W_T + W_R ≤ MAXSEQ + 1. W_T debe cubrir las tramas que caben en un T_as.</p></div>
<div class="fbox"><span class="lbl">Valores para hacer a mano</span><p class="small">C(7,1)=7; C(7,2)=21; C(7,3)=35. C(15,1)=15; C(15,2)=105; C(15,3)=455; C(15,4)=1365; C(15,5)=3003. C(23,2)=253; C(23,3)=1771. C(31,2)=465; C(31,3)=4495; C(31,4)=31465. C(63,2)=1953.</p></div>`;

  return { temas, lessons, cards, exams, fell, plan, erratas, cheat };
})();
