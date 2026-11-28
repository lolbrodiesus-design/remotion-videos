// sets/airfield.js — abandoned airfield at golden hour. Key light: big low sun
// on the horizon. Props: hangar, windsock, cracked runway with centre line,
// a parked prop plane, fence posts. Mood golden.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const airfieldGround = () => E.H * V(0.8, 0.68);

export function airfield(g, t, cam, o = {}) {
  const M = mood(o.mood || 'golden'), GY = airfieldGround(), CX = E.W / 2;
  const sunX = CX + V(260, 180), sunY = GY - V(210, 320);
  layer(g, cam, 0.12, (g) => {                                   // sky + big sun
    backdrop(g, M.sky);
    FX.sun(g, sunX, sunY, 84, '#fff3dc', M.key, 5);
    FX.godRays(g, sunX, sunY, { count: 9, angle: Math.PI / 2, spread: 1.2, len: 1800, a: 0.08, t });
    FX.clouds(g, { y: GY - V(560, 860), h: 110, color: '#ffd9a0', a: 0.16, seed: 41 });
    FX.lensStreak(g, sunX, sunY, E.W * 0.9, '#ffe6cc', 0.16);
  });
  layer(g, cam, 0.3, (g) => {                                    // distant hills + hangar + plane
    FX.hills(g, { y: GY - V(60, 90), amp: 70, color: shade(M.wall, -0.4), seed: 6 });
    // hangar, left
    const hx = CX - V(860, 640), hw = V(480, 360), hh = V(300, 400);
    g.fillStyle = shade(M.wall, -0.3); g.fillRect(hx, GY - hh, hw, hh);
    g.beginPath(); g.moveTo(hx, GY - hh); g.quadraticCurveTo(hx + hw / 2, GY - hh - 130, hx + hw, GY - hh); g.closePath(); g.fill();
    g.fillStyle = '#0e0a12'; g.fillRect(hx + 60, GY - 190, hw - 120, 190);
    seg(g, [[hx + 60, GY - 190], [hx + hw - 60, GY - 190]], 4, '#2a1c14');
    // windsock on a pole beside the hangar
    const wx = hx + hw + 90;
    seg(g, [[wx, GY + 10], [wx, GY - 260]], 7, '#1c1410');
    const flap = Math.sin(t * 2.1) * 8;
    poly(g, [[wx, GY - 260], [wx + 110, GY - 246 + flap], [wx + 110, GY - 214 + flap], [wx, GY - 228]], '#e04a3a');
    seg(g, [[wx + 55, GY - 252 + flap], [wx + 55, GY - 220 + flap]], 4, '#f4efe6');
    // parked prop plane, small, right of centre against the sun
    const px = CX + V(560, 420), py = GY - V(40, 60);
    g.fillStyle = shade(M.wall, -0.45);
    g.beginPath(); g.ellipse(px, py - 46, 130, 26, 0, 0, Math.PI * 2); g.fill();
    poly(g, [[px - 20, py - 60], [px + 60, py - 150], [px + 110, py - 60]], shade(M.wall, -0.4));
    poly(g, [[px - 110, py - 40], [px - 140, py - 110], [px - 80, py - 60]], shade(M.wall, -0.5));
    seg(g, [[px + 126, py - 46], [px + 126, py - 110]], 5, '#1c1410');
    seg(g, [[px + 126, py - 78], [px + 170, py - 100]], 4, '#1c1410'); seg(g, [[px + 126, py - 78], [px + 170, py - 56]], 4, '#1c1410');
    circle(g, px + 60, py - 52, 12, '#ffd47e');
    // fence posts marching to the horizon, right
    for (let i = 0; i < 6; i++) { const fx = CX + V(700, 520) + i * 110, fh = 90 - i * 10; seg(g, [[fx, GY + 10], [fx, GY - fh]], 6, '#1c1410'); }
    seg(g, [[CX + V(700, 520), GY - 80], [CX + V(1250, 1000), GY - 30]], 3, '#1c1410');
  });
  layer(g, cam, 0.9, (g) => {                                    // cracked runway
    poly(g, [[CX - V(300, 220), GY], [CX + V(300, 220), GY], [CX + V(900, 700), GY + 420], [CX - V(900, 700), GY + 420]], shade(M.road, -0.1));
    // centre line dashes, widening toward camera
    g.fillStyle = alpha('#e8d9a0', 0.8);
    for (let i = 0; i < 5; i++) { const y = GY + 20 + i * 76, w = 12 + i * 10, h = 8 + i * 5; g.fillRect(CX - w / 2, y, w, h); }
    // cracks
    g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(CX - 140, GY + 60); g.lineTo(CX - 60, GY + 140); g.lineTo(CX - 120, GY + 220); g.stroke();
    g.beginPath(); g.moveTo(CX + 180, GY + 90); g.lineTo(CX + 110, GY + 190); g.lineTo(CX + 190, GY + 280); g.stroke();
    // dry grass tufts at the runway edge
    for (const gx of [CX - V(340, 260), CX + V(360, 280), CX - V(520, 400)]) {
      seg(g, [[gx, GY + 30], [gx - 14, GY - 10]], 3, '#6a5a3a'); seg(g, [[gx, GY + 30], [gx, GY - 22]], 3, '#6a5a3a'); seg(g, [[gx, GY + 30], [gx + 14, GY - 8]], 3, '#6a5a3a');
    }
    FX.pool(g, sunX, GY + 30, 480, 40, M.key, 0.14);
  });
  FX.dust(g, t, { count: 34, color: '#ffe0b0', a: 0.32 });
  FX.fog(g, GY - 80, 130, M.fog, 0.14);
  return { GY, CX, M };
}
