import json,asyncio,re,os,subprocess,sys
import edge_tts,opencc
cc=opencc.OpenCC('t2s')
L=json.load(open('/workspace/danzha/v3/lines.json'))
VOICE={'nar':('zh-TW-YunJheNeural',-4,-3,0),'me':('zh-CN-YunxiaNeural',4,0,0),'i':('zh-CN-YunxiaNeural',-8,-3,-25),
'sis':('zh-TW-HsiaoChenNeural',0,0,0),'desk':('zh-TW-HsiaoYuNeural',0,4,0),'ai':('zh-CN-XiaoyiNeural',5,4,0),
'mei':('zh-CN-XiaoxiaoNeural',-4,-6,0),'qing':('zh-CN-XiaoxiaoNeural',10,14,0),'fat':('zh-CN-YunxiNeural',8,-8,5),
'dir':('zh-CN-YunjianNeural',-6,-10,10),'teacher':('zh-CN-YunyangNeural',4,0,10),'boy':('zh-CN-YunxiNeural',0,0,0),'crowd':('zh-CN-YunxiNeural',12,6,10)}
EMO={'平靜':(0,0,0),'開心':(10,12,5),'害羞':(-10,6,-20),'生氣':(12,4,15),'哭':(-18,-8,-10),'驚訝':(15,18,10),'吐槽':(6,-6,0),'緊張':(18,8,0),'悲傷':(-12,-6,-8)}
EX={'happy':'開心','smile':'開心','love':'開心','wow':'驚訝','shy':'害羞','angry':'生氣','cry':'哭','sad':'哭','hurt':'哭','shock':'驚訝','smug':'吐槽','tease':'吐槽'}
def emo(l):
  e=EX.get(l['expr'])
  if e: return e
  t=l['text'];m=l['mood']
  if m=='red':return '緊張'
  if m in('dark','blue'):return '悲傷'
  if l['who'] in('nar','i'):
    if '！' in t and '?' not in t: return '吐槽' if l['who']=='nar' else '緊張'
    return '平靜'
  if '！！' in t:return '驚訝'
  if '！' in t:return '開心'
  return '平靜'
def fnv(s):
  h=0x811c9dc5
  for b in s.encode('utf-16-le')[::2] if False else [ord(c) for c in s]:
    h^=b;h=(h*0x01000193)&0xffffffff
  return '%08x'%h
def clean(t):
  t2=re.sub(r'（[^）]*）','',t)
  if not t2.strip(): t2=t.strip('（）')
  t2=t2.replace('「','').replace('」','').replace('～','').replace('~','').replace('——','，').replace('……','…')
  t2=re.sub(r'[\U0001F000-\U0001FFFF\u2600-\u27BF\uFE0F]','',t2)
  return t2.strip()
sem=asyncio.Semaphore(2);man={}
async def one(l):
  key=fnv(l['who']+'|'+l['text']);v,br,bp,bv=VOICE.get(l['who'],VOICE['boy']);e=emo(l);er,ep,ev=EMO[e]
  rate=br+er;pitch=bp+ep;vol=max(-50,min(50,bv+ev))
  txt=clean(l['text']);
  if v.startswith('zh-CN'):txt=cc.convert(txt)
  out=f'/workspace/danzha/v3/voice/{key}.mp3';man[key]={'who':l['who'],'emo':e,'rate':rate,'pitch':pitch,'vol':vol,'voice':v}
  if os.path.exists(out) and os.path.getsize(out)>1500:return
  async with sem:
    for tr in range(4):
      try:
        c=edge_tts.Communicate(txt,v,rate=f'{rate:+d}%',pitch=f'{pitch:+d}Hz',volume=f'{vol:+d}%')
        await c.save(out+'.raw.mp3')
        subprocess.run(['ffmpeg','-y','-loglevel','error','-i',out+'.raw.mp3','-ac','1','-ar','24000','-b:a','32k',out],check=True);os.remove(out+'.raw.mp3');return
      except Exception as ex:
        print('retry',key,ex,file=sys.stderr);await asyncio.sleep(2+tr*3)
async def main():
  await asyncio.gather(*[one(l) for l in L])
  json.dump(man,open('/workspace/danzha/v3/voice_manifest.json','w'),ensure_ascii=False)
  print('done',len(man))
asyncio.run(main())
