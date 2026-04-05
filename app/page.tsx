'use client';

import dynamic from 'next/dynamic';
import HUD from '@/components/HUD';
import HandValueOverlay from '@/components/HandValueOverlay';

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
      {/* 3D Canvas */}
      <div className="scene-layer">
        <GameScene />
        {/* Hand values float over the scene on ALL screen sizes */}
        <HandValueOverlay />
      </div>

      {/* HUD controls */}
      <div className="hud-layer">
        <HUD />
      </div>
    </main>
  );
}
