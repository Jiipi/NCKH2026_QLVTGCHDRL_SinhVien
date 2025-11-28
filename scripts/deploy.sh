#!/bin/bash

###############################################################################
# ONE-COMMAND DEPLOYMENT SCRIPT
# Tá»± Ä‘á»™ng: pull code â†’ build images â†’ restart containers
# 
# â ï¸  QUAN TRá»ŒNG: Cháº¡y setup-ec2.sh trÆ°á»›c khi cháº¡y script nĂ y!
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="hoatdongrenluyen.io.vn"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${GREEN}"
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘  đŸ€ AUTO DEPLOYMENT - DACN WEB                           â•‘"
echo "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo -e "${NC}"
echo "đŸ“ Project: $PROJECT_DIR"
echo ""

# Check Docker permissions
if ! docker ps > /dev/null 2>&1; then
    echo -e "${RED}âŒ Docker khĂ´ng thá»ƒ cháº¡y!${NC}"
    echo ""
    echo "CĂ³ thá»ƒ báº¡n cáº§n logout vĂ  SSH láº¡i sau khi cháº¡y setup-ec2.sh"
    echo "   exit"
    echo "   ssh -i key.pem ec2-user@<IP>"
    exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo -e "${RED}âŒ File .env.production khĂ´ng tá»“n táº¡i!${NC}"
    echo ""
    echo "Cháº¡y setup-ec2.sh trÆ°á»›c:"
    echo "  bash scripts/setup-ec2.sh"
    exit 1
fi

# Parse arguments
SKIP_PULL=false
SKIP_BUILD=false
NO_CACHE=false
RUN_MIGRATION=false
RUN_SEED=false

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
        --migrate)
            RUN_MIGRATION=true
            shift
            ;;
        --seed)
            RUN_SEED=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --skip-pull    Skip git pull step"
            echo "  --skip-build   Skip docker build step (only restart)"
            echo "  --no-cache     Build without cache (clean build)"
            echo "  --migrate      Run Prisma database migration"
            echo "  --seed         Run database seeder (after migration)"
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

echo -e "${BLUE}đŸ“‹ Configuration:${NC}"
echo "  Skip Pull:   $SKIP_PULL"
echo "  Skip Build:  $SKIP_BUILD"
echo "  No Cache:    $NO_CACHE"
echo "  Migration:   $RUN_MIGRATION"
echo "  Seed:        $RUN_SEED"
echo ""

# Step 1: Git Pull
if [ "$SKIP_PULL" = false ]; then
    echo -e "${YELLOW}[1/4] đŸ“¥ Pulling latest code from GitHub...${NC}"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo -e "${YELLOW}â ï¸  You have uncommitted changes:${NC}"
        git status -s
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}Deployment cancelled${NC}"
            exit 1
        fi
    fi
    
    git pull origin main || {
        echo -e "${RED}âŒ Git pull failed${NC}"
        exit 1
    }
    
    echo -e "${GREEN}âœ… Code updated${NC}"
else
    echo -e "${YELLOW}[1/4] â­ï¸  Skipping git pull${NC}"
fi

# Step 2: Stop running containers
echo -e "\n${YELLOW}[2/6] 🛑 Stopping running containers...${NC}"
docker compose -f docker-compose.prod.yml down || true
echo -e "${GREEN}✅ Containers stopped${NC}"

# Step 2.5: Ensure data directories with correct permissions
echo -e "\n${YELLOW}[2.5/6] 📁 Ensuring data directories permissions...${NC}"
mkdir -p backend/data/semesters
mkdir -p backend/logs
mkdir -p backend/uploads
mkdir -p backend/backups

# Fix ownership for nodejs user in container (UID 1001, GID 65533)
sudo chown -R 1001:65533 backend/data 2>/dev/null || {
    echo -e "${YELLOW}⚠️  Could not chown backend/data (may need sudo)${NC}"
    chmod -R 777 backend/data 2>/dev/null || true
}
sudo chown -R 1001:65533 backend/logs 2>/dev/null || chmod -R 777 backend/logs 2>/dev/null || true
sudo chown -R 1001:65533 backend/uploads 2>/dev/null || chmod -R 777 backend/uploads 2>/dev/null || true

echo -e "${GREEN}✅ Data directories ready${NC}"

# Step 3: Build Docker images
if [ "$SKIP_BUILD" = false ]; then
    echo -e "\n${YELLOW}[3/6] đŸ”¨ Building Docker images...${NC}"
    
    if [ "$NO_CACHE" = true ]; then
        echo "  Building without cache..."
        docker compose -f docker-compose.prod.yml build --no-cache
    else
        docker compose -f docker-compose.prod.yml build
    fi
    
    echo -e "${GREEN}âœ… Images built${NC}"
else
    echo -e "\n${YELLOW}[3/6] â­ï¸  Skipping build${NC}"
fi

# Step 4: Start containers
echo -e "\n${YELLOW}[4/6] đŸ€ Starting containers...${NC}"

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
        echo -e "${RED}âŒ Database failed to start${NC}"
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
        echo -e "${RED}âŒ Backend failed health check${NC}"
        docker logs student_app_backend_prod --tail 50
        exit 1
    fi
    sleep 2
done

echo "  Starting frontend..."
docker compose -f docker-compose.prod.yml up -d frontend

# Wait a bit for frontend
sleep 10

echo -e "${GREEN}âœ… All containers started${NC}"

# Step 5: Database Migration
if [ "$RUN_MIGRATION" = true ]; then
    echo -e "\n${YELLOW}[5/6] đŸ—ƒï¸  Running database migration...${NC}"
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy
    echo -e "${GREEN}âœ… Migration completed${NC}"
else
    echo -e "\n${YELLOW}[5/6] â­ï¸  Skipping migration (use --migrate to run)${NC}"
fi

# Step 6: Database Seed
if [ "$RUN_SEED" = true ]; then
    echo -e "\n${YELLOW}[6/6] đŸŒ± Running database seeder...${NC}"
    docker compose -f docker-compose.prod.yml exec -T backend npx prisma db seed
    echo -e "${GREEN}âœ… Seeding completed${NC}"
else
    echo -e "\n${YELLOW}[6/6] â­ï¸  Skipping seed (use --seed to run)${NC}"
fi

# Get Public IP
PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

# Show status
echo ""
echo -e "${GREEN}â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—${NC}"
echo -e "${GREEN}â•‘  âœ… DEPLOYMENT COMPLETE!                                  â•‘${NC}"
echo -e "${GREEN}â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•${NC}"
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo -e "${BLUE}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo -e "${BLUE}đŸ“ TRUY Cáº¬P WEB:${NC}"
echo -e "${BLUE}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo ""
echo "  đŸŒ Public IP:  http://${PUBLIC_IP}"
echo "  đŸŒ Domain:     http://${DOMAIN}  (náº¿u DNS Ä‘Ă£ trá»)"
echo "  đŸ“¡ Health:     http://${PUBLIC_IP}/api/health"
echo ""
echo -e "${BLUE}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo -e "${BLUE}đŸ“‹ COMMANDS:${NC}"
echo -e "${BLUE}â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”${NC}"
echo ""
echo "  View logs:    docker compose -f docker-compose.prod.yml logs -f"
echo "  Stop all:     docker compose -f docker-compose.prod.yml down"
echo "  Restart:      bash scripts/deploy.sh --skip-pull --skip-build"
echo "  Migration:    bash scripts/deploy.sh --skip-pull --skip-build --migrate"
echo ""
echo "  đŸ”’ SSL cert:  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo -e "${GREEN}đŸ‰ Deployment successful!${NC}"
