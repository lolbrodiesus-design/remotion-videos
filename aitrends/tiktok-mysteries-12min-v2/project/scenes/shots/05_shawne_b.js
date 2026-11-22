// shots/05_shawne_b.js — Story 5 (Shawne Bolton): s129b–s136a.
// The sheriff's search: no record of her mother, but a missing-person record — Shawne herself.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rng, S, text, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { office } from '../sets/office.js';
import { SHAWNE } from '../cast.js';

const sheriffOutfit = (M) => ({ top: 'suit', color: shade(M.wall, 0.1) });

// s129b — "… to look for her biological mother." Wide: lone telephone pole under a cold blue moon.
registerShot('s129b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(-40, 40, ease.inOut(t / info.dur)) };
  const M = mood('night');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.stars(g, t, { seed: 12, count: 90 });
  FX.moon(g, E.W * 0.78, E.H * 0.22, 46, '#e8ecff');
  FX.godRays(g, E.W * 0.78, E.H * 0.22, { color: '#c9d4ff', a: 0.08 });
  layer(g, cam, 0.5, (g) => {
    FX.hills(g, { y: E.H * 0.78, amp: 60, color: shade(M.dark, 0.1) });
    // lone telephone pole + sagging wires
    const px = E.W * 0.3, GY = E.H * 0.82;
    seg(g, [[px, GY], [px, GY - 420]], 10, S().ink);
    seg(g, [[px - 110, GY - 400], [px + 110, GY - 400]], 8, S().ink);
    seg(g, [[px - 110, GY - 400], [px - 320, GY - 300]], 3, alpha(S().ink, 0.8));
    seg(g, [[px + 110, GY - 400], [px + 340, GY - 310]], 3, alpha(S().ink, 0.8));
    FX.lampPost(g, E.W * 0.82, GY, 260, { light: '#ffd59a' });
  });
  // two tiny yellow headlights moving across the distant horizon
  const hx = lerp(E.W * 0.1, E.W * 0.9, ease.inOut(t / info.dur));
  circle(g, hx, E.H * 0.8, 7, '#ffd28a'); circle(g, hx + 26, E.H * 0.8, 7, '#ffd28a');
  glow(g, hx + 13, E.H * 0.8, 60, '#ffd28a', 0.5);
  FX.fog(g, E.H * 0.72, 140, M.fog, 0.3);
} });

// s130a — "She called the sheriff's department in her hometown, …" Medium two-shot + filing drawer sliding open.
registerShot('s130a', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  const { GY, M } = office(g, t, cam, { board: true });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - V(300, 240), y: GY, s: V(1.5, 1.6), facing: 1, outfit: SHAWNE,
      pose: breathe(posesAt(t, [[0, 'sit'], [0.4, 'phone']]), t), expr: 'worried', prop: 'phone',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.2) > 3.1 });
    drawFigure(g, { x: E.W / 2 + V(330, 260), y: GY, s: V(1.55, 1.65), facing: -1, outfit: sheriffOutfit(M),
      pose: breathe(POSES.sit, t, 1, 2), expr: 'thinking', rim: { color: M.rim, dir: [-1, -0.3] } });
    // heavy metal filing-cabinet drawer sliding open toward camera, dust motes spraying
    const open = ease.out(prog(t, 0.4, 1.4));
    const dx = E.W * 0.82, dy = GY - V(60, 90);
    rr(g, dx - 130, dy - 90, 260, 180, 6); g.fillStyle = shade(M.wall, -0.2); g.fill();
    rr(g, dx - 130 + open * 60, dy - 70 + open * 30, 260, 140, 6); g.fillStyle = shade(M.wall, 0.25); g.fill();
    seg(g, [[dx - 60, dy], [dx + 60, dy]], 8, S().ink);
    if (open > 0 && open < 1) FX.dust(g, t, { count: 34, color: '#d8cfae', a: 0.5 });
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
  FX.lightCone(g, E.W / 2 + V(380, 300), GY - V(300, 420), { angle: Math.PI / 2, spread: 0.8, len: 420, color: '#ffd28a', a: 0.1 });
} });

// s130b — "… to ask if her mother had a criminal record." Insert: typewriter key striking "R".
registerShot('s130b', { draw(g, t, info) {
  const cam = { z: 1.12 - 0.08 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.4);
  const cx = E.W / 2, cy = E.H * 0.5;
  // paper sheet
  rr(g, cx - V(420, 340), cy - V(180, 240), V(840, 680), V(360, 480), 8); g.fillStyle = '#efe8d8'; g.fill();
  seg(g, [[cx - 340, cy - 100], [cx + 300, cy - 100]], 4, alpha(S().ink, 0.35));
  // typewriter key arm striking down, then bouncing back
  const strike = key(t, [[0, 0], [0.7, 1], [1.1, 0.15], [1.6, 0]]);
  const ky = cy - V(260, 320) + strike * V(220, 280);
  seg(g, [[cx, cy - V(360, 420)], [cx, ky]], 14, S().ink);
  rr(g, cx - 70, ky - 40, 140, 80, 12); g.fillStyle = '#15121c'; g.fill();
  text(g, 'R', cx, ky + 22, { size: V(52, 58), color: S().ui.cream });
  if (strike > 0.9) { const [sx, sy] = shake(t, 6 * (1 - prog(t, 0.7, 1.2)), 30); g.save(); g.translate(sx, sy); text(g, 'R', cx - 260, cy - 40, { size: V(90, 100), color: S().ink }); g.restore(); }
  glow(g, cx, cy, 200, M.practical, 0.18);
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s131 — "The sheriff could not find any record of her mother." Insert: empty manila folder falling into a bin.
registerShot('s131', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.05 * ease.inOut(t / info.dur), x: lerp(40, -30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  blurLayer(g, 12, (g) => office(g, t, cam, { board: true })); veil(g, '#0e0a14', 0.42);
  const cx = E.W / 2, GY = E.H * 0.86;
  // bin
  poly(g, [[cx - 220, GY - 260], [cx + 220, GY - 260], [cx + 170, GY], [cx - 170, GY]], shade(M.wall, -0.3));
  // folder falling flat, kicking up grit
  const fall = ease.in(prog(t, 0.2, 1.6));
  const fy = lerp(E.H * 0.28, GY - 250, fall), rot = lerp(-0.5, 0.05, fall);
  g.save(); g.translate(cx, fy); g.rotate(rot);
  rr(g, -190, -120, 380, 240, 8); g.fillStyle = '#c9a86a'; g.fill();
  rr(g, -190, -120, 120, 40, 8); g.fillStyle = '#b89a5a'; g.fill();
  seg(g, [[-160, -40], [160, -40]], 4, alpha(S().ink, 0.3));
  g.restore();
  if (fall > 0.9) FX.dust(g, t, { count: 30, color: '#d8cfae', a: 0.55 });
  text(g, 'NO RECORD', cx, E.H * 0.16, { size: V(44, 50), color: S().ui.cream, alpha: ease.out(prog(t, 1.4, 1.9)) });
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s132 — "But he did find a record for a missing person." Medium: blinking amber terminal light, file sliding across.
registerShot('s132', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / info.dur), x: lerp(-30, 40, ease.inOut(t / info.dur)), r: 0.015 * Math.sin(t * 0.8) };
  const { GY, M } = office(g, t, cam, { board: true, report: true });
  // computer terminal, right of desk, amber light blinking
  const tx = E.W * 0.78, ty = GY - V(300, 420);
  FX.screen(g, { x: tx - 130, y: ty - 110, w: 260, h: 190, glowC: '#ffb860' });
  const blink = 0.5 + 0.5 * Math.sin(t * 4);
  circle(g, tx + 150, ty - 60, 16, alpha('#ffb860', 0.35 + 0.65 * blink));
  glow(g, tx + 150, ty - 60, 110, '#ffb860', 0.3 + 0.5 * blink);
  // blinds shadow stripes sweeping with the pulse
  g.fillStyle = alpha('#000000', 0.12 + 0.12 * blink);
  for (let i = 0; i < 4; i++) g.fillRect(E.W * 0.55 + i * 90, GY - V(560, 800), 26, V(560, 800));
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + V(330, 260), y: GY, s: V(1.5, 1.6), facing: -1, outfit: sheriffOutfit(M),
      pose: breathe(posesAt(t, [[0, 'sit'], [0.5, 'reach']]), t, 1, 2), expr: 'surprised', rim: { color: M.rim, dir: [-1, -0.3] } });
    // file sliding across the desk toward Shawne; her hand stops it
    const fx = lerp(E.W / 2 + V(260, 200), E.W / 2 - V(120, 100), ease.inOut(prog(t, 0.5, 1.6)));
    rr(g, fx - 110, GY - V(180, 240), 220, 130, 4); g.fillStyle = '#efe8d8'; g.fill();
    g.fillStyle = '#c94a3a'; g.fillRect(fx - 90, GY - V(150, 210), 90, 22);
    drawFigure(g, { x: E.W / 2 - V(300, 240), y: GY, s: V(1.5, 1.6), facing: 1, outfit: SHAWNE,
      pose: breathe(posesAt(t, [[0, 'sit'], [1.4, 'reach']]), t), expr: 'worried', rim: { color: M.rim, dir: [1, -0.3] } });
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
} });

// s133 — "The missing person was Shawne herself." THE story's one face CU (bigFace): glasses reflecting "MISSING".
registerShot('s133', { draw(g, t, info) {
  const cam = { z: 1.03 + 0.04 * ease.inOut(t / info.dur), x: -16 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => office(g, t, cam, { report: true })); veil(g, '#120a10', 0.45);
  const M = mood('night');
  const r = V(310, 340) * (1 + 0.04 * ease.inOut(t / info.dur));
  const flick = 0.85 + 0.15 * Math.sin(t * 17);
  bigFace(g, E.W / 2, E.H * V(0.58, 0.55), r, { outfit: { ...SHAWNE, face: 'glasses' },
    expr: t > 1.2 ? 'shocked' : 'surprised', rimColor: M.rim, rimSide: -1, blink: (t % 3.0) > 2.9 });
  // "MISSING" reflected across the lenses
  g.save(); g.globalAlpha = 0.85 * flick;
  text(g, 'MISSING', E.W / 2, E.H * V(0.52, 0.49), { size: V(54, 60), color: S().ui.accent, glow: 18, glowColor: alpha(S().ui.accent, 0.7) });
  g.restore();
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.9, '#ffd28a', 0.14 * flick);
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
} });

// s134a — "The report was from 1980, a few months after …" Wide: rusted playground swing set at night.
registerShot('s134a', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(-30, 30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.stars(g, t, { seed: 14, count: 80 });
  FX.moon(g, E.W * 0.2, E.H * 0.2, 40, '#e8ecff');
  const GY = E.H * 0.84;
  layer(g, cam, 0.5, (g) => {
    // swing frame + two swings; one empty swing sways gently
    const fx = E.W / 2;
    seg(g, [[fx - 320, GY], [fx - 260, GY - 380]], 10, S().ink);
    seg(g, [[fx + 320, GY], [fx + 260, GY - 380]], 10, S().ink);
    seg(g, [[fx - 280, GY - 380], [fx + 280, GY - 380]], 10, S().ink);
    const sway = 0.12 * Math.sin(t * 1.4);
    for (const [sx, sw] of [[-140, sway], [140, 0.03 * Math.sin(t * 1.1 + 2)]]) {
      g.save(); g.translate(fx + sx, GY - 380); g.rotate(sw);
      seg(g, [[-46, 0], [-46, 260]], 5, S().ink); seg(g, [[46, 0], [46, 260]], 5, S().ink);
      rr(g, -56, 260, 112, 22, 8); g.fillStyle = shade(M.wall, 0.2); g.fill();
      g.restore();
    }
    FX.hills(g, { y: GY + 10, amp: 40, color: shade(M.dark, 0.1) });
  });
  FX.fog(g, GY - 100, 130, M.fog, 0.3);
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.25 });
} });

// s134b — "… she was born on the 1st of November, 1979." Insert: hospital ID bracelet dated "11-01-79".
registerShot('s134b', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.06 * ease.inOut(t / info.dur), x: 40 * Math.sin(t * 0.5) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, { report: true })); veil(g, '#0e0a14', 0.4);
  const cx = E.W / 2, cy = E.H * 0.52;
  // blue hospital wristband, curved
  g.save(); g.translate(cx, cy); g.rotate(-0.12);
  rr(g, -V(420, 340), -70, V(840, 680), 140, 70); g.fillStyle = S().ui.blueprint; g.fill();
  g.strokeStyle = alpha(S().ui.cream, 0.6); g.lineWidth = 3; g.stroke();
  text(g, '11-01-79', 0, 24, { size: V(72, 80), color: S().ui.cream, spacing: 4 });
  g.restore();
  glow(g, cx, cy, 220, S().ui.blueprint, 0.25);
  // scissors entering from the right, snipping the band
  const sx = lerp(E.W + 160, cx + V(330, 270), ease.inOut(prog(t, 0.8, 2.0)));
  const snip = Math.sin(t * 10) * 0.25;
  g.save(); g.translate(sx, cy - 40); g.rotate(snip);
  seg(g, [[0, 0], [-90, -70]], 10, S().ink); seg(g, [[0, 0], [-90, 70]], 10, S().ink);
  circle(g, 30, -30, 22, S().ink); circle(g, 30, 30, 22, S().ink);
  g.restore();
  if (t > 2.2) FX.rings(g, cx + V(330, 270), cy, t - 2.2, { count: 2, r0: 20, r1: 120, color: S().ui.blueprint, a: 0.4 });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s135 — "The report said she had been kidnapped." Insert: report flat on the desk, red KIDNAPPED stamp slams down.
registerShot('s135', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.04 * ease.inOut(t / info.dur), x: lerp(-30, 30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  blurLayer(g, 8, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.3);
  const cx = E.W / 2, cy = E.H * 0.52;
  rr(g, cx - V(460, 360), cy - V(280, 360), V(920, 720), V(560, 720), 8); g.fillStyle = '#efe8d8'; g.fill();
  g.fillStyle = S().ink;
  g.fillRect(cx - 360, cy - 220, 560, 14); g.fillRect(cx - 360, cy - 180, 420, 9); g.fillRect(cx - 360, cy - 150, 500, 9);
  text(g, 'MISSING PERSON', cx - 360, cy - 60, { size: V(40, 46), color: S().ink, align: 'left' });
  text(g, '1980', cx - 360, cy + 20, { size: V(44, 50), color: S().ink, align: 'left' });
  // red stamp slamming down from above
  const slam = ease.out(prog(t, 0.7, 1.0));
  const sy = lerp(cy - 500, cy + 90, slam);
  const [shx, shy] = t > 1.0 ? shake(t, 8 * (1 - prog(t, 1.0, 1.5)), 30) : [0, 0];
  g.save(); g.translate(shx, shy);
  if (slam > 0) {
    rr(g, cx - 260, sy - 60, 520, 120, 6); g.fillStyle = alpha(S().ui.accent, 0.9 * slam); g.fill();
    text(g, 'KIDNAPPED', cx, sy + 22, { size: V(72, 80), color: '#efe8d8', alpha: slam });
    glow(g, cx, sy, 260, S().ui.accent, 0.3 * slam);
  }
  g.restore();
  glow(g, cx, cy, 240, M.practical, 0.2);
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.3 });
} });

// s136a — "Shawne posted the story on TikTok, in a …" Insert: thumb hovering over a red record button.
registerShot('s136a', { draw(g, t, info) {
  const cam = { z: 1.06 + 0.06 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, { report: true })); veil(g, '#0e0a14', 0.42);
  const cx = E.W / 2, cy = E.H * 0.5;
  FX.screen(g, { x: cx - V(280, 220), y: cy - V(300, 400), w: V(560, 440), h: V(600, 800), glowC: S().ui.accent });
  // report paper peeking behind the phone
  rr(g, cx - V(480, 380), cy + V(180, 240), 300, 180, 6); g.fillStyle = alpha('#efe8d8', 0.9); g.fill();
  // red record button, pulsing; thumb presses it down and it becomes a white square
  const press = ease.inOut(prog(t, 0.9, 1.4));
  const pulse = 1 + 0.1 * Math.sin(t * 5);
  glow(g, cx, cy, 150 * pulse, S().ui.accent, 0.5);
  circle(g, cx, cy, 62 * pulse, S().ui.accent);
  if (press > 0.8) { rr(g, cx - 26, cy - 26, 52, 52, 8); g.fillStyle = '#f4efe6'; g.fill(); }
  // small thumb entering from the bottom-right corner of the phone, tip landing on the button
  const tipX = cx + 6, tipY = cy - 72 + press * 66;
  const knX = cx + 54, knY = cy + 82;
  // forearm from the frame edge, purple tracksuit sleeve over its outer half
  seg(g, [[knX + 16, knY + 22], [cx + 210, cy + V(430, 540)]], 26, S().ink);
  seg(g, [[lerp(knX + 16, cx + 210, 0.5), lerp(knY + 22, cy + V(430, 540), 0.5)], [cx + 210, cy + V(430, 540)]], 40, SHAWNE.color);
  // palm, small, tucked behind the thumb
  circle(g, knX + 16, knY + 22, 28, S().ink);
  // the thumb itself: one slim capsule, fingertip on the button
  seg(g, [[tipX, tipY], [knX, knY]], 22, S().ink);
  circle(g, tipX, tipY, 14, S().ink);
  circle(g, knX, knY, 13, S().ink);
  // thin rim along the lit edge of the thumb
  seg(g, [[tipX - 10, tipY + 4], [knX - 10, knY + 4]], 3, M.rim);
  if (press > 0.8) FX.rings(g, cx, cy, t - 1.4, { count: 2, r0: 80, r1: 260, color: S().ui.accent, a: 0.45 });
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });
