# Entorno compartido de pruebas de DESEMPEÑO con K6

> Pruebas de **nivel Sistema · tipo no funcional (eficiencia de desempeño, ISO 25010)** sobre el **entorno QA en nube** (`http://159.223.135.124`). Herramienta indicada en la bibliografía del curso.

---

## 1. Arquitectura: dónde corre cada cosa (importante)

```
[PC de cada integrante]                    [VM DigitalOcean — QA]
   K6 en Docker (cliente) ──── internet ────►  Snipe-IT + MariaDB
   genera 5 usuarios virtuales                 (sistema bajo prueba, SUT)
```

- **K6 corre en TU PC** (vía Docker), **nunca dentro de la VM**: si el generador de carga corriera en el mismo servidor, consumiría su CPU/RAM y **contaminaría la medición** (además mediría `localhost`, sin la latencia real de internet).
- En la VM **no se instala ninguna herramienta de prueba**: solo vive el sistema bajo prueba (app + BD).

## 2. Versión fijada (entorno compartido)

| Elemento | Valor |
|---|---|
| Imagen | **`grafana/k6:1.0.0`** (pin — NO usar `latest`) |
| Motivo | Todos los integrantes miden con la **misma versión** → resultados comparables entre sesiones y personas |
| Requisito | Docker Desktop abierto (no se instala K6 en Windows) |

## 3. Cómo ejecutar (desde la raíz del repo)

```powershell
# Opción A — wrapper:
.\trabajoLibelula\HITO-3\Sistema\k6\correr-k6.ps1

# Opción B — docker compose directo:
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6
```

La 1.ª vez descarga la imagen (~30 MB). Al terminar, K6 imprime el resumen: peticiones, `http_req_duration` (avg/p90/p95), errores y si se cumplieron los **umbrales**.

## 4. Prueba oficial incluida — `k6-desempeno.js` (NF-PERF)

| Parámetro | Valor | Por qué |
|---|---|---|
| Escenario | `constant-vus`: **5 VUs × 30 s** (pausa 1 s/iteración) | Carga **prudente**: la VM QA es compartida y tiene 1 vCPU / 1 GB RAM |
| Endpoint | `GET /login` | Página pública representativa (sin sesión) |
| Umbral 1 | `p(95) < 2000 ms` | Criterio NF-PERF-01 del Plan de Sistema |
| Umbral 2 | `http_req_failed < 1 %` | Estabilidad bajo concurrencia |

**Interpretación:** si K6 termina sin `✗` en los thresholds → **PASS**. El resumen completo se guarda como evidencia (copiar/pegar la salida o captura) en `HITO-3/Sistema/Evidencias/`.

## 5. Reglas del grupo

1. **No subir la carga** (más VUs/duración) sin coordinarlo: la VM es compartida y una prueba de estrés puede dejarla lenta para los demás (o tumbarla con 1 GB de RAM).
2. **No ejecutar K6 durante una sesión de caja negra manual** de otro compañero (alteraría sus tiempos).
3. Nuevos scripts → misma carpeta `k6/`, mismo pin de versión, umbrales documentados en el Plan.
4. La evidencia oficial es la salida del **resumen final de K6** con los thresholds en verde.

---

*Entorno K6 compartido — Hito 3 · Pruebas de Sistema (atributo oficial: Desempeño).*
