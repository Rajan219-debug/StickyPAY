import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '../lib/utils';
import { Home, ScanLine, User, ShoppingCart, History } from 'lucide-react';
import { motion } from 'framer-motion';

const leftItems = [
    { name: 'Home', icon: Home, page: 'Home' },
    { name: 'History', icon: History, page: 'History' },
];
const rightItems = [
    { name: 'Cart', icon: ShoppingCart, page: 'Cart' },
    { name: 'Profile', icon: User, page: 'Profile' },
];

export default function BottomNav({ cartCount = 0 }) {
    const location = useLocation();
    const currentPath = location.pathname.replace('/', '') || 'Home';

    const NavItem = ({ item }) => {
        const isActive = currentPath.toLowerCase() === item.page.toLowerCase();
        const Icon = item.icon;
        return (
            <Link to={createPageUrl(item.page)} className="flex flex-col items-center gap-1 px-3 py-1 relative">
                <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="relative w-10 h-10 flex items-center justify-center rounded-2xl transition-all duration-300"
                    style={{
                        background: isActive ? 'rgba(245,197,24,0.15)' : 'transparent',
                    }}
                >
                    <Icon
                        className="w-5 h-5 transition-all duration-300"
                        style={{ color: isActive ? '#F5C518' : 'rgba(255,255,255,0.35)', strokeWidth: isActive ? 2.5 : 1.8 }}
                    />
                    {item.name === 'Cart' && cartCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4.5 h-4.5 flex items-center justify-center rounded-full text-black font-black"
                            style={{ background: '#22C55E', fontSize: 9, width: 18, height: 18 }}
                        >
                            {cartCount > 9 ? '9+' : cartCount}
                        </motion.span>
                    )}
                </motion.div>
                <span className="text-xs font-medium transition-all duration-300"
                    style={{ color: isActive ? '#F5C518' : 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: isActive ? 600 : 400 }}>
                    {item.name}
                </span>
                {isActive && (
                    <motion.div
                        layoutId="nav-indicator"
                        className="absolute -bottom-2 w-5 h-0.5 rounded-full"
                        style={{ background: '#F5C518' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                )}
            </Link>
        );
    };

    const isScannerActive = currentPath.toLowerCase() === 'scanner';

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40"
            style={{
                background: 'rgba(8,11,20,0.95)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                paddingBottom: 'env(safe-area-inset-bottom, 8px)',
            }}>
            <div className="flex justify-between items-center max-w-sm mx-auto px-4 pt-2 pb-3 relative">
                {/* Left */}
                <div className="flex gap-1">
                    {leftItems.map(item => <NavItem key={item.name} item={item} />)}
                </div>

                {/* Center scanner FAB */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-7">
                    <Link to={createPageUrl('Scanner')}>
                        <motion.div
                            whileHover={{ scale: 1.08, y: -2 }}
                            whileTap={{ scale: 0.94 }}
                            className="relative w-14 h-14 rounded-2xl flex items-center justify-center shimmer"
                            style={{
                                background: 'linear-gradient(135deg, #F5C518, #22C55E)',
                                boxShadow: isScannerActive
                                    ? '0 0 30px rgba(245,197,24,0.6), 0 0 60px rgba(245,197,24,0.2)'
                                    : '0 0 20px rgba(245,197,24,0.4)',
                            }}>
                            <ScanLine className="w-7 h-7 text-black" strokeWidth={2.5} />
                            {/* Ping ring */}
                            <div className="absolute inset-0 rounded-2xl animate-ping opacity-20"
                                style={{ background: 'linear-gradient(135deg, #F5C518, #22C55E)' }} />
                        </motion.div>
                    </Link>
                    <p className="text-center mt-1" style={{ fontSize: 10, color: isScannerActive ? '#F5C518' : 'rgba(255,255,255,0.3)', fontWeight: 500 }}>Scan</p>
                </div>

                {/* Right */}
                <div className="flex gap-1">
                    {rightItems.map(item => <NavItem key={item.name} item={item} />)}
                </div>
            </div>
        </nav>
    );
}