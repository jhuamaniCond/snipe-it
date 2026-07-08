# Guía — Instalación y ejecución de las pruebas E2E con Laravel Dusk

> Pruebas de **Sistema (E2E)** por navegador real. Requisito de entorno distinto al de Unit/Feature: **la app debe estar corriendo (servidor real)** y hace falta **Chrome + ChromeDriver**.

---

## 0. Por qué E2E necesita otro entorno (resumen)

| | Unit / Feature | **Sistema / E2E (Dusk)** |
|---|---|---|
| Cómo corre | En el proceso PHP (simula la petición) | **Navegador Chrome** contra la app **servida** |
| Necesita servidor corriendo | ❌ No | ✅ **Sí** |
| Necesita navegador | ❌ No | ✅ **Sí (Chrome + ChromeDriver)** |
| Base de datos | SQLite `:memory:` / MariaDB efímera | **BD dedicada de prueba** (no la data demo real) |

> ⚠️ **Importante:** Dusk **borra/trunca** la BD entre pruebas (`DatabaseTruncation`). **No** apuntes Dusk a la BD del despliegue con tus datos demo — usa una **BD de prueba dedicada** para no perderlos.

---

## 1. Instalación (una vez)

Desde la raíz del repo, con tu sesión de GitHub activa (evita el error de autenticación que aparece en entornos sin token):

```bash
composer require --dev laravel/dusk
php artisan dusk:install                 # crea tests/DuskTestCase.php y el andamiaje
php artisan dusk:chrome-driver --detect  # descarga el ChromeDriver de tu versión de Chrome
```

`dusk:install` genera `tests/DuskTestCase.php` (del que ya heredan nuestros tests en `tests/Browser/`).

## 2. Configurar el entorno de ejecución

Crea `.env.dusk.local` (Dusk lo usa al correr) apuntando a una **BD de prueba dedicada** y al servidor local:

```dotenv
APP_ENV=local
APP_URL=http://127.0.0.1:8000
APP_KEY=base64:...        # copia una válida (php artisan key:generate --show)

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=snipeit_dusk  # BD de prueba, NO la de producción/demo
DB_USERNAME=root
DB_PASSWORD=

MAIL_MAILER=array
```

Prepara esa BD:
```bash
php artisan migrate --env=dusk.local
```

## 3. Levantar el servidor y ejecutar

Dusk necesita la app **servida** en `APP_URL`. En una terminal:
```bash
php artisan serve            # sirve en http://127.0.0.1:8000
```
En otra terminal:
```bash
php artisan dusk             # ejecuta tests/Browser/*
# o un archivo:
php artisan dusk tests/Browser/AuthenticationE2ETest.php
```

> Alternativa: correr contra el **contenedor Docker** (`docker compose up -d`) poniendo `APP_URL=http://localhost:8000`, pero **solo** si esa instancia usa una BD desechable (por el truncado). Para el día a día, `php artisan serve` + BD `snipeit_dusk` es lo más seguro.

## 4. Tests E2E incluidos (aporte del grupo)

| Archivo | Casos | RF |
|---|---|---|
| `tests/Browser/AuthenticationE2ETest.php` | E2E-01 login válido · E2E-01b login inválido · E2E-06 logout | RF-09 |
| `tests/Browser/AssetE2ETest.php` | E2E-02 activo visible en la UI · E2E-03 la UI ofrece Checkout | RF-01, RF-02 |

## 5. Notas de primer arranque (esperables en E2E)

- **Selectores select2 (JS):** los formularios de crear/checkout usan `select2`. El paso de "elegir destino" puede requerir abrir el dropdown y seleccionar (`->click`, `->script`, o atributos `@dusk`). Los tests dejan ese paso marcado como refinamiento.
- **Screenshots:** ante un fallo, Dusk guarda captura en `tests/Browser/screenshots/` — útil como evidencia.
- **Headless en CI:** en GitHub Actions se ejecuta Chrome headless; fija la versión de Chrome en el workflow.

## 6. Estado

- ✅ Tests E2E escritos en `tests/Browser/` (código propio del grupo).
- 🕗 **Ejecución pendiente:** requiere la instalación de Dusk (paso 1) en un entorno con Chrome + GitHub autenticado. En el entorno de asistencia la instalación falló por autenticación con GitHub (sin token); en la máquina del grupo funciona con normalidad.

---

*Guía E2E (Dusk) — Hito 3 · Pruebas de Sistema.*
