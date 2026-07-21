from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(r"C:\Users\jabdu\Documents\Codex\2026-05-27\files-mentioned-by-the-user-zich")
OUT = ROOT / "alaga-audit-screenshots"
OUT.mkdir(exist_ok=True)


def crop(src, name, box, label):
    img = Image.open(ROOT / src).convert("RGB")
    w, h = img.size
    left, top, right, bottom = box
    box = (
        max(0, int(left * w)),
        max(0, int(top * h)),
        min(w, int(right * w)),
        min(h, int(bottom * h)),
    )
    out = img.crop(box)
    draw = ImageDraw.Draw(out)
    draw.rectangle((0, 0, out.width - 1, 34), fill=(210, 55, 49))
    draw.text((10, 9), label, fill=(255, 255, 255))
    out.save(OUT / name, quality=92)


crop(
    "alaga-desktop-wait.png",
    "issue-01-desktop-hero-text-missing.png",
    (0, 0, 1, 0.55),
    "Issue 01: Desktop hero has image but no visible headline/CTA",
)

crop(
    "alaga-mobile-wait.png",
    "issue-02-mobile-cta-clipped.png",
    (0, 0, 1, 0.16),
    "Issue 02: Mobile header CTA is clipped",
)

crop(
    "alaga-tablet.png",
    "issue-03-tablet-large-blank-space.png",
    (0, 0, 1, 0.55),
    "Issue 03: Tablet first screen shows large blank space",
)

crop(
    "alaga-desktop-wait.png",
    "issue-04-desktop-broken-logo.png",
    (0.38, 0.42, 0.58, 0.53),
    "Issue 04: Client logo area includes a broken/missing image",
)

crop(
    "alaga-mobile-wait.png",
    "issue-05-mobile-hero-no-message.png",
    (0, 0.05, 1, 0.6),
    "Issue 05: Mobile hero image shows no visible value proposition",
)

print(f"Created screenshots in {OUT}")
