# Evidencia — Pruebas de sistema no funcionales (HTTP) sobre la app desplegada

> Mediciones reales contra el sistema **desplegado con Docker Compose** (`http://localhost:8000`).
> Fecha: 2026-07-08. Método: `curl -w` (estados y tiempos) y revisión de cabeceras.

---

## NF-SEC — Seguridad

**NF-SEC-01 — Ruta protegida sin sesión:**
```
GET /hardware  ->  HTTP 302  ->  Location: http://localhost:8000/login
GET /hardware (siguiendo redirect)  ->  HTTP 200 en /login
```
✅ **PASS** — una ruta protegida no expone datos sin autenticación; redirige a login.

**NF-SEC (cabeceras de seguridad en `/login`):**
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: same-origin
Set-Cookie: snipeit_session=... ; httponly; samesite=lax
Set-Cookie: XSRF-TOKEN=... ; samesite=lax        (protección CSRF)
```
✅ **PASS** — controles presentes: anti-clickjacking (DENY), anti-MIME-sniffing, política de referer, cookie de sesión `httponly`, y token CSRF.

---

## NF-REL — Fiabilidad

**NF-REL-02 — Manejo de ruta inexistente:**
```
GET /ruta-inexistente-xyz  ->  HTTP 404
```
✅ **PASS** — error controlado (404), sin traza/stacktrace.

---

## NF-PERF — Rendimiento

**NF-PERF-01 — Tiempo de carga de `/login` (5 tomas):**
```
toma 1: total 0.085 s | TTFB 0.080 s
toma 2: total 0.071 s | TTFB 0.067 s
toma 3: total 0.086 s | TTFB 0.082 s
toma 4: total 0.081 s | TTFB 0.078 s
toma 5: total 0.083 s | TTFB 0.080 s
```
Promedio TTFB ≈ **0.077 s**. ✅ **PASS** — muy por debajo del umbral (< 2 s).

---

## Pendiente de ejecución (requiere pasos adicionales)
- **NF-SEC-02** (403 de usuario sin permiso) — vía E2E/HTTP autenticado.
- **NF-PERF-02** (listado con ≈500 activos) — sembrar dataset de volumen.
- **NF-REL-01** (throttling de login) — POST repetidos con CSRF hasta el lockout.
- **E2E-01…E2E-06** (recorridos por navegador) — requieren **Laravel Dusk** + ChromeDriver.

---

## Reproducir
```bash
docker compose up -d
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8000/hardware      # 302
curl -s -D - -o /dev/null http://localhost:8000/login | grep -iE "x-frame|referrer|x-content"
curl -s -o /dev/null -w "%{time_starttransfer}s\n" http://localhost:8000/login
docker compose stop
```

*Evidencia — Pruebas de Sistema no funcionales · Hito 3.*
