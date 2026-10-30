# 阿葛傳奇 v2 — 修正進度（checkpoint）
更新：2026-10-30 12:55 (Asia/Taipei)

## 已完成
- [x] 新圖：img/ 133 張 webp（原 68）；newimg.map 65 筆；s_a_hall、s_a_rebound 等
- [x] 柑仔店三回合重寫（story_a.txt a1_shop…a1_shop_r3x）：`! chart N`／`! reveal`／cdir 分支、r3 節奏＋`! chart mark`
- [x] build.py 重寫：缺圖／換場沒換圖 → exit 1；per-line voice 檔；蛤→哈+rise.py 升調；TTS_FIX；--regen；「……」做 0.9s 停頓
- [x] engine.js v3 組好（/tmp/e1..e4 → engine.js）：每句存檔(save_A/save_B, S.cur)、覆蓋確認框、繼續選擇器、選單暫停、toTitle 全重置、
      開場不播任何聲音（只解鎖）、語音等 ended、JS 計時器（有數字）、0.35s arm、K線報紙圖＋揭曉、節奏遊戲真判定
- [x] index.html / style.css：.bg 永遠 cover＋pointer-events:none、#stage 100vw/100dvh、大提示框、選項 grid、#chart、確認框、節奏回饋
- [x] 完整 build 通過（999 句）
- [x] 自動跑 A seed1 → hidden、B seed1 → bond，0 錯誤
- [x] K 線圖桌機／直式／橫式截圖；r3 週期加大、揭曉K棒範圍對稱擴充、今天/明天標籤不重疊、暫停時揭曉動畫也暫停
- [x] 橫式：圖表放左下、字幕移右側（不擋臉）
- [x] ASR（whisper small）跑完：/workspace/asr_cache.json

## 待做
- [x] B 視角柑仔店選項加 guess fx（t=chart，揭曉後依 cok 分支）
- [ ] ASR 稽核比對 → tts_fix.json → --regen → 再驗
- [ ] 截斷檢查（時長／尾字）
- [x] 未用 webp：0 張；contact sheet：/workspace/shots/contact_A.jpg、contact_B.jpg、contact_endings.jpg
- [ ] Playwright：多 seed 兩視角多結局、存檔/繼續、逾時、節奏成敗、首開無聲、390/橫式、連點
- [ ] 重新打包 agege-sim-v2.zip、agege-sim.zip（不要動 v1）
- 註：第一次 ASR 設定（initial_prompt+beam3）產生大量亂碼，改 beam5/temperature0/不接上文 重跑中 → /workspace/asr2.json
- [x] 合併 14 處「@ time」+「@ bg」兩行（舊畫面先閃新時間＝stale image 主因）；build 新增此規則並以注入錯誤驗證會 exit 1
- 新增分支結果圖（進行中）：s_a_hw_brain s_a_dodge_go s_a_pc_click s_a_dinner_true s_a_eat（已轉 webp，尚未寫進 story）
- 新增：s_a_blank_draw s_a_iq_show s_a_iq_lunch s_a_rain_share s_a_rain_run s_a_buy_all s_a_mom_true s_a_kai_help s_a_soup_drop(裁掉左側人臉) s_a_bento_eat s_a_k_hold s_a_re_umb（尚未寫進 story）
- [x] 分支結果獨立圖已接上（21 節點）：a1_hw_brain a1_dodge_go a1_pc_click a1_dinner_true a1_end_eat a2_blank_draw a2_iq_show a2_iq_hide a2_rain_share a2_rain_run a2_buy_all a2_mom_true a3_kai_help a3_soup_drop a4_bento_eat a4_k_hold a4_re_umb a4_greed b2_iq_ask b2_rain_block b2_crash_sell。build 通過 154 張圖。備份 /workspace/story_*.pre_wire.txt
- [ ] s_a_grad_cheat 兩次都生成成肩後視角，放棄（沿用上一張）
- [x] 功能測試 pwtest/v3func.js（1280x800 / 390x844 / 844x390）全 PASS：新開無存檔/有存檔都不出聲、繼續回到同一句、覆蓋確認、取消保留、雙存檔選單、覆蓋只清 A、雙擊不跳兩句、回標題重置、無溢出、背景蓋滿、bg1 pointer-events none、0 console error
- [x] pwtest/v3rh.js：節奏 8/8、6/8 過關；3/8 失敗；6/8+亂按扣分→5 拍失敗。逾時：a3_start timeout → 自動選 def
- [ ] ASR：asr2（int8+temp0）仍是垃圾；改 float32 beam5 + 繁中 prompt（試 6 句近乎全對）。分 4 片重跑 /workspace/asr3.py → asr3_{0..3}.json
- [x] 蛤 → ㄏㄚˊ：parselmouth 音高 mate 330→518Hz、chef 102→140Hz（第一個音節上揚＝第二聲）
- [x] 截斷：1001 個語音檔，voicemap 長度與實際長度誤差>0.15s：0；結尾 100ms 仍有大聲（被切斷）：0
- [x] 新圖手機直式焦點 FOCUS：s_a_hw_brain .42、s_a_soup_drop -.23、s_a_greed -.39、s_b_rain_block .47、s_b_iq_ask .05、s_a_kai_help .15（shots/portrait_new.jpg）
- [ ] ASR 初步（724/1001）：真錯 → 塞進 sè(應 sāi)、底下的量 liáng(應 liàng)、差點 chā(應 chà)；媽媽用 zh-CN-shaanxi 方言聲（「你是」→「逆死」，中位相似 0.82）→ 改 zh-TW-HsiaoChen 低音。其餘多為 ASR 雜訊（得/的、哇、欸、盛=chéng 正確、匙=chí 正確、量到/量不準=liáng 正確）。分析腳本 /workspace/poly.py
- [x] ASR 全 1001 句完成（/workspace/asr3.json，中位相似 1.0）。真錯整理成 src/tts_fix.json：塞→腮(sāi)×7、底下的量→亮(liàng)×2、差點→岔點(chà)×3、ETH→以太幣×5、多啦A夢→多拉欸夢×6、「0.4。1。10。100。800。」改中文數字；媽媽聲 shaanxi 方言→zh-TW-HsiaoChen(-8%,-10Hz)×18。regen 清單 /workspace/regen.json（43 句）
- [ ] regen 執行中（/tmp/regen.log）→ 之後重跑 ASR 驗證這 43 句
- [x] regen 完成：voiced 1001 missing 0（edge-tts 偶發 No audio，重試後補齊）
- [x] 重新 ASR 43 句（/workspace/asr4.json）：相似度中位 0.91→1.00、平均 0.85→0.94；媽媽 18 句平均 0.80→0.99；塞/量/ETH 全部聽成正確。殘留：ag22~ 氣音「十」被聽成「4」、ag17~「岔點」被聽成「叉點」（ASR 雜訊）
- [x] Playwright 結局跑法 12 局（A 11-13,17-19；B 11-13,17-19；含 390x844 直式、844x390 橫式）：結局 liq/love_qing/bond/love_viv/love_yu，0 錯誤、0 卡住（/tmp/f?.log）
- [x] 結局跑法共 21 局（seed 11-19 兩視角 + 直式/橫式）全部到結局、0 錯誤；seed14 第一次 240s 逾時是並行負載，單跑 A14/B14 皆 love_qing 正常。v3func 42/42 PASS（/tmp/func2.log）
- [x] 重新打包 /workspace/agege-sim-v2.zip 與 agege-sim.zip（v1 未動，md5 facfbf45…）
