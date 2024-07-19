document.addEventListener('DOMContentLoaded', () => {
    const numbers = Array.from({ length: 10 }, (_, i) => i + 1);
    let shuffledNumbers = shuffleArray(numbers);
    const numberGrid = document.getElementById('numberGrid');
    const progressBar = document.getElementById('progressBar');
    const gameContainer = document.getElementById('gameContainer');
    const loadingScreen = document.getElementById('loadingScreen');
    const countdownElement = document.getElementById('countdown');
    let currentNumber = 1;
    const totalTime = 30;
    let remainingTime = totalTime;
    const updateInterval = 0.05;
    let timer;
    let countdown = 5;
    let countdownInterval;

    function initializeGame() {
        numberGrid.innerHTML = '';
        shuffledNumbers = shuffleArray(numbers);
        shuffledNumbers.forEach(number => {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.textContent = number;
            cell.addEventListener('click', () => handleCellClick(number));
            numberGrid.appendChild(cell);
        });
        remainingTime = totalTime;
        progressBar.style.width = '100%';
        currentNumber = 1;
    }

    function handleCellClick(number) {
        if (number === currentNumber) {
            const clickedCell = Array.from(numberGrid.children).find(cell => cell.textContent == number);
            clickedCell.classList.add('active');
            if (currentNumber === 10) {
                clearInterval(timer);
                sendResult(true);
                hideGame();
            } else {
                currentNumber++;
            }
        } else {
            clearInterval(timer);
            sendResult(false);
            hideGame();
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function updateProgressBar() {
        remainingTime -= updateInterval;
        const progressWidth = (remainingTime / totalTime) * 100;
        progressBar.style.width = `${progressWidth}%`;

        if (remainingTime <= 0) {
            clearInterval(timer);
            sendResult(false);
            hideGame();
        }
    }

    function sendResult(success) {
        fetch(`https://${GetParentResourceName()}/minigameResult`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            body: JSON.stringify({ success })
        }).catch(err => console.error('Error sending result:', err));
    }

    function hideGame() {
        gameContainer.style.display = 'none';
        loadingScreen.style.display = 'none';
        clearInterval(timer);
        clearInterval(countdownInterval);
        countdown = 5;
        countdownElement.textContent = countdown;
        Array.from(numberGrid.children).forEach(cell => cell.classList.remove('active'));
    }

    function startCountdown() {
        countdownElement.textContent = countdown;
        countdownInterval = setInterval(() => {
            countdown--;
            countdownElement.textContent = countdown;
            if (countdown === 0) {
                clearInterval(countdownInterval);
                loadingScreen.style.display = 'none';
                gameContainer.style.display = 'block';
                initializeGame();
                timer = setInterval(updateProgressBar, updateInterval * 1000);
            }
        }, 1000);
    }

    window.addEventListener('message', function(event) {
        if (event.data.action === 'startMinigame') {
            hideGame();
            loadingScreen.style.display = 'flex';
            gameContainer.style.display = 'block';
            startCountdown();
        }
    });

    gameContainer.style.display = 'none';
});
