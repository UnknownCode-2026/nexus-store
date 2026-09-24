'use client'

import Swal from 'sweetalert2'
import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/utils'

export default function BuyButton({ productId, name, price }: { productId: string; name: string; price: number | string }) {
  async function buy() {
    const supabase = createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) {
      const r = await Swal.fire({
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'เข้าสู่ระบบก่อนซื้อสินค้า',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'เข้าสู่ระบบ',
        cancelButtonText: 'ยกเลิก',
        confirmButtonColor: '#2563eb',
      })
      if (r.isConfirmed) window.location.href = `/login?next=${encodeURIComponent(location.pathname)}`
      return
    }

    const confirm = await Swal.fire({
      title: 'ยืนยันการซื้อ',
      html: `<b>${name}</b><br><span style="color:#64748b">ราคา ${money(price)}</span>`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ยืนยันซื้อ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const { data, error } = await supabase.rpc('purchase_product', { p_product_id: productId })
        if (error) throw error
        return data
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).catch(() => null)

    if (!confirm?.isConfirmed) return

    const data = confirm.value as { order_no: string; stock_value: string; balance: number; product_name: string }
    await Swal.fire({
      title: 'ซื้อสินค้าสำเร็จ 🎉',
      html: `
        <div style="text-align:left;background:#f8fafc;border-radius:14px;padding:16px">
          <div style="color:#64748b;font-size:13px">เลขคำสั่งซื้อ</div>
          <b>${data.order_no}</b>
          <div style="margin-top:14px;color:#64748b;font-size:13px">สินค้าที่ได้รับ</div>
          <div style="word-break:break-all;background:white;border:1px solid #e2e8f0;padding:12px;border-radius:10px;margin-top:5px">${data.stock_value}</div>
          <div style="margin-top:14px;color:#64748b;font-size:13px">เครดิตคงเหลือ</div>
          <b>${money(data.balance)}</b>
        </div>`,
      icon: 'success',
      confirmButtonText: 'ดูประวัติการซื้อ',
      confirmButtonColor: '#2563eb',
    })
    window.location.href = '/history'
  }

  return <button className="btn btn-primary btn-large" onClick={buy}>ซื้อสินค้าตอนนี้</button>
}
