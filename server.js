/* Servidor local de Cuaderno de Canal: sirve la web y guarda usuarios y contadores de ejercicios.
   Solo escucha en este PC. Uso: node server.js [--abrir]   Opcional: PORT, TINF_DATA (ruta del archivo de datos). */
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { promisify } = require('util');

const scrypt = promisify(crypto.scrypt);
const PORT = Number(process.env.PORT || 8000);
const DATA_FILE = path.resolve(process.env.TINF_DATA || path.join(__dirname, 'data', 'usuarios.json'));
const SESSION_DAYS = 30;
const COOKIE = 'sesion';
const MAX_BODY = 16 * 1024;
const URL_LOCAL = `http://localhost:${PORT}/`;

/* Lista cerrada: server.js y los datos de usuarios nunca se sirven. */
const STATIC = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/content.js': ['content.js', 'text/javascript; charset=utf-8'],
  '/logic.js': ['logic.js', 'text/javascript; charset=utf-8']
};

/* ---------- Datos ---------- */
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { users: {}, sessions: {} };
  // Si el archivo está dañado, se para aquí: seguir acabaría sobrescribiendo el progreso.
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}
const db = loadData();
function save() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  const tmp = DATA_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DATA_FILE);
}
const getUser = name => (Object.hasOwn(db.users, name) ? db.users[name] : null);

/* ---------- Contraseñas y sesiones ---------- */
const hashPassword = async (password, salt) => (await scrypt(password, salt, 64)).toString('hex');
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
function startSession(res, name) {
  const now = Date.now();
  for (const [k, s] of Object.entries(db.sessions)) if (s.expires <= now) delete db.sessions[k];
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[hashToken(token)] = { user: name, expires: now + SESSION_DAYS * 864e5 };
  res.setHeader('Set-Cookie', `${COOKIE}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_DAYS * 86400}`);
}
function sessionToken(req) {
  for (const part of (req.headers.cookie || '').split(';')) {
    const [k, v] = part.trim().split('=');
    if (k === COOKIE && v) return v;
  }
  return null;
}
function currentUser(req) {
  const token = sessionToken(req);
  if (!token) return null;
  const key = hashToken(token);
  if (!Object.hasOwn(db.sessions, key)) return null;
  const s = db.sessions[key];
  if (s.expires <= Date.now()) return null;
  return getUser(s.user) ? s.user : null;
}

/* ---------- Validación ---------- */
class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function credentials(body) {
  const name = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  return { name, password };
}
const validKind = k => typeof k === 'string' && /^[a-z0-9]{1,40}$/.test(k);
const validCount = n => Number.isSafeInteger(n) && n >= 0;
function validStats(stats) {
  if (!stats || typeof stats !== 'object' || Array.isArray(stats)) return false;
  const entries = Object.entries(stats);
  return entries.length <= 100 && entries.every(([k, v]) => validKind(k) && v && validCount(v.ok) && validCount(v.tot) && v.ok <= v.tot);
}

/* ---------- API ---------- */
function requireUser(req) {
  const name = currentUser(req);
  if (!name) throw new HttpError(401, 'Tu sesión ha caducado.');
  return name;
}
const API = {
  async 'POST /api/register'(req, res, body) {
    const { name, password } = credentials(body);
    if (!/^[a-z0-9][a-z0-9_.-]{2,29}$/.test(name)) throw new HttpError(400, 'El usuario debe tener de 3 a 30 caracteres: letras sin acentos, números, punto, guion o guion bajo.');
    if (password.length < 6 || password.length > 200) throw new HttpError(400, 'La contraseña debe tener al menos 6 caracteres.');
    if (getUser(name)) throw new HttpError(409, 'Ese usuario ya existe.');
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = await hashPassword(password, salt);
    if (getUser(name)) throw new HttpError(409, 'Ese usuario ya existe.');
    db.users[name] = { salt, hash, stats: {} };
    startSession(res, name);
    save();
    return { user: name, stats: {} };
  },
  async 'POST /api/login'(req, res, body) {
    const { name, password } = credentials(body);
    const u = getUser(name);
    const bad = new HttpError(401, 'Usuario o contraseña incorrectos.');
    if (!u || password.length > 200) throw bad;
    const hash = await hashPassword(password, u.salt);
    if (!crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(u.hash, 'hex'))) throw bad;
    startSession(res, name);
    save();
    return { user: name, stats: u.stats };
  },
  async 'POST /api/logout'(req, res) {
    const token = sessionToken(req);
    if (token) {
      const key = hashToken(token);
      if (Object.hasOwn(db.sessions, key)) { delete db.sessions[key]; save(); }
    }
    res.setHeader('Set-Cookie', `${COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0`);
    return {};
  },
  async 'GET /api/me'(req) {
    const name = currentUser(req);
    return name ? { user: name, stats: getUser(name).stats } : { user: null, stats: {} };
  },
  async 'POST /api/stats/record'(req, res, body) {
    const u = getUser(requireUser(req));
    if (!validKind(body.kind) || typeof body.allOk !== 'boolean') throw new HttpError(400, 'Datos no válidos.');
    const k = Object.hasOwn(u.stats, body.kind) ? u.stats[body.kind] : { ok: 0, tot: 0 };
    k.tot++;
    if (body.allOk) k.ok++;
    u.stats[body.kind] = k;
    save();
    return { stats: u.stats };
  },
  /* Trae los contadores antiguos del navegador, solo a una cuenta que aún no tenga ninguno. */
  async 'POST /api/stats/import'(req, res, body) {
    const u = getUser(requireUser(req));
    if (!validStats(body.stats)) throw new HttpError(400, 'Datos no válidos.');
    if (Object.keys(u.stats).length) return { stats: u.stats, imported: false };
    u.stats = Object.fromEntries(Object.entries(body.stats).map(([k, v]) => [k, { ok: v.ok, tot: v.tot }]));
    save();
    return { stats: u.stats, imported: true };
  }
};

/* ---------- HTTP ---------- */
function readJson(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > MAX_BODY) { reject(new HttpError(413, 'Petición demasiado grande.')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('error', reject);
    req.on('end', () => {
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('no es un objeto');
        resolve(body);
      } catch (e) { reject(new HttpError(400, 'Datos no válidos.')); }
    });
  });
}
/* Bloquea peticiones de otras webs abiertas en el navegador. */
function checkOrigin(req) {
  const allowed = [`localhost:${PORT}`, `127.0.0.1:${PORT}`];
  if (!allowed.includes(req.headers.host)) throw new HttpError(403, 'Host no permitido.');
  if (req.method === 'GET') return;
  const origin = req.headers.origin;
  if (origin && origin !== `http://${req.headers.host}`) throw new HttpError(403, 'Origen no permitido.');
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw new HttpError(415, 'Se esperaba JSON.');
}
function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  const pathname = req.url.split('?')[0];
  try {
    checkOrigin(req);
    const handler = API[`${req.method} ${pathname}`];
    if (handler) {
      const body = req.method === 'POST' ? await readJson(req) : {};
      sendJson(res, 200, await handler(req, res, body));
      return;
    }
    if (pathname.startsWith('/api/')) throw new HttpError(404, 'No encontrado.');
    const file = (req.method === 'GET' || req.method === 'HEAD') && Object.hasOwn(STATIC, pathname) ? STATIC[pathname] : null;
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('No encontrado'); return; }
    const data = fs.readFileSync(path.join(__dirname, file[0]));
    res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (e) {
    if (!(e instanceof HttpError)) console.error(e);
    if (res.headersSent) { res.destroy(); return; }
    sendJson(res, e instanceof HttpError ? e.status : 500, { error: e instanceof HttpError ? e.message : 'Error del servidor.' });
  }
});

const openBrowser = () => {
  if (process.argv.includes('--abrir')) spawn('cmd', ['/c', 'start', '', URL_LOCAL], { stdio: 'ignore', detached: true }).unref();
};
server.on('error', e => {
  if (e.code !== 'EADDRINUSE') throw e;
  console.log(`El puerto ${PORT} ya está en uso: la web probablemente ya está abierta en ${URL_LOCAL}`);
  openBrowser();
  process.exitCode = 1;
});
server.listen(PORT, '127.0.0.1', () => {
  console.log(`Cuaderno de Canal en ${URL_LOCAL}  (cierra esta ventana para pararlo)`);
  openBrowser();
});
