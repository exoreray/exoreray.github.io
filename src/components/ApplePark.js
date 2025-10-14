import { useGLTF } from '@react-three/drei';

const ApplePark = () => {
  const { scene } = useGLTF('/apple_park.glb');
  return <primitive object={scene} scale={0.8} />;
};

export default ApplePark;
