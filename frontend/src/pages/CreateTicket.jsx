import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowLeft, Upload, X } from 'lucide-react';

import Layout from '../components/layout/Layout';
import { ticketApi, attachmentApi } from '../services/api';
import { suggestPriority, CATEGORY_ICONS, formatFileSize } from '../utils/helpers';
import toast from 'react-hot-toast';

const MAX_FILES = 3;
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CATEGORIES = ['ELECTRICAL','PLUMBING','IT','HVAC','FURNITURE','STRUCTURAL','OTHER'];
const PRIORITIES = ['LOW','MEDIUM','HIGH','CRITICAL'];

const PRIORITY_META = {
    LOW:      { label: 'Low',      sla: '72 hrs', color: '#00d4aa' },
    MEDIUM:   { label: 'Medium',   sla: '24 hrs', color: '#4a9eff' },
    HIGH:     { label: 'High',     sla: '8 hrs',  color: '#f5a623' },
    CRITICAL: { label: 'Critical', sla: '2 hrs',  color: '#ff5757' },
};

export default function CreateTicket() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: '',
        category: '',
        description: '',
        priority: '',
        location: '',
        preferredContact: '',
        resourceId: ''
    });

    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [suggestion, setSuggestion] = useState(null);
    const [duplicates, setDuplicates] = useState([]);
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const addFiles = (incoming) => {
        const list = Array.from(incoming || []);
        const space = MAX_FILES - files.length;
        if (space <= 0) {
            toast.error(`Maximum ${MAX_FILES} attachments allowed`);
            return;
        }
        const accepted = [];
        for (const f of list.slice(0, space)) {
            if (!f.type.startsWith('image/')) {
                toast.error(`${f.name}: only images allowed`);
                continue;
            }
            if (f.size > MAX_FILE_SIZE) {
                toast.error(`${f.name}: must be under 10MB`);
                continue;
            }
            accepted.push(f);
        }
        if (accepted.length) setFiles(prev => [...prev, ...accepted]);
    };

    const removeFile = (idx) => {
        setFiles(prev => prev.filter((_, i) => i !== idx));
    };

    useEffect(() => {
        const desc = form.description.trim();
        if (desc.length < 10) return setSuggestion(null);
        setSuggestion(suggestPriority(desc));
    }, [form.description]);

    useEffect(() => {
        if (!form.resourceId.trim()) return setDuplicates([]);

        let active = true;

        const timer = setTimeout(async () => {
            try {
                const result = await ticketApi.checkDuplicates(form.resourceId);
                if (active) setDuplicates(result || []);
            } catch {
                if (active) setDuplicates([]);
            }
        }, 600);

        return () => {
            active = false;
            clearTimeout(timer);
        };
    }, [form.resourceId]);

    const setField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) {
            setErrors(e => ({ ...e, [field]: '' }));
        }
    };

    const validate = () => {
        const e = {};
        if (!form.title.trim()) e.title = 'Title is required';
        if (!form.category) e.category = 'Category required';
        if (form.description.trim().length < 10) e.description = 'Min 10 characters';
        if (!form.priority) e.priority = 'Priority required';
        if (!form.location.trim()) e.location = 'Location required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        try {
            const ticket = await ticketApi.create(form);

            if (!ticket?.id) throw new Error('Invalid response');

            if (files.length > 0) {
                let uploaded = 0;
                for (const f of files) {
                    try {
                        await attachmentApi.upload(ticket.id, f);
                        uploaded += 1;
                    } catch (uploadErr) {
                        toast.error(`${f.name}: ${uploadErr.message || 'upload failed'}`);
                    }
                }
                if (uploaded > 0) {
                    toast.success(`Ticket created with ${uploaded} attachment${uploaded > 1 ? 's' : ''}`);
                } else {
                    toast.success('Ticket created (attachments failed)');
                }
            } else {
                toast.success('Ticket created successfully!');
            }

            navigate(`/tickets/${ticket.id}`);

        } catch (err) {
            toast.error(err.message || 'Failed to create ticket');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Layout title="New Ticket" subtitle="Report an incident">
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 24 }}>
                    <ArrowLeft size={14} /> Back
                </button>

                <AnimatePresence>
                    {duplicates.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{
                                        padding: 16,
                                        background: 'rgba(245,166,35,0.08)',
                                        border: '1px solid rgba(245,166,35,0.25)',
                                        borderRadius: 'var(--radius-lg)',
                                        marginBottom: 24
                                    }}>
                            <AlertCircle size={16} /> {duplicates.length} duplicate tickets found
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="card" style={{ padding: 32 }}>
                    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

                        {/* TITLE */}
                        <input
                            value={form.title}
                            onChange={e => setField('title', e.target.value)}
                            placeholder="Title"
                            className="form-input"
                            disabled={submitting}
                        />
                        {errors.title && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.title}</span>}

                        {/* CATEGORY */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setField('category', cat)}
                                    disabled={submitting}
                                    style={{
                                        padding: 10,
                                        borderRadius: 10,
                                        background: form.category === cat ? 'rgba(245,166,35,0.12)' : 'var(--bg-surface)'
                                    }}
                                >
                                    {CATEGORY_ICONS[cat]} {cat}
                                </button>
                            ))}
                        </div>
                        {errors.category && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.category}</span>}

                        {/* DESCRIPTION */}
                        <textarea
                            value={form.description}
                            onChange={e => setField('description', e.target.value)}
                            placeholder="Describe issue"
                            className="form-textarea"
                            disabled={submitting}
                        />
                        {errors.description && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.description}</span>}

                        {/* PRIORITY */}
                        <div style={{ display:'flex', gap:8 }}>
                            {PRIORITIES.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setField('priority', p)}
                                    style={{
                                        padding:8,
                                        borderRadius:8,
                                        background: form.priority === p ? 'rgba(74,158,255,0.2)' : 'var(--bg-surface)'
                                    }}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                        {errors.priority && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.priority}</span>}

                        {/* RESOURCE LINKING (Optional) */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Related Resource (Optional)</span>
                            </label>
                            <input
                                value={form.resourceId}
                                onChange={e => setField('resourceId', e.target.value)}
                                placeholder="Enter Resource ID if applicable (e.g., '1')"
                                className="form-input"
                                disabled={submitting}
                            />
                        </div>

                        {/* LOCATION */}
                        <input
                            value={form.location}
                            onChange={e => setField('location', e.target.value)}
                            placeholder="Location *"
                            className="form-input"
                            disabled={submitting}
                        />
                        {errors.location && <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.location}</span>}

                        {/* SMART PRIORITY */}
                        {suggestion && PRIORITY_META[suggestion] && (
                            <div>
                                <Sparkles size={14} /> Suggested: {PRIORITY_META[suggestion].label}
                                <button type="button" onClick={() => setField('priority', suggestion)}>
                                    Apply
                                </button>
                            </div>
                        )}

                        {/* ATTACHMENTS */}
                        <div className="form-group">
                            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Attachments (Optional)</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                                    {files.length}/{MAX_FILES} · images, max 10MB each
                                </span>
                            </label>

                            {files.length < MAX_FILES && (
                                <label
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        addFiles(e.dataTransfer.files);
                                    }}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '20px',
                                        borderRadius: 'var(--radius-lg)',
                                        cursor: submitting ? 'not-allowed' : 'pointer',
                                        border: '2px dashed var(--border-dim)',
                                        background: 'var(--bg-surface)',
                                        opacity: submitting ? 0.6 : 1,
                                        gap: 6,
                                    }}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        disabled={submitting}
                                        onChange={(e) => {
                                            addFiles(e.target.files);
                                            if (fileInputRef.current) fileInputRef.current.value = '';
                                        }}
                                        style={{ display: 'none' }}
                                    />
                                    <Upload size={18} />
                                    <span style={{ fontSize: '0.85rem' }}>Drop image(s) or click to choose</span>
                                </label>
                            )}

                            {files.length > 0 && (
                                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    {files.map((f, i) => (
                                        <div
                                            key={`${f.name}-${i}`}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 10,
                                                padding: '8px 10px',
                                                background: 'var(--bg-surface)',
                                                border: '1px solid var(--border-subtle)',
                                                borderRadius: 8,
                                            }}
                                        >
                                            <img
                                                src={URL.createObjectURL(f)}
                                                alt={f.name}
                                                width={36}
                                                height={36}
                                                style={{ objectFit: 'cover', borderRadius: 6 }}
                                            />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '0.82rem',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}>{f.name}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {formatFileSize(f.size)}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                disabled={submitting}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    padding: 4,
                                                }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* SUBMIT */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                        >
                            {submitting ? 'Submitting...' : 'Submit Ticket'}
                        </button>

                    </form>
                </div>
            </div>
        </Layout>
    );
}