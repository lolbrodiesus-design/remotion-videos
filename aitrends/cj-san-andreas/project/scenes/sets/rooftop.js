// sets/rooftop.js — rooftop at night, graded to dusk. Key light: the city's own
// lights below. Props: parapet, money stacks, a case, antenna, distant skyline
// windows, vent, water tank. Mood night.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const rooftopGround = () => E.H * V(0.8, 0.68);

export function rooftop(g, t, cam, o = {}) {
  const M = mood(o.mood || 'night'), GY = rooftopGround(), CX = E.W / 2;
  layer(g, cam, 0.12, (g) => {                                   // night sky
    backdrop(g, M.sky);
    FX.stars(g, t, { seed: 5, count: 100, area: [0, 0, E.W, E.H * 0.45], color: '#dfe8ff' });
    FX.moon(g, E.W * 0.16, E.H * 0.14, 28, '#e8ecff');
  });
  layer(g, cam, 0.3, (g) => {                                    // city below, two skylines
    FX.skyline(g, { seed: 7, x: -E.W * 0.2, y: GY - V(180, 260), w: E.W * 1.4, minH: 50, maxH: 200, color: '#1c1830', windowColor: '#ffd59a', lit: 0.42 });
    FX.skyline(g, { seed: 13, x: -E.W * 0.2, y: GY - V(60, 90), w: E.W * 1.4, minH: 90, maxH: 260, color: '#120e1c', windowColor: '#ffb860', lit: 0.5 });
    // warm glow band where the city lights are
    glow(g, CX, GY - V(140, 200), E.W * 0.6, '#ffb860', 0.16);
  });
  layer(g, cam, 0.55, (g) => {                                   // antenna + water tank + vent
    const ax = CX - V(780, 580);
    seg(g, [[ax, GY - V(120, 160)], [ax, GY - V(520, 700)]], 8, '#15121c');
    seg(g, [[ax - 50, GY - V(460, 620)], [ax + 50, GY - V(460, 620)]], 5, '#15121c');
    seg(g, [[ax - 34, GY - V(400, 540)], [ax + 34, GY - V(400, 540)]], 5, '#15121c');
    circle(g, ax, GY - V(540, 730), 9, '#e0302a'); glow(g, ax, GY - V(540, 730), 60, '#e0302a', 0.5 + 0.3 * Math.sin(t * 2));
    // water tank, right
    const tx = CX + V(720, 540);
    g.fillStyle = shade(M.wall, -0.4); g.fillRect(tx - 90, GY - V(300, 400), 180, V(300, 400));
    g.beginPath(); g.ellipse(tx, GY - V(300, 400), 90, 30, 0, Math.PI, 0); g.fill();
    seg(g, [[tx - 90, GY], [tx - 90, GY - V(300, 400)]], 6, '#15121c'); seg(g, [[tx + 90, GY], [tx + 90, GY - V(300, 400)]], 6, '#15121c');
    // vent box
    rr(g, CX + V(420, 320), GY - V(150, 200), 130, V(150, 200), 8); g.fillStyle = shade(M.wall, -0.5); g.fill();
  });
  layer(g, cam, 0.9, (g) => {                                    // roof floor + parapet + money
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 420, 'rgba(0,0,0,.25)', 0.08);
    // parapet along the back edge
    g.fillStyle = shade(M.wall, -0.35); g.fillRect(-E.W, GY - V(90, 120), E.W * 3, V(90, 120));
    g.fillStyle = shade(M.wall, -0.2); g.fillRect(-E.W, GY - V(100, 132), E.W * 3, 12);
    // money stacks + open case on the parapet, right side
    const mx = CX + V(420, 320), my = GY - V(100, 132);
    for (let i = 0; i < 3; i++) {
      const sx = mx - 160 + i * 130;
      for (let j = 0; j < 4; j++) { rr(g, sx - 46, my - 16 - j * 13, 92, 12, 4); g.fillStyle = j % 2 ? '#5fd39a' : '#3fb950'; g.fill(); }
      glow(g, sx, my - 40, 70, '#3fb950', 0.2);
    }
    rr(g, mx + 260, my - 70, 150, 70, 10); g.fillStyle = '#1a141c'; g.fill();
    g.fillStyle = '#ffd47e'; g.fillRect(mx + 290, my - 56, 90, 40);
    seg(g, [[mx + 260, my - 70], [mx + 410, my - 70]], 4, '#c9a24a');
  });
  FX.dust(g, t, { count: 24, color: '#c8d0ff', a: 0.24 });
  return { GY, CX, M };
}
