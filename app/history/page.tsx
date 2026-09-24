import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import HistoryList from '@/components/HistoryList'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) redirect('/login?next=/history')

  const { data } = await supabase
    .from('orders')
    .select('id, order_no, total, status, created_at, order_items(id, product_name, price, delivered_value)')
    .order('created_at', { ascending: false })

  return (
    <section className="container page-section">
      <div className="page-heading"><span className="eyebrow">ORDER HISTORY</span><h1>ประวัติการซื้อ</h1><p>รายการสินค้าที่คุณซื้อและข้อมูลไอเทมที่ได้รับ</p></div>
      <HistoryList orders={(data || []) as never[]} />
    </section>
  )
}
