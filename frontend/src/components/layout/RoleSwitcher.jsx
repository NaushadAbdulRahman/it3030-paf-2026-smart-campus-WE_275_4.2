import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Wrench, Crown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    { key: 'ADMIN',      label: 'Admin',      icon: Crown,  color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    { key: 'USER',       label: 'User',       icon: User,   color: '#4a9eff', bg: 'rgba(74,158,255,0.12)' },
    { key: 'TECHNICIAN', label: 'Technician', icon: Wrench,  color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
];

export default function RoleSwitcher({ collapsed }) {
    const { role, switchRole, user } = useAuth();
    const [open, setOpen] = useState(false);

    const currentMeta = ROLES.find(r => r.key === role) || ROLES[1];
    const CurrentIcon = currentMeta.icon;

    const handleSwitch = async (newRole) => {
        setOpen(false);
        if (newRole !== role) {
            await switchRole(newRole);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            {/* Current role button */}
            <button
                onClick={() => setOpen(o => !o)}
                style={{
                    width: '100%',
                    padding: collapsed ? 10 : '10px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: currentMeta.bg,
                    border: `1px solid ${currentMeta.color}33`,
                    color: currentMeta.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    gap: 10,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                }}
            >
                <CurrentIcon size={16} strokeWidth={2} />
                {!collapsed && (
                    <>
                        <span style={{ flex: 1, textAlign: 'left' }}>{currentMeta.label}</span>
                        <motion.div
                            animate={{ rotate: open ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown size={14} />
                        </motion.div>
                    </>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            right: 0,
                            marginBottom: 6,
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border-dim)',
                            borderRadius: 'var(--radius-md)',
                            padding: 4,
                            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                            zIndex: 100,
                            minWidth: collapsed ? 160 : 'auto',
                        }}
                    >
                        <div style={{
                            padding: '6px 10px',
                            fontSize: '0.65rem',
                            fontFamily: 'var(--font-mono)',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                        }}>
                            Switch Role
                        </div>
                        {ROLES.map(({ key, label, icon: Icon, color, bg }) => {
                            const active = key === role;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleSwitch(key)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 7,
                                        background: active ? bg : 'transparent',
                                        border: 'none',
                                        color: active ? color : 'var(--text-secondary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8,
                                        cursor: 'pointer',
                                        transition: 'all 0.1s ease',
                                        fontSize: '0.82rem',
                                        fontWeight: active ? 600 : 400,
                                        fontFamily: 'var(--font-body)',
                                    }}
                                >
                                    <Icon size={14} />
                                    <span>{label}</span>
                                    {active && (
                                        <div style={{
                                            marginLeft: 'auto',
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: color,
                                            boxShadow: `0 0 8px ${color}`,
                                        }} />
                                    )}
                                </button>
                            );
                        })}
                        {user?.email && (
                            <div style={{
                                padding: '6px 10px 4px',
                                fontSize: '0.62rem',
                                fontFamily: 'var(--font-mono)',
                                color: 'var(--text-muted)',
                                borderTop: '1px solid var(--border-subtle)',
                                marginTop: 4,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}>
                                {user.email}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
