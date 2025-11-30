#!/bin/bash

###############################################################################
# EC2 AUTO SETUP SCRIPT (Amazon Linux 2023 / Ubuntu)
# 
# Script tá»± Ä‘á»™ng cĂ i Ä‘áº·t MĂ”I TRÆ¯á»œNG cho deployment:
# - Docker, Docker Compose
# - Nginx reverse proxy
# - SSL/Let's Encrypt
# - Firewall
# - Táº¡o .env files
#
# CĂCH DĂ™NG:
#   1. SSH vĂ o EC2: ssh -i key.pem ec2-user@<IP>
#   2. Clone repo:  git clone https://github.com/Jiipi/QL_DH_RenLuyen.git
#   3. Cháº¡y setup:  cd QL_DH_RenLuyen && bash scripts/setup-ec2.sh
#   4. LOGOUT & SSH Láº I (Ä‘á»ƒ nháº­n quyá»n docker)
#   5. Cháº¡y deploy: cd QL_DH_RenLuyen && bash scripts/deploy.sh
#
###############################################################################

set -e

# ==================== CONFIGURATION ====================
DOMAIN="hoatdongrenluyen.io.vn"
ADMIN_EMAIL="ngochungtran.aity@gmail.com"
DB_PASSWORD="hungloveakiha13"
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# SMTP Configuration (Gmail) - Đã cấu hình từ local
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_SECURE="true"
SMTP_USER="hungmegame.it@gmail.com"
SMTP_PASS="osvwuajsrywtpgym"
SMTP_FROM="Hệ thống <hungmegame.it@gmail.com>"
SMTP_DEBUG="true"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘  đŸ€ EC2 AUTO SETUP - DACN Web Quáº£n LĂ½ Hoáº¡t Äá»™ng RĂ¨n Luyá»‡n     â•‘"
echo "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo -e "${NC}"
echo "đŸ“ Project directory: $PROJECT_DIR"
echo "đŸŒ Domain: $DOMAIN"
echo ""

# ==================== VALIDATION ====================
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}âŒ KhĂ´ng cháº¡y script báº±ng root/sudo${NC}"
   echo "Cháº¡y: bash scripts/setup-ec2.sh"
   exit 1
fi

# Detect package manager
PM=""
if command -v dnf >/dev/null 2>&1; then
    PM="dnf"
elif command -v yum >/dev/null 2>&1; then
    PM="yum"
elif command -v apt-get >/dev/null 2>&1; then
    PM="apt-get"
else
    echo -e "${RED}âŒ KhĂ´ng tĂ¬m tháº¥y package manager (dnf/yum/apt)${NC}"
    exit 1
fi
echo "đŸ“¦ Package manager: $PM"

###############################################################################
# STEP 1: Update System & Install Dependencies
###############################################################################
echo -e "\n${YELLOW}[1/7] đŸ“¦ Updating system & installing dependencies...${NC}"

if [ "$PM" = "apt-get" ]; then
    sudo apt-get update -y
    sudo apt-get install -y curl wget git nano htop net-tools unzip openssl
else
    sudo $PM -y update || true
    sudo $PM -y install curl wget git nano htop net-tools unzip openssl || true
fi

echo -e "${GREEN}âœ… System updated${NC}"

###############################################################################
# STEP 2: Install Docker
###############################################################################
echo -e "\n${YELLOW}[2/7] đŸ³ Installing Docker...${NC}"

if command -v docker >/dev/null 2>&1; then
    echo "Docker already installed"
    docker --version
else
    if [ "$PM" = "apt-get" ]; then
        # Ubuntu/Debian
        curl -fsSL https://get.docker.com | sudo sh
    else
        # Amazon Linux / CentOS / RHEL
        if [ ! -f /etc/yum.repos.d/docker-ce.repo ]; then
            sudo $PM -y install dnf-plugins-core || true
            sudo $PM config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo || true
            sudo sed -i 's/\$releasever/9/g' /etc/yum.repos.d/docker-ce.repo 2>/dev/null || true
        fi
        sudo $PM -y install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin --nobest || \
        sudo $PM -y install docker docker-compose || true
    fi
fi

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker

# Add user to docker group
sudo usermod -aG docker $USER || true

echo -e "${GREEN}âœ… Docker installed${NC}"
docker --version || true

###############################################################################
# STEP 3: Install Nginx
###############################################################################
echo -e "\n${YELLOW}[3/7] đŸŒ Installing Nginx...${NC}"

if [ "$PM" = "apt-get" ]; then
    sudo apt-get install -y nginx certbot python3-certbot-nginx
else
    sudo $PM -y install nginx || true
    sudo $PM -y install certbot python3-certbot-nginx || true
fi

sudo systemctl enable nginx
sudo systemctl start nginx

echo -e "${GREEN}âœ… Nginx installed${NC}"

###############################################################################
# STEP 4: Configure Firewall
###############################################################################
echo -e "\n${YELLOW}[4/7] đŸ”¥ Configuring firewall...${NC}"

if command -v firewall-cmd >/dev/null 2>&1; then
    sudo systemctl enable firewalld 2>/dev/null || true
    sudo systemctl start firewalld 2>/dev/null || true
    sudo firewall-cmd --permanent --add-service=ssh || true
    sudo firewall-cmd --permanent --add-service=http || true
    sudo firewall-cmd --permanent --add-service=https || true
    sudo firewall-cmd --reload || true
elif command -v ufw >/dev/null 2>&1; then
    sudo ufw allow ssh || true
    sudo ufw allow http || true
    sudo ufw allow https || true
    sudo ufw --force enable || true
fi

echo -e "${GREEN}âœ… Firewall configured${NC}"

###############################################################################
# STEP 5: Generate Environment Files
###############################################################################
echo -e "\n${YELLOW}[5/7] â™ï¸  Generating environment files...${NC}"

cd "$PROJECT_DIR"

# Generate JWT secret
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n' | tr -d '/')

# SMTP đã được cấu hình sẵn từ local
echo -e "${GREEN}✓ SMTP Email đã được cấu hình: ${SMTP_USER}${NC}"

# Create .env.production
cat > .env.production << EOF
# =========================
# Database Configuration
# =========================
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://admin:${DB_PASSWORD}@db:5432/Web_QuanLyDiemRenLuyen?schema=public

# =========================
# JWT Configuration
# =========================
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# =========================
# CORS / API
# =========================
CORS_ORIGIN=https://${DOMAIN}
REACT_APP_API_URL=https://${DOMAIN}/api

# =========================
# SMTP Email Configuration
# =========================
# Cấu hình SMTP để gửi email (quên mật khẩu, thông báo, etc.)
# Ví dụ với Gmail:
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_SECURE=false
# SMTP_USER=your-email@gmail.com
# SMTP_PASS=your-app-password
# SMTP_FROM=your-email@gmail.com
# SMTP_DEBUG=false
#
# LƯU Ý: Cần cấu hình SMTP để tính năng quên mật khẩu hoạt động!
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_SECURE=${SMTP_SECURE}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
SMTP_FROM=${SMTP_FROM}
SMTP_DEBUG=${SMTP_DEBUG}

# =========================
# Runtime
# =========================
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
EOF

# Copy to .env (docker-compose reads this by default)
cp .env.production .env

# Link to backend
ln -sf "$PROJECT_DIR/.env.production" "$PROJECT_DIR/backend/.env" 2>/dev/null || true

echo -e "${GREEN}âœ… Environment files created${NC}"

###############################################################################
# STEP 6: Configure Nginx Reverse Proxy
###############################################################################
echo -e "\n${YELLOW}[6/7] đŸ”§ Configuring Nginx reverse proxy...${NC}"

PUBLIC_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "localhost")

# Remove default nginx config if exists
sudo rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
sudo rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# Create nginx config for the domain
sudo tee /etc/nginx/conf.d/app.conf > /dev/null << EOF
# Upstream definitions
upstream backend_upstream {
    server 127.0.0.1:3001 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream frontend_upstream {
    server 127.0.0.1:3000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

# Rate limiting - Tăng cao để tránh bị chặn khi sử dụng nhiều
limit_req_zone \$binary_remote_addr zone=api_limit:10m rate=100r/s;
limit_req_zone \$binary_remote_addr zone=login_limit:10m rate=100r/m;

# HTTP Server
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN} ${PUBLIC_IP};

    client_max_body_size 20M;

    # Let's Encrypt verification
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # API proxy
    location /api/ {
        limit_req zone=api_limit burst=200 nodelay;
        
        proxy_pass http://backend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Frontend proxy
    location / {
        proxy_pass http://frontend_upstream;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Increase timeouts for better reliability
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # Retry on errors
        proxy_next_upstream error timeout http_502 http_503 http_504;
        proxy_next_upstream_tries 3;
        proxy_next_upstream_timeout 10s;
        
        # Don't fail if backend is down temporarily
        proxy_intercept_errors off;
    }
}
EOF

# Create certbot webroot
sudo mkdir -p /var/www/certbot
sudo chown -R $USER:$USER /var/www/certbot 2>/dev/null || true

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

echo -e "${GREEN}âœ… Nginx configured${NC}"

###############################################################################
# STEP 7: Create necessary directories
###############################################################################
echo -e "\n${YELLOW}[7/7] đŸ“ Creating necessary directories...${NC}"

mkdir -p "$PROJECT_DIR/backend/logs"
mkdir -p "$PROJECT_DIR/backend/uploads"
mkdir -p "$PROJECT_DIR/backend/backups"
mkdir -p "$PROJECT_DIR/nginx/logs"
mkdir -p "$PROJECT_DIR/nginx/ssl"

echo -e "${GREEN}âœ… Directories created${NC}"

###############################################################################
# DONE - Print Summary
###############################################################################
echo ""
echo -e "${GREEN}"
echo "â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—"
echo "â•‘  âœ… SETUP HOĂ€N Táº¤T!                                            â•‘"
echo "â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•"
echo -e "${NC}"

echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo "đŸ“‹ THĂ”NG TIN QUAN TRá»ŒNG:"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo ""
echo "  đŸŒ Domain:      ${DOMAIN}"
echo "  đŸ–¥ï¸  Public IP:   ${PUBLIC_IP}"
echo "  đŸ” DB Password: ${DB_PASSWORD}"
echo "  đŸ”‘ JWT Secret:  (Ä‘Ă£ táº¡o trong .env.production)"
echo ""
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo -e "${RED}â ï¸  QUAN TRá»ŒNG: PHáº¢I LOGOUT VĂ€ SSH Láº I TRÆ¯á»C KHI DEPLOY!${NC}"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo ""
echo "  1. GĂµ: exit"
echo "  2. SSH láº¡i: ssh -i your-key.pem ec2-user@${PUBLIC_IP}"
echo "  3. Deploy:  cd ${PROJECT_DIR} && bash scripts/deploy.sh"
echo ""
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo "đŸ“‹ SAU KHI DEPLOY THĂ€NH CĂ”NG:"
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo ""
echo "  đŸŒ Truy cáº­p web: http://${PUBLIC_IP}"
echo "                   http://${DOMAIN} (náº¿u DNS Ä‘Ă£ trá»)"
echo ""
echo "  đŸ”’ Cáº¥p SSL (sau khi DNS trá» domain â†’ IP):"
echo "     sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
echo ""
echo "â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”â”"
echo ""
echo -e "${GREEN}đŸ‰ Setup hoĂ n táº¥t!${NC}"
