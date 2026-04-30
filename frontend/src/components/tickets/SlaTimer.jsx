import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Timer, AlertTriangle } from 'lucide-react';
import { getSlaRemaining, formatDate } from '../../utils/helpers';

export default function SlaTimer({ slaDeadline, slaBreached }) {
    const [sla, setSla] = useState(() => getSlaRemaining(slaDeadline));

    useEffect(() => {
        if (!slaDeadline) return;

        const id = setInterval(() => {
            setSla(getSlaRemaining(slaDeadline));
        }, 30000);

        return () => clearInterval(id);
    }, [slaDeadline]);

    if (!slaDeadline) return null;

    const breached = slaBreached || sla?.breached;
    const urgent = sla?.urgent;

    const color = breached
        ? '#ff5757'
        : urgent
            ? '#f5a623'
            : '#00d4aa';

    const bg = breached
        ? 'rgba(255,87,87,0.1)'
        : urgent
            ? 'rgba(245,166,35,0.1)'
            : 'rgba(0,212,170,0.08)';

    const border = breached
        ? 'rgba(255,87,87,0.25)'
        : urgent
            ? 'rgba(245,166,35,0.25)'
            : 'rgba(0,212,170,0.2)';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                background: bg,
                border: `1px solid ${border}`
            }}
        >
            {breached ? (
                <AlertTriangle size={14} style={{ color }} />
            ) : (
                <Timer size={14} style={{ color }} />
            )}

            <div>
                <div
                    style={{
                        fontSize: '0.62rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: 1,
                        letterSpacing: '0.07em'
                    }}
                >
                    {breached
                        ? 'SLA BREACHED'
                        : urgent
                            ? 'SLA URGENT'
                            : 'SLA REMAINING'}
                </div>

                <div
                    style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        fontSize: '0.92rem',
                        color
                    }}
                >
                    {breached ? 'Overdue' : sla?.label || '—'}
                </div>
            </div>

            <div
                style={{
                    width: 1,
                    height: 30,
                    background: border,
                    margin: '0 4px'
                }}
            />

            <div>
                <div
                    style={{
                        fontSize: '0.62rem',
                        color: 'var(--text-muted)',
                        fontFamily: 'var(--font-mono)',
                        marginBottom: 1,
                        letterSpacing: '0.07em'
                    }}
                >
                    DEADLINE
                </div>

                <div
                    style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                        fontFamily: 'var(--font-mono)'
                    }}
                >
                    {formatDate(slaDeadline)}
                </div>
            </div>
        </motion.div>
    );
}