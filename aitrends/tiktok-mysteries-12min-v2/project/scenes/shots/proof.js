// shots/proof.js — stage 5 style-proof shots (3 representative shots for the style grid).
// s010 bigFace (Samantha), s096 basement wide with two characters, s046 desert data card. IDs updated for the trimmed-VO rebuild.
import { E, V, S, registerShot, mood, layer, blurLayer, veil, ease, prog, clamp, lerp, glow } from '/engine/core.js';
import { drawFigure, POSES, posesAt, breathe, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import * as UI from '/engine/ui2d.js';
import { bathroom, bathroomGround } from '../sets/bathroom.js';
import { basement, basementGround } from '../sets/basement.js';
import { desert, desertGround, cloakLine } from '../sets/desert.js';
import { SAMANTHA, MERIDITH } from '../cast.js';

// s010 — "Then she felt it." — bigFace: Samantha, scared, cold wisps past her face
registerShot('s010', { draw(g, t, info) {
  const cam = { z: 1 + 0.04 * ease.inOut(t / info.dur) };
  blurLayer(g, 10, (g) => bathroom(g, t, cam, { wisps: true }));
  veil(g, '#0c0a14', 0.35);
  const M = mood('interiorCool');
  bigFace(g, E.W / 2, E.H * 0.54, V(300, 340), {
    outfit: SAMANTHA, expr: 'scared', blink: (t % 3.1) > 3.0,
    rimColor: M.rim, rimSide: 1, tilt: -0.02,
  });
  FX.dust(g, t, { count: 18, color: '#cfe0ff', a: 0.35 });
} });

// s096 — "She and her husband were removing the carpet in their basement." — wide, two characters
// v2: stronger move — the old slow push read as a still inside the 310–335s frozen run
registerShot('s096', { draw(g, t, info) {
  const cam = { z: 1 + 0.2 * ease.inOut(t / info.dur), x: 90 - 180 * ease.inOut(t / info.dur) };
  const { GY, CX, M } = basement(g, t, cam);
  const rim = { color: M.rim, dir: [0, -1] };
  layer(g, cam, 1, (g) => {
    drawFigure(g, { x: CX - V(240, 180) + Math.sin(t * 0.9) * 8, y: GY, s: V(1.25, 1.4), facing: 1, outfit: MERIDITH,
      pose: breathe({ ...POSES.crouch, hF: [40, -120] }, t, 1, 1), expr: 'worried', rim,
      blink: (t % 3.1) > 3.0 });
    drawFigure(g, { x: CX + V(60, 40) + Math.sin(t * 0.9 + 1.7) * 8, y: GY, s: V(1.25, 1.4), facing: 1,
      outfit: { top: 'tshirt', color: '#3a6ea5', head: 'none' },
      pose: breathe({ ...POSES.crouch, hF: [40, -120] }, t, 1, 2), expr: 'neutral', rim,
      blink: (t % 3.7) > 3.6 });
  });
  FX.dust(g, t, { count: 30, color: '#ffe0b0', a: 0.3 });
} });

// v2: the s046 override is REMOVED — v2 s046 is a phone-UI shot (phoneui kind
// in generated.js), not the old gold data card. s010/s096 proofs are kept.
