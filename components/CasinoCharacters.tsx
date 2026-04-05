'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BodyColors {
  skin: string;
  shirt: string;
  jacket: string;
  tie: string;
  pants: string;
  hair: string;
}

// ── Head ───────────────────────────────────────────────────────────────
function Head({ colors, position = [0, 0, 0] as [number, number, number] }: {
  colors: BodyColors;
  position?: [number, number, number];
}) {
  return (
    <group position={position}>
      {/* Head */}
      <mesh castShadow>
        <sphereGeometry args={[0.24, 22, 22]} />
        <meshStandardMaterial color={colors.skin} roughness={0.7} />
      </mesh>
      {/* Eyes */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.05, 0.22]}>
          <sphereGeometry args={[0.038, 10, 10]} />
          <meshStandardMaterial color="#111122" roughness={0.2} />
        </mesh>
      ))}
      {/* Eyebrows */}
      {[-0.09, 0.09].map((x, i) => (
        <mesh key={i} position={[x, 0.13, 0.22]} rotation={[0, 0, i === 0 ? 0.15 : -0.15]}>
          <boxGeometry args={[0.09, 0.018, 0.01]} />
          <meshStandardMaterial color={colors.hair} roughness={0.8} />
        </mesh>
      ))}
      {/* Nose */}
      <mesh position={[0, -0.03, 0.23]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={colors.skin} roughness={0.7} />
      </mesh>
      {/* Mouth */}
      <mesh position={[0, -0.1, 0.22]}>
        <boxGeometry args={[0.11, 0.022, 0.01]} />
        <meshStandardMaterial color="#7a2a2a" roughness={0.8} />
      </mesh>
      {/* Hair cap */}
      <mesh position={[0, 0.16, 0]}>
        <sphereGeometry args={[0.245, 20, 20, 0, Math.PI * 2, 0, Math.PI / 2.1]} />
        <meshStandardMaterial color={colors.hair} roughness={0.85} />
      </mesh>
      {/* Ears */}
      {([-0.24, 0.24] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={colors.skin} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── Skinny torso ───────────────────────────────────────────────────────
function Torso({ colors }: { colors: BodyColors }) {
  return (
    <group>
      {/* Jacket — narrow */}
      <mesh castShadow>
        <boxGeometry args={[0.28, 0.85, 0.2]} />
        <meshStandardMaterial color={colors.jacket} roughness={0.7} />
      </mesh>
      {/* Shirt strip */}
      <mesh position={[0, 0.05, 0.102]}>
        <boxGeometry args={[0.1, 0.7, 0.015]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.6} />
      </mesh>
      {/* Tie */}
      <mesh position={[0, 0.06, 0.115]}>
        <boxGeometry args={[0.045, 0.55, 0.01]} />
        <meshStandardMaterial color={colors.tie} roughness={0.45} metalness={0.1} />
      </mesh>
      {/* Lapels */}
      {([-0.08, 0.08] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0.09]} rotation={[0, 0, i === 0 ? 0.35 : -0.35]}>
          <boxGeometry args={[0.08, 0.28, 0.022]} />
          <meshStandardMaterial color={colors.jacket} roughness={0.7} />
        </mesh>
      ))}
      {/* Collar */}
      <mesh position={[0, 0.4, 0.09]}>
        <boxGeometry args={[0.16, 0.07, 0.018]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.5} />
      </mesh>
      {/* Buttons */}
      {([-0.16, 0, 0.16] as number[]).map((y, i) => (
        <mesh key={i} position={[0, y, 0.108]}>
          <sphereGeometry args={[0.014, 8, 8]} />
          <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── Long skinny neck ───────────────────────────────────────────────────
function Neck({ colors }: { colors: BodyColors }) {
  return (
    <mesh position={[0, 0.5, 0]}>
      <cylinderGeometry args={[0.072, 0.08, 0.32, 12]} />
      <meshStandardMaterial color={colors.skin} roughness={0.7} />
    </mesh>
  );
}

// ── Thin arms ──────────────────────────────────────────────────────────
function Arm({ side, colors }: { side: 'left' | 'right'; colors: BodyColors }) {
  const x = side === 'left' ? -0.19 : 0.19;
  const tilt = side === 'left' ? 0.18 : -0.18;
  return (
    <group position={[x, 0.05, 0]} rotation={[0.08, 0, tilt]}>
      {/* Upper arm */}
      <mesh castShadow>
        <cylinderGeometry args={[0.05, 0.045, 0.42, 10]} />
        <meshStandardMaterial color={colors.jacket} roughness={0.7} />
      </mesh>
      {/* Elbow */}
      <mesh position={[0, -0.24, 0]}>
        <sphereGeometry args={[0.052, 10, 10]} />
        <meshStandardMaterial color={colors.jacket} roughness={0.7} />
      </mesh>
      {/* Forearm */}
      <mesh position={[0, -0.46, 0.06]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.044, 0.04, 0.38, 10]} />
        <meshStandardMaterial color={colors.jacket} roughness={0.7} />
      </mesh>
      {/* Cuff */}
      <mesh position={[0, -0.68, 0.1]} rotation={[0.35, 0, 0]}>
        <cylinderGeometry args={[0.048, 0.048, 0.055, 10]} />
        <meshStandardMaterial color={colors.shirt} roughness={0.6} />
      </mesh>
      {/* Hand */}
      <mesh position={[0, -0.8, 0.12]} rotation={[0.35, 0, 0]}>
        <sphereGeometry args={[0.055, 10, 10]} />
        <meshStandardMaterial color={colors.skin} roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── Skinny legs ────────────────────────────────────────────────────────
function Legs({ colors }: { colors: BodyColors }) {
  return (
    <group position={[0, -0.88, 0]}>
      {([-0.1, 0.1] as number[]).map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.065, 0.8, 12]} />
            <meshStandardMaterial color={colors.pants} roughness={0.75} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.46, 0.07]}>
            <boxGeometry args={[0.1, 0.1, 0.24]} />
            <meshStandardMaterial color="#111" roughness={0.5} metalness={0.1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ── Dealer hat ─────────────────────────────────────────────────────────
function DealerHat() {
  return (
    <group>
      <mesh position={[0, -0.07, 0.16]} rotation={[0.28, 0, 0]}>
        <boxGeometry args={[0.42, 0.04, 0.24]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.2, 18]} />
        <meshStandardMaterial color="#1a2a4a" roughness={0.6} />
      </mesh>
      <mesh>
        <torusGeometry args={[0.26, 0.028, 8, 22]} />
        <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.15} />
      </mesh>
    </group>
  );
}

// ── Pit boss glasses ───────────────────────────────────────────────────
function PitBossGlasses() {
  return (
    <group position={[0, 0.05, 0.24]}>
      {([-0.09, 0.09] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <torusGeometry args={[0.058, 0.013, 8, 20]} />
          <meshStandardMaterial color="#111" metalness={0.75} roughness={0.2} />
        </mesh>
      ))}
      <mesh>
        <boxGeometry args={[0.062, 0.013, 0.01]} />
        <meshStandardMaterial color="#111" metalness={0.75} roughness={0.2} />
      </mesh>
    </group>
  );
}

// ── DEALER ─────────────────────────────────────────────────────────────

const DEALER_COLORS: BodyColors = {
  skin:   '#f5d5a8',
  shirt:  '#f5f0e8',
  jacket: '#1a2a4a',
  tie:    '#c0392b',
  pants:  '#1a2030',
  hair:   '#3a2010',
};

export function Dealer({ position = [0, 0, -4.2] as [number, number, number] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);
  const t = useRef(0);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t.current * 1.1) * 0.04;
    }
  });

  return (
    // scale={4} makes the character tower over the table
    <group ref={groupRef} position={position} scale={4}>
      <Legs   colors={DEALER_COLORS} />
      <Torso  colors={DEALER_COLORS} />
      <Neck   colors={DEALER_COLORS} />
      <Arm side="left"  colors={DEALER_COLORS} />
      <Arm side="right" colors={DEALER_COLORS} />
      {/* Head sits high on the long neck */}
      <Head colors={DEALER_COLORS} position={[0, 1.05, 0]} />
      <group position={[0, 1.32, 0]}>
        <DealerHat />
      </group>
      {/* Name badge */}
      <mesh position={[0.09, 0.15, 0.112]}>
        <boxGeometry args={[0.1, 0.045, 0.008]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.5} />
      </mesh>
    </group>
  );
}

// ── PIT BOSS ───────────────────────────────────────────────────────────

const PITBOSS_COLORS: BodyColors = {
  skin:   '#c8a87a',
  shirt:  '#f0ece0',
  jacket: '#2a1a0a',
  tie:    '#d4af37',
  pants:  '#1e1208',
  hair:   '#111',
};

export function PitBoss({ position = [8.5, 0, 0.5] as [number, number, number] }: { position?: [number, number, number] }) {
  const groupRef = useRef<THREE.Group>(null!);
  const t = useRef(1.5);

  useFrame((_, delta) => {
    t.current += delta;
    if (groupRef.current) {
      groupRef.current.position.y = position[1] + Math.sin(t.current * 0.9) * 0.03;
      const headNode = groupRef.current.children.find((c) => c.userData.role === 'head');
      if (headNode) {
        headNode.rotation.y = Math.sin(t.current * 0.4) * 0.4;
      }
    }
  });

  const c = PITBOSS_COLORS;

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, 0]} scale={4}>

      {/* ── FAT LEGS — thick cylinders ── */}
      <group position={[0, -0.88, 0]}>
        {([-0.18, 0.18] as number[]).map((x, i) => (
          <group key={i} position={[x, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.18, 0.16, 0.8, 14]} />
              <meshStandardMaterial color={c.pants} roughness={0.75} />
            </mesh>
            <mesh position={[0, -0.46, 0.08]}>
              <boxGeometry args={[0.18, 0.13, 0.3]} />
              <meshStandardMaterial color="#111" roughness={0.5} metalness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ── FAT TORSO — very wide, barrel chest ── */}
      <group>
        {/* Main wide jacket body */}
        <mesh castShadow>
          <boxGeometry args={[0.72, 0.88, 0.48]} />
          <meshStandardMaterial color={c.jacket} roughness={0.7} />
        </mesh>
        {/* Big round gut bulge */}
        <mesh position={[0, -0.18, 0.28]}>
          <sphereGeometry args={[0.32, 18, 14]} />
          <meshStandardMaterial color={c.jacket} roughness={0.7} />
        </mesh>
        {/* Shirt strip — stretched by the belly */}
        <mesh position={[0, 0.1, 0.255]}>
          <boxGeometry args={[0.18, 0.58, 0.015]} />
          <meshStandardMaterial color={c.shirt} roughness={0.6} />
        </mesh>
        {/* Tie — short and squished over the belly */}
        <mesh position={[0, 0.08, 0.27]}>
          <boxGeometry args={[0.06, 0.38, 0.01]} />
          <meshStandardMaterial color={c.tie} roughness={0.45} metalness={0.1} />
        </mesh>
        {/* Wide lapels */}
        {([-0.2, 0.2] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.34, 0.2]} rotation={[0, 0, i === 0 ? 0.4 : -0.4]}>
            <boxGeometry args={[0.16, 0.32, 0.022]} />
            <meshStandardMaterial color={c.jacket} roughness={0.7} />
          </mesh>
        ))}
        {/* Strained jacket buttons */}
        {([-0.08, 0.08] as number[]).map((y, i) => (
          <mesh key={i} position={[0, y, 0.295]}>
            <sphereGeometry args={[0.022, 8, 8]} />
            <meshStandardMaterial color="#222" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── SHORT FAT NECK ── */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[0.13, 0.16, 0.18, 12]} />
        <meshStandardMaterial color={c.skin} roughness={0.7} />
      </mesh>

      {/* ── FAT ARMS — short and pudgy, resting on belly ── */}
      {([[-0.46, 0.08, 0, 0.22], [0.46, 0.08, 0, -0.22]] as number[][]).map(([x, y, z, tilt], i) => (
        <group key={i} position={[x, y, z as number]} rotation={[0.3, 0, tilt]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.12, 0.1, 0.36, 12]} />
            <meshStandardMaterial color={c.jacket} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.2, 0]}>
            <sphereGeometry args={[0.115, 10, 10]} />
            <meshStandardMaterial color={c.jacket} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.36, 0.05]} rotation={[0.3, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.09, 0.28, 12]} />
            <meshStandardMaterial color={c.jacket} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.5, 0.08]} rotation={[0.3, 0, 0]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color={c.skin} roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Crossed arms resting on belly */}
      <mesh position={[0, -0.12, 0.34]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.095, 0.085, 0.56, 10]} />
        <meshStandardMaterial color={c.jacket} roughness={0.7} />
      </mesh>

      {/* ── FAT HEAD with double chin ── */}
      <group userData={{ role: 'head' }} position={[0, 0.92, 0]}>
        {/* Main head — wider/rounder */}
        <mesh castShadow>
          <sphereGeometry args={[0.3, 22, 22]} />
          <meshStandardMaterial color={c.skin} roughness={0.7} />
        </mesh>
        {/* Double chin blob */}
        <mesh position={[0, -0.22, 0.14]}>
          <sphereGeometry args={[0.2, 14, 10]} />
          <meshStandardMaterial color={c.skin} roughness={0.7} />
        </mesh>
        {/* Chubby cheeks */}
        {([-0.26, 0.26] as number[]).map((x, i) => (
          <mesh key={i} position={[x, -0.04, 0.12]}>
            <sphereGeometry args={[0.14, 10, 10]} />
            <meshStandardMaterial color={c.skin} roughness={0.7} />
          </mesh>
        ))}
        {/* Eyes — beady */}
        {([-0.1, 0.1] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0.06, 0.27]}>
            <sphereGeometry args={[0.034, 10, 10]} />
            <meshStandardMaterial color="#111122" roughness={0.2} />
          </mesh>
        ))}
        {/* Nose — bulbous */}
        <mesh position={[0, -0.04, 0.29]}>
          <sphereGeometry args={[0.055, 10, 10]} />
          <meshStandardMaterial color={c.skin} roughness={0.65} />
        </mesh>
        {/* Mouth */}
        <mesh position={[0, -0.12, 0.27]}>
          <boxGeometry args={[0.13, 0.025, 0.01]} />
          <meshStandardMaterial color="#6a1a1a" roughness={0.8} />
        </mesh>
        {/* Hair — thinning on top */}
        <mesh position={[0, 0.22, -0.04]}>
          <sphereGeometry args={[0.295, 18, 18, 0, Math.PI * 2, 0, Math.PI / 3.5]} />
          <meshStandardMaterial color={c.hair} roughness={0.85} />
        </mesh>
        {/* Fat ears */}
        {([-0.3, 0.3] as number[]).map((x, i) => (
          <mesh key={i} position={[x, 0, 0]}>
            <sphereGeometry args={[0.1, 10, 10]} />
            <meshStandardMaterial color={c.skin} roughness={0.7} />
          </mesh>
        ))}
        <PitBossGlasses />
      </group>

      {/* Earpiece */}
      <mesh position={[0.3, 0.92, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#222" roughness={0.5} metalness={0.4} />
      </mesh>
      <mesh position={[0.3, 0.76, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.24, 6]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
    </group>
  );
}
