import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // GitHub Pages 專案網址：https://superbeeee.github.io/job-journey/
  base: '/job-journey/',
  plugins: [
    vue(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: '求職手帳 Job Journey',
        short_name: '求職手帳',
        description: '陪你走過求職路的溫暖手帳：投遞 KPI、面試排程與檢討、題庫、Offer 對照',
        lang: 'zh-Hant-TW',
        display: 'standalone',
        start_url: '.',
        background_color: '#fdf9f3',
        theme_color: '#f0641e',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // 全部都是靜態資源，直接預快取，離線也能開
        globPatterns: ['**/*.{js,css,html,png,svg}'],
        navigateFallback: null,
      },
    }),
  ],
})
