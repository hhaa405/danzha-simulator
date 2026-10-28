# 蛋渣模擬器 3.0 — Credits / 素材來源與授權

## 故事
- 原作故事：Djdjjdjjd（《蛋渣模擬器》七篇）。

## 背景音樂（BGM）
6 首循環配樂都是這個專案自己作曲，用 Python（numpy）合成器逐音符算出來，再用 ffmpeg 編成 mp3。沒有取樣，也沒有用任何第三方音樂或音色庫。
- 授權：CC0 1.0（公眾領域貢獻）。原始碼在 `tools/music.py`（和音檔一起產生）。

| 檔案 | 情境 | 速度 | 和弦進行 |
|---|---|---|---|
| assets/music/daily.mp3 | 校園日常 | 104 BPM | C–Am–F–G–C–Em–F–G |
| assets/music/crush.mp3 | 曖昧心動 | 82 BPM | Fmaj7–Em7–Dm7–Cmaj7… |
| assets/music/tense.mp3 | 緊張／曝光 | 120 BPM | Am–Am–F–E… |
| assets/music/sports.mp3 | 運動會熱血 | 144 BPM | D–D–G–A–Bm–G–A–A |
| assets/music/sad.mp3 | 姐姐悲傷 | 66 BPM | Am–F–C–G–Am–F–Dm–E |
| assets/music/ending.mp3 | 結局感傷 | 72 BPM | C–G–Am–Em–F–C–Dm–G |

## 角色配音
- 用 Microsoft Edge 線上神經網路語音（透過開源工具 `edge-tts`）預先合成，再用 ffmpeg 壓成 24 kHz、32 kbps 單聲道 mp3。
- 每一句都依情緒（開心／生氣／哭／害羞／吐槽／緊張／平靜／悲傷／驚訝）調整語速、音高、音量。
- 使用的語音：zh-TW-YunJheNeural、zh-TW-HsiaoChenNeural、zh-TW-HsiaoYuNeural、zh-CN-YunxiaNeural、zh-CN-XiaoyiNeural、zh-CN-XiaoxiaoNeural、zh-CN-YunxiNeural、zh-CN-YunjianNeural、zh-CN-YunyangNeural。
- 語音版權屬 Microsoft，依其服務條款使用。這是非商業的同人／個人作品。

## 美術
- 背景、角色立繪、標題主視覺：用 AI 圖像生成工具產生，全部是虛構人物和虛構場景，不是任何真實的人。
- 角色去背：rembg（MIT 授權），模型 isnet-general-use。
- 轉檔：Pillow → WebP。

## 程式
- 遊戲引擎、小遊戲、兌換碼系統：本專案原創。
