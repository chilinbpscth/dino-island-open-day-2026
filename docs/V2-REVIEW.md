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
- 最新前端修正 `19c0dfc` 的 Pages 部署成功，公開 `asset-manifest.json` 版本為 `3032701bd6f1`。建置已清除輸出資料夾舊檔，撤下的錯誤小龍圖不再留在部署套件。
- 數學模擬觸控拖放／取消、地圖完成標籤及未同步文案、拍照合成失敗／重拍恢復均已新增瀏覽器測試。合成失敗不再沿用上一張普通證書；重拍可產生 1600×2000 JPEG。
- 真實 Google 測試證書已上傳並取回，JPEG 完全一致；重用請求 ID 可取得同一份證書。另一瀏覽器實際領證頁能顯示圖片、儲存按鈕及期限，過程沒有登入提示，但並非清空登入狀態或手機實機測試。詳見 [live-certificate-test-results.json](live-certificate-test-results.json)。

遊戲操作證據來自桌面 Chromium、虛擬裝置或模擬環境；Google 證書段落則為真實後台操作。兩者均不能取代現場 iPad／手機驗收。完整製作歷程在 [GAME-UPDATE-V2.md](GAME-UPDATE-V2.md)，早期進度段落是當時紀錄，應以本頁現況及對應測試紀錄為準。

## 發布前仍需完成

- 補齊 29 項角色指定姿勢、恐龍朋友及機械小龍，見 [ASSET-REMAINING.md](ASSET-REMAINING.md)。英文站直／停定沿用既有幼龍，人文時光機使用原創 SVG；`design/game-assets/` 按科保存清單／提示。`drafts/` 圖片透明底不合格，沒有接入遊戲，不能視為成品。
- 教師核對 39 段讀音及中文教材字形；試聽頁為 `/design/audio/review.html`。合成聲檔已有，尚未教師批准。
- 真實 iPad 的全身動作辨識、觸控／橫直向、相機／咪權限及離線測試；家長手機下載、現場電視遠距可讀性、10 部裝置與 Google 同步／上傳負載。
- Apps Script 第 3 版已部署，单站上限 240 秒。Chrome ITSUPPORT 已完成七項真實計時、鎖站、探索及排名檢查；測試參加者「測試2806」（ID 見 [live-google-test-results.json](live-google-test-results.json)）暫留供老師核對。
- 尚須完成乾淨未登入環境、家長手機掃 QR／儲存、到期拒絕下載及排程刪檔、實機換人與負載驗收。真實測試證書行暫留供清理，不可只刪資料行而遺留 Drive 檔案。
- 目前是已公開的預覽版；上述驗收完成並補齊素材後，才可宣告開放日交付完成。

Google 操作使用校方指定 ITSUPPORT 帳戶；不把装置寫入憑證放進公開程式碼。此文件不是正式交付完成聲明。
