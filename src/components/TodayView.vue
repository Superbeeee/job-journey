<script setup>
import { computed } from 'vue'
import {
  data,
  ui,
  todayKey,
  nowTick,
  dayDiff,
  roundLabel,
  toggleHabit,
  incApply,
  decApply,
  exportIcs,
  icsEventFor,
  exportJson,
  backupMeta,
  showToast,
  openModal,
  REVIEW_REMIND_DAYS,
} from '../store'

const greeting = computed(() => {
  const h = new Date(nowTick.value).getHours()
  return (h < 11 ? '早安' : h < 18 ? '午安' : '晚安') + '！今天也一步一步來 ☀'
})
const dateLabel = computed(() => {
  const now = new Date(nowTick.value)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${now.getMonth() + 1} 月 ${now.getDate()} 日（${weekdays[now.getDay()]}）· 加油`
})

// ----- KPI -----
const todayCount = computed(() => data.applyLog[todayKey.value] || 0)
const kpiDash = computed(() => {
  const pct = Math.min(1, todayCount.value / data.kpiTarget)
  return (pct * 276).toFixed(0) + ' 276'
})
const streak = computed(() => {
  let n = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    if ((data.applyLog[key] || 0) > 0) n++
    else if (i === 0) continue // 今天還沒投遞不算斷
    else break
  }
  return n
})
const kpiMessage = computed(() => {
  const remain = data.kpiTarget - todayCount.value
  if (todayCount.value === 0) return '深呼吸，從第一封開始 🌤'
  if (remain > 0) return `再 ${remain} 封就達標，加油！🔥 連續 ${streak.value} 天有投遞`
  return `今日達標！🎉 連續 ${streak.value} 天有投遞`
})

// ----- 習慣 -----
const doneToday = computed(() => data.habitLog[todayKey.value] || [])
const habitsDone = computed(() => doneToday.value.filter((id) => data.habits.some((h) => h.id === id)).length)

// ----- 面試：即將到來／待檢討（比對到時分，面試一結束就轉入待檢討） -----
const allInterviews = computed(() => {
  const list = []
  data.applications.forEach((app) =>
    app.interviews.forEach((iv) => {
      if (!iv.date) return
      const ts = new Date(iv.date + 'T' + (iv.time || '23:59')).getTime()
      list.push({ app, iv, diff: dayDiff(iv.date), ts })
    })
  )
  return list
})
// 未來的面試（未切筆數，「全部匯出」用這份）
const futureInterviews = computed(() =>
  allInterviews.value
    .filter(({ iv, ts }) => ts >= nowTick.value && !iv.review)
    .sort((a, b) => a.ts - b.ts)
)
// 今日頁清單只顯示前 5 筆
const upcoming = computed(() => futureInterviews.value.slice(0, 5))
// 面試時間已過、還沒寫檢討的（保留 14 天）
const pendingReviews = computed(() =>
  allInterviews.value
    .filter(({ iv, ts, diff }) => ts < nowTick.value && diff >= -REVIEW_REMIND_DAYS && !iv.review)
    .sort((a, b) => b.ts - a.ts)
)
// 備份提醒：從沒備份過且已有一定資料量，或距上次備份超過 7 天且期間有變動
const BACKUP_REMIND_DAYS = 7
const BACKUP_MIN_APPS = 5
const backupReminder = computed(() => {
  if (data.sample) return null
  if (!backupMeta.lastBackupAt) {
    return data.applications.length >= BACKUP_MIN_APPS ? { first: true } : null
  }
  const days = Math.floor((Date.now() - new Date(backupMeta.lastBackupAt)) / 86400000)
  if (days >= BACKUP_REMIND_DAYS && backupMeta.changedSinceBackup > 0) return { first: false, days }
  return null
})

// Offer 回覆期限倒數
const offerDeadlines = computed(() =>
  data.applications
    .filter((a) => a.status === 'offer' && a.offer?.deadline)
    .map((a) => ({ app: a, diff: dayDiff(a.offer.deadline) }))
    .filter(({ diff }) => diff >= -3) // 過期 3 天內仍提醒
    .sort((a, b) => a.diff - b.diff)
)

function exportAllIcs() {
  if (futureInterviews.value.length === 0) {
    showToast('目前沒有排定的面試')
    return
  }
  exportIcs(futureInterviews.value.map(({ app, iv }) => icsEventFor(app, iv)))
}

function badgeFor(diff) {
  return diff === 0 ? '今天 ⏰' : diff === 1 ? '明天 ⏰' : diff + ' 天後'
}

function openReview(app, iv) {
  ui.tab = 'records'
  ui.selectedAppId = app.id
  openModal('review', { appId: app.id, ivId: iv.id })
}

// ----- Pipeline -----
const cnt = (st) => data.applications.filter((a) => a.status === st).length
const cApplied = computed(() => cnt('applied'))
const cInterviewing = computed(() => cnt('interviewing'))
const cOffer = computed(() => cnt('offer'))
const cClosed = computed(() => cnt('rejected') + cnt('ghosted'))

function goRecords(filter) {
  ui.filter = filter
  ui.tab = 'records'
}

// ----- 每日一句 -----
const quotes = [
  ['求職是馬拉松，不是短跑。', "You're doing better than you think."],
  ['被拒絕不代表你不好。', 'Rejection is redirection.'],
  ['每一封履歷，都是往前的一步。', 'Every application is a step forward.'],
  ['照顧好自己，機會才接得住。', 'Take care of yourself first.'],
  ['慢慢來，比較快。', 'Slow is smooth, smooth is fast.'],
]
const quote = quotes[Math.floor(Date.now() / 86400000) % quotes.length]
</script>

<template>
  <div class="flex flex-col gap-[18px]">
    <div class="flex items-end justify-between flex-wrap gap-3">
      <div>
        <div class="text-[25px] font-black">{{ greeting }}</div>
        <div class="font-num text-xs font-bold text-sand-500 tracking-[.06em] mt-[3px]">{{ dateLabel }}</div>
      </div>
      <button
        @click="openModal('appForm')"
        class="cursor-pointer px-5 py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-full text-sm font-bold shadow-[0_4px_12px_rgba(240,100,30,.28)]"
      >
        ＋ 新增應徵紀錄
      </button>
    </div>

    <!-- 提醒區：待檢討 + Offer 期限 + 備份 -->
    <div v-if="pendingReviews.length || offerDeadlines.length || backupReminder" class="flex flex-col gap-2">
      <button
        v-for="{ app, iv } in pendingReviews"
        :key="iv.id"
        @click="openReview(app, iv)"
        class="cursor-pointer text-left flex items-center gap-3 bg-primary-soft border-[1.5px] border-[#f5d5b8] rounded-[14px] px-4 py-3 text-[13px] text-primary-deep"
      >
        <span class="text-base">✍️</span>
        <span class="flex-1">
          <b>{{ app.company }}</b> 的{{ roundLabel(iv.round) }}（{{ iv.date }}）結束了，趁記憶猶新寫下檢討吧
        </span>
        <span class="px-3 py-1 bg-white rounded-full text-[11.5px] font-bold whitespace-nowrap">寫檢討 →</span>
      </button>
      <div
        v-for="{ app, diff } in offerDeadlines"
        :key="app.id"
        class="flex items-center gap-3 bg-leaf-soft border-[1.5px] border-leaf-border rounded-[14px] px-4 py-3 text-[13px] text-leaf-deep"
      >
        <span class="text-base">⏳</span>
        <span class="flex-1">
          <b>{{ app.company }}</b> 的 Offer
          <template v-if="diff > 0">回覆期限剩 <b>{{ diff }} 天</b>（{{ app.offer.deadline }}）</template>
          <template v-else-if="diff === 0">回覆期限就是<b>今天</b>！</template>
          <template v-else>回覆期限已過 {{ -diff }} 天，記得回覆對方</template>
        </span>
        <button
          @click="goRecords('offer')"
          class="cursor-pointer px-3 py-1 bg-white border-none rounded-full text-[11.5px] font-bold whitespace-nowrap text-leaf-deep"
        >
          查看 →
        </button>
      </div>
      <button
        v-if="backupReminder"
        @click="exportJson"
        class="cursor-pointer text-left flex items-center gap-3 bg-[#fff8e8] border-[1.5px] border-[#f2e2b8] rounded-[14px] px-4 py-3 text-[13px] text-[#8a6d2f]"
      >
        <span class="text-base">💾</span>
        <span class="flex-1">
          <template v-if="backupReminder.first">
            紀錄越來越多了！資料只存在這台裝置的瀏覽器裡，花 10 秒匯出一份備份吧
          </template>
          <template v-else>
            已經 <b>{{ backupReminder.days }} 天</b>沒備份了，這段時間的紀錄有變動，花 10 秒存一份吧
          </template>
        </span>
        <span class="px-3 py-1 bg-white rounded-full text-[11.5px] font-bold whitespace-nowrap">立即備份 →</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[minmax(280px,320px)_1fr] gap-4 items-stretch">
      <!-- KPI ring -->
      <div class="bg-white rounded-[20px] p-5 flex items-center gap-4 shadow-[0_2px_10px_rgba(160,130,90,.08)]">
        <svg width="104" height="104" viewBox="0 0 104 104" class="shrink-0">
          <circle cx="52" cy="52" r="44" fill="none" stroke="#f5e9d8" stroke-width="11" />
          <circle
            cx="52" cy="52" r="44" fill="none" stroke="#f0641e" stroke-width="11" stroke-linecap="round"
            :stroke-dasharray="kpiDash" transform="rotate(-90 52 52)" style="transition: stroke-dasharray 0.4s"
          />
          <text :key="todayCount" class="count-pop" x="52" y="49" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="24" fill="#3d3428">
            {{ todayCount }}
          </text>
          <text x="52" y="66" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="11" fill="#b09a7d">
            / {{ data.kpiTarget }}
          </text>
        </svg>
        <div class="flex-1">
          <div class="text-[15px] font-bold whitespace-nowrap">今日投遞 KPI</div>
          <div class="mt-[7px] text-[12.5px] text-primary-deep bg-primary-soft rounded-lg px-[9px] py-[5px]">
            {{ kpiMessage }}
          </div>
          <div class="flex gap-2 mt-2.5">
            <button
              @click="incApply"
              class="cursor-pointer flex-1 py-[9px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold"
            >
              ＋1 投了一封
            </button>
            <button
              @click="decApply"
              class="cursor-pointer w-10 bg-sand-50 border-[1.5px] border-sand-200 text-sand-600 rounded-xl text-[15px] font-bold"
            >
              −
            </button>
          </div>
        </div>
      </div>

      <!-- 生活習慣 -->
      <div class="bg-white rounded-[20px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
        <div class="flex justify-between items-baseline">
          <div class="text-[15px] font-bold whitespace-nowrap">
            生活習慣 <span class="text-[11px] text-sand-500 font-medium">Daily habits</span>
          </div>
          <div class="font-num text-xs font-extrabold text-leaf whitespace-nowrap">
            {{ habitsDone }} / {{ data.habits.length }} done
          </div>
        </div>
        <div class="flex gap-[9px] mt-[13px] flex-wrap">
          <button
            v-for="h in data.habits"
            :key="h.id"
            @click="toggleHabit(h.id)"
            class="cursor-pointer flex-1 min-w-[86px] flex flex-col items-center gap-1.5 px-1.5 py-3 rounded-[14px]"
            :class="
              doneToday.includes(h.id)
                ? 'bg-leaf-soft border-[1.5px] border-leaf-soft'
                : 'bg-sand-50 border-[1.5px] border-dashed border-sand-300'
            "
          >
            <div
              class="w-[26px] h-[26px] rounded-full text-white flex items-center justify-center text-sm box-border transition-colors duration-200"
              :class="doneToday.includes(h.id) ? 'bg-leaf' : 'bg-transparent border-2 border-sand-400'"
            >
              <span v-if="doneToday.includes(h.id)" class="check-in">✓</span>
            </div>
            <div
              class="text-xs font-medium whitespace-nowrap"
              :class="doneToday.includes(h.id) ? 'text-[#3d5c48]' : 'text-sand-600'"
            >
              {{ h.label }}
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-[1fr_minmax(260px,300px)] gap-4 items-start">
      <!-- 接下來的面試 -->
      <div class="bg-white rounded-[20px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
        <div class="flex justify-between items-baseline mb-3">
          <div class="text-[15px] font-bold whitespace-nowrap">
            接下來的面試 <span class="text-[11px] text-sand-500 font-medium">Upcoming</span>
          </div>
          <button
            @click="exportAllIcs"
            class="cursor-pointer bg-transparent border-none text-xs text-primary font-bold whitespace-nowrap"
          >
            📅 全部匯出 .ics
          </button>
        </div>
        <div class="flex flex-col gap-[9px]">
          <div
            v-for="{ app, iv, diff } in upcoming"
            :key="iv.id"
            class="flex items-center gap-3 px-4 py-3 rounded-[14px]"
            :class="diff <= 1 ? 'bg-primary-soft' : 'bg-sand-50'"
          >
            <div class="text-center min-w-[46px]" :class="diff <= 1 ? 'text-primary-deep' : 'text-sand-700'">
              <div class="font-num text-lg font-black">
                {{ parseInt(iv.date.slice(5, 7)) + '/' + parseInt(iv.date.slice(8, 10)) }}
              </div>
              <div class="text-[11px]">{{ iv.time }}</div>
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-bold">{{ app.company }} · {{ app.role }}</div>
              <div class="text-xs text-sand-600 truncate">
                {{ roundLabel(iv.round) + (iv.loc ? ' · ' + iv.loc : '') + (iv.note ? ' · ' + iv.note : '') }}
              </div>
            </div>
            <div
              class="px-2.5 py-1 bg-white rounded-full text-[11.5px] font-bold whitespace-nowrap"
              :class="diff <= 1 ? 'text-primary-deep' : 'text-sand-700'"
            >
              {{ badgeFor(diff) }}
            </div>
            <button
              @click="exportIcs([icsEventFor(app, iv)])"
              title="加入行事曆"
              class="cursor-pointer w-[34px] h-[34px] shrink-0 rounded-full bg-white border-[1.5px] border-sand-150 text-sm"
            >
              📅
            </button>
          </div>
          <div
            v-if="upcoming.length === 0"
            class="px-4 py-3.5 border-[1.5px] border-dashed border-sand-300 rounded-[14px] text-sand-500 text-[13px] text-center"
          >
            目前沒有排定的面試 — 收到邀請時到「紀錄」頁的公司卡片裡新增排程 ✨
          </div>
        </div>
      </div>

      <!-- 總覽 + 每日一句 -->
      <div class="flex flex-col gap-4">
        <div class="bg-white rounded-[20px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
          <div class="text-[15px] font-bold mb-[11px] whitespace-nowrap">
            總覽 <span class="text-[11px] text-sand-500 font-medium">Pipeline</span>
          </div>
          <div class="flex flex-col gap-2 text-[13px]">
            <button @click="goRecords('applied')" class="cursor-pointer border-none flex justify-between px-[13px] py-[9px] bg-sand-50 rounded-[10px] text-[13px]">
              <span class="text-sand-700">📮 已投遞</span><span class="font-num font-black">{{ cApplied }}</span>
            </button>
            <button @click="goRecords('interviewing')" class="cursor-pointer border-none flex justify-between px-[13px] py-[9px] bg-primary-soft rounded-[10px] text-[13px]">
              <span class="text-primary-deep">💬 面試中</span><span class="font-num font-black text-primary-deep">{{ cInterviewing }}</span>
            </button>
            <button @click="goRecords('offer')" class="cursor-pointer border-none flex justify-between px-[13px] py-[9px] bg-leaf-soft rounded-[10px] text-[13px]">
              <span class="text-leaf-deep">🎉 Offer</span><span class="font-num font-black text-leaf-deep">{{ cOffer }}</span>
            </button>
            <button @click="goRecords('closed')" class="cursor-pointer border-none flex justify-between px-[13px] py-[9px] bg-stone-soft rounded-[10px] text-[13px]">
              <span class="text-stone-fg">🗂 已結束</span><span class="font-num font-black text-stone-fg">{{ cClosed }}</span>
            </button>
          </div>
        </div>

        <div class="bg-linear-160 from-[#f0641e] to-[#e04e2a] rounded-[20px] px-5 py-[18px] text-white">
          <div class="text-xl">🌱</div>
          <div class="text-[14.5px] font-bold leading-[1.6] mt-1.5">{{ quote[0] }}</div>
          <div class="text-[11px] opacity-85 mt-[5px]">{{ quote[1] }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
