import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    STATUS_LABELS,
    STATUS_DOT_COLOR,
    formatDate
} from '../../utils/helpers';
import { CheckCircle2 } from 'lucide-react';

export default function StatusTimeline({ history = [] }) {
    const ref = useRef(null);

    useEffect(() => {
        const items = ref.current?.querySelectorAll('.tl-item');

        if (items && items.length > 0) {
            gsap.fromTo(
                items,
                { x: -20, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    stagger: 0.1,
                    duration: 0.5,
                    ease: 'power3.out'
                }
            );
        }
    }, [history]);

    if (!history || history.length === 0) {
        return (
            <div
                style={{
                    textAlign: 'center',
                    padding: '48px 0',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem'
                }}
            >
                No status history yet
            </div>
        );
    }

    return (
        <div className="timeline" ref={ref}>
            {history.map((item = {}, i) => {
                const isLast = i === history.length - 1;

                const toStatus = item?.toStatus;
                const fromStatus = item?.fromStatus;

                const color =
                    STATUS_DOT_COLOR[toStatus] || 'var(--accent-amber)';

                return (
                    <div key={item?.id || i} className="timeline-item tl-item">
                        <div
                            className="timeline-dot"
                            style={{
                                borderColor: color,
                                boxShadow: `0 0 8px ${color}40`
                            }}
                        />

                        <div
                            style={{
                                background: 'var(--bg-surface)',
                                border: `1px solid ${
                                    isLast ? color + '40' : 'var(--border-subtle)'
                                }`,
                                borderRadius: 'var(--radius-md)',
                                padding: '14px 16px'
                            }}
                        >
                            {/* Status change */}
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginBottom: 8,
                                    flexWrap: 'wrap'
                                }}
                            >
                                {fromStatus && (
                                    <>
                    <span
                        style={{
                            fontSize: '0.7rem',
                            color:
                                STATUS_DOT_COLOR[fromStatus] ||
                                'var(--text-muted)',
                            padding: '2px 8px',
                            borderRadius: 100,
                            background:
                                (STATUS_DOT_COLOR[fromStatus] || '#999') + '18',
                            border: `1px solid ${
                                (STATUS_DOT_COLOR[fromStatus] || '#999') + '30'
                            }`
                        }}
                    >
                      {STATUS_LABELS[fromStatus] || fromStatus}
                    </span>

                                        <span style={{ color: 'var(--text-muted)' }}>
                      →
                    </span>
                                    </>
                                )}

                                <span
                                    style={{
                                        fontSize: '0.7rem',
                                        color,
                                        padding: '2px 8px',
                                        borderRadius: 100,
                                        background: color + '18',
                                        border: `1px solid ${color}30`
                                    }}
                                >
                  {STATUS_LABELS[toStatus] || toStatus}
                </span>

                                {isLast && (
                                    <CheckCircle2
                                        size={13}
                                        style={{
                                            color: 'var(--accent-amber)',
                                            marginLeft: 'auto'
                                        }}
                                    />
                                )}
                            </div>

                            {/* Note */}
                            {item?.note && (
                                <p
                                    style={{
                                        fontSize: '0.8rem',
                                        color: 'var(--text-secondary)',
                                        marginBottom: 6,
                                        fontStyle: 'italic'
                                    }}
                                >
                                    {item.note}
                                </p>
                            )}

                            {/* Footer */}
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    fontFamily: 'var(--font-mono)'
                                }}
                            >
                <span>
                  by {item?.changedBy || 'system'}
                </span>

                                <span>
                  {formatDate(item?.changedAt)}
                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}