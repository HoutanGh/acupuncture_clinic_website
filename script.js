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
});