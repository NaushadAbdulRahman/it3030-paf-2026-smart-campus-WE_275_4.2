import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, register, loginWithGoogle } = useAuth();

    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        email: '',
        name: '',
        password: '',
    });
    const [errors, setErrors] = useState({});

    const setField = (field, value) => {
        setForm(f => ({ ...f, [field]: value }));
        if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
    };

    const validate = () => {
        const e = {};
        if (!form.email.trim()) e.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
        if (!form.password.trim()) e.password = 'Password is required';
        else if (form.password.length < 4) e.password = 'Min 4 characters';
        if (isRegister && !form.name.trim()) e.name = 'Name is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            if (isRegister) {
                await register(form.email, form.name, form.password);
                toast.success('Account created successfully!');
            } else {
                await login(form.email, form.password);
                toast.success('Welcome back!');
            }
            navigate('/');
        } catch (err) {
            toast.error(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--bg-base)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Background effects */}
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 50% 0%, rgba(245,166,35,0.08), transparent 60%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at 80% 80%, rgba(74,158,255,0.05), transparent 50%)',
                pointerEvents: 'none',
            }} />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '100%',
                    maxWidth: 420,
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        style={{
                            width: 56, height: 56,
                            borderRadius: 16,
                            background: 'linear-gradient(135deg, var(--accent-amber), #e8920f)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 32px rgba(245,166,35,0.4)',
                            marginBottom: 16,
                        }}
                    >
                        <Zap size={26} color="#080c14" strokeWidth={2.5} />
                    </motion.div>
                    <h1 style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '1.6rem',
                        fontWeight: 800,
                        marginBottom: 4,
                    }}>
                        SmartCampus
                    </h1>
                    <p style={{
                        fontSize: '0.82rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                    }}>
                        Campus Operations Hub
                    </p>
                </div>

                {/* Card */}
                <div className="card" style={{ padding: 32 }}>
                    {/* Tab toggle */}
                    <div style={{
                        display: 'flex',
                        background: 'var(--bg-surface)',
                        borderRadius: 10,
                        padding: 3,
                        marginBottom: 24,
                        border: '1px solid var(--border-subtle)',
                    }}>
                        {['Sign In', 'Sign Up'].map((label, i) => {
                            const active = i === 0 ? !isRegister : isRegister;
                            return (
                                <button
                                    key={label}
                                    onClick={() => { setIsRegister(i === 1); setErrors({}); }}
                                    style={{
                                        flex: 1,
                                        padding: '8px 0',
                                        borderRadius: 8,
                                        background: active ? 'var(--bg-elevated)' : 'transparent',
                                        color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                                        border: active ? '1px solid var(--border-dim)' : '1px solid transparent',
                                        cursor: 'pointer',
                                        fontSize: '0.82rem',
                                        fontWeight: active ? 600 : 400,
                                        transition: 'all 0.15s ease',
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {/* Email */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Email
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setField('email', e.target.value)}
                                    placeholder="you@campus.lk"
                                    className="form-input"
                                    style={{ paddingLeft: 38 }}
                                    disabled={loading}
                                    autoComplete="email"
                                />
                            </div>
                            {errors.email && <span style={{ color: '#ff5757', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>{errors.email}</span>}
                        </div>

                        {/* Name (register only) */}
                        <AnimatePresence>
                            {isRegister && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                        Full Name
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <input
                                            type="text"
                                            value={form.name}
                                            onChange={e => setField('name', e.target.value)}
                                            placeholder="John Doe"
                                            className="form-input"
                                            style={{ paddingLeft: 38 }}
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.name && <span style={{ color: '#ff5757', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>{errors.name}</span>}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Password */}
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={e => setField('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="form-input"
                                    style={{ paddingLeft: 38, paddingRight: 40 }}
                                    disabled={loading}
                                    autoComplete={isRegister ? 'new-password' : 'current-password'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer',
                                        display: 'flex', padding: 4,
                                    }}
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {errors.password && <span style={{ color: '#ff5757', fontSize: '0.72rem', marginTop: 4, display: 'block' }}>{errors.password}</span>}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{
                                padding: '12px 0',
                                fontSize: '0.9rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                marginTop: 4,
                            }}
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                            ) : (
                                <>
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        margin: '20px 0',
                    }}>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>or</span>
                        <div style={{ flex: 1, height: 1, background: 'var(--border-subtle)' }} />
                    </div>

                    {/* Google Sign-In */}
                    <button
                        onClick={loginWithGoogle}
                        disabled={loading}
                        style={{
                            width: '100%',
                            padding: '10px 0',
                            borderRadius: 'var(--radius-md)',
                            background: 'var(--bg-surface)',
                            border: '1px solid var(--border-dim)',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 10,
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            transition: 'all 0.15s ease',
                            fontFamily: 'var(--font-body)',
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center',
                    marginTop: 20,
                    fontSize: '0.72rem',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                }}>
                    Smart Campus Operations Hub © 2026
                </p>
            </motion.div>

            {/* Spin animation keyframe */}
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
