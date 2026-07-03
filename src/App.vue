<script setup>
import { ref } from 'vue'
import { ui, data, clearSample, isInAppBrowser, platform } from './store'
import AppHeader from './components/AppHeader.vue'
import TodayView from './components/TodayView.vue'
import RecordsView from './components/RecordsView.vue'
import QuestionsView from './components/QuestionsView.vue'
import MeView from './components/MeView.vue'
import ModalHost from './components/ModalHost.vue'

const inAppDismissed = ref(false)
const browserName = platform === 'ios' ? 'Safari' : 'Chrome'
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />

    <main class="w-full max-w-[1080px] mx-auto px-4 py-5 sm:px-6 sm:py-6 box-border flex-1">
      <!-- App 內建瀏覽器警告 -->
      <div
        v-if="isInAppBrowser && !inAppDismissed"
        class="flex items-start gap-3 bg-[#fdf1ec] border-[1.5px] border-[#f5d5c4] rounded-[14px] px-4 py-3 mb-[18px] text-[13px] text-[#a04226] leading-[1.6]"
      >
        <span class="text-base">⚠️</span>
        <span class="flex-1">
          你正在 App 內建的瀏覽器中開啟，<b>紀錄的資料隨時可能被清掉</b>。建議點右上角「⋯」選單，改用
          {{ browserName }} 開啟並加入主畫面，資料才留得住。
        </span>
        <button
          @click="inAppDismissed = true"
          class="cursor-pointer bg-transparent border-none text-[#c9977f] text-[15px] leading-none"
          title="我知道了"
        >
          ✕
        </button>
      </div>

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

      <Transition name="view" mode="out-in">
        <TodayView v-if="ui.tab === 'today'" />
        <RecordsView v-else-if="ui.tab === 'records'" />
        <QuestionsView v-else-if="ui.tab === 'questions'" />
        <MeView v-else-if="ui.tab === 'me'" />
      </Transition>
    </main>

    <footer class="text-center p-5 text-[11.5px] text-sand-450">
      求職手帳 · 資料只存在你的瀏覽器 · 記得定期匯出備份 🧡
    </footer>

    <!-- toast -->
    <Transition name="toast">
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
