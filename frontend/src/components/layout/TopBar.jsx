import React from "react";
import { Crown, User, Wrench } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import NotificationBell from "../notifications/NotificationBell";
import "./TopBar.css";

const ROLE_META = {
    ADMIN:      { label: 'Admin',      icon: Crown, color: '#f5a623', bg: 'rgba(245,166,35,0.12)' },
    USER:       { label: 'User',       icon: User,  color: '#4a9eff', bg: 'rgba(74,158,255,0.12)' },
    TECHNICIAN: { label: 'Technician', icon: Wrench, color: '#00d4aa', bg: 'rgba(0,212,170,0.12)' },
};

export default function TopBar({ title, subtitle }) {
    const { user, role } = useAuth();

    const meta = ROLE_META[role] || ROLE_META.USER;
    const RoleIcon = meta.icon;
    const initials = user?.name
        ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    return (
        <header
            style={{
                padding: "20px 32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid var(--border-subtle)",
                background: "var(--bg-surface)",
            }}
        >
            {/* Left — Title */}
            <div>
                {title && (
                    <h2
                        style={{
                            fontFamily: "var(--font-display)",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p
                        style={{
                            fontSize: "0.78rem",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-mono)",
                            marginTop: 2,
                        }}
                    >
                        {subtitle}
                    </p>
                )}
            </div>

            {/* Right — User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <NotificationBell />
                
                <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 4px' }} />

                {/* Role badge */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '4px 12px',
                        borderRadius: 100,
                        background: meta.bg,
                        border: `1px solid ${meta.color}33`,
                        color: meta.color,
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.06em',
                    }}
                >
                    <RoleIcon size={12} />
                    {meta.label}
                </div>

                {/* Avatar */}
                <div
                    style={{
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--bg-elevated), var(--bg-card))',
                        border: '1px solid var(--border-dim)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.04em',
                    }}
                    title={user?.email || ''}
                >
                    {initials}
                </div>
            </div>
        </header>
    );
}