"use client";
import { useEffect, useMemo, useState } from "react";

type Meal = "breakfast" | "lunch" | "dinner" | "snack";
type Entry = { id: string; date: string; meal: Meal; name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number };
const mealNames: Record<Meal,string> = { breakfast:"มื้อเช้า",lunch:"มื้อกลางวัน",dinner:"มื้อเย็น",snack:"ของว่าง" };
const catalog = [
  {name:"ข้าวสวย",grams:100,kcal:130,protein:2.7,carbs:28.2,fat:0.3},
  {name:"ไข่ต้ม",grams:50,kcal:78,protein:6.3,carbs:0.6,fat:5.3},
  {name:"อกไก่สุก",grams:100,kcal:165,protein:31,carbs:0,fat:3.6},
  {name:"กล้วยหอม",grams:100,kcal:89,protein:1.1,carbs:22.8,fat:0.3},
  {name:"นมจืด",grams:200,kcal:122,protein:6.4,carbs:9.6,fat:6.6},
  {name:"ข้าวกะเพราไก่ (ประมาณ)",grams:350,kcal:550,protein:25,carbs:70,fat:19},
  {name:"ข้าวต้มปลา (ประมาณ)",grams:350,kcal:250,protein:18,carbs:35,fat:4},
  {name:"ก๋วยเตี๋ยวน้ำ (ประมาณ)",grams:350,kcal:320,protein:17,carbs:46,fat:7},
];
const todayLocal = () => { const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); };
const fmt=(v:number)=>Math.round(v).toLocaleString("th-TH");
const safe=(v:number)=>Number.isFinite(v)?Math.max(0,v):0;
export default function NutritionTracker(){
  const [entries,setEntries]=useState<Entry[]>([]);
  const [ready,setReady]=useState(false);
  const [date,setDate]=useState(todayLocal);
  const [meal,setMeal]=useState<Meal>("breakfast");
  const [food,setFood]=useState(catalog[0].name);
  const [grams,setGrams]=useState(100);
  const [custom,setCustom]=useState(false);
  const [name,setName]=useState("");
  const [kcal,setKcal]=useState(0);
  const [protein,setProtein]=useState(0);
  const [carbs,setCarbs]=useState(0);
  const [fat,setFat]=useState(0);
  const [sex,setSex]=useState<"male"|"female">("male");
  const [age,setAge]=useState(35);
  const [weight,setWeight]=useState(70);
  const [height,setHeight]=useState(170);
  const [activity,setActivity]=useState(1.375);
  const [goal,setGoal]=useState(0);
  useEffect(()=>{try{const raw=localStorage.getItem("pace-nutrition-v1");if(raw){const v=JSON.parse(raw);if(Array.isArray(v.entries))setEntries(v.entries.filter((x:Entry)=>x&&typeof x.date==="string"&&typeof x.kcal==="number").slice(-2000));if(v.profile){const p=v.profile; if(p.sex==="male"||p.sex==="female")setSex(p.sex);if(Number.isFinite(p.age))setAge(p.age);if(Number.isFinite(p.weight))setWeight(p.weight);if(Number.isFinite(p.height))setHeight(p.height);if([1.2,1.375,1.55,1.725,1.9].includes(p.activity))setActivity(p.activity);if([-300,0,300].includes(p.goal))setGoal(p.goal);}}}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready){try{localStorage.setItem("pace-nutrition-v1",JSON.stringify({entries,profile:{sex,age,weight,height,activity,goal}}));}catch{}}},[entries,sex,age,weight,height,activity,goal,ready]);
  const daily=useMemo(()=>entries.filter(e=>e.date===date),[entries,date]);
  const totals=daily.reduce((a,e)=>({kcal:a.kcal+e.kcal,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),{kcal:0,protein:0,carbs:0,fat:0});
  const bmr=10*weight+6.25*height-5*age+(sex==="male"?5:-161);
  const target=Math.max(0,Math.round(bmr*activity+goal));
  const selected=catalog.find(f=>f.name===food)||catalog[0];
  const validProfile=age>=15&&age<=100&&weight>=25&&weight<=350&&height>=100&&height<=230;
  const add=()=>{const ratio=grams/selected.grams;const values=custom?{name:name.trim(),kcal,protein,carbs,fat}:{name:selected.name,kcal:selected.kcal*ratio,protein:selected.protein*ratio,carbs:selected.carbs*ratio,fat:selected.fat*ratio};if(!values.name||!Number.isFinite(grams)||grams<=0||grams>5000||Object.values(values).some(v=>typeof v==="number"&&(!Number.isFinite(v)||v<0||v>10000)))return;setEntries(prev=>[...prev,{id:globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random(),date,meal,name:values.name,grams:Math.round(grams),kcal:Math.round(values.kcal),protein:Math.round(values.protein*10)/10,carbs:Math.round(values.carbs*10)/10,fat:Math.round(values.fat*10)/10}]);if(custom){setName("");setKcal(0);setProtein(0);setCarbs(0);setFat(0);}};
  const inputStyle={width:"100%",background:"#17232a",color:"#f5f8f5",border:"1px solid #405052",borderRadius:12,padding:"12px",fontSize:16};
  const fieldStyle={display:"grid",gap:6,fontSize:13,color:"#bdc9c4"} as const;
  return <div style={{display:"grid",gap:16,paddingBottom:32}}>
    <div className="eyebrow">PACE NUTRITION</div><h2 style={{margin:0}}>Calorie Tracker</h2><p className="muted" style={{margin:0}}>บันทึกอาหาร คำนวณพลังงาน และติดตามสารอาหารสำหรับวันซ้อมและวันพัก</p>
    <section className="panel" style={{display:"grid",gap:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}><strong>สรุปพลังงานรายวัน</strong><input aria-label="วันที่บันทึก" type="date" value={date} onChange={e=>setDate(e.target.value)} style={{...inputStyle,width:"auto",maxWidth:"100%"}}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><small className="muted">รับประทานแล้ว</small><div className="metric lime" style={{fontSize:32}}>{fmt(totals.kcal)}<small style={{fontSize:13}}> kcal</small></div></div>
        <div><small className="muted">เป้าหมายโดยประมาณ</small><div className="metric" style={{fontSize:32}}>{validProfile?fmt(target):"—"}<small style={{fontSize:13}}> kcal</small></div></div>
      </div>
      <div style={{height:10,borderRadius:20,background:"#344044",overflow:"hidden"}}><div style={{width:(validProfile&&target>0?Math.min(100,totals.kcal/target*100):0)+"%",height:"100%",background:"#cbfa58"}}/></div>
      <p className="small muted" style={{margin:0}}>{validProfile?`คงเหลือ ${fmt(Math.max(0,target-totals.kcal))} kcal${totals.kcal>target?` · เกินเป้าหมาย ${fmt(totals.kcal-target)} kcal`:""}`:"กรอกข้อมูลร่างกายให้ถูกต้องเพื่อประเมินเป้าหมาย"}</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>{([["โปรตีน",totals.protein],["คาร์บ",totals.carbs],["ไขมัน",totals.fat]] as const).map(([label,value])=><div key={label} className="tile" style={{padding:10}}><small>{label}</small><strong style={{display:"block",fontSize:20}}>{fmt(value)} g</strong></div>)}</div>
    </section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>เป้าหมายแคลอรี่ (BMR / TDEE)</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
        <label style={fieldStyle}>เพศสำหรับสูตรคำนวณ<select style={inputStyle} value={sex} onChange={e=>setSex(e.target.value as "male"|"female")}><option value="male">ชาย</option><option value="female">หญิง</option></select></label>
        {([["อายุ (ปี)",age,setAge],["น้ำหนัก (กก.)",weight,setWeight],["ส่วนสูง (ซม.)",height,setHeight]] as const).map(([label,value,set])=><label key={label} style={fieldStyle}>{label}<input style={inputStyle} type="number" min="0" value={value} onChange={e=>set(safe(Number(e.target.value)))}/></label>)}
        <label style={fieldStyle}>กิจกรรม<select style={inputStyle} value={activity} onChange={e=>setActivity(Number(e.target.value))}><option value={1.2}>นั่งทำงานเป็นหลัก</option><option value={1.375}>เคลื่อนไหวเล็กน้อย</option><option value={1.55}>ออกกำลังกายปานกลาง</option><option value={1.725}>ออกกำลังกายหนัก</option><option value={1.9}>ออกกำลังกายหนักมาก</option></select></label>
        <label style={fieldStyle}>เป้าหมาย<select style={inputStyle} value={goal} onChange={e=>setGoal(Number(e.target.value))}><option value={0}>รักษาน้ำหนัก</option><option value={-300}>ลดน้ำหนัก (-300 kcal)</option><option value={300}>เพิ่มน้ำหนัก (+300 kcal)</option></select></label>
      </div>
      <p className="small muted" style={{margin:0}}>{validProfile?`BMR ประมาณ ${fmt(bmr)} kcal/วัน · TDEE ประมาณ ${fmt(bmr*activity)} kcal/วัน`:"โปรดตรวจสอบอายุ น้ำหนัก และส่วนสูง"}</p>
      <p className="small muted" style={{margin:0}}>สูตร Mifflin–St Jeor เป็นเพียงค่าประมาณ กิจกรรมที่เลือกควรรวมการวิ่งแล้วเพื่อหลีกเลี่ยงการนับพลังงานซ้ำ</p>
    </section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>เพิ่มรายการอาหาร</h3>
      <label style={fieldStyle}>มื้ออาหาร<select style={inputStyle} value={meal} onChange={e=>setMeal(e.target.value as Meal)}>{Object.entries(mealNames).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label>
      <div style={{display:"flex",gap:8}}><button type="button" className={custom?"control":"action"} style={{flex:1}} onClick={()=>setCustom(false)}>เลือกอาหาร</button><button type="button" className={custom?"action":"control"} style={{flex:1}} onClick={()=>setCustom(true)}>กำหนดเอง</button></div>
      {custom?<><label style={fieldStyle}>ชื่ออาหาร<input style={inputStyle} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น ข้าวมันไก่"/></label><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>{([["แคลอรี่ (kcal)",kcal,setKcal],["โปรตีน (g)",protein,setProtein],["คาร์บ (g)",carbs,setCarbs],["ไขมัน (g)",fat,setFat]] as const).map(([label,value,set])=><label key={label} style={fieldStyle}>{label}<input type="number" min="0" style={inputStyle} value={value} onChange={e=>set(safe(Number(e.target.value)))}/></label>)}</div></>:<label style={fieldStyle}>รายการอาหาร<select style={inputStyle} value={food} onChange={e=>{const f=catalog.find(x=>x.name===e.target.value);setFood(e.target.value);if(f)setGrams(f.grams);}}>{catalog.map(f=><option key={f.name}>{f.name}</option>)}</select></label>}
      <label style={fieldStyle}>ปริมาณ (กรัม)<input type="number" min="1" max="5000" style={inputStyle} value={grams} onChange={e=>setGrams(safe(Number(e.target.value)))}/></label>
      {!custom&&<p className="small muted" style={{margin:0}}>ประมาณ {fmt(selected.kcal*grams/selected.grams)} kcal · P {fmt(selected.protein*grams/selected.grams)} g · C {fmt(selected.carbs*grams/selected.grams)} g · F {fmt(selected.fat*grams/selected.grams)} g</p>}
      <button type="button" className="action" onClick={add} disabled={grams<=0||grams>5000||(custom&&!name.trim())}>+ บันทึกอาหาร</button>
      <p className="small muted" style={{margin:0}}>ค่าอาหารในรายการเป็นค่าประมาณ อาจแตกต่างตามสูตร วัตถุดิบ และขนาดเสิร์ฟ</p>
    </section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>บันทึกอาหาร · {date}</h3>{daily.length===0?<p className="muted">ยังไม่มีรายการอาหารในวันที่เลือก</p>:Object.entries(mealNames).map(([key,label])=>{const items=daily.filter(e=>e.meal===key);return items.length?<div key={key}><strong>{label}</strong>{items.map(e=><div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 0",borderBottom:"1px solid #344044"}}><div style={{minWidth:0}}><div>{e.name}</div><small className="muted">{fmt(e.grams)} g · P {fmt(e.protein)} · C {fmt(e.carbs)} · F {fmt(e.fat)}</small></div><strong style={{whiteSpace:"nowrap"}}>{fmt(e.kcal)} kcal</strong><button type="button" aria-label={`ลบ ${e.name}`} onClick={()=>setEntries(prev=>prev.filter(x=>x.id!==e.id))} style={{background:"transparent",color:"#ffadad",border:"none",cursor:"pointer",fontSize:20}}>×</button></div>)}</div>:null;})}</section>
    <p className="small muted">ข้อมูลบันทึกอยู่เฉพาะเบราว์เซอร์นี้ (Local Storage) ไม่ซิงก์ข้ามอุปกรณ์ และอาจสูญหายหากล้างข้อมูลเว็บไซต์ · ไม่ใช่คำแนะนำทางการแพทย์</p>
  </div>;
}
