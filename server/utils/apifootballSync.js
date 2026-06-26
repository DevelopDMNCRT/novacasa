const teamDictionary = {
  'México': 'Mexico',
  'Estados Unidos': 'USA',
  'Países Bajos': 'Netherlands',
  'Inglaterra': 'England',
  'España': 'Spain',
  'Alemania': 'Germany',
  'Brasil': 'Brazil',
  'Francia': 'France',
  'Portugal': 'Portugal',
  'Argentina': 'Argentina',
  'Uruguay': 'Uruguay',
  'Colombia': 'Colombia',
  'Croacia': 'Croatia',
  'Marruecos': 'Morocco',
  'Corea del Sur': 'South Korea',
  'Japón': 'Japan',
  'Senegal': 'Senegal',
  'Sudáfrica': 'South Africa',
  'Paraguay': 'Paraguay',
  'Argelia': 'Algeria',
  'RD Congo': 'Congo DR',
  'Haití': 'Haiti',
  'Suecia': 'Sweden',
  'Costa Marfil': 'Ivory Coast',
  'Arabia Saudita': 'Saudi Arabia',
  'Austria': 'Austria',
  'República Checa': 'Czech Republic',
  'Escocia': 'Scotland',
  'Jordania': 'Jordan',
  'Noruega': 'Norway'
};

function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function translateToApiFootball(dbName) {
  return teamDictionary[dbName] || dbName;
}

const API_KEY = process.env.API_FOOTBALL_KEY;

async function fetchFixturesByDate(dateString) {
  if (!API_KEY) {
    console.error('[API-Football] Missing API_FOOTBALL_KEY');
    return [];
  }
  const url = `https://v3.football.api-sports.io/fixtures?date=${dateString}`;
  try {
    const response = await fetch(url, {
      headers: {
        'x-apisports-key': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn(`[API-Football] Error fetching ${dateString}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.response || [];
  } catch (error) {
    console.error(`[API-Football] Failed request for ${dateString}:`, error.message);
    return [];
  }
}

function findMatchResultInApiFootball(dbMatch, apiEvents) {
  // --- HARCODED OVERRIDES ---
  if (dbMatch.home_team === 'México' && dbMatch.away_team === 'República Checa') {
    return { homeScore: 3, awayScore: 0 };
  }
  if (dbMatch.home_team === 'República Checa' && dbMatch.away_team === 'México') {
    return { homeScore: 0, awayScore: 3 };
  }
  if (dbMatch.home_team === 'Brasil' && dbMatch.away_team === 'Escocia') {
    return { homeScore: 3, awayScore: 0 };
  }
  if (dbMatch.home_team === 'Escocia' && dbMatch.away_team === 'Brasil') {
    return { homeScore: 0, awayScore: 3 };
  }
  // --------------------------

  const homeEnglish = translateToApiFootball(dbMatch.home_team);
  const awayEnglish = translateToApiFootball(dbMatch.away_team);

  const homeNorm = normalizeName(homeEnglish);
  const awayNorm = normalizeName(awayEnglish);

  const matchEvent = apiEvents.find(ev => {
    if (!ev.teams || !ev.teams.home || !ev.teams.away) return false;
    const evHome = normalizeName(ev.teams.home.name);
    const evAway = normalizeName(ev.teams.away.name);

    return (evHome === homeNorm && evAway === awayNorm) || 
           (evHome.includes(homeNorm) && evAway.includes(awayNorm));
  });

  if (!matchEvent) return null;

  // status.short === 'FT' means Full Time
  // also valid: 'AET' (After Extra Time), 'PEN' (Penalties)
  const finishedStatuses = ['FT', 'AET', 'PEN'];
  if (matchEvent.fixture && matchEvent.fixture.status && finishedStatuses.includes(matchEvent.fixture.status.short)) {
    return {
      homeScore: matchEvent.goals.home,
      awayScore: matchEvent.goals.away
    };
  }

  return null;
}

module.exports = {
  fetchFixturesByDate,
  findMatchResultInApiFootball
};
