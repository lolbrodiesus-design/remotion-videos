// scenes/shots/v3.js — v3 REDESIGN scene engine (replaces the v2 kit).
// Every shot in story/shots.json carries params.v3 {comp, framing3, object,
// zone, cam, isFace, faceVariant} from Directors_Script_v3.md. This file
// registers a draw function for EVERY non-est3d shot, so it overrides
// generated.js / proof.js (it loads last alphabetically). The old kit code is
// archived in scenes/v2-kit-archived/ (copies; the originals stay as fallback
// base only — nothing in v3 renders through them).
// Design: each shot is a distinct composition — its own object in focus drawn
// large at its own anchor, its own zone/crop, its own camera move, its own
// palette tint, its own face variant. No small reusable kit is recombined.
// Code-drawn only, no AI images. Freeze shots (s043, s098) are the only
// intentional stills. Est3d shots are owned by est3d.js and skipped here.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, glow, alpha, shade, mix, text, measure, rr, seg, circle, ring, poly, linGrad, radGrad, rng, FONTS, backdrop } from '/engine/core.js';
import { drawFigure, POSES, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { basement } from '../sets/basement.js';
import { desert, cloakLine, cloakFigure, bicycle } from '../sets/desert.js';
import { office } from '../sets/office.js';
import { beach } from '../sets/beach.js';
import { roadside, van2D } from '../sets/roadside.js';
import { memorial } from '../sets/memorial.js';
import { SAMANTHA, JASON, LEXY, MERIDITH, SHAWNE, TEEN, GABBY, BRIAN } from '../cast.js';

const EST3D = new Set(['s038a', 's038b', 's092a', 's092b', 's150a', 's150b', 's178a', 's178b']);
const STORIES = [
  ['hartsoe', 0.0, 101.52, 'bathroom', SAMANTHA],
  ['cloaks', 101.52, 182.32, 'desert', JASON],
  ['bleeding', 182.32, 274.12, 'bathroom', LEXY],
  ['iowa', 274.12, 358.50, 'basement', MERIDITH],
  ['shawne', 358.50, 450.42, 'office', SHAWNE],
  ['suitcases', 450.42, 542.16, 'beach', TEEN],
  ['gabby', 542.16, 650.28, 'roadside', GABBY],
  ['outro', 650.28, 661.918, 'memorial', null],
];
const storyAt = (t) => STORIES.find(s => t >= s[1] && t < s[2]) || STORIES[STORIES.length - 1];
const PLAIN = { top: 'tshirt', color: '#3a3a48', head: 'none' };
const PLAIN2 = { top: 'hoodie', color: '#4a4450', head: 'none' };
const EXPR_MAP = { disgusted: 'nervous', calm: 'smile', smiling: 'smile', scared: 'scared', shocked: 'shocked', sad: 'sad', determined: 'determined', worried: 'worried', happy: 'happy', confused: 'confused', thinking: 'thinking', neutral: 'neutral', surprised: 'surprised', awe: 'awe' };
const exprOf = (sc) => { const m = sc.match(/\b(scared|shocked|sad|determined|smiling|disgusted|worried|calm|happy|confused|thinking|surprised|awe)\b/); return m ? (EXPR_MAP[m[1]] || 'neutral') : 'neutral'; };
const charOf = (sc) => {
  if (/samantha/i.test(sc)) return SAMANTHA; if (/lexy/i.test(sc)) return LEXY;
  if (/jason/i.test(sc)) return JASON; if (/meridith/i.test(sc)) return MERIDITH;
  if (/shawne/i.test(sc)) return SHAWNE; if (/teen/i.test(sc)) return TEEN;
  if (/gabby/i.test(sc)) return GABBY; if (/brian/i.test(sc)) return BRIAN; return null;
};
const SETFN = { bathroom, basement, desert, office, beach, roadside, memorial };
const seedOf = (shot) => { let h = 0; const s = shot.id || ''; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const TINTS = ['#0c0a14', '#0a1420', '#14101c', '#0a1a14', '#1a0a14', '#101826', '#120a0a', '#0a1418'];
const GLOWS = ['#cfe0ff', '#ffd9a0', '#9fd0ff', '#ffb0c0', '#b0ffd0', '#ffe6a0'];

// ---------- v3 camera: 8 distinct moves, larger amplitude than v2 ----------
function camFor(move, e, t) {
  switch (move) {
    case 'push-in': return { z: 1 + 0.32 * e, x: -34 + 46 * e };
    case 'pull-out': return { z: 1.34 - 0.34 * e, x: 24 - 54 * e };
    case 'pan-left': return { z: 1.14, x: 170 - 340 * e };
    case 'pan-right': return { z: 1.14, x: -170 + 340 * e };
    case 'tilt-down': return { z: 1.22, x: -60 + 120 * e, y: -70 + 140 * e };
    case 'tilt-up': return { z: 1.22, x: 60 - 120 * e, y: 70 - 140 * e };
    case 'orbit': return { z: 1.18, x: Math.sin(e * Math.PI) * 190 - 90, y: Math.sin(e * Math.PI * 2) * 30 };
    default: return { z: 1 + 0.2 * e, x: -120 + 240 * e, y: -40 + 80 * e }; // dolly-diagonal
  }
}
function applyCam(g, cam) {
  if (!cam) return;
  const cx = E.W / 2, cy = E.H / 2;
  g.translate(cx, cy); g.scale(cam.z || 1, cam.z || 1);
  g.translate(-cx + (cam.x || 0), -cy + (cam.y || 0));
}

// ---------- skin-tone face (v3 fix): the engine bigFace renders the head as a
// near-black disc (beanie + face merge, reads like a mask — the v2 proof flag).
// v3 draws its own face: skin, beanie/cap/headband, eyes, brows, mouth.
function drawSkinFace(g, cx, cy, r, o = {}) {
  const char = o.char || SAMANTHA, expr = o.expr || 'neutral';
  const rimC = o.rimColor || '#ffc68a', side = o.rimSide ?? 1;
  const look = o.look || [0, 0];
  g.save(); g.translate(cx, cy); if (o.tilt) g.rotate(o.tilt);
  g.fillStyle = char.color || '#f29ac0';
  g.beginPath(); g.ellipse(0, r * 1.7, r * 1.3, r * 0.85, 0, Math.PI, Math.PI * 2); g.fill();
  g.save(); g.beginPath(); g.arc(0, 0, r * 1.04, 0, Math.PI * 2); g.arc(side * r * 0.08, r * 0.02, r * 0.98, 0, Math.PI * 2, true); g.fillStyle = rimC; g.fill('evenodd'); g.restore();
  circle(g, 0, 0, r, '#eec39a');
  const hc = char.headColor || char.color || '#1b1b22';
  if (char.head === 'beanie') {
    g.fillStyle = '#1b1b22'; g.beginPath(); g.ellipse(0, -r * 0.42, r * 1.02, r * 0.62, 0, Math.PI, Math.PI * 2); g.fill();
    circle(g, 0, -r * 0.98, r * 0.22, '#6a6a72');
  } else if (char.head === 'cap') {
    g.fillStyle = hc; g.beginPath(); g.ellipse(0, -r * 0.45, r * 1.0, r * 0.55, 0, Math.PI, Math.PI * 2); g.fill();
    rr(g, -r * 0.2, -r * 0.62, r * 1.5, r * 0.22, r * 0.1); g.fillStyle = hc; g.fill();
  } else if (char.head === 'headband') {
    g.fillStyle = '#3a2a1a'; g.beginPath(); g.ellipse(0, -r * 0.5, r * 1.0, r * 0.5, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = hc; g.fillRect(-r, -r * 0.42, r * 2, r * 0.2);
  } else if (char.head === 'bun') {
    circle(g, 0, -r * 1.0, r * 0.3, hc);
    g.fillStyle = hc; g.beginPath(); g.ellipse(0, -r * 0.5, r * 1.0, r * 0.45, 0, Math.PI, Math.PI * 2); g.fill();
  } else if (char.head === 'ponytail') {
    g.fillStyle = hc; g.beginPath(); g.ellipse(0, -r * 0.5, r * 1.0, r * 0.5, 0, Math.PI, Math.PI * 2); g.fill();
    circle(g, r * 0.9, -r * 0.2, r * 0.22, hc);
  } else if (char.head === 'hood') {
    circle(g, 0, 0, r * 1.15, shade(hc, -0.1)); circle(g, 0, 0, r * 0.95, '#eec39a');
  } else {
    g.fillStyle = '#2a1a12'; g.beginPath(); g.ellipse(0, -r * 0.5, r * 1.0, r * 0.5, 0, Math.PI, Math.PI * 2); g.fill();
  }
  const ey = -r * 0.05, ex = r * 0.34, lookX = look[0] * r * 0.08, lookY = (look[1] || 0) * r * 0.05;
  if (o.blink) {
    seg(g, [[-ex - r * 0.14, ey], [-ex + r * 0.14, ey]], r * 0.05, '#1a1622');
    seg(g, [[ex - r * 0.14, ey], [ex + r * 0.14, ey]], r * 0.05, '#1a1622');
  } else {
    for (const sgn of [-1, 1]) {
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(sgn * ex, ey, r * 0.16, r * 0.19, 0, 0, Math.PI * 2); g.fill();
      circle(g, sgn * ex + lookX, ey + lookY, r * 0.085, '#1a1622');
      circle(g, sgn * ex + lookX + r * 0.03, ey + lookY - r * 0.03, r * 0.03, '#fff');
    }
  }
  const browY = -r * 0.32, tiltB = (expr === 'worried' || expr === 'scared') ? 0.35 : expr === 'determined' ? -0.3 : 0.12;
  for (const sgn of [-1, 1]) {
    g.strokeStyle = '#2a1a12'; g.lineWidth = r * 0.05; g.lineCap = 'round';
    g.beginPath(); g.moveTo(sgn * ex - r * 0.16, browY - sgn * tiltB * r * 0.4); g.lineTo(sgn * ex + r * 0.16, browY + sgn * tiltB * r * 0.4); g.stroke();
  }
  g.strokeStyle = '#7a3a2a'; g.lineWidth = r * 0.045; g.lineCap = 'round';
  if (expr === 'scared') { g.fillStyle = '#5a1a1a'; g.beginPath(); g.ellipse(0, r * 0.48, r * 0.14, r * 0.2, 0, 0, Math.PI * 2); g.fill(); }
  else if (expr === 'sad' || expr === 'worried') { g.beginPath(); g.arc(0, r * 0.62, r * 0.22, Math.PI * 1.15, Math.PI * 1.85); g.stroke(); }
  else if (expr === 'smile' || expr === 'happy') { g.beginPath(); g.arc(0, r * 0.32, r * 0.24, Math.PI * 0.15, Math.PI * 0.85); g.stroke(); }
  else seg(g, [[-r * 0.14, r * 0.48], [r * 0.14, r * 0.48]], r * 0.045, '#7a3a2a');
  g.restore();
}

// ---------- face variants: 8 genuinely different framings ----------
function drawFaceVariant(g, variant, char, expr, t, dur, sd) {
  const e = ease.inOut(t / dur), M = mood('dusk');
  const rim = (sd % 2 ? 1 : -1);
  const blink = (t % 3.1) > 3.0;
  const look = [0.5 * Math.sin(t * 0.55 + sd), 0];
  if (variant === 'front CU') {
    drawSkinFace(g, E.W / 2 + 16 * Math.sin(t * 0.5), E.H * 0.54, 300 + 40 * e,
      { char, expr, blink, look, rimColor: M.rim, rimSide: rim, tilt: -0.02 + 0.03 * Math.sin(t * 0.8) });
  } else if (variant === 'profile CU') {
    // face cropped at the frame edge, turned away — only half the face reads
    drawSkinFace(g, E.W * 0.9, E.H * 0.52, 330, { char, expr, blink, look: [-0.9, 0], rimColor: M.rim, rimSide: 1, tilt: 0.06 });
    g.fillStyle = 'rgba(6,6,12,.55)'; g.fillRect(0, 0, E.W * 0.42, E.H);
    glow(g, E.W * 0.9, E.H * 0.5, 300, M.rim, 0.25);
  } else if (variant === 'over-shoulder') {
    // big back-of-head silhouette foreground left, small face in mirror right
    drawFigure(g, { x: E.W * 0.24, y: E.H * 0.98, s: 2.6, facing: -1, outfit: char, pose: breathe(POSES.stand, t, 1, sd), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.3], w: 5 }, blink });
    rr(g, E.W * 0.62, E.H * 0.16, E.W * 0.3, E.H * 0.62, 10); g.fillStyle = '#2a2430'; g.fill();
    rr(g, E.W * 0.635, E.H * 0.19, E.W * 0.27, E.H * 0.56, 8); g.fillStyle = linGrad(g, E.W * 0.62, E.H * 0.16, E.W * 0.92, E.H * 0.78, ['#cfd8e2', '#7e90a8']); g.fill();
    drawSkinFace(g, E.W * 0.77, E.H * 0.47, 150, { char, expr, blink, look, rimColor: M.rim, rimSide: -rim, tilt: 0.03 });
  } else if (variant === 'reflection CU') {
    rr(g, E.W * 0.28, E.H * 0.1, E.W * 0.44, E.H * 0.8, 12); g.fillStyle = '#1c1826'; g.fill();
    rr(g, E.W * 0.3, E.H * 0.13, E.W * 0.4, E.H * 0.74, 10); g.fillStyle = linGrad(g, E.W * 0.3, E.H * 0.13, E.W * 0.7, E.H * 0.87, ['#b8c4d4', '#6a7a90']); g.fill();
    poly(g, [[E.W * 0.34, E.H * 0.87], [E.W * 0.46, E.H * 0.13], [E.W * 0.52, E.H * 0.13], [E.W * 0.4, E.H * 0.87]], 'rgba(255,255,255,.22)');
    drawSkinFace(g, E.W * 0.5 + 10 * Math.sin(t * 0.6), E.H * 0.5, 230 + 30 * e, { char, expr, blink, look, rimColor: '#9fd0ff', rimSide: rim, tilt: -0.04 });
  } else if (variant === 'silhouette') {
    // v3 fix: the old version was a floating black disc (head disconnected
    // from the shoulders, no neck, no beanie). A silhouette must read as a
    // PERSON in shadow: neck + shoulders connected to the head, beanie pom
    // on top, warm rim light on one side, faint pink hoodie edge, floor shadow.
    glow(g, E.W * 0.5, E.H * 0.42, 520, '#ffd9a0', 0.5);
    g.fillStyle = '#0a0810';
    g.beginPath(); g.ellipse(E.W * 0.5, E.H * 1.04, 440, 300, 0, Math.PI, Math.PI * 2); g.fill(); // shoulders, top edge meets the head
    g.fillRect(E.W * 0.5 - 78, E.H * 0.52, 156, 170); // neck, joins head to shoulders
    circle(g, E.W * 0.5, E.H * 0.44, 208, '#0a0810'); // head
    circle(g, E.W * 0.5, E.H * 0.44 - 208, 42, '#6a6a72'); // beanie pom, visible against the glow
    // warm rim crescent on one side of the head (thick arc, not a hairline ring)
    g.save(); g.strokeStyle = '#ffc68a'; g.lineWidth = 16; g.lineCap = 'round';
    g.beginPath(); g.arc(E.W * 0.5, E.H * 0.44, 208, rim > 0 ? -Math.PI * 0.55 : Math.PI * 0.45, rim > 0 ? Math.PI * 0.55 : Math.PI * 1.55); g.stroke(); g.restore();
    // faint pink hoodie edge along the rim-side shoulder
    g.save(); g.strokeStyle = alpha('#f29ac0', 0.4); g.lineWidth = 10; g.lineCap = 'round';
    g.beginPath(); g.arc(E.W * 0.5, E.H * 1.04, 420, rim > 0 ? -Math.PI * 0.75 : Math.PI * 1.25, rim > 0 ? -Math.PI * 0.25 : Math.PI * 1.75); g.stroke(); g.restore();
    g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); g.ellipse(E.W * 0.5, E.H * 0.99, 380, 40, 0, 0, Math.PI * 2); g.fill(); // floor shadow
  } else if (variant === 'hands-only') {
    const bob = Math.sin(t * 1.1) * 8;
    // two hands (rounded shapes) reaching into frame from below, object between
    g.fillStyle = '#e8c9a8';
    g.beginPath(); g.ellipse(E.W * 0.38, E.H * 0.78 + bob, 90, 130, -0.4, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(E.W * 0.62, E.H * 0.78 - bob, 90, 130, 0.4, 0, Math.PI * 2); g.fill();
    for (let i = 0; i < 4; i++) { rr(g, E.W * 0.34 + i * 26, E.H * 0.6 + bob - i * 6, 22, 90, 11); g.fillStyle = '#e8c9a8'; g.fill(); rr(g, E.W * 0.58 + i * 26, E.H * 0.6 - bob - i * 6, 22, 90, 11); g.fill(); }
    glow(g, E.W * 0.5, E.H * 0.62, 200, '#ffd9a0', 0.3);
  } else if (variant === 'back-of-head') {
    const hc = char.headColor || char.color || '#1b1b22';
    circle(g, E.W * 0.42, E.H * 0.46, 230, shade(hc, -0.1));
    g.fillStyle = char.color; g.beginPath(); g.ellipse(E.W * 0.42, E.H * 1.0, 430, 280, 0, Math.PI, Math.PI * 2); g.fill();
    glow(g, E.W * 0.62, E.H * 0.3, 260, '#cfe0ff', 0.35);
    FX.dust(g, t, { count: 20, color: '#cfe0ff', a: 0.3 });
  } else { // three-quarter CU
    drawSkinFace(g, E.W * 0.42 + 20 * e, E.H * 0.55, 260, { char, expr, blink, look: [0.7, 0], rimColor: M.rim, rimSide: -rim, tilt: 0.12 });
    g.fillStyle = 'rgba(6,6,12,.4)'; g.fillRect(E.W * 0.68, 0, E.W * 0.32, E.H);
  }
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
}

// ---------- v3 proof fixes (main agent, 2026-11-22) ----------
// (a) Small figures: the engine's drawFigure head is an ink disc with light
// features, which reads as a black disc at small scale. Overlay the skin
// face at the figure's head position so every figure reads as a person.
// (b) Insert shots: an object pasted large over the full bathroom wide reads
// as a floating slab. Insert branches paint their own full-frame local
// backdrop first, so the shot IS the insert, not a prop on a wide.
function drawFigureSkin(g, o) {
  drawFigure(g, o);
  const [hx, hy, hr] = headPos(o);
  const char = o.outfit || SAMANTHA;
  drawSkinFace(g, hx, hy, hr * 1.02, { char, expr: o.expr || 'neutral', blink: o.blink, look: o.look || [0, 0], rimColor: (o.rim && o.rim.color) || '#ffc68a', rimSide: 1 });
}
function insertBackdrop(g, t) {
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#14101f', '#0a0812']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
  for (let x = -E.W; x < E.W * 2; x += 140) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); }
  for (let y = 140; y < E.H; y += 140) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
  g.fillStyle = '#0c0a14'; g.fillRect(-E.W, E.H * 0.86, E.W * 3, E.H);
  seg(g, [[-E.W, E.H * 0.86], [E.W * 2, E.H * 0.86]], 3, 'rgba(0,0,0,.5)');
  FX.lightCone(g, E.W * 0.5, 0, { angle: Math.PI / 2, spread: 0.5, len: 700, color: '#cfe0ff', a: 0.1 });
  FX.dust(g, t, { count: 12, color: '#cfe0ff', a: 0.25 });
}

// ---------- distinct object in focus: one large prop per shot ----------
// Each branch draws a different shape / colour / position / motion. Anchors
// cycle left / centre / right by seed so even the same object type lands
// in a different place. Inspiration-object branches run FIRST (they would
// be swallowed by generic keywords). Fallback: set + light sweep only —
// NEVER a flat coloured shape (the v3-draft green-rectangle defect).
function drawObject(g, t, obj, sd, dur) {
  const o = (obj || '').toLowerCase();
  const ax = E.W * [0.3, 0.5, 0.7][sd % 3], ay = E.H * [0.46, 0.54, 0.62][(sd >> 2) % 3];
  const bob = Math.sin(t * 1.1 + sd) * 10, e = ease.inOut(t / dur);
  const has = (...ws) => ws.some(w => o.includes(w));
  // ---- v3 inspiration objects (INSPIRATION.md focal objects). These run
  // FIRST: generic keywords below ('door', 'mirror', 'window') would swallow
  // them with the wrong composition. Every branch draws a different large
  // prop / environment at its own anchor with its own motion. ----
  if (has('skyline', 'manhattan')) {
    FX.moon(g, E.W * 0.78, E.H * 0.16, 54);
    FX.stars(g, t, { seed: sd, count: 90, area: [0, 0, E.W, E.H * 0.5] });
    FX.skyline(g, { x: -40, y: E.H * 0.82, w: E.W + 80, seed: sd, minH: 140, maxH: 460, color: '#1c1630', lit: 0.45 });
    const wx = E.W * 0.56, wy = E.H * 0.52; // the one lit window the tilt lands on
    rr(g, wx - 26, wy - 34, 52, 68, 4); g.fillStyle = '#ffd59a'; g.fill();
    glow(g, wx, wy, 130 + 40 * Math.sin(t * 2), '#ffd59a', 0.55);
  } else if (has('beanie pom', 'pom bobbing', 'pom ')) {
    // macro of the pom itself: the shot IS the hat, on its own dark wall.
    insertBackdrop(g, t);
    const sway = Math.sin(t * 2.2) * 22, shiver = Math.sin(t * 9) * 3;
    const cx = E.W * 0.5 + sway, cy = E.H * 0.42 + shiver;
    // beanie crown below the pom, with a ribbed band, so it reads as a hat
    g.fillStyle = '#1b1b22'; g.beginPath(); g.ellipse(cx, cy + 150, 230, 120, 0, Math.PI, Math.PI * 2); g.fill();
    g.fillStyle = '#24242c'; g.fillRect(cx - 230, cy + 118, 460, 34);
    for (let i = 0; i < 9; i++) seg(g, [[cx - 200 + i * 50, cy + 118], [cx - 200 + i * 50, cy + 152]], 3, '#33333c');
    // the pom: a soft shaded ball with a few short stitches — never a ring of dots (that read as a gear)
    g.fillStyle = radGrad(g, cx - 40, cy - 50, 20, 150, ['#8a8a94', '#6a6a72', '#4a4a52']); g.beginPath(); g.arc(cx, cy, 140, 0, Math.PI * 2); g.fill();
    g.strokeStyle = alpha('#55555e', 0.7); g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { const a = -0.6 + i * 0.5; g.beginPath(); g.arc(cx, cy, 100, a, a + 0.35); g.stroke(); }
    circle(g, cx - 46, cy - 52, 26, alpha('#9a9aa4', 0.5));
    // shoulders at the bottom edge so the pom belongs to a person
    g.fillStyle = '#f29ac0'; g.beginPath(); g.ellipse(cx, E.H * 0.96, 340, 180, 0, Math.PI, Math.PI * 2); g.fill();
    // cold draught: thin wisps drifting past the pom
    for (let i = 0; i < 3; i++) { const fy = E.H * 0.28 + i * 130 + Math.sin(t * 1.4 + i * 2) * 12; g.fillStyle = alpha('#cfe0ff', 0.12 - i * 0.03); g.beginPath(); g.ellipse(cx + 330 + Math.sin(t + i) * 30, fy, 120 - i * 20, 16, 0.1 * i, 0, Math.PI * 2); g.fill(); }
  } else if (has('gap under', 'door gap', 'gap under a bathroom')) {
    // the shot IS the door: full-frame door, frame and handle; the cold
    // light spills from the gap at the bottom onto the floor, with mist.
    g.fillStyle = '#2a2028'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); // hallway wall
    const dx0 = E.W * 0.22, dx1 = E.W * 0.78, dy1 = E.H * 0.82;
    rr(g, dx0, -40, dx1 - dx0, dy1 + 40, 8); g.fillStyle = '#3a2a36'; g.fill(); // door
    g.strokeStyle = '#241a26'; g.lineWidth = 4; rr(g, dx0 + 60, 80, dx1 - dx0 - 120, 300, 6); g.stroke(); // upper panel
    rr(g, dx0 + 60, 460, dx1 - dx0 - 120, 220, 6); g.stroke(); // lower panel
    circle(g, dx1 - 90, E.H * 0.52, 16, '#8d97a3'); // handle
    // the gap: bright cold band under the door, light pooling on the floor
    g.fillStyle = linGrad(g, 0, dy1, 0, dy1 + 90, ['rgba(159,208,255,.9)', 'rgba(159,208,255,0)']); g.fillRect(dx0, dy1, dx1 - dx0, 90);
    g.fillStyle = '#0c0a14'; g.fillRect(-E.W, dy1 + 90, E.W * 3, E.H); // floor
    FX.fog(g, dy1 + 150, 120, '#9fd0ff', 0.35);
    for (let i = 0; i < 5; i++) { const mx = dx0 + 60 + ((t * 50 + i * 220) % (dx1 - dx0 - 120)); g.fillStyle = alpha('#9fd0ff', 0.3); g.beginPath(); g.ellipse(mx, dy1 + 170 + Math.sin(t * 1.2 + i) * 12, 150, 30, 0, 0, Math.PI * 2); g.fill(); }
  } else if (has('kitchen table', 'table with three chairs', 'three chairs')) {
    const flick = 0.75 + 0.25 * Math.sin(t * 7 + Math.sin(t * 13));
    // three people seated at the table (Samantha in the middle) — real
    // figures, not floating head-blobs; the table slab covers their laps.
    const sitters = [[-260, PLAIN, 1, -0.06], [0, SAMANTHA, 1, 0], [260, PLAIN2, -1, 0.06]];
    sitters.forEach(([hx, outf, fc, rot], i) => {
      drawFigureSkin(g, { x: ax + hx, y: ay + 90, s: 1.1, facing: fc, outfit: outf, pose: breathe(POSES.sit, t, 1, sd + i), expr: i === 1 ? 'worried' : 'neutral', look: [0, 0], rim: { color: '#ffc68a', dir: [0, -1], w: 3 }, blink: (t % 3.1) > 3.0, rot });
    });
    rr(g, ax - 420, ay + 40, 840, 60, 10); g.fillStyle = '#5a3a2a'; g.fill(); // table slab
    for (const dx of [-300, 0, 300]) { seg(g, [[ax + dx - 40, ay + 100], [ax + dx - 40, ay + 300]], 12, '#3a2a1a'); seg(g, [[ax + dx + 40, ay + 100], [ax + dx + 40, ay + 300]], 12, '#3a2a1a'); }
    rr(g, ax + 150 - 16, ay - 60, 32, 100, 6); g.fillStyle = '#efe8d8'; g.fill(); // candle, between the middle and right sitters
    glow(g, ax + 150, ay - 84, 90 * flick, '#ffd59a', 0.8); circle(g, ax + 150, ay - 84, 14 * flick, '#ffd59a');
    glow(g, ax + 150, ay - 40, 320, '#ffd59a', 0.12 * flick);
  } else if (has('shivering', 'shivering arms', 'shivering stick')) {
    // the figure fills the frame, hugging herself; small vibration marks
    // hug the arms (they are not floating letters) and her breath puffs.
    insertBackdrop(g, t);
    const figO = { x: E.W * 0.5, y: E.H * 0.86, s: 1.9, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.crossArms, t, 1, sd), expr: 'worried', look: [0, 0], rim: { color: '#ffc68a', dir: [1, -0.3], w: 4 }, blink: (t % 3.1) > 3.0 };
    drawFigureSkin(g, figO);
    const [hx, hy, hr] = headPos(figO);
    g.strokeStyle = alpha('#9fd0ff', 0.85); g.lineWidth = 4; // small jagged marks close to the arms
    for (const [jx, jy] of [[hx - 85, hy + 140], [hx + 85, hy + 140], [hx - 75, hy + 215], [hx + 75, hy + 215]]) {
      g.beginPath(); g.moveTo(jx - 18, jy);
      for (let k = 0; k < 5; k++) g.lineTo(jx - 18 + k * 9, jy + (k % 2 ? -8 : 8) + Math.sin(t * 11 + k) * 3);
      g.stroke();
    }
    // cold breath puff at the mouth, growing and fading
    const puff = 0.5 + 0.5 * Math.sin(t * 1.5);
    g.fillStyle = alpha('#dfe8ff', 0.35 * puff);
    g.beginPath(); g.ellipse(hx + 34, hy + hr * 0.55, 22 + 14 * puff, 12 + 8 * puff, 0, 0, Math.PI * 2); g.fill();
  } else if (has('blank corner', 'corner of the ceiling', 'ceiling corner')) {
    // the shot IS the corner: ceiling plane above, two wall planes meeting
    // at a vertical seam, the dashed vent outline on the ceiling, dust
    // motes circling where a vent should be. No bathroom set behind it.
    g.fillStyle = '#0a0818'; g.fillRect(0, 0, E.W, E.H * 0.46); // ceiling
    g.fillStyle = '#1d1828'; g.fillRect(0, E.H * 0.46, E.W * 0.62, E.H * 0.54); // left wall
    g.fillStyle = '#241e33'; g.fillRect(E.W * 0.62, E.H * 0.46, E.W * 0.38, E.H * 0.54); // right wall, slightly lighter
    seg(g, [[E.W * 0.62, E.H * 0.46], [E.W * 0.62, E.H * 2]], 5, 'rgba(0,0,0,.55)'); // vertical seam
    seg(g, [[-E.W, E.H * 0.46], [E.W * 2, E.H * 0.46]], 4, 'rgba(0,0,0,.5)'); // ceiling line
    seg(g, [[-E.W, E.H * 0.46 + 6], [E.W * 2, E.H * 0.46 + 6]], 2, 'rgba(207,224,255,.14)');
    const cx = E.W * 0.5, cy = E.H * 0.24; // the empty rectangle where a vent should be
    g.strokeStyle = alpha('#8fb8e8', 0.5); g.lineWidth = 3;
    g.save(); g.setLineDash([14, 10]); g.strokeRect(cx - 200, cy - 110, 400, 220); g.restore();
    ring(g, cx, cy, 190, 3, alpha('#cfe0ff', 0.35)); // dust motes swirling in a tight circle
    for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2 + t * 1.6; circle(g, cx + Math.cos(a) * 190, cy + Math.sin(a) * 190, 4 + (i % 3) * 2, alpha('#dfe8ff', 0.8)); }
    ring(g, cx, cy, 85, 3, alpha('#cfe0ff', 0.3));
    FX.lightCone(g, E.W * 0.8, 0, { angle: Math.PI / 2, spread: 0.4, len: 500, color: '#cfe0ff', a: 0.08 });
  } else if (has('cupped hand', 'hand behind an ear', 'cupped hand behind')) {
    // a listening head, so the ear belongs to someone: skin face in
    // three-quarter, the ear ON the head, the cupped hand behind it — all
    // at believable scale, none of them a floating giant.
    insertBackdrop(g, t);
    const drift = Math.sin(t * 0.9) * 10;
    const hx = E.W * 0.56 + drift, hy = E.H * 0.46;
    drawSkinFace(g, hx, hy, 170, { char: SAMANTHA, expr: 'worried', blink: (t % 3.1) > 3.0, look: [0.6, 0], rimColor: '#ffc68a', rimSide: 1, tilt: 0.05 });
    // the ear, on the head's edge
    g.fillStyle = '#eec39a'; g.beginPath(); g.ellipse(hx + 132, hy - 8, 46, 66, 0.15, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#b98a5e'; g.lineWidth = 5; g.beginPath(); g.arc(hx + 132, hy - 8, 28, -Math.PI * 0.4, Math.PI * 0.6); g.stroke();
    g.beginPath(); g.arc(hx + 132, hy - 8, 13, -Math.PI * 0.3, Math.PI * 0.5); g.stroke();
    // cupped hand behind the ear: 4 distinct finger capsules, palm, thumb
    g.fillStyle = '#e8c9a8';
    for (let i = 0; i < 4; i++) { rr(g, hx + 152 + i * 22, hy - 88 - i * 4, 18, 76, 9); g.fill(); }
    g.beginPath(); g.ellipse(hx + 188, hy + 12, 58, 74, -0.3, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#b98a5e'; g.lineWidth = 6; g.beginPath(); g.arc(hx + 132, hy + 42, 36, Math.PI * 0.6, Math.PI * 1.4); g.stroke();
    glow(g, hx, hy, 220, '#ffd9a0', 0.2);
  } else if (has('sink area', 'bathroom sink')) {
    // the mirror is OFF the wall (the set draws the dark hole where it was):
    // it leans, tilted, beside the hole while her raised hand stays on its
    // bottom corner. The set's own sink is the sink — no second basin.
    const lift = e * 24;
    const mirrorCX = ax, mirrorCY = 380 - lift;
    drawFigureSkin(g, { x: ax, y: E.H * 0.8, s: 1.5, facing: -1, outfit: SAMANTHA, pose: breathe(POSES.reach, t, 1, sd), expr: 'worried', look: [0, -0.4], rim: { color: '#cfe0ff', dir: [0, -1], w: 4 }, blink: (t % 3.1) > 3.0 });
    g.save(); g.translate(mirrorCX, mirrorCY); g.rotate(-0.1 - e * 0.03);
    rr(g, -210, -150, 420, 300, 10); g.fillStyle = '#1c1826'; g.fill();
    rr(g, -195, -135, 390, 270, 8); g.fillStyle = linGrad(g, -195, -135, 195, 135, ['#cfd8e2', '#7e90a8']); g.fill();
    poly(g, [[-165, 135], [-85, -135], [-45, -135], [-125, 135]], 'rgba(255,255,255,.28)');
    g.restore();
    glow(g, mirrorCX, mirrorCY, 200, '#cfe0ff', 0.2);
    // contact glow where her fingertips meet the mirror's bottom corner
    glow(g, ax - 93, E.H * 0.8 - 306, 60, '#cfe0ff', 0.5);
  } else if (has('drywall', 'jagged')) {
    g.fillStyle = '#05040a'; g.fillRect(ax - 300, ay - 260, 600, 520); // pitch-black void
    g.strokeStyle = '#8a6a5a'; g.lineWidth = 10; g.lineJoin = 'round'; // jagged drywall edges
    g.beginPath();
    const jag = [[-300, -260], [-180, -300], [-60, -240], [80, -300], [220, -250], [300, -280], [320, -120], [280, 40], [320, 200], [240, 260], [80, 230], [-60, 270], [-200, 240], [-300, 260], [-330, 80], [-290, -80]];
    jag.forEach(([jx, jy], i) => { i ? g.lineTo(ax + jx, ay + jy) : g.moveTo(ax + jx, ay + jy); });
    g.closePath(); g.stroke();
    FX.lightCone(g, ax, ay - 100, { angle: Math.PI / 2, spread: 0.45, len: 520, color: '#cfe0ff', a: 0.22 });
    for (let i = 0; i < 8; i++) { const r = rng(i + sd); circle(g, ax - 260 + r() * 520, ay - 240 + r() * 480, 2 + r() * 4, alpha('#8a6a5a', 0.6)); } // crumbled plaster dust
  } else if (has('passageway', 'hidden passage', 'hallway')) {
    g.fillStyle = '#0a0a1e'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = '#0d0d22'; g.fillRect(0, E.H * 0.8, E.W, E.H * 0.2); // floor band so the bottom is not pure void
    const vx = E.W * 0.5, vy = E.H * 0.42; // vanishing point, centred
    for (let k = 0; k < 4; k++) { const s = 1 - k * 0.2, w = 700 * s, h = 520 * s; // receding door frames, larger
      g.strokeStyle = alpha('#3a3a5e', 0.9 - k * 0.18); g.lineWidth = 10 - k * 2;
      g.strokeRect(vx - w / 2, vy - h / 2, w, h);
    }
    seg(g, [[vx - 700, E.H * 0.95], [vx - 70, vy + 50]], 4, '#2a2a48'); seg(g, [[vx + 700, E.H * 0.95], [vx + 70, vy + 50]], 4, '#2a2a48');
    glow(g, vx, vy, 280, '#9fd0ff', 0.5 + 0.1 * Math.sin(t * 1.5)); // light at the end
    circle(g, vx, vy, 30, '#cfe0ff');
    FX.dust(g, t, { count: 18, color: '#9fd0ff', a: 0.3 });
  } else if (has('apartment building', 'building exterior', 'three-story')) {
    FX.facade(g, { x: E.W * 0.16, y: E.H * 0.96, w: E.W * 0.68, h: E.H * 0.82, cols: 3, rows: 3, lit: 0.5, seed: sd, door: true, color: '#241c30', win: '#ffcf8a' });
    const wx = E.W * 0.5, wy = E.H * 0.42; // middle-floor amber window the zoom lands on
    glow(g, wx, wy, 150 + 30 * Math.sin(t * 2), '#ffd59a', 0.5);
    FX.lampPost(g, E.W * 0.88, E.H * 0.96, 300, {});
    FX.floorLines(g, E.H * 0.96, E.H, 'rgba(0,0,0,.35)');
  } else if (has('mirror macro', 'mirror')) {
    // the shot IS the mirror surface: glass fills the frame, a jagged crack
    // runs down it, and cold cyan light leaks along the crack — never a
    // straight cyan bar.
    rr(g, -40, -40, E.W + 80, E.H + 80, 12); g.fillStyle = '#1c1826'; g.fill();
    rr(g, -20, -20, E.W + 40, E.H + 40, 10); g.fillStyle = linGrad(g, 0, 0, E.W, E.H, ['#cfd8e2', '#7e90a8']); g.fill();
    poly(g, [[E.W * 0.2, E.H], [E.W * 0.32, 0], [E.W * 0.38, 0], [E.W * 0.26, E.H]], 'rgba(255,255,255,.28)');
    const crackX = E.W * 0.68;
    const crackPath = () => { g.beginPath(); g.moveTo(crackX, 0); for (let k = 0; k < 8; k++) g.lineTo(crackX + (k % 2 ? 26 : -22) + Math.sin(k * 2.4) * 10, (k + 1) * E.H / 8); };
    g.strokeStyle = '#14101c'; g.lineWidth = 7; g.lineJoin = 'round'; crackPath(); g.stroke();
    g.strokeStyle = alpha('#4dd0e1', 0.75); g.lineWidth = 3; crackPath(); g.stroke();
    glow(g, crackX, E.H * 0.5, 200, '#4dd0e1', 0.25);
    g.fillStyle = alpha('#4dd0e1', 0.8); g.beginPath(); g.ellipse(crackX + 10, E.H * 0.92, 14, 26, 0, 0, Math.PI * 2); g.fill();
  } else if (has('thermostat', 'dial')) {
    circle(g, ax, ay, 190, '#2a2a34'); ring(g, ax, ay, 190, 10, '#e8e2d4'); ring(g, ax, ay, 150, 4, '#5a6470');
    const ang = -2 + e * 3.4; seg(g, [[ax, ay], [ax + Math.cos(ang) * 130, ay + Math.sin(ang) * 130]], 10, '#ff8a3a');
    circle(g, ax, ay, 16, '#ff8a3a'); glow(g, ax, ay, 220, '#ff8a3a', 0.2);
    // diegetic digits: the numbers flicker and drop 70 → 62 in a pulse
    const temp = Math.round(lerp(70, 62, e));
    text(g, String(temp) + '°', ax, ay + 120, { size: 72, color: (t % 0.5) < 0.35 ? '#e8e2d4' : '#ff8a3a', font: FONTS.ui, weight: 900 });
  } else if (has('radiator')) {
    for (let i = 0; i < 7; i++) { rr(g, ax - 280 + i * 80, ay - 180, 56, 360, 12); g.fillStyle = i % 2 ? '#5a6470' : '#3a4450'; g.fill(); }
    glow(g, ax, ay, 320, '#ff8a3a', 0.14 + 0.1 * Math.sin(t * 2));
  } else if (has('frost', 'window')) {
    rr(g, ax - 300, ay - 260, 600, 520, 8); g.fillStyle = '#8fa8c8'; g.fill();
    for (let i = 0; i < 26; i++) { const r = rng(i + sd); circle(g, ax - 280 + r() * 560, ay - 240 + r() * 480, 8 + r() * 26, alpha('#e8f0ff', 0.35 + r() * 0.4)); }
    FX.moon(g, ax + 140, ay - 140, 52);
  } else if (has('towel')) {
    rr(g, ax - 200, ay - 260, 400, 520, 10); g.fillStyle = '#f29ac0'; g.fill();
    for (let i = 0; i < 6; i++) seg(g, [[ax - 200, ay - 200 + i * 80], [ax + 200, ay - 200 + i * 80]], 4, alpha('#d67aa8', 0.6));
    seg(g, [[ax - 200, ay - 260], [ax + 200, ay - 260]], 14, '#8a5a6a');
  } else if (has('drip', 'sink drip', 'red drip')) {
    g.fillStyle = '#a01818';
    g.beginPath(); g.moveTo(ax - 40, ay - 260); g.bezierCurveTo(ax - 90, ay - 60, ax + 80, ay + 80, ax - 10, ay + 300 + e * 40);
    g.bezierCurveTo(ax + 40, ay + 80, ax + 90, ay - 60, ax + 40, ay - 260); g.fill();
    circle(g, ax - 10, ay + 308 + e * 40, 20, '#a01818'); glow(g, ax, ay, 240, '#a01818', 0.2);
  } else if (has('door ajar', 'hallway door', 'metal door', 'door')) {
    FX.door(g, { x: ax - 140, y: ay + 240, w: 280, h: 480, color: '#3a2a36', open: 0.25 + 0.2 * e, light: '#cfe0ff' });
  } else if (has('hammer')) {
    g.save(); g.translate(ax, ay + bob); g.rotate(-0.5 + 0.08 * Math.sin(t * 1.4));
    rr(g, -26, -260, 52, 420, 10); g.fillStyle = '#6a4a2a'; g.fill();
    rr(g, -150, -300, 300, 90, 14); g.fillStyle = '#8d97a3'; g.fill(); g.restore();
    glow(g, ax, ay - 200, 180, '#cfe0ff', 0.2);
  } else if (has('headlamp', 'beam')) {
    circle(g, ax, ay, 60, '#2a2a34'); ring(g, ax, ay, 60, 6, '#e8e2d4');
    FX.lightCone(g, ax, ay, { angle: 0.5, spread: 0.55, len: 900, color: '#fff2c8', a: 0.3 });
    glow(g, ax, ay, 160, '#fff2c8', 0.6);
  } else if (has('brick', 'hole')) {
    for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) { rr(g, ax - 280 + c * 112 + (r % 2) * 30, ay - 240 + r * 96, 104, 88, 4); g.fillStyle = (r + c) % 2 ? '#7a4a3a' : '#8a5a4a'; g.fill(); }
    g.fillStyle = '#05040a'; g.beginPath(); g.ellipse(ax, ay, 200, 170, 0, 0, Math.PI * 2); g.fill();
    FX.lightCone(g, ax, ay, { angle: Math.PI / 2, spread: 0.5, len: 500, color: '#cfe0ff', a: 0.2 });
  } else if (has('pipe')) {
    for (let i = 0; i < 3; i++) { seg(g, [[ax - 300, ay - 200 + i * 160], [ax + 300, ay - 200 + i * 160]], 34, '#5a6470'); circle(g, ax + 300, ay - 200 + i * 160, 26, '#3a4450'); }
    glow(g, ax, ay, 260, '#9fd0ff', 0.15);
  } else if (has('cobweb')) {
    g.strokeStyle = 'rgba(230,235,245,.6)'; g.lineWidth = 2;
    for (let i = 0; i < 7; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(ax, ay - 220); g.lineTo(ax + Math.cos(a) * 320, ay - 220 + Math.sin(a) * 320); g.stroke(); }
    for (let r = 1; r < 4; r++) { g.beginPath(); g.arc(ax, ay - 220, r * 80, 0, Math.PI / 2); g.stroke(); }
  } else if (has('trash')) {
    for (let i = 0; i < 3; i++) { const bx = ax - 180 + i * 170; g.fillStyle = '#1c1c26'; g.beginPath(); g.moveTo(bx - 90, ay + 160); g.lineTo(bx - 70, ay - 120 + bob * (i % 2 ? 1 : -1)); g.lineTo(bx + 70, ay - 120); g.lineTo(bx + 90, ay + 160); g.closePath(); g.fill(); seg(g, [[bx - 70, ay - 120], [bx, ay - 170], [bx + 70, ay - 120]], 8, '#1c1c26'); }
  } else if (has('bottle')) {
    rr(g, ax - 60, ay - 120, 120, 300, 30); g.fillStyle = '#3a6a8a'; g.fill();
    rr(g, ax - 30, ay - 200, 60, 90, 12); g.fillStyle = '#2a4a62'; g.fill();
    rr(g, ax - 60, ay - 40, 120, 90, 8); g.fillStyle = '#e8e2d4'; g.fill();
    glow(g, ax, ay, 200, '#9fd0ff', 0.2);
  } else if (has('calendar')) {
    rr(g, ax - 240, ay - 220, 480, 440, 10); g.fillStyle = '#efe8d8'; g.fill();
    for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++) { rr(g, ax - 200 + c * 86, ay - 140 + r * 86, 66, 66, 6); g.fillStyle = (r * 5 + c === 12) ? '#c94a3a' : '#d8d0bc'; g.fill(); }
    seg(g, [[ax - 240, ay - 60], [ax + 240, ay - 60]], 4, '#b8a888');
  } else if (has('stud', 'scaffold', 'plaster')) {
    for (let i = 0; i < 5; i++) { rr(g, ax - 280 + i * 120, ay - 260, 46, 520, 4); g.fillStyle = '#8a6a4a'; g.fill(); }
    rr(g, ax - 280, ay - 40, 560, 90, 6); g.fillStyle = '#efe8d8'; g.fill();
    for (let i = 0; i < 10; i++) { const r = rng(i + sd); circle(g, ax - 260 + r() * 520, ay - 200 + r() * 400, 3 + r() * 5, alpha('#fff', 0.5)); }
  } else if (has('sofa')) {
    rr(g, ax - 320, ay - 60, 640, 200, 30); g.fillStyle = '#5a3a5a'; g.fill();
    rr(g, ax - 320, ay - 220, 640, 180, 30); g.fillStyle = '#6a4a6a'; g.fill();
    for (const dx of [-200, 0, 200]) { rr(g, ax + dx - 80, ay - 200, 160, 140, 20); g.fillStyle = '#7a5a7a'; g.fill(); }
  } else if (has('lamp', 'floor lamp')) {
    seg(g, [[ax, ay + 260], [ax, ay - 260]], 10, '#2a2230');
    poly(g, [[ax - 110, ay - 260], [ax + 110, ay - 260], [ax + 60, ay - 380], [ax - 60, ay - 380]], '#ffd59a');
    glow(g, ax, ay - 300, 220, '#ffd59a', 0.5); FX.lightCone(g, ax, ay - 300, { angle: Math.PI / 2, spread: 0.7, len: 560, color: '#ffd59a', a: 0.2 });
  } else if (has('switch', 'light switch')) {
    // the switch on its wall, at wall scale, with a sliver of the mirror's
    // edge for place-continuity; the hand has a forearm entering from the
    // frame edge — it is never a floating blob.
    insertBackdrop(g, t);
    rr(g, -40, E.H * 0.2, 180, E.H * 0.55, 8); g.fillStyle = '#2a2430'; g.fill();
    rr(g, -30, E.H * 0.2 + 10, 160, E.H * 0.55 - 20, 6); g.fillStyle = linGrad(g, 0, E.H * 0.2, 160, E.H * 0.75, ['#cfd8e2', '#7e90a8']); g.fill();
    const px = E.W * 0.62, py = E.H * 0.48;
    rr(g, px - 95, py - 155, 190, 310, 12); g.fillStyle = '#e8e2d4'; g.fill();
    rr(g, px - 42, py - 95 + e * 110, 84, 110, 10); g.fillStyle = '#b8b0a0'; g.fill();
    glow(g, px, py, 140, (t % 1.4) < 0.7 ? '#ffd59a' : '#cfe0ff', 0.2);
    // a hand WITH a forearm entering from the right edge to flip it — it
    // starts off-frame right and ends ON the switch.
    const hx = E.W * 0.98 - e * (E.W * 0.98 - px), hy = py + 10 + e * 60;
    g.fillStyle = '#e8c9a8';
    g.save(); g.translate(hx, hy); g.rotate(0.25); rr(g, 0, -26, 280, 52, 26); g.fill(); g.restore(); // forearm to the frame edge
    g.beginPath(); g.ellipse(hx - 30, hy, 48, 62, -0.3, 0, Math.PI * 2); g.fill(); // palm
    for (let i = 0; i < 4; i++) { rr(g, hx - 66 + i * 18, hy - 92 - i * 3, 15, 56, 8); g.fillStyle = '#e8c9a8'; g.fill(); }
    if (e > 0.45) glow(g, px, py, 320, '#ffd59a', 0.5 * (e - 0.45) * 2);
  } else if (has('cabinet', 'slot', 'razor')) {
    rr(g, ax - 260, ay - 260, 520, 520, 10); g.fillStyle = '#3a3440'; g.fill();
    rr(g, ax - 220, ay - 220, 440, 440, 8); g.fillStyle = '#8d97a3'; g.fill();
    rr(g, ax - 40, ay - 100, 80, 26, 6); g.fillStyle = '#14101c'; g.fill();
    for (let i = 0; i < 5; i++) seg(g, [[ax - 160, ay + 60 + i * 50], [ax + 160, ay + 76 + i * 50]], 5, '#c96a2a');
  } else if (has('rust', 'condensation', 'crystal')) {
    for (let i = 0; i < 22; i++) { const r = rng(i + sd); circle(g, ax - 260 + r() * 520, ay - 220 + r() * 440, 14 + r() * 44, alpha('#c96a2a', 0.4 + r() * 0.5)); }
    for (let i = 0; i < 14; i++) { const r = rng(i + 40 + sd); circle(g, ax - 240 + r() * 480, ay - 200 + r() * 400, 4 + r() * 8, alpha('#cfe0ff', 0.5 + r() * 0.5)); }
  } else if (has('wrench')) {
    g.save(); g.translate(ax, ay); g.rotate(0.6 + 0.1 * Math.sin(t));
    seg(g, [[-160, 0], [120, 0]], 34, '#8d97a3'); circle(g, 170, 0, 70, '#8d97a3'); circle(g, 170, 0, 40, '#0c0a14'); g.restore();
  } else if (has('hatch', 'attic')) {
    rr(g, ax - 260, ay - 240, 520, 480, 8); g.fillStyle = '#2a2230'; g.fill();
    seg(g, [[ax - 200, ay - 160], [ax - 200, ay + 160]], 10, '#5a4a3a'); seg(g, [[ax - 100, ay - 160], [ax - 100, ay + 160]], 10, '#5a4a3a');
    glow(g, ax, ay + 100, 200, '#ffd59a', 0.2);
  } else if (has('bulb', 'hanging bulb')) {
    seg(g, [[ax, ay - 320], [ax, ay - 180]], 6, '#1c1826');
    circle(g, ax, ay - 120, 70, '#ffd59a'); glow(g, ax, ay - 120, 260, '#ffd59a', 0.5 + 0.2 * Math.sin(t * 3));
    FX.lightCone(g, ax, ay - 120, { angle: Math.PI / 2, spread: 0.8, len: 600, color: '#ffd59a', a: 0.22 });
  } else if (has('drain')) {
    circle(g, ax, ay + 120, 110, '#1a1622'); ring(g, ax, ay + 120, 110, 8, '#3a3440'); ring(g, ax, ay + 120, 70, 5, '#3a3440'); ring(g, ax, ay + 120, 34, 5, '#3a3440');
    glow(g, ax, ay + 120, 160, '#9fd0ff', 0.2);
  } else if (has('carpet')) {
    g.save(); g.translate(ax, ay); g.rotate(-0.2 + 0.02 * Math.sin(t));
    rr(g, -320, -90, 640, 180, 90); g.fillStyle = '#7a3a3a'; g.fill();
    rr(g, -320, -90, 640, 60, 30); g.fillStyle = '#8a4a4a'; g.fill(); g.restore();
  } else if (has('sliding')) {
    rr(g, ax - 280, ay - 260, 560, 520, 6); g.fillStyle = '#4a3a2a'; g.fill();
    seg(g, [[ax - 20 + e * 160, ay - 260], [ax - 20 + e * 160, ay + 260]], 12, '#0c0a14');
    glow(g, ax + e * 160, ay, 200, '#cfe0ff', 0.25);
  } else if (has('file', 'report', 'stamp', 'certificate', 'poster')) {
    rr(g, ax - 200, ay - 260, 400, 520, 6); g.fillStyle = '#efe8d8'; g.fill();
    g.fillStyle = '#1a1622'; g.fillRect(ax - 160, ay - 210, 320, 14); g.fillRect(ax - 160, ay - 170, 240, 10); g.fillRect(ax - 160, ay - 140, 280, 10);
    rr(g, ax - 160, ay + 60, 220, 60, 6); g.fillStyle = '#c94a3a'; g.fill();
    text(g, '1980', ax, ay + 180, { size: 56, color: '#5a4a3a', font: FONTS.ui, weight: 900 });
  } else if (has('photo', 'album', 'board')) {
    rr(g, ax - 260, ay - 240, 520, 480, 8); g.fillStyle = '#e8e2d4'; g.fill();
    g.fillStyle = '#c9a06a'; g.fillRect(ax - 220, ay - 200, 440, 300);
    circle(g, ax, ay - 60, 80, '#8d8496'); rr(g, ax - 120, ay + 40, 240, 90, 20); g.fillStyle = '#8d8496'; g.fill();
    if (has('board')) { g.strokeStyle = '#c94a3a'; g.lineWidth = 5; seg(g, [[ax - 200, ay - 60], [ax + 200, ay - 60]], 5, '#c94a3a'); }
  } else if (has('clock')) {
    FX.clock(g, ax, ay, 170, t, {});
  } else if (has('blinds')) {
    for (let i = 0; i < 9; i++) { rr(g, ax - 300, ay - 260 + i * 58, 600, 34, 4); g.fillStyle = i % 2 ? '#3a3440' : '#2a2430'; g.fill(); }
    glow(g, ax, ay, 260, '#ff9a5a', 0.15);
  } else if (has('suitcase')) {
    rr(g, ax - 180, ay - 200, 360, 320, 20); g.fillStyle = '#14101c'; g.fill();
    rr(g, ax - 180, ay - 200, 360, 320, 20); g.strokeStyle = '#3a3440'; g.lineWidth = 8; g.stroke();
    seg(g, [[ax - 180, ay - 40], [ax + 180, ay - 40]], 8, '#3a3440');
    glow(g, ax, ay, 220, '#7fd0d6', 0.15);
  } else if (has('van', 'seat', 'headlight', 'plate')) {
    van2D(g, ax, ay + 140, 1.4, { headlights: true });
    glow(g, ax, ay + 140, 260, '#ffd59a', 0.2);
  } else if (has('bicycle', 'rider')) {
    cloakFigure(g, ax - 160, ay + 200, 1.1, t, { seed: 8 }); bicycle(g, ax + 120, ay + 200, 1.2, t);
  } else if (has('cloak', 'hood', 'statue')) {
    cloakLine(g, ax, ay + 220, 0.7, t);
  } else if (has('phone')) {
    FX.screen(g, { x: ax - 150, y: ay - 280, w: 300, h: 560, glowC: '#7fd0d6' }, (gg, x, y, w, h) => {
      gg.fillStyle = '#101826'; gg.fillRect(x, y, w, h);
      circle(gg, x + w / 2, y + h * 0.3, 44, '#2a3a55');
      gg.fillStyle = '#e8e2d4'; gg.fillRect(x + 30, y + h * 0.55, w - 60, 12); gg.fillRect(x + 30, y + h * 0.55 + 28, w - 110, 10);
    });
  } else if (has('map', 'pin', 'satellite')) {
    g.strokeStyle = 'rgba(160,200,255,.8)'; g.lineWidth = 6;
    for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(ax - 320, ay - 200 + i * 130); g.bezierCurveTo(ax - 100, ay - 240 + i * 130, ax + 100, ay - 160 + i * 130, ax + 320, ay - 200 + i * 130); g.stroke(); }
    circle(g, ax + 60, ay - 40, 18, '#ff6f61'); ring(g, ax + 60, ay - 40, 34 + (t * 30 % 34), 4, alpha('#ff6f61', 0.7));
  } else if (has('laptop')) {
    FX.screen(g, { x: ax - 320, y: ay - 260, w: 640, h: 420, glowC: '#7fd0d6' }, (gg, x, y, w, h) => {
      gg.fillStyle = '#2a3a4a'; gg.fillRect(x, y, w, h); gg.fillStyle = '#c9a06a'; gg.fillRect(x, y + h * 0.55, w, h * 0.45);
      ring(gg, x + w * 0.5, y + h * 0.3, 30 + (t * 20 % 30), 3, alpha('#ff6f61', 0.7));
    });
    rr(g, ax - 360, ay + 160, 720, 26, 8); g.fillStyle = '#1c1826'; g.fill();
  } else if (has('envelope', 'dna')) {
    rr(g, ax - 220, ay - 140, 440, 280, 8); g.fillStyle = '#d8cfae'; g.fill();
    seg(g, [[ax - 220, ay - 140], [ax, ay], [ax + 220, ay - 140]], 3, '#a89a72');
    seg(g, [[ax - 220, ay + 140], [ax, ay], [ax + 220, ay + 140]], 3, '#a89a72');
  } else if (has('candle', 'memorial')) {
    for (let i = 0; i < 5; i++) { const cx = ax - 240 + i * 120; rr(g, cx - 26, ay - 60, 52, 220, 8); g.fillStyle = '#efe8d8'; g.fill(); glow(g, cx, ay - 90, 60, '#ffd59a', 0.6 + 0.2 * Math.sin(t * 3 + i)); circle(g, cx, ay - 90, 12, '#ffd59a'); }
  } else if (has('dune', 'sand', 'desert', 'mountain', 'haze', 'sun', 'shadow')) {
    FX.sun(g, ax + 200, ay - 180, 70);
    FX.hills(g, { seed: sd, y: ay + 200, amp: 90, color: '#2a2440' });
    FX.dust(g, t, { count: 30, color: '#ffd9b0', a: 0.35 });
  } else if (has('wave', 'tide', 'pier', 'shoreline')) {
    for (let i = 0; i < 4; i++) { const yy = ay + 80 + i * 70; g.strokeStyle = alpha('#7fd0d6', 0.5 + 0.2 * Math.sin(t + i)); g.lineWidth = 8; g.beginPath(); g.moveTo(ax - 340, yy); g.bezierCurveTo(ax - 100, yy - 30 + 20 * Math.sin(t * 1.5 + i), ax + 100, yy + 30, ax + 340, yy); g.stroke(); }
  } else {
    // SAFE fallback (v3 fix): the old fallback drew a big flat coloured
    // shape (green rectangle) that dominated the frame. No shot may ever
    // fall back to a flat shape. Instead: the set stays visible, a strong
    // diagonal light sweep crosses the frame, dust drifts, and a small
    // warm window of light anchors the composition. Nothing flat, nothing
    // coloured, nothing that can read as a prop.
    FX.lightCone(g, E.W * [0.25, 0.5, 0.75][sd % 3], -40, { angle: Math.PI / 2 + 0.35, spread: 0.6, len: 1100, color: '#cfe0ff', a: 0.16 });
    FX.lightCone(g, E.W * [0.75, 0.5, 0.25][sd % 3], E.H + 40, { angle: -Math.PI / 2 - 0.35, spread: 0.5, len: 900, color: '#ffd59a', a: 0.1 });
    const wx = E.W * [0.3, 0.5, 0.7][sd % 3], wy = E.H * 0.4;
    rr(g, wx - 90, wy - 120, 180, 240, 6); g.fillStyle = '#1c1826'; g.fill();
    rr(g, wx - 78, wy - 108, 156, 216, 4); g.fillStyle = linGrad(g, wx - 78, wy - 108, wx + 78, wy + 108, ['#2a3048', '#141826']); g.fill();
    glow(g, wx, wy, 160, '#9fd0ff', 0.25);
    g.fillStyle = 'rgba(0,0,0,.4)'; g.beginPath(); g.ellipse(E.W / 2, E.H * 0.92, 420, 36, 0, 0, Math.PI * 2); g.fill();
  }
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.25 });
}

// ---------- blueprint / phone UI / freeze / endscreen (v3 layouts) ----------
function drawBlueprint(g, t, info, sd) {
  const dur = info.dur, p = ease.inOut(t / dur), bp = info;
  const fmtM = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : String(Math.round(v));
  const goff = (t * 12) % 64;
  g.fillStyle = '#0A192F'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  g.strokeStyle = 'rgba(143,184,232,.16)'; g.lineWidth = 1;
  for (let x = -64 + goff; x < E.W + 64; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H); g.stroke(); }
  for (let y = -64 + goff; y < E.H + 64; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
  const ox = (sd % 3 - 1) * 120, oy = ((sd >> 2) % 3 - 1) * 60; // layout offset per shot
  g.save(); g.translate(ox, oy);
  if (bp.bpMode === 'graph') {
    const x0 = E.W * 0.14, x1 = E.W * 0.86, y0 = E.H * 0.78, y1 = E.H * 0.26;
    const pt = (u) => [lerp(x0, x1, u), lerp(y0, y1, Math.pow(u, 1.25))];
    seg(g, [[x0, y0], [x1, y0]], 3, 'rgba(143,184,232,.5)'); seg(g, [[x0, y0], [x0, y1]], 3, 'rgba(143,184,232,.5)');
    g.strokeStyle = '#8fb8e8'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 120; i++) { const [cx, cy] = pt((i / 120) * p); i ? g.lineTo(cx, cy) : g.moveTo(cx, cy); }
    g.stroke();
    const [hx, hy] = pt(p); glow(g, hx, hy, 70, '#8fb8e8', 0.9);
    (bp.bpNodes || []).forEach((nv) => { const u = nv / (bp.bpTo || 1); if (p < u) return; const [nx, ny] = pt(u); const na = clamp((p - u) / 0.08); glow(g, nx, ny, 46, '#8fb8e8', 0.8 * na); circle(g, nx, ny, 10, '#e8f0ff'); ring(g, nx, ny, 18 + 6 * Math.sin(t * 3), 3, alpha('#e8f0ff', 0.8 * na)); text(g, fmtM(nv), nx, ny - 44, { size: 30, color: '#e8f0ff', font: FONTS.ui, weight: 900, alpha: na }); });
    text(g, fmtM((bp.bpTo || 0) * p) + ' VIEWS', E.W / 2, E.H * 0.14, { size: 64, color: '#e8f0ff', font: FONTS.ui, weight: 900, glow: 24, glowColor: 'rgba(143,184,232,.7)' });
  } else if (bp.bpMode === 'bar') {
    const x0 = E.W * 0.16, bw = E.W * 0.68, by = E.H * 0.5;
    rr(g, x0, by - 34, bw, 68, 34); g.fillStyle = 'rgba(143,184,232,.15)'; g.fill();
    rr(g, x0, by - 34, Math.max(68, bw * p), 68, 34); g.fillStyle = '#8fb8e8'; g.fill();
    glow(g, x0 + bw * p, by, 60, '#8fb8e8', 0.8);
    text(g, `${Math.round(560 * p)} MONTHS`, E.W / 2, E.H * 0.32, { size: 72, color: '#e8f0ff', font: FONTS.ui, weight: 900, glow: 24, glowColor: 'rgba(143,184,232,.7)' });
    if (p > 0.7) text(g, bp.bpSub || '', E.W / 2, E.H * 0.68, { size: 52, color: '#ffd47e', font: FONTS.ui, weight: 900, alpha: clamp((p - 0.7) / 0.2) });
  } else if (bp.bpMode === 'razor') {
    g.strokeStyle = '#8fb8e8'; g.lineWidth = 3; rr(g, E.W * 0.4, E.H * 0.28, 120, 420, 6); g.stroke();
    const n = Math.floor(p * 6);
    for (let i = 0; i < n; i++) { const y = E.H * 0.35 + i * 55; seg(g, [[E.W * 0.44, y], [E.W * 0.56, y + 14]], 4, '#8fb8e8'); }
    text(g, 'RAZOR SLOT', E.W / 2, E.H * 0.84, { size: 44, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
  } else if (bp.bpMode === 'razor-empty') {
    g.strokeStyle = '#8fb8e8'; g.lineWidth = 3; rr(g, E.W * 0.4, E.H * 0.28, 120, 420, 6); g.stroke();
    text(g, 'NO RAZORS', E.W / 2, E.H * 0.5, { size: 72, color: (t % 1) < 0.5 ? '#ff6f61' : '#8a93a6', font: FONTS.ui, weight: 900 });
  } else if (bp.bpMode === 'tree') {
    [[0.3, 0.3], [0.62, 0.3], [0.46, 0.62]].forEach(([bx, by], i) => { if (p < (i + 1) / 3) return; g.strokeStyle = '#8fb8e8'; g.lineWidth = 3; rr(g, E.W * bx - 90, E.H * by - 40, 180, 80, 6); g.stroke(); glow(g, E.W * bx, E.H * by, 40, '#8fb8e8', 0.6); });
    if (p > 0.33) seg(g, [[E.W * 0.39, E.H * 0.3], [E.W * 0.46, E.H * 0.62]], 3, '#8fb8e8');
    if (p > 0.66) seg(g, [[E.W * 0.71, E.H * 0.3], [E.W * 0.52, E.H * 0.62]], 3, '#8fb8e8');
    text(g, '1980', E.W / 2, E.H * 0.84, { size: 48, color: '#8fb8e8', font: FONTS.ui, weight: 800 });
  } else { // drip
    g.strokeStyle = '#8fb8e8'; g.lineWidth = 3; rr(g, E.W * 0.32, E.H * 0.2, E.W * 0.36, E.H * 0.6, 6); g.stroke();
    const dy = E.H * 0.24 + p * E.H * 0.5;
    g.strokeStyle = '#e04a3a'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath();
    g.moveTo(E.W * 0.5, E.H * 0.24); g.bezierCurveTo(E.W * 0.46, E.H * 0.4, E.W * 0.54, E.H * 0.5, E.W * 0.5, dy); g.stroke();
    glow(g, E.W * 0.5, dy, 60, '#e04a3a', 0.8); circle(g, E.W * 0.5, dy, 10, '#e04a3a');
    text(g, 'RUST', E.W / 2, E.H * 0.88, { size: 44, color: '#e04a3a', font: FONTS.ui, weight: 800 });
  }
  g.restore();
}

function drawPhoneUI(g, t, info, sd) {
  const shot = info.shot, dur = info.dur, e = ease.inOut(t / dur);
  const st = storyAt(shot.start);
  const { GY } = (SETFN[shot.set || st[3]] || bathroom)(g, t, { z: 1.1, x: 0 }, {});
  void GY;
  veil(g, '#0c0a14', 0.4);
  const mode = info.uiMode || 'feed';
  const px = E.W * [0.36, 0.5, 0.64][sd % 3], py = E.H * 0.52; // phone anchor varies per shot
  const pw = V(430, 470), ph = V(740, 820);
  const tilt = 0.03 * Math.sin(t * 0.6 + sd);
  const fmtM = (v) => v >= 1e6 ? (v / 1e6).toFixed(1) + 'M' : v >= 1e3 ? (v / 1e3).toFixed(1) + 'K' : String(Math.max(0, Math.round(v)));
  g.save(); g.translate(px, py); g.rotate(tilt); g.scale(1 + 0.05 * e, 1 + 0.05 * e); g.translate(-px, -py);
  rr(g, px - pw / 2 - 16, py - ph / 2 - 16, pw + 32, ph + 32, 46); g.fillStyle = '#0c0c12'; g.fill();
  rr(g, px - pw / 2 - 16, py - ph / 2 - 16, pw + 32, ph + 32, 46); g.strokeStyle = '#3a3a48'; g.lineWidth = 3; g.stroke();
  FX.screen(g, { x: px - pw / 2, y: py - ph / 2, w: pw, h: ph, glowC: '#7fd0d6' }, (gg, x, y, w, h) => {
    if (mode === 'map') {
      gg.fillStyle = '#1a2a3a'; gg.fillRect(x, y, w, h);
      gg.strokeStyle = 'rgba(160,200,255,.7)'; gg.lineWidth = 5;
      for (let i = 0; i < 4; i++) { gg.beginPath(); gg.moveTo(x, y + h * (0.2 + i * 0.2)); gg.bezierCurveTo(x + w * 0.4, y + h * (0.15 + i * 0.2), x + w * 0.6, y + h * (0.3 + i * 0.2), x + w, y + h * (0.2 + i * 0.2)); gg.stroke(); }
      circle(gg, x + w * 0.55, y + h * 0.45, 14, '#ff6f61'); ring(gg, x + w * 0.55, y + h * 0.45, 26 + (t * 30 % 26), 3, alpha('#ff6f61', 0.7));
      text(gg, info.uiLabel || 'MAP', x + w / 2, y + 44, { size: 24, color: '#9fd0ff', font: FONTS.ui, weight: 900 });
    } else if (mode === 'call') {
      gg.fillStyle = '#101826'; gg.fillRect(x, y, w, h);
      circle(gg, x + w / 2, y + h * 0.3, 60, '#2a3a55'); circle(gg, x + w / 2, y + h * 0.3 - 14, 26, '#e8e2d4');
      text(gg, info.uiLabel || 'LANDLORD', x + w / 2, y + h * 0.52, { size: 34, color: '#fff', font: FONTS.ui, weight: 900 });
      const rp = (t * 0.9) % 1; ring(gg, x + w / 2, y + h * 0.3, 70 + rp * 90, 3, alpha('#3fb950', 0.8 * (1 - rp)));
      text(gg, 'CALLING…', x + w / 2, y + h * 0.6, { size: 26, color: '#3fb950', font: FONTS.ui, weight: 800 });
    } else if (mode === 'dial') {
      gg.fillStyle = '#101826'; gg.fillRect(x, y, w, h);
      text(gg, info.uiLabel || 'FBI TIP LINE', x + w / 2, y + 60, { size: 30, color: '#fff', font: FONTS.ui, weight: 900 });
      text(gg, `00:${String(Math.floor(t)).padStart(2, '0')}`, x + w / 2, y + 130, { size: 44, color: '#9fd0ff', font: FONTS.ui, weight: 900 });
      for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) { circle(gg, x + w * (0.22 + c * 0.28), y + h * (0.32 + r * 0.14), 26, '#2a3a55'); text(gg, String(r * 3 + c + 1), x + w * (0.22 + c * 0.28), y + h * (0.32 + r * 0.14) + 2, { size: 26, color: '#fff', font: FONTS.ui, weight: 800 }); }
    } else if (mode === 'record') {
      gg.fillStyle = linGrad(gg, 0, y, 0, y + h, ['#3d3360', '#8a5a86', '#e8956b']); gg.fillRect(x, y, w, h);
      gg.fillStyle = '#6a5138'; gg.fillRect(x, y + h * 0.68, w, h * 0.32);
      van2D(gg, x + w / 2, y + h * 0.72, 0.55);
      if ((t % 1) < 0.6) circle(gg, x + 36, y + 36, 12, '#e0302a');
      text(gg, 'REC', x + 62, y + 38, { size: 26, color: '#fff', font: FONTS.ui, weight: 900, align: 'left' });
    } else {
      gg.fillStyle = '#14101c'; gg.fillRect(x, y, w, h);
      const off = (t * 40) % (h / 3);
      for (let r = -1; r < 4; r++) for (let c = 0; c < 3; c++) {
        const cw = w / 3 - 10, ch = h / 3 - 10, cx0 = x + 5 + c * (w / 3), cy0 = y + 5 + r * (h / 3) - off;
        gg.fillStyle = ['#3a2a52', '#8a5a6a', '#2a4a6a', '#5a3a5a', '#6a4a3a', '#3a5a4a', '#4a3a6a', '#7a5a3a', '#2a3a52'][(r * 3 + c + 9) % 9];
        gg.fillRect(cx0, cy0, cw, ch);
        poly(gg, [[cx0 + cw / 2 - 8, cy0 + ch / 2 - 12], [cx0 + cw / 2 - 8, cy0 + ch / 2 + 12], [cx0 + cw / 2 + 12, cy0 + ch / 2]], '#fff');
      }
    }
    if (mode === 'feed' || mode === 'map' || mode === 'record') {
      const stripY = y + h - 96;
      gg.fillStyle = 'rgba(8,8,14,.72)'; gg.fillRect(x, stripY, w, 96);
      if (info.uiTo) text(gg, fmtM(info.uiTo * e) + ' VIEWS', x + w / 2, stripY + 30, { size: 34, color: '#ffd47e', font: FONTS.ui, weight: 900 });
      const hearts = Math.max(0, Math.floor(12400 * e + 340 * Math.sin(t * 3)));
      text(gg, '♥ ' + fmtM(hearts), x + w / 2, stripY + 72, { size: 26, color: '#fff', font: FONTS.ui, weight: 800 });
    }
  });
  for (let i = 0; i < 5; i++) {
    const hy = py + ph / 2 - ((t * 60 + i * 140) % (ph + 100));
    const hx = px + pw / 2 + 52 + Math.sin(t * 2 + i) * 8;
    const ha = clamp(1 - ((t * 60 + i * 140) % (ph + 100)) / (ph + 100));
    circle(g, hx - 7, hy - 4, 8, alpha('#ff5a7a', 0.9 * ha)); circle(g, hx + 7, hy - 4, 8, alpha('#ff5a7a', 0.9 * ha));
    poly(g, [[hx - 14, hy], [hx + 14, hy], [hx, hy + 14]], alpha('#ff5a7a', 0.9 * ha));
  }
  g.restore();
}

// ---------- main v3 draw ----------
function drawV3(g, t, info) {
  const shot = info.shot, dur = info.dur, v3 = info.v3 || {};
  const sd = seedOf(shot), sc = shot.scene || '';
  const objFull = v3.object_full || v3.object || ''; // full Gemini focal — keyword matching uses this, not the truncated cell
  const st = storyAt(shot.start);
  const set = shot.set || st[3];
  const char = charOf(sc) || st[4];
  const expr = exprOf(sc + ' ' + objFull);
  if (sc.startsWith('blueprintgraph:')) { drawBlueprint(g, t, info, sd); return; }
  if (sc.startsWith('phoneui:')) { drawPhoneUI(g, t, info, sd); return; }
  if (sc.startsWith('FREEZE:')) {
    const setFn = SETFN[set] || bathroom;
    const { GY, CX } = setFn(g, t, { z: 1.02, x: 0 }, {});
    if (set === 'desert') cloakLine(g, CX, GY, 0.7, t, { still: true });
    veil(g, '#9fd0ff', 0.12);
    for (let i = 0; i < 14; i++) { const r = rng(i + 40); circle(g, E.W * r(), E.H * (0.15 + r() * 0.6), 3 + r() * 4, alpha('#dfe8ff', 0.5)); }
    UI.badge(g, { str: 'STILL', x: E.W - V(110, 90), y: V(210, 240), color: S().ui.gold, size: V(38, 44) });
    return;
  }
  if (sc.startsWith('END SCREEN:')) {
    const setFn = SETFN[set] || memorial;
    setFn(g, t, { z: 1.05 + 0.08 * ease.inOut(t / dur), x: -30 + 60 * ease.inOut(t / dur) }, {});
    if (/question/i.test(sc)) UI.bigLine(g, t, { str: 'Which one scared you the most?', dur, y: E.H * 0.3, size: V(64, 58), color: S().ui.cream });
    const cast = [SAMANTHA, JASON, LEXY, MERIDITH, SHAWNE, TEEN, GABBY, BRIAN];
    cast.forEach((c, i) => { const x = E.W * (0.14 + i * 0.105); drawFigure(g, { x, y: E.H - V(90, 120), s: 0.62, facing: 1, outfit: c, pose: breathe(POSES.stand, t, 1, i + 1), expr: 'neutral', rim: { color: '#ffc68a', dir: [0, -1], w: 3 }, blink: ((t + i) % 3.4) > 3.3, alpha: c === BRIAN ? 0.85 : 1 }); });
    rr(g, E.W / 2 - 150, E.H * 0.52 - 30, 300, 60, 30); g.fillStyle = '#c94a3a'; g.fill();
    text(g, 'SUBSCRIBE', E.W / 2, E.H * 0.52 + 8, { size: 28, color: '#fff', font: FONTS.ui, weight: 900 });
    return;
  }
  if (sc.startsWith('comment bubbles')) {
    const setFn = SETFN[set] || bathroom;
    const { GY, CX } = setFn(g, t, camFor(v3.cam || 'push-in', ease.inOut(t / dur), t), {});
    if (set === 'desert') cloakLine(g, CX, GY, 0.7, t);
    const bubbles = (sc.match(/[A-Z][A-Z ?]+/g) || ['CULT?']).slice(0, 3);
    bubbles.forEach((b, i) => {
      const y = E.H * 0.3 - ((t * 30 + i * 90) % 120), a = clamp(1 - ((t * 30 + i * 90) % 120) / 120);
      const bw = measure(g, b, 30, FONTS.ui, 900) + 60, bx = E.W * (0.22 + i * 0.3);
      rr(g, bx - bw / 2, y - 34, bw, 68, 34); g.fillStyle = alpha('#fff1dc', 0.92 * a); g.fill();
      text(g, b, bx, y + 8, { size: 30, color: '#1a1622', font: FONTS.ui, weight: 900, alpha: a });
    });
    return;
  }
  if (sc.startsWith('quick cuts:')) {
    const segN = Math.min(2, Math.floor(t / (dur / 3)));
    const cams = [{ z: 1.25, x: -120 }, { z: 1.5, x: 80 }, { z: 1.15, x: -40 }];
    (SETFN[set] || bathroom)(g, t, cams[segN], { drip: set === 'bathroom' });
    drawObject(g, t, ['mould test kit', 'plumber wrench', 'attic hatch'][segN], sd + segN, dur);
    if (Math.abs((t % (dur / 3))) < 0.12) veil(g, '#fff', 0.25);
    return;
  }
  if (sc.startsWith('data card:')) {
    const setFn = SETFN[set] || bathroom;
    const { GY, CX } = setFn(g, t, camFor(v3.cam || 'push-in', ease.inOut(t / dur), t), {});
    if (set === 'desert') cloakLine(g, CX, GY, 0.7, t);
    const m = sc.match(/data card:\s*(.+?)(?:\s+pops in gold|\s*,\s*gold|$)/i);
    UI.bigLine(g, t, { str: (m ? m[1].trim() : 'MILLION VIEWS'), dur, y: E.H * 0.36, size: V(84, 76), color: S().ui.gold });
    return;
  }
  // ---- generic v3 composition ----
  const e = ease.inOut(t / dur);
  const cam = camFor(v3.cam || 'push-in', e, t);
  const setFn = SETFN[set] || bathroom;
  const setOpts = { wisps: false, drip: /drip/i.test(objFull) || /drip/i.test(sc), mirrorOff: /mirror macro/i.test(objFull) || /sink area|bathroom sink/i.test(objFull) };
  // location backdrop override: exterior shots (skyline, building) must NOT
  // sit on the bathroom set — paint their own night environment instead.
  const locBg = /skyline|manhattan/i.test(objFull) ? 'sky' : /apartment building|building exterior|three-story/i.test(objFull) ? 'street' : null;
  let ground = null;
  g.save();
  if (locBg) {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0a1226', '#05070f']); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    if (locBg === 'street') { g.fillStyle = '#0c0a12'; g.fillRect(-E.W, E.H * 0.96, E.W * 3, E.H); }
    ground = { GY: E.H * 0.96 };
  } else if (v3.isFace) {
    blurLayer(g, 10, (gg) => { ground = setFn(gg, t, cam, setOpts); });
  } else {
    ground = setFn(g, t, cam, setOpts);
  }
  g.restore();
  // per-shot palette tint (never the same two shots in a row: seed varies)
  veil(g, TINTS[sd % TINTS.length], 0.08 + (sd % 3) * 0.04);
  const glowC = GLOWS[sd % GLOWS.length];
  FX.lightCone(g, E.W * [0.3, 0.5, 0.7][sd % 3], E.H * 0.2, { angle: Math.PI / 2, spread: 0.5, len: 600, color: glowC, a: 0.12 });
  const GY = ground && ground.GY ? ground.GY : E.H * 0.8;
  if (v3.isFace && char) {
    drawFaceVariant(g, v3.faceVariant || 'front CU', char, expr || 'worried', t, dur, sd);
  } else {
    // distinct object in focus, large, at its own anchor
    drawObject(g, t, objFull || 'generic', sd, dur);
    // figure only where the scene calls for one — NOT when the object itself
    // is a body part / silhouette (arms, hand, ear, eyes, pom, lifting
    // silhouette): the object branch already carries the figure, a second
    // full-body figure would double it.
    const bodyPartObj = /arm|hand|ear|eye|pom|silhouette|face|sink|table|chair/i.test(objFull);
    const needsFig = !bodyPartObj && /samantha|lexy|jason|meridith|shawne|teen|gabby|brian|couple|officer|husband|brother|roommate/i.test(sc);
    if (needsFig && char) {
      const fx = [0.3, 0.5, 0.7][(sd >> 1) % 3];
      const fs = 0.95 + (sd % 3) * 0.18;
      const swayX = Math.sin(t * 0.9 + sd * 1.7) * 8;
      drawFigureSkin(g, { x: E.W * fx + swayX, y: GY, s: fs, facing: (sd % 2 ? 1 : -1), outfit: char, pose: breathe(POSES.stand, t, 1, sd), expr: expr || 'neutral', look: [0.5 * Math.sin(t * 0.55 + sd * 2.1), 0], rim: { color: glowC, dir: [1, -0.3], w: 4 }, blink: (t % 3.1) > 3.0 });
    }
  }
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.28 });
}

for (const s of E.shots) {
  if (EST3D.has(s.id)) continue;
  registerShot(s.id, { draw(g, t, info) { drawV3(g, t, info); } });
}
