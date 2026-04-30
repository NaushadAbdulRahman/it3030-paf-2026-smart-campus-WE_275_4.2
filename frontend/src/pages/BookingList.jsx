import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Search, X, Plus, CalendarCheck, CalendarX, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STATUS_META = {
    PENDING:   { label: 'Pending',   color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    APPROVED:  { label: 'Approved',  color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
    REJECTED:  { label: 'Rejected',  color: '#ff5757', bg: 'rgba(255,87,87,0.12)' },
    CANCELLED: { label: 'Cancelled', color: '#8892a4', bg: 'rgba(136,146,164,0.12)' },
};

const TABS = [null, 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
const TAB_LABELS = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'];

export default function BookingList() {
    const { isAdmin } = useAuth();
    const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [statusTab, setStatusTab] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 10 };
            if (statusTab) params.status = statusTab;
            const result = await bookingApi.getAll(params);
            setData({
                content: result?.content || result || [],
                totalPages: result?.totalPages || 1,
                totalElements: result?.totalElements || 0,
            });
        } catch {
            setData({ content: [], totalPages: 1, totalElements: 0 });
        } finally {
            setLoading(false);
        }
    }, [page, statusTab]);

    useEffect(() => { void load(); }, [load]);

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return;
        try {
            await bookingApi.cancel(id);
            toast.success('Booking cancelled');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
    const formatTime = (t) => t ? t.slice(0, 5) : '';

    return (
        <Layout
            title="My Bookings"
            subtitle={`${data.totalElements} booking${data.totalElements !== 1 ? 's' : ''}`}
        >
            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <Link to="/bookings/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Plus size={16} /> New Booking
                </Link>
                {isAdmin && (
                    <Link to="/admin/bookings" className="btn btn-ghost">
                        Admin Panel →
                    </Link>
                )}
            </div>

            {/* Status tabs */}
            <div className="tabs" style={{ marginBottom: 20 }}>
                {TABS.map((status, i) => {
                    const active = statusTab === status;
                    const meta = status ? STATUS_META[status] : null;
                    return (
                        <button
                            key={i}
                            onClick={() => { setStatusTab(status); setPage(0); }}
                            className={`tab-btn ${active ? 'active' : ''}`}
                            style={{
                                borderBottom: active && meta
                                    ? `2px solid ${meta.color}`
                                    : active ? '2px solid var(--accent-amber)' : '2px solid transparent',
                            }}
                        >
                            <span style={{ color: active && meta ? meta.color : undefined }}>
                                {TAB_LABELS[i]}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            ) : data.content.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <CalendarX size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No bookings found</p>
                    <Link to="/bookings/new" className="btn btn-primary btn-sm">+ Book a Resource</Link>
                </motion.div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <AnimatePresence>
                        {data.content.map((b, i) => {
                            const meta = STATUS_META[b.status] || STATUS_META.PENDING;
                            const canCancel = b.status === 'PENDING' || b.status === 'APPROVED';

                            return (
                                <motion.div
                                    key={b.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="card"
                                    style={{ padding: '18px 22px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                                        {/* Date badge */}
                                        <div style={{
                                            width: 52, height: 52, borderRadius: 12,
                                            background: meta.bg, border: `1px solid ${meta.color}33`,
                                            display: 'flex', flexDirection: 'column',
                                            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                        }}>
                                            <Calendar size={16} style={{ color: meta.color, marginBottom: 2 }} />
                                            <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: meta.color, fontWeight: 700 }}>
                                                {b.date ? new Date(b.date).getDate() : ''}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 4 }}>
                                                {b.resourceName}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Calendar size={11} /> {formatDate(b.date)}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Clock size={11} /> {formatTime(b.startTime)} – {formatTime(b.endTime)}
                                                </span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <MapPin size={11} /> {b.resourceLocation}
                                                </span>
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {b.purpose}
                                            </p>
                                            {b.rejectionReason && (
                                                <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#ff5757', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <AlertCircle size={12} /> {b.rejectionReason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right side */}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                                padding: '3px 10px', borderRadius: 100,
                                                background: meta.bg, border: `1px solid ${meta.color}33`,
                                                color: meta.color, fontSize: '0.68rem', fontWeight: 600,
                                                fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
                                            }}>
                                                <span style={{ width: 5, height: 5, borderRadius: '50%', background: meta.color }} />
                                                {meta.label}
                                            </span>
                                            {canCancel && (
                                                <button
                                                    onClick={() => handleCancel(b.id)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ fontSize: '0.72rem', color: '#ff5757', borderColor: 'rgba(255,87,87,0.2)' }}
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* Pagination */}
            {data.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 40, justifyContent: 'center' }}>
                    <button onClick={() => setPage(p => Math.max(p - 1, 0))} disabled={page === 0} className="btn btn-ghost btn-sm">← Prev</button>
                    {Array.from({ length: data.totalPages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i)} className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`}>{i + 1}</button>
                    ))}
                    <button onClick={() => setPage(p => Math.min(p + 1, data.totalPages - 1))} disabled={page >= data.totalPages - 1} className="btn btn-ghost btn-sm">Next →</button>
                </div>
            )}
        </Layout>
    );
}
