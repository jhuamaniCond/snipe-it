// =============================================================================
// K6 — Prueba de DESEMPEÑO (atributo oficial) sobre el entorno QA en nube.
// Nivel: SISTEMA · Tipo: no funcional (eficiencia de desempeño, ISO 25010).
//
// K6 corre como CLIENTE, FUERA del servidor bajo prueba (SUT), para no
// contaminar la medición. Ejecutar desde la PC del tester (Docker) o CI:
//
//   docker run --rm -i grafana/k6 run - < tests/tests_k6/k6-desempeno.js
//
// Escenario: smoke de carga — 5 usuarios virtuales (VUs) concurrentes, 30 s,
// con pausa de 1 s por iteración (carga prudente: la VM QA es compartida,
// 1 vCPU / 1 GB RAM). Para un perfil de estrés, coordinar con el grupo antes.
// =============================================================================
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://159.223.135.124';

export const options = {
  scenarios: {
    smoke_carga: {
      executor: 'constant-vus',
      vus: 5,           // 5 usuarios concurrentes
      duration: '30s',
    },
  },
  thresholds: {
    // NF-PERF-01: el 95 % de las respuestas debe llegar en < 2 s
    http_req_duration: ['p(95)<2000'],
    // Menos del 1 % de peticiones fallidas
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/login`);
  check(res, {
    'status es 200': (r) => r.status === 200,
    'pagina de login renderizada': (r) => r.body && r.body.includes('login'),
  });
  sleep(1);
}
