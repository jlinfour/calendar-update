const ALL_SCREENS = ['title', 'eventType', 'fullDay', 'dateStart', 'dateEnd', 'timeStart', 'timeEnd', 'venue', 'confirm'];
const SCREEN_LABELS = {
  title: 'Title', eventType: 'Event Type', fullDay: 'Full Day?',
  dateStart: 'Date (Start)', dateEnd: 'Date (End)',
  timeStart: 'Time (Start)', timeEnd: 'Time (End)', venue: 'Venue',
  confirm: 'Review'
};

let eventType = 'single';
let titleCategory = null;
let isFullDay = true;
let flowIndex = 0;
const canvases = {};
let googleAccessToken = sessionStorage.getItem('googleAccessToken');

function getFlow() {
  const flow = ['title', 'eventType', 'fullDay', 'dateStart'];
  if (eventType === 'multi') flow.push('dateEnd');
  if (!isFullDay) { flow.push('timeStart', 'timeEnd'); }
  flow.push('venue', 'confirm');
  return flow;
}

function currentScreenId() {
  return getFlow()[flowIndex];
}

function screenDomIndex(screenId) {
  return ALL_SCREENS.indexOf(screenId);
}

function selectTitleCategory(cat) {
  // Tapping the selected option again clears it — the category is optional
  titleCategory = titleCategory === cat ? null : cat;
  document.querySelectorAll('#titleCategoryGroup .chip').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.category === titleCategory);
  });
}

function getEventTitle() {
  const title = document.getElementById('titleInput').value.trim();
  if (!title) return '';
  return titleCategory ? `[${titleCategory}] ${title}` : title;
}

function selectEventType(type) {
  eventType = type;
  const screen = document.querySelector('[data-screen="eventType"]');
  screen.querySelectorAll('.option').forEach(opt => {
    opt.classList.toggle('selected', opt.dataset.value === type);
  });
}

function selectFullDay(val) {
  isFullDay = val;
  document.getElementById('fullDayYes').classList.toggle('selected', val);
  document.getElementById('fullDayNo').classList.toggle('selected', !val);
}

function navigate(dir) {
  const flow = getFlow();
  const screenId = currentScreenId();

  if (dir === 1 && screenId === 'title') {
    const title = document.getElementById('titleInput').value.trim();
    if (!title) { showToast('Please enter a title'); return; }
  }

  if (dir === 1 && screenId === 'confirm') {
    submitEvent();
    return;
  }

  const next = flowIndex + dir;
  if (next < 0 || next >= flow.length) return;

  flowIndex = next;
  updateUI();
}

function updateUI() {
  const flow = getFlow();
  const screenId = currentScreenId();
  const domIdx = screenDomIndex(screenId);

  document.getElementById('screens').style.transform = `translateX(-${domIdx * 100}%)`;

  // Progress bar
  const bar = document.getElementById('progressBar');
  bar.innerHTML = '';
  for (let i = 0; i < flow.length; i++) {
    const seg = document.createElement('div');
    seg.className = 'progress-seg' + (i <= flowIndex ? ' active' : '');
    bar.appendChild(seg);
  }

  // Nav buttons
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');

  prevBtn.classList.toggle('hidden', flowIndex === 0);
  if (flowIndex > 0) {
    document.getElementById('prevLabel').textContent = SCREEN_LABELS[flow[flowIndex - 1]] || '';
  }

  const nextIcon = document.getElementById('nextIcon');
  if (screenId === 'confirm') {
    nextBtn.classList.add('submit');
    document.getElementById('nextLabel').textContent = 'Submit';
    nextIcon.textContent = 'check';
    populateConfirmScreen();
  } else {
    nextBtn.classList.remove('submit');
    document.getElementById('nextLabel').textContent = SCREEN_LABELS[flow[flowIndex + 1]] || '';
    nextIcon.textContent = 'chevron_right';
  }
}

const inputModes = { dateStart: 'type', dateEnd: 'type', timeStart: 'type', timeEnd: 'type' };

function setInputMode(field, mode) {
  inputModes[field] = mode;
  document.getElementById(`${field}Handwrite`).classList.toggle('active', mode === 'handwrite');
  document.getElementById(`${field}Type`).classList.toggle('active', mode === 'type');
  // A canvas that starts hidden was never sized — size it once it's visible
  if (mode === 'handwrite' && canvases[field]) canvases[field].resize();
  const screen = document.querySelector(`[data-screen="${field}"]`);
  screen.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
}

document.querySelectorAll('.date-input').forEach(input => {
  input.addEventListener('input', (e) => {
    if (e.inputType && e.inputType.startsWith('delete')) return;
    if (input.selectionStart !== input.value.length) return;
    let v = input.value.replace(/\/{2,}/g, '/');
    if (/^\d{2}$/.test(v) || /^\d{2}\/\d{2}$/.test(v)) v += '/';
    input.value = v;
  });
});

// Handwriting results, kept apart from the on-screen text so status messages
// ("Recognising...", errors) can never be mistaken for a date or time
const recognised = { dateStart: '', dateEnd: '', timeStart: '', timeEnd: '' };

function showRecognised(field, text, isStatus) {
  const el = document.getElementById(`${field}Value`);
  el.textContent = text;
  el.className = 'recognised-value' + (isStatus ? ' loading' : '');
}

function getFieldValue(field) {
  if (inputModes[field] === 'type') {
    return document.getElementById(`${field}TypedInput`).value.trim();
  }
  return recognised[field];
}

function initCanvas(name) {
  const container = document.getElementById(`${name}CanvasContainer`);
  if (!container) return;
  const canvas = document.getElementById(`${name}Canvas`);
  const ctx = canvas.getContext('2d');

  let drawing = false;
  let hasContent = false;

  // Resizing a canvas wipes it, so only do it when the size really changed —
  // and when it does, reset the "has a drawing" state to match
  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0) return;
    const dpr = window.devicePixelRatio;
    const width = Math.round(rect.width * dpr);
    const height = Math.round(rect.height * dpr);
    if (canvas.width === width && canvas.height === height) return;
    canvas.width = width;
    canvas.height = height;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#6ee7b7'; // --emerald-300
    hasContent = false;
    container.classList.remove('has-content');
  }

  resize();

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  }

  function start(e) {
    e.preventDefault();
    drawing = true;
    container.classList.add('drawing');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function move(e) {
    if (!drawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    if (!hasContent) {
      hasContent = true;
      container.classList.add('has-content');
    }
  }

  function end() {
    if (drawing) {
      drawing = false;
      container.classList.remove('drawing');
      ctx.closePath();
    }
  }

  canvas.addEventListener('mousedown', start);
  canvas.addEventListener('mousemove', move);
  canvas.addEventListener('mouseup', end);
  canvas.addEventListener('mouseleave', end);
  canvas.addEventListener('touchstart', start, { passive: false });
  canvas.addEventListener('touchmove', move, { passive: false });
  canvas.addEventListener('touchend', end);

  canvases[name] = { canvas, ctx, container, resize, hasContent: () => hasContent, reset: () => { hasContent = false; } };
  window.addEventListener('resize', resize);
}

function clearCanvas(name) {
  const c = canvases[name];
  if (!c) return;
  const rect = c.container.getBoundingClientRect();
  c.ctx.clearRect(0, 0, rect.width, rect.height);
  c.container.classList.remove('has-content');
  c.reset();
  recognised[name] = '';
  showRecognised(name, '', false);
}

async function recognise(name) {
  const settings = loadSettings();
  if (!settings.openrouterKey) {
    showToast('Set OpenRouter API key in settings');
    return;
  }

  const c = canvases[name];
  if (!c || !c.hasContent()) {
    showToast('Write something first');
    return;
  }

  recognised[name] = '';
  showRecognised(name, 'Recognising...', true);

  const imageData = c.canvas.toDataURL('image/png');

  const isDate = name.startsWith('date');
  const prompt = isDate
    ? 'Read the handwritten date in this image. Return ONLY the date in dd/mm/yy format. Nothing else.'
    : 'Read the handwritten time in this image. Return ONLY the time in hh:mm am/pm format (e.g. 2:30 pm). Nothing else.';

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: resolveVisionModel(settings.visionModel).value,
        messages: [{ role: 'user', content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: imageData } }
        ]}],
        max_tokens: 30,
      })
    });

    if (!res.ok) {
      showRecognised(name, res.status === 401 ? 'Error — check API key' : 'Recognition failed — try again', true);
      return;
    }

    const data = await res.json();
    const result = data.choices?.[0]?.message?.content?.trim();

    if (result) {
      recognised[name] = result;
      showRecognised(name, result, false);
    } else {
      showRecognised(name, 'Could not recognise', true);
    }
  } catch (err) {
    showRecognised(name, 'Network error — try again', true);
    console.error(err);
  }
}

function handleGoogleAuth() {
  const settings = loadSettings();
  if (!settings.googleClientId) {
    showToast('Set Google Client ID in settings first');
    return;
  }
  const redirectUri = window.location.origin + window.location.pathname;
  const scope = 'https://www.googleapis.com/auth/calendar.events';
  const state = crypto.randomUUID();
  sessionStorage.setItem('oauthState', state);
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(settings.googleClientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}&prompt=consent&state=${encodeURIComponent(state)}`;
  window.location.href = authUrl;
}

function checkAuthRedirect() {
  const hash = window.location.hash;
  if (hash.includes('access_token')) {
    const params = new URLSearchParams(hash.substring(1));
    // Remove the token-bearing URL from the address bar and history
    history.replaceState(null, '', window.location.pathname + window.location.search);

    // Reject tokens that don't match the state we generated (login CSRF)
    const expectedState = sessionStorage.getItem('oauthState');
    sessionStorage.removeItem('oauthState');
    if (!expectedState || params.get('state') !== expectedState) {
      showToast('Sign-in rejected — please reconnect from Settings');
      return;
    }

    googleAccessToken = params.get('access_token');
    sessionStorage.setItem('googleAccessToken', googleAccessToken);
    updateGoogleButton(true);
    showToast('Google Calendar connected');
  }
}

function updateGoogleButton(connected) {
  const btn = document.getElementById('googleAuthBtn');
  if (connected) {
    btn.textContent = 'Connected ✓';
    btn.classList.add('connected');
  } else {
    btn.textContent = 'Connect Google Calendar';
    btn.classList.remove('connected');
  }
}

// Returns { day, month (0-based), year }, or null if the text isn't a real
// date — so 31/02/26 is rejected rather than rolling over into March
function parseDate(str) {
  const m = str.match(/(\d{1,2})\D(\d{1,2})\D(\d{2,4})/);
  if (!m) return null;
  const day = parseInt(m[1]);
  const month = parseInt(m[2]) - 1;
  let year = parseInt(m[3]);
  if (year < 100) year += 2000;
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return null;
  return { day, month, year };
}

function parseTime(str) {
  const m = str.match(/(\d{1,2})\D(\d{2})\s*(am|pm)?/i);
  if (!m) return null;
  let hours = parseInt(m[1]);
  const minutes = parseInt(m[2]);
  const ampm = m[3]?.toLowerCase();
  if (ampm) {
    if (hours < 1 || hours > 12) return null;
    if (ampm === 'pm' && hours !== 12) hours += 12;
    if (ampm === 'am' && hours === 12) hours = 0;
  }
  if (hours > 23 || minutes > 59) return null;
  return { hours, minutes };
}

// Reads the entered dates/times and works out when the event starts and ends.
// Shared by the Review screen's conflict check and by Submit, so both always
// agree. Returns { error } if anything is missing, unreadable or out of order;
// otherwise { allDay, start, end } as local Dates. For all-day events `end` is
// the day after the last day, matching Google's exclusive end date.
function getEventWindow() {
  const read = (field, label, parse) => {
    const text = getFieldValue(field);
    if (!text) return { error: `Please enter the ${label}` };
    return parse(text) || { error: `Could not read the ${label}` };
  };

  const startDate = read('dateStart', 'start date', parseDate);
  if (startDate.error) return startDate;
  const endDate = eventType === 'multi' ? read('dateEnd', 'end date', parseDate) : startDate;
  if (endDate.error) return endDate;

  if (isFullDay) {
    const start = new Date(startDate.year, startDate.month, startDate.day);
    const end = new Date(endDate.year, endDate.month, endDate.day + 1);
    if (end <= start) return { error: 'The end date is before the start date' };
    return { allDay: true, start, end };
  }

  const startTime = read('timeStart', 'start time', parseTime);
  if (startTime.error) return startTime;
  const endTime = read('timeEnd', 'end time', parseTime);
  if (endTime.error) return endTime;

  const start = new Date(startDate.year, startDate.month, startDate.day, startTime.hours, startTime.minutes);
  const end = new Date(endDate.year, endDate.month, endDate.day, endTime.hours, endTime.minutes);
  if (end <= start) return { error: 'The end must be after the start' };
  return { allDay: false, start, end };
}

// Local date as YYYY-MM-DD (toISOString would shift it into UTC)
function toISODate(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function clearGoogleSession() {
  googleAccessToken = null;
  sessionStorage.removeItem('googleAccessToken');
  updateGoogleButton(false);
}

// Bumped on every Review render so a slow, older conflict check can't
// overwrite the result for what's currently on screen
let conflictCheckId = 0;

async function populateConfirmScreen() {
  const title = getEventTitle();
  const venue = document.getElementById('venueInput').value.trim();
  const show = (field) => getFieldValue(field) || '—';

  const rows = [
    ['Title', title || '—'],
    ['Type', eventType === 'single' ? 'Single-day' : 'Multi-day'],
    ['Date', eventType === 'multi' ? `${show('dateStart')} → ${show('dateEnd')}` : show('dateStart')],
  ];
  if (!isFullDay) rows.push(['Time', `${show('timeStart')} → ${show('timeEnd')}`]);
  if (venue) rows.push(['Venue', venue]);

  const summary = document.getElementById('confirmSummary');
  summary.innerHTML = '';
  rows.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'confirm-row';
    const labelEl = document.createElement('span');
    labelEl.className = 'confirm-row-label';
    labelEl.textContent = label;
    const valueEl = document.createElement('span');
    valueEl.className = 'confirm-row-value';
    valueEl.textContent = value;
    row.appendChild(labelEl);
    row.appendChild(valueEl);
    summary.appendChild(row);
  });

  const conflictHeader = document.getElementById('conflictHeader');
  const conflictIcon = document.getElementById('conflictIcon');
  const conflictTitle = document.getElementById('conflictTitle');
  const conflictList = document.getElementById('conflictList');
  const setStatus = (icon, text) => { conflictIcon.textContent = icon; conflictTitle.textContent = text; };

  const checkId = ++conflictCheckId;
  conflictHeader.className = 'conflict-header';
  conflictList.innerHTML = '';

  const win = getEventWindow();
  if (win.error) {
    conflictHeader.classList.add('has-conflicts');
    setStatus('error', win.error);
    return;
  }
  if (!googleAccessToken) { setStatus('info', 'Sign in to check conflicts'); return; }

  setStatus('schedule', 'Checking calendar...');

  try {
    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(win.start.toISOString())}&timeMax=${encodeURIComponent(win.end.toISOString())}&singleEvents=true&orderBy=startTime`;
    const res = await fetch(url, { headers: { 'Authorization': `Bearer ${googleAccessToken}` } });
    if (checkId !== conflictCheckId) return;

    if (!res.ok) {
      if (res.status === 401) {
        clearGoogleSession();
        setStatus('info', 'Session expired — reconnect Google');
      } else {
        setStatus('info', 'Could not check calendar');
      }
      return;
    }

    const data = await res.json();
    if (checkId !== conflictCheckId) return;
    const events = (data.items || []).filter(ev => ev.status !== 'cancelled');

    if (events.length === 0) {
      setStatus('event_available', 'No conflicts');
    } else {
      conflictHeader.classList.add('has-conflicts');
      setStatus('event_busy', `${events.length} conflict${events.length > 1 ? 's' : ''}`);
      events.forEach((ev, i) => {
        const item = document.createElement('div');
        item.className = 'list-item';
        const badge = document.createElement('span');
        badge.className = 'item-badge';
        badge.textContent = i + 1;
        item.appendChild(badge);
        const body = document.createElement('div');
        body.className = 'list-item-body';
        item.appendChild(body);
        const titleEl = document.createElement('div');
        titleEl.className = 'item-title';
        titleEl.textContent = ev.summary || '(No title)';
        body.appendChild(titleEl);
        let timeStr = '';
        if (ev.start?.dateTime) {
          const s = new Date(ev.start.dateTime);
          const e = new Date(ev.end.dateTime);
          timeStr = `${s.toLocaleDateString()} ${s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – ${e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (ev.start?.date) {
          timeStr = ev.end?.date && ev.start.date !== ev.end.date ? `${ev.start.date} → ${ev.end.date}` : ev.start.date;
        }
        if (timeStr) {
          const timeEl = document.createElement('div');
          timeEl.className = 'item-body';
          timeEl.textContent = timeStr;
          body.appendChild(timeEl);
        }
        conflictList.appendChild(item);
      });
    }
  } catch (err) {
    if (checkId !== conflictCheckId) return;
    setStatus('info', 'Could not check calendar');
    console.error(err);
  }
}

let submitting = false;

async function submitEvent() {
  if (submitting) return; // a double tap must not create the event twice
  if (!googleAccessToken) {
    showToast('Connect Google Calendar first');
    toggleSettings();
    return;
  }

  const title = getEventTitle();
  const venue = document.getElementById('venueInput').value.trim();
  if (!title) { showToast('Title is required'); return; }

  const win = getEventWindow();
  if (win.error) { showToast(win.error); return; }

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const event = win.allDay
    ? { summary: title, start: { date: toISODate(win.start) }, end: { date: toISODate(win.end) } }
    : { summary: title,
        start: { dateTime: win.start.toISOString(), timeZone: tz },
        end: { dateTime: win.end.toISOString(), timeZone: tz } };
  if (venue) event.location = venue;

  submitting = true;
  try {
    showToast('Creating event...');
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${googleAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });

    if (res.ok) {
      showToast('Event created!');
      setTimeout(resetForm, 1500);
    } else if (res.status === 401) {
      clearGoogleSession();
      showToast('Session expired — reconnect Google');
    } else {
      const err = await res.json().catch(() => ({}));
      showToast('Failed: ' + (err.error?.message || 'Unknown error'));
    }
  } catch (err) {
    showToast('Network error');
    console.error(err);
  } finally {
    submitting = false;
  }
}

function resetForm() {
  document.getElementById('titleInput').value = '';
  document.getElementById('venueInput').value = '';
  ['dateStart', 'dateEnd', 'timeStart', 'timeEnd'].forEach(f => {
    clearCanvas(f);
    const typedInput = document.getElementById(`${f}TypedInput`);
    if (typedInput) typedInput.value = '';
  });
  eventType = 'single';
  isFullDay = true;
  titleCategory = null;
  document.querySelectorAll('#titleCategoryGroup .chip').forEach(opt => opt.classList.remove('selected'));
  selectEventType('single');
  selectFullDay(true);
  flowIndex = 0;
  updateUI();
}

function loadSettings() {
  try { return JSON.parse(localStorage.getItem('calendarUpdateSettings') || '{}'); }
  catch { return {}; }
}

function saveSettings() {
  const settings = {
    openrouterKey: document.getElementById('openrouterKey').value.trim(),
    visionModel: document.getElementById('visionModel').value,
    googleClientId: document.getElementById('googleClientId').value.trim(),
  };
  localStorage.setItem('calendarUpdateSettings', JSON.stringify(settings));
  toggleSettings();
  showToast('Settings saved');
}

function populateSettings() {
  const settings = loadSettings();
  document.getElementById('openrouterKey').value = settings.openrouterKey || '';
  setVisionModel(settings.visionModel);
  document.getElementById('googleClientId').value = settings.googleClientId || '';
}

function toggleSettings() {
  const overlay = document.getElementById('settingsOverlay');
  const isOpen = overlay.classList.contains('open');
  if (!isOpen) populateSettings();
  closeModelMenu();
  overlay.classList.toggle('open');
}

// Vision model dropdown — ordered by key so each entry's position is stable.
// IDs checked against OpenRouter's model list (vision-capable) on 2026-10-01.
const VISION_MODELS = [
  { key: 'CH', label: 'Claude Haiku 4.5',  value: 'anthropic/claude-haiku-4.5' },
  { key: 'CS', label: 'Claude Sonnet 5.5', value: 'anthropic/claude-sonnet-5.5' },
  { key: 'GF', label: 'Gemini 3.8 Flash',  value: 'google/gemini-3.8-flash' },
  { key: 'GL', label: 'GPT-6 Luna',        value: 'openai/gpt-6-luna' },
];
const DEFAULT_VISION_MODEL = 'anthropic/claude-sonnet-5.5';

// A saved model that's no longer offered (e.g. a retired ID) falls back to the default
function resolveVisionModel(value) {
  return VISION_MODELS.find(m => m.value === value)
    || VISION_MODELS.find(m => m.value === DEFAULT_VISION_MODEL);
}

function setVisionModel(value) {
  const model = resolveVisionModel(value);
  document.getElementById('visionModel').value = model.value;
  document.getElementById('visionModelLabel').textContent = model.label;
}

function toggleModelMenu() {
  const menu = document.getElementById('visionModelMenu');
  if (menu.classList.contains('open')) { closeModelMenu(); return; }

  const current = document.getElementById('visionModel').value;
  menu.innerHTML = '';
  VISION_MODELS.forEach(m => {
    const selected = m.value === current;
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'select-row' + (selected ? ' selected' : '');
    row.setAttribute('role', 'option');
    row.setAttribute('aria-selected', selected);
    [['select-key', m.key], ['select-label', m.label], ['select-check', selected ? '✓' : '']].forEach(([cls, text]) => {
      const span = document.createElement('span');
      span.className = cls;
      span.textContent = text;
      row.appendChild(span);
    });
    row.onclick = () => { setVisionModel(m.value); closeModelMenu(); };
    menu.appendChild(row);
  });

  // Anchor 8px under the trigger; flip above if it would run off-screen
  menu.classList.add('open');
  const rect = document.getElementById('visionModelBtn').getBoundingClientRect();
  const h = menu.offsetHeight;
  const below = rect.bottom + 8;
  menu.style.top = (below + h > window.innerHeight - 8 ? Math.max(8, rect.top - 8 - h) : below) + 'px';
  menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8)) + 'px';
}

function closeModelMenu() {
  document.getElementById('visionModelMenu').classList.remove('open');
}

document.addEventListener('pointerdown', (e) => {
  const menu = document.getElementById('visionModelMenu');
  if (!menu.classList.contains('open')) return;
  if (menu.contains(e.target) || document.getElementById('visionModelBtn').contains(e.target)) return;
  closeModelMenu();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModelMenu(); });
window.addEventListener('resize', closeModelMenu);
document.querySelector('.settings-panel').addEventListener('scroll', closeModelMenu);

// All buttons are wired here via data-action (no inline onclick), which lets
// the Content-Security-Policy forbid inline script entirely
const ACTIONS = {
  'toggle-settings': () => toggleSettings(),
  'save-settings':   () => saveSettings(),
  'google-auth':     () => handleGoogleAuth(),
  'model-menu':      () => toggleModelMenu(),
  'nav':             (el) => navigate(Number(el.dataset.dir)),
  'category':        (el) => selectTitleCategory(el.dataset.category),
  'event-type':      (el) => selectEventType(el.dataset.value),
  'full-day':        (el) => selectFullDay(el.dataset.value === 'true'),
  'input-mode':      (el) => setInputMode(el.dataset.field, el.dataset.mode),
  'clear-canvas':    (el) => clearCanvas(el.dataset.field),
  'recognise':       (el) => recognise(el.dataset.field),
};

document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-action]');
  if (el && ACTIONS[el.dataset.action]) ACTIONS[el.dataset.action](el);
});

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

let touchStartX = 0, touchStartY = 0;
document.querySelector('.screens-wrapper').addEventListener('touchstart', (e) => {
  if (e.target.tagName === 'CANVAS') return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
});
document.querySelector('.screens-wrapper').addEventListener('touchend', (e) => {
  if (e.target.tagName === 'CANVAS') return;
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    navigate(dx < 0 ? 1 : -1);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  ['dateStart', 'dateEnd', 'timeStart', 'timeEnd'].forEach(initCanvas);
  updateUI();
  checkAuthRedirect();
  if (googleAccessToken) updateGoogleButton(true);
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
});
