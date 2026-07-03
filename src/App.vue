<script setup>
import { ui, data, clearSample } from './store'
import AppHeader from './components/AppHeader.vue'
import TodayView from './components/TodayView.vue'
import RecordsView from './components/RecordsView.vue'
import QuestionsView from './components/QuestionsView.vue'
import MeView from './components/MeView.vue'
import ModalHost from './components/ModalHost.vue'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="w-full max-w-[1080px] mx-auto px-4 py-5 sm:px-6 sm:py-6 box-border flex-1">
      <!-- 範例資料提示 -->
      <div
        v-if="data.sample"
        class="flex flex-wrap items-center gap-3 bg-[#fff8e8] border-[1.5px] border-[#f2e2b8] rounded-[14px] px-4 py-3 mb-[18px] text-[13px] text-[#8a6d2f]"
      >
        <span>💡 目前顯示的是範例資料，讓你先感受操作方式。開始使用前可以一鍵清空。</span>
        <button
          @click="clearSample"
          class="cursor-pointer sm:ml-auto px-3.5 py-1.5 bg-ink text-white rounded-full text-xs font-bold whitespace-nowrap"
        >
          清空，開始我的紀錄
        </button>
      </div>

      <TodayView v-if="ui.tab === 'today'" />
      <RecordsView v-else-if="ui.tab === 'records'" />
      <QuestionsView v-else-if="ui.tab === 'questions'" />
      <MeView v-else-if="ui.tab === 'me'" />
    </main>

    <footer class="text-center p-5 text-[11.5px] text-sand-450">
      求職手帳 · 資料只存在你的瀏覽器 · 記得定期匯出備份 🧡
    </footer>

    <!-- toast -->
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="opacity-0 translate-y-2"
      leave-active-class="transition duration-200"
      leave-to-class="opacity-0 translate-y-2"
    >
      <div
        v-if="ui.toast"
        class="fixed bottom-[26px] left-1/2 -translate-x-1/2 bg-ink text-white px-[22px] py-[11px] rounded-full text-[13.5px] font-bold shadow-[0_8px_24px_rgba(61,52,40,.3)] z-60 whitespace-nowrap"
      >
        {{ ui.toast }}
      </div>
    </Transition>

    <ModalHost />
  </div>
</template>
