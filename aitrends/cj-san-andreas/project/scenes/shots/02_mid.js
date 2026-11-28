// shots/02_mid.js — s007–s012: takeover, bullet-time, casino, cop, broke, businesses.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { street } from '../sets/street.js';
import { casino } from '../sets/casino.js';
import { city } from '../sets/city.js';
import { voidSet } from '../sets/void.js';
import { CJ, CJ_HURT, COP, DEALER, RIVAL } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

// s007 — over-the-shoulder: CJ's blurred shoulder foreground; purple crowd across the street
registerShot('s007', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  const { GY, M } = street(g, t, cam);
  layer(g, cam, 1, (g) => {
    // purple crowd walking the block in a loose line
    for (let i = 0; i < 5; i++) {
      const cx = E.W * 0.42 + i * 130 + Math.sin(t * 1.2 + i) * 6;
      drawFigure(g, { x: cx, y: GY, s: 1.05, facing: -1, outfit: RIVAL[i % RIVAL.length], pose: walkPose(t * 5.2 + i * 1.3), expr: 'neutral', rim: rim(M, [1, -0.3]) });
    }
    // one of them tagging over the green wall
    drawFigure(g, { x: E.W * 0.82, y: GY, s: 1.05, facing: -1, outfit: RIVAL[1], pose: POSES.reach, expr: 'neutral', rim: rim(M, [1, -0.3]) });
    seg(g, [[E.W * 0.82 + 40, GY - 240], [E.W * 0.82 + 130, GY - 260], [E.W * 0.82 + 90, GY - 200]], 7, '#8a5ad6');
  });
  // CJ's blurred shoulder in the foreground
  blurLayer(g, 12, (g) => {
    drawFigure(g, { x: E.W * 0.08, y: GY + 260, s: 2.6, facing: 1, outfit: CJ, pose: POSES.stand, expr: 'determined', rim: rim(M, [0, -1]) });
  }, cam, 1.6);
  FX.dust(g, t, { count: 22, color: '#ffe0b0', a: 0.25 });
} });

// s008 — SIGNATURE bullet-time freeze: CJ mid-dive behind a car, droplets hanging
registerShot('s008', { draw(g, t, info) {
  const cam = { z: 1 + 0.012 * t, x: -6 * t };
  const { GY, M } = street(g, t, cam);
  veil(g, '#8fb8e8', 0.1);
  layer(g, cam, 0.9, (g) => {
    // car CJ is diving behind
    rr(g, E.W * 0.42, GY - 190, 620, 150, 34); g.fillStyle = '#1c1626'; g.fill();
    rr(g, E.W * 0.48, GY - 290, 380, 110, 30); g.fillStyle = '#241c30'; g.fill();
    circle(g, E.W * 0.52, GY - 40, 44, '#0e0b12'); circle(g, E.W * 0.82, GY - 40, 44, '#0e0b12');
    glow(g, E.W * 0.48, GY - 240, 160, '#8fb8e8', 0.25);
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.5, y: GY - 280, s: 1.35, facing: 1, outfit: CJ_HURT, pose: POSES.dive, rot: -1.15, expr: 'determined', rim: rim(M, [0, -1]) });
    const [hx, hy, hr] = headPos({ x: E.W * 0.5, y: GY - 280, s: 1.35, facing: 1, outfit: CJ_HURT, pose: POSES.dive, rot: -1.15 });
    const rp = prog(t, 0.4, info.dur);
    if (rp > 0) FX.rings(g, hx, hy, rp * 2.4, { count: 1, r0: hr, r1: hr * 3.4, color: '#cfe0ff', a: 0.4 * (1 - rp) });
  });
  // frozen bullet streaks: thin bright lines
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x1, y1, x2, y2] of [[E.W * 0.2, GY - 420, E.W * 0.42, GY - 300], [E.W * 0.3, GY - 520, E.W * 0.55, GY - 380], [E.W * 0.62, GY - 460, E.W * 0.86, GY - 330], [E.W * 0.1, GY - 300, E.W * 0.36, GY - 200]]) {
    seg(g, [[x1, y1], [x2, y2]], 3, 'rgba(255,240,200,.9)'); seg(g, [[x1, y1], [x2, y2]], 1.2, '#ffffff');
  }
  g.restore();
  FX.drops(g, t, { count: 70, color: '#cfe0ff', drift: 3 });
  UI.badge(g, { str: '100x', x: E.W - V(110, 90), y: V(210, 240), color: S().ui.gold });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.2 });
} });

// s009 — casino insert: chips + duffel swept across the felt; dealer's silhouette behind
registerShot('s009', { draw(g, t, info) {
  const cam = { z: 1.35 + 0.04 * ease.inOut(t / info.dur), x: lerp(60, -40, ease.inOut(t / info.dur)) };
  const { GY, M } = casino(g, t, cam);
  layer(g, cam, 1, (g) => {
    // dealer's silhouette behind the table, face out of frame
    drawFigure(g, { x: E.W * 0.5, y: GY - V(40, 50), s: 1.25, facing: -1, outfit: DEALER, pose: breathe(POSES.stand, t, 1, 4), expr: 'neutral', rim: rim(M, [0, -1]) });
    // CJ's cream-sleeved forearm entering from the right edge, sweeping chips
    // toward the duffel at the table's right end
    const handX = lerp(E.W * 0.98, E.W * 0.74, ease.inOut(prog(t, 0.4, 2.2)));
    const handY = GY - V(215, 255);
    seg(g, [[E.W + 30, handY + 16], [handX + 10, handY + 6]], 22, '#efe9dc');
    seg(g, [[E.W + 30, handY + 16], [handX + 10, handY + 6]], 22, alpha(S().ink, 0.15));
    circle(g, handX, handY, 18, S().ink);
    // chips sliding left with the hand
    for (let i = 0; i < 5; i++) {
      const cx = handX - 30 - i * 44;
      rr(g, cx - 22, handY + 18, 44, 10, 5); g.fillStyle = ['#e0302a', '#f2c21a', '#3a7ae0'][i % 3]; g.fill();
    }
    glow(g, handX, handY, 110, '#ffd47e', 0.25);
  });
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.26 });
} });

// s010 — alley two-shot: smug cop leans in; CJ slides a folder across the crate
registerShot('s010', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.03 * ease.inOut(t / info.dur), x: lerp(20, -20, ease.inOut(t / info.dur)) };
  const { GY, M } = city(g, t, cam, { variant: 'alley' });
  layer(g, cam, 1, (g) => {
    // hero left, facing right
    drawFigure(g, { x: E.W * 0.3, y: GY, s: 1.5, facing: 1, outfit: CJ, pose: breathe(posesAt(t, [[0, 'stand'], [1.2, 'reach'], [2.4, 'stand']]), t), expr: 'determined', look: [0.4, 0], rim: rim(M, [-1, -0.3]), blink: (t % 3.1) > 3.0, prop: t > 1.2 && t < 2.4 ? 'paper' : null });
    // cop right, facing left, arm out, smug
    drawFigure(g, { x: E.W * 0.72, y: GY, s: 1.55, facing: -1, outfit: COP, pose: breathe(posesAt(t, [[0, 'point'], [1.8, 'crossArms']]), t, 1, 3), expr: 'smirk', look: [-0.4, 0], rim: rim(M, [1, -0.3]), blink: (t % 2.7) > 2.6 });
    // folder of photographs sliding across the crate
    const fx = lerp(E.W * 0.42, E.W * 0.56, ease.inOut(prog(t, 1.2, 2.4)));
    g.save(); g.translate(fx, GY - 118); g.rotate(-0.06);
    g.fillStyle = '#f2e6c8'; g.fillRect(-52, -34, 104, 68);
    g.fillStyle = '#8a5a86'; g.fillRect(-40, -22, 34, 44); g.fillStyle = '#3a7ae0'; g.fillRect(2, -22, 34, 44);
    g.restore();
  });
  FX.dust(g, t, { count: 20, color: '#c8d0ff', a: 0.22 });
} });

// s011 — data card: broke. Wallet falls open, coin rolls away, counter stuck at $0
registerShot('s011', { draw(g, t, info) {
  const cam = { z: 1 + 0.04 * ease.inOut(t / info.dur) };
  const { GY, M } = voidSet(g, t, cam);
  layer(g, cam, 0.9, (g) => {
    // CJ's silhouette standing left of the card, head bowed
    drawFigure(g, { x: E.W * 0.13, y: GY + 40, s: 1.6, facing: 1, outfit: CJ, pose: breathe(POSES.sad, t), expr: 'sad', rim: rim(M, [0, -1]), dim: true, alpha: 0.6 });
  });
  UI.dataCard(g, t, { title: 'CJ · STREET GANGSTER', subtitle: 'FORTUNE', from: 0, to: 0, decimals: 0, unit: '', start: 0.4, dur: 1, total: info.dur });
  // '$' right next to the card's 0 value (value is right-aligned at x=1490, y=298)
  text(g, '$', 1428, 298, { size: V(64, 68), color: S().ui.gold, font: FONTS.ui, weight: 900 });
  // wallet falling open, left of the card, drawn AFTER the card so it shows
  const wy = E.H * 0.26 + ease.in(prog(t, 0, 0.9)) * 130, wr = 0.3 * ease.in(prog(t, 0, 0.9));
  g.save(); g.translate(E.W * 0.13, wy); g.rotate(wr);
  rr(g, -90, -40, 180, 80, 14); g.fillStyle = '#4a2a2a'; g.fill();
  poly(g, [[90, -40], [150, -10], [90, 40]], '#5a3434');
  g.restore();
  // coin rolling away along the bottom, below the card
  const cx = lerp(E.W * 0.3, E.W * 0.72, ease.inOut(prog(t, 0.5, 2.4)));
  circle(g, cx, E.H * 0.88, 22, '#c9a24a'); ring(g, cx, E.H * 0.88, 14, 3, '#8a6a2a');
  FX.dust(g, t, { count: 18, color: '#8fb8e8', a: 0.22 });
} });

// s012 — night street of shopfronts: windows light up one by one, OWNED tags snap on
registerShot('s012', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: lerp(40, -40, ease.inOut(t / info.dur)) };
  const { GY, M } = city(g, t, cam, { variant: 'shops' });
  const n = Math.round(12 * ease.inOut(prog(t, 0.3, 2.9)));
  layer(g, cam, 0.7, (g) => {
    for (let i = 0; i < 5; i++) {
      const on = t > 0.3 + i * 0.55;
      if (!on) continue;
      const sx = -E.W * 0.15 + i * V(430, 330), sw = V(400, 300), sh = V(380, 500);
      const wx = sx + 30, wy = GY - sh + 90, ww = sw - 60, wh = 170;
      g.fillStyle = linGrad(g, wx, wy, wx, wy + wh, ['#ffd9a0', '#e8a85c']); g.fillRect(wx, wy, ww, wh);
      glow(g, wx + ww / 2, wy + wh / 2, 180, '#ffcf8a', 0.4);
      // gold OWNED tag snapping on
      const p = ease.outBack(prog(t, 0.3 + i * 0.55, 0.3 + i * 0.55 + 0.35));
      g.save(); g.translate(wx + ww / 2, wy - 34); g.scale(p, p);
      rr(g, -64, -22, 128, 44, 22); g.fillStyle = '#c9a24a'; g.fill();
      text(g, 'OWNED', 0, 2, { size: 24, color: '#14101c', font: FONTS.ui, weight: 900 });
      g.restore();
    }
  });
  // counter climbing 0 -> 12, top right
  const a = ease.out(prog(t, 0.1, 0.5));
  text(g, 'BUSINESSES', E.W - V(90, 70), V(96, 120), { size: V(28, 32), color: alpha(S().ui.cream, 0.85 * a), font: FONTS.ui, weight: 900, align: 'right', spacing: 3 });
  text(g, String(n), E.W - V(90, 70), V(170, 200), { size: V(84, 88), color: S().ui.gold, font: FONTS.ui, weight: 900, align: 'right', glow: 22, glowColor: alpha(S().ui.gold, 0.55), alpha: a });
  FX.dust(g, t, { count: 20, color: '#ffd59a', a: 0.24 });
} });
