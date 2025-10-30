#!/bin/bash

# ===================================================================
# EC2 SERVER SETUP SCRIPT
# Cài đặt môi trường production cho hoatdongrenluyen.io.vn
# Ubuntu 22.04 LTS
# ===================================================================

set -e  # Exit on error

echo "======================================================================"
echo "  EC2 PRODUCTION SERVER SETUP"
echo "  hoatdongrenluyen.io.vn"
echo "======================================================================"
echo ""

# ==================== VARIABLES ====================
APP_DIR="$HOME/hoatdongrenluyen"
GITHUB_REPO="git@github.com:Jiipi/QL_DH_RenLuyen.git"
DOMAIN="hoatdongrenluyen.io.vn"

# ==================== 1. UPDATE SYSTEM ====================
echo "📦 [1/10] Updating system packages..."
sudo apt update
sudo apt upgrade -y
sudo apt install -y \
    curl \
    wget \
    git \
    vim \
    htop \
    net-tools \
    ufw \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common

echo "✅ System updated successfully!"
echo ""

# ==================== 2. INSTALL DOCKER ====================
echo "🐳 [2/10] Installing Docker..."

# Remove old versions
sudo apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

echo "✅ Docker installed: $(docker --version)"
echo ""

# ==================== 3. CONFIGURE FIREWALL ====================
echo "🔥 [3/10] Configuring firewall (UFW)..."

sudo ufw --force enable
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny direct database access from internet
sudo ufw deny 5432/tcp

sudo ufw reload

echo "✅ Firewall configured!"
sudo ufw status verbose
echo ""

# ==================== 4. INSTALL NGINX ====================
echo "🌐 [4/10] Installing Nginx..."

sudo apt install -y nginx

sudo systemctl start nginx
sudo systemctl enable nginx

echo "✅ Nginx installed: $(nginx -v 2>&1)"
echo ""

# ==================== 5. INSTALL CERTBOT ====================
echo "🔒 [5/10] Installing Certbot for SSL..."

sudo apt install -y certbot python3-certbot-nginx

echo "✅ Certbot installed: $(certbot --version)"
echo ""

# ==================== 6. SETUP SSH FOR GITHUB ====================
echo "🔑 [6/10] Setting up SSH for GitHub..."

if [ ! -f ~/.ssh/id_ed25519 ]; then
    ssh-keygen -t ed25519 -C "server@$DOMAIN" -f ~/.ssh/id_ed25519 -N ""
    echo ""
    echo "📋 Copy this SSH public key and add to GitHub (Settings → SSH Keys):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    cat ~/.ssh/id_ed25519.pub
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Press Enter after adding the key to GitHub..."
    read
fi

# Add GitHub to known hosts
ssh-keyscan -H github.com >> ~/.ssh/known_hosts 2>/dev/null

echo "✅ SSH configured for GitHub!"
echo ""

# ==================== 7. CLONE REPOSITORY ====================
echo "📥 [7/10] Cloning repository from GitHub..."

if [ -d "$APP_DIR" ]; then
    echo "⚠️  Directory $APP_DIR already exists. Pulling latest changes..."
    cd $APP_DIR
    git pull origin main
else
    git clone $GITHUB_REPO $APP_DIR
    cd $APP_DIR
fi

echo "✅ Repository cloned to $APP_DIR"
echo ""

# ==================== 8. CREATE DIRECTORIES ====================
echo "📁 [8/10] Creating necessary directories..."

mkdir -p $APP_DIR/backend/logs
mkdir -p $APP_DIR/backend/uploads
mkdir -p $APP_DIR/backups
mkdir -p $APP_DIR/certbot/conf
mkdir -p $APP_DIR/certbot/www
mkdir -p $APP_DIR/nginx/logs

echo "✅ Directories created!"
echo ""

# ==================== 9. SETUP ENVIRONMENT FILE ====================
echo "⚙️  [9/10] Setting up environment variables..."

if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creating .env file from template..."
    
    # Generate secure passwords
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    JWT_SECRET=$(openssl rand -base64 32)
    SESSION_SECRET=$(openssl rand -hex 32)
    
    cat > $APP_DIR/.env << EOF
# Production Environment Variables
NODE_ENV=production

# Database
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=$DB_PASSWORD
DATABASE_URL=postgresql://admin:$DB_PASSWORD@db:5432/Web_QuanLyDiemRenLuyen?schema=public

# Backend
PORT=3001

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Session
SESSION_SECRET=$SESSION_SECRET

# CORS
CORS_ORIGIN=https://$DOMAIN,https://www.$DOMAIN

# Frontend
REACT_APP_API_URL=https://$DOMAIN/api

# Uploads
MAX_FILE_SIZE=10485760
LOG_LEVEL=info

# Docker
IMAGE_TAG=latest
EOF

    echo "✅ .env file created with secure generated passwords!"
    echo ""
    echo "⚠️  IMPORTANT: Save these credentials securely!"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Database Password: $DB_PASSWORD"
    echo "JWT Secret: $JWT_SECRET"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
else
    echo "⚠️  .env file already exists. Skipping..."
fi

echo ""

# ==================== 10. SETUP NGINX CONFIGURATION ====================
echo "🌐 [10/10] Setting up Nginx configuration..."

# Stop nginx temporarily
sudo systemctl stop nginx

# Backup default nginx config
sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup 2>/dev/null || true

# Create site configuration
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name hoatdongrenluyen.io.vn www.hoatdongrenluyen.io.vn;

    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Proxy to Docker nginx
    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
sudo nginx -t

# Start nginx
sudo systemctl start nginx

echo "✅ Nginx configured!"
echo ""

# ==================== FINAL STEPS ====================
echo "======================================================================"
echo "  ✅ EC2 SETUP COMPLETED SUCCESSFULLY!"
echo "======================================================================"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Configure DNS:"
echo "   - Go to your domain registrar"
echo "   - Add A record: $DOMAIN → $(curl -s ifconfig.me)"
echo "   - Add A record: www.$DOMAIN → $(curl -s ifconfig.me)"
echo ""
echo "2. Setup SSL Certificate:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "3. Deploy application:"
echo "   cd $APP_DIR"
echo "   docker compose -f docker-compose.production.yml up -d"
echo ""
echo "4. Check status:"
echo "   docker compose -f docker-compose.production.yml ps"
echo "   docker compose -f docker-compose.production.yml logs -f"
echo ""
echo "5. Setup GitHub Actions:"
echo "   - Add secrets to GitHub repository:"
echo "     * EC2_SSH_KEY: Your private SSH key"
echo "     * EC2_HOST: $(curl -s ifconfig.me)"
echo "     * EC2_USER: $(whoami)"
echo "     * DB_PASSWORD, JWT_SECRET (from .env file)"
echo ""
echo "======================================================================"
echo "  Application directory: $APP_DIR"
echo "  Public IP: $(curl -s ifconfig.me)"
echo "======================================================================"
