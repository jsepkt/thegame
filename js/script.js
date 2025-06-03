// js/script.js (FRESH START)
document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: Inland Game - DOMContentLoaded");

    // --- DOM Element Selectors ---
    const body = document.body;
    const heroSection = document.getElementById('hero');
    const enterIslandCTA = document.getElementById('enter-island-cta');
    const mainContent = document.getElementById('main-content');

    // Age Gate
    const ageGateModal = document.getElementById('age-gate-modal');
    const ageConfirmYesBtn = document.getElementById('age-confirm-yes');
    const ageConfirmNoBtn = document.getElementById('age-confirm-no');

    // Story Cards
    const storyCardsContainer = document.querySelector('.story-cards-container');
    const storyCards = document.querySelectorAll('.story-card'); // Get all card elements
    const storyPrevBtn = document.getElementById('story-prev-btn');
    const storyNextBtn = document.getElementById('story-next-btn');
    const storyCardIndicator = document.getElementById('story-card-indicator');
    const storyCompletionMessage = document.getElementById('story-completion-message');

    // Footer
    const currentYearSpan = document.getElementById('current-year');

    // --- State Variables ---
    let isAgeVerified = false;
    let isIslandEntered = false;
    let currentStoryCardIdx = 0;
    const AGE_VERIFIED_STORAGE_KEY = 'inland_game_age_verified_v1';

    // --- Utility Functions ---
    const showElement = (el) => el && el.classList.add('visible');
    const hideElement = (el) => el && el.classList.remove('visible');

    // --- Initialization ---
    function initializeSite() {
        console.log("DEBUG: Initializing site...");
        // Remove preload class to enable transitions
        body.classList.remove('preload');

        // Set current year in footer
        if (currentYearSpan) {
            currentYearSpan.textContent = new Date().getFullYear();
        }

        // Apply background images to story cards from data-attribute
        storyCards.forEach(card => {
            const bgImage = card.dataset.bgImage;
            if (bgImage) {
                card.style.backgroundImage = `url('${bgImage}')`;
            }
        });
        
        // Check localStorage for previous age verification
        if (localStorage.getItem(AGE_VERIFIED_STORAGE_KEY) === 'true') {
            isAgeVerified = true;
            console.log("DEBUG: Age previously verified (from localStorage)");
            // If already verified, we might still want them to "enter" via button
            // but the button click will skip the modal.
        }

        // Initial story card setup (will only be visible if mainContent is shown)
        if (storyCards.length > 0) {
            updateStoryCardDisplay();
            updateStoryNavigation();
        } else {
            console.warn("DEBUG: No story cards found.");
        }
    }

    // --- Age Gate Logic ---
    function openAgeGate() {
        console.log("DEBUG: Opening age gate");
        if (ageGateModal) showElement(ageGateModal);
    }
    function closeAgeGate() {
        console.log("DEBUG: Closing age gate");
        if (ageGateModal) hideElement(ageGateModal);
    }
    function handleAgeConfirmation(confirmed) {
        closeAgeGate();
        if (confirmed) {
            console.log("DEBUG: Age confirmed (18+)");
            isAgeVerified = true;
            localStorage.setItem(AGE_VERIFIED_STORAGE_KEY, 'true');
            enterTheIsland();
        } else {
            console.log("DEBUG: Age not confirmed (under 18)");
            // Potentially redirect or show a "cannot enter" message instead of alert
            alert("Access denied. You must be 18 or older to experience The Inland Game.");
        }
    }

    // --- Site Entry Logic ---
    function enterTheIsland() {
        if (isIslandEntered) return; // Prevent multiple entries
        console.log("DEBUG: Entering the island...");
        isIslandEntered = true;

        if (enterIslandCTA) {
            enterIslandCTA.classList.add('button-entered');
            // enterIslandCTA.querySelector('.cta-text').textContent = "Island Entered"; // Optional text change
            enterIslandCTA.disabled = true;
        }
        if (heroSection) {
            // heroSection.classList.add('island-entered'); // If CSS needs this for other hero changes
        }
        if (mainContent) {
            showElement(mainContent);
            // Scroll to story section after a short delay for fade-in
            setTimeout(() => {
                const storySection = document.getElementById('story');
                if (storySection) {
                    storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 600); // Adjust delay as needed
        }
    }

    // --- Story Card Navigation Logic ---
    function updateStoryCardDisplay() {
        if (!storyCardsContainer || storyCards.length === 0) return;
        // For horizontal scroll, we just ensure the container is scrollable.
        // No specific class needed on individual cards for basic scroll.
        // If we wanted a "snap-to" effect, that's more complex JS.
        console.log("DEBUG: Story card display update for index (not strictly needed for scroll):", currentStoryCardIdx);
    }

    function updateStoryNavigation() {
        if (!storyPrevBtn || !storyNextBtn || !storyCardIndicator || storyCards.length === 0) {
            console.warn("DEBUG: Story navigation elements not found or no cards.");
            return;
        }
        storyCardIndicator.textContent = `${currentStoryCardIdx + 1} / ${storyCards.length}`;
        storyPrevBtn.disabled = currentStoryCardIdx === 0;
        storyNextBtn.disabled = currentStoryCardIdx === storyCards.length - 1;

        if (storyCompletionMessage) {
            storyCompletionMessage.style.display = (currentStoryCardIdx === storyCards.length - 1) ? 'block' : 'none';
        }
    }

    function scrollStoryCardIntoView(index) {
        if (storyCards[index] && storyCardsContainer.parentElement) { // storyCardsContainer.parentElement is viewport
             const card = storyCards[index];
             const viewport = storyCardsContainer.parentElement; // .story-cards-viewport
             const scrollLeft = card.offsetLeft - viewport.offsetLeft - (viewport.offsetWidth / 2) + (card.offsetWidth / 2);
             
             viewport.scrollTo({
                 left: scrollLeft,
                 behavior: 'smooth'
             });
            console.log("DEBUG: Scrolled to card index:", index);
        }
    }


    // --- Event Listeners ---
    if (enterIslandCTA) {
        enterIslandCTA.addEventListener('click', () => {
            console.log("DEBUG: Enter Island CTA clicked.");
            if (isAgeVerified) {
                enterTheIsland();
            } else {
                openAgeGate();
            }
        });
    } else { console.error("DEBUG: enterIslandCTA not found!"); }

    if (ageConfirmYesBtn) {
        ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    } else { console.error("DEBUG: ageConfirmYesBtn not found!"); }

    if (ageConfirmNoBtn) {
        ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    } else { console.error("DEBUG: ageConfirmNoBtn not found!"); }

    if (storyNextBtn) {
        storyNextBtn.addEventListener('click', () => {
            if (currentStoryCardIdx < storyCards.length - 1) {
                currentStoryCardIdx++;
                updateStoryCardDisplay(); // Not strictly needed for pure scroll, but good for counter
                updateStoryNavigation();
                scrollStoryCardIntoView(currentStoryCardIdx);
            }
        });
    } else { console.error("DEBUG: storyNextBtn not found!"); }

    if (storyPrevBtn) {
        storyPrevBtn.addEventListener('click', () => {
            if (currentStoryCardIdx > 0) {
                currentStoryCardIdx--;
                updateStoryCardDisplay();
                updateStoryNavigation();
                scrollStoryCardIntoView(currentStoryCardIdx);
            }
        });
    } else { console.error("DEBUG: storyPrevBtn not found!"); }

    // --- Run Initialization ---
    initializeSite();
});