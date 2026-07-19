# Plan de Pruebas de Aceptación

> Conforme a **ISO/IEC/IEEE 29119-3**. Nivel de **Aceptación** del Modelo-V: **validación** — ¿el sistema satisface las **necesidades del usuario**? Se ejecuta **manualmente**, desde la perspectiva de los roles de negocio, sobre el **entorno QA compartido en la nube**. Los veredictos se registran en el [Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion) (acta).

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas de Aceptación — Snipe-IT |
| **Versión** | 2.0 |
| **Hito / Sprint** | Hito 3 / Sprint 3–4 |
| **Nivel de prueba** | Aceptación (UAT — validación por el usuario) |
| **Herramientas** | **Ninguna adicional**: navegador web sobre el entorno QA (BDD/Gherkin automatizado documentado como opcional, no requerido) |
| **Entorno UAT** | **Entorno QA compartido en la nube** — VM DigitalOcean (Docker Compose: Snipe-IT + MariaDB) → **http://159.223.135.124/** |
| **Estándar** | ISO/IEC/IEEE 29119-3 |
| **Fecha** | 2026-06-12 · última revisión 2026-07-09 (v2.0) |

---

## 1. Introducción y objetivos

Las pruebas de aceptación determinan si el sistema **satisface las necesidades del usuario** y los criterios definidos para considerar el producto "aceptado". A diferencia del nivel de sistema (**verificación** contra la especificación), la aceptación es **validación**: adopta la perspectiva del **usuario/stakeholder** y se expresa mediante **criterios de aceptación** verificables (Dado–Cuando–Entonces), no mediante detalles técnicos.

**Objetivos:**
1. Validar que los flujos de negocio aportan el valor esperado al usuario final.
2. Confirmar los criterios de aceptación de las historias de usuario del backlog.
3. Emitir el **acta de aceptación** del producto en el contexto del curso.

---

## 2. Enfoque y procedimiento de ejecución

- **Criterios de aceptación** en formato verificable (Dado–Cuando–Entonces), trazados a las historias de usuario (GitHub Issues/Projects).
- **Ejecución manual por roles:** cada criterio lo ejecuta un integrante **actuando como el rol de la historia** (administrador, gestor de licencias, empleado sin permisos), por **navegador**, sobre la URL del entorno QA. No se requieren herramientas adicionales.
- **Entorno único compartido:** la VM en la nube (Docker Compose interno) garantiza que todos validan el mismo sistema con los mismos datos. Los testers **no instalan nada**.
- **Registro:** por criterio → captura de pantalla (mostrando la URL del entorno QA) + veredicto **Aceptado / Rechazado** + observación, consignados en el **acta** ([Informe](Informe-de-Pruebas-de-Aceptacion)).
- **Alcance acotado** (indicación del docente: la aceptación no se exige con rigor): se ejecutan **manualmente 5 criterios núcleo** (ACC-01…04, ACC-06); ACC-05 y ACC-07 se validan por **revisión de evidencia** de niveles inferiores.

### Precondiciones del entorno UAT
- Instancia QA accesible con datos de demostración (catálogos, activos QA-*).
- Usuarios por rol creados en la instancia de la nube: administrador del grupo, un usuario destino (p. ej. `jperez`) y un usuario **sin permisos** (p. ej. `alimitada`).

---

## 3. Criterios de aceptación por historia de usuario

| ID | Historia de usuario | Criterio (Dado–Cuando–Entonces) | Modo de validación | RF |
|----|---------------------|---------------------------------|--------------------|----|
| ACC-01 | Como administrador, quiero registrar activos | **Dado** un modelo y un estado, **cuando** registro un activo con tag único, **entonces** aparece en el inventario | 🧑‍💻 **UAT manual** | RF-01 |
| ACC-02 | Como administrador, quiero asignar activos a empleados | **Dado** un activo disponible, **cuando** lo asigno a un usuario, **entonces** queda registrado como entregado | 🧑‍💻 **UAT manual** | RF-02 |
| ACC-03 | Como administrador, quiero recuperar activos | **Dado** un activo asignado, **cuando** registro su devolución, **entonces** vuelve a estar disponible | 🧑‍💻 **UAT manual** | RF-03 |
| ACC-04 | Como gestor de licencias, quiero controlar asientos | **Dado** una licencia con N asientos, **cuando** asigno asientos, **entonces** la disponibilidad se actualiza y no permite exceder N | 🧑‍💻 **UAT manual** | RF-04/05 |
| ACC-05 | Como almacenero, quiero controlar consumibles | **Dado** un consumible con stock, **cuando** lo entrego, **entonces** el stock disminuye y se bloquea al agotarse | 📋 Revisión de evidencia (INT-05, CPF-09) | RF-06 |
| ACC-06 | Como responsable de seguridad, quiero control de acceso | **Dado** un usuario sin permisos, **cuando** intenta una acción restringida, **entonces** el sistema la deniega | 🧑‍💻 **UAT manual** | RF-09 |
| ACC-07 | Como administrador multiempresa, quiero aislamiento de datos | **Dado** FMCS activo, **cuando** un usuario navega, **entonces** solo ve entidades de su empresa | 📋 Revisión de evidencia (INT-07, CPF-03.7) | RF-02 |

> **Soporte previo (verificación de niveles inferiores):** todos los criterios cuentan con evidencia técnica previa (unitarias 85 %, integración INT-01…13, sistema NF). Esa evidencia **soporta pero no sustituye** la validación UAT: el veredicto de aceptación se emite tras la ejecución manual por roles y queda **exclusivamente en el Informe** (acta), no en este Plan.

---

## 4. Criterios de entrada y salida

### Entrada
- [x] Pruebas de sistema del Hito 3 ejecutadas (atributos oficiales verdes).
- [x] Entorno QA en nube estable con datos de demostración.
- [x] Historias de usuario y criterios de aceptación acordados.
- [ ] Usuarios por rol creados en la instancia de la nube.

### Salida (criterio de aceptación del producto)
- [ ] 100 % de los criterios ACC-01…07 evaluados (5 UAT manual + 2 revisión de evidencia).
- [ ] Todos los criterios de severidad alta en "Aceptado".
- [ ] Defectos de aceptación registrados en GitHub Issues.
- [ ] **Acta de aceptación** emitida en el [Informe](Informe-de-Pruebas-de-Aceptacion).

---

## 5. Riesgos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| RA-01 | Datos del entorno QA alterados por otras pruebas (K6, capturas) durante la sesión UAT | Coordinar calendario del grupo; K6 no se ejecuta durante la UAT |
| RA-02 | Usuarios por rol ausentes en la instancia de la nube | Precondición §2: crearlos antes de la sesión |
| RA-03 | Sesgo del ejecutor (mismo grupo desarrolla y acepta) | Ejecutar por parejas: uno actúa como usuario, otro registra |

---

## 6. Trazabilidad

Cada criterio ACC-XX se vincula con su requisito (RF-XX) y con los niveles inferiores (CPF/INT/NF) en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-12 | Plan inicial con criterios ACC-01…07. |
| 2.0 | 2026-07-09 | **Revisión**: separación Plan/Informe (los veredictos que figuraban en el Plan se retiran — el registro es exclusivo del acta/Informe); entorno UAT actualizado a la **nube** (VM DigitalOcean, URL pública); procedimiento de ejecución por roles y precondiciones; alcance acotado (5 UAT manual + 2 por revisión de evidencia); riesgos RA-01…03; sin herramientas adicionales (navegador). |

*Fin del documento — Plan de Pruebas de Aceptación. Veredictos en el Informe (acta).*
