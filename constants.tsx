
export const INITIAL_BALANCE = 10000;
export const CURRENCY_SYMBOL = 'R';

export const GLOBAL_MARKETS = {
  Soccer: [
    { league: 'Premier League', teams: ['Man City', 'Arsenal', 'Liverpool', 'Man Utd', 'Chelsea', 'Tottenham', 'Aston Villa', 'Newcastle'] },
    { league: 'La Liga', teams: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona', 'Athletic Club', 'Real Sociedad'] },
    { league: 'Bundesliga', teams: ['Bayer Leverkusen', 'Bayern Munich', 'Stuttgart', 'RB Leipzig', 'Dortmund', 'Frankfurt'] },
    { league: 'Serie A', teams: ['Inter Milan', 'AC Milan', 'Juventus', 'Bologna', 'Roma', 'Atalanta', 'Napoli'] },
    { league: 'Ligue 1', teams: ['PSG', 'Monaco', 'Brest', 'Lille', 'Nice', 'Lyon'] },
    { league: 'MLS', teams: ['Inter Miami', 'Columbus Crew', 'LAFC', 'FC Cincinnati', 'Real Salt Lake'] },
    { league: 'PSL (RSA)', teams: ['Sundowns', 'Orlando Pirates', 'Kaizer Chiefs', 'Stellenbosch', 'SuperSport Utd'] },
    { league: 'Champions League', teams: ['Real Madrid', 'Man City', 'Bayern Munich', 'PSG', 'Inter Milan', 'Arsenal'] }
  ],
  Basketball: [
    { league: 'NBA', teams: ['Celtics', 'Nuggets', 'Timberwolves', 'Thunder', 'Mavericks', 'Knicks', 'Lakers', 'Warriors'] },
    { league: 'EuroLeague', teams: ['Real Madrid BC', 'Panathinaikos', 'Monaco', 'Olympiacos', 'Fenerbahce'] }
  ],
  Rugby: [
    { league: 'URC', teams: ['Stormers', 'Bulls', 'Leinster', 'Munster', 'Glasgow Warriors', 'Sharks'] },
    { league: 'Super Rugby', teams: ['Blues', 'Hurricanes', 'Brumbies', 'Chiefs', 'Reds', 'Crusaders'] },
    { league: 'Six Nations', teams: ['Ireland', 'France', 'England', 'Scotland', 'Wales', 'Italy'] },
    { league: 'Rugby Championship', teams: ['Springboks', 'All Blacks', 'Wallabies', 'Los Pumas'] }
  ],
  Cricket: [
    { league: 'IPL', teams: ['KKR', 'SRH', 'RR', 'RCB', 'CSK', 'DC', 'LSG', 'GT', 'PBKS', 'MI'] },
    { league: 'Big Bash', teams: ['Heat', 'Sixers', 'Scorchers', 'Strikers', 'Stars', 'Renegades'] },
    { league: 'International T20', teams: ['India', 'Australia', 'Proteas', 'England', 'Pakistan', 'West Indies'] }
  ],
  NFL: [
    { league: 'NFL', teams: ['Chiefs', '49ers', 'Ravens', 'Lions', 'Eagles', 'Cowboys', 'Bills', 'Packers'] }
  ]
};

// Legacy support if needed, but we prefer GLOBAL_MARKETS now
export const SPORTS_TEAMS = {
  Soccer: GLOBAL_MARKETS.Soccer.flatMap(l => l.teams),
  Rugby: GLOBAL_MARKETS.Rugby.flatMap(l => l.teams),
  Cricket: GLOBAL_MARKETS.Cricket.flatMap(l => l.teams)
};
