import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Category } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').eq('is_active', true).order('sort_order')
  const categories = (data || []) as Category[]

  return (
    <section className="container page-section">
      <div className="page-heading"><span className="eyebrow">ALL CATEGORY</span><h1>หมวดหมู่ทั้งหมด</h1><p>เลือกหมวดหมู่เพื่อค้นหาสินค้าที่คุณต้องการ</p></div>
      <div className="category-grid category-grid-large">
        {categories.map((category) => (
          <Link className="category-card" href={`/category/${category.slug}`} key={category.id}>
            <div className="category-icon">{category.image_url ? <img src={category.image_url} alt="" /> : <span>{category.name.slice(0, 1)}</span>}</div>
            <div><h3>{category.name}</h3><p>{category.description || 'ดูสินค้าทั้งหมด'}</p></div><span className="arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
