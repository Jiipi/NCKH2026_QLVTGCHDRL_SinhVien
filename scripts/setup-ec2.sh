#!/bin/bash

###############################################################################
# EC2 AUTO SETUP SCRIPT
# Script tự động cài đặt môi trường cho deployment
# Run: curl -fsSL https://raw.githubusercontent.com/YOUR_REPO/main/scripts/setup-ec2.sh | bash
###############################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  🚀 EC2 AUTO SETUP SCRIPT                                ║"
echo "║  Cài đặt môi trường cho DACN Web Quản Lý Rèn Luyện     ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}❌ Không chạy script với sudo/root${NC}"
   echo "Chạy: bash setup-ec2.sh"
   exit 1
fi

###############################################################################
# STEP 1: Update System
###############################################################################
echo -e "\n${YELLOW}[1/8] Updating system packages...${NC}"
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl wget git nano htop net-tools unzip

echo -e "${GREEN}✅ System updated${NC}"

###############################################################################
# STEP 2: Install Docker
###############################################################################
echo -e "\n${YELLOW}[2/8] Installing Docker...${NC}"

# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc || true

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    # Enable Docker
    sudo systemctl enable docker
    sudo systemctl start docker
    
    echo -e "${GREEN}✅ Docker installed${NC}"
else
    echo -e "${GREEN}✅ Docker already installed${NC}"
fi

docker --version

###############################################################################
# STEP 3: Install Docker Compose
###############################################################################
echo -e "\n${YELLOW}[3/8] Installing Docker Compose...${NC}"

if ! command -v docker compose &> /dev/null; then
    sudo apt install -y docker-compose-plugin
    echo -e "${GREEN}✅ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✅ Docker Compose already installed${NC}"
fi

docker compose version

###############################################################################
# STEP 4: Setup Project Directory
###############################################################################
echo -e "\n${YELLOW}[4/8] Setting up project directories...${NC}"

mkdir -p ~/dacn-web/{backups,data,logs}
cd ~/dacn-web

echo -e "${GREEN}✅ Directories created${NC}"

###############################################################################
# STEP 5: Clone Repository (Interactive)
###############################################################################
echo -e "\n${YELLOW}[5/8] Cloning repository...${NC}"

if [ -d "app" ]; then
    echo -e "${YELLOW}⚠️  Directory 'app' already exists${NC}"
    read -p "Xóa và clone lại? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf app
    else
        echo -e "${YELLOW}⏭️  Skipping clone${NC}"
    fi
fi

if [ ! -d "app" ]; then
    echo "Nhập GitHub repository URL:"
    echo "Ví dụ: https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen.git"
    read -p "URL: " REPO_URL
    
    git clone $REPO_URL app
    echo -e "${GREEN}✅ Repository cloned${NC}"
fi

cd ~/dacn-web/app

###############################################################################
# STEP 6: Generate Environment Variables
###############################################################################
echo -e "\n${YELLOW}[6/8] Generating environment variables...${NC}"

# Generate random JWT secret
JWT_SECRET=$(openssl rand -base64 48)
DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-20)

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 Cấu hình môi trường"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Get domain
read -p "Nhập domain của bạn (ví dụ: example.com): " DOMAIN
read -p "Nhập email của bạn (cho SSL): " EMAIL

# Create .env.production
cat > .env.production << EOF
# Database Configuration
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=${DB_PASSWORD}
DATABASE_URL=postgresql://admin:${DB_PASSWORD}@db:5432/Web_QuanLyDiemRenLuyen?schema=public

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=https://${DOMAIN}

# API URL for Frontend
REACT_APP_API_URL=https://${DOMAIN}/api

# Node Environment
NODE_ENV=production
PORT=3001

# Logging
LOG_LEVEL=info
EOF

# Create symlink for backend
ln -sf $(pwd)/.env.production backend/.env

echo -e "${GREEN}✅ Environment variables created${NC}"
echo ""
echo "Generated credentials:"
echo "  DB Password: ${DB_PASSWORD}"
echo "  JWT Secret: ${JWT_SECRET}"
echo ""
echo "⚠️  QUAN TRỌNG: Lưu lại các thông tin này!"
echo ""
read -p "Press Enter to continue..."

###############################################################################
# STEP 7: Configure Firewall
###############################################################################
echo -e "\n${YELLOW}[7/8] Configuring firewall...${NC}"

if ! command -v ufw &> /dev/null; then
    sudo apt install -y ufw
fi

# Configure UFW
sudo ufw --force enable
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'

echo -e "${GREEN}✅ Firewall configured${NC}"
sudo ufw status

###############################################################################
# STEP 8: Setup SSL (Optional)
###############################################################################
echo -e "\n${YELLOW}[8/8] Setup SSL Certificate...${NC}"

read -p "Bạn có muốn cài đặt SSL certificate ngay bây giờ? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Create webroot
    sudo mkdir -p /var/www/certbot
    
    echo "SSL sẽ được cài sau khi website đã chạy"
    echo "Chạy lệnh sau khi containers đã start:"
    echo ""
    echo "sudo certbot certonly --webroot \\"
    echo "  -w /var/www/certbot \\"
    echo "  -d ${DOMAIN} \\"
    echo "  -d www.${DOMAIN} \\"
    echo "  --email ${EMAIL} \\"
    echo "  --agree-tos \\"
    echo "  --no-eff-email"
    echo ""
fi

###############################################################################
# COMPLETION
###############################################################################
echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  ✅ SETUP HOÀN TẤT!                                       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 NEXT STEPS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1. ĐĂNG XUẤT VÀ ĐĂNG NHẬP LẠI (để apply Docker group)"
echo "   exit"
echo "   ssh -i your-key.pem ubuntu@<EC2_IP>"
echo ""
echo "2. BUILD VÀ START CONTAINERS"
echo "   cd ~/dacn-web/app"
echo "   docker compose -f docker-compose.prod.yml build"
echo "   docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "3. KIỂM TRA STATUS"
echo "   docker ps"
echo "   docker logs student_app_backend_prod"
echo ""
echo "4. RESTORE DATABASE (nếu có backup)"
echo "   docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < backup.dump"
echo ""
echo "5. CẤU HÌNH DNS"
echo "   Trỏ domain ${DOMAIN} về IP: $(curl -s ifconfig.me)"
echo ""
echo "6. CÀI SSL (sau khi DNS đã trỏ)"
echo "   sudo certbot certonly --webroot -w /var/www/certbot -d ${DOMAIN} --email ${EMAIL}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📚 Documentation: ~/dacn-web/app/docs/AWS_EC2_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
