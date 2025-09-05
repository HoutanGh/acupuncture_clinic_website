/* =====================================================================
   ACUPUNCTURE CLINIC WEBSITE - JAVASCRIPT FUNCTIONALITY
   =====================================================================
   This file contains all interactive features for the website:
   1. Contact Form (AJAX submission, validation, UI feedback)
   2. Location Gallery (image slideshow with navigation)
   3. Interactive Body Map (condition highlighting)
===================================================================== */

// Section: Contact Form — Handles submission, validation, loading state, and feedback

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  if (!form) return;

  // Initialise enhanced form features
  initializeFormEnhancements();

  // Create overlay for submission feedback
  const overlay = createFormOverlay();
  const msgBox = createMessageBox();
  overlay.appendChild(msgBox);

  // Position overlay relative to form
  form.style.position = "relative";
  form.parentNode.insertBefore(overlay, form);

  // Handle form submission
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    handleFormSubmission(form, overlay, msgBox);
  });

  /**
   * Create a full-form overlay used to display transient submission feedback.
   * - No conditions here; purely constructs a styled element for later use.
   * @returns {HTMLDivElement} The overlay element positioned over the form
   */
  function createFormOverlay() {
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(249,246,242,0.85)";
    overlay.style.display = "none";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 10;
    return overlay;
  }

  /**
   * Create the inner message box shown inside the overlay.
   * - No conditions here; visual container for success/error text.
   * @returns {HTMLDivElement} The message box container
   */
  function createMessageBox() {
    const msgBox = document.createElement("div");
    msgBox.className = "p-6 rounded-xl shadow text-center text-lg font-semibold";
    msgBox.style.background = "#b7c9a8"; // sage color
    msgBox.style.color = "#2d2d2d";
    return msgBox;
  }

  /**
   * Handle the actual form submission with fetch (AJAX-style).
   * Conditions:
   * - If a submit button exists, set a loading state (disabled + CSS class).
   * - On fetch resolve: if response.ok then show success, else show error.
   * - On fetch reject: show error.
   * @param {HTMLFormElement} form - The contact form element
   * @param {HTMLElement} overlay - The overlay to display feedback
   * @param {HTMLElement} msgBox - The message box inside overlay for text
   */
  function handleFormSubmission(form, overlay, msgBox) {
    const submitBtn = form.querySelector(".submit-btn");

    // Show loading state
    if (submitBtn) {
      submitBtn.classList.add("loading");
      submitBtn.disabled = true;
    }

    const formData = new FormData(form);
    fetch(form.action, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    })
      .then((response) => {
        hideLoadingState(submitBtn);

        if (response.ok) {
          form.reset();
          msgBox.textContent = "Thank you! Your message has been sent.";
          resetFormStyles();
        } else {
          msgBox.textContent = "Oops! There was a problem submitting your form.";
        }
        showFeedback(overlay);
      })
      .catch(() => {
        hideLoadingState(submitBtn);
        msgBox.textContent = "Oops! There was a problem submitting your form.";
        showFeedback(overlay);
      });
  }

  /**
   * Remove loading state from the submit button, if present.
   * Condition:
   * - Only acts when a submit button element was found.
   * @param {HTMLButtonElement|undefined|null} submitBtn
   */
  function hideLoadingState(submitBtn) {
    if (submitBtn) {
      submitBtn.classList.remove("loading");
      submitBtn.disabled = false;
    }
  }

  /**
   * Show feedback overlay and auto-hide after 3.5 seconds.
   * @param {HTMLElement} overlay - Overlay element to show/hide
   */
  function showFeedback(overlay) {
    overlay.style.display = "flex";
    setTimeout(() => {
      overlay.style.display = "none";
    }, 3500);
  }

  /**
   * Initialize form enhancement features (validation, focus/blur input effects).
   * - Attaches listeners to inputs to validate on focus, blur, and input.
   */
  function initializeFormEnhancements() {
    const inputs = form.querySelectorAll(".form-input");

    inputs.forEach((input) => {
      // Add focus and blur effects
      input.addEventListener("focus", function () {
        this.parentElement.classList.add("focused");
        validateField(this);
      });

      input.addEventListener("blur", function () {
        this.parentElement.classList.remove("focused");
        validateField(this);
      });

      // Real-time validation as user types
      input.addEventListener("input", function () {
        validateField(this);
      });
    });
  }

  /**
   * Validate an individual field and provide visual feedback via CSS classes.
   * Conditions:
   * - Required: if empty (and not focused), mark error.
   * - Email: when value present, must match basic email regex.
   * - Phone: when value present, must match basic phone regex (digits, spaces, +, (), -).
   * - Success: if a non-empty, valid value exists, mark success.
   * @param {HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement} field
   * @returns {boolean} True if valid, else false
   */
  function validateField(field) {
    // Remove previous validation classes
    field.classList.remove("error", "success");

    const value = field.value.trim();
    const isRequired = field.hasAttribute("required");

    // Check required fields
    if (isRequired && !value) {
      if (field !== document.activeElement) {
        // Don't show error while typing
        field.classList.add("error");
      }
      return false;
    }

    // Email validation
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        field.classList.add("error");
        return false;
      }
    }

    // Phone validation (basic format check)
    if (field.type === "tel" && value) {
      const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        field.classList.add("error");
        return false;
      }
    }

    // Show success state for valid fields
    if (value) {
      field.classList.add("success");
    }

    return true;
  }

  /**
   * Reset all form styling after successful submission (clears error/success/focus states).
   */
  function resetFormStyles() {
    const inputs = form.querySelectorAll(".form-input");
    inputs.forEach((input) => {
      input.classList.remove("error", "success");
      input.parentElement.classList.remove("focused");
    });
  }
});

// Section: Theme Toggle — light ↔ night (soft dark mode)
document.addEventListener("DOMContentLoaded", function () {
  const toggles = Array.from(document.querySelectorAll('[data-theme-toggle]'));
  if (!toggles.length) return;

  const docEl = document.documentElement;

  function isNight() {
    return docEl.classList.contains('night');
  }

  function applyTheme(theme) {
    const night = theme === 'night';
    docEl.classList.toggle('night', night);
    try { localStorage.setItem('theme', night ? 'night' : 'light'); } catch (e) {}
    updateButtons(night);
  }

  function updateButtons(night) {
    toggles.forEach(btn => {
      btn.setAttribute('aria-pressed', night ? 'true' : 'false');
      const moon = btn.querySelector('.fa-moon');
      const sun = btn.querySelector('.fa-sun');
      if (moon && sun) {
        if (night) {
          moon.classList.add('hidden');
          sun.classList.remove('hidden');
        } else {
          sun.classList.add('hidden');
          moon.classList.remove('hidden');
        }
      }
    });
  }

  // Initialize from current state (set early in head)
  updateButtons(isNight());

  // Wire events
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(isNight() ? 'light' : 'night');
    });
  });
});

// Section: Mobile Navigation — Hamburger toggle + responsive state management
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.getElementById("mobile-menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (!toggle || !menu) return;

  const icon = toggle.querySelector("i");

  /**
   * Set the mobile menu open/closed state and related UI/accessibility.
   * Conditions:
   * - Toggles menu visibility (hidden class) based on `open` flag.
   * - Updates aria-expanded to reflect state.
   * - Swaps hamburger vs close icon depending on `open`.
   * - Leaves page scrolling enabled (no body scroll lock).
   * @param {boolean} open
   */
  function setMenuState(open) {
    // Show/hide menu
    menu.classList.toggle("hidden", !open);
    // Accessibility state
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    // Swap hamburger/close icon (Font Awesome 6)
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-xmark", open);
    }
    // Keep body scroll enabled so users can scroll the page while menu is open
  }

  // Initialize correct state depending on viewport
  const mql = window.matchMedia("(min-width: 768px)");
  /**
   * Normalize UI when crossing the md breakpoint (>=768px).
   * Conditions:
   * - When matches (md+): menu is always visible, reset icon/body state.
   * - When not matched (mobile): menu starts hidden, icon set to hamburger.
   * @param {MediaQueryListEvent|MediaQueryList} e
   */
  function handleBreakpoint(e) {
    if (e.matches) {
      // md+ view: ensure menu is visible and UI is reset
      menu.classList.remove("hidden");
      toggle.setAttribute("aria-expanded", "false");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-xmark");
      }
      // No scroll lock on body; nothing to reset here
    } else {
      // mobile view: start hidden
      menu.classList.add("hidden");
      toggle.setAttribute("aria-expanded", "false");
      if (icon) {
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-xmark");
      }
    }
  }
  handleBreakpoint(mql);
  if (mql.addEventListener) {
    mql.addEventListener("change", handleBreakpoint);
  } else if (mql.addListener) {
    // Safari support
    mql.addListener(handleBreakpoint);
  }

  // Toggle on click
  toggle.addEventListener("click", function () {
    const willOpen = menu.classList.contains("hidden");
    setMenuState(willOpen);
  });

  // Close on nav link click (for in-page anchors)
  menu.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", function () {
      setMenuState(false);
    });
  });

  // Close on Escape
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setMenuState(false);
  });
});

// Section: Dev Overflow Auditor — outlines elements wider than viewport when `?debug=overflow`
document.addEventListener("DOMContentLoaded", function () {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("debug") || params.get("debug") !== "overflow") return;

    const docWidth = document.documentElement.clientWidth;
    let offenders = 0;
    document.querySelectorAll("*").forEach((el) => {
      if (el.scrollWidth > docWidth) {
        el.style.outline = "2px solid red";
        offenders++;
      }
    });
    // eslint-disable-next-line no-console
    console.log(`[Overflow Auditor] Potential offenders outlined in red: ${offenders}`);
  } catch (e) {
    // no-op
  }
});

// Section: Timeline Tooltips — tap/keyboard accessible open/close behavior

document.addEventListener("DOMContentLoaded", function () {
  const items = document.querySelectorAll(".timeline-item");
  if (!items.length) return;

  /** Close all open tooltip items. */
  function closeAll() {
    items.forEach((i) => i.classList.remove("open"));
  }

  items.forEach((item) => {
    // Open/close on click (mobile/touch-friendly)
    item.addEventListener("click", function (e) {
      // Allow clicks inside tooltip to just close others
      const isOpen = item.classList.contains("open");
      closeAll();
      if (!isOpen) item.classList.add("open");
      e.stopPropagation();
    });

    // Keyboard accessibility
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const isOpen = item.classList.contains("open");
        closeAll();
        if (!isOpen) item.classList.add("open");
      }
      if (e.key === "Escape") {
        item.classList.remove("open");
      }
    });
  });

  // Clicking anywhere else closes tooltips
  document.addEventListener("click", function () {
    closeAll();
  });
});

// Section: Location Gallery — image slideshow with arrows, dots, keyboard, auto-advance

document.addEventListener("DOMContentLoaded", function () {
  const slides = document.querySelectorAll(".gallery-slide");
  const dots = document.querySelectorAll(".gallery-dot");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");

  // Exit if gallery doesn't exist on this page
  if (!slides.length) return;

  let currentSlide = 0;

  /**
   * Show a specific slide and update dot indicators.
   * Conditions:
   * - All slides are hidden, then the indexed slide is shown.
   * - If dot exists at index, mark it active; others inactive.
   * @param {number} index
   */
  function showSlide(index) {
    // Hide all slides
    slides.forEach((slide) => {
      slide.classList.remove("opacity-100");
      slide.classList.add("opacity-0");
    });

    // Reset all dots to inactive state
    dots.forEach((dot) => {
      dot.classList.remove("bg-white");
      dot.classList.add("bg-white", "bg-opacity-50");
    });

    // Show current slide and activate corresponding dot
    slides[index].classList.remove("opacity-0");
    slides[index].classList.add("opacity-100");

    if (dots[index]) {
      dots[index].classList.remove("bg-opacity-50");
      dots[index].classList.add("bg-white");
    }

    currentSlide = index;
  }

  /**
   * Navigate to next slide (wraps at end).
   */
  function nextSlide() {
    const next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }

  /**
   * Navigate to previous slide (wraps at start).
   */
  function prevSlide() {
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(prev);
  }

  // Set up navigation button event listeners
  if (nextBtn) {
    nextBtn.addEventListener("click", nextSlide);
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", prevSlide);
  }

  // Set up dot navigation
  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => showSlide(index));
  });

  // Auto-advance slides every 5 seconds
  setInterval(nextSlide, 5000);

  // Enable keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") prevSlide();
    if (e.key === "ArrowRight") nextSlide();
  });
});

// Section: Interactive Body Map — clickable body points + linked condition panels

document.addEventListener("DOMContentLoaded", function () {
  const points = document.querySelectorAll(".condition-point");
  const infoPanels = document.querySelectorAll(".condition-info");
  const figure = document.getElementById("conditions-figure");

  // Exit if interactive body map doesn't exist
  if (!points.length) return;

  // Mobile overlay for condition details (diagram-only view)
  let overlay;
  let hideOverlayTimeout = null;
  if (figure) {
    overlay = document.createElement("div");
    overlay.className = "condition-overlay";
    overlay.innerHTML = '<div class="title"></div><div class="desc"></div>';
    figure.appendChild(overlay);

    // Keep overlay open while hovered; hide shortly after leaving
    overlay.addEventListener("mouseenter", () => {
      if (hideOverlayTimeout) {
        clearTimeout(hideOverlayTimeout);
        hideOverlayTimeout = null;
      }
    });
    overlay.addEventListener("mouseleave", () => {
      if (window.innerWidth < 1024) {
        hideOverlayTimeout = setTimeout(() => hideConditionOverlay(), 120);
      }
    });
  }

  /**
   * Highlight a specific condition by id: activates body point and info panel.
   * Conditions:
   * - On small screens (<768px), scrolls info panel into view.
   * - Only adds active classes when elements exist.
   * @param {string} conditionId
   */
  function highlightCondition(conditionId) {
    // Remove active state from all elements
    infoPanels.forEach((panel) => panel.classList.remove("active"));
    points.forEach((point) => point.classList.remove("active"));

    // Activate the selected condition
    const panelToHighlight = document.getElementById(`condition-${conditionId}`);
    const pointToHighlight = document.querySelector(`[data-condition="${conditionId}"]`);

    if (panelToHighlight) {
      panelToHighlight.classList.add("active");
      // Scroll to panel on mobile devices
      if (window.innerWidth < 768) {
        panelToHighlight.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    if (pointToHighlight) {
      pointToHighlight.classList.add("active");
    }
  }

  /**
   * Clear all condition highlights from both points and panels.
   */
  function clearConditionHighlight() {
    infoPanels.forEach((panel) => panel.classList.remove("active"));
    points.forEach((p) => {
      p.classList.remove("active");
      // Also reset any inline hover styles applied
      p.style.transform = "";
      p.style.boxShadow = "";
    });
  }

  /**
   * Add hover highlight effect to a condition card when hovering a point.
   * @param {string} conditionId
   */
  function addHoverHighlight(conditionId) {
    const panelToHighlight = document.getElementById(`condition-${conditionId}`);
    if (panelToHighlight && !panelToHighlight.classList.contains("active")) {
      panelToHighlight.classList.add("hovered");
    }
  }

  /**
   * Remove hover highlight effect from a condition card.
   * @param {string} conditionId
   */
  function removeHoverHighlight(conditionId) {
    const panelToHighlight = document.getElementById(`condition-${conditionId}`);
    if (panelToHighlight && !panelToHighlight.classList.contains("active")) {
      panelToHighlight.classList.remove("hovered");
    }
  }

  // Set up body point interactions (click highlights across views)
  points.forEach((point) => {
    const condition = point.dataset.condition;
    // Hover effects for points
    point.addEventListener("mouseenter", () => {
      addHoverHighlight(condition);
      if (!point.classList.contains("active")) {
        point.style.transform = "translate(-50%, -50%) scale(1.15)";
        point.style.boxShadow =
          "0 0 0 6px rgba(201, 122, 83, 0.3), 0 0 0 12px rgba(201, 122, 83, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)";
      }
      // On mobile and medium widths, show overlay with details
      if (window.innerWidth < 1024) {
        if (hideOverlayTimeout) {
          clearTimeout(hideOverlayTimeout);
          hideOverlayTimeout = null;
        }
        showConditionOverlay(condition, point);
      }
    });
    point.addEventListener("mouseleave", () => {
      removeHoverHighlight(condition);
      if (!point.classList.contains("active")) {
        point.style.transform = "";
        point.style.boxShadow = "";
      }
      // Fade out overlay after a short delay when leaving the point (mobile/medium widths)
      if (window.innerWidth < 1024) {
        hideOverlayTimeout = setTimeout(() => hideConditionOverlay(), 120);
      }
    });

    // Touch/click support for mobile
    point.addEventListener(
      "touchstart",
      (e) => {
        if (window.innerWidth < 768) {
          e.preventDefault();
          const alreadyActive = point.classList.contains("active");
          if (alreadyActive) {
            // Toggle off: clear highlight and hide overlay
            clearConditionHighlight();
            hideConditionOverlay();
            return;
          }
          showConditionOverlay(condition, point);
          highlightCondition(condition);
        }
      },
      { passive: false },
    );

    point.addEventListener("click", (e) => {
      e.preventDefault();
      const alreadyActive = point.classList.contains("active");
      if (window.innerWidth < 768) {
        if (alreadyActive) {
          // Mobile: toggle off on second tap
          clearConditionHighlight();
          hideConditionOverlay();
          return;
        }
        showConditionOverlay(condition, point);
        highlightCondition(condition);
      }
      // Desktop/tablet (>=1024px): no selection state; hover-only behavior
    });
  });

  // Set up info panel interactions (no click functionality)
  infoPanels.forEach((panel) => {
    const condition = panel.id.replace("condition-", "");
    // Hover effects for panels
    panel.addEventListener("mouseenter", () => {
      const pointToHighlight = document.querySelector(`[data-condition="${condition}"]`);
      if (pointToHighlight && !pointToHighlight.classList.contains("active")) {
        pointToHighlight.style.transform = "translate(-50%, -50%) scale(1.15)";
        pointToHighlight.style.boxShadow =
          "0 0 0 6px rgba(201, 122, 83, 0.3), 0 0 0 12px rgba(201, 122, 83, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)";
      }
    });
    panel.addEventListener("mouseleave", () => {
      const pointToHighlight = document.querySelector(`[data-condition="${condition}"]`);
      if (pointToHighlight && !pointToHighlight.classList.contains("active")) {
        pointToHighlight.style.transform = "";
        pointToHighlight.style.boxShadow = "";
      }
    });
  });

  // Hide overlay if leaving the figure or resizing to desktop
  if (figure) {
    figure.addEventListener("mouseleave", () => {
      if (window.innerWidth < 1024) hideConditionOverlay();
    });
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1024) {
      hideConditionOverlay();
      clearConditionHighlight(); // ensure no selected state persists on desktop
    }
  });

  // Tap outside to close overlay on mobile
  document.addEventListener("click", (e) => {
    if (window.innerWidth >= 1024) return;
    const t = e.target;
    const isPoint = t instanceof Element && t.closest(".condition-point");
    const isOverlay = t instanceof Element && t.closest(".condition-overlay");
    if (!isPoint && !isOverlay) hideConditionOverlay();
  });

  // Helper: show translucent overlay near a point (mobile)
  /**
   * Show a floating overlay (mobile/tablet) near the tapped point, containing
   * the condition title and short description from the related card.
   * Conditions:
   * - Returns early if overlay is not present.
   * - Horizontal position is clamped to stay within the figure container.
   * - If not enough room above the point, positions overlay below.
   * @param {string} conditionId
   * @param {HTMLElement} anchorEl - The point element used for positioning
   */
  function showConditionOverlay(conditionId, anchorEl) {
    if (!overlay) return;
    const panel = document.getElementById(`condition-${conditionId}`);
    const titleEl = overlay.querySelector(".title");
    const descEl = overlay.querySelector(".desc");
    const title = panel ? panel.querySelector("h3")?.textContent || "" : "";
    const desc = panel ? panel.querySelector("p")?.textContent || "" : "";
    titleEl.textContent = title || "Condition";
    descEl.textContent = desc || "";

    // Position relative to the figure and the anchor point
    const figRect = figure.getBoundingClientRect();
    const ptRect = anchorEl.getBoundingClientRect();
    const centerX = ptRect.left + ptRect.width / 2 - figRect.left;
    // Pre-position to measure size
    overlay.style.left = "50%";
    overlay.style.top = "0px";
    const overlayH = overlay.offsetHeight;
    const overlayHalfW = overlay.offsetWidth / 2;
    const gap = 12; // space between point and overlay
    // Default above point without covering it
    let top = ptRect.top - figRect.top - overlayH - gap;

    // Clamp X so overlay stays within figure bounds
    const padding = 8;
    let clampedX = centerX;
    if (clampedX - overlayHalfW < padding) clampedX = overlayHalfW + padding;
    if (clampedX + overlayHalfW > figure.clientWidth - padding) {
      clampedX = figure.clientWidth - overlayHalfW - padding;
    }
    overlay.style.left = `${clampedX}px`;

    // If not enough space above, place below the point
    if (top < padding) {
      top = ptRect.bottom - figRect.top + gap;
    }
    overlay.style.top = `${top}px`;

    overlay.classList.add("visible");
  }

  /** Hide the floating overlay if present. */
  function hideConditionOverlay() {
    if (!overlay) return;
    overlay.classList.remove("visible");
  }
});

// Section: About Acupuncture Tabs — card tabs linked to content drawer

document.addEventListener("DOMContentLoaded", function () {
  // About Acupuncture: mobile horizontal slideshow + linked content panel
  const aboutSection = document.querySelector("#about-acupuncture");
  if (!aboutSection) return;

  const list = aboutSection.querySelector("#about-cards");
  const tabButtons = aboutSection.querySelectorAll('[role="tab"][data-panel]');
  const contentBlocks = aboutSection.querySelectorAll("#about-panel .about-content");

  if (!list || !tabButtons.length || !contentBlocks.length) return;

  // Initialize tabs styles and state
  /**
   * Mark one tab button active and show its matching content panel.
   * Conditions:
   * - Updates aria-selected and CSS classes for active/inactive states.
   * - Toggles .hidden/.block on content blocks to switch panels.
   * @param {HTMLElement} btn - The tab button element
   */
  function setActive(btn) {
    const target = btn.getAttribute("data-panel");
    tabButtons.forEach((b) => {
      const active = b === btn;
      const title = b.querySelector("h3");
      b.setAttribute("aria-selected", active ? "true" : "false");
      b.classList.remove(
        "border-orange-500",
        "border-gray-200",
        "border-orange-500/50",
        "bg-white",
        "bg-teal-50/30",
        "bg-orange-50/30",
        "hover:border-orange-500/50",
      );
      if (title)
        title.classList.remove(
          "text-gray-600",
          "text-gray-800",
          "text-teal-600",
          "text-orange-700",
          "text-teal-700",
        );
      if (active) {
        b.classList.add("border-orange-500", "bg-white");
        if (title) title.classList.add("text-gray-600");
      } else {
        b.classList.add("border-gray-200", "bg-white", "hover:border-orange-500/50");
        if (title) title.classList.add("text-gray-600");
      }
    });
    // Swap content visibility
    contentBlocks.forEach((el) => {
      const match = el.getAttribute("data-content") === target;
      el.classList.toggle("hidden", !match);
      el.classList.toggle("block", match);
    });
  }

  // Initial normalize
  setActive(aboutSection.querySelector('[role="tab"][aria-selected="true"]') || tabButtons[0]);

  // Click to activate + center on mobile
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn);
      // Center clicked card in the horizontal list on small screens
      btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  });

  // On horizontal scroll, activate the card closest to center (mobile)
  let scrollTimer;
  /**
   * Debounced updater: find the card closest to the horizontal center of the
   * scroll container and activate it. Improves mobile UX.
   */
  function updateActiveFromScroll() {
    const center = list.scrollLeft + list.clientWidth / 2;
    let best = { btn: null, dist: Infinity };
    tabButtons.forEach((b) => {
      const childCenter = b.offsetLeft + b.offsetWidth / 2;
      const d = Math.abs(childCenter - center);
      if (d < best.dist) best = { btn: b, dist: d };
    });
    if (best.btn) setActive(best.btn);
  }
  list.addEventListener(
    "scroll",
    () => {
      // Debounce to avoid thrashing while scrolling
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateActiveFromScroll, 80);
    },
    { passive: true },
  );
});
