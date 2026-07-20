// =============================================================================
// K6 — Atributo oficial FIABILIDAD (Reliability, ISO/IEC 25010) con K6.
// Nivel: SISTEMA · caja negra sobre el entorno QA en nube.
//
// Mide dos sub-características de fiabilidad de forma empírica:
//   NF-REL-01  Disponibilidad / madurez: bajo carga moderada sostenida
//              el sistema responde de forma estable (tasa de fallo ~0 %).
//   NF-REL-02  Tolerancia a fallos: una ruta inexistente devuelve un
//              404 controlado, SIN filtrar traza de error (stacktrace).
//
// Nota de medición: 200/302/404 son respuestas HTTP *controladas* (esperadas);
// por eso se declaran como "estados esperados" para que http_req_failed refleje
// solo fallos reales del servidor (5xx, timeouts) — que es la disponibilidad.
//
// Ejecución (carga moderada 10 VUs · 45 s — solo lectura):
//   docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-fiabilidad.js
// =============================================================================
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://159.223.135.124';

// 200/302/404 = respuestas controladas esperadas -> NO cuentan como fallo.
// Así http_req_failed = disponibilidad real (solo 5xx/timeout son fallo).
http.setResponseCallback(http.expectedStatuses(200, 302, 404));

export const options = {
  scenarios: {
    disponibilidad: {
      executor: 'constant-vus',
      vus: 10,
      duration: '45s',
    },
  },
  thresholds: {
    // Disponibilidad >= 99 % (tasa de peticiones fallidas < 1 %).
    http_req_failed: ['rate<0.01'],
    // El 100 % de las verificaciones de fiabilidad debe cumplirse.
    checks: ['rate==1.0'],
  },
};

export default function () {
  // --- NF-REL-01: disponibilidad bajo carga sostenida -------------------------
  const login = http.get(`${BASE_URL}/login`);
  check(login, {
    'REL-01: /login disponible (200)': (r) => r.status === 200,
  });

  // --- NF-REL-02: tolerancia a fallos — ruta inexistente ----------------------
  const noExiste = http.get(`${BASE_URL}/ruta-inexistente-k6`);
  check(noExiste, {
    'REL-02: ruta inexistente responde 404 controlado': (r) => r.status === 404,
    'REL-02: 404 sin stacktrace expuesto': (r) => !String(r.body || '').includes('Stack trace'),
  });

  sleep(1); // think time — evita saturar la VM compartida
}
