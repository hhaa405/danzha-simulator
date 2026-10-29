/* 蛋渣模擬器 第一人稱版 — 劇本解析器（遊戲與建置共用） */
(function(root){
function fnv(s){let h=0x811c9dc5;for(const ch of s){h^=ch.codePointAt(0);h=Math.imul(h,0x01000193)>>>0}return ('0000000'+h.toString(16)).slice(-8)}
function vkey(who,emo,text){return fnv(who+'|'+(emo||'')+'|'+text)}
function spoken(label){const m=label.match(/「([^」]+)」/);return m?m[1]:null}
function parseFx(s){const o=[];if(!s)return o;s.trim().split(/\s+/).forEach(t=>{const m=t.match(/^([A-Za-z_]\w*)([+\-=])(-?\d+)$/);if(m)o.push([m[1],m[2],+m[3]])});return o}
function parse(txt){
 const N={},order=[];let cur=null,lastChoice=null;
 const lines=txt.split(/\r?\n/);
 for(let ln=0;ln<lines.length;ln++){let L=lines[ln].replace(/\s+$/,'');if(!L.trim()||L.startsWith('##'))continue;
  if(L.startsWith('# ')){cur=L.slice(2).trim();N[cur]=[];order.push(cur);lastChoice=null;continue}
  if(!cur)continue;const B=N[cur];
  if(L.startsWith('@ ')){const o={k:'scene'};L.slice(2).trim().split(/\s+/).forEach(p=>{const j=p.indexOf('=');if(j>0)o[p.slice(0,j)]=p.slice(j+1).replace(/·/g,' ')});B.push(o);lastChoice=null;continue}
  if(L.startsWith('?')){const o={k:'choice',opts:[]};(L.slice(1).trim().match(/\S+=\S+/g)||[]).forEach(p=>{const[a,b]=p.split('=');o[a]=isNaN(+b)?b:+b});B.push(o);lastChoice=o;continue}
  if(L.startsWith('- ')&&lastChoice){let s=L.slice(2).trim(),go=null,fx=null,cond=null;
   const g=s.match(/->\s*(\S+)\s*$/);if(g){go=g[1];s=s.slice(0,g.index).trim()}
   const f=s.match(/\{([^}]*)\}\s*$/);if(f){fx=parseFx(f[1]);s=s.slice(0,f.index).trim()}
   const c=s.match(/^\[([^\]]+)\]\s*/);if(c){cond=c[1];s=s.slice(c[0].length)}
   const sp=spoken(s);lastChoice.opts.push({t:s,go,fx:fx||[],cond,say:sp,key:sp?vkey('me','',sp):null});continue}
  lastChoice=null;
  if(L.startsWith('! ')){const r=L.slice(2).trim();const sp=r.indexOf(' ');const cmd=sp<0?r:r.slice(0,sp),arg=sp<0?'':r.slice(sp+1).trim();
   const o={k:'cmd',c:cmd,a:arg};
   if(cmd==='fx')o.fx=parseFx(arg);
   if(cmd==='if'){const m=arg.match(/^(.*?)\s*->\s*(\S+)$/);o.cond=m[1];o.go=m[2]}
   if(cmd==='title'){o.say=arg.replace(/｜/g,'，');o.key=vkey('nar','標題',o.say)}
   if(cmd==='note'){o.say=arg.replace(/—姐$/,'').trim();o.key=vkey('sis','紙條',o.say)}
   if(cmd==='money'){const m=arg.match(/^([+\-]\d+)\s*(.*)$/);o.v=+m[1];o.why=m[2]}
   B.push(o);continue}
  const m=L.match(/^(>)?([a-z]+)(?:\(([^)]*)\))?:\s*(.+)$/);
  if(m){const phone=!!m[1],who=m[2],emo=m[3]||'',text=m[4].trim();const e=phone?(who==='me'?'打字':'訊息'):emo;
   B.push({k:'line',who,emo:e,text,phone,key:vkey(who,e,text)});continue}
  throw new Error('無法解析第 '+(ln+1)+' 行: '+L)}
 return {N,order}}
function allLines(P){const out=[];for(const id of P.order)for(const s of P.N[id]){
  if(s.k==='line')out.push({who:s.who,emo:s.emo,text:s.text,key:s.key});
  if(s.k==='choice')s.opts.forEach(o=>{if(o.say)out.push({who:'me',emo:'',text:o.say,key:o.key})});
  if(s.k==='cmd'&&s.c==='title')out.push({who:'nar',emo:'標題',text:s.say,key:s.key});
  if(s.k==='cmd'&&s.c==='note')out.push({who:'sis',emo:'紙條',text:s.say,key:s.key});}
 const seen=new Set();return out.filter(l=>!seen.has(l.key)&&seen.add(l.key))}
function check(P){const errs=[];const has=id=>id in P.N;
 for(const id of P.order)for(const s of P.N[id]){
  if(s.k==='choice')s.opts.forEach(o=>{if(o.go&&!has(o.go))errs.push(id+': 選項目標不存在 '+o.go)});
  if(s.k==='choice'&&s.to&&!has(s.to))errs.push(id+': to 不存在 '+s.to);
  if(s.k==='cmd'&&(s.c==='go'||s.c==='sub')&&!has(s.a))errs.push(id+': go 不存在 '+s.a);
  if(s.k==='cmd'&&s.c==='if'&&!has(s.go))errs.push(id+': if 目標不存在 '+s.go)}
 return errs}
const API={parse,allLines,vkey,fnv,check,spoken};
if(typeof module!=='undefined')module.exports=API;else root.DZP=API;
})(this);
