# remotion-videos

Remotion animated videos, rendered in parallel on GitHub Actions.

## Test: Bridge intro (10 seconds)

`.github/workflows/test-bridge-intro.yml` renders frames 0–299 of the
`BridgeShort` composition ("The Bridge That Fell for a Song") in 4 parallel
chunks (A 0–74, B 75–149, C 150–224, D 225–299), joins them, and uploads
`bridge-intro-10s.mp4` as a workflow artifact. It also commits
`render-status.json` with the measured per-frame pace and the estimated
GitHub minutes for a 10-minute video.

Kenney 3D props (24 GLBs) are downloaded during the run from the
ETdoFresh/kenney.nl mirror — they are not stored in this repo.
