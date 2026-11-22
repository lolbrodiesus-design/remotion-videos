#!/usr/bin/env python3
"""Split a video project's frames into N contiguous chunk ranges.

Reads a project's shots.json (preferred — duration comes from the file, and
the split can be cross-checked against shot boundaries) or a bare duration,
and emits the exact chunk ranges the GitHub 20-VM render workflow needs.

Frame math (must match render.mjs exactly):
  total_frames = round(duration * fps)
  chunk k covers frames [start, end) — end is EXCLUSIVE.
  render.mjs is called with --from start/fps --to end/fps (6 decimals), and
  it computes f0 = round(from*fps), f1 = round(to*fps), so the rendered chunk
  has exactly end-start frames and consecutive chunks join with no dropped
  or duplicated frames. The White Cloaks run used this exact scheme.

  Why round(), not ceil(): the player computes TOTAL_FRAMES as
  ceil(duration*fps) (15887 for TikTok), but the story's last shot ends at
  661.918s, so a chunk rendered with --to 661.918 stops at
  round(661.918*24) = 15886 — the delivered v1 file has exactly 15886
  frames at 661.917s, matching the trimmed VO (661.918s) frame for frame.
  ceil() would append one extra frame past the story end (661.958s).
  round() reproduces the delivered file exactly; White Cloaks is
  unaffected (30.44*24 = 730.56 rounds to 731, same as ceil).

Usage:
  split_chunks.py --shots story/shots.json [--chunks 20] [--fps 24]
                  [--snap-to-shots] [--format github-matrix|json|table]
                  [--out chunks.json]
  split_chunks.py --duration 661.918 --fps 24 --chunks 20 --format json
  split_chunks.py --total-frames 15886 --fps 24 --chunks 20 --format github-matrix
"""
import argparse
import json
import sys


def split_frames(total_frames, n_chunks):
    """Even split: first (total % n) chunks get one extra frame."""
    if n_chunks < 1:
        raise ValueError("chunks must be >= 1")
    if total_frames < n_chunks:
        raise ValueError(f"only {total_frames} frames for {n_chunks} chunks")
    base, rem = divmod(total_frames, n_chunks)
    ranges, start = [], 0
    for k in range(n_chunks):
        count = base + 1 if k < rem else base
        ranges.append({"chunk": f"{k:02d}", "start": start, "end": start + count,
                       "count": count})
        start += count
    return ranges


def snap_to_shot_boundaries(ranges, shots, fps):
    """Move each interior boundary to the nearest shot-start frame.

    Keeps chunks shot-complete (easier to debug a bad chunk) while keeping
    the frame-exactness above. Boundaries stay strictly increasing and no
    chunk becomes empty; if a snap would break that, the frame boundary
    is kept.
    """
    starts = sorted({round(s["start"] * fps) for s in shots if s["start"] > 0})
    if not starts:
        return ranges
    out = [dict(r) for r in ranges]
    for i in range(1, len(out)):
        boundary = out[i]["start"]
        nearest = min(starts, key=lambda s: abs(s - boundary))
        if abs(nearest - boundary) <= max(24, boundary // 20):  # within ~1s or 5%
            if out[i - 1]["start"] < nearest < out[i]["end"]:
                out[i - 1]["end"] = nearest
                out[i - 1]["count"] = nearest - out[i - 1]["start"]
                out[i]["start"] = nearest
                out[i]["count"] = out[i]["end"] - nearest
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--shots", help="path to story/shots.json")
    ap.add_argument("--duration", type=float, help="duration in seconds (if no --shots)")
    ap.add_argument("--total-frames", type=int,
                    help="total frames directly (Remotion path; duration is derived)")
    ap.add_argument("--fps", type=int, default=24)
    ap.add_argument("--chunks", type=int, default=20)
    ap.add_argument("--snap-to-shots", action="store_true",
                    help="snap chunk boundaries to nearest shot start")
    ap.add_argument("--format", choices=["github-matrix", "json", "table"],
                    default="table")
    ap.add_argument("--out", help="write the full manifest JSON here")
    args = ap.parse_args()

    shots = None
    total_frames = None
    if args.total_frames is not None:
        total_frames = args.total_frames
        duration = total_frames / args.fps
    if args.shots:
        with open(args.shots) as f:
            data = json.load(f)
        duration = float(data["duration"])
        shots = data["shots"]
        if args.duration is not None and abs(args.duration - duration) > 0.01:
            sys.exit(f"ERROR: --duration {args.duration} != shots.json "
                     f"duration {duration}; refusing to split")
        if total_frames is not None and total_frames != round(duration * args.fps):
            sys.exit(f"ERROR: --total-frames {total_frames} != "
                     f"round(shots.json duration * fps) = {round(duration * args.fps)}")
    elif args.duration is not None:
        duration = args.duration
    elif total_frames is None:
        ap.error("need --shots, --duration, or --total-frames")

    if total_frames is None:
        # round(), not ceil(): see the module docstring — this reproduces
        # the delivered file's exact frame count (15886 for TikTok).
        total_frames = round(duration * args.fps)
    ranges = split_frames(total_frames, args.chunks)
    if args.snap_to_shots and shots:
        ranges = snap_to_shot_boundaries(ranges, shots, args.fps)

    # Sanity: contiguous, exact coverage, no empty chunk.
    assert ranges[0]["start"] == 0, "first chunk must start at frame 0"
    assert ranges[-1]["end"] == total_frames, "last chunk must end at total_frames"
    for a, b in zip(ranges, ranges[1:]):
        assert a["end"] == b["start"], f"gap/overlap between chunks {a['chunk']} and {b['chunk']}"
        assert a["count"] > 0, f"empty chunk {a['chunk']}"
    assert ranges[-1]["count"] > 0

    for r in ranges:
        r["frames"] = f"{r['start']}-{r['end'] - 1}"
        r["from"] = f"{r['start'] / args.fps:.6f}"
        r["to"] = f"{r['end'] / args.fps:.6f}"

    manifest = {
        "duration": duration,
        "fps": args.fps,
        "total_frames": total_frames,
        "n_chunks": args.chunks,
        "snap_to_shots": bool(args.snap_to_shots and shots),
        "chunks": ranges,
    }
    if args.out:
        with open(args.out, "w") as f:
            json.dump(manifest, f, indent=1)

    if args.format == "github-matrix":
        print(json.dumps({"include": [
            {"chunk": r["chunk"], "frames": r["frames"], "from": r["from"],
             "to": r["to"], "count": str(r["count"])} for r in ranges]}))
    elif args.format == "json":
        print(json.dumps(manifest, indent=1))
    else:
        print(f"duration {duration}s  fps {args.fps}  total {total_frames} frames  "
              f"-> {args.chunks} chunks")
        for r in ranges:
            print(f"  chunk {r['chunk']}: frames {r['frames']:>12} "
                  f"({r['count']:>4} frames)  {r['from']}s -> {r['to']}s")


if __name__ == "__main__":
    main()
