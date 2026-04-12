import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ShieldAlert, ArrowLeft } from 'lucide-react';

const DELETION_EMAIL = 'kaleshabox8@gmail.com';

/**
 * Public page: how to request account and data deletion (no admin login required).
 */
const AccountDeletionInfo = () => {
    const [confirmed, setConfirmed] = useState(false);

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '1.5rem',
        }}>
            <div className="card glass animate-fade-in" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '2rem',
                borderRadius: 'var(--radius-xl)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}>
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <div style={{
                        width: '56px',
                        height: '56px',
                        backgroundColor: 'var(--primary)',
                        borderRadius: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: 'white',
                        boxShadow: 'var(--shadow-lg)',
                    }}>
                        <ShieldAlert size={28} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
                        Account &amp; data deletion
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
                        Freelancers and hiring partners can request deletion of their own account at any time.
                    </p>
                </div>

                {!confirmed ? (
                    <>
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.25rem' }}>
                            If you want your account and personal data removed, contact us using the email shown after you confirm below.
                            We delete accounts and remove personal information from our active databases within{' '}
                            <strong>30 days</strong> of a valid request, except where we must keep certain data by law (for example, tax or accounting records).
                        </p>
                        <button
                            type="button"
                            onClick={() => setConfirmed(true)}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                border: 'none',
                                backgroundColor: 'var(--primary)',
                                color: '#fff',
                                fontWeight: 600,
                                fontSize: '1rem',
                                cursor: 'pointer',
                            }}
                        >
                            Confirm
                        </button>
                    </>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-main)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1rem' }}>
                            Send a message to the address below. Use the subject line <strong>&quot;Data Deletion Request&quot;</strong> so we can process your request quickly.
                        </p>
                        <div style={{
                            padding: '1rem',
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            marginBottom: '1rem',
                            textAlign: 'center',
                        }}>
                            <Mail size={20} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
                            <a
                                href={`mailto:${DELETION_EMAIL}?subject=${encodeURIComponent('Data Deletion Request')}`}
                                style={{
                                    display: 'block',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    fontSize: '1.05rem',
                                    wordBreak: 'break-all',
                                }}
                            >
                                {DELETION_EMAIL}
                            </a>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.55, marginBottom: '1.25rem' }}>
                            Processing typically completes within 30 days. Some information may be retained where required by law.
                        </p>
                        <Link
                            to="/login"
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                color: 'var(--text-muted)',
                                fontSize: '0.9rem',
                                textDecoration: 'none',
                            }}
                        >
                            <ArrowLeft size={16} />
                            Admin login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default AccountDeletionInfo;
