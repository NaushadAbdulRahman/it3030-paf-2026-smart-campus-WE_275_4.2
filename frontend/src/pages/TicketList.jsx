import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ClipboardList } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import './TicketList.css';

import Layout from '../components/layout/Layout';
import TicketCard from '../components/tickets/TicketCard';
import StatusFilterTabs from '../components/tickets/StatusFilterTabs';
import { ticketApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketList() {
    const { isUser, isAdmin } = useAuth();
    const [searchParams] = useSearchParams();
    const isMine = searchParams.get('mine') === 'true';

    const [data, setData] = useState({
        content: [],
        totalElements: 0,
        totalPages: 1,
    });

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [myTickets, setMyTickets] = useState(isUser || isMine);

    // Reset myTickets when role changes
    useEffect(() => {
        setMyTickets(isUser || isMine);
    }, [isUser, isMine]);

    // ─── LOAD DATA ─────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);

        try {
            const params = {
                page,
                size: 12,
                myTickets: isUser ? true : myTickets,
            };

            const result = await ticketApi.getAll(params);

            // SAFE handling (array OR paginated)
            setData({
                content: result?.content || result || [],
                totalElements:
                    result?.totalElements || (result?.length ?? 0),
                totalPages: result?.totalPages || 1,
            });
        } catch {
            setData({ content: [], totalElements: 0, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    }, [page, myTickets, isUser]);

    useEffect(() => {
        void load();
    }, [load]);

    // ─── FILTER SEARCH + STATUS ─────────────────
    let filtered = data.content || [];

    // Status filter
    if (statusFilter !== 'ALL') {
        filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Text search
    if (search.trim()) {
        const q = search.toLowerCase();
        filtered = filtered.filter((t) =>
            t.title?.toLowerCase().includes(q) ||
            t.description?.toLowerCase().includes(q) ||
            t.location?.toLowerCase().includes(q)
        );
    }

    // Count by status for tabs
    const statusCounts = (data.content || []).reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
    }, {});

    const getTitle = () => {
        if (isUser) return 'My Tickets';
        if (myTickets) return 'My Tickets';
        return 'All Tickets';
    };

    const getSubtitle = () => {
        if (isUser) return `${data.totalElements} incidents reported by you`;
        return `${data.totalElements} total incidents`;
    };

    return (
        <Layout
            title={getTitle()}
            subtitle={getSubtitle()}
        >
            {/* ─── TOOLBAR ───────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {/* SEARCH */}
                <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
                    <Search
                        size={15}
                        style={{
                            position: 'absolute',
                            left: 12,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)',
                        }}
                    />

                    <input
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(0);
                        }}
                        placeholder="Search tickets…"
                        className="form-input"
                        style={{ paddingLeft: 36 }}
                    />

                    {search && (
                        <button
                            onClick={() => {
                                setSearch('');
                                setPage(0);
                            }}
                            style={{
                                position: 'absolute',
                                right: 10,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                            }}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* MY TICKETS (only for ADMIN/TECHNICIAN) */}
                {!isUser && (
                    <button
                        onClick={() => {
                            setMyTickets((m) => !m);
                            setPage(0);
                        }}
                        className={`btn ${myTickets ? 'btn-primary' : 'btn-ghost'}`}
                    >
                        My Tickets
                    </button>
                )}

                {/* NEW TICKET (USER and ADMIN) */}
                {(isUser || isAdmin) && (
                    <Link to="/tickets/new" className="btn btn-primary">
                        + New Ticket
                    </Link>
                )}
            </div>

            {/* ─── STATUS FILTER TABS ─────────────── */}
            <StatusFilterTabs
                active={statusFilter}
                onChange={(s) => { setStatusFilter(s); setPage(0); }}
                counts={statusCounts}
            />

            {/* ─── RESULT INFO ───────────────────── */}
            <div style={{ marginBottom: 20, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {search
                    ? `${filtered.length} results for "${search}"`
                    : statusFilter !== 'ALL'
                        ? `${filtered.length} ${statusFilter.toLowerCase().replace('_', ' ')} tickets`
                        : `Showing ${data.content.length} of ${data.totalElements}`}
            </div>

            {/* ─── GRID ─────────────────────────── */}
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
                    <div className="spinner" style={{ width: 30, height: 30 }} />
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card"
                    style={{ textAlign: 'center', padding: 60 }}
                >
                    <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                        {isUser ? 'You haven\'t reported any incidents yet' : 'No tickets found'}
                    </p>
                    {(isUser || isAdmin) && (
                        <Link to="/tickets/new" className="btn btn-primary btn-sm">
                            + Report an Incident
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid-auto">
                    <AnimatePresence>
                        {filtered.map((t, i) => (
                            <TicketCard
                                key={t.id || i}
                                ticket={t}
                                index={i}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ─── PAGINATION ───────────────────── */}
            {data.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 40, justifyContent: 'center' }}>
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        className="btn btn-ghost btn-sm"
                    >
                        ← Prev
                    </button>

                    {Array.from({ length: data.totalPages }, (_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i)}
                            className={`btn btn-sm ${i === page ? 'btn-primary' : 'btn-ghost'}`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() =>
                            setPage((p) =>
                                Math.min(p + 1, data.totalPages - 1)
                            )
                        }
                        disabled={page >= data.totalPages - 1}
                        className="btn btn-ghost btn-sm"
                    >
                        Next →
                    </button>
                </div>
            )}
        </Layout>
    );
}