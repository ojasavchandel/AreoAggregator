import { useGLTF } from '@react-three/drei';

export default function Airplane() {
  const { scene } = useGLTF('/models/airplane.glb');
  
  return (
    <group dispose={null} scale={0.6} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/models/airplane.glb');
