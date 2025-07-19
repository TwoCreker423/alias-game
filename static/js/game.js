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
    const scoreElement = document.querySelector('.score-block h3:nth-child(2)'); // Элемент с очками
    const savedTeams = localStorage.getItem('teamsList');
    const teamsList = savedTeams ? JSON.parse(savedTeams) : [];
    const teamSelectModal = document.getElementById('teamSelectModal');
    const teamsListContainer = document.getElementById('teamsListContainer');
    let roundsPlayed = JSON.parse(localStorage.getItem('roundsPlayed')) || {};

    // Создаем аудио элемент для звука нажатия кнопки
    const buttonSound = new Audio('static/sound/button-click.mp3');
    const nextSound = new Audio('static/sound/correct.mp3');
    const skipSound = new Audio('static/sound/skip.mp3');
    const flipSound = new Audio('static/sound/card-flip.mp3');
    const timerWarningSound = new Audio('static/sound/timer-warning.mp3');
    const backgroundMusic = new Audio('static/sound/background-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.2;

    let lastClickTime = 0;
    const clickDelay = 1000; // 1 секунда задержки

    console.log('Список команд:', teamsList);

    //Получаем элемент для отображения названия команды
    const teamTextElement = document.getElementById('currentTeam');

    // Загружаем текущий индекс команды (или 0, если нет сохраненного)
    let currentTeamIndex = parseInt(localStorage.getItem('currentTeamIndex')) || 0;

    // Добавляем в начало game.js (после других переменных)
    let wordsList = []; // Список слов для игры
    let usedWords = []; // Слова, которые уже использовались
    let currentWord = ""; // Текущее слово

    // Функция для воспроизведения звука кнопки
    function playButtonSound() {
        buttonSound.currentTime = 0; // Перематываем звук на начало
        buttonSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    // Функция для воспроизведения звука кнопки
    function playSkipSound() {
        skipSound.currentTime = 0; // Перематываем звук на начало
        skipSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    // Функция для воспроизведения звука кнопки
    function playNextSound() {
        nextSound.currentTime = 0; // Перематываем звук на начало
        nextSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    // Функция для воспроизведения звука кнопки
    function playFlipSound() {
        flipSound.currentTime = 0; // Перематываем звук на начало
        flipSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
    }

    // Функция для загрузки слов из localStorage
    function loadWords() {
        // Пытаемся получить слова из URL (если игра начата из бота)
        const customWords = localStorage.getItem('customWords');
        if (customWords) {
            wordsList = JSON.parse(customWords);
            console.log('Загружены слова из URL:', wordsList);
        } else {
            // Если нет слов из URL, можно загрузить стандартный набор
            wordsList = ["СЛОВО1", "СЛОВО2", "СЛОВО3"]; // Замените на ваш стандартный набор
            console.log('Используется стандартный набор слов');
        }
        
        // Инициализируем массив использованных слов
        usedWords = [];
    }

    // Функция для получения случайного слова
    function getRandomWord() {
        // Если все слова использованы, начинаем заново
        if (usedWords.length === wordsList.length) {
            console.log('Все слова использованы, начинаем заново');
            usedWords = [];
        }
        
        // Фильтруем неиспользованные слова
        const availableWords = wordsList.filter(word => !usedWords.includes(word));
        
        // Выбираем случайное слово из доступных
        const randomIndex = Math.floor(Math.random() * availableWords.length);
        currentWord = availableWords[randomIndex];
        
        // Добавляем слово в использованные
        usedWords.push(currentWord);
        
        return currentWord;
    }

    // Функция для обновления слова на экране
    function updateWord() {
        const wordElement = document.querySelector('.word-block .front');
        wordElement.textContent = getRandomWord();
        
        // Для анимации можно добавить класс
        wordElement.classList.add('word-update');
        setTimeout(() => {
            wordElement.classList.remove('word-update');
        }, 300);
    }
    
    // Показываем текущую команду (без автоматического переключения)
    if (teamsList.length > 0) {
        teamTextElement.textContent = teamsList[currentTeamIndex];
    }


    // Переменные для таймера
    let timeLeft = 60; // Значение по умолчанию
    let timerInterval;
    let isGameRunning = false;
    let isLastWord = false; // Флаг для последнего слова
    let score = 0; // Текущие очки
    let penaltiesEnabled = true; // Штрафы включены по умолчанию

    // Загружаем настройки штрафов
    function loadSettings() {
        const savedPenalties = localStorage.getItem('penaltyEnabled');
        if (savedPenalties !== null) {
            penaltiesEnabled = savedPenalties === 'true';
        }
        
        // Загружаем сохраненное время
        const savedTime = localStorage.getItem('currentTime');
        if (savedTime) {
            timeLeft = parseInt(savedTime);
            gameTimer.textContent = formatTime(timeLeft);
        } else {
            // Если нет сохраненного времени, берем из настроек
            const defaultTime = localStorage.getItem('timeValue');
            if (defaultTime) {
                timeLeft = parseInt(defaultTime);
                gameTimer.textContent = formatTime(timeLeft);
            }
        }
        
        // Загружаем сохраненные очки
        const savedScore = localStorage.getItem('currentScore');
        if (savedScore !== null) {
            score = parseInt(savedScore);
            updateScore();
        }
    }

    // Сохраняем текущее состояние игры
    function saveGameState() {
        localStorage.setItem('currentTime', timeLeft.toString());
        localStorage.setItem('currentScore', score.toString());
    }

    // Очищаем сохраненное состояние игры
    function clearGameState() {
        localStorage.removeItem('currentTime');
        localStorage.removeItem('currentScore');
    }

    // Обновляем отображение очков
    function updateScore() {
        scoreElement.textContent = score;
        
        if (score < 0) {
            scoreElement.classList.add('negative');
        } else {
            scoreElement.classList.remove('negative');
        }
        
        // Сохраняем очки
        saveGameState();
    }

    // Функция для форматирования секунд в MM:SS
    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // Загружаем настройки времени из localStorage
    function loadTimerSettings() {
        const savedTime = localStorage.getItem('timeValue');
        if (savedTime) {
            timeLeft = parseInt(savedTime);
            gameTimer.textContent = formatTime(timeLeft); // Используем функцию форматирования
        }
    }

    // Функция старта таймера
    function startTimer() {
        isGameRunning = true;
        timerInterval = setInterval(function() {
            timeLeft--;
            gameTimer.textContent = formatTime(timeLeft);

            // Воспроизводим звук предупреждения при 5 секундах
            if (timeLeft === 5) {
                timerWarningSound.currentTime = 0;
                timerWarningSound.play().catch(e => console.log("Не удалось воспроизвести звук таймера:", e));
            }
            
            // Сохраняем текущее время
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
                // Обработчик для кнопки "Пропустить"
                resumeLastWordButton.addEventListener('click', function() {
                    playButtonSound();
                    timeOver.style.display = 'none';
                    isLastWord = true;
                });
            }
        }, 1000);
    }

    // Функция паузы таймера
    function pauseTimer() {
        clearInterval(timerInterval);
        timerWarningSound.pause();
        isGameRunning = false;
    }

    // Функция сброса таймера (используется только когда нужно начать новую игру)
    function resetTimer() {
        clearInterval(timerInterval);
        // Останавливаем фоновую музыку
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

    // Обработчик для кнопки "Пропустить"
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
            
            // Обновляем слово после анимации
            setTimeout(() => {
                updateWord();
            }, 600);
        }
        
        if (penaltiesEnabled) {
            score -= 1;
            updateScore();
        }
    });

    // Обработчик для кнопки "Правильно"
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
            
            // Обновляем слово после анимации
            setTimeout(() => {
                updateWord();
            }, 600);
        }
        score += 1;
        updateScore();
    });

    // Функция для анимации переворота word-block
    function animateWordBlock() {
        playFlipSound();
        const wordBlock = document.querySelector('.word-block');
        wordBlock.classList.add('flipped');
        
        // После завершения анимации возвращаем в исходное состояние
        setTimeout(() => {
            wordBlock.classList.remove('flipped');
            // Здесь можно добавить логику для смены слова
        }, 600); // Должно совпадать с длительностью анимации в CSS
    }


    // Добавим новую функцию для показа модального окна с выбором команды
    function showTeamSelectionModal() {
        // Очищаем контейнер
        teamsListContainer.innerHTML = '';
        
        // Получаем список команд
        const teamsList = JSON.parse(localStorage.getItem('teamsList')) || [];
        
        // Создаем кнопки для каждой команды
        teamsList.forEach(team => {
            const teamButton = document.createElement('button');
            teamButton.className = 'modal-button team-select-button';
            teamButton.textContent = team;
            teamButton.addEventListener('click', function() {
                // Добавляем очко выбранной команде
                addPointToTeam(team);
                // Переходим на страницу результатов
                window.location.href = 'score.html';
            });
            teamsListContainer.appendChild(teamButton);
        });
        
        // Показываем модальное окно
        teamSelectModal.style.display = 'flex';
        timeOver.style.display = 'none';
    }

    // Функция для добавления очка команде
    function addPointToTeam(teamName) {
        const teamsScores = JSON.parse(localStorage.getItem('teamsScores')) || {};
        const roundScore = parseInt(localStorage.getItem('currentScore')) || 0;

        // Обновляем счетчик раундов
        roundsPlayed[teamsList[currentTeamIndex]] = (roundsPlayed[teamsList[currentTeamIndex]] || 0) + 1;
        localStorage.setItem('roundsPlayed', JSON.stringify(roundsPlayed));
        
        // Выводим в консоль статистику по раундам
        console.log('Статистика по раундам:', roundsPlayed);
        
        // Добавляем очки за раунд ТОЛЬКО если выбрана текущая команда
        if (teamName === teamsList[currentTeamIndex]) {
            // Текущая команда получает все очки за раунд + 1 за последнее слово
            teamsScores[teamName] = (teamsScores[teamName] || 0) + roundScore + 1;
            console.log(roundScore);
            // Сохраняем общее количество очков за раунд
            localStorage.setItem('currentScore', (roundScore + 1).toString());
        } else {
            // Другая команда получает только 1 очко за последнее слово
            teamsScores[teamName] = (teamsScores[teamName] || 0) + 1;
            // Сохраняем только 1 очко за раунд (только за последнее слово)
            localStorage.setItem('teamsScores', JSON.stringify(teamsScores));
        }
        

    }

    // Обработчик для кнопки "Начать игру"
    startGameButton.addEventListener('click', function() {
        playButtonSound();
        welcomeModal.style.display = 'none';

        // Проверяем настройки музыки и воспроизводим, если включено
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("Не удалось воспроизвести фоновую музыку:", e));
        }
        
        // Не сбрасываем таймер, если игра уже идет (после перезагрузки)
        if (!isGameRunning) {
            // Если есть сохраненное состояние - продолжаем его
            const savedTime = localStorage.getItem('currentTime');
            const savedScore = localStorage.getItem('currentScore');
            
            if (savedTime && savedScore) {
                timeLeft = parseInt(savedTime);
                score = parseInt(savedScore);
                gameTimer.textContent = formatTime(timeLeft);
                updateScore();
            } else {
                // Иначе начинаем новую игру
                const defaultTime = localStorage.getItem('timeValue') || 60;
                timeLeft = parseInt(defaultTime);
                score = 0;
                gameTimer.textContent = formatTime(timeLeft);
                updateScore();
            }
        }
        
        startTimer();
    });
    
    // Обработчик для кнопки паузы
    pauseButton.addEventListener('click', function() {
        playButtonSound();
        if (isGameRunning) {
            if (timeLeft > 0) {
                pauseTimer();
                // Ставим музыку на паузу
                backgroundMusic.pause();
            }
            modalOverlay.style.display = 'flex';
        }
    });
    
    // Обработчик для кнопки "Продолжить"
    resumeButton.addEventListener('click', function() {
        playButtonSound();
        modalOverlay.style.display = 'none';
        // Возобновляем музыку, если она включена в настройках
        const musicEnabled = localStorage.getItem('musicEnabled') === 'true';
        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("Не удалось возобновить фоновую музыку:", e));
        }
        startTimer();
    });
    
    // Закрытие модального окна при клике вне его
    modalOverlay.addEventListener('click', function(e) {
        playButtonSound();
        if (e.target === modalOverlay) {
            modalOverlay.style.display = 'none';
            if (!isGameRunning) {
                startTimer();
            }
        }
    });

    // Загружаем настройки при старте
    loadSettings();
    updateScore(); // Инициализируем отображение очков
    // В обработчике DOMContentLoaded, после loadSettings()
    loadWords();
    // И в обработчике кнопки "Начать игру", после welcomeModal.style.display = 'none';
    updateWord(); // Показываем первое слово
    welcomeModal.style.display = 'flex';
});