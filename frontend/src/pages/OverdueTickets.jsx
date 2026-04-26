import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import Layout from '../components/layout/Layout';
import TicketCard from '../components/tickets/TicketCard';
import { ticketApi } from '../services/api';
import './OverdueTickets.css';

/**
 * @typedef {{
 *   id?: string | number,
 *   [key: string]: any
 * }} OverdueTicket
 */

export default function OverdueTickets() {
    const [tickets, setTickets] = useState(/** @type {OverdueTicket[]} */([]));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        ticketApi.getOverdue()
            .then(data => {
                const normalized = /** @type {OverdueTicket[]} */ (Array.isArray(data)
                    ? data
                    : (Array.isArray(data?.data) ? data.data : []));
                setTickets(normalized);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    return (
        <Layout title="Overdue Tickets" subtitle="SLA breached — immediate attention required">

            {/* Alert Banner */}
            {tickets.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="overdue-alert-banner"
                >
                    <AlertTriangle size={18} style={{ color: '#ff5757' }} />
                    <span style={{ color: '#ff5757', fontWeight: 600 }}>
            {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} have exceeded their SLA deadline
          </span>
                </motion.div>
            )}

            {/* Loading */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                    <div className="spinner" style={{ width: 32, height: 32 }} />
                </div>

            ) : tickets.length === 0 ? (

                /* Empty State */
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                    <div
                        style={{
                            width: 64,
                            height: 64,
                            borderRadius: 20,
                            background: 'rgba(0,212,170,0.08)',
                            border: '1px solid rgba(0,212,170,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px'
                        }}
                    >
                        <AlertTriangle size={28} style={{ color: '#00d4aa' }} />
                    </div>

                    <p style={{ fontWeight: 600, marginBottom: 6 }}>All clear!</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        No tickets have breached SLA
                    </p>
                </div>

            ) : (

                /* Ticket Grid */
                <motion.div
                    className="grid-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    {tickets.map((t, i) => (
                        <TicketCard
                            key={t.id || i}
                            ticket={t}
                            index={i}
                        />
                    ))}
                </motion.div>

            )}
        </Layout>
    );
}