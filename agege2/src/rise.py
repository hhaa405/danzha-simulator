# 句首的「蛤」改唸上揚的 ㄏㄚˊ：拉長第一個音節並把音高拉成第二聲（Praat PSOLA）
import sys, parselmouth as pm, numpy as np
from parselmouth.praat import call
src,dst=sys.argv[1],sys.argv[2]; up=float(sys.argv[3]) if len(sys.argv)>3 else 1.55; want=float(sys.argv[4]) if len(sys.argv)>4 else .32
s=pm.Sound(src)
it=s.to_intensity(); xs=it.xs(); iv=it.values[0]; mx=iv.max()
on=np.where(iv>mx-22)[0]; a=on[0]; b=a
while b+1<len(iv) and iv[b+1]>mx-22: b+=1
t0,t1=xs[a],xs[b]
p=s.to_pitch_ac(time_step=0.005,pitch_floor=60,pitch_ceiling=450,voicing_threshold=0.25)
f=p.selected_array['frequency']; pt_=p.xs(); sel=f[(pt_>=t0)&(pt_<=t1)&(f>0)]
base=float(np.median(sel)) if len(sel) else 110.
m=call(s,'To Manipulation',0.005,60,450)
pt=call(m,'Extract pitch tier'); call(pt,'Remove points between',t0-.02,t1+.02)
for i in range(11):
    x=i/10; call(pt,'Add point',t0+(t1-t0)*x, base*(0.92+(up-0.92)*x**1.4))
call([pt,m],'Replace pitch tier')
k=max(1.,want/max(.05,t1-t0))
dt=call(m,'Extract duration tier'); call(dt,'Add point',t0-.03,1); call(dt,'Add point',t0,k); call(dt,'Add point',t1,k); call(dt,'Add point',t1+.03,1)
call([dt,m],'Replace duration tier')
out=call(m,'Get resynthesis (overlap-add)'); out.save(dst,'WAV')
print('rise',round(t0,3),round(t1,3),round(base),'x%.1f'%k)
