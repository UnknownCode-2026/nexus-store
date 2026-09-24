import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Category, Product, Slider } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const supabase = await createClient()
  const [sliderRes, categoryRes, productRes, statsRes] = await Promise.all([
    supabase.from('sliders').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('categories').select('*').eq('is_active', true).eq('is_featured', true).order('sort_order'),
    supabase.from('products').select('*').eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(8),
    supabase.rpc('get_store_stats'),
  ])

  const sliders = (sliderRes.data || []) as Slider[]
  const categories = (categoryRes.data || []) as Category[]
  const products = (productRes.data || []) as Product[]
  const stats = (statsRes.data || { members: 0, available_stock: 0, sold_stock: 0 }) as { members: number; available_stock: number; sold_stock: number }

  return (
    <>
      <section className="hero-section container">
        {sliders.length ? (
          <a className="hero-banner" href={sliders[0].link_url || '#'} target={sliders[0].link_url ? '_blank' : undefined}>
            <img src={sliders[0].image_url} alt={sliders[0].title || 'Nexus Store'} />
          </a>
        ) : (
          <div className="hero-default">
            <div>
              <span className="eyebrow">NEXUS STORE • V1</span>
              <h1>ไอเทมเกมที่คุณต้องการ<br /><em>ง่าย เร็ว และทันสมัย</em></h1>
              <p>เลือกสินค้า ชำระด้วยเครดิต และรับโค้ดอัตโนมัติจากระบบได้ทันที</p>
              <div className="hero-actions">
                <Link href="/categories" className="btn btn-primary btn-large">เลือกซื้อสินค้า</Link>
                <Link href="/topup" className="btn btn-white btn-large">เติมเครดิต</Link>
              </div>
            </div>
            <div className="hero-art">
              <span className="orb orb-one" />
              <span className="orb orb-two" />
              <div className="game-card"><b>N</b><span>NEXUS<br />STORE</span></div>
            </div>
          </div>
        )}
      </section>

      <section className="container stats-grid">
        <div className="stat-card"><span>👥</span><div><strong>{Number(stats.members).toLocaleString('th-TH')}</strong><small>สมาชิกทั้งหมด</small></div></div>
        <div className="stat-card"><span>📦</span><div><strong>{Number(stats.available_stock).toLocaleString('th-TH')}</strong><small>สินค้าในสต็อก</small></div></div>
        <div className="stat-card"><span>✨</span><div><strong>{Number(stats.sold_stock).toLocaleString('th-TH')}</strong><small>จำหน่ายแล้ว</small></div></div>
      </section>

      <section className="container section-block">
        <div className="section-title">
          <div><span className="eyebrow">CATEGORY</span><h2>หมวดหมู่แนะนำ</h2></div>
          <Link href="/categories">ดูทั้งหมด →</Link>
        </div>
        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href={`/category/${category.slug}`} key={category.id}>
              <div className="category-icon">
                {category.image_url ? <img src={category.image_url} alt="" /> : <span>{category.name.slice(0, 1)}</span>}
              </div>
              <div><h3>{category.name}</h3><p>{category.description || 'ดูสินค้าในหมวดหมู่นี้'}</p></div>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="container section-block">
        <div className="section-title">
          <div><span className="eyebrow">RECOMMENDED</span><h2>สินค้าแนะนำ</h2></div>
        </div>
        {products.length ? (
          <div className="product-grid">{products.map((p) => <ProductCard product={p} key={p.id} />)}</div>
        ) : (
          <div className="empty-state">ยังไม่มีสินค้าแนะนำ — Admin สามารถเพิ่มสินค้าได้จากระบบหลังบ้าน</div>
        )}
      </section>

      <section className="container trust-strip">
        <div><span>⚡</span><b>รับสินค้าอัตโนมัติ</b><small>หลังซื้อสำเร็จ</small></div>
        <div><span>🔐</span><b>ปลอดภัยด้วย Supabase</b><small>RLS + Authentication</small></div>
        <div><span>📱</span><b>รองรับมือถือ</b><small>Responsive 100%</small></div>
      </section>
    </>
  )
}
