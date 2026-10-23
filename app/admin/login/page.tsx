import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export default async function AdminLogin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await isAdminAuthenticated()) redirect("/admin");
  const { error } = await searchParams;
  return <main className="admin-page"><section className="admin-panel admin-login">
    <span className="admin-kicker">PACE / KRIT.DEV</span><h1>Admin Access</h1>
    <p>เข้าสู่ระบบเพื่อดูแดชบอร์ดผู้ดูแล PACE</p>
    {error === "invalid" && <p className="admin-error" role="alert">รหัสผ่านไม่ถูกต้อง</p>}
    {error === "setup" && <p className="admin-error" role="alert">ยังไม่ได้ตั้งค่า ADMIN_PASSWORD และ ADMIN_SESSION_SECRET บน Vercel</p>}
    <form method="post" action="/api/admin/login">
      <label htmlFor="admin-password">Admin Password</label>
      <input id="admin-password" name="password" type="password" autoComplete="current-password" required minLength={1}/>
      <button type="submit">เข้าสู่ระบบ →</button>
    </form>
    <a href="/">← กลับหน้า PACE</a>
  </section></main>;
}
