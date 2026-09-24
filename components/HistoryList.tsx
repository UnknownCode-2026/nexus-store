'use client'

import Swal from 'sweetalert2'
import { dateTime, money } from '@/lib/utils'

type Item = { id: string; product_name: string; price: number | string; delivered_value: string | null }
type Order = { id: string; order_no: string; total: number | string; status: string; created_at: string; order_items: Item[] }

export default function HistoryList({ orders }: { orders: Order[] }) {
  async function show(order: Order) {
    const values = order.order_items.map((x) => x.delivered_value).filter(Boolean)
    const html = values.length
      ? values.map((v) => `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px;margin:8px 0;word-break:break-all">${v}</div>`).join('')
      : '<p>ไม่มีข้อมูลไอเทม</p>'
    await Swal.fire({ title: order.order_no, html, icon: 'success', confirmButtonText: 'ปิด', confirmButtonColor: '#2563eb' })
  }

  if (!orders.length) return <div className="empty-state">ยังไม่มีประวัติการซื้อสินค้า</div>

  return (
    <div className="history-list">
      {orders.map((order) => (
        <article className="history-card" key={order.id}>
          <div>
            <span className="order-no">{order.order_no}</span>
            <h3>{order.order_items[0]?.product_name || 'คำสั่งซื้อ'}</h3>
            <p>{dateTime(order.created_at)}</p>
          </div>
          <div className="history-actions">
            <strong>{money(order.total)}</strong>
            <span className="status-success">สำเร็จ</span>
            <button className="btn btn-ghost" onClick={() => show(order)}>ดูสินค้า</button>
          </div>
        </article>
      ))}
    </div>
  )
}
