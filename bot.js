const fs = require('fs');
const https = require('https');
const path = require('path');

const API_KEY = process.env.API_KEY || '6a0ae2f262c8664f458eaff47f138725';
const RESULTS_FILE = path.join(__dirname, 'results.json');
const STATE_FILE = path.join(__dirname, 'state.json');

// ══ MATCHES CALENDAR ══
const GM = [
  // Group A
  {id:'g1', h:'MEX',a:'RSA',d:'2026-06-11',t:'15:00'},{id:'g2', h:'KOR',a:'CZE',d:'2026-06-11',t:'22:00'},
  {id:'g3', h:'MEX',a:'KOR',d:'2026-06-18',t:'21:00'},{id:'g4', h:'CZE',a:'RSA',d:'2026-06-18',t:'12:00'},
  {id:'g5', h:'RSA',a:'KOR',d:'2026-06-24',t:'21:00'},{id:'g6', h:'CZE',a:'MEX',d:'2026-06-24',t:'21:00'},
  // Group B
  {id:'g7', h:'CAN',a:'BIH',d:'2026-06-12',t:'15:00'},{id:'g8', h:'QAT',a:'SUI',d:'2026-06-13',t:'15:00'},
  {id:'g9', h:'CAN',a:'QAT',d:'2026-06-18',t:'18:00'},{id:'g10',h:'SUI',a:'BIH',d:'2026-06-18',t:'15:00'},
  {id:'g11',h:'SUI',a:'CAN',d:'2026-06-24',t:'15:00'},{id:'g12',h:'BIH',a:'QAT',d:'2026-06-24',t:'15:00'},
  // Group C
  {id:'g13',h:'BRA',a:'MAR',d:'2026-06-13',t:'18:00'},{id:'g14',h:'HAI',a:'SCO',d:'2026-06-13',t:'21:00'},
  {id:'g15',h:'BRA',a:'HAI',d:'2026-06-19',t:'20:30'},{id:'g16',h:'SCO',a:'MAR',d:'2026-06-19',t:'18:00'},
  {id:'g17',h:'MAR',a:'HAI',d:'2026-06-24',t:'18:00'},{id:'g18',h:'SCO',a:'BRA',d:'2026-06-24',t:'18:00'},
  // Group D
  {id:'g19',h:'USA',a:'PAR',d:'2026-06-12',t:'21:00'},{id:'g20',h:'AUS',a:'TUR',d:'2026-06-14',t:'00:00'},
  {id:'g21',h:'USA',a:'AUS',d:'2026-06-19',t:'15:00'},{id:'g22',h:'TUR',a:'PAR',d:'2026-06-19',t:'23:00'},
  {id:'g23',h:'TUR',a:'USA',d:'2026-06-25',t:'22:00'},{id:'g24',h:'PAR',a:'AUS',d:'2026-06-25',t:'22:00'},
  // Group E
  {id:'g25',h:'GER',a:'CUW',d:'2026-06-14',t:'13:00'},{id:'g26',h:'CIV',a:'ECU',d:'2026-06-14',t:'19:00'},
  {id:'g27',h:'GER',a:'CIV',d:'2026-06-20',t:'16:00'},{id:'g28',h:'ECU',a:'CUW',d:'2026-06-20',t:'20:00'},
  {id:'g29',h:'ECU',a:'GER',d:'2026-06-25',t:'16:00'},{id:'g30',h:'CUW',a:'CIV',d:'2026-06-25',t:'16:00'},
  // Group F
  {id:'g31',h:'NED',a:'JPN',d:'2026-06-14',t:'16:00'},{id:'g32',h:'SWE',a:'TUN',d:'2026-06-14',t:'22:00'},
  {id:'g33',h:'NED',a:'SWE',d:'2026-06-20',t:'13:00'},{id:'g34',h:'TUN',a:'JPN',d:'2026-06-21',t:'00:00'},
  {id:'g35',h:'TUN',a:'NED',d:'2026-06-25',t:'19:00'},{id:'g36',h:'JPN',a:'SWE',d:'2026-06-25',t:'19:00'},
  // Group G
  {id:'g37',h:'BEL',a:'EGY',d:'2026-06-15',t:'15:00'},{id:'g38',h:'IRN',a:'NZL',d:'2026-06-15',t:'21:00'},
  {id:'g39',h:'BEL',a:'IRN',d:'2026-06-21',t:'15:00'},{id:'g40',h:'NZL',a:'EGY',d:'2026-06-21',t:'21:00'},
  {id:'g41',h:'NZL',a:'BEL',d:'2026-06-26',t:'23:00'},{id:'g42',h:'EGY',a:'IRN',d:'2026-06-26',t:'23:00'},
  // Group H
  {id:'g43',h:'ESP',a:'CPV',d:'2026-06-15',t:'12:00'},{id:'g44',h:'KSA',a:'URU',d:'2026-06-15',t:'18:00'},
  {id:'g45',h:'ESP',a:'KSA',d:'2026-06-21',t:'12:00'},{id:'g46',h:'URU',a:'CPV',d:'2026-06-21',t:'18:00'},
  {id:'g47',h:'URU',a:'ESP',d:'2026-06-26',t:'20:00'},{id:'g48',h:'CPV',a:'KSA',d:'2026-06-26',t:'20:00'},
  // Group I
  {id:'g49',h:'FRA',a:'SEN',d:'2026-06-16',t:'15:00'},{id:'g50',h:'IRQ',a:'NOR',d:'2026-06-16',t:'18:00'},
  {id:'g51',h:'FRA',a:'IRQ',d:'2026-06-22',t:'17:00'},{id:'g52',h:'NOR',a:'SEN',d:'2026-06-22',t:'20:00'},
  {id:'g53',h:'NOR',a:'FRA',d:'2026-06-26',t:'15:00'},{id:'g54',h:'SEN',a:'IRQ',d:'2026-06-26',t:'15:00'},
  // Group J
  {id:'g55',h:'ARG',a:'ALG',d:'2026-06-16',t:'21:00'},{id:'g56',h:'AUT',a:'JOR',d:'2026-06-17',t:'00:00'},
  {id:'g57',h:'ARG',a:'AUT',d:'2026-06-22',t:'13:00'},{id:'g58',h:'JOR',a:'ALG',d:'2026-06-22',t:'23:00'},
  {id:'g59',h:'JOR',a:'ARG',d:'2026-06-27',t:'22:00'},{id:'g60',h:'ALG',a:'AUT',d:'2026-06-27',t:'22:00'},
  // Group K
  {id:'g61',h:'POR',a:'COD',d:'2026-06-17',t:'13:00'},{id:'g62',h:'UZB',a:'COL',d:'2026-06-17',t:'22:00'},
  {id:'g63',h:'POR',a:'UZB',d:'2026-06-23',t:'13:00'},{id:'g64',h:'COL',a:'COD',d:'2026-06-23',t:'22:00'},
  {id:'g65',h:'COL',a:'POR',d:'2026-06-27',t:'19:30'},{id:'g66',h:'COD',a:'UZB',d:'2026-06-27',t:'19:30'},
  // Group L
  {id:'g67',h:'ENG',a:'CRO',d:'2026-06-17',t:'16:00'},{id:'g68',h:'GHA',a:'PAN',d:'2026-06-17',t:'19:00'},
  {id:'g69',h:'ENG',a:'GHA',d:'2026-06-23',t:'16:00'},{id:'g70',h:'PAN',a:'CRO',d:'2026-06-23',t:'19:00'},
  {id:'g71',h:'PAN',a:'ENG',d:'2026-06-27',t:'17:00'},{id:'g72',h:'CRO',a:'GHA',d:'2026-06-27',t:'17:00'},
];
const KM = [
  {id:'k73',d:'2026-06-28',t:'15:00'},{id:'k74',d:'2026-06-29',t:'16:30'},{id:'k75',d:'2026-06-29',t:'21:00'},{id:'k76',d:'2026-06-29',t:'13:00'},
  {id:'k77',d:'2026-06-30',t:'17:00'},{id:'k78',d:'2026-06-30',t:'13:00'},{id:'k79',d:'2026-06-30',t:'21:00'},{id:'k80',d:'2026-07-01',t:'12:00'},
  {id:'k81',d:'2026-07-01',t:'20:00'},{id:'k82',d:'2026-07-01',t:'16:00'},{id:'k83',d:'2026-07-02',t:'19:00'},{id:'k84',d:'2026-07-02',t:'15:00'},
  {id:'k85',d:'2026-07-02',t:'23:00'},{id:'k86',d:'2026-07-03',t:'18:00'},{id:'k87',d:'2026-07-03',t:'21:30'},{id:'k88',d:'2026-07-03',t:'14:00'},
  {id:'k89',d:'2026-07-04',t:'17:00'},{id:'k90',d:'2026-07-04',t:'13:00'},{id:'k91',d:'2026-07-05',t:'16:00'},{id:'k92',d:'2026-07-05',t:'20:00'},
  {id:'k93',d:'2026-07-06',t:'15:00'},{id:'k94',d:'2026-07-06',t:'20:00'},{id:'k95',d:'2026-07-07',t:'12:00'},{id:'k96',d:'2026-07-07',t:'16:00'},
  {id:'k97',d:'2026-07-09',t:'16:00'},{id:'k98',d:'2026-07-10',t:'15:00'},{id:'k99',d:'2026-07-11',t:'17:00'},{id:'k100',d:'2026-07-11',t:'21:00'},
  {id:'k101',d:'2026-07-14',t:'15:00'},{id:'k102',d:'2026-07-15',t:'15:00'},{id:'k103',d:'2026-07-18',t:'17:00'},{id:'k104',d:'2026-07-19',t:'15:00'}
];
const ALL_MATCHES = [...GM, ...KM];

// TEAM ALIASES TO MATCH API-FOOTBALL (includes FIFA name changes and common API variants)
const TEAM_MAP = {
  "Mexico":"MEX", "South Africa":"RSA", "Korea Republic":"KOR", "South Korea":"KOR",
  "Czech Republic":"CZE", "Czechia":"CZE",
  "Canada":"CAN", "Bosnia and Herzegovina":"BIH", "Bosnia & Herzegovina":"BIH",
  "Qatar":"QAT", "Switzerland":"SUI",
  "Brazil":"BRA", "Morocco":"MAR", "Haiti":"HAI", "Scotland":"SCO",
  "USA":"USA", "United States":"USA", "Paraguay":"PAR", "Australia":"AUS",
  "Turkey":"TUR", "Türkiye":"TUR", "Turkiye":"TUR",
  "Germany":"GER", "Curacao":"CUW", "Curaçao":"CUW",
  "Côte d'Ivoire":"CIV", "Cote D'Ivoire":"CIV", "Ivory Coast":"CIV",
  "Ecuador":"ECU",
  "Netherlands":"NED", "Japan":"JPN", "Sweden":"SWE", "Tunisia":"TUN",
  "Belgium":"BEL", "Egypt":"EGY", "Iran":"IRN", "IR Iran":"IRN",
  "New Zealand":"NZL",
  "Spain":"ESP", "Cape Verde":"CPV", "Cabo Verde":"CPV",
  "Saudi Arabia":"KSA", "Uruguay":"URU",
  "France":"FRA", "Senegal":"SEN", "Iraq":"IRQ", "Norway":"NOR",
  "Argentina":"ARG", "Algeria":"ALG", "Austria":"AUT", "Jordan":"JOR",
  "Portugal":"POR", "DR Congo":"COD", "Congo DR":"COD", "Congo":"COD",
  "Uzbekistan":"UZB", "Colombia":"COL",
  "England":"ENG", "Croatia":"CRO", "Ghana":"GHA", "Panama":"PAN"
};

// HELPER: Convert ET date/time to UTC timestamp
function getMatchTimeUTC(dateStr, timeStr) {
  // Construct string in ISO format for ET (UTC-4 in summer)
  const etStr = `${dateStr}T${timeStr}:00-04:00`;
  return new Date(etStr).getTime();
}

function loadJSON(file) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { console.error('Error loading JSON', e); }
  return {};
}

function saveJSON(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

// ══ STATE MANAGEMENT ══
const state = loadJSON(STATE_FILE);
const results = loadJSON(RESULTS_FILE); // Carrega cedo para checar status de atraso
// Get UTC-4 (ET) current date to sync correctly with matches
const etDate = new Date(Date.now() - 4 * 3600000);
const todayStr = etDate.toISOString().split('T')[0];

if (state.date !== todayStr) {
  state.date = todayStr;
  state.apiRemaining = 100; // Reset on new day — the API resets daily
  if (!state.apiIds) state.apiIds = {};
}
if (!state.apiIds) state.apiIds = {};

// SAFETY LOCK OFFICIAL API
if (state.apiRemaining !== undefined && state.apiRemaining <= 5) {
  console.log('SAFETY LOCK: Less than 5 API requests remaining globally. Skipping to prevent ban.');
  process.exit(0);
}

// ══ SMART POLLING LOGIC ══
const now = Date.now();
const activeMatches = [];
let requiresDailyFetch = false;
const FINISHED_STATUSES = ['FT', 'AET', 'PEN', 'PST', 'CANC', 'ABD', 'AWD', 'WO'];

for (const match of ALL_MATCHES) {
  const matchStart = getMatchTimeUTC(match.d, match.t);
  const diffMins = (now - matchStart) / 60000;
  
  const r = results[match.id];
  const isUnfinished = r && r.status && !FINISHED_STATUSES.includes(r.status);
  
  // Avalia janela estendida (4 horas) OU se o jogo está preso sem terminar (Paralisação)
  if ((diffMins >= -15 && diffMins <= 240) || isUnfinished) {
    activeMatches.push(match);
    if (!state.apiIds[match.id]) {
      requiresDailyFetch = true;
    }
  }
}

if (activeMatches.length === 0) {
  console.log('No matches in active polling window. Exiting.');
  process.exit(0);
}

// We poll every 15 minutes generally, but 10 minutes near the end
const lastPoll = state.lastPoll || 0;
const minsSinceLastPoll = (now - lastPoll) / 60000;

let interval = 15;
for (const match of activeMatches) {
  const diffMins = (now - getMatchTimeUTC(match.d, match.t)) / 60000;
  if (diffMins >= 75 && diffMins <= 105) interval = 10; 
  if (diffMins >= 135) interval = 10;
}

if (minsSinceLastPoll < interval) {
  console.log(`Interval of ${interval} mins not reached. (Last poll: ${minsSinceLastPoll.toFixed(1)} mins ago).`);
  process.exit(0);
}

// ══ FETCH DATA ══
// If we have active matches but don't know their API IDs, fetch the daily list.
// Otherwise, fetch precisely their IDs so we get the events (goals, cards).

let fetchPath = '';
if (requiresDailyFetch) {
  fetchPath = `/fixtures?league=1&season=2026&date=${todayStr}&timezone=America/New_York`;
  console.log(`Fetching daily schedule to resolve API IDs...`);
} else {
  const idsToFetch = activeMatches.map(m => state.apiIds[m.id]).filter(Boolean).join('-');
  // Note: For API-Football to query multiple IDs, use ids parameter
  fetchPath = `/fixtures?ids=${idsToFetch}`;
  console.log(`Fetching specific IDs to get events: ${idsToFetch}`);
}

const reqOpts = {
  hostname: 'v3.football.api-sports.io',
  path: fetchPath,
  method: 'GET',
  headers: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': API_KEY
  }
};

const req = https.request(reqOpts, (res) => {
  let chunks = '';
  res.on('data', d => chunks += d);
  res.on('end', () => {
    const remaining = parseInt(res.headers['x-ratelimit-requests-remaining']);
    if (!isNaN(remaining)) state.apiRemaining = remaining;
    console.log(`API requests remaining today: ${state.apiRemaining}`);
    state.lastPoll = Date.now();
    
    try {
      const data = JSON.parse(chunks);
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.error('API Error:', data.errors);
        saveJSON(STATE_FILE, state);
        process.exit(1);
      }
      
      let updated = false;
      const usedIds = new Set();
      
      // Guard: ensure response is a valid array of fixtures
      if (!data.response || !Array.isArray(data.response)) {
        console.warn('No fixtures in response or invalid format. Skipping processing.');
        saveJSON(STATE_FILE, state);
        return;
      }
      
      function findTeamCode(apiName) {
        const exact = TEAM_MAP[apiName];
        if (exact) return exact;
        const nameLower = apiName.toLowerCase();
        for (const [key, code] of Object.entries(TEAM_MAP)) {
          if (nameLower.includes(key.toLowerCase()) || key.toLowerCase().includes(nameLower)) {
            return code;
          }
        }
        return null;
      }
      
      for (const fix of data.response) {
        const apiHome = fix.teams.home.name;
        const apiAway = fix.teams.away.name;
        const fixId = fix.fixture.id;
        
        let mId = null;
        
        // Match by known ID first
        for (const key of Object.keys(state.apiIds)) {
          if (state.apiIds[key] === fixId) {
            mId = key;
            break;
          }
        }
        
        // If unknown, map it by TEAM first (critical for simultaneous MD3 games)
        if (!mId) {
          const hCode = findTeamCode(apiHome);
          const aCode = findTeamCode(apiAway);
          if (hCode && aCode) {
            for (const m of ALL_MATCHES) {
              if (m.h && m.a && hCode === m.h && aCode === m.a && !usedIds.has(m.id)) {
                mId = m.id;
                break;
              }
            }
          }
        }
        // Fallback: map by time (3-hour tolerance for weather delays/rescheduling)
        // Used for knockout games (no h/a) or if API uses unexpected team names
        if (!mId) {
          const apiStart = new Date(fix.fixture.date).getTime();
          for (const m of ALL_MATCHES) {
            const mStart = getMatchTimeUTC(m.d, m.t);
            // Tolerância de 3 horas para atrasos climáticos (10800000 ms)
            if (Math.abs(apiStart - mStart) < 10800000 && !usedIds.has(m.id)) {
              mId = m.id;
              break;
            }
          }
        }
        // Cache the API ID for ALL match types (team-based or time-based)
        if (mId && !state.apiIds[mId]) {
          state.apiIds[mId] = fixId;
        }
        
        if (mId) {
          // Prevenção de Bloqueio Prematuro: Não salvar partidas 'Não Iniciadas' 
          // caso não estejam na janela de 15 minutos (activeMatches)
          const isNS = fix.fixture.status.short === 'NS' || fix.fixture.status.short === 'TBD';
          const isActive = activeMatches.some(m => m.id === mId);
          if (isNS && !isActive) continue;

          usedIds.add(mId);
          if (!results[mId]) results[mId] = {};
          
          const r = results[mId];
          r.h = fix.goals.home !== null ? String(fix.goals.home) : '';
          r.a = fix.goals.away !== null ? String(fix.goals.away) : '';
          
          // Safe access: extratime/penalty objects can be null in edge cases
          const et = fix.score && fix.score.extratime;
          const ft = fix.score && fix.score.fulltime;
          if (et && ft && et.home !== null && ft.home !== null && et.away !== null && ft.away !== null) {
            r.eh = String(et.home - ft.home);
            r.ea = String(et.away - ft.away);
          }
          const pen = fix.score && fix.score.penalty;
          if (pen && pen.home !== null) {
            r.ph = String(pen.home);
            r.pa = String(pen.away);
          }
          
          r.time = fix.fixture.status.elapsed ? `${fix.fixture.status.elapsed}'` : fix.fixture.status.short;
          r.status = fix.fixture.status.short;
          
          // EVENTS (Goals & Cards)
          if (fix.events && fix.events.length > 0) {
            let scorers = [];
            let cards = [];
            for (const e of fix.events) {
              if (!e.player || !e.player.name) continue; // Skip VAR/substitution events without player
              const timeStr = e.time.elapsed + (e.time.extra ? `+${e.time.extra}` : '') + "'";
              const pName = e.player.name;
              // Filter out Missed Penalties
              if (e.type === 'Goal' && e.detail && !e.detail.includes('Missed')) {
                scorers.push(`${pName} ${timeStr}`);
              } else if (e.type === 'Card' && e.detail) {
                if (e.detail.includes('Yellow')) cards.push(`🟨 ${pName} ${timeStr}`);
                if (e.detail.includes('Red')) cards.push(`🟥 ${pName} ${timeStr}`);
              }
            }
            r.scorers = scorers.join(', ');
            r.cards = cards.join(', ');
          }
          
          updated = true;
        }
      }
      
      if (updated) {
        saveJSON(RESULTS_FILE, results);
        console.log('Results updated.');
      }
      saveJSON(STATE_FILE, state);
      
    } catch (e) {
      console.error('Error parsing response:', e);
      saveJSON(STATE_FILE, state); // Always persist apiRemaining + lastPoll
    }
  });
});

req.on('error', e => console.error(e));
req.end();
