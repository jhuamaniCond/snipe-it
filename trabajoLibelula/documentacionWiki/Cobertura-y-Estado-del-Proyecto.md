# Cobertura y Estado Real del Proyecto

> Resumen factual del estado de las pruebas, con separación estricta entre **datos verificados** y **valores pendientes de ejecución en CI**.

| Campo | Detalle |
|-------|---------|
| **Documento** | Cobertura y Estado Real del Proyecto — Snipe-IT |
| **Versión** | 1.0 |
| **Hito / Sprint** | Hito 2 / Sprint 2 |
| **Fecha de elaboración** | 2026-06-12 |

---

## 1. Estado verificado del repositorio (factual)

Valores medidos directamente sobre el árbol de código (no estimados):

| Atributo | Valor |
|----------|-------|
| Licencia | AGPL-3.0-or-later |
| PHP / Framework | 8.2+ / Laravel 12 |
| PHPUnit | `^11.0` |
| Modelos Eloquent | 41 |
| Controladores | 91 (61 web + 30 API) |
| Policies | 22 |
| Factories | 29 |
| Migraciones | 444 |
| **Pruebas unitarias** | **170 archivos / 1 021 métodos** (cobertura de líneas 85.14 % en el núcleo de dominio) |
| **Pruebas de integración (Feature)** | **302 archivos / 1 648 métodos** (296 heredados + 6 archivos / 24 casos de aporte propio) |
| Workflows CI/CD | 11 |

---

## 2. Situación de la medición de cobertura

### 2.1 Hecho técnico verificado
El archivo `phpunit.xml` define el ámbito de cobertura como **todo `app/`**:
```xml
<source><include><directory suffix=".php">app/</directory></include></source>
```
En consecuencia, ejecutar **solo** la suite `Unit` y medir contra **todo `app/`** (que incluye 91 controladores, transformers y helpers no cubiertos por unitarias) produce un **porcentaje global bajo** que **no representa** la calidad de las pruebas unitarias de la capa de modelos.

### 2.2 Medición de cobertura ejecutada
En la primera versión de este documento (Hito 2, 2026-06-12) el entorno local **no permitía medir la cobertura** (sin binario de PHP en el PATH ni `vendor/` instalado) y, por integridad, no se publicó ningún porcentaje estimado. **Posteriormente, durante la campaña de cobertura, la medición sí se ejecutó** con PHPUnit 11.5 + PCOV (`php -d memory_limit=-1 vendor/bin/phpunit --testsuite Unit --coverage-clover clover.xml`), generando el artefacto verificable **`trabajoLibelula/clover.xml`**. Los valores reales se consignan en el [Informe de Pruebas Unitarias](Informe-de-Pruebas-Unitarias) y se transcriben en §3.

### 2.3 Fuente oficial de cobertura
La cobertura real se obtiene del workflow **`tests-unit-coverage.yml`**, que genera `clover.xml` y un reporte HTML como artefactos. Ver [Pipeline CI/CD](Pipeline-CI-CD) §3.

---

## 3. Métricas oficiales y su estado

| Métrica | Definición | Objetivo | Valor real (medido) |
|---------|------------|----------|---------------------|
| Cobertura de líneas — núcleo de dominio (Opción A) | Líneas cubiertas en el alcance unitario de `phpunit.xml` | ≥ 80 % | **85.14 %** (16 915 / 19 868) ✅ |
| Cobertura de modelos | Líneas cubiertas en `app/Models/` | ≥ 80 % | **80.2 %** (5 065 / 6 315) ✅ |
| Cobertura global `app/` (con controladores) | Informativa, no es objetivo | — | Fuera del alcance unitario (dominio de la suite Feature) |
| Pruebas unitarias en verde | PASS / total | 100 % | **1 504 / 1 505 PASS** (100 % tras corregir 1 fallo transitorio de entorno) ✅ |
| Tiempo de ejecución (Unit) | Duración de la suite | < 60 s | **~2 min** con instrumentación PCOV |

> Fuente: artefacto `trabajoLibelula/clover.xml` (`statements="19868" coveredstatements="16915"`) y el [Informe de Pruebas Unitarias](Informe-de-Pruebas-Unitarias) §2–§4. Los valores dejaron de estar `⟦PENDIENTE-CI⟧` al ejecutarse la medición real.

---

## 4. Estado por módulo (inventario de **línea base**, Hito 2)

> Las cifras de esta tabla corresponden al **inventario base** que orientó la priorización de brechas. Tras la campaña de cobertura, la suite unitaria alcanzó **170 archivos / 1 021 métodos** y **85.14 %** de líneas (ver §3 e [Informe de Pruebas Unitarias](Informe-de-Pruebas-Unitarias)).

| Módulo | # Tests unitarios (base) | Estado de cobertura unitaria | Acción Hito 2 |
|--------|-------------------|------------------------------|----------------|
| Depreciable | 30 | ✅ Alta | Documentar |
| User | 25 | 🟢 Buena | Ampliar brechas |
| Asset | 20 | 🟢 Buena | Ampliar brechas |
| Category | 17 | ✅ Alta | Documentar |
| CustomField | 9 | 🟢 Buena | — |
| SnipeModel | 9 | 🟢 Buena | — |
| Company | 8 | 🟢 Buena | Ampliar `isDeletable` |
| Component | 8 | 🟢 Buena | Casos borde |
| Accessory | 7 | 🟢 Buena | Casos borde |
| License + Seat | 7 | 🟡 Media | **Ampliar (prioridad)** |
| Statuslabel | 6 | 🟡 Media | **Cubrir `getStatuslabelType()`** |
| Checkout | 6 | 🟡 Media | Ampliar aceptación |
| AssetModel | 4 | 🔴 Baja | **Ampliar (prioridad)** |
| Consumable | 3 | 🔴 Baja | **Ampliar (prioridad)** |

---

## 5. Diferencias corregidas respecto al plan v2.0

| Tema | Plan v2.0 | Estado real | Corregido en |
|------|-----------|-------------|--------------|
| Versión PHPUnit | 10.5 | ^11.0 | Plan Unitarias v3.0 |
| Consumable | 0 tests | 3 tests | Este documento / Plan v3.0 |
| Depreciable | 0 (opcional) | 30 tests | Este documento / Plan v3.0 |
| Category | 2 tests | 17 tests | Este documento / Plan v3.0 |
| Statuslabel | `getStatuslabelType` cubierto | Solo altas cubiertas | Plan v3.0 §5.4 |
| License | `isExpired`/scopes cubiertos | seats/percent/depreciación | Plan v3.0 §5.2 |
| Cobertura objetivo | 81–85 % global | Métrica acotada a modelos | Plan v3.0 §6 |

---

## 6. Conclusión del estado

El proyecto presenta una **base de pruebas robusta y verificable** (1 021 unitarias + 1 648 de integración) y un **pipeline de CI/CD operativo con cobertura automatizada**. Las **pruebas funcionales manuales en QA ya se ejecutaron** (sesiones del 2026-06-21 al 2026-06-24): 60 casos Conforme, 1 No conforme (CPF-12.2 → INC-RF09-001) y 0 Bloqueado, según el [Informe de Casos de Pruebas Funcionales](Informe-de-Casos-de-Pruebas-Funcionales). Las brechas unitarias prioritarias (AssetModel, Consumable, License, Statuslabel) se cerraron en la campaña de cobertura y **la medición ya se ejecutó** (85.14 %, `clover.xml`), por lo que los campos `⟦PENDIENTE-CI⟧` de este documento quedaron completados con valores reales. El trabajo restante corresponde al Hito 3 (estabilizar la corrida E2E y completar las pruebas no funcionales pendientes).

---

*Fin del documento — Cobertura y Estado Real del Proyecto.*