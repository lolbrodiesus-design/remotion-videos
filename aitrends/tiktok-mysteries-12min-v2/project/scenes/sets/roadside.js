// sets/roadside.js — a mountain road at golden dusk. Pines, mountains, a dirt
// road, the white van. Exports van2D() for medium shots.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const roadsideGround = () => E.H * V(0.82, 0.7);

// a white Ford Transit-style van, side view, wheels on y. s = scale.
export function van2D(g, x, y, s = 1, o = {}) {
  const ink = '#14101c';
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(0, 4, 210, 10, 0, 0, 7); g.fill();
  // body
  rr(g, -210, -190, 300, 150, 14); g.fillStyle = '#f2efe8'; g.fill();
  // cab + hood
  poly(g, [[90, -190], [150, -190], [205, -110], [210, -40], [90, -40]], '#f2efe8');
  // windows
  rr(g, -180, -170, 90, 60, 6); g.fillStyle = '#2a3a55'; g.fill();
  rr(g, -70, -170, 80, 60, 6); g.fillStyle = '#2a3a55'; g.fill();
  poly(g, [[100, -175], [142, -175], [185, -110], [100, -110]], '#2a3a55');
  // stripe + door line
  g.fillStyle = '#3a6ea5'; g.fillRect(-210, -60, 420, 14);
  seg(g, [[-40, -190], [-40, -40]], 3, '#c9c2b8');
  // wheels
  for (const wx of [-140, 130]) { circle(g, wx, 0, 34, ink); circle(g, wx, 0, 16, '#8d97a3'); }
  glow(g, 200, -30, 60, '#ffe9b0', o.headlights ? 0.5 : 0.12);
  g.restore();
}

export function roadside(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = roadsideGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                    // sky + sun + mountains
    backdrop(g, M.sky);
    FX.sun(g, CX + V(600, 280), GY - V(380, 800), 66, '#fff3dc', M.key, 5);
    FX.godRays(g, CX + V(600, 280), GY - V(380, 800), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.3, len: 1500, a: 0.05, t });
    FX.clouds(g, { y: GY - V(600, 940), h: 110, color: '#ffe0b0', a: 0.13, seed: 31 });
    FX.hills(g, { y: GY - V(140, 200), amp: 130, color: mix(M.wall, '#3a2a4a', 0.5), seed: 8 });
    FX.hills(g, { y: GY - V(60, 90), amp: 80, color: shade(M.wall, -0.35), seed: 14 });
    // pines on the ridge
    for (let i = 0; i < 9; i++) { const px = ((i * 233) % 2000) - 60; FX.pine(g, px, GY - V(90 - (i % 3) * 20, 130), 0.8 + (i % 3) * 0.25, '#1c1626'); }
  });
  layer(g, cam, 0.55, (g) => {                                    // roadside pines
    for (const [px, s] of [[-E.W * 0.32, 1.3], [E.W * 1.28, 1.15], [CX - V(820, 600), 0.9], [CX + V(860, 640), 1.0]]) {
      FX.pine(g, px, GY + V(10, 14), s, '#1c1626');
      seg(g, [[px, GY + 10], [px, GY - 200 * s]], 8 * s, '#241a20');
    }
  });
  layer(g, cam, 0.9, (g) => {                                     // dirt road + grass
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [M.grass, shade(M.dark, -0.1)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    poly(g, [[-E.W, GY + 420], [CX - V(260, 200), GY], [CX + V(260, 200), GY], [E.W * 2, GY + 420]], '#6a5138');
    g.strokeStyle = 'rgba(0,0,0,.2)'; g.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const y = GY + 40 + i * 60; g.beginPath(); g.moveTo(CX - V(200 + i * 30, 150), y); g.lineTo(CX + V(200 + i * 30, 150), y); g.stroke(); }
    FX.pool(g, CX + V(600, 280), GY + 20, 380, 30, M.key, 0.1);
  });
  if (o.van) van2D(g, o.vanX ?? CX, GY + V(6, 8), o.vanS ?? 1.1, { headlights: o.headlights });
  FX.fog(g, GY - 120, 180, M.fog, 0.2);
  FX.dust(g, t, { count: 22, color: '#ffe0b0', a: 0.25 });
  return { GY, CX, M };
}
