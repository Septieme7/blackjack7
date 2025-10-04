// Variables du jeu
let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let tokens = 100;
let currentBet = 0;
let gameStarted = false;
let soundMuted = false;
let firstInteraction = true;

// Sons
const sounds = {
    cardFlip: new Audio('Assets/sounds/card-flip.mp3'),
    win: new Audio('Assets/sounds/win.mp3'),
    lose: new Audio('Assets/sounds/lose.mp3'),
    deal: new Audio('Assets/sounds/deal.mp3'),
    chip: new Audio('Assets/sounds/chip.mp3'),
    tie: new Audio('Assets/sounds/tie.mp3'),
    welcome: new Audio('Assets/sounds/welcome.mp3')
};

// Fonction pour jouer un son
function playSound(soundName) {
    if (sounds[soundName] && !soundMuted) {
        sounds[soundName].currentTime = 0;
        sounds[soundName].play().catch(e => console.log('Erreur audio:', e));
    }
}

// Fonction pour le son de bienvenue
function playWelcomeSound() {
    if (firstInteraction) {
        playSound('welcome');
        firstInteraction = false;
    }
}

// Toggle mute
function toggleMute() {
    soundMuted = !soundMuted;
    const icon = muteBtn.querySelector('span');
    icon.textContent = soundMuted ? '🔇' : '🔊';
}

// Toggle fullscreen
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log('Erreur fullscreen:', err);
        });
    } else {
        document.exitFullscreen();
    }
}

// Éléments DOM
const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerScoreSpan = document.getElementById('player-score');
const dealerScoreSpan = document.getElementById('dealer-score');
const messageDiv = document.getElementById('message');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const newGameBtn = document.getElementById('new-game-btn');
const dealBtn = document.getElementById('deal-btn');
const tokensCountSpan = document.getElementById('tokens-count');
const currentBetSpan = document.getElementById('current-bet');
const bet10Btn = document.getElementById('bet-10');
const bet20Btn = document.getElementById('bet-20');
const bet50Btn = document.getElementById('bet-50');
const bet100Btn = document.getElementById('bet-100');
const bet200Btn = document.getElementById('bet-200');
const clearBetBtn = document.getElementById('clear-bet');
const muteBtn = document.getElementById('mute-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');

// Événements
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
newGameBtn.addEventListener('click', resetGame);
dealBtn.addEventListener('click', dealCards);
bet10Btn.addEventListener('click', () => { playWelcomeSound(); placeBet(10); });
bet20Btn.addEventListener('click', () => { playWelcomeSound(); placeBet(20); });
bet50Btn.addEventListener('click', () => { playWelcomeSound(); placeBet(50); });
bet100Btn.addEventListener('click', () => { playWelcomeSound(); placeBet(100); });
bet200Btn.addEventListener('click', () => { playWelcomeSound(); placeBet(200); });
clearBetBtn.addEventListener('click', clearBet);
muteBtn.addEventListener('click', toggleMute);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Initialiser le jeu
initGame();

function initGame() {
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
    updateTokensDisplay();
    messageDiv.innerHTML = 'Place ta mise pour commencer ! <span style="font-size: 1.8em;">💰</span>';
    messageDiv.className = 'message';
}

// Mise
function placeBet(amount) {
    if (gameStarted) {
        messageDiv.textContent = 'Partie en cours ! Termine d\'abord.';
        return;
    }

    if (tokens >= amount) {
        tokens -= amount;
        currentBet += amount;
        playSound('chip');
        updateTokensDisplay();
        messageDiv.innerHTML = `Mise de ${currentBet} jetons. Clique sur Distribuer ! <span style="font-size: 1.8em;">🎲</span>`;
    } else {
        messageDiv.innerHTML = 'Pas assez de jetons ! C pas la FDJ ici... <span style="font-size: 1.8em;">😢</span>';
    }
}

function clearBet() {
    if (gameStarted) {
        messageDiv.textContent = 'Partie en cours ! Termine d\'abord. respire un coup';
        return;
    }

    tokens += currentBet;
    currentBet = 0;
    updateTokensDisplay();
    messageDiv.innerHTML = 'Mise effacée. Place une nouvelle mise ! <span style="font-size: 1.8em;">💰</span>';
}

function updateTokensDisplay() {
    tokensCountSpan.textContent = tokens;
    currentBetSpan.textContent = currentBet;
}

// Créer un deck de cartes avec chemins vers les SVG
function createDeck() {
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const suits = [
        { name: 'hearts', folder: 'hearts' },
        { name: 'diamonds', folder: 'diamonds' },
        { name: 'clubs', folder: 'clubs' },
        { name: 'spades', folder: 'spades' }
    ];
    const deck = [];

    for (let suit of suits) {
        for (let value of values) {
            deck.push({
                value: value,
                suit: suit.name,
                imagePath: `Assets/images/cards/${suit.folder}/${value}.svg`,
                numericValue: getNumericValue(value)
            });
        }
    }

    return shuffleDeck(deck);
}

// Obtenir la valeur numérique d'une carte
function getNumericValue(value) {
    if (value === 'A') return 11;
    if (value === 'J' || value === 'Q' || value === 'K') return 10;
    return parseInt(value);
}

// Mélanger le deck
function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

// Afficher une carte avec l'image SVG
function displayCard(card, container, hidden = false) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card-svg-container';

    const img = document.createElement('img');

    if (hidden) {
        img.src = 'Assets/images/cards/back.svg';
        img.alt = 'Dos de carte';
    } else {
        img.src = card.imagePath;
        img.alt = `${card.value} de ${card.suit}`;
    }

    img.style.width = '150px';
    img.style.height = '217px';

    // Animation slide
    cardDiv.style.opacity = '0';
    cardDiv.style.transform = 'translateY(50px)';
    cardDiv.style.transition = 'all 0.4s ease-out';

    cardDiv.appendChild(img);
    container.appendChild(cardDiv);

    cardDiv.offsetHeight;

    requestAnimationFrame(() => {
        cardDiv.style.opacity = '1';
        cardDiv.style.transform = 'translateY(0)';
    });
}

// Calculer le score d'une main
function calculateScore(hand) {
    let score = 0;
    let aces = 0;

    for (let card of hand) {
        score += card.numericValue;
        if (card.value === 'A') aces++;
    }

    while (score > 21 && aces > 0) {
        score -= 10;
        aces--;
    }

    return score;
}

// Afficher les mains
function displayHands(hideDealerCard = true) {
    playerCardsDiv.innerHTML = '';
    for (let card of playerHand) {
        displayCard(card, playerCardsDiv);
    }
    playerScoreSpan.textContent = calculateScore(playerHand);

    dealerCardsDiv.innerHTML = '';
    for (let i = 0; i < dealerHand.length; i++) {
        displayCard(dealerHand[i], dealerCardsDiv, hideDealerCard && i === 0);
    }

    if (hideDealerCard && dealerHand.length > 0) {
        dealerScoreSpan.textContent = dealerHand[1] ? calculateScore([dealerHand[1]]) : '?';
    } else {
        dealerScoreSpan.textContent = calculateScore(dealerHand);
    }
}

// Distribuer les cartes
function dealCards() {
    if (currentBet === 0) {
        messageDiv.innerHTML = 'Place d\'abord une mise ! <span style="font-size: 1.8em;">💰</span>';
        return;
    }

    if (gameStarted) {
        messageDiv.innerHTML = 'Partie déjà en cours ! <span style="font-size: 1.8em;">🎲</span>';
        return;
    }

    deck = createDeck();
    playerHand = [];
    dealerHand = [];
    gameOver = false;
    gameStarted = true;

    playSound('deal');

    messageDiv.innerHTML = 'BON chance !!! l\'ami <span style="font-size: 1.8em;">🎰</span>';
    messageDiv.className = 'message';

    // Distribution avec délai pour l'animation
    setTimeout(() => {
        playerHand.push(deck.pop());
        displayHands(true);
        playSound('cardFlip');
    }, 100);

    setTimeout(() => {
        dealerHand.push(deck.pop());
        displayHands(true);
        playSound('cardFlip');
    }, 300);

    setTimeout(() => {
        playerHand.push(deck.pop());
        displayHands(true);
        playSound('cardFlip');
    }, 500);

    setTimeout(() => {
        dealerHand.push(deck.pop());
        displayHands(true);
        playSound('cardFlip');

        hitBtn.disabled = false;
        standBtn.disabled = false;
        dealBtn.disabled = true;

        bet10Btn.disabled = true;
        bet20Btn.disabled = true;
        bet50Btn.disabled = true;
        bet100Btn.disabled = true;
        bet200Btn.disabled = true;
        clearBetBtn.disabled = true;

        if (calculateScore(playerHand) === 21) {
            endGame();
        }
    }, 700);
}

// Tirer une carte
function hit() {
    if (gameOver) return;

    playerHand.push(deck.pop());
    playSound('cardFlip');
    displayHands(true);

    const playerScore = calculateScore(playerHand);

    if (playerScore > 21) {
        playSound('lose');
        messageDiv.innerHTML = 'BUSTÉ ! T as perdu ! <span style="font-size: 2em;">💥😢</span>';
        messageDiv.className = 'message lose';
        endGame();
    } else if (playerScore === 21) {
        stand();
    }
}

// Rester
function stand() {
    if (gameOver) return;

    gameOver = true;

    // Révéler la carte cachée du croupier
    displayHands(false);
    playSound('cardFlip');

    // Le croupier tire avec un délai
    let dealerDrawDelay = 800;
    const dealerDrawInterval = setInterval(() => {
        if (calculateScore(dealerHand) < 17) {
            dealerHand.push(deck.pop());
            displayHands(false);
            playSound('cardFlip');
        } else {
            clearInterval(dealerDrawInterval);
            determineWinner();
        }
    }, dealerDrawDelay);

    // Si le croupier n'a pas besoin de tirer
    if (calculateScore(dealerHand) >= 17) {
        clearInterval(dealerDrawInterval);
        setTimeout(determineWinner, 500);
    }
}

// Déterminer le gagnant
function determineWinner() {
    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    if (dealerScore > 21) {
        playSound('win');
        messageDiv.innerHTML = 'Le croupier a busté ! C gagné ! <span style="font-size: 2em;">🎉💰</span>';
        messageDiv.className = 'message win';
        tokens += currentBet * 2;
    } else if (playerScore > dealerScore) {
        playSound('win');
        messageDiv.innerHTML = 'Tu gagnes ! <span style="font-size: 2em;">🏆✨</span>';
        messageDiv.className = 'message win';
        tokens += currentBet * 2;
    } else if (playerScore < dealerScore) {
        playSound('lose');
        messageDiv.innerHTML = 'Le croupier gagne ! <span style="font-size: 2em;">😞💔</span>';
        messageDiv.className = 'message lose';
    } else {
        playSound('tie');
        messageDiv.innerHTML = 'Égalité ! Pffooah la RAGE <span style="font-size: 2em;">😤🤝</span>';
        messageDiv.className = 'message tie';
        tokens += currentBet;
    }

    updateTokensDisplay();
    endGame();
}

// Fin de partie
function endGame() {
    gameOver = true;
    gameStarted = false;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;
    displayHands(false);

    bet10Btn.disabled = false;
    bet20Btn.disabled = false;
    bet50Btn.disabled = false;
    bet100Btn.disabled = false;
    bet200Btn.disabled = false;
    clearBetBtn.disabled = false;

    currentBet = 0;
    updateTokensDisplay();

    if (tokens === 0) {
        messageDiv.innerHTML = 'Plus de jetons ! Clique sur Nouvelle partie ! C toujours pas la FDJ ici... <span style="font-size: 1.8em;">😢</span>';
    }
}

// Réinitialiser le jeu
function resetGame() {
    tokens = 100;
    currentBet = 0;
    gameStarted = false;
    gameOver = false;
    playerHand = [];
    dealerHand = [];

    playerCardsDiv.innerHTML = '';
    dealerCardsDiv.innerHTML = '';
    playerScoreSpan.textContent = '0';
    dealerScoreSpan.textContent = '0';

    updateTokensDisplay();

    messageDiv.innerHTML = 'Place ta mise pour commencer ! <span style="font-size: 1.8em;">💰</span>';
    messageDiv.className = 'message';

    hitBtn.disabled = true;
    standBtn.disabled = true;
    dealBtn.disabled = false;

    bet10Btn.disabled = false;
    bet20Btn.disabled = false;
    bet50Btn.disabled = false;
    bet100Btn.disabled = false;
    bet200Btn.disabled = false;
    clearBetBtn.disabled = false;
}
