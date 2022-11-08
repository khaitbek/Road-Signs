// SELECT DOM ELEMENTS
const greetingSection = document.querySelector("#greeting")
const greetingBtn = document.querySelector("#greetingBtn");
const credentialSection = document.querySelector("#credentials");
const credentialForm = credentialSection.querySelector("#credentialsForm");
const startGameBtn = document.querySelector("#startGameBtn");
const gameSection = document.querySelector("#game");
const gameDifficulty = document.querySelector("#gameDifficulty");
const gameDuration = document.querySelector("#gameDuration");
const gameList = document.querySelector("#gameList");
const gameCardTemplate = document.querySelector("#gameTemplate").content;
const currentQuestion = document.querySelector("#currentQuestion");
const attempts = document.querySelector("#attempts");
const victorySection = document.querySelector("#victorySection");
const gameOverSection = document.querySelector("#gameOver");
const restartBtns = document.querySelectorAll("#restartBtn");
const successAudio = new Audio("./audios/malades.mp3");
const failAudio = new Audio("./audios/error.mp3");
const gameOverAudio = new Audio("./audios/tugadi.ogg");
const winningAudio = new Audio("./audios/congrats.mp3");
const GameDurationText = document.querySelector("#duration");
const gameScore = document.querySelector("#gameScore");
const finalScore = document.querySelector("#finalScore");

// GLOBAL VARIABLES
const uniqueSigns = [];
const previousQuestions = [];
const SUCCESS_CLASS_NAME = "success";
const FAIL_CLASS_NAME = "fail";

// COUNTERS
let counter = 5;
let score = 0;

// EVENT LISTENERS
greetingBtn.addEventListener("click", () => {
    greetingSection.classList.add("close");
    closeSection(greetingSection, "close", "show");
    showCredentials();
})

gameList.addEventListener("click", (e) => {
    const targetElem = e.target;
    if (targetElem.matches("#gameItem")) {
        pauseAllAudios();
        const elemId = Number(targetElem.dataset.id);
        const isCorrectAnswer = roadSymbols.find(symbol => symbol.id === elemId).symbol_title === currentQuestion.textContent.trim()
        if (isCorrectAnswer) {
            triggerSuccess(targetElem);
            changeFailedItems("#gameItem");
            const foundedSymbolIndex = uniqueSigns.findIndex(sign => sign.id === elemId);
            removeQuestion(foundedSymbolIndex);
        } else {
            triggerFailure(targetElem);
            decrementAttempts();
            if (counter === 0) {
                endGame("lost");
            };
        }
    }
})

credentialForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const interval = Number(gameDuration.value) * 60;
    getMinutesAndSeconds(interval);
    startGame();
})

restartBtns.forEach(restartBtn => {
    restartBtn.addEventListener("click", pageReload);
});

// FUNCTIONS

function getMinutesAndSeconds(interval) {
    setInterval(() => {
        let seconds = Math.floor(interval % 60);
        let minutes = Math.floor(interval / 60);
        if (seconds < 0) {
            return endGame("lost");
        };
        GameDurationText.textContent = minutesAndSecondsToString(seconds, minutes);
        interval--;
    }, 1000);
}

function getStarterMinutesAndSeconds(interval){
    const seconds = Math.floor(interval % 60);
    const minutes = Math.floor(interval / 60);
    GameDurationText.textContent = minutesAndSecondsToString(seconds,minutes);
}

function minutesAndSecondsToString(seconds, minutes) {
    let minutesToString = minutes >= 10 ? `${minutes}` : `0${minutes}`;
    let secondsToString = seconds >= 10 ? `${seconds}` : `0${seconds}`;
    return `${minutesToString}:${secondsToString}`;
}

function decrementAttempts() {
    counter--;
    updateAttemptsText(counter);
}

function endGame(result) {
    if (result === "win") {
        closeSection(gameSection, "close", "show");
        playAudio(winningAudio);
        return displaySection(victorySection, "show", "close");
    }
    playAudio(gameOverAudio);
    closeSection(gameSection, "close", "show"); displaySection(gameOverSection, "show", "close");
}

function pageReload() {
    window.location.reload();
}

function triggerSuccess(elem) {
    score += 2;
    updateScore();
    playAudio(successAudio);
    elem.classList.add(`${SUCCESS_CLASS_NAME}`);
    elem.addEventListener("transitionend", () => {
        elem.classList.add("hidden");
    })
    window.scrollTo(0, 300);
}

function updateScore(){
    gameScore.textContent = `Score: ${score}`;
    finalScore.textContent = `Final score: ${score}`;
}

function triggerFailure(elem) {
    score--;
    updateScore();
    playAudio(failAudio);
    elem.classList.add(`${FAIL_CLASS_NAME}`);
}

function changeFailedItems(selector) {
    const items = document.querySelectorAll(`${selector}`);
    items.forEach(item => item.classList.remove(`${FAIL_CLASS_NAME}`));
}

function removeQuestion(index) {
    uniqueSigns.splice(index, 1);
    gameList.style.pointerEvents = "none";
    chooseRandomQuestion(uniqueSigns);
    setTimeout(() => {
        gameList.style.pointerEvents = "all";
    }, 2500);
}

function showCredentials() {
    displaySection(credentialSection, "show", "close");
}

function startGame() {
    closeSection(credentialSection, "close", "show");
    displaySection(gameSection, "show", "close");
    const symbols = getSignsByLevel(gameDifficulty.value);
    chooseRandomQuestion(symbols);
    renderSigns(shuffleArray(symbols), gameList);
}

function closeSection(section, classToAdd, classToRemove) {
    section.classList.add(classToAdd);
    section.classList.remove(classToRemove);
}

function displaySection(section, classToAdd, classToRemove) {
    section.classList.remove(classToRemove);
    section.classList.add(classToAdd);
}

function chooseRandomQuestion(questions) {
    let randomNumber = Math.floor(Math.random()) * questions.length;
    
    while (previousQuestions.includes(randomNumber)) {
        randomNumber = Math.floor(Math.random()) * questions.length;
    }
    if (!questions[randomNumber]) {
        return endGame("win");
    }
    const newQuestion = questions[randomNumber].symbol_title;
    currentQuestion.textContent = newQuestion;
}

function shuffleArray(array) {
    const copiedArray = [...array];
    for (let i = 0; i < copiedArray.length; i++) {
        const j = Math.floor(Math.random() * (i + 1));
        [copiedArray[i], copiedArray[j]] = [copiedArray[j], copiedArray[i]];
    }
    return copiedArray;
}

function renderSigns(signs, list) {
    const signsFragment = new DocumentFragment();
    list.innerHTML = "";
    signs.forEach(sign => {
        const card = gameCardTemplate.cloneNode(true).children[0];
        card.querySelector("#gameImg").src = sign.symbol_img;
        signsFragment.appendChild(card);
        card.dataset.id = sign.id;
    })
    list.appendChild(signsFragment);
}

function getSignsByLevel(level) {
    const uniqueNumbers = [];
    let numberOfSignsToRender = 0;
    // const numberOfSignsToRender = level === "easy" ? 15 : level === "medium" ? 30 : 45
    if (level === "easy") {
        numberOfSignsToRender = 15;
    } else if (level === "medium") {
        numberOfSignsToRender = 30;
    } else {
        numberOfSignsToRender = 45;
    }

    for (let i = 0; i < numberOfSignsToRender; i++) {
        let randomNumber = Math.floor(Math.random() * roadSymbols.length);
        while (uniqueNumbers.includes(randomNumber)) {
            randomNumber = Math.floor(Math.random() * roadSymbols.length);
        }
        uniqueSigns.push(roadSymbols[randomNumber]);
        uniqueNumbers.push(randomNumber);
    }
    return uniqueSigns;
}

function resetCounter() {
    counter = 5;
    updateAttemptsText(counter);
}

function updateAttemptsText(numberOfAttempts) {
    attempts.textContent = `${numberOfAttempts} attempts left`;
}

function greeting() {
    closeSection(gameSection, "close", "show");
    displaySection(greetingSection, "show", "close");
    resetCounter();
    renderSigns(shuffleArray(getSignsByLevel(gameDifficulty.value)), gameList);
}

function playAudio(audio) {
    pauseAllAudios();
    audio.play();
}

function pauseAllAudios() {
    successAudio.pause();
    failAudio.pause();
    winningAudio.pause();
    gameOverAudio.pause();
}

// function calls
getStarterMinutesAndSeconds(Number(gameDuration.value) * 60);