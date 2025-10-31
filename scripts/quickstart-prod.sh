#!/bin/bash

###############################################################################
# QUICKSTART PRODUCTION SCRIPT
# Khởi động nhanh hệ thống production
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 QUICKSTART PRODUCTION                                ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ File .env.production không tồn tại!${NC}"
    echo "Tạo file .env.production trước:"
    echo "  cp deployment-package/backend.env.template .env.production"
    echo "  nano .env.production"
    exit 1
fi

# Load environment variables
export $(grep -v '^#' .env.production | xargs)

echo -e "${BLUE}📋 Configuration loaded:${NC}"
echo "  Database: ${DB_NAME}"
echo "  CORS: ${CORS_ORIGIN}"
echo "  API URL: ${REACT_APP_API_URL}"
echo ""

# Parse arguments
BUILD=false
DOWN=false
LOGS=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --build|-b)
            BUILD=true
            shift
            ;;
        --down|-d)
            DOWN=true
            shift
            ;;
        --logs|-l)
            LOGS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--build] [--down] [--logs]"
            exit 1
            ;;
    esac
done

# Stop containers if --down
if [ "$DOWN" = true ]; then
    echo -e "${YELLOW}🛑 Stopping containers...${NC}"
    docker compose -f docker-compose.prod.yml down
    echo -e "${GREEN}✅ Containers stopped${NC}"
    exit 0
fi

# Build images if --build
if [ "$BUILD" = true ]; then
    echo -e "${YELLOW}🔨 Building Docker images...${NC}"
    docker compose -f docker-compose.prod.yml build --no-cache
    echo -e "${GREEN}✅ Images built${NC}"
fi

# Create network if not exists
echo -e "${YELLOW}🌐 Creating network...${NC}"
docker network create app_network 2>/dev/null || true

# Start database first
echo -e "${YELLOW}🐘 Starting PostgreSQL...${NC}"
docker compose -f docker-compose.prod.yml up -d db

# Wait for database to be healthy
echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=30
until docker compose -f docker-compose.prod.yml exec -T db pg_isready -U admin -d Web_QuanLyDiemRenLuyen; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [ $ATTEMPTS -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Database failed to start after ${MAX_ATTEMPTS} attempts${NC}"
        docker logs student_app_db_prod
        exit 1
    fi
    echo "  Attempt $ATTEMPTS/$MAX_ATTEMPTS..."
    sleep 2
done

echo -e "${GREEN}✅ Database is ready${NC}"

# Start backend
echo -e "${YELLOW}🔧 Starting backend...${NC}"
docker compose -f docker-compose.prod.yml up -d backend

# Wait for backend health check
echo -e "${YELLOW}⏳ Waiting for backend to be healthy...${NC}"
ATTEMPTS=0
MAX_ATTEMPTS=60
until curl -sf http://localhost:3001/api/health > /dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [ $ATTEMPTS -gt $MAX_ATTEMPTS ]; then
        echo -e "${RED}❌ Backend failed health check${NC}"
        docker logs student_app_backend_prod --tail 50
        exit 1
    fi
    if [ $((ATTEMPTS % 10)) -eq 0 ]; then
        echo "  Waiting... ($ATTEMPTS/$MAX_ATTEMPTS)"
    fi
    sleep 2
done

echo -e "${GREEN}✅ Backend is healthy${NC}"

# Start frontend
echo -e "${YELLOW}🎨 Starting frontend...${NC}"
docker compose -f docker-compose.prod.yml up -d frontend

# Wait for frontend
echo -e "${YELLOW}⏳ Waiting for frontend...${NC}"
sleep 10

echo -e "${GREEN}✅ Frontend started${NC}"

# Show status
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ ALL SERVICES RUNNING                                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  Backend:  http://localhost:3001/api/health"
echo "  Frontend: http://localhost:3000/"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  View logs:        docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop all:         docker compose -f docker-compose.prod.yml down"
echo "  Restart service:  docker compose -f docker-compose.prod.yml restart backend"
echo ""

# Show logs if --logs
if [ "$LOGS" = true ]; then
    echo -e "${YELLOW}📜 Showing logs (Ctrl+C to exit)...${NC}"
    docker compose -f docker-compose.prod.yml logs -f
fi

echo -e "${GREEN}🎉 Deployment complete!${NC}"
