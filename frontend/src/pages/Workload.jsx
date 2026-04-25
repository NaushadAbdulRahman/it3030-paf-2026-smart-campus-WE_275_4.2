import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { analyticsApi } from '../services/api';
import './Workload.css';

const WORKLOAD_COLOR = { LOW: '#00d4aa', MODERATE: '#f5a623', HIGH: '#ff5757' };
const WORKLOAD_BG    = { LOW: 'rgba(0,212,170,0.08)', MODERATE: 'rgba(245,166,35,0.08)', HIGH: 'rgba(255,87,87,0.08)' };
const WORKLOAD_ICON  = { LOW: CheckCircle2, MODERATE: TrendingUp, HIGH: AlertTriangle };

export default function Workload() {
    const [workloads, setWorkloads] = useState([]);
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([analyticsApi.workload(), analyticsApi.suggestTechnician()])
            .then(([w, s]) => {
                setWorkloads(w || []);
                setSuggestion(
                    s?.suggestedTechnicianId ||
                    s?.technicianId ||
                    null
                );
                setLoading(false);
            }).catch(() => setLoading(false));
    }, []);

    if (loading) return <Layout title="Workload"><div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><div className="spinner" style={{ width:32, height:32 }} /></div></Layout>;

    const maxTotal = Math.max(...workloads.map(w => w.totalActive), 1);

    return (
        <Layout title="Technician Workload" subtitle="Real-time assignment load per technician">
            {/* Suggestion banner — Innovation 8 */}
            {suggestion && (
                <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
                            className="workload-suggestion-banner">
                    <CheckCircle2 size={18} style={{ color:'#00d4aa', flexShrink:0 }} />
                    <div>
                        <span style={{ fontWeight:600, color:'#00d4aa' }}>Suggested technician: </span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem', color:'var(--text-primary)' }}>{suggestion}</span>
                        <span style={{ color:'var(--text-muted)', fontSize:'0.82rem', marginLeft:8 }}>— lowest current workload</span>
                    </div>
                </motion.div>
            )}

            {workloads.length === 0 ? (
                <div style={{ textAlign:'center', padding:'80px 0', color:'var(--text-muted)' }}>
                    <Users size={40} style={{ margin:'0 auto 16px', opacity:0.3 }} />
                    <p style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem' }}>No technician data yet</p>
                    <p style={{ fontSize:'0.8rem', marginTop:8 }}>Assign technicians to tickets to see workload</p>
                </div>
            ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                    {workloads.map((w, i) => {
                        const color  = WORKLOAD_COLOR[w.workloadLevel] || '#8892a4';
                        const bg     = WORKLOAD_BG[w.workloadLevel]   || 'var(--bg-surface)';
                        const Icon   = WORKLOAD_ICON[w.workloadLevel] || TrendingUp;
                        const pct = maxTotal ? (w.totalActive / maxTotal) : 0;                        const isSuggested = w.technicianId === suggestion;
                        return (
                            <motion.div key={w.technicianId} className="card workload-card" whileHover={{ scale: 1.02 }}
                                        initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0, borderColor: isSuggested ? 'rgba(0,212,170,0.3)' : 'var(--border-subtle)' }}
                                        transition={{ delay:i * 0.06, duration:0.4, ease:[0.16,1,0.3,1] }}
                                        >
                                <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
                                    {/* Avatar */}
                                    <div style={{ width:44, height:44, borderRadius:12, background: bg, border:`1px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                                        <Icon size={20} style={{ color }} />
                                    </div>
                                    <div style={{ flex:1, minWidth:0 }}>
                                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:3 }}>
                                            <span style={{ fontWeight:600, fontSize:'0.9rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{w.technicianId}</span>
                                            {isSuggested && (
                                                <span style={{ fontSize:'0.65rem', padding:'2px 8px', background:'rgba(0,212,170,0.12)', color:'#00d4aa', border:'1px solid rgba(0,212,170,0.2)', borderRadius:100, fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.05em', flexShrink:0 }}>SUGGESTED</span>
                                            )}
                                        </div>
                                        <div style={{ display:'flex', gap:16, fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>
                                            <span style={{ color:'#4a9eff' }}>{w.openCount} open</span>
                                            <span style={{ color:'#f5a623' }}>{w.inProgressCount} in progress</span>
                                            <span style={{ color:'#00d4aa' }}>{w.resolvedCount} resolved</span>
                                        </div>
                                    </div>
                                    <div style={{ textAlign:'right', flexShrink:0 }}>
                                        <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:'1.8rem', color, lineHeight:1 }}>{w.totalActive}</div>
                                        <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginTop:2 }}>ACTIVE</div>
                                    </div>
                                    {/* Level badge */}
                                    <span style={{ padding:'4px 12px', borderRadius:100, background: bg, color, border:`1px solid ${color}30`, fontFamily:'var(--font-mono)', fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.06em', flexShrink:0 }}>
                    {w.workloadLevel}
                  </span>
                                </div>

                                {/* Progress bar */}
                                <div style={{ height:6, background:'var(--bg-surface)', borderRadius:3, overflow:'hidden' }}>
                                    <motion.div
                                        initial={{ width:0 }} animate={{ width:`${pct * 100}%` }}
                                        transition={{ delay:0.3 + i*0.06, duration:0.8, ease:[0.16,1,0.3,1] }}
                                        className="workload-progress-fill"
                                        style={{ background:`linear-gradient(90deg, ${color}, ${color}80)` }}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
}