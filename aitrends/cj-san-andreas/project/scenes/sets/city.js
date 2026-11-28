// sets/city.js — Los Santos at night. Key light: the city's own lit windows.
// o.variant: 'skyline' (default) | 'alley' | 'shops'
// Alley: brick wall, crate, siren wash. Shops: shopfronts with OWNED tags.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const cityGround = () => E.H * V(0.8, 0.68);

export function city(g, t, cam, o = {}) {
  const variant = o.variant || 'skyline';
  const M = mood(o.mood || 'night'), GY = cityGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                   // night sky + stars
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 5, count: 90, area: [0, 0, E.W, E.H * 0.5], color: '#dfe8ff' });
    FX.moon(g, E.W * 0.84, E.H * 0.15, 30, '#e8ecff');
  });
  layer(g, cam, 0.3, (g) => {                                    // far skyline
    FX.skyline(g, { seed: 7, x: -E.W * 0.2, y: GY - V(40, 60), w: E.W * 1.4, minH: 60, maxH: 260, color: '#1c1830', windowColor: '#ffd59a', lit: 0.3 });
  });
  layer(g, cam, 0.55, (g) => {                                   // near skyline / alley wall / shops
    if (variant === 'alley') {
      g.fillStyle = shade(M.wall, -0.35); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
      // brick courses
      g.strokeStyle = 'rgba(0,0,0,.28)'; g.lineWidth = 2;
      for (let y = GY - V(560, 760); y < GY; y += 46) { g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
      for (let y = GY - V(560, 760) + 23; y < GY; y += 46) for (let x = -E.W; x < E.W * 2; x += 120) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 23); g.stroke(); }
      // drainpipe, vent grate, faded poster
      seg(g, [[CX + V(700, 520), GY - V(560, 760)], [CX + V(700, 520), GY]], 12, '#15121c');
      g.fillStyle = '#0e0c16'; g.fillRect(CX - V(800, 600), GY - V(180, 240), 180, 110);
      for (let i = 0; i < 4; i++) seg(g, [[CX - V(790, 590), GY - V(160, 220) + i * 26], [CX - V(630, 470), GY - V(160, 220) + i * 26]], 4, '#2a2230');
      rr(g, CX - V(200, 150), GY - V(480, 640), V(220, 170), V(300, 380), 6); g.fillStyle = alpha('#8a5a86', 0.5); g.fill();
      // crate between the two figures
      g.fillStyle = '#4a3626'; g.fillRect(CX - 90, GY - 110, 180, 110);
      seg(g, [[CX - 90, GY - 110], [CX + 90, GY]], 4, '#2a1c12'); seg(g, [[CX + 90, GY - 110], [CX - 90, GY]], 4, '#2a1c12');
      // siren wash sliding across the wall
      const sw = 0.5 + 0.5 * Math.sin(t * 2.4);
      glow(g, CX - V(500, 380) + sw * 300, GY - V(300, 400), 420, sw > 0.5 ? '#e0302a' : '#3a7ae0', 0.22);
    } else if (variant === 'shops') {
      // row of shopfronts with awnings and big windows
      const names = ['BARBER', 'LIQUOR', 'TACOS', '24 HR', 'PAWN'];
      for (let i = 0; i < 5; i++) {
        const sx = -E.W * 0.15 + i * V(430, 330), sw = V(400, 300), sh = V(380, 500);
        g.fillStyle = shade(M.wall, -0.2 - (i % 2) * 0.15); g.fillRect(sx, GY - sh, sw, sh);
        poly(g, [[sx - 8, GY - sh], [sx + sw + 8, GY - sh], [sx + sw - 20, GY - sh - 46], [sx + 20, GY - sh - 46]], i % 2 ? '#5a2a3a' : '#2a4a3a');
        FX.windowFrame(g, { x: sx + 30, y: GY - sh + 90, w: sw - 60, h: 170, cols: 2, rows: 1, frame: '#1c141c' }, (g2, x, y, w, h) => {
          g2.fillStyle = '#14101c'; g2.fillRect(x, y, w, h);
        });
        g.fillStyle = '#f4efe6'; g.font = '900 30px Nunito'; g.textAlign = 'center'; g.fillText(names[i], sx + sw / 2, GY - sh + 56);
      }
    } else {
      FX.skyline(g, { seed: 11, x: -E.W * 0.2, y: GY - V(10, 20), w: E.W * 1.4, minH: 140, maxH: 420, color: '#120e1c', windowColor: '#ffd59a', lit: 0.38 });
      FX.skyline(g, { seed: 19, x: -E.W * 0.1, y: GY + V(20, 30), w: E.W * 1.2, minH: 60, maxH: 180, color: '#0a0812', windowColor: '#ffb860', lit: 0.25 });
    }
  });
  layer(g, cam, 0.9, (g) => {                                    // street / pavement
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.road, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 420, 'rgba(0,0,0,.25)', 0.08);
    if (variant === 'alley') {
      // puddle catching the siren light
      const sw = 0.5 + 0.5 * Math.sin(t * 2.4);
      FX.pool(g, CX + V(300, 220), GY + 90, 260, 26, sw > 0.5 ? '#e0302a' : '#3a7ae0', 0.2);
    }
    if (variant === 'shops') {
      for (let i = 0; i < 5; i++) { const lx = -E.W * 0.15 + i * V(430, 330) + V(200, 150); FX.lampPost(g, lx, GY, 300); }
    }
  });
  FX.fog(g, GY - 90, 150, M.fog, 0.18);
  FX.dust(g, t, { count: 22, color: '#c8d0ff', a: 0.22 });
  return { GY, CX, M };
}
