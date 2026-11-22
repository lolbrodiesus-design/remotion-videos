// shots/04_iowa_d.js — Story 4 (Iowa): s116a–s122b. The upstairs playroom behind
// the mirror, the unexplained room, and the ordinary house at dusk.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { basement } from '../sets/basement.js';
import { street } from '../sets/street.js';
import { MERIDITH } from '../cast.js';

const HUSBAND = { top: 'tshirt', color: '#5a5a6a', head: 'cap', headColor: '#3a6ea5' }; // grey tee, blue cap

// Warm upstairs playroom (daylight): sun shaft, toy blocks, drawings on the wall.
function playroom(g, t, cam) {
  const M = mood('interiorWarm'), GY = E.H * V(0.8, 0.68), CX = E.W / 2;
  const wall = shade(M.wall, -0.2);
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, shade(wall, -0.35)]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    // drawings pinned on the wall
    for (let i = 0; i < 3; i++) {
      const dx = CX - V(620, 460) + i * V(300, 220);
      rr(g, dx, GY - V(560, 780), V(150, 120), V(120, 100), 6); g.fillStyle = S().ui.cream; g.fill();
      seg(g, [[dx + 20, GY - V(500, 700)], [dx + 60, GY - V(530, 730)], [dx + 100, GY - V(495, 695)]], 4, S().ui.accent);
      seg(g, [[dx + 20, GY - V(470, 660)], [dx + 120, GY - V(470, 660)]], 4, S().ui.blueprint);
    }
    // toy blocks on the floor
    const blocks = [[-260, 0], [-200, 1], [-140, 2], [420, 1], [480, 0]];
    for (const [bx, bi] of blocks) {
      const col = [S().ui.gold, S().ui.accent, S().ui.blueprint][bi];
      rr(g, CX + bx, GY - 56, 56, 56, 8); g.fillStyle = col; g.fill();
    }
    // small chair
    rr(g, CX + V(560, 420), GY - 150, 130, 150, 10); g.fillStyle = shade(M.wall, 0.15); g.fill();
    seg(g, [[CX + V(560, 420), GY], [CX + V(560, 420), GY - 150]], 8, shade(M.wall, 0.15));
  });
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, 0.1), shade(M.dark, -0.1)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
  });
  FX.godRays(g, E.W * 0.82, 0, { count: 6, angle: Math.PI / 2.2, spread: 0.5, len: 1400, color: M.practical, a: 0.1, t });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
  return { GY, CX, M };
}

// s116a — "That one was behind a mirror, upstairs, …"
// Wide: the ornate mirror frame; inside it, a cold empty hallway in indigo moonlight.
registerShot('s116a', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.05 + 0.04 * k, x: 30 * k, y: -40 + 90 * k };
  const { GY, CX, M } = playroom(g, t, cam);
  const mx = CX - V(300, 230), my = GY - V(620, 860), mw = V(600, 460), mh = V(560, 780);
  layer(g, cam, 1, (g) => {
    // ornate mirror frame
    rr(g, mx - 24, my - 24, mw + 48, mh + 48, 14); g.fillStyle = S().ui.gold; g.fill();
    // the reflection: a cold, empty hallway in indigo moonlight
    const N = mood('night');
    rr(g, mx, my, mw, mh, 8); g.fillStyle = linGrad(g, mx, my, mx, my + mh, [N.wall, N.dark]); g.fill();
    g.fillStyle = alpha(N.dark, 0.8); g.fillRect(mx + mw * 0.36, my + mh * 0.3, mw * 0.28, mh * 0.7);
    FX.moon(g, mx + mw * 0.76, my + mh * 0.2, 30, '#e8ecff');
    glow(g, mx + mw / 2, my + mh / 2, 220, N.key, 0.2);
    // a small figure silhouette far down the reflected hall
    drawFigure(g, { x: mx + mw * 0.5, y: my + mh - 8, s: 0.55, facing: 1, outfit: MERIDITH, pose: POSES.stand, expr: 'neutral', rim: { color: N.rim, dir: [0, -1] } });
  });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
} });

// s116b — "… and the family already knew about it."
// Medium: the mirror-wall pivots outward on its hidden hinges, warm amber glow
// spilling from the playroom behind it.
// FIX (was the same empty grey frame as s116a): the gold-framed panel is now
// drawn ANGLED open as a slanted quad, with the warm playroom visible in the
// gap behind it — toy blocks, drawings on the wall — and sunlight spilling
// across the floor from the opening.
registerShot('s116b', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.2 + 0.05 * k, x: -40 + 60 * k, y: 40 - 80 * k };
  const { GY, CX, M } = playroom(g, t, cam);
  const pivot = ease.inOut(prog(t, 0.3, info.dur));
  const mx = CX - V(300, 230), my = GY - V(620, 860), mw = V(600, 460), mh = V(560, 780);
  const openX = lerp(mx + mw * 0.82, mx + mw * 0.42, pivot); // free edge swings toward the viewer
  layer(g, cam, 1, (g) => {
    // warm amber glow spilling from the room behind the mirror
    glow(g, mx + mw / 2, my + mh / 2, 420, M.practical, 0.35 + 0.3 * pivot);
    FX.lightCone(g, mx + mw / 2, my + mh / 2, { angle: Math.PI / 2, spread: 0.8, len: 700, color: M.practical, a: 0.08 + 0.1 * pivot });
    // the gap behind the opening panel: warm playroom wall, drawings, blocks
    g.fillStyle = linGrad(g, mx, my, mx + mw, my + mh, [shade(M.practical, 0.1), shade(M.wall, -0.1)]); g.fillRect(mx, my, mw, mh);
    for (let i = 0; i < 2; i++) {
      const dx = mx + mw * (0.3 + i * 0.32), dy = my + mh * 0.16;
      rr(g, dx, dy, 110, 90, 6); g.fillStyle = S().ui.cream; g.fill();
      seg(g, [[dx + 16, dy + 50], [dx + 50, dy + 28], [dx + 84, dy + 48]], 4, S().ui.accent);
      seg(g, [[dx + 16, dy + 68], [dx + 94, dy + 68]], 4, S().ui.blueprint);
    }
    const blockCols = [S().ui.gold, S().ui.accent, S().ui.blueprint];
    for (let i = 0; i < 3; i++) {
      rr(g, mx + mw * (0.3 + i * 0.18), my + mh - 110, 52, 52, 8); g.fillStyle = blockCols[i]; g.fill();
    }
    // sunlight from the opening spilling across the floor
    FX.pool(g, mx + mw / 2, GY + 60, 420, 40, M.practical, 0.12 + 0.12 * pivot);
    FX.godRays(g, mx + mw / 2, my, { count: 4, angle: Math.PI / 2.3, spread: 0.5, len: 900, color: M.practical, a: 0.1 + 0.08 * pivot, t });
    // the mirror panel itself, pivoting outward: hinged on the left edge,
    // free edge swung toward the camera as a slanted gold-framed quad
    poly(g, [[mx, my], [openX, my - 36], [openX, my + mh + 20], [mx, my + mh]], shade(M.wall, 0.2));
    seg(g, [[mx, my], [openX, my - 36], [openX, my + mh + 20], [mx, my + mh], [mx, my]], 10, S().ui.gold); // gold frame edge
    seg(g, [[mx + 10, my + 10], [openX - 8, my - 26]], 3, M.practical); // glint on the frame's top edge
    // hidden door hinges on the pivot edge
    circle(g, mx + 8, my + mh * 0.25, 12, S().ui.gold);
    circle(g, mx + 8, my + mh * 0.75, 12, S().ui.gold);
  });
  FX.dust(g, t, { count: 34, color: '#ffe0b0', a: 0.35 });
} });

// s117 — "They had turned it into a children's playroom."
// Wide: the wooden rocking horse in the upstairs nursery; it rocks once.
registerShot('s117', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.05 + 0.05 * k, x: -50 + 80 * k };
  const { GY, CX, M } = playroom(g, t, cam);
  const rock = 0.1 * Math.sin(prog(t, 0.2, 1.4) * Math.PI);
  layer(g, cam, 1, (g) => {
    const hx = CX - V(80, 60), hy = GY - 10;
    g.save(); g.translate(hx, hy); g.rotate(rock);
    // rockers
    g.strokeStyle = M.practical; g.lineWidth = 12; g.lineCap = 'round';
    g.beginPath(); g.arc(0, 0, 150, Math.PI * 0.15, Math.PI * 0.85); g.stroke();
    // legs, body, neck, head — simple wooden horse
    seg(g, [[-70, -30], [-80, -120]], 16, M.practical);
    seg(g, [[70, -30], [80, -120]], 16, M.practical);
    rr(g, -110, -190, 220, 90, 40); g.fillStyle = M.practical; g.fill();
    seg(g, [[80, -180], [150, -260]], 22, M.practical);
    poly(g, [[140, -280], [210, -250], [150, -210]], M.practical);
    circle(g, 196, -262, 7, S().ink); // eye
    seg(g, [[-100, -190], [-160, -120]], 12, shade(M.practical, -0.3)); // tail
    g.restore();
    glow(g, hx, hy - 140, 260, M.practical, 0.25);
  });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
} });

// s118 — "The basement room was never explained."
// Insert, floor level: looking into the dark slit where the sliding wall sits
// in its track; Meredith half in shadow.
registerShot('s118', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.6 + 0.1 * k, x: -60 + 90 * k, y: 220 };
  const { GY, CX, M } = basement(g, t, cam);
  layer(g, cam, 1, (g) => {
    // the narrow door gap: a black slit with one thin line of light
    const gx = CX - V(200, 150), gy = GY - V(300, 420);
    rr(g, gx, gy, V(90, 70), V(300, 420), 6); g.fillStyle = S().ink; g.fill();
    seg(g, [[gx + V(90, 70) / 2, gy], [gx + V(90, 70) / 2, gy + V(300, 420)]], 4, M.practical);
    glow(g, gx + 45, gy + 150, 130, M.practical, 0.35);
    // Meredith, half in shadow, eyes distant
    drawFigure(g, { x: CX + V(420, 320), y: GY, s: 1.45, facing: -1, outfit: MERIDITH, pose: breathe(POSES.stand, t), expr: 'worried', rim: { color: M.rim, dir: [0, -1] } });
  });
  veil(g, S().ink, 0.2);
  FX.dust(g, t, { count: 44, color: '#ffe0b0', a: 0.4 });
} });

// s119 — "No one knows what it was built for."
// Insert: a jagged skeleton key alone on a dusty wooden shelf, catching a
// stray moonlight beam in the empty narrow room.
registerShot('s119', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 12, (g) => basement(g, t, { z: 1.7 + 0.08 * k, x: 100 - 60 * k, y: -280 })); veil(g, '#0a0a14', 0.42);
  const M = mood('night');
  const sx = E.W * 0.5, sy = E.H * 0.56;
  FX.godRays(g, E.W * 0.14, 0, { count: 5, angle: Math.PI / 2.5, spread: 0.4, len: 1300, color: M.key, a: 0.12, t });
  // dusty wooden shelf
  rr(g, sx - 420, sy + 40, 840, 34, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
  // the skeleton key: bow, shaft, jagged teeth
  const kx = sx, ky = sy - 30;
  ring(g, kx - 130, ky, 52, 12, S().ui.gold);
  seg(g, [[kx - 80, ky], [kx + 190, ky]], 14, S().ui.gold);
  seg(g, [[kx + 150, ky], [kx + 150, ky + 44]], 12, S().ui.gold);
  seg(g, [[kx + 190, ky], [kx + 190, ky + 30]], 12, S().ui.gold);
  glow(g, kx + 40, ky, 200, S().ui.gold, 0.35);
  FX.sparkle(g, kx + 150, ky, 24, M.key, 0.85);
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.35 });
} });

// s120 — "But the police were clear."
// Medium: the couple stand still in the basement; a hand slams a red CLOSED
// stamp onto a paper in the foreground.
registerShot('s120', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 10, (g) => {
    const { GY, CX, M } = basement(g, t, { z: 1.4 - 0.12 * k, x: -60 });
    layer(g, { z: 1.4, x: -60 }, 1, (g) => {
      drawFigure(g, { x: CX - V(200, 150), y: GY, s: 1.4, facing: 1, outfit: MERIDITH, pose: breathe(POSES.stand, t), expr: 'neutral', rim: { color: M.rim, dir: [0, -1] } });
      drawFigure(g, { x: CX + V(160, 120), y: GY, s: 1.45, facing: -1, outfit: HUSBAND, pose: breathe(POSES.stand, t, 1, 2), expr: 'neutral', rim: { color: M.rim, dir: [0, -1] } });
    });
  });
  veil(g, '#0a0a14', 0.3);
  const M = mood('night');
  // paper + stamp slamming down
  const px = E.W * 0.5, py = E.H * 0.62;
  rr(g, px - 340, py - 150, 680, 300, 10); g.fillStyle = S().ui.cream; g.fill();
  seg(g, [[px - 280, py - 90], [px + 280, py - 90]], 5, alpha(S().ink, 0.35));
  seg(g, [[px - 280, py - 40], [px + 200, py - 40]], 5, alpha(S().ink, 0.35));
  const slam = ease.out(prog(t, 0.5, 0.9));
  const stampY = lerp(py - 420, py - 60, slam);
  rr(g, px - 150, stampY - 70, 300, 90, 10); g.fillStyle = shade(M.wall, -0.3); g.fill();
  seg(g, [[px - 110, stampY - 70], [px - 110, stampY - 130]], 10, shade(M.wall, -0.3));
  seg(g, [[px + 110, stampY - 70], [px + 110, stampY - 130]], 10, shade(M.wall, -0.3));
  if (t > 0.9) {
    text(g, 'CLOSED', px, py + 10, { size: V(84, 76), color: S().ui.accent, glow: 22, glowColor: alpha(S().ui.accent, 0.6), spacing: 4 });
    FX.rings(g, px, py, t - 0.9, { count: 2, r0: 60, r1: 320, color: S().ui.accent, a: 0.5 * (1 - prog(t, 0.9, 1.6)) });
  }
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.3 });
} });

// s121 — "There was no crime in that room."
// Wide: the ordinary house at dusk, lights on, quiet street; the camera pushes
// slowly into the dark entrance of the empty basement room.
registerShot('s121', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1 + 0.15 * k, x: -30 * k };
  const { GY, CX, M } = street(g, t, cam, { variant: 'house', mood: 'dusk' });
  // the pitch-black doorway: the porch door darkens as we push in
  const doorX = CX - V(420, 320) + V(840, 640) / 2 - 46, doorY = GY - 260;
  g.fillStyle = alpha(S().ink, 0.25 + 0.5 * k);
  g.fillRect(doorX - 20, doorY - 20, 132, 300);
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 110, 170, M.fog, 0.2);
} });

// s122a — "It was just a secret room, in an ordinary house, …"
// Insert: a brass deadbolt; a hand turns the lock, the bolt sliding home.
registerShot('s122a', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 12, (g) => street(g, t, { z: 1.7 - 0.1 * k, x: 120 - 60 * k, y: -200 })); veil(g, '#0a0a14', 0.42);
  const M = mood('night');
  const bx = E.W * 0.5, by = E.H * 0.5;
  const slide = ease.out(prog(t, 0.4, 1.4));
  // brass plate + bolt sliding into the frame
  rr(g, bx - 260, by - 110, 520, 220, 20); g.fillStyle = shade(S().ui.gold, -0.35); g.fill();
  rr(g, bx - 220, by - 70, 300 + slide * 90, 140, 12); g.fillStyle = S().ui.gold; g.fill();
  circle(g, bx - 160, by, 34, shade(S().ui.gold, -0.5));
  circle(g, bx - 160, by, 14, S().ink);
  glow(g, bx, by, 260, S().ui.gold, 0.35);
  // the turning hand (thumb + fingers on the knob)
  const rot = slide * 1.4;
  g.save(); g.translate(bx - 160, by); g.rotate(rot);
  seg(g, [[-30, -70], [-30, 70]], 26, S().ink); g.restore();
  if (t > 1.4) FX.rings(g, bx + 60, by, t - 1.4, { count: 2, r0: 30, r1: 200, color: S().ui.gold, a: 0.5 * (1 - prog(t, 1.4, 2.2)) });
  FX.dust(g, t, { count: 24, color: '#ffe0b0', a: 0.3 });
} });

// s122b — "… that a family had lived next to for four years."
// Wide: the house at dusk, lights on, quiet street; the single basement light
// winks out as the camera tilts down.
registerShot('s122b', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.02 + 0.03 * k, x: 20 * k, y: 50 * k };
  const { GY, CX, M } = street(g, t, cam, { variant: 'house', mood: 'dusk' });
  // the ground-level basement window (same spot the set lights): it winks out
  const wx = CX + V(420, 320) - 260, wy = GY - 60, ww = 110, wh = 70;
  const out = prog(t, 1.6, 2.4);
  if (out > 0) { g.fillStyle = alpha(S().ink, out); g.fillRect(wx - 6, wy - 6, ww + 12, wh + 12); }
  veil(g, S().ink, 0.1 * out);
  FX.stars(g, t, { seed: 3, count: 50, area: [0, 0, E.W, E.H * 0.4], color: '#dfe8ff' });
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.28 });
} });
