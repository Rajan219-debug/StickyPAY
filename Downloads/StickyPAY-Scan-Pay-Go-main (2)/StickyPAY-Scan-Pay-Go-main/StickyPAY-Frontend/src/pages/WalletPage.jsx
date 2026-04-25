import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Eye, Lock, Wallet, ArrowDownLeft, ArrowUpRight, CreditCard, Smartphone, CheckCircle } from 'lucide-react';
import { getWallet, addWalletBalance, getPin, savePin, getPaymentMethods } from '../components/localData';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

const MAX_WALLET_BALANCE = 10000;
const QUICK_AMOUNTS = [100, 250, 500, 1000];

/* ── PinPad ── */
function PinPad({ title, subtitle, onSuccess, onCancel, isSetup = false }) {
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [step, setStep] = useState(isSetup ? 'set' : 'verify');
  const [error, setError] = useState('');

  const handleDigit = (d) => {
    if (step === 'set' && pin.length < 4) {
      const np = pin + d;
      setPin(np);
      if (np.length === 4 && isSetup) setStep('confirm');
    } else if (step === 'confirm' && confirm.length < 4) {
      const nc = confirm + d;
      setConfirm(nc);
      if (nc.length === 4) {
        if (nc === pin) { savePin(nc); onSuccess(nc); }
        else { setError('PINs do not match'); setConfirm(''); }
      }
    } else if (step === 'verify' && pin.length < 4) {
      const np = pin + d;
      setPin(np);
      if (np.length === 4) {
        const stored = getPin();
        if (!stored) { setError('No PIN set'); setPin(''); }
        else if (stored === np) onSuccess(np);
        else { setError('Incorrect PIN'); setPin(''); }
      }
    }
  };

  const del = () => {
    if (step === 'confirm') setConfirm(c => c.slice(0, -1));
    else setPin(p => p.slice(0, -1));
  };

  const current = step === 'confirm' ? confirm : pin;
  const label = step === 'set' ? 'Create 4-digit PIN' : step === 'confirm' ? 'Confirm PIN' : 'Enter PIN';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-3xl p-6 w-80 border border-gray-700">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-white">{title || label}</h3>
            {subtitle && <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onCancel} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">✕</button>
        </div>
        <p className="text-center text-gray-400 text-sm mb-4">{label}</p>
        <div className="flex justify-center gap-3 mb-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className={`w-4 h-4 rounded-full border-2 ${current.length > i ? 'bg-yellow-400 border-yellow-400' : 'border-gray-600'}`} />
          ))}
        </div>
        {error && <p className="text-red-400 text-xs text-center mb-3">{error}</p>}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '⌫'].map((d, i) => (
            <button key={i} onClick={() => d === '⌫' ? del() : d !== '' && handleDigit(String(d))}
              className={`h-14 rounded-2xl font-bold text-lg ${d === '' ? '' : 'bg-white/10 text-white active:bg-gray-700'}`}>
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Add Money Modal (multi-step) ── */
function AddMoneyModal({ wallet, onClose, onSuccess }) {
  // Steps: 'amount' → 'method' → 'details' → 'pin' → 'success'
  const [step, setStep] = useState('amount');
  const [addAmount, setAddAmount] = useState('');
  const [payMethod, setPayMethod] = useState(null); // 'upi' | 'card'
  const [savedMethod, setSavedMethod] = useState(null);
  
  const [upiId, setUpiId] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const hasPin = !!getPin();
  const savedPaymentMethods = getPaymentMethods() || [];

  const amt = parseFloat(addAmount) || 0;
  const currentBalance = wallet?.balance || 0;
  const wouldExceed = currentBalance + amt > MAX_WALLET_BALANCE;

  const goToMethod = () => {
    if (amt <= 0) { toast.error('Enter a valid amount'); return; }
    if (wouldExceed) {
      toast.error('Wallet limit exceeded', {
        description: `Max balance ₹${MAX_WALLET_BALANCE.toLocaleString()}. You can add up to ₹${(MAX_WALLET_BALANCE - currentBalance).toFixed(2)}.`
      });
      return;
    }
    setStep('method');
  };

  const goToDetails = (method) => {
    setPayMethod(method);
    setSavedMethod(null);
    setStep('details');
  };

  const useSavedMethod = (method) => {
    setPayMethod(method.type);
    setSavedMethod(method);
    setStep('pin');
  };

  const goToPin = () => {
    if (payMethod === 'upi' && !upiId.includes('@')) { toast.error('Enter a valid UPI ID (e.g. name@upi)'); return; }
    if (payMethod === 'card') {
      if (cardNum.replace(/\s/g, '').length < 12) { toast.error('Enter a valid card number'); return; }
      if (!cardExpiry.includes('/')) { toast.error('Enter expiry as MM/YY'); return; }
      if (cardCvv.length < 3) { toast.error('Enter a valid CVV'); return; }
    }
    setStep('pin');
  };

  const handlePinSuccess = () => {
    setProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      let note = '';
      if (savedMethod) {
        note = savedMethod.type === 'upi' ? `Added via ${savedMethod.name}` : `Added via Card (*${savedMethod.last4})`;
      } else {
        note = payMethod === 'upi' ? `Added via UPI (${upiId})` : `Added via Card (*${cardNum.slice(-4)})`;
      }
      
      const updated = addWalletBalance(amt);
      if (updated.transactions.length > 0) {
        updated.transactions[0].note = note;
        localStorage.setItem('sp_wallet', JSON.stringify(updated));
      }
      setProcessing(false);
      setStep('success');
      onSuccess(updated);
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
        <div className="bg-gray-900 rounded-3xl p-8 w-80 border border-gray-800 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-1">Money Added!</h3>
          <p className="text-green-400 text-2xl font-bold mb-2">₹{amt.toFixed(2)}</p>
          <p className="text-gray-400 text-sm mb-1">
            via {savedMethod ? savedMethod.name : (payMethod === 'upi' ? `UPI (${upiId})` : `Card (*${cardNum.slice(-4)})`)}
          </p>
          <p className="text-gray-500 text-xs mb-6">Added to your StickyPAY Wallet</p>
          <Button onClick={onClose} className="w-full bg-[#22c55e] text-black font-semibold py-4 rounded-xl">Done</Button>
        </div>
      </div>
    );
  }

  if (step === 'pin') {
    if (processing) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-3xl p-8 w-80 border border-gray-800 text-center">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold">Processing payment...</p>
            <p className="text-gray-400 text-sm mt-1">₹{amt.toFixed(2)} via {payMethod?.toUpperCase()}</p>
          </div>
        </div>
      );
    }
    return (
      <PinPad
        title="Confirm Payment"
        subtitle={`₹${amt.toFixed(2)} via ${savedMethod ? savedMethod.name : payMethod?.toUpperCase()}`}
        isSetup={!hasPin}
        onSuccess={handlePinSuccess}
        onCancel={() => setStep(savedMethod ? 'method' : 'details')}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/70">
      <div className="w-full bg-gray-900 rounded-t-3xl p-6 border-t border-gray-800 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-2">
            {step !== 'amount' && (
              <button onClick={() => setStep(step === 'details' ? 'method' : 'amount')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-gray-400" />
              </button>
            )}
            <h3 className="text-lg font-bold">
              {step === 'amount' ? 'Add Money' : step === 'method' ? 'Payment Method' : 'Enter Details'}
            </h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400">✕</button>
        </div>

        {/* Step 1: Amount */}
        {step === 'amount' && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {QUICK_AMOUNTS.map(a => (
                <button key={a} onClick={() => setAddAmount(String(a))}
                  className={`py-2.5 rounded-xl text-sm font-semibold border transition-all ${addAmount === String(a) ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400' : 'border-gray-700 text-gray-300 hover:border-gray-500'}`}>
                  ₹{a}
                </button>
              ))}
            </div>
            <input type="number" value={addAmount} onChange={e => setAddAmount(e.target.value)}
              placeholder="Enter custom amount"
              className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 outline-none focus:border-yellow-400 mb-2" />
            <p className="text-gray-500 text-xs mb-5">Max balance: ₹{MAX_WALLET_BALANCE.toLocaleString()} · Current: ₹{currentBalance.toFixed(2)}</p>
            <Button onClick={goToMethod} className="w-full bg-[#22c55e] text-black font-semibold py-5 rounded-xl">
              Continue · ₹{amt > 0 ? amt.toFixed(2) : '0'}
            </Button>
          </>
        )}

        {/* Step 2: Payment Method */}
        {step === 'method' && (
          <>
            <p className="text-gray-400 text-sm mb-4">Adding <span className="text-yellow-400 font-bold">₹{amt.toFixed(2)}</span> to wallet</p>
            
            <div className="space-y-4">
              {/* Saved Methods */}
              {savedPaymentMethods.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Saved Methods</p>
                  <div className="space-y-2">
                    {savedPaymentMethods.map(method => (
                      <button key={method.id} onClick={() => useSavedMethod(method)}
                        className="w-full flex items-center gap-4 bg-white/5 border border-gray-700 rounded-2xl p-4 hover:border-yellow-400 hover:bg-yellow-400/5 transition-all group">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${method.type === 'upi' ? 'bg-green-500/20' : 'bg-blue-500/20'}`}>
                          {method.type === 'upi' ? <Smartphone className="w-5 h-5 text-green-400" /> : <CreditCard className="w-5 h-5 text-blue-400" />}
                        </div>
                        <div className="text-left flex-1">
                          <p className="font-semibold text-white group-hover:text-yellow-400 transition-colors">{method.name}</p>
                          <p className="text-gray-500 text-xs">{method.type === 'upi' ? method.upiId : `**** **** **** ${method.last4}`}</p>
                        </div>
                        <ArrowLeft className="w-4 h-4 text-gray-600 rotate-180" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Methods */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Add New Method</p>
                <div className="space-y-2">
                  <button onClick={() => goToDetails('upi')}
                    className="w-full flex items-center gap-4 bg-white/5 border border-gray-700 rounded-2xl p-4 hover:border-yellow-400 hover:bg-yellow-400/5 transition-all group">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-300 group-hover:text-yellow-400 transition-colors">Add New UPI</p>
                    </div>
                  </button>

                  <button onClick={() => goToDetails('card')}
                    className="w-full flex items-center gap-4 bg-white/5 border border-gray-700 rounded-2xl p-4 hover:border-yellow-400 hover:bg-yellow-400/5 transition-all group">
                    <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center">
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-yellow-400" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-300 group-hover:text-yellow-400 transition-colors">Add New Card</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Payment Details */}
        {step === 'details' && (
          <>
            <div className="bg-white/5 border border-gray-800 rounded-xl px-4 py-3 mb-5 flex items-center justify-between">
              <span className="text-gray-400 text-sm">Amount</span>
              <span className="text-yellow-400 font-bold">₹{amt.toFixed(2)}</span>
            </div>

            {payMethod === 'upi' && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">UPI ID</label>
                  <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 outline-none focus:border-green-400" />
                </div>
                <p className="text-gray-600 text-xs">You'll be redirected to your UPI app to approve the payment.</p>
              </div>
            )}

            {payMethod === 'card' && (
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs font-medium mb-1.5 block">Card Number</label>
                  <input type="text" value={cardNum} 
                    onChange={e => {
                      const val = e.target.value.replace(/[^\d\s]/g, '');
                      setCardNum(val);
                    }}
                    placeholder="1234 5678 9012 3456" maxLength={19}
                    className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 outline-none focus:border-blue-400 font-mono tracking-wider" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">Expiry</label>
                    <input type="text" value={cardExpiry} 
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 3) {
                          val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        setCardExpiry(val);
                      }}
                      placeholder="MM/YY" maxLength={5}
                      className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 outline-none focus:border-blue-400 font-mono" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs font-medium mb-1.5 block">CVV</label>
                    <input type="password" value={cardCvv} 
                      onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="•••" maxLength={4}
                      className="w-full bg-white/10 border border-gray-700 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-500 outline-none focus:border-blue-400 font-mono" />
                  </div>
                </div>
              </div>
            )}

            <Button onClick={goToPin} className="w-full bg-[#22c55e] text-black font-semibold py-5 rounded-xl mt-6">
              Pay ₹{amt.toFixed(2)} via {payMethod === 'upi' ? 'UPI' : 'Card'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main WalletPage ── */
export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [unlocked, setUnlocked] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [action, setAction] = useState(null);
  const hasPin = !!getPin();

  useEffect(() => {
    document.body.classList.add("hide-bottom-nav");
    return () => document.body.classList.remove("hide-bottom-nav");
  }, []);

  useEffect(() => { setWallet(getWallet()); }, []);

  const handleUnlock = () => { setAction('view'); setShowPin(true); };
  const handleAddBalance = () => {
    if (!unlocked) { setAction('add'); setShowPin(true); }
    else { setShowAdd(true); }
  };
  const onPinSuccess = () => { setShowPin(false); setUnlocked(true); if (action === 'add') setShowAdd(true); };

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {showPin && (
        <PinPad title={hasPin ? 'Wallet PIN' : 'Set Wallet PIN'} subtitle="Secure your wallet"
          isSetup={!hasPin} onSuccess={onPinSuccess} onCancel={() => setShowPin(false)} />
      )}

      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">My Wallet</h1>
      </div>

      {/* Balance Card */}
      <div className="px-6">
        <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-100 text-sm">StickyPAY Wallet</p>
              <p className="text-white font-bold">Available Balance</p>
            </div>
          </div>
          {unlocked ? (
            <p className="text-4xl font-bold text-white mb-1">₹{wallet?.balance?.toFixed(2) || '0.00'}</p>
          ) : (
            <div className="flex items-center gap-3 mb-1">
              <p className="text-4xl font-bold text-white">₹ ••••</p>
              <button onClick={handleUnlock} className="flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-1.5 text-white text-sm">
                <Eye className="w-4 h-4" /> View
              </button>
            </div>
          )}
          <p className="text-green-200 text-xs">Protected with PIN 🔒</p>
          <div className="flex gap-3 mt-5">
            <button onClick={handleAddBalance}
              className="flex-1 bg-white text-green-800 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Money
            </button>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAdd && (
        <AddMoneyModal wallet={wallet} onClose={() => { setShowAdd(false); setWallet(getWallet()); }}
          onSuccess={(updated) => setWallet(updated)} />
      )}

      {/* Transactions */}
      {unlocked && wallet && (
        <div className="px-6 mt-6">
          <h3 className="font-semibold mb-3">Transaction History</h3>
          {wallet.transactions?.length === 0 && (
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800 text-center">
              <p className="text-gray-500 text-sm">No transactions yet</p>
            </div>
          )}
          <div className="space-y-2">
            {wallet.transactions?.map(tx => (
              <div key={tx.id} className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-[#22c55e]/20' : 'bg-red-500/20'}`}>
                    {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5 text-green-400" /> : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tx.note}</p>
                    <p className="text-gray-500 text-xs">{tx.date ? format(new Date(tx.date), 'dd MMM yyyy, HH:mm') : ''}</p>
                  </div>
                </div>
                <p className={`font-bold ${tx.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
                  {tx.type === 'credit' ? '+' : '-'}₹{tx.amount?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {!unlocked && (
        <div className="px-6 mt-10 text-center">
          <Lock className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Enter your PIN to view transaction history</p>
          <button onClick={handleUnlock} className="mt-3 text-yellow-400 text-sm font-semibold">Unlock Wallet</button>
        </div>
      )}
    </div>
  );
}