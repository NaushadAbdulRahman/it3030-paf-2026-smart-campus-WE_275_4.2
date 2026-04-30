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
    TrendingUp,
    Wrench,

    ClipboardList,
} from 'lucide-react';

import Layout from '../components/layout/Layout';
import TicketCard from '../components/tickets/TicketCard';
import { ticketApi, analyticsApi, bookingApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

gsap.registerPlugin(ScrollTrigger);

export default function Dashboard() {
    const { user, role, isAdmin, isTechnician, isUser } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({});
    const [bookingStats, setBookingStats] = useState({});
    const [overdue, setOverdue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const statsRef = useRef(null);
    const heroRef = useRef(null);

    // ─── DATA FETCH ─────────────────────────────────────
    useEffect(() => {
        const fetchData = async () => {
            try {
                const ticketParams = isUser
                    ? { page: 0, size: 6, myTickets: true }
                    : { page: 0, size: 6 };

                const [ticketData, statusData, overdueData, bStats] = await Promise.all([
                    ticketApi.getAll(ticketParams),
                    analyticsApi.byStatus().catch(() => ({})),
                    isAdmin || isTechnician ? ticketApi.getOverdue().catch(() => []) : Promise.resolve([]),
                    bookingApi.stats().catch(() => ({})),
                ]);

                setTickets(ticketData?.content || ticketData || []);
                setStats(statusData || {});
                setOverdue(overdueData || []);
                setBookingStats(bStats || {});
            } catch {
                // Silently handle
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [role, isUser, isAdmin, isTechnician, refreshKey]);

    // ─── ANIMATIONS ─────────────────────────────────────
    useEffect(() => {
        if (loading) return;

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

    // ─── STAT CARDS ─────────────────────────────────────
    const total = Object.values(stats || {}).reduce((a, b) => a + b, 0);
    const open = stats.OPEN || 0;
    const progress = stats.IN_PROGRESS || 0;
    const resolved = stats.RESOLVED || 0;

    const bPending = bookingStats.pending || 0;
    const bApproved = bookingStats.approved || 0;

    const getStatCards = () => {
        if (isUser) {
            return [
                { label: 'Open Tickets', value: tickets.filter(t => t.status === 'OPEN').length, icon: AlertTriangle, color: '#4a9eff', bg: 'rgba(74,158,255,0.08)' },
                { label: 'Resolved Tickets', value: tickets.filter(t => t.status === 'RESOLVED').length, icon: CheckCircle2, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)' },
                { label: 'Pending Bookings', value: bPending, icon: Clock, color: '#f5a623', bg: 'rgba(245,166,35,0.08)' },
                { label: 'Approved Bookings', value: bApproved, icon: ClipboardList, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)' },
            ];
        }
        if (isTechnician) {
            return [
                { label: 'Assigned Tickets', value: total, icon: Wrench, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)' },
                { label: 'Open', value: open, icon: AlertTriangle, color: '#4a9eff', bg: 'rgba(74,158,255,0.08)' },
                { label: 'In Progress', value: progress, icon: Clock, color: '#f5a623', bg: 'rgba(245,166,35,0.08)' },
                { label: 'Resolved', value: resolved, icon: CheckCircle2, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)' },
            ];
        }
        // ADMIN
        return [
            { label: 'Total Tickets', value: total, icon: Ticket, color: 'var(--accent-amber)', bg: 'rgba(245,166,35,0.08)' },
            { label: 'Open Tickets', value: open, icon: AlertTriangle, color: '#4a9eff', bg: 'rgba(74,158,255,0.08)' },
            { label: 'Pending Bookings', value: bPending, icon: Clock, color: '#f5a623', bg: 'rgba(245,166,35,0.08)' },
            { label: 'Approved Bookings', value: bApproved, icon: ClipboardList, color: '#00d4aa', bg: 'rgba(0,212,170,0.08)' },
        ];
    };

    const STAT_CARDS = getStatCards();

    // ─── HERO CONTENT ───────────────────────────────────
    const getHeroContent = () => {
        if (isUser) {
            return {
                title: 'My Incidents',
                subtitle: 'Track and manage your reported issues',
                cta: { label: '+ Report Incident', to: '/tickets/new' },
            };
        }
        if (isTechnician) {
            return {
                title: 'Technician Dashboard',
                subtitle: 'View and resolve your assigned incidents',
                cta: null,
            };
        }
        return {
            title: 'Campus Maintenance',
            subtitle: 'Track and manage incidents across campus',
            cta: { label: '+ New Ticket', to: '/tickets/new' },
        };
    };

    const hero = getHeroContent();

    const getRoleSubtitle = () => {
        if (isUser) return 'User Dashboard';
        if (isTechnician) return 'Technician Dashboard';
        return 'Admin Dashboard';
    };

    return (
        <Layout
            title="Dashboard"
            subtitle={getRoleSubtitle()}
        >

            {/* ─── HERO ───────────────────────────────────── */}
            <div ref={heroRef} style={{ marginBottom: 40 }}>
                <h1 className="hero-line">
                    {hero.title}
                </h1>

                <p className="hero-line" style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
                    {hero.subtitle}
                </p>

                {hero.cta && (
                    <div className="hero-line" style={{ marginTop: 20 }}>
                        <Link to={hero.cta.to} className="btn btn-primary">
                            {hero.cta.label} <ArrowRight size={14} />
                        </Link>
                    </div>
                )}
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
                            border: '1px solid var(--border-subtle)',
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Icon style={{ color }} size={20} />
                            <TrendingUp size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                        </div>
                        <div className="stat-num" data-target={value} style={{
                            fontFamily: 'var(--font-display)',
                            fontSize: '2rem',
                            fontWeight: 800,
                            lineHeight: 1,
                            color: color,
                            marginBottom: 4,
                        }}>
                            0
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>{label}</div>
                    </motion.div>
                ))}
            </div>

            {/* ─── OVERDUE (Admin/Technician only) ────────── */}
            {(isAdmin || isTechnician) && overdue.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        marginBottom: 24,
                        padding: '14px 18px',
                        background: 'rgba(255,87,87,0.08)',
                        border: '1px solid rgba(255,87,87,0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        fontSize: '0.85rem',
                    }}
                >
                    <AlertTriangle size={16} color="#ff5757" />
                    <span><strong style={{ color: '#ff5757' }}>{overdue.length}</strong> tickets overdue — need immediate attention</span>
                    <Link to="/tickets/overdue" className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto', borderColor: 'rgba(255,87,87,0.3)', color: '#ff5757' }}>
                        View All
                    </Link>
                </motion.div>
            )}

            {/* ─── RECENT TICKETS ───────────────────────── */}
            <div className="scroll-reveal">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <h2 style={{ fontSize: '1.1rem' }}>
                        {isUser ? 'My Recent Tickets' : 'Recent Tickets'}
                    </h2>
                    <Link to="/tickets" className="btn btn-ghost btn-sm">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
                        <div className="spinner" style={{ width: 30, height: 30 }} />
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: 60 }}>
                        <ClipboardList size={40} style={{ color: 'var(--text-muted)', marginBottom: 12 }} />
                        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>
                            {isUser ? 'You haven\'t reported any incidents yet' : 'No tickets found'}
                        </p>
                        {(isUser || isAdmin) && (
                            <Link to="/tickets/new" className="btn btn-primary btn-sm">
                                + Report an Incident
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid-auto">
                        {tickets.map((t, i) => (
                            <TicketCard
                                key={t.id}
                                ticket={t}
                                index={i}
                                inlineActions={isTechnician}
                                currentUserEmail={user?.email}
                                onStatusChanged={() => setRefreshKey(k => k + 1)}
                            />
                        ))}
                    </div>
                )}
            </div>

        </Layout>
    );
}