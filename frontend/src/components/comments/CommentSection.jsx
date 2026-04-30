import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Edit3, Trash2, Check, X } from 'lucide-react';
import './CommentSection.css';

import { commentApi } from '../../services/api';
import { timeAgo, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CURRENT_USER =
    localStorage.getItem('userEmail') || 'admin@campus.lk';

export default function CommentSection({
                                           ticketId,
                                           comments = [],
                                           onCommentsChange
                                       }) {
    const safeComments = comments || [];

    const [text, setText] = useState('');
    const [posting, setPosting] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editText, setEditText] = useState('');
    // validation added
    const [errors, setErrors] = useState({});
    // validation added
    const [editErrors, setEditErrors] = useState({});

    // validation added
    const validate = () => {
        const next = {};
        const value = text.trim();

        if (!value) {
            next.text = 'Comment cannot be empty';
        } else if (value.length < 2) {
            next.text = 'Comment must be at least 2 characters';
        }

        return next;
    };

    // validation added
    const validateEdit = () => {
        const next = {};
        const value = editText.trim();

        if (!value) {
            next.editText = 'Comment cannot be empty';
        } else if (value.length < 2) {
            next.editText = 'Comment must be at least 2 characters';
        }

        return next;
    };

    // ─── ADD COMMENT ─────────────────────────────
    const submit = async (e) => {
        e.preventDefault();

        if (!ticketId) {
            toast.error('Missing ticket');
            return;
        }

        // validation added
        const validation = validate();
        setErrors(validation);
        if (Object.keys(validation).length > 0) return;

        setPosting(true);

        try {
            const newComment = await commentApi.add(ticketId, text.trim());

            onCommentsChange?.([...safeComments, newComment]);
            setText('');
            setErrors({});

            toast.success('Comment added');
        } catch {
            toast.error('Failed to post comment');
        } finally {
            setPosting(false);
        }
    };

    // ─── EDIT ─────────────────────────────
    const startEdit = (c) => {
        setEditId(c.id);
        setEditText(c.content || '');
        setEditErrors({});
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditText('');
        setEditErrors({});
    };

    const saveEdit = async (commentId) => {
        // validation added
        const validation = validateEdit();
        setEditErrors(validation);
        if (Object.keys(validation).length > 0) return;

        try {
            const updated = await commentApi.update(
                ticketId,
                commentId,
                editText.trim()
            );

            onCommentsChange?.(
                safeComments.map((c) =>
                    c.id === commentId ? updated : c
                )
            );

            cancelEdit();
            toast.success('Comment updated');
        } catch {
            toast.error('Failed to update comment');
        }
    };

    // ─── DELETE ─────────────────────────────
    const deleteComment = async (commentId) => {
        if (!ticketId) return;

        if (!window.confirm('Delete this comment?')) return;

        try {
            await commentApi.delete(ticketId, commentId);

            onCommentsChange?.(
                safeComments.filter((c) => c.id !== commentId)
            );

            toast.success('Comment deleted');
        } catch {
            toast.error('Failed to delete comment');
        }
    };

    return (
        <div>

            {/* ─── COMMENT LIST ───────────────────── */}
            <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <AnimatePresence>

                    {safeComments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            No comments yet — be the first
                        </div>
                    )}

                    {safeComments.map((c = {}, i) => {
                        const isOwn =
                            c.createdBy === CURRENT_USER || c.editable;

                        const isEditing = editId === c.id;

                        const username =
                            c.createdBy?.split('@')[0] || 'user';

                        const initials =
                            c.createdBy?.substring(0, 2)?.toUpperCase() || 'U';

                        return (
                            <motion.div
                                key={c.id || i}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -16 }}
                                transition={{ delay: i * 0.04 }}
                                className="comment-row"
                            >
                                {/* Avatar */}
                                <div style={{ width: 32, height: 32, borderRadius: '50%', background: isOwn ? 'var(--accent-amber)' : 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>
                                    {initials}
                                </div>

                                <div style={{ flex: 1 }}>
                                    {/* Header */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <span>{username}</span>

                                        {isOwn && <span style={{ color: 'var(--accent-amber)' }}>you</span>}

                                        <span style={{ marginLeft: 'auto' }}>
                      {timeAgo(c.createdAt)}
                    </span>
                                    </div>

                                    {/* BODY */}
                                    {isEditing ? (
                                        <>
                      <textarea
                          value={editText}
                                                onChange={(e) => {
                                                    setEditText(e.target.value);
                                                    if (editErrors.editText) {
                                                        setEditErrors((prev) => ({ ...prev, editText: '' }));
                                                    }
                                                }}
                      />
                                            {/* validation added */}
                                            {editErrors.editText && (
                                                <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{editErrors.editText}</span>
                                            )}

                                            <button onClick={() => saveEdit(c.id)}>
                                                <Check size={14} />
                                            </button>

                                            <button onClick={cancelEdit}>
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div>
                                            {c.content}

                                            {isOwn && (
                                                <>
                                                    <button onClick={() => startEdit(c)}>
                                                        <Edit3 size={12} />
                                                    </button>

                                                    <button onClick={() => deleteComment(c.id)}>
                                                        <Trash2 size={12} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* ─── INPUT ───────────────────────────── */}
            <form onSubmit={submit} style={{ display: 'flex', gap: 10 }}>
        <textarea
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                if (errors.text) {
                    setErrors((prev) => ({ ...prev, text: '' }));
                }
            }}
            placeholder="Write a comment…"
        />
                {/* validation added */}
                {errors.text && (
                    <span style={{ color:'#ff5757', fontSize:'0.75rem' }}>{errors.text}</span>
                )}

                <button type="submit" disabled={!text.trim() || posting}>
                    {posting ? '...' : <Send size={16} />}
                </button>
            </form>
        </div>
    );
}