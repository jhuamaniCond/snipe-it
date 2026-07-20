# Informe de Pruebas de Aceptación (Acta)

> **Test Completion Report / Acta de aceptación** conforme a **ISO/IEC/IEEE 29119-3**. Registra la ejecución **UAT manual por roles** de los criterios del [Plan de Pruebas de Aceptación](Plan-de-Pruebas-de-Aceptacion) v2.0 sobre el **entorno QA compartido en la nube**, y emite el veredicto de aceptación del producto.

| Campo | Detalle |
|-------|---------|
| **Documento** | Informe de Pruebas de Aceptación — Snipe-IT |
| **Versión** | 0.9 (acta preparada — a completar en la sesión UAT) |
| **Entorno UAT** | `http://159.223.135.124/` — VM DigitalOcean (Docker Compose: Snipe-IT + MariaDB) |
| **Herramientas** | Navegador web (sin herramientas adicionales) |
| **Fecha de la sesión UAT** | ______________ |
| **Participantes / roles** | ______________ |
| **Estándar** | ISO/IEC/IEEE 29119-3 |

---

## 1. Alcance ejecutado

- **5 criterios por UAT manual** (ACC-01…04, ACC-06), ejecutados por integrantes actuando como el rol de cada historia.
- **2 criterios por revisión de evidencia** (ACC-05, ACC-07), soportados en los niveles inferiores ya ejecutados.
- Evidencia: captura por criterio **mostrando la URL del entorno QA** en el navegador.

### Precondiciones (verificar antes de empezar)
- [ ] Datos QA en la nube: modelo `Latitude 5540`, status `Ready to Deploy`, categoría de licencia, al menos 1 activo libre.
- [ ] Usuarios: administrador del grupo · `jperez` (destino) · `alimitada` (sin permisos, "This user can login" activado).

---

## 2. Ejecución UAT por criterio (guion + registro)

### ACC-01 — Registrar un activo (rol: administrador) · RF-01
- **Pasos:** login como admin → Assets → Create → modelo `Latitude 5540`, status `Ready to Deploy`, tag `UAT-A-001` → Save → buscarlo en el listado.
- **Aceptar si:** el activo aparece en el inventario con su tag.
- **Veredicto:** ☐ Aceptado ☐ Rechazado — **Evidencia:** `UAT-ACC-01.png` — **Obs.:** __________

### ACC-02 — Asignar un activo a un empleado (rol: administrador) · RF-02
- **Pasos:** abrir `UAT-A-001` → Checkout → User → `jperez` → Checkout.
- **Aceptar si:** la ficha muestra "Checked out to jperez" y el historial registra la entrega.
- **Veredicto:** ☐ Aceptado ☐ Rechazado — **Evidencia:** `UAT-ACC-02.png` — **Obs.:** __________

### ACC-03 — Recuperar un activo (rol: administrador) · RF-03
- **Pasos:** abrir `UAT-A-001` (asignado) → Checkin → confirmar.
- **Aceptar si:** el activo vuelve a estado disponible, sin usuario asignado.
- **Veredicto:** ☐ Aceptado ☐ Rechazado — **Evidencia:** `UAT-ACC-03.png` — **Obs.:** __________

### ACC-04 — Controlar asientos de licencia (rol: gestor de licencias) · RF-04/05
- **Pasos:** Licenses → Create (`UAT-Lic`, categoría license, **Seats = 1**) → asignar el asiento a `jperez` → intentar asignar un **segundo** asiento.
- **Aceptar si:** la disponibilidad baja a 0 y el sistema **no permite exceder** el total.
- **Veredicto:** ☐ Aceptado ☐ Rechazado — **Evidencia:** `UAT-ACC-04.png` — **Obs.:** __________

### ACC-06 — Control de acceso (rol: empleado sin permisos) · RF-09
- **Pasos:** cerrar sesión → login como `alimitada` → intentar gestionar activos (o abrir `/hardware/{id}/checkout` directo).
- **Aceptar si:** el sistema **deniega** la acción (403 / opción ausente).
- **Veredicto:** ☐ Aceptado ☐ Rechazado — **Evidencia:** `UAT-ACC-06.png` — **Obs.:** __________

---

## 3. Criterios validados por revisión de evidencia

| ID | Criterio | Evidencia de soporte (niveles inferiores, ya ejecutada) | Veredicto |
|----|----------|--------------------------------------------------------|-----------|
| ACC-05 | Control de stock de consumibles | Integración INT-05 (`ConsumableCheckoutTest`: stock decrementa; rechazo sin stock) · CPF-09 (caja negra Hito 2) | ☐ Aceptado ☐ Rechazado |
| ACC-07 | Aislamiento multiempresa (FMCS) | Integración INT-07 (`FmcsCrossCompanyTest`: bloquea entre empresas, permite en la misma) · CPF-03.7 manual | ☐ Aceptado ☐ Rechazado |

---

## 4. Resumen de veredictos

| ID | Criterio | Modo | Veredicto | Evidencia |
|----|----------|------|-----------|-----------|
| ACC-01 | Activo registrado | UAT manual | ⟦PENDIENTE⟧ | |
| ACC-02 | Activo asignado | UAT manual | ⟦PENDIENTE⟧ | |
| ACC-03 | Activo recuperado | UAT manual | ⟦PENDIENTE⟧ | |
| ACC-04 | Control de asientos | UAT manual | ⟦PENDIENTE⟧ | |
| ACC-05 | Control de stock | Revisión de evidencia | ⟦PENDIENTE⟧ | |
| ACC-06 | Control de acceso | UAT manual | ⟦PENDIENTE⟧ | |
| ACC-07 | Aislamiento FMCS | Revisión de evidencia | ⟦PENDIENTE⟧ | |

## 5. Defectos de aceptación

| ID | Criterio | Descripción | Issue GitHub | Severidad |
|----|----------|-------------|--------------|-----------|
| — | | | | |

## 6. Evaluación de criterios de salida (Plan §4)

| Criterio de salida | Estado |
|--------------------|--------|
| 100 % de ACC-01…07 evaluados | ⟦PENDIENTE⟧ |
| Criterios de severidad alta en "Aceptado" | ⟦PENDIENTE⟧ |
| Defectos registrados en Issues | ⟦PENDIENTE⟧ |
| Acta emitida | ⟦PENDIENTE⟧ |

## 7. Acta de aceptación (veredicto global)

> **El producto Snipe-IT, desplegado en el entorno QA del grupo, queda:** ☐ **ACEPTADO** ☐ ACEPTADO CON OBSERVACIONES ☐ RECHAZADO
>
> **Observaciones:** ____________________________________________
>
> **Fecha:** __________ · **Firman (integrantes/roles):** ____________________________________________

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 0.9 | 2026-07-09 | Acta preparada: guiones UAT por rol sobre el entorno QA en nube (5 manuales + 2 por evidencia), tablas de registro y veredicto global pendientes de la sesión. |

*Fin del documento — Informe de Pruebas de Aceptación. Completar en la sesión UAT y publicar en la Wiki.*