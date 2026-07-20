# Plan de Distribucion — Snipe-IT (Sprint 2)

**Producto:** Snipe-IT — Sistema de Gestión de Activos de TI  
**Asignatura:** Pruebas de Software  
**Semestre:** 2026-A  
**Docente:** Ing. Robert Edison Arisaca Mamani  

## Integrantes y Roles

| Integrante | Rol |
|------------|-----|
| Jeanpiero Sixto Huamani Condori | Líder de Sprint / QA Lead / Scrum Master |
| Wilson Josue Turpo Huanca | DevOps Engineer / CI/CD Specialist |
| Juan Sergio Zeballos Perez | QA Automation Engineer 1 — AssetModel y User |
| Anette Isabel Gallegos Condori | QA Automation Engineer 2 — License e Integración Transaccional |
| Jherson David Imca Moncca | QA Automation Engineer 3 — Módulos Secundarios, Permisos y Cifrado |
| Jhastyn Jefferson Payehuanca Riquelme | Documentación Técnica / Wiki / QA Analyst |

## Organización de Responsabilidades del Sprint 2

La ejecución de las pruebas unitarias e integración fue distribuida entre los integrantes del equipo conforme a la estrategia de cobertura definida para el Sprint 2. La asignación busca maximizar la cobertura de código, mejorar la trazabilidad de requisitos y asegurar la estabilidad del pipeline de integración continua.

---

## 1. Jeanpiero Sixto Huamani Condori

### Líder de Sprint / QA Lead / Scrum Master

### Responsabilidad Principal

Coordinar el Sprint 2 y asegurar la correcta aplicación de la norma ISO/IEC/IEEE 29119-3 en la planificación, ejecución, seguimiento y documentación de las pruebas.

### Actividades

- Gestión del Sprint Backlog.
- Seguimiento de Issues y Pull Requests.
- Consolidación del Plan de Pruebas Unitarias.
- Elaboración de criterios de aceptación.
- Construcción de la matriz de trazabilidad.
- Supervisión de métricas de cobertura.
- Seguimiento de pruebas:
  - Flaky.
  - Skipped.
  - Incomplete.
- Validación final de entregables.
- Coordinación de la documentación final.

### Módulos Supervisados

- Authentication
- Checkout / Checkin
- Permissions
- API REST
- Multi-company Support
- Asset
- AssetModel

### Módulo Ejecutado

#### Category

| Código | Caso de Prueba |
|---------|----------------|
| CAT-01 | Verificar funcionamiento de `isDeletable()` |
| CAT-02 | Validar conteo mediante `itemCount()` |
| CAT-03 | Verificar recuperación de EULA mediante `getEula()` |
| CAT-04 | Validar relaciones con activos asociados |
| CAT-05 | Validar comportamiento con categorías vacías |

### Apoyo Directo

- Jhastyn Jefferson Payehuanca Riquelme (documentación)
- Juan Sergio Zeballos Perez
- Anette Isabel Gallegos Condori
- Jherson David Imca Moncca

---

## 2. Wilson Josue Turpo Huanca

### DevOps Engineer / CI/CD Specialist

### Responsabilidad Principal

Automatizar la ejecución de pruebas y la generación de reportes de cobertura mediante GitHub Actions.

### Actividades

- Configuración del workflow `tests-sqlite-coverage.yml`.
- Compatibilidad con:
  - PHP 8.2
  - PHP 8.3
  - PHP 8.4
- Configuración SQLite in-memory.
- Integración de PCOV.
- Ejecución automatizada de PHPUnit.
- Generación de:
  - Clover XML.
  - HTML Coverage.
- Publicación de artefactos.
- Diagnóstico de fallos CI/CD.
- Documentación técnica del pipeline.

### Módulos Ejecutados

#### Depreciable

| Código | Caso de Prueba |
|---------|----------------|
| DEP-01 | Validar cálculo de depreciación lineal |
| DEP-02 | Verificar porcentaje de depreciación acumulada |
| DEP-03 | Validar vida útil configurada |
| DEP-04 | Verificar relación con AssetModel |
| DEP-05 | Validar comportamiento para activos completamente depreciados |

### Responsabilidades Técnicas

- Pipeline CI/CD completo.
- Automatización de pruebas.
- Cobertura de código.
- Artefactos de ejecución.
- Reportes de calidad.

### Entregables

- Workflow funcional.
- Evidencias CI/CD.
- Reportes de cobertura.
- Documentación del pipeline.

---

## 3. Juan Sergio Zeballos Perez

### QA Automation Engineer 1 — AssetModel y User

### Responsabilidad Principal

Implementar y estabilizar las pruebas unitarias de los módulos principales AssetModel y User.

### AssetModel

#### Casos de Prueba

| Código | Caso de Prueba |
|---------|----------------|
| ASM-01 | Validar campos obligatorios |
| ASM-02 | Validar mass assignment |
| ASM-03 | Verificar relaciones |
| ASM-04 | Validar `percentRemaining()` |
| ASM-05 | Validar `isDeletable()` |
| ASM-06 | Validar scopes |
| ASM-07 | Validar casting |
| ASM-08 | Validar Soft Delete |
| ASM-09 | Validar Presenter |
| ASM-10 | Validar relación con Category |
| ASM-11 | Validar relación con Manufacturer |
| ASM-12 | Validar relación con Depreciation |

### User

#### Casos de Prueba

| Código | Caso de Prueba |
|---------|----------------|
| USR-01 | Validar campos requeridos |
| USR-02 | Validar password hashing |
| USR-03 | Verificar hidden attributes |
| USR-04 | Verificar relación con Location |
| USR-05 | Verificar relación con Company |
| USR-06 | Verificar relación con Manager |
| USR-07 | Validar Soft Delete |
| USR-08 | Validar username único |
| USR-09 | Validar API Tokens |
| USR-10 | Validar Notifiable |
| USR-11 | Validar locale preference |
| USR-12 | Validar LDAP import flag |
| USR-13 | Validar employee number |
| USR-14 | Validar VIP flag |

### Authentication

#### Casos de Estabilización

| Código | Caso de Prueba |
|---------|----------------|
| AUTH-01 | Verificar throttling de login |
| AUTH-02 | Validar registro exitoso de login |
| AUTH-03 | Verificar limpieza de sesión |
| AUTH-04 | Validar limpieza de caché |
| AUTH-05 | Verificar consistencia del rate limiting |

### Entregables

- Tests unitarios AssetModel.
- Tests unitarios User.
- Evidencias Authentication.
- Informe de hallazgos.

---

## 4. Anette Isabel Gallegos Condori

### QA Automation Engineer 2 — License e Integración Transaccional

### Responsabilidad Principal

Implementar pruebas unitarias del módulo License y validar la integridad transaccional de inventario.

### License

#### Casos de Prueba

| Código | Caso de Prueba |
|---------|----------------|
| LIC-01 | Validar campos requeridos |
| LIC-02 | Verificar remain count |
| LIC-03 | Validar expiración |
| LIC-04 | Validar terminación |
| LIC-05 | Verificar estado inactivo |
| LIC-06 | Validar generación de seats |
| LIC-07 | Verificar ajuste de seats |
| LIC-08 | Validar percent remaining |
| LIC-09 | Validar scopes |
| LIC-10 | Validar casting |
| LIC-11 | Validar relaciones |
| LIC-12 | Validar freeSeat() |
| LIC-13 | Validar isDeletable() |

### LicenseSeat

#### Casos de Prueba

| Código | Caso de Prueba |
|---------|----------------|
| LSEAT-01 | Verificar asignación de asiento |
| LSEAT-02 | Validar liberación de asiento |
| LSEAT-03 | Verificar persistencia relacional |

### Checkout / Checkin

#### Casos de Integración

| Código | Caso de Prueba |
|---------|----------------|
| CHK-01 | Verificar asignación automática de licencia |
| CHK-02 | Validar persistencia de Asset |
| CHK-03 | Validar persistencia de License |
| CHK-04 | Validar persistencia de LicenseSeat |
| CHK-05 | Validar persistencia de User |
| CHK-06 | Validar devolución correcta de inventario |
| CHK-07 | Verificar integridad transaccional completa |

### Entregables

- Tests unitarios License.
- Tests integración Checkout.
- Evidencias de base de datos.
- Informe transaccional.

---

## 5. Jherson David Imca Moncca

### QA Automation Engineer 3 — Módulos Secundarios, Permisos y Cifrado

### Responsabilidad Principal

Incrementar cobertura de módulos secundarios y validar seguridad sobre campos cifrados.

### Accessory

| Código | Caso de Prueba |
|---------|----------------|
| ACC-01 | Validar `isDeletable()` |
| ACC-02 | Validar `percentRemaining()` |

### Consumable

| Código | Caso de Prueba |
|---------|----------------|
| CON-01 | Crear consumible con min_amt |
| CON-02 | Validar `numRemaining()` |
| CON-03 | Validar asignación con cantidad cero |
| CON-04 | Validar `isDeletable()` |

### Component

| Código | Caso de Prueba |
|---------|----------------|
| CMP-01 | Validar `unconstrainedAssets()` |
| CMP-02 | Validar `numCheckedOut()` |
| CMP-03 | Validar `purchase_cost >= 0` |
| CMP-04 | Validar relaciones con Company |

### Category

| Código | Caso de Prueba |
|---------|----------------|
| CAT-06 | Validar eliminación lógica segura |
| CAT-07 | Verificar conteo de elementos asociados |
| CAT-08 | Verificar recuperación de EULA |

### Permisos y Cifrado

| Código | Caso de Prueba |
|---------|----------------|
| ENC-01 | Validar permiso para almacenar campo cifrado |
| ENC-02 | Validar lectura autorizada |
| ENC-03 | Validar denegación sin permisos |
| ENC-04 | Verificar persistencia cifrada |
| ENC-05 | Verificar recuperación descifrada |

### Observación de Alcance

El módulo Department queda excluido del alcance principal del Sprint 2 y únicamente podrá utilizarse como evidencia complementaria o contingencia de trazabilidad si fuera requerido por el docente.

### Entregables

- Tests unitarios de Accessory.
- Tests unitarios de Consumable.
- Tests unitarios de Component.
- Pruebas de Category.
- Pruebas de campos cifrados.
- Documento de deuda técnica.

---

## 6. Jhastyn Jefferson Payehuanca Riquelme

### Documentación Técnica / Wiki / QA Analyst

### Responsabilidad Principal

Consolidar toda la documentación técnica del Sprint 2.

### Actividades

- Elaboración del Informe de Pruebas Unitarias.
- Elaboración del Plan de Integración.
- Elaboración del Informe de Integración.
- Elaboración de la Matriz de Cobertura.
- Consolidación de métricas.
- Documentación de:
  - Flaky Tests.
  - Skipped Tests.
  - Incomplete Tests.
- Preparación de sustentación.
- Organización de GitHub Wiki.

### Módulos Documentados

- Company
- Statuslabel
- Wiki Técnica Sprint 2
- Cobertura de Código

### Entregables

- Wiki completa.
- Informe técnico final.
- Matriz de cobertura.
- Material para sustentación.

### Enfoque

- Claridad documental.
- Formalidad académica.
- Coherencia entre pruebas y resultados.
- Preparación para exposición.

---

## Resumen de Distribución de Módulos

| Integrante | Módulos |
|------------|----------|
| Jeanpiero | Category (ejecución), Supervisión General |
| Wilson | Depreciable, CI/CD, Cobertura |
| Juan | AssetModel, User, Authentication |
| Anette | License, LicenseSeat, Checkout, Checkin |
| Jherson | Accessory, Consumable, Component, Category, Permisos y Cifrado |
| Jhastyn | Company, Statuslabel, Wiki, Cobertura y Documentación |

Esta distribución constituye la asignación oficial de trabajo para el Sprint 2 y será utilizada como base para la trazabilidad de requisitos, casos de prueba, cobertura de código, evidencias de ejecución y documentación final conforme a la norma ISO/IEC/IEEE 29119.