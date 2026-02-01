
import { Game, GameStats } from "../types";
import { GLOBAL_MARKETS } from "../constants";

const generateId = () => Math.random().toString(36).substr(2, 9);

export function calculateDynamicOdds(sport: string, stats: GameStats): { home: number; away: number; draw?: number } {
  const { score, time, possession } = stats;
  const scoreDiff = score[0] - score[1];
  
  const maxTime = sport === 'Soccer' ? 90 : (sport === 'Rugby' ? 80 : (sport === 'Basketball' ? 48 : 100));
  const timeFactor = 1 + (time / maxTime); 
  
  let homeProb = 0.45 + (scoreDiff * 0.15) + ((possession[0] - 50) * 0.005);
  let awayProb = 0.45 - (scoreDiff * 0.15) + ((possession[1] - 50) * 0.005);
  
  if (scoreDiff > 0) homeProb *= timeFactor;
  if (scoreDiff < 0) awayProb *= timeFactor;

  const total = homeProb + awayProb + (sport === 'Soccer' ? 0.2 : 0.1);
  
  const homeOdds = Math.max(1.01, +(1 / (homeProb / total)).toFixed(2));
  const awayOdds = Math.max(1.01, +(1 / (awayProb / total)).toFixed(2));
  
  let drawOdds;
  if (sport === 'Soccer' || sport === 'Rugby') {
    const drawProb = 0.15 + (Math.abs(scoreDiff) < (sport === 'Soccer' ? 2 : 7) ? (time / (maxTime * 2)) : -0.1);
    drawOdds = Math.max(1.1, +(1 / drawProb).toFixed(2));
  }

  return { 
    home: Math.min(homeOdds, 50.0), 
    away: Math.min(awayOdds, 50.0), 
    draw: drawOdds 
  };
}

export function generateLiveGames(count: number = 8): Game[] {
  const sports = Object.keys(GLOBAL_MARKETS) as (keyof typeof GLOBAL_MARKETS)[];
  
  return Array.from({ length: count }, () => {
    const sport = sports[Math.floor(Math.random() * sports.length)];
    const markets = GLOBAL_MARKETS[sport];
    const market = markets[Math.floor(Math.random() * markets.length)];
    const teams = market.teams;
    
    const homeIdx = Math.floor(Math.random() * teams.length);
    let awayIdx = Math.floor(Math.random() * teams.length);
    while (awayIdx === homeIdx) awayIdx = Math.floor(Math.random() * teams.length);

    const maxTime = sport === 'Soccer' ? 90 : (sport === 'Rugby' ? 80 : (sport === 'Basketball' ? 48 : 100));
    const time = Math.floor(Math.random() * maxTime);
    
    let score: [number, number] = [0, 0];
    if (sport === 'Soccer') {
        score = [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)];
    } else if (sport === 'Rugby') {
        score = [Math.floor(Math.random() * 40), Math.floor(Math.random() * 40)];
    } else if (sport === 'Basketball') {
        score = [80 + Math.floor(Math.random() * 40), 80 + Math.floor(Math.random() * 40)];
    } else {
        score = [Math.floor(Math.random() * 200), Math.floor(Math.random() * 200)];
    }
    
    const stats: GameStats = {
      score,
      possession: [50 + Math.floor(Math.random() * 20 - 10), 0],
      shots: [Math.floor(Math.random() * 25), Math.floor(Math.random() * 25)],
      yellowCards: [Math.floor(Math.random() * 4), Math.floor(Math.random() * 4)],
      corners: [Math.floor(Math.random() * 12), Math.floor(Math.random() * 12)],
      fouls: [Math.floor(Math.random() * 18), Math.floor(Math.random() * 18)],
      playerForm: [+(5 + Math.random() * 5).toFixed(1), +(5 + Math.random() * 5).toFixed(1)],
      time
    };
    stats.possession[1] = 100 - stats.possession[0];

    const odds = calculateDynamicOdds(sport, stats);

    return {
      id: generateId(),
      sport: sport as any,
      league: market.league,
      homeTeam: teams[homeIdx],
      awayTeam: teams[awayIdx],
      homeOdds: odds.home,
      awayOdds: odds.away,
      drawOdds: odds.draw,
      status: 'Live',
      stats
    };
  });
}
