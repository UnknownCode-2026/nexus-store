import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuyButton from '@/components/BuyButton'
import { money } from '@/lib/utils'
import type { Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
  if (!data) notFound()
  const product = data as Product

  return (
    <section className="container product-detail-page">
      <div className="product-detail-image">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="detail-fallback">NEXUS STORE</div>}
      </div>
      <div className="product-detail-content">
        {product.is_featured && <span className="badge static">สินค้าแนะนำ</span>}
        <h1>{product.name}</h1>
        <p className="product-description">{product.description || 'สินค้าเกมคุณภาพจาก Nexus Store'}</p>
        <div className="detail-price"><strong>{money(product.price)}</strong>{product.old_price && <del>{money(product.old_price)}</del>}</div>
        <div className="detail-note"><span>✓</span><div><b>รับสินค้าอัตโนมัติ</b><p>ระบบจะแสดงโค้ดหรือข้อมูลสินค้าทันทีหลังซื้อสำเร็จ</p></div></div>
        <BuyButton productId={product.id} name={product.name} price={product.price} />
      </div>
    </section>
  )
}
