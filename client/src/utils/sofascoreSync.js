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
  'RD Congo': 'DR Congo',
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

function translateToSofascore(dbName) {
  return teamDictionary[dbName] || dbName;
}

export async function fetchSofascoreMatchesByDate(dateString) {
  const url = `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${dateString}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': '*/*',
        // El navegador inyectará automáticamente User-Agent, Origin, Referer, evadiendo a Cloudflare
      }
    });

    if (!response.ok) {
      console.warn(`[Sofascore Sync] Error fetching ${dateString}: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error(`[Sofascore Sync] Failed request for ${dateString}:`, error.message);
    return [];
  }
}

export function findMatchResultInSofascore(dbMatch, sofascoreEvents) {
  const homeEnglish = translateToSofascore(dbMatch.home_team);
  const awayEnglish = translateToSofascore(dbMatch.away_team);

  const homeNorm = normalizeName(homeEnglish);
  const awayNorm = normalizeName(awayEnglish);

  const matchEvent = sofascoreEvents.find(ev => {
    if (!ev.homeTeam || !ev.awayTeam) return false;
    const evHome = normalizeName(ev.homeTeam.name);
    const evAway = normalizeName(ev.awayTeam.name);

    return (evHome === homeNorm && evAway === awayNorm) || 
           (evHome.includes(homeNorm) && evAway.includes(awayNorm));
  });

  if (!matchEvent) return null;

  // status.type === 'finished' significa que el partido ya terminó
  if (matchEvent.status && matchEvent.status.type === 'finished') {
    return {
      homeScore: matchEvent.homeScore.current,
      awayScore: matchEvent.awayScore.current
    };
  }

  return null;
}
