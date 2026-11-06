"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import type {User} from "@supabase/supabase-js";
import {supabaseBrowser} from "@/lib/supabase-browser";
type Profile={display_name:string|null;avatar_url:string|null;height_cm:number|null;weight_kg:number|null;target_distance_km:number|null;target_time_seconds:number|null};
const empty:Profile={display_name:"",avatar_url:null,height_cm:null,weight_kg:null,target_distance_km:10,target_time_seconds:2700};
export default function AuthProfile(){
 const [user,setUser]=useState<User|null>(null);const [profile,setProfile]=useState<Profile>(empty);const [ready,setReady]=useState(false);const [saving,setSaving]=useState(false);const [notice,setNotice]=useState("");
 const load=useCallback(async(u:User|null)=>{
  setUser(u);if(!u){setReady(true);return;}
  const {data,error}=await supabaseBrowser().from("profiles").select("display_name,avatar_url,height_cm,weight_kg,target_distance_km,target_time_seconds").eq("id",u.id).maybeSingle();
  if(error)setNotice(error.message);
  setProfile({...empty,display_name:u.user_metadata?.display_name||u.user_metadata?.full_name||u.email||"",avatar_url:u.user_metadata?.avatar_url||null,...(data||{})});setReady(true);
 },[]);
 useEffect(()=>{const sb=supabaseBrowser();sb.auth.getUser().then(({data})=>void load(data.user));const {data:{subscription}}=sb.auth.onAuthStateChange((_event,session)=>{if(!session){setUser(null);setReady(true);}});return()=>subscription.unsubscribe();},[load]);
 if(!ready)return <div className="panel">กำลังโหลดข้อมูลบัญชี…</div>;
 if(!user)return <section className="panel auth-profile-intro"><h3>Welcome, Runner!</h3><p className="muted">เข้าสู่ระบบเพื่อสร้างโปรไฟล์ส่วนตัวและบันทึกเป้าหมายการวิ่ง</p><Link className="action auth-link-button" href="/login">Login / Sign Up</Link><p className="small muted">ใช้ Email หรือ Google Account ได้</p></section>;
 const save=async(e:React.FormEvent)=>{e.preventDefault();setSaving(true);setNotice("");const {error}=await supabaseBrowser().from("profiles").upsert({id:user.id,...profile,updated_at:new Date().toISOString()},{onConflict:"id"});setNotice(error?error.message:"บันทึกโปรไฟล์เรียบร้อยแล้ว");setSaving(false);};
 return <section className="panel auth-profile-intro">
  <div className="auth-user"><span className="auth-avatar">{profile.display_name?.slice(0,1)?.toUpperCase()||"R"}</span><div><h3>{profile.display_name||"Runner"}</h3><p className="small muted">{user.email}</p></div></div>
  <form onSubmit={save}>
   <label className="field">Display Name<input className="control" required maxLength={80} value={profile.display_name||""} onChange={e=>setProfile(p=>({...p,display_name:e.target.value}))}/></label>
   <div className="grid"><label className="field">ส่วนสูง (cm)<input type="number" min="100" max="250" step=".1" className="control" value={profile.height_cm??""} onChange={e=>setProfile(p=>({...p,height_cm:e.target.value===""?null:Number(e.target.value)}))}/></label><label className="field">น้ำหนัก (kg)<input type="number" min="20" max="400" step=".1" className="control" value={profile.weight_kg??""} onChange={e=>setProfile(p=>({...p,weight_kg:e.target.value===""?null:Number(e.target.value)}))}/></label></div>
   <div className="grid"><label className="field">เป้าหมาย (km)<input type="number" min="1" max="500" step=".01" className="control" value={profile.target_distance_km??""} onChange={e=>setProfile(p=>({...p,target_distance_km:e.target.value===""?null:Number(e.target.value)}))}/></label><label className="field">เวลาเป้าหมาย (วินาที)<input type="number" min="1" max="359999" className="control" value={profile.target_time_seconds??""} onChange={e=>setProfile(p=>({...p,target_time_seconds:e.target.value===""?null:Number(e.target.value)}))}/></label></div>
   <button type="submit" className="action" disabled={saving}>{saving?"กำลังบันทึก…":"Save Profile"}</button>
   <p className="small" role="status">{notice}</p>
  </form>
  <button className="auth-logout" onClick={async()=>{await supabaseBrowser().auth.signOut();window.location.assign("/");}}>Sign Out</button>
 </section>;
}
