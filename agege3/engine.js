/* 阿葛傳奇 第二部「成名之後」— 2D 分層影像互動劇場引擎（自寫，沿用第一部） */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var Q=new URLSearchParams(location.search);
var AUTO=Q.has('auto'), FAST=Math.max(1,+(Q.get('fast')||1)), PICK=(Q.get('pick')||'').split(',').filter(Boolean).map(Number);
var SEED=+(Q.get('seed')||0), LETTIME=Q.has('timeout'), AUTOVOICE=Q.has('voice');
var CDIRQ=(Q.get('cdir')||'').split(',').filter(Boolean).map(Number);
function mkrng(seed){ var a=seed>>>0; return function(){ a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return ((t^(t>>>14))>>>0)/4294967296; }; }
var rnd=SEED?mkrng(SEED):Math.random, crnd=SEED?mkrng(SEED*7+13):Math.random;
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms/FAST)})};
var CAST=window.CAST, ENDINGS=window.ENDINGS, FOCUS=window.FOCUS||{}, VOICE=window.VOICE||{};
var LS={get:function(k,d){try{var v=localStorage.getItem('agege3_'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('agege3_'+k,JSON.stringify(v))}catch(e){}},del:function(k){try{localStorage.removeItem('agege3_'+k)}catch(e){}}};
/* 整合（助理 11/01）🦆 節奏 2：快轉已讀。RD＝讀過的「節點:行號」，PK＝上一輪以前選過的選項；SKIP 開著時，已讀內容快速帶過，遇到沒讀過的句子或選擇就停 */
/* v=306（助理 11/03）已讀和「✓ 選過」改用「節點＋文字雜湊」當鍵（原本是 節點:行號，改稿後行號位移就會標錯）。
   舊版的 read／picked 不轉換，直接清掉（老玩家的已讀標記會重來一次）；新鍵存在 read2／picked2 */
function hsh(x){ x=String(x); var h=0x811c9dc5; for(var i=0;i<x.length;i++){ h^=x.charCodeAt(i); h=Math.imul(h,0x01000193); } return (h>>>0).toString(36); }
function opSig(op){ if(op.k==='line') return (op.spk||'')+'|'+op.text; if(op.k==='choice') return '?'+(op.prompt||'')+'|'+op.opts.map(function(o){return o.text}).join('|'); return op.k+'|'+(op.s||''); }
(function(){ if(LS.get('read',null)||LS.get('picked',null)){ LS.del('read'); LS.del('picked'); LS.set('rdreset',306); } })();
var RD=LS.get('read2',{}), PK=LS.get('picked2',{}), PK0=Object.assign({},PK), SKIP=false, rdDirty=0; // 整合（助理 11/01）PK0＝這一輪開始前的選擇快照，「✓ 選過」只標以前幾輪選的
function rdKey(op){ return S.node+'#'+(op._h||(op._h=hsh(opSig(op)))); }
function pkKey(op,o){ return S.node+'#'+hsh('?'+(op.prompt||''))+'#'+hsh(o.text); }
function markRead(op){ var k=rdKey(op); if(!RD[k]){ RD[k]=1; if(!rdDirty){ rdDirty=1; setTimeout(function(){ rdDirty=0; LS.set('read2',RD); },1500); } } }
function setSkip(on){ SKIP=!!on; var b=document.getElementById('skipBtn'); if(b) b.classList.toggle('on',SKIP); }
function skipping(){ return SKIP&&S&&S._wasRead; }
var SET=Object.assign({voice:1,music:.55,amb:.6,sub:true,auto:true,hint:true},LS.get('set',{})); // v=306 hint：💛、章末路線卡、最近結局提示
// 舊版單一存檔 → 依視角分開的存檔
(function(){ var o=LS.get('save',null); if(o&&o.camp){ if(!LS.get('save_'+o.camp,null)) LS.set('save_'+o.camp,o); } LS.del('save'); })();

/* ---------- 劇本解析 ---------- */
function kv(s){var o={};s.replace(/(\w+)=("[^"]*"|\S+)/g,function(_,k,v){o[k]=v.replace(/^"|"$/g,''); if(k==='time') o[k]=o[k].replace(/_/g,' ');});return o}
function parseFx(s){ if(!s) return []; return s.split(';').map(function(x){x=x.trim();var m=x.match(/^(\w+)\s*(\+=|-=|\*=|=)\s*(.+)$/);return m?{v:m[1],op:m[2],x:m[3].trim()}:null}).filter(Boolean); }
function parse(src){
  var N={}, order=[], cur=null, pov='ag9', lastChoice=null;
  src.split('\n').forEach(function(raw,ln){
    var l=raw.trim(); if(!l||l.slice(0,2)==='//') return;
    if(l.slice(0,3)==='== '){ var id=l.slice(3).trim(); cur=N[id]=[]; order.push(id); lastChoice=null; return; }
    var tag=null, m=l.match(/^\[(A|B|R|N)\]\s*/); if(m){tag=m[1]; l=l.slice(m[0].length);}
    var camp=cur&&order.length?order[order.length-1].charAt(0):'';
    camp=camp==='a'?'A':camp==='b'?'B':(tag==='A'||tag==='B'?tag:'A');
    var op=null;
    if(l.charAt(0)==='-'&&lastChoice){
      var o={raw:l}; l=l.slice(1).trim();
      var c=l.match(/^\[if ([^\]]+)\]\s*/); if(c){o.cond=c[1]; l=l.slice(c[0].length);}
      var g=l.match(/\s*->\s*(\S+)\s*$/); if(g){o.go=g[1]; l=l.slice(0,g.index);}
      var f=l.match(/\s*\{([^}]*)\}\s*$/); if(f){o.fx=parseFx(f[1]); l=l.slice(0,f.index);}
      o.text=l.trim(); lastChoice.opts.push(o); return;
    }
    lastChoice=null;
    if(l.charAt(0)==='@') op={k:'scene',a:kv(l.slice(1))};
    else if(l.charAt(0)==='?'){ var p=l.slice(1).split('|'); op={k:'choice',a:kv(p[0]),prompt:(p[1]||'').trim(),opts:[]}; lastChoice=op; }
    else if(l.charAt(0)==='!'){ var b=l.slice(1).trim(), sp=b.search(/\s/); var cmd=sp<0?b:b.slice(0,sp), rest=sp<0?'':b.slice(sp+1).trim();
      if(cmd==='pov'){pov=rest; return;}
      op={k:cmd,s:rest}; }
    else if(l.charAt(0)==='>'){ var t=l.slice(1).trim(); op=camp==='A'?{k:'line',spk:pov,vp:pov+'~',emo:'n',text:t,think:1}:{k:'line',spk:'nar',vp:'nar',emo:'n',text:t,think:1}; }
    else { var s=l.match(/^([a-z]+\d*)(?:\.([nsux]))?\s*[:：]\s*(.+)$/);
      if(s) op={k:'line',spk:s[1],vp:s[1],emo:s[2]||'n',text:s[3].trim()};
      else op={k:'line',spk:'',vp:'sys',emo:'n',text:l}; }
    op.tag=tag; op.ln=ln+1; if(cur) cur.push(op);
  });
  return {N:N,order:order};
}
var P=parse(window.STORY_SRC), N=P.N, ORDER=P.order;

/* ---------- 狀態 ---------- */
var S=null;
function fresh(camp,replay){ return {camp:camp,replay:!!replay,node:camp==='A'?'a1_start':'b1_start',idx:0,cur:0,chap:'',chart:null,
  vars:{fame:0,heart:0,cash:0,coin:0,burnout:0,franchise:0,branch:0,live:0,regulars:0,mom:0,uncle:0,chef:0,mate:0,kai:0,teach:0,viv:0,qing:0,yu:0,lin:0,bond:0,trustA:0,kol:0,kid:0,seventh:0,atruth:0,promise:0,leak:0,envy:0,myshop:0,look:0,help:0,tix:0,filmok:0,tv:0,noodle:0,umbrella:0,birthday:0,copy:0,ambition:0,chenlink:0,bplan:0,knife:0,app:0,qs:0,ql:0,rh:0,cok:0,pc:0,bid:0,cm:0,guess:0,cdir:0,cadapt:1,tadapt:1,panic:0,p1:''},
  stats:{timed:0,timeouts:0,fast:0,rtSum:0,choices:0,rhythm:0,rhyHit:0,qs:0,ql:0},seen:{},scene:{},hud:'none',hist:[],keys:[],lastChap:''}; }
// 未設定的變數讀起來是 0（SCRIPT_GUIDE §4）：with 用 Proxy，變數表沒有、全域也沒有的名字一律回 0（原本會 ReferenceError → 整個條件變 false，例如 trace<1）
var VPX=new WeakMap(); function vproxy(v){ var p=VPX.get(v); if(!p){ p=new Proxy(v,{has:function(t,k){ return typeof k==='string'&&((k in t)||!(k in window)); },get:function(t,k){ if(typeof k!=='string') return t[k]; return (k in t)?t[k]:0; }}); VPX.set(v,p); } return p; }
function evalx(e){ try{ var v=S.vars; return Function('v','with(v){return ('+e+')}')(vproxy(v));}catch(err){console.warn('expr',e,err);return false} }
/* v=306 好感💛：viv／qing／lin 有變化時，右上角淡淡浮一下（不擋操作，可在設定關掉） */
var HEARTK={viv:'viv',qing:'qing22',lin:'lin'}, heartT=null;
function heartFx(k,d){ if(window.__game) window.__game.hearts.push({k:k,d:d,node:S.node}); if(!SET.hint) return;
  var el=$('#heartFx'); if(!el) return; var nm=S.seen[HEARTK[k]]?nameOf(HEARTK[k]):'';
  el.textContent=(d>0?'💛':'🤍')+(nm?' '+nm:''); el.className=d>0?'up':'dn'; void el.offsetWidth; el.classList.add('on');
  clearTimeout(heartT); heartT=setTimeout(function(){ el.classList.remove('on'); },1600/Math.min(FAST,2)); }
function applyFx(list){ var hb={}; if(S) for(var hk in HEARTK) hb[hk]=+S.vars[hk]||0;
  (list||[]).forEach(function(f){ var v=S.vars, x=isNaN(+f.x)?(f.x.charAt(0)==="'"?f.x.slice(1,-1):evalx(f.x)):+f.x;
  if(f.op==='=') v[f.v]=x; else if(f.op==='+=') v[f.v]=(+v[f.v]||0)+x; else if(f.op==='-=') v[f.v]=(+v[f.v]||0)-x; else v[f.v]=(+v[f.v]||0)*x;
  if(f.v==='coin'||f.v==='cash') v[f.v]=Math.round(v[f.v]*100)/100; });
  if(S) for(var hk2 in HEARTK){ var hd=(+S.vars[hk2]||0)-hb[hk2]; if(hd) heartFx(hk2,hd); }
  hud(); }

/* ---------- 畫面層 ---------- */
var bgs=[$('#bg0'),$('#bg1')], bgi=0, look={x:0,y:0,tx:0,ty:0,fx:0,drag:null,mx:0,my:0};
var stageEl=$('#stage');
// 背景尺寸完全交給 CSS（cover + 12% 視差餘裕），這裡只讀實際大小算可移動範圍
function bgSize(){ var b=bgs[0]; return [b.offsetWidth||innerWidth*1.12, b.offsetHeight||innerHeight*1.12]; }
// 預載＋解碼完成才換圖，避免半張圖
var IMGC={}; function preload(n){ if(!n) return Promise.resolve(); if(IMGC[n]) return IMGC[n]; var im=new Image();
  IMGC[n]=new Promise(function(r){ im.onload=function(){ (im.decode?im.decode().catch(function(){}):Promise.resolve()).then(function(){r(true)}); }; im.onerror=function(){ if(!im._retry){ im._retry=1; setTimeout(function(){ var i2=new Image(); i2._retry=1; i2.onload=im.onload; i2.onerror=im.onerror; im=i2; IMGC[n].img=i2; i2.src='img/'+n+'.webp'; },600); return; } console.error('img missing',n); r(false); }; }); /* 整合（助理 11/01）💛：載入失敗（例如 CDN 503）先重試一次 */
  im.src='img/'+n+'.webp'; IMGC[n].img=im; return IMGC[n]; }
function ready(n,ms){ return Promise.race([preload(n), new Promise(function(r){setTimeout(r,ms||4000)})]); }
// 進入節點時，先預載這個節點和它可能跳去的節點裡的所有背景
var NBG={}; function nodeBgs(n){ if(NBG[n]) return NBG[n]; var out=[]; (N[n]||[]).forEach(function(op){ if(op.k==='scene'&&op.a.bg) out.push(op.a.bg); }); return NBG[n]=out; }
function nodeNext(n){ var out=[]; (N[n]||[]).forEach(function(op){ if(op.k==='go') out.push(op.s); else if(op.k==='if'){ var m=op.s.match(/->\s*(\S+)$/); if(m) out.push(m[1]); } else if(op.k==='choice') op.opts.forEach(function(o){ if(o.go) out.push(o.go); }); });
  var k=ORDER.indexOf(n); if(k>=0&&k+1<ORDER.length) out.push(ORDER[k+1]); return out; }
function prefetch(n){ nodeBgs(n).forEach(preload); nodeNext(n).forEach(function(m){ nodeBgs(m).slice(0,2).forEach(preload); }); }
var tFrame=performance.now(), fps=60, fpsEl=null;
function frame(t){ var dt=Math.min(.1,(t-tFrame)/1000); tFrame=t; fps=fps*.95+(1/Math.max(dt,.001))*.05;
  var z=bgSize(), rx=Math.max(0,(z[0]-stageEl.clientWidth)/2-1), ry=Math.max(0,(z[1]-stageEl.clientHeight)/2-1);
  if(!look.drag){ look.tx+=( look.fx - look.tx)*Math.min(1,dt*.35); look.ty+=(0-look.ty)*Math.min(1,dt*.5); }
  var drift=Math.sin(t/5200)*.06, drifty=Math.cos(t/6900)*.05;
  look.x+=(look.tx+look.mx*.18+drift-look.x)*Math.min(1,dt*4); look.y+=(look.ty+look.my*.15+drifty-look.y)*Math.min(1,dt*4);
  var X=Math.max(-1,Math.min(1,look.x)), Y=Math.max(-1,Math.min(1,look.y));
  var tr='translate(calc(-50% + '+(-X*rx).toFixed(1)+'px),calc(-50% + '+(-Y*ry).toFixed(1)+'px))';
  bgs[0].style.transform=tr; bgs[1].style.transform=tr;
  if(fpsEl) fpsEl.textContent=fps.toFixed(0)+' fps';
  requestAnimationFrame(frame); }
requestAnimationFrame(frame);
if(Q.has('fps')){ fpsEl=document.createElement('div'); fpsEl.style.cssText='position:fixed;left:8px;bottom:6px;z-index:99;font:12px monospace;color:#0f0;text-shadow:0 0 2px #000'; document.body.appendChild(fpsEl); }
// 拖曳看四周 / 點擊前進
var down=null;
stageEl.addEventListener('pointerdown',function(e){ AU.wake(); down={x:e.clientX,y:e.clientY,lx:look.tx,ly:look.ty,t:Date.now(),moved:false}; look.drag=down; });
addEventListener('pointermove',function(e){
  if(e.pointerType==='mouse'&&!down){ look.mx=(e.clientX/innerWidth-.5)*2; look.my=(e.clientY/innerHeight-.5)*2; }
  if(!down) return; var dx=e.clientX-down.x, dy=e.clientY-down.y; if(Math.abs(dx)+Math.abs(dy)>12) down.moved=true;
  if(down.moved){ var z=bgSize(), rx=Math.max(40,(z[0]-innerWidth)/2), ry=Math.max(30,(z[1]-innerHeight)/2);
    look.tx=Math.max(-1,Math.min(1,down.lx-dx/rx)); look.ty=Math.max(-1,Math.min(1,down.ly-dy/ry)); } });
addEventListener('pointerup',function(e){ var d=down; down=null; look.drag=null; if(!d||d.moved) return;
  if(e.target.closest('button,input,label,#phone,#note,.screen,#choice,#rhythm,#queue')) return; onTap(); });
addEventListener('pointercancel',function(){ down=null; look.drag=null; });
addEventListener('keydown',function(e){
  if(!$('#choice').classList.contains('hide')&&/^[1-4]$/.test(e.key)){ var b=document.querySelectorAll('#opts button')[+e.key-1]; if(b) b.click(); return; }
  if(e.key===' '||e.key==='Enter'){ if(!$('#rhythm').classList.contains('hide')){ e.preventDefault(); RH.key&&RH.key(); return; }
    if(QG.on){ e.preventDefault(); QG.key&&QG.key(); return; }
    if(!document.activeElement||document.activeElement.tagName!=='BUTTON'){e.preventDefault();onTap();} }
  if(e.key==='Escape'){ if(!$('#menu').classList.contains('hide')) closeMenu(); else if(S&&!S.ended&&$('#title').classList.contains('hide')&&$('#rhythm').classList.contains('hide')&&!QG.on) openMenu(); } });
// 顆粒
(function(){ var c=$('#grain'), x=c.getContext('2d'); var GW=160, GH=90; c.width=GW; c.height=GH; var img=x.createImageData(GW,GH);
  setInterval(function(){ if(document.hidden) return; for(var i=0;i<img.data.length;i+=4){var g=Math.random()*255|0; img.data[i]=img.data[i+1]=img.data[i+2]=g; img.data[i+3]=255;} x.putImageData(img,0,0); },90); })();
var TINT={warm:'rgba(255,170,90,.35)',dusk:'rgba(255,120,60,.4)',cold:'rgba(70,120,200,.4)',night:'rgba(30,50,120,.55)',red:'rgba(220,40,30,.45)',gold:'rgba(255,200,90,.35)',grey:'rgba(120,120,120,.45)',none:'rgba(0,0,0,0)'};
function showBg(name,fx){ var nb=bgs[1-bgi], ob=bgs[bgi]; nb.style.backgroundImage='url(img/'+name+'.webp)'; nb.classList.add('on'); ob.classList.remove('on'); bgi=1-bgi;
  look.fx=(fx!=null?+fx:(FOCUS[name]||0)); look.tx=look.fx; }
function setScene(a){ var sc=S.scene; var ch=false;
  if(a.bg&&a.bg!==sc.bg){ ch=true; sc.bg=a.bg; showBg(a.bg,a.fx); }
  if(a.time!=null){ sc.time=a.time; $('#clock').textContent=a.time; }
  if(a.tint){ sc.tint=a.tint; $('#tint').style.background=TINT[a.tint]||a.tint; }
  if(a.bgm){ sc.bgm=a.bgm; AU.music(a.bgm); }
  if(a.amb){ sc.amb=a.amb; AU.amb(a.amb); }
  return ch; }
function hud(){ if(!S) return; var v=S.vars, m=S.hud, t='';
  if(m==='shop') t='🔥 '+(v.fame||0)+'　💰 '+fmt(v.cash)+' 萬';
  else if(m==='coin') t='🔥 '+(v.fame||0)+'　💰 '+fmt(v.cash)+' 萬　₿ '+fmt(v.coin);
  var el=$('#money'); if(el.textContent!==t){ el.textContent=t; el.classList.add('flash'); setTimeout(function(){el.classList.remove('flash')},350);} }
function fmt(n){ n=+n||0; if(n<0) return '-'+fmt(-n); return n>=100?Math.round(n).toLocaleString():(Math.round(n*100)/100).toString(); }
function chipStyle(el,spk,emo,size){ var c=CAST[spk]; if(!c||!c.sheet){ el.style.backgroundImage='none'; el.style.display='none'; return; }
  el.style.display='inline-block'; var q={n:[0,0],s:[1,0],u:[0,1],x:[1,1]}[emo||'n']||[0,0], Z=2.9;
  var fx=q[0]*.5+.25, fy=q[1]*.5+(c.fy||.19);
  el.style.backgroundImage='url(img/'+c.sheet+'.webp)'; el.style.backgroundSize=(Z*100)+'%';
  el.style.backgroundPosition=((.5-fx*Z)*size).toFixed(1)+'px '+((.5-fy*Z)*size).toFixed(1)+'px'; }
function nameOf(spk){ var c=CAST[spk]; if(!c) return ''; return (S.camp==='A'?c.nA:c.nB)||c.n; }

/* ---------- 暫停／等待點擊 ---------- */
var tapWait=null, lastTap=0, lineShown=0, PAUSED=false;
function onTap(){ var now=performance.now(); if(PAUSED||now-lastTap<260||now-lineShown<300) return; lastTap=now; if(tapWait){ var f=tapWait; tapWait=null; f(); } }
// 會被選單暫停的計時
function psleep(ms){ return new Promise(function(r){ var left=ms/FAST, last=performance.now(); (function tick(){ var now=performance.now(); if(!PAUSED) left-=now-last; last=now; if(left<=0) r(); else setTimeout(tick,Math.min(100,left)); })(); }); }
function waitTapOr(ms){ return new Promise(function(res){ var done=false; function fin(){ if(done)return; done=true; if(tapWait===fin) tapWait=null; res(); }
  tapWait=fin; if(ms!=null) psleep(ms).then(fin); }); }
// 回到標題時要取消的東西（計時器、等待中的 UI）
var CANCEL=[]; function onCancel(f){ CANCEL.push(f); return function(){ var i=CANCEL.indexOf(f); if(i>=0) CANCEL.splice(i,1); }; }
function cancelAll(){ var l=CANCEL.splice(0); l.forEach(function(f){ try{f()}catch(e){} }); }

/* ---------- 台詞 ---------- */
var introTimer=null;
async function say(op){
  var sub=$('#sub'), txt=$('#txt'), who=$('#whoName'), chip=$('#chip'), my=running;
  sub.classList.remove('hide'); sub.classList.toggle('nosub',!SET.sub);
  var spk=op.spk, isSelf=(op.think)||(S.camp==='B'&&/^me/.test(spk))||(S.camp==='A'&&/^ag/.test(spk));
  if(op.think||!spk){ who.textContent=''; chip.style.display='none'; }
  else { who.textContent=nameOf(spk); chipStyle(chip,spk,op.emo,34); }
  txt.className=op.think?'think':''; txt.textContent=op.think?'（'+op.text+'）':op.text;
  void txt.offsetWidth; txt.classList.add('on'); lineShown=performance.now();
  if(spk&&!op.think&&!isSelf&&CAST[spk]&&!CAST[spk].ni&&!S.seen[spk]){ S.seen[spk]=1; showIntro(spk); }
  var key=op.vp+'|'+op.emo+'|'+op.text, vd=VOICE[key], len=op.text.length;
  var base=Math.max(900,400+len*110);   // 整合（助理 11/01）節奏：無語音時依字數停留，下限 0.9 秒（原 900+150/字、下限 1.5 秒）
  window.__game.lines.push({key:key,t:performance.now(),has:!!vd});
  if(skipping()){ await psleep(120); }
  else if((!AUTO||AUTOVOICE)&&vd&&SET.voice>0){
    var r=await Promise.race([AU.voice(vd), waitTapOr(null).then(function(){return 'tap'})]);
    if(my!==running) return;
    window.__game.lines[window.__game.lines.length-1].r=r;
    if(r==='tap') AU.stopVoice();
    else if(r==='fail'){ await waitTapOr(SET.auto||AUTO?Math.max(900,base,vd[1]*1000+300):null); }
    else { await waitTapOr(SET.auto||AUTO?300:null); }   // 語音真的播完（ended）之後再停 0.3 秒（整合（助理 11/01）原 0.7 秒）
  } else { await waitTapOr(SET.auto||AUTO?base:null); }
  if(my!==running) return;
  tapWait=null; txt.classList.remove('on'); await sleep(100);
}
function showIntro(spk){ var c=CAST[spk], el=$('#intro'); clearTimeout(introTimer); el.classList.remove('hide','out');
  chipStyle($('#introFace'),spk,'n',Math.min(innerHeight*.22,120)); $('#introName').textContent=nameOf(spk); $('#introDesc').textContent=(S.camp==='A'?c.dA:c.dB)||c.d||'';
  introTimer=setTimeout(function(){ el.classList.add('out'); introTimer=setTimeout(function(){el.classList.add('hide')},800); },3200/FAST); }

/* ---------- 演出指令 ---------- */
async function blink(swap){ var st=stageEl, q=skipping()?.4:1; AU.sfx('blink'); st.classList.add('closed'); await sleep(480*q); if(swap) swap(); await sleep((swap?420:200)*q); st.classList.remove('closed'); await sleep(350*q); } // 整合（助理 11/01）原 650/600/500
async function card(s){ var p=s.split('|'); S.chap=(p[0]||'')+(p[1]?'　'+p[1]:''); $('#cardA').textContent=p[0]||''; $('#cardB').textContent=p[1]||''; var c=$('#card'); c.classList.remove('hide'); AU.sfx('page');
  $('#sub').classList.add('hide'); lineShown=performance.now(); await waitTapOr(skipping()?250:2400); c.classList.add('hide'); }
async function phone(s){ var p=s.split('|').map(function(x){return x.trim()}); $('#phTitle').textContent=p.shift(); var b=$('#phBody'); b.innerHTML='';
  p.forEach(function(r){ var d=document.createElement('div');
    if(r.charAt(0)==='#'){ d.className='big '+(/▼|-/.test(r)?'dn':'up'); d.textContent=r.slice(1); }
    else if(/^>/.test(r)){ d.className='msg me'; d.textContent=r.slice(1); }
    else if(/^[^：:]{1,8}[：:]/.test(r)&&!/[▲▼]/.test(r)){ var i=r.search(/[：:]/); d.className='msg'; d.innerHTML='<b></b><span></span>'; d.firstChild.textContent=r.slice(0,i); d.lastChild.textContent=r.slice(i+1); }
    else if(/[▲▼]/.test(r)){ var cols=r.split(/\s{2,}|\t/); d.className='row '+(/▼/.test(r)?'dn':'up'); cols.forEach(function(c){var s=document.createElement('span');s.textContent=c;d.appendChild(s)}); }
    else { d.className='txt'; d.textContent=r; }
    b.appendChild(d); });
  b.scrollTop=0; $('#sub').classList.add('hide'); $('#phone').classList.remove('hide'); AU.sfx('buzz');
  await new Promise(function(res){ var btn=$('#phDown'), t0=performance.now(), un; function c(){ if(performance.now()-t0<350&&!AUTO) return; btn.removeEventListener('click',c); un(); res(); } un=onCancel(function(){ btn.removeEventListener('click',c); res(); }); btn.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); else if(skipping()) setTimeout(function(){ t0=-1e9; c(); },450); });
  $('#phone').classList.add('hide'); AU.sfx('whoosh'); }
async function note(s){ $('#noteTxt').textContent=s.replace(/\\n/g,'\n'); var n=$('#note'); n.classList.remove('hide'); AU.sfx('page'); $('#sub').classList.add('hide');
  await new Promise(function(res){ var t0=performance.now(), un; function c(){ if(performance.now()-t0<350&&!AUTO) return; n.removeEventListener('click',c); un(); res(); } un=onCancel(function(){ n.removeEventListener('click',c); res(); }); n.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); else if(skipping()) setTimeout(function(){ t0=-1e9; c(); },450); });
  n.classList.add('hide'); }

/* ---------- 節奏挑戰：外圈縮到內圈時點擊，±150ms 才算準 ---------- */
var RH={key:null,restart:false};
async function rhythm(s){ var m=s.match(/^(\d+)\s*(.*)$/), n=+(m?m[1]:6), label=m?m[2]:s;
  var iv=S.replay?650:800, W=S.replay?110:150;
  var need=0, nx=N[S.node][S.idx]; if(nx&&nx.k==='if'){ var mm=nx.s.match(/rh\s*>=\s*(\d+)/); if(mm) need=+mm[1]; }
  var el=$('#rhythm'), core=$('#rcore'), sh=$('#rshrink'), fb=$('#rfb'), sc=$('#rscore'), dots=$('#rdots');
  $('#rlabel').textContent=label; $('#rhelp').textContent='外圈縮到和內圈重疊的瞬間點一下（或按空白鍵）'+(need?'　目標 ≥ '+need+' 拍':'');
  dots.innerHTML=''; for(var i=0;i<n;i++) dots.appendChild(document.createElement('i'));
  $('#sub').classList.add('hide'); $('#menuBtn').classList.add('hide'); $('#intro').classList.add('hide'); el.classList.remove('hide'); fb.textContent=''; fb.className='';
  var t0, judged, hits, extra, done=false, rest=0;
  function reset(){ t0=performance.now()+2400; judged=[]; for(var i=0;i<n;i++) judged.push(0); hits=0; extra=0; Array.prototype.forEach.call(dots.children,function(d){d.className=''}); upd();
    for(var k=0;k<n;k++) AU.sfx('beat',(t0+k*iv-performance.now())/1000); }
  function flash(t,cls){ fb.textContent=t; fb.className=cls; void fb.offsetWidth; fb.className=cls+' pop'; }
  function mark(k,v){ judged[k]=v; dots.children[k].className=v>0?'h':'m'; }
  function upd(){ sc.textContent='命中 '+hits+' / '+n+(extra?'　多按 '+extra+'（扣分）':''); }
  function tap(){ if(done) return; var now=performance.now(); if(now<t0-iv*.6){ flash('還沒開始','bad'); return; }
    var k=Math.max(0,Math.min(n-1,Math.round((now-t0)/iv))), dt=now-(t0+k*iv);
    if(judged[k]===0&&Math.abs(dt)<=W){ mark(k,1); hits++; flash(Math.abs(dt)<=W*.45?'完美！':'準！','ok'); core.className='hit'; AU.sfx('hit'); }
    else if(judged[k]===0&&Math.abs(dt)<iv/2){ mark(k,-1); flash(dt<0?'太早':'太晚','bad'); core.className='miss'; AU.sfx('miss'); }
    else { extra++; flash('多按了','bad'); core.className='miss'; AU.sfx('miss'); }
    setTimeout(function(){core.className=''},150); upd(); window.__game.rh.push({k:k,dt:Math.round(dt)}); }
  el.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); tap(); }; RH.key=tap; RH.restart=false;
  reset();
  var autoHits=AUTO?Math.min(n,+(Q.get('rh')||n-1)):0, autoTimers=[];
  if(AUTO) for(var a=0;a<n;a++){ (function(a){ autoTimers.push(setTimeout(function(){ if(a<autoHits) tap(); else if(a===autoHits&&Q.has('rhspam')){ tap(); tap(); } },t0+a*iv+(a<autoHits?20:-260)-performance.now())); })(a); }
  await new Promise(function(res){ var un=onCancel(function(){ done=true; res(); });
    (function loop(){ if(done) return; var now=performance.now();
      if(RH.restart){ RH.restart=false; reset(); flash('重新開始','bad'); }
      var cd=t0-iv-now; $('#rcount').textContent=cd>0?Math.ceil(cd/(1600/3)):''; 
      for(var k=0;k<n;k++) if(judged[k]===0&&now>t0+k*iv+W){ mark(k,-1); flash('漏拍','bad'); }
      var kk=-1; for(var j=0;j<n;j++){ if(judged[j]===0){ kk=j; break; } }
      if(kk>=0){ var p=(now-(t0+(kk-1)*iv))/iv; p=Math.max(0,Math.min(1,p)); sh.style.opacity=p>0?1:0; sh.style.transform='scale('+(0.4545+(2.4-0.4545)*(1-p)).toFixed(3)+')'; }
      else sh.style.opacity=0;
      if(now>t0+(n-1)*iv+W+250){ done=true; un(); res(); return; }
      requestAnimationFrame(loop); })(); });
  autoTimers.forEach(clearTimeout);
  var rh=Math.max(0,hits-extra);
  if($('#title').classList.contains('hide')){
    sc.textContent='命中 '+hits+' / '+n+(extra?'　多按 '+extra:'')+'　→ '+rh+' 拍';
    flash(need?(rh>=need?'成功！':'失敗……'):(rh>=n-1?'漂亮！':'好'),need&&rh<need?'bad big':'ok big');
    await psleep(1100); }
  el.onpointerdown=null; RH.key=null; el.classList.add('hide'); $('#menuBtn').classList.remove('hide');
  S.vars.rh=rh; S.stats.rhythm+=n; S.stats.rhyHit+=rh; }


/* ---------- 排隊帶位：12 個座位、門外的隊伍；有空位按「帶位」，吃完的座位點一下收桌 ---------- */
var QG={on:false};
async function queue(s){
  var m=s.split('|'), kvs=kv(m[0]), label=(m[1]||'帶位').trim();
  var T=+(evalx(kvs.t||'45'))||45, pat=+(evalx(kvs.pat||'1'))||1, help=+(evalx(kvs.help||'0'))||0;
  if(S.replay) pat*=.85; pat*=(+S.vars.tadapt||1);
  var need=0; for(var j=S.idx;j<Math.min(S.idx+3,N[S.node].length);j++){ var nx=N[S.node][j]; if(nx&&nx.k==='if'){ var mm=nx.s.match(/qs\s*>=\s*(\d+)/); if(mm){ need=+mm[1]; break; } } }
  var R=SEED?mkrng(SEED*31+S.idx):Math.random;
  var el=$('#queue'), grid=$('#qseats'), line=$('#qline'), btn=$('#qseat'), fb=$('#qfb');
  $('#qlabel').textContent=label; $('#qhelp').textContent='有空位就按「帶位」；碗空了（🥣）點那個座位收桌。等太久的人會走。'+(need?'　目標：帶位 ≥ '+need+' 人':'');
  var seats=[], lineQ=[], qs=0, ql=0, clock=0, nextSpawn=0, done=false, auto=0, uid=0, t0=performance.now()+1800;
  grid.innerHTML=''; for(var i=0;i<12;i++){ var d=document.createElement('button'); d.className='qs e'; d.innerHTML='<i></i><b>'+(i+1)+'</b><span>空位</span>'; (function(i){ d.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); clearSeat(i,false); }; })(i); grid.appendChild(d); seats.push({st:0,t:0,T:1}); }
  function mk(){ var P=(9+R()*4)*pat; return {id:++uid,p:P,P:P}; }
  for(var k=0;k<6;k++) lineQ.push(mk());
  function flash(t,c){ fb.textContent=t; fb.className=c; void fb.offsetWidth; fb.className=c+' pop'; }
  function clearSeat(i,byHelp){ if(done||seats[i].st!==2) return; seats[i].st=0; if(!byHelp){ AU.sfx('hit'); } draw(); }
  function seat(){ if(done) return; if(performance.now()<t0){ flash('還沒開門','bad'); return; } if(!lineQ.length){ flash('外面暫時沒人','bad'); return; }
    var i=-1; for(var k=0;k<12;k++) if(seats[k].st===0){ i=k; break; }
    if(i<0){ flash(seats.some(function(x){return x.st===2})?'先收桌！':'客滿','bad'); AU.sfx('miss'); return; }
    lineQ.shift(); var E=9+R()*5; seats[i]={st:1,t:E,T:E}; qs++; AU.sfx('select'); draw(); }
  btn.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); seat(); };
  QG.key=seat; QG.on=true;
  function draw(){ for(var i=0;i<12;i++){ var c=grid.children[i], st=seats[i]; c.className='qs '+['e','f','d'][st.st]; c.lastChild.textContent=['空位','🍜','🥣 收'][st.st];
      c.firstChild.style.width=st.st===1?(100*(1-st.t/st.T)).toFixed(0)+'%':'0'; }
    var h=''; var show=Math.min(lineQ.length,10); for(var k=0;k<show;k++){ var q=lineQ[k], r=q.p/q.P; h+='<i class="'+(r<.3?'r':r<.6?'y':'g')+'"><u style="height:'+(r*100).toFixed(0)+'%"></u></i>'; }
    if(lineQ.length>show) h+='<em>+'+(lineQ.length-show)+'</em>'; if(!lineQ.length) h='<em>（門外沒有人）</em>'; line.innerHTML=h;
    var left=Math.max(0,T-clock); $('#qtime').textContent=performance.now()<t0?'準備開門…':'剩 '+Math.ceil(left)+' 秒'; $('#qscore').textContent='帶位 '+qs+'　流失 '+ql+(need?'　（目標 '+need+'）':''); }
  $('#sub').classList.add('hide'); $('#menuBtn').classList.add('hide'); $('#intro').classList.add('hide'); el.classList.remove('hide'); fb.textContent=''; fb.className=''; draw();
  var qskill=+(Q.get('qskill')||.9);
  await new Promise(function(res){ var un=onCancel(function(){ done=true; res(); }), last=performance.now();
    (function loop(){ if(done) return; var now=performance.now(), dt=Math.min(.25,(now-last)/1000)*FAST; last=now;
      if(!PAUSED&&now>=t0){ clock+=dt;
        seats.forEach(function(st,i){ if(st.st===1){ st.t-=dt; if(st.t<=0){ st.st=2; st.t=0; st.h=1.5; } } else if(st.st===2&&help){ st.h-=dt; if(st.h<=0) clearSeat(i,true); } });
        lineQ.forEach(function(q,k){ if(k<8) q.p-=dt; }); var before=lineQ.length; lineQ=lineQ.filter(function(q){ return q.p>0; }); if(lineQ.length<before){ ql+=before-lineQ.length; flash('有客人等不及走了','bad'); }
        nextSpawn-=dt; if(nextSpawn<=0){ lineQ.push(mk()); nextSpawn=1.1+R()*.7; }
        if(AUTO){ auto-=dt; if(auto<=0){ auto=.45; if(R()<qskill){ var di=seats.findIndex(function(x){return x.st===2}); if(di>=0) clearSeat(di,false); else if(lineQ.length&&seats.some(function(x){return x.st===0})) seat(); } } }
        draw(); if(clock>=T){ done=true; un(); res(); return; } }
      else if(now<t0) draw();
      requestAnimationFrame(loop); })(); });
  QG.on=false; QG.key=null; btn.onpointerdown=null;
  if($('#title').classList.contains('hide')&&S){
    flash(need?(qs>=need?'成功！帶位 '+qs+' 人':'帶位 '+qs+' 人……'):'帶位 '+qs+' 人',need&&qs<need?'bad big':'ok big'); AU.sfx(need&&qs<need?'buzz':'coin'); await psleep(1200); }
  el.classList.add('hide'); $('#menuBtn').classList.remove('hide');
  if(S){ S.vars.qs=qs; S.vars.ql=ql; S.stats.qs+=qs; S.stats.ql+=ql; window.__game.q.push({qs:qs,ql:ql,need:need}); } }


/* ---------- 第三章：談判出價（! bid lo= hi= fair= side=buy|sell unit=萬 who=房東 | 標題）→ bid 0 破局 / 1 吃虧 / 2 合理 / 3 漂亮；bidv 成交價 ---------- */
function mgOpen(label,help){ var el=$('#mg'); $('#mgLabel').textContent=label; $('#mgHelp').textContent=help; $('#mgFb').textContent=''; $('#mgFb').className='';
  $('#sub').classList.add('hide'); $('#menuBtn').classList.add('hide'); $('#intro').classList.add('hide'); el.classList.remove('hide'); QG.on=true; QG.key=null; return el; }
function mgClose(){ $('#mg').classList.add('hide'); $('#mgBody').innerHTML=''; $('#menuBtn').classList.remove('hide'); QG.on=false; QG.key=null; }
function mgFlash(t,c){ var fb=$('#mgFb'); fb.textContent=t; fb.className=c; void fb.offsetWidth; fb.className=c+' pop'; }
function mgWait(T,onTick){ return new Promise(function(res){ var done=false, left=T, last=performance.now(), un=onCancel(function(){ fin(null); });
  function fin(v){ if(done) return; done=true; un(); res(v); }
  (function tick(){ if(done) return; var now=performance.now(), dt=(now-last)/1000*FAST; last=now; if(!PAUSED) left-=dt; var r=onTick(Math.max(0,left),T,fin); if(left<=0&&!done) fin(r===undefined?'timeout':r); else setTimeout(tick,50); })(); }); }
async function bid(s){
  var m=s.split('|'), a=kv(m[0]), label=(m[1]||'談判').trim();
  var lo=+evalx(a.lo||'0'), hi=+evalx(a.hi||'100'), fair=+evalx(a.fair||String((lo+hi)/2)), sell=a.side==='sell', unit=a.unit||'萬', who=a.who||'對方';
  var R=SEED?mkrng(SEED*37+S.idx):Math.random, limit=fair*(0.92+R()*0.16), step=Math.max(1,Math.round((hi-lo)/100));
  mgOpen(label,(sell?'你是賣方：開價越高越好，但太貪心'+who+'會走。':'你是買方：出價越低越好，但太低'+who+'會走。')+'三次機會，每次限時。');
  var body=$('#mgBody'); body.innerHTML='<div id="bidOpp"></div><div id="bidVal"></div><input id="bidR" type="range"><div class="bidRow"><span>'+lo+unit+'</span><span>'+hi+unit+'</span></div><div class="mgTime"><i></i></div><button id="bidGo" class="mgBtn">出價 ▸</button>';
  var rg=$('#bidR'), val=$('#bidVal'), opp=$('#bidOpp'), bar=body.querySelector('.mgTime i'); rg.min=lo; rg.max=hi; rg.step=step; rg.value=Math.round(sell?hi*0.9+lo*0.1:lo*0.9+hi*0.1);
  function show(){ val.textContent=rg.value+' '+unit; } rg.oninput=show; show();
  var anchor=sell?lo+(fair-lo)*0.5:hi-(hi-fair)*0.5; opp.textContent=who+'：「你先開個價吧。」';
  var deal=null, res=0, qskill=+(Q.get('qskill')||.9), counter=fair;
  for(var round=1;round<=3&&deal===null;round++){
    var T=Math.max(5,12*(+S.vars.tadapt||1)*(S.replay?.8:1)), pressed=false;
    $('#bidGo').onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); pressed=true; }; QG.key=function(){ pressed=true; };
    var good=R()<qskill, autoAt=T*(0.4+R()*0.3), autoV=round===1?fair*(sell?1.1:0.9):(good?(round===2?(+rg.value+counter)/2:counter*(sell?1.01:0.99)):+rg.value*(sell?1.02:0.98));
    await mgWait(T,function(left,TT,fin){ bar.style.width=(100*left/TT)+'%'; if(AUTO&&TT-left>=autoAt){ rg.value=Math.round(autoV); show(); pressed=true; } if(pressed) fin('go'); });
    var v=+rg.value, r=sell?v/limit:limit/v; AU.sfx('select');
    if(r<=1){ deal=v; break; }
    if(r>1.3||(round===3&&r>1.0)){ opp.textContent=who+'：「這樣談不下去。」'; if(round===3||r>1.3){ deal=-1; break; } }
    anchor=sell?Math.max(anchor,(v+anchor)/2):Math.min(anchor,(v+anchor)/2);
    counter=Math.round(sell?limit*(1-0.04*(3-round)):limit*(1+0.04*(3-round)));
    opp.textContent=who+'：「'+(round<3?counter+unit+'，不然免談。」':'最後一次。」'); mgFlash('第 '+round+' 回合：對方不接受','bad');
  }
  if(deal===null) deal=-1;
  if(deal<0){ res=0; mgFlash('破局','bad big'); AU.sfx('buzz'); }
  else { var g=sell?deal/limit:limit/deal; res=g>=0.97?3:g>=0.87?2:1; mgFlash(['','成交（有點吃虧）','成交（合理）','成交（漂亮！）'][res]+'　'+deal+unit,res>=2?'ok big':'bad big'); AU.sfx(res>=2?'coin':'miss'); }
  await psleep(1200); mgClose();
  S.vars.bid=res; S.vars.bidv=deal<0?0:deal; window.__game.bid=(window.__game.bid||[]).concat([{bid:res,v:deal,limit:Math.round(limit)}]); }

/* ---------- 第三章：直播留言即時回應（! live n=6 t=5 | 標題）→ cm 好回應數 ---------- */
var LIVEPOOL=[
 ['阿葛，比特幣會漲嗎？','我只會看湯，不會看幣。','明天一定漲，衝！','私訊我，帶你上車。'],
 ['你是不是紅了就變了？','有沒有變，來喝一碗就知道。','關你什麼事。','對啊，我現在是名人。'],
 ['湯這麼貴，是在割韭菜嗎？','價錢都貼在門口，食材也是。','嫌貴不要來。','你吃不起就閉嘴。'],
 ['可以示範一下「算時間」嗎？','我算的是湯，不是表演。','好啊，你再三秒就會刷禮物。','先刷一百個火箭。'],
 ['我排了三小時沒吃到，退錢！','對不起，明天報你的名字，我留一碗。','誰叫你來那麼晚。','（封鎖）'],
 ['阿奔說你很難搞。','他排到了，也吃到了。我們都很好。','他才難搞。','阿奔是個騙子。'],
 ['有沒有業配？老實說。','有，影片下面都寫了。','沒有啦。','你猜。'],
 ['我媽也想吃，可是她走不動。','留地址給店裡，我們週一送過去。','叫她排隊。','不好意思，沒辦法。'],
 ['你國中是不是被霸凌？','那是以前的事。今天我只想聊湯。','你很好奇喔？','是又怎樣。'],
 ['分店的湯跟本店一樣嗎？','不一樣。所以我每週都去試。','一模一樣啦。','差不多就好。'],
 ['你會不會累？','會。累的時候，我就少賣一點。','不會，我是鐵人。','累也要賺啊。'],
 ['能不能教我煮這鍋湯？','第一步：起床，十二點開火。','花錢上我的課。','秘密，不能說。']];
async function live(s){
  var m=s.split('|'), a=kv(m[0]), label=(m[1]||'直播').trim(), n=Math.min(LIVEPOOL.length,+evalx(a.n||'6')||6), t=+evalx(a.t||'6')||6;
  var R=SEED?mkrng(SEED*41+S.idx):Math.random, pool=LIVEPOOL.slice().sort(function(){return R()-.5}).slice(0,n), cm=0, bad=0, qskill=+(Q.get('qskill')||.9);
  mgOpen(label,'留言一則一則跳出來。在時間內點一個回覆；好的回覆會讓聊天室安靜下來。');
  var body=$('#mgBody'); body.innerHTML='<div id="lvTop"><span class="lvDot">● LIVE</span><span id="lvView"></span><span id="lvScore"></span></div><div id="lvMsg"></div><div class="mgTime"><i></i></div><div id="lvOpts"></div>';
  var view=12000+Math.round(R()*8000), bar=body.querySelector('.mgTime i');
  for(var i=0;i<n;i++){
    var c=pool[i], ord=[1,2,3].sort(function(){return R()-.5}), pick=null; $('#lvView').textContent='👀 '+view.toLocaleString(); $('#lvScore').textContent='好回應 '+cm+' / '+n;
    $('#lvMsg').textContent='💬 '+c[0]; var box=$('#lvOpts'); box.innerHTML='';
    ord.forEach(function(k,j){ var b=document.createElement('button'); b.className='mgBtn lv'; b.textContent=(j+1)+'. '+c[k]; b.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); pick=k; }; box.appendChild(b); });
    QG.key=function(){ pick=ord[0]; };
    var T=Math.max(3,t*(+S.vars.tadapt||1)*(S.replay?.8:1)), autoAt=T*(0.3+R()*0.4), autoPick=R()<qskill?1:ord[(R()*3)|0];
    await mgWait(T,function(left,TT,fin){ bar.style.width=(100*left/TT)+'%'; if(AUTO&&TT-left>=autoAt) pick=autoPick; if(pick!==null) fin(pick); });
    if(pick===1){ cm++; view+=1500+Math.round(R()*1500); mgFlash('聊天室：👏','ok'); AU.sfx('coin'); }
    else if(pick===null){ view-=800; mgFlash('沒回到……留言刷過去了','bad'); AU.sfx('miss'); }
    else { bad++; view+=pick===3?4000:500; mgFlash(pick===3?'截圖了……':'有人不太開心','bad'); AU.sfx('buzz'); }
    await psleep(900);
  }
  mgFlash('好回應 '+cm+' / '+n,cm>=Math.ceil(n*.6)?'ok big':'bad big'); await psleep(1200); mgClose();
  S.vars.cm=cm; S.vars.cmbad=bad; window.__game.live=(window.__game.live||[]).concat([{cm:cm,bad:bad,n:n}]); }

/* ---------- 報紙股市版：K 線＋成交量 ---------- */
var CH={el:$('#chart'), cv:$('#chartCv'), d:null, rev:-1, raf:0};
var STOCKS=[['府城紡織','1402'],['安平航運','2611'],['鹽埕食品','1217'],['赤崁電子','2349'],['運河建設','2516'],['四草化工','1712'],['億載鋼鐵','2007'],['孔廟電機','1504']];
function genChart(round,dir,seed){
  var R=mkrng(seed), C=[], NX=[], lines=[], marks=[], p, i, o, c, j;
  function n(a){ return (R()*2-1)*a; }
  function bar(o,c,v,wu,wd){ var h=Math.max(o,c)+(wu!=null?wu:Math.abs(n(.35))+.05), l=Math.min(o,c)-(wd!=null?wd:Math.abs(n(.35))+.05); return {o:o,c:c,h:h,l:l,v:Math.max(.25,v)}; }
  var st=STOCKS[Math.floor(R()*STOCKS.length)], cap='';
  if(round===1){ // 簡單：回到前低（支撐）— 長下影線＋爆量＝守住；長黑＋爆量跌破＝失守
    var Sp=38+Math.round(R()*14); p=Sp+5.5+n(.5);
    for(i=0;i<5;i++){ o=p; c=i===4?Sp+.35:p-(p-Sp)/(5-i)+n(.25); C.push(bar(o,c,1+n(.2),null,i===4?(Math.min(o,c)-Sp+.02):null)); p=c; }
    for(i=0;i<7;i++){ o=p; c=p+.8+n(.45); C.push(bar(o,c,1.05+n(.25))); p=c; }
    for(i=0;i<4;i++){ o=p; c=p+n(.55); C.push(bar(o,c,.9+n(.2))); p=c; }
    var g=p-(Sp+.9); for(i=0;i<3;i++){ o=p; c=p-g/3+n(.12); C.push(bar(o,c,1.05+n(.15))); p=c; }
    if(dir>0){ o=Sp+.55; c=Sp+1.35; C.push({o:o,c:c,h:c+.15,l:Sp-1.15,v:3.0}); }
    else { o=Sp+.6; c=Sp-1.75; C.push({o:o,c:c,h:o+.2,l:c-.25,v:3.0}); }
    p=C[C.length-1].c; for(i=0;i<3;i++){ o=p; c=p+dir*(1+n(.3)); NX.push(bar(o,c,1.4+n(.3))); p=c; }
    lines.push({y:Sp,t:'前低'}); cap='提示：看最後一根的影線，和底下的量';
  } else if(round===2){ // 中等：頂到前高（壓力）— 長上影線＋量縮＝過不去；長紅＋爆量＝突破
    var Rp=52+Math.round(R()*14); p=Rp-5.5+n(.4);
    for(i=0;i<5;i++){ o=p; c=i===4?Rp-.35:p+(Rp-.35-p)/(5-i)+n(.2); C.push(bar(o,c,1.1+n(.2),i===4?(Rp-Math.max(o,c)+.02):null)); p=c; }
    for(i=0;i<8;i++){ o=p; c=p-.68+n(.4); C.push(bar(o,c,.95+n(.2))); p=c; }
    o=p; c=p+n(.2); C.push(bar(o,c,.8+n(.1))); p=c;
    var g2=(Rp-.6)-p;
    for(i=0;i<4;i++){ o=p; c=p+g2/4+n(.12); C.push(bar(o,c,dir>0?1.0+i*.18+n(.08):1.25-i*.14+n(.06))); p=c; }
    if(dir<0){ o=Rp-.75; c=Rp-1.05; C.push({o:o,c:c,h:Rp+.75,l:c-.12,v:.62}); }
    else { o=Rp-.7; c=Rp+1.3; C.push({o:o,c:c,h:c+.12,l:o-.12,v:2.5}); }
    p=C[C.length-1].c; for(i=0;i<3;i++){ o=p; c=p+dir*(.95+n(.3)); NX.push(bar(o,c,dir>0?1.6+n(.3):1.2+n(.2))); p=c; }
    cap='';
  } else { // 困難：區間盤整的四天週期 — 跳一天、退三天
    var B=40+Math.round(R()*12); p=B;
    var jumpAtEnd=dir<0; // 今天剛跳＝明天退；今天是退的第三天＝明天跳
    var first=jumpAtEnd?(19%4):((19-3)%4);
    for(i=0;i<20;i++){ o=p; var J=((i-first)%4===0);
      if(J){ c=p+1.8+n(.25); C.push(bar(o,c,2.0+n(.35),.1+Math.abs(n(.15)))); marks.push(i); }
      else { c=p-.6+n(.18); C.push(bar(o,c,.85+n(.2),.08+Math.abs(n(.12)),.08+Math.abs(n(.12)))); }
      p=c; }
    var seq=dir>0?[1,-1,-1]:[-1,-1,-1];
    seq.forEach(function(s){ o=p; c=s>0?p+1.8+n(.2):p-.6+n(.12); NX.push(bar(o,c,s>0?2.1:.85)); p=c; });
    cap='';
  }
  var lo=Infinity, hi=-Infinity; C.forEach(function(b){ lo=Math.min(lo,b.l); hi=Math.max(hi,b.h); });
  var pad=round===3?Math.max(1.4,(hi-lo)*.3):Math.max(2.2,(hi-lo)*.38); lo-=pad; hi+=pad;
  // 揭曉的K棒也要畫得進去：上下對稱地加寬，不洩漏方向
  var nh=-Infinity, nl=Infinity; NX.forEach(function(b){ nh=Math.max(nh,b.h); nl=Math.min(nl,b.l); });
  var ext=Math.max(0,nh-hi+.4,lo-nl+.4); lo-=ext; hi+=ext;
  var vmax=0; C.concat(NX).forEach(function(b){ vmax=Math.max(vmax,b.v); });
  return {C:C,NX:NX,lo:lo,hi:hi,vmax:vmax,lines:lines,marks:marks,name:st[0],code:st[1],cap:cap,round:round,dir:dir};
}
function drawChart(){ var c=S&&S.chart; if(!c) return; var d=CH.d; if(!d||d.seed!==c.seed){ d=CH.d=genChart(c.round,c.dir,c.seed); d.seed=c.seed; }
  $('#chartName').textContent=d.name+'（'+d.code+'）　日線'; $('#chartCap').textContent=c.mark&&d.marks.length?'▲ = 跳起來的那一天（每四天一次）':d.cap;
  var cv=CH.cv, dpr=Math.min(2.5,window.devicePixelRatio||1), W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return;
  if(cv.width!==Math.round(W*dpr)||cv.height!==Math.round(H*dpr)){ cv.width=Math.round(W*dpr); cv.height=Math.round(H*dpr); }
  var x=cv.getContext('2d'); x.setTransform(dpr,0,0,dpr,0,0); x.clearRect(0,0,W,H);
  var UP='#b8261c', DN='#17734a', INK='#1d1b17';
  var axisW=34, top=6, ph=H*.68, vtop=top+ph+8, vh=H-vtop-14, nS=d.C.length+3+1, cw=(W-axisW-6)/nS;
  function Y(v){ return top+(d.hi-v)/(d.hi-d.lo)*ph; }
  // 格線
  x.strokeStyle='rgba(29,27,23,.14)'; x.lineWidth=1; x.setLineDash([2,3]); x.font='10px "Noto Serif TC","Songti TC",serif'; x.fillStyle='rgba(29,27,23,.7)'; x.textAlign='left';
  var step=d.hi-d.lo>14?4:2, g0=Math.ceil(d.lo/step)*step;
  for(var g=g0; g<d.hi; g+=step){ var yy=Math.round(Y(g))+.5; x.beginPath(); x.moveTo(0,yy); x.lineTo(W-axisW,yy); x.stroke(); x.fillText(g.toFixed(0),W-axisW+4,yy+3); }
  x.setLineDash([]); x.strokeStyle=INK; x.beginPath(); x.moveTo(0,vtop-4+.5); x.lineTo(W-axisW,vtop-4+.5); x.stroke();
  // 支撐／壓力線
  d.lines.forEach(function(l){ var yy=Math.round(Y(l.y))+.5; x.strokeStyle='rgba(29,27,23,.55)'; x.setLineDash([6,4]); x.beginPath(); x.moveTo(0,yy); x.lineTo(W-axisW,yy); x.stroke(); x.setLineDash([]); x.fillStyle=INK; x.fillText(l.t,4,yy-3); });
  function candle(b,i,k){ var cx=(i+.5)*cw, bw=Math.max(2,cw*.62), col=b.c>=b.o?UP:DN, c1=b.o+(b.c-b.o)*k;
    x.strokeStyle=col; x.fillStyle=col; x.lineWidth=Math.max(1,cw*.12);
    var hh=b.o+(b.h-b.o)*Math.min(1,k*1.4), ll=b.o+(b.l-b.o)*Math.min(1,k*1.4);
    x.beginPath(); x.moveTo(cx,Y(hh)); x.lineTo(cx,Y(ll)); x.stroke();
    var y1=Y(Math.max(b.o,c1)), y2=Y(Math.min(b.o,c1)); x.fillRect(cx-bw/2,y1,bw,Math.max(1.2,y2-y1));
    var vv=b.v/d.vmax*vh*k; x.globalAlpha=.75; x.fillRect(cx-bw/2,vtop+vh-vv,bw,vv); x.globalAlpha=1; }
  d.C.forEach(function(b,i){ candle(b,i,1); });
  if(c.mark){ x.fillStyle=INK; x.textAlign='center'; x.font='bold 11px sans-serif'; d.marks.forEach(function(i){ x.fillText('▲',(i+.5)*cw,vtop+8); }); x.textAlign='left'; }
  var sx=(d.C.length+.5)*cw; x.strokeStyle='rgba(29,27,23,.5)'; x.setLineDash([3,3]); x.beginPath(); x.moveTo(sx,top); x.lineTo(sx,vtop+vh); x.stroke(); x.setLineDash([]);
  x.fillStyle=INK; x.font='bold 11px "Noto Sans TC",sans-serif'; x.textAlign='center';
  x.textAlign='right'; x.fillText('今天',sx-3,H-2); x.textAlign='left'; x.fillText('明天→',sx+3,H-2); x.textAlign='center';
  if(CH.rev<0){ var qx=(d.C.length+1.5)*cw, qy=Y(d.C[d.C.length-1].c); x.strokeStyle=INK; x.setLineDash([3,2]); x.strokeRect(qx-cw*.5,qy-18,cw*1.6,36); x.setLineDash([]); x.font='bold 18px serif'; x.fillText('？',qx+cw*.3,qy+6); }
  else { for(var j=0;j<3;j++){ var k=Math.max(0,Math.min(1,CH.rev-j)); if(k>0) candle(d.NX[j],d.C.length+1+j,k); }
    if(CH.rev>=3){ var up=d.NX[0].c>d.NX[0].o, lab=up?'漲 ▲':'跌 ▼'; x.save(); x.translate((d.C.length+2.2)*cw, top+ph*.18); x.rotate(-.12);
      x.font='bold '+Math.round(Math.min(34,W*.07))+'px "Noto Serif TC",serif'; x.fillStyle=up?UP:DN; x.strokeStyle=up?UP:DN; x.lineWidth=2.5; var tw=x.measureText(lab).width;
      x.strokeRect(-tw/2-8,-Math.min(34,W*.07)+2,tw+16,Math.min(34,W*.07)+10); x.fillText(lab,0,6); x.restore(); } }
  x.textAlign='left'; }
function showChart(){ CH.rev=-1; CH.el.classList.remove('hide'); stageEl.classList.add('chartOn'); requestAnimationFrame(drawChart); }
function hideChart(){ CH.el.classList.add('hide'); stageEl.classList.remove('chartOn'); CH.rev=-1; }
addEventListener('resize',function(){ if(!CH.el.classList.contains('hide')) drawChart(); });
async function reveal(){ var c=S.chart; if(!c){ return; } var ok=(+S.vars.guess===c.dir); S.vars.cok=ok?1:0;
  S.vars.cadapt=Math.max(.6,Math.min(1.4,(+S.vars.cadapt||1)*(ok?.85:1.15)));
  $('#sub').classList.add('hide'); CH.el.classList.remove('hide'); stageEl.classList.add('chartOn'); AU.sfx('page');
  var el=0, lt=performance.now(), un, stop=false; un=onCancel(function(){ stop=true; });
  await new Promise(function(res){ (function an(){ if(stop) return res(); var nw=performance.now(); if(!PAUSED) el+=nw-lt; lt=nw; CH.rev=Math.min(3,el/520*FAST); drawChart(); if(CH.rev>=3) return res(); requestAnimationFrame(an); })(); });
  un(); if(stop) return;
  AU.sfx(ok?'coin':'buzz'); lineShown=performance.now(); await waitTapOr(1800);
  hideChart(); S.chart=null; }

/* ---------- 選擇（JS 計時、可暫停、0.35 秒內不收點擊、限時有數字） ---------- */
var CHART_T={1:12,2:9,3:7};
var GOAL=Q.get('goal')||''; function goalPick(opts){ var best=-1e9,bi=[]; opts.forEach(function(o,i){ var sc=0; if(o.go&&new RegExp('_'+GOAL+'$').test(o.go)) sc+=100; (o.fx||[]).forEach(function(f){ if(f.v===GOAL&&f.op==='+=') sc+=+f.x||1; if(f.v===GOAL&&f.op==='-=') sc-=+f.x||1; if(f.v==='greed') sc-=50; }); if(sc>best){best=sc;bi=[i]} else if(sc===best) bi.push(i); }); return bi[Math.floor(rnd()*bi.length)]; }
async function choose(op){
  var opts=op.opts.filter(function(o){return !o.cond||evalx(o.cond)}); if(!opts.length) return null;
  var a=op.a, st=a.t||'calm', T=0, my=running;
  if(st==='chart') T=Math.round((CHART_T[S.chart?S.chart.round:1]||10)*(+S.vars.cadapt||1)*2)/2;
  else if(/^\d/.test(st)) T=+st; else if(st==='high') T=5; else if(st==='mid') T=10; else if(st==='calm') T=S.replay?16:0;
  if(S.replay&&T) T=Math.round(T*0.72*2)/2;
  var adapt=(st!=='chart'&&T)?(+S.vars.tadapt||1):1; if(T) T=Math.max(3,Math.round(T*adapt*2)/2);
  var hot=(st==='high'||(T&&T<=6));
  var def=Math.min(opts.length-1,Math.max(0,(+a.def||opts.length)-1));
  $('#sub').classList.add('hide'); $('#intro').classList.add('hide'); $('#cprompt').textContent=op.prompt||''; var box=$('#opts'); box.innerHTML='';
  var tm=$('#timer'), bar=$('#timer i'), num=$('#timer b'); tm.className=T?(hot?'hot':''):'none'; bar.style.width='100%'; num.textContent=T?Math.ceil(T):'';
  box.className='arm'; $('#choice').classList.remove('hide'); AU.sfx('select');
  if(hot){ $('#pulse').classList.add('on'); stageEl.classList.add('shake'); AU.tense(true); }
  window.__game.choices.push({node:S.node,T:T,prompt:op.prompt});
  var t0=performance.now(), used=0;
  var picked=await new Promise(function(res){ var done=false, armed=false, last=performance.now(), nextBeat=0, un;
    function fin(i,timeout,cancel){ if(done)return; done=true; un(); res({i:i,timeout:timeout,cancel:cancel}); }
    un=onCancel(function(){ fin(a.def?def:0,false,true); }); // 整合（助理 11/01）取消／略過且沒寫 def 時選第一個（原本選最後一個）；倒數逾時仍照 def
    opts.forEach(function(o,i){ var b=document.createElement('button'); b.innerHTML='<span class="k">'+(i+1)+'</span><span class="t"></span>'; b.lastChild.textContent=o.text; var pk=pkKey(op,o); if(PK0[pk]){ b.classList.add('was'); var w=document.createElement('span'); w.className='was'; w.textContent='✓ 選過'; b.appendChild(w); }
      b.onclick=function(e){ e.stopPropagation(); if(!armed||done) return; b.classList.add('pick'); fin(i,false); }; box.appendChild(b); });
    setTimeout(function(){ armed=true; box.className=''; },350);
    (function tick(){ if(done) return; var now=performance.now(), dt=now-last; last=now;
      if(armed&&!PAUSED&&T){ used+=dt*FAST/1000; var left=Math.max(0,T-used); bar.style.width=(left/T*100).toFixed(2)+'%'; num.textContent=Math.ceil(left);
        tm.classList.toggle('urgent',left<=3);
        if(used>=nextBeat){ nextBeat+=hot?.8:1; if(hot) AU.sfx('heart'); else if(left<=4) AU.sfx('tick'); }
        if(left<=0){ fin(def,true); return; } }
      requestAnimationFrame(tick); })();
    if(AUTO&&!(LETTIME&&T)){ var ix=PICK.length?PICK.shift():(GOAL?goalPick(opts):Math.floor(rnd()*opts.length)); setTimeout(function(){ armed=true; var b=box.children[Math.min(ix,opts.length-1)]; b&&b.click(); },600/FAST); }
  });
  $('#pulse').classList.remove('on'); stageEl.classList.remove('shake'); if(hot) AU.tense(false);
  if(picked.cancel||my!==running) return null;
  var rt=T?used:(performance.now()-t0)/1000;
  if(picked.timeout){ AU.sfx('buzz'); box.children[picked.i]&&box.children[picked.i].classList.add('pick'); tm.classList.add('out'); num.textContent='時間到'; }
  await psleep(picked.timeout?500:250); if(my!==running) return null; $('#choice').classList.add('hide');
  var o=opts[picked.i]; S.stats.choices++; if(!picked.timeout||true){ PK[pkKey(op,o)]=1; LS.set('picked2',PK); }
  (S.keys=S.keys||[]).push({c:chapOf(S.node),t:o.text,br:!!o.go}); if(S.keys.length>60) S.keys=S.keys.slice(-60); // v=306 章末路線卡用
  if(T){ S.stats.timed++; S.stats.rtSum+=rt; if(picked.timeout){ S.stats.timeouts++; S.vars.panic++; } else if(rt<T*.5) S.stats.fast++;
    if(st!=='chart'){ var ta=+S.vars.tadapt||1; ta=picked.timeout?ta*1.12:(rt<T*.4?ta*.95:ta); S.vars.tadapt=Math.round(Math.max(.8,Math.min(1.35,ta))*1000)/1000; } }
  S.hist.push((op.prompt||'')+'→'+o.text+(picked.timeout?'（逾時）':''));
  window.__game.choices[window.__game.choices.length-1].pick={i:picked.i,timeout:picked.timeout,rt:Math.round(rt*10)/10};
  applyFx(o.fx); return o; }

/* ---------- v=306 章末路線卡：換章時淡淡出現幾秒（點一下就關），只寫目前的路和這一章做過的關鍵選擇，不提結局 ---------- */
function chapOf(n){ var m=/^([ab]\d)/.exec(n||''); return m?m[1]:''; }
var CHN=['','一','二','三','四','五','六'];
function routeName(){ var v=S.vars, A=S.camp==='A', h=+v.heart||0, f=+v.fame||0;
  var t=h>f*1.3+1?(A?'守著湯':'守著自己的店'):f>h*1.3+1?(A?'走向鏡頭':'跟著光走'):(A?'在湯和鏡頭之間':'站在光的旁邊');
  var ppl=[['viv','viv'],['qing','qing22'],['lin','lin']].filter(function(x){ return S.seen[x[1]]&&(+v[x[0]]||0)>=3; }).sort(function(a,b){ return (+v[b[0]]||0)-(+v[a[0]]||0); });
  return t+(ppl.length?'　💛 '+nameOf(ppl[0][1]):''); }
async function routeCard(c){ if(!SET.hint||!c) return;
  var ks=(S.keys||[]).filter(function(x){ return x.c===c; }), br=ks.filter(function(x){ return x.br; }), pick=(br.length?br:ks).slice(-3);
  $('#rtHead').textContent='第'+(CHN[+c.charAt(1)]||c.charAt(1))+'章　結束'; var rn=routeName(); $('#rtRoute').textContent='目前的路：'+rn;
  var ul=$('#rtKeys'); ul.innerHTML=''; (pick.length?pick:[{t:'（這一章，你沒有做選擇）'}]).forEach(function(x){ var li=document.createElement('li'); li.textContent=x.t.length>26?x.t.slice(0,25)+'…':x.t; ul.appendChild(li); });
  window.__game.routes.push({c:c,route:rn,keys:pick.map(function(x){return x.t})});
  var el=$('#route'); $('#sub').classList.add('hide'); el.classList.remove('hide'); AU.sfx('page'); lineShown=performance.now();
  await waitTapOr(AUTO?1800:(skipping()||SKIP?1200:4500)); el.classList.add('hide'); }

/* ---------- 主迴圈 ---------- */
var running=0;
var RDOPS={line:1,title:1,phone:1,note:1,choice:1,rhythm:1,queue:1,bid:1,live:1,chart:1,reveal:1}, MGOPS={rhythm:1,queue:1,bid:1,live:1,chart:1,reveal:1};
var SAVE_AT={line:1,choice:1,scene:1,title:1,phone:1,note:1,rhythm:1,queue:1,chart:1,reveal:1};
function tagOK(op){ if(!op.tag) return true; if(op.tag==='A'||op.tag==='B') return op.tag===S.camp; if(op.tag==='R') return S.replay; if(op.tag==='N') return !S.replay; return true; }
async function run(node,idx){
  var my=++running; S.node=node; S.idx=idx||0; var skip=false; prefetch(node);
  while(my===running){
    var ops=N[S.node]; if(!ops){ console.error('no node',S.node); return; }
    if(S.idx>=ops.length){ var k=ORDER.indexOf(S.node); if(k<0||k+1>=ORDER.length) return; S.node=ORDER[k+1]; S.idx=0; prefetch(S.node); continue; }
    var cc=chapOf(S.node); if(cc&&cc!==S.lastChap){ var pc=S.lastChap; S.lastChap=cc; if(pc&&S.idx===0){ await routeCard(pc); if(my!==running) return; } }
    var op=ops[S.idx]; S.cur=S.idx; S.idx++;
    if(!tagOK(op)) continue; if(skip){ skip=false; continue; }
    window.__game.trace.push(S.node+':'+op.ln);
    if(SAVE_AT[op.k]) save();
    var shows=RDOPS[op.k]; S._wasRead=shows?!!RD[rdKey(op)]:S._wasRead;
    if(SKIP&&shows&&(!S._wasRead||op.k==='choice'||MGOPS[op.k])) setSkip(false);
    var r=await exec(op); if(my!==running) return;
    if(shows) markRead(op);
    if(r==='skip') skip=true;
    else if(r&&r.go){ S.node=r.go; S.idx=0; if(!N[r.go]) console.error('missing node '+r.go); window.__game.nodes.push(r.go); prefetch(r.go); }
    else if(r==='end') return;
  } }
/* 存檔：每個視角一格，存「正在播的那一句」 */
function skey(c){ return 'save_'+c; }
function save(){ if(!S||S.ended||S.nosave) return;
  LS.set(skey(S.camp),{v:3,camp:S.camp,replay:S.replay,node:S.node,idx:S.cur,vars:S.vars,stats:S.stats,seen:S.seen,scene:S.scene,hud:S.hud,hist:S.hist,chart:S.chart,chap:S.chap,keys:S.keys,lastChap:S.lastChap,ts:Date.now()}); }
async function exec(op){
  switch(op.k){
    case 'scene': var a=op.a;
      if(a.bg&&a.bg!==S.scene.bg) await ready(a.bg);
      if(a.fade==='blink'){ await blink(function(){setScene(a)}); } else if(setScene(a)) await psleep(skipping()?80:400); return;
    case 'line': await say(op); return;
    case 'title': await card(op.s); return;
    case 'blink': await blink(); return;
    case 'phone': await phone(op.s); return;
    case 'note': await note(op.s); return;
    case 'set': applyFx(parseFx(op.s)); return;
    case 'hud': S.hud=op.s; $('#hud').classList.remove('hide'); hud(); return;
    case 'bgm': S.scene.bgm=op.s; AU.music(op.s); return;
    case 'amb': S.scene.amb=op.s; AU.amb(op.s); return;
    case 'sfx': AU.sfx(op.s); return;
    case 'wait': await psleep(+op.s||1000); return;
    case 'fx': $('#pulse').classList.toggle('on',op.s==='pulse'); stageEl.classList.toggle('shake',op.s==='pulse'||op.s==='shake'); return;
    case 'rhythm': await rhythm(op.s); return;
    case 'queue': await queue(op.s); return;
    case 'bid': await bid(op.s); return;
    case 'live': await live(op.s); return;
    case 'chart': var w=op.s.split(/\s+/);
      if(w[0]==='mark'){ if(S.chart){ S.chart.mark=1; showChart(); } return; }
      var rr=+w[0]||1;
      if(!(S.chart&&S.chart.round===rr&&S.chart.node===S.node)){
        var dir=w[1]==='up'?1:w[1]==='down'?-1:(CDIRQ[rr-1]?(CDIRQ[rr-1]>0?1:-1):(crnd()<.5?1:-1));
        S.chart={round:rr,dir:dir,seed:(crnd()*2147483647)|0,mark:0,node:S.node}; S.vars.cdir=dir; S.vars.guess=0; S.vars.cok=0; }
      showChart(); return;
    case 'reveal': await reveal(); return;
    case 'go': return {go:op.s};
    case 'if': var m=op.s.match(/^(.*?)\s*->\s*(\S+)$/); if(m&&evalx(m[1])) return {go:m[2]}; return;
    case 'when': return evalx(op.s)?undefined:'skip';
    case 'end': await ending(op.s); return 'end';
    case 'choice': var o=await choose(op); if(o&&o.go) return {go:o.go}; return;
    default: console.warn('unknown op',op.k,op.ln); return;
  } }

/* ---------- v=306 最近的未解鎖結局：從第五章通往各結局的選項條件，估「還差多少」，只給模糊的方向 ---------- */
var ENDC=null;
function endConds(){ if(ENDC) return ENDC; ENDC={A:{},B:{}}; var ids={}; ENDINGS.forEach(function(e){ ids[e.id]=1; });
  function add(cp,go,cond){ var m=go&&/^[ab]5_end_(\w+)$/.exec(go); if(!m||!ids[m[1]]) return; (ENDC[cp][m[1]]=ENDC[cp][m[1]]||[]).push(cond||''); }
  ORDER.forEach(function(n){ var cp=n.charAt(0)==='a'?'A':n.charAt(0)==='b'?'B':''; if(!cp) return;
    N[n].forEach(function(op){ if(op.k==='choice') op.opts.forEach(function(o){ add(cp,o.go,o.cond); });
      else if(op.k==='if'){ var m=op.s.match(/^(.*?)\s*->\s*(\S+)$/); if(m) add(cp,m[2],m[1]); } else if(op.k==='go') add(cp,op.s,'?'); }); });
  return ENDC; }
var VAGUE={heart:'多留一點時間給湯',fame:'讓更多人看見你',mom:'多回家吃飯',uncle:'多去巷口坐坐',chef:'多去看看師傅',mate:'多陪陪阿肥',kai:'多跟阿凱並肩',teach:'回去找林老師',
  viv:'多陪 Vivian',qing:'多留意小晴',lin:'多跟林以安聊聊',kid:'多帶帶小柏',trustA:'對A先生說話算話',atruth:'追問那支錶',seventh:'別忘了第七題',bond:'多陪那個老朋友',
  promise:'記得那個約定',app:'幫阿肥一把',live:'把鏡頭打開',branch:'把店開得更多',franchise:'把店開得更多',love:'心裡先放一個人',birthday:'記得一個生日',envelope:'收好那個信封',cash:'把帳顧好'};
var VAGUE_LO={fame:'少一點鏡頭',heart:'換一顆比較硬的心',pc:'少看一點手機',live:'把鏡頭關掉',branch:'只守一間店',okn:'',bk:'把帳顧好'};
function gapOf(cond,v){ if(cond==='?') return {g:.6,k:''}; if(!cond) return {g:.5,k:''};
  var terms=[], d=0, cur=''; for(var i=0;i<cond.length;i++){ var ch=cond.charAt(i); if(ch==='(') d++; else if(ch===')') d--;
    if(d===0&&cond.substr(i,2)==='&&'){ terms.push(cur); cur=''; i++; continue; } cur+=ch; } terms.push(cur);
  var g=0, worst=0, wk='';
  terms.forEach(function(t){ var m=/^\s*(\w+)\s*(>=|<=|==|!=|>|<)\s*(-?\d+)\s*$/.exec(t), x, n, tg=0, k='';
    if(m){ x=+v[m[1]]||0; n=+m[3]; k=m[1];
      if(m[2]==='>=') tg=x>=n?0:(n-x)/Math.max(2,n); else if(m[2]==='>') tg=x>n?0:(n+1-x)/Math.max(2,n+1);
      else if(m[2]==='<=') { tg=x<=n?0:(x-n)/Math.max(2,n); k='-'+k; } else if(m[2]==='<') { tg=x<n?0:(x-n+1)/Math.max(2,n); k='-'+k; }
      else if(m[2]==='==') tg=x===n?0:1; else tg=x!==n?0:1; }
    else { var ok=false; try{ ok=!!Function('v','with(v){return ('+t+')}')(vproxy(v)); }catch(e){} tg=ok?0:1; }
    tg=Math.min(1.5,tg); g+=tg; if(tg>worst){ worst=tg; wk=k; } });
  return {g:g,k:wk}; }
function nearestLocked(camp,vars){ var got=LS.get('end',{}), ec=endConds()[camp]||{}, best=null, anyLocked=false;
  ENDINGS.forEach(function(e){ if(got[e.id]) return; anyLocked=true; var cs=ec[e.id]; if(!cs) return;
    cs.forEach(function(c){ var r=gapOf(c,vars||{}); if(!best||r.g<best.g) best={id:e.id,e:e,g:r.g,k:r.k}; }); });
  if(!best) return anyLocked?{other:1}:null; return best; }
function nearText(r){ if(!r) return ''; if(r.other) return '🔒 這個視角能看見的結局都打開了。換個視角，還有門沒開。';
  var k=r.k||'', nudge=k.charAt(0)==='-'?VAGUE_LO[k.slice(1)]:VAGUE[k];
  return '🔒 離你最近的一扇門：「'+(r.e.hint||'？？？')+'」'+(r.g<=0?'　上一輪，它其實就在選項裡。':nudge?'　也許，'+nudge+'。':'　也許，換一條岔路走走。'); }

/* ---------- 結局與評語 ---------- */
var P1N={}; (window.P1END||[]).forEach(function(x){ P1N[x[0]]=x[1]; }); P1N.none='沒玩過第一部';
var VQ={wip:['第二章的湯，還在熬。','名氣這條線，才剛開始轉彎。']};
function verdict(e){ var v=S.vars, s=S.stats; var cool=s.timed?Math.round(100*(s.timed-s.timeouts)/s.timed):100; var avg=s.timed?(s.rtSum/s.timed).toFixed(1):'—';
  var lines=[], me=S.camp==='A';
  lines.push('<div class="vh">評　語</div>');
  if(v.p1) lines.push('第一部的記憶　「'+(P1N[v.p1]||v.p1)+'」');
  lines.push('名氣 🔥 '+(v.fame||0)+'　初心 '+(v.heart||0)+'　存款 '+fmt(v.cash)+' 萬'+(v.coin?'　₿ '+fmt(v.coin):'')+(v.burnout>0?'　疲憊 '+v.burnout:''));
  lines.push('冷靜指數　'+cool+'%　（限時抉擇 '+s.timed+' 次，逾時 '+s.timeouts+' 次，平均 '+avg+' 秒）');
  if(s.qs||s.ql) lines.push('帶位　'+s.qs+' 人入座，'+s.ql+' 人等不及離開');
  if(s.rhythm) lines.push('節奏感　'+Math.round(100*s.rhyHit/s.rhythm)+'%');
  var rel=[]; if(v.bond>0) rel.push((me?'阿哲':'阿葛')+' '+'♥'.repeat(Math.min(5,Math.ceil(v.bond/2)))); var pn={qing:'小晴',viv:'Vivian',lin:'林以安',mom:me?'媽媽':'阿姨',kai:'阿凱',uncle:'大叔'};
  ['mom','qing','viv','lin','kai','uncle'].forEach(function(k){ if(v[k]>0) rel.push(pn[k]+' '+'♥'.repeat(Math.min(5,Math.ceil(v[k]/2)))); });
  if(rel.length) lines.push('羈絆　'+rel.join('　'));
  if(v.trustA) lines.push('信用　A先生 '+(v.trustA>=2?'「這小子說話算話。」':'「還行。」'));
  var qq=VQ[e.id]||['這一次，你終於看見了一條不在 K 線上的曲線。']; var q=qq[me?0:(qq.length-1)];
  if(e.id==='wip'){ q=(v.heart>=v.fame?'湯沒有變。變的是門外的人。':'門外的人越來越多，你聽得見湯的聲音嗎？'); if(!me) q=(v.bond>=5?'第二名，一直都在。':'第二名的位置，越站越遠了。'); }
  lines.push('<div class="vq">「'+q+'」</div>');
  var sc=(v.heart>=8?3:v.heart>=4?2:v.heart>=1?1:0)+(cool>=90?2:cool>=70?1:0)+(v.bond>=5?1:0)+(s.qs>=40?1:0)-(v.burnout>=5?1:0);
  lines.push('<div class="vh" style="margin-top:8px">總評　'+(sc>=6?'S　看得見湯的人':sc>=4?'A　沒有被名氣吃掉':sc>=2?'B　還在學怎麼被看見':'C　門外太吵了')+'</div>');
  return lines.map(function(x){return /^<div/.test(x)?x:'<div class="vr">'+x+'</div>'}).join(''); }
async function ending(id){
  var e=ENDINGS.filter(function(x){return x.id===id})[0]; if(!e){console.error('ending',id);return;}
  var my=running; S.ended=true; window.__game.ending=id;
  var ev=(e.alt||[]).filter(function(x){ try{ return evalx(x.when); }catch(_){ return false; } })[0]||{}; // 整合（助理 11/01）結局變體：endings_*.json 的 alt:[{when,dA,dB,img,name}]
  var got=LS.get('end',{}); got[id]=got[id]||{}; got[id][S.camp]=1; if(ev.name) got[id].nm=ev.name; else got[id].base=1; LS.set('end',got);
  var lr=LS.get('lastrun',{}); lr[S.camp]={vars:S.vars,ts:Date.now()}; lr.last=S.camp; LS.set('lastrun',lr); // v=306 圖鑑的「最近結局」提示用 var dn=LS.get('done',{}); dn[S.camp]=1; LS.set('done',dn);
  LS.del(skey(S.camp)); AU.music(e.bgm||'emo'); hideChart();
  var ev0=(e.alt||[]).filter(function(x){ try{ return evalx(x.when); }catch(_){ return false; } })[0]||{}; var eimg=(S.scene&&/_end_/.test(S.scene.bg||''))?S.scene.bg:(ev0.img||e.img); // 整合（助理 11/01） // 結局畫面用該視角結局節點的專屬圖
  await ready(eimg); await blink(function(){ setScene({bg:eimg}); });
  await psleep(800); if(my!==running) return;
  $('#sub').classList.add('hide'); var el=$('#ending'); el.style.backgroundImage='linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.92)),url(img/'+eimg+'.webp)';
  $('#eTag').textContent=CAMPN[S.camp]+'　結局 '+(ENDINGS.indexOf(e)+1)+' / '+ENDINGS.length;
  $('#eName').textContent='「'+(ev.name||e.name)+'」'; // v=306 shopfate==2 等變體可以換標題（alt.name）
  $('#eDesc').textContent=(S.camp==='A'?(ev.dA||e.dA):(ev.dB||e.dB))||e.d||'';
  $('#eVerdict').innerHTML=verdict(e); var nr=SET.hint?nearestLocked(S.camp,S.vars):null, nt=nearText(nr); $('#eNear').textContent=nt; $('#eNear').classList.toggle('hide',!nt);
  window.__game.near=nr?{id:nr.id||null,g:nr.g,text:nt}:null; el.classList.remove('hide'); $('#hud').classList.add('hide'); AU.sfx('coin');
  if(window.__game) window.__game.onEnd&&window.__game.onEnd(id);
}

/* ---------- 標題／選單／圖鑑／確認框 ---------- */
function show(id){ ['#title','#gallery','#menu','#ending','#confirm'].forEach(function(s){$(s).classList.add('hide')}); if(id) $(id).classList.remove('hide'); }
var campMode='new';
var CAMPN={A:'阿葛的視角',B:'我的視角'};
function saveLabel(s){ var d=new Date(s.ts||0), two=function(n){return (n<10?'0':'')+n};
  return (s.chap||'')+(s.scene&&s.scene.time?'．'+s.scene.time:'')+(s.ts?'　（'+(d.getMonth()+1)+'/'+d.getDate()+' '+two(d.getHours())+':'+two(d.getMinutes())+' 存）':''); }
function refreshTitle(){ var a=LS.get('save_A',null), b=LS.get('save_B',null); $('#bCont').classList.toggle('hide',!(a||b));
  var d=LS.get('done',{}); $('#bReplay').classList.toggle('hide',!(d.A||d.B));
  $('#tMain').classList.remove('hide'); $('#tCamp').classList.add('hide'); $('#tCont').classList.add('hide'); $('#tP1').classList.add('hide'); }
function resetStage(){ setSkip(false); cancelAll(); AU.stopVoice(); tapWait=null; PAUSED=false; AU.pause(false); clearTimeout(introTimer);
  ['#sub','#choice','#phone','#note','#card','#route','#rhythm','#queue','#hud','#intro','#confirm','#menu','#ending'].forEach(function(s){$(s).classList.add('hide')});
  hideChart(); $('#menuBtn').classList.remove('hide'); $('#pulse').classList.remove('on'); stageEl.classList.remove('shake','closed'); AU.tense(false);
  $('#txt').classList.remove('on'); $('#txt').textContent=''; $('#clock').textContent=''; $('#money').textContent=''; $('#tint').style.background='';
  bgs.forEach(function(b){ b.classList.remove('on'); b.style.backgroundImage=''; }); look.fx=look.tx=0; }
function toTitle(){ running++; resetStage(); S=null; refreshTitle(); show('#title'); AU.music('none'); AU.amb('none'); }

/* ---------- 第一部的記憶：讀同網域 agege2_end，套用初始值 ---------- */
function applyP1(id){ var st=(window.P1START||{})[id]; if(!st){ id='none'; st=(window.P1START||{}).none||{}; } S.vars.p1=id;
  Object.keys(st).forEach(function(k){ var x=st[k]; if(k==='coin') S.vars[k]=x; else S.vars[k]=(+S.vars[k]||0)+x; }); }
function readP1(){ try{ var g=JSON.parse(localStorage.getItem('agege2_end')||'{}'); return (window.P1END||[]).filter(function(x){ return g[x[0]]; }); }catch(e){ return []; } }
function pickP1(){ return new Promise(function(res){ var found=readP1(), L=$('#p1List'); L.innerHTML='';
  function add(id,txt,sm,cls){ var b=document.createElement('button'); b.innerHTML=txt+(sm?'<small></small>':''); if(sm) b.lastChild.textContent=sm; if(cls) b.className=cls; b.onclick=function(e){ e.stopPropagation(); AU.sfx('select'); $('#tP1').classList.add('hide'); res(id); }; L.appendChild(b); }
  if(found.length===1){ $('#p1Head').textContent='讀取到你在第一部看見的結局：'; add(found[0][0],'延續「'+found[0][1]+'」','這一次，從這段人生繼續'); add('none','不延續，重新開始','',''); }
  else if(found.length>1){ $('#p1Head').textContent='你在第一部看過好幾個結局。這一次，要延續哪一段人生？'; found.forEach(function(x){ add(x[0],'「'+x[1]+'」'); }); add('none','都不要，重新開始'); }
  else { $('#p1Head').textContent='沒有找到第一部的紀錄。你在第一部，看見的是哪一個結局？'; (window.P1END||[]).forEach(function(x){ add(x[0],'「'+x[1]+'」'); }); add('none','我沒玩過第一部'); }
  add(null,'返回','','back');
  $('#tMain').classList.add('hide'); $('#tCamp').classList.add('hide'); $('#tP1').classList.remove('hide'); }); }
function startGame(camp,replay){ PK0=Object.assign({},PK); running++; // 整合（助理 11/01）
  resetStage(); S=fresh(camp,replay); window.__game.trace=[]; window.__game.nodes=[]; window.__game.ending=null; window.__game.hearts=[]; window.__game.routes=[]; window.__game.near=null;
  show(null); $('#hud').classList.remove('hide'); S.hud='none'; hud(); AU.unlock();
  applyP1(Q.get('p1')||LS.get('p1',null)||'none');
  var st=window.__nodeUsed?null:Q.get('node'); window.__nodeUsed=1; if(st&&N[st]){ S.node=st; try{Object.assign(S.vars,JSON.parse(Q.get('vars')||'{}'))}catch(e){} }
  if(st&&N[st]){ var sc={}, k=ORDER.indexOf(st), c=st.charAt(0); for(var j=0;j<k;j++){ if(ORDER[j].charAt(0)!==c) continue; N[ORDER[j]].forEach(function(op){ if(op.k==='scene') ['bg','time','tint','bgm','amb'].forEach(function(x){ if(op.a[x]!=null) sc[x]=op.a[x]; }); if(op.k==='hud') S.hud=op.s; }); }
    var f=N[st][0]; if(!(f&&f.k==='scene'&&f.a.bg)) setScene(sc); hud(); }
  save(); run(S.node,0); }
function cont(camp){ var s=LS.get(skey(camp),null); if(!s) return; running++; resetStage(); S=fresh(s.camp,s.replay);
  Object.assign(S,{vars:Object.assign(S.vars,s.vars),stats:s.stats||S.stats,seen:s.seen||{},hud:s.hud||'none',hist:s.hist||[],chart:s.chart||null,chap:s.chap||'',keys:s.keys||[],lastChap:s.lastChap||''});
  show(null); $('#hud').classList.remove('hide'); AU.unlock();
  var sc=s.scene||{}; S.scene={}; preload(sc.bg); setScene(sc); hud(); if(S.chart) showChart();
  run(s.node,s.idx||0); }
// 頁內確認框（不用 window.confirm，手機上也一致）
function ask(msg,btns){ return new Promise(function(res){ $('#cfMsg').textContent=msg; var box=$('#cfBtns'); box.innerHTML='';
  btns.forEach(function(b){ var e=document.createElement('button'); e.textContent=b[1]; if(b[2]) e.className=b[2]; e.onclick=function(ev){ ev.stopPropagation(); $('#confirm').classList.add('hide'); res(b[0]); }; box.appendChild(e); });
  $('#confirm').classList.remove('hide'); }); }
$('#tMain').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.dataset.a; AU.sfx('select');
  if(a==='start'||a==='replay'){ campMode=a; $('#campHead').textContent=a==='replay'?'重來一次（抉擇時間更短，有些事你好像記得）':'選擇視角';
    ['A','B'].forEach(function(c){ var s=LS.get(skey(c),null); $('#tCamp [data-a="'+c+'"] em').textContent=s?'有存檔：'+(s.chap||'進行中'):''; });
    $('#tMain').classList.add('hide'); $('#tCamp').classList.remove('hide'); }
  else if(a==='cont'){ var sa=LS.get('save_A',null), sb=LS.get('save_B',null);
    if(sa&&sb){ var L=$('#tContList'); L.innerHTML=''; [['A',sa],['B',sb]].forEach(function(x){ var btn=document.createElement('button'); btn.dataset.c=x[0]; btn.innerHTML=CAMPN[x[0]]+(x[1].replay?'（重來）':'')+'<small></small>'; btn.lastChild.textContent=saveLabel(x[1]); L.appendChild(btn); });
      $('#tMain').classList.add('hide'); $('#tCont').classList.remove('hide'); }
    else cont(sa?'A':'B'); }
  else if(a==='gallery') openGallery(); else if(a==='menu') openMenu(); });
$('#tCont').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; AU.sfx('select'); if(b.dataset.a==='back'){ refreshTitle(); return; } cont(b.dataset.c); });
$('#tCamp').addEventListener('click',async function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.dataset.a; AU.sfx('select'); if(a==='back'){refreshTitle();return;}
  var s=LS.get(skey(a),null);
  if(s){ var r=await ask(CAMPN[a]+'已經有一個存檔：\n'+saveLabel(s)+'\n\n開始新的一輪會覆蓋這個存檔。',[['cont','從存檔繼續'],['new','覆蓋，重新開始','warn'],['cancel','取消']]);
    if(r==='cancel') return; if(r==='cont'){ cont(a); return; } }
  if(campMode!=='replay'||!LS.get('p1',null)){ var p=await pickP1(); if(p==null){ refreshTitle(); return; } LS.set('p1',p); }
  LS.del(skey(a)); startGame(a,campMode==='replay'); });
function openGallery(){ var got=LS.get('end',{}), L=$('#gList'); L.innerHTML='';
  var lr=LS.get('lastrun',{}), lc=lr.last, nr=(SET.hint&&lc&&lr[lc])?nearestLocked(lc,lr[lc].vars):null; // v=306 依上一輪的數值，標出最接近的未解鎖結局
  $('#gNear').textContent=nr?nearText(nr).replace('離你最近','上一輪離你最近'):''; $('#gNear').classList.toggle('hide',!nr);
  ENDINGS.forEach(function(e,i){ var ok=got[e.id], d=document.createElement('div'); d.className='ge'+(ok?' ok':' lock')+(nr&&nr.id===e.id?' near':'');
    d.innerHTML='<div class="gi"><i>'+(ok?'':'🔒')+'</i></div><div class="gt"><b></b><span></span></div>'; d.firstChild.style.backgroundImage='url(img/'+((ok&&ok.B&&!ok.A)?'s_b5_end_'+e.id:e.img)+'.webp)';
    d.querySelector('b').textContent=(i+1)+'. '+(ok?(ok.nm?(ok.base?e.name+'／'+ok.nm:ok.nm):e.name):'🔒 ？？？'); if(ok){ var em=document.createElement('em'); em.textContent=(ok.A?'阿葛 ':'')+(ok.B?'我':''); d.querySelector('b').appendChild(em);}
    d.querySelector('span').textContent=ok?e.short:('提示：'+(e.hint||'？')+(nr&&nr.id===e.id?'　✧ 最接近':'')); L.appendChild(d); });
  $('#gCount').textContent='已收集 '+Object.keys(got).filter(function(k){return ENDINGS.some(function(e){return e.id===k})}).length+' / '+ENDINGS.length;
  show('#gallery'); }
$('#gBack').onclick=function(){ AU.sfx('select'); show('#title'); };
var menuFrom=null;
function inGame(){ return !!S&&$('#title').classList.contains('hide')&&$('#gallery').classList.contains('hide'); }
function openMenu(){ menuFrom=inGame()?'game':'title'; $('#vVoice').value=SET.voice; $('#vMusic').value=SET.music; $('#vAmb').value=SET.amb; $('#vSub').checked=SET.sub; $('#vAuto').checked=SET.auto; if($('#vHint')) $('#vHint').checked=SET.hint;
  $('#mTitle').classList.toggle('hide',menuFrom==='title'); $('#mResume').textContent=menuFrom==='title'?'返回':'繼續'; $('#menu h2').textContent=menuFrom==='title'?'設定':'暫停';
  if(menuFrom==='game'){ PAUSED=true; AU.pause(true); } $('#menu').classList.remove('hide'); }
function closeMenu(){ $('#menu').classList.add('hide'); if(menuFrom==='game'){ PAUSED=false; AU.pause(false); lineShown=performance.now(); } }
(function(){ var b=document.getElementById('skipBtn'); if(b) b.addEventListener('click',function(e){ e.stopPropagation(); if(!S||S.ended) return; setSkip(!SKIP); if(SKIP&&tapWait&&S._wasRead){ var f=tapWait; tapWait=null; f(); } }); })();
$('#menuBtn').addEventListener('click',function(e){e.stopPropagation(); if(!$('#rhythm').classList.contains('hide')||QG.on) return; openMenu();});
['vVoice','vMusic','vAmb'].forEach(function(id){ $('#'+id).addEventListener('input',function(){ SET[{vVoice:'voice',vMusic:'music',vAmb:'amb'}[id]]=+this.value; LS.set('set',SET); AU.vol(); }); });
$('#vSub').onchange=function(){SET.sub=this.checked;LS.set('set',SET);$('#sub').classList.toggle('nosub',!SET.sub)};
$('#vAuto').onchange=function(){SET.auto=this.checked;LS.set('set',SET)};
if($('#vHint')) $('#vHint').onchange=function(){SET.hint=this.checked;LS.set('set',SET)};
$('#mResume').onclick=function(e){ e.stopPropagation(); AU.sfx('select'); closeMenu(); };
$('#mTitle').onclick=function(e){ e.stopPropagation(); save(); toTitle(); };
$('#eTitle').onclick=function(){ toTitle(); };
$('#eReplay').onclick=function(){ var c=S.camp; LS.del(skey(c)); startGame(c,true); };
// 切到背景時自動暫停
document.addEventListener('visibilitychange',function(){
  if(document.hidden){ if(inGame()&&!S.ended&&!PAUSED){ PAUSED=true; AU.pause(true); window.__autoPaused=true; } if(!$('#rhythm').classList.contains('hide')) RH.restart=true; }
  else if(window.__autoPaused){ window.__autoPaused=false; if($('#menu').classList.contains('hide')){ PAUSED=false; AU.pause(false); } } });
// 開場：只做解鎖（不播任何聲音），等玩家按「開始／繼續」
$('#gateBtn').onclick=function(){ AU.init(); AU.unlock(); $('#gate').classList.add('hide'); refreshTitle(); show('#title'); };

/* ---------- 音訊（WebAudio 程序化配樂／環境音／音效 + 一個重複使用的 HTMLAudio 播每句語音） ---------- */
var AU=(function(){
  var ac=null, master, mBus, aBus, xBus, noiseBuf, song=null, mood='', ambNode=null, duck=1, paused=false, tenseOn=false, baseMood='';
  var vEl=null, vCur=null, vRes=null, unlocked=false;
  function init(){ if(ac) return; try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
    master=ac.createGain(); master.connect(ac.destination); mBus=ac.createGain(); aBus=ac.createGain(); xBus=ac.createGain(); mBus.connect(master); aBus.connect(master); xBus.connect(master); xBus.gain.value=.7;
    noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); var d=noiseBuf.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    vol(); setInterval(sched,100); }
  // 在使用者手勢內解鎖：resume AudioContext、讓語音元素播一段 0.15 秒的靜音（iOS Safari 需要），不會播出任何台詞
  function unlock(){ init(); if(ac&&ac.state==='suspended') ac.resume().catch(function(){});
    if(!vEl){ vEl=new Audio(); vEl.preload='auto'; vEl.setAttribute('playsinline',''); }
    if(!unlocked){ unlocked=true; try{ vEl.src='voice/_silence.mp3'; var p=vEl.play(); if(p&&p.catch) p.catch(function(){ unlocked=false; }); }catch(e){ unlocked=false; } } }
  function wake(){ if(ac&&ac.state==='suspended') ac.resume().catch(function(){}); }
  function vol(){ if(!ac) return; var t=ac.currentTime; mBus.gain.setTargetAtTime(paused?0:SET.music*duck*.9,t,.25); aBus.gain.setTargetAtTime(paused?0:SET.amb*.8,t,.4); if(vEl) vEl.volume=Math.max(0,Math.min(1,SET.voice)); }
  function pause(p){ paused=p; vol(); if(vCur){ if(p) vCur.pause(); else vCur.play().catch(function(){}); } }
  var MO={
    title:{bpm:60,ch:[[57,64,67,72],[53,60,64,69],[48,55,64,67],[55,62,67,71]],pad:.05,arp:.035,step:2},
    calm:{bpm:68,ch:[[48,55,64,71],[45,52,60,67],[41,48,57,64],[43,50,59,65]],pad:.045,arp:.05,step:1},
    school:{bpm:96,ch:[[48,60,64,67],[53,60,65,69],[55,62,67,71],[48,60,64,67]],pad:.025,arp:.055,step:.5,pluck:1},
    warm:{bpm:84,ch:[[41,57,64,69],[40,55,62,67],[38,53,60,65],[43,53,59,65]],pad:.04,arp:.04,step:1,bass:.09},
    tense:{bpm:108,ch:[[45,57,60,64],[41,53,57,60],[38,50,53,57],[40,52,56,59]],pad:.035,arp:.03,step:.5,bass:.12,hat:.03},
    night:{bpm:52,ch:[[50,57,64,69],[46,53,62,65],[43,50,58,62],[45,52,61,64]],pad:.05,arp:.025,step:2},
    emo:{bpm:58,ch:[[41,60,65,69],[43,59,62,67],[40,59,64,67],[45,60,64,69]],pad:.05,arp:.05,step:1,mel:1},
    triumph:{bpm:80,ch:[[48,60,64,67,72],[43,59,62,67,71],[45,57,60,64,69],[41,57,60,65,69]],pad:.05,arp:.05,step:.5,bass:.08},
    none:null };
  function hz(n){return 440*Math.pow(2,(n-69)/12)}
  function music(m){ baseMood=m; if(!tenseOn) setMood(m); }
  function tense(on){ tenseOn=on; setMood(on?'tense':baseMood); }
  function setMood(m){ if(!ac||m===mood) return; mood=m; var t=ac.currentTime;
    if(song){ var g=song.g; g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value,t); g.gain.linearRampToValueAtTime(0,t+2.2); setTimeout(function(){try{g.disconnect()}catch(e){}},3000); }
    if(!MO[m]){ song=null; return; }
    var g2=ac.createGain(); g2.gain.value=0; g2.gain.linearRampToValueAtTime(1,t+2.5); var f=ac.createBiquadFilter(); f.type='lowpass'; f.frequency.value=2600; g2.connect(f); f.connect(mBus);
    song={g:g2,m:MO[m],next:t+.1,beat:0}; }
  function env(dest,type,freq,t,dur,vol,att){ var o=ac.createOscillator(), g=ac.createGain(); o.type=type; o.frequency.value=freq; g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+(att||.01)); g.gain.exponentialRampToValueAtTime(.0001,t+dur); o.connect(g); g.connect(dest); o.start(t); o.stop(t+dur+.05); return o; }
  function sched(){ if(!ac||!song||paused) return; var s=song, m=s.m, spb=60/m.bpm;
    while(s.next<ac.currentTime+.4){ var t=s.next, bar=Math.floor(s.beat/4), ch=m.ch[bar%m.ch.length], bInBar=s.beat%4;
      if(bInBar===0){ ch.forEach(function(n,i){ if(i===0) return; var o=env(s.g,'sawtooth',hz(n),t,spb*4.2,m.pad*.5,1.2), o2=env(s.g,'triangle',hz(n)*1.003,t,spb*4.2,m.pad*.6,1.2); });
        env(s.g,'sine',hz(ch[0]-12),t,spb*4,.12,.05); }
      if(m.bass&&bInBar%1===0){ env(s.g,'triangle',hz(ch[0]-(bInBar%2?0:12)),t,spb*.9,m.bass,.01); }
      var steps=Math.round(1/m.step);
      for(var k=0;k<Math.max(1,steps);k++){ var tt=t+k*spb*m.step; if(m.step>1&&bInBar%m.step) break;
        var idx=(s.beat*steps+k)%(ch.length*2), n=ch[1+(idx%(ch.length-1))]+(idx>=ch.length?12:0);
        if(Math.random()<.85) env(s.g,m.pluck?'square':'sine',hz(n),tt,m.pluck?.25:spb*1.6,m.arp*(m.pluck?.4:1),.005); }
      if(m.mel&&bInBar===2&&Math.random()<.6) env(s.g,'sine',hz(ch[1+Math.floor(Math.random()*(ch.length-1))]+12),t,spb*2.5,.04,.05);
      if(m.hat){ for(var h=0;h<2;h++) noiseHit(s.g,t+h*spb/2,.04,m.hat,7000); }
      s.next+=spb; s.beat++; } }
  function noiseHit(dest,t,dur,vol,fr){ var src=ac.createBufferSource(); src.buffer=noiseBuf; var f=ac.createBiquadFilter(); f.type='highpass'; f.frequency.value=fr||5000; var g=ac.createGain(); g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(.0001,t+dur); src.connect(f); f.connect(g); g.connect(dest); src.start(t,Math.random()); src.stop(t+dur+.02); }
  function noiseLoop(dest,type,fr,q,vol){ var src=ac.createBufferSource(); src.buffer=noiseBuf; src.loop=true; var f=ac.createBiquadFilter(); f.type=type; f.frequency.value=fr; f.Q.value=q||.7; var g=ac.createGain(); g.gain.value=vol; src.connect(f); f.connect(g); g.connect(dest); src.start(); return {src:src,g:g,f:f}; }
  function amb(type){ if(!ac) return; var t=ac.currentTime;
    if(ambNode){ var old=ambNode; old.g.gain.setTargetAtTime(0,t,.6); clearInterval(old.iv); setTimeout(function(){ old.parts.forEach(function(p){try{p.src.stop()}catch(e){}}); try{old.g.disconnect()}catch(e){} },3000); ambNode=null; }
    if(!type||type==='none') return;
    var g=ac.createGain(); g.gain.value=0; g.gain.setTargetAtTime(1,t,.8); g.connect(aBus); var parts=[], iv=null;
    function lfo(p,rate,depth){ var o=ac.createOscillator(), og=ac.createGain(); o.frequency.value=rate; og.gain.value=depth; o.connect(og); og.connect(p.g.gain); o.start(); }
    if(type==='class'){ var p=noiseLoop(g,'bandpass',700,1.2,.05); lfo(p,.7,.03); parts.push(p); var p2=noiseLoop(g,'bandpass',1500,2,.02); lfo(p2,1.3,.015); parts.push(p2);
      iv=setInterval(function(){ if(Math.random()<.4) env(g,'sine',300+Math.random()*500,ac.currentTime,.12,.015); },700); }
    else if(type==='rain'){ parts.push(noiseLoop(g,'highpass',900,.5,.12)); parts.push(noiseLoop(g,'lowpass',400,.5,.08));
      iv=setInterval(function(){ for(var i=0;i<3;i++) env(g,'sine',1800+Math.random()*2500,ac.currentTime+Math.random()*.3,.04,.01); },200); }
    else if(type==='street'){ var p=noiseLoop(g,'lowpass',380,.6,.12); lfo(p,.08,.05); parts.push(p);
      iv=setInterval(function(){ if(Math.random()<.18){ var s=noiseLoop(g,'bandpass',300,3,0), tt=ac.currentTime; s.g.gain.linearRampToValueAtTime(.12,tt+1.2); s.g.gain.linearRampToValueAtTime(0,tt+2.6); s.f.frequency.setValueAtTime(250,tt); s.f.frequency.linearRampToValueAtTime(900,tt+1.2); s.f.frequency.linearRampToValueAtTime(300,tt+2.6); setTimeout(function(){try{s.src.stop()}catch(e){}},2800); } },1000); }
    else if(type==='kitchen'||type==='rest'){ var p=noiseLoop(g,'highpass',3500,.5,type==='rest'?.025:.06); lfo(p,6,.02); parts.push(p); parts.push(noiseLoop(g,'lowpass',160,.5,.05));
      if(type==='rest'){ var m=noiseLoop(g,'bandpass',650,1.2,.045); lfo(m,.5,.02); parts.push(m); }
      iv=setInterval(function(){ if(Math.random()<.25) noiseHit(g,ac.currentTime,.05,.04,4000); if(type==='rest'&&Math.random()<.08) env(g,'sine',2600+Math.random()*900,ac.currentTime,.4,.02); },300); }
    else if(type==='night'){ parts.push(noiseLoop(g,'lowpass',250,.5,.03));
      iv=setInterval(function(){ var tt=ac.currentTime; for(var i=0;i<4;i++) env(g,'sine',4300+Math.random()*200,tt+i*.05,.03,.012); },900); }
    else if(type==='room'){ parts.push(noiseLoop(g,'lowpass',180,.5,.04)); iv=setInterval(function(){ env(g,'square',1200,ac.currentTime,.015,.006); },1000); }
    else if(type==='harbor'||type==='wind'){ var p=noiseLoop(g,'lowpass',type==='harbor'?500:900,.5,.08); lfo(p,type==='harbor'?.13:.25,.07); parts.push(p); }
    else if(type==='city'){ var p=noiseLoop(g,'lowpass',600,.5,.06); lfo(p,.1,.03); parts.push(p); }
    ambNode={g:g,parts:parts,iv:iv}; }
  function sfx(n,delay){ if(!ac||(paused&&n!=='select')) return; var t=ac.currentTime+Math.max(0,delay||0);
    if(n==='beat'){ env(xBus,'sine',440,t,.09,.05,.004); return; }
    if(n==='hit'){ env(xBus,'triangle',1320,t,.12,.12,.003); env(xBus,'sine',1980,t,.08,.05,.003); return; }
    if(n==='miss'){ env(xBus,'square',180,t,.12,.05,.003); return; }
    if(n==='tick') env(xBus,'square',1800,t,.03,.05);
    else if(n==='heart'){ env(xBus,'sine',58,t,.18,.5,.005); env(xBus,'sine',52,t+.2,.2,.38,.005); }
    else if(n==='coin'){ env(xBus,'triangle',1318,t,.15,.12); env(xBus,'triangle',1760,t+.08,.4,.12); }
    else if(n==='blink'){ var p=noiseLoop(xBus,'lowpass',600,.5,0); p.g.gain.linearRampToValueAtTime(.08,t+.25); p.g.gain.linearRampToValueAtTime(0,t+.7); setTimeout(function(){try{p.src.stop()}catch(e){}},900); }
    else if(n==='select') env(xBus,'sine',880,t,.12,.05);
    else if(n==='buzz'){ for(var i=0;i<3;i++) env(xBus,'square',150,t+i*.12,.08,.04); }
    else if(n==='page') noiseHit(xBus,t,.25,.12,1500);
    else if(n==='whoosh'){ var p2=noiseLoop(xBus,'bandpass',500,1,0); p2.g.gain.linearRampToValueAtTime(.1,t+.15); p2.g.gain.linearRampToValueAtTime(0,t+.4); p2.f.frequency.linearRampToValueAtTime(1800,t+.4); setTimeout(function(){try{p2.src.stop()}catch(e){}},600); }
    else if(n==='bell'){ [0,.6,1.2,1.8].forEach(function(d,i){ env(xBus,'sine',[659,523,587,392][i],t+d,1.2,.08); }); }
    else if(n==='crash'){ env(xBus,'sawtooth',110,t,1.2,.12,.01); env(xBus,'sawtooth',55,t,1.6,.12,.01); }
  }

  // 播一句：等 'ended'（真的播完）才 resolve；安全逾時＝實際長度＋3 秒，而且只在真的在播放時才計時（暫停、緩衝都不算）
  function voice(vd){ return new Promise(function(res){ stopVoice(); if(!vEl){ unlock(); }
      var a=vEl, done=false, left=(vd[1]+3)*1000, wait=8000, last=performance.now(), iv=null, started=false;
      function fin(r){ if(done) return; done=true; clearInterval(iv); a.onended=a.onerror=a.onplaying=null; if(vCur===a){ if(r!=='ok') a.pause(); vCur=null; } duck=1; vol(); vRes=null; res(r); }
      vRes=fin; vCur=a;
      a.onended=function(){ fin('ok'); }; a.onerror=function(){ fin('fail'); }; a.onplaying=function(){ started=true; };
      a.src=vd[0]; a.volume=Math.max(0,Math.min(1,SET.voice)); duck=.45; vol();
      try{ var p=a.play(); if(p&&p.catch) p.catch(function(e){ if(!done&&e&&e.name!=='AbortError') fin('fail'); }); }catch(e){ fin('fail'); }
      iv=setInterval(function(){ var now=performance.now(), dt=now-last; last=now; if(paused) return;
        if(!a.paused&&a.readyState>2&&started) left-=dt; else wait-=dt;
        if(left<=0) fin('ok'); else if(wait<=0&&!started) fin('fail'); },100);
      window.__game.vlog.push({src:vd[0],dur:vd[1],t:performance.now()});
    }); }
  function stopVoice(){ if(vCur){ vCur.pause(); vCur=null; } duck=1; vol(); if(vRes){ var r=vRes; vRes=null; r('stop'); } }
  return {init:init,unlock:unlock,wake:wake,vol:vol,music:music,tense:tense,amb:amb,sfx:sfx,voice:voice,stopVoice:stopVoice,pause:pause,
    get ctx(){return ac}, get el(){return vEl}};
})();

window.__game={hearts:[],routes:[],near:null,openGallery:function(){ openGallery(); },get S(){return S},get skip(){return SKIP},setSkip:setSkip,get RD(){return RD},N:N,ORDER:ORDER,q:[],trace:[],nodes:[],lines:[],vlog:[],choices:[],rh:[],ending:null,get fps(){return fps},get paused(){return PAUSED},start:startGame,mg:{bid:bid,live:live,queue:queue},cont:cont,toTitle:toTitle,tap:onTap,
  choose:function(i){ var b=document.querySelectorAll('#opts button')[i]; if(b) b.click(); }, AU:AU, genChart:genChart};
// 測試用直接進入
if(Q.get('camp')){ $('#gate').classList.add('hide'); AU.init(); startGame(Q.get('camp'),Q.has('replay')); }
else if(Q.has('title')){ $('#gate').classList.add('hide'); refreshTitle(); show('#title'); }
})();
