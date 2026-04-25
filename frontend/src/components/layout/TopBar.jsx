import React from 'react';
import { motion } from 'framer-motion';
import './TopBar.css';

export default function TopBar({ title, subtitle }) {
    return (
        <motion.header initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                       className="topbar-shell">
            <div>
                {title    && <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700 }}>{title}</h2>}
                {subtitle && <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 1 }}>{subtitle}</p>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-teal))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-mono)' }}>AD</div>
                <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, lineHeight: 1.2 }}>Admin</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>admin@campus.lk</div>
                </div>
            </div>
        </motion.header>
    );
}