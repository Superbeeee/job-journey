<script setup>
import { computed, ref } from 'vue'
import { data, addQuestion, removeQuestion, showToast, openModal, confirmAction } from '../store'

const qText = ref('')
const qCompany = ref('')

function submit() {
  if (!qText.value.trim()) {
    showToast('先輸入題目內容')
    return
  }
  addQuestion(qText.value.trim(), qCompany.value.trim())
  qText.value = ''
  qCompany.value = ''
}

// 新的排前面
const questionsView = computed(() =>
  data.questions
    .slice()
    .reverse()
    .map((q, i) => ({ ...q, num: data.questions.length - i }))
)

function askRemove(q) {
  confirmAction({
    title: '刪除題目',
    message: `確定要刪除「${q.text}」嗎？${q.answer ? '回答筆記也會一併刪除。' : ''}`,
    confirmLabel: '刪除',
    action: () => removeQuestion(q.id),
  })
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-baseline justify-between flex-wrap gap-2">
      <div class="text-[22px] font-black">
        面試題庫 <span class="font-num text-sm text-sand-500 font-bold">{{ data.questions.length }} 題</span>
      </div>
      <div class="text-[12.5px] text-sand-500">把每次被問到的題目記下來，下次面試前複習 📖</div>
    </div>

    <div class="bg-white rounded-2xl px-[18px] py-4 shadow-[0_2px_10px_rgba(160,130,90,.08)] flex gap-2.5 flex-wrap">
      <input
        v-model="qText"
        @keyup.enter="submit"
        placeholder="被問了什麼？例：介紹一個你最有成就感的專案"
        class="flex-2 min-w-[220px] px-3.5 py-2.5 border-[1.5px] border-sand-200 rounded-xl text-[13.5px]"
      />
      <input
        v-model="qCompany"
        @keyup.enter="submit"
        placeholder="哪家公司問的（選填）"
        class="flex-1 min-w-[140px] px-3.5 py-2.5 border-[1.5px] border-sand-200 rounded-xl text-[13.5px]"
      />
      <button
        @click="submit"
        class="cursor-pointer px-5 py-2.5 bg-primary hover:bg-primary-dark text-white border-none rounded-xl text-[13.5px] font-bold"
      >
        記下來
      </button>
    </div>

    <div class="flex flex-col gap-[9px]">
      <div
        v-for="q in questionsView"
        :key="q.id"
        class="bg-white rounded-[14px] px-[17px] py-3.5 shadow-[0_2px_10px_rgba(160,130,90,.08)]"
      >
        <div class="flex items-start gap-3">
          <div class="font-num text-[13px] font-black text-[#e8cba6] min-w-[26px] pt-px">Q{{ q.num }}</div>
          <div class="flex-1 min-w-0">
            <div class="text-[14.5px] font-bold leading-[1.55]">{{ q.text }}</div>
            <div class="text-[11.5px] text-sand-500 mt-[3px]">
              {{ (q.company ? q.company + ' · ' : '') + q.date }}
            </div>
            <div
              v-if="q.answer"
              class="mt-2 px-3 py-[9px] bg-sand-50 rounded-[9px] text-[12.5px] text-[#6d6250] leading-[1.7]"
            >
              💡 {{ q.answer }}
            </div>
          </div>
          <button
            @click="openModal('answer', { qId: q.id, qText: q.text, answer: q.answer })"
            class="cursor-pointer bg-transparent border-[1.5px] border-sand-200 rounded-full px-3 py-[5px] text-[11.5px] font-bold text-sand-700 whitespace-nowrap"
          >
            {{ q.answer ? '✎ 編輯筆記' : '＋ 回答筆記' }}
          </button>
          <button
            @click="askRemove(q)"
            class="cursor-pointer bg-transparent border-none text-sand-400 text-[13px] hover:text-[#c0392b]"
          >
            ✕
          </button>
        </div>
      </div>
      <div
        v-if="data.questions.length === 0"
        class="p-9 border-[1.5px] border-dashed border-sand-300 rounded-2xl text-center text-sand-500 text-sm"
      >
        還沒有收錄題目。面試完趁記憶猶新，把被問到的都記下來吧！
      </div>
    </div>
  </div>
</template>
