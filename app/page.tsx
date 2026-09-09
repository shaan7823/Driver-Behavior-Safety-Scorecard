"use client";

import { useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BadgeCheck, Bell, CarFront,
  ChevronDown, CircleHelp, Clock3, Gauge, GitBranch, MapPin, Menu,
  MoreHorizontal, Navigation, OctagonAlert, Play, Route, Settings2,
  ShieldCheck, Sparkles, Upload, Users, Zap
} from "lucide-react";

const events = [
  { time: "08:42:18", type: "Hard brake", detail: "-0.41 g deceleration", severity: "Moderate", color: "coral", icon: ArrowDownRight },
  { time: "08:49:03", type: "Sharp turn", detail: "0.36 g lateral force", severity: "Mild", color: "amber", icon: GitBranch },
  { time: "08:55:27", type: "Speeding", detail: "68 mph in a 55 mph zone", severity: "Moderate", color: "violet", icon: Gauge },
  { time: "09:04:51", type: "Hard brake", detail: "-0.48 g deceleration", severity: "Severe", color: "coral", icon: ArrowDownRight },
];

const trend = [56, 61, 59, 67, 64, 72, 74, 78, 76, 84, 82, 86];
const bars = [28, 35, 30, 44, 39, 55, 47, 63, 58, 72, 66, 76, 69, 81, 73, 65, 77, 70, 84, 78, 88, 80, 91, 85, 75, 82, 72, 78, 70, 74, 66, 72, 64, 70, 58, 63, 55, 60, 48, 52, 45, 50, 42, 47, 40, 45, 38, 43, 35, 40, 33, 38, 31, 35, 29, 33, 27, 31, 25, 28, 23, 27, 21, 25];

function ScoreRing({ score }: { score: number }) {
  return <div className="score-ring" style={{ "--score": `${score * 3.6}deg` } as React.CSSProperties}><div className="score-ring-inner"><strong>{score}</strong><span>/ 100</span></div></div>;
}

function SignalChart() {
  return <div className="signal-chart" aria-label="Speed and driving event timeline">
    <div className="chart-y-labels"><span>80</span><span>60</span><span>40</span><span>20</span><span>0</span></div>
    <div className="chart-grid">
      <div className="grid-line line-1" /><div className="grid-line line-2" /><div className="grid-line line-3" /><div className="grid-line line-4" />
      <svg viewBox="0 0 900 220" preserveAspectRatio="none" className="chart-svg">
        <defs><linearGradient id="area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#6c7cff" stopOpacity=".24"/><stop offset="1" stopColor="#6c7cff" stopOpacity="0"/></linearGradient></defs>
        <path d="M0 170 C35 168 43 138 76 142 S113 112 145 125 S179 95 213 108 S255 87 287 96 S322 132 350 118 S389 84 420 92 S461 68 490 77 S520 104 551 88 S590 67 617 74 S654 48 684 56 S720 86 749 67 S790 43 821 55 S856 77 900 35 L900 220 L0 220Z" fill="url(#area)"/>
        <path d="M0 170 C35 168 43 138 76 142 S113 112 145 125 S179 95 213 108 S255 87 287 96 S322 132 350 118 S389 84 420 92 S461 68 490 77 S520 104 551 88 S590 67 617 74 S654 48 684 56 S720 86 749 67 S790 43 821 55 S856 77 900 35" fill="none" stroke="#7180ff" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="213" cy="108" r="5" fill="#ff786b" stroke="#fff" strokeWidth="3"/><circle cx="490" cy="77" r="5" fill="#e8ad50" stroke="#fff" strokeWidth="3"/><circle cx="684" cy="56" r="5" fill="#9a7bff" stroke="#fff" strokeWidth="3"/><circle cx="821" cy="55" r="5" fill="#ff786b" stroke="#fff" strokeWidth="3"/>
      </svg>
      <div className="event-tag tag-one"><span />Brake</div><div className="event-tag tag-two"><span />Turn</div><div className="event-tag tag-three"><span />Speed</div>
      <div className="chart-times"><span>08:30</span><span>08:45</span><span>09:00</span><span>09:15</span><span>09:30</span></div>
    </div>
    <div className="chart-legend"><span><i className="legend-speed" />Speed</span><span><i className="legend-event" />Detected event</span><span className="chart-unit">mph</span></div>
  </div>;
}

function RouteMap() {
  return <div className="route-map">
    <div className="map-topo topo-a"/><div className="map-topo topo-b"/><div className="map-road road-one"/><div className="map-road road-two"/><div className="map-road road-three"/>
    <svg className="route-line" viewBox="0 0 500 300" preserveAspectRatio="none"><path d="M-10 245 C70 225 53 159 126 180 S192 229 230 179 S281 78 337 117 S401 177 520 40" fill="none" stroke="#7b85ff" strokeWidth="8" strokeLinecap="round"/><path d="M-10 245 C70 225 53 159 126 180 S192 229 230 179 S281 78 337 117 S401 177 520 40" fill="none" stroke="#c5cbff" strokeWidth="2" strokeDasharray="2 8"/></svg>
    <div className="map-pin start"><Navigation size={13} fill="currentColor" /></div><div className="map-pin end"><MapPin size={15} fill="currentColor" /></div><div className="map-event event-a"><ArrowDownRight size={12}/></div><div className="map-event event-b"><GitBranch size={12}/></div><div className="map-event event-c"><Gauge size={12}/></div>
    <div className="map-label map-start">Start · 08:30</div><div className="map-label map-end">Home · 09:24</div>
    <div className="map-controls"><button aria-label="Zoom in">+</button><button aria-label="Zoom out">−</button></div>
    <div className="map-legend"><span><i className="dot coral"/>Brake</span><span><i className="dot violet"/>Speed</span><span><i className="dot amber"/>Turn</span></div>
  </div>;
}

export default function Dashboard() {
  const [active, setActive] = useState("Overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [live, setLive] = useState(false);
  const nav = [{ label: "Overview", icon: Activity }, { label: "Trip history", icon: Route }, { label: "Trends", icon: GitBranch }];
  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><ShieldCheck size={20}/></div><span>drivewise</span></div>
      <div className="workspace-switch"><div className="avatar">MS</div><div><strong>Muhammed Shaan</strong><small>Personal account</small></div><ChevronDown size={15}/></div>
      <nav className="main-nav">{nav.map(({ label, icon: Icon }) => <button key={label} className={active === label ? "nav-item active" : "nav-item"} onClick={() => setActive(label)}><Icon size={18}/><span>{label}</span>{label === "Trip history" && <em>12</em>}</button>)}</nav>
      <div className="nav-section-label">Your goals</div><div className="goal-card"><div className="goal-top"><span>Weekly goal</span><strong>4 / 5 trips</strong></div><div className="goal-progress"><span /></div><p>One more thoughtful drive to go.</p></div>
      <div className="sidebar-bottom"><button className="nav-item"><Settings2 size={18}/><span>Settings</span></button><button className="nav-item"><CircleHelp size={18}/><span>Help center</span></button><div className="pro-card"><Sparkles size={18}/><strong>Drive a little wiser</strong><p>See your progress and build better habits.</p><button>Explore insights <ArrowUpRight size={14}/></button></div></div>
    </aside>
    <section className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20}/></button><div className="breadcrumb"><span>Overview</span><span>/</span><strong>Today</strong></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={18}/><i /></button><button className="help-button"><CircleHelp size={16}/> Support</button><div className="mini-avatar">MS</div></div></header>
      <div className="content-wrap">
        <div className="page-heading"><div><p className="eyebrow">Wednesday, October 18, 2023 <span className="live-dot" /> Synced just now</p><h1>Good morning, Muhammed Shaan.</h1><p className="heading-sub">Here is how your driving is looking. Small choices, safer miles.</p></div><div className="heading-actions"><label className="date-select"><Clock3 size={16}/><span>Oct 18, 2023</span><ChevronDown size={15}/><input type="file" accept=".csv,.json" onChange={() => undefined}/></label><button className="upload-button"><Upload size={16}/> Upload trip</button></div></div>
        <div className="mode-strip"><div className="mode-copy"><div className="mode-icon"><Zap size={16}/></div><div><strong>{live ? "Live capture is on" : "Want feedback as you drive?"}</strong><span>{live ? "Phone sensors are ready to record your next trip." : "Turn on live mode to use your phone sensors."}</span></div></div><button className={live ? "toggle on" : "toggle"} onClick={() => setLive(!live)} aria-label="Toggle live mode"><span /></button><span className="mode-label">{live ? "On" : "Off"}</span></div>
        <div className="metric-grid"><div className="score-card panel"><div className="card-heading"><span>Safety score</span><button aria-label="More score options"><MoreHorizontal size={18}/></button></div><div className="score-main"><ScoreRing score={82}/><div><div className="score-grade">A- <span>Great drive</span></div><p>Top 24% of drivers this week <ArrowUpRight size={14}/></p></div></div><div className="score-footer"><span><ArrowUpRight size={14}/> 6 points from last trip</span><small>Updated after your last trip</small></div></div><div className="panel stats-card"><div className="card-heading"><span>Today at a glance</span><span className="muted">1 trip</span></div><div className="stat-list"><div><div className="stat-icon blue"><Route size={16}/></div><span>Distance<strong>38.4 mi</strong></span><small>+ 12% vs avg.</small></div><div><div className="stat-icon green"><Clock3 size={16}/></div><span>Drive time<strong>54 min</strong></span><small>8:30 – 9:24 AM</small></div><div><div className="stat-icon orange"><OctagonAlert size={16}/></div><span>Events<strong>4 detected</strong></span><small className="warning-text">2 need attention</small></div></div></div><div className="panel streak-card"><div className="card-heading"><span>Safe streak</span><BadgeCheck size={18} className="green-icon"/></div><div className="streak-number">7 <span>days</span></div><p>Best streak: 12 days <ArrowUpRight size={14}/></p><div className="streak-days">{["M","T","W","T","F","S","S"].map((d, i) => <span key={i} className={i < 5 ? "done" : i === 5 ? "today" : ""}>{i < 5 ? "✓" : d}</span>)}</div></div></div>
        <div className="dashboard-grid"><div className="panel chart-panel"><div className="section-heading"><div><h2>Trip performance</h2><p>Today · <strong>38.4 miles</strong> · 54 minutes</p></div><button className="small-select">Speed <ChevronDown size={14}/></button></div><SignalChart /></div><div className="panel map-panel"><div className="section-heading"><div><h2>Route overview</h2><p>Home to Downtown</p></div><button className="expand-button" aria-label="Expand map"><ArrowUpRight size={16}/></button></div><RouteMap /></div></div>
        <div className="lower-grid"><div className="panel events-panel"><div className="section-heading"><div><h2>Events to review</h2><p>4 signals detected on this trip</p></div><button className="text-button">View all <ArrowUpRight size={14}/></button></div><div className="events-list">{events.map(({ time, type, detail, severity, color, icon: Icon }) => <div className="event-row" key={time}><div className={`event-icon ${color}`}><Icon size={15}/></div><div className="event-copy"><strong>{type}</strong><span>{detail}</span></div><time>{time}</time><span className={`severity ${color}`}>{severity}</span><button className="row-more" aria-label={`More about ${type}`}><MoreHorizontal size={16}/></button></div>)}</div></div><div className="panel tips-panel"><div className="section-heading"><div><h2>Next best habits</h2><p>Personalized from this trip</p></div><Sparkles size={18} className="sparkle"/></div><div className="tip"><div className="tip-number">01</div><div><strong>Leave a little more space</strong><p>Two hard brakes today. A 3-second following distance gives you more room to respond.</p></div></div><div className="tip"><div className="tip-number">02</div><div><strong>Keep an eye on the limit</strong><p>You spent 4 minutes above the posted speed. Cruise control can help on open roads.</p></div></div><button className="all-tips">See all driving insights <ArrowUpRight size={14}/></button></div></div>
        <div className="history-strip"><div><span className="history-icon"><Users size={17}/></span><div><strong>Your score is trending up</strong><p>+18 points over your last 5 trips. You are building a good rhythm.</p></div></div><div className="mini-trend">{trend.map((height, i) => <span key={i} style={{ height: `${height}%` }} className={i === trend.length - 1 ? "last" : ""} />)}</div><button className="text-button">See trends <ArrowUpRight size={14}/></button></div>
        <footer className="page-footer"><span><ShieldCheck size={14}/> Your data stays private and secure</span><span>Drivewise v1.0 · <button>Privacy</button> · <button>Terms</button></span></footer>
      </div>
    </section>
  </main>;
}
