import html
import json
import re
from pathlib import Path
from urllib.parse import urljoin

ROOT = Path(r"C:\Users\jabdu\Documents\Codex\2026-05-27\files-mentioned-by-the-user-zich")
manuals_html = (ROOT / "medify-product-manuals.html").read_text(encoding="utf-8", errors="ignore")
warranty_html = (ROOT / "medify-lifetime-warranty.html").read_text(encoding="utf-8", errors="ignore")


def strip_tags(text):
    text = re.sub(r"<sup[^>]*>.*?</sup>", "", text, flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", html.unescape(text)).strip()


def abs_url(url):
    if not url:
        return ""
    url = html.unescape(url).replace("{width}", "600")
    return urljoin("https://medifyair.com", url)


manuals = []
blocks = re.split(r'<div class="col-12 col-md-6 mob-space[^"]*"', manuals_html)[1:]
for block in blocks:
    block = block.split('<div class="col-12 col-md-6 mob-space', 1)[0]
    title_match = re.search(r'<h3 class="single-product__title">(.*?)</h3>', block, re.I | re.S)
    if not title_match:
        continue
    title = strip_tags(title_match.group(1))
    if "MA-" not in title.upper():
        continue

    image_match = re.search(r'<img[^>]+(?:src|data-master)="([^"]+)"', block, re.I)
    manual_match = None
    for href in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>', block, re.I):
        if ".pdf" in href.lower() or "cdn.shopify.com" in href.lower():
            manual_match = href
            break
    product_match = re.search(r'<a[^>]+href="([^"]+)"[^>]*>\s*<h3 class="single-product__title">', block, re.I | re.S)
    bullets = [strip_tags(item) for item in re.findall(r"<li>(.*?)</li>", block, re.I | re.S)]
    model_match = re.search(r"\bMA-\d{2,4}(?:\s*PRO)?(?:-V3\.0)?", title, re.I)
    manuals.append(
        {
            "model": model_match.group(0).upper() if model_match else title,
            "title": title,
            "image": abs_url(image_match.group(1)) if image_match else "",
            "bullets": bullets,
            "manualUrl": abs_url(manual_match) if manual_match else "",
            "productUrl": abs_url(product_match.group(1)) if product_match else "",
        }
    )

for text, href in re.findall(r"Download the (MA-[^<]+?) product manual\s*<a[^>]+href=\"([^\"]+)\"", manuals_html, re.I | re.S):
    model_match = re.search(r"\bMA-\d{2,4}(?:\s*PRO)?", text, re.I)
    if model_match:
        model = model_match.group(0).upper()
        if not any(item["model"] == model for item in manuals):
            manuals.append(
                {
                    "model": model,
                    "title": f"{model} Air Purifier",
                    "image": "",
                    "bullets": [],
                    "manualUrl": abs_url(href),
                    "productUrl": "",
                }
            )

warranty_models = []
for label in re.findall(r"<option[^>]*>(.*?)</option>", warranty_html, re.I | re.S):
    label = strip_tags(label)
    if re.search(r"\bMA-", label, re.I):
        warranty_models.append(label)

payload = {
    "sourceUrl": "https://medifyair.com/pages/product-manuals",
    "warrantyUrl": "https://medifyair.com/pages/lifetime-warranty",
    "faqUrl": "https://medifyair.com/pages/faq",
    "manuals": manuals,
    "warrantyModels": warranty_models,
    "warrantySummary": [
        "Medify states registered products are backed by limited lifetime coverage.",
        "Register the product within 30 days of purchase to qualify.",
        "Use the purifier according to the product manual and use the proper power supply.",
        "Warranty is non-transferable and requires proof of purchase.",
        "Use genuine Medify replacement filters and follow the unit warranty agreement to maintain coverage.",
        "For warranty submissions, Medify says to email info@medifyair.com or call customer support.",
    ],
}

(ROOT / "medify_manuals.js").write_text(
    "window.MEDIFY_MANUALS = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n",
    encoding="utf-8",
)

print(json.dumps({"manuals": len(manuals), "warrantyModels": warranty_models}, indent=2))
