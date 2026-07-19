# Evidencia — Atributo SEGURIDAD (y Fiabilidad complementaria) con K6

> Fecha: 2026-07-09 · Cliente: `grafana/k6:1.0.0` (Docker, versión fijada, **externo al SUT**)
> SUT: `http://159.223.135.124/` — VM DigitalOcean (Docker: Snipe-IT + MariaDB 11.4.7)
> Script: `tests/tests_k6/k6-seguridad.js` · Config: 1 VU · 1 iteración (solo lectura)
> Umbral: `checks: rate==1.0` (el 100 % de las verificaciones debe cumplirse)

---

## 1. Demostración: K6 SÍ verifica seguridad (no solo carga)

Se comprobó empíricamente que K6 puede inspeccionar controles de seguridad HTTP mediante `check()`:
- `redirects: 0` → no sigue redirecciones (permite asertar el **302**).
- `res.headers` → cabeceras de seguridad.
- `res.cookies[...][0].http_only` → atributos de cookies.
- `res.body` → ausencia de datos sensibles / stacktrace.

## 2. Resultado (salida real de K6)

```
█ THRESHOLDS
  checks   ✓ 'rate==1.0'  rate=100.00%
  checks_succeeded: 100.00%  (14 de 14)
  checks_failed:      0.00%  (0 de 14)
```

| # | Verificación | Atributo | Resultado |
|---|--------------|----------|-----------|
| 1 | `GET /` sin sesión → 302 | Seguridad NF-SEC-01 | ✅ |
| 2 | `GET /` redirige a `/login` | Seguridad NF-SEC-01 | ✅ |
| 3 | `GET /hardware` sin sesión → 302 | Seguridad NF-SEC-01 | ✅ |
| 4 | `GET /hardware` redirige a `/login` | Seguridad NF-SEC-01 | ✅ |
| 5 | `GET /hardware` no expone datos (sin `asset_tag` en el cuerpo) | Seguridad NF-SEC-01 | ✅ |
| 6 | `GET /login` → 200 | Seguridad | ✅ |
| 7 | `X-Frame-Options: DENY` (anti-clickjacking) | Seguridad NF-SEC-hdr | ✅ |
| 8 | `X-Content-Type-Options: nosniff` | Seguridad NF-SEC-hdr | ✅ |
| 9 | `Referrer-Policy` presente | Seguridad NF-SEC-hdr | ✅ |
| 10 | Cookie de sesión `snipeit_session` es **httpOnly** | Seguridad NF-SEC-hdr | ✅ |
| 11 | Token CSRF presente (cookie `XSRF-TOKEN`) | Seguridad NF-SEC-hdr | ✅ |
| 12 | Formulario de login con campo `_token` (CSRF) | Seguridad NF-SEC-hdr | ✅ |
| 13 | Ruta inexistente → 404 | Fiabilidad NF-REL-02 | ✅ |
| 14 | 404 sin stacktrace expuesto | Fiabilidad NF-REL-02 | ✅ |

**Veredicto: 14/14 PASS.** El sistema desplegado protege las rutas sin sesión, aplica las cabeceras de seguridad correctas, marca la cookie de sesión como `httpOnly`, incluye protección CSRF y maneja errores sin filtrar trazas.

## 3. Nota de trazabilidad (transparencia)

La primera corrida marcó 13/14 por un **error del script de prueba** (se consultaba el atributo de cookie como `httpOnly` cuando K6 lo expone como `http_only`), no por un fallo del sistema: la respuesta HTTP real muestra `snipeit_session=...; httponly`. Corregido el aserto, la corrida da **14/14**. (Ejemplo de defecto en el *test*, no en el SUT — consistente con lo visto en integración con INC-01.)

## 4. Reproducir

```powershell
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-seguridad.js
```

*Evidencia K6 — Seguridad · Hito 3 · Pruebas de Sistema.*
