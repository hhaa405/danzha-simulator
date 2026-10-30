/* 阿葛人生模擬器 v2 — 2D 分層影像互動劇場引擎（自寫） */
(function(){
'use strict';
var $=function(s){return document.querySelector(s)};
var Q=new URLSearchParams(location.search);
var AUTO=Q.has('auto'), FAST=Math.max(1,+(Q.get('fast')||1)), PICK=(Q.get('pick')||'').split(',').filter(Boolean).map(Number);
var SEED=+(Q.get('seed')||0), LETTIME=Q.has('timeout');
function rnd(){ if(!SEED) return Math.random(); SEED=(SEED*16807)%2147483647; return (SEED-1)/2147483646; }
var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms/FAST)})};
var CAST=window.CAST, ENDINGS=window.ENDINGS, FOCUS=window.FOCUS||{}, VOICE=window.VOICE||{}, VFILES=window.VOICE_FILES||[];
var LS={get:function(k,d){try{var v=localStorage.getItem('agege2_'+k);return v?JSON.parse(v):d}catch(e){return d}},set:function(k,v){try{localStorage.setItem('agege2_'+k,JSON.stringify(v))}catch(e){}},del:function(k){try{localStorage.removeItem('agege2_'+k)}catch(e){}}};
var SET=Object.assign({voice:1,music:.55,amb:.6,sub:true,auto:true},LS.get('set',{}));

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
function fresh(camp,replay){ return {camp:camp,replay:!!replay,node:camp==='A'?'a1_start':'b1_start',idx:0,
  vars:{btc:0,eth:0,candy:0,bond:0,look:0,rival:0,doubt:0,mine:0,match:0,copy:0,copyliq:0,agpanic:0,cash:0,qing:0,yu:0,viv:0,trustA:0,mom:0,mate:0,kai:0,teach:0,panic:0,calm:0,greed:0,hidden:0,rh:0,partner:''},
  stats:{timed:0,timeouts:0,fast:0,rtSum:0,choices:0,rhythm:0,rhyHit:0},seen:{},scene:{},hud:'none',hist:[]}; }
function V(){return S.vars}
function evalx(e){ try{ var v=S.vars; return Function('v','with(v){return ('+e+')}')(v);}catch(err){console.warn('expr',e,err);return false} }
function applyFx(list){ (list||[]).forEach(function(f){ var v=S.vars, x=isNaN(+f.x)?(f.x.charAt(0)==="'"?f.x.slice(1,-1):evalx(f.x)):+f.x;
  if(f.op==='=') v[f.v]=x; else if(f.op==='+=') v[f.v]=(+v[f.v]||0)+x; else if(f.op==='-=') v[f.v]=(+v[f.v]||0)-x; else v[f.v]=(+v[f.v]||0)*x;
  if(f.v==='btc'||f.v==='eth'||f.v==='candy') v[f.v]=Math.round(v[f.v]*100)/100; });
  hud(); }

/* ---------- 畫面層 ---------- */
var bgs=[$('#bg0'),$('#bg1')], bgi=0, look={x:0,y:0,tx:0,ty:0,fx:0,drag:null,mx:0,my:0};
function bgSize(){ var w=innerWidth,h=innerHeight,ar=16/9,bw,bh; if(w/h>ar){bw=w*1.1;bh=bw/ar}else{bh=h*1.1;bw=bh*ar} return [bw,bh]; }
function layoutBg(){ var z=bgSize(); bgs.forEach(function(b){b.style.width=z[0]+'px';b.style.height=z[1]+'px';}); }
addEventListener('resize',layoutBg); layoutBg();
var tFrame=performance.now(), fps=60, fpsEl=null;
function frame(t){ var dt=Math.min(.1,(t-tFrame)/1000); tFrame=t; fps=fps*.95+(1/Math.max(dt,.001))*.05;
  var z=bgSize(), rx=(z[0]-innerWidth)/2, ry=(z[1]-innerHeight)/2;
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
$('#stage').addEventListener('pointerdown',function(e){ down={x:e.clientX,y:e.clientY,lx:look.tx,ly:look.ty,t:Date.now(),moved:false}; look.drag=down; });
addEventListener('pointermove',function(e){
  if(e.pointerType==='mouse'&&!down){ look.mx=(e.clientX/innerWidth-.5)*2; look.my=(e.clientY/innerHeight-.5)*2; }
  if(!down) return; var dx=e.clientX-down.x, dy=e.clientY-down.y; if(Math.abs(dx)+Math.abs(dy)>12) down.moved=true;
  if(down.moved){ var z=bgSize(), rx=Math.max(40,(z[0]-innerWidth)/2), ry=Math.max(30,(z[1]-innerHeight)/2);
    look.tx=Math.max(-1,Math.min(1,down.lx-dx/rx)); look.ty=Math.max(-1,Math.min(1,down.ly-dy/ry)); } });
addEventListener('pointerup',function(e){ var d=down; down=null; look.drag=null; if(!d||d.moved) return;
  if(e.target.closest('button,input,label,#phone,#note,.screen,#choice')) return; onTap(); });
addEventListener('keydown',function(e){ if(e.key===' '||e.key==='Enter'){ if(!document.activeElement||document.activeElement.tagName!=='BUTTON'){e.preventDefault();onTap();} } if(e.key==='Escape') openMenu(); });
// 顆粒
(function(){ var c=$('#grain'), x=c.getContext('2d'); var GW=160, GH=Math.max(90,Math.round(160*innerHeight/Math.max(1,innerWidth))); c.width=GW; c.height=GH; var img=x.createImageData(GW,GH);
  setInterval(function(){ for(var i=0;i<img.data.length;i+=4){var g=Math.random()*255|0; img.data[i]=img.data[i+1]=img.data[i+2]=g; img.data[i+3]=255;} x.putImageData(img,0,0); },90); })();
var TINT={warm:'rgba(255,170,90,.35)',dusk:'rgba(255,120,60,.4)',cold:'rgba(70,120,200,.4)',night:'rgba(30,50,120,.55)',red:'rgba(220,40,30,.45)',gold:'rgba(255,200,90,.35)',grey:'rgba(120,120,120,.45)',none:'rgba(0,0,0,0)'};
function setScene(a){ var sc=S.scene; var ch=false;
  if(a.bg&&a.bg!==sc.bg){ ch=true; sc.bg=a.bg; var nb=bgs[1-bgi]; nb.style.backgroundImage='url(img/'+a.bg+'.webp)'; nb.classList.add('on'); bgs[bgi].classList.remove('on'); bgi=1-bgi;
    look.fx=(a.fx!=null?+a.fx:(FOCUS[a.bg]||0)); look.tx=look.fx; }
  if(a.time!=null){ sc.time=a.time; $('#clock').textContent=a.time; }
  if(a.tint){ sc.tint=a.tint; $('#tint').style.background=TINT[a.tint]||a.tint; }
  if(a.bgm){ sc.bgm=a.bgm; AU.music(a.bgm); }
  if(a.amb){ sc.amb=a.amb; AU.amb(a.amb); }
  return ch; }
function hud(){ var v=S.vars, m=S.hud, t='';
  if(m==='candy') t='🍬 '+v.candy; else if(m==='cash') t='零用錢 $'+(v.cash||0);
  else if(m==='btc') t='₿ '+fmt(v.btc); else if(m==='both') t='₿ '+fmt(v.btc)+'　Ξ '+fmt(v.eth);
  var el=$('#money'); if(el.textContent!==t){ el.textContent=t; el.classList.add('flash'); setTimeout(function(){el.classList.remove('flash')},350);} }
function fmt(n){ n=+n||0; return n>=100?Math.round(n).toLocaleString():(Math.round(n*100)/100).toString(); }
function chipStyle(el,spk,emo,size){ var c=CAST[spk]; if(!c||!c.sheet){ el.style.backgroundImage='none'; el.style.display='none'; return; }
  el.style.display='inline-block'; var q={n:[0,0],s:[1,0],u:[0,1],x:[1,1]}[emo||'n']||[0,0], Z=2.9;
  var fx=q[0]*.5+.25, fy=q[1]*.5+(c.fy||.19);
  el.style.backgroundImage='url(img/'+c.sheet+'.webp)'; el.style.backgroundSize=(Z*100)+'%';
  el.style.backgroundPosition=((.5-fx*Z)*size).toFixed(1)+'px '+((.5-fy*Z)*size).toFixed(1)+'px'; }
function nameOf(spk){ var c=CAST[spk]; if(!c) return ''; return (S.camp==='A'?c.nA:c.nB)||c.n; }

/* ---------- 等待點擊 ---------- */
var tapWait=null;
function onTap(){ if(tapWait){ var f=tapWait; tapWait=null; f(); } }
function waitTapOr(ms){ return new Promise(function(res){ var done=false; function fin(){ if(done)return; done=true; tapWait=null; res(); }
  tapWait=fin; if(ms!=null) setTimeout(fin, ms/FAST); }); }

/* ---------- 台詞 ---------- */
var introTimer=null;
async function say(op){
  var sub=$('#sub'), txt=$('#txt'), who=$('#whoName'), chip=$('#chip');
  sub.classList.remove('hide'); sub.classList.toggle('nosub',!SET.sub);
  var spk=op.spk, isSelf=(op.think)||(S.camp==='B'&&/^me/.test(spk))||(S.camp==='A'&&/^ag/.test(spk));
  if(op.think||!spk){ who.textContent=''; chip.style.display='none'; }
  else { who.textContent=nameOf(spk); chipStyle(chip,spk,op.emo,34); }
  txt.className=op.think?'think':''; txt.textContent=op.think?'（'+op.text+'）':op.text;
  void txt.offsetWidth; txt.classList.add('on');
  if(spk&&!op.think&&!isSelf&&CAST[spk]&&!S.seen[spk]){ S.seen[spk]=1; showIntro(spk); }
  var key=op.vp+'|'+op.emo+'|'+op.text, vd=VOICE[key], len=op.text.length;
  var base=900+len*150;
  if(!AUTO&&vd&&SET.voice>0){ var p=AU.voice(vd); await Promise.race([p, waitTapOr(null)]); AU.stopVoice();
    if(SET.auto) await waitTapOr(650); else await waitTapOr(null); }
  else { if(SET.auto||AUTO) await waitTapOr(Math.max(1500,base)); else await waitTapOr(null); }
  tapWait=null; txt.classList.remove('on'); await sleep(140);
}
function showIntro(spk){ var c=CAST[spk], el=$('#intro'); clearTimeout(introTimer); el.classList.remove('hide','out');
  chipStyle($('#introFace'),spk,'n',Math.min(innerHeight*.22,120)); $('#introName').textContent=nameOf(spk); $('#introDesc').textContent=(S.camp==='A'?c.dA:c.dB)||c.d||'';
  introTimer=setTimeout(function(){ el.classList.add('out'); introTimer=setTimeout(function(){el.classList.add('hide')},800); },3200/FAST); }

/* ---------- 演出指令 ---------- */
async function blink(swap){ var st=$('#stage'); AU.sfx('blink'); st.classList.add('closed'); await sleep(650); if(swap) swap(); await sleep(swap?900:250); st.classList.remove('closed'); await sleep(500); }
async function card(s){ var p=s.split('|'); $('#cardA').textContent=p[0]||''; $('#cardB').textContent=p[1]||''; var c=$('#card'); c.classList.remove('hide'); AU.sfx('page');
  $('#sub').classList.add('hide'); await waitTapOr(3600); c.classList.add('hide'); }
async function phone(s){ var p=s.split('|').map(function(x){return x.trim()}); $('#phTitle').textContent=p.shift(); var b=$('#phBody'); b.innerHTML='';
  p.forEach(function(r){ var d=document.createElement('div');
    if(r.charAt(0)==='#'){ d.className='big '+(/▼|-/.test(r)?'dn':'up'); d.textContent=r.slice(1); }
    else if(/^>/.test(r)){ d.className='msg me'; d.textContent=r.slice(1); }
    else if(/^[^：:]{1,8}[：:]/.test(r)&&!/[▲▼]/.test(r)){ var i=r.search(/[：:]/); d.className='msg'; d.innerHTML='<b></b><span></span>'; d.firstChild.textContent=r.slice(0,i); d.lastChild.textContent=r.slice(i+1); }
    else if(/[▲▼]/.test(r)){ var cols=r.split(/\s{2,}|\t/); d.className='row '+(/▼/.test(r)?'dn':'up'); cols.forEach(function(c){var s=document.createElement('span');s.textContent=c;d.appendChild(s)}); }
    else { d.className='txt'; d.textContent=r; }
    b.appendChild(d); });
  b.scrollTop=0; $('#sub').classList.add('hide'); $('#phone').classList.remove('hide'); AU.sfx('buzz');
  await new Promise(function(res){ var btn=$('#phDown'); function c(){ btn.removeEventListener('click',c); res(); } btn.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); });
  $('#phone').classList.add('hide'); AU.sfx('whoosh'); }
async function note(s){ $('#noteTxt').textContent=s.replace(/\\n/g,'\n'); var n=$('#note'); n.classList.remove('hide'); AU.sfx('page'); $('#sub').classList.add('hide');
  await new Promise(function(res){ function c(){ n.removeEventListener('click',c); res(); } n.addEventListener('click',c); if(AUTO) setTimeout(c,1800/FAST); });
  n.classList.add('hide'); }
async function rhythm(s){ var m=s.match(/^(\d+)\s*(.*)$/), n=+(m?m[1]:6), label=m?m[2]:s; var iv=S.replay?650:800;
  var el=$('#rhythm'), core=$('#rcore'), sh=$('#rshrink'); $('#rlabel').textContent=label+'（跟著節奏點擊）'; $('#rscore').textContent=''; $('#sub').classList.add('hide'); el.classList.remove('hide');
  var hits=0, beats=[], t0=performance.now()+1200, tapped={};
  function tap(e){ e.stopPropagation(); var now=performance.now(), k=Math.round((now-t0)/iv); if(k<0||k>=n||tapped[k])return; tapped[k]=1;
    var ok=Math.abs(now-(t0+k*iv))<240; if(ok){hits++;AU.sfx('tick');} core.className=ok?'hit':'miss'; setTimeout(function(){core.className=''},160); $('#rscore').textContent=hits+' / '+n; }
  el.addEventListener('pointerdown',tap);
  for(var k=0;k<n;k++){ (function(k){ var at=t0+k*iv-iv; setTimeout(function(){ sh.style.transition='none'; sh.style.transform='scale(2.4)'; sh.style.opacity='1'; void sh.offsetWidth; sh.style.transition='transform '+iv+'ms linear, opacity '+iv+'ms'; sh.style.transform='scale(.55)'; },Math.max(0,at-performance.now())/FAST); })(k); }
  if(AUTO){ hits=+(Q.get('rh')||n-1); await sleep(n*iv+1400); } else await new Promise(function(r){setTimeout(r,(1200+n*iv+500))});
  el.removeEventListener('pointerdown',tap); el.classList.add('hide');
  S.vars.rh=hits; S.stats.rhythm+=n; S.stats.rhyHit+=hits; }

/* ---------- 選擇 ---------- */
async function choose(op){
  var opts=op.opts.filter(function(o){return !o.cond||evalx(o.cond)}); if(!opts.length) return null;
  var a=op.a, st=a.t||'calm', T=0;
  if(/^\d/.test(st)) T=+st; else if(st==='high') T=5; else if(st==='mid') T=10; else if(st==='calm') T=S.replay?16:0;
  if(S.replay&&T) T*=0.72;
  var hot=(st==='high'||(T&&T<=6));
  var def=Math.min(opts.length-1,Math.max(0,(+a.def||opts.length)-1));
  $('#sub').classList.add('hide'); $('#intro').classList.add('hide'); $('#cprompt').textContent=op.prompt||''; var box=$('#opts'); box.innerHTML='';
  var tm=$('#timer'), bar=tm.firstChild; tm.className=T?(hot?'hot':''):'none'; bar.style.transition='none'; bar.style.transform='scaleX(1)';
  $('#choice').classList.remove('hide'); AU.sfx('select');
  if(hot){ $('#pulse').classList.add('on'); $('#stage').classList.add('shake'); AU.tense(true); }
  var t0=performance.now();
  var picked=await new Promise(function(res){ var done=false, hb=null, to=null;
    function fin(i,timeout){ if(done)return; done=true; clearInterval(hb); clearTimeout(to); res({i:i,timeout:timeout}); }
    opts.forEach(function(o,i){ var b=document.createElement('button'); b.textContent=o.text; b.onclick=function(e){e.stopPropagation(); b.classList.add('pick'); fin(i,false)}; box.appendChild(b); });
    if(T){ requestAnimationFrame(function(){ bar.style.transition='transform '+(T/FAST)+'s linear'; bar.style.transform='scaleX(0)'; });
      to=setTimeout(function(){fin(def,true)},T*1000/FAST);
      if(hot) hb=setInterval(function(){AU.sfx('heart')},800/FAST); else hb=setInterval(function(){ if(performance.now()-t0>T*700/FAST) AU.sfx('tick')},1000/FAST); }
    if(AUTO&&!(LETTIME&&T)){ var ix=PICK.length?PICK.shift():Math.floor(rnd()*opts.length); setTimeout(function(){ fin(Math.min(ix,opts.length-1),false) },500/FAST); }
  });
  var rt=(performance.now()-t0)*FAST/1000;
  $('#pulse').classList.remove('on'); $('#stage').classList.remove('shake'); if(hot) AU.tense(false);
  await sleep(picked.timeout?200:380); $('#choice').classList.add('hide');
  var o=opts[picked.i]; S.stats.choices++;
  if(T){ S.stats.timed++; S.stats.rtSum+=rt; if(picked.timeout){ S.stats.timeouts++; S.vars.panic++; } else if(rt<T*.5) S.stats.fast++; }
  S.hist.push((op.prompt||'')+'→'+o.text+(picked.timeout?'（逾時）':''));
  if(picked.timeout){ AU.sfx('buzz'); }
  applyFx(o.fx); return o; }

/* ---------- 主迴圈 ---------- */
var running=0;
function tagOK(op){ if(!op.tag) return true; if(op.tag==='A'||op.tag==='B') return op.tag===S.camp; if(op.tag==='R') return S.replay; if(op.tag==='N') return !S.replay; return true; }
async function run(node,idx){
  var my=++running; S.node=node; S.idx=idx||0; var skip=false;
  while(my===running){
    var ops=N[S.node]; if(!ops){ console.error('no node',S.node); return; }
    if(S.idx>=ops.length){ var k=ORDER.indexOf(S.node); if(k<0||k+1>=ORDER.length) return; S.node=ORDER[k+1]; S.idx=0; continue; }
    var op=ops[S.idx]; S.idx++;
    if(!tagOK(op)) continue; if(skip){ skip=false; continue; }
    window.__game.trace.push(S.node+':'+op.ln);
    var r=await exec(op); if(my!==running) return;
    if(r==='skip') skip=true;
    else if(r&&r.go){ S.node=r.go; S.idx=0; if(!N[r.go]) console.error('missing node '+r.go); window.__game.nodes.push(r.go); }
    else if(r==='end') return;
  } }
function save(){ if(!S||S.ended) return; LS.set('save',{camp:S.camp,replay:S.replay,node:S.node,idx:Math.max(0,S.idx-1),vars:S.vars,stats:S.stats,seen:S.seen,scene:S.scene,hud:S.hud,hist:S.hist}); }
async function exec(op){
  switch(op.k){
    case 'scene': save(); var a=op.a;
      if(a.fade==='blink'){ await blink(function(){setScene(a)}); } else if(setScene(a)) await sleep(900); return;
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
    case 'wait': await sleep(+op.s||1000); return;
    case 'fx': $('#pulse').classList.toggle('on',op.s==='pulse'); $('#stage').classList.toggle('shake',op.s==='pulse'||op.s==='shake'); return;
    case 'rhythm': await rhythm(op.s); return;
    case 'go': return {go:op.s};
    case 'if': var m=op.s.match(/^(.*?)\s*->\s*(\S+)$/); if(m&&evalx(m[1])) return {go:m[2]}; return;
    case 'when': return evalx(op.s)?undefined:'skip';
    case 'end': await ending(op.s); return 'end';
    case 'choice': save(); var o=await choose(op); if(o&&o.go) return {go:o.go}; return;
    default: console.warn('unknown op',op.k,op.ln); return;
  } }

/* ---------- 結局與評語 ---------- */
function verdict(e){ var v=S.vars, s=S.stats; var cool=s.timed?Math.round(100*(s.timed-s.timeouts)/s.timed):100; var avg=s.timed?(s.rtSum/s.timed).toFixed(1):'—';
  var lines=[];
  lines.push('<div class="vh">評　語</div>');
  lines.push('持有　₿ '+fmt(v.btc)+(v.eth?'　Ξ '+fmt(v.eth):''));
  lines.push('冷靜指數　'+cool+'%　（限時抉擇 '+s.timed+' 次，逾時 '+s.timeouts+' 次，平均 '+avg+' 秒）');
  if(s.rhythm) lines.push('節奏感　'+Math.round(100*s.rhyHit/s.rhythm)+'%');
  var rel=[]; if(v.bond) rel.push((S.camp==='A'?'阿哲':'我')+' '+'♥'.repeat(Math.min(5,v.bond))); var pn={qing:'小晴',yu:'小雨',viv:'Vivian'};
  ['qing','yu','viv'].forEach(function(k){ if(v[k]>0) rel.push(pn[k]+' '+'♥'.repeat(Math.min(5,v[k]))); });
  if(rel.length) lines.push('羈絆　'+rel.join('　'));
  if(v.trustA) lines.push('信用　A先生 '+(v.trustA>=2?'「這小子說話算話。」':'「還行。」'));
  var q;
  if(e.id==='liq') q=s.timeouts>1?'你的手，比你的腦袋先動了 '+s.timeouts+' 次。':'規律沒有錯，錯的是你想贏更多。';
  else if(e.id==='hidden') q='你沒有時光機。你只是比所有人，早一點點看見。';
  else if(e.id==='legend') q=s.timeouts===0?'手很穩，像在看一部早就看過的電影。':'傳奇也會手抖，只是他抖完，還是按對了。';
  else if(e.id==='ordinary') q=v.btc>50?'錢包很安全，夢想也很安全。':'平凡不是失敗，只是規律說：下次吧。';
  else if(e.id==='bond') q='數字會過期，朋友不會。';
  else q='這一次，你終於看見了一條不在 K 線上的曲線。';
  lines.push('<div class="vq">「'+q+'」</div>');
  var sc=(v.btc>=200?3:v.btc>=100?2:v.btc>=30?1:0)+(cool>=90?2:cool>=70?1:0)+(v.bond>=3?1:0)+(e.id==='hidden'?3:e.id==='liq'?-2:0);
  lines.push('<div class="vh" style="margin-top:8px">總評　'+(sc>=6?'S　時光機持有者':sc>=4?'A　看得見規律的人':sc>=2?'B　穩穩的第二名':'C　被市場上了一課')+'</div>');
  return lines.map(function(x){return /^<div/.test(x)?x:'<div class="vr">'+x+'</div>'}).join(''); }
async function ending(id){
  var e=ENDINGS.filter(function(x){return x.id===id})[0]; if(!e){console.error('ending',id);return;}
  S.ended=true; window.__game.ending=id;
  var got=LS.get('end',{}); got[id]=got[id]||{}; got[id][S.camp]=1; LS.set('end',got); LS.set('done',Object.assign(LS.get('done',{}),(function(){var o={};o[S.camp]=1;return o})()));
  LS.del('save'); AU.music(e.bgm||'emo');
  await blink(function(){ setScene({bg:e.img}); });
  await sleep(1500);
  $('#sub').classList.add('hide'); var el=$('#ending'); el.style.backgroundImage='linear-gradient(rgba(0,0,0,.55),rgba(0,0,0,.92)),url(img/'+e.img+'.webp)';
  $('#eTag').textContent=(S.camp==='A'?'第一視角':'第三視角')+'　結局 '+(ENDINGS.indexOf(e)+1)+' / '+ENDINGS.length;
  $('#eName').textContent='「'+e.name+'」'; $('#eDesc').textContent=(S.camp==='A'?e.dA:e.dB)||e.d||'';
  $('#eVerdict').innerHTML=verdict(e); el.classList.remove('hide'); $('#hud').classList.add('hide'); AU.sfx('coin');
  if(window.__game) window.__game.onEnd&&window.__game.onEnd(id);
}

/* ---------- 標題／選單／圖鑑 ---------- */
function show(id){ ['#title','#gallery','#menu','#ending'].forEach(function(s){$(s).classList.add('hide')}); if(id) $(id).classList.remove('hide'); }
var campMode='new';
function refreshTitle(){ $('#bCont').classList.toggle('hide',!LS.get('save',null)); var d=LS.get('done',{}); $('#bReplay').classList.toggle('hide',!(d.A||d.B));
  $('#tMain').classList.remove('hide'); $('#tCamp').classList.add('hide'); }
function toTitle(){ running++; AU.stopVoice(); tapWait=null; ['#sub','#choice','#phone','#note','#card','#rhythm','#hud','#intro'].forEach(function(s){$(s).classList.add('hide')});
  $('#pulse').classList.remove('on'); $('#stage').classList.remove('shake','closed'); refreshTitle(); show('#title'); AU.music('title'); AU.amb('none'); }
function startGame(camp,replay){ S=fresh(camp,replay); show(null); $('#hud').classList.remove('hide'); $('#clock').textContent=''; S.hud='none'; hud(); bgs.forEach(function(b){b.classList.remove('on')});
  var st=Q.get('node'); if(st&&N[st]){ S.node=st; try{Object.assign(S.vars,JSON.parse(Q.get('vars')||'{}'))}catch(e){} }
  if(st&&N[st]){ var sc={}, k=ORDER.indexOf(st), c=st.charAt(0); for(var j=0;j<k;j++){ if(ORDER[j].charAt(0)!==c) continue; N[ORDER[j]].forEach(function(op){ if(op.k==='scene') ['bg','time','tint','bgm','amb'].forEach(function(x){ if(op.a[x]!=null) sc[x]=op.a[x]; }); if(op.k==='hud') S.hud=op.s; }); }
    var f=N[st][0]; if(!(f&&f.k==='scene'&&f.a.bg)) setScene(sc); hud(); }
  run(S.node,0); }
function cont(){ var s=LS.get('save',null); if(!s) return; S=fresh(s.camp,s.replay); Object.assign(S,{vars:s.vars,stats:s.stats,seen:s.seen||{},hud:s.hud,hist:s.hist||[]}); show(null); $('#hud').classList.remove('hide');
  bgs.forEach(function(b){b.classList.remove('on')}); var sc=s.scene||{}; S.scene={}; setScene(sc); hud(); run(s.node,s.idx); }
$('#tMain').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.dataset.a; AU.sfx('select');
  if(a==='start'||a==='replay'){ campMode=a; $('#campHead').textContent=a==='replay'?'重來一次（抉擇時間更短，有些事你好像記得）':'選擇視角'; $('#tMain').classList.add('hide'); $('#tCamp').classList.remove('hide'); }
  else if(a==='cont') cont(); else if(a==='gallery') openGallery(); else if(a==='menu') openMenu(); });
$('#tCamp').addEventListener('click',function(e){ var b=e.target.closest('button'); if(!b) return; var a=b.dataset.a; if(a==='back'){refreshTitle();return;} LS.del('save'); startGame(a,campMode==='replay'); });
function openGallery(){ var got=LS.get('end',{}), L=$('#gList'); L.innerHTML='';
  ENDINGS.forEach(function(e,i){ var ok=got[e.id], d=document.createElement('div'); d.className='ge'+(ok?' ok':'');
    d.innerHTML='<div class="gi"><i>'+(ok?'':'？')+'</i></div><div class="gt"><b></b><span></span></div>'; d.firstChild.style.backgroundImage='url(img/'+e.img+'.webp)';
    d.querySelector('b').textContent=(i+1)+'. '+(ok?e.name:'？？？'); if(ok){ var em=document.createElement('em'); em.textContent=(ok.A?'第一視角 ':'')+(ok.B?'第三視角':''); d.querySelector('b').appendChild(em);}
    d.querySelector('span').textContent=ok?e.short:e.hint; L.appendChild(d); });
  show('#gallery'); }
$('#gBack').onclick=function(){ show('#title'); };
var menuFrom=null;
function openMenu(){ menuFrom=$('#title').classList.contains('hide')?'game':'title'; $('#vVoice').value=SET.voice; $('#vMusic').value=SET.music; $('#vAmb').value=SET.amb; $('#vSub').checked=SET.sub; $('#vAuto').checked=SET.auto;
  $('#mTitle').classList.toggle('hide',menuFrom==='title'); if(menuFrom==='game') AU.pause(true); $('#menu').classList.remove('hide'); }
$('#menuBtn').addEventListener('click',function(e){e.stopPropagation();openMenu();});
['vVoice','vMusic','vAmb'].forEach(function(id){ $('#'+id).addEventListener('input',function(){ SET[{vVoice:'voice',vMusic:'music',vAmb:'amb'}[id]]=+this.value; LS.set('set',SET); AU.vol(); }); });
$('#vSub').onchange=function(){SET.sub=this.checked;LS.set('set',SET);$('#sub').classList.toggle('nosub',!SET.sub)};
$('#vAuto').onchange=function(){SET.auto=this.checked;LS.set('set',SET)};
$('#mResume').onclick=function(){ $('#menu').classList.add('hide'); AU.pause(false); };
$('#mTitle').onclick=function(){ $('#menu').classList.add('hide'); AU.pause(false); save(); toTitle(); };
$('#eTitle').onclick=function(){ toTitle(); };
$('#eReplay').onclick=function(){ var c=S.camp; LS.del('save'); startGame(c,true); };
$('#gateBtn').onclick=function(){ AU.init(); $('#gate').classList.add('hide'); refreshTitle(); show('#title'); AU.music('title'); };

/* ---------- 音訊（WebAudio 程序化配樂／環境音／音效 + HTMLAudio 語音精靈） ---------- */
var AU=(function(){
  var ac=null, master, mBus, aBus, xBus, noiseBuf, song=null, mood='', ambNode=null, duck=1, paused=false, tenseOn=false, baseMood='';
  var vEls={}, vCur=null, vTimer=null, vRes=null;
  function init(){ if(ac) return; try{ ac=new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ return; }
    master=ac.createGain(); master.connect(ac.destination); mBus=ac.createGain(); aBus=ac.createGain(); xBus=ac.createGain(); mBus.connect(master); aBus.connect(master); xBus.connect(master); xBus.gain.value=.7;
    noiseBuf=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate); var d=noiseBuf.getChannelData(0); for(var i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    vol(); setInterval(sched,100);
    VFILES.forEach(function(f,i){ var a=new Audio(); a.preload=i<2?'auto':'metadata'; a.src=f; vEls[i]=a; try{ a.muted=true; var p=a.play(); if(p&&p.then) p.then(function(){a.pause();a.muted=false;a.currentTime=0}).catch(function(){a.muted=false}); else {a.pause();a.muted=false;} }catch(e){a.muted=false} }); }
  function vol(){ if(!ac) return; var t=ac.currentTime; mBus.gain.setTargetAtTime(paused?0:SET.music*duck*.9,t,.25); aBus.gain.setTargetAtTime(paused?0:SET.amb*.8,t,.4); if(vCur) vCur.volume=SET.voice; }
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
        if(rnd()<.85) env(s.g,m.pluck?'square':'sine',hz(n),tt,m.pluck?.25:spb*1.6,m.arp*(m.pluck?.4:1),.005); }
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
  function sfx(n){ if(!ac) return; var t=ac.currentTime;
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
  function voice(vd){ return new Promise(function(res){ stopVoice(); var a=vEls[vd[0]]; if(!a){res();return;} vCur=a; vRes=res; a.volume=SET.voice; duck=.45; vol();
      try{ a.currentTime=vd[1]; }catch(e){}
      var p=a.play(); if(p&&p.catch) p.catch(function(){ fin(); });
      var endAt=vd[1]+vd[2]; function chk(){ if(vCur!==a) return; if(a.currentTime>=endAt-.02){ fin(); return; } vTimer=setTimeout(chk,40); } vTimer=setTimeout(chk,60);
      var hard=setTimeout(fin,(vd[2]+1.5)*1000);
      function fin(){ clearTimeout(hard); if(vCur===a){ a.pause(); vCur=null; } duck=1; vol(); var r=vRes; vRes=null; r&&r(); }
      if(vEls[vd[0]+1]&&vEls[vd[0]+1].preload!=='auto'){ vEls[vd[0]+1].preload='auto'; try{vEls[vd[0]+1].load()}catch(e){} }
    }); }
  function stopVoice(){ clearTimeout(vTimer); if(vCur){ vCur.pause(); vCur=null; } duck=1; vol(); if(vRes){ var r=vRes; vRes=null; r(); } }
  return {init:init,vol:vol,music:music,tense:tense,amb:amb,sfx:sfx,voice:voice,stopVoice:stopVoice,pause:pause};
})();

window.__game={get S(){return S},N:N,ORDER:ORDER,trace:[],nodes:[],ending:null,get fps(){return fps},start:startGame,toTitle:toTitle,tap:onTap,
  choose:function(i){ var b=document.querySelectorAll('#opts button')[i]; if(b) b.click(); }, AU:AU};
// 測試用直接進入
if(Q.get('camp')){ $('#gate').classList.add('hide'); AU.init(); startGame(Q.get('camp'),Q.has('replay')); }
else if(Q.has('title')){ $('#gate').classList.add('hide'); refreshTitle(); show('#title'); }
})();
