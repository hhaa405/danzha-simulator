# 建置：合併劇本 → story.js；抽出台詞 → edge-tts 配音 → 依章節打包成 mp3 精靈 → voicemap.js
import re, os, sys, json, asyncio, subprocess, hashlib, wave, struct
import edge_tts
SRC=os.path.dirname(os.path.abspath(__file__)); OUT=os.path.dirname(SRC)
CACHE='/workspace/voicecache'; os.makedirs(CACHE,exist_ok=True)
story=open(f'{SRC}/story_a.txt',encoding='utf8').read()+'\n'+open(f'{SRC}/story_b.txt',encoding='utf8').read()
meta=open(f'{SRC}/meta.js',encoding='utf8').read()
esc=story.replace('\\','\\\\').replace('`','\\`').replace('${','\\${')
open(f'{OUT}/story.js','w',encoding='utf8').write(meta+'\nwindow.STORY_SRC=`'+esc+'`;\n')

# 與 engine.js 相同的解析規則
lines=[]; node=None; pov='ag9'
for raw in story.split('\n'):
    l=raw.strip()
    if not l or l.startswith('//'): continue
    if l.startswith('== '): node=l[3:].strip(); continue
    m=re.match(r'^\[(A|B|R|N)\]\s*',l); tag=None
    if m: tag=m.group(1); l=l[m.end():]
    camp='A' if node and node[0]=='a' else 'B'
    if l.startswith('-') or l.startswith('@') or l.startswith('?'): continue
    if l.startswith('!'):
        b=l[1:].strip().split(None,1)
        if b and b[0]=='pov': pov=b[1].strip()
        continue
    if l.startswith('>'):
        t=l[1:].strip(); vp=(pov+'~') if camp=='A' else 'nar'; lines.append((node,vp,'n',t)); continue
    s=re.match(r'^([a-z]+\d*)(?:\.([nsux]))?\s*[:：]\s*(.+)$',l)
    if s: lines.append((node,s.group(1),s.group(2) or 'n',s.group(3).strip()))

VO={ # 角色: (聲音, 語速%, 音高Hz, 音量%)
 'ag9':('zh-CN-YunxiNeural',-2,14,0),'ag14':('zh-CN-YunxiNeural',-6,2,0),'ag17':('zh-CN-YunxiNeural',-8,-6,0),'ag22':('zh-CN-YunjianNeural',-10,-2,0),
 'me12':('zh-TW-YunJheNeural',8,16,0),'me15':('zh-TW-YunJheNeural',6,8,0),'me20':('zh-TW-YunJheNeural',4,0,0),'nar':('zh-TW-YunJheNeural',-6,-4,0),
 'mate':('zh-CN-YunxiaNeural',12,16,0),'tch':('zh-TW-HsiaoChenNeural',-2,0,0),'uncle':('zh-CN-YunyangNeural',-14,-16,0),
 'mra':('zh-CN-YunjianNeural',-12,-12,0),'chef':('zh-CN-YunyangNeural',4,6,5),'kai':('zh-CN-YunxiaNeural',8,-4,0),
 'mom':('zh-CN-shaanxi-XiaoniNeural',-4,0,0),'qing14':('zh-TW-HsiaoYuNeural',2,12,0),'qing22':('zh-TW-HsiaoYuNeural',-2,2,0),
 'yu':('zh-CN-XiaoyiNeural',-4,0,0),'viv':('zh-CN-XiaoxiaoNeural',10,-4,0)}
for a in ['ag9','ag14','ag17','ag22']:
    v,r,p,vol=VO[a]; VO[a+'~']=(v,r-10,p-2,-25)
EMO={'n':(0,0,0),'s':(4,3,0),'u':(10,8,5),'x':(-6,-4,0)}
def key(vp,emo,t): return f'{vp}|{emo}|{t}'
uniq={}
for node,vp,emo,t in lines:
    if vp not in VO: continue
    k=key(vp,emo,t); grp=node[:2]
    if k not in uniq: uniq[k]=(grp,vp,emo,t)
print('lines',len(lines),'unique',len(uniq))
def fname(k): return CACHE+'/'+hashlib.md5(k.encode()).hexdigest()+'.mp3'
f=lambda x,u: f"{'+' if x>=0 else ''}{x}{u}"
async def one(k,vp,emo,t,sem):
    out=fname(k)
    if os.path.exists(out) and os.path.getsize(out)>800: return
    v,r,p,vol=VO[vp]; er,ep,ev=EMO[emo]; r+=er; p+=ep; vol=max(-80,min(50,vol+ev))
    async with sem:
        for i in range(4):
            try:
                await edge_tts.Communicate(t,v,rate=f(r,'%'),pitch=f(p,'Hz'),volume=f(vol,'%')).save(out)
                if os.path.getsize(out)>800: return
            except Exception as e: print('retry',vp,t[:10],e); await asyncio.sleep(2+i*2)
async def gen():
    sem=asyncio.Semaphore(8)
    await asyncio.gather(*[one(k,vp,emo,t,sem) for k,(g,vp,emo,t) in uniq.items()])
if '--novoice' not in sys.argv: asyncio.run(gen())
# 打包
SR=24000; GAP=int(SR*0.4)
groups={}
for k,(g,vp,emo,t) in uniq.items(): groups.setdefault(g,[]).append(k)
os.makedirs(f'{OUT}/voice',exist_ok=True)
for old in os.listdir(f'{OUT}/voice'): os.remove(f'{OUT}/voice/'+old)
VMAP={}; FILES=[]
for gi,g in enumerate(sorted(groups)):
    pcm=bytearray(b'\0\0'*int(SR*0.2)); 
    for k in groups[g]:
        fn=fname(k)
        if not os.path.exists(fn): continue
        raw=subprocess.run(['ffmpeg','-v','error','-i',fn,'-ac','1','-ar',str(SR),'-f','s16le','-'],capture_output=True).stdout
        if len(raw)<1000: continue
        # 去頭尾靜音
        n=len(raw)//2; sm=struct.unpack(f'<{n}h',raw); th=300
        a=0
        while a<n and abs(sm[a])<th: a+=1
        b=n
        while b>a and abs(sm[b-1])<th: b-=1
        a=max(0,a-int(SR*.03)); b=min(n,b+int(SR*.08)); raw=raw[a*2:b*2]
        start=len(pcm)//2/SR; pcm+=raw; dur=len(raw)//2/SR; pcm+=b'\0\0'*GAP
        VMAP[k]=[len(FILES),round(start,3),round(dur,3)]
    name=f'voice/{g}.mp3'
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-codec:a','libmp3lame','-b:a','40k','-write_xing','0',f'{OUT}/{name}'],input=bytes(pcm),check=True)
    FILES.append(name); print(name,round(len(pcm)/2/SR),'s')
open(f'{OUT}/voicemap.js','w',encoding='utf8').write('window.VOICE_FILES='+json.dumps(FILES)+';\nwindow.VOICE='+json.dumps(VMAP,ensure_ascii=False,separators=(',',':'))+';\n')
print('voiced',len(VMAP))
