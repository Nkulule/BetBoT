
import React, { useState, useEffect } from 'react';
import { CURRENCY_SYMBOL } from '../constants';
import { Transaction, User } from '../types';
import { authService } from '../services/authService';

interface WalletViewProps {
  user: User;
  onBalanceUpdate: (newBalance: number) => void;
}

const WalletView: React.FC<WalletViewProps> = ({ user, onBalanceUpdate }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'deposit' | 'withdraw'>('history');
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Ozow' | 'PayFast' | 'EFT'>('Ozow');
  const [showGateway, setShowGateway] = useState(false);

  useEffect(() => {
    setTransactions(authService.getTransactions(user.id));
  }, [user.id]);

  const handleAction = async (type: 'Deposit' | 'Withdrawal') => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    if (type === 'Withdrawal' && numAmount > user.balance) {
      alert("Insufficient balance for withdrawal.");
      return;
    }

    setIsProcessing(true);
    if (type === 'Deposit') {
      setShowGateway(true);
      // Wait for gateway simulation
      return;
    }

    // Withdrawal process
    setTimeout(() => {
      const tx = authService.addTransaction(user.id, {
        type: 'Withdrawal',
        amount: numAmount,
        method: 'Bank Transfer',
        status: 'Completed'
      });
      const newBalance = user.balance - numAmount;
      onBalanceUpdate(newBalance);
      setTransactions(prev => [tx, ...prev]);
      setAmount('');
      setIsProcessing(false);
      setActiveTab('history');
    }, 1500);
  };

  const finalizeDeposit = () => {
    const numAmount = parseFloat(amount);
    setIsProcessing(true);
    setShowGateway(false);
    
    setTimeout(() => {
      const tx = authService.addTransaction(user.id, {
        type: 'Deposit',
        amount: numAmount,
        method: paymentMethod,
        status: 'Completed'
      });
      const newBalance = user.balance + numAmount;
      onBalanceUpdate(newBalance);
      setTransactions(prev => [tx, ...prev]);
      setAmount('');
      setIsProcessing(false);
      setActiveTab('history');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Financial Terminal</h1>
          <p className="text-slate-400">Manage your capital and track payment settlements.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl flex flex-col items-end">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Settled Balance</p>
          <p className="text-3xl font-mono font-bold text-emerald-400">{CURRENCY_SYMBOL}{user.balance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          <button 
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all border ${
              activeTab === 'history' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <i className="fas fa-list-ul"></i> Transaction History
          </button>
          <button 
            onClick={() => setActiveTab('deposit')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all border ${
              activeTab === 'deposit' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <i className="fas fa-plus-circle"></i> Deposit Funds
          </button>
          <button 
            onClick={() => setActiveTab('withdraw')}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold flex items-center gap-3 transition-all border ${
              activeTab === 'withdraw' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
            }`}
          >
            <i className="fas fa-minus-circle"></i> Withdraw Capital
          </button>
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-8 min-h-[400px]">
          {activeTab === 'history' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-white mb-4">Audit Trail</h3>
              {transactions.length === 0 ? (
                <div className="text-center py-20 opacity-20">
                  <i className="fas fa-receipt text-6xl mb-4"></i>
                  <p>No transactions recorded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map(tx => (
                    <div key={tx.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'Deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                        }`}>
                          <i className={`fas fa-${tx.type === 'Deposit' ? 'arrow-down' : 'arrow-up'}`}></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{tx.type} via {tx.method}</p>
                          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                            {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • ID: {tx.id.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-black font-mono ${tx.type === 'Deposit' ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {tx.type === 'Deposit' ? '+' : '-'}{CURRENCY_SYMBOL}{tx.amount.toLocaleString()}
                        </p>
                        <span className="text-[9px] bg-slate-900 text-slate-500 px-2 py-0.5 rounded uppercase font-bold border border-slate-800">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'deposit' && (
            <div className="space-y-6 max-w-sm mx-auto">
              <div className="text-center mb-8">
                <i className="fas fa-wallet text-4xl text-emerald-500 mb-4"></i>
                <h3 className="text-xl font-bold text-white">Instant Deposit</h3>
                <p className="text-slate-500 text-xs">Funds are settled within seconds using South African secure gateways.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Amount to Deposit ({CURRENCY_SYMBOL})</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (e.g. 1000)"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-mono text-xl focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Choose Gateway</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Ozow', 'PayFast'].map((gateway: any) => (
                      <button 
                        key={gateway}
                        onClick={() => setPaymentMethod(gateway)}
                        className={`py-3 rounded-xl border font-bold text-xs transition-all ${
                          paymentMethod === gateway ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {gateway}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => handleAction('Deposit')}
                  disabled={!amount || isProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all mt-4"
                >
                  {isProcessing ? 'INITIALIZING GATEWAY...' : 'SECURE DEPOSIT'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'withdraw' && (
            <div className="space-y-6 max-w-sm mx-auto">
              <div className="text-center mb-8">
                <i className="fas fa-bank text-4xl text-amber-500 mb-4"></i>
                <h3 className="text-xl font-bold text-white">Capital Withdrawal</h3>
                <p className="text-slate-500 text-xs">Withdraw your winnings to any South African bank account.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="text-xs text-slate-500">Available to Withdraw</span>
                  <span className="font-mono font-bold text-white">{CURRENCY_SYMBOL}{user.balance.toLocaleString()}</span>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block px-1">Withdrawal Amount ({CURRENCY_SYMBOL})</label>
                  <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white font-mono text-xl focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <button 
                  onClick={() => handleAction('Withdrawal')}
                  disabled={!amount || isProcessing}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all mt-4"
                >
                  {isProcessing ? 'REQUESTING SETTLEMENT...' : 'WITHDRAW CAPITAL'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulated Payment Gateway Modal */}
      {showGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 p-6 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <span className="font-bold text-slate-800">{paymentMethod} Secure Payment</span>
              </div>
              <button onClick={() => setShowGateway(false)} className="text-slate-400 hover:text-slate-600">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="text-center">
                <p className="text-slate-500 text-sm mb-1">Paying To</p>
                <p className="font-bold text-slate-900">BETBOT AI TERMINAL (PTY) LTD</p>
                <div className="mt-4 p-4 bg-blue-50 rounded-2xl">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mb-1">Amount Due</p>
                  <p className="text-4xl font-black text-blue-700">{CURRENCY_SYMBOL}{parseFloat(amount).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-400 uppercase text-center">Select Your Bank</p>
                <div className="grid grid-cols-3 gap-2">
                  {['Capitec', 'FNB', 'ABSA', 'Standard', 'Nedbank', 'Discovery'].map(bank => (
                    <div key={bank} className="aspect-square border rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-all">
                      {bank}
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={finalizeDeposit}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-lock text-sm opacity-50"></i> PAY NOW
              </button>
              
              <p className="text-[10px] text-center text-slate-400">
                This is a secure encrypted payment simulation. <br/>Your bank credentials are never stored.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletView;
