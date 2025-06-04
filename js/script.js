// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    console.log("DEBUG: Inland Game - DOMContentLoaded - Full Script with Firebase Compat & Oracle");

    // Firebase config is now expected to be globally available
    let app;
    let db; 

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
    const aiChatOutput = document.getElementById('ai-chat-output'); // For Character Modal
    const aiChatInput = document.getElementById('ai-chat-input');   // For Character Modal
    const aiChatSendBtn = document.getElementById('ai-chat-send-btn'); // For Character Modal

    const currentYearSpan = document.getElementById('current-year');

    const newsletterForm = document.querySelector('form[name="newsletter-signup"]');
    const newsletterSuccessMessage = document.getElementById('newsletter-success-message');
    const newsletterErrorMessage = document.getElementById('newsletter-error-message');

    // NEW: Island Oracle Chat Elements
    const oracleChatOutput = document.getElementById('oracle-chat-output');
    const oracleChatInput = document.getElementById('oracle-chat-input');
    const oracleChatSendBtn = document.getElementById('oracle-chat-send-btn');
    const oracleStatusLight = document.querySelector('.oracle-status .status-light');


    // --- State Variables ---
    let isAgeVerified = false;
    let isIslandEntered = false;
    let currentStoryCardIdx = 0;
    const AGE_VERIFIED_STORAGE_KEY = 'inland_game_age_verified_v1';
    let currentOpenCharacterId = null;
    let characterVoteUnsubscribe = null;

    // --- Character Data (Ensure this is complete and matches your HTML data-character-id values) ---
    const characterData = {
        "aiden-cross": { name: "Aiden Cross", archetype: "The Strategic Player", portrait: "assets/images/characters/aiden_cross.jpg", fullImage: "assets/images/characters/aiden_cross.jpg", bio: "A master tactician haunted by a past failure...", hiddenTrait: "Suffers from recurring nightmares..." },
        "selene-ward": { name: "Selene Ward", archetype: "The Silent Survivor", portrait: "assets/images/characters/selene_ward.jpg", fullImage: "assets/images/characters/selene_ward.jpg", bio: "Quiet and observant, Selene moves like a ghost...", hiddenTrait: "Carries a memento from a past she refuses to speak of..." },
        "darius-cole": { name: "Darius Cole", archetype: "The Ex-Soldier", portrait: "assets/images/characters/darius_cole.jpg", fullImage: "assets/images/characters/darius_cole.jpg", bio: "Combat-hardened and disciplined...", hiddenTrait: "Secretly writes poetry..." },
        "nina-reyes": { name: "Nina Reyes", archetype: "The Game Theorist", portrait: "assets/images/characters/nina_reyes.jpg", fullImage: "assets/images/characters/nina_reyes.jpg", bio: "Brilliant and analytical...", hiddenTrait: "Has a gambling addiction..." },
        "elara-vance": { name: "Elara Vance", archetype: "The Ethereal Wildcard", portrait: "assets/images/characters/elara_vance.jpg", fullImage: "assets/images/characters/elara_vance.jpg", bio: "Almost otherworldly...", hiddenTrait: "Claims to communicate with a 'presence'..." },
        "kenji-tanaka": { name: "Kenji Tanaka", archetype: "The Quiet Technician", portrait: "assets/images/characters/kenji_tanaka.jpg", fullImage: "assets/images/characters/kenji_tanaka.jpg", bio: "Resourceful and ingenious...", hiddenTrait: "Is on the run from a powerful corporation..." },
        "isabelle-moreau": { name: "Isabelle Moreau", archetype: "The Idealistic Leader", portrait: "assets/images/characters/isabelle_moreau.jpg", fullImage: "assets/images/characters/isabelle_moreau.jpg", bio: "Charismatic and driven by a strong moral compass...", hiddenTrait: "Her idealism masks a deep-seated fear of failure..." },
        "chloe-kim": { name: "Chloe 'Glitch' Kim", archetype: "The Hacker", portrait: "assets/images/characters/chloe_kim.jpg", fullImage: "assets/images/characters/chloe_kim.jpg", bio: "Anti-establishment and whip-smart...", hiddenTrait: "Joined the game to expose its creators..." },
        "marcus-thorne": { name: "Marcus Thorne", archetype: "The Desperate Father", portrait: "assets/images/characters/marcus_thorne.jpg", fullImage: "assets/images/characters/marcus_thorne.jpg", bio: "Driven by the need to provide for his sick child...", hiddenTrait: "Is being blackmailed..." },
        "masked-enforcer": { name: "The Masked Enforcer", archetype: "The Enigma", portrait: "assets/images/characters/masked_enforcer.jpg", fullImage: "assets/images/characters/masked_enforcer.jpg", bio: "A silent, imposing figure...", hiddenTrait: "Rumored to be a former player..." }
    };

    // --- Utility Functions ---
    const showElement = (el) => {
        if (el) {
            el.style.visibility = 'visible';
            requestAnimationFrame(() => {
                 el.classList.add('visible');
            });
        } else { console.error("DEBUG: showElement called with null for an element."); }
    };
    const hideElement = (el) => {
         if (el) {
            el.classList.remove('visible');
            const modalIds = ['age-gate-modal', 'character-modal']; // Add other modal IDs if any
            if (modalIds.includes(el.id)) {
                const handleTransitionEnd = (event) => {
                    if (event.propertyName === 'opacity' && !el.classList.contains('visible')) {
                        el.style.visibility = 'hidden';
                        el.removeEventListener('transitionend', handleTransitionEnd);
                    }
                };
                el.addEventListener('transitionend', handleTransitionEnd);
            }
         } else { console.error("DEBUG: hideElement called with null for an element.");}
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
                    if (progressBarContainer) progressBarContainer.style.display = 'block'; // Make sure it's visible to be updated
                    listenForMiniProgressBarUpdates(characterId, cardWrapper);
                }
            });
        }
    }

    // --- Age Gate Logic ---
    function openAgeGate() {
        if (ageGateModal) showElement(ageGateModal); else console.error("DEBUG: ageGateModal not found to open.");
    }
    function closeAgeGate() {
        if (ageGateModal) hideElement(ageGateModal); else console.error("DEBUG: ageGateModal not found to close.");
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
    function updateStoryNavigation() { /* ... (same as your provided version) ... */ 
        if (!storyPrevBtn || !storyNextBtn || !storyCardIndicator || storyCards.length === 0) return;
        storyCardIndicator.textContent = `${currentStoryCardIdx + 1} / ${storyCards.length}`;
        storyPrevBtn.disabled = currentStoryCardIdx === 0;
        storyNextBtn.disabled = currentStoryCardIdx === storyCards.length - 1;
        if (storyCompletionMessage) {
            storyCompletionMessage.style.display = (currentStoryCardIdx === storyCards.length - 1) ? 'block' : 'none';
        }
    }
    function scrollStoryCardIntoView(index) { /* ... (same as your provided version) ... */ 
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
    function openCharacterModal(characterId) { /* ... (same as your provided version, ensure aiChatOutput reset is good) ... */
        currentOpenCharacterId = characterId;
        const data = characterData[characterId];
        if (!data || !characterModal) { console.error("DEBUG: Char data or modal not found for ID:", characterId); return; }
        console.log("DEBUG: Opening modal for character:", characterId);

        if(modalCharacterImage) modalCharacterImage.src = data.fullImage || data.portrait;
        if(modalCharacterName) modalCharacterName.textContent = data.name;
        if(modalCharacterArchetype) modalCharacterArchetype.textContent = data.archetype;
        if(modalCharacterBio) modalCharacterBio.textContent = data.bio;
        if(modalAiChatName) modalAiChatName.textContent = data.name.split(' ')[0];
        if(modalCharacterHiddenTrait) { modalCharacterHiddenTrait.textContent = data.hiddenTrait; modalCharacterHiddenTrait.style.display = 'none';}
        if(revealTraitBtn) revealTraitBtn.style.display = 'block';
        if(aiChatOutput) { // Clear previous messages more thoroughly
            while(aiChatOutput.firstChild) { aiChatOutput.removeChild(aiChatOutput.firstChild); }
            addMessageToChatOutput("[System: Connection re-established. Transmit your query.]", 'system', false, aiChatOutput); // Use specific add function
        }
        if(aiChatInput) { aiChatInput.value = ''; aiChatInput.disabled = false; }
        if(aiChatSendBtn) aiChatSendBtn.disabled = false;
        if (db) { listenForCharacterVotes(characterId);
        } else { updateCharacterVoteDisplay(characterId, 0); updateSurvivalProgressBar(characterId, 0); }
        characterModal.dataset.currentCharacterId = characterId;
        showElement(characterModal);
    }
    function closeCharacterModal() { /* ... (same as your provided version) ... */
        if (!characterModal) return;
        console.log("DEBUG: Closing character modal");
        hideElement(characterModal);
        if (characterVoteUnsubscribe) { characterVoteUnsubscribe(); characterVoteUnsubscribe = null; }
        currentOpenCharacterId = null;
    }

    // --- Voting Logic ---
    async function voteForCharacter(characterId) { /* ... (same as your provided version) ... */ 
        if (!db) { alert("Voting system is currently unavailable."); return; }
        if (!characterId) return;
        const characterRef = db.collection('character_votes').doc(characterId);
        try {
            await db.runTransaction(async (transaction) => {
                const doc = await transaction.get(characterRef);
                let newVoteCount = 1;
                if (doc.exists && doc.data() && doc.data().votes !== undefined) { newVoteCount = doc.data().votes + 1; }
                transaction.set(characterRef, { votes: newVoteCount, name: characterData[characterId]?.name || characterId }, { merge: true });
            });
        } catch (error) { console.error("DEBUG: Error voting for character:", characterId, error); alert("There was an error submitting your vote.");}
    }
    function listenForCharacterVotes(characterId) { /* ... (same as your provided version) ... */ 
        if (!db || !characterId) return;
        if (characterVoteUnsubscribe) characterVoteUnsubscribe();
        const characterRef = db.collection('character_votes').doc(characterId);
        characterVoteUnsubscribe = characterRef.onSnapshot(doc => {
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) { votes = doc.data().votes; }
            if (currentOpenCharacterId === characterId) { updateCharacterVoteDisplay(characterId, votes); updateSurvivalProgressBar(characterId, votes); }
            updateMiniProgressBarOnCard(characterId, votes);
        }, error => { console.error("DEBUG: Error in vote listener for", characterId, error); });
    }
    function updateCharacterVoteDisplay(characterId, votes) { /* ... (same as your provided version) ... */ 
        if (modalCharacterVoteCount && currentOpenCharacterId === characterId) { modalCharacterVoteCount.textContent = votes; }
    }
    function updateSurvivalProgressBar(characterId, votes) { /* ... (same as your provided version) ... */ 
        const maxExpectedVotes = 100; let percentage = (votes / maxExpectedVotes) * 100;
        percentage = Math.min(Math.max(percentage, 0), 100);
        if (modalSurvivalProgressBar && currentOpenCharacterId === characterId) { modalSurvivalProgressBar.style.width = `${percentage}%`; }
        if (modalSurvivalPercentage && currentOpenCharacterId === characterId) { modalSurvivalPercentage.textContent = `${Math.round(percentage)}%`; }
    }
    function updateMiniProgressBarOnCard(characterId, votes) { /* ... (same as your provided version) ... */ 
        const cardWrapper = document.querySelector(`.character-card-wrapper[data-character-id="${characterId}"]`);
        if (cardWrapper) {
            const progressBarContainer = cardWrapper.querySelector('.character-card-progress-bar-container');
            const progressBar = cardWrapper.querySelector('.character-card-progress-bar');
            if (progressBar && progressBarContainer) {
                const maxExpectedVotes = 100; let percentage = (votes / maxExpectedVotes) * 100;
                percentage = Math.min(Math.max(percentage, 0), 100);
                progressBar.style.width = `${percentage}%`;
                if (progressBarContainer.style.display === 'none') { progressBarContainer.style.display = 'block'; }
            }
        }
    }
    function listenForMiniProgressBarUpdates(characterId, cardWrapper) { /* ... (same as your provided version) ... */ 
        if (!db || !characterId || !cardWrapper) return;
        const characterRef = db.collection('character_votes').doc(characterId);
        characterRef.onSnapshot(doc => {
            let votes = 0;
            if (doc.exists && doc.data() && doc.data().votes !== undefined) { votes = doc.data().votes; }
            updateMiniProgressBarOnCard(characterId, votes);
        }, error => { console.error("DEBUG: Error in mini progress listener for", characterId, error);});
    }

    // --- Character AI Chat Logic (Reusing addMessageToChatOutput & sendChatMessageToAI) ---
    // Ensure addMessageToChatOutput and sendChatMessageToAI are defined as in your provided script
    function addMessageToChatOutput(message, sender, isThinking = false, outputArea = aiChatOutput) { // Added outputArea param
        if (!outputArea) return;
        const messageEl = document.createElement('p');
        let messageTypeClass;
        if (outputArea === aiChatOutput) { // Character Chat
            messageTypeClass = sender === 'user' ? 'user-message' : 'ai-response-message';
        } else { // Oracle Chat
            messageTypeClass = sender === 'user' ? 'user-query' : 'oracle-response';
        }
        messageEl.classList.add(messageTypeClass);

        if (isThinking) messageEl.classList.add('thinking');
        messageEl.textContent = message;
        outputArea.appendChild(messageEl);
        outputArea.scrollTop = outputArea.scrollHeight;
        return messageEl;
    }

    async function sendChatMessageToAI(characterId, userMessage, outputArea = aiChatOutput, inputEl = aiChatInput, sendBtn = aiChatSendBtn, isOracle = false) { // Added params
        if (!userMessage.trim()) return;
        if (!characterId && !isOracle) { addMessageToChatOutput("[System Error: Character context lost.]", 'ai', false, outputArea); return; }
        if (isOracle && !characterId) characterId = "default"; // For oracle, use default personality

        addMessageToChatOutput(isOracle ? `> ${userMessage}` : userMessage, 'user', false, outputArea);
        if (inputEl) inputEl.value = '';
        if (inputEl) inputEl.disabled = true;
        if (sendBtn) sendBtn.disabled = true;
        if (isOracle && oracleStatusLight) oracleStatusLight.classList.remove('online');

        const thinkingMessage = isOracle ? "Oracle processing query..." : "...";
        const thinkingEl = addMessageToChatOutput(thinkingMessage, isOracle ? 'oracle' : 'ai', true, outputArea);

        try {
            const response = await fetch('/.netlify/functions/chatWithCharacter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    characterId: characterId,
                    characterName: isOracle ? "The Island Oracle" : (characterData[characterId]?.name || "Unknown Character"),
                    prompt: userMessage,
                }),
            });

            if (thinkingEl) thinkingEl.remove();

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown server error." }));
                throw new Error(`Server error: ${response.status}. ${errorData.message || ''}`);
            }
            const data = await response.json();
            const replyMessage = data.reply || (isOracle ? "[Oracle remains silent...]" : "[System: No reply received.]");
            addMessageToChatOutput(replyMessage, isOracle ? 'oracle' : 'ai', false, outputArea);
        } catch (error) {
            console.error("DEBUG: Error sending/receiving AI/Oracle message:", error);
            if (thinkingEl) thinkingEl.remove();
            addMessageToChatOutput(`[System Error: Communication failed. ${error.message}]`, isOracle ? 'system' : 'ai', false, outputArea);
        } finally {
            if (inputEl) inputEl.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            if (isOracle && oracleStatusLight) oracleStatusLight.classList.add('online');
            if (inputEl) inputEl.focus();
        }
    }
    
    // --- Newsletter Form Submission (Keep existing) ---
    if (newsletterForm) { /* ... (same as your provided version) ... */ 
        newsletterForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (newsletterSuccessMessage) newsletterSuccessMessage.style.display = 'none';
            if (newsletterErrorMessage) newsletterErrorMessage.style.display = 'none';
            const formData = new FormData(newsletterForm);
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;
            try {
                const response = await fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(formData).toString() });
                if (response.ok) { if (newsletterSuccessMessage) newsletterSuccessMessage.style.display = 'block'; newsletterForm.reset(); } 
                else { const errorText = await response.text(); if (newsletterErrorMessage) { newsletterErrorMessage.textContent = `Submission failed. Server: ${response.status}. ${errorText}`; newsletterErrorMessage.style.display = 'block';}}
            } catch (error) { if (newsletterErrorMessage) { newsletterErrorMessage.textContent = 'An error occurred. Check connection.'; newsletterErrorMessage.style.display = 'block';}} 
            finally { if(submitButton) submitButton.disabled = false; }
        });
    } else { console.warn("DEBUG: Newsletter form not found."); }

    // --- Event Listeners Setup ---
    // Hero & Age Gate
    if (enterIslandCTA) enterIslandCTA.addEventListener('click', () => { if (isAgeVerified) enterTheIsland(); else openAgeGate(); });
    if (ageConfirmYesBtn) ageConfirmYesBtn.addEventListener('click', () => handleAgeConfirmation(true));
    if (ageConfirmNoBtn) ageConfirmNoBtn.addEventListener('click', () => handleAgeConfirmation(false));
    // Story Cards
    if (storyNextBtn) storyNextBtn.addEventListener('click', () => { if (currentStoryCardIdx < storyCards.length - 1) { currentStoryCardIdx++; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    if (storyPrevBtn) storyPrevBtn.addEventListener('click', () => { if (currentStoryCardIdx > 0) { currentStoryCardIdx--; scrollStoryCardIntoView(currentStoryCardIdx); updateStoryNavigation(); }});
    // Character Cards & Modal
    characterCardWrappers.forEach(cardWrapper => {
        cardWrapper.addEventListener('click', (e) => {
            const characterId = cardWrapper.dataset.characterId;
            console.log("DEBUG: Character card wrapper clicked. ID:", characterId, "Clicked on:", e.target);
            // Check if the click was on the button itself or directly on the card (but not on interactive elements within the back if it were visible)
            if (e.target.closest('.character-reveal-btn') || !e.target.closest('.character-card-back')) { // Allow click on front or button
                 if (characterId) openCharacterModal(characterId);
                 else console.error("DEBUG: Character ID not found on card wrapper:", cardWrapper);
            }
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
    // Character Modal Interactions
    if (voteForCharacterBtn) voteForCharacterBtn.addEventListener('click', () => { if (currentOpenCharacterId) voteForCharacter(currentOpenCharacterId); });
    if (aiChatSendBtn) aiChatSendBtn.addEventListener('click', () => { if (currentOpenCharacterId && aiChatInput) sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value, aiChatOutput, aiChatInput, aiChatSendBtn, false); });
    if (aiChatInput) aiChatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter' && currentOpenCharacterId) { e.preventDefault(); sendChatMessageToAI(currentOpenCharacterId, aiChatInput.value, aiChatOutput, aiChatInput, aiChatSendBtn, false); }});
    
    // NEW: Island Oracle Event Listeners
    if (oracleChatSendBtn) {
        oracleChatSendBtn.addEventListener('click', () => {
            if (oracleChatInput) sendChatMessageToAI("default", oracleChatInput.value, oracleChatOutput, oracleChatInput, oracleChatSendBtn, true);
        });
    } else { console.warn("DEBUG: Oracle chat send button not found."); }

    if (oracleChatInput) {
        oracleChatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); 
                sendChatMessageToAI("default", oracleChatInput.value, oracleChatOutput, oracleChatInput, oracleChatSendBtn, true);
            }
        });
    } else { console.warn("DEBUG: Oracle chat input not found."); }
    
    // --- Run Initialization ---
    initializeSite();
    console.log("DEBUG: Inland Game - Script fully loaded and initialized with Oracle logic.");
});