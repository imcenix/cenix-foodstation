# 🍜 Cenix FoodStation — Workflow

> Mac-only workflow. Site: **yum.imcenix.com**

## Setup ban đầu (làm 1 lần)

**1. Project path:**

```
~/Documents/Cenix_Projects/Cenix/Cenix x Claude/Cenix FoodStation/
```

**2. Terminal alias** — thêm vào `~/.zshrc`:

```bash
alias yum='cd "$HOME/Documents/Cenix_Projects/Cenix/Cenix x Claude/Cenix FoodStation"'
```

Reload: `source ~/.zshrc`. Từ giờ gõ `yum` là vào project.

**3. Install dependencies (lần đầu):**

```bash
yum
npm install
```

**4. Obsidian Mac vault:**

- Mở Obsidian.app → Open vault → Open folder as vault
- Chọn folder **Cenix FoodStation**

## Cấu trúc

```
Cenix FoodStation/
├─ _WORKFLOW.md           ← file này
├─ Publish.command        ← double-click để deploy (Phase 4)
├─ .env                   ← SFTP credentials
├─ assets/
│  ├─ restaurants/        ← TẠO QUÁN MỚI Ở ĐÂY
│  │  ├─ _template/       ← reference, đừng sửa
│  │  └─ 01-pho-le/
│  │     ├─ restaurant.md
│  │     ├─ cover.jpg     ← ảnh chính (4:5 ratio)
│  │     └─ photos/
│  │        ├─ 01.jpg     ← ảnh thêm cho gallery
│  │        └─ 02.jpg
│  └─ images/             ← ảnh chung (logo, hero, etc.)
└─ src/                   ← code — đừng đụng
```

## Thêm quán mới

### Bước 1 — Tạo folder cho quán

Trong Obsidian, right-click `assets/restaurants/` → **New folder** → đặt theo format:

```
XX-ten-quan      (XX = số thứ tự, ten-quan = slug không dấu)
```

Ví dụ: `03-com-tam-cali`, `04-banh-canh-cua-87`

### Bước 2 — Tạo `restaurant.md` + insert template

Vào folder vừa tạo → **New note** → tên **`restaurant`** (chỉ "restaurant", Obsidian tự thêm .md).

Mở file → Cmd+P → **"Insert template"** → chọn **"Restaurant"** (sẽ tạo ở Phase 2).

Sửa các field:
- `name` — tên hiển thị
- `slug` — URL của quán (chữ thường, gạch ngang)
- `neighborhood` — quận/khu vực
- `address` — địa chỉ đầy đủ
- `maps_url` — link Google Maps (share link)
- `cuisine` — Việt / Á / Âu / Coffee / Dessert / BBQ / Fusion
- `rating` — điểm 1.0-10.0
- `price_range` — vd: "50k-150k"
- `visited` — YYYY-MM (lần ghé gần nhất)
- `signature_dishes` — array các món đáng thử
- `tagline` — 1 dòng giới thiệu hiện trên card

### Bước 3 — Thêm ảnh

Drag-drop từ Finder vào folder quán:

- **`cover.jpg`** — ảnh chính (tỷ lệ 4:5 dọc, khoảng 800×1000px). Bắt buộc.
- **`photos/01.jpg`, `photos/02.jpg`...** — ảnh thêm cho gallery. Tùy chọn.

Sau đó update array `photos` trong frontmatter để khớp tên file.

### Bước 4 — Test local

```bash
yum
npm run dev
```

Mở `http://localhost:4321` xem quán mới đã xuất hiện trên grid.

### Bước 5 — Publish (Phase 4 — chưa setup)

Sẽ tự động hóa sau:

```bash
yum
./Publish.command
```

## Schema cuisine + neighborhood

Để filter chip gom đúng, dùng giá trị CHÍNH XÁC sau:

**Cuisine:** Việt, Á, Âu, Coffee, Dessert, BBQ, Fusion, Hàn, Nhật, Hoa, Thái

**Neighborhood:** Quận 1, Quận 3, Quận 5, Quận 7, Quận 10, Phú Nhuận, Bình Thạnh, Tân Bình, Gò Vấp, Thủ Đức, Đà Nẵng, Hà Nội

## Rating scale

- **9.5-10** 🌟🌟🌟 Tuyệt đỉnh — chắc chắn quay lại nhiều lần
- **8.5-9.4** 🌟🌟 Rất ngon — recommend cho bạn bè
- **7.5-8.4** 🌟 Ngon — đáng thử
- **6.5-7.4** OK — ăn được, có chỗ ngon hơn
- **<6.5** Không recommend

## Quay xe (Git rollback)

Sau Phase 4, mỗi `./Publish.command` sẽ tự commit snapshot. Quay về snapshot cũ:

```bash
yum
git log --oneline
git reset --hard <commit-hash>
```
