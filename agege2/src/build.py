# 建置：合併劇本 → story.js；檢查每個顯示節點都有背景圖；抽出台詞 → edge-tts 配音 → 每句一個 mp3 → voicemap.js
import re, os, sys, json, asyncio, subprocess, hashlib, struct
SRC=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.dirname(SRC)
CACHE='/workspace/voicecache'; os.makedirs(CACHE,exist_ok=True)
RISEPY=['/workspace/asrenv/bin/python',f'{SRC}/rise.py']
story=open(f'{SRC}/story_a.txt',encoding='utf8').read()+'\n'+open(f'{SRC}/story_b.txt',encoding='utf8').read()
meta=open(f'{SRC}/meta.js',encoding='utf8').read()
esc=story.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
open(f'{OUT}/story.js','w',encoding='utf8').write(meta+'\nwindow.STORY_SRC=`'+esc+'`;\n')

# ---------- 與 engine.js 相同的解析規則 ----------
def kv(s):
    o={}
    for k,v in re.findall(r'(\w+)=("[^"]*"|\S+)',s): o[k]=v.strip('"')
    return o
N={}; ORDER=[]; lines=[]; node=None; pov='ag9'; lastq=None
for ln,raw in enumerate(story.split('\n'),1):
    l=raw.strip()
    if not l or l.startswith('//'): continue
    if l.startswith('== '): node=l[3:].strip(); N[node]=[]; ORDER.append(node); lastq=None; continue
    m=re.match(r'^\[(A|B|R|N)\]\s*',l); tag=None
    if m: tag=m.group(1); l=l[m.end():]
    camp='A' if node and node[0]=='a' else 'B'
    if l.startswith('-') and lastq is not None:
        g=re.search(r'->\s*(\S+)\s*$',l); lastq['go'].append(g.group(1) if g else None); continue
    lastq=None
    if l.startswith('@'): N[node].append(('scene',kv(l[1:]),ln)); continue
    if l.startswith('?'): lastq={'go':[]}; N[node].append(('choice',lastq,ln)); continue
    if l.startswith('!'):
        b=l[1:].strip().split(None,1); cmd=b[0]; rest=b[1].strip() if len(b)>1 else ''
        if cmd=='pov': pov=rest; continue
        N[node].append((cmd,rest,ln)); continue
    if l.startswith('>'):
        t=l[1:].strip(); vp=(pov+'~') if camp=='A' else 'nar'; lines.append((node,vp,'n',t)); N[node].append(('line',t,ln)); continue
    s=re.match(r'^([a-z]+\d*)(?:\.([nsux]))?\s*[:：]\s*(.+)$',l)
    if s: lines.append((node,s.group(1),s.group(2) or 'n',s.group(3).strip()))
    N[node].append(('line',l,ln))

# ---------- 建置檢查：節點、背景、圖檔 ----------
IMG=set(f[:-5] for f in os.listdir(f'{OUT}/img') if f.endswith('.webp'))
errs=[]
for n,ops in N.items():
    for k,a,ln in ops:
        if k=='scene' and 'bg' in a and a['bg'] not in IMG: errs.append(f'L{ln} {n}: 背景圖不存在 img/{a["bg"]}.webp')
        if k in('go',) and a not in N: errs.append(f'L{ln} {n}: 跳到不存在的節點 {a}')
        if k=='if':
            g=re.search(r'->\s*(\S+)$',a)
            if not g or g.group(1) not in N: errs.append(f'L{ln} {n}: if 目標不存在 {a}')
        if k=='choice':
            for g in a['go']:
                if g not in N: errs.append(f'L{ln} {n}: 選項目標不存在 {g}')
for m_ in re.finditer(r"img:'([^']+)'",meta):
    if m_.group(1) not in IMG: errs.append('結局圖不存在 '+m_.group(1))
for m_ in re.finditer(r"sheet:'([^']+)'",meta):
    if m_.group(1) not in IMG: errs.append('角色圖不存在 '+m_.group(1))
# 沿著所有路徑走一遍：任何會顯示在畫面上的東西（台詞、選擇、手機、紙條、節奏、K線）出現時，一定要已經有背景
SHOW={'line','choice','phone','note','rhythm','chart','reveal'}
seen=set(); stack=[(s,None) for s in ('a1_start','b1_start')]; reached=set(); nobg={}
while stack:
    n,bg=stack.pop()
    if (n,bg) in seen: continue
    seen.add((n,bg)); reached.add(n); ended=False; stale=None
    for k,a,ln in N[n]:
        if k=='scene':
            if a.get('bg'):
                if stale: errs.append(f'L{stale} {n}: 先換時間/轉場、下一行才換圖 → 舊畫面會先閃出新時間；請合併成同一行 @'); 
                bg=a['bg']; stale=None
            elif ('time' in a or a.get('fade')=='blink') and not a.get('keep'): stale=ln
        if k in SHOW and not bg: nobg.setdefault(n,ln)
        if k in SHOW and stale: errs.append(f'L{stale} {n}: 換場（time/fade）卻沒有換背景圖；同一個畫面延續請加 keep=1'); stale=None
        if k=='if': stack.append((re.search(r'->\s*(\S+)$',a).group(1),bg))
        if k=='go': stack.append((a,bg)); ended=True; break
        if k=='choice':
            for g in a['go']: stack.append((g,bg))
            ended=True; break
        if k=='end': ended=True; break
    if not ended:
        i=ORDER.index(n)
        if i+1<len(ORDER): stack.append((ORDER[i+1],bg))
for n,ln in nobg.items(): errs.append(f'L{ln} {n}: 顯示內容時沒有背景圖')
unreach=[n for n in ORDER if n not in reached]
if unreach: print('（提醒）走不到的節點：',unreach)
if errs:
    print('建置檢查失敗：'); [print('  ✗',e) for e in errs]; sys.exit(1)
print('建置檢查通過：',len(N),'個節點，全部路徑都有背景圖；',len(IMG),'張圖')

# ---------- 配音 ----------
VO={ # 角色: (聲音, 語速%, 音高Hz, 音量%)
 'ag9':('zh-CN-YunxiNeural',-2,14,0),'ag14':('zh-CN-YunxiNeural',-6,2,0),'ag17':('zh-CN-YunxiNeural',-8,-6,0),'ag22':('zh-CN-YunjianNeural',-10,-2,0),
 'me12':('zh-TW-YunJheNeural',8,16,0),'me15':('zh-TW-YunJheNeural',6,8,0),'me20':('zh-TW-YunJheNeural',4,0,0),'nar':('zh-TW-YunJheNeural',-6,-4,0),
 'mate':('zh-CN-YunxiaNeural',12,16,0),'tch':('zh-TW-HsiaoChenNeural',-2,0,0),'uncle':('zh-CN-YunyangNeural',-14,-16,0),
 'mra':('zh-CN-YunjianNeural',-12,-12,0),'chef':('zh-CN-YunyangNeural',4,6,5),'kai':('zh-CN-YunxiaNeural',8,-4,0),
 'mom':('zh-TW-HsiaoChenNeural',-8,-10,0),'qing14':('zh-TW-HsiaoYuNeural',2,12,0),'qing22':('zh-TW-HsiaoYuNeural',-2,2,0),
 'yu':('zh-CN-XiaoyiNeural',-4,0,0),'viv':('zh-CN-XiaoxiaoNeural',10,-4,0)}
for a in ['ag9','ag14','ag17','ag22']:
    v,r,p,vol=VO[a]; VO[a+'~']=(v,r-10,p-2,-25)
EMO={'n':(0,0,0),'s':(4,3,0),'u':(10,8,5),'x':(-6,-4,0)}
# 只改「唸出來的字」，字幕不變。(正規式, 取代, 只套用在哪些聲音；None=全部)
TTS_FIX=json.load(open(f'{SRC}/tts_fix.json',encoding='utf8')) if os.path.exists(f'{SRC}/tts_fix.json') else []
def tts_text(vp,t):
    rise=False
    if re.match(r'^蛤[？?！!]',t): rise=True; t='哈'+t[1:]          # 蛤 → ㄏㄚˊ：TTS 唸「哈」，再把音高拉成第二聲
    for pat,rep,only in TTS_FIX:
        if only and not re.match(only,vp): continue
        t=re.sub(pat,rep,t)
    return t,rise
def key(vp,emo,t): return f'{vp}|{emo}|{t}'
uniq={}
for node,vp,emo,t in lines:
    if vp not in VO: continue
    k=key(vp,emo,t)
    if k not in uniq:
        tt,rise=tts_text(vp,t); ck=key(vp,emo,tt)+('|rise' if rise else '')
        uniq[k]=dict(node=node,vp=vp,emo=emo,t=t,tts=tt,rise=rise,cache=CACHE+'/'+hashlib.md5(ck.encode()).hexdigest()+'.mp3',
                     out=f'voice/{hashlib.md5(k.encode()).hexdigest()[:10]}.mp3')
print('lines',len(lines),'unique',len(uniq),'respelled',sum(1 for u in uniq.values() if u['tts']!=u['t']))
if '--dump' in sys.argv:
    json.dump([[k,u['node'][:2],u['vp'],u['emo'],u['t'],u['cache'],u['tts'],f"{OUT}/{u['out']}"] for k,u in uniq.items()],open('/workspace/lines.json','w'),ensure_ascii=False); sys.exit()
REGEN=set(json.load(open(sys.argv[sys.argv.index('--regen')+1]))) if '--regen' in sys.argv else set()
f=lambda x,u: f"{'+' if x>=0 else ''}{x}{u}"
async def one(k,u,sem):
    out=u['cache']
    if k in REGEN and os.path.exists(out): os.remove(out)
    if os.path.exists(out) and os.path.getsize(out)>800: return
    if not re.search(r'[0-9A-Za-z\u3400-\u9fff]',u['tts']):       # 只有「……」：沒有字可唸，做一段 0.9 秒的停頓（有輕微氣音底噪，不會被判成 0 長度）
        if os.path.exists(out) and os.path.getsize(out)>200: return
        subprocess.run(['ffmpeg','-v','error','-y','-f','lavfi','-i','anoisesrc=a=0.004:c=pink:d=0.9:r=24000','-b:a','48k',out],check=True); return
    import edge_tts
    v,r,p,vol=VO[u['vp']]; er,ep,ev=EMO[u['emo']]; r+=er; p+=ep; vol=max(-80,min(50,vol+ev))
    async with sem:
        for i in range(5):
            try:
                tmp=out+'.tmp.mp3'
                await edge_tts.Communicate(u['tts'],v,rate=f(r,'%'),pitch=f(p,'Hz'),volume=f(vol,'%')).save(tmp)
                if os.path.getsize(tmp)>800:
                    if u['rise']:
                        subprocess.run(RISEPY+[tmp,out+'.wav'],check=True)
                        subprocess.run(['ffmpeg','-v','error','-y','-i',out+'.wav','-b:a','64k',out],check=True); os.remove(out+'.wav'); os.remove(tmp)
                    else: os.replace(tmp,out)
                    return
            except Exception as e: print('retry',u['vp'],u['t'][:10],e); await asyncio.sleep(2+i*2)
async def gen():
    sem=asyncio.Semaphore(8)
    await asyncio.gather(*[one(k,u,sem) for k,u in uniq.items()])
if '--novoice' not in sys.argv: asyncio.run(gen())

# ---------- 每句一個檔：只去掉句首靜音，句尾保留完整尾音再補 0.25 秒 ----------
SR=24000
os.makedirs(f'{OUT}/voice',exist_ok=True)
MAN=f'{OUT}/voice/.manifest.json'; man=json.load(open(MAN)) if os.path.exists(MAN) else {}
VMAP={}; keep={'_silence.mp3','.manifest.json'}; missing=[]
for k,u in uniq.items():
    fn=u['cache']; outp=f"{OUT}/{u['out']}"
    if not os.path.exists(fn): missing.append(k); continue
    sig=f"{os.path.getsize(fn)}:{int(os.path.getmtime(fn))}"
    if man.get(k,{}).get('sig')==sig and os.path.exists(outp):
        VMAP[k]=[u['out'],man[k]['dur']]; keep.add(os.path.basename(outp)); continue
    raw=subprocess.run(['ffmpeg','-v','error','-i',fn,'-ac','1','-ar',str(SR),'-f','s16le','-'],capture_output=True).stdout
    n=len(raw)//2; sm=struct.unpack(f'<{n}h',raw)
    a=0
    while a<n and abs(sm[a])<300: a+=1
    b=n
    while b>a and abs(sm[b-1])<40: b-=1      # 句尾只切掉真正的數位靜音，保留輕聲尾音
    a=max(0,a-int(SR*.05)); raw=raw[a*2:b*2]+b'\0\0'*int(SR*.25)
    if a>=n-int(SR*.05): raw=b'\0\0'*int(SR*.9)            # 「……」停頓
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-codec:a','libmp3lame','-b:a','48k',outp],input=raw,check=True)
    dur=round(len(raw)/2/SR,3); man[k]={'sig':sig,'dur':dur}; VMAP[k]=[u['out'],dur]; keep.add(os.path.basename(outp))
if not os.path.exists(f'{OUT}/voice/_silence.mp3'):
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-codec:a','libmp3lame','-b:a','32k',f'{OUT}/voice/_silence.mp3'],input=b'\0\0'*int(SR*.15),check=True)
for old in os.listdir(f'{OUT}/voice'):
    if old not in keep: os.remove(f'{OUT}/voice/'+old)
json.dump({k:man[k] for k in man if k in VMAP},open(MAN,'w'),ensure_ascii=False)
open(f'{OUT}/voicemap.js','w',encoding='utf8').write('window.VOICE='+json.dumps(VMAP,ensure_ascii=False,separators=(',',':'))+';\n')
print('voiced',len(VMAP),'missing',len(missing))
if missing and '--novoice' not in sys.argv:
    print('缺少配音：'); [print('  ✗',m) for m in missing[:20]]; sys.exit(1)
