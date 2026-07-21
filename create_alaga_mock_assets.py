from pathlib import Path

from PIL import Image

ROOT = Path(r"C:\Users\jabdu\Documents\Codex\2026-05-27\files-mentioned-by-the-user-zich")
OUT = ROOT / "alaga-mock" / "assets"
OUT.mkdir(parents=True, exist_ok=True)

desktop = Image.open(ROOT / "alaga-desktop-wait.png").convert("RGB")
w, h = desktop.size
hero = desktop.crop((0, 70, w, int(h * 0.44)))
hero.save(OUT / "alaga-hero.jpg", quality=88, optimize=True)

mobile = Image.open(ROOT / "alaga-mobile-wait.png").convert("RGB")
mw, mh = mobile.size
mobile_hero = mobile.crop((0, 45, mw, int(mh * 0.58)))
mobile_hero.save(OUT / "alaga-hero-mobile.jpg", quality=88, optimize=True)

print("Mockup image assets created.")
