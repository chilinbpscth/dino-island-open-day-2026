# 起床小龍：造型保留，透明度未通過

使用內置 imagegen，參考 `hub/img/chars/dino-baby.png`，並非舊公司插畫。

首輪提示：保留巨大圓頭、奶油嘴及腹部、粉紅圓頰、三瓣圓金冠、森綠身體、短肢、粗黑線；只改成雙手輕伸、半開睡眼、微笑的起床姿勢。單角色置中，要求真透明 PNG，無地面或陰影。

檔案：`dino-waking-matched-opaque.png`。頭形、面頰、冠形及身體已貼近原角色；較亮的綠色仍需合成時核對。`sips -g hasAlpha` 回報 `no`，灰白棋盤格是實際像素，不能當透明素材上線。

第二輪只要求移除棋盤格、保留角色全部細節，輸出 RGBA。生成來源 `exec-5aa9940b-ea82-45fa-b82d-318487ecd5ea.png` 仍回報 `hasAlpha: no`。停止重複同類請求，避免將失敗去背當完成。

首輪來源：`/Users/cthair/.codex/generated_images/01a07267-e66d-7c02-951c-16341dacbb5d/exec-8d84be19-1d35-4f3c-b07d-20ca0b063d06.png`。

目前遊戲繼續用原定透明小龍。此圖僅為內部動作稿；程式去背仍待用戶明確批准，不能自行改用另一個產圖 API。
