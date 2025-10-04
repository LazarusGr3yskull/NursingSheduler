/*******************************************************
 * Pflege-Kopilot – Monats-App (ohne AVAIL)
 * Menü:
 *  - NURSES-Sheet erstellen
 *  - Vorlagen Nächster Monat (SHIFT_DEMAND)
 *  - Zufalls-Bedarf Nächster Monat (Generator)
 *  - Dienstplan Nächster Monat (ohne AVAIL)
 *******************************************************/
const TZ = 'Europe/Berlin';
const DEFAULT_MIN_REST_HOURS = 12;
const DEFAULT_MAX_CONSEC_DAYS = 7;

/* === Schicht-Zeiten === */
const SHIFT_TIMES = {
  'Früh':  { start: '06:00', end: '14:00' },
  'Spät':  { start: '14:00', end: '22:00' },
  'Nacht': { start: '22:00', end: '08:00+1' }
};
const SHIFT_LENGTHS = { 'Früh':8, 'Spät':8, 'Nacht':10 };
const SHIFT_ORDER   = ['Früh','Spät','Nacht'];

/* === Sheet-Namen / Header === */
const SHEET_NURSES = 'NURSES';
const NURSES_HEADERS = [
  'email','nurse_id','name','role','unit','qualifications',
  'desired_weekly_hours','max_weekly_hours',
  'min_rest_hours','max_night_shifts_week','max_consecutive_days',
  'preferred_shift_types','preferred_units',
  'office_from','saturday_off','only_fd','max_sd_per_month',
  'cert_BLS_until','cert_ACLS_until','active','timestamp'
];

const ROTA_INPUT_PREFIX   = 'SHIFT_DEMAND_KW_';
const ROTA_OUTPUT_PREFIX  = 'ROTA_KW_';
const ROTA_REPORT_PREFIX  = 'ROTA_REPORT_KW_';

/* === App-Menü & Sidebar === */
/* === App-Menü & Sidebar === */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Pflege-Kopilot')
    .addItem('Sidebar anzeigen', 'showSidebar')
    .addSeparator()
    .addItem('NURSES-Sheet erstellen', 'ui_createNursesSheet')
    .addItem('Vorlagen Nächster Monat (SHIFT_DEMAND)', 'ui_prepareNextMonthDemandOnly')
    .addItem('Zufalls-Bedarf Nächster Monat', 'ui_generateRandomDemandNextMonth')
    .addItem('Dienstplan Nächster Monat (ohne AVAIL)', 'ui_generateNextMonthRoster')
    .addToUi();
}

function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Pflege-Kopilot');
  SpreadsheetApp.getUi().showSidebar(html);
}

/* === Button: NURSES-Sheet erstellen === */
function ui_createNursesSheet() {
  const ss = SpreadsheetApp.getActive();
  ensureSheet_(ss, SHEET_NURSES, NURSES_HEADERS).setTabColor('#6A0DAD');
  SpreadsheetApp.getActive().toast('NURSES-Sheet bereit.', 'Pflege-Kopilot', 5);
}

/* === Button: Vorlagen Nächster Monat (nur SHIFT_DEMAND) === */
function ui_prepareNextMonthDemandOnly() {
  const meta = _nextMonth_();
  const mondays = _mondaysCoveringMonth_(meta.year, meta.month);
  mondays.forEach(m => {
    const kw = isoWeek_(m.monday);
    const weekId = kw.year + pad2_(kw.week);
    createDemandTemplate_(ROTA_INPUT_PREFIX + weekId, m.monday);
  });
  SpreadsheetApp.getActive().toast('SHIFT_DEMAND-Vorlagen für nächsten Monat angelegt.', 'Pflege-Kopilot', 7);
}

/* === Button: Zufalls-Bedarf Nächster Monat (Stress-Tester) === */
function ui_generateRandomDemandNextMonth() {
  const meta = _nextMonth_();
  const mondays = _mondaysCoveringMonth_(meta.year, meta.month);
  mondays.forEach(m => {
    const kw = isoWeek_(m.monday);
    const weekId = kw.year + pad2_(kw.week);
    createRandomDemandTemplate_(ROTA_INPUT_PREFIX + weekId, m.monday);
  });
  SpreadsheetApp.getActive().toast('Zufalls-Bedarf für nächsten Monat generiert.', 'Pflege-Kopilot', 7);
}

/* === Button: Dienstplan Nächster Monat (ohne AVAIL) === */
function ui_generateNextMonthRoster() {
  const meta = _nextMonth_();
  const mondays = _mondaysCoveringMonth_(meta.year, meta.month);
  let assigned = 0, open = 0;
  mondays.forEach(m => {
    const kw = isoWeek_(m.monday);
    const r = generateForWeek_(kw.year, kw.week); // nutzt NURSES + SHIFT_DEMAND
    assigned += r.assigned;
    open     += r.open;
  });
  SpreadsheetApp.getActive().toast(`Dienstplan erstellt: ${assigned} Zuweisungen, ${open} offene Slots.`, 'Pflege-Kopilot', 7);

}

/* === SHIFT_DEMAND – Standard-Template (Eldebna-Defaults) === */
function createDemandTemplate_(name, mondayDate) {
  const ss = SpreadsheetApp.getActive();
  const H = ['date','shift','start_time','end_time','needed','required_skill','preferred_skills','unit_name','priority','break_minutes','notes'];
  const sh = ensureSheet_(ss, name, H);
  sh.clearContents();
  sh.getRange(1,1,1,H.length).setValues([H]);
  sh.setFrozenRows(1);
  styleHeader_(sh);

  const rows = [];
  const days = _weekDates_(mondayDate);
  days.forEach(d => {
    const iso = Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
    const weekday = d.getDay(); // 0=So,6=Sa
    const isWE = (weekday===0 || weekday===6);

    // Basis-Block: PFK & PHK Touren
    const pfkFD = isWE ? 1 : 2;
    push_(rows, iso, 'Früh', '06:00','14:00', pfkFD, 'PFK','', 'Tour','normal',30,'');
    const phkFD = isWE ? 2 : 3, phkSD = 2;
    push_(rows, iso, 'Früh', '06:00','14:00', phkFD, 'PHK','', 'Tour','normal',30,'');
    push_(rows, iso, 'Spät', '14:00','22:00', phkSD, 'PHK','', 'Tour','normal',30,'');

    // HW Mo–Fr
    if (!isWE) push_(rows, iso, 'Früh','06:00','14:00', 2, 'HW','', 'Haushalt','normal',30,'');

    // Büro Mo–Fr (PDL, stPDL, BrüK)
    if (!isWE) {
      push_(rows, iso, 'Früh','08:00','16:00', 1, 'PDL','',  'Office','normal',30,'Büro PDL');
      push_(rows, iso, 'Früh','08:00','16:00', 1, 'stPDL','', 'Office','normal',30,'Büro stv. PDL');
      push_(rows, iso, 'Früh','08:00','16:00', 2, 'BrüK','',  'Office','normal',30,'Bürokräfte');
    }
  });
  if (rows.length) sh.getRange(2,1,rows.length,H.length).setValues(rows);

  function push_(a, date, shift, start, end, needed, reqSkill, prefSkills, unit, prio, brk, notes){
    a.push([date, shift, start, end, needed, reqSkill, prefSkills, unit, prio, brk, notes]);
  }
}

/* === SHIFT_DEMAND – Zufalls-Template (Konstellationen testen) === */
function createRandomDemandTemplate_(name, mondayDate) {
  const ss = SpreadsheetApp.getActive();
  const H = ['date','shift','start_time','end_time','needed','required_skill','preferred_skills','unit_name','priority','break_minutes','notes'];
  const sh = ensureSheet_(ss, name, H);
  sh.clearContents();
  sh.getRange(1,1,1,H.length).setValues([H]);
  sh.setFrozenRows(1);
  styleHeader_(sh);

  const rows = [];
  const days = _weekDates_(mondayDate);
  days.forEach(d => {
    const iso = Utilities.formatDate(d, TZ, 'yyyy-MM-dd');
    const weekday = d.getDay();
    const isWE = (weekday===0 || weekday===6);

    // Helper
    const rint = (a,b)=>Math.floor(Math.random()*(b-a+1))+a;
    const pick = (arr)=>arr[Math.floor(Math.random()*arr.length)];

    // Touren PFK/PHK
    const pfkFD = isWE ? rint(0,2) : rint(1,3);
    const phkFD = isWE ? rint(1,3) : rint(2,4);
    const phkSD = isWE ? rint(0,2) : rint(1,3);

    if (pfkFD>0) rows.push([iso,'Früh','06:00','14:00', pfkFD, 'PFK','', 'Tour', pick(['normal','high']),30,'']);
    if (phkFD>0) rows.push([iso,'Früh','06:00','14:00', phkFD, 'PHK','', 'Tour', pick(['normal','high']),30,'']);
    if (phkSD>0) rows.push([iso,'Spät','14:00','22:00', phkSD, 'PHK','', 'Tour', pick(['normal','high']),30,'']);

    // Optional Nacht an 2–3 Tagen/Woche
    if (rint(1,7) <= 3) rows.push([iso,'Nacht','22:00','08:00+1', rint(0,1), 'PFK','', 'Tour', 'normal',60,'']);

    // HW Mo–Fr
    if (!isWE) rows.push([iso,'Früh','06:00','14:00', rint(1,2), 'HW','', 'Haushalt','normal',30,'']);

    // Office Mo–Fr – variable BrüK
    if (!isWE) {
      rows.push([iso,'Früh','08:00','16:00', 1, 'PDL','',  'Office','normal',30,'Büro PDL']);
      rows.push([iso,'Früh','08:00','16:00', 1, 'stPDL','', 'Office','normal',30,'Büro stv. PDL']);
      rows.push([iso,'Früh','08:00','16:00', rint(1,2), 'BrüK','',  'Office','normal',30,'Bürokräfte']);
    }
  });

  if (rows.length) sh.getRange(2,1,rows.length,H.length).setValues(rows);
}

/* === Generator: eine Woche planen (ohne AVAIL) === */
function generateForWeek_(year, week) {
  const ss = SpreadsheetApp.getActive();
  const weekId = year + pad2_(week);

  const demandSh = ss.getSheetByName(ROTA_INPUT_PREFIX + weekId);
  if (!demandSh) throw new Error('Bedarfstab fehlt: ' + ROTA_INPUT_PREFIX + weekId);

  const outSh = ensureSheet_(ss, ROTA_OUTPUT_PREFIX + weekId,
    ['date','shift','slot','nurse_email','nurse_name','skills_ok','pref_match','hours','comment']);
  outSh.clearContents();
  outSh.getRange(1,1,1,9).setValues([['date','shift','slot','nurse_email','nurse_name','skills_ok','pref_match','hours','comment']]);
  outSh.setFrozenRows(1); styleHeader_(outSh);

  const repSh = ensureSheet_(ss, ROTA_REPORT_PREFIX + weekId,
    ['date','shift','slot','required_skill','unit','reason']);
  repSh.clearContents();
  repSh.getRange(1,1,1,6).setValues([['date','shift','slot','required_skill','unit','reason']]);
  repSh.setFrozenRows(1); styleHeader_(repSh);

  // NURSES einlesen
  const nursesSh = ensureSheet_(ss, SHEET_NURSES, NURSES_HEADERS);
  const N = _readTable_(nursesSh);
  const nurseByEmail = {};
  const allEmails = [];
  N.forEach(r => {
    const email = String(r.email||'').toLowerCase().trim(); if (!email) return;
    const prof = {
      name: r.name || '',
      role: (r.role||'').toString().trim(),
      unit: (r.unit||'').toString().trim(),
      skills: String(r.qualifications||'').split(',').map(s=>s.trim()).filter(Boolean),
      desired: _num(r.desired_weekly_hours),
      max    : _num(r.max_weekly_hours),
      minRest: _num(r.min_rest_hours) || DEFAULT_MIN_REST_HOURS,
      maxNight: _num(r.max_night_shifts_week) || 999,
      maxConsec:_num(r.max_consecutive_days) || DEFAULT_MAX_CONSEC_DAYS,
      prefShiftTypes: String(r.preferred_shift_types||'').split(',').map(s=>s.trim()).filter(Boolean),
      preferredUnits: String(r.preferred_units||'').split(',').map(s=>s.trim()).filter(Boolean),
      officeFrom: _asHHMM_(r.office_from),
      saturdayOff: toBool_(r.saturday_off),
      onlyFD: toBool_(r.only_fd),
      maxSDMonth: _num(r.max_sd_per_month),
      cert_BLS_until: r.cert_bls_until,
      cert_ACLS_until: r.cert_acls_until,
      active: String(r.active||'').toUpperCase()!=='FALSE'
    };
    nurseByEmail[email] = prof;
    if (prof.active) allEmails.push(email);
  });

  // Bedarf einlesen
  let D = _readTable_(demandSh)
    .filter(r => _num(r.needed)>0)
    .map(r => ({
      date   : _toISO_(r.date),
      shift  : String(r.shift||'').trim(),
      start  : String(r.start_time||'').trim(),
      end    : String(r.end_time||'').trim(),
      needed : _num(r.needed),
      req    : String(r.required_skill||'').split(',').map(s=>s.trim()).filter(Boolean),
      pref   : String(r.preferred_skills||'').split(',').map(s=>s.trim()).filter(Boolean),
      unit   : String(r.unit_name||'').trim(),
      prio   : String(r.priority||'normal').toLowerCase(),
      breakM : _num(r.break_minutes)||0,
      notes  : r.notes||''
    }));

  // Sortierung: Datum, dann Früh/Spät/Nacht
  D.sort((a,b) => (a.date===b.date) ? (SHIFT_ORDER.indexOf(a.shift)-SHIFT_ORDER.indexOf(b.shift)) : (a.date<b.date?-1:1));

  // Zustände
  const assignedHours = {};
  const assignedByDay = {};
  const lastShiftByEmail = {};
  const nightCount = {};
  const workDays = {};
  const lateCount = {};

  const outRows = [], repRows = [];

  D.forEach(req => {
    const startDT = req.start ? _parseDateTime_(req.date, req.start) : null;
    const endDT   = req.end   ? _parseDateTime_(req.date, req.end)   : null;
    const defaultHours = (startDT && endDT)
      ? Math.max(0, _hoursBetween_(startDT,endDT) - req.breakM/60)
      : (SHIFT_LENGTHS[req.shift]||8);

    for (let slot=1; slot<=req.needed; slot++){
      // Kandidaten = alle aktiven
      const f0 = allEmails.slice();

      // Filter 1: Unit/Office-Fenster + Schichtkompatibilität (ohne AVAIL)
      const f1 = f0.filter(email => {
        const p = nurseByEmail[email] || {};
        if (!p.active) return false;

        // Office-Fenster für PDL/stPDL/BrüK (oder Unit Office)
        if (String(req.unit||'').toLowerCase()==='office') {
          if (p.officeFrom && req.start) {
            if (!_coversWindow_(p.officeFrom, '23:59', req.start, req.end||req.start)) return false;
          }
        }
        // Samstags-Frei / Nur Früh
        const weekday = (new Date(req.date+'T12:00:00')).getDay(); // 0=So,6=Sa
        if (p.saturdayOff && weekday===6) return false;
        if (p.onlyFD && req.shift!=='Früh') return false;

        return true;
      });

      // Filter 2: Rolle/Skills/Zertifikate
      const f2 = f1.filter(email => {
        const p = nurseByEmail[email] || {};
        if (!req.req.length) return true;
        return req.req.every(tag => {
          const t = String(tag).toLowerCase();
          if (['pfk','phk','pdl','stpdl','brük','hw'].includes(t)) {
            return String(p.role||'').toLowerCase() === t;
          }
          if (t==='bls' || t==='acls') return _certValid_(p, t.toUpperCase(), req.date);
          return (p.skills||[]).map(s=>s.toLowerCase()).includes(t);
        });
      });

      // Filter 3: harte Regeln (Stunden, 1 Schicht/Tag, Ruhezeit, Nachtlimit, Consecutive, PDL nur Office)
      const f3 = f2.filter(email => {
        const p = nurseByEmail[email] || {};
        const add = defaultHours;
        const cur = assignedHours[email] || 0;
        const max = isFinite(p.max) ? p.max : Infinity;
        if (cur + add > max) return false;

        // 1 Schicht pro Tag
        if (assignedByDay[req.date] && assignedByDay[req.date][email]) return false;

        // Ruhezeit
        const last = lastShiftByEmail[email];
        if (last && startDT) {
          const lastEnd = last.endDT || (SHIFT_TIMES[last.shift] ? _parseDateTime_(last.date, SHIFT_TIMES[last.shift].end) : null);
          const restH = lastEnd ? _hoursBetween_(lastEnd, startDT) : DEFAULT_MIN_REST_HOURS;
          if (restH < (p.minRest||DEFAULT_MIN_REST_HOURS)) return false;
        }
        // Früh nach Nacht (Folgetag) vermeiden
        if (last && last.shift==='Nacht' && req.shift==='Früh' && _isNextDay_(last.date, req.date)) return false;

        // Nachtlimit
        const nc = nightCount[email] || 0;
        if (req.shift==='Nacht' && nc >= (p.maxNight||999)) return false;

        // Consecutive
        const wd = workDays[email] || {};
        const consIf = _consecutiveIfAdded_(wd, req.date);
        if (consIf > (p.maxConsec||DEFAULT_MAX_CONSEC_DAYS)) return false;

        // PDL/stPDL nur Office (ohne "emergency")
        if (['pdl','stpdl'].includes(String(p.role||'').toLowerCase())) {
          if (String(req.unit||'').toLowerCase()!=='office' && String(req.notes||'').toLowerCase().indexOf('emergency')===-1) return false;
          if (p.officeFrom && req.start) {
            if (!_coversWindow_(p.officeFrom, '23:59', req.start, req.end||req.start)) return false;
          }
        }

        // PHK4-ähnlich: max Spät ~1/Woche, falls maxSDMonth gesetzt
        if (p.maxSDMonth && req.shift==='Spät') {
          const lc = lateCount[email] || 0;
          if (lc >= 1) return false;
        }
        return true;
      });

      if (!f3.length) {
        const reason = !f1.length ? 'Unit/Office/Flags passen nicht'
                     : !f2.length ? 'Rolle/Skill/Zertifikat fehlt'
                     :              'Regeln (Stunden/Ruhe/Nacht/Consecutive/PDL)';
        repRows.push([req.date, req.shift, slot, (req.req||[]).join(','), req.unit||'', reason]);
        continue;
      }

      // Scoring: Wunschstunden auffüllen, Präferenzen, gleiche Unit, Ausgleich
      const scored = f3.map(email => {
        const p = nurseByEmail[email]||{};
        const curH = assignedHours[email]||0;
        let score = 0;
        if (isFinite(p.desired) && curH < p.desired) score -= 2.0;
        if ((p.prefShiftTypes||[]).includes(req.shift)) score -= 1.0;
        if (req.unit && p.unit && String(req.unit).toLowerCase()===String(p.unit).toLowerCase()) score -= 0.3;
        score += (curH/10);
        return { email, score, hours:defaultHours, prefMatch:(p.prefShiftTypes||[]).includes(req.shift) };
      }).sort((a,b)=>a.score-b.score);

      const pick = scored[0];
      const p = nurseByEmail[pick.email]||{};
      const name = p.name || pick.email;

      // Commit
      assignedHours[pick.email] = (assignedHours[pick.email]||0) + pick.hours;
      (assignedByDay[req.date]||(assignedByDay[req.date]={}))[pick.email] = true;
      (workDays[pick.email]||(workDays[pick.email]={}))[req.date] = true;
      if (req.shift==='Nacht') nightCount[pick.email] = (nightCount[pick.email]||0) + 1;
      if (req.shift==='Spät')  lateCount[pick.email]  = (lateCount[pick.email]||0) + 1;

      const endDT2 = req.end ? _parseDateTime_(req.date, req.end) : null;
      lastShiftByEmail[pick.email] = { date:req.date, shift:req.shift, endDT:endDT2 };

      outRows.push([req.date, req.shift, slot, pick.email, name, req.req.length?'TRUE':'n/a', pick.prefMatch?'TRUE':'FALSE', pick.hours, req.notes||'']);
    }
  });

  if (outRows.length) outSh.getRange(2,1,outRows.length,outSh.getLastColumn()).setValues(outRows);
  if (repRows.length) repSh.getRange(2,1,repRows.length,repSh.getLastColumn()).setValues(repRows);
  repSh.appendRow(['','','','','','Hinweis: Prüfen, ob mind. 1 Person im Urlaub ist.']);

  styleRotaOutput_(outSh);
  return { assigned: Math.max(0,outRows.length), open: Math.max(0,repRows.length) };
}

/* =================== Helfer =================== */
function ensureSheet_(ss, name, headers){
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.setTabColor('#6A0DAD');
  }
  if (headers && headers.length) {
    const hasHeader = sh.getLastRow()>=1 && sh.getLastColumn()>=headers.length;
    if (!hasHeader) {
      sh.clear();
      sh.getRange(1,1,1,headers.length).setValues([headers]);
      sh.setFrozenRows(1);
    }
    styleHeader_(sh);
  }
  return sh;
}
function styleHeader_(sh){
  const lc = Math.max(1, sh.getLastColumn());
  sh.getRange(1,1,1,lc)
    .setBackground('#6A0DAD')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold');
  applyStripeFormatting_(sh);
}
function applyStripeFormatting_(sh) {
  const lastRow = Math.max(2, sh.getMaxRows());
  const lastCol = Math.max(1, sh.getLastColumn());
  const bodyRange = sh.getRange(2,1,lastRow-1,lastCol);
  const rules = sh.getConditionalFormatRules() || [];
  const filtered = rules.filter(r => { try {
      const bg = r.getBackground && r.getBackground();
      return bg !== '#F3EAFC';
    } catch(_){ return true; }});
  const stripeRule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=ISEVEN(ROW())')
    .setBackground('#F3EAFC')
    .setRanges([bodyRange])
    .build();
  filtered.push(stripeRule);
  sh.setConditionalFormatRules(filtered);
}
function styleRotaOutput_(sh){ try { sh.autoResizeColumns(1, sh.getLastColumn()); } catch(_){} }

function _readTable_(sh) {
  const lastRow = sh.getLastRow(), lastCol = sh.getLastColumn();
  if (lastRow < 2) return [];
  const H = sh.getRange(1,1,1,lastCol).getValues()[0].map(h => String(h||'').trim());
  const V = sh.getRange(2,1,lastRow-1,lastCol).getValues();
  return V.map(r => {
    const o = {};
    H.forEach((h,i) => { o[_normalizeHeaderKey_(h)] = r[i]; });
    return o;
  });
}
function _normalizeHeaderKey_(s){ return String(s||'').toLowerCase().replace(/\s+/g,'_').replace(/[^\w]/g,'').trim(); }
function _num(x){ const n = (typeof x==='number') ? x : parseFloat(String(x).replace(',','.').replace(/[^\d.\-]/g,'')); return isFinite(n)?n:0; }
function _toISO_(x){
  if (x instanceof Date && !isNaN(x)) return Utilities.formatDate(x, TZ, 'yyyy-MM-dd');
  const s = String(x||'').trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return s;
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return (m[3] + '-' + ('0'+m[2]).slice(-2) + '-' + ('0'+m[1]).slice(-2));
  return '';
}
function _parseDateTime_(dateISO, hhmm){
  if (!dateISO || !hhmm) return null;
  const plusDay = /\+1$/.test(hhmm);
  const parts = hhmm.replace('+1','').split(':');
  const d = new Date(dateISO + 'T' + ('0'+parts[0]).slice(-2) + ':' + ('0'+parts[1]).slice(-2) + ':00');
  if (plusDay) d.setDate(d.getDate()+1);
  return d;
}
function _hoursBetween_(a,b){ return (b - a)/36e5; }
function _isNextDay_(d1,d2){ const a=new Date(d1+'T12:00:00'), b=new Date(d2+'T12:00:00'); return Math.round((b-a)/86400000)===1; }
function _consecutiveIfAdded_(workDaysMap, dateISO){
  function shiftISO(di,days){ const d=new Date(di+'T12:00:00'); d.setDate(d.getDate()+days); return Utilities.formatDate(d,TZ,'yyyy-MM-dd'); }
  let left=0,right=0,d; d=shiftISO(dateISO,-1); while(workDaysMap&&workDaysMap[d]){left++; d=shiftISO(d,-1);}
  d=shiftISO(dateISO,+1); while(workDaysMap&&workDaysMap[d]){right++; d=shiftISO(d,+1);}
  return 1+left+right;
}
function _coversWindow_(fromHHMM, toHHMM, startHHMM, endHHMM){
  if (!fromHHMM || !toHHMM) return true;
  function mins(v){ const p=v.replace('+1','').split(':'), add=/\+1$/.test(v)?1440:0; return add + (+p[0])*60 + (+p[1]); }
  const a=mins(fromHHMM), b=mins(toHHMM), s=mins(startHHMM), e=mins(endHHMM||startHHMM);
  return a<=s && e<=b;
}
function toBool_(v){ const s=String(v||'').trim().toLowerCase(); return s==='true'||s==='wahr'||s==='ja'||s==='1'||s==='y'||s==='yes'; }
function _asHHMM_(v){
  if (v==null||v==='') return '';
  if (v instanceof Date && !isNaN(v)) return ('0'+v.getHours()).slice(-2)+':'+('0'+v.getMinutes()).slice(-2);
  const s=String(v).trim(); let m=s.match(/^(\d{1,2}):(\d{1,2})(?:\s*(?:\+1)?)?$/); if (m) return ('0'+(+m[1])).slice(-2)+':'+('0'+(+m[2])).slice(-2);
  const n=Number(s.replace(',', '.')); if (!isNaN(n)){ const h=Math.floor(n), mm=Math.round((n-h)*60); return ('0'+h).slice(-2)+':'+('0'+mm).slice(-2); }
  return s;
}
function _certValid_(prof, skill, dateISO){
  const col = (skill==='ACLS') ? 'cert_ACLS_until' : (skill==='BLS') ? 'cert_BLS_until' : null;
  if (!col) return true;
  const until = prof[col]; if (!until) return false;
  const d = toDateOrNull_(until), day = new Date(dateISO+'T12:00:00');
  return d && d>=day;
}
function toDateOrNull_(x){
  if (!x) return null; if (x instanceof Date && !isNaN(x)) return x;
  const s=String(x).trim(); let m=s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/); if (m) return new Date(+m[3], +m[2]-1, +m[1]);
  m=s.match(/^(\d{4})-(\d{2})-(\d{2})$/); if (m) return new Date(+m[1], +m[2]-1, +m[3]);
  const d=new Date(s); return isNaN(d)?null:d;
}

/* === Wochen/Monat Helfer === */
function isoWeek_(date){
  const d=new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate()+4-(d.getUTCDay()||7));
  const yearStart=new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const week=Math.ceil((((d-yearStart)/86400000)+1)/7);
  return { week, year:d.getUTCFullYear() };
}
function pad2_(n){ return (n<10?'0':'')+n; }
function _weekDates_(monday){
  const arr=[]; for (let i=0;i<7;i++){ const x=new Date(monday); x.setDate(monday.getDate()+i); x.setHours(12,0,0,0); arr.push(x); } return arr;
}
function _nextMonth_(){
  const now=new Date(); const y=now.getFullYear(), m=now.getMonth(); const nm=(m+1)%12, ny=y+(m===11?1:0);
  return { year:ny, month:nm }; // month: 0..11
}
function _mondaysCoveringMonth_(year, month0){
  const first=new Date(year, month0, 1); first.setHours(12,0,0,0);
  const last =new Date(year, month0+1, 0); last.setHours(12,0,0,0);
  const tmp=new Date(first); const day=(tmp.getDay()+6)%7; tmp.setDate(tmp.getDate()-day);
  const mondays=[]; while (tmp<=last || (tmp<new Date(year, month0+1, 1))){ mondays.push({ monday:new Date(tmp) }); tmp.setDate(tmp.getDate()+7); }
  return mondays;
}
