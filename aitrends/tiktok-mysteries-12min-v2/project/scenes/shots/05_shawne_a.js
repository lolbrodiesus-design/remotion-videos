// shots/05_shawne_a.js — Story 5 (Shawne Bolton): s123a–s129a.
// Sheriff's office at night; Shawne (purple tracksuit, ponytail) learns she was missing since 1980.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rng, S, text, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { office } from '../sets/office.js';
import { SHAWNE } from '../cast.js';

// Shawne seated at the office desk, facing the phone (left). o: {expr, pose, rimDir}
function shawneAtDesk(g, t, cam, o = {}) {
  const { GY, M } = office(g, t, cam, { board: o.board, phoneRing: o.phoneRing, report: o.report });
  const s = V(1.5, 1.6), x = E.W / 2 - V(260, 200);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: SHAWNE,
      pose: breathe(o.pose || posesAt(t, [[0, 'sit'], [0.6, 'reach']]), t),
      expr: o.expr || 'neutral', rim: { color: M.rim, dir: o.rimDir || [1, -0.3] },
      blink: (t % 3.4) > 3.3 });
  });
  return { GY, M };
}

// s123a — "In 2021, a woman on TikTok found out …" Medium: glowing phone, tilt-up, slow zoom out.
registerShot('s123a', { draw(g, t, info) {
  const cam = { z: 1.08 - 0.08 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const { GY, M } = shawneAtDesk(g, t, cam, { phoneRing: true, expr: 'surprised' });
  const px = E.W / 2 - V(560, 420), py = GY - V(150, 200);
  glow(g, px, py, 130, M.practical, 0.5 + 0.2 * Math.sin(t * 5));
  FX.lightCone(g, px, py, { angle: -Math.PI / 2, spread: 0.7, len: 300, color: M.practical, a: 0.1 });
  FX.dust(g, t, { count: 26, color: '#ffe2b0', a: 0.3 });
  FX.lensStreak(g, px, py, E.W * 0.7, '#ffd28a', 0.15);
} });

// s123b — "… that she had been reported missing in 1980," Insert: calendar numbers flipping to 1980.
registerShot('s123b', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / info.dur), x: 30 * Math.sin(t * 0.6) };
  blurLayer(g, 10, (g) => office(g, t, cam, { board: true })); veil(g, '#0e0a14', 0.45);
  const yrs = [2021, 2015, 2008, 2001, 1995, 1987, 1980];
  const idx = Math.min(Math.floor(t / 0.3), yrs.length - 1);
  const a = ease.out(prog(t, 0, 0.3));
  text(g, String(yrs[idx]), E.W / 2, E.H * 0.46, { size: V(150, 170), color: idx === 6 ? S().ui.gold : S().ui.cream, glow: 26, glowColor: alpha(S().ui.gold, 0.6), alpha: a });
  text(g, 'REPORTED MISSING', E.W / 2, E.H * 0.46 + V(110, 130), { size: V(34, 40), color: S().ui.cream, alpha: ease.out(prog(t, 1.6, 2.0)) });
  if (idx === 6) FX.rings(g, E.W / 2, E.H * 0.46, t - 1.8, { count: 2, r0: 120, r1: 420, color: S().ui.gold, a: 0.4 });
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.3 });
} });

// s124 — "and she had never known." Wide: dusty cardboard boxes, a shadow passes over the lids.
registerShot('s124', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(-40, 40, ease.inOut(t / info.dur)) };
  const { GY, M } = office(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    // stack of dusty cardboard boxes, foreground left
    const bx = E.W * 0.2, bw = V(340, 280);
    for (let i = 0; i < 3; i++) {
      const w = bw - i * 40, x = bx - w / 2 + i * 14, y = GY - i * V(110, 130);
      rr(g, x, y - V(110, 130), w, V(110, 130), 6); g.fillStyle = shade(M.wall, i % 2 ? -0.1 : 0.15); g.fill();
      seg(g, [[x + w / 2, y - V(110, 130)], [x + w / 2, y]], 3, shade(M.dark, 0.1));
    }
    FX.dust(g, t, { count: 30, color: '#d8cfae', a: 0.35 });
    // slow shadow sweeping across the box lids
    const sx = lerp(E.W * 0.05, E.W * 0.45, ease.inOut(t / info.dur));
    g.fillStyle = 'rgba(5,5,10,.45)'; poly(g, [[sx, GY - V(360, 420)], [sx + 130, GY - V(360, 420)], [sx + 90, GY], [sx - 40, GY]], 'rgba(5,5,10,.45)');
    drawFigure(g, { x: E.W / 2 + V(320, 240), y: GY, s: V(1.1, 1.2), facing: -1, outfit: SHAWNE,
      pose: breathe(POSES.sit, t), expr: 'sad', rim: { color: M.rim, dir: [1, -0.3] } });
  });
  FX.fog(g, GY - 120, 160, M.fog, 0.2);
} });

// s125 — "Her name was Shawne Bolton." Insert: embossed label tape reading SHAWNE, finger tracing.
registerShot('s125', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.08 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 12, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.4);
  const tx = E.W / 2, ty = E.H * 0.52, tw = V(900, 760), th = V(150, 170);
  rr(g, tx - tw / 2, ty - th / 2, tw, th, 10); g.fillStyle = '#1a2a52'; g.fill();
  g.strokeStyle = S().ui.gold; g.lineWidth = 5; g.stroke();
  text(g, 'SHAWNE', tx, ty + V(18, 20), { size: V(96, 110), color: S().ui.cream, spacing: 6 });
  // one slim finger tracing the raised letters, left to right; hand enters from the right edge
  const fx = lerp(tx - tw / 2 + 90, tx + tw / 2 - 90, ease.inOut(t / info.dur));
  const fy = ty + 8;
  glow(g, fx, fy, 70, M.practical, 0.25);
  // forearm from the frame edge, purple tracksuit sleeve over its outer half
  const wx = fx + 118, wy = ty + 66;
  seg(g, [[wx, wy], [E.W + 80, ty + 280]], 30, S().ink);
  seg(g, [[lerp(wx, E.W + 80, 0.55), lerp(wy, ty + 280, 0.55)], [E.W + 80, ty + 280]], 44, SHAWNE.color);
  // palm, small and tucked behind the finger
  circle(g, wx, wy, 28, S().ink);
  // the finger itself: slim capsule, fingertip on the letters, knuckle behind it
  seg(g, [[fx, fy], [fx + 64, fy + 26]], 20, S().ink);
  circle(g, fx, fy, 13, S().ink);
  circle(g, fx + 64, fy + 26, 12, S().ink);
  // thin rim along the lit top edge of the finger
  seg(g, [[fx, fy - 11], [fx + 64, fy + 15]], 3, M.rim);
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s126a — "She posted on …" UI: pulsing Upload button, loading ring, comments flooding in.
registerShot('s126a', { draw(g, t, info) {
  const cam = { z: 1.15 - 0.12 * ease.inOut(t / info.dur), x: -16 * ease.inOut(t / info.dur) };
  blurLayer(g, 10, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.5);
  const cx = E.W / 2, cy = E.H * 0.48;
  FX.screen(g, { x: cx - V(300, 240), y: cy - V(280, 380), w: V(600, 480), h: V(560, 760), glowC: '#ffd28a' });
  // pulsing amber Upload button
  const pulse = 1 + 0.08 * Math.sin(t * 6);
  glow(g, cx, cy, 150 * pulse, '#ffb860', 0.55);
  circle(g, cx, cy, 84 * pulse, '#ffb860');
  text(g, 'UPLOAD', cx, cy + 12, { size: V(34, 38), color: S().ink, weight: 900 });
  ring(g, cx, cy, 120 + (t * 60 % 60), 5, alpha(S().ui.gold, 0.7));
  // comments flooding in as small bubbles
  const r = rng(9);
  for (let i = 0; i < 5; i++) {
    const bx = cx - V(240, 190) + r() * V(480, 380), by = cy + V(200, 260) - ((t * 120 + i * 90) % 320);
    UI.bubble(g, bx, by, { w: 110, h: 44, color: alpha('#f4efe6', 0.85) });
  }
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
} });

// s126b — "… TikTok as @thebeardedmom." Insert: chin + purple tracksuit collar ONLY (never a full face).
registerShot('s126b', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.06 * ease.inOut(t / info.dur), x: lerp(40, -30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  blurLayer(g, 12, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.45);
  // warm amber ring-light glow above, head tilting up toward it
  glow(g, E.W / 2, E.H * 0.1, 320, '#ffb860', 0.5 + 0.15 * Math.sin(t * 3));
  ring(g, E.W / 2, E.H * 0.1, 150, 10, alpha('#ffb860', 0.55));
  const lift = ease.inOut(t / info.dur) * 26;
  // chin / jaw only: big black arc rising from below the frame, no eyes, no mouth, no face
  g.save(); g.translate(0, -lift);
  circle(g, E.W / 2, E.H * 1.02, V(430, 470), S().ink);
  // rim crescent on the lit (upper) edge of the chin
  g.save(); g.beginPath(); g.arc(E.W / 2, E.H * 1.02, V(430, 470) + 8, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = M.rim; g.lineWidth = 7; g.stroke(); g.restore();
  // purple tracksuit collar below the chin
  poly(g, [[E.W / 2 - V(300, 260), E.H], [E.W / 2 - V(180, 150), E.H * 0.86], [E.W / 2 + V(180, 150), E.H * 0.86], [E.W / 2 + V(300, 260), E.H]], SHAWNE.color);
  g.restore();
  text(g, '@thebeardedmom', E.W / 2, E.H * 0.82, { size: V(36, 42), color: S().ui.cream, alpha: ease.out(prog(t, 0.4, 0.9)) });
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s127 — "She was 42 years old." Wide: solitary birthday candle on a cupcake, Shawne sitting back.
registerShot('s127', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: lerp(-30, 40, ease.inOut(t / info.dur)) };
  const { GY, M } = shawneAtDesk(g, t, cam, { expr: 'thinking', pose: POSES.sitBack });
  layer(g, cam, 1, (g) => {
    // cupcake with one candle, foreground on the desk
    const cx = E.W / 2 + V(180, 140), cy = GY - V(120, 170);
    rr(g, cx - 46, cy - 40, 92, 64, 10); g.fillStyle = shade(M.wall, 0.2); g.fill();
    circle(g, cx, cy - 44, 34, S().ui.cream);
    seg(g, [[cx, cy - 78], [cx, cy - 110]], 6, S().ui.cream);
    const fl = 0.85 + 0.3 * Math.sin(t * 9) + 0.12 * Math.sin(t * 23);
    circle(g, cx, cy - 128, 13 * fl, '#ffd28a'); glow(g, cx, cy - 128, 110 * fl, '#ffd28a', 0.6 * fl);
    FX.lightCone(g, cx, cy - 128, { angle: Math.PI / 2, spread: 0.6, len: 260, color: '#ffd28a', a: 0.12 });
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
} });

// s128a — "Shawne had been told when she was 10 that …" Insert: child's crayon drawing of a house.
registerShot('s128a', { draw(g, t, info) {
  const cam = { z: 1.03 + 0.05 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 8, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.35);
  const px = E.W / 2 - V(320, 260) + lerp(0, -V(500, 400), ease.inOut(prog(t, 0.9, 1.9)));
  const py = E.H * 0.5, pw = V(640, 520), ph = V(460, 620);
  rr(g, px - pw / 2, py - ph / 2, pw, ph, 8); g.fillStyle = '#efe8d8'; g.fill();
  // crayon house: roof, walls, door, sun — flat crayon strokes in style-token colours
  const hx = px, hy = py + 40;
  seg(g, [[hx - 180, hy - 60], [hx, hy - 190], [hx + 180, hy - 60]], 10, S().ui.accent);
  rr(g, hx - 140, hy - 60, 280, 190, 4); g.strokeStyle = S().ui.blueprint; g.lineWidth = 8; g.stroke();
  rr(g, hx - 30, hy + 40, 60, 90, 4); g.fillStyle = S().ui.gold; g.fill();
  circle(g, hx + 210, hy - 180, 34, S().ui.gold);
  seg(g, [[hx - 240, hy + 130], [hx + 240, hy + 130]], 8, '#5a8a4a');
  // hand entering from the right, sliding the drawing out of view
  const handX = lerp(E.W + 200, px + pw / 2 + 60, ease.inOut(prog(t, 0.7, 1.7)));
  seg(g, [[handX + 160, py + 190], [handX + 30, py + 60]], 52, S().ink);
  seg(g, [[handX + 260, py + 260], [handX + 160, py + 190]], 70, SHAWNE.color);
  circle(g, handX + 20, py + 50, 34, S().ink);
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
  FX.godRays(g, E.W * 0.75, E.H * 0.2, { color: '#ffd28a', a: 0.1 });
} });

// s128b — "… the people who raised her were not her biological parents." Medium: the gap between two parent figures and a child.
registerShot('s128b', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), x: 24 * ease.inOut(t / info.dur) };
  const { GY, M } = office(g, t, cam, { board: true });
  const gap = lerp(90, 260, ease.inOut(t / info.dur));
  const parent = { top: 'tshirt', color: shade(M.wall, 0.15) };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - gap - 170, y: GY, s: V(1.4, 1.5), facing: 1, outfit: parent,
      pose: breathe(POSES.stand, t, 1, 1), expr: 'neutral', rim: { color: M.rim, dir: [-1, -0.3] } });
    drawFigure(g, { x: E.W / 2 + gap + 170, y: GY, s: V(1.4, 1.5), facing: -1, outfit: parent,
      pose: breathe(POSES.stand, t, 1, 2), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.3] } });
    drawFigure(g, { x: E.W / 2, y: GY, s: V(1.4, 1.5), facing: 1, outfit: { ...SHAWNE, kid: true },
      pose: breathe(POSES.stand, t, 1, 3), expr: 'sad', rim: { color: M.rim, dir: [0, -1] } });
    // the widening void between them
    glow(g, E.W / 2, GY - 260, 180, M.key, 0.12);
  });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.8, '#c9d4ff', 0.12);
} });

// s129a — "When she was 26, she decided …" Insert: spinning rotary telephone dial.
registerShot('s129a', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / info.dur), x: 50 * Math.sin(t * 0.5) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, { board: true })); veil(g, '#0e0a14', 0.4);
  const cx = E.W / 2, cy = E.H * 0.5, R = V(300, 330);
  const rot = key(t, [[0, 0], [1.1, 1.9], [1.5, 1.9], [1.9, 0]]);
  circle(g, cx, cy, R + 40, '#15121c');
  ring(g, cx, cy, R + 40, 6, shade(M.wall, 0.2));
  g.save(); g.translate(cx, cy); g.rotate(rot);
  circle(g, 0, 0, R, '#1a2a52');
  const r = rng(5);
  for (let i = 0; i < 10; i++) { const a = (i / 10) * Math.PI * 2; circle(g, Math.cos(a) * R * 0.62, Math.sin(a) * R * 0.62, 26, '#0e0c14'); }
  circle(g, 0, 0, 44, '#e8e2d4');
  g.restore();
  circle(g, cx, cy, 20, S().ui.gold);
  glow(g, cx, cy, 200, M.practical, 0.2);
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
} });
