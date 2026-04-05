'use client';

import { useMemo } from 'react';

const CHIP_COLORS: Record<number, { base: string; stripe: string; label: string }> = {
  5:   { base: '#c0392b', stripe: '#f39c12', label: '#fff' },
  10:  { base: '#2980b9', stripe: '#ecf0f1', label: '#fff' },
  25:  { base: '#27ae60', stripe: '#2ecc71', label: '#fff' },
  50:  { base: '#1a1a1a', stripe: '#d4af37', label: '#d4af37' },
};

function getChipColor(value: number) {
  return CHIP_COLORS[value] ?? { base: '#555', stripe: '#aaa', label: '#fff' };
}

interface ChipProps {
  position: [number, number, number];
  value: number;
  stackCount?: number;  // how many chips in this stack
}

export function Chip({ position, value, stackCount = 1 }: ChipProps) {
  const colors = getChipColor(value);
  const visibleCount = Math.min(stackCount, 10);

  return (
    <group position={position}>
      {Array.from({ length: visibleCount }).map((_, i) => (
        <group key={i} position={[0, i * 0.048, 0]}>
          {/* Main disc */}
          <mesh castShadow>
            <cylinderGeometry args={[0.19, 0.19, 0.042, 32]} />
            <meshStandardMaterial color={colors.base} roughness={0.35} metalness={0.1} />
          </mesh>
          {/* 8-segment stripe ring */}
          <mesh>
            <cylinderGeometry args={[0.165, 0.165, 0.044, 8]} />
            <meshStandardMaterial color={colors.stripe} roughness={0.5} />
          </mesh>
          {/* Top face disc */}
          <mesh position={[0, 0.023, 0]}>
            <cylinderGeometry args={[0.105, 0.105, 0.003, 32]} />
            <meshStandardMaterial color={colors.base} roughness={0.25} metalness={0.05} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

interface BetDisplayProps {
  /** The raw array of chip denominations the player clicked, e.g. [25, 25, 10] */
  placedChips: number[];
  position: [number, number, number];
}

/**
 * Groups placed chips by denomination so two $25 chips appear as one
 * stack of 2 rather than two separate stacks of different colors.
 */
export function BetDisplay({ placedChips, position }: BetDisplayProps) {
  if (placedChips.length === 0) return null;

  // Group by denomination, preserving insertion order of first occurrence
  const grouped = useMemo(() => {
    const order: number[] = [];
    const counts: Record<number, number> = {};
    for (const v of placedChips) {
      if (!counts[v]) { order.push(v); counts[v] = 0; }
      counts[v]++;
    }
    return order.map((v) => ({ value: v, count: counts[v] }));
  }, [placedChips]);

  const stackSpacing = 0.44;
  const totalWidth = (grouped.length - 1) * stackSpacing;

  return (
    <group position={position}>
      {grouped.map(({ value, count }, i) => (
        <Chip
          key={value}
          position={[i * stackSpacing - totalWidth / 2, 0, 0]}
          value={value}
          stackCount={count}
        />
      ))}
    </group>
  );
}
