# 智取恐龍島

佛教志蓮小學 · 2026 年 9 月 13 日開放日

從零製作嘅靜態 iPad 遊戲 Hub、11 科小遊戲、探險榜、普通及拍照證書，後台採 Google Sheets + Google Drive + Apps Script。唔需要來賓帳戶。角色採用使用者選定 A 校園繪本風，校服已依新增參考修訂，規格見 `docs/UNIFORM.md`。

完整體驗、視覺、角色、證書、排名、技術與原創原則見 [`docs/DESIGN-CONCEPT.md`](docs/DESIGN-CONCEPT.md)。

## 開啟

在呢個資料夾執行 `npm ci`、`npm run serve`，開啟終端顯示嘅 `/hub/` 網址。不要直接雙擊 HTML：模組、相機及離線功能需要 localhost 或 HTTPS。

- `/hub/`：iPad 遊戲；hash `#/map`、`#/play/<id>`、`#/cert`。
- `/board/`：1920×1080 大字探險榜，每 5 秒查詢。
- `/setup/`：老師設定 Google 部署網址、裝置憑證及離線預載。
- `apps-script/`：學校後台原始碼。
- `dist/`：已建置靜態發佈資料夾。

未配置 Google 時只做本機試玩，榜有清楚「本機預覽」提示，相片唔會冒出假下載碼。

## 驗證及部署

`npm test` 跑計分、筆順路徑及後台邏輯測試。`npx playwright install chromium` 後，伺服器開住時執行 `npm run test:browser`、`npm run test:offline`，以及 `node tests/network.mjs`。瀏覽器結果、畫面及限制喺 `docs/`。

`npm run build` 重建離線清單及 `dist/`。部署前跟 `docs/DEPLOYMENT.md`，現場同學及老師講解見 `docs/OPERATIONS.md`。

## 尚待正式交付資料及實機驗收

學校 Google 帳戶部署權限／網址、英文及普通話批准錄音、現場 iPad 與手機及電視測試，唔會由本機測試取代。錄音規格見 `docs/AUDIO.md`。預設無正式語音檔時，聽覺站用圖示提示仍可完成。

所有角色係本次重新生成嘅原創素材；原參考圖唔包含喺網站發佈包。QR 工具使用 qrcode-generator 2.0.4（MIT，原始碼保留版權聲明）。

## 最新玩法及示範入口

- `/hub/?demo=1#/map`：直接睇分岔彎路、11 個恐龍園區，可以點入試玩。示範進度獨立保存，不上傳。
- `/board/?demo=1`：10 行合成名字及時間，清楚標示示範資料；不寫入正式排名。
- 正式玩法：11 科，完成 6 站領證，完成全部 11 站先列入排名。已完成站於地圖及直接網址均鎖定。未完成者只計探險中人數。
