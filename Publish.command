#!/usr/bin/env bash
# =====================================================
#  Cenix FoodStation — Publish (AN TOÀN)
#  Chỉ đẩy CODE lên GitHub. GitHub Actions tự build + deploy /yum.
#  KHÔNG build, KHÔNG SFTP trực tiếp từ máy → không thể ghi đè/xóa
#  bài viết tạo từ CMS (vì Actions luôn build từ repo đầy đủ).
# =====================================================
cd "$(dirname "$0")" || exit 1

echo ""
echo "🍜 Cenix FoodStation — Publish code"
echo ""

if ! command -v git >/dev/null 2>&1 || [ ! -d .git ]; then
  echo "❌ Đây không phải git repo."; read -p "Enter để đóng..."; exit 1
fi

# Dọn lock cũ nếu có
rm -f .git/*.lock .git/refs/heads/*.lock 2>/dev/null || true
git config pull.rebase false 2>/dev/null || true

# 1) Lưu thay đổi code dưới máy
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 Lưu thay đổi..."
  git add -A
  git -c user.email="cenix@imcenix.com" -c user.name="Cenix" \
      commit -m "publish $(date '+%Y-%m-%d %H:%M:%S')"
else
  echo "✓ Không có thay đổi mới dưới máy."
fi

# 2) Kéo nội dung mới nhất từ GitHub (gồm bài tạo bằng CMS)
echo "⬇️  Đồng bộ từ GitHub..."
if ! git pull --no-rebase --no-edit; then
  echo ""
  echo "❌ git pull bị xung đột. Dữ liệu vẫn AN TOÀN (chưa deploy gì)."
  echo "   Mở Terminal xử lý xung đột rồi chạy lại."
  read -p "Enter để đóng..."; exit 1
fi

# 3) Đẩy lên GitHub → Actions tự build + deploy
echo "⬆️  Đẩy lên GitHub..."
if ! git push; then
  echo "❌ git push lỗi (xem ở trên)."; read -p "Enter để đóng..."; exit 1
fi

echo ""
echo "✅ Đã đẩy code lên GitHub. GitHub Actions đang tự build + deploy yum.imcenix.com."
echo "   Theo dõi tiến trình: https://github.com/imcenix/cenix-foodstation/actions"
echo "   Khi job xanh ✓ (~1–2 phút) → mở yum.imcenix.com hard refresh."
echo ""
read -p "Press Enter to close this window..."
