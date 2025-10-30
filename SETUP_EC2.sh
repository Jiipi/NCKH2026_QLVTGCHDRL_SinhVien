#!/bin/bash
# SETUP EC2 - CHỈ CHẠY 1 LẦN

# 1. UPDATE & INSTALL
sudo apt update && sudo apt upgrade -y
sudo apt install -y docker.io docker-compose git nginx certbot python3-certbot-nginx

# 2. ADD USER TO DOCKER
sudo usermod -aG docker $USER
newgrp docker

# 3. FIREWALL
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# 4. SSH KEY CHO GITHUB
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
echo "ADD KEY NÀY VÀO GITHUB:"
cat ~/.ssh/id_ed25519.pub

echo "Nhấn Enter sau khi add key vào GitHub..."
read

# 5. CLONE PROJECT
cd ~
git clone git@github.com:Jiipi/QL_DH_RenLuyen.git
cd QL_DH_RenLuyen

# 6. TẠO .ENV
cat > .env << 'EOF'
NODE_ENV=production
DB_NAME=Web_QuanLyDiemRenLuyen
DB_USER=admin
DB_PASSWORD=ChangeMeSecure123!
DATABASE_URL=postgresql://admin:ChangeMeSecure123!@db:5432/Web_QuanLyDiemRenLuyen?schema=public
PORT=3001
JWT_SECRET=ChangeMeJWTSecret32CharsMinimum!
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://hoatdongrenluyen.io.vn
REACT_APP_API_URL=https://hoatdongrenluyen.io.vn/api
IMAGE_TAG=latest
EOF

echo "ĐÃ XONG! TIẾP THEO:"
echo "1. Đổi password trong .env"
echo "2. Cấu hình DNS: A record @ và www -> IP này: $(curl -s ifconfig.me)"
echo "3. Chạy: docker compose -f docker-compose.production.yml up -d"
echo "4. Chạy: sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn"
