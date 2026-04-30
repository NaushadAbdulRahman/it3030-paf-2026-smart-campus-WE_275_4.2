import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    ChevronLeft,
    ChevronRight,
    Download,
    Edit3,
    Check
} from 'lucide-react';
import './ImageLightbox.css';

import { attachmentApi } from '../../services/api';
import { formatFileSize, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ImageLightbox({
                                          attachments = [],
                                          initialIndex = 0,
                                          onClose,
                                          onCaptionUpdate
                                      }) {
    const [idx, setIdx] = useState(initialIndex);
    const [editing, setEditing] = useState(false);
    const [caption, setCaption] = useState('');

    const current = attachments[idx];

    // Update caption when image changes
    useEffect(() => {
        setCaption(current?.caption || '');
        setEditing(false);
    }, [idx, current]);

    // Navigation (SAFE)
    const prev = useCallback(() => {
        if (!attachments.length) return;
        setIdx((i) => (i - 1 + attachments.length) % attachments.length);
    }, [attachments.length]);

    const next = useCallback(() => {
        if (!attachments.length) return;
        setIdx((i) => (i + 1) % attachments.length);
    }, [attachments.length]);

    // Keyboard controls (SAFE)
    useEffect(() => {
        const handleKey = (e) => {
            if (!attachments.length) return;

            if (e.key === 'ArrowLeft') prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape' && onClose) onClose();
        };

        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [prev, next, onClose, attachments.length]);

    // Save caption (SAFE)
    const saveCaption = async () => {
        if (!current) return;

        try {
            await attachmentApi.updateCaption(
                current.ticketId,
                current.id,
                caption
            );

            onCaptionUpdate?.(current.id, caption);
            setEditing(false);
            toast.success('Caption updated');
        } catch {
            toast.error('Failed to update caption');
        }
    };

    if (!current) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="lightbox-overlay"
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid var(--border-dim)',
                        borderRadius: 8,
                        padding: 8,
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex'
                    }}
                >
                    <X size={20} />
                </button>

                {/* Counter */}
                <div
                    style={{
                        position: 'absolute',
                        top: 24,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '4px 12px',
                        borderRadius: 100
                    }}
                >
                    {idx + 1} / {attachments.length}
                </div>

                {/* Image */}
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25 }}
                    onClick={(e) => e.stopPropagation()}
                    className="lightbox-image-wrap"
                >
                    <img
                        src={attachmentApi.getFileUrl(
                            current.ticketId,
                            current.id
                        )}
                        alt={current.fileName}
                        style={{
                            maxWidth: '100%',
                            maxHeight: '65vh',
                            objectFit: 'contain',
                            borderRadius: 12
                        }}
                    />
                </motion.div>

                {/* Arrows */}
                {attachments.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                prev();
                            }}
                            style={{ position: 'absolute', left: 24, top: '50%' }}
                        >
                            <ChevronLeft />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                next();
                            }}
                            style={{ position: 'absolute', right: 24, top: '50%' }}
                        >
                            <ChevronRight />
                        </button>
                    </>
                )}

                {/* Info */}
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ marginTop: 20, width: 600 }}
                >
                    <div>
                        {current.fileName} ·{' '}
                        {formatFileSize(current.fileSize)} ·{' '}
                        {formatDate(current.uploadedAt)}
                    </div>

                    {editing ? (
                        <>
                            <input
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                            <button onClick={saveCaption}>
                                <Check />
                            </button>
                        </>
                    ) : (
                        <p>{caption || 'No caption'}</p>
                    )}

                    <button onClick={() => setEditing((e) => !e)}>
                        <Edit3 />
                    </button>

                    <a
                        href={attachmentApi.getFileUrl(
                            current.ticketId,
                            current.id
                        )}
                        download
                    >
                        <Download />
                    </a>
                </div>

                {/* Thumbnails */}
                {attachments.length > 1 && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        {attachments.map((att, i) => (
                            <button
                                key={att.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIdx(i);
                                }}
                            >
                                <img
                                    src={attachmentApi.getFileUrl(
                                        att.ticketId,
                                        att.id
                                    )}
                                    alt=""
                                    width={50}
                                />
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}