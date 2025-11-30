#!/bin/bash

###############################################################################
# Debug Backend Container
# Script để kiểm tra và debug backend khi health check fail
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔍 Debugging Backend Container...${NC}"
echo ""

# Check if container is running
echo -e "${BLUE}[1] Kiểm tra trạng thái container...${NC}"
if docker ps | grep -q student_app_backend_prod; then
    echo -e "${GREEN}✅ Container đang chạy${NC}"
else
    echo -e "${RED}❌ Container không chạy!${NC}"
    echo "Đang kiểm tra container đã tạo chưa..."
    if docker ps -a | grep -q student_app_backend_prod; then
        echo -e "${YELLOW}⚠️  Container đã tạo nhưng không chạy${NC}"
        echo "Logs của container:"
        docker logs student_app_backend_prod --tail 50
    else
        echo -e "${RED}❌ Container chưa được tạo!${NC}"
    fi
    exit 1
fi

echo ""

# Check container logs
echo -e "${BLUE}[2] Kiểm tra logs gần đây...${NC}"
docker logs student_app_backend_prod --tail 100

echo ""
echo -e "${BLUE}[3] Kiểm tra endpoint health...${NC}"

# Try different health endpoints
ENDPOINTS=(
    "http://localhost:3001/health"
    "http://localhost:3001/api/health"
    "http://127.0.0.1:3001/health"
    "http://127.0.0.1:3001/api/health"
)

for endpoint in "${ENDPOINTS[@]}"; do
    echo -n "  Testing $endpoint ... "
    if curl -sf "$endpoint" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        RESPONSE=$(curl -s "$endpoint")
        echo "  Response: $RESPONSE"
    else
        HTTP_CODE=$(curl -sf -o /dev/null -w "%{http_code}" "$endpoint" 2>/dev/null || echo "000")
        echo -e "${RED}❌ Failed (HTTP $HTTP_CODE)${NC}"
    fi
done

echo ""
echo -e "${BLUE}[4] Kiểm tra kết nối database...${NC}"
docker exec student_app_backend_prod sh -c "node -e \"const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Database connected'); process.exit(0); }).catch(e => { console.error('❌ Database error:', e.message); process.exit(1); });\"" 2>&1 || echo -e "${RED}❌ Không thể kiểm tra database${NC}"

echo ""
echo -e "${BLUE}[5] Kiểm tra biến môi trường...${NC}"
echo "  DATABASE_URL: $(docker exec student_app_backend_prod printenv DATABASE_URL | cut -c1-50)..."
echo "  PORT: $(docker exec student_app_backend_prod printenv PORT)"
echo "  NODE_ENV: $(docker exec student_app_backend_prod printenv NODE_ENV)"
echo "  SMTP_HOST: $(docker exec student_app_backend_prod printenv SMTP_HOST || echo 'NOT SET')"
echo "  SMTP_USER: $(docker exec student_app_backend_prod printenv SMTP_USER || echo 'NOT SET')"

echo ""
echo -e "${BLUE}[6] Kiểm tra port binding...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3001 " || ss -tuln 2>/dev/null | grep -q ":3001 "; then
    echo -e "${GREEN}✅ Port 3001 đang được bind${NC}"
else
    echo -e "${RED}❌ Port 3001 không được bind${NC}"
fi

echo ""
echo -e "${BLUE}[7] Kiểm tra file .env.production...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✅ File .env.production tồn tại${NC}"
    echo "  SMTP_HOST: $(grep SMTP_HOST .env.production | cut -d'=' -f2 || echo 'NOT SET')"
    echo "  SMTP_USER: $(grep SMTP_USER .env.production | cut -d'=' -f2 || echo 'NOT SET')"
else
    echo -e "${RED}❌ File .env.production không tồn tại!${NC}"
fi

echo ""
echo -e "${YELLOW}💡 Gợi ý:${NC}"
echo "  1. Xem logs chi tiết: docker logs student_app_backend_prod -f"
echo "  2. Restart backend: docker compose -f docker-compose.prod.yml restart backend"
echo "  3. Rebuild backend: docker compose -f docker-compose.prod.yml up -d --build backend"
echo ""

