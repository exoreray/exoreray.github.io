import { useRef } from 'react';

export const useFadeInModel = () => {
  const groupRef = useRef();
  // No fade-in animation to prevent size jumping
  return { groupRef };
};
