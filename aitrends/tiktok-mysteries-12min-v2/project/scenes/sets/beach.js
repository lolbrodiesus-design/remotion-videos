// sets/beach.js — Alki Beach at dusk. Low sun over the water, pier, rocks,
// sand. o.suitcase: the black suitcase on the rocks under the pier.
// o.tape: police tape across the sand.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const beachGround = () => E.H * V(0.8, 0.68);

export function beach(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = beachGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                    // dusk sky + sun over water
    backdrop(g, M.sky);
    FX.sun(g, CX + V(500, 240), GY - V(330, 760), 58, '#fff3dc', M.key, 5);
    FX.godRays(g, CX + V(500, 240), GY - V(330, 760), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.4, len: 1500, a: 0.05, t });
    FX.clouds(g, { y: GY - V(560, 900), h: 120, color: '#ffcf9e', a: 0.14, seed: 21 });
    FX.stars(g, t, { seed: 11, count: 40, area: [0, 0, E.W, E.H * 0.35], color: '#e8ecff' });
    // sea band
    g.fillStyle = linGrad(g, 0, GY - V(180, 260), 0, GY, ['#2a3a6a', '#3d4a7a', '#5a5a8a']); g.fillRect(-E.W, GY - V(180, 260), E.W * 3, V(180, 260));
    g.strokeStyle = 'rgba(255,220,170,.35)'; g.lineWidth = 3;
    for (let i = 0; i < 4; i++) { const y = GY - V(150 - i * 36, 220 - i * 50); g.beginPath(); g.moveTo(-E.W + (i * 300), y); g.bezierCurveTo(CX - 400, y - 8, CX + 300, y + 8, E.W * 2, y); g.stroke(); }
    glow(g, CX + V(500, 240), GY - V(60, 90), 300, '#ffcf8f', 0.2);
    // pier, right — posts + planks going out to sea
    const px = CX + V(620, 440);
    g.fillStyle = shade(M.wall, -0.4);
    for (let i = 0; i < 5; i++) { const x = px + i * V(90, 70), y = GY - V(120 - i * 14, 180 - i * 20); g.fillRect(x - 8, y, 16, GY - y + 40); }
    poly(g, [[px - 40, GY - V(120, 180)], [px + V(420, 320), GY - V(60, 90)], [px + V(420, 320), GY - V(40, 60)], [px - 40, GY - V(96, 150)]], shade(M.wall, -0.25));
  });
  layer(g, cam, 0.9, (g) => {                                     // sand floor + rocks
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, ['#8a6a52', '#5a4034']); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.18)', 0.08);
    for (let i = 0; i < 8; i++) { const rx = ((i * 271) % 1900) - 100; g.fillStyle = 'rgba(0,0,0,.15)'; g.beginPath(); g.ellipse(rx, GY + 80 + ((i * 61) % 240), 50 + (i % 3) * 26, 5, 0, 0, 7); g.fill(); }
    // rocks, left
    const rx0 = CX - V(760, 560);
    poly(g, [[rx0 - 180, GY + 10], [rx0 - 60, GY - V(150, 220)], [rx0 + 60, GY - V(110, 160)], [rx0 + 190, GY + 10]], '#4a3a40');
    poly(g, [[rx0 + 60, GY + 10], [rx0 + 170, GY - V(90, 130)], [rx0 + 300, GY + 10]], '#3a2c34');
    if (o.suitcase) {
      const sx = rx0 + V(60, 40), sy = GY - V(10, 14);
      rr(g, sx - 70, sy - 130, 140, 130, 10); g.fillStyle = '#14101c'; g.fill();
      rr(g, sx - 70, sy - 130, 140, 130, 10); g.strokeStyle = '#2e2836'; g.lineWidth = 4; g.stroke();
      seg(g, [[sx - 70, sy - 65], [sx + 70, sy - 65]], 4, '#2e2836');
      rr(g, sx - 26, sy - 152, 52, 22, 6); g.fillStyle = '#14101c'; g.fill();
      glow(g, sx, sy - 60, 90, '#ffb860', 0.12);
    }
    if (o.tape) {
      g.save(); g.translate(CX, GY + V(60, 90)); g.rotate(-0.02);
      g.fillStyle = '#e8c832'; g.fillRect(-E.W, -14, E.W * 3, 28);
      g.fillStyle = '#14101c'; g.font = '900 20px sans-serif'; g.textAlign = 'left';
      for (let x = -E.W + 40; x < E.W * 2; x += 260) g.fillText('POLICE LINE  •  DO NOT CROSS', x, 7);
      g.restore();
    }
  });
  FX.fog(g, GY - 110, 170, M.fog, 0.22);
  FX.dust(g, t, { count: 24, color: '#ffd9b0', a: 0.25 });
  return { GY, CX, M };
}
