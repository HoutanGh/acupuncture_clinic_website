/* =====================================================================
   ACUPUNCTURE CLINIC WEBSITE - JAVASCRIPT FUNCTIONALITY
   =====================================================================
   This file contains all interactive features for the website:
   1. Contact Form (AJAX submission, validation, UI feedback)
   2. Location Gallery (image slideshow with navigation)
   3. Interactive Body Map (condition highlighting)
===================================================================== */

/* =====================================================================
   1. CONTACT FORM FUNCTIONALITY
   =====================================================================
   Handles form submission, validation, loading states, and user feedback
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (!form) return;

    // Initialize enhanced form features
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
     * Create the overlay for form submission feedback
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
     * Create the message box for form feedback
     */
    function createMessageBox() {
        const msgBox = document.createElement("div");
        msgBox.className = "p-6 rounded-xl shadow text-center text-lg font-semibold";
        msgBox.style.background = "#b7c9a8"; // sage color
        msgBox.style.color = "#2d2d2d";
        return msgBox;
    }

    /**
     * Handle the actual form submission with AJAX
     */
    function handleFormSubmission(form, overlay, msgBox) {
        const submitBtn = form.querySelector('.submit-btn');
        
        // Show loading state
        if (submitBtn) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
        }
        
        const formData = new FormData(form);
        fetch(form.action, {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
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
     * Remove loading state from submit button
     */
    function hideLoadingState(submitBtn) {
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    }

    /**
     * Show feedback overlay and auto-hide after 3.5 seconds
     */
    function showFeedback(overlay) {
        overlay.style.display = "flex";
        setTimeout(() => { overlay.style.display = "none"; }, 3500);
    }

    /**
     * Initialize form enhancement features (validation, focus effects)
     */
    function initializeFormEnhancements() {
        const inputs = form.querySelectorAll('.form-input');
        
        inputs.forEach(input => {
            // Add focus and blur effects
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
                validateField(this);
            });
            
            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                validateField(this);
            });
            
            // Real-time validation as user types
            input.addEventListener('input', function() {
                validateField(this);
            });
        });
    }
    
    /**
     * Validate individual form field and provide visual feedback
     */
    function validateField(field) {
        // Remove previous validation classes
        field.classList.remove('error', 'success');
        
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        
        // Check required fields
        if (isRequired && !value) {
            if (field !== document.activeElement) { // Don't show error while typing
                field.classList.add('error');
            }
            return false;
        }
        
        // Email validation
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                field.classList.add('error');
                return false;
            }
        }
        
        // Phone validation (basic format check)
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                field.classList.add('error');
                return false;
            }
        }
        
        // Show success state for valid fields
        if (value) {
            field.classList.add('success');
        }
        
        return true;
    }
    
    /**
     * Reset all form styling after successful submission
     */
    function resetFormStyles() {
        const inputs = form.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.classList.remove('error', 'success');
            input.parentElement.classList.remove('focused');
        });
    }
});

/* =====================================================================
   NAVIGATION: Mobile menu toggle
   - Toggles the hamburger menu on small screens
   - Updates aria-expanded and swaps the icon
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mobile-menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  const icon = toggle.querySelector('i');

  function setMenuState(open) {
    // Show/hide menu
    menu.classList.toggle('hidden', !open);
    // Accessibility state
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    // Swap hamburger/close icon (Font Awesome 6)
    if (icon) {
      icon.classList.toggle('fa-bars', !open);
      icon.classList.toggle('fa-xmark', open);
    }
    // Prevent background scroll when open on mobile
    document.body.classList.toggle('overflow-hidden', open);
  }

  // Initialize correct state depending on viewport
  const mql = window.matchMedia('(min-width: 768px)');
  function handleBreakpoint(e) {
    if (e.matches) {
      // md+ view: ensure menu is visible and UI is reset
      menu.classList.remove('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
      document.body.classList.remove('overflow-hidden');
    } else {
      // mobile view: start hidden
      menu.classList.add('hidden');
      toggle.setAttribute('aria-expanded', 'false');
      if (icon) { icon.classList.add('fa-bars'); icon.classList.remove('fa-xmark'); }
    }
  }
  handleBreakpoint(mql);
  if (mql.addEventListener) {
    mql.addEventListener('change', handleBreakpoint);
  } else if (mql.addListener) {
    // Safari support
    mql.addListener(handleBreakpoint);
  }

  // Toggle on click
  toggle.addEventListener('click', function () {
    const willOpen = menu.classList.contains('hidden');
    setMenuState(willOpen);
  });

  // Close on nav link click (for in-page anchors)
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', function () { setMenuState(false); });
  });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenuState(false);
  });
});

/* =====================================================================
   DEV: OVERFLOW AUDITOR (runs with ?debug=overflow)
   Highlights elements wider than the viewport for quick auditing
===================================================================== */
document.addEventListener('DOMContentLoaded', function () {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has('debug') || params.get('debug') !== 'overflow') return;

    const docWidth = document.documentElement.clientWidth;
    let offenders = 0;
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollWidth > docWidth) {
        el.style.outline = '2px solid red';
        offenders++;
      }
    });
    // eslint-disable-next-line no-console
    console.log(`[Overflow Auditor] Potential offenders outlined in red: ${offenders}`);
  } catch (e) {
    // no-op
  }
});

/* =====================================================================
   5. TIMELINE (Tradition) – mobile tap-to-open tooltips
   - Makes the timeline tooltips accessible on touch devices
===================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  const items = document.querySelectorAll('.timeline-item');
  if (!items.length) return;

  function closeAll() {
    items.forEach(i => i.classList.remove('open'));
  }

  items.forEach(item => {
    // Open/close on click (mobile/touch-friendly)
    item.addEventListener('click', function (e) {
      // Allow clicks inside tooltip to just close others
      const isOpen = item.classList.contains('open');
      closeAll();
      if (!isOpen) item.classList.add('open');
      e.stopPropagation();
    });

    // Keyboard accessibility
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const isOpen = item.classList.contains('open');
        closeAll();
        if (!isOpen) item.classList.add('open');
      }
      if (e.key === 'Escape') {
        item.classList.remove('open');
      }
    });
  });

  // Clicking anywhere else closes tooltips
  document.addEventListener('click', function () { closeAll(); });
});

/* =====================================================================
   2. LOCATION GALLERY FUNCTIONALITY
   =====================================================================
   Handles the image slideshow in the location section with navigation
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dot');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    
    // Exit if gallery doesn't exist on this page
    if (!slides.length) return;

    let currentSlide = 0;

    /**
     * Show specific slide and update navigation dots
     */
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('opacity-100');
            slide.classList.add('opacity-0');
        });
        
        // Reset all dots to inactive state
        dots.forEach(dot => {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white', 'bg-opacity-50');
        });
        
        // Show current slide and activate corresponding dot
        slides[index].classList.remove('opacity-0');
        slides[index].classList.add('opacity-100');
        
        if (dots[index]) {
            dots[index].classList.remove('bg-opacity-50');
            dots[index].classList.add('bg-white');
        }
        
        currentSlide = index;
    }

    /**
     * Navigate to next slide (with wraparound)
     */
    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    /**
     * Navigate to previous slide (with wraparound)
     */
    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Set up navigation button event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Set up dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance slides every 5 seconds
    setInterval(nextSlide, 5000);

    // Enable keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});

/* =====================================================================
   3. INTERACTIVE BODY MAP FOR CONDITIONS
   =====================================================================
   Handles clickable body points and condition information panels
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const points = document.querySelectorAll('.condition-point');
    const infoPanels = document.querySelectorAll('.condition-info');
    const figure = document.getElementById('conditions-figure');

    // Exit if interactive body map doesn't exist
    if (!points.length) return;

    // Mobile overlay for condition details (diagram-only view)
    let overlay;
    let hideOverlayTimeout = null;
    if (figure) {
        overlay = document.createElement('div');
        overlay.className = 'condition-overlay';
        overlay.innerHTML = '<div class="title"></div><div class="desc"></div>';
        figure.appendChild(overlay);

        // Keep overlay open while hovered; hide shortly after leaving
        overlay.addEventListener('mouseenter', () => {
            if (hideOverlayTimeout) {
                clearTimeout(hideOverlayTimeout);
                hideOverlayTimeout = null;
            }
        });
        overlay.addEventListener('mouseleave', () => {
            if (window.innerWidth < 1024) {
                hideOverlayTimeout = setTimeout(() => hideConditionOverlay(), 120);
            }
        });
    }

    /**
     * Highlight a specific condition (both point and info panel)
     */
    function highlightCondition(conditionId) {
        // Remove active state from all elements
        infoPanels.forEach(panel => panel.classList.remove('active'));
        points.forEach(point => point.classList.remove('active'));

        // Activate the selected condition
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        const pointToHighlight = document.querySelector(`[data-condition="${conditionId}"]`);

        if (panelToHighlight) {
            panelToHighlight.classList.add('active');
            // Scroll to panel on mobile devices
            if (window.innerWidth < 1024) {
                panelToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        if (pointToHighlight) {
            pointToHighlight.classList.add('active');
        }
    }

    /**
     * Add hover highlight effect to condition info panel
     */
    function addHoverHighlight(conditionId) {
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        if (panelToHighlight && !panelToHighlight.classList.contains('active')) {
            // Apply the same CSS classes as the card's built-in hover effect
            panelToHighlight.classList.add('border-orange-500/60', 'shadow-lg', 'bg-sage-50/30', '-translate-y-1');
        }
    }

    /**
     * Remove hover highlight effect from condition info panel
     */
    function removeHoverHighlight(conditionId) {
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        if (panelToHighlight && !panelToHighlight.classList.contains('active')) {
            // Remove the CSS classes to return to normal state
            panelToHighlight.classList.remove('border-orange-500/60', 'shadow-lg', 'bg-sage-50/30', '-translate-y-1');
        }
    }

    // Set up body point interactions (click highlights across views)
    points.forEach(point => {
        const condition = point.dataset.condition;
        // Hover effects for points
        point.addEventListener('mouseenter', () => {
            addHoverHighlight(condition);
            if (!point.classList.contains('active')) {
                point.style.transform = 'translate(-50%, -50%) scale(1.15)';
                point.style.boxShadow = '0 0 0 6px rgba(201, 122, 83, 0.3), 0 0 0 12px rgba(201, 122, 83, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)';
            }
            // On mobile widths, show overlay with details
            if (window.innerWidth < 1024) {
                if (hideOverlayTimeout) {
                    clearTimeout(hideOverlayTimeout);
                    hideOverlayTimeout = null;
                }
                showConditionOverlay(condition, point);
            }
        });
        point.addEventListener('mouseleave', () => {
            removeHoverHighlight(condition);
            if (!point.classList.contains('active')) {
                point.style.transform = '';
                point.style.boxShadow = '';
            }
            // Fade out overlay after a short delay when leaving the point (mobile widths)
            if (window.innerWidth < 1024) {
                hideOverlayTimeout = setTimeout(() => hideConditionOverlay(), 120);
            }
        });

        // Touch/click support for mobile
        point.addEventListener('touchstart', (e) => {
            if (window.innerWidth < 1024) {
                e.preventDefault();
                showConditionOverlay(condition, point);
                highlightCondition(condition);
            }
        }, { passive: false });

        point.addEventListener('click', (e) => {
            e.preventDefault();
            if (window.innerWidth < 1024) {
                showConditionOverlay(condition, point);
            }
            // Always sync highlight so other views reflect selection
            highlightCondition(condition);
        });
    });

    // Set up info panel interactions (no click functionality)
    infoPanels.forEach(panel => {
        const condition = panel.id.replace('condition-', '');
        // Hover effects for panels
        panel.addEventListener('mouseenter', () => {
            const pointToHighlight = document.querySelector(`[data-condition="${condition}"]`);
            if (pointToHighlight && !pointToHighlight.classList.contains('active')) {
                pointToHighlight.style.transform = 'translate(-50%, -50%) scale(1.15)';
                pointToHighlight.style.boxShadow = '0 0 0 6px rgba(201, 122, 83, 0.3), 0 0 0 12px rgba(201, 122, 83, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)';
            }
        });
        panel.addEventListener('mouseleave', () => {
            const pointToHighlight = document.querySelector(`[data-condition="${condition}"]`);
            if (pointToHighlight && !pointToHighlight.classList.contains('active')) {
                pointToHighlight.style.transform = '';
                pointToHighlight.style.boxShadow = '';
            }
        });
    });

    // Hide overlay if leaving the figure or resizing to desktop
    if (figure) {
        figure.addEventListener('mouseleave', () => {
            if (window.innerWidth < 1024) hideConditionOverlay();
        });
    }

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) hideConditionOverlay();
    });

    // Tap outside to close overlay on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth >= 1024) return;
        const t = e.target;
        const isPoint = t instanceof Element && t.closest('.condition-point');
        const isOverlay = t instanceof Element && t.closest('.condition-overlay');
        if (!isPoint && !isOverlay) hideConditionOverlay();
    });

    // Helper: show translucent overlay near a point (mobile)
    function showConditionOverlay(conditionId, anchorEl) {
        if (!overlay) return;
        const panel = document.getElementById(`condition-${conditionId}`);
        const titleEl = overlay.querySelector('.title');
        const descEl = overlay.querySelector('.desc');
        const title = panel ? (panel.querySelector('h3')?.textContent || '') : '';
        const desc = panel ? (panel.querySelector('p')?.textContent || '') : '';
        titleEl.textContent = title || 'Condition';
        descEl.textContent = desc || '';

        // Position relative to the figure and the anchor point
        const figRect = figure.getBoundingClientRect();
        const ptRect = anchorEl.getBoundingClientRect();
        const centerX = ptRect.left + ptRect.width / 2 - figRect.left;
        // Pre-position to measure size
        overlay.style.left = '50%';
        overlay.style.top = '0px';
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

        overlay.classList.add('visible');
    }

    function hideConditionOverlay() {
        if (!overlay) return;
        overlay.classList.remove('visible');
    }
});

/* =====================================================================
   4. ABOUT ACUPUNCTURE TAB FUNCTIONALITY
   =====================================================================
   Handles interactive tab cards and content switching
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // About Acupuncture: mobile horizontal slideshow + linked content panel
    const aboutSection = document.querySelector('#about-acupuncture');
    if (!aboutSection) return;

    const list = aboutSection.querySelector('#about-cards');
    const tabButtons = aboutSection.querySelectorAll('[role="tab"][data-panel]');
    const contentBlocks = aboutSection.querySelectorAll('#about-panel .about-content');

    if (!list || !tabButtons.length || !contentBlocks.length) return;

    // Initialize tabs styles and state
    function setActive(btn) {
        const target = btn.getAttribute('data-panel');
        tabButtons.forEach(b => {
            const active = b === btn;
            const title = b.querySelector('h3');
            b.setAttribute('aria-selected', active ? 'true' : 'false');
            b.classList.remove(
                'border-orange-500', 'border-gray-200', 'border-orange-500/50',
                'bg-white', 'bg-teal-50/30', 'bg-orange-50/30', 'hover:border-orange-500/50'
            );
            if (title) title.classList.remove('text-gray-600','text-gray-800','text-teal-600','text-orange-700','text-teal-700');
            if (active) {
                b.classList.add('border-orange-500','bg-white');
                if (title) title.classList.add('text-gray-600');
            } else {
                b.classList.add('border-gray-200','bg-white','hover:border-orange-500/50');
                if (title) title.classList.add('text-gray-600');
            }
        });
        // Swap content visibility
        contentBlocks.forEach(el => {
            const match = el.getAttribute('data-content') === target;
            el.classList.toggle('hidden', !match);
            el.classList.toggle('block', match);
        });
    }

    // Initial normalize
    setActive(aboutSection.querySelector('[role="tab"][aria-selected="true"]') || tabButtons[0]);

    // Click to activate + center on mobile
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            setActive(btn);
            // Center clicked card in the horizontal list on small screens
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });

    // On horizontal scroll, activate the card closest to center (mobile)
    let scrollTimer;
    function updateActiveFromScroll() {
        const center = list.scrollLeft + list.clientWidth / 2;
        let best = { btn: null, dist: Infinity };
        tabButtons.forEach(b => {
            const childCenter = b.offsetLeft + b.offsetWidth / 2;
            const d = Math.abs(childCenter - center);
            if (d < best.dist) best = { btn: b, dist: d };
        });
        if (best.btn) setActive(best.btn);
    }
    list.addEventListener('scroll', () => {
        // Debounce to avoid thrashing while scrolling
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(updateActiveFromScroll, 80);
    }, { passive: true });
});
