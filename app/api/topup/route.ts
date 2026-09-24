import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return NextResponse.json({ message: 'กรุณาเข้าสู่ระบบ' }, { status: 401 })

  const body = await request.json().catch(() => null) as { voucherUrl?: string } | null
  const voucherUrl = body?.voucherUrl?.trim() || ''
  if (!/^https:\/\/gift\.truemoney\.com\/campaign\/\?v=/i.test(voucherUrl)) {
    return NextResponse.json({ message: 'ลิงก์ซองอั่งเปาไม่ถูกต้อง' }, { status: 400 })
  }

  if (!process.env.AUTOZY_API_KEY || !process.env.AUTOZY_PHONE) {
    return NextResponse.json({
      message: 'หน้าเติมเงินพร้อมแล้ว แต่ยังไม่ได้ตั้งค่า AUTOZY_API_KEY และ AUTOZY_PHONE บน Vercel',
      code: 'AUTOZY_NOT_CONFIGURED',
    }, { status: 501 })
  }

  // V1 intentionally stops here until the merchant API credentials are configured.
  // Integrate the current Autozy TrueWallet endpoint server-side only.
  return NextResponse.json({
    message: 'Autozy credentials detected. Enable the provider adapter before accepting real payments.',
    code: 'PROVIDER_ADAPTER_PENDING',
  }, { status: 501 })
}
