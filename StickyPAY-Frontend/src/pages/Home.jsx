import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { ScanLine, ArrowRight, Store, History, Copy, Check, Tag, ChevronRight } from 'lucide-react';
import { getUser, getOrders } from '../components/localData';
import { motion, AnimatePresence } from 'framer-motion';
import { StoreContext } from '@/lib/StoreContext';

const ALL_OFFERS = [
    { code: 'SAVE10', title: '10% Off', desc: 'Orders above ₹500', color: ['#F5C518', '#F97316'], storeKey: null },
    { code: 'NEWUSER', title: '₹50 Off', desc: 'First order flat discount', color: ['#22C55E', '#06B6D4'], storeKey: null },
    { code: 'UPI5', title: '5% Cashback', desc: 'Pay via UPI', color: ['#6366F1', '#8B5CF6'], storeKey: null },
    { code: 'WEEKEND20', title: '20% Off', desc: 'Weekend special', color: ['#EC4899', '#EF4444'], storeKey: 'Demo Store' },
];

export default function Home() {
    const navigate = useNavigate();
    const { activeStore: currentStore } = useContext(StoreContext);
    const [greeting, setGreeting] = useState('');
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [copied, setCopied] = useState('');

    useEffect(() => {
        const u = getUser();
        if (!u?.full_name) { navigate(createPageUrl('Login')); return; }
        const h = new Date().getHours();
        setGreeting(h < 12 ? 'Good Morning' : h < 18 ? 'Good Afternoon' : 'Good Evening');
        setUser(u);
        setOrders(getOrders());
    }, [navigate]);

    const copy = (code) => {
        navigator.clipboard.writeText(code).catch(() => { });
        setCopied(code);
        setTimeout(() => setCopied(''), 2000);
    };

    const visibleOffers = currentStore
        ? ALL_OFFERS.filter(o => !o.storeKey || o.storeKey === currentStore.name)
        : ALL_OFFERS;

    const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);

    return (
        <div style={{ minHeight: '100vh', background: '#080B14', paddingBottom: 40 }}>

            {/* Top greeting */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                style={{ padding: '20px 20px 12px' }}
            >
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginBottom: 4 }}>{greeting} 👋</p>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>
                    {user?.full_name?.split(' ')[0] || 'Shopper'}
                </h1>
            </motion.div>

            {/* Main Hero Scan Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{ padding: '0 16px 0' }}
            >
                <Link to={createPageUrl('Scanner')} style={{ display: 'block' }}>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="shimmer"
                        style={{
                            borderRadius: 24,
                            background: 'linear-gradient(135deg, #F5C518 0%, #e6ab00 40%, #22C55E 100%)',
                            padding: '28px 24px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 8px 32px rgba(245,197,24,0.25)',
                        }}>
                        {/* Decorative circles */}
                        <div style={{
                            position: 'absolute', top: -40, right: -40, width: 150, height: 150,
                            borderRadius: '50%', background: 'rgba(255,255,255,0.12)',
                        }} />
                        <div style={{
                            position: 'absolute', bottom: -30, left: -20, width: 100, height: 100,
                            borderRadius: '50%', background: 'rgba(0,0,0,0.08)',
                        }} />
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                <div>
                                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                                        {currentStore ? `Shopping at ${currentStore.name}` : 'Self-Checkout'}
                                    </p>
                                    <h2 style={{ fontSize: 24, fontWeight: 800, color: '#000', letterSpacing: '-0.5px' }}>
                                        {currentStore ? 'Scan Items' : 'Start Shopping'}
                                    </h2>
                                    <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: 13, marginTop: 4 }}>
                                        {currentStore ? 'Scan barcodes to add to cart' : 'Scan store QR to begin'}
                                    </p>
                                </div>
                                <div style={{
                                    width: 48, height: 48, borderRadius: 16, background: 'rgba(0,0,0,0.15)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <ScanLine size={24} color="#000" strokeWidth={2.5} />
                                </div>
                            </div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                                background: '#000', borderRadius: 12, padding: '10px 18px',
                            }}>
                                <ScanLine size={15} color="#F5C518" />
                                <span style={{ color: '#F5C518', fontSize: 13, fontWeight: 700 }}>
                                    {currentStore ? 'Scan Barcode' : 'Scan Store QR'}
                                </span>
                                <ArrowRight size={14} color="#F5C518" />
                            </div>
                        </div>
                    </motion.div>
                </Link>
            </motion.div>

            {/* Active Store Badge */}
            <AnimatePresence>
                {currentStore && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        style={{ padding: '12px 16px 0' }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            background: 'rgba(245,197,24,0.08)',
                            border: '1px solid rgba(245,197,24,0.2)',
                            borderRadius: 16, padding: '12px 16px',
                        }}>
                            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(245,197,24,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Store size={17} color="#F5C518" />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>Currently shopping at</p>
                                <p style={{ color: '#F5C518', fontWeight: 700, fontSize: 14 }}>{currentStore.name}</p>
                            </div>
                            <span style={{ background: 'rgba(34,197,94,0.2)', color: '#22C55E', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8 }}>LIVE</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats Row */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, padding: '16px 16px 0' }}
            >
                {[
                    { label: 'Orders', value: orders.length, color: '#F5C518' },
                    { label: 'Spent', value: `₹${totalSpent.toFixed(0)}`, color: '#22C55E' },
                    { label: 'Fast Pay', value: 'UPI', color: '#6366F1' },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        whileTap={{ scale: 0.96 }}
                        style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 18, padding: '14px 12px', textAlign: 'center', cursor: 'pointer',
                        }}>
                        <p style={{ fontSize: 20, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{stat.label}</p>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Orders */}
            {orders.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    style={{ padding: '20px 16px 0' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <History size={16} color="#F5C518" />
                            <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Recent Transactions</span>
                        </div>
                        <button onClick={() => navigate(createPageUrl('History'))}
                            style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#F5C518', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                            See All <ChevronRight size={13} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {orders.slice(0, 3).map((order, i) => {
                            const initial = (order.store_name || 'S').charAt(0).toUpperCase();
                            const colors = ['#F5C518', '#22C55E', '#6366F1'];
                            return (
                                <motion.div
                                    key={order.id || i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.05 * i }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        background: 'rgba(255,255,255,0.04)',
                                        border: '1px solid rgba(255,255,255,0.06)',
                                        borderRadius: 16, padding: '12px 14px',
                                    }}>
                                    <div style={{
                                        width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                                        background: `${colors[i % 3]}20`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <span style={{ fontWeight: 800, fontSize: 16, color: colors[i % 3] }}>{initial}</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 2 }}>{order.store_name || 'Store'}</p>
                                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                            {order.created_date ? new Date(order.created_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Today'}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontWeight: 700, fontSize: 15, color: '#22C55E' }}>-₹{Number(order.total_amount || 0).toFixed(2)}</p>
                                        <p style={{ fontSize: 10, color: '#22C55E', fontWeight: 600 }}>Paid</p>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Offers */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                style={{ padding: '20px 16px 0' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag size={16} color="#F5C518" />
                        <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Offers for You</span>
                    </div>
                    <button onClick={() => navigate(createPageUrl('Offers'))}
                        style={{ color: '#F5C518', fontSize: 12, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                        View All <ChevronRight size={13} />
                    </button>
                </div>

                {/* Horizontal scroll offers */}
                <div style={{ display: 'flex', overflowX: 'auto', gap: 12, paddingBottom: 8, scrollbarWidth: 'none' }}>
                    {visibleOffers.map((offer, i) => (
                        <motion.div
                            key={offer.code}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 * i }}
                            whileHover={{ scale: 1.03 }}
                            style={{
                                flexShrink: 0, width: 200, borderRadius: 20,
                                background: `linear-gradient(135deg, ${offer.color[0]}18, ${offer.color[1]}12)`,
                                border: `1px solid ${offer.color[0]}25`,
                                padding: '16px 14px', cursor: 'pointer',
                            }}>
                            <div style={{
                                display: 'inline-block', padding: '4px 10px', borderRadius: 8, marginBottom: 10,
                                background: `linear-gradient(135deg, ${offer.color[0]}, ${offer.color[1]})`,
                            }}>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#000' }}>{offer.title}</span>
                            </div>
                            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 12, lineHeight: 1.4 }}>{offer.desc}</p>
                            <button
                                onClick={() => copy(offer.code)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    background: 'rgba(255,255,255,0.06)', border: '1px dashed rgba(255,255,255,0.15)',
                                    borderRadius: 10, padding: '8px 10px', cursor: 'pointer',
                                }}>
                                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: offer.color[0], letterSpacing: 2 }}>{offer.code}</span>
                                {copied === offer.code
                                    ? <Check size={14} color="#22C55E" />
                                    : <Copy size={14} color="rgba(255,255,255,0.3)" />}
                            </button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
