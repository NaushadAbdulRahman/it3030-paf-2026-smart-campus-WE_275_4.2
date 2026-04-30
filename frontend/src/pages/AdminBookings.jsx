import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users as UsersIcon, Check, X, ArrowLeft, AlertCircle, Download } from 'lucide-react';
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

export default function AdminBookings() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [statusTab, setStatusTab] = useState('PENDING');
    const [rejectingId, setRejectingId] = useState(null);
    const [rejectReason, setRejectReason] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
    const [stats, setStats] = useState({});

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

    const loadStats = async () => {
        try {
            const s = await bookingApi.stats();
            setStats(s || {});
        } catch {}
    };

    useEffect(() => { load(); loadStats(); }, [load]);

    const handleExportCSV = async () => {
        setExportLoading(true);
        try {
            // Fetch all for export (large size)
            const params = { page: 0, size: 1000 };
            if (statusTab) params.status = statusTab;
            const result = await bookingApi.getAll(params);
            const items = result?.content || result || [];

            if (items.length === 0) {
                toast.error('No data to export');
                return;
            }

            const headers = ['ID', 'User', 'Email', 'Resource', 'Location', 'Date', 'Start', 'End', 'Attendees', 'Purpose', 'Status', 'Rejection Reason'];
            const rows = items.map(b => [
                b.id,
                b.userName,
                b.userEmail,
                b.resourceName,
                b.resourceLocation,
                b.date,
                b.startTime,
                b.endTime,
                b.expectedAttendees || '',
                `"${b.purpose.replace(/"/g, '""')}"`,
                b.status,
                `"${(b.rejectionReason || '').replace(/"/g, '""')}"`
            ]);

            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `bookings_${statusTab || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success('CSV Exported');
        } catch (err) {
            toast.error('Failed to export CSV');
        } finally {
            setExportLoading(false);
        }
    };

    const handleApprove = async (id) => {
        setActionLoading(id);
        try {
            await bookingApi.approve(id);
            toast.success('Booking approved');
            load();
            loadStats();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!rejectReason.trim()) {
            toast.error('Please provide a reason');
            return;
        }
        setActionLoading(id);
        try {
            await bookingApi.reject(id, rejectReason);
            toast.success('Booking rejected');
            setRejectingId(null);
            setRejectReason('');
            load();
            loadStats();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : '';
    const formatTime = (t) => t ? t.slice(0, 5) : '';

    if (!isAdmin) {
        return (
            <Layout title="Access Denied">
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ color: 'var(--text-muted)' }}>Admin access required.</p>
                    <button onClick={() => navigate('/bookings')} className="btn btn-ghost" style={{ marginTop: 16 }}>← My Bookings</button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Manage Bookings" subtitle="Approve or reject booking requests">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <button onClick={() => navigate('/bookings')} className="btn btn-ghost btn-sm">
                    <ArrowLeft size={14} /> My Bookings
                </button>
                
                <button 
                    onClick={handleExportCSV} 
                    disabled={exportLoading || data.content.length === 0}
                    className="btn btn-sm"
                    style={{ 
                        background: 'rgba(255,255,255,0.05)', 
                        border: '1px solid var(--border-subtle)',
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        fontSize: '0.75rem',
                        padding: '6px 14px'
                    }}
                >
                    {exportLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Download size={14} />}
                    Export CSV
                </button>
            </div>

            {/* Stats cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                    { key: 'pending', label: 'Pending', color: '#f5a623' },
                    { key: 'approved', label: 'Approved', color: '#00d4aa' },
                    { key: 'rejected', label: 'Rejected', color: '#ff5757' },
                    { key: 'cancelled', label: 'Cancelled', color: '#8892a4' },
                ].map(s => (
                    <div key={s.key} className="card" style={{ padding: '14px 18px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>
                            {stats[s.key] ?? 0}
                        </div>
                        <div style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {s.label}
                        </div>
                    </div>
                ))}
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

            {/* Bookings List */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            ) : data.content.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
                    No bookings with this status
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <AnimatePresence>
                        {data.content.map((b, i) => {
                            const meta = STATUS_META[b.status] || STATUS_META.PENDING;
                            const isPending = b.status === 'PENDING';
                            const isRejecting = rejectingId === b.id;

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
                                            <div style={{ fontWeight: 600, fontSize: '0.92rem', marginBottom: 2 }}>
                                                {b.resourceName}
                                            </div>
                                            <div style={{ fontSize: '0.72rem', color: '#4a9eff', marginBottom: 6 }}>
                                                Booked by {b.userName} ({b.userEmail})
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
                                                {b.expectedAttendees && (
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <UsersIcon size={11} /> {b.expectedAttendees} attendees
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                                <strong>Purpose:</strong> {b.purpose}
                                            </p>
                                            {b.rejectionReason && (
                                                <div style={{ marginTop: 6, fontSize: '0.75rem', color: '#ff5757', display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <AlertCircle size={12} /> Reason: {b.rejectionReason}
                                                </div>
                                            )}
                                        </div>

                                        {/* Right: status + actions */}
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

                                            {isPending && !isRejecting && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button
                                                        onClick={() => handleApprove(b.id)}
                                                        disabled={actionLoading === b.id}
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'rgba(0,212,170,0.15)',
                                                            color: '#00d4aa',
                                                            border: '1px solid rgba(0,212,170,0.3)',
                                                            display: 'flex', alignItems: 'center', gap: 4,
                                                            cursor: 'pointer', fontSize: '0.72rem', padding: '5px 12px',
                                                            borderRadius: 'var(--radius-md)',
                                                        }}
                                                    >
                                                        <Check size={13} /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => setRejectingId(b.id)}
                                                        className="btn btn-sm"
                                                        style={{
                                                            background: 'rgba(255,87,87,0.1)',
                                                            color: '#ff5757',
                                                            border: '1px solid rgba(255,87,87,0.3)',
                                                            display: 'flex', alignItems: 'center', gap: 4,
                                                            cursor: 'pointer', fontSize: '0.72rem', padding: '5px 12px',
                                                            borderRadius: 'var(--radius-md)',
                                                        }}
                                                    >
                                                        <X size={13} /> Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Reject reason input */}
                                    <AnimatePresence>
                                        {isRejecting && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                style={{
                                                    marginTop: 14, paddingTop: 14,
                                                    borderTop: '1px solid var(--border-subtle)',
                                                    display: 'flex', gap: 10, alignItems: 'flex-end',
                                                }}
                                            >
                                                <div style={{ flex: 1 }}>
                                                    <label style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#ff5757', textTransform: 'uppercase', marginBottom: 4, display: 'block' }}>
                                                        Rejection Reason *
                                                    </label>
                                                    <input
                                                        value={rejectReason}
                                                        onChange={e => setRejectReason(e.target.value)}
                                                        placeholder="Why is this booking being rejected?"
                                                        className="form-input"
                                                        autoFocus
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleReject(b.id)}
                                                    disabled={actionLoading === b.id}
                                                    className="btn btn-danger btn-sm"
                                                    style={{ whiteSpace: 'nowrap' }}
                                                >
                                                    Confirm Reject
                                                </button>
                                                <button
                                                    onClick={() => { setRejectingId(null); setRejectReason(''); }}
                                                    className="btn btn-ghost btn-sm"
                                                >
                                                    Cancel
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
