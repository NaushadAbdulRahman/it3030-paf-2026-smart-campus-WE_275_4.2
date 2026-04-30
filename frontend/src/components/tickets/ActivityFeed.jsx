import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import {
    GitCommit,
    MessageSquare,
    Paperclip,
    User,
    Zap
} from 'lucide-react';
import { timeAgo } from '../../utils/helpers';

const TYPE_CONFIG = {
    CREATED:      { icon: Zap,           color: '#f5a623' },
    STATUS_CHANGE:{ icon: GitCommit,     color: '#4a9eff' },
    COMMENT:      { icon: MessageSquare, color: '#00d4aa' },
    ATTACHMENT:   { icon: Paperclip,     color: '#a78bfa' },
    ASSIGNMENT:   { icon: User,          color: '#f472b6' },
};

export default function ActivityFeed({ activities = [] }) {
    const ref = useRef(null);

    const safeActivities = activities || [];

    useEffect(() => {
        const els = ref.current?.querySelectorAll('.act-item');

        if (els && els.length > 0) {
            gsap.fromTo(
                els,
                { opacity: 0, x: -12 },
                {
                    opacity: 1,
                    x: 0,
                    stagger: 0.06,
                    duration: 0.4,
                    ease: 'power2.out'
                }
            );
        }
    }, [safeActivities]);

    if (safeActivities.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
                No activity yet
            </div>
        );
    }

    return (
        <div ref={ref}>
            {safeActivities.map((act = {}, i) => {
                const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.CREATED;
                const Icon = cfg.icon;

                const actor =
                    act.actor?.split('@')[0] || 'system';

                return (
                    <div key={act.id || i} className="act-item">
                        <Icon size={14} style={{ color: cfg.color }} />

                        <div>
                            <div>
                                {act.description || 'Activity event'}
                            </div>

                            {act.detail && (
                                <div>{act.detail}</div>
                            )}

                            <div>
                                {timeAgo(act.timestamp)} • {actor}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}