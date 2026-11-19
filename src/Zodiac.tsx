import React from "react";
import { Composition } from "remotion";
import { ZodiacProof } from "./videos/zodiac/Zodiac";
import { TOTAL } from "./videos/zodiac/story";

export const ZodiacCompositions: React.FC = () => {
  return (
    <Composition
      id="ZodiacProof"
      component={ZodiacProof}
      durationInFrames={TOTAL}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};
