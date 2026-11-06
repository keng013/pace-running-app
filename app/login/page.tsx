"use client";
import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase-browser";
export default function LoginPage() {
 const [mode,setMode] = useState<"login"|"register"|"forgot">("login");
 const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState("");
 const [busy,setBusy]=useState(false); const [notice,setNotice]=useState(""); const [error,setError]=useState("");
 const onEmail = async (e:React.FormEvent) => {
  e.preventDefault(); setBusy(true);setError("");setNotice("");
  try {
   const auth=supabaseBrowser().auth;
   if(mode==="forgot") {
    const {error}=await auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/auth/callback?next=%2Freset-password"});
    if(error) throw error; setNotice("หากอีเมลนี้มีบัญชี ระบบจะส่งลิงก์ตั้งรหัสผ่านใหม่ให้");
   } else if(mode==="register") {
    const {data,error}=await auth.signUp({email,password,options:{data:{display_name:name},emailRedirectTo:window.location.origin+"/auth/callback?next=%2F%3Ftab%3Dprofile"}});
    if(error) throw error;
    if(data.session) window.location.assign("/?tab=profile"); else setNotice("ตรวจสอบอีเมลเพื่อยืนยันการสมัครสมาชิก");
   } else {
    const {error}=await auth.signInWithPassword({email,password});
    if(error) throw error; window.location.assign("/?tab=profile");
   }
  } catch(e) {setError(e instanceof Error?e.message:"เกิดข้อผิดพลาด");} finally {setBusy(false);}
 };
 const google=async()=>{
  setBusy(true);setError("");
  try { const {error}=await supabaseBrowser().auth.signInWithOAuth({provider:"google",options:{redirectTo:window.location.origin+"/auth/callback?next=%2F%3Ftab%3Dprofile"}}); if(error)throw error; }
  catch(e){setError(e instanceof Error?e.message:"Google Login ยังไม่พร้อมใช้งาน");setBusy(false);}
 };
 return <main className="auth-shell">
  <Link href="/" className="auth-home">← กลับหน้าแรก</Link>
  <div className="auth-logo">P<span>A</span>CE <small>ZONE</small></div>
  <h1>{mode==="register"?"Create Account":mode==="forgot"?"Reset password":"Welcome Back"}</h1>
  <p className="muted">Your running journey starts here.</p>
  <section className="auth-panel">
   <form onSubmit={onEmail}>
    {mode==="register"&&<label className="field">ชื่อที่แสดง<input className="control" autoComplete="name" required maxLength={80} value={name} onChange={e=>setName(e.target.value)}/></label>}
    <label className="field">Email<input className="control" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)}/></label>
    {mode!=="forgot"&&<label className="field">Password<input className="control" type="password" autoComplete={mode==="register"?"new-password":"current-password"} minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>}
    {error&&<p role="alert" className="auth-error">{error}</p>}
    {notice&&<p role="status" className="auth-note">{notice}</p>}
    <button className="action" type="submit" disabled={busy}>{busy?"กำลังดำเนินการ…":mode==="register"?"สมัครสมาชิก":mode==="forgot"?"ส่งลิงก์รีเซ็ตรหัสผ่าน":"เข้าสู่ระบบ"}</button>
   </form>
   {mode!=="forgot"&&<><div className="auth-divider">หรือ</div><button type="button" className="google-auth-button" disabled={busy} onClick={google}><svg viewBox="0 0 48 48" width="22" height="22" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.25 5.48-4.76 7.18l7.73 6C44.42 38.03 46.98 31.88 46.98 24.55z"/><path fill="#FBBC05" d="M10.53 28.59A14.41 14.41 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.2A23.87 23.87 0 0 0 0 24c0 3.87.93 7.51 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.92-2.13 15.89-5.8l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.97 6.19C6.51 42.62 14.62 48 24 48z"/></svg>Continue with Google</button></>}
   <div className="auth-links">{mode==="login"?<><button onClick={()=>setMode("forgot")}>ลืมรหัสผ่าน?</button><button onClick={()=>setMode("register")}>สมัครสมาชิก</button></>:<button onClick={()=>setMode("login")}>กลับไปเข้าสู่ระบบ</button>}</div>
  </section>
 </main>;
}
