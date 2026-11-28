// shots/03_end.js — s013–s017: territories, airfield, rooftop fortune, funeral, end screen.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, seg, circle, ring, rr, poly, glow, alpha, shade, linGrad, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { voidSet } from '../sets/void.js';
import { airfield } from '../sets/airfield.js';
import { rooftop } from '../sets/rooftop.js';
import { cemetery } from '../sets/cemetery.js';
import { city } from '../sets/city.js';
import { CJ, CJ_RICH, SWEET, COP } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

// s013 — blueprint map: green zones flooding outward, territory labels ticking 1...12
registerShot('s013', { draw(g, t, info) {
  const cam = { z: 1.25 + 0.25 * ease.inOut(t / info.dur), x: lerp(60, -40, ease.inOut(t / info.dur)) };
  const { GY, M } = voidSet(g, t, cam);
  const k = ease.inOut(prog(t, 0.2, 3.0));
  const n = Math.min(12, Math.floor(k * 12) + 1);
  layer(g, cam, 0.6, (g) => {
    // district outlines in light blue, green flood filling one region at a time
    const zones = [
      [E.W * 0.28, E.H * 0.34, 260, 150], [E.W * 0.52, E.H * 0.3, 240, 140], [E.W * 0.74, E.H * 0.36, 250, 150],
      [E.W * 0.24, E.H * 0.6, 280, 150], [E.W * 0.5, E.H * 0.58, 260, 150], [E.W * 0.76, E.H * 0.62, 260, 140],
      [E.W * 0.38, E.H * 0.82, 240, 120], [E.W * 0.64, E.H * 0.84, 240, 120],
    ];
    zones.forEach(([zx, zy, zw, zh], i) => {
      const fill = clamp(k * 12 - i, 0, 1);
      g.strokeStyle = alpha(UI.bpStroke(), 0.8); g.lineWidth = 3;
      g.beginPath(); g.ellipse(zx, zy, zw / 2, zh / 2, 0, 0, Math.PI * 2); g.stroke();
      if (fill > 0) {
        g.save(); g.beginPath(); g.ellipse(zx, zy, zw / 2, zh / 2, 0, 0, Math.PI * 2); g.clip();
        g.fillStyle = alpha('#3fb950', 0.55 * fill); g.fillRect(zx - zw / 2, zy - zh / 2 + zh * (1 - fill), zw, zh * fill);
        g.restore();
      }
    });
    // gold labels ticking up
    text(g, 'TERRITORY ' + n + ' / 12', E.W / 2, E.H * 0.16, { size: V(46, 50), color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 18, glowColor: alpha(S().ui.gold, 0.5), spacing: 3 });
    text(g, 'SAN ANDREAS', E.W / 2, E.H * 0.92, { size: V(30, 34), color: alpha(S().ui.cream, 0.7), font: FONTS.ui, weight: 900, spacing: 5 });
    if (k > 0.95) FX.rings(g, E.W / 2, E.H * 0.55, t - 3.0, { count: 2, r0: 200, r1: 800, color: '#3fb950', a: 0.35 });
  });
  FX.dust(g, t, { count: 16, color: '#8fb8e8', a: 0.2 });
} });

// s014 — airfield at golden hour: CJ walks out toward the plane, tiny against the sun
registerShot('s014', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), x: lerp(-30, 30, ease.inOut(t / info.dur)) };
  const { GY, M } = airfield(g, t, cam);
  layer(g, cam, 1, (g) => {
    const cx = lerp(E.W * 0.34, E.W * 0.56, t / info.dur);
    drawFigure(g, { x: cx, y: GY, s: 0.75, facing: 1, outfit: CJ, pose: walkPose(t * 5.2), expr: 'awe', look: [0.5, -0.2], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
    // long shadow behind him toward camera
    g.fillStyle = 'rgba(10,8,16,.3)';
    poly(g, [[cx - 20, GY], [cx + 20, GY], [cx + 90, GY + 260], [cx + 30, GY + 260]], 'rgba(10,8,16,.3)');
  });
  FX.godRays(g, E.W * 0.62, GY - V(260, 380), { count: 6, angle: Math.PI / 2, spread: 0.8, len: 1400, a: 0.06, t });
  FX.dust(g, t, { count: 34, color: '#ffe0b0', a: 0.32 });
} });

// s015 — CLIMAX: rooftop at night, CJ in a suit but still wearing the green cap,
// back to the city, counter racing to a seven-figure total
registerShot('s015', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: lerp(30, -20, ease.inOut(t / info.dur)) };
  const { GY, M } = rooftop(g, t, cam);
  const n = Math.round(1250000 * ease.inOut(prog(t, 0.3, 3.1)));
  layer(g, cam, 1, (g) => {
    // CJ centre, suit + green cap, looking over the lit city
    drawFigure(g, { x: E.W * 0.46, y: GY - V(100, 132), s: 1.55, facing: 1, outfit: CJ_RICH, pose: breathe(posesAt(t, [[0, 'stand'], [1.6, 'relaxed']]), t), expr: 'smirk', look: [0.5, -0.1], rim: rim(M, [0, -1]), blink: (t % 3.1) > 3.0 });
    glow(g, E.W * 0.46, GY - V(100, 132) - 260, 300, '#ffb860', 0.18);
  });
  // seven-figure counter, top centre — kept below the scope bars (bars end ~138)
  const a = ease.out(prog(t, 0.2, 0.6));
  text(g, 'FORTUNE', E.W / 2, 180, { size: V(30, 34), color: alpha(S().ui.cream, 0.85 * a), font: FONTS.ui, weight: 900, spacing: 5, alpha: a });
  text(g, '$' + n.toLocaleString('en-US'), E.W / 2, 270, { size: V(96, 100), color: S().ui.gold, font: FONTS.ui, weight: 900, glow: 30, glowColor: alpha(S().ui.gold, 0.6), alpha: a });
  if (t > 3.1) FX.rings(g, E.W / 2, 270, t - 3.1, { count: 2, r0: 240, r1: 800, color: S().ui.gold, a: 0.35 });
  FX.dust(g, t, { count: 24, color: '#ffd59a', a: 0.26 });
} });

// s016 — cemetery at dusk: CJ small at a headstone, sun directly behind it — silhouette
registerShot('s016', { draw(g, t, info) {
  const cam = { z: 1.08 - 0.08 * ease.inOut(t / info.dur), x: lerp(-20, 20, ease.inOut(t / info.dur)) };
  const { GY, M } = cemetery(g, t, cam);
  layer(g, cam, 1, (g) => {
    // CJ small beside the headstone, backlit silhouette, head bowed
    drawFigure(g, { x: E.W * 0.56, y: GY, s: 0.95, facing: -1, outfit: CJ, pose: breathe(POSES.sad, t, 0.8), expr: 'sad', look: [-0.3, 0.2], rim: rim(M, [0, -1]), blink: (t % 3.4) > 3.3 });
    glow(g, E.W * 0.5, GY - V(300, 440), 340, '#ffc68a', 0.22);
  });
  FX.lensStreak(g, E.W * 0.5, GY - V(300, 440), E.W * 0.7, '#ffe6cc', 0.12);
  FX.dust(g, t, { count: 28, color: '#ffe0b0', a: 0.3 });
} });

// s017 — end screen over a darkened dusk skyline. Custom layout (UI.endScreen's
// question sits at y=150, which the scope bars clip) — question/bubble/pill/cast
// all kept inside the scope safe area (y 150..930).
registerShot('s017', { draw(g, t, info) {
  blurLayer(g, 10, (g) => city(g, t, { z: 1.2, x: -60, y: -40 }, { variant: 'skyline' }));
  veil(g, '#0e0a14', 0.5);
  const ui = S().ui;
  const a1 = ease.out(prog(t, 0.2, 0.8));
  text(g, 'Would you have come home?', E.W / 2, E.H * 0.36, { size: V(64, 66), font: FONTS.serif, weight: 900, italic: true, color: ui.cream, alpha: a1, glow: 18, glowColor: 'rgba(255,170,90,.5)' });
  UI.bubble(g, E.W / 2 - V(260, 170), E.H * 0.52, { w: V(110, 130), h: V(60, 70) });
  const sp = ease.outBack(prog(t, 0.6, 1.1));
  g.save(); g.translate(E.W / 2 + V(60, 60), E.H * 0.52); g.scale(sp, sp);
  rr(g, -150, -38, 300, 76, 38); g.fillStyle = '#e0302a'; g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-104, 12); g.quadraticCurveTo(-104, -18, -92, -18); g.quadraticCurveTo(-80, -18, -80, 12); g.closePath(); g.fill(); circle(g, -92, 17, 5, '#fff');
  text(g, 'Subscribe', 18, 2, { size: 34, color: '#fff', font: FONTS.ui, weight: 900 }); g.restore();
  const cast = [CJ, SWEET, COP, CJ_RICH], n = cast.length, gap = Math.min(V(150, 120), (E.W * 0.85) / n), y0 = E.H - V(190, 420);
  cast.forEach((of, i) => { const k = ease.out(prog(t, 0.3 + i * 0.08, 0.7 + i * 0.08));
    drawFigure(g, { x: E.W / 2 + (i - (n - 1) / 2) * gap, y: y0 + (1 - k) * 40, s: V(0.9, 1.05), facing: 1, outfit: of, pose: POSES.relaxed, expr: 'smile', alpha: k, rim: { color: '#ffb070', dir: [0, 1] } });
  });
} });
