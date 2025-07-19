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
    
    // Показываем финальные очки
    const savedScore = parseInt(localStorage.getItem('currentScore')) || 0;
    finalScoreElement.textContent = savedScore;

    // Получаем список команд и их очки
    const teamsList = JSON.parse(localStorage.getItem('teamsList')) || [];
    const teamsScores = JSON.parse(localStorage.getItem('teamsScores')) || {};
    let currentTeamIndex = parseInt(localStorage.getItem('currentTeamIndex')) || 0;
    const roundsPlayed = JSON.parse(localStorage.getItem('roundsPlayed')) || {};
    const pointsToWin = parseInt(localStorage.getItem('pointsValue')) || 50;


    console.log('Очков до победы:', pointsToWin);
    console.log('roundsPlayed:', roundsPlayed);
    console.log('teamsScores:', teamsScores);
    console.log('savedScore:', savedScore);

    // Функция для проверки условий победы
    function checkWinConditions() {
        // Получаем минимальное количество сыгранных раундов среди всех команд
        const roundsValues = Object.values(roundsPlayed);
        if (roundsValues.length === 0) return false;
        
        const minRounds = Math.min(...roundsValues);

        // Проверяем каждую команду на соответствие условиям победы
        for (const team in teamsScores) {
            const teamScore = teamsScores[team];
            const teamRounds = roundsPlayed[team] || 0;
            
            // Условия победы:
            // 1. Очки команды >= pointsToWin
            // 2. Количество раундов команды == минимальному количеству раундов среди всех команд
            if (teamScore >= pointsToWin && teamRounds === minRounds) {
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
        const updatedTeamsScores = {...teamsScores};
        
        // Создаем массив объектов {team, score} для сортировки
        const teamsForSorting = teamsList.map(team => {
            let teamScore = updatedTeamsScores[team] || 0;
            
            // Добавляем очки текущего раунда для текущей команды
            if (teamsList.indexOf(team) === currentTeamIndex) {
                teamScore += savedScore;
                updatedTeamsScores[team] = teamScore;
            }
            
            return {
                name: team,
                score: teamScore
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
                <span class="team-score">${team.score}</span>
              </div>`;
        });
        
        teamsScoresListElement.innerHTML = teamsHTML;

        // Проверяем условия победы после обновления данных
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
            // Сохраняем очки текущей команды
            const currentTeam = teamsList[currentTeamIndex];
            teamsScores[currentTeam] = (teamsScores[currentTeam] || 0) + parseInt(savedScore);
            localStorage.setItem('teamsScores', JSON.stringify(teamsScores));
            
            // Увеличиваем индекс команды (с зацикливанием)
            currentTeamIndex = (currentTeamIndex + 1) % teamsList.length;
            localStorage.setItem('currentTeamIndex', currentTeamIndex.toString());
        }

        // Сбрасываем игровые данные только при переходе в игру
        resetGameData();
        window.location.href = 'game.html';
    });
    
    // Обработчик кнопки "Настройки"
    settingsButton.addEventListener('click', function() {
        // Сбрасываем игровые данные только при переходе в настройки
        resetGameData();
        window.location.href = 'setting.html';
    });
    
    // Функция сброса игровых данных
    function resetGameData() {
        localStorage.removeItem('currentTime');
        localStorage.removeItem('currentScore');
    }
    
});