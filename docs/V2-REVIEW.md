# 新版遊戲檢查說明

更新日期：2026-09-10。分支 `game-update-v2`；目前已由 GitHub Pages workflow 發布公開預覽。正式活動前仍須完成素材及現場驗收。

## 本機檢查

執行 `npm ci`、`npm run serve`，使用終端顯示的 localhost 網址。`/hub/?demo=1#/map` 可試地圖；`/board/?demo=1` 可看合成榜。示範資料不上傳。普通試玩未配置 Google 時只使用本機榜；沒有成功上傳的證書不顯示 QR。

新版包含 11 科玩法模組、共用本機姿態引擎、普通話本機錄音回播、39 段三語合成聲音，以及數學、常識、科學、人文、視藝、音樂、中文、普通話、體育與資訊新增場景。11 科選 10 科、6 分領證、10 分按有效時間排名；每科計時上限 240 秒。2026-09-10 已由 GitHub Pages workflow 發布 `game-update-v2`，公開入口為 [Hub](https://chilinbpscth.github.io/dino-island-open-day-2026/hub/)、[探險榜](https://chilinbpscth.github.io/dino-island-open-day-2026/board/) 及 [老師設定](https://chilinbpscth.github.io/dino-island-open-day-2026/setup/)。

## 已取得的驗證證據

- `npm test`：45 項單元測試通過，涵蓋計分、後台計時、媒體生命週期、指令、姿態判定與描寫；新增驗收頁使用實際 Apps Script 原始碼的本機測試，包含已有玩家／Top 10 已滿，並區分連線錯誤與時間驗證錯誤。
- `npm run test:browser`：同一參加者實際操作十科，驗證 5 分禁止領證、6 分證書、9 分未排名、10 分上本機榜、鎖關、虛擬拍照、待傳相片及換人。英文與普通話使用親子替代模式；榜單容量加入合成資料。
- `npm run test:offline`：預载後模擬離線重開、11 路由／素材、模型與語音、補傳佇列、普通證書及專案子路徑；老師設定頁亦會逐項核對實際快取，缺素材時不報完成。
- 各科瀏覽器測試與截圖在 `tests/`、`docs/screenshots/`；中文教育局動畫筆數／次序／方向核對在 `docs/chinese-stroke-sources.json`。
- 模型發布條款及來源在 `docs/pose-dependencies.json`；Google 官方模型卡明列 Apache 2.0，授權與出處已隨模型打包。

以上是桌面 Chromium、虛擬裝置或模擬環境的證據，不能取代現場驗收。完整製作歷程在 [GAME-UPDATE-V2.md](GAME-UPDATE-V2.md)，早期進度段落是當時紀錄，應以後續更新為準。

## 發布前仍需完成

- 補齊 29 項角色指定姿勢、恐龍朋友及機械小龍，見 [ASSET-REMAINING.md](ASSET-REMAINING.md)。英文站直／停定沿用既有幼龍，人文時光機使用原創 SVG；`design/game-assets/` 按科保存清單／提示。`drafts/` 圖片透明底不合格，沒有接入遊戲，不能視為成品。
- 教師核對 39 段讀音及中文教材字形；試聽頁為 `/design/audio/review.html`。合成聲檔已有，尚未教師批准。
- 真實 iPad 的全身動作辨識、觸控／橫直向、相機／咪權限及離線測試；家長手機下載、現場電視遠距可讀性、10 部裝置與 Google 同步／上傳負載。
- Apps Script 已於 2026-09-10 更新原部署至第 3 版，單站上限 240 秒；真實提交驗收仍待完成，前端尚未發布。
- 同日 Chrome ITSUPPORT 已完成真實 Google 驗收：七項計時、鎖站、探索及排名檢查全部通過；測試參加者「測試2806」（ID 見 [live-google-test-results.json](live-google-test-results.json)）暫留一行供老師核對後手動移除。相片上傳及 QR 下載仍未測試。
- 完成 Google 真實證書上傳、匿名下載、到期及換人驗收後，才發布新版並更新現場操作手冊。

Google 操作使用校方指定 ITSUPPORT 帳戶；不把装置寫入憑證放進公開程式碼。此文件不是正式交付完成聲明。
