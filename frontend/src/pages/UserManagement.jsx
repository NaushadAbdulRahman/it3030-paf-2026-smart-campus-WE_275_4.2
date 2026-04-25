import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Crown, User, Wrench, Search, X, Shield } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { userApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const ROLE_META = {
    ADMIN:      { label: 'Admin',      icon: Crown,  color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    USER:       { label: 'User',       icon: User,   color: '#4a9eff', bg: 'rgba(74,158,255,0.12)' },
    TECHNICIAN: { label: 'Technician', icon: Wrench,  color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
};

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN'];

export default function UserManagement() {
    const { isAdmin } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [editingUser, setEditingUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await userApi.getAll();
            setUsers(data || []);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadUsers(); }, [loadUsers]);

    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(true);
        try {
            const updated = await userApi.updateRole(userId, newRole);
            setUsers(prev => prev.map(u => u.id === userId ? updated : u));
            setEditingUser(null);
            toast.success('Role updated successfully');
        } catch (err) {
            toast.error(err.message || 'Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter
    let filtered = users;
    if (roleFilter !== 'ALL') {
        filtered = filtered.filter(u => u.role === roleFilter);
    }
    if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter(u =>
            u.email?.toLowerCase().includes(q) ||
            u.name?.toLowerCase().includes(q)
        );
    }

    const roleCounts = users.reduce((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
    }, {});

    if (!isAdmin) {
        return (
            <Layout title="Access Denied">
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <Shield size={48} style={{ color: 'var(--status-rejected)', marginBottom: 16 }} />
                    <h3 style={{ marginBottom: 8 }}>Admin Access Required</h3>
                    <p style={{ color: 'var(--text-muted)' }}>You need Admin privileges to manage users.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="User Management" subtitle={`${users.length} registered users`}>
            {/* ─── STATS ───────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                {ROLES.map(role => {
                    const meta = ROLE_META[role];
                    const RoleIcon = meta.icon;
                    return (
                        <motion.div
                            key={role}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="card"
                            style={{ padding: 20, cursor: 'pointer', borderColor: roleFilter === role ? `${meta.color}66` : undefined }}
                            onClick={() => setRoleFilter(roleFilter === role ? 'ALL' : role)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: 8,
                                    background: meta.bg, border: `1px solid ${meta.color}33`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <RoleIcon size={16} style={{ color: meta.color }} />
                                </div>
                                <span style={{ fontSize: '0.82rem', fontWeight: 500 }}>{meta.label}s</span>
                            </div>
                            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: meta.color, fontFamily: 'var(--font-display)' }}>
                                {roleCounts[role] || 0}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* ─── SEARCH ───────────────────────── */}
            <div style={{ position: 'relative', marginBottom: 20 }}>
                <Search
                    size={15}
                    style={{
                        position: 'absolute',
                        left: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                    }}
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search users by name or email…"
                    className="form-input"
                    style={{ paddingLeft: 36 }}
                />
                {search && (
                    <button
                        onClick={() => setSearch('')}
                        style={{
                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex',
                        }}
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* ─── RESULTS ───────────────────────── */}
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 16, fontFamily: 'var(--font-mono)' }}>
                {roleFilter !== 'ALL' && <span style={{ color: ROLE_META[roleFilter]?.color }}>{ROLE_META[roleFilter]?.label} </span>}
                {filtered.length} user{filtered.length !== 1 ? 's' : ''}
                {roleFilter !== 'ALL' && (
                    <button
                        onClick={() => setRoleFilter('ALL')}
                        style={{ marginLeft: 8, background: 'none', border: 'none', color: 'var(--accent-amber)', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                        Clear filter
                    </button>
                )}
            </div>

            {/* ─── USER LIST ───────────────────────── */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <Users size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No users found</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <AnimatePresence>
                        {filtered.map((u, i) => {
                            const meta = ROLE_META[u.role] || ROLE_META.USER;
                            const RoleIcon = meta.icon;
                            const isEditing = editingUser === u.id;
                            const initials = u.name
                                ? u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                                : '??';

                            return (
                                <motion.div
                                    key={u.id}
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="card"
                                    style={{ padding: '16px 20px' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                                        {/* Avatar */}
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${meta.bg}, var(--bg-elevated))`,
                                            border: `1px solid ${meta.color}33`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)',
                                            color: meta.color, flexShrink: 0,
                                        }}>
                                            {initials}
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>
                                                {u.name}
                                            </div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                                {u.email}
                                            </div>
                                        </div>

                                        {/* Role badge / editor */}
                                        {isEditing ? (
                                            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                                {ROLES.map(r => {
                                                    const rm = ROLE_META[r];
                                                    return (
                                                        <button
                                                            key={r}
                                                            onClick={() => handleRoleChange(u.id, r)}
                                                            disabled={actionLoading}
                                                            style={{
                                                                padding: '5px 12px',
                                                                borderRadius: 100,
                                                                background: u.role === r ? rm.bg : 'var(--bg-surface)',
                                                                border: u.role === r ? `1px solid ${rm.color}44` : '1px solid var(--border-subtle)',
                                                                color: u.role === r ? rm.color : 'var(--text-muted)',
                                                                cursor: 'pointer',
                                                                fontSize: '0.72rem',
                                                                fontWeight: 600,
                                                                fontFamily: 'var(--font-mono)',
                                                                transition: 'all 0.15s ease',
                                                            }}
                                                        >
                                                            {rm.label}
                                                        </button>
                                                    );
                                                })}
                                                <button
                                                    onClick={() => setEditingUser(null)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ fontSize: '0.7rem' }}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    display: 'flex', alignItems: 'center', gap: 5,
                                                    padding: '4px 10px', borderRadius: 100,
                                                    background: meta.bg,
                                                    border: `1px solid ${meta.color}33`,
                                                    color: meta.color,
                                                    fontSize: '0.7rem', fontWeight: 600,
                                                    fontFamily: 'var(--font-mono)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.06em',
                                                }}>
                                                    <RoleIcon size={11} />
                                                    {meta.label}
                                                </div>
                                                <button
                                                    onClick={() => setEditingUser(u.id)}
                                                    className="btn btn-ghost btn-sm"
                                                    style={{ fontSize: '0.72rem' }}
                                                >
                                                    Edit Role
                                                </button>
                                            </div>
                                        )}

                                        {/* Joined date */}
                                        <div style={{
                                            fontSize: '0.68rem', color: 'var(--text-muted)',
                                            fontFamily: 'var(--font-mono)',
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {timeAgo(u.createdAt)}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </Layout>
    );
}
