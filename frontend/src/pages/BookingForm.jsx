import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2, Building2, MapPin, Users as UsersIcon, Clock, AlertCircle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { bookingApi, resourceApi } from '../services/api';
import toast from 'react-hot-toast';

export default function BookingForm() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedResourceId = searchParams.get('resourceId');

    const [form, setForm] = useState({
        resourceId: preselectedResourceId || '',
        date: '',
        startTime: '09:00',
        endTime: '10:00',
        purpose: '',
        expectedAttendees: '',
    });
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState('');
    const [loading, setLoading] = useState(false);

    // Resources picker
    const [resources, setResources] = useState([]);
    const [resourceSearch, setResourceSearch] = useState('');
    const [selectedResource, setSelectedResource] = useState(null);
    const [resLoading, setResLoading] = useState(true);

    useEffect(() => {
        setResLoading(true);
        resourceApi.getAll({ size: 100, status: 'ACTIVE' })
            .then(result => {
                const list = result?.content || result || [];
                setResources(list);
                // Auto-select preselected resource
                if (preselectedResourceId) {
                    const found = list.find(r => String(r.id) === preselectedResourceId);
                    if (found) setSelectedResource(found);
                }
            })
            .catch(() => setResources([]))
            .finally(() => setResLoading(false));
    }, [preselectedResourceId]);

    const setField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
        if (generalError) setGeneralError('');
    };

    const selectResource = (r) => {
        setSelectedResource(r);
        setField('resourceId', r.id);
    };

    const validate = () => {
        const e = {};
        if (!form.resourceId) e.resourceId = 'Select a resource';
        if (!form.date) e.date = 'Date is required';
        if (!form.startTime) e.startTime = 'Start time is required';
        if (!form.endTime) e.endTime = 'End time is required';
        if (form.startTime && form.endTime && form.startTime >= form.endTime) e.endTime = 'End must be after start';
        if (!form.purpose.trim()) e.purpose = 'Purpose is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const payload = {
                ...form,
                resourceId: parseInt(form.resourceId),
                expectedAttendees: form.expectedAttendees ? parseInt(form.expectedAttendees) : null,
            };
            await bookingApi.create(payload);
            toast.success('Booking submitted for approval!');
            navigate('/bookings');
        } catch (err) {
            const message = err.message || 'Failed to create booking';
            if (err.status === 409) {
                setGeneralError(message);
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const filteredResources = resources.filter(r =>
        r.name.toLowerCase().includes(resourceSearch.toLowerCase()) ||
        r.location.toLowerCase().includes(resourceSearch.toLowerCase())
    );

    const TYPE_COLORS = {
        LECTURE_HALL: '#4a9eff', LAB: '#00d4aa', MEETING_ROOM: '#f5a623',
        PROJECTOR: '#a78bfa', CAMERA: '#f472b6', OTHER: '#8892a4',
    };

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];

    return (
        <Layout title="Book a Resource" subtitle="Reserve a campus facility or asset">
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
                <ArrowLeft size={14} /> Back
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
                {/* Left: Resource picker */}
                <div>
                    <div className="card" style={{ padding: 20 }}>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Building2 size={16} /> Select Resource
                        </h3>

                        <input
                            type="text"
                            value={resourceSearch}
                            onChange={e => setResourceSearch(e.target.value)}
                            placeholder="Search resources…"
                            className="form-input"
                            style={{ marginBottom: 12 }}
                        />

                        {errors.resourceId && <span style={{ color: '#ff5757', fontSize: '0.72rem', display: 'block', marginBottom: 8 }}>{errors.resourceId}</span>}

                        <div style={{ maxHeight: 360, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {resLoading ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>
                                    <div className="spinner" style={{ width: 20, height: 20 }} />
                                </div>
                            ) : filteredResources.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: 20, color: 'var(--text-muted)', fontSize: '0.8rem' }}>No active resources</div>
                            ) : filteredResources.map(r => {
                                const isSelected = selectedResource?.id === r.id;
                                const typeColor = TYPE_COLORS[r.type] || '#8892a4';

                                return (
                                    <button
                                        key={r.id}
                                        onClick={() => selectResource(r)}
                                        style={{
                                            textAlign: 'left',
                                            padding: '10px 14px',
                                            borderRadius: 'var(--radius-md)',
                                            background: isSelected ? 'rgba(245,166,35,0.1)' : 'var(--bg-surface)',
                                            border: isSelected ? '1px solid rgba(245,166,35,0.4)' : '1px solid var(--border-subtle)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease',
                                            display: 'flex', alignItems: 'center', gap: 10,
                                            fontFamily: 'var(--font-body)',
                                        }}
                                    >
                                        <div style={{
                                            width: 8, height: 8, borderRadius: '50%',
                                            background: typeColor, flexShrink: 0,
                                        }} />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }}>{r.name}</div>
                                            <div style={{ display: 'flex', gap: 8, fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                <span><MapPin size={9} /> {r.location}</span>
                                                {r.capacity && <span><UsersIcon size={9} /> {r.capacity}</span>}
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                width: 18, height: 18, borderRadius: '50%',
                                                background: 'var(--accent-amber)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                color: '#080c14', fontSize: '0.65rem', fontWeight: 700,
                                            }}>✓</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Selected resource info */}
                        {selectedResource && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                style={{
                                    marginTop: 14, padding: 12,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(245,166,35,0.05)',
                                    border: '1px solid rgba(245,166,35,0.15)',
                                }}
                            >
                                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', marginBottom: 6 }}>Selected</div>
                                <div style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: 4 }}>{selectedResource.name}</div>
                                <div style={{ display: 'flex', gap: 12, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                    <span><MapPin size={10} /> {selectedResource.location}</span>
                                    {selectedResource.capacity && <span><UsersIcon size={10} /> {selectedResource.capacity} seats</span>}
                                    {selectedResource.availabilityStart && (
                                        <span><Clock size={10} /> {selectedResource.availabilityStart?.slice(0,5)} – {selectedResource.availabilityEnd?.slice(0,5)}</span>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Right: Booking form */}
                <div>
                    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 24 }}>
                        <h3 style={{ fontSize: '0.88rem', fontWeight: 600, marginBottom: 16 }}>Booking Details</h3>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {/* Date */}
                            <div className="form-group">
                                <label className="form-label">Date *</label>
                                <input
                                    type="date"
                                    min={today}
                                    value={form.date}
                                    onChange={e => setField('date', e.target.value)}
                                    className="form-input"
                                    disabled={loading}
                                />
                                {errors.date && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.date}</span>}
                            </div>

                            {/* Time range */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label">Start Time *</label>
                                    <input type="time" value={form.startTime} onChange={e => setField('startTime', e.target.value)} className="form-input" disabled={loading} />
                                    {errors.startTime && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.startTime}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Time *</label>
                                    <input type="time" value={form.endTime} onChange={e => setField('endTime', e.target.value)} className="form-input" disabled={loading} />
                                    {errors.endTime && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.endTime}</span>}
                                </div>
                            </div>

                            {/* Expected attendees */}
                            <div className="form-group">
                                <label className="form-label">Expected Attendees</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.expectedAttendees}
                                    onChange={e => setField('expectedAttendees', e.target.value)}
                                    placeholder="e.g. 30"
                                    className="form-input"
                                    disabled={loading}
                                />
                            </div>

                            {/* Purpose */}
                            <div className="form-group">
                                <label className="form-label">Purpose *</label>
                                <textarea
                                    value={form.purpose}
                                    onChange={e => setField('purpose', e.target.value)}
                                    placeholder="Describe the purpose of your booking…"
                                    className="form-textarea"
                                    style={{ minHeight: 100 }}
                                    disabled={loading}
                                />
                                {errors.purpose && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.purpose}</span>}
                            </div>

                            {generalError && (
                                <div style={{
                                    padding: 12,
                                    borderRadius: 'var(--radius-md)',
                                    background: 'rgba(255,72,66,0.08)',
                                    border: '1px solid rgba(255,72,66,0.15)',
                                    color: '#b91c1c',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    fontSize: '0.78rem',
                                }}>
                                    <AlertCircle size={14} />
                                    {generalError}
                                </div>
                            )}

                            {/* Info */}
                            <div style={{
                                padding: 10, borderRadius: 'var(--radius-md)',
                                background: 'rgba(74,158,255,0.06)',
                                border: '1px solid rgba(74,158,255,0.15)',
                                fontSize: '0.75rem', color: '#4a9eff',
                                display: 'flex', alignItems: 'center', gap: 8,
                            }}>
                                <AlertCircle size={14} />
                                Booking will be submitted for admin approval
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary"
                                style={{
                                    padding: '12px 0', fontSize: '0.9rem', fontWeight: 600,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}
                            >
                                {loading ? (
                                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                                ) : (
                                    <><Save size={16} /> Submit Booking</>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </Layout>
    );
}
