#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and fill SFTP credentials first."
  exit 1
fi

set -a
source .env
set +a

required_vars=(SFTP_HOST SFTP_PORT SFTP_USER SFTP_PASSWORD SFTP_REMOTE_PATH SITE_DOMAIN)
for var_name in "${required_vars[@]}"; do
  if [ -z "${!var_name:-}" ] || [ "${!var_name}" = "REPLACE_ME" ]; then
    echo "Missing or invalid $var_name in .env"
    exit 1
  fi
done

PROJECT_SLUG="${PROJECT_SLUG:-yum}"

if ! command -v lftp >/dev/null 2>&1; then
  echo "lftp is required. Install it with: brew install lftp"
  exit 1
fi

# ── Đồng bộ với GitHub trước khi build ────────────────────────────────
# CMS lưu bài thẳng lên GitHub, KHÔNG xuống máy. Nếu build từ source cũ rồi
# deploy --delete sẽ XÓA mất bài tạo bằng CMS. Vì vậy luôn pull về trước.
if command -v git >/dev/null 2>&1 && [ -d .git ]; then
  rm -f .git/*.lock .git/refs/heads/*.lock 2>/dev/null || true
  if [ -n "$(git status --porcelain)" ]; then
    echo "📝 Lưu thay đổi local trước khi đồng bộ..."
    git add -A
    git -c user.email="cenix@imcenix.com" -c user.name="Cenix" commit -m "publish $(date '+%Y-%m-%d %H:%M:%S')" >/dev/null 2>&1 || true
  fi
  echo "⬇️  Kéo nội dung mới nhất từ GitHub (gồm bài tạo bằng CMS)..."
  git config pull.rebase false 2>/dev/null || true
  if ! git pull --no-rebase --no-edit; then
    echo "❌ git pull lỗi (có thể xung đột). Dừng để tránh xóa nhầm bài. Xử lý git xong rồi chạy lại."
    read -p "Press Enter to close..."; exit 1
  fi
fi

echo "Building Cenix FoodStation..."
npm run build

ROOT_DIR="${SFTP_REMOTE_PATH%/}"
YUM_DIR="$ROOT_DIR/$PROJECT_SLUG"

echo "Deploying dist/ -> $YUM_DIR (folder tự chứa cho $SITE_DOMAIN)..."
set +e
lftp -u "$SFTP_USER","$SFTP_PASSWORD" -p "$SFTP_PORT" "sftp://$SFTP_HOST" <<LFTP
set cmd:fail-exit no
set sftp:auto-confirm yes
set net:max-retries 2
set net:timeout 20
# FoodStation -> /$PROJECT_SLUG : toàn bộ dist (index.html, _astro, images, restaurants)
# gói gọn trong 1 folder, KHÔNG chia chung với imcenix.com nữa.
mkdir -p "$YUM_DIR"
mirror --reverse --verbose --delete --parallel=4 \
  --exclude-glob .DS_Store \
  --exclude-glob *.log \
  dist/ "$YUM_DIR"
chmod -R 755 "$YUM_DIR"
bye
LFTP
set -e

echo "Done: https://$SITE_DOMAIN"
echo "Lưu ý: router .htaccess ở docroot do Cenix Profile V1 (deploy.sh) quản lý."
