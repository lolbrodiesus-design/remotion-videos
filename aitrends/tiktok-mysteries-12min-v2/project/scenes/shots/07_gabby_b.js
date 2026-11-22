// shots/07_gabby_b.js — Story 7 (Gabby Petito), part B: s184b–s193a.
import { E, V, registerShot, mood, S, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, noise, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { roadside, van2D } from '../sets/roadside.js';
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
// scrolling TikTok tiles inside a phone screen rect
function feedTiles(g, px, py, pw, ph, t, o = {}) {
  const { speed = 160, seed = 5, hearts = true } = o;
  const r = rng(seed);
  const cols = ['#3a6ea5', '#8a5ad6', '#d64a33', '#3fb950'];
  g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
  for (let i = 0; i < 7; i++) {
    const th = 150, gap = 18;
    const y0 = py - 40 + i * (th + gap) + ((t * speed) % (th + gap)) - (th + gap);
    const cc = cols[(i + seed) % 4];
    rr(g, px + 18, y0, pw - 36, th, 14); g.fillStyle = mix(cc, '#1a1424', 0.45); g.fill();
    circle(g, px + 70, y0 + 52, 30, shade(cc, 0.15));
    rr(g, px + 116, y0 + 34, pw - 180, 12, 6); g.fillStyle = alpha(S().ui.cream, 0.5); g.fill();
    rr(g, px + 116, y0 + 60, pw - 260, 10, 5); g.fillStyle = alpha(S().ui.cream, 0.3); g.fill();
    if (hearts) heart(g, px + pw - 62, y0 + 52, 16 + 4 * Math.sin(t * 3 + i), S().ui.accent, 0.9);
    poly(g, [[px + pw - 96, y0 + 108], [px + pw - 96, y0 + 136], [px + pw - 72, y0 + 122]], alpha('#f2f2f2', 0.85));
  }
  g.restore();
}

// s184b — insert: the empty passenger seat headrest in cold blue moonlight; one hair strand glows.
// (v4 fix: the headrest is now a SOLID dark-blue shape with a moonlight rim,
// the seat below it, and the road passing behind through the van window.)
registerShot('s184b', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur), y: -30 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: 160, y: -160 }, { mood: 'night' })); veil(g, '#0a0814', 0.45);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // van window frame around the shot
    rr(g, E.W * 0.14, E.H * 0.1, E.W * 0.72, E.H * 0.8, 30); g.fillStyle = shade(M.wall, -0.5); g.fill();
    g.save(); g.beginPath(); rr(g, E.W * 0.17, E.H * 0.14, E.W * 0.66, E.H * 0.72, 20); g.clip();
    g.fillStyle = linGrad(g, 0, E.H * 0.14, 0, E.H * 0.86, [shade(M.wall, -0.2), shade(M.dark, -0.1)]); g.fillRect(E.W * 0.17, E.H * 0.14, E.W * 0.66, E.H * 0.72);
    FX.moon(g, E.W * 0.68, E.H * 0.26, 40, S().feature);
    FX.lightCone(g, E.W * 0.68, E.H * 0.26, { angle: Math.PI / 2.3, spread: 0.4, len: 800, color: S().ui.blueprint, a: 0.16 });
    // the road passing behind, through the window: pines + dashes sliding past
    const winL = E.W * 0.17, winR = E.W * 0.83, winW = winR - winL;
    g.fillStyle = shade(M.dark, -0.1); g.fillRect(winL, E.H * 0.6, winW, E.H * 0.26);
    seg(g, [[winL, E.H * 0.6], [winR, E.H * 0.6]], 3, alpha(S().ui.blueprint, 0.4));
    for (let i = 0; i < 3; i++) {
      const px = winL + (((i * 520 - t * 260) % (winW + 240)) + winW + 240) % (winW + 240) - 120;
      FX.pine(g, px, E.H * 0.62, 0.8, S().ink);
    }
    for (let i = 0; i < 7; i++) {
      const dx = winL + (((i * 230 - t * 260) % (winW + 230)) + winW + 230) % (winW + 230) - 115;
      g.fillStyle = alpha(S().ui.cream, 0.55); g.fillRect(dx, E.H * 0.72, 100, 10);
    }
    // empty passenger seat + headrest, centre-left
    const sx = E.W * 0.42, sy = E.H * 0.82;
    // moonlight halo behind the headrest so the dark shape pops
    glow(g, sx, sy - 400, 300, S().ui.blueprint, 0.3);
    // seat back: solid dark blue
    poly(g, [[sx - 190, sy], [sx - 165, sy - 300], [sx + 165, sy - 300], [sx + 190, sy]], mix(M.wall, S().ui.blueprint, 0.32));
    // seat cushion
    rr(g, sx - 200, sy - 40, 400, 90, 30); g.fillStyle = mix(M.wall, S().ui.blueprint, 0.25); g.fill();
    seg(g, [[sx - 190, sy - 40], [sx + 190, sy - 40]], 3, alpha(S().ink, 0.3));
    // headrest posts
    for (const px of [-70, 70]) { g.fillStyle = shade(M.wall, 0.15); g.fillRect(sx + px - 8, sy - 340, 16, 44); }
    // headrest: SOLID dark blue, rounded, with a cold moonlight rim
    rr(g, sx - 135, sy - 500, 270, 165, 38); g.fillStyle = mix(M.wall, S().ui.blueprint, 0.52); g.fill();
    // fabric stitching
    seg(g, [[sx - 135, sy - 420], [sx + 135, sy - 420]], 3, alpha(S().ink, 0.25));
    seg(g, [[sx - 135, sy - 380], [sx + 135, sy - 380]], 3, alpha(S().ink, 0.18));
    // moonlight rim along the top + left edge
    seg(g, [[sx - 135, sy - 462], [sx - 135, sy - 360]], 6, alpha(S().ui.blueprint, 0.85));
    g.strokeStyle = alpha(S().ui.blueprint, 0.9); g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sx - 100, sy - 500); g.quadraticCurveTo(sx, sy - 516, sx + 100, sy - 500); g.stroke();
    glow(g, sx, sy - 490, 180, S().ui.blueprint, 0.35);
    FX.pool(g, sx, sy - 380, 220, 34, S().ui.blueprint, 0.2);
    // a single stray hair strand caught in the fabric, glowing white
    const sway = Math.sin(t * 1.6) * 8;
    g.strokeStyle = alpha(S().feature, 0.95); g.lineWidth = 4; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sx + 40, sy - 360); g.quadraticCurveTo(sx + 70 + sway, sy - 320, sx + 46 + sway, sy - 268); g.stroke();
    glow(g, sx + 56, sy - 314, 26, S().feature, 0.5);
    g.restore();
    // cold window glint
    seg(g, [[E.W * 0.2, E.H * 0.16], [E.W * 0.34, E.H * 0.84]], 3, alpha(S().feature, 0.12));
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.28 });
} });

// s185 — UI: TikTok feed scrolling rapidly, hearts flooding, screen glow pulsing.
registerShot('s185', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: 22 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: -140, y: -100 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 290, py = E.H * 0.08, pw = 580, ph = 880;
    phoneShell(g, px, py, pw, ph, M);
    feedTiles(g, px + 10, py + 60, pw - 20, ph - 150, t, { speed: 260, seed: 9 });
    // hearts flooding up the right edge
    const r = rng(3);
    for (let i = 0; i < 9; i++) {
      const hx = px + pw - 90 + (r() - 0.5) * 60;
      const hy = py + ph - ((t * 220 + i * 110) % (ph + 80));
      heart(g, hx, hy, 14 + r() * 8, S().ui.accent, 0.85);
    }
    text(g, 'TIKTOK', E.W / 2, py + 36, { size: 30, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 4 });
    glow(g, E.W / 2, E.H * 0.5, 380, M.practical, 0.12 + 0.08 * Math.sin(t * 4));
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.25 });
  FX.speedLines(g, t, { cx: E.W / 2, cy: E.H * 0.5, count: 24, a: 0.12 });
} });

// s186 — FACE CU 2/3: Gabby lit by the blue light of a handheld screen, eyes lifting.
registerShot('s186', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), r: 0.012 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.6, x: -180, y: -140 }, { mood: 'night' })); veil(g, '#0a0814', 0.42);
  const M = mood('night');
  const flick = 0.75 + 0.25 * noise(t * 6, 8);
  layer(g, cam, 1, (g) => {
    const r = V(300, 330) * (1 + 0.04 * ease.inOut(t / info.dur));
    // blue screen glow from below
    glow(g, E.W / 2, E.H * 0.95, 520, '#7fb8e8', 0.35 * flick);
    bigFace(g, E.W / 2, E.H * V(0.58, 0.55), r, { outfit: GABBY, expr: 'sad', look: [0, lerp(0.3, -0.3, ease.inOut(prog(t, 0.3, info.dur - 0.3)))], rimColor: '#9fc8ff', rimSide: 1, blink: (t % 3.1) > 3.0 });
    // sharing icons floating at the frame edge
    const icons = [[E.W * 0.1, E.H * 0.3], [E.W * 0.9, E.H * 0.34], [E.W * 0.12, E.H * 0.72], [E.W * 0.88, E.H * 0.7]];
    icons.forEach(([ix, iy], i) => {
      const bob = Math.sin(t * 2 + i * 1.7) * 10;
      circle(g, ix, iy + bob, 30, alpha(S().ui.blueprint, 0.85));
      seg(g, [[ix - 12, iy + bob], [ix + 12, iy + bob - 14]], 4, S().ink);
      poly(g, [[ix + 12, iy + bob - 20], [ix + 22, iy + bob - 10], [ix + 8, iy + bob - 6]], S().ink);
    });
    veil(g, '#4a7ab8', 0.1 * flick);
  });
  FX.dust(g, t, { count: 16, color: '#9fc8ff', a: 0.3 });
} });

// s187a — UI: Miranda Baker's video tile, play button, map pin dropping on Grand Teton.
registerShot('s187a', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: 140, y: -100 }, { mood: 'dusk' })); veil(g, '#0a0812', 0.5);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 300, py = E.H * 0.08, pw = 600, ph = 880;
    phoneShell(g, px, py, pw, ph, M);
    // video tile: roadside, thumb out, van approaching
    const tx = px + 24, ty = py + 60, tw = pw - 48, th = 480;
    g.save(); g.beginPath(); rr(g, tx, ty, tw, th, 16); g.clip();
    g.fillStyle = linGrad(g, 0, ty, 0, ty + th, [M.sky[0], M.sky[1]]); g.fillRect(tx, ty, tw, th);
    FX.hills(g, { y: ty + th * 0.62, amp: 40, color: shade(M.wall, -0.2), seed: 31 });
    g.fillStyle = shade(M.grass, -0.2); g.fillRect(tx, ty + th * 0.62, tw, th * 0.38);
    poly(g, [[tx, ty + th], [tx + tw * 0.42, ty + th * 0.62], [tx + tw * 0.58, ty + th * 0.62], [tx + tw, ty + th]], '#4a3c40');
    van2D(g, tx + tw * 0.68, ty + th * 0.86, 0.32, { headlights: true });
    // thumb out, foreground left
    seg(g, [[tx + 70, ty + th - 40], [tx + 96, ty + th - 150]], 30, S().ink);
    circle(g, tx + 100, ty + th - 168, 24, S().ink);
    for (let i = 0; i < 4; i++) seg(g, [[tx + 84 + i * 10, ty + th - 150], [tx + 88 + i * 10, ty + th - 178]], 11, S().ink);
    g.restore();
    // play button + profile name
    circle(g, E.W / 2, ty + th / 2, 64, alpha('#0c0c12', 0.55));
    poly(g, [[E.W / 2 - 18, ty + th / 2 - 30], [E.W / 2 - 18, ty + th / 2 + 30], [E.W / 2 + 34, ty + th / 2]], S().ui.cream);
    text(g, 'MIRANDA BAKER', px + 24, ty + th + 52, { size: 30, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 1 });
    text(g, 'Grand Teton  •  hitchhiker pickup', px + 24, ty + th + 92, { size: 24, color: alpha(S().ui.cream, 0.65), font: FONTS.ui, weight: 700, align: 'left' });
    // progress bar red-lining left to right
    const bp = ease.inOut(prog(t, 0.2, info.dur - 0.2));
    rr(g, tx, ty + th + 130, tw, 10, 5); g.fillStyle = alpha(S().ui.cream, 0.25); g.fill();
    rr(g, tx, ty + th + 130, Math.max(12, tw * bp), 10, 5); g.fillStyle = S().ui.accent; g.fill();
    // mini map with pin dropping
    const mx = px + pw - 150, my = py + ph - 130;
    circle(g, mx, my, 46, shade(M.wall, -0.1)); ring(g, mx, my, 46, 2, alpha(S().ui.cream, 0.4));
    seg(g, [[mx - 30, my], [mx + 30, my]], 2, alpha(S().ui.cream, 0.3));
    const pinY = my - 26 + 34 * (1 - ease.out(prog(t, 0.4, 1.2)));
    circle(g, mx, pinY, 12, S().ui.accent);
    poly(g, [[mx - 9, pinY + 6], [mx + 9, pinY + 6], [mx, pinY + 24]], S().ui.accent);
    text(g, 'GRAND TETON', mx, my + 68, { size: 20, color: S().ui.cream, font: FONTS.ui, weight: 900 });
  });
  FX.dust(g, t, { count: 14, color: '#ffcf9e', a: 0.25 });
} });

// s187b — insert: a thumb held out at the edge of a dark road; the white van approaches.
registerShot('s187b', { draw(g, t, info) {
  const cam = { z: 1.12 - 0.08 * ease.inOut(t / info.dur), x: 30 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.1, x: 40, y: 0 }, { mood: 'dusk' });
  layer(g, cam, 1, (g) => {
    // blurred white streak (car) rushing past in the background
    const streakX = lerp(-E.W * 0.3, E.W * 1.3, prog(t, 0.1, 0.7));
    g.save(); g.globalAlpha = 0.5 * (1 - prog(t, 0.6, 0.9));
    rr(g, streakX - 260, GY - 260, 520, 90, 40); g.fillStyle = '#e8e4f4'; g.fill();
    g.restore();
    FX.speedLines(g, t, { cx: E.W * 0.6, cy: GY - 200, count: 18, a: 0.2 });
    // van approaching from the distance
    const vk = ease.inOut(prog(t, 0, info.dur));
    van2D(g, lerp(E.W * 0.72, E.W * 0.56, vk), GY + 6, lerp(0.5, 0.85, vk), { headlights: true });
    // big thumb, foreground left
    const hx = E.W * 0.24, hy = GY - 120;
    seg(g, [[hx - 40, GY + 40], [hx - 10, hy + 60]], 90, S().ink);
    seg(g, [[hx - 10, hy + 60], [hx + 20, hy - 60]], 70, S().ink);
    circle(g, hx + 26, hy - 90, 40, S().ink);
    for (let i = 0; i < 4; i++) seg(g, [[hx - 6 + i * 16, hy - 40], [hx + 2 + i * 16, hy - 84]], 15, S().ink);
    seg(g, [[hx + 60, hy - 60], [hx + 130, hy - 10]], 20, S().ink);
    glow(g, hx, hy, 220, M.key, 0.12);
  });
  blurLayer(g, 12, (g) => { FX.pine(g, E.W * 0.06, E.H * 0.95, 1.6, '#14101c'); }, null, 1.7);
  FX.dust(g, t, { count: 18, color: '#ffe0b0', a: 0.28 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
} });

// s188 — wide: Jessica at her desk, two glowing monitors; one screen shows the van at Spread Creek.
registerShot('s188', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -34 * ease.inOut(t / info.dur) };
  const M = mood('interiorWarm');
  layer(g, cam, 0.55, (g) => {
    backdrop(g, [shade(M.wall, -0.45), shade(M.dark, -0.25)]);
    g.fillStyle = shade(M.floor, -0.3); g.fillRect(-E.W, E.H * 0.8, E.W * 3, E.H * 0.3);
    FX.floorLines(g, E.H * 0.8, E.H, 'rgba(0,0,0,.2)', 0.08);
  });
  layer(g, cam, 0.9, (g) => {
    // desk
    rr(g, E.W * 0.3, E.H * 0.62, E.W * 0.4, 26, 8); g.fillStyle = shade(M.wall, -0.15); g.fill();
    seg(g, [[E.W * 0.34, E.H * 0.65], [E.W * 0.34, E.H * 0.82]], 10, shade(M.wall, -0.15));
    seg(g, [[E.W * 0.66, E.H * 0.65], [E.W * 0.66, E.H * 0.82]], 10, shade(M.wall, -0.15));
    // two glowing monitors
    const mon = (mx, my, mw, mh, screen) => {
      rr(g, mx - 8, my - 8, mw + 16, mh + 16, 10); g.fillStyle = shade(M.dark, -0.4); g.fill();
      FX.screen(g, { x: mx, y: my, w: mw, h: mh, bg: '#14202c', glowC: M.practical, a: 0.3 }, screen);
    };
    mon(E.W * 0.32, E.H * 0.24, 300, 190, (gg, x, y, w, h) => {
      // monitor 1: the van parked at Spread Creek
      gg.fillStyle = linGrad(gg, 0, y, 0, y + h, ['#3a2a4a', '#1c1626']); gg.fillRect(x, y, w, h);
      FX.hills(gg, { y: y + h * 0.6, amp: 16, color: '#241a20', seed: 41 });
      van2D(gg, x + w * 0.55, y + h * 0.82, 0.22, {});
      gg.fillStyle = alpha('#e8e4f4', 0.8); gg.fillRect(x + 14, y + 14, 90, 16);
    });
    mon(E.W * 0.56, E.H * 0.24, 300, 190, (gg, x, y, w, h) => {
      // monitor 2: scrolling feed
      for (let i = 0; i < 4; i++) { rr(gg, x + 14, y + 14 + i * 44, w - 28, 32, 6); gg.fillStyle = mix('#3a6ea5', '#1a1424', 0.3 + (i % 2) * 0.3); gg.fill(); }
    });
    // amber light cone spilling on the floor
    FX.lightCone(g, E.W * 0.5, E.H * 0.42, { angle: Math.PI / 2, spread: 0.8, len: 640, color: M.practical, a: 0.2 });
    FX.pool(g, E.W * 0.5, E.H * 0.84, 420, 50, M.practical, 0.18);
  });
  layer(g, cam, 1, (g) => {
    const rim = { color: M.rim, dir: [0, -1], w: 4 };
    const jess = { top: 'tshirt', color: shade(M.wall, 0.1), head: 'ponytail', headColor: shade(M.wall, 0.1) };
    drawFigure(g, { x: E.W * 0.5, y: E.H * 0.8, s: 1.5, facing: 1, outfit: jess, pose: breathe(POSES.sit, t, 1, 3), expr: 'thinking', rim, blink: (t % 3.5) > 3.4 });
  });
  FX.dust(g, t, { count: 24, color: '#ffcf9e', a: 0.3 });
} });

// s189 — insert: a van tire half-submerged in gray Spread Creek gravel; the van behind.
// (v4 fix: the tire is now a real tire — round, tread blocks, hubcap — tilted
// and half-buried in gravel under the van's fender arch, not a black arch.)
registerShot('s189', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: 26 * ease.inOut(t / info.dur) };
  blurLayer(g, 12, (g) => roadside(g, t, { z: 1.7, x: -200, y: -180 }, { mood: 'dusk', van: true, vanX: E.W * 0.62, vanS: 0.8 })); veil(g, '#120a10', 0.4);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    // gravel bed
    g.fillStyle = linGrad(g, 0, E.H * 0.55, 0, E.H, [shade(M.wall, 0.05), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.55, E.W * 3, E.H * 0.5);
    const r = rng(15);
    for (let i = 0; i < 90; i++) circle(g, r() * E.W, E.H * 0.58 + r() * E.H * 0.4, 3 + r() * 7, shade(M.wall, 0.1 + r() * 0.25));
    // van side panel above the wheel, with stripe, door seam + handle
    const tx = E.W * 0.46, ty = E.H * 0.72;
    rr(g, E.W * 0.06, E.H * 0.08, E.W * 0.88, E.H * 0.6, 26); g.fillStyle = S().ui.cream; g.fill();
    g.fillStyle = shade(S().ui.blueprint, -0.2); g.fillRect(E.W * 0.06, E.H * 0.62, E.W * 0.88, 16);
    seg(g, [[E.W * 0.78, E.H * 0.1], [E.W * 0.78, E.H * 0.62]], 3, alpha(S().ink, 0.2));
    rr(g, E.W * 0.8, E.H * 0.3, 70, 16, 8); g.fillStyle = shade(M.wall, -0.2); g.fill();
    glow(g, E.W * 0.5, E.H * 0.12, 420, M.key, 0.15);
    // wheel-arch opening cut into the panel
    circle(g, tx, ty + 60, 290, shade(M.dark, -0.2));
    // the tire, tilted, sitting in the arch
    g.save(); g.translate(tx, ty); g.rotate(-0.16);
    circle(g, 0, 0, 215, S().ink);
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      seg(g, [[Math.cos(a) * 180, Math.sin(a) * 180], [Math.cos(a) * 212, Math.sin(a) * 212]], 22, shade(M.wall, 0.08));
    }
    ring(g, 0, 0, 150, 6, alpha(S().ui.cream, 0.22));
    // moonlight edge on the upper-left sidewall
    g.strokeStyle = alpha(S().ui.blueprint, 0.6); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 168, Math.PI * 0.85, Math.PI * 1.45); g.stroke();
    // hubcap: silver disc, lug nuts, centre cap
    circle(g, 0, 0, 96, shade(S().ui.cream, -0.3));
    ring(g, 0, 0, 96, 4, alpha(S().ui.cream, 0.5));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      circle(g, Math.cos(a) * 56, Math.sin(a) * 56, 11, shade(M.wall, -0.25));
    }
    circle(g, 0, 0, 26, shade(M.wall, -0.2));
    circle(g, 0, 0, 9, S().ui.gold);
    g.restore();
    // fender lip arcing over the tire
    g.strokeStyle = S().ui.cream; g.lineWidth = 18; g.lineCap = 'round';
    g.beginPath(); g.arc(tx, ty + 60, 296, Math.PI * 1.08, Math.PI * 1.92); g.stroke();
    // gravel mounded over the bottom of the tire — half-buried
    const r2 = rng(16);
    for (let i = 0; i < 46; i++) circle(g, tx - 200 + r2() * 400, ty + 80 + r2() * 130, 5 + r2() * 9, shade(M.wall, 0.05 + r2() * 0.25));
    // a few stones pressed against the tire's lower edge
    for (let i = 0; i < 8; i++) circle(g, tx - 160 + i * 46, ty + 150 + Math.sin(i * 2.1) * 18, 8 + (i % 3) * 3, shade(M.wall, 0.15));
    // gravel shifting slightly, as if under weight
    const sh = Math.sin(t * 1.2) * 4;
    for (let i = 0; i < 8; i++) circle(g, tx - 150 + i * 44, ty + 190 + sh * (i % 2 ? 1 : -1), 5, shade(M.wall, 0.0));
    glow(g, tx, ty - 220, 240, M.key, 0.12);
  });
  FX.dust(g, t, { count: 18, color: S().ui.cream, a: 0.3 });
  FX.fog(g, E.H * 0.5, 140, M.fog, 0.18);
} });

// s190 — medium: Brian pacing beside the van, half in shadow, facing away; his shadow stretches and shrinks.
registerShot('s190', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -28 * ease.inOut(t / info.dur), y: 24 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'dusk', van: true, vanX: E.W * 0.66, vanS: 1.0 });
  layer(g, cam, 1, (g) => {
    // Brian paces back and forth beside the van, facing away from camera
    const pace = Math.sin(t * 1.5);
    const bx = E.W * 0.34 + pace * 90;
    const ph = t * Math.PI * 1.8;
    // his shadow stretching and shrinking against the van's side
    const shLen = 180 + 140 * Math.abs(Math.sin(t * 1.5));
    poly(g, [[bx - 30, GY], [bx - 30 - shLen, GY + 26], [bx + 30 - shLen, GY + 26], [bx + 30, GY]], 'rgba(0,0,0,.5)');
    drawFigure(g, { x: bx, y: GY, s: 1.55, facing: pace > 0 ? 1 : -1, outfit: BRIAN, pose: breathe(walkPose(ph, {}), t, 1, 4), expr: 'neutral', rim: { color: M.rim, dir: [-1, -0.4], w: 3 }, dim: 0.45, blink: false });
    // empty space beside the van, lit cold
    FX.pool(g, E.W * 0.34, GY + 16, 260, 30, '#cfe0ff', 0.1);
  });
  blurLayer(g, 10, (g) => { FX.pine(g, E.W * 0.08, E.H * 0.95, 1.5, '#14101c'); }, null, 1.7);
  FX.dust(g, t, { count: 18, color: '#cfd8ff', a: 0.25 });
  FX.fog(g, GY - 110, 150, M.fog, 0.2);
} });

// s191 — insert: abandoned sunglasses lying in the dirt; lenses reflect a cold, starless sky.
registerShot('s191', { draw(g, t, info) {
  const cam = { z: 1.55 + 0.06 * ease.inOut(t / info.dur), x: 22 * ease.inOut(t / info.dur), y: -36 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: 180, y: -200 }, { mood: 'night' })); veil(g, '#0a0814', 0.42);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // dirt ground
    g.fillStyle = linGrad(g, 0, E.H * 0.5, 0, E.H, [shade(mix(M.wall, M.grass, 0.5), -0.1), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.5, E.W * 3, E.H * 0.6);
    const r = rng(19);
    for (let i = 0; i < 70; i++) circle(g, r() * E.W, E.H * 0.55 + r() * E.H * 0.42, 2 + r() * 6, shade(mix(M.wall, M.grass, 0.5), -0.2 + r() * 0.3));
    // pine shadows crossing slowly
    const shx = Math.sin(t * 0.5) * 120;
    for (let i = 0; i < 4; i++) {
      g.save(); g.globalAlpha = 0.4; poly(g, [[E.W * 0.2 + i * 260 + shx, E.H * 0.5], [E.W * 0.32 + i * 260 + shx, E.H * 0.5], [E.W * 0.12 + i * 260 + shx, E.H], [E.W * 0.02 + i * 260 + shx, E.H]], '#0c0a14'); g.restore();
    }
    // sunglasses, centre
    const sx = E.W / 2, sy = E.H * 0.68;
    g.save(); g.translate(sx, sy); g.rotate(-0.12 + 0.02 * Math.sin(t * 0.8));
    for (const lx of [-95, 95]) {
      circle(g, lx, 0, 72, '#0c0a14');
      circle(g, lx, 0, 62, '#1c2440');
      glow(g, lx - 14, -16, 40, '#8fa8d8', 0.5);
      seg(g, [[lx - 50, -30], [lx + 10, 10]], 4, alpha('#ffffff', 0.35));
    }
    seg(g, [[-24, -8], [24, -8]], 10, '#0c0a14');
    seg(g, [[-168, -6], [-230, -30]], 8, '#0c0a14');
    seg(g, [[168, -6], [230, -30]], 8, '#0c0a14');
    g.restore();
    FX.sparkle(g, sx - 95, sy - 30, 18, '#cfe0ff', 0.5 + 0.3 * Math.sin(t * 2));
  });
  FX.dust(g, t, { count: 12, color: '#cfe0ff', a: 0.25 });
  FX.fog(g, E.H * 0.5, 120, M.fog, 0.15);
} });

// s192 — wide: dashcam perspective, dirt road flanked by pines; twin amber light cones in the fog.
registerShot('s192', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: 30 * ease.inOut(t / info.dur), r: -0.012 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'night' });
  layer(g, cam, 1, (g) => {
    // break in the clouds: a cold gap of sky
    glow(g, E.W * 0.5, E.H * 0.18, 300, '#8fa8d8', 0.3);
    FX.clouds(g, { y: E.H * 0.1, h: 80, color: '#2a2440', a: 0.5, seed: 27 });
    // twin amber light cones from the dashcam car
    FX.lightCone(g, E.W * 0.44, E.H * 0.94, { angle: -Math.PI / 2.6, spread: 0.35, len: 900, color: M.practical, a: 0.3 });
    FX.lightCone(g, E.W * 0.56, E.H * 0.94, { angle: -Math.PI / 2.4, spread: 0.35, len: 900, color: M.practical, a: 0.3 });
    FX.pool(g, E.W * 0.5, GY + 60, 420, 50, M.practical, 0.16);
    // dashcam frame corners
    g.strokeStyle = alpha(S().ui.cream, 0.35); g.lineWidth = 4;
    for (const [cx, cy, dx, dy] of [[60, 60, 1, 1], [E.W - 60, 60, -1, 1], [60, E.H - 60, 1, -1], [E.W - 60, E.H - 60, -1, -1]]) {
      g.beginPath(); g.moveTo(cx + dx * 50, cy); g.lineTo(cx, cy); g.lineTo(cx, cy + dy * 50); g.stroke();
    }
    circle(g, E.W - 120, 80, 10, S().ui.accent);
    text(g, 'REC', E.W - 100, 90, { size: 26, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left' });
  });
  FX.fog(g, GY - 140, 220, M.fog, 0.35);
  FX.dust(g, t, { count: 18, color: '#ffcf9e', a: 0.25 });
} });

// s193a — insert: memory card pushed into a laptop slot; the GoPro frame shows the van, '27 AUG'.
registerShot('s193a', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.07 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: -160, y: -160 }, { mood: 'night' })); veil(g, '#0a0812', 0.45);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // laptop, screen up
    const lx = E.W / 2 - 420, ly = E.H * 0.2, lw = 840, lh = 520;
    rr(g, lx - 14, ly - 14, lw + 28, lh + 28, 16); g.fillStyle = shade(M.dark, -0.4); g.fill();
    g.save(); g.beginPath(); g.rect(lx, ly, lw, lh); g.clip();
    // GoPro frame on screen: van on a dirt road
    g.fillStyle = linGrad(g, 0, ly, 0, ly + lh, ['#3a2a4a', '#1c1626']); g.fillRect(lx, ly, lw, lh);
    FX.hills(g, { y: ly + lh * 0.62, amp: 30, color: '#241a20', seed: 51 });
    g.fillStyle = '#4a3c40'; g.fillRect(lx, ly + lh * 0.62, lw, lh * 0.38);
    poly(g, [[lx, ly + lh], [lx + lw * 0.42, ly + lh * 0.62], [lx + lw * 0.58, ly + lh * 0.62], [lx + lw, ly + lh]], '#6a5a44');
    van2D(g, lx + lw * 0.6, ly + lh * 0.86, 0.42, {});
    // timestamp + REC
    text(g, '27 AUG', lx + 30, ly + 54, { size: 34, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    circle(g, lx + lw - 90, ly + 44, 10, S().ui.accent);
    text(g, 'REC', lx + lw - 70, ly + 54, { size: 28, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left' });
    // footage grain
    const r = rng(23);
    for (let i = 0; i < 40; i++) circle(g, lx + r() * lw, ly + r() * lh, 1.5, alpha('#ffffff', 0.12));
    g.restore();
    // laptop base + slot
    rr(g, lx - 60, ly + lh + 14, lw + 120, 40, 12); g.fillStyle = shade(M.wall, -0.2); g.fill();
    g.fillStyle = shade(M.dark, -0.5); g.fillRect(lx + lw - 260, ly + lh + 26, 180, 12);
    // memory card sliding into the slot
    const ck = ease.inOut(prog(t, 0.3, info.dur - 0.3));
    const cx = lx + lw - 170 - 120 * (1 - ck);
    rr(g, cx, ly + lh + 8, 150, 46, 8); g.fillStyle = '#0c0c12'; g.fill();
    rr(g, cx + 12, ly + lh + 16, 60, 30, 4); g.fillStyle = S().ui.gold; g.fill();
    // tiny green LED blinking on the side
    const led = (t % 1) > 0.5;
    circle(g, lx + 30, ly + lh + 34, 8, led ? '#3fb950' : shade('#3fb950', -0.6));
    if (led) glow(g, lx + 30, ly + lh + 34, 30, '#3fb950', 0.6);
    glow(g, E.W / 2, E.H * 0.5, 420, M.practical, 0.1);
  });
  FX.dust(g, t, { count: 16, color: '#cfd8ff', a: 0.25 });
} });
