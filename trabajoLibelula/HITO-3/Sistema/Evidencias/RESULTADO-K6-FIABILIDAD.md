# Evidencia — Atributo FIABILIDAD (Reliability) con K6

> Fecha: 2026-07-19 · Cliente: `grafana/k6:1.0.0` (Docker, versión fijada, **externo al SUT**)
> SUT: `http://159.223.135.124/` — VM DigitalOcean (Docker: Snipe-IT + MariaDB 11.4.7)
> Script: `tests/tests_k6/k6-fiabilidad.js` · Config: 10 VUs · 45 s (carga moderada, solo lectura)
> Umbrales: `http_req_failed: rate<0.01` (disponibilidad ≥ 99 %) · `checks: rate==1.0`

---

## 1. Qué mide (ISO/IEC 25010 — Fiabilidad)

| Sub-característica | Caso | Cómo se mide con K6 |
|-------------------|------|---------------------|
| **Madurez / Disponibilidad** | NF-REL-01 | Bajo carga moderada sostenida, la tasa de peticiones fallidas (`http_req_failed`) debe ser < 1 % → el sistema responde de forma estable. |
| **Tolerancia a fallos** | NF-REL-02 | Una ruta inexistente devuelve un **404 controlado**, sin filtrar traza de error (stacktrace). |

> **Nota de medición (transparencia):** los estados 200/302/404 se declaran como *respuestas controladas esperadas* (`http.expectedStatuses`), de modo que `http_req_failed` refleje únicamente fallos reales del servidor (5xx, timeouts) — que es lo que representa la **disponibilidad**.

## 2. Resultado (salida real de K6)

```
█ THRESHOLDS
  checks           ✓ 'rate==1.0'   rate=100.00%
  http_req_failed  ✓ 'rate<0.01'   rate=0.00%

  checks_total.......: 519    checks_succeeded: 100.00% (519/519)   checks_failed: 0.00% (0/519)
  http_reqs..........: 346    (7.36 req/s)
  http_req_failed....: 0.00%  (0 out of 346)
  iterations.........: 173    (3.68 iter/s)
  http_req_duration..: avg=833.21ms  med=859.11ms  min=176.47ms  max=1.64s  p(90)=1.14s  p(95)=1.18s
```

| Métrica | Valor | Lectura |
|---------|-------|---------|
| Iteraciones completadas | **173** | Ninguna interrumpida |
| Peticiones HTTP totales | **346** | 2 por iteración (login + ruta inexistente) |
| Peticiones fallidas | **0 (0.00 %)** | **Disponibilidad ≈ 100 %** en la ventana de prueba |
| Throughput | **7.36 req/s** | Con think time de 1 s por iteración |
| Tiempo de respuesta p(95) | **1.18 s** | Bajo el umbral de desempeño (< 2 s) |
| Checks superados | **519 / 519 (100 %)** | Disponibilidad + manejo de error 404 |

**Veredicto: PASS.** En la ventana evaluada el sistema mantuvo disponibilidad total (0 fallos de servidor sobre 346 peticiones bajo 10 usuarios concurrentes) y manejó las rutas inexistentes con un 404 controlado sin exponer trazas.

## 3. Reproducir

```powershell
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-fiabilidad.js
```

*Evidencia K6 — Fiabilidad · Hito 3 · Pruebas de Sistema.*
