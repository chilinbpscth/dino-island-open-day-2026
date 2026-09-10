# 新版遊戲檢查說明

更新日期：2026-09-10。分支 `game-update-v2`；目前已由 GitHub Pages workflow 發布公開預覽。原缺漏角色素材已補齊，正式活動前仍須完成完整範圍核對及現場驗收。

後台現況：已部署 v7，包含寫入鎖內提交及減少重複讀取修正；真實十連線測試仍未通過，不能視為活動就緒。前端亦已修正證書提早越過成績同步的問題。原到期測試證書已由排程刪除；兩批負載測試探險者已移出榜，14 份合成證書已由 17:46:58 排程刪檔，私人資料夾已清空。詳細證據見 [BACKEND-FOLLOWUP.md](BACKEND-FOLLOWUP.md)、[live-load-v6-results.json](live-load-v6-results.json) 及 [load-test-cleanup.json](load-test-cleanup.json)。

數學已按最新要求改為三種水果辨認及分開數量餵食，詳見 [MATH-FRUIT-UPDATE.md](MATH-FRUIT-UPDATE.md)。最新建置 163 項離線資源；以下較早版本號保留作測試歷程。

## 本機檢查

執行 `npm ci`、`npm run serve`，使用終端顯示的 localhost 網址。`/hub/?demo=1#/map` 可試地圖；`/board/?demo=1` 可看合成榜。示範資料不上傳。普通試玩未配置 Google 時只使用本機榜；沒有成功上傳的證書不顯示 QR。

新版包含 11 科玩法模組、共用本機姿態引擎、普通話本機錄音回播、45 段三語合成聲音，以及數學、常識、科學、人文、視藝、音樂、中文、普通話、體育與資訊新增場景。11 科選 10 科、6 分領證、10 分按有效時間排名；每科計時上限 240 秒。2026-09-10 已由 GitHub Pages workflow 發布 `game-update-v2`，公開入口為 [Hub](https://chilinbpscth.github.io/dino-island-open-day-2026/hub/)、[探險榜](https://chilinbpscth.github.io/dino-island-open-day-2026/board/) 及 [老師設定](https://chilinbpscth.github.io/dino-island-open-day-2026/setup/)。

## 已取得的驗證證據

- `npm test`：49 項單元測試通過，涵蓋計分、後台計時、媒體生命週期、指令、姿態判定、描寫及試算表鎖內提交；驗收頁使用實際 Apps Script 原始碼的本機測試，包含已有玩家／Top 10 已滿，並區分連線錯誤與時間驗證錯誤。
- `npm run test:browser`：同一參加者實際操作十科，驗證 5 分禁止領證、6 分證書、9 分未排名、10 分上本機榜、鎖關、虛擬拍照、待傳相片及換人。英文與普通話使用親子替代模式；榜單容量加入合成資料。
- `npm run test:offline`：預載後模擬離線重開、11 路由／素材、模型與語音、補傳佇列、普通證書及專案子路徑；老師設定頁亦會逐項核對實際快取，缺素材時不報完成。
- 各科瀏覽器測試與截圖在 `tests/`、`docs/screenshots/`；中文教育局動畫筆數／次序／方向核對在 `docs/chinese-stroke-sources.json`。
- 模型發布條款及來源在 `docs/pose-dependencies.json`；Google 官方模型卡明列 Apache 2.0，授權與出處已隨模型打包。
- 遊戲版本 `e3eed9eacd83` 已通過 49 項單元測試、十科完整流程及離線流程。新增老師試聽頁後，建置包含 157 項離線資源，版本 `5a04b6e6ad2e`，離線流程再次通過；遊戲程式未改動。建置會清除輸出資料夾舊檔，避免撤下的錯誤圖留在部署套件。公開同步及證書程式已逐檔比對本機內容一致，發布版本以 GitHub Pages workflow 及線上 manifest 為準。
- `node tests/sync-queue.mjs`：先重現同步重入提早返回，再確認並行呼叫等待最新成績、過舊回覆不清佇列、繁忙保留進度，以及證書等成績確認後先上傳。`node tests/network.mjs` 另驗證模擬跨來源回覆；以上唔代表真實 Google 負載達標。
- 數學模擬觸控拖放／取消、地圖完成標籤及未同步文案、拍照合成失敗／重拍恢復均已新增瀏覽器測試。合成失敗不再沿用上一張普通證書；重拍可產生 1600×2000 JPEG。
- 真實 Google 測試證書已上傳並取回，JPEG 完全一致；重用請求 ID 可取得同一份證書。全新桌面 Chromium 環境（起始零 cookies）亦已免登入顯示證書，按儲存成功下載 1600×2000 JPEG，檔案與顯示圖片逐位元組一致。詳見 [live-certificate-test-results.json](live-certificate-test-results.json) 及 [anonymous-certificate-test-results.json](anonymous-certificate-test-results.json)；仍未代表手機實機測試。

遊戲操作證據來自桌面 Chromium、虛擬裝置或模擬環境；Google 證書段落則為真實後台操作。兩者均不能取代現場 iPad／手機驗收。完整製作歷程在 [GAME-UPDATE-V2.md](GAME-UPDATE-V2.md)，早期進度段落是當時紀錄，應以本頁現況及對應測試紀錄為準。

## 發布前仍需完成

- 原缺漏角色清單已清空，見 [ASSET-REMAINING.md](ASSET-REMAINING.md)。已批准程式去背後的 1024px RGBA 成品在 `hub/img/games/`，原始稿及奶油底檢查圖保留在 `design/game-assets/drafts/`，不直接部署草稿。各科 manifest 保存最終提示詞及接入記錄。仍需依原更新文件完成逐項交付審查，不能單憑缺檔數為零宣告完成。
- 教師核對 45 段讀音及中文教材字形；[老師試聽頁](https://chilinbpscth.github.io/dino-island-open-day-2026/setup/audio-review.html) 已加入部署套件及設備頁連結。45 個 WAV 連結、專案子路徑及切換播放已用桌面瀏覽器核對；合成聲檔尚未教師批准，頁面不收集核對結果。
- 真實 iPad 的全身動作辨識、觸控／橫直向、相機／咪權限及離線測試；家長手機下載、現場電視遠距可讀性、10 部裝置與 Google 同步／上傳負載。
- Apps Script 第 7 版已部署，單站上限 240 秒。Chrome ITSUPPORT 已完成七項真實計時、鎖站、探索及排名檢查；測試參加者「測試2806」（ID 見 [live-google-test-results.json](live-google-test-results.json)）暫留供老師核對。最新十連線新批次只有 5／10 份證書完成核對，存在鎖等待及逾時；未達 10 秒目標。
- 原證書已實測過期拒絕下載、排程刪檔，以及已刪除請求重試不能復用舊連結。乾淨未登入桌面環境已通過；仍須完成家長手機掃 QR／儲存、實機換人及負載驗收；14 份測試證書及舊未引用測試檔案已確認清理，見 [live-cleanup-verified.json](live-cleanup-verified.json)。
- 目前是已公開的預覽版；上述驗收及完整範圍核對完成後，才可宣告開放日交付完成。

Google 操作使用校方指定 ITSUPPORT 帳戶；不把裝置寫入憑證放進公開程式碼。此文件不是正式交付完成聲明。
