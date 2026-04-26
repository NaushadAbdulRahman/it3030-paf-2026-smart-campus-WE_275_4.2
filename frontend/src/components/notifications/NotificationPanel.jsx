import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck, Trash2, ExternalLink, Inbox } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../../services/api';
import toast from 'react-hot-toast';

export default function NotificationPanel({ onClose }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef(null);

    useEffect(() => {
        loadNotifications();
        
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const data = await notificationApi.getAll({ page: 0, size: 10 });
            setNotifications(data?.content || data || []);
        } catch (err) {
            console.error('Failed to load notifications', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch {}
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch {}
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationApi.delete(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
        } catch {}
    };

    const handleAction = (n) => {
        handleMarkRead(n.id);
        onClose();
        
        if (n.relatedEntityType === 'BOOKING') {
            navigate('/bookings');
        } else if (n.relatedEntityType === 'TICKET') {
            navigate(`/tickets/${n.relatedEntityId}`);
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: 12,
                width: 360,
                maxHeight: 500,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 16,
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
            }}
        >
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(255,255,255,0.02)'
            }} >
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>Notifications</h3>
                <button 
                    onClick={handleMarkAllRead}
                    className="btn btn-ghost btn-sm" 
                    style={{ fontSize: '0.7rem', height: 28, gap: 4 }}
                >
                    <CheckCheck size={14} /> Mark all read
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
                {loading ? (
                    <div style={{ padding: 40, textAlign: 'center' }}>
                        <div className="spinner" style={{ width: 24, height: 24, margin: '0 auto' }} />
                    </div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Inbox size={32} style={{ marginBottom: 12, opacity: 0.3 }} />
                        <p style={{ fontSize: '0.85rem' }}>No new notifications</p>
                    </div>
                ) : (
                    notifications.map(n => (
                        <div
                            key={n.id}
                            onClick={() => handleAction(n)}
                            style={{
                                padding: '14px 20px',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                borderBottom: '1px solid rgba(255,255,255,0.03)',
                                position: 'relative',
                                background: n.isRead ? 'transparent' : 'rgba(245,166,35,0.03)',
                                display: 'flex',
                                gap: 12
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(245,166,35,0.03)'}
                        >
                            {!n.isRead && (
                                <div style={{
                                    position: 'absolute',
                                    left: 8,
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: 'var(--accent-amber)'
                                }} />
                            )}
                            
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontSize: '0.88rem', 
                                    fontWeight: n.isRead ? 500 : 700, 
                                    marginBottom: 3,
                                    color: n.isRead ? 'var(--text-primary)' : '#fff'
                                }}>
                                    {n.title}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                                    {n.message}
                                </div>
                                <div style={{ 
                                    fontSize: '0.68rem', 
                                    color: 'var(--text-muted)', 
                                    marginTop: 6, 
                                    fontFamily: 'var(--font-mono)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    {formatTime(n.createdAt)}
                                    <button 
                                        onClick={(e) => handleDelete(e, n.id)}
                                        style={{ 
                                            background: 'none', 
                                            border: 'none', 
                                            color: 'inherit', 
                                            cursor: 'pointer',
                                            padding: 2,
                                            borderRadius: 4
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.color = '#ff5757'}
                                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div style={{
                padding: '12px',
                textAlign: 'center',
                borderTop: '1px solid var(--border-subtle)',
                background: 'rgba(255,255,255,0.01)'
            }}>
                <button 
                    onClick={() => { navigate('/notifications'); onClose(); }}
                    className="btn btn-ghost btn-sm"
                    style={{ width: '100%', fontSize: '0.75rem', color: 'var(--accent-amber)' }}
                >
                    View all notifications
                </button>
            </div>
        </motion.div>
    );
}
