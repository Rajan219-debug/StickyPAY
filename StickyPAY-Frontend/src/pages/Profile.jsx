import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { ShoppingBag, CreditCard, Bell, HelpCircle, ChevronRight, LogOut, Phone, Mail, Edit2, Check, Wallet, Settings } from 'lucide-react';
import { getUser, saveUser, getOrders, getTokens, getWallet, getPin } from '../components/localData';
import PinPad from '../components/PinPad';
import { motion } from 'framer-motion';

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [tokens, setTokens] = useState({ total: 0 });
    const [wallet, setWallet] = useState({ balance: 0 });
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [showPin, setShowPin] = useState(false);
    const hasPin = !!getPin();

    useEffect(() => {
        const u = getUser();
        setUser(u);
        setForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', address: u.address || '' });
        setOrders(getOrders());
        setTokens(getTokens());
        setWallet(getWallet());
    }, []);

    const saveProfile = () => { const updated = saveUser(form); setUser(updated); setEditing(false); };
    const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
    const initials = (user?.full_name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const menuItems = [
        { icon: ShoppingBag, label: 'Order History', page: 'History', badge: orders.length || null, color: '#F5C518' },
        { icon: CreditCard, label: 'Payment Methods', page: 'PaymentMethods', badge: null, color: '#6366F1' },
        { icon: Wallet, label: 'My Wallet', page: 'WalletPage', badge: `₹${wallet.balance.toFixed(0)}`, color: '#22C55E' },
        { icon: Bell, label: 'Notifications', page: 'Notifications', badge: null, color: '#F97316' },
        { icon: HelpCircle, label: 'Help & Support', page: 'HelpSupport', badge: null, color: '#06B6D4' },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#080B14', paddingBottom: 40 }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>Profile</h1>
                <button
                    onClick={() => editing ? saveProfile() : setEditing(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 12,
                        background: editing ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${editing ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        color: editing ? '#22C55E' : 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                    }}>
                    {editing ? <><Check size={14} /> Save</> : <><Edit2 size={14} /> Edit</>}
                </button>
            </div>

            {/* User Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ padding: '0 16px 16px' }}>
                <div style={{
                    borderRadius: 24, padding: '24px 20px',
                    background: 'linear-gradient(135deg, rgba(245,197,24,0.1) 0%, rgba(34,197,94,0.08) 100%)',
                    border: '1px solid rgba(245,197,24,0.2)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    {/* BG decoration */}
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(245,197,24,0.06)' }} />

                    {/* Avatar + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: 20, flexShrink: 0,
                            background: 'linear-gradient(135deg, #F5C518, #22C55E)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(245,197,24,0.3)',
                        }}>
                            <span style={{ fontWeight: 900, fontSize: 22, color: '#000' }}>{initials}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            {editing ? (
                                <input value={form.full_name}
                                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                                    style={{ width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '8px 12px', color: '#fff', fontSize: 16, fontWeight: 700, outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 4 }} />
                            ) : (
                                <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{user?.full_name || 'Guest User'}</h2>
                            )}
                            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>{user?.email || 'No email set'}</p>
                        </div>
                    </div>

                    {/* Contact Fields */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                            { Icon: Phone, key: 'phone', color: '#F5C518', placeholder: 'Mobile Number' },
                            { Icon: Mail, key: 'email', color: '#6366F1', placeholder: 'Email Address' },
                        ].map(({ Icon, key, color, placeholder }) => (
                            <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 14px' }}>
                                <Icon size={15} color={color} />
                                {editing ? (
                                    <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                                        style={{ flex: 1, background: 'none', border: 'none', color: '#fff', fontSize: 13, outline: 'none', fontFamily: 'Inter, sans-serif' }}
                                        placeholder={placeholder} />
                                ) : (
                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{user?.[key] || `Add ${placeholder.toLowerCase()}`}</span>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
                        {[
                            { val: orders.length, label: 'Orders', color: '#F5C518' },
                            { val: `₹${totalSpent.toFixed(0)}`, label: 'Spent', color: '#22C55E' },
                            { val: `🪙 ${tokens.total.toFixed(0)}`, label: 'Coins', color: '#F5C518' },
                        ].map(s => (
                            <div key={s.label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '12px 8px', textAlign: 'center' }}>
                                <p style={{ fontWeight: 800, fontSize: 18, color: s.color }}>{s.val}</p>
                                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* StickyCoins banner */}
            {tokens.total > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    style={{ padding: '0 16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(245,197,24,0.08)', border: '1px solid rgba(245,197,24,0.2)', borderRadius: 18, padding: '14px 16px' }}>
                        <span style={{ fontSize: 30 }}>🪙</span>
                        <div>
                            <p style={{ fontWeight: 700, color: '#F5C518', fontSize: 14 }}>{tokens.total.toFixed(2)} StickyCoins</p>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Worth ₹{tokens.total.toFixed(2)} · Use at checkout</p>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Menu Items */}
            <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {menuItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <motion.button
                            key={item.label}
                            initial={{ opacity: 0, x: -16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate(createPageUrl(item.page))}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', width: '100%', fontFamily: 'Inter, sans-serif' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{ width: 38, height: 38, borderRadius: 12, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Icon size={17} color={item.color} />
                                </div>
                                <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>{item.label}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                {item.badge && (
                                    <span style={{
                                        fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                                        background: typeof item.badge === 'number' ? 'rgba(245,197,24,0.15)' : 'rgba(34,197,94,0.15)',
                                        color: typeof item.badge === 'number' ? '#F5C518' : '#22C55E',
                                    }}>{item.badge}</span>
                                )}
                                <ChevronRight size={16} color="rgba(255,255,255,0.2)" />
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Logout */}
            <div style={{ padding: '16px 16px 0' }}>
                <button
                    onClick={() => setShowPin(true)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '15px', borderRadius: 18, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444', fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                    <LogOut size={16} />
                    Log Out
                </button>
            </div>

            {showPin && (
                <PinPad
                    title={hasPin ? 'Enter PIN to Log Out' : 'Set PIN to Continue'}
                    isSetup={!hasPin}
                    onSuccess={() => { setShowPin(false); localStorage.clear(); navigate('/Login'); }}
                    onCancel={() => setShowPin(false)}
                />
            )}
        </div>
    );
}