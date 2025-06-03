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

    // New Modal UI Elements (Voting, Progress, AI Chat)
    const modalSurvivalProgressBar = document.getElementById('modal-survival-progress-bar');
    const modalSurvivalPercentage = document.getElementById('modal-survival-percentage');
    const voteForCharacterBtn = document.getElementById('vote-for-character-btn');
    const modalCharacterVoteCount = document.getElementById('modal-character-vote-count');
    const modalAiChatName = document.getElementById('modal-ai-chat-name');
    const aiChatOutput = document.getElementById('ai-chat-output');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiChatSendBtn = document.getElementById('ai-chat-send-btn');

    const currentYearSpan = document.getElementById('current-year');

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
        }
    };
    const hideElement = (el) => {
         if (el) {
            el.classList.remove('visible');
            const modalIds = ['age-gate-modal', 'character-modal'];
            if (modalIds.includes(el.id)) {
                el.addEventListener('transitionend', () => {
                    if (!el.classList.contains('visible')) {
                        el.style.visibility = 'hidden';
                    }
                }, { once: true });
            }
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
        } else { console.warn("DEBUG: No story cards found."); }

        if (db) { // Only set up listeners if Firestore is initialized
            characterCardWrappers.forEach(cardWrapper => {
                const characterId = cardWrapper.dataset.characterId;
                if (characterId) {
                    listenForMiniProgressBarUpdates(characterId, cardWrapper);
                }
            });
        }
    }

    // --- Age Gate Logic ---
    function openAgeGate() {
        if (ageGateModal) {
            ageGateModal.style.visibility = 'visible';
            requestAnimationFrame(() => showElement(ageGateModal));
        }
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
        if (!data || !characterModal) { console.error("Char data/modal error for", characterId); return; }

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
        
        if(aiChatOutput) aiChatOutput.innerHTML = '<p class="ai-system-message">[System: Connection established. Ask your question.]</p>';
        if(aiChatInput) aiChatInput.value = '';

        if (db) {
            listenForCharacterVotes(characterId); // Start listening for real-time updates
        } else {
            updateCharacterVoteDisplay(characterId, 0); // Fallback if DB not ready
            updateSurvivalProgressBar(characterId, 0);  // Fallback if DB not ready
        }

        characterModal.dataset.currentCharacterId = characterId;
        characterModal.style.visibility = 'visible';
        requestAnimationFrame(() => showElement(characterModal));
    }

    function closeCharacterModal() {
        if (!characterModal) return;
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
                if (doc.exists && doc.data().votes !== undefined) { // Check if doc exists and votes field is there
                    newVoteCount = doc.data().votes + 1;
                }
                transaction.set(characterRef, { votes: newVoteCount, name: characterData[characterId]?.name || characterId }, { merge: true });
            });
            console.log(`DEBUG: Vote successful for ${characterId}. Listener will update UI.`);
        } catch (error) {
            console.error("DEBUG: Error voting for character:", characterId, error);
            alert("There was an error submitting your vote.");
        }
    }

    function listenForCharacterVotes(characterId) {
        if (!db || !characterId) return;
        if (characterVoteUnsubscribe) characterVoteUnsubscribe(); // Unsubscribe from previous

        const characterRef = db.collection('character_votes').doc(characterId);
        characterVoteUnsubscribe = characterRef.onSnapshot(doc => {
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) {
                votes = doc.data().votes;
            }
            console.log(`DEBUG: Real-time votes for ${characterId}: ${votes}`);
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
        const maxExpectedVotes = 100; // This should be a more dynamic value or based on total votes etc.
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
                const maxExpectedVotes = 100; // Consistent logic with modal
                let percentage = (votes / maxExpectedVotes) * 100;
                percentage = Math.min(Math.max(percentage, 0), 100);
                progressBar.style.width = `${percentage}%`;
                if (progressBarContainer.style.display === 'none') { // Show if hidden
                    progressBarContainer.style.display = 'block';
                }
            }
        }
    }

    function listenForMiniProgressBarUpdates(characterId, cardWrapper) {
        if (!db || !characterId || !cardWrapper) return;
        const characterRef = db.collection('character_votes').doc(characterId);
        // This listener might become redundant if openCharacterModal always starts a listener
        // However, it's good for initializing cards on page load.
        const unsubscribe = characterRef.onSnapshot(doc => { // Store unsubscribe locally if needed, or rely on modal closing
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) {
                votes = doc.data().votes;
            }
            updateMiniProgressBarOnCard(characterId, votes);
        }, error => {
            console.error("DEBUG: Error in mini progress listener for", characterId, error);
        });
        // To prevent memory leaks with many listeners, you might want a way to unsubscribe these
        // when the element is no longer relevant or page unloads, but for now this is okay for init.
    }

    // --- AI Chat Logic (Placeholders) ---
    function addMessageToChatOutput(message, sender) {
        if (!aiChatOutput) return;
        const messageEl = document.createElement('p');
        messageEl.classList.add(sender === 'user' ? 'user-message' : 'ai-response-message');
        messageEl.textContent = message;
        aiChatOutput.appendChild(messageEl);
        aiChatOutput.scrollTop = aiChatOutput.scrollHeight;
    }

    async function sendChatMessageToAI(characterId, userMessage) {
        if (!userMessage.trim()) return;
        addMessageToChatOutput(userMessage, 'user');
        if(aiChatInput) aiChatInput.value = '';
        addMessageToChatOutput("...", 'ai'); // Thinking indicator

        // TODO: Netlify Function call to Google Studio AI
        setTimeout(() => {
            const characterName = characterData[characterId]?.name || "the character";
            const aiResponse = `This is a placeholder AI response for ${characterName} regarding: "${userMessage}". Real AI integration coming soon!`;
            const thinkingMessages = aiChatOutput.querySelectorAll('.ai-response-message');
            const lastThinkingMessage = thinkingMessages.length ? thinkingMessages[thinkingMessages.length -1] : null;

            if(lastThinkingMessage && lastThinkingMessage.textContent === '...') {
                lastThinkingMessage.textContent = aiResponse;
            } else { addMessageToChatOutput(aiResponse, 'ai'); }
        }, 1500);
    }

    // --- Event Listeners ---
    if (enterIslandCTA) enterIslandCTA.addEventListener('click', () => { if (isAgeVerified) enterTheIsland(); else openAgeGate(); });
    if (ageConfirmYesBtn) ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    if (ageConfirmNoBtn) ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    if (storyNextBtn) storyNextBtn.addEventListener('click', () => { if (currentStoryCardIdx < storyCards.length - 1) { currentStoryCardIdx++; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    if (storyPrevBtn) storyPrevBtn.addEventListener('click', () => { if (currentStoryCardIdx > 0) { currentStoryCardIdx--; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    
    characterCardWrappers.forEach(cardWrapper => {
        const revealButton = cardWrapper.querySelector('.character-reveal-btn');
        const clickableElement = revealButton || cardWrapper; // Prefer button if exists
        clickableElement.addEventListener('click', (e) => {
            e.stopPropagation();
            const characterId = cardWrapper.dataset.characterId;
            if (characterId) openCharacterModal(characterId);
        });
    });

    if (characterModalCloseBtn) characterModalCloseBtn.addEventListener('click', closeCharacterModal);
    if (revealTraitBtn) {
        revealTraitBtn.addEventListener('click', () => {
            if (modalCharacterHiddenTrait && modalCharacterHiddenTrait.style.display === 'none') {
                modalCharacterHiddenTrait.style.display = 'block';
                revealTraitBtn.style.display = 'none';
            }
        });
    }
    if (voteForCharacterBtn) voteForCharacterBtn.addEventListener('click', () => { if (currentOpenCharacterId) voteForCharacter(currentOpenCharacterId); });
    if (aiChatSendBtn) aiChatSendBtn.addEventListener('click', () => { if (currentOpenCharacterId && aiChatInput) sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value); });
    if (aiChatInput) aiChatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && currentOpenCharacterId) sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value); });

    // --- Run Initialization ---
    initializeSite();
});