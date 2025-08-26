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

    // Exit if interactive body map doesn't exist
    if (!points.length) return;

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
            panelToHighlight.style.borderLeftColor = 'rgba(201, 122, 83, 0.7)';
            panelToHighlight.style.transform = 'translateX(4px)';
            panelToHighlight.style.opacity = '1';
        }
    }

    /**
     * Remove hover highlight effect from condition info panel
     */
    function removeHoverHighlight(conditionId) {
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        if (panelToHighlight && !panelToHighlight.classList.contains('active')) {
            panelToHighlight.style.borderLeftColor = '';
            panelToHighlight.style.transform = '';
            panelToHighlight.style.opacity = '';
        }
    }

    // Set up body point interactions
    points.forEach(point => {
        const condition = point.dataset.condition;
        
        // Click to highlight condition
        point.addEventListener('click', () => {
            highlightCondition(condition);
        });

        // Hover effects for points
        point.addEventListener('mouseenter', () => {
            // Highlight the corresponding panel
            addHoverHighlight(condition);
            // Add same orange halo effect to the point as panel hover does
            if (!point.classList.contains('active')) {
                point.style.transform = 'translate(-50%, -50%) scale(1.15)';
                point.style.boxShadow = '0 0 0 6px rgba(201, 122, 83, 0.3), 0 0 0 12px rgba(201, 122, 83, 0.15), 0 4px 12px rgba(0, 0, 0, 0.25)';
            }
        });

        point.addEventListener('mouseleave', () => {
            // Remove panel highlight
            removeHoverHighlight(condition);
            // Remove orange halo effect from point
            if (!point.classList.contains('active')) {
                point.style.transform = '';
                point.style.boxShadow = '';
            }
        });
    });

    // Set up info panel interactions
    infoPanels.forEach(panel => {
        const condition = panel.id.replace('condition-', '');
        
        // Click to highlight condition
        panel.addEventListener('click', () => {
            highlightCondition(condition);
        });

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
});

/* =====================================================================
   4. ABOUT ACUPUNCTURE TAB FUNCTIONALITY
   =====================================================================
   Handles interactive tab cards and content switching
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    // Minimal tabs logic for about acupuncture section
    const tabButtons = document.querySelectorAll('#about-acupuncture [role="tab"]');
    const contentBlocks = document.querySelectorAll('#about-panel .about-content');

    // Exit if about acupuncture section doesn't exist
    if (!tabButtons.length || !contentBlocks.length) return;

    // Initialize all tabs to ensure consistent styling
    function initializeTabs() {
        tabButtons.forEach(btn => {
            const isActive = btn.getAttribute('aria-selected') === 'true';
            const title = btn.querySelector('h3');
            
            // Clear all classes that might be hardcoded in HTML
            btn.classList.remove(
                'border-orange-500', 'border-gray-200', 'border-orange-500/50',
                'bg-white', 'bg-teal-50/30', 'bg-orange-50/30',
                'hover:border-orange-500/50'
            );
            if (title) {
                title.classList.remove('text-gray-600', 'text-gray-800', 'text-teal-600', 'text-orange-700', 'text-teal-700');
            }
            
            // Apply correct initial state
            if (isActive) {
                // Active: opaque orange border, white background, gray text, NO hover effect
                btn.classList.add('border-orange-500', 'bg-white');
                if (title) {
                    title.classList.add('text-gray-600');
                }
            } else {
                // Inactive: gray border, white background, gray text, WITH hover effect
                btn.classList.add('border-gray-200', 'bg-white', 'hover:border-orange-500/50');
                if (title) {
                    title.classList.add('text-gray-600');
                }
            }
        });
    }

    // Initialize tabs on page load
    initializeTabs();

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-panel');

            // Update tabs: aria attributes + styling
            tabButtons.forEach(b => {
                const active = b === btn;
                const title = b.querySelector('h3');
                
                b.setAttribute('aria-selected', active ? 'true' : 'false');
                
                // Clear all background, border, and text color classes first
                b.classList.remove(
                    'border-orange-500', 'border-gray-200', 'border-orange-500/50',
                    'bg-white', 'bg-teal-50/30', 'bg-orange-50/30',
                    'hover:border-orange-500/50'
                );
                if (title) {
                    title.classList.remove('text-gray-600', 'text-gray-800', 'text-teal-600', 'text-orange-700', 'text-teal-700');
                }
                
                // Apply the correct styling based on active state
                if (active) {
                    // Active state: opaque orange border, white background, gray text, NO hover effect
                    b.classList.add('border-orange-500', 'bg-white');
                    if (title) {
                        title.classList.add('text-gray-600');
                    }
                } else {
                    // Inactive state: gray border, white background, gray text, WITH hover effect
                    b.classList.add('border-gray-200', 'bg-white', 'hover:border-orange-500/50');
                    if (title) {
                        title.classList.add('text-gray-600');
                    }
                }
            });

            // Swap content visibility
            contentBlocks.forEach(el => {
                el.classList.toggle('hidden', el.getAttribute('data-content') !== target);
                el.classList.toggle('block', el.getAttribute('data-content') === target);
            });

            // Optional: scroll content into view on mobile devices
            const panel = document.querySelector('#about-panel');
            if (panel && window.innerWidth < 1024) {
                panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
