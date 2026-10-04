import { memo } from 'react';
import ImprovedLetterRain from '../ImprovedLetterRain';

// Reuse the original renderer: glowing droplets and circular impact crests
// clipped by the viewport bottom, producing the original fan-like arcs.
function AtmosphericRain({ active }) {
  return <ImprovedLetterRain paused={!active} />;
}
export default memo(AtmosphericRain);
