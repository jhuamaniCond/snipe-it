# Guía — Despliegue de Snipe-IT en la nube (URL permanente para QA y sustentación)

> Objetivo: tener una **URL pública compartida** (entorno QA/staging en la nube) donde todo el grupo
> ejecute las pruebas que requieren sistema desplegado (**caja negra manual, sistema/E2E, no funcionales, aceptación/UAT**),
> y que sirva de **demo en la sustentación (16/17 JUL)**.
>
> Ventaja de nuestro proyecto: ya usamos la **imagen oficial `snipe/snipe-it`** en `docker-compose.yml`,
> así que en la nube se despliega **exactamente el mismo contenedor**, sin build propio.

---

## ¿Railway o Render? (decisión rápida)

| | **Railway (RECOMENDADO)** | Render (alternativa) |
|---|---|---|
| MySQL/MariaDB gestionado | ✅ Sí (1 clic) | ❌ No (solo PostgreSQL; Snipe-IT necesita MySQL) |
| Desplegar imagen Docker pública | ✅ Sí | ✅ Sí |
| Costo | Trial con crédito inicial (~$5) + plan Hobby $5/mes | Free tier con *sleep* tras inactividad |
| Veredicto | **Usar Railway**: MySQL nativo = despliegue directo | Solo si consiguen un MySQL externo aparte |

> Snipe-IT **no funciona en Vercel** (Vercel es serverless para JS; no hospeda PHP/Laravel + MySQL persistente).

---

## Despliegue en Railway (paso a paso, ~20 min)

### Paso 1 — Cuenta y proyecto
1. Entrar a **https://railway.app** → **Login with GitHub** (cuenta del grupo, p. ej. `jhuamaniCond`).
2. **New Project**.

### Paso 2 — Base de datos MySQL
1. En el proyecto: **+ Create → Database → Add MySQL**.
2. Railway crea el servicio `MySQL` con variables propias (`MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`). No hay que configurar nada más.

### Paso 3 — Servicio de la app (imagen oficial)
1. **+ Create → Docker Image** → escribir: `snipe/snipe-it:latest`.
2. En el servicio de la app → pestaña **Variables** → añadir (usando **referencias** al servicio MySQL):

```env
# App
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:3ilviXqB9u6DX1NRcyWGJ+sjySF+H18CPDGb3+IVwMQ=
APP_URL=https://TU-DOMINIO.up.railway.app        # se completa en el Paso 4
APP_TIMEZONE=UTC
APP_LOCALE=en-US

# Base de datos (referencias a las variables del servicio MySQL de Railway)
DB_CONNECTION=mysql
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_DATABASE=${{MySQL.MYSQLDATABASE}}
DB_USERNAME=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}

# Detrás del proxy HTTPS de Railway
APP_TRUSTED_PROXIES=*
SECURE_COOKIES=true

# Correo (demo: no envía nada real)
MAIL_MAILER=smtp
MAIL_HOST=localhost
MAIL_PORT=1025
MAIL_FROM_ADDR=qa@example.com
MAIL_FROM_NAME=Snipe-IT QA
```

> La `APP_KEY` es la misma de nuestro `.env.docker` (válida). En un sistema real se generaría una nueva.

3. Pestaña **Settings → Volumes**: **Add Volume** montado en **`/var/lib/snipeit`** (persistencia de uploads, igual que el volumen `storage` del compose local).

### Paso 4 — Dominio público
1. Servicio de la app → **Settings → Networking → Generate Domain**.
2. Puerto de destino: **80** (la imagen sirve en el 80, igual que local).
3. Copiar el dominio generado (p. ej. `snipe-it-qa.up.railway.app`) y **actualizar la variable `APP_URL`** con `https://ese-dominio` → Railway redespliega solo.

### Paso 5 — Configuración inicial de Snipe-IT
1. Abrir `https://TU-DOMINIO.up.railway.app` → aparece el **Setup Wizard** (igual que en local).
2. Pre-Flight ✓ → crear el **usuario admin** del grupo → listo.

### Paso 6 — Sembrar los datos de prueba QA
Recrear los datos de los guiones de caja negra (RF-02…RF-11): status `Ready to Deploy`, manufacturer `Dell`, categoría `Laptops`, modelo `Latitude 5540`, location `Oficina Lima`, usuarios `jperez`/`alimitada`, activos `QA-A-001`…, licencias, accesorios. Dos formas:
- **Por la GUI** (como en el Hito 2), o
- Por CLI de Railway: `railway run php artisan tinker` y pegar los seeds de `trabajoLibelula/` (scripts `seed_rf03_rf04.php`, `seed_rf05_rf11.php`).

---

## Qué pruebas se ejecutan contra esta URL (y cuáles no)

| Prueba | ¿Contra la URL de la nube? |
|---|---|
| Caja negra funcional manual (CPF-xx) | ✅ Sí — todo el grupo, mismo entorno |
| Sistema: no funcionales (seguridad/rendimiento/fiabilidad, `curl`) | ✅ Sí — repetir las mediciones del Informe apuntando al dominio |
| Sistema: E2E (Dusk) | ✅ Puede apuntarse `APP_URL` del stack E2E a esta URL (solo lectura de la demo: ojo, Dusk **trunca BD**, usarlo solo contra BD de prueba, **no** contra la demo) |
| Aceptación / UAT | ✅ Sí — el "usuario" entra por el link |
| Unitarias / Integración (PHPUnit) | ❌ No — siguen en CI (GitHub Actions, que ya es nube) |

> ⚠️ **Regla:** las pruebas **destructivas/automatizadas** (Dusk trunca tablas) **nunca** contra la instancia demo con los datos de la sustentación. La demo es para pruebas manuales y lectura.

---

## Checklist para la sustentación (16/17 JUL)

- [ ] URL pública funcionando y con datos QA sembrados.
- [ ] URL documentada en: `HITO-2/README.md` (mapa de artefactos), Wiki (página de entorno QA) y el artículo IEEE (sección Propuesta/Resultados).
- [ ] Credenciales demo listas (admin del grupo + `jperez`/`alimitada` para mostrar permisos).
- [ ] Verificar **2 días antes** que el servicio sigue activo (crédito/trial de Railway).
- [ ] Plan B para el día de la demo: túnel `cloudflared`/`ngrok` sobre el Docker local (URL temporal en 2 min) por si la nube falla.

## Costos y vigencia
- Railway trial: crédito único (~$5). Snipe-IT + MySQL consumen poco; alcanza para **~1–2 semanas** encendido.
- Para ahorrar crédito: **apagar los servicios** (Settings → Remove/Sleep) entre sesiones de prueba y reactivarlos antes de la sustentación.

---

*Guía de despliegue en nube — Hito 3 · Entorno QA compartido. Curso de Pruebas de Software.*
