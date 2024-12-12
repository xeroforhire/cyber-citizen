// Core Game Logic

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

// Selection Sound Effect
const selectionSound = new Audio("audio/selection-sound.mp3");

function playSelectionSound() {
    selectionSound.volume = 0.7;
    selectionSound.currentTime = 0;
    selectionSound.play().catch(error => {
        console.error("Selection sound could not be played:", error);
    });
}

// Game Over Sound Effect
const gameOverSound = new Audio("audio/gameover-sound.mp3");

function playGameOverSound() {
    gameOverSound.volume = 0.8; // Adjust volume (0.0 to 1.0)
    gameOverSound.play().catch(error => {
        console.error("Game Over sound could not be played:", error);
    });
}

// Soundtrack
const soundtrack = new Audio("audio/game-soundtrack.mp3");

function playSoundtrack() {
    soundtrack.loop = true; // Ensures the track loops continuously
    soundtrack.volume = 0.5; // Adjust volume (0.0 to 1.0)
    soundtrack.play().catch(error => {
        console.error("Soundtrack could not be played:", error);
    });
}

function stopSoundtrack() {
    soundtrack.pause();
    soundtrack.currentTime = 0; // Reset to the beginning
}

const maxTurns = 10;
function checkTurnProgression() {
    turnCount++;
    if (turnCount >= maxTurns) {
        endGame("Turn Limit Ending: Time has run out. Your story in Rivers concludes.");
        return true; // Stops further progression
    }
    return false; // Continue the game
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

// Character Selection Profiles
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

function nextScenario() {
    if (checkGameOverConditions() || checkTurnProgression()) {
        return; // Stop the game if conditions are met
    }

    const randomIndex = Math.floor(Math.random() * scenarios.length);
    loadScenario(randomIndex);
    applyNaturalHealing();
    updateHUD();
}

// Game Initialization
function initializeGame() {
    // Show character selection screen at the beginning
    displayCharacterSelection();
}

// Character Selection Display
function displayCharacterSelection() {
    const characterContainer = document.getElementById("character-selection");
    characterContainer.innerHTML = ""; // Clear any existing content

    characterProfiles.forEach(character => {
        const button = document.createElement("button");
        button.textContent = `${character.name}: ${character.description}`;
        button.className = "character-button";
        button.onclick = () => selectCharacter(character.id);
        characterContainer.appendChild(button);
    });

    // Ensure only character selection is visible at the start
    characterContainer.style.display = "block";
    document.getElementById("game-container").style.display = "none";
}

// Updated Select Character Function
function selectCharacter(characterId) {
    const character = characterProfiles.find(c => c.id === characterId);
    if (!character) {
        console.error("Character not found:", characterId);
        return;
    }

    // Apply selected character's stats to the player
    Object.assign(player, character.stats);

    // Set character avatar
    setCharacterAvatar(characterId);

    // Hide character selection and start the game
    document.getElementById("character-selection").style.display = "none";
    document.getElementById("game-container").style.display = "block";

    // Start the game logic
    playSoundtrack();
    loadScenario(0); // Load the first scenario
    updateHUD();
}

// Add to HTML
// <div id="character-selection"></div>
// <div id="game-container" style="display: none;">
//     <!-- Game content here -->
// </div>


// Natural Healing and Addiction Reduction
function applyNaturalHealing() {
    const healingAmount = 0; // Health restored per turn
    const addictionReduction = 0; // Addiction reduced per turn

    if (player.health < 100) {
        player.health = Math.min(player.health + healingAmount, 100);
    }

    if (player.addiction > 2) {
        player.addiction = Math.max(player.addiction - addictionReduction, 1);
    }

    logAction(`Natural recovery: +${healingAmount} health, -${addictionReduction} addiction.`);
}

// Call applyNaturalHealing at the end of each scenario
function nextScenario() {
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    loadScenario(randomIndex);
    applyNaturalHealing();
    updateHUD();
}

// Trigger Ending
function endGame(message) {
    const overlay = document.getElementById("game-over-overlay");
    const messageElement = document.getElementById("game-over-message");

    // Display the calculated ending if no message is provided
    messageElement.textContent = message || calculateEnding();
    overlay.style.display = "flex"; // Show the overlay

    // Stop soundtrack if playing
    if (typeof stopSoundtrack === "function") stopSoundtrack();
}

// Dynamic Endgame Functionality
function endGame(message) {
    // Display the Game Over overlay
    const overlay = document.getElementById("game-over-overlay");
overlay.style.display = "flex"; // Should make the overlay visible
    const messageElement = document.getElementById("game-over-message");
    const resetButton = document.getElementById("reset-button");

    // Update the message and show the overlay
    messageElement.textContent = message || "Your journey ends here.";
    overlay.style.display = "flex";

    // Stop soundtrack if playing
    if (typeof stopSoundtrack === "function") stopSoundtrack();

    // Attach reset functionality
    resetButton.onclick = () => resetGame();
}

// Reset the Game
function resetGame() {
    // Reset player stats
    Object.assign(player, {
        morality: 50,
        infamy: 50,
        addiction: 0,
        health: 100,
        reputation: 0,
        tkPower: 0
    });

    // Hide the overlay
    const overlay = document.getElementById("game-over-overlay");
    overlay.style.display = "none";

    // Reset HUD and restart the game
    updateHUD();
    displayCharacterSelection(); // Return to character selection
}

function checkGameOverConditions() {
    if (player.health <= 0) {
        const reason = player.health < 0
            ? "You pushed your body beyond its limits, collapsing in the streets of Rivers."
            : "You succumbed to your injuries and could not survive in Rivers.";
        endGame(reason);
        return true;
    }

    if (player.addiction >= 100) {
        endGame("Addict Ending: Your addiction consumed you, leaving you lost in the virtual world.");
        return true;
    }
    {
        if (player.morality >= 80 && player.reputation >= 50) {
            return "Hero Ending: You became a symbol of hope, inspiring others to fight for justice.";
        }
    
        if (player.infamy >= 80 && player.reputation >= 50) {
            return "Villain Ending: You rose to power through fear and manipulation, becoming a legend of darkness.";
        }
    
        if (player.morality >= 50 && player.infamy >= 50) {
            return "Grey Ending: You navigated the fine line between good and evil, leaving an ambiguous legacy.";
        }
    
        if (player.reputation >= 100) {
            return "Legend Ending: Your influence reshaped Rivers, and your name will be remembered forever.";
        }
        if (player.turnCount = 30) {
        return "Survivor Ending: You survived in Rivers, but your story ends as just another citizen struggling to live.";
        }
    }
    return false; // Game continues
}

// Scenarios and Outcomes
const scenarios = [
    // Morality vs. Infamy
    {
        id: "scenario_vendor",
        text: "You encounter a street vendor selling boosters. What do you do?",
        leftCaption: "Buy something",
        rightCaption: "Walk away",
        leftEffect: () => {
            player.infamy += 3;
            player.addiction += 30;
            return "You bought some boosters, boosting your infamy but increasing your addiction.";
        },
        rightEffect: () => {
            player.morality += 2;
            return "You avoided trouble and preserved your morality.";
        },
    },
    {
        id: "scenario_citizen_rescue",
        text: "You come across a citizen trapped under debris. Do you risk your safety to help them?",
        leftCaption: "Help them",
        rightCaption: "Keep moving",
        leftEffect: () => {
            player.morality += 4;
            player.health -= 15;
            return "You rescued the citizen, greatly increasing your morality but taking damage.";
        },
        rightEffect: () => {
            player.infamy += 15;
            return "You left them behind, saving yourself but losing respect.";
        },
    },

    // Survival and Resource Management
    {
        id: "scenario_package",
        text: "A suspicious package lies in front of you. Do you open it?",
        leftCaption: "Leave it alone",
        rightCaption: "Open the package",
        leftEffect: () => {
            player.health += 5;
            player.morality -= 1;
            return "You avoided potential danger but lost an opportunity to gain influence.";
        },
        rightEffect: () => {
            player.infamy += 2;
            player.health -= 20;
            return "The package contained toxic material. You gained infamy but took damage.";
        },
    },
    {
        id: "scenario_neighbor_help",
        text: "A neighbor asks for your help during a blackout. Do you assist?",
        leftCaption: "Try to fix it",
        rightCaption: "Stay home",
        leftEffect: () => {
            player.morality += 10;
            player.health -= 10;
            return "You helped restore power but injured yourself in the process.";
        },
        rightEffect: () => {
            player.infamy += 2;
            return "You stayed safe but lost respect among your neighbors.";
        },
    },

    // VR Addiction and Temptation
    {
        id: "scenario_vr_offer",
        text: "A vendor offers free VR sessions. Do you accept?",
        leftCaption: "Decline",
        rightCaption: "Accept",
        leftEffect: () => {
            player.health += 5;
            player.morality += 5;
            return "You avoided the temptation and preserved your health.";
        },
        rightEffect: () => {
            player.addiction += 20;
            player.infamy += 10;
            return "The VR session was addictive, increasing your addiction and infamy.";
        },
    },
    {
        id: "scenario_hacker_vr",
        text: "A hacker offers to share hidden N.E.O. secrets in VR. Do you log in?",
        leftCaption: "Log in",
        rightCaption: "Ignore the offer",
        leftEffect: () => {
            player.infamy += 7;
            player.addiction += 10;
            return "You gained valuable secrets but at the cost of addiction.";
        },
        rightEffect: () => {
            player.morality += 5;
            return "You ignored the hacker, keeping your conscience clear.";
        },
    },

    // Rebellion and Risk
    {
        id: "scenario_rebel_meeting",
        text: "Someone gives you a flyer about a rebellion meeting. Do you go?",
        leftCaption: "Attend the meeting",
        rightCaption: "Ignore it",
        leftEffect: () => {
            player.infamy += 4;
            player.addiction += 5;
            return "You attended the meeting, gaining rebel allies but increasing your addiction.";
        },
        rightEffect: () => {
            player.health += 5;
            player.morality += 2;
            return "You stayed away, keeping yourself safe and clear-headed.";
        },
    },
    {
        id: "scenario_neighbor_spy",
        text: "An officer orders you to report a neighbor’s suspicious activity. Do you comply?",
        leftCaption: "Report them",
        rightCaption: "Refuse",
        leftEffect: () => {
            player.infamy += 10;
            return "You reported your neighbor, gaining infamy among locals.";
        },
        rightEffect: () => {
            player.morality += 3;
            player.reputation -= 3;
            return "You refused to comply, showing moral strength but losing favor with authorities.";
        },
    },

    // Text-Based Combat Simulations
    {
        id: "scenario_street_punks",
        text: "You encounter a group of street punks harassing civilians. What do you do?",
        leftCaption: "Confront them",
        rightCaption: "Walk away",
        leftEffect: () => {
            const success = Math.random() > 0.5; // 30% chance to win
            if (success) {
                player.reputation += 5;
                player.morality += 2;
                return "You confronted the street punks and successfully stopped them, gaining reputation and morality.";
            } else {
                player.health -= 20;
                return "The street punks fought back, injuring you. You lost health but gained moral respect.";
            }
        },
        rightEffect: () => {
            player.infamy += 4;
            return "You avoided the fight, but your reputation suffered.";
        },
    },
    {
        id: "scenario_neo_patrol",
        text: "A N.E.O. patrol is chasing rebels in your area. What do you do?",
        leftCaption: "Intervene",
        rightCaption: "Hide",
        leftEffect: () => {
            const success = Math.random() > 0.5; // 15% chance to win
            if (success) {
                player.reputation += 15;
                player.morality += 6;
                return "You successfully disrupted the N.E.O. patrol, saving the rebels and gaining respect.";
            } else {
                player.health -= 25;
                return "The N.E.O. patrol retaliated, injuring you severely. You gained moral respect but lost health.";
            }
        },
        rightEffect: () => {
            player.infamy += 4;
            return "You hid and avoided confrontation, but your reputation took a hit.";
        },
    }
];

// DOM Elements
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
// Update HUD
function updateHUD() {
    statsElements.morality.textContent = player.morality;
    statsElements.infamy.textContent = player.infamy;
    statsElements.addiction.textContent = player.addiction;
    statsElements.health.textContent = player.health;
    statsElements.reputation.textContent = player.reputation;
    statsElements.tkPower.textContent = player.tkPower;
}

// Log Actions
function logAction(message) {
    const newLogEntry = document.createElement("li");
    newLogEntry.textContent = message;
    logEntries.prepend(newLogEntry);
    if (logEntries.children.length > 3) {
        logEntries.removeChild(logEntries.lastChild);
    }
}

// Load a Scenario
function loadScenario(index) {
    const scenario = scenarios[index];
    scenarioText.textContent = scenario.text;
    choiceLeftButton.textContent = scenario.leftCaption;
    choiceRightButton.textContent = scenario.rightCaption;

      // Update the scenario text
      scenarioText.textContent = scenario.text;

      // Update choice buttons with actions and sound effects
      choiceLeftButton.textContent = scenario.leftCaption;
      choiceLeftButton.onclick = () => {
          playSelectionSound(); // Play sound effect
          logAction(scenario.leftEffect());
          nextScenario(); // Load the next scenario
      };
  
      choiceRightButton.textContent = scenario.rightCaption;
      choiceRightButton.onclick = () => {
          playSelectionSound(); // Play sound effect
          logAction(scenario.rightEffect());
          nextScenario(); // Load the next scenario
      };
  }

// Randomize and Load Next Scenario
function nextScenario() {
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    loadScenario(randomIndex);
    updateHUD();
}
// Update endGame Function to Include Sound
function endGame(message) {
    // Play Game Over sound
    playGameOverSound();

    // Display Game Over message
    const endingMessage = message || calculateEnding();
    logAction(endingMessage);
    scenarioText.textContent = "Game Over";

    // Disable buttons to prevent further actions
    choiceLeftButton.disabled = true;
    choiceRightButton.disabled = true;

    // Stop soundtrack if playing
    if (typeof stopSoundtrack === "function") stopSoundtrack();
}

// Add Conditions to Check After Each Scenario
function checkGameOverConditions() {
    if (player.health <= 0) {
        endGame("Game Over: You succumbed to your injuries and could not survive in Rivers.");
        return true;
    }

    if (player.addiction >= 100) {
        endGame("Addict Ending: Your addiction consumed you, leaving you lost in the virtual world.");
        return true;
    }

    return false; // Game continues
}

// Call checkGameOverConditions in Scenario Progression
function nextScenario() {
    if (checkGameOverConditions()) {
        return; // Stop further progression if game is over
    }

    // Proceed to the next scenario
    const randomIndex = Math.floor(Math.random() * scenarios.length);
    loadScenario(randomIndex);
    applyNaturalHealing(); // Apply health and addiction recovery
    updateHUD(); // Update stats on screen
}

// Initialize Game
function initializeGame() {
    playSoundtrack();
    logAction("Welcome to Rivers. Survive and thrive.");
    updateHUD();
    nextScenario();
}

displayCharacterSelection();

initializeGame();
window.onload = initializeGame;
