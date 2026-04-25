import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import "./Sidebar.css";
import {
    LayoutDashboard,
    Ticket,
    Plus,
    AlertTriangle,
    BarChart3,
    Users,
    ChevronRight,
    Zap,
} from "lucide-react";

const NAV = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Ticket, label: "All Tickets", path: "/tickets" },
    { icon: Plus, label: "New Ticket", path: "/tickets/new", accent: true },
    { icon: AlertTriangle, label: "Overdue", path: "/tickets/overdue" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Workload", path: "/workload" },
];

export default function Sidebar() {
    const location = useLocation();
    const logoRef = useRef(null);
    const navRef = useRef(null);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const els = navRef.current?.querySelectorAll(".nv");

        if (els && els.length > 0) {
            gsap.fromTo(
                els,
                { x: -20, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.07,
                    duration: 0.5,
                    ease: "power3.out",
                    delay: 0.2,
                }
            );
        }

        if (logoRef.current) {
            gsap.fromTo(
                logoRef.current,
                { y: -12, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.5,
                    ease: "power3.out",
                }
            );
        }
    }, []);

    return (
        <motion.aside
            className="sidebar-shell"
            animate={{ width: collapsed ? 72 : 240 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
            {/* ─── LOGO ───────────────────────── */}
            <div
                ref={logoRef}
                style={{
                    padding: "28px 20px 24px",
                    borderBottom: "1px solid var(--border-subtle)",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                }}
            >
                <div
                    style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        flexShrink: 0,
                        background:
                            "linear-gradient(135deg, var(--accent-amber), #e8920f)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 0 16px rgba(245,166,35,0.4)",
                    }}
                >
                    <Zap size={18} color="#080c14" strokeWidth={2.5} />
                </div>

                {!collapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div
                            style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 700,
                                fontSize: "0.95rem",
                            }}
                        >
                            SmartCampus
                        </div>
                        <div
                            style={{
                                fontSize: "0.68rem",
                                color: "var(--text-muted)",
                                fontFamily: "var(--font-mono)",
                                marginTop: 2,
                            }}
                        >
                            OPS HUB v1.0
                        </div>
                    </motion.div>
                )}
            </div>

            {/* ─── NAV ───────────────────────── */}
            <nav
                ref={navRef}
                style={{
                    flex: 1,
                    padding: "16px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                }}
            >
                {NAV.map(({ icon: Icon, label, path, accent }) => {
                    const active =
                        location.pathname === path ||
                        (path !== "/" && location.pathname.startsWith(path));

                    return (
                        <Link
                            key={path}
                            to={path}
                            className="nv"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                padding: collapsed ? 10 : "10px 14px",
                                borderRadius: "var(--radius-md)",
                                justifyContent: collapsed ? "center" : "flex-start",
                                background: active
                                    ? accent
                                        ? "rgba(245,166,35,0.15)"
                                        : "rgba(255,255,255,0.06)"
                                    : "transparent",
                                color: active
                                    ? accent
                                        ? "var(--accent-amber)"
                                        : "var(--text-primary)"
                                    : "var(--text-muted)",
                                border:
                                    active && accent
                                        ? "1px solid rgba(245,166,35,0.2)"
                                        : "1px solid transparent",
                                transition: "all 0.15s ease",
                                textDecoration: "none",
                            }}
                        >
                            <Icon size={17} strokeWidth={active ? 2 : 1.5} />

                            {!collapsed && (
                                <span
                                    style={{
                                        fontSize: "0.875rem",
                                        fontWeight: active ? 600 : 400,
                                        whiteSpace: "nowrap",
                                    }}
                                >
                  {label}
                </span>
                            )}

                            {active && !collapsed && (
                                <ChevronRight
                                    size={14}
                                    style={{ marginLeft: "auto", opacity: 0.5 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* ─── COLLAPSE BUTTON ───────────────────────── */}
            <div
                style={{
                    padding: 12,
                    borderTop: "1px solid var(--border-subtle)",
                }}
            >
                <button
                    onClick={() => setCollapsed((c) => !c)}
                    style={{
                        width: "100%",
                        padding: 8,
                        borderRadius: "var(--radius-md)",
                        background: "var(--bg-hover)",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        gap: 8,
                        fontSize: "0.8rem",
                        border: "1px solid var(--border-subtle)",
                        cursor: "pointer",
                    }}
                >
                    <motion.div
                        animate={{ rotate: collapsed ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ChevronRight size={16} />
                    </motion.div>

                    {!collapsed && <span>Collapse</span>}
                </button>
            </div>
        </motion.aside>
    );
}