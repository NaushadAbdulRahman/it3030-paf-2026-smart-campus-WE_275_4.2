import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, AlertCircle } from 'lucide-react';
import './AttachmentDropzone.css';

import { attachmentApi } from '../../services/api';
import { formatFileSize } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function AttachmentDropzone({
                                               ticketId,
                                               attachments = [],
                                               onUploaded,
                                               onDeleted,
                                               maxFiles = 3
                                           }) {
    const [dragging, setDragging] = useState(false);
    const [uploading, setUploading] = useState(false);

    const safeAttachments = attachments || [];
    const remaining = maxFiles - safeAttachments.length;

    // ─── HANDLE FILE UPLOAD ───────────────────────────────
    const handleFiles = useCallback(async (files) => {
        if (!ticketId) {
            toast.error('Ticket ID missing');
            return;
        }

        if (remaining <= 0) {
            toast.error(`Maximum ${maxFiles} attachments allowed`);
            return;
        }

        const file = files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File must be under 10MB');
            return;
        }

        setUploading(true);

        try {
            const result = await attachmentApi.upload(ticketId, file);

            onUploaded?.(result);
            toast.success('Attachment uploaded');
        } catch (e) {
            toast.error(e.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    }, [ticketId, remaining, maxFiles, onUploaded]);

    // ─── DRAG EVENTS ──────────────────────────────────────
    const onDrop = useCallback((e) => {
        e.preventDefault();
        setDragging(false);

        if (!e.dataTransfer?.files?.length) return;

        handleFiles(Array.from(e.dataTransfer.files));
    }, [handleFiles]);

    const onInputChange = (e) => {
        if (!e.target.files?.length) return;
        handleFiles(Array.from(e.target.files));
    };

    // ─── DELETE ───────────────────────────────────────────
    const handleDelete = async (att) => {
        if (!att || !ticketId) return;

        try {
            await attachmentApi.delete(ticketId, att.id);
            onDeleted?.(att.id);
            toast.success('Attachment removed');
        } catch {
            toast.error('Failed to remove attachment');
        }
    };

    return (
        <div>

            {/* ─── DROP ZONE ─────────────────────────────────── */}
            {remaining > 0 && (
                <label
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '28px 20px',
                        borderRadius: 'var(--radius-lg)',
                        cursor: uploading ? 'not-allowed' : 'pointer',
                        border: `2px dashed ${
                            dragging ? 'var(--accent-amber)' : 'var(--border-dim)'
                        }`,
                        background: dragging
                            ? 'var(--accent-glow)'
                            : 'var(--bg-surface)',
                        transition: 'all 0.2s ease',
                        marginBottom: safeAttachments.length ? 16 : 0,
                        opacity: uploading ? 0.6 : 1
                    }}
                >
                    <input
                        type="file"
                        accept="image/*"
                        onChange={onInputChange}
                        style={{ display: 'none' }}
                        disabled={uploading}
                    />

                    {uploading ? (
                        <div style={{ textAlign: 'center' }}>
                            <div className="spinner" />
                            <span style={{ fontSize: '0.82rem' }}>
                Uploading…
              </span>
                        </div>
                    ) : (
                        <>
                            <Upload size={20} />
                            <p>Drop image or click</p>
                            <p style={{ fontSize: '0.75rem' }}>
                                Max {maxFiles} · {remaining} left
                            </p>
                        </>
                    )}
                </label>
            )}

            {/* ─── ATTACHMENT LIST ───────────────────────────── */}
            <AnimatePresence>
                {safeAttachments.map((att) => (
                    <motion.div
                        key={att.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="attachment-row"
                    >
                        <img
                            src={attachmentApi.getFileUrl(att.ticketId, att.id)}
                            alt={att.fileName}
                            width={40}
                        />

                        <div style={{ flex: 1 }}>
                            <div>{att.fileName}</div>
                            <div style={{ fontSize: '0.7rem' }}>
                                {formatFileSize(att.fileSize)}
                            </div>
                        </div>

                        <button onClick={() => handleDelete(att)}>
                            <X size={14} />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* ─── LIMIT WARNING ─────────────────────────────── */}
            {remaining <= 0 && safeAttachments.length > 0 && (
                <div
                    style={{
                        display: 'flex',
                        gap: 8,
                        fontSize: '0.8rem'
                    }}
                >
                    <AlertCircle size={14} />
                    Max {maxFiles} reached
                </div>
            )}
        </div>
    );
}