'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { money } from '@/lib/utils'
import type { Profile, SiteSettings } from '@/lib/types'
import Swal from 'sweetalert2'

export default function Header() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [open, setOpen] = useState(false)
  const [mobile, setMobile] = useState(false)
  const wrapper = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createClient()

    async function load() {
      const [{ data: settingData }, { data: userData }] = await Promise.all([
        supabase.from('site_settings').select('*').eq('id', 1).maybeSingle(),
        supabase.auth.getUser(),
      ])
      setSettings(settingData as SiteSettings | null)
      const user = userData.user
      if (user) {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        setProfile(data as Profile | null)
      } else {
        setProfile(null)
      }
    }

    load()
    const { data: listener } = supabase.auth.onAuthStateChange(() => load())

    function clickOutside(e: MouseEvent) {
      if (wrapper.current && !wrapper.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', clickOutside)

    return () => {
      listener.subscription.unsubscribe()
      document.removeEventListener('mousedown', clickOutside)
    }
  }, [])

  async function logout() {
    const result = await Swal.fire({
      title: 'ออกจากระบบ?',
      text: 'คุณต้องการออกจากบัญชี Nexus Store ใช่หรือไม่',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'ออกจากระบบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#2563eb',
    })
    if (!result.isConfirmed) return

    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    setOpen(false)
    window.location.href = '/'
  }

  const contact = settings?.contact_url || '#'

  return (
    <header className="navbar-shell">
      <div className="container navbar">
        <Link href="/" className="brand">
          <span className="brand-mark">N</span>
          <span>
            <strong>{settings?.website_name || 'Nexus Store'}</strong>
            <small>GAME ITEM STORE</small>
          </span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobile(!mobile)} aria-label="เปิดเมนู">
          {mobile ? '✕' : '☰'}
        </button>

        <nav className={mobile ? 'nav-links is-open' : 'nav-links'}>
          <Link href="/" onClick={() => setMobile(false)}>หน้าแรก</Link>
          <Link href="/categories" onClick={() => setMobile(false)}>หมวดหมู่</Link>
          <Link href="/topup" onClick={() => setMobile(false)}>เติมเงิน</Link>
          <a href={contact} target={contact === '#' ? undefined : '_blank'} rel="noreferrer">ติดต่อเรา</a>
        </nav>

        <div className="nav-account" ref={wrapper}>
          {!profile ? (
            <div className="auth-buttons">
              <Link href="/login" className="btn btn-ghost">เข้าสู่ระบบ</Link>
              <Link href="/register" className="btn btn-primary">สมัครสมาชิก</Link>
            </div>
          ) : (
            <>
              <button className="avatar-button" onClick={() => setOpen(!open)}>
                {profile.avatar_url ? <img src={profile.avatar_url} alt="" /> : <span>{(profile.display_name || 'N')[0].toUpperCase()}</span>}
              </button>
              {open && (
                <div className="account-dropdown">
                  <div className="account-head">
                    <strong>{profile.display_name || 'สมาชิก Nexus'}</strong>
                    <small>{profile.email}</small>
                  </div>
                  <div className="credit-box">
                    <span>เครดิตคงเหลือ</span>
                    <strong>{money(profile.credit)}</strong>
                  </div>
                  <Link href="/history" onClick={() => setOpen(false)}>ประวัติการซื้อ</Link>
                  {profile.role === 'admin' && <Link href="/admin" onClick={() => setOpen(false)}>ระบบหลังบ้าน</Link>}
                  <button onClick={logout}>ออกจากระบบ</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  )
}
