'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import Table3D from './Table3D';
import CardsOnTable from './CardsOnTable';
import ShoeVisual3D from './ShoeVisual3D';
import CasinoEnvironment from './CasinoEnvironment';
import CasinoBackground360 from './CasinoBackground360';
import { Dealer, PitBoss } from './CasinoCharacters';

/**
 * Invisible floor plane — only receives shadows so the table and
 * characters cast realistic shadows onto the casino floor shown
 * in the 360 panorama.
 */
function ShadowFloor() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.22, 0]}
      receiveShadow
    >
      <planeGeometry args={[30, 30]} />
      <shadowMaterial opacity={0.45} />
    </mesh>
  );
}

export default function GameScene() {
  return (
    <Canvas
      shadows="soft"
      camera={{ position: [0, 5.5, 8.5], fov: 60, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.85,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
      style={{ width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>

        {/* ── 360 panorama — must load first ── */}
        <CasinoBackground360 />

        {/* ── Lighting layer ── */}
        <CasinoEnvironment />

        {/* ── Dedicated table overhead spots — high up, softer ── */}
        <spotLight
          position={[0, 22, 1]}
          angle={0.35}
          penumbra={0.7}
          intensity={5}
          color="#fff8e0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.001}
          target-position={[0, 0, 0]}
        />
        <spotLight
          position={[-6, 20, 3]}
          angle={0.35}
          penumbra={0.7}
          intensity={3}
          color="#ffeecc"
          castShadow={false}
          target-position={[0, 0, 0]}
        />
        <spotLight
          position={[6, 20, 3]}
          angle={0.35}
          penumbra={0.7}
          intensity={3}
          color="#ffeecc"
          castShadow={false}
          target-position={[0, 0, 0]}
        />

        {/* ── Soft front fill ── */}
        <directionalLight position={[0, 10, 18]} intensity={1} color="#fff5e8" />

        {/* ── Table, cards, chips ── */}
        <Table3D />
        <ShoeVisual3D />
        <CardsOnTable />

        {/* ── Shadow-only floor ── */}
        <ShadowFloor />

        {/* ── Characters (scale=4 inside, raised so chest/head are visible above table) ── */}
        <Dealer  position={[0,   -1.59, -5.0]} />
        <PitBoss position={[3.5,  0.80, -8.5]} />

        {/* ── Soft shadows under table ── */}
        <ContactShadows
          position={[0, -0.01, 0]}
          opacity={0.4}
          scale={18}
          blur={2.5}
          far={3}
          color="#000"
        />

        {/* ── Camera controls: allow full horizontal 360 spin,
             limited vertical so you can't look straight down ── */}
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={4}
          maxDistance={18}
          target={[0, 0.5, 0]}
          enableDamping
          dampingFactor={0.06}
          autoRotate={false}
        />

      </Suspense>
    </Canvas>
  );
}
