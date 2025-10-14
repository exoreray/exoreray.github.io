import { useGLTF } from '@react-three/drei';

const F1Car = () => {
  const { scene } = useGLTF('/f1_car_concept.glb');
  return <primitive object={scene} scale={1.6} />;
};

export default F1Car;
