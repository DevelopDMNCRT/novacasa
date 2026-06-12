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

/**
 * Normaliza los nombres para tratar de emparejarlos en caso de que no estén en el diccionario exacto.
 */
function normalizeName(name) {
  if (!name) return '';
  return name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "") // quita acentos
    .trim();
}

/**
 * Traduce el nombre del equipo de la DB al formato esperado en Sofascore (inglés)
 */
function translateToSofascore(dbName) {
  return teamDictionary[dbName] || dbName;
}

/**
 * Consulta la API pública de Sofascore para una fecha dada (YYYY-MM-DD)
 * @param {string} dateString Ej: "2026-06-11"
 * @returns {Promise<Array>} Array de eventos de esa fecha
 */
async function fetchSofascoreMatchesByDate(dateString) {
  const url = `https://api.sofascore.com/api/v1/sport/football/scheduled-events/${dateString}`;
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Origin': 'https://www.sofascore.com',
        'Referer': 'https://www.sofascore.com/'
      }
    });

    if (!response.ok) {
      console.error(`[Sofascore] Error fetching ${dateString}: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return data.events || [];
  } catch (error) {
    console.error(`[Sofascore] Failed request for ${dateString}:`, error.message);
    return [];
  }
}

/**
 * Compara un partido de nuestra DB con la lista de eventos de Sofascore para ver si finalizó y obtener el marcador.
 */
function findMatchResultInSofascore(dbMatch, sofascoreEvents) {
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

  if (!matchEvent) {
    return null; // Partido no encontrado en los eventos de Sofascore
  }

  // Verificar si el partido ya terminó. En Sofascore:
  // type = 'finished' indica finalizado. (codigo 100 también suele ser FT)
  if (matchEvent.status && matchEvent.status.type === 'finished') {
    return {
      homeScore: matchEvent.homeScore.current,
      awayScore: matchEvent.awayScore.current
    };
  }

  return null; // Aún no termina o no hay marcador
}

module.exports = {
  fetchSofascoreMatchesByDate,
  findMatchResultInSofascore
};
