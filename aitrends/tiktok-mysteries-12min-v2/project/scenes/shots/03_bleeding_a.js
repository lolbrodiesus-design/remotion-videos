// shots/03_bleeding_a.js — Story 3 (Bleeding Wall): s064a–s070a.
// Lexy (green cap, LEXY) — black stick figures only, rim light on every lit figure.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, key, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, mix, poly, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { street } from '../sets/street.js';
import { LEXY } from '../cast.js';

// The red drip: S().ui.accent (coral red) from the style tokens, darkened for depth.
const red = () => S().ui.accent;
const redDark = () => shade(S().ui.accent, -0.45);
const GOLD = () => S().ui.gold;
const CREAM = () => S().ui.cream;
function dripTrail(g, x, y, len, w, a = 0.95) {
  if (len <= 2) return;
  g.save(); g.globalAlpha = a; g.fillStyle = red();
  g.beginPath(); g.moveTo(x - w / 2, y);
  g.bezierCurveTo(x - w, y + len * 0.4, x + w, y + len * 0.7, x - w * 0.2, y + len);
  g.bezierCurveTo(x + w * 0.6, y + len * 0.7, x + w / 2, y + len * 0.35, x + w / 2, y);
  g.fill(); g.restore();
  circle(g, x - w * 0.2, y + len, Math.max(2, w * 0.45), redDark());
}
// Medicine-cabinet geometry in bathroom set coordinates (landscape 1920x1080, GY=864).
const CAB = { x: E.W / 2 + 330, y: 864 - 470, w: 380, h: 300 };
const DRIPX = CAB.x + CAB.w * 0.3, DRIPY = CAB.y + CAB.h + 6;
const kOf = (t, info) => ease.inOut(clamp(t / info.dur));

// s064a — establishing: lone California bungalow under a deep indigo sky, warm window flickers on.
registerShot('s064a', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1 + 0.08 * k, x: -50 * k };
  street(g, t, cam, { variant: 'bungalow' });
  FX.fog(g, E.H * 0.72, 160, mood('night').fog, 0.22);
  FX.lensStreak(g, E.W / 2, E.H * 0.42, E.W * 0.9, mood('night').practical, 0.14);
  blurLayer(g, 10, (g) => {
    g.fillStyle = shade(mood('night').dark, -0.2);
    g.beginPath(); g.ellipse(E.W * 0.2, E.H + 40, 420, 90, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(E.W * 0.85, E.H + 60, 380, 80, 0, 0, 7); g.fill();
  }, cam, 1.7);
} });

// s064b — insert: a single thick dark-red globule beading under the medicine cabinet, starting to slide.
registerShot('s064b', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.75 + 0.3 * k, x: DRIPX - E.W / 2, y: (DRIPY + 90) - E.H / 2 + 30 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    const len = 40 + 190 * ease.inOut(prog(t, 0.4, info.dur - 0.2));
    dripTrail(g, DRIPX, DRIPY, len, 16);
    const beadR = 10 + 8 * ease.inOut(prog(t, 0, 0.9));
    circle(g, DRIPX, DRIPY + 4, beadR, red());
    circle(g, DRIPX - 3, DRIPY + 1, beadR * 0.35, alpha(CREAM(), 0.5));
  });
  FX.lensStreak(g, E.W / 2, E.H * 0.25, E.W, M.key, 0.1);
  FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
} });

// s065 — wide: Lexy walks toward camera down the hall, framed by cool blue moonlight.
registerShot('s065', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.02 + 0.03 * k, x: 30 * k, y: -20 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  const x = lerp(E.W / 2 + 430, E.W / 2 + 40, ease.inOut(prog(t, 0, info.dur)));
  const s = lerp(1.05, 1.35, ease.inOut(prog(t, 0, info.dur)));
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x, y: GY, s, facing: -1, outfit: LEXY,
      pose: walkPose(t * Math.PI * 2 * 0.9, {}), expr: 'neutral',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.1) > 3.0 });
  });
  FX.pool(g, E.W / 2 + 40, GY + 30, 300, 30, M.key, 0.12);
  FX.godRays(g, E.W * 0.78, E.H * 0.3, { count: 6, angle: Math.PI / 2, spread: 0.7, len: 900, a: 0.05, t });
} });

// s066a — insert: "College Counselor" nameplate on a dark wooden desk, dust in an amber beam.
registerShot('s066a', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.6, x: -150, y: -120 }, {})); veil(g, '#120a10', 0.45);
  const M = mood('interiorCool');
  const dx = E.W / 2, dy = E.H * 0.72;
  g.fillStyle = shade(M.wall, -0.55); g.fillRect(-E.W, dy, E.W * 3, E.H);
  FX.lightCone(g, E.W * 0.22, E.H * 0.1, { angle: Math.PI / 2.6, spread: 0.35, len: 900, color: M.practical, a: 0.12 });
  const mx = dx + 40 * k, my = dy - 90;
  rr(g, mx - 260, my - 52, 520, 104, 10); g.fillStyle = GOLD(); g.fill();
  rr(g, mx - 244, my - 40, 488, 80, 8); g.fillStyle = shade(M.dark, -0.1); g.fill();
  text(g, 'COLLEGE COUNSELOR', mx, my + 2, { size: 36, color: CREAM(), font: FONTS.ui, weight: 900, spacing: 2 });
  const moteX = lerp(E.W * 0.3, E.W * 0.55, prog(t, 0, info.dur)), moteY = E.H * 0.42 + Math.sin(t * 1.2) * 14;
  glow(g, moteX, moteY, 26, M.practical, 0.7); circle(g, moteX, moteY, 3, M.practical);
  FX.dust(g, t, { count: 24, color: '#ffe2bd', a: 0.35 });
} });

// s066b — medium: Lexy's hand holding a glowing phone, thumb hovering over the video icon.
registerShot('s066b', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.4, x: 120, y: -80 }, {})); veil(g, '#120a10', 0.4);
  const M = mood('interiorCool'), GY = E.H * V(0.8, 0.68);
  const pulse = 0.25 + 0.1 * Math.sin(t * 3);
  layer(g, { z: 1 + 0.04 * k, x: -30 * k, y: 20 * k }, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 330, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(POSES.phone, t), expr: 'focused', prop: 'phone',
      rim: { color: M.rim, dir: [1, -0.4] }, blink: (t % 3.3) > 3.2 });
  });
  const px = E.W / 2 + 260, py = E.H * 0.42, pw = 300, ph = 520;
  FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: M.practical, a: pulse }, (g, x, y, w, h) => {
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(x, y, w, h * 0.62);
    dripTrail(g, x + w * 0.35, y + 30, h * 0.4, 10, 0.9);
    poly(g, [[x + w * 0.5 - 22, y + h * 0.3], [x + w * 0.5 - 22, y + h * 0.3 + 64], [x + w * 0.5 + 34, y + h * 0.3 + 32]], CREAM());
    text(g, '@LEXYRAYE', x + w / 2, y + h - 40, { size: 30, color: CREAM(), font: FONTS.ui, weight: 900 });
  });
  const thumbY = py - 40 + Math.sin(t * 2) * 10;
  circle(g, px + 60, thumbY, 16, CREAM());
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });

// s067a — insert: the bottom edge of the silver medicine-cabinet frame; a thin red line creeps out.
registerShot('s067a', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.8 + 0.25 * k, x: DRIPX - E.W / 2, y: (CAB.y + CAB.h) - E.H / 2 };
  const { M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    seg(g, [[CAB.x, CAB.y + CAB.h], [CAB.x + CAB.w, CAB.y + CAB.h]], 4, alpha(M.key, 0.5));
    dripTrail(g, DRIPX, DRIPY, 130 * ease.inOut(prog(t, 0.2, info.dur - 0.1)), 6);
  });
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.3 });
  FX.godRays(g, E.W * 0.75, E.H * 0.2, { count: 5, angle: Math.PI / 2, spread: 0.5, len: 800, a: 0.04, t });
} });

// s067b — medium: Lexy leans in toward the drip at the cabinet corner; more red streaks appear.
registerShot('s067b', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.3 - 0.25 * k, x: -20 * k, y: -50 * (1 - k) };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    dripTrail(g, DRIPX, DRIPY, 150 + 60 * prog(t, 0.5, info.dur), 12);
    dripTrail(g, DRIPX + 70, DRIPY + 10, 90 * prog(t, 0.7, info.dur), 8);
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 220, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.5, 'reach']]), t), expr: 'worried',
      rim: { color: M.rim, dir: [1, -0.3] }, blink: (t % 3.1) > 3.0 });
  });
  blurLayer(g, 10, (g) => {
    rr(g, E.W - 220, E.H * 0.3, 160, 300, 12); g.fillStyle = shade(M.wall, -0.3); g.fill();
  }, cam, 1.7);
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.3 });
} });

// s068 — FACE CU 1 of 2: Lexy's face reflected in the mirror, obscured by a red streak.
registerShot('s068', { draw(g, t, info) {
  const k = kOf(t, info);
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.5, x: -150, y: -120 }, { drip: false })); veil(g, '#120a10', 0.4);
  const M = mood('interiorCool');
  const cx = E.W / 2 - 60 - 40 * k, cy = E.H * 0.58, r = 310 * (1 + 0.02 * k);
  rr(g, cx - r * 1.15, cy - r * 1.25, r * 2.3, r * 2.5, 18); g.strokeStyle = alpha(M.key, 0.35); g.lineWidth = 6; g.stroke();
  bigFace(g, cx, cy, r, { outfit: LEXY, expr: t < 0.9 ? 'surprised' : 'scared',
    look: [clamp(-0.4 + 0.5 * k, -1, 1), -0.1], rimColor: M.rim, rimSide: -1, blink: (t % 2.9) > 2.8 });
  seg(g, [[cx - r * 0.9, cy - r * 0.7], [cx + r * 0.7, cy + r * 0.5]], 16, alpha(red(), 0.6));
  circle(g, cx + r * 0.55, cy + r * 0.42, 10, red());
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s069 — medium: Lexy wipes the drip away with a white cloth, leaving a faint pink smear.
registerShot('s069', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.08, x: 40 * k, y: -10 * k };
  const { GY, M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    dripTrail(g, DRIPX, DRIPY, 60 * (1 - prog(t, 0.3, 1.8)), 10, 0.4);
    g.save(); g.globalAlpha = 0.14 * prog(t, 0.6, 2.2); g.fillStyle = red();
    g.beginPath(); g.ellipse(DRIPX, DRIPY + 90, 70, 46, 0.3, 0, 7); g.fill(); g.restore();
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 260, y: GY, s: 1.6, facing: 1, outfit: LEXY,
      pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'reach']]), t), expr: 'neutral',
      rim: { color: M.rim, dir: [1, -0.3] } });
    const wx = DRIPX + Math.cos(t * 4) * 42, wy = DRIPY + 80 + Math.sin(t * 4) * 30;
    circle(g, wx, wy, 26, CREAM());
    circle(g, wx - 8, wy - 8, 10, alpha(CREAM(), 0.7));
  });
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.3 });
} });

// s070a — insert: the same wall, now clean — a new thicker droplet beads up and pops out of the seam.
registerShot('s070a', { draw(g, t, info) {
  const k = kOf(t, info);
  const cam = { z: 1.9, x: DRIPX - E.W / 2, y: (DRIPY + 40) - E.H / 2 + 40 * k };
  const { M } = bathroom(g, t, cam, { drip: false });
  layer(g, cam, 0.55, (g) => {
    const pop = ease.outBack(prog(t, 0.8, 1.5));
    if (pop > 0) {
      circle(g, DRIPX, DRIPY + 4, 12 * pop, red());
      circle(g, DRIPX - 4, DRIPY, 4 * pop, alpha(CREAM(), 0.6));
      dripTrail(g, DRIPX, DRIPY + 10, 34 * prog(t, 1.4, info.dur), 7);
    }
    seg(g, [[CAB.x, CAB.y + CAB.h], [CAB.x + CAB.w, CAB.y + CAB.h]], 3, alpha(M.key, 0.4));
  });
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
  FX.lensStreak(g, E.W / 2, E.H * 0.3, E.W * 0.8, M.key, 0.08);
} });
