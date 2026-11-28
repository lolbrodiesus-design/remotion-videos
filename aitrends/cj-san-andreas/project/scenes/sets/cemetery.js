// sets/cemetery.js — cemetery at dusk. Key light: sun BEHIND the headstones,
// long shadows toward camera. Props: headstones, a mound of flowers, a lone
// tree, a low iron fence, a path. Mood dusk.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const cemeteryGround = () => E.H * V(0.8, 0.68);

function headstone(g, x, GY, w, h, M, tilt = 0) {
  g.save(); g.translate(x, GY); g.rotate(tilt);
  rr(g, -w / 2, -h, w, h, w / 2); g.fillStyle = shade(M.wall, -0.45); g.fill();
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-w / 2 + 10, -h + 26, w - 20, 4);
  seg(g, [[-w / 4, -h + 60], [w / 4, -h + 60]], 3, 'rgba(0,0,0,.3)');
  g.restore();
}

export function cemetery(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = cemeteryGround(), CX = E.W / 2;
  const sunX = CX, sunY = GY - V(300, 440);
  layer(g, cam, 0.12, (g) => {                                   // sky + sun behind stones
    backdrop(g, M.sky);
    FX.sun(g, sunX, sunY, 72, '#fff3dc', M.key, 5);
    FX.godRays(g, sunX, sunY, { count: 8, angle: Math.PI / 2, spread: 1.0, len: 1700, a: 0.07, t });
    FX.clouds(g, { y: GY - V(540, 840), h: 100, color: '#ffcf9e', a: 0.12, seed: 51 });
  });
  layer(g, cam, 0.3, (g) => {                                    // lone tree + far stones + fence
    FX.tree(g, CX - V(760, 560), GY - V(40, 60), 1.5, shade(M.dark, -0.1));
    for (const [hx, s] of [[CX - 560, 0.7], [CX - 300, 0.55], [CX + 420, 0.6], [CX + 660, 0.75]]) headstone(g, hx, GY - V(30, 40), 90 * s, 150 * s, M, (hx % 3 - 1) * 0.04);
    // low iron fence across the back
    seg(g, [[-E.W, GY - V(90, 120)], [E.W * 2, GY - V(90, 120)]], 5, '#1a141c');
    for (let x = -E.W; x < E.W * 2; x += 90) seg(g, [[x, GY - V(150, 190)], [x, GY - V(60, 80)]], 4, '#1a141c');
  });
  layer(g, cam, 0.55, (g) => {                                   // hero headstone + flowers
    headstone(g, CX, GY, 150, 260, M);
    // mound of flowers at its base: red, white, cream blooms
    const cols = ['#e04a3a', '#f4efe6', '#ffd47e', '#e04a3a', '#f4efe6'];
    for (let i = 0; i < 12; i++) {
      const fx = CX - 90 + (i % 6) * 36, fy = GY - 8 - Math.floor(i / 6) * 22;
      circle(g, fx, fy, 12, cols[i % cols.length]); circle(g, fx, fy, 5, '#3d5a48');
    }
    g.fillStyle = 'rgba(10,8,16,.3)'; g.beginPath(); g.ellipse(CX, GY + 6, 130, 14, 0, 0, Math.PI * 2); g.fill();
  });
  layer(g, cam, 0.9, (g) => {                                    // grass + path + long shadows
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.grass, -0.2), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    poly(g, [[CX - 90, GY], [CX + 90, GY], [CX + 260, GY + 420], [CX - 260, GY + 420]], shade(M.road, -0.2));
    // long shadows of the stones stretching toward camera
    g.fillStyle = 'rgba(10,8,16,.32)';
    for (const [sx, w] of [[CX - 200, 60], [CX - 60, 80], [CX + 160, 56]]) poly(g, [[sx, GY], [sx + w, GY], [sx + w + 120, GY + 380], [sx + 120, GY + 380]], 'rgba(10,8,16,.32)');
    FX.pool(g, sunX, GY + 20, 420, 36, M.key, 0.12);
  });
  FX.fog(g, GY - 80, 140, M.fog, 0.15);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.3 });
  return { GY, CX, M };
}
