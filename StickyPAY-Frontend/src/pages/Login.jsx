import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { User, Phone, Mail, MapPin, ArrowRight } from 'lucide-react';
import { saveUser, getUser } from '../components/localData';
import { motion, AnimatePresence } from 'framer-motion';

const fields = [
    { key: 'full_name', label: 'Full Name', type: 'text', Icon: User, required: true },
    { key: 'phone', label: 'Mobile Number', type: 'tel', Icon: Phone, required: true },
    { key: 'email', label: 'Email Address', type: 'email', Icon: Mail, required: false },
    { key: 'address', label: 'Delivery Address (Optional)', type: 'text', Icon: MapPin, required: false },
];

export default function Login() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ full_name: '', phone: '', email: '', address: '' });
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState('');

    useEffect(() => {
        const existing = getUser();
        if (existing?.full_name) navigate(createPageUrl('Home'));
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.full_name || !form.phone) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/profiles/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (res.ok && data.user) {
                saveUser(data.user);
                navigate(createPageUrl('Home'));
            } else {
                alert(data.message || 'Error logging in');
            }
        } catch {
            alert('Unable to connect to the server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: '#080B14', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 24px 40px' }}>

            {/* Background glow orbs */}
            <div style={{
                position: 'fixed', top: '-20%', left: '50%', transform: 'translateX(-50%)',
                width: 400, height: 400, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(245,197,24,0.08) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0,
            }} />
            <div style={{
                position: 'fixed', bottom: '-10%', right: '-10%',
                width: 300, height: 300, borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(34,197,94,0.07) 0%, transparent 70%)',
                pointerEvents: 'none', zIndex: 0,
            }} />

            <div style={{ position: 'relative', zIndex: 1, maxWidth: 380, margin: '0 auto', width: '100%' }}>

                {/* Logo */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 40 }}
                >
                    <motion.div
                        animate={{ boxShadow: ['0 0 15px rgba(245,197,24,0.3)', '0 0 40px rgba(245,197,24,0.65)', '0 0 15px rgba(245,197,24,0.3)'] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                            width: 72, height: 72, borderRadius: 22,
                            background: 'linear-gradient(135deg, #F5C518, #22C55E)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 20,
                        }}>
                        <span style={{ color: '#000', fontWeight: 900, fontSize: 32 }}>S</span>
                    </motion.div>
                    <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.5px' }}>
                        Welcome to <span style={{ background: 'linear-gradient(135deg, #F5C518, #22C55E)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>StickyPAY</span>
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, textAlign: 'center', lineHeight: 1.5 }}>
                        Scan products & pay seamlessly. No queues, no hassle.
                    </p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {fields.map((field, i) => {
                            const Icon = field.Icon;
                            const isFocused = focused === field.key;
                            return (
                                <motion.div
                                    key={field.key}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 + i * 0.07 }}
                                    style={{ position: 'relative' }}
                                >
                                    <div style={{
                                        position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                                        pointerEvents: 'none', transition: 'color 0.2s',
                                        color: isFocused ? '#F5C518' : 'rgba(255,255,255,0.25)',
                                    }}>
                                        <Icon size={17} />
                                    </div>
                                    {field.key === 'address' ? (
                                        <textarea
                                            value={form[field.key]}
                                            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                            onFocus={() => setFocused(field.key)}
                                            onBlur={() => setFocused('')}
                                            placeholder={field.label}
                                            rows={3}
                                            style={{
                                                width: '100%', paddingLeft: 46, paddingRight: 16, paddingTop: 16, paddingBottom: 16,
                                                background: isFocused ? 'rgba(245,197,24,0.05)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${isFocused ? 'rgba(245,197,24,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                                borderRadius: 16, color: '#fff', fontSize: 14,
                                                outline: 'none', resize: 'none', fontFamily: 'Inter, sans-serif',
                                                transition: 'all 0.2s', lineHeight: 1.5,
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type={field.type}
                                            required={field.required}
                                            value={form[field.key]}
                                            onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                            onFocus={() => setFocused(field.key)}
                                            onBlur={() => setFocused('')}
                                            placeholder={field.label}
                                            style={{
                                                width: '100%', paddingLeft: 46, paddingRight: 16,
                                                paddingTop: 16, paddingBottom: 16,
                                                background: isFocused ? 'rgba(245,197,24,0.05)' : 'rgba(255,255,255,0.04)',
                                                border: `1px solid ${isFocused ? 'rgba(245,197,24,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                                borderRadius: 16, color: '#fff', fontSize: 14,
                                                outline: 'none', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s',
                                            }}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.45 }}
                        style={{ marginTop: 24 }}
                    >
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.015 }}
                            whileTap={{ scale: 0.97 }}
                            className="shimmer"
                            style={{
                                width: '100%', padding: '17px 24px',
                                background: loading ? 'rgba(245,197,24,0.5)' : 'linear-gradient(135deg, #F5C518, #e6b800)',
                                borderRadius: 18, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                color: '#000', fontSize: 16, fontWeight: 700, fontFamily: 'Inter, sans-serif',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                boxShadow: loading ? 'none' : '0 0 25px rgba(245,197,24,0.35)',
                            }}>
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <svg style={{ animation: 'spin 0.8s linear infinite', width: 18, height: 18 }} viewBox="0 0 24 24" fill="none">
                                        <circle cx="12" cy="12" r="10" stroke="rgba(0,0,0,0.3)" strokeWidth="3"/>
                                        <path d="M12 2a10 10 0 0 1 10 10" stroke="#000" strokeWidth="3" strokeLinecap="round"/>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                <><span>Get Started</span><ArrowRight size={18} /></>
                            )}
                        </motion.button>
                    </motion.div>
                </form>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 20, lineHeight: 1.6 }}>
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </motion.p>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
