// shots/07_gabby_d.js — Story 7 (Gabby Petito), part D: s200–s208 (memorial close).
import { E, V, registerShot, mood, S, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, noise, shake, seg, circle, ring, rr, poly, glow, alpha, shade, mix, linGrad, backdrop, text, FONTS } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { roadside, van2D } from '../sets/roadside.js';
import { memorial } from '../sets/memorial.js';
import { GABBY, BRIAN } from '../cast.js';

function heart(g, x, y, s, color, a = 1) {
  g.save(); g.globalAlpha = a; g.fillStyle = color;
  g.beginPath(); g.arc(x - 0.45 * s, y - 0.2 * s, 0.5 * s, 0, Math.PI * 2); g.arc(x + 0.45 * s, y - 0.2 * s, 0.5 * s, 0, Math.PI * 2); g.fill();
  poly(g, [[x - 0.9 * s, y - 0.1 * s], [x + 0.9 * s, y - 0.1 * s], [x, y + 0.9 * s]], color);
  g.restore();
}
function phoneShell(g, px, py, pw, ph, M) {
  rr(g, px - 16, py - 16, pw + 32, ph + 32, 40); g.fillStyle = shade(M.dark, -0.35); g.fill();
  rr(g, px, py, pw, ph, 30); g.fillStyle = shade(M.wall, -0.4); g.fill();
  glow(g, px + pw / 2, py + ph / 2, Math.max(pw, ph) * 0.7, M.practical, 0.14);
}

// s200 — insert: police tape fluttering in the foreground; Gabby small in soft light at the memorial behind.
// (DS framing = Insert/police tape; zone text = Gabby's face in soft light with memorial flowers behind —
//  tape leads, Gabby is small and soft behind, NOT a bigFace CU, keeping this story's face-CU count at 3.)
registerShot('s200', { draw(g, t, info) {
  const cam = { z: 1.1 + 0.04 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur) };
  blurLayer(g, 12, (g) => memorial(g, t, { z: 1.3, x: 60, y: -60 }, { mood: 'dusk' })); veil(g, '#120a10', 0.3);
  const M = mood('dusk');
  layer(g, cam, 0.9, (g) => {
    // Gabby small in soft light, eyes closing, memorial flowers behind
    const gy = E.H * 0.62;
    glow(g, E.W * 0.5, gy - 140, 260, M.key, 0.35);
    const blink = (t % 2.6) > 1.9; // eyes closing, slowly
    drawFigure(g, { x: E.W * 0.5, y: gy, s: 1.25, facing: 1, outfit: GABBY, pose: breathe(POSES.sad, t, 1, 12), expr: 'sad', rim: { color: M.rim, dir: [0, -1], w: 4 }, blink });
  });
  layer(g, cam, 1, (g) => {
    // police tape fluttering across the foreground
    const fl = Math.sin(t * 2.4) * 18, fl2 = Math.sin(t * 2.4 + 1.2) * 14;
    g.save(); g.globalAlpha = 0.95;
    poly(g, [[-E.W * 0.1, E.H * 0.78], [E.W * 0.4, E.H * 0.74 + fl], [E.W * 0.9, E.H * 0.8 + fl2], [E.W * 1.1, E.H * 0.76]], S().ui.gold);
    poly(g, [[-E.W * 0.1, E.H * 0.78 + 34], [E.W * 0.4, E.H * 0.74 + fl + 34], [E.W * 0.9, E.H * 0.8 + fl2 + 34], [E.W * 1.1, E.H * 0.76 + 34]], shade(S().ui.gold, -0.25));
    g.restore();
    // tape shadow dancing on the dry earth below
    poly(g, [[E.W * 0.2, E.H * 0.86], [E.W * 0.5, E.H * 0.84 + fl * 0.5], [E.W * 0.8, E.H * 0.88]], 'rgba(0,0,0,.3)');
  });
  FX.dust(g, t, { count: 16, color: '#ffd9b0', a: 0.3 });
  FX.fog(g, E.H * 0.6, 140, M.fog, 0.18);
} });

// s201 — insert: a thin gold necklace tangled in a sagebrush branch, glinting.
registerShot('s201', { draw(g, t, info) {
  const cam = { z: 1.55 + 0.06 * ease.inOut(t / info.dur), x: 24 * ease.inOut(t / info.dur), y: -30 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.8, x: -160, y: -180 }, { mood: 'dusk' })); veil(g, '#120a10', 0.45);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    // dry earth + sagebrush branch
    g.fillStyle = linGrad(g, 0, E.H * 0.45, 0, E.H, [shade(mix(M.wall, M.grass, 0.5), -0.1), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.45, E.W * 3, E.H * 0.6);
    const r = rng(71);
    for (let i = 0; i < 40; i++) circle(g, r() * E.W, E.H * 0.5 + r() * E.H * 0.45, 2 + r() * 5, shade(mix(M.wall, M.grass, 0.5), -0.2 + r() * 0.25));
    const bx = E.W / 2, by = E.H * 0.55;
    seg(g, [[bx - 420, by + 60], [bx, by - 60], [bx + 420, by + 40]], 14, shade(M.wall, -0.2));
    for (let i = 0; i < 7; i++) seg(g, [[bx - 300 + i * 100, by - 10 - (i % 2) * 30], [bx - 280 + i * 100, by - 90 - (i % 3) * 30]], 6, shade(M.wall, -0.2));
    // gold chain tangled in the branch
    g.strokeStyle = S().ui.gold; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath();
    g.moveTo(bx - 120, by - 40);
    g.quadraticCurveTo(bx - 60, by + 40, bx, by - 30);
    g.quadraticCurveTo(bx + 70, by + 50, bx + 130, by - 20);
    g.stroke();
    for (const [lx, ly] of [[bx - 60, by + 10], [bx, by - 30], [bx + 70, by + 20], [bx + 130, by - 20]]) circle(g, lx, ly, 9, S().ui.gold);
    // sharp white vector flare on the metal
    const fl = 0.6 + 0.4 * Math.sin(t * 3);
    FX.sparkle(g, bx + 70, by + 20, 34, '#ffffff', 0.8 * fl);
    glow(g, bx, by, 220, S().ui.gold, 0.18);
  });
  FX.dust(g, t, { count: 14, color: '#ffcf9e', a: 0.28 });
} });

// s202a — wide: minimalist swamp, cypress knees out of still water, indigo mist rolling.
// (v4 fix: the cypress knees are now SOLID black silhouettes with reflections
// and a visible water surface line — no more faint grid of triangles.)
registerShot('s202a', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur), y: -24 * ease.inOut(t / info.dur) };
  const M = mood('night');
  layer(g, cam, 0.15, (g) => {
    backdrop(g, [shade(M.wall, -0.4), shade(M.dark, -0.2)]);
    FX.moon(g, E.W * 0.74, E.H * 0.2, 42, S().feature);
    FX.stars(g, t, { seed: 73, count: 60, area: [0, 0, E.W, E.H * 0.4], color: S().feature });
    FX.clouds(g, { y: E.H * 0.12, h: 80, color: shade(M.wall, -0.1), a: 0.4, seed: 75 });
    glow(g, E.W * 0.5, E.H * 0.56, 520, M.key, 0.22);
  });
  layer(g, cam, 0.9, (g) => {
    const wl = E.H * 0.56; // water surface line
    // still water
    g.fillStyle = linGrad(g, 0, wl, 0, E.H, [shade(M.wall, -0.05), shade(M.dark, -0.2)]);
    g.fillRect(-E.W, wl, E.W * 3, E.H - wl + 40);
    // the water surface line itself: a bright horizon band + moon shimmer
    seg(g, [[-E.W, wl], [E.W * 2, wl]], 4, alpha(S().ui.blueprint, 0.55));
    glow(g, E.W * 0.74, wl, 260, S().ui.blueprint, 0.3);
    for (let i = 0; i < 5; i++) {
      const mw = 90 - i * 12, my = wl + 26 + i * 30;
      g.fillStyle = alpha(S().ui.blueprint, 0.3 - i * 0.04);
      g.fillRect(E.W * 0.74 - mw / 2 + Math.sin(t * 0.8 + i) * 6, my, mw, 5);
    }
    // cypress knees: SOLID black silhouettes rising from the water
    const r = rng(77);
    const knees = [];
    for (let i = 0; i < 11; i++) {
      const kx = E.W * 0.07 + r() * E.W * 0.86;
      const baseY = E.H * (0.68 + r() * 0.16);
      const kw = 34 + r() * 52, kh = 120 + r() * 200, lean = (r() - 0.5) * 70;
      knees.push([kx, baseY, kw, kh, lean]);
      poly(g, [[kx - kw, baseY], [kx - kw * 0.32, baseY - kh * 0.72], [kx + lean, baseY - kh], [kx + kw * 0.55, baseY - kh * 0.5], [kx + kw, baseY]], S().ink);
    }
    // reflections of the three nearest (tallest) knees + ripple rings at their bases
    const near = [...knees].sort((a, b) => b[3] - a[3]).slice(0, 3);
    near.forEach(([kx, baseY, kw, kh, lean], i) => {
      g.save(); g.globalAlpha = 0.32;
      poly(g, [[kx - kw * 0.8, baseY], [kx - kw * 0.25, baseY + kh * 0.34], [kx + lean * 0.6, baseY + kh * 0.42], [kx + kw * 0.45, baseY + kh * 0.3], [kx + kw * 0.8, baseY]], S().ink);
      g.restore();
      const rp = 0.5 + 0.5 * Math.sin(t * 1.1 + i * 2);
      g.strokeStyle = alpha(S().ui.blueprint, 0.22 + 0.1 * rp); g.lineWidth = 3;
      g.beginPath(); g.ellipse(kx, baseY + 8, kw * (1.3 + 0.3 * rp), 10 + 4 * rp, 0, 0, 7); g.stroke();
    });
    // a few long, soft ripples drifting — not a grid
    for (let i = 0; i < 4; i++) {
      const ry = E.H * (0.62 + i * 0.07);
      const rx = E.W * (0.12 + (i % 2) * 0.4) + Math.sin(t * 0.5 + i * 1.3) * 14;
      seg(g, [[rx, ry], [rx + E.W * 0.22, ry]], 3, alpha(S().ui.blueprint, 0.16 + 0.04 * Math.sin(t + i)));
    }
    // reeds framing the water's edge
    for (let i = 0; i < 6; i++) {
      const rx = (i < 3 ? E.W * 0.04 + i * 60 : E.W * 0.9 + (i - 3) * 60) + Math.sin(t * 0.8 + i) * 4;
      seg(g, [[rx, E.H * 0.86], [rx + 8, E.H * 0.58]], 5, shade(M.wall, -0.2));
    }
    // thick indigo mist rolling across the bottom
    FX.fog(g, E.H * 0.72, 220, M.fog, 0.42);
    const mistX = (t * 24) % 400;
    FX.fog(g, E.H * 0.8, 150, shade(M.wall, -0.1), 0.35);
    g.save(); g.globalAlpha = 0.25; g.fillStyle = shade(M.wall, -0.1); g.fillRect(-E.W + mistX, E.H * 0.82, E.W * 0.4, 90); g.restore();
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.22 });
} });

// s202b — insert: a mud-caked backpack half-hidden under a flat fern, water at the edge, reeds.
// (v4 fix: a recognizable backpack — rounded body, front pocket, straps, zip —
// caked in dried mud, with fern fronds arching over it. The notebook close
// stays in s204a/b; it is not duplicated here.)
registerShot('s202b', { draw(g, t, info) {
  const cam = { z: 1.5 + 0.06 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur), r: 0.012 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => { const M = mood('night'); backdrop(g, [shade(M.wall, -0.4), shade(M.dark, -0.2)]); FX.fog(g, E.H * 0.6, 180, M.fog, 0.3); }); veil(g, '#0a0812', 0.4);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    // mud bank + water edge
    g.fillStyle = linGrad(g, 0, E.H * 0.5, 0, E.H, [shade(mix(M.wall, M.grass, 0.5), -0.15), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.5, E.W * 3, E.H * 0.55);
    g.fillStyle = linGrad(g, 0, E.H * 0.82, 0, E.H, [shade(M.wall, -0.15), shade(M.dark, -0.2)]); g.fillRect(-E.W, E.H * 0.82, E.W * 3, E.H * 0.2);
    for (let i = 0; i < 6; i++) seg(g, [[E.W * 0.1, E.H * 0.86 + i * 18], [E.W * 0.9, E.H * 0.86 + i * 18]], 2, alpha(S().ui.blueprint, 0.14));
    // reeds at the frame edges
    for (let i = 0; i < 4; i++) {
      const rx = (i < 2 ? E.W * 0.06 + i * 70 : E.W * 0.9 + (i - 2) * 70) + Math.sin(t * 0.7 + i) * 5;
      seg(g, [[rx, E.H * 0.86], [rx + 10, E.H * 0.58]], 6, shade(M.wall, -0.2));
    }
    const bx = E.W * 0.46, by = E.H * 0.74;
    const pack = mix(M.wall, S().ui.blueprint, 0.38);
    const packDark = shade(pack, -0.18);
    const packLight = shade(pack, 0.12);
    // mud-caked backpack
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(bx, by + 46, 240, 20, 0, 0, 7); g.fill();
    // shoulder straps hanging behind the body
    for (const sx of [-150, 150]) {
      g.strokeStyle = packDark; g.lineWidth = 30; g.lineCap = 'round';
      g.beginPath(); g.moveTo(bx + sx, by - 250); g.quadraticCurveTo(bx + sx * 1.35, by - 60, bx + sx * 1.1, by + 60); g.stroke();
      rr(g, bx + sx * 1.28 - 16, by - 90, 32, 26, 6); g.fillStyle = shade(M.wall, 0.1); g.fill();
    }
    // carry handle loop on top
    g.strokeStyle = packDark; g.lineWidth = 14; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx - 46, by - 258); g.quadraticCurveTo(bx, by - 300, bx + 46, by - 258); g.stroke();
    // main body: domed rounded shape
    rr(g, bx - 200, by - 260, 400, 330, 96); g.fillStyle = pack; g.fill();
    // top flap + strap with buckle
    rr(g, bx - 200, by - 260, 400, 110, 96); g.fillStyle = packDark; g.fill();
    seg(g, [[bx - 14, by - 258], [bx - 14, by - 120]], 22, packDark);
    rr(g, bx - 34, by - 196, 40, 30, 6); g.fillStyle = shade(M.wall, 0.15); g.fill();
    // main zip down the front
    seg(g, [[bx, by - 140], [bx, by - 60]], 5, shade(M.dark, -0.2));
    rr(g, bx - 8, by - 84, 16, 26, 5); g.fillStyle = shade(M.wall, 0.2); g.fill();
    // front pocket with its own zip
    rr(g, bx - 140, by - 52, 280, 122, 30); g.fillStyle = packLight; g.fill();
    seg(g, [[bx - 130, by - 40], [bx + 130, by - 40]], 5, shade(M.dark, -0.2));
    rr(g, bx + 96, by - 52, 16, 26, 5); g.fillStyle = shade(M.wall, 0.2); g.fill();
    // side pocket
    rr(g, bx + 186, by - 120, 44, 120, 16); g.fillStyle = packDark; g.fill();
    // dried mud caked on: brown-grey patches, heaviest low + across the pocket
    const r = rng(79);
    for (let i = 0; i < 34; i++) {
      const mx = bx - 190 + r() * 380, my = by - 60 + r() * 130;
      circle(g, mx, my, 6 + r() * 12, shade(mix(M.wall, M.grass, 0.4), -0.25 + r() * 0.2));
    }
    for (let i = 0; i < 12; i++) {
      const mx = bx - 170 + r() * 340, my = by - 250 + r() * 90;
      circle(g, mx, my, 4 + r() * 8, shade(mix(M.wall, M.grass, 0.45), -0.2 + r() * 0.15));
    }
    // mud drips under the flap
    for (let i = 0; i < 5; i++) seg(g, [[bx - 120 + i * 60, by - 150], [bx - 120 + i * 60, by - 150 + 26 + (i % 2) * 18]], 7, shade(mix(M.wall, M.grass, 0.4), -0.2));
    // cold moonlight rim along the top-left of the pack
    g.strokeStyle = alpha(S().ui.blueprint, 0.8); g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(bx - 190, by - 120); g.quadraticCurveTo(bx - 200, by - 260, bx - 60, by - 258); g.stroke();
    glow(g, bx - 100, by - 200, 160, S().ui.blueprint, 0.2);
    // fern fronds arching over the backpack, half-hiding it
    const frond = (x0, y0, cx, cy, x1, y1, n) => {
      g.strokeStyle = shade(M.grass, 0.05); g.lineWidth = 9; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(cx, cy, x1, y1); g.stroke();
      for (let i = 1; i < n; i++) {
        const u = i / n, iu = 1 - u;
        const px = iu * iu * x0 + 2 * iu * u * cx + u * u * x1;
        const py = iu * iu * y0 + 2 * iu * u * cy + u * u * y1;
        const tx = 2 * iu * (cx - x0) + 2 * u * (x1 - cx), ty = 2 * iu * (cy - y0) + 2 * u * (y1 - cy);
        const len = Math.hypot(tx, ty) || 1, nx = -ty / len, ny = tx / len;
        const ll = 34 - u * 14;
        g.strokeStyle = shade(M.grass, 0.28); g.lineWidth = 5; g.lineCap = 'round';
        g.beginPath(); g.moveTo(px, py); g.lineTo(px + nx * ll, py + ny * ll); g.stroke();
        g.beginPath(); g.moveTo(px, py); g.lineTo(px - nx * ll * 0.8, py - ny * ll * 0.8); g.stroke();
      }
    };
    frond(bx - 430, by + 60, bx - 320, by - 330, bx + 40, by - 300, 9);
    frond(bx + 430, by + 40, bx + 330, by - 300, bx - 30, by - 290, 9);
    frond(bx - 260, by + 90, bx - 140, by - 240, bx + 150, by - 190, 8);
    frond(bx - 380, by + 120, bx - 200, by - 60, bx + 60, by + 10, 7);
    FX.pool(g, bx, by + 66, 210, 24, S().ui.blueprint, 0.12);
  });
  FX.dust(g, t, { count: 14, color: S().ui.blueprint, a: 0.25 });
  FX.fog(g, E.H * 0.62, 140, M.fog, 0.2);
} });

// s203 — wide: the roadside at dusk, the road empty, mountains holding; distant navy vehicles at the far edge.
// (DS object = police vehicles; zone = empty road, mountains holding — vehicles stay tiny and distant.)
registerShot('s203', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: 34 * ease.inOut(t / info.dur), y: -20 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'night' });
  layer(g, cam, 1, (g) => {
    // wind in the pines: slow sway via the camera roll + drifting fog
    FX.fog(g, GY - 60, 120, M.fog, 0.3);
    // distant navy vehicles at the far edge of the road, red/blue lights flickering faintly
    const vx = E.W * 0.82, vy = GY - 30;
    for (let i = 0; i < 2; i++) {
      const vxx = vx + i * 90;
      rr(g, vxx - 42, vy - 34, 84, 34, 8); g.fillStyle = shade(M.wall, -0.25); g.fill();
      circle(g, vxx - 22, vy, 10, '#14101c'); circle(g, vxx + 22, vy, 10, '#14101c');
      const red = 0.4 + 0.4 * Math.sin(t * 4 + i * 2);
      const blu = 0.4 + 0.4 * Math.sin(t * 4 + i * 2 + Math.PI);
      glow(g, vxx, vy - 44, 40, S().ui.accent, red * 0.5);
      glow(g, vxx + 20, vy - 44, 36, S().ui.blueprint, blu * 0.5);
      circle(g, vxx, vy - 44, 7, alpha(S().ui.accent, red));
      circle(g, vxx + 20, vy - 44, 6, alpha(S().ui.blueprint, blu));
    }
    // cold light on the empty road
    FX.pool(g, E.W * 0.4, GY + 30, 300, 34, '#cfe0ff', 0.12);
  });
  FX.dust(g, t, { count: 16, color: '#cfe0ff', a: 0.25 });
} });

// s204a — medium: a small weathered notebook lying open on pine needles; pages fluttering.
registerShot('s204a', { draw(g, t, info) {
  const cam = { z: 1.15 - 0.1 * ease.inOut(t / info.dur), x: -26 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => { const M = mood('dusk'); backdrop(g, [shade(M.wall, -0.4), shade(M.dark, -0.2)]); for (const [px, s] of [[E.W * 0.1, 1.2], [E.W * 0.9, 1.1]]) FX.pine(g, px, E.H * 0.9, s, '#14101c'); }); veil(g, '#120a10', 0.35);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    // pine-needle bed
    g.fillStyle = linGrad(g, 0, E.H * 0.5, 0, E.H, [shade(mix(M.wall, M.grass, 0.5), -0.15), shade(M.dark, -0.1)]); g.fillRect(-E.W, E.H * 0.5, E.W * 3, E.H * 0.55);
    const r = rng(83);
    for (let i = 0; i < 90; i++) { const nx = r() * E.W, ny = E.H * 0.52 + r() * E.H * 0.44; seg(g, [[nx, ny], [nx + 30 + r() * 30, ny + 6]], 2, shade(mix(M.wall, M.grass, 0.5), -0.2 + r() * 0.25)); }
    // notebook open, centre
    const nx = E.W / 2, ny = E.H * 0.62;
    g.save(); g.translate(nx, ny); g.rotate(-0.05 + 0.02 * Math.sin(t * 0.9)); g.translate(-nx, -ny);
    rr(g, nx - 300, ny - 150, 600, 300, 10); g.fillStyle = shade(M.wall, -0.2); g.fill();
    rr(g, nx - 288, ny - 138, 282, 276, 6); g.fillStyle = '#f2ead8'; g.fill();
    rr(g, nx + 6, ny - 138, 282, 276, 6); g.fillStyle = '#f2ead8'; g.fill();
    // scribbled lines on both pages
    for (const px0 of [nx - 260, nx + 34]) for (let i = 0; i < 6; i++) {
      g.strokeStyle = alpha(S().ink, 0.6); g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px0, ny - 100 + i * 42);
      g.bezierCurveTo(px0 + 80, ny - 108 + i * 42, px0 + 160, ny - 92 + i * 42, px0 + 220, ny - 100 + i * 42);
      g.stroke();
    }
    // one page corner fluttering in the breeze
    const fl = Math.sin(t * 3.2) * 14;
    poly(g, [[nx + 288, ny - 138], [nx + 288, ny - 60], [nx + 220 + fl, ny - 100]], '#e8e0cc');
    g.restore();
    FX.pool(g, nx, ny + 160, 320, 34, M.key, 0.14);
  });
  FX.dust(g, t, { count: 16, color: '#ffcf9e', a: 0.28 });
  FX.fog(g, E.H * 0.55, 120, M.fog, 0.18);
} });

// s204b — insert: hand-drawn scribbles on a page, ink smeared by water droplets.
registerShot('s204b', { draw(g, t, info) {
  const cam = { z: 1.55 - 0.06 * ease.inOut(t / info.dur), x: 24 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => { const M = mood('dusk'); backdrop(g, [shade(M.wall, -0.4), shade(M.dark, -0.2)]); }); veil(g, '#120a10', 0.4);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 480, py = E.H * 0.14, pw = 960, ph = 760;
    rr(g, px - 14, py - 14, pw + 28, ph + 28, 10); g.fillStyle = shade(M.wall, -0.2); g.fill();
    rr(g, px, py, pw, ph, 8); g.fillStyle = '#f2ead8'; g.fill();
    // scribbles: wavy hand-drawn lines, no legible words
    const r = rng(89);
    for (let i = 0; i < 9; i++) {
      const ly = py + 60 + i * 74;
      g.strokeStyle = alpha(S().ink, 0.65); g.lineWidth = 5; g.lineCap = 'round';
      g.beginPath(); g.moveTo(px + 50, ly);
      for (let x = 0; x <= 860; x += 60) g.quadraticCurveTo(px + 50 + x + 30, ly + (r() - 0.5) * 26, px + 50 + x + 60, ly + (r() - 0.5) * 14);
      g.stroke();
    }
    // water droplets smearing the ink
    for (let i = 0; i < 6; i++) {
      const dx = px + 120 + i * 140, dy = py + 130 + (i % 3) * 190;
      circle(g, dx, dy, 22 + (i % 3) * 6, alpha(S().ui.blueprint, 0.35));
      circle(g, dx - 6, dy - 6, 8, alpha('#ffffff', 0.5));
      seg(g, [[dx - 40, dy + 26], [dx + 50, dy + 20]], 8, alpha(S().ink, 0.25));
    }
    glow(g, E.W / 2, E.H * 0.5, 420, M.key, 0.1);
  });
  FX.dust(g, t, { count: 12, color: '#ffcf9e', a: 0.25 });
} });

// s205 — UI: a search bar with 'Gabby Petito' typed in; related hashtags appearing below.
registerShot('s205', { draw(g, t, info) {
  const cam = { z: 1.06 - 0.05 * ease.inOut(t / info.dur), x: -20 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => roadside(g, t, { z: 1.7, x: 140, y: -100 }, { mood: 'night' })); veil(g, '#0a0812', 0.5);
  const M = mood('night');
  layer(g, cam, 1, (g) => {
    const px = E.W / 2 - 420, py = E.H * 0.12, pw = 840, ph = 820;
    phoneShell(g, px, py, pw, ph, M);
    // search bar
    const bx = px + 40, by = py + 60, bw = pw - 80, bh = 84;
    rr(g, bx, by, bw, bh, 42); g.fillStyle = shade(M.wall, -0.1); g.fill();
    ring(g, bx + 46, by + 42, 18, 4, S().ui.cream);
    seg(g, [[bx + 60, by + 56], [bx + 76, by + 70]], 5, S().ui.cream);
    const typed = 'Gabby Petito'.slice(0, Math.floor(prog(t, 0.1, 1.4) * 12));
    text(g, typed, bx + 96, by + 54, { size: 34, color: S().ui.cream, font: FONTS.ui, weight: 900, align: 'left' });
    if ((t % 0.8) < 0.5) { const cx = bx + 96 + typed.length * 20; seg(g, [[cx, by + 22], [cx, by + 62]], 4, S().ui.gold); }
    // related hashtags, appearing one by one; tiles slowing and settling
    const tags = ['#GabbyPetito', '#FindGabby', '#SpreadCreek', '#VanLife', '#JusticeForGabby'];
    tags.forEach((tag, i) => {
      const a = ease.out(prog(t, 0.5 + i * 0.35, 1.0 + i * 0.35));
      if (a <= 0) return;
      const ty = by + 130 + i * 96;
      rr(g, bx, ty, bw, 76, 14); g.fillStyle = alpha(mix('#3a6ea5', '#1a1424', 0.4), a); g.fill();
      text(g, tag, bx + 30, ty + 50, { size: 30, color: alpha(S().ui.blueprint, a), font: FONTS.ui, weight: 900, align: 'left' });
      heart(g, bx + bw - 60, ty + 38, 14, S().ui.accent, a * 0.85);
    });
    // small tiles settling at the bottom
    for (let i = 0; i < 3; i++) {
      const tx = px + 40 + i * 260, ty = py + ph - 120;
      rr(g, tx, ty, 240, 80, 12); g.fillStyle = shade(M.wall, -0.1); g.fill();
      poly(g, [[tx + 100, ty + 24], [tx + 100, ty + 56], [tx + 128, ty + 40]], alpha(S().ui.cream, 0.7));
    }
  });
  FX.dust(g, t, { count: 14, color: '#cfd8ff', a: 0.25 });
} });

// s206 — FACE CU 3/3: Gabby, sad turning peaceful; warm light, memorial flowers behind;
// the reflection in her eyes shifts from blue to amber.
registerShot('s206', { draw(g, t, info) {
  const cam = { z: 1 + 0.05 * ease.inOut(t / info.dur), r: -0.01 * ease.inOut(t / info.dur) };
  blurLayer(g, 14, (g) => memorial(g, t, { z: 1.6, x: -160, y: -120 }, { mood: 'dusk' })); veil(g, '#120a10', 0.35);
  const M = mood('dusk');
  layer(g, cam, 1, (g) => {
    const r = V(300, 330) * (1 + 0.04 * ease.inOut(t / info.dur));
    // warm light rising; blue-to-amber shift in the frame
    const warm = ease.inOut(prog(t, 0.3, info.dur - 0.3));
    glow(g, E.W * 0.3, E.H * 0.3, 420, M.key, 0.3 + 0.2 * warm);
    bigFace(g, E.W / 2, E.H * V(0.58, 0.55), r, { outfit: GABBY, expr: warm > 0.6 ? 'neutral' : 'sad', look: [0, -0.15], rimColor: M.rim, rimSide: -1, blink: (t % 3.6) > 3.5 });
    veil(g, '#4a7ab8', 0.12 * (1 - warm));
    veil(g, '#ffb36a', 0.1 * warm);
    // small sharing icons at the frame edge
    const icons = [[E.W * 0.1, E.H * 0.32], [E.W * 0.9, E.H * 0.36]];
    icons.forEach(([ix, iy], i) => {
      const bob = Math.sin(t * 2 + i * 1.7) * 8;
      circle(g, ix, iy + bob, 26, alpha(S().ui.blueprint, 0.8));
      seg(g, [[ix - 10, iy + bob], [ix + 10, iy + bob - 12]], 4, S().ink);
      poly(g, [[ix + 10, iy + bob - 17], [ix + 19, iy + bob - 8], [ix + 7, iy + bob - 5]], S().ink);
    });
  });
  FX.dust(g, t, { count: 18, color: '#ffd9b0', a: 0.3 });
} });

// s207 — medium: a figure holds a GoPro toward the dark horizon; the van drives into the distance at dawn.
registerShot('s207', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: 28 * ease.inOut(t / info.dur), y: -24 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'golden' });
  layer(g, cam, 1, (g) => {
    // van driving into the distance, dawn warming
    const k = ease.inOut(prog(t, 0, info.dur));
    van2D(g, lerp(E.W * 0.42, E.W * 0.56, k), GY + 6, lerp(1.05, 0.5, k), { headlights: true });
    glow(g, E.W * 0.72, GY - 300, 300 + 120 * k, M.key, 0.25 + 0.2 * k);
    // figure holding a GoPro toward the horizon
    const fx = E.W * 0.3, fy = GY;
    drawFigure(g, { x: fx, y: fy, s: 1.55, facing: 1, outfit: { top: 'tshirt', color: shade(M.wall, -0.05), head: 'cap', headColor: shade(M.wall, -0.05) }, pose: breathe(posesAt(t, [[0, 'stand'], [0.4, 'point']]), t, 1, 13), expr: 'neutral', rim: { color: M.rim, dir: [1, -0.4], w: 4 }, blink: (t % 3.2) > 3.1 });
    // GoPro box in the raised hand
    const hx = fx + 90, hy = fy - 210;
    rr(g, hx - 30, hy - 22, 60, 44, 8); g.fillStyle = shade(M.dark, -0.3); g.fill();
    circle(g, hx + 10, hy, 12, '#2a3a55');
    // red Recording dot blinking
    const rec = (t % 1) > 0.4;
    circle(g, hx + 34, hy - 34, 8, rec ? S().ui.accent : shade(S().ui.accent, -0.5));
    if (rec) glow(g, hx + 34, hy - 34, 26, S().ui.accent, 0.6);
    text(g, 'REC', hx + 52, hy - 26, { size: 22, color: S().ui.accent, font: FONTS.ui, weight: 900, align: 'left' });
  });
  blurLayer(g, 10, (g) => { FX.pine(g, E.W * 0.08, E.H * 0.95, 1.5, '#14101c'); }, null, 1.7);
  FX.dust(g, t, { count: 18, color: '#ffe0b0', a: 0.28 });
  FX.godRays(g, E.W * 0.72, GY - 300, { count: 8, angle: -Math.PI / 2, spread: Math.PI, len: 1200, a: 0.05, t });
} });

// s208 — wide: roadside at dawn breaking; a glowing screen square dims until the frame settles navy.
registerShot('s208', { draw(g, t, info) {
  const cam = { z: 1 + 0.06 * ease.inOut(t / info.dur), x: -28 * ease.inOut(t / info.dur), y: -30 * ease.inOut(t / info.dur) };
  const { GY, M } = roadside(g, t, { z: 1.05, x: 0, y: 0 }, { mood: 'golden' });
  layer(g, cam, 1, (g) => {
    // a single glowing white square (a screen) in the foreground, slowly dimming
    const dim = prog(t, 0.4, info.dur);
    const sx = E.W * 0.5, sy = E.H * 0.52;
    glow(g, sx, sy, 300, '#fff3dc', 0.5 * (1 - dim));
    rr(g, sx - 130, sy - 130, 260, 260, 12); g.fillStyle = alpha('#f2efe8', 0.95 * (1 - dim) + 0.05); g.fill();
    rr(g, sx - 110, sy - 110, 220, 220, 8); g.fillStyle = alpha(mix('#3a6ea5', '#1a1424', 0.4), 0.9 * (1 - dim) + 0.05); g.fill();
    van2D(g, sx, sy + 70, 0.2, {});
    // dawn breaking behind
    FX.sun(g, E.W * 0.72, GY - 340, 60, '#fff3dc', M.key, 5);
    FX.godRays(g, E.W * 0.72, GY - 340, { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.2, len: 1500, a: 0.05, t });
    // the frame settles toward navy as the screen dims
    veil(g, '#0a0e2a', 0.45 * dim);
  });
  FX.dust(g, t, { count: 18, color: '#ffe0b0', a: 0.28 });
  FX.fog(g, GY - 100, 160, M.fog, 0.2);
} });
