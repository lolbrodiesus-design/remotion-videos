// shots/06_suitcases_c.js — Story 6 (Alki Beach), part C: s166–s172a.
// The video goes viral, the detectives trace the couple to Burien.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, text, FONTS, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, rng, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { beach } from '../sets/beach.js';
import { TEEN } from '../cast.js';

// A plain ink figure (no signature colour): officers, Dudley, the couple.
const PLAIN = { top: 'tshirt', color: S().ink, head: 'none' };
const SUIT = { top: 'suit', color: S().ink, head: 'none' };

// s166 — UI: phone screen full of TikTok tiles; a red Upload button, progress bar filling beneath it.
registerShot('s166', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.05 * k, x: lerp(40, -40, k) };
  backdrop(g, M.sky);
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 300, py = 90, pw = 600, ph = 820;
    FX.screen(g, { x: px, y: py, w: pw, h: ph, bg: '#101a2c', glowC: S().ui.blueprint, a: 0.3 }, (g, x, y, w, h) => {
      // scrolling video tiles with play icons
      const r = [0, 1, 2, 3, 4, 5];
      for (const i of r) {
        const tx = x + 24 + (i % 2) * (w / 2 - 12), ty = y + 24 + Math.floor(i / 2) * 190 - (t * 30 % 60);
        rr(g, tx, ty, w / 2 - 36, 170, 10); g.fillStyle = i % 2 ? '#22344f' : '#1a2a44'; g.fill();
        poly(g, [[tx + 60, ty + 60], [tx + 60, ty + 110], [tx + 100, ty + 85]], alpha(S().ui.cream, 0.85));
        g.fillStyle = alpha(S().ui.cream, 0.7); g.fillRect(tx + 14, ty + 140, 70, 8);
      }
      // red Upload button
      const bw = 340, bh = 84, bx = x + (w - bw) / 2, by = y + h - 190;
      rr(g, bx, by, bw, bh, 16); g.fillStyle = S().ui.accent; g.fill();
      glow(g, bx + bw / 2, by + bh / 2, 180, S().ui.accent, 0.35);
      text(g, 'UPLOAD', bx + bw / 2, by + bh / 2 + 12, { size: 40, color: S().feature, font: FONTS.ui, weight: 900, spacing: 3 });
      // progress bar filling steadily
      const p = ease.inOut(prog(t, 0.3, info.dur - 0.3));
      rr(g, bx, by + bh + 26, bw, 16, 8); g.fillStyle = alpha(S().ui.cream, 0.2); g.fill();
      rr(g, bx, by + bh + 26, Math.max(16, bw * p), 16, 8); g.fillStyle = S().ui.accent; g.fill();
    });
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.2 });
} });

// s167 — blueprint: the line graph draws itself up to a peak; the 30M view counter counts up.
registerShot('s167', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.06 * k, x: -20 * k };
  UI.blueprint(g, { grid: 60, a: 0.09 });
  layer(g, cam, 1, (g) => {
    const x0 = E.W * 0.14, x1 = E.W * 0.86, y0 = E.H * 0.78, y1 = E.H * 0.3;
    const pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, Math.pow(u, 1.7))];
    // axes
    seg(g, [[x0, y0], [x1, y0]], 3, alpha(S().ui.blueprint, 0.5));
    seg(g, [[x0, y0], [x0, y1 - 60]], 3, alpha(S().ui.blueprint, 0.5));
    // line drawing itself upward
    const p = ease.inOut(prog(t, 0.2, info.dur - 0.3));
    g.strokeStyle = S().ui.blueprint; g.lineWidth = 7; g.lineCap = 'round'; g.lineJoin = 'round';
    g.beginPath();
    for (let i = 0; i <= 120; i++) { const [lx, ly] = pt((i / 120) * p); i ? g.lineTo(lx, ly) : g.moveTo(lx, ly); }
    g.stroke();
    for (const u of [0.25, 0.55, 0.85, 1]) {
      if (p < u) continue;
      const [nx, ny] = pt(u);
      glow(g, nx, ny, 50, S().ui.blueprint, 0.7); circle(g, nx, ny, 9, S().ui.blueprint);
    }
    const [hx, hy] = pt(p);
    glow(g, hx, hy, 80, S().ui.gold, 0.8);
    // 30M counter
    const v = Math.round(lerp(0, 30, p));
    text(g, v + 'M', E.W / 2, E.H * 0.2, { size: 120, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 30, glowColor: alpha(S().ui.gold, 0.6) });
    text(g, '30 MILLION VIEWS', E.W / 2, E.H * 0.2 + 64, { size: 34, color: alpha(S().ui.cream, 0.9), font: FONTS.ui, weight: 900, spacing: 4 });
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.2 });
} });

// s168a — wide: the house in Burien at night, one amber window lit; slow push toward that window.
registerShot('s168a', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.1 * k, x: lerp(0, 90, k) };
  layer(g, cam, 0.3, (g) => {
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 41, count: 50, area: [0, 0, E.W, E.H * 0.4], color: '#dfe8ff' });
    glow(g, E.W * 0.66, E.H * 0.3, 200, M.practical, 0.2);
  });
  layer(g, cam, 0.6, (g) => {
    const GY = E.H * 0.82;
    FX.facade(g, { x: E.W * 0.28, y: GY, w: 820, h: 460, color: shade(M.wall, -0.35), win: M.practical, dark: shade(M.dark, -0.1), cols: 4, rows: 2, lit: 0.12, seed: 12, door: true });
    // the one lit upstairs window, amber
    const wx = E.W * 0.28 + 820 * 0.55, wy = GY - 460 + 60;
    glow(g, wx + 60, wy + 50, 160, M.practical, 0.5 + 0.1 * Math.sin(t * 2));
    // streetlamp flicker
    const flick = 0.7 + 0.3 * (Math.sin(t * 9) > 0 ? 1 : 0.4);
    FX.lampPost(g, E.W * 0.12, GY, 300, { light: M.practical, a: 0.2 * flick });
    // quiet street
    g.fillStyle = shade(M.road, -0.2); g.fillRect(-E.W, GY, E.W * 3, E.H);
    FX.floorLines(g, GY, E.H, 'rgba(0,0,0,.3)', 0.12);
  });
  FX.fog(g, E.H * 0.7, 160, M.fog, 0.25);
  FX.dust(g, t, { count: 14, color: M.practical, a: 0.18 });
} });

// s168b — medium: brass room number "4" on the door; a figure silhouette passes inside, blocking the light.
registerShot('s168b', { draw(g, t, info) {
  const M = mood('interiorCool'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.03 + 0.05 * k, x: lerp(50, -50, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.3), shade(M.wall, -0.55)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = shade(M.floor, -0.1); g.fillRect(-E.W, E.H * 0.8, E.W * 3, E.H);
    // the door, warm light spilling around its edges
    const dx = E.W / 2 - 220, dy = E.H * 0.16, dw = 440, dh = E.H * 0.64;
    glow(g, dx + dw / 2, dy + dh / 2, 380, M.practical, 0.4);
    rr(g, dx, dy, dw, dh, 8); g.fillStyle = shade(M.wall, -0.15); g.fill();
    g.strokeStyle = alpha(M.practical, 0.7); g.lineWidth = 4; g.stroke();
    seg(g, [[dx + dw / 2, dy + 40], [dx + dw / 2, dy + dh - 40]], 3, shade(M.wall, -0.4));
    // brass room number "4"
    text(g, '4', dx + dw / 2, dy + 130, { size: 110, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 22, glowColor: alpha(S().ui.gold, 0.6) });
    circle(g, dx + dw - 50, dy + dh / 2, 14, S().ui.gold);
    // figure silhouette passing inside, momentarily blocking the light
    const pass = prog(t, 0.3, info.dur - 0.3);
    const fx = lerp(dx - 120, dx + dw + 120, pass);
    g.fillStyle = alpha(S().ink, 0.85);
    g.beginPath(); g.ellipse(fx, dy + dh / 2, 90, dh / 2 - 20, 0, 0, Math.PI * 2); g.fill();
    g.fillRect(fx - 90, dy + dh / 2 - 20, 180, dh / 2 + 20);
  });
  FX.dust(g, t, { count: 18, color: M.practical, a: 0.25 });
  FX.lightCone(g, E.W / 2, E.H * 0.16, { angle: Math.PI / 2, spread: 0.7, len: 700, color: M.practical, a: 0.08 });
} });

// s169 — wide: the same house from the street — fence, gate, lit window; Dudley stands in the dark hallway, turning his head toward the camera.
registerShot('s169', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.04 * k, x: lerp(-40, 50, k) };
  layer(g, cam, 0.3, (g) => {
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 43, count: 40, area: [0, 0, E.W, E.H * 0.4], color: '#dfe8ff' });
  });
  layer(g, cam, 0.6, (g) => {
    const GY = E.H * 0.84;
    FX.facade(g, { x: E.W * 0.24, y: GY, w: 900, h: 480, color: shade(M.wall, -0.35), win: M.practical, dark: shade(M.dark, -0.1), cols: 4, rows: 2, lit: 0.12, seed: 14, door: true });
    const wx = E.W * 0.24 + 900 * 0.55, wy = GY - 480 + 60;
    glow(g, wx + 60, wy + 50, 150, M.practical, 0.45);
    // fence + gate across the front
    g.fillStyle = shade(M.wall, -0.5);
    for (let i = 0; i < 26; i++) { const fx = E.W * 0.14 + i * 56; g.fillRect(fx, GY - 90, 14, 90); }
    g.fillRect(E.W * 0.14, GY - 96, 26 * 56, 12);
    g.fillStyle = shade(M.road, -0.2); g.fillRect(-E.W, GY, E.W * 3, E.H);
    // dark hallway visible through the open front door, Dudley inside
    const doorX = E.W * 0.24 + 450 - 26, doorY = GY - 90;
    g.fillStyle = '#05040a'; g.fillRect(doorX, doorY - 180, 52, 270);
    glow(g, doorX + 26, doorY - 90, 120, M.practical, 0.25);
    const turn = ease.inOut(prog(t, 0.5, info.dur - 0.4));
    const [lx, ly] = [lerp(0.8, 0, turn), lerp(-0.2, 0, turn)];
    drawFigure(g, { x: doorX + 26, y: GY, s: 1.15, facing: 1, outfit: SUIT, pose: breathe(POSES.stand, t), expr: 'neutral', look: [lx, ly], rim: { color: M.rim, dir: [0, -1], w: 4 } });
  });
  FX.fog(g, E.H * 0.72, 150, M.fog, 0.25);
  FX.lampPost(g, E.W * 0.1, E.H * 0.84, 280, { light: M.practical, a: 0.18 });
} });

// s170a — insert: the corner of a paper envelope; dust motes dance in a sliver of light hitting the "Rent Due" notice.
registerShot('s170a', { draw(g, t, info) {
  const M = mood('interiorCool'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.04 * k, y: lerp(-30, 30, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.35), shade(M.wall, -0.55)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = shade(M.floor, -0.05); g.fillRect(-E.W, E.H * 0.72, E.W * 3, E.H);
    FX.floorLines(g, E.H * 0.72, E.H, 'rgba(0,0,0,.3)', 0.1);
    FX.lightCone(g, E.W * 0.62, 0, { angle: Math.PI / 2, spread: 0.28, len: 800, color: M.key, a: 0.14 });
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.5;
    // the Rent Due notice
    g.save(); g.translate(cx, cy); g.rotate(-0.03);
    rr(g, -260, -180, 520, 360, 6); g.fillStyle = '#efe8d8'; g.fill();
    g.fillStyle = S().ink; g.fillRect(-220, -140, 300, 18); g.fillRect(-220, -100, 240, 10); g.fillRect(-220, -74, 260, 10);
    text(g, 'RENT DUE', -220, 30, { size: 54, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
    g.fillStyle = alpha(S().ink, 0.6); g.fillRect(-220, 70, 200, 10); g.fillRect(-220, 96, 150, 10);
    g.restore();
    // envelope corner overlapping it
    g.save(); g.translate(cx + 300, cy + 190); g.rotate(0.12);
    poly(g, [[-180, -90], [180, -90], [180, 90], [-180, 90]], '#d8cfae');
    seg(g, [[-180, -90], [0, 10], [180, -90]], 3, '#a89a72');
    g.restore();
    glow(g, cx, cy, 300, M.key, 0.16);
  });
  FX.dust(g, t, { count: 30, color: M.key, a: 0.35 });
} });

// s170b — medium: the knuckles of a clenched fist knocking hard on a wooden door frame; a slight screen shake on each knock.
// FIX (QC v5): the v4 fist was still a small dark blob (~92 px, ink knuckles
// invisible against the ink fist). Redrawn BIG and readable: a 156 px fist with
// four separate knuckle bumps on its striking face, each ringed in cream rim
// light with a pale highlight so the knuckles read against the dark door.
registerShot('s170b', { draw(g, t, info) {
  const M = mood('interiorCool');
  // knock pulses at 0.5s, 1.1s, 1.7s — shake spikes with each knock
  const knock = (t > 0.45 && t < 0.65) || (t > 1.05 && t < 1.25) || (t > 1.65 && t < 1.85);
  const sh = knock ? shake(t, 7, 30, 8) : [0, 0];
  const cam = { z: 1.04 + 0.03 * ease.inOut(t / info.dur), x: sh[0], y: lerp(-20, 20, ease.inOut(t / info.dur)) + sh[1] };
  layer(g, cam, 0.5, (g) => {
    // bare hallway wall + floor
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.3), shade(M.wall, -0.55)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = shade(M.floor, -0.1); g.fillRect(-E.W, E.H * 0.8, E.W * 3, E.H);
    FX.floorLines(g, E.H * 0.8, E.H, 'rgba(0,0,0,.3)', 0.1);
    // cold light spilling from the room beyond, left
    FX.lightCone(g, E.W * 0.1, 0, { angle: Math.PI / 2 + 0.3, spread: 0.4, len: 900, color: M.key, a: 0.1 });
    // wooden door + frame, centre
    const dx = E.W / 2 - 300, dy = E.H * 0.08, dw = 600, dh = E.H * 0.78;
    rr(g, dx - 26, dy - 26, dw + 52, dh + 52, 8); g.fillStyle = shade(M.wall, -0.45); g.fill();   // frame
    rr(g, dx, dy, dw, dh, 6); g.fillStyle = shade(M.wall, -0.1); g.fill();                        // door
    g.strokeStyle = shade(M.wall, -0.35); g.lineWidth = 3;                                          // door planks
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(dx + i * dw / 4, dy + 20); g.lineTo(dx + i * dw / 4, dy + dh - 20); g.stroke(); }
    circle(g, dx + dw - 56, dy + dh * 0.55, 16, S().ui.gold);                                       // brass knob
    glow(g, dx + dw - 56, dy + dh * 0.55, 60, S().ui.gold, 0.25);
  });
  layer(g, cam, 1, (g) => {
    const dx = E.W / 2 - 300, dy = E.H * 0.08, dw = 600;
    // the Rent Due notice pinned on the door
    g.save(); g.translate(dx + 150, dy + 150); g.rotate(-0.02);
    rr(g, -130, -95, 260, 190, 4); g.fillStyle = S().ui.cream; g.fill();
    g.fillStyle = S().ink; g.fillRect(-108, -72, 180, 10); g.fillRect(-108, -48, 140, 8);
    text(g, 'RENT DUE', 0, 30, { size: 34, color: S().ui.accent, font: FONTS.ui, weight: 900, spacing: 2 });
    g.fillStyle = alpha(S().ink, 0.6); g.fillRect(-108, 52, 150, 8); g.fillRect(-108, 70, 110, 8);
    g.restore();
    // clenched fist knocking on the door frame's right jamb, arm from the right edge
    // BIG and readable: 156 px fist body, four knuckle bumps on the striking face
    const fx = dx + dw - 8, fy = E.H * 0.48;
    const lunge = knock ? 16 : 0;
    seg(g, [[E.W + 30, fy + 170], [fx + 78 - lunge, fy + 14]], 30, SUIT.color);   // slim forearm, ink sleeve
    g.save(); g.translate(fx - lunge, fy);
    rr(g, -78, -56, 156, 112, 26); g.fillStyle = S().ink; g.fill();             // fist body, 156 px across
    // four distinct knuckles along the striking (left) face — each a separate
    // circle ringed in cream rim light with a pale highlight, so they read
    for (let i = 0; i < 4; i++) {
      const kx = -78, ky = -39 + i * 26;
      circle(g, kx, ky, 18, S().ink);
      ring(g, kx, ky, 18, 4, alpha(S().ui.cream, 0.85));
      circle(g, kx - 5, ky - 6, 6, alpha(S().ui.cream, 0.5));
    }
    circle(g, 40, 56, 19, S().ink);                                             // thumb bump on the side
    ring(g, 40, 56, 19, 4, alpha(S().ui.cream, 0.6));
    seg(g, [[-70, -56], [70, -56]], 4, alpha(M.rim, 0.8));                      // cold rim light along the top
    seg(g, [[-78, -46], [-78, 46]], 4, alpha(M.rim, 0.7));                      // cold rim light on the striking face
    g.restore();
    glow(g, fx - 78 - lunge, fy, 90, M.key, 0.15);
    if (knock) FX.rings(g, fx - 78 - lunge, fy, t, { count: 2, r0: 24, r1: 150, speed: 2.2, color: '#ffffff', a: 0.4 });
  });
  FX.dust(g, t, { count: 18, color: M.key, a: 0.25 });
} });

// s171a — insert: a bullet hole in a pale-blue plaster wall; a flashlight beam centres on the small dark circle.
registerShot('s171a', { draw(g, t, info) {
  const M = mood('interiorCool'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.05 * k, r: 0.012 * Math.sin(t * 1.2), x: 20 * k };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, 0.35); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);   // pale-blue plaster
    g.strokeStyle = 'rgba(0,0,0,.12)'; g.lineWidth = 2;
    for (let y = 120; y < E.H; y += 180) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    // wood panels at the bottom
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, E.H * 0.82, E.W * 3, E.H);
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.46;
    // the bullet hole: dark circle, plaster cracked around it
    circle(g, cx, cy, 34, '#0a0810');
    ring(g, cx, cy, 34, 4, shade(M.wall, -0.2));
    const r = rng(5);
    for (let i = 0; i < 8; i++) { const a = r() * Math.PI * 2, d = 40 + r() * 46; seg(g, [[cx + Math.cos(a) * 34, cy + Math.sin(a) * 34], [cx + Math.cos(a) * d, cy + Math.sin(a) * d]], 2, alpha(S().ink, 0.5)); }
    // flashlight beam sweeping in to centre on the hole
    const sweep = ease.out(prog(t, 0, 1.2));
    const bx = lerp(E.W * 0.85, cx + 320, sweep), by = lerp(E.H * 0.08, cy - 260, sweep);
    FX.lightCone(g, bx, by, { angle: Math.atan2(cy - by, cx - bx), spread: 0.3, len: 800, color: M.key, a: 0.18 });
    glow(g, cx, cy, 200, M.key, 0.3);
    // police marker beside the hole
    rr(g, cx + 150, cy + 90, 60, 80, 6); g.fillStyle = '#e8c832'; g.fill();
    text(g, '1', cx + 180, cy + 148, { size: 44, color: S().ink, font: FONTS.ui, weight: 900 });
  });
  FX.dust(g, t, { count: 16, color: M.key, a: 0.22 });
} });

// s171b — insert: dark-blue carpet fibres; the camera pans slowly across a deep purple-black stain on the floor.
registerShot('s171b', { draw(g, t, info) {
  const M = mood('interiorCool'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08 + 0.03 * k, x: lerp(90, -90, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#1d2440'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);   // dark-blue carpet
    // fibres: short seeded strokes
    const r = rng(7);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 2;
    for (let i = 0; i < 260; i++) { const fx = r() * E.W * 2 - E.W / 2, fy = r() * E.H; seg(g, [[fx, fy], [fx + 8 + r() * 10, fy + 2]], 2, alpha(S().ui.blueprint, 0.12)); }
    // deep purple-black stain
    g.fillStyle = 'rgba(20,10,30,.85)';
    g.beginPath(); g.ellipse(E.W * 0.58, E.H * 0.55, 340, 150, -0.1, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(40,16,52,.6)';
    g.beginPath(); g.ellipse(E.W * 0.58, E.H * 0.55, 220, 95, -0.1, 0, Math.PI * 2); g.fill();
    glow(g, E.W * 0.58, E.H * 0.55, 300, M.practical, 0.06);
  });
  FX.dust(g, t, { count: 12, color: M.key, a: 0.18 });
  FX.fog(g, E.H * 0.6, 200, M.fog, 0.15);
} });

// s172a — UI: cell-tower map; concentric circles emanate from the tower, covering the Alki Beach area.
registerShot('s172a', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.07 * k, x: -20 * k };
  backdrop(g, M.sky);
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 520, py = 120, pw = 1040, ph = 740;
    FX.screen(g, { x: px, y: py, w: pw, h: ph, bg: '#0e1a30', glowC: S().ui.blueprint, a: 0.3 }, (g, x, y, w, h) => {
      g.strokeStyle = alpha(S().ui.blueprint, 0.16); g.lineWidth = 1;
      for (let gx = x; gx <= x + w; gx += 60) { g.beginPath(); g.moveTo(gx, y); g.lineTo(gx, y + h); g.stroke(); }
      for (let gy = y; gy <= y + h; gy += 60) { g.beginPath(); g.moveTo(x, gy); g.lineTo(x + w, gy); g.stroke(); }
      // coastline + roads
      g.strokeStyle = alpha(S().ui.blueprint, 0.5); g.lineWidth = 3;
      g.beginPath(); g.moveTo(x, y + h * 0.7); g.bezierCurveTo(x + w * 0.3, y + h * 0.5, x + w * 0.6, y + h * 0.75, x + w, y + h * 0.45); g.stroke();
      g.beginPath(); g.moveTo(x + w * 0.2, y + h); g.lineTo(x + w * 0.45, y); g.stroke();
      // cell tower
      const tx = x + w * 0.42, ty = y + h * 0.34;
      seg(g, [[tx - 26, ty + 60], [tx, ty - 70], [tx + 26, ty + 60]], 5, S().ui.blueprint);
      seg(g, [[tx - 40, ty - 40], [tx + 40, ty - 40]], 4, S().ui.blueprint);
      circle(g, tx, ty - 70, 8, S().ui.blueprint);
      glow(g, tx, ty - 20, 90, S().ui.blueprint, 0.5);
      // concentric signal circles emanating, covering the beach area
      FX.rings(g, tx, ty - 20, t, { count: 4, r0: 40, r1: 420, speed: 0.8, color: S().ui.blueprint, a: 0.5 });
      // Alki Beach pin
      const bx = x + w * 0.62, by = y + h * 0.62;
      poly(g, [[bx - 12, by - 22], [bx + 12, by - 22], [bx, by + 6]], S().ui.accent);
      circle(g, bx, by - 22, 13, S().ui.accent);
      text(g, 'ALKI BEACH', bx + 24, by - 8, { size: 28, color: alpha(S().ui.cream, 0.9), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
      text(g, 'PHONE RECORDS', x + 30, y + 52, { size: 28, color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
    });
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.2 });
} });
