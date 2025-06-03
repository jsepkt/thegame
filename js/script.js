// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: DOMContentLoaded - Script Start");

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

    console.log("DEBUG: Variables declared.", {
        heroSection,
        mainContent,
        enterIslandCTA,
        scrollIndicator,
        ageGateModal,
        ageConfirmYesBtn,
        ageConfirmNoBtn
    });

    function showAgeGate() {
        console.log("DEBUG: showAgeGate() called");
        if (ageGateModal) {
            ageGateModal.style.display = 'flex'; // Show overlay
            // Use a micro-task or very short timeout to ensure 'display' change is processed before classList modification
            requestAnimationFrame(() => {
                ageGateModal.classList.add('visible');
                console.log("DEBUG: Age gate modal class 'visible' added");
            });
        } else {
            console.error("DEBUG CRITICAL: ageGateModal element not found in showAgeGate()");
        }
    }

    function hideAgeGate() {
        console.log("DEBUG: hideAgeGate() called");
        if (ageGateModal) {
            ageGateModal.classList.remove('visible');
            // Wait for transition to finish before setting display to none
            ageGateModal.addEventListener('transitionend', function handleTransitionEnd() {
                ageGateModal.style.display = 'none';
                console.log("DEBUG: Age gate modal display set to 'none' after transition.");
                ageGateModal.removeEventListener('transitionend', handleTransitionEnd); // Clean up listener
            }, { once: true }); // Ensure listener fires only once
        } else {
            console.error("DEBUG CRITICAL: ageGateModal element not found in hideAgeGate()");
        }
    }

    function revealSiteContent() {
        console.log("DEBUG: revealSiteContent() called. contentRevealed:", contentRevealed);
        if (!contentRevealed && mainContent) {
            mainContent.classList.add('visible'); // This should trigger display: block and opacity transition from CSS
            console.log("DEBUG: mainContent class 'visible' added.");

            if (scrollIndicator && heroSection) {
                heroSection.classList.add('content-revealed'); // Hide scroll indicator
                console.log("DEBUG: heroSection class 'content-revealed' added.");
            }
            contentRevealed = true;

            // Scroll to the first section after reveal
            // Ensure content is actually display:block before scrolling
            // We rely on the CSS transition to make it visible, then scroll.
            // The opacity transition takes 1.5s. We can scroll sooner if display:block is immediate.
            setTimeout(() => {
                const firstSection = mainContent.querySelector('.content-section');
                if (mainContent.classList.contains('visible') && getComputedStyle(mainContent).display !== 'none') {
                    if (firstSection) {
                        console.log("DEBUG: Scrolling to firstSection:", firstSection);
                        firstSection.scrollIntoView({ behavior: 'smooth' });
                    } else {
                        console.log("DEBUG: Scrolling to mainContent (fallback):", mainContent);
                        mainContent.scrollIntoView({ behavior: 'smooth' });
                    }
                } else {
                     console.warn("DEBUG: mainContent not yet display:block or not .visible, scroll aborted or delayed. Check CSS for #main-content.visible { display: block; }");
                }
            }, 150); // Increased delay to allow for rendering after class change
        } else if (contentRevealed) {
            console.log("DEBUG: revealSiteContent() called but content already revealed.");
        } else if (!mainContent) {
            console.error("DEBUG CRITICAL: mainContent element not found in revealSiteContent()");
        }
    }

    function handleAgeConfirmation(isVerified) {
        console.log("DEBUG: handleAgeConfirmation() called. isVerified:", isVerified);
        hideAgeGate(); // This should now wait for transition before hiding
        if (isVerified) {
            console.log("DEBUG: Age confirmed: 18+");
            try {
                localStorage.setItem(AGE_VERIFIED_KEY, 'true'); // Store confirmation
                console.log("DEBUG: localStorage AGE_VERIFIED_KEY set to true.");
            } catch (e) {
                console.error("DEBUG: Error setting localStorage item.", e);
            }
            revealSiteContent();
        } else {
            console.log("DEBUG: Age confirmed: Under 18 - Access Denied");
            alert("Access Denied. You must be 18 or older to enter The Inland Game.");
            // window.location.href = "https://www.google.com"; // Example redirect
        }
    }

    // --- Event Listeners ---

    // "Enter the Island" CTA click
    if (enterIslandCTA) {
        console.log("DEBUG: Attaching click listener to enterIslandCTA:", enterIslandCTA);
        enterIslandCTA.addEventListener('click', (event) => {
            console.log("DEBUG: 'Enter the Island' CTA clicked!");
            event.preventDefault(); // Prevent default button action if any
            
            let isAgeVerified = false;
            try {
                isAgeVerified = localStorage.getItem(AGE_VERIFIED_KEY) === 'true';
                console.log("DEBUG: Checked localStorage. AGE_VERIFIED_KEY:", isAgeVerified);
            } catch (e) {
                console.error("DEBUG: Error getting localStorage item.", e);
                // Proceed as if not verified if localStorage fails
            }

            if (isAgeVerified) {
                console.log("DEBUG: Age already verified in localStorage. Revealing site content.");
                revealSiteContent(); // Directly reveal if already verified
            } else {
                console.log("DEBUG: Age not verified in localStorage. Showing age gate.");
                showAgeGate();
            }
        });
    } else {
        console.error("DEBUG CRITICAL: 'Enter the Island' CTA button (id='enter-island-cta') NOT FOUND in DOM!");
    }

    // Age Gate "Yes" button
    if (ageConfirmYesBtn) {
        console.log("DEBUG: Attaching click listener to ageConfirmYesBtn:", ageConfirmYesBtn);
        ageConfirmYesBtn.addEventListener('click', () => {
            console.log("DEBUG: 'I am 18 or Older' (ageConfirmYesBtn) button clicked");
            handleAgeConfirmation(true);
        });
    } else {
        console.error("DEBUG CRITICAL: Age confirm 'Yes' button (id='age-confirm-yes') NOT FOUND in DOM!");
    }

    // Age Gate "No" button
    if (ageConfirmNoBtn) {
        console.log("DEBUG: Attaching click listener to ageConfirmNoBtn:", ageConfirmNoBtn);
        ageConfirmNoBtn.addEventListener('click', () => {
            console.log("DEBUG: 'I am Under 18' (ageConfirmNoBtn) button clicked");
            handleAgeConfirmation(false);
        });
    } else {
        console.error("DEBUG CRITICAL: Age confirm 'No' button (id='age-confirm-no') NOT FOUND in DOM!");
    }

    // --- Update current year in footer ---
    const currentYearSpan = document.getElementById('current-year');
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    } else {
        console.warn("DEBUG: current-year span not found in footer.");
    }

    console.log("DEBUG: DOMContentLoaded - Script End. Event listeners should be active.");
});