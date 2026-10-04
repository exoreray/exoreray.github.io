export function createAudioOutput(player, Context, volume) {
  const context=new Context({latencyHint:'interactive'});
  const source=context.createMediaElementSource(player);
  const outputGain=context.createGain();
  const analyser=context.createAnalyser();
  analyser.fftSize=2048;analyser.smoothingTimeConstant=0;
  outputGain.gain.setValueAtTime(volume,context.currentTime);
  // The media element is unity gain. A single Web Audio gain stage controls
  // actual output, including browsers that ignore HTMLMediaElement.volume.
  player.volume=1;
  source.connect(outputGain);outputGain.connect(analyser);analyser.connect(context.destination);
  return {context,source,outputGain,analyser,data:new Uint8Array(analyser.frequencyBinCount),volume};
}

export function setOutputVolume(state, player, volume, immediate=false) {
  state.volume=volume;
  if(!state.outputGain){if(player)player.volume=volume;return;}
  if(player)player.volume=1;
  const param=state.outputGain.gain;
  const now=state.context.currentTime;
  if(immediate || state.context.state!=='running'){
    param.cancelScheduledValues(now);param.setValueAtTime(volume,now);
    return;
  }
  // A short ramp avoids clicks, and reaches exact silence at zero.
  if(param.cancelAndHoldAtTime)param.cancelAndHoldAtTime(now);
  else{
    const current=param.value;
    param.cancelScheduledValues(now);param.setValueAtTime(current,now);
  }
  param.linearRampToValueAtTime(volume,now+.015);
}
