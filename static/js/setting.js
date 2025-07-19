// Получаем элементы ползунков и их значений из DOM по их ID
const pointsSlider = document.getElementById('points-slider'); // Ползунок для настройки очков
const pointsValue = document.getElementById('points-value');   // Элемент для отображения значения очков
const timeSlider = document.getElementById('time-slider');     // Ползунок для настройки времени
const timeValue = document.getElementById('time-value');       // Элемент для отображения значения времени
const resetBtn = document.getElementById('reset-btn');         // Кнопка сброса настроек
const playButton = document.getElementById('play-button');

// Получаем элементы переключателей из DOM по их ID
const penaltyToggle = document.getElementById('penalty-toggle'); // Переключатель для штрафов
const musicToggle = document.getElementById('music-toggle');     // Переключатель для музыки

// Создаем аудио элемент для звука нажатия кнопки
const buttonSound = new Audio('static/sound/button-click.mp3');

// Функция для воспроизведения звука кнопки
function playButtonSound() {
    buttonSound.currentTime = 0; // Перематываем звук на начало
    buttonSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
}

// Функция для обновления отображаемого значения ползунка
function updateValue(slider, valueElement) {
    valueElement.textContent = slider.value; // Устанавливаем текст элемента равным текущему значению ползунка
}

// Функция загрузки сохраненных настроек из localStorage при загрузке страницы
function loadSettings() {
    // Для ползунка очков
    if (localStorage.getItem('pointsValue')) { // Проверяем, есть ли сохраненное значение
        pointsSlider.value = localStorage.getItem('pointsValue'); // Устанавливаем значение ползунка
        updateValue(pointsSlider, pointsValue); // Обновляем отображаемое значение
    }
    // Для ползунка времени
    if (localStorage.getItem('timeValue')) {
        timeSlider.value = localStorage.getItem('timeValue');
        updateValue(timeSlider, timeValue);
    }

    // Для переключателя штрафов
    if (localStorage.getItem('penaltyEnabled') !== null) { // Проверяем, существует ли значение
        penaltyToggle.checked = localStorage.getItem('penaltyEnabled') === 'true'; // Преобразуем строку в boolean
    }
    // Для переключателя музыки
    if (localStorage.getItem('musicEnabled') !== null) {
        musicToggle.checked = localStorage.getItem('musicEnabled') === 'true';
    }
}

// Функция для настройки обработчиков событий изменений элементов
function setupEventListeners() {
    // Для ползунка очков
    pointsSlider.addEventListener('input', function() { // Событие при изменении положения ползунка
        localStorage.setItem('pointsValue', pointsSlider.value); // Сохраняем значение в localStorage
        updateValue(pointsSlider, pointsValue); // Обновляем отображаемое значение
    });
    // Для ползунка времени
    timeSlider.addEventListener('input', function() {
        localStorage.setItem('timeValue', timeSlider.value);
        updateValue(timeSlider, timeValue);
    });

    // Для переключателя штрафов
    penaltyToggle.addEventListener('change', function() { // Событие при изменении состояния переключателя
        localStorage.setItem('penaltyEnabled', penaltyToggle.checked); // Сохраняем состояние (true/false)
    });
    // Для переключателя музыки
    musicToggle.addEventListener('change', function() {
        localStorage.setItem('musicEnabled', musicToggle.checked);
    });
}

// Обработчик клика по кнопке сброса
resetBtn.addEventListener('click', function() {
    playButtonSound(); // Воспроизводим звук

    // Сбрасываем ползунки к значениям по умолчанию
    pointsSlider.value = 50; // Устанавливаем значение по умолчанию для очков
    timeSlider.value = 60;   // Устанавливаем значение по умолчанию для времени

    // Обновляем отображаемые значения
    updateValue(pointsSlider, pointsValue);
    updateValue(timeSlider, timeValue);

    // Сбрасываем переключатели к значениям по умолчанию (включено)
    penaltyToggle.checked = true;
    musicToggle.checked = true;

    // Обновляем значения в localStorage
    localStorage.setItem('pointsValue', 50); // Сохраняем значение по умолчанию
    localStorage.setItem('timeValue', 60);
    localStorage.setItem('penaltyEnabled', true); // Сохраняем состояние "включено"
    localStorage.setItem('musicEnabled', true);

    // Удаляем данные о командах и их очках
    localStorage.removeItem('teamsList');
    localStorage.removeItem('teamsScores');
    localStorage.removeItem('currentTeamIndex');
    localStorage.removeItem('currentScore');
    localStorage.removeItem('currentTime');
    localStorage.removeItem('roundsPlayed');
    // Обновляем текст кнопки после сброса
    updatePlayButtonText();
});

playButton.addEventListener('click', function() {
    playButtonSound(); // Воспроизводим звук
    
    // Добавляем небольшую задержку перед переходом, чтобы звук успел воспроизвестись
    setTimeout(() => {
        if (playButton.textContent === 'ПРОДОЛЖИТЬ') {
            if (localStorage.getItem('currentTime') > 0) {
                window.location.href = 'game.html'; 
            }
            else {
                window.location.href = 'score.html';
            }
        }
        else {
            window.location.href = 'team.html';
        }
    }, 500); // 200мс задержка
});

// Функция для проверки наличия данных о командах
function hasTeamsData() {
    const teamsList = localStorage.getItem('teamsList');
    
    // Проверяем, есть ли хотя бы одна команда и есть ли данные об очках
    return teamsList && teamsList.length > 2; // teamsList.length > 2 потому что "[]" имеет длину 2
}

// Функция для обновления текста кнопки
function updatePlayButtonText() {
    if (hasTeamsData()) {
        playButton.textContent = 'ПРОДОЛЖИТЬ';
    } else {
        playButton.textContent = 'ИГРАТЬ';
    }
}

// Функция для получения параметров из URL
function getUrlParams() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams;
}

// Функция для обработки параметра 'words' из URL
function processWordsParam() {
    const urlParams = getUrlParams();
    if (urlParams.has('words')) {
        const wordsString = urlParams.get('words');
        const wordsList = wordsString.split('%'); // Разделяем строку по пробелам
        localStorage.setItem('customWords', JSON.stringify(wordsList)); // Сохраняем массив слов как JSON строку
        console.log('Список слов из URL:', wordsList); // Выводим список слов в консоль
    }
}

// Вызываем функцию обработки параметров при загрузке страницы
processWordsParam();
loadSettings(); // Загружаем сохраненные настройки
setupEventListeners(); // Настраиваем обработчики событий
updateValue(pointsSlider, pointsValue); // Инициализируем отображаемые значения
updateValue(timeSlider, timeValue);
updatePlayButtonText(); // Обновляем текст кнопки при загрузке