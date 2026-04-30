import React from 'react';
import { STATUS_LABELS } from '../../utils/helpers';

const STATUSES = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED'];

const STATUS_COLORS = {
    ALL:         'var(--text-secondary)',
    OPEN:        '#4a9eff',
    IN_PROGRESS: '#f5a623',
    RESOLVED:    '#00d4aa',
    CLOSED:      '#8892a4',
    REJECTED:    '#ff5757',
};

export default function StatusFilterTabs({ active, onChange, counts = {} }) {
    return (
        <div className="tabs" style={{ marginBottom: 20 }}>
            {STATUSES.map(status => {
                const isActive = active === status;
                const count = status === 'ALL'
                    ? Object.values(counts).reduce((a, b) => a + (b || 0), 0)
                    : (counts[status] || 0);
                const color = STATUS_COLORS[status];
                const label = status === 'ALL' ? 'All' : (STATUS_LABELS[status] || status);

                return (
                    <button
                        key={status}
                        onClick={() => onChange(status)}
                        className={`tab-btn ${isActive ? 'active' : ''}`}
                        style={{
                            borderBottom: isActive ? `2px solid ${color}` : '2px solid transparent',
                        }}
                    >
                        <span style={{ color: isActive ? color : undefined }}>
                            {label}
                        </span>
                        {count > 0 && (
                            <span
                                style={{
                                    background: isActive ? color : 'var(--bg-elevated)',
                                    color: isActive ? '#080c14' : 'var(--text-muted)',
                                    borderRadius: 100,
                                    padding: '1px 6px',
                                    fontSize: '0.62rem',
                                    fontFamily: 'var(--font-mono)',
                                    fontWeight: 700,
                                    marginLeft: 4,
                                }}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
