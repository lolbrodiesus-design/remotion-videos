// shots/01_hartsoe_a.js — Hartsoe story, part A: s001a–s007 (cold open → the search).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { street } from '../sets/street.js';
import { livingroom } from '../sets/livingroom.js';
import { SAMANTHA } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

// breath fog curling past a face (cold air)
function breathFog(g, x, y, t, seed = 1) {
  g.save(); g.strokeStyle = 'rgba(190,215,255,.34)'; g.lineWidth = 6; g.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const drift = ((t * 60 + i * 140) % 320), a = 0.34 * (1 - drift / 320);
    g.strokeStyle = `rgba(190,215,255,${a.toFixed(3)})`;
    g.beginPath(); g.moveTo(x, y + i * 26 - 13);
    g.bezierCurveTo(x + 60 + drift * 0.4, y - 30 + i * 26, x + 120 + drift * 0.6, y + 20 + i * 26, x + 180 + drift, y - 10 + i * 26);
    g.stroke();
  }
  g.restore();
}

// s001a — "In 2021, a woman in New York …"  Wide: Manhattan skyline, tilt down from the moon to one lit window
registerShot('s001a', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1 + 0.06 * ease.inOut(t / D), y: lerp(-160, 60, ease.inOut(t / D)) };
  layer(g, cam, 0.12, (g) => {
    g.fillStyle = linGrad(g, 0, 0, 0, E.H, M.sky); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    FX.stars(g, t, { seed: 3, count: 70, area: [0, 0, E.W, E.H * 0.5], color: '#dfe8ff' });
    FX.moon(g, E.W * 0.8, E.H * 0.14, 34, '#e8ecff');
  });
  layer(g, cam, 0.3, (g) => { FX.skyline(g, { seed: 7, y: E.H * 0.78, minH: 60, maxH: 220, color: '#1c1830', lit: 0.3 }); });
  layer(g, cam, 0.5, (g) => { FX.skyline(g, { seed: 11, y: E.H * 0.86, minH: 120, maxH: 330, color: '#120e1c', lit: 0.22 }); });
  // foreground building, one amber window glowing
  layer(g, cam, 0.7, (g) => {
    const GY = E.H * 0.86, bx = E.W / 2 - 280, bw = 560, bh = 560;
    g.fillStyle = '#0e0a14'; g.fillRect(bx, GY - bh, bw, bh + 4);
    const wx = E.W / 2 - 70, wy = GY - 400, ww = 140, wh = 170;
    const pulse = 0.85 + 0.15 * Math.sin(t * 2);
    g.fillStyle = linGrad(g, wx, wy, wx, wy + wh, ['#ffd9a0', '#e8a85c']); g.fillRect(wx, wy, ww, wh);
    glow(g, wx + ww / 2, wy + wh / 2, 220 * pulse, '#ffcf8a', 0.5 * pulse);
    seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 4, 'rgba(0,0,0,.45)');
    seg(g, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 4, 'rgba(0,0,0,.45)');
    FX.lensStreak(g, wx + ww / 2, wy + wh / 2, E.W * 0.7, '#ffe0b0', 0.16);
  });
  FX.fog(g, E.H * 0.78, 150, M.fog, 0.22);
  FX.dust(g, t, { count: 24, color: '#ffe0b0', a: 0.25 });
} });

// s001b — "… felt cold air in her bathroom, and"  Insert: POM ONLY — black beanie crown + grey pom, bobbing in the cold draught, NO face
registerShot('s001b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.4, x: -120, y: -80 }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.42);
  const push = 1 + 0.05 * ease.inOut(t / D);
  const cx = E.W / 2, bobY = Math.sin(t * 2.2) * 14, swayX = Math.sin(t * 1.8) * 16;
  const domeTop = E.H * 0.44 + bobY;
  // the black beanie crown, large in frame — a dome rising from the bottom edge
  g.save(); g.translate(cx, 0); g.scale(push, push); g.translate(-cx, 0);
  g.fillStyle = SAMANTHA.headColor;
  g.beginPath(); g.ellipse(cx, domeTop + 430, 560, 430, 0, 0, 7); g.fill();
  // knit ridges on the crown
  g.save(); g.strokeStyle = 'rgba(255,255,255,.10)'; g.lineWidth = 5;
  for (let i = 0; i < 4; i++) {
    g.beginPath(); g.ellipse(cx, domeTop + 430, 560 - i * 110, 430 - i * 88, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
  }
  g.restore();
  // rim crescent on the lit side of the crown
  g.save(); g.strokeStyle = M.rim; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); g.ellipse(cx, domeTop + 430, 560, 430, 0, Math.PI * 1.25, Math.PI * 1.62); g.stroke(); g.restore();
  // the grey pom, large, bobbing and shivering in the draught
  const px = cx + swayX, py = domeTop;
  circle(g, px, py, 118, shade(S().ink, 0.55));
  g.save(); g.strokeStyle = shade(S().ink, 0.75); g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2 + Math.sin(t * 2.6) * 0.06;
    g.beginPath(); g.moveTo(px + Math.cos(a) * 96, py + Math.sin(a) * 96);
    g.lineTo(px + Math.cos(a) * 128, py + Math.sin(a) * 128); g.stroke();
  }
  g.restore();
  g.save(); g.strokeStyle = M.rim; g.lineWidth = 6; g.lineCap = 'round';
  g.beginPath(); g.arc(px, py, 112, -2.4, -0.6); g.stroke(); g.restore();
  g.restore();
  breathFog(g, cx + 190, domeTop + 60, t);
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.3 });
} });

// s002 — "and she could not find where it was coming from."  Insert: the bathroom DOOR filling the frame, bright cold light in the gap at the bottom
registerShot('s002', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.02 + 0.07 * ease.inOut(t / D), x: lerp(30, -30, ease.inOut(t / D)) };
  const GY = E.H * 0.82;
  // wall strips at the frame edges, floor tiles below
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, -0.45); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.fillStyle = shade(M.floor, -0.2); g.fillRect(-E.W, GY, E.W * 3, E.H);
    g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
    for (let y = GY + 60; y < E.H + 40; y += 60) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
    for (let x = -E.W; x < E.W * 2; x += 220) { g.beginPath(); g.moveTo(x, GY); g.lineTo(x, E.H + 40); g.stroke(); }
  });
  // the door slab, filling the frame
  const dx0 = E.W * 0.22, dx1 = E.W * 0.78, dy0 = -E.H * 0.06;
  layer(g, cam, 0.7, (g) => {
    g.fillStyle = linGrad(g, dx0, 0, dx1, 0, [shade(M.wall, -0.05), shade(M.wall, -0.25)]);
    g.fillRect(dx0, dy0, dx1 - dx0, GY - dy0);
    // door frame trim
    g.fillStyle = shade(M.wall, 0.12);
    g.fillRect(dx0 - 26, dy0, 26, GY - dy0); g.fillRect(dx1, dy0, 26, GY - dy0);
    // recessed panels
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 6;
    g.strokeRect(dx0 + 90, 90, (dx1 - dx0) - 180, 380);
    g.strokeRect(dx0 + 90, 540, (dx1 - dx0) - 180, 300);
    // knob, catching the cold light
    circle(g, dx1 - 90, GY - 260, 26, shade(S().ink, 0.5));
    circle(g, dx1 - 96, GY - 266, 8, alpha('#dfe8ff', 0.8));
    glow(g, dx1 - 90, GY - 260, 90, '#cfe0ff', 0.25);
  });
  // the bright cold light band in the GAP at the bottom of the door
  const band = 0.75 + 0.25 * Math.sin(t * 2.4);
  layer(g, cam, 0.9, (g) => {
    g.fillStyle = `rgba(210,230,255,${band.toFixed(3)})`;
    g.fillRect(dx0, GY - 16, dx1 - dx0, 18);
    glow(g, E.W / 2, GY - 6, 420, '#bcd8ff', 0.55 * band);
    FX.pool(g, E.W / 2, GY + 46, 520, 30, '#bcd8ff', 0.22 * band);
    FX.lightCone(g, E.W / 2, GY - 10, { angle: Math.PI / 2, spread: 0.9, len: 260, color: '#bcd8ff', a: 0.10 * band });
  });
  // cold blue mist rolling across the floor tiles
  for (let i = 0; i < 4; i++) {
    const mx = (((i * 430 + t * 46) % (E.W + 500)) - 250);
    const my = GY + 40 + i * 42;
    g.save(); g.fillStyle = `rgba(140,180,255,${(0.10 - i * 0.015).toFixed(3)})`;
    g.beginPath(); g.ellipse(mx, my, 260 - i * 30, 16 + i * 3, 0, 0, 7); g.fill(); g.restore();
  }
  FX.fog(g, GY, 140, '#8fb4ff', 0.18);
} });

// s003 — "Her name was Samantha Hartsoe."  front CU, eyes darting as a shadow passes behind her
registerShot('s003', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.6, x: lerp(-160, 60, ease.inOut(t / D)), y: -120 }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.38);
  // a shadow passes behind her
  const shx = lerp(-E.W * 0.2, E.W * 1.2, ease.inOut(prog(t, 0.7, 2.1)));
  g.save(); g.globalAlpha = 0.5; g.fillStyle = S().ink;
  circle(g, shx, E.H * 0.42, 90, S().ink);
  g.beginPath(); g.ellipse(shx, E.H * 0.72, 130, 190, 0, 0, 7); g.fill(); g.restore();
  const lookX = Math.sin(t * 4.2) > 0 ? 0.7 : -0.7;
  const r = V(300, 330) * (1 + 0.03 * ease.inOut(t / D));
  bigFace(g, E.W / 2, E.H * 0.58, r, { outfit: SAMANTHA, expr: 'worried', look: [lookX, -0.1], rimColor: M.rim, rimSide: -1, blink: (t % 2.8) > 2.7 });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s004a — "She was 26 years old, and she lived …"  Wide: three-story apartment building exterior
registerShot('s004a', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1 + 0.12 * ease.inOut(t / D), y: lerp(-80, 60, ease.inOut(t / D)) };
  street(g, t, cam, { variant: 'building' });
  // extra pulse on the middle-floor centre window (the glowing amber one)
  const GY = E.H * 0.8, fx = E.W / 2 - 660, fy = GY - 780;
  const wx = fx + 90 + 495, wy = fy + 80 + 225;
  const pulse = 0.75 + 0.25 * Math.sin(t * 2.4);
  glow(g, wx + 75, wy + 85, 200 * pulse, '#ffcf8a', 0.35 * pulse);
  FX.lensStreak(g, wx + 75, wy + 85, E.W * 0.6, '#ffe0b0', 0.12);
} });

// s004b — "… in an apartment on Roosevelt Island with two roommates."  Medium: kitchen table, three chairs, one candle
registerShot('s004b', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1.02 + 0.05 * ease.inOut(t / D), y: lerp(50, -30, ease.inOut(t / D)) };
  const { GY } = livingroom(g, t, cam, { variant: 'kitchen', candle: true });
  const s = 1.15, tx = E.W / 2;
  const roomA = { top: 'tshirt', color: '#3a3a44', head: 'none' };
  const roomB = { top: 'hoodie', color: '#2c2c38', head: 'cap', headColor: '#2c2c38' };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: tx - 300, y: GY, s, facing: 1, outfit: roomA, pose: breathe(POSES.sit, t, 1, 1), expr: 'neutral', rim: { color: M.rim, dir: [0.6, -1] }, shadow: false, blink: (t % 3.1) > 3.0 });
    drawFigure(g, { x: tx, y: GY, s, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.sit, t, 1, 2), expr: 'neutral', rim: { color: M.rim, dir: [0, -1] }, shadow: false, blink: (t % 3.3) > 3.2 });
    drawFigure(g, { x: tx + 300, y: GY, s, facing: -1, outfit: roomB, pose: breathe(POSES.sit, t, 1, 3), expr: 'neutral', rim: { color: M.rim, dir: [-0.6, -1] }, shadow: false, blink: (t % 2.9) > 2.8 });
  });
  FX.dust(g, t, { count: 26, color: '#ffe2b0', a: 0.3 });
  FX.pool(g, tx + 150, GY + 30, 240, 24, '#ffd28a', 0.1);
} });

// s005 — "It was March, and her bathroom was freezing."  Medium: Samantha shivering, arms hugged tight
registerShot('s005', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05 + 0.05 * ease.inOut(t / D), x: Math.sin(t * 0.8) * 40 };
  bathroom(g, t, cam, { mood: 'interiorCool' });
  const hug = { ...POSES.stand, eF: [20, -150], hF: [34, -170], eB: [-18, -148], hB: [-30, -168] };
  const jx = Math.sin(t * 28) * 4, jy = Math.sin(t * 33) * 2;
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 100 + jx, y: E.H * 0.8 + jy, s: 1.5, facing: 1, outfit: SAMANTHA, pose: breathe(hug, t), expr: 'scared', rim: rim(M, [1, -0.3]), blink: (t % 2.7) > 2.6 });
  });
  // jagged vibration lines around her limbs
  const hx = E.W / 2 - 100, hy = E.H * 0.8;
  g.save(); g.strokeStyle = 'rgba(200,225,255,.55)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 5; i++) {
    const ox = -90 + i * 45, oy = -260 + (i % 2) * 120, j = Math.sin(t * 30 + i * 2.1) * 7;
    g.beginPath();
    g.moveTo(hx + ox, hy + oy);
    g.lineTo(hx + ox + 14 + j, hy + oy + 18); g.lineTo(hx + ox - 6 - j, hy + oy + 36); g.lineTo(hx + ox + 10 + j, hy + oy + 54);
    g.stroke();
  }
  g.restore();
  breathFog(g, hx + 60, hy - 300, t, 2);
  FX.fog(g, E.H * 0.72, 160, '#8fb4ff', 0.2);
} });

// s006 — "No matter how high she turned up the heat, she was still cold."  Wide: digital wall thermostat, 70 → 62
registerShot('s006', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1 + 0.04 * ease.inOut(t / D), x: lerp(-40, 40, ease.inOut(t / D)), y: lerp(20, -20, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mood: 'interiorCool' });
  // thermostat on the left wall
  const tx = E.W / 2 - 860, ty = GY - 620, tw = 170, th = 120;
  layer(g, cam, 0.55, (g) => {
    rr(g, tx - 10, ty - 10, tw + 20, th + 20, 10); g.fillStyle = '#1c1820'; g.fill();
    rr(g, tx, ty, tw, th, 8); g.fillStyle = '#0a0e18'; g.fill();
    const v = Math.round(70 - 8 * ease.inOut(prog(t, 0.6, 2.8)));
    const flick = Math.sin(t * 37) > 0.85 ? v - 1 : v;
    const a = 0.75 + 0.25 * Math.sin(t * 13);
    glow(g, tx + tw / 2, ty + th / 2, 150, '#ffd47e', 0.18 * a);
    text(g, `${flick}°`, tx + tw / 2, ty + th / 2 - 8, { size: 56, color: S().ui.gold, glow: 16, glowColor: alpha(S().ui.gold, 0.6), alpha: a });
    text(g, 'HEAT', tx + tw / 2, ty + th - 18, { size: 20, color: S().ui.cream, alpha: 0.8 });
  });
  // Samantha small at the right edge, still shivering
  const hug = { ...POSES.stand, eF: [20, -150], hF: [34, -170], eB: [-18, -148], hB: [-30, -168] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 + 620 + Math.sin(t * 28) * 3, y: GY, s: 0.95, facing: -1, outfit: SAMANTHA, pose: breathe(hug, t, 1, 2), expr: 'sad', rim: rim(M, [1, -0.3]) });
  });
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.28 });
} });

// s007 — "She checked the door. She checked the light switch."  Insert: a hand flips the switch, amber flash
registerShot('s007', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.8, x: 160, y: -140 }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.35);
  const cam = { z: 1.3 + 0.2 * ease.inOut(t / D) };
  const sx = E.W / 2 - 120, sy = E.H * 0.42, sw = 150, sh = 210;
  const flip = ease.out(prog(t, 1.15, 1.35));
  const flash = t > 1.2 ? 0.4 * (1 - prog(t, 1.2, 2.1)) : 0;
  // switch plate + toggle
  layer(g, cam, 1, (g) => {
    rr(g, sx - 14, sy - 14, sw + 28, sh + 28, 12); g.fillStyle = '#d8d4cc'; g.fill();
    rr(g, sx, sy, sw, sh, 8); g.fillStyle = '#efece4'; g.fill();
    g.save(); g.translate(sx + sw / 2, sy + sh / 2); g.rotate(lerp(-0.28, 0.28, flip));
    rr(g, -26, -56, 52, 112, 8); g.fillStyle = '#8d97a3'; g.fill(); g.restore();
    if (flash > 0) { glow(g, sx + sw / 2, sy + sh / 2, 320, '#ffcf8a', flash); }
  });
  // thin tapered forearm entering from the frame edge — shoulder off-frame right, wrist at the switch
  const hx = lerp(E.W + 180, sx + sw + 60, ease.out(prog(t, 0.2, 1.1)));
  const hy = sy + sh / 2 + 10;
  const ex = hx + 150, ey = hy + 130;              // elbow
  const shx = E.W + 90, shy = hy + 320;            // shoulder, off the frame edge
  layer(g, cam, 1, (g) => {
    // pink sleeve: shoulder → elbow
    seg(g, [[shx, shy], [ex, ey]], 40, SAMANTHA.color);
    // bare forearm, thin and tapered: elbow → wrist
    seg(g, [[ex, ey], [hx + 26, hy + 22]], 26, S().ink);
    seg(g, [[hx + 60, hy + 34], [hx + 26, hy + 22]], 20, S().ink);
    // rim light along the top of the forearm
    seg(g, [[ex - 4, ey - 14], [hx + 30, hy + 6]], 4, alpha(M.rim, 0.8));
    // hand at the switch
    circle(g, hx, hy, 32, S().ink);
    seg(g, [[hx - 8, hy - 8], [sx + sw + 6, sy + sh / 2]], 15, S().ink);
    for (let i = 0; i < 3; i++) seg(g, [[hx - 18 + i * 9, hy + 14], [hx - 28 + i * 11, hy + 44]], 12, S().ink);
  });
  if (flash > 0) veil(g, '#ffcf8a', flash * 0.5);
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });
