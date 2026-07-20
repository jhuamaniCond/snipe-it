# Plan de Pruebas de Sistema

> Conforme a **ISO/IEC/IEEE 29119-3**. Nivel de **Sistema** del Modelo-V: **verificación** del sistema completo **desplegado**, desde su interfaz externa. Alcance: **tres atributos no funcionales** — **Seguridad, Desempeño y Fiabilidad** — todos medidos con **K6** como cliente **externo** contra el **entorno QA compartido en la nube**. Los resultados se reportan en el [Informe de Pruebas de Sistema](Informe-de-Pruebas-de-Sistema).

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas de Sistema — Snipe-IT |
| **Versión** | 4.0 (tres atributos oficiales; medición unificada con K6 contra la nube) |
| **Hito / Sprint** | Hito 3 (Sprint 3–4) |
| **Nivel de prueba** | Sistema|
| **Atributos oficiales** | **Seguridad**, **Desempeño** y **Fiabilidad** (ISO/IEC 25010, selección por riesgo) |
| **Herramienta oficial** | **K6 `grafana/k6:1.0.0`** (cliente externo): verifica seguridad (checks HTTP), desempeño (carga con VUs) y fiabilidad (disponibilidad + manejo de errores) contra la URL pública |
| **Entorno QA oficial** | **VM DigitalOcean** — Ubuntu 24.04 LTS · 1 vCPU · 1 GB RAM · 25 GB SSD — Docker Compose (Snipe-IT + MariaDB 11.4.7) → **http://159.223.135.124/** |
| **Estándar** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25010 |
| **Fecha** | 2026-07-19 |

---

## 1. Introducción y objetivos

Las pruebas de sistema validan el **producto completo desplegado** desde su interfaz externa, en un entorno representativo. La verificación **funcional** del sistema ya está cubierta por los niveles previos (caja negra manual CPF del Hito 2, integración del Hito 3); este plan concentra el nivel de sistema en los **atributos no funcionales de mayor riesgo**, medidos sobre el **entorno QA en la nube** — el mismo que usa todo el equipo y que verá el docente.

**Objetivos:**
1. Verificar el atributo **Seguridad** (protección de rutas, cabeceras, sesión) con **K6** sobre la URL pública.
2. Verificar el atributo **Desempeño** (latencia y **carga concurrente con K6**) sobre la URL pública.
3. Verificar el atributo **Fiabilidad** (disponibilidad bajo carga sostenida y manejo controlado de errores) con **K6** sobre la URL pública.
4. Confirmar que el sistema desplegado vía Docker en la nube se comporta según lo especificado.

---

## 2. Alcance

### 2.1 En alcance (oficial)
- **Seguridad**, **Desempeño** y **Fiabilidad** a nivel de sistema, medidos con **K6** contra `http://159.223.135.124/`.

### 2.2 Fuera de alcance
- Funcionalidad interna (cubierta por unitarias/integración) y validación funcional por UI (cubierta por los CPF de caja negra manual).
- Estrés a gran escala (la VM QA es compartida, 1 vCPU/1 GB; ver riesgos RS-05/RS-06).
- Integraciones externas reales (LDAP/SAML/MTA).
- **Automatización E2E por navegador**: retirada del alcance de este plan.

---

## 3. Estrategia y herramientas

### 3.1 Arquitectura de medición: cliente FUERA del sistema bajo prueba

```
[PC del tester / CI]                         [VM DigitalOcean — QA]
  K6 (cliente único) ─────── internet ─────►   Snipe-IT + MariaDB
  genera las peticiones                        (sistema bajo prueba, SUT)
```

- La herramienta de prueba corre **fuera** de la VM.
- En la VM **no se instala ninguna herramienta**: solo vive el SUT (app + BD en Docker).

### 3.2 Herramienta oficial: K6 (para los tres atributos)

**K6 no es solo un generador de carga.** Mediante `check()` sobre la respuesta HTTP (estado, cabeceras, cookies, cuerpo) verifica **seguridad** y **fiabilidad**; con usuarios virtuales (VUs) y umbrales (`thresholds`) mide **desempeño**. Por eso los tres atributos se cubren con una sola herramienta reproducible.

| Atributo | Cómo lo mide K6 | Script |
|---|---|---|
| **Seguridad** | `check()` sobre estado 302, cabeceras (`X-Frame-Options`…), cookie `httpOnly`, token CSRF | `k6-seguridad.js` |
| **Desempeño** | VUs concurrentes, percentiles (p95), throughput, % de error, umbrales | `k6-desempeno.js` · `k6-perfil-carga.js` |
| **Fiabilidad** | Disponibilidad (`http_req_failed`) bajo carga sostenida + 404 controlado | `k6-fiabilidad.js` |

Versión fijada **`grafana/k6:1.0.0`**, vía Docker en `tests/tests_k6/` (compose + wrapper `correr-k6.ps1` + README con reglas del grupo). Todos los scripts apuntan a `http://159.223.135.124/`.

> `curl` puede usarse para una comprobación **manual puntual** (p. ej. inspeccionar una cabecera al vuelo), pero **no es la evidencia oficial**: toda la evidencia del Informe proviene de las corridas de **K6 contra la nube**.

### 3.3 Reglas de ejecución del grupo
1. K6 siempre desde la PC del tester (o CI), **nunca dentro de la VM**.
2. **Todos los scripts = endpoints de solo lectura** (no llenan la BD); si se prueba escritura, planificar limpieza.
3. Los perfiles de carga altos (≥50 VUs) saturan la VM compartida (~1 min): **coordinar** antes de ejecutarlos y no correrlos durante la sesión de otro compañero.

---

## 4. Selección de los tres atributos oficiales y fundamentación

> Selección por **riesgo** (probabilidad × impacto) sobre **ISO/IEC 25010**, verificables de forma objetiva con K6 a nivel de sistema:

| Característica (25010) | Riesgo | Decisión |
|---|---|---|
| **Seguridad** | 🔴 Alto — datos de activos/usuarios, auth, permisos, FMCS, superficie web pública | ✅ **Atributo oficial 1** |
| **Desempeño (eficiencia)** | 🔴 Alto — datatables e inventarios crecientes; medible objetivamente; incluye **concurrencia** vía K6 | ✅ **Atributo oficial 2** |
| **Fiabilidad** | 🟠 Medio-Alto — disponibilidad del servicio compartido y manejo de errores frente a peticiones inválidas | ✅ **Atributo oficial 3** |
| Usabilidad / Compatibilidad / Portabilidad | 🟢 Bajo (UI madura; web estándar; Docker) | ❌ Fuera |
| Mantenibilidad | — | ❌ Se evalúa por cobertura unitaria (Hito 2, 85 %) |

**Fundamentación:** (1) **Seguridad** es el atributo de mayor impacto: Snipe-IT gestiona activos, licencias y usuarios con control de acceso por políticas y multiempresa; el propio proyecto la prioriza en CI (CodeQL). (2) **Desempeño** es el atributo con mayor efecto en la operación diaria y plenamente **cuantificable**; con **K6** se añade la dimensión de **carga concurrente** (VUs, p95, tasa de error). (3) **Fiabilidad** cierra la terna: en un servicio compartido interesa medir empíricamente que el sistema **se mantiene disponible bajo carga sostenida** (tasa de fallo del servidor) y que **maneja los errores de forma controlada** (404 sin filtrar trazas), ambas cosas medibles con K6 sin instrumentar el SUT. Esta selección aplica el principio de **pruebas basadas en riesgo** de ISO 29119.

---

## 5. Casos de prueba de sistema

### 5.1 Atributo 1 — SEGURIDAD (`k6-seguridad.js`, 1 VU · 1 iteración)

| ID | Caso | Método K6 | Resultado esperado |
|----|------|-----------|--------------------|
| NF-SEC-01 | Rutas protegidas sin sesión (`/`, `/hardware`) | `http.get({redirects:0})` + `check()` sobre estado y `Location` | **302 → `/login`**; cuerpo sin `asset_tag` (no expone datos) |
| NF-SEC-hdr | Cabeceras de seguridad y sesión en `/login` | `check()` sobre `res.headers` y `res.cookies` | `X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` · `Referrer-Policy` presente · cookie `snipeit_session` **httpOnly** · cookie CSRF `XSRF-TOKEN` · campo `_token` en el formulario |
| NF-SEC-02 | Acción sin permiso (usuario limitado) | Navegador/HTTP autenticado como `alimitada` (UAT, complementa) | **403** / control ausente |
| NF-SEC-03 | Logout invalida la sesión | Navegador: logout → volver a ruta protegida (UAT, complementa) | Redirige a login |

> Umbral: `checks: rate==1.0` (las 12 verificaciones de seguridad deben cumplirse). NF-SEC-02/03 se validan además en la UAT de aceptación por requerir sesión autenticada.

### 5.2 Atributo 2 — DESEMPEÑO

| ID | Caso | Método | Umbral |
|----|------|--------|--------|
| NF-PERF-K6-smoke | Carga base (validación del entorno de medición) | K6: 5 VUs × 30 s (`k6-desempeno.js`) | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-1** | **Configuración mínima 1** | **K6: 20 VUs × 30 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-2** | **Configuración mínima 2** | **K6: 50 VUs × 45 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-3** | **Configuración mínima 3** | **K6: 100 VUs × 60 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-R** | **Escenario adicional de proyecto: RAMPA** (llegada escalonada del personal: 0→20→50→100→0 VUs, 30 s/tramo) | K6 `ramping-vus` | p95 < 2000 ms · errores < 1 % |

> Por escenario se registran: **iteraciones, tiempo promedio, tiempo máximo, throughput (req/s), solicitudes exitosas, fallidas y % de errores** (requisito del docente), más p95 para el umbral. Script único parametrizado: `tests/tests_k6/k6-perfil-carga.js` (variable `PERFIL`). Escenario adicional justificado: en producción la carga **no aparece de golpe** — la rampa modela el patrón diario real de un sistema interno; alternativas documentadas: *spike* y *soak*.

### 5.3 Atributo 3 — FIABILIDAD (`k6-fiabilidad.js`, 10 VUs · 45 s)

| ID | Caso | Método K6 | Umbral / esperado |
|----|------|-----------|-------------------|
| NF-REL-01 | **Disponibilidad / madurez**: el sistema responde estable bajo carga moderada sostenida | K6 10 VUs × 45 s a `/login`; se mide `http_req_failed` | **Disponibilidad ≥ 99 %** (`http_req_failed` < 1 %) |
| NF-REL-02 | **Tolerancia a fallos**: ruta inexistente | `http.get('/ruta-inexistente-k6')` + `check()` | **404 controlado**, sin stacktrace en el cuerpo |

> Medición: los estados 200/302/404 se declaran como *respuestas controladas esperadas* (`http.expectedStatuses`), para que `http_req_failed` refleje solo fallos reales del servidor (5xx/timeout) = disponibilidad. Umbrales combinados: `http_req_failed: rate<0.01` y `checks: rate==1.0`.

---

## 6. Entorno y dependencias

| Elemento | Configuración |
|----------|---------------|
| **Entorno QA oficial (SUT)** | VM DigitalOcean — Ubuntu 24.04 · 1 vCPU · 1 GB RAM · 25 GB SSD — Docker Compose (Snipe-IT + MariaDB 11.4.7) → `http://159.223.135.124/` |
| Acceso administrativo | SSH con clave privada (PowerShell/OpenSSH); clave y credenciales **fuera del repositorio** (`.gitignore`), por canal privado del grupo |
| Cliente de prueba (único) | K6 `1.0.0` vía Docker en la PC del tester (`tests/tests_k6/docker-compose.k6.yml` + `correr-k6.ps1`) — scripts: `k6-seguridad.js`, `k6-desempeno.js`, `k6-perfil-carga.js`, `k6-fiabilidad.js` |
| Datos | Los mismos datos QA de los guiones (RF-02…RF-11); **todos** los scripts K6 usan **solo lectura** |
| Entorno local (secundario) | `docker compose up -d` → `localhost:8000`, solo desarrollo/preparación |
| CI/CD | GitHub Actions (suites de pruebas por push) |

---

## 7. Criterios de entrada y salida

### Entrada
- [x] Entorno QA en nube desplegado, accesible y con datos cargados.
- [x] Entorno K6 compartido con versión fijada (`1.0.0`) disponible para el grupo.

### Salida
- [x] Casos de Seguridad (NF-SEC-01, NF-SEC-hdr) ejecutados con K6 contra la URL QA; 12/12 checks; sin defectos altos abiertos.
- [x] Casos de Desempeño (**NF-PERF-K6**-smoke/1/2/3/R) ejecutados con K6 contra la URL QA; resultados registrados.
- [x] Casos de Fiabilidad (NF-REL-01, NF-REL-02) ejecutados con K6 contra la URL QA; disponibilidad ≥ 99 % y 404 controlado.
- [ ] Desviaciones registradas como incidentes (GitHub Issues) y resultados consolidados en el **Informe**.

---

## 8. Riesgos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| RS-01 | Medición contaminada por correr el generador dentro del SUT | **Prohibido**: K6 siempre externo (§3.1) |
| RS-02 | Tiempos dependientes de la red del tester | Reportar percentiles (p95) y n.º de muestras; misma versión K6 para todos |
| RS-03 | Datos residuales de pruebas | Scripts K6 de **solo lectura**; escritura solo con plan de limpieza |
| RS-04 | Sesiones simultáneas del grupo interfieren | Coordinar: no correr K6 durante caja negra manual de otro integrante |
| RS-05 | VM de 1 GB se degrada bajo carga alta | Carga oficial = smoke (5 VUs); estrés solo coordinado, con swap/resize previo |
| RS-06 | Caída del entorno QA cerca de la sustentación | Verificar 2 días antes; plan B: túnel `cloudflared` sobre Docker local |

---

## 9. Trazabilidad

Los casos NF-SEC-* y NF-PERF-* trazan al atributo correspondiente de **ISO/IEC 25010** y a los requisitos de calidad del sistema; la validación funcional traza vía CPF-XX/INT-XX en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-12 | Plan inicial (categorías SYS-01…SYS-07). |
| 2.0 | 2026-07-08 | Refinado a E2E automatizado + selección no-funcional por riesgo (3 características). |
| 2.1 | 2026-07-09 | Dos atributos oficiales (Seguridad + Desempeño) por indicación del docente; E2E reclasificado plus. |
| 2.2 | 2026-07-09 | Entorno de staging oficial migrado a la nube (VM DigitalOcean). |
| **3.0** | 2026-07-09 | **Reestructuración completa**: atributos oficiales + **K6 (`1.0.0` fijada, cliente externo)** como núcleo del plan, todo contra el entorno QA en nube; caso **NF-PERF-K6** (5 VUs × 30 s); reglas de ejecución del grupo; riesgos RS-01…06; **E2E desplazado al Anexo A** (plus opcional). |
| 3.1 | 2026-07-09 | **Perfiles de carga oficiales del docente** (NF-PERF-K6-1/2/3: 20×30 s, 50×45 s, 100×60 s) + **escenario adicional de proyecto real NF-PERF-K6-R (rampa)** con justificación; métricas de registro por escenario (iteraciones, promedio, máximo, throughput, exitosas/fallidas, % errores). |
| 3.2 | 2026-07-19 | **E2E retirado del plan** (decisión del grupo en la revisión final, en línea con el docente): se elimina el Anexo A y toda referencia; la validación funcional del sistema se cubre con CPF (caja negra manual) y UAT (aceptación). |
| **4.0** | 2026-07-19 | **Tres atributos oficiales** (Seguridad, Desempeño, **Fiabilidad**) y **medición unificada con K6 como cliente externo contra la nube**. `curl` deja de ser evidencia oficial (solo verificación manual puntual). Seguridad y Fiabilidad pasan a scripts K6 propios (`k6-seguridad.js`, `k6-fiabilidad.js`) con `check()` sobre estado/cabeceras/cookies y disponibilidad/manejo de errores; NF-REL sube de complementario a atributo oficial 3. |

---

*Fin del documento — Plan de Pruebas de Sistema. Resultados en el Informe.*
