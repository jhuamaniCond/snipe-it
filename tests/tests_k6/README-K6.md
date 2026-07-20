# Entorno compartido de pruebas de SISTEMA con K6 (3 atributos no funcionales)

> Pruebas de **nivel Sistema · no funcionales (ISO 25010)** sobre el **entorno QA en nube** (`http://159.223.135.124`), con **K6 como cliente externo**. Cubre los **tres atributos oficiales** del [Plan de Pruebas de Sistema](../../trabajoLibelula/documentacionWiki/Plan-de-Pruebas-de-Sistema.md): **Seguridad, Desempeño y Fiabilidad**. K6 no es solo un generador de carga: mediante `check()` sobre estado/cabeceras/cookies también verifica seguridad y fiabilidad.

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
# Opción A — wrapper (desempeño smoke por defecto):
.\tests\tests_k6\correr-k6.ps1

# Opción B — docker compose directo, eligiendo el script:
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-seguridad.js
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-desempeno.js
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm k6 run /scripts/k6-fiabilidad.js

# Perfiles de carga (coordinar los altos): PERFIL = esc20 | esc50 | esc100 | rampa
docker compose -f tests/tests_k6/docker-compose.k6.yml run --rm -e PERFIL=esc20 k6 run /scripts/k6-perfil-carga.js
```

La 1.ª vez descarga la imagen (~30 MB). Al terminar, K6 imprime el resumen con los **umbrales** (`thresholds`) en verde/rojo.

## 4. Scripts incluidos (un atributo por script)

| Script | Atributo | Config | Umbrales |
|---|---|---|---|
| `k6-seguridad.js` | **Seguridad** | 1 VU · 1 iter | `checks: rate==1.0` (12 checks: 302, cabeceras, cookie httpOnly, CSRF) |
| `k6-desempeno.js` | **Desempeño** (smoke) | 5 VUs × 30 s | `p(95)<2000ms` · `http_req_failed<1%` |
| `k6-perfil-carga.js` | **Desempeño** (carga) | `PERFIL`: esc20/esc50/esc100/rampa | `p(95)<2000ms` · `http_req_failed<1%` |
| `k6-fiabilidad.js` | **Fiabilidad** | 10 VUs × 45 s | `http_req_failed<1%` (disponibilidad) · `checks: rate==1.0` (404 controlado) |

**Interpretación:** si K6 termina sin `✗` en los thresholds → **PASS**. Guardar la salida como evidencia en `trabajoLibelula/HITO-3/Sistema/Evidencias/`.

## 5. Reglas del grupo

1. **No subir la carga** (más VUs/duración) sin coordinarlo: los perfiles altos (esc50/esc100/rampa) saturan la VM compartida ~1 min.
2. **No ejecutar K6 durante una sesión de caja negra manual** de otro compañero (alteraría sus tiempos).
3. **Todos los scripts son de solo lectura** (GET) — no llenan la BD del entorno QA.
4. Nuevos scripts → misma carpeta `tests/tests_k6/`, mismo pin de versión, umbrales documentados en el Plan.
5. La evidencia oficial es la salida del **resumen final de K6** con los thresholds en verde.

---

*Entorno K6 compartido — Hito 3 · Pruebas de Sistema (atributos oficiales: Seguridad, Desempeño, Fiabilidad).*
