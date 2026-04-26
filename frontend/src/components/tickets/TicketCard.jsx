import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    MapPin,
    Clock,
    User,
    Paperclip,
    MessageSquare,
    ChevronRight
} from 'lucide-react';

import {
    STATUS_CLASS,
    STATUS_LABELS,
    PRIORITY_CLASS,
    PRIORITY_LABELS,
    CATEGORY_ICONS,
    timeAgo,
    getSlaRemaining,
    shortId
} from '../../utils/helpers';

export default function TicketCard({ ticket, index = 0 }) {
    const sla = getSlaRemaining(ticket?.slaDeadline);
    const icon = CATEGORY_ICONS[ticket?.category] || '📋';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.4,
                ease: [0.16, 1, 0.3, 1],
                delay: index * 0.05
            }}
        >
            <Link
                to={`/tickets/${ticket.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
            >
                <div
                    className="card"
                    style={{ cursor: 'pointer', position: 'relative' }}
                >
                    {/* SLA breach stripe */}
                    {ticket?.slaBreached && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 3,
                                background: 'linear-gradient(90deg, #ff5757, transparent)',
                                borderRadius: '16px 16px 0 0'
                            }}
                        />
                    )}

                    {/* Header */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'space-between',
                            gap: 12,
                            marginBottom: 12
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                flex: 1,
                                minWidth: 0
                            }}
                        >
                            <div
                                style={{
                                    width: 38,
                                    height: 38,
                                    borderRadius: 10,
                                    flexShrink: 0,
                                    background: 'var(--bg-elevated)',
                                    border: '1px solid var(--border-dim)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.1rem'
                                }}
                            >
                                {icon}
                            </div>

                            <div style={{ minWidth: 0 }}>
                                <div
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.65rem',
                                        color: 'var(--text-muted',
                                        marginBottom: 2,
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    #{shortId(ticket?.id)}
                                </div>

                                <h3
                                    style={{
                                        fontSize: '0.9rem',
                                        fontWeight: 600,
                                        fontFamily: 'var(--font-display)',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}
                                >
                                    {ticket?.title}
                                </h3>
                            </div>
                        </div>

                        <ChevronRight
                            size={15}
                            style={{
                                color: 'var(--text-muted)',
                                flexShrink: 0,
                                marginTop: 4
                            }}
                        />
                    </div>

                    {/* Description */}
                    <p
                        style={{
                            fontSize: '0.82rem',
                            color: 'var(--text-secondary)',
                            lineHeight: 1.55,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            marginBottom: 14
                        }}
                    >
                        {ticket?.description}
                    </p>

                    {/* Badges */}
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                            marginBottom: 14
                        }}
                    >
            <span className={`badge ${STATUS_CLASS[ticket?.status]}`}>
              {STATUS_LABELS[ticket?.status]}
            </span>

                        <span className={`badge ${PRIORITY_CLASS[ticket?.priority]}`}>
              {PRIORITY_LABELS[ticket?.priority]}
            </span>

                        {ticket?.slaBreached && (
                            <span
                                className="badge"
                                style={{
                                    background: 'rgba(255,87,87,0.12)',
                                    color: '#ff5757',
                                    border: '1px solid rgba(255,87,87,0.2)'
                                }}
                            >
                ⚠ SLA Breached
              </span>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                            paddingTop: 12,
                            borderTop: '1px solid var(--border-subtle)',
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            flexWrap: 'wrap'
                        }}
                    >
                        {/* Location */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <MapPin size={11} />
                            {ticket?.location || 'N/A'}
            </span>

                        {/* Time */}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Clock size={11} />
                            {timeAgo(ticket?.createdAt)}
            </span>

                        {/* Assigned */}
                        {ticket?.assignedTo && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <User size={11} />
                                {ticket.assignedTo?.split('@')[0]}
              </span>
                        )}

                        {/* Right side */}
                        <div
                            style={{
                                marginLeft: 'auto',
                                display: 'flex',
                                gap: 10,
                                alignItems: 'center'
                            }}
                        >
                            {/* Attachments */}
                            {(ticket?.attachmentCount || 0) > 0 && (
                                <span style={{ display: 'flex', gap: 3 }}>
                  <Paperclip size={11} />
                                    {ticket.attachmentCount}
                </span>
                            )}

                            {/* Comments */}
                            {(ticket?.commentCount || 0) > 0 && (
                                <span style={{ display: 'flex', gap: 3 }}>
                  <MessageSquare size={11} />
                                    {ticket.commentCount}
                </span>
                            )}

                            {/* SLA */}
                            {sla && !sla.breached && (
                                <span
                                    style={{
                                        fontFamily: 'var(--font-mono)',
                                        fontSize: '0.68rem',
                                        color: sla.urgent
                                            ? '#f5a623'
                                            : 'var(--text-muted)'
                                    }}
                                >
                  {sla.label}
                </span>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}