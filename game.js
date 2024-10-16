class BallGame {
    constructor() {
        this.players = [];
        this.currentRound = 1;
        this.bag = { red: 7, blue: 2, green: 1 };
        this.scores = {};
        this.currentPlayerIndex = 0;
        this.choices = {};
    }

    addPlayer(playerName) {
        if (this.players.length < 2) {
            this.players.push(playerName);
            this.scores[playerName] = 0;
            return true;
        }
        return false;
    }

    getBallValues() {
        if (this.currentRound <= 2) return { red: 1, blue: 3, green: 5 };
        if (this.currentRound <= 5) return { red: 1, blue: 2, green: 3 };
        if (this.currentRound <= 7) return { red: 1, blue: 1, green: 2 };
        return { red: 1, blue: 1, green: 1 };
    }

    makeChoice(playerName, color) {
        if (playerName !== this.players[this.currentPlayerIndex]) return false;
        
        this.choices[playerName] = color;
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 2;
        
        if (Object.keys(this.choices).length === 2) {
            return this.resolveTurn();
        }
        return null;
    }

    resolveTurn() {
        const ballValues = this.getBallValues();
        const availableColors = Object.keys(this.bag).filter(color => this.bag[color] > 0);
        const drawnColor = availableColors[Math.floor(Math.random() * availableColors.length)];

        this.bag[drawnColor]--;

        for (let player of this.players) {
            if (this.choices[player] === drawnColor) {
                this.scores[player] += ballValues[drawnColor];
            }
        }

        const result = {
            drawnColor,
            scores: this.scores,
            remainingBalls: this.bag,
            ballValues: ballValues
        };

        this.choices = {};
        this.currentRound++;

        return result;
    }

    isGameOver() {
        return this.currentRound > 10;
    }

    getWinner() {
        if (!this.isGameOver()) return null;
        if (this.scores[this.players[0]] > this.scores[this.players[1]]) return this.players[0];
        if (this.scores[this.players[1]] > this.scores[this.players[0]]) return this.players[1];
        return "Tie";
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    getGameState() {
        return {
            players: this.players,
            currentRound: this.currentRound,
            bag: this.bag,
            scores: this.scores,
            currentPlayer: this.getCurrentPlayer(),
            isGameOver: this.isGameOver(),
            winner: this.getWinner(),
            ballValues: this.getBallValues()
        };
    }
}

// Game instance
let game = new BallGame();
let playerName = '';

// DOM elements
const loginScreen = document.getElementById('login-screen');
const waitScreen = document.getElementById('wait-screen');
const gameScreen = document.getElementById('game-screen');
const playerNameInput = document.getElementById('player-name');
const joinGameButton = document.getElementById('join-game');
const ballSelect = document.getElementById('ball-select');
const confirmChoiceButton = document.getElementById('confirm-choice');
const turnInfo = document.getElementById('turn-info');
const result = document.getElementById('result');

joinGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        if (game.addPlayer(playerName)) {
            loginScreen.style.display = 'none';
            if (game.players.length === 1) {
                waitScreen.style.display = 'block';
            } else {
                startGame();
            }
            saveGameState();
        } else {
            alert('Game is full. Please try again later.');
        }
    } else {
        alert('Please enter your name.');
    }
});

confirmChoiceButton.addEventListener('click', () => {
    const selectedColor = ballSelect.value;
    if (!selectedColor) {
        alert('Please select a ball color');
        return;
    }

    const result = game.makeChoice(playerName, selectedColor);
    if (result) {
        updateDisplay(result);
    } else {
        updateDisplay();
    }
    saveGameState();
});

function startGame() {
    waitScreen.style.display = 'none';
    gameScreen.style.display = 'block';
    updateDisplay();
}

function updateDisplay(result) {
    const state = game.getGameState();

    document.getElementById('red-count').textContent = state.bag.red;
    document.getElementById('blue-count').textContent = state.bag.blue;
    document.getElementById('green-count').textContent = state.bag.green;

    document.getElementById('player1-name-display').textContent = state.players[0] || 'Waiting...';
    document.getElementById('player2-name-display').textContent = state.players[1] || 'Waiting...';
    document.getElementById('player1-score').textContent = state.scores[state.players[0]] || 0;
    document.getElementById('player2-score').textContent = state.scores[state.players[1]] || 0;

    turnInfo.textContent = state.currentPlayer === playerName ? "It's your turn!" : `Waiting for ${state.currentPlayer}'s move...`;
    document.getElementById('round-info').textContent = `Round: ${state.currentRound}/10\nRed: ${state.ballValues.red}pt, Blue: ${state.ballValues.blue}pts, Green: ${state.ballValues.green}pts`;

    ballSelect.disabled = state.currentPlayer !== playerName;
    confirmChoiceButton.disabled = state.currentPlayer !== playerName;

    if (result) {
        this.result.textContent = `Drawn ball: ${result.drawnColor}`;
    } else {
        this.result.textContent = '';
    }

    if (state.isGameOver) {
        const winner = state.winner;
        alert(winner === "Tie" ? "It's a tie!" : `${winner} wins!`);
    }
}

function saveGameState() {
    localStorage.setItem('ballGameState', JSON.stringify(game.getGameState()));
    localStorage.setItem('ballGamePlayerName', playerName);
}

function loadGameState() {
    const savedState = localStorage.getItem('ballGameState');
    const savedPlayerName = localStorage.getItem('ballGamePlayerName');

    if (savedState && savedPlayerName) {
        const state = JSON.parse(savedState);
        game = Object.assign(new BallGame(), state);
        playerName = savedPlayerName;

        if (game.players.length === 2) {
            startGame();
        } else {
            loginScreen.style.display = 'none';
            waitScreen.style.display = 'block';
        }
    }
}

// Load game state on page load
loadGameState();

// Periodically check for updates
setInterval(() => {
    loadGameState();
    updateDisplay();
}, 5000);
