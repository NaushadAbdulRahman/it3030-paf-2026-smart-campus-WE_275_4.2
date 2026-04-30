import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Layout from '../components/layout/Layout';
import { resourceApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const TYPES = [
    { value: 'LECTURE_HALL',  label: 'Lecture Hall' },
    { value: 'LAB',           label: 'Lab' },
    { value: 'MEETING_ROOM',  label: 'Meeting Room' },
    { value: 'PROJECTOR',     label: 'Projector' },
    { value: 'CAMERA',        label: 'Camera' },
    { value: 'OTHER',         label: 'Other' },
];

const STATUSES = [
    { value: 'ACTIVE',            label: 'Active' },
    { value: 'OUT_OF_SERVICE',    label: 'Out of Service' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
];

const INITIAL = {
    name: '',
    type: 'LECTURE_HALL',
    capacity: '',
    location: '',
    description: '',
    availabilityStart: '08:00',
    availabilityEnd: '22:00',
    status: 'ACTIVE',
};

export default function ResourceForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAdmin } = useAuth();
    const isEdit = !!id;

    const [form, setForm] = useState(INITIAL);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(isEdit);

    // Load existing resource for edit
    useEffect(() => {
        if (!isEdit) return;
        setPageLoading(true);
        resourceApi.getById(id)
            .then((r) => {
                setForm({
                    name: r.name || '',
                    type: r.type || 'LECTURE_HALL',
                    capacity: r.capacity || '',
                    location: r.location || '',
                    description: r.description || '',
                    availabilityStart: r.availabilityStart || '08:00',
                    availabilityEnd: r.availabilityEnd || '22:00',
                    status: r.status || 'ACTIVE',
                });
            })
            .catch(() => toast.error('Failed to load resource'))
            .finally(() => setPageLoading(false));
    }, [id, isEdit]);

    const setField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.type) e.type = 'Type is required';
        if (!form.location.trim()) e.location = 'Location is required';
        if (form.capacity && parseInt(form.capacity) < 1) e.capacity = 'Must be at least 1';
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
                capacity: form.capacity ? parseInt(form.capacity) : null,
            };

            if (isEdit) {
                await resourceApi.update(id, payload);
                toast.success('Resource updated!');
            } else {
                await resourceApi.create(payload);
                toast.success('Resource created!');
            }
            navigate('/resources');
        } catch (err) {
            toast.error(err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return (
            <Layout title="Access Denied">
                <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                    <p style={{ color: 'var(--text-muted)' }}>Admin access required to manage resources.</p>
                    <button onClick={() => navigate('/resources')} className="btn btn-ghost" style={{ marginTop: 16 }}>
                        ← Back to Resources
                    </button>
                </div>
            </Layout>
        );
    }

    if (pageLoading) {
        return (
            <Layout title="Loading…">
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            </Layout>
        );
    }

    return (
        <Layout
            title={isEdit ? 'Edit Resource' : 'Add New Resource'}
            subtitle={isEdit ? `Editing resource #${id}` : 'Create a new campus facility or asset'}
        >
            <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
                <ArrowLeft size={14} /> Back
            </button>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card"
                style={{ padding: 28, maxWidth: 680 }}
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Name */}
                    <div className="form-group">
                        <label className="form-label">Resource Name *</label>
                        <input
                            value={form.name}
                            onChange={e => setField('name', e.target.value)}
                            placeholder="e.g. Lecture Hall A1"
                            className="form-input"
                            disabled={loading}
                        />
                        {errors.name && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.name}</span>}
                    </div>

                    {/* Type + Status row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Type *</label>
                            <select
                                value={form.type}
                                onChange={e => setField('type', e.target.value)}
                                className="form-input"
                                disabled={loading}
                            >
                                {TYPES.map(t => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                            {errors.type && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.type}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setField('status', e.target.value)}
                                className="form-input"
                                disabled={loading}
                            >
                                {STATUSES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Location + Capacity */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Location *</label>
                            <input
                                value={form.location}
                                onChange={e => setField('location', e.target.value)}
                                placeholder="e.g. Block A, Floor 2"
                                className="form-input"
                                disabled={loading}
                            />
                            {errors.location && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.location}</span>}
                        </div>

                        <div className="form-group">
                            <label className="form-label">Capacity</label>
                            <input
                                type="number"
                                min="1"
                                value={form.capacity}
                                onChange={e => setField('capacity', e.target.value)}
                                placeholder="e.g. 100"
                                className="form-input"
                                disabled={loading}
                            />
                            {errors.capacity && <span style={{ color: '#ff5757', fontSize: '0.72rem' }}>{errors.capacity}</span>}
                        </div>
                    </div>

                    {/* Availability */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div className="form-group">
                            <label className="form-label">Available From</label>
                            <input
                                type="time"
                                value={form.availabilityStart}
                                onChange={e => setField('availabilityStart', e.target.value)}
                                className="form-input"
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Available Until</label>
                            <input
                                type="time"
                                value={form.availabilityEnd}
                                onChange={e => setField('availabilityEnd', e.target.value)}
                                className="form-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setField('description', e.target.value)}
                            placeholder="Describe the resource, features, equipment…"
                            className="form-textarea"
                            style={{ minHeight: 120 }}
                            disabled={loading}
                        />
                    </div>

                    {/* Submit */}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}
                        >
                            {loading ? (
                                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <>
                                    <Save size={16} />
                                    {isEdit ? 'Update Resource' : 'Create Resource'}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/resources')}
                            className="btn btn-ghost"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </motion.div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </Layout>
    );
}
