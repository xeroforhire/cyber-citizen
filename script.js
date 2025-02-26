// Global Variables
let turnCount = 0;
const maxTurns = 30;

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
    const healingAmount = 3;       // Adjust as needed
    const addictionReduction = 1;  // Adjust as needed

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

// Hard-Coded Scenarios Array
let scenarios = [
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
    // Additional hard-coded scenarios can go here.
];

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

// Check if Game Over Conditions Are Met, Including Win Conditions
function checkGameOverConditions() {
    if (player.health <= 0) {
        endGame("Game Over: You succumbed to your injuries and could not survive in Rivers.");
        return true;
    }
    if (player.addiction >= 100) {
        endGame("Addict Ending: Your addiction consumed you, leaving you lost in the virtual world.");
        return true;
    }
    // Win conditions:
    if (player.morality >= 100) {
        endGame("Hero Ending: Your unwavering morality has made you a local hero in Rivers.");
        return true;
    }
    if (player.infamy >= 100) {
        endGame("Criminal Ending: Your notorious actions have branded you as a criminal.");
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
    displayCharacterSelection();
}

// ---------------------------------------------------------
// Inline XML Scenarios
// ---------------------------------------------------------

const inlineXML = `<?xml version="1.0" encoding="UTF-8"?>
<scenarios>
  <scenario>
    <id>scenario_vendor</id>
    <text>You encounter a street vendor selling boosters. What do you do?</text>
    <leftCaption>Buy something</leftCaption>
    <rightCaption>Walk away</rightCaption>
    <leftEffect><![CDATA[
      player.infamy += 3;
      player.addiction += 30;
      return "You bought boosters, increasing your infamy and addiction.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.morality += 2;
      return "You avoided trouble and preserved your morality.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_citizen_rescue</id>
    <text>You see a citizen trapped under debris. Do you help?</text>
    <leftCaption>Help them</leftCaption>
    <rightCaption>Keep moving</rightCaption>
    <leftEffect><![CDATA[
      player.morality += 4;
      player.health -= 15;
      return "You rescued the citizen, increasing your morality but taking damage.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.infamy += 15;
      return "You left them behind, saving yourself but losing respect.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_package</id>
    <text>A suspicious package lies in front of you. Do you open it?</text>
    <leftCaption>Leave it alone</leftCaption>
    <rightCaption>Open it</rightCaption>
    <leftEffect><![CDATA[
      player.health += 5;
      player.morality -= 1;
      return "You avoided potential danger, but lost an opportunity.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.infamy += 2;
      player.health -= 20;
      return "The package was toxic! You gained infamy but took damage.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_neighbor_help</id>
    <text>A neighbor asks for help during a blackout. What do you do?</text>
    <leftCaption>Assist them</leftCaption>
    <rightCaption>Ignore them</rightCaption>
    <leftEffect><![CDATA[
      player.morality += 10;
      player.health -= 10;
      return "You helped restore power, increasing your morality but hurting yourself.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.infamy += 2;
      return "You ignored the neighbor, slightly increasing your infamy.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_vr_offer</id>
    <text>A vendor offers free VR sessions. Do you accept?</text>
    <leftCaption>Decline</leftCaption>
    <rightCaption>Accept</rightCaption>
    <leftEffect><![CDATA[
      player.health += 5;
      player.morality += 5;
      return "You declined, preserving your health and morality.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.addiction += 20;
      player.infamy += 10;
      return "The VR session was addictive, increasing your addiction and infamy.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_hacker_vr</id>
    <text>A hacker offers you secret information in VR. Do you log in?</text>
    <leftCaption>Log in</leftCaption>
    <rightCaption>Ignore</rightCaption>
    <leftEffect><![CDATA[
      player.infamy += 7;
      player.addiction += 10;
      return "You logged in, gaining secrets at the cost of increased addiction.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.morality += 5;
      return "You ignored the offer, preserving your moral standing.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_rebel_meeting</id>
    <text>You receive a flyer for a rebel meeting. Do you attend?</text>
    <leftCaption>Attend</leftCaption>
    <rightCaption>Ignore</rightCaption>
    <leftEffect><![CDATA[
      player.infamy += 4;
      player.addiction += 5;
      return "You attended the meeting, gaining allies but increasing your addiction.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.health += 5;
      player.morality += 2;
      return "You stayed away, preserving your health and morality.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_neighbor_spy</id>
    <text>An officer orders you to spy on a neighbor. What do you do?</text>
    <leftCaption>Report them</leftCaption>
    <rightCaption>Refuse</rightCaption>
    <leftEffect><![CDATA[
      player.infamy += 10;
      return "You reported your neighbor, increasing your infamy.";
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.morality += 3;
      player.reputation -= 3;
      return "You refused to report, boosting your morality but lowering your reputation.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_street_punks</id>
    <text>You encounter street punks harassing civilians. What do you do?</text>
    <leftCaption>Confront them</leftCaption>
    <rightCaption>Walk away</rightCaption>
    <leftEffect><![CDATA[
      const success = Math.random() > 0.5;
      if (success) {
          player.reputation += 5;
          player.morality += 2;
          return "You confronted and stopped them, gaining reputation and morality.";
      } else {
          player.health -= 20;
          return "They fought back and injured you.";
      }
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.infamy += 4;
      return "You walked away, but your reputation suffered.";
    ]]></rightEffect>
  </scenario>

  <scenario>
    <id>scenario_neo_patrol</id>
    <text>A N.E.O. patrol is chasing rebels nearby. What do you do?</text>
    <leftCaption>Intervene</leftCaption>
    <rightCaption>Hide</rightCaption>
    <leftEffect><![CDATA[
      const success = Math.random() > 0.5;
      if (success) {
          player.reputation += 15;
          player.morality += 6;
          return "You intervened successfully, gaining reputation and moral standing.";
      } else {
          player.health -= 25;
          return "The patrol retaliated, injuring you.";
      }
    ]]></leftEffect>
    <rightEffect><![CDATA[
      player.infamy += 4;
      return "You hid, and your infamy increased slightly.";
    ]]></rightEffect>
  </scenario>
</scenarios>`;

// Function to load scenarios from an inline XML string
function loadScenariosFromXMLString(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    const scenarioNodes = xmlDoc.getElementsByTagName("scenario");
    const loadedScenarios = [];
    for (let i = 0; i < scenarioNodes.length; i++) {
        const node = scenarioNodes[i];
        const id = node.getElementsByTagName("id")[0]?.textContent.trim() || "";
        const text = node.getElementsByTagName("text")[0]?.textContent.trim() || "";
        const leftCaption = node.getElementsByTagName("leftCaption")[0]?.textContent.trim() || "";
        const rightCaption = node.getElementsByTagName("rightCaption")[0]?.textContent.trim() || "";
        const leftEffectStr = node.getElementsByTagName("leftEffect")[0]?.textContent.trim() || "";
        const rightEffectStr = node.getElementsByTagName("rightEffect")[0]?.textContent.trim() || "";

        // Create effect functions from code strings.
        let leftEffect = () => "";
        let rightEffect = () => "";
        try {
            leftEffect = new Function("player", leftEffectStr);
        } catch (e) {
            console.error("Error creating leftEffect for scenario", id, e);
        }
        try {
            rightEffect = new Function("player", rightEffectStr);
        } catch (e) {
            console.error("Error creating rightEffect for scenario", id, e);
        }

        loadedScenarios.push({
            id: id,
            text: text,
            leftCaption: leftCaption,
            rightCaption: rightCaption,
            leftEffect: function() { return leftEffect(player); },
            rightEffect: function() { return rightEffect(player); }
        });
    }
    // Append loaded scenarios to the existing scenarios array
    scenarios.push(...loadedScenarios);
    console.log("Loaded scenarios from XML string:", loadedScenarios);
}

// ---------------------------------------------------------
// Initialization
// ---------------------------------------------------------

// When the window loads, show the character selection screen and load inline XML scenarios.
window.onload = () => {
    displayCharacterSelection();
    // Load additional scenarios from the inline XML string.
    loadScenariosFromXMLString(inlineXML);
};
