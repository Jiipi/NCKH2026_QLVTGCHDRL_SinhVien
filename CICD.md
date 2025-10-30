# CI/CD GITHUB ACTIONS

## Setup GitHub Secrets

GitHub → Settings → Secrets → Actions → New secret

**Cần 2 secrets:**

1. **EC2_HOST**
   - Value: IP public của EC2 (ví dụ: `13.212.123.45`)

2. **EC2_SSH_KEY**
   - Value: Nội dung file `.pem` private key
   - Copy toàn bộ từ `-----BEGIN RSA PRIVATE KEY-----` đến `-----END RSA PRIVATE KEY-----`

## Cách hoạt động

Mỗi lần `git push` lên branch `main`, workflow tự động:

1. SSH vào EC2 (user: `ec2-user`)
2. Pull code mới vào `/home/ec2-user/app`
3. Rebuild containers
4. Restart app

## Test workflow

```bash
# Thay đổi code
git add .
git commit -m "test deploy"
git push origin main

# Xem kết quả tại:
# GitHub → Actions tab
```

## Debug nếu lỗi

**Workflow failed:**
- Check secrets đã add đúng chưa
- Test SSH thủ công: `ssh -i key.pem ec2-user@[EC2_IP]`
- Xem logs workflow trên GitHub

**Containers không start:**
```bash
# SSH vào EC2
cd /home/ec2-user/app
docker compose -f docker-compose.production.yml logs
```

---

**Auto-deploy đã sẵn sàng!** Chỉ cần push code là tự động deploy.
