(function () {
  var ROUTES = {
    home: "index.html",
    "about-us": "about.html",
    "tour-packages-and-safaris": "packages.html",
    "religious-travel": "packages.html?category=religious",
    "wildlife-safaris": "packages.html?category=wildlife",
    "leisure-and-adventure": "packages.html?category=adventure",
    gallery: "gallery.html",
    "updates-and-info": "updates.html",
    booking: "book.html",
    "book-your-trip": "book.html"
  };

  var DESTINATIONS = {
    "Holy City of Mecca": "packages.html?category=religious#hajj-umrah",
    "Holy City of Medina": "packages.html?category=religious#hajj-umrah",
    "United Arab Emirates": "book.html?track=pilgrimage&package=custom_pilgrimage&note=" + encodeURIComponent("United Arab Emirates luxury stopover."),
    "Bwindi Impenetrable NP": "packages.html#bwindi-gorilla",
    "Queen Elizabeth NP": "packages.html#bwindi-qenp",
    "Murchison Falls NP": "packages.html#murchison"
  };

  var PLANNER_ROUTES = {
    mecca: "book.html?track=pilgrimage&package=standard_umrah",
    medina: "book.html?track=pilgrimage&package=custom_pilgrimage&note=" + encodeURIComponent("Ziyarah in the Holy City of Medina."),
    bwindi: "book.html?track=safari&package=bwindi_gorilla",
    murchison: "book.html?track=safari&package=murchison_safari",
    "queen-elizabeth": "book.html?track=safari&package=custom_safari&note=" + encodeURIComponent("Queen Elizabeth National Park safari."),
    jinja: "book.html?track=safari&package=jinja_adventure",
    uae: "book.html?track=pilgrimage&package=custom_pilgrimage&note=" + encodeURIComponent("United Arab Emirates luxury stopover.")
  };

  var STORAGE_KEY = "labaika-inquiries";

  function pageFile() {
    var path = window.location.pathname.split("/").pop();
    return path || "index.html";
  }

  function readInquiries() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveInquiry(entry) {
    var all = readInquiries();
    entry.id = Date.now();
    entry.savedAt = new Date().toISOString();
    all.unshift(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 20)));
    renderSavedInquiries();
    return entry;
  }

  function whatsAppUrl(text) {
    return "https://wa.me/256772676128?text=" + encodeURIComponent(text);
  }

  function fieldValue(id) {
    var el = document.getElementById(id);
    return el ? String(el.value || "").trim() : "";
  }

  function markInvalid(el, invalid) {
    if (!el) return;
    el.setAttribute("aria-invalid", invalid ? "true" : "false");
    el.classList.toggle("ring-2", invalid);
    el.classList.toggle("ring-error", invalid);
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validPhone(value) {
    return (value.match(/\d/g) || []).length >= 9;
  }

  function linkLogo() {
    var logo = document.querySelector("header img");
    if (!logo || !logo.parentElement || logo.parentElement.tagName === "A") return;
    var wrap = logo.parentElement;
    var link = document.createElement("a");
    link.href = "index.html";
    link.className = wrap.className;
    link.setAttribute("aria-label", "Labaika travel home");
    while (wrap.firstChild) link.appendChild(wrap.firstChild);
    wrap.replaceWith(link);
  }

  function setupMobileNav() {
    var header = document.querySelector("header");
    var nav = header && header.querySelector("nav");
    if (!header || !nav) return;

    var bar = header.querySelector(".site-header-bar");
    if (!bar) return;

    var desktop = window.matchMedia("(min-width: 1024px)");

    var button = document.createElement("button");
    button.type = "button";
    button.className = "site-menu";
    button.setAttribute("aria-label", "Open menu");
    button.setAttribute("aria-expanded", "false");
    button.innerHTML = '<span class="material-symbols-outlined text-[22px]">menu</span>';
    bar.appendChild(button);

    var overlay = document.createElement("div");
    overlay.id = "mobile-nav";
    overlay.hidden = true;
    overlay.className = "fixed inset-0 z-[70]";
    overlay.innerHTML =
      '<div data-close class="absolute inset-0 bg-[#18181B]/40"></div>' +
      '<div class="absolute top-0 right-0 h-full w-[min(100%,20rem)] bg-surface shadow-xl p-6 flex flex-col gap-2 overflow-y-auto">' +
      '<div class="flex items-center justify-between mb-4"><span class="font-headline-sm text-headline-sm">Menu</span>' +
      '<button type="button" data-close class="w-10 h-10 rounded-lg border border-border-hairline" aria-label="Close menu"><span class="material-symbols-outlined">close</span></button></div>' +
      '<div data-links class="flex flex-col gap-1"></div></div>';
    document.body.appendChild(overlay);

    var links = overlay.querySelector("[data-links]");
    nav.querySelectorAll("a").forEach(function (anchor) {
      var clone = anchor.cloneNode(true);
      var inMenu = Boolean(anchor.closest(".site-dropdown-menu"));
      var active = anchor.classList.contains("is-active") ? " is-active" : "";
      clone.className = (inMenu ? "site-drawer-sublink" : "site-drawer-link") + active;
      links.appendChild(clone);
    });

    var book = header.querySelector('a[href="book.html"], a[data-path="booking"], a[data-path="book-your-trip"]');
    if (book && !links.querySelector('a[href="book.html"]')) {
      var bookLink = book.cloneNode(true);
      bookLink.className = "site-drawer-book" + (book.classList.contains("is-active") ? " is-active" : "");
      links.appendChild(bookLink);
    }

    function setOpen(open) {
      overlay.hidden = !open;
      button.setAttribute("aria-expanded", open ? "true" : "false");
      document.body.style.overflow = open ? "hidden" : "";
    }

    button.addEventListener("click", function () { setOpen(true); });
    overlay.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]") || event.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    desktop.addEventListener("change", function () {
      if (desktop.matches) setOpen(false);
    });
  }

  function setupPackageMenu() {
    var menu = document.querySelector(".site-dropdown");
    if (!menu) return;
    var toggle = menu.querySelector(".site-dropdown-toggle");
    var panel = menu.querySelector(".site-dropdown-menu");
    if (!toggle || !panel) return;
    var desktop = window.matchMedia("(min-width: 1024px)");
    var closeTimer = null;

    function setOpen(open) {
      if (closeTimer) {
        window.clearTimeout(closeTimer);
        closeTimer = null;
      }
      menu.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      panel.hidden = !open;
    }

    toggle.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(panel.hidden);
    });
    menu.addEventListener("mouseenter", function () {
      if (desktop.matches) setOpen(true);
    });
    menu.addEventListener("mouseleave", function () {
      if (!desktop.matches) return;
      closeTimer = window.setTimeout(function () { setOpen(false); }, 280);
    });
    document.addEventListener("click", function (event) {
      if (!menu.contains(event.target)) setOpen(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setOpen(false);
    });

    var category = new URLSearchParams(window.location.search).get("category");
    if (!category) return;
    menu.querySelectorAll(".site-dropdown-menu a").forEach(function (link) {
      if (link.getAttribute("href").indexOf("category=" + category) !== -1) {
        link.classList.add("is-active");
      }
    });
  }

  function activateFilter(selector, value) {
    if (!value) return;
    var button = document.querySelector(selector + '[data-filter="' + value + '"]');
    if (button) button.click();
  }

  function applyQueryState() {
    var params = new URLSearchParams(window.location.search);
    var file = pageFile();

    if (file === "packages.html") {
      activateFilter(".category-btn", params.get("category"));
    }
    if (file === "gallery.html") {
      activateFilter("#gallery-filter-tabs .filter-btn", params.get("filter"));
    }
    if (file === "updates.html") {
      activateFilter("#topic-filter-container .filter-btn", params.get("topic"));
    }
    if (file === "book.html") {
      applyBookingQuery(params);
    }

    if (window.location.hash) {
      window.setTimeout(function () {
        var target = document.querySelector(window.location.hash);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  function applyBookingQuery(params) {
    var packageValue = params.get("package");
    var safariPackages = ["bwindi_gorilla", "murchison_safari", "jinja_adventure", "custom_safari"];
    var track = params.get("track");
    if (!track && packageValue) {
      track = safariPackages.indexOf(packageValue) !== -1 ? "safari" : "pilgrimage";
    }
    if (params.get("intent") === "corporate") {
      track = "safari";
      packageValue = packageValue || "custom_safari";
    }
    if (track && typeof window.selectTrack === "function") window.selectTrack(track);
    if (packageValue) {
      var radio = document.querySelector('input[name="package_selection"][value="' + packageValue + '"]');
      if (radio) radio.checked = true;
    }
    var notes = document.getElementById("special_notes");
    var note = params.get("note");
    if (params.get("intent") === "corporate") {
      note = note || "Corporate / business travel inquiry.";
    }
    if (notes && note && !notes.value) notes.value = note;

    var plannerRaw = sessionStorage.getItem("labaika-planner");
    if (notes && plannerRaw && !notes.value) {
      try {
        var planner = JSON.parse(plannerRaw);
        var bits = [];
        if (planner.season) bits.push("Departure: " + planner.season);
        if (planner.travelers) bits.push("Travelers: " + planner.travelers);
        if (bits.length) notes.value = bits.join(". ") + ".";
      } catch (err) {
        sessionStorage.removeItem("labaika-planner");
      }
    }
  }

  function setupDestinationCards() {
    if (pageFile() !== "index.html") return;
    Object.keys(DESTINATIONS).forEach(function (title) {
      var headings = document.querySelectorAll("h3");
      headings.forEach(function (heading) {
        if (heading.textContent.replace(/\s+/g, " ").trim() !== title) return;
        var card = heading.closest(".group");
        if (!card || card.querySelector("a")) return;
        card.classList.add("cursor-pointer");
        card.setAttribute("role", "link");
        card.setAttribute("tabindex", "0");
        function go() { window.location.href = DESTINATIONS[title]; }
        card.addEventListener("click", go);
        card.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            go();
          }
        });
      });
    });
  }

  function setupTripPlanner() {
    var form = document.getElementById("tripPlannerForm");
    if (!form) return;
    form.addEventListener("submit", function () {
      var active = document.querySelector(".tab-btn.bg-forest-emerald-surface");
      if (active && active.id === "tab-btn-corporate") {
        window.location.href = "book.html?intent=corporate";
        return;
      }
      var destination = document.getElementById("destinationSelect");
      var key = destination ? destination.value : "mecca";
      var selects = form.querySelectorAll("select");
      sessionStorage.setItem("labaika-planner", JSON.stringify({
        destination: key,
        season: selects[1] ? selects[1].value : "",
        travelers: selects[2] ? selects[2].value : ""
      }));
      window.location.href = PLANNER_ROUTES[key] || "packages.html";
    });
  }

  function showFormSuccess(form, message) {
    var existing = form.parentElement.querySelector("[data-form-success]");
    if (!existing) {
      existing = document.createElement("div");
      existing.setAttribute("data-form-success", "");
      existing.className = "mt-4 rounded-xl bg-forest-emerald-light text-secondary p-4 font-body-md text-body-md";
      form.insertAdjacentElement("afterend", existing);
    }
    existing.textContent = message;
    form.reset();
  }

  function setupUmrahForm() {
    var form = document.getElementById("umrahLeadForm");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var name = document.getElementById("umrahFullName");
      var email = document.getElementById("umrahEmail");
      var phone = document.getElementById("umrahPhone");
      var ok = true;
      markInvalid(name, !fieldValue("umrahFullName"));
      markInvalid(email, !validEmail(fieldValue("umrahEmail")));
      markInvalid(phone, !validPhone(fieldValue("umrahPhone")));
      if (!fieldValue("umrahFullName") || !validEmail(fieldValue("umrahEmail")) || !validPhone(fieldValue("umrahPhone"))) ok = false;
      if (!ok) return;
      saveInquiry({
        type: "Umrah seat request",
        name: fieldValue("umrahFullName"),
        email: fieldValue("umrahEmail"),
        phone: fieldValue("umrahPhone")
      });
      showFormSuccess(form, "Jazakallah khair. Your Umrah inquiry is saved. A coordinator will follow up on WhatsApp and email.");
    });
  }

  function setupCustomTripForm() {
    var form = document.getElementById("customTripForm");
    if (!form) return;
    form.addEventListener("submit", function () {
      if (!form.checkValidity()) return;
      saveInquiry({
        type: "Custom itinerary",
        name: fieldValue("fullName"),
        email: fieldValue("emailAddr"),
        phone: fieldValue("phoneNum"),
        tripType: fieldValue("tripType"),
        travelDate: fieldValue("travelDate"),
        travelers: fieldValue("travelersCount"),
        notes: fieldValue("aspirations")
      });
    }, true);
  }

  function setupBookingForm() {
    var form = document.getElementById("labaika-booking-form");
    if (!form) return;
    ["client_fullname", "client_email", "client_phone"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.required = true;
    });
    var email = document.getElementById("client_email");
    if (email) email.type = "email";
    var phone = document.getElementById("client_phone");
    if (phone) phone.type = "tel";

    window.handleSubmitReservation = function () {
      var name = document.getElementById("client_fullname");
      var emailEl = document.getElementById("client_email");
      var phoneEl = document.getElementById("client_phone");
      markInvalid(name, !fieldValue("client_fullname"));
      markInvalid(emailEl, !validEmail(fieldValue("client_email")));
      markInvalid(phoneEl, !validPhone(fieldValue("client_phone")));
      if (!fieldValue("client_fullname") || !validEmail(fieldValue("client_email")) || !validPhone(fieldValue("client_phone"))) {
        var firstInvalid = form.querySelector("[aria-invalid='true']");
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      var selected = form.querySelector('input[name="package_selection"]:checked');
      var entry = {
        type: "Reservation",
        name: fieldValue("client_fullname"),
        email: fieldValue("client_email"),
        phone: fieldValue("client_phone"),
        package: selected ? selected.value : "",
        season: fieldValue("travel_season"),
        departure: fieldValue("departure_city"),
        adults: fieldValue("adults_count"),
        children: fieldValue("children_count"),
        room: fieldValue("room_preference"),
        office: fieldValue("office_consultation"),
        notes: fieldValue("special_notes")
      };
      saveInquiry(entry);

      var banner = document.getElementById("form-success-banner");
      if (banner) {
        banner.classList.remove("hidden");
        var summary = "Assalamu alaikum LABAIKA, I would like to reserve: " +
          [entry.name, entry.package, entry.season, entry.notes].filter(Boolean).join(" | ");
        if (!banner.querySelector("[data-wa]")) {
          var link = document.createElement("a");
          link.setAttribute("data-wa", "");
          link.className = "inline-flex mt-4 px-4 py-2 rounded-lg bg-forest-emerald-surface text-on-secondary font-label-lg text-label-lg";
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          link.textContent = "Send this inquiry on WhatsApp";
          banner.querySelector("div").appendChild(link);
        }
        banner.querySelector("[data-wa]").href = whatsAppUrl(summary);
        banner.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    };
  }

  function setupNewsletter() {
    var form = document.getElementById("newsletter-form");
    if (!form) return;
    form.addEventListener("submit", function () {
      var input = form.querySelector("input[type='email'], input");
      if (!input || !validEmail(input.value.trim())) return;
      saveInquiry({ type: "Newsletter", email: input.value.trim() });
    }, true);
  }

  function setupArticles() {
    if (!window.location.hash) return;
    var card = document.querySelector(window.location.hash + ".article-card, " + window.location.hash + " .line-clamp-3");
    document.querySelectorAll(".article-card .line-clamp-3, #lead-article .line-clamp-3").forEach(function (node) {
      if (card && (node === card || (card.contains && card.contains(node)) || node.closest(window.location.hash))) {
        node.classList.remove("line-clamp-3");
      }
    });
    if (window.location.hash.indexOf("article-") === 1 || window.location.hash === "#lead-article") {
      var target = document.querySelector(window.location.hash);
      if (!target) return;
      target.querySelectorAll(".line-clamp-3").forEach(function (node) {
        node.classList.remove("line-clamp-3");
      });
    }
  }

  function renderSavedInquiries() {
    if (pageFile() !== "book.html") return;
    var main = document.querySelector("main");
    if (!main) return;
    var box = document.getElementById("saved-inquiries");
    if (!box) {
      box = document.createElement("section");
      box.id = "saved-inquiries";
      box.className = "max-w-7xl mx-auto px-6 lg:px-12 pb-16";
      main.appendChild(box);
    }
    var items = readInquiries();
    if (!items.length) {
      box.innerHTML = "";
      return;
    }
    var rows = items.slice(0, 5).map(function (item) {
      var when = new Date(item.savedAt).toLocaleString();
      var detail = item.package || item.tripType || item.notes || item.email || "";
      return '<li class="py-3 border-b border-border-hairline"><p class="font-title-md text-title-md">' +
        escapeHtml(item.type || "Inquiry") + '</p><p class="font-body-sm text-body-sm text-on-surface-variant">' +
        escapeHtml([item.name, detail, when].filter(Boolean).join(" · ")) + "</p></li>";
    }).join("");
    box.innerHTML =
      '<div class="rounded-2xl bg-surface-container-lowest border border-border-hairline p-6">' +
      '<h2 class="font-headline-sm text-headline-sm">Inquiries saved on this device</h2>' +
      '<p class="font-body-sm text-body-sm text-on-surface-variant mt-1">These stay in your browser until you clear site data. Send one on WhatsApp to reach the Kampala desk.</p>' +
      "<ul class=\"mt-2\">" + rows + "</ul></div>";
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.textContent = "[id]{scroll-margin-top:6rem} #mobile-nav[hidden]{display:none}";
    document.head.appendChild(style);
  }

  function cleanText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function galleryCardInfo(card) {
    var img = card.querySelector("img");
    var title = cleanText((card.querySelector("h3, h4") || {}).textContent);
    var badges = [];
    var location = "";
    card.querySelectorAll(".absolute.top-4 span").forEach(function (span) {
      if (span.classList.contains("material-symbols-outlined")) return;
      if (span.querySelector(".material-symbols-outlined")) {
        location = cleanText(span.textContent.replace("pin_drop", ""));
        return;
      }
      var label = cleanText(span.textContent);
      if (label) badges.push(label);
    });
    var bottom = card.querySelector("[class*='bottom-']");
    if (bottom && !location) {
      var place = bottom.querySelector(".font-label-caps");
      if (place) location = cleanText(place.textContent);
    }
    var caption = "";
    card.querySelectorAll("p").forEach(function (paragraph) {
      if (/\bfont-body-/.test(paragraph.className)) caption = cleanText(paragraph.textContent);
    });
    return {
      src: img ? (img.currentSrc || img.src) : "",
      alt: img ? cleanText(img.getAttribute("alt") || img.getAttribute("data-alt") || title) : title,
      title: title || "Gallery photograph",
      location: location,
      badges: badges,
      caption: caption
    };
  }

  function visibleGalleryCards() {
    return Array.prototype.filter.call(
      document.querySelectorAll("#gallery-cards-grid .gallery-card"),
      function (card) { return card.style.display !== "none"; }
    );
  }

  function markGalleryCards() {
    document.querySelectorAll("#gallery-cards-grid .gallery-card").forEach(function (card) {
      var title = cleanText((card.querySelector("h3, h4") || {}).textContent);
      card.setAttribute("role", "button");
      card.tabIndex = 0;
      card.setAttribute("aria-label", "Open photograph: " + (title || "gallery image"));
    });
  }

  function setupHeroCarousel() {
    var hero = document.getElementById("home-hero");
    var track = document.getElementById("hero-track");
    if (!hero || !track) return;
    var slides = Array.prototype.slice.call(track.querySelectorAll(".hero-slide"));
    var phrases = hero.querySelectorAll(".hero-lead-phrase");
    var tabs = hero.querySelectorAll("[data-hero-index]");
    var video = document.getElementById("hero-ambient");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var index = 0;
    var timer = null;
    var dwell = 8000;
    var limit = 70;
    var restarting = false;

    function pillarAt(i) {
      return slides[i].getAttribute("data-pillar");
    }

    function restartVideo() {
      if (!video || restarting) return;
      restarting = true;
      var finish = function () { restarting = false; };
      try {
        video.currentTime = 0;
      } catch (err) {
        finish();
        return;
      }
      if (pillarAt(index) !== "religion" || reduced) {
        finish();
        return;
      }
      var play = video.play();
      if (play && play.then) play.then(finish, finish);
      else finish();
    }

    function playVideo(active) {
      if (!video) return;
      if (reduced || !active) {
        video.pause();
        return;
      }
      var play = video.play();
      if (play && play.catch) play.catch(function () {});
    }

    function place(animate) {
      track.style.transition = (!animate || reduced) ? "none" : "transform 0.9s cubic-bezier(0.65, 0, 0.35, 1)";
      track.style.transform = "translate3d(" + (-index * hero.clientWidth) + "px,0,0)";
    }

    function show(next, animate) {
      index = (next + slides.length) % slides.length;
      var pillar = pillarAt(index);
      place(animate !== false);
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      phrases.forEach(function (phrase) {
        var keys = phrase.getAttribute("data-pillar").split(/\s+/);
        phrase.classList.toggle("is-lit", keys.indexOf(pillar) !== -1);
      });
      tabs.forEach(function (tab) {
        var on = Number(tab.getAttribute("data-hero-index")) === index;
        tab.classList.toggle("is-active", on);
        tab.setAttribute("aria-selected", on ? "true" : "false");
      });
      playVideo(pillar === "religion");
    }

    function stop() {
      if (timer) window.clearInterval(timer);
      timer = null;
    }

    function start() {
      stop();
      if (reduced) return;
      timer = window.setInterval(function () { show(index + 1); }, dwell);
    }

    if (video) {
      video.addEventListener("timeupdate", function () {
        if (video.currentTime >= limit) restartVideo();
      });
      video.addEventListener("ended", restartVideo);
      if (reduced) {
        video.removeAttribute("autoplay");
        video.pause();
        video.hidden = true;
      }
    }

    window.addEventListener("resize", function () { place(false); });

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        show(Number(tab.getAttribute("data-hero-index")));
        start();
      });
    });

    hero.querySelectorAll("[data-hero-step]").forEach(function (button) {
      button.addEventListener("click", function () {
        show(index + Number(button.getAttribute("data-hero-step")));
        start();
      });
    });

    hero.addEventListener("keydown", function (event) {
      if (!event.target.closest || !event.target.closest("[data-hero-index]")) return;
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      event.preventDefault();
      show(index + (event.key === "ArrowRight" ? 1 : -1));
      if (tabs[index]) tabs[index].focus();
      start();
    });

    var hold = hero.querySelector(".hero-lead");
    if (hold) {
      hold.addEventListener("mouseenter", stop);
      hold.addEventListener("mouseleave", start);
    }
    hero.addEventListener("focusin", function (event) {
      if (event.target.closest && event.target.closest(".hero-controls, .hero-arrow")) stop();
    });
    hero.addEventListener("focusout", function (event) {
      if (!hero.contains(event.relatedTarget)) start();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stop();
        if (video) video.pause();
      } else {
        start();
        playVideo(pillarAt(index) === "religion");
      }
    });

    show(0, false);
    start();
  }

  function setupGalleryViewer() {
    var grid = document.getElementById("gallery-cards-grid");
    if (!grid || document.getElementById("gallery-viewer")) return;
    markGalleryCards();

    var root = document.createElement("div");
    root.className = "gallery-viewer";
    root.id = "gallery-viewer";
    root.hidden = true;
    root.innerHTML =
      '<div class="gallery-viewer-backdrop" data-close="true"></div>' +
      '<div class="gallery-viewer-dialog" role="dialog" aria-modal="true" aria-labelledby="gallery-viewer-title">' +
      '<button type="button" class="gallery-viewer-close" data-close="true" aria-label="Close photograph"><span class="material-symbols-outlined">close</span></button>' +
      '<button type="button" class="gallery-viewer-nav gallery-viewer-prev" data-step="-1" aria-label="Previous photograph"><span class="material-symbols-outlined">chevron_left</span></button>' +
      '<button type="button" class="gallery-viewer-nav gallery-viewer-next" data-step="1" aria-label="Next photograph"><span class="material-symbols-outlined">chevron_right</span></button>' +
      '<img class="gallery-viewer-photo" id="gallery-viewer-image" alt="">' +
      '<div class="gallery-viewer-copy">' +
      '<div class="gallery-viewer-badges" id="gallery-viewer-badges"></div>' +
      '<h2 id="gallery-viewer-title"></h2>' +
      '<p class="gallery-viewer-location" id="gallery-viewer-location" hidden></p>' +
      '<p class="gallery-viewer-caption" id="gallery-viewer-caption" hidden></p>' +
      "</div></div>";
    document.body.appendChild(root);

    var image = root.querySelector("#gallery-viewer-image");
    var title = root.querySelector("#gallery-viewer-title");
    var location = root.querySelector("#gallery-viewer-location");
    var caption = root.querySelector("#gallery-viewer-caption");
    var badges = root.querySelector("#gallery-viewer-badges");
    var index = 0;
    var lastFocus = null;

    function show(card) {
      var cards = visibleGalleryCards();
      index = Math.max(0, cards.indexOf(card));
      var info = galleryCardInfo(card);
      image.src = info.src;
      image.alt = info.alt || info.title;
      title.textContent = info.title;
      location.hidden = !info.location;
      location.textContent = "";
      if (info.location) {
        var pin = document.createElement("span");
        pin.className = "material-symbols-outlined";
        pin.textContent = "pin_drop";
        pin.setAttribute("aria-hidden", "true");
        location.appendChild(pin);
        location.appendChild(document.createTextNode(" " + info.location));
      }
      caption.hidden = !info.caption;
      caption.textContent = info.caption;
      badges.textContent = "";
      info.badges.forEach(function (label) {
        var chip = document.createElement("span");
        chip.textContent = label;
        badges.appendChild(chip);
      });
      root.querySelector(".gallery-viewer-prev").hidden = cards.length < 2;
      root.querySelector(".gallery-viewer-next").hidden = cards.length < 2;
      if (root.hidden) {
        lastFocus = document.activeElement;
        root.hidden = false;
        document.body.style.overflow = "hidden";
      }
      root.querySelector(".gallery-viewer-close").focus();
    }

    function close() {
      root.hidden = true;
      document.body.style.overflow = "";
      image.removeAttribute("src");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function step(direction) {
      var cards = visibleGalleryCards();
      if (!cards.length) return;
      index = (index + direction + cards.length) % cards.length;
      show(cards[index]);
    }

    grid.addEventListener("click", function (event) {
      var card = event.target.closest(".gallery-card");
      if (!card || !grid.contains(card)) return;
      show(card);
    });
    grid.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" && event.key !== " ") return;
      var card = event.target.closest(".gallery-card");
      if (!card || event.target !== card) return;
      event.preventDefault();
      show(card);
    });
    root.addEventListener("click", function (event) {
      if (event.target.closest("[data-close]")) close();
      var nav = event.target.closest("[data-step]");
      if (nav) step(Number(nav.getAttribute("data-step")));
    });
    document.addEventListener("keydown", function (event) {
      if (root.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    });

    window.LABAIKA_markGalleryCards = markGalleryCards;
  }

  document.addEventListener("DOMContentLoaded", function () {
    injectStyles();
    linkLogo();
    setupMobileNav();
    setupPackageMenu();
    setupDestinationCards();
    setupTripPlanner();
    setupUmrahForm();
    setupCustomTripForm();
    setupBookingForm();
    setupNewsletter();
    applyQueryState();
    setupArticles();
    setupGalleryViewer();
    setupHeroCarousel();
    renderSavedInquiries();
  });
})();
