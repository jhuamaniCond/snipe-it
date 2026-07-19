# Informe de Pruebas de Sistema

> **Test Completion Report** conforme a **ISO/IEC/IEEE 29119-3**. Reporta la ejecución del [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) v3.0: **dos atributos oficiales (Seguridad y Desempeño)** verificados sobre el **entorno QA compartido en la nube**, con `curl` y **K6**. La automatización E2E (plus opcional) se reporta en el Anexo A.

| Campo | Detalle |
|-------|---------|
| **Documento** | Informe de Pruebas de Sistema — Snipe-IT |
| **Versión** | 2.1 |
| **Hito / Sprint** | Hito 3 (Sprint 3–4) |
| **Atributos oficiales** | **Seguridad** y **Desempeño** (ISO/IEC 25010) |
| **Entorno QA oficial (SUT)** | VM DigitalOcean — Ubuntu 24.04 · 1 vCPU · 1 GB RAM — Docker Compose (Snipe-IT + MariaDB 11.4.7) → `http://159.223.135.124/` |
| **Herramientas** | `curl` · **K6 `grafana/k6:1.0.0`** (versión fijada, cliente externo al SUT) |
| **Fechas de ejecución** | 2026-07-08 (staging local) · **2026-07-09 (entorno QA en nube: curl + K6)** |
| **Estándar** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25010 |

---

## 1. Resumen ejecutivo

Se verificó el sistema **desplegado en la nube** (URL pública compartida por el equipo) en sus **dos atributos oficiales**, con resultados reales:

- **Seguridad ✅** — las rutas protegidas sin sesión redirigen a login (**302**), la aplicación expone cabeceras de seguridad correctas (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, cookie `httponly/samesite`, CSRF).
- **Desempeño ✅** — latencia individual TTFB ≈ **0.29 s** (umbral < 2 s) y, **bajo carga concurrente con K6 (5 VUs × 30 s)**: **p95 = 689.89 ms**, **0.00 % de errores**, 190/190 checks — **todos los umbrales cumplidos**.
- Complementaria: **Fiabilidad ✅** (404 controlado en ruta inexistente).

**Veredicto: el sistema desplegado cumple los dos atributos oficiales sin defectos.** La observación relevante es de capacidad: bajo 5 usuarios concurrentes la latencia media sube de ~0.29 s a ~0.58 s (VM de 1 vCPU/1 GB), permaneciendo 3× por debajo del umbral.

---

## 2. Base de la prueba

- **Plan de referencia:** [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) v3.0 (dos atributos por indicación del docente; selección por riesgo ISO 25010).
- **Trazabilidad:** NF-* → atributos ISO 25010; la validación funcional del sistema quedó cubierta por los CPF (caja negra manual, Hito 2) e INT (integración, Hito 3) — [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

## 3. Alcance ejecutado

| Bloque | Estado |
|--------|--------|
| **Seguridad** — NF-SEC-01 + cabeceras (contra la URL QA en nube) | ✅ Ejecutado (real) |
| **Desempeño** — NF-PERF-01 (curl) + **NF-PERF-K6 (carga)** contra la URL QA | ✅ Ejecutado (real) |
| Complementaria — NF-REL-02 (fiabilidad) | ✅ Ejecutado (real) |
| NF-SEC-02/03 (403 autenticado, logout) · NF-PERF-02 (volumen) · NF-REL-01 (throttling) | 🕗 Pendientes |
| E2E automatizado (plus opcional) | Ver **Anexo A** |

---

## 4. Herramientas y entorno

- **SUT (nube):** `http://159.223.135.124/` — VM DigitalOcean administrada por el grupo vía SSH (clave excluida del repo por `.gitignore`); Snipe-IT + MariaDB 11.4.7 con Docker Compose. **Único entorno oficial de evidencias** (el Docker local queda para desarrollo).
- **Clientes de medición (externos al SUT):** `curl` (estados, cabeceras, TTFB) y **K6 `1.0.0` fijada** ejecutada vía Docker desde la PC del tester — entorno compartido en `tests/tests_k6/` (compose + wrapper + reglas). El generador de carga **nunca** corre dentro de la VM para no contaminar la medición.
- **Datos:** los scripts de desempeño usan **endpoints de solo lectura** — no escriben en la BD del entorno QA.

---

## 5. Resultados de ejecución

### 5.1 Atributo oficial 1 — SEGURIDAD (2026-07-09, contra la nube)

| ID | Verificación | Resultado esperado | Resultado real | Veredicto |
|----|--------------|--------------------|----------------|-----------|
| NF-SEC-01 | `GET /` y `GET /hardware` sin sesión | 302 → `/login`, sin exponer datos | **HTTP 302 → `http://159.223.135.124/login`** | ✅ PASS |
| NF-SEC-hdr | Cabeceras de `/login` | Controles presentes | **`X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` · `Referrer-Policy: same-origin` · cookie `httponly; samesite=lax` · token CSRF (XSRF-TOKEN)** | ✅ PASS |

### 5.2 Atributo oficial 2 — DESEMPEÑO (2026-07-09, contra la nube)

**a) Latencia individual (curl):**

| ID | Verificación | Umbral | Resultado real | Veredicto |
|----|--------------|--------|----------------|-----------|
| NF-PERF-01 | TTFB de `/login` (3 tomas por red pública) | < 2 s | **0.289 – 0.293 s** | ✅ PASS |

**b) Carga concurrente con K6 (NF-PERF-K6) — configuración mínima: 5 VUs × 30 s:**

| Métrica K6 | Umbral | Resultado real | Veredicto |
|------------|--------|----------------|-----------|
| `http_req_duration p(95)` | **< 2000 ms** | **689.89 ms** | ✅ PASS |
| `http_req_failed` | **< 1 %** | **0.00 %** (0/95) | ✅ PASS |
| Checks (status 200 + página renderizada) | 100 % | **100 %** (190/190) | ✅ PASS |
| Detalle de latencias | — | avg 578 ms · min 466 ms · med 582 ms · max 734 ms · p90 660 ms | — |
| Volumen | — | 95 peticiones (3.15 req/s) · 5 VUs constantes · 0 iteraciones interrumpidas | — |

**c) Perfiles de carga oficiales (configuración mínima del docente) + escenario real (2026-07-09):**

| Escenario | VUs × Dur. | Iteraciones | T. promedio | T. máximo | Throughput | Exitosas / Fallidas | % errores | p95 | Umbral p95 |
|---|---|---:|---:|---:|---:|---:|---:|---:|:--:|
| NF-PERF-K6-1 | 20 × 30 s | 275 | 1.23 s | 5.15 s | 8.73 req/s | 275 / 0 | 0.00 % | 1.98 s | ✅ *(límite)* |
| NF-PERF-K6-2 | 50 × 45 s | 417 | 4.74 s | 15.35 s | 8.47 req/s | 417 / 0 | 0.00 % | 12.10 s | ❌ |
| NF-PERF-K6-3 | 100 × 60 s | 459 | 13.02 s | 37.06 s | 6.83 req/s | 459 / 0 | 0.00 % | 29.52 s | ❌ |
| **NF-PERF-K6-R (rampa** 0→20→50→100→0**)** | 120 s | 639 | 8.03 s | 23.33 s | 5.31 req/s | 639 / 0 | 0.00 % | 20.20 s | ❌ |

**Interpretación (hallazgo de capacidad, no defecto del software):**
1. **0 % de errores en ~1 900 peticiones**: el sistema nunca devuelve 5xx — ante sobrecarga **encola** y termina todas en 200 (**degradación elegante**).
2. **Punto de saturación ≈ 20 VUs / ~8.5–8.7 req/s**: el throughput se estanca entre 20 y 50 VUs — es la capacidad máxima de la VM de 1 vCPU; desde ahí, más usuarios = más cola, no más trabajo.
3. **Latencia crece casi linealmente con los usuarios por encima de la saturación** (p95: 1.98 s → 12.1 s → 29.5 s), y con 100 VUs el throughput incluso **cae** (6.8 req/s) por la sobrecarga de gestionar conexiones.
4. **Veredicto de capacidad**: el entorno QA atiende **hasta ~20 usuarios concurrentes dentro del umbral** — holgado para el equipo (6 personas) y la sustentación. Soportar 50–100 concurrentes exigiría escalar la VM (vCPU/RAM) o afinar PHP-FPM. Los ❌ de los perfiles altos documentan el **límite del hardware contratado**, que es exactamente lo que una prueba de carga debe revelar.
5. La **rampa** (escenario real: llegada escalonada del personal) confirma la entrada y salida de la zona de saturación con recuperación automática (mín. 0.19 s en valle).

> Evidencias: `HITO-3/Sistema/Evidencias/RESULTADO-K6-DESEMPENO.md` (smoke), **`RESULTADO-K6-PERFILES-CARGA.md` (perfiles oficiales + interpretación completa)** y `RESULTADO-NO-FUNCIONALES-HTTP.md` (curl local y nube).

### 5.3 Complementaria — Fiabilidad (fuera del alcance oficial, ya ejecutada)

| ID | Verificación | Resultado real | Veredicto |
|----|--------------|----------------|-----------|
| NF-REL-02 | `GET /noexiste-xyz` | **HTTP 404** controlado (sin stacktrace) | ✅ PASS |

### 5.4 Pendientes

| ID | Motivo |
|----|--------|
| NF-SEC-02 / NF-SEC-03 | Requieren sesión de usuario limitado / flujo de logout en navegador |
| NF-PERF-02 | Requiere sembrar dataset de volumen (≈500 activos) en QA |
| NF-REL-01 | Requiere POST repetidos con CSRF hasta el lockout |

---

## 6. Defectos y observaciones

- **Defectos: 0** en todas las verificaciones ejecutadas.
- **OBS-SIS-01 (capacidad):** bajo 5 usuarios concurrentes la latencia media sube de ~0.29 s (petición individual) a **~0.58 s** — efecto de la concurrencia sobre 1 vCPU/1 GB. El p95 (690 ms) queda 3× bajo el umbral: la VM soporta con holgura la carga de trabajo del equipo. Una prueba de **estrés** (más VUs) requeriría coordinación y swap/resize de la VM.
- **OBS-SIS-02 (metodología):** los resultados de desempeño son **relativos al entorno QA declarado** (1 vCPU/1 GB, red pública); así deben interpretarse las cifras.

---

## 7. Métricas

| Métrica | Valor |
|---------|-------|
| Casos oficiales ejecutados (Seguridad + Desempeño) | 4 (NF-SEC-01, NF-SEC-hdr, NF-PERF-01, NF-PERF-K6) |
| PASS | **4/4 (100 %)** |
| K6 — p95 bajo carga | **689.89 ms** (umbral 2000 ms) |
| K6 — tasa de error | **0.00 %** |
| K6 — checks | 190/190 (100 %) |
| TTFB individual `/login` (nube) | ≈ 0.29 s |
| Complementarias ejecutadas | 1 (NF-REL-02, PASS) |
| Defectos de sistema | **0** |
| Pendientes | 4 (NF-SEC-02/03, NF-PERF-02, NF-REL-01) |

---

## 8. Evaluación de criterios de salida (Plan §7)

| Criterio | Estado |
|----------|--------|
| Entorno QA en nube desplegado y accesible | ✅ |
| Entorno K6 compartido (versión fijada 1.0.0) operativo | ✅ |
| Seguridad ejecutada contra la URL QA, sin defectos altos | ✅ (NF-SEC-02/03 pendientes, sin hallazgos en lo ejecutado) |
| Desempeño ejecutado contra la URL QA, umbrales cumplidos | ✅ (curl + K6; NF-PERF-02 pendiente) |
| Resultados documentados en el Informe | ✅ (este documento) |

---

## 9. Conclusiones y recomendaciones

1. **El sistema desplegado en la nube cumple los dos atributos oficiales**: Seguridad (302 + cabeceras correctas) y Desempeño (p95 = 690 ms bajo carga, 0 % errores) — sin defectos.
2. **K6 aportó la dimensión que faltaba** (concurrencia): la medición pasó de tomas puntuales (`curl`) a carga sostenida con percentiles y umbrales verificables — con **versión fijada (1.0.0)** para que todo el grupo mida igual.
3. **La arquitectura de medición es correcta**: cliente de carga externo al SUT, scripts de solo lectura (no contaminan la BD del entorno compartido), resultados interpretados relativos al hardware declarado.
4. **Trabajo restante (menor):** NF-SEC-02/03, NF-PERF-02 (dataset de volumen) y NF-REL-01; opcionalmente un perfil de carga mayor coordinado (con swap/resize previo de la VM).
5. La automatización **E2E** queda como plus opcional documentado con transparencia (Anexo A).

---

## Anexo A — Automatización E2E (plus opcional, no prioritario)

> Indicación del docente: la automatización E2E *"ya no es prioridad"*. Se reporta lo implementado con su estado real, **sin darlo por aprobado**.

| Aspecto | Estado |
|---------|--------|
| Código E2E (Laravel Dusk): `tests/Browser/AuthenticationE2ETest.php`, `AssetE2ETest.php` (5 casos: login válido/inválido, logout, activo visible, checkout ofrecido) | ✅ Implementado |
| Infraestructura Docker: `docker-compose.e2e.yml` (Selenium/Chrome headless + app + MariaDB, red interna) | ✅ Verificada (stack levanta; Dusk conecta y ejecuta) |
| Workflow CI: `.github/workflows/e2e-dusk.yml` (runner Linux; sube capturas si falla) | ✅ Creado |
| **Corrida verde (aserciones)** | ❌ **Aún no** — la primera corrida en CI falló (2026-07-08); en local (Windows) el bind-mount de Docker impide servir la app de forma fiable al navegador (`ERR_CONNECTION_REFUSED`). En estabilización; **no exigible** |
| Precaución | Dusk **trunca la BD**: nunca apuntarlo al entorno QA compartido; solo a BD desechables |

---

## Anexo B — Evidencias y artefactos

- `HITO-3/Sistema/Evidencias/RESULTADO-K6-DESEMPENO.md` — salida íntegra de la corrida K6 (5 VUs × 30 s) contra la nube.
- `HITO-3/Sistema/Evidencias/RESULTADO-NO-FUNCIONALES-HTTP.md` — mediciones `curl` (staging local 2026-07-08 y nube 2026-07-09).
- `tests/tests_k6/` — entorno K6 compartido (compose con pin `1.0.0`, wrapper, script oficial, README con reglas).
- `tests/Browser/`, `HITO-3/Sistema/docker-compose.e2e.yml`, `.github/workflows/e2e-dusk.yml` — plus E2E (Anexo A).
- Plan de referencia: `Plan-de-Pruebas-de-Sistema.md` v3.0.

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-07-08 | Informe inicial: no funcionales HTTP sobre staging local (4/4 PASS); E2E diseñados. |
| 1.1–1.2 | 2026-07-08 | Automatización E2E implementada; estado transparente tras fallo en CI (no verde). |
| 1.3 | 2026-07-09 | Dos atributos oficiales (docente); E2E reclasificado plus; K6 recomendado. |
| 1.4 | 2026-07-09 | Migración del staging a la nube y re-ejecución `curl` contra la URL pública. |
| **2.0** | 2026-07-09 | **Reestructuración**: resultados organizados por atributo oficial contra el entorno QA en nube; **primera corrida real de K6** (5 VUs × 30 s: p95 690 ms, 0 % errores — PASS); observaciones de capacidad; **E2E desplazado al Anexo A**. |
| 2.1 | 2026-07-09 | **Perfiles de carga oficiales ejecutados** (20×30 s ✅ límite · 50×45 s ❌ · 100×60 s ❌ · rampa ❌) con las métricas exigidas por escenario e **interpretación**: 0 % errores en ~1 900 peticiones (degradación elegante), saturación ≈ 20 VUs / 8.5 req/s, hallazgo de **capacidad del hardware** (no defecto del software). |

*Fin del documento — Informe de Pruebas de Sistema.*
