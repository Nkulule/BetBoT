
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber?: string;
  balance: number;
  isVerified: boolean;
}

export interface Transaction {
  id: string;
  type: 'Deposit' | 'Withdrawal';
  amount: number;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
  timestamp: Date;
}

export interface GameStats {
  score: [number, number];
  possession: [number, number];
  shots: [number, number];
  yellowCards: [number, number];
  corners: [number, number];
  fouls: [number, number];
  playerForm: [number, number]; // Aggregate form index 0-10
  time: number;
}

export interface Game {
  id: string;
  sport: 'Soccer' | 'Rugby' | 'Cricket' | 'Basketball' | 'NFL';
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  stats: GameStats;
  status: 'Live' | 'Finished' | 'Upcoming';
}

export interface Bet {
  id: string;
  gameId: string;
  matchup: string;
  selection: string;
  amount: number;
  odds: number;
  confidence: number;
  status: 'Open' | 'Won' | 'Lost';
  timestamp: Date;
}

export interface BotLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ai';
}

export interface AIAnalysisResult {
  confidence: number;
  reasoning: string;
  recommendation: 'HOME' | 'AWAY' | 'DRAW' | 'SKIP';
}
