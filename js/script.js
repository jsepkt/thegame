// js/script.js (FRESH START - With Character Logic)
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
    const storyCards = document.querySelectorAll('.story-card');
    const storyPrevBtn = document.getElementById('story-prev-btn');
    const storyNextBtn = document.getElementById('story-next-btn');
    const storyCardIndicator = document.getElementById('story-card-indicator');
    const storyCompletionMessage = document.getElementById('story-completion-message');

    // Character Elements
    const characterCardWrappers = document.querySelectorAll('.character-card-wrapper');
    const characterModal = document.getElementById('character-modal');
    const characterModalCloseBtn = document.getElementById('character-modal-close-btn');
    const modalCharacterImage = document.getElementById('modal-character-image');
    const modalCharacterName = document.getElementById('modal-character-name');
    const modalCharacterArchetype = document.getElementById('modal-character-archetype');
    const modalCharacterBio = document.getElementById('modal-character-bio');
    const revealTraitBtn = document.getElementById('reveal-trait-btn');
    const modalCharacterHiddenTrait = document.getElementById('modal-character-hidden-trait');

    // Footer
    const currentYearSpan = document.getElementById('current-year');

    // --- State Variables ---
    let isAgeVerified = false;
    let isIslandEntered = false;
    let currentStoryCardIdx = 0;
    const AGE_VERIFIED_STORAGE_KEY = 'inland_game_age_verified_v1';

    // --- Character Data ---
    const characterData = {
        "aiden-cross": {
            name: "Aiden Cross", archetype: "The Strategic Player",
            portrait: "assets/images/characters/aiden_cross.jpg", fullImage: "assets/images/characters/aiden_cross.jpg",
            bio: "A master tactician haunted by a past failure. Aiden views the island as the ultimate chess game, every move calculated, every alliance a means to an end. But is he playing the game, or is the game playing him?",
            hiddenTrait: "Suffers from recurring nightmares of a loved one lost, fueling a desperate, almost reckless need to win."
        },
        "selene-ward": {
            name: "Selene Ward", archetype: "The Silent Survivor",
            portrait: "assets/images/characters/selene_ward.jpg", fullImage: "assets/images/characters/selene_ward.jpg",
            bio: "Quiet and observant, Selene moves like a ghost. Her survival skills are unmatched, honed by a life lived on the fringes. She trusts no one, relying only on her instincts and the secrets the island whispers to her.",
            hiddenTrait: "Carries a memento from a past she refuses to speak of, which seems to grant her an uncanny connection to the island's darker elements."
        },
        "darius-cole": {
            name: "Darius Cole", archetype: "The Ex-Soldier",
            portrait: "assets/images/characters/darius_cole.jpg", fullImage: "assets/images/characters/darius_cole.jpg",
            bio: "Combat-hardened and disciplined, Darius operates with cold efficiency. The island is just another battlefield, the other players targets. But beneath the stoic exterior lies a man weary of war, seeking something he can't define.",
            hiddenTrait: "Secretly writes poetry to cope with PTSD, a vulnerability he guards fiercely."
        },
        "nina-reyes": {
            name: "Nina Reyes", archetype: "The Game Theorist",
            portrait: "assets/images/characters/nina_reyes.jpg", fullImage: "assets/images/characters/nina_reyes.jpg",
            bio: "Brilliant and analytical, Nina sees patterns everywhere. To her, the game is a complex equation to be solved, the players variables. Her intellect is her greatest weapon, and potentially her greatest blind spot.",
            hiddenTrait: "Has a gambling addiction that led her to make a desperate deal to get on the island."
        },
        "elara-vance": {
            name: "Elara Vance", archetype: "The Ethereal Wildcard",
            portrait: "assets/images/characters/elara_vance.jpg", fullImage: "assets/images/characters/elara_vance.jpg",
            bio: "Almost otherworldly, Elara seems to drift through the game with a serene detachment. Some find her unnerving, others captivating. She speaks in riddles and seems to know more than she lets on.",
            hiddenTrait: "Claims to communicate with a 'presence' on the island, which guides her actions."
        },
        "kenji-tanaka": {
            name: "Kenji Tanaka", archetype: "The Quiet Technician",
            portrait: "assets/images/characters/kenji_tanaka.jpg", fullImage: "assets/images/characters/kenji_tanaka.jpg",
            bio: "Resourceful and ingenious, Kenji can MacGyver a solution out of anything. He's more comfortable with machines than people, and the island's strange tech fascinates him. His silence hides a sharp mind.",
            hiddenTrait: "Is on the run from a powerful corporation whose tech he may have 'borrowed'."
        },
        "isabelle-moreau": {
            name: "Isabelle Moreau", archetype: "The Idealistic Leader",
            portrait: "assets/images/characters/isabelle_moreau.jpg", fullImage: "assets/images/characters/isabelle_moreau.jpg",
            bio: "Charismatic and driven by a strong moral compass, Isabelle tries to unite the players. She believes in cooperation, but the island has a way of corrupting even the noblest intentions.",
            hiddenTrait: "Her idealism masks a deep-seated fear of failure, stemming from a past leadership catastrophe."
        },
        "chloe-kim": { // Key matches HTML data-character-id
            name: "Chloe 'Glitch' Kim", archetype: "The Hacker",
            portrait: "assets/images/characters/chloe_kim.jpg", fullImage: "assets/images/characters/chloe_kim.jpg",
            bio: "Anti-establishment and whip-smart, Glitch sees the game as a system to be broken. She's adept at finding exploits, both digital and psychological. Her cynicism is her shield.",
            hiddenTrait: "Joined the game to expose its creators, believing her missing brother was a previous contestant."
        },
        "marcus-thorne": {
            name: "Marcus Thorne", archetype: "The Desperate Father",
            portrait: "assets/images/characters/marcus_thorne.jpg", fullImage: "assets/images/characters/marcus_thorne.jpg",
            bio: "Driven by the need to provide for his sick child, Marcus is a man pushed to his limits. He's not a natural survivor or strategist, but his paternal desperation makes him dangerously unpredictable.",
            hiddenTrait: "Is being blackmailed into participating by someone who holds his daughter's fate in their hands."
        },
        "masked-enforcer": {
            name: "The Masked Enforcer", archetype: "The Enigma",
            portrait: "assets/images/characters/masked_enforcer.jpg", fullImage: "assets/images/characters/masked_enforcer.jpg",
            bio: "A silent, imposing figure that ensures the rules are followed – or doles out punishment. Their motives and allegiance are unknown, a terrifying extension of the game itself.",
            hiddenTrait: "Rumored to be a former player who 'ascended', or perhaps something not entirely human."
        }
    };


    // --- Utility Functions ---
    const showElement = (el) => {
        if (el) {
            el.style.visibility = 'visible'; // Make it part of layout calculations first
            requestAnimationFrame(() => { // Allow browser to paint the visibility change
                 el.classList.add('visible');
            });
        }
    };
    const hideElement = (el) => {
         if (el) el.classList.remove('visible');
         // Optional: set display none after transition for performance on modals
         if (el && (el.id === 'age-gate-modal' || el.id === 'character-modal')) {
             el.addEventListener('transitionend', () => {
                 if (!el.classList.contains('visible')) {
                     el.style.visibility = 'hidden'; // Hide completely after transition
                 }
             }, { once: true });
         }
    };


    // --- Initialization ---
    function initializeSite() {
        console.log("DEBUG: Initializing site...");
        body.classList.remove('preload');

        if (currentYearSpan) currentYearSpan.textContent = new Date().getFullYear();

        storyCards.forEach(card => {
            const bgImage = card.dataset.bgImage;
            if (bgImage) card.style.backgroundImage = `url('${bgImage}')`;
        });
        
        if (localStorage.getItem(AGE_VERIFIED_STORAGE_KEY) === 'true') {
            isAgeVerified = true;
            console.log("DEBUG: Age previously verified");
        }

        if (storyCards.length > 0) {
            updateStoryNavigation();
            // No need to call updateStoryCardDisplay or scroll on init unless island is already entered
        } else {
            console.warn("DEBUG: No story cards found.");
        }
    }

    // --- Age Gate Logic ---
    function openAgeGate() {
        console.log("DEBUG: Opening age gate");
        if (ageGateModal) {
            ageGateModal.style.visibility = 'visible'; // Make visible before adding class for transition
            requestAnimationFrame(() => showElement(ageGateModal));
        }
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
            alert("Access denied. You must be 18 or older to experience The Inland Game.");
        }
    }

    // --- Site Entry Logic ---
    function enterTheIsland() {
        if (isIslandEntered) return;
        console.log("DEBUG: Entering the island...");
        isIslandEntered = true;

        if (enterIslandCTA) {
            enterIslandCTA.classList.add('button-entered');
            enterIslandCTA.disabled = true;
        }
        if (mainContent) {
            showElement(mainContent);
            setTimeout(() => {
                const storySection = document.getElementById('story');
                if (storySection) {
                    storySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // After scrolling, ensure the first card is "centered" if using horizontal scroll
                    if (storyCards.length > 0) {
                        setTimeout(() => scrollStoryCardIntoView(currentStoryCardIdx), 300); // Slight delay after section scroll
                    }
                }
            }, 600);
        }
    }

    // --- Story Card Navigation Logic ---
    function updateStoryNavigation() {
        if (!storyPrevBtn || !storyNextBtn || !storyCardIndicator || storyCards.length === 0) return;
        storyCardIndicator.textContent = `${currentStoryCardIdx + 1} / ${storyCards.length}`;
        storyPrevBtn.disabled = currentStoryCardIdx === 0;
        storyNextBtn.disabled = currentStoryCardIdx === storyCards.length - 1;
        if (storyCompletionMessage) {
            storyCompletionMessage.style.display = (currentStoryCardIdx === storyCards.length - 1) ? 'block' : 'none';
        }
    }

    function scrollStoryCardIntoView(index) {
        const cardToView = storyCards[index];
        const viewport = document.querySelector('.story-cards-viewport');
        if (cardToView && viewport) {
            const viewportRect = viewport.getBoundingClientRect();
            const cardRect = cardToView.getBoundingClientRect();
            
            // Calculate how much to scroll to center the card (approximately)
            // This considers the card's left position relative to the viewport's left,
            // then adjusts to center it.
            const scrollAmount = (cardRect.left - viewportRect.left) // card's offset from viewport start
                                 - (viewportRect.width / 2)          // subtract half viewport width
                                 + (cardRect.width / 2);             // add half card width

            viewport.scrollBy({ // Use scrollBy to scroll relative to current position
                left: scrollAmount,
                behavior: 'smooth'
            });
            console.log("DEBUG: Scrolled story card viewport by:", scrollAmount);
        }
    }

    // --- Character Modal Logic ---
    function openCharacterModal(characterId) {
        const data = characterData[characterId];
        if (!data || !characterModal) {
            console.error("DEBUG: Character data or modal not found for ID:", characterId);
            return;
        }
        console.log("DEBUG: Opening modal for character:", characterId);

        if(modalCharacterImage) modalCharacterImage.src = data.fullImage || data.portrait;
        if(modalCharacterName) modalCharacterName.textContent = data.name;
        if(modalCharacterArchetype) modalCharacterArchetype.textContent = data.archetype;
        if(modalCharacterBio) modalCharacterBio.textContent = data.bio;
        
        if(modalCharacterHiddenTrait) {
            modalCharacterHiddenTrait.textContent = data.hiddenTrait;
            modalCharacterHiddenTrait.style.display = 'none';
        }
        if(revealTraitBtn) revealTraitBtn.style.display = 'block';

        characterModal.dataset.currentCharacterId = characterId; // Store for trait reveal
        
        characterModal.style.visibility = 'visible'; // Make visible before adding class
        requestAnimationFrame(() => showElement(characterModal));
    }

    function closeCharacterModal() {
        if (!characterModal) return;
        console.log("DEBUG: Closing character modal");
        hideElement(characterModal);
    }

    // --- Event Listeners ---
    if (enterIslandCTA) {
        enterIslandCTA.addEventListener('click', () => {
            console.log("DEBUG: Enter Island CTA clicked.");
            if (isAgeVerified) enterTheIsland();
            else openAgeGate();
        });
    } else { console.error("DEBUG: enterIslandCTA not found!"); }

    if (ageConfirmYesBtn) ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    else { console.error("DEBUG: ageConfirmYesBtn not found!"); }

    if (ageConfirmNoBtn) ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    else { console.error("DEBUG: ageConfirmNoBtn not found!"); }

    if (storyNextBtn) {
        storyNextBtn.addEventListener('click', () => {
            if (currentStoryCardIdx < storyCards.length - 1) {
                currentStoryCardIdx++;
                scrollStoryCardIntoView(currentStoryCardIdx);
                updateStoryNavigation();
            }
        });
    } else { console.error("DEBUG: storyNextBtn not found!"); }

    if (storyPrevBtn) {
        storyPrevBtn.addEventListener('click', () => {
            if (currentStoryCardIdx > 0) {
                currentStoryCardIdx--;
                scrollStoryCardIntoView(currentStoryCardIdx);
                updateStoryNavigation();
            }
        });
    } else { console.error("DEBUG: storyPrevBtn not found!"); }

    if (characterCardWrappers.length > 0) {
        characterCardWrappers.forEach(cardWrapper => {
            const revealButton = cardWrapper.querySelector('.character-reveal-btn');
            const clickableElement = revealButton || cardWrapper;
            clickableElement.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent card click if button is separate
                const characterId = cardWrapper.dataset.characterId;
                if (characterId) openCharacterModal(characterId);
                else console.error("DEBUG: Character ID not found on card wrapper:", cardWrapper);
            });
        });
    } else { console.warn("DEBUG: No character cards found."); }

    if (characterModalCloseBtn) characterModalCloseBtn.addEventListener('click', closeCharacterModal);
    else { console.warn("DEBUG: Character modal close btn not found."); }

    if (revealTraitBtn) {
        revealTraitBtn.addEventListener('click', () => {
            if (modalCharacterHiddenTrait && modalCharacterHiddenTrait.style.display === 'none') {
                modalCharacterHiddenTrait.style.display = 'block';
                revealTraitBtn.style.display = 'none';
                console.log("DEBUG: Hidden trait revealed for:", characterModal.dataset.currentCharacterId);
            }
        });
    } else { console.warn("DEBUG: Reveal trait btn not found."); }

    // --- Run Initialization ---
    initializeSite();
    console.log("DEBUG: Inland Game - Script fully loaded and initialized.");
});