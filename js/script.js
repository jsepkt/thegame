// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: Inland Game - DOMContentLoaded - Full Script with Firebase Compat");

    // Firebase config is now expected to be globally available
    // from the <script> tag in index.html BEFORE this script.js is loaded.
    let app;
    let db; // Firestore database instance

    try {
        if (typeof firebase !== 'undefined' && typeof firebase.initializeApp === 'function' && typeof firebaseConfig !== 'undefined') {
            if (!firebase.apps.length) {
                app = firebase.initializeApp(firebaseConfig);
                console.log("DEBUG: Firebase Initialized (compat).");
            } else {
                app = firebase.app();
                console.log("DEBUG: Firebase already initialized (compat). Using existing app.");
            }
            if (app && typeof firebase.firestore === 'function') {
                db = firebase.firestore();
                console.log("DEBUG: Firestore instance obtained.");
            } else {
                console.error("DEBUG CRITICAL: Firestore SDK not available or app not initialized correctly for Firestore.");
            }
        } else {
            console.error("DEBUG CRITICAL: Firebase SDK (global 'firebase' object) or 'firebaseConfig' not loaded/defined!");
        }
    } catch (e) {
        console.error("DEBUG CRITICAL: Firebase Initialization Failed!", e);
    }

    // --- DOM Element Selectors ---
    const body = document.body;
    const heroSection = document.getElementById('hero');
    const enterIslandCTA = document.getElementById('enter-island-cta');
    const mainContent = document.getElementById('main-content');

    const ageGateModal = document.getElementById('age-gate-modal');
    const ageConfirmYesBtn = document.getElementById('age-confirm-yes');
    const ageConfirmNoBtn = document.getElementById('age-confirm-no');

    const storyCardsContainer = document.querySelector('.story-cards-container');
    const storyCards = document.querySelectorAll('.story-card');
    const storyPrevBtn = document.getElementById('story-prev-btn');
    const storyNextBtn = document.getElementById('story-next-btn');
    const storyCardIndicator = document.getElementById('story-card-indicator');
    const storyCompletionMessage = document.getElementById('story-completion-message');

    const characterCardWrappers = document.querySelectorAll('.character-card-wrapper');
    const characterModal = document.getElementById('character-modal');
    const characterModalCloseBtn = document.getElementById('character-modal-close-btn');
    const modalCharacterImage = document.getElementById('modal-character-image');
    const modalCharacterName = document.getElementById('modal-character-name');
    const modalCharacterArchetype = document.getElementById('modal-character-archetype');
    const modalCharacterBio = document.getElementById('modal-character-bio');
    const revealTraitBtn = document.getElementById('reveal-trait-btn');
    const modalCharacterHiddenTrait = document.getElementById('modal-character-hidden-trait');

    const modalSurvivalProgressBar = document.getElementById('modal-survival-progress-bar');
    const modalSurvivalPercentage = document.getElementById('modal-survival-percentage');
    const voteForCharacterBtn = document.getElementById('vote-for-character-btn');
    const modalCharacterVoteCount = document.getElementById('modal-character-vote-count');
    const modalAiChatName = document.getElementById('modal-ai-chat-name');
    const aiChatOutput = document.getElementById('ai-chat-output');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSendBtn = document.getElementById('ai-chat-send-btn');

    const currentYearSpan = document.getElementById('current-year');

    // Newsletter Form
    const newsletterForm = document.querySelector('form[name="newsletter-signup"]');
    const newsletterSuccessMessage = document.getElementById('newsletter-success-message');
    const newsletterErrorMessage = document.getElementById('newsletter-error-message');


    // --- State Variables ---
    let isAgeVerified = false;
    let isIslandEntered = false;
    let currentStoryCardIdx = 0;
    const AGE_VERIFIED_STORAGE_KEY = 'inland_game_age_verified_v1';
    let currentOpenCharacterId = null;
    let characterVoteUnsubscribe = null;

    // --- Character Data ---
    const characterData = {
        "aiden-cross": { name: "Aiden Cross", archetype: "The Strategic Player", portrait: "assets/images/characters/aiden_cross.jpg", fullImage: "assets/images/characters/aiden_cross.jpg", bio: "A master tactician haunted by a past failure...", hiddenTrait: "Suffers from recurring nightmares..." },
        "selene-ward": { name: "Selene Ward", archetype: "The Silent Survivor", portrait: "assets/images/characters/selene_ward.jpg", fullImage: "assets/images/characters/selene_ward.jpg", bio: "Quiet and observant, Selene moves like a ghost...", hiddenTrait: "Carries a memento from a past she refuses to speak of..." },
        "darius-cole": { name: "Darius Cole", archetype: "The Ex-Soldier", portrait: "assets/images/characters/darius_cole.jpg", fullImage: "assets/images/characters/darius_cole.jpg", bio: "Combat-hardened and disciplined, Darius operates with cold efficiency...", hiddenTrait: "Secretly writes poetry to cope with PTSD..." },
        "nina-reyes": { name: "Nina Reyes", archetype: "The Game Theorist", portrait: "assets/images/characters/nina_reyes.jpg", fullImage: "assets/images/characters/nina_reyes.jpg", bio: "Brilliant and analytical, Nina sees patterns everywhere...", hiddenTrait: "Has a gambling addiction that led her to make a desperate deal..." },
        "elara-vance": { name: "Elara Vance", archetype: "The Ethereal Wildcard", portrait: "assets/images/characters/elara_vance.jpg", fullImage: "assets/images/characters/elara_vance.jpg", bio: "Almost otherworldly, Elara seems to drift through the game...", hiddenTrait: "Claims to communicate with a 'presence' on the island..." },
        "kenji-tanaka": { name: "Kenji Tanaka", archetype: "The Quiet Technician", portrait: "assets/images/characters/kenji_tanaka.jpg", fullImage: "assets/images/characters/kenji_tanaka.jpg", bio: "Resourceful and ingenious, Kenji can MacGyver a solution...", hiddenTrait: "Is on the run from a powerful corporation..." },
        "isabelle-moreau": { name: "Isabelle Moreau", archetype: "The Idealistic Leader", portrait: "assets/images/characters/isabelle_moreau.jpg", fullImage: "assets/images/characters/isabelle_moreau.jpg", bio: "Charismatic and driven by a strong moral compass...", hiddenTrait: "Her idealism masks a deep-seated fear of failure..." },
        "chloe-kim": { name: "Chloe 'Glitch' Kim", archetype: "The Hacker", portrait: "assets/images/characters/chloe_kim.jpg", fullImage: "assets/images/characters/chloe_kim.jpg", bio: "Anti-establishment and whip-smart, Glitch sees the game as a system to be broken...", hiddenTrait: "Joined the game to expose its creators..." },
        "marcus-thorne": { name: "Marcus Thorne", archetype: "The Desperate Father", portrait: "assets/images/characters/marcus_thorne.jpg", fullImage: "assets/images/characters/marcus_thorne.jpg", bio: "Driven by the need to provide for his sick child...", hiddenTrait: "Is being blackmailed into participating..." },
        "masked-enforcer": { name: "The Masked Enforcer", archetype: "The Enigma", portrait: "assets/images/characters/masked_enforcer.jpg", fullImage: "assets/images/characters/masked_enforcer.jpg", bio: "A silent, imposing figure that ensures the rules are followed...", hiddenTrait: "Rumored to be a former player who 'ascended'..." }
    };

    // --- Utility Functions ---
    const showElement = (el) => {
        if (el) {
            el.style.visibility = 'visible';
            requestAnimationFrame(() => {
                 el.classList.add('visible');
            });
        } else { console.error("DEBUG: showElement called with null element for ID:", el ? el.id : 'unknown'); }
    };
    const hideElement = (el) => {
         if (el) {
            el.classList.remove('visible');
            const modalIds = ['age-gate-modal', 'character-modal'];
            if (modalIds.includes(el.id)) {
                const handleTransitionEnd = (event) => {
                    if (event.propertyName === 'opacity' && !el.classList.contains('visible')) {
                        el.style.visibility = 'hidden';
                        el.removeEventListener('transitionend', handleTransitionEnd);
                    }
                };
                el.addEventListener('transitionend', handleTransitionEnd);
            }
         } else { console.error("DEBUG: hideElement called with null element for ID:", el ? el.id : 'unknown'); }
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
        } else { console.warn("DEBUG: No story cards found."); }

        if (db) {
            characterCardWrappers.forEach(cardWrapper => {
                const characterId = cardWrapper.dataset.characterId;
                if (characterId) {
                    const progressBarContainer = cardWrapper.querySelector('.character-card-progress-bar-container');
                    if (progressBarContainer) progressBarContainer.style.display = 'block';
                    listenForMiniProgressBarUpdates(characterId, cardWrapper);
                }
            });
        }
    }

    // --- Age Gate Logic ---
    function openAgeGate() {
        if (ageGateModal) showElement(ageGateModal);
    }
    function closeAgeGate() {
        if (ageGateModal) hideElement(ageGateModal);
    }
    function handleAgeConfirmation(confirmed) {
        closeAgeGate();
        if (confirmed) {
            isAgeVerified = true;
            localStorage.setItem(AGE_VERIFIED_STORAGE_KEY, 'true');
            enterTheIsland();
        } else {
            alert("Access denied. You must be 18 or older to experience The Inland Game.");
        }
    }

    // --- Site Entry Logic ---
    function enterTheIsland() {
        if (isIslandEntered) return;
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
                    if (storyCards.length > 0) {
                        setTimeout(() => scrollStoryCardIntoView(currentStoryCardIdx), 300);
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
            const scrollAmount = (cardRect.left - viewportRect.left) - (viewportRect.width / 2) + (cardRect.width / 2);
            viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }

    // --- Character Modal Logic ---
    function openCharacterModal(characterId) {
        currentOpenCharacterId = characterId;
        const data = characterData[characterId];
        if (!data || !characterModal) { console.error("DEBUG: Char data or modal not found for ID:", characterId); return; }

        console.log("DEBUG: Opening modal for character:", characterId);

        if(modalCharacterImage) modalCharacterImage.src = data.fullImage || data.portrait;
        if(modalCharacterName) modalCharacterName.textContent = data.name;
        if(modalCharacterArchetype) modalCharacterArchetype.textContent = data.archetype;
        if(modalCharacterBio) modalCharacterBio.textContent = data.bio;
        if(modalAiChatName) modalAiChatName.textContent = data.name.split(' ')[0];

        if(modalCharacterHiddenTrait) {
            modalCharacterHiddenTrait.textContent = data.hiddenTrait;
            modalCharacterHiddenTrait.style.display = 'none';
        }
        if(revealTraitBtn) revealTraitBtn.style.display = 'block';
        
        if(aiChatOutput) {
            while(aiChatOutput.firstChild) { aiChatOutput.removeChild(aiChatOutput.firstChild); }
            const systemMessage = document.createElement('p');
            systemMessage.classList.add('ai-system-message');
            systemMessage.textContent = "[System: Connection re-established. Transmit your query.]";
            aiChatOutput.appendChild(systemMessage);
        }
        if(aiChatInput) { aiChatInput.value = ''; aiChatInput.disabled = false; }
        if(aiChatSendBtn) aiChatSendBtn.disabled = false;

        if (db) {
            listenForCharacterVotes(characterId);
        } else {
            updateCharacterVoteDisplay(characterId, 0);
            updateSurvivalProgressBar(characterId, 0);
        }

        characterModal.dataset.currentCharacterId = characterId;
        showElement(characterModal);
    }

    function closeCharacterModal() {
        if (!characterModal) return;
        console.log("DEBUG: Closing character modal");
        hideElement(characterModal);
        if (characterVoteUnsubscribe) {
            characterVoteUnsubscribe();
            characterVoteUnsubscribe = null;
        }
        currentOpenCharacterId = null;
    }

    // --- Voting Logic (with Firestore real-time updates) ---
    async function voteForCharacter(characterId) {
        if (!db) { alert("Voting system is currently unavailable."); return; }
        if (!characterId) return;
        
        const characterRef = db.collection('character_votes').doc(characterId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(characterRef);
                let newVoteCount = 1;
                if (doc.exists && doc.data() && doc.data().votes !== undefined) {
                    newVoteCount = doc.data().votes + 1;
                }
                transaction.set(characterRef, { votes: newVoteCount, name: characterData[characterId]?.name || characterId }, { merge: true });
            });
        } catch (error) {
            console.error("DEBUG: Error voting for character:", characterId, error);
            alert("There was an error submitting your vote.");
        }
    }

    function listenForCharacterVotes(characterId) {
        if (!db || !characterId) return;
        if (characterVoteUnsubscribe) characterVoteUnsubscribe();

        const characterRef = db.collection('character_votes').doc(characterId);
        characterVoteUnsubscribe = characterRef.onSnapshot(doc => {
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) {
                votes = doc.data().votes;
            }
            if (currentOpenCharacterId === characterId) {
                updateCharacterVoteDisplay(characterId, votes);
                updateSurvivalProgressBar(characterId, votes);
            }
            updateMiniProgressBarOnCard(characterId, votes);
        }, error => {
            console.error("DEBUG: Error in vote listener for", characterId, error);
        });
    }
    
    function updateCharacterVoteDisplay(characterId, votes) {
        if (modalCharacterVoteCount && currentOpenCharacterId === characterId) {
            modalCharacterVoteCount.textContent = votes;
        }
    }

    function updateSurvivalProgressBar(characterId, votes) {
        const maxExpectedVotes = 100;
        let percentage = (votes / maxExpectedVotes) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100);

        if (modalSurvivalProgressBar && currentOpenCharacterId === characterId) {
            modalSurvivalProgressBar.style.width = `${percentage}%`;
        }
        if (modalSurvivalPercentage && currentOpenCharacterId === characterId) {
            modalSurvivalPercentage.textContent = `${Math.round(percentage)}%`;
        }
    }

    function updateMiniProgressBarOnCard(characterId, votes) {
        const cardWrapper = document.querySelector(`.character-card-wrapper[data-character-id="${characterId}"]`);
        if (cardWrapper) {
            const progressBarContainer = cardWrapper.querySelector('.character-card-progress-bar-container');
            const progressBar = cardWrapper.querySelector('.character-card-progress-bar');
            if (progressBar && progressBarContainer) {
                const maxExpectedVotes = 100;
                let percentage = (votes / maxExpectedVotes) * 100;
                percentage = Math.min(Math.max(percentage, 0), 100);
                progressBar.style.width = `${percentage}%`;
                if (progressBarContainer.style.display === 'none') {
                     progressBarContainer.style.display = 'block';
                }
            }
        }
    }

    function listenForMiniProgressBarUpdates(characterId, cardWrapper) {
        if (!db || !characterId || !cardWrapper) return;
        const characterRef = db.collection('character_votes').doc(characterId);
        characterRef.onSnapshot(doc => {
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) {
                votes = doc.data().votes;
            }
            updateMiniProgressBarOnCard(characterId, votes);
        }, error => {
            console.error("DEBUG: Error in mini progress listener for", characterId, error);
        });
    }

    // --- AI Chat Logic ---
    function addMessageToChatOutput(message, sender, isThinking = false) {
        if (!aiChatOutput) return;
        const messageEl = document.createElement('p');
        const messageTypeClass = sender === 'user' ? 'user-message' : 'ai-response-message';
        messageEl.classList.add(messageTypeClass);
        if (isThinking) messageEl.classList.add('thinking');
        messageEl.textContent = message;
        aiChatOutput.appendChild(messageEl);
        aiChatOutput.scrollTop = aiChatOutput.scrollHeight;
        return messageEl;
    }

    async function sendChatMessageToAI(characterId, userMessage) {
        if (!userMessage.trim()) return;
        if (!characterId) { addMessageToChatOutput("[System Error: Character context lost.]", 'ai'); return; }

        addMessageToChatOutput(userMessage, 'user');
        if (aiChatInput) aiChatInput.value = '';
        if (aiChatInput) aiChatInput.disabled = true;
        if (aiChatSendBtn) aiChatSendBtn.disabled = true;

        const thinkingEl = addMessageToChatOutput("...", 'ai', true);

        try {
            const response = await fetch('/.netlify/functions/chatWithCharacter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId: characterId,
                    characterName: characterData[characterId]?.name || "Unknown Character",
                    prompt: userMessage,
                }),
            });

            if (thinkingEl) thinkingEl.remove();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown server error." }));
                throw new Error(`Server error: ${response.status}. ${errorData.message || ''}`);
            }
            const data = await response.json();
            addMessageToChatOutput(data.reply || "[System: No reply received.]", 'ai');
        } catch (error) {
            console.error("DEBUG: Error sending/receiving AI chat message:", error);
            if (thinkingEl) thinkingEl.remove();
            addMessageToChatOutput(`[System Error: Communication failed. ${error.message}]`, 'ai');
        } finally {
            if (aiChatInput) aiChatInput.disabled = false;
            if (aiChatSendBtn) aiChatSendBtn.disabled = false;
            if (aiChatInput) aiChatInput.focus();
        }
    }

    // --- Newsletter Form Submission ---
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (newsletterSuccessMessage) newsletterSuccessMessage.style.display = 'none';
            if (newsletterErrorMessage) newsletterErrorMessage.style.display = 'none';
            const formData = new FormData(newsletterForm);
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;

            try {
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(formData).toString(),
                });
                if (response.ok) {
                    if (newsletterSuccessMessage) newsletterSuccessMessage.style.display = 'block';
                    newsletterForm.reset();
                } else {
                    const errorText = await response.text();
                    if (newsletterErrorMessage) {
                        newsletterErrorMessage.textContent = `Submission failed. Server responded: ${response.status}. Please try again. Details: ${errorText}`;
                        newsletterErrorMessage.style.display = 'block';
                    }
                }
            } catch (error) {
                if (newsletterErrorMessage) {
                     newsletterErrorMessage.textContent = 'An error occurred. Please check your connection and try again.';
                     newsletterErrorMessage.style.display = 'block';
                }
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    } else { console.warn("DEBUG: Newsletter form not found."); }

    // --- Event Listeners Setup ---
    if (enterIslandCTA) enterIslandCTA.addEventListener('click', () => { if (isAgeVerified) enterTheIsland(); else openAgeGate(); });
    if (ageConfirmYesBtn) ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    if (ageConfirmNoBtn) ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    if (storyNextBtn) storyNextBtn.addEventListener('click', () => { if (currentStoryCardIdx < storyCards.length - 1) { currentStoryCardIdx++; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    if (storyPrevBtn) storyPrevBtn.addEventListener('click', () => { if (currentStoryCardIdx > 0) { currentStoryCardIdx--; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    
    characterCardWrappers.forEach(cardWrapper => {
        cardWrapper.addEventListener('click', (e) => {
            // Only open modal if the click target isn't a button INSIDE the card itself (if any were added)
            // For now, any click on the card wrapper (excluding internal buttons if they existed) opens modal.
            // The .character-reveal-btn is INSIDE .character-card-back, which is display:none
            // So, this simpler listener on the wrapper is fine.
            const characterId = cardWrapper.dataset.characterId;
            console.log("DEBUG: Character card wrapper clicked. ID:", characterId);
            if (characterId) {
                openCharacterModal(characterId);
            } else {
                console.error("DEBUG: Character ID not found on card wrapper:", cardWrapper);
            }
        });
    });

    if (characterModalCloseBtn) characterModalCloseBtn.addEventListener('click', closeCharacterModal);
    if (revealTraitBtn) {
        revealTraitBtn.addEventListener('click', () => {
            if (modalCharacterHiddenTrait && modalCharacterHiddenTrait.style.display === 'none') {
                modalCharacterHiddenTrait.style.display = 'block';
                revealTraitBtn.style.display = 'none';
                console.log("DEBUG: Hidden trait revealed for:", currentOpenCharacterId);
            }
        });
    }
    if (voteForCharacterBtn) voteForCharacterBtn.addEventListener('click', () => { if (currentOpenCharacterId) voteForCharacter(currentOpenCharacterId); });
    if (aiChatSendBtn) aiChatSendBtn.addEventListener('click', () => { if (currentOpenCharacterId && aiChatInput) sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value); });
    if (aiChatInput) aiChatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && currentOpenCharacterId) { e.preventDefault(); sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value); }});
    
    // --- Run Initialization ---
    initializeSite();
});