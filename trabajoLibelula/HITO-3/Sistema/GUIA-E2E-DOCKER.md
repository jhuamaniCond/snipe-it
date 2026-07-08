# Guía — E2E (Laravel Dusk) 100% en Docker

> Ejecuta las pruebas de **Sistema E2E** sin usar puertos del host. Resuelve el bloqueo
> `Failed to listen on 127.0.0.1:8000` (puertos reservados por Docker/Hyper-V en Windows sin admin):
> el navegador, la app y Dusk se comunican por la **red interna** de Docker.

---

## Por qué Docker (y no local)
En tu equipo, Windows/Hyper-V reserva el rango de puertos y, sin permisos de administrador, `php artisan serve` no puede escuchar. En Docker **no se necesita ningún puerto del host**: todo ocurre dentro de la red de contenedores.

## Arquitectura

```
[ dusk ] --WebDriver--> [ selenium (Chrome headless) ] --HTTP--> [ app-e2e (Snipe-IT) ] --SQL--> [ db-e2e (MariaDB) ]
```

- **db-e2e**: MariaDB efímera (BD `snipeit_e2e`, en RAM/tmpfs).
- **selenium**: Chrome + WebDriver (headless) en `selenium:4444`.
- **app-e2e**: la app servida en `http://app-e2e` (interno).
- **dusk**: corre `php artisan dusk` contra el Chrome remoto.

## Requisito
- **Docker Desktop abierto.** Nada más (no hace falta Chrome local ni puertos libres).

## Ejecutar (desde la raíz del repo)

```powershell
# Corre los E2E (construye imagen la 1.ª vez, descarga Selenium/MariaDB)
docker compose -f trabajoLibelula/HITO-3/Sistema/docker-compose.e2e.yml up --build --exit-code-from dusk dusk

# Al terminar, limpia (borra la BD efímera):
docker compose -f trabajoLibelula/HITO-3/Sistema/docker-compose.e2e.yml down -v
```

- La **1.ª vez** descarga la imagen de Selenium (~1.5 GB) y construye la de PHP: tarda unos minutos.
- El resultado (PASS/FAIL de `tests/Browser/*`) sale en la salida del servicio `dusk`.
- Las **capturas** de fallos quedan en `tests/Browser/screenshots/` (montado desde el repo).

## Cómo funciona la base de datos
`dusk` corre `php artisan migrate --force` sobre `snipeit_e2e`, y entre pruebas **trunca** (trait `DatabaseTruncation`). La app (`app-e2e`) lee esa misma BD. **Tus datos demo de la app real NO se tocan** (esto usa una BD aparte y efímera).

## Si algo falla (primer arranque)

| Síntoma | Solución |
|---|---|
| Dusk no conecta al navegador | Cambia `DUSK_DRIVER_URL` a `http://selenium:4444` (sin `/wd/hub`) en el compose |
| `app-e2e` redirige a `/setup` | Snipe-IT pide configuración inicial en BD vacía; los tests crean su usuario, pero si aparece, se añade un `Setting::factory()` al setUp del test |
| Chrome se cae por memoria | Ya está `shm_size: 2gb` en `selenium`; súbelo si hace falta |
| Página con error 500 | En MySQL no hay problemas de dialecto (a diferencia de SQLite); revisar log de `app-e2e` |

## Tests incluidos
- `tests/Browser/AuthenticationE2ETest.php` — login válido/ inválido, logout (RF-09).
- `tests/Browser/AssetE2ETest.php` — activo visible en la UI, la UI ofrece Checkout (RF-01/02).

## Para CI (GitHub Actions)
Este mismo compose se puede invocar en un workflow (Chrome headless en contenedor), dejando la **evidencia de E2E automatizado en el pipeline** (suma en la rúbrica de DevOps).

---

*Guía E2E Docker — Hito 3 · Pruebas de Sistema.*
