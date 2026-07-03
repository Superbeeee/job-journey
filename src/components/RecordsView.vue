<script setup>
import { computed } from 'vue'
import { data, ui, openModal } from '../store'
import AppCard from './AppCard.vue'

const filters = [
  ['all', '全部'],
  ['applied', '📮 已投遞'],
  ['interviewing', '💬 面試中'],
  ['offer', '🎉 Offer'],
  ['closed', '🗂 已結束'],
]

const filteredApps = computed(() =>
  data.applications.filter((a) => {
    if (ui.filter === 'all') return true
    if (ui.filter === 'closed') return a.status === 'rejected' || a.status === 'ghosted'
    return a.status === ui.filter
  })
)
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="text-[22px] font-black">應徵紀錄</div>
      <button
        @click="openModal('appForm')"
        class="cursor-pointer px-[18px] py-2.5 bg-primary hover:bg-primary-dark text-white border-none rounded-full text-[13.5px] font-bold shadow-[0_4px_12px_rgba(240,100,30,.28)]"
      >
        ＋ 新增應徵紀錄
      </button>
    </div>

    <div class="flex gap-2 flex-wrap">
      <button
        v-for="[key, label] in filters"
        :key="key"
        @click="ui.filter = key"
        class="cursor-pointer px-[15px] py-[7px] rounded-full text-[12.5px] font-bold border-[1.5px] whitespace-nowrap"
        :class="ui.filter === key ? 'bg-ink text-white border-ink' : 'bg-white text-sand-700 border-sand-200'"
      >
        {{ label }}
      </button>
    </div>

    <TransitionGroup name="list" tag="div" class="relative flex flex-col gap-2.5">
      <AppCard v-for="app in filteredApps" :key="app.id" :app="app" />
      <div
        v-if="filteredApps.length === 0"
        key="empty"
        class="p-9 border-[1.5px] border-dashed border-sand-300 rounded-2xl text-center text-sand-500 text-sm"
      >
        這個分類還沒有紀錄。每一封投出去的履歷，都值得被記下來 ✨
      </div>
    </TransitionGroup>
  </div>
</template>
