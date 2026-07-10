# Plan de Pruebas de Aceptación

> Conforme a ISO/IEC/IEEE 29119-3. Corresponde al **Hito 3 / Sprint 3-4**.

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas de Aceptación — Snipe-IT |
| **Versión** | 1.0 (planificación) |
| **Hito / Sprint** | Hito 3 / Sprint 3-4 |
| **Nivel de prueba** | Aceptación (validación) |
| **Fecha de elaboración** | 2026-06-12 |
| **Estándar** | ISO/IEC/IEEE 29119-3 |

---

## 1. Introducción y objetivos

Las pruebas de aceptación determinan si el sistema **satisface las necesidades del usuario** y los criterios definidos para considerar el producto "aceptado". Adoptan la perspectiva del **usuario/stakeholder** y se expresan mediante **criterios de aceptación** verificables, no mediante detalles técnicos.

**Objetivos:**
1. Validar que los flujos de negocio aportan el valor esperado al usuario final.
2. Confirmar el cumplimiento de los criterios de aceptación de las historias de usuario del backlog.
3. Emitir el veredicto de aceptación del producto en el contexto del curso.

---

## 2. Enfoque

- **Criterios de aceptación** redactados en formato verificable (Dado–Cuando–Entonces).
- **Ejecución manual** por un rol que actúa como usuario/stakeholder, sobre el entorno de staging.
- Trazabilidad directa con las **historias de usuario** registradas en GitHub Issues/Projects.

---

## 3. Criterios de aceptación por historia de usuario

| ID | Historia de usuario | Criterio de aceptación (Dado–Cuando–Entonces) |
|----|---------------------|------------------------------------------------|
| ACC-01 | Como administrador, quiero registrar activos | **Dado** un modelo y un estado, **cuando** registro un activo con tag único, **entonces** aparece en el inventario |
| ACC-02 | Como administrador, quiero asignar activos a empleados | **Dado** un activo disponible, **cuando** lo asigno a un usuario, **entonces** queda registrado como entregado |
| ACC-03 | Como administrador, quiero recuperar activos | **Dado** un activo asignado, **cuando** registro su devolución, **entonces** vuelve a estar disponible |
| ACC-04 | Como gestor de licencias, quiero controlar asientos | **Dado** una licencia con N asientos, **cuando** asigno asientos, **entonces** la disponibilidad se actualiza y no permite exceder N |
| ACC-05 | Como almacenero, quiero controlar consumibles | **Dado** un consumible con stock, **cuando** lo entrego, **entonces** el stock disminuye y se bloquea al agotarse |
| ACC-06 | Como responsable de seguridad, quiero control de acceso | **Dado** un usuario sin permisos, **cuando** intenta una acción restringida, **entonces** el sistema la deniega |
| ACC-07 | Como administrador multiempresa, quiero aislamiento de datos | **Dado** FMCS activo, **cuando** un usuario navega, **entonces** solo ve entidades de su empresa |

---

## 4. Registro de aceptación

> **Nota:** este Plan planifica los criterios; el **registro definitivo de veredictos y evidencia** se consolida en el [Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion) (acta). La tabla siguiente refleja el **resultado de cierre** ya emitido en dicho acta.

| ID | Criterio | Veredicto | Evidencia | Observación |
|----|----------|-----------|-----------|-------------|
| ACC-01 | Activo registrado | ✅ Aceptado | Informe Aceptación §3–§4 (INT-01 · CPF-01/02) | Revalidación E2E-02 por UI pendiente (no bloqueante) |
| ACC-02 | Activo asignado | ✅ Aceptado | Informe Aceptación §3–§4 (INT-01 · FI-01/02) | Defecto INC-02 detectado y corregido |
| ACC-03 | Activo recuperado | ✅ Aceptado | Informe Aceptación §3–§4 (INT-02 · FI-03) | Sin doble asignación de estado |
| ACC-04 | Control de asientos | ✅ Aceptado | Informe Aceptación §3–§4 (INT-04 · CPF-08) | No permite exceder N asientos |
| ACC-05 | Control de stock | ✅ Aceptado | Informe Aceptación §3–§4 (INT-05) | Bloqueo al agotar stock |
| ACC-06 | Control de acceso | ✅ Aceptado | Informe Aceptación §3–§4 (NF-SEC-01 · INT-08) | 302 a login sin sesión |
| ACC-07 | Aislamiento multiempresa | ✅ Aceptado | Informe Aceptación §3–§4 (INT-07 FMCS) | Bloquea entre empresas |

> UAT = *User Acceptance Testing*. Veredicto global del acta: **Producto Aceptado con observación** (revalidación E2E por UI en estabilización). Ver [Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion).

---

## 5. Criterios de entrada y salida

> Estado evaluado en el [Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion) §7.

### Entrada
- [x] Pruebas de sistema del Hito 3 superadas *(no funcionales verdes; revalidación E2E por UI en estabilización — no bloqueante)*.
- [x] Entorno de staging estable con datos de demostración (app desplegada con Docker Compose).
- [x] Historias de usuario y criterios de aceptación acordados.

### Salida (criterio de aceptación del producto)
- [x] 100 % de los criterios ACC-01 a ACC-07 evaluados (7/7).
- [x] Todos los criterios de severidad alta en estado "Aceptado".
- [x] Defectos de aceptación registrados y priorizados en GitHub Issues (INC-02 registrado y cerrado; sin nuevos).
- [x] Acta de aceptación documentada en la Wiki ([Informe de Pruebas de Aceptación](Informe-de-Pruebas-de-Aceptacion)).

---

## 6. Trazabilidad

Cada criterio ACC-XX se vincula con su requisito (RF-XX) y con los niveles inferiores en la [Matriz de Trazabilidad](Matriz-de-Trazabilidad).

---

*Fin del documento — Plan de Pruebas de Aceptación (Hito 3).*