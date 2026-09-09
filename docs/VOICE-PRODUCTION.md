# 三語配音製作及核音

39 段本機生成 WAV 已存於 `hub/audio/`。所有段落仍為 **generated-awaiting-review**；老師尚未核音，未宣稱發音、語速或現場 iPad 聲音驗收完成。

- 粵語：canto-tts 0.1.4，typangaa/canto-tts-nano，固定 revision `fe17418a293d9be85685ddf750b0cfef9c88abb4`，使用模型內置預設合成聲線。
- 英文／普通話：sherpa-onnx 1.13.7、Kokoro v1.1-zh ONNX，英文 speaker 2、普通話 speaker 3，speed 0.9。
- 11 段粵語玩法、6 段中文字音情境、7 段英文動作、6 段普通話招呼、5 段體育指令已接播放掣。另 4 段共用歡迎／提示／成果聲檔已生成，尚未接自動播放。
- 合成只讀本專案固定台詞；沒有使用或上傳來賓錄音、相片、學校人員聲線。模型只在製作電腦使用，iPad 只下載聲檔。
- 網站不自動朗讀或代替家長確認。點擊播放；新語音取代舊語音，轉頁／背景停止；普通話錄音期間拒絕播放玩法說明。

## 發布來源

模型出版者均標示 Apache 2.0；此為根據出版者提供的授權及來源資料選用，沒有聲稱獨立審計其訓練資料。

- [Cantonese model card](https://huggingface.co/typangaa/canto-tts-nano)：預設聲線及限制。
- [Canto SDK](https://github.com/typangaa/canto-tts)：本機 ONNX 使用方式及 Apache 2.0。
- [Kokoro model card](https://huggingface.co/hexgrad/Kokoro-82M-v1.1-zh)：中英文聲線與模型授權。
- [Sherpa Kokoro documentation](https://k2-fsa.github.io/sherpa/onnx/tts/pretrained_models/kokoro.html)：ONNX 模型來源與設定。

版本、模型檔案 SHA256 及發布來源：`design/audio/voice-provenance.json`。授權副本位於同一目錄。39 段逐段文字、長度、聲檔 SHA256 及核音狀態：`design/audio/voice-manifest.json`。

## 核音

本機預覽：`http://127.0.0.1:4173/design/audio/review.html`。此頁屬設計核對稿，不打包入靜態遊戲 dist；若從 GitHub 根目錄直接發布，design 仍屬公開 repository 內容，沒有來賓資料。

教師逐段核對：是否讀完整句、粵語聲調及用字、普通話你好／不客氣等變調、英文指令是否清楚、語速是否適合幼兒。記錄段落 ID 和需要修正的位置；未核對前 `teacherReviewed` 保持 false。測試模型及檔案可播放不能代替此核音。

## 重現

製作專用 Python 3.12 環境位於 repo 外 `../dino-audio-runtime`，模型不提交 Git。套件版本詳見 provenance。以本機模型路徑執行：

```sh
../dino-audio-runtime/bin/python scripts/generate-voices.py \
  --cantonese-model /path/to/pinned/cantonese/snapshot \
  --kokoro-model /path/to/kokoro-multi-lang-v1_1
```

程式按 manifest 生成，檢查有限樣本、非靜音及時長；已存在並匹配 SHA256 的段落不重做。修改台詞後先將該段 status 改回 pending 再生成。Canto 模型採樣可能令同一台詞生成不同結果，逐次產物保留獨立 SHA256，重新生成後需重新核音。

## 測試邊界

`tests/voice-browser.mjs`：39 檔實際解碼、11 科播放、單一語音、轉頁及背景清理、普通話虛擬咪錄音回播、英文畫面零英文字。
`tests/offline.mjs`：預載後模擬斷網，全部 39 檔可解碼；GitHub Pages 類似子目錄可用。
以上為 Chromium 測試，不代表實機 iPad 聲音輸出或老師核音通過。
