// shots/01_hartsoe_d.js — Hartsoe story, part D: s025–s031a (signs of someone → the landlord call → construction).
import { E, V, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, shake, seg, circle, ring, rr, glow, alpha, shade, linGrad, poly, text, S } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, walkPose, bigFace, headPos } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom } from '../sets/bathroom.js';
import { livingroom } from '../sets/livingroom.js';
import { street } from '../sets/street.js';
import { SAMANTHA } from '../cast.js';

const rim = (M, dir = [0, -1]) => ({ color: M.rim, dir, w: 4 });

function cupHand(g, x, y, s, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  seg(g, [[-20, 40], [-160, 150]], 60 * s, S().ink);
  seg(g, [[-50, 62], [-160, 150]], 84 * s, SAMANTHA.color);
  circle(g, 0, 0, 34 * s, S().ink);
  for (let i = 0; i < 4; i++) {
    const a = -2.4 + i * 0.45;
    seg(g, [[0, 0], [Math.cos(a) * 62 * s, Math.sin(a) * 62 * s]], 14 * s, S().ink);
  }
  seg(g, [[6 * s, 18 * s], [-42 * s, 52 * s]], 15 * s, S().ink);
  g.restore();
}

// s025 — "It was empty, but there were signs that someone had been there."  Wide: kitchen with no appliances
registerShot('s025', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05, x: lerp(-50, 50, ease.inOut(t / D)) };
  const { GY } = livingroom(g, t, cam, { variant: 'bare' });
  // extra trash bags + debris the set doesn't already draw
  layer(g, cam, 0.85, (g) => {
    g.fillStyle = '#181420';
    g.beginPath(); g.ellipse(E.W * 0.68, GY - 26, 110, 46, 0, 0, 7); g.fill();
    g.beginPath(); g.ellipse(E.W * 0.68, GY - 60, 70, 40, 0, 0, 7); g.fill();
    g.fillStyle = '#241c20';
    g.beginPath(); g.ellipse(E.W * 0.24, GY - 20, 90, 36, 0, 0, 7); g.fill();
  });
  // Samantha, headlamp beam scanning across the littered floor
  layer(g, cam, 1, (g) => {
    const sx = E.W * 0.3, s = 1.1;
    drawFigure(g, { x: sx, y: GY, s, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'worried', rim: rim(M, [1, -0.3]) });
    const [hx, hy, hr] = headPos({ x: sx, y: GY, s, facing: 1, pose: POSES.stand });
    circle(g, hx + hr * 0.6, hy - hr * 0.5, 10, '#fff3dc');
    FX.lightCone(g, hx + hr * 0.6, hy - hr * 0.5, { angle: 0.5 + Math.sin(t * 1.1) * 0.45, spread: 0.4, len: 800, color: '#fff3dc', a: 0.15 });
  });
  FX.dust(g, t, { count: 30, color: '#cfe0ff', a: 0.34 });
  FX.fog(g, GY - 90, 150, '#8fb4ff', 0.15);
} });

// s026 — "Trash bags. A water bottle."  Close insert: a CLEAR plastic water bottle rolling on floorboards, trash bags beside it, in a cold light shaft
registerShot('s026', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05 + 0.06 * ease.inOut(t / D), x: lerp(40, -40, ease.inOut(t / D)) };
  const GY = E.H * 0.82;
  // floorboards filling the lower frame
  layer(g, cam, 0.5, (g) => {
    g.fillStyle = shade(M.floor, -0.25); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3);
    g.save(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 4;
    for (let y = GY - 260; y < E.H + 40; y += 86) { g.beginPath(); g.moveTo(0, y); g.lineTo(E.W, y); g.stroke(); }
    for (let y = GY - 260; y < E.H + 40; y += 86) for (let x = ((y / 86) % 2 ? 260 : 60); x < E.W; x += 520) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 86); g.stroke(); }
    g.restore();
    // cold light shaft falling diagonally across the boards
    poly(g, [[E.W * 0.3, -E.H], [E.W * 0.52, -E.H], [E.W * 0.78, E.H], [E.W * 0.5, E.H]], 'rgba(160,195,255,.10)');
    FX.godRays(g, E.W * 0.42, -40, { count: 5, angle: Math.PI / 2, spread: 0.5, len: 900, color: '#bcd8ff', a: 0.10, t });
  });
  // trash bags beside the bottle
  layer(g, cam, 0.8, (g) => {
    const bag = (x, y, s2) => {
      g.save(); g.translate(x, y); g.scale(s2, s2);
      g.fillStyle = shade(S().ink, 0.12);
      g.beginPath(); g.ellipse(0, 0, 150, 92, 0, 0, 7); g.fill();
      g.beginPath(); g.ellipse(-30, -80, 80, 58, -0.3, 0, 7); g.fill();
      g.beginPath(); g.ellipse(50, -70, 66, 48, 0.4, 0, 7); g.fill();
      // tied knot on top
      g.beginPath(); g.moveTo(-14, -128); g.lineTo(0, -168); g.lineTo(16, -126); g.closePath(); g.fill();
      // faint cold highlight along the top
      g.save(); g.strokeStyle = alpha('#cfe0ff', 0.35); g.lineWidth = 6; g.lineCap = 'round';
      g.beginPath(); g.ellipse(0, -30, 120, 66, 0, Math.PI * 1.15, Math.PI * 1.6); g.stroke(); g.restore();
      g.restore();
    };
    bag(E.W * 0.18, GY + 40, 1.05);
    bag(E.W * 0.86, GY + 70, 0.85);
  });
  // the CLEAR plastic bottle, large, rolling slowly across the boards
  const bx = lerp(E.W * 0.38, E.W * 0.62, ease.inOut(t / D));
  const by = GY + 46, wob = Math.sin(t * 6) * 0.06;
  layer(g, cam, 1, (g) => {
    g.save(); g.translate(bx, by); g.rotate(wob);
    // contact shadow
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(0, 78, 240, 16, 0, 0, 7); g.fill();
    // transparent body
    rr(g, -210, -72, 420, 144, 66); g.fillStyle = 'rgba(200,222,245,.30)'; g.fill();
    rr(g, -210, -72, 420, 144, 66); g.strokeStyle = 'rgba(225,238,252,.75)'; g.lineWidth = 4; g.stroke();
    // water inside, up to a visible water line
    g.save(); rr(g, -206, -6, 412, 74, 60); g.clip();
    g.fillStyle = 'rgba(140,180,230,.38)'; g.fillRect(-206, -6, 412, 74);
    g.fillStyle = 'rgba(225,238,252,.6)'; g.fillRect(-206, -8, 412, 5);
    g.restore();
    // grip ridges on the body
    g.save(); g.strokeStyle = 'rgba(220,235,250,.5)'; g.lineWidth = 4;
    for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-90 + i * 90, -70); g.lineTo(-90 + i * 90, 70); g.stroke(); }
    g.restore();
    // neck tapering to the cap
    rr(g, 196, -46, 44, 92, 14); g.fillStyle = 'rgba(200,222,245,.30)'; g.fill();
    // the cap, with ridges
    rr(g, 238, -52, 52, 104, 10); g.fillStyle = shade(M.wall, 0.35); g.fill();
    g.save(); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3;
    for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(246 + i * 9, -50); g.lineTo(246 + i * 9, 50); g.stroke(); }
    g.restore();
    // bright highlights down the body
    g.save(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 8; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-170, -52); g.lineTo(-170, 52); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 5;
    g.beginPath(); g.moveTo(-120, -52); g.lineTo(-120, 52); g.stroke();
    g.restore();
    glow(g, 0, 0, 220, '#bcd8ff', 0.16);
    g.restore();
  });
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.32 });
} });

// s027 — "Open windows. That was why the air was so cold."  Insert: a tattered curtain snapping in the wind
registerShot('s027', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.25, y: lerp(50, -30, ease.inOut(t / D)) };
  const { GY } = livingroom(g, t, cam, { variant: 'bare', curtain: true });
  // Samantha in front of the open window, hoodie and hair blown by the draught
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: E.W * 0.42, y: GY, s: 1.3, facing: 1, outfit: SAMANTHA, pose: breathe(POSES.stand, t), expr: 'scared', rot: 0.04, rim: rim(M, [1, -0.3]) });
  });
  // wind streaks + a second, larger torn curtain strip snapping violently
  const wx = E.W / 2 + 520, wy = GY - 620, ww = 360, wh = 320;
  const flap = Math.sin(t * 3.4) * 60;
  g.save(); g.fillStyle = 'rgba(120,110,130,.85)';
  poly(g, [[wx - 40, wy], [wx + 60, wy], [wx + 30 + flap, wy + wh], [wx - 20 + flap * 0.5, wy + wh * 0.75]], 'rgba(120,110,130,.85)');
  g.restore();
  g.save(); g.strokeStyle = 'rgba(190,215,255,.4)'; g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const y = wy + 40 + i * 55, x0 = ((i * 260 + t * 700) % (E.W + 400)) - 200;
    g.beginPath(); g.moveTo(x0, y); g.lineTo(x0 + 140, y + Math.sin(t * 5 + i) * 10); g.stroke();
  }
  g.restore();
  glow(g, wx + ww / 2, wy + wh / 2, 260, '#8fb4ff', 0.2);
  FX.dust(g, t, { count: 24, color: '#cfe0ff', a: 0.32 });
} });

// s028a — "She explored the rooms, found …"  Wide: the apartment suite, headlamp sweeping room to room
registerShot('s028a', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorCool');
  const cam = { z: 1.05, x: Math.sin(t * 0.9) * 50 };
  const { GY } = livingroom(g, t, cam, { variant: 'bare' });
  // dark doorways to the next rooms
  layer(g, cam, 0.55, (g) => {
    g.fillStyle = '#07050c';
    rr(g, E.W * 0.08, GY - 480, 200, 480, 6); g.fill();
    rr(g, E.W * 0.78, GY - 480, 200, 480, 6); g.fill();
  });
  // Samantha walking from room to room, a small white dot of headlamp light
  layer(g, cam, 1, (g) => {
    const sx = E.W * 0.28 + t * 160 * 1.0;
    const phase = t * Math.PI * 2 * 0.9;
    drawFigure(g, { x: sx, y: GY, s: 1.0, facing: 1, outfit: SAMANTHA, pose: walkPose(phase), expr: 'worried', rim: rim(M, [1, -0.3]) });
    const [hx, hy, hr] = headPos({ x: sx, y: GY, s: 1.0, facing: 1, pose: walkPose(phase) });
    circle(g, hx + hr * 0.6, hy - hr * 0.5, 10, '#fff3dc');
    FX.lightCone(g, hx + hr * 0.6, hy - hr * 0.5, { angle: Math.sin(t * 1.4) * 0.6, spread: 0.42, len: 720, color: '#fff3dc', a: 0.15 });
  });
  FX.dust(g, t, { count: 28, color: '#cfe0ff', a: 0.32 });
  FX.fog(g, GY - 90, 150, '#8fb4ff', 0.15);
} });

// s028b — "… the exit, and climbed back out."  Medium: the bathroom hole from the inside, hands reaching for the sink ledge
registerShot('s028b', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  const cam = { z: 1.15 + 0.1 * ease.inOut(t / D), x: lerp(-40, 40, ease.inOut(t / D)), y: lerp(20, -20, ease.inOut(t / D)) };
  const { GY } = bathroom(g, t, cam, { mirrorOff: true, mood: 'interiorWarm' });
  veil(g, '#05040a', 0.25);
  // the exit door pushed open — warm light spills through
  const dx = E.W * 0.68, dy = GY - 520, dw = 220, dh = 520;
  const open = ease.out(prog(t, 0.4, 1.4));
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = '#ffd9a0'; g.fillRect(dx, dy, dw, dh);
    glow(g, dx + dw / 2, dy + dh / 2, 320, '#ffd9a0', 0.45 * open);
    g.fillStyle = '#2a1c14';
    g.save(); g.translate(dx, dy); g.rotate(-0.5 * open); g.fillRect(0, 0, 30, dh); g.restore();
    FX.lightCone(g, dx + dw / 2, dy + dh / 2, { angle: Math.PI, spread: 0.8, len: 700, color: '#ffd9a0', a: 0.12 * open });
    FX.pool(g, dx - 100, GY + 30, 300, 28, '#ffd9a0', 0.14 * open);
  });
  // the hole in the bathroom wall, seen from inside the hidden apartment
  const hx0 = E.W * 0.10, hy0 = GY - 560, hw = 560, hh = 520;
  layer(g, cam, 0.6, (g) => {
    g.fillStyle = '#05040a';
    g.beginPath();
    g.moveTo(hx0, hy0);
    g.lineTo(hx0 + hw, hy0 + 14); g.lineTo(hx0 + hw - 20, hy0 + hh / 2); g.lineTo(hx0 + hw, hy0 + hh);
    g.lineTo(hx0 + 30, hy0 + hh - 10); g.lineTo(hx0, hy0 + hh / 2 + 20);
    g.closePath(); g.fill();
    g.strokeStyle = shade(M.wall, 0.25); g.lineWidth = 10; g.stroke();
    // headlamp glow from inside the hole
    glow(g, hx0 + hw / 2, hy0 + hh / 2, 200, '#fff3dc', 0.25);
  });
  // Samantha's HANDS, pink-sleeved and believable in scale, reaching through the hole to grab the sink ledge
  const ledgeY = GY - 40;
  layer(g, cam, 1, (g) => {
    // the sink ledge she grabs
    rr(g, E.W * 0.14, ledgeY, 480, 44, 10); g.fillStyle = '#e8e6ea'; g.fill();
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(E.W * 0.14, ledgeY + 44, 480, 10);
    const arm = (holeX, holeY, gripX, start, end) => {
      const r = ease.out(prog(t, start, end));
      const wx = lerp(holeX, gripX, r), wy = lerp(holeY, ledgeY - 26, r);
      // pink sleeve from the hole to the wrist
      seg(g, [[holeX, holeY], [wx, wy]], 34, SAMANTHA.color);
      // rim light along the sleeve
      seg(g, [[holeX, holeY - 16], [wx, wy - 16]], 4, alpha(M.rim, 0.7));
      // hand gripping the ledge edge, fingers curling under it
      circle(g, wx, wy, 34, S().ink);
      seg(g, [[wx - 12, wy + 10], [wx - 18, wy + 52]], 13, S().ink);
      seg(g, [[wx + 6, wy + 12], [wx + 2, wy + 54]], 13, S().ink);
      seg(g, [[wx + 22, wy + 8], [wx + 24, wy + 48]], 12, S().ink);
    };
    arm(hx0 + 120, hy0 + 200, E.W * 0.30, 0.2, 1.2);
    arm(hx0 + 200, hy0 + 330, E.W * 0.44, 0.3, 1.3);
  });
  FX.dust(g, t, { count: 26, color: '#ffe2b0', a: 0.32 });
} });

// s029 — "Then she called her landlord."  UI: a phone dialer screen, circular calling animation
registerShot('s029', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  blurLayer(g, 12, (g) => bathroom(g, t, { z: 1.4, x: -100, y: -60 }, { mood: 'interiorWarm' })); veil(g, '#0a0c16', 0.55);
  const cam = { z: 1 + 0.05 * ease.inOut(t / D) };
  const px = E.W / 2, py = E.H / 2, pw = 400, ph = 700;
  layer(g, cam, 1, (g) => {
    rr(g, px - pw / 2 - 14, py - ph / 2 - 14, pw + 28, ph + 28, 34); g.fillStyle = '#0c0a12'; g.fill();
    rr(g, px - pw / 2, py - ph / 2, pw, ph, 26); g.fillStyle = '#17131f'; g.fill();
    glow(g, px, py, 400, '#ffd9a0', 0.2);
    // avatar: plain ink silhouette head
    circle(g, px, py - 190, 74, S().ink);
    g.beginPath(); g.ellipse(px, py - 60, 120, 70, 0, Math.PI, Math.PI * 2); g.fill();
    text(g, 'LANDLORD', px, py + 40, { size: 44, color: S().ui.cream, glow: 12, glowColor: alpha(S().ui.cream, 0.5) });
    text(g, 'calling…', px, py + 92, { size: 28, color: S().ui.cream, alpha: 0.7 });
    // circular calling animation, pulsing in time with a dial tone
    FX.rings(g, px, py - 190, t, { count: 3, r0: 90, r1: 260, speed: 1.1, color: '#ffd9a0', a: 0.5 });
    // keypad dots
    for (let r2 = 0; r2 < 4; r2++) for (let c2 = 0; c2 < 3; c2++) {
      circle(g, px + (c2 - 1) * 90, py + 170 + r2 * 70, 12, 'rgba(255,255,255,.25)');
    }
    // end-call pill
    rr(g, px - 70, py + 300, 140, 52, 26); g.fillStyle = '#c23a3a'; g.fill();
  });
  FX.dust(g, t, { count: 14, color: '#ffe2b0', a: 0.28 });
} });

// s030a — "A year later, in March 2022, …"  Insert: a wall calendar page tearing off, revealing MARCH 2022
registerShot('s030a', { draw(g, t, info) {
  const D = info.dur, M = mood('interiorWarm');
  blurLayer(g, 10, (g) => bathroom(g, t, { z: 1.5, x: 120, y: -80 }, { mood: 'interiorWarm' })); veil(g, '#0a0c16', 0.35);
  const cam = { z: 1.1 - 0.1 * ease.inOut(t / D) };
  const cx = E.W / 2, cy = E.H * 0.48, cw = 480, ch = 560;
  layer(g, cam, 1, (g) => {
    // the page underneath: MARCH 2022
    rr(g, cx - cw / 2, cy - ch / 2, cw, ch, 10); g.fillStyle = '#f2e6c8'; g.fill();
    text(g, 'MARCH 2022', cx, cy - ch / 2 + 90, { size: 52, color: S().ui.gold, glow: 18, glowColor: alpha(S().ui.gold, 0.7) });
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2;
    for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(cx - cw / 2 + 30, cy - ch / 2 + 140 + i * 80); g.lineTo(cx + cw / 2 - 30, cy - ch / 2 + 140 + i * 80); g.stroke(); }
    for (let i = 1; i < 7; i++) { g.beginPath(); g.moveTo(cx - cw / 2 + i * (cw / 7), cy - ch / 2 + 140); g.lineTo(cx - cw / 2 + i * (cw / 7), cy + ch / 2 - 30); g.stroke(); }
    // the old page tearing off and drifting down
    const tear = ease.in(prog(t, 0.6, 1.8));
    g.save(); g.translate(cx, cy + tear * 420); g.rotate(tear * 0.5);
    g.beginPath();
    g.moveTo(-cw / 2, -ch / 2);
    g.lineTo(cw / 2, -ch / 2); g.lineTo(cw / 2, ch / 2);
    for (let i = 6; i >= 0; i--) g.lineTo(-cw / 2 + (i / 6) * cw, ch / 2 + (i % 2 ? -26 : 8));
    g.closePath(); g.fillStyle = '#e8dcc0'; g.fill();
    text(g, 'MARCH 2021', 0, -ch / 2 + 90, { size: 52, color: '#6a5a48' });
    g.restore();
    glow(g, cx, cy, 300, '#ffd47e', 0.14);
  });
  FX.dust(g, t, { count: 18, color: '#ffe2b0', a: 0.3 });
} });

// s031a — "The space behind her mirror was another apartment …"  Wide: a construction scaffold
registerShot('s031a', { draw(g, t, info) {
  const D = info.dur, M = mood('night');
  const cam = { z: 1 + 0.06 * ease.inOut(t / D), x: lerp(-50, 50, ease.inOut(t / D)) };
  street(g, t, cam, { variant: 'building', scaffold: true });
  FX.fog(g, E.H * 0.72, 160, M.fog, 0.2);
  FX.dust(g, t, { count: 26, color: '#ffe0b0', a: 0.28 });
} });
