import { Canvas } from '@react-three/fiber';
import { Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import Airplane from './Airplane';

export default function FlightCanvas() {
  return (
    <div className="absolute inset-0 z-0 h-[600px] pointer-events-auto">
      <Canvas frameloop="demand" dpr={1} camera={{ position: [0, 0, 14], fov: 45 }}>
        <color attach="background" args={['#f0f7ff']} />
        <ambientLight intensity={2.5} />
        <directionalLight position={[10, 15, 8]} intensity={3.5} color={'#ffffff'} />
        <Suspense fallback={null}>
          <PresentationControls 
            global 
            rotation={[0, -0.3, 0]} 
            polar={[-0.1, 0.2]} 
            azimuth={[-0.5, 0.5]} 
            config={{ mass: 2, tension: 400 }}
          >
            <Airplane />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={20} blur={2} frames={1} resolution={256} />
          </PresentationControls>
          <Environment preset="studio" />
        </Suspense>
      </Canvas>
    </div>
  );
}
