// sets/ghosttown.js — Rhyolite at dusk: ruined gold-rush buildings, empty dirt street, one lamp.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade, mix, lerp, prog } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const townGround = () => E.H * V(0.8, 0.68);
function ruin(g, x, y, w, h, c, broken) {
  // a wooden building silhouette with a broken roofline
  g.fillStyle = c;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h * 0.55);
  const n = 5, step = w / n;
  for (let i = 0; i <= n; i++) g.lineTo(x + i * step, y - h * (0.55 + broken[i % broken.length] * 0.45));
  g.lineTo(x + w, y - h * 0.55); g.lineTo(x + w, y); g.closePath(); g.fill();
  g.fillStyle = 'rgba(0,0,0,.5)';
  for (let i = 0; i < 3; i++) g.fillRect(x + w * (0.2 + i * 0.28), y - h * 0.42, w * 0.1, h * 0.42);
}
export function ghosttown(g, t, cam, o = {}) {
  const M = mood(o.mood || 'dusk'), GY = townGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.25), wallDark = shade(M.wall, -0.55);
  layer(g, cam, 0.12, (g) => {                                    // dusk sky + low sun + mesas
    backdrop(g, M.sky);
    FX.sun(g, CX + V(640, 300), GY - V(300, 700), 58, '#fff3dc', M.key, 5);
    FX.godRays(g, CX + V(640, 300), GY - V(300, 700), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.4, len: 1500, a: 0.05, t });
    FX.hills(g, { y: GY - V(60, 120), amp: 70, color: mix(M.sky[1], wallDark, 0.7), seed: 4 });
    FX.clouds(g, { y: GY - V(520, 900), h: 140, color: '#ffcf9e', a: 0.14, seed: 6 });
  });
  layer(g, cam, 0.5, (g) => {                                     // ruined buildings, both sides of the street
    ruin(g, -E.W * 0.4, GY - V(40, 60), 520, V(300, 420), wall, [0.4, 0.1, 0.7, 0.2, 0.5]);
    ruin(g, CX - V(560, 380), GY - V(40, 60), 460, V(360, 500), shade(wall, -0.15), [0.2, 0.8, 0.3, 0.6, 0.1]);
    ruin(g, CX + V(300, 220), GY - V(40, 60), 500, V(320, 460), wallDark, [0.6, 0.2, 0.9, 0.4, 0.3]);
    ruin(g, E.W * 1.05, GY - V(40, 60), 480, V(280, 400), shade(wall, -0.3), [0.3, 0.6, 0.1, 0.8, 0.4]);
    // leaning water tower, centre-left
    const tx = CX - V(180, 120), ty = GY - V(40, 60);
    g.save(); g.translate(tx, ty); g.rotate(-0.05);
    seg(g, [[-70, 0], [-40, -V(330, 420)]], 10, wallDark); seg(g, [[70, 0], [40, -V(330, 420)]], 10, wallDark);
    seg(g, [[-58, -V(160, 200)], [58, -V(160, 200)]], 7, wallDark); seg(g, [[-48, -V(250, 300)], [48, -V(250, 300)]], 7, wallDark);
    g.fillStyle = shade(wall, -0.35); g.beginPath(); g.ellipse(0, -V(360, 450), 95, 62, 0, 0, 7); g.fill();
    g.fillStyle = shade(wall, -0.5); g.beginPath(); g.ellipse(0, -V(420, 510), 95, 26, 0, Math.PI, 0); g.fill();
    g.restore();
  });
  layer(g, cam, 0.9, (g) => {                                     // dirt street + lamp + tumbleweed
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.05), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.22)', 0.08);
    for (let i = 0; i < 14; i++) { const rx = ((i * 173) % 1900) - 100; circle(g, rx, GY + 60 + ((i * 61) % 260), 3 + (i % 3), 'rgba(0,0,0,.3)'); }
    const lx = CX + V(520, 300);
    FX.lampPost(g, lx, GY + 10, 300, { light: M.practical, a: 0.2 });
    FX.pool(g, lx + 30, GY + 16, 170, 26, M.practical, 0.18);
    // tumbleweed rolls slowly across the street
    const tw = lerp(-160, E.W + 160, prog(t, 0, 4.2));
    g.save(); g.translate(tw, GY + 26); g.rotate(t * 2.2);
    g.strokeStyle = shade(M.floor, 0.25); g.lineWidth = 3;
    for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI * 2; g.beginPath(); g.arc(0, 0, 26, a, a + 2.2); g.stroke(); }
    g.restore();
  });
  FX.fog(g, GY - 120, 180, M.fog, 0.22);
  FX.dust(g, t, { count: 26, color: '#ffd9b0', a: 0.3 });
  return { GY, CX, M };
}
