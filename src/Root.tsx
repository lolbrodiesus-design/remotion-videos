import { MyComposition } from "./Composition";
import { TestFilmCompositions } from "./TestFilm";
import { CannibalismCompositions } from "./Cannibalism";
import { Cannibalism10minCompositions } from "./Cannibalism10min";
import { ThumbnailsCompositions } from "./Thumbnails";
import { BridgeCompositions } from "./Bridge";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <MyComposition />
      <TestFilmCompositions />
      <CannibalismCompositions />
      <Cannibalism10minCompositions />
      <ThumbnailsCompositions />
      <BridgeCompositions />
    </>
  );
};
