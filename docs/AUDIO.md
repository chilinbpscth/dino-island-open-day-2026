# 預錄聲音交付規格（待校方提供及批准）

本版聲音檔案未提供，英文／普通話預設使用圖示提示通關；音樂鼓聲由本機 Web Audio 產生，無網絡依賴。未將系統合成聲或網上下載聲音冒充正式錄音。

請提供每項獨立 MP3，單聲道，約 0.6–2 秒，頭尾短留白、無背景音樂、音量一致。文字唔會顯示喺選項。

| 相對路徑 | 錄音內容 |
|---|---|
| hub/audio/en/water.mp3 | water |
| hub/audio/en/apple.mp3 | apple |
| hub/audio/en/sleep.mp3 | sleep |
| hub/audio/zh-CN/umbrella.mp3 | 下雨 |
| hub/audio/zh-CN/apple.mp3 | 蘋果 |
| hub/audio/zh-CN/sleep.mp3 | 睡覺 |

檔案加入後，校方核對發音，再將 `shared/config.js` 中 `audioApproved` 設為 true，重新 build。每回合可重播；自動播放若被瀏覽器阻擋，手動按「再聽一次」即可。靜音仍有同步需要圖示。
