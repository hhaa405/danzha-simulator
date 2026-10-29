/* 蛋渣模擬器・第一人稱 — engine */
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const TEST=/[?&]test=1/.test(location.search);
const FAST=/[?&]fast=1/.test(location.search);
const LS={get(k,d){try{const v=localStorage.getItem('dz_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('dz_'+k,JSON.stringify(v))}catch(e){}}};
const NAMES={nar:'',i:'',me:'我',sis:'姐姐',desk:'同桌',ai:'小愛',mei:'小美',qing:'小晴',fat:'阿福',dir:'學務主任',teacher:'體育老師',boy:'隔壁跑道的男生',crowd:'同學們',aunt:'早餐店阿姨'};
const CONTACT={ai:'小愛',mei:'林小美',qing:'小晴 ☀',desk:'同桌',sis:'姐',multi:'聊天',fat:'阿福'};
const AV=w=>w==='me'?'':`url(../assets/img/face/${w}_n.webp)`;
const ENDS=[
 {id:'E1',t:'蛋渣',q:'「你不是我的小餅，你是蛋渣。」',h:'照著那條最爛的復仇路線，走到最後。'},
 {id:'E2',t:'我的小餅',q:'「你是我的小餅，永遠都是。」',h:'不要成為傷害別人的人。'},
 {id:'E3',t:'東窗事發',q:'「消息傳得比我跑一百公尺還快。」',h:'太多人知道了。'},
 {id:'E4',t:'遲來的道歉',q:'「蛋糕你自己吃。生日快樂。」',h:'闖禍之後，說出真正該說的話。'},
 {id:'E5',t:'下次換我帶你飛',q:'「蛋餅，下次換我帶你飛。」',h:'那一秒，如果你答應了。'},
 {id:'E6',t:'孤獨的冠軍',q:'「我跑贏了所有人，卻輸掉了所有人。」',h:'當一個沒翻車的渣男。'},
 {id:'E7',t:'全班的蛋餅',q:'「原來被大家喜歡，不用騙任何人。」',h:'對每個人都真心。'}];
const BGM={sad:'sadtrio'};
const AMBG={class:-13,hall:-9,coop:-14,field:-3,sports:-10,race:-4,rain:-6,night:2,home:-1,room:2,kitchen:-1,tv:-1,birds:0,country:1,office:-6,stairs:-3,street:-2,cvs:-3,breakfast:-1};
const TINT={h_door:'rgba(40,50,90,.25)',h_phone:'rgba(30,40,80,.2)',h_pc:'rgba(30,30,60,.15)',w_dogs:'rgba(180,140,80,.25)'};
const ITEMS={
 yakult:{n:'養樂多（5入）',p:45,c:'飲料零食',d:'小晴每天早上都會偷塞一瓶。'},
 pudding:{n:'雞蛋布丁',p:25,c:'飲料零食',d:'福利社永遠搶不到的那種。'},
 milk:{n:'草莓牛奶',p:25,c:'飲料零食',d:'粉紅色的，女生好像都喜歡。'},
 choco:{n:'牛奶巧克力',p:45,c:'飲料零食',d:'安全牌。'},
 gummy:{n:'小熊軟糖',p:39,c:'飲料零食',d:'上課偷吃的首選。'},
 cocoa:{n:'熱可可',p:45,c:'飲料零食',d:'晚上很冷的時候。'},
 clip:{n:'小花髮夾',p:59,c:'小東西',d:'櫃檯旁邊那排，閃閃的。'},
 scrunchie:{n:'運動髮圈（紅）',p:49,c:'小東西',d:'綁馬尾用的，很耐拉。'},
 towel:{n:'運動毛巾',p:99,c:'小東西',d:'吸水，體育課用得到。'},
 notebook:{n:'方格筆記本',p:65,c:'小東西',d:'封面是一隻藍色的鯨魚。'},
 pen:{n:'中性筆三入',p:79,c:'小東西',d:'0.38，寫起來很順。'},
 card:{n:'空白小卡',p:35,c:'小東西',d:'可以自己寫字。'},
 keychain:{n:'絨毛小吊飾',p:149,c:'小東西',d:'一隻胖胖的小鯨魚。'},
 earbuds:{n:'藍牙耳機',p:990,c:'型錄預購',d:'櫃檯的型錄上看到的。'},
 plush:{n:'大隻絨毛娃娃',p:1290,c:'型錄預購',d:'比我的書包還大。'},
 watch:{n:'運動手錶',p:1990,c:'型錄預購',d:'可以計時、測心跳。'},
 roses:{n:'玫瑰花束（預購）',p:1680,c:'型錄預購',d:'……十三歲送這個，好像太誇張了。'}};
const PREF={desk:{love:['notebook','pen','keychain'],like:['gummy','choco','card','clip','cocoa']},
 ai:{love:['scrunchie','towel','watch'],like:['milk','choco','yakult','earbuds','pudding']},
 mei:{love:['notebook','pen','cocoa'],like:['choco','card','keychain','earbuds']},
 qing:{love:['yakult','pudding','plush','keychain'],like:['gummy','milk','clip','choco','roses']}};
/* ---------------- state ---------------- */
let P=null,G=null,RUN=0;
function freshG(){return{node:'start',i:0,stack:[],V:{sis:50,zha:0,con:10,exp:0,desk:20,ai:10,mei:5,qing:15,day:0},inv:{},given:{},scene:{bg:'black',amb:'none',bgm:'none',time:''}}}
function wallet(){return LS.get('fp_wallet',0)||0}
function setWallet(v){LS.set('fp_wallet',Math.max(0,Math.round(v)));renderWallet()}
function renderWallet(){const w=$('#wallet');w.textContent='NT$ '+wallet().toLocaleString('en-US');if(LS.get('fp_wshow',0))w.classList.add('show')}
function saveG(){if(G&&!TEST)LS.set('fp_save',G)}
/* ---------------- audio ---------------- */
const AU={ctx:null,buf:{},g:{},cur:{bgm:null,amb:null},vsrc:null,vol:LS.get('fp_vol',{voice:100,bgm:55,amb:70}),
 init(){if(this.ctx)return;const C=window.AudioContext||window.webkitAudioContext;this.ctx=new C();const c=this.ctx;
  this.g.master=c.createGain();this.g.master.connect(c.destination);
  for(const k of['voice','bgm','amb','sfx']){this.g[k]=c.createGain();this.g[k].connect(this.g.master)}
  this.g.duck=c.createGain();this.g.duck.connect(this.g.bgm);this.applyVol()},
 applyVol(){if(!this.ctx)return;this.g.voice.gain.value=this.vol.voice/100*1.0;this.g.bgm.gain.value=Math.pow(this.vol.bgm/100,1.6)*0.9;this.g.amb.gain.value=this.vol.amb/100;this.g.sfx.gain.value=Math.max(.2,this.vol.amb/100)},
 load(url){if(!this.buf[url])this.buf[url]=fetch(url).then(r=>{if(!r.ok)throw new Error(url+' '+r.status);return r.arrayBuffer()}).then(a=>new Promise((res,rej)=>this.ctx.decodeAudioData(a,res,rej))).catch(e=>{console.warn('audio',url,e.message);delete this.buf[url];return null});return this.buf[url]},
 async loop(kind,name,gainDb=0,fade=1.6){if(!this.ctx)return;const c=this.ctx,old=this.cur[kind];
  if(old&&old.name===name)return;this.cur[kind]=null;
  if(old&&old.g){old.g.gain.cancelScheduledValues(c.currentTime);old.g.gain.setTargetAtTime(0,c.currentTime,fade/4);setTimeout(()=>{try{old.s.stop()}catch(e){}},fade*1500)}
  if(!name||name==='none')return;const url=kind==='bgm'?`a/m/${BGM[name]||name}.mp3`:`a/amb/${name}.mp3`;
  const tok={name};this.cur[kind]=tok;const b=await this.load(url);if(!b||this.cur[kind]!==tok)return;
  const s=c.createBufferSource();s.buffer=b;s.loop=true;const g=c.createGain();g.gain.value=0;s.connect(g);g.connect(kind==='bgm'?this.g.duck:this.g.amb);
  s.start(0,kind==='bgm'?0:Math.random()*Math.max(0,b.duration-2));g.gain.setTargetAtTime(Math.pow(10,gainDb/20),c.currentTime,fade/3);tok.s=s;tok.g=g},
 async sfx(name,vol=1){if(!this.ctx)return;const b=await this.load(`a/sfx/${name}.mp3`);if(!b)return;const s=this.ctx.createBufferSource();s.buffer=b;const g=this.ctx.createGain();g.gain.value=vol;s.connect(g);g.connect(this.g.sfx);s.start();return s},
 duck(on){if(!this.ctx)return;this.g.duck.gain.setTargetAtTime(on?0.45:1,this.ctx.currentTime,.25)},
 voice(key,opt={}){return new Promise(async res=>{if(!this.ctx){res(false);return}this.stopVoice();const b=await this.load(`a/v/${key}.mp3`);if(!b){res(false);return}
  const s=this.ctx.createBufferSource();s.buffer=b;let node=s;const g=this.ctx.createGain();g.gain.value=opt.vol||1;
  if(opt.pan&&this.ctx.createStereoPanner){const p=this.ctx.createStereoPanner();p.pan.value=opt.pan;s.connect(p);p.connect(g)}else s.connect(g);
  g.connect(this.g.voice);this.vsrc={s,res};this.duck(true);s.onended=()=>{if(this.vsrc&&this.vsrc.s===s){this.vsrc=null;this.duck(false)}res(true)};s.start();this.vdur=b.duration})},
 stopVoice(){if(this.vsrc){const v=this.vsrc;this.vsrc=null;try{v.s.onended=null;v.s.stop()}catch(e){}this.duck(false);v.res(true)}},
 prefetch(keys){if(!this.ctx)return;keys.slice(0,8).forEach(k=>this.load(`a/v/${k}.mp3`))}};
/* ---------------- visuals ---------------- */
let curLayer=0,curBg='';
function bgUrl(k){return k==='black'?'none':`url(img/${k}.webp)`}
function preImg(k){if(k&&k!=='black'){const i=new Image();i.src=`img/${k}.webp`}}
async function blink(fn,slow){const s=$('#stage');s.classList.add(slow?'closed':'blink');await sleep(slow?950:190);fn&&fn();await sleep(slow?250:90);s.classList.remove('blink','closed');await sleep(160)}
async function setBg(k,how){if(k===curBg)return;curBg=k;const swap=()=>{curLayer^=1;const L=$('#L'+curLayer),O=$('#L'+(curLayer^1));L.style.backgroundImage=bgUrl(k);L.style.backgroundPosition='50% 50%';look=0;L.classList.add('on');O.classList.remove('on');$('#tint').style.background=TINT[k]||'transparent'};
 if(how==='cut'){swap();return}await blink(swap,k==='black')}
let look=0;
function applyLook(){const L=$('#L'+curLayer);if(L)L.style.backgroundPosition=`${50+look*35}% 50%`}
function camFx(f){const c=$('#cam');c.style.filter=f||''}
function shake(){const c=$('#cam');c.classList.remove('sway');c.classList.add('shake');setTimeout(()=>{c.classList.remove('shake');c.classList.add('sway')},520)}
function toast(t){const d=document.createElement('div');d.className='tst';d.textContent=t;$('#toastL').appendChild(d);setTimeout(()=>d.remove(),3600)}
/* ---------------- subtitles ---------------- */
function showSub(who,text){const s=$('#sub');s.className='on '+(who==='nar'?'nar':who==='i'?'inner':who==='me'?'me':'');
 $('#who').textContent=NAMES[who]||'';$('#txt').textContent=who==='i'?'（'+text.replace(/^（|）$/g,'')+'）':text}
function hideSub(){$('#sub').classList.remove('on')}
/* ---------------- input: tap to skip ---------------- */
let tapWaiter=null;
function waitTap(){return new Promise(r=>{tapWaiter=r})}
function onTap(){if(tapWaiter){const r=tapWaiter;tapWaiter=null;r(true)}}
$('#tap').addEventListener('pointerdown',e=>{e.preventDefault();onTap()});
addEventListener('keydown',e=>{
 if(e.code==='Escape'){if($('#menu').classList.contains('on')){$('#menu').classList.remove('on');return}if($('#modal').classList.contains('on')){$('#modal').classList.remove('on');return}
  if(phoneVisible()){e.preventDefault();putDown();return}openMenu();return}
 if($('#menu').classList.contains('on')||$('#modal').classList.contains('on'))return;
 if(e.code==='Space'||e.code==='Enter'){if(/INPUT|BUTTON|SELECT/.test(e.target.tagName))return;e.preventDefault();onTap()}
 if(/^Digit[1-4]$/.test(e.code)){const b=$$('#opts button, .lnFoot button[data-i]')[+e.code.slice(5)-1];if(b)b.click()}
});
/* look around: drag (portrait) & pointer parallax */
let drag=null;
$('#stage').addEventListener('pointerdown',e=>{drag={x:e.clientX,l:look,t:Date.now()}});
addEventListener('pointerup',()=>{drag=null});
addEventListener('pointermove',e=>{const c=$('#cam');
 if(drag&&innerHeight>innerWidth){look=Math.max(-1,Math.min(1,drag.l-(e.clientX-drag.x)/innerWidth*1.6));applyLook()}
 if(e.pointerType==='mouse'){c.style.setProperty('--px',((e.clientX/innerWidth-.5)*-26).toFixed(1));c.style.setProperty('--py',((e.clientY/innerHeight-.5)*-16).toFixed(1))}});
function gyro(){const h=e=>{if(e.gamma==null)return;const c=$('#cam');c.style.setProperty('--px',(Math.max(-30,Math.min(30,e.gamma))*-.7).toFixed(1));c.style.setProperty('--py',((Math.max(10,Math.min(80,e.beta||45))-45)*-.4).toFixed(1))};
 try{if(window.DeviceOrientationEvent&&typeof DeviceOrientationEvent.requestPermission==='function'){DeviceOrientationEvent.requestPermission().then(s=>{if(s==='granted')addEventListener('deviceorientation',h)}).catch(()=>{})}else addEventListener('deviceorientation',h)}catch(e){}}
/* ---------------- line playback ---------------- */
let phoneMode=null; // {kind:'line'|'call'|'ig', who}
async function sayLine(who,emo,text,key,opt={}){
 const my=RUN;const inPhoneBubble=opt.bubble;
 if(!inPhoneBubble)showSub(who,text);
 const crying=/哭/.test(emo||'');if(crying)camFx('blur(1.6px) brightness(.88) saturate(.8)');else if(emo==='緊張')camFx('contrast(1.08) saturate(1.1)');
 const pan={sis:0,desk:.12,ai:-.1,mei:.08,qing:-.12,fat:.1}[who]||0;
 const t0=Date.now();const vp=AU.voice(key,{pan,vol:who==='i'?.95:1});
 const minMs=FAST?60:Math.max(700,text.length*120);
 const tp=waitTap();
 const ok=await Promise.race([vp.then(r=>r?'v':'nov'),tp.then(()=>'tap')]);
 if(my!==RUN)return;
 if(ok==='nov'){const rest=minMs-(Date.now()-t0);if(rest>0)await Promise.race([sleep(rest),tp])}
 if(ok==='tap')AU.stopVoice();
 tapWaiter=null;
 if(ok!=='tap'&&!FAST)await Promise.race([sleep(who==='nar'?520:380),waitTap()]);
 tapWaiter=null;
 if(crying||emo==='緊張')camFx('');
 if(!opt.keep)hideSub()}
/* ---------------- conditions & fx ---------------- */
function invCount(){return Object.values(G.inv).reduce((a,b)=>a+b,0)}
function cond(c){const V=G.V;const px=new Proxy({},{has:()=>true,get:(t,k)=>k==='inv'?invCount():(k in V?V[k]:0)});try{return !!Function('S','with(S){return ('+c+')}')(px)}catch(e){console.warn('cond',c,e);return false}}
function applyFx(list){for(const[k,op,v]of list){if(k==='money'){addMoney(op==='-'?-v:v);continue}const V=G.V;if(op==='=')V[k]=v;else V[k]=(V[k]||0)+(op==='-'?-v:v);if(['sis','con','desk','ai','mei','qing','exp','zha'].includes(k))V[k]=Math.max(0,Math.min(120,V[k]))}}
function addMoney(v,why){setWallet(wallet()+v);LS.set('fp_wshow',1);renderWallet();AU.sfx('coin',.6);toast(`錢包 ${v>=0?'+':'−'}NT$${Math.abs(v)}${why?'　'+why:''}`)}
/* ---------------- choices ---------------- */
let curCh=null; // the pending choice; its buttons can move between the phone and the normal choice panel
function choose(ch){return new Promise(res=>{
 const opts=ch.opts.filter(o=>!o.cond||cond(o.cond));
 // a non-chat phone screen (IG post, call) never sits on top of a choice: put it down first
 if(phoneVisible()&&phoneMode&&phoneMode.kind==='ig')closePhone();else if(phoneVisible()&&phoneMode&&phoneMode.kind!=='line')minimizePhone();
 let done=false,timer=null,raf=0;
 const tbP=document.createElement('div');tbP.className='tb';tbP.innerHTML='<i></i>';
 const btns=opts.map((o,i)=>{const b=document.createElement('button');b.dataset.i=i;b._o=o;b.onclick=e=>{e.stopPropagation();AU.sfx('step',.25);finish(o,i)};return b});
 const C={btns,tbP,timed:!!(ch.t&&!FAST),kill(){done=true;clearTimeout(timer);cancelAnimationFrame(raf)}};
 const finish=(o,idx)=>{if(done)return;C.kill();if(curCh===C)curCh=null;clearChoiceUI();res(o)};
 curCh=C;placeChoice();
 if(C.timed){const T=ch.t*1000,t0=performance.now();
  const step=()=>{const f=1-(performance.now()-t0)/T;const tr=`scaleX(${Math.max(0,f)})`;$('#tbar i').style.transform=tr;tbP.firstChild.style.transform=tr;if(f>0&&!done)raf=requestAnimationFrame(step)};step();
  timer=setTimeout(()=>{if(ch.to)finish({go:ch.to,fx:[],timeout:true});else{const d=(ch.d||1)-1;finish(opts[Math.max(0,Math.min(opts.length-1,d))]||opts[0])}},T)}
 if(TEST&&window.__autoPick!=null&&!window.__manual)setTimeout(()=>{const k=typeof window.__autoPick==='function'?window.__autoPick(opts,G):0;finish(opts[k]||opts[0])},30)})}
function chatOpen(){return phoneMode&&phoneMode.kind==='line'&&phoneVisible()&&$('#lnFoot')}
function placeChoice(){updChip();const C=curCh;if(!C)return;const foot=chatOpen();
 if(foot){$('#choices').classList.remove('on');$('#opts').innerHTML='';foot.innerHTML='';if(C.timed)foot.appendChild(C.tbP);
  C.btns.forEach(b=>{b.textContent=b._o.say||b._o.t;b.className=b._o.say?'':'act';foot.appendChild(b)});const lb=$('#lnBody');if(lb)lb.scrollTop=1e6}
 else{const f=$('#lnFoot');if(f&&C.btns.some(b=>b.parentNode===f))f.innerHTML='<div class="inp">輸入訊息</div>';
  const host=$('#opts');host.innerHTML='';$('#tbar').style.display=C.timed?'block':'none';
  C.btns.forEach(b=>{b.textContent=b._o.t;b.className=b._o.say?'':'act';host.appendChild(b)});$('#choices').classList.add('on')}
 updChip()}
function clearChoiceUI(){$('#choices').classList.remove('on');$('#opts').innerHTML='';$('#tbar').style.display='none';const f=$('#lnFoot');if(f)f.innerHTML='<div class="inp">輸入訊息</div>';updChip()}
function cancelChoice(){if(curCh){curCh.kill();curCh=null}clearChoiceUI()}
/* ---------------- runner ---------------- */
async function run(){const my=++RUN;
 while(my===RUN){let B=P.N[G.node];if(!B){console.error('no node',G.node);return}
  if(G.i>=B.length){const k=P.order.indexOf(G.node)+1;if(k>=P.order.length)return;G.node=P.order[k];G.i=0;continue}
  const s=B[G.i++];
  const nexts=B.slice(G.i,G.i+6).filter(x=>x.key).map(x=>x.key);AU.prefetch(nexts);
  const r=await step(s);if(my!==RUN)return;
  if(r&&r.end)return;
  if(r&&r.go){G.node=r.go;G.i=0;saveG()}}}
async function step(s){
 if(s.k==='scene'){Object.assign(G.scene,Object.fromEntries(Object.entries(s).filter(([k])=>k!=='k')));if(phoneMode||phoneVisible()||phoneMin)closePhone();
  if(s.time!=null)$('#clock').textContent=s.time;
  const ps=[];if(s.amb)AU.loop('amb',s.amb,AMBG[s.amb]||0);if(s.bgm)AU.loop('bgm',s.bgm,0,2.5);if(s.bg){preImg(s.bg);ps.push(setBg(s.bg))}
  await Promise.all(ps);saveG();return}
 if(s.k==='line'){if(s.phone&&phoneMode&&phoneMode.kind==='line'){await bubble(s);return}
  if(s.who==='me'&&phoneMode&&phoneMode.kind==='line'){await bubble(s);return}
  await sayLine(s.who,s.emo,s.text,s.key);return}
 if(s.k==='choice'){saveG();const o=await choose(s);if(o.timeout&&o.go)return{go:o.go};applyFx(o.fx||[]);
  if(o.say){if(phoneMode&&phoneMode.kind==='line')await bubble({who:'me',text:o.say,key:o.key,phone:true});else await sayLine('me','',o.say,o.key)}
  if(o.go)return{go:o.go};return}
 if(s.k==='cmd')return await cmd(s)}
async function cmd(s){const a=s.a;
 switch(s.c){
 case'go':return{go:a};
 case'if':if(cond(s.cond))return{go:s.go};return;
 case'fx':applyFx(s.fx);return;
 case'sub':G.stack.push({node:G.node,i:G.i});return{go:a};
 case'ret':{const r=G.stack.pop();if(r){G.node=r.node;G.i=r.i}return}
 case'title':return await chapter(s);
 case'sfx':AU.sfx(a);if(a==='buzz'){navigator.vibrate&&navigator.vibrate([300,150,300])}await sleep(a==='bell'?1200:350);return;
 case'shake':shake();navigator.vibrate&&navigator.vibrate(200);return;
 case'wait':await sleep(+a||500);return;
 case'day':G.V.day=+a;saveG();return;
 case'money':addMoney(s.v,s.why);saveG();await sleep(500);return;
 case'note':return await note(s);
 case'ig':openIgPost();return;
 case'phone':await igFeed();return;
 case'line':openLine(a);await sleep(500);return;
 case'endline':await sleep(700);closePhone();return;
 case'call':await openCall(a);return;
 case'act':return await ACTS[a](s);
 case'shop':await shop();return;
 case'give':return await give(a);
 case'end':await ending(a);return{end:true};}
 console.warn('unknown cmd',s.c)}
async function chapter(s){hideSub();closePhone();const c=$('#card');$('#cardT').textContent=s.a.replace('｜','\n');$('#cardT').style.whiteSpace='pre-line';$('#cardS').innerHTML='';c.classList.add('on');
 await sleep(FAST?50:900);await sayLine('nar','標題',s.say,s.key,{keep:false});hideSub();await sleep(FAST?50:500);c.classList.remove('on');}
async function note(s){$('#noteTxt').textContent=s.a.replace(/—/,'\n— ');$('#noteTxt').style.whiteSpace='pre-line';$('#note').classList.add('on');AU.sfx('scrub',.4);await sleep(400);
 await sayLine('sis','紙條',s.say,s.key);await sleep(300);$('#note').classList.remove('on')}
/* ---------------- phone ---------------- */
function nowStr(){const t=(G.scene.time||'').match(/(\d{1,2}):(\d{2})/);return t?`${t[1].padStart(2,'0')}:${t[2]}`:'23:0'+Math.floor(Math.random()*9)}
/* The phone can ALWAYS be put down: ▾ button, the ‹ back arrow, tapping outside it, Esc, or the browser/Android back button.
   Chats and calls are minimized to a chip (tap it to pick the phone back up); a reply that is still pending moves to the normal choice panel. */
let phoneCtl={},phoneMin=false;
function phoneVisible(){return $('#phone').classList.contains('on')}
function openPhone(html,ctl){const old=phoneCtl;phoneCtl=ctl||{};try{old.cleanup&&old.cleanup()}catch(e){}
 $('#pTime').textContent=nowStr();$('#pScr').innerHTML=html;phoneMin=false;$('#phone').classList.add('on');document.body.classList.add('phoneOn');
 const bk=$('#pScr .back');if(bk)bk.onclick=e=>{e.stopPropagation();putDown()};
 pushBack();AU.sfx('whoosh',.3);placeChoice()}
function closePhone(){const c=phoneCtl;phoneCtl={};try{c.cleanup&&c.cleanup()}catch(e){}
 $('#phone').classList.remove('on');document.body.classList.remove('phoneOn');phoneMode=null;phoneMin=false;$('#pScr').innerHTML='';if(G)G.chat=null;popBack();placeChoice();updChip()}
function minimizePhone(){if(!phoneVisible())return;phoneMin=true;$('#phone').classList.remove('on');document.body.classList.remove('phoneOn');popBack();AU.sfx('whoosh',.2);placeChoice();updChip()}
function restorePhone(){if(!phoneMin||!phoneMode)return;phoneMin=false;$('#pTime').textContent=nowStr();$('#phone').classList.add('on');document.body.classList.add('phoneOn');pushBack();placeChoice();updChip();const lb=$('#lnBody');if(lb)lb.scrollTop=1e6}
function putDown(){if(!phoneVisible())return;const k=phoneMode&&phoneMode.kind,d=phoneCtl.down;
 if(k==='line'||k==='call'){try{d&&d()}catch(e){}minimizePhone()}else{closePhone();try{d&&d()}catch(e){}}}
function updChip(){const c=$('#pChip');if(!c)return;const on=phoneMin&&!!phoneMode;c.classList.toggle('on',on);if(!on)return;
 const pend=phoneMode.kind==='line'&&curCh;c.classList.toggle('pend',!!pend);
 c.textContent=phoneMode.kind==='call'?'📞 通話中・點這裡拿起手機':pend?'📱 回到手機回覆':'📱 拿起手機'}
$('#pChip').addEventListener('click',e=>{e.stopPropagation();restorePhone()});
$('#pDownBtn').addEventListener('click',e=>{e.stopPropagation();putDown()});
$('#phone').addEventListener('pointerdown',e=>{if(e.target.closest('button,input,a,select'))return;
 if(!e.target.closest('.dev')){e.preventDefault();putDown();return}onTap()});
// browser / Android back button puts the phone down
let navBusy=0;
function isArmed(){return !!(history.state&&history.state.dzPhone)}
function syncBack(){if(navBusy)return;try{const want=phoneVisible(),armed=isArmed();
 if(want&&!armed)history.pushState({dzPhone:1},'');
 else if(!want&&armed){navBusy=setTimeout(()=>{navBusy=0;syncBack()},1500);history.back()}}catch(e){}}
const pushBack=()=>setTimeout(syncBack,0),popBack=pushBack;
addEventListener('popstate',()=>{const ours=!!navBusy;if(navBusy){clearTimeout(navBusy);navBusy=0}
 if(!ours&&phoneVisible()&&!isArmed())putDown(); // the player pressed the browser / Android back button
 syncBack()});
function openLine(who){phoneMode={kind:'line',who};if(G)G.chat=who;
 openPhone(`<div class="lnHead"><button class="back" aria-label="放下手機">‹</button><span>${CONTACT[who]||who}</span></div><div class="lnBody" id="lnBody"></div><div class="lnFoot" id="lnFoot"><div class="inp">輸入訊息</div></div>`)}
async function bubble(s){const body=$('#lnBody');if(!body){await sayLine(s.who,s.emo,s.text,s.key);return}const hidden=!phoneVisible();
 const me=s.who==='me';const multi=phoneMode.who==='multi';
 if(!me){const ty=document.createElement('div');ty.className='msg typing';ty.innerHTML=`<div class="av" style="background-image:${AV(s.who)}"></div><div class="col"><div class="bb">•••</div></div>`;body.appendChild(ty);body.scrollTop=1e6;await sleep(FAST||hidden?20:500+Math.min(900,s.text.length*40));ty.remove()}
 const m=document.createElement('div');m.className='msg'+(me?' me':'');
 m.innerHTML=(me?'':`<div class="av" style="background-image:${AV(s.who)}"></div>`)+`<div class="col">${!me&&multi?`<div class="nm">${CONTACT[s.who]||NAMES[s.who]}</div>`:''}<div class="bb"></div></div><div class="tm">${nowStr()}</div>`;
 m.querySelector('.bb').textContent=s.text;body.appendChild(m);body.scrollTop=1e6;AU.sfx(me?'send':'pop',.5);if(hidden&&!me){const c=$('#pChip');c.classList.remove('ping');void c.offsetWidth;c.classList.add('ping')}
 await sayLine(s.who,s.emo,s.text,s.key,{bubble:!hidden})}
function openIgPost(){phoneMode={kind:'ig'};
 openPhone(`<div class="igFeed"><div class="igPost"><div class="hd"><b></b>ray.chen_0921</div><div class="im" style="background-image:url(img/ex_1.webp)"></div><div class="ac">♡ ◯ ➤</div><div class="lk">1,284 個讚</div><div class="cm"><span>ray.chen_0921</span>週末快樂</div><div class="cm"><span>yuu.0315</span>學長好帥♡♡</div><div class="cm"><span>miki_lin</span>上次那間我也想去♡</div><div class="cm"><span>chiaaa.c</span>欸我在這張旁邊耶😳♡</div></div></div>`)}
function igFeed(){return new Promise(res=>{phoneMode={kind:'ig'};
 const posts=[['ex_1','週末快樂','學長好帥♡♡','yuu.0315'],['ex_2','練球完','下次也帶我去嘛♡','miki_lin'],['ex_3','深夜食堂','這是哪裡！想去♡','chiaaa.c']];
 openPhone(`<div class="igFeed" id="igF">${posts.map((p,i)=>`<div class="igPost"><div class="hd"><b></b>ray.chen_0921</div><div class="im" style="background-image:url(img/${p[0]}.webp)"></div><div class="ac">♡ ◯ ➤</div><div class="lk">${(1284-i*311).toLocaleString()} 個讚</div><div class="cm"><span>ray.chen_0921</span>${p[1]}</div><div class="cm"><span>${p[3]}</span>${p[2]}</div><div class="cm"><span>sis.0702</span>♡</div></div>`).join('')}</div><button class="pClose" id="pDown">放下手機</button>`,{down:()=>res()});
 const b=$('#pDown');b.onclick=e=>{e.stopPropagation();putDown()};if(AUTO()&&!window.__manual)setTimeout(()=>b.click(),50)})}
function openCall(who){return new Promise(res=>{phoneMode={kind:'call',who};let done=false,ring=null,iv=0,to=0;
 const stopRing=()=>{clearInterval(iv);clearTimeout(to);try{ring&&ring.stop()}catch(x){}};
 const go=e=>{e&&e.stopPropagation&&e.stopPropagation();if(done)return;done=true;stopRing();const cs=$('#callS');if(cs){cs.classList.add('live');$('#callSt').textContent='00:0'+Math.floor(Math.random()*9)}res()};
 openPhone(`<div class="call" id="callS"><div class="cav" style="background-image:${AV(who)}"></div><div class="cn">${CONTACT[who]||who}</div><div class="cs" id="callSt">語音通話來電…</div><div class="wave">${'<i></i>'.repeat(9)}</div><div class="ans"><button class="no" id="cNo">✕</button><button class="ok" id="cOk">✆</button></div></div>`,{down:go,cleanup:()=>{stopRing();if(!done){done=true;res()}}});
 $$('.call .wave i').forEach((x,i)=>x.style.animationDelay=(i*.11)+'s');
 AU.sfx('ring',.5).then(s=>{ring=s;if(done)try{s&&s.stop()}catch(x){}});iv=setInterval(()=>{if(!done)AU.sfx('ring',.5)},3300);
 $('#cOk').onclick=go;$('#cNo').onclick=go;to=setTimeout(go,FAST?20:9000)})}
/* ---------------- shop ---------------- */
function shop(){return new Promise(res=>{const S=$('#shop');let cat='飲料零食';const bask={};
 const total=()=>Object.entries(bask).reduce((a,[k,n])=>a+ITEMS[k].p*n,0);
 const render=()=>{const w=wallet();S.innerHTML=`<div class="shelf"><div class="sh"><b>巷口的便利商店</b><span>錢包 NT$ ${w.toLocaleString()}</span></div>
  <div class="tabs">${['飲料零食','小東西','型錄預購'].map(c=>`<button data-c="${c}" class="${c===cat?'on':''}">${c}</button>`).join('')}</div>
  <div class="items">${Object.entries(ITEMS).filter(([k,v])=>v.c===cat).map(([k,v])=>`<button class="it ${v.p>w-total()?'no':''}" data-k="${k}">${bask[k]?`<span class="q">${bask[k]}</span>`:''}<span class="nm">${v.n}</span><span class="ds">${v.d}</span><span class="pr"><small>${G.inv[k]?'書包裡有 '+G.inv[k]:''}</small>$${v.p}</span></button>`).join('')}</div>
  <div class="sf"><span class="sp">籃子：${Object.values(bask).reduce((a,b)=>a+b,0)} 件　合計 NT$ ${total()}</span><button class="gr" id="sClr">清空</button><button class="gr" id="sOut">離開</button><button id="sPay">結帳</button></div></div>`;
  S.querySelectorAll('.tabs button').forEach(b=>b.onclick=e=>{e.stopPropagation();cat=b.dataset.c;render()});
  S.querySelectorAll('.it').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.k;if(ITEMS[k].p>wallet()-total()){toast('錢不夠……');return}bask[k]=(bask[k]||0)+1;AU.sfx('step',.3);render()});
  $('#sClr').onclick=e=>{e.stopPropagation();for(const k in bask)delete bask[k];render()};
  $('#sOut').onclick=e=>{e.stopPropagation();S.classList.remove('on');S.innerHTML='';res()};
  $('#sPay').onclick=async e=>{e.stopPropagation();const t=total();if(!t){S.classList.remove('on');S.innerHTML='';res();return}
   setWallet(wallet()-t);for(const[k,n]of Object.entries(bask))G.inv[k]=(G.inv[k]||0)+n;saveG();AU.sfx('coin',.7);
   S.innerHTML=`<div class="rcpt">　　　　　交易明細<br>${new Date().toLocaleDateString('zh-TW')}　${nowStr()}<br>--------------------------<br>${Object.entries(bask).map(([k,n])=>`${ITEMS[k].n} x${n}　$${ITEMS[k].p*n}`).join('<br>')}<br>--------------------------<br>合計　　　　　　　$${t}<br>現金　　　　　　　$${t}<br><br>　　謝謝光臨，歡迎再來</div>`;
   await sleep(TEST?50:2600);S.classList.remove('on');S.innerHTML='';res()}};
 render();S.classList.add('on');if(AUTO())setTimeout(()=>{const b=$('#sOut');b&&b.click()},60)})}
/* ---------------- give ---------------- */
function give(who){return new Promise(res=>{const A=$('#act');A.className='on';
 const list=Object.entries(G.inv).filter(([k,n])=>n>0);
 A.innerHTML=`<div class="bag"><div class="bt">書包裡的東西</div><div class="bl">${list.map(([k,n])=>`<button data-k="${k}">${ITEMS[k].n}${n>1?' ×'+n:''}</button>`).join('')}<button data-k="">算了</button></div></div>`;
 A.querySelectorAll('button').forEach(b=>b.onclick=e=>{e.stopPropagation();const k=b.dataset.k;A.className='';A.innerHTML='';
  if(!k){res();return}G.inv[k]--;const pf=PREF[who]||{love:[],like:[]};
  const dup=Object.entries(G.given).some(([w,ks])=>w!==who&&ks.includes(k));(G.given[who]=G.given[who]||[]).push(k);
  let cat=dup?'dup':pf.love.includes(k)?'love':pf.like.includes(k)?'like':'meh';
  applyFx([[who,'+',{love:10,like:5,meh:1,dup:0}[cat]]]);if(dup)applyFx([['exp','+',8],['zha','+',3]]);
  const big=ITEMS[k].p>=900;if(big)applyFx([['exp','+',10],['zha','+',2]]);
  G.stack.push({node:G.node,i:G.i});if(big)G.stack.push({node:'g_big',i:0});
  res({go:`g_${who}_${cat}`})});
 if(AUTO())setTimeout(()=>{const b=A.querySelector('button');b&&b.click()},40)})}
/* ---------------- endings ---------------- */
async function ending(id){const E=ENDS.find(e=>e.id===id)||ENDS[0];const got=new Set(LS.get('fp_ends',[]));got.add(id);LS.set('fp_ends',[...got]);LS.set('fp_save',null);
 hideSub();closePhone();cancelChoice();await sleep(600);AU.loop('amb','none');
 const c=$('#card');$('#cardT').textContent=`結局　${E.t}`;$('#cardS').innerHTML=`${E.q}<br><br><span style="font-size:12px">已收集 ${got.size} / ${ENDS.length}</span><br><button id="eT">回到標題</button><button id="eA">再過一次那六天</button>`;c.classList.add('on');
 const key=DZP.vkey('nar','標題',`結局，${E.t}。`);const my=RUN;
 const done=new Promise(r=>{$('#eT').onclick=e=>{e.stopPropagation();c.classList.remove('on');toTitle();r()};$('#eA').onclick=e=>{e.stopPropagation();c.classList.remove('on');newGame();r()}});
 AU.voice(key);await done}
/* ---------------- title / menu ---------------- */
function resetUI(){AU.stopVoice();tapWaiter=null;closePhone();cancelChoice();hideSub();$('#act').className='';$('#act').innerHTML='';$('#shop').classList.remove('on');$('#shop').innerHTML='';$('#note').classList.remove('on');$('#card').classList.remove('on')}
function toTitle(){RUN++;resetUI();
 $('#title').classList.add('show');$('#bCont').disabled=!LS.get('fp_save',null);AU.loop('amb','night',-4);AU.loop('bgm','title',0,2)}
function newGame(){RUN++;resetUI();G=freshG();applyPending();closeTitle();curBg='';$('#clock').textContent='';run()}
function contGame(){const s=LS.get('fp_save',null);if(!s){newGame();return}RUN++;resetUI();G=s;const chat=G.chat;applyPending();closeTitle();curBg='';const sc=G.scene;
 $('#clock').textContent=sc.time||'';setBg(sc.bg||'black','cut');AU.loop('amb',sc.amb||'none',AMBG[sc.amb]||0);AU.loop('bgm',sc.bgm||'none');
 if(G.i>0){let j=G.i-1;const B=P.N[G.node];while(j>0&&B[j].k!=='choice'&&B[j].k!=='scene')j--;G.i=B[j]&&B[j].k==='choice'?j:G.i}if(chat)openLine(chat);run()}
function closeTitle(){$('#title').classList.remove('show')}
function openMenu(){if($('#title').classList.contains('show'))return;$('#menu').classList.add('on')}
$('#menuBtn').onclick=e=>{e.stopPropagation();openMenu()};
$('#menu').onclick=e=>{if(e.target.id==='menu')$('#menu').classList.remove('on')};
$$('#menu [data-m]').forEach(b=>b.onclick=e=>{e.stopPropagation();const m=b.dataset.m;$('#menu').classList.remove('on');
 if(m==='code')codeModal();if(m==='full')goFull();if(m==='title'){saveG();toTitle()}});
for(const[id,k]of[['vVoice','voice'],['vBgm','bgm'],['vAmb','amb']]){const el=$('#'+id);el.value=AU.vol[k];el.oninput=()=>{AU.vol[k]=+el.value;LS.set('fp_vol',AU.vol);AU.applyVol()}}
$('#vSub').value=LS.get('fp_sub',1)?'1':'0';document.body.classList.toggle('nosub',!LS.get('fp_sub',1));$('#vSub').onchange=e=>{LS.set('fp_sub',+e.target.value);document.body.classList.toggle('nosub',!+e.target.value)};
function goFull(){const d=document.documentElement;try{(d.requestFullscreen||d.webkitRequestFullscreen||(()=>{})).call(d)}catch(e){}try{if(innerHeight>innerWidth&&/Android/i.test(navigator.userAgent)&&screen.orientation&&screen.orientation.lock)setTimeout(()=>screen.orientation.lock('landscape').catch(()=>{}),300)}catch(e){}}
function modal(html){$('#modalBox').innerHTML=html+'<button id="mX">關閉</button>';$('#modal').classList.add('on');$('#mX').onclick=()=>$('#modal').classList.remove('on')}
$('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('on')};
function endsModal(){const got=new Set(LS.get('fp_ends',[]));modal(`<h3>結局</h3><div class="endl">${ENDS.map(e=>got.has(e.id)?`<div><b>${e.t}</b><br>${e.q}</div>`:`<div class="lock"><b>？？？</b><br>${e.h}</div>`).join('')}</div>`)}
/* ---------------- interactions (in-world, minimal UI) ---------------- */
function actOpen(html){const A=$('#act');A.innerHTML=html;A.className='on';return A}
function actClose(){const A=$('#act');A.className='';A.innerHTML='';A.onpointerdown=A.onpointerup=A.onpointerleave=null;$('#cam').classList.remove('run');$('#cam').classList.add('sway');camFx('')}
function hint(t){return `<div class="hint">${t}</div>`}
const AUTO=()=>TEST&&!!window.__autoPick;
const tst=(v,ms=60)=>AUTO()?sleep(ms).then(()=>v):null;
const ACTS={
 async pat(){const A=actOpen(hint('跟著她的呼吸——在她吐氣的時候，輕輕拍')+'<div class="ring" id="r"></div>');const r=$('#r');
  const cx=innerWidth*.6,cy=innerHeight*.58;let good=0,n=0;const t0=performance.now();let raf;AU.sfx('sob',.7);
  const loop=()=>{const ph=((performance.now()-t0)/2600)%1;const s=60+40*Math.cos(ph*2*Math.PI);r.style.cssText=`left:${cx-s}px;top:${cy-s}px;width:${2*s}px;height:${2*s}px;opacity:${.35+.4*(1-(s-20)/80)}`;r.dataset.s=s;raf=requestAnimationFrame(loop)};loop();
  const bi=setInterval(()=>AU.sfx('breath',.5),2600);AU.sfx('breath',.5);
  await (tst(0,200)||new Promise(res=>{A.onpointerdown=e=>{e.preventDefault();n++;const s=+r.dataset.s;if(s<45){good++;AU.sfx('thud',.15)}else AU.sfx('thud',.25);navigator.vibrate&&navigator.vibrate(20);if(n>=6)res()};setTimeout(res,30000)}));
  cancelAnimationFrame(raf);clearInterval(bi);actClose();applyFx([['sis','+',good],['con','+',good>3?2:0]])},
 async catch(){camFx('blur(.6px) saturate(.9)');AU.sfx('heart',.9);AU.loop('bgm','none');
  const A=actOpen(hint('她要摔倒了——')+'<div class="ring" id="r"></div>');const r=$('#r');const cx=innerWidth*(.4+Math.random()*.2),cy=innerHeight*(.5+Math.random()*.15);
  await sleep(TEST?10:700+Math.random()*900);const t0=performance.now();AU.sfx('whoosh',.6);let ok=0;
  const loop=()=>{const f=(performance.now()-t0)/1100;const s=Math.max(28,160*(1-f)+28);r.style.cssText=`left:${cx-s}px;top:${cy-s}px;width:${2*s}px;height:${2*s}px`;if(f<1.4)raf=requestAnimationFrame(loop)};let raf;loop();
  ok=await (tst(1)||new Promise(res=>{A.onpointerdown=e=>{e.preventDefault();const t=performance.now()-t0;res(t>450&&t<1350?1:0)};setTimeout(()=>res(0),1500)}));
  cancelAnimationFrame(raf);G.V.caught=ok;if(ok){AU.sfx('thud',.5);shake()}else{AU.sfx('crash',.5)}actClose()},
 async hide(){AU.sfx('buzz',.9);navigator.vibrate&&navigator.vibrate([200,100,200,100,200]);
  const A=actOpen(hint('快——把手機翻過來')+`<div style="position:absolute;left:50%;bottom:6vh;transform:translateX(-50%) rotate(-4deg);width:min(48vw,190px);height:min(30vh,170px);background:#111;border-radius:18px;border:2px solid #333;padding:14px 10px;display:flex;flex-direction:column;gap:6px;box-shadow:0 0 40px rgba(255,255,255,.15)" id="pp">${['小晴 ☀：♡♡♡','小愛：晚安♡','林小美：♡'].map(t=>`<div style="background:rgba(255,255,255,.12);border-radius:8px;padding:5px 8px;font-size:12px">${t}</div>`).join('')}</div>`);
  const ok=await (tst(1)||new Promise(res=>{$('#pp').onpointerdown=e=>{e.preventDefault();e.stopPropagation();res(1)};A.onpointerdown=()=>{};setTimeout(()=>res(0),1700)}));
  G.V.hid=ok;if(ok){$('#pp').style.transition='transform .25s';$('#pp').style.transform='translateX(-50%) rotateY(180deg) scale(.9)';AU.sfx('thud',.3);await sleep(300)}actClose()},
 async grab(){const A=actOpen(hint('擠進去——連續點，伸手搶！')+'<div class="pbar"><i id="pb"></i></div>');let n=0;const need=12;
  const ok=await (tst(1)||new Promise(res=>{A.onpointerdown=e=>{e.preventDefault();n++;$('#pb').style.width=(n/need*100)+'%';AU.sfx('step',.4);$('#cam').style.transform=`translate(${(Math.random()-.5)*14}px,${(Math.random()-.5)*10}px)`;if(n>=need)res(1)};setTimeout(()=>res(0),3600)}));
  $('#cam').style.transform='';G.V.grabbed=ok;actClose()},
 async sprint(){return runAct({label:'左右交替點擊（或鍵盤 F / J）——跑！',final:'11.2',taps:36})},
 async race(){AU.loop('bgm','race',0,.5);return runAct({label:'左右交替——衝！',final:'11.0',taps:40,race:1})},
 async chase(){return runAct({label:'追上她——',final:null,taps:28,chase:1})},
 async start(){const A=actOpen(hint('預備……槍響的瞬間點擊螢幕')+'<div class="bigt" id="bt"></div>');AU.sfx('heart',.8);
  for(let k=0;k<2;k++){let fired=false,t0=0;const wait=1500+Math.random()*1800;
   const r=await (tst('ok')||new Promise(res=>{const tm=setTimeout(()=>{fired=true;t0=performance.now();AU.sfx('pistol',1);shake()},wait);A.onpointerdown=e=>{e.preventDefault();if(!fired){clearTimeout(tm);res('false')}else res(performance.now()-t0)};setTimeout(()=>{if(fired)res(900)},wait+1500)}));
   if(r==='false'){$('#bt').textContent='搶跑';AU.sfx('pistol',.6);await sleep(1200);$('#bt').textContent='';continue}
   G.V.react=typeof r==='number'?Math.round(r):200;$('#bt').textContent=typeof r==='number'?(r/1000).toFixed(3)+'s':'';await sleep(700);break}
  actClose()},
 async sneak(){const A=actOpen(hint('按住前進——她們回頭時，放開')+'<div class="eye" id="eye">她們回頭了</div><div class="pbar"><i id="pb"></i></div>');
  let prog=0,hold=false,looking=false,caught=false,t=performance.now(),nextLook=1600+Math.random()*1200,lookEnd=0,warn=0;
  const dn=e=>{e.preventDefault&&e.preventDefault();hold=true},up=()=>{hold=false};A.onpointerdown=dn;A.onpointerup=up;A.onpointerleave=up;
  const kd=e=>{if(e.code==='Space'){e.preventDefault();hold=true}},ku=e=>{if(e.code==='Space')hold=false};addEventListener('keydown',kd);addEventListener('keyup',ku);
  let stepT=0;
  const ok=await (tst(1)||new Promise(res=>{let last=performance.now();const loop=now=>{const dt=now-last;last=now;const el=now-t;
    if(!looking&&el>nextLook-650&&!warn){warn=1;$('#eye').style.opacity=.5}
    if(!looking&&el>nextLook){looking=true;lookEnd=el+1300;$('#eye').style.opacity=1;AU.sfx('heart',.8)}
    if(looking&&el>lookEnd){looking=false;warn=0;$('#eye').style.opacity=0;nextLook=el+1500+Math.random()*1600}
    if(hold){prog+=dt/70;$('#cam').classList.add('run');if(now-stepT>380){stepT=now;AU.sfx('step',.35)}if(looking){caught=true}}else $('#cam').classList.remove('run');
    $('#pb').style.width=Math.min(100,prog)+'%';
    if(caught){res(0);return}if(prog>=100){res(1);return}requestAnimationFrame(loop)};requestAnimationFrame(loop)}));
  removeEventListener('keydown',kd);removeEventListener('keyup',ku);G.V.sneak_ok=ok;actClose()},
 async dishes(){const A=actOpen(hint('拿著菜瓜布來回刷——')+'<canvas class="scrub" id="cv"></canvas>');const cv=$('#cv'),W=cv.width=innerWidth,H=cv.height=innerHeight,c=cv.getContext('2d');
  const blobs=[];for(let k=0;k<26;k++)blobs.push([W*(.36+Math.random()*.26),H*(.52+Math.random()*.26),18+Math.random()*30]);
  c.fillStyle='rgba(120,80,30,.55)';blobs.forEach(([x,y,r])=>{c.beginPath();c.ellipse(x,y,r,r*.7,Math.random()*3,0,7);c.fill()});
  const total=()=>{const d=c.getImageData(W*.3,H*.45,W*.4,H*.4).data;let n=0;for(let k=3;k<d.length;k+=64)if(d[k]>20)n++;return n};const t0=total()||1;let lastS=0;
  await (tst(0)||new Promise(res=>{let down=false;cv.onpointerdown=e=>{down=true};cv.onpointerup=()=>down=false;cv.onpointerleave=()=>down=false;
   cv.onpointermove=e=>{if(!down&&e.pointerType==='mouse'&&e.buttons===0)return;c.globalCompositeOperation='destination-out';c.beginPath();c.arc(e.clientX,e.clientY,34,0,7);c.fill();c.globalCompositeOperation='source-over';const now=performance.now();if(now-lastS>300){lastS=now;AU.sfx('scrub',.5)}if(total()/t0<.12)res()};setTimeout(res,20000)}));
  AU.sfx('step',.3);actClose()},
 async flip(){let good=0;for(let k=0;k<3;k++){const A=actOpen(hint(`第 ${k+1} 份——看顏色，金黃的時候翻面`)+`<div style="position:absolute;left:34%;top:56%;width:26%;height:18%;border-radius:50%;background:radial-gradient(rgba(150,80,10,0),rgba(0,0,0,0));mix-blend-mode:multiply" id="cr"></div><div class="pbar"><i id="pb" style="background:linear-gradient(90deg,#f3e3a0,#e0a030 62%,#7a3a00)"></i></div>`);
  const t0=performance.now(),D=3600+Math.random()*900;let raf;const cr=$('#cr');
  const loop=()=>{const f=(performance.now()-t0)/D;$('#pb').style.width=Math.min(100,f*100)+'%';cr.style.background=`radial-gradient(rgba(${200-f*120},${120-f*90},0,${Math.min(.75,f*.6)}),rgba(0,0,0,0) 70%)`;if(f<1.25)raf=requestAnimationFrame(loop)};loop();
  const f=await (tst(.7)||new Promise(res=>{A.onpointerdown=e=>{e.preventDefault();res((performance.now()-t0)/D)};setTimeout(()=>res(1.3),D*1.3)}));
  cancelAnimationFrame(raf);AU.sfx('flip',.8);const ok=f>.55&&f<.85;if(ok)good++;$('.hint').textContent=ok?'漂亮。':(f>=.85?'有點焦了……':'還沒熟……');await sleep(TEST?10:900)}
  actClose();G.V.flips=good},
 async juggle(){const spots=[['qing','園遊會攤位','s_coop',7],['ai','班際比賽看台','s_track',9],['mei','樓梯間','s_stairs',11]];const pat=[100,100,100];let here=0,moving=false;
  const A=actOpen(hint('三個地方、三個人——不要讓任何一個人等太久')+`<div class="bigt" id="bt" style="font-size:42px">20</div><div class="jug">${spots.map((s,i)=>`<button data-i="${i}" style="background-image:url(img/${s[2]}.webp)"><b style="width:100%"></b><span>${s[1]}</span></button>`).join('')}</div>`);
  const bs=A.querySelectorAll('.jug button');const t0=performance.now();let last=t0;
  bs.forEach(b=>b.onclick=async e=>{e.stopPropagation();const i=+b.dataset.i;if(moving||i===here)return;moving=true;$('#cam').classList.add('run');AU.sfx('step',.5);setTimeout(()=>AU.sfx('step',.5),300);await sleep(800);$('#cam').classList.remove('run');here=i;moving=false;pat[i]=100;AU.sfx('whoosh',.4)});
  const ok=await (tst(1)||new Promise(res=>{const loop=now=>{const dt=(now-last)/1000;last=now;for(let i=0;i<3;i++){if(i===here&&!moving)pat[i]=Math.min(100,pat[i]+dt*30);else pat[i]-=dt*100/spots[i][3]}
    bs.forEach((b,i)=>{b.querySelector('b').style.width=Math.max(0,pat[i])+'%';b.classList.toggle('here',i===here);b.classList.toggle('low',pat[i]<30)});
    const left=20-(now-t0)/1000;$('#bt').textContent=Math.max(0,Math.ceil(left));
    if(pat.some(p=>p<=0)){res(0);return}if(left<=0){res(1);return}requestAnimationFrame(loop)};requestAnimationFrame(loop)}));
  G.V.juggle_ok=ok;actClose()}};
async function runAct(o){const A=actOpen(hint(o.label)+'<div class="zones"><div id="zL">左</div><div id="zR">右</div></div><div class="bigt" id="bt"></div><div class="pbar"><i id="pb"></i></div>');
 let n=0,side=null;const t0=performance.now();const c=$('#cam');c.classList.remove('sway');c.classList.add('run');let hb=setInterval(()=>AU.sfx('heart',.5),700);
 if(o.chase)camFx('blur(1px) saturate(.8)');
 const tap=s=>{if(s===side)return;side=s;n++;$('#pb').style.width=Math.min(100,n/o.taps*100)+'%';const z=$('#z'+s);z.classList.add('hit');setTimeout(()=>z.classList.remove('hit'),90);if(n%2)AU.sfx('step',.45);
  c.style.animationDuration=Math.max(.18,.5-n/o.taps*.3)+'s'};
 const kd=e=>{if(e.code==='KeyF'||e.code==='ArrowLeft')tap('L');if(e.code==='KeyJ'||e.code==='ArrowRight')tap('R')};addEventListener('keydown',kd);
 $('#zL').onpointerdown=e=>{e.preventDefault();tap('L')};$('#zR').onpointerdown=e=>{e.preventDefault();tap('R')};
 let raf;const tick=()=>{const t=(performance.now()-t0)/1000;if(!o.chase)$('#bt').textContent=(Math.min(t*11.2/Math.max(4,o.taps/5.2),99)).toFixed(2);raf=requestAnimationFrame(tick)};tick();
 await (tst(0,80)||new Promise(res=>{const chk=setInterval(()=>{if(n>=o.taps||performance.now()-t0>(o.chase?6000:20000)){clearInterval(chk);res()}},50)}));
 cancelAnimationFrame(raf);clearInterval(hb);removeEventListener('keydown',kd);c.style.animationDuration='';
 if(o.final){$('#bt').textContent=o.final;AU.sfx('applause',.6)}
 G.V.race_t=(performance.now()-t0)/1000;await sleep(TEST?10:1300);actClose()}
/* ---------------- redeem codes (same codes as the original; separate one-use record for this version) ---------------- */
const STATK={sis:'姐姐',zha:'渣度',con:'良心',exp:'流言',spd:'速度',desk:'同桌',ai:'小愛',mei:'小美',qing:'小晴'};
function inGame(){return !!G&&!$('#title').classList.contains('show')}
function applyPending(){const p=LS.get('fp_pend',{})||{};for(const k in p){G.V[k]=(G.V[k]||0)+p[k]}LS.set('fp_pend',{})}
const GR={
 money:{check:v=>/^\+?\d{1,7}$/.test(v)&&+v>0?null:'金額格式錯誤',apply(k,v){v=parseInt(v,10);setWallet(wallet()+v);LS.set('fp_wshow',1);renderWallet();return `錢包 +NT$${v.toLocaleString()}`}},
 stat:{check:v=>/^[+-]?\d{1,3}$/.test(v)?null:'數值格式錯誤',apply(k,v){v=parseInt(v,10);if(inGame()){G.V[k]=(G.V[k]||0)+v;saveG()}else{const p=LS.get('fp_pend',{})||{};p[k]=(p[k]||0)+v;LS.set('fp_pend',p)}return `${STATK[k]||k} ${v>0?'+':''}${v}`}},
 u:{check:()=>null,apply(k,v){const ids=v==='ALL'?ENDS.map(e=>e.id):[v];const got=new Set(LS.get('fp_ends',[]));ids.forEach(i=>{if(ENDS.some(e=>e.id===i))got.add(i)});LS.set('fp_ends',[...got]);return v==='ALL'?'解鎖全部結局紀錄':'解鎖結局 '+v}},
 n:{check:()=>null,apply:()=>null}};
GR['零用錢']=GR.money;GR.cash=GR.money;
function grantFor(k){if(k in STATK)return GR.stat;if(k==='unlock')return GR.u;return GR[k]||null}
function itemsOf(text){return text.split(';').filter(Boolean).map(x=>{const j=x.indexOf('=');return[x.slice(0,j),x.slice(j+1)]})}
function checkItems(items){for(const[k,v]of items){const g=grantFor(k);if(!g)return `這組兌換碼含有這個版本不認識的內容「${k}」。`;const e=g.check(v);if(e)return e}return null}
function normCode(raw){return String(raw||'').toUpperCase().replace(/[\s\-_]/g,'')}
const SHORT_ABC='23456789ABCDEFGHJKMNPQRSTUVWXYZ',SHORT_SALT='dz-short-v1|';
function hexOf(b){return Array.from(b).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function redeemAny(raw){const s=normCode(raw);if(!s.startsWith('DZ'))return{err:'兌換碼要以 DZ 開頭喔。'};
 const used=LS.get('fp_used',[])||[];let id,items;
 if(s.length===10){const body=s.slice(2);if([...body].some(c=>!SHORT_ABC.includes(c)))return{err:'格式不對，請檢查有沒有打錯字（短碼不會有 0、O、1、I、L）。'};
  const h=hexOf(sha256(new TextEncoder().encode(SHORT_SALT+s)));id='s:'+h.slice(0,20);if(used.includes(id))return{err:'這組兌換碼在這個版本已經用過了。'};
  let db;try{const r=await fetch('../assets/codes.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw 0;db=await r.json()}catch(e){return{err:'連不上兌換資料，請檢查網路後再試一次。'}}
  const text=db&&db.codes&&db.codes[h];if(!text)return{err:'兌換碼無效。（剛產生的新碼可能要等 1～2 分鐘才生效）'};items=itemsOf(text)}
 else{const bytes=b32dec(s.slice(2));if(!bytes||bytes.length<7)return{err:'格式不對，請檢查有沒有打錯字。'};
  const body=bytes.slice(0,-5),sig=bytes.slice(-5),h=hmac(CODE_SECRET,body);for(let x=0;x<5;x++)if(h[x]!==sig[x])return{err:'兌換碼無效（驗證失敗）。'};
  let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(body)}catch(e){return{err:'兌換碼內容損壞。'}}
  id=hexOf(sig);if(used.includes(id))return{err:'這組兌換碼在這個版本已經用過了。'};items=itemsOf(text)}
 const e=checkItems(items);if(e)return{err:e};
 const got=items.map(([k,v])=>grantFor(k).apply(k,v)).filter(Boolean);used.push(id);LS.set('fp_used',used);return{ok:true,got}}
function codeModal(){modal(`<h3>兌換碼</h3><p>輸入兌換碼（例如 DZ-8K3Q9M2X），大小寫、空格、- 都沒關係。原版的長兌換碼也能用；每組在這個版本可以用一次。</p><input class="codein" id="cIn" placeholder="DZ-" autocomplete="off" spellcheck="false"><button id="cGo">兌換</button><div class="cres" id="cRes"></div>`);
 let busy=false;const go=async()=>{if(busy)return;busy=true;const el=$('#cRes');el.className='cres';el.textContent='兌換中……';const r=await redeemAny($('#cIn').value);busy=false;
  if(r.err){el.className='cres err';el.textContent=r.err;return}el.className='cres ok';el.innerHTML='兌換成功<br>'+(r.got.length?r.got.map(x=>'・'+x).join('<br>'):'');AU.sfx&&AU.sfx('coin',.7);$('#cIn').value=''};
 $('#cGo').onclick=go;$('#cIn').onkeydown=e=>{if(e.key==='Enter')go()};setTimeout(()=>$('#cIn').focus(),50)}
window.FP={jump(n,vars){RUN++;resetUI();G=freshG();Object.assign(G.V,vars||{});G.node=n;G.i=0;closeTitle();curBg='';run()},redeemAny,get G(){return G},get P(){return P},AU,wallet,putDown,get phone(){return{on:phoneVisible(),min:phoneMin,mode:phoneMode&&phoneMode.kind,choice:!!curCh}}};
/* failsafe: never leave the phone stuck open with no way forward */
setInterval(()=>{try{const titleOn=$('#title').classList.contains('show');
 if((phoneVisible()||phoneMin)&&(titleOn||!phoneMode))closePhone();
 if(curCh&&curCh.btns.length&&!curCh.btns.some(b=>b.isConnected))placeChoice();
 if(!phoneVisible()&&document.body.classList.contains('phoneOn'))document.body.classList.remove('phoneOn');
 updChip()}catch(e){}},1000);
/* ---------------- boot ---------------- */
async function boot(){const txt=await (await fetch('story.txt?v=3')).text();P=DZP.parse(txt);renderWallet();
 $('#bCont').disabled=!LS.get('fp_save',null);
 $('#bNew').onclick=()=>{LS.get('fp_save',null)?confirmNew():newGame()};$('#bCont').onclick=contGame;$('#bEnds').onclick=endsModal;$('#bCode').onclick=codeModal;
 const gate=$('#gate');gate.classList.add('on');
 $('#gGo').onclick=()=>{AU.init();AU.ctx.resume();if(!TEST){goFull();gyro()}gate.classList.remove('on');toTitle()};
 if(TEST){$('#gGo').click()}
 $('#cam').classList.add('sway')}
function confirmNew(){modal(`<h3>重新開始？</h3><p>目前的進度會被覆蓋。錢包裡的錢會留著。</p><button id="cfY">重新開始</button>`);$('#cfY').onclick=()=>{$('#modal').classList.remove('on');newGame()}}
document.addEventListener('visibilitychange',()=>{if(!AU.ctx)return;if(document.hidden)AU.ctx.suspend();else AU.ctx.resume()});
boot().catch(e=>{console.error(e);document.body.insertAdjacentHTML('beforeend',`<div style="position:fixed;bottom:0;left:0;right:0;background:#400;color:#fff;padding:8px;z-index:999;font-size:12px">載入失敗：${e.message}</div>`)});
