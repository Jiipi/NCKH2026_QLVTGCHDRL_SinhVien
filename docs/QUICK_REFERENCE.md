# ===================================================================
# QUICK REFERENCE - PRODUCTION DEPLOYMENT
# hoatdongrenluyen.io.vn
# ===================================================================

## 🚀 DEPLOY NHANH (Quick Start)

### Lần đầu tiên (EC2 Setup)
```bash
# 1. SSH vào EC2
ssh -i hoatdongrenluyen-key.pem ubuntu@[EC2_IP]

# 2. Run setup script
curl -o setup.sh https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/scripts/setup-ec2-production.sh
chmod +x setup.sh && ./setup.sh

# 3. Deploy application
cd ~/hoatdongrenluyen
docker compose -f docker-compose.production.yml up -d

# 4. Setup SSL
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn
```

### Update/Redeploy
```bash
cd ~/hoatdongrenluyen
git pull origin main
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

---

## 📋 LỆNH THƯỜNG DÙNG

### Docker Compose Commands
```bash
# Start all services
docker compose -f docker-compose.production.yml up -d

# Stop all services
docker compose -f docker-compose.production.yml down

# Restart specific service
docker compose -f docker-compose.production.yml restart backend

# View logs (realtime)
docker compose -f docker-compose.production.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.production.yml logs backend -f --tail=100

# Check status
docker compose -f docker-compose.production.yml ps

# Rebuild and restart
docker compose -f docker-compose.production.yml up -d --build

# Stop and remove everything (including volumes)
docker compose -f docker-compose.production.yml down -v
```

### Database Commands
```bash
# Access PostgreSQL shell
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen

# Backup database
docker compose -f docker-compose.production.yml exec db pg_dump -U admin Web_QuanLyDiemRenLuyen | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore database
gunzip -c backup.sql.gz | docker compose -f docker-compose.production.yml exec -T db psql -U admin -d Web_QuanLyDiemRenLuyen

# Run migrations
docker compose -f docker-compose.production.yml exec backend npx prisma db push

# Generate Prisma client
docker compose -f docker-compose.production.yml exec backend npx prisma generate

# Seed database
docker compose -f docker-compose.production.yml exec backend node backend/scripts/seed.js
```

### Nginx Commands
```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

### SSL/Certbot Commands
```bash
# View certificates
sudo certbot certificates

# Renew certificates (manual)
sudo certbot renew

# Test renewal (dry run)
sudo certbot renew --dry-run

# Revoke certificate
sudo certbot revoke --cert-path /etc/letsencrypt/live/hoatdongrenluyen.io.vn/cert.pem
```

### System Monitoring
```bash
# Docker stats (CPU, Memory)
docker stats

# Disk usage
df -h

# Memory usage
free -h

# Process monitor
htop

# Network connections
sudo netstat -tulpn | grep LISTEN

# Check open ports
sudo ss -tulpn
```

### Git Commands
```bash
# Pull latest changes
git pull origin main

# View recent commits
git log --oneline -10

# Checkout specific commit
git checkout [commit-hash]

# Reset to specific commit (CAREFUL!)
git reset --hard [commit-hash]

# View current branch
git branch

# View remote URL
git remote -v
```

---

## 🔧 TROUBLESHOOTING

### Container không start
```bash
# View detailed logs
docker compose -f docker-compose.production.yml logs [service-name] --tail=200

# Inspect container
docker inspect [container-name]

# Check container health
docker compose -f docker-compose.production.yml ps

# Remove and recreate
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --force-recreate
```

### Database connection failed
```bash
# Check database is running
docker compose -f docker-compose.production.yml ps db

# View database logs
docker compose -f docker-compose.production.yml logs db

# Test connection
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT 1;"

# Check DATABASE_URL
docker compose -f docker-compose.production.yml exec backend printenv | grep DATABASE
```

### Website không accessible
```bash
# Check all containers
docker compose -f docker-compose.production.yml ps

# Check nginx
sudo systemctl status nginx

# Check firewall
sudo ufw status

# Test DNS
nslookup hoatdongrenluyen.io.vn

# Test from server
curl http://localhost:80
curl http://localhost:3001/api/health
```

### High CPU/Memory usage
```bash
# View resource usage
docker stats

# Check system resources
htop

# View largest Docker images
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | sort -k 3 -h

# Clean up
docker system prune -a
```

---

## 📊 HEALTH CHECKS

### Quick health check
```bash
# Backend API
curl https://hoatdongrenluyen.io.vn/api/health

# Frontend
curl https://hoatdongrenluyen.io.vn/health

# SSL certificate
curl -vI https://hoatdongrenluyen.io.vn 2>&1 | grep -i "expire"
```

### Full system check
```bash
#!/bin/bash
echo "=== System Health Check ==="
echo ""
echo "1. Containers:"
docker compose -f docker-compose.production.yml ps
echo ""
echo "2. Disk Usage:"
df -h | grep -E "(Filesystem|/$|/home)"
echo ""
echo "3. Memory:"
free -h
echo ""
echo "4. Backend Health:"
curl -s http://localhost:3001/api/health | jq .
echo ""
echo "5. SSL Certificate:"
sudo certbot certificates | grep -E "(Certificate Name|Expiry Date)"
```

---

## 🔐 SECURITY

### View environment variables (SECURE!)
```bash
# DO NOT share these values!
cat ~/hoatdongrenluyen/.env

# Generate new secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -hex 32     # SESSION_SECRET
openssl rand -base64 16  # Password
```

### Firewall rules
```bash
# View current rules
sudo ufw status verbose

# Allow port
sudo ufw allow 80/tcp

# Deny port
sudo ufw deny 5432/tcp

# Reload firewall
sudo ufw reload
```

### SSH Security
```bash
# View SSH config
sudo cat /etc/ssh/sshd_config

# Restart SSH
sudo systemctl restart sshd

# View failed login attempts
sudo grep "Failed password" /var/log/auth.log
```

---

## 💾 BACKUP & RESTORE

### Full backup
```bash
#!/bin/bash
BACKUP_DIR=~/backups/$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database
docker compose -f docker-compose.production.yml exec db pg_dump -U admin Web_QuanLyDiemRenLuyen | gzip > $BACKUP_DIR/database.sql.gz

# Uploads
tar -czf $BACKUP_DIR/uploads.tar.gz -C ~/hoatdongrenluyen/backend uploads/

# Environment
cp ~/hoatdongrenluyen/.env $BACKUP_DIR/

# Logs
tar -czf $BACKUP_DIR/logs.tar.gz -C ~/hoatdongrenluyen/backend logs/

echo "Backup saved to: $BACKUP_DIR"
```

### Restore from backup
```bash
BACKUP_DIR=~/backups/20251030_120000

# Stop backend
docker compose -f docker-compose.production.yml stop backend

# Restore database
gunzip -c $BACKUP_DIR/database.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T db psql -U admin -d Web_QuanLyDiemRenLuyen

# Restore uploads
tar -xzf $BACKUP_DIR/uploads.tar.gz -C ~/hoatdongrenluyen/backend/

# Restore .env
cp $BACKUP_DIR/.env ~/hoatdongrenluyen/

# Start backend
docker compose -f docker-compose.production.yml start backend
```

---

## 🎯 PERFORMANCE

### View metrics
```bash
# Container stats
docker stats --no-stream

# Nginx status
curl http://localhost/nginx_status

# Database connections
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen -c "SELECT count(*) FROM pg_stat_activity;"

# Response time test
time curl -s https://hoatdongrenluyen.io.vn > /dev/null
```

### Optimize
```bash
# Clean Docker cache
docker builder prune -a

# Clean logs
sudo truncate -s 0 /var/log/nginx/access.log
sudo truncate -s 0 /var/log/nginx/error.log

# Vacuum database
docker compose -f docker-compose.production.yml exec db psql -U admin -d Web_QuanLyDiemRenLuyen -c "VACUUM ANALYZE;"
```

---

## 📞 EMERGENCY

### Site down - Quick fix
```bash
# 1. Restart all services
cd ~/hoatdongrenluyen
docker compose -f docker-compose.production.yml restart

# 2. If still down, rebuild
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

# 3. View logs
docker compose -f docker-compose.production.yml logs -f --tail=100
```

### Rollback to previous version
```bash
cd ~/hoatdongrenluyen

# View commits
git log --oneline -5

# Rollback
git reset --hard [previous-commit-hash]

# Rebuild
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
```

### Database corrupted
```bash
# Restore from latest backup
cd ~/hoatdongrenluyen
docker compose -f docker-compose.production.yml stop backend

# Find latest backup
ls -lt ~/backups/

# Restore
gunzip -c ~/backups/[latest]/database.sql.gz | \
  docker compose -f docker-compose.production.yml exec -T db psql -U admin -d Web_QuanLyDiemRenLuyen

docker compose -f docker-compose.production.yml start backend
```

---

## 📝 NOTES

- **Always backup before making changes!**
- **Test in development first**
- **Monitor logs after deployment**
- **Keep secrets secure - never commit .env**
- **Document all manual changes**

---

**Last Updated**: 30/10/2025  
**Domain**: https://hoatdongrenluyen.io.vn  
**Status**: Production
