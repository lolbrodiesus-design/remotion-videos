// shots/03_ghosttown.js — s005: the empty gold-rush town at dusk.
import { E, V, registerShot, ease } from '../../engine/core';
import { ghosttown } from '../sets/ghosttown';

registerShot('s005', { draw(g, t, info) {
  const cam = { z: 1 + 0.07 * ease.inOut(t / info.dur), x: -30 * ease.inOut(t / info.dur) };
  ghosttown(g, t, cam);
} });
