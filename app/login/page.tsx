import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="brand-mark auth-logo">N</div>
        <span className="eyebrow">WELCOME BACK</span>
        <h1>เข้าสู่ระบบ Nexus Store</h1>
        <p>เข้าสู่ระบบเพื่อซื้อสินค้า เติมเครดิต และดูประวัติของคุณ</p>
        <AuthForm mode="login" />
      </div>
    </section>
  )
}
