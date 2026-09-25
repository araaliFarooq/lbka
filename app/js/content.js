(function () {
  var config = window.LABAIKA_SANITY || {};
  if (!config.projectId) return;

  var QUERY = `{
    "page": *[_type == "page" && slug.current == $slug][0]{title, headline},
    "packages": *[_type == "tourPackage"] | order(sortOrder asc) {
      title, "slug": slug.current, category, durationBand, durationLabel, price, summary,
      badge, highlight, inclusions, imageUrl, imageAlt, bookingTrack, bookingPackage, bookingNote,
      "uploaded": image.asset->url
    },
    "gallery": *[_type == "galleryItem"] | order(sortOrder asc) {
      title, category, location, caption, imageUrl, imageAlt, span,
      "uploaded": image.asset->url
    },
    "updates": *[_type == "updatePost"] | order(sortOrder asc) {
      title, "slug": slug.current, category, excerpt, featured, imageUrl, imageAlt, readTime, place,
      "uploaded": image.asset->url
    }
  }`;

  var UPDATE_LABELS = {
    safari: "Travel Stories & Safari",
    pilgrimage: "Pilgrimage",
    halal: "Halal Travel",
    announcements: "Announcements"
  };

  function imageOf(item) {
    return item.uploaded || item.imageUrl || "";
  }

  function money(value) {
    return "$" + Number(value || 0).toLocaleString("en-US");
  }

  function bookingHref(item) {
    var href = "book.html?track=" + encodeURIComponent(item.bookingTrack || "safari") +
      "&package=" + encodeURIComponent(item.bookingPackage || "custom_safari");
    if (item.bookingNote) href += "&note=" + encodeURIComponent(item.bookingNote);
    return href;
  }

  function fillPackage(card, item) {
    card.id = item.slug || card.id;
    card.classList.remove("hidden");
    card.setAttribute("data-category", item.category || "religious");
    card.setAttribute("data-duration", item.durationBand || "short");
    card.setAttribute("data-price", String(item.price || 0));
    var img = card.querySelector("img");
    if (img && imageOf(item)) {
      img.src = imageOf(item);
      if (item.imageAlt) img.alt = item.imageAlt;
    }
    var badges = card.querySelectorAll(".absolute.top-4 span");
    if (badges[0] && item.badge) badges[0].textContent = item.badge;
    if (badges[1] && item.highlight) badges[1].textContent = item.highlight;
    var schedule = card.querySelector(".material-symbols-outlined");
    if (schedule && schedule.textContent.trim() === "schedule" && item.durationLabel) {
      schedule.parentElement.lastChild.textContent = " " + item.durationLabel;
    }
    var title = card.querySelector("h3");
    if (title) title.textContent = item.title || "";
    var summary = title && title.nextElementSibling;
    if (summary && summary.tagName === "P") summary.textContent = item.summary || "";
    var chips = summary && summary.nextElementSibling;
    if (chips && item.inclusions && item.inclusions.length) {
      chips.innerHTML = item.inclusions.map(function (label, index) {
        var tone = index === 2
          ? "px-2.5 py-1 rounded-md bg-forest-emerald-light text-secondary font-body-sm text-body-sm text-xs font-medium"
          : "px-2.5 py-1 rounded-md bg-sand-warm text-on-surface font-body-sm text-body-sm text-xs";
        return '<span class="' + tone + '">' + escapeHtml(label) + "</span>";
      }).join("");
    }
    var price = card.querySelector("p.font-headline-sm");
    if (price) {
      price.innerHTML = money(item.price) + ' <span class="font-body-sm text-body-sm text-on-surface-variant font-normal">/ person</span>';
    }
    var link = card.querySelector('a[href*="book.html"]');
    if (link) link.href = bookingHref(item);
  }

  function renderPackages(list) {
    var grid = document.getElementById("packagesGrid");
    if (!grid || !list || !list.length) return;
    var template = grid.querySelector(".package-card");
    if (!template) return;
    var fragment = document.createDocumentFragment();
    list.forEach(function (item) {
      var card = template.cloneNode(true);
      fillPackage(card, item);
      fragment.appendChild(card);
    });
    grid.replaceChildren(fragment);
    var count = document.getElementById("visibleCount");
    if (count) count.textContent = String(list.length);
    bindPackageFilters();
  }

  function bindPackageFilters() {
    replaceNodes(".category-btn");
    replaceNode(document.getElementById("durationFilter"));
    replaceNode(document.getElementById("budgetFilter"));
    replaceNode(document.getElementById("resetFilters"));
    var buttons = document.querySelectorAll(".category-btn");
    var duration = document.getElementById("durationFilter");
    var budget = document.getElementById("budgetFilter");
    var reset = document.getElementById("resetFilters");
    var current = "all";

    function apply() {
      var shown = 0;
      document.querySelectorAll(".package-card").forEach(function (card) {
        var category = card.getAttribute("data-category");
        var band = card.getAttribute("data-duration");
        var price = parseInt(card.getAttribute("data-price") || "0", 10);
        var durationValue = duration ? duration.value : "all";
        var budgetValue = budget ? budget.value : "all";
        var budgetOk = budgetValue === "all" ||
          (budgetValue === "under500" && price < 500) ||
          (budgetValue === "500to1500" && price >= 500 && price <= 1500) ||
          (budgetValue === "over1500" && price > 1500);
        var visible = (current === "all" || category === current) &&
          (durationValue === "all" || band === durationValue) &&
          budgetOk;
        card.classList.toggle("hidden", !visible);
        if (visible) shown += 1;
      });
      var count = document.getElementById("visibleCount");
      var empty = document.getElementById("noResults");
      if (count) count.textContent = String(shown);
      if (empty) empty.classList.toggle("hidden", shown !== 0);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("bg-forest-emerald-surface", "text-on-secondary", "shadow-sm");
          other.classList.add("bg-sand-warm", "text-charcoal-muted");
        });
        button.classList.remove("bg-sand-warm", "text-charcoal-muted");
        button.classList.add("bg-forest-emerald-surface", "text-on-secondary", "shadow-sm");
        current = button.getAttribute("data-filter") || "all";
        apply();
      });
    });
    if (duration) duration.addEventListener("change", apply);
    if (budget) budget.addEventListener("change", apply);
    var category = new URLSearchParams(window.location.search).get("category");
    if (category) {
      buttons.forEach(function (button) {
        if (button.getAttribute("data-filter") === category) button.click();
      });
    }

    if (reset) {
      reset.addEventListener("click", function () {
        current = "all";
        if (duration) duration.value = "all";
        if (budget) budget.value = "all";
        buttons.forEach(function (button, index) {
          var active = index === 0;
          button.classList.toggle("bg-forest-emerald-surface", active);
          button.classList.toggle("text-on-secondary", active);
          button.classList.toggle("shadow-sm", active);
          button.classList.toggle("bg-sand-warm", !active);
          button.classList.toggle("text-charcoal-muted", !active);
        });
        apply();
      });
    }
  }

  function fillGallery(card, item) {
    ["pilgrimage", "safari", "leisure", "community"].forEach(function (name) {
      card.classList.remove(name);
    });
    if (item.category) card.classList.add(item.category);
    ["lg:col-span-4", "lg:col-span-5", "lg:col-span-7", "lg:col-span-8", "lg:col-span-12"].forEach(function (name) {
      card.classList.remove(name);
    });
    card.classList.add("lg:col-span-" + (item.span || 4));
    var img = card.querySelector("img");
    if (img && imageOf(item)) {
      img.src = imageOf(item);
      if (item.imageAlt) img.alt = item.imageAlt;
    }
    var title = card.querySelector("h3, h4");
    if (title) title.textContent = item.title || "";
    var caption = card.querySelector("p");
    if (caption) caption.textContent = item.caption || "";
    if (item.location) {
      var place = card.querySelector(".material-symbols-outlined");
      if (place && place.parentElement) {
        var label = place.parentElement.querySelector("span:last-child") || place.parentElement;
        if (label !== place) label.textContent = item.location;
      }
    }
  }

  function renderGallery(list) {
    var grid = document.getElementById("gallery-cards-grid");
    if (!grid || !list || !list.length) return;
    var existing = Array.prototype.slice.call(grid.querySelectorAll(".gallery-card"));
    if (!existing.length) return;
    list.forEach(function (item, index) {
      var card = existing[index] || existing[0].cloneNode(true);
      fillGallery(card, item);
      if (!existing[index]) grid.appendChild(card);
    });
    existing.slice(list.length).forEach(function (card) { card.remove(); });
    var label = document.getElementById("active-count-label");
    if (label) label.textContent = "Showing all " + list.length + " curated archives";
    bindGalleryFilters();
    if (window.LABAIKA_markGalleryCards) window.LABAIKA_markGalleryCards();
  }

  function bindGalleryFilters() {
    var bar = document.getElementById("gallery-filter-tabs");
    if (!bar) return;
    replaceNodes("#gallery-filter-tabs .filter-btn");
    var buttons = bar.querySelectorAll(".filter-btn");
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("bg-forest-emerald-surface", "text-on-secondary", "shadow-md");
          other.classList.add("bg-surface", "text-charcoal-muted", "shadow-sm");
        });
        button.classList.add("bg-forest-emerald-surface", "text-on-secondary", "shadow-md");
        button.classList.remove("bg-surface", "text-charcoal-muted", "shadow-sm");
        var filter = button.getAttribute("data-filter");
        var shown = 0;
        document.querySelectorAll("#gallery-cards-grid .gallery-card").forEach(function (card) {
          var visible = filter === "all" || card.classList.contains(filter);
          card.style.display = visible ? "block" : "none";
          if (visible) shown += 1;
        });
        var label = document.getElementById("active-count-label");
        if (label) label.textContent = "Showing " + shown + " curated archive" + (shown === 1 ? "" : "s");
      });
    });
  }

  function fillUpdate(card, item) {
    card.id = "article-" + (item.slug || card.id);
    card.setAttribute("data-category", item.category || "safari");
    var img = card.querySelector("img");
    if (img && imageOf(item)) {
      img.src = imageOf(item);
      if (item.imageAlt) img.alt = item.imageAlt;
    }
    var badge = card.querySelector(".absolute.top-4 span");
    if (badge) badge.textContent = UPDATE_LABELS[item.category] || item.category || "";
    var title = card.querySelector("h3");
    if (title) title.textContent = item.title || "";
    var excerpt = card.querySelector("p");
    if (excerpt) excerpt.textContent = item.excerpt || "";
    var link = card.querySelector("a");
    if (link) link.href = "updates.html#" + card.id;
  }

  function renderUpdates(list) {
    var grid = document.getElementById("articles-container");
    if (!grid || !list) return;
    var posts = list.filter(function (item) { return item.slug !== "lead"; });
    var template = grid.querySelector(".article-card");
    if (template && posts.length) {
      var fragment = document.createDocumentFragment();
      posts.forEach(function (item) {
        var card = template.cloneNode(true);
        fillUpdate(card, item);
        fragment.appendChild(card);
      });
      grid.replaceChildren(fragment);
      bindUpdateFilters();
    }
    var featured = list.filter(function (item) { return item.featured; })[0];
    var lead = document.getElementById("lead-article");
    if (featured && lead) {
      var headings = lead.querySelectorAll("h3");
      var title = headings[headings.length - 1];
      if (title) title.textContent = featured.title;
      var excerpt = lead.querySelector("p");
      if (excerpt && featured.excerpt) excerpt.textContent = featured.excerpt;
    }
  }

  function bindUpdateFilters() {
    var bar = document.getElementById("topic-filter-container");
    if (!bar) return;
    replaceNodes("#topic-filter-container .filter-btn");
    var buttons = bar.querySelectorAll(".filter-btn");
    var search = document.getElementById("article-search-input");
    var current = "all";
    var query = "";

    function apply() {
      document.querySelectorAll("#articles-container .article-card").forEach(function (card) {
        var category = card.getAttribute("data-category");
        var text = card.textContent.toLowerCase();
        var visible = (current === "all" || category === current) && (!query || text.indexOf(query) !== -1);
        card.classList.toggle("hidden", !visible);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("active-filter", "bg-forest-emerald-surface", "text-on-secondary");
          other.classList.add("bg-surface-container", "text-on-surface-variant");
        });
        button.classList.add("active-filter", "bg-forest-emerald-surface", "text-on-secondary");
        button.classList.remove("bg-surface-container", "text-on-surface-variant");
        current = button.getAttribute("data-filter") || "all";
        apply();
      });
    });
    if (search) {
      search.addEventListener("input", function () {
        query = search.value.toLowerCase().trim();
        apply();
      });
    }
  }

  function replaceNode(node) {
    if (!node || !node.parentNode) return;
    node.parentNode.replaceChild(node.cloneNode(true), node);
  }

  function replaceNodes(selector) {
    document.querySelectorAll(selector).forEach(replaceNode);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function applyPage(page) {
    if (!page) return;
    if (page.title) document.title = page.title;
  }

  function load() {
    var slug = document.body.getAttribute("data-page") || "home";
    var url = "https://" + config.projectId + ".apicdn.sanity.io/v" + config.apiVersion +
      "/data/query/" + encodeURIComponent(config.dataset || "production") +
      "?query=" + encodeURIComponent(QUERY) +
      "&$slug=" + encodeURIComponent('"' + slug + '"');
    fetch(url)
      .then(function (response) { return response.ok ? response.json() : null; })
      .then(function (payload) {
        var result = payload && payload.result;
        if (!result) return;
        applyPage(result.page);
        renderPackages(result.packages);
        renderGallery(result.gallery);
        renderUpdates(result.updates);
      })
      .catch(function () {});
  }

  document.addEventListener("DOMContentLoaded", load);
})();
