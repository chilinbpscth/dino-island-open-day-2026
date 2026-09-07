# 學校部署及開場設定

呢份套件係靜態遊戲加 Google 後台。ITSUPPORT 帳戶已建立 Apps Script 專案、私人試算表、私人證書資料夾、10 組裝置憑證及每小時清理排程；Web App 公開部署及正式網址仍待完成。未接通時可本機試玩，電視頁清楚標示「本機預覽」。

## 1. 建立學校 Google 後台

1. 用學校管理帳戶開 Google Apps Script，建立空白專案。
2. 將 `apps-script/Code.gs`、`Bridge.html`、`Certificate.html` 加入專案。
3. 在專案設定顯示 `appsscript.json`，貼上套件同名設定；啟用 Drive API v3 進階服務。若使用自訂 Google Cloud 專案，亦要在該專案啟用 Drive API。
4. 在編輯器選 `setup` 執行一次，由校方授權 Sheets、Drive 及時間觸發器。會建立私人「智取恐龍島 2026-09-13」試算表及「智取恐龍島 私人證書」資料夾。本專案已於 2026-09-07 用 `itsupport@chilinbps.edu.hk` 完成此步。
5. 試算表 `DeviceSetup` 有 10 個私人裝置憑證。只交老師；唔放上 GitHub、唔印喺公開 QR、唔分享整個試算表。
6. 在指令碼屬性將 `ALLOWED_ORIGINS` 設成 JSON 陣列，例如 `["https://school.github.io"]`。填 origin，唔帶專案路徑。測試用本機地址需另外加入。
7. 部署 → 新部署 → 網頁應用程式；執行身分：自己（校方部署者）；存取者：任何人。若學校政策無此選項，請管理員處理，唔改成要求家長登入。
8. 保存正式 `/exec` 網址。編輯後須建立新版本並更新部署；`/dev` 只供編輯者，唔可以作家長領證網址。

來源及技術邊界：[Web Apps](https://developers.google.com/apps-script/guides/web)、[HTML bridge/server calls](https://developers.google.com/apps-script/guides/html/communication)、[Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)。橋接以允許來源、隨機通道及回應 ID 配對；必須實測 Safari 嵌入頁行為，唔將本機 mock 當 Google 實測。

## 2. 發佈靜態遊戲

- 已有 `dist/` 可部署資料夾。將其內容放進學校 GitHub Pages repository，使用 HTTPS。
- 日後改動原始碼或素材：在套件根目錄 `npm ci`，再 `npm run build`，重新上傳 `dist/` 全部內容。唔只覆蓋單張圖片而忘記重建離線清單。
- 可用 GitHub Actions（`.github/workflows/pages.yml`）建置及部署。流程預設只接受手動啟動；校方確認 repository 公開範圍及 Pages 設定後才執行。
- Pages 支援 `/專案名/hub/` 及 `/專案名/board/`；所有遊戲資源用相對路徑。
- 已使用校方提供圖檔，位置 `shared/img/school-logo.png`；設定透過模組相對網址讀取，支援子目錄。
- 正式錄音規格見 `AUDIO.md`；尚未批准前 `audioApproved` 保持 false。

## 3. 每部機開場前

1. 老師開 `BASE/setup/`；填 Apps Script `/exec` 網址。
2. iPad 填各自裝置憑證；電視只填網址，唔填寫入憑證。
3. 按「儲存設定」、「測試榜連線」、「準備離線遊戲」。
4. 發佈新版本後先關閉所有同站分頁，再重新開啟，讓新離線版本啟用。唔喺小朋友玩緊時換版本。
5. iPad 開 `BASE/hub/`，電視開 `BASE/board/` 全螢幕。首次容許鏡頭，確保正面拍攝，唔收音。
6. 真正關 Wi-Fi，重新載入並完成一站，恢復連線，確認榜出現；本機 `localStorage` 唔好用私人瀏覽，唔喺活動中清 Safari 網站資料。

## 4. 正式連線驗收（仍待校方實機）

- 十部 iPad 同時完成站，電視每 5 秒查詢；95% 於 10 秒內見更新。
- 同時交圖片與成績，確認成績未被長時間阻塞；95% 證書於確認後 10 秒內出碼。超過目標要記錄真實結果，唔假報。
- iPhone Safari、Android Chrome，未登入 Google 狀態掃碼，下載正確證書。
- 上傳中斷後重試，沿用同一請求 ID，唔重複建立可見證書；失敗檔案由清理工作處理。
- 將測試證書期限改為過去，下載立即拒絕；執行 `cleanupExpired_` 後檔案永久移除。
- 小朋友未滿 6 站，後台拒絕發證；另一部 iPad 唔能夠改寫其他機嘅紀錄。
- 定時清理失敗會記錄錯誤；校方須檢查 Apps Script「執行項目」及觸發器失敗通知。

## 私隱及交收

只上傳合成 JPEG，唔上傳原相；Drive 檔案私人保存，下載經 token 驗證。持有 token 連結者可領取，7 日後停止提供新下載；每小時清理實體檔案。已儲存在家長手機嘅副本無法遠端收回。

暱稱只係暱稱，唔收姓名、電郵、電話。榜只有暱稱與成績；裝置憑證及領證 token 唔出榜。呢個係現場紀念活動，唔係防作弊考試系統。
