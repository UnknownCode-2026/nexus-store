'use client'

import { useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import { createClient } from '@/lib/supabase/client'
import { dateTime, money, slugify } from '@/lib/utils'
import type { Category, Product, Profile, SiteSettings, Slider, Stock } from '@/lib/types'

type Order = { id:string; order_no:string; total:number|string; status:string; created_at:string; profiles:{display_name:string|null;email:string|null}|null }
type Props = { settings:SiteSettings; categories:Category[]; products:Product[]; sliders:Slider[]; stock:Stock[]; users:Profile[]; orders:Order[] }
type Tab = 'dashboard'|'products'|'stock'|'categories'|'sliders'|'users'|'orders'|'settings'

const tabs: [Tab,string][] = [
  ['dashboard','ภาพรวม'],['products','สินค้า'],['stock','สต็อก'],['categories','หมวดหมู่'],
  ['sliders','สไลด์'],['users','สมาชิก'],['orders','คำสั่งซื้อ'],['settings','ตั้งค่า'],
]

export default function AdminPanel(p: Props) {
  const [tab,setTab] = useState<Tab>('dashboard')
  const supabase = useMemo(() => createClient(), [])
  const sales = p.orders.filter(x=>x.status==='success').reduce((n,x)=>n+Number(x.total),0)
  const available = p.stock.filter(x=>x.status==='available').length

  async function done(title:string){ await Swal.fire({title,icon:'success',timer:1000,showConfirmButton:false}); location.reload() }
  async function fail(e:unknown){ await Swal.fire({title:'เกิดข้อผิดพลาด',text:e instanceof Error?e.message:String(e),icon:'error',confirmButtonColor:'#2563eb'}) }
  async function mutate(table:string,id:string|number,values:Record<string,unknown>){
    const {error}=await supabase.from(table).update(values).eq('id',id); if(error)return fail(error); return done('อัปเดตเรียบร้อย')
  }
  async function remove(table:string,id:string|number,label:string){
    const r=await Swal.fire({title:`ลบ ${label}?`,text:'รายการนี้จะถูกลบออกจากระบบ',icon:'warning',showCancelButton:true,confirmButtonText:'ลบ',cancelButtonText:'ยกเลิก',confirmButtonColor:'#dc2626'})
    if(!r.isConfirmed)return
    const {error}=await supabase.from(table).delete().eq('id',id); if(error)return fail(error); return done('ลบเรียบร้อย')
  }

  async function addProduct(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const f=new FormData(e.currentTarget); const name=String(f.get('name')||'').trim()
    const {error}=await supabase.from('products').insert({
      name, slug:slugify(String(f.get('slug')||name)), category_id:f.get('category_id')||null,
      description:String(f.get('description')||''), price:Number(f.get('price')||0),
      old_price:f.get('old_price')?Number(f.get('old_price')):null, image_url:String(f.get('image_url')||'')||null,
      is_featured:f.get('is_featured')==='on', is_active:true,
    })
    if(error)return fail(error); done('เพิ่มสินค้าเรียบร้อย')
  }

  async function editProduct(x:Product){
    const {value}=await Swal.fire({
      title:'แก้ไขสินค้า',
      html:`<input id="pn" class="swal2-input" value="${x.name.replace(/"/g,'&quot;')}" placeholder="ชื่อสินค้า"><input id="pp" class="swal2-input" type="number" min="0" step="0.01" value="${Number(x.price)}" placeholder="ราคา"><input id="po" class="swal2-input" type="number" min="0" step="0.01" value="${x.old_price?Number(x.old_price):''}" placeholder="ราคาเดิม">`,
      showCancelButton:true,confirmButtonText:'บันทึก',cancelButtonText:'ยกเลิก',confirmButtonColor:'#2563eb',
      preConfirm:()=>{const name=(document.getElementById('pn') as HTMLInputElement).value.trim();const price=Number((document.getElementById('pp') as HTMLInputElement).value);const old=(document.getElementById('po') as HTMLInputElement).value;if(!name||Number.isNaN(price))return Swal.showValidationMessage('กรอกชื่อและราคาให้ถูกต้อง');return {name,price,old_price:old?Number(old):null}}
    })
    if(value) mutate('products',x.id,value)
  }

  async function addStock(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const f=new FormData(e.currentTarget), product_id=String(f.get('product_id')||'')
    const values=String(f.get('stock_values')||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean)
    if(!product_id||!values.length)return fail(new Error('เลือกสินค้าและใส่ Stock อย่างน้อย 1 รายการ'))
    const {error}=await supabase.from('product_stock').insert(values.map(stock_value=>({product_id,stock_value})))
    if(error)return fail(error); done(`เพิ่ม Stock ${values.length} รายการเรียบร้อย`)
  }

  async function addCategory(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const f=new FormData(e.currentTarget), name=String(f.get('name')||'').trim()
    const {error}=await supabase.from('categories').insert({name,slug:slugify(String(f.get('slug')||name)),description:String(f.get('description')||''),image_url:String(f.get('image_url')||'')||null,is_featured:f.get('is_featured')==='on',is_active:true,sort_order:Number(f.get('sort_order')||0)})
    if(error)return fail(error); done('เพิ่มหมวดหมู่เรียบร้อย')
  }

  async function addSlider(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const f=new FormData(e.currentTarget)
    const {error}=await supabase.from('sliders').insert({title:String(f.get('title')||''),image_url:String(f.get('image_url')||''),link_url:String(f.get('link_url')||'')||null,sort_order:Number(f.get('sort_order')||0),is_active:true})
    if(error)return fail(error); done('เพิ่มสไลด์เรียบร้อย')
  }

  async function adjustCredit(u:Profile){
    const {value}=await Swal.fire({title:`ปรับเครดิต: ${u.display_name||u.email}`,input:'number',inputLabel:'จำนวนเงิน (+ เพิ่ม / - ลด)',inputAttributes:{step:'0.01'},showCancelButton:true,confirmButtonText:'ยืนยัน',cancelButtonText:'ยกเลิก',confirmButtonColor:'#2563eb'})
    if(!value)return
    const {error}=await supabase.rpc('admin_adjust_credit',{p_user_id:u.id,p_amount:Number(value),p_note:'ปรับเครดิตจาก Admin Dashboard'})
    if(error)return fail(error); done('ปรับเครดิตเรียบร้อย')
  }

  async function changeRole(u:Profile){
    const next=u.role==='admin'?'user':'admin'
    const r=await Swal.fire({title:'เปลี่ยนสิทธิ์สมาชิก?',text:`${u.email} → ${next}`,icon:'question',showCancelButton:true,confirmButtonText:'ยืนยัน',cancelButtonText:'ยกเลิก',confirmButtonColor:'#2563eb'})
    if(!r.isConfirmed)return
    const {error}=await supabase.rpc('admin_set_role',{p_user_id:u.id,p_role:next}); if(error)return fail(error); done('เปลี่ยนสิทธิ์เรียบร้อย')
  }

  async function resetPassword(u:Profile){
    if(!u.email)return
    const {error}=await supabase.auth.resetPasswordForEmail(u.email,{redirectTo:`${location.origin}/login`})
    if(error)return fail(error)
    Swal.fire({title:'ส่งลิงก์รีเซ็ตแล้ว',text:u.email,icon:'success',confirmButtonColor:'#2563eb'})
  }

  async function saveSettings(e:React.FormEvent<HTMLFormElement>){
    e.preventDefault(); const f=new FormData(e.currentTarget)
    const values={website_name:String(f.get('website_name')||''),browser_title:String(f.get('browser_title')||''),contact_url:String(f.get('contact_url')||'')||null,truemoney_phone:String(f.get('truemoney_phone')||'')||null,logo_url:String(f.get('logo_url')||'')||null,favicon_url:String(f.get('favicon_url')||'')||null}
    const {error}=await supabase.from('site_settings').update(values).eq('id',1); if(error)return fail(error); done('บันทึกการตั้งค่าเรียบร้อย')
  }

  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="brand-mark">N</span><div><b>Nexus Store</b><small>ADMIN PANEL</small></div></div>
      <nav>{tabs.map(([key,label])=><button key={key} className={tab===key?'active':''} onClick={()=>setTab(key)}>{label}</button>)}</nav>
      <a href="/" className="admin-back">← กลับหน้าร้าน</a>
    </aside>
    <section className="admin-content">
      <div className="admin-top"><div><span className="eyebrow">NEXUS STORE V1</span><h1>{tabs.find(x=>x[0]===tab)?.[1]}</h1></div><span className="admin-pill">ADMIN</span></div>

      {tab==='dashboard' && <>
        <div className="admin-stats">
          <div><span>ยอดขายทั้งหมด</span><strong>{money(sales)}</strong></div>
          <div><span>สมาชิก</span><strong>{p.users.length.toLocaleString('th-TH')}</strong></div>
          <div><span>สินค้า</span><strong>{p.products.length.toLocaleString('th-TH')}</strong></div>
          <div><span>Stock พร้อมขาย</span><strong>{available.toLocaleString('th-TH')}</strong></div>
        </div>
        <div className="admin-card"><h2>คำสั่งซื้อล่าสุด</h2><OrderTable orders={p.orders.slice(0,10)}/></div>
      </>}

      {tab==='products' && <div className="admin-grid-two">
        <form className="admin-card admin-form" onSubmit={addProduct}><h2>เพิ่มสินค้า</h2>
          <input name="name" placeholder="ชื่อสินค้า" required/><input name="slug" placeholder="slug (เว้นว่างให้สร้างอัตโนมัติ)"/>
          <select name="category_id"><option value="">เลือกหมวดหมู่</option>{p.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <textarea name="description" placeholder="รายละเอียดสินค้า"/>
          <div className="form-row"><input name="price" type="number" min="0" step="0.01" placeholder="ราคา" required/><input name="old_price" type="number" min="0" step="0.01" placeholder="ราคาเดิม"/></div>
          <input name="image_url" placeholder="URL รูปสินค้า"/><label className="check"><input type="checkbox" name="is_featured"/> แสดงเป็นสินค้าแนะนำ</label>
          <button className="btn btn-primary">เพิ่มสินค้า</button>
        </form>
        <div className="admin-card"><h2>สินค้าทั้งหมด</h2><div className="admin-list">{p.products.map(x=><div className="admin-list-row" key={x.id}><div><b>{x.name}</b><small>{money(x.price)} • {x.is_featured?'แนะนำ':'ทั่วไป'} • {x.is_active?'เปิด':'ปิด'}</small></div><div className="mini-actions"><button onClick={()=>editProduct(x)}>แก้ไข</button><button onClick={()=>mutate('products',x.id,{is_featured:!x.is_featured})}>{x.is_featured?'เลิกแนะนำ':'แนะนำ'}</button><button onClick={()=>mutate('products',x.id,{is_active:!x.is_active})}>{x.is_active?'ปิด':'เปิด'}</button><button className="danger-link" onClick={()=>remove('products',x.id,'สินค้า')}>ลบ</button></div></div>)}</div></div>
      </div>}

      {tab==='stock' && <div className="admin-grid-two">
        <form className="admin-card admin-form" onSubmit={addStock}><h2>เพิ่ม Stock</h2><select name="product_id" required><option value="">เลือกสินค้า</option>{p.products.map(x=><option value={x.id} key={x.id}>{x.name}</option>)}</select><textarea name="stock_values" rows={12} placeholder={'CODE-001\nCODE-002\nCODE-003'} required/><p className="form-help">1 บรรทัด = 1 Stock</p><button className="btn btn-primary">เพิ่ม Stock</button></form>
        <div className="admin-card"><h2>สรุป Stock</h2><div className="stock-summary">{p.products.map(x=>{const rows=p.stock.filter(s=>s.product_id===x.id);return <div key={x.id}><b>{x.name}</b><span>พร้อมขาย {rows.filter(s=>s.status==='available').length} / ขายแล้ว {rows.filter(s=>s.status==='sold').length}</span></div>})}</div></div>
      </div>}

      {tab==='categories' && <div className="admin-grid-two">
        <form className="admin-card admin-form" onSubmit={addCategory}><h2>เพิ่มหมวดหมู่</h2><input name="name" placeholder="ชื่อหมวดหมู่" required/><input name="slug" placeholder="slug"/><textarea name="description" placeholder="คำอธิบาย"/><input name="image_url" placeholder="URL รูปหมวดหมู่"/><input name="sort_order" type="number" defaultValue="0" placeholder="ลำดับ"/><label className="check"><input name="is_featured" type="checkbox"/> แสดงหน้าแรก</label><button className="btn btn-primary">เพิ่มหมวดหมู่</button></form>
        <div className="admin-card"><h2>หมวดหมู่ทั้งหมด</h2><div className="admin-list">{p.categories.map(c=><div className="admin-list-row" key={c.id}><div><b>{c.name}</b><small>/{c.slug} • {c.is_featured?'แนะนำ':'ทั่วไป'} • {c.is_active?'เปิด':'ปิด'}</small></div><div className="mini-actions"><button onClick={()=>mutate('categories',c.id,{is_featured:!c.is_featured})}>{c.is_featured?'เลิกแนะนำ':'แนะนำ'}</button><button onClick={()=>mutate('categories',c.id,{is_active:!c.is_active})}>{c.is_active?'ปิด':'เปิด'}</button><button className="danger-link" onClick={()=>remove('categories',c.id,'หมวดหมู่')}>ลบ</button></div></div>)}</div></div>
      </div>}

      {tab==='sliders' && <div className="admin-grid-two">
        <form className="admin-card admin-form" onSubmit={addSlider}><h2>เพิ่มสไลด์ 1300×400</h2><input name="title" placeholder="ชื่อสไลด์"/><input name="image_url" type="url" placeholder="URL รูปภาพ" required/><input name="link_url" type="url" placeholder="ลิงก์เมื่อคลิก"/><input name="sort_order" type="number" defaultValue="0"/><button className="btn btn-primary">เพิ่มสไลด์</button></form>
        <div className="admin-card"><h2>สไลด์ทั้งหมด</h2><div className="admin-list">{p.sliders.map(s=><div className="admin-list-row" key={s.id}><div><b>{s.title||'ไม่มีชื่อ'}</b><small>{s.is_active?'กำลังแสดง':'ปิด'} • ลำดับ {s.sort_order}</small></div><div className="mini-actions"><button onClick={()=>mutate('sliders',s.id,{is_active:!s.is_active})}>{s.is_active?'ปิด':'เปิด'}</button><button className="danger-link" onClick={()=>remove('sliders',s.id,'สไลด์')}>ลบ</button></div></div>)}</div></div>
      </div>}

      {tab==='users' && <div className="admin-card table-card"><h2>สมาชิกทั้งหมด</h2><div className="table-wrap"><table><thead><tr><th>สมาชิก</th><th>Role</th><th>เครดิต</th><th>เติมเงินรวม</th><th>จัดการ</th></tr></thead><tbody>{p.users.map(u=><tr key={u.id}><td><b>{u.display_name||'-'}</b><small>{u.email}</small></td><td><span className={`role ${u.role}`}>{u.role}</span></td><td>{money(u.credit)}</td><td>{money(u.total_topup)}</td><td><div className="table-actions"><button onClick={()=>adjustCredit(u)}>เครดิต</button><button onClick={()=>changeRole(u)}>Role</button><button onClick={()=>resetPassword(u)}>Reset</button></div></td></tr>)}</tbody></table></div></div>}

      {tab==='orders' && <div className="admin-card table-card"><h2>คำสั่งซื้อทั้งหมด</h2><OrderTable orders={p.orders} full/></div>}

      {tab==='settings' && <form className="admin-card admin-form settings-form" onSubmit={saveSettings}><h2>ตั้งค่าเว็บไซต์</h2><div className="form-row"><label>ชื่อเว็บไซต์<input name="website_name" defaultValue={p.settings.website_name} required/></label><label>Browser Title<input name="browser_title" defaultValue={p.settings.browser_title} required/></label></div><label>ลิงก์ติดต่อ<input name="contact_url" defaultValue={p.settings.contact_url||''} placeholder="https://line.me/..."/></label><label>เบอร์ TrueMoney<input name="truemoney_phone" defaultValue={p.settings.truemoney_phone||''} placeholder="08xxxxxxxx"/></label><div className="form-row"><label>Logo URL<input name="logo_url" defaultValue={p.settings.logo_url||''}/></label><label>Favicon URL<input name="favicon_url" defaultValue={p.settings.favicon_url||''}/></label></div><button className="btn btn-primary">บันทึกการตั้งค่า</button></form>}
    </section>
  </div>
}

function OrderTable({orders,full=false}:{orders:Order[];full?:boolean}){
  if(!orders.length)return <div className="empty-state compact">ยังไม่มีคำสั่งซื้อ</div>
  return <div className="table-wrap"><table><thead><tr><th>Order</th>{full&&<th>สมาชิก</th>}<th>ยอด</th><th>สถานะ</th><th>วันที่</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td><b>{o.order_no}</b></td>{full&&<td><b>{o.profiles?.display_name||'-'}</b><small>{o.profiles?.email}</small></td>}<td>{money(o.total)}</td><td><span className="status-success">{o.status}</span></td><td>{dateTime(o.created_at)}</td></tr>)}</tbody></table></div>
}
