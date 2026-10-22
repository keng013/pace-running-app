"use client";

import { useRef, useState } from "react";
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

function NumberWheel({ label, value, max, onChange }: NumberWheelProps) {
  const touchStart = useRef<number | null>(null);
  const wheelDelta = useRef(0);
  const move = (steps: number) => onChange(Math.max(0, Math.min(max, value + steps)));
  return (
    <div className="number-wheel-group">
      <span className="field">{label}</span>
      <div
        className="number-wheel"
        role="spinbutton"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
          if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
          if (e.key === "PageUp") { e.preventDefault(); move(-5); }
          if (e.key === "PageDown") { e.preventDefault(); move(5); }
        }}
        onWheel={(e) => {
          wheelDelta.current += e.deltaY;
          if (Math.abs(wheelDelta.current) >= 24) {
            move(wheelDelta.current > 0 ? 1 : -1);
            wheelDelta.current = 0;
          }
        }}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (touchStart.current === null) return;
          const distance = touchStart.current - e.changedTouches[0].clientY;
          if (Math.abs(distance) > 12) move(Math.round(distance / 36) || (distance > 0 ? 1 : -1));
          touchStart.current = null;
        }}
      >
        <button type="button" className="wheel-neighbor" disabled={value === 0} onClick={() => move(-1)} aria-label={`ลด${label}`}>
          {value > 0 ? String(value - 1).padStart(2, "0") : " "}
        </button>
        <div className="wheel-selected">{String(value).padStart(2, "0")}</div>
        <button type="button" className="wheel-neighbor" disabled={value === max} onClick={() => move(1)} aria-label={`เพิ่ม${label}`}>
          {value < max ? String(value + 1).padStart(2, "0") : " "}
        </button>
      </div>
    </div>
  );
}

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
  const [knownMinutes, setKnownMinutes] = useState(55);

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
      <main className="shell">
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
            {[
              ["Easy Run", "ฝึกความทนทานแอโรบิกด้วยความหนักที่ยังพูดเป็นประโยคได้"],
              ["Long Run", "เพิ่มความทนทานอย่างค่อยเป็นค่อยไป และให้ความสำคัญกับการฟื้นตัว"],
              ["Tempo & Threshold", "เรียนรู้ความหนักระดับ Threshold และวิธีประเมินด้วย RPE"],
              ["Intervals", "ซ้อมสลับช่วงหนักและพัก โดยปรับตามระดับสมรรถภาพ"],
              ["Strength & Recovery", "ฝึกความแข็งแรงและจัดวันพักให้เหมาะสม"],
            ].map(([title, body]) => (
              <div className="panel" key={title}><h3>{title}</h3><p className="muted">{body}</p></div>
            ))}
            <p className="small muted">เนื้อหาเพื่อการศึกษา ควรเพิ่มการทบทวนหลักฐานและเอกสารอ้างอิงก่อนเผยแพร่ฉบับสมบูรณ์</p>
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
              <label className="field" htmlFor="known-minutes">เวลาที่ทำได้ (นาที)</label>
              <input id="known-minutes" className="control" type="number" min={1} value={knownMinutes} onChange={(e) => setKnownMinutes(Math.max(1, Number(e.target.value) || 1))} />
              <p className="muted">Predicted Marathon</p>
              <div className="metric lime">{formatTime(predictTime(knownMinutes * 60, knownDistance, 42.195))}</div>
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
