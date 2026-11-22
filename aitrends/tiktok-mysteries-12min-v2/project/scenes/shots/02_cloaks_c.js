// shots/02_cloaks_c.js — Story 2 (Cloaks): s052a s052b s053a s053b s054 s055 s056 s057
// Statues, the Goldwell museum, 1984, Albert Szukalski, The Last Supper, plaster hardening.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, shade, alpha, mix, seg, circle, ring, poly, rr, glow, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { street } from '../sets/street.js';
import { JASON } from '../cast.js';

function cloakXs(cx, s) {
  const xs = [];
  for (let i = 0; i < 12; i++) xs.push(cx + (i - 5.5) * 130 * s + (i > 7 ? 140 * s : 0) - 70 * s);
  return xs;
}
function longShadows(g, cx, GY, s, len, M, a = 0.4) {
  for (const x of cloakXs(cx, s)) {
    poly(g, [[x - 10 * s, GY + 2], [x + 10 * s, GY + 2], [x - len + 16, GY + 34], [x - len, GY + 34]], alpha(M.dark, a));
  }
}
function scrub(g, GY, M, seed = 5) {
  const r = rng(seed);
  for (let i = 0; i < 7; i++) {
    const x = (i < 3 ? r() * E.W * 0.14 : E.W * 0.86 + r() * E.W * 0.14), y = GY + 30 + r() * 130, w = 50 + r() * 70;
    g.fillStyle = alpha(shade(M.wall, -0.4), 0.9); g.beginPath(); g.ellipse(x, y, w, w * 0.32, 0, 0, 7); g.fill();
  }
}
// warm light glowing through the empty hoods of the hollow statues
function hoodGlows(g, cx, GY, s, M) {
  for (const x of cloakXs(cx, s)) glow(g, x, GY - 268 * s, 46 * s, '#ffb060', 0.55);
}

// s052a — "They were statues. They were part of an outdoor art …"
// Insert: Jason surprised at the laptop, screen light on his face; a rough plaster cloak edge in the foreground
registerShot('s052a', { draw(g, t, info) {
  const M = mood('interiorCool'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.2, x: -40 + 80 * k }; // pan-right
  blurLayer(g, 12, (g) => desert(g, t, { z: 1.6, x: 150, y: -100 }), cam);
  veil(g, '#0a0e22', 0.35);
  layer(g, cam, 1, (g) => {
    glow(g, E.W * 0.36, E.H * 0.6, 320, '#bcd6ff', 0.45);
    drawFigure(g, { x: E.W * 0.36, y: E.H * V(0.8, 0.68) + 30, s: 1.6, facing: 1, outfit: JASON, pose: breathe(POSES.sit, t), expr: 'surprised', rim: { color: M.rim, dir: [1, -0.4], w: 4 }, blink: (t % 2.9) > 2.8 });
  });
  // rough plaster texture edge: a big jagged white cloak edge, soft in the foreground
  blurLayer(g, 10, (g) => {
    g.fillStyle = '#f2ede2';
    poly(g, [[E.W * 0.78, E.H], [E.W * 0.82, E.H * 0.42], [E.W * 0.86, E.H * 0.5], [E.W * 0.9, E.H * 0.36], [E.W * 0.95, E.H * 0.48], [E.W * 1.02, E.H * 0.4], [E.W * 1.1, E.H], [E.W, E.H]], '#f2ede2');
    poly(g, [[E.W * 0.82, E.H * 0.42], [E.W * 0.86, E.H * 0.5], [E.W * 0.9, E.H * 0.36], [E.W * 0.88, E.H * 0.62], [E.W * 0.84, E.H * 0.6]], alpha('#cfc4b2', 0.7));
  }, cam, 1.7);
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s052b — "… museum called the Goldwell Open Air Museum, just outside Rhyolite."
// three-quarter CU: Jason's head tilts 15°, amber sweat-drop, a slight smile starting
// (NO headwear on Jason — locked. The DS 'tilted beanie' swap is dropped.)
registerShot('s052b', { draw(g, t, info) {
  const M = mood('interiorWarm'), k = ease.inOut(t / info.dur);
  blurLayer(g, 14, (g) => {
    const GY = E.H * V(0.8, 0.68);
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    glow(g, E.W * 0.85, E.H * 0.28, 220, M.practical, 0.55);
    circle(g, E.W * 0.85, E.H * 0.28, 15, M.practical);
    glow(g, E.W * 0.2, E.H * 0.75, 300, '#bcd6ff', 0.4); // screen glow, low left
  }, { z: 1.4, x: 100, y: 30 - 60 * k }); // tilt-down
  veil(g, '#120a10', 0.3);
  const r = V(300, 330) * (1 + 0.03 * t);
  bigFace(g, E.W / 2, E.H * V(0.6, 0.55), r, { outfit: JASON, expr: t > 1.6 ? 'smile' : 'surprised', rimColor: M.rim, rimSide: 1, tilt: 0.26, blink: (t % 3.1) > 3.0 });
  // amber sweat-drop at the temple, appearing briefly as the realisation lands
  const dropA = clamp(prog(t, 1.0, 1.3)) * (1 - prog(t, 2.4, 2.9));
  if (dropA > 0) {
    g.save(); g.globalAlpha = dropA;
    const dx = E.W / 2 + r * 0.72, dy = E.H * V(0.6, 0.55) - r * 0.55 + t * 12;
    circle(g, dx, dy, 13, '#ffb060'); poly(g, [[dx - 12, dy - 6], [dx + 12, dy - 6], [dx, dy - 30]], '#ffb060');
    glow(g, dx, dy, 40, '#ffb060', 0.5);
    g.restore();
  }
  FX.dust(g, t, { count: 22, color: '#ffe2bd', a: 0.28 });
} });

// s053a — "The statues were made in 1984 …"
// Wide: the cloaks are hollow statues, warm light through the empty hoods, museum platform, long shadows;
// a 1984 calendar page floats in
registerShot('s053a', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05, y: 30 - 60 * k }; // tilt-up
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    // museum platform slab under the line
    g.fillStyle = alpha(shade(M.floor, 0.25), 0.9); g.fillRect(E.W * 0.1, GY - 8, E.W * 0.8, 26);
    cloakLine(g, E.W / 2, GY - 10, 0.9, t);
    hoodGlows(g, E.W / 2, GY - 10, 0.9, M);
    longShadows(g, E.W / 2, GY, 0.9, 300, M, 0.4);
    scrub(g, GY, M, 41);
  });
  // 1984 calendar page, popping in top-left
  const p = ease.outBack(prog(t, 0.4, 1.0));
  if (p > 0) {
    g.save(); g.translate(E.W * 0.2, E.H * 0.24); g.scale(p, p);
    rr(g, -130, -80, 260, 160, 12); g.fillStyle = '#f4efe6'; g.fill();
    g.strokeStyle = alpha(S().ink, 0.25); g.lineWidth = 2; g.stroke();
    text(g, '1984', 0, 22, { size: V(64, 70), color: S().ink, font: FONTS.ui, weight: 900, align: 'center', spacing: 2 });
    g.restore();
  }
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W * 0.9, '#ffe0b0', 0.15);
} });

// s053b — "… by a Belgian artist named Albert Szukalski."
// Insert: one hollow hood, close — warm light through the empty head, plaster cloth texture, sand below;
// a sculpting tool carves a notch into the white cloak
registerShot('s053b', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.3, r: -0.015 + 0.03 * k, x: 30 - 40 * k }; // orbit
  blurLayer(g, 12, (g) => desert(g, t, { z: 1.8, x: -150, y: -200 }), cam);
  veil(g, '#120a10', 0.32);
  layer(g, cam, 1, (g) => {
    const hx = E.W * 0.52, hy = E.H * 0.98, s = 2.6;
    cloakFigure(g, hx, hy, s, t, { seed: 3 });
    // warm light glowing inside the empty head
    glow(g, hx, hy - 268 * s, 120, '#ffb060', 0.8);
    circle(g, hx, hy - 268 * s, 26, '#ffcf8a');
    // sculpting tool carving a notch at the robe edge
    const tx = hx + 60 * s + Math.sin(t * 1.2) * 6, ty = hy - 150 * s;
    seg(g, [[tx - 70, ty + 60], [tx, ty]], 7, '#9aa0b0');
    seg(g, [[tx, ty], [tx + 26, ty - 18]], 12, '#6a5a48');
    FX.dust(g, t, { count: 26, color: '#ffd9b0', a: 0.35 });
  });
} });

// s054 — "His work was called The Last Supper."
// Wide: the twelve statues in a row with a long white table in front — the Last Supper composition
registerShot('s054', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.05 * k, x: -30 * k }; // dolly-diagonal
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2, GY - 60, 0.85, t);
    hoodGlows(g, E.W / 2, GY - 60, 0.85, M);
    longShadows(g, E.W / 2, GY - 60, 0.85, 280, M, 0.4);
    // long white table in front of the twelve figures
    const tw = E.W * 0.78, tx = (E.W - tw) / 2, ty = GY + 6;
    g.fillStyle = '#f2ede2'; g.fillRect(tx, ty - 44, tw, 44);
    g.fillStyle = shade('#f2ede2', -0.25); g.fillRect(tx, ty, tw, 10);
    for (const lx of [tx + 60, tx + tw - 60]) g.fillStyle = '#cfc4b2', g.fillRect(lx, ty + 10, 18, 60);
    for (let i = 0; i < 12; i++) { const px = tx + 60 + (i / 11) * (tw - 120); circle(g, px, ty - 52, 7, '#cfc4b2'); }
    scrub(g, GY, M, 47);
  });
  FX.lensStreak(g, E.W * 0.83, GY - V(300, 700), E.W, '#ffe0b0', 0.16);
} });

// s055 — "He had draped live models in plaster-soaked cloth,"
// Medium: Rhyolite ghost-town street; a cloth draped over a black stick-figure frame, plaster dripping
registerShot('s055', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.06 * k, x: 20 * k }; // push-in
  const { GY } = street(g, t, cam, { variant: 'ghosttown' });
  layer(g, cam, 1, (g) => {
    // black stick-figure frame (the live model), cloth draped over it
    const fx = E.W * 0.5, s = 1.5;
    drawFigure(g, { x: fx, y: GY + 20, s, facing: 1, outfit: { top: 'tshirt', color: S().ink }, pose: breathe(POSES.stand, t), expr: 'neutral', rim: { color: M.rim, dir: [-1, -0.3], w: 4 } });
    poly(g, [[fx - 52 * s, GY + 20 - 258 * s], [fx - 78 * s, GY + 20 - 6 * s], [fx + 78 * s, GY + 20 - 6 * s], [fx + 52 * s, GY + 20 - 258 * s]], alpha('#f2ede2', 0.92));
    circle(g, fx, GY + 20 - 272 * s, 40 * s, '#f2ede2');
    // dripping plaster falling from the cloth hem
    for (let i = 0; i < 6; i++) {
      const dy = ((t * 130 + i * 47) % 150);
      circle(g, fx - 60 * s + i * 24 * s, GY + 20 - 6 * s + dy, 7, '#f2ede2');
    }
    FX.pool(g, fx, GY + 30, 200, 22, M.key, 0.12);
  });
  FX.dust(g, t, { count: 28, color: '#ffd9b0', a: 0.3 });
} });

// s056 — "waited for the cloth to harden into hollow white shapes,"
// UI: phone map, Goldwell Open Air Museum pin dropping, museum boundary drawing itself, hardening progress bar
registerShot('s056', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.08 - 0.06 * k, x: 20 * k }; // pull-out
  blurLayer(g, 10, (g) => desert(g, t, cam), cam);
  veil(g, '#0a0e22', 0.42);
  const pw = V(540, 640), ph = V(720, 900), px = (E.W - pw) / 2, py = (E.H - ph) / 2 - 30;
  rr(g, px - 18, py - 18, pw + 36, ph + 36, 36); g.fillStyle = '#14101c'; g.fill();
  g.save(); rr(g, px, py, pw, ph, 28); g.clip();
  // satellite tiles refreshing (subtle per-row flicker)
  const cols = 8, rows = 9, tw = pw / cols, th = ph / rows, r = rng(52);
  const tileCols = [shade(M.floor, 0.1), shade(M.floor, -0.05), '#b98a5e', '#8a6a4a'];
  for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) {
    g.fillStyle = tileCols[Math.floor(r() * tileCols.length)];
    g.globalAlpha = 0.85 + 0.15 * Math.sin(t * 2 + row + col);
    g.fillRect(px + col * tw + 1, py + row * th + 1, tw - 2, th - 2);
  }
  g.globalAlpha = 1;
  // museum boundary drawing itself
  const bp = prog(t, 0.6, 2.2);
  const pts = [[px + pw * 0.2, py + ph * 0.3], [px + pw * 0.75, py + ph * 0.25], [px + pw * 0.8, py + ph * 0.7], [px + pw * 0.25, py + ph * 0.75], [px + pw * 0.2, py + ph * 0.3]];
  g.strokeStyle = S().ui.gold; g.lineWidth = 4; g.lineJoin = 'round'; g.beginPath();
  for (let i = 0; i < pts.length; i++) { const segP = clamp(bp * (pts.length - 1) - (i - 1), 0, 1); const [sx2, sy2] = i === 0 ? pts[0] : [lerp(pts[i - 1][0], pts[i][0], segP), lerp(pts[i - 1][1], pts[i][1], segP)]; i === 0 ? g.moveTo(sx2, sy2) : g.lineTo(sx2, sy2); if (segP < 1) break; }
  g.stroke();
  // Goldwell pin drops in
  const pinY = lerp(py - 60, py + ph * 0.48, ease.out(prog(t, 0.5, 1.2)));
  g.save(); g.globalAlpha = clamp(prog(t, 0.5, 0.8));
  glow(g, px + pw * 0.5, pinY, 60, S().ui.gold, 0.6);
  circle(g, px + pw * 0.5, pinY - 22, 22, S().ui.gold);
  poly(g, [[px + pw * 0.5 - 19, pinY - 6], [px + pw * 0.5 + 19, pinY - 6], [px + pw * 0.5, pinY + 26]], S().ui.gold);
  g.restore();
  g.restore();
  // hardening progress bar below the phone
  const bw = V(520, 620), bx = (E.W - bw) / 2, by = py + ph + 52;
  text(g, 'HARDENING', bx, by - 14, { size: V(24, 28), color: alpha(S().ui.cream, 0.85), font: FONTS.ui, weight: 900, align: 'left', spacing: 2 });
  rr(g, bx, by, bw, 22, 11); g.fillStyle = alpha(S().ui.gold, 0.15); g.fill();
  const fillW = Math.max(22, bw * ease.inOut(prog(t, 0.3, 2.4)));
  rr(g, bx, by, fillW, 22, 11); g.fillStyle = S().ui.gold; g.fill();
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.25 });
} });

// s057 — "and then removed the models from inside."
// Wide: the statues in a row at dusk; a black stick figure walks out from behind a white shell, leaving it hollow
registerShot('s057', { draw(g, t, info) {
  const M = mood('dusk'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06, x: 50 - 100 * k }; // pan-left
  const { GY } = desert(g, t, cam);
  layer(g, cam, 1, (g) => {
    cloakLine(g, E.W / 2, GY, 0.9, t);
    longShadows(g, E.W / 2, GY, 0.9, 300, M, 0.4);
    // the model steps out from behind the 4th cloak and walks away
    const startX = cloakXs(E.W / 2, 0.9)[3];
    const wx = startX + ease.inOut(prog(t, 0.4, 1.8)) * 340;
    const phase = t * Math.PI * 2 * 0.9;
    drawFigure(g, { x: wx, y: GY, s: 1.1, facing: 1, outfit: { top: 'tshirt', color: S().ink }, pose: walkPose(phase, {}), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.3], w: 4 } });
    scrub(g, GY, M, 55);
  });
  FX.dust(g, t, { count: 28, color: '#ffd9b0', a: 0.3 });
} });
