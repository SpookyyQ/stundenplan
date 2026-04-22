'use strict';

// ── Auth ──
async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const PRESET_HASH      = 'f23438f7ff64fde18744272250bbf1957d65f351c3105649520187f31fc1718d';
const PRESET_FIRSTNAME = 'Jason';
const PRESET_LASTNAME  = 'Bedranowsky';

const SEMESTER_END = '2026-07-17';

const PRESET_COURSES = [
  { id: 'c_kommunikation',   name: 'Kommunikation',   teacher: 'Frau Seeliger', room: 'A1 06', color: '#6adfff' },
  { id: 'c_servicelearning', name: 'Service Learning', teacher: 'Herr Schug',   room: '',      color: '#ffb86a' }
];

const PRESET_LESSONS = [
  { id: 'l_komm_tue',  courseId: 'c_kommunikation',   day: 1, start: '08:15', end: '09:45', room: '' },
  { id: 'l_sl_1', courseId: 'c_servicelearning', day: 0, start: '08:15', end: '09:45', room: 'E-2-02', date: '2026-04-27' },
  { id: 'l_sl_2', courseId: 'c_servicelearning', day: 0, start: '11:45', end: '14:00', room: 'B-E-07',  date: '2026-05-11' },
  { id: 'l_sl_3', courseId: 'c_servicelearning', day: 0, start: '13:15', end: '14:15', room: 'Digital', date: '2026-06-08' },
  { id: 'l_sl_4', courseId: 'c_servicelearning', day: 0, start: '10:00', end: '13:15', room: 'B-E-07',  date: '2026-07-13' }
];

function seedDefaults() {
  if (!localStorage.getItem('sp_pw_hash')) {
    localStorage.setItem('sp_pw_hash',   PRESET_HASH);
  }
  if (!localStorage.getItem('sp_firstName')) {
    localStorage.setItem('sp_firstName', PRESET_FIRSTNAME);
  }
  if (!localStorage.getItem('sp_lastName')) {
    localStorage.setItem('sp_lastName',  PRESET_LASTNAME);
  }
  if (!localStorage.getItem('sp_semester_end')) {
    localStorage.setItem('sp_semester_end', SEMESTER_END);
  }
  // Seed courses if none exist
  const existingCourses = JSON.parse(localStorage.getItem('sp_courses') || '[]');
  PRESET_COURSES.forEach(pc => {
    if (!existingCourses.find(c => c.id === pc.id)) {
      existingCourses.push(pc);
    }
  });
  localStorage.setItem('sp_courses', JSON.stringify(existingCourses));

  // Seed lessons if none exist
  const existingLessons = JSON.parse(localStorage.getItem('sp_lessons') || '[]');
  PRESET_LESSONS.forEach(pl => {
    if (!existingLessons.find(l => l.id === pl.id)) {
      existingLessons.push(pl);
    }
  });
  localStorage.setItem('sp_lessons', JSON.stringify(existingLessons));
}

async function initAuth() {
  seedDefaults();
  const loginScreen = document.getElementById('loginScreen');
  const appRoot     = document.getElementById('appRoot');
  const loginForm   = document.getElementById('loginForm');
  const loginSub    = document.getElementById('loginSub');
  const loginLabel  = document.getElementById('loginLabel');
  const loginBtn    = document.getElementById('loginBtn');
  const loginError  = document.getElementById('loginError');
  const confirmGroup = document.getElementById('confirmGroup');
  const loginConfirm = document.getElementById('loginConfirm');

  const storedHash = localStorage.getItem('sp_pw_hash');
  const isSetup = false; // password is pre-configured

  if (sessionStorage.getItem('sp_authed') === '1') {
    loginScreen.style.display = 'none';
    appRoot.style.display = 'flex';
    return;
  }

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    loginError.classList.add('hidden');
    const pw = document.getElementById('loginPassword').value;

    if (isSetup) {
      const pw2 = loginConfirm.value;
      if (pw !== pw2) {
        loginError.textContent = 'Die Eingaben stimmen nicht überein.';
        loginError.classList.remove('hidden');
        return;
      }
      if (pw.length < 4) {
        loginError.textContent = 'Mindestens 4 Zeichen erforderlich.';
        loginError.classList.remove('hidden');
        return;
      }
      localStorage.setItem('sp_pw_hash', await sha256(pw));
      sessionStorage.setItem('sp_authed', '1');
      loginScreen.style.display = 'none';
      appRoot.style.display = 'flex';
      initApp();
    } else {
      const hash = await sha256(pw);
      if (hash === storedHash) {
        sessionStorage.setItem('sp_authed', '1');
        loginScreen.style.display = 'none';
        appRoot.style.display = 'flex';
        initApp();
      } else {
        loginError.textContent = 'Falsche Matrikelnummer.';
        loginError.classList.remove('hidden');
        document.getElementById('loginPassword').value = '';
      }
    }
  });
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('sp_authed');
  location.reload();
});

// ── Constants ──
const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 07:00–20:00
const HOUR_HEIGHT = 72; // px, must match CSS --hour-height
const DAY_START = 7;    // 07:00

const COLORS = [
  '#7c6aff', '#ff6a9e', '#6adfff', '#6aff9e', '#ffb86a',
  '#ff6a6a', '#c46aff', '#6a9eff', '#ffea6a', '#ff9e6a'
];

// ── State ── (loaded after seedDefaults runs)
let courses  = [];
let lessons  = [];
let weekOffset = 0;

function loadState() {
  courses = JSON.parse(localStorage.getItem('sp_courses') || '[]');
  lessons = JSON.parse(localStorage.getItem('sp_lessons') || '[]');
}

// ── Greeting ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function updateGreeting() {
  const firstName = localStorage.getItem('sp_firstName') || '';
  const lastName  = localStorage.getItem('sp_lastName')  || '';
  const name = [firstName, lastName].filter(Boolean).join(' ');
  const el = document.getElementById('greetingText');
  if (el) el.textContent = name ? `${getGreeting()}, ${name}` : 'Wochenplan';
}

// ── Persistence ──
function save() {
  localStorage.setItem('sp_courses', JSON.stringify(courses));
  localStorage.setItem('sp_lessons', JSON.stringify(lessons));
}

// ── ID generator ──
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2); }

// ── Color helpers ──
function textColor(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  const luminance = (0.299*r + 0.587*g + 0.114*b) / 255;
  return luminance > 0.45 ? '#1a1a23' : '#ffffff';
}

function darkenHex(hex, amount = 0.45) {
  const r = Math.round(parseInt(hex.slice(1,3),16) * (1 - amount));
  const g = Math.round(parseInt(hex.slice(3,5),16) * (1 - amount));
  const b = Math.round(parseInt(hex.slice(5,7),16) * (1 - amount));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── Week helpers ──
function getMonday(offset = 0) {
  const d = new Date();
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1 + offset * 7);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDate(date) {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

// ── Time helpers ──
function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPx(minutes) {
  return (minutes / 60) * HOUR_HEIGHT;
}

function lessonTop(start) {
  return minutesToPx(timeToMinutes(start) - DAY_START * 60);
}

function lessonHeight(start, end) {
  return minutesToPx(timeToMinutes(end) - timeToMinutes(start));
}

// ── Views ──
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.view === name);
  });
}

// ── Timetable render ──
function renderTimetable() {
  const monday = getMonday(weekOffset);
  const wn = getWeekNumber(monday);
  document.getElementById('weekNumber').textContent = wn;

  const friday = new Date(monday);
  friday.setDate(friday.getDate() + 4);
  document.getElementById('weekRange').textContent =
    formatDate(monday) + ' – ' + formatDate(friday);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const grid = document.getElementById('timetableGrid');
  grid.innerHTML = '';

  // Header
  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = '<div></div>'; // empty time col
  DAYS.forEach((name, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    const isToday = d.getTime() === today.getTime();
    const label = document.createElement('div');
    label.className = 'grid-day-label' + (isToday ? ' today' : '');
    label.innerHTML = `${name}<span class="day-date">${d.getDate()}</span>`;
    header.appendChild(label);
  });
  grid.appendChild(header);

  // Body
  const body = document.createElement('div');
  body.className = 'grid-body';

  // Time column
  const timeCol = document.createElement('div');
  timeCol.className = 'grid-time-col';
  HOURS.forEach(h => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.innerHTML = `<span class="time-label">${String(h).padStart(2,'0')}:00</span>`;
    timeCol.appendChild(slot);
  });
  body.appendChild(timeCol);

  // Day columns
  DAYS.forEach((_, dayIndex) => {
    const colDate = new Date(monday);
    colDate.setDate(colDate.getDate() + dayIndex);
    const colISO = colDate.toISOString().slice(0, 10);

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.minWidth = '130px';

    // Hour lines
    const linesDiv = document.createElement('div');
    linesDiv.style.position = 'absolute';
    linesDiv.style.inset = '0';
    HOURS.forEach(() => {
      const line = document.createElement('div');
      line.className = 'hour-line';
      line.style.height = HOUR_HEIGHT + 'px';
      line.style.borderTop = '1px solid var(--border)';
      linesDiv.appendChild(line);
    });
    wrapper.appendChild(linesDiv);

    // Total height
    wrapper.style.height = (HOURS.length * HOUR_HEIGHT) + 'px';

    // Lessons: weekly (no date) OR date-specific matching this column
    const dayLessons = lessons.filter(l =>
      l.date ? l.date === colISO : l.day === dayIndex
    );
    dayLessons.forEach(lesson => {
      const course = courses.find(c => c.id === lesson.courseId);
      if (!course) return;

      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.style.top    = lessonTop(lesson.start) + 'px';
      card.style.height = Math.max(lessonHeight(lesson.start, lesson.end), 28) + 'px';
      const dark = darkenHex(course.color, 0.5);
      card.style.background = `linear-gradient(135deg, ${course.color} 0%, ${dark} 100%)`;
      const tc = textColor(course.color);
      card.style.color = tc;

      const room = lesson.room || course.room || '';
      card.innerHTML = `
        <div class="lesson-name">${course.name}</div>
        <div class="lesson-time" style="color:${tc};opacity:0.7">${lesson.start} – ${lesson.end}</div>
        ${room ? `<div class="lesson-room" style="color:${tc};opacity:0.6">${room}</div>` : ''}
        ${course.teacher ? `<div class="lesson-teacher" style="color:${tc};opacity:0.6">${course.teacher}</div>` : ''}
      `;

      card.addEventListener('click', () => openLessonModal(lesson.id));
      wrapper.appendChild(card);
    });

    body.appendChild(wrapper);
  });

  grid.appendChild(body);
}

// ── Courses render ──
function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  grid.innerHTML = '';

  if (courses.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div style="font-size:40px">✦</div>
        <p>Noch keine Kurse. Füge deinen ersten Kurs hinzu!</p>
      </div>`;
    return;
  }

  courses.forEach(course => {
    const count = lessons.filter(l => l.courseId === course.id).length;
    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-bar" style="background:${course.color}"></div>
      <div class="course-card-name">${course.name}</div>
      ${course.teacher ? `<div class="course-card-teacher">${course.teacher}</div>` : ''}
      ${course.room ? `<div class="course-card-teacher">${course.room}</div>` : ''}
      <div class="course-card-lessons">${count} Stunde${count !== 1 ? 'n' : ''} pro Woche</div>
    `;
    card.addEventListener('click', () => openCourseModal(course.id));
    grid.appendChild(card);
  });
}

// ── Color picker ──
function buildColorPicker(selectedColor) {
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = '';
  COLORS.forEach(color => {
    const dot = document.createElement('div');
    dot.className = 'color-dot' + (color === selectedColor ? ' selected' : '');
    dot.style.background = color;
    dot.dataset.color = color;
    dot.addEventListener('click', () => {
      picker.querySelectorAll('.color-dot').forEach(d => d.classList.remove('selected'));
      dot.classList.add('selected');
    });
    picker.appendChild(dot);
  });
}

function getSelectedColor() {
  const dot = document.querySelector('.color-dot.selected');
  return dot ? dot.dataset.color : COLORS[0];
}

// ── Course modal ──
function openCourseModal(id) {
  const modal = document.getElementById('modalCourse');
  const deleteBtn = document.getElementById('deleteCourseBtn');

  if (id) {
    const course = courses.find(c => c.id === id);
    document.getElementById('modalCourseTitle').textContent = 'Kurs bearbeiten';
    document.getElementById('courseId').value = id;
    document.getElementById('courseName').value = course.name;
    document.getElementById('courseTeacher').value = course.teacher || '';
    document.getElementById('courseRoom').value = course.room || '';
    buildColorPicker(course.color);
    deleteBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalCourseTitle').textContent = 'Kurs hinzufügen';
    document.getElementById('courseId').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseTeacher').value = '';
    document.getElementById('courseRoom').value = '';
    buildColorPicker(COLORS[courses.length % COLORS.length]);
    deleteBtn.classList.add('hidden');
  }

  modal.classList.add('open');
}

function closeCourseModal() {
  document.getElementById('modalCourse').classList.remove('open');
}

// ── Lesson modal ──
function setLessonToggle(isOnce) {
  document.getElementById('toggleWeekly').classList.toggle('active', !isOnce);
  document.getElementById('toggleOnce').classList.toggle('active', isOnce);
  document.getElementById('groupDay').classList.toggle('hidden', isOnce);
  document.getElementById('groupDate').classList.toggle('hidden', !isOnce);
}

function openLessonModal(id) {
  const modal = document.getElementById('modalLesson');
  const deleteBtn = document.getElementById('deleteLessonBtn');
  const select = document.getElementById('lessonCourse');

  select.innerHTML = courses.map(c =>
    `<option value="${c.id}">${c.name}</option>`
  ).join('');

  if (courses.length === 0) {
    alert('Bitte zuerst einen Kurs anlegen!');
    return;
  }

  if (id) {
    const lesson = lessons.find(l => l.id === id);
    document.getElementById('modalLessonTitle').textContent = 'Stunde bearbeiten';
    document.getElementById('lessonId').value = id;
    select.value = lesson.courseId;
    setLessonToggle(!!lesson.date);
    document.getElementById('lessonDay').value = lesson.day ?? 0;
    document.getElementById('lessonDate').value = lesson.date || '';
    document.getElementById('lessonStart').value = lesson.start;
    document.getElementById('lessonEnd').value = lesson.end;
    document.getElementById('lessonRoom').value = lesson.room || '';
    deleteBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalLessonTitle').textContent = 'Stunde hinzufügen';
    document.getElementById('lessonId').value = '';
    setLessonToggle(false);
    document.getElementById('lessonDay').value = '0';
    document.getElementById('lessonDate').value = '';
    document.getElementById('lessonStart').value = '08:00';
    document.getElementById('lessonEnd').value = '09:30';
    document.getElementById('lessonRoom').value = '';
    deleteBtn.classList.add('hidden');
  }

  modal.classList.add('open');
}

function closeLessonModal() {
  document.getElementById('modalLesson').classList.remove('open');
}

// ── Event listeners ──
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.dataset.view) return;
    showView(btn.dataset.view);
    if (btn.dataset.view === 'timetable') renderTimetable();
    if (btn.dataset.view === 'courses')   renderCourses();
    if (btn.dataset.view === 'settings')  renderSettings();
  });
});

function renderSettings() {
  document.getElementById('settingsFirstName').value = localStorage.getItem('sp_firstName') || '';
  document.getElementById('settingsLastName').value  = localStorage.getItem('sp_lastName')  || '';
  const end = localStorage.getItem('sp_semester_end');
  if (end) {
    const d = new Date(end);
    document.getElementById('semesterEndDisplay').textContent =
      d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

document.getElementById('saveSettings').addEventListener('click', () => {
  localStorage.setItem('sp_firstName', document.getElementById('settingsFirstName').value.trim());
  localStorage.setItem('sp_lastName',  document.getElementById('settingsLastName').value.trim());
  updateGreeting();
  const btn = document.getElementById('saveSettings');
  btn.textContent = 'Gespeichert ✓';
  setTimeout(() => { btn.textContent = 'Speichern'; }, 1800);
});

// Navigation
document.getElementById('prevWeek').addEventListener('click', () => {
  weekOffset--; renderTimetable();
});
document.getElementById('nextWeek').addEventListener('click', () => {
  weekOffset++; renderTimetable();
});
document.getElementById('todayBtn').addEventListener('click', () => {
  weekOffset = 0; renderTimetable();
});

// Open modals
document.getElementById('openAddLesson').addEventListener('click', () => openLessonModal(null));
document.getElementById('openAddCourse').addEventListener('click', () => openCourseModal(null));

// Close modals
document.getElementById('closeLessonModal').addEventListener('click', closeLessonModal);
document.getElementById('cancelLessonBtn').addEventListener('click', closeLessonModal);
document.getElementById('closeCourseModal').addEventListener('click', closeCourseModal);
document.getElementById('cancelCourseBtn').addEventListener('click', closeCourseModal);

// Toggle weekly/once
document.getElementById('toggleWeekly').addEventListener('click', () => setLessonToggle(false));
document.getElementById('toggleOnce').addEventListener('click',   () => setLessonToggle(true));

// Close on overlay click
document.getElementById('modalLesson').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeLessonModal();
});
document.getElementById('modalCourse').addEventListener('click', e => {
  if (e.target === e.currentTarget) closeCourseModal();
});

// Save course
document.getElementById('courseForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('courseId').value;
  const data = {
    name:    document.getElementById('courseName').value.trim(),
    teacher: document.getElementById('courseTeacher').value.trim(),
    room:    document.getElementById('courseRoom').value.trim(),
    color:   getSelectedColor(),
  };

  if (id) {
    const idx = courses.findIndex(c => c.id === id);
    courses[idx] = { ...courses[idx], ...data };
  } else {
    courses.push({ id: uid(), ...data });
  }

  save();
  closeCourseModal();
  renderCourses();
});

// Delete course
document.getElementById('deleteCourseBtn').addEventListener('click', () => {
  const id = document.getElementById('courseId').value;
  if (!confirm('Kurs und alle zugehörigen Stunden löschen?')) return;
  courses  = courses.filter(c => c.id !== id);
  lessons  = lessons.filter(l => l.courseId !== id);
  save();
  closeCourseModal();
  renderCourses();
  renderTimetable();
});

// Save lesson
document.getElementById('lessonForm').addEventListener('submit', e => {
  e.preventDefault();
  const id     = document.getElementById('lessonId').value;
  const isOnce = document.getElementById('toggleOnce').classList.contains('active');
  const dateVal = document.getElementById('lessonDate').value;

  if (isOnce && !dateVal) {
    alert('Bitte ein Datum auswählen.');
    return;
  }

  const data = {
    courseId: document.getElementById('lessonCourse').value,
    start:    document.getElementById('lessonStart').value,
    end:      document.getElementById('lessonEnd').value,
    room:     document.getElementById('lessonRoom').value.trim(),
    ...(isOnce
      ? { date: dateVal, day: new Date(dateVal).getDay() === 0 ? 6 : new Date(dateVal).getDay() - 1 }
      : { day: Number(document.getElementById('lessonDay').value) }
    )
  };

  if (timeToMinutes(data.end) <= timeToMinutes(data.start)) {
    alert('Die Endzeit muss nach der Startzeit liegen.');
    return;
  }

  if (id) {
    const idx = lessons.findIndex(l => l.id === id);
    lessons[idx] = { id, ...data };
  } else {
    lessons.push({ id: uid(), ...data });
  }

  save();
  closeLessonModal();
  renderTimetable();
});

// Delete lesson
document.getElementById('deleteLessonBtn').addEventListener('click', () => {
  const id = document.getElementById('lessonId').value;
  lessons = lessons.filter(l => l.id !== id);
  save();
  closeLessonModal();
  renderTimetable();
});

// ── Weather ──
const WMO = {
  0:'☀️',1:'🌤',2:'⛅',3:'☁️',
  45:'🌫',48:'🌫',
  51:'🌦',53:'🌦',55:'🌧',
  61:'🌧',63:'🌧',65:'🌧',
  71:'🌨',73:'🌨',75:'❄️',
  80:'🌦',81:'🌧',82:'⛈',
  95:'⛈',96:'⛈',99:'⛈'
};

const WMO_DESC = {
  0:'Klar',1:'Meist klar',2:'Teilbewölkt',3:'Bewölkt',
  45:'Nebel',48:'Nebel',
  51:'Leichter Nieselregen',53:'Nieselregen',55:'Starker Nieselregen',
  61:'Leichter Regen',63:'Regen',65:'Starker Regen',
  71:'Leichter Schnee',73:'Schnee',75:'Starker Schnee',
  80:'Schauer',81:'Starke Schauer',82:'Gewitter',
  95:'Gewitter',96:'Gewitter',99:'Schweres Gewitter'
};

async function fetchWeather() {
  try {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=49.24&longitude=6.99' +
      '&current=temperature_2m,weathercode' +
      '&daily=temperature_2m_max,temperature_2m_min' +
      '&timezone=Europe%2FBerlin';
    const res  = await fetch(url);
    const data = await res.json();
    const c = data.current;
    const d = data.daily;
    document.getElementById('wTemp').textContent = Math.round(c.temperature_2m);
    document.getElementById('wIcon').textContent = WMO[c.weathercode] || '🌡';
    document.getElementById('wDesc').textContent = WMO_DESC[c.weathercode] || '';
    document.getElementById('wMin').textContent  = Math.round(d.temperature_2m_min[0]);
    document.getElementById('wMax').textContent  = Math.round(d.temperature_2m_max[0]);
  } catch {
    document.getElementById('wDesc').textContent = 'Keine Verbindung';
  }
}

// ── Init ──
function initApp() {
  loadState();
  updateGreeting();
  renderTimetable();
  fetchWeather();
  setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 min
}

initAuth().then(() => {
  if (sessionStorage.getItem('sp_authed') === '1') initApp();
});
