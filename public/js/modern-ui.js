(function () {
  function initMobileNav() {
    const header = document.querySelector("header .header-inner");
    if (!header) return;

    let toggle = header.querySelector(".menu-toggle");
    let nav = document.getElementById("mobileNav");
    let overlay = document.getElementById("mobileOverlay");

    if (!toggle) {
      toggle = document.createElement("button");
      toggle.className = "menu-toggle";
      toggle.type = "button";
      toggle.textContent = "☰";
      header.querySelector(".header-actions")?.appendChild(toggle);
    }
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Open navigation");
    toggle.setAttribute("aria-expanded", "false");

    if (!nav) {
      nav = document.createElement("div");
      nav.className = "mobile-nav";
      nav.id = "mobileNav";
      document.body.appendChild(nav);
    }

    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "mobile-overlay";
      overlay.id = "mobileOverlay";
      document.body.appendChild(overlay);
    }

    if (!nav.dataset.modernBuilt) {
      nav.replaceChildren();
      const homeLink = header.querySelector(".mobile-home");
      if (homeLink) nav.appendChild(homeLink.cloneNode(true));
      document.querySelectorAll("header nav a").forEach((link) => {
        nav.appendChild(link.cloneNode(true));
      });

      const languageSwitch = header.querySelector(".lang-switch");
      if (languageSwitch) {
        const languageControls = languageSwitch.cloneNode(true);
        languageControls.querySelectorAll("[id]").forEach((element) => {
          element.removeAttribute("id");
        });
        languageControls.setAttribute("aria-label", "Choose language");
        nav.appendChild(languageControls);
      }

      const phone = document.createElement("a");
      phone.href = "tel:+441534499429";
      phone.textContent = "Call 01534 499429";
      nav.appendChild(phone);

      const quote = document.createElement("button");
      quote.className = "btn-primary";
      quote.type = "button";
      quote.textContent = header.querySelector("[data-i18n='freeQuote']")?.textContent || "Get a Free Quote";
      quote.setAttribute("data-i18n", "freeQuote");
      quote.addEventListener("click", () => {
        close();
        if (typeof window.openQuote === "function") window.openQuote();
      });
      nav.appendChild(quote);
      nav.dataset.modernBuilt = "true";
    }

    nav.setAttribute("aria-label", "Mobile navigation");
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-hidden", "true");
    nav.inert = true;
    toggle.setAttribute("aria-controls", nav.id);
    toggle.removeAttribute("onclick");
    overlay.removeAttribute("onclick");

    const open = () => {
      nav.inert = false;
      nav.classList.add("show");
      overlay.classList.add("show");
      document.body.classList.add("mobile-open");
      nav.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close navigation");
      toggle.textContent = "×";
      nav.querySelector("a, button")?.focus();
    };

    const close = (restoreFocus = false) => {
      nav.classList.remove("show");
      overlay.classList.remove("show");
      document.body.classList.remove("mobile-open");
      nav.setAttribute("aria-hidden", "true");
      nav.inert = true;
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open navigation");
      toggle.textContent = "☰";
      if (restoreFocus) toggle.focus();
    };

    toggle.addEventListener("click", () => {
      if (nav.classList.contains("show")) close();
      else open();
    });
    overlay.addEventListener("click", () => close(true));
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => close());
    });
    nav.querySelectorAll(".lang-switch button").forEach((button) => {
      button.addEventListener("click", close);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Tab" && nav.classList.contains("show")) {
        const focusable = nav.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) {
          event.preventDefault();
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      if (event.key !== "Escape") return;
      if (nav.classList.contains("show")) {
        close(true);
        return;
      }
      if (document.querySelector(".modal-overlay.show") && typeof window.closeQuote === "function") {
        window.closeQuote();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMobileNav, { once: true });
  } else {
    initMobileNav();
  }
})();
