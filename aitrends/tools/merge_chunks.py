#!/usr/bin/env python3
"""Merge rendered chunk MP4s into the final video and verify it.

Used by the GitHub 20-VM merge job AND locally after downloading chunk
artifacts. All chunks must come from the same render (same codec, size,
fps, CRF), so the join is a stream copy — no re-encode, no quality loss.

Steps:
  1. Find chunk_XX.mp4 files (recursively — the GitHub
     actions/download-artifact step lands each artifact in its own
     subfolder, e.g. chunk-00/chunk_00.mp4).
  2. ffprobe each chunk's exact frame count (-count_frames) and compare
     against the chunks.json manifest when given.
  3. ffmpeg concat (stream copy) -> silent video.
  4. Optionally mux an SFX-only audio track (AAC, -shortest).
  5. Verify the final file: full decode clean, frame count == expected
     total, duration within 0.1s of expected. Writes a JSON report.
     Exits non-zero on ANY failure.

Usage:
  merge_chunks.py --dir chunks/ --out final.mp4 --manifest chunks.json
                  [--audio sfx_only.mp3] [--report verify.json]
  merge_chunks.py --dir chunks/ --out final.mp4 --expected-frames 15886
                  --expected-duration 661.918
"""
import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path


def run(cmd, check=True):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if check and p.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)} failed:\n{p.stderr.strip()}")
    return p


def ffprobe_frames(path):
    """Exact frame count (decodes the stream header count, like the
    Remotion workflow's check). Falls back to container nb_frames."""
    p = run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0",
             "-show_entries", "stream=nb_read_frames",
             "-of", "csv=p=0", str(path)])
    n = p.stdout.strip()
    if n.isdigit():
        return int(n)
    p = run(["ffprobe", "-v", "error", "-select_streams", "v:0",
             "-show_entries", "stream=nb_frames",
             "-of", "csv=p=0", str(path)])
    if p.stdout.strip().isdigit():
        return int(p.stdout.strip())
    raise RuntimeError(f"could not read frame count of {path}")


def ffprobe_duration(path):
    p = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "csv=p=0", str(path)])
    return float(p.stdout.strip())


def decode_check(path):
    """Full decode; any error line fails the check."""
    p = run(["ffmpeg", "-v", "error", "-i", str(path), "-f", "null", "-"],
            check=False)
    return p.returncode == 0, p.stderr.strip()


def find_chunks(directory):
    found = {}
    for p in Path(directory).rglob("chunk_*.mp4"):
        m = re.fullmatch(r"chunk_(\d+)\.mp4", p.name)
        if m:
            found.setdefault(int(m.group(1)), p)
    if not found:
        sys.exit(f"ERROR: no chunk_XX.mp4 files under {directory}")
    ids = sorted(found)
    if ids != list(range(ids[0], ids[0] + len(ids))):
        sys.exit(f"ERROR: chunk ids are not contiguous: {ids}")
    return [found[i] for i in ids]


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dir", required=True, help="dir holding chunk_XX.mp4 files")
    ap.add_argument("--out", required=True, help="final mp4 path")
    ap.add_argument("--manifest", help="chunks.json from split_chunks.py")
    ap.add_argument("--expected-frames", type=int)
    ap.add_argument("--expected-duration", type=float)
    ap.add_argument("--audio", help="SFX-only audio file to mux (optional)")
    ap.add_argument("--report", help="write verification report JSON here")
    args = ap.parse_args()

    manifest = None
    if args.manifest:
        manifest = json.loads(Path(args.manifest).read_text())
    expected_frames = args.expected_frames or (manifest["total_frames"] if manifest else None)
    expected_duration = args.expected_duration or (manifest["duration"] if manifest else None)

    chunks = find_chunks(args.dir)
    print(f"found {len(chunks)} chunks")
    report = {"chunks": [], "ok": False}

    # 1-2. Per-chunk frame counts.
    total = 0
    for i, p in enumerate(chunks):
        n = ffprobe_frames(p)
        entry = {"file": str(p), "frames": n}
        if manifest:
            want = manifest["chunks"][i]["count"]
            entry["expected"] = want
            entry["match"] = n == want
            if n != want:
                print(f"  MISMATCH chunk {i:02d}: got {n} frames, expected {want}")
        total += n
        report["chunks"].append(entry)
        print(f"  chunk {i:02d}: {n} frames  {p}")
    report["total_chunk_frames"] = total
    if expected_frames and total != expected_frames:
        sys.exit(f"ERROR: chunk frames sum {total} != expected {expected_frames}")

    # 3. Concat (stream copy).
    concat = Path(args.out).with_suffix(".concat.txt")
    concat.write_text("\n".join(
        f"file '{p.resolve().as_posix().replace(chr(39), chr(39)+chr(92)+chr(39)+chr(39))}'"
        for p in chunks) + "\n")
    silent = Path(args.out)
    if args.audio:
        silent = Path(str(args.out) + ".silent.mp4")
    run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
         "-i", str(concat), "-c", "copy", "-movflags", "+faststart", str(silent)])
    print(f"joined silent video: {silent}")

    # 4. Optional audio mux.
    if args.audio:
        if not Path(args.audio).exists():
            sys.exit(f"ERROR: audio file not found: {args.audio}")
        run(["ffmpeg", "-y", "-v", "error", "-i", str(silent), "-i", args.audio,
             "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac",
             "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(args.out)])
        print(f"muxed audio {args.audio} -> {args.out}")

    # 5. Verify the final file.
    final_frames = ffprobe_frames(args.out)
    final_duration = ffprobe_duration(args.out)
    ok_decode, decode_err = decode_check(args.out)
    report.update({"final": str(args.out), "final_frames": final_frames,
                   "final_duration": round(final_duration, 3),
                   "expected_frames": expected_frames,
                   "expected_duration": expected_duration,
                   "decode_clean": ok_decode})
    print(f"final: {final_frames} frames, {final_duration:.3f}s, decode clean: {ok_decode}")
    problems = []
    if not ok_decode:
        problems.append(f"decode errors: {decode_err[:500]}")
    if expected_frames and final_frames != expected_frames:
        problems.append(f"frame count {final_frames} != expected {expected_frames}")
    if expected_duration and abs(final_duration - expected_duration) > 0.15:
        problems.append(f"duration {final_duration:.3f} != expected {expected_duration}")
    if problems:
        report["problems"] = problems
        if args.report:
            Path(args.report).write_text(json.dumps(report, indent=1))
        sys.exit("ERROR: verification FAILED:\n  " + "\n  ".join(problems))
    report["ok"] = True
    if args.report:
        Path(args.report).write_text(json.dumps(report, indent=1))
    print("VERIFY OK")


if __name__ == "__main__":
    main()
