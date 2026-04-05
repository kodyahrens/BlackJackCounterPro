'use client';

import { useEffect, useRef, useState } from 'react';

const VIDEO_ID  = 'kMDP_sLm8ss';
const START_SEC = Math.floor(Math.random() * 5400); // random point in first 90 min

export default function BackgroundMusic() {
  const iframeRef          = useRef<HTMLIFrameElement>(null);
  const unlockedRef        = useRef(false);
  const [muted, setMuted]  = useState(false);   // desired state: start unmuted
  const [ready, setReady]  = useState(false);   // iframe API ready
  const [unlocked, setUnlocked] = useState(false); // browser audio unlocked
  const [volume, setVolume]     = useState(35);
  const [showSlider, setShowSlider] = useState(false);

  // YouTube iframe src — muted=1 only to satisfy browser autoplay policy;
  // we'll unmute via postMessage as soon as the user touches anything.
  const src = [
    `https://www.youtube.com/embed/${VIDEO_ID}`,
    `?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}`,
    `&start=${START_SEC}&enablejsapi=1`,
    `&controls=0&disablekb=1&fs=0`,
    `&iv_load_policy=3&modestbranding=1&rel=0`,
  ].join('');

  function postCmd(func: string, args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func, args }),
      '*'
    );
  }

  // Listen for YouTube IFrame API "ready" message
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.event === 'onReady' || data?.info !== undefined) {
          setReady(true);
        }
      } catch { /* ignore non-JSON */ }
    }
    window.addEventListener('message', onMessage);
    // Also mark ready after a short timeout as fallback
    const t = setTimeout(() => setReady(true), 3000);
    return () => { window.removeEventListener('message', onMessage); clearTimeout(t); };
  }, []);

  // Once ready, unmute and set volume
  useEffect(() => {
    if (ready && unlocked && !muted) {
      postCmd('unMute');
      postCmd('setVolume', [volume]);
    }
  }, [ready, unlocked, muted]);

  // First user interaction anywhere → unlock audio
  useEffect(() => {
    if (unlocked) return;

    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      setUnlocked(true);
      postCmd('unMute');
      postCmd('setVolume', [volume]);
      // Remove listeners after first interaction
      document.removeEventListener('click',     unlock);
      document.removeEventListener('keydown',   unlock);
      document.removeEventListener('touchstart', unlock);
    }

    document.addEventListener('click',      unlock);
    document.addEventListener('keydown',    unlock);
    document.addEventListener('touchstart', unlock);
    return () => {
      document.removeEventListener('click',      unlock);
      document.removeEventListener('keydown',    unlock);
      document.removeEventListener('touchstart', unlock);
    };
  }, [unlocked, volume]);

  function handleMuteToggle() {
    if (muted) {
      postCmd('unMute');
      postCmd('setVolume', [volume]);
    } else {
      postCmd('mute');
    }
    setMuted(v => !v);
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseInt(e.target.value, 10);
    setVolume(v);
    if (!muted) postCmd('setVolume', [v]);
  }

  return (
    <>
      {/* Hidden autoplay iframe */}
      <iframe
        ref={iframeRef}
        src={src}
        allow="autoplay; encrypted-media"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', top: 0, left: 0 }}
        title="background-music"
      />

      {/* "Click anywhere" prompt — shown until first interaction */}
      {!unlocked && (
        <div className="music-unlock-banner">
          <span className="music-unlock-icon">🎷</span>
          <span className="music-unlock-text">Click anywhere to start casino music</span>
        </div>
      )}

      {/* Music control widget — bottom right */}
      <div className="music-widget">
        <button
          className={`music-btn ${muted ? 'music-muted' : 'music-on'}`}
          onClick={handleMuteToggle}
          onMouseEnter={() => setShowSlider(true)}
          onMouseLeave={() => setShowSlider(false)}
          title={muted ? 'Unmute music' : 'Mute music'}
        >
          <span className="music-icon">{muted ? '🔇' : '🎷'}</span>
          <span className="music-label">{muted ? 'Music Off' : 'Casino Jazz'}</span>
        </button>

        {showSlider && (
          <div
            className="volume-slider-wrap"
            onMouseEnter={() => setShowSlider(true)}
            onMouseLeave={() => setShowSlider(false)}
          >
            <span className="volume-icon">🔊</span>
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
            <span className="volume-value">{volume}%</span>
          </div>
        )}
      </div>
    </>
  );
}
