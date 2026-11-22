// shots/05_shawne_c.js — Story 5 (Shawne Bolton): s136b–s142.
// The TikTok video goes viral (3M views); the investigator finds her mother; the truth about the sale.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, rng, S, text, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { office } from '../sets/office.js';
import { SHAWNE } from '../cast.js';

const sheriffOutfit = (M) => ({ top: 'suit', color: shade(M.wall, 0.1) });

// s136b — "… video called How I learned I had been kidnapped." UI: title text typed on the phone screen, comments arriving below.
registerShot('s136b', { draw(g, t, info) {
  const cam = { z: 1.12 - 0.08 * ease.inOut(t / info.dur), x: 20 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, { report: true })); veil(g, '#0e0a14', 0.45);
  const cx = E.W / 2, cy = E.H * 0.48;
  FX.screen(g, { x: cx - V(320, 250), y: cy - V(300, 400), w: V(640, 500), h: V(600, 800), glowC: M.practical });
  // recording in progress: red dot pulsing + REC label, top-left of the screen
  const rec = 0.5 + 0.5 * Math.sin(t * 6);
  circle(g, cx - V(260, 200), cy - V(240, 330), 14, alpha(S().ui.accent, 0.4 + 0.6 * rec));
  text(g, 'REC', cx - V(200, 150), cy - V(228, 318), { size: V(28, 32), color: S().ui.cream, align: 'left' });
  // title typed line by line, large and legible, from the start of the shot — it is the whole point
  const lines = [
    ['HOW I LEARNED', cy - V(110, 150), V(56, 62), S().ui.cream, 0.15, 0.55],
    ['I HAD BEEN', cy - V(30, 60), V(56, 62), S().ui.cream, 0.55, 0.95],
    ['KIDNAPPED', cy + V(60, 70), V(64, 70), S().ui.gold, 0.95, 1.35],
  ];
  lines.forEach(([txt, y, size, color, a0, a1], i) => {
    const p = ease.out(prog(t, a0, a1));
    if (p <= 0) return;
    text(g, txt, cx, y, { size, color, glow: i === 2 ? 20 : 0, glowColor: alpha(S().ui.gold, 0.6), alpha: p });
  });
  // blinking typing caret under the line currently being typed
  const active = lines.findIndex(([, , , , a0, a1]) => t >= a0 && t < a1);
  if (active >= 0 && Math.sin(t * 8) > 0) {
    const [, y] = lines[active];
    rr(g, cx - 16, y + V(34, 38), 32, 6, 3); g.fillStyle = S().ui.cream; g.fill();
  }
  // comments arriving below the title, sliding up one by one
  const r = rng(11);
  for (let i = 0; i < 3; i++) {
    const p = ease.out(prog(t, 1.3 + i * 0.3, 1.8 + i * 0.3));
    if (p <= 0) continue;
    const by = cy + V(280, 360) - p * V(70, 90);
    UI.bubble(g, cx - V(200, 160) + r() * V(400, 320), by, { w: 120, h: 46, color: alpha('#f4efe6', 0.85 * p) });
  }
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
  FX.godRays(g, E.W * 0.5, E.H * 0.1, { color: M.practical, a: 0.08 });
} });

// s137 — "It was watched more than 3 million times." Blueprint: family-tree node network + 3M counter.
registerShot('s137', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / info.dur), x: lerp(40, -40, ease.inOut(t / info.dur)) };
  UI.blueprint(g, { grid: 60, a: 0.09 });
  const cx = E.W / 2, cy = E.H * 0.42;
  const nodes = [
    [cx - 420, cy - 190, 'GRANDMOTHER'], [cx, cy - 190, 'MOTHER'], [cx + 420, cy - 190, 'SHAWNE'],
    [cx - 210, cy + 60, '1980'], [cx + 210, cy + 60, 'TIKTOK'],
  ];
  const edges = [[0, 1], [1, 2], [0, 3], [2, 4], [1, 4]];
  const bp = S().ui.blueprint;
  // edges drawing themselves
  edges.forEach(([a, b], i) => {
    const p = ease.out(prog(t, 0.2 + i * 0.2, 0.9 + i * 0.2));
    seg(g, [[nodes[a][0], nodes[a][1]], [lerp(nodes[a][0], nodes[b][0], p), lerp(nodes[a][1], nodes[b][1], p)]], 3, alpha(bp, 0.9));
  });
  // light pulses travelling along the network
  edges.forEach(([a, b], i) => {
    const ph = (t * 0.5 + i * 0.2) % 1;
    const px = lerp(nodes[a][0], nodes[b][0], ph), py = lerp(nodes[a][1], nodes[b][1], ph);
    glow(g, px, py, 46, '#e8f0ff', 0.8); circle(g, px, py, 7, '#e8f0ff');
  });
  nodes.forEach(([x, y, lab], i) => {
    const p = ease.outBack(prog(t, 0.1 + i * 0.15, 0.5 + i * 0.15));
    if (p <= 0) return;
    circle(g, x, y, 26 * p, S().ui.bpBg); ring(g, x, y, 26 * p, 4, bp);
    circle(g, x, y, 9 * p, i === 2 ? S().ui.gold : bp);
    text(g, lab, x, y + 58, { size: V(26, 30), color: S().ui.cream, alpha: p });
  });
  // 3M view counter, counting up
  const views = Math.floor(lerp(0, 3, ease.inOut(prog(t, 0.3, 2.0))) * 10) / 10;
  text(g, views.toFixed(1) + 'M', E.W / 2, E.H * 0.82, { size: V(110, 120), color: S().ui.gold, glow: 26, glowColor: alpha(S().ui.gold, 0.6) });
  text(g, 'VIEWS', E.W / 2, E.H * 0.82 + V(80, 90), { size: V(34, 40), color: S().ui.cream });
  FX.dust(g, t, { count: 18, color: '#8fb8e8', a: 0.35 });
} });

// s138 — "In her follow-up videos, she told the rest of the story." Medium behind a circular pop filter.
registerShot('s138', { draw(g, t, info) {
  const cam = { z: 1.03 + 0.05 * ease.inOut(t / info.dur), x: lerp(-30, 40, ease.inOut(t / info.dur)) };
  const { GY, M } = office(g, t, cam, { board: true });
  layer(g, cam, 1, (g) => {
    // Shawne's head as a blurred silhouette moving behind the mesh
    blurLayer(g, 6, (g) => {
      drawFigure(g, { x: E.W / 2 + 30 * Math.sin(t * 0.9), y: GY, s: V(1.6, 1.7), facing: 1, outfit: SHAWNE,
        pose: breathe(posesAt(t, [[0, 'sit'], [0.5, 'talk']]), t), expr: 'neutral',
        rim: { color: M.rim, dir: [1, -0.3] } });
    });
    // mic + circular pop filter in the foreground
    const fx = E.W / 2 - V(60, 40), fy = GY - V(330, 460);
    seg(g, [[fx, fy + 130], [fx, GY]], 12, S().ink);
    circle(g, fx, fy, 26, S().ink);
    const R = V(190, 210);
    circle(g, fx, fy - 40, R, alpha('#0e0b12', 0.55));
    ring(g, fx, fy - 40, R, 8, shade(M.wall, 0.3));
    g.strokeStyle = alpha(S().ui.cream, 0.25); g.lineWidth = 2;
    for (let i = -3; i <= 3; i++) {
      g.beginPath(); g.moveTo(fx - R + 10, fy - 40 + i * 44); g.lineTo(fx + R - 10, fy - 40 + i * 44); g.stroke();
      g.beginPath(); g.moveTo(fx + i * 44, fy - 40 - R + 10); g.lineTo(fx + i * 44, fy - 40 + R - 10); g.stroke();
    }
    glow(g, fx, fy - 40, 140, M.practical, 0.15);
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.8, '#ffd28a', 0.12);
} });

// s139a — "She found her biological mother, with …" Insert: two overlapping paper maps, red pushpin.
registerShot('s139a', { draw(g, t, info) {
  const cam = { z: 1.04 + 0.06 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, { board: true })); veil(g, '#0e0a14', 0.38);
  const cx = E.W / 2, cy = E.H * 0.52;
  // two overlapping paper maps
  g.save(); g.translate(cx - 60, cy - 20); g.rotate(-0.1);
  rr(g, -V(360, 300), -V(230, 300), V(720, 600), V(460, 600), 8); g.fillStyle = '#d8cfae'; g.fill();
  seg(g, [[-300, -100], [300, 60]], 6, S().ui.blueprint); seg(g, [[-200, 180], [100, -200]], 5, S().ui.accent);
  g.restore();
  g.save(); g.translate(cx + 80, cy + 30); g.rotate(0.12);
  rr(g, -V(360, 300), -V(230, 300), V(720, 600), V(460, 600), 8); g.fillStyle = '#e8e2d4'; g.fill();
  seg(g, [[-320, 80], [320, -60]], 6, S().ui.blueprint); seg(g, [[-100, -190], [200, 190]], 5, '#5a8a4a');
  g.restore();
  // red pushpin pressed firmly into an intersection
  const pinY = lerp(cy - 260, cy - 40, ease.inOut(prog(t, 0.7, 1.4)));
  seg(g, [[cx + 60, pinY - 70], [cx + 60, pinY]], 8, S().ink);
  circle(g, cx + 60, pinY - 80, 26, '#c94a3a'); glow(g, cx + 60, pinY - 80, 80, '#c94a3a', 0.5);
  if (t > 1.4) FX.rings(g, cx + 60, pinY, t - 1.4, { count: 2, r0: 20, r1: 130, color: '#c94a3a', a: 0.45 });
  glow(g, cx, cy, 220, M.practical, 0.18);
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s139b — "… the help of a private investigator." Wide: single lit window in a dark apartment block.
registerShot('s139b', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(-30, 30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  FX.stars(g, t, { seed: 16, count: 70 });
  layer(g, cam, 0.5, (g) => {
    FX.facade(g, { x: E.W * 0.14, y: E.H * 0.9, w: E.W * 0.72, h: E.H * 0.78, color: '#1a1424', win: '#ffcf8a', dark: '#0f0c18', cols: 5, rows: 4, lit: 0.12, seed: 21 });
    // the ONE lit window: a silhouette moves across its amber blinds
    const wx = E.W * 0.14 + (E.W * 0.72) * 0.5, wy = E.H * 0.9 - (E.H * 0.78) * 0.62, ww = 150, wh = 110;
    g.fillStyle = '#ffcf8a'; g.fillRect(wx, wy, ww, wh);
    glow(g, wx + ww / 2, wy + wh / 2, 180, '#ffcf8a', 0.5);
    const sx = lerp(wx + 20, wx + ww - 20, ease.inOut(t / info.dur));
    g.fillStyle = S().ink; g.fillRect(sx - 14, wy + 8, 28, wh - 16);
    g.fillStyle = alpha(S().ink, 0.6);
    for (let i = 0; i < 3; i++) g.fillRect(wx, wy + 24 + i * 30, ww, 8);
  });
  FX.fog(g, E.H * 0.78, 130, M.fog, 0.3);
  FX.rain(g, t, { count: 40, color: '#9fb4ff', a: 0.2 });
} });

// s140a — "Her mother had sold her, as a baby, to the …" Insert: white envelope sliding across a dark table.
registerShot('s140a', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / info.dur), x: 50 * Math.sin(t * 0.5) };
  const { GY, M } = office(g, t, cam, {});
  layer(g, cam, 1, (g) => {
    // dark table top
    const ty = GY - V(140, 190);
    rr(g, E.W / 2 - V(700, 560), ty, V(1400, 1120), 40, 10); g.fillStyle = '#241610'; g.fill();
    // envelope sliding from one set of hands to the other
    const ex = lerp(E.W / 2 - V(420, 340), E.W / 2 + V(180, 140), ease.inOut(t / info.dur));
    // left hand releasing, right hand receiving (ink capsules)
    seg(g, [[E.W / 2 - V(620, 500), ty + 130], [E.W / 2 - V(430, 350), ty + 40]], 44, S().ink);
    seg(g, [[E.W / 2 + V(620, 500), ty + 130], [E.W / 2 + V(430, 350), ty + 40]], 44, S().ink);
    rr(g, ex - 150, ty - 70, 300, 170, 6); g.fillStyle = '#efe8d8'; g.fill();
    seg(g, [[ex - 150, ty - 70], [ex, ty + 10], [ex + 150, ty - 70]], 3, '#a89a72');
    glow(g, ex, ty, 180, M.practical, 0.25);
    if (t > info.dur - 0.6) FX.rings(g, ex, ty, t - (info.dur - 0.6), { count: 2, r0: 40, r1: 200, color: '#efe8d8', a: 0.3 });
  });
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.3 });
  FX.lightCone(g, E.W / 2 + V(380, 300), GY - V(300, 420), { angle: Math.PI / 2, spread: 0.7, len: 380, color: '#ffd28a', a: 0.1 });
} });

// s140b — "… people who raised her, a couple named Steven and Angie." Insert: framed family photo, glass cracking.
registerShot('s140b', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.04 * ease.inOut(t / info.dur), x: lerp(-30, 30, ease.inOut(t / info.dur)) };
  const M = mood('night');
  blurLayer(g, 10, (g) => office(g, t, cam, {})); veil(g, '#0e0a14', 0.4);
  const cx = E.W / 2, cy = E.H * 0.5, fw = V(620, 500), fh = V(460, 600);
  rr(g, cx - fw / 2 - 18, cy - fh / 2 - 18, fw + 36, fh + 36, 8); g.fillStyle = '#3a241c'; g.fill();
  rr(g, cx - fw / 2, cy - fh / 2, fw, fh, 6); g.fillStyle = '#5a6a8a'; g.fill();
  // three small figures in the photo: two parents, child between them
  const py = cy + fh / 2 - 40;
  for (const [dx, s, col] of [[-150, 1.1, '#2a2238'], [150, 1.1, '#2a2238'], [0, 0.8, '#8a5ad6']]) {
    circle(g, cx + dx, py - 150 * s, 34 * s, S().ink);
    seg(g, [[cx + dx, py - 116 * s], [cx + dx, py - 30 * s]], 26 * s, col);
  }
  // a crack slowly spiderwebs across the parents' faces
  const crack = ease.inOut(prog(t, 0.6, 2.4));
  g.strokeStyle = alpha('#e8f0ff', 0.85); g.lineWidth = 3;
  const cx0 = cx - 150, cy0 = cy - 60;
  const branches = [[[cx0, cy0], [cx0 - 90, cy0 - 80]], [[cx0, cy0], [cx0 + 70, cy0 - 100]], [[cx0, cy0], [cx0 - 40, cy0 + 90]], [[cx0, cy0], [cx0 + 110, cy0 + 60]], [[cx0, cy0], [cx + 150, cy0 - 40]]];
  branches.forEach(([a, b], i) => {
    if (crack * branches.length <= i) return;
    seg(g, [[a[0], a[1]], [lerp(a[0], b[0], clamp(crack * branches.length - i)), lerp(a[1], b[1], clamp(crack * branches.length - i))]], 3, alpha('#e8f0ff', 0.85));
  });
  glow(g, cx, cy, 220, M.practical, 0.18);
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.3 });
} });

// s141a — "Her grandmother had not known what her daughter had …" Wide: empty wooden rocking chair in a cold blue room.
registerShot('s141a', { draw(g, t, info) {
  const cam = { z: 1.02 + 0.06 * ease.inOut(t / info.dur), x: -24 * ease.inOut(t / info.dur) };
  const M = mood('interiorCool');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.3), shade(M.wall, -0.6)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const GY = E.H * V(0.8, 0.68), cx = E.W / 2;
  FX.moon(g, E.W * 0.8, E.H * 0.2, 34, '#e8ecff');
  layer(g, cam, 0.6, (g) => {
    // window, cold blue light
    rr(g, E.W * 0.68, GY - V(560, 800), V(300, 240), V(340, 460), 6); g.fillStyle = '#141a33'; g.fill();
    g.fillStyle = linGrad(g, 0, GY - 560, 0, GY - 200, ['#0a1024', '#1c2a52']); g.fillRect(E.W * 0.68 + 10, GY - V(550, 790), V(280, 220), V(320, 440));
    FX.godRays(g, E.W * 0.72, GY - V(400, 600), { color: '#9fb4ff', a: 0.1 });
    // rocking chair, rocking slowly
    const rock = 0.07 * Math.sin(t * 1.6);
    g.save(); g.translate(cx - 120, GY); g.rotate(rock);
    seg(g, [[0, 0], [-30, -260]], 12, '#3a241c'); seg(g, [[0, 0], [120, -40]], 12, '#3a241c');
    seg(g, [[-30, -260], [-60, -420]], 12, '#3a241c'); seg(g, [[-60, -420], [60, -420]], 10, '#3a241c');
    seg(g, [[60, -420], [120, -40]], 12, '#3a241c');
    rr(g, -40, -300, 200, 30, 8); g.fillStyle = '#4a2c1e'; g.fill();
    g.beginPath(); g.arc(40, 10, 150, Math.PI * 1.15, Math.PI * 1.85); g.strokeStyle = '#3a241c'; g.lineWidth = 10; g.stroke();
    g.restore();
    glow(g, cx - 120, GY - 200, 200, M.key, 0.12);
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
  });
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
  FX.fog(g, GY - 80, 120, M.fog, 0.25);
} });

// s141b — "… done, so she had filed the missing person report." Medium: heavy black telephone handset, coiled cord.
registerShot('s141b', { draw(g, t, info) {
  const cam = { z: 1.1 - 0.07 * ease.inOut(t / info.dur), x: 24 * ease.inOut(t / info.dur) };
  const M = mood('night');
  blurLayer(g, 12, (g) => office(g, t, cam, { phoneRing: true })); veil(g, '#0e0a14', 0.42);
  const cx = E.W / 2 - V(120, 100), cy = E.H * 0.52;
  // doorway behind, right of the handset: Shawne's silhouette at the lamp
  const dx = E.W * 0.72, dw = V(300, 240), dy0 = E.H * 0.1, dy1 = E.H * 0.56;
  rr(g, dx, dy0, dw, dy1 - dy0, 8); g.fillStyle = shade(M.dark, -0.2); g.fill();
  glow(g, dx + dw / 2, dy0 + 60, 150, M.practical, 0.5);
  FX.lightCone(g, dx + dw / 2, dy0 + 40, { angle: Math.PI / 2, spread: 0.7, len: 300, color: M.practical, a: 0.12 });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: dx + dw / 2, y: dy1, s: 0.85, facing: -1, outfit: SHAWNE,
      pose: breathe(POSES.stand, t), expr: 'neutral', rim: { color: M.rim, dir: [-1, -0.3] } });
  });
  // the handset, lying diagonally on the desk: earpiece + mouthpiece + curved handle
  const e1 = [cx - 200, cy - 110], e2 = [cx + 200, cy + 110], mid = [cx + 10, cy - 100];
  glow(g, cx, cy + 170, 240, M.practical, 0.2);
  // handle: two thick segments meeting at a raised curve, so it reads as a handset, not a bar
  seg(g, [[e1[0], e1[1]], [mid[0], mid[1]]], 44, S().ink);
  seg(g, [[mid[0], mid[1]], [e2[0], e2[1]]], 44, S().ink);
  // rim along the lit top edge of the handle
  seg(g, [[e1[0], e1[1] - 22], [mid[0], mid[1] - 22]], 4, M.rim);
  seg(g, [[mid[0], mid[1] - 22], [e2[0], e2[1] - 22]], 4, M.rim);
  // earpiece cup (top-left) and mouthpiece cup (bottom-right): round cups with speaker grilles
  for (const [ex, ey] of [e1, e2]) {
    circle(g, ex, ey, 78, S().ink);
    ring(g, ex, ey, 78, 5, shade(M.wall, 0.25));
    circle(g, ex, ey, 54, shade(M.wall, 0.15));
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      circle(g, ex + Math.cos(a) * 26, ey + Math.sin(a) * 26, 6, alpha(S().ui.cream, 0.5));
    }
    circle(g, ex, ey, 6, alpha(S().ui.cream, 0.5));
  }
  // coiled cord from the mouthpiece, stretching and retracting along the desk
  const stretch = 1 + 0.25 * Math.sin(t * 2.2);
  g.strokeStyle = S().ink; g.lineWidth = 6;
  g.beginPath();
  for (let i = 0; i <= 24; i++) {
    const x = e2[0] - 20 + i * 24 * stretch, y = cy + 210 + Math.sin(i * 1.4) * 22;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
  FX.godRays(g, dx + dw / 2, dy0 + 40, { color: M.practical, a: 0.08 });
} });

// s142 — "Shawne later said the home she grew up in was abusive." Insert: spilled glass of water on floorboards.
registerShot('s142', { draw(g, t, info) {
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / info.dur), x: lerp(40, -30, ease.inOut(t / info.dur)) };
  const M = mood('interiorCool');
  blurLayer(g, 10, (g) => office(g, t, cam, {})); veil(g, '#121426', 0.4);
  const GY = E.H * 0.78, cx = E.W / 2;
  // floorboards
  g.fillStyle = linGrad(g, 0, GY - 160, 0, E.H, [shade(M.floor, 0.1), shade(M.dark, -0.1)]); g.fillRect(-E.W, GY - 160, E.W * 3, E.H);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
  for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-E.W, GY - 120 + i * 46); g.lineTo(E.W * 2, GY - 120 + i * 46); g.stroke(); }
  // overturned glass + spreading water pool
  const spill = ease.out(prog(t, 0.4, 1.6));
  g.save(); g.translate(cx - 120, GY - 60); g.rotate(1.35);
  rr(g, -30, -90, 60, 180, 10); g.fillStyle = alpha('#cfe0ff', 0.55); g.fill();
  g.restore();
  g.fillStyle = alpha('#9fb4ff', 0.28 * spill);
  g.beginPath(); g.ellipse(cx + 60, GY + 30, 300 * spill + 40, 60 * spill + 12, 0, 0, Math.PI * 2); g.fill();
  glow(g, cx + 60, GY + 30, 200, '#9fb4ff', 0.15);
  // glass shards quivering as a heavy footstep vibrates the floor
  const quiver = t > 1.6 ? Math.sin((t - 1.6) * 26) * 6 * Math.exp(-(t - 1.6) * 2) : 0;
  const r = rng(17);
  for (let i = 0; i < 6; i++) {
    const sx = cx - 260 + r() * 560, sy = GY - 10 + r() * 90;
    poly(g, [[sx + quiver, sy], [sx + 26 + quiver, sy + 12], [sx + 6 + quiver, sy + 26]], alpha('#dfe8ff', 0.75));
  }
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
  FX.fog(g, GY - 140, 120, M.fog, 0.2);
} });
