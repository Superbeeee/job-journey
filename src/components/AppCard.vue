<script setup>
import { computed } from 'vue'
import {
  data,
  ui,
  dayDiff,
  roundLabel,
  STATUS_META,
  GHOST_HINT_DAYS,
  setStatus,
  removeApplication,
  removeInterview,
  confirmAction,
  openModal,
  exportIcs,
  icsEventFor,
} from '../store'
import { expandEnter, expandLeave } from '../transitions'

const props = defineProps({ app: { type: Object, required: true } })

const selected = computed(() => ui.selectedAppId === props.app.id)
const meta = computed(
  () =>
    (props.app.source ? props.app.source + ' · ' : '') +
    '投遞於 ' +
    props.app.createdAt +
    ' · 面試 ' +
    props.app.interviews.length +
    ' 輪'
)
// 投遞已久且無面試 → 提示可能無回應（不自動改狀態，由使用者決定）
const ghostHint = computed(
  () =>
    props.app.status === 'applied' &&
    props.app.interviews.length === 0 &&
    -dayDiff(props.app.createdAt) >= GHOST_HINT_DAYS
)
const daysSinceApplied = computed(() => -dayDiff(props.app.createdAt))

function toggleSelect() {
  ui.selectedAppId = selected.value ? null : props.app.id
}

function askRemoveApp() {
  confirmAction({
    title: '刪除應徵紀錄',
    message: `確定要刪除「${props.app.company}」的整筆紀錄嗎？面試排程和檢討也會一併刪除。`,
    confirmLabel: '刪除',
    action: () => removeApplication(props.app.id),
  })
}

function askRemoveInterview(iv) {
  confirmAction({
    title: '刪除面試排程',
    message: `確定要刪除 ${roundLabel(iv.round)}（${iv.date}）嗎？${iv.review ? '已寫的檢討也會一併刪除。' : ''}`,
    confirmLabel: '刪除',
    action: () => removeInterview(props.app.id, iv.id),
  })
}

const setOffer = (key) => (e) => {
  props.app.offer[key] = e.target.value
}
function toggleCondMet(condId) {
  props.app.offer.met = props.app.offer.met || {}
  props.app.offer.met[condId] = !props.app.offer.met[condId]
}
</script>

<template>
  <div
    class="bg-white rounded-2xl shadow-[0_2px_10px_rgba(160,130,90,.08)] overflow-hidden border-[1.5px] transition-[box-shadow,border-color] duration-300 hover:shadow-[0_4px_16px_rgba(160,130,90,.15)]"
    :class="selected ? 'border-[#f0d9c2]' : 'border-transparent'"
  >
    <button
      @click="toggleSelect"
      class="cursor-pointer w-full border-none bg-transparent flex items-center gap-3.5 px-[18px] py-[15px] text-left"
    >
      <div
        class="w-10 h-10 rounded-xl flex items-center justify-center text-base font-black shrink-0"
        :class="selected ? 'bg-primary text-white' : 'bg-sand-50 text-sand-500'"
      >
        {{ (app.company || '?').slice(0, 1) }}
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-[15px] font-bold">
          {{ app.company }} <span class="font-medium text-sand-600">· {{ app.role }}</span>
        </div>
        <div class="text-xs text-sand-500 mt-0.5">{{ meta }}</div>
        <div v-if="ghostHint" class="text-xs text-primary-deep mt-1">
          🔕 已投遞 {{ daysSinceApplied }} 天沒有消息，要標成「無回應」嗎？
        </div>
      </div>
      <div
        class="px-3 py-[5px] rounded-full text-xs font-bold whitespace-nowrap"
        :style="{ background: STATUS_META[app.status].bg, color: STATUS_META[app.status].fg }"
      >
        {{ STATUS_META[app.status].label }}
      </div>
      <div class="text-sand-400 text-[13px] transition-transform duration-300" :class="{ 'rotate-180': selected }">▼</div>
    </button>

    <Transition :css="false" @enter="expandEnter" @leave="expandLeave">
    <div v-if="selected" class="border-t-[1.5px] border-sand-100 px-[18px] py-4 flex flex-col gap-3.5 bg-[#fefcf8]">
      <!-- 狀態列 -->
      <div class="flex items-center gap-2.5 flex-wrap">
        <span class="text-[12.5px] text-sand-600 font-bold">狀態</span>
        <button
          v-for="(m, st) in STATUS_META"
          :key="st"
          @click="setStatus(app, st)"
          class="cursor-pointer px-[13px] py-1.5 rounded-full text-xs font-bold border-[1.5px] whitespace-nowrap"
          :class="app.status === st ? 'bg-ink text-white border-ink' : 'border-transparent'"
          :style="app.status === st ? {} : { background: m.bg, color: m.fg }"
        >
          {{ m.label }}
        </button>
        <div class="ml-auto flex gap-3">
          <button
            @click="openModal('appForm', { appId: app.id })"
            class="cursor-pointer bg-transparent border-none text-sand-600 text-xs hover:text-primary-deep"
          >
            ✎ 編輯
          </button>
          <button
            @click="askRemoveApp"
            class="cursor-pointer bg-transparent border-none text-sand-450 text-xs hover:text-[#c0392b]"
          >
            🗑 刪除
          </button>
        </div>
      </div>

      <!-- 面試輪次 -->
      <div>
        <div class="flex justify-between items-baseline mb-2">
          <div class="text-[13.5px] font-bold">面試輪次</div>
          <button
            @click="openModal('ivForm', { appId: app.id })"
            class="cursor-pointer bg-transparent border-none text-primary text-[12.5px] font-bold"
          >
            ＋ 新增面試排程
          </button>
        </div>
        <div class="flex flex-col gap-2">
          <div
            v-for="iv in app.interviews"
            :key="iv.id"
            class="border-[1.5px] border-sand-150 rounded-xl px-3.5 py-[11px] bg-white"
          >
            <div class="flex items-center gap-2.5 flex-wrap">
              <span class="text-[11px] bg-ink text-white px-[9px] py-0.5 rounded-full font-bold whitespace-nowrap">
                {{ roundLabel(iv.round) }}
              </span>
              <span class="text-[13px] font-bold">{{ iv.date }} {{ iv.time }}</span>
              <span class="text-xs text-sand-600">{{ iv.loc }}</span>
              <div class="ml-auto flex gap-1.5 flex-wrap">
                <button
                  @click="exportIcs([icsEventFor(app, iv)])"
                  class="cursor-pointer px-[11px] py-[5px] bg-sand-50 border-[1.5px] border-sand-200 rounded-full text-[11.5px] font-bold text-sand-700 whitespace-nowrap"
                >
                  📅 .ics
                </button>
                <button
                  @click="openModal('ivForm', { appId: app.id, ivId: iv.id })"
                  class="cursor-pointer px-[11px] py-[5px] bg-white border-[1.5px] border-sand-200 rounded-full text-[11.5px] font-bold text-sand-700 whitespace-nowrap"
                >
                  ✎ 編輯
                </button>
                <button
                  @click="openModal('review', { appId: app.id, ivId: iv.id })"
                  class="cursor-pointer px-[11px] py-[5px] rounded-full text-[11.5px] font-bold border-[1.5px] whitespace-nowrap"
                  :class="
                    iv.review
                      ? 'bg-white border-sand-200 text-sand-700'
                      : 'bg-primary-soft border-[#f5d5b8] text-primary-deep'
                  "
                >
                  {{ iv.review ? '✎ 編輯檢討' : '✎ 寫檢討' }}
                </button>
                <button
                  @click="askRemoveInterview(iv)"
                  class="cursor-pointer px-2 bg-transparent border-none text-sand-450 text-[13px] hover:text-[#c0392b]"
                  title="刪除排程"
                >
                  ✕
                </button>
              </div>
            </div>
            <div v-if="iv.note" class="text-xs text-sand-600 mt-1.5">📝 {{ iv.note }}</div>
            <div
              v-if="iv.review"
              class="mt-[9px] px-3 py-2.5 bg-sand-50 rounded-[10px] text-[12.5px] leading-[1.7] text-[#6d6250]"
            >
              <span class="text-[#e8a33d] tracking-[2px]">
                {{ '★'.repeat(iv.review.rating) + '☆'.repeat(5 - iv.review.rating) }}
              </span>
              <div><b class="text-leaf-deep">✓ 做得好：</b>{{ iv.review.good || '—' }}</div>
              <div><b class="text-primary-deep">↗ 待改善：</b>{{ iv.review.improve || '—' }}</div>
            </div>
          </div>
          <div v-if="app.interviews.length === 0" class="text-[12.5px] text-sand-500 px-0.5 py-1">
            還沒有面試排程 — 收到邀請就記下來吧！
          </div>
        </div>
      </div>

      <!-- Offer 紀錄 -->
      <div
        v-if="app.status === 'offer'"
        class="border-[1.5px] border-leaf-border bg-[#f4faf5] rounded-[14px] px-4 py-3.5"
      >
        <div class="text-[13.5px] font-black text-leaf-deep mb-2.5">🎉 Offer 紀錄</div>
        <div class="flex gap-2.5 flex-wrap mb-3">
          <label class="flex flex-col gap-1 text-[11.5px] text-sand-700 font-bold">
            薪資條件
            <input
              :value="app.offer.salary || ''"
              @change="setOffer('salary')($event)"
              placeholder="例：月薪 62K × 14"
              class="px-[11px] py-2 border-[1.5px] border-[#d8e5dc] rounded-[9px] text-[13px] w-[170px] bg-white"
            />
          </label>
          <label class="flex flex-col gap-1 text-[11.5px] text-sand-700 font-bold">
            回覆期限
            <input
              type="date"
              :value="app.offer.deadline || ''"
              @change="setOffer('deadline')($event)"
              class="px-[11px] py-2 border-[1.5px] border-[#d8e5dc] rounded-[9px] text-[13px] bg-white"
            />
          </label>
          <label class="flex flex-col gap-1 text-[11.5px] text-sand-700 font-bold flex-1 min-w-[180px]">
            備註
            <input
              :value="app.offer.note || ''"
              @change="setOffer('note')($event)"
              placeholder="其他福利、談薪筆記…"
              class="px-[11px] py-2 border-[1.5px] border-[#d8e5dc] rounded-[9px] text-[13px] bg-white"
            />
          </label>
        </div>
        <div class="text-xs font-bold text-sand-700 mb-[7px]">對照我的求職條件：</div>
        <div class="flex flex-wrap gap-[7px]">
          <button
            v-for="c in data.conditions"
            :key="c.id"
            @click="toggleCondMet(c.id)"
            class="cursor-pointer px-[13px] py-1.5 rounded-full text-xs font-bold border-[1.5px] whitespace-nowrap"
            :class="
              app.offer.met?.[c.id]
                ? 'bg-leaf border-leaf text-white'
                : c.must
                  ? 'bg-white border-[#f0d9c2] text-primary-deep'
                  : 'bg-white border-[#e8e2d5] text-sand-600'
            "
          >
            {{ app.offer.met?.[c.id] ? '✓' : '○' }} {{ c.text }}
          </button>
          <div v-if="data.conditions.length === 0" class="text-xs text-sand-500">
            還沒設定求職條件 — 到「我的」頁新增，收 Offer 時就能逐項對照
          </div>
        </div>
      </div>
    </div>
    </Transition>
  </div>
</template>
