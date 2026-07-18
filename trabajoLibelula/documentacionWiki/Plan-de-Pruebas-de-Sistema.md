# Plan de Pruebas de Sistema (E2E)

> Conforme a **ISO/IEC/IEEE 29119-3**. Nivel de **Sistema** del Modelo-V: **verificación** del sistema integrado completo contra sus requisitos, ejercitado de extremo a extremo (**E2E**) por la interfaz de usuario sobre el sistema **desplegado**. La ejecución y sus resultados se reportan en el [Informe de Pruebas de Sistema](Informe-de-Pruebas-de-Sistema).

| Campo | Detalle |
|-------|---------|
| **Documento** | Plan de Pruebas de Sistema (E2E) — Snipe-IT |
| **Versión** | 2.1 (v2.0 refinó a E2E + no-funcional por riesgo; v2.1 fija **2 atributos oficiales**: Seguridad y Desempeño) |
| **Hito / Sprint** | Hito 3 (Sprint 3–4) |
| **Nivel de prueba** | Sistema (E2E, caja negra sobre el sistema desplegado) |
| **Herramienta E2E** | **Laravel Dusk** (navegador real / ChromeDriver) — equivalente en el stack a Cypress/Playwright |
| **Entorno** | App desplegada con **Docker Compose** (staging), MariaDB con datos de prueba |
| **Estándar** | ISO/IEC/IEEE 29119-3 · modelo de calidad **ISO/IEC 25010** |
| **Fecha** | 2026-07-08 |

---

## 1. Introducción y objetivos

Mientras las pruebas **unitarias** aíslan un método y las de **integración** validan las interfaces entre subsistemas por HTTP, las pruebas de **sistema** validan el **producto completo desplegado**, recorriendo **flujos de negocio de punta a punta (E2E)** tal como los ejecuta un usuario real en el navegador. Se verifica la funcionalidad **y** atributos **no funcionales** clave del sistema en ejecución.

**Objetivos:**
1. Verificar los **recorridos E2E** principales (login → crear activo → checkout → checkin → licencia → logout) sobre la aplicación desplegada.
2. Verificar atributos **no funcionales** de alto riesgo (§6): **Seguridad, Rendimiento y Fiabilidad**.
3. Confirmar que el sistema, desplegado vía **CI/CD**, se comporta según lo especificado en un entorno cercano a producción.

> **Distinción con Aceptación:** este plan es **verificación** (¿cumple la especificación?). La **validación** frente a las necesidades del usuario (UAT / criterios de aceptación) se cubre en el *Plan de Pruebas de Aceptación*. Los mismos recorridos E2E pueden reutilizarse allí como criterios de aceptación.

---

## 2. Alcance

### 2.1 En alcance
- **E2E funcional** por la UI: autenticación, gestión de activos (crear, checkout, checkin), licencias y cierre de sesión.
- **No funcional** a nivel sistema: **Seguridad, Rendimiento y Fiabilidad** (justificación en §6).
- Ejecución sobre el **sistema desplegado** (Docker), no sobre `:memory:`.

### 2.2 Fuera de alcance
- Lógica interna de un método (nivel unidad) y contratos internos (nivel integración) — cubiertos en Hitos 2–3.
- Integraciones externas reales (LDAP/SAML/MTA/S3) — se simulan o difieren.
- Compatibilidad multi-navegador exhaustiva y portabilidad (bajo riesgo, §6). La **compatibilidad multi-motor de BD** ya se cubre con la matriz de CI (`tests-mysql/postgres/sqlite.yml`).

---

## 3. Enfoque y herramienta (justificación por stack)

El E2E recorre la app **por el navegador**. Como el stack es **PHP/Laravel**, la herramienta natural es **Laravel Dusk** (controla ChromeDriver, expresa los pasos en código PHP versionado junto a la app y se integra con GitHub Actions). Es el equivalente, para este stack, de **Cypress/Playwright/Selenium**. Igual que en integración (Supertest → PHPUnit `Feature`), **la herramienta depende del stack**.

- **Entorno E2E:** la app se levanta con `docker compose up -d` (staging); Dusk apunta a `APP_URL` y maneja su propia base de datos de prueba.
- **Datos:** seeders/factories para el estado inicial (admin, catálogos) y un dataset de volumen para NF-PERF-02.

---

## 4. Escenarios E2E funcionales

> Cada escenario es un recorrido completo por la UI. Trazan a los requisitos funcionales (RF) ya diseñados en el Hito 2.

| ID | Escenario E2E | Pasos (resumen) | Resultado esperado | RF |
|----|---------------|-----------------|--------------------|----|
| E2E-01 | Login válido | `/login` → credenciales admin → Entrar | Redirige al dashboard; sesión iniciada | RF-09 |
| E2E-02 | Crear activo | Assets → Create → (model, status, tag) → Save | El activo aparece en el listado con su tag | RF-01 |
| E2E-03 | Checkout de activo | Abrir activo → Checkout → destino usuario → Checkout | Ficha muestra "Checked out to"; estado Deployed | RF-02 |
| E2E-04 | Checkin de activo | Abrir activo asignado → Checkin → confirmar | Activo disponible; sin asignación | RF-03 |
| E2E-05 | Crear licencia con N asientos | Licenses → Create → Name+Category+Seats=N → Save | Licencia creada; pestaña Seats con N filas | RF-04 |
| E2E-06 | Logout | Menú usuario → Logout | Redirige a `/login`; sesión cerrada | RF-09 |

*(Estos escenarios refinan los casos SYS-01/SYS-02 de la v1.0 hacia recorridos E2E automatizables.)*

---

## 5. Trazabilidad de niveles (por qué E2E aporta algo distinto)

| Recorrido | Unidad | Integración | **Sistema (E2E)** |
|-----------|:------:|:-----------:|:-----------------:|
| Checkout de activo | Método `checkOut()` | POST `hardware/{id}/checkout` (HTTP) | **El usuario navega y confirma en la UI real desplegada** |

E2E valida lo que los niveles inferiores no pueden: **render de la UI, JavaScript (select2, datatables), sesión/cookies y el sistema realmente desplegado**.

---

## 6. Selección de pruebas NO funcionales y su fundamentación

> **Actualización v2.1 (indicación del docente para la presentación final):** el nivel de sistema debe aplicar **solo DOS atributos**. Se declaran como **atributos OFICIALES: Seguridad y Desempeño (rendimiento)** — los dos de mayor riesgo en la matriz §6.1 y los que cuentan con **evidencia real ejecutada**. La **Fiabilidad**, planificada originalmente como tercera característica, se mantiene únicamente como *verificación complementaria ya ejecutada* (NF-REL-02), fuera del alcance oficial.

> Fundamento de la selección: por **riesgo** (ISO 29119 no exige probar todos los atributos: se prioriza por *probabilidad × impacto*), sobre el modelo de calidad **ISO/IEC 25010** y por su **observabilidad a nivel de sistema**.

### 6.1 Matriz de riesgo (ISO 25010 × riesgo)

| Característica (ISO 25010) | Probabilidad de fallo | Impacto | Riesgo | Decisión |
|---------------------------|-----------------------|---------|--------|----------|
| **Seguridad** | Media-Alta — auth, permisos, FMCS, multiusuario, datos sensibles, superficie web | **Alto** — fuga/alteración de datos | 🔴 **ALTO** | ✅ **Incluir** |
| **Rendimiento (eficiencia)** | Media — datatables, inventarios grandes, reportes | **Alto** — degrada la UX y el uso real | 🔴 **ALTO** | ✅ **Incluir** |
| **Fiabilidad** | Media — throttling de login configurado, manejo de errores | Medio | 🟠 **MEDIO** | ✅ **Incluir** |
| Usabilidad | Baja-Media — UI madura (AdminLTE) | Bajo-Medio | 🟡 Bajo-Medio | ➖ Se documenta, no se prioriza |
| Compatibilidad | Baja — web estándar; BD ya cubierta por CI | Bajo | 🟢 Bajo | ❌ Fuera |
| Portabilidad | Baja — Docker la resuelve | Bajo | 🟢 Bajo | ❌ Fuera |
| Mantenibilidad | Se valida a nivel **unidad/cobertura** (Hito 2, 85 %) | — | — | ❌ Otro nivel |

### 6.2 Fundamentación (por qué estas tres)

1. **Seguridad — la de mayor impacto.** Snipe-IT gestiona **activos, licencias y datos de usuarios** con control de acceso por **políticas** y **multiempresa (FMCS)**. Un fallo compromete confidencialidad/integridad. El propio proyecto ya prioriza seguridad en su CI (**CodeQL**, **EthicalCheck**), lo que confirma que es un riesgo de primer orden.
2. **Rendimiento — alto impacto en el uso real.** El sistema se apoya en **datatables** y listados que crecen con el inventario; tiempos de respuesta pobres degradan la operación. Es **medible objetivamente** a nivel de sistema.
3. **Fiabilidad — riesgo medio, verificable y relevante.** La app tiene **throttling de login configurable** (`LOGIN_MAX_ATTEMPTS`/`LOGIN_LOCKOUT_DURATION`, RF-09/CPF-12.2) y páginas de error; verificar el bloqueo tras N intentos y el manejo de errores valida la robustez ante uso adverso.

Se **descartan** Compatibilidad y Portabilidad (bajo riesgo: web estándar sobre Docker; además la compatibilidad de BD ya se ejercita en el CI) y **Mantenibilidad** (se evalúa por **cobertura unitaria**, ya lograda en el Hito 2). Esta selección focalizada cumple el principio de **pruebas basadas en riesgo** de ISO 29119: cobertura donde el riesgo lo justifica, sin dispersión.

### 6.3 Casos no funcionales

| ID | Característica | Caso | Método / Umbral | Resultado esperado |
|----|---------------|------|-----------------|--------------------|
| NF-SEC-01 | Seguridad | Acceso a ruta protegida sin sesión (`/hardware`) | Petición HTTP sin autenticar | **302 → `/login`**; no expone datos |
| NF-SEC-02 | Seguridad | Acción sin permiso (usuario limitado) | E2E/HTTP a acción no autorizada | **403** / botón ausente |
| NF-SEC-03 | Seguridad | Logout invalida la sesión | E2E: logout → volver a ruta protegida | Redirige a login (sesión inválida) |
| NF-PERF-01 | Rendimiento | Tiempo de carga de páginas clave (login, dashboard, listado) | Medición HTTP (TTFB) en staging | **< 2 s** por página |
| NF-PERF-02 | Rendimiento | Listado de activos con volumen (≈500 registros) | Medición con dataset sembrado | Respuesta **< 3 s** |
| NF-REL-01 | Fiabilidad | Throttling de login | N+1 intentos fallidos (`LOGIN_MAX_ATTEMPTS`) | **Bloqueo/lockout** tras el umbral |
| NF-REL-02 | Fiabilidad | Manejo de ruta inexistente | GET a URL inexistente | **404 controlado** (sin stacktrace) |

---

## 7. Entorno y dependencias

| Elemento | Configuración |
|----------|---------------|
| Despliegue | `docker compose up -d` (app + MariaDB) → `http://localhost:8000` (staging) |
| Herramienta E2E | Laravel Dusk + ChromeDriver (headless en CI) |
| Datos | Seeders/factories (admin, catálogos; dataset de volumen para NF-PERF-02) |
| CI/CD | GitHub Actions: job E2E que levanta el contenedor y ejecuta Dusk (evidencia del despliegue automatizado) |
| Medición NF | `curl -w` (tiempos/estados), revisión de cabeceras HTTP |

---

## 8. Criterios de entrada y salida

### Entrada
- [ ] App desplegada y accesible en staging (Docker).
- [ ] Dusk instalado (`composer require --dev laravel/dusk`) y ChromeDriver disponible.
- [ ] Usuario admin y catálogos sembrados.

### Salida
- [ ] E2E-01…E2E-06 ejecutados; 0 fallos bloqueantes.
- [ ] NF-SEC/PERF/REL ejecutados; umbrales cumplidos o desviaciones registradas como incidentes.
- [ ] Defectos en GitHub Issues; resultados en el **Informe de Pruebas de Sistema**.

---

## 9. Riesgos

| ID | Riesgo | Mitigación |
|----|--------|------------|
| RS-01 | E2E frágiles ante cambios de UI (selectores) | Selectores estables (`@dusk`, ids), no textos volátiles |
| RS-02 | Dependencia de ChromeDriver/entorno gráfico | Ejecutar headless; fijar versión de Chrome en CI |
| RS-03 | Tiempos de rendimiento dependientes de la máquina | Medir en el entorno CI/staging estándar; reportar percentiles |
| RS-04 | Datos residuales entre corridas | BD de prueba dedicada / reseteo por corrida |

---

## 10. Trazabilidad

Los escenarios **E2E-0X** trazan a los **RF-XX** y a los casos funcionales **CPF-XX** (Matriz de Trazabilidad). Los casos **NF-*** trazan a atributos de **ISO/IEC 25010**.

---

## Anexo A — Esqueleto de un test E2E en Laravel Dusk

```php
// tests/Browser/CheckoutAssetE2ETest.php
class CheckoutAssetE2ETest extends DuskTestCase
{
    public function test_e2e_03_checkout_de_activo_a_usuario(): void
    {
        $this->browse(function (Browser $browser) {
            $browser->visit('/login')
                    ->type('username', 'admin')
                    ->type('password', 'secret')
                    ->press('Login')
                    ->assertPathIs('/')                 // dashboard
                    ->visit('/hardware')                // listado
                    ->clickLink('QA-A-001')             // abrir activo
                    ->clickLink('Checkout')
                    ->select('checkout_to_type', 'user')
                    ->type('assigned_user', 'jperez')
                    ->press('Checkout')
                    ->assertSee('Checked out');         // verificación E2E
        });
    }
}
```

---

## Historial de cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0 | 2026-06-12 | Plan inicial (categorías SYS-01…SYS-07). |
| 2.0 | 2026-07-08 | Refinado a **E2E automatizado (Laravel Dusk)**; selección **no-funcional basada en riesgo** (ISO 25010): 3 características (Seguridad, Rendimiento, Fiabilidad) fundamentadas; escenarios E2E-01…06 y casos NF-*; entorno staging Docker + CI. |
| 2.1 | 2026-07-09 | Ajuste a la indicación final del docente: **dos atributos oficiales** (Seguridad + Desempeño); Fiabilidad pasa a verificación complementaria. El E2E deja de ser prioritario (plus opcional según el docente); se recomienda **K6** para el atributo Desempeño. |

---

*Fin del documento — Plan de Pruebas de Sistema (E2E). Ejecución y resultados en el Informe.*
