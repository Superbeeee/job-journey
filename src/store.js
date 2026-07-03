import { reactive, ref, watch } from 'vue'

const LS_KEY = 'job-journey-v1'

// ---------- 日期工具 ----------
export function todayStr(d = new Date()) {
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

// 與今天相差的天數（正數 = 未來）
export function dayDiff(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return Math.round((d - t) / 86400000)
}

export function uid() {
  return 'x' + Math.random().toString(36).slice(2, 9)
}

// ---------- 狀態定義 ----------
export const STATUS_META = {
  applied: { label: '已投遞', bg: '#faf5ec', fg: '#7a6a52' },
  interviewing: { label: '面試中', bg: '#fdeadb', fg: '#c75c14' },
  offer: { label: 'Offer 🎉', bg: '#eef7f0', fg: '#3d7a52' },
  rejected: { label: '婉拒', bg: '#f3f0eb', fg: '#a09582' },
  ghosted: { label: '無回應', bg: '#f3f0eb', fg: '#a09582' },
}

export function roundLabel(n) {
  return ['一面', '二面', '三面', '四面', '五面'][n - 1] || n + ' 面'
}

// 投遞超過這個天數、又沒有任何面試，就提示可能已無回應
export const GHOST_HINT_DAYS = 14
// 面試結束後回顧提醒保留的天數
export const REVIEW_REMIND_DAYS = 14

// ---------- 預設資料 ----------
function emptyData() {
  return {
    sample: false,
    kpiTarget: 20,
    habits: [
      { id: 'h1', label: '7:30 起床' },
      { id: 'h2', label: '運動 30 分' },
      { id: 'h3', label: '刷題 1 題' },
    ],
    habitLog: {},
    applyLog: {},
    applications: [],
    questions: [],
    conditions: [],
  }
}

function sampleData() {
  const today = todayStr()
  const at = (offset) => {
    const d = new Date()
    d.setDate(d.getDate() + offset)
    return todayStr(d)
  }
  return {
    sample: true,
    kpiTarget: 20,
    habits: [
      { id: 'h1', label: '7:30 起床' },
      { id: 'h2', label: '運動 30 分' },
      { id: 'h3', label: '刷題 1 題' },
      { id: 'h4', label: '閱讀 20 分' },
      { id: 'h5', label: '12 點前睡' },
    ],
    habitLog: { [today]: ['h1', 'h2', 'h3'] },
    applyLog: { [today]: 12, [at(-1)]: 21 },
    applications: [
      {
        id: 'a1',
        company: 'Pinkoi',
        role: '前端工程師',
        source: '104',
        createdAt: at(-6),
        status: 'interviewing',
        statusHistory: [
          { status: 'applied', at: at(-6) },
          { status: 'interviewing', at: at(-2) },
        ],
        interviews: [
          {
            id: 'i1',
            round: 1,
            date: at(-1),
            time: '14:00',
            loc: '線上 Google Meet',
            note: '',
            review: { rating: 4, good: '專案經驗講得清楚', improve: '對測試策略的回答可以更具體' },
          },
          {
            id: 'i2',
            round: 2,
            date: at(1),
            time: '14:00',
            loc: '線上 Google Meet',
            note: '主管面談，複習 React rendering',
            review: null,
          },
        ],
        offer: {},
      },
      {
        id: 'a2',
        company: 'Dcard',
        role: 'Frontend Engineer',
        source: 'LinkedIn',
        createdAt: at(-4),
        status: 'interviewing',
        statusHistory: [
          { status: 'applied', at: at(-4) },
          { status: 'interviewing', at: at(-1) },
        ],
        interviews: [
          { id: 'i3', round: 1, date: at(5), time: '10:30', loc: '現場 · 記得帶作品集', note: '', review: null },
        ],
        offer: {},
      },
      {
        id: 'a3',
        company: 'Hahow',
        role: '前端工程師',
        source: '內推',
        createdAt: at(-10),
        status: 'offer',
        statusHistory: [
          { status: 'applied', at: at(-10) },
          { status: 'interviewing', at: at(-5) },
          { status: 'offer', at: at(-1) },
        ],
        interviews: [
          {
            id: 'i4',
            round: 1,
            date: at(-1),
            time: '10:00',
            loc: '線上',
            note: '',
            review: { rating: 5, good: '整體節奏掌握得很好', improve: '薪資談判可以更堅定' },
          },
        ],
        offer: { salary: '月薪 62K × 14', deadline: at(5), note: '', met: {} },
      },
      {
        id: 'a4',
        company: 'CloudMile',
        role: '前端工程師',
        source: '104',
        createdAt: at(-8),
        status: 'rejected',
        statusHistory: [
          { status: 'applied', at: at(-8) },
          { status: 'interviewing', at: at(-3) },
          { status: 'rejected', at: at(-1) },
        ],
        interviews: [
          {
            id: 'i5',
            round: 1,
            date: at(-1),
            time: '15:00',
            loc: '線上',
            note: '',
            review: { rating: 3, good: '系統設計題答得不錯', improve: '自我介紹太長，下次控制在 90 秒內' },
          },
        ],
        offer: {},
      },
      {
        id: 'a5',
        company: '91APP',
        role: '前端工程師',
        source: '104',
        createdAt: at(-16),
        status: 'applied',
        statusHistory: [{ status: 'applied', at: at(-16) }],
        interviews: [],
        offer: {},
      },
      {
        id: 'a6',
        company: 'LINE Taiwan',
        role: 'Web Developer',
        source: '官網',
        createdAt: today,
        status: 'applied',
        statusHistory: [{ status: 'applied', at: today }],
        interviews: [],
        offer: {},
      },
    ],
    questions: [
      { id: 'q1', text: '介紹一個你最有成就感的專案', company: 'Pinkoi', answer: '用 STAR 法：情境→任務→行動→成果，控制在 2 分鐘內。', date: today },
      { id: 'q2', text: 'React 的 re-render 時機有哪些？如何優化？', company: 'Pinkoi', answer: '', date: today },
      { id: 'q3', text: '你為什麼想離開上一份工作？', company: 'CloudMile', answer: '往正向動機講：想要的成長，而不是抱怨前公司。', date: today },
    ],
    conditions: [
      { id: 'c1', text: '月薪 60K 以上', must: true },
      { id: 'c2', text: '可遠端 2 天/週', must: true },
      { id: 'c3', text: '有 code review 文化', must: true },
      { id: 'c4', text: '通勤 40 分內', must: false },
      { id: 'c5', text: '年終保障 1 個月+', must: false },
    ],
  }
}

// ---------- 資料正規化：補齊缺漏欄位，避免匯入壞資料後 crash ----------
function normalize(raw) {
  const base = emptyData()
  if (!raw || typeof raw !== 'object') return base
  const data = { ...base, ...raw }

  data.sample = !!data.sample
  data.kpiTarget = Math.max(1, parseInt(data.kpiTarget) || 20)
  if (typeof data.habitLog !== 'object' || data.habitLog === null || Array.isArray(data.habitLog)) data.habitLog = {}
  if (typeof data.applyLog !== 'object' || data.applyLog === null || Array.isArray(data.applyLog)) data.applyLog = {}

  const arr = (v) => (Array.isArray(v) ? v : [])
  data.habits = arr(data.habits)
    .filter((h) => h && h.id)
    .map((h) => ({ id: h.id, label: String(h.label || '') }))
  data.questions = arr(data.questions)
    .filter((q) => q && q.id)
    .map((q) => ({
      id: q.id,
      text: String(q.text || ''),
      company: String(q.company || ''),
      answer: String(q.answer || ''),
      date: q.date || todayStr(),
    }))
  data.conditions = arr(data.conditions)
    .filter((c) => c && c.id)
    .map((c) => ({ id: c.id, text: String(c.text || ''), must: !!c.must }))
  data.applications = arr(data.applications)
    .filter((a) => a && a.id)
    .map((a) => ({
      id: a.id,
      company: String(a.company || ''),
      role: String(a.role || ''),
      source: String(a.source || ''),
      createdAt: a.createdAt || todayStr(),
      status: STATUS_META[a.status] ? a.status : 'applied',
      statusHistory: arr(a.statusHistory).filter((s) => s && s.status && s.at),
      interviews: arr(a.interviews)
        .filter((iv) => iv && iv.id)
        .map((iv) => ({
          id: iv.id,
          round: iv.round || 1,
          date: iv.date || '',
          time: iv.time || '',
          loc: String(iv.loc || ''),
          note: String(iv.note || ''),
          review: iv.review && typeof iv.review === 'object'
            ? {
                rating: Math.min(5, Math.max(1, parseInt(iv.review.rating) || 3)),
                good: String(iv.review.good || ''),
                improve: String(iv.review.improve || ''),
              }
            : null,
        })),
      offer: a.offer && typeof a.offer === 'object' ? { met: {}, ...a.offer } : {},
    }))
  return data
}

// ---------- 載入與持久化 ----------
function load() {
  let raw = null
  try {
    raw = JSON.parse(localStorage.getItem(LS_KEY))
  } catch (e) {
    /* 壞資料當作沒有 */
  }
  return raw ? normalize(raw) : sampleData()
}

export const data = reactive(load())

// ---------- 備份狀態（獨立於資料本體，不隨匯入覆蓋） ----------
const META_KEY = 'job-journey-backup-meta'
function loadMeta() {
  try {
    const m = JSON.parse(localStorage.getItem(META_KEY))
    if (m && typeof m === 'object') {
      return { lastBackupAt: m.lastBackupAt || null, changedSinceBackup: m.changedSinceBackup || 0 }
    }
  } catch (e) {}
  return { lastBackupAt: null, changedSinceBackup: 0 }
}
export const backupMeta = reactive(loadMeta())

watch(backupMeta, (m) => {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(m))
  } catch (e) {}
})

watch(
  data,
  (d) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(d))
    } catch (e) {
      /* 空間滿了也不要讓 app 掛掉 */
    }
    backupMeta.changedSinceBackup++
  },
  { deep: true }
)

// ---------- UI 狀態 ----------
export const ui = reactive({
  tab: 'today',
  filter: 'all',
  selectedAppId: null,
  modal: null, // 'appForm' | 'ivForm' | 'review' | 'answer' | 'import' | 'confirm'
  modalCtx: {},
  toast: null,
  importMode: 'merge',
})

// 「今天」的 key 做成 reactive：跨日或切回分頁時自動更新
export const todayKey = ref(todayStr())
function refreshToday() {
  const t = todayStr()
  if (todayKey.value !== t) todayKey.value = t
}
setInterval(refreshToday, 30_000)
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) refreshToday()
})

// ---------- Toast ----------
let toastTimer = null
export function showToast(msg) {
  ui.toast = msg
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => (ui.toast = null), 2400)
}

// ---------- Modal ----------
export function openModal(name, ctx = {}) {
  ui.modal = name
  ui.modalCtx = ctx
}
export function closeModal() {
  ui.modal = null
  ui.modalCtx = {}
}
export function confirmAction({ title, message, confirmLabel = '確定', action }) {
  openModal('confirm', { title, message, confirmLabel, action })
}

// ---------- 應徵紀錄 ----------
export function findApp(id) {
  return data.applications.find((a) => a.id === id)
}

export function addApplication({ company, role, source }) {
  const id = uid()
  const today = todayKey.value
  data.applications.unshift({
    id,
    company,
    role,
    source,
    createdAt: today,
    status: 'applied',
    statusHistory: [{ status: 'applied', at: today }],
    interviews: [],
    offer: {},
  })
  data.applyLog[today] = (data.applyLog[today] || 0) + 1
  ui.selectedAppId = id
  showToast('已記錄！今日投遞 +1 🧡')
}

export function updateApplication(id, fields) {
  const app = findApp(id)
  if (!app) return
  Object.assign(app, fields)
  showToast('已更新 ✓')
}

export function removeApplication(id) {
  data.applications = data.applications.filter((a) => a.id !== id)
  if (ui.selectedAppId === id) ui.selectedAppId = null
  showToast('已刪除')
}

export function setStatus(app, status) {
  if (app.status === status) return
  app.status = status
  app.statusHistory.push({ status, at: todayKey.value })
  if (status === 'offer') {
    app.offer = app.offer || {}
    app.offer.met = app.offer.met || {}
    showToast('恭喜拿到 Offer！🎉🎉')
  }
}

// ---------- 面試排程 ----------
// 依日期時間排序後重編輪次，編輯／刪除後編號不會亂
function renumberRounds(app) {
  app.interviews
    .slice()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .forEach((iv, i) => (iv.round = i + 1))
  app.interviews.sort((a, b) => a.round - b.round)
}

export function addInterview(appId, { date, time, loc, note }) {
  const app = findApp(appId)
  if (!app) return
  app.interviews.push({ id: uid(), round: 0, date, time, loc, note, review: null })
  renumberRounds(app)
  if (app.status === 'applied') setStatus(app, 'interviewing')
  showToast('面試已排入！記得匯出 .ics 加入行事曆 📅')
}

export function updateInterview(appId, ivId, { date, time, loc, note }) {
  const app = findApp(appId)
  const iv = app && app.interviews.find((i) => i.id === ivId)
  if (!iv) return
  Object.assign(iv, { date, time, loc, note })
  renumberRounds(app)
  showToast('面試排程已更新 ✓')
}

export function removeInterview(appId, ivId) {
  const app = findApp(appId)
  if (!app) return
  app.interviews = app.interviews.filter((i) => i.id !== ivId)
  renumberRounds(app)
  showToast('已刪除面試排程')
}

export function saveReview(appId, ivId, { rating, good, improve }) {
  const app = findApp(appId)
  const iv = app && app.interviews.find((i) => i.id === ivId)
  if (!iv) return
  iv.review = { rating: rating || 3, good, improve }
  showToast('檢討已儲存，你又進步了一點 💪')
}

// ---------- 今日 KPI ----------
export function incApply() {
  const t = todayKey.value
  data.applyLog[t] = (data.applyLog[t] || 0) + 1
}
export function decApply() {
  const t = todayKey.value
  data.applyLog[t] = Math.max(0, (data.applyLog[t] || 0) - 1)
}
export function setKpiTarget(v) {
  data.kpiTarget = Math.max(1, parseInt(v) || 1)
}

// ---------- 生活習慣 ----------
export function toggleHabit(habitId) {
  const t = todayKey.value
  const arr = data.habitLog[t] || []
  data.habitLog[t] = arr.includes(habitId) ? arr.filter((x) => x !== habitId) : arr.concat(habitId)
}
export function addHabit(label) {
  if (data.habits.length >= 6) {
    showToast('習慣建議不超過 6 個，小而穩定就好 🌱')
    return false
  }
  data.habits.push({ id: uid(), label })
  return true
}
export function removeHabit(id) {
  data.habits = data.habits.filter((h) => h.id !== id)
}

// ---------- 題庫 ----------
export function addQuestion(text, company) {
  data.questions.push({ id: uid(), text, company, answer: '', date: todayKey.value })
  showToast('已收錄 ✓')
}
export function saveAnswer(qId, answer) {
  const q = data.questions.find((x) => x.id === qId)
  if (q) q.answer = answer
  showToast('筆記已儲存 ✓')
}
export function removeQuestion(id) {
  data.questions = data.questions.filter((x) => x.id !== id)
}

// ---------- 求職條件 ----------
export function addCondition(text) {
  data.conditions.push({ id: uid(), text, must: false })
}
export function toggleConditionMust(id) {
  const c = data.conditions.find((x) => x.id === id)
  if (c) c.must = !c.must
}
export function removeCondition(id) {
  data.conditions = data.conditions.filter((x) => x.id !== id)
}

// ---------- 範例資料 ----------
export function clearSample() {
  Object.assign(data, emptyData())
  showToast('已清空，開始屬於你的紀錄 🧡')
}

// ---------- .ics 匯出 ----------
export function exportIcs(events) {
  const esc = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//JobJourney//TW']
  events.forEach((ev) => {
    const dt = ev.date.replace(/-/g, '') + 'T' + (ev.time || '09:00').replace(':', '') + '00'
    lines.push(
      'BEGIN:VEVENT',
      'UID:' + uid() + '@jobjourney',
      'DTSTART:' + dt,
      'DURATION:PT1H',
      'SUMMARY:' + esc(ev.title),
      'DESCRIPTION:' + esc(ev.desc),
      'LOCATION:' + esc(ev.loc),
      'END:VEVENT'
    )
  })
  lines.push('END:VCALENDAR')
  download(new Blob([lines.join('\r\n')], { type: 'text/calendar' }), 'interviews.ics')
  showToast('已下載 .ics，開啟即可加入行事曆 📅')
}

export function icsEventFor(app, iv) {
  return {
    date: iv.date,
    time: iv.time,
    title: app.company + ' 面試（' + roundLabel(iv.round) + '）· ' + app.role,
    loc: iv.loc,
    desc: iv.note,
  }
}

// ---------- 備份匯出／匯入 ----------
function download(blob, filename) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

// ---------- 平台偵測與備份建議 ----------
export const platform = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  ? 'ios'
  : /Android/i.test(navigator.userAgent)
    ? 'android'
    : 'desktop'

// App 內建瀏覽器（Threads/IG/FB/LINE/Messenger）：localStorage 隨時可能被清，提醒改用真正的瀏覽器
export const isInAppBrowser = /Barcelona|Instagram|FBAN|FBAV|FB_IAB|Line\/|MicroMessenger|Twitter/i.test(
  navigator.userAgent
)

// 向瀏覽器要求持久儲存，降低 localStorage 被自動清除的機率（iOS 7 天政策等）
navigator.storage?.persist?.().catch(() => {})

export function backupTip() {
  if (platform === 'ios') return '建議存到「檔案」的 iCloud Drive，或用 LINE 傳給自己 📁'
  if (platform === 'android') return '建議存到 Google Drive，或用 LINE 傳給自己 📁'
  return '建議放進有雲端同步的資料夾（iCloud／Google Drive），多一層保障 📁'
}

function markBackedUp() {
  const isFirst = !backupMeta.lastBackupAt
  backupMeta.lastBackupAt = new Date().toISOString()
  backupMeta.changedSinceBackup = 0
  if (isFirst) openModal('backupTip')
  else showToast('已匯出備份 ✓ ' + backupTip())
}

export async function exportJson() {
  const filename = 'job-journey-backup-' + todayKey.value + '.json'
  const json = JSON.stringify(data, null, 2)
  const file = new File([json], filename, { type: 'application/json' })

  // 手機優先用系統分享面板：可直接存到 iCloud Drive／Google Drive／LINE
  if (platform !== 'desktop' && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: '求職手帳備份' })
      markBackedUp()
      return
    } catch (e) {
      if (e.name === 'AbortError') return // 使用者取消分享，不算完成備份
      /* 分享失敗改走下載 */
    }
  }
  download(new Blob([json], { type: 'application/json' }), filename)
  markBackedUp()
}

export function importData(incoming, mode) {
  if (!incoming || !Array.isArray(incoming.applications)) {
    showToast('檔案格式不對，請選擇本站匯出的備份')
    return
  }
  const clean = normalize(incoming)
  if (mode === 'replace') {
    Object.assign(data, clean)
    showToast('已覆蓋匯入 ✓')
  } else {
    const mergeArr = (a, b) => {
      const ids = new Set(a.map((x) => x.id))
      return a.concat(b.filter((x) => !ids.has(x.id)))
    }
    data.applications = mergeArr(data.applications, clean.applications)
    data.questions = mergeArr(data.questions, clean.questions)
    data.conditions = mergeArr(data.conditions, clean.conditions)
    data.habits = mergeArr(data.habits, clean.habits)
    Object.entries(clean.applyLog).forEach(([k, v]) => {
      data.applyLog[k] = Math.max(data.applyLog[k] || 0, v)
    })
    Object.entries(clean.habitLog).forEach(([k, v]) => {
      data.habitLog[k] = Array.from(new Set([...(data.habitLog[k] || []), ...v]))
    })
    data.sample = false
    showToast('已合併匯入 ✓')
  }
  closeModal()
}
