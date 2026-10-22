"use client";

import { useState } from "react";
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
          <span className="logo" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Image src="/pace-mark.svg" alt="PACE runner logo" width={36} height={36} className="logo-bounce" />
            P<span className="lime">A</span>CE
            <span className="small muted"> / KRIT.DEV</span>
          </span>
          <Activity color="#cbfa58" className="pulse-icon" />
        </header>

        {tab === "home" && (
          <>
            <div className="hero-art" aria-hidden="true">
              <div className="track track-one" />
              <div className="track track-two" />
              <div className="runner-glow">
                <Image src="/pace-mark.svg" alt="" width={76} height={76} priority />
              </div>
              <div className="hero-art-label">EVERY STEP COUNTS <span>↗</span></div>
            </div>
            <div className="eyebrow">YOUR RUNNING COMPANION</div>
            <h1 className="hero">Every pace.<br /><span className="lime">Every progress.</span></h1>
            <p className="muted">คำนวณเพซ วางแผนการซ้อม และวิ่งสู่เป้าหมายของคุณ</p>
            <section className="panel">
              <span className="eyebrow">YOUR TARGET</span>
              <h2 style={{ marginTop: 12 }}>Half Marathon</h2>
              <div className="metric lime">{valid ? formatTime(time) : "—"}</div>
              <p className="muted">Target pace {valid ? formatPace(pace) : "—"} /km</p>
              <button className="action" onClick={() => changeTab("calculator")}>Calculate Your Pace →</button>
            </section>
            <div className="grid">
              <button className="tile" onClick={() => changeTab("training")}>TRAINING<strong>Plans →</strong></button>
              <button className="tile" onClick={() => changeTab("academy")}>LEARN<strong>Academy →</strong></button>
            </div>
          </>
        )}

        {tab === "calculator" && (
          <>
            <div className="eyebrow">PACE TOOLS</div>
            <h2>Pace Calculator</h2>
            <div className="panel">
              <label className="field" htmlFor="distance">ระยะทาง</label>
              <select id="distance" className="control" value={distance} onChange={(e) => setDistance(Number(e.target.value))}>
                {distances.map((d) => <option key={d.km} value={d.km}>{d.label}</option>)}
              </select>
              <label className="field">วิธีคำนวณ</label>
              <div className="grid">
                <button type="button" className={mode === "pace" ? "action" : "control"} onClick={() => setMode("pace")}>จาก Pace เฉลี่ย</button>
                <button type="button" className={mode === "finish" ? "action" : "control"} onClick={() => setMode("finish")}>จากเวลาจบ</button>
              </div>
              {mode === "pace" ? (
                <>
                  <label className="field">Pace เฉลี่ย (นาที : วินาที / กม.)</label>
                  <div className="grid">
                    <div>
                      <label className="field" htmlFor="pace-min">นาที</label>
                      <input id="pace-min" className="control" type="number" min={0} max={59} value={minutes} onChange={(e) => setMinutes(clamp(e.target.value, 0, 59))} />
                    </div>
                    <div>
                      <label className="field" htmlFor="pace-sec">วินาที</label>
                      <input id="pace-sec" className="control" type="number" min={0} max={59} value={seconds} onChange={(e) => setSeconds(clamp(e.target.value, 0, 59))} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <label className="field">เวลาที่ต้องการวิ่งจบ</label>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
                    <div>
                      <label className="field" htmlFor="finish-hours">ชั่วโมง</label>
                      <input id="finish-hours" className="control" type="number" min={0} max={99} value={hours} onChange={(e) => setHours(clamp(e.target.value, 0, 99))} />
                    </div>
                    <div>
                      <label className="field" htmlFor="finish-minutes">นาที</label>
                      <input id="finish-minutes" className="control" type="number" min={0} max={59} value={finishMinutes} onChange={(e) => setFinishMinutes(clamp(e.target.value, 0, 59))} />
                    </div>
                    <div>
                      <label className="field" htmlFor="finish-seconds">วินาที</label>
                      <input id="finish-seconds" className="control" type="number" min={0} max={59} value={finishSecs} onChange={(e) => setFinishSecs(clamp(e.target.value, 0, 59))} />
                    </div>
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
