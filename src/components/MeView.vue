<script setup>
import { computed, ref } from 'vue'
import {
  data,
  addCondition,
  toggleConditionMust,
  removeCondition,
  addHabit,
  removeHabit,
  setKpiTarget,
  exportJson,
  backupMeta,
  backupTip,
  openModal,
} from '../store'

const condText = ref('')
const habitText = ref('')

function submitCondition() {
  if (!condText.value.trim()) return
  addCondition(condText.value.trim())
  condText.value = ''
}
function submitHabit() {
  if (!habitText.value.trim()) return
  if (addHabit(habitText.value.trim())) habitText.value = ''
}

const lastBackupLabel = computed(() => {
  if (!backupMeta.lastBackupAt) return '還沒備份過'
  const d = new Date(backupMeta.lastBackupAt)
  const days = Math.floor((Date.now() - d) / 86400000)
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return `上次備份：${dateStr}` + (days === 0 ? '（今天）' : `（${days} 天前）`)
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-[22px] font-black">我的設定</div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
      <!-- 求職條件 -->
      <div class="bg-white rounded-[18px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
        <div class="text-[15px] font-bold mb-1">我的求職條件</div>
        <div class="text-xs text-sand-500 mb-3">收到 Offer 時逐項對照，幫自己做決定</div>
        <div class="flex flex-col gap-2 mb-3">
          <div
            v-for="c in data.conditions"
            :key="c.id"
            class="flex items-center gap-[9px] px-3 py-[9px] bg-sand-50 rounded-[11px]"
          >
            <button
              @click="toggleConditionMust(c.id)"
              class="cursor-pointer border-none text-[11px] px-2.5 py-[3px] rounded-full font-bold whitespace-nowrap"
              :class="c.must ? 'bg-primary text-white' : 'bg-sand-300 text-sand-700'"
            >
              {{ c.must ? '必要' : '加分' }}
            </button>
            <span class="flex-1 text-[13.5px] font-medium">{{ c.text }}</span>
            <button
              @click="removeCondition(c.id)"
              class="cursor-pointer bg-transparent border-none text-sand-400 text-[13px] hover:text-[#c0392b]"
            >
              ✕
            </button>
          </div>
        </div>
        <div class="flex gap-2">
          <input
            v-model="condText"
            @keyup.enter="submitCondition"
            placeholder="例：月薪 60K 以上"
            class="flex-1 min-w-0 px-[13px] py-[9px] border-[1.5px] border-sand-200 rounded-[11px] text-[13px]"
          />
          <button
            @click="submitCondition"
            class="cursor-pointer px-4 py-[9px] bg-ink text-white border-none rounded-[11px] text-[12.5px] font-bold whitespace-nowrap"
          >
            新增
          </button>
        </div>
        <div class="text-[11px] text-sand-450 mt-[7px]">點「必要／加分」標籤可切換優先度</div>
      </div>

      <div class="flex flex-col gap-4">
        <!-- 每日目標 + 習慣清單 -->
        <div class="bg-white rounded-[18px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
          <div class="text-[15px] font-bold mb-3">每日目標</div>
          <label class="flex items-center gap-3 text-[13.5px]">
            每天投遞
            <input
              type="number"
              min="1"
              :value="data.kpiTarget"
              @change="setKpiTarget($event.target.value)"
              class="w-[70px] px-[11px] py-2 border-[1.5px] border-sand-200 rounded-[10px] text-sm font-bold text-center"
            />
            封
          </label>
          <div class="h-[1.5px] bg-sand-100 my-[15px]"></div>
          <div class="text-[15px] font-bold mb-1">生活習慣清單</div>
          <div class="text-xs text-sand-500 mb-2.5">建議 3–5 個，小而穩定就好</div>
          <div class="flex flex-col gap-[7px] mb-2.5">
            <div
              v-for="h in data.habits"
              :key="h.id"
              class="flex items-center gap-[9px] px-3 py-2 bg-sand-50 rounded-[10px]"
            >
              <span class="flex-1 text-[13px] font-medium">{{ h.label }}</span>
              <button
                @click="removeHabit(h.id)"
                class="cursor-pointer bg-transparent border-none text-sand-400 text-[13px] hover:text-[#c0392b]"
              >
                ✕
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              v-model="habitText"
              @keyup.enter="submitHabit"
              placeholder="例：運動 30 分"
              class="flex-1 min-w-0 px-[13px] py-[9px] border-[1.5px] border-sand-200 rounded-[11px] text-[13px]"
            />
            <button
              @click="submitHabit"
              class="cursor-pointer px-4 py-[9px] bg-ink text-white border-none rounded-[11px] text-[12.5px] font-bold whitespace-nowrap"
            >
              新增
            </button>
          </div>
        </div>

        <!-- 資料備份 -->
        <div class="bg-white rounded-[18px] px-5 py-[18px] shadow-[0_2px_10px_rgba(160,130,90,.08)]">
          <div class="text-[15px] font-bold mb-1">資料備份</div>
          <div class="text-xs text-sand-500 leading-[1.7] mb-2">
            所有資料只儲存在這台裝置的瀏覽器裡。建議定期匯出備份，換裝置或清瀏覽器資料前務必先匯出！{{ backupTip() }}
          </div>
          <div
            class="text-xs font-bold mb-3"
            :class="backupMeta.lastBackupAt ? 'text-leaf-deep' : 'text-primary-deep'"
          >
            {{ lastBackupLabel }}
          </div>
          <div class="flex gap-2 flex-wrap">
            <button
              @click="exportJson"
              class="cursor-pointer px-4 py-[9px] bg-primary hover:bg-primary-dark text-white border-none rounded-[11px] text-[12.5px] font-bold"
            >
              ⬇ 匯出 JSON 備份
            </button>
            <button
              @click="openModal('import')"
              class="cursor-pointer px-4 py-[9px] bg-white border-[1.5px] border-sand-200 text-sand-700 rounded-[11px] text-[12.5px] font-bold"
            >
              ⬆ 匯入備份
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
