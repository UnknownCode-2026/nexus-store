# Nexus Store V1

Nexus Store คือเว็บไซต์ขายไอเทมเกมแบบ Full-Stack ที่ออกแบบสำหรับ **Vercel + Supabase** โดยตรง.

## V1

- White Theme + Responsive Mobile
- Supabase Auth: Register / Login / Logout
- User / Admin roles
- Slider 1300×400
- หมวดหมู่และสินค้าแนะนำ
- Product + Stock
- ซื้อสินค้าด้วยเครดิตแบบ atomic RPC
- ประวัติการซื้อและแสดง Stock ที่ได้รับ
- หน้าเติมเงิน TrueMoney (เตรียม server endpoint สำหรับ Autozy)
- Admin Dashboard
- จัดการสินค้า / Stock / หมวดหมู่ / Slider / สมาชิก / เครดิต / Role / Orders / Settings
- SweetAlert2 สำหรับ popup
- PostgreSQL + RLS + Supabase Storage

## Environment variables

คัดลอก `.env.example` เป็น `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
AUTOZY_API_KEY=
AUTOZY_PHONE=
```

ห้ามนำ secret/service-role key ไปไว้ในตัวแปร `NEXT_PUBLIC_*`

## Development

```bash
npm install
npm run dev
```

## Supabase

Production Supabase project ของ Nexus Store ถูกสร้างและลง schema V1 แล้ว

ตารางหลัก: profiles, site_settings, sliders, categories, products, product_stock, orders, order_items, topups, credit_transactions.

Storage buckets: avatars, products, categories, sliders, branding.

### ตั้ง Admin คนแรก

สมัครสมาชิกผ่านหน้าเว็บก่อน จากนั้นเปลี่ยน role ของบัญชีที่ต้องการใน Supabase SQL Editor:

```sql
update public.profiles set role = 'admin' where email = 'YOUR_EMAIL';
```

หลังจากมี Admin คนแรกแล้ว สามารถปรับ Role สมาชิกจาก Admin Dashboard ได้

## TrueMoney / Autozy

V1 มี UI และ server endpoint `/api/topup` แล้ว แต่ยังไม่รับเงินจริงจนกว่าจะตั้ง `AUTOZY_API_KEY`, `AUTOZY_PHONE` และเปิด provider adapter ตาม API ปัจจุบันของ Autozy.

API credentials ต้องอยู่บน Vercel Environment Variables เท่านั้น ไม่ควรส่งไปยัง Browser.

## Deployment

Repository นี้ออกแบบสำหรับการเชื่อม GitHub → Vercel โดย branch `main` เป็น production.
