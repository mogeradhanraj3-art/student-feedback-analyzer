"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowUpRight, CheckCircle2, Compass, Lightbulb, Radar, RefreshCw, Sparkles, Target } from "lucide-react";
import { api } from "@/lib/api";
import { PageHeading, Panel, EmptyState } from "@/components/ui";

export default function InsightsPage(){
 const [data,setData]=useState<any>(null);const [error,setError]=useState("");
 async function load(){try{setData(await api.insights());setError("");}catch(e:any){setError(e.message);}}
 useEffect(()=>{load();},[]);
 return <div>
  <PageHeading eyebrow="Insight engine / 04" title={<>From comments to<br/><span className="text-acid">clear next moves.</span></>} description="A transparent, rule-based decision-support layer. It surfaces repeated themes and aspects worth human review, without pretending correlation is causation." action={<button className="btn btn-ghost" onClick={load}><RefreshCw size={13}/> Refresh insights</button>}/>
  {error&&<div className="error-box">{error}</div>}
  <div className="report-hero"><div><div className="eyebrow" style={{marginBottom:13}}><span className="eyebrow-line"/> SIGNAL BRIEF</div><h2>{data?.headline||"Mapping the student experience…"}</h2><p>Use these signals to decide what deserves a closer look. Recommendations are heuristics based on detected aspect sentiment and recurring keyword themes, not automated decisions.</p></div><div className="report-mark"><Radar size={28}/></div></div>
  <div className="grid dashboard-bottom-grid">
   <Panel title="Review queue" subtitle="Suggested human follow-ups, ordered by heuristic priority">
    {data?.recommendations?.length?<div className="grid" style={{gap:10}}>{data.recommendations.map((r:any,i:number)=><div className="insight-card" key={i}><div className="insight-symbol">{r.priority==="high"?<AlertTriangle size={16}/>:r.priority==="medium"?<Target size={16}/>:<Lightbulb size={16}/>}</div><div style={{flex:1}}><div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"start"}}><h4>{r.title}</h4><span className={`priority ${r.priority}`}>{r.priority} priority</span></div><p>{r.detail}</p><div className="insight-evidence">{r.evidence}</div></div></div>)}</div>:<EmptyState title="No recommendations yet" detail="Analyze or import feedback to generate review suggestions."/>}
   </Panel>
   <Panel title="Recurring themes" subtitle="Keyword-driven theme counts across the current ledger">
    {data?.top_issues?.length?<div className="aspect-list">{data.top_issues.map((x:any,i:number)=><div key={x.theme} style={{display:"grid",gridTemplateColumns:"22px 1fr auto",gap:10,alignItems:"center"}}><span style={{font:"10px DM Mono",color:"#5d6b5c"}}>{String(i+1).padStart(2,"0")}</span><div><div style={{fontSize:10,color:"#c1cbbf",marginBottom:7}}>{x.theme}</div><div className="aspect-track"><i className="aspect-pos" style={{width:`${Math.max(4,x.mentions/Math.max(...data.top_issues.map((a:any)=>a.mentions))*100)}%`}}/></div></div><span style={{font:"10px DM Mono",color:"#c7ff4a"}}>{x.mentions}</span></div>)}</div>:<EmptyState title="No recurring themes yet" detail="The theme radar wakes up when feedback enters the ledger."/>}
   <div className="callout" style={{marginTop:18}}><strong>Method note</strong><br/>Theme detection is a transparent keyword pass. It may miss synonyms, context, sarcasm, and issues outside the current vocabulary.</div>
   </Panel>
  </div>
  <Panel title="Aspect sentiment map" subtitle="Counts reflect detected aspect mentions, not the number of unique students">
   {data?.aspect_summary?.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Aspect</th><th>Positive signals</th><th>Negative signals</th><th>Mixed / unclear</th><th>Review note</th></tr></thead><tbody>{data.aspect_summary.map((a:any)=><tr key={a.aspect}><td className="feedback-cell">{a.aspect}</td><td style={{color:"#c7ff4a"}}>{a.positive||0}</td><td style={{color:"#ff8585"}}>{a.negative||0}</td><td>{a["mixed/unclear"]||0}</td><td>{(a.negative||0)>=(a.positive||0)?"Validate recent examples":"Continue monitoring"}</td></tr>)}</tbody></table></div>:<EmptyState title="No aspect data" detail="The map will appear after aspect mentions are detected."/>}
  </Panel>
  <div className="callout" style={{marginTop:15}}><strong><CheckCircle2 size={13} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>Responsible use rule</strong><br/>Prioritize system-level improvements and student support. Do not use this tool as a sole basis for disciplinary action, faculty evaluation, or decisions about an individual.</div>
 </div>;
}
