// sets/home.js — CJ's mother's house: porch outside, front room inside.
// Key light: a single warm bulb. Props: faded green graffiti, boarded window,
// framed family photo, sagging couch, steps, chain-link fence.
// o.variant: 'porch' (default) | 'room'
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, linGrad, glow, alpha, shade } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const homeGround = () => E.H * V(0.8, 0.68);

export function home(g, t, cam, o = {}) {
  const variant = o.variant || 'porch';
  const M = mood(o.mood || (variant === 'room' ? 'interiorWarm' : 'dusk')), GY = homeGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);
  const bulbX = CX - V(40, 0), bulbY = GY - V(430, 600);
  layer(g, cam, 0.2, (g) => {                                    // sky / back wall
    if (variant === 'room') {
      g.fillStyle = linGrad(g, 0, 0, 0, GY, [wall, wallDark]); g.fillRect(-E.W, -E.H, E.W * 3, GY + E.H);
    } else {
      backdrop(g, M.sky);
      FX.sun(g, CX + V(520, 360), GY - V(320, 480), 52, '#fff3dc', M.key, 4);
      FX.clouds(g, { y: GY - V(540, 840), h: 100, color: '#ffcf9e', a: 0.12, seed: 31 });
    }
  });
  layer(g, cam, 0.55, (g) => {                                   // house front / room walls
    if (variant === 'room') {
      // boarded window (left), framed family photo (right), faded green graffiti
      FX.windowFrame(g, { x: CX - V(760, 560), y: GY - V(520, 740), w: V(340, 260), h: V(300, 380), cols: 2, rows: 2, frame: wallDark }, (g, x, y, w, h) => {
        g.fillStyle = '#0d0a14'; g.fillRect(x, y, w, h);
      });
      g.save(); g.translate(CX - V(590, 430), GY - V(370, 550)); g.rotate(0.12);
      seg(g, [[-120, -8], [120, 8]], 26, '#5a4632'); seg(g, [[-120, 30], [120, 46]], 26, '#5a4632'); g.restore();
      seg(g, [[CX - V(590, 430), GY - V(370, 550)], [CX - V(590, 430), GY - V(330, 510)]], 6, '#3a2c20');
      // framed family photo: three small heads in a gold frame
      rr(g, CX + V(420, 300), GY - V(560, 780), V(220, 170), V(170, 210), 8); g.fillStyle = '#c9a24a'; g.fill();
      g.fillStyle = '#2a2030'; g.fillRect(CX + V(436, 312), GY - V(544, 764), V(188, 146), V(138, 178));
      for (const [hx, hy, hr] of [[0, 0, 22], [-52, 14, 18], [52, 14, 18]]) circle(g, CX + V(530, 385) + hx, GY - V(470, 660) + hy, hr, '#e8e0d0');
      // faded green graffiti tag on the wall
      g.save(); g.globalAlpha = 0.5; g.translate(CX - V(180, 120), GY - V(300, 430)); g.rotate(-0.06);
      seg(g, [[-90, 0], [-40, -34], [10, 6], [60, -26], [110, 4]], 10, '#3fb950'); g.restore();
      // sagging couch under the photo
      const cx = CX + V(180, 120), cy = GY - V(60, 80);
      rr(g, cx - 260, cy - 150, 520, 150, 26); g.fillStyle = shade(M.wall, -0.5); g.fill();
      rr(g, cx - 260, cy - 210, 120, 80, 20); g.fillStyle = shade(M.wall, -0.42); g.fill();
      rr(g, cx + 140, cy - 210, 120, 80, 20); g.fillStyle = shade(M.wall, -0.42); g.fill();
      seg(g, [[cx - 260, cy - 60], [cx + 260, cy - 60]], 4, 'rgba(0,0,0,.3)');
    } else {
      // house front: porch roof, door, boarded window, graffiti
      g.fillStyle = wall; g.fillRect(CX - V(560, 420), GY - V(460, 620), V(1120, 840), V(460, 620));
      poly(g, [[CX - V(600, 450), GY - V(460, 620)], [CX, GY - V(560, 740)], [CX + V(600, 450), GY - V(460, 620)]], wallDark);
      rr(g, CX - V(90, 70), GY - V(300, 400), V(180, 140), V(300, 400), 6); g.fillStyle = '#241a1c'; g.fill();
      circle(g, CX + V(140, 110), GY - V(330, 440), 11, '#ffd9a0'); glow(g, CX + V(140, 110), GY - V(330, 440), 90, '#ffd9a0', 0.5);
      // boarded window
      FX.windowFrame(g, { x: CX - V(480, 360), y: GY - V(400, 540), w: V(240, 180), h: V(220, 280), cols: 2, rows: 2, frame: wallDark }, (g, x, y, w, h) => { g.fillStyle = '#0d0a14'; g.fillRect(x, y, w, h); });
      g.save(); g.translate(CX - V(360, 270), GY - V(290, 400)); g.rotate(0.1);
      seg(g, [[-100, -6], [100, 6]], 22, '#5a4632'); seg(g, [[-100, 26], [100, 38]], 22, '#5a4632'); g.restore();
      // faded green spray-paint tag
      g.save(); g.globalAlpha = 0.55; g.translate(CX + V(300, 220), GY - V(260, 360)); g.rotate(-0.05);
      seg(g, [[-80, 0], [-30, -30], [20, 4], [70, -22], [110, 2]], 9, '#3fb950'); g.restore();
      // porch posts + steps
      seg(g, [[CX - V(560, 420), GY - V(460, 620)], [CX - V(560, 420), GY]], 14, wallDark);
      seg(g, [[CX + V(560, 420), GY - V(460, 620)], [CX + V(560, 420), GY]], 14, wallDark);
      g.fillStyle = shade(M.floor, -0.25);
      for (let i = 0; i < 3; i++) g.fillRect(CX - V(330, 250) - i * 36, GY - 10 - i * 0, V(660, 500) + i * 72, 12);
    }
  });
  layer(g, cam, 0.9, (g) => {                                    // floor / ground + bulb light
    g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
    FX.floorLines(g, GY, GY + 420, 'rgba(0,0,0,.25)', 0.08);
    // single warm bulb hanging over the porch / room
    const flick = 0.94 + 0.06 * Math.sin(t * 6.3);
    seg(g, [[bulbX, GY - V(560, 760)], [bulbX, bulbY]], 4, '#1a141c');
    circle(g, bulbX, bulbY, 16, '#ffe9b0'); glow(g, bulbX, bulbY, 220 * flick, M.practical, 0.55 * flick);
    FX.lightCone(g, bulbX, bulbY, { angle: Math.PI / 2, spread: 0.9, len: 520, color: M.practical, a: 0.1 });
    FX.pool(g, bulbX, GY + 10, 260, 30, M.practical, 0.22);
  });
  FX.dust(g, t, { count: 24, color: '#ffe0b0', a: 0.26 });
  return { GY, CX, M };
}
