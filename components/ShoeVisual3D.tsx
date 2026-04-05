'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '@/lib/store';

const CARD_W = 0.72;
const CARD_H = 0.004; // thickness of one card
const CARD_D = 1.02;
const MAX_STACK_HEIGHT = 1.1; // world units for a full shoe

// Card back color for stacks
const BACK_MAT_PROPS = { color: '#1a3a6c', roughness: 0.4, metalness: 0.05 };
const GOLD           = '#d4af37';

const MIN_VISIBLE = 0.06; // minimum height so even 1 card is clearly visible

function CardStack({
  position,
  count,
  total,
  label,
  labelColor = '#d4af37',
}: {
  position: [number, number, number];
  count: number;
  total: number;
  label: string;
  labelColor?: string;
}) {
  const ratio = Math.max(0, count / total);
  // Always show at least MIN_VISIBLE height when any cards are present
  const stackHeight = count > 0
    ? Math.max(MIN_VISIBLE, ratio * MAX_STACK_HEIGHT)
    : 0;
  const numSlices = count > 0
    ? Math.max(2, Math.round(ratio * 16))
    : 0;

  const slices = useMemo(() => {
    if (numSlices === 0) return [];
    return Array.from({ length: numSlices }, (_, i) => ({
      y:    (i / numSlices) * stackHeight,
      rotY: (Math.random() - 0.5) * 0.04,
    }));
  }, [numSlices, stackHeight]);

  if (count <= 0 || stackHeight === 0) {
    return (
      <group position={position}>
        {/* Empty tray outline */}
        <mesh>
          <boxGeometry args={[CARD_W + 0.04, 0.025, CARD_D + 0.04]} />
          <meshStandardMaterial color="#222" roughness={0.9} metalness={0.2} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      {/* Tray base */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[CARD_W + 0.08, 0.04, CARD_D + 0.08]} />
        <meshStandardMaterial color="#1a0e06" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Card stack slices */}
      {slices.map((s, i) => (
        <mesh key={i} position={[0, s.y + CARD_H / 2, 0]} rotation={[0, s.rotY, 0]}>
          <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
          <meshStandardMaterial {...BACK_MAT_PROPS} />
        </mesh>
      ))}

      {/* Solid fill block underneath slices for clean look */}
      <mesh position={[0, stackHeight / 2, 0]}>
        <boxGeometry args={[CARD_W - 0.01, stackHeight, CARD_D - 0.01]} />
        <meshStandardMaterial color="#0d2447" roughness={0.5} />
      </mesh>

      {/* Gold border on top card */}
      <mesh position={[0, stackHeight + 0.001, 0]}>
        <boxGeometry args={[CARD_W, 0.003, CARD_D]} />
        <meshStandardMaterial color={BACK_MAT_PROPS.color} roughness={0.3} />
      </mesh>

      {/* Gold edge strip */}
      <mesh position={[CARD_W / 2 + 0.005, stackHeight / 2, 0]}>
        <boxGeometry args={[0.01, stackHeight + 0.02, CARD_D + 0.02]} />
        <meshStandardMaterial color={GOLD} metalness={0.8} roughness={0.2} emissive={GOLD} emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}

export default function ShoeVisual3D() {
  const { shoe, settings } = useGameStore();

  const total    = settings.numDecks * 52;
  const remaining = shoe.length;
  const used      = total - remaining;

  return (
    <group>
      {/* Remaining cards — shoe on RIGHT side (player's POV) */}
      <CardStack
        position={[5.5, 0.22, -1.5]}
        count={remaining}
        total={total}
        label="Remaining"
      />

      {/* Used/discarded cards — discard on LEFT side (player's POV) */}
      <CardStack
        position={[-5.5, 0.22, -1.5]}
        count={used}
        total={total}
        label="Discarded"
        labelColor="#a09070"
      />
    </group>
  );
}
