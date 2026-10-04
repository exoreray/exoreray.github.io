// Filter detail within the captured audio block before it moves the sculpture.
// Raw audio and the output gain are left untouched.
export function softenMeshSignal(source, target, radius=16) {
  let sum=0,left=0,right=-1;
  for(let i=0;i<source.length;i++){
    const end=Math.min(source.length-1,i+radius);
    const begin=Math.max(0,i-radius);
    while(right<end)sum+=source[++right];
    while(left<begin)sum-=source[left++];
    target[i]=sum/(right-left+1);
  }
}

export function createMeshResponse(size=512) {
  return {wave:new Float32Array(size),gain:1,energy:0};
}

export function updateMeshResponse(response, signal, start, rms, targetGain, delta) {
  const dt=Math.min(Math.max(delta,0),.05);
  // Slow auto-ranging avoids repeatedly inflating quiet fragments. Geometry
  // uses a 70ms time constant; the beat envelope rises faster than it settles.
  response.gain+=(targetGain-response.gain)*(1-Math.exp(-dt/.24));
  const waveAlpha=1-Math.exp(-dt/.07);
  for(let i=0;i<response.wave.length;i++){
    const raw=signal?signal[start+i*2]*response.gain:0;
    const target=.6*Math.tanh(raw/.6);
    response.wave[i]+=(target-response.wave[i])*waveAlpha;
    if(Math.abs(response.wave[i])<.00001)response.wave[i]=0;
  }
  const targetEnergy=signal?Math.min(.85,rms*response.gain*3.5):0;
  const timeConstant=targetEnergy>response.energy ? .055 : .18;
  response.energy+=(targetEnergy-response.energy)*(1-Math.exp(-dt/timeConstant));
  if(response.energy<.00001)response.energy=0;
}
