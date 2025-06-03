// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("The Inland Game - Site Loaded");

    const heroSection = document.getElementById('hero');
    const mainContent = document.getElementById('main-content');
    const enterIslandCTA = document.getElementById('enter-island-cta');
    const scrollIndicator = document.querySelector('.scroll-indicator');

    // Age Gate Modal Elements
    const ageGateModal = document.getElementById('age-gate-modal');
    const ageConfirmYesBtn = document.getElementById('age-confirm-yes');
    const ageConfirmNoBtn = document.getElementById('age-confirm-no');

    let contentRevealed = false; // Flag for main content
    const AGE_VERIFIED_KEY = 'inlandGameAgeVerified'; // localStorage key

    function showAgeGate() {
        if (ageGateModal) {
            ageGateModal.style.display = 'flex'; // Show overlay
            setTimeout(() => ageGateModal.classList.add('visible'), 10); // Trigger transition
            console.log("Age gate shown");
        }
    }

    function hideAgeGate() {
        if (ageGateModal) {
            ageGateModal.classList.remove('visible');
            // Wait for transition to finish before setting display to none
            setTimeout(() => ageGateModal.style.display = 'none', 500);
        }
    }

    function revealSiteContent() {
        if (!contentRevealed && mainContent) {
            mainContent.classList.add('visible');
            console.log("Main content revealed");

            if (scrollIndicator && heroSection) {
                heroSection.classList.add('content-revealed');
            }
            contentRevealed = true;

            // Scroll to the first section after reveal
            setTimeout(() => {
                const firstSection = mainContent.querySelector('.content-section');
                if (firstSection) {
                    firstSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                    mainContent.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100); // Small delay for display property to take effect
        }
    }

    function handleAgeConfirmation(isVerified) {
        hideAgeGate();
        if (isVerified) {
            console.log("Age confirmed: 18+");
            localStorage.setItem(AGE_VERIFIED_KEY, 'true'); // Store confirmation
            revealSiteContent();
        } else {
            console.log("Age confirmed: Under 18 - Access Denied");
            // Optional: Redirect or show a message
            alert("Access Denied. You must be 18 or older to enter The Inland Game.");
            // window.location.href = "https://www.google.com"; // Example redirect
        }
    }

    // --- Event Listeners ---

    // "Enter the Island" CTA click
    if (enterIslandCTA) {
        enterIslandCTA.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default button action if any
            
            // Check if already verified in this session
            if (localStorage.getItem(AGE_VERIFIED_KEY) === 'true') {
                console.log("Age already verified in this session.");
                revealSiteContent(); // Directly reveal if already verified
            } else {
                showAgeGate();
            }
        });
    }

    // Age Gate "Yes" button
    if (ageConfirmYesBtn) {
        ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    }

    // Age Gate "No" button
    if (ageConfirmNoBtn) {
        ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    }

    // Scroll-based reveal (Optional - you might want to remove this if age gate is mandatory)
    // If you keep it, ensure it also checks for localStorage age verification
    // For now, let's comment it out to make age gate the primary entry point.
    /*
    let heroScrolled = false;
    window.addEventListener('scroll', () => {
        if (localStorage.getItem(AGE_VERIFIED_KEY) === 'true' && !contentRevealed && heroSection && window.scrollY > heroSection.offsetHeight * 0.5) {
            revealSiteContent();
        } else if (!localStorage.getItem(AGE_VERIFIED_KEY) && !contentRevealed && heroSection && window.scrollY > heroSection.offsetHeight * 0.5) {
            // If they scroll without clicking CTA and haven't verified, show age gate
            showAgeGate();
        }
    });
    */

    // --- Initial check on page load ---
    // If you want the site to be accessible directly if age was previously verified
    // AND you want to bypass the hero screen immediately (not recommended for first view)
    // if (localStorage.getItem(AGE_VERIFIED_KEY) === 'true') {
    //    revealSiteContent();
    // }


    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }
});