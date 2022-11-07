// select dom elements
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
const uniqueSigns = [];
const previousQuestions = [];
let counter = 5;

// event listeners
greetingBtn.addEventListener("click", () => {
    greetingSection.classList.add("close");
    greeting();
})

gameList.addEventListener("click", (e) => {
    const targetElem = e.target;
    if (targetElem.matches("#gameItem")) {
        const elemId = Number(targetElem.dataset.id);
        if (roadSymbols.find(symbol => symbol.id === elemId).symbol_title === currentQuestion.textContent.trim()) {
            targetElem.classList.add("success");
            targetElem.addEventListener("transitionend",()=>{
                targetElem.classList.add("hidden");
            })
            document.querySelectorAll("#gameItem").forEach(item => {
                item.classList.remove("fail");
            })
            const foundedSymbolIndex = uniqueSigns.findIndex(sign => sign.id === elemId);
            uniqueSigns.splice(foundedSymbolIndex,1);
            chooseRandomQuestion(uniqueSigns);
        } else {
            counter--;
            attempts.textContent = `${counter} attempts left`;
            if(counter === 0){
                alert("Loser!");
                greeting();
            };
            targetElem.classList.add("fail");
        }
    }
})

credentialForm.addEventListener("submit", (e) => {
    e.preventDefault();
    credentialSection.classList.add("close");
    startGame();
})

// functions
function greeting() {
    credentialSection.classList.add("show");
}

function startGame() {
    credentialSection.classList.remove("show");
    credentialSection.classList.add("close");
    gameSection.classList.add("start");
    const symbols = getSignsByLevel(gameDifficulty.value);
    chooseRandomQuestion(symbols);
    renderSigns(shuffleArray(symbols),gameList);
}

function chooseRandomQuestion(questions){
    let randomNumber = Math.floor(Math.random()) * questions.length;
    console.log(randomNumber);
    while(previousQuestions.includes(randomNumber)){
        randomNumber = Math.floor(Math.random()) * questions.length;
    }
    if(!questions[randomNumber]){
        alert("You win");
        return
    }
    const newQuestion = questions[randomNumber].symbol_title;
    currentQuestion.textContent = newQuestion;
}

function shuffleArray(array){
    const copiedArray = [...array];
    for(let i = 0; i < copiedArray.length; i++){
        const j = Math.floor(Math.random() * (i + 1));
        [copiedArray[i],copiedArray[j]] = [copiedArray[j],copiedArray[i]];
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
    const numberOfSignsToRender = level === "easy" ? 15 : level === "medium" ? 30 : 45

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

function generateRandomSign() { }