// shots/03_bleeding_b.js — Story 3 (Bleeding Wall): s070b–s077b.
// Lexy (green cap, LEXY) — black stick figures only, rim light on every lit figure.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, mix, poly, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { LEXY } from '../cast.js';

// The red drip: S().ui.accent (coral red) from the style tokens, darkened for depth.
const red = () => S().ui.accent;
const redDark = () => shade(S().ui.accent, -0.45);
const GOLD = () => S().ui.gold;
const CREAM = () => S().ui.cream;
const BLUE = () => S().ui.blueprint;
function dripTrail(g, x, y, len, w, a = 0.95) {
  if (len <= 2) return;
  g.save(); g.globalAlpha = a; g.fillStyle = red();
  g.beginPath(); g.moveTo(x - w / 2, y);
  g.bezierCurveTo(x - w, y + len * 0.4, x + w, y + len * 0.7, x - w * 0.2, y + len);
  g.bezierCurveTo(x + w * 0.6, y + len * 0.7, x + w / 2, y + len * 0.35, x + w / 2, y);
  g.fill(); g.restore();
  circle(g, x - w * 0.2, y + len, Math.max(2, w * 0.45), redDark());
}
const CAB = { x: E.W / 2 + 330, y: 864 - 470, w: 380, h: 300 };
const DRIPX = CAB.x + CAB.w * 0.3, DRIPY = CAB.y + CAB.h + 6;
const kOf = (t, info) => ease.inOut(clamp(t / info.dur));

// s070b — wide: the doubled drip seen from across the room; three red rivers race to the floor.
registerShot('s070b', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.06, x: -20 * k, y: -40 * (1 - k) };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    dripTrail(g, DRIPX - 30, DRIPY, 200 * ease.inOut(prog(t, 0, 1.4)), 12);
    dripTrail(g, DRIPX + 30, DRIPY + 6, 180 * ease.inOut(prog(t, 0.2, 1.6)), 10);
    dripTrail(g, DRIPX + 85, DRIPY + 12, 150 * ease.inOut(prog(t, 0.4, 1.8)), 9);
    g.save(); g.globalAlpha = 0.5 * prog(t, 1.0, info.dur); g.fillStyle = redDark();
    for (const px of [DRIPX - 30, DRIPX + 30, DRIPX + 85]) { g.beginPath(); g.ellipse(px, GY + 46, 34, 9, 0, 0, 7); g.fill(); }
    g.restore();
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 420, y: GY, s: 1.25, facing: 1, outfit: LEXY,
      pose: breathe(POSES.stand, t), expr: 'shocked',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.1) > 3.0 });
  });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s071a — blueprint: wireframe bathroom wall, pulsing red circle on the leak, 6 MILLION VIEWS counter.
registerShot('s071a', { draw(g, t, info) {
  const k = kOf(t, info);
  UI.blueprint(g, {});
  const bp = BLUE(), cx = E.W / 2, cy = E.H * 0.52;
  g.save(); g.translate(E.W / 2, E.H / 2); g.rotate(0.012 * Math.sin(t * 0.8)); g.translate(-E.W / 2, -E.H / 2);
  g.strokeStyle = bp; g.lineWidth = 3;
  g.strokeRect(cx - 520, cy - 300, 1040, 600);                       // wall wireframe
  g.strokeRect(cx + 180, cy - 220, 300, 240);                        // cabinet wireframe
  g.beginPath(); g.moveTo(cx - 520, cy - 100); g.lineTo(cx + 520, cy - 100); g.stroke();
  g.beginPath(); g.moveTo(cx + 330, cy - 220); g.lineTo(cx + 330, cy + 20); g.stroke();
  const leakX = cx + 270, leakY = cy + 26;
  const pulse = 34 + 10 * Math.sin(t * 4);
  ring(g, leakX, leakY, pulse, 4, alpha(red(), 0.9));
  ring(g, leakX, leakY, pulse * 1.5, 2, alpha(red(), 0.4 * (1 - prog(t % 1, 0, 1))));
  circle(g, leakX, leakY, 8, red());
  glow(g, leakX, leakY, 90, red(), 0.5);
  // animated line graph climbing
  g.strokeStyle = GOLD(); g.lineWidth = 5; g.beginPath();
  for (let i = 0; i <= 40; i++) {
    const u = (i / 40) * ease.inOut(prog(t, 0.3, info.dur - 0.3));
    const px = cx - 460 + u * 900, py = cy + 240 - Math.pow(u, 1.6) * 420;
    i ? g.lineTo(px, py) : g.moveTo(px, py);
  }
  g.stroke();
  g.restore();
  const recA = 0.4 + 0.6 * (Math.sin(t * 6) > 0 ? 1 : 0.2);
  circle(g, E.W - 260, 110, 12, alpha(red(), recA));
  text(g, 'REC', E.W - 230, 112, { size: 30, color: CREAM(), font: FONTS.ui, weight: 900, align: 'left' });
  text(g, '6 MILLION VIEWS', cx, E.H - 90, { size: 44, color: GOLD(), font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(GOLD(), 0.6), alpha: ease.out(prog(t, 0.8, 1.4)) });
  FX.dust(g, t, { count: 16, color: BLUE(), a: 0.25 });
} });

// s071b — UI: phone TikTok screen, the drip video playing, the view count rolling up to 6.0M.
registerShot('s071b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.5, x: 100, y: -100 }, { drip: false })); veil(g, '#120a10', 0.5);
  const M = mood('interiorCool');
  const px = E.W / 2 - 140, py = E.H * 0.5, pw = 380, ph = 620;
  g.save(); g.translate(-30 * k, 20 * k);
  FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: M.practical, a: 0.3 }, (g, x, y, w, h) => {
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(x, y, w, h * 0.7);
    dripTrail(g, x + w * 0.4, y + 40, h * 0.45, 12, 0.9);
    poly(g, [[x + w * 0.5 - 26, y + h * 0.28], [x + w * 0.5 - 26, y + h * 0.28 + 76], [x + w * 0.5 + 40, y + h * 0.28 + 38]], CREAM());
    text(g, '@LEXYRAYE', x + w / 2, y + h - 30, { size: 28, color: CREAM(), font: FONTS.ui, weight: 900 });
  });
  // heart + comment icons beside the phone
  const hx = px + pw / 2 + 90;
  poly(g, [[hx - 26, py - 190], [hx, py - 150], [hx + 26, py - 190], [hx + 26, py - 160], [hx, py - 120], [hx - 26, py - 160]], red());
  circle(g, hx - 14, py - 178, 14, red()); circle(g, hx + 14, py - 178, 14, red());
  UI.bubble(g, hx, py - 60, { w: 64, h: 48, color: CREAM(), dots: true });
  const v = lerp(0, 6, ease.inOut(prog(t, 0.2, 1.6)));
  text(g, v.toFixed(1) + 'M', px + pw / 2 + 90, py + 130, { size: 84, color: GOLD(), font: FONTS.ui, weight: 900, glow: 22, glowColor: alpha(GOLD(), 0.5) });
  text(g, 'VIEWS', px + pw / 2 + 90, py + 190, { size: 26, color: CREAM(), font: FONTS.ui, weight: 900, spacing: 3 });
  g.restore();
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s072 — reaction: a flickering television casting jagged shadows on the wall; Lexy small at right.
registerShot('s072', { draw(g, t, info) {
  const k = kOf(t, info);
  const M = mood('night');
  const cam = { z: 1 + 0.08 * k, x: 20 * k };
  // the room wall, flat indigo, with a floor line so the TV stand grounds
  layer(g, cam, 0.2, (g) => {
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 2);
    g.fillStyle = shade(M.floor, -0.3); g.fillRect(-E.W, E.H * 0.82, E.W * 3, E.H);
    seg(g, [[-E.W, E.H * 0.82], [E.W * 2, E.H * 0.82]], 3, alpha(M.key, 0.25));
  });
  const flick = 0.45 + 0.4 * (0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 23));
  const tx = E.W * 0.36, ty = E.H * 0.42, tw = 560, th = 320;
  // TV stand: low cabinet + legs, grounding the set
  layer(g, cam, 0.5, (g) => {
    rr(g, tx - tw / 2 - 60, ty + th / 2 + 34, tw + 120, 54, 8); g.fillStyle = shade(M.wall, -0.1); g.fill();
    seg(g, [[tx, ty + th / 2 + 8], [tx, ty + th / 2 + 34]], 18, shade(M.dark, -0.2));
    seg(g, [[tx - tw / 2 - 30, ty + th / 2 + 88], [tx - tw / 2 - 30, E.H * 0.82]], 12, shade(M.dark, -0.2));
    seg(g, [[tx + tw / 2 + 30, ty + th / 2 + 88], [tx + tw / 2 + 30, E.H * 0.82]], 12, shade(M.dark, -0.2));
    FX.pool(g, tx, E.H * 0.84, 420, 34, M.key, 0.10 + 0.12 * flick);
  });
  // the TV: dark bezel, glowing screen with a faint static image inside
  FX.screen(g, { x: tx - tw / 2, y: ty - th / 2, w: tw, h: th, glowC: M.key, a: flick * 0.5 }, (g, x, y, w, h) => {
    g.fillStyle = alpha(M.key, 0.2 + 0.55 * flick); g.fillRect(x, y, w, h);
    // faint image on the screen: a pale doorway with a small figure silhouette
    g.fillStyle = alpha(CREAM(), 0.16 + 0.14 * flick);
    g.fillRect(x + w * 0.42, y + h * 0.18, w * 0.16, h * 0.64);
    g.fillStyle = alpha(S().ink, 0.35);
    g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.52, 26, 52, 0, 0, 7); g.fill();
    circle(g, x + w * 0.5, y + h * 0.3, 18, alpha(S().ink, 0.35));
    // static scanlines, shifting with the flicker
    for (let i = 0; i < 6; i++) {
      const sy2 = y + 24 + i * 50 + Math.sin(t * 13 + i * 2.1) * 6;
      g.fillStyle = alpha(M.dark, 0.35 + 0.3 * flick); g.fillRect(x + 16, sy2, w - 32, 6);
    }
  });
  // a small power dot on the bezel so the box reads as a TV, not a vent
  ring(g, tx + tw / 2 - 6, ty + th / 2 + 8, 5, 3, alpha(red(), 0.8 * flick));
  // jagged shadows ON the wall: thin zigzag strips anchored at the TV's right edge,
  // stretching and shrinking across the wall surface as the screen flickers
  const stretch = 0.7 + 0.7 * flick;
  layer(g, cam, 0.55, (g) => {
    const baseX = tx + tw / 2 + 30, baseY = ty - 40;
    for (let i = 0; i < 3; i++) {
      const y0 = baseY + i * 130, len = (420 + i * 130) * stretch;
      const jag = 26 + i * 8;
      poly(g, [
        [baseX, y0 - 14], [baseX + len * 0.25, y0 - jag], [baseX + len * 0.45, y0 - 10],
        [baseX + len * 0.68, y0 - jag * 0.8], [baseX + len, y0 - 6],
        [baseX + len * 0.9, y0 + 12], [baseX + len * 0.62, y0 + jag * 0.7],
        [baseX + len * 0.4, y0 + 8], [baseX + len * 0.18, y0 + jag * 0.6], [baseX, y0 + 14]
      ], alpha(shade(M.dark, -0.4), 0.75 - i * 0.12));
    }
    // long thin shadow of the TV stand leg across the floor line
    poly(g, [[tx - tw / 2, E.H * 0.8], [tx + tw / 2 + 260 * stretch, E.H * 0.8], [tx + tw / 2 + 200 * stretch, E.H * 0.86], [tx - tw / 2, E.H * 0.86]], alpha(shade(M.dark, -0.4), 0.5));
  });
  FX.godRays(g, tx, ty, { count: 5, angle: 0, spread: 0.5, len: 700, a: 0.05 + 0.05 * flick, t });
  // Lexy small at right, eyes darting, red flicker washing across her face
  layer(g, cam, 1, (g) => {
    const sh = shake(t, 2, 2.2);
    const lx = E.W * 0.82 + sh[0], ly = E.H * 0.8 + sh[1];
    drawFigure(g, { x: lx, y: ly, s: 1.3, facing: -1, outfit: LEXY,
      pose: breathe(POSES.stand, t), expr: 'scared',
      look: [clamp(Math.sin(t * 3.1), -1, 1) * 0.9, -0.1],
      rim: { color: M.key, dir: [-1, -0.2] }, blink: (t % 2.7) > 2.6 });
    glow(g, lx - 30, ly - 260, 190, red(), 0.10 + 0.14 * flick);
  });
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
} });

// s073 — insert: an actual hand silhouette shadow clawing at the indigo wall, light source visible.
registerShot('s073', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.6, x: -100, y: -60 }, { drip: false })); veil(g, shade(mood('interiorCool').dark, -0.2), 0.55);
  const M = mood('interiorCool');
  // the light source, visible at frame left: a bare bulb on a cord, swinging slightly
  const lx = lerp(E.W * 0.14, E.W * 0.3, ease.inOut(prog(t, 0, info.dur)));
  const ly = E.H * 0.3 + Math.sin(t * 1.4) * 14;
  seg(g, [[lx, 0], [lx, ly - 26]], 4, shade(M.wall, -0.2));
  glow(g, lx, ly, 260, M.key, 0.55);
  circle(g, lx, ly, 26, CREAM());
  circle(g, lx, ly, 14, alpha(M.key, 0.9));
  FX.lightCone(g, lx, ly, { angle: 0.12, spread: 0.5, len: 1100, color: M.key, a: 0.16 });
  FX.godRays(g, lx, ly, { count: 5, angle: 0.1, spread: 0.6, len: 900, a: 0.05, t });
  // the hand shadow on the wall: palm + five spread fingers, jagged edge, clawing as the light moves
  const shadowCol = alpha(shade(M.dark, -0.5), 0.88);
  const hx = E.W * 0.66 - (lx - E.W * 0.22) * 0.9, hy = E.H * 0.56;
  const claw = 0.5 + 0.5 * Math.sin(t * 2.2);
  const sway = Math.sin(t * 1.1) * 10;
  g.save(); g.translate(hx + sway, hy); g.rotate(-0.08 + 0.05 * Math.sin(t * 0.9));
  // palm: a rounded, slightly jagged-edged shape
  poly(g, [[-95, -30], [-110, 40], [-70, 130], [0, 150], [80, 120], [105, 40], [90, -50], [30, -95], [-50, -90]], shadowCol);
  circle(g, 0, 30, 105, shadowCol);
  // jagged spikes around the palm edge
  poly(g, [[-110, 40], [-150, 60], [-104, 78], [-140, 110], [-70, 128]], shadowCol);
  poly(g, [[105, 40], [150, 20], [108, 70], [140, 100], [80, 120]], shadowCol);
  // five fingers, fanning upward, curling inward as the hand claws
  const fingers = [[-78, -70, -0.5, 150], [-38, -88, -0.25, 185], [4, -92, 0, 200], [46, -82, 0.28, 175], [84, -55, 0.55, 130]];
  for (const [fx, fy, ang, len] of fingers) {
    const curl = claw * 0.45;
    const tipX = fx + Math.sin(ang) * len * (1 - curl * 0.4) - curl * 34;
    const tipY = fy - Math.cos(ang) * len * (1 - curl * 0.4);
    const midX = fx + Math.sin(ang) * len * 0.55 - curl * 12;
    const midY = fy - Math.cos(ang) * len * 0.55;
    seg(g, [[fx, fy], [midX, midY]], 30, shadowCol);
    seg(g, [[midX, midY], [tipX, tipY]], 24, shadowCol);
    circle(g, tipX, tipY, 13, shadowCol);
    // jagged fingertip: a small spike at each tip
    poly(g, [[tipX - 10, tipY - 6], [tipX + 2, tipY - 26 - claw * 10], [tipX + 12, tipY - 4]], shadowCol);
  }
  // thumb, angled out to the side
  seg(g, [[-95, 10], [-170 - claw * 20, -30]], 28, shadowCol);
  circle(g, -170 - claw * 20, -30, 14, shadowCol);
  g.restore();
  // the red drip, close and dark at frame left, under the light
  dripTrail(g, E.W * 0.08, E.H * 0.42, 150, 10, 0.6);
  circle(g, E.W * 0.08, E.H * 0.42 + 150, 9, redDark());
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });

// s074 — medium: a flashlight beam cuts through the dark bathroom, sweeping across the red streaks.
registerShot('s074', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.05 + 0.03 * k, x: -30 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false, wisps: false });
  const sweep = key(t, [[0, 0.35], [1, -0.1], [info.dur, -0.45]]);
  const hx = E.W / 2 - 190, hy = GY - 250;
  layer(g, cam, 0.55, (g) => {
    dripTrail(g, DRIPX, DRIPY, 170, 11, 0.85);
    dripTrail(g, DRIPX + 70, DRIPY + 8, 120, 9, 0.85);
  });
  FX.lightCone(g, hx, hy, { angle: sweep, spread: 0.42, len: 900, color: M.key, a: 0.16 });
  glow(g, hx, hy, 90, M.key, 0.6);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 260, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'reach']]), t), expr: 'worried', prop: 'flashlight',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.1) > 3.0 });
  });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.35 });
} });

// s075 — wide: Lexy sits on the floor surrounded by a toolbox and a glowing laptop.
registerShot('s075', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.04, x: 50 * k, y: -10 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.9, (g) => {
    const tx = E.W / 2 - 480, ty = GY + 30;
    rr(g, tx - 90, ty - 50, 180, 100, 10); g.fillStyle = shade(M.wall, -0.2); g.fill();
    seg(g, [[tx - 40, ty - 50], [tx + 40, ty - 50]], 10, shade(M.wall, 0.1));
    circle(g, tx - 60, ty - 20, 12, GOLD()); circle(g, tx + 50, ty - 10, 9, M.practical);
    FX.screen(g, { x: E.W / 2 + 60, y: GY - 30, w: 260, h: 150, glowC: M.practical, a: 0.3 }, (g, x, y, w, h) => {
      g.fillStyle = shade(M.wall, -0.3); g.fillRect(x, y, w, h);
      for (let i = 0; i < 4; i++) { g.fillStyle = alpha(BLUE(), 0.7); g.fillRect(x + 20, y + 20 + i * 30, w - 40 - i * 30, 10); }
    });
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 260, y: GY, s: 1.5, facing: 1, outfit: LEXY,
      pose: breathe(POSES.sit, t, 1, 3), expr: 'thinking',
      rim: { color: M.rim, dir: [0.4, -1] }, blink: (t % 3.3) > 3.2 });
  });
  FX.pool(g, E.W / 2 + 190, GY + 40, 260, 26, M.practical, 0.14);
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
} });

// s076 — insert: a mould-test swab pressed into a petri dish; the cotton tip turns muddy green.
registerShot('s076', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.7, x: 60, y: -140 }, {})); veil(g, shade(mood('interiorCool').dark, -0.2), 0.45);
  const M = mood('interiorCool');
  const cx = E.W / 2 - 40 + 30 * k, cy = E.H * 0.54 + 16 * k, r = 300;
  const z = 1.08 + 0.06 * k;
  // soft shadow under the dish + a cool glow so the dish reads as glass, not a clock face
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2);
  g.fillStyle = alpha(shade(M.dark, -0.4), 0.55);
  g.beginPath(); g.ellipse(cx, cy + r * 0.85, r * 1.05, 54, 0, 0, 7); g.fill();
  glow(g, cx, cy, r * 1.5, M.key, 0.22);
  // the dish: glass rim (double ring + highlight arc), agar surface inside
  circle(g, cx, cy, r, mix(M.key, M.grass, 0.28));
  // agar texture: soft blotches and speckles, deterministic positions
  const blotches = [[-140, -60, 46], [90, -120, 38], [150, 60, 52], [-60, 130, 40], [30, 30, 30], [-180, 90, 26], [170, -40, 24]];
  for (const [bx, by, br] of blotches) circle(g, cx + bx, cy + by, br, alpha(mix(M.grass, M.wall, 0.4), 0.22));
  ring(g, cx, cy, r, 10, shade(M.key, 0.25));
  ring(g, cx, cy, r - 14, 4, alpha(CREAM(), 0.5));
  // glass highlight arc on the rim
  g.save(); g.strokeStyle = alpha(CREAM(), 0.65); g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.arc(cx, cy, r - 7, Math.PI * 1.15, Math.PI * 1.55); g.stroke(); g.restore();
  // the swab: long stick entering diagonally from the top-right frame edge, cotton tip pressing the agar
  const tipX = cx + 30, tipY = cy + 40;
  const press = ease.inOut(prog(t, 0.4, 1.6));
  const tipDip = 14 * press;
  seg(g, [[tipX + 430, tipY - 330], [tipX + 26, tipY - 18]], 12, CREAM());
  // muddy-green stain spreading from the tip on contact
  const stain = ease.inOut(prog(t, 1.0, info.dur - 0.2));
  if (stain > 0) circle(g, tipX, tipY + tipDip, 26 + 120 * stain, alpha(mix(M.grass, M.wall, 0.55), 0.5 * stain));
  // cotton tip: a fat capsule, pressed into the agar
  const tipC = mix(CREAM(), mix(M.grass, M.wall, 0.55), ease.inOut(prog(t, 0.8, 2.0)));
  g.save(); g.translate(tipX, tipY + tipDip); g.rotate(-0.65);
  g.fillStyle = tipC;
  g.beginPath(); g.ellipse(0, 0, 58, 30, 0, 0, 7); g.fill();
  circle(g, -30, 0, 26, tipC); circle(g, 30, 0, 26, tipC);
  g.restore();
  // dent ring in the agar around the pressed tip
  ring(g, tipX, tipY + tipDip, 74, 4, alpha(mix(M.grass, M.wall, 0.5), 0.55 * press));
  glow(g, tipX, tipY + tipDip, 90, tipC, 0.3);
  g.restore();
  // plumber's wrench glinting at the frame edge, second half of the shot
  const wa = ease.out(prog(t, 1.4, 1.9));
  if (wa > 0) {
    g.save(); g.globalAlpha = wa; g.translate(E.W * 0.82, E.H * 0.68); g.rotate(-0.5);
    seg(g, [[0, 0], [0, -150]], 14, shade(M.key, -0.2));
    ring(g, 0, -170, 26, 12, shade(M.key, -0.1));
    glow(g, 0, -170, 70, M.key, 0.5);
    g.restore();
  }
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });

// s077a — insert: a dark square attic hatch in the ceiling; a flashlight beam shoots up into the void.
registerShot('s077a', { draw(g, t, info) {
  const k = kOf(t, info);
  const M = mood('interiorCool');
  const cam = { z: 1.05 + 0.04 * k, x: 20 * k, y: -60 * k };
  const { GY } = bathroom(g, t, cam, { drip: false, wisps: false });
  layer(g, cam, 0.55, (g) => {
    const hx = E.W / 2 + 120, hy = E.H * 0.16, hs = 260;
    rr(g, hx - hs / 2, hy - hs / 2, hs, hs, 6); g.fillStyle = shade(M.dark, -0.4); g.fill();
    g.strokeStyle = alpha(M.key, 0.4); g.lineWidth = 4; g.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
    seg(g, [[hx - 14, hy + hs / 2], [hx - 14, hy + hs / 2 + 260]], 8, shade(M.wall, -0.2));
    seg(g, [[hx + 14, hy + hs / 2], [hx + 14, hy + hs / 2 + 260]], 8, shade(M.wall, -0.2));
    for (let i = 0; i < 4; i++) seg(g, [[hx - 14, hy + hs / 2 + 60 + i * 60], [hx + 14, hy + hs / 2 + 60 + i * 60]], 6, shade(M.wall, -0.2));
  });
  FX.lightCone(g, E.W / 2 + 120, E.H * 0.62, { angle: -Math.PI / 2, spread: 0.4, len: 620, color: M.key, a: 0.18 });
  glow(g, E.W / 2 + 120, E.H * 0.62, 80, M.key, 0.5);
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 260, y: GY, s: 1.5, facing: 1, outfit: LEXY,
      pose: breathe(POSES.pointUp, t), expr: 'worried', prop: 'flashlight',
      rim: { color: M.rim, dir: [0.4, -1] } });
  });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.4 });
} });

// s077b — UI: a smartphone screen showing a honeycomb graphic; a finger scrolls it upward.
registerShot('s077b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.4, x: -120, y: -80 }, {})); veil(g, '#120a10', 0.45);
  const M = mood('interiorCool');
  const px = E.W / 2 + 120, py = E.H * 0.5, pw = 380, ph = 600;
  const scroll = 60 * ease.inOut(prog(t, 0.3, info.dur - 0.3));
  g.save(); g.translate(20 * k, 0); g.rotate(0.012 * Math.sin(t * 0.8));
  FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: GOLD(), a: 0.28 }, (g, x, y, w, h) => {
    g.fillStyle = shade(M.wall, -0.5); g.fillRect(x, y, w, h);
    const hex = (cx, cy, r, fill) => {
      const pts = []; for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i + Math.PI / 6; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
      poly(g, pts, fill);
    };
    for (let row = 0; row < 5; row++) for (let col = 0; col < 4; col++) {
      const hx2 = x + 60 + col * 76 + (row % 2) * 38, hy2 = y + 70 + row * 66 - scroll;
      if (hy2 < y - 40 || hy2 > y + h + 40) continue;
      hex(hx2, hy2, 32, (row + col) % 3 === 0 ? alpha(GOLD(), 0.85) : alpha(BLUE(), 0.5));
      hex(hx2, hy2, 22, shade(M.dark, -0.2));
    }
    text(g, 'HONEYCOMB', x + w / 2, y + h - 34, { size: 26, color: CREAM(), font: FONTS.ui, weight: 900, spacing: 3 });
  });
  const fx = px + 110, fy = py + 60 - scroll * 0.6;
  seg(g, [[fx, fy + 120], [fx, fy + 10]], 22, S().ink);
  circle(g, fx, fy, 20, S().ink);
  g.restore();
  layer(g, { z: 1, x: 0, y: 0 }, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 430, y: E.H * 0.8, s: 1.25, facing: 1, outfit: LEXY,
      pose: breathe(POSES.phone, t), expr: 'thinking', prop: 'phone',
      rim: { color: M.rim, dir: [1, -0.4] } });
  });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });
