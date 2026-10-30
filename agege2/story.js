// 角色、結局、構圖焦點（由 build.py 併入 story.js）
window.CAST={
 ag9:{n:'阿葛',sheet:'c_ag9',dB:'九歲．國小三年級。總是坐在教室角落，看著窗外。'},
 ag14:{n:'阿葛',sheet:'c_ag14',dB:'國中。小卷白卷，大考全校第一。'},
 ag17:{n:'阿葛',sheet:'c_ag17',dB:'台南高商餐飲科。計算紙比砧板還多。'},
 ag22:{n:'阿葛',sheet:'c_ag22',dB:'初入社會。122 顆 BTC，和一個排骨便當。'},
 me12:{n:'我',nA:'阿哲',sheet:'c_me12',dA:'跳級生。比我小三歲，永遠的第二名。'},
 me15:{n:'我',nA:'阿哲',sheet:'c_me15',dA:'又跳級了。他說他想當廚師。'},
 me20:{n:'我',nA:'阿哲',sheet:'c_me20',dA:'大飯店學徒。放假就來看我吃便當。'},
 mate:{n:'阿肥',sheet:'c_mate',d:'國小同學。家裡有一台會跳數字的電腦。'},
 tch:{n:'林老師',sheet:'c_teacher',d:'數學老師。對阿葛又氣又沒轍。'},
 uncle:{n:'雜貨店大叔',sheet:'c_uncle',d:'巷口柑仔店老闆。糖果供應商。'},
 mra:{n:'A先生',sheet:'c_mra',d:'校友，地產商。金錶比笑容還亮。'},
 chef:{n:'王師傅',sheet:'c_chef',d:'餐飲科主廚老師。鬍子比刀還整齊。'},
 mom:{n:'阿葛媽媽',nA:'媽媽',sheet:'c_mom',d:'擔心的時候，筷子會停在半空中。'},
 qing14:{n:'小晴',sheet:'c_qing14',d:'國中同班，坐在阿葛前面。銀色的髮夾。'},
 qing22:{n:'小晴',sheet:'c_qing22',d:'回到台南工作。銀色髮夾還在。'},
 yu:{n:'小雨',sheet:'c_yu',d:'餐廳常客，插畫家。每週四，同一碗牛肉麵。'},
 viv:{n:'Vivian',sheet:'c_vivian',d:'量化交易員。問題一個比一個尖。'},
 kai:{n:'阿凱',sheet:'c_kai',d:'高職同學，怕火的熱血廚師。後來的餐廳二廚。'}
};
window.ENDINGS=[
 {id:'legend',name:'多啦A夢',img:'s_harbor',bgm:'triumph',hint:'守住規律，也守住承諾的人，會在海邊。',short:'真實世界裡的傳奇，永遠帶著神秘。',
  dA:'222 顆比特幣，800 顆以太幣，一間十二個位子的餐廳。\n我沒有時光機。我只是比大家早一點，看見規律。',
  dB:'一開始我把他當笑話，十年後才發現，自己才是笑話。\n阿葛，多啦A夢，真實世界裡的傳奇，永遠帶著神秘。'},
 {id:'ordinary',name:'平凡的日子',img:'s_ordinary',bgm:'emo',hint:'太常在半夜按下賣出，或是，從來不相信。',short:'規律說：下次吧。',
  dA:'我還是很會看線，只是那些年，手總是比腦袋快。\n湯很好喝。這樣，也很好。',
  dB:'我一直在懷疑他。後來，我們就很少聯絡了。\n我只能從別人轉傳的照片裡，看見那個淡淡的笑。'},
 {id:'liq',name:'一根針',img:'s_liq',bgm:'night',hint:'天上沒有天花板。報紙上有。',short:'四分鐘，歸零。',
  dA:'800 顆，想變成 8000 顆。\n那一晚，我第一次聽見一個不是規律的聲音。',
  dB:'我開著跟他一模一樣的單。他平倉了，我沒有。\n我看的是他，不是規律。'},
 {id:'bond',name:'第二名也不錯',img:'s_friend',bgm:'warm',hint:'一直在旁邊看的那個人。',short:'數字會過期，朋友不會。',
  dA:'頂樓，啤酒，一包柑仔店的糖果。\n他說他一開始把我當笑話。我說，你是第二名。',
  dB:'第一名有很多比特幣。\n第二名有第一名。'},
 {id:'love_qing',name:'透明傘',img:'s_river',bgm:'emo',hint:'一把沒有還的傘，和一個約定。',short:'實驗成功了。妳是第一個知道的。',
  dA:'國中那把透明傘，我一直沒有還。\n因為我想撐給妳。',
  dB:'傘往她那邊歪。他的左肩，又濕了一整片。\n這一次，我沒有搗亂。'},
 {id:'love_yu',name:'三號桌',img:'s_b_yu',bgm:'emo',hint:'湯變甜的理由。',short:'每週四，同一碗麵。',
  dA:'湯變甜，是因為每週四，三號桌的燈都會亮。',
  dB:'阿凱說他在廚房聽到，差點把蔥切到手。'},
 {id:'love_viv',name:'市場休息',img:'s_b_viv',bgm:'emo',hint:'會為了什麼停下來？',short:'那一晚，誰都沒有看盤。',
  dA:'她問我，你這種人會為了什麼停下來。\n現在我知道了。',
  dB:'原來，連多啦A夢，也會有想停下來的時候。'},
 {id:'hidden',name:'床底下的時光機',img:'s_hidden',bgm:'night',hint:'？？？ 一顆糖都沒吃，一次都沒慌。',short:'糖果是拿來分給別人的。',
  dA:'九歲的我，留了一張紙條給長大的我。\n原來時光機，一直在床底下。',
  dB:'他沒有時光機。\n他只是比所有人，早一點點看見。而我，看了他十多年。'}
];
window.FOCUS={s_a_viv:.05,s_b_yu:0,s_b_viv:-.3,s_b_rain:0,s_b_reunion:0,s_river:-.25,s_a_exam:.1,s_a_library:.45,s_a_rechao:-.1,s_a_door:.7,s_a_note:.1,s_a_bento:-0.4,s_a_grad:-0.13,s_a_office:0.26,s_a_shop:-0.13,s_b_bento:-0.13,s_b_door:0.4,s_b_exam:0.32,s_b_soup:-0.13,s_b_tablet:0.13,s_b_window:0.13,s_dodge:-0.26,s_library:0.26,s_math:-0.13,s_meetup:-0.65,s_pc:-0.26,s_rest_yu:-0.4,s_reunion:-0.65,s_harbor:0.13,s_hidden:-0.2,s_a_hw_brain:0.42,s_a_soup_drop:-0.23,s_a_greed:-0.39,s_b_rain_block:0.47,s_b_iq_ask:0.05,s_a_kai_help:0.15};

window.STORY_SRC=`// ===================== 第一視角：阿葛 =====================
== a1_start
! pov ag9
! hud none
! title 國小篇．第一章|孤僻的小孩
@ bg=s_a_window time=週二_上午 bgm=calm amb=class tint=warm
> 下課鐘響了。全班像被打開的汽水，一下子全衝出去。
> 我沒動。窗外那棵榕樹的影子，每天這個時候會剛好碰到第三根欄杆。
> 今天它停在第二根半。明天，應該會碰到第三根。
> 我覺得世界上的東西，都有自己的節奏。只是大家都太吵了，聽不到。
tch.x: 阿葛，作業呢？
> 作業。作業是一種每天都一樣的東西。一樣的東西，我已經會了。
? t=calm | 老師站在桌邊，等你回答。
- 「我寫在腦袋裡了。」 {teach-=1} -> a1_hw_brain
- 低頭假裝在找作業簿 -> a1_hw_hide
- 繼續看窗外的影子 {hidden+=0} -> a1_hw_window

== a1_hw_brain
@ bg=s_a_hw_brain
tch.u: 寫在……腦袋裡？
mate.s: 哈哈哈，阿葛腦袋裡有作業簿！
tch.x: 那你腦袋裡的第五題答案是多少？
ag9: 三十六。還有，第七題題目印錯了。
tch.u: ……
> 老師翻了翻課本，表情像吃到一顆很酸的糖。
tch: 這孩子腦袋不知道裝了什麼。
! go a1_test

== a1_hw_hide
> 我把書包翻了兩遍。裡面只有一本筆記本，上面畫滿了影子的位置。
tch.x: 這是什麼？
ag9: 影子。它每天會往右邊走一點點。
tch: ……好，明天記得交。
> 她嘆了一口氣。那口氣的長度，跟昨天差不多。
tch: 這孩子腦袋不知道裝了什麼。
! go a1_test

== a1_hw_window
> 我沒有回答。影子剛好停在第二根半，跟我想的一樣。
tch.x: 阿葛！
> 被吼了一聲。但影子沒有動，所以我覺得我是對的。
tch: 算了。這孩子腦袋不知道裝了什麼。
! set teach-=1
! go a1_test

== a1_test
@ bg=s_math time=週四_上午 bgm=school amb=class fade=blink
tch: 好，數學小考，十五分鐘。不准講話。
> 考卷上有十題。前九題我看一眼就知道了。
> 第十題比較好玩。它像一個圈，數字繞一圈，又回到原來的地方。
? t=calm | 鉛筆在你手上轉著。
- 在桌上畫圈圈，邊畫邊笑 {hidden+=1} -> a1_test_circle
- 乖乖一題一題寫完 {teach+=1} -> a1_test_normal

== a1_test_circle
> 我在桌上畫了一個圈。再一個。圈和圈中間，答案就跑出來了。
@ bg=s_a_quiz
> 我忍不住笑了。旁邊的同學用很害怕的眼神看我。
mate.u: 老師……阿葛在畫畫……
tch.x: 阿葛，考試的時候不要玩！
> 我沒有在玩。我只是在看它轉圈。
@ bg=s_a_100u time=週五_上午
tch.u: ……阿葛，一百分。
mate.u: 蛤？他明明在畫圈圈耶！
! go a1_dodge

== a1_test_normal
> 我一題一題寫。寫字很慢，比想的慢很多。
> 寫完第十題的時候，下課鐘剛好響。
@ bg=s_a_100s time=週五_上午
tch.s: 阿葛，一百分。很好，這次有好好寫。
> 老師笑了。那是我這學期第一次看到她對我笑。
! go a1_dodge

== a1_dodge
@ bg=s_dodge time=週五_下午 bgm=school amb=street tint=warm fade=blink
mate.s: 阿葛！缺一個人啦！來打躲避球！
> 阿肥抱著球跑過來。他家有一台會跳數字的電腦，這件事我一直記得。
? t=12 def=2 | 阿肥在等你。
- 「好。」站起來跟他走 {mate+=2} -> a1_dodge_go
- 「我在看影子。」 -> a1_dodge_no

== a1_dodge_go
@ bg=s_a_dodge_go
> 我被打中了四次。每次都是同一個人，從同一個角度丟過來。
> 第五次，我先往左邊躲了。他愣住了。
mate.u: 你怎麼知道他要丟那邊？
ag9: 他每次丟之前，左腳都會往後退。
mate.s: 哇靠，你好奇怪。可是好厲害！
mate: 欸，禮拜六來我家玩電腦啦，我爸的電腦超大！
! go a1_pc

== a1_dodge_no
mate: 影子喔……好啦。那你禮拜六要不要來我家？我家有電腦！
> 電腦。我點了點頭。
> 阿肥跑走的時候，我看見他左腳每次丟球前都會往後退。
! go a1_pc

== a1_pc
! title 國小篇．第二章|Money game
@ bg=s_a_pc time=週六_下午 bgm=calm amb=room tint=none fade=blink
> 阿肥家的電腦很大，會嗡嗡叫。螢幕上卡著一個畫面。
> 紅紅綠綠的數字，跑來跑去。我盯了很久。
ag9: 這是什麼？
mate: 啊這是我爸在看股票啦，亂按會被罵的。
> 數字往上跳，又往下掉。像在呼吸。
> 一、二、三……它每次掉到某個地方，就會停一下。
ag9.u: 所以這些數字是可以變錢的？
mate.s: 我也不知道耶，反正我爸每天都盯著看。
? t=calm | 你的手指離滑鼠只有五公分。
- 伸手按一下，看看會怎樣 -> a1_pc_click
- 只是看，把那個數字記在心裡 {hidden+=1} -> a1_pc_look

== a1_pc_click
@ bg=s_a_pc_click
> 我按了一下。畫面跳出一個視窗，上面寫著「確認賣出」。
mate.u: 啊啊啊不要按！我爸會殺了我！
> 阿肥撲過來把視窗關掉。我們兩個在電腦前面喘了很久。
mate.s: ……你剛剛差點把我爸的股票賣掉耶。
> 那天我學到兩件事。第一，數字可以變錢。第二，按錯的話，會被殺。
! go a1_news

== a1_pc_look
> 我沒有碰它。我只是看。
> 那個數字，十二點五。每次碰到十二點五，它就往上彈。
> 我把十二點五記起來，像記住一個朋友的名字。
mate: 你在看什麼啦？很無聊耶。
ag9.s: 不無聊。它在跟我講話。
! go a1_news

== a1_news
! title 國小篇．第三章|找到你了　名叫「規律」的東西
@ bg=s_news time=週日_晚上 bgm=night amb=room tint=warm fade=blink
> 家裡的報紙，有一頁全部都是數字。大人叫它股市版。
> 別人看漫畫。我拿鉛筆，把每天的數字連起來。
> 線往上，線往下。碰到某個地方，就轉彎。
> 我在旁邊寫下自己的猜測。明天，往上。
! note 我的猜測\\n星期一：往上（碰到底了）\\n星期二：往下（太高了）\\n星期三：不動（在想事情）
> 三天後我翻開報紙。三個都對。
> 心臟跳得很快。我好像，找到了一個東西。
> 我決定叫它——規律。
! go a1_dinner

== a1_dinner
@ bg=s_dinner time=週三_晚上 bgm=emo amb=room tint=warm
mom.x: 阿葛，你最近都在報紙上畫什麼？
mom: 老師打電話來，說你都不寫作業。
> 媽媽的筷子停在半空中。她每次擔心的時候，筷子就會停在那裡。
? t=calm | 媽媽在等你。
- 「我在找規律。數字會轉彎，我猜得到。」 {mom+=1} -> a1_dinner_true
- 「沒有啦，我在畫畫。」 -> a1_dinner_lie
- 低頭扒飯，假裝嘴巴很忙 -> a1_dinner_eat

== a1_dinner_true
@ bg=s_a_dinner_true
mom.u: 規律？
ag9: 嗯。像天氣一樣。看久了，就知道明天會不會下雨。
mom.s: ……你這孩子。好啦，但作業還是要寫，知道嗎？
> 她夾了一塊排骨到我碗裡。我覺得那是「我相信你一點點」的意思。
! go a1_six

== a1_dinner_lie
mom: 畫畫喔……那畫得好看一點，不要都畫線。
> 我點頭。我其實很想跟她說。可是我不知道，大人會不會笑。
! go a1_six

== a1_dinner_eat
> 我把整碗飯塞進嘴巴。媽媽看著我，嘆了一口氣。
mom: 慢慢吃啦，又沒人跟你搶。
> 有。時間在跟我搶。可是這句話，我沒說出口。
! go a1_six

== a1_six
@ bg=s_a_board time=週一_上午 bgm=school amb=class tint=none fade=blink
tch: 阿葛，你上來解這題。
> 黑板上的題目，是一條線。往下掉，掉到一個地方，就停了。
> 跟股市版一模一樣。
? t=mid def=1 | 全班都在看你。
- 「答案是六，因為它會反彈。」 {hidden+=1} -> a1_six_say
- 走上去，安安靜靜寫下「6」 {teach+=1} -> a1_six_quiet

== a1_six_say
ag9: 答案是六，因為它會反彈。
@ bg=s_a_laugh
mate.s: 哈哈哈哈！反彈？又不是籃球！
> 全班哄堂大笑。我站在講台上，有點想消失。
@ bg=s_a_board
tch.u: ……答案是六。
> 笑聲停住了。像股價突然停在某個地方。
> 我第一次知道，對的事情，有時候聽起來很好笑。
! go a1_shop

== a1_six_quiet
> 我寫下「6」，回到位子上。
tch.u: ……對。你怎麼算的？
ag9: 它掉到這裡，就會停。
> 老師看了我很久。沒有人笑。但也沒有人懂。
! go a1_shop

== a1_shop
! title 國小篇．第四章|規律＝糖果＝錢
@ bg=s_a_shop time=週三_傍晚 bgm=warm amb=street tint=dusk
! hud candy
> 放學後，我會去巷口的柑仔店，坐在門口的板凳上看報紙。
> 大叔那裡的報紙是免費的。冷氣也是。
ag9: 這個數字到這裡應該會掉下去……
uncle.s: 小鬼頭，你在幹嘛？
> 大叔的毛巾掛在脖子上，身上有醬油跟糖果的味道。
ag9: 我覺得這些數字有規律，碰到某些價位會漲，碰到某些價位會跌。
uncle.u: 喔？
> 他愣了一下。大人愣住的樣子，我已經看過很多次了。
@ bg=s_shop_r1q
! chart 1
uncle.s: 好啊，那你猜，明天這檔會漲還是跌？
> 我盯著那條線。它跌了三天，跌回上次停下來的那條虛線。
> 最後一天那一根，還有底下的量，跟前面都不一樣。
? t=chart def=3 | 第一題：看最後一根Ｋ棒和成交量，明天會漲還是跌？
- 「會漲。」 {guess=1} -> a1_shop_r1j
- 「會跌。」 {guess=-1} -> a1_shop_r1j
- 「……我不知道。」 {guess=0} -> a1_shop_r1j

== a1_shop_r1j
> 我用鉛筆，在報紙上畫了一個箭頭。
! reveal
! if cok -> a1_shop_r1
! go a1_shop_r1x

== a1_shop_r1
@ bg=s_shop_r1 time=週四_傍晚
uncle.s: 小鬼，你猜對了。
uncle.s: 規律不只可以看，還可以換糖果吃。
! set candy+=3; hidden+=1
! sfx coin
> 一包糖果，塞進我手裡。
> 我捧著它，沒有拆開。
> 原來腦子裡看到的東西，可以變成真的東西。
! go a1_shop_r2

== a1_shop_r1x
@ bg=s_shop_r1x time=週四_傍晚
! when cdir>0
uncle.s: 嘿，小鬼，昨天漲了喔。你猜錯啦。
! when cdir<0
uncle.s: 嘿，小鬼，昨天跌了喔。你猜錯啦。
> 我看著報紙。最後那一根，其實早就在告訴我了。
> 我看到了，卻不敢相信自己。
uncle: 不過我看你很認真，這顆給你。
! set candy+=1
! go a1_shop_r2

== a1_shop_r2
@ bg=s_shop_r2 time=週一_傍晚
! chart 2
uncle: 來來來，第二題。這檔連漲五天了，明天呢？
> 線很陡。像溜滑梯倒過來。
> 它頂到上個月的高點了。那裡，有一個看不見的天花板。
> 天花板會擋住它，還是被它撞破？要看最後一根，和量。
? t=chart def=3 | 第二題：頂到前高了。明天會漲還是跌？
- 「明天會累，會掉下來。」 {guess=-1} -> a1_shop_r2j
- 「會衝過去，繼續漲！」 {guess=1} -> a1_shop_r2j
- 「……我不知道。」 {guess=0} -> a1_shop_r2j

== a1_shop_r2j
! reveal
! if cok -> a1_shop_r2ok
! go a1_shop_r2x

== a1_shop_r2ok
@ bg=s_shop_r2a
! when cdir<0
uncle.u: 哈！我賭它繼續漲。
! when cdir>0
uncle.u: 哈！我賭它會掉下來。
@ bg=s_shop_r2ok time=週二_傍晚
! when cdir<0
uncle.s: ……跌了。你這小鬼，邪門喔。
! when cdir>0
uncle.s: ……還真的衝過去了。你這小鬼，邪門喔。
! set candy+=3; hidden+=1
! sfx coin
! go a1_shop_r3
== a1_shop_r2x
@ bg=s_shop_r2x time=週二_傍晚
! when cdir<0
uncle.s: 跌啦！漲到天上？天上沒有天花板喔，報紙上有。
! when cdir<0
> 我記住了。天花板。
! when cdir>0
uncle.s: 漲啦！你看底下的量，那麼大一根，天花板被撞破啦。
! when cdir>0
> 我記住了。量大的時候，天花板也會破。
! go a1_shop_r3

== a1_shop_r3
@ bg=s_shop_r3 time=週五_傍晚 tint=dusk
uncle: 最後一題，猜對了整罐給你。
> 整罐。我的心臟跳得比報紙上的數字還快。
! chart 3
> 那檔股票，一整個禮拜都在同一個地方晃來晃去。不上，不下。
> 可是它不是亂晃。它在呼吸。
! rhythm 6 數著它晃動的節拍
! if rh>=4 -> a1_shop_r3see
> 我數亂了。線在我眼前晃，越看越不清楚。
> 只能自己一根一根數了。
! go a1_shop_r3q

== a1_shop_r3see
! chart mark
> 一、二、三、四。它每晃四天，就會往上跳一次。
> 我在每個跳起來的地方，都點了一個點。
! go a1_shop_r3q

== a1_shop_r3q
? t=chart def=3 | 最後一題：數一數它的節拍。明天呢？
- 「明天會往上跳。」 {guess=1} -> a1_shop_r3j
- 「會往下。」 {guess=-1} -> a1_shop_r3j
- 「……不知道。」 {guess=0} -> a1_shop_r3j

== a1_shop_r3j
! reveal
! if cok -> a1_shop_r3ok
! go a1_shop_r3x

== a1_shop_r3ok
@ bg=s_shop_r3ok time=週六_傍晚
uncle.s: 小鬼頭，你真的……好啦，整罐都給你！
! set candy+=10; hidden+=1
! sfx coin
uncle: 長大以後要是發財了，記得回來請我喝飲料。
ag9.s: 好。
> 我抱著糖果罐走回家。夕陽把我的影子拉得很長。
! go a1_end
== a1_shop_r3x
@ bg=s_shop_r3x time=週六_傍晚
! when cdir>0
uncle: 哈，往上跳啦。沒關係，猜錯是正常的，大人也天天猜錯。
! when cdir<0
uncle: 哈，往下掉啦。沒關係，猜錯是正常的，大人也天天猜錯。
! set candy+=1
> 我看著那條線。差一點點。只差一點點。
! go a1_end

== a1_end
@ bg=s_a_walkhome time=週六_晚上 bgm=emo tint=night
> 回家的路上，我看著手裡的糖果。
? t=calm | 這些糖果……
- 全部存在鐵盒裡，一顆都不吃 {hidden+=1} -> a1_end_keep
- 明天分給阿肥一半 {mate+=1; bond+=0} -> a1_end_share
- 現在吃一顆，甜甜的 -> a1_end_eat

== a1_end_keep
@ bg=s_a_tin
> 我把它們放進餅乾鐵盒，放在床底下。
> 糖果只是開端。我心裡知道，這條路能換到的，遠遠不止糖果。
! go a2_start
== a1_end_share
@ bg=s_a_share
> 隔天我分了一半給阿肥。他高興得在教室裡轉圈。
mate.s: 阿葛，你是我最好的朋友！
> 最好的朋友。這個詞，我想了很久。
> 糖果只是開端。這條路能換到的，遠遠不止糖果。
! go a2_start
== a1_end_eat
@ bg=s_a_eat
> 我拆開一顆。好甜。
> 原來規律，是甜的。
> 糖果只是開端。這條路能換到的，遠遠不止糖果。
! go a2_start

// ---------- 國中 ----------
== a2_start
! pov ag14
! title 國中篇．第一章|還是那個他
@ bg=s_a_exam time=週一_早上 bgm=calm amb=class tint=cold
! hud none
> 國中了。制服變白了，書包變重了。
> 其他的，都沒變。
@ bg=s_a_blank
tch.x: 阿葛，你這次的小卷，又是白卷。
> 白卷不是因為不會。是因為那些題目，跟昨天的長得一樣。
? t=calm | 老師把白卷放在你桌上。
- 「大考我會寫。」 -> a2_blank_promise
- 拿起筆，在白卷背面畫一條 K 線 {hidden+=1} -> a2_blank_draw
- 「對不起。」然後繼續白卷 -> a2_blank_sorry

== a2_blank_promise
tch.x: 你每次都這樣說。
ag14: 我每次都有做到。
> 她沒辦法反駁。這比白卷更讓她生氣。
! go a2_rank
== a2_blank_draw
@ bg=s_a_blank_draw
tch.u: 你在畫什麼？
ag14: 下個月的段考平均分數。會比這次低四分。
tch.x: ……出去罰站。
> 下個月，平均分數低了四分。沒有人記得我說過。
! go a2_rank
== a2_blank_sorry
> 我說了對不起。老師嘆了口氣，好像比我還累。
! go a2_rank

== a2_rank
@ bg=s_a_rank time=段考放榜日 bgm=school
mate.u: 全校第一……又是阿葛？！
mate: 他小卷不是都交白卷嗎？這不合理啦！
> 阿肥跟我同一所國中。他長高了，但還是會在丟東西之前退左腳。
> 第二名那一欄，是一個我沒看過的名字。
mate: 欸，聽說第二名是跳級上來的，比我們小三歲耶。
! go a2_skip

== a2_skip
@ bg=s_a_iq time=週三_下午 bgm=calm amb=class tint=none fade=blink
> 那個跳級生，叫阿哲。圓臉，黑框眼鏡，制服燙得很平。
> 他看我的眼神，像在看一道還沒解開的題目。
me12.x: 你就是阿葛？
ag14: 嗯。
me12.s: 我會超越你的。
> 他說完就走了。我不太懂。我又沒有在跑。
@ time=智力測驗發還 keep=1
> 智力測驗發回來了。我看著上面的數字，皺著眉頭。
> 這個數字，好像不太對。測驗題太少了，沒辦法量到上面。
me12.s: 欸欸，你幾分？我138耶，全班第二高。
me12.s: 你眉頭皺成那樣……該不會很低吧？哈哈，智商低喔？
? t=mid def=3 | 阿哲站在你桌邊，笑得很開心。
- 翻開試卷給他看 -> a2_iq_show
- 「138，很厲害啊。」把試卷收進書包 {bond+=1} -> a2_iq_hide
- 繼續皺眉，不說話 -> a2_iq_silent

== a2_iq_show
@ bg=s_a_iq_show
> 我把試卷翻開。
> 208。
me12.u: ……
> 他的嘴巴打開，然後就沒有再關起來。
> 那一整個禮拜，他都沒有跟我說話。後來我才知道，那叫啞口無言。
! go a2_mock
== a2_iq_hide
@ bg=s_a_iq_lunch
me12.u: 你……你在誇我？
ag14: 嗯。138真的很高。
me12.x: 那你幾分？
ag14: 不重要。
> 後來他還是從老師那邊知道了。208。
> 那一週，他每次經過我的座位，都會停一下，然後什麼都沒說。
> 但下一個禮拜，他開始跟我一起吃午餐。
! go a2_mock
== a2_iq_silent
> 我沒說話。他自己把試卷抽過去看了。
me12.u: 兩……兩百零八？
> 他拿著我的試卷，站在原地，像被罰站。
> 我很想跟他說，這個數字其實也不太準。但他已經走掉了。
! go a2_mock

== a2_mock
@ bg=s_a_mock3 time=週五_放學 bgm=school amb=class tint=warm
> 放學後，我會趴在桌上看行情。手指在計算機上輕輕滑。
mate.s: 阿葛，你又在瞎掰什麼？
> 阿肥帶著兩個同學圍過來。他們看我的平板，像在看外星文字。
? t=12 def=1 | 三個人圍著你的桌子。
- 笑笑，拿起書包走開 -> a2_mock_leave
- 認真解釋什麼叫「支撐」和「壓力」 {mate+=1} -> a2_mock_explain
- 「你們現在笑，十年後會想回來找我。」 {greed+=1} -> a2_mock_cool

== a2_mock_leave
> 我只是笑笑，拿起書包走開。
> 走到校門口，我又打開平板。數字不會笑我。
! go a2_tablet
== a2_mock_explain
ag14: 你看，價格掉到這裡，很多人會想買，所以它就撐住了。這叫支撐。
mate.u: ……喔。所以，那個可以吃嗎？
ag14: 不行。
mate.s: 那我沒興趣。不過你講得好像很有道理耶。
> 其中一個同學，偷偷把那條線抄在課本上了。
! go a2_tablet
== a2_mock_cool
mate.u: 哇，好跩喔！
> 他們笑得更大聲了。我其實不是想耍帥，我只是說了我看到的東西。
> 有些東西，說出來就會變成笑話。我記住了。
! go a2_tablet

== a2_tablet
! title 國中篇．第二章|ALL In Bitcoin
@ bg=s_a_tablet time=週二_放學 bgm=calm amb=class tint=gold
> 報紙之外，現在還有平板。平板裡的世界更大，數字跑得更快。
> 我在網路論壇上，看到一個奇怪的東西。比特幣。
! phone 論壇．冷門板|有人用一萬顆比特幣買了兩片披薩|BTC/USD  $0.10  ▲ 8%|網友A：這東西是騙局吧|網友B：玩具而已，不會有人要的|網友C：我挖了五百顆，拿來當桌布
> 0.1美元。一顆糖果都比它貴。
> 可是它的線，跟我在報紙上畫過的所有線都不一樣。它在慢慢長大。
me12: 阿葛，你在幹嘛？
@ bg=s_a_zhe14
> 阿哲湊過來。他現在每天放學都會來我這裡，假裝只是路過。
ag14: 我在看數字，你懂嗎？這些東西長大會變成錢。
me12.s: 變錢？我們還小，錢都是爸媽給的，不是你畫線就能出來的。
ag14.s: 你不懂，我看到規律。就像國小大叔給我糖果一樣，這些數字也是有規則的。
ag14: 只要抓對時機，零用錢也能變很多。
! hud btc
@ bg=s_a_forum
> 我的零用錢，存了一整個學期。一共十塊美金左右。
? t=mid def=3 | 你的手指停在「買入」上面。
- ALL IN。全部，買一百顆 {btc+=100; hidden+=1} -> a2_buy_all
- 買一半就好，五十顆，剩下留著 {btc+=50} -> a2_buy_half
- 算了，再觀察一陣子 -> a2_buy_none

== a2_buy_all
@ bg=s_a_buy_all
> 我按下去了。一百顆。0.1美元一顆。
me12.u: 為什麼要買這個？
ag14.s: 因為它會長大啊。
> 我眼睛盯著螢幕。它在呼吸。
ag14.s: 長得比糖果大，甜頭也大。
! sfx coin
! go a2_rain
== a2_buy_half
> 五十顆。剩下的錢，我留在存錢筒裡。
me12.u: 為什麼要買這個？
ag14: 因為它會長大。……大概吧。
> 我說「大概」的時候，覺得自己不像自己。
! go a2_rain
== a2_buy_none
> 我把平板關掉。0.1美元。等它跌到0.05再說。
> 它沒有跌到0.05。它再也沒有跌到0.05過。
me12.s: 你也會猶豫喔？難得耶。
> 一個禮拜後，我還是忍不住，用剩下的零用錢買了二十顆。0.3美元。
! set btc+=20
! go a2_rain

== a2_rain
@ bg=s_rain time=週四_放學 bgm=emo amb=rain tint=cold fade=blink
> 下雨了。我沒帶傘。我每天都看天氣，今天卻忘了看。
> 因為今天我一直在看比特幣。
qing14.s: 阿葛……你沒帶傘嗎？
> 是小晴。坐我前面的女生。頭髮上有一個銀色的髮夾。
> 她每次轉過來傳考卷，那個髮夾都會閃一下。
qing14: 我們……順路。要不要一起撐？
? t=12 def=3 | 小晴把透明傘往你這邊傾。
- 「好。」走進傘下，把傘接過來幫她撐 {qing+=2} -> a2_rain_share
- 「不用，我跑回去就好！」衝進雨裡 {qing+=1} -> a2_rain_run
- 低頭說不出話 -> a2_rain_freeze

== a2_rain_share
@ bg=s_a_rain_share
> 我把傘接過來。傘很小，我把它往她那邊歪。
> 我的左肩濕了一整片。可是我一點都不覺得冷。
qing14.s: 你肩膀濕掉了啦。
ag14: 沒關係。雨在三分鐘後會變小。
qing14.u: 你連這個都知道？
> 三分鐘後，雨真的變小了。她笑了。
> 那個笑，我沒有辦法計算。
! go a2_crash
== a2_rain_run
@ bg=s_a_rain_run
ag14: 不用！我跑很快！
> 我衝進雨裡。跑了十公尺，回頭看了一眼。
> 她撐著傘站在原地，好像在笑。
> 我全身都濕了。可是心臟跳得好快。這不在我的規律裡。
! go a2_crash
== a2_rain_freeze
> 我的嘴巴打開，又關上。什麼都說不出來。
qing14.s: ……那傘借你。我等我媽來接。
> 她把傘塞給我，跑回走廊。
> 那把透明傘，我一直沒有還。不是不想還，是不知道要怎麼開口。
! set qing+=1
! go a2_crash

== a2_crash
! title 國中篇．第三章|歸零的那一晚
@ bg=s_night_crash time=週六_凌晨_2:14 bgm=night amb=night tint=night fade=blink
> 半夜兩點。睡不著。我打開平板。
! phone 行情|#BTC  ▼ 61%|BTC/USD  $2.01  ▼ 61%|交易所 Mt.G：暫停提領|論壇：完了，全部歸零|論壇：快逃啊啊啊|論壇：我早說是騙局
! bgm tense
! fx pulse
> 跌了六成。論壇上所有人都在尖叫。
> 我的心臟也在尖叫。但我的眼睛，在看那條線。
> 它掉到了上一次起漲的地方。那裡，有一個看不見的地板。
? t=high def=2 | 螢幕上的紅色一直在往下爬。
- 不動。把平板蓋起來，睡覺 {calm+=1} -> a2_crash_hold
- 先賣一半，保住一點 {btc*=0.5} -> a2_crash_half
- 全部賣掉！ {btc*=0.1} -> a2_crash_all

== a2_crash_hold
! fx none
> 我把平板蓋起來。閉上眼睛。
> 規律說，這裡是地板。我選擇相信規律，不相信尖叫。
! blink
@ bg=s_a_recover time=三週後 bgm=calm tint=gold
> 三週後，它回來了。比原來更高。
! go a2_note
== a2_crash_half
! fx none
> 我賣了一半。手在抖。賣完那一刻，我就知道錯了。
@ bg=s_a_recover time=三週後 bgm=calm tint=gold
> 三週後，它回來了。比原來更高。
> 我把那天的感覺寫在筆記本上：手，不能比腦袋快。
! go a2_note
== a2_crash_all
! fx none
> 我全部賣了。九成，換回了一點點錢。
@ bg=s_a_recover time=三週後 bgm=calm tint=gold
> 三週後，它回來了。比原來更高。
> 我用剩下的錢，再買回了一點點。很少，很少。
> 那天晚上，我把枕頭咬住，沒有哭出聲音。
! go a2_note

== a2_note
@ bg=s_a_note time=週一_上午 bgm=calm amb=class tint=warm fade=blink
> 上課的時候，一張摺成小方塊的紙，從前面傳過來。
> 前面坐的是小晴。
! note 你每天都在看什麼呀？\\n看起來好認真。\\n（我也想看看）\\n——晴
? t=14 def=3 | 你手上捏著那張紙條。
- 寫回去：「在看未來。下課給妳看。」 {qing+=2} -> a2_note_reply
- 畫一條往上的線，什麼都不寫，傳回去 {qing+=1; hidden+=1} -> a2_note_draw
- 把紙條小心收進鉛筆盒，不回 -> a2_note_keep

== a2_note_reply
> 下課的時候，她轉過來。我把平板給她看。
qing14.u: 這個……是比特幣？好像遊戲喔。
ag14: 不是遊戲。是一個實驗。
qing14.s: 那你的實驗成功的話，要第一個跟我說喔。
> 我點頭。她的髮夾閃了一下。
! go a2_mom
== a2_note_draw
> 她打開紙條，看著那條線，歪著頭。
> 然後她在線的最上面，畫了一個小小的笑臉，又傳回來。
> 我把那張紙條夾在筆記本最後一頁。
! go a2_mom
== a2_note_keep
> 我把紙條收進鉛筆盒。我不知道要回什麼。
> 有些題目，我第一次覺得比數學難。
! go a2_mom

== a2_mom
@ bg=s_a_mom14 time=週日_晚上 bgm=emo amb=room tint=warm fade=blink
mom.x: 阿葛，你的零用錢呢？存錢筒怎麼是空的？
mom: 你是不是被人騙了？還是在網路上買了什麼奇怪的東西？
> 媽媽的筷子又停在半空中了。
? t=calm | 你要怎麼回答？
- 把平板拿出來，認真解釋比特幣 {mom+=1} -> a2_mom_true
- 「我拿去買書了。」 -> a2_mom_lie

== a2_mom_true
@ bg=s_a_mom_true
> 我解釋了二十分鐘。從糖果講到地板，從地板講到天花板。
mom.u: ……我聽不懂。
mom.s: 但你講得很像你爸以前講他的夢想。
mom: 好。媽不懂，但媽相信你。只是不要拿別人的錢去玩，知道嗎？
> 那天晚上，碗裡有兩塊排骨。
! go a2_future
== a2_mom_lie
mom: 書喔……那就好。
> 她看著我，沒有再問。我知道她不相信。
> 我也知道，總有一天，我要讓她看懂。
! go a2_future

== a2_future
! title 國中篇．第四章|一場長達十年的實驗
@ bg=s_a_future time=週三_放學 bgm=emo amb=class tint=gold fade=blink
me12: 阿葛，你到底在想什麼？
> 阿哲今天沒有假裝路過。他直接坐在我對面。
ag14.s: 我在看未來啊，你看不到的那一部分。
ag14: 我只是先看，然後決定要不要行動。
me12.u: 未來……你有時光機喔？多啦A夢喔？
> 後來，班上的人私底下都叫我多啦A夢。我覺得還不錯。至少比瘋子好。
? t=calm | 阿哲看著你的平板。
- 「你想看嗎？我教你。」 {bond+=2} -> a2_future_teach
- 「你自己會找到你的。」 {bond+=1} -> a2_future_own

== a2_future_teach
> 我把平板推過去。那天我們看線看到警衛來趕人。
me12.s: 我還是覺得你瘋了。可是……我想看你到底會瘋到哪裡。
> 那是他第一次對我笑。不是嘲笑的那種。
! go a3_start
== a2_future_own
me12.x: 我的什麼？
ag14: 你的規律。每個人都有。
> 他想了很久，然後說，他想當廚師。我嚇了一跳。
> 原來，他也看著某個我看不見的地方。
! go a3_start

// ---------- 高職 ----------
== a3_start
! pov ag17
! title 高職篇．第一章|瘋狂的投資者
@ bg=s_kclass time=2017．九月 bgm=warm amb=kitchen tint=warm
! hud btc
> 台南高商，餐飲科。媽媽問我為什麼。我說，因為廚房跟市場很像。
> 火候到了就要下，晚一秒就焦了。
chef.x: 第一天上課就把計算紙擺在砧板旁邊？你是來切菜還是來算帳的？
> 王師傅。他的鬍子比他的刀還整齊。
? t=12 def=2 | 王師傅站在你面前，雙手抱胸。
- 「都是。」然後把計算紙收進圍裙口袋 -> a3_chef_both
- 默默收起來，拿起菜刀 {kai+=0} -> a3_chef_knife
- 「師傅，蔥的價格下個月會漲三成。」 {greed+=1} -> a3_chef_price

== a3_chef_both
chef.u: 都是？
ag17: 切菜要算角度，算帳要算時機。
chef.s: ……好，嘴巴很利。那刀子也要一樣利。切給我看。
! rhythm 8 跟著師傅的節奏切蔥
! if rh>=6 -> a3_chef_good
chef: 太慢。回去練。
! go a3_kai
== a3_chef_good
chef.s: 嗯，手很穩。可以，算你的。
! go a3_kai
== a3_chef_knife
> 我收起計算紙，拿起刀。蔥在砧板上排成一列，像一條平平的均線。
! rhythm 8 跟著師傅的節奏切蔥
chef.s: 嗯。手還行。
! go a3_kai
== a3_chef_price
chef.u: 蛤？
ag17: 颱風要來了。產地會淹水。
chef.x: ……你給我先把蔥切好。
@ bg=s_a_hall time=十月
> 一個月後，蔥漲了三成。師傅在走廊上看到我，沉默地點了點頭。
! go a3_kai

== a3_kai
@ bg=s_a_kai time=實習課 bgm=warm amb=kitchen
kai.u: 欸欸欸，救命，我的醬汁要燒焦了！
> 隔壁的阿凱。綁著頭巾，手忙腳亂。他做菜很有熱情，但很怕火。
? t=6 def=3 | 阿凱的鍋子開始冒黑煙。
- 衝過去把火關小，加一匙水 {kai+=2} -> a3_kai_help
- 「離火三秒，攪拌，再放回去。」用說的 {kai+=1} -> a3_kai_tell
- 專心顧自己的鍋 -> a3_kai_no

== a3_kai_help
@ bg=s_a_kai_help
> 我關小火，加了一匙水。醬汁冒出一聲嘆氣，活過來了。
kai.s: 哇靠，你神人喔！以後你開店，我一定去幫你！
ag17: 我沒有要開店。
kai.s: 你會的啦，你看鍋子的眼神，跟看你那個什麼幣的眼神一樣！
! go a3_scholar
== a3_kai_tell
kai.u: 三秒？好好好……一、二、三……
kai.s: 欸，真的救回來了！你很會指揮耶。
! go a3_scholar
== a3_kai_no
> 我顧著自己的鍋。阿凱的醬汁燒焦了，被師傅罵了十分鐘。
> 下課的時候，他還是笑著跟我說：明天再來。這個人，很耐摔。
! go a3_scholar

== a3_scholar
@ bg=s_a_scholar time=週五_放學 bgm=calm amb=room tint=cold fade=blink
! phone 學校公告|恭喜 餐飲科一年級 阿葛 同學|獲得本學期卓越獎學金|新台幣  300,000 元|媽：兒子你太厲害了！！！要不要買新衣服？|>不用，媽。我有規劃。
> 三十萬。我看著這個數字，想了很久。
> 可以買很多衣服，很多零食。可是衣服會舊，零食會吃完。
? t=calm | 三十萬，你打算怎麼用？
- 一半找人幫我操作比特幣現貨 -> a3_office
- 全部自己買比特幣 {btc+=12; greed+=1} -> a3_self
- 存銀行。穩穩的就好 {btc+=0} -> a3_bank

== a3_self
> 我自己去開戶。未成年，被交易所退件三次。
> 最後透過網路上一個很奇怪的管道，買到了十二顆。手續費貴到心痛。
> 我發現，一個人能做到的事，有天花板。
> 下學期，我還是去找了A先生。
! go a3_office
== a3_bank
> 我把錢存進銀行。利息一年，差不多是一包糖果。
> 那天晚上，我夢到國小的大叔。他說：小鬼，你的規律呢？
> 下學期，我還是去找了A先生。
! go a3_office

== a3_office
@ bg=s_a_office time=週六_下午 bgm=warm amb=city tint=gold fade=blink
> A先生。學校的傑出校友，做地產的。他的金錶，比他的笑容還亮。
mra.s: 小同學，聽說你想跟我談生意？
> 他倒茶的手很穩。這種人，不會被嚇到。只會被說服。
ag17: 我給你15萬，你幫我買150萬的比特幣現貨。
ag17: 如果跌到120萬就賣掉，錢歸你。
mra.u: ……喔？
ag17: 如果漲了，我賣掉時給你10%手續費，比特幣歸我。
ag17: 如果漲超過10倍，我賣掉15%的錢歸你，其餘比特幣歸我。
> 茶杯停在半空中。
mra.x: 你知道你在說什麼嗎？十五萬，換一百五十萬的部位。
mra: 跌兩成，你的錢全部是我的。
ag17: 我知道。所以你沒有理由拒絕。
? t=mid def=1 | A先生盯著你，等你補充。
- 「就這樣。條件很公平。」 {trustA+=1} -> a3_office_deal
- 「我再加一條：每學期我都會來。」 {trustA+=2} -> a3_office_more
- 「……如果您覺得太冒險，可以不要。」 -> a3_office_soft

== a3_office_deal
mra.s: 哈。好，成交。我就陪你這個小鬼玩一次。
! go a3_office_done
== a3_office_more
mra.u: 每學期？
ag17: 我每學期都會拿到獎學金。一半，都會交給您。
mra.s: ……你這小鬼，是在跟我簽長約啊。好，我喜歡說話算話的人。
! go a3_office_done
== a3_office_soft
mra.x: 你自己都怕，還要我陪你？
> 我說錯話了。猶豫，是會傳染的。
ag17: 我不怕。我只是給您一個退路。現在，退路沒有了。
mra.s: ……有意思。好，成交。
! go a3_office_done

== a3_office_done
> 我把十五萬交給他。這一學期，買到了大約二十五顆。
! set btc+=25
! sfx coin
! go a3_fear

== a3_fear
@ bg=s_a_zhe15 time=週一_午休 bgm=calm amb=class tint=gold
me15: 你不怕跌嗎？
> 阿哲。他跳級又跳級，現在也念餐飲科。他說，他想看我到底在搞什麼。
ag17.s: 跌了沒關係，長期看就好。
me15.u: 你講得好像跌下去不會痛一樣。
? t=calm | 阿哲看著你。
- 「會痛。但痛是短期的。」 {bond+=1} -> a3_fear_pain
- 「你也買一點吧。」 {bond+=1} -> a3_fear_buy

== a3_fear_pain
> 他沉默了一下。然後說，他第一次聽到我承認會痛。
me15.s: 原來你也是人喔。
! go a3_soup
== a3_fear_buy
me15.u: 我？我只有八千塊。
ag17: 八千塊，也是一條線的起點。
me15.x: ……我考慮看看。
> 後來他真的買了。0.3顆。他說那是他的護身符。
! go a3_soup

== a3_soup
@ bg=s_a_soup time=烹飪實習 bgm=tense amb=kitchen tint=warm fade=blink
> 實習課。熬高湯。手機放在灶台邊，螢幕是紅的。
! phone 行情|#BTC  ▼ 18%|BTC/TWD  118萬  ▼ 18%|新聞：某國宣布全面禁止加密貨幣交易|A先生：小鬼，跌破120了，按約定，要不要賣？
> 跌破120萬了。按照約定，這一份要賣掉，十五萬歸他。
> 湯在滾。價格也在滾。
! rhythm 8 跟著湯的翻滾攪拌
! if rh>=5 -> a3_soup_calm
> 湯差點溢出來。我的心也是。
! go a3_soup_choice
== a3_soup_calm
> 攪拌，攪拌。湯穩下來了。我的心也是。
me15: 你的手機一直在震耶……
ag17.s: 湯會翻滾，價格也會翻滾，但只要掌握規律，總能控制結果。
! go a3_soup_choice

== a3_soup_choice
? t=high def=3 | A先生在等你回覆。
- 「照約定賣。這一份歸您。」 {trustA+=2; btc-=6} -> a3_soup_honor
- 「這一份我用其他學期的利潤補保證金，不賣。」 {trustA+=1; calm+=1} -> a3_soup_hold
- 手忙腳亂，手機掉進湯鍋旁邊的水槽 {btc-=8} -> a3_soup_drop

== a3_soup_honor
> 我回：照約定。
mra: 小鬼，你說話算話。我記住了。
> 那一份賣掉了。我少了一點比特幣，多了一點信用。
> 信用，也是一種會長大的東西。
! go a3_library
== a3_soup_hold
mra.u: 你要拿其他部位補？你確定？
ag17: 確定。地板在115萬。
@ bg=s_a_rebound time=兩天後
mra.s: ……反彈了。你這小鬼，真的看得到地板？
! go a3_library
== a3_soup_drop
@ bg=s_a_soup_drop
! fx none
> 手機滑進水槽。等我撈出來、擦乾、開機，已經是十分鐘後。
> A先生依約賣掉了那一份。十分鐘，市場已經走了好遠。
chef.x: 實習課玩手機？湯也焦了！
> 那天我被罰洗了三十個鍋子。
! go a3_library

== a3_library
@ bg=s_a_library time=週三_放學 bgm=calm amb=room tint=cold fade=blink
> 放學後的圖書館，只有翻報紙的聲音。
> 我在筆記本上寫滿數字。每一個數字，都是一個還沒發生的明天。
qing14.s: ……阿葛？
> 我抬頭。小晴站在書架旁邊，抱著一疊參考書。她念隔壁的高中。
qing14: 我來這裡借書。你還在看那個……比特幣？
ag17: 嗯。
qing14.s: 你的實驗，成功了嗎？
? t=12 def=3 | 她的髮夾，還是那一個。
- 「還沒。但快了。成功的那天，第一個告訴妳。」 {qing+=2} -> a3_lib_promise
- 把筆記本攤開給她看 {qing+=1} -> a3_lib_show
- 「嗯……」低頭繼續寫 -> a3_lib_cold

== a3_lib_promise
qing14.s: 你國中也這樣說過。
ag17: 我記得。
> 她笑了。那個笑，我還是算不出來。
! go a3_lib_after
== a3_lib_show
qing14.u: 好多數字……你寫得好密。
qing14.s: 這一頁的線，好像國中你傳給我的那一條。
> 她還記得。我以為只有我記得。
! go a3_lib_after
== a3_lib_cold
> 她站了一下，然後說：那……加油。
> 她走了以後，我才發現自己寫錯了三個數字。
! go a3_lib_after

== a3_lib_after
> 零用錢換糖果，獎學金換比特幣。我一直在證明一件事。
> 只要掌握規律，未來就能被掌握。
! go a3_years

== a3_years
! title 高職篇．第二章|定投結束
@ bg=s_a_years time=三年 bgm=emo amb=room tint=gold fade=blink
> 三年，一下子就過了。每學期三十萬，一半交給A先生，一半留著生活和定投。
> 我依然是第一。阿哲，依然是第二。
! phone 筆記本．定投紀錄|一上  ▲  25 顆|一下  ▲  23 顆|二上  ▲  24 顆|二下  ▲  22 顆|三上  ▲  24 顆|三下  ▲  24 顆|合計  ▲  142 顆
! set btc+=117
> 一百四十二顆。按照約定，超過十倍的部分，要分給A先生。
> 我算過了。是二十顆。
! go a3_qing_bye

== a3_qing_bye
@ bg=s_a_qingmsg time=畢業前一週 bgm=emo amb=rain tint=cold
> 畢業前，小晴傳訊息給我。她要搬去台北念大學了。
! phone 訊息|小晴：阿葛，我下禮拜要搬去台北了|小晴：那把透明傘，你還留著嗎？|小晴：留著的話，就當紀念吧|小晴：你的實驗，成功的話記得告訴我
? t=14 def=3 | 你要回什麼？
- 「傘我留著。等妳回台南，我撐給妳。」 {qing+=2} -> a3_qing_umb
- 「一路順風。」 -> a3_qing_plain
- 打了很長一段，又全部刪掉 -> a3_qing_delete

== a3_qing_umb
> 她回了一個笑臉。跟國中紙條上畫的，一模一樣。
! go a3_grad
== a3_qing_plain
> 她回：你也是。然後就沒有然後了。
! go a3_grad
== a3_qing_delete
> 打字，刪掉。打字，刪掉。最後，什麼都沒送出去。
> 已讀，沒有回。這個詞，原來是在說我。
! go a3_grad

== a3_grad
@ bg=s_a_grad time=畢業典禮 bgm=emo amb=wind tint=gold fade=blink
mra: 小鬼，畢業快樂。
> A先生來了。他站在鳳凰樹下，金錶在陽光底下閃。
mra.s: 三年。說實話，我第一學期就以為你會爆。
mra: 現在帳上是一百四十二顆。按照約定，超過十倍的那一份……
? t=mid def=2 | A先生沒有說完。他在看你會怎麼做。
- 「二十顆，是您的。」把轉帳畫面拿給他看 {btc-=20; trustA+=3; hidden+=1} -> a3_grad_honor
- 「十五顆吧？三年的手續費我也算過。」 {btc-=15; trustA+=1} -> a3_grad_bargain
- 「其實……約定的計算方式可以再討論。」 {btc-=5; trustA-=3; greed+=2} -> a3_grad_cheat

== a3_grad_honor
> 我把轉帳畫面拿給他看。二十顆，已經送出去了。
mra.u: ……你連問都沒讓我問。
mra.s: 好小子。以後你要做什麼生意，我都跟。
> 一百二十二顆。全部歸我。
! go a3_grad_after
== a3_grad_bargain
mra.x: 十五顆？
> 他看著我，看了很久。然後笑了。
mra: 算你會算。好，十五。但我會記得，你殺了我五顆。
! go a3_grad_after
== a3_grad_cheat
mra.x: 討論？
> 他的笑容消失了。像K線突然斷掉。
mra: 小鬼，市場會原諒你看錯，但人不會原諒你說話不算話。
> 他只拿了五顆，就走了。從此以後，他再也沒有接過我的電話。
! go a3_grad_after

== a3_grad_after
me15: 你打算拿這些幣做什麼？
> 阿哲站在我旁邊。他手上捧著畢業證書，眼睛卻在看我的筆記本。
ag17.s: 存著就好，長期看漲。
> 就像國小的那罐糖果。我一顆都沒有吃。
! go a4_start

// ---------- 初入社會 ----------
== a4_start
! pov ag22
! title 初入社會篇|冷靜操盤手
@ bg=s_a_bento time=週二_中午 bgm=calm amb=street tint=warm
! hud both
> 高職畢業以後，我走進了社會。社會比教室吵很多。
> 午餐。路邊。一個排骨便當，一支手機。
me20.x: 你就不能休息一下嗎？
> 阿哲。他現在在一間大飯店當學徒，說要學最正統的法式料理。
> 他每次放假，都會跑來看我吃便當。很奇怪的興趣。
? t=12 def=2 | 排骨還熱著。手機上的線在跳。
- 「市場不會等我，規律會過期。」繼續看 {greed+=1} -> a4_bento_look
- 把手機蓋起來，認真吃一口排骨 {bond+=1} -> a4_bento_eat

== a4_bento_look
ag22.s: 市場不會等我，規律會過期。
me20.s: ……你這句話，聽起來好像很帥，但你嘴邊有飯粒。
! go a4_meetup
== a4_bento_eat
@ bg=s_a_bento_eat
> 我把手機蓋起來。排骨，好吃。原來我很久沒有好好吃一頓飯了。
me20.s: 你看，世界沒有毀滅。
ag22: 嗯。剛剛漲了兩趴。
me20.x: ……你連蓋著都知道喔？
! go a4_meetup

== a4_meetup
@ bg=s_meetup time=週五_晚上 bgm=warm amb=rest tint=warm fade=blink
> 幣圈聚會。很多人穿著印著幣的T恤，講著會改變世界的計畫。
> 我只是來聽聽，大家在怕什麼。
viv.s: 你是那個一直在角落不說話的人。
> 低馬尾，黑色西裝外套。手上拿著氣泡水，不是酒。
viv: Vivian。做量化交易的。我看你剛剛聽台上講話的表情，像在看一個笑話。
viv.x: 所以，你覺得以太坊合約怎麼樣？
? t=mid def=3 | 她的問題很尖，眼神更尖。
- 「規律還沒過期。但槓桿會讓人忘記規律。」 {viv+=2} -> a4_meet_sharp
- 「妳覺得呢？」把問題丟回去 {viv+=1} -> a4_meet_back
- 「我只是來吃東西的。」 -> a4_meet_shy

== a4_meet_sharp
viv.u: ……你幾歲？
ag22: 二十二。
viv.s: 我在這行七年，第一次聽到有人把這件事說得這麼短。
viv: 給我你的聯絡方式。我想知道，你到底是天才，還是運氣好。
! go a4_eth
== a4_meet_back
viv.s: 會反問的人，通常心裡已經有答案了。
viv: 好吧，下次見面，你再告訴我。
> 她遞來一張名片。很硬的紙。
! go a4_eth
== a4_meet_shy
viv.s: 吃東西？這裡的點心是全台南最難吃的。
viv: 算了，有緣再見，角落先生。
! go a4_eth

== a4_eth
@ bg=s_a_trade time=週日_深夜 bgm=night amb=room tint=cold fade=blink
> 深夜。三個螢幕。一杯冷掉的茶。
> 0.4顆以太幣。這是我拿來試合約的，像國小那顆不敢拆的糖果。
! set eth=0.4
> 以太幣本位合約。賺的是幣，賠的也是幣。
? t=mid def=3 | 第一筆合約。
- 低倍數開多，一點一點來 {eth=1; calm+=1} -> a4_eth2
- 直接開二十倍，衝！ {eth=1.6; greed+=2} -> a4_eth2
- 算了，現貨就好，不碰合約 -> a4_eth_skip

== a4_eth_skip
> 我把視窗關掉。0.4顆，就讓它安安靜靜地待著。
> 有些規律，看得到，不代表要去碰。
! go a4_dinner

== a4_eth2
@ time=三個月後 tint=cold keep=1
! phone 合約帳戶|#Ξ 10.2  ▲|ETH 本位．多單|保證金率  安全|浮動盈虧  ▲ 920%
! set eth=10
> 1顆，變成10顆。我沒有開香檳。我只是在筆記本上，畫了一條新的線。
! go a4_dinner

== a4_dinner
@ bg=s_a_rechao time=週三_晚上 bgm=warm amb=street tint=warm fade=blink
me20.s: 今天我請客！我升二廚了！
> 阿哲很開心。他點了一桌熱炒。
> 我拿出手機，先算了一下帳本。這是習慣。
me20.x: 你連朋友請客都要算帳喔？
? t=12 def=2 | 阿哲的笑容僵在臉上。
- 「我在算，你升二廚之後，多久可以開自己的店。」 {bond+=2} -> a4_dinner_warm
- 「習慣了。」 -> a4_dinner_plain

== a4_dinner_warm
me20.u: ……你在幫我算？
ag22: 三年。如果你每個月存兩萬，加上你那0.3顆。
me20.s: 你這個人……真的很難讓人生氣耶。
> 那天他喝醉了，一直說我是他這輩子最討厭的人。邊說邊笑。
! go a4_advice
== a4_dinner_plain
> 他嘆了口氣，然後繼續吃。
me20: 你知道嗎，你這樣很難交朋友。
> 我知道。但我還是有一個。
! go a4_advice

== a4_advice
@ bg=s_a_advice time=週末_講座後 bgm=warm amb=rest tint=warm
> 有人知道我在做什麼了。陌生人來問我投資心得。
? t=calm | 一個大學生紅著眼問你：我已經虧了一半，怎麼辦？
- 「只要理解規律，就不用怕。」 {calm+=1} -> a4_advice_line
- 「先關掉螢幕，去睡一覺。」 {bond+=0} -> a4_advice_sleep
== a4_advice_line
ag22.s: 只要理解規律，就不用怕。
> 他看著我，好像不太懂。沒關係，我在他這個年紀，也沒有人懂我。
! go a4_kitchen
== a4_advice_sleep
ag22: 先關掉螢幕，去睡一覺。害怕的時候，看到的都不是規律。
> 他愣了一下，然後笑了。說謝謝。
! go a4_kitchen

== a4_kitchen
@ bg=s_a_kitchen time=週六_傍晚 bgm=warm amb=kitchen tint=warm fade=blink
> 我在家裡的廚房煮菜。鍋子在火上，螢幕在桌上。
> 一邊翻炒，一邊看幣價。蒜要在金黃的前一秒起鍋。單也是。
me20.u: ……你在幹嘛？
> 阿哲站在門口。他來借醬油，結果看傻了。
! phone 合約帳戶|#Ξ 100.4  ▲|ETH 本位．多單|保證金率  注意|浮動盈虧  ▲ 884%|Vivian：你那邊看到了嗎？大戶在出貨
! bgm tense
! fx pulse
> 一根長長的針，往下插。爆倉線就在下面一點點。鍋子裡的蒜，也快焦了。
? t=high def=3 | 鍋子在響，螢幕在閃。
- 先關火，冷靜追加保證金，撐住 {eth=100; calm+=1} -> a4_k_hold
- 停損一半，保命要緊 {eth=55} -> a4_k_cut
- 兩邊都想顧，手忙腳亂 {eth=30; greed+=1} -> a4_k_mess

== a4_k_hold
@ bg=s_a_k_hold
! fx none
> 我關火。追加保證金。然後，等。
> 那根針收回去了。像被大叔塞回罐子裡的糖果。
me20.s: 你剛剛……眼睛都沒眨。
ag22.s: 蒜沒焦。
> 我把菜盛起來。動作乾脆，不慌不忙。
me20: 這就是你。把投資當遊戲，把烹飪當藝術。
! go a4_rest
== a4_k_cut
! fx none
> 我停損了一半。針收回去的時候，我看著那一半，沒有說話。
> 蒜焦了。我倒掉，重炒一次。
me20: 你還好嗎？
ag22: 嗯。焦的東西，倒掉就好。
! go a4_rest
== a4_k_mess
! fx none
> 鍋子翻了。單也爆了一部分。阿哲幫我撿起地上的高麗菜。
me20.x: 一次只做一件事啦，天才。
> 他說得對。這是我第一次，被他說對。
! go a4_rest

== a4_rest
@ bg=s_rest_yu time=一年後．週四_晚上 bgm=warm amb=rest tint=warm fade=blink
> 我開了一間小餐廳。不大，十二個位子。流水可能比不上一單合約。
> 但做菜的時候，我腦袋裡的數字會安靜下來。
kai.s: 老闆！三號桌那位又來了，一樣的麵！
> 阿凱。他真的來幫我了。說話算話，跟我一樣。
> 三號桌。小雨。每週四都來，點同一碗牛肉麵，帶一本素描本。
yu.s: 老闆，你今天的湯，比上週甜一點。
ag22.u: ……妳吃得出來？
yu.s: 我是畫畫的。我很會看小地方。
yu: 像你每次端麵過來，都會先看一眼窗外。好像在等什麼。
? t=14 def=3 | 小雨用筆尾點著素描本，看著你。
- 「我在等妳說，湯變甜了。」 {yu+=2} -> a4_yu_flirt
- 送她一盤今天新試的小菜 {yu+=1} -> a4_yu_dish
- 「慢用。」回到廚房 -> a4_yu_cold

== a4_yu_flirt
yu.u: ……老闆，你這樣講，我會臉紅耶。
> 她低頭畫畫。我瞄了一眼，素描本上，是一個站在鍋子前面的人。
kai.s: 老闆，你的臉比辣椒還紅喔。
! go a4_reunion
== a4_yu_dish
yu.s: 這是招待？那我畫一張給你當回禮。
> 隔週，牆上多了一張畫。一碗冒煙的麵，和一扇窗。
! go a4_reunion
== a4_yu_cold
> 她笑了笑，低頭吃麵。
kai: 老闆，你真的很不會聊天欸。
! go a4_reunion

== a4_reunion
@ bg=s_reunion time=下雨的週六 bgm=emo amb=rain tint=cold fade=blink
> 打烊前，門口的風鈴響了。
qing22.u: ……阿葛？真的是你？
> 銀色髮夾。透明傘。我一秒就認出來了。
qing22.s: 我回台南工作了。朋友說這裡的麵很好吃，沒想到……老闆是你。
? t=14 def=3 | 雨很大。她的傘在滴水。
- 「先進來。我煮一碗給妳。」 {qing+=1} -> a4_re_cook
- 從櫃台後面拿出那把舊傘 {qing+=2} -> a4_re_umb
- 「……好久不見。」然後不知道要說什麼 -> a4_re_shy

== a4_re_cook
> 我煮了一碗麵。她吃得很慢，好像每一口都在想什麼。
qing22.s: 你的實驗，成功了嗎？
> 十年了。她還記得。
! go a4_re_after
== a4_re_umb
@ bg=s_a_re_umb
qing22.u: 這是……國中那把？你還留著？
ag22: 我說過，等妳回台南，我撐給妳。
> 她看著那把傘，眼睛紅了一下，然後笑了。
qing22.s: 你這個人，記規律記得很好，記約定也記得很好。
! go a4_re_after
== a4_re_shy
> 好久不見。然後是很長的沉默。雨聲把沉默填滿了。
qing22.s: 你還是一樣，話很少。
! go a4_re_after

== a4_re_after
! when qing>=4
> 那天，我撐著那把舊傘，送她回家。傘很小，我又把它往她那邊歪了。
! go a4_viv

== a4_viv
@ bg=s_a_vivmsg time=週三_晚上 bgm=warm amb=rest tint=warm
! if viv<1 -> a4_yu2
! phone 訊息|Vivian：角落先生，你上次說的那件事，我驗證了|Vivian：你是對的|Vivian：週五有空嗎？我請你吃飯。不聊幣，或者，只聊一點點
? t=14 def=3 | 你看著 Vivian 的訊息。
- 「好。我訂位，在我的店。」 {viv+=2} -> a4_viv_yes
- 「只聊幣的話，可以。」 {viv+=1} -> a4_viv_work
- 已讀，不回 -> a4_viv_no

== a4_viv_yes
@ bg=s_a_vivbar
> 週五，她坐在吧台。我做了一桌菜。她第一次笑得不像在談判。
viv.s: 你做菜的時候，眼神跟看盤一模一樣。
viv: 我很好奇，你這種人，會為了什麼停下來。
! go a4_yu2
== a4_viv_work
viv.s: 好，那就只聊幣。……一點點就好。
> 我們聊了三個小時的幣。她說，這是她最近最開心的一頓飯。
! go a4_yu2
== a4_viv_no
> 我沒有回。三天後，她傳了一個貼圖：一隻在角落的貓。
! go a4_yu2

== a4_yu2
@ bg=s_a_yu2 time=週四_打烊前 bgm=warm amb=rest tint=warm fade=blink
! if yu<1 -> a4_climb
yu.s: 老闆，我下個月在運河邊有個小畫展。
yu: 你……要不要來看？就當作，我請你吃麵的回禮。
kai.s: 老闆，週日我可以顧店喔。我可以喔。我真的可以喔。
? t=14 def=3 | 小雨把一張手繪的邀請卡放在吧台上。
- 「我會去。我帶兩杯熱茶。」 {yu+=2} -> a4_yu2_yes
- 「那天我要看盤……我盡量。」 {yu+=1} -> a4_yu2_maybe
- 「謝謝，但我走不開。」 -> a4_yu2_no
== a4_yu2_yes
yu.s: 那說好了喔。熱茶要無糖的。
> 那天，我第一次為了一件跟數字無關的事，把手機調成靜音。
! go a4_climb
== a4_yu2_maybe
yu: 盡量……好，那我盡量等你。
> 我去了。遲到了二十分鐘。她站在畫的前面，看到我的時候，笑得像湯變甜了。
! go a4_climb
== a4_yu2_no
yu.s: 沒關係。我知道，你的世界很忙。
> 她還是每週四都來。只是，素描本再也沒有打開過。
! go a4_climb

== a4_climb
@ bg=s_a_climb time=那一年的牛市 bgm=tense amb=room tint=cold fade=blink
! if eth<1 -> a4_noeth
! phone 合約帳戶|#Ξ 812.0  ▲|ETH 本位．多單|從 0.4 → 1 → 10 → 100 → 800|浮動盈虧  ▲ 驚人|Vivian：你還不平倉？|阿哲：你還活著嗎？三天沒回訊息了
! set eth=800
> 0.4。1。10。100。800。
> 我看著那個數字。房間很安靜，只有主機的風扇在轉。
> 規律說，這裡是天花板。國小大叔說過，天上沒有天花板，報紙上有。
! fx pulse
? t=high def=3 | 800顆以太幣。手指停在按鈕上。
- 按下平倉。不喊，不笑，只是看著遠方 {calm+=2} -> a4_close
- 再開十倍，把 800 變成 8000 {greed+=3} -> a4_greed
- 盯著螢幕發呆…… {eth=500} -> a4_close_late

== a4_close
! fx none
! bgm emo
> 我按下平倉鍵。
> 沒有大喊，也沒有表情。只是靜靜望著窗外。
> 我在想，下一步。
! go a5_start
== a4_close_late
! fx none
! bgm emo
> 發呆了太久。等我回過神，天花板已經壓下來了一截。
> 我平倉在五百顆。還是很多。但我知道，我的手慢了。
! go a5_start
== a4_noeth
> 合約的牛市，我只是看著。0.4顆以太幣，安安靜靜地待在錢包裡。
> 有人說我錯過了。我覺得，我只是選了不一樣的地板。
! go a5_start

== a4_greed
@ bg=s_a_greed
> 八千。八千顆。我腦袋裡第一次出現一個不是規律的聲音。
> 那個聲音說：你是多啦A夢，你不會錯。
! sfx crash
! phone 合約帳戶|#Ξ 0.00  ▼|ETH 本位．多單|強制平倉|保證金率  0%|阿哲：……你還好嗎？
! fx none
> 一根針。只用了四分鐘。
! end liq

// ---------- 2025 ----------
== a5_start
! title 終章|2025　回顧
@ bg=s_a_door time=2025．秋天的傍晚 bgm=emo amb=rest tint=dusk fade=blink
> 2025年。餐廳的燈亮著。阿凱在旁邊切蔥。
kai: 老闆，今天大盤怎麼樣？
ag22.s: 照規律走。
> 我一邊翻炒，一邊小聲跟他討論市場。客人不會知道，這間小店的老闆在想什麼。
> 銀行的活存，可以買好幾十台遊艇。投資的收益，比餐廳一年的流水還多。
> 但我還是每天站在這個鍋子前面。
! if btc<100 -> a5_ordinary
> 從國中的一百顆，到高職的一百二十二顆。比特幣大約兩百二十二顆。
! when eth>=500
> 以太幣，大約八百顆。
> 這些數字，我沒有跟任何人說過全部。說了，也只是一部分。
> 這世界的規則我都知道，只是你們看不到。
! go a5_last

== a5_ordinary
> 我手上的比特幣，沒有很多。那些年，我太常在半夜按下賣出。
> 但餐廳的湯，每天都很好喝。阿凱說，這樣也很好。
! end ordinary

== a5_last
@ bg=s_harbor time=2025．跨年夜 bgm=night amb=harbor tint=dusk fade=blink
> 跨年夜。我站在安平的碼頭。手機一直在震。
! phone 訊息|阿哲：今晚來我新開的店吧，我留了一個位子|小晴：你的實驗……成功了嗎？今晚要不要一起看煙火？|小雨：老闆，我畫好了一張畫，想今晚拿給你|Vivian：角落先生，今晚市場休息，你也休息一下吧
> 我想了很久。今晚，只能去一個地方。
? t=calm | 2025年的最後一個晚上。
- [if hidden>=6 && panic==0] 回家，從床底拿出那個餅乾鐵盒 -> a5_hidden
- [if bond>=3] 去阿哲的店 -> a5_bond
- [if qing>=5] 撐著那把舊傘，去找小晴 -> a5_love_qing
- [if yu>=3] 回店裡，等小雨的畫 -> a5_love_yu
- [if viv>=4] 回 Vivian：「那就一起休息。」 -> a5_love_viv
- 一個人，看著海 -> a5_legend

== a5_legend
[N] > 我一個人看著海。遊艇的燈，一盞一盞亮起來。
[R] > 這片海，我好像看過很多次了。每一次，都一樣安靜。
! if trustA<0 -> a5_legend_alone
> 國小的糖果，國中的一百顆，高職的一百二十二顆，那個按下平倉的晚上。
> 我沒有時光機。我只是比大家早一點，看見規律。
! end legend
== a5_legend_alone
> 我很有錢。但那年畢業典禮上，A先生的眼神，我一直記得。
> 市場會原諒你看錯，人不會原諒你說話不算話。
! end ordinary

== a5_bond
@ bg=s_a_friend time=2025．跨年夜 bgm=warm amb=night tint=night fade=blink
me20.s: 你真的來了？我以為你會在看盤。
ag22.s: 今晚市場休息。
> 我們坐在他店的頂樓。啤酒，還有一包從柑仔店買來的糖果。
me20: 欸，我跟你說。我一開始真的把你當笑話。
me20.s: 十年後才發現，我自己才是笑話。
ag22: 你不是笑話。你是第二名。
me20.x: ……你一定要在這種時候講這個嗎？
> 我們笑到煙火都放完了。
! end bond

== a5_love_qing
@ bg=s_date time=2025．跨年夜 bgm=emo amb=wind tint=night fade=blink
qing22.s: 你真的帶著那把傘耶。今天又沒下雨。
ag22: 我只是想撐給妳。
qing22: 所以呢？你的實驗，成功了嗎？
ag22.s: 成功了。妳是第一個知道的。
> 她靠過來一點點。煙火在河面上散開。
> 剩下的事，就不用寫在筆記本上了。
! set partner='小晴'
! end love_qing

== a5_love_yu
@ bg=s_a_yu_end time=2025．跨年夜 bgm=emo amb=rest tint=night fade=blink
yu.s: 老闆，你真的回來了。
> 她把畫遞給我。畫裡是一個站在鍋子前面的人，旁邊是一個坐在三號桌的人。
yu: 我想說……我不只是喜歡你的麵。
ag22.s: 我知道。湯變甜，是因為妳每週四都會來。
> 我們沿著運河走。兩杯熱茶，一張畫。
> 燈，暗下來了。
! set partner='小雨'
! end love_yu

== a5_love_viv
@ bg=s_a_viv time=2025．跨年夜 bgm=emo amb=wind tint=night fade=blink
viv.s: 你居然真的回了。我以為你會已讀。
ag22: 妳說，市場休息。
viv: 我問過你，你這種人，會為了什麼停下來。
ag22.s: 現在知道了。
> 她笑了。不像談判，不像交易。只是笑。
> 那一晚，誰都沒有看盤。
! set partner='Vivian'
! end love_viv

== a5_hidden
@ bg=s_hidden time=2025．跨年夜 bgm=night amb=room tint=warm fade=blink
> 我回到老家，從床底下拿出那個餅乾鐵盒。
> 裡面是國小那罐糖果。一顆都沒有吃。還有那本畫滿影子的筆記本。
> 第一頁寫著：榕樹的影子，明天會碰到第三根欄杆。
> 最後一頁，是國中小晴傳回來的紙條。那條往上的線，和線頂端的笑臉。
> 我翻到中間。那裡有一行我自己都忘記寫過的字。
! note 給長大的我：\\n你會看到很多數字。\\n但不要忘了，\\n糖果是拿來分給別人的。\\n——九歲的阿葛
> 我笑了。原來我真的有一台時光機。它一直在床底下。
! end hidden

// ===================== 第三視角：我 =====================
== b1_start
! hud none
! title 國小篇．第一章|孤僻的小孩
@ bg=s_b_window time=很久以前．國小 bgm=calm amb=class tint=warm
> 我第一次遇到阿葛，是在國中。但他國小的事，後來我聽了太多遍，多到好像我也在場。
> 阿葛在國小的時候就很奇怪。
> 別的小孩下課衝去操場玩躲避球，他卻常常坐在教室角落發呆，眼睛直直望著窗外。
> 你要說他在放空也不像，因為他眼神裡有東西。
> 那種距離感，像是他在看一個我們看不到的地方。
? t=calm | 如果那時候我在那間教室……
- 走過去，看看他到底在看什麼 {bond+=1; look+=1} -> b1_window_go
- 跟大家一起衝去操場 -> b1_window_play

== b1_window_go
> 我想像自己走過去，站在他旁邊，順著他的視線看出去。
> 只有一棵榕樹，和地上的影子。
ag9: 影子明天會碰到第三根欄杆。
> 如果是那時候的我，大概會覺得他腦子有病吧。
! go b1_teacher
== b1_window_play
> 我大概會跟大家一起衝出去。那時候的我，只想當第一個搶到球的人。
> 教室角落那個人，不在我的世界裡。至少，那時候還不在。
! go b1_teacher

== b1_teacher
@ bg=s_b_teacher time=國小．數學課 bgm=school amb=class tint=none fade=blink
> 老師常常氣得半死，因為他幾乎不寫作業，考卷上只寫幾行，卻總能答對最難的題目。
tch.x: 阿葛，作業呢？
ag9: 寫在腦袋裡了。
> 到最後老師也懶得管了，只是搖頭說：
tch: 這孩子腦袋不知道裝了什麼。
> 最讓我印象深刻的，是有一次數學小考，大家都在低頭算題。
> 他卻拿著鉛筆在桌上畫圈圈，還自顧自地笑。
? t=mid def=2 | 那個在桌上畫圈圈的小孩……
- 偷看他的考卷 {look+=1} -> b1_peek
- 心想：完了，這傢伙要在畫畫了 -> b1_doom

== b1_peek
> 我偷看了一眼。考卷上只有幾個數字。圈圈裡面，好像藏著什麼。
> 結果考卷發下來，滿分。
! go b1_dodge
== b1_doom
> 我心裡想，完了，這傢伙要在畫畫了。
> 結果考卷發下來，滿分。
! go b1_dodge

== b1_dodge
@ bg=s_b_dodge time=國小．下課 bgm=school amb=street tint=warm fade=blink
mate.s: 阿葛！缺一個人啦！來打躲避球！
> 這是阿肥。阿葛國小的同學，後來也跟我們念同一所國中。他跟我講過很多阿葛的事。
mate: 他第一次來打躲避球，被打中四次。第五次，他先躲了。
mate.u: 他說，丟球的人每次丟之前，左腳都會往後退。那時候我們才九歲耶！
? t=calm | 阿肥講得很興奮。
- 「然後呢？他還發現了什麼？」 {mate+=1; look+=1} -> b1_pc
- 「九歲就這麼會觀察，很恐怖耶。」 -> b1_pc

== b1_pc
! title 國小篇．第二章|Money game
@ bg=s_b_pc time=國小三年級．週六 bgm=calm amb=room tint=none fade=blink
> 阿葛在國小三年級時，人生第一次碰到「錢的遊戲」。
> 那天他去同學家玩電腦，電腦螢幕上正好卡著一個數字跑來跑去的頁面。
> 上面紅紅綠綠的字，他盯了很久才問：
ag9: 這是什麼？
mate: 啊這是我爸在看股票啦，亂按會被罵的。
> 阿葛沒說話，只是默默走近螢幕。他看到那些數字忽上忽下，像是有規律在呼吸。
> 他才八九歲，但眼神裡忽然亮了一下，好像抓到什麼規則。
ag9.u: 所以這些數字是可以變錢的？
> 他小聲問。同學一愣，笑著說：
mate.s: 我也不知道耶，反正我爸每天都盯著看。
! go b1_rule

== b1_rule
! title 國小篇．第三章|找到你了　名叫「規律」的東西
@ bg=s_b_news time=國小．夜晚 bgm=night amb=room tint=warm fade=blink
> 阿葛沒再多話，可是眼睛卻盯得死死的。
> 他發現那些數字不像亂跳，而是有規律，好像在呼吸。
> 有些數字碰到一個地方就會往下掉，碰到另一個地方就會往上衝。
> 他當時年紀小，根本不懂什麼支撐壓力。
> 但他心裡有種很奇怪的直覺：這些價格是有規則的。
> 後來他開始偷翻報紙的股市版。別人看漫畫，他卻在紙上畫線。
> 他拿鉛筆把漲跌連起來，還偷偷在旁邊寫下自己的猜測。
! note 星期一：往上（碰到底了）\\n星期二：往下（太高了）\\n星期三：不動（在想事情）
> 幾次之後，他竟然發現：真的跟他想的一樣，價格總是在某些數字前後轉向。
! go b1_mom

== b1_mom
@ bg=s_b_mom time=國小．晚餐 bgm=emo amb=room tint=warm fade=blink
> 很多年後，阿葛的媽媽請我吃飯。她跟我說了一件事。
mom.x: 那時候老師打電話來，說他都不寫作業。我好擔心。
mom: 我問他在報紙上畫什麼，他說，他在找規律。
mom.s: 一個九歲的小孩，跟我說規律。我筷子都停在半空中了。
? t=calm | 阿葛媽媽看著我。
- 「阿姨，他是對的。」 {mom+=1; bond+=1} -> b1_mom_right
- 「換作是我，也會很擔心。」 {mom+=1} -> b1_mom_worry

== b1_mom_right
mom.s: 我知道。但我花了十年才知道。
> 她夾了一塊排骨給我。我突然明白阿葛為什麼那麼愛吃排骨。
! go b1_six
== b1_mom_worry
mom.s: 對吧？你是第一個這樣說的人。大家都只會跟我說：你兒子好厲害。
mom: 厲害的孩子，也是會讓媽媽擔心的。
! go b1_six

== b1_six
@ bg=s_b_six time=國小．數學課 bgm=school amb=class tint=none fade=blink
> 有一次數學課，老師叫他解題。他愣了一下，突然冒出一句：
ag9: 答案是六，因為它會反彈。
mate.s: 哈哈哈哈哈！反彈！又不是籃球！
> 全班哄堂大笑，說他在胡扯，結果答案真的對。
> 那時候我還不懂，只覺得這傢伙腦子有病。
> 現在回想起來，那大概就是他第一次「看穿規律」的時候。
> 他在我們看不到的地方，已經開始和數字對話了。
! go b1_shop

== b1_shop
! title 國小篇．第四章|規律＝Candy＝Money
@ bg=s_b_shop time=國小．放學後 bgm=warm amb=street tint=dusk fade=blink
! hud candy
> 阿葛盯著報紙畫線的習慣，被附近雜貨店的大叔注意到。
> 那天放學，他拿著鉛筆在報紙的股市版亂畫，嘴裡還小聲嘀咕：
ag9: 這個數字到這裡應該會掉下去……
> 大叔湊過來看了一眼，笑說：
uncle.s: 小鬼頭，你在幹嘛？
> 阿葛抬頭，眼神很認真：
ag9: 我覺得這些數字有規律，碰到某些價位會漲，碰到某些價位會跌。
> 大叔愣了一下，沒想到一個小學生會講這種話。他心血來潮說：
uncle.s: 好啊，那你猜，明天這檔會漲還是跌？
! chart 1 up
> 那檔股票，已經跌了三天，停在上次轉彎的地方。最後一根，下面拖著一條長長的影子。
? t=chart def=3 | 如果是我站在那個柑仔店門口，我會猜……
- 跟阿葛一樣：會漲 {look+=1; guess=1} -> b1_shop_same
- 會跌。跌了三天，當然繼續跌 {guess=-1} -> b1_shop_diff
- 不敢猜 {guess=0} -> b1_shop_diff

== b1_shop_same
> 我猜，我會跟他一樣。……不，說實話，我不確定。
! go b1_shop_ans
== b1_shop_diff
> 換作是我，大概會猜錯吧。我一直都是這樣，看得到眼前，看不到轉彎。
! go b1_shop_ans

== b1_shop_ans
> 阿葛低頭盯了幾秒，隨手在報紙上畫了個箭頭：
ag9: 會漲。
! reveal
! when cok>0
> 報紙翻到下一天：紅的。我也猜對了——可是我心裡知道，我只是看著他猜。
! when cok<1
> 報紙翻到下一天：紅的。他對了，我沒有。
@ bg=s_b_candy time=第二天．傍晚
> 第二天，大叔拿著一包糖果塞到他手裡：
uncle.s: 小鬼，你猜對了。規律不只可以看，還可以換糖果吃。
! set candy+=3
! sfx coin
> 阿葛眼睛一亮，糖果捧在手裡卻沒急著拆開。
> 他第一次意識到——原來腦子裡看到的規律，不只是數字遊戲。
> 它能變成真的東西，能換回現實的好處。
! go b1_uncle

== b1_uncle
@ bg=s_b_uncle_old time=很多年後 bgm=warm amb=street tint=warm
> 很多年後，我自己去了一趟那間柑仔店。大叔老了，毛巾還掛在脖子上。
uncle.s: 你說那個小鬼頭喔？記得記得！後來他每次都猜對，我整罐糖果都輸給他了。
uncle: 他還說，長大發財了要回來請我喝飲料。
uncle.u: 欸，他發財了沒有啊？
? t=calm | 大叔一臉期待地看著我。
- 「發了。很大很大。」 {look+=1} -> b1_uncle_yes
- 「……他說，規律會告訴你。」 {bond+=1} -> b1_uncle_secret

== b1_uncle_yes
uncle.s: 哈哈哈！我就知道！那個小鬼的眼睛，跟一般人不一樣！
> 隔週，柑仔店門口多了一台全新的冰箱。上面貼著一張紙條：飲料，我請。
! go b1_end
== b1_uncle_secret
uncle.s: 規律喔……那個小鬼，到現在還在講這個。好，我等他自己來說。
> 他後來真的來了。帶著兩瓶彈珠汽水。
! go b1_end

== b1_end
@ bg=s_b_dusk time=國小．黃昏 bgm=emo amb=street tint=dusk
> 從那天開始，他看報紙更認真了。
> 糖果只是開端，他心裡知道，這條路能換到的，遠遠不止糖果。
! go b2_start

// ---------- 國中 ----------
== b2_start
! title 國中篇．第一章|還是那個他
@ bg=s_b_exam time=國中．週一 bgm=calm amb=class tint=cold fade=blink
! hud none
> 升上國中後，原以為他會有大的改變，阿葛依舊跟以前一樣怪。
> 他幾乎不交作業，小卷乾脆交白卷，可每次大考卻穩穩拿第一。
> 老師頭痛，同學不服氣，但誰也拿他沒辦法。
> 那時候我完全把他當笑話。
> 他比我大三歲。我跳級到他的班級，以為自己能超越他。
> 我永遠只能當第二。
? t=calm | 第一次見到他，我……
- 走過去說：「我會超越你的。」 {rival+=1} -> b2_meet_rival
- 先觀察他一個禮拜 {look+=1} -> b2_meet_watch

== b2_meet_rival
me12.x: 你就是阿葛？我會超越你的。
ag14: ……嗯。
> 他只說了一個字。好像我說的是今天天氣不錯。我氣了一整天。
! go b2_iq
== b2_meet_watch
> 我觀察了他一個禮拜。他上課看窗外，下課看平板，午餐吃排骨便當。
> 每天都一樣。像一個精準到可怕的時鐘。
! go b2_iq

== b2_iq
@ bg=s_b_iq time=智力測驗發還 bgm=school amb=class tint=none
> 有一次智力測驗，我拿了138分，自以為超厲害。
> 結果他坐在角落，手裡拿著測驗單，眉頭緊鎖。
? t=mid def=1 | 他眉頭皺成那樣……
- 忍不住走過去，笑他智商低 {rival+=1} -> b2_iq_laugh
- 忍住。走過去問他幾分 {bond+=1} -> b2_iq_ask

== b2_iq_laugh
me12.s: 欸，你眉頭皺成那樣……該不會很低吧？哈哈，智商低喔？
> 我忍不住走過去笑他智商低。他翻開試卷——
ag14: 208。
> 208分。
> 那一週我整個人啞口無言。
! go b2_coin
== b2_iq_ask
@ bg=s_b_iq_ask
me12: 你……幾分？
> 他沒說話，只是把試卷翻過來。
> 208分。
ag14: 這個測驗題目太少，量不準。
> 那一週我整個人啞口無言。不是因為208，是因為他說「量不準」的時候，表情很認真。
! go b2_coin

== b2_coin
! title 國中篇．第二章|ALL In Bitcoin
@ bg=s_b_tablet time=國中．放學 bgm=calm amb=class tint=gold fade=blink
> 阿葛升上國中之後，他看世界的方式沒變，只是尺度放大了。
> 糖果變成零用錢，規律變成錢的規則。
> 有一次放學，我看到他坐在角落，桌上攤著一本報紙和一台平板。
me12: 阿葛，你在幹嘛？
> 我好奇地湊過去。他頭也不抬，手指在平板上滑動，眼睛瞪得大大的。
ag14: 我在看數字，你懂嗎？這些東西長大會變成錢。
me12.s: 變錢？我們還小，錢都是爸媽給的，不是你畫線就能出來的。
> 阿葛看著我，嘴角微微上揚。
ag14.s: 你不懂，我看到規律。就像國小大叔給我糖果一樣，這些數字也是有規則的。
ag14: 只要抓對時機，零用錢也能變很多。
! phone 他的平板|BTC/USD  $0.10  ▲ 8%|論壇：玩具而已，不會有人要的|論壇：一萬顆換兩片披薩
! hud btc
> 那天，他湊出自己僅有的一點零用錢，買了第一批比特幣——100顆0.1美元的幣。
! set btc+=100
! sfx coin
me12.u: 為什麼要買這個？
> 我忍不住問。
ag14.s: 因為它會長大啊。
> 他輕描淡寫，眼睛直直盯著螢幕。
ag14.s: 長得比糖果大，甜頭也大。
? t=mid def=3 | 我口袋裡也有一點零用錢……
- 跟著他買一點 {mine+=10; look+=1} -> b2_buy_me
- 「我才不要買玩具。」 {doubt+=1} -> b2_buy_no
- 去跟老師說他在玩奇怪的東西 {doubt+=2; bond-=1} -> b2_buy_tell

== b2_buy_me
> 我偷偷買了十顆。那是我人生第一次，把錢放進一個我看不懂的東西裡。
> 後來我才知道，那十顆，是我這輩子做過最正確的事之一。
! go b2_mock
== b2_buy_no
me12.x: 我才不要買玩具。
> 他沒反駁。只是把螢幕轉回去。好像我說的話，已經被他算進某條線裡了。
! go b2_mock
== b2_buy_tell
> 我跟老師說了。老師找他去辦公室，問了二十分鐘。
> 他出來的時候，一句話都沒有怪我。只是說：
ag14: 老師也聽不懂。沒關係。
> 那天，我覺得自己很小。
! go b2_mock

== b2_mock
! title 國中篇．第三章|為規律付出時間
@ bg=s_b_mock time=國中．放學後 bgm=school amb=class tint=warm fade=blink
> 我看著他偷偷建立自己的小小帝國。
> 每次放學，他都趴在桌上看行情，手指輕輕滑動計算機，像是在和未來談條件。
> 班上同學根本不懂他在幹嘛，有時會圍過來說：
mate.s: 阿葛，你又在瞎掰什麼？
> 他只是笑笑，拿起書包走開，然後又回到那台平板前。
? t=12 def=3 | 阿肥他們又圍上去了。我……
- 站到阿葛那邊：「他沒有在瞎掰。」 {bond+=2} -> b2_mock_side
- 跟著大家一起笑 {doubt+=1} -> b2_mock_laugh
- 什麼都不做，在旁邊看 -> b2_mock_watch

== b2_mock_side
me12.x: 他沒有在瞎掰。
mate.u: 欸？第二名幫第一名講話？
> 大家笑得更大聲了。阿葛看了我一眼，什麼都沒說。
> 但那天放學，他把平板往我這邊推了一點點。
! go b2_note
== b2_mock_laugh
> 我跟著笑了。笑得很大聲，好像笑得越大聲，就越不會輸。
> 他走開的時候，背影很安靜。我笑完，覺得很空。
! go b2_note
== b2_mock_watch
> 我什麼都沒做。我只是看著。那時候的我，最擅長的就是看著。
! go b2_note

== b2_note
@ bg=s_b_rain time=國中．下雨的放學 bgm=emo amb=rain tint=cold fade=blink
> 那時候班上有一個女生，叫小晴。頭髮上有一個銀色的髮夾，坐在阿葛前面。
> 有一天下大雨，阿葛沒帶傘。我看到小晴撐著透明傘，站在他旁邊。
qing14.s: 阿葛……我們順路。要不要一起撐？
> 阿葛的耳朵紅了。我第一次看到那雙能看穿未來的眼睛，不知道要看哪裡。
? t=12 def=3 | 我手上剛好有一把多的傘……
- 把多的傘塞給阿葛，然後跑掉 {bond+=1; qing-=1} -> b2_rain_umb
- 假裝沒看到，讓他們一起走 {qing+=2; match+=1} -> b2_rain_let
- 大喊：「阿葛！老師找你！」 {qing-=1; rival+=1} -> b2_rain_block

== b2_rain_umb
> 我把傘塞給他，然後跑進雨裡。
> 我也不知道自己為什麼要這樣。可能是不想看到，他連這個也贏。
! go b2_crash
== b2_rain_let
> 我假裝在綁鞋帶。他們一起走出校門。傘往小晴那邊歪，阿葛的左肩濕了一整片。
> 那是我唯一一次，看到他在計算以外的地方，那麼認真。
! go b2_crash
== b2_rain_block
@ bg=s_b_rain_block
me12: 阿葛！老師找你！
> 他回頭，小晴愣住了。老師根本沒找他。
> 他看了我一眼，好像什麼都知道。然後還是跟小晴走了。
> 我在雨裡站了很久。
! go b2_crash

== b2_crash
@ bg=s_b_crash time=國中．某個週一 bgm=tense amb=class tint=cold fade=blink
> 有一陣子，比特幣大跌。新聞說，交易所倒了，全部歸零。
! phone 新聞|#BTC  ▼ 61%|交易所 Mt.G 暫停提領|專家：比特幣是史上最大泡沫|論壇：快逃啊啊啊
! fx pulse
> 我衝去找阿葛。他坐在角落，表情跟平常一樣。
me12.u: 跌了六成！你不賣嗎？！
? t=high def=1 | 他看著螢幕。我該說什麼？
- 「快賣啊！再不賣就歸零了！」 {doubt+=1; agpanic+=1} -> b2_crash_sell
- 「……你覺得，這裡是地板嗎？」 {look+=1; bond+=1} -> b2_crash_ask
- [if mine>0] 偷偷打開自己的帳戶，把十顆賣掉 {mine=0} -> b2_crash_mine

== b2_crash_sell
@ bg=s_b_crash_sell
me12.u: 快賣啊！再不賣就歸零了！
ag14: ……
> 他看了我一眼。那一眼，比208分還讓我難忘。
! if bond>=2 -> b2_crash_listen
ag14: 你怕的是歸零。我看的是地板。
! fx none
> 他沒有賣。三週後，比特幣回來了，比原來更高。
! go b2_future
== b2_crash_listen
> 他猶豫了。這是我第一次看到他猶豫。因為說話的人，是我。
> 他賣了一半。
! set btc*=0.5
! fx none
> 三週後，比特幣回來了，比原來更高。他什麼都沒說。我寧願他罵我。
! go b2_future
== b2_crash_ask
me12: ……你覺得，這裡是地板嗎？
ag14.s: 你終於問對問題了。
! fx none
> 他沒有賣。三週後，比特幣回來了，比原來更高。
> 他在我的筆記本上畫了一條線，旁邊寫：地板。
! go b2_future
== b2_crash_mine
> 我偷偷把我那十顆賣掉了。賣完之後，手心全是汗。
! fx none
> 三週後，比特幣回來了，比原來更高。阿葛一顆都沒賣。
> 我再也沒有跟任何人提過那十顆。
! go b2_future

== b2_future
! title 國中篇．第四章|一場長達十年的實驗
@ bg=s_b_future time=國中．黃昏 bgm=emo amb=class tint=gold fade=blink
> 老師也不明白他怎麼總是考試第一，作業交白卷卻答對所有難題。
> 智力測驗208分，他的思維像一條線，從課堂延伸到市場，延伸到未來。
> 那次測驗我得138分，是全班第二高。
> 坐在他對面，望著他低頭塗寫，心裡默默佩服，也開始覺得自己好像只是陪跑。
> 每次課堂，他都會低聲算一些看似無意義的數字。
> 結果第二天市場、股價、新聞中的數字，竟然跟他畫的一樣。
> 有一次，我忍不住問：
me12: 阿葛，你到底在想什麼？
> 他抬頭看我，眼神透亮得像能穿透時間。
ag14.s: 我在看未來啊，你看不到的那一部分。我只是先看，然後決定要不要行動。
> 我第一次看到他那雙眼睛，感覺他不是在看現在，而是在看未來。
> 好像擁有一台時光機，能提前看到所有結果。
> 後來大家私下就叫他多啦A夢。
? t=calm | 「多啦A夢」這個綽號……
- 是我取的。我承認 {bond+=1} -> b2_nick_me
- 不是我。但我叫得最大聲 -> b2_nick_loud

== b2_nick_me
> 是我取的。本來是在笑他。後來，每次叫，都越來越像在佩服他。
! go b2_end
== b2_nick_loud
> 不是我取的。但我叫得最大聲。好像叫得越大聲，就越能證明我不在乎。
! go b2_end

== b2_end
> 那時候我常看他偷偷在課桌底下計算數字，偶爾低聲自語，像在和未來對話。
> 我心裡既佩服又嫉妒，覺得他瘋得不行，可結果總是他贏。
> 就這樣，他用零用錢、規律和觀察，慢慢把自己的世界建起來。
> 買比特幣對他來說，不是投資，而是一種實驗。一個把腦袋裡規律變成現實糖果的遊戲。
! go b3_start

// ---------- 高職 ----------
== b3_start
! title 高職篇．第一章|瘋狂的投資者
@ bg=s_b_kclass time=2017．九月 bgm=warm amb=kitchen tint=warm fade=blink
! hud btc
> 2017年，他升高一，選擇台南高商餐飲科。
> 我又跳了級。我跟著他，也念了餐飲科。我跟自己說，是因為我想當廚師。一半是真的。
> 阿葛升上高職餐飲科的第一天就與眾不同。
> 別人忙著練刀工、準備課業，他的桌上卻擺著計算紙和筆記本，寫滿奇怪的數字。
chef.x: 第一天上課就把計算紙擺在砧板旁邊？你是來切菜還是來算帳的？
ag17: 都是。
> 我湊過去一看，他手裡還在算著比特幣價格。
? t=mid def=2 | 王師傅要我們兩個比切蔥。
- 認真比，這次我一定要贏 {rival+=1} -> b3_knife
- 故意放水，看他怎麼切 {look+=1} -> b3_knife_watch

== b3_knife
! rhythm 8 跟著師傅的節奏切蔥
! if rh>=7 -> b3_knife_win
chef: 阿葛，比較穩。你，比較快，但是亂。
> 第二名。在砧板上也是。
! go b3_kai
== b3_knife_win
chef.s: 喔？這次是你贏。
> 我贏了。人生第一次，贏了阿葛。雖然只是切蔥。
ag17.s: 你很快。
> 他說得很真心。我高興了一整個禮拜。
! go b3_kai
== b3_knife_watch
> 我看著他切。每一刀的間距都一樣，像他畫在報紙上的格子。
chef.s: 嗯，阿葛手很穩。你呢？你在發什麼呆？
! go b3_kai

== b3_kai
@ bg=s_b_kai time=實習課 bgm=warm amb=kitchen
kai.u: 欸欸欸，救命，我的醬汁要燒焦了！
> 阿凱。同班，綁著頭巾。做菜很有熱情，但很怕火。後來他成了阿葛餐廳的二廚。
> 那天阿葛衝過去把火關小，加了一匙水。醬汁活過來了。
kai.s: 哇靠，你神人喔！以後你開店，我一定去幫你！
? t=calm | 阿凱轉頭看我。
- 「我也會開店。到時候你來我這邊。」 {rival+=1} -> b3_kai_me
- 「他會開的。你等著。」 {bond+=1; kai+=1} -> b3_kai_ag

== b3_kai_me
kai.s: 哈哈，好啊，誰先開我就去誰那邊！
> 結果是阿葛先開。我早就知道。
! go b3_deal
== b3_kai_ag
kai.s: 你怎麼那麼確定？
me15: 因為他看鍋子的眼神，跟看比特幣一樣。
! go b3_deal

== b3_deal
@ bg=s_b_office time=週六．A先生辦公室 bgm=warm amb=city tint=gold fade=blink
> 每學期30萬獎學金，他沒有拿去花，而是全部投入比特幣定投。
> 這學期他拿到30萬台幣的獎學金，他沒有去買衣服或零食，而是找了校友、地產商A先生幫忙操作比特幣。
> 那天我跟著他去。A先生的金錶，比他的笑容還亮。
> 阿葛跟A先生談了一筆特殊交易：
ag17: 我給你15萬，你幫我買150萬的比特幣現貨，如果跌到120萬就賣掉，錢歸你。
ag17: 如果漲了，我賣掉時給你10%手續費，比特幣歸我。
ag17: 如果漲超過10倍，我賣掉15%的錢歸你，其餘比特幣歸我。
mra.u: ……小同學，你知道你在說什麼嗎？
mra.x: 旁邊這位，你是他朋友？你覺得呢？
? t=mid def=3 | A先生突然看向我。
- 「他說的，都會做到。」 {bond+=2; trustA+=1} -> b3_deal_back
- 「……我覺得太冒險了。」 {doubt+=1} -> b3_deal_doubt
- 「我只是來看的。」 -> b3_deal_none

== b3_deal_back
mra.s: 喔？朋友都敢替他擔保，那我就陪這小鬼玩一次。成交。
> 走出辦公室，阿葛說了一句謝謝。很小聲。我假裝沒聽到。
! go b3_deal_done
== b3_deal_doubt
mra.s: 朋友都說冒險了，你還要做？
ag17: 冒險的是他，不是我。
mra.s: ……哈，好，成交。
> 他沒有怪我。他從來沒有怪過我。
! go b3_deal_done
== b3_deal_none
mra: 好吧。成交。
! go b3_deal_done

== b3_deal_done
> 阿葛把15萬交給A先生，按照這筆條件操作，這學期大約買到了25顆BTC。
! set btc+=25
! sfx coin
> 我忍不住問他：
me15: 你不怕跌嗎？
> 他抬頭看我，眼睛亮得像國小時看到糖果一樣：
ag17.s: 跌了沒關係，長期看就好。
> 那一瞬間，我心裡一震。這不是單純投資，他像能看到未來的魔術師。
! go b3_soup

== b3_soup
@ bg=s_b_soup time=烹飪實習 bgm=tense amb=kitchen tint=warm fade=blink
> 課堂上，他偶爾低頭計算比特幣價格，嘴角微微上揚。
> 一次烹飪實習，他拿著湯匙攪拌湯時，還在默默算數字。
> 那天，比特幣大跌，跌破了120萬。他的手機一直在震。
! phone 他的手機|#BTC  ▼ 18%|BTC/TWD  118萬  ▼|A先生：小鬼，跌破120了，按約定要不要賣？
! fx pulse
? t=high def=3 | 他的湯快滾出來了，手機還在震。我……
- 幫他顧湯，讓他專心回訊息 {bond+=2} -> b3_soup_help
- 「快回啊！你要賠光了！」 {doubt+=1; agpanic+=1} -> b3_soup_panic
- 站在旁邊看 {look+=1} -> b3_soup_watch

== b3_soup_help
> 我接過湯匙，跟著湯翻滾的節奏攪拌。
! rhythm 8 跟著湯的翻滾攪拌
! fx none
> 他回完訊息，抬頭看我，第一次對我說：
ag17.s: 湯會翻滾，價格也會翻滾，但只要掌握規律，總能控制結果。
> 兩天後，反彈了。A先生在電話裡大笑。
! go b3_lib
== b3_soup_panic
me15.u: 快回啊！你要賠光了！
! fx none
> 他把湯匙交給我，慢慢回了訊息。然後對我說：
ag17.s: 湯會翻滾，價格也會翻滾，但只要掌握規律，總能控制結果。
> 那鍋湯，被我攪到溢出來了。王師傅罵的是我。
! go b3_lib
== b3_soup_watch
! fx none
> 他對我說：
ag17.s: 湯會翻滾，價格也會翻滾，但只要掌握規律，總能控制結果。
> 湯沒有溢出來。價格兩天後反彈了。我站在旁邊，像看了一場魔術。
! go b3_lib

== b3_lib
@ bg=s_b_lib time=放學後 bgm=calm amb=room tint=cold fade=blink
> 放學後，我看到他在圖書館翻著財經新聞。
> 手邊的筆記本密密麻麻寫著各種數字。他的世界似乎比我們更大、更快。
> 那天，小晴也來了。她念隔壁的高中。她站在書架旁邊，看著阿葛，很久。
? t=12 def=3 | 小晴沒有發現我。我……
- 走過去跟小晴說：「他在等妳。」 {match+=2; qing+=2} -> b3_lib_match
- 咳嗽一聲，讓阿葛抬頭 {match+=1; qing+=1} -> b3_lib_cough
- 默默離開 -> b3_lib_leave

== b3_lib_match
qing14.u: 他……他在等我？
me15: 他國中就一直在等。只是他不會說。
> 小晴走過去。阿葛抬頭的時候，筆掉在地上了。
> 我第一次看到他算錯數字。
! go b3_years
== b3_lib_cough
> 我咳了一聲。阿葛抬頭，看到小晴。他們隔著書架，笑了一下。
! go b3_years
== b3_lib_leave
> 我默默離開了。有些題目，不是我能幫他解的。
! go b3_years

== b3_years
! title 高職篇．第二章|定投結束
@ bg=s_b_grad time=畢業典禮 bgm=emo amb=wind tint=gold fade=blink
> 高職三年轉眼就過了，阿葛依然是班級第一，我則永遠只能是第二。
> 回頭看，他的世界完全跟我們不一樣。
> 這三年，他每學期都拿到30萬台幣獎學金，其中一半交給A先生幫忙操作比特幣。
> 每學期的投資，都讓他慢慢累積起自己的財富。
> 高職三年下來，他總共買到了142顆BTC。
! set btc+=117
> 其中20顆BTC給了A先生，剩下122顆BTC全歸他自己。
! set btc-=20
! set trustA+=2
> 這場交易前後持續三年，累積了近千萬的比特幣現貨。畢業時，他信守承諾。
mra.s: 小鬼，你連問都沒讓我問，就轉過來了。以後你要做什麼生意，我都跟。
> 畢業那天，我看著他低頭翻著筆記本、計算著數字，眼睛仍亮得像國小時看到糖果一樣。
> 我忍不住問：
me15: 你打算拿這些幣做什麼？
> 他淡淡一笑：
ag17.s: 存著就好，長期看漲。
> 那神情像是手握時光機，能預見未來的每一條路。
? t=calm | 畢業典禮結束，大家在拍照。我……
- 「欸，跟我拍一張。」 {bond+=2} -> b3_photo
- 只是遠遠看著他 {look+=1} -> b3_photo_far

== b3_photo
> 照片裡，他沒有笑。我笑得很用力。那張照片，現在還在我手機裡。
! go b3_end
== b3_photo_far
> 我遠遠看著他。他站在鳳凰樹下，像一個早就知道結局的人。
! go b3_end

== b3_end
> 高職畢業後，他將這筆BTC留到現在。每一次回想，我才明白。
> 從零用錢換糖果，到獎學金換比特幣，阿葛一直在默默證明一件事：
> 只要你能看懂規律，未來就能被掌握。
! go b4_start

// ---------- 初入社會 ----------
== b4_start
! title 初入社會篇|冷靜操盤手
@ bg=s_b_bento time=某個平日．中午 bgm=calm amb=street tint=warm fade=blink
! hud both
> 高職畢業後，阿葛走出校園，踏入社會。
> 我仍然是旁觀者，看著他像個異類一樣，做著大部分人想都不敢想的事。
> 手上122顆BTC的阿葛，對金錢的態度依然淡然。
> 他並不炫耀，反而把每一分注意力放在計算和觀察市場上。
> 我記得有一次午餐，他坐在路邊吃便當，手裡還滑著手機看比特幣價格漲跌。
> 我忍不住問：
me20.x: 你就不能休息一下嗎？
> 他抬起頭，眼睛閃亮：
ag22.s: 市場不會等我，規律會過期。
> 我看著他那副認真的樣子，心裡暗自佩服——這小子對數字的敏感度，比我們所有人都高。
? t=calm | 他繼續滑手機。排骨快涼了。
- 把他的手機蓋起來：「吃飯。」 {bond+=1} -> b4_bento_cover
- 坐下來，跟他一起看 {look+=1} -> b4_bento_sit

== b4_bento_cover
ag22.u: ……
me20.s: 吃飯。世界不會毀滅。
> 他看了我一眼，然後真的吃了一口。我覺得我贏了。雖然只是贏了一口排骨。
! go b4_meet
== b4_bento_sit
> 我坐下來跟他一起看。螢幕上的線，我還是看不懂。但我看得懂他的表情。
> 那是國小那個小孩，看著窗外的表情。
! go b4_meet

== b4_meet
@ bg=s_b_meet time=週五晚上．幣圈聚會 bgm=warm amb=rest tint=warm fade=blink
> 有一次我陪他去幣圈聚會。他一直站在角落。
> 一個綁著低馬尾、穿黑色西裝外套的女生走過去。她叫Vivian，做量化交易的。
viv.s: 你是那個一直在角落不說話的人。所以，你覺得以太坊合約怎麼樣？
ag22: 規律還沒過期。但槓桿會讓人忘記規律。
viv.u: ……你幾歲？
> 我在旁邊，看到 Vivian 的眼神變了。那是一種棋逢敵手的眼神。
? t=12 def=3 | Vivian 轉頭問我：「你朋友一直都這樣嗎？」
- 「他國小就這樣了。妳要不要留他電話？」 {match+=1; viv+=2} -> b4_meet_match
- 「他很難聊的，別浪費時間。」 {viv-=1} -> b4_meet_block
- 「我也想學合約，妳可以教我嗎？」 {copy+=1} -> b4_meet_learn

== b4_meet_match
viv.s: 國小？好，那我更有興趣了。
> 她留了名片給阿葛。阿葛看著名片，像在看一張K線圖。
! go b4_eth
== b4_meet_block
viv.s: 難聊？那正好，我最討厭好聊的人。
> 她還是留了名片。我好像幫倒忙了。
! set viv+=1
! go b4_eth
== b4_meet_learn
viv: 學合約？先學會停損吧。你朋友看起來會，你看起來不會。
> 她說得對。但我那時候聽不進去。
! go b4_eth

== b4_eth
@ bg=s_b_trade time=某個深夜 bgm=night amb=room tint=cold fade=blink
> 這段時間，他開始接觸以太坊合約交易。
> 社會初入時，他拿著0.4顆ETH開幣本位合約。
! set eth=0.4
> 最開始只是0.4顆ETH的合約，本來只是小試身手，但憑著他的敏銳和直覺……
> 從0.4滾到1，再到10。
! set eth=10
! phone 他給我看的畫面|#Ξ 10.2  ▲|ETH 本位．多單|浮動盈虧  ▲ 920%
> 我站在旁邊，每一次看到他操作，都像在看一場魔術表演。
? t=mid def=3 | 看著他的帳戶，我心癢了。
- 「我也要跟你開一樣的單。開大一點。」 {copy+=2; greed+=1} -> b4_copy
- 「教我，但我只放一點點。」 {copy+=1; bond+=1} -> b4_copy_small
- 繼續當旁觀者 {look+=1} -> b4_friends

== b4_copy
ag22.x: ……你確定？
me20.s: 你可以，我為什麼不行？
ag22: 因為你在看我，不是在看規律。
> 我沒聽。我開了二十倍。
! go b4_friends
== b4_copy_small
ag22.s: 一點點就好。先學會害怕，再學會不怕。
> 我放了一個月薪水的十分之一。他幫我設好了停損。
! go b4_friends

== b4_friends
@ bg=s_b_friends time=朋友聚餐 bgm=warm amb=street tint=warm fade=blink
> 社會生活並不簡單，但阿葛依然保持著奇怪的規律感。
> 朋友請他吃飯，他總是先算一下帳本。
> 有人問他投資心得，他總是淡淡一笑：
ag22.s: 只要理解規律，就不用怕。
> 我有時候會想，如果沒有看著他十年的成長，可能永遠不會相信。
> 一個從國中就能預見黑天鵝的少年，竟然能用獎學金和零用錢，把未來的財富積累得如此龐大。
! go b4_kitchen

== b4_kitchen
@ bg=s_b_cook time=週六傍晚．他家 bgm=warm amb=kitchen tint=warm fade=blink
> 我記得有一次，我去他家，他正在廚房煮菜。
> 鍋裡翻炒著香氣四溢的料理，桌上還擺著筆記本和螢幕，顯示著幣價走勢。
> 他一邊看螢幕，一邊翻炒食材，動作乾脆利落，完全不慌不忙。
> 我站在旁邊，有點傻眼。這就是他，把投資當遊戲，把烹飪當藝術。
! phone 螢幕上|#Ξ 100.4  ▲|保證金率  注意|大戶在出貨？
! fx pulse
> 那天螢幕上插下一根長針。他的帳戶已經滾到100顆。鍋子裡的蒜，快焦了。
? t=high def=3 | 他兩手都沒空。我……
- 接過鍋鏟，幫他顧鍋 {bond+=2} -> b4_k_help
- 「快平倉！」 {agpanic+=1} -> b4_k_panic
- [if copy>=2] 先看我自己的帳戶 {copyliq+=1} -> b4_k_mine

== b4_k_help
! fx none
> 我接過鍋鏟。他關掉一個視窗，追加保證金。然後，等。
> 那根針收回去了。他把蒜從我手上接回去，說：
ag22.s: 火候剛好。
> 我把蒜炒焦了一點。他還是吃完了。
! go b4_rest
== b4_k_panic
! fx none
me20.u: 快平倉！
ag22: 不用。
! if bond>=6 -> b4_k_listen
> 他沒有理我。那根針收回去了。蒜沒有焦。
! go b4_rest
== b4_k_listen
> 他看了我一眼。那一眼，跟國中那天一模一樣。他平了一半。
! set eth=55
> 針收回去了。他什麼都沒說，只是繼續炒菜。我知道，我又害他少賺了一半。
! go b4_rest
== b4_k_mine
! fx none
> 我打開自己的帳戶。二十倍的單，爆了。
> 一個月的薪水，四分鐘。阿葛轉頭看我，關火，拍拍我的肩膀。
ag22: 現在你知道害怕了。這是好事。
! go b4_rest

== b4_rest
@ bg=s_b_rest time=一年後．他的餐廳 bgm=warm amb=rest tint=warm fade=blink
> 初入社會的阿葛，並不急於顯擺。
> 他依舊喜歡做菜，把它當愛好。開的餐廳，流水可能比不上他一單合約的收益。
> 但他用心經營，只為生活中保留一點自己的熱愛。他的日常，簡單卻不凡。
> 三號桌有一位常客，叫小雨。畫畫的，每週四都來，點同一碗牛肉麵。
yu.s: 你是老闆的朋友吧？我可以問你一件事嗎？
yu: 老闆端麵過來的時候，都會看一眼窗外。他在等什麼呢？
? t=14 def=3 | 小雨很認真地看著我。
- 「他在等有人發現，他的湯變甜了。」 {match+=1; yu+=3} -> b4_yu_match
- 「他在看幣價啦。」 {yu+=1} -> b4_yu_coin
- 「我也不知道。」 -> b4_yu_none

== b4_yu_match
yu.u: 湯……變甜了？
> 她低頭喝了一口湯。然後笑了。那個笑，跟國中小晴在雨裡的笑，有點像。
> 那天打烊，阿葛問我跟小雨說了什麼。我說：秘密。
! go b4_reunion
== b4_yu_coin
yu.s: 幣價？哈哈，好浪漫喔。
> 她說浪漫的時候，眼睛沒有在笑。她是真的覺得浪漫。
! go b4_reunion
== b4_yu_none
yu: 這樣啊……
> 她繼續畫畫。素描本上，是一個站在鍋子前面的人。
! go b4_reunion

== b4_reunion
@ bg=s_b_reunion time=下雨的週六．打烊前 bgm=emo amb=rain tint=cold fade=blink
> 有一天下大雨，餐廳門口的風鈴響了。
qing22.u: ……阿葛？真的是你？
> 銀色髮夾。透明傘。是小晴。她回台南工作了。
> 阿葛站在櫃台後面，愣了三秒。我認識他十年，他從來沒有愣過三秒。
? t=12 def=3 | 我坐在吧台，剛好是唯一的客人。我……
- 說「我先走了」，把店留給他們 {match+=1; qing+=2} -> b4_re_leave
- 從櫃台下面拿出那把舊傘，放到阿葛手上 {match+=2; qing+=3} -> b4_re_umb
- 留下來，假裝在滑手機 -> b4_re_stay

== b4_re_leave
> 我說我先走了。走出門口的時候，雨還很大。我沒有帶傘。
> 我想起國中的那個下雨天。這次，我沒有搗亂。
! go b4_viv
== b4_re_umb
> 我知道那把傘在哪裡。國中那把透明傘，他一直放在櫃台下面。
> 我把它放到阿葛手上。他看了我一眼。
ag22.s: ……謝了。
> 那天，他撐著那把舊傘送她回家。傘往她那邊歪。他的左肩，又濕了一整片。
! go b4_viv
== b4_re_stay
> 我留下來，假裝在滑手機。他們聊了很久，我一個字都沒聽進去。
> 雨停了。小晴說，下次再來。
! go b4_viv

== b4_viv
@ bg=s_b_vivbar time=某個週三 bgm=warm amb=rest tint=warm
! if viv<2 -> b4_climb
> 後來，Vivian 也常常來店裡。她坐吧台，跟阿葛聊幣，偶爾不聊幣。
viv.s: 欸，他朋友。我問你，你朋友這種人，會為了什麼停下來？
? t=12 def=3 | Vivian 轉著氣泡水的杯子。
- 「為了一個讓他忘記看盤的人。」 {viv+=2; match+=1} -> b4_viv_hint
- 「為了一碗好湯吧。」 {viv+=1} -> b4_viv_soup
- 「他不會停的。」 -> b4_viv_no

== b4_viv_hint
viv.u: ……忘記看盤？那很難耶。
viv.s: 不過，我喜歡難的。
! go b4_climb
== b4_viv_soup
viv.s: 湯啊……好，我記住了。
! go b4_climb
== b4_viv_no
viv: 嗯。我也覺得。
! go b4_climb

== b4_climb
@ bg=s_b_climb time=那一年的牛市 bgm=tense amb=room tint=cold fade=blink
! if eth<60 -> b4_climb_half
> 從100，滾到800。
! set eth=800
! go b4_close
== b4_climb_half
> 從55，一路滾上去，最後停在500顆。他說，那一半，是學費。
! set eth=500
! go b4_close

== b4_close
> 他最終停在了這裡。按下平倉鍵那一刻，他沒有大喊，也沒有表情變化。
> 只是靜靜望著遠方，好像在思考下一步。
! if copy>=2 && copyliq<1 -> b4_mine
! go b5_start

== b4_mine
> 那一晚，我自己的帳戶也開著二十倍的多單。跟他的一模一樣。
> 他平倉了。我沒有。我想，再多一點。再多一點就好。
! fx pulse
? t=high def=2 | 我的帳戶正在大賺。阿葛傳訊息：「平倉吧。」
- 聽他的，平倉 {bond+=1} -> b4_mine_close
- 再加碼，這次我要贏他 {greed+=3} -> b4_mine_greed

== b4_mine_close
! fx none
> 我平倉了。賺了一年的薪水。阿葛傳了一個字：好。
> 那個「好」，是我這輩子收過最好的評語。
! go b5_start
== b4_mine_greed
! fx none
! sfx crash
> 我加碼了。一根針，四分鐘。
! phone 我的帳戶|#強制平倉  ▼|保證金率  0%|阿葛：你還好嗎？
> 帳戶歸零的那一刻，我才明白：我看的是他，不是規律。
! end liq

// ---------- 2025 ----------
== b5_start
! title 終章|2025　回顧
@ bg=s_b_door time=2025．秋天的傍晚 bgm=emo amb=rest tint=dusk fade=blink
> 2025年，我再回頭看他。
> 真的很扯。一開始我把他當笑話，十年後才發現，自己才是笑話。
> 他放銀行的活存，足夠買好幾十台遊艇，投資收益比餐廳一年流水還多。
> 他從不炫耀，也不透露細節，把餐廳當藝術，把投資當遊戲。
> 我算過他的一生投資。從國中買的比特幣，到高職每學期獎學金投入的比特幣與ETH合約。
> 再加上0.4顆ETH滾雪球到800顆的收益。推算到今天，他大約持有：
! phone 我的推算|BTC  ▲  約 222 顆|ETH  ▲  約 800 顆|其他合約收益  ？？？|零散投資  ？？？|部分現貨  ？？？
> 比特幣BTC約222顆、以太幣ETH約800顆。
> 就算列出這些數字，也只能看到一部分。他持有的合約收益、其他零散投資以及部分現貨，沒有人知道全貌。
> 就連我也只能看到其中一角。
> 我記得有一次站在他餐廳門口，看他招呼客人。
> 他一邊翻炒鍋裡的食材，一邊和員工小聲討論市場。
kai: 老闆，今天大盤怎麼樣？
ag22.s: 照規律走。
> 臉上帶著淡淡笑容，那種神情像在說：
> 「這世界的規則我都知道，只是你們看不到。」
> 光這一角度，就足以讓人瞠目結舌。
! if doubt>=4 && bond<3 -> b5_ordinary
! go b5_last

== b5_ordinary
@ bg=s_ordinary time=2025．某個平日傍晚 bgm=emo amb=city tint=grey fade=blink
> 但這些，我都是從別人那裡聽來的。
> 那些年，我一直在懷疑他，嘲笑他，勸他賣掉。後來，我們就很少聯絡了。
> 我在月台上，拿著一杯便利商店的咖啡，看著手機上別人轉傳的照片。
> 照片裡，他站在餐廳門口，淡淡地笑著。
! end ordinary

== b5_last
@ bg=s_b_harbor time=2025．跨年夜 bgm=night amb=harbor tint=dusk fade=blink
> 2025年的跨年夜。我站在安平碼頭，傳訊息給阿葛。
! phone 訊息|>今晚要幹嘛？|阿葛：還沒決定。|阿葛：你覺得呢？
> 他居然問我。十多年來，第一次。
? t=calm | 我要怎麼回他？
- [if look>=8 && agpanic==0] 「回你老家，床底下那個餅乾鐵盒。」 -> b5_hidden
- [if bond>=6] 「來我的店。我請你。」 -> b5_bond
- [if qing>=5 && match>=2] 「帶那把舊傘，去找小晴。」 -> b5_love_qing
- [if yu>=3] 「回你的店，三號桌有人在等。」 -> b5_love_yu
- [if viv>=4] 「今晚市場休息。打給 Vivian。」 -> b5_love_viv
- 「隨便你。你不是看得到未來嗎？」 -> b5_legend

== b5_legend
> 他沒有回。我抬頭，看到碼頭的另一頭，有一個人影站著看海。
> 我沒有走過去。有些人，你只能遠遠地看。
> 十多年來，他用冷靜和精準，把微小的起點變成不可思議的傳奇。
> 阿葛，多啦A夢，真實世界裡的傳奇，永遠帶著神秘。
! end legend

== b5_bond
@ bg=s_friend time=2025．跨年夜 bgm=warm amb=night tint=night fade=blink
> 我開了自己的店。他來了。我們坐在頂樓，啤酒，和一包柑仔店的糖果。
ag22.s: 你的店，湯不錯。
me20.s: 只是不錯？
ag22: 比我的差一點。
me20.x: ……你一定要在跨年夜講這個嗎？
> 我跟他說，我一開始真的把他當笑話。他說，他知道。
ag22.s: 但你是唯一一個，一直在看的人。
> 我們笑到煙火都放完了。第二名，也不錯。
! end bond

== b5_love_qing
@ bg=s_river time=2025．跨年夜 bgm=emo amb=wind tint=night fade=blink
> 他真的帶著那把傘去了。那天沒有下雨。
> 後來小晴跟我說，那晚，阿葛跟她說：
ag22.s: 實驗成功了。妳是第一個知道的。
> 我在河的另一邊，看著兩個人影靠在一起。煙火在河面上散開。
> 剩下的事，就不用寫進我的推算裡了。
! set partner='小晴'
! end love_qing

== b5_love_yu
@ bg=s_b_yu time=2025．跨年夜 bgm=emo amb=rain tint=night fade=blink
> 他回了店裡。三號桌的燈還亮著。
> 小雨把一張畫遞給他。畫裡，一個站在鍋子前面的人，和一個坐在三號桌的人。
yu.s: 我不只是喜歡你的麵。
ag22.s: 我知道。湯變甜，是因為妳每週四都會來。
> 這句話，是阿凱後來偷偷轉述給我的。他說他在廚房聽到，差點把蔥切到手。
! set partner='小雨'
! end love_yu

== b5_love_viv
@ bg=s_b_viv time=2025．跨年夜 bgm=emo amb=wind tint=night fade=blink
> 他打給了 Vivian。後來她跟我說，那晚，他們沿著運河走，誰都沒有看盤。
viv.s: 我問過你朋友，他這種人會為了什麼停下來。
viv.s: 現在我知道答案了。謝啦，他朋友。
> 原來，連多啦A夢，也會有想停下來的時候。
! set partner='Vivian'
! end love_viv

== b5_hidden
@ bg=s_b_hidden time=2025．跨年夜 bgm=night amb=room tint=warm fade=blink
> 他真的回去了。後來，他把那個鐵盒拿給我看。
> 裡面是國小那罐糖果，一顆都沒有吃。還有一本畫滿影子的筆記本。
> 我翻到中間。那裡有一行歪歪的字。
! note 給長大的我：\\n你會看到很多數字。\\n但不要忘了，\\n糖果是拿來分給別人的。\\n——九歲的阿葛
ag22.s: 你怎麼知道床底下有這個？
me20.s: 因為我看了你十多年。我也有一點點，看得到規律了。
> 原來時光機，從來不在他的腦袋裡。在床底下。
! end hidden
`;
