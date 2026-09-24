import AuthForm from '@/components/AuthForm'

export default function RegisterPage() {
  return (
    <section className="auth-page">
      <div className="auth-card">
        <div className="brand-mark auth-logo">N</div>
        <span className="eyebrow">CREATE ACCOUNT</span>
        <h1>สมัครสมาชิก Nexus Store</h1>
        <p>สร้างบัญชีฟรี เพื่อเริ่มซื้อไอเทมเกมจาก Nexus Store</p>
        <AuthForm mode="register" />
      </div>
    </section>
  )
}
