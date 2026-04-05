import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            animation: 'fade-in 0.2s ease-out'
        }}>
            {/* Backdrop */}
            <div 
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                    backdropFilter: 'blur(4px)',
                    animation: 'fade-in 0.2s ease-out'
                }} 
                onClick={onClose} 
            />

            {/* Modal Content */}
            <div 
                className="card animate-scale-in" 
                style={{
                    width: '100%',
                    maxWidth: '550px',
                    backgroundColor: 'white',
                    position: 'relative',
                    padding: 0,
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    borderRadius: '16px',
                    border: '1px solid var(--border)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '1.25rem 1.75rem',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff'
                }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '700', margin: 0, color: 'var(--text-main)' }}>
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-light)',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'var(--transition)'
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: '1.75rem' }}>
                    {children}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scale-in {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}} />
        </div>
    );
};

export default Modal;
