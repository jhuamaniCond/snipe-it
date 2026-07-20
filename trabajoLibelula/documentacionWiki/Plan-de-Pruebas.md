# Plan de Pruebas

> Conforme a **ISO/IEC/IEEE 29119-2** (proceso de organización/proyecto) y **29119-3** (documentación). **Plan maestro** que consolida el catálogo de requisitos —**funcionales (RF)** y **no funcionales (RNF)**— y el panorama general del proceso de pruebas de Snipe-IT. Cada nivel de prueba se detalla en su propio Plan/Informe (documentos de nivel, ISO 29119-3), enlazados en §5.

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas — Snipe-IT (Plan Maestro) |
| **Versión** | 1.0 |
| **Hito / Sprint** | Hito 1/ Sprint 1, Hito 2 / Sprint 2, Hito 3 / Sprint 3 e Hito 4 / Sprint 4  |
| **Alcance** | Catálogo de RF y RNF; panorama de los niveles unitario, caja negra, integración, sistema y aceptación |
| **Reemplaza a (parcialmente)** | `Diseno-de-Casos-de-Pruebas-Funcionales.md` v2.1 §3 (catálogo de RF, ahora aquí) |
| **Repositorio** | `jhuamaniCond/snipe-it` (PHP 8.2+ / Laravel 12) |
| **Estándar** | ISO/IEC/IEEE 29119-2 · 29119-3 |
| **Fecha de elaboración** | 2026-07-20 |

---

## 1. Propósito

Este documento es el **plan maestro** de pruebas del proyecto: consolida en un solo lugar (a) el **catálogo de requisitos** —funcionales y no funcionales— que todo el proceso de pruebas traza, y (b) el **panorama de los niveles de prueba** aplicados, delegando el detalle técnico específico de cada nivel a su Plan/Informe correspondiente.

**Motivo de esta reestructuración:** hasta la v2.1, el catálogo de requisitos funcionales vivía embebido en el documento de diseño de caja negra (`Diseno-de-Casos-de-Pruebas-Funcionales.md`), lo que generaba confusión: un catálogo **transversal** (usado también por integración, sistema y aceptación para trazar sus propios casos) parecía pertenecer únicamente al nivel funcional manual. Este documento **separa el catálogo general del diseño específico de caja negra**, que ahora vive en el [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra). De paso, se introduce el **catálogo de RNF** (§4), que antes no tenía un lugar propio y quedaba disperso dentro del Plan de Sistema.

---

## 2. Alcance y delimitación

Snipe-IT comprende **~20 subsistemas** (activos, licencias, consumibles, accesorios, componentes, mantenimientos, importación, reportes, campos personalizados, etc.). Por tratarse de un proceso de pruebas académico, el alcance se delimitó de forma deliberada a los **5 subsistemas núcleo de cara al usuario** —Acceso, Activos, Licencias, Inventario, Usuarios y Checkout— seleccionados y justificados en [Hito 1 — Presentación del Producto](Hito-1-Presentacion-del-Producto) §2 y §4. Esta delimitación se sostiene a lo largo de los tres hitos y es la base de los **11 requisitos funcionales** (§3) y de los **3 atributos no funcionales** (§4) que este plan traza.

---

## 3. Catálogo de Requisitos Funcionales (RF)

> Catálogo canónico: toda referencia a `RF-XX` en cualquier documento de esta Wiki (diseño de caja negra, matriz de integración, criterios de aceptación) apunta a esta tabla. El diseño **específico** de casos de caja negra (técnicas de prueba aplicadas por requisito) se detalla en el [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra) §3–§5.

| ID Req. | Requisito funcional | Subsistema | Ruta / acción verificada | Niveles que lo cubren |
|---------|---------------------|------------|---------------------------|------------------------|
| **RF-01** | Registrar un activo con etiqueta (*asset tag*) única | Activos | `hardware.store` | Caja negra (CPF-01/02) · Integración (INT-01) |
| **RF-02** | Asignar un activo a un destino (checkout) | Activos / Checkout | `hardware.checkout.store` | Caja negra (CPF-03) · Integración (INT-01, FI-01/02) |
| **RF-03** | Devolver un activo asignado (checkin) | Activos / Checkout | `hardware.checkin.store` | Caja negra (CPF-04) · Integración (INT-02, FI-03) |
| **RF-04** | Crear una licencia con un número definido de asientos | Licencias | `licenses.store` | Caja negra (CPF-06) · Integración (INT-04) |
| **RF-05** | Asignar un asiento de licencia a un usuario o activo | Licencias | `licenses.checkout` | Caja negra (CPF-07/08) · Integración (INT-04, CPF-08 automatizado) |
| **RF-06** | Descontar stock de un consumible al asignarlo | Inventario | `consumables.checkout.store` | Caja negra (CPF-09) · Integración (INT-05) |
| **RF-07** | Impedir la eliminación de una categoría con elementos asociados | Categorías | `categories.destroy` | Caja negra (CPF-10/11) |
| **RF-08** | Reflejar la disponibilidad del activo según su *status label* | Activos | `availableForCheckout()` / `getStatuslabelType()` | Caja negra (CPF-05) · Integración (INT-13) |
| **RF-09** | Autenticar a un usuario (login / logout) | Acceso | `login` (POST) / `logout` | Caja negra (CPF-12) · Sistema (NF-SEC) |
| **RF-10** | Registrar y editar un usuario | Usuarios | `users.store` / `users.update` | Caja negra (CPF-13) |
| **RF-11** | Asignar y devolver un accesorio (checkout/checkin) | Accesorios / Checkout | `accessories.checkout.store` / `accessories.checkin.store` | Caja negra (CPF-14/15) |

---

## 4. Catálogo de Requisitos No Funcionales (RNF)

> Selección por **riesgo** (probabilidad × impacto) sobre el modelo de calidad **ISO/IEC 25010**, verificados a nivel de **Sistema**. La fundamentación completa de por qué se eligieron estos tres y se descartaron el resto (Usabilidad, Compatibilidad, Portabilidad, Mantenibilidad) está en el [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) §4; aquí se resume el catálogo canónico.

| ID Req. | Requisito no funcional | Característica ISO 25010 | Verificación | Nivel que lo cubre |
|---------|------------------------|---------------------------|---------------|---------------------|
| **RNF-01** | El sistema debe proteger rutas y datos frente a acceso no autenticado/no autorizado, exponer cabeceras de seguridad correctas y proteger la sesión (CSRF, cookie httpOnly) | **Seguridad** | K6 (`k6-seguridad.js`): checks HTTP sobre estado, cabeceras, cookies | Sistema (NF-SEC-01…03) |
| **RNF-02** | El sistema debe responder dentro de umbrales aceptables de latencia bajo carga concurrente | **Desempeño (eficiencia)** | K6 (`k6-desempeno.js`, `k6-perfil-carga.js`): VUs concurrentes, percentiles (p95), throughput | Sistema (NF-PERF-K6) |
| **RNF-03** | El sistema debe mantenerse disponible bajo carga sostenida y manejar los errores de forma controlada (sin exponer trazas) | **Fiabilidad** | K6 (`k6-fiabilidad.js`): tasa de fallo del servidor, verificación de 404 controlado | Sistema (NF-REL-01/02) |

---

## 5. Niveles de prueba y documentos asociados

| Nivel | Tipo de prueba | Plan | Informe |
|-------|----------------|------|---------|
| Unitario | Caja blanca, automatizada (PHPUnit) | [Plan de Pruebas Unitarias](Plan-de-Pruebas-Unitarias) | [Informe de Pruebas Unitarias](Informe-de-Pruebas-Unitarias) |
| Funcional (Caja Negra) | Caja negra, manual | [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra) | [Informe de Pruebas de Caja Negra](Informe-de-Pruebas-de-Caja-Negra) |
| Integración | Caja blanca, automatizada (HTTP, PHPUnit `Feature`) | [Plan de Pruebas de Integración](Plan-de-Pruebas-de-Integracion) | [Informe de Pruebas de Integración](Informe-de-Pruebas-de-Integracion) |
| Sistema | No funcional, automatizada (K6) | [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) | [Informe de Pruebas de Sistema](Informe-de-Pruebas-de-Sistema) |
| Aceptación | UAT, manual por roles | [Plan de Pruebas de Aceptación](Plan-de-Pruebas-de-Aceptacion) | [Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion) |

---

## 6. Trazabilidad

La trazabilidad requisito ↔ caso ↔ nivel ↔ evidencia se consolida en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad), que vincula cada `RF-XX`/`RNF-XX` de este catálogo con sus casos en cada nivel.

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-07-20 | **Creación del plan maestro**, a partir de la reestructuración de `Diseno-de-Casos-de-Pruebas-Funcionales.md` v2.1: se extrae el catálogo de RF (§3, antes en el diseño de caja negra) y se añade un **catálogo nuevo de RNF** (§4) que resume las tres características oficiales del [Plan de Pruebas de Sistema](Plan-de-Pruebas-de-Sistema) v4.0. El diseño específico de caja negra (técnicas, casos CPF-XX) continúa en el [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra) (antes `Diseno-de-Casos-de-Pruebas-Funcionales.md`). |

---

*Fin del documento — Plan de Pruebas (Plan Maestro).*
