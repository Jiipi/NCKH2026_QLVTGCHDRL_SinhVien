# 🔧 MANUAL SETUP CHECKLIST

## ⚠️ CÁC BƯỚC CẦN SETUP THỦ CÔNG

Sau khi clone repository và chạy các scripts tự động, bạn CẦN làm các bước sau:

---

## 1. ⚙️ CẤU HÌNH .env.production (BẮT BUỘC)

### Option A: Dùng credentials có sẵn

File `.env.production` đã có sẵn với:
```bash
DB_PASSWORD=hungloveakiha13
CORS_ORIGIN=https://hoatdongrenluyen.io.vn
REACT_APP_API_URL=https://hoatdongrenluyen.io.vn/api
```

**✅ Không cần sửa gì nếu dùng domain này!**

### Option B: Custom credentials

Nếu muốn thay đổi:

```bash
# Copy template
cp .env.example .env.production

# Edit file
nano .env.production
```

**Cần thay đổi:**
1. `DB_PASSWORD` - Password database của bạn
2. `JWT_SECRET` - Generate: `openssl rand -base64 48`
3. `CORS_ORIGIN` - Domain của bạn
4. `REACT_APP_API_URL` - URL API của bạn

---

## 2. 🌐 CẤU HÌNH DNS (Nếu dùng domain thật)

Trên nhà cung cấp domain (GoDaddy, Cloudflare, etc.):

```
Type    Name    Value                   TTL
A       @       <EC2_PUBLIC_IP>         600
A       www     <EC2_PUBLIC_IP>         600
```

**Kiểm tra DNS đã trỏ đúng:**
```bash
nslookup hoatdongrenluyen.io.vn
# Should return your EC2 IP
```

---

## 3. 🔒 CÀI ĐẶT SSL CERTIFICATE (Production)

### Sau khi DNS đã trỏ đúng:

```bash
# 1. Cài Certbot (đã có trong setup-ec2.sh)
sudo apt install -y certbot python3-certbot-nginx

# 2. Tạo thư mục cho certbot
sudo mkdir -p /var/www/certbot

# 3. Lấy SSL certificate
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d hoatdongrenluyen.io.vn \
  -d www.hoatdongrenluyen.io.vn \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email
```

### Certificates sẽ lưu tại:
```
/etc/letsencrypt/live/hoatdongrenluyen.io.vn/fullchain.pem
/etc/letsencrypt/live/hoatdongrenluyen.io.vn/privkey.pem
```

### Auto-renew SSL (Cron job):

```bash
sudo crontab -e

# Thêm dòng này (renew mỗi tháng lúc 3 AM):
0 3 1 * * certbot renew --quiet && docker restart student_app_nginx_prod
```

---

## 4. 🔥 MỞ PORTS TRÊN EC2 SECURITY GROUP

Trên AWS Console → EC2 → Security Groups:

```
Type        Protocol    Port Range    Source          Description
SSH         TCP         22            Your IP         SSH access
HTTP        TCP         80            0.0.0.0/0       Web traffic
HTTPS       TCP         443           0.0.0.0/0       Secure web
Custom TCP  TCP         3000          0.0.0.0/0       Frontend (temp)
Custom TCP  TCP         3001          0.0.0.0/0       Backend (temp)
```

**Sau khi setup nginx reverse proxy, đóng ports 3000/3001 lại!**

---

## 5. 💾 RESTORE DATABASE (Nếu có backup)

### Upload backup file lên server:

**Từ máy local (Windows)**:
```powershell
# Dùng WinSCP hoặc:
scp -i your-key.pem backup.sql ubuntu@<EC2_IP>:~/dacn-web/backups/
```

### Restore database:

```bash
# SSH vào EC2
ssh -i your-key.pem ubuntu@<EC2_IP>

# Restore
cd ~/dacn-web/app
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < ~/dacn-web/backups/backup.sql

# Verify
docker exec student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT COUNT(*) FROM nguoi_dung;"
```

---

## 6. 🔐 ĐỔI PASSWORD MẶC ĐỊNH (BẮT BUỘC!)

### Sau khi deploy, ĐỔI NGAY password admin:

```bash
# SSH vào EC2
cd ~/dacn-web/app

# Login vào website với admin/123456
# Vào Settings → Change Password

# Hoặc reset từ backend:
docker exec -it student_app_backend_prod sh
cd scripts
node reset_passwords_advanced.js --users=admin --password=YourNewPassword123
```

---

## 7. 📊 SETUP MONITORING (Optional nhưng nên có)

### CloudWatch Logs (AWS):

1. Cài CloudWatch Agent:
```bash
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

2. Configure logs:
```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json \
  -s
```

### Docker Monitoring:

```bash
# Install Portainer (Web UI for Docker)
docker volume create portainer_data

docker run -d \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest

# Access: https://<EC2_IP>:9443
```

---

## 8. 🔄 AUTO BACKUP DATABASE (BẮT BUỘC!)

### Tạo cron job backup tự động:

```bash
# Tạo backup script
nano ~/dacn-web/backup.sh
```

**Paste nội dung:**
```bash
#!/bin/bash
BACKUP_DIR="$HOME/dacn-web/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup database
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen -F c > "$BACKUP_DIR/db_$DATE.dump"

# Backup uploads
tar -czf "$BACKUP_DIR/uploads_$DATE.tar.gz" -C ~/dacn-web/app/backend uploads/ 2>/dev/null || true

# Xóa backup cũ hơn 30 ngày
find "$BACKUP_DIR" -name "*.dump" -mtime +30 -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
```

**Setup cron:**
```bash
chmod +x ~/dacn-web/backup.sh

crontab -e
# Thêm dòng (backup hàng ngày lúc 2 AM):
0 2 * * * /home/ubuntu/dacn-web/backup.sh >> /home/ubuntu/dacn-web/logs/backup.log 2>&1
```

---

## 9. 📧 SETUP EMAIL NOTIFICATIONS (Optional)

### Thêm vào .env.production:

```bash
nano .env.production

# Thêm:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@hoatdongrenluyen.io.vn
```

**Note**: Với Gmail, cần tạo App Password:
- Google Account → Security → 2-Step Verification → App passwords

---

## 10. 🔒 SECURITY HARDENING (Production)

### Disable Root Login:

```bash
sudo nano /etc/ssh/sshd_config

# Sửa:
PermitRootLogin no
PasswordAuthentication no

# Restart SSH
sudo systemctl restart sshd
```

### Setup Firewall:

```bash
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

### Fail2Ban (Chặn brute force):

```bash
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## ✅ DEPLOYMENT CHECKLIST

**Trước khi deploy:**
- [ ] File `.env.production` đã cấu hình đúng
- [ ] DNS đã trỏ về EC2 IP
- [ ] Security Group đã mở ports 80, 443
- [ ] Docker và Docker Compose đã cài

**Sau khi deploy:**
- [ ] Tất cả containers đang chạy (`docker ps`)
- [ ] Health checks pass (backend + frontend)
- [ ] Website accessible qua browser
- [ ] SSL certificate đã cài (nếu production)
- [ ] Admin password đã đổi
- [ ] Auto backup đã setup
- [ ] Firewall đã enable

**Production checklist:**
- [ ] Monitoring đã setup
- [ ] Log rotation đã configure
- [ ] Backup restore đã test
- [ ] Email notifications hoạt động
- [ ] Security hardening hoàn tất

---

## 🆘 NẾU GẶP LỖI

### 1. Containers không start
```bash
docker logs student_app_backend_prod --tail 50
docker compose -f docker-compose.prod.yml restart backend
```

### 2. Database connection failed
```bash
docker exec student_app_db_prod pg_isready -U admin
docker restart student_app_db_prod
```

### 3. SSL certificate failed
```bash
# Check DNS first
nslookup hoatdongrenluyen.io.vn

# Try manual mode
sudo certbot certonly --manual -d hoatdongrenluyen.io.vn
```

### 4. Out of disk space
```bash
docker system prune -a --volumes
df -h
```

---

## 📞 SUPPORT

- **Documentation**: `DEPLOYMENT.md`, `docs/AWS_EC2_DEPLOYMENT_GUIDE.md`
- **GitHub Issues**: https://github.com/YOUR_USERNAME/DACN_Web_quanly_hoatdongrenluyen/issues
- **Bug Reports**: Check `EMERGENCY_FIX.md` for known issues

---

**Last Updated**: October 31, 2025  
**Version**: 1.0
