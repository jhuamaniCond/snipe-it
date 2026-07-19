// =============================================================================
// K6 — PERFILES DE CARGA oficiales (configuración mínima del docente) + escenario real.
// Nivel: SISTEMA · Tipo: no funcional (desempeño/concurrencia, ISO 25010).
// SUT: entorno QA en nube http://159.223.135.124 (VM 1 vCPU / 1 GB — Docker).
//
// Perfiles (se elige con la variable PERFIL):
//   esc20  -> 20 VUs  x 30 s   (configuración mínima 1)
//   esc50  -> 50 VUs  x 45 s   (configuración mínima 2)
//   esc100 -> 100 VUs x 60 s   (configuración mínima 3)
//   rampa  -> escenario ADICIONAL de proyecto real: carga escalonada
//             0→20→50→100→0 VUs (30 s por tramo). Modela la llegada
//             progresiva del personal a un sistema interno de inventario:
//             en producción la carga crece y decrece, no aparece de golpe.
//
// Ejecutar (desde la raíz del repo, Docker Desktop abierto):
//   docker compose -f tests/tests_k6/docker-compose.k6.yml \
//     run --rm -e PERFIL=esc20 k6 run /scripts/k6-perfil-carga.js
//
// Métricas a registrar por escenario (requisito del docente):
//   iterations (iteraciones) · http_req_duration avg (t. promedio) y max ·
//   http_reqs rate (throughput) · exitosas/fallidas · % de errores.
// =============================================================================
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://159.223.135.124';
const PERFIL = __ENV.PERFIL || 'esc20';

const perfiles = {
  esc20:  { executor: 'constant-vus', vus: 20,  duration: '30s' },
  esc50:  { executor: 'constant-vus', vus: 50,  duration: '45s' },
  esc100: { executor: 'constant-vus', vus: 100, duration: '60s' },
  rampa: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
      { duration: '30s', target: 20 },   // llegada temprana
      { duration: '30s', target: 50 },   // media mañana
      { duration: '30s', target: 100 },  // hora pico
      { duration: '30s', target: 0 },    // descenso
    ],
  },
};

export const options = {
  scenarios: { [PERFIL]: perfiles[PERFIL] },
  thresholds: {
    http_req_duration: ['p(95)<2000'],  // criterio NF-PERF
    http_req_failed: ['rate<0.01'],     // < 1 % de errores
  },
};

export default function () {
  // GET de solo lectura: no escribe en la BD del entorno compartido.
  const res = http.get(`${BASE_URL}/login`);
  check(res, { 'status es 200': (r) => r.status === 200 });
  sleep(1);  // "think time": pausa realista entre acciones del usuario
}
