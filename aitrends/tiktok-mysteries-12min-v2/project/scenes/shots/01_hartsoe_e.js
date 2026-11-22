// shots/01_hartsoe_e.js — Hartsoe story, part E: s030b–s037 (the explanation → the mirror settles back).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S, talkAmount } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { SAMANTHA } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

function hammer(g, x, y, ang, s = 1, glint = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  seg(g, [[0, 0], [0, -90 * s]], 12 * s, '#3a2c22');
  rr(g, -34 * s, -112 * s, 68 * s, 26 * s, 6 * s); g.fillStyle = '#8d97a3'; g.fill();
  seg(g, [[34 * s, -99 * s], [58 * s, -112 * s]], 10 * s, '#8d97a3');
  if (glint > 0) FX.sparkle(g, 20 * s, -100 * s, 26 * s, '#ffe9b0', glint);
  g.restore();
}

// s030b — "… her landlord finally explained what it was."  TRUE profile silhouette: head + nose + chin, facing left, mouth moving
registerShot('s030b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.6, x: lerp(60, -60, ease.inOut(t / D)), y: -120 }, { mood: 'interiorWarm', wisps: false })); veil(g, '#14101c', 0.42);
  const talk = talkAmount(info.globalT, 77.86, 80.3);
  const cx = E.W * 0.46, cy = E.H * 0.52, r = V(290, 320) * (1 + 0.03 * ease.inOut(t / D));
  const cam = { z: 1 + 0.04 * ease.inOut(t / D) };
  layer(g, cam, 1, (g) => {
    // shoulders and neck, dark silhouette
    g.fillStyle = S().ink;
    g.beginPath(); g.ellipse(cx + 40, E.H * 1.02, 430, 260, 0, 0, 7); g.fill();
    g.fillRect(cx - 60, cy + r * 0.55, 130, E.H);
    // the head in profile, facing left
    circle(g, cx, cy, r, S().ink);
    // nose, jutting left from the face
    poly(g, [[cx - r * 0.92, cy - r * 0.12], [cx - r * 1.28, cy + r * 0.10], [cx - r * 0.9, cy + r * 0.26]], S().ink);
    // chin and jaw, a small bump below the mouth
    circle(g, cx - r * 0.72, cy + r * 0.52, r * 0.22, S().ink);
    // brow line above the eye
    seg(g, [[cx - r * 0.55, cy - r * 0.42], [cx - r * 0.2, cy - r * 0.46]], 8, S().ink);
    // one white dot eye
    circle(g, cx - r * 0.38, cy - r * 0.18, 15, '#ffffff');
    // simple mouth line, opening as he speaks
    const mw = 44 + talk * 26;
    seg(g, [[cx - r * 0.82, cy + r * 0.3], [cx - r * 0.82 + mw, cy + r * 0.3]], 8, '#ffffff');
    // rim light crescent on the lit (right) side of the head
    g.save(); g.strokeStyle = M.rim; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, r - 5, -1.15, 1.15); g.stroke(); g.restore();
    // faint rim along the nose edge
    g.save(); g.strokeStyle = alpha(M.rim, 0.6); g.lineWidth = 4;
    g.beginPath(); g.moveTo(cx - r * 0.92, cy - r * 0.12); g.lineTo(cx - r * 1.28, cy + r * 0.10); g.stroke(); g.restore();
  });
  if (talk > 0) FX.rings(g, cx, cy, t, { count: 3, r0: r * 1.15, r1: r * 1.65, color: '#ffe2b0', a: 0.3 });
  // indigo shadows shifting behind him
  g.save(); g.fillStyle = 'rgba(20,16,48,.35)';
  g.beginPath(); g.ellipse(E.W * 0.82, E.H * 0.3 + Math.sin(t * 0.8) * 40, 200, 320, 0.2, 0, 7); g.fill();
  g.restore();
  FX.dust(g, t, { count: 14, color: '#ffe2b0', a: 0.28 });
} });

// s031b — "… in the same building, and it was under construction."  Medium: unfinished drywall, hand hammering a nail
registerShot('s031b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05, y: lerp(-30, 40, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorCool' });
  // unfinished drywall panel with exposed studs behind it
  const px = E.W * 0.16, py = GY - 560, pw = 520, ph = 560;
  layer(g, cam, 0.55, (g) => {
    for (let i = 0; i < 4; i++) { g.fillStyle = '#4a3428'; g.fillRect(px + 40 + i * 150, py - 40, 26, ph + 40); }
    rr(g, px, py, pw, ph, 6); g.fillStyle = '#8a8580'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
    for (let y = py + 90; y < py + ph; y += 90) { g.beginPath(); g.moveTo(px, y); g.lineTo(px + pw, y); g.stroke(); }
    // the nail
    circle(g, px + pw / 2, py + ph / 2, 10, '#3a3a44');
    glow(g, px + pw / 2, py + ph / 2, 90, '#fff3dc', 0.2);
  });
  // Samantha at the construction doorway, gesturing at the unfinished walls
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.72, y: GY, s: 1.25, facing: -1, outfit: SAMANTHA, pose: breathe(posesAt(t, [[0, POSES.stand], [0.5, POSES.point]]), t), expr: 'neutral', rim: rim(M, [-1, -0.3]) });
    // hand hammering the nail — a strike every ~0.7s with a white shockwave ring
    const hit = Math.floor(t / 0.7), ht = t - hit * 0.7;
    const hx = px + pw / 2 + 60, hy = py + ph / 2 - 60;
    const swing = ht < 0.15 ? -0.9 + ht * 6 : -0.9 + (1 - ease.out(prog(ht, 0.15, 0.4))) * 0.9;
    hammer(g, hx, hy, swing, 1.1, ht < 0.2 ? 0.7 : 0.2);
    if (ht < 0.5) FX.rings(g, px + pw / 2, py + ph / 2, ht, { count: 2, r0: 20, r1: 220, speed: 2.2, color: '#ffffff', a: 0.6 * (1 - ht / 0.5) });
  });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.32 });
} });

// s032 — "The hole was sealed up with a new wall."  Insert: a flat grey rectangle sliding into place over the hole
registerShot('s032', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.3, y: lerp(40, -30, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorWarm' });
  // the new wall sliding in to seal the gap
  const mx = E.W / 2 - 420, my = GY - 430, mw = 520, mh = 360;
  const slide = ease.inOut(prog(t, 0.4, 1.7));
  layer(g, cam, 0.55, (g) => {
    const sx = lerp(mx - mw - 60, mx, slide);
    rr(g, sx, my, mw, mh, 6); g.fillStyle = '#8a8580'; g.fill();
    g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 2;
    for (let y = my + 70; y < my + mh; y += 70) { g.beginPath(); g.moveTo(sx, y); g.lineTo(sx + mw, y); g.stroke(); }
    for (let x = sx + 80; x < sx + mw; x += 90) { g.beginPath(); g.moveTo(x, my); g.lineTo(x, my + mh); g.stroke(); }
    glow(g, sx + mw / 2, my + mh / 2, 240, '#ffd9a0', 0.12 * slide);
  });
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.3 });
} });

// s033a — "Samantha said she never heard any construction noise, and she was …"  Insert: her ear against the wall
registerShot('s033a', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.15, x: Math.sin(t * 0.7) * 30 };
  blurLayer(g, 12, (g) => bathroom(g, t, cam, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.3);
  const lean = { ...POSES.stand, eF: [18, -160], hF: [26, -196], eB: [-8, -140], hB: [-14, -110] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.62, y: E.H * 0.8, s: 1.8, facing: -1, outfit: SAMANTHA, pose: breathe(lean, t), expr: 'thinking', rot: -0.14, rim: rim(M, [-1, -0.3]), blink: (t % 3.0) > 2.9 });
  });
  // a "silence" ripple moving outward from the point of contact
  const [hx, hy] = headPos({ x: E.W * 0.62, y: E.H * 0.8, s: 1.8, facing: -1, pose: lean, rot: -0.14 });
  FX.rings(g, hx - 60, hy, t, { count: 3, r0: 30, r1: 320, speed: 0.7, color: '#9fc8ff', a: 0.35 });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.28 });
} });

// s033b — "… never told why there was a hole between the two apartments."  Medium: Samantha looking into the reinstalled mirror
registerShot('s033b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / D), x: lerp(-40, 40, ease.inOut(t / D)), y: lerp(20, -20, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorWarm' });
  const touch = { ...POSES.stand, eF: [30, -150], hF: [44, -168], eB: [-8, -140], hB: [-12, -108] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.68, y: GY, s: 1.4, facing: -1, outfit: SAMANTHA, pose: breathe(touch, t), expr: 'sad', rim: rim(M, [-1, -0.3]), blink: (t % 3.2) > 3.1 });
  });
  // her reflection waving back slowly, inside the mirror
  const mx = E.W / 2 - 420, my = GY - 430, mw = 520, mh = 360;
  layer(g, cam, 0.55, (g) => {
    g.save(); g.globalAlpha = 0.65;
    const wave = { ...POSES.stand, eF: [20, -190], hF: [30, -220 + Math.sin(t * 1.6) * 14], eB: [-8, -140], hB: [-12, -108] };
    drawFigure(g, { x: mx + mw / 2, y: my + mh + 60, s: 0.8, facing: 1, outfit: SAMANTHA, pose: wave, expr: 'neutral', rim: false, shadow: false });
    g.restore();
  });
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.28 });
} });

// s034 — "But the space was real."  Wide: the complete bathroom, pulling back through the doorway
registerShot('s034', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.12 - 0.12 * ease.inOut(t / D), x: lerp(30, -30, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorWarm' });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + 120, y: GY, s: 1.2, facing: -1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'neutral', rim: rim(M, [-1, -0.3]), blink: (t % 3.1) > 3.0 });
  });
  // dark doorway frame closing in at the edges as we pull back
  g.save(); g.fillStyle = 'rgba(5,4,10,.85)';
  const fw = 90 * ease.inOut(t / D);
  g.fillRect(0, 0, fw, E.H); g.fillRect(E.W - fw, 0, fw, E.H);
  g.restore();
  FX.dust(g, t, { count: 22, color: '#ffe2b0', a: 0.28 });
} });

// s035 — "It was not a ghost."  Samantha in the corner, calm, slight smile, warm light on her face, mirror behind her
registerShot('s035', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.15 - 0.08 * ease.inOut(t / D), x: lerp(30, -30, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorWarm', wisps: false });
  veil(g, '#14101c', 0.12);
  // the mirror behind her, warm light catching its edge
  const mx = E.W * 0.30, my = GY - 470, mw = 430, mh = 350;
  layer(g, cam, 0.55, (g) => {
    rr(g, mx - 10, my - 10, mw + 20, mh + 20, 10); g.fillStyle = '#2a2430'; g.fill();
    rr(g, mx, my, mw, mh, 8);
    g.fillStyle = linGrad(g, mx, my, mx + mw, my + mh, ['#d8c9a8', '#a89a7e', '#7e7260']); g.fill();
    g.fillStyle = 'rgba(255,255,255,.18)';
    poly(g, [[mx + 30, my + mh], [mx + 150, my], [mx + 210, my], [mx + 90, my + mh]], 'rgba(255,255,255,.18)');
    glow(g, mx + mw / 2, my + mh / 2, 200, '#ffd9a0', 0.18);
  });
  // Samantha, calm, a slight smile, warm light on her face
  layer(g, cam, 1, (g) => {
    const sx = E.W * 0.64;
    drawFigure(g, { x: sx, y: GY, s: 1.35, facing: -1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'smile', rim: rim(M, [1, -0.3]), blink: (t % 3.2) > 3.1 });
    const [hx, hy] = headPos({ x: sx, y: GY, s: 1.35, facing: -1, pose: POSES.stand });
    glow(g, hx + 20, hy, 170, '#ffd9a0', 0.4);
    FX.lightCone(g, hx + 30, hy, { angle: 0.3, spread: 0.5, len: 380, color: '#ffd9a0', a: 0.08 });
  });
  // a single blue dust mote floating down to the floor and disappearing
  const moteY = lerp(E.H * 0.3, E.H * 0.8, ease.inOut(t / D));
  const a = t > D - 0.25 ? (D - t) / 0.25 : 0.9;
  circle(g, E.W * 0.62 + Math.sin(t * 0.8) * 12, moteY, 5, alpha('#9fc8ff', a));
  glow(g, E.W * 0.62, moteY, 40, '#9fc8ff', 0.25 * a);
  FX.dust(g, t, { count: 10, color: '#ffe2b0', a: 0.25 });
} });

// s036 — "It was not a stranger living in her walls."  Medium: Samantha hangs the towel, normal routine
registerShot('s036', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.05, x: lerp(40, -40, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorWarm' });
  // a faint amber glow behind the bricks that slowly fades to black
  const fade = 1 - ease.inOut(prog(t, 0.4, 1.9));
  layer(g, cam, 0.55, (g) => {
    if (fade > 0) {
      g.fillStyle = `rgba(255,180,110,${(0.16 * fade).toFixed(3)})`;
      g.fillRect(E.W / 2 - 420, GY - 430, 520, 360);
      glow(g, E.W / 2 - 160, GY - 250, 260, '#ffb46e', 0.2 * fade);
    }
  });
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.78, y: GY, s: 1.4, facing: -1, outfit: SAMANTHA, pose: breathe(POSES.reach, t), expr: 'neutral', rim: rim(M, [-1, -0.3]), blink: (t % 3.0) > 2.9 });
  });
  FX.dust(g, t, { count: 20, color: '#ffe2b0', a: 0.28 });
} });

// s037 — "It was an unfinished apartment, hiding behind her mirror."  Insert: the mirror's MOUNTING BRACKET, hands lifting the mirror edge, moonlight glint
registerShot('s037', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.25 + 0.1 * ease.inOut(t / D), x: lerp(-40, 40, ease.inOut(t / D)) };
  blurLayer(g, 10, (g) => bathroom(g, t, cam, { mood: 'interiorCool', wisps: false })); veil(g, '#0a1024', 0.3);
  const bx = E.W / 2, by = E.H * 0.62;
  // solid wall behind, with faint tile joints
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.save(); g.strokeStyle = 'rgba(0,0,0,.22)'; g.lineWidth = 3;
    for (let y = 0; y < E.H; y += 150) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
    g.restore();
  });
  // the metal mounting bracket: vertical plate + horizontal arm, four screws
  layer(g, cam, 0.8, (g) => {
    rr(g, bx - 110, by - 170, 220, 340, 12); g.fillStyle = shade(S().ink, 0.45); g.fill();
    g.fillStyle = alpha('#dfe8ff', 0.28); g.fillRect(bx - 96, by - 156, 18, 312);
    rr(g, bx - 190, by - 40, 380, 56, 10); g.fillStyle = shade(S().ink, 0.55); g.fill();
    const screw = (sx, sy) => {
      circle(g, sx, sy, 20, shade(S().ink, 0.3));
      circle(g, sx - 5, sy - 5, 7, alpha('#dfe8ff', 0.8));
      seg(g, [[sx - 11, sy], [sx + 11, sy]], 5, shade(S().ink, 0.15));
      seg(g, [[sx, sy - 11], [sx, sy + 11]], 5, shade(S().ink, 0.15));
    };
    screw(bx - 70, by - 120); screw(bx + 70, by - 120);
    screw(bx - 70, by + 120); screw(bx + 70, by + 120);
  });
  // hands lifting the mirror edge, the mirror's bottom edge above the bracket
  const lift = ease.out(prog(t, 0.2, 1.6));
  const edgeY = E.H * 0.34 - lift * 40;
  layer(g, cam, 1, (g) => {
    // the mirror's bottom edge and glass, rising slightly as it lifts
    rr(g, bx - 330, edgeY - 260, 660, 260, 8); g.fillStyle = '#2a2430'; g.fill();
    rr(g, bx - 322, edgeY - 252, 644, 244, 6);
    g.fillStyle = linGrad(g, bx - 322, edgeY - 252, bx + 322, edgeY, ['#cfd8e2', '#9fb0c4', '#7e90a8']); g.fill();
    // pink-sleeved forearms entering from the bottom edge, hands gripping the mirror edge
    const hand = (gx2) => {
      seg(g, [[gx2 - 30, E.H + 60], [gx2, edgeY + 26]], 36, SAMANTHA.color);
      seg(g, [[gx2 - 34, E.H + 60], [gx2 - 4, edgeY + 10]], 4, alpha(M.rim, 0.7));
      circle(g, gx2, edgeY + 6, 36, S().ink);
      seg(g, [[gx2 - 14, edgeY - 6], [gx2 - 20, edgeY - 34]], 12, S().ink);
      seg(g, [[gx2 + 4, edgeY - 8], [gx2, edgeY - 36]], 12, S().ink);
      seg(g, [[gx2 + 20, edgeY - 4], [gx2 + 24, edgeY - 30]], 12, S().ink);
    };
    hand(bx - 190); hand(bx + 190);
  });
  // a final glint of moonlight hitting the metal, then the frame fades to indigo
  const glint = 0.5 + 0.5 * Math.sin(t * 2.5);
  FX.sparkle(g, bx + 70, by - 120, 34, '#e8ecff', 0.8 * glint);
  FX.lensStreak(g, bx, by - 120, E.W * 0.5, '#cfe0ff', 0.14);
  veil(g, '#0a1024', 0.35 * ease.inOut(prog(t, 1.8, D)));
  FX.dust(g, t, { count: 10, color: '#cfe0ff', a: 0.25 });
} });
