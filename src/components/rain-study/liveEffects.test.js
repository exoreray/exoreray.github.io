import { waveformDisplayGain, waveformLevels, waveformStart } from './waveform';

test('scope trigger stabilizes a crossing without changing the audio samples',()=>{
  const input=Float32Array.from([-.2,-.1,.1,.4,.2,-.3,-.2,.2,.5,.1,-.2,-.1]);
  const original=input.slice();
  const start=waveformStart(input,6);
  expect(start).toBe(2);
  expect(input.slice(start,start+6)).toEqual(original.slice(2,8));
  expect(input).toEqual(original);
  expect(start+6).toBeLessThanOrEqual(input.length);
});

test('silence and transients retain their real amplitude',()=>{
  expect(waveformLevels(new Float32Array(2048))).toEqual({peak:0,rms:0});
  const signal=Float32Array.from([0,.25,-.5,0]);
  const louder=Float32Array.from(signal,x=>x*2);
  expect(waveformLevels(louder).peak).toBe(waveformLevels(signal).peak*2);
  expect(waveformLevels(louder).rms).toBeCloseTo(waveformLevels(signal).rms*2);
  expect(waveformStart(new Float32Array(2048),1024)).toBe(1024);
});

test('scope uses the latest eligible crossing instead of adding an old-buffer delay',()=>{
  const input=Float32Array.from([-.2,.2,.4,.1,-.2,.2,.3,-.2,-.1,.1,.3,.2,-.2,.2,.1,0]);
  expect(waveformStart(input,6)).toBe(9);
});

test('scope auto-range preserves volume changes instead of amplifying them away',()=>{
  const sourcePeak=.2;
  const full=sourcePeak*waveformDisplayGain(sourcePeak,1);
  const quarter=sourcePeak*.25*waveformDisplayGain(sourcePeak*.25,.25);
  expect(quarter).toBeCloseTo(full*.25);
  expect(waveformDisplayGain(0,0)).toBe(1);
});

