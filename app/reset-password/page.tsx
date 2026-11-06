"use client";
import {useState} from "react";
import Link from "next/link";
import {supabaseBrowser} from "@/lib/supabase-browser";
export default function ResetPasswordPage(){
 const [password,setPassword]=useState("");const [notice,setNotice]=useState("");const [busy,setBusy]=useState(false);
 return <main className="auth-shell"><Link href="/login" className="auth-home">← Login</Link><h1>Set new password</h1><form className="auth-panel" onSubmit={async e=>{e.preventDefault();setBusy(true);const {error}=await supabaseBrowser().auth.updateUser({password});setNotice(error?.message||"เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");setBusy(false);}}><label className="field">รหัสผ่านใหม่<input className="control" type="password" autoComplete="new-password" required minLength={8} value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="action" disabled={busy}>บันทึกรหัสผ่าน</button><p role="status">{notice}</p></form></main>;
}
