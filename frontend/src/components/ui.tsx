"use client";
import { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export function PageHeading({eyebrow,title,description,action}:{eyebrow:string;title:string;description:string;action?:ReactNode}) {
 return <div className="page-heading"><div><div className="eyebrow"><span className="eyebrow-line"/>{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action&&<div className="heading-action">{action}</div>}</div>;
}
export function Panel({children,title,subtitle,action,className=""}:{children:ReactNode;title?:string;subtitle?:string;action?:ReactNode;className?:string}) {
 return <section className={`panel ${className}`}>{(title||subtitle||action)&&<div className="panel-head"><div>{title&&<h3>{title}</h3>}{subtitle&&<p>{subtitle}</p>}</div>{action}</div>}{children}</section>;
}
export function MetricCard({label,value,change,caption,icon:Icon,index=0}:{label:string;value:string|number;change?:string;caption:string;icon:any;index?:number}) {
 return <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:index*.07}} className="metric-card"><div className="metric-top"><span>{label}</span><span className="metric-icon"><Icon size={17}/></span></div><div className="metric-value">{value}</div><div className="metric-bottom"><span className="metric-caption">{caption}</span>{change&&<span className="metric-change"><ArrowUpRight size={13}/>{change}</span>}</div></motion.div>;
}
export function SentimentPill({value}:{value:string}) {
 const key = value.toLowerCase().replace("/","-");
 return <span className={`sentiment-pill ${key}`}><i/>{value}</span>;
}
export function UrgencyPill({value}:{value:string}) {
 return <span className={`urgency-pill ${value}`}><i/>{value} priority</span>;
}
export function EmptyState({title,detail}:{title:string;detail:string}) {
 return <div className="empty-state"><div className="empty-orbit"><Minus size={23}/></div><strong>{title}</strong><p>{detail}</p></div>;
}
