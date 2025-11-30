#!/bin/bash

###############################################################################
# Resolve Git Conflict Script
# Xử lý conflict khi pull code trên EC2
###############################################################################

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Resolving Git Conflict...${NC}"
echo ""

# Check if there are local changes
if [ -z "$(git status -s)" ]; then
    echo -e "${GREEN}✅ Không có thay đổi local${NC}"
    git pull origin main
    exit 0
fi

echo -e "${BLUE}[1] Kiểm tra thay đổi local...${NC}"
git status -s

echo ""
echo -e "${BLUE}[2] Xem diff của docker-compose.prod.yml...${NC}"
if [ -f "docker-compose.prod.yml" ]; then
    git diff docker-compose.prod.yml || echo "Không có diff"
fi

echo ""
echo -e "${YELLOW}Chọn cách xử lý:${NC}"
echo "  1. Commit thay đổi local trước (recommended nếu thay đổi quan trọng)"
echo "  2. Stash thay đổi local (recommended nếu chỉ test tạm)"
echo "  3. Discard thay đổi local (xóa thay đổi)"
echo ""
read -p "Chọn (1/2/3) [2]: " choice
choice=${choice:-2}

case $choice in
    1)
        echo -e "${BLUE}[3] Committing local changes...${NC}"
        git add docker-compose.prod.yml
        git commit -m "chore: local docker-compose healthcheck adjustments before pull"
        echo -e "${BLUE}[4] Pulling from remote...${NC}"
        git pull origin main
        if [ $? -ne 0 ]; then
            echo -e "${RED}❌ Có merge conflict! Cần giải quyết thủ công:${NC}"
            echo "  git status"
            echo "  # Sửa conflict trong docker-compose.prod.yml"
            echo "  git add docker-compose.prod.yml"
            echo "  git commit"
        else
            echo -e "${GREEN}✅ Pull thành công!${NC}"
        fi
        ;;
    2)
        echo -e "${BLUE}[3] Stashing local changes...${NC}"
        git stash save "Local changes before pull $(date +%Y%m%d_%H%M%S)"
        echo -e "${BLUE}[4] Pulling from remote...${NC}"
        git pull origin main
        echo -e "${GREEN}✅ Pull thành công!${NC}"
        echo -e "${YELLOW}💡 Nếu cần áp dụng lại thay đổi local: git stash pop${NC}"
        echo -e "${YELLOW}💡 Nếu không cần: git stash drop${NC}"
        ;;
    3)
        echo -e "${YELLOW}⚠️  Bạn chắc chắn muốn xóa thay đổi local? (y/N)${NC}"
        read -p "> " confirm
        if [[ "$confirm" =~ ^[Yy]$ ]]; then
            echo -e "${BLUE}[3] Discarding local changes...${NC}"
            git checkout -- docker-compose.prod.yml
            echo -e "${BLUE}[4] Pulling from remote...${NC}"
            git pull origin main
            echo -e "${GREEN}✅ Pull thành công!${NC}"
        else
            echo -e "${YELLOW}Đã hủy${NC}"
            exit 0
        fi
        ;;
    *)
        echo -e "${RED}Lựa chọn không hợp lệ${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}✅ Hoàn tất!${NC}"

