import * as THREE from 'three';
import type { Suit, Rank } from '@/lib/deck';

const SUIT_SYMBOLS: Record<Suit, string> = {
  spades:   '♠',
  hearts:   '♥',
  diamonds: '♦',
  clubs:    '♣',
};

const SUIT_COLORS: Record<Suit, string> = {
  spades:   '#000000',
  hearts:   '#cc0000',
  diamonds: '#cc0000',
  clubs:    '#000000',
};

const textureCache = new Map<string, THREE.CanvasTexture>();
export function clearTextureCache() { textureCache.clear(); }

export function getCardTexture(rank: Rank, suit: Suit): THREE.CanvasTexture {
  const key = `${rank}-${suit}`;
  if (textureCache.has(key)) return textureCache.get(key)!;

  const W = 512;
  const H = 716;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // ── Background: pure white ──
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, 0, 0, W, H, 32);
  ctx.fill();

  // ── Thin border ──
  ctx.strokeStyle = '#bbbbbb';
  ctx.lineWidth = 5;
  roundRect(ctx, 4, 4, W - 8, H - 8, 30);
  ctx.stroke();

  const color  = SUIT_COLORS[suit];
  const symbol = SUIT_SYMBOLS[suit];

  // ── TOP-LEFT corner block ──
  drawCorner(ctx, rank, symbol, color, 22, 24, false);

  // ── BOTTOM-RIGHT corner block (rotated 180°) ──
  ctx.save();
  ctx.translate(W - 22, H - 24);
  ctx.rotate(Math.PI);
  drawCorner(ctx, rank, symbol, color, 0, 0, false);
  ctx.restore();

  // ── CENTER art ──
  const isFace = ['J', 'Q', 'K'].includes(rank);
  const isAce  = rank === 'A';

  if (isAce) {
    drawAce(ctx, symbol, color, W, H);
  } else if (isFace) {
    drawFaceCard(ctx, rank, symbol, color, W, H);
  } else {
    drawPips(ctx, parseInt(rank, 10), symbol, color, W, H);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace  = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}

// ── Corner helper ───────────────────────────────────────────────────────
function drawCorner(
  ctx: CanvasRenderingContext2D,
  rank: string,
  symbol: string,
  color: string,
  x: number,
  y: number,
  _flip: boolean
) {
  ctx.fillStyle  = color;
  ctx.textAlign  = 'left';
  ctx.textBaseline = 'top';

  // Rank number/letter — very large and bold
  ctx.font = 'bold 96px "Arial Black", Arial, sans-serif';
  ctx.fillText(rank, x, y);

  // Suit symbol below rank
  ctx.font = '72px serif';
  ctx.fillText(symbol, x + 4, y + 96);
}

// ── Ace ────────────────────────────────────────────────────────────────
function drawAce(
  ctx: CanvasRenderingContext2D,
  symbol: string,
  color: string,
  W: number,
  H: number
) {
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Giant centered suit symbol
  ctx.font      = '420px serif';
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.95;
  ctx.fillText(symbol, W / 2, H / 2 + 20);
  ctx.globalAlpha = 1;
}

// ── Face cards (J, Q, K) ───────────────────────────────────────────────
function drawFaceCard(
  ctx: CanvasRenderingContext2D,
  rank: string,
  symbol: string,
  color: string,
  W: number,
  H: number
) {
  const cx = W / 2;
  const cy = H / 2;

  // Colored background panel
  const isRed = color !== '#000000';
  ctx.fillStyle = isRed ? 'rgba(200,0,0,0.06)' : 'rgba(0,0,40,0.05)';
  ctx.fillRect(48, 180, W - 96, H - 360);

  // Giant rank letter (semi-transparent background)
  ctx.font        = 'bold 360px "Arial Black", Arial, sans-serif';
  ctx.fillStyle   = color;
  ctx.globalAlpha = 0.07;
  ctx.textAlign   = 'center';
  ctx.textBaseline= 'middle';
  ctx.fillText(rank, cx, cy + 10);
  ctx.globalAlpha = 1;

  // Bold foreground rank
  ctx.font      = 'bold 220px "Arial Black", Arial, sans-serif';
  ctx.fillStyle = color;
  ctx.fillText(rank, cx, cy - 50);

  // Large suit below rank
  ctx.font = '150px serif';
  ctx.fillText(symbol, cx, cy + 130);

  // Small suit corners inside center panel
  ctx.font = '70px serif';
  ctx.fillText(symbol, cx - 120, cy - 90);
  ctx.fillText(symbol, cx + 120, cy - 90);
}

// ── Pip cards (2–10) ──────────────────────────────────────────────────
function drawPips(
  ctx: CanvasRenderingContext2D,
  num: number,
  symbol: string,
  color: string,
  W: number,
  H: number
) {
  ctx.fillStyle    = color;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  // Scale pip size down slightly for higher numbers so they fit
  const size = num <= 4 ? 120 : num <= 6 ? 106 : num <= 8 ? 92 : 80;
  ctx.font = `${size}px serif`;

  const cx = W / 2;
  const positions = getPipPositions(num, W, H);
  for (const [x, y, flipped] of positions) {
    if (flipped) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.PI);
      ctx.fillText(symbol, 0, 0);
      ctx.restore();
    } else {
      ctx.fillText(symbol, x, y);
    }
  }
}

// Returns [x, y, flipped] for each pip
function getPipPositions(num: number, W: number, H: number): [number, number, boolean][] {
  const cx = W / 2;
  const lx = W * 0.29;  // left column
  const rx = W * 0.71;  // right column

  // Top / middle / bottom zones
  const t1 = H * 0.20;
  const t2 = H * 0.32;
  const m  = H * 0.50;
  const b2 = H * 0.68;
  const b1 = H * 0.80;

  switch (num) {
    case 2:  return [[cx,t1,false],[cx,b1,true]];
    case 3:  return [[cx,t1,false],[cx,m,false],[cx,b1,true]];
    case 4:  return [[lx,t1,false],[rx,t1,false],[lx,b1,true],[rx,b1,true]];
    case 5:  return [[lx,t1,false],[rx,t1,false],[cx,m,false],[lx,b1,true],[rx,b1,true]];
    case 6:  return [[lx,t1,false],[rx,t1,false],[lx,m,false],[rx,m,false],[lx,b1,true],[rx,b1,true]];
    case 7:  return [[lx,t1,false],[rx,t1,false],[cx,t2*1.18,false],[lx,m,false],[rx,m,false],[lx,b1,true],[rx,b1,true]];
    case 8:  return [[lx,t1,false],[rx,t1,false],[cx,t2*1.1,false],[lx,m,false],[rx,m,false],[cx,b2*0.92,true],[lx,b1,true],[rx,b1,true]];
    case 9:  return [[lx,t1,false],[rx,t1,false],[lx,t2,false],[rx,t2,false],[cx,m,false],[lx,b2,true],[rx,b2,true],[lx,b1,true],[rx,b1,true]];
    case 10: return [[lx,t1,false],[rx,t1,false],[lx,t2,false],[rx,t2,false],[cx,t2*1.1,false],[cx,b2*0.91,true],[lx,b2,true],[rx,b2,true],[lx,b1,true],[rx,b1,true]];
    default: return [];
  }
}

// ── Canvas roundRect polyfill ──────────────────────────────────────────
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// ── Card back ─────────────────────────────────────────────────────────
export function getCardBackTexture(): THREE.CanvasTexture {
  const key = '__back__';
  if (textureCache.has(key)) return textureCache.get(key)!;

  const W = 512, H = 716;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Rich navy gradient
  const grad = ctx.createLinearGradient(0, 0, W, H);
  grad.addColorStop(0,   '#1a3a6c');
  grad.addColorStop(0.5, '#0d2447');
  grad.addColorStop(1,   '#1a3a6c');
  ctx.fillStyle = grad;
  roundRect(ctx, 0, 0, W, H, 32);
  ctx.fill();

  // Outer gold border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth   = 12;
  roundRect(ctx, 8, 8, W - 16, H - 16, 28);
  ctx.stroke();

  // Inner gold border
  ctx.strokeStyle = '#d4af37';
  ctx.lineWidth   = 4;
  roundRect(ctx, 28, 28, W - 56, H - 56, 18);
  ctx.stroke();

  // Fine crosshatch
  ctx.strokeStyle = 'rgba(212,175,55,0.22)';
  ctx.lineWidth   = 1.5;
  for (let i = -H; i < W + H; i += 28) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke();
  }

  // Giant center diamond
  ctx.font         = 'bold 220px serif';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#d4af37';
  ctx.globalAlpha  = 0.88;
  ctx.fillText('♦', W / 2, H / 2);
  ctx.globalAlpha  = 1;

  // Monogram over diamond
  ctx.font      = 'bold 52px "Arial Black", Arial, sans-serif';
  ctx.fillStyle = '#0d2447';
  ctx.fillText('BJC', W / 2, H / 2 + 8);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace  = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  textureCache.set(key, texture);
  return texture;
}
