// sets/memorial.js — the Spread Creek memorial at dusk. Open sky, low sun,
// flowers, stones, a single tree. Quiet, warm, still.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const memorialGround = () => E.H * V(0.82, 0.7);

export function memorial(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = memorialGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                    // open sky + low sun
    backdrop(g, M.sky);
    FX.sun(g, CX - V(480, 220), GY - V(280, 640), 70, '#fff3dc', M.key, 5);
    FX.godRays(g, CX - V(480, 220), GY - V(280, 640), { count: 12, angle: -Math.PI / 2, spread: Math.PI * 1.5, len: 1600, a: 0.05, t });
    FX.clouds(g, { y: GY - V(580, 920), h: 120, color: '#ffcf9e', a: 0.13, seed: 41 });
    FX.stars(g, t, { seed: 13, count: 44, area: [0, 0, E.W, E.H * 0.35], color: '#e8ecff' });
    FX.hills(g, { y: GY - V(60, 90), amp: 60, color: shade(M.wall, -0.4), seed: 18 });
    // single tree, right
    const tx = CX + V(700, 520);
    FX.tree(g, tx, GY - V(20, 30), 1.5, '#1c1626');
  });
  layer(g, cam, 0.9, (g) => {                                     // grass + stones + flowers
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [M.grass, shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.15)', 0.08);
    FX.pool(g, CX - V(480, 220), GY + 20, 420, 34, M.key, 0.1);
    // memorial stones, centre
    for (let i = 0; i < 3; i++) {
      const sx = CX - V(160, 120) + i * V(160, 120), sy = GY - V(10, 14);
      rr(g, sx - 52, sy - 110 - (i === 1 ? 26 : 0), 104, 110 + (i === 1 ? 26 : 0), 20); g.fillStyle = '#8d8896'; g.fill();
      g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(sx - 52, sy - 14, 104, 8);
    }
    // flowers at the base — small stems + coloured heads
    const cols = ['#e8e4f4', '#ffd47e', '#ff8aa0', '#c9a0ff'];
    for (let i = 0; i < 26; i++) {
      const fx = CX - V(420, 300) + ((i * 37) % 840), fy = GY + V(30 + (i % 5) * 26, 40);
      seg(g, [[fx, fy], [fx + 4, fy - 26]], 2, '#2e4a2e');
      circle(g, fx + 4, fy - 30, 7, cols[i % 4]);
      circle(g, fx + 4, fy - 30, 3, '#fff3dc');
    }
    // scattered petals
    for (let i = 0; i < 10; i++) { const px = CX - V(500, 380) + ((i * 113) % 1000); circle(g, px, GY + V(90 + (i % 4) * 40, 120), 4, cols[(i + 2) % 4]); }
  });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.22 });
  return { GY, CX, M };
}
