// sets/street.js — Grove-style residential street at dusk. Key light: low sun down
// the street, amber, long palm shadows. Layers: sky -> palms/roofs -> houses ->
// road -> foreground fence. Mood dusk.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const streetGround = () => E.H * V(0.8, 0.68);

function palm(g, x, GY, s, M, lean = 0) {
  const c = shade(M.dark, -0.1);
  seg(g, [[x, GY + 20], [x + lean, GY - 300 * s]], 10 * s, c);
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI * (0.15 + i * 0.14);
    seg(g, [[x + lean, GY - 300 * s], [x + lean + Math.cos(a) * 110 * s, GY - 300 * s + Math.sin(a) * 70 * s + 46 * s]], 6 * s, c);
  }
}

function house(g, x, GY, w, h, M, o = {}) {
  const wall = o.wall || shade(M.wall, -0.25);
  g.fillStyle = wall; g.fillRect(x, GY - h, w, h);
  poly(g, [[x - 14, GY - h], [x + w / 2, GY - h - 70], [x + w + 14, GY - h]], shade(wall, -0.35));
  // windows, some porch-lit
  for (let i = 0; i < (o.windows || 2); i++) {
    const wx = x + 36 + i * (w - 110) / Math.max(1, (o.windows || 2) - 1), wy = GY - h + 70, ww = 74, wh = 96;
    const lit = o.litWindows ? o.litWindows.includes(i) : i === 0;
    rr(g, wx - 5, wy - 5, ww + 10, wh + 10, 4); g.fillStyle = '#1c141c'; g.fill();
    g.fillStyle = lit ? linGrad(g, wx, wy, wx, wy + wh, ['#ffd9a0', '#e8a85c']) : '#0e0c16'; g.fillRect(wx, wy, ww, wh);
    if (lit) glow(g, wx + ww / 2, wy + wh / 2, 110, '#ffcf8a', 0.35);
    seg(g, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 3, 'rgba(0,0,0,.45)');
  }
  // porch + door + porch light
  g.fillStyle = shade(wall, -0.45); g.fillRect(x + w / 2 - 70, GY - 130, 140, 130);
  rr(g, x + w / 2 - 34, GY - 190, 68, 190, 5); g.fillStyle = '#241a1c'; g.fill();
  circle(g, x + w / 2 + 58, GY - 200, 10, '#ffd9a0'); glow(g, x + w / 2 + 58, GY - 200, 80, '#ffd9a0', 0.5);
}

export function street(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = streetGround(), CX = E.W / 2;
  const sunX = CX + V(420, 300), sunY = GY - V(300, 460);
  layer(g, cam, 0.12, (g) => {                                   // sky + sun
    backdrop(g, M.sky);
    FX.sun(g, sunX, sunY, 64, '#fff3dc', M.key, 5);
    FX.godRays(g, sunX, sunY, { count: 8, angle: Math.PI / 2, spread: 1.1, len: 1700, a: 0.07, t });
    FX.clouds(g, { y: GY - V(520, 820), h: 110, color: '#ffcf9e', a: 0.14, seed: 21 });
    FX.lensStreak(g, sunX, sunY, E.W * 0.8, '#ffe6cc', 0.14);
  });
  layer(g, cam, 0.3, (g) => {                                    // palms + roof skyline
    for (const [px, s, lean] of [[-140, 1.15, 30], [CX - 560, 0.9, -20], [CX + 620, 1.05, 24], [E.W + 120, 1.2, -30]]) palm(g, px, GY - V(60, 90), s, M, lean);
    g.fillStyle = shade(M.dark, -0.1);
    for (const [rx, rw, rh] of [[-200, 420, 130], [CX - 300, 560, 170], [CX + 380, 480, 140], [E.W - 260, 420, 160]]) {
      g.fillRect(rx, GY - V(120, 170) - rh, rw, rh + V(120, 170));
      poly(g, [[rx - 10, GY - V(120, 170) - rh], [rx + rw / 2, GY - V(120, 170) - rh - 56], [rx + rw + 10, GY - V(120, 170) - rh]], shade(M.dark, -0.25));
    }
    // power lines sagging across the sky
    g.strokeStyle = 'rgba(12,10,16,.85)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(-E.W, GY - V(430, 640)); g.quadraticCurveTo(CX, GY - V(360, 560), E.W * 2, GY - V(430, 640)); g.stroke();
    g.beginPath(); g.moveTo(-E.W, GY - V(470, 690)); g.quadraticCurveTo(CX, GY - V(400, 610), E.W * 2, GY - V(470, 690)); g.stroke();
  });
  layer(g, cam, 0.55, (g) => {                                   // houses both sides
    house(g, -E.W * 0.28, GY, V(430, 330), V(330, 440), M, { litWindows: [0] });
    house(g, CX - V(640, 480), GY, V(480, 360), V(360, 480), M, { litWindows: [0, 1] });
    house(g, CX + V(220, 170), GY, V(460, 350), V(340, 460), M, { litWindows: [1] });
    house(g, E.W * 1.02, GY, V(430, 330), V(330, 440), M, { litWindows: [] });
    // chain-link fence, left foreground of the house row
    g.strokeStyle = 'rgba(180,190,210,.28)'; g.lineWidth = 2;
    const fx = CX - V(700, 520), fy = GY - V(120, 150);
    for (let i = 0; i < 14; i++) { const x0 = fx + i * 34; g.beginPath(); g.moveTo(x0, fy); g.lineTo(x0 + 34, fy + 120); g.stroke(); g.beginPath(); g.moveTo(x0 + 34, fy); g.lineTo(x0, fy + 120); g.stroke(); }
    seg(g, [[fx - 10, fy], [fx + 480, fy]], 5, '#2a2230'); seg(g, [[fx - 10, fy + 120], [fx + 480, fy + 120]], 4, '#2a2230');
  });
  layer(g, cam, 0.9, (g) => {                                    // road + centre line + shadows
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.road, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    // long palm shadows streaking down the road toward camera
    g.fillStyle = 'rgba(10,8,16,.35)';
    for (const [sx, w] of [[CX - 500, 26], [CX - 160, 20], [CX + 240, 30], [CX + 560, 22]]) poly(g, [[sx, GY], [sx + w, GY], [sx + w + 190, GY + 380], [sx + 190, GY + 380]], 'rgba(10,8,16,.35)');
    // centre line, perspective dashes
    g.fillStyle = alpha('#e8d9a0', 0.75);
    for (let i = 0; i < 5; i++) { const y = GY + 30 + i * 72, w = 10 + i * 8, h = 8 + i * 4; g.fillRect(CX - w / 2, y, w, h); }
    FX.floorLines(g, GY, GY + 420, 'rgba(0,0,0,.22)', 0.08);
    FX.pool(g, sunX, GY + 40, 520, 44, M.key, 0.12);
  });
  FX.fog(g, GY - 90, 150, M.fog, 0.16);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.26 });
  return { GY, CX, M };
}
