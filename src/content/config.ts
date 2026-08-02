import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const orderSchema = z
  .union([z.number(), z.string()])
  .nullable()
  .optional()
  .transform((value) => {
    if (value === null || value === undefined || value === '') return null;
    const order = Number(value);
    return Number.isFinite(order) ? order : null;
  });

/**
 * Content collection — 3 loại bài viết
 * ──────────────────────────────────────────────────────────────────
 * Mỗi bài là 1 folder dưới `assets/restaurants/<folder-name>/`:
 *   - restaurant.md    frontmatter + nội dung markdown
 *   - cover.jpg        ảnh bìa (bắt buộc)
 *   - photos/          ảnh phụ trong popup (tuỳ chọn)
 *
 * TYPE — 3 loại:
 *   restaurant  Quán ăn thường: có sao, địa chỉ, giá, danh mục phụ
 *   cook        Cenix Can Cook: không sao, không địa chỉ, dạng blog
 *   collect     Sưu tầm: thumbnail + title + note + link reels FB/IG
 *
 * CATEGORY — tab hiển thị trên nav:
 *   breakfast | drinks | snack | dalat | cook | collect
 *   (type=cook tự động map về cook, type=collect → collect)
 *
 * ORDERING — order nhỏ hơn lên trước; nếu bằng nhau thì theo tên folder
 *
 * FEATURED FLAGS:
 *   favorite         "Tôi hay ăn nhất" trong tab category của bài
 *   explore_featured Xuất hiện ở row "Tui hay ăn nhất" ngoài tab Khám phá
 */
const restaurants = defineCollection({
  loader: glob({
    pattern: ['*/restaurant.md', '!_*/restaurant.md'],
    base: './assets/restaurants',
    generateId: ({ entry }) => entry.split('/')[0],
  }),
  schema: z.object({
    // ── Bắt buộc ───────────────────────────────────────────────
    name:     z.string(),
    slug:     z.string(),
    type:     z.enum(['restaurant', 'cook', 'collect']).default('restaurant'),

    // ── Category (tab nav) ──────────────────────────────────────
    // Với type=cook và type=collect thì category tự động là 'cook'/'collect'
    // Với type=restaurant, chọn 1 trong: breakfast | dinner | drinks | snack | dalat
    category: z.enum(['breakfast', 'dinner', 'drinks', 'snack', 'dalat', 'cook', 'collect'])
               .optional(),

    // ── Featured flags ──────────────────────────────────────────
    // Xuất hiện ở row 1 "Tui hay ăn nhất" ngoài tab Khám phá
    explore_featured: z.boolean().default(false),
    // "Tôi hay ăn nhất" trong tab category của bài
    favorite:         z.boolean().default(false),

    // ── Thứ tự hiển thị ─────────────────────────────────────────
    // Số nhỏ hơn lên trước (1, 2, 3...). Để trống = xếp sau cùng.
    order: orderSchema,

    // ── Chỉ dùng cho type=restaurant ───────────────────────────
    neighborhood:     z.string().nullable().optional(),
    address:          z.string().nullable().optional(),
    maps_url:         z.string().nullable().optional(),
    cuisine:          z.string().nullable().optional(),
    rating:           z.number().min(1).max(5).optional(),
    price_range:      z.string().nullable().optional(),
    parking_car:      z.boolean().default(false),
    signature_dishes: z.array(z.string()).default([]),

    // ── Ảnh phụ ─────────────────────────────────────────────────
    // cover.jpg luôn là ảnh bìa (không cần khai báo)
    // Với type=restaurant: ảnh gallery trong popup
    // Với type=cook: ảnh minh hoạ trong bài blog
    photos: z.array(z.string()).default([]),

    // ── Chỉ dùng cho type=collect ──────────────────────────────
    // Link reels Facebook hoặc Instagram
    social_url: z.string().nullable().optional(),

    // ── Metadata chung ──────────────────────────────────────────
    tagline:  z.string().nullable().optional(),
    featured: z.boolean().default(false), // legacy — dùng explore_featured thay thế
  }),
});

export const collections = {
  restaurants,
};
