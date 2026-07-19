// =============================================================================
// K6 — Atributo oficial SEGURIDAD (+ Fiabilidad complementaria) con K6.
// Nivel: SISTEMA · caja negra sobre el entorno QA en nube.
//
// Demuestra que K6 no es solo un generador de carga: puede verificar
// controles de seguridad HTTP usando check() sobre status, cabeceras y cookies:
//   - redirects: 0  -> no sigue redirecciones (permite asertar el 302)
//   - res.headers   -> cabeceras de seguridad (X-Frame-Options, nosniff, ...)
//   - res.cookies   -> atributos de cookies (httpOnly, samesite)
//
// Casos cubiertos (Plan de Sistema §5):
//   NF-SEC-01  ruta protegida sin sesión -> 302 a /login (sin exponer datos)
//   NF-SEC-hdr cabeceras de seguridad + cookie de sesión httpOnly + token CSRF
//   NF-REL-02  (complementaria) ruta inexistente -> 404 controlado
//
// Ejecución (1 usuario, 1 iteración — solo lectura, segundos):
//   docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-seguridad.js
// =============================================================================
import http from 'k6/http';
import { check } from 'k6';

const BASE_URL = 'http://159.223.135.124';

export const options = {
  vus: 1,
  iterations: 1,
  thresholds: {
    // TODOS los checks de seguridad deben cumplirse (100 %)
    checks: ['rate==1.0'],
  },
};

export default function () {
  // --- NF-SEC-01: rutas protegidas sin sesión ---------------------------------
  const raiz = http.get(`${BASE_URL}/`, { redirects: 0 });
  const hardware = http.get(`${BASE_URL}/hardware`, { redirects: 0 });

  check(raiz, {
    'SEC-01a: / sin sesion responde 302': (r) => r.status === 302,
    'SEC-01a: / redirige a /login': (r) => String(r.headers['Location'] || '').includes('/login'),
  });
  check(hardware, {
    'SEC-01b: /hardware sin sesion responde 302': (r) => r.status === 302,
    'SEC-01b: /hardware redirige a /login': (r) => String(r.headers['Location'] || '').includes('/login'),
    'SEC-01b: /hardware no expone datos (cuerpo sin tabla de activos)': (r) => !String(r.body || '').includes('asset_tag'),
  });

  // --- NF-SEC-hdr: cabeceras de seguridad y cookies en /login -----------------
  const login = http.get(`${BASE_URL}/login`);

  check(login, {
    'SEC-hdr: /login responde 200': (r) => r.status === 200,
    'SEC-hdr: X-Frame-Options = DENY (anti-clickjacking)': (r) => r.headers['X-Frame-Options'] === 'DENY',
    'SEC-hdr: X-Content-Type-Options = nosniff': (r) => r.headers['X-Content-Type-Options'] === 'nosniff',
    'SEC-hdr: Referrer-Policy presente': (r) => !!r.headers['Referrer-Policy'],
    'SEC-hdr: cookie de sesion es httpOnly': (r) => {
      const c = r.cookies['snipeit_session'];
      // K6 expone el atributo como http_only (no httpOnly).
      return !!(c && c[0] && c[0].http_only === true);
    },
    'SEC-hdr: token CSRF presente (cookie XSRF-TOKEN)': (r) => !!r.cookies['XSRF-TOKEN'],
    'SEC-hdr: formulario de login con campo _token (CSRF)': (r) => String(r.body || '').includes('_token'),
  });

  // --- NF-REL-02 (complementaria): manejo de ruta inexistente -----------------
  const noExiste = http.get(`${BASE_URL}/ruta-inexistente-k6`);

  check(noExiste, {
    'REL-02: ruta inexistente responde 404': (r) => r.status === 404,
    'REL-02: sin stacktrace expuesto': (r) => !String(r.body || '').includes('Stack trace'),
  });
}
