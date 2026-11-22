// shots/04_iowa_b.js — Story 4 (Iowa): s099–s106. The door opens, the narrow room,
// the 20M blueprint beat, and the terrifying comments.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { basement } from '../sets/basement.js';
import { MERIDITH } from '../cast.js';

const HUSBAND = { top: 'tshirt', color: '#5a5a6a', head: 'cap', headColor: '#3a6ea5' }; // grey tee, blue cap

// s099 — "Her husband pushed the door open."
// Insert: the pitted iron handle rotates down with a snap; light spills, dust explodes.
registerShot('s099', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.15 + 0.05 * k, x: 60 - 90 * k };
  const { GY, CX, M } = basement(g, t, cam, { doorOpen: true });
  const dx = CX + V(380, 300), dy = GY - V(540, 780), dw = V(280, 220), dh = V(540, 780);
  const snap = ease.out(prog(t, 0.2, 0.9));
  layer(g, cam, 1, (g) => {
    // the handle, rotating downward with a sharp mechanical snap
    const hx = dx + dw - 34, hy = dy + dh / 2;
    g.save(); g.translate(hx, hy); g.rotate(snap * 1.1);
    circle(g, 0, 0, 16, S().ui.gold); seg(g, [[0, 0], [0, 44]], 8, S().ui.gold); g.restore();
    glow(g, dx + dw / 2, dy + dh / 2, 300, M.practical, 0.35 + 0.2 * snap);
    FX.lightCone(g, dx + dw / 2, dy + dh / 2, { angle: Math.PI, spread: 0.9, len: 700, color: M.practical, a: 0.12 + 0.1 * snap });
    if (t > 0.9) FX.rings(g, hx, hy, t - 0.9, { count: 2, r0: 30, r1: 220, color: M.practical, a: 0.5 * (1 - prog(t, 0.9, 1.8)) });
  });
  FX.dust(g, t, { count: 80, color: '#ffe0b0', a: 0.5 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
} });

// s100 — "Behind it, there was a small, narrow room."
// Medium: the couple peer into the opening; their shadows stretch in.
registerShot('s100', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.05 + 0.04 * k, x: -50 + 70 * k };
  const { GY, CX, M } = basement(g, t, cam, { doorOpen: true });
  const doorX = CX + V(520, 420);
  layer(g, cam, 1, (g) => {
    // long shadows stretching away from the doorway light
    g.fillStyle = alpha(S().ink, 0.35);
    g.beginPath(); g.moveTo(CX - V(200, 160), GY); g.lineTo(CX - V(760, 560), GY + 90); g.lineTo(CX - V(700, 520), GY + 130); g.lineTo(CX - V(160, 120), GY + 20); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(CX + V(60, 40), GY); g.lineTo(CX - V(500, 380), GY + 70); g.lineTo(CX - V(460, 340), GY + 110); g.lineTo(CX + V(100, 80), GY + 20); g.closePath(); g.fill();
    drawFigure(g, { x: CX - V(120, 90), y: GY, s: 1.5, facing: 1, outfit: MERIDITH, pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'reach']]), t), expr: 'scared', rim: { color: M.rim, dir: [1, -0.3] } });
    drawFigure(g, { x: CX + V(140, 110), y: GY, s: 1.55, facing: 1, outfit: HUSBAND, pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'crouch']]), t, 1, 2), expr: 'worried', rim: { color: M.rim, dir: [1, -0.3] } });
    glow(g, doorX, GY - 260, 240, M.practical, 0.3);
  });
  FX.dust(g, t, { count: 44, color: '#ffe0b0', a: 0.35 });
} });

// s101 — "It had a working light."
// Wide, from inside the room looking out: the couple silhouetted in the doorway,
// the bulb behind them flickering once, then glowing warm amber and swaying.
// (Bulb sway/flicker is a glow + cone animated over the set's bulb; the set's bulb
// itself is fixed, so the moving light is the flickering halo around it.)
registerShot('s101', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.1 + 0.04 * k, x: 40 - 60 * k, y: 60 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const bx = CX - V(60, 40), by = GY - V(620, 880);
  const sway = Math.sin(t * 1.2) * 14;
  const flick = t < 0.5 ? (Math.sin(t * 40) > 0 ? 0.7 : 0.08) : 0.75;
  layer(g, cam, 1, (g) => {
    glow(g, bx + sway, by + 16, 260, M.practical, flick);
    FX.lightCone(g, bx + sway, by + 16, { angle: Math.PI / 2, spread: 1.0, len: 700, color: M.practical, a: 0.06 + 0.08 * flick });
    FX.pool(g, bx + sway, GY + 20, 340, 36, M.practical, 0.1 + 0.1 * flick);
    // the couple, black silhouettes in the doorway glow (right, by the metal door)
    drawFigure(g, { x: CX + V(420, 320), y: GY, s: 1.35, facing: -1, outfit: MERIDITH, pose: breathe(POSES.stand, t), expr: 'surprised', rim: { color: M.rim, dir: [0, -1] } });
    drawFigure(g, { x: CX + V(620, 470), y: GY, s: 1.4, facing: -1, outfit: HUSBAND, pose: breathe(POSES.stand, t, 1, 2), expr: 'surprised', rim: { color: M.rim, dir: [0, -1] } });
  });
  veil(g, S().ink, 0.25);
  FX.dust(g, t, { count: 40, color: '#ffe0b0', a: 0.35 });
} });

// s102 — "It had a drain in the floor."
// Insert: the rusty floor drain set INTO the concrete floor, one dark droplet
// falling from the rim into the black centre hole.
// FIX: floor context added — concrete tiles, grout lines and a rust stain
// around the drain, so it reads as a grate in a floor, not a floating target.
registerShot('s102', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 12, (g) => basement(g, t, { z: 1.8 - 0.1 * k, x: -100, y: -300 + 60 * k })); veil(g, '#0a0a14', 0.4);
  const M = mood('night');
  const cx = E.W / 2, cy = E.H * 0.5, R = V(170, 150);
  // concrete floor filling the frame: tiles, grout lines, a crack, rust stain
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.floor, 0.15), shade(M.floor, -0.25)]); g.fillRect(0, 0, E.W, E.H);
  g.strokeStyle = alpha(S().ink, 0.35); g.lineWidth = 3;
  for (let x = 0; x <= E.W; x += 240) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); }
  for (let y = 0; y <= E.H; y += 240) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
  seg(g, [[E.W * 0.08, E.H * 0.82], [E.W * 0.3, E.H * 0.68], [E.W * 0.36, E.H * 0.86]], 4, alpha(S().ink, 0.5));
  g.fillStyle = alpha(S().ui.accent, 0.3);
  g.beginPath(); g.ellipse(cx + R * 0.9, cy + R * 0.9, R * 0.7, R * 0.28, 0, 0, 7); g.fill();
  g.beginPath(); g.ellipse(cx - R, cy + R * 0.7, R * 0.45, R * 0.2, 0, 0, 7); g.fill();
  FX.lightCone(g, cx, 0, { angle: Math.PI / 2, spread: 0.6, len: 900, color: M.practical, a: 0.1 });
  // drain grate set into the floor: rim, grid spokes, black centre hole
  g.fillStyle = alpha(S().ink, 0.4);
  g.beginPath(); g.ellipse(cx, cy + R * 0.16, R * 1.08, R * 0.3, 0, 0, 7); g.fill(); // shadow where the rim meets the floor
  circle(g, cx, cy, R, shade(M.wall, -0.5)); ring(g, cx, cy, R, 10, shade(M.wall, 0.4));
  ring(g, cx, cy, R * 0.66, 6, shade(M.wall, 0.25)); ring(g, cx, cy, R * 0.36, 6, shade(M.wall, 0.2));
  circle(g, cx, cy, R * 0.22, S().ink);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; seg(g, [[cx + Math.cos(a) * R * 0.3, cy + Math.sin(a) * R * 0.3], [cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9]], 5, shade(M.wall, 0.35)); }
  glow(g, cx - R * 0.5, cy - R * 0.5, 160, M.key, 0.3);
  // the falling droplet: dark, from the rim down into the black hole
  const drop = ease.inOut(prog(t, 0.3, 1.2));
  const dy = lerp(cy - R * 1.05, cy - 10, drop);
  seg(g, [[cx, cy - R * 1.05], [cx, dy - 12]], 3, alpha(S().ink, 0.5)); // falling trail
  circle(g, cx, dy, 13, S().ink); circle(g, cx - 4, dy - 5, 4, alpha(S().ui.cream, 0.8));
  if (t > 1.2) FX.rings(g, cx, cy, t - 1.2, { count: 2, r0: 20, r1: 160, color: M.key, a: 0.45 * (1 - prog(t, 1.2, info.dur)) });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s103a — "It had mats on the floor, …"
// Wide, high angle over the floor (the DS top-down is not drawable in this flat
// perspective set, so the nearest drawable angle: a high camera looking down the
// room at the mats in a precise clinical line). Drain, rust patches, working bulb.
registerShot('s103a', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.2 + 0.05 * k, x: -30 + 60 * k, y: -140 };
  const { GY, CX, M } = basement(g, t, cam);
  layer(g, cam, 1, (g) => {
    // mats in a precise, clinical line across the floor
    for (let i = 0; i < 4; i++) {
      const mx = CX - V(420, 320) + i * V(230, 180);
      rr(g, mx, GY + V(90, 110), V(200, 150), V(120, 100), 8);
      g.fillStyle = i % 2 ? '#5e4a3a' : '#54443a'; g.fill();
      g.strokeStyle = alpha(S().ink, 0.4); g.lineWidth = 3; g.stroke();
    }
    FX.lightCone(g, CX - V(60, 40), GY - V(600, 860), { angle: Math.PI / 2, spread: 0.9, len: 760, color: M.practical, a: 0.1 });
  });
  FX.dust(g, t, { count: 44, color: '#ffe0b0', a: 0.35 });
} });

// s103b — "… and rust-coloured patches around the drain."
// Medium: the camera tilts down from the wall to the discoloured floor by the drain.
registerShot('s103b', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.1 + 0.12 * k, x: 50 - 80 * k, y: -60 + 120 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const ddx = CX + V(430, 330), ddy = GY + V(150, 190);
  layer(g, cam, 1, (g) => {
    // rust-coloured patches, larger and closer than the set's own
    g.fillStyle = alpha(S().ui.accent, 0.45);
    g.beginPath(); g.ellipse(ddx - 90, ddy + 90, 110, 26, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(ddx + 120, ddy + 60, 80, 20, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(ddx + 10, ddy + 130, 60, 16, 0, 0, 7); g.fill();
    glow(g, ddx, ddy, 200, M.practical, 0.25);
  });
  FX.dust(g, t, { count: 36, color: '#ffe0b0', a: 0.35 });
  FX.fog(g, GY - 80, 140, M.fog, 0.18);
} });

// s104 — "The videos were watched nearly 20 million times."
// Blueprint: navy #0A192F grid, house schematic, the small room block pulsing red,
// a climbing view graph and a 20M counter synced to the VO number.
registerShot('s104', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  UI.blueprint(g, { grid: 60, a: 0.09 });
  const M = mood('void');
  const bp = S().ui.blueprint, acc = S().ui.accent;
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(1 + 0.04 * k, 1 + 0.04 * k); g.translate(-E.W / 2, -E.H / 2);
  // house schematic: outline + rooms
  g.strokeStyle = bp; g.lineWidth = 4;
  g.strokeRect(E.W * 0.16, E.H * 0.2, E.W * 0.42, E.H * 0.56);
  seg(g, [[E.W * 0.37, E.H * 0.2], [E.W * 0.37, E.H * 0.76]], 3, bp);
  seg(g, [[E.W * 0.16, E.H * 0.48], [E.W * 0.58, E.H * 0.48]], 3, bp);
  seg(g, [[E.W * 0.16, E.H * 0.2], [E.W * 0.58, E.H * 0.2]], 3, bp);
  // the secret room: small rectangle, pulsing red
  const pulse = 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(t * 3.2));
  const rx = E.W * 0.44, ry = E.H * 0.56, rw = E.W * 0.1, rh = E.H * 0.16;
  rr(g, rx, ry, rw, rh, 6); g.fillStyle = alpha(acc, pulse); g.fill();
  g.strokeStyle = acc; g.lineWidth = 5; g.stroke();
  glow(g, rx + rw / 2, ry + rh / 2, 160, acc, pulse);
  // climbing view graph, drawing on
  const p = ease.inOut(prog(t, 0.3, 2.4));
  g.strokeStyle = acc; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i <= 60; i++) { const u = (i / 60) * p; const x = E.W * 0.64 + u * E.W * 0.24, y = E.H * 0.68 - Math.pow(u, 1.7) * E.H * 0.4; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  const hx = E.W * 0.64 + p * E.W * 0.24, hy = E.H * 0.68 - Math.pow(p, 1.7) * E.H * 0.4;
  glow(g, hx, hy, 60, acc, 0.8);
  // 20M counter
  const v = Math.floor(lerp(0, 20, ease.inOut(prog(t, 0.3, 2.2))));
  text(g, v + 'M', E.W * 0.76, E.H * 0.3, { size: V(120, 110), color: S().ui.gold, glow: 26, glowColor: alpha(S().ui.gold, 0.6) });
  text(g, '20 MILLION VIEWS', E.W * 0.76, E.H * 0.42, { size: V(34, 36), color: S().ui.cream, spacing: 2 });
  g.restore();
  FX.dust(g, t, { count: 20, color: bp, a: 0.25 });
} });

// s105 — "The comments were terrifying."
// Insert: the husband's blue cap, his silhouette bowing forward into his hands;
// Meredith worried beside him; the vignette tightens.
registerShot('s105', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.35 - 0.12 * k, x: 30 * k };
  const { GY, CX, M } = basement(g, t, cam);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX + V(60, 40), y: GY, s: 1.7, facing: -1, outfit: HUSBAND, pose: breathe(POSES.handsOnHead, t, 1, 2), expr: 'scared', rim: { color: M.rim, dir: [0, -1] } });
    drawFigure(g, { x: CX - V(320, 240), y: GY, s: 1.6, facing: 1, outfit: MERIDITH, pose: breathe(POSES.sad, t), expr: 'worried', rim: { color: M.rim, dir: [0, -1] } });
    glow(g, CX - V(60, 40), GY - V(600, 860), 200, M.practical, 0.3);
  });
  veil(g, S().ink, 0.12 + 0.22 * k); // vignette tightening
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 90, 150, M.fog, 0.18);
} });

// s106 — "People said it was a murder room."
// UI: a flurry of white comment bubbles popping up against a dark navy screen.
registerShot('s106', { draw(g, t, info) {
  const M = mood('void');
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, [M.sky[0], M.sky[1]]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const drift = -30 * ease.inOut(prog(t, 0, info.dur));
  // notification bell
  const bx = E.W / 2 + drift, by = E.H * 0.24;
  glow(g, bx, by, 180, S().ui.gold, 0.5);
  circle(g, bx, by - 10, 52, S().ui.gold);
  poly(g, [[bx - 52, by + 30], [bx + 52, by + 30], [bx + 30, by + 58], [bx - 30, by + 58]], S().ui.gold);
  circle(g, bx, by + 72, 12, S().ui.gold);
  const bubbles = [
    { x: E.W * 0.24, y: E.H * 0.52, w: 340, h: 84, str: 'MURDER ROOM?', at: 0.1 },
    { x: E.W * 0.72, y: E.H * 0.46, w: 360, h: 84, str: 'SERIAL KILLER?', at: 0.45 },
    { x: E.W * 0.3, y: E.H * 0.74, w: 260, h: 76, str: 'NO WAY', at: 0.8 },
    { x: E.W * 0.7, y: E.H * 0.72, w: 280, h: 76, str: 'CREEPY!', at: 1.1 },
  ];
  for (const b of bubbles) {
    const sp = ease.outBack(prog(t, b.at, b.at + 0.45));
    if (sp <= 0) continue;
    g.save(); g.translate(b.x + drift, b.y); g.scale(sp, sp);
    UI.bubble(g, 0, 0, { w: b.w, h: b.h, str: b.str });
    g.restore();
  }
  FX.dust(g, t, { count: 22, color: S().ui.blueprint, a: 0.25 });
} });
