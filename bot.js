const fs   = require('fs');
const https = require('https');
const path  = require('path');

// ══ ARQUIVOS ══
const RESULTS_FILE = path.join(__dirname, 'results.json');
const STATE_FILE   = path.join(__dirname, 'state.json');

// ══ API ══
// Fonte: https://worldcup26.ir (open-source, gratuita, sem chave)
// Endpoint único que retorna todos os 104 jogos com placar ao vivo.
const API_URL = 'https://worldcup26.ir/get/games';

// NOTA PARA O WORKFLOW (.github/workflows):
// O secret API_KEY não é mais necessário e pode ser removido do workflow.
// Não causa erro se ainda estiver lá — será ignorado.

// ══ CALENDÁRIO INTERNO ══
// Horários em ET (UTC-4 no verão). Usados para controlar a janela de polling.
const GM = [
  // Grupo A
  {id:'g1', h:'MEX',a:'RSA',d:'2026-06-11',t:'15:00'},{id:'g2', h:'KOR',a:'CZE',d:'2026-06-11',t:'22:00'},
  {id:'g3', h:'MEX',a:'KOR',d:'2026-06-18',t:'21:00'},{id:'g4', h:'CZE',a:'RSA',d:'2026-06-18',t:'12:00'},
  {id:'g5', h:'RSA',a:'KOR',d:'2026-06-24',t:'21:00'},{id:'g6', h:'CZE',a:'MEX',d:'2026-06-24',t:'21:00'},
  // Grupo B
  {id:'g7', h:'CAN',a:'BIH',d:'2026-06-12',t:'15:00'},{id:'g8', h:'QAT',a:'SUI',d:'2026-06-13',t:'15:00'},
  {id:'g9', h:'CAN',a:'QAT',d:'2026-06-18',t:'18:00'},{id:'g10',h:'SUI',a:'BIH',d:'2026-06-18',t:'15:00'},
  {id:'g11',h:'SUI',a:'CAN',d:'2026-06-24',t:'15:00'},{id:'g12',h:'BIH',a:'QAT',d:'2026-06-24',t:'15:00'},
  // Grupo C
  {id:'g13',h:'BRA',a:'MAR',d:'2026-06-13',t:'18:00'},{id:'g14',h:'HAI',a:'SCO',d:'2026-06-13',t:'21:00'},
  {id:'g15',h:'BRA',a:'HAI',d:'2026-06-19',t:'20:30'},{id:'g16',h:'SCO',a:'MAR',d:'2026-06-19',t:'18:00'},
  {id:'g17',h:'MAR',a:'HAI',d:'2026-06-24',t:'18:00'},{id:'g18',h:'SCO',a:'BRA',d:'2026-06-24',t:'18:00'},
  // Grupo D
  {id:'g19',h:'USA',a:'PAR',d:'2026-06-12',t:'21:00'},{id:'g20',h:'AUS',a:'TUR',d:'2026-06-14',t:'00:00'},
  {id:'g21',h:'USA',a:'AUS',d:'2026-06-19',t:'15:00'},{id:'g22',h:'TUR',a:'PAR',d:'2026-06-19',t:'23:00'},
  {id:'g23',h:'TUR',a:'USA',d:'2026-06-25',t:'22:00'},{id:'g24',h:'PAR',a:'AUS',d:'2026-06-25',t:'22:00'},
  // Grupo E
  {id:'g25',h:'GER',a:'CUW',d:'2026-06-14',t:'13:00'},{id:'g26',h:'CIV',a:'ECU',d:'2026-06-14',t:'19:00'},
  {id:'g27',h:'GER',a:'CIV',d:'2026-06-20',t:'16:00'},{id:'g28',h:'ECU',a:'CUW',d:'2026-06-20',t:'20:00'},
  {id:'g29',h:'ECU',a:'GER',d:'2026-06-25',t:'16:00'},{id:'g30',h:'CUW',a:'CIV',d:'2026-06-25',t:'16:00'},
  // Grupo F
  {id:'g31',h:'NED',a:'JPN',d:'2026-06-14',t:'16:00'},{id:'g32',h:'SWE',a:'TUN',d:'2026-06-14',t:'22:00'},
  {id:'g33',h:'NED',a:'SWE',d:'2026-06-20',t:'13:00'},{id:'g34',h:'TUN',a:'JPN',d:'2026-06-21',t:'00:00'},
  {id:'g35',h:'TUN',a:'NED',d:'2026-06-25',t:'19:00'},{id:'g36',h:'JPN',a:'SWE',d:'2026-06-25',t:'19:00'},
  // Grupo G
  {id:'g37',h:'BEL',a:'EGY',d:'2026-06-15',t:'15:00'},{id:'g38',h:'IRN',a:'NZL',d:'2026-06-15',t:'21:00'},
  {id:'g39',h:'BEL',a:'IRN',d:'2026-06-21',t:'15:00'},{id:'g40',h:'NZL',a:'EGY',d:'2026-06-21',t:'21:00'},
  {id:'g41',h:'NZL',a:'BEL',d:'2026-06-26',t:'23:00'},{id:'g42',h:'EGY',a:'IRN',d:'2026-06-26',t:'23:00'},
  // Grupo H
  {id:'g43',h:'ESP',a:'CPV',d:'2026-06-15',t:'12:00'},{id:'g44',h:'KSA',a:'URU',d:'2026-06-15',t:'18:00'},
  {id:'g45',h:'ESP',a:'KSA',d:'2026-06-21',t:'12:00'},{id:'g46',h:'URU',a:'CPV',d:'2026-06-21',t:'18:00'},
  {id:'g47',h:'URU',a:'ESP',d:'2026-06-26',t:'20:00'},{id:'g48',h:'CPV',a:'KSA',d:'2026-06-26',t:'20:00'},
  // Grupo I
  {id:'g49',h:'FRA',a:'SEN',d:'2026-06-16',t:'15:00'},{id:'g50',h:'IRQ',a:'NOR',d:'2026-06-16',t:'18:00'},
  {id:'g51',h:'FRA',a:'IRQ',d:'2026-06-22',t:'17:00'},{id:'g52',h:'NOR',a:'SEN',d:'2026-06-22',t:'20:00'},
  {id:'g53',h:'NOR',a:'FRA',d:'2026-06-26',t:'15:00'},{id:'g54',h:'SEN',a:'IRQ',d:'2026-06-26',t:'15:00'},
  // Grupo J
  {id:'g55',h:'ARG',a:'ALG',d:'2026-06-16',t:'21:00'},{id:'g56',h:'AUT',a:'JOR',d:'2026-06-17',t:'00:00'},
  {id:'g57',h:'ARG',a:'AUT',d:'2026-06-22',t:'13:00'},{id:'g58',h:'JOR',a:'ALG',d:'2026-06-22',t:'23:00'},
  {id:'g59',h:'JOR',a:'ARG',d:'2026-06-27',t:'22:00'},{id:'g60',h:'ALG',a:'AUT',d:'2026-06-27',t:'22:00'},
  // Grupo K
  {id:'g61',h:'POR',a:'COD',d:'2026-06-17',t:'13:00'},{id:'g62',h:'UZB',a:'COL',d:'2026-06-17',t:'22:00'},
  {id:'g63',h:'POR',a:'UZB',d:'2026-06-23',t:'13:00'},{id:'g64',h:'COL',a:'COD',d:'2026-06-23',t:'22:00'},
  {id:'g65',h:'COL',a:'POR',d:'2026-06-27',t:'19:30'},{id:'g66',h:'COD',a:'UZB',d:'2026-06-27',t:'19:30'},
  // Grupo L
  {id:'g67',h:'ENG',a:'CRO',d:'2026-06-17',t:'16:00'},{id:'g68',h:'GHA',a:'PAN',d:'2026-06-17',t:'19:00'},
  {id:'g69',h:'ENG',a:'GHA',d:'2026-06-23',t:'16:00'},{id:'g70',h:'PAN',a:'CRO',d:'2026-06-23',t:'19:00'},
  {id:'g71',h:'PAN',a:'ENG',d:'2026-06-27',t:'17:00'},{id:'g72',h:'CRO',a:'GHA',d:'2026-06-27',t:'17:00'},
];
const KM = [
  {id:'k73', d:'2026-06-28',t:'15:00'},{id:'k74', d:'2026-06-29',t:'16:30'},
  {id:'k75', d:'2026-06-29',t:'21:00'},{id:'k76', d:'2026-06-29',t:'13:00'},
  {id:'k77', d:'2026-06-30',t:'17:00'},{id:'k78', d:'2026-06-30',t:'13:00'},
  {id:'k79', d:'2026-06-30',t:'21:00'},{id:'k80', d:'2026-07-01',t:'12:00'},
  {id:'k81', d:'2026-07-01',t:'20:00'},{id:'k82', d:'2026-07-01',t:'16:00'},
  {id:'k83', d:'2026-07-02',t:'19:00'},{id:'k84', d:'2026-07-02',t:'15:00'},
  {id:'k85', d:'2026-07-02',t:'23:00'},{id:'k86', d:'2026-07-03',t:'18:00'},
  {id:'k87', d:'2026-07-03',t:'21:30'},{id:'k88', d:'2026-07-03',t:'14:00'},
  {id:'k89', d:'2026-07-04',t:'17:00'},{id:'k90', d:'2026-07-04',t:'13:00'},
  {id:'k91', d:'2026-07-05',t:'16:00'},{id:'k92', d:'2026-07-05',t:'20:00'},
  {id:'k93', d:'2026-07-06',t:'15:00'},{id:'k94', d:'2026-07-06',t:'20:00'},
  {id:'k95', d:'2026-07-07',t:'12:00'},{id:'k96', d:'2026-07-07',t:'16:00'},
  {id:'k97', d:'2026-07-09',t:'16:00'},{id:'k98', d:'2026-07-10',t:'15:00'},
  {id:'k99', d:'2026-07-11',t:'17:00'},{id:'k100',d:'2026-07-11',t:'21:00'},
  {id:'k101',d:'2026-07-14',t:'15:00'},{id:'k102',d:'2026-07-15',t:'15:00'},
  {id:'k103',d:'2026-07-18',t:'17:00'},{id:'k104',d:'2026-07-19',t:'15:00'},
];
const ALL_MATCHES = [...GM, ...KM];

// ══ MAPA SEQUENCIAL worldcup26.ir ══
// worldcup26.ir numera os jogos de 1 a 104 seguindo a ordem do calendário oficial.
// Essa tabela mapeia o id numérico deles para nosso id interno (g1…g72, k73…k104).
// Funciona como mapeamento primário; nomes de times atuam como fallback.
const WC_ID_TO_INTERNAL = {};
ALL_MATCHES.forEach((m, idx) => {
  WC_ID_TO_INTERNAL[String(idx + 1)] = m.id;
});

// ══ MAPA DE NOMES DE TIMES ══
const TEAM_MAP = {
  'Mexico':'MEX','South Africa':'RSA','Korea Republic':'KOR','South Korea':'KOR',
  'Czech Republic':'CZE','Czechia':'CZE',
  'Canada':'CAN','Bosnia and Herzegovina':'BIH','Bosnia & Herzegovina':'BIH','Bosnia-Herzegovina':'BIH',
  'Qatar':'QAT','Switzerland':'SUI',
  'Brazil':'BRA','Morocco':'MAR','Haiti':'HAI','Scotland':'SCO',
  'USA':'USA','United States':'USA','Paraguay':'PAR','Australia':'AUS',
  'Turkey':'TUR','Türkiye':'TUR','Turkiye':'TUR',
  'Germany':'GER','Curacao':'CUW','Curaçao':'CUW',
  "Côte d'Ivoire":'CIV',"Cote D'Ivoire":'CIV','Ivory Coast':'CIV',
  'Ecuador':'ECU',
  'Netherlands':'NED','Japan':'JPN','Sweden':'SWE','Tunisia':'TUN',
  'Belgium':'BEL','Egypt':'EGY','Iran':'IRN','IR Iran':'IRN',
  'New Zealand':'NZL',
  'Spain':'ESP','Cape Verde':'CPV','Cabo Verde':'CPV',
  'Saudi Arabia':'KSA','Uruguay':'URU',
  'France':'FRA','Senegal':'SEN','Iraq':'IRQ','Norway':'NOR',
  'Argentina':'ARG','Algeria':'ALG','Austria':'AUT','Jordan':'JOR',
  'Portugal':'POR','DR Congo':'COD','Congo DR':'COD','Congo':'COD',
  'Uzbekistan':'UZB','Colombia':'COL',
  'England':'ENG','Croatia':'CRO','Ghana':'GHA','Panama':'PAN',
};

// ══ HELPERS ══
function loadJSON(file) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) { console.error('Erro ao carregar JSON:', e.message); }
  return {};
}

function saveJSON(file, data) {
  const tmp = file + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file);
}

function findTeamCode(name) {
  if (!name) return null;
  const exact = TEAM_MAP[name];
  if (exact) return exact;
  const lower = name.toLowerCase();
  for (const [key, code] of Object.entries(TEAM_MAP)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return code;
  }
  return null;
}

// Busca ID interno por nomes de times (funciona apenas para jogos de grupo,
// onde os times são fixos no nosso calendário).
function findIdByTeams(homeEn, awayEn) {
  const h = findTeamCode(homeEn);
  const a = findTeamCode(awayEn);
  if (!h || !a) return null;
  const found = GM.find(m => m.h === h && m.a === a);
  return found ? found.id : null;
}

// Converte ET (UTC-4) date+time para timestamp UTC
function getMatchTimeUTC(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00-04:00`).getTime();
}

// ══ ESTADO ══
const state   = loadJSON(STATE_FILE);
const results = loadJSON(RESULTS_FILE);
const now     = Date.now();

// ══ JANELA DE POLLING ══
// Verificamos se há alguma partida ativa ou próxima (±30 min).
// Se não houver, não há razão para chamar a API.
const FINISHED_STATUSES = ['FT', 'AET', 'PEN'];

let hasActiveMatch = false;
let pollInterval   = 15; // minutos padrão

for (const m of ALL_MATCHES) {
  const start    = getMatchTimeUTC(m.d, m.t);
  const diffMins = (now - start) / 60000;
  const r        = results[m.id];
  const isFinished  = r && FINISHED_STATUSES.includes(r.status);
  const stuck       = r && r.status && !isFinished;

  // Caso 1: janela normal — 30 min antes até 4 horas depois do início
  if (diffMins >= -30 && diffMins <= 240) {
    hasActiveMatch = true;
    if ((diffMins >= 75 && diffMins <= 110) || diffMins >= 130) pollInterval = 10;
  }

  // Caso 2: jogo travado em status não-finalizado (ex.: LIVE após queda de API)
  if (stuck) {
    hasActiveMatch = true;
  }

  // Caso 3 — CORREÇÃO DO BUG: jogo já deveria ter acontecido mas sem resultado
  // gravado ainda (results.json vazio ou sem entrada para este jogo).
  // Garante busca retroativa até 7 dias após o início.
  if (diffMins > 0 && diffMins <= 10080 && !isFinished && !stuck) {
    hasActiveMatch = true;
  }
}

if (!hasActiveMatch) {
  console.log('Nenhuma partida pendente ou na janela ativa. Encerrando.');
  process.exit(0);
}

const lastPoll        = state.lastPoll || 0;
const minsSinceLastPoll = (now - lastPoll) / 60000;

if (minsSinceLastPoll < pollInterval) {
  console.log(`Intervalo de ${pollInterval} min não atingido (${minsSinceLastPoll.toFixed(1)} min desde o último poll). Encerrando.`);
  process.exit(0);
}

// ══ FETCH ══
console.log(`Buscando dados em worldcup26.ir...`);

const req = https.get(API_URL, { timeout: 10000 }, (res) => {
  let chunks = '';
  res.on('data', d => chunks += d);
  res.on('end', () => {
    state.lastPoll = Date.now();

    try {
      const data  = JSON.parse(chunks);
      const games = Array.isArray(data.games) ? data.games : [];

      if (games.length === 0) {
        console.warn('Resposta sem jogos. A API pode estar fora do ar.');
        saveJSON(STATE_FILE, state);
        return;
      }

      console.log(`${games.length} jogos recebidos.`);
      let updated = false;

      for (const game of games) {
        const wcId       = String(game.id);
        const finished   = game.finished === 'TRUE' || game.finished === true;
        const elapsed    = game.time_elapsed; // 'notstarted' | '45' | 'HT' | '90' | 'FT' | 'ET' | 'PEN' ...

        // Pular jogos ainda não iniciados
        if (!finished && (elapsed === 'notstarted' || elapsed === '' || elapsed == null)) continue;

        // ── Resolver ID interno ──────────────────────────────────────────────
        // 1) Mapeamento sequencial (worldcup26.ir id 1–104 → g1…k104)
        let mId = WC_ID_TO_INTERNAL[wcId];

        // 2) Fallback por nomes de times (grupo apenas)
        if (!mId && game.home_team_name_en && game.away_team_name_en) {
          mId = findIdByTeams(game.home_team_name_en, game.away_team_name_en);
        }

        if (!mId) {
          console.warn(`Jogo não mapeado — wcId:${wcId} | ${game.home_team_name_en} × ${game.away_team_name_en}`);
          continue;
        }

        if (!results[mId]) results[mId] = {};
        const r = results[mId];

        // ── Placar ────────────────────────────────────────────────────────────
        const hRaw = game.home_score;
        const aRaw = game.away_score;
        r.h = (hRaw !== null && hRaw !== 'null' && hRaw !== '') ? String(hRaw) : '';
        r.a = (aRaw !== null && aRaw !== 'null' && aRaw !== '') ? String(aRaw) : '';

        // ── Status e tempo ────────────────────────────────────────────────────
        if (finished) {
          r.status = 'FT';
          r.time   = 'FT';
        } else if (elapsed === 'HT') {
          r.status = 'HT';
          r.time   = 'HT';
        } else if (elapsed === 'ET') {
          r.status = 'ET';
          r.time   = 'ET';
        } else if (elapsed === 'PEN') {
          r.status = 'PEN';
          r.time   = 'PEN';
        } else if (!isNaN(parseInt(elapsed))) {
          r.status = 'LIVE';
          r.time   = `${parseInt(elapsed)}'`;
        } else {
          // Valor desconhecido: gravamos como está para não perder info
          r.status = String(elapsed);
          r.time   = String(elapsed);
        }

        // ── Artilheiros ────────────────────────────────────────────────────────
        // worldcup26.ir retorna strings separadas para casa e visitante.
        // Valores "null" (string) ou vazios são ignorados.
        const hScorers = (game.home_scorers && game.home_scorers !== 'null') ? game.home_scorers.trim() : '';
        const aScorers = (game.away_scorers && game.away_scorers !== 'null') ? game.away_scorers.trim() : '';
        r.scorers = [hScorers, aScorers].filter(Boolean).join(' | ');

        // ── Cartões ─────────────────────────────────────────────────────────────
        // worldcup26.ir não fornece dados de cartões no endpoint público /get/games.
        // O campo fica vazio; o HTML já trata isso com gracefulness.
        r.cards = '';

        // ── Prorrogação / Pênaltis ───────────────────────────────────────────
        // API não expõe placar parcial de prorrogação ou disputa de pênaltis.
        // Os campos r.eh, r.ea, r.ph, r.pa não são preenchidos.
        // Jogos eliminatórios definidos nos 90 min funcionam normalmente no HTML.

        updated = true;
      }

      if (updated) {
        saveJSON(RESULTS_FILE, results);
        console.log('results.json atualizado com sucesso.');
      } else {
        console.log('Nenhuma partida ativa para atualizar no momento.');
      }
      saveJSON(STATE_FILE, state);

    } catch (e) {
      console.error('Erro ao processar resposta da API:', e);
      saveJSON(STATE_FILE, state);
    }
  });
});

req.on('timeout', () => {
  console.error('Timeout na requisição à API. Encerrando.');
  req.destroy();
  saveJSON(STATE_FILE, state);
  process.exit(1);
});

req.on('error', (e) => {
  console.error('Erro de rede:', e.message);
  saveJSON(STATE_FILE, state);
  process.exit(1);
});
