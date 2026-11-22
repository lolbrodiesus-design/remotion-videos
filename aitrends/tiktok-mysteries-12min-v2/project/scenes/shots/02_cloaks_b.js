// shots/02_cloaks_b.js — Story 2 (Cloaks): s044 s045 s046 s047 s048 s049 s050 s051
// The bicycle, Jason posts, 17M views, the cult/ghost comments, the glitch, the answer in the comments.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, shade, alpha, mix, seg, circle, ring, poly, rr, glow, linGrad, text, FONTS, shake } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { JASON } from '../cast.js';

function cloakXs(cx, s) {
  const xs = [];
  for (let i = 0; i < 12; i++) xs.push(cx + (i - 5.5) * 130 * s + (i > 7 ? 140 * s : 0) - 70 * s);
  return xs;
}
function longShadows(g, cx, GY, s, len, M, a = 0.4) {
  for (const x of cloakXs(cx, s)) {
    poly(g, [[x - 10 * s, GY + 2], [x + 10 * s, GY + 2], [x - len + 16, GY + 34], [x - len, GY + 34]], alpha(M.dark, a));
  }
}
function scrub(g, GY, M, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = (i < 3 ? r() * E.W * 0.14 : E.W * 0.86 + r() * E.W * 0.14), y = GY + 30 + r() * 130, w = 50 + r() * 70;
    g.fillStyle = alpha(shade(M.wall, -0.4), 0.9); g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, 0, 7); g.fill();
  }
}
// small heart shape (flat vector, not emoji)
function heart(g, x, y, s, color, a = 1) {
  g.save(); g.globalAlpha = a; g.fillStyle = color;
  circle(g, x - 9 * s, y - 4 * s, 10 * s, color); circle(g, x + 9 * s, y - 4 * s, 10 * s, color);
  poly(g, [[x - 18 * s, y - 2 * s], [x + 18 * s, y - 2 * s], [x, y + 18 * s]], color);
  g.restore();
}

// s044 — "One of them was holding a bicycle."
// Insert: the 8th figure and its bicycle — glint on the wheel, dust motes, cloak hem, sand
registerShot('s044', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.25, x: 40 - 80 * k }; // pan-right
  const { GY } = desert(g, t, { z: 1.9, x: 200, y: -60 });
  veil(g, '#120a10', 0.3);
  layer(g, cam, 1, (g) => {
    const fx = E.W * 0.58, fy = GY + 60;
    cloakFigure(g, fx, fy, 1.7, t, { seed: 8 });
    bicycle(g, fx + 165, fy, 1.55, t);
    // extra wheel spokes on the big front wheel
    const wx = fx + 165 + 52 * 1.55, wy = fy - 34 * 1.55;
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; seg(g, [[wx, wy], [wx + Math.cos(a) * 50, wy + Math.sin(a) * 50]], 2, 'rgba(20,16,28,.85)'); }
    glow(g, wx, wy, 90, '#ffe9b0', 0.5);
    circle(g, wx - 14, wy - 26, 5, 'rgba(255,240,200,.95)');
    FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.4 });
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.15);
} });

// s045 — "Jason posted the video on TikTok."
// Wide: desert + cloak line, low sun; Jason in the foreground, blue tee, amber phone glow.
// (Engine has no back-view pose: Jason is drawn in side profile facing the cloaks, phone in hand.)
registerShot('s045', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.04 * k, y: 20 - 40 * k }; // tilt-down
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W * 0.62, GY, 0.8, t);
    longShadows(g, E.W * 0.62, GY, 0.8, 260, M, 0.4);
    scrub(g, GY, M, 21);
    const jx = E.W * 0.22, jy = GY + 40, s = 1.5;
    drawFigure(g, { x: jx, y: jy, s, facing: 1, outfit: JASON, pose: breathe(POSES.phone, t), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.2], w: 4 }, blink: (t % 3.3) > 3.2 });
    // amber phone glow in his hand
    const px = jx + 46 * s, py = jy - 158 * s;
    glow(g, px, py, 130, '#ffb060', 0.65);
    FX.pool(g, px, jy + 20, 170, 20, '#ffb060', 0.18);
  });
  FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.3 });
} });

// s046 — "It was watched more than 17 million times in a few days."
// UI: 17M view counter ticking up over a blurred desert / phone screen
registerShot('s046', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.05 * k, y: 20 - 30 * k }; // tilt-up
  blurLayer(g, 10, (g) => { const { GY } = desert(g, t, cam); layer(g, cam, 1, (g) => cloakLine(g, E.W / 2, GY, 0.9, t)); }, cam);
  veil(g, '#0a0e22', 0.4);
  UI.dataCard(g, t, { title: 'TIKTOK · JASON KLEIN', subtitle: 'VIEWS IN A FEW DAYS', from: 0, to: 17, decimals: 0, unit: 'M', start: 0.4, dur: 2.2, total: info.dur, labels: [[0, '0M'], [0.55, '9M'], [1, '17M']] });
  // hearts floating up at the right edge
  for (let i = 0; i < 3; i++) {
    const hy = E.H * 0.85 - ((t * 90 + i * 160) % 500);
    heart(g, E.W * 0.9, hy, 1.1, S().ui.accent, clamp((hy - E.H * 0.3) / 200, 0, 1) * 0.9);
  }
  FX.dust(g, t, { count: 20, color: '#ffd9b0', a: 0.25 });
} });

// s047 — "People said it was a cult."
// Insert: low angle up at a hooded white triangle against the dark blue sky; 'CULT?' bubble rising
registerShot('s047', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05, r: -0.015 + 0.03 * k, x: 30 - 30 * k }; // orbit (roll + drift)
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    FX.stars(g, t, { seed: 9, count: 60, area: [0, 0, E.W, E.H * 0.45], color: '#e8ecff' });
    FX.moon(g, E.W * 0.8, E.H * 0.16, 32, '#e8ecff');
    // low angle: one huge cloak, feet cropped below the frame
    cloakFigure(g, E.W * 0.42, E.H * 1.06, 2.4, t, { seed: 4 });
    glow(g, E.W * 0.42, E.H * 0.42, 200, M.rim, 0.25);
  });
  const by = E.H * 0.78 - t * 110;
  UI.bubble(g, E.W * 0.74, by, { w: 230, h: 96, str: 'CULT?', color: '#f4efe6' });
  UI.bubble(g, E.W * 0.8, E.H * 0.86 - ((t * 60) % 160), { w: 130, h: 66, dots: true, color: alpha('#f4efe6', 0.85) });
  heart(g, E.W * 0.66, E.H * 0.7 - ((t * 80 + 90) % 420), 1, S().ui.accent, 0.85);
  heart(g, E.W * 0.88, E.H * 0.75 - ((t * 70 + 200) % 420), 0.8, S().ui.accent, 0.7);
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.3 });
} });

// s048 — "People said it was a group of ghosts."
// UI: notification bubbles 'GHOSTS?', a second bubble shakes, ghost icon flickers, cloaks blurred behind
registerShot('s048', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1 + 0.07 * k, x: -30 * k }; // dolly-diagonal
  blurLayer(g, 12, (g) => { const { GY } = desert(g, t, cam); layer(g, cam, 1, (g) => cloakLine(g, E.W / 2, GY, 0.95, t)); }, cam);
  veil(g, '#0a0e22', 0.42);
  const bx = E.W * 0.74;
  const pop = (start) => ease.outBack(prog(t, start, start + 0.4));
  if (pop(0.15) > 0) UI.bubble(g, bx, E.H * 0.3, { w: 300, h: 104, str: 'GHOSTS?', color: '#f4efe6' });
  // second bubble shakes
  const [sx, sy] = t > 0.9 && t < 1.5 ? shake(t, 5, 26) : [0, 0];
  if (pop(0.7) > 0) { g.save(); g.translate(sx, sy); UI.bubble(g, bx, E.H * 0.52, { w: 240, h: 88, dots: true, color: '#f4efe6' }); g.restore(); }
  if (pop(1.1) > 0) UI.bubble(g, bx, E.H * 0.72, { w: 200, h: 76, dots: true, color: alpha('#f4efe6', 0.9) });
  // flickering ghost icon, left of the bubbles
  const flick = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 9));
  g.save(); g.globalAlpha = flick * clamp(prog(t, 0.4, 0.8));
  const gx = E.W * 0.2, gy = E.H * 0.42;
  circle(g, gx, gy - 20, 52, '#f4efe6');
  poly(g, [[gx - 52, gy - 20], [gx + 52, gy - 20], [gx + 52, gy + 50], [gx + 26, gy + 30], [gx, gy + 50], [gx - 26, gy + 30], [gx - 52, gy + 50]], '#f4efe6');
  circle(g, gx - 20, gy - 28, 8, S().ink); circle(g, gx + 20, gy - 28, 8, S().ink);
  g.restore();
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.25 });
} });

// s049 — "People said the figures were moving between the photos."
// Wide: the cloak line, camera panning along it; the figures GLITCH 10px left for one frame mid-shot
registerShot('s049', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.04 + 0.04 * k, x: 60 - 120 * k }; // push-in + pan along the line
  const { GY } = desert(g, t, cam);
  const glitch = (t > 1.25 && t < 1.33) ? -10 : 0; // one-frame lateral jump
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2 + glitch, GY, 0.95, t);
    longShadows(g, E.W / 2 + glitch, GY, 0.95, 300, M, 0.4);
    scrub(g, GY, M, 26);
    // sand ripples in the foreground
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
    for (let row = 0; row < 3; row++) {
      g.beginPath();
      for (let x = -E.W; x <= E.W * 2; x += 60) { const y = GY + 130 + row * 70 + Math.sin(x * 0.012 + row * 2) * 12; x === -E.W ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  });
  if (glitch !== 0) { // glitch slice
    g.fillStyle = 'rgba(255,255,255,.28)'; g.fillRect(0, GY - 320, E.W, 6);
    g.fillStyle = 'rgba(120,180,255,.2)'; g.fillRect(0, GY - 300, E.W, 3);
  }
  FX.fog(g, GY - 130, 190, M.fog, 0.2 + 0.15 * prog(t, 0, info.dur)); // haze thickening
} });

// s050 — "The answer came fast, and it came from the comments."
// Medium: Jason at the laptop, comments scrolling, face lit by the screen, lamp behind, desert night outside
registerShot('s050', { draw(g, t, info) {
  const M = mood('interiorWarm'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08 - 0.08 * k, x: 20 * k }; // pull-out
  const GY = E.H * V(0.8, 0.68);
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // window: desert night
    rr(g, E.W * 0.06, E.H * 0.12, E.W * 0.3, E.H * 0.46, 10); g.fillStyle = '#0d1226'; g.fill();
    FX.moon(g, E.W * 0.26, E.H * 0.24, 26, '#e8ecff');
    FX.hills(g, { y: E.H * 0.5, amp: 50, color: '#1c1830', seed: 11 });
    // lamp behind Jason, right
    glow(g, E.W * 0.86, E.H * 0.3, 220, M.practical, 0.55);
    circle(g, E.W * 0.86, E.H * 0.3, 15, M.practical);
    FX.lightCone(g, E.W * 0.86, E.H * 0.3, { angle: Math.PI / 2, spread: 0.6, len: 380, color: M.practical, a: 0.08 });
    // desk
    g.fillStyle = shade(M.floor, -0.2); g.fillRect(-E.W, GY + 40, E.W * 3, E.H);
    seg(g, [[-E.W, GY + 40], [E.W * 2, GY + 40]], 4, 'rgba(0,0,0,.4)');
  });
  layer(g, cam, 1, (g) => {
    // laptop with scrolling comments on screen
    const lx = E.W * 0.58, ly = GY - 190;
    glow(g, lx, ly, 260, '#cfe0ff', 0.4);
    rr(g, lx - 210, ly - 110, 420, 220, 10); g.fillStyle = '#14101c'; g.fill();
    rr(g, lx - 195, ly - 95, 390, 190, 6); g.fillStyle = '#1c2a44'; g.fill();
    const lines = ['CULT?', 'GHOSTS?!', 'WHAT ARE THEY?', 'STATUES??', 'NO WAY…'];
    g.save(); rr(g, lx - 195, ly - 95, 390, 190, 6); g.clip();
    lines.forEach((ln, i) => {
      const yy = ly + 80 - ((t * 46 + i * 52) % 260);
      text(g, ln, lx - 175, yy, { size: 26, color: alpha(S().ui.cream, 0.95), font: FONTS.ui, weight: 900, align: 'left' });
    });
    g.restore();
    drawFigure(g, { x: E.W * 0.3, y: GY + 40, s: 1.6, facing: 1, outfit: JASON, pose: breathe(POSES.sit, t), expr: t > 1.4 ? 'surprised' : 'thinking', rim: { color: M.rim, dir: [1, -0.4], w: 4 }, blink: (t % 3.1) > 3.0 });
  });
  FX.dust(g, t, { count: 26, color: '#ffe2bd', a: 0.3 });
} });

// s051 — "The figures were not people at all."
// Wide: empty desert floor at dusk; the camera pans across the sand — footprints stop well short of the cloaks
registerShot('s051', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06, x: 60 - 120 * k }; // pan-left across the sand
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W * 0.78, GY, 0.8, t);
    longShadows(g, E.W * 0.78, GY, 0.8, 260, M, 0.4);
    // a footprint trail wandering in from the left — and stopping, disconnected, before the figures
    const r = rng(31);
    for (let i = 0; i < 14; i++) {
      const fx = E.W * 0.06 + i * 52 + r() * 14, fy = GY + 150 + Math.sin(i * 0.9) * 46 + (i % 2) * 16;
      g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(fx, fy, 16, 8, 0.3, 0, 7); g.fill();
    }
    scrub(g, GY, M, 33);
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.15);
} });
