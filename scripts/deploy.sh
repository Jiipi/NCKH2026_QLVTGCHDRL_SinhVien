#!/bin/bash

###############################################################################
# ONE-COMMAND DEPLOYMENT SCRIPT
# Tự động: pull code → build images → restart containers
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
echo "║  🚀 AUTO DEPLOYMENT - DACN WEB                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}❌ File .env.production không tồn tại!${NC}"
    echo "Tạo file từ template:"
    echo "  cp .env.example .env.production"
    echo "  nano .env.production"
    exit 1
fi

# Parse arguments
SKIP_PULL=false
SKIP_BUILD=false
NO_CACHE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-pull)
            SKIP_PULL=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --no-cache)
            NO_CACHE=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-pull    Skip git pull step"
            echo "  --skip-build   Skip docker build step (only restart)"
            echo "  --no-cache     Build without cache (clean build)"
            echo "  --help, -h     Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}📋 Configuration:${NC}"
echo "  Skip Pull:  $SKIP_PULL"
echo "  Skip Build: $SKIP_BUILD"
echo "  No Cache:   $NO_CACHE"
echo ""

# Step 1: Git Pull
if [ "$SKIP_PULL" = false ]; then
    echo -e "${YELLOW}[1/4] 📥 Pulling latest code from GitHub...${NC}"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}⚠️  You have uncommitted changes:${NC}"
        git status -s
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled${NC}"
            exit 1
        fi
    fi
    
    git pull origin main || {
        echo -e "${RED}❌ Git pull failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Code updated${NC}"
else
    echo -e "${YELLOW}[1/4] ⏭️  Skipping git pull${NC}"
fi

# Step 2: Stop running containers
echo -e "\n${YELLOW}[2/4] 🛑 Stopping running containers...${NC}"
docker compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✅ Containers stopped${NC}"

# Step 3: Build Docker images
if [ "$SKIP_BUILD" = false ]; then
    echo -e "\n${YELLOW}[3/4] 🔨 Building Docker images...${NC}"
    
    if [ "$NO_CACHE" = true ]; then
        echo "  Building without cache..."
        docker compose -f docker-compose.prod.yml build --no-cache
    else
        docker compose -f docker-compose.prod.yml build
    fi
    
    echo -e "${GREEN}✅ Images built${NC}"
else
    echo -e "\n${YELLOW}[3/4] ⏭️  Skipping build${NC}"
fi

# Step 4: Start containers
echo -e "\n${YELLOW}[4/4] 🚀 Starting containers...${NC}"

# Create network if not exists
docker network create app_network 2>/dev/null || true

# Start database first
echo "  Starting database..."
docker compose -f docker-compose.prod.yml up -d db

# Wait for database
echo "  Waiting for database..."
ATTEMPTS=0
until docker compose -f docker-compose.prod.yml exec -T db pg_isready -U admin; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [ $ATTEMPTS -gt 30 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        docker logs student_app_db_prod --tail 50
        exit 1
    fi
    sleep 2
done

echo "  Starting backend..."
docker compose -f docker-compose.prod.yml up -d backend

# Wait for backend
echo "  Waiting for backend..."
ATTEMPTS=0
until curl -sf http://localhost:3001/api/health > /dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS+1))
    if [ $ATTEMPTS -gt 60 ]; then
        echo -e "${RED}❌ Backend failed health check${NC}"
        docker logs student_app_backend_prod --tail 50
        exit 1
    fi
    sleep 2
done

echo "  Starting frontend..."
docker compose -f docker-compose.prod.yml up -d frontend

# Wait a bit for frontend
sleep 10

echo -e "${GREEN}✅ All containers started${NC}"

# Show status
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ DEPLOYMENT COMPLETE!                                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}📊 Service URLs:${NC}"
echo "  Backend:  http://localhost:3001/api/health"
echo "  Frontend: http://localhost:3000/"
echo ""
echo -e "${BLUE}📋 Useful commands:${NC}"
echo "  View logs:   docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop all:    docker compose -f docker-compose.prod.yml down"
echo "  Restart:     ./scripts/deploy.sh --skip-pull --skip-build"
echo ""
echo -e "${GREEN}🎉 Deployment successful!${NC}"
