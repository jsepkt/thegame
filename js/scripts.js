// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("The Inland Game - Site Loaded");

    const heroSection = document.getElementById('hero');
    const mainContent = document.getElementById('main-content');
    const enterIslandCTA = document.getElementById('enter-island-cta');
    const scrollIndicator = document.querySelector('.scroll-indicator'); // Get scroll indicator

    let contentRevealed = false; // Flag to ensure reveal logic runs only once

    function revealMainContent() {
        if (!contentRevealed && mainContent) {
            // mainContent.style.display = 'block'; // Old way
            mainContent.classList.add('visible'); // Add class for CSS transition
            console.log("Main content revealed");

            if (scrollIndicator && heroSection) {
                heroSection.classList.add('content-revealed'); // Hide scroll indicator
            }
            contentRevealed = true;

            // Optional: Remove event listeners if they are no longer needed
            if (enterIslandCTA) {
                enterIslandCTA.removeEventListener('click', handleCTAClick);
            }
            window.removeEventListener('scroll', handleScroll);
        }
    }

    function handleCTAClick() {
        revealMainContent();
        // Smooth scroll to the start of main content AFTER it's made visible
        // We need a slight delay for the display property to take effect before scrolling
        setTimeout(() => {
            if (mainContent) { // Check if mainContent exists
                 // Find the first actual section within main-content to scroll to
                const firstSection = mainContent.querySelector('.content-section');
                if (firstSection) {
                    firstSection.scrollIntoView({ behavior: 'smooth' });
                } else { // Fallback if no .content-section found
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }, 100); // Small delay
    }

    function handleScroll() {
        if (heroSection && window.scrollY > heroSection.offsetHeight * 0.5) { // Reveal after scrolling 50% of hero height
            revealMainContent();
        }
    }

    // --- Event Listeners ---
    if (enterIslandCTA) {
        enterIslandCTA.addEventListener('click', handleCTAClick);
    }
    window.addEventListener('scroll', handleScroll);


    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});