import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, X, Plus, MapPin, Users as UsersIcon, Clock,
    Building2, MonitorSmartphone, Video, Projector, Package, Edit3, Trash2, CalendarPlus,
} from 'lucide-react';
import Layout from '../components/layout/Layout';
import { resourceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPE_META = {
    LECTURE_HALL:  { icon: Building2,          label: 'Lecture Hall',  color: '#4a9eff', bg: 'rgba(74,158,255,0.12)' },
    LAB:          { icon: MonitorSmartphone,   label: 'Lab',           color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
    MEETING_ROOM: { icon: UsersIcon,           label: 'Meeting Room',  color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    PROJECTOR:    { icon: Projector,           label: 'Projector',     color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
    CAMERA:       { icon: Video,               label: 'Camera',        color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
    OTHER:        { icon: Package,             label: 'Other',         color: '#8892a4', bg: 'rgba(136,146,164,0.12)' },
};

const STATUS_META = {
    ACTIVE:            { label: 'Active',            color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
    OUT_OF_SERVICE:    { label: 'Out of Service',    color: '#ff5757', bg: 'rgba(255,87,87,0.12)' },
    UNDER_MAINTENANCE: { label: 'Under Maintenance', color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
};

const ALL_TYPES = ['', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'PROJECTOR', 'CAMERA', 'OTHER'];
const ALL_STATUSES = ['', 'ACTIVE', 'OUT_OF_SERVICE', 'UNDER_MAINTENANCE'];

export default function ResourceList() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();

    const [data, setData] = useState({ content: [], totalPages: 1, totalElements: 0 });
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    // Filters
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [capacityFilter, setCapacityFilter] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size: 12 };
            if (typeFilter) params.type = typeFilter;
            if (statusFilter) params.status = statusFilter;
            if (locationFilter.trim()) params.location = locationFilter.trim();
            if (capacityFilter && parseInt(capacityFilter) > 0) params.minCapacity = parseInt(capacityFilter);

            const result = await resourceApi.getAll(params);
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
    }, [page, typeFilter, statusFilter, locationFilter, capacityFilter]);

    useEffect(() => { void load(); }, [load]);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Remove "${name}" from active service?`)) return;
        try {
            await resourceApi.delete(id);
            toast.success('Resource removed from service');
            load();
        } catch (err) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    return (
        <Layout title="Facilities & Assets" subtitle={`${data.totalElements} campus resources`}>
            {/* ─── TOOLBAR ─────────────────────── */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {/* Location search */}
                <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Location
                    </label>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            value={locationFilter}
                            onChange={e => { setLocationFilter(e.target.value); setPage(0); }}
                            placeholder="Search location…"
                            className="form-input"
                            style={{ paddingLeft: 34 }}
                        />
                        {locationFilter && (
                            <button
                                onClick={() => { setLocationFilter(''); setPage(0); }}
                                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Type filter */}
                <div style={{ minWidth: 140 }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Type
                    </label>
                    <select
                        value={typeFilter}
                        onChange={e => { setTypeFilter(e.target.value); setPage(0); }}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="">All Types</option>
                        {ALL_TYPES.filter(Boolean).map(t => (
                            <option key={t} value={t}>{TYPE_META[t]?.label || t}</option>
                        ))}
                    </select>
                </div>

                {/* Status filter */}
                <div style={{ minWidth: 140 }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Status
                    </label>
                    <select
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
                        className="form-input"
                        style={{ cursor: 'pointer' }}
                    >
                        <option value="">All Statuses</option>
                        {ALL_STATUSES.filter(Boolean).map(s => (
                            <option key={s} value={s}>{STATUS_META[s]?.label || s}</option>
                        ))}
                    </select>
                </div>

                {/* Min capacity */}
                <div style={{ minWidth: 100 }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Min Seats
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={capacityFilter}
                        onChange={e => { setCapacityFilter(e.target.value); setPage(0); }}
                        placeholder="0"
                        className="form-input"
                    />
                </div>

                {/* Spacer */}
                <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
                    {isAdmin && (
                        <Link to="/resources/new" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Plus size={16} /> Add Resource
                        </Link>
                    )}
                </div>
            </div>

            {/* ─── RESULTS ────────────────────── */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
                {data.totalElements} resource{data.totalElements !== 1 ? 's' : ''} found
            </div>

            {/* ─── GRID ──────────────────────── */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            ) : data.content.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card"
                    style={{ textAlign: 'center', padding: 60 }}
                >
                    <Building2 size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No resources found</p>
                    {isAdmin && (
                        <Link to="/resources/new" className="btn btn-primary btn-sm">
                            + Add First Resource
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid-auto">
                    <AnimatePresence>
                        {data.content.map((r, i) => {
                            const typeMeta = TYPE_META[r.type] || TYPE_META.OTHER;
                            const statusMeta = STATUS_META[r.status] || STATUS_META.ACTIVE;
                            const TypeIcon = typeMeta.icon;

                            return (
                                <motion.div
                                    key={r.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: i * 0.04 }}
                                    className="card"
                                    style={{
                                        padding: 20,
                                        cursor: 'pointer',
                                        position: 'relative',
                                        overflow: 'hidden',
                                    }}
                                    onClick={() => navigate(`/resources/${r.id}/edit`)}
                                    whileHover={{ y: -2 }}
                                >
                                    {/* Type icon */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 12,
                                        marginBottom: 14,
                                    }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            background: typeMeta.bg,
                                            border: `1px solid ${typeMeta.color}33`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            flexShrink: 0,
                                        }}>
                                            <TypeIcon size={18} style={{ color: typeMeta.color }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{
                                                fontSize: '0.95rem',
                                                fontWeight: 600,
                                                marginBottom: 2,
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}>
                                                {r.name}
                                            </h3>
                                            <div style={{
                                                fontSize: '0.72rem',
                                                color: typeMeta.color,
                                                fontFamily: 'var(--font-mono)',
                                                fontWeight: 500,
                                            }}>
                                                {typeMeta.label}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta row */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: 8,
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                        marginBottom: 14,
                                    }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={11} /> {r.location}
                                        </span>
                                        {r.capacity && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <UsersIcon size={11} /> {r.capacity} seats
                                            </span>
                                        )}
                                        {r.availabilityStart && r.availabilityEnd && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Clock size={11} /> {r.availabilityStart} – {r.availabilityEnd}
                                            </span>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {r.description && (
                                        <p style={{
                                            fontSize: '0.78rem',
                                            color: 'var(--text-secondary)',
                                            marginBottom: 14,
                                            lineHeight: 1.5,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden',
                                        }}>
                                            {r.description}
                                        </p>
                                    )}

                                    {/* Footer */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        paddingTop: 12,
                                        borderTop: '1px solid var(--border-subtle)',
                                    }}>
                                        {/* Status chip */}
                                        <span style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: 5,
                                            padding: '3px 10px',
                                            borderRadius: 100,
                                            background: statusMeta.bg,
                                            border: `1px solid ${statusMeta.color}33`,
                                            color: statusMeta.color,
                                            fontSize: '0.68rem',
                                            fontWeight: 600,
                                            fontFamily: 'var(--font-mono)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                        }}>
                                            <span style={{
                                                width: 5, height: 5, borderRadius: '50%',
                                                background: statusMeta.color,
                                            }} />
                                            {statusMeta.label}
                                        </span>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                                            {r.status === 'ACTIVE' && (
                                                <button
                                                    onClick={() => navigate(`/bookings/new?resourceId=${r.id}`)}
                                                    className="btn btn-sm"
                                                    style={{
                                                        padding: '4px 10px',
                                                        background: 'rgba(74,158,255,0.12)',
                                                        color: '#4a9eff',
                                                        border: '1px solid rgba(74,158,255,0.25)',
                                                        display: 'flex', alignItems: 'center', gap: 4,
                                                        fontSize: '0.68rem', fontWeight: 600,
                                                        borderRadius: 'var(--radius-md)',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <CalendarPlus size={12} /> Book
                                                </button>
                                            )}
                                            {isAdmin && (
                                                <>
                                                    <button
                                                        onClick={() => navigate(`/resources/${r.id}/edit`)}
                                                        className="btn btn-ghost btn-sm"
                                                        style={{ padding: '4px 8px' }}
                                                    >
                                                        <Edit3 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(r.id, r.name)}
                                                        className="btn btn-danger btn-sm"
                                                        style={{ padding: '4px 8px' }}
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            {/* ─── PAGINATION ────────────────── */}
            {data.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 40, justifyContent: 'center' }}>
                    <button
                        onClick={() => setPage(p => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        className="btn btn-ghost btn-sm"
                    >
                        ← Prev
                    </button>
                    {Array.from({ length: data.totalPages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i)} className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`}>
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage(p => Math.min(p + 1, data.totalPages - 1))}
                        disabled={page >= data.totalPages - 1}
                        className="btn btn-ghost btn-sm"
                    >
                        Next →
                    </button>
                </div>
            )}
        </Layout>
    );
}
