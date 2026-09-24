export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <strong>Nexus Store</strong>
          <p>ร้านขายไอเทมเกมออนไลน์ ใช้งานง่าย ปลอดภัย และรองรับมือถือ</p>
        </div>
        <span>© {new Date().getFullYear()} Nexus Store. All rights reserved.</span>
      </div>
    </footer>
  )
}
