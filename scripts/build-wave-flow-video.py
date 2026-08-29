#!/usr/bin/env python3
"""Build scroll-scrub wave flow video from paper-relief layer PNGs."""

from __future__ import annotations

import math
import os
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
LAYERS = ROOT / "public/textures/waves/layers"
OUT_DIR = ROOT / "public/textures/waves"
FRAMES_DIR = ROOT / ".wave-flow-frames"

W, H = 1024, 1536
FPS = 30
DURATION = 3.0
FRAME_COUNT = int(FPS * DURATION)


def load_rgba(path: Path) -> Image.Image:
    im = Image.open(path).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a < 8:
                continue
            brightness = (r + g + b) / 3
            spread = max(r, g, b) - min(r, g, b)
            if brightness > 246 and spread < 12:
                px[x, y] = (r, g, b, 0)
            elif brightness > 232 and spread < 22:
                alpha = int(max(0, min(255, (255 - brightness) * 18)))
                px[x, y] = (r, g, b, alpha)
    return im


def make_base() -> Image.Image:
    base = Image.new("RGBA", (W, H), (248, 251, 254, 255))
    draw = ImageDraw.Draw(base)
    for y in range(H):
        t = y / H
        r = int(248 + (238 - 248) * t)
        g = int(251 + (244 - 251) * t)
        b = int(254 + (248 - 254) * t)
        draw.line([(0, y), (W, y)], fill=(r, g, b, 255))
    return base


def paste_layer(
    canvas: Image.Image,
    layer: Image.Image,
    offset_x: float,
    offset_y: int,
) -> None:
    x = int(offset_x)
    canvas.alpha_composite(layer, (x, offset_y))


def main() -> None:
    FRAMES_DIR.mkdir(parents=True, exist_ok=True)
    back = load_rgba(LAYERS / "wave-layer-back.png").resize((W, H), Image.Resampling.LANCZOS)
    mid = load_rgba(LAYERS / "wave-layer-mid.png").resize((W, H), Image.Resampling.LANCZOS)
    front = load_rgba(LAYERS / "wave-layer-front.png").resize((W, H), Image.Resampling.LANCZOS)
    base = make_base()

    for i in range(FACE_COUNT := FRAME_COUNT):
        t = i / FPS
        phase = (t / DURATION) * math.pi * 2
        frame = base.copy()
        paste_layer(frame, back, 18 * math.sin(phase * 0.9), 0)
        paste_layer(frame, mid, -24 * math.sin(phase * 1.0 + 0.8), 0)
        paste_layer(frame, front, 32 * math.sin(phase * 1.1 + 1.6), 0)
        frame.save(FRAMES_DIR / f"frame_{i:03d}.png", optimize=True)

    print(f"Wrote {FACE_COUNT} frames to {FRAMES_DIR}")


if __name__ == "__main__":
    main()
