'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Card } from '@/lib/deck';
import { getCardTexture, getCardBackTexture } from './CardTexture';

interface Card3DProps {
  card: Card;
  position: [number, number, number];
  rotationZ?: number;
  scale?: number;
  animated?: boolean;
  delay?: number;
}

const CARD_W = 0.32;
const CARD_H = 0.45;
const CARD_D = 0.002;

// Cards fly in from the right side (player's POV)
const SHOE_POS: [number, number, number] = [5.5, 1.2, -1.5];

export default function Card3D({
  card,
  position,
  rotationZ = 0,
  scale = 1,
  animated = true,
  delay = 0,
}: Card3DProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const startTime = useRef<number | null>(null);

  // Cards lay flat: face-up = top face up (-X rotation), face-down = back face up (+X rotation)
  const flatX = card.faceUp ? -Math.PI / 2 : Math.PI / 2;

  const currentPos = useRef(new THREE.Vector3(...SHOE_POS));
  const targetPos = useRef(new THREE.Vector3(...position));
  const currentRotX = useRef(flatX);
  const targetRotX = useRef(flatX);
  const currentRotZ = useRef(0);
  const targetRotZ = useRef(rotationZ);

  const frontTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getCardTexture(card.rank, card.suit);
  }, [card.rank, card.suit]);

  const backTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getCardBackTexture();
  }, []);

  useEffect(() => {
    targetPos.current.set(...position);
    targetRotX.current = card.faceUp ? -Math.PI / 2 : Math.PI / 2;
    targetRotZ.current = rotationZ;
  }, [position, card.faceUp, rotationZ]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    if (startTime.current === null) startTime.current = 0;
    startTime.current += delta;
    if (startTime.current < delay) return;

    // Smooth position lerp
    currentPos.current.lerp(targetPos.current, 0.14);
    meshRef.current.position.copy(currentPos.current);

    // Smooth rotation
    currentRotX.current += (targetRotX.current - currentRotX.current) * 0.12;
    currentRotZ.current += (targetRotZ.current - currentRotZ.current) * 0.12;
    meshRef.current.rotation.x = currentRotX.current;
    meshRef.current.rotation.z = currentRotZ.current;
  });

  // Box face order: +x, -x, +y(top/face-up side), -y(bottom), +z, -z
  // When card is flat (rotX = -π/2): the +z face becomes the top → that's our "front"
  // face-up: front (+z) faces up, back (-z) faces down
  // face-down: back (-z) faces up (rotX = +π/2 flips it)
  const materials = useMemo(() => {
    // MeshBasicMaterial ignores ALL lighting and IBL — renders the texture
    // exactly as drawn: pure white background, solid black/red ink.
    const edgeMat = new THREE.MeshBasicMaterial({ color: '#f0ece4' });
    const frontMat = new THREE.MeshBasicMaterial({ map: frontTexture });
    const backMat  = new THREE.MeshBasicMaterial({ map: backTexture });
    // Box face order: +x, -x, +y, -y, +z(front), -z(back)
    // Card is rotated -π/2 on X when face-up → +Z face points UP → index 4 = front texture
    // Card is rotated +π/2 on X when face-down → -Z face points UP → index 5 = back texture
    return [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
  }, [frontTexture, backTexture]);

  return (
    <mesh
      ref={meshRef}
      position={currentPos.current.toArray() as [number, number, number]}
      rotation={[currentRotX.current, 0, currentRotZ.current]}
      scale={scale}
      castShadow
      receiveShadow
      material={materials}
    >
      <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
    </mesh>
  );
}
