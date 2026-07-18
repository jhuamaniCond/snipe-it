# Resumen de arquitectura, tamaño y tipos de prueba — Snipe-IT

> Documento base para las pruebas del Hito 3 (integración, sistema y aceptación).
> Métricas medidas directamente sobre el código (excluye `trabajoLibelula/`, `docs/`, `vendor/` y los assets compilados de `public/`). Medición original: 2026-07-04 · **Re-verificado: 2026-07-09 (v2)** — todas las cifras confirmadas; solo variaron las de `tests/` por el **aporte propio del grupo** (ver §5).
> **Líneas físicas** (`wc -l`, incluyen blancos y comentarios); el SLOC "puro" sería ~30–40 % menor.

---

## 1. Tamaño del sistema (KLOC)

| Capa | Carpetas | Líneas | ≈ KLOC |
|---|---|---:|---:|
| **Backend (lógica PHP)** | `app/` (87 126) + `routes/` (3 054) + `database/` (4 965) + `config/` (4 401) | **99 546** | ~99.5 |
| **Frontend / presentación** | `resources/views/` Blade (39 069) + `resources/assets/js` (4 246) + `resources/assets/less` (4 214) | **47 529** | ~47.5 |
| **Producción total (sin tests)** | — | **~147 075** | **~147 KLOC** |
| Código de pruebas | `tests/` | 54 714 *(53 566 heredadas + ~1 148 del grupo)* | ~54.7 |

- Producción ≈ **147 KLOC físicas** (≈ 90–100 KLOC de SLOC efectivo).
- Reparto: **backend ~2/3**, **presentación ~1/3**.

---

## 2. Backend vs Frontend

Snipe-IT es un **monolito MVC renderizado en servidor** (Laravel 12 / PHP 8.2+). **No** es un SPA; no usa React/Vue como framework de UI.

### Backend (PHP / Laravel)
- `app/`: Models (**41**), Http/Controllers (**61 web + 30 API**), Policies (**22**), Middleware, Requests, Presenters, Transformers, Services, Jobs, Events, Listeners, Observers, Mail, Notifications, Rules, Providers, Console, Importer, Helpers, Enums, Traits.
- `routes/` (web + api), `database/` (migraciones/factories/seeders), `config/`.

### Frontend / capa de presentación
- `resources/views/`: plantillas **Blade** (render en servidor, **AdminLTE 2 / Bootstrap 3**).
- `resources/assets/js`: JS propio (jQuery + `snipeit.js`, select2, Chart.js v2). ~4.2 KLOC.
- `resources/assets/less` + `css`: estilos.
- `public/`: bundles **compilados** por Laravel Mix (no es fuente; no cuenta como KLOC propio).
- `app/Livewire/` (**8** componentes): híbrido — UI reactiva **manejada desde PHP**.

### Capas técnicas transversales ("lo que sobra")
Ni negocio-back ni UI-front, son infraestructura/soporte: `Console` (comandos artisan), `Jobs`, `Events`/`Listeners`, `Observers`, `Mail`, `Notifications`, `Providers`, `Exceptions`, `Rules` (validación), `Traits`, `Helpers`, `Services`, `Enums`, `Http/Middleware`.

---

## 3. Módulos / subsistemas (~22 funcionales)

Referencia: recursos de negocio (modelos + controladores + las 22 policies de autorización).

Assets · Asset Models · Licenses · License Seats · Accessories · Consumables · Components · Predefined Kits · Users · Groups · Departments · Locations · Companies · Categories · Manufacturers · Suppliers · Depreciations · Status Labels · Custom Fields/Fieldsets · Maintenances · Reports / Report Templates · Settings.

Subsistemas de soporte: Dashboard · Setup · Auth (login / 2FA / LDAP / SAML) · Importer · Action Log / History · Notifications.

---

## 4. ¿Las pruebas unitarias y la cobertura son de back o de front?

**Del backend (PHP).** Se ejecutan con **PHPUnit + PCOV**; el `<source>` de `phpunit.xml` apunta a `app/`.
El **frontend no tenía pruebas automatizadas en el proyecto original**: no hay Jest, Vitest, Cypress ni Playwright (verificado en `package.json`). **Actualización (v2):** el **grupo añadió Laravel Dusk** en el Hito 3 (`composer.json` dev + `tests/Browser/`, 2 archivos E2E) — pruebas de **nivel sistema por navegador real**, no de "frontend aislado". Las vistas Blade se ejercitan **indirectamente** cuando un Feature test renderiza una página, pero la **cobertura sigue midiendo código PHP**.

---

## 5. Tipos de prueba en el repositorio

| Carpeta | # archivos `*Test.php` | Qué son |
|---|---:|---|
| `tests/Unit` | **168** | **Pruebas unitarias** puras: aíslan clases/métodos (Models, Presenters, Transformers, Rules, Helpers, Policies). |
| `tests/Feature` | **298** *(292 heredadas + **6 del grupo** en `Integracion/`, 24 métodos: FI-01/02/03, CPF-08, INT-07/11/12/13)* | **Pruebas de integración / funcionales** a nivel de aplicación (HTTP). Total: 1 533 métodos. |
| `tests/Browser` *(nuevo, del grupo)* | **2** | **Pruebas de SISTEMA (E2E)** con **Laravel Dusk**: navegador Chrome real contra la app desplegada (login/logout, activos). Corren vía Selenium en Docker/CI, no con `artisan test`. |

### `tests/Feature` en detalle
En la terminología de Laravel son *"Feature tests"*. Patrón real (ej. `AccessoryCheckoutTest`): `actingAs(...)->post(route(...))`, **factories + base de datos real**, aserciones sobre respuesta HTTP, estado en BD, correos y eventos.

| Criterio | Clasificación |
|---|---|
| **Nivel** | Integración / funcional (arrancan framework + rutas + BD; combinan varias unidades). NO unitarias. |
| **Caja** | Técnicamente **caja blanca/gris** (las escriben devs conociendo el código), pero ejercitan el sistema por su **interfaz externa** (rutas web/API) → comportamiento tipo **caja negra en el límite**. |
| **NO son** | Pruebas de **sistema E2E** (no hay navegador/Selenium/Dusk) ni de **aceptación** formal (no hay Gherkin/BDD ni firma de negocio automatizada). |

> Los casos **CPF** ejecutados manualmente (wiki, Hito 2) son **pruebas funcionales de caja negra manuales**, independientes de `tests/Feature`.

---

## 6. Implicaciones para las PRUEBAS DE INTEGRACIÓN (Hito 3)

- **Ya existe una base de integración** en `tests/Feature` (292 archivos). Conviene **apoyarse y extenderla**, no reinventar: mismo estilo (`TestCase`, factories, HTTP).
- **Puntos de integración naturales a cubrir** (flujos entre módulos):
  - Checkout/Checkin de Asset ↔ **Licenses/LicenseSeats** (liberación de asientos), ↔ **Users/Locations**, ↔ **Action Log/History**.
  - **Accessories/Consumables/Components** ↔ Users/Assets (pivotes de checkout, decremento de stock).
  - **Categories/Manufacturers/Models** ↔ Assets (integridad referencial, borrado con dependencias).
  - **Custom Fields/Fieldsets** ↔ Assets (validación dinámica, encriptación).
  - **Settings (FMCS)** ↔ scoping por compañía en múltiples módulos.
  - **Auth** (login/2FA/LDAP) ↔ permisos/policies ↔ acceso a recursos.
  - **Importer** ↔ creación masiva de entidades.
  - **API v1** ↔ Transformers ↔ persistencia.
- **Herramientas disponibles:** PHPUnit ^11, factories, DB (MySQL/Postgres/SQLite en CI), y los workflows de GitHub Actions (`tests-mysql.yml`, `tests-postgres.yml`, `tests-sqlite.yml`, `tests-unit-coverage.yml`).
- **Frontend:** al no haber framework de pruebas JS, la integración de UI se valida **server-side** (Feature tests que renderizan Blade) o **manualmente** (caja negra).

---

## 7. Entregables HITO 3 (Sprint 3–4) — mapa y estado real

> Enunciado del curso: *"plan e informe de pruebas de **sistema** y **aceptación** con **despliegue CI/CD automatizado**, documentación técnica de todo el proceso"* (100 % del trabajo, 08.JUL). Estado verificado al 2026-07-09.

### 7.1 Nivel Integración (Sprint 3 — COMPLETADO)

| Entregable | Artefacto | Estado |
|---|---|---|
| Plan de Pruebas de Integración | `documentacionWiki/Plan-de-Pruebas-de-Integracion.md` v1.3 | ✅ |
| Informe de Pruebas de Integración | `documentacionWiki/Informe-de-Pruebas-de-Integracion.md` v1.2 | ✅ (24 casos propios; defecto real INC-02 hallado y corregido) |
| Código de pruebas propio | `tests/Feature/Integracion/` (6 archivos / 24 métodos) | ✅ verdes (SQLite 24/24 · MariaDB 19+5 por diseño) |
| Entorno común reproducible | `HITO-3/Integracion/docker-compose.test.yml` (`test`/`test-mysql`) | ✅ |

### 7.2 Nivel Sistema (Sprint 3–4 — PARCIAL)

| Entregable | Artefacto | Estado |
|---|---|---|
| Plan de Pruebas de Sistema (E2E + no funcionales por riesgo ISO 25010) | `Plan-de-Pruebas-de-Sistema.md` v2.0 | ✅ |
| Informe de Pruebas de Sistema | `Informe-de-Pruebas-de-Sistema.md` v1.2 | 🟡 No funcionales **4/4 PASS reales** (seguridad/rendimiento/fiabilidad); **E2E aún no verdes** |
| Código E2E (Dusk) | `tests/Browser/` (2 archivos) + `HITO-3/Sistema/docker-compose.e2e.yml` (Selenium) | 🟡 Implementado; CI `e2e-dusk.yml` **falló — en estabilización** |
| NF pendientes | NF-SEC-02 (403), NF-PERF-02 (dataset 500), NF-REL-01 (throttling) | 🕗 |

### 7.3 Nivel Aceptación (Sprint 4 — POR HACER)

| Entregable | Enfoque recomendado | Estado |
|---|---|---|
| Plan de Pruebas de Aceptación | UAT: criterios de aceptación por RF (reutilizar/formalizar los **CPF de caja negra** del Hito 2, opcionalmente en Gherkin), ejecutados por un "usuario" sobre el **entorno QA compartido** | ❌ Por crear |
| Informe de Pruebas de Aceptación | Veredictos UAT + evidencias sobre la URL compartida | ❌ Por crear |

### 7.4 Despliegue CI/CD y entorno QA en nube

| Entregable | Artefacto | Estado |
|---|---|---|
| CI de pruebas (unit/integración) | Workflows `tests-{sqlite,mysql,postgres}.yml`, `tests-unit-coverage.yml` | ✅ activos |
| CI de E2E | `.github/workflows/e2e-dusk.yml` | 🟡 creado; primera corrida falló |
| **Entorno QA compartido en nube** (URL pública p/ caja negra, UAT y demo) | Guía Railway: `HITO-3/Despliegue-Nube/GUIA-DESPLIEGUE-NUBE.md` (Vercel descartado con justificación técnica: PHP+MySQL+FS persistente, `vendor/`=263 MB > límite 250 MB) | 🕗 Por desplegar (plan B: túnel cloudflared) |

### 7.5 HITO 4 — Sustentación y entrega final (16/17 JUL)

| Entregable | Contenido | Estado |
|---|---|---|
| **Artículo formato IEEE** | Resumen+keywords · Introducción (contexto/problema/objetivos) · Propuesta (proceso 29119 + Scrum/DevOps, niveles unitario→funcional→integración→sistema→aceptación, entornos Docker/CI/nube) · Resultados (85 % cobertura, 1 533 métodos Feature, 24 casos propios, INC-02, NF 4/4, estado E2E) · Conclusiones · Bibliografía (IEEE: 29119, 25010, Spillner, Myers) | ❌ Por redactar — **los `.md` ya están actualizados como fuente** |
| Presentación/defensa | Todas las herramientas: Projects, Issues, Actions, Wiki, Pages + demo sobre la URL QA | 🕗 |
| Wiki actualizada | Publicar los Planes/Informes v. finales de Sistema (y Aceptación cuando exista) | 🕗 |

### 7.6 Requisitos FINALES de la presentación (indicación del docente, 2026-07-09)

> Esta lista **actualiza las prioridades** de §7.1–7.5:

| Requisito obligatorio | Estado nuestro |
|---|---|
| Unitarias, funcionales, **cobertura ≥ 85 %** | ✅ 85.14 % |
| Integración terminada (**APIs críticas**) | ✅ 24 casos propios + suite `*/Api/*` heredada (112 archivos) |
| Sistema con **SOLO DOS atributos** no funcionales | ⚠️ Teníamos 3 → **oficiales: Seguridad + Desempeño** (con evidencia real 4/4); Fiabilidad queda como verificación complementaria ya ejecutada |
| Automatización con **GitHub Actions** | ✅ (tests 3 BD + coverage + CodeQL) |
| **Artículo Técnico IEEE** (no de investigación), 6–8 págs, sin errores | ❌ **PRIORIDAD #1** — los `.md` actualizados son la materia prima |

| Plus (opcional) | Estado nuestro |
|---|---|
| Artículo + sustentación en inglés | ❌ decisión del grupo |
| **E2E (Selenium/Cypress/Playwright) — "ya no es prioridad"** | 🟡 **Plus parcial ya logrado**: Dusk+Selenium implementado (tests/Browser, compose E2E, workflow CI); corrida verde no exigible |
| SonarQube unido al pipeline | ❌ opcional (evaluar si sobra tiempo) |

**Notas de alcance:** (1) **Aceptación ya no figura** en los requisitos finales — se retira de la ruta crítica (los CPF manuales del Hito 2 cubren la validación funcional). (2) El E2E deja de ser bloqueante: lo implementado se presenta como **plus**, con su estado transparente.

### 7.7 Ruta crítica FINAL (de aquí al 16/17)

1. **Artículo IEEE** (6–8 págs, formato correcto) — prioridad absoluta; fuente: los Informes ya actualizados.
2. **Ajustar Plan/Informe de Sistema a 2 atributos oficiales** (Seguridad + Desempeño) — hecho en v2.1/v1.3.
3. *(Refuerzo recomendado)* **K6** para el atributo Desempeño (el docente lo mencionó en la bibliografía) sobre la URL/Docker.
4. Wiki actualizada + video + (opcional) inglés / SonarQube si sobra tiempo.

---

*Resumen técnico base — Hito 3–4 (Integración, Sistema, Aceptación y entrega final). v2, re-verificado 2026-07-09. Curso de Pruebas de Software.*
