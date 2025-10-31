# ⚡ DEPLOYMENT QUICK REFERENCE

> **Cheatsheet nhanh cho deployment**

---

## 🚀 ONE-COMMAND DEPLOYMENT

```bash
git clone https://github.com/Jiipi/QL_DH_RenLuyen.git
cd QL_DH_RenLuyen
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

**Done!** Website: `http://localhost:3000`

---

## 🔐 CREDENTIALS

```bash
# Database
Host: localhost:5432
DB:   Web_QuanLyDiemRenLuyen
User: admin
Pass: hungloveakiha13

# Default Accounts
admin   / 123456
gv001   / 123456
2021001 / 123456
```

---

## 🐳 DOCKER COMMANDS

```bash
# Start all
docker compose -f docker-compose.prod.yml up -d

# Stop all
docker compose -f docker-compose.prod.yml down

# Restart service
docker compose -f docker-compose.prod.yml restart backend

# View logs
docker logs -f student_app_backend_prod

# Exec into container
docker exec -it student_app_backend_prod sh

# Stats
docker stats
```

---

## 🔄 UPDATE CODE

```bash
# Pull latest + rebuild + restart
./scripts/deploy.sh

# Options
./scripts/deploy.sh --skip-pull      # No git pull
./scripts/deploy.sh --skip-build     # Only restart
./scripts/deploy.sh --no-cache       # Clean build
```

---

## 💾 BACKUP & RESTORE

```bash
# Backup
docker exec student_app_db_prod pg_dump -U admin -d Web_QuanLyDiemRenLuyen > backup.sql

# Restore
docker exec -i student_app_db_prod psql -U admin -d Web_QuanLyDiemRenLuyen < backup.sql

# Reset passwords
docker exec student_app_backend_prod node scripts/quick_reset_passwords.js
```

---

## 🌐 EC2 DEPLOYMENT

```bash
# SSH to EC2
ssh -i key.pem ubuntu@<EC2_IP>

# Auto setup
curl -fsSL https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/scripts/setup-ec2.sh | bash

# Logout and login again
exit
ssh -i key.pem ubuntu@<EC2_IP>

# Deploy
cd ~/dacn-web/app
./scripts/deploy.sh
```

---

## 🔒 SSL SETUP

```bash
# After DNS configured
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d hoatdongrenluyen.io.vn \
  --email your@email.com

# Start with nginx
docker compose -f docker-compose.prod.yml --profile with-nginx up -d
```

---

## 📊 HEALTH CHECKS

```bash
curl http://localhost:3001/api/health  # Backend
curl http://localhost:3000/health      # Frontend
docker ps                              # Containers
docker exec student_app_db_prod pg_isready -U admin  # Database
```

---

## 🆘 TROUBLESHOOTING

```bash
# View logs
docker logs student_app_backend_prod --tail 50

# Restart service
docker restart student_app_backend_prod

# Rebuild
docker compose -f docker-compose.prod.yml build backend
docker compose -f docker-compose.prod.yml up -d backend

# Clean up
docker system prune -a --volumes
```

---

## 📁 IMPORTANT FILES

```
.env.production              - Production credentials
scripts/deploy.sh           - Deploy script
scripts/setup-ec2.sh        - EC2 auto setup
docker-compose.prod.yml     - Production compose
MANUAL_SETUP.md             - Manual setup steps
DEPLOYMENT.md               - Full deployment guide
```

---

## ✅ CHECKLIST

**Before deploy:**
- [ ] `.env.production` configured
- [ ] Docker installed
- [ ] Ports available (3000, 3001, 5432)

**After deploy:**
- [ ] All containers running
- [ ] Health checks pass
- [ ] Website accessible
- [ ] Change admin password!

---

## 📞 NEED HELP?

- **Full Guide**: `DEPLOYMENT.md`
- **Manual Steps**: `MANUAL_SETUP.md`
- **Issues**: [GitHub Issues](https://github.com/Jiipi/QL_DH_RenLuyen/issues)

---

**Version**: 1.0 | **Updated**: Oct 31, 2025
