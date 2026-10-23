import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
const metrics = ["Visitors", "Page Views", "Top Pages", "Referrers", "Devices", "Countries"];
export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <main className="admin-page"><div className="admin-container">
    <header className="admin-header"><div><span className="admin-kicker">PACE / ADMIN</span><h1>Website Analytics</h1><p>แดชบอร์ดผู้ดูแลเว็บไซต์ PACE</p></div><form method="post" action="/api/admin/logout"><button className="admin-logout" type="submit">ออกจากระบบ</button></form></header>
    <section className="admin-panel"><span className="admin-kicker">VERIFIED DATA SOURCE</span><h2>Vercel Web Analytics</h2><p>ดูจำนวนผู้เข้าชม ยอดเปิดหน้า แหล่งที่มา อุปกรณ์ และประเทศจากระบบ Analytics ของ Vercel โดยตรง ปัจจุบันยังไม่ได้เชื่อมต่อ Analytics API สำหรับแสดงตัวเลขในหน้านี้ จึงไม่มีการสร้างข้อมูลจำลอง</p><a className="admin-action" href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer">เปิด Vercel Dashboard ↗</a><p className="admin-note">เลือกโปรเจกต์ pace-running-app แล้วเปิดแท็บ Analytics หากยังไม่ได้เปิดใช้งาน ให้เปิด Web Analytics ก่อนเพื่อเริ่มเก็บข้อมูลจริง</p></section>
    <section className="admin-metrics">{metrics.map(metric=><article className="admin-metric" key={metric}><span>{metric}</span><strong>—</strong><small>ยังไม่มีข้อมูลที่ดึงมายืนยันได้</small></article>)}</section>
    <section className="admin-panel"><h2>Feature Usage</h2><p>สถิติการใช้งาน Pace Calculator, Race Splits, VDOT, HR Zones และ Strava ต้องติดตั้ง Event Tracking เพิ่มเติม จึงยังไม่มีข้อมูลที่ตรวจสอบได้</p></section>
    <a className="admin-back" href="/">← กลับหน้า PACE</a>
  </div></main>;
}
