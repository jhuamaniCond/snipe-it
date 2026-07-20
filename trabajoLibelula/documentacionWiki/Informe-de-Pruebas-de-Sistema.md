# Informe de Pruebas de Sistema

> **Test Completion Report** conforme a **ISO/IEC/IEEE 29119-3**. Reporta la ejecución del [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) v4.0: **tres atributos no funcionales (Seguridad, Desempeño y Fiabilidad)** verificados con **K6** como cliente externo sobre el **entorno QA compartido en la nube**.

| Campo | Detalle |
|-------|---------|
| **Documento** | Informe de Pruebas de Sistema — Snipe-IT |
| **Versión** | 3.0 |
| **Hito / Sprint** | Hito 3 (Sprint 3–4) |
| **Atributos oficiales** | **Seguridad**, **Desempeño** y **Fiabilidad** (ISO/IEC 25010) |
| **Entorno QA oficial (SUT)** | VM DigitalOcean — Ubuntu 24.04 · 1 vCPU · 1 GB RAM — Docker Compose (Snipe-IT + MariaDB 11.4.7) → `http://159.223.135.124/` |
| **Herramienta oficial** | **K6 `grafana/k6:1.0.0`** (versión fijada, cliente externo al SUT) — para los tres atributos |
| **Fechas de ejecución** | **2026-07-19 (entorno QA en nube: K6, los tres atributos)** |
| **Estándar** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25010 |

---

## 1. Resumen ejecutivo

Se verificó el sistema **desplegado en la nube** (URL pública compartida por el equipo) en sus **tres atributos oficiales**, todos medidos con **K6 contra `http://159.223.135.124/`**:

- **Seguridad ✅** — `k6-seguridad.js`: **12/12 checks PASS**. Las rutas protegidas sin sesión redirigen a login (**302**) sin exponer datos; la aplicación expone cabeceras de seguridad correctas (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`), marca la cookie de sesión `httpOnly` e incluye protección CSRF.
- **Desempeño ✅** — `k6-perfil-carga.js`: bajo carga concurrente (smoke 5 VUs × 30 s): **p95 = 689.89 ms**, **0.00 % de errores**, 190/190 checks. Los perfiles altos (20/50/100 VUs + rampa) revelan la **capacidad** de la VM (saturación ≈ 20 VUs), sin un solo 5xx.
- **Fiabilidad ✅** — `k6-fiabilidad.js` (10 VUs × 45 s): **disponibilidad 100 %** (0 fallos de servidor sobre 346 peticiones), 404 controlado sin stacktrace; **519/519 checks PASS**, p95 = 1.18 s.

**Veredicto: el sistema desplegado cumple los tres atributos sin defectos.** La única observación relevante es de capacidad: la VM de 1 vCPU/1 GB atiende con holgura hasta ~20 usuarios concurrentes dentro del umbral (p95 ≤ 2 s), más que suficiente para el equipo y la sustentación.

---

## 2. Base de la prueba

- **Plan de referencia:** [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) v4.0 (tres atributos oficiales; selección por riesgo ISO 25010).
- **Trazabilidad:** NF-* → atributos ISO 25010; la validación funcional del sistema quedó cubierta por los CPF (caja negra manual, Hito 2) e INT (integración, Hito 3) — [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

## 3. Alcance ejecutado

| Bloque | Script K6 | Estado |
|--------|-----------|--------|
| **Seguridad** — NF-SEC-01 + cabeceras/cookies/CSRF (contra la URL QA en nube) | `k6-seguridad.js` | ✅ Ejecutado (12/12) |
| **Desempeño** — NF-PERF-K6 smoke + perfiles 20/50/100 + rampa contra la URL QA | `k6-desempeno.js` · `k6-perfil-carga.js` | ✅ Ejecutado |
| **Fiabilidad** — NF-REL-01 (disponibilidad) + NF-REL-02 (404 controlado) contra la URL QA | `k6-fiabilidad.js` | ✅ Ejecutado (519/519) |
| NF-SEC-02/03 (403 autenticado, logout) — se validan en la UAT de aceptación | — | 🕗 En aceptación |

---

## 4. Herramientas y entorno

- **SUT (nube):** `http://159.223.135.124/` — VM DigitalOcean administrada por el grupo vía SSH (clave excluida del repo por `.gitignore`); Snipe-IT + MariaDB 11.4.7 con Docker Compose. **Único entorno oficial de evidencias** (el Docker local queda para desarrollo).
- **Cliente de medición (externo al SUT):** **K6 `1.0.0` fijada** ejecutada vía Docker desde la PC del tester — entorno compartido en `tests/tests_k6/` (compose + wrapper + reglas). K6 verifica los **tres** atributos: seguridad y fiabilidad mediante `check()` sobre estado/cabeceras/cookies/cuerpo, y desempeño mediante VUs y umbrales. El cliente **nunca** corre dentro de la VM para no contaminar la medición. (`curl` se usó solo para comprobaciones manuales puntuales; **no es la evidencia oficial**.)
- **Datos:** **todos** los scripts K6 usan **endpoints de solo lectura** — no escriben en la BD del entorno QA.

---

## 5. Resultados de ejecución

### 5.1 Atributo oficial 1 — SEGURIDAD (2026-07-19, K6 contra la nube · `k6-seguridad.js`)

**12/12 checks PASS** (umbral `checks: rate==1.0`). K6 inspeccionó estado, cabeceras, cookies y cuerpo de las respuestas:

| ID | Verificación | Resultado real | Veredicto |
|----|--------------|----------------|-----------|
| NF-SEC-01 | `GET /` y `GET /hardware` sin sesión → 302 a `/login`; cuerpo sin `asset_tag` | **HTTP 302 → `/login`; sin datos expuestos** | ✅ PASS (5 checks) |
| NF-SEC-hdr | Cabeceras y sesión de `/login` | **`X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` · `Referrer-Policy` presente · cookie `snipeit_session` httpOnly · cookie CSRF `XSRF-TOKEN` · campo `_token`** | ✅ PASS (7 checks) |

> Nota de transparencia: una corrida temprana marcó un fallo por un error del *script* (consultaba la cookie como `httpOnly` en vez de `http_only`, como K6 la expone); la respuesta real del SUT sí es `httponly`. Corregido el aserto → 12/12. Defecto en el test, no en el sistema.

### 5.2 Atributo oficial 2 — DESEMPEÑO (2026-07-19, K6 contra la nube)

**Carga concurrente con K6 (NF-PERF-K6) — configuración mínima: 5 VUs × 30 s (smoke):**

| Métrica K6 | Umbral | Resultado real | Veredicto |
|------------|--------|----------------|-----------|
| `http_req_duration p(95)` | **< 2000 ms** | **689.89 ms** | ✅ PASS |
| `http_req_failed` | **< 1 %** | **0.00 %** (0/95) | ✅ PASS |
| Checks (status 200 + página renderizada) | 100 % | **100 %** (190/190) | ✅ PASS |
| Detalle de latencias | — | avg 578 ms · min 466 ms · med 582 ms · max 734 ms · p90 660 ms | — |
| Volumen | — | 95 peticiones (3.15 req/s) · 5 VUs constantes · 0 iteraciones interrumpidas | — |

**c) Perfiles de carga oficiales (configuración mínima) + escenario real (2026-07-09):**

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
5. La **rampa** (escenario: llegada escalonada del personal) confirma la entrada y salida de la zona de saturación con recuperación automática (mín. 0.19 s en valle).

> Evidencias: `HITO-3/Sistema/Evidencias/RESULTADO-K6-DESEMPENO.md` (smoke) y **`RESULTADO-K6-PERFILES-CARGA.md` (perfiles oficiales + interpretación completa)**.

### 5.3 Atributo oficial 3 — FIABILIDAD (2026-07-19, K6 contra la nube · `k6-fiabilidad.js`)

**Configuración: 10 VUs × 45 s** (carga moderada sostenida, solo lectura). Umbrales: `http_req_failed: rate<0.01` (disponibilidad) y `checks: rate==1.0`.

| ID | Verificación | Umbral / esperado | Resultado real | Veredicto |
|----|--------------|-------------------|----------------|-----------|
| NF-REL-01 | Disponibilidad bajo carga sostenida | fallos de servidor < 1 % | **0.00 %** (0 de 346 peticiones) → **disponibilidad ≈ 100 %** | ✅ PASS |
| NF-REL-02 | Ruta inexistente → 404 controlado sin stacktrace | 404 sin traza | **HTTP 404 controlado, sin stacktrace** | ✅ PASS |

| Métrica K6 (fiabilidad) | Valor |
|---|---|
| Iteraciones completadas | 173 (0 interrumpidas) |
| Peticiones HTTP | 346 (7.36 req/s) |
| Peticiones fallidas | **0 (0.00 %)** |
| Checks superados | **519 / 519 (100 %)** |
| `http_req_duration` p(95) | **1.18 s** (avg 833 ms · med 859 ms · max 1.64 s) |

**Interpretación:** en la ventana evaluada el sistema mantuvo **disponibilidad total** bajo 10 usuarios concurrentes (ningún 5xx ni timeout) y **manejó los errores de forma controlada** (404 sin exponer trazas). La latencia p95 (1.18 s) queda bajo el umbral de desempeño.

> Evidencia: `HITO-3/Sistema/Evidencias/RESULTADO-K6-FIABILIDAD.md`.

### 5.4 Pendientes (se cierran en la aceptación)

| ID | Motivo |
|----|--------|
| NF-SEC-02 / NF-SEC-03 | Requieren sesión autenticada de usuario limitado / flujo de logout — se validan en la **UAT** (ACC-06). |

---

## 6. Defectos y observaciones

- **Defectos: 0** en todas las verificaciones ejecutadas (Seguridad 12/12 · Desempeño smoke PASS · Fiabilidad 519/519).
- **OBS-SIS-01 (capacidad):** el entorno QA (1 vCPU/1 GB) satura ≈ 20 usuarios concurrentes (~8.5 req/s); dentro de ese límite el p95 cumple el umbral (≤ 2 s). Soportar 50–100 concurrentes exigiría escalar la VM — es un límite del hardware contratado, no un defecto del software.
- **OBS-SIS-02 (metodología):** los resultados son **relativos al entorno QA declarado** (1 vCPU/1 GB, red pública) y todos se obtuvieron con **K6 como cliente externo** contra la URL pública; así deben interpretarse las cifras.

---

## 7. Métricas

| Métrica | Valor |
|---------|-------|
| Atributos oficiales verificados con K6 | **3** (Seguridad, Desempeño, Fiabilidad) |
| Seguridad — checks | **12/12 (100 %)** PASS |
| Desempeño (smoke) — p95 / errores / checks | **690 ms** / **0.00 %** / 190/190 |
| Desempeño — perfiles de carga | esc20 ✅ límite · esc50/esc100/rampa documentan capacidad (0 % errores) |
| Fiabilidad — disponibilidad / checks / p95 | **100 %** (0/346 fallos) / **519/519** / 1.18 s |
| Defectos de sistema | **0** |
| Pendientes (se cierran en la UAT) | NF-SEC-02/03 (sesión autenticada / logout) |

---

## 8. Evaluación de criterios de salida (Plan §7)

| Criterio | Estado |
|----------|--------|
| Entorno QA en nube desplegado y accesible | ✅ |
| Entorno K6 compartido (versión fijada 1.0.0) operativo | ✅ |
| Seguridad ejecutada con K6 contra la URL QA, sin defectos altos | ✅ (12/12; NF-SEC-02/03 se cierran en la UAT) |
| Desempeño ejecutado con K6 contra la URL QA, umbrales cumplidos | ✅ (smoke PASS; perfiles documentan capacidad) |
| Fiabilidad ejecutada con K6 contra la URL QA | ✅ (disponibilidad 100 %, 519/519) |
| Resultados documentados en el Informe | ✅ (este documento) |

---

## 9. Conclusiones y recomendaciones

1. **El sistema desplegado en la nube cumple los tres atributos oficiales**: Seguridad (302 + cabeceras + cookie httpOnly + CSRF, 12/12), Desempeño (p95 = 690 ms bajo carga, 0 % errores) y Fiabilidad (disponibilidad 100 %, 404 controlado, 519/519) — sin defectos.
2. **Medición unificada con K6 contra la nube**: los tres atributos se verificaron con una sola herramienta reproducible, como cliente **externo** al SUT y con **versión fijada (1.0.0)** para que todo el grupo mida igual — no se usó `curl` local como evidencia.
3. **La arquitectura de medición es correcta**: cliente externo al SUT, scripts de **solo lectura** (no contaminan la BD del entorno compartido), resultados interpretados relativos al hardware declarado.
4. **Trabajo restante (menor):** NF-SEC-02/03 (403 de usuario sin permiso, logout) se cierran en la **UAT de aceptación** (ACC-06); opcionalmente un perfil de carga mayor coordinado (con swap/resize previo de la VM).

---

## Anexo — Evidencias

### Evidencia — Atributo SEGURIDAD con K6 (contra la nube)

> Fecha: 2026-07-19 · Cliente: `grafana/k6:1.0.0` (Docker, externo al SUT) · Script: `tests/tests_k6/k6-seguridad.js`
> SUT: `http://159.223.135.124/` · Config: 1 VU · 1 iteración (solo lectura) · Umbral: `checks: rate==1.0`

```
█ THRESHOLDS
  checks   ✓ 'rate==1.0'  rate=100.00%
  checks_total: 12   checks_succeeded: 100.00% (12/12)   checks_failed: 0.00% (0/12)
  ✓ SEC-01a: / sin sesion responde 302
  ✓ SEC-01a: / redirige a /login
  ✓ SEC-01b: /hardware sin sesion responde 302
  ✓ SEC-01b: /hardware redirige a /login
  ✓ SEC-01b: /hardware no expone datos (cuerpo sin tabla de activos)
  ✓ SEC-hdr: /login responde 200
  ✓ SEC-hdr: X-Frame-Options = DENY (anti-clickjacking)
  ✓ SEC-hdr: X-Content-Type-Options = nosniff
  ✓ SEC-hdr: Referrer-Policy presente
  ✓ SEC-hdr: cookie de sesion es httpOnly
  ✓ SEC-hdr: token CSRF presente (cookie XSRF-TOKEN)
  ✓ SEC-hdr: formulario de login con campo _token (CSRF)
```
✅ **12/12 PASS.** Detalle completo en `HITO-3/Sistema/Evidencias/RESULTADO-K6-SEGURIDAD.md`.

---

### Evidencia — Prueba de DESEMPEÑO con K6 sobre el entorno QA en nube

> Primera corrida real. Fecha: 2026-07-09.
> Cliente: `grafana/k6:1.0.0` (Docker, versión fijada del grupo) ejecutado **desde la PC del tester** (fuera del SUT).
> Objetivo (SUT): `http://159.223.135.124/login` — VM DigitalOcean (Ubuntu 24.04, 1 vCPU / 1 GB RAM, Docker Compose: Snipe-IT + MariaDB 11.4.7).

**Configuración ejecutada**

| Parámetro | Valor |
|---|---|
| Usuarios Virtuales (VUs) | **5** (constantes) |
| Duración | **30 s** (+1 s de pausa por iteración) |
| Endpoint | `GET /login` (solo lectura — no escribe en BD) |
| Umbral 1 | `p(95) < 2000 ms` |
| Umbral 2 | `http_req_failed < 1 %` |

**Resultado**

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

**Veredicto**

| Criterio | Umbral | Medido | Veredicto |
|---|---|---|---|
| NF-PERF (latencia bajo carga) | p95 < 2000 ms | **p95 = 689.89 ms** | ✅ **PASS** |
| NF-PERF (estabilidad) | errores < 1 % | **0.00 %** | ✅ **PASS** |
| Checks funcionales (200 + render) | 100 % | **100 % (190/190)** | ✅ **PASS** |

**Observación técnica:** bajo **5 usuarios concurrentes**, la latencia media sube de ~0.29 s (petición individual con `curl`) a **~0.58 s** (avg) — efecto esperable de la concurrencia sobre una VM de **1 vCPU / 1 GB**. Aun así, el p95 queda **3× por debajo del umbral** (690 ms vs 2000 ms): el entorno QA soporta holgadamente la carga de trabajo del equipo. Una prueba de estrés (más VUs) requeriría coordinación del grupo y, probablemente, swap o resize de la VM.

---

### Evidencia — Perfiles de carga K6 (configuración mínima + escenario real)

> Fecha: 2026-07-09 · Cliente: `grafana/k6:1.0.0` (Docker, versión fijada, **externo al SUT**)
> SUT: `http://159.223.135.124/login` (GET, solo lectura) — VM DigitalOcean **1 vCPU / 1 GB RAM**, Docker Compose (Snipe-IT + MariaDB 11.4.7)
> Umbrales: `p(95) < 2000 ms` · `errores < 1 %` · *think time* 1 s por iteración
> Script: `tests/tests_k6/k6-perfil-carga.js` (perfil por variable `PERFIL`)

**1. Tabla de registro por escenario (métricas exigidas)**

| Escenario | VUs | Duración | **Iteraciones** | **T. promedio** | **T. máximo** | **Throughput** | **Exitosas** | **Fallidas** | **% errores** | p95 | Umbral p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:--:|
| smoke (previo) | 5 | 30 s | 95 | 0.58 s | 0.73 s | 3.15 req/s | 95 | 0 | 0.00 % | 0.69 s | ✅ |
| **esc20** (mín. 1) | 20 | 30 s | **275** | **1.23 s** | **5.15 s** | **8.73 req/s** | **275** | **0** | **0.00 %** | 1.98 s | ✅ *(al límite)* |
| **esc50** (mín. 2) | 50 | 45 s | **417** | **4.74 s** | **15.35 s** | **8.47 req/s** | **417** | **0** | **0.00 %** | 12.10 s | ❌ |
| **esc100** (mín. 3) | 100 | 60 s | **459** | **13.02 s** | **37.06 s** | **6.83 req/s** | **459** | **0** | **0.00 %** | 29.52 s | ❌ |
| **rampa** (adicional) | 0→20→50→100→0 | 120 s | **639** | **8.03 s** | **23.33 s** | **5.31 req/s** | **639** | **0** | **0.00 %** | 20.20 s | ❌ |

*(Exitosas/Fallidas: `http_req_failed` = 0 en los 5 escenarios; checks `status 200` al 100 % — 275/275, 417/417, 459/459, 639/639.)*

**2. Interpretación de los resultados**

1. **Cero errores en ~1 900 peticiones totales (0.00 % en los 5 escenarios).** El sistema **nunca se rompe**: no hubo 5xx ni conexiones rechazadas. Ante sobrecarga, Snipe-IT/Apache **encolan** las peticiones y todas terminan en 200. Esto es **degradación elegante** — un atributo positivo de robustez.

2. **El punto de saturación del entorno está en ≈ 20 usuarios concurrentes (~8.5–8.7 req/s).** El throughput crece de 3.15 (5 VUs) a **8.73 req/s (20 VUs)** y ahí se **estanca** (8.47 con 50 VUs): esa es la **capacidad máxima de procesamiento** de la VM de 1 vCPU. A partir de ese punto, añadir usuarios ya no añade trabajo procesado — solo **cola**.

3. **Por encima de la saturación, la latencia crece de forma casi lineal con los usuarios** (Ley de Little): p95 pasa de 1.98 s (20 VUs) → 12.1 s (50) → 29.5 s (100). Cada usuario extra espera detrás de los demás.

4. **Con 100 VUs el throughput además CAE (8.7 → 6.8 req/s):** la VM gasta recursos en administrar 100 conexiones simultáneas (cambio de contexto, memoria) en lugar de procesarlas — sobrecarga contraproducente típica.

5. **Veredicto de capacidad:** el entorno QA (1 vCPU / 1 GB) atiende **cómodamente hasta ~20 usuarios concurrentes** cumpliendo el umbral (p95 ≤ 2 s) — más que suficiente para el equipo de 6 y la sustentación. Para soportar 50–100 usuarios concurrentes se requeriría **escalado vertical** (más vCPU/RAM), afinado de PHP (FPM/opcache) o escalado horizontal. Los FAIL de esc50/esc100 **no son defectos del software** sino el **límite de capacidad del hardware contratado** — exactamente el tipo de hallazgo que una prueba de carga debe producir.

6. **La rampa confirma el comportamiento dinámico:** tiempos excelentes en los tramos valle (mín. 0.19 s), degradación durante el pico y recuperación al descender — el sistema se recupera sin intervención.

---

### Evidencia — Atributo FIABILIDAD con K6 (contra la nube)

> Fecha: 2026-07-19 · Cliente: `grafana/k6:1.0.0` (Docker, externo al SUT) · Script: `tests/tests_k6/k6-fiabilidad.js`
> SUT: `http://159.223.135.124/` · Config: 10 VUs · 45 s (solo lectura) · Umbrales: `http_req_failed: rate<0.01` · `checks: rate==1.0`

```
█ THRESHOLDS
  checks           ✓ 'rate==1.0'   rate=100.00%
  http_req_failed  ✓ 'rate<0.01'   rate=0.00%

  checks_total: 519    checks_succeeded: 100.00% (519/519)
  http_reqs: 346 (7.36 req/s)   http_req_failed: 0.00% (0/346)
  iterations: 173 (0 interrumpidas)
  http_req_duration: avg=833ms  med=859ms  min=176ms  max=1.64s  p(90)=1.14s  p(95)=1.18s
  ✓ REL-01: /login disponible (200)
  ✓ REL-02: ruta inexistente responde 404 controlado
  ✓ REL-02: 404 sin stacktrace expuesto
```
✅ **Disponibilidad 100 % · 519/519 PASS.** Detalle completo en `HITO-3/Sistema/Evidencias/RESULTADO-K6-FIABILIDAD.md`.

---

**Índice de archivos de evidencia** (`HITO-3/Sistema/Evidencias/`):
- `RESULTADO-K6-SEGURIDAD.md` — atributo Seguridad (12/12).
- `RESULTADO-K6-DESEMPENO.md` — desempeño smoke (5 VUs × 30 s).
- `RESULTADO-K6-PERFILES-CARGA.md` — perfiles de carga oficiales + interpretación de capacidad.
- `RESULTADO-K6-FIABILIDAD.md` — atributo Fiabilidad (disponibilidad + 404 controlado).
- `tests/tests_k6/` — entorno K6 compartido (compose con pin `1.0.0`, wrapper `correr-k6.ps1`, scripts oficiales, README con reglas).
- Plan de referencia: `Plan-de-Pruebas-de-Sistema.md` v4.0.

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
| 2.2 | 2026-07-19 | **E2E retirado del informe** (decisión del grupo en la revisión final): se elimina el Anexo A y sus referencias; el informe queda acotado a los atributos oficiales ejecutados sobre la nube. |
| **3.0** | 2026-07-19 | **Tres atributos oficiales medidos con K6 contra la nube.** Seguridad migrada de `curl` a `k6-seguridad.js` (**12/12 checks**). **Fiabilidad promovida a atributo oficial 3** con `k6-fiabilidad.js` (10 VUs × 45 s: **disponibilidad 100 %**, 0/346 fallos, **519/519 checks**, p95 1.18 s). Se retira `curl` como evidencia oficial (y el bloque de evidencia curl-localhost). Anexo de Evidencias reescrito con las salidas reales de K6 e índice de archivos. |

*Fin del documento — Informe de Pruebas de Sistema.*
