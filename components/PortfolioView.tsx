
import React from 'react';
import { Bet } from '../types';
import { CURRENCY_SYMBOL } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import PerformanceChart from './PerformanceChart';

interface PortfolioViewProps {
  balance: number;
  fundsAtRisk: number;
  totalEquity: number;
  profitLoss: number;
  winRate: number;
  history: { time: string; balance: number }[];
  bets: Bet[];
}

const PortfolioView: React.FC<PortfolioViewProps> = ({ 
  balance, 
  fundsAtRisk, 
  totalEquity, 
  profitLoss, 
  winRate, 
  history, 
  bets 
}) => {
  const allocationData = [
    { name: 'Available', value: balance },
    { name: 'At Risk', value: fundsAtRisk },
  ];
  
  const COLORS = ['#10b981', '#f59e0b'];

  const wins = bets.filter(b => b.status === 'Won').length;
  const losses = bets.filter(b => b.status === 'Lost').length;
  const winLossData = [
    { name: 'Results', wins, losses },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Portfolio Analytics</h1>
          <p className="text-slate-400">Deep dive into your AI-managed capital allocation in South Africa.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Real-time sync active</span>
        </div>
      </div>

      {/* Hero Financial Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <i className="fas fa-gem text-8xl text-emerald-500"></i>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Aggregate System Value</p>
          <h2 className="text-6xl font-black text-white tracking-tighter mb-8">
            {CURRENCY_SYMBOL}{totalEquity.toLocaleString()}
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-slate-800/50">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Available Balance</p>
              <p className="text-2xl font-mono font-bold text-emerald-400">{CURRENCY_SYMBOL}{balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Locked Exposure</p>
              <p className="text-2xl font-mono font-bold text-amber-500">{CURRENCY_SYMBOL}{fundsAtRisk.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Net Performance</p>
              <p className={`text-2xl font-mono font-bold ${profitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {profitLoss >= 0 ? '+' : '-'}{CURRENCY_SYMBOL}{Math.abs(profitLoss).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6 text-center">AI Accuracy Rating</p>
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-slate-800"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * winRate) / 100}
                strokeLinecap="round"
                className="text-emerald-500 transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-white">{winRate.toFixed(1)}%</span>
              <span className="text-[10px] font-bold text-slate-500">HIT RATE</span>
            </div>
          </div>
          <div className="mt-6 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <i className="fas fa-shield-check text-emerald-500"></i>
              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">Validated by Core Engine</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-2">
              Total Positions: {wins + losses} | W: {wins} L: {losses}
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PerformanceChart data={history} />
        
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 h-80 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-chart-bar text-cyan-500"></i>
            Winning vs Losses
          </h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={winLossData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="wins" name="Wins" fill="#10b981" radius={[4, 4, 0, 0]} barSize={60} />
                <Bar dataKey="losses" name="Losses" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 h-80">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <i className="fas fa-chart-pie text-amber-500"></i>
          Asset Allocation
        </h3>
        <div className="h-56 flex">
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {allocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-center gap-4 pl-4 min-w-[140px]">
            {allocationData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{entry.name}</p>
                  <p className="text-sm font-mono text-white">{CURRENCY_SYMBOL}{entry.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
