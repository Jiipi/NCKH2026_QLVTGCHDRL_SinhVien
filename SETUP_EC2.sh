#!/bin/bash
set -e

echo "=== UPDATE & INSTALL BASE PACKAGES ==="
# Cập nhật máy + cài Docker, Git, firewall
sudo dnf update -y
sudo dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin git firewalld

# (KHÔNG cài nginx trên host. Mình để nginx chạy trong docker compose của project nếu bạn đã cấu hình container reverse proxy.)

echo "=== ENABLE DOCKER ==="
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker ec2-user

echo "=== ENABLE & CONFIGURE FIREWALLD ==="
sudo systemctl enable firewalld
sudo systemctl start firewalld

# mở SSH, HTTP, HTTPS
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

echo "=== PREPARE /home/ec2-user/app FOLDER ==="
sudo mkdir -p /home/ec2-user/app
sudo chown ec2-user:ec2-user /home/ec2-user/app
cd /home/ec2-user/app

echo "=== CLONE OR RESET CODE ==="
if [ ! -d .git ]; then
    # lần đầu: clone repo về thư mục hiện tại
    git clone https://github.com/Jiipi/QL_DH_RenLuyen.git .
else
    # đã có repo rồi: kéo code mới nhất, bỏ hết thay đổi local
    git fetch origin main
    git reset --hard origin/main
fi

echo "=== CREATE .env (BẢN MẶC ĐỊNH PROD) ==="
cat > /home/ec2-user/app/.env << 'EOF'
NODE_ENV=production

######################################################
# DATABASE (Postgres chạy trong docker-compose)
######################################################
POSTGRES_DB=Web_QuanLyDiemRenLuyen
POSTGRES_USER=admin
POSTGRES_PASSWORD=Hungloveakiha13

# Prisma / Backend connection string (trỏ vào service "db" trong compose)
DATABASE_URL=postgresql://admin:Hungloveakiha13@db:5432/Web_QuanLyDiemRenLuyen?schema=public

######################################################
# BACKEND SERVICE
######################################################
PORT=3001
JWT_SECRET=NgocHung_2025_superSecret_pleaseDontGuess_!!
JWT_EXPIRES_IN=7d

######################################################
# CORS / FRONTEND CALL API
######################################################
# Domain public sẽ dùng reverse proxy /api → backend
CORS_ORIGIN=https://hoatdongrenluyen.io.vn

# Nếu frontend là CRA: REACT_APP_API_URL
# Nếu frontend là Vite: đổi tên biến thành VITE_API_URL=...
REACT_APP_API_URL=https://hoatdongrenluyen.io.vn/api

######################################################
# IMAGE TAG (tuỳ bạn dùng để build image version)
######################################################
IMAGE_TAG=latest
EOF

echo "=== CREATE RUNTIME/VOLUME FOLDERS ==="
mkdir -p /home/ec2-user/app/backend/logs
mkdir -p /home/ec2-user/app/backend/uploads
mkdir -p /home/ec2-user/app/backups
mkdir -p /home/ec2-user/app/certbot/conf
mkdir -p /home/ec2-user/app/certbot/www
mkdir -p /home/ec2-user/app/nginx/logs

sudo chown -R ec2-user:ec2-user /home/ec2-user/app

echo "============================================================"
echo "✅ SETUP CƠ BẢN DONE."
echo ""
echo "TIẾP THEO BẠN LÀM TỪNG BƯỚC NÀY:"
echo ""
echo "1) Thoát SSH rồi SSH vào lại EC2."
echo "   (để ec2-user dùng 'docker' mà không cần sudo sau khi thêm group)."
echo ""
echo "2) Kiểm tra/đổi bí mật trong .env nếu cần:"
echo "   nano /home/ec2-user/app/.env"
echo "   - POSTGRES_PASSWORD (mật khẩu DB)"
echo "   - JWT_SECRET (random dài, riêng tư)"
echo "   - Nếu FE dùng Vite thì đổi REACT_APP_API_URL -> VITE_API_URL"
echo ""
echo "3) DNS:"
echo "   Tạo bản ghi A cho:"
echo "   hoatdongrenluyen.io.vn -> IP public của EC2"
echo "   www.hoatdongrenluyen.io.vn -> IP public của EC2"
echo ""
echo "4) Deploy containers bằng compose production của dự án:"
echo "   cd /home/ec2-user/app"
echo "   docker compose -f docker-compose.production.yml up -d --build"
echo ""
echo "5) Test HTTP bằng IP hoặc domain (chưa SSL)."
echo "   Nếu nginx trong docker map port 80, bạn mở trình duyệt:"
echo "   http://<IP_PUBLIC_EC2>"
echo ""
echo "6) SSL (Let's Encrypt) làm sau khi web HTTP chạy OK."
echo "   Lúc đó mình dùng certbot/nginx container hoặc certbot standalone tuỳ file docker-compose.production.yml."
echo "============================================================"
