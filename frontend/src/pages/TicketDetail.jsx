import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, MapPin, User, Calendar, Trash2, UserCheck, Lock } from 'lucide-react';
import './TicketDetail.css';
import Layout from '../components/layout/Layout';
import SlaTimer from '../components/tickets/SlaTimer';
import StatusTimeline from '../components/tickets/StatusTimeline';
import ActivityFeed from '../components/tickets/ActivityFeed';
import CommentSection from '../components/comments/CommentSection';
import AttachmentDropzone from '../components/attachments/AttachmentDropzone';
import ImageLightbox from '../components/tickets/ImageLightbox';
import { ticketApi, attachmentApi, userApi } from '../services/api';
import { STATUS_CLASS, STATUS_LABELS, PRIORITY_CLASS, PRIORITY_LABELS, CATEGORY_ICONS, formatDate, shortId } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TABS = [
    { id: 'details',    label: 'Details' },
    { id: 'timeline',   label: 'Timeline' },
    { id: 'attachments',label: 'Attachments' },
    { id: 'comments',   label: 'Comments' },
    { id: 'activity',   label: 'Activity' },
];

const VALID_TRANSITIONS = {
    OPEN:        ['IN_PROGRESS', 'REJECTED'],
    IN_PROGRESS: ['RESOLVED', 'REJECTED'],
    RESOLVED:    ['CLOSED'],
    CLOSED:      [], REJECTED: [],
};

export default function TicketDetail() {
    const { id }      = useParams();
    const navigate    = useNavigate();
    const { user: currentUser, isAdmin, isTechnician } = useAuth();

    const [ticket, setTicket]       = useState(null);
    const [history, setHistory]     = useState([]);
    const [activity, setActivity]   = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [technicians, setTechnicians] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [tab, setTab]             = useState('details');
    const [lightboxIdx, setLightboxIdx] = useState(null);
    const [statusNote, setStatusNote]   = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus]     = useState(null);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignTech, setAssignTech] = useState('');
    const [statusErrors, setStatusErrors] = useState({});
    const [assignErrors, setAssignErrors] = useState({});
    const [actionLoading, setActionLoading] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const promises = [
                ticketApi.getById(id),
                ticketApi.getHistory(id),
                ticketApi.getActivity(id),
            ];

            // Only fetch technician list for admin
            if (isAdmin) {
                promises.push(userApi.getTechnicians().catch(() => []));
            } else {
                promises.push(Promise.resolve([]));
            }

            const [t, h, act, techs] = await Promise.all(promises);
            setTicket(t);
            setAttachments(t.attachments || []);
            setHistory(h || []);
            setActivity(act || []);
            setTechnicians(techs || []);
        } catch { toast.error('Failed to load ticket'); }
        finally { setLoading(false); }
    }, [id, isAdmin]);

    useEffect(() => { void load(); }, [load]);

    // ─── PERMISSIONS ─────────────────────────────
    const isOwner = ticket && currentUser?.email === ticket.createdBy;
    const isAssignedTech = ticket && isTechnician && currentUser?.email === ticket.assignedTo;

    // Can update status: ADMIN always, TECHNICIAN only if assigned
    const canUpdateStatus = isAdmin || isAssignedTech;

    // Can assign: ADMIN only
    const canAssign = isAdmin;

    // Can delete: ADMIN always, owner if USER
    const canDelete = isAdmin || isOwner;

    // Get allowed transitions based on role
    const getAllowedTransitions = () => {
        if (!ticket) return [];
        const allTransitions = VALID_TRANSITIONS[ticket.status] || [];

        if (isAdmin) return allTransitions;

        if (isAssignedTech) {
            // Technician can only move forward, not reject
            return allTransitions.filter(s => s !== 'REJECTED');
        }

        return [];
    };

    const transitions = getAllowedTransitions();

    // ─── VALIDATION ─────────────────────────────
    const validateStatus = () => {
        const next = {};
        if (pendingStatus === 'REJECTED' && !statusNote.trim()) {
            next.statusNote = 'Rejection reason required';
        }
        return next;
    };

    const validateAssign = () => {
        const next = {};
        if (!assignTech.trim()) {
            next.assignTech = 'Select a technician';
        }
        return next;
    };

    const handleStatusChange = (newStatus) => {
        setPendingStatus(newStatus);
        setStatusNote('');
        setStatusErrors({});
        setShowStatusModal(true);
    };

    const confirmStatus = async () => {
        if (!pendingStatus) return;
        const validation = validateStatus();
        setStatusErrors(validation);
        if (Object.keys(validation).length > 0) return;
        setActionLoading(true);
        try {
            const updated = await ticketApi.updateStatus(id, { status: pendingStatus, note: statusNote });
            setTicket(updated);
            const [h, act] = await Promise.all([ticketApi.getHistory(id), ticketApi.getActivity(id)]);
            setHistory(h); setActivity(act);
            setShowStatusModal(false);
            toast.success(`Status updated to ${STATUS_LABELS[pendingStatus]}`);
        } catch (e) { toast.error(e.message || 'Failed to update status'); }
        finally { setActionLoading(false); }
    };

    const confirmAssign = async () => {
        const validation = validateAssign();
        setAssignErrors(validation);
        if (Object.keys(validation).length > 0) return;
        setActionLoading(true);
        try {
            const updated = await ticketApi.assign(id, assignTech.trim());
            setTicket(updated);
            setShowAssignModal(false);
            toast.success('Technician assigned');
        } catch (e) {
            toast.error(e.message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this ticket permanently?')) return;
        setActionLoading(true);
        try {
            await ticketApi.delete(id);
            toast.success('Ticket deleted');
            navigate('/tickets');
        } catch (e) { toast.error(e.message); }
        finally { setActionLoading(false); }
    };

    if (loading) return (
        <Layout title="Loading…">
            <div style={{ display: 'flex', justifyContent: 'center', padding: '120px 0' }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>
        </Layout>
    );

    if (!ticket) return (
        <Layout title="Not Found">
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Ticket not found</p>
                <button onClick={() => navigate('/tickets')} className="btn btn-ghost">← Back to tickets</button>
            </div>
        </Layout>
    );

    const tabCounts = { attachments: attachments.length, comments: ticket.commentCount || 0, activity: activity.length, timeline: history.length };

    return (
        <Layout title={`Ticket #${shortId(ticket.id)}`} subtitle={ticket.title}>
            {/* Back + actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm"><ArrowLeft size={14} /> Back</button>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {/* Status transitions — only for authorized roles */}
                    {canUpdateStatus && transitions.length > 0 && transitions.map(s => (
                        <button
                            key={s}
                            onClick={() => handleStatusChange(s)}
                            disabled={actionLoading}
                            className="btn btn-ghost btn-sm"
                            style={{ borderColor: s === 'REJECTED' ? 'rgba(255,87,87,0.3)' : 'var(--border-amber)', color: s === 'REJECTED' ? '#ff5757' : 'var(--accent-amber)' }}>
                            → {STATUS_LABELS[s]}
                        </button>
                    ))}

                    {/* Assign button — ADMIN only */}
                    {canAssign && (
                        <button
                            onClick={() => { setAssignTech(''); setAssignErrors({}); setShowAssignModal(true); }}
                            disabled={actionLoading}
                            className="btn btn-ghost btn-sm"><UserCheck size={14} /> Assign</button>
                    )}

                    {/* Delete — owner or ADMIN */}
                    {canDelete && (
                        <button
                            onClick={handleDelete}
                            disabled={actionLoading}
                            className="btn btn-danger btn-sm"
                        ><Trash2 size={14} /></button>
                    )}

                    {/* Show lock icon for users without permissions */}
                    {!canUpdateStatus && !canDelete && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            padding: '6px 12px', borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)',
                            color: 'var(--text-muted)', fontSize: '0.75rem',
                            fontFamily: 'var(--font-mono)',
                        }}>
                            <Lock size={12} /> View Only
                        </div>
                    )}
                </div>
            </div>

            {/* Header card */}
            <div className="card" style={{ marginBottom: 24, padding: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--bg-elevated)', border: '1px solid var(--border-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', flexShrink: 0 }}>
                        {CATEGORY_ICONS[ticket.category] || '📋'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.05em' }}>#{shortId(ticket.id)}</div>
                        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 10, lineHeight: 1.3 }}>{ticket.title}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className={`badge ${STATUS_CLASS[ticket.status]}`}>{STATUS_LABELS[ticket.status]}</span>
                            <span className={`badge ${PRIORITY_CLASS[ticket.priority]}`}>{PRIORITY_LABELS[ticket.priority]}</span>
                            <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)', textTransform: 'none', letterSpacing: 0, fontSize: '0.72rem' }}>
                {ticket.category}
              </span>
                        </div>
                    </div>
                    <SlaTimer slaDeadline={ticket.slaDeadline} isSlaBreached={ticket.isSlaBreached} />
                </div>

                {/* Meta row */}
                <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap', paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={12} />{ticket.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} />Created by {ticket.createdBy?.split('@')[0]}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Calendar size={12} />{formatDate(ticket.createdAt)}</span>
                    {ticket.assignedTo && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--accent-amber)' }}><UserCheck size={12} />Assigned: {ticket.assignedTo.split('@')[0]}</span>
                    )}
                    {ticket.preferredContact && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>📞 {ticket.preferredContact}</span>
                    )}
                </div>
            </div>

            {/* Rejection / Resolution notes */}
            {ticket.rejectionReason && (
                <div style={{ padding: '14px 18px', background: 'rgba(255,87,87,0.08)', border: '1px solid rgba(255,87,87,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.85rem' }}>
                    <strong style={{ color: '#ff5757' }}>Rejection reason: </strong>{ticket.rejectionReason}
                </div>
            )}
            {ticket.resolutionNote && (
                <div style={{ padding: '14px 18px', background: 'rgba(0,212,170,0.08)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: '0.85rem' }}>
                    <strong style={{ color: '#00d4aa' }}>Resolution note: </strong>{ticket.resolutionNote}
                </div>
            )}

            {/* Tabs */}
            <div className="tabs" style={{ marginBottom: 24 }}>
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn ${tab === t.id ? 'active' : ''}`}>
                        {t.label}
                        {tabCounts[t.id] > 0 && (
                            <span style={{ background: tab === t.id ? 'var(--accent-amber)' : 'var(--bg-elevated)', color: tab === t.id ? '#080c14' : 'var(--text-muted)', borderRadius: 100, padding: '1px 6px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                {tabCounts[t.id]}
              </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    {tab === 'details' && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 12 }}>Description</h3>
                            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.9rem' }}>{ticket.description}</p>
                        </div>
                    )}
                    {tab === 'timeline' && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 20 }}>Status History</h3>
                            <StatusTimeline history={history} />
                        </div>
                    )}
                    {tab === 'attachments' && (
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <h3 style={{ fontSize: '0.9rem', fontWeight: 600 }}>Attachments ({attachments.length}/3)</h3>
                                {attachments.length > 0 && (
                                    <button onClick={() => setLightboxIdx(0)} className="btn btn-ghost btn-sm">View Gallery</button>
                                )}
                            </div>
                            {attachments.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                                    {attachments.map((att, i) => {
                                        if (!att?.id) return null;

                                        return (
                                        <motion.div key={att.id} whileHover={{ scale: 1.02 }}
                                                    onClick={() => setLightboxIdx(i)}
                                                    className="ticket-attachment-thumb">
                                            <img src={attachmentApi.getFileUrl(att.ticketId || id, att.id)} alt={att.fileName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                            <AttachmentDropzone
                                ticketId={id}
                                attachments={attachments}
                                onUploaded={a => setAttachments(prev => [...prev, a])}
                                onDeleted={aid => setAttachments(prev => prev.filter(a => a.id !== aid))}
                            />
                        </div>
                    )}
                    {tab === 'comments' && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 20 }}>Comments</h3>
                            <CommentSection
                                ticketId={id}
                                comments={ticket.comments || []}
                                onCommentsChange={updated => setTicket(t => ({ ...t, comments: updated, commentCount: updated.length }))}
                            />
                        </div>
                    )}
                    {tab === 'activity' && (
                        <div className="card">
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: 16 }}>Activity Feed</h3>
                            <ActivityFeed activities={activity} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Status update modal */}
            <AnimatePresence>
                {showStatusModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowStatusModal(false)}>
                        <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: 8 }}>Update Status</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 20 }}>
                                Change to <strong style={{ color: 'var(--accent-amber)' }}>{STATUS_LABELS[pendingStatus]}</strong>
                            </p>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label">{pendingStatus === 'REJECTED' ? 'Rejection Reason *' : 'Note (optional)'}</label>
                                <textarea value={statusNote} onChange={e => {
                                    setStatusNote(e.target.value);
                                    if (statusErrors.statusNote) {
                                        setStatusErrors(prev => ({ ...prev, statusNote: '' }));
                                    }
                                }} className="form-textarea" style={{ minHeight: 90 }} placeholder={pendingStatus === 'REJECTED' ? 'Explain why this ticket is being rejected…' : 'Add a note about this status change…'} />
                                {statusErrors.statusNote && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{statusErrors.statusNote}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={confirmStatus}
                                    disabled={actionLoading}
                                    className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
                                <button onClick={() => setShowStatusModal(false)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Assign modal */}
            <AnimatePresence>
                {showAssignModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAssignModal(false)}>
                        <motion.div className="modal-box" initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: 20 }}>Assign Technician</h3>
                            <div className="form-group" style={{ marginBottom: 20 }}>
                                <label className="form-label">Select Technician</label>

                                {/* Technician list from API */}
                                {technicians.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                                        {technicians.map((tech) => (
                                            <button
                                                key={tech.id}
                                                type="button"
                                                onClick={() => { setAssignTech(tech.email); setAssignErrors({}); }}
                                                style={{
                                                    padding: '10px 14px',
                                                    background: assignTech === tech.email ? 'rgba(0,212,170,0.12)' : 'var(--bg-surface)',
                                                    border: assignTech === tech.email ? '1px solid rgba(0,212,170,0.3)' : '1px solid var(--border-subtle)',
                                                    borderRadius: 8,
                                                    color: assignTech === tech.email ? '#00d4aa' : 'var(--text-secondary)',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    fontSize: '0.85rem',
                                                    transition: 'all 0.15s ease',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 10,
                                                    fontFamily: 'var(--font-body)',
                                                }}
                                            >
                                                <div style={{
                                                    width: 28, height: 28, borderRadius: '50%',
                                                    background: 'var(--bg-elevated)',
                                                    border: '1px solid var(--border-dim)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '0.65rem', fontWeight: 700,
                                                    fontFamily: 'var(--font-mono)',
                                                }}>
                                                    {tech.name?.charAt(0).toUpperCase() || '?'}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500 }}>{tech.name}</div>
                                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{tech.email}</div>
                                                </div>
                                                {assignTech === tech.email && (
                                                    <div style={{
                                                        marginLeft: 'auto', width: 8, height: 8,
                                                        borderRadius: '50%', background: '#00d4aa',
                                                        boxShadow: '0 0 8px #00d4aa',
                                                    }} />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ marginBottom: 12 }}>
                                        <input
                                            value={assignTech}
                                            onChange={e => {
                                                setAssignTech(e.target.value);
                                                if (assignErrors.assignTech) {
                                                    setAssignErrors(prev => ({ ...prev, assignTech: '' }));
                                                }
                                            }}
                                            placeholder="technician@campus.lk"
                                            className="form-input"
                                        />
                                    </div>
                                )}

                                {assignErrors.assignTech && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{assignErrors.assignTech}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={confirmAssign}
                                    disabled={actionLoading || !assignTech.trim()}
                                    className="btn btn-primary" style={{ flex: 1 }}>Assign</button>
                                <button onClick={() => setShowAssignModal(false)} className="btn btn-ghost">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            {lightboxIdx !== null && (
                <ImageLightbox
                    attachments={(attachments || [])
                        .map(a => {
                            if (!a?.id) return null;
                            return { ...a, ticketId: id };
                        })
                        .filter(Boolean)}
                    initialIndex={lightboxIdx}
                    onClose={() => setLightboxIdx(null)}
                    onCaptionUpdate={(aid, cap) =>
                        setAttachments(prev =>
                            prev.map(a =>
                                a.id === aid ? { ...a, caption: cap } : a
                            )
                        )
                    }
                />
            )}
        </Layout>
    );
}