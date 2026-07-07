# ☀️ 求職手帳 Job Journey

陪你走過求職路的溫暖手帳。免費、不用註冊、打開就能用。

**👉 立即使用：https://superbeeee.github.io/job-journey/**

<img src="public/og.png" alt="求職手帳預覽" width="600" />

## 這是什麼？

找工作是一場馬拉松。求職手帳幫你把過程中的每一步都記下來、看得見進度，也照顧好自己：

- **🏠 今日** — 每日投遞 KPI 圓環、連續投遞天數、生活習慣打卡、面試提醒、待檢討提醒、Offer 回覆期限倒數
- **📋 紀錄** — 應徵紀錄卡片：狀態追蹤（已投遞／面試中／Offer／婉拒／無回應）、面試排程（可匯出 .ics 加入行事曆）、每輪面試檢討（星等＋做得好／待改善）、Offer 條件對照
- **📝 題庫** — 把被問過的面試題收集起來，寫下理想回答，下次面試前複習
- **👤 我的** — 求職條件清單（收 Offer 時逐項對照）、每日目標、習慣清單、資料備份

## 資料與隱私

**所有資料只存在你自己瀏覽器的 localStorage 裡**，不會上傳到任何伺服器——沒有帳號、沒有追蹤、沒有人看得到你的求職紀錄。

因此請記得**定期匯出 JSON 備份**（app 內建提醒），並建議：

- iPhone：存到「檔案」的 iCloud Drive
- Android：存到 Google Drive
- 或用 LINE 傳給自己

換裝置或清瀏覽器資料前，務必先匯出！

### 📱 手機使用建議

用 Safari／Chrome 開啟後**加入主畫面**（PWA），像 app 一樣使用，離線也能開，資料也更不容易被系統清掉。請避免長期在 Threads／IG／LINE 的內建瀏覽器中使用。

## 本機開發

```bash
npm install
npm run dev     # 開發伺服器
npm run build   # 建置到 dist/
```

技術棧：[Vue 3](https://vuejs.org/)（Composition API）+ [Tailwind CSS v4](https://tailwindcss.com/) + [Vite](https://vite.dev/) + [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)，無後端。

推到 `main` 會由 GitHub Actions 自動部署到 GitHub Pages。

---

用得開心的話，歡迎分享給也在找工作的朋友 🧡
