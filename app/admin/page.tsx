import { redirect } from "next/navigation";
import { Activity, ArrowDownRight, ArrowUpRight, BarChart3, CalendarDays, ExternalLink, Globe2, Laptop2, LayoutDashboard, LockKeyhole, MousePointer2, RefreshCw, Smartphone, Users, Zap } from "lucide-react";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAnalytics, type MetricRow } from "@/lib/admin-analytics";

export const dynamic = "force-dynamic";
const nf = new Intl.NumberFormat("en-US");
const fmt = (value: number | null) => value === null ? "—" : nf.format(value);
const dashboard = "https://vercel.com/hatori013-8433s-projects/pace-running-app/analytics";

function Breakdown({ title, subtitle, items, kind }: { title: string; subtitle: string; items: MetricRow[]; kind?: "percent" }) {
  const max = Math.max(1, ...items.map(item => item.views));
  const total = items.reduce((sum, item) => sum + item.views, 0);
  return <section className="admin-v2-panel">
    <div className="admin-v2-panel-head"><div><h2>{title}</h2><p>{subtitle}</p></div><span className="admin-v2-pill">TOP {items.length || 0}</span></div>
    {items.length ? <div className="admin-v2-breakdown">{items.map((item, i) => <div className="admin-v2-breakdown-row" key={item.name + i}>
      <div className="admin-v2-breakdown-label"><span title={item.name}>{item.name}</span><strong>{kind === "percent" ? (total ? (item.views / total * 100).toFixed(1) + "%" : "—") : nf.format(item.views)}</strong></div>
      <div className="admin-v2-track"><div style={{ width: (item.views / max * 100) + "%" }} /></div>
    </div>)}</div> : <p className="admin-v2-empty">ยังไม่มีข้อมูลที่ยืนยันได้สำหรับหมวดนี้</p>}
  </section>;
}

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
  const params = await searchParams;
  const days = [7, 30, 90].includes(Number(params.days)) ? Number(params.days) : 30;
  const data = await getAnalytics(days);
  const max = Math.max(1, ...data.trend.map(row => row.views));
  const metricCards = [
    { title: "Page Views", value: data.views, icon: <MousePointer2 size={19}/>, note: "ยอดเปิดหน้าเว็บ" },
    { title: "Visitors", value: data.visitors, icon: <Users size={19}/>, note: "ผู้เข้าชมไม่ซ้ำตามนิยาม Vercel" },
    { title: "Top Pages", value: data.pages.length || null, icon: <LayoutDashboard size={19}/>, note: "จำนวนหน้าที่มีข้อมูลในอันดับต้น" },
    { title: "Traffic Sources", value: data.sources.length || null, icon: <Globe2 size={19}/>, note: "แหล่งที่มาที่ตรวจพบ" },
  ];
  return <main className="admin-v2">
    <div className="admin-v2-shell">
      <aside className="admin-v2-sidebar">
        <a className="admin-v2-logo" href="/"><span className="admin-v2-logo-icon"><Activity size={24}/></span><span>PACE <small>ADMIN CONSOLE</small></span></a>
        <div className="admin-v2-nav-label">WORKSPACE</div>
        <div className="admin-v2-nav-active"><LayoutDashboard size={18}/> Overview</div>
        <a href={dashboard} target="_blank" rel="noopener noreferrer"><BarChart3 size={18}/> Vercel Analytics <ExternalLink size={13}/></a>
        <div className="admin-v2-nav-label">MANAGEMENT</div>
        <a href="/" target="_blank" rel="noopener noreferrer"><Zap size={18}/> Open PACE <ExternalLink size={13}/></a>
        <div className="admin-v2-sidebar-bottom"><div className="admin-v2-security"><LockKeyhole size={16}/> Protected Admin Session</div><form method="post" action="/api/admin/logout"><button type="submit">Sign out →</button></form></div>
      </aside>
      <div className="admin-v2-content">
        <header className="admin-v2-top"><div><span className="admin-v2-eyebrow">ANALYTICS / OVERVIEW</span><h1>Website Overview</h1><p>ภาพรวมการเข้าชมและประสิทธิภาพเว็บไซต์ PACE</p></div><div className="admin-v2-top-actions"><span className="admin-v2-live"><i/> {data.available ? "Live source connected" : "Data unavailable"}</span><a href={"/admin?days=" + days} className="admin-v2-refresh"><RefreshCw size={15}/> Refresh</a></div></header>
        <div className={"admin-v2-status " + (data.available ? "admin-v2-status-ok" : "admin-v2-status-warn")}>
          <span>{data.available ? "ข้อมูลจาก Vercel Analytics API" : "ยังไม่สามารถอ่านข้อมูล Vercel Analytics ผ่าน API ได้"}</span>
          <small>{data.reason || (data.fetchedAt ? "อัปเดตล่าสุด " + new Date(data.fetchedAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" }) : "")}</small>
          <a href={dashboard} target="_blank" rel="noopener noreferrer">View in Vercel ↗</a>
        </div>
        <div className="admin-v2-toolbar"><span><CalendarDays size={17}/> Reporting period</span><nav aria-label="ช่วงเวลารายงาน">{[7,30,90].map(d => <a key={d} href={"/admin?days=" + d} className={days === d ? "active" : ""}>{d} Days</a>)}</nav></div>
        <div className="admin-v2-kpis">{metricCards.map(card => <section className="admin-v2-kpi" key={card.title}><div className="admin-v2-kpi-top"><span>{card.title}</span><span className="admin-v2-kpi-icon">{card.icon}</span></div><strong>{fmt(card.value)}</strong><small>{card.note}</small></section>)}</div>
        <section className="admin-v2-panel admin-v2-trend"><div className="admin-v2-panel-head"><div><h2>Traffic Overview</h2><p>Page views by day · Last {days} days</p></div><span className="admin-v2-pill">PAGE VIEWS</span></div>
          {data.trend.length ? <div className="admin-v2-bars" role="img" aria-label="กราฟยอดเปิดหน้าเว็บรายวัน">{data.trend.map((row,i) => <div key={row.date+i} className="admin-v2-bar-col" title={row.date + ": " + nf.format(row.views) + " views"}><span style={{height: Math.max(2, row.views/max*100)+"%"}}/><small>{data.trend.length <= 14 || i % Math.ceil(data.trend.length/8) === 0 ? row.date.slice(5,10) : ""}</small></div>)}</div> : <div className="admin-v2-chart-empty"><BarChart3 size={30}/><strong>No verified traffic series</strong><p>เมื่อ Analytics API ส่งข้อมูลรายวัน กราฟจะปรากฏอัตโนมัติ</p></div>}
        </section>
        <div className="admin-v2-grid">
          <Breakdown title="Top Pages" subtitle="หน้าเว็บที่มีผู้เข้าชมมากที่สุด" items={data.pages}/>
          <Breakdown title="Traffic Sources" subtitle="Referrer domains" items={data.sources}/>
          <Breakdown title="Countries" subtitle="ภูมิศาสตร์ของผู้เข้าชม" items={data.countries}/>
          <Breakdown title="Devices" subtitle="ประเภทอุปกรณ์" items={data.devices} kind="percent"/>
          <Breakdown title="Browsers" subtitle="เบราว์เซอร์ที่ใช้งาน" items={data.browsers} kind="percent"/>
          <section className="admin-v2-panel"><div className="admin-v2-panel-head"><div><h2>Feature Adoption</h2><p>การใช้งานฟีเจอร์ภายใน PACE</p></div><Zap size={19}/></div><div className="admin-v2-feature-list">{["Pace Calculator","Race Splits","Training Planner","VDOT Calculator","Heart Rate Zones","Running Academy","Race Predictor","Strava Connect"].map(label=><div key={label}><span>{label}</span><span>{data.features.find(item => item.name === label)?.events.toLocaleString("en-US") ?? "—"}</span></div>)}</div><p className="admin-v2-feature-note">เริ่มนับการเปิดฟีเจอร์และการกดเชื่อมต่อหลังติดตั้ง Tracking เท่านั้น ไม่มีข้อมูลย้อนหลัง หากยังแสดง — หมายถึง API ยังไม่มีข้อมูลที่ยืนยันได้</p></section>
        </div>
        <footer className="admin-v2-footer"><span>PACE ADMIN · KRIT.DEV</span><span>Source: Vercel Web Analytics · No simulated data</span></footer>
      </div>
    </div>
  </main>;
}
