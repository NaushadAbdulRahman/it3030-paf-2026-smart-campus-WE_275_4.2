import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import Layout from '../components/layout/Layout';
import { analyticsApi } from '../services/api';

const COLORS = ['#4a9eff','#f5a623','#00d4aa','#8892a4','#ff5757','#a78bfa','#f472b6'];

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', borderRadius: 8, padding: '8px 14px', fontSize: '0.8rem' }}>
            {label && <div style={{ color: 'var(--text-muted)', marginBottom: 4, fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || 'var(--accent-amber)', fontWeight: 600 }}>{p.name}: {p.value}</div>
            ))}
        </div>
    );
};

export default function Analytics() {
    const [byCategory, setByCategory] = useState({});
    const [byStatus,   setByStatus]   = useState({});
    const [resolution, setResolution] = useState({});
    const [peakHours,  setPeakHours]  = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        Promise.all([
            analyticsApi.byCategory(),
            analyticsApi.byStatus(),
            analyticsApi.resolution(),
            analyticsApi.peakHours(),
        ])
            .then(([cat, stat, res, peak]) => {
                if (!mounted) return;
                setByCategory(cat || {});
                setByStatus(stat || {});
                setResolution(res || {});
                setPeakHours(peak || {});
                setLoading(false);
            })
            .catch(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, []);

    const catData  = Object.entries(byCategory).map(([name, value]) => ({ name, value }));
    const statData = Object.entries(byStatus).map(([name, value]) => ({ name, value }));
    const resData  = Object.entries(resolution).map(([date, count]) => ({ date, count }));
    const peakData = Object.entries(peakHours).map(([hour, count]) => ({ hour, count }));

    const STATUS_COLORS = { OPEN:'#4a9eff', IN_PROGRESS:'#f5a623', RESOLVED:'#00d4aa', CLOSED:'#8892a4', REJECTED:'#ff5757' };

    if (loading) return <Layout title="Analytics"><div style={{ display:'flex', justifyContent:'center', padding:'80px 0' }}><div className="spinner" style={{ width:32, height:32 }} /></div></Layout>;

    return (
        <Layout title="Analytics" subtitle="Ticket trends and operational insights">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

                {/* By Category */}
                <motion.div
                    className="card"
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.05 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <h3 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:20 }}>Tickets by Category</h3>
                    {catData.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'20px 0' }}>No data yet</p> : (
                        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
                            <ResponsiveContainer width={160} height={160}>
                                <PieChart>
                                    <Pie data={catData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} dataKey="value" paddingAngle={3}>
                                        {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:6 }}>
                                {catData.map((d, i) => (
                                    <div key={d.name} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:'0.78rem' }}>
                    <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ width:8, height:8, borderRadius:2, background:COLORS[i % COLORS.length], flexShrink:0 }} />
                        {d.name.charAt(0) + d.name.slice(1).toLowerCase()}
                    </span>
                                        <strong>{d.value}</strong>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* By Status */}
                <motion.div
                    className="card"
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <h3 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:20 }}>Tickets by Status</h3>
                    {statData.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'20px 0' }}>No data yet</p> : (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={statData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="name" tick={{ fill:'var(--text-muted)', fontSize:10, fontFamily:'var(--font-mono)' }} tickFormatter={v => v.replace('_',' ')} />
                                <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="value" radius={[4,4,0,0]}>
                                    {statData.map((d, i) => <Cell key={i} fill={STATUS_COLORS[d.name] || COLORS[i]} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Resolution over time */}
                <motion.div
                    className="card"
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <h3 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:20 }}>Resolution Rate (last 30 days)</h3>
                    {resData.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'20px 0' }}>No resolved tickets yet</p> : (
                        <ResponsiveContainer width="100%" height={160}>
                            <LineChart data={resData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="date" tick={{ fill:'var(--text-muted)', fontSize:9, fontFamily:'var(--font-mono)' }} />
                                <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Line type="monotone" dataKey="count" stroke="var(--accent-teal)" strokeWidth={2} dot={{ fill:'var(--accent-teal)', r:3 }} name="Resolved" />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>

                {/* Peak hours */}
                <motion.div
                    className="card"
                    initial={{ opacity:0, y:20 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:0.1 }}
                    whileHover={{ scale: 1.02 }}
                >
                    <h3 style={{ fontSize:'0.9rem', fontWeight:600, marginBottom:20 }}>Peak Submission Hours</h3>
                    {peakData.length === 0 ? <p style={{ color:'var(--text-muted)', fontSize:'0.8rem', textAlign:'center', padding:'20px 0' }}>No data yet</p> : (
                        <ResponsiveContainer width="100%" height={160}>
                            <BarChart data={peakData} margin={{ top:0, right:0, left:-20, bottom:0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                                <XAxis dataKey="hour" tick={{ fill:'var(--text-muted)', fontSize:9, fontFamily:'var(--font-mono)' }} />
                                <YAxis tick={{ fill:'var(--text-muted)', fontSize:10 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="var(--accent-amber)" radius={[3,3,0,0]} name="Tickets" />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </motion.div>
            </div>
        </Layout>
    );
}