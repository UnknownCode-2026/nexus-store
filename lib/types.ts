export type Profile = {
  id: string
  email: string | null
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  credit: number | string
  total_topup: number | string
  created_at: string
}

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  sort_order: number
}

export type Product = {
  id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  price: number | string
  old_price: number | string | null
  image_url: string | null
  is_featured: boolean
  is_active: boolean
  created_at?: string
}

export type Slider = {
  id: number
  title: string | null
  image_url: string
  link_url: string | null
  sort_order: number
  is_active: boolean
}

export type SiteSettings = {
  id: number
  website_name: string
  browser_title: string
  contact_url: string | null
  truemoney_phone: string | null
  logo_url: string | null
  favicon_url: string | null
}

export type Stock = {
  id: number
  product_id: string
  stock_value: string
  status: 'available' | 'reserved' | 'sold'
  order_id: string | null
  sold_at: string | null
  created_at: string
}
