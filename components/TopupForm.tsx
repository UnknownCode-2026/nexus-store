'use client'

import { useState } from 'react'
import Swal from 'sweetalert2'
import { createClient } from '@/lib/supabase/client'

export default function TopupForm() {
  const [link, setLink] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^https:\/\/gift\.truemoney\.com\/campaign\/\?v=/i.test(link.trim())) {
      await Swal.fire({ title: 'ลิงก์ไม่ถูกต้อง', text: 'กรุณาวางลิงก์ซองอั่งเปา TrueMoney ที่ถูกต้อง', icon: 'warning', confirmButtonColor: '#2563eb' })
      return
    }

    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      const r = await Swal.fire({ title: 'กรุณาเข้าสู่ระบบ', text: 'ต้องเข้าสู่ระบบก่อนเติมเงิน', icon: 'info', showCancelButton: true, confirmButtonText: 'เข้าสู่ระบบ', cancelButtonText: 'ยกเลิก', confirmButtonColor: '#2563eb' })
      if (r.isConfirmed) window.location.href = '/login?next=/topup'
      return
    }

    Swal.fire({
      title: 'กำลังตรวจสอบซอง...',
      text: 'กรุณารอสักครู่',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    })

    try {
      const res = await fetch('/api/topup', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ voucherUrl: link.trim() }),
      })
      const payload = await res.json()
      if (!res.ok) throw new Error(payload.message || 'ระบบเติมเงินยังไม่พร้อมใช้งาน')
      await Swal.fire({ title: 'เติมเงินสำเร็จ', text: `เพิ่มเครดิต ${payload.amount} บาท`, icon: 'success', confirmButtonColor: '#2563eb' })
      setLink('')
      window.location.reload()
    } catch (err) {
      await Swal.fire({
        title: 'ระบบเติมเงิน V1',
        text: err instanceof Error ? err.message : 'ยังไม่ได้ตั้งค่า Autozy API',
        icon: 'info',
        confirmButtonColor: '#2563eb',
      })
    }
  }

  return (
    <form className="topup-form" onSubmit={submit}>
      <label>ลิงก์ซองอั่งเปา TrueMoney Wallet</label>
      <div className="input-with-button">
        <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://gift.truemoney.com/campaign/?v=..." required />
        <button className="btn btn-primary">เติมเงิน</button>
      </div>
      <p>ระบบเตรียม endpoint สำหรับเชื่อม Autozy ไว้แล้ว โดย API Key จะเก็บเฉพาะฝั่ง Server</p>
    </form>
  )
}
