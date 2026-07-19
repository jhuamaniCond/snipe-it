# Evidencia — Perfiles de carga K6 (configuración mínima del docente + escenario real)

> Fecha: 2026-07-09 · Cliente: `grafana/k6:1.0.0` (Docker, versión fijada, **externo al SUT**)
> SUT: `http://159.223.135.124/login` (GET, solo lectura) — VM DigitalOcean **1 vCPU / 1 GB RAM**, Docker Compose (Snipe-IT + MariaDB 11.4.7)
> Umbrales: `p(95) < 2000 ms` · `errores < 1 %` · *think time* 1 s por iteración
> Script: `tests/tests_k6/k6-perfil-carga.js` (perfil por variable `PERFIL`)

---

## 1. Tabla de registro por escenario (métricas exigidas)

| Escenario | VUs | Duración | **Iteraciones** | **T. promedio** | **T. máximo** | **Throughput** | **Exitosas** | **Fallidas** | **% errores** | p95 | Umbral p95 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|:--:|
| smoke (previo) | 5 | 30 s | 95 | 0.58 s | 0.73 s | 3.15 req/s | 95 | 0 | 0.00 % | 0.69 s | ✅ |
| **esc20** (mín. 1) | 20 | 30 s | **275** | **1.23 s** | **5.15 s** | **8.73 req/s** | **275** | **0** | **0.00 %** | 1.98 s | ✅ *(al límite)* |
| **esc50** (mín. 2) | 50 | 45 s | **417** | **4.74 s** | **15.35 s** | **8.47 req/s** | **417** | **0** | **0.00 %** | 12.10 s | ❌ |
| **esc100** (mín. 3) | 100 | 60 s | **459** | **13.02 s** | **37.06 s** | **6.83 req/s** | **459** | **0** | **0.00 %** | 29.52 s | ❌ |
| **rampa** (adicional) | 0→20→50→100→0 | 120 s | **639** | **8.03 s** | **23.33 s** | **5.31 req/s** | **639** | **0** | **0.00 %** | 20.20 s | ❌ |

*(Exitosas/Fallidas: `http_req_failed` = 0 en los 5 escenarios; checks `status 200` al 100 % — 275/275, 417/417, 459/459, 639/639.)*

## 2. Escenario adicional elegido y su justificación

**`rampa` (ramping-vus 0→20→50→100→0, 30 s por tramo).** En un proyecto real la carga **no aparece de golpe**: un sistema interno de inventario TI recibe a su personal de forma **escalonada** (llegada matinal → hora pico → descenso). El executor `ramping-vus` reproduce ese patrón y permite observar cómo el sistema **entra y sale** de la zona de saturación (mínimo 0.19 s en los tramos valle vs. máximo 23.3 s en el pico). *Alternativas documentadas: spike (pico súbito, p. ej. inicio de jornada exacto) y soak (resistencia prolongada, fugas de memoria).*

## 3. Interpretación de los resultados (qué significan)

1. **Cero errores en ~1 900 peticiones totales (0.00 % en los 5 escenarios).** El sistema **nunca se rompe**: no hubo 5xx ni conexiones rechazadas. Ante sobrecarga, Snipe-IT/Apache **encolan** las peticiones y todas terminan en 200. Esto es **degradación elegante** — un atributo positivo de robustez.

2. **El punto de saturación del entorno está en ≈ 20 usuarios concurrentes (~8.5–8.7 req/s).** El throughput crece de 3.15 (5 VUs) a **8.73 req/s (20 VUs)** y ahí se **estanca** (8.47 con 50 VUs): esa es la **capacidad máxima de procesamiento** de la VM de 1 vCPU. A partir de ese punto, añadir usuarios ya no añade trabajo procesado — solo **cola**.

3. **Por encima de la saturación, la latencia crece de forma casi lineal con los usuarios** (Ley de Little): p95 pasa de 1.98 s (20 VUs) → 12.1 s (50) → 29.5 s (100). Cada usuario extra espera detrás de los demás.

4. **Con 100 VUs el throughput además CAE (8.7 → 6.8 req/s):** la VM gasta recursos en administrar 100 conexiones simultáneas (cambio de contexto, memoria) en lugar de procesarlas — sobrecarga contraproducente típica.

5. **Veredicto de capacidad:** el entorno QA (1 vCPU / 1 GB) atiende **cómodamente hasta ~20 usuarios concurrentes** cumpliendo el umbral (p95 ≤ 2 s) — más que suficiente para el equipo de 6 y la sustentación. Para soportar 50–100 usuarios concurrentes se requeriría **escalado vertical** (más vCPU/RAM), afinado de PHP (FPM/opcache) o escalado horizontal. Los FAIL de esc50/esc100 **no son defectos del software** sino el **límite de capacidad del hardware contratado** — exactamente el tipo de hallazgo que una prueba de carga debe producir.

6. **La rampa confirma el comportamiento dinámico:** tiempos excelentes en los tramos valle (mín. 0.19 s), degradación durante el pico y recuperación al descender — el sistema se recupera sin intervención.

## 4. Reproducir

```powershell
# Desde la raíz del repo (Docker Desktop abierto). PERFIL: esc20 | esc50 | esc100 | rampa
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm -e PERFIL=esc20 k6 run /scripts/k6-perfil-carga.js
```
> Coordinar con el grupo antes de correr esc50/esc100 (saturan temporalmente el entorno compartido).

*Evidencia K6 — perfiles de carga · Hito 3 · Pruebas de Sistema (atributo oficial: Desempeño).*
