#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "================================================"
echo "  PRUEBAS DE ACEPTACION CON K6 - SNIPE-IT"
echo "  Fecha: $(date '+%Y-%m-%d %H:%M:%S')"
echo "================================================"

if ! command -v k6 &> /dev/null; then
    echo ""
    echo "ERROR: k6 no esta instalado."
    echo "Instalalo desde: https://k6.io/docs/getting-started/installation/"
    exit 1
fi

if [ -z "$SNIPEIT_URL" ]; then
    echo ""
    echo "SNIPEIT_URL no configurada. Usando http://localhost:8000"
fi

if [ -z "$SNIPEIT_TOKEN" ]; then
    echo "ERROR: SNIPEIT_TOKEN no configurada."
    echo "  export SNIPEIT_URL='http://localhost:8000'"
    echo "  export SNIPEIT_TOKEN='tu-token'"
    exit 1
fi

echo ""
echo "Conectando a: ${SNIPEIT_URL}"
echo ""

TESTS=(
    "ACC-01:Registrar activos:test_acc01.js"
    "ACC-02:Asignar activos:test_acc02.js"
    "ACC-03:Recuperar activos:test_acc03.js"
    "ACC-04:Controlar asientos:test_acc04.js"
    "ACC-05:Controlar stock:test_acc05.js"
    "ACC-06:Control de acceso:test_acc06.js"
    "ACC-07:Multiempresa:test_acc07.js"
)

TOTAL_PASSED=0
TOTAL_FAILED=0
RESULTS=()

for test_entry in "${TESTS[@]}"; do
    IFS=':' read -r id name file <<< "$test_entry"

    echo ""
    echo "----------------------------------------------"
    echo "  Ejecutando ${id}: ${name}"
    echo "----------------------------------------------"

    k6 run \
        -e SNIPEIT_URL="$SNIPEIT_URL" \
        -e SNIPEIT_TOKEN="$SNIPEIT_TOKEN" \
        --summary-trend-stats="avg,min,med,max,p(90),p(95)" \
        "${SCRIPT_DIR}/${file}"

    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        ((TOTAL_PASSED++))
        RESULTS+=("PASS ${id}: ACEPTADO")
    else
        ((TOTAL_FAILED++))
        RESULTS+=("FAIL ${id}: NO ACEPTADO (exit: ${EXIT_CODE})")
    fi
done

echo ""
echo "================================================"
echo "  RESUMEN GLOBAL"
echo "================================================"
echo ""
for result in "${RESULTS[@]}"; do
    echo "  ${result}"
done
echo ""
echo "----------------------------------------------"
echo "  Total: ${TOTAL_PASSED} aceptados, ${TOTAL_FAILED} no aceptados"
echo "----------------------------------------------"

if [ $TOTAL_FAILED -eq 0 ]; then
    echo ""
    echo "  PRODUCTO ACEPTADO: Todos los criterios se cumplen."
    exit 0
elif [ $TOTAL_PASSED -ge 5 ]; then
    echo ""
    echo "  PRODUCTO ACEPTADO CON OBSERVACIONES: ${TOTAL_FAILED} criterio(s) no superado(s)."
    exit 0
else
    echo ""
    echo "  PRODUCTO NO ACEPTADO: ${TOTAL_FAILED} criterio(s) critico(s)."
    exit 1
fi