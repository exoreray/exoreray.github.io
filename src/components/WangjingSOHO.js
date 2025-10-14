import { useGLTF } from '@react-three/drei';

const WangjingSOHO = () => {
  const { scene } = useGLTF('/soho.glb');
  return <primitive object={scene} scale={15} position={[0, 0, 0]} />;
};

export default WangjingSOHO;
