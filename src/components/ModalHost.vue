<script setup>
import { reactive, ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  ui,
  closeModal,
  todayStr,
  findApp,
  roundLabel,
  addApplication,
  updateApplication,
  addInterview,
  updateInterview,
  saveReview,
  saveAnswer,
  importData,
  showToast,
  platform,
} from '../store'

const backupSteps = {
  ios: [
    '在分享面板選「儲存到檔案」，放進 iCloud Drive 資料夾（換手機也拿得回來）',
    '或選 LINE，傳到「自己」的聊天室',
  ],
  android: [
    '在分享面板選「雲端硬碟」，存進你的 Google Drive',
    '或選 LINE，傳到「自己」的聊天室',
  ],
  desktop: [
    '把下載的 JSON 檔搬進有雲端同步的資料夾（iCloud Drive／Google Drive／Dropbox）',
    '或用通訊軟體傳給自己，留一份在雲端',
  ],
}

const f = reactive({
  company: '', role: '', source: '', appDate: '',
  ivDate: '', ivTime: '', ivLoc: '', ivNote: '',
  rvRating: 0, rvGood: '', rvImprove: '',
  qAnswer: '',
})
const formError = ref(null)
const fileInput = ref(null)

const ctxApp = computed(() => findApp(ui.modalCtx.appId))
const ctxIv = computed(() => ctxApp.value?.interviews.find((i) => i.id === ui.modalCtx.ivId))
const isEdit = computed(() => !!ui.modalCtx.appId)

// modal 開啟時帶入既有資料
watch(
  () => ui.modal,
  (m) => {
    formError.value = null
    if (m === 'appForm') {
      const a = ctxApp.value
      f.company = a?.company || ''
      f.role = a?.role || ''
      f.source = a?.source || ''
      f.appDate = a?.createdAt || todayStr()
    } else if (m === 'ivForm') {
      const iv = ctxIv.value
      f.ivDate = iv?.date || ''
      f.ivTime = iv?.time || ''
      f.ivLoc = iv?.loc || ''
      f.ivNote = iv?.note || ''
    } else if (m === 'review') {
      const rv = ctxIv.value?.review
      f.rvRating = rv?.rating || 0
      f.rvGood = rv?.good || ''
      f.rvImprove = rv?.improve || ''
    } else if (m === 'answer') {
      f.qAnswer = ui.modalCtx.answer ?? ''
    }
  }
)

function submitAppForm() {
  if (!f.company.trim() || !f.role.trim()) {
    formError.value = '公司名稱和職稱是必填的唷'
    return
  }
  const fields = {
    company: f.company.trim(),
    role: f.role.trim(),
    source: f.source.trim(),
    createdAt: f.appDate || todayStr(),
  }
  if (isEdit.value) updateApplication(ui.modalCtx.appId, fields)
  else addApplication(fields)
  closeModal()
}

// Esc 關閉 modal
function onKeydown(e) {
  if (e.key === 'Escape' && ui.modal) closeModal()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

function submitIvForm() {
  if (!f.ivDate || !f.ivTime) {
    formError.value = '日期和時間是必填的唷'
    return
  }
  const fields = { date: f.ivDate, time: f.ivTime, loc: f.ivLoc.trim(), note: f.ivNote.trim() }
  if (ui.modalCtx.ivId) updateInterview(ui.modalCtx.appId, ui.modalCtx.ivId, fields)
  else addInterview(ui.modalCtx.appId, fields)
  closeModal()
}

function submitReview() {
  saveReview(ui.modalCtx.appId, ui.modalCtx.ivId, {
    rating: f.rvRating,
    good: f.rvGood.trim(),
    improve: f.rvImprove.trim(),
  })
  closeModal()
}

function submitAnswer() {
  saveAnswer(ui.modalCtx.qId, f.qAnswer.trim())
  closeModal()
}

function submitConfirm() {
  const action = ui.modalCtx.action
  closeModal()
  action?.()
}

function pickFile(mode) {
  ui.importMode = mode
  fileInput.value?.click()
}
function onImportFile(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    try {
      importData(JSON.parse(reader.result), ui.importMode)
    } catch (err) {
      showToast('無法讀取檔案，請確認是 JSON 備份')
    }
  }
  reader.readAsText(file)
  e.target.value = ''
}

// 回答筆記的題目文字
const answerQText = computed(() => ui.modalCtx.qText || '')
// 面試 modal 副標
const ivSubtitle = computed(() => {
  const a = ctxApp.value
  if (!a) return ''
  const round = ctxIv.value ? ctxIv.value.round : a.interviews.length + 1
  return a.company + ' · ' + a.role + ' · ' + roundLabel(round)
})
</script>

<template>
  <Transition name="modal">
  <div
    v-if="ui.modal"
    @click="closeModal"
    class="fixed inset-0 bg-[rgba(61,52,40,.42)] z-50 flex items-center justify-center p-5"
  >
    <div
      @click.stop
      class="modal-panel bg-white rounded-[22px] px-[26px] py-6 w-full max-w-[440px] shadow-[0_20px_60px_rgba(61,52,40,.3)] max-h-[85vh] overflow-auto"
    >
      <!-- 新增／編輯應徵紀錄 -->
      <template v-if="ui.modal === 'appForm'">
        <div class="text-lg font-black mb-1">{{ isEdit ? '編輯應徵紀錄' : '新增應徵紀錄' }}</div>
        <div class="text-[12.5px] text-sand-500 mb-4">
          {{ isEdit ? '改好按儲存就行' : '投出去的每一封，都是往前的一步 ✨' }}
        </div>
        <div class="flex flex-col gap-3">
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            公司名稱 *
            <input v-model="f.company" placeholder="例：Pinkoi" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm" />
          </label>
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            職稱 *
            <input v-model="f.role" placeholder="例：前端工程師" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm" />
          </label>
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            來源管道
            <input v-model="f.source" placeholder="例：104 / LinkedIn / 內推" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm" />
          </label>
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            投遞日期
            <input type="date" v-model="f.appDate" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm" />
          </label>
          <div v-if="formError" class="text-[12.5px] text-[#c0392b]">{{ formError }}</div>
          <div class="flex gap-[9px] mt-1">
            <button @click="submitAppForm" class="cursor-pointer flex-1 py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold">
              {{ isEdit ? '儲存變更' : '新增（今日投遞 +1）' }}
            </button>
            <button @click="closeModal" class="cursor-pointer px-[18px] py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
              取消
            </button>
          </div>
        </div>
      </template>

      <!-- 新增／編輯面試排程 -->
      <template v-else-if="ui.modal === 'ivForm'">
        <div class="text-lg font-black mb-1">{{ ui.modalCtx.ivId ? '編輯面試排程' : '新增面試排程' }}</div>
        <div class="text-[12.5px] text-sand-500 mb-4">{{ ivSubtitle }}</div>
        <div class="flex flex-col gap-3">
          <div class="flex gap-2.5">
            <label class="flex-1 flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
              日期 *
              <input type="date" v-model="f.ivDate" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm min-w-0" />
            </label>
            <label class="flex-1 flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
              時間 *
              <input type="time" v-model="f.ivTime" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm min-w-0" />
            </label>
          </div>
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            地點／形式
            <input v-model="f.ivLoc" placeholder="例：線上 Google Meet / 台北辦公室" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-sm" />
          </label>
          <label class="flex flex-col gap-[5px] text-xs text-sand-700 font-bold">
            準備筆記
            <textarea v-model="f.ivNote" rows="2" placeholder="例：複習上輪被問的題目、帶作品集" class="px-[13px] py-2.5 border-[1.5px] border-sand-200 rounded-[11px] text-[13.5px] resize-y"></textarea>
          </label>
          <div v-if="formError" class="text-[12.5px] text-[#c0392b]">{{ formError }}</div>
          <div class="flex gap-[9px] mt-1">
            <button @click="submitIvForm" class="cursor-pointer flex-1 py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold">
              {{ ui.modalCtx.ivId ? '儲存變更' : '加入排程' }}
            </button>
            <button @click="closeModal" class="cursor-pointer px-[18px] py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
              取消
            </button>
          </div>
        </div>
      </template>

      <!-- 面試檢討 -->
      <template v-else-if="ui.modal === 'review'">
        <div class="text-lg font-black mb-1">面試檢討</div>
        <div class="text-[12.5px] text-sand-500 mb-4">{{ ivSubtitle }} — 誠實面對，下次更好 💪</div>
        <div class="flex flex-col gap-3">
          <div>
            <div class="text-xs text-sand-700 font-bold mb-1.5">整體表現</div>
            <div class="flex gap-1.5">
              <button
                v-for="n in 5"
                :key="n"
                @click="f.rvRating = n"
                class="cursor-pointer bg-transparent border-none text-[27px] px-0.5 hover:scale-120"
                :style="{ color: n <= f.rvRating ? '#e8a33d' : '#e8dfd0' }"
              >
                ★
              </button>
            </div>
          </div>
          <label class="flex flex-col gap-[5px] text-xs text-leaf-deep font-bold">
            ✓ 做得好的地方
            <textarea v-model="f.rvGood" rows="2" placeholder="例：系統設計題答得有條理" class="px-[13px] py-2.5 border-[1.5px] border-leaf-border rounded-[11px] text-[13.5px] resize-y"></textarea>
          </label>
          <label class="flex flex-col gap-[5px] text-xs text-primary-deep font-bold">
            ↗ 待改善的地方
            <textarea v-model="f.rvImprove" rows="2" placeholder="例：自我介紹太長，控制在 90 秒內" class="px-[13px] py-2.5 border-[1.5px] border-[#f5dcc4] rounded-[11px] text-[13.5px] resize-y"></textarea>
          </label>
          <div class="flex gap-[9px] mt-1">
            <button @click="submitReview" class="cursor-pointer flex-1 py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold">
              儲存檢討
            </button>
            <button @click="closeModal" class="cursor-pointer px-[18px] py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
              取消
            </button>
          </div>
        </div>
      </template>

      <!-- 回答筆記 -->
      <template v-else-if="ui.modal === 'answer'">
        <div class="text-lg font-black mb-1">我的回答筆記</div>
        <div class="text-[12.5px] text-sand-500 mb-4 leading-[1.6]">{{ answerQText }}</div>
        <textarea
          v-model="f.qAnswer"
          rows="5"
          placeholder="寫下你理想的回答方式…"
          class="w-full box-border px-[13px] py-[11px] border-[1.5px] border-sand-200 rounded-[11px] text-[13.5px] resize-y leading-[1.7]"
        ></textarea>
        <div class="flex gap-[9px] mt-3.5">
          <button @click="submitAnswer" class="cursor-pointer flex-1 py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold">
            儲存
          </button>
          <button @click="closeModal" class="cursor-pointer px-[18px] py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
            取消
          </button>
        </div>
      </template>

      <!-- 匯入備份 -->
      <template v-else-if="ui.modal === 'import'">
        <div class="text-lg font-black mb-1">匯入備份</div>
        <div class="text-[12.5px] text-sand-500 mb-4 leading-[1.7]">
          選擇之前匯出的 JSON 備份檔。<b class="text-sand-700">合併</b>：保留現有資料並加入備份內容；<b class="text-sand-700">覆蓋</b>：完全以備份取代目前資料。
        </div>
        <input ref="fileInput" type="file" accept=".json,application/json" @change="onImportFile" class="hidden" />
        <div class="flex flex-col gap-[9px]">
          <button
            @click="pickFile('merge')"
            class="cursor-pointer text-left px-4 py-[13px] bg-white border-[1.5px] border-sand-200 rounded-[13px] text-sm font-bold text-ink hover:bg-sand-50"
          >
            🔀 選擇檔案並「合併」
          </button>
          <button
            @click="pickFile('replace')"
            class="cursor-pointer text-left px-4 py-[13px] bg-white border-[1.5px] border-[#f5d5c4] rounded-[13px] text-sm font-bold text-[#c0392b] hover:bg-[#fdf1ec]"
          >
            ♻ 選擇檔案並「覆蓋」<span class="text-[11.5px] font-medium text-[#d98a75]">（目前資料將被取代）</span>
          </button>
          <button @click="closeModal" class="cursor-pointer py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
            取消
          </button>
        </div>
      </template>

      <!-- 首次備份完成說明 -->
      <template v-else-if="ui.modal === 'backupTip'">
        <div class="text-lg font-black mb-1">🎉 完成第一次備份！</div>
        <div class="text-[12.5px] text-sand-500 mb-4 leading-[1.7]">
          備份檔在手，資料不怕丟。最後一步：把它放到安全的地方——
        </div>
        <div class="flex flex-col gap-2 mb-4">
          <div
            v-for="(step, i) in backupSteps[platform]"
            :key="i"
            class="flex items-start gap-2.5 px-3.5 py-3 bg-sand-50 rounded-[12px] text-[13px] leading-[1.6]"
          >
            <span class="font-num font-black text-primary">{{ i + 1 }}</span>
            <span>{{ step }}</span>
          </div>
        </div>
        <div class="text-[11.5px] text-sand-450 leading-[1.7] mb-4">
          之後每隔一陣子記得再匯出一次，「今日」頁也會提醒你 🧡
        </div>
        <button
          @click="closeModal"
          class="cursor-pointer w-full py-[11px] bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-sm font-extrabold"
        >
          知道了
        </button>
      </template>

      <!-- 確認對話框 -->
      <template v-else-if="ui.modal === 'confirm'">
        <div class="text-lg font-black mb-1">{{ ui.modalCtx.title }}</div>
        <div class="text-[13px] text-sand-700 mb-4 leading-[1.7]">{{ ui.modalCtx.message }}</div>
        <div class="flex gap-[9px]">
          <button @click="submitConfirm" class="cursor-pointer flex-1 py-[11px] bg-[#c0392b] hover:bg-[#a93226] text-white border-none rounded-xl text-sm font-extrabold">
            {{ ui.modalCtx.confirmLabel }}
          </button>
          <button @click="closeModal" class="cursor-pointer px-[18px] py-[11px] bg-sand-50 border-[1.5px] border-sand-200 text-sand-700 rounded-xl text-[13px] font-bold">
            取消
          </button>
        </div>
      </template>
    </div>
  </div>
  </Transition>
</template>
