import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  return <main><h1>PACE Analytics</h1><p>สถิติจริงจาก Vercel Analytics</p><a href="https://vercel.com/dashboard">เปิด Vercel Analytics</a><form method="post" action="/api/admin/logout"><button>ออกจากระบบ</button></form></main>;
}