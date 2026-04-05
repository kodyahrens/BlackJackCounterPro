'use client';

import * as THREE from 'three';

export default function Table3D() {
  return (
    <group>
      {/* Main felt surface */}
      <mesh receiveShadow position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 8]} />
        <meshStandardMaterial
          color="#0a5c2b"
          roughness={0.92}
          metalness={0.0}
        />
      </mesh>

      {/* Felt inner texture overlay (darker center) */}
      <mesh receiveShadow position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 6.5]} />
        <meshStandardMaterial
          color="#08521f"
          roughness={0.95}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Dealer area semi-circle line */}
      <mesh position={[0, -0.01, -1.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.8, 2.9, 64, 1, 0, Math.PI]} />
        <meshStandardMaterial color="#d4af37" roughness={0.5} />
      </mesh>

      {/* Betting circle */}
      <mesh position={[0, -0.01, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.55, 0.62, 48]} />
        <meshStandardMaterial color="#d4af37" roughness={0.5} />
      </mesh>

      {/* Wood rail - long sides */}
      <mesh position={[0, 0.06, -4.15]} castShadow receiveShadow>
        <boxGeometry args={[14.4, 0.22, 0.4]} />
        <meshStandardMaterial color="#3d1f0a" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.06, 4.15]} castShadow receiveShadow>
        <boxGeometry args={[14.4, 0.22, 0.4]} />
        <meshStandardMaterial color="#3d1f0a" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Wood rail - short sides */}
      <mesh position={[-7.1, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.22, 8.4]} />
        <meshStandardMaterial color="#3d1f0a" roughness={0.6} metalness={0.05} />
      </mesh>
      <mesh position={[7.1, 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.22, 8.4]} />
        <meshStandardMaterial color="#3d1f0a" roughness={0.6} metalness={0.05} />
      </mesh>

      {/* Table legs */}
      {[[-5.5, -5.5], [5.5, -5.5], [-5.5, 5.5], [5.5, 5.5]].map(([x, z], i) => (
        <mesh key={i} position={[x as number, -1.5, z as number]} castShadow>
          <cylinderGeometry args={[0.15, 0.2, 3, 12]} />
          <meshStandardMaterial color="#2a1005" roughness={0.7} />
        </mesh>
      ))}

      {/* Shoe / card dispenser box — RIGHT side (player's POV) */}
      <mesh position={[5.5, 0.2, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.5, 1.1]} />
        <meshStandardMaterial color="#1a0a04" roughness={0.8} metalness={0.1} />
      </mesh>
      <mesh position={[5.5, 0.32, -1.5]}>
        <boxGeometry args={[0.75, 0.04, 0.4]} />
        <meshStandardMaterial color="#2d1a08" roughness={0.6} />
      </mesh>

      {/* Discard tray — LEFT side (player's POV) */}
      <mesh position={[-5.5, 0.1, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.25, 1.1]} />
        <meshStandardMaterial color="#222" roughness={0.9} metalness={0.2} />
      </mesh>
    </group>
  );
}
