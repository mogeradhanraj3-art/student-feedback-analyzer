"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowRight, ArrowUpRight, BrainCircuit, ChartNoAxesCombined, CircleAlert, Download, FileText, MessageSquareText, ShieldCheck, Sparkles, Target, UploadCloud, Zap } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, AreaChart, Area } from "recharts";
import { api } from "@/lib/api";
import { EmptyState, MetricCard, PageHeading, Panel, SentimentPill, UrgencyPill } from "@/components/ui";

const COLORS = ["#c7ff4a","#84b8ff","#ff7676"];
const tipStyle = {background:"#101410",border:"1px solid #303830",borderRadius:8,color:"#e9eee7",fontSize:10};

export default function DashboardPage() {
 const [data,setData] = useState<any>(null); const [error,setError] = useState("");
 useEffect(()=>{api.dashboard().then(setData).catch(e=>setError(e.message));},[]);
 const total = data?.total ?? 0;
 const counts = data?.sentiment_counts ?? {positive:0,neutral:0,negative:0};
 const pieData = [{name:"Positive",value:counts.positive,color:COLORS[0]},{name:"Neutral",value:counts.neutral,color:COLORS[1]},{name:"Negative",value:counts.negative,color:COLORS[2]}];
 const trend = data?.trend ?? [];
 const aspects = data?.aspects ?? [];
 return <div>
  <PageHeading eyebrow="Signal intelligence / 01" title={<>Read the room.<br/><span className="text-acid">Change the experience.</span></>} description="A live command center for student voice. Find the patterns buried in feedback, surface what matters, and turn signals into better decisions." action={<><Link className="btn btn-ghost" href="/feedback"><MessageSquareText size={14}/> Explore feedback</Link><Link className="btn btn-primary" href="/analyze"><Sparkles size={14}/> Analyze feedback</Link></>}/>
  {error&&<div className="error-box">API connection failed: {error}. Start the FastAPI backend and refresh.</div>}
  <div className="grid metrics-grid">
   <MetricCard label="FEEDBACK ANALYZED" value={total.toLocaleString()} caption="Responses in the signal ledger" icon={MessageSquareText} index={0}/>
   <MetricCard label="POSITIVE SIGNAL" value={`${data?.sentiment_percentages?.positive ?? 0}%`} caption={`${counts.positive} positive classifications`} icon={Activity} index={1}/>
   <MetricCard label="NEEDS A CLOSER LOOK" value={`${data?.negative_pct ?? 0}%`} caption={`${counts.negative} negative classifications`} icon={CircleAlert} index={2}/>
   <MetricCard label="HIGH-PRIORITY FLAGS" value={data?.high_urgency ?? 0} caption="Rule-based urgency cues" icon={Zap} index={3}/>
  </div>
  <div className="grid dashboard-main-grid">
   <Panel title="Sentiment over time" subtitle="Daily classification volume · latest 14 days" action={<span className="tag">LIVE LEDGER</span>}>
    {trend.length?<><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={trend} margin={{top:12,right:5,left:-22,bottom:0}}><CartesianGrid stroke="#242b24" strokeDasharray="3 5" vertical={false}/><XAxis dataKey="date" tick={{fill:"#778377",fontSize:9}} axisLine={false} tickLine={false} tickFormatter={(v)=>v.slice(5)}/><YAxis tick={{fill:"#778377",fontSize:9}} axisLine={false} tickLine={false}/><Tooltip contentStyle={tipStyle}/><Area type="monotone" dataKey="positive" name="Positive" stroke="#c7ff4a" fill="#c7ff4a" fillOpacity={0.07} strokeWidth={2}/><Area type="monotone" dataKey="neutral" name="Neutral" stroke="#84b8ff" fill="transparent" strokeWidth={1.5}/><Area type="monotone" dataKey="negative" name="Negative" stroke="#ff7676" fill="transparent" strokeWidth={1.5}/></AreaChart></ResponsiveContainer></div><div className="chart-legend"><span><i className="legend-dot" style={{background:COLORS[0]}}/>Positive</span><span><i className="legend-dot" style={{background:COLORS[1]}}/>Neutral</span><span><i className="legend-dot" style={{background:COLORS[2]}}/>Negative</span></div></>:<EmptyState title="No signal history yet" detail="Analyze a response or import a CSV to light up your timeline."/>}
   </Panel>
   <Panel title="Sentiment fingerprint" subtitle="How the current feedback pool is classified">
    {total?<div className="sentiment-distribution"><div className="donut-wrap"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={49} outerRadius={67} paddingAngle={4} stroke="none">{pieData.map((e,i)=><Cell key={e.name} fill={e.color}/>)}</Pie><Tooltip contentStyle={tipStyle}/></PieChart></ResponsiveContainer><div className="donut-center"><strong>{total}</strong><span>RESPONSES</span></div></div><div className="distribution-list">{pieData.map((d,i)=><div className="distribution-row" key={d.name}><i className="swatch" style={{background:d.color}}/><span>{d.name}</span><strong>{data?.sentiment_percentages?.[d.name.toLowerCase()] ?? 0}%</strong><small>{d.value} responses</small></div>)}</div></div>:<EmptyState title="No classifications yet" detail="Your sentiment fingerprint will appear after the first analysis."/>}
    <div className="callout" style={{marginTop:17}}><strong><ShieldCheck size={13} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>Human-first insight</strong><br/>A sentiment label is a signal for review, not a verdict about a student or faculty member.</div>
   </Panel>
  </div>
  <div className="grid dashboard-bottom-grid">
   <Panel title="Aspect pulse" subtitle="Where opinions are clustering" action={<Link className="btn btn-ghost" href="/insights">Deep dive <ArrowRight size={13}/></Link>}>
    {aspects.length?<div className="aspect-list">{aspects.slice(0,6).map((a:any)=><div className="aspect-row" key={a.aspect}><span className="aspect-name">{a.aspect}</span><div className="aspect-track"><i className="aspect-pos" style={{width:`${a.total?((a.positive||0)/a.total)*100:0}%`}}/><i className="aspect-neg" style={{width:`${a.total?((a.negative||0)/a.total)*100:0}%`}}/></div><span className="aspect-value">{a.total}</span></div>)}</div>:<EmptyState title="Aspect map is quiet" detail="Add feedback mentioning teaching, facilities, assessments, or support."/>}
    <div className="chart-legend"><span><i className="legend-dot" style={{background:COLORS[0]}}/>Positive aspect signals</span><span><i className="legend-dot" style={{background:COLORS[2]}}/>Negative aspect signals</span></div>
   </Panel>
   <Panel title="Latest signals" subtitle="Recently captured feedback" action={<Link className="btn btn-ghost" href="/feedback">View all <ArrowRight size={13}/></Link>}>
    {data?.recent?.length?<div className="table-wrap"><table className="data-table"><thead><tr><th>Feedback</th><th>Signal</th><th>Priority</th></tr></thead><tbody>{data.recent.slice(0,5).map((r:any)=><tr key={r.id}><td className="feedback-cell">{r.text.length>68?r.text.slice(0,68)+"…":r.text}<div className="sub-cell" style={{marginTop:4}}>{r.subject||"Unspecified subject"}</div></td><td><SentimentPill value={r.sentiment}/></td><td><UrgencyPill value={r.urgency}/></td></tr>)}</tbody></table></div>:<EmptyState title="No feedback in the ledger" detail="Start with one response or upload your class feedback file."/>}
   </Panel>
  </div>
  <div className="grid" style={{gridTemplateColumns:"repeat(3,minmax(0,1fr))",marginTop:15}}>
   {[{icon:BrainCircuit,title:"Analyze a thought",desc:"Get sentiment, aspects, emotion cues and urgency from one response.",href:"/analyze",cta:"Open analyzer"},{icon:ChartNoAxesCombined,title:"Find the pattern",desc:"Turn scattered comments into recurring themes and review priorities.",href:"/insights",cta:"Explore insights"},{icon:FileText,title:"Make it actionable",desc:"Export a clean CSV of analyzed feedback for your review workflow.",href:"/reports",cta:"Build a report"}].map((x)=><Link href={x.href} key={x.title} className="panel" style={{display:"block",transition:".2s"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}><span className="metric-icon"><x.icon size={17}/></span><ArrowUpRight size={15} color="#778477"/></div><h3 style={{fontFamily:"Space Grotesk",fontWeight:500,fontSize:14,margin:"0 0 7px"}}>{x.title}</h3><p style={{fontSize:10,color:"#839083",lineHeight:1.65,minHeight:34,margin:"0 0 15px"}}>{x.desc}</p><span style={{fontSize:10,color:"#c7ff4a"}}>{x.cta} →</span></Link>)}
  </div>
 </div>;
}
