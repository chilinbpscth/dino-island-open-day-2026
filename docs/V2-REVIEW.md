# 新版遊戲檢查說明

更新日期：2026-09-10。分支 `game-update-v2`；目前已由 GitHub Pages workflow 發布公開預覽。原缺漏角色素材已補齊，正式活動前仍須完成完整範圍核對及現場驗收。

## 本機檢查

執行 `npm ci`、`npm run serve`，使用終端顯示的 localhost 網址。`/hub/?demo=1#/map` 可試地圖；`/board/?demo=1` 可看合成榜。示範資料不上傳。普通試玩未配置 Google 時只使用本機榜；沒有成功上傳的證書不顯示 QR。

新版包含 11 科玩法模組、共用本機姿態引擎、普通話本機錄音回播、39 段三語合成聲音，以及數學、常識、科學、人文、視藝、音樂、中文、普通話、體育與資訊新增場景。11 科選 10 科、6 分領證、10 分按有效時間排名；每科計時上限 240 秒。2026-09-10 已由 GitHub Pages workflow 發布 `game-update-v2`，公開入口為 [Hub](https://chilinbpscth.github.io/dino-island-open-day-2026/hub/)、[探險榜](https://chilinbpscth.github.io/dino-island-open-day-2026/board/) 及 [老師設定](https://chilinbpscth.github.io/dino-island-open-day-2026/setup/)。

## 已取得的驗證證據

- `npm test`：47 項單元測試通過，涵蓋計分、後台計時、媒體生命週期、指令、姿態判定與描寫；新增驗收頁使用實際 Apps Script 原始碼的本機測試，包含已有玩家／Top 10 已滿，並區分連線錯誤與時間驗證錯誤。
- `npm run test:browser`：同一參加者實際操作十科，驗證 5 分禁止領證、6 分證書、9 分未排名、10 分上本機榜、鎖關、虛擬拍照、待傳相片及換人。英文與普通話使用親子替代模式；榜單容量加入合成資料。
- `npm run test:offline`：預载後模擬離線重開、11 路由／素材、模型與語音、補傳佇列、普通證書及專案子路徑；老師設定頁亦會逐項核對實際快取，缺素材時不報完成。
- 各科瀏覽器測試與截圖在 `tests/`、`docs/screenshots/`；中文教育局動畫筆數／次序／方向核對在 `docs/chinese-stroke-sources.json`。
- 模型發布條款及來源在 `docs/pose-dependencies.json`；Google 官方模型卡明列 Apache 2.0，授權與出處已隨模型打包。
- 本輪本機建置包含 156 項離線資源，版本 `6933cd37c9b3`；47 項單元測試、十科完整流程、離線流程及本輪人文／科學專項測試通過。建置會清除輸出資料夾舊檔，避免撤下的錯誤圖留在部署套件。公開版本以 GitHub Pages workflow 結果及線上 manifest 為準。
- 數學模擬觸控拖放／取消、地圖完成標籤及未同步文案、拍照合成失敗／重拍恢復均已新增瀏覽器測試。合成失敗不再沿用上一張普通證書；重拍可產生 1600×2000 JPEG。
- 真實 Google 測試證書已上傳並取回，JPEG 完全一致；重用請求 ID 可取得同一份證書。另一瀏覽器實際領證頁能顯示圖片、儲存按鈕及期限，過程沒有登入提示，但並非清空登入狀態或手機實機測試。詳見 [live-certificate-test-results.json](live-certificate-test-results.json)。

遊戲操作證據來自桌面 Chromium、虛擬裝置或模擬環境；Google 證書段落則為真實後台操作。兩者均不能取代現場 iPad／手機驗收。完整製作歷程在 [GAME-UPDATE-V2.md](GAME-UPDATE-V2.md)，早期進度段落是當時紀錄，應以本頁現況及對應測試紀錄為準。

## 發布前仍需完成

- 原缺漏角色清單已清空，見 [ASSET-REMAINING.md](ASSET-REMAINING.md)。已批准程式去背後的 1024px RGBA 成品在 `hub/img/games/`，原始稿及奶油底檢查圖保留在 `design/game-assets/drafts/`，不直接部署草稿。各科 manifest 保存最終提示詞及接入記錄。仍需依原更新文件完成逐項交付審查，不能單憑缺檔數為零宣告完成。
- 教師核對 39 段讀音及中文教材字形；試聽頁為 `/design/audio/review.html`。合成聲檔已有，尚未教師批准。
- 真實 iPad 的全身動作辨識、觸控／橫直向、相機／咪權限及離線測試；家長手機下載、現場電視遠距可讀性、10 部裝置與 Google 同步／上傳負載。
- Apps Script 第 4 版已部署，单站上限 240 秒。Chrome ITSUPPORT 已完成七項真實計時、鎖站、探索及排名檢查；測試參加者「測試2806」（ID 見 [live-google-test-results.json](live-google-test-results.json)）暫留供老師核對。
- 已用真實測試證書驗證改為過期後拒絕下載；原有每小時排程仍待實際刪檔核對。第 4 版亦修正已刪除請求可重開舊 token 的缺口，新增測試先重現失敗再通過。尚須完成乾淨未登入環境、家長手機掃 QR／儲存、排程刪檔、實機換人與負載驗收。測試行已設為到期，保留作清理狀態核對，不可只刪資料行而遺留 Drive 檔案。
- 目前是已公開的預覽版；上述驗收及完整範圍核對完成後，才可宣告開放日交付完成。

Google 操作使用校方指定 ITSUPPORT 帳戶；不把装置寫入憑證放進公開程式碼。此文件不是正式交付完成聲明。
