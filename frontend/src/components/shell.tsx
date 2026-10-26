"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Activity, AudioWaveform, BarChart3, BrainCircuit, FileText, LayoutDashboard, MessageSquareText, Settings2, ShieldCheck, Sparkles, UploadCloud, GitCompareArrows } from "lucide-react";
import { ReactNode } from "react";

const links = [
  {href:"/", label:"Overview", icon:LayoutDashboard},
  {href:"/analyze", label:"Live analysis", icon:BrainCircuit, tag:"AI"},
  {href:"/feedback", label:"Feedback explorer", icon:MessageSquareText},
  {href:"/insights", label:"Insight engine", icon:Sparkles},
  {href:"/reports", label:"Reports & exports", icon:FileText},
  {href:"/models", label:"Model lab", icon:GitCompareArrows, tag:"ML"},
];

export function Shell({children}:{children:ReactNode}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  return <div className="app-shell">
    <aside className="sidebar">
      <Link href="/" className="brand">
        <span className="brand-mark"><AudioWaveform size={22}/></span>
        <span><strong className="brand-name">student-feedback-analyzer</strong></span>
      </Link>
      <div className="workspace"><span className="workspace-dot"/> CAMPUS SIGNAL LAB <span className="workspace-chevron">⌄</span></div>
      <div className="nav-label">WORKSPACE</div>
      <nav className="nav-list">{links.map(({href,label,icon:Icon,tag})=>{
        const active = pathname === href;
        return <Link key={href} href={href} className={`nav-link ${active?"active":""}`}><Icon size={17}/><span>{label}</span>{tag&&<i>{tag}</i>}{active&&<motion.span layoutId="nav-active" className="nav-active"/>}</Link>
      })}</nav>
      <div className="sidebar-spacer"/>
      <div className="privacy-card"><div className="privacy-icon"><ShieldCheck size={17}/></div><div><strong>Privacy by design</strong><p>Signals, not student labels. Review before acting.</p></div></div>
      <div className="nav-footer"><Settings2 size={16}/><span>Workspace settings</span><span className="status-dot"/></div>
      <div className="sidebar-version">student-feedback-analyzer <span>v1.0</span></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{links.find(x=>x.href===pathname)?.label || "Workspace"}</strong></div>
        <div className="top-actions"><span className="live-indicator"><i/> API CONNECTED</span><div className="top-avatar">S</div></div>
      </header>
      <div className="page-content">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            className="route-transition"
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(3px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -5, filter: "blur(2px)" }}
            transition={{ duration: reduceMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >{children}</motion.div>
        </AnimatePresence>
      </div>
      <footer className="app-footer"><span>◈ student-feedback-analyzer</span><span>Human judgement stays in the loop.</span></footer>
    </main>
  </div>;
}
