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

    // About Me Slider functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.slide');
    const navBtns = document.querySelectorAll('.slider-nav-btn');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');

    function showSlide(n) {
        slides[currentSlide].classList.remove('active');
        navBtns[currentSlide].classList.remove('active');
        
        currentSlide = (n + slides.length) % slides.length;
        
        slides[currentSlide].classList.add('active');
        navBtns[currentSlide].classList.add('active');
    }

    if (navBtns.length > 0) {
        navBtns.forEach((btn, index) => {
            btn.addEventListener('click', () => showSlide(index));
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide(currentSlide - 1));
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide(currentSlide + 1));
    }

    // Enhanced Home Slider functionality
    let currentHomeSlide = 0;
    let isHomeSliding = false;
    const homeSlides = document.querySelectorAll('.home-slide');
    const homePrevBtn = document.querySelector('.home-slider-prev');
    const homeNextBtn = document.querySelector('.home-slider-next');
    const locationDetails = document.getElementById('location-details');

    function updateHomeArrowVisibility() {
        if (!homePrevBtn || !homeNextBtn) return;
        
        if (currentHomeSlide === 0) {
            // Welcome slide - show only right arrow and location details
            homePrevBtn.style.display = 'none';
            homeNextBtn.style.display = 'flex';
            if (locationDetails) {
                locationDetails.classList.remove('hidden');
            }
        } else if (currentHomeSlide === 1) {
            // Find Me slide - show only left arrow and hide location details
            homePrevBtn.style.display = 'flex';
            homeNextBtn.style.display = 'none';
            if (locationDetails) {
                locationDetails.classList.add('hidden');
            }
        }
    }

    function slideToNext() {
        if (isHomeSliding || currentHomeSlide === 1) return;
        
        isHomeSliding = true;
        
        // Hide location details immediately when transitioning
        if (locationDetails) {
            locationDetails.classList.add('hidden');
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