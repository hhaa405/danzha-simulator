/* 少年王 — 2D 寫實第一人稱互動劇場引擎（由阿葛引擎改寫：單視角、小遊戲、影片背景、動態鏡頭） */
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
var LS={get:function(k,d){try{var v=localStorage.getItem('snw1_'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('snw1_'+k,JSON.stringify(v))}catch(e){}},del:function(k){try{localStorage.removeItem('snw1_'+k)}catch(e){}}};
var SET=Object.assign({voice:1,music:.55,amb:.6,sub:true,auto:true},LS.get('set',{}));

/* ---------- 劇本解析 ---------- */
function kv(s){var o={};s.replace(/(\w+)=("[^"]*"|\S+)/g,function(_,k,v){o[k]=v.replace(/^"|"$/g,''); if(k==='time') o[k]=o[k].replace(/_/g,' ');});return o}
function parseFx(s){ if(!s) return []; return s.split(';').map(function(x){x=x.trim();var m=x.match(/^(\w+)\s*(\+=|-=|\*=|=)\s*(.+)$/);return m?{v:m[1],op:m[2],x:m[3].trim()}:null}).filter(Boolean); }
function parse(src){
  var N={}, order=[], cur=null, pov='wei', lastChoice=null;
  src.split('\n').forEach(function(raw,ln){
    var l=raw.trim(); if(!l||l.slice(0,2)==='//') return;
    if(l.slice(0,3)==='== '){ var id=l.slice(3).trim(); cur=N[id]=[]; order.push(id); lastChoice=null; return; }
    var tag=null, m=l.match(/^\[(A|B|R|N)\]\s*/); if(m){tag=m[1]; l=l.slice(m[0].length);}
    var camp='A';
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
function fresh(camp,replay){ var v={}; (window.VARS||[]).forEach(function(k){v[k]=0}); Object.assign(v,{rh:0,adapt:1,partner:''});
  return {camp:'A',replay:!!replay,node:'c1_start',idx:0,cur:0,chap:'',vars:v,
  stats:{timed:0,timeouts:0,fast:0,rtSum:0,choices:0,rhythm:0,rhyHit:0,games:0,gameWin:0},seen:{},scene:{},hud:'none',hist:[]}; }
function evalx(e){ try{ var v=S.vars; return Function('v','with(v){return ('+e+')}')(new Proxy(v,{has:function(){return true},get:function(o,k){return k===Symbol.unscopables?undefined:(k in o?o[k]:(typeof window[k]!=='undefined'&&!/^[a-z]/.test(k)?window[k]:0))}}));}catch(err){console.warn('expr',e,err);return false} }
function applyFx(list){ (list||[]).forEach(function(f){ var v=S.vars, x=isNaN(+f.x)?(f.x.charAt(0)==="'"?f.x.slice(1,-1):evalx(f.x)):+f.x;
  if(f.op==='=') v[f.v]=x; else if(f.op==='+=') v[f.v]=(+v[f.v]||0)+x; else if(f.op==='-=') v[f.v]=(+v[f.v]||0)-x; else v[f.v]=(+v[f.v]||0)*x;
  });
  hud(); }

/* ---------- 畫面層 ---------- */
var bgs=[$('#bg0'),$('#bg1')], bgi=0, look={x:0,y:0,tx:0,ty:0,fx:0,drag:null,mx:0,my:0};
var stageEl=$('#stage');
// 背景尺寸完全交給 CSS（cover + 12% 視差餘裕），這裡只讀實際大小算可移動範圍
function bgSize(){ var b=bgs[0]; return [b.offsetWidth||innerWidth*1.12, b.offsetHeight||innerHeight*1.12]; }
// 預載＋解碼完成才換圖，避免半張圖
var IMGC={}; function preload(n){ if(!n) return Promise.resolve(); if(IMGC[n]) return IMGC[n]; var im=new Image();
  IMGC[n]=new Promise(function(r){ im.onload=function(){ (im.decode?im.decode().catch(function(){}):Promise.resolve()).then(function(){r(true)}); }; im.onerror=function(){ console.error('img missing',n); r(false); }; });
  im.src='img/'+n+'.webp'; IMGC[n].img=im; return IMGC[n]; }
function ready(n,ms){ return Promise.race([preload(n), new Promise(function(r){setTimeout(r,ms||4000)})]); }
// 進入節點時，先預載這個節點和它可能跳去的節點裡的所有背景
var NBG={}; function nodeBgs(n){ if(NBG[n]) return NBG[n]; var out=[]; (N[n]||[]).forEach(function(op){ if(op.k==='scene'&&op.a.bg) out.push(op.a.bg); }); return NBG[n]=out; }
function nodeVids(n){ var out=[]; (N[n]||[]).forEach(function(op){ if(op.k==='scene'&&op.a.vid) out.push(op.a.vid); }); return out; }
function nodeNext(n){ var out=[]; (N[n]||[]).forEach(function(op){ if(op.k==='go') out.push(op.s); else if(op.k==='if'){ var m=op.s.match(/->\s*(\S+)$/); if(m) out.push(m[1]); } else if(op.k==='choice') op.opts.forEach(function(o){ if(o.go) out.push(o.go); }); });
  var k=ORDER.indexOf(n); if(k>=0&&k+1<ORDER.length) out.push(ORDER[k+1]); return out; }
function prefetch(n){ nodeBgs(n).forEach(preload); nodeVids(n).forEach(vidPreload); nodeNext(n).forEach(function(m){ nodeBgs(m).slice(0,2).forEach(preload); nodeVids(m).slice(0,1).forEach(vidPreload); }); }
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
  if(e.target.closest('button,input,label,#phone,#note,.screen,#choice,#rhythm')) return; onTap(); });
addEventListener('pointercancel',function(){ down=null; look.drag=null; });
addEventListener('keydown',function(e){
  if(!$('#choice').classList.contains('hide')&&/^[1-4]$/.test(e.key)){ var b=document.querySelectorAll('#opts button')[+e.key-1]; if(b) b.click(); return; }
  if(e.key===' '||e.key==='Enter'){ if(!$('#rhythm').classList.contains('hide')){ e.preventDefault(); RH.key&&RH.key(); return; }
    if(!document.activeElement||document.activeElement.tagName!=='BUTTON'){e.preventDefault();onTap();} }
  if(e.key==='Escape'){ if(!$('#menu').classList.contains('hide')) closeMenu(); else if(S&&!S.ended&&$('#title').classList.contains('hide')&&$('#rhythm').classList.contains('hide')) openMenu(); } });
// 顆粒
(function(){ var c=$('#grain'), x=c.getContext('2d'); var GW=160, GH=90; c.width=GW; c.height=GH; var img=x.createImageData(GW,GH);
  setInterval(function(){ if(document.hidden) return; for(var i=0;i<img.data.length;i+=4){var g=Math.random()*255|0; img.data[i]=img.data[i+1]=img.data[i+2]=g; img.data[i+3]=255;} x.putImageData(img,0,0); },90); })();
var TINT={warm:'rgba(255,170,90,.35)',dusk:'rgba(255,120,60,.4)',cold:'rgba(70,120,200,.4)',night:'rgba(30,50,120,.55)',red:'rgba(220,40,30,.45)',gold:'rgba(255,200,90,.35)',grey:'rgba(120,120,120,.45)',none:'rgba(0,0,0,0)'};
var KBN=0;
function showBg(name,fx){ var nb=bgs[1-bgi], ob=bgs[bgi]; nb.style.backgroundImage='url(img/'+name+'.webp)'; nb.classList.add('on'); ob.classList.remove('on'); bgi=1-bgi;
  look.fx=(fx!=null?+fx:(FOCUS[name]||0)); look.tx=look.fx;
  var kb=$('#kb'); kb.className=''; void kb.offsetWidth; kb.className='kb'+(KBN++%4); }
/* ---------- 影片背景：靜音、inline 播一次、停在最後一格；海報＝同場景靜態圖 ---------- */
var VID=$('#vid'), VQ=(function(){ var w=Math.min(screen.width,screen.height)*(window.devicePixelRatio||1); return (Q.get('vq')|| (Math.min(innerWidth,innerHeight)<700||w<1000?'720':'1080')); })();
function vidSrc(n){ return 'vid/'+n+(VQ==='720'?'_720':'')+'.mp4'; }
var VPRE={}, VPREQ=[];
function vidPreload(n){ if(!n||VPRE[n]||Q.has('novid')) return; var v=document.createElement('video'); v.muted=true; v.preload='auto'; v.setAttribute('playsinline',''); v.src=vidSrc(n); VPRE[n]=v; VPREQ.push(n); if(VPREQ.length>3){ var o=VPREQ.shift(); try{VPRE[o].removeAttribute('src'); VPRE[o].load();}catch(e){} delete VPRE[o]; } }
function playVid(n,poster){ if(Q.has('novid')) return; window.__game.vids.push(n); VID.classList.remove('on'); VID.poster='img/'+poster+'.webp'; VID.src=vidSrc(n); VID.currentTime=0;
  VID.onplaying=function(){ VID.classList.add('on'); }; VID.onerror=function(){ console.warn('video missing',n); VID.classList.remove('on'); };
  VID.onended=function(){ window.__game.vidEnded.push(n); };   // 停在最後一格（不 loop、不清掉）
  var p=VID.play(); if(p&&p.catch) p.catch(function(){ VID.classList.remove('on'); }); }
function stopVid(){ VID.classList.remove('on'); VID.onplaying=VID.onended=VID.onerror=null; try{ VID.pause(); }catch(e){} }
/* ---------- 天氣／粒子層 ---------- */
var WX={type:'none',p:[],cv:$('#wx')};
function setWx(t){ WX.type=t||'none'; WX.p=[]; }
(function(){ var c=WX.cv, x=c.getContext('2d'), last=performance.now();
  function rs(){ c.width=Math.round(innerWidth*Math.min(1.5,devicePixelRatio||1)); c.height=Math.round(innerHeight*Math.min(1.5,devicePixelRatio||1)); } rs(); addEventListener('resize',rs);
  function spawn(){ var W=c.width,H=c.height,t=WX.type,r=Math.random;
    if(t==='rain') return {x:r()*W*1.2-W*.1,y:-20,vx:-W*.08,vy:H*1.6+r()*H*.5,l:H*.04+r()*H*.03,a:.25+r()*.3};
    if(t==='snow') return {x:r()*W,y:-10,vx:(r()-.5)*W*.03,vy:H*.08+r()*H*.08,s:1+r()*2.5,a:.5+r()*.4};
    if(t==='dust') return {x:r()*W,y:r()*H,vx:(r()-.3)*W*.012,vy:-(r()*H*.01),s:.8+r()*1.8,a:0,life:0,max:4+r()*5};
    if(t==='smoke') return {x:r()*W,y:H+40,vx:(r()-.5)*W*.02,vy:-(H*.03+r()*H*.04),s:W*.06+r()*W*.08,a:0,life:0,max:7+r()*6};
    if(t==='sparks') return {x:W*(.2+r()*.6),y:H*(.6+r()*.4),vx:(r()-.5)*W*.25,vy:-(H*.3+r()*H*.5),s:1+r()*1.6,a:1,life:0,max:.8+r()*1.2,g:H*.9};
    if(t==='lights') return {x:r()*W,y:H*(.35+r()*.6),vx:(r()-.5)*W*.004,vy:0,s:W*.006+r()*W*.02,a:0,life:0,max:5+r()*6,h:[30,45,200,0,330][r()*5|0]};
    return null; }
  var CAP={rain:220,snow:120,dust:70,smoke:26,sparks:60,lights:40};
  function f(t){ var dt=Math.min(.05,(t-last)/1000); last=t; var W=c.width,H=c.height; x.clearRect(0,0,W,H); var ty=WX.type;
    if(ty!=='none'&&!document.hidden&&!PAUSED){ var cap=CAP[ty]||0; var add=ty==='rain'?8:ty==='sparks'?(Math.random()<.25?6:0):1; for(var i=0;i<add&&WX.p.length<cap;i++){ var q=spawn(); if(q) WX.p.push(q); } }
    var keep=[]; for(var k=0;k<WX.p.length;k++){ var p=WX.p[k]; if(!PAUSED){ p.x+=p.vx*dt; p.y+=p.vy*dt; if(p.g) p.vy+=p.g*dt; if(p.max){ p.life+=dt; } }
      if(p.y>H+60||p.y<-200||p.x<-200||p.x>W+200||(p.max&&p.life>p.max)) continue; keep.push(p);
      if(ty==='rain'){ x.strokeStyle='rgba(200,215,235,'+p.a+')'; x.lineWidth=1.2; x.beginPath(); x.moveTo(p.x,p.y); x.lineTo(p.x+p.vx*.025,p.y-p.l); x.stroke(); }
      else if(ty==='snow'){ x.fillStyle='rgba(255,255,255,'+p.a+')'; x.beginPath(); x.arc(p.x,p.y,p.s,0,7); x.fill(); }
      else { var lf=p.max?Math.sin(Math.PI*Math.min(1,p.life/p.max)):1;
        if(ty==='dust'){ x.fillStyle='rgba(255,235,200,'+(.45*lf)+')'; x.beginPath(); x.arc(p.x,p.y,p.s,0,7); x.fill(); }
        else if(ty==='smoke'){ var g=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s); g.addColorStop(0,'rgba(190,190,190,'+(.10*lf)+')'); g.addColorStop(1,'rgba(190,190,190,0)'); x.fillStyle=g; x.beginPath(); x.arc(p.x,p.y,p.s,0,7); x.fill(); }
        else if(ty==='sparks'){ x.fillStyle='rgba(255,'+(170+Math.random()*60|0)+',80,'+(1-p.life/p.max)+')'; x.fillRect(p.x,p.y,p.s*1.5,p.s*1.5); }
        else if(ty==='lights'){ var g2=x.createRadialGradient(p.x,p.y,0,p.x,p.y,p.s); g2.addColorStop(0,'hsla('+p.h+',90%,70%,'+(.35*lf)+')'); g2.addColorStop(1,'hsla('+p.h+',90%,70%,0)'); x.fillStyle=g2; x.beginPath(); x.arc(p.x,p.y,p.s,0,7); x.fill(); } } }
    WX.p=keep; requestAnimationFrame(f); }
  requestAnimationFrame(f); })();
/* ---------- 打擊特效：白閃、震動、慢動作 ---------- */
function hitFx(big){ var h=$('#hitf'); h.className=''; void h.offsetWidth; h.className=big?'big':'on'; stageEl.classList.remove('jolt'); void stageEl.offsetWidth; stageEl.classList.add('jolt'); AU.sfx('punch'); setTimeout(function(){stageEl.classList.remove('jolt')},420); }
async function slowmo(ms){ stageEl.classList.add('slowmo'); AU.sfx('whoosh'); if(VID&&VID.classList.contains('on')) VID.playbackRate=.35; await psleep(ms||1600); stageEl.classList.remove('slowmo'); if(VID) VID.playbackRate=1; }
function setScene(a){ var sc=S.scene; var ch=false;
  if(a.bg&&a.bg!==sc.bg){ ch=true; sc.bg=a.bg; showBg(a.bg,a.fx); if(!a.vid){ stopVid(); sc.vid=''; } }
  if(a.vid&&a.vid!==sc.vid){ sc.vid=a.vid; playVid(a.vid,a.bg||sc.bg); }
  if(a.wx!=null){ sc.wx=a.wx; setWx(a.wx); } else if(ch&&!a.keepwx){ sc.wx='none'; setWx('none'); }
  if(a.time!=null){ sc.time=a.time; $('#clock').textContent=a.time; }
  if(a.tint){ sc.tint=a.tint; $('#tint').style.background=TINT[a.tint]||a.tint; }
  if(a.bgm){ sc.bgm=a.bgm; AU.music(a.bgm); }
  if(a.amb){ sc.amb=a.amb; AU.amb(a.amb); }
  return ch; }
function hud(){ if(!S) return; var v=S.vars, m=S.hud, t='';
  if(m==='age') t=(S.chap||'');
  else if(m==='nego') t='籌碼 '+'■'.repeat(Math.max(0,v.rh))+'□'.repeat(Math.max(0,(v.negoN||0)-v.rh));
  var el=$('#money'); if(el.textContent!==t){ el.textContent=t; el.classList.add('flash'); setTimeout(function(){el.classList.remove('flash')},350);} }
function fmt(n){ n=+n||0; return n>=100?Math.round(n).toLocaleString():(Math.round(n*100)/100).toString(); }
function chipStyle(el,spk,emo,size){ var c=CAST[spk]; if(!c||!c.img){ el.style.backgroundImage='none'; el.style.display='none'; return; }
  el.style.display='inline-block'; el.style.backgroundImage='url(img/'+c.img+'.webp)'; el.style.backgroundSize='cover'; el.style.backgroundPosition='50% '+(c.fy||'28%'); }
function nameOf(spk){ var c=CAST[spk]; if(!c) return ''; return c.n; }

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

/* ==== 雲公子：已讀快轉／選過記號（只用 snw1_readlines、snw1_picked 兩個新 key） ==== */
function hkey(s){ var h=5381; for(var i=0;i<s.length;i++) h=((h*33)^s.charCodeAt(i))>>>0; return h.toString(36); }
var READ=LS.get('readlines',{}), READN=0, PICKED=LS.get('picked',{}), SKIP=false, CTRL=false;
function flushRead(){ LS.set('readlines',READ); }
function markRead(k){ if(!READ[k]){ READ[k]=1; if(++READN%15===0) flushRead(); } }
function setSkip(on){ SKIP=!!on; var b=document.getElementById('skipBtn'); if(b) b.classList.toggle('on',SKIP); }
function skipping(){ return SKIP||CTRL; }
addEventListener('keydown',function(e){ if(e.key==='Control') CTRL=true; });
addEventListener('keyup',function(e){ if(e.key==='Control') CTRL=false; });
addEventListener('blur',function(){ CTRL=false; });
addEventListener('pagehide',flushRead);
/* ==== 雲公子：限時規則——只有打鬥／危急題計時，情感／關係題一律不計時（作者可寫 keep=1 強制保留） ==== */
var T_ACT=/[打拳刀槍棍衝撲躲閃踢砸逃追擋撞砍扣扭摔跳翻抓攻殺掌踹揮推拔奪劈射]|開槍|子彈|著火|火場|救人|快跑|爆炸|車子|煞車|欄杆|倒下|來不及|危險|動手/;
var T_EMO=/[爸媽哭抱愛謝吻淚]|喜歡|對不起|道歉|原諒|電話|召令|告白|心裡|回答|告訴|說出|承認|答應|留下|離開|結婚|婚|家|兄弟|朋友|師父|名字|跪|墓|信|想起|無辜/;
function timedOK(op){ var st=(op.a&&op.a.t)||'calm'; if(st==='calm'||st==='0') return false; if(op.game||op.a.keep) return true;
  var p=op.prompt||'', ot=op.opts.map(function(o){return o.text}).join(' ');
  if(T_EMO.test(p)) return false; if(T_ACT.test(p)) return true;
  return st==='high'&&!T_EMO.test(ot)&&op.opts.filter(function(o){return T_ACT.test(o.text)}).length>=Math.max(2,op.opts.length-1); }
/* ==== 雲公子：章節路線卡 ==== */
var RLAB={bro:'兄弟情',dad:'爸爸線',mom:'媽媽',uncle:'舅舅',heart:'仁心',rage:'怒氣',yama:'殺氣',wu:'武力',fame:'名聲',power:'勢力',revenge:'仇恨',coward:'退縮',jing:'靜怡',jiao:'嬌嬌',qian:'千月',ryq:'雨晴',miao:'雪雁',hx:'懷香',yq:'師父',lang:'豺狼',xiong:'熊子',lele:'樂樂',liu:'劉鑫',lian:'陳小練',recog:'認出爸爸'};
function endCount(){ var got=LS.get('end',{}); return ENDINGS.filter(function(e){return got[e.id]}).length; }
async function routeCard(){ var cs=S.chapStart; if(!cs||!S.chap) return; var v=S.vars, d=[];
  Object.keys(RLAB).forEach(function(k){ var x=(+v[k]||0)-(+cs.vars[k]||0); if(x) d.push([k,x]); });
  d.sort(function(a,b){return Math.abs(b[1])-Math.abs(a[1])}); d=d.slice(0,4);
  var picks=S.hist.slice(cs.h).map(function(h){ return h.split('→').slice(1).join('→'); }).filter(Boolean).slice(-3);
  var el=$('#route'); $('#rChap').textContent=S.chap+'　完';
  $('#rStats').innerHTML=d.map(function(x){ return '<span class="'+(x[1]>0?'up':'dn')+'">'+RLAB[x[0]]+(x[1]>0?' ↑':' ↓')+'</span>'; }).join('')||'<span>沒有明顯的變化</span>';
  var ul=$('#rPicks'); ul.innerHTML=''; picks.forEach(function(t){ var li=document.createElement('li'); li.textContent=t; ul.appendChild(li); });
  $('#rEnd').textContent='結局 '+endCount()+' / '+ENDINGS.length+' 已解鎖';
  $('#sub').classList.add('hide'); el.classList.remove('hide'); lineShown=performance.now(); flushRead();
  var un=onCancel(function(){ el.classList.add('hide'); });
  await waitTapOr(AUTO?1200:6000); un(); el.classList.add('hide'); }
/* ==== 雲公子：最接近的未解鎖結局 ==== */
var EKEY={canon:['dad',75],dadwake:['dad',75],halfwake:['dad',60],meng:['power',15],bro:['bro',20],jiao:['jiao',12],jing:['jing',12],qian:['qian',20],jail:['yama',6],lone:['rage',15],small:['mom',6],drift:['qian',6],yama2:['yama',12],revenge:['revenge',5],coward:['coward',3],knife:['knife',1],lesson:['yq',8],ruin:['kill_dad',1]};
function nearestHint(cur){ var got=LS.get('end',{}), v=S.vars, best=null;
  ENDINGS.forEach(function(e,i){ if(got[e.id]||e.id===cur) return; var k=EKEY[e.id], sc=k?Math.min(1,Math.max(0,(+v[k[0]]||0)/k[1])):0; sc+=(e.good?.05:0)-i*.001; if(!best||sc>best.sc) best={e:e,sc:sc}; });
  if(!best) return '全部 '+ENDINGS.length+' 個結局都解鎖了。';
  var e=best.e; if(e.hidden) return '<b>離你最近的未解鎖結局</b>？？？　（隱藏）';
  var d=document.createElement('div'); d.textContent=e.hint||''; return '<b>離你最近的未解鎖結局</b>「'+e.name.replace(/[<>&]/g,'')+'」<br>'+d.innerHTML; }

/* ---------- 台詞 ---------- */
var introTimer=null;
async function say(op){
  var sub=$('#sub'), txt=$('#txt'), who=$('#whoName'), chip=$('#chip'), my=running;
  sub.classList.remove('hide'); sub.classList.toggle('nosub',!SET.sub);
  var spk=op.spk, isSelf=(op.think)||/^wei/.test(spk);
  if(op.think||!spk){ who.textContent=''; chip.style.display='none'; }
  else { who.textContent=nameOf(spk); chipStyle(chip,spk,op.emo,34); }
  txt.className=op.think?'think':''; txt.textContent=op.think?'（'+op.text+'）':op.text;
  void txt.offsetWidth; txt.classList.add('on'); lineShown=performance.now();
  if(spk&&!op.think&&!isSelf&&CAST[spk]&&!S.seen[spk]){ S.seen[spk]=1; showIntro(spk); }
  var key=op.vp+'|'+op.emo+'|'+op.text, vd=VOICE[key], len=op.text.length;
  var base=Math.max(1200,400+len*160);   // 無語音／關語音／語音失敗：約每秒 6 字（💛 11:0x），語音播完後仍只等 0.3 秒
  var rk=hkey(key), wasRead=!!READ[rk]; markRead(rk);
  if(skipping()){ if(wasRead){ window.__game.lines.push({key:key,t:performance.now(),has:!!vd,skip:1}); await sleep(60); if(my!==running) return; tapWait=null; txt.classList.remove('on'); return; } setSkip(false); CTRL=false; }   // 快轉遇到沒讀過的句子就停
  window.__game.lines.push({key:key,t:performance.now(),has:!!vd});
  if((!AUTO||AUTOVOICE)&&vd&&SET.voice>0){
    var r=await Promise.race([AU.voice(vd), waitTapOr(null).then(function(){return 'tap'})]);
    if(my!==running) return;
    window.__game.lines[window.__game.lines.length-1].r=r;
    if(r==='tap') AU.stopVoice();
    else if(r==='fail'){ await waitTapOr(SET.auto||AUTO?Math.max(base,vd[1]*1000+300):null); }
    else { await waitTapOr(SET.auto||AUTO?300:null); }   // 語音真的播完（ended）之後再停 0.3 秒
  } else { await waitTapOr(SET.auto||AUTO?base:null); }
  if(my!==running) return;
  tapWait=null; txt.classList.remove('on'); await sleep(140);
}
function showIntro(spk){ var c=CAST[spk], el=$('#intro'); clearTimeout(introTimer); el.classList.remove('hide','out');
  chipStyle($('#introFace'),spk,'n',Math.min(innerHeight*.22,120)); $('#introName').textContent=nameOf(spk); $('#introDesc').textContent=c.d||'';
  introTimer=setTimeout(function(){ el.classList.add('out'); introTimer=setTimeout(function(){el.classList.add('hide')},800); },2400/FAST); }

/* ---------- 演出指令 ---------- */
async function blink(swap){ var st=stageEl; AU.sfx('blink'); st.classList.add('closed'); await sleep(450); if(swap) swap(); await sleep(swap?600:200); st.classList.remove('closed'); await sleep(350); }
async function card(s){ var p=s.split('|'); S.chap=(p[0]||'')+(p[1]?'　'+p[1]:''); $('#cardA').textContent=p[0]||''; $('#cardB').textContent=p[1]||''; var c=$('#card'); c.classList.remove('hide'); AU.sfx('page');
  $('#sub').classList.add('hide'); lineShown=performance.now(); await waitTapOr(3600); c.classList.add('hide'); }
async function phone(s){ var p=s.split('|').map(function(x){return x.trim()}); $('#phTitle').textContent=p.shift(); var b=$('#phBody'); b.innerHTML='';
  p.forEach(function(r){ var d=document.createElement('div');
    if(r.charAt(0)==='#'){ d.className='big '+(/▼|-/.test(r)?'dn':'up'); d.textContent=r.slice(1); }
    else if(/^>/.test(r)){ d.className='msg me'; d.textContent=r.slice(1); }
    else if(/^[^：:]{1,8}[：:]/.test(r)&&!/[▲▼]/.test(r)){ var i=r.search(/[：:]/); d.className='msg'; d.innerHTML='<b></b><span></span>'; d.firstChild.textContent=r.slice(0,i); d.lastChild.textContent=r.slice(i+1); }
    else if(/[▲▼]/.test(r)){ var cols=r.split(/\s{2,}|\t/); d.className='row '+(/▼/.test(r)?'dn':'up'); cols.forEach(function(c){var s=document.createElement('span');s.textContent=c;d.appendChild(s)}); }
    else { d.className='txt'; d.textContent=r; }
    b.appendChild(d); });
  b.scrollTop=0; $('#sub').classList.add('hide'); $('#phone').classList.remove('hide'); AU.sfx('buzz');
  await new Promise(function(res){ var btn=$('#phDown'), t0=performance.now(), un; function c(){ if(performance.now()-t0<350&&!AUTO) return; btn.removeEventListener('click',c); un(); res(); } un=onCancel(function(){ btn.removeEventListener('click',c); res(); }); btn.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); });
  $('#phone').classList.add('hide'); AU.sfx('whoosh'); }
async function note(s){ $('#noteTxt').textContent=s.replace(/\\n/g,'\n'); var n=$('#note'); n.classList.remove('hide'); AU.sfx('page'); $('#sub').classList.add('hide');
  await new Promise(function(res){ var t0=performance.now(), un; function c(){ if(performance.now()-t0<350&&!AUTO) return; n.removeEventListener('click',c); un(); res(); } un=onCancel(function(){ n.removeEventListener('click',c); res(); }); n.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); });
  n.classList.add('hide'); }

/* ---------- 節奏挑戰：外圈縮到內圈時點擊，±150ms 才算準 ---------- */
var RH={key:null,restart:false};
function needOf(){ var nx=N[S.node][S.idx]; if(nx&&nx.k==='if'){ var mm=nx.s.match(/rh\s*>=\s*(\d+)/); if(mm) return +mm[1]; } return 0; }
function adaptK(){ return Math.max(.7,Math.min(1.45,+S.vars.adapt||1)); }
async function rhythm(s,drum){ var m=s.match(/^(\d+)\s*(.*)$/), n=+(m?m[1]:6), label=m?m[2]:s;
  var iv=Math.round(800*(drum?.85:1)), W=Math.round(150*adaptK()); /* 博哥：第二輪不再收緊（原 replay 650/110） */
  var need=needOf();
  var el=$('#rhythm'), core=$('#rcore'), sh=$('#rshrink'), fb=$('#rfb'), sc=$('#rscore'), dots=$('#rdots');
  $('#rlabel').textContent=label; $('#rhelp').textContent='外圈縮到和內圈重疊的瞬間點一下（或按空白鍵）'+(need?'　目標 ≥ '+need+' 拍':'');
  dots.innerHTML=''; for(var i=0;i<n;i++) dots.appendChild(document.createElement('i'));
  $('#sub').classList.add('hide'); $('#menuBtn').classList.add('hide'); $('#intro').classList.add('hide'); el.classList.remove('hide'); fb.textContent=''; fb.className='';
  var t0, judged, hits, extra, done=false, rest=0;
  function reset(){ t0=performance.now()+2400; judged=[]; for(var i=0;i<n;i++) judged.push(0); hits=0; extra=0; Array.prototype.forEach.call(dots.children,function(d){d.className=''}); upd();
    for(var k=0;k<n;k++) AU.sfx(drum?'drum':'beat',(t0+k*iv-performance.now())/1000); }
  function flash(t,cls){ fb.textContent=t; fb.className=cls; void fb.offsetWidth; fb.className=cls+' pop'; }
  function mark(k,v){ judged[k]=v; dots.children[k].className=v>0?'h':'m'; }
  function upd(){ sc.textContent='命中 '+hits+' / '+n+(extra?'　多按 '+extra+'（扣分）':''); }
  function tap(){ if(done) return; var now=performance.now(); if(now<t0-iv*.6){ flash('還沒開始','bad'); return; }
    var k=Math.max(0,Math.min(n-1,Math.round((now-t0)/iv))), dt=now-(t0+k*iv);
    if(judged[k]===0&&Math.abs(dt)<=W){ mark(k,1); hits++; flash(Math.abs(dt)<=W*.45?'完美！':'準！','ok'); core.className='hit'; AU.sfx(drum?'gong':'hit'); }
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
    await bogeTrans(function(){ return psleep(1400); }); } /* 博哥：結算可點掉 */
  el.onpointerdown=null; RH.key=null; el.classList.add('hide'); $('#menuBtn').classList.remove('hide');
  S.vars.rh=rh; S.stats.rhythm+=n; S.stats.rhyHit+=rh; S.stats.games++; if(!need||rh>=need) S.stats.gameWin++; }

/* ---------- 小遊戲 ---------- */
// 共用外框：#game 疊在畫面上，結果寫進 S.vars.rh，下一行的 `! if rh>=N` 就是過關門檻
function gameShell(title,help){ var g=$('#game'); g.className=''; g.innerHTML='<div class="gTitle"></div><div class="gHelp"></div><div class="gArena"></div><div class="gFb"></div><div class="gScore"></div><div class="gPad"></div>';
  g.querySelector('.gTitle').textContent=title; g.querySelector('.gHelp').textContent=help; $('#sub').classList.add('hide'); $('#menuBtn').classList.add('hide'); $('#intro').classList.add('hide'); g.classList.remove('hide');
  return {g:g,arena:g.querySelector('.gArena'),fb:g.querySelector('.gFb'),sc:g.querySelector('.gScore'),pad:g.querySelector('.gPad'),
    flash:function(t,cls){ var f=g.querySelector('.gFb'); f.textContent=t; f.className='gFb '+cls; void f.offsetWidth; f.className='gFb '+cls+' pop'; }}; }
async function gameEnd(G,score,n,need){ if($('#title').classList.contains('hide')){ G.sc.textContent='成績 '+score+' / '+n+(need?'　（目標 '+need+'）':''); G.flash(need?(score>=need?'過關！':'失手了……'):(score>=n-1?'漂亮！':'結束'),need&&score<need?'bad big':'ok big'); await psleep(1400); }
  G.g.classList.add('hide'); G.g.innerHTML=''; $('#menuBtn').classList.remove('hide'); S.vars.rh=score; S.stats.games++; if(!need||score>=need) S.stats.gameWin++; window.__game.games.push({node:S.node,score:score,n:n,need:need}); }
function autoScore(n){ return Math.min(n,+(Q.get('rh')||n-1)); }
// 打架：畫面中央出現方向，縮圈到位時按對應方向（方向鍵／WASD／按鈕／滑動）
async function gFight(n,label){ var need=needOf(), G=gameShell(label||'打','看箭頭！外圈縮到位時按同一個方向（方向鍵、滑動或按下面的鈕）'+(need?'　目標 ≥ '+need:''));
  var DIR=['←','↑','→','↓'], win=Math.round(650*adaptK()), gap=1100; /* 博哥：第二輪不再收緊（原 replay 520/900） */
  G.arena.innerHTML='<div class="fRing"><b></b><i></i></div>'; var ring=G.arena.firstChild, arr=ring.firstChild, sh=ring.lastChild;
  DIR.forEach(function(d,i){ var b=document.createElement('button'); b.textContent=d; b.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); press(i); }; G.pad.appendChild(b); });
  var score=0, k=-1, cur=-1, tHit=0, judged=true, done=false, sx=0, sy=0, un;
  function press(i){ if(done||judged||cur<0) return; var dt=performance.now()-tHit; judged=true;
    if(i===cur&&Math.abs(dt)<=win){ score++; hitFx(score%3===0); G.flash(Math.abs(dt)<win*.4?'重擊！':'打中！','ok'); }
    else { AU.sfx('miss'); stageEl.classList.add('jolt'); setTimeout(function(){stageEl.classList.remove('jolt')},300); G.flash(i!==cur?'方向錯了':'太早','bad'); }
    G.sc.textContent='命中 '+score+' / '+n; }
  function kd(e){ var m={ArrowLeft:0,a:0,A:0,ArrowUp:1,w:1,W:1,ArrowRight:2,d:2,D:2,ArrowDown:3,s:3,S:3}[e.key]; if(m!=null){ e.preventDefault(); press(m); } }
  function ps(e){ sx=e.clientX; sy=e.clientY; } function pe(e){ var dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)+Math.abs(dy)<40) return; press(Math.abs(dx)>Math.abs(dy)?(dx<0?0:2):(dy<0?1:3)); }
  addEventListener('keydown',kd,true); G.arena.addEventListener('pointerdown',ps); G.arena.addEventListener('pointerup',pe);
  G.sc.textContent='命中 0 / '+n; await psleep(900);
  await new Promise(function(res){ un=onCancel(function(){ done=true; res(); });
    (async function loop(){ for(k=0;k<n&&!done;k++){ cur=Math.floor(rnd()*4); arr.textContent=DIR[cur]; tHit=performance.now()+gap; judged=false; ring.className='fRing go';
        sh.style.animation='none'; void sh.offsetWidth; sh.style.animation='fShrink '+(gap/1000/FAST)+'s linear forwards';
        if(AUTO){ (function(kk,c){ setTimeout(function(){ if(kk<autoScore(n)) press(c); else press((c+1)%4); },gap/FAST); })(k,cur); }
        await psleep(gap+win); if(!judged){ judged=true; G.flash('被打中了','bad'); AU.sfx('punch'); stageEl.classList.add('jolt'); setTimeout(function(){stageEl.classList.remove('jolt')},300); }
        ring.className='fRing'; await psleep(250); }
      done=true; un(); res(); })(); });
  removeEventListener('keydown',kd,true); await gameEnd(G,score,n,need); }
// 樁步：重心會亂飄，按住左右把它拉回中間的綠區；成績＝站穩的秒數
async function gStance(n,label){ var need=needOf(), G=gameShell(label||'站樁','重心會亂飄。按住 ◀ ▶（或方向鍵）把白點拉回綠區，撐住 '+n+' 秒'+(need?'　目標 ≥ '+need+' 秒':''));
  G.arena.innerHTML='<div class="sBar"><div class="sZone"></div><div class="sDot"></div></div><div class="sTime"></div>'; var dot=G.arena.querySelector('.sDot'), zone=G.arena.querySelector('.sZone'), tm=G.arena.querySelector('.sTime');
  var zw=Math.max(.16,Math.min(.34,.24/adaptK())); /* 博哥：第二輪不再收緊（原 replay ×.85） */ zone.style.left=(50-zw*50)+'%'; zone.style.width=(zw*100)+'%';
  var hold=0, x=0, v=0, inT=0, el=0, done=false;
  ['◀','▶'].forEach(function(d,i){ var b=document.createElement('button'); b.textContent=d; b.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); hold=i?1:-1; }; b.onpointerup=b.onpointerleave=function(){ hold=0; }; G.pad.appendChild(b); });
  function kd(e){ if(e.key==='ArrowLeft'||e.key==='a'){hold=-1;e.preventDefault();} if(e.key==='ArrowRight'||e.key==='d'){hold=1;e.preventDefault();} } function ku(e){ if(/Arrow(Left|Right)|^[ad]$/.test(e.key)) hold=0; }
  addEventListener('keydown',kd,true); addEventListener('keyup',ku,true);
  var push=0, nextPush=0, autoGood=autoScore(n)/n;
  await new Promise(function(res){ var last=performance.now(), un=onCancel(function(){ done=true; res(); });
    (function loop(){ if(done) return; var now=performance.now(), dt=Math.min(.05,(now-last)/1000)*FAST; last=now;
      if(!PAUSED){ el+=dt; if(el>nextPush){ push=(rnd()*2-1)*(1.1+el/n*.9); nextPush=el+.6+rnd()*1.1; }
        if(AUTO){ hold=(rnd()<autoGood)?(x>0.02?-1:x<-0.02?1:0):(push>0?1:-1); }
        v+=(push*.9+hold*2.4-x*.4)*dt; v*=Math.pow(.25,dt); x=Math.max(-1,Math.min(1,x+v*dt*1.6));
        if(Math.abs(x)<=zw){ inT+=dt; dot.className='sDot ok'; } else dot.className='sDot';
        dot.style.left=(50+x*48)+'%'; tm.textContent='站穩 '+inT.toFixed(1)+' 秒　剩 '+Math.max(0,n-el).toFixed(1)+' 秒';
        if(el>=n){ done=true; un(); res(); return; } }
      requestAnimationFrame(loop); })(); });
  removeEventListener('keydown',kd,true); removeEventListener('keyup',ku,true); await gameEnd(G,Math.round(inT),n,need); }
// 機車追逐：三線道，障礙物衝過來，左右換線閃開
async function gChase(n,label){ var need=needOf(), G=gameShell(label||'追','左右換車道閃開（◀ ▶、方向鍵或點畫面左右半邊）'+(need?'　目標 ≥ '+need:''));
  G.arena.innerHTML='<div class="cRoad"><i></i><i></i><i></i><div class="cMe">🛵</div></div>'; var road=G.arena.firstChild, me=road.querySelector('.cMe');
  var lane=1, score=0, done=false, obs=[], spawned=0, nextT=0, el=0, spd=1/adaptK()*.55; /* 博哥：第二輪不再收緊（原 replay ×1.25） */
  function mv(d){ lane=Math.max(0,Math.min(2,lane+d)); me.style.left=(lane*33.3+16.65)+'%'; AU.sfx('whoosh'); }
  ['◀','▶'].forEach(function(d,i){ var b=document.createElement('button'); b.textContent=d; b.onpointerdown=function(e){ e.preventDefault(); e.stopPropagation(); mv(i?1:-1); }; G.pad.appendChild(b); });
  road.onpointerdown=function(e){ e.stopPropagation(); var r=road.getBoundingClientRect(); mv(e.clientX<r.left+r.width/2?-1:1); };
  function kd(e){ if(e.key==='ArrowLeft'||e.key==='a'){mv(-1);e.preventDefault();} if(e.key==='ArrowRight'||e.key==='d'){mv(1);e.preventDefault();} }
  addEventListener('keydown',kd,true); mv(0); G.sc.textContent='閃過 0 / '+n;
  await new Promise(function(res){ var last=performance.now(), un=onCancel(function(){ done=true; res(); });
    (function loop(){ if(done) return; var now=performance.now(), dt=Math.min(.05,(now-last)/1000)*FAST; last=now;
      if(!PAUSED){ el+=dt;
        if(spawned<n&&el>=nextT){ var L=Math.floor(rnd()*3), d=document.createElement('div'); d.className='cOb'; d.textContent=['🚗','🚧','🛻','🚚'][spawned%4]; d.style.left=(L*33.3+16.65)+'%'; road.appendChild(d); obs.push({L:L,y:-.1,el:d,ok:rnd()<(autoScore(n)/n)}); spawned++; nextT=el+1.05*adaptK(); } /* 博哥：原 replay .85 */
        obs.forEach(function(o){ o.y+=dt*spd; o.el.style.top=(o.y*100)+'%';
          if(AUTO&&!o.ai&&o.y>.55){ o.ai=1; if(o.ok&&o.L===lane) mv(lane===0?1:-1); else if(!o.ok&&o.L!==lane) mv(o.L>lane?1:-1); }
          if(!o.hit&&o.y>=.82){ o.hit=1; if(o.L===lane){ G.flash('撞上了！','bad'); hitFx(true); } else { score++; G.flash('閃過！','ok'); } G.sc.textContent='閃過 '+score+' / '+n; } });
        obs=obs.filter(function(o){ if(o.y>1.15){ o.el.remove(); return false; } return true; });
        if(spawned>=n&&!obs.length){ done=true; un(); res(); return; } }
      requestAnimationFrame(loop); })(); });
  removeEventListener('keydown',kd,true); await gameEnd(G,score,n,need); }
// 談判／會考：限時選詞，每題一個好答案；HUD 顯示籌碼
async function gWords(kind,s){ var parts=s.split('||').map(function(x){return x.trim()}), label=parts.shift(), rounds=parts.map(function(r){ var q=r.split('##').map(function(x){return x.trim()}); return {q:q[0],opts:q.slice(1)}; });
  var need=needOf(), n=rounds.length, score=0; S.vars.negoN=n; S.vars.rh=0; var oldHud=S.hud; S.hud='nego'; hud();
  for(var i=0;i<n;i++){ var r=rounds[i], opts=r.opts.map(function(t){ var good=t.charAt(0)==='+'; return {text:t.slice(1).trim(),good:good}; });
    for(var j=opts.length-1;j>0;j--){ var x=Math.floor(rnd()*(j+1)), t=opts[j]; opts[j]=opts[x]; opts[x]=t; }
    var gi=opts.findIndex(function(o){return o.good}); if(AUTO){ PICK.unshift(rnd()<autoScore(n)/n?gi:(gi+1)%opts.length); }
    var o=await choose({game:1,a:{t:String(kind==='quiz'?12:8)},prompt:(label?'【'+label+'】':'')+(kind==='quiz'?'第 '+(i+1)+' 題　':'第 '+(i+1)+' 回合　')+r.q,opts:opts.map(function(o){ return {text:o.text,fx:o.good?[{v:'rh',op:'+=',x:'1'}]:[]}; })});
    if(!o) return; var good=o.fx.length>0; if(good) score++; AU.sfx(good?'coin':'buzz'); hud(); }
  S.hud=oldHud; hud(); S.vars.rh=score; S.stats.games++; if(!need||score>=need) S.stats.gameWin++; window.__game.games.push({node:S.node,score:score,n:n,need:need,kind:kind}); }

/* ---------- 選擇（JS 計時、可暫停、0.35 秒內不收點擊、限時有數字） ---------- */
var GOAL=Q.get('goal')||''; function goalPick(opts){ var best=-1e9,bi=[]; opts.forEach(function(o,i){ var sc=0; if(o.go&&new RegExp('_'+GOAL+'$').test(o.go)) sc+=100; (o.fx||[]).forEach(function(f){ if(f.v===GOAL&&f.op==='+=') sc+=+f.x||1; if(f.v===GOAL&&f.op==='-=') sc-=+f.x||1; if(f.v==='greed') sc-=50; }); if(sc>best){best=sc;bi=[i]} else if(sc===best) bi.push(i); }); return bi[Math.floor(rnd()*bi.length)]; }
async function choose(op){
  var opts=op.opts.filter(function(o){return !o.cond||evalx(o.cond)}); if(!opts.length) return null;
  var a=op.a, st=a.t||'calm', T=0, my=running; setSkip(false);
  if(!timedOK(op)) st='calm';
  if(/^\d/.test(st)) T=+st; else if(st==='high') T=5; else if(st==='mid') T=10; else if(st==='calm') T=0; /* 博哥：第二輪不再收緊（原 calm 在 replay 變 16 秒、所有限時 ×0.72） */
  if(T) T=Math.max(3,Math.round(T*adaptK()*2)/2);
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
    un=onCancel(function(){ fin(def,false,true); });
    opts.forEach(function(o,i){ var b=document.createElement('button'); b.innerHTML='<span class="k">'+(i+1)+'</span><span class="t"></span>'; b.lastChild.textContent=o.text; o._pk=op.game?null:hkey(S.node+'|'+o.text); if(o._pk&&PICKED[o._pk]){ b.classList.add('was'); var w=document.createElement('em'); w.className='was'; w.textContent='選過'; b.appendChild(w); }
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
  await psleep(picked.timeout?700:380); if(my!==running) return null; $('#choice').classList.add('hide');
  var o=opts[picked.i]; S.stats.choices++; if(o._pk&&!picked.timeout){ PICKED[o._pk]=1; LS.set('picked',PICKED); }
  if(T){ S.stats.timed++; S.stats.rtSum+=rt; if(picked.timeout){ S.stats.timeouts++; S.vars.panic++; S.vars.adapt=Math.min(1.45,adaptK()*1.15); } else if(rt<T*.4){ S.stats.fast++; S.vars.adapt=Math.max(.7,adaptK()*.94); } }
  S.hist.push((op.prompt||'')+'→'+o.text+(picked.timeout?'（逾時）':''));
  window.__game.choices[window.__game.choices.length-1].pick={i:picked.i,timeout:picked.timeout,rt:Math.round(rt*10)/10};
  applyFx(o.fx); return o; }

/* ---------- 主迴圈 ---------- */
var running=0;
var SAVE_AT={line:1,choice:1,scene:1,title:1,phone:1,note:1,rhythm:1,game:1,nego:1,quiz:1};
function tagOK(op){ if(!op.tag) return true; if(op.tag==='A') return true; if(op.tag==='B') return false; if(op.tag==='R') return S.replay; if(op.tag==='N') return !S.replay; return true; }
async function run(node,idx){
  var my=++running; S.node=node; S.idx=idx||0; var skip=false; prefetch(node);
  while(my===running){
    var ops=N[S.node]; if(!ops){ console.error('no node',S.node); return; }
    if(S.idx>=ops.length){ var k=ORDER.indexOf(S.node); if(k<0||k+1>=ORDER.length) return; S.node=ORDER[k+1]; S.idx=0; prefetch(S.node); continue; }
    var op=ops[S.idx]; S.cur=S.idx; S.idx++;
    if(!tagOK(op)) continue; if(skip){ skip=false; continue; }
    window.__game.trace.push(S.node+':'+op.ln);
    if(SAVE_AT[op.k]) save();
    var r=await exec(op); if(my!==running) return;
    if(r==='skip') skip=true;
    else if(r&&r.go){ S.node=r.go; S.idx=0; if(!N[r.go]) console.error('missing node '+r.go); window.__game.nodes.push(r.go); prefetch(r.go); }
    else if(r==='end') return;
  } }
/* 存檔：每個視角一格，存「正在播的那一句」 */
function skey(c){ return 'save_'+c; }
function save(){ if(!S||S.ended||S.nosave) return;
  LS.set(skey(S.camp),{v:3,camp:S.camp,replay:S.replay,node:S.node,idx:S.cur,vars:S.vars,stats:S.stats,seen:S.seen,scene:S.scene,hud:S.hud,hist:S.hist,chap:S.chap,ts:Date.now()}); }
async function exec(op){ var my0=running;
  switch(op.k){
    case 'scene': var a=op.a;
      if(a.bg&&a.bg!==S.scene.bg) await ready(a.bg);
      if(a.fade==='blink'){ await blink(function(){setScene(a)}); }
      else if(a.fade==='white'||a.fade==='black'){ var fl=$('#fade'); fl.className=a.fade; await psleep(600); setScene(a); await psleep(250); fl.className=a.fade+' out'; await psleep(700); fl.className=''; }
      else if(a.fade==='cut'){ $('#cam').classList.add('cut'); setScene(a); await psleep(120); $('#cam').classList.remove('cut'); }
      else if(setScene(a)) await psleep(900); return;
    case 'line': await say(op); return;
    case 'title': await routeCard(); if(my0!==running) return; await card(op.s); S.chapStart={vars:clone(S.vars),h:S.hist.length}; return;
    case 'blink': await blink(); return;
    case 'phone': await phone(op.s); return;
    case 'note': await note(op.s); return;
    case 'set': applyFx(parseFx(op.s)); return;
    case 'hud': S.hud=op.s; $('#hud').classList.remove('hide'); hud(); return;
    case 'bgm': S.scene.bgm=op.s; AU.music(op.s); return;
    case 'amb': S.scene.amb=op.s; AU.amb(op.s); return;
    case 'sfx': AU.sfx(op.s); return;
    case 'wait': await psleep(+op.s||1000); return;
    case 'fx': if(op.s==='hit'||op.s==='bighit'){ hitFx(op.s==='bighit'); await psleep(380); return; } if(op.s==='slow'){ await slowmo(); return; }
      if(op.s==='flash'){ var fh=$('#hitf'); fh.className=''; void fh.offsetWidth; fh.className='big'; AU.sfx('crash'); return; }
      $('#pulse').classList.toggle('on',op.s==='pulse'); stageEl.classList.toggle('shake',op.s==='pulse'||op.s==='shake'); return;
    case 'rhythm': setSkip(false); await rhythm(op.s); return;
    case 'game': setSkip(false); var gw=op.s.match(/^(\w+)\s+(\d+)\s*(.*)$/); if(!gw){ console.warn('bad game',op.s); return; }
      if(gw[1]==='fight') await gFight(+gw[2],gw[3]); else if(gw[1]==='stance') await gStance(+gw[2],gw[3]); else if(gw[1]==='chase') await gChase(+gw[2],gw[3]); else if(gw[1]==='drum') await rhythm(gw[2]+' '+gw[3],true); return;
    case 'nego': await gWords('nego',op.s); return;
    case 'quiz': await gWords('quiz',op.s); return;
    case 'go': return {go:op.s};
    case 'if': var m=op.s.match(/^(.*?)\s*->\s*(\S+)$/); if(m&&evalx(m[1])) return {go:m[2]}; return;
    case 'when': return evalx(op.s)?undefined:'skip';
    case 'end': await ending(op.s); return 'end';
    case 'choice': snapChoice(); var o=await choose(op); if(o&&o.go) return {go:o.go}; return;
    default: console.warn('unknown op',op.k,op.ln); return;
  } }

/* ---------- 回到上一個選擇：每次出選項前存一份快照 ---------- */
function clone(x){ return JSON.parse(JSON.stringify(x==null?null:x)); }
function snapChoice(){ if(!S) return; S.back={node:S.node,idx:S.cur,vars:clone(S.vars),stats:clone(S.stats),seen:clone(S.seen),scene:clone(S.scene),hud:S.hud,hist:clone(S.hist),chap:S.chap,chapStart:clone(S.chapStart)}; }
function backToChoice(){ var b=S&&S.back; if(!b) return false; var camp=S.camp, rp=S.replay;
  running++; resetStage(); S=fresh(camp,rp);
  Object.assign(S,{vars:Object.assign(S.vars,clone(b.vars)),stats:Object.assign(S.stats,clone(b.stats)),seen:clone(b.seen)||{},hud:b.hud||'none',hist:clone(b.hist)||[],chap:b.chap||'',chapStart:clone(b.chapStart)||undefined});
  window.__game.ending=null; window.__game.backs=(window.__game.backs||0)+1;
  show(null); $('#hud').classList.remove('hide'); AU.unlock();
  var sc=clone(b.scene)||{}; S.scene={}; preload(sc.bg); delete sc.vid; setScene(sc); hud();
  run(b.node,b.idx||0); return true; }

/* ---------- 結局與評語 ---------- */
function bar5(n){ n=Math.max(0,Math.min(5,Math.round(n))); return '★'.repeat(n)+'☆'.repeat(5-n); }
function verdict(e){ var v=S.vars, s=S.stats; var cool=s.timed?Math.round(100*(s.timed-s.timeouts)/s.timed):100; var avg=s.timed?(s.rtSum/s.timed).toFixed(1):'—';
  var lines=['<div class="vh">評　語</div>'];
  lines.push('武力　'+bar5(v.wu/3)+'　　兄弟　'+bar5(v.bro/3));
  lines.push('名聲　'+bar5(v.fame/3)+'　　良心　'+bar5(v.heart/2));
  var rel=[]; if(v.jiao>0) rel.push('李嬌嬌 '+'♥'.repeat(Math.min(5,v.jiao))); if(v.jing>0) rel.push('孫靜怡 '+'♥'.repeat(Math.min(5,v.jing))); if(v.qian>0) rel.push('馮千月 '+'♥'.repeat(Math.min(5,v.qian)));
  if(rel.length) lines.push('心事　'+rel.join('　'));
  var fam=[]; if(v.dad>0) fam.push('爸 '+'♥'.repeat(Math.min(5,v.dad))); if(v.mom>0) fam.push('媽 '+'♥'.repeat(Math.min(5,v.mom))); if(v.uncle>0) fam.push('舅舅 '+'♥'.repeat(Math.min(5,v.uncle)));
  if(fam.length) lines.push('家人　'+fam.join('　'));
  var CP=window.COMPANION; if(CP){ var rk=('rom' in v)?v.rom:v.night_with; var cw=rk>0&&CP.vars[rk-1]?CP.vars[rk-1][1]:''; if(!cw&&!(rk===0)){ var bv=CP.min-1; CP.vars.forEach(function(p){ if((v[p[0]]||0)>bv){ bv=v[p[0]]; cw=p[1]; } }); } lines.push('陪你走到最後的人：'+(cw||CP.none)); }
  lines.push('冷靜指數　'+cool+'%　（限時抉擇 '+s.timed+' 次，逾時 '+s.timeouts+' 次，平均 '+avg+' 秒）');
  if(s.games) lines.push('小遊戲　過關 '+s.gameWin+' / '+s.games+(s.rhythm?'　節奏感 '+Math.round(100*s.rhyHit/s.rhythm)+'%':''));
  var Qt={canon:'你從羅城的木料廠門口出發，一路走到南海。國家叫你的時候，你回頭看了一眼——兄弟都在。',
    meng:'十三城的旗子插在你手上，可你最想念的，還是那個破籃球場。',bro:'刀可以收，旗可以降，兄弟的名字不能忘。',
    jiao:'從同桌吵到婚禮，她罵你一輩子，也陪你一輩子。',jing:'她一直在你身後。這一次，你回頭好好說了謝謝。',qian:'省城的雪很冷，朋友的茶很熱。',
    jail:'鐵窗外的天很小，你終於學會了等。',lone:'每一個你推開的人，都在你最需要的時候不在了。',small:'沒有傳奇，也沒有遺憾。小鎮的路燈，照著一個平凡的好人。',
    drift:'走了很遠很遠，還沒有找到回家的路。',yama2:'你變成了你最怕的那個人。',revenge:'以牙還牙，最後只剩下牙。',dadwake:'窩囊了一輩子的人，原來一直在替你擋著整個世界。',
    coward:'你忍下了每一次，連自己都不記得為什麼。',knife:'那把刀，你終於還是撿起來了。',lesson:'師父最後一課：真正的狠，是能放下。',ruin:'十年後的爛尾樓，風還是那個風，人已經不是那個人。'};
  lines.push('<div class="vq">「'+(Qt[e.id]||e.short||'')+'」</div>');
  var sc=Math.round(v.wu/4+v.bro/3+v.fame/4+v.heart/2)+(cool>=85?2:cool>=65?1:0)+(e.good?2:0)-(e.bad?2:0);
  lines.push('<div class="vh" style="margin-top:8px">總評　'+(sc>=12?'S　少年王':sc>=9?'A　一方之主':sc>=6?'B　講義氣的好漢':sc>=3?'C　還在長大':'D　被生活打趴的少年')+'</div>');
  return lines.map(function(x){return /^<div/.test(x)?x:'<div class="vr">'+x+'</div>'}).join(''); }
async function ending(id){
  var e=ENDINGS.filter(function(x){return x.id===id})[0]; if(!e){console.error('ending',id);return;}
  for(var gi=0; gi<4 && e.req && e.fall && !evalx(e.req); gi++){ id=e.fall; e=ENDINGS.filter(function(x){return x.id===id})[0]; }  // 結局條件（meta.js req/fall）
  var my=running; S.ended=true; window.__game.ending=id;
  var got=LS.get('end',{}); got[id]=got[id]||{}; got[id].A=1; LS.set('end',got); var dn=LS.get('done',{}); dn.A=1; LS.set('done',dn);
  bogeKeepSave(id); /* 博哥：結局後不刪存檔（原 LS.del），改存成「結局前最後一個選擇」 */ AU.music(e.bgm||'emo'); stopVid(); setWx('none');
  await ready(e.img); await blink(function(){ setScene({bg:e.img}); });
  await psleep(1500); if(my!==running) return;
  $('#sub').classList.add('hide'); var el=$('#ending'); el.style.backgroundImage='linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.92)),url(img/'+e.img+'.webp)';
  $('#eTag').textContent=(e.hidden?'隱藏結局':'結局')+'　'+(ENDINGS.indexOf(e)+1)+' / '+ENDINGS.length;
  $('#eName').textContent='「'+e.name+'」'; $('#eDesc').textContent=e.d||'';
  $('#eVerdict').innerHTML=verdict(e); $('#eBack').classList.toggle('hide',!S.back); $('#eNear').innerHTML=nearestHint(id); flushRead(); setSkip(false); el.classList.remove('hide'); $('#hud').classList.add('hide'); AU.sfx('coin');
  if(window.__game) window.__game.onEnd&&window.__game.onEnd(id);
}

/* ---------- 標題／選單／圖鑑／確認框 ---------- */
function show(id){ ['#title','#gallery','#menu','#ending','#confirm'].forEach(function(s){$(s).classList.add('hide')}); if(id) $(id).classList.remove('hide'); }
var campMode='new';
var CAMPN={A:'第一視角',B:'第三視角'};
function saveLabel(s){ var d=new Date(s.ts||0), two=function(n){return (n<10?'0':'')+n};
  return (s.chap||'')+(s.scene&&s.scene.time?'．'+s.scene.time:'')+(s.ts?'　（'+(d.getMonth()+1)+'/'+d.getDate()+' '+two(d.getHours())+':'+two(d.getMinutes())+' 存）':''); }
function refreshTitle(){ var a=LS.get('save_A',null); $('#bCont').classList.toggle('hide',!a); if(a) $('#bCont').innerHTML='繼續<small></small>', $('#bCont small').textContent=saveLabel(a);
  var d=LS.get('done',{}); $('#bReplay').classList.toggle('hide',!d.A);
  $('#tMain').classList.remove('hide'); $('#tCont').classList.add('hide'); }
function resetStage(){ cancelAll(); AU.stopVoice(); tapWait=null; PAUSED=false; AU.pause(false); clearTimeout(introTimer);
  ['#sub','#choice','#phone','#note','#card','#rhythm','#hud','#intro','#confirm','#menu','#ending'].forEach(function(s){$(s).classList.add('hide')});
  stopVid(); setWx('none'); $('#game').classList.add('hide'); $('#game').innerHTML=''; $('#menuBtn').classList.remove('hide'); $('#pulse').classList.remove('on'); stageEl.classList.remove('shake','closed'); AU.tense(false);
  $('#txt').classList.remove('on'); $('#txt').textContent=''; $('#clock').textContent=''; $('#money').textContent=''; $('#tint').style.background='';
  bgs.forEach(function(b){ b.classList.remove('on'); b.style.backgroundImage=''; }); look.fx=look.tx=0; }
function toTitle(){ running++; resetStage(); S=null; refreshTitle(); show('#title'); AU.music('none'); AU.amb('none'); }
function startGame(camp,replay){ running++; resetStage(); S=fresh(camp,replay); window.__game.trace=[]; window.__game.nodes=[]; window.__game.ending=null;
  show(null); $('#hud').classList.remove('hide'); S.hud='none'; hud(); AU.unlock();
  var st=Q.get('node'); if(st&&N[st]){ S.node=st; try{Object.assign(S.vars,JSON.parse(Q.get('vars')||'{}'))}catch(e){} }
  if(st&&N[st]){ var sc={}, k=ORDER.indexOf(st), c=st.charAt(0); for(var j=0;j<k;j++){ N[ORDER[j]].forEach(function(op){ if(op.k==='scene') ['bg','time','tint','bgm','amb','wx'].forEach(function(x){ if(op.a[x]!=null) sc[x]=op.a[x]; }); if(op.k==='hud') S.hud=op.s; }); }
    var f=N[st][0]; if(!(f&&f.k==='scene'&&f.a.bg)) setScene(sc); hud(); }
  save(); run(S.node,0); }
function cont(camp){ var s=LS.get(skey(camp),null); if(!s) return; running++; resetStage(); S=fresh(s.camp,s.replay);
  Object.assign(S,{vars:Object.assign(S.vars,s.vars),stats:Object.assign(S.stats,s.stats||{}),seen:s.seen||{},hud:s.hud||'none',hist:s.hist||[],chap:s.chap||''});
  show(null); $('#hud').classList.remove('hide'); AU.unlock();
  var sc=s.scene||{}; S.scene={}; preload(sc.bg); var sc2=Object.assign({},sc); delete sc2.vid; setScene(sc2); hud();
  run(s.node,s.idx||0); }
// 頁內確認框（不用 window.confirm，手機上也一致）
function ask(msg,btns){ return new Promise(function(res){ $('#cfMsg').textContent=msg; var box=$('#cfBtns'); box.innerHTML='';
  btns.forEach(function(b){ var e=document.createElement('button'); e.textContent=b[1]; if(b[2]) e.className=b[2]; e.onclick=function(ev){ ev.stopPropagation(); $('#confirm').classList.add('hide'); res(b[0]); }; box.appendChild(e); });
  $('#confirm').classList.remove('hide'); }); }
$('#tMain').addEventListener('click',async function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.dataset.a; AU.sfx('select');
  if(a==='start'||a==='replay'){ var sv=LS.get(skey('A'),null);
    if(sv){ var r=await ask('已經有一個存檔：\n'+saveLabel(sv)+'\n\n開始新的一輪會覆蓋這個存檔。',[['cont','從存檔繼續'],['new','覆蓋，重新開始','warn'],['cancel','取消']]);
      if(r==='cancel') return; if(r==='cont'){ cont('A'); return; } }
    LS.del(skey('A')); startGame('A',a==='replay'); }
  else if(a==='cont') cont('A');
  else if(a==='gallery') openGallery(); else if(a==='menu') openMenu(); });
function openGallery(){ var got=LS.get('end',{}), L=$('#gList'); L.innerHTML='';
  ENDINGS.forEach(function(e,i){ var ok=got[e.id], d=document.createElement('div'); d.className='ge'+(ok?' ok':'');
    d.innerHTML='<div class="gi"><i>'+(ok?'':'？')+'</i></div><div class="gt"><b></b><span></span></div>'; d.firstChild.style.backgroundImage='url(img/'+e.img+'.webp)';
    d.querySelector('b').textContent=(i+1)+'. '+(ok?e.name:'？？？'); if(e.hidden){ var em=document.createElement('em'); em.textContent='隱藏'; d.querySelector('b').appendChild(em);}
    d.querySelector('span').textContent=ok?e.short:e.hint; L.appendChild(d); });
  $('#gCount').textContent='已收集 '+Object.keys(got).filter(function(k){return ENDINGS.some(function(e){return e.id===k})}).length+' / '+ENDINGS.length;
  show('#gallery'); }
$('#gBack').onclick=function(){ AU.sfx('select'); show('#title'); };
var menuFrom=null;
function inGame(){ return !!S&&$('#title').classList.contains('hide')&&$('#gallery').classList.contains('hide'); }
function openMenu(){ menuFrom=inGame()?'game':'title'; $('#vVoice').value=SET.voice; $('#vMusic').value=SET.music; $('#vAmb').value=SET.amb; $('#vSub').checked=SET.sub; $('#vAuto').checked=SET.auto;
  $('#mTitle').classList.toggle('hide',menuFrom==='title'); $('#mResume').textContent=menuFrom==='title'?'返回':'繼續'; $('#menu h2').textContent=menuFrom==='title'?'設定':'暫停';
  if(menuFrom==='game'){ PAUSED=true; AU.pause(true); try{VID.pause()}catch(e){} } $('#menu').classList.remove('hide'); }
function closeMenu(){ $('#menu').classList.add('hide'); if(menuFrom==='game'){ PAUSED=false; AU.pause(false); lineShown=performance.now(); if(VID.classList.contains('on')&&!VID.ended) VID.play().catch(function(){}); } }
$('#menuBtn').addEventListener('click',function(e){e.stopPropagation(); if(!$('#rhythm').classList.contains('hide')||!$('#game').classList.contains('hide')) return; openMenu();});
['vVoice','vMusic','vAmb'].forEach(function(id){ $('#'+id).addEventListener('input',function(){ SET[{vVoice:'voice',vMusic:'music',vAmb:'amb'}[id]]=+this.value; LS.set('set',SET); AU.vol(); }); });
$('#vSub').onchange=function(){SET.sub=this.checked;LS.set('set',SET);$('#sub').classList.toggle('nosub',!SET.sub)};
$('#vAuto').onchange=function(){SET.auto=this.checked;LS.set('set',SET)};
$('#mResume').onclick=function(e){ e.stopPropagation(); AU.sfx('select'); closeMenu(); };
$('#mTitle').onclick=function(e){ e.stopPropagation(); save(); toTitle(); };
$('#eTitle').onclick=function(){ toTitle(); };
$('#skipBtn').onclick=function(e){ e.stopPropagation(); setSkip(!SKIP); if(SKIP) onTap(); };
$('#eBack').onclick=function(){ backToChoice(); };
$('#eReplay').onclick=function(){ var c=S.camp; LS.del(skey(c)); startGame(c,true); };
// 切到背景時自動暫停
document.addEventListener('visibilitychange',function(){
  if(document.hidden){ if(inGame()&&!S.ended&&!PAUSED){ PAUSED=true; AU.pause(true); window.__autoPaused=true; try{VID.pause()}catch(e){} } if(!$('#rhythm').classList.contains('hide')) RH.restart=true; }
  else if(window.__autoPaused){ window.__autoPaused=false; if($('#menu').classList.contains('hide')){ PAUSED=false; AU.pause(false); if(VID.classList.contains('on')&&!VID.ended) VID.play().catch(function(){}); } } });
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
    battle:{bpm:132,ch:[[40,52,55,59],[36,48,52,55],[38,50,53,57],[35,47,50,54]],pad:.03,arp:.035,step:.5,bass:.14,hat:.045},
    epic:{bpm:72,ch:[[38,50,57,62,65],[34,46,53,58,62],[41,53,57,60,65],[36,48,55,60,64]],pad:.055,arp:.04,step:1,bass:.1,mel:1},
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
    else if(type==='sea'){ var ps=noiseLoop(g,'lowpass',700,.5,.1); lfo(ps,.09,.08); parts.push(ps); }
    else if(type==='crowd'){ var pc=noiseLoop(g,'bandpass',800,.9,.07); lfo(pc,.3,.03); parts.push(pc); parts.push(noiseLoop(g,'bandpass',1600,1.5,.025)); }
    else if(type==='fire'){ parts.push(noiseLoop(g,'lowpass',300,.5,.06)); iv=setInterval(function(){ if(Math.random()<.5) noiseHit(g,ac.currentTime,.03,.05,2500); },150); }
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
    else if(n==='punch'){ var pp=noiseLoop(xBus,'lowpass',900,.7,0); pp.g.gain.setValueAtTime(.35,t); pp.g.gain.exponentialRampToValueAtTime(.001,t+.16); setTimeout(function(){try{pp.src.stop()}catch(e){}},300); env(xBus,'sine',90,t,.18,.4,.002); }
    else if(n==='drum'){ env(xBus,'sine',75,t,.35,.5,.002); env(xBus,'sine',110,t,.12,.25,.002); noiseHit(xBus,t,.06,.08,1200); }
    else if(n==='gong'){ env(xBus,'sine',196,t,1.2,.12,.005); env(xBus,'triangle',392*1.01,t,.8,.05,.005); }
    else if(n==='engine'){ var eo=env(xBus,'sawtooth',60,t,1.4,.06,.05); eo.frequency.linearRampToValueAtTime(140,t+1.2); }
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

/* ==================== 博哥：引擎 4 項（章節選擇／轉場可點掉／對話回顧／第二輪不收緊）====================
   全部寫成包裝（重新指定既有函式名稱），不改既有函式內部；新增的 localStorage key：snw1_chaps、snw1_backlog。
   舊存檔（v:3）格式完全不變。 */

/* ---- 博哥：轉場可點掉 ----
   轉場期間（場景換圖／fade／blink／! wait／fx hit・slow／結局前停頓／小遊戲結算）點一下或按空白鍵，剩下的等待立刻結束。 */
var TR={depth:0,skip:false,wait:[],gen:0};
function bogeTransSkip(){ if(!TR.depth||TR.skip) return false; TR.skip=true; var w=TR.wait.splice(0); w.forEach(function(r){ r(); }); window.__game.skips=(window.__game.skips||0)+1; return true; }
function bogeTransReset(){ TR.gen++; TR.depth=0; TR.skip=false; var w=TR.wait.splice(0); w.forEach(function(r){ r(); }); }
async function bogeTrans(fn){ var g=TR.gen; TR.depth++; try{ return await fn(); } finally { if(g===TR.gen){ TR.depth--; if(!TR.depth){ TR.skip=false; TR.wait=[]; } } } }
function bogeSkippable(orig){ return function(ms){ if(!TR.depth) return orig(ms); if(TR.skip) return Promise.resolve();
  return new Promise(function(r){ TR.wait.push(r); orig(ms).then(r); }); }; }
psleep=bogeSkippable(psleep); sleep=bogeSkippable(sleep);
var BOGE_TRANS_OP={scene:1,blink:1,wait:1};
var bogeExec0=exec; exec=function(op){
  if(op.k==='title') bogeChapSnap(op);   // 博哥：到章首就存章節快照
  if(BOGE_TRANS_OP[op.k]||(op.k==='fx'&&/^(hit|bighit|slow)$/.test(op.s))) return bogeTrans(function(){ return bogeExec0(op); });
  return bogeExec0(op); };
var bogeGameEnd0=gameEnd; gameEnd=function(G,score,n,need){ return bogeTrans(function(){ return bogeGameEnd0(G,score,n,need); }); };
var bogeEnding0=ending; ending=function(id){ return bogeTrans(function(){ return bogeEnding0(id); }); };
var bogeOnTap0=onTap; onTap=function(){ if(!PAUSED&&TR.depth&&!tapWait){ if(bogeTransSkip()) lastTap=performance.now(); return; } return bogeOnTap0(); };
$('#rhythm').addEventListener('pointerdown',function(){ bogeTransSkip(); },true);
addEventListener('keydown',function(e){ if(TR.depth&&(e.key===' '||e.key==='Enter')&&!$('#rhythm').classList.contains('hide')) bogeTransSkip(); },true);
// 角色介紹卡：點一下就收起（不會順便跳下一句）
$('#intro').addEventListener('pointerup',function(e){ e.stopPropagation(); down=null; look.drag=null; clearTimeout(introTimer); $('#intro').classList.add('hide'); });

/* ---- 博哥：結局後不刪存檔 ----
   結局時把存檔改成「結局前最後一個選擇」（S.back），標題的「繼續」就從那裡接著玩；沒有選擇快照就保留原存檔。 */
function bogeKeepSave(endId){ var b=S&&S.back; if(!b||!b.node) return;
  LS.set(skey(S.camp),{v:3,camp:S.camp,replay:S.replay,node:b.node,idx:b.idx||0,vars:b.vars,stats:b.stats,seen:b.seen,scene:b.scene,hud:b.hud,hist:b.hist,chap:b.chap,ts:Date.now(),afterEnd:endId}); }

/* ---- 博哥：章節選擇 ----
   每章 `! title` 執行前存一份快照（存檔同格式），key＝該章第一個節點；章節選單只開放到過的章節。 */
var CHAPS=(function(){ var out=[]; ORDER.forEach(function(n){ N[n].forEach(function(op,i){ if(op.k==='title'){ var p=op.s.split('|'); out.push({node:n,idx:i,a:(p[0]||'').trim(),b:(p[1]||'').trim()}); } }); }); return out; })();
function bogeChapSnap(op){ if(!S||S.nosave||S.ended) return; var all=LS.get('chaps',{}), p=op.s.split('|');
  all[S.node]={v:3,camp:S.camp,replay:S.replay,node:S.node,idx:S.cur,vars:clone(S.vars),stats:clone(S.stats),seen:clone(S.seen),scene:clone(S.scene),hud:S.hud,hist:clone(S.hist),chap:(p[0]||'')+(p[1]?'　'+p[1]:''),ts:Date.now()};
  LS.set('chaps',all); }
function bogeChapLabel(s){ var d=new Date(s.ts||0), two=function(n){return (n<10?'0':'')+n}; return s.ts?(d.getMonth()+1)+'/'+d.getDate()+' '+two(d.getHours())+':'+two(d.getMinutes())+' 到達':''; }
function openChapters(){ var all=LS.get('chaps',{}), L=$('#chList'); L.innerHTML='';
  CHAPS.forEach(function(c){ var s=all[c.node], b=document.createElement('button'); b.className='chI'+(s?'':' lock');
    b.innerHTML='<b></b><span></span><small></small>'; b.children[0].textContent=c.a; b.children[1].textContent=s?c.b:'？？？'; b.children[2].textContent=s?bogeChapLabel(s):'還沒到過';
    if(s) b.onclick=function(e){ e.stopPropagation(); AU.sfx('select'); bogeChapGo(c); }; else b.disabled=true;
    L.appendChild(b); });
  $('#chCount').textContent='到過 '+CHAPS.filter(function(c){return all[c.node]}).length+' / '+CHAPS.length+' 章　·　從章首開始，帶入當時的狀態';
  show(null); $('#chap').classList.remove('hide'); }
function closeChapters(){ $('#chap').classList.add('hide'); show('#title'); }
async function bogeChapGo(c){ var snap=LS.get('chaps',{})[c.node]; if(!snap) return; var sv=LS.get(skey('A'),null);
  if(sv&&!sv.afterEnd){ var r=await ask('從「'+c.a+'　'+c.b+'」開頭開始。\n\n目前的存檔：\n'+saveLabel(sv)+'\n會被覆蓋。',[['go','從這一章開始','warn'],['cancel','取消']]); if(r!=='go') return; }
  $('#chap').classList.add('hide'); bogeLogPush('sep','','—— 章節選擇：'+c.a+'　'+c.b+' ——');
  var s=clone(snap); s.ts=Date.now(); LS.set(skey('A'),s); window.__game.chapJump=c.node; cont('A'); }
$('#bChap').addEventListener('click',function(e){ e.stopPropagation(); AU.sfx('select'); openChapters(); });
$('#chBack').onclick=function(e){ e.stopPropagation(); AU.sfx('select'); closeChapters(); };
var bogeRefreshTitle0=refreshTitle; refreshTitle=function(){ bogeRefreshTitle0(); var all=LS.get('chaps',{}); $('#bChap').classList.toggle('hide',!CHAPS.some(function(c){return all[c.node]})); };
var bogeShow0=show; show=function(id){ bogeShow0(id); ['#chap','#log'].forEach(function(s){ if(s!==id) $(s).classList.add('hide'); }); };

/* ---- 博哥：對話回顧 ----
   記錄台詞／旁白／內心話／已選選項／章名，最多 200 筆（snw1_backlog），HUD「回顧」鈕或暫停選單打開；打開時遊戲暫停。 */
var BL=LS.get('backlog',[]); if(!Array.isArray(BL)) BL=[];
function bogeLogPush(kind,who,text){ BL.push([kind,who,text]); if(BL.length>200) BL.splice(0,BL.length-200); LS.set('backlog',BL); }
var bogeSay0=say; say=function(op){ var who=op.think?'':(op.spk?nameOf(op.spk):''); bogeLogPush(op.think?'think':(op.spk?'line':'nar'),who,op.text); return bogeSay0(op); };
var bogeChoose0=choose; choose=async function(op){ var o=await bogeChoose0(op); if(o) bogeLogPush('pick',op.prompt||'',o.text); return o; };
var bogeCard0=card; card=function(s){ var p=s.split('|'); bogeLogPush('sep','','—— '+(p[0]||'')+(p[1]?'　'+p[1]:'')+' ——'); return bogeCard0(s); };
var bogeStart0=startGame; startGame=function(camp,replay){ bogeTransReset(); BL=[]; LS.set('backlog',BL); return bogeStart0(camp,replay); };
var bogeCont0=cont; cont=function(camp){ bogeTransReset(); return bogeCont0(camp); };
var bogeToTitle0=toTitle; toTitle=function(){ bogeTransReset(); $('#log').classList.add('hide'); return bogeToTitle0(); };
var logFrom=null;
function openLog(){ var L=$('#logList'); L.innerHTML='';
  if(!BL.length){ var em=document.createElement('p'); em.className='tSub'; em.textContent='還沒有對話。'; L.appendChild(em); }
  BL.forEach(function(x){ var d=document.createElement('div'); d.className='lg '+x[0];
    if(x[0]==='pick'){ d.innerHTML='<span class="lq"></span><b></b>'; d.firstChild.textContent=x[1]||'選擇'; d.lastChild.textContent='▸ '+x[2]; }
    else if(x[0]==='line'){ d.innerHTML='<b></b><span></span>'; d.firstChild.textContent=x[1]; d.lastChild.textContent=x[2]; }
    else d.textContent=x[0]==='think'?'（'+x[2]+'）':x[2];
    L.appendChild(d); });
  logFrom=!$('#menu').classList.contains('hide')?'menu':(inGame()?'game':'title');
  if(logFrom==='game'&&!PAUSED){ PAUSED=true; AU.pause(true); try{VID.pause()}catch(e){} logFrom='gamePaused'; }
  $('#log').classList.remove('hide'); L.scrollTop=L.scrollHeight; window.__game.logOpen=(window.__game.logOpen||0)+1; }
function closeLog(){ $('#log').classList.add('hide');
  if(logFrom==='gamePaused'){ PAUSED=false; AU.pause(false); lineShown=performance.now(); if(VID.classList.contains('on')&&!VID.ended) VID.play().catch(function(){}); }
  logFrom=null; }
$('#logBtn').addEventListener('click',function(e){ e.stopPropagation(); if(!$('#rhythm').classList.contains('hide')||!$('#game').classList.contains('hide')) return; AU.sfx('select'); openLog(); });
$('#mLog').addEventListener('click',function(e){ e.stopPropagation(); AU.sfx('select'); openLog(); });
$('#logBack').onclick=function(e){ e.stopPropagation(); AU.sfx('select'); closeLog(); };
// 回顧開著時：Esc 關閉，其他按鍵（1–4 選項、空白鍵）不要穿透到遊戲
addEventListener('keydown',function(e){ if($('#log').classList.contains('hide')||e.key==='Control') return; e.stopImmediatePropagation(); if(e.key==='Escape'||e.key==='l'||e.key==='L') closeLog(); },true);
addEventListener('keydown',function(e){ if((e.key==='l'||e.key==='L')&&inGame()&&!S.ended&&$('#menu').classList.contains('hide')&&$('#rhythm').classList.contains('hide')&&$('#game').classList.contains('hide')) openLog(); });
/* ==================== 博哥：區塊結束 ==================== */

window.__game={get S(){return S},N:N,ORDER:ORDER,trace:[],nodes:[],lines:[],vlog:[],choices:[],rh:[],games:[],vids:[],vidEnded:[],ending:null,get fps(){return fps},get paused(){return PAUSED},start:startGame,cont:cont,toTitle:toTitle,tap:onTap,
  choose:function(i){ var b=document.querySelectorAll('#opts button')[i]; if(b) b.click(); }, AU:AU};
// 測試用直接進入
if(Q.get('camp')){ $('#gate').classList.add('hide'); AU.init(); startGame('A',Q.has('replay')); }
else if(Q.has('title')){ $('#gate').classList.add('hide'); refreshTitle(); show('#title'); }
})();
