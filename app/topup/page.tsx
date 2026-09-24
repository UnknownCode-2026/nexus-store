import TopupForm from '@/components/TopupForm'

export default function TopupPage() {
  return (
    <section className="container page-section narrow">
      <div className="page-heading"><span className="eyebrow">TOP UP</span><h1>เติมเครดิต</h1><p>รองรับซองอั่งเปา TrueMoney Wallet — โครงสร้าง V1 พร้อมสำหรับเชื่อม Autozy API</p></div>
      <div className="topup-card">
        <div className="wallet-logo">฿</div>
        <h2>TrueMoney Wallet</h2>
        <p>สร้างซองอั่งเปาและนำลิงก์มาวางด้านล่าง</p>
        <TopupForm />
      </div>
    </section>
  )
}
