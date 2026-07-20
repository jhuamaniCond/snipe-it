# HITO 3 — Trabajo Final · Mapa de Entregables

**Curso:** Pruebas de Software · **Universidad Nacional de San Agustín (UNSA)** · 2026
**Producto bajo prueba:** Snipe-IT (gestión de activos de TI — PHP 8.2+/Laravel 12)

Este documento (Entregable 01) describe **dónde se encuentra cada artefacto** generado en el Hito 3 (pruebas de integración, de sistema y de aceptación), con las **URLs** de los artefactos publicados en GitHub y las rutas dentro del repositorio.

---

## Integrantes

| Nombres y Apellidos | Correo | Autoevaluación (% de esfuerzo en este hito) |
|---------------------|--------|:-------------------------------------------:|
| Wilson Josue Turpo Huanca | wturpoh@unsa.edu.pe | 90 % |
| Jeanpiero Sixto Huamani Condori | jhuamanicond@unsa.edu.pe | 88 % |
| Jhastyn Jefferson Payehuanca Riquelme | jpayehuancar@unsa.edu.pe | 80 % |
| Juan Sergio Zeballos Perez | jzeballosp@unsa.edu.pe | 75 % |
| Anette Isabel Gallegos Condori | agallegosco@unsa.edu.pe | 40 % |
| Jherson David Inca Moncca | jinca@unsa.edu.pe | 10% |

---

## Repositorio del proyecto

- **Repositorio (fork del grupo):** https://github.com/jhuamaniCond/snipe-it
- **Acceso para revisión:** se otorgaron los accesos necesarios a la cuenta del docente **https://github.com/robert-arisaca**.

---

## 1. Artefactos publicados en línea (URLs)

### 🌐 GitHub Page
**URL:** https://jhuamanicond.github.io/snipe-it/

Sitio web público de presentación del proyecto, publicado gratuitamente con GitHub Pages (convierte el contenido del repositorio en un sitio accesible desde internet). Muestra el **resumen del proceso de pruebas multinivel y sus resultados finales**: métricas de cobertura (85.14 %), casos de integración, los 3 atributos de sistema verificados con K6, el hallazgo del defecto **INC-02**, la línea de tiempo de hitos y los enlaces a todos los artefactos. Código fuente en la carpeta [`docs/`](https://github.com/jhuamaniCond/snipe-it/tree/master/docs) del repositorio.

### 📋 GitHub Project — Tablero Scrum
**URL:** https://github.com/users/jhuamaniCond/projects/2

Tablero Kanban/Scrum del equipo. Es donde se organiza todo el trabajo del hito: qué hay que hacer, quién lo hace y en qué estado está (To Do / In Progress / Done). Registra la planificación de los sprints de integración, sistema y aceptación.

### 📖 GitHub Wiki
**URL:** https://github.com/jhuamaniCond/snipe-it/wiki

Documentación colaborativa integrada en el repositorio, en formato Markdown, editable por todo el equipo. Contiene los **planes e informes de pruebas por nivel**, la matriz de trazabilidad y las evidencias. Páginas relevantes del Hito 3:

| Página | Contenido |
|--------|-----------|
| [Plan de Pruebas de Integración](https://github.com/jhuamaniCond/snipe-it/wiki/Plan-de-Pruebas-de-Integracion) | Estrategia, casos e inyección de fallas de integración. |
| [Informe de Pruebas de Integración](https://github.com/jhuamaniCond/snipe-it/wiki/Informe-de-Pruebas-de-Integracion) | Resultados de la suite (1 653 + 24 propios) y hallazgo INC-02. |
| [Plan de Pruebas de Sistema](https://github.com/jhuamaniCond/snipe-it/wiki/Plan-de-Pruebas-de-Sistema) | 3 atributos no funcionales (Seguridad, Desempeño, Fiabilidad) con K6. |
| [Informe de Pruebas de Sistema](https://github.com/jhuamaniCond/snipe-it/wiki/Informe-de-Pruebas-de-Sistema) | Resultados de K6 contra el entorno en la nube + evidencias. |
| [Plan de Pruebas de Aceptación](https://github.com/jhuamaniCond/snipe-it/wiki/Plan-de-Pruebas-de-Aceptacion) | 7 criterios de aceptación (ACC-01…07, UAT). |
| [Informe de Pruebas de Aceptación](https://github.com/jhuamaniCond/snipe-it/wiki/Informe-de-Pruebas-de-Aceptacion) | Acta de aceptación (UAT). |
| [Matriz de Trazabilidad](https://github.com/jhuamaniCond/snipe-it/wiki/Matriz-de-Trazabilidad) | Requisito ↔ caso ↔ evidencia ↔ resultado (4 niveles). |
| [Cobertura y Estado del Proyecto](https://github.com/jhuamaniCond/snipe-it/wiki/Cobertura-y-Estado-del-Proyecto) | Cobertura unitaria 85.14 % y estado global. |
| [Pipeline CI/CD](https://github.com/jhuamaniCond/snipe-it/wiki/Pipeline-CI-CD) · [Arquitectura DevOps](https://github.com/jhuamaniCond/snipe-it/wiki/Arquitectura-DevOps) | Automatización de pruebas en GitHub Actions. |

### ⚙️ GitHub Actions
**URL:** https://github.com/jhuamaniCond/snipe-it/actions

Automatización CI/CD: ejecuta tareas automáticas cada vez que se sube código al repositorio (compilar, correr las pruebas, análisis de seguridad). Workflows en verde relevantes al proyecto:

- **Unit Tests + Coverage** (`tests-unit-coverage.yml`) — suite unitaria con PHPUnit + PCOV sobre PHP 8.2/8.3/8.4; publica la cobertura (**85.14 %**, artefacto `clover.xml`).
- **Tests in MySQL** (`tests-mysql.yml`) — suite completa sobre MySQL.
- **CodeQL Security Scan** (`SA-codeql.yml`) — análisis estático de seguridad.

Definiciones de los pipelines en [`.github/workflows/`](https://github.com/jhuamaniCond/snipe-it/tree/master/.github/workflows).

---

## 2. Artefactos por nivel de prueba (rutas en el repositorio)

### 🔗 Pruebas de Integración
- **Casos propios (aporte del grupo):** [`tests/Feature/Integracion/`](https://github.com/jhuamaniCond/snipe-it/tree/master/tests/Feature/Integracion) — 24 casos, incluida la **inyección de fallas de interfaz**:
  - `AssetCheckoutInterfaceTest.php` — FI-01/FI-02/FI-03 (sintáctica, **semántica → INC-02**, de estado).
  - `FmcsCrossCompanyTest.php`, `LicenseSeatExhaustionTest.php`, `CustomFieldAssetTest.php`, `DepreciacionIntegracionTest.php`, `StatusLabelDisponibilidadTest.php`.
- **Entorno reproducible (Docker):** `trabajoLibelula/HITO-3/Integracion/` — `docker-compose.test.yml`, `Dockerfile.test`, `correr-tests.ps1`, `README-ENTORNO-DOCKER.md` (SQLite en memoria + MariaDB 11.4.7).
- **Evidencias:** `trabajoLibelula/HITO-3/Integracion/Evidencias/` — inventario de la suite, resultado de la corrida Docker y evidencia de la inyección de fallas FI-01/FI-02.

### 🛡️ Pruebas de Sistema (K6 contra la nube)
- **Scripts K6 (los 3 atributos):** [`tests/tests_k6/`](https://github.com/jhuamaniCond/snipe-it/tree/master/tests/tests_k6)
  - `k6-seguridad.js` — Seguridad (12 checks: 302, cabeceras, cookie httpOnly, CSRF).
  - `k6-desempeno.js` y `k6-perfil-carga.js` — Desempeño (smoke + perfiles 20/50/100 VUs y rampa).
  - `k6-fiabilidad.js` — Fiabilidad (disponibilidad + 404 controlado).
  - `docker-compose.k6.yml`, `correr-k6.ps1`, `README-K6.md` (versión fijada `grafana/k6:1.0.0`, cliente externo).
- **Evidencias:** `trabajoLibelula/HITO-3/Sistema/Evidencias/` — `RESULTADO-K6-SEGURIDAD.md`, `RESULTADO-K6-DESEMPENO.md`, `RESULTADO-K6-PERFILES-CARGA.md`, `RESULTADO-K6-FIABILIDAD.md`.
- **Entorno QA en la nube:** `trabajoLibelula/HITO-3/Despliegue-Nube/GUIA-DESPLIEGUE-NUBE.md` — VM DigitalOcean (Ubuntu 24.04, Docker: Snipe-IT + MariaDB) en `http://159.223.135.124/`.

### ✅ Pruebas de Aceptación
- **Documentación y guiones UAT (en la Wiki):** [Plan de Pruebas de Aceptación](https://github.com/jhuamaniCond/snipe-it/wiki/Plan-de-Pruebas-de-Aceptacion) e [Informe de Pruebas de Aceptación](https://github.com/jhuamaniCond/snipe-it/wiki/Informe-de-Pruebas-de-Aceptacion) — 7 criterios (ACC-01…ACC-07) en formato Dado–Cuando–Entonces, validados sobre el entorno QA en la nube.

### 🧪 Cobertura unitaria (referencia de niveles previos)
- **Cobertura de líneas:** 85.14 % (núcleo de dominio), medida en CI (`clover.xml`); ver [Cobertura y Estado del Proyecto](https://github.com/jhuamaniCond/snipe-it/wiki/Cobertura-y-Estado-del-Proyecto).

---

## 3. Entregable 02 — Artículo Técnico IEEE

El artículo técnico del proyecto en **formato IEEE** (versiones `.docx` y `.pdf`) se entrega por separado en la carpeta **`/HITO-3/`** de Google Drive, conforme al Entregable 02 de la ficha del hito.

---

## 4. Cómo reproducir (resumen)

```bash
# Pruebas de integración (entorno Docker del grupo)
cd trabajoLibelula/HITO-3/Integracion
docker compose -f docker-compose.test.yml up --build

# Pruebas de sistema (K6 contra la nube — cliente externo)
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-seguridad.js
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-fiabilidad.js

# Cobertura unitaria (igual que en CI)
vendor/bin/phpunit --testsuite Unit --coverage-clover coverage/clover.xml
```

---

*Entregable 01 — Hito 3 · Trabajo Final · Pruebas de Software · UNSA 2026.*
