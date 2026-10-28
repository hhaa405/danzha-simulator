import numpy as np, subprocess, wave, os
SR=32000
rng=np.random.default_rng(7)
def mtof(m): return 440*2**((m-69)/12)
def env(n,a,d,s=0.0,r=0.05):
    t=np.arange(n)/SR; e=np.minimum(1,t/max(a,1e-4)); e*=s+(1-s)*np.exp(-t/max(d,1e-4))
    rn=int(r*SR); 
    if rn< n: e[-rn:]*=np.linspace(1,0,rn)
    return e
def piano(f,dur,v=.3):
    n=int((dur+1.2)*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for h,a in [(1,1),(2,.45),(3,.22),(4,.12),(5,.06),(6,.03)]:
        fh=f*h*(1+0.0004*h*h); x+=a*np.sin(2*np.pi*fh*t)*np.exp(-t*(1.2+h*0.9))
    x*=np.minimum(1,t/0.004); rel=int(dur*SR)
    x[rel:]*=np.exp(-np.arange(n-rel)/SR*6)
    return v*x
def epiano(f,dur,v=.25):
    n=int((dur+1)*SR); t=np.arange(n)/SR
    mod=np.sin(2*np.pi*f*t)*1.5*np.exp(-t*3)
    x=np.sin(2*np.pi*f*t+mod)*np.exp(-t*1.6)*np.minimum(1,t/0.005)
    rel=int(dur*SR); x[rel:]*=np.exp(-np.arange(n-rel)/SR*5); return v*x
def bell(f,dur,v=.12):
    n=int((dur+1.5)*SR); t=np.arange(n)/SR
    x=np.sin(2*np.pi*f*t+2*np.sin(2*np.pi*f*3.5*t)*np.exp(-t*4))*np.exp(-t*2.2)
    return v*x*np.minimum(1,t/0.002)
def lp(x,c):
    a=np.exp(-2*np.pi*c/SR); y=np.zeros_like(x); s=0.0
    # vectorized one-pole via lfilter-like loop in chunks
    from itertools import accumulate
    out=np.empty_like(x); s=0
    for i in range(len(x)):
        s=(1-a)*x[i]+a*s; out[i]=s
    return out
def pad(freqs,dur,v=.08,bright=1800):
    n=int((dur+0.8)*SR); t=np.arange(n)/SR; x=np.zeros(n)
    for f in freqs:
        for d in (-0.12,0,0.12):
            ff=f*2**(d/12); ph=(t*ff)%1; x+=(2*ph-1)
    x/=len(freqs)*3
    # cheap lowpass with moving average
    k=max(1,int(SR/bright)); x=np.convolve(x,np.ones(k)/k,'same')
    e=env(n,0.6,9,1,0.8); return v*x*e
def string_(freqs,dur,v=.07): return pad(freqs,dur,v,1200)
def bass(f,dur,v=.22):
    n=int((dur+0.1)*SR); t=np.arange(n)/SR
    x=np.sin(2*np.pi*f*t)+.3*np.sin(4*np.pi*f*t); return v*x*env(n,0.01,0.6,0.5,0.08)
def pluck(f,dur,v=.18):
    n=int((dur+.3)*SR); t=np.arange(n)/SR; ph=(t*f)%1
    x=(2*ph-1)*np.exp(-t*9); k=6; x=np.convolve(x,np.ones(k)/k,'same'); return v*x
def saw(f,dur,v=.08):
    n=int((dur+.05)*SR); t=np.arange(n)/SR; x=sum((2*((t*f*2**(d/12))%1)-1) for d in(-.1,.1))/2
    k=5; x=np.convolve(x,np.ones(k)/k,'same'); return v*x*env(n,0.01,0.3,0.6,0.04)
def kick(v=.6):
    n=int(.35*SR); t=np.arange(n)/SR; f=50+90*np.exp(-t*30); return v*np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t*9)
def snare(v=.25):
    n=int(.25*SR); t=np.arange(n)/SR; return v*(rng.uniform(-1,1,n)*np.exp(-t*18)+.5*np.sin(2*np.pi*190*t)*np.exp(-t*25))
def hat(v=.06):
    n=int(.06*SR); x=rng.uniform(-1,1,n); x=np.diff(np.concatenate([[0],x])); return v*x*np.exp(-np.arange(n)/SR*60)
def reverb(x,sec=2.0,mix=.25):
    n=int(sec*SR); ir=rng.uniform(-1,1,n)*np.exp(-np.arange(n)/SR*(6.9/sec)); ir[:int(.01*SR)]*=0
    N=len(x); ir=ir[:N]
    y=np.fft.irfft(np.fft.rfft(x)*np.fft.rfft(ir,N),N)
    y/=np.max(np.abs(y))+1e-9; return x*(1-mix)+y*mix*np.max(np.abs(x))
NOTE={'C':0,'D':2,'E':4,'F':5,'G':7,'A':9,'B':11}
def chord(name,octv=4):
    root=NOTE[name[0]]+(1 if '#' in name else 0)-(1 if name[1:2]=='b' else 0); minor='m' in name.replace('maj','')
    ints=[0,3 if minor else 4,7]+([11] if 'maj7' in name else [10] if '7' in name else [])
    return [12*(octv+1)+root+i for i in ints]
def render(spec,name):
    bpm=spec['bpm'];beat=60/bpm;prog=spec['prog'];bars=len(prog);L=bars*4*beat
    total=int((3*L+4)*SR); mix=np.zeros(total)
    def add(sig,t):
        i=int(t*SR); j=min(total,i+len(sig)); mix[i:j]+=sig[:j-i]
    scale=spec['scale']
    for rep in range(3):
        mel_prev=None
        r2=np.random.default_rng(11)  # same melody each repetition -> seamless
        for b,ch in enumerate(prog):
            t0=rep*L+b*4*beat; notes=chord(ch,spec.get('oct',4))
            spec['comp'](add,t0,beat,notes,b)
            # melody
            for (pos,du) in spec['rhythm'][b%len(spec['rhythm'])]:
                cands=[n+12 for n in notes]+[m for m in scale if notes[0]+10<=m<=notes[0]+26]
                if mel_prev is None: m=cands[0]
                else:
                    near=sorted(cands,key=lambda c:abs(c-mel_prev)+r2.uniform(0,3)); m=near[0] if r2.random()<.7 else near[1]
                mel_prev=m; add(spec['lead'](mtof(m),du*beat),t0+pos*beat)
            for k in range(4):
                if 'drum' in spec: spec['drum'](add,t0+k*beat,beat,k,b)
    seg=mix[int(L*SR):int(2*L*SR)].copy()
    seg=reverb(seg,spec.get('rev',1.8),spec.get('revmix',.22))
    seg=seg/np.max(np.abs(seg))*0.6
    seg16=(seg*32767).astype(np.int16)
    wav=f'/tmp/{name}.wav'
    with wave.open(wav,'wb') as w: w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes(seg16.tobytes())
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wav,'-ac','1','-b:a','64k',f'/workspace/danzha/v3/music/{name}.mp3'],check=True)
    print(name,round(L,2),'s')
def sc(root,minor=False):
    ints=[0,2,3,5,7,8,10] if minor else [0,2,4,5,7,9,11]; return [root+12*o+i for o in range(0,4) for i in ints]
R8=[[(0,1),(1,.5),(1.5,.5),(2,1.5)],[(0,.5),(.5,.5),(1,1),(2.5,1.5)],[(0,2),(2,1),(3,1)],[(0,1),(1,1),(2,2)]]
def comp_arp(pat=(0,1,2,1,0,2,1,2),inst=None,bv=.2):
    def f(add,t0,beat,notes,b):
        for k,ix in enumerate(pat): add((inst or piano)(mtof(notes[ix%len(notes)]),beat*.6,.16),t0+k*beat/2)
        add(bass(mtof(notes[0]-24),beat*3.5,bv),t0)
    return f
def drums_light(add,t,beat,k,b):
    add(hat(.04),t); add(hat(.025),t+beat/2)
    if k in(0,2): add(kick(.25),t)
def drums_rock(add,t,beat,k,b):
    add(hat(.05),t);add(hat(.035),t+beat/2)
    if k in(0,2): add(kick(.6),t)
    if k==2 and b%2: add(kick(.4),t+beat/2)
    if k in(1,3): add(snare(.3),t)
def drums_tense(add,t,beat,k,b):
    if k in (0,): add(kick(.45),t); add(kick(.3),t+beat*.35)
    add(hat(.03),t+beat*.5)
SPECS={
 'daily':dict(bpm=104,prog=['C','Am','F','G','C','Em','F','G'],scale=sc(60),rhythm=R8,lead=lambda f,d:bell(f,d,.09),comp=comp_arp(),drum=drums_light),
 'crush':dict(bpm=82,prog=['Fmaj7','Em7','Dm7','Cmaj7','Fmaj7','Em7','Dm7','G'],scale=sc(60),rhythm=[[(0,1.5),(2,2)],[(0,1),(1,1),(2,2)]],lead=lambda f,d:bell(f,d,.1),
   comp=lambda add,t0,beat,notes,b:(add(pad([mtof(n) for n in notes],4*beat,.05,2500),t0),[add(epiano(mtof(notes[i%len(notes)]),beat*.8,.14),t0+k*beat) for k,i in enumerate((0,2,1,3))],add(bass(mtof(notes[0]-24),beat*3.6,.18),t0)),drum=lambda add,t,beat,k,b:add(hat(.025),t+beat/2),rev=2.5,revmix=.3),
 'tense':dict(bpm=120,prog=['Am','Am','F','E','Am','Am','Dm','E'],scale=sc(57,True),rhythm=[[(0,.5),(1.5,.5),(3,.5)],[(0,1),(2,.5),(2.5,.5)]],lead=lambda f,d:pluck(f,d,.12),
   comp=lambda add,t0,beat,notes,b:(add(string_([mtof(n-12) for n in notes],4*beat,.05),t0),[add(pluck(mtof(notes[0]-12),beat*.4,.16),t0+k*beat/2) for k in range(8)]),drum=drums_tense,rev=1.2,revmix=.18),
 'sports':dict(bpm=144,prog=['D','D','G','A','Bm','G','A','A'],scale=sc(62),rhythm=[[(0,1),(1,.5),(1.5,.5),(2,1),(3,1)],[(0,.5),(.5,.5),(1,1),(2,2)]],lead=lambda f,d:saw(f,d,.07),oct=3,
   comp=lambda add,t0,beat,notes,b:([add(saw(mtof(n),beat*.45,.05),t0+k*beat/2) for k in range(8) for n in notes[:2]],[add(bass(mtof(notes[0]-12),beat*.45,.22),t0+k*beat/2) for k in range(8)]),drum=drums_rock,rev=1.0,revmix=.12),
 'sad':dict(bpm=66,prog=['Am','F','C','G','Am','F','Dm','E'],scale=sc(57,True),rhythm=[[(0,2),(2,1),(3,1)],[(0,3),(3,1)],[(0,1),(1,1),(2,2)]],lead=lambda f,d:piano(f,d,.2),
   comp=lambda add,t0,beat,notes,b:(add(string_([mtof(n) for n in notes],4*beat,.05),t0),[add(piano(mtof(notes[i]),beat*1.5,.1),t0+k*beat) for k,i in enumerate((0,1,2,1))],add(bass(mtof(notes[0]-24),beat*3.8,.16),t0)),rev=3.0,revmix=.35),
 'ending':dict(bpm=72,prog=['C','G','Am','Em','F','C','Dm','G'],scale=sc(60),rhythm=[[(0,1.5),(1.5,.5),(2,2)],[(0,1),(1,1),(2,1),(3,1)],[(0,4)]],lead=lambda f,d:piano(f,d,.22),
   comp=lambda add,t0,beat,notes,b:(add(string_([mtof(n) for n in notes],4*beat,.06),t0),[add(piano(mtof(notes[i%3]),beat*.9,.09),t0+k*beat/2) for k,i in enumerate((0,1,2,1,0,1,2,1))],add(bass(mtof(notes[0]-24),beat*3.8,.16),t0)),rev=2.8,revmix=.3),
}
import sys
for k in (sys.argv[1:] or SPECS): render(SPECS[k],k)
