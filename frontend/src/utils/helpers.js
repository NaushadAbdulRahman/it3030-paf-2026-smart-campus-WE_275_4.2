import { formatDistanceToNow, format } from 'date-fns';

export const STATUS_LABELS = { OPEN:'Open', IN_PROGRESS:'In Progress', RESOLVED:'Resolved', CLOSED:'Closed', REJECTED:'Rejected' };
export const STATUS_CLASS  = { OPEN:'badge-open', IN_PROGRESS:'badge-progress', RESOLVED:'badge-resolved', CLOSED:'badge-closed', REJECTED:'badge-rejected' };
export const STATUS_DOT_COLOR = { OPEN:'#4a9eff', IN_PROGRESS:'#f5a623', RESOLVED:'#00d4aa', CLOSED:'#8892a4', REJECTED:'#ff5757' };
export const PRIORITY_LABELS = { LOW:'Low', MEDIUM:'Medium', HIGH:'High', CRITICAL:'Critical' };
export const PRIORITY_CLASS  = { LOW:'badge-low', MEDIUM:'badge-medium', HIGH:'badge-high', CRITICAL:'badge-critical' };
export const PRIORITY_COLOR  = { LOW:'#00d4aa', MEDIUM:'#4a9eff', HIGH:'#f5a623', CRITICAL:'#ff5757' };
export const SLA_HOURS = { LOW:72, MEDIUM:24, HIGH:8, CRITICAL:2 };
export const timeAgo = (date) => !date ? '—' : formatDistanceToNow(new Date(date), { addSuffix: true });
export const formatDate = (date) => !date ? '—' : format(new Date(date), 'dd MMM yyyy, HH:mm');
export const formatDateShort = (date) => !date ? '—' : format(new Date(date), 'dd MMM');
export const getSlaRemaining = (slaDeadline) => {
    if (!slaDeadline) return null;
    const diffMs = new Date(slaDeadline) - new Date();
    if (diffMs <= 0) return { breached: true, label: 'Overdue', ms: diffMs };
    const hours = Math.floor(diffMs / 3600000);
    const mins  = Math.floor((diffMs % 3600000) / 60000);
    if (hours > 24) return { breached: false, label: `${Math.floor(hours/24)}d ${hours%24}h`, ms: diffMs };
    if (hours > 0)  return { breached: false, label: `${hours}h ${mins}m`, ms: diffMs };
    return { breached: false, label: `${mins}m`, ms: diffMs, urgent: mins < 30 };
};
const CRITICAL_KEYWORDS = ['fire','flood','gas','emergency','dangerous','urgent','critical','collapse','injury'];
const HIGH_KEYWORDS     = ['broken','not working','fail','error','leak','damage','severe'];
const MEDIUM_KEYWORDS   = ['slow','intermittent','partial','sometimes','issue','problem'];
export const suggestPriority = (text = '') => {
    const lower = text.toLowerCase();
    if (CRITICAL_KEYWORDS.some(k => lower.includes(k))) return 'CRITICAL';
    if (HIGH_KEYWORDS.some(k => lower.includes(k)))     return 'HIGH';
    if (MEDIUM_KEYWORDS.some(k => lower.includes(k)))   return 'MEDIUM';
    return null;
};
export const CATEGORY_ICONS = { ELECTRICAL:'⚡', PLUMBING:'🔧', IT:'💻', HVAC:'❄️', FURNITURE:'🪑', STRUCTURAL:'🏗️', OTHER:'📋' };
export const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes/1024).toFixed(1)} KB`;
    return `${(bytes/1048576).toFixed(1)} MB`;
};
export const shortId = (id='') => id ? id.toString().substring(0,8).toUpperCase() : '';