'use strict';

// ── Supabase ──
const SUPABASE_URL = 'https://fztnwuvcnuqydpoayzpq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dG53dXZjbnVxeWRwb2F5enBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODkyMzcsImV4cCI6MjA5MjQ2NTIzN30.Kox8o3ZmcndZhSspY5UTF8JC30eT8UkGRctKKEQgGPs';
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const JASON_MATRIKEL = '5014263';
const SEMESTER_END   = '2026-07-17';

const PRESET_COURSES = [
  { id: 'c_kommunikation',   name: 'Kommunikation',    teacher: 'Frau Seeliger', room: 'A1 06',  color: '#6adfff' },
  { id: 'c_servicelearning', name: 'Service Learning', teacher: 'Herr Schug',   room: '',       color: '#ffb86a' },
  { id: 'c_statistik2',      name: 'Statistik 2',      teacher: 'Frau Pulham',  room: 'A E 14', color: '#c46aff' },
  { id: 'c_b2b',             name: 'B2B Marketing',    teacher: 'Herr Steffen', room: 'A 1 05', color: '#6aff9e' },
  { id: 'c_simulation',      name: 'Simulation',       teacher: 'Herr Heß',    room: 'A E 05', color: '#ff9e6a' },
  { id: 'c_anlage',          name: 'Anlagestrategien', teacher: 'Herr George',  room: 'B-2-06', color: '#ff6a9e' },
  { id: 'c_bizplan',         name: 'Business Planning',teacher: 'Herr George',  room: 'D-1-12', color: '#6a9eff' }
];

const PRESET_LESSONS = [
  { id: 'l_komm_tue',  courseId: 'c_kommunikation',   day: 1, start: '08:15', end: '09:45', room: '' },
  { id: 'l_stat2_tue', courseId: 'c_statistik2',       day: 1, start: '10:00', end: '11:30', room: '' },
  { id: 'l_stat2_thu', courseId: 'c_statistik2',       day: 3, start: '11:45', end: '13:15', room: 'B E 07' },
  { id: 'l_b2b_wed',   courseId: 'c_b2b',              day: 2, start: '08:15', end: '11:30', room: '', startDate: '2026-05-05' },
  { id: 'l_sim_wed',   courseId: 'c_simulation',       day: 2, start: '11:45', end: '13:15', room: '' },
  { id: 'l_biz_1',     courseId: 'c_bizplan',          day: 3, start: '10:00', end: '11:30', room: '', date: '2026-04-09' },
  { id: 'l_biz_2',     courseId: 'c_bizplan',          day: 3, start: '10:00', end: '11:30', room: '', date: '2026-05-07' },
  { id: 'l_biz_3',     courseId: 'c_bizplan',          day: 3, start: '10:00', end: '11:30', room: '', date: '2026-05-21' },
  { id: 'l_biz_4',     courseId: 'c_bizplan',          day: 3, start: '10:00', end: '11:30', room: '', date: '2026-06-18' },
  { id: 'l_biz_5',     courseId: 'c_bizplan',          day: 3, start: '10:00', end: '11:30', room: '', date: '2026-07-09' },
  { id: 'l_anlage_1',  courseId: 'c_anlage',           day: 1, start: '11:45', end: '13:15', room: '', date: '2026-04-07' },
  { id: 'l_anlage_2',  courseId: 'c_anlage',           day: 1, start: '11:45', end: '13:15', room: '', date: '2026-05-05' },
  { id: 'l_anlage_3',  courseId: 'c_anlage',           day: 1, start: '11:45', end: '13:15', room: '', date: '2026-05-19' },
  { id: 'l_anlage_4',  courseId: 'c_anlage',           day: 1, start: '11:45', end: '13:15', room: '', date: '2026-06-16' },
  { id: 'l_anlage_5',  courseId: 'c_anlage',           day: 1, start: '11:45', end: '13:15', room: '', date: '2026-07-07' },
  { id: 'l_sl_1',      courseId: 'c_servicelearning',  day: 0, start: '08:15', end: '09:45', room: 'E-2-02', date: '2026-04-27' },
  { id: 'l_sl_2',      courseId: 'c_servicelearning',  day: 0, start: '11:45', end: '14:00', room: 'B-E-07',  date: '2026-05-11' },
  { id: 'l_sl_3',      courseId: 'c_servicelearning',  day: 0, start: '13:15', end: '14:15', room: 'Digital', date: '2026-06-08' },
  { id: 'l_sl_4',      courseId: 'c_servicelearning',  day: 0, start: '10:00', end: '13:15', room: 'B-E-07',  date: '2026-07-13' }
];

// ── Search ──
let searchQuery = '';

function parseSearchDate(q) {
  const dm = q.match(/^(\d{1,2})\.(\d{1,2})(?:\.(\d{4}))?$/);
  if (dm) {
    const year = dm[3] ? parseInt(dm[3]) : new Date().getFullYear();
    const d = new Date(year, parseInt(dm[2]) - 1, parseInt(dm[1]));
    if (!isNaN(d)) return d;
  }
  const iso = q.match(/^\d{4}-\d{2}-\d{2}$/);
  if (iso) {
    const d = new Date(q);
    if (!isNaN(d)) return d;
  }
  return null;
}

function handleSearch(q) {
  searchQuery = q;
  const date = parseSearchDate(q);
  if (date) {
    const currentMonday = getMonday(0);
    const targetMonday = new Date(date);
    const day = targetMonday.getDay() || 7;
    targetMonday.setDate(targetMonday.getDate() - day + 1);
    targetMonday.setHours(0, 0, 0, 0);
    weekOffset = Math.round((targetMonday - currentMonday) / (7 * 86400000));
  }
  renderTimetable();
}

// ── State ──
let currentUser = null;
let profile     = { firstName: '', lastName: '', semesterEnd: SEMESTER_END };
let courses     = [];
let lessons     = [];
let exams       = [];
let weekOffset  = 0;

// ── Constants ──
const DAYS = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const HOUR_HEIGHT = 72;
const DAY_START   = 8;

const COLORS = [
  '#7c6aff','#ff6a9e','#6adfff','#6aff9e','#ffb86a',
  '#ff6a6a','#c46aff','#6a9eff','#ffea6a','#ff9e6a'
];

// ── Auth ──
function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appRoot').style.display = 'flex';
}

async function initAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = session.user;
    await initApp();
    showApp();
    return;
  }

  document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();
    const matrikel = document.getElementById('loginMatrikel').value.trim();
    const email    = `${matrikel}@eliteplan.htw`;
    const password = `ep_${matrikel}_htw`;
    const errorEl  = document.getElementById('loginError');
    const btn      = document.getElementById('loginBtn');
    errorEl.classList.add('hidden');
    btn.disabled = true;
    btn.textContent = '…';

    try {
      let { data, error } = await sb.auth.signInWithPassword({ email, password });
      if (error) {
        ({ data, error } = await sb.auth.signUp({ email, password }));
        if (error) throw new Error(error.message);
      }
      currentUser = data.user;
      await initApp();
      showApp();
    } catch (err) {
      errorEl.textContent = 'Anmeldung fehlgeschlagen. Bitte erneut versuchen.';
      errorEl.classList.remove('hidden');
      btn.disabled = false;
      btn.textContent = 'Anmelden';
    }
  });
}

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await sb.auth.signOut();
  location.reload();
});

// ── Data loading ──
async function loadState() {
  const uid = currentUser.id;
  const [{ data: prof }, { data: cData }, { data: lData }, { data: eData }] = await Promise.all([
    sb.from('profiles').select('*').eq('id', uid).single(),
    sb.from('courses').select('*').eq('user_id', uid),
    sb.from('lessons').select('*').eq('user_id', uid),
    sb.from('exams').select('*').eq('user_id', uid)
  ]);

  if (prof) {
    profile = {
      firstName:   prof.first_name   || '',
      lastName:    prof.last_name    || '',
      semesterEnd: prof.semester_end || SEMESTER_END
    };
  }

  courses = (cData || []).map(r => ({
    id: r.id, name: r.name,
    teacher: r.teacher || '', room: r.room || '',
    color: r.color || '#7c6aff', moodleUrl: r.moodle_url || ''
  }));

  lessons = (lData || []).map(r => ({
    id: r.id, courseId: r.course_id,
    day: r.day, start: r.start_time, end: r.end_time,
    room: r.room || '',
    ...(r.date       ? { date:      r.date }       : {}),
    ...(r.start_date ? { startDate: r.start_date } : {})
  }));

  exams = (eData || []).map(r => ({
    id: r.id, courseId: r.course_id, type: r.type,
    title: r.title, note: r.note || '',
    ...(r.date ? { date: r.date } : {}),
    ...(r.time ? { time: r.time } : {}),
    ...(r.room ? { room: r.room } : {}),
    milestones: r.milestones || []
  }));
}

// ── DB helpers ──
function dbUpsertCourse(c) {
  return sb.from('courses').upsert({
    id: c.id, user_id: currentUser.id,
    name: c.name, teacher: c.teacher || '',
    room: c.room || '', color: c.color, moodle_url: c.moodleUrl || ''
  });
}

function dbDeleteCourse(id) {
  return sb.from('courses').delete().eq('id', id).eq('user_id', currentUser.id);
}

function dbUpsertLesson(l) {
  return sb.from('lessons').upsert({
    id: l.id, user_id: currentUser.id,
    course_id: l.courseId, day: l.day,
    start_time: l.start, end_time: l.end,
    room: l.room || '', date: l.date || null, start_date: l.startDate || null
  });
}

function dbDeleteLesson(id) {
  return sb.from('lessons').delete().eq('id', id).eq('user_id', currentUser.id);
}

function dbUpsertExam(ex) {
  return sb.from('exams').upsert({
    id: ex.id, user_id: currentUser.id,
    course_id: ex.courseId, type: ex.type,
    title: ex.title, note: ex.note || '',
    date: ex.date || null, time: ex.time || null,
    room: ex.room || null, milestones: ex.milestones || []
  });
}

function dbDeleteExam(id) {
  return sb.from('exams').delete().eq('id', id).eq('user_id', currentUser.id);
}

function dbSaveProfile() {
  return sb.from('profiles').upsert({
    id: currentUser.id,
    first_name: profile.firstName,
    last_name:  profile.lastName,
    semester_end: profile.semesterEnd
  });
}

// ── Seed Jason's preset data (first login only) ──
async function seedJason() {
  const uid = currentUser.id;
  await Promise.all([
    sb.from('profiles').upsert({ id: uid, first_name: 'Jason', last_name: 'Bedranowsky', semester_end: SEMESTER_END }),
    ...PRESET_COURSES.map(c => sb.from('courses').upsert({
      id: c.id, user_id: uid,
      name: c.name, teacher: c.teacher, room: c.room, color: c.color, moodle_url: ''
    })),
    ...PRESET_LESSONS.map(l => sb.from('lessons').upsert({
      id: l.id, user_id: uid, course_id: l.courseId,
      day: l.day, start_time: l.start, end_time: l.end,
      room: l.room || '', date: l.date || null, start_date: l.startDate || null
    }))
  ]);
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

// ── Greeting ──
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

function updateGreeting() {
  const name = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
  const el = document.getElementById('greetingText');
  if (el) el.textContent = name ? `${getGreeting()}, ${name}` : 'Wochenplan';
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

function minutesToPx(minutes) { return (minutes / 60) * HOUR_HEIGHT; }
function lessonTop(start)     { return minutesToPx(timeToMinutes(start) - DAY_START * 60); }
function lessonHeight(start, end) { return minutesToPx(timeToMinutes(end) - timeToMinutes(start)); }

// ── Views ──
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(b => {
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

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const grid = document.getElementById('timetableGrid');
  grid.innerHTML = '';

  const header = document.createElement('div');
  header.className = 'grid-header';
  header.innerHTML = '<div></div>';
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

  const body = document.createElement('div');
  body.className = 'grid-body';

  const timeCol = document.createElement('div');
  timeCol.className = 'grid-time-col';
  HOURS.forEach(h => {
    const slot = document.createElement('div');
    slot.className = 'time-slot';
    slot.innerHTML = `<span class="time-label">${String(h).padStart(2,'0')}:00</span>`;
    timeCol.appendChild(slot);
  });
  body.appendChild(timeCol);

  DAYS.forEach((_, dayIndex) => {
    const colDate = new Date(monday);
    colDate.setDate(colDate.getDate() + dayIndex);
    const colISO = `${colDate.getFullYear()}-${String(colDate.getMonth()+1).padStart(2,'0')}-${String(colDate.getDate()).padStart(2,'0')}`;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';

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
    wrapper.style.height = (HOURS.length * HOUR_HEIGHT) + 'px';

    const dayLessons = lessons.filter(l => {
      if (l.date) return l.date === colISO;
      if (l.day !== dayIndex) return false;
      if (l.startDate && colISO < l.startDate) return false;
      return true;
    });

    const sorted = [...dayLessons].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
    const cols = [];
    const lessonCol     = new Map();
    const lessonNumCols = new Map();

    sorted.forEach(l => {
      const start = timeToMinutes(l.start);
      let placed = false;
      for (let i = 0; i < cols.length; i++) {
        if (cols[i] <= start) { cols[i] = timeToMinutes(l.end); lessonCol.set(l.id, i); placed = true; break; }
      }
      if (!placed) { lessonCol.set(l.id, cols.length); cols.push(timeToMinutes(l.end)); }
    });

    sorted.forEach(l => {
      const s = timeToMinutes(l.start), e = timeToMinutes(l.end);
      let maxCol = lessonCol.get(l.id);
      sorted.forEach(o => {
        if (o.id === l.id) return;
        if (timeToMinutes(o.start) < e && timeToMinutes(o.end) > s)
          maxCol = Math.max(maxCol, lessonCol.get(o.id));
      });
      lessonNumCols.set(l.id, maxCol + 1);
    });

    sorted.forEach(lesson => {
      const course = courses.find(c => c.id === lesson.courseId);
      if (!course) return;

      const col     = lessonCol.get(lesson.id) ?? 0;
      const numCols = lessonNumCols.get(lesson.id) ?? 1;
      const widthPct = 100 / numCols;
      const leftPct  = col * widthPct;

      const card = document.createElement('div');
      card.className = 'lesson-card';
      card.style.top    = lessonTop(lesson.start) + 'px';
      card.style.height = Math.max(lessonHeight(lesson.start, lesson.end), 28) + 'px';
      card.style.left   = leftPct + '%';
      card.style.right  = numCols > 1 ? 'unset' : '0';
      card.style.width  = numCols > 1 ? `calc(${widthPct}% - 4px)` : '';
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
      if (searchQuery && !parseSearchDate(searchQuery)) {
        const matches = course.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches) card.style.opacity = '0.15';
      }
      card.addEventListener('click', () => openLessonModal(lesson.id));
      wrapper.appendChild(card);
    });

    body.appendChild(wrapper);
  });

  if (nowMin >= DAY_START * 60 && nowMin < (DAY_START + HOURS.length) * 60) {
    const indicator = document.createElement('div');
    indicator.className = 'time-indicator';
    indicator.style.top = minutesToPx(nowMin - DAY_START * 60) + 'px';
    body.appendChild(indicator);
  }

  grid.appendChild(body);
}

// ── Courses render ──
function renderCourses() {
  const grid = document.getElementById('coursesGrid');
  grid.innerHTML = '';

  if (courses.length === 0) {
    grid.innerHTML = `<div class="empty-state"><div style="font-size:40px">✦</div><p>Noch keine Kurse. Füge deinen ersten Kurs hinzu!</p></div>`;
    return;
  }

  courses.forEach(course => {
    const courseLessons = lessons.filter(l => l.courseId === course.id);
    const weekly = courseLessons.filter(l => !l.date).length;
    const once   = courseLessons.filter(l =>  l.date).length;
    let lessonInfo = '';
    if (weekly && once)  lessonInfo = `${weekly}× wöchentlich + ${once} Einzeltermin${once !== 1 ? 'e' : ''}`;
    else if (weekly)     lessonInfo = `${weekly}× pro Woche`;
    else if (once)       lessonInfo = `${once} Einzeltermin${once !== 1 ? 'e' : ''}`;

    const card = document.createElement('div');
    card.className = 'course-card';
    card.innerHTML = `
      <div class="course-card-bar" style="background:${course.color}"></div>
      <div class="course-card-name">${course.name}</div>
      ${course.teacher ? `<div class="course-card-teacher">${course.teacher}</div>` : ''}
      ${course.room ? `<div class="course-card-teacher">${course.room}</div>` : ''}
      ${lessonInfo ? `<div class="course-card-lessons">${lessonInfo}</div>` : ''}
      ${course.moodleUrl ? `<a class="moodle-btn" href="${course.moodleUrl}" target="_blank" rel="noopener" onclick="event.stopPropagation()">Moodle öffnen ↗</a>` : ''}
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
    document.getElementById('courseMoodle').value = course.moodleUrl || '';
    buildColorPicker(course.color);
    deleteBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalCourseTitle').textContent = 'Kurs hinzufügen';
    document.getElementById('courseId').value = '';
    document.getElementById('courseName').value = '';
    document.getElementById('courseTeacher').value = '';
    document.getElementById('courseRoom').value = '';
    document.getElementById('courseMoodle').value = '';
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

  select.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

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

// ── Settings ──
function renderSettings() {
  document.getElementById('settingsFirstName').value = profile.firstName;
  document.getElementById('settingsLastName').value  = profile.lastName;
  const end = profile.semesterEnd;
  if (end) {
    const d = new Date(end);
    document.getElementById('semesterEndDisplay').textContent =
      d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}

document.getElementById('saveSettings').addEventListener('click', () => {
  profile.firstName = document.getElementById('settingsFirstName').value.trim();
  profile.lastName  = document.getElementById('settingsLastName').value.trim();
  updateGreeting();
  dbSaveProfile();
  const btn = document.getElementById('saveSettings');
  btn.textContent = 'Gespeichert ✓';
  setTimeout(() => { btn.textContent = 'Speichern'; }, 1800);
});

// ── Nav ──
function handleNavClick(view) {
  showView(view);
  if (view === 'timetable') renderTimetable();
  if (view === 'courses')   renderCourses();
  if (view === 'settings')  renderSettings();
  if (view === 'exams')     renderExams();
  if (view === 'mensa')     { mensaOffset = 0; fetchMensa(mensaLocalISO(0)); }
}

document.querySelectorAll('.nav-btn, .bottom-nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.dataset.view) return;
    handleNavClick(btn.dataset.view);
  });
});

// ── Navigation ──
document.getElementById('prevWeek').addEventListener('click', () => { weekOffset--; renderTimetable(); });
document.getElementById('nextWeek').addEventListener('click', () => { weekOffset++; renderTimetable(); });
document.getElementById('todayBtn').addEventListener('click', () => { weekOffset = 0; renderTimetable(); });
document.getElementById('openAddLesson').addEventListener('click', () => openLessonModal(null));
document.getElementById('openAddCourse').addEventListener('click', () => openCourseModal(null));

// Close modals
document.getElementById('closeLessonModal').addEventListener('click', closeLessonModal);
document.getElementById('cancelLessonBtn').addEventListener('click', closeLessonModal);
document.getElementById('closeCourseModal').addEventListener('click', closeCourseModal);
document.getElementById('cancelCourseBtn').addEventListener('click', closeCourseModal);
document.getElementById('modalLesson').addEventListener('click', e => { if (e.target === e.currentTarget) closeLessonModal(); });
document.getElementById('modalCourse').addEventListener('click', e => { if (e.target === e.currentTarget) closeCourseModal(); });

// Toggle weekly/once
document.getElementById('toggleWeekly').addEventListener('click', () => setLessonToggle(false));
document.getElementById('toggleOnce').addEventListener('click',   () => setLessonToggle(true));

// ── Course form ──
document.getElementById('courseForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('courseId').value;
  const data = {
    name:      document.getElementById('courseName').value.trim(),
    teacher:   document.getElementById('courseTeacher').value.trim(),
    room:      document.getElementById('courseRoom').value.trim(),
    moodleUrl: document.getElementById('courseMoodle').value.trim(),
    color:     getSelectedColor(),
  };

  if (id) {
    const idx = courses.findIndex(c => c.id === id);
    courses[idx] = { ...courses[idx], ...data };
    dbUpsertCourse(courses[idx]);
  } else {
    const newCourse = { id: uid(), ...data };
    courses.push(newCourse);
    dbUpsertCourse(newCourse);
  }
  closeCourseModal();
  renderCourses();
});

document.getElementById('deleteCourseBtn').addEventListener('click', () => {
  const id = document.getElementById('courseId').value;
  if (!confirm('Kurs und alle zugehörigen Stunden löschen?')) return;
  lessons.filter(l => l.courseId === id).forEach(l => dbDeleteLesson(l.id));
  lessons  = lessons.filter(l => l.courseId !== id);
  courses  = courses.filter(c => c.id !== id);
  dbDeleteCourse(id);
  closeCourseModal();
  renderCourses();
  renderTimetable();
});

// ── Lesson form ──
document.getElementById('lessonForm').addEventListener('submit', e => {
  e.preventDefault();
  const id     = document.getElementById('lessonId').value;
  const isOnce = document.getElementById('toggleOnce').classList.contains('active');
  const dateVal = document.getElementById('lessonDate').value;

  if (isOnce && !dateVal) { alert('Bitte ein Datum auswählen.'); return; }

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
    dbUpsertLesson(lessons[idx]);
  } else {
    const newLesson = { id: uid(), ...data };
    lessons.push(newLesson);
    dbUpsertLesson(newLesson);
  }
  closeLessonModal();
  renderTimetable();
});

document.getElementById('deleteLessonBtn').addEventListener('click', () => {
  const id = document.getElementById('lessonId').value;
  lessons = lessons.filter(l => l.id !== id);
  dbDeleteLesson(id);
  closeLessonModal();
  renderTimetable();
});

// ── Exams ──
let examType  = 'klausur';
let milestones = [];

function daysUntil(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  return Math.round((d - today) / 86400000);
}

function countdownLabel(days) {
  if (days < 0)   return { text: 'Vorbei', cls: 'past' };
  if (days === 0) return { text: 'Heute!', cls: 'today' };
  if (days <= 7)  return { text: `${days}T`, cls: 'soon' };
  return { text: `${days}T`, cls: '' };
}

function nextMilestone(exam) {
  if (exam.type !== 'projekt') return null;
  const today = new Date(); today.setHours(0,0,0,0);
  return [...exam.milestones]
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .find(m => new Date(m.date) >= today) || null;
}

function setExamType(type) {
  examType = type;
  document.getElementById('toggleKlausur').classList.toggle('active', type === 'klausur');
  document.getElementById('toggleProjekt').classList.toggle('active', type === 'projekt');
  document.getElementById('klausurFields').classList.toggle('hidden', type !== 'klausur');
  document.getElementById('projektFields').classList.toggle('hidden', type !== 'projekt');
}

function renderMilestoneInputs() {
  const container = document.getElementById('milestoneList');
  container.innerHTML = milestones.map((m, i) => `
    <div class="milestone-form-row">
      <input type="text" placeholder="Bezeichnung" value="${m.title}" data-mi="${i}" data-field="title" />
      <input type="date" value="${m.date}" data-mi="${i}" data-field="date" style="width:130px" />
      <button type="button" class="milestone-remove" data-mi="${i}">✕</button>
    </div>`).join('');

  container.querySelectorAll('input').forEach(inp => {
    inp.addEventListener('input', () => { milestones[inp.dataset.mi][inp.dataset.field] = inp.value; });
  });
  container.querySelectorAll('.milestone-remove').forEach(btn => {
    btn.addEventListener('click', () => { milestones.splice(Number(btn.dataset.mi), 1); renderMilestoneInputs(); });
  });
}

function openExamModal(id) {
  const modal = document.getElementById('modalExam');
  const select = document.getElementById('examCourse');
  select.innerHTML = courses.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const deleteBtn = document.getElementById('deleteExamBtn');

  if (id) {
    const exam = exams.find(e => e.id === id);
    document.getElementById('modalExamTitle').textContent = 'Bearbeiten';
    document.getElementById('examId').value = id;
    document.getElementById('examTitle').value = exam.title;
    document.getElementById('examCourse').value = exam.courseId;
    document.getElementById('examNote').value = exam.note || '';
    setExamType(exam.type);
    if (exam.type === 'klausur') {
      document.getElementById('examDate').value = exam.date || '';
      document.getElementById('examTime').value = exam.time || '';
      document.getElementById('examRoom').value = exam.room || '';
    } else {
      milestones = (exam.milestones || []).map(m => ({...m}));
      renderMilestoneInputs();
    }
    deleteBtn.classList.remove('hidden');
  } else {
    document.getElementById('modalExamTitle').textContent = 'Hinzufügen';
    document.getElementById('examId').value = '';
    document.getElementById('examTitle').value = '';
    document.getElementById('examNote').value = '';
    document.getElementById('examDate').value = '';
    document.getElementById('examTime').value = '';
    document.getElementById('examRoom').value = '';
    milestones = [];
    setExamType('klausur');
    renderMilestoneInputs();
    deleteBtn.classList.add('hidden');
  }
  modal.classList.add('open');
}

function closeExamModal() { document.getElementById('modalExam').classList.remove('open'); }

document.getElementById('openAddExam').addEventListener('click', () => openExamModal(null));
document.getElementById('closeExamModal').addEventListener('click', closeExamModal);
document.getElementById('cancelExamBtn').addEventListener('click', closeExamModal);
document.getElementById('modalExam').addEventListener('click', e => { if (e.target === e.currentTarget) closeExamModal(); });
document.getElementById('toggleKlausur').addEventListener('click', () => setExamType('klausur'));
document.getElementById('toggleProjekt').addEventListener('click', () => setExamType('projekt'));
document.getElementById('addMilestone').addEventListener('click', () => {
  milestones.push({ id: uid(), title: '', date: '' });
  renderMilestoneInputs();
});

document.getElementById('examForm').addEventListener('submit', e => {
  e.preventDefault();
  const id = document.getElementById('examId').value;
  const data = {
    type:     examType,
    courseId: document.getElementById('examCourse').value,
    title:    document.getElementById('examTitle').value.trim(),
    note:     document.getElementById('examNote').value.trim(),
    ...(examType === 'klausur'
      ? { date: document.getElementById('examDate').value,
          time: document.getElementById('examTime').value,
          room: document.getElementById('examRoom').value.trim() }
      : { milestones: milestones.filter(m => m.title && m.date) })
  };
  if (id) {
    const i = exams.findIndex(e => e.id === id);
    exams[i] = { id, ...data };
    dbUpsertExam(exams[i]);
  } else {
    const newExam = { id: uid(), ...data };
    exams.push(newExam);
    dbUpsertExam(newExam);
  }
  closeExamModal();
  renderExams();
  renderNextExamWidget();
});

document.getElementById('deleteExamBtn').addEventListener('click', () => {
  const id = document.getElementById('examId').value;
  if (!confirm('Eintrag löschen?')) return;
  exams = exams.filter(e => e.id !== id);
  dbDeleteExam(id);
  closeExamModal();
  renderExams();
  renderNextExamWidget();
});

function renderExams() {
  const list = document.getElementById('examsList');
  list.innerHTML = '';

  if (exams.length === 0) {
    list.innerHTML = `<div class="empty-state"><div style="font-size:40px">✎</div><p>Noch keine Klausuren oder Projekte eingetragen.</p></div>`;
    return;
  }

  const sorted = [...exams].sort((a, b) => {
    const da = a.type === 'klausur' ? a.date : (nextMilestone(a)?.date || '9999');
    const db = b.type === 'klausur' ? b.date : (nextMilestone(b)?.date || '9999');
    return da.localeCompare(db);
  });

  sorted.forEach(exam => {
    const course = courses.find(c => c.id === exam.courseId);
    const card = document.createElement('div');
    card.className = 'exam-card';

    const barColor = course?.color || 'var(--accent)';
    let dateHtml = '', milestonesHtml = '';

    if (exam.type === 'klausur') {
      const days = daysUntil(exam.date);
      const { text, cls } = countdownLabel(days);
      const dateFormatted = new Date(exam.date).toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'long', year:'numeric' });
      dateHtml = `<div class="exam-date-row">
        📅 ${dateFormatted}${exam.time ? ' · ' + exam.time + ' Uhr' : ''}${exam.room ? ' · ' + exam.room : ''}
        <span class="exam-countdown ${cls}">${text}</span>
      </div>`;
    } else {
      const ms = [...(exam.milestones||[])].sort((a,b) => a.date.localeCompare(b.date));
      const next = nextMilestone(exam);
      milestonesHtml = `<div class="milestone-list">${ms.map(m => {
        const past = daysUntil(m.date) < 0;
        const isNext = m.id === next?.id;
        const dateF = new Date(m.date).toLocaleDateString('de-DE', { day:'2-digit', month:'short' });
        return `<div class="milestone-item">
          <div class="milestone-dot ${past?'done':isNext?'next':''}"></div>
          <span class="milestone-title ${past?'done':''}">${m.title}</span>
          <span class="milestone-date">${dateF}</span>
          ${isNext ? '<span class="milestone-next-label">Nächste</span>' : ''}
        </div>`;
      }).join('')}</div>`;
    }

    card.innerHTML = `
      <div class="exam-card-bar" style="background:${barColor}"></div>
      <div class="exam-card-inner">
        <div class="exam-card-header">
          <div class="exam-card-title">${exam.title}</div>
          <span class="exam-badge ${exam.type === 'projekt' ? 'projekt' : ''}">${exam.type === 'klausur' ? 'Klausur' : 'Projekt'}</span>
        </div>
        <div class="exam-card-course">${course?.name || ''}</div>
        ${dateHtml}
        ${milestonesHtml}
        ${exam.note ? `<div class="exam-card-note">${exam.note}</div>` : ''}
      </div>`;
    card.addEventListener('click', () => openExamModal(exam.id));
    list.appendChild(card);
  });
}

function renderNextExamWidget() {
  const el = document.getElementById('nextExamWidget');
  if (!el) return;
  const today = new Date(); today.setHours(0,0,0,0);

  let upcoming = [];
  exams.forEach(e => {
    if (e.type === 'klausur') {
      const d = new Date(e.date); d.setHours(0,0,0,0);
      if (d >= today) upcoming.push({ title: e.title, date: e.date, days: daysUntil(e.date) });
    } else {
      const m = nextMilestone(e);
      if (m) upcoming.push({ title: `${e.title}: ${m.title}`, date: m.date, days: daysUntil(m.date) });
    }
  });

  upcoming.sort((a,b) => a.days - b.days);
  const next = upcoming[0];

  if (!next) { el.innerHTML = ''; return; }

  const dateF = new Date(next.date).toLocaleDateString('de-DE', { day:'2-digit', month:'short', year:'numeric' });
  el.innerHTML = `
    <div class="ne-label">Nächste Prüfung</div>
    <div class="ne-title">${next.title}</div>
    <div class="ne-date">${dateF}</div>
    <div class="ne-days">${next.days === 0 ? 'Heute!' : next.days === 1 ? 'Morgen' : `In ${next.days} Tagen`}</div>`;
}

function updateTimeIndicator() {
  const indicator = document.querySelector('.time-indicator');
  if (!indicator) return;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  if (nowMin >= DAY_START * 60 && nowMin < (DAY_START + HOURS.length) * 60) {
    indicator.style.top = minutesToPx(nowMin - DAY_START * 60) + 'px';
  }
}

// ── Now & Next ──
function renderNowNext() {
  const el = document.getElementById('nowNext');
  if (!el) return;

  const now   = new Date();
  const today = now.getDay();
  const dayIndex = today === 0 ? -1 : today - 1;
  const todayISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const nowMin   = now.getHours() * 60 + now.getMinutes();

  const todaysLessons = lessons.filter(l => {
    if (l.date) return l.date === todayISO;
    return l.day === dayIndex;
  }).sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));

  const current = todaysLessons.find(l =>
    timeToMinutes(l.start) <= nowMin && nowMin < timeToMinutes(l.end)
  );
  const next = todaysLessons.find(l => timeToMinutes(l.start) > nowMin);

  if (!current && !next) {
    el.innerHTML = dayIndex === -1
      ? `<div class="nn-empty">Wochenende 🎉</div>`
      : `<div class="nn-empty">Keine weiteren<br>Stunden heute</div>`;
    return;
  }

  let html = '';
  if (current) {
    const course = courses.find(c => c.id === current.courseId);
    const room   = current.room || course?.room || '';
    html += `<div class="nn-card is-now">
      <div class="nn-label">Jetzt</div>
      <div class="nn-name">${course?.name || '–'}</div>
      <div class="nn-time">${current.start}–${current.end}${room ? ' · ' + room : ''}</div>
    </div>`;
  }
  if (next) {
    const course = courses.find(c => c.id === next.courseId);
    const room   = next.room || course?.room || '';
    html += `<div class="nn-card">
      <div class="nn-label">Als nächstes</div>
      <div class="nn-name">${course?.name || '–'}</div>
      <div class="nn-time">${next.start}–${next.end}${room ? ' · ' + room : ''}</div>
    </div>`;
  }
  el.innerHTML = html;
}

// ── Mensa ──
let mensaOffset = 0;

function mensaLocalISO(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

async function fetchMensa(dateISO) {
  const list = document.getElementById('mensaList');
  const sub  = document.getElementById('mensaDate');
  list.innerHTML = '';

  const d = new Date(dateISO + 'T12:00:00');
  const dateLabel = d.toLocaleDateString('de-DE', { weekday:'long', day:'2-digit', month:'long', year:'numeric' });

  try {
    const res   = await fetch(`https://openmensa.org/api/v2/canteens/828/days/${dateISO}/meals`);
    if (!res.ok) throw new Error();
    const meals = await res.json();

    const filtered = (!meals || meals.length === 0) ? [] : meals.filter(m => m.name.trim().toLowerCase() !== 'tagesaktuell');

    if (filtered.length === 0) {
      sub.textContent = dateLabel + ' · Kein Speiseplan verfügbar';
      return;
    }

    sub.textContent = dateLabel;
    list.innerHTML = filtered.map(m => {
      const price = m.prices?.students ? `${m.prices.students.toFixed(2).replace('.',',')} €` : '–';
      return `<div class="mensa-card">
        <div class="mensa-card-left">
          <div class="mensa-category">${m.category}</div>
          <div class="mensa-name">${m.name}</div>
        </div>
        <div class="mensa-price">${price}</div>
      </div>`;
    }).join('');
  } catch {
    sub.textContent = dateLabel + ' · Speiseplan konnte nicht geladen werden';
  }
}

document.getElementById('mensaToday').addEventListener('click', () => { mensaOffset = 0; fetchMensa(mensaLocalISO(0)); });
document.getElementById('mensaPrev').addEventListener('click',  () => { mensaOffset--; fetchMensa(mensaLocalISO(mensaOffset)); });
document.getElementById('mensaNext').addEventListener('click',  () => { mensaOffset++; fetchMensa(mensaLocalISO(mensaOffset)); });

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
async function initApp() {
  await loadState();

  // Auto-seed Jason's preset data on first login
  const matrikel = currentUser.email.split('@')[0];
  if (matrikel === JASON_MATRIKEL && courses.length === 0) {
    await seedJason();
    await loadState();
  }

  updateGreeting();
  renderTimetable();
  renderNowNext();
  renderNextExamWidget();
  fetchWeather();
  setInterval(fetchWeather, 10 * 60 * 1000);
  setInterval(renderNowNext, 60 * 1000);
  setInterval(updateTimeIndicator, 60 * 1000);
}

// ── Search events ──
document.getElementById('searchBar').addEventListener('input', e => {
  handleSearch(e.target.value.trim());
});

document.getElementById('searchBar').addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    e.target.value = '';
    handleSearch('');
  }
});

initAuth();
