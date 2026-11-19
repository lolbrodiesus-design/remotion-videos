import React from "react";
import { Composition } from "remotion";
import { MolassesShort } from "./videos/molasses/Molasses";
import { TOTAL } from "./videos/molasses/story";

export const MolassesCompositions: React.FC = () => {
  return (
    <Composition
      id="MolassesShort"
      component={MolassesShort}
      durationInFrames={TOTAL}
      fps={30}
      width={1080}
      height={1920}
    />
  );
};
