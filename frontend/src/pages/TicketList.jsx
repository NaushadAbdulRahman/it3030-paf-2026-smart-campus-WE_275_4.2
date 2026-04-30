import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import './TicketList.css';

import Layout from '../components/layout/Layout';
import TicketCard from '../components/tickets/TicketCard';
import { ticketApi } from '../services/api';

export default function TicketList() {
    const [data, setData] = useState({
        content: [],
        totalElements: 0,
        totalPages: 1,
    });

    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState('');
    const [myTickets, setMyTickets] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // ─── LOAD DATA ─────────────────────────────
    const load = useCallback(async () => {
        setLoading(true);

        try {
            const result = await ticketApi.getAll({
                page,
                size: 12,
                myTickets,
            });

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
    }, [page, myTickets]);

    useEffect(() => {
        void load();
    }, [load]);

    // ─── FILTER SEARCH ─────────────────────────
    const filtered = search.trim()
        ? (data.content || []).filter((t) =>
            t.title?.toLowerCase().includes(search.toLowerCase()) ||
            t.description?.toLowerCase().includes(search.toLowerCase()) ||
            t.location?.toLowerCase().includes(search.toLowerCase())
        )
        : data.content || [];

    return (
        <Layout
            title="All Tickets"
            subtitle={`${data.totalElements} total incidents`}
        >
            {/* ─── TOOLBAR ───────────────────────── */}
            <div
                style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 24,
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

                {/* MY TICKETS */}
                <button
                    onClick={() => {
                        setMyTickets((m) => !m);
                        setPage(0);
                    }}
                    className={`btn ${myTickets ? 'btn-primary' : 'btn-ghost'}`}
                >
                    My Tickets
                </button>

                {/* FILTER BUTTON */}
                <button
                    onClick={() => setShowFilters((f) => !f)}
                    className="btn btn-ghost"
                >
                    <SlidersHorizontal size={15} /> Filters
                </button>
            </div>

            {/* ─── RESULT INFO ───────────────────── */}
            <div style={{ marginBottom: 20 }}>
                {search
                    ? `${filtered.length} results for "${search}"`
                    : `Showing ${data.content.length} of ${data.totalElements}`}
            </div>

            {/* ─── GRID ─────────────────────────── */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: 80 }}>
                    Loading...
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ticket-list-empty"
                >
                    No tickets found
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
                <div style={{ display: 'flex', gap: 8, marginTop: 40 }}>
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                    >
                        ← Prev
                    </button>

                    {Array.from({ length: data.totalPages }, (_, i) => (
                        <button key={i} onClick={() => setPage(i)}>
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
                    >
                        Next →
                    </button>
                </div>
            )}
        </Layout>
    );
}