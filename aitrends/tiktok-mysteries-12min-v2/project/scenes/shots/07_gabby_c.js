// shots/07_gabby_c.js — Story 7 (Gabby Petito), part C: s193b–s199b.
import { E, V, registerShot, mood, S, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, noise, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { roadside, van2D } from '../sets/roadside.js';
import { memorial } from '../sets/memorial.js';
import { GABBY, BRIAN } from '../cast.js';

function heart(g, x, y, s, color, a = 1) {
  g.save(); g.globalAlpha = a; g.fillStyle = color;
  g.beginPath(); g.arc(x - 0.45 * s, y - 0.2 * s, 0.5 * s, 0, Math.PI * 2); g.arc(x + 0.45 * s, y - 0.2 * s, 0.5 * s, 0, Math.PI * 2); g.fill();
  poly(g, [[x - 0.9 * s, y - 0.1 * s], [x + 0.9 * s, y - 0.1 * s], [x, y + 0.9 * s]], color);
  g.restore();
}
function phoneShell(g, px, py, pw, ph, M) {
  rr(g, px - 16, py - 16, pw + 32, ph + 32, 40); g.fillStyle = shade(M.dark, -0.35); g.fill();
  rr(g, px, py, pw, ph, 30); g.fillStyle = shade(M.wall, -0.4); g.fill();
  glow(g, px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.7, M.practical, 0.14);
}
function campfire(g, x, y, t, s = 1) {
  glow(g, x, y - 40 * s, 260 * s, '#ff9a3a', 0.5 + 0.12 * Math.sin(t * 9));
  const fl = 1 + 0.12 * Math.sin(t * 11) + 0.06 * Math.sin(t * 23);
  poly(g, [[x - 46 * s, y], [x, y - 110 * s * fl], [x + 46 * s, y]], '#e04a2a');
  poly(g, [[x - 26 * s, y], [x, y - 74 * s * fl], [x + 26 * s, y]], '#ffc46a');
  for (const dx of [-60, 60]) seg(g, [[x + dx * s, y + 6], [x - dx * 0.5 * s, y - 40 * s]], 10 * s, '#241a20');
  const r = rng(31);
  for (let i = 0; i < 12; i++) {
    const sy = y - 60 - ((t * 90 + i * 53) % 320);
    const sx = x + (r() - 0.5) * 120 + Math.sin(t * 2 + i) * 14;
    circle(g, sx, sy, 2.5 + r() * 2.5, alpha('#ffb36a', 0.9 * (1 - (y - 60 - sy) / 320)));
  }
  FX.pool(g, x, y + 10, 280 * s, 36 * s, '#ff9a3a', 0.25);
}

// s193b — medium: Jenn & Kyle in lawn chairs by a flickering campfire; '27 AUG' holds.
registerShot('s193b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: 30 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.12, (g) => {
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 33, count: 90, area: [0, 0, E.W, E.H * 0.5], color: '#e8ecff' });
    FX.moon(g, E.W * 0.82, E.H * 0.2, 36, '#e8ecff');
    FX.hills(g, { y: E.H * 0.72, amp: 70, color: shade(M.wall, -0.4), seed: 35 });
    for (const [px, s] of [[E.W * 0.08, 1.2], [E.W * 0.93, 1.35], [E.W * 0.18, 0.9]]) FX.pine(g, px, E.H * 0.78, s, '#14101c');
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, E.H * 0.72, 0, E.H, [shade(M.grass, -0.2), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.72, E.W * 3, E.H * 0.3);
    campfire(g, E.W * 0.5, E.H * 0.82, t, 1.1);
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [0, -1], w: 4 };
    const jenn = { top: 'tshirt', color: shade(M.wall, 0.08), head: 'ponytail', headColor: shade(M.wall, 0.08) };
    const kyle = { top: 'tshirt', color: shade(M.wall, -0.05), head: 'cap', headColor: shade(M.wall, -0.05) };
    for (const [fx, out, seed] of [[E.W * 0.32, jenn, 5], [E.W * 0.68, kyle, 6]]) {
      FX.chair(g, fx - 10, E.H * 0.82, 1.5, shade(M.wall, -0.2));
      drawFigure(g, { x: fx, y: E.H * 0.82, s: 1.45, facing: fx < E.W / 2 ? 1 : -1, outfit: out, pose: breathe(POSES.sit, t, 1, seed), expr: 'neutral', rim, blink: (t % 3.4) > 3.3 });
    }
  });
  // GoPro overlay: timestamp holding
  layer(g, cam, 1, (g) => {
    text(g, '27 AUG', E.W * 0.08, E.H * 0.1, { size: 32, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    circle(g, E.W * 0.9, E.H * 0.08, 10, S().ui.accent);
    text(g, 'REC', E.W * 0.92, E.H * 0.09, { size: 26, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left' });
  });
  FX.dust(g, t, { count: 16, color: '#ffb36a', a: 0.3 });
} });

// s194a — wide: inside a dark tent, one glowing laptop screen lighting the poles.
registerShot('s194a', { draw(g, t, info) {
  const cam = { z: 1.1 - 0.08 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.5, (g) => {
    backdrop(g, [shade(M.wall, -0.5), shade(M.dark, -0.3)]);
    // tent canvas: big triangle, poles
    poly(g, [[-E.W * 0.2, E.H], [E.W / 2, E.H * 0.04], [E.W * 1.2, E.H]], shade(M.wall, -0.35));
    poly(g, [[E.W * 0.3, E.H], [E.W / 2, E.H * 0.04], [E.W * 0.7, E.H]], shade(M.wall, -0.25));
    seg(g, [[E.W / 2, E.H * 0.04], [E.W / 2, E.H]], 6, shade(M.wall, -0.1));
    seg(g, [[E.W * 0.3, E.H], [E.W / 2, E.H * 0.04]], 5, shade(M.wall, -0.1));
    seg(g, [[E.W * 0.7, E.H], [E.W / 2, E.H * 0.04]], 5, shade(M.wall, -0.1));
    // sleeping bag
    rr(g, E.W * 0.62, E.H * 0.78, 320, 90, 40); g.fillStyle = shade(M.wall, -0.05); g.fill();
    FX.floorLines(g, E.H * 0.82, E.H, 'rgba(0,0,0,.25)', 0.08);
  });
  layer(g, cam, 1, (g) => {
    // glowing laptop on the tent floor
    const lx = E.W * 0.34, ly = E.H * 0.56;
    FX.screen(g, { x: lx, y: ly, w: 340, h: 210, bg: '#14202c', glowC: M.practical, a: 0.4 }, (gg, x, y, w, h) => {
      for (let i = 0; i < 4; i++) { rr(gg, x + 16, y + 16 + i * 46, w - 32, 34, 6); gg.fillStyle = mix('#3a6ea5', '#1a1424', 0.3 + (i % 2) * 0.3); gg.fill(); }
      heart(gg, x + w - 50, y + 40, 12, S().ui.accent, 0.9);
    });
    rr(g, lx - 30, ly + 210, 400, 26, 8); g.fillStyle = shade(M.wall, -0.15); g.fill();
    FX.lightCone(g, lx + 170, ly + 100, { angle: Math.PI / 2, spread: 0.9, len: 520, color: M.practical, a: 0.22 });
    FX.pool(g, lx + 170, E.H * 0.86, 300, 36, M.practical, 0.2);
    // a figure's silhouette hunched over the screen, back to camera
    drawFigure(g, { x: lx + 170, y: E.H * 0.86, s: 1.4, facing: 1, outfit: { top: 'tshirt', color: shade(M.wall, -0.1), head: 'none' }, pose: breathe(POSES.sit, t, 1, 7), expr: 'neutral', rim: { color: M.rim, dir: [0, -1], w: 4 } });
  });
  FX.dust(g, t, { count: 18, color: '#ffcf9e', a: 0.3 });
} });

// s194b — medium: a hand hovering over the spacebar, trembling; slow push-in.
registerShot('s194b', { draw(g, t, info) {
  const cam = { z: 1.45 + 0.08 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: -180, y: -180 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // keyboard, top-down-ish
    const kx = E.W / 2 - 480, ky = E.H * 0.42, kw = 960, kh = 380;
    rr(g, kx - 20, ky - 20, kw + 40, kh + 40, 20); g.fillStyle = shade(M.dark, -0.35); g.fill();
    const r = rng(41);
    for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) {
      rr(g, kx + 16 + col * 78, ky + 16 + row * 72, 62, 54, 8); g.fillStyle = shade(M.wall, -0.1 + r() * 0.1); g.fill();
    }
    // spacebar, highlighted
    const sbx = kx + 240, sby = ky + 300;
    rr(g, sbx, sby, 480, 56, 10); g.fillStyle = shade(M.wall, 0.15); g.fill();
    ring(g, sbx + 240, sby + 28, 44, 3, alpha(S().ui.gold, 0.7 + 0.3 * Math.sin(t * 3)));
    text(g, 'SPACE', sbx + 240, sby + 38, { size: 24, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    glow(g, sbx + 240, sby + 28, 160, M.practical, 0.2);
    // trembling hand hovering above the spacebar
    const [hx, hy] = shake(t, 5, 9, 11);
    const handX = sbx + 240 + hx, handY = sby - 90 + hy;
    seg(g, [[handX - 30, handY + 130], [handX - 10, handY + 10]], 44, S().ink);
    circle(g, handX, handY, 44, S().ink);
    for (let i = 0; i < 4; i++) seg(g, [[handX - 30 + i * 20, handY + 6], [handX - 34 + i * 20, handY + 64]], 15, S().ink);
    seg(g, [[handX + 44, handY + 20], [handX + 84, handY + 70]], 16, S().ink);
    glow(g, handX, handY, 180, M.key, 0.1);
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.28 });
} });

// s195 — insert: grainy video frame of a Florida license plate, static rolling over it.
registerShot('s195', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: 160, y: -160 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    const sx = E.W / 2 - 520, sy = E.H * 0.2, sw = 1040, sh = 620;
    rr(g, sx - 12, sy - 12, sw + 24, sh + 24, 14); g.fillStyle = shade(M.dark, -0.4); g.fill();
    g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
    // grainy video: van parked on a dirt road
    g.fillStyle = linGrad(g, 0, sy, 0, sy + sh, ['#2a2440', '#14101c']); g.fillRect(sx, sy, sw, sh);
    FX.hills(g, { y: sy + sh * 0.6, amp: 34, color: '#1c1626', seed: 55 });
    g.fillStyle = '#3a3238'; g.fillRect(sx, sy + sh * 0.6, sw, sh * 0.4);
    poly(g, [[sx, sy + sh], [sx + sw * 0.42, sy + sh * 0.6], [sx + sw * 0.58, sy + sh * 0.6], [sx + sw, sy + sh]], '#4a3c40');
    van2D(g, sx + sw * 0.5, sy + sh * 0.88, 0.5, {});
    // Florida plate, glinting, centre
    const px = sx + sw / 2 - 190, py = sy + sh * 0.42;
    rr(g, px, py, 380, 130, 10); g.fillStyle = '#f2efe8'; g.fill();
    rr(g, px + 8, py + 8, 364, 114, 8); g.fillStyle = '#e8e4d4'; g.fill();
    text(g, 'FLORIDA', px + 190, py + 38, { size: 30, color: '#3a6ea5', font: FONTS.ui, weight: 900, spacing: 4 });
    // plate characters kept as soft blurred blocks (no invented number)
    for (let i = 0; i < 6; i++) { rr(g, px + 60 + i * 46, py + 62, 34, 44, 6); g.fillStyle = alpha('#1a1622', 0.55); g.fill(); }
    const glint = 0.4 + 0.4 * Math.sin(t * 2.4);
    seg(g, [[px + 30, py + 110], [px + 150, py + 20]], 4, alpha('#ffffff', glint));
    glow(g, px + 190, py + 65, 200, '#fff3dc', 0.25 * glint);
    // rolling static lines + grain
    for (let i = 0; i < 5; i++) {
      const ly = sy + ((t * 160 + i * 130) % sh);
      seg(g, [[sx, ly], [sx + sw, ly]], 2, alpha('#ffffff', 0.1));
    }
    const r = rng(57);
    for (let i = 0; i < 60; i++) circle(g, sx + r() * sw, sy + r() * sh, 1.5, alpha('#ffffff', 0.14));
    g.restore();
    text(g, '27 AUG  •  SPREAD CREEK', sx + 10, sy + sh + 44, { size: 26, color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  });
  FX.dust(g, t, { count: 12, color: '#cfd8ff', a: 0.25 });
} });

// s196 — wide: the van parked alone, Spread Creek sign, search lights beginning at the edge.
registerShot('s196', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur), y: 26 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'night', van: true, vanX: E.W * 0.56, vanS: 1.0 });
  layer(g, cam, 1, (g) => {
    // Spread Creek sign, left
    const sx = E.W * 0.2, sy = GY;
    seg(g, [[sx, sy], [sx, sy - 260]], 10, shade(M.wall, -0.2));
    rr(g, sx - 150, sy - 340, 300, 90, 8); g.fillStyle = shade(M.wall, -0.15); g.fill();
    text(g, 'SPREAD CREEK', sx, sy - 296, { size: 30, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 1 });
    text(g, 'DISPERSED CAMPING', sx, sy - 266, { size: 20, color: alpha(S().ui.cream, 0.7), font: FONTS.ui, weight: 900, spacing: 1 });
    // cold blue moonbeam on the van roof
    FX.moon(g, E.W * 0.56, E.H * 0.16, 40, '#e8ecff');
    FX.lightCone(g, E.W * 0.56, E.H * 0.16, { angle: Math.PI / 2.4, spread: 0.3, len: 900, color: '#cfe0ff', a: 0.18 });
    FX.pool(g, E.W * 0.56, GY + 10, 260, 30, '#cfe0ff', 0.16);
    // search lights beginning at the frame edge, sweeping in
    const sweep = ease.inOut(prog(t, 0.4, info.dur));
    for (const [ex, ang] of [[E.W * 1.02, -Math.PI / 2 - 0.5 * sweep], [E.W * 1.02, -Math.PI / 2 - 0.2 * sweep]]) {
      FX.lightCone(g, ex, E.H * 0.5, { angle: ang, spread: 0.16, len: 1100, color: '#fff3dc', a: 0.28 });
      glow(g, ex, E.H * 0.5, 60, '#fff3dc', 0.5);
    }
  });
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.28 });
  FX.fog(g, GY - 120, 180, M.fog, 0.25);
} });

// s197a — UI: FBI tip line dialling, just after midnight; the clock ticks past midnight.
registerShot('s197a', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: -140, y: -100 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 290, py = E.H * 0.08, pw = 580, ph = 880;
    phoneShell(g, px, py, pw, ph, M);
    text(g, 'FBI TIP LINE', E.W / 2, py + 70, { size: 32, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    text(g, '1-800-CALL-FBI', E.W / 2, py + 130, { size: 40, color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 2 });
    // calling animation: pulsing rings around the call icon
    const cx = E.W / 2, cy = py + 260;
    FX.rings(g, cx, cy, t, { count: 3, r0: 60, r1: 200, speed: 1.1, color: S().ui.gold, a: 0.5 });
    circle(g, cx, cy, 58, '#3fb950');
    seg(g, [[cx - 20, cy - 8], [cx - 6, cy + 12], [cx + 24, cy - 16]], 7, S().ink);
    text(g, 'CALLING…', cx, cy + 110, { size: 28, color: alpha(S().ui.cream, 0.8), font: FONTS.ui, weight: 900, spacing: 3 });
    // dial pad
    const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];
    keys.forEach((k, i) => {
      const col = i % 3, row = Math.floor(i / 3);
      const kx = px + 110 + col * 180, ky = py + 430 + row * 100;
      circle(g, kx, ky, 40, shade(M.wall, -0.1));
      text(g, k, kx, ky + 8, { size: 30, color: S().ui.cream, font: FONTS.ui, weight: 900 });
    });
    // clock ticking past midnight
    const mins = Math.floor(t / 2);
    const hh = mins >= 1 ? '12:01' : '11:59';
    const ap = mins >= 1 ? 'AM' : 'PM';
    text(g, hh + ' ' + ap, E.W / 2, py + ph - 40, { size: 34, color: S().ui.gold, font: FONTS.ui, weight: 900, spacing: 2 });
    // signal bars pulsing
    for (let i = 0; i < 4; i++) {
      const on = (Math.floor(t * 2) % 4) >= i;
      g.fillStyle = on ? S().ui.cream : alpha(S().ui.cream, 0.25);
      g.fillRect(px + pw - 120 + i * 18, py + 30 - i * 8, 12, 14 + i * 8);
    }
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.25 });
} });

// s197b — UI: 'Send' button clicked by a cursor; phone beside the laptop, footage thumbnail attaching.
registerShot('s197b', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: -22 * ease.inOut(t / info.dur), r: 0.01 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: 140, y: -100 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // laptop, left; phone, right
    const lx = E.W * 0.1, ly = E.H * 0.22;
    rr(g, lx, ly, 760, 480, 12); g.fillStyle = shade(M.dark, -0.4); g.fill();
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(lx + 14, ly + 14, 732, 452);
    glow(g, lx + 380, ly + 240, 320, M.practical, 0.16);
    text(g, 'FBI TIP  •  NEW MESSAGE', lx + 40, ly + 60, { size: 26, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 1 });
    // GoPro thumbnail attaching to the message
    const tk = ease.inOut(prog(t, 0.2, 1.2));
    const tx = lerp(lx + 560, lx + 40, tk), ty = ly + 110;
    rr(g, tx, ty, 300, 170, 10); g.fillStyle = mix('#3a6ea5', '#1a1424', 0.4); g.fill();
    van2D(g, tx + 150, ty + 140, 0.22, {});
    poly(g, [[tx + 130, ty + 60], [tx + 130, ty + 110], [tx + 170, ty + 85]], S().ui.cream);
    text(g, 'GOPRO_27AUG.mp4', tx + 150, ty + 200, { size: 20, color: S().ui.cream, font: FONTS.ui, weight: 900 });
    text(g, '27 AUG  •  Spread Creek', lx + 40, ly + 340, { size: 26, color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left' });
    // phone beside the laptop
    const px = E.W * 0.62, py = E.H * 0.3;
    phoneShell(g, px, py, 300, 540, M);
    rr(g, px + 20, py + 30, 260, 150, 10); g.fillStyle = mix('#3a6ea5', '#1a1424', 0.4); g.fill();
    van2D(g, px + 150, py + 150, 0.2, {});
    text(g, 'Attached', px + 150, py + 230, { size: 24, color: alpha(S().ui.cream, 0.8), font: FONTS.ui, weight: 900 });
    // 'Send' button: gray -> bright amber as the cursor clicks it
    const click = prog(t, 1.2, 1.7);
    const btnX = px + 40, btnY = py + 430, btnW = 220, btnH = 64;
    const btnC = mix(shade(M.wall, 0.1), S().ui.gold, click);
    rr(g, btnX, btnY, btnW, btnH, 32); g.fillStyle = btnC; g.fill();
    if (click > 0.5) glow(g, btnX + btnW / 2, btnY + btnH / 2, 160, S().ui.gold, 0.5 * click);
    text(g, 'SEND', btnX + btnW / 2, btnY + 42, { size: 28, color: click > 0.5 ? S().ink : S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    // cursor arrow moving to the button and clicking
    const curX = lerp(E.W * 0.85, btnX + btnW / 2 + 20, ease.inOut(prog(t, 0.2, 1.2)));
    const curY = lerp(E.H * 0.2, btnY + btnH / 2, ease.inOut(prog(t, 0.2, 1.2)));
    const cs = click > 0 && click < 1 ? 1 : 1.15;
    poly(g, [[curX, curY], [curX, curY + 34 * cs], [curX + 12 * cs, curY + 24 * cs], [curX + 20 * cs, curY + 34 * cs], [curX + 26 * cs, curY + 30 * cs], [curX + 20 * cs, curY + 20 * cs], [curX + 30 * cs, curY + 20 * cs]], S().ui.cream);
    if (click >= 1) FX.rings(g, btnX + btnW / 2, btnY + btnH / 2, t - 1.7, { count: 2, r0: 40, r1: 200, speed: 1.6, color: S().ui.gold, a: 0.5 });
  });
  FX.dust(g, t, { count: 16, color: '#ffcf9e', a: 0.28 });
} });

// s198a — wide: three flashlight beams criss-crossing in a dark forest; search teams fanning out.
registerShot('s198a', { draw(g, t, info) {
  const cam = { z: 1 + 0.07 * ease.inOut(t / info.dur), x: -34 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.2, (g) => {
    backdrop(g, [shade(M.wall, -0.5), shade(M.dark, -0.3)]);
    FX.stars(g, t, { seed: 61, count: 40, area: [0, 0, E.W, E.H * 0.3], color: '#e8ecff' });
    FX.hills(g, { y: E.H * 0.7, amp: 60, color: shade(M.wall, -0.45), seed: 63 });
  });
  layer(g, cam, 0.6, (g) => {
    for (const [px, s] of [[E.W * 0.06, 1.5], [E.W * 0.16, 1.1], [E.W * 0.84, 1.4], [E.W * 0.94, 1.0], [E.W * 0.5, 0.9]]) FX.pine(g, px, E.H * 0.9, s, '#0c0a14');
    // search tape across the trees
    seg(g, [[E.W * 0.1, E.H * 0.62], [E.W * 0.9, E.H * 0.58 + Math.sin(t * 1.4) * 6]], 8, S().ui.gold);
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [0, -1], w: 4 };
    const searcher = { top: 'tshirt', color: shade(M.wall, -0.05), head: 'cap', headColor: shade(M.wall, -0.05) };
    const spots = [[E.W * 0.3, -0.5], [E.W * 0.52, 0.3], [E.W * 0.72, -0.9]];
    spots.forEach(([fx, baseAng], i) => {
      const ang = baseAng + Math.sin(t * 0.9 + i * 2.1) * 0.45;
      // flashlight beam from the figure's hand
      const hx = fx + 30, hy = E.H * 0.72 - 120;
      FX.lightCone(g, hx, hy, { angle: Math.PI / 2 + ang, spread: 0.22, len: 700, color: '#ffe9b0', a: 0.3 });
      glow(g, hx, hy, 46, '#ffe9b0', 0.7);
      drawFigure(g, { x: fx, y: E.H * 0.72, s: 1.3, facing: 1, outfit: searcher, pose: breathe(posesAt(t, [[0, 'stand'], [0.8, 'point']]), t, 1, 8 + i), expr: 'neutral', rim, dim: 0.3 });
    });
    FX.pool(g, E.W * 0.5, E.H * 0.76, 420, 40, '#ffe9b0', 0.12);
  });
  FX.dust(g, t, { count: 20, color: '#ffe9b0', a: 0.3 });
  FX.fog(g, E.H * 0.55, 180, M.fog, 0.3);
} });

// s198b — medium: a searcher stops dead and lowers the flashlight; heads bowed, tape fluttering.
registerShot('s198b', { draw(g, t, info) {
  const cam = { z: 1.08 + 0.05 * ease.inOut(t / info.dur), x: 26 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.4, (g) => {
    backdrop(g, [shade(M.wall, -0.45), shade(M.dark, -0.25)]);
    FX.fog(g, E.H * 0.5, 200, M.fog, 0.3);
    for (const [px, s] of [[E.W * 0.1, 1.3], [E.W * 0.9, 1.2]]) FX.pine(g, px, E.H * 0.9, s, '#0c0a14');
    // tape fluttering
    const fl = Math.sin(t * 2.2) * 8;
    seg(g, [[E.W * 0.12, E.H * 0.6], [E.W * 0.5, E.H * 0.58 + fl], [E.W * 0.88, E.H * 0.62]], 7, S().ui.gold);
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [0, -1], w: 4 };
    const searcher = { top: 'tshirt', color: shade(M.wall, -0.05), head: 'cap', headColor: shade(M.wall, -0.05) };
    const fx = E.W * 0.44, fy = E.H * 0.78;
    // the beam lowers to the ground and stays still
    const lower = ease.inOut(prog(t, 0.5, 1.4));
    const hx = fx + 40, hy = fy - 130 + lower * 30;
    FX.lightCone(g, hx, hy, { angle: Math.PI / 2 + lerp(-0.5, 0.15, lower), spread: 0.2, len: 620, color: '#ffe9b0', a: 0.32 });
    FX.pool(g, hx + 60, fy + 20, 200, 26, '#ffe9b0', 0.25);
    glow(g, hx, hy, 40, '#ffe9b0', 0.7);
    drawFigure(g, { x: fx, y: fy, s: 1.55, facing: 1, outfit: searcher, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'sad']]), t, 1, 9), expr: 'sad', rim, dim: 0.25, blink: (t % 3.6) > 3.5 });
    // second searcher, head bowed, further back
    drawFigure(g, { x: E.W * 0.7, y: fy, s: 1.3, facing: -1, outfit: searcher, pose: breathe(POSES.sad, t, 1, 10), expr: 'sad', rim, dim: 0.45 });
  });
  FX.dust(g, t, { count: 16, color: '#ffe9b0', a: 0.28 });
} });

// s199a — insert: navy clipboard with a white sheet; a pen draws a quick signature.
registerShot('s199a', { draw(g, t, info) {
  const cam = { z: 1.5 - 0.06 * ease.inOut(t / info.dur), x: -22 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => memorial(g, t, { z: 1.7, x: 160, y: -140 }, { mood: 'dusk' })); veil(g, '#120a10', 0.45);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.52;
    g.save(); g.translate(cx, cy); g.rotate(-0.04 + 0.01 * Math.sin(t * 0.6)); g.translate(-cx, -cy);
    rr(g, cx - 260, cy - 330, 520, 660, 16); g.fillStyle = shade(M.wall, -0.05); g.fill();
    rr(g, cx - 220, cy - 280, 440, 560, 8); g.fillStyle = '#f2efe8'; g.fill();
    // printed lines on the sheet
    for (let i = 0; i < 8; i++) { rr(g, cx - 180, cy - 230 + i * 46, 360 - (i % 3) * 60, 10, 5); g.fillStyle = alpha(S().ink, 0.35); g.fill(); }
    // a single flower at the frame edge
    seg(g, [[cx + 300, cy + 300], [cx + 320, cy + 220]], 4, '#2e4a2e');
    circle(g, cx + 322, cy + 210, 16, '#ff8aa0');
    circle(g, cx + 322, cy + 210, 6, '#fff3dc');
    // signature drawing on at the bottom
    const k = ease.inOut(prog(t, 0.6, info.dur - 0.2));
    const sig = [[cx - 160, cy + 220], [cx - 100, cy + 190], [cx - 40, cy + 225], [cx + 20, cy + 195], [cx + 90, cy + 222], [cx + 150, cy + 200]];
    g.strokeStyle = S().ink; g.lineWidth = 5; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(...sig[0]);
    const fi = k * (sig.length - 1), si = Math.floor(fi), fk = fi - si;
    for (let i = 1; i <= si; i++) g.lineTo(...sig[i]);
    if (si < sig.length - 1) g.lineTo(lerp(sig[si][0], sig[si + 1][0], fk), lerp(sig[si][1], sig[si + 1][1], fk));
    g.stroke();
    // pen resting on the board
    seg(g, [[cx + 180, cy + 260], [cx + 250, cy + 180]], 8, S().ink);
    g.restore();
    glow(g, cx, cy, 380, M.key, 0.1);
  });
  FX.dust(g, t, { count: 14, color: '#ffcf9e', a: 0.28 });
} });

// s199b — medium: a uniformed figure looks down at a covered shape; heavy indigo gradient, muted light.
// (Respectful: the shape is a low, dark draped form at a distance — no detail, no graphic content.)
registerShot('s199b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.5, (g) => {
    backdrop(g, [shade(M.wall, -0.3), shade(M.dark, -0.2)]);
    g.fillStyle = shade(M.floor, -0.35); g.fillRect(-E.W, E.H * 0.78, E.W * 3, E.H * 0.3);
    FX.floorLines(g, E.H * 0.78, E.H, 'rgba(0,0,0,.25)', 0.08);
    FX.fog(g, E.H * 0.6, 160, M.fog, 0.3);
  });
  layer(g, cam, 0.9, (g) => {
    // closed file on a desk, muted light; a single flower resting on it
    const dx = E.W * 0.68, dy = E.H * 0.78;
    rr(g, dx - 170, dy - 90, 340, 60, 6); g.fillStyle = shade(M.wall, -0.15); g.fill();
    rr(g, dx - 150, dy - 100, 300, 50, 6); g.fillStyle = shade(M.wall, 0.05); g.fill();
    seg(g, [[dx - 60, dy - 110], [dx - 50, dy - 140]], 3, '#2e4a2e');
    circle(g, dx - 48, dy - 148, 12, '#ff8aa0');
    circle(g, dx - 48, dy - 148, 5, '#fff3dc');
    FX.pool(g, dx, dy + 6, 260, 30, M.practical, 0.14);
    // low draped form, far side, kept dark and abstract
    g.fillStyle = 'rgba(0,0,0,.55)';
    g.beginPath(); g.ellipse(E.W * 0.3, E.H * 0.8, 200, 42, 0, Math.PI, 0); g.fill();
    veil(g, '#0c0a18', 0.25);
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [1, -0.5], w: 4 };
    const officer = { top: 'tshirt', color: shade(M.wall, -0.05), head: 'cap', headColor: shade(M.wall, -0.05) };
    drawFigure(g, { x: E.W * 0.44, y: E.H * 0.78, s: 1.6, facing: 1, outfit: officer, pose: breathe(posesAt(t, [[0, 'stand'], [0.7, 'sad']]), t, 1, 11), expr: 'sad', rim, dim: 0.3, blink: (t % 3.3) > 3.2 });
  });
  FX.dust(g, t, { count: 16, color: '#cfd8ff', a: 0.25 });
} });
