// shots/01_hartsoe_b.js — Hartsoe story, part B: s008–s016 (no vent → the hole → viral).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { SAMANTHA } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

// cupped hand behind an ear (insert close-up)
function cupHand(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  seg(g, [[-20, 40], [-160, 150]], 60 * s, S().ink);
  seg(g, [[-50, 62], [-160, 150]], 84 * s, SAMANTHA.color);
  circle(g, 0, 0, 34 * s, S().ink);
  for (let i = 0; i < 4; i++) {
    const a = -2.4 + i * 0.45;
    seg(g, [[0, 0], [Math.cos(a) * 62 * s, Math.sin(a) * 62 * s]], 14 * s, S().ink);
  }
  seg(g, [[6 * s, 18 * s], [-42 * s, 52 * s]], 15 * s, S().ink);
  g.restore();
}

// hammer, drawn at (x,y) rotated ang; glint 0..1
function hammer(g, x, y, ang, s = 1, glint = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  seg(g, [[0, 0], [0, -90 * s]], 12 * s, '#3a2c22');
  rr(g, -34 * s, -112 * s, 68 * s, 26 * s, 6 * s); g.fillStyle = '#8d97a3'; g.fill();
  seg(g, [[34 * s, -99 * s], [58 * s, -112 * s]], 10 * s, '#8d97a3');
  if (glint > 0) FX.sparkle(g, 20 * s, -100 * s, 26 * s, '#ffe9b0', glint);
  g.restore();
}

// heart shape (TikTok UI)
function heart(g, x, y, s, color, a = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a; g.fillStyle = color;
  g.beginPath(); g.moveTo(0, 10);
  g.bezierCurveTo(-16, -4, -10, -18, 0, -8);
  g.bezierCurveTo(10, -18, 16, -4, 0, 10);
  g.fill(); g.restore();
}

// s008 — "There was no vent in the bathroom."  The ACTUAL ceiling corner: ceiling plane + two walls meeting at a seam, vent outline large
registerShot('s008', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.04 + 0.05 * ease.inOut(t / D), x: lerp(-30, 30, ease.inOut(t / D)) };
  const seamX = E.W * 0.52, seamY = E.H * 0.34;
  layer(g, cam, 0.5, (g) => {
    // ceiling plane (top, receding to the seam point)
    poly(g, [[-E.W, -E.H], [E.W * 2, -E.H], [seamX, seamY]], shade(M.wall, -0.55));
    // left wall and right wall meeting at the vertical seam
    poly(g, [[-E.W, -E.H], [seamX, seamY], [seamX, E.H * 2], [-E.W, E.H * 2]], shade(M.wall, -0.35));
    poly(g, [[E.W * 2, -E.H], [seamX, seamY], [seamX, E.H * 2], [E.W * 2, E.H * 2]], shade(M.wall, -0.12));
    // the seam itself, a crisp dark line
    seg(g, [[seamX, seamY], [seamX, E.H]], 5, 'rgba(0,0,0,.5)');
    // ceiling/wall joint lines
    seg(g, [[-E.W, -E.H], [seamX, seamY]], 4, 'rgba(0,0,0,.35)');
    seg(g, [[E.W * 2, -E.H], [seamX, seamY]], 4, 'rgba(0,0,0,.35)');
    // faint tile joints on the walls
    g.save(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(seamX - i * 220, seamY + 40); g.lineTo(seamX - i * 220, E.H); g.stroke(); }
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(seamX + i * 220, seamY + 40); g.lineTo(seamX + i * 220, E.H); g.stroke(); }
    g.restore();
  });
  // the vent outline, LARGE on the right wall — where a vent should be, there is only an outline
  const vx = E.W * 0.74, vy = E.H * 0.56, vw = 300, vh = 300;
  layer(g, cam, 0.7, (g) => {
    g.save(); g.strokeStyle = 'rgba(200,225,255,.4)'; g.lineWidth = 3; g.setLineDash([16, 12]);
    g.strokeRect(vx - vw / 2, vy - vh / 2, vw, vh); g.restore();
    g.save(); g.strokeStyle = 'rgba(200,225,255,.18)'; g.lineWidth = 4;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(vx - vw / 2 + 24, vy - vh / 2 + i * (vh / 5)); g.lineTo(vx + vw / 2 - 24, vy - vh / 2 + i * (vh / 5)); g.stroke(); }
    g.restore();
    // dust motes swirling in a tight circle where the vent should be
    for (let i = 0; i < 14; i++) {
      const a = t * 1.6 + (i / 14) * Math.PI * 2;
      circle(g, vx + Math.cos(a) * 110, vy + Math.sin(a) * 110, 4, alpha('#dfe8ff', 0.7));
    }
    glow(g, vx, vy, 200, '#cfe0ff', 0.12);
  });
  FX.lightCone(g, E.W * 0.2, E.H * 0.05, { angle: Math.PI * 0.42, spread: 0.5, len: 700, color: '#cfe0ff', a: 0.07 });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
} });

// s009 — "There was nothing that should have been blowing cold air."  Insert: cupped hand behind an ear, OTS into the mirror
registerShot('s009', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.5, x: lerp(60, -60, ease.inOut(t / D)), y: -100 }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.4);
  // foreground: back of Samantha's head + shoulder, soft dark silhouette (OTS)
  blurLayer(g, 6, (g) => {
    g.fillStyle = S().ink;
    circle(g, E.W * 0.16, E.H * 0.62, 200, S().ink);
    g.beginPath(); g.ellipse(E.W * 0.16, E.H * 1.05, 340, 260, 0, 0, 7); g.fill();
  }, null, 1.7);
  // the mirror: her eyes reflected, cold wisps curling past
  const mx = E.W * 0.52, my = E.H * 0.3, mw = 560, mh = 420;
  rr(g, mx - 10, my - 10, mw + 20, mh + 20, 10); g.fillStyle = '#2a2430'; g.fill();
  rr(g, mx, my, mw, mh, 8);
  g.fillStyle = linGrad(g, mx, my, mx + mw, my + mh, ['#aebccb', '#7e90a8', '#5c6a7e']); g.fill();
  g.fillStyle = 'rgba(255,255,255,.22)';
  poly(g, [[mx + 40, my + mh], [mx + 180, my], [mx + 250, my], [mx + 110, my + mh]], 'rgba(255,255,255,.22)');
  // beanie arc + two white dot eyes in the reflection
  g.fillStyle = S().ink;
  g.beginPath(); g.ellipse(mx + mw / 2, my + 92, 150, 110, 0, Math.PI, Math.PI * 2); g.fill();
  circle(g, mx + mw / 2 - 8, my + 6, 42, shade(SAMANTHA.headColor, 0.35));
  circle(g, mx + mw / 2 - 52, my + 210, 13, '#ffffff');
  circle(g, mx + mw / 2 + 52, my + 210, 13, '#ffffff');
  g.strokeStyle = 'rgba(160,200,255,.4)'; g.lineWidth = 5; g.lineCap = 'round';
  for (let i = 0; i < 2; i++) {
    const y0 = my + 300 + i * 50, wob = Math.sin(t * 0.7 + i) * 20;
    g.beginPath(); g.moveTo(mx + 40, y0);
    g.bezierCurveTo(mx + 200, y0 - 40, mx + 360, y0 + 40, mx + mw - 30 + wob, y0 - 10); g.stroke();
  }
  // cupped hand, moving slowly across the frame
  cupHand(g, lerp(E.W * 0.3, E.W * 0.42, ease.inOut(t / D)), E.H * 0.68, 1.1, -0.2);
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.3 });
} });

// s010 — "Then she felt it."  three-quarter CU: widened dot-eyes, camera jerks as the cold air hits
registerShot('s010', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 14, (g) => bathroom(g, t, { z: 1.6, x: lerp(-40, 40, ease.inOut(t / D)), y: -120 }, { mood: 'interiorCool' })); veil(g, '#0a1024', 0.38);
  const jerk = t > 0.4 && t < 0.9 ? shake(t, 8 * (1 - prog(t, 0.4, 0.9)), 26) : [0, 0];
  const r = V(300, 330) * (1 + 0.03 * ease.inOut(t / D));
  bigFace(g, E.W / 2 + jerk[0], E.H * 0.58 + jerk[1], r, { outfit: SAMANTHA, expr: 'scared', look: [0, 0], rimColor: M.rim, rimSide: 1 });
  // cold-air lines striking her face
  const sweep = ease.inOut(prog(t, 0.35, 1.0));
  g.save(); g.strokeStyle = `rgba(180,210,255,${(0.6 * (1 - sweep)).toFixed(3)})`; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 3; i++) {
    const y = E.H * 0.58 - 120 + i * 110;
    g.beginPath(); g.moveTo(lerp(-100, E.W * 0.85, sweep) - 220, y); g.lineTo(lerp(-100, E.W * 0.85, sweep), y); g.stroke();
  }
  g.restore();
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s011 — "The cold air was coming from behind her bathroom mirror."  Insert: hands lifting the mirror, blue leak from the crack
registerShot('s011', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.35, y: lerp(-40, 60, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorCool' });
  // mirror lifted off the wall, hands gripping its bottom edge
  const lift = ease.out(prog(t, 0.2, 1.3)) * 260;
  const mx = E.W / 2 - 420, my = GY - 430 - lift, mw = 520, mh = 360;
  layer(g, cam, 0.55, (g) => {
    // thin blue gradient leaking from the crack behind the glass
    const leak = ease.inOut(prog(t, 0.5, 1.8));
    g.fillStyle = `rgba(120,180,255,${(0.28 * leak).toFixed(3)})`;
    poly(g, [[mx + 40, my + mh], [mx + mw - 40, my + mh], [mx + mw - 120, my + mh + 200], [mx + 120, my + mh + 200]], `rgba(120,180,255,${(0.28 * leak).toFixed(3)})`);
    g.save(); g.translate(mx + mw / 2, my + mh / 2); g.rotate(-0.03);
    rr(g, -mw / 2 - 8, -mh / 2 - 8, mw + 16, mh + 16, 10); g.fillStyle = '#2a2430'; g.fill();
    rr(g, -mw / 2, -mh / 2, mw, mh, 8);
    g.fillStyle = linGrad(g, -mw / 2, -mh / 2, mw / 2, mh / 2, ['#cfd8e2', '#9fb0c4', '#7e90a8']); g.fill();
    g.restore();
    // hands at the bottom edge
    cupHand(g, mx + 90, my + mh + 30, 0.9, 0.5);
    cupHand(g, mx + mw - 90, my + mh + 30, 0.9, -0.5);
  });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.32 });
  FX.fog(g, GY - 60, 120, '#8fb4ff', 0.16);
} });

// s012 — "Samantha lifted the mirror off the wall."  Wide: sink area, the dark hole gapes
registerShot('s012', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1 + 0.06 * ease.inOut(t / D), y: lerp(60, -40, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorCool' });
  const liftUp = { ...POSES.stand, eF: [30, -190], hF: [40, -232], eB: [-20, -185], hB: [-30, -228] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W / 2 - 160, y: GY, s: 1.3, facing: 1, outfit: SAMANTHA, pose: breathe(liftUp, t), expr: 'determined', rim: rim(M, [-1, -0.3]) });
    // the mirror, held up above her hands
    const mx = E.W / 2 - 160 - 260, my = GY - 430 - 190 - ease.out(prog(t, 0.3, 1.4)) * 60;
    rr(g, mx - 8, my - 8, 520 + 16, 360 + 16, 10); g.fillStyle = '#2a2430'; g.fill();
    rr(g, mx, my, 520, 360, 8);
    g.fillStyle = linGrad(g, mx, my, mx + 520, my + 360, ['#cfd8e2', '#9fb0c4', '#7e90a8']); g.fill();
  });
  FX.lightCone(g, E.W / 2 - 120, GY - 760, { angle: Math.PI / 2, spread: 0.7, len: 560, color: '#ffe9b0', a: 0.06 });
  FX.dust(g, t, { count: 26, color: '#cfe0ff', a: 0.3 });
} });

// s013 — "Behind it, there was no wall at all."  Insert: jagged drywall edges, face lit by the headlamp
registerShot('s013', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.1, x: Math.sin(t * 1.2) * 30, r: Math.sin(t * 0.6) * 0.012 };
  blurLayer(g, 10, (g) => bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorCool' })); veil(g, '#05040a', 0.45);
  // the pitch-black void with jagged drywall edges
  const hx = E.W * 0.32, hy = E.H * 0.46, hw = 620, hh = 460;
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#05040a';
    g.beginPath();
    const jag = (n, x0, y0, x1, y1) => { for (let i = 0; i <= n; i++) { const px = lerp(x0, x1, i / n) + (i > 0 && i < n ? Math.sin(i * 7.3 + 2) * 16 : 0), py = lerp(y0, y1, i / n) + (i > 0 && i < n ? Math.sin(i * 5.1 + 1) * 16 : 0); g.lineTo(px, py); } };
    g.moveTo(hx - hw / 2, hy - hh / 2); jag(7, hx - hw / 2, hy - hh / 2, hx + hw / 2, hy - hh / 2); jag(6, hx + hw / 2, hy - hh / 2, hx + hw / 2, hy + hh / 2); jag(7, hx + hw / 2, hy + hh / 2, hx - hw / 2, hy + hh / 2); jag(6, hx - hw / 2, hy + hh / 2, hx - hw / 2, hy - hh / 2);
    g.closePath(); g.fill();
    g.strokeStyle = shade(M.wall, 0.15); g.lineWidth = 10; g.stroke();
    // headlamp beam cutting into the black
    FX.lightCone(g, E.W * 0.78, E.H * 0.3, { angle: Math.PI * 0.78, spread: 0.45, len: 700, color: '#fff3dc', a: 0.16 });
    FX.dust(g, t, { count: 20, color: '#dfe8ff', a: 0.35 });
  });
  // Samantha's face peering in, lit by her headlamp
  bigFace(g, E.W * 0.78, E.H * 0.42, 210, { outfit: SAMANTHA, expr: 'scared', look: [-0.7, 0.1], rimColor: '#fff3dc', rimSide: -1, blink: (t % 3.0) > 2.9 });
  circle(g, E.W * 0.78 - 30, E.H * 0.42 - 205, 14, '#fff3dc'); glow(g, E.W * 0.78 - 30, E.H * 0.42 - 205, 90, '#fff3dc', 0.7);
  // hammer at the frame edge
  hammer(g, E.W * 0.94, E.H * 0.82, 0.5, 1.1, 0.5 + 0.4 * Math.sin(t * 3));
} });

// s014 — "There was a dark hole, big enough to climb through."  The hole in the wall, a deep indigo hallway receding through it
registerShot('s014', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1 + 0.12 * ease.inOut(t / D), x: lerp(-30, 30, ease.inOut(t / D)) };
  const hx = E.W / 2 - 420, hy = E.H * 0.5 - 300, hw = 840, hh = 600;
  // the bathroom wall around the hole: brick courses, a pipe, cobwebs
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.wall, -0.35); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.save(); g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = 3;
    for (let y = 0; y < E.H; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
    for (let y = 32; y < E.H; y += 64) for (let x = ((y / 64) % 2 ? 90 : 0); x < E.W; x += 180) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); }
    g.restore();
    // a vertical pipe running down the right of the hole
    g.fillStyle = shade(S().ink, 0.35); g.fillRect(hx + hw + 60, hy - 140, 34, hh + 280);
    g.fillStyle = alpha('#dfe8ff', 0.35); g.fillRect(hx + hw + 64, hy - 140, 6, hh + 280);
    // cobwebs in the top corner of the hole
    g.save(); g.strokeStyle = 'rgba(220,230,255,.35)'; g.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.arc(hx + 10, hy + 6, 40 + i * 34, 0, Math.PI / 2); g.stroke();
    }
    g.restore();
  });
  // the hole itself: concentric frames vanishing to a lit point at the far end
  layer(g, cam, 0.7, (g) => {
    const vx = hx + hw / 2, vy = hy + hh / 2;
    for (let i = 0; i < 6; i++) {
      const k = i / 6, inset = k * 330;
      const iw = hw - inset * 2, ih = hh - inset * 1.7;
      g.fillStyle = shade(M.wall, -0.05 - 0.55 * k);
      g.fillRect(vx - iw / 2, vy - ih / 2, iw, ih);
      g.strokeStyle = `rgba(0,0,0,${(0.25 + 0.1 * i).toFixed(2)})`; g.lineWidth = 8;
      g.strokeRect(vx - iw / 2, vy - ih / 2, iw, ih);
    }
    // the lit point at the end of the hallway — a small doorway glowing
    const lw = 90, lh = 130;
    g.fillStyle = '#fff3dc'; g.fillRect(vx - lw / 2, vy - lh / 2, lw, lh);
    glow(g, vx, vy, 260, '#fff3dc', 0.55);
    // headlamp beam cutting the black from the hole mouth toward the light
    FX.lightCone(g, hx + 60, hy + hh - 40, { angle: -0.12, spread: 0.32, len: 900, color: '#fff3dc', a: 0.16 });
    FX.dust(g, t, { count: 30, color: '#dfe8ff', a: 0.4 });
  });
  FX.fog(g, E.H * 0.5, 140, '#8fb4ff', 0.16);
} });

// s015 — "She posted the video on TikTok, and it went viral."  UI: a phone screen glowing in the dark
registerShot('s015', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.4, x: -100, y: -60 }, { mood: 'interiorCool' })); veil(g, '#05040a', 0.62);
  const cam = { z: 1 + 0.05 * ease.inOut(t / D) };
  const px = E.W / 2, py = E.H / 2, pw = 400, ph = 700;
  layer(g, cam, 1, (g) => {
    // phone frame + glowing screen
    rr(g, px - pw / 2 - 14, py - ph / 2 - 14, pw + 28, ph + 28, 34); g.fillStyle = '#0c0a12'; g.fill();
    rr(g, px - pw / 2, py - ph / 2, pw, ph, 26); g.fillStyle = '#14121e'; g.fill();
    glow(g, px, py, 420, '#8fb4ff', 0.22);
    // video thumbnail: Samantha silhouette in the bathroom, lit by the phone
    rr(g, px - pw / 2 + 24, py - ph / 2 + 24, pw - 48, ph - 220, 16); g.fillStyle = '#1c2440'; g.fill();
    drawFigure(g, { x: px - 40, y: py + 40, s: 0.85, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'worried', rim: { color: '#b8c8ff', dir: [0, -1] }, shadow: false });
    // side icons: heart, comment, share
    heart(g, px + pw / 2 + 62, py - 60, 1.5, '#ff4d6d', 0.9 + 0.1 * Math.sin(t * 5));
    circle(g, px + pw / 2 + 62, py + 30, 26, 'rgba(255,255,255,.16)');
    circle(g, px + pw / 2 + 62, py + 30, 26, 'rgba(255,255,255,0)');
    seg(g, [[px + pw / 2 + 62, py + 118], [px + pw / 2 + 62, py + 168]], 5, '#e8ecff');
    seg(g, [[px + pw / 2 + 62, py + 118], [px + pw / 2 + 84, py + 140]], 5, '#e8ecff');
    seg(g, [[px + pw / 2 + 62, py + 118], [px + pw / 2 + 40, py + 140]], 5, '#e8ecff');
    // hearts pulsing and multiplying upward
    for (let i = 0; i < 8; i++) {
      const rise = ((t * 130 + i * 95) % 560);
      const hx2 = px + Math.sin(i * 2.1) * 90, hy2 = py + 300 - rise;
      const a = rise < 80 ? rise / 80 : 1 - (rise - 80) / 480;
      heart(g, hx2, hy2, 0.9 + 0.35 * Math.sin(t * 6 + i), i % 2 ? '#ff4d6d' : '#ff8aa0', clamp(a, 0, 1));
    }
  });
  FX.dust(g, t, { count: 14, color: '#cfe0ff', a: 0.3 });
} });

// s016 — "Part one alone was watched more than 8 million times."  Blueprint: floor plan + climbing graph, 8M node
registerShot('s016', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1.08 - 0.08 * ease.inOut(t / D) };
  UI.blueprint(g, { grid: 60, a: 0.07 });
  layer(g, cam, 1, (g) => {
    const ui = S().ui, bp = ui.blueprint;
    // floor plan: apartment outline, bathroom highlighted
    const fx = E.W * 0.08, fy = E.H * 0.16, fw = E.W * 0.52, fh = E.H * 0.62;
    g.strokeStyle = bp; g.lineWidth = 4;
    g.strokeRect(fx, fy, fw, fh);
    g.beginPath(); g.moveTo(fx + fw * 0.45, fy); g.lineTo(fx + fw * 0.45, fy + fh); g.stroke();
    g.beginPath(); g.moveTo(fx, fy + fh * 0.55); g.lineTo(fx + fw * 0.45, fy + fh * 0.55); g.stroke();
    // bathroom (left-top room) highlighted in gold
    g.strokeStyle = ui.gold; g.lineWidth = 5;
    g.strokeRect(fx + 16, fy + 16, fw * 0.45 - 32, fh * 0.55 - 32);
    text(g, 'BATHROOM', fx + fw * 0.225, fy + fh * 0.28, { size: 30, color: ui.gold, alpha: 0.95 });
    text(g, 'MIRROR', fx + fw * 0.225, fy + fh * 0.42, { size: 24, color: bp, alpha: 0.8 });
    text(g, 'LIVING ROOM', fx + fw * 0.72, fy + fh * 0.3, { size: 26, color: bp, alpha: 0.75 });
    text(g, 'HIDDEN APT', fx + fw * 0.72, fy + fh * 0.75, { size: 26, color: bp, alpha: 0.75 });
    // climbing line graph (right side) with nodes at 1M, 4M, 8M
    const gx = E.W * 0.68, gy = E.H * 0.72, gw = E.W * 0.26, gh = E.H * 0.5;
    const pts = [[0, 0.85], [0.3, 0.62], [0.55, 0.45], [0.78, 0.2], [1, 0.05]];
    const p = ease.inOut(prog(t, 0.3, 2.6));
    g.strokeStyle = bp; g.lineWidth = 3;
    g.beginPath();
    pts.forEach(([px2, py2], i) => {
      const X = gx + px2 * gw, Y = gy - py2 * gh;
      if (i === 0) g.moveTo(X, Y); else if (p * (pts.length - 1) >= i - 1) g.lineTo(X, Y);
    });
    g.stroke();
    const nodes = [[0.3, '1M'], [0.55, '4M'], [1, '8M']];
    nodes.forEach(([px2, label], i) => {
      const py2 = pts[Math.round(px2 * 4)][1];
      const X = gx + px2 * gw, Y = gy - py2 * gh;
      const on = p * 4 >= Math.round(px2 * 4);
      if (!on) return;
      const pulse = 1 + 0.15 * Math.sin(t * 3 + i);
      glow(g, X, Y, 60 * pulse, label === '8M' ? '#ff6f61' : bp, 0.6);
      circle(g, X, Y, 10, label === '8M' ? '#ff6f61' : bp);
      text(g, label, X, Y - 34, { size: label === '8M' ? 40 : 30, color: label === '8M' ? '#ff6f61' : bp, glow: 14, glowColor: alpha(label === '8M' ? '#ff6f61' : bp, 0.7) });
    });
    // red 8M label glowing over the bathroom area
    if (p > 0.75) {
      const a8 = ease.out(prog(t, 2.0, 2.6));
      text(g, '8M', fx + fw * 0.225, fy + fh * 0.28 - 90, { size: 84, color: '#ff6f61', glow: 30, glowColor: alpha('#ff6f61', 0.8), alpha: a8 });
    }
  });
  FX.dust(g, t, { count: 10, color: '#8fb8e8', a: 0.25 });
} });
