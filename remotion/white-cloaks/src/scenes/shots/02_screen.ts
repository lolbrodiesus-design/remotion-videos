// shots/02_screen.js — full-frame screen inserts: the globe, the satellite zoom, the view counter.
import { E, V, S, registerShot, mood, layer, veil, ease, prog, clamp, lerp, wordTime, seg, circle, ring, rr, poly, glow, alpha, shade, text, measure, FONTS } from '../../engine/core';
import * as FX from '../../engine/fx2d';
import * as UI from '../../engine/ui2d';

// s002 — "was exploring Google Earth," — the globe, zooming into a pulsing dot
registerShot('s002', { draw(g, t, info) {
  const M = mood('void');
  g.fillStyle = '#0a0e1c'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
  const k = 1 + 0.9 * ease.inOut(t / info.dur), R = 380 * k;
  const cx = E.W / 2, cy = E.H * 0.56;
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
  g.fillStyle = '#12264a'; g.fillRect(cx - R, cy - R, R * 2, R * 2);
  g.strokeStyle = 'rgba(140,190,255,.35)'; g.lineWidth = 2;
  for (let i = -3; i <= 3; i++) { g.beginPath(); g.ellipse(cx, cy, Math.abs(120 * i) + 40, R, 0, 0, 7); g.stroke(); }
  for (let i = -2; i <= 2; i++) { const yy = cy + i * R * 0.32, w = Math.sqrt(Math.max(0, R * R - (i * R * 0.32) ** 2)); g.beginPath(); g.moveTo(cx - w, yy); g.lineTo(cx + w, yy); g.stroke(); }
  // landmasses: a few dark blobs
  g.fillStyle = 'rgba(30,60,110,.9)';
  for (const [dx, dy, rx, ry] of [[-0.28, -0.2, 150, 110], [0.22, 0.28, 170, 120], [0.05, -0.42, 110, 70], [-0.42, 0.32, 90, 80]]) {
    g.beginPath(); g.ellipse(cx + dx * R, cy + dy * R, rx * (R / 380), ry * (R / 380), dx, 0, 7); g.fill();
  }
  g.restore();
  ring(g, cx, cy, R, 3, 'rgba(160,200,255,.5)');
  glow(g, cx, cy, R * 1.15, '#5a8fd6', 0.25);
  // the dot: Nevada, pulsing
  const dx = cx + 60 * (R / 380), dy = cy - 40 * (R / 380);
  FX.rings(g, dx, dy, t, { count: 3, r0: 20, r1: 200, speed: 1.2, color: '#ffd59a', a: 0.7 });
  circle(g, dx, dy, 10, '#fff3dc'); glow(g, dx, dy, 70, '#ffd59a', 0.8);
  text(g, 'GOOGLE EARTH', V(70, 60), V(90, 120), { size: V(30, 34), color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
} });

// s004 — "He zoomed in on a ghost town called Rhyolite." — satellite map, crosshair, label
registerShot('s004', { draw(g, t, info) {
  const M = mood('dusk'), cam = { z: 1 + 0.55 * ease.inOut(t / info.dur), x: -40 * ease.inOut(t / info.dur) };
  const CX = E.W / 2, CY = E.H * 0.55;
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = '#7a5a40'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    for (let i = 0; i < 12; i++) { const rx = ((i * 331) % 1900) - 100, ry = ((i * 197) % 1000) + 40; g.fillStyle = 'rgba(60,40,26,.35)'; g.beginPath(); g.ellipse(rx, ry, 120 + (i % 4) * 60, 50 + (i % 3) * 30, (i % 5) * 0.5, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(40,26,18,.55)'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-E.W, CY + 300); g.quadraticCurveTo(CX - 400, CY + 180, CX + 300, CY + 60); g.stroke();
    g.beginPath(); g.moveTo(CX - 200, -E.H); g.quadraticCurveTo(CX - 100, CY - 100, CX + 500, E.H * 2); g.stroke();
    g.strokeStyle = 'rgba(40,26,18,.35)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-E.W, CY - 260); g.lineTo(E.W * 2, CY - 180); g.stroke();
    // the ghost town: tiny ruined blocks at the crosshair
    for (let i = 0; i < 9; i++) { const bx = CX - 90 + (i % 3) * 80, by = CY - 70 + Math.floor(i / 3) * 60; g.fillStyle = 'rgba(30,20,14,.8)'; g.fillRect(bx, by, 44, 30); }
    // crosshair
    ring(g, CX, CY, 90, 3, S().ui.gold); seg(g, [[CX - 130, CY], [CX - 100, CY]], 3, S().ui.gold); seg(g, [[CX + 100, CY], [CX + 130, CY]], 3, S().ui.gold); seg(g, [[CX, CY - 130], [CX, CY - 100]], 3, S().ui.gold); seg(g, [[CX, CY + 100], [CX, CY + 130]], 3, S().ui.gold);
    circle(g, CX, CY, 6, S().ui.gold);
    // RHYOLITE label pops on the word
    const p = ease.outBack(prog(t, 1.66, 2.1));
    if (p > 0) { g.save(); g.translate(CX + 170, CY - 190); g.scale(p, p);
      seg(g, [[-160, 120], [0, 30]], 2, alpha(S().ui.cream, 0.9)); circle(g, -160, 120, 5, S().ui.cream);
      text(g, 'RHYOLITE', 0, 0, { size: 54, color: S().ui.cream, font: FONTS.ui, weight: 900, spacing: 3, glow: 16, glowColor: 'rgba(0,0,0,.6)' });
      g.restore(); }
  });
  text(g, 'SATELLITE', V(70, 60), V(90, 120), { size: V(30, 34), color: alpha(S().ui.cream, 0.75), font: FONTS.ui, weight: 900, align: 'left', spacing: 3 });
  FX.dust(g, t, { count: 16, color: '#ffe2b0', a: 0.2 });
} });

// s011 — "It was watched more than 17 million times" — the view counter
registerShot('s011', { draw(g, t, info) {
  UI.blueprint(g);
  const ui = S().ui, cx = E.W / 2;
  const n = Math.round(17000000 * ease.inOut(prog(t, 0.3, 1.9)));
  const str = n.toLocaleString('en-US');
  const a = ease.out(prog(t, 0.1, 0.5));
  text(g, 'VIEWS', cx, E.H * 0.3, { size: V(44, 48), color: alpha(ui.cream, 0.85 * a), font: FONTS.ui, weight: 900, spacing: 6 });
  const size = Math.min(V(150, 140), (E.W * 0.9) / Math.max(1, measure(g, str, V(150, 140)) / V(150, 140)));
  text(g, str, cx, E.H * 0.5, { size, color: ui.gold, font: FONTS.ui, weight: 900, glow: 26, glowColor: alpha(ui.gold, 0.6), alpha: a });
  // progress bar under the number
  const bw = E.W * 0.5, bx = cx - bw / 2, by = E.H * 0.66;
  rr(g, bx, by, bw, 18, 9); g.fillStyle = alpha(ui.gold, 0.15); g.fill();
  rr(g, bx, by, bw * ease.inOut(prog(t, 0.3, 1.9)), 18, 9); g.fillStyle = ui.gold; g.fill();
  glow(g, bx + bw * ease.inOut(prog(t, 0.3, 1.9)), by + 9, 50, ui.gold, 0.5);
  if (t > 1.9) FX.rings(g, cx, E.H * 0.5, t - 1.9, { count: 2, r0: 200, r1: 700, speed: 1.2, color: ui.gold, a: 0.4 * (1 - prog(t, 1.9, 2.15)) });
} });
