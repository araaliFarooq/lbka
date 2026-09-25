#!/usr/bin/env python3
"""Assemble Stitch page HTML into the linked LABAIKA web app."""

import re
from pathlib import Path
from urllib.parse import quote

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT.parent / "stitch_website_accessibility_check"

ROUTES = {
    "home": "index.html",
    "about-us": "about.html",
    "tour-packages-and-safaris": "packages.html",
    "religious-travel": "packages.html?category=religious",
    "wildlife-safaris": "packages.html?category=wildlife",
    "leisure-and-adventure": "packages.html?category=adventure",
    "gallery": "gallery.html",
    "updates-and-info": "updates.html",
    "booking": "book.html",
    "book-your-trip": "book.html",
}

TEXT_EXACT = {
    "Explore Pilgrimages": "packages.html?category=religious",
    "View Safaris": "packages.html?category=wildlife",
    "Discover Leisure": "packages.html?category=adventure",
    "Corporate Inquiries": "book.html?intent=corporate",
    "View All Safaris": "packages.html",
    "Explore all articles": "updates.html",
    "Browse Tour Packages": "packages.html",
    "Book Your Trip Now": "book.html",
    "Bwindi Gorilla Trekking Expeditions": "packages.html#bwindi-gorilla",
    "Murchison Falls Private Safari": "packages.html#murchison",
    "Queen Elizabeth Big Five Game Drives": "packages.html#bwindi-qenp",
    "VIP Ramadan & Full Season Umrah": "packages.html#hajj-umrah",
    "VIP Ramadan Umrah Packages": "packages.html#hajj-umrah",
    "Comprehensive Hajj Packages": "packages.html#hajj-umrah",
    "Comprehensive Hajj Checklist": "updates.html#travel-advisory",
    "Madinah & Makkah Ziyarah Tour": "packages.html?category=religious#hajj-umrah",
    "Source of the Nile Jinja Excursion": "packages.html#jinja",
    "Ssese Islands Serenity Retreat": "packages.html#ssese",
    "Saudi Visa Guidelines 2025": "updates.html#article-packing",
    "Health & Vaccine Requirements": "updates.html#travel-advisory",
    "Home": "index.html",
}

SOCIAL = {
    "public": "https://facebook.com/p/Labaika-Tour-Travel-100068347666304/",
    "play_circle": "https://www.youtube.com/@LabaikaIslamMedia7",
    "campaign": "updates.html",
}

ICON_WORDS = {
    "arrow_forward", "east", "explore", "public", "play_circle", "campaign",
    "home", "call", "mail", "support_agent",
}

HOME_READS = [
    "updates.html#lead-article",
    "updates.html#article-pearl",
    "updates.html#article-kibale",
]

HOME_DETAILS = [
    "book.html?track=pilgrimage&package=annual_hajj",
    "book.html?track=safari&package=custom_safari&note=" + quote("3-day chimpanzee tracking in Kibale Forest."),
    "book.html?track=safari&package=bwindi_gorilla",
    "book.html?track=safari&package=jinja_adventure",
]

PACKAGE_LINKS = [
    ("book.html?track=pilgrimage&package=annual_hajj", ""),
    ("book.html?track=safari&package=bwindi_gorilla", ""),
    ("book.html?track=safari&package=custom_safari", "3-day chimpanzee tracking in Kibale Forest."),
    ("book.html?track=safari&package=jinja_adventure", ""),
    ("book.html?track=safari&package=murchison_safari", ""),
    ("book.html?track=safari&package=custom_safari", "4-day Ssese Islands experience."),
    ("book.html?track=safari&package=bwindi_gorilla", "6-day Bwindi and Queen Elizabeth safari."),
    ("book.html?track=safari&package=custom_safari", "1-day Shoebill and Bussi Island tour."),
    ("book.html?track=safari&package=custom_safari", "Kampala city excursion."),
]

UPDATE_LINKS = [
    "updates.html#lead-article",
    "updates.html#article-pearl",
    "updates.html#article-kibale",
    "updates.html#article-packing",
    "updates.html#article-gorilla",
    "updates.html#article-jinja",
    "updates.html#article-halal",
]

PACKAGE_IDS = [
    "hajj-umrah", "bwindi-gorilla", "kibale-chimp", "jinja", "murchison",
    "ssese", "bwindi-qenp", "shoebill", "kampala",
]

ARTICLE_IDS = [
    "article-pearl", "article-kibale", "article-packing",
    "article-gorilla", "article-jinja", "article-halal",
]

PAGES = [
    ("labaika_travel_modern_homepage", "index.html", "LABAIKA Travel & Safaris | Home"),
    ("labaika_travel_about_us", "about.html", "About Us | LABAIKA Travel & Safaris"),
    ("Labaika Islam Media", "islam-media.html", "Labaika Islam Media | LABAIKA Travel & Safaris"),
    ("labaika_travel_tour_packages_safaris", "packages.html", "Tour Packages & Safaris | LABAIKA"),
    ("labaika_travel_gallery", "gallery.html", "Gallery | LABAIKA Travel & Safaris"),
    ("labaika_travel_updates_info", "updates.html", "Updates & Info | LABAIKA Travel & Safaris"),
    ("labaika_travel_book_your_trip", "book.html", "Book Your Trip | LABAIKA Travel & Safaris"),
]


def visible_text(inner):
    text = re.sub(r"<[^>]+>", " ", inner)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def cleaned_text(inner):
    parts = [part for part in visible_text(inner).split(" ") if part not in ICON_WORDS]
    return " ".join(parts).strip()


def book_href(base, note):
    if not note:
        return base
    join = "&" if "?" in base else "?"
    return base + join + "note=" + quote(note)


def choose_href(open_tag, inner, page, counters):
    raw = visible_text(inner)
    cleaned = cleaned_text(inner)
    href = None
    external = False

    match = re.search(r'data-path="([^"]+)"', open_tag)
    if match and match.group(1) in ROUTES:
        href = ROUTES[match.group(1)]

    if cleaned in TEXT_EXACT:
        href = TEXT_EXACT[cleaned]

    if raw in SOCIAL:
        href = SOCIAL[raw]
        external = raw != "campaign"

    if page == "index.html" and cleaned == "DETAILS":
        href = counters["details"].pop(0)
    if page == "index.html" and cleaned == "READ MORE":
        href = counters["reads"].pop(0)
    if page == "packages.html" and cleaned == "Explore Itinerary":
        base, note = counters["packages"].pop(0)
        href = book_href(base, note)
    if page == "updates.html" and cleaned.startswith("Read "):
        href = counters["updates"].pop(0)

    current = re.search(r'href="([^"]*)"', open_tag)
    if href is None and current and current.group(1) not in ("#", ""):
        href = current.group(1)
    return href, external


def rewrite_anchors(html, page):
    counters = {
        "details": HOME_DETAILS.copy(),
        "reads": HOME_READS.copy(),
        "packages": PACKAGE_LINKS.copy(),
        "updates": UPDATE_LINKS.copy(),
    }
    leftovers = []

    def repl(match):
        full = match.group(0)
        open_tag = re.match(r"<a\b[^>]*>", full).group(0)
        inner = full[len(open_tag):-4]
        href, external = choose_href(open_tag, inner, page, counters)
        if not href:
            if re.search(r'href="#"', open_tag):
                leftovers.append(cleaned_text(inner) or visible_text(inner))
            return full
        new_open = re.sub(r'href="[^"]*"', 'href="' + href + '"', open_tag, count=1)
        if external and "target=" not in new_open:
            new_open = new_open[:-1] + ' target="_blank" rel="noopener noreferrer">'
        return new_open + inner + "</a>"

    updated = re.sub(r"<a\b[^>]*>.*?</a>", repl, html, flags=re.S)
    return updated, leftovers


def stamp_ids(html, class_name, ids):
    queue = ids.copy()

    def repl(match):
        if not queue:
            return match.group(0)
        return '<article id="%s" class="%s ' % (queue.pop(0), class_name)

    return re.sub(r'<article class="' + re.escape(class_name) + r' ', repl, html)


LOGO_SRC = "https://lh3.googleusercontent.com/aida/AEtjO1WdH1_8PP2WEcu0qv1QMyDFqz023_pW6t6xRuTj_nGY7juwNmVQ_vjgYVgZ8xItGUEj5dl4mkjpGaefWZU3TfXtpFyOSbKF-5F3qWrDE-Lw360HXQi5hfMh2UGf5xgYQDDb-0G1-Ih6ax_yAC8KJAko9tIvJ6X7pWsSj0L1X3SyiPBqDKDfge6dXoxxlF1U0fY_hkGV4iWBoOJq5h3I4MqbcU1HqIDH-iy3UdGv3T6d4EDH-UHA62HZaA"

NAV_ITEMS = [
    ("home", "index.html", "Home"),
    ("about", "about.html", "About Us"),
    ("islam-media", "islam-media.html", "Islam Media"),
    ("packages", "packages.html", "Packages"),
    ("gallery", "gallery.html", "Gallery"),
    ("updates", "updates.html", "Updates"),
]


PACKAGE_MENU = [
    ("packages.html?category=religious", "Religious Travel"),
    ("packages.html?category=wildlife", "Wildlife Safaris"),
    ("packages.html?category=adventure", "Leisure &amp; Adventure"),
]


def package_dropdown(active):
    current = ' aria-current="page"' if active == "packages" else ""
    state = " is-active" if active == "packages" else ""
    items = "".join(
        '<a href="%s">%s</a>' % item for item in PACKAGE_MENU
    )
    return (
        '<div class="site-dropdown">'
        '<a class="site-nav-link%s" href="packages.html"%s>Packages</a>'
        '<button type="button" class="site-dropdown-toggle" aria-expanded="false" aria-controls="packages-menu" aria-label="Open package categories">'
        '<span class="material-symbols-outlined">expand_more</span></button>'
        '<div class="site-dropdown-menu" id="packages-menu" hidden>%s</div>'
        "</div>"
    ) % (state, current, items)


def site_header(active):
    links = []
    for key, href, label in NAV_ITEMS:
        if key == "packages":
            links.append(package_dropdown(active))
            continue
        current = ' aria-current="page"' if key == active else ""
        state = " is-active" if key == active else ""
        links.append('<a class="site-nav-link%s" href="%s"%s>%s</a>' % (state, href, current, label))
    book_state = " is-active" if active == "book" else ""
    book_current = ' aria-current="page"' if active == "book" else ""
    return (
        '<header class="site-header"><div class="site-header-bar">'
        '<a class="site-brand" href="index.html" aria-label="LABAIKA home">'
        '<img alt="LABAIKA Travel &amp; Safaris" src="%s"/>'
        '<span>LABAIKA</span></a>'
        '<nav class="site-nav" aria-label="Primary">%s</nav>'
        '<div class="site-actions">'
        '<a class="site-phone" href="tel:+256772676128">'
        '<span class="material-symbols-outlined">support_agent</span>'
        '<span>+256 772 676 128</span></a>'
        '<a class="site-book%s" href="book.html"%s>Book Your Trip</a>'
        '</div></div></header>'
    ) % (LOGO_SRC, "".join(links), book_state, book_current)


def standardize_header(html, filename):
    active = "home" if filename == "index.html" else filename.replace(".html", "")
    html = re.sub(r"<header[\s\S]*?</header>", site_header(active), html, count=1)
    if 'href="css/nav.css"' not in html:
        html = html.replace("</head>", '<link href="css/nav.css" rel="stylesheet"/></head>', 1)
    return html


def prepare(html, filename, title):
    html = re.sub(r"<title>.*?</title>", "<title>" + title + "</title>", html, count=1)
    html = html.replace(
        "onsubmit=\"event.preventDefault(); alert('Jazakallah Khair! Your inquiry has been received. Our Umrah concierge will contact you shortly.');\"",
        'onsubmit="event.preventDefault();"',
    )
    if filename == "packages.html":
        html = stamp_ids(html, "package-card", PACKAGE_IDS)
    if filename == "updates.html":
        html = re.sub(
            r"<!-- Editorial Lead Article: Deep Luxury Showcase -->\s*<section ",
            '<!-- Editorial Lead Article: Deep Luxury Showcase -->\n<section id="lead-article" ',
            html,
            count=1,
        )
        html = stamp_ids(html, "article-card", ARTICLE_IDS)
    html, leftovers = rewrite_anchors(html, filename)
    if "</body>" not in html:
        raise SystemExit("missing body in " + filename)
    slug = filename.replace(".html", "")
    if slug == "index":
        slug = "home"
    html = html.replace("<body ", '<body data-page="' + slug + '" ', 1)
    html = html.replace(
        "</body>",
        '<script src="js/sanity.public.js"></script><script src="js/content.js"></script><script src="js/site.js"></script></body>',
        1,
    )
    html = standardize_header(html, filename)
    return html, leftovers


def main():
    for folder, filename, title in PAGES:
        source = SOURCE / folder / "code.html"
        html, leftovers = prepare(source.read_text(), filename, title)
        (ROOT / filename).write_text(html)
        print(filename, "bytes", len(html), "unlinked", leftovers)


if __name__ == "__main__":
    main()
