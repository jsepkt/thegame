document.addEventListener('DOMContentLoaded', () => {
    console.log("The Inland Game - Site Loaded");

    const mainContent = document.getElementById('main-content');
    const enterIslandCTA = document.getElementById('enter-island-cta');
    const heroSection = document.getElementById('hero');

    // --- Smooth Scroll to Main Content on CTA click ---
    if (enterIslandCTA && mainContent) {
        enterIslandCTA.addEventListener('click', () => {
            // mainContent.style.display = 'block'; // Reveal content
            // For now, we just scroll. We'll handle the reveal properly later.
            mainContent.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- Scroll Trigger to reveal main content (alternative to click) ---
    // We'll make this more robust later
    // This is a very basic version
    let heroScrolled = false;
    window.addEventListener('scroll', () => {
        if (window.scrollY > heroSection.offsetHeight / 2 && !heroScrolled) {
            // mainContent.style.display = 'block';
            // console.log("Scrolled past hero, revealing content");
            // heroScrolled = true; // Ensure it only runs once
            // This logic will be refined. For now, all content is visible.
        }
    });


    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Placeholder for future functions ---
    // function initAIFeatures() { ... }
    // function initCharacterModals() { ... }
    // function initStoryAnimations() { ... }
});