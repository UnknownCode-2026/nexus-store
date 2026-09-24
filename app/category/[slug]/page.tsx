import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/ProductCard'
import type { Category, Product } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: categoryData } = await supabase.from('categories').select('*').eq('slug', slug).eq('is_active', true).maybeSingle()
  if (!categoryData) notFound()
  const category = categoryData as Category
  const { data } = await supabase.from('products').select('*').eq('category_id', category.id).eq('is_active', true).order('created_at', { ascending: false })
  const products = (data || []) as Product[]

  return (
    <section className="container page-section">
      <div className="page-heading"><span className="eyebrow">CATEGORY</span><h1>{category.name}</h1><p>{category.description}</p></div>
      {products.length ? <div className="product-grid">{products.map((p) => <ProductCard product={p} key={p.id} />)}</div> : <div className="empty-state">ยังไม่มีสินค้าในหมวดหมู่นี้</div>}
    </section>
  )
}
