#!/bin/bash
# =============================================================================
# iniciar-proyecto-linux-docker.sh
# Script para levantar el proyecto Snipe-IT usando Docker Compose en Linux
# Universidad 2026-B - Pruebas de Software
# =============================================================================

set -e

# =============================================================================
# COLORES Y FUNCIONES DE SALIDA
# =============================================================================
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;90m'
NC='\033[0m' # Sin color

write_header() {
    clear
    echo ""
    echo -e "  ${CYAN}+==================================================${NC}"
    echo -e "  ${CYAN}|       SNIPE-IT  --  DOCKER LAUNCHER (LINUX)      ${NC}"
    echo -e "  ${CYAN}|       Sistema de Gestion de Activos IT            ${NC}"
    echo -e "  ${CYAN}+==================================================${NC}"
    echo ""
}

write_step() {
    echo -e "  ${YELLOW}[$1]${NC} ${WHITE}$2${NC}"
}

write_ok() {
    echo -e "  ${GREEN}[OK]${NC} ${GREEN}$1${NC}"
}

write_warn() {
    echo -e "  ${YELLOW}[!] ${NC} ${YELLOW}$1${NC}"
}

write_err() {
    echo -e "  ${RED}[X] ${NC} ${RED}$1${NC}"
}

write_info() {
    echo -e "  ${CYAN}[i] ${NC} ${CYAN}$1${NC}"
}

pause_exit() {
    echo ""
    echo -e "  ${GRAY}Presiona Enter para salir...${NC}"
    read -r
    exit 1
}

# =============================================================================
# VERIFICAR QUE SE EJECUTE COMO ROOT
# =============================================================================
if [ "$(id -u)" != "0" ]; then
    if command -v sudo &>/dev/null; then
        exec sudo bash "$0" "$@"
    else
        echo -e "${RED}Este script debe ejecutarse como root.${NC}"
        echo "Ejecuta: sudo bash $0"
        exit 1
    fi
fi

# =============================================================================
# INICIO
# =============================================================================
write_header

# El script esta dentro de la carpeta del proyecto
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$SCRIPT_DIR"

write_info "Directorio del proyecto: $PROJECT_DIR"
echo ""

# =============================================================================
# PASO 1 - Verificar / Instalar Docker
# =============================================================================
write_step "1/7" "Verificando instalacion de Docker..."

if ! command -v docker &>/dev/null; then
    write_warn "Docker no esta instalado. Instalando automaticamente..."
    echo ""

    # Detectar distro
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO="$ID"
    else
        DISTRO="unknown"
    fi

    case "$DISTRO" in
        ubuntu|debian)
            apt-get update -qq
            apt-get install -y -qq docker.io docker-compose-v2 >/dev/null 2>&1
            ;;
        centos|rhel|fedora|amzn)
            yum install -y docker
            # Instalar docker compose plugin
            DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
            mkdir -p "$DOCKER_CONFIG/cli-plugins"
            curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
                -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
            chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
            ;;
        *)
            write_err "Distro no soportada: $DISTRO"
            write_info "Instala Docker manualmente: https://docs.docker.com/engine/install/"
            pause_exit
            ;;
    esac

    systemctl enable docker 2>/dev/null || true
    systemctl start docker 2>/dev/null || true

    if ! command -v docker &>/dev/null; then
        write_err "No se pudo instalar Docker automaticamente."
        write_info "Instala Docker manualmente: https://docs.docker.com/engine/install/"
        pause_exit
    fi

    write_ok "Docker instalado correctamente."
else
    DOCKER_VERSION=$(docker --version 2>&1)
    write_ok "Docker encontrado: $DOCKER_VERSION"
fi

# =============================================================================
# PASO 2 - Verificar Docker Compose
# =============================================================================
write_step "2/7" "Verificando Docker Compose..."

if docker compose version &>/dev/null; then
    COMPOSE_CMD="docker compose"
    COMPOSE_VERSION=$($COMPOSE_CMD version 2>&1)
    write_ok "Docker Compose disponible: $COMPOSE_VERSION"
elif docker-compose --version &>/dev/null; then
    COMPOSE_CMD="docker-compose"
    COMPOSE_VERSION=$($COMPOSE_CMD --version 2>&1)
    write_ok "Docker Compose disponible (legacy): $COMPOSE_VERSION"
else
    write_warn "Docker Compose no encontrado. Instalando..."
    apt-get install -y -qq docker-compose-v2 2>/dev/null || {
        DOCKER_CONFIG=${DOCKER_CONFIG:-/usr/local/lib/docker}
        mkdir -p "$DOCKER_CONFIG/cli-plugins"
        curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
            -o "$DOCKER_CONFIG/cli-plugins/docker-compose"
        chmod +x "$DOCKER_CONFIG/cli-plugins/docker-compose"
    }

    if docker compose version &>/dev/null; then
        COMPOSE_CMD="docker compose"
        write_ok "Docker Compose instalado correctamente."
    else
        write_err "No se pudo instalar Docker Compose."
        pause_exit
    fi
fi

# =============================================================================
# PASO 3 - Verificar que el daemon de Docker este activo
# =============================================================================
write_step "3/7" "Verificando que Docker este corriendo..."

if ! docker info &>/dev/null; then
    write_warn "Docker daemon no esta activo. Iniciando..."
    systemctl start docker 2>/dev/null || service docker start 2>/dev/null || true
    sleep 2

    if ! docker info &>/dev/null; then
        write_err "No se pudo iniciar el daemon de Docker."
        write_info "Intenta: systemctl start docker"
        pause_exit
    fi
fi
write_ok "Docker daemon esta activo."

# =============================================================================
# PASO 4 - Verificar carpeta del proyecto
# =============================================================================
write_step "4/7" "Verificando archivos del proyecto..."

DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.yml"
if [ ! -f "$DOCKER_COMPOSE_FILE" ]; then
    write_err "No se encontro docker-compose.yml en:"
    echo -e "    ${RED}$PROJECT_DIR${NC}"
    write_warn "Asegurate de ejecutar el script desde dentro de la carpeta snipe-it."
    pause_exit
fi
write_ok "Proyecto verificado: $PROJECT_DIR"

cd "$PROJECT_DIR"

# =============================================================================
# PASO 5 - Detectar IP publica del servidor
# =============================================================================
write_step "5/7" "Detectando IP publica del servidor..."

PUBLIC_IP=""
# Intentar multiples servicios para obtener la IP publica
for url in "http://checkip.amazonaws.com" "http://ifconfig.me" "http://icanhazip.com" "http://ipecho.net/plain"; do
    PUBLIC_IP=$(curl -s --connect-timeout 3 "$url" 2>/dev/null | tr -d '[:space:]')
    if [[ "$PUBLIC_IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        break
    fi
    PUBLIC_IP=""
done

if [ -z "$PUBLIC_IP" ]; then
    write_warn "No se pudo detectar la IP publica automaticamente."
    echo -e "  ${WHITE}Ingresa la IP publica de tu servidor:${NC}"
    read -r -p "  > " PUBLIC_IP
fi

write_ok "IP publica detectada: $PUBLIC_IP"

# =============================================================================
# PASO 6 - Preparar el archivo .env
# =============================================================================
write_step "6/7" "Preparando archivo de configuracion .env..."

ENV_FILE="$PROJECT_DIR/.env"
ENV_DOCKER_FILE="$PROJECT_DIR/.env.docker"

if [ -f "$ENV_FILE" ]; then
    write_ok "El archivo .env ya existe - se usara el existente."

    # Actualizar APP_URL con la IP publica si es necesario
    CURRENT_APP_URL=$(grep "^APP_URL=" "$ENV_FILE" | cut -d'=' -f2-)
    if echo "$CURRENT_APP_URL" | grep -q "localhost"; then
        sed -i "s|^APP_URL=.*|APP_URL=http://$PUBLIC_IP|" "$ENV_FILE"
        write_info "APP_URL actualizado a: http://$PUBLIC_IP"
    fi

elif [ -f "$ENV_DOCKER_FILE" ]; then
    cp "$ENV_DOCKER_FILE" "$ENV_FILE"
    write_ok "Archivo .env creado desde .env.docker"

    # Configurar para acceso web publico
    sed -i "s|^APP_URL=.*|APP_URL=http://$PUBLIC_IP|" "$ENV_FILE"
    sed -i "s|^APP_PORT=.*|APP_PORT=80|" "$ENV_FILE"
    write_info "APP_URL configurado a: http://$PUBLIC_IP"

else
    write_warn "No se encontro .env ni .env.docker. Creando .env automaticamente..."

    # Generar APP_KEY aleatorio
    APP_KEY=$(openssl rand -base64 32 2>/dev/null || head -c 32 /dev/urandom | base64)

    cat > "$ENV_FILE" << ENVEOF
# --------------------------------------------
# DOCKER SETTINGS
# --------------------------------------------
APP_VERSION=latest
APP_PORT=80

# --------------------------------------------
# BASIC APP SETTINGS
# --------------------------------------------
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:$APP_KEY
APP_URL=http://$PUBLIC_IP
APP_TIMEZONE='America/Lima'
APP_LOCALE=es-CO
MAX_RESULTS=500

# --------------------------------------------
# UPLOADED FILE STORAGE SETTINGS
# --------------------------------------------
PRIVATE_FILESYSTEM_DISK=local
PUBLIC_FILESYSTEM_DISK=local_public

# --------------------------------------------
# DATABASE SETTINGS
# --------------------------------------------
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=snipeit
DB_USERNAME=snipeit
DB_PASSWORD=Snipe1t_Pr0d_2026
MYSQL_ROOT_PASSWORD=R00t_Snipe_2026
DB_PREFIX=null
DB_DUMP_PATH='/usr/bin'
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci

# --------------------------------------------
# MAIL SETTINGS (deshabilitado por defecto)
# --------------------------------------------
MAIL_MAILER=log
MAIL_FROM_ADDR=admin@example.com
MAIL_FROM_NAME='Snipe-IT'
MAIL_REPLYTO_ADDR=admin@example.com
MAIL_REPLYTO_NAME='Snipe-IT'

# --------------------------------------------
# DATA PROTECTION
# --------------------------------------------
ALLOW_BACKUP_DELETE=false
ALLOW_DATA_PURGE=false
IMAGE_LIB=gd

# --------------------------------------------
# SESSION SETTINGS
# --------------------------------------------
SESSION_LIFETIME=12000
EXPIRE_ON_CLOSE=false
ENCRYPT=false
COOKIE_NAME=snipeit_session
SECURE_COOKIES=false

# --------------------------------------------
# SECURITY HEADERS
# --------------------------------------------
APP_TRUSTED_PROXIES='*'
ALLOW_IFRAMING=false
REFERRER_POLICY=same-origin
ENABLE_CSP=false
ENABLE_HSTS=false

# --------------------------------------------
# CACHE SETTINGS
# --------------------------------------------
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=sync
CACHE_PREFIX=snipeit

# --------------------------------------------
# MISC
# --------------------------------------------
LOG_CHANNEL=stderr
LOG_MAX_DAYS=10
APP_LOCKED=false
APP_CIPHER=AES-256-CBC
APP_FORCE_TLS=false
ENVEOF

    write_ok "Archivo .env creado con configuracion para web publica."
fi

# Leer el puerto configurado
APP_PORT=$(grep "^APP_PORT=" "$ENV_FILE" 2>/dev/null | cut -d'=' -f2 | tr -d ' ')
APP_PORT=${APP_PORT:-80}

# Asegurar que el docker-compose use el puerto correcto para web publica
# Si el puerto en docker-compose es 8000, lo cambiamos a 80 para produccion
if grep -q '"${APP_PORT:-8000}:80"' "$DOCKER_COMPOSE_FILE" 2>/dev/null; then
    write_info "Puerto configurado: $APP_PORT"
fi

# =============================================================================
# PASO 7 - Levantar los contenedores
# =============================================================================
write_step "7/7" "Levantando contenedores con Docker Compose..."
echo ""

CONTAINERS_RUNNING=$($COMPOSE_CMD ps --status running -q 2>/dev/null)

if [ -n "$CONTAINERS_RUNNING" ]; then
    write_warn "Los contenedores ya estan corriendo."
    echo ""
    echo -e "  ${WHITE}Que deseas hacer?${NC}"
    echo -e "  ${YELLOW}[1]${NC} Ver la URL de acceso"
    echo -e "  ${YELLOW}[2]${NC} Reiniciar los contenedores (down + up)"
    echo -e "  ${YELLOW}[3]${NC} Ver logs en tiempo real"
    echo -e "  ${YELLOW}[4]${NC} Detener los contenedores"
    echo -e "  ${YELLOW}[5]${NC} Salir"
    echo ""
    read -r -p "  Selecciona una opcion (1-5): " CHOICE

    case "$CHOICE" in
        1)
            write_info "Snipe-IT esta corriendo."
            ;;
        2)
            write_info "Reiniciando contenedores..."
            $COMPOSE_CMD down
            echo ""
            $COMPOSE_CMD up -d
            ;;
        3)
            write_info "Mostrando logs (Ctrl+C para salir)..."
            $COMPOSE_CMD logs -f
            exit 0
            ;;
        4)
            write_info "Deteniendo contenedores..."
            $COMPOSE_CMD stop
            write_ok "Contenedores detenidos."
            exit 0
            ;;
        *)
            write_info "Saliendo..."
            exit 0
            ;;
    esac
else
    write_info "Iniciando contenedores (puede tardar varios minutos la primera vez)..."
    echo ""
    $COMPOSE_CMD up -d

    if [ $? -ne 0 ]; then
        echo ""
        write_err "Error al levantar los contenedores."
        write_info "Revisa los logs con: $COMPOSE_CMD logs"
        pause_exit
    fi
fi

# =============================================================================
# ESPERAR A QUE LA APP ESTE LISTA
# =============================================================================
echo ""
write_info "Esperando a que Snipe-IT responda en http://$PUBLIC_IP ..."
echo ""

MAX_ATTEMPTS=40
ATTEMPT=0
READY=false

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    ATTEMPT=$((ATTEMPT + 1))

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 "http://localhost:$APP_PORT" 2>/dev/null || echo "000")

    if [ "$HTTP_CODE" != "000" ] && [ "$HTTP_CODE" -lt 500 ] 2>/dev/null; then
        READY=true
        break
    fi

    printf "\r  ${GRAY}Intento $ATTEMPT/$MAX_ATTEMPTS - esperando... (HTTP: $HTTP_CODE)   ${NC}"
    sleep 3
done

echo ""
echo ""

# =============================================================================
# CONFIGURAR FIREWALL (si aplica)
# =============================================================================
if command -v ufw &>/dev/null; then
    ufw allow 80/tcp >/dev/null 2>&1 || true
    ufw allow 443/tcp >/dev/null 2>&1 || true
    ufw allow 22/tcp >/dev/null 2>&1 || true
    write_ok "Firewall (ufw): puertos 80, 443 y 22 abiertos."
elif command -v firewall-cmd &>/dev/null; then
    firewall-cmd --permanent --add-service=http >/dev/null 2>&1 || true
    firewall-cmd --permanent --add-service=https >/dev/null 2>&1 || true
    firewall-cmd --reload >/dev/null 2>&1 || true
    write_ok "Firewall (firewalld): puertos HTTP/HTTPS abiertos."
fi

# =============================================================================
# RESULTADO FINAL
# =============================================================================
echo -e "  ${CYAN}+==================================================${NC}"

if [ "$READY" = true ]; then
    echo -e "  ${GREEN}|   SNIPE-IT ESTA LISTO Y CORRIENDO                |${NC}"
else
    echo -e "  ${YELLOW}|   La app puede seguir iniciando, intenta en 30s   |${NC}"
fi

echo -e "  ${CYAN}+==================================================${NC}"
echo ""
echo -e "  ${WHITE}URL de acceso (web publica):${NC}"
echo -e "  ${CYAN}http://$PUBLIC_IP${NC}"
echo ""

if [ "$APP_PORT" != "80" ]; then
    echo -e "  ${WHITE}URL alternativa (con puerto):${NC}"
    echo -e "  ${CYAN}http://$PUBLIC_IP:$APP_PORT${NC}"
    echo ""
fi

echo -e "  ${WHITE}Comandos utiles:${NC}"
echo -e "  ${GRAY}  $COMPOSE_CMD ps              -> ver estado${NC}"
echo -e "  ${GRAY}  $COMPOSE_CMD logs -f          -> ver logs en vivo${NC}"
echo -e "  ${GRAY}  $COMPOSE_CMD stop             -> detener sin borrar datos${NC}"
echo -e "  ${GRAY}  $COMPOSE_CMD down -v           -> eliminar TODO (incluye BD)${NC}"
echo -e "  ${GRAY}  $COMPOSE_CMD restart           -> reiniciar contenedores${NC}"
echo ""

echo -e "  ${WHITE}Estado de los contenedores:${NC}"
$COMPOSE_CMD ps 2>/dev/null || true
echo ""

if [ "$READY" = true ]; then
    write_ok "Todo listo! Abre http://$PUBLIC_IP en tu navegador."
else
    write_warn "La app aun esta iniciando. Espera unos segundos y abre http://$PUBLIC_IP"
    write_info "Revisa el progreso con: $COMPOSE_CMD logs -f app"
fi

echo ""
