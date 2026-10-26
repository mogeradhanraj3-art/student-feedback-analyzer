"use client";
import { useState } from "react";
import { BrainCircuit, Check, Clipboard, FileText, LockKeyhole, Sparkles, WandSparkles } from "lucide-react";
import { api, Analysis } from "@/lib/api";
import { PageHeading, Panel, SentimentPill, UrgencyPill, EmptyState } from "@/components/ui";

const examples = [
 "The professor explains difficult concepts clearly, but the lab computers crash during practicals.",
 "The assignment deadline is too short and the grading criteria are unclear.",
 "The instructor is supportive and the practical sessions are useful.",
];
export default function AnalyzePage(){
 const [text,setText]=useState(""); const [subject,setSubject]=useState(""); const [result,setResult]=useState<Analysis|null>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState(""); const [copied,setCopied]=useState(false);
 async function run(){if(text.trim().length<3){setError("Enter at least 3 characters to analyze.");return;}setLoading(true);setError("");setResult(null);try{setResult(await api.analyze(text,subject||undefined));}catch(e:any){setError(e.message);}finally{setLoading(false);}}
 async function copy(){if(!result)return;await navigator.clipboard.writeText(JSON.stringify(result,null,2));setCopied(true);setTimeout(()=>setCopied(false),1500);}
 return <div>
  <PageHeading eyebrow="Signal lab / 02" title={<>One response.<br/><span className="text-acid">A deeper read.</span></>} description="Run a single piece of feedback through the analysis engine. Explore the predicted sentiment, aspect signals, emotion cues, and privacy-safe preview." action={<span className="tag"><Sparkles size={12} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>NLP WORKBENCH</span>}/>
  <div className="grid analyze-grid">
   <div>
    <Panel title="Input chamber" subtitle="Paste a feedback response or start from a sample.">
     <div className="field"><label className="field-label">FEEDBACK TEXT</label><textarea className="textarea" placeholder="Tell us what worked, what didn't, and what should change…" value={text} onChange={e=>setText(e.target.value)} maxLength={5000}/><div style={{display:"flex",justifyContent:"space-between"}}><span className="field-help">Avoid including names, student IDs, or sensitive personal details.</span><span className="field-help">{text.length}/5000</span></div></div>
     <div className="field"><label className="field-label">SUBJECT / COURSE <span style={{color:"#647064"}}>(OPTIONAL)</span></label><input className="input" value={subject} onChange={e=>setSubject(e.target.value)} placeholder="e.g. Machine Learning"/></div>
     <div style={{display:"flex",justifyContent:"space-between",gap:12,alignItems:"center",flexWrap:"wrap",marginBottom:17}}><span className="field-label" style={{margin:0}}>QUICK START</span><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{examples.map((x,i)=><button className="tag" key={i} onClick={()=>setText(x)}>Sample {i+1}</button>)}</div></div>
     {error&&<div className="error-box">{error}</div>}
     <button className="btn btn-primary" onClick={run} disabled={loading} style={{width:"100%",padding:13}}>{loading?<><span className="loading-line" style={{width:30}}><i/></span> Reading signal…</>:<><WandSparkles size={15}/> Analyze feedback <span>↗</span></>}</button>
     <p className="field-help" style={{textAlign:"center",marginTop:11}}>Analysis is saved to your feedback ledger. Predictions are estimates and may be wrong.</p>
    </Panel>
    <Panel title="How the engine reads" subtitle="A transparent, multi-layer analysis pass" >
     <div className="grid" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10}}>
      {[["01","Sentiment","TF-IDF + Logistic Regression"],["02","Aspect signals","Explainable keyword rules"],["03","Emotion cues","Lexicon-based hints"],["04","Priority cues","Rule-based urgency flags"]].map(x=><div key={x[0]} style={{border:"1px solid #283028",borderRadius:8,padding:12,background:"#101410"}}><div style={{font:"10px DM Mono",color:"#c7ff4a",marginBottom:10}}>{x[0]} / LAYER</div><strong style={{display:"block",fontSize:11,marginBottom:5}}>{x[1]}</strong><span style={{fontSize:9,color:"#788478",lineHeight:1.5}}>{x[2]}</span></div>)}
     </div>
    </Panel>
   </div>
   <div className="analysis-result">
    <Panel title="Analysis output" subtitle="Your response, decoded" action={result?<button className="btn btn-ghost" onClick={copy}><Clipboard size={13}/>{copied?"Copied":"Copy JSON"}</button>:undefined}>
     {result?<div>
      <div className="result-score"><div className="score-orb">{Math.round(result.confidence*100)}%</div><div><h2>{result.sentiment}</h2><p>Model confidence estimate · {result.emotion} cue</p><div style={{marginTop:8,display:"flex",gap:7,flexWrap:"wrap"}}><SentimentPill value={result.sentiment}/><UrgencyPill value={result.urgency}/></div></div></div>
      <div style={{fontSize:10,color:"#8e9a8e",marginBottom:8}}>CLASS PROBABILITIES</div>
      {Object.entries(result.probabilities).map(([k,v])=><div className="probability-row" key={k}><span>{k}</span><div className="probability-track"><i style={{width:`${Number(v)*100}%`,background:k===result.sentiment?"#c7ff4a":"#465245"}}/></div><strong>{Math.round(Number(v)*100)}%</strong></div>)}
      <div style={{borderTop:"1px solid #293029",margin:"19px 0"}}/>
      <div className="panel-head"><div><h3>Aspect signals</h3><p>Which parts of the experience are mentioned?</p></div></div>
      {result.aspects.length?result.aspects.map((a,i)=><div className="aspect-card" key={i}><div className="aspect-card-top"><strong>{a.aspect}</strong><SentimentPill value={a.sentiment}/></div><p>“{a.evidence}”</p></div>):<div className="callout">No predefined aspect was detected. That does not mean the feedback has no useful topic.</div>}
      <div style={{marginTop:18}}><div style={{fontSize:10,color:"#8e9a8e",marginBottom:10}}>DETECTED THEMES</div><div className="tag-row">{result.themes.length?result.themes.map(t=><span className="tag" key={t}>{t}</span>):<span className="field-help">No known theme detected</span>}</div></div>
      <div style={{marginTop:18}}><div style={{fontSize:10,color:"#8e9a8e",marginBottom:10}}><LockKeyhole size={12} style={{display:"inline",verticalAlign:"middle",marginRight:5}}/>PRIVACY-SAFE PREVIEW</div><div className="callout">{result.redacted_preview}</div></div>
      <div style={{marginTop:16}}>{result.caveats.map((c,i)=><p key={i} style={{fontSize:9,color:"#6e7a6e",lineHeight:1.6,margin:"5px 0"}}>• {c}</p>)}</div>
     </div>:<EmptyState title="Awaiting a signal" detail="Add a response on the left and run the analyzer. The output will appear here, layer by layer."/>}
    </Panel>
   </div>
  </div>
 </div>;
}
