#!/bin/bash

###############################################################################
# EC2 AUTO SETUP SCRIPT (Amazon Linux version)
# Script tự động cài đặt môi trường cho deployment
# Chạy trên EC2 Amazon Linux với user ec2-user (KHÔNG chạy bằng root)
#
# Run: bash scripts/setup-ec2.sh
###############################################################################

set -e

# COLORS
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DOMAIN="hoatdongrenluyen.io.vn"
ADMIN_EMAIL="ngochungtran.aity@gmail.com"
DB_PASSWORD_FIXED="hungloveakiha13"

PROJECT_DIR="/home/ec2-user/QL_DH_RenLuyen"

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 EC2 AUTO SETUP SCRIPT                                ║"
echo "║  Cài đặt môi trường cho DACN Web Quản Lý Rèn Luyện       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# 0. Chặn chạy bằng root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Không chạy script với sudo/root${NC}"
   echo "Chạy: bash scripts/setup-ec2.sh (bằng ec2-user)"
   exit 1
fi

###############################################################################
# Helper: chọn package manager (Amazon Linux dùng dnf/yum)
###############################################################################
PM=""
if command -v dnf >/dev/null 2>&1; then
  PM="dnf"
elif command -v yum >/dev/null 2>&1; then
  PM="yum"
else
  echo -e "${RED}❌ Không tìm thấy dnf / yum. Máy này không phải Amazon Linux / RHEL-like.${NC}"
  exit 1
fi

###############################################################################
# STEP 1: Update System
###############################################################################
echo -e "\n${YELLOW}[1/8] Updating system packages...${NC}"
sudo $PM -y update || true
sudo $PM -y install curl wget git nano htop net-tools unzip || true
echo -e "${GREEN}✅ System updated${NC}"

###############################################################################
# STEP 2: Install Nginx (reverse proxy) + Certbot deps
###############################################################################
echo -e "\n${YELLOW}[2/8] Installing nginx & certbot deps...${NC}"
sudo $PM -y install nginx python3-certbot-nginx || true

sudo systemctl enable nginx || true
sudo systemctl start nginx || true

echo -e "${GREEN}✅ Nginx installed & running${NC}"

###############################################################################
# STEP 3: Install Docker CE + Docker Compose plugin
###############################################################################
echo -e "\n${YELLOW}[3/8] Installing Docker & Docker Compose plugin...${NC}"

# Thêm repo Docker CE nếu chưa có
if [ ! -f /etc/yum.repos.d/docker-ce.repo ]; then
  echo "➜ Adding Docker CE repo..."
  sudo $PM -y install dnf-plugins-core || true
  sudo $PM config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true
  sudo rpm --import https://download.docker.com/linux/centos/gpg || true
  # Amazon Linux thường không có $releasever=9 => force về '9' để tránh 404
  sudo sed -i 's/\$releasever/9/g' /etc/yum.repos.d/docker-ce.repo || true
fi

# Cài docker CE và plugin compose
sudo $PM -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin --nobest

# Bật docker service
sudo systemctl enable docker
sudo systemctl start docker

# Cho phép ec2-user dùng docker không cần sudo
sudo usermod -aG docker ec2-user || true

echo -e "${GREEN}✅ Docker & docker compose plugin installed${NC}"
docker --version || true
docker compose version || true

###############################################################################
# STEP 4: Chuẩn bị thư mục dự án (KHÔNG CLONE GITHUB NỮA)
###############################################################################
echo -e "\n${YELLOW}[4/8] Checking project directory...${NC}"

if [ ! -d "$PROJECT_DIR" ]; then
  echo -e "${RED}❌ Không tìm thấy thư mục dự án tại $PROJECT_DIR${NC}"
  echo "Hãy đảm bảo code đã được clone thủ công về: $PROJECT_DIR"
  echo "Ví dụ:"
  echo "  cd /home/ec2-user"
  echo "  git clone https://github.com/Jiipi/QL_DH_RenLuyen.git"
  exit 1
else
  echo "✅ Found project at $PROJECT_DIR"
fi

cd "$PROJECT_DIR"

###############################################################################
# STEP 5: Tạo file .env.production và .env cho backend/docker-compose
###############################################################################
echo -e "\n${YELLOW}[5/8] Generating environment variables (.env.production / .env)...${NC}"

# Tạo JWT_SECRET random
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')

# Các biến fix theo yêu cầu
CORS_ORIGIN="https://${DOMAIN}"
REACT_APP_API_URL="https://${DOMAIN}/api"
DATABASE_URL="postgresql://admin:${DB_PASSWORD_FIXED}@db:5432/Web_QuanLyDiemRenLuyen?schema=public"

ENV_FILE_CONTENT=$(cat <<EOF
# =========================
# Database Configuration
# =========================
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=${DB_PASSWORD_FIXED}
DATABASE_URL=${DATABASE_URL}

# =========================
# JWT Configuration
# =========================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# =========================
# CORS / API
# =========================
CORS_ORIGIN=${CORS_ORIGIN}
REACT_APP_API_URL=${REACT_APP_API_URL}

# =========================
# Runtime
# =========================
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
EOF
)

# Ghi file .env.production nếu chưa có
if [ -f ".env.production" ]; then
  echo "ℹ️  .env.production đã tồn tại, bỏ qua tạo mới"
else
  echo "${ENV_FILE_CONTENT}" > .env.production
  echo "✅ Tạo file .env.production"
fi

# Ghi file .env nếu chưa có (docker compose đọc mặc định .env)
if [ -f ".env" ]; then
  echo "ℹ️  .env đã tồn tại, bỏ qua tạo mới"
else
  echo "${ENV_FILE_CONTENT}" > .env
  echo "✅ Tạo file .env"
fi

# Link backend/.env tới file gốc nếu backend tồn tại
if [ -d "backend" ]; then
  ln -sf "$PROJECT_DIR/.env.production" "$PROJECT_DIR/backend/.env"
  echo "✅ Linked backend/.env → .env.production"
fi

echo -e "${GREEN}✅ Environment variables ready${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  DB Password (đang dùng cố định): ${DB_PASSWORD_FIXED}"
echo "  JWT Secret (random mới tạo): ${JWT_SECRET}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

###############################################################################
# STEP 6: Firewall (Amazon Linux dùng firewalld thay vì ufw)
###############################################################################
echo -e "\n${YELLOW}[6/8] Configuring firewall (firewalld)...${NC}"

# Cài firewalld nếu chưa có
if ! command -v firewall-cmd >/dev/null 2>&1; then
  sudo $PM -y install firewalld || true
  sudo systemctl enable firewalld || true
  sudo systemctl start firewalld || true
fi

# Mở các port 22,80,443
sudo firewall-cmd --permanent --add-service=ssh    || true
sudo firewall-cmd --permanent --add-service=http   || true
sudo firewall-cmd --permanent --add-service=https  || true
sudo firewall-cmd --reload || true

echo -e "${GREEN}✅ Firewall configured (22/80/443 opened)${NC}"

###############################################################################
# STEP 7: Chuẩn bị SSL (Let's Encrypt / Certbot)
###############################################################################
echo -e "\n${YELLOW}[7/8] Preparing SSL / Certbot info...${NC}"

# Tạo webroot để certbot dùng HTTP-01 challenge sau này
sudo mkdir -p /var/www/certbot
sudo chown ec2-user:ec2-user /var/www/certbot || true

echo ""
echo "📌 SSL sẽ cần DNS trỏ domain '${DOMAIN}' → IP EC2 của bạn."
echo "   Sau khi site chạy, bạn sẽ chạy lệnh này thủ công:"
echo ""
echo "sudo certbot certonly --webroot \\"
echo "  -w /var/www/certbot \\"
echo "  -d ${DOMAIN} \\"
echo "  -d www.${DOMAIN} \\"
echo "  --email ${ADMIN_EMAIL} \\"
echo "  --agree-tos \\"
echo "  --no-eff-email"
echo ""

echo -e "${GREEN}✅ SSL instruction prepared${NC}"

###############################################################################
# STEP 8: Hướng dẫn deploy containers
###############################################################################
echo -e "\n${YELLOW}[8/8] Final instructions (deploy steps)${NC}"

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ SETUP HOÀN TẤT!                                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

PUBLIC_IP=$(curl -s ifconfig.me || echo "YOUR_EC2_IP")

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ĐĂNG XUẤT VÀ SSH LẠI (để ec2-user nhận quyền docker)"
echo "   exit"
echo "   ssh -i your-key.pem ec2-user@${PUBLIC_IP}"
echo ""
echo "2. KIỂM TRA NETWORK CŨ / DỌN XUNG ĐỘT:"
echo "   docker ps -a"
echo "   # dừng & xóa stack cũ nếu còn (ví dụ hoatdongrenluyen_*)"
echo "   docker stop <container_cu> ; docker rm <container_cu>"
echo "   docker network ls"
echo "   docker network rm <network_cu nếu báo overlap>"
echo ""
echo "3. BUILD & START CONTAINERS:"
echo "   cd ${PROJECT_DIR}"
echo "   docker compose -f docker-compose.prod.yml down --remove-orphans"
echo "   docker compose -f docker-compose.prod.yml up -d --build"
echo ""
echo "4. KIỂM TRA HEALTH:"
echo "   docker ps"
echo "   curl http://localhost:3001/api/health"
echo ""
echo "5. KIỂM TRA WEB TỪ TRÌNH DUYỆT:"
echo "   http://${PUBLIC_IP}  (tạm thời HTTP)"
echo ""
echo "6. SAU KHI DNS TRỎ ${DOMAIN} → ${PUBLIC_IP}, CẤP SSL:"
echo "   sudo certbot certonly --webroot \\"
echo "     -w /var/www/certbot \\"
echo "     -d ${DOMAIN} -d www.${DOMAIN} \\"
echo "     --email ${ADMIN_EMAIL} --agree-tos --no-eff-email"
echo ""
echo "7. ĐỔI MẬT KHẨU ADMIN TRONG HỆ THỐNG SAU KHI LÊN:"
echo "   (login web với admin mặc định rồi đổi password)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Docs nội bộ ở: ${PROJECT_DIR}/docs/"
echo ""
echo -e "${GREEN}Hoàn tất. Máy EC2 của bạn đã sẵn sàng chạy dự án 🚀${NC}"
