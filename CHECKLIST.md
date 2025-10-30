# CHECKLIST DEPLOY PRODUCTION

## ☐ TRƯỚC KHI BẮT ĐẦU

- [ ] Có AWS account
- [ ] Đã mua domain `hoatdongrenluyen.io.vn`
- [ ] Có EC2 Amazon Linux 2 đang chạy
- [ ] Có file `.pem` key để SSH

---

## ☐ BƯỚC 1: SETUP EC2 (15 phút)

```bash
ssh -i key.pem ec2-user@[EC2_IP]
curl -o setup.sh https://raw.githubusercontent.com/Jiipi/QL_DH_RenLuyen/main/SETUP_EC2.sh
bash setup.sh
```

- [ ] Script chạy xong không lỗi
- [ ] Copy SSH key hiển thị
- [ ] Add key vào GitHub (Settings → SSH Keys)
- [ ] File `/home/ec2-user/app/.env` đã tồn tại

---

## ☐ BƯỚC 2: ĐỔI MẬT KHẨU TRONG .ENV (2 phút)

```bash
nano /home/ec2-user/app/.env
```

Đổi các dòng:
- [ ] `DB_PASSWORD=...` (dùng: `openssl rand -base64 16`)
- [ ] `DATABASE_URL=...` (thay password giống trên)
- [ ] `JWT_SECRET=...` (dùng: `openssl rand -base64 32`)

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ☐ BƯỚC 3: CẤU HÌNH DNS (5 phút)

Vào nhà cung cấp domain, thêm DNS records:

- [ ] A record: `@` → `[EC2_IP]`
- [ ] A record: `www` → `[EC2_IP]`

Test sau 5 phút:
```bash
nslookup hoatdongrenluyen.io.vn
```

---

## ☐ BƯỚC 4: DEPLOY APP (5 phút)

```bash
cd /home/ec2-user/app
docker compose -f docker-compose.production.yml up -d
```

Đợi 2-3 phút, kiểm tra:

```bash
docker compose -f docker-compose.production.yml ps
```

- [ ] 4-5 containers đang chạy (db, backend, frontend, nginx, certbot)
- [ ] Status: "Up" hoặc "Up (healthy)"

Test HTTP:
```bash
curl http://hoatdongrenluyen.io.vn
```

- [ ] Có response HTML

---

## ☐ BƯỚC 5: SETUP SSL (3 phút)

```bash
sudo certbot --nginx -d hoatdongrenluyen.io.vn -d www.hoatdongrenluyen.io.vn
```

- [ ] Nhập email
- [ ] Chọn Yes (agree terms)
- [ ] Chọn Yes (redirect HTTP → HTTPS)
- [ ] Certificate tạo thành công

Test HTTPS:
```bash
curl -I https://hoatdongrenluyen.io.vn
```

- [ ] Response: `HTTP/2 200`

---

## ☐ BƯỚC 6: SETUP CI/CD (5 phút)

GitHub → Settings → Secrets → Actions → New secret

Add 2 secrets:

- [ ] `EC2_HOST` = IP của EC2
- [ ] `EC2_SSH_KEY` = Nội dung file `.pem`

Test workflow:

```bash
# Trên máy local
git add .
git commit -m "test deploy"
git push origin main
```

- [ ] GitHub Actions chạy thành công (xem tab Actions)

---

## ☐ KIỂM TRA CUỐI CÙNG

Mở browser:

- [ ] `https://hoatdongrenluyen.io.vn` load được
- [ ] Có icon khóa xanh (SSL valid)
- [ ] Login/logout hoạt động
- [ ] API response đúng

Trên EC2:

```bash
docker compose -f docker-compose.production.yml ps
```

- [ ] Tất cả containers đều "Up"
- [ ] Không có lỗi trong logs

```bash
docker compose -f docker-compose.production.yml logs --tail=50
```

---

## ✅ HOÀN THÀNH!

Website đã online tại: **https://hoatdongrenluyen.io.vn**

### Lệnh thường dùng:

```bash
# Xem logs
docker compose -f docker-compose.production.yml logs -f

# Restart
docker compose -f docker-compose.production.yml restart

# Update code (hoặc đợi GitHub Actions tự động)
git pull && docker compose -f docker-compose.production.yml up -d --build

# Backup database
docker compose -f docker-compose.production.yml exec db pg_dump -U admin Web_QuanLyDiemRenLuyen > backup.sql
```

---

**Tổng thời gian: ~30 phút**
