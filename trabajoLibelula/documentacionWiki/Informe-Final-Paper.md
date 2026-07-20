# Proceso de Pruebas de Software Multinivel Aplicado a Snipe-IT: Diseño, Ejecución e Inyección de Fallas bajo ISO/IEC/IEEE 29119

> Borrador de contenido para volcar en la plantilla *"Informe trabajo final formato paper.docx"*. El texto sigue el orden y los límites de párrafos de la plantilla. Las secciones marcadas con ⟦…⟧ requieren un dato del equipo (autores, correos) o la inserción de una figura/captura.

**Autores:** ⟦Autor1, Autor2, Autor3, …, AutorN⟧
Escuela Profesional de Ingeniería de Sistemas
Universidad Nacional de San Agustín
⟦autor1@unsa.edu.pe, autor2@unsa.edu.pe, …⟧

---

## Abstract

*(≤ 250 caracteres)*

**Abstract—** Se aplicó un proceso de pruebas multinivel (unitario, funcional, integración y sistema) sobre Snipe-IT bajo ISO/IEC/IEEE 29119. La inyección de fallas de interfaz reveló un defecto real que la suite heredada de más de 1500 pruebas no detectaba.

**Keywords—** pruebas de software, caja negra, pruebas de integración, inyección de fallas, ISO/IEC/IEEE 29119, Snipe-IT.

---

## 1. INTRODUCCIÓN

*(máximo 5 párrafos)*

Las pruebas de software constituyen la actividad de verificación y validación que aporta evidencia objetiva sobre la calidad de un producto antes de su liberación. En sistemas de gestión de inventario de TI, donde una operación incorrecta se traduce de inmediato en datos erróneos —activos duplicados, asientos de licencia sobreasignados o stock negativo—, la confianza en el sistema depende directamente de un proceso de pruebas riguroso y trazable.

El presente trabajo aplica un proceso de pruebas **multinivel** sobre **Snipe-IT**, un sistema libre de gestión de activos y licencias de TI (PHP 8.2+/Laravel 12), tomando como marco de referencia el estándar **ISO/IEC/IEEE 29119** (procesos y documentación de pruebas) y el modelo de calidad **ISO/IEC 25010**. El objetivo general es diseñar, ejecutar y documentar pruebas en los niveles **unitario, funcional (caja negra), de integración y de sistema**, además de plantear los criterios de aceptación del producto.

A diferencia de un desarrollo desde cero, Snipe-IT es un producto maduro que **ya incorpora** una amplia suite de pruebas automatizadas. Por ello, la estrategia no parte de un lienzo en blanco: se **aprovecha y documenta** la cobertura heredada, se **identifican sus vacíos** y se **aporta** código de prueba propio orientado precisamente a esas brechas, con especial énfasis en la **inyección de fallas de interfaz** (sintácticas, semánticas y de estado).

La principal contribución empírica del trabajo es que, pese a la extensa base heredada de pruebas de integración, la **inyección de una falla semántica** destapó un **defecto real del sistema** (aceptaba una fecha de devolución anterior a la de entrega), corregido y verificado mediante regresión. Este resultado sostiene la tesis de que una suite amplia no garantiza cobertura de la **coherencia semántica** entre datos, y justifica el diseño deliberado de casos negativos.

El resto del documento se organiza así: la Sección 2 presenta los antecedentes y el estado del arte; la Sección 3 describe el caso de estudio; la Sección 4 detalla la metodología; la Sección 5 expone los resultados y métricas; y las Secciones 6 y 7 recogen las conclusiones y los trabajos futuros.

---

## 2. ANTECEDENTES

### 2.1. Niveles y técnicas de prueba (Estado del arte)

*(máximo 6 párrafos, incluya citas)*

La disciplina de pruebas distingue **niveles** según el objeto bajo prueba: unitario, integración, sistema y aceptación. Myers, Sandler y Badgett [1] establecen que el propósito de una prueba es *encontrar* defectos, no demostrar su ausencia, y que un caso valioso es el que tiene alta probabilidad de revelar un error aún no detectado. Spillner, Linz y Schaefer [2] sistematizan este esquema por niveles y las técnicas asociadas, marco que este trabajo adopta como columna vertebral.

En el nivel de **caja negra**, las técnicas clásicas derivan casos desde la especificación sin acceso al código. Beizer [3] formaliza la **partición de equivalencia**, el **análisis de valores límite**, las **tablas de decisión** y las **pruebas de transición de estados**, todas empleadas en el diseño funcional de este estudio. Ammann y Offutt [4] ofrecen una base teórica moderna de criterios de cobertura que fundamenta la selección sistemática de casos.

Un enfoque complementario y potente es la **inyección de fallas** (*fault injection*), heredera de las ideas de análisis de mutaciones de DeMillo, Lipton y Sayward [5]: se introducen deliberadamente entradas erróneas o estados inconsistentes en las fronteras entre componentes para comprobar la robustez del manejo de errores. Este trabajo aplica inyección de fallas **sintácticas, semánticas y de estado** sobre la frontera de checkout de activos.

En cuanto a **normalización**, ISO/IEC/IEEE 29119 [6] define los procesos y la documentación de pruebas (plan de pruebas, especificación de casos y *test completion report*), mientras que ISO/IEC 25010 [7] proporciona el modelo de calidad (funcionalidad, seguridad, rendimiento, fiabilidad, etc.) utilizado para seleccionar los atributos **no funcionales** a verificar mediante **pruebas basadas en riesgo**.

La distribución del esfuerzo entre niveles se guía por la metáfora de la **pirámide de pruebas** popularizada por Cohn [8] y discutida por Fowler: muchas pruebas unitarias rápidas en la base, menos de integración en el medio y pocas de sistema (E2E) en la cúspide. Snipe-IT refleja esta forma, con cientos de pruebas unitarias y de integración y un conjunto reducido de recorridos E2E.

Finalmente, la literatura sobre pruebas de software **heredado y de terceros (COTS)** advierte que las suites existentes, aun siendo extensas, tienden a concentrarse en el "camino feliz" y a omitir combinaciones negativas o restricciones semánticas [4], [5]. Esta observación es central en el presente trabajo, pues motiva el diseño de casos negativos y de inyección de fallas como aporte diferenciador.

### 2.2. Pruebas continuas, entornos reproducibles y riesgo (Tema libre)

*(máximo 4 párrafos, incluya citas)*

La práctica moderna integra las pruebas en el flujo **CI/CD** dentro de una cultura **DevOps**: cada cambio dispara la ejecución automatizada de la suite, de modo que los defectos se detectan cerca de su introducción. Humble y Farley [9] argumentan que la automatización de pruebas y despliegues es condición necesaria para la entrega continua fiable; en este proyecto, GitHub Actions ejecuta la suite sobre una matriz de motores de base de datos (SQLite, MySQL/MariaDB, PostgreSQL).

La **reproducibilidad del entorno** es un requisito frecuentemente subestimado. Diferencias de dialecto SQL, de versión de intérprete o de límites de memoria producen falsos negativos que erosionan la confianza en la suite. La contenedorización con **Docker** [10] permite fijar un entorno idéntico para todo el equipo y para el CI; en este trabajo, un *runner* efímero con dos variantes (SQLite y MariaDB) resolvió tanto una incidencia de memoria como los falsos negativos por dialecto SQL.

En el nivel de **sistema**, probar todos los atributos no funcionales es inviable; ISO/IEC 29119 [6] recomienda **pruebas basadas en riesgo**, priorizando por *probabilidad × impacto*. Sobre el modelo ISO/IEC 25010 [7] se seleccionaron tres características —**Seguridad, Rendimiento y Fiabilidad**— por su alto riesgo y su observabilidad a nivel de sistema, descartando de forma justificada las de bajo riesgo (portabilidad, compatibilidad).

Para el recorrido de extremo a extremo (**E2E**) se adoptó la herramienta acorde al *stack*: así como en integración HTTP el rol de Supertest lo cumple la suite `Feature` de PHPUnit, en E2E el rol de Cypress/Playwright lo cumple **Laravel Dusk**, que controla un navegador real. Esta correspondencia herramienta–*stack* es coherente con la recomendación de elegir instrumentos que se integren de forma nativa con la plataforma bajo prueba [2].

**Figura 1 –** Pirámide de pruebas aplicada a Snipe-IT (unitario: 1 021 métodos, cobertura 85.14 %; integración: 1 653 casos efectivos; sistema: 6 recorridos E2E + 7 verificaciones no funcionales; aceptación: 7 criterios). *Fuente: elaboración propia.*
⟦Insertar aquí la figura de la pirámide de pruebas (puede construirse con los números de la tabla de resultados).⟧

---

## 3. CASO DE ESTUDIO

*(Software testeado, historia y componente identificado)*

**Snipe-IT** es una aplicación web libre y de código abierto para la **gestión de activos y licencias de TI** (inventario de equipos, asignación a empleados, control de licencias por asientos, consumibles, accesorios y componentes). Está desarrollada en **PHP 8.2+ sobre Laravel 12**, se distribuye bajo licencia **AGPL-3.0-or-later** y es mantenida por Grokability; el proyecto se trabajó sobre el *fork* académico `jhuamaniCond/snipe-it`. Es un producto maduro y ampliamente adoptado, lo que lo convierte en un caso representativo de **sistema real en producción** más que en un ejercicio de laboratorio.

Desde el punto de vista estructural, el sistema comprende (medición verificada sobre el repositorio): **41 modelos** Eloquent, **91 controladores** (61 web + 30 API), **22 políticas** de autorización, **29 factories** y **444 migraciones**. Trae de fábrica una base de pruebas considerable —principalmente de **integración**: **≈296 archivos / 1 509 métodos** en `tests/Feature/`— y una base **unitaria** menor que el grupo **amplió** durante el proyecto (de ≈279 a **1 021 métodos**, cobertura de líneas 85.14 %). Esto impone una estrategia de **aprovechar, documentar y ampliar** en lugar de reescribir; el árbol actual suma **170 archivos unitarios** y **302 de integración**.

El **componente identificado** como núcleo del estudio es el conjunto de **operaciones de inventario**: alta de activos con *asset tag* único (RF-01), **checkout/checkin** de activos (RF-02/RF-03), gestión de **licencias por asientos** (RF-04/RF-05), consumibles (RF-06), reglas de borrado referencial de categorías (RF-07), disponibilidad según *status label* (RF-08), autenticación (RF-09), gestión de usuarios (RF-10) y **checkout/checkin de accesorios** (RF-11). La frontera `AssetCheckoutController → Asset::checkOut()` se eligió como punto de **inyección de fallas de interfaz** por concentrar validación, cambio de estado y bitácora.

---

## 4. METODOLOGÍA

### Pasos Realizados

*(planificación, desarrollo, tipos de pruebas y herramientas)*

El trabajo se organizó por **hitos y sprints** siguiendo Scrum, con soporte DevOps (GitHub Projects, Issues, Actions y Wiki). Toda la documentación se estructuró conforme a **ISO/IEC/IEEE 29119-3**, separando de forma estricta lo **diseñado** de lo **ejecutado** y evitando consignar resultados no obtenidos como si hubieran pasado.

**(1) Pruebas unitarias (caja blanca).** Se inventarió la suite unitaria heredada y se ejecutó una **campaña de cobertura** con **PHPUnit + PCOV** que priorizó brechas por módulo (AssetModel, Consumable, License, Statuslabel), elevando la cobertura de líneas del núcleo de dominio del **8.49 % al 85.14 %** (16 915/19 868) y llevando la suite a **1 021 métodos** en 170 archivos. La medición se automatiza en CI mediante el *workflow* `tests-unit-coverage.yml` y se respalda con el artefacto verificable `clover.xml`. En el proceso se detectaron y corrigieron **3 defectos reales** de producción (p. ej., en `BooleanEncrypted` y `CheckinAssetNotification`).

**(2) Pruebas funcionales (caja negra, manual).** Se diseñaron **15 casos principales (CPF-01…CPF-15) y 46 subcasos** que cubren los 11 requisitos funcionales, combinando **partición de equivalencia, valores límite, tablas de decisión y transición de estados**. La ejecución fue manual sobre Snipe-IT desplegado con **Docker Compose**, registrando veredicto (Conforme/No conforme/Bloqueado) y **evidencia por captura**.

**(3) Pruebas de integración.** Se ejecutó la suite `Feature` heredada en un **runner Docker reproducible** con dos variantes de base de datos (**SQLite** en memoria y **MariaDB 11.4.7**). Como aporte propio se implementaron **24 casos** en `tests/Feature/Integracion/`, incluyendo **inyección de fallas de interfaz** —FI-01 sintáctica, FI-02 semántica, FI-03 de estado— y refuerzos (FMCS *cross-company*, agotamiento de asientos, campos personalizados, depreciación y disponibilidad por *status label*). Cada falla que reveló un defecto se documentó con plantilla de **Reporte de Incidente** (Esperado vs Real) y su GitHub Issue.

**(4) Pruebas de sistema (E2E + no funcionales).** Sobre la app desplegada se verificaron atributos **no funcionales** priorizados por riesgo (Seguridad, Rendimiento, Fiabilidad, ISO 25010) mediante mediciones HTTP (`curl`), y se automatizaron recorridos **E2E** con **Laravel Dusk** (navegador real) orquestando Selenium/Chrome + app + MariaDB en Docker, con ejecución en CI Linux.

**(5) Pruebas de aceptación.** Se redactaron **7 criterios de aceptación** (ACC-01…ACC-07) en formato *Dado–Cuando–Entonces*, trazados a las historias de usuario, para su validación (UAT) por un rol de *stakeholder*.

La **trazabilidad** requisito ↔ caso ↔ evidencia ↔ resultado se consolidó en una **Matriz de Trazabilidad** que vincula los cuatro niveles.

---

## 5. RESULTADOS

*(componentes, requisitos probados, casos diseñados, resultados, métricas)*

**Cobertura y volumen.** Se cubrieron los **11 requisitos funcionales** (RF-01…RF-11) con **15 casos principales y 46 subcasos** de caja negra; **13 de 15** cuentan además con cobertura automatizada de referencia. La suite alcanzó **1 021 métodos unitarios** (cobertura de líneas **85.14 %** en el núcleo de dominio) y **1 653 casos de integración efectivos**.

**Nivel funcional (Hito 2).** De 61 casos ejecutados (15 principales + 46 subcasos), **60 resultaron Conforme** y **1 No conforme**: el caso **CPF-12.2** (bloqueo por exceso de intentos de *login*), registrado como defecto **INC-RF09-001**; se constató que la prueba de *throttling* de referencia está suprimida (`markTestIncomplete`) por inestabilidad del *Rate Limiter*. No hubo casos bloqueados.

**Nivel de integración (Hito 3).** De **1653 casos**, **1649 pasaron en SQLite** (99.76 %). De los 4 fallos, **3 se debieron a diferencias de dialecto SQL** (SQLite no soporta `HAVING` sobre alias no agregado) y **pasan en MariaDB**; el **4.º fue un defecto de la propia prueba** (INC-01, aserción incompatible con un evento falseado), corregido. Con el fix y la variante MariaDB, **no quedan fallos reales**. El aporte propio (**24 casos**) obtuvo **24/24 en SQLite** y **19 + 5 *incomplete* en MariaDB** (los 5 de campos personalizados se omiten por diseño en MySQL, como en la suite original).

**Hallazgo principal (INC-02).** La inyección de la **falla semántica FI-02** reveló que Snipe-IT **aceptaba un checkout con fecha de devolución anterior a la de entrega** (`expected_checkin` < `checkout_at`), tanto por UI como por API. La causa raíz fue una validación incompleta (`nullable|date` sin comparación entre fechas). Se corrigió con la regla condicional `after_or_equal:checkout_at` y se verificó con una **regresión de 140 pruebas / 488 aserciones sin fallos**. Es la evidencia empírica de que una suite amplia no cubre necesariamente la coherencia semántica.

**Nivel de sistema (Hito 3).** Las verificaciones **no funcionales** ejecutadas pasaron **4/4**: redirección **302** de ruta protegida sin sesión, **cabeceras de seguridad** correctas (`X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`, cookie `httponly`, CSRF), **TTFB ≈ 0.08 s** en `/login` (umbral < 2 s) y **404 controlado**. La automatización **E2E** (Laravel Dusk) quedó **implementada y con infraestructura verificada**, pero su corrida en CI **aún no está en verde** (en estabilización); se reporta con transparencia, sin darla por aprobada.

**Síntesis de defectos.** Se identificaron y gestionaron: **INC-02** (defecto del sistema, resuelto), **INC-01** (defecto de prueba, resuelto), **INC-RF09-001** (no conformidad funcional del *throttling*) y la observación **OBS-01** (dialecto SQLite, no defecto). La tabla siguiente resume las métricas por nivel.

| Nivel | Casos / alcance | Resultado | Defectos |
|-------|-----------------|-----------|----------|
| Unitario | 1 021 métodos (campaña de cobertura) | 85.14 % líneas (núcleo) · en verde | 3 corregidos |
| Funcional (caja negra) | 15 casos + 46 subcasos (RF-01…RF-11) | 60 Conforme · 1 No conforme · 0 Bloqueado | INC-RF09-001 |
| Integración | 1653 casos + 24 propios | 1649/1653 SQLite · 100 % con MariaDB+fix | INC-01, **INC-02** |
| Sistema | 7 no funcionales + 6 E2E | NF 4/4 PASS · E2E en estabilización | 0 (1 observación) |
| Aceptación | 7 criterios ACC-01…07 | UAT planificado | — |

---

## 6. CONCLUSIONES

*(conclusiones directas del trabajo realizado)*

1. El proceso de pruebas **multinivel** sobre Snipe-IT confirmó que el producto es **funcionalmente correcto** en las operaciones de inventario evaluadas: 60/61 casos de caja negra Conforme y 1649/1653 de integración en verde (100 % con MariaDB tras corregir un defecto de prueba).

2. La **inyección de fallas de interfaz** demostró un valor superior al de la mera ejecución de la suite heredada: la falla semántica FI-02 **destapó un defecto real (INC-02)** que más de 1500 pruebas de integración no detectaban, evidenciando que la cobertura amplia no implica cobertura de la **coherencia semántica** entre datos.

3. La **reproducibilidad del entorno** (Docker con variantes SQLite y MariaDB) fue decisiva: separó los **falsos negativos por dialecto** de los defectos reales y resolvió una incidencia de memoria, elevando la confianza en los resultados.

4. La **selección no funcional basada en riesgo** (Seguridad, Rendimiento, Fiabilidad sobre ISO/IEC 25010) permitió verificar los atributos de mayor impacto a nivel de sistema con evidencia real, sin dispersar el esfuerzo.

5. Se practicó una **documentación honesta** conforme a ISO/IEC/IEEE 29119: los recorridos E2E automatizados se reportan como **implementados pero aún no verdes**, sin inflar resultados, entregando una automatización lista para estabilizar.

---

## 7. TRABAJOS FUTUROS

Como trabajos futuros se consideran los siguientes:

- **Estabilizar la corrida E2E** (Laravel Dusk) en CI Linux: ajustar esperas de arranque de la app y selectores `select2` del checkout hasta obtener la suite en verde.
- **Completar las pruebas no funcionales pendientes:** NF-SEC-02 (403 con usuario limitado autenticado), NF-PERF-02 (listado con dataset de ≈500 activos) y NF-REL-01 (bloqueo por *throttling* de *login*).
- **Ejecutar la sesión de aceptación (UAT)** de los criterios ACC-01…ACC-07 y levantar el acta de aceptación.
- **Ampliar la inyección de fallas** a otras fronteras (licencias, consumibles, API v1) y explorar **pruebas basadas en mutación** para medir la eficacia de la suite.
- **Integración *Large*** con servicios externos reales (LDAP/SAML, correo, almacenamiento) mediante dobles de prueba controlados.

---

## Referencias

*(Formato IEEE — ajustar al estilo exacto exigido por el docente.)*

[1] G. J. Myers, C. Sandler, y T. Badgett, *The Art of Software Testing*, 3.ª ed. Hoboken, NJ, EE. UU.: Wiley, 2012.

[2] A. Spillner, T. Linz, y H. Schaefer, *Software Testing Foundations: A Study Guide for the Certified Tester Exam*, 5.ª ed. Santa Barbara, CA, EE. UU.: Rocky Nook, 2021.

[3] B. Beizer, *Software Testing Techniques*, 2.ª ed. Nueva York, NY, EE. UU.: Van Nostrand Reinhold, 1990.

[4] P. Ammann y J. Offutt, *Introduction to Software Testing*, 2.ª ed. Cambridge, Reino Unido: Cambridge University Press, 2016.

[5] R. A. DeMillo, R. J. Lipton, y F. G. Sayward, "Hints on test data selection: Help for the practicing programmer," *Computer*, vol. 11, n.º 4, pp. 34–41, 1978.

[6] ISO/IEC/IEEE 29119, *Software and Systems Engineering — Software Testing — Parts 1–4*. Ginebra, Suiza: ISO/IEC/IEEE, 2013/2021.

[7] ISO/IEC 25010, *Systems and Software Engineering — Systems and Software Quality Requirements and Evaluation (SQuaRE) — System and Software Quality Models*. Ginebra, Suiza: ISO/IEC, 2011.

[8] M. Cohn, *Succeeding with Agile: Software Development Using Scrum*. Boston, MA, EE. UU.: Addison-Wesley, 2009.

[9] J. Humble y D. Farley, *Continuous Delivery: Reliable Software Releases through Build, Test, and Deployment Automation*. Boston, MA, EE. UU.: Addison-Wesley, 2010.

[10] D. Merkel, "Docker: Lightweight Linux containers for consistent development and deployment," *Linux Journal*, vol. 2014, n.º 239, art. 2, 2014.

---

*Fin del borrador — Informe final (formato paper). Volcar en la plantilla .docx respetando su maquetación a dos columnas.*
