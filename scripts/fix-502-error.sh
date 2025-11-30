#!/bin/bash

###############################################################################
# Fix 502 Bad Gateway Error
# Script để kiểm tra và fix lỗi 502 khi F5 trang
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Fixing 502 Bad Gateway Error...${NC}"
echo ""

# Check if containers are running
echo -e "${BLUE}[1] Kiểm tra containers...${NC}"
if docker ps | grep -q student_app_frontend_prod; then
    echo -e "${GREEN}✅ Frontend container đang chạy${NC}"
else
    echo -e "${RED}❌ Frontend container không chạy!${NC}"
    echo "Đang khởi động frontend..."
    docker compose -f docker-compose.prod.yml up -d frontend
    sleep 5
fi

if docker ps | grep -q student_app_backend_prod; then
    echo -e "${GREEN}✅ Backend container đang chạy${NC}"
else
    echo -e "${RED}❌ Backend container không chạy!${NC}"
    echo "Đang khởi động backend..."
    docker compose -f docker-compose.prod.yml up -d backend
    sleep 5
fi

echo ""

# Check if ports are listening
echo -e "${BLUE}[2] Kiểm tra ports...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3000 " || ss -tuln 2>/dev/null | grep -q ":3000 "; then
    echo -e "${GREEN}✅ Port 3000 đang listen (frontend)${NC}"
else
    echo -e "${RED}❌ Port 3000 không listen!${NC}"
fi

if netstat -tuln 2>/dev/null | grep -q ":3001 " || ss -tuln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✅ Port 3001 đang listen (backend)${NC}"
else
    echo -e "${RED}❌ Port 3001 không listen!${NC}"
fi

echo ""

# Check frontend health
echo -e "${BLUE}[3] Kiểm tra frontend health...${NC}"
if curl -sf http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend health check OK${NC}"
else
    echo -e "${RED}❌ Frontend health check failed${NC}"
    echo "Logs frontend:"
    docker logs student_app_frontend_prod --tail 20
fi

echo ""

# Check nginx config
echo -e "${BLUE}[4] Kiểm tra nginx config...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ Nginx config OK${NC}"
else
    echo -e "${RED}❌ Nginx config có lỗi!${NC}"
    sudo nginx -t
fi

echo ""

# Restart containers
echo -e "${BLUE}[5] Restart containers...${NC}"
docker compose -f docker-compose.prod.yml restart frontend
sleep 3
docker compose -f docker-compose.prod.yml restart backend
sleep 3

echo ""

# Reload nginx
echo -e "${BLUE}[6] Reload nginx...${NC}"
sudo systemctl reload nginx
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx reload failed, restarting...${NC}"
    sudo systemctl restart nginx
fi

echo ""
echo -e "${GREEN}✅ Hoàn tất!${NC}"
echo ""
echo -e "${YELLOW}💡 Kiểm tra lại:${NC}"
echo "  curl -I http://localhost/forgot-password"
echo "  curl -I http://localhost:3000/forgot-password"
echo ""

