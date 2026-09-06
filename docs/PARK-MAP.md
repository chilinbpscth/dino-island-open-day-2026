# 恐龍島園區導覽圖

使用者最新確認：地圖呈現 11 個園區，各有不同恐龍地標；彎路有分岔及環路，訪客自由選擇前往次序。地圖恐龍是園區地標，不取代各遊戲內唯一被照顧的小龍。

保留 11 科供選擇；每關 1 分，任選 10 關即 10 分滿分並按十關總有效時間上榜，完成 6 分可領證。每個園區點擊範圍包括恐龍所在位置及下方科目標牌，地圖沒有方向鎖或必須跟隨的順序；取得滿分後，第 11 個未選園區會標示「今次未選」並鎖定。

參考圖僅取園區布局及分岔路概念，沒有將動物頭像、字樣、圍欄或原構圖複製。地圖由內置 imagegen 從文字提示生成，原圖保存在工具輸出位置，使用檔案為 hub/img/map/island-path.png。介面文字及互動範圍由 HTML 疊加。

## 最終生成提示

Use case: illustration-story. Create a polished original children's dinosaur island PARK GUIDE MAP background for an interactive Hong Kong primary-school open day, landscape 1792x1024. This is a complete illustrated island with exactly ELEVEN distinct dinosaur habitat districts, seen from a slightly elevated overhead view. A branching NETWORK of broad winding cream sandy pedestrian paths goes between the districts, forms loops, junctions and short branches: children can choose different routes, never a single snake track. Irregular soft green habitat shapes fill the island; small rivers, ponds, trees, ferns, gentle hills and one small wooden bridge make the land recognizable. Slim pale teal water coastline around the island, cream #F6F3EC canvas. Forest green #146b4d, sage, olive, muted gold #b8923a accents. Warm clear 2D storybook cartoon illustration, medium dark brown outlines and simple flat colors, matching friendly school illustrated mascots. Not 3D.
EXACTLY 11 cheerful small dinosaur full-body landmarks, one per habitat, well separated, facing viewers or three-quarter view, no scary teeth, no big open mouth. Keep dinosaur silhouettes distinct: tall long-neck, plate-back stegosaur, three-horn triceratops, duck-bill crest, small feathered runner, armored ankylosaur, dome-head, short-neck stocky herbivore, long-tailed small theropod with CLOSED friendly smile, frilled small herbivore, round hatchling in cream egg. Different restrained greens, sage, ochre and muted terracotta colors, shared rendering style, NO copies of existing franchises or old illustrations. No humans.
Layout coordinates measured as percent of image, place one dinosaur centered in each region near:
top row: (14,17) longneck; (38,17) stegosaur; (64,17) crested duckbill; (86,17) triceratops.
middle row: (16,45) armored dino; (40,45) hatchling; (65,45) feathered runner; (86,45) domehead.
bottom row: (25,73) longtail; (51,73) stocky herbivore; (77,73) frilled herbivore.
Each district has uncluttered empty ground just BELOW its dinosaur for a web label to be added later, around y29/57/85 respectively. Dinosaurs occupy roughly 11 percent image width and 18 percent image height, longneck can be slightly taller. Each region differentiated by a simple habitat detail but avoid visually busy texture. Bottom left at (7,85) is a small empty friendly ROUND ARCH ROCK CAVE entrance beside a path fork, no teeth. Exactly eleven recognizable districts, organic boundaries, no grids or numbered stones. Artwork contains NO WORDS, NO LETTERS, NO NUMBERS, NO LABELS, NO BADGES, NO UI BUTTONS, NO white circular portrait frames. No zoo mammals, fences, photographs, polar bears, Christmas, poop, blood, sharp tooth closeups. Leave outer 3 percent breathing room. Make the map itself engaging and readable at iPad size.

## 標題及迎賓角色

使用者另要求地圖加入主標題及小蓮、小志兩人。兩位本次 A 風格角色置於地圖標題區，與11個園區點擊範圍分開；此為使用者對地圖畫面人物數目的最新修訂，遊戲內仍維持原角色規則。

標題區在「智取恐龍島」上方清楚顯示「佛教志蓮小學」。校名、活動名及園區標牌均以網頁文字呈現，沒有烘焙進插畫。

最新導遊互動：小蓮、小志已由標題區移到島上入口。點選未完成園區後，兩位沿插畫道路節點步行約 1.3–3.2 秒，到達後進入遊戲。回地圖保留上一站位置，連撳不改目的地；離開地圖取消導覽。路程不計遊戲時間，減少動態偏好下省略踏步及移動。
