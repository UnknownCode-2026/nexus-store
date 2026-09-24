import Link from 'next/link'

export default function NotFound() {
  return <section className="not-found"><div className="brand-mark auth-logo">N</div><h1>404</h1><p>ไม่พบหน้าที่คุณกำลังค้นหา</p><Link href="/" className="btn btn-primary">กลับหน้าแรก</Link></section>
}
