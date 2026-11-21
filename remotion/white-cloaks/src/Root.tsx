import React from 'react';
import { Composition } from 'remotion';
import { WhiteCloaks } from './WhiteCloaks';
import { TOTAL_FRAMES } from './engine/player';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WhiteCloaks"
      component={WhiteCloaks}
      durationInFrames={TOTAL_FRAMES}
      fps={24}
      width={1920}
      height={1080}
    />
  );
};
