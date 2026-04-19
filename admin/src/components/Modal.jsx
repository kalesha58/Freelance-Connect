import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, headerActions, maxWidth = '620px' }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed', inset: 0,
            zIndex: 9000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
        }}>
            {/* ── Backdrop ── */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(7, 11, 20, 0.75)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    animation: 'modal-backdrop-in 0.2s ease',
                }}
            />

            {/* ── Modal Card ── */}
            <div style={{
                width: '100%', maxWidth,
                maxHeight: '88vh',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
                position: 'relative',
                display: 'flex', flexDirection: 'column',
                overflow: 'hidden',
                animation: 'modal-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>
                {/* ── Header ── */}
                <div style={{
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '1rem', flexShrink: 0,
                    background: 'var(--bg-card)',
                }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0,
                    }}>
                        <div style={{
                            width: '4px', height: '20px',
                            background: 'linear-gradient(180deg, #6366f1, #8b5cf6)',
                            borderRadius: '99px', flexShrink: 0,
                        }} />
                        <h3 style={{
                            fontSize: '1.05rem', fontWeight: '800', margin: 0,
                            color: 'var(--text-main)', letterSpacing: '-0.01em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {title}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                        {headerActions}
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                width: '32px', height: '32px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: '8px',
                                background: 'var(--bg-main)',
                                border: '1px solid var(--border)',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--danger-light)';
                                e.currentTarget.style.color = 'var(--danger)';
                                e.currentTarget.style.borderColor = 'rgba(244,63,94,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'var(--bg-main)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                        >
                            <X size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto', flex: 1,
                }}>
                    {children}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes modal-backdrop-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modal-in {
                    from { opacity: 0; transform: scale(0.96) translateY(8px); }
                    to   { opacity: 1; transform: scale(1)    translateY(0); }
                }
            `}} />
        </div>,
        document.body
    );
};

export default Modal;
