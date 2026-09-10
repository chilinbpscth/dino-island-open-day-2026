# 尚欠遊戲素材

來源：`Dino Island｜11 科恐龍遊戲 Game Module Planning.md`。已按 `game-update-v2` 的 `hub/modules/` 核對。以下 28 項檔案均不存在，manifest 仍保留未完成狀態。

起床小龍最初造型不一致的圖已撤下。2026-09-10 用戶批准程式去背修邊後，改用參考原定角色的新動作稿，處理成 1024×1024 真透明 PNG，已核對奶油底合成並接入常識站。此批准同樣適用後續已核對造型的角色去背；下表的「待批准」屬早期記錄，現可進行處理。

| 科目 | 尚欠檔案（相對 hub/img/） | 現時暫代 | 所需動作／主體 | 下一步 |
|---|---|---|---|---|
| art | `games/art/dino-hatching.png` | `chars/dino-baby.png` | 小龍孵化 | 製作真透明角色圖 |
| art | `games/art/xiaozhi-surprised.png` | `chars/xiaozhi-welcome.png` | 小志驚訝 | 製作真透明角色圖 |
| chinese | `games/chinese/dino-walking.png` | `chars/dino-baby.png` | 小龍行路 | 製作真透明角色圖 |
| chinese | `games/chinese/dino-drinking.png` | `chars/dino-baby.png` | 小龍飲水 | 製作真透明角色圖 |
| computing | `games/computing/dino-robot.png` | `chars/dino-baby.png` + CSS robot panel | 小龍機械人 | 重新產真透明圖；程式去背待明確批准 |
| english | `games/english/dino-jump.png` | `chars/dino-baby.png` | 跳 | 製作真透明角色圖 |
| english | `games/english/dino-squat.png` | `chars/dino-baby.png` | 蹲 | 製作真透明角色圖 |
| english | `games/english/dino-hands-up.png` | `chars/dino-baby.png` | 舉手 | 製作真透明角色圖 |
| english | `games/english/dino-left.png` | `chars/dino-baby.png` | 向左 | 製作真透明角色圖 |
| english | `games/english/dino-right.png` | `chars/dino-baby.png` | 向右 | 製作真透明角色圖 |
| english | `games/english/dino-celebrate.png` | `chars/dino-baby.png` | 慶祝 | 製作真透明角色圖 |
| general | `games/general/dino-playing.png` | `chars/dino-baby.png` | 玩耍 | 製作真透明角色圖 |
| general | `games/general/dino-washing.png` | `chars/dino-baby.png` | 洗澡 | 製作真透明角色圖 |
| humanities | `games/humanities/xiaolian-explorer.png` | `chars/xiaolian-point.png` | 小蓮探險引導 | 製作真透明角色圖 |
| humanities | `games/humanities/xiaozhi-explorer.png` | `chars/xiaozhi-welcome.png` | 小志探險 | 製作真透明角色圖 |
| mandarin | `games/mandarin/dino-greeting.png` | `chars/dino-baby.png` | 打招呼 | 製作真透明角色圖 |
| mandarin | `games/mandarin/dino-thanks.png` | `chars/dino-baby.png` | 多謝 | 製作真透明角色圖 |
| mandarin | `games/mandarin/dino-goodbye.png` | `chars/dino-baby.png` | 再見 | 製作真透明角色圖 |
| mandarin | `games/mandarin/dino-listening.png` | `chars/dino-baby.png` | 聆聽 | 製作真透明角色圖 |
| math | `games/math/friend-longneck.png` | `chars/dino-baby.png` | 長頸龍朋友 | 製作真透明角色圖 |
| math | `games/math/friend-triceratops.png` | `chars/dino-baby.png` | 三角龍朋友 | 製作真透明角色圖 |
| math | `games/math/dino-hungry.png` | `chars/dino-baby.png` | 小龍肚餓 | 製作真透明角色圖 |
| music | `games/music/dino-drum.png` | Inline SVG drum + `chars/dino-baby.png` | 小龍打鼓 | 重新產真透明圖；程式去背待明確批准 |
| music | `games/music/xiaolian-bell.png` | `chars/xiaolian-clap.png` + inline bell | 小蓮搖鈴 | 製作真透明角色圖 |
| music | `games/music/xiaozhi-percussion.png` | `chars/xiaozhi-highfive.png` + inline clap | 小志拍手 | 製作真透明角色圖 |
| PE | `games/pe/dino-coach.png` | `chars/xiaozhi-stretch.png` | 小龍教練 | 製作真透明角色圖 |
| science | `games/science/xiaolian-scientist.png` | `chars/xiaolian-point.png` | 小蓮科學家 | 製作真透明角色圖 |
| science | `games/science/xiaozhi-scientist.png` | `chars/xiaozhi-welcome.png` | 小志科學家 | 製作真透明角色圖 |

`pe.json` 的 `friendly-trex` 已有 `kind: "scene"`，正確指向 `games/pe/forest-visitor.png`，不是欠缺的角色 sprite。


已核對並重用：英文站直／停定使用現有 dino-baby.png；人文時光機使用原創 SVG，不另造重複 PNG。跳躍新草稿亦沒有 alpha，與機械小龍、打鼓草稿一樣未接入網站。
