# Evidencia — Prueba de DESEMPEÑO con K6 sobre el entorno QA en nube

> Primera corrida real. Fecha: 2026-07-09.
> Cliente: `grafana/k6:1.0.0` (Docker, versión fijada del grupo) ejecutado **desde la PC del tester** (fuera del SUT).
> Objetivo (SUT): `http://159.223.135.124/login` — VM DigitalOcean (Ubuntu 24.04, 1 vCPU / 1 GB RAM, Docker Compose: Snipe-IT + MariaDB 11.4.7).

---

## Configuración mínima ejecutada

| Parámetro | Valor |
|---|---|
| Usuarios Virtuales (VUs) | **5** (constantes) |
| Duración | **30 s** (+1 s de pausa por iteración) |
| Endpoint | `GET /login` (solo lectura — no escribe en BD) |
| Umbral 1 | `p(95) < 2000 ms` |
| Umbral 2 | `http_req_failed < 1 %` |

## Resultado (salida real de K6)

```
█ THRESHOLDS
  http_req_duration   ✓ 'p(95)<2000'  p(95)=689.89ms
  http_req_failed     ✓ 'rate<0.01'   rate=0.00%

█ TOTAL RESULTS
  checks_succeeded: 100.00% (190/190)   ✓ status es 200   ✓ pagina de login renderizada
  http_req_duration: avg=578.5ms  min=466ms  med=582ms  max=734ms  p(90)=660ms  p(95)=690ms
  http_reqs: 95 (3.15 req/s)   http_req_failed: 0.00% (0/95)
  vus: 5 constantes · 95 iteraciones completas, 0 interrumpidas
  data_received: 696 kB
```

## Veredicto

| Criterio | Umbral | Medido | Veredicto |
|---|---|---|---|
| NF-PERF (latencia bajo carga) | p95 < 2000 ms | **p95 = 689.89 ms** | ✅ **PASS** |
| NF-PERF (estabilidad) | errores < 1 % | **0.00 %** | ✅ **PASS** |
| Checks funcionales (200 + render) | 100 % | **100 % (190/190)** | ✅ **PASS** |

## Observación técnica (para el Informe)

Bajo **5 usuarios concurrentes**, la latencia media sube de ~0.29 s (petición individual con `curl`) a **~0.58 s** (avg) — efecto esperable de la concurrencia sobre una VM de **1 vCPU / 1 GB**. Aun así, el p95 queda **3× por debajo del umbral** (690 ms vs 2000 ms): el entorno QA soporta holgadamente la carga de trabajo del equipo. Una prueba de estrés (más VUs) requeriría coordinación del grupo y, probablemente, swap o resize de la VM.

## Reproducir
```powershell
# Desde la raíz del repo, Docker Desktop abierto:
.\trabajoLibelula\HITO-3\Sistema\k6\correr-k6.ps1
```

*Evidencia K6 — Hito 3 · Pruebas de Sistema (atributo oficial: Desempeño).*
