import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, ArrowLeft } from 'lucide-react';

import Layout from '../components/layout/Layout';
import { ticketApi } from '../services/api';
import { suggestPriority, CATEGORY_ICONS } from '../utils/helpers';
import toast from 'react-hot-toast';

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

            toast.success('Ticket created successfully!');
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

                        {/* LOCATION */}
                        <input
                            value={form.location}
                            onChange={e => setField('location', e.target.value)}
                            placeholder="Location"
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