/* adding AJAX submission */

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (!form) return;

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.position = "absolute";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.background = "rgba(249,246,242,0.85)"; // warm white, translucent
    overlay.style.display = "none";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.zIndex = 10;

    // Create message box
    const msgBox = document.createElement("div");
    msgBox.className = "p-6 rounded-xl shadow text-center text-lg font-semibold";
    msgBox.style.background = "#b7c9a8"; // sage
    msgBox.style.color = "#2d2d2d";
    overlay.appendChild(msgBox);

    // Position parent relative
    form.style.position = "relative";
    form.parentNode.insertBefore(overlay, form);

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const formData = new FormData(form);
        fetch(form.action, {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                form.reset();
                msgBox.textContent = "Thank you! Your message has been sent.";
            } else {
                msgBox.textContent = "Oops! There was a problem submitting your form.";
            }
            overlay.style.display = "flex";
            setTimeout(() => { overlay.style.display = "none"; }, 3500);
        })
        .catch(() => {
            msgBox.textContent = "Oops! There was a problem submitting your form.";
            overlay.style.display = "flex";
            setTimeout(() => { overlay.style.display = "none"; }, 3500);
        });
    });


    // Enhanced Home Slider functionality
    let currentHomeSlide = 0;
    let isHomeSliding = false;
    const homeSlides = document.querySelectorAll('.home-slide');
    const homePrevBtn = document.querySelector('.home-slider-prev');
    const homeNextBtn = document.querySelector('.home-slider-next');
    const locationDetails = document.getElementById('location-details');
    const welcomeText = document.getElementById('welcome-text');

    function updateHomeArrowVisibility() {
        if (!homePrevBtn || !homeNextBtn) return;
        
        if (currentHomeSlide === 0) {
            // Welcome slide - show only right arrow and location details
            homePrevBtn.style.display = 'none';
            homeNextBtn.style.display = 'flex';
            if (locationDetails) {
                locationDetails.classList.remove('hidden');
            }
            if (welcomeText) {
                welcomeText.classList.remove('visible');
                welcomeText.classList.add('hidden');
            }
        } else if (currentHomeSlide === 1) {
            // Find Me slide - show only left arrow and welcome text
            homePrevBtn.style.display = 'flex';
            homeNextBtn.style.display = 'none';
            if (locationDetails) {
                locationDetails.classList.add('hidden');
            }
            if (welcomeText) {
                welcomeText.classList.remove('hidden');
                welcomeText.classList.add('visible');
            }
        }
    }

    function slideToNext() {
        if (isHomeSliding || currentHomeSlide === 1) return;
        
        isHomeSliding = true;
        
        // Hide location details and show welcome text immediately when transitioning
        if (locationDetails) {
            locationDetails.classList.add('hidden');
        }
        if (welcomeText) {
            welcomeText.classList.remove('hidden');
            welcomeText.classList.add('visible');
        }
        
        // Slide current slide left
        homeSlides[0].classList.add('slide-left');
        homeSlides[0].classList.remove('active');
        
        // Slide next slide in from right
        homeSlides[1].classList.remove('slide-right');
        homeSlides[1].classList.add('active');
        
        currentHomeSlide = 1;
        
        // After animation completes
        setTimeout(() => {
            updateHomeArrowVisibility();
            isHomeSliding = false;
        }, 600);
    }

    function slideToPrev() {
        if (isHomeSliding || currentHomeSlide === 0) return;
        
        isHomeSliding = true;
        
        // Hide welcome text and show location details immediately when transitioning
        if (welcomeText) {
            welcomeText.classList.remove('visible');
            welcomeText.classList.add('hidden');
        }
        if (locationDetails) {
            locationDetails.classList.remove('hidden');
        }
        
        // Slide current slide right
        homeSlides[1].classList.add('slide-right');
        homeSlides[1].classList.remove('active');
        
        // Slide previous slide in from left
        homeSlides[0].classList.remove('slide-left');
        homeSlides[0].classList.add('active');
        
        currentHomeSlide = 0;
        
        // After animation completes
        setTimeout(() => {
            updateHomeArrowVisibility();
            isHomeSliding = false;
        }, 600);
    }

    // Event listeners for arrows
    if (homePrevBtn) {
        homePrevBtn.addEventListener('click', slideToPrev);
    }

    if (homeNextBtn) {
        homeNextBtn.addEventListener('click', slideToNext);
    }

    // Initialize
    function initializeHomeSlider() {
        if (homeSlides.length === 0) return;
        
        homeSlides[0].classList.add('active');
        homeSlides[1].classList.add('slide-right');
        
        updateHomeArrowVisibility();
    }

    // Initialize
    initializeHomeSlider();
});

/* =====================================================================
   Location Gallery Functionality
===================================================================== */

document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll('.gallery-slide');
    const dots = document.querySelectorAll('.gallery-dot');
    const prevBtn = document.getElementById('gallery-prev');
    const nextBtn = document.getElementById('gallery-next');
    
    if (!slides.length) return; // Exit if gallery doesn't exist

    let currentSlide = 0;

    function showSlide(index) {
        // Remove active styles from all slides and dots
        slides.forEach(slide => {
            slide.classList.remove('opacity-100');
            slide.classList.add('opacity-0');
        });
        
        dots.forEach(dot => {
            dot.classList.remove('bg-white');
            dot.classList.add('bg-white', 'bg-opacity-50');
        });
        
        // Add active styles to current slide and dot
        slides[index].classList.remove('opacity-0');
        slides[index].classList.add('opacity-100');
        
        dots[index].classList.remove('bg-opacity-50');
        dots[index].classList.add('bg-white');
        
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }

    function prevSlide() {
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }

    // Event listeners
    if (nextBtn) {
        nextBtn.addEventListener('click', nextSlide);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', prevSlide);
    }

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });

    // Auto-advance every 5 seconds (optional)
    setInterval(nextSlide, 5000);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevSlide();
        if (e.key === 'ArrowRight') nextSlide();
    });
});

/* =====================================================================
   Interactive Body Map for Conditions
===================================================================== */
document.addEventListener("DOMContentLoaded", function () {
    const points = document.querySelectorAll('.condition-point');
    const infoPanels = document.querySelectorAll('.condition-info');

    if (!points.length) return;

    function highlightCondition(conditionId) {
        // Remove active class from all panels and points
        infoPanels.forEach(panel => panel.classList.remove('active'));
        points.forEach(point => point.classList.remove('active'));

        // Add active class to the selected panel and point
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        const pointToHighlight = document.querySelector(`[data-condition="${conditionId}"]`);

        if (panelToHighlight) {
            panelToHighlight.classList.add('active');
            // Scroll to the panel if it's out of view on smaller screens
            if (window.innerWidth < 1024) {
                panelToHighlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        if (pointToHighlight) {
            pointToHighlight.classList.add('active');
        }
    }

    function addHoverHighlight(conditionId) {
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        if (panelToHighlight && !panelToHighlight.classList.contains('active')) {
            panelToHighlight.style.borderLeftColor = 'rgba(201, 122, 83, 0.7)';
            panelToHighlight.style.transform = 'translateX(4px)';
            panelToHighlight.style.opacity = '1';
        }
    }

    function removeHoverHighlight(conditionId) {
        const panelToHighlight = document.getElementById(`condition-${conditionId}`);
        if (panelToHighlight && !panelToHighlight.classList.contains('active')) {
            panelToHighlight.style.borderLeftColor = '';
            panelToHighlight.style.transform = '';
            panelToHighlight.style.opacity = '';
        }
    }

    points.forEach(point => {
        const condition = point.dataset.condition;
        
        point.addEventListener('click', () => {
            highlightCondition(condition);
        });

        point.addEventListener('mouseenter', () => {
            addHoverHighlight(condition);
        });

        point.addEventListener('mouseleave', () => {
            removeHoverHighlight(condition);
        });
    });

    infoPanels.forEach(panel => {
        const condition = panel.id.replace('condition-', '');
        
        panel.addEventListener('click', () => {
            highlightCondition(condition);
        });

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