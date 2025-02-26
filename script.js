// Global Variables
let turnCount = 0;
const maxTurns = 10;

// Initial Player Stats
const player = {
    morality: 50,
    infamy: 50,
    addiction: 0,
    health: 100,
    reputation: 0,
    tkPower: 0,
    inventory: {
        healingPack: 1,
        smokeBomb: 1,
        adrenalineShot: 1
    }
};

// Audio Elements and Functions
const selectionSound = new Audio("audio/selection-sound.mp3");
function playSelectionSound() {
    selectionSound.volume = 0.7;
    selectionSound.currentTime = 0;
    selectionSound.play().catch(error => {
        console.error("Selection sound could not be played:", error);
    });
}

const gameOverSound = new Audio("audio/gameover-sound.mp3");
function playGameOverSound() {
    gameOverSound.volume = 0.8;
    gameOverSound.play().catch(error => {
        console.error("Game Over sound could not be played:", error);
    });
}

const soundtrack = new Audio("audio/game-soundtrack.mp3");
function playSoundtrack() {
    soundtrack.loop = true;
    soundtrack.volume = 0.5;
    soundtrack.play().catch(error => {
        console.error("Soundtrack could not be played:", error);
    });
}
function stopSoundtrack() {
    soundtrack.pause();
    soundtrack.currentTime = 0;
}

// Character Avatars
const characterAvatars = {
    citizen: "images/citizen-avatar.png",
    activist: "images/activist-avatar.png",
    opportunist: "images/opportunist-avatar.png",
    tk_specialist: "images/tk-specialist-avatar.png"
};

function setCharacterAvatar(characterId) {
    const avatarContainer = document.getElementById("character-avatar");
    const avatarSrc = characterAvatars[characterId];
    if (avatarSrc) {
        avatarContainer.innerHTML = `<img src="${avatarSrc}" alt="Avatar for ${characterId}" class="avatar-image">`;
    } else {
        console.error("Avatar not found for character:", characterId);
    }
}

// Character Profiles
const characterProfiles = [
    {
        id: "citizen",
        name: "Citizen",
        description: "An average person trying to survive in Rivers.",
        stats: { morality: 50, infamy: 50, addiction: 0, health: 100, reputation: 0 }
    },
    {
        id: "activist",
        name: "Activist",
        description: "A rebel fighting for justice and change.",
        stats: { morality: 70, infamy: 30, addiction: 10, health: 90, reputation: 10 }
    },
    {
        id: "opportunist",
        name: "Opportunist",
        description: "A pragmatic individual looking out for themselves.",
        stats: { morality: 30, infamy: 70, addiction: 5, health: 80, reputation: 5 }
    },
    {
        id: "tk_specialist",
        name: "TK Specialist",
        description: "A telekinetic individual with unique powers.",
        stats: { morality: 50, infamy: 50, addiction: 20, health: 90, reputation: 15, tkPower: 10 }
    }
];

// Display Character Selection Screen
function displayCharacterSelection() {
    const characterContainer = document.getElementById("character-selection");
    characterContainer.innerHTML = ""; // Clear previous content

    characterProfiles.forEach(character => {
        const button = document.createElement("button");
        button.textContent = `${character.name}: ${character.description}`;
        button.className = "character-button";
        button.onclick = () => selectCharacter(character.id);
        characterContainer.appendChild(button);
    });
    // Show character selection and hide game container
    document.getElementById("character-selection").style.display = "block";
    document.getElementById("game-container").style.display = "none";
}

// Select a Character and Start the Game
function selectCharacter(characterId) {
    const character = characterProfiles.find(c => c.id === characterId);
    if (!character) {
        console.error("Character not found:", characterId);
        return;
    }
    // Update player stats with selected character stats
    Object.assign(player, character.stats);
    setCharacterAvatar(characterId);
    // Hide character selection and show game container
    document.getElementById("character-selection").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    // Start game logic
    playSoundtrack();
    loadScenario(0); // Start with the first scenario
    updateHUD();
}

// Natural Healing and Addiction Reduction (Per Turn)
function applyNaturalHealing() {
    const healingAmount = 0;       // Adjust as needed
    const addictionReduction = 0;  // Adjust as needed

    if (player.health < 100) {
        player.health = Math.min(player.health + healingAmount, 100);
    }
    if (player.addiction > 2) {
        player.addiction = Math.max(player.addiction - addictionReduction, 1);
    }
    logAction(`Natural recovery: +${healingAmount} health, -${addictionReduction} addiction.`);
}

// Check Turn Progression
function checkTurnProgression() {
    turnCount++;
    if (turnCount >= maxTurns) {
        endGame("Turn Limit Ending: Time has run out. Your story in Rivers concludes.");
        return true;
    }
    return false;
}

// Scenarios Array
const scenarios = [
    {
        id: "scenario_vendor",
        text: "You encounter a street vendor selling boosters. What do you do?",
        leftCaption: "Buy something",
        rightCaption: "Walk away",
        leftEffect: () => {
            player.infamy += 3;
            player.addiction += 30;
            return "You bought boosters, increasing your infamy and addiction.";
        },
        rightEffect: () => {
            player.morality += 2;
            return "You avoided trouble and preserved your morality.";
        }
    },
    {
        id: "scenario_citizen_rescue",
        text: "You come across a citizen trapped under debris. Do you risk your safety to help them?",
        leftCaption: "Help them",
        rightCaption: "Keep moving",
        leftEffect: () => {
            player.morality += 4;
            player.health -= 15;
            return "You rescued the citizen, increasing your morality but taking damage.";
        },
        rightEffect: () => {
            player.infamy += 15;
            return "You left them behind, saving yourself but losing respect.";
        }
    }
    // Add additional scenarios as needed...
];

// Load a Scenario (by Index)
function loadScenario(index) {
    const scenario = scenarios[index];
    scenarioText.textContent = scenario.text;
    choiceLeftButton.textContent = scenario.leftCaption;
    choiceRightButton.textContent = scenario.rightCaption;

    // Attach event handlers for choices
    choiceLeftButton.onclick = () => {
        playSelectionSound();
        logAction(scenario.leftEffect());
        nextScenario();
    };
    choiceRightButton.onclick = () => {
        playSelectionSound();
        logAction(scenario.rightEffect());
        nextScenario();
    };
}

// Check if Game Over Conditions Are Met
function checkGameOverConditions() {
    if (player.health <= 0) {
        endGame("Game Over: You succumbed to your injuries and could not survive in Rivers.");
        return true;
    }
    if (player.addiction >= 100) {
        endGame("Addict Ending: Your addiction consumed you, leaving you lost in the virtual world.");
        return true;
    }
    return false;
}

// Advance to the Next Scenario
function nextScenario() {
    if (checkGameOverConditions() || checkTurnProgression()) {
        return;
    }
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    loadScenario(randomIndex);
    applyNaturalHealing();
    updateHUD();
}

// Update Heads-Up Display (HUD)
function updateHUD() {
    statsElements.morality.textContent = player.morality;
    statsElements.infamy.textContent = player.infamy;
    statsElements.addiction.textContent = player.addiction;
    statsElements.health.textContent = player.health;
    statsElements.reputation.textContent = player.reputation;
    statsElements.tkPower.textContent = player.tkPower;
}

// Log Actions to the Action Log
function logAction(message) {
    const newLogEntry = document.createElement("li");
    newLogEntry.textContent = message;
    logEntries.prepend(newLogEntry);
    if (logEntries.children.length > 3) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

// End Game Functionality
function endGame(message) {
    playGameOverSound();
    const overlay = document.getElementById("game-over-overlay");
    const messageElement = document.getElementById("game-over-message");
    messageElement.textContent = message || "Your journey ends here.";
    overlay.style.display = "flex";
    stopSoundtrack();
    // Disable choice buttons
    choiceLeftButton.disabled = true;
    choiceRightButton.disabled = true;
    // Attach reset functionality
    document.getElementById("reset-button").onclick = resetGame;
}

// Reset Game to Initial State
function resetGame() {
    // Reset player stats and turn count
    Object.assign(player, {
        morality: 50,
        infamy: 50,
        addiction: 0,
        health: 100,
        reputation: 0,
        tkPower: 0,
        inventory: {
            healingPack: 1,
            smokeBomb: 1,
            adrenalineShot: 1
        }
    });
    turnCount = 0;
    document.getElementById("game-over-overlay").style.display = "none";
    updateHUD();
    // Show character selection screen to start a new game
    displayCharacterSelection();
}

// Cache DOM Elements for Efficiency
const statsElements = {
    morality: document.getElementById("morality"),
    infamy: document.getElementById("infamy"),
    addiction: document.getElementById("addiction"),
    health: document.getElementById("health"),
    reputation: document.getElementById("reputation"),
    tkPower: document.getElementById("tk-power")
};
const scenarioText = document.getElementById("scenario-text");
const choiceLeftButton = document.getElementById("choice-left");
const choiceRightButton = document.getElementById("choice-right");
const logEntries = document.getElementById("log-entries");

// Initialize Game (Called after character selection)
function initializeGame() {
    playSoundtrack();
    logAction("Welcome to Rivers. Survive and thrive.");
    updateHUD();
    nextScenario();
}

// Start with character selection when window loads
window.onload = () => {
    displayCharacterSelection();
};
