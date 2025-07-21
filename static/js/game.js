document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы
    const welcomeModal = document.getElementById('welcomeModal');
    const startGameButton = document.getElementById('startGameButton');
    const pauseButton = document.querySelector('.button-pause');
    const modalOverlay = document.getElementById('modalOverlay');
    const resumeButton = document.getElementById('resumeButton');
    const gameTimer = document.getElementById('gameTimer');
    const timeOver = document.getElementById('timeOver');
    const resumeLastWordButton = document.getElementById('resumeLastWordButton');
    const skipButton = document.querySelector('.button-left');
    const correctButton = document.querySelector('.button-right');
    const scoreElement = document.querySelector('.score-block h3:nth-child(2)');
    const teamTextElement = document.getElementById('currentTeam');
    
    // Получаем данные из localStorage
    const teamsWithScores = JSON.parse(localStorage.getItem('teamsWithScores')) || {};
    const teamsWithRounds = JSON.parse(localStorage.getItem('teamsRounds')) || {};
    const teamsList = Object.keys(teamsWithScores); // Массив названий команд
    
    let currentTeamIndex = parseInt(localStorage.getItem('currentTeamIndex')) || 0;

    // Создаем аудио элементы
    const buttonSound = new Audio('static/sound/button-click.mp3');
    const nextSound = new Audio('static/sound/correct.mp3');
    const skipSound = new Audio('static/sound/skip.mp3');
    const flipSound = new Audio('static/sound/card-flip.mp3');
    const timerWarningSound = new Audio('static/sound/timer-warning.mp3');
    const backgroundMusic = new Audio('static/sound/background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;

    let lastClickTime = 0;
    const clickDelay = 1000;

    console.log('currentTeamIndex:', currentTeamIndex);
    console.log('Список команд с очками:', teamsWithScores);
    console.log('Список команд с раундами:', teamsWithRounds);

    // Переменные для игры
    let wordsList = [];
    let usedWords = [];
    let currentWord = "";
    let timeLeft = 60;
    let timerInterval;
    let isGameRunning = false;
    let isLastWord = false;
    let score = 0;
    let penaltiesEnabled = true;

    // Функция для воспроизведения звуков
    function playButtonSound() {
        buttonSound.currentTime = 0;
        buttonSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playSkipSound() {
        skipSound.currentTime = 0;
        skipSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playNextSound() {
        nextSound.currentTime = 0;
        nextSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    function playFlipSound() {
        flipSound.currentTime = 0;
        flipSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    // Функция для загрузки слов
    function loadWords() {
        const customWords = localStorage.getItem('customWords');
        if (customWords) {
            wordsList = JSON.parse(customWords);
            console.log('Загружены слова из URL:', wordsList);
        } else {
            wordsList = ["СЛОВО1", "СЛОВО2", "СЛОВО3"];
            console.log('Используется стандартный набор слов');
        }
        usedWords = [];
    }

    // Функция для получения случайного слова
    function getRandomWord() {
        if (usedWords.length === wordsList.length) {
            console.log('Все слова использованы, начинаем заново');
            usedWords = [];
        }
        
        const availableWords = wordsList.filter(word => !usedWords.includes(word));
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        currentWord = availableWords[randomIndex];
        usedWords.push(currentWord);
        return currentWord;
    }

    // Функция для обновления слова на экране
    function updateWord() {
        const wordElement = document.querySelector('.word-block .front');
        wordElement.textContent = getRandomWord();
        wordElement.classList.add('word-update');
        setTimeout(() => {
            wordElement.classList.remove('word-update');
        }, 300);
    }

    // Обновляем название текущей команды
    function updateCurrentTeam() {
        if (teamsList.length > 0) {
            const currentTeamName = teamsList[currentTeamIndex];
            teamTextElement.textContent = currentTeamName;
        }
    }

    // Загружаем настройки
    function loadSettings() {
        const savedPenalties = localStorage.getItem('penaltyEnabled');
        if (savedPenalties !== null) {
            penaltiesEnabled = savedPenalties === 'true';
        }
        
        const savedTime = localStorage.getItem('currentTime');
        if (savedTime) {
            timeLeft = parseInt(savedTime);
            gameTimer.textContent = formatTime(timeLeft);
        } else {
            const defaultTime = localStorage.getItem('timeValue');
            if (defaultTime) {
                timeLeft = parseInt(defaultTime);
                gameTimer.textContent = formatTime(timeLeft);
            }
        }
        
        const savedScore = localStorage.getItem('currentScore');
        if (savedScore !== null) {
            score = parseInt(savedScore);
            updateScore();
        }
    }

    // Сохраняем состояние игры
    function saveGameState() {
        localStorage.setItem('currentTime', timeLeft.toString());
        localStorage.setItem('currentScore', score.toString());
    }

    // Очищаем сохраненное состояние
    function clearGameState() {
        localStorage.removeItem('currentTime');
        localStorage.removeItem('currentScore');
    }

    // Обновляем отображение очков
    function updateScore() {
        scoreElement.textContent = score;
        scoreElement.classList.toggle('negative', score < 0);
        saveGameState();
    }

    // Форматируем время
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Запускаем таймер
    function startTimer() {
        isGameRunning = true;
        timerInterval = setInterval(function() {
            timeLeft--;
            gameTimer.textContent = formatTime(timeLeft);

            if (timeLeft === 5) {
                timerWarningSound.currentTime = 0;
                timerWarningSound.play().catch(e => console.log("Не удалось воспроизвести звук таймера:", e));
            }
            
            saveGameState();
            
            gameTimer.classList.add('changing');
            setTimeout(() => {
                gameTimer.classList.remove('changing');
            }, 500);
            
            if (timeLeft <= 0) {
                timeOver.style.display = 'flex';
                clearInterval(timerInterval);
                isGameRunning = false;
                isLastWord = true;
                resumeLastWordButton.addEventListener('click', function() {
                    playButtonSound();
                    timeOver.style.display = 'none';
                    isLastWord = true;
                });
            }
        }, 1000);
    }

    // Пауза таймера
    function pauseTimer() {
        clearInterval(timerInterval);
        timerWarningSound.pause();
        isGameRunning = false;
    }

    // Сброс таймера
    function resetTimer() {
        clearInterval(timerInterval);
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
        const defaultTime = localStorage.getItem('timeValue') || 60;
        timeLeft = parseInt(defaultTime);
        gameTimer.textContent = formatTime(timeLeft);
        isGameRunning = false;
        isLastWord = false;
        score = 0;
        updateScore();
        clearGameState();
    }

    // Анимация блока слова
    function animateWordBlock() {
        playFlipSound();
        const wordBlock = document.querySelector('.word-block');
        wordBlock.classList.add('flipped');
        
        setTimeout(() => {
            wordBlock.classList.remove('flipped');
        }, 600);
    }

    // Показываем модальное окно выбора команды
    function showTeamSelectionModal() {
        const teamsListContainer = document.getElementById('teamsListContainer');
        teamsListContainer.innerHTML = '';
        
        teamsList.forEach((team, index) => {
            const teamButton = document.createElement('button');
            teamButton.className = 'modal-button team-select-button';
            teamButton.textContent = `${team}`;
            teamButton.addEventListener('click', function() {
                addPointToTeam(team, index);
                window.location.href = 'score.html';
            });
            teamsListContainer.appendChild(teamButton);
        });
        
        const teamSelectModal = document.getElementById('teamSelectModal');
        teamSelectModal.style.display = 'flex';
        timeOver.style.display = 'none';
    }

    // Добавляем очки команде и обновляем статистику раундов
    function addPointToTeam(teamName) {
        const roundScore = parseInt(localStorage.getItem('currentScore')) || 0;
        // Обновляем количество раундов для команды
        teamsWithRounds[teamsList[currentTeamIndex]] = (teamsWithRounds[teamsList[currentTeamIndex]] || 0) + 1;
        localStorage.setItem('teamsRounds', JSON.stringify(teamsWithRounds));
        
        // Обновляем очки команды
        if (teamName === teamsList[currentTeamIndex]) {
            // Если выбрана текущая команда, добавляем все очки за раунд + 1 за последнее слово
            localStorage.setItem('currentScore', (roundScore + 1).toString());
            teamsWithScores[teamsList[currentTeamIndex]] = (teamsWithScores[teamsList[currentTeamIndex]] || 0) + roundScore + 1;
        } else {
            teamsWithScores[teamsList[currentTeamIndex]] = (teamsWithScores[teamsList[currentTeamIndex]] || 0) + roundScore;
            // Если выбрана другая команда, добавляем только 1 очко за последнее слово
            teamsWithScores[teamName] = (teamsWithScores[teamName] || 0) + 1;
        }
        
        // Сохраняем обновленные данные
        localStorage.setItem('teamsWithScores', JSON.stringify(teamsWithScores));
        
        console.log('Обновленные очки команд:', teamsWithScores);
        console.log('Обновленные раунды команд:', teamsWithRounds);
    }

    // Обработчики событий
    skipButton.addEventListener('click', function() {
        if (isLastWord) {
            playSkipSound();
            const now = Date.now();
            if (now - lastClickTime < clickDelay) return;
            lastClickTime = now;
            
            skipButton.classList.add('button-disabled');
            setTimeout(() => {
                skipButton.classList.remove('button-disabled');
            }, clickDelay);
            
            score -= 1;
            updateScore();
            // Обновляем количество раундов для выбранной команды
            teamsWithRounds[teamsList[currentTeamIndex]] = (teamsWithRounds[teamsList[currentTeamIndex]] || 0) + 1;
            localStorage.setItem('teamsRounds', JSON.stringify(teamsWithRounds));
            // Сохраняем обновленные данные
            const roundScore = parseInt(localStorage.getItem('currentScore')) || 0;
            teamsWithScores[teamsList[currentTeamIndex]] = (teamsWithScores[teamsList[currentTeamIndex]] || 0) + roundScore;
            localStorage.setItem('teamsWithScores', JSON.stringify(teamsWithScores));
            console.log('Обновленные очки команд:', teamsWithScores);
            console.log('Обновленные раунды команд:', teamsWithRounds);
            setTimeout(() => {
                window.location.href = 'score.html';
            }, 500);
            return;
        }
        else {
            playSkipSound();
            const now = Date.now();
            if (now - lastClickTime < clickDelay) return;
            lastClickTime = now;
            
            skipButton.classList.add('button-disabled');
            setTimeout(() => {
                skipButton.classList.remove('button-disabled');
            }, clickDelay);
            
            animateWordBlock();
            
            setTimeout(() => {
                updateWord();
            }, 600);
        }
        
        if (penaltiesEnabled) {
            score -= 1;
            updateScore();
        }
    });

    correctButton.addEventListener('click', function() { 
        if (isLastWord) {
            playNextSound();
            const now = Date.now();
            if (now - lastClickTime < clickDelay) return;
            lastClickTime = now;
            
            correctButton.classList.add('button-disabled');
            setTimeout(() => {
                correctButton.classList.remove('button-disabled');
            }, clickDelay);

            localStorage.setItem('currentTeamIndex', currentTeamIndex.toString());
            showTeamSelectionModal();
            return;
        }
        else {
            playNextSound();
            const now = Date.now();
            if (now - lastClickTime < clickDelay) return;
            lastClickTime = now;
            
            correctButton.classList.add('button-disabled');
            setTimeout(() => {
                correctButton.classList.remove('button-disabled');
            }, clickDelay);
            
            animateWordBlock();
            
            setTimeout(() => {
                updateWord();
            }, 600);
        }
        score += 1;
        updateScore();
    });

    startGameButton.addEventListener('click', function() {
        playButtonSound();
        welcomeModal.style.display = 'none';

        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("Не удалось воспроизвести фоновую музыку:", e));
        }
        
        if (!isGameRunning) {
            const savedTime = localStorage.getItem('currentTime');
            const savedScore = localStorage.getItem('currentScore');
            
            if (savedTime && savedScore) {
                timeLeft = parseInt(savedTime);
                score = parseInt(savedScore);
                gameTimer.textContent = formatTime(timeLeft);
                updateScore();
            } else {
                const defaultTime = localStorage.getItem('timeValue') || 60;
                timeLeft = parseInt(defaultTime);
                score = 0;
                gameTimer.textContent = formatTime(timeLeft);
                updateScore();
            }
        }
        
        startTimer();
    });
    
    pauseButton.addEventListener('click', function() {
        playButtonSound();
        if (isGameRunning) {
            if (timeLeft > 0) {
                pauseTimer();
                backgroundMusic.pause();
            }
            modalOverlay.style.display = 'flex';
        }
    });
    
    resumeButton.addEventListener('click', function() {
        playButtonSound();
        modalOverlay.style.display = 'none';
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("Не удалось возобновить фоновую музыку:", e));
        }
        startTimer();
    });
    
    modalOverlay.addEventListener('click', function(e) {
        playButtonSound();
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
            if (!isGameRunning) {
                startTimer();
            }
        }
    });

    // Инициализация игры
    loadSettings();
    loadWords();
    updateCurrentTeam();
    updateScore();
    updateWord();
    welcomeModal.style.display = 'flex';
});