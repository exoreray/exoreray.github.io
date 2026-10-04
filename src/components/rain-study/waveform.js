// Trigger on a rising zero crossing, like an oscilloscope. This stabilizes
// horizontal phase without averaging away transients or changing amplitude.
export function waveformStart(samples, visibleSamples) {
  const latest=Math.max(0,samples.length-visibleSamples);
  const earliest=Math.max(1,latest-Math.floor(samples.length/3));
  for(let i=latest;i>=earliest;i--){
    if(samples[i-1]<=0 && samples[i]>0 && samples[i]-samples[i-1]>.001)return i;
  }
  return latest;
}

export function waveformLevels(samples) {
  let peak=0,energy=0;
  for(let i=0;i<samples.length;i++){
    peak=Math.max(peak,Math.abs(samples[i]));
    energy+=samples[i]*samples[i];
  }
  return {peak,rms:Math.sqrt(energy/Math.max(1,samples.length))};
}

// Auto-ranging follows source loudness, not the user's volume setting. Reducing
// output must also reduce the displayed trace instead of being normalized away.
export function waveformDisplayGain(peak, outputVolume=1) {
  const sourcePeak=outputVolume>0?peak/outputVolume:0;
  return sourcePeak>0?Math.min(5,Math.max(1,.38/sourcePeak)):1;
}
