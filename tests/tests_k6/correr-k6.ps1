# =============================================================================
# correr-k6.ps1 — Ejecuta la prueba de desempeño K6 (version fijada, Docker).
# Entorno compartido del grupo: todos miden con la MISMA version de K6.
#
# Requisito: Docker Desktop ABIERTO. K6 corre en TU PC (cliente de carga),
# atacando la URL del entorno QA en nube. NO se instala nada en la VM.
#
# Ejecutar DESDE LA RAIZ del repositorio snipe-it:
#   .\trabajoLibelula\HITO-3\Sistema\k6\correr-k6.ps1
#
# Otro script de la carpeta k6/:
#   .\trabajoLibelula\HITO-3\Sistema\k6\correr-k6.ps1 "otro-script.js"
# =============================================================================
param([string]$Script = "k6-desempeno.js")

$compose = "tests/tests_k6/docker-compose.k6.yml"

if (-not (Test-Path "artisan")) {
    Write-Host "  [X] Ejecuta este script desde la RAIZ del repo (donde esta 'artisan')." -ForegroundColor Red
    exit 1
}

Write-Host "  K6 (grafana/k6:1.0.0) ejecutando /scripts/$Script contra el entorno QA en nube..." -ForegroundColor Cyan
docker compose -f $compose run --rm k6 run "/scripts/$Script"
