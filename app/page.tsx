"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Activity, Calculator, CalendarDays, BookOpen, UserRound, Flag, Home } from "lucide-react";
import { distances, finishSeconds, formatPace, formatTime, predictTime, splits } from "@/lib/pace";

type Tab = "home" | "calculator" | "splits" | "training" | "academy" | "profile";
type Mode = "pace" | "finish";
type Strategy = "even" | "negative" | "positive";

const navigation = [
  { id: "home" as Tab, icon: Home, label: "Home" },
  { id: "calculator" as Tab, icon: Calculator, label: "Pace" },
  { id: "splits" as Tab, icon: Flag, label: "Splits" },
  { id: "training" as Tab, icon: CalendarDays, label: "Training" },
  { id: "academy" as Tab, icon: BookOpen, label: "Learn" },
  { id: "profile" as Tab, icon: UserRound, label: "Me" },
];

const clamp = (value: string, min: number, max: number) =>
  Math.max(min, Math.min(max, Number(value) || 0));

type NumberWheelProps = {
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
};

const WHEEL_ITEM_HEIGHT = 52;

function NumberWheel({ label, value, max, onChange }: NumberWheelProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentValue = useRef(value);
  const isInteracting = useRef(false);

  useEffect(() => {
    const list = listRef.current;
    if (!list || isInteracting.current) return;
    if (Math.abs(list.scrollTop - value * WHEEL_ITEM_HEIGHT) > 1) {
      list.scrollTo({ top: value * WHEEL_ITEM_HEIGHT, behavior: "instant" });
    }
    currentValue.current = value;
  }, [value]);

  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  const select = (next: number, smooth = true) => {
    const selected = Math.max(0, Math.min(max, next));
    currentValue.current = selected;
    isInteracting.current = false;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    listRef.current?.scrollTo({
      top: selected * WHEEL_ITEM_HEIGHT,
      behavior: smooth ? "smooth" : "instant",
    });
    onChange(selected);
  };

  const handleScroll = () => {
    const list = listRef.current;
    if (!list) return;
    isInteracting.current = true;
    if (settleTimer.current) clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => {
      const selected = Math.max(0, Math.min(max, Math.round(list.scrollTop / WHEEL_ITEM_HEIGHT)));
      isInteracting.current = false;
      currentValue.current = selected;
      list.scrollTo({ top: selected * WHEEL_ITEM_HEIGHT, behavior: "smooth" });
      onChange(selected);
    }, 110);
  };

  return (
    <div className="number-wheel-group">
      <span className="field" id={`wheel-label-${label}`}>{label}</span>
      <div className="wheel-frame">
        <div className="wheel-highlight" aria-hidden="true" />
        <div
          className="number-wheel-scroll"
          ref={listRef}
          role="spinbutton"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={0}
          onScroll={handleScroll}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); select(currentValue.current - 1); }
            if (e.key === "ArrowDown") { e.preventDefault(); select(currentValue.current + 1); }
            if (e.key === "PageUp") { e.preventDefault(); select(currentValue.current - 5); }
            if (e.key === "PageDown") { e.preventDefault(); select(currentValue.current + 5); }
          }}
        >
          {Array.from({ length: max + 1 }, (_, number) => (
            <button
              className="wheel-option"
              type="button"
              key={number}
              tabIndex={-1}
              onClick={() => select(number)}
              aria-hidden="true"
            >
              {String(number).padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

const academyLessons = [
  {title:"Easy Run",summary:"สร้างฐานแอโรบิกและวิ่งอย่างสบาย",
   principle:"การวิ่งเบาช่วยพัฒนาความทนทานและเพิ่มปริมาณการฝึกโดยไม่สร้างความล้ามากเกินไป ควรใช้ระดับที่พูดเป็นประโยคได้ ไม่จำเป็นต้องยึดเพซตายตัว",
   session:"วอร์มอัปด้วยการเดินเร็ว 5–10 นาที จากนั้นวิ่งสบาย 20–45 นาที และคูลดาวน์ 5 นาที ผู้เริ่มต้นสามารถสลับวิ่ง 2–3 นาที กับเดิน 1–2 นาที",
   intensity:"RPE 2–4 จาก 10 หรือ Talk Test ที่พูดได้ต่อเนื่อง หากหอบจนพูดไม่เป็นประโยคให้ผ่อนความเร็ว",
   caution:"อย่าพยายามทำ Easy Run ให้เร็วทุกครั้ง โดยเฉพาะหลังวันซ้อมหนักหรือช่วงอากาศร้อน"},
  {title:"Long Run",summary:"เพิ่มความทนทานสำหรับระยะไกล",
   principle:"Long Run เป็นการฝึกให้อยู่บนเท้าได้นานขึ้น ควรเพิ่มระยะหรือเวลาอย่างค่อยเป็นค่อยไปตามการฟื้นตัว ไม่มีสูตรเพิ่มระยะรายสัปดาห์ที่ปลอดภัยกับทุกคน",
   session:"เลือกเวลาที่ทำได้สบาย เช่น 60–90 นาทีสำหรับผู้มีพื้นฐาน และเพิ่มทีละน้อยเมื่อฟื้นตัวดี สำหรับการวิ่งนานเกิน 90 นาทีควรทดลองน้ำและคาร์โบไฮเดรตระหว่างวิ่ง",
   intensity:"ส่วนใหญ่เป็น Easy effort หรือ RPE 3–4 จาก 10 สามารถใช้การเดินสลับเพื่อคุมความหนัก",
   caution:"ไม่ควรเร่ง Long Run ชดเชยวันที่พลาดซ้อม และหลีกเลี่ยงการเพิ่มทั้งระยะและความเร็วพร้อมกัน"},
  {title:"Tempo & Threshold",summary:"พัฒนาความสามารถในการรักษาความเร็ว",
   principle:"Tempo คือการวิ่งหนักแบบควบคุมได้ ส่วน Threshold เป็นระดับความหนักใกล้จุดที่ร่างกายเริ่มสะสมความล้าเร็วขึ้น ไม่ใช่การวิ่งเต็มกำลัง",
   session:"วอร์มอัป 10–15 นาที แล้วทำ 3 × 8 นาทีที่ระดับหนักแต่คุมได้ พักจ๊อก 2–3 นาทีระหว่างชุด ก่อนคูลดาวน์ 10 นาที",
   intensity:"ประมาณ RPE 6–7 จาก 10 พูดได้เป็นวลีสั้น ๆ แต่ไม่สามารถสนทนายาว ๆ",
   caution:"เริ่มด้วยช่วงสั้นก่อน และเว้นวันฟื้นตัวหลังการซ้อมหนัก หากเพซตกมากให้ลดความหนักแทนการฝืน"},
  {title:"Intervals",summary:"ฝึกความเร็วและการควบคุมจังหวะ",
   principle:"การสลับช่วงเร็วกับช่วงพักช่วยพัฒนาความสามารถในการออกแรงระดับสูง แต่ต้องมีพื้นฐานการวิ่งสม่ำเสมอก่อน",
   session:"วอร์มอัป 12–15 นาที พร้อมเร่งสั้น ๆ 3 ครั้ง จากนั้นทำ 6 × 2 นาทีเร็วระดับควบคุมได้ สลับจ๊อกหรือเดิน 2 นาที แล้วคูลดาวน์ 10 นาที",
   intensity:"ช่วงเร็ว RPE 7–8 จาก 10 ไม่ใช่สปรินต์สุดแรง และควรจบแต่ละรอบด้วยฟอร์มวิ่งที่ยังดี",
   caution:"ไม่ควรทำ Interval ติดต่อกันหลายวัน และควรหยุดหากเริ่มเสียท่าวิ่งหรือมีอาการเจ็บ"},
  {title:"Strength & Recovery",summary:"เสริมกล้ามเนื้อและวางแผนพัก",
   principle:"การฝึกแรงต้านช่วยเสริมความแข็งแรงของขา สะโพก และแกนกลาง ส่วนการพักและการนอนช่วยให้ร่างกายปรับตัวจากการฝึก",
   session:"สัปดาห์ละ 2 วัน ทำ Squat, Step-up, Calf Raise, Hip Hinge และ Plank อย่างละ 2–3 เซต โดยเริ่มจากน้ำหนักที่ควบคุมท่าได้",
   intensity:"เหลือแรงทำซ้ำได้อีกประมาณ 2–3 ครั้งต่อเซต และเว้นช่วงให้กล้ามเนื้อฟื้นตัวก่อนซ้อมหนักครั้งถัดไป",
   caution:"ลดน้ำหนักหรือจำนวนเซตเมื่อปวดกล้ามเนื้อมาก อย่าฝืนอาการเจ็บเฉพาะจุด"},
  {title:"Heart Rate & RPE",summary:"เลือกความหนักด้วยชีพจรและความรู้สึก",
   principle:"Heart-rate zone จากนาฬิกาเป็นเพียงค่าประมาณ เพราะอัตราการเต้นหัวใจสูงสุดต่างกันในแต่ละคน จึงควรใช้ RPE และ Talk Test ประกอบ",
   session:"ใน Easy Run ให้บันทึกทั้งชีพจร ความรู้สึก และความสามารถในการพูด เปรียบเทียบหลายครั้งภายใต้สภาพอากาศใกล้เคียงกัน",
   intensity:"RPE 1–2 เบามาก, 3–4 สบาย, 5–6 ปานกลาง, 7–8 หนัก, 9–10 หนักมาก",
   caution:"ความร้อน การขาดน้ำ ความเครียด และการพักผ่อนไม่พอทำให้ชีพจรสูงขึ้นได้ อย่าตัดสินจากตัวเลขเดียว"},
  {title:"Race Day & Fueling",summary:"เตรียมเพซ น้ำ และพลังงานวันแข่งขัน",
   principle:"การเริ่มช้ากว่าเพซเป้าหมายเล็กน้อยช่วยลดความเสี่ยงออกตัวเร็วเกินไป ควรทดลองอาหาร น้ำ และอุปกรณ์ในการซ้อมก่อนวันจริง",
   session:"ก่อนแข่งเตรียมแผนเพซรายช่วง ตรวจอากาศและจุดบริการน้ำ สำหรับการวิ่งยาวราว 1–2.5 ชั่วโมงอาจเริ่มทดลองคาร์โบไฮเดรต 30–60 กรัมต่อชั่วโมงตามความทนของระบบทางเดินอาหาร",
   intensity:"ช่วงต้นควรรู้สึกควบคุมได้ และค่อยประเมินความหนักหลังผ่านครึ่งทาง",
   caution:"อย่าทดลองเจลหรือรองเท้าคู่ใหม่วันแข่งขัน ปริมาณน้ำและพลังงานต้องปรับตามเวลา อากาศ และความทนของแต่ละคน"},
];

const vo2=(v:number)=>-4.60+0.182258*v+0.000104*v*v;
const fraction=(t:number)=>0.8+0.1894393*Math.exp(-0.012778*t)+0.2989558*Math.exp(-0.1932605*t);
const vdot=(km:number,sec:number)=>sec>0?vo2(km*60000/sec)/fraction(sec/60):0;
const trainingPace=(score:number,ratio:number)=>{let lo=0,hi=600;for(let i=0;i<50;i++){const mid=(lo+hi)/2;if(vo2(mid)<score*ratio)lo=mid;else hi=mid;}return formatPace(60000/((lo+hi)/2));};
export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [distance, setDistance] = useState(21.0975);
  const [mode, setMode] = useState<Mode>("pace");
  const [minutes, setMinutes] = useState(6);
  const [seconds, setSeconds] = useState(30);
  const [hours, setHours] = useState(2);
  const [finishMinutes, setFinishMinutes] = useState(17);
  const [finishSecs, setFinishSecs] = useState(8);
  const [strategy, setStrategy] = useState<Strategy>("even");
  const [knownDistance, setKnownDistance] = useState(10);
  const [knownHours, setKnownHours] = useState(0);
  const [knownMinutes, setKnownMinutes] = useState(55);
  const [knownSeconds, setKnownSeconds] = useState(0);

  const [trainingTool,setTrainingTool]=useState<"vdot"|"heart">("vdot");
  const [testKm,setTestKm]=useState(10);
  const [testHours,setTestHours]=useState(0);
  const [testMinutes,setTestMinutes]=useState(50);
  const [testSeconds,setTestSeconds]=useState(0);
  const [age,setAge]=useState(38);
  const [restHr,setRestHr]=useState(60);
  const [maxHrInput,setMaxHrInput]=useState(0);
  const [hrMethod,setHrMethod]=useState<"max"|"hrr">("max");
  const score=vdot(testKm,testHours*3600+testMinutes*60+testSeconds);
  const maxHr=maxHrInput||220-age;
  const inputPace = minutes * 60 + seconds;
  const targetSeconds = hours * 3600 + finishMinutes * 60 + finishSecs;
  const valid = mode === "pace" ? inputPace > 0 : targetSeconds > 0;
  const pace = mode === "pace" ? inputPace : targetSeconds / distance;
  const time = mode === "pace" ? finishSeconds(distance, pace) : targetSeconds;
  const rows = valid ? splits(distance, pace, strategy) : [];

  const changeTab = (next: Tab) => {
    setTab(next);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  };

  return (
    <>
      <main className={`shell ${tab === "calculator" ? "calculator-screen" : ""}`}>
        <header className="brand">
          <span className="logo pace-lockup">
            <Image src="/pace-mark.svg" alt="PACE runner logo" width={60} height={60} className="logo-bounce pace-symbol" />
            <span className="pace-wordmark">
              <span className="pace-name">P<span className="lime">A</span>CE</span>
              <span className="pace-credit">/ KRIT.DEV</span>
            </span>
          </span>
          <Activity color="#cbfa58" className="pulse-icon" />
        </header>

        {tab === "home" && (
          <>
            <section className="photo-hero">
              <div className="hero-photo-shade" />
              <div className="hero-copy">
                <span className="hero-kicker">RUN SMARTER · TRAIN BETTER</span>
                <h1>วิ่งชัดขึ้น<br /><em>ทุกก้าวมีเป้าหมาย</em></h1>
                <p>Every pace. Every progress.</p>
              </div>
            </section>
            <button className="action primary-cta" onClick={() => changeTab("calculator")}>คำนวณ Pace เลย <span>→</span></button>
            <div className="section-heading"><h3>เป้าหมายยอดนิยม</h3><span>CHOOSE YOUR RACE</span></div>
            <div className="race-options">
              {distances.map((d) => (
                <button key={d.km} className={distance === d.km ? "race-option selected" : "race-option"} onClick={() => { setDistance(d.km); changeTab("calculator"); }}>
                  <strong>{d.label === "Half Marathon" ? "Half" : d.label === "Marathon" ? "Marathon" : d.label}</strong>
                  <small>{d.km}K</small>
                </button>
              ))}
            </div>
            <div className="section-heading"><h3>เครื่องมือยอดนิยม</h3><span>EXPLORE</span></div>
            <div className="quick-tools">
              {[
                { id: "calculator" as Tab, icon: Calculator, label: "Pace Calculator" },
                { id: "splits" as Tab, icon: Flag, label: "Race Splits" },
                { id: "training" as Tab, icon: CalendarDays, label: "Training Plan" },
                { id: "academy" as Tab, icon: BookOpen, label: "Running Academy" },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id} className="quick-tool" onClick={() => changeTab(id)}>
                  <Icon size={22} strokeWidth={1.8} /><span>{label}</span>
                </button>
              ))}
            </div>
            <div className="motivation-card"><span>“ไม่ใช่แค่เร็วขึ้น<br />แต่แข็งแรงขึ้นในทุกก้าววิ่ง”</span><Activity color="#cbfa58" size={34} /></div>
          </>
        )}

        {tab === "calculator" && (
          <>
            <div className="eyebrow">PACE TOOLS</div>
            <h2>Pace Calculator</h2>
            <div className="panel">
              <label className="field">ระยะทาง</label>
              <div className="race-options calculator-distances">
                {distances.map((d) => (
                  <button key={d.km} type="button" className={distance === d.km ? "race-option selected" : "race-option"} onClick={() => setDistance(d.km)}>
                    <strong>{d.label === "Half Marathon" ? "Half" : d.label}</strong><small>{d.km}K</small>
                  </button>
                ))}
              </div>
              <label className="field">วิธีคำนวณ</label>
              <div className="grid">
                <button type="button" className={mode === "pace" ? "action" : "control"} onClick={() => setMode("pace")}>จาก Pace เฉลี่ย</button>
                <button type="button" className={mode === "finish" ? "action" : "control"} onClick={() => setMode("finish")}>จากเวลาจบ</button>
              </div>
              {mode === "pace" ? (
                <>
                  <label className="field">Pace เฉลี่ย (นาที : วินาที / กม.)</label>
                  <div className="wheel-grid two">
                    <NumberWheel label="นาที" value={minutes} max={59} onChange={setMinutes} />
                    <NumberWheel label="วินาที" value={seconds} max={59} onChange={setSeconds} />
                  </div>
                </>
              ) : (
                <>
                  <label className="field">เวลาที่ต้องการวิ่งจบ</label>
                  <div className="wheel-grid three">
                    <NumberWheel label="ชั่วโมง" value={hours} max={99} onChange={setHours} />
                    <NumberWheel label="นาที" value={finishMinutes} max={59} onChange={setFinishMinutes} />
                    <NumberWheel label="วินาที" value={finishSecs} max={59} onChange={setFinishSecs} />
                  </div>
                </>
              )}
              {!valid && <p role="alert" className="small" style={{ color: "#ffbc8a" }}>กรุณากำหนดค่ามากกว่า 0</p>}
            </div>
            <div className="panel">
              <span className="eyebrow">ESTIMATED FINISH</span>
              <div className="metric lime">{valid ? formatTime(time) : "—"}</div>
              <div className="grid">
                <div className="tile">Pace<strong>{valid ? formatPace(pace) : "—"}</strong><span className="small muted">min/km</span></div>
                <div className="tile">Speed<strong>{valid ? (3600 / pace).toFixed(1) : "—"}</strong><span className="small muted">km/h</span></div>
              </div>
              <button className="action" disabled={!valid} onClick={() => changeTab("splits")}>View Race Splits →</button>
            </div>
          </>
        )}

        {tab === "splits" && (
          <>
            <div className="eyebrow">RACE STRATEGY</div>
            <h2>Race Splits</h2>
            <div className="panel">
              <label className="field" htmlFor="strategy">Pacing Strategy</label>
              <select id="strategy" className="control" value={strategy} onChange={(e) => setStrategy(e.target.value as Strategy)}>
                <option value="even">Even Split</option>
                <option value="negative">Negative Split</option>
                <option value="positive">Positive Split</option>
              </select>
              <p className="muted small">ตัวอย่างการกระจายความเร็วโดยรักษาเวลาเข้าเส้นชัยตามเป้าหมาย</p>
              <div className="metric lime">{valid ? formatTime(time) : "—"}</div>
              {rows.map((r) => (
                <div className="split" key={r.km}>
                  <span>KM {r.km}</span>
                  <span>{formatPace(r.seconds / r.length)} /km</span>
                  <b>{formatTime(r.elapsed)}</b>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "training" && (
          <>
            <div className="eyebrow">TRAIN SMARTER</div>
            <h2>Training Planner</h2>
            <div className="training-switch">
              <button className={trainingTool==="vdot"?"selected":""} onClick={()=>setTrainingTool("vdot")}>VDOT Test</button>
              <button className={trainingTool==="heart"?"selected":""} onClick={()=>setTrainingTool("heart")}>Heart Rate Zones</button>
            </div>
            {trainingTool==="vdot"?<section className="training-tool-card">
              <span className="academy-overline">RUNNING PERFORMANCE</span><h3>VDOT Running Calculator</h3>
              <p className="muted">ประเมินสมรรถภาพจากผลงานการแข่งขันด้วยสมการ Daniels–Gilbert</p>
              <label className="field" htmlFor="test-distance">ระยะทางการแข่งขัน</label>
              <select id="test-distance" className="control" value={testKm} onChange={e=>setTestKm(Number(e.target.value))}>
                {distances.filter(d=>d.km>=3).map(d=><option key={d.km} value={d.km}>{d.label}</option>)}
              </select>
              <label className="field">เวลาที่ทำได้ (ชั่วโมง : นาที : วินาที)</label>
              <div className="wheel-grid three predictor-wheels">
                <NumberWheel label="ชั่วโมง" value={testHours} max={23} onChange={setTestHours}/>
                <NumberWheel label="นาที" value={testMinutes} max={59} onChange={setTestMinutes}/>
                <NumberWheel label="วินาที" value={testSeconds} max={59} onChange={setTestSeconds}/>
              </div>
              {score>=15&&score<=90&&testHours*3600+testMinutes*60+testSeconds>=180?<>
                <div className="training-result"><span>ESTIMATED VDOT</span><strong>{score.toFixed(1)}</strong><small>ค่าประเมินจากผลงาน ไม่ใช่การตรวจวัด VO₂max โดยตรง</small></div>
                <h4>Training Paces (ประมาณ)</h4>
                {([["Easy","Easy / Recovery",.68],["Marathon","Marathon effort",.82],["Threshold","Tempo",.88],["Interval","Intervals",.98]] as const).map(([name,description,ratio])=>
                  <div className="training-zone" key={name}><div><strong>{name}</strong><small>{description}</small></div><b>{trainingPace(score,ratio)}<small> /km</small></b></div>)}
              </>:<p className="muted">กรอกเวลาตั้งแต่ 3 นาที และผล VDOT ในช่วง 15–90 เพื่อแสดงผล</p>}
              <p className="small muted">เพซฝึกเป็นค่าประมาณจากสมการและสัดส่วนการใช้ออกซิเจน ไม่ใช่ตาราง VDOT ทางการของ Jack Daniels ควรปรับตามสภาพจริง</p>
            </section>:<section className="training-tool-card">
              <span className="academy-overline">TRAIN BY EFFORT</span><h3>Heart Rate Zone Calculator</h3>
              <p className="muted">เลือกวิธี %Max HR หรือ Karvonen (%Heart Rate Reserve)</p>
              <div className="training-input-row"><label>อายุ (ปี)<input className="control" type="number" min={12} max={100} value={age} onChange={e=>setAge(clamp(e.target.value,12,100))}/></label>
              <label>Resting HR<input className="control" type="number" min={30} max={150} value={restHr} onChange={e=>setRestHr(clamp(e.target.value,30,150))}/></label></div>
              <label className="field" htmlFor="max-heart">Max HR ที่วัดได้ (ถ้าทราบ)</label>
              <input id="max-heart" className="control" type="number" min={0} max={230} placeholder="เว้นว่างเพื่อใช้ 220 − อายุ" value={maxHrInput||""} onChange={e=>setMaxHrInput(clamp(e.target.value,0,230))}/>
              <div className="training-switch"><button className={hrMethod==="max"?"selected":""} onClick={()=>setHrMethod("max")}>% Max HR</button><button className={hrMethod==="hrr"?"selected":""} onClick={()=>setHrMethod("hrr")}>Karvonen %HRR</button></div>
              {maxHr>=100&&maxHr<=230&&(hrMethod==="max"||restHr<maxHr)?<>
                <div className="training-result"><span>{maxHrInput?"MEASURED":"ESTIMATED"} MAX HR</span><strong>{maxHr}<small> bpm</small></strong><small>{maxHrInput?"ใช้ค่าที่กรอก":"คำนวณ 220 − อายุ (เป็นเพียงค่าประมาณ)"}</small></div>
                {([["Z1","Recovery",.5,.6],["Z2","Easy",.6,.7],["Z3","Aerobic",.7,.8],["Z4","Threshold",.8,.9],["Z5","High intensity",.9,1]] as const).map(([zone,name,low,high])=>
                  <div className="training-zone" key={zone}><div><strong>{zone} · {name}</strong><small>{Math.round(low*100)}–{Math.round(high*100)}% {hrMethod==="hrr"?"HRR":"Max HR"}</small></div><b>{Math.round(hrMethod==="hrr"?restHr+(maxHr-restHr)*low:maxHr*low)}–{Math.round(hrMethod==="hrr"?restHr+(maxHr-restHr)*high:maxHr*high)}<small> bpm</small></b></div>)}
              </>:<p className="muted">กรุณาตรวจสอบค่า Max HR และ Resting HR</p>}
              <p className="small muted">โซนเป็นค่าประมาณ ควรใช้ RPE และ Talk Test ร่วมด้วย ไม่ใช่คำแนะนำทางการแพทย์</p>
            </section>}
            <div className="section-heading"><h3>ตัวอย่างตารางซ้อม</h3><span>WEEKLY PLAN</span></div>
            <p className="muted">ตัวอย่างโครงสร้างสัปดาห์ซ้อม (ไม่ใช่แผนเฉพาะบุคคล)</p>
            {[
              ["MON", "Recovery / Rest"], ["TUE", "Easy Run · 40 min"],
              ["WED", "Strength Training"], ["THU", "Quality Session · RPE guided"],
              ["FRI", "Rest / Mobility"], ["SAT", "Easy Run · 30 min"],
              ["SUN", "Long Run · effort-based"],
            ].map(([day, work]) => (
              <div className="panel" key={day}><span className="pill">{day}</span><h3 style={{ marginTop: 12 }}>{work}</h3></div>
            ))}
          </>
        )}

        {tab === "academy" && (
          <>
            <div className="eyebrow">RUNNING SCIENCE</div>
            <h2>Running Academy</h2>
            <section className="academy-feature">
              <span className="academy-feature-kicker">PACE KNOWLEDGE HUB <span>• 07 LESSONS</span></span>
              <div className="academy-feature-title"><span className="academy-feature-icon"><BookOpen size={25} strokeWidth={1.8} /></span><h3>วิ่งอย่างเข้าใจ<br /><em>พัฒนาอย่างมีเป้าหมาย</em></h3></div>
              <p>เรียนรู้หลักการฝึกที่นำไปใช้ได้จริง ตั้งแต่การสร้างฐานความฟิต ไปจนถึงการเตรียมแข่งขัน</p>
              <div className="academy-feature-tags"><span>TRAIN SMART</span><span>RECOVER WELL</span><span>RACE READY</span></div>
            </section>
            <div className="academy-list-heading"><div><span className="academy-overline">LEARNING PATH</span><h3>บทเรียนทั้งหมด</h3></div><span className="academy-count">7 TOPICS</span></div>
            {academyLessons.map((lesson, index) => {
              const icons = [Activity, Flag, Activity, Activity, CalendarDays, Activity, Flag];
              const LessonIcon = icons[index];
              return (
                <details className="academy-lesson" key={lesson.title}>
                  <summary>
                    <span className="academy-topic-icon"><LessonIcon size={20} strokeWidth={1.8} /></span>
                    <span className="academy-summary-text"><span className="academy-topic-number">LESSON {String(index + 1).padStart(2, "0")}</span><strong>{lesson.title}</strong><small>{lesson.summary}</small></span>
                    <span className="academy-chevron" aria-hidden="true">⌄</span>
                  </summary>
                  <div className="academy-body">
                    <div className="academy-section"><span className="academy-section-heading"><span className="academy-section-dot" />หลักการฝึก</span><p>{lesson.principle}</p></div>
                    <div className="academy-section"><span className="academy-section-heading"><span className="academy-section-dot" />ตัวอย่างเซสชัน</span><p>{lesson.session}</p></div>
                    <div className="academy-section"><span className="academy-section-heading"><span className="academy-section-dot" />ระดับความหนัก</span><p>{lesson.intensity}</p></div>
                    <div className="academy-caution"><strong>ข้อควรระวัง</strong><p>{lesson.caution}</p></div>
                  </div>
                </details>
              );
            })}
            <p className="small muted">คำแนะนำเพื่อการศึกษาทั่วไป ปรับความหนักตามสมรรถภาพและประวัติสุขภาพ หากมีอาการเจ็บหน้าอก หน้ามืด หรือปวดผิดปกติให้หยุดออกกำลังกายและปรึกษาบุคลากรทางการแพทย์</p>
          </>
        )}

        {tab === "profile" && (
          <>
            <div className="eyebrow">RUNNER PROFILE</div>
            <h2>My Progress</h2>
            <div className="panel"><h3>Welcome, Runner!</h3><p className="muted">บัญชีผู้ใช้และบันทึกกิจกรรมจะเพิ่มใน Phase 2</p></div>
            <div className="panel">
              <h3>Race Time Predictor</h3>
              <label className="field" htmlFor="known-distance">ผลการแข่งขันล่าสุด</label>
              <select id="known-distance" className="control" value={knownDistance} onChange={(e) => setKnownDistance(Number(e.target.value))}>
                {distances.map((d) => <option value={d.km} key={d.km}>{d.label}</option>)}
              </select>
              <label className="field">เวลาที่ทำได้ (ชั่วโมง : นาที : วินาที)</label>
              <div className="wheel-grid three predictor-wheels">
                <NumberWheel label="ชั่วโมง" value={knownHours} max={23} onChange={setKnownHours} />
                <NumberWheel label="นาที" value={knownMinutes} max={59} onChange={setKnownMinutes} />
                <NumberWheel label="วินาที" value={knownSeconds} max={59} onChange={setKnownSeconds} />
              </div>
              <p className="muted">Predicted Marathon</p>
              <div className="metric lime">{knownHours * 3600 + knownMinutes * 60 + knownSeconds > 0 ? formatTime(predictTime(knownHours * 3600 + knownMinutes * 60 + knownSeconds, knownDistance, 42.195)) : "—"}</div>
              <p className="small muted">Riegel estimate; actual results depend on training, conditions and endurance.</p>
            </div>
          </>
        )}
      </main>
      <nav className="nav" aria-label="Main navigation">
        {navigation.map(({ id, icon: Icon, label }) => (
          <button key={id} className={tab === id ? "active" : ""} onClick={() => changeTab(id)} aria-current={tab === id ? "page" : undefined}>
            <Icon size={19} />{label}
          </button>
        ))}
      </nav>
    </>
  );
}
