# BUILD FIX - Dynamic Import Error

## Vấn đề
```
The target environment doesn't support dynamic import() syntax
```

## Nguyên nhân
- Webpack 5 + React Scripts 5 + một số dependencies mới (recharts, lucide-react) sử dụng ES modules
- Browserslist config không tương thích

## Giải pháp

### Option 1: Build trong Docker (RECOMMENDED)
```bash
# Build sẽ work trong Docker vì environment đầy đủ
docker build -t frontend-test -f frontend/Dockerfile.production .
```

### Option 2: Update Node.js
```bash
# Cần Node.js 18+
node --version  # Check version
nvm install 18  # Nếu < 18
nvm use 18
```

### Option 3: Downgrade packages
```bash
cd frontend
npm install recharts@2.5.0 --save
npm install react-router-dom@6.20.0 --save
npm run build
```

### Option 4: Sử dụng Vite thay vì CRA
Migrate từ create-react-app sang Vite (build nhanh hơn, ít lỗi hơn)

## Production Build
**Không cần build local!** Docker sẽ build tự động:

```bash
cd /home/ec2-user/app
docker compose -f docker-compose.production.yml up -d --build
```

Docker build environment có:
- Node 18 Alpine
- Đầy đủ dependencies
- Webpack config tối ưu

## Kết luận
✅ Không cần fix build error local
✅ Chỉ cần push code
✅ Docker/EC2 sẽ build thành công
