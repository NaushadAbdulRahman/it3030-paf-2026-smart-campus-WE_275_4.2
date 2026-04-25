import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import {
    Ticket,
    AlertTriangle,
    CheckCircle2,
    Clock,
    ArrowRight,
    TrendingUp
} from 'lucide-react';

import Layout from '../components/layout/Layout';
import TicketCard from '../components/tickets/TicketCard';
import { ticketApi, analyticsApi } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);

    const statsRef = useRef(null);
    const heroRef = useRef(null);

    // ─── DATA FETCH ─────────────────────────────────────
    useEffect(() => {
        Promise.all([
            ticketApi.getAll({ page: 0, size: 6 }),
            analyticsApi.byStatus(),
            ticketApi.getOverdue(),
        ])
            .then(([ticketData, statusData, overdueData]) => {
                // SAFE handling for both paginated & non-paginated
                setTickets(ticketData?.content || ticketData || []);
                setStats(statusData || {});
                setOverdue(overdueData || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    // ─── ANIMATIONS ─────────────────────────────────────
    useEffect(() => {
        if (loading) return;

        // Hero animation
        gsap.fromTo(
            '.hero-line',
            { y: 40, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.12,
                duration: 0.7,
                ease: 'power3.out',
                delay: 0.1,
            }
        );

        // Stats counter
        const statEls = statsRef.current?.querySelectorAll('.stat-num');

        statEls?.forEach((el) => {
            const target = parseInt(el.dataset.target || '0', 10);

            gsap.fromTo(
                { val: 0 },
                { val: target },
                {
                    duration: 1.2,
                    ease: 'power2.out',
                    delay: 0.4,
                    onUpdate: function () {
                        el.textContent = Math.round(this.targets()[0].val);
                    },
                }
            );
        });

        // Scroll reveal
        gsap.fromTo(
            '.scroll-reveal',
            { y: 32, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.scroll-reveal',
                    start: 'top 85%',
                },
            }
        );
    }, [loading]);

    // ─── CALCULATIONS ───────────────────────────────────
    const total = Object.values(stats || {}).reduce((a, b) => a + b, 0);
    const open = stats.OPEN || 0;
    const progress = stats.IN_PROGRESS || 0;
    const resolved = stats.RESOLVED || 0;

    const STAT_CARDS = [
        {
            label: 'Total Tickets',
            value: total,
            icon: Ticket,
            color: 'var(--accent-amber)',
            bg: 'rgba(245,166,35,0.08)',
        },
        {
            label: 'Open',
            value: open,
            icon: AlertTriangle,
            color: '#4a9eff',
            bg: 'rgba(74,158,255,0.08)',
        },
        {
            label: 'In Progress',
            value: progress,
            icon: Clock,
            color: '#f5a623',
            bg: 'rgba(245,166,35,0.08)',
        },
        {
            label: 'Resolved',
            value: resolved,
            icon: CheckCircle2,
            color: '#00d4aa',
            bg: 'rgba(0,212,170,0.08)',
        },
    ];

    return (
        <Layout
            title="Dashboard"
            subtitle="Smart Campus Operations Hub — Module C"
        >

            {/* ─── HERO ───────────────────────────────────── */}
            <div ref={heroRef} style={{ marginBottom: 40 }}>
                <h1 className="hero-line">
                    Campus Maintenance
                </h1>

                <p className="hero-line">
                    Track and manage incidents across campus
                </p>

                <div className="hero-line" style={{ marginTop: 20 }}>
                    <Link to="/tickets/new" className="btn btn-primary">
                        + New Ticket <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* ─── STATS ─────────────────────────────────── */}
            <div
                ref={statsRef}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 16,
                    marginBottom: 40,
                }}
            >
                {STAT_CARDS.map(({ label, value, icon: Icon, color, bg }, i) => (
                    <motion.div
                        key={label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08 }}
                        style={{
                            background: 'var(--bg-card)',
                            padding: 20,
                            borderRadius: 12,
                        }}
                    >
                        <Icon style={{ color }} />
                        <div className="stat-num" data-target={value}>
                            0
                        </div>
                        <div>{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ─── OVERDUE ───────────────────────────────── */}
            {overdue.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                    ⚠ {overdue.length} tickets overdue
                </div>
            )}

            {/* ─── RECENT TICKETS ───────────────────────── */}
            <div className="scroll-reveal">
                <h2>Recent Tickets</h2>

                {loading ? (
                    <div>Loading...</div>
                ) : tickets.length === 0 ? (
                    <div>No tickets yet</div>
                ) : (
                    <div className="grid-auto">
                        {tickets.map((t, i) => (
                            <TicketCard key={t.id} ticket={t} index={i} />
                        ))}
                    </div>
                )}
            </div>

        </Layout>
    );
}