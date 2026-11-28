// scenes/cast.js — outfits. Each recurring character gets exactly ONE saturated signature item.
// CJ's green cap is present in every outfit, including the suit at the end.

export const CJ      = { top: 'tshirt', color: '#efe9dc', legs: '#2f3a33', head: 'cap', headColor: '#3fb950' };
export const CJ_KID  = { ...CJ, kid: true };
export const CJ_RICH = { top: 'suit', color: '#2b2f2a', legs: '#22261f', head: 'cap', headColor: '#3fb950', face: 'sunglasses' };
export const CJ_HURT = { ...CJ, color: '#d9d2c4' };   // dusted, after the shootout

export const SWEET  = { top: 'hoodie', color: '#d64a33', legs: '#2e2a33', head: 'headband', headColor: '#d64a33' };
export const COP    = { top: 'suit', color: '#3a6ea5', legs: '#1f2a3a', head: 'cap', headColor: '#1f2a3a', face: 'sunglasses' };
export const DEALER = { top: 'suit', color: '#2a2430', legs: '#1a1a20', head: 'none' };

// Rival gang: purple only, varied headwear, never given faces in crowd shots.
export const RIVAL = [
  { top: 'tshirt', color: '#8a5ad6', legs: '#241f2e', head: 'capBack', headColor: '#8a5ad6' },
  { top: 'tracksuit', color: '#8a5ad6', legs: '#241f2e', head: 'beanie', headColor: '#6b3fb0' },
  { top: 'hoodie', color: '#8a5ad6', legs: '#241f2e', head: 'none' },
  { top: 'tshirt', color: '#7a4ac0', legs: '#241f2e', head: 'visor', headColor: '#8a5ad6' },
];

export const CAST = { CJ, CJ_KID, CJ_RICH, CJ_HURT, SWEET, COP, DEALER, RIVAL };
