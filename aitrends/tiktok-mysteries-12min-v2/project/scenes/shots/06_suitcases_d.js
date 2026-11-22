// shots/06_suitcases_d.js — Story 6 (Alki Beach), part D: s172b–s177b.
// Verdict, sentence, and the teenagers' video coming full circle.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, rng, text, FONTS, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { beach } from '../sets/beach.js';
import { TEEN } from '../cast.js';

// A plain ink figure (no signature colour).
const PLAIN = { top: 'tshirt', color: S().ink, head: 'none' };

// s172b — medium: a car moves through dark indigo fog on the coast road; the headlight lens grows larger and brighter.
registerShot('s172b', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: lerp(1.08, 1.0, k), x: 30 * k };
  const { GY, CX } = beach(g, t, cam, { mood: 'night' });
  layer(g, cam, 1, (g) => {
    // coast road
    g.fillStyle = shade(M.road, -0.2); g.fillRect(-E.W, GY + 40, E.W * 3, 220);
    seg(g, [[-E.W, GY + 150], [E.W * 2, GY + 150]], 4, alpha(S().ui.gold, 0.4));
    // the car, approaching: grows as it nears
    const cx = lerp(E.W * 0.2, E.W * 0.5, k), cy = GY + 110, cs = lerp(0.7, 1.15, k);
    g.save(); g.translate(cx, cy); g.scale(cs, cs);
    rr(g, -190, -90, 380, 90, 26); g.fillStyle = S().ink; g.fill();
    rr(g, -110, -160, 200, 80, 20); g.fillStyle = S().ink; g.fill();
    g.fillStyle = shade(S().ui.blueprint, -0.4); g.fillRect(-100, -150, 80, 60); g.fillRect(10, -150, 80, 60);
    circle(g, -120, 30, 34, S().ink); circle(g, 120, 30, 34, S().ink);
    // glowing yellow headlight lens
    const bright = 0.5 + 0.5 * k;
    glow(g, 185, -50, 130, S().ui.gold, 0.7 * bright);
    circle(g, 185, -50, 22, S().ui.gold);
    FX.lightCone(g, 185, -50, { angle: 0, spread: 0.35, len: 500, color: S().ui.gold, a: 0.16 * bright });
    g.restore();
    FX.pool(g, cx, GY + 230, 260, 30, S().ui.gold, 0.12 * (0.5 + 0.5 * k));
  });
  FX.fog(g, GY - 60, 220, M.fog, 0.35);
  FX.dust(g, t, { count: 16, color: M.key, a: 0.18 });
} });

// s173a — wide: the courtroom; gavel, judge's bench, flag, wood panels; a hand's shadow descends toward the gavel.
// FIX (QC v4): the old gavel read as a small yellow tank/gun — a long gold slab
// with a stub handle over a big round block. Redrawn as a real gavel: a short fat
// wooden head (dark end caps + grain lines) with a long tapered handle, resting
// beside a flat wooden sound-block disc on the bench; the flag now has a canton
// and stripes, the high window throws a god-ray shaft, and the descending hand
// shadow is a palm with 4 fingers + thumb reaching down toward the gavel's head.
registerShot('s173a', { draw(g, t, info) {
  const M = mood('interiorWarm'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.04 * k, x: lerp(50, -50, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.25), shade(M.wall, -0.5)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // wood panels
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 3;
    for (let x = -E.W; x < E.W * 2; x += 260) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, E.H * 0.8); g.stroke(); }
    // flag, right: stripes + blue canton
    const fx = E.W * 0.78, fy = E.H * 0.12, fw = 200, fh = 300;
    for (let i = 0; i < 7; i++) { g.fillStyle = i % 2 ? S().ui.accent : S().ui.cream; g.fillRect(fx, fy + i * (fh / 7), fw, fh / 7 + 1); }
    g.fillStyle = shade(S().ui.blueprint, -0.5); g.fillRect(fx, fy, fw * 0.45, fh * 0.55);
    seg(g, [[fx + fw / 2, fy - 30], [fx + fw / 2, fy + fh + 40]], 8, shade(M.wall, -0.4));
    // high window + light shaft
    rr(g, E.W * 0.12, E.H * 0.08, 220, 160, 6); g.fillStyle = M.practical; g.fill();
    glow(g, E.W * 0.12 + 110, E.H * 0.08 + 80, 200, M.practical, 0.5);
    FX.lightCone(g, E.W * 0.12 + 110, E.H * 0.08 + 80, { angle: Math.PI / 2 + 0.4, spread: 0.4, len: 800, color: M.practical, a: 0.12 });
    FX.godRays(g, E.W * 0.12 + 110, E.H * 0.08 + 80, { count: 5, angle: Math.PI / 2 + 0.4, spread: 0.4, len: 800, a: 0.05, t });
    g.fillStyle = shade(M.floor, -0.1); g.fillRect(-E.W, E.H * 0.8, E.W * 3, E.H);
  });
  layer(g, cam, 1, (g) => {
    // judge's bench
    const bx = E.W * 0.3, by = E.H * 0.62;
    rr(g, bx - 300, by - 60, 600, 130, 10); g.fillStyle = shade(M.wall, -0.1); g.fill();
    g.fillStyle = shade(M.wall, -0.35); g.fillRect(bx - 300, by + 70, 600, 40);
    g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 3;
    for (let i = 1; i < 4; i++) { g.beginPath(); g.moveTo(bx - 300 + i * 150, by - 60); g.lineTo(bx - 300 + i * 150, by + 70); g.stroke(); }
    // sound block: a flat wooden disc on the bench top
    g.save(); g.translate(bx + 60, by - 58);
    g.beginPath(); g.ellipse(0, 0, 92, 18, 0, 0, Math.PI * 2); g.fillStyle = shade(M.wall, -0.4); g.fill();
    g.beginPath(); g.ellipse(0, -6, 92, 18, 0, 0, Math.PI * 2); g.fillStyle = shade(M.wall, -0.15); g.fill();
    g.restore();
    // the gavel: short fat wooden head with dark end caps + grain, long tapered handle
    const gx = bx + 60, gy = by - 108;
    g.save(); g.translate(gx, gy); g.rotate(0.22);
    rr(g, -78, -32, 156, 64, 20); g.fillStyle = shade(S().ui.gold, -0.35); g.fill();          // head
    rr(g, -78, -32, 22, 64, 10); g.fillStyle = shade(S().ui.gold, -0.6); g.fill();            // end caps
    rr(g, 56, -32, 22, 64, 10); g.fillStyle = shade(S().ui.gold, -0.6); g.fill();
    seg(g, [[-52, -12], [52, -12]], 3, shade(S().ui.gold, -0.6));                             // wood grain
    seg(g, [[-52, 12], [52, 12]], 3, shade(S().ui.gold, -0.6));
    seg(g, [[58, 2], [238, 30]], 18, shade(S().ui.gold, -0.45));                              // handle
    seg(g, [[58, 2], [238, 30]], 18, alpha(shade(S().ui.gold, -0.65), 0.35));
    circle(g, 246, 31, 11, shade(S().ui.gold, -0.6));                                          // handle knob
    g.restore();
    glow(g, gx, gy, 150, M.practical, 0.2);
    // shadow of a hand descending from the top of the frame toward the gavel's head
    const drop = ease.in(prog(t, 0.4, info.dur - 0.5));
    const hy = lerp(-300, gy - 150, drop);
    g.save(); g.globalAlpha = 0.38; g.fillStyle = S().ink;
    g.beginPath(); g.ellipse(gx, hy, 62, 78, 0.1, 0, Math.PI * 2); g.fill();                    // palm
    for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(gx - 40 + i * 27, hy + 78, 13, 36, 0.05 * (i - 1.5), 0, Math.PI * 2); g.fill(); }  // fingers reaching down
    g.beginPath(); g.ellipse(gx - 72, hy + 30, 13, 30, 0.5, 0, Math.PI * 2); g.fill();          // thumb
    g.restore();
  });
  FX.dust(g, t, { count: 20, color: M.practical, a: 0.25 });
} });

// s173b — insert: a metal sliding bolt on a dark cell door; the bolt slides shut with a sharp vibration.
registerShot('s173b', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.05 + 0.04 * k, x: lerp(-40, 40, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.35), shade(M.dark, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    // dark cell door
    const dx = E.W / 2 - 340, dy = E.H * 0.1, dw = 680, dh = E.H * 0.8;
    rr(g, dx, dy, dw, dh, 8); g.fillStyle = linGrad(g, dx, dy, dx + dw, dy, ['#4a4a52', '#33333c', '#23232a']); g.fill();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(dx + 20, dy + 20, 12, dh - 40);
    for (const [rx, ry] of [[30, 30], [dw - 30, 30], [30, dh - 30], [dw - 30, dh - 30]]) circle(g, dx + rx, dy + ry, 7, '#191920');
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.46;
    // the bolt housing + the sliding bolt
    rr(g, cx - 260, cy - 46, 520, 92, 10); g.fillStyle = shade(M.wall, -0.45); g.fill();
    const slide = ease.out(prog(t, 0.5, 1.3));
    const shut = t > 1.3;
    const jolt = shut ? shake(t, 5, 30, 6) : [0, 0];
    const bx = cx - 200 + slide * 260 + jolt[0];
    rr(g, bx - 90, cy - 30 + jolt[1], 260, 60, 8); g.fillStyle = S().feature; g.fill();
    g.strokeStyle = shade(S().feature, -0.3); g.lineWidth = 3; g.stroke();
    circle(g, bx + 90, cy + jolt[1], 16, shade(S().feature, -0.3));
    glow(g, bx, cy, 140, S().feature, 0.12);
    if (shut) FX.rings(g, bx + 90, cy, t - 1.3, { count: 2, r0: 40, r1: 180, speed: 2.4, color: '#ffffff', a: 0.35 * (1 - prog(t, 1.3, 2.0)) });
  });
  FX.dust(g, t, { count: 14, color: M.key, a: 0.18 });
} });

// s174a — blueprint: an April calendar grid appears; a thick red circle is drawn around a date; the 560-months bar fills.
registerShot('s174a', { draw(g, t, info) {
  const M = mood('void'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.05 * k, y: lerp(-30, 30, k) };
  UI.blueprint(g, { grid: 60, a: 0.09 });
  layer(g, cam, 1, (g) => {
    text(g, 'APRIL 2023', E.W / 2, E.H * 0.14, { size: 54, color: S().ui.blueprint, font: FONTS.ui, weight: 900, spacing: 4 });
    // calendar grid, 7 x 5
    const gx = E.W / 2 - 350, gy = E.H * 0.2, cw = 100, ch = 74;
    g.strokeStyle = alpha(S().ui.blueprint, 0.45); g.lineWidth = 2;
    for (let i = 0; i <= 7; i++) { seg(g, [[gx + i * cw, gy], [gx + i * cw, gy + 5 * ch]], 2, alpha(S().ui.blueprint, 0.45)); }
    for (let j = 0; j <= 5; j++) { seg(g, [[gx, gy + j * ch], [gx + 7 * cw, gy + j * ch]], 2, alpha(S().ui.blueprint, 0.45)); }
    // red ink circle drawing around one date cell
    const cx = gx + 3.5 * cw, cy = gy + 2.5 * ch;
    const cp = ease.out(prog(t, 0.6, 1.6));
    g.strokeStyle = S().ui.accent; g.lineWidth = 9; g.lineCap = 'round';
    g.beginPath(); g.arc(cx, cy, 52, -Math.PI / 2, -Math.PI / 2 + cp * Math.PI * 2); g.stroke();
    // 560 MONTHS bar filling beneath
    const by = E.H * 0.72;
    text(g, '560 MONTHS', E.W / 2, by - 30, { size: 44, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3 });
    const bp = ease.inOut(prog(t, 0.4, info.dur - 0.4));
    rr(g, E.W * 0.2, by, E.W * 0.6, 30, 15); g.fillStyle = alpha(S().ui.blueprint, 0.2); g.fill();
    rr(g, E.W * 0.2, by, Math.max(30, E.W * 0.6 * bp), 30, 15); g.fillStyle = S().ui.accent; g.fill();
    if (bp > 0.85) text(g, 'MORE THAN 46 YEARS', E.W / 2, by + 80, { size: 46, color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(S().ui.gold, 0.6), alpha: (bp - 0.85) / 0.15 });
  });
  FX.dust(g, t, { count: 12, color: S().ui.blueprint, a: 0.18 });
} });

// s174b — insert: the teeth of a metal handcuff; the cuff closes one notch with a sharp mechanical click.
registerShot('s174b', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.06 + 0.04 * k, y: lerp(30, -20, k) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, [shade(M.wall, -0.4), shade(M.dark, -0.2)]); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    glow(g, E.W / 2, E.H * 0.5, 380, M.key, 0.14);
  });
  layer(g, cam, 1, (g) => {
    const cx = E.W / 2, cy = E.H * 0.5, R = 230;
    // the cuff ring
    ring(g, cx, cy, R, 26, S().feature);
    ring(g, cx, cy, R, 26, alpha(S().ink, 0.25));
    // teeth along the inner arc
    for (let i = 0; i < 12; i++) {
      const a = -0.4 + i * 0.22;
      const x1 = cx + Math.cos(a) * (R - 16), y1 = cy + Math.sin(a) * (R - 16);
      const x2 = cx + Math.cos(a) * (R - 44), y2 = cy + Math.sin(a) * (R - 44);
      seg(g, [[x1, y1], [x2, y2]], 7, shade(S().feature, -0.25));
    }
    // the closing arm: swings one notch at the click, then a sharp jolt
    const click = 1.1;
    const close = ease.out(prog(t, click, click + 0.4));
    const jolt = t > click + 0.4 ? shake(t, 4, 32, 9) : [0, 0];
    g.save(); g.translate(cx + jolt[0], cy + jolt[1]); g.rotate(0.5 - close * 0.16);
    seg(g, [[0, 0], [R * 0.9, -R * 0.45]], 30, S().feature);
    circle(g, R * 0.9, -R * 0.45, 34, S().feature);
    g.restore();
    if (t > click + 0.4) FX.rings(g, cx, cy, t - click - 0.4, { count: 2, r0: R, r1: R + 160, speed: 2.2, color: '#ffffff', a: 0.35 * (1 - prog(t, click + 0.4, click + 1.2)) });
    glow(g, cx, cy, 260, S().feature, 0.1);
  });
  FX.dust(g, t, { count: 14, color: M.key, a: 0.2 });
} });

// s175 — wide: a long narrow prison corridor; slow symmetrical zoom down the hall toward a dim light fixture.
registerShot('s175', { draw(g, t, info) {
  const M = mood('night'), k = ease.inOut(t / info.dur);
  const cam = { z: 1.0 + 0.12 * k, r: 0.006 * Math.sin(t * 0.8) };
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, -0.45); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    const vx = E.W / 2, vy = E.H * 0.46;
    // converging corridor lines
    g.strokeStyle = shade(M.wall, -0.2); g.lineWidth = 4;
    seg(g, [[-E.W, -E.H], [vx, vy]], 4, shade(M.wall, -0.2));
    seg(g, [[E.W * 2, -E.H], [vx, vy]], 4, shade(M.wall, -0.2));
    seg(g, [[-E.W, E.H * 2], [vx, vy]], 4, shade(M.wall, -0.2));
    seg(g, [[E.W * 2, E.H * 2], [vx, vy]], 4, shade(M.wall, -0.2));
    // closed doors down both sides, shrinking toward the vanishing point
    for (let i = 0; i < 5; i++) {
      const d = i / 5, w = lerp(300, 60, d), h = lerp(560, 130, d);
      const lx = lerp(60, vx - 130, d), rx = lerp(E.W - 60 - w, vx + 70, d), y = lerp(E.H * 0.78 - h, vy - h / 2 - 10, d);
      rr(g, lx, y, w, h, 6); g.fillStyle = shade(M.wall, -0.25 - d * 0.2); g.fill();
      rr(g, rx, y, w, h, 6); g.fillStyle = shade(M.wall, -0.25 - d * 0.2); g.fill();
    }
    // floor
    g.fillStyle = shade(M.floor, -0.2);
    poly(g, [[-E.W, E.H * 2], [vx - 60, vy + 60], [vx + 60, vy + 60], [E.W * 2, E.H * 2]], shade(M.floor, -0.2));
    // dim light fixture at the end of the hall
    const flick = 0.75 + 0.25 * Math.sin(t * 7);
    glow(g, vx, vy - 40, 200, M.practical, 0.5 * flick);
    circle(g, vx, vy - 40, 22, M.practical);
    FX.lightCone(g, vx, vy - 40, { angle: Math.PI / 2, spread: 0.5, len: 500, color: M.practical, a: 0.1 * flick });
  });
  FX.dust(g, t, { count: 16, color: M.practical, a: 0.22 });
  FX.fog(g, E.H * 0.4, 180, M.fog, 0.2);
} });

// s176 — medium: two teens reflected in the car's rear-view mirror; the dawn beach behind them.
registerShot('s176', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.03 + 0.05 * k, x: lerp(40, -40, k) };
  blurLayer(g, 12, (g) => beach(g, t, { z: 1.4, x: 100, y: -60 }, { mood: 'golden' })); veil(g, '#1a1010', 0.25);
  const M = mood('golden');
  layer(g, cam, 1, (g) => {
    // rear-view mirror frame, foreground
    const mx = E.W / 2, my = E.H * 0.42, mw = 760, mh = 300;
    rr(g, mx - mw / 2 - 14, my - mh / 2 - 14, mw + 28, mh + 28, 18); g.fillStyle = S().ink; g.fill();
    rr(g, mx - mw / 2, my - mh / 2, mw, mh, 12); g.fillStyle = linGrad(g, mx - mw / 2, my, mx + mw / 2, my, ['#3a4a6a', '#5a6a8a', '#3a4a6a']); g.fill();
    glow(g, mx, my, 320, M.key, 0.18);
    // the two teens reflected in the mirror, sitting on the car hood, looking at the sea
    const rim = { color: M.rim, dir: [0, -1], w: 4 };
    g.save(); g.beginPath(); g.rect(mx - mw / 2, my - mh / 2, mw, mh); g.clip();
    g.globalAlpha = 0.92;
    drawFigure(g, { x: mx - 170, y: my + mh / 2 - 6, s: 0.85, facing: 1, outfit: TEEN, pose: breathe(POSES.sit, t), expr: 'sad', rim });
    drawFigure(g, { x: mx + 170, y: my + mh / 2 - 6, s: 0.85, facing: -1, outfit: TEEN, pose: breathe(POSES.sit, t, 1, 2), expr: 'sad', rim });
    // dawn sky sheen across the glass
    g.fillStyle = alpha(M.key, 0.12); g.fillRect(mx - mw / 2, my - mh / 2, mw, 60);
    g.restore();
    // mirror stem down to the dashboard
    seg(g, [[mx, my + mh / 2 + 14], [mx, my + mh / 2 + 110]], 16, S().ink);
    // dashboard hint at the bottom
    rr(g, -E.W, E.H * 0.88, E.W * 3, 300, 40); g.fillStyle = shade(M.wall, -0.5); g.fill();
  });
  FX.dust(g, t, { count: 14, color: M.key, a: 0.2 });
  FX.lensStreak(g, E.W / 2, E.H * 0.42, E.W, M.key, 0.1);
} });

// s177a — wide: beach at dawn; a wave of white sea-foam washes over the base of the suitcase on the dark rocks.
registerShot('s177a', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: 1.02 + 0.07 * k, x: -30 * k };
  const { GY, CX, M } = beach(g, t, cam, { mood: 'golden', suitcase: true });
  layer(g, cam, 1, (g) => {
    // foam washing over the base of the suitcase on the rocks
    const rx0 = CX - V(760, 560) + V(60, 40);
    const foam = ease.inOut(prog(t, 0.4, info.dur - 0.3));
    g.fillStyle = alpha(S().feature, 0.5 + 0.3 * foam);
    g.beginPath(); g.ellipse(rx0, GY + 6 + foam * 10, 260 + foam * 120, 16 + foam * 14, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = alpha(S().feature, 0.35);
    g.beginPath(); g.ellipse(rx0 + 120, GY + 26, 200, 12, 0, 0, Math.PI * 2); g.fill();
    // gulls at dawn
    const gx = lerp(E.W + 80, -80, prog(t, 0, info.dur));
    g.fillStyle = S().feature; g.beginPath(); g.ellipse(gx, E.H * 0.18, 14, 3.5, -0.3, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(gx + 16, E.H * 0.18, 14, 3.5, 0.3, 0, Math.PI * 2); g.fill();
  });
  FX.godRays(g, CX + V(500, 240), GY - V(330, 760), { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1200, a: 0.05, t });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.22 });
} });

// s177b — medium: the phone on the sand; a gloved hand lifts the evidence bag containing it out of the frame into the light.
registerShot('s177b', { draw(g, t, info) {
  const k = ease.inOut(t / info.dur);
  const cam = { z: lerp(1.1, 1.0, k), x: 24 * k };
  const { GY, CX, M } = beach(g, t, cam, { mood: 'golden' });
  layer(g, cam, 1, (g) => {
    const px = CX - V(120, 80), py = GY + V(90, 110);
    const lift = ease.inOut(prog(t, 0.6, info.dur - 0.3));
    const by = py - lift * 420;
    // evidence bag (translucent) with the phone inside, lifted into the light
    g.save(); g.translate(px, by);
    rr(g, -150, -260, 300, 420, 10); g.fillStyle = alpha(S().ui.blueprint, 0.16); g.fill();
    g.strokeStyle = alpha(S().ui.blueprint, 0.7); g.lineWidth = 3; g.stroke();
    // the phone inside the bag: dark screen reflecting dawn clouds
    rr(g, -80, -180, 160, 280, 12); g.fillStyle = '#10141f'; g.fill();
    g.fillStyle = alpha(M.key, 0.35); g.beginPath(); g.ellipse(0, -100, 60, 14, -0.2, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.ellipse(10, -40, 50, 12, 0.2, 0, Math.PI * 2); g.fill();
    // plastic seal strip across the top of the bag
    rr(g, -150, -260, 300, 34, 6); g.fillStyle = S().ui.gold; g.fill();
    text(g, 'EVIDENCE', 0, -236, { size: 22, color: S().ink, font: FONTS.ui, weight: 900, spacing: 2 });
    g.restore();
    // gloved hand holding the bag from above
    const hx = px, hy = by - 300;
    seg(g, [[hx - 30, hy - 20], [hx - 60, -E.H * 0.2]], 60, S().feature);
    seg(g, [[hx + 40, hy - 20], [hx + 80, -E.H * 0.2]], 60, S().feature);
    circle(g, hx, hy, 44, S().feature);
    for (let i = 0; i < 4; i++) circle(g, hx - 30 + i * 20, hy + 34, 13, S().feature);
    glow(g, px, by - 100, 260, M.key, 0.25 + 0.2 * lift);
  });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.22 });
  FX.lensStreak(g, CX + V(500, 240), GY - V(330, 760), E.W, M.key, 0.12);
} });
