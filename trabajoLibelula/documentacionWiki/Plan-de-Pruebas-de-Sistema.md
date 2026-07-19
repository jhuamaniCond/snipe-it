# Plan de Pruebas de Sistema

> Conforme a **ISO/IEC/IEEE 29119-3**. Nivel de **Sistema** del Modelo-V: **verificación** del sistema completo **desplegado**, desde su interfaz externa. Alcance oficial según la indicación final del docente: **dos atributos no funcionales** — **Seguridad y Desempeño** — ejecutados sobre el **entorno QA compartido en la nube**. La automatización E2E queda como **plus opcional** (Anexo A). Los resultados se reportan en el [Informe de Pruebas de Sistema](Informe-de-Pruebas-de-Sistema).

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas de Sistema — Snipe-IT |
| **Versión** | 3.0 (reestructurado: atributos oficiales al núcleo, E2E al Anexo) |
| **Hito / Sprint** | Hito 3 (Sprint 3–4) |
| **Nivel de prueba** | Sistema (caja negra sobre el sistema desplegado) |
| **Atributos oficiales** | **Seguridad** y **Desempeño** (ISO/IEC 25010, selección por riesgo) |
| **Herramientas** | `curl` (estados/cabeceras/TTFB) · **K6 `grafana/k6:1.0.0`** (carga con usuarios virtuales) |
| **Entorno QA oficial** | **VM DigitalOcean** — Ubuntu 24.04 LTS · 1 vCPU · 1 GB RAM · 25 GB SSD — Docker Compose (Snipe-IT + MariaDB 11.4.7) → **http://159.223.135.124/** |
| **Estándar** | ISO/IEC/IEEE 29119-3 · ISO/IEC 25010 |
| **Fecha** | 2026-07-09 |

---

## 1. Introducción y objetivos

Las pruebas de sistema validan el **producto completo desplegado** desde su interfaz externa, en un entorno representativo. La verificación **funcional** del sistema ya está cubierta por los niveles previos (caja negra manual CPF del Hito 2, integración del Hito 3); este plan concentra el nivel de sistema en los **atributos no funcionales de mayor riesgo**, medidos sobre el **entorno QA real en la nube** — el mismo que usa todo el equipo y que verá el docente.

**Objetivos:**
1. Verificar el atributo **Seguridad** (protección de rutas, cabeceras, sesión) sobre la URL pública.
2. Verificar el atributo **Desempeño** (latencia individual y **bajo carga concurrente con K6**) sobre la URL pública.
3. Confirmar que el sistema desplegado vía Docker en la nube se comporta según lo especificado.

---

## 2. Alcance

### 2.1 En alcance (oficial)
- **Seguridad** y **Desempeño** a nivel de sistema, contra `http://159.223.135.124/`.
- Verificaciones complementarias ya ejecutadas (Fiabilidad) se reportan como adicionales.

### 2.2 Fuera de alcance
- Funcionalidad interna (cubierta por unitarias/integración) y validación funcional por UI (cubierta por los CPF de caja negra manual).
- Estrés a gran escala (la VM QA es compartida, 1 vCPU/1 GB; ver riesgos RS-05/RS-06).
- Integraciones externas reales (LDAP/SAML/MTA).
- **E2E automatizado**: reclasificado como **plus opcional** por el docente → **Anexo A**.

---

## 3. Estrategia y herramientas

### 3.1 Arquitectura de medición: cliente FUERA del sistema bajo prueba

```
[PC del tester / CI]                         [VM DigitalOcean — QA]
  curl · K6 (clientes) ───── internet ─────►   Snipe-IT + MariaDB
  generan las peticiones                       (sistema bajo prueba, SUT)
```

- Las herramientas de prueba corren **fuera** de la VM: si el generador de carga corriera dentro, consumiría la CPU/RAM del propio servidor medido (**contaminaría la medición**) y mediría `localhost` sin latencia de red real.
- En la VM **no se instala ninguna herramienta**: solo vive el SUT (app + BD en Docker).

### 3.2 Herramientas (versiones compartidas)

| Herramienta | Uso | Versión / ejecución |
|---|---|---|
| `curl` | Estados HTTP, redirecciones, cabeceras, TTFB individual | nativo (Windows/Linux) |
| **K6** | **Carga con usuarios virtuales (VUs), percentiles (p95), umbrales** | **`grafana/k6:1.0.0` fijada** — vía Docker: `tests/tests_k6/` (compose + wrapper + README con reglas del grupo) |

### 3.3 Reglas de ejecución del grupo
1. K6 siempre desde la PC del tester (o CI), **nunca dentro de la VM**.
2. **Scripts de desempeño = endpoints de solo lectura** (no llenan la BD); si se prueba escritura, planificar limpieza.
3. No elevar la carga (>5 VUs) ni ejecutar K6 durante una sesión de caja negra de otro compañero, sin coordinar.

---

## 4. Selección de los DOS atributos oficiales y fundamentación

> Indicación del docente: *"tomar/aplicar solo dos atributos (ej. seguridad, desempeño, concurrencia, disponibilidad, usabilidad)"*. Selección por **riesgo** (probabilidad × impacto) sobre **ISO/IEC 25010**:

| Característica (25010) | Riesgo | Decisión |
|---|---|---|
| **Seguridad** | 🔴 Alto — datos de activos/usuarios, auth, permisos, FMCS, superficie web pública | ✅ **Atributo oficial 1** |
| **Desempeño (eficiencia)** | 🔴 Alto — datatables e inventarios crecientes; medible objetivamente; ahora incluye **concurrencia** vía K6 | ✅ **Atributo oficial 2** |
| Fiabilidad | 🟠 Medio | ➖ Complementaria (ya ejecutada, se reporta como adicional) |
| Usabilidad / Compatibilidad / Portabilidad | 🟢 Bajo (UI madura; web estándar; Docker) | ❌ Fuera |
| Mantenibilidad | — | ❌ Se evalúa por cobertura unitaria (Hito 2, 85 %) |

**Fundamentación:** (1) **Seguridad** es el atributo de mayor impacto: Snipe-IT gestiona activos, licencias y usuarios con control de acceso por políticas y multiempresa; el propio proyecto la prioriza en CI (CodeQL). (2) **Desempeño** es el atributo con mayor efecto en la operación diaria y el único plenamente **cuantificable** a nivel de sistema; con **K6** se añade la dimensión de **carga concurrente** (VUs, p95, tasa de error), superando la medición puntual de `curl`. Esta selección focalizada aplica el principio de **pruebas basadas en riesgo** de ISO 29119.

---

## 5. Casos de prueba de sistema (especificación)

### 5.1 Atributo oficial 1 — SEGURIDAD

| ID | Caso | Método | Resultado esperado |
|----|------|--------|--------------------|
| NF-SEC-01 | Ruta protegida sin sesión (`/hardware`, `/`) | `curl` sin autenticar contra la URL QA | **302 → `/login`**; sin exponer datos |
| NF-SEC-hdr | Cabeceras de seguridad en `/login` | `curl -D` | `X-Frame-Options: DENY` · `X-Content-Type-Options: nosniff` · `Referrer-Policy` · cookie `httponly/samesite` · token CSRF |
| NF-SEC-02 | Acción sin permiso (usuario limitado) | Navegador/HTTP autenticado como `alimitada` | **403** / control ausente |
| NF-SEC-03 | Logout invalida la sesión | Navegador: logout → volver a ruta protegida | Redirige a login |

### 5.2 Atributo oficial 2 — DESEMPEÑO

| ID | Caso | Método | Umbral |
|----|------|--------|--------|
| NF-PERF-01 | Latencia individual de páginas clave | `curl -w` (TTFB) contra la URL QA | **< 2 s** |
| NF-PERF-K6-smoke | Carga base (validación del entorno de medición) | K6: 5 VUs × 30 s | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-1** | **Configuración mínima 1** | **K6: 20 VUs × 30 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-2** | **Configuración mínima 2** | **K6: 50 VUs × 45 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-3** | **Configuración mínima 3** | **K6: 100 VUs × 60 s** | p95 < 2000 ms · errores < 1 % |
| **NF-PERF-K6-R** | **Escenario adicional de proyecto real: RAMPA** (llegada escalonada del personal: 0→20→50→100→0 VUs, 30 s/tramo) | K6 `ramping-vus` | p95 < 2000 ms · errores < 1 % |
| NF-PERF-02 | Listado con volumen (≈500 activos) | Medición con dataset sembrado | < 3 s |

> Por escenario se registran: **iteraciones, tiempo promedio, tiempo máximo, throughput (req/s), solicitudes exitosas, fallidas y % de errores** (requisito del docente), más p95 para el umbral. Script único parametrizado: `tests/tests_k6/k6-perfil-carga.js` (variable `PERFIL`). Escenario adicional justificado: en producción la carga **no aparece de golpe** — la rampa modela el patrón diario real de un sistema interno; alternativas documentadas: *spike* y *soak*.

### 5.3 Complementarias (fuera del alcance oficial, ya ejecutadas)

| ID | Atributo | Caso | Esperado |
|----|----------|------|----------|
| NF-REL-01 | Fiabilidad | Throttling de login (N+1 intentos) | Lockout tras el umbral |
| NF-REL-02 | Fiabilidad | Ruta inexistente | **404 controlado** sin stacktrace |

---

## 6. Entorno y dependencias

| Elemento | Configuración |
|----------|---------------|
| **Entorno QA oficial (SUT)** | VM DigitalOcean — Ubuntu 24.04 · 1 vCPU · 1 GB RAM · 25 GB SSD — Docker Compose (Snipe-IT + MariaDB 11.4.7) → `http://159.223.135.124/` |
| Acceso administrativo | SSH con clave privada (PowerShell/OpenSSH); clave y credenciales **fuera del repositorio** (`.gitignore`), por canal privado del grupo |
| Cliente de carga | K6 `1.0.0` vía Docker en la PC del tester (`k6/docker-compose.k6.yml` + `correr-k6.ps1`) |
| Datos | Los mismos datos QA de los guiones (RF-02…RF-11); los scripts K6 usan **solo lectura** |
| Entorno local (secundario) | `docker compose up -d` → `localhost:8000`, solo desarrollo/preparación |
| CI/CD | GitHub Actions (suites por push); job E2E como plus (Anexo A) |

---

## 7. Criterios de entrada y salida

### Entrada
- [x] Entorno QA en nube desplegado, accesible y con datos cargados.
- [x] Entorno K6 compartido con versión fijada (`1.0.0`) disponible para el grupo.

### Salida
- [ ] Casos de Seguridad (NF-SEC-*) ejecutados contra la URL QA; sin defectos altos abiertos.
- [ ] Casos de Desempeño (NF-PERF-01, **NF-PERF-K6**) ejecutados contra la URL QA; umbrales cumplidos.
- [ ] Desviaciones registradas como incidentes (GitHub Issues) y resultados en el **Informe**.

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

## Anexo A — Automatización E2E (plus opcional, no prioritario)

> El docente indicó que la automatización E2E **"ya no es prioridad"** (plus). Se conserva aquí lo implementado, con su estado transparente.

### A.1 Escenarios E2E diseñados (recorridos por navegador)

| ID | Escenario | RF |
|----|-----------|----|
| E2E-01 / 01b | Login válido / inválido | RF-09 |
| E2E-02 | Activo visible en la UI | RF-01 |
| E2E-03 | La UI ofrece checkout de activo disponible | RF-02 |
| E2E-04 | Checkin de activo | RF-03 |
| E2E-05 | Crear licencia con N asientos | RF-04 |
| E2E-06 | Logout | RF-09 |

### A.2 Implementación y estado

- **Herramienta:** Laravel Dusk (navegador Chrome real) — elegida por el stack PHP/Laravel (equivalente de Cypress/Playwright).
- **Código:** `tests/Browser/AuthenticationE2ETest.php`, `tests/Browser/AssetE2ETest.php`.
- **Infraestructura:** `trabajoLibelula/HITO-3/Sistema/docker-compose.e2e.yml` (Selenium/Chrome + app + MariaDB, red interna) y workflow CI `.github/workflows/e2e-dusk.yml` (runner Linux).
- **Estado:** stack verificado (levanta; Dusk conecta al navegador); **corrida verde pendiente** — la primera ejecución en CI falló y está en estabilización. En local (Windows) está bloqueada por el rendimiento del bind-mount de Docker. **No es exigible** para la presentación final.
- ⚠️ Dusk **trunca la base de datos**: jamás apuntarlo al entorno QA compartido con los datos de la sustentación; solo a BD desechables.

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

---

*Fin del documento — Plan de Pruebas de Sistema. Resultados en el Informe.*
