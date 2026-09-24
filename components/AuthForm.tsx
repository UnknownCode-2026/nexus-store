'use client'

import { useState } from 'react'
import Link from 'next/link'
import Swal from 'sweetalert2'
import { createClient } from '@/lib/supabase/client'

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') || '').trim()
    const password = String(form.get('password') || '')
    const displayName = String(form.get('display_name') || '').trim()
    const supabase = createClient()

    try {
      if (mode === 'register') {
        if (password.length < 6) throw new Error('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        })
        if (error) throw error

        await Swal.fire({
          title: 'สมัครสมาชิกสำเร็จ',
          text: data.session ? 'บัญชีพร้อมใช้งานแล้ว' : 'กรุณาตรวจสอบอีเมลเพื่อยืนยันบัญชีก่อนเข้าสู่ระบบ',
          icon: 'success',
          confirmButtonColor: '#2563eb',
        })
        window.location.href = data.session ? '/' : '/login'
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        await Swal.fire({
          title: 'เข้าสู่ระบบสำเร็จ',
          text: 'ยินดีต้อนรับกลับสู่ Nexus Store',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false,
        })
        const params = new URLSearchParams(window.location.search)
        window.location.href = params.get('next') || '/'
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่'
      await Swal.fire({ title: 'ไม่สำเร็จ', text: message, icon: 'error', confirmButtonColor: '#2563eb' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {mode === 'register' && (
        <label>
          ชื่อที่แสดง
          <input name="display_name" type="text" placeholder="ชื่อของคุณ" required maxLength={60} />
        </label>
      )}
      <label>
        อีเมล
        <input name="email" type="email" placeholder="you@example.com" required autoComplete="email" />
      </label>
      <label>
        รหัสผ่าน
        <input name="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" required minLength={6} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
      </label>
      <button className="btn btn-primary btn-large full" disabled={loading}>
        {loading ? 'กำลังดำเนินการ...' : mode === 'login' ? 'เข้าสู่ระบบ' : 'สร้างบัญชี'}
      </button>
      <p className="auth-switch">
        {mode === 'login' ? <>ยังไม่มีบัญชี? <Link href="/register">สมัครสมาชิก</Link></> : <>มีบัญชีแล้ว? <Link href="/login">เข้าสู่ระบบ</Link></>}
      </p>
    </form>
  )
}
