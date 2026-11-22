// shots/04_iowa_c.js — Story 4 (Iowa): s107–s115. The killer theories, the police
// arrive, and Meredith's look upstairs.
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { basement } from '../sets/basement.js';
import { MERIDITH } from '../cast.js';

const HUSBAND = { top: 'tshirt', color: '#5a5a6a', head: 'cap', headColor: '#3a6ea5' }; // grey tee, blue cap
function officer(M) { return { top: 'tshirt', color: shade(M.wall, -0.4), head: 'cap', headColor: shade(M.wall, -0.65) }; }

// s107 — "People said it was a room where a serial killer took his victims."
// Insert: a sharp wall hook glinting under the amber light; the light strobes
// between quick cuts (0.6 s each) as the camera pans past its point.
// FIX: the hook is now a smooth J on a mounting plate against a visible wall,
// with its own shadow — a recognisable metal hook, not a lightning squiggle.
registerShot('s107', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 12, (g) => basement(g, t, { z: 1.9 - 0.1 * k, x: -160 + 220 * k, y: -320 })); veil(g, '#0a0a14', 0.38);
  const M = mood('night');
  const hx = E.W * 0.48, hy = E.H * 0.42;
  // the wall behind the hook: flat block wall with a horizontal seam
  g.fillStyle = linGrad(g, 0, E.H * 0.1, 0, E.H * 0.8, [shade(M.wall, -0.2), shade(M.wall, -0.5)]); g.fillRect(0, E.H * 0.08, E.W, E.H * 0.72);
  seg(g, [[0, hy - 210], [E.W, hy - 210]], 3, alpha(S().ink, 0.35));
  seg(g, [[0, hy + 130], [E.W, hy + 130]], 3, alpha(S().ink, 0.35));
  FX.lightCone(g, hx, hy - 260, { angle: Math.PI / 2, spread: 0.5, len: 600, color: M.practical, a: 0.1 });
  // mounting plate screwed to the wall
  rr(g, hx - 78, hy - 220, 110, 150, 10); g.fillStyle = shade(M.wall, 0.15); g.fill();
  circle(g, hx - 46, hy - 196, 9, shade(M.wall, 0.5));
  circle(g, hx - 46, hy - 94, 9, shade(M.wall, 0.5));
  // the hook's shadow on the wall, offset down-right
  const hookPath = [[hx - 23, hy - 170], [hx + 60, hy - 150], [hx + 108, hy - 90], [hx + 96, hy - 10], [hx + 46, hy + 18], [hx + 30, hy - 42]];
  const shadowPath = hookPath.map(([x, y]) => [x + 16, y + 20]);
  seg(g, shadowPath, 18, alpha(S().ink, 0.35));
  // the hook: one smooth steel J curving down and back up to a sharp point
  seg(g, hookPath, 20, shade(M.wall, 0.5));
  seg(g, hookPath, 6, M.key); // bright glint along the steel
  circle(g, hx - 23, hy - 170, 18, shade(M.wall, 0.4)); // mounting boss
  poly(g, [[hx + 22, hy - 58], [hx + 44, hy - 30], [hx + 18, hy - 24]], shade(M.wall, 0.6)); // sharp tip
  glow(g, hx + 46, hy - 30, 120, M.practical, 0.5);
  FX.sparkle(g, hx + 46, hy - 30, 26 + 8 * Math.sin(t * 6), M.practical, 0.9);
  // strobe between the quick cuts
  if (Math.floor(t / 0.6) % 2 === 1) veil(g, S().ink, 0.22);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.3 });
} });

// s108 — "People said the door could only be opened from the outside."
// Wide: the camera retreats up the stairs as the door swings shut from the inside —
// flat panel, no handle or latch on this side.
registerShot('s108', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1 - 0.12 * k, x: -40 * k, y: -40 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const dx = CX + V(380, 300), dy = GY - V(540, 780), dw = V(280, 220), dh = V(540, 780);
  const shut = ease.inOut(prog(t, 0.2, 2.2));
  layer(g, cam, 1, (g) => {
    // the slab swinging shut: edge-on sliver widening into the full flat panel
    const w = lerp(24, dw, shut);
    rr(g, dx + (dw - w), dy, w, dh, 6); g.fillStyle = linGrad(g, dx, dy, dx + dw, dy, ['#4a4a52', '#33333c', '#23232a']); g.fill();
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(dx + (dw - w) + 16, dy + 16, 10, dh - 32);
    glow(g, dx + dw / 2, dy + dh / 2, 180, M.practical, 0.15 * (1 - shut));
  });
  FX.dust(g, t, { count: 36, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
} });

// s109 — "Maridith called the police."
// Insert: her hand gripping the phone tighter, trembling slightly.
registerShot('s109', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.7 + 0.05 * k, x: 100, y: -200 + 60 * k })); veil(g, '#0a0a14', 0.42);
  const M = mood('night');
  const px = E.W * 0.5, py = E.H * 0.5, pw = V(280, 240), ph = V(520, 450);
  const [sx, sy] = shake(t, 3, 8, 5);
  g.save(); g.translate(sx, sy);
  rr(g, px - pw / 2, py - ph / 2, pw, ph, 24); g.fillStyle = S().ink; g.fill();
  rr(g, px - pw / 2 + 12, py - ph / 2 + 12, pw - 24, ph - 24, 16);
  g.fillStyle = linGrad(g, px, py - ph / 2, px, py + ph / 2, [S().ui.blueprint, M.key]); g.fill();
  glow(g, px, py, 240, S().ui.blueprint, 0.5);
  // speaker holes at the top of the phone
  for (let i = -2; i <= 2; i++) circle(g, px + i * 22, py - ph / 2 + 34, 6, alpha(S().ink, 0.8));
  // fingers wrapped tight around the phone edge
  seg(g, [[px + pw / 2 + 60, py + ph * 0.5], [px + pw / 2 + 10, py + 60]], 70, S().ink);
  for (let i = 0; i < 4; i++) seg(g, [[px + pw / 2 - 6, py - 120 + i * 62], [px + pw / 2 - 66, py - 108 + i * 62]], 20, S().ink);
  g.restore();
  FX.dust(g, t, { count: 24, color: '#bcd0ff', a: 0.3 });
} });

// s110 — "The police came to the house, and they looked at the room."
// Insert: flashlight beams sweeping the dark narrow room; a bright circle of
// light dances across the rough brick wall.
registerShot('s110', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.5 + 0.1 * k, x: -120 + 160 * k, y: -220 };
  basement(g, t, cam, { doorOpen: true });
  veil(g, S().ink, 0.55);
  const M = mood('night');
  const wx = E.W / 2 + Math.sin(t * 1.6) * 320, wy = E.H * 0.42 + Math.cos(t * 1.1) * 90;
  // rough dark-navy brick wall catching the beam
  g.strokeStyle = alpha(M.wall, 0.6); g.lineWidth = 3;
  for (let y = E.H * 0.2; y < E.H * 0.7; y += 70) { g.beginPath(); g.moveTo(E.W * 0.1, y); g.lineTo(E.W * 0.9, y); g.stroke(); }
  FX.lightCone(g, E.W * 0.15, E.H * 0.95, { angle: -Math.PI / 3 + Math.sin(t * 1.6) * 0.3, spread: 0.45, len: 1100, color: '#ffffff', a: 0.16 });
  FX.lightCone(g, E.W * 0.85, E.H * 0.95, { angle: -Math.PI * 2 / 3 + Math.cos(t * 1.3) * 0.3, spread: 0.45, len: 1100, color: '#ffffff', a: 0.16 });
  glow(g, wx, wy, 150, '#ffffff', 0.55);
  circle(g, wx, wy, 62, alpha('#ffffff', 0.85));
  FX.dust(g, t, { count: 40, color: '#dfe8ff', a: 0.4 });
} });

// s111 — "They found no signs of a crime."
// Medium two-shot: officers at the door shaking their heads, one smiling;
// flashlights lowering, warm light returning.
registerShot('s111', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.1 + 0.08 * k, x: 40 - 70 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const off = officer(M);
  const shakeHead = Math.sin(t * 4) * 0.6;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - V(180, 140), y: GY, s: 1.55, facing: 1, outfit: off, pose: breathe(POSES.stand, t), expr: 'smile', look: [shakeHead, 0], rim: { color: M.rim, dir: [0, -1] } });
    drawFigure(g, { x: CX + V(220, 170), y: GY, s: 1.55, facing: -1, outfit: off, pose: breathe(POSES.crossArms, t, 1, 2), expr: 'neutral', look: [-shakeHead, 0], rim: { color: M.rim, dir: [0, -1] } });
    // shiny police badges
    circle(g, CX - V(180, 140) + 26, GY - 250, 12, S().ui.gold);
    circle(g, CX + V(220, 170) - 26, GY - 250, 12, S().ui.gold);
    // flashlight beams lowering and fading
    FX.lightCone(g, CX - V(180, 140), GY - 200, { angle: Math.PI / 2 + 0.5 * k, spread: 0.4, len: 500, color: '#ffffff', a: 0.12 * (1 - k) });
  });
  FX.dust(g, t, { count: 36, color: '#ffe0b0', a: 0.3 });
} });

// s112 — "They found nothing that looked like DNA evidence."
// Wide: a cold blue wash over the bare, clean mats; the evidence kit untouched.
registerShot('s112', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1 + 0.1 * k, x: -30 * k };
  const { GY, CX, M } = basement(g, t, cam);
  layer(g, cam, 1, (g) => {
    // untouched evidence kit by the mats
    rr(g, CX - V(700, 520), GY + V(40, 60), V(190, 150), 80, 10); g.fillStyle = shade(M.wall, -0.2); g.fill();
    seg(g, [[CX - V(660, 490), GY + V(40, 60)], [CX - V(660, 490), GY - V(6, 0)]], 6, shade(M.wall, -0.5));
    glow(g, CX + V(430, 330), GY + V(150, 190), 260, M.key, 0.25);
  });
  veil(g, M.key, 0.2); // cold blue wash
  FX.dust(g, t, { count: 40, color: '#cfe0ff', a: 0.35 });
  FX.fog(g, GY - 100, 160, M.fog, 0.18);
} });

// s113 — "They did not open an investigation."
// Insert: a black pen tip; a hand clicks the pen, retracting the nib.
// FIX: a hand now grips the pen at believable scale (palm + thin thumb and
// fingers, thumb pressing the clicker), and the pen reads as a pen — barrel,
// clip, grip and a nib that retracts with the sharp final click.
registerShot('s113', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.6 - 0.15 * k, x: -80, y: -240 })); veil(g, '#0a0a14', 0.42);
  const M = mood('night');
  const px = E.W * 0.5, py = E.H * 0.5;
  const clicked = ease.out(prog(t, 0.8, 1.1));
  const press = clicked * 10; // thumb + clicker travel down on the click
  g.save(); g.translate(px, py); g.rotate(-0.5);
  // pen barrel, grip and clip
  rr(g, -260, -26, 420, 52, 26); g.fillStyle = S().ink; g.fill();
  seg(g, [[-260, -14], [160, -14]], 3, M.rim); // rim light along the barrel
  rr(g, 84, -26, 76, 52, 20); g.fillStyle = shade(M.wall, 0.3); g.fill(); // grip section
  seg(g, [[-190, -26], [-70, -26]], 10, shade(M.wall, 0.5)); // pocket clip on the barrel
  circle(g, -196, -26, 7, shade(M.wall, 0.5));
  // clicker button at the back end, pressed in by the thumb
  circle(g, -272 + press, 0, 20, S().ui.gold);
  // nib retracting into the tip on the click
  const nib = lerp(46, 6, clicked);
  poly(g, [[160, -16], [160 + nib, 0], [160, 16]], shade(M.wall, 0.5));
  // the clicking hand, drawn in the pen's own rotated space so the thumb
  // lands exactly on the clicker: small palm, thumb pressing the button,
  // two thin fingers curled over the barrel
  circle(g, -312, -92, 34, S().ink); // palm
  seg(g, [[-294, -66], [-274 + press, -8]], 15, S().ink); // thumb pressing the clicker
  seg(g, [[-300, -64], [-276, -58]], 3, M.rim); // rim on the thumb
  seg(g, [[-284, -64], [-248, -34]], 13, S().ink); // index finger over the barrel
  seg(g, [[-304, -62], [-272, -30]], 13, S().ink); // middle finger over the barrel
  g.restore();
  if (t > 0.8) FX.rings(g, px + 150, py - 60, t - 0.8, { count: 2, r0: 30, r1: 200, color: M.key, a: 0.5 * (1 - prog(t, 0.8, 1.6)) });
  FX.dust(g, t, { count: 22, color: '#cfe0ff', a: 0.3 });
} });

// s114 — "One officer said the room was really cool."
// FIX (was a near-duplicate of s111's two standing officers): a different
// angle — over-the-shoulder from behind one officer (big blurred silhouette
// in the right foreground) onto the second officer KNEELING by the carpet
// roll to examine it, flashlight beam pointing down at the roll. Still two
// officers, both with gold badge dots, same basement set.
registerShot('s114', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  const cam = { z: 1.3 + 0.06 * k, x: -60 + 90 * k };
  const { GY, CX, M } = basement(g, t, cam);
  const off = officer(M);
  const rollX = CX - V(60, 40), rollY = GY + V(70, 90);
  layer(g, cam, 1, (g) => {
    // carpet roll the kneeling officer is examining
    rr(g, rollX - V(280, 220), rollY - 26, V(560, 440), 52, 26); g.fillStyle = shade(M.wall, 0.15); g.fill();
    circle(g, rollX + V(280, 220) - 40, rollY, 26, shade(M.wall, -0.2));
    glow(g, rollX, rollY, 200, M.practical, 0.25);
    // officer 2 (sharp, centre-left): kneeling by the roll, one hand on it
    drawFigure(g, { x: CX - V(330, 250), y: GY, s: 1.5, facing: 1, outfit: off, pose: breathe(posesAt(t, [[0, 'kneel'], [0.5, 'kneel']]), t), expr: 'smile', look: [0.3, 0.3], rim: { color: M.rim, dir: [0, -1] } });
    circle(g, CX - V(330, 250) + 26, GY - 250, 12, S().ui.gold); // badge
    // his flashlight beam pointing down at the carpet roll, clicking off
    FX.lightCone(g, CX - V(330, 250) + 60, GY - 220, { angle: Math.PI / 2 + 0.4, spread: 0.4, len: 420, color: '#ffffff', a: 0.12 * (1 - prog(t, 0.4, 1.4)) });
  });
  // officer 1 (foreground, right): over-the-shoulder — big blurred back of
  // head, cap and shoulder, badge dot on the shoulder, watching the kneeler
  blurLayer(g, 10, (g) => {
    g.fillStyle = S().ink;
    g.beginPath(); g.ellipse(E.W * 0.92, E.H * 1.15, 420, 340, 0, Math.PI, Math.PI * 2); g.fill(); // shoulder
    circle(g, E.W * 0.86, E.H * 0.34, 190, S().ink); // back of head
    g.beginPath(); g.ellipse(E.W * 0.86, E.H * 0.22, 200, 70, 0, Math.PI, Math.PI * 2); g.fill(); // cap
    circle(g, E.W * 0.78, E.H * 0.82, 14, S().ui.gold); // badge dot on the shoulder
  }, cam, 1.6);
  FX.dust(g, t, { count: 34, color: '#ffe0b0', a: 0.3 });
  FX.fog(g, GY - 90, 150, M.fog, 0.18);
} });

// s115 — "Maridith later said the house had another hidden room, too."
// Silhouette close-up (NOT a bigFace — s094b is the story's only face CU):
// Meredith's dark head in profile, one white eye, her head turning slowly upward.
// FIX: the head now sits on a neck, red-orange hoodie shoulders and her bun,
// so it reads as Meredith's head turning up — not a black disc / moon.
registerShot('s115', { draw(g, t, info) {
  const k = ease.inOut(prog(t, 0, info.dur));
  blurLayer(g, 14, (g) => basement(g, t, { z: 1.5, x: -160 + 120 * k, y: -180 })); veil(g, '#0a0a14', 0.5);
  const M = mood('night');
  const up = ease.inOut(prog(t, 0.3, info.dur)); // head turning slowly upward
  const cx = E.W * 0.42, cy = E.H * 0.58 - 40 * up;
  const r = V(240, 260);
  // ceiling light she is looking up toward
  glow(g, E.W * 0.6, E.H * 0.06, 260, M.practical, 0.35);
  FX.lightCone(g, E.W * 0.6, E.H * 0.06, { angle: Math.PI / 2, spread: 0.5, len: 700, color: M.practical, a: 0.08 });
  // hoodie shoulders (red-orange, Meredith's colour) + neck + head, turning up
  g.save(); g.translate(cx, cy); g.rotate(-0.1 * up);
  g.fillStyle = MERIDITH.color;
  g.beginPath(); g.ellipse(0, E.H - cy - 60, r * 1.55, r * 0.95, 0, Math.PI, Math.PI * 2); g.fill();
  seg(g, [[-46, r * 0.55], [-46, r * 1.05]], 92, S().ink); // neck
  seg(g, [[-88, r * 0.6], [-88, r * 1.0]], 4, M.rim); // rim on the neck's lit edge
  circle(g, 0, 0, r, S().ink); // head
  circle(g, -r * 0.42, -r * 0.82, r * 0.26, MERIDITH.color); // her bun, top-back of the head
  // rim crescent on the bulb side of the head
  g.save(); g.beginPath(); g.arc(0, 0, r + r * 0.06, 0, Math.PI * 2); g.arc(-r * 0.07, 0, r, 0, Math.PI * 2, true); g.fillStyle = M.rim; g.fill('evenodd'); g.restore();
  // rim along the hoodie shoulder's lit edge
  g.strokeStyle = M.rim; g.lineWidth = 5;
  g.beginPath(); g.ellipse(0, E.H - cy - 60, r * 1.55, r * 0.95, 0, Math.PI * 1.15, Math.PI * 1.65); g.stroke();
  // the one visible eye, lifting as her head turns upward
  const ey = -r * 0.1 - 26 * up;
  circle(g, r * 0.3, ey, 13, S().feature);
  g.restore();
  glow(g, cx - r, cy - r * 0.5, 200, M.practical, 0.3);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.3 });
} });
