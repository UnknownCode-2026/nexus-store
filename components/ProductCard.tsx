import Link from 'next/link'
import type { Product } from '@/lib/types'
import { money } from '@/lib/utils'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="product-card">
      <div className="product-thumb">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <div className="thumb-fallback">NEXUS</div>}
        {product.is_featured && <span className="badge">แนะนำ</span>}
      </div>
      <div className="product-body">
        <h3>{product.name}</h3>
        <p>{product.description || 'สินค้าเกมจาก Nexus Store'}</p>
        <div className="price-row">
          <strong>{money(product.price)}</strong>
          {product.old_price && Number(product.old_price) > Number(product.price) && <del>{money(product.old_price)}</del>}
        </div>
      </div>
    </Link>
  )
}
