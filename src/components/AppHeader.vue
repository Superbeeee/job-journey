<script setup>
import { ui, exportJson, openModal } from '../store'

const tabs = [
  { key: 'today', label: '🏠 今日' },
  { key: 'records', label: '📋 紀錄' },
  { key: 'questions', label: '📝 題庫' },
  { key: 'me', label: '👤 我的' },
]
</script>

<template>
  <header class="bg-white border-b-[1.5px] border-sand-150 sticky top-0 z-20">
    <div class="max-w-[1080px] mx-auto px-4 sm:px-6 py-3 flex items-center gap-3 sm:gap-5 flex-wrap">
      <div class="flex items-center gap-[9px]">
        <div
          class="w-[34px] h-[34px] rounded-[10px] bg-primary text-white flex items-center justify-center text-[17px] shadow-[0_3px_8px_rgba(240,100,30,.3)]"
        >
          ☀
        </div>
        <div>
          <div class="text-base font-black leading-[1.1]">求職手帳</div>
          <div class="font-num text-[9.5px] font-bold text-sand-500 tracking-[.08em]">JOB JOURNEY</div>
        </div>
      </div>

      <div class="flex gap-2 ml-auto sm:order-last">
        <button
          @click="exportJson"
          class="cursor-pointer px-3.5 py-2 bg-white border-[1.5px] border-sand-200 text-sand-700 rounded-full text-xs font-bold whitespace-nowrap hover:bg-sand-50"
        >
          ⬇ 匯出備份
        </button>
        <button
          @click="openModal('import')"
          class="cursor-pointer px-3.5 py-2 bg-white border-[1.5px] border-sand-200 text-sand-700 rounded-full text-xs font-bold whitespace-nowrap hover:bg-sand-50"
        >
          ⬆ 匯入
        </button>
      </div>

      <nav class="flex gap-1 w-full sm:w-auto sm:flex-1 overflow-x-auto">
        <button
          v-for="t in tabs"
          :key="t.key"
          @click="ui.tab = t.key"
          class="cursor-pointer border-none px-4 py-[9px] rounded-full text-sm font-bold whitespace-nowrap transition-colors"
          :class="ui.tab === t.key ? 'bg-ink text-white' : 'bg-transparent text-sand-600 hover:bg-sand-50'"
        >
          {{ t.label }}
        </button>
      </nav>
    </div>
  </header>
</template>
