import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminPanel from '@/components/AdminPanel'
import type { Category, Product, Profile, SiteSettings, Slider, Stock } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login?next=/admin')

  const { data: me } = await supabase.from('profiles').select('*').eq('id', userData.user.id).maybeSingle()
  if (!me || me.role !== 'admin') redirect('/')

  const [settingsRes, categoriesRes, productsRes, slidersRes, stockRes, usersRes, ordersRes] = await Promise.all([
    supabase.from('site_settings').select('*').eq('id', 1).single(),
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('products').select('*').order('created_at', { ascending: false }),
    supabase.from('sliders').select('*').order('sort_order'),
    supabase.from('product_stock').select('*').order('created_at', { ascending: false }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('orders').select('id, order_no, total, status, created_at, profiles(display_name,email)').order('created_at', { ascending: false }).limit(100),
  ])

  return (
    <AdminPanel
      settings={settingsRes.data as SiteSettings}
      categories={(categoriesRes.data || []) as Category[]}
      products={(productsRes.data || []) as Product[]}
      sliders={(slidersRes.data || []) as Slider[]}
      stock={(stockRes.data || []) as Stock[]}
      users={(usersRes.data || []) as Profile[]}
      orders={(ordersRes.data || []) as never[]}
    />
  )
}
