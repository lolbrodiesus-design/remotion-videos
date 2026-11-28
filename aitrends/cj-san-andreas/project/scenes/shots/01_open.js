// shots/01_open.js — s001–s006: title, childhood, introduction, loss, homecoming.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { street } from '../sets/street.js';
import { home } from '../sets/home.js';
import { CJ, CJ_KID, SWEET } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });
const PLAIN = { top: 'tshirt', color: '#0e0b12', legs: '#0e0b12', head: 'none' };

// s001 — title card over a slow push-in on Los Santos at dusk
registerShot('s001', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  street(g, t, cam);
  UI.titleCard(g, t, { lines: ['YOUR LIFE AS', 'CJ'], sub: 'FROM GTA SAN ANDREAS', dur: info.dur, y: E.H * 0.42 });
  FX.dust(g, t, { count: 20, color: '#ffe0b0', a: 0.25 });
} });

// s002 — kid CJ walks the centre line; adults argue on a porch; police wash slides by
registerShot('s002', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.02 * ease.inOut(t / info.dur), x: lerp(60, -60, ease.inOut(t / info.dur)) };
  const { GY, M } = street(g, t, cam);
  const s = V(0.85, 0.9);
  layer(g, cam, 0.55, (g) => {
    // two adult silhouettes arguing on a porch, left
    drawFigure(g, { x: E.W * 0.2, y: GY, s: 1.1, facing: 1, outfit: PLAIN, pose: breathe(posesAt(t, [[0, 'talk'], [1.6, 'point']]), t, 1, 2), expr: 'angry', rim: rim(M, [-1, -0.3]) });
    drawFigure(g, { x: E.W * 0.29, y: GY, s: 1.1, facing: -1, outfit: PLAIN, pose: breathe(posesAt(t, [[0, 'stand'], [1.2, 'crossArms']]), t, 1, 5), expr: 'angry', rim: rim(M, [1, -0.3]) });
  });
  layer(g, cam, 1, (g) => {
    const kx = lerp(E.W * 0.32, E.W * 0.62, t / info.dur);
    drawFigure(g, { x: kx, y: GY, s, facing: 1, outfit: CJ_KID, pose: walkPose(t * 5.6), expr: 'awe', look: [0.4, -0.1], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
  });
  // police red-blue wash sliding across the houses
  const sw = (t * 0.35) % 1, wx = lerp(-200, E.W + 200, sw);
  glow(g, wx, GY - V(300, 420), 500, sw < 0.5 ? '#e0302a' : '#3a7ae0', 0.14);
  FX.dust(g, t, { count: 22, color: '#ffe0b0', a: 0.25 });
} });

// s003 — CJ steps out of the sunset; the name 'CJ' snaps in beside his head
registerShot('s003', { draw(g, t, info) {
  const cam = { z: 1.12 + 0.05 * ease.inOut(t / info.dur), x: lerp(40, 0, ease.inOut(t / info.dur)) };
  const { GY, M } = street(g, t, cam);
  const s = V(1.6, 1.7);
  layer(g, cam, 1, (g) => {
    const cx = E.W * 0.42 + ease.out(prog(t, 0, 0.8)) * 60;
    drawFigure(g, { x: cx, y: GY, s, facing: 1, outfit: CJ, pose: breathe(posesAt(t, [[0, 'stand'], [0.7, 'talk'], [2.0, 'relaxed']]), t), expr: t < 0.7 ? 'determined' : 'smirk', look: [0.3, -0.2], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
    const [hx, hy, hr] = headPos({ x: cx, y: GY, s, facing: 1, outfit: CJ, pose: POSES.stand });
    UI.callout(g, t, { at: [hx + hr, hy - hr * 0.4], to: [hx + 260, hy - 190], str: 'CJ', start: 1.4, size: V(44, 48) });
    if (t > 1.4) FX.rings(g, hx, hy, t - 1.4, { count: 2, r0: hr * 1.1, r1: hr * 2.2, color: '#ffd47e', a: 0.4 });
  });
  FX.lensStreak(g, E.W * 0.62, GY - V(320, 460), E.W * 0.6, '#ffe6cc', 0.12);
  FX.dust(g, t, { count: 24, color: '#ffe0b0', a: 0.28 });
} });

// s004 — insert, top-down on wet asphalt: bandana + fallen cap beside a chalk outline
registerShot('s004', { draw(g, t, info) {
  blurLayer(g, 10, (g) => street(g, t, { z: 1.9, x: 120, y: 80 }));
  veil(g, '#14101e', 0.42);
  const M = mood('dusk'), cx = E.W / 2, cy = E.H * 0.52;
  // wet asphalt sheen
  g.fillStyle = linGrad(g, 0, cy - 320, 0, cy + 320, ['#241c2c', '#17121e', '#241c2c']); g.fillRect(cx - 760, cy - 320, 1520, 640);
  glow(g, cx, cy, 420, '#8a5a86', 0.14);
  // chalk outline, lying figure
  g.save(); g.translate(cx - 60, cy); g.rotate(-0.08); g.strokeStyle = 'rgba(244,239,230,.85)'; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.ellipse(0, 0, 300, 95, 0, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.arc(-330, -10, 52, 0, Math.PI * 2); g.stroke(); g.restore();
  // red-orange bandana, dropped
  g.save(); g.translate(cx + 180, cy + 130); g.rotate(0.5);
  poly(g, [[-90, -30], [90, -30], [40, 60], [-40, 60]], '#d64a33');
  circle(g, 0, -10, 14, '#e8e0d0'); g.restore();
  // fallen green cap
  g.save(); g.translate(cx - 260, cy + 150); g.rotate(-0.4);
  g.fillStyle = '#3fb950'; g.beginPath(); g.ellipse(0, 0, 86, 46, 0, Math.PI, Math.PI * 2); g.fill();
  seg(g, [[20, -6], [120, 2]], 16, shade('#3fb950', -0.3)); g.restore();
  // rain rings spreading on the wet asphalt
  for (let i = 0; i < 3; i++) FX.rings(g, cx + [-320, 120, 380][i], cy + [-140, 180, -60][i], t + i * 0.4, { count: 1, r0: 10, r1: 150, color: '#b8c8ff', a: 0.35, speed: 0.9 });
  FX.rain(g, t, { count: 120, a: 0.22, timeScale: 0.6 });
} });

// s005 — CJ with a duffel walks toward his mother's house; a taxi pulls away
registerShot('s005', { draw(g, t, info) {
  const cam = { z: 1 + 0.07 * ease.inOut(t / info.dur), x: lerp(30, -30, ease.inOut(t / info.dur)) };
  const { GY, M } = home(g, t, cam, { variant: 'porch' });
  const s = V(1.15, 1.25);
  layer(g, cam, 0.55, (g) => {
    // taxi pulling away behind him, tail lights shrinking
    const k = ease.inOut(t / info.dur), tx = lerp(E.W * 0.3, E.W * 0.72, k), ts = 1 - 0.35 * k;
    g.save(); g.translate(tx, GY + 6); g.scale(ts, ts);
    rr(g, -150, -110, 300, 90, 22); g.fillStyle = '#c9a24a'; g.fill();
    rr(g, -90, -160, 160, 60, 16); g.fillStyle = '#8a6a2a'; g.fill();
    circle(g, -95, -22, 26, '#15121c'); circle(g, 95, -22, 26, '#15121c');
    circle(g, -140, -80, 10, '#e0302a'); glow(g, -140, -80, 50, '#e0302a', 0.7);
    circle(g, 140, -80, 10, '#e0302a'); glow(g, 140, -80, 50, '#e0302a', 0.7);
    g.restore();
  });
  layer(g, cam, 1, (g) => {
    const cx = lerp(E.W * 0.3, E.W * 0.52, t / info.dur);
    drawFigure(g, { x: cx, y: GY, s, facing: 1, outfit: CJ, pose: walkPose(t * 5.6), expr: 'worried', look: [0.5, -0.1], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
    // duffel bag over his shoulder
    rr(g, cx - 70, GY - 210 * s, 84, 46, 18); g.fillStyle = '#241a20'; g.fill();
  });
  FX.dust(g, t, { count: 22, color: '#ffe0b0', a: 0.25 });
} });

// s006 — porch: two plain figures slumped on the steps; CJ stands small, camera pulls back
registerShot('s006', { draw(g, t, info) {
  const cam = { z: 1.1 - 0.1 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  const { GY, M } = home(g, t, cam, { variant: 'room' });
  layer(g, cam, 1, (g) => {
    // two plain-ink figures slumped on the steps, doing nothing
    drawFigure(g, { x: E.W * 0.32, y: GY, s: 1.0, facing: 1, outfit: PLAIN, pose: breathe(POSES.sit, t, 0.6, 2), expr: 'sad', rim: rim(M, [-1, -0.3]) });
    drawFigure(g, { x: E.W * 0.66, y: GY, s: 1.0, facing: -1, outfit: PLAIN, pose: breathe(POSES.sitBack, t, 0.6, 7), expr: 'neutral', rim: rim(M, [1, -0.3]) });
    // CJ small in front of them
    drawFigure(g, { x: E.W * 0.5, y: GY, s: 0.9, facing: 1, outfit: CJ, pose: breathe(posesAt(t, [[0, 'stand'], [1.4, 'sad']]), t), expr: 'sad', look: [-0.4, 0.1], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
  });
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.26 });
} });
