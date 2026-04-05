'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Pure lighting layer — no geometry walls/ceiling.
 * The 360 panorama provides all the visual environment.
 * These lights illuminate the 3D table, cards, chips and characters
 * so they look naturally lit inside the real casino photo.
 */

// Glowing chandelier bulb cluster (visible 3D glow + actual point light)
function ChandelierLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef<THREE.PointLight>(null!);
  const t = useRef(Math.random() * 10);

  useFrame((_, delta) => {
    t.current += delta;
    if (lightRef.current) {
      // Warm subtle flicker matching real incandescent bulbs
      lightRef.current.intensity =
        14 + Math.sin(t.current * 7.1) * 0.5 + Math.sin(t.current * 13.7) * 0.25;
    }
  });

  return (
    <group position={position}>
      {/* Visible glow sprite so the chandelier "exists" in 3D space */}
      <mesh>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial
          color="#ffe8a0"
          emissive="#ffcc40"
          emissiveIntensity={6}
          transparent
          opacity={0.7}
          roughness={0.0}
        />
      </mesh>
      {/* Surrounding halo */}
      <mesh>
        <sphereGeometry args={[0.38, 12, 12]} />
        <meshStandardMaterial
          color="#ffdd80"
          emissive="#ffaa00"
          emissiveIntensity={2}
          transparent
          opacity={0.18}
          roughness={0.0}
          side={THREE.BackSide}
        />
      </mesh>
      <pointLight
        ref={lightRef}
        intensity={14}
        color="#fff5c0"
        distance={22}
        decay={1.6}
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </group>
  );
}

// Wall sconce light (invisible mount, just the glow + light)
function SconceLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial
          color="#ffe890"
          emissive="#ffcc50"
          emissiveIntensity={5}
          transparent
          opacity={0.85}
          roughness={0.0}
        />
      </mesh>
      <pointLight intensity={2.5} color="#ffe8a0" distance={7} decay={2} />
    </group>
  );
}

export default function CasinoEnvironment() {
  return (
    <group>
      {/* ── Overhead chandeliers matching where they appear in the 360 photo ── */}
      <ChandelierLight position={[-4.5, 5.5, -2]} />
      <ChandelierLight position={[ 4.5, 5.5, -2]} />
      <ChandelierLight position={[ 0,   6.0,  2.5]} />
      <ChandelierLight position={[-4.5, 5.5,  5]} />
      <ChandelierLight position={[ 4.5, 5.5,  5]} />

      {/* ── Sconce fills — warm points at wall height ── */}
      <SconceLight position={[-7,  3.5, -8]} />
      <SconceLight position={[ 7,  3.5, -8]} />
      <SconceLight position={[-11, 3.5,  0]} />
      <SconceLight position={[ 11, 3.5,  0]} />
      <SconceLight position={[-7,  3.5,  7]} />
      <SconceLight position={[ 7,  3.5,  7]} />

      {/* ── Slot machine neon fills (colored accent light) ── */}
      <pointLight position={[-10, 1.5, -6]} intensity={3} color="#0088ff" distance={8} decay={2} />
      <pointLight position={[ 10, 1.5, -6]} intensity={3} color="#ff0066" distance={8} decay={2} />
      <pointLight position={[-10, 1.5,  4]} intensity={2} color="#00cc44" distance={7} decay={2} />
      <pointLight position={[ 10, 1.5,  4]} intensity={2} color="#ff6600" distance={7} decay={2} />

      {/* ── Ceiling cove warm fill ── */}
      <rectAreaLight
        position={[0, 7.5, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        width={20}
        height={16}
        intensity={6}
        color="#ffe8b0"
      />

      {/* ── Soft hemisphere ── */}
      <hemisphereLight color="#ffe8c0" groundColor="#1a0808" intensity={0.7} />
    </group>
  );
}
