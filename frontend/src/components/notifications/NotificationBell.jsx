import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { notificationApi } from '../../services/api';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../../context/AuthContext';

export default function NotificationBell() {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;

        loadUnreadCount();
        const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s
        
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    const loadUnreadCount = async () => {
        try {
            const data = await notificationApi.getUnreadCount();
            setUnreadCount(data?.count || 0);
        } catch (err) {
            console.error('Failed to load unread count', err);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border-dim)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isOpen ? 'var(--accent-amber)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s'
                }}
            >
                <Bell size={20} fill={isOpen ? 'currentColor' : 'none'} />
                
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            style={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                minWidth: 16,
                                height: 16,
                                borderRadius: 8,
                                background: '#ff5757',
                                color: '#fff',
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0 4px',
                                border: '2px solid var(--bg-surface)',
                                boxShadow: '0 0 10px rgba(255,87,87,0.4)'
                            }}
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <NotificationPanel 
                        onClose={() => setIsOpen(false)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
