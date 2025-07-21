document.addEventListener('DOMContentLoaded', function() {
    const finalScoreElement = document.getElementById('finalScore');
    const settingsButton = document.querySelector('.button-left');
    const nextButton = document.querySelector('.button-right');
    const teamsScoresListElement = document.getElementById('teamsScoresList');
    const nextTeamElement = document.getElementById('nextTeam');
    const winModal = document.getElementById('winModal');
    const winningTeamName = document.getElementById('winningTeamName');
    const winningTeamScore = document.getElementById('winningTeamScore');
    const winModalButton = document.getElementById('winModalButton');
    
    // Получаем данные из localStorage
    const savedScore = parseInt(localStorage.getItem('currentScore')) || 0;
    const teamsWithScores = JSON.parse(localStorage.getItem('teamsWithScores')) || {};
    const teamsWithRounds = JSON.parse(localStorage.getItem('teamsRounds')) || {};
    const teamsList = Object.keys(teamsWithScores);
    let currentTeamIndex = parseInt(localStorage.getItem('currentTeamIndex')) || 0;
    const pointsToWin = parseInt(localStorage.getItem('pointsValue')) || 50;

    // Показываем очки за раунд
    finalScoreElement.textContent = savedScore;

    console.log('Текущие данные:');
    console.log('Команды с очками:', teamsWithScores);
    console.log('Команды с раундами:', teamsWithRounds);
    console.log('Очки за раунд:', savedScore);
    console.log('Текущая команда:', teamsList[currentTeamIndex]);

    // Функция для проверки условий победы
    function checkWinConditions() {
        // Получаем минимальное количество сыгранных раундов среди всех команд
        const roundsValues = Object.values(teamsWithRounds);
        const scoreValues = Object.values(teamsWithScores);
        if (roundsValues.length === 0) return false;
        
        const minRounds = Math.min(...roundsValues);
        const maxValues = Math.max(...scoreValues);

        const countMaxValues = scoreValues.filter(item => item === maxValues);

        console.log('countMaxValues: ', countMaxValues.length);

        // Проверяем каждую команду на соответствие условиям победы
        for (const team in teamsWithScores) {
            const teamScore = teamsWithScores[team];
            const teamRounds = teamsWithRounds[team] || 0;
            
            // Условия победы:
            // 1. Очки команды >= pointsToWin
            // 2. Количество раундов команды == минимальному количеству раундов среди всех команд
            // 3. Очки команды == maxValues
            // 4. Количество countMaxValues.length == 1
            if (teamScore >= pointsToWin && teamScore == maxValues && teamRounds === minRounds && countMaxValues.length == 1) {
                return {
                    name: team,
                    score: teamScore
                };
            }
        }
        
        return false;
    }

    // Функция для отображения модального окна победы
    function showWinModal(winner) {
        winningTeamName.textContent = winner.name;
        winningTeamScore.textContent = `Очков: ${winner.score}`;
        winModal.style.display = 'flex';
    }

    // Обработчик для кнопки в модальном окне победы
    winModalButton.addEventListener('click', function() {
        winModal.style.display = 'none';
        window.location.href = 'setting.html';
    });

    // Отображаем список всех команд с их очками
    if (teamsList.length > 0) {
        let teamsHTML = '';
        
        // Создаем массив объектов {team, score} для сортировки
        const teamsForSorting = teamsList.map(team => {
            return {
                name: team,
                score: teamsWithScores[team] || 0
            };
        });
        
        // Сортируем команды по убыванию очков
        teamsForSorting.sort((a, b) => b.score - a.score);
        
        // Формируем HTML для отображения
        teamsForSorting.forEach(team => {
            const isCurrentTeam = team.name === teamsList[currentTeamIndex];
            const teamClass = isCurrentTeam ? 'current-team' : '';
            teamsHTML += `<div class="team-score-item ${teamClass}">
                <span class="team-name">${team.name}</span>
                <span class="team-score"> ${team.score}</span>
              </div>`;
        });
        
        teamsScoresListElement.innerHTML = teamsHTML;

        // Проверяем условия победы
        const winner = checkWinConditions();
        if (winner) {
            showWinModal(winner);
        }
    }

    // Определяем следующую команду
    if (teamsList.length > 0) {
        const nextTeamIndex = (currentTeamIndex + 1) % teamsList.length;
        nextTeamElement.textContent = teamsList[nextTeamIndex];
    }
    
    // Обработчик кнопки "ДАЛЬШЕ" (меняем команду и переходим в игру)
    nextButton.addEventListener('click', function() {
        if (teamsList.length > 0) {
            // Переключаем на следующую команду
            currentTeamIndex = (currentTeamIndex + 1) % teamsList.length;
            localStorage.setItem('currentTeamIndex', currentTeamIndex.toString());
        }

        // Сбрасываем игровые данные
        resetGameData();
        window.location.href = 'game.html';
    });
    
    // Обработчик кнопки "Настройки"
    settingsButton.addEventListener('click', function() {
        // Сбрасываем игровые данные
        resetGameData();
        window.location.href = 'setting.html';
    });
    
    // Функция сброса игровых данных
    function resetGameData() {
        localStorage.removeItem('currentTime');
        localStorage.removeItem('currentScore');
    }
});