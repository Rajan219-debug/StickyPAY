import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle2, Clock, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import QRCode from 'react-qr-code';
import { motion, AnimatePresence } from 'framer-motion';

const downloadInvoice = (order) => {
    try {
        const items = order.items || [];
        const dateStr = order?.created_at ? new Date(order.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : '—';
        const lines = [
            '========================================',
            '           StickyPAY INVOICE            ',
            '========================================',
            `Transaction ID : ${order.transaction_id || 'N/A'}`,
            `Date & Time    : ${dateStr}`,
            `Store          : ${order.store_name || 'Store'}`,
            `Payment Mode   : ${order.payment_method?.toUpperCase() || 'N/A'}`,
            `Status         : ${order.verified ? 'Verified' : 'Pending'}`,
            '----------------------------------------',
            'ITEMS',
            '----------------------------------------',
            ...items.map((item, i) => `${i + 1}. ${item.name} x${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`),
            '----------------------------------------',
            `TOTAL PAID     : ₹${Number(order.total_amount || 0).toFixed(2)}`,
            '========================================',
        ];
        const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `Invoice_${order.transaction_id || 'order'}.txt`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) { alert('Failed to download invoice'); }
};

const FILTERS = ['All', 'UPI', 'Card', 'Wallet'];

export default function History() {
    const [orders, setOrders] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [enlargedQr, setEnlargedQr] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const u = JSON.parse(localStorage.getItem('sp_user') || 'null');
                let onlineOrders = [];
                if (u?.id) {
                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${u.id}`);
                    if (res.ok) {
                        const result = await res.json();
                        const data = result.orders || [];
                        onlineOrders = data.map(order => ({
                            ...order,
                            order_id: order.order_id || order.id,
                            store_name: order.store_name || order.store?.name || 'Store',
                            items: order.order_items?.map(item => ({
                                name: item.product?.name || item.name || 'Item',
                                quantity: item.quantity || 1,
                                price: item.price || 0,
                            })) || [],
                        }));
                    }
                }
                const saved = localStorage.getItem('sp_orders');
                const localOrders = saved ? JSON.parse(saved) : [];
                const formattedLocal = localOrders.map(o => ({
                    ...o, order_id: o.id || o.order_id,
                    transaction_id: o.qr_code_data || o.transaction_id || o.id,
                    verified: o.verified || o.status === 'verified',
                    created_at: o.created_date || o.created_at || new Date().toISOString(),
                    items: o.items || [],
                }));
                const allOrders = [...onlineOrders, ...formattedLocal].filter((v, i, a) =>
                    a.findIndex(t => (t.transaction_id && t.transaction_id === v.transaction_id) || (t.order_id && t.order_id === v.order_id)) === i
                );
                allOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                setOrders(allOrders);
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchOrders();
        setTimeout(fetchOrders, 1000);
        const channel = supabase.channel('rt-orders')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, fetchOrders)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, []);

    const filtered = activeFilter === 'All'
        ? orders
        : orders.filter(o => o.payment_method?.toLowerCase() === activeFilter.toLowerCase());

    // Group by date
    const grouped = filtered.reduce((acc, order) => {
        const date = order.created_at
            ? new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' })
            : 'Today';
        if (!acc[date]) acc[date] = [];
        acc[date].push(order);
        return acc;
    }, {});

    return (
        <div style={{ minHeight: '100vh', background: '#080B14', paddingBottom: 40 }}>

            {/* Header */}
            <div style={{ padding: '20px 20px 16px' }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', letterSpacing: '-0.4px' }}>History</h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 3 }}>All your past purchases</p>
            </div>

            {/* Filter chips — Dribbble style */}
            <div style={{ display: 'flex', gap: 8, padding: '0 16px 16px', overflowX: 'auto', scrollbarWidth: 'none' }}>
                {FILTERS.map(filter => (
                    <motion.button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        whileTap={{ scale: 0.94 }}
                        style={{
                            flexShrink: 0, padding: '8px 18px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                            cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif',
                            background: activeFilter === filter
                                ? 'linear-gradient(135deg, #F5C518, #e6ab00)'
                                : 'rgba(255,255,255,0.07)',
                            color: activeFilter === filter ? '#000' : 'rgba(255,255,255,0.5)',
                            boxShadow: activeFilter === filter ? '0 4px 15px rgba(245,197,24,0.3)' : 'none',
                            transition: 'all 0.2s',
                        }}>
                        {filter}
                    </motion.button>
                ))}
            </div>

            {/* Empty State */}
            {!loading && filtered.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', padding: '60px 32px' }}>
                    <div style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.05)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Clock size={36} color="rgba(255,255,255,0.2)" />
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 17, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>No transactions yet</p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6 }}>
                        {activeFilter !== 'All' ? `No ${activeFilter} payments found` : 'Scan a store QR code to start shopping'}
                    </p>
                </motion.div>
            )}

            {/* Skeleton loading */}
            {loading && (
                <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{ height: 72, borderRadius: 18, background: 'rgba(255,255,255,0.04)', overflow: 'hidden', position: 'relative' }}>
                            <div className="shimmer" style={{ position: 'absolute', inset: 0 }} />
                        </div>
                    ))}
                </div>
            )}

            {/* Grouped Orders */}
            {!loading && Object.entries(grouped).map(([date, dayOrders]) => (
                <div key={date} style={{ padding: '0 16px', marginBottom: 20 }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.35)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                        {date}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {dayOrders.map(order => {
                            const isExpanded = expandedOrder === (order.order_id || order.id);
                            const timeStr = order.created_at
                                ? new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
                                : '';
                            const initial = (order.store_name || 'S').charAt(0).toUpperCase();

                            return (
                                <motion.div
                                    key={order.order_id}
                                    layout
                                    style={{ borderRadius: 18, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>

                                    {/* Row */}
                                    <button
                                        onClick={() => setExpandedOrder(isExpanded ? null : (order.order_id || order.id))}
                                        style={{ width: '100%', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>

                                        {/* Avatar */}
                                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(245,197,24,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <span style={{ fontWeight: 800, fontSize: 18, color: '#F5C518' }}>{initial}</span>
                                        </div>

                                        {/* Info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontWeight: 600, fontSize: 14, color: '#fff', marginBottom: 2 }}>{order.store_name || 'Store'}</p>
                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                                                {order.payment_method?.toUpperCase() || 'UPI'} · {timeStr}
                                            </p>
                                        </div>

                                        {/* Amount */}
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontWeight: 800, fontSize: 15, color: '#EF4444' }}>
                                                -₹{Number(order.total_amount || 0).toFixed(2)}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3, marginTop: 2 }}>
                                                {order.verified
                                                    ? <CheckCircle2 size={11} color="#22C55E" />
                                                    : <Clock size={11} color="#F97316" />}
                                                <span style={{ fontSize: 10, color: order.verified ? '#22C55E' : '#F97316', fontWeight: 600 }}>
                                                    {order.verified ? 'Verified' : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                                <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

                                                    {/* QR */}
                                                    <button
                                                        onClick={() => setEnlargedQr(order)}
                                                        style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '12px 14px', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                                                        <div style={{ background: '#fff', padding: 6, borderRadius: 10 }}>
                                                            <QRCode value={order?.transaction_id || 'INVALID'} size={56} />
                                                        </div>
                                                        <div>
                                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 3 }}>Tap to view receipt QR</p>
                                                            <p style={{ fontSize: 12, fontFamily: 'monospace', color: '#F5C518', wordBreak: 'break-all' }}>
                                                                {(order?.transaction_id || 'N/A').slice(0, 20)}...
                                                            </p>
                                                        </div>
                                                    </button>

                                                    {/* Meta */}
                                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                        {[
                                                            { label: 'Store', value: order.store_name || 'Store' },
                                                            { label: 'Payment', value: order.payment_method?.toUpperCase() || 'UPI' },
                                                            { label: 'Status', value: order.verified ? 'Verified ✓' : 'Pending ⏳', color: order.verified ? '#22C55E' : '#F97316' },
                                                        ].map(row => (
                                                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                                                                <span style={{ fontSize: 13, fontWeight: 600, color: row.color || '#fff' }}>{row.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Items */}
                                                    {(order.items || []).length > 0 && (
                                                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: '12px 14px' }}>
                                                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Items</p>
                                                            {order.items.map((item, idx) => (
                                                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                                                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{item.name} ×{item.quantity}</span>
                                                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#F5C518' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                                                </div>
                                                            ))}
                                                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                                                <span style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>Total Paid</span>
                                                                <span style={{ fontWeight: 800, color: '#F5C518', fontSize: 15 }}>₹{Number(order.total_amount || 0).toFixed(2)}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Download */}
                                                    <button
                                                        onClick={() => downloadInvoice(order)}
                                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', padding: '13px', borderRadius: 14, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.25)', color: '#F5C518', fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
                                                        <Download size={14} />
                                                        Download Invoice
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* QR Modal */}
            <AnimatePresence>
                {enlargedQr && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setEnlargedQr(null)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: '#0D1220', borderRadius: 28, padding: 28, textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)', position: 'relative', maxWidth: 320, width: '100%' }}>
                            <button onClick={() => setEnlargedQr(null)}
                                style={{ position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                                <X size={16} color="rgba(255,255,255,0.6)" />
                            </button>
                            <h2 style={{ color: '#fff', fontWeight: 800, fontSize: 18, marginBottom: 20 }}>Receipt QR Code</h2>
                            <div style={{ background: '#fff', padding: 16, borderRadius: 20, display: 'inline-block', boxShadow: '0 0 30px rgba(245,197,24,0.4)' }}>
                                <QRCode value={enlargedQr?.transaction_id || 'INVALID'} size={180} />
                            </div>
                            <p style={{ marginTop: 16, fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>{enlargedQr?.transaction_id}</p>
                            <div style={{ marginTop: 12, background: 'rgba(245,197,24,0.1)', border: '1px solid rgba(245,197,24,0.25)', borderRadius: 12, padding: '10px 16px', fontSize: 12, color: '#F5C518', fontWeight: 600 }}>
                                Show this QR at the store counter
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}