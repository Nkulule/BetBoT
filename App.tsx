
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Game, Bet, BotLog, AIAnalysisResult, User, Transaction } from './types';
import { INITIAL_BALANCE, CURRENCY_SYMBOL } from './constants';
import { generateLiveGames, calculateDynamicOdds } from './services/gameDataService';
import { analyzeGame } from './services/geminiService';
import { authService } from './services/authService';
import BotConsole from './components/BotConsole';
import PerformanceChart from './components/PerformanceChart';
import StatsCard from './components/StatsCard';
import PortfolioView from './components/PortfolioView';
import WalletView from './components/WalletView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(authService.getCurrentUser());
  const [view, setView] = useState<'login' | 'register' | 'verification' | 'dashboard' | 'history' | 'portfolio' | 'wallet'>(
    currentUser ? (currentUser.isVerified ? 'dashboard' : 'verification') : 'login'
  );
  
  // Dashboard states
  const [balance, setBalance] = useState(currentUser?.balance || INITIAL_BALANCE);
  const [botStakeAmount, setBotStakeAmount] = useState<number>(500);
  const [games, setGames] = useState<Game[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [logs, setLogs] = useState<BotLog[]>([]);
  const [isBotActive, setIsBotActive] = useState(false);
  const [history, setHistory] = useState<{ time: string; balance: number }[]>([
    { time: '00:00', balance: currentUser?.balance || INITIAL_BALANCE }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [expandedGames, setExpandedGames] = useState<Set<string>>(new Set());

  // Auth Form states
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [authIDNumber, setAuthIDNumber] = useState('');
  const [authError, setAuthError] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(currentUser?.email || '');

  // Computed values
  const activeBets = useMemo(() => bets.filter(b => b.status === 'Open'), [bets]);
  const finishedBets = useMemo(() => bets.filter(b => b.status !== 'Open').sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [bets]);
  const fundsAtRisk = useMemo(() => activeBets.reduce((sum, b) => sum + b.amount, 0), [activeBets]);
  const totalEquity = balance + fundsAtRisk;

  const winCount = useMemo(() => bets.filter(b => b.status === 'Won').length, [bets]);
  const lossCount = useMemo(() => bets.filter(b => b.status === 'Lost').length, [bets]);
  
  const recentStreak = useMemo(() => {
    return bets
      .filter(b => b.status !== 'Open')
      .slice(0, 10)
      .map(b => b.status);
  }, [bets]);

  // Sync balance state to currentUser object and persist to localStorage
  useEffect(() => {
    if (currentUser && currentUser.balance !== balance) {
      const updatedUser = { ...currentUser, balance };
      authService.updateUser(updatedUser);
      setCurrentUser(updatedUser);
    }
  }, [balance, currentUser]);

  // Initialize logs and games
  useEffect(() => {
    if (view === 'login' || view === 'register' || view === 'verification') return;

    if (games.length === 0) {
      setGames(generateLiveGames(10));
    }
    
    addLog("BetBot AI Kernel Version 4.5.0 (Global Edition) initialized.", "info");
    addLog("Scanning global markets: EPL, NBA, IPL, URC active.", "info");
    
    const interval = setInterval(() => {
      setGames(prev => {
        return prev.map(g => {
          const newStats = { ...g.stats };
          const maxTime = g.sport === 'Soccer' ? 90 : (g.sport === 'Rugby' ? 80 : (g.sport === 'Basketball' ? 48 : 100));
          newStats.time += 1;
          
          if (Math.random() > 0.98) {
            const side = Math.random() > 0.5 ? 0 : 1;
            let points = 1;
            if (g.sport === 'Rugby') points = (Math.random() > 0.3 ? 5 : 3);
            else if (g.sport === 'Cricket') points = Math.floor(Math.random() * 6) + 1;
            else if (g.sport === 'Basketball') points = Math.random() > 0.5 ? 2 : 3;
            newStats.score[side] += points;
          }
          
          if (Math.random() > 0.9) {
            const side = Math.random() > 0.5 ? 0 : 1;
            newStats.corners[side] += 1;
          }

          if (Math.random() > 0.8) {
            const side = Math.random() > 0.5 ? 0 : 1;
            newStats.fouls[side] += 1;
          }

          if (newStats.time > maxTime) return generateLiveGames(1)[0];

          const updatedOdds = calculateDynamicOdds(g.sport, newStats);

          return { 
            ...g, 
            stats: newStats,
            homeOdds: updatedOdds.home,
            awayOdds: updatedOdds.away,
            drawOdds: updatedOdds.draw
          };
        });
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [view]);

  const addLog = useCallback((message: string, type: BotLog['type']) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      message,
      type
    }].slice(-50));
  }, []);

  const toggleGameDetails = (gameId: string) => {
    setExpandedGames(prev => {
      const next = new Set(prev);
      if (next.has(gameId)) next.delete(gameId);
      else next.add(gameId);
      return next;
    });
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsBotActive(false);
    setView('login');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = authService.login(authEmail, authPassword);
      setCurrentUser(user);
      setBalance(user.balance);
      if (user.isVerified) {
        setView('dashboard');
      } else {
        setVerifyingEmail(user.email);
        setView('verification');
      }
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = authService.register(authName, authEmail, authPhone, authPassword);
      setCurrentUser(user);
      setBalance(user.balance);
      setVerifyingEmail(user.email);
      setView('verification');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const user = authService.verifyAccount(verifyingEmail, authCode, authIDNumber);
      setCurrentUser(user);
      setBalance(user.balance);
      setView('dashboard');
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  // Bot Logic
  useEffect(() => {
    if (!isBotActive || (view === 'login' || view === 'register' || view === 'verification')) return;

    const botTick = async () => {
      if (isAnalyzing) return;
      
      const gameToScan = games[Math.floor(Math.random() * games.length)];
      if (!gameToScan) return;

      addLog(`Global Scan: Analyzing ${gameToScan.league} - ${gameToScan.homeTeam} vs ${gameToScan.awayTeam}...`, "info");
      setIsAnalyzing(true);
      
      try {
        const analysis: AIAnalysisResult = await analyzeGame(gameToScan);
        
        if (analysis.recommendation !== 'SKIP' && analysis.confidence >= 85) {
          const stake = Math.min(botStakeAmount, balance);
          
          if (stake <= 0) {
            addLog("Warning: Bot position skipped. Insufficient balance.", "warning");
            setIsAnalyzing(false);
            return;
          }

          addLog(`AI DETECTED EDGE: ${analysis.recommendation} | Confidence: ${analysis.confidence}%`, "ai");
          addLog(`Logic: ${analysis.reasoning}`, "ai");
          
          const odds = analysis.recommendation === 'HOME' ? gameToScan.homeOdds : gameToScan.awayOdds;
          
          const newBet: Bet = {
            id: Math.random().toString(36).substr(2, 9),
            gameId: gameToScan.id,
            matchup: `${gameToScan.homeTeam} vs ${gameToScan.awayTeam}`,
            selection: analysis.recommendation,
            amount: stake,
            odds,
            confidence: analysis.confidence,
            status: 'Open',
            timestamp: new Date()
          };
          
          setBets(prev => [newBet, ...prev]);
          setBalance(prev => prev - stake);
          addLog(`Position opened: ${CURRENCY_SYMBOL}${stake} on ${analysis.recommendation} @ ${odds}.`, "success");

          setTimeout(() => {
            const win = Math.random() < (analysis.confidence / 100);
            setBets(currentBets => currentBets.map(b => {
              if (b.id === newBet.id) {
                const updatedStatus = win ? 'Won' : 'Lost';
                const profit = win ? Math.floor(b.amount * b.odds) : 0;
                
                if (win) {
                  setBalance(p => p + profit);
                  addLog(`WIN: Position ${b.id} closed for ${CURRENCY_SYMBOL}${profit}.`, "success");
                } else {
                  addLog(`LOSS: Position ${b.id} hit stop-loss.`, "error");
                }
                
                return { ...b, status: updatedStatus as 'Won' | 'Lost' };
              }
              return b;
            }));
          }, 15000);
        } else {
          addLog(`Market Scan [${gameToScan.league}]: No Edge Found.`, "warning");
        }
      } catch (err) {
        addLog("Critical: Global AI Inference failed.", "error");
      } finally {
        setIsAnalyzing(false);
      }
    };

    const interval = setInterval(botTick, 10000);
    return () => clearInterval(interval);
  }, [isBotActive, games, isAnalyzing, balance, addLog, view, botStakeAmount]);

  // Equity tracking
  useEffect(() => {
    if (view === 'login' || view === 'register' || view === 'verification') return;
    const interval = setInterval(() => {
      setHistory(prev => {
        const now = new Date();
        const timeStr = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');
        const newHistory = [...prev, { time: timeStr, balance }];
        if (newHistory.length > 20) return newHistory.slice(1);
        return newHistory;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, [balance, view]);

  const winRate = useMemo(() => {
    const finished = bets.filter(b => b.status !== 'Open');
    if (finished.length === 0) return 0;
    return (finished.filter(b => b.status === 'Won').length / finished.length) * 100;
  }, [bets]);

  const profitLoss = balance - INITIAL_BALANCE;

  if (view === 'login' || view === 'register' || view === 'verification') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>

        <div className="z-10 w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] mb-4 border ${
              view === 'verification' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            }`}>
              {view === 'verification' ? 'ACTION REQUIRED: KYC VALIDATION' : 'AI SECURITY CORE'}
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter mb-2">
              BET<span className="text-emerald-500 italic">BOT</span>
            </h2>
            <p className="text-slate-400 text-sm">
              {view === 'verification' ? 'Identity verification required.' : 'Autonomous Global Sports Arbitrage'}
            </p>
          </div>

          {view === 'verification' ? (
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-xs text-slate-500 mb-6 px-4">
                  Enter your official 13-digit SA ID number to proceed. (Simulation code: 123456)
                </p>
                
                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Verification Code</label>
                    <input 
                      type="text" 
                      maxLength={6}
                      value={authCode}
                      onChange={(e) => setAuthCode(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full text-center bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-2xl font-mono tracking-[0.3em] text-emerald-500 focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="000000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">SA ID Number</label>
                    <input 
                      type="text" 
                      maxLength={13}
                      value={authIDNumber}
                      onChange={(e) => setAuthIDNumber(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                      placeholder="8501015000081"
                      required
                    />
                  </div>
                </div>
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs py-3 px-4 rounded-lg flex items-center justify-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98]"
              >
                FINALIZE KYC & UNLOCK
              </button>
            </form>
          ) : (
            <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="space-y-4">
              {view === 'register' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Full Name</label>
                    <input 
                      type="text" 
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">SA Cell Number</label>
                    <input 
                      type="tel" 
                      value={authPhone}
                      onChange={(e) => setAuthPhone(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                      placeholder="082 123 4567"
                      required
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Email Terminal ID</label>
                <input 
                  type="email" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                  placeholder="agent@betbot.ai"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 px-1">Access Protocol</label>
                <input 
                  type="password" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono text-sm"
                  placeholder="••••••••"
                  required
                />
              </div>

              {authError && (
                <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs py-3 px-4 rounded-lg flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle"></i>
                  {authError}
                </div>
              )}

              <button 
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black py-4 rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] mt-4"
              >
                {view === 'login' ? 'INITIALIZE SESSION' : 'AUTHORIZE ACCOUNT'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-800/50 text-center">
            <button 
              onClick={() => {
                if (view === 'verification') handleLogout();
                else setView(view === 'login' ? 'register' : 'login');
                setAuthError('');
              }}
              className="text-slate-500 hover:text-emerald-400 text-xs font-bold tracking-wider transition-colors"
            >
              {view === 'verification' ? 'CANCEL & RETURN' : (view === 'login' ? 'NEW AGENT? REQUEST ACCESS' : 'EXISTING AGENT? SYNC')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Sidebar Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-20 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-8 gap-10 hidden md:flex">
        <div className="text-emerald-500 text-2xl font-black">B<span className="text-white">A</span></div>
        <div className="flex flex-col gap-8 text-slate-500">
          <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'text-emerald-500' : 'hover:text-white'} transition-colors`} title="Dashboard"><i className="fas fa-th-large text-xl"></i></button>
          <button onClick={() => setView('portfolio')} className={`${view === 'portfolio' ? 'text-emerald-500' : 'hover:text-white'} transition-colors`} title="Portfolio"><i className="fas fa-chart-pie text-xl"></i></button>
          <button onClick={() => setView('wallet')} className={`${view === 'wallet' ? 'text-emerald-500' : 'hover:text-white'} transition-colors`} title="Wallet"><i className="fas fa-wallet text-xl"></i></button>
          <button onClick={() => setView('history')} className={`${view === 'history' ? 'text-emerald-500' : 'hover:text-white'} transition-colors`} title="History"><i className="fas fa-history text-xl"></i></button>
        </div>
        <div className="mt-auto">
          <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-all">
            <i className="fas fa-power-off"></i>
          </button>
        </div>
      </div>

      <main className="md:ml-20 p-4 md:p-8 max-w-7xl mx-auto pb-16">
        {view === 'dashboard' && (
          <>
            <header className="flex flex-col xl:flex-row xl:items-center justify-between mb-8 gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                  BetBot AI Terminal
                  <span className="text-xs font-mono font-normal px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded border border-emerald-500/20">GLOBAL HUB</span>
                </h1>
                <p className="text-slate-400 mt-1">Hello, {currentUser?.name}. AI core is scanning international markets.</p>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex flex-col">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 px-1">Stake Amount ({CURRENCY_SYMBOL})</label>
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500/50 font-mono font-bold">{CURRENCY_SYMBOL}</span>
                      <input type="number" value={botStakeAmount} onChange={(e) => setBotStakeAmount(Math.max(0, parseInt(e.target.value) || 0))} className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-2 text-white font-mono text-sm w-36 focus:outline-none" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 px-1">Risk presets</label>
                    <div className="flex gap-1">
                      {[2, 5, 10, 25].map(p => (
                        <button key={p} onClick={() => setBotStakeAmount(Math.floor(balance * (p/100)))} className="text-[10px] bg-slate-800 hover:bg-slate-700 px-2 py-2 rounded text-slate-400 font-bold">{p}%</button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsBotActive(!isBotActive)} className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all min-w-[220px] justify-center ${isBotActive ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'}`}>
                  <i className={`fas ${isBotActive ? 'fa-stop-circle' : 'fa-play-circle'}`}></i>
                  {isBotActive ? 'STOP AUTONOMOUS BOT' : 'START GLOBAL BOT'}
                </button>
              </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatsCard label="Balance" value={`${CURRENCY_SYMBOL}${balance.toLocaleString()}`} icon="fa-wallet" color="bg-emerald-500" trend={`${((profitLoss/INITIAL_BALANCE)*100).toFixed(1)}%`} trendUp={profitLoss >= 0} />
              
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between">
                <div>
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Winning vs Losses</p>
                  <h3 className="text-2xl font-bold text-white tracking-tight flex items-baseline gap-2">
                    <span className="text-emerald-400">{winCount}</span>
                    <span className="text-slate-600 text-sm">/</span>
                    <span className="text-rose-400">{lossCount}</span>
                  </h3>
                </div>
                <div className="mt-3 flex gap-1">
                  {recentStreak.length === 0 ? (
                    <span className="text-[10px] text-slate-600 italic">No recent results</span>
                  ) : (
                    recentStreak.map((status, i) => (
                      <div key={i} className={`w-2 h-2 rounded-full ${status === 'Won' ? 'bg-emerald-500' : 'bg-rose-500'} shadow-[0_0_8px_rgba(0,0,0,0.5)]`} title={status} />
                    ))
                  )}
                </div>
              </div>

              <StatsCard label="Net Worth" value={`${CURRENCY_SYMBOL}${totalEquity.toLocaleString()}`} icon="fa-layer-group" color="bg-cyan-500" />
              <StatsCard label="Hit Rate" value={`${winRate.toFixed(1)}%`} icon="fa-bullseye" color="bg-indigo-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <PerformanceChart data={history} />
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><i className="fas fa-globe text-rose-500"></i> Active Global Markets</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {games.map(game => {
                      const isExpanded = expandedGames.has(game.id);
                      return (
                        <div key={game.id} className="bg-slate-950 border border-slate-800 rounded-xl hover:border-emerald-500/50 transition-all duration-300 flex flex-col">
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex flex-col">
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{game.league}</span>
                                <span className="text-[10px] font-bold text-emerald-500">{game.sport}</span>
                              </div>
                              <span className="flex items-center gap-2 text-[10px] font-bold text-rose-500 animate-pulse"><div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>LIVE {game.stats.time}'</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                              <div className="flex-1 text-center">
                                <p className="text-sm font-bold text-white truncate">{game.homeTeam}</p>
                                <p className="text-xl font-black text-emerald-400">{game.stats.score[0]}</p>
                              </div>
                              <div className="px-4 text-[10px] font-mono text-slate-600">VS</div>
                              <div className="flex-1 text-center">
                                <p className="text-sm font-bold text-white truncate">{game.awayTeam}</p>
                                <p className="text-xl font-black text-emerald-400">{game.stats.score[1]}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                                <p className="text-[8px] text-slate-500 font-bold mb-1">HOME</p>
                                <p className="text-xs font-mono text-emerald-400 font-bold">{game.homeOdds}</p>
                              </div>
                              <div className="bg-slate-900 p-2 rounded text-center border border-slate-800">
                                <p className="text-[8px] text-slate-500 font-bold mb-1">AWAY</p>
                                <p className="text-xs font-mono text-emerald-400 font-bold">{game.awayOdds}</p>
                              </div>
                            </div>

                            <button onClick={() => toggleGameDetails(game.id)} className="w-full py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors border-t border-slate-800 mt-1">
                              {isExpanded ? 'Hide' : 'Expand'} Details
                            </button>
                          </div>

                          {isExpanded && (
                            <div className="bg-slate-900/50 p-4 border-t border-slate-800">
                              <div className="space-y-3">
                                <div>
                                  <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
                                    <span className="text-slate-500">Momentum</span>
                                    <span className="text-white">{game.stats.possession[0]}% v {game.stats.possession[1]}%</span>
                                  </div>
                                  <div className="h-1 w-full bg-slate-800 rounded-full flex overflow-hidden">
                                    <div className="h-full bg-emerald-500" style={{ width: `${game.stats.possession[0]}%` }}></div>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-[9px]">
                                  <div className="flex justify-between border-b border-slate-800 pb-1"><span className="text-slate-500">Shots</span><span className="text-white font-bold">{game.stats.shots[0]}-{game.stats.shots[1]}</span></div>
                                  <div className="flex justify-between border-b border-slate-800 pb-1"><span className="text-slate-500">Fouls</span><span className="text-white font-bold">{game.stats.fouls[0]}-{game.stats.fouls[1]}</span></div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <BotConsole logs={logs} />
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col max-h-[440px]">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><i className="fas fa-radar text-rose-500 animate-pulse"></i> Global Positions</h3>
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                    {activeBets.length === 0 ? (
                      <div className="p-6 text-center text-slate-600 italic text-xs border border-dashed border-slate-800 rounded-lg">No active positions.</div>
                    ) : (
                      activeBets.map(bet => (
                        <div key={bet.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl border-l-2 border-l-emerald-500">
                          <div className="flex justify-between items-start mb-1"><p className="text-[10px] font-bold text-white truncate max-w-[120px]">{bet.matchup}</p><span className="text-[10px] font-mono text-emerald-400">-{CURRENCY_SYMBOL}{bet.amount}</span></div>
                          <div className="flex justify-between items-end">
                            <p className="text-[8px] text-slate-500 uppercase">Selection: {bet.selection}</p>
                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded">ACTIVE</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {view === 'portfolio' && (
          <PortfolioView balance={balance} fundsAtRisk={fundsAtRisk} totalEquity={totalEquity} profitLoss={profitLoss} winRate={winRate} history={history} bets={bets} />
        )}

        {view === 'wallet' && currentUser && (
          <WalletView user={currentUser} onBalanceUpdate={(newBalance) => setBalance(newBalance)} />
        )}

        {view === 'history' && (
          <div className="space-y-6">
            <header className="flex justify-between items-end">
              <div>
                <button onClick={() => setView('dashboard')} className="text-xs font-bold text-slate-500 hover:text-white mb-2"><i className="fas fa-arrow-left mr-2"></i> Terminal</button>
                <h2 className="text-2xl font-bold text-white">Bet History</h2>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black">Net Return</p>
                <p className={`text-xl font-mono font-bold ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{CURRENCY_SYMBOL}{profitLoss.toLocaleString()}</p>
              </div>
            </header>
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-950/50 text-[10px] font-black uppercase text-slate-500 border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Market</th>
                    <th className="px-6 py-4">Stake</th>
                    <th className="px-6 py-4">Profit/Loss</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {finishedBets.map(bet => (
                    <tr key={bet.id} className="text-xs hover:bg-slate-800/20">
                      <td className="px-6 py-4"><p className="font-bold text-white">{bet.matchup}</p><p className="text-[10px] text-slate-600">{bet.selection} @ {bet.odds}</p></td>
                      <td className="px-6 py-4 font-mono">{CURRENCY_SYMBOL}{bet.amount}</td>
                      <td className={`px-6 py-4 font-mono font-bold ${bet.status === 'Won' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {bet.status === 'Won' ? `+${CURRENCY_SYMBOL}${(bet.amount * (bet.odds - 1)).toFixed(0)}` : `-${CURRENCY_SYMBOL}${bet.amount}`}
                      </td>
                      <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${bet.status === 'Won' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>{bet.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 px-4 py-2 hidden md:flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Server: Global-Primary-Cluster-7</span>
          <span>Latency: 14ms</span>
        </div>
        <div>Cyber-Protected Virtual Simulation — No real funds at risk</div>
      </footer>
    </div>
  );
};

export default App;
