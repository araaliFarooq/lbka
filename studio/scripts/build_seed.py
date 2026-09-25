#!/usr/bin/env python3
"""Build studio/seed/production.ndjson from the static site pages."""

import json
import re
from html import unescape
from pathlib import Path
from urllib.parse import parse_qs, urlparse

APP = Path(__file__).resolve().parents[2] / "app"
OUT = Path(__file__).resolve().parents[1] / "seed" / "production.ndjson"

PAGES = [
    ("home", "index.html"),
    ("about", "about.html"),
    ("packages", "packages.html"),
    ("gallery", "gallery.html"),
    ("updates", "updates.html"),
    ("book", "book.html"),
]


def clean(value):
    text = re.sub(r"<[^>]+>", " ", value or "")
    return unescape(re.sub(r"\s+", " ", text)).strip()


def block(text):
    return [{
        "_type": "block",
        "_key": "body",
        "style": "normal",
        "markDefs": [],
        "children": [{"_type": "span", "_key": "span", "text": text, "marks": []}],
    }]


def slug(current):
    return {"_type": "slug", "current": current}


def docs():
    yield {
        "_id": "siteSettings",
        "_type": "siteSettings",
        "siteName": "LABAIKA",
        "tagline": "Explore the Halaal Way with LABAIKA",
        "phone": "+256 772 676 128",
        "secondaryPhone": "+256 701 445 522",
        "email": "info@labaikatravel.ug",
        "whatsapp": "256772676128",
        "kampalaAddress": "Cham Towers, Level 2, Suite 4, Nkrumah Rd",
        "jinjaAddress": "Salaam Arcade, Main Street",
        "facebook": "https://facebook.com/p/Labaika-Tour-Travel-100068347666304/",
        "youtube": "https://www.youtube.com/@LabaikaIslamMedia7",
        "tiktok": "https://www.tiktok.com/@labaikaug",
    }

    for order, (name, filename) in enumerate(PAGES, start=1):
        html = (APP / filename).read_text()
        title_match = re.search(r"<title>(.*?)</title>", html, re.S)
        title = clean(title_match.group(1)) if title_match else filename
        headline = clean(re.search(r"<h1[^>]*>(.*?)</h1>", html, re.S).group(1)) if re.search(r"<h1", html) else title
        paragraphs = [clean(item) for item in re.findall(r"<p[^>]*>(.*?)</p>", html, re.S)]
        summary = next((item for item in paragraphs if len(item) > 80), "")
        yield {
            "_id": "page-" + name,
            "_type": "page",
            "title": title,
            "slug": slug(name),
            "headline": headline,
            "summary": summary,
            "body": block(summary) if summary else [],
            "sortOrder": order,
        }

    packages = (APP / "packages.html").read_text()
    for order, match in enumerate(re.finditer(r'<article id="([^"]+)" class="package-card [\s\S]*?</article>', packages), start=1):
        chunk = match.group(0)
        ident = match.group(1)
        href = re.search(r'href="(book\.html[^"]*)"', chunk)
        query = parse_qs(urlparse(href.group(1)).query) if href else {}
        chips = [clean(item) for item in re.findall(r'<span class="px-2\.5 py-1 rounded-md[^"]*">(.*?)</span>', chunk, re.S)]
        badges = [clean(item) for item in re.findall(r'<span class="px-2\.5 py-1 rounded-full[^"]*">(.*?)</span>', chunk, re.S)]
        duration = re.search(r">schedule</span>\s*([^<]+)", chunk)
        image = re.search(r'<img[^>]*src="([^"]+)"[^>]*data-alt="([^"]*)"', chunk) or re.search(r'data-alt="([^"]*)"[^>]*src="([^"]+)"', chunk)
        src, alt = ("", "")
        img = re.search(r"<img\b[^>]*>", chunk)
        if img:
            src_match = re.search(r'src="([^"]+)"', img.group(0))
            alt_match = re.search(r'data-alt="([^"]*)"', img.group(0))
            src = src_match.group(1) if src_match else ""
            alt = clean(alt_match.group(1)) if alt_match else ""
        yield {
            "_id": "package-" + ident,
            "_type": "tourPackage",
            "title": clean(re.search(r"<h3[^>]*>(.*?)</h3>", chunk, re.S).group(1)),
            "slug": slug(ident),
            "category": re.search(r'data-category="([^"]+)"', chunk).group(1),
            "durationBand": re.search(r'data-duration="([^"]+)"', chunk).group(1),
            "durationLabel": clean(duration.group(1)) if duration else "",
            "price": int(re.search(r'data-price="(\d+)"', chunk).group(1)),
            "summary": clean(re.search(r"<p[^>]*>(.*?)</p>", chunk, re.S).group(1)),
            "badge": badges[0] if badges else "",
            "highlight": badges[1] if len(badges) > 1 else "",
            "inclusions": chips,
            "imageUrl": src,
            "imageAlt": alt,
            "bookingTrack": (query.get("track") or ["safari"])[0],
            "bookingPackage": (query.get("package") or ["custom_safari"])[0],
            "bookingNote": (query.get("note") or [""])[0],
            "sortOrder": order,
        }

    gallery = (APP / "gallery.html").read_text()
    starts = [match.start() for match in re.finditer(r'class="gallery-card ', gallery)]
    for order, start in enumerate(starts, start=1):
        end = starts[order] if order < len(starts) else gallery.find("<!-- Video", start)
        chunk_all = gallery[start:end if end != -1 else None]
        classes = chunk_all.split('"', 2)[1].replace("gallery-card ", "", 1)
        chunk = chunk_all
        category = next((name for name in ("pilgrimage", "safari", "leisure", "community") if name in classes.split()), "safari")
        span = re.search(r"lg:col-span-(\d+)", classes)
        title = re.search(r"<h3[^>]*>(.*?)</h3>", chunk, re.S) or re.search(r"<h4[^>]*>(.*?)</h4>", chunk, re.S)
        caption = re.search(r"<p[^>]*>(.*?)</p>", chunk, re.S)
        img = re.search(r"<img\b[^>]*>", chunk)
        src = re.search(r'src="([^"]+)"', img.group(0)).group(1) if img and re.search(r'src="', img.group(0) or "") else ""
        alt = clean(re.search(r'data-alt="([^"]*)"', img.group(0)).group(1)) if img and re.search(r'data-alt="', img.group(0) or "") else ""
        location = ""
        pin = re.search(r"pin_drop</span>\s*([^<]+)", chunk)
        place = re.search(r'<span class="font-label-caps[^"]*"[^>]*>(.*?)</span>', chunk, re.S)
        if pin:
            location = clean(pin.group(1))
        elif place:
            location = clean(place.group(1))
        if not title:
            continue
        yield {
            "_id": "gallery-%02d" % order,
            "_type": "galleryItem",
            "title": clean(title.group(1)),
            "category": category,
            "location": location,
            "caption": clean(caption.group(1)) if caption else "",
            "imageUrl": src,
            "imageAlt": alt,
            "span": int(span.group(1)) if span else 4,
            "sortOrder": order,
        }

    updates = (APP / "updates.html").read_text()
    lead = re.search(r'id="lead-article"([\s\S]*?)<div class="grid[^"]*" id="articles-container">', updates)
    if lead:
        chunk = lead.group(1)
        headings = [clean(item) for item in re.findall(r"<h3[^>]*>(.*?)</h3>", chunk, re.S)]
        title = headings[-1] if headings else "Featured story"
        paragraphs = [clean(item) for item in re.findall(r"<p[^>]*>(.*?)</p>", chunk, re.S)]
        excerpt = next((item for item in paragraphs if len(item) > 40), "")
        img = re.search(r"<img\b[^>]*>", chunk)
        src = re.search(r'src="([^"]+)"', img.group(0)).group(1) if img else ""
        alt = clean(re.search(r'data-alt="([^"]*)"', img.group(0)).group(1)) if img and re.search(r"data-alt=", img.group(0)) else ""
        yield {
            "_id": "update-lead",
            "_type": "updatePost",
            "title": title,
            "slug": slug("lead"),
            "category": "pilgrimage",
            "excerpt": excerpt,
            "body": block(excerpt),
            "featured": True,
            "imageUrl": src,
            "imageAlt": alt,
            "sortOrder": 0,
        }

    for order, match in enumerate(re.finditer(r'<article id="article-([^"]+)"([\s\S]*?)</article>', updates), start=1):
        ident, chunk = match.group(1), match.group(2)
        img = re.search(r"<img\b[^>]*>", chunk)
        src = re.search(r'src="([^"]+)"', img.group(0)).group(1) if img else ""
        alt = clean(re.search(r'data-alt="([^"]*)"', img.group(0)).group(1)) if img and re.search(r"data-alt=", img.group(0)) else ""
        place = re.findall(r'<div class="flex items-center gap-1\.5[^"]*"[^>]*>[\s\S]*?<span>(.*?)</span>', chunk)
        yield {
            "_id": "update-" + ident,
            "_type": "updatePost",
            "title": clean(re.search(r"<h3[^>]*>(.*?)</h3>", chunk, re.S).group(1)),
            "slug": slug(ident),
            "category": re.search(r'data-category="([^"]+)"', chunk).group(1),
            "excerpt": clean(re.search(r"<p[^>]*>(.*?)</p>", chunk, re.S).group(1)),
            "body": block(clean(re.search(r"<p[^>]*>(.*?)</p>", chunk, re.S).group(1))),
            "featured": False,
            "imageUrl": src,
            "imageAlt": alt,
            "readTime": clean(re.search(r"(\d+\s+min read)", chunk).group(1)) if re.search(r"\d+\s+min read", chunk) else "",
            "place": clean(place[-1]) if place else "",
            "sortOrder": order,
        }


def main():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    records = list(docs())
    OUT.write_text("".join(json.dumps(record, ensure_ascii=False) + "\n" for record in records))
    counts = {}
    for record in records:
        counts[record["_type"]] = counts.get(record["_type"], 0) + 1
    print(OUT)
    print(counts)


if __name__ == "__main__":
    main()
