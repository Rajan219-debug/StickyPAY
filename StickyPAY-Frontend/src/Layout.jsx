import React, { useState, useEffect } from 'react';
import BottomNav from './components/BottomNav';

export default function Layout({ children, currentPageName }) {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        const updateCartCount = () => {
            try {
                const saved = localStorage.getItem('stickyPayCart');
                if (!saved) { setCartCount(0); return; }
                const data = JSON.parse(saved);
                if (!data || !Array.isArray(data.items)) { setCartCount(0); return; }
                const count = data.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
                setCartCount(count);
            } catch { setCartCount(0); }
        };

        updateCartCount();
        window.addEventListener('storage', updateCartCount);
        const interval = setInterval(updateCartCount, 1000);
        return () => { window.removeEventListener('storage', updateCartCount); clearInterval(interval); };
    }, []);

    const isLogin = currentPageName === 'Login';

    return (
        <div style={{ background: '#080B14', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
            <style>{`
                :root {
                    --background: 222 47% 5%;
                    --foreground: 0 0% 98%;
                    --card: 222 47% 7%;
                    --card-foreground: 0 0% 98%;
                    --primary: 48 96% 53%;
                    --primary-foreground: 0 0% 0%;
                    --secondary: 142 76% 36%;
                    --secondary-foreground: 0 0% 100%;
                    --muted: 222 30% 12%;
                    --muted-foreground: 0 0% 55%;
                    --accent: 48 96% 53%;
                    --accent-foreground: 0 0% 0%;
                    --border: 222 30% 12%;
                    --input: 222 30% 10%;
                    --ring: 48 96% 53%;
                    --radius: 1rem;
                }
                html, body { background: #080B14 !important; }
            `}</style>

            {/* Top Bar */}
            {!isLogin && (
                <div className="fixed top-0 left-0 right-0 z-50"
                    style={{ background: 'rgba(8,11,20,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="flex items-center justify-between py-4 px-5 max-w-md mx-auto">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center animate-pulse-glow"
                                style={{ background: 'linear-gradient(135deg, #F5C518, #22C55E)' }}>
                                <span style={{ color: '#000', fontWeight: 900, fontSize: 14 }}>S</span>
                            </div>
                            <span style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
                                Sticky<span style={{ color: '#F5C518' }}>PAY</span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer"
                                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                    </svg>
                                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                        style={{ background: '#F5C518', fontSize: 7, fontWeight: 800, color: '#000' }}>1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`w-full relative ${!isLogin ? 'pt-16 pb-28' : ''}`}>
                {children}
            </div>

            {!isLogin && <BottomNav cartCount={cartCount} />}
        </div>
    );
}