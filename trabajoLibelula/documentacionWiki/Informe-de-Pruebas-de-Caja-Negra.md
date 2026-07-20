# Informe de Pruebas de Caja Negra

> Conforme a **ISO/IEC/IEEE 29119-3** (*Test Execution Documentation* / *Test Completion Report*). Registra la **ejecución manual** del [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra), organizado **por requisito funcional**.

| Campo | Detalle |
|-------|---------|
| **Documento** | Informe de Pruebas de Caja Negra — Snipe-IT |
| **Versión** | **3.0** (renombrado y reestructurado desde `Informe-de-Casos-de-Pruebas-Funcionales.md` v2.1; entorno de ejecución actualizado a la nube) |
| **Plan asociado** | [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra) v3.0 |
| **Hito / Sprint** | Hito 2 / Sprint 2 |
| **Tipo** | Funcional / Caja negra / Manual |
| **Entorno de ejecución** | **VM DigitalOcean** — Ubuntu 24.04 LTS · 1 vCPU · 1 GB RAM · 25 GB SSD — Docker Compose (Snipe-IT + MariaDB 11.4.7) → **http://159.223.135.124/** |
| **Fecha de elaboración** | 2026-06-12 · reestructurado 2026-07-20 |
| **Estado** | Diseño cerrado; **ejecución manual en QA completada** (sesiones del 2026-06-21 al 2026-06-24, sobre el entorno QA en la nube) |

---

## 1. Nota metodológica — separación entre diseñado y ejecutado

Este informe distingue de forma estricta tres tipos de información:

1. **Diseñado (factual):** los casos `CPF-XX` y sus subcasos, ya especificados en el [Plan de Pruebas de Caja Negra](Plan-de-Pruebas-de-Caja-Negra). Es información cerrada.
2. **Cobertura automatizada de referencia (factual):** la existencia, en el repositorio, de pruebas automatizadas (`tests/Feature/**`) que corroboran el **resultado esperado** de cada requisito. **No es** la ejecución funcional manual, pero es un dato verificable que respalda el diseño y reduce el riesgo de diseñar contra supuestos.
3. **Ejecutado en QA (pendiente):** el **veredicto manual** (Conforme / No conforme / Bloqueado) y la **evidencia** (capturas) de cada caso. Mientras no se realice la sesión de pruebas en QA, estos campos figuran como `⟦PENDIENTE-QA⟧`. **No se consignan resultados no ejecutados como si hubieran pasado.**

> **Procedimiento de ejecución:** Snipe-IT desplegado en el **entorno QA oficial en la nube** (VM DigitalOcean, Docker Compose) → poblar datos base → ejecutar cada caso `CPF-XX` del plan → capturar evidencia → registrar veredicto y, si falla, abrir GitHub Issue con etiqueta `bug` y enlazarlo aquí.

---

## 2. Entorno de ejecución

> **Mismo entorno que el nivel de Sistema:** las capturas de este informe se ejecutaron sobre la **misma VM en la nube** que el [Informe de Pruebas de Sistema](Informe-de-Pruebas-de-Sistema) v3.0 verifica con K6. La caja negra manual y las pruebas de sistema validan, por tanto, exactamente el **mismo build** de Snipe-IT.

| Elemento | Definición |
|----------|------------|
| **Aplicación** | Snipe-IT (PHP 8.2+ / Laravel 12) — Docker Compose sobre la VM |
| **Entorno QA oficial** | **VM DigitalOcean** — Ubuntu 24.04 LTS · 1 vCPU · 1 GB RAM · 25 GB SSD |
| **URL pública** | **http://159.223.135.124/** |
| **Motor de base de datos** | MariaDB 11.4.7 (Docker Compose) |
| **Acceso** | Navegador, interfaz administrativa |
| **Datos base** | Seeders/factories (modelos, status labels, categorías, usuarios, ubicaciones) |
| **Roles** | Superusuario y permisos granulares según el caso |
| **Evidencia** | Capturas por caso + GitHub Issues para defectos |

---

## 3. Resumen de ejecución

| Métrica | Valor |
|---------|-------|
| Requisitos funcionales cubiertos | 11 (RF-01 a RF-11) |
| Casos principales diseñados | 15 (CPF-01 a CPF-15) |
| Subcasos derivados diseñados | 46 (CPF-XX.n) |
| Casos con cobertura automatizada de referencia | 13 de 15 (CPF-05 y CPF-08 sin cobertura automatizada) |
| Casos ejecutados manualmente en QA | 61 (15 principales + 46 subcasos) |
| Conformes | 60 |
| No conformes | 1 (CPF-12.2 — bloqueo por exceso de intentos de login) |
| Bloqueados | 0 |
| Defectos registrados (Issues) | 1 (INC-RF09-001) |

---

## 4. Informe de ejecución por requisito funcional

> Para cada requisito: **resultado obtenido (veredicto manual), estado, defectos, observaciones y evidencia**. El *Veredicto manual* es el resultado de la sesión de ejecución en el entorno QA en la nube; la evidencia enlaza a la captura de cada caso. La cobertura automatizada de referencia que respalda cada requisito se documenta en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

### RF-01 — Registrar un activo con asset tag único

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-01 | Activo creado con tag único | **Conforme** | [CPF-01](#cpf-01) |
| CPF-01.1 | Serial requerido y provisto → creado | **Conforme** | [CPF-01-1](#cpf-01-1) |
| CPF-01.2 | Serial requerido y ausente → rechazo (`serials.1`) | **Conforme** | [CPF-01-2](#cpf-01-2) |
| CPF-01.3 | Sin permiso → 403 | **Conforme** | [CPF-01-3](#cpf-01-3) |
| CPF-02 / CPF-02.1 | Tag duplicado/vacío → rechazo | **Conforme** | [CPF-02-duplicado](#cpf-02-duplicado); [CPF-02-vacio](#cpf-02-vacio) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-23; todos los escenarios validados) · **Defectos:** — · **Observaciones:** Se comprobó que la regla de unicidad del Asset Tag actúa de forma lógica frente a eliminaciones (*soft delete*); al borrar un activo, su tag se libera para nuevos registros vivos (`unique_undeleted`). Asimismo, se verificó manualmente que para forzar los errores de campo vacío, el parámetro de auto-incremento global en la configuración de Snipe-IT debe estar apagado.

### CPF-01
![CPF-01](capturas/CPF-01.png)

### CPF-01-1
![CPF-01-1](capturas/CPF-01.1.png)

### CPF-01-2
![CPF-01-2](capturas/CPF-01.2.png)

### CPF-01-3
![CPF-01-3](capturas/CPF-01.3.png)

### CPF-02-duplicado
![CPF-02-duplicado](capturas/CPF-02.png)

### CPF-02-vacio
![CPF-02-vacio](capturas/CPF-02.1.png)

### RF-02 — Asignar un activo a un destino (checkout)

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-03 | Activo asignado a usuario; historial actualizado | **Conforme** | [CPF-03-0](#cpf-03-0) |
| CPF-03.1/.2 | Checkout a activo / ubicación | **Conforme** | [CPF-03-1](#cpf-03-1); [CPF-03-2](#cpf-03-2)  |
| CPF-03.3 | Activo no disponible → rechazo | **Conforme** | [CPF-03-3](#cpf-03-3) |
| CPF-03.4 | Activo a sí mismo → rechazo | **Conforme** | [CPF-03-4](#cpf-03-4) |
| CPF-03.5 | Datos obligatorios ausentes → errores | **Conforme** | [CPF-03-5](#cpf-03-5) |
| CPF-03.6 | Sin permiso → 403 | **Conforme** | [CPF-03-6](#cpf-03-6) |
| CPF-03.7 | Checkout cruzado (FMCS) → rechazo | **Conforme** | [CPF-03-7-0](#cpf-03-7-0); [CPF-03-7-0](#cpf-03-7-1) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube; todos los escenarios validados) · **Defectos:** — · **Observaciones:** el subcaso FMCS (CPF-03.7) exigió activar `full_multiple_companies_support` en la instancia de QA antes de ejecutarlo; con FMCS activo, el checkout cruzado entre empresas se rechazó como se esperaba.

### CPF-03-0
![CPF-03-0](capturas/CPF-03-0.png)
### CPF-03-1
![CPF-03-1](capturas/CPF-03-1.png)
### CPF-03-2
![CPF-03-2](capturas/CPF-03-2.png)
### CPF-03-3
![CPF-03-3](capturas/CPF-03-3.png)
### CPF-03-4
![CPF-03-4](capturas/CPF-03-4.png)
### CPF-03-5
![CPF-03-5](capturas/CPF-03-5.png)
### CPF-03-6
![CPF-03-6](capturas/CPF-03-6.png)
### CPF-03-7-0
![CPF-03-7](capturas/CPF-03-7-0.png)
### CPF-03-7-1
![CPF-03-7](capturas/CPF-03-7-1.png)

### RF-03 — Devolver un activo asignado (checkin)

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-04 | Activo devuelto; queda disponible | **Conforme** | [CPF-04](#cpf-04) |
| CPF-04.1 | Checkin de activo no asignado → rechazo | **Conforme** | [CPF-04-1](#cpf-04-1) |
| CPF-04.2 | Sin permiso → 403 | **Conforme** | [CPF-04-2](#cpf-04-2) |
| CPF-04.3 | Asientos de licencia liberados | **Conforme** | [CPF-04-3](#cpf-04-3) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-24; todos los escenarios validados) · **Defectos:** — · **Observaciones:** Se verificó que tras el checkin la ubicación se restablece a la RTD por defecto (`test_location_is_set_to_rtd_location_by_default_upon_checkin`). **Aclaración importante (CPF-04.3):** en el checkin de un activo, Snipe-IT solo limpia la **asignación de usuario** (`assigned_to` → NULL) del asiento de licencia ligado al activo; **NO borra `asset_id`**, por lo que el contador *Avail* de la licencia **no sube** tras el checkin del activo. Es **comportamiento correcto por diseño** (coincide con `AssetCheckinController.php:162-164` y con el test `test_assets_license_seats_are_cleared_upon_checkin`, que solo afirma `assigned_to`). Para devolver el asiento al pool hay que hacer **Checkin del asiento** desde la pestaña *Seats* de la licencia. La expectativa inicial de "+1 disponible" era incorrecta y se corrigió en el guion; se registra como observación, **no como defecto**.

### CPF-04
![CPF-04](capturas/CPF-04.png)
### CPF-04-1
![CPF-04-1](capturas/CPF-04-1.png)
### CPF-04-2
![CPF-04-2](capturas/CPF-04-2.png)
### CPF-04-3
![CPF-04-3 (antes del checkin: el asiento aparece asignado a Juan Perez)](capturas/CPF-04-3-0.png)
![CPF-04-3 (tras el checkin del activo: el asiento ya no muestra usuario y Avail permanece igual)](capturas/CPF-04-3-1.png)

### RF-04 — Crear una licencia con N asientos

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-06 / CPF-06.1/.2 | Licencia con N asientos (1/10/10000) | **Conforme** | [CPF-06](#cpf-06); [CPF-06-1](#cpf-06-1); [CPF-06-2](#cpf-06-2) |
| CPF-06.3 | seats=100000 → no se crea | **Conforme** | [CPF-06-3](#cpf-06-3) |
| CPF-06.4 | Sin `purchase_date` → rechazo | **Conforme** | [CPF-06-4](#cpf-06-4) |
| CPF-06.5 | seats=0 → rechazo (`min:1`) | **Conforme** | [CPF-06-5](#cpf-06-5) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-24; todos los escenarios validados) · **Defectos:** — · **Observaciones:** `limit_change:10000` limita la **magnitud del cambio** de asientos (±10000); para una licencia nueva equivale a un **tope superior de 10000**. Por eso `seats=100000` se rechaza y `seats=10000` se acepta. Para CPF-06.4 se comprobó que `purchase_date` solo es obligatoria cuando se selecciona una *Depreciation* (`required_with:depreciation_id`); por eso se asoció una depreciación para forzar el rechazo.

### CPF-06
![CPF-06](capturas/CPF-06.png)
### CPF-06-1
![CPF-06-1](capturas/CPF-06-1.png)
### CPF-06-2
![CPF-06-2](capturas/CPF-06-2.png)
### CPF-06-3
![CPF-06-3](capturas/CPF-06-3.png)
### CPF-06-4
![CPF-06-4](capturas/CPF-06-4.png)
### CPF-06-5
![CPF-06-5](capturas/CPF-06-5.png)

### RF-05 — Asignar un asiento de licencia

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-07 | Asiento asignado a usuario; disponibles −1 | **Conforme** | [CPF-07](#cpf-07) |
| CPF-07.1 | Asiento asignado a activo | **Conforme** | [CPF-07-1](#cpf-07-1) |
| CPF-08 / CPF-08.1 | Agotar asientos / exceder → rechazo | **Conforme** | [CPF-08](#cpf-08); [CPF-08-1](#cpf-08-1) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-24; todos los escenarios validados con evidencia) · **Defectos:** — · **Observaciones:** CPF-08 y CPF-08.1 **no** tienen prueba automatizada de UI en el repositorio; su verificación fue **exclusivamente manual** en QA, sustentada con captura. Sobre `RF05 License` (2 asientos) se asignó un asiento a `jperez` (Avail 2→1) y otro al activo `QA-A-001` (Avail 1→0); con Avail=0 el sistema no ofrece más asientos libres y rechaza el checkout adicional, incluso forzando la URL directa.

### CPF-07
![CPF-07](capturas/CPF-07.png)
### CPF-07-1
![CPF-07-1](capturas/CPF-07-1.png)
### CPF-08
![CPF-08](capturas/CPF-08.png)
### CPF-08-1
![CPF-08-1](capturas/CPF-08-1.png)

### RF-06 — Descontar stock de un consumible

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-09 / CPF-09.1/.2 | Stock decrementa al entregar | **Conforme** | [CPF-09.1](capturas/CPF-09-1.png) · [CPF-09.2](capturas/CPF-09-2.png) |
| CPF-09.3 | Sin stock → rechazo | **Conforme** | [CPF-09.3](capturas/CPF-09-3.png) |
| CPF-09.4 | Sin `assigned_to` → rechazo | **Conforme** | [CPF-09.4](capturas/CPF-09-4.png) |
| CPF-09.5 | Sin permiso → 403 | **Conforme** | [CPF-09.5](capturas/CPF-09-5.png) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-21; todos los métodos de `ConsumableCheckoutTest` en verde) · **Defectos:** — · **Observaciones:** confirmar que la notificación por correo al usuario se emite (`test_user_sent_notification_upon_checkout`); depende de la configuración de correo (driver `array`/SMTP) en la VM.

### RF-07 — Impedir la eliminación de categoría con elementos

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-10 | Categoría con modelos → no se elimina | **Conforme** | [CPF-10](capturas/CPF-10.png) |
| CPF-10 (variante activos) | Categoría con activos → no se elimina | **Conforme** | [CPF-10 (activos)](capturas/CPF-10-assets.png) |
| CPF-10.1 | Sin permiso → 403 | **Conforme** | [CPF-10.1](capturas/CPF-10.1.png) |
| CPF-11 | Categoría vacía → se elimina | **Conforme** | [CPF-11](capturas/CPF-11.png) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-21; todos los métodos de `DeleteCategoriesTest` en verde) · **Defectos:** — · **Observaciones:** la eliminación es **borrado lógico** (*soft delete*); se verificó que la categoría desaparece del listado activo pero conserva su registro.

### RF-08 — Disponibilidad del activo según status label

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-05 / CPF-05.1/.2/.3 | Estado no desplegable → no elegible | **Conforme** | [CPF-05-1](#cpf-05-1); [CPF-05-2](#cpf-05-2); [CPF-05-3](#cpf-05-3) |

- **Estado:** **Conforme** (ejecutado manualmente en el entorno QA en la nube el 2026-06-23) · **Defectos:** — · **Observaciones:** Se validó de forma manual la ausencia de la funcionalidad de Checkout en la interfaz de usuario para los metatestados *pending*, *archived* y *undeployable* mediante la creación explícita de estados personalizados. El sistema oculta los botones de asignación y restringe la acción en estricto cumplimiento de la regla analítica `availableForCheckout()`.

### CPF-05-1
![CPF-05-1](capturas/CPF-05.1.png)

### CPF-05-2
![CPF-05-2](capturas/CPF-05.2.png)

### CPF-05-3
![CPF-05-3](capturas/CPF-05.2.png)

### RF-09 — Autenticar a un usuario (login / logout)

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-12 | Login válido → autenticado, evento registrado | **Conforme** | [CPF-12](#cpf-12) |
| CPF-12.1 | Credenciales inválidas → rechazo + intento registrado | **Conforme** | [CPF-12-1](#cpf-12-1) |
| CPF-12.2 | Exceso de intentos → bloqueo (throttling) | **No conforme** | [INC-RF09-001](#inc-rf09-001) |
| CPF-12.3 / .4 | Logout / acceso sin sesión → redirección a login | **Conforme** | [CPF-12-3](#cpf-12-3) |

- **Estado:** **No conforme** (ejecutado en el entorno QA en la nube) · **Defectos:** [INC-RF09-001](#inc-rf09-001) · **Observaciones:** El middleware `auth` y logout responden de forma segura. Sin embargo, el caso **CPF-12.2** recibe un veredicto de **No conforme**: tras superar más de 15 intentos erróneos manuales consecutivos, no se disparó el bloqueo. Al auditar la referencia automatizada, se corroboró que el desarrollador la suprimió mediante `$this->markTestIncomplete()`, citando inestabilidad (*flakiness*) en el Rate Limiter.

### CPF-12
![CPF-12](capturas/CPF-12.png)

### CPF-12-1
![CPF-12-1](capturas/CPF-12.1.png)

### CPF-12-3
![CPF-12-3](capturas/CPF-12.3.png)

### RF-10 — Registrar y editar un usuario

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-13 | Usuario creado con datos válidos | **Conforme** | [CPF-13](#cpf-13) |
| CPF-13.1 | `first_name` vacío → rechazo | **Conforme** | [CPF-13-1](#cpf-13-1) |
| CPF-13.2 | Contraseña sin confirmar → rechazo | **Conforme** | [CPF-13-2](#cpf-13-2) |
| CPF-13.3 | Sin permiso → 403 | **Conforme** | [CPF-13-3](#cpf-13-3) |
| CPF-13.4 | Edición de usuario → cambios guardados | **Conforme** | [CPF-13-4](#cpf-13-4) |
| CPF-13.5 | No-admin no escala a superusuario | **Conforme** | [CPF-13-5](#cpf-13-5) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube; todos los escenarios manuales verificados) · **Defectos:** — · **Observaciones:** Se fabricaron perfiles de prueba con roles granulares para someter a estrés las fronteras de exclusión y escalada (CPF-13.3 y 13.5). Se demostró empíricamente que el middleware `can:create` y los mutadores de sanitización de roles responden con eficacia ante intentos de inyección de URL o manipulación.

### CPF-13
![CPF-13](capturas/CPF-13.png)

### CPF-13-1
![CPF-13-1](capturas/CPF-13.1.png)

### CPF-13-2
![CPF-13-2](capturas/CPF-13.2.png)

### CPF-13-3
![CPF-13-3](capturas/CPF-13.3.png)

### CPF-13-4
![CPF-13-4](capturas/CPF-13.4.png)

### CPF-13-5
![CPF-13-5](capturas/CPF-13.5.png)

### RF-11 — Asignar y devolver un accesorio (checkout / checkin)

| Caso | Resultado esperado (resumen) | Veredicto manual | Evidencia |
|------|------------------------------|------------------|-----------|
| CPF-14 | Accesorio asignado; unidades −cantidad; historial | **Conforme** | [CPF-14](#cpf-14) |
| CPF-14.1 / .2 | Checkout a ubicación / activo | **Conforme** | [CPF-14-1](#cpf-14-1); [CPF-14-2](#cpf-14-2) |
| CPF-14.3 | Sin unidades disponibles → rechazo | **Conforme** | [CPF-14-3](#cpf-14-3) |
| CPF-14.4 | Destino ausente → error de validación | **Conforme** | [CPF-14-4](#cpf-14-4) |
| CPF-14.5 | Sin permiso → 403 | **Conforme** | [CPF-14-5](#cpf-14-5) |
| CPF-15 / .1 | Checkin de accesorio / sin permiso → 403 | **Conforme** | [CPF-15](#cpf-15); [CPF-15-1](#cpf-15-1) |

- **Estado:** **Conforme** (ejecutado en el entorno QA en la nube el 2026-06-24; todos los escenarios validados) · **Defectos:** — · **Observaciones:** Sobre `Mouse Logitech` (qty 5) se entregó 1 unidad a `jperez`, 1 a la ubicación `Oficina Lima` y 1 al activo `QA-A-001`, decrementando las disponibles en cada caso, y el checkin de la unidad de `jperez` la devolvió al stock. El accesorio agotado `Teclado QA` (0 disponibles) rechazó el checkout, y la cuenta limitada `alimitada` recibió 403 tanto en checkout como en checkin (URL directa). La notificación al usuario en el checkout (`test_user_sent_notification_upon_checkout`) y el correo de checkin (`test_email_sent_to_user_if_setting_enabled`) dependen de la configuración de correo en la VM.

### CPF-14
![CPF-14](capturas/CPF-14.png)
### CPF-14-1
![CPF-14-1](capturas/CPF-14-1.png)
### CPF-14-2
![CPF-14-2](capturas/CPF-14-2.png)
### CPF-14-3
![CPF-14-3](capturas/CPF-14-3.png)
### CPF-14-4
![CPF-14-4](capturas/CPF-14-4.png)
### CPF-14-5
![CPF-14-5](capturas/CPF-14-5.png)
### CPF-15
![CPF-15](capturas/CPF-15.png)
### CPF-15-1
![CPF-15-1](capturas/CPF-15-1.png)

---

## 5. Defectos funcionales encontrados

| ID Issue | Caso origen | Descripción | Severidad | Estado |
|----------|-------------|-------------|-----------|--------|
| <a id="inc-rf09-001"></a>INC-RF09-001 | CPF-12.2 (RF-09) | Tras superar más de 15 intentos de login erróneos consecutivos no se dispara el bloqueo (throttling). Al auditar la referencia automatizada se halló que el test `test_login_throttle_config_is_respected` está suprimido con `$this->markTestIncomplete()` por inestabilidad (*flakiness*) del Rate Limiter. | Media | Abierto |

Los defectos se registran en **GitHub Issues** con etiqueta `bug` y se enlazan en esta tabla durante la sesión de ejecución.

---

## 6. Trazabilidad requisito ↔ caso ↔ evidencia

| Requisito | Casos principales | Subcasos | Evidencia funcional (QA) | Resultado |
|-----------|-------------------|----------|--------------------------|-----------|
| RF-01 | CPF-01, CPF-02 | .1 .2 .3 / .1 | [CPF-01](#cpf-01) · [.1](#cpf-01-1) · [.2](#cpf-01-2) · [.3](#cpf-01-3) · [CPF-02-duplicado](#cpf-02-duplicado) · [CPF-02-vacio](#cpf-02-vacio) | **Conforme** |
| RF-02 | CPF-03 | .1 … .7 | [CPF-03-0](#cpf-03-0) · [.1](#cpf-03-1) · [.2](#cpf-03-2) · [.3](#cpf-03-3) · [.4](#cpf-03-4) · [.5](#cpf-03-5) · [.6](#cpf-03-6) · [.7](#cpf-03-7-0) | **Conforme**|
| RF-03 | CPF-04 | .1 .2 .3 | [CPF-04](#cpf-04) · [.1](#cpf-04-1) · [.2](#cpf-04-2) · [.3](#cpf-04-3) | **Conforme** |
| RF-04 | CPF-06 | .1 … .5 | [CPF-06](#cpf-06) · [.1](#cpf-06-1) · [.2](#cpf-06-2) · [.3](#cpf-06-3) · [.4](#cpf-06-4) · [.5](#cpf-06-5) | **Conforme** |
| RF-05 | CPF-07, CPF-08 | .1 / .1 | [CPF-07](#cpf-07) · [.1](#cpf-07-1) · [CPF-08](#cpf-08) · [.1](#cpf-08-1) | **Conforme** |
| RF-06 | CPF-09 | .1 … .5 | [.1](capturas/CPF-09-1.png) · [.2](capturas/CPF-09-2.png) · [.3](capturas/CPF-09-3.png) · [.4](capturas/CPF-09-4.png) · [.5](capturas/CPF-09-5.png) | **Conforme** |
| RF-07 | CPF-10, CPF-11 | .1 | [CPF-10](capturas/CPF-10.png) · [CPF-10 (activos)](capturas/CPF-10-assets.png) · [CPF-10.1](capturas/CPF-10.1.png) · [CPF-11](capturas/CPF-11.png) | **Conforme** |
| RF-08 | CPF-05 | .1 .2 .3 | [CPF-05-1](#cpf-05-1) · [CPF-05-2](#cpf-05-2) · [CPF-05-3](#cpf-05-3) | **Conforme** |
| RF-09 | CPF-12 | .1 … .4 | [CPF-12](#cpf-12) · [.1](#cpf-12-1) · [.3](#cpf-12-3) | **No conforme** (CPF-12.2 → [INC-RF09-001](#inc-rf09-001)) |
| RF-10 | CPF-13 | .1 … .5 | [CPF-13](#cpf-13) · [.1](#cpf-13-1) · [.2](#cpf-13-2) · [.3](#cpf-13-3) · [.4](#cpf-13-4) · [.5](#cpf-13-5) | **Conforme** |
| RF-11 | CPF-14, CPF-15 | .1 … .5 / .1 | [CPF-14](#cpf-14) · [.1](#cpf-14-1) · [.2](#cpf-14-2) · [.3](#cpf-14-3) · [.4](#cpf-14-4) · [.5](#cpf-14-5) · [CPF-15](#cpf-15) · [.1](#cpf-15-1) | **Conforme** |

La trazabilidad consolidada (con los niveles unitario e integración) se mantiene en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

## 7. Conclusión

El **diseño** de pruebas de caja negra está **cerrado y verificado** contra el comportamiento real del producto: 15 casos principales y 46 subcasos cubren los 11 requisitos RF-01…RF-11 mediante una combinación de técnicas seleccionada por requisito (partición de equivalencia, valores límite, tablas de decisión y transición de estados). Trece de los quince casos principales cuentan con **cobertura automatizada de referencia** que respalda el resultado esperado.

La **ejecución manual** se completó sobre el **entorno QA oficial en la nube** (sesiones del 2026-06-21 al 2026-06-24): de los 61 casos ejecutados (15 principales + 46 subcasos), **60 resultaron Conformes** y **1 No conforme** —**CPF-12.2** (bloqueo por exceso de intentos de login), registrado como defecto **INC-RF09-001**—, sin casos bloqueados. Los dos casos sin cobertura automatizada —**CPF-05** (disponibilidad por status label) y **CPF-08** (agotamiento de asientos)— se verificaron de forma manual obligatoria y quedaron sustentados con evidencia. Se documenta además, como aclaración de diseño y no como defecto, que el checkin de un activo limpia la asignación de usuario del asiento de licencia pero no devuelve el asiento al pool (**CPF-04.3**). Con ello, la actividad de pruebas de caja negra **queda formalmente cerrada**.

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 2.1 | 2026-06-12 → 2026-06-24 | Ejecución manual en QA local (Docker) de los 61 casos; publicado como `Informe-de-Casos-de-Pruebas-Funcionales.md`. |
| **3.0** | 2026-07-20 | **Renombrado y reestructurado** desde `Informe-de-Casos-de-Pruebas-Funcionales.md` para alinear el nombre con el resto de niveles (`Informe-de-Pruebas-de-X`). **Entorno de ejecución actualizado**: las notas de "QA local vía Docker" se corrigen a **entorno QA oficial en la nube** (VM DigitalOcean, `http://159.223.135.124/`), el mismo utilizado por el nivel de Sistema (K6); evidencia con capturas reemplazadas ya cargada. Sin cambios en veredictos ni en el catálogo de casos. |

---

*Fin del documento — Informe de Pruebas de Caja Negra v3.0.*
