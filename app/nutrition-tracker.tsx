"use client";
import { useEffect, useMemo, useState } from "react";

type Meal = "breakfast" | "lunch" | "dinner" | "snack";
type WeightLog = {date:string;kg:number};
type WaterLog = Record<string,number>;
type Entry = { id: string; date: string; meal: Meal; name: string; grams: number; kcal: number; protein: number; carbs: number; fat: number };
const mealNames: Record<Meal,string> = { breakfast:"มื้อเช้า",lunch:"มื้อกลางวัน",dinner:"มื้อเย็น",snack:"ของว่าง" };
const catalog = [
  {name:"ข้าวกล้องสุก",grams:100,kcal:112,protein:2.6,carbs:23.5,fat:0.9},
  {name:"ข้าวเหนียวสุก",grams:100,kcal:169,protein:3.5,carbs:37,fat:0.3},
  {name:"ไข่ดาว",grams:55,kcal:115,protein:6.5,carbs:0.5,fat:9.5},
  {name:"ไข่เจียว (ประมาณ)",grams:100,kcal:240,protein:11,carbs:2,fat:20},
  {name:"หมูย่าง (ประมาณ)",grams:100,kcal:220,protein:25,carbs:2,fat:12},
  {name:"ปลาเผา",grams:100,kcal:130,protein:24,carbs:0,fat:3.5},
  {name:"เต้าหู้แข็ง",grams:100,kcal:140,protein:15,carbs:3,fat:8},
  {name:"ส้ม",grams:100,kcal:47,protein:0.9,carbs:12,fat:0.1},
  {name:"แอปเปิล",grams:100,kcal:52,protein:0.3,carbs:14,fat:0.2},
  {name:"โยเกิร์ตรสธรรมชาติ",grams:100,kcal:63,protein:5,carbs:7,fat:2},
  {name:"ข้าวมันไก่ (ประมาณ)",grams:400,kcal:650,protein:30,carbs:78,fat:24},
  {name:"ข้าวผัดหมู (ประมาณ)",grams:350,kcal:590,protein:20,carbs:75,fat:23},
  {name:"ผัดไทยกุ้งสด (ประมาณ)",grams:350,kcal:550,protein:21,carbs:70,fat:20},
  {name:"ส้มตำไทย (ประมาณ)",grams:200,kcal:150,protein:4,carbs:29,fat:3},
  {name:"ต้มยำน้ำใส (ประมาณ)",grams:300,kcal:130,protein:18,carbs:8,fat:3},
  {name:"แกงจืดเต้าหู้หมูสับ (ประมาณ)",grams:300,kcal:180,protein:18,carbs:8,fat:9},
  {name:"ข้าวหน้าไก่ (ประมาณ)",grams:350,kcal:520,protein:25,carbs:72,fat:14},
  {name:"กาแฟลาเต้ไม่หวาน (ประมาณ)",grams:250,kcal:120,protein:7,carbs:10,fat:6},
  {name:"นมถั่วเหลืองไม่หวาน",grams:250,kcal:90,protein:8,carbs:5,fat:4},
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
  const [search,setSearch]=useState("");
  const [favorites,setFavorites]=useState<string[]>([]);
  const [editId,setEditId]=useState<string|null>(null);
  const [water,setWater]=useState<WaterLog>({});
  const [weightLogs,setWeightLogs]=useState<WeightLog[]>([]);
  const [logWeight,setLogWeight]=useState(70);
  const [waterGoal,setWaterGoal]=useState(2000);
  const [proteinTarget,setProteinTarget]=useState(100);
  const [carbTarget,setCarbTarget]=useState(250);
  const [fatTarget,setFatTarget]=useState(70);
  const [period,setPeriod]=useState<7|30|90>(7);
  useEffect(()=>{try{const raw=localStorage.getItem("pace-nutrition-v1");if(raw){const v=JSON.parse(raw);if(Array.isArray(v.entries))setEntries(v.entries.filter((x:Entry)=>x&&typeof x.date==="string"&&typeof x.kcal==="number").slice(-2000));if(Array.isArray(v.favorites))setFavorites(v.favorites.filter((x:unknown)=>typeof x==="string").slice(0,200));if(v.water&&typeof v.water==="object")setWater(v.water);if(Array.isArray(v.weightLogs))setWeightLogs(v.weightLogs.filter((x:WeightLog)=>x&&typeof x.date==="string"&&Number.isFinite(x.kg)).slice(-1000));if(v.targets){const t=v.targets;if(Number.isFinite(t.waterGoal))setWaterGoal(t.waterGoal);if(Number.isFinite(t.proteinTarget))setProteinTarget(t.proteinTarget);if(Number.isFinite(t.carbTarget))setCarbTarget(t.carbTarget);if(Number.isFinite(t.fatTarget))setFatTarget(t.fatTarget);}if(v.profile){const p=v.profile; if(p.sex==="male"||p.sex==="female")setSex(p.sex);if(Number.isFinite(p.age))setAge(p.age);if(Number.isFinite(p.weight))setWeight(p.weight);if(Number.isFinite(p.weight))setLogWeight(p.weight);if(Number.isFinite(p.height))setHeight(p.height);if([1.2,1.375,1.55,1.725,1.9].includes(p.activity))setActivity(p.activity);if([-300,0,300].includes(p.goal))setGoal(p.goal);}}}catch{}setReady(true);},[]);
  useEffect(()=>{if(ready){try{localStorage.setItem("pace-nutrition-v1",JSON.stringify({entries,favorites,water,weightLogs,targets:{waterGoal,proteinTarget,carbTarget,fatTarget},profile:{sex,age,weight,height,activity,goal}}));}catch{}}},[entries,favorites,water,weightLogs,waterGoal,proteinTarget,carbTarget,fatTarget,sex,age,weight,height,activity,goal,ready]);
  const daily=useMemo(()=>entries.filter(e=>e.date===date),[entries,date]);
  const totals=daily.reduce((a,e)=>({kcal:a.kcal+e.kcal,protein:a.protein+e.protein,carbs:a.carbs+e.carbs,fat:a.fat+e.fat}),{kcal:0,protein:0,carbs:0,fat:0});
  const bmr=10*weight+6.25*height-5*age+(sex==="male"?5:-161);
  const target=Math.max(0,Math.round(bmr*activity+goal));
  const selected=catalog.find(f=>f.name===food)||catalog[0];
  const validProfile=age>=15&&age<=100&&weight>=25&&weight<=350&&height>=100&&height<=230;
  const matches=useMemo(()=>catalog.filter(f=>f.name.toLowerCase().includes(search.trim().toLowerCase())),[search]);
  const frequent=useMemo(()=>Object.entries(entries.reduce<Record<string,number>>((a,e)=>{a[e.name]=(a[e.name]||0)+1;return a;},{})).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>x[0]),[entries]);
  const chooseFood=(next:string)=>{const f=catalog.find(x=>x.name===next);if(f){setFood(next);setGrams(f.grams);setCustom(false);setEditId(null);}else{const prior=entries.find(x=>x.name===next);if(prior){setCustom(true);setName(prior.name);setGrams(prior.grams);setKcal(prior.kcal);setProtein(prior.protein);setCarbs(prior.carbs);setFat(prior.fat);setEditId(null);}}};
  const startEdit=(e:Entry)=>{setEditId(e.id);setMeal(e.meal);setCustom(true);setName(e.name);setGrams(e.grams);setKcal(e.kcal);setProtein(e.protein);setCarbs(e.carbs);setFat(e.fat);};
  const cancelEdit=()=>{setEditId(null);setName("");};
  const days=useMemo(()=>Array.from({length:period},(_,i)=>{const [y,m,d]=date.split("-").map(Number);const day=new Date(y,m-1,d);day.setDate(day.getDate()-(period-1-i));const key=[day.getFullYear(),String(day.getMonth()+1).padStart(2,"0"),String(day.getDate()).padStart(2,"0")].join("-");return {date:key,label:String(day.getDate()),kcal:entries.filter(e=>e.date===key).reduce((s,e)=>s+e.kcal,0)};}),[date,entries,period]);
  const loggedDays=days.filter(d=>d.kcal>0);
  const average=loggedDays.length?loggedDays.reduce((a,d)=>a+d.kcal,0)/loggedDays.length:0;
  const maxChart=Math.max(target, ...days.map(d=>d.kcal),1);
  const waterToday=Math.max(0,Number(water[date])||0);
  const add=()=>{const ratio=grams/selected.grams;const values=custom?{name:name.trim(),kcal,protein,carbs,fat}:{name:selected.name,kcal:selected.kcal*ratio,protein:selected.protein*ratio,carbs:selected.carbs*ratio,fat:selected.fat*ratio};if(!values.name||!Number.isFinite(grams)||grams<=0||grams>5000||Object.values(values).some(v=>typeof v==="number"&&(!Number.isFinite(v)||v<0||v>10000)))return;setEntries(prev=>{const item={id:editId||globalThis.crypto?.randomUUID?.()||String(Date.now())+Math.random(),date,meal,name:values.name,grams:Math.round(grams),kcal:Math.round(values.kcal),protein:Math.round(values.protein*10)/10,carbs:Math.round(values.carbs*10)/10,fat:Math.round(values.fat*10)/10};return editId?prev.map(e=>e.id===editId?{...item,date:e.date}:e):[...prev,item];});setEditId(null);if(custom){setName("");setKcal(0);setProtein(0);setCarbs(0);setFat(0);}};
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
      {!custom&&<><label style={fieldStyle}>ค้นหาอาหารไทย<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ค้นหา เช่น กะเพรา ไข่ ข้าวต้ม" style={inputStyle}/></label><div style={{maxHeight:190,overflowY:"auto",display:"grid",gap:6}}>{matches.map(f=><button key={f.name} type="button" onClick={()=>chooseFood(f.name)} style={{...inputStyle,textAlign:"left",borderColor:food===f.name?"#cbfa58":"#405052",padding:10}}>{f.name} <small className="muted"> · {fmt(f.kcal)} kcal / {f.grams} g</small></button>)}{matches.length===0&&<p className="muted small">ไม่พบรายการ ลองเพิ่มอาหารด้วยตนเอง</p>}</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{[...new Set([...favorites,...frequent])].slice(0,7).map(f=><button key={f} type="button" className="control" style={{padding:8,fontSize:12}} onClick={()=>chooseFood(f)}>{favorites.includes(f)?"★ ":"↻ "}{f}</button>)}</div><button type="button" className="control" onClick={()=>setFavorites(p=>p.includes(food)?p.filter(x=>x!==food):[...p,food])}>{favorites.includes(food)?"★ นำออกจากรายการโปรด":"☆ เพิ่มอาหารนี้เป็นรายการโปรด"}</button></>}
      {custom?<><label style={fieldStyle}>ชื่ออาหาร<input style={inputStyle} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น ข้าวมันไก่"/></label><div style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>{([["แคลอรี่ (kcal)",kcal,setKcal],["โปรตีน (g)",protein,setProtein],["คาร์บ (g)",carbs,setCarbs],["ไขมัน (g)",fat,setFat]] as const).map(([label,value,set])=><label key={label} style={fieldStyle}>{label}<input type="number" min="0" style={inputStyle} value={value} onChange={e=>set(safe(Number(e.target.value)))}/></label>)}</div></>:<label style={fieldStyle}>รายการอาหาร<select style={inputStyle} value={food} onChange={e=>{const f=catalog.find(x=>x.name===e.target.value);setFood(e.target.value);if(f)setGrams(f.grams);}}>{catalog.map(f=><option key={f.name}>{f.name}</option>)}</select></label>}
      <label style={fieldStyle}>ปริมาณ (กรัม)<input type="number" min="1" max="5000" style={inputStyle} value={grams} onChange={e=>setGrams(safe(Number(e.target.value)))}/></label>
      {!custom&&<p className="small muted" style={{margin:0}}>ประมาณ {fmt(selected.kcal*grams/selected.grams)} kcal · P {fmt(selected.protein*grams/selected.grams)} g · C {fmt(selected.carbs*grams/selected.grams)} g · F {fmt(selected.fat*grams/selected.grams)} g</p>}
      <button type="button" className="action" onClick={add} disabled={grams<=0||grams>5000||(custom&&!name.trim())}>{editId?"บันทึกการแก้ไข":"+ บันทึกอาหาร"}</button>{editId&&<button type="button" className="control" onClick={cancelEdit}>ยกเลิกการแก้ไข</button>}
      <p className="small muted" style={{margin:0}}>ค่าอาหารในรายการเป็นค่าประมาณ อาจแตกต่างตามสูตร วัตถุดิบ และขนาดเสิร์ฟ</p>
    </section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>บันทึกอาหาร · {date}</h3>{daily.length===0?<p className="muted">ยังไม่มีรายการอาหารในวันที่เลือก</p>:Object.entries(mealNames).map(([key,label])=>{const items=daily.filter(e=>e.meal===key);return items.length?<div key={key}><strong>{label}</strong>{items.map(e=><div key={e.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,padding:"10px 0",borderBottom:"1px solid #344044"}}><div style={{minWidth:0}}><div>{e.name}</div><small className="muted">{fmt(e.grams)} g · P {fmt(e.protein)} · C {fmt(e.carbs)} · F {fmt(e.fat)}</small></div><strong style={{whiteSpace:"nowrap"}}>{fmt(e.kcal)} kcal</strong><button type="button" onClick={()=>startEdit(e)} className="control" style={{padding:8,fontSize:12}}>แก้ไข</button><button type="button" aria-label={`ลบ ${e.name}`} onClick={()=>setEntries(prev=>prev.filter(x=>x.id!==e.id))} style={{background:"transparent",color:"#ffadad",border:"none",cursor:"pointer",fontSize:20}}>×</button></div>)}</div>:null;})}</section>
    <section className="panel" style={{display:"grid",gap:14}}><div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,flexWrap:"wrap"}}><h3 style={{margin:0}}>Nutrition Analytics</h3><select style={{...inputStyle,width:"auto"}} aria-label="ช่วงเวลากราฟ" value={period} onChange={e=>setPeriod(Number(e.target.value) as 7|30|90)}><option value={7}>7 วัน</option><option value={30}>30 วัน</option><option value={90}>90 วัน</option></select></div><div className="grid"><div className="tile"><small>เฉลี่ยวันที่มีบันทึก</small><strong>{fmt(average)} kcal</strong></div><div className="tile"><small>วันที่มีข้อมูล</small><strong>{loggedDays.length} / {period}</strong></div></div><div style={{display:"flex",alignItems:"end",gap:period===90?1:3,height:132,borderBottom:"1px solid #5a6966",overflow:"hidden"}} role="img" aria-label={`กราฟแคลอรี่ย้อนหลัง ${period} วัน มีข้อมูล ${loggedDays.length} วัน`}>{days.map((d,i)=><div key={d.date} title={`${d.date}: ${fmt(d.kcal)} kcal`} style={{minWidth:0,flex:1,alignSelf:"end",height:d.kcal?Math.max(3,d.kcal/maxChart*128):2,background:d.kcal>target&&validProfile?"#f6b46b":"#cbfa58",opacity:d.kcal?1:.2,borderRadius:"3px 3px 0 0"}}/>)}</div><p className="small muted" style={{margin:0}}>กราฟแสดงพลังงานที่บันทึกจริง · วันที่ไม่มีข้อมูลไม่นับเป็นวันที่กิน 0 kcal · ค่าอาหารเป็นค่าประมาณ</p><h4 style={{margin:0}}>เป้าหมายสารอาหารต่อวัน (กรัม)</h4><div style={{display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:8}}>{([["โปรตีน",proteinTarget,setProteinTarget,totals.protein],["คาร์บ",carbTarget,setCarbTarget,totals.carbs],["ไขมัน",fatTarget,setFatTarget,totals.fat]] as const).map(([label,value,set,current])=><label key={label} style={fieldStyle}>{label}<input type="number" min={1} max={1000} style={{...inputStyle,padding:8}} value={value} onChange={e=>set(safe(Number(e.target.value)))}/><small>{fmt(current)} / {fmt(value)} g</small><div style={{height:5,background:"#344044",borderRadius:8,overflow:"hidden"}}><div style={{width:`${value>0?Math.min(100,current/value*100):0}%`,background:"#cbfa58",height:"100%"}}/></div></label>)}</div></section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>Water Tracker</h3><div className="grid"><div className="tile"><small>ดื่มแล้ววันนี้</small><strong>{fmt(waterToday)} ml</strong></div><label style={fieldStyle}>เป้าหมาย (ml)<input style={inputStyle} type="number" min={250} max={10000} value={waterGoal} onChange={e=>setWaterGoal(safe(Number(e.target.value)))}/></label></div><div style={{height:8,background:"#344044",borderRadius:8,overflow:"hidden"}}><div style={{width:`${waterGoal>0?Math.min(100,waterToday/waterGoal*100):0}%`,height:"100%",background:"#66c5f4"}}/></div><div style={{display:"flex",gap:8}}>{[150,250,500].map(n=><button type="button" key={n} className="control" style={{flex:1,padding:10}} onClick={()=>setWater(prev=>({...prev,[date]:Math.min(20000,waterToday+n)}))}>+{n} ml</button>)}</div><button className="control" type="button" onClick={()=>setWater(prev=>({...prev,[date]:Math.max(0,waterToday-250)}))}>−250 ml (แก้ไข)</button><p className="small muted" style={{margin:0}}>น้ำดื่มเป็นข้อมูลแยกตามวันที่เลือก เป้าหมายควรปรับตามอากาศ เหงื่อ และการซ้อม ไม่ควรฝืนดื่มเกินความต้องการ</p></section>
    <section className="panel" style={{display:"grid",gap:12}}><h3 style={{margin:0}}>Weight Trend</h3><div style={{display:"flex",gap:8,alignItems:"end"}}><label style={{...fieldStyle,flex:1}}>น้ำหนัก (kg)<input type="number" min={20} max={350} step={0.1} value={logWeight} onChange={e=>setLogWeight(safe(Number(e.target.value)))} style={inputStyle}/></label><button className="action" type="button" disabled={logWeight<20||logWeight>350} onClick={()=>setWeightLogs(prev=>[...prev.filter(x=>x.date!==date),{date,kg:logWeight}].sort((a,b)=>a.date.localeCompare(b.date)).slice(-1000))}>บันทึก</button></div>{weightLogs.length>0?<><div style={{display:"grid",gap:6}}>{weightLogs.slice(-8).reverse().map(w=><div key={w.date} style={{display:"flex",justifyContent:"space-between",borderBottom:"1px solid #344044",padding:"7px 0"}}><span>{w.date}</span><strong>{w.kg.toFixed(1)} kg</strong><button type="button" className="control" style={{padding:"4px 9px",fontSize:12}} onClick={()=>setWeightLogs(p=>p.filter(x=>x.date!==w.date))}>ลบ</button></div>)}</div>{weightLogs.length>1&&<p className="small muted" style={{margin:0}}>เปลี่ยนแปลงจากบันทึกแรก: {(weightLogs[weightLogs.length-1].kg-weightLogs[0].kg)>0?"+":""}{(weightLogs[weightLogs.length-1].kg-weightLogs[0].kg).toFixed(1)} kg · ช่วงน้ำหนักผันผวนจากน้ำและไกลโคเจนได้</p>}</>:<p className="muted small">ยังไม่มีประวัติน้ำหนัก เริ่มบันทึกได้จากวันที่เลือกด้านบน</p>}</section>
    <p className="small muted">ข้อมูลบันทึกอยู่เฉพาะเบราว์เซอร์นี้ (Local Storage) ไม่ซิงก์ข้ามอุปกรณ์ และอาจสูญหายหากล้างข้อมูลเว็บไซต์ · ไม่ใช่คำแนะนำทางการแพทย์</p>
  </div>;
}
