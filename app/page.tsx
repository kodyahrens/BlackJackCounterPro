'use client';

import dynamic from 'next/dynamic';
import HUD from '@/components/HUD';

// Load 3D scene client-side only (Three.js requires browser)
const GameScene = dynamic(() => import('@/components/GameScene'), {
  ssr: false,
  loading: () => (
    <div className="scene-loading">
      <div className="loading-spinner" />
      <p>Loading Casino...</p>
    </div>
  ),
});

export default function Home() {
  return (
    <main className="game-root">
      {/* 3D Canvas layer */}
      <div className="scene-layer">
        <GameScene />
      </div>

      {/* HUD overlay layer */}
      <div className="hud-layer">
        <HUD />
      </div>
    </main>
  );
}
