// sets/street.js — exteriors at night/dusk: apartment building, Iowa house,
// California bungalow, Rhyolite ghost-town street, construction scaffold,
// and a dark minimalist building with one amber window.
// o.variant: 'building' (default) | 'house' | 'bungalow' | 'ghosttown' | 'amberWindow'
// o.scaffold: add scaffolding + safety tape over the facade (s031a).
// Key light = lamp post / low sun / glowing window, per variant.
import { E, V, mood, layer, backdrop, rr, seg, circle, ring, poly, linGrad, glow, alpha, shade, mix } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const streetGround = () => E.H * V(0.8, 0.68);

function nightSky(g, t, M, GY) {
  backdrop(g, M.sky);
  FX.stars(g, t, { seed: 3, count: 60, area: [0, 0, E.W, E.H * 0.45], color: '#dfe8ff' });
  FX.moon(g, E.W * 0.82, E.H * 0.16, 34, '#e8ecff');
}

function lampPost(g, x, GY, M, s = 1) {
  seg(g, [[x, GY + 10], [x, GY - 300 * s]], 8 * s, '#15121c');
  seg(g, [[x, GY - 300 * s], [x + 60 * s, GY - 300 * s]], 6 * s, '#15121c');
  circle(g, x + 66 * s, GY - 296 * s, 16 * s, '#ffe9b0');
  glow(g, x + 66 * s, GY - 296 * s, 150 * s, '#ffe9b0', 0.55);
  FX.lightCone(g, x + 66 * s, GY - 296 * s, { angle: Math.PI / 2, spread: 0.7, len: 320 * s, color: '#ffe9b0', a: 0.09 });
  FX.pool(g, x + 66 * s, GY + 16, 220 * s, 24, '#ffe9b0', 0.14);
}

function litWindow(g, x, y, w, h, lit, warm = '#ffcf8a') {
  rr(g, x - 6, y - 6, w + 12, h + 12, 4); g.fillStyle = '#241a20'; g.fill();
  if (lit) {
    g.fillStyle = linGrad(g, x, y, x, y + h, [warm, shade(warm, -0.35)]); g.fillRect(x, y, w, h);
    glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.9, warm, 0.3);
  } else {
    g.fillStyle = '#0e0c16'; g.fillRect(x, y, w, h);
  }
  seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 4, 'rgba(0,0,0,.45)');
  seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 4, 'rgba(0,0,0,.45)');
}

export function street(g, t, cam, o = {}) {
  const variant = o.variant || 'building';
  const M = mood(o.mood || (variant === 'ghosttown' ? 'dusk' : 'night')), GY = streetGround(), CX = E.W / 2;
  const wall = shade(M.wall, -0.3), wallDark = shade(M.wall, -0.6);

  layer(g, cam, 0.12, (g) => {                                    // sky
    if (variant === 'ghosttown') {
      backdrop(g, M.sky);
      FX.sun(g, CX - V(500, 240), GY - V(300, 700), 58, '#fff3dc', M.key, 5);
      FX.godRays(g, CX - V(500, 240), GY - V(300, 700), { count: 10, angle: -Math.PI / 2, spread: Math.PI * 1.4, len: 1500, a: 0.05, t });
      FX.clouds(g, { y: GY - V(560, 900), h: 120, color: '#ffcf9e', a: 0.13, seed: 33 });
      FX.hills(g, { y: GY - V(120, 180), amp: 110, color: mix(M.wall, '#3a2a4a', 0.5), seed: 6 });
    } else {
      nightSky(g, t, M, GY);
    }
  });

  layer(g, cam, 0.55, (g) => {                                    // facades
    if (variant === 'ghosttown') {
      // wooden facades, broken windows, telephone pole — Rhyolite
      const facades = [
        { x: -E.W * 0.42, w: V(420, 320), h: V(380, 520), c: '#3a2c26' },
        { x: CX - V(620, 460), w: V(520, 400), h: V(460, 620), c: '#2e2220' },
        { x: CX + V(180, 140), w: V(460, 360), h: V(400, 560), c: '#33261e' },
        { x: E.W * 1.05, w: V(400, 300), h: V(360, 500), c: '#2a201c' },
      ];
      for (const f of facades) {
        g.fillStyle = f.c; g.fillRect(f.x, GY - f.h, f.w, f.h);
        g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
        for (let y = GY - f.h + 60; y < GY - 20; y += 70) { g.beginPath(); g.moveTo(f.x, y); g.lineTo(f.x + f.w, y); g.stroke(); }
        // broken windows — dark panes, one cracked
        litWindow(g, f.x + 40, GY - f.h + 60, 90, 110, false);
        litWindow(g, f.x + f.w - 130, GY - f.h + 60, 90, 110, (f.x > 0), '#ffb060');
        seg(g, [[f.x + 40, GY - f.h + 60], [f.x + 130, GY - f.h + 170]], 3, 'rgba(255,255,255,.25)');
        seg(g, [[f.x + 130, GY - f.h + 60], [f.x + 40, GY - f.h + 170]], 3, 'rgba(255,255,255,.25)');
      }
      // telephone pole with sagging wires
      const px = CX + V(700, 520);
      seg(g, [[px, GY + 10], [px, GY - 420]], 10, '#1c1410');
      seg(g, [[px - 90, GY - 380], [px + 90, GY - 380]], 7, '#1c1410');
      g.strokeStyle = 'rgba(10,8,14,.8)'; g.lineWidth = 3;
      g.beginPath(); g.moveTo(px - 90, GY - 380); g.bezierCurveTo(CX, GY - 300, CX + V(300, 200), GY - 330, E.W * 1.2, GY - 360); g.stroke();
      g.beginPath(); g.moveTo(px - 90, GY - 380); g.bezierCurveTo(-E.W * 0.2, GY - 300, CX - V(500, 380), GY - 320, -E.W * 0.4, GY - 350); g.stroke();
    } else if (variant === 'house') {
      // two-story Iowa house front: porch, driveway, lit windows, glowing basement window
      const hx = CX - V(420, 320), hw = V(840, 640), hh = V(480, 680), hy = GY - hh;
      g.fillStyle = wall; g.fillRect(hx, hy, hw, hh);
      g.fillStyle = wallDark; g.fillRect(hx - 30, hy - 60, hw + 60, 60);           // roofline
      poly(g, [[hx - 30, hy - 60], [hx + hw / 2, hy - 150], [hx + hw + 30, hy - 60]], wallDark);
      litWindow(g, hx + 70, hy + 70, 130, 150, true);
      litWindow(g, hx + hw - 200, hy + 70, 130, 150, true);
      litWindow(g, hx + 70, hy + hh - 190, 130, 150, false);
      // porch + door + porch light
      g.fillStyle = shade(M.wall, -0.45); g.fillRect(hx + hw / 2 - 130, GY - 120, 260, 120);
      rr(g, hx + hw / 2 - 46, GY - 260, 92, 260, 6); g.fillStyle = '#2a1c14'; g.fill();
      circle(g, hx + hw / 2 + 80, GY - 280, 14, '#ffd9a0'); glow(g, hx + hw / 2 + 80, GY - 280, 110, '#ffd9a0', 0.6);
      // glowing basement window, low
      litWindow(g, hx + hw - 260, GY - 60, 110, 70, true, '#ffd9a0');
      // bare trees
      for (const tx of [hx - V(260, 200), hx + hw + V(260, 200)]) {
        seg(g, [[tx, GY + 10], [tx, GY - 320]], 9, '#1c1626');
        seg(g, [[tx, GY - 200], [tx - 70, GY - 300]], 5, '#1c1626');
        seg(g, [[tx, GY - 230], [tx + 80, GY - 330]], 5, '#1c1626');
      }
    } else if (variant === 'bungalow') {
      // single-story California bungalow silhouette, one warm window flickering
      const bx = CX - V(480, 360), bw = V(960, 720), bh = V(300, 420), by = GY - bh;
      g.fillStyle = '#241c2e'; g.fillRect(bx, by, bw, bh);
      poly(g, [[bx - 40, by], [bx + bw / 2, by - 130], [bx + bw + 40, by]], '#1c1526');
      const flick = 0.85 + 0.15 * Math.sin(t * 7);
      litWindow(g, bx + bw / 2 - 70, by + 90, 140, 130, true, '#ffcf8a');
      glow(g, bx + bw / 2, by + 155, 150 * flick, '#ffcf8a', 0.35 * flick);
      litWindow(g, bx + 60, by + 90, 110, 110, false);
      // low hedge + path
      g.fillStyle = '#1a1420'; g.beginPath(); g.ellipse(CX, GY + 6, bw * 0.7, 26, 0, 0, 7); g.fill();
    } else if (variant === 'amberWindow') {
      // dark minimalist building, ONE glowing amber window
      const bx = CX - V(520, 400), bw = V(1040, 800), bh = V(760, 1000), by = GY - bh;
      g.fillStyle = '#14101c'; g.fillRect(bx, by, bw, bh);
      g.strokeStyle = 'rgba(255,255,255,.05)'; g.lineWidth = 2;
      for (let y = by + 120; y < GY - 40; y += 130) { g.beginPath(); g.moveTo(bx, y); g.lineTo(bx + bw, y); g.stroke(); }
      litWindow(g, CX - 90, by + 260, 180, 220, true, '#ffbf6e');
    } else {
      // 'building': three-story apartment facade, 3x3 windows, glowing door, lamp post
      const fx = CX - V(660, 500), fw = V(1320, 1000), fh = V(780, 1040), fy = GY - fh;
      g.fillStyle = wall; g.fillRect(fx, fy, fw, fh);
      g.fillStyle = wallDark; g.fillRect(fx - 24, fy - 40, fw + 48, 40);
      const lit = [1, 1, 1, 0, 1, 1, 0, 1, 1];
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
        const wx = fx + 90 + c * ((fw - 180 - 150) / 2), wy = fy + 80 + r * ((fh - 160 - 170) / 2);
        litWindow(g, wx, wy, 150, 170, lit[r * 3 + c] === 1);
      }
      // glowing door, centre bottom
      rr(g, CX - 55, GY - 210, 110, 210, 6); g.fillStyle = '#ffd9a0'; g.fill();
      glow(g, CX, GY - 110, 170, '#ffd9a0', 0.5);
      seg(g, [[CX, GY - 210], [CX, GY]], 4, 'rgba(0,0,0,.4)');
      lampPost(g, fx + fw + V(160, 120), GY, M, 1);
    }
    if (o.scaffold) {
      // scaffolding + yellow safety tape over the facade
      const fx = CX - V(660, 500), fw = V(1320, 1000), fh = V(780, 1040), fy = GY - fh;
      g.strokeStyle = '#8a7a5a'; g.lineWidth = 8;
      for (let x = fx + 40; x < fx + fw; x += 220) { g.beginPath(); g.moveTo(x, fy - 40); g.lineTo(x, GY); g.stroke(); }
      for (let y = fy + 120; y < GY; y += 200) { g.beginPath(); g.moveTo(fx, y); g.lineTo(fx + fw, y); g.stroke(); }
      g.strokeStyle = '#c9a24a'; g.lineWidth = 5;
      for (let x = fx; x < fx + fw - 120; x += 120) { g.beginPath(); g.moveTo(x, fy + 60); g.lineTo(x + 120, fy - 40); g.stroke(); }
      // safety tape fluttering
      const fl = Math.sin(t * 2.2) * 14;
      g.save(); g.fillStyle = '#e8c832'; g.translate(CX, GY - 260 + fl); g.rotate(0.06 + Math.sin(t * 1.4) * 0.03);
      g.fillRect(-E.W * 0.5, -10, E.W, 20); g.fillStyle = '#14101c'; g.font = '900 13px sans-serif'; g.textAlign = 'left';
      for (let x = -E.W * 0.5 + 20; x < E.W * 0.5; x += 200) g.fillText('CAUTION', x, 5); g.restore();
    }
  });

  layer(g, cam, 0.9, (g) => {                                     // ground / sidewalk / dirt
    if (variant === 'ghosttown') {
      g.fillStyle = linGrad(g, 0, GY, 0, GY + 420, [shade(M.floor, 0.02), shade(M.dark, -0.15)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
      FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.2)', 0.08);
      for (let i = 0; i < 10; i++) { const rx = ((i * 211) % 1900) - 80; g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(rx, GY + 90 + ((i * 53) % 220), 60 + (i % 3) * 30, 5, 0, 0, 7); g.fill(); }
      FX.pool(g, CX - V(500, 240), GY + 30, 420, 40, M.key, 0.1);
    } else {
      g.fillStyle = linGrad(g, 0, GY, 0, GY + 400, [shade(M.floor, -0.1), shade(M.dark, -0.2)]); g.fillRect(-E.W, GY, E.W * 3, E.H * 2);
      FX.floorLines(g, GY, GY + 500, 'rgba(0,0,0,.25)', 0.08);
      // steps up to the door
      g.fillStyle = shade(M.floor, -0.25);
      for (let i = 0; i < 3; i++) g.fillRect(CX - 150 - i * 30, GY - 8 - i * 0, 300 + i * 60, 10);
      if (variant === 'house') { g.fillStyle = '#241c28'; poly(g, [[CX + V(300, 220), GY], [E.W * 1.4, GY + 300], [E.W * 1.4, GY + 420], [CX + V(180, 140), GY + 60]], '#241c28'); }
    }
  });
  FX.fog(g, GY - 110, 170, M.fog, 0.2);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.28 });
  return { GY, CX, M };
}
