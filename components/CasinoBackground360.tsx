'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Loads the equirectangular 360 casino photo and wraps the entire
 * scene inside it. The table sits at (0,0,0) — the exact center of
 * the sphere — so every direction the player looks, they see the
 * real casino around them.
 *
 * We also push the texture into scene.environment so Three.js uses
 * it for image-based lighting (IBL) on materials that have metalness
 * or roughness — giving realistic reflections on chips and card backs.
 */
export default function CasinoBackground360() {
  const texture = useTexture('/360-casino.jpg');
  const { scene, gl } = useThree();

  useEffect(() => {
    // Tell Three.js this is an equirectangular panorama
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    // Set as scene background (the 360 sphere you see behind everything)
    scene.background = texture;

    // Also use it for IBL so chips/cards pick up realistic light
    scene.environment = texture;

    return () => {
      scene.background = null;
      scene.environment = null;
    };
  }, [texture, scene, gl]);

  return null;
}
