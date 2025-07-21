// Массив с вариантами текста
const textVariants = [
    // 🔞 На грани фола
    "Бешеные Хомяки",
    "Пьяные Еноты",
    "Голые Факты",
    "Секс, наркотики и бабло",
    "Без тормозов",
    
    // 🍑 Откровенно пошлые
    "Мягкие Подушки",
    "Горячие Перцы",
    "Без Трусов",
    "Твёрдые Орешки",
    "Мокрые Мечты",
    
    // 🍻 Алкогольная тема
    "Водка 0.5",
    "Пивные Боги",
    "Коньяк в Носках",
    "Шампанское с Горчицей",
    "Похмельные Ангелы",
    
    // 💩 Туалетный юмор
    "Какашки с Блёстками",
    "Вонючие Носки",
    "Говноход",
    "Обосрамс",
    "Туалетный Патруль",
    
    // 🎮 Геймерские приколы
    "Нубские Пончики",
    "Лагующие Кибердеды",
    "Читерские Свиньи",
    "Респавн в Аду",
    "Босс Финальный",
    
    // 🍗 Еда и напитки
    "Жареные Пельмени",
    "Пицца с Ананасами",
    "Суп с Котом",
    "Бургеры с Душой",
    "Шаурма Без Огурцов",
    
    // 🐾 Животные-хулиганы
    "Бешеные Бобры",
    "Ленивые Панды",
    "Агрессивные Хомячки",
    "Пьяные Пингвины",
    "Коты-Убийцы",
    
    // 💀 Мрачный юмор
    "Криповые Клоуны",
    "Маньяки в Пижамах",
    "Черепа с Розами",
    "Зомби на Диете",
    "Вампиры-Алкоголики",
    
    // 🚀 Абсурдные комбинации
    "Космонавты с Лопатой",
    "Динозавры в Лифте",
    "Инопланетяне в Тапочках",
    "Роботы с Душой",
    "Пришельцы из Туалета",
    
    // Добавим ещё 5 эксклюзивных
    "Дед Инсайд",
    "Оффники в Уане",
    "Гопники в Коде",
    "Чай с Пельменями",
    "Дискорд в 3AM"
];

// Создаем аудио элемент для звука нажатия кнопки
const buttonSound = new Audio('static/sound/button-click.mp3');

const playSetting = document.getElementById('play-setting');         // Кнопка сброса настроек
const playButton = document.getElementById('play-button');
const addTeamBtn = document.getElementById('add-team-btn');

// Функция для воспроизведения звука кнопки
function playButtonSound() {
    buttonSound.currentTime = 0; // Перематываем звук на начало
    buttonSound.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
}

playSetting.addEventListener('click', function() {
    playButtonSound(); // Воспроизводим звук
    
    // Добавляем небольшую задержку перед переходом, чтобы звук успел воспроизвестись
    setTimeout(() => {
        window.location.href='setting.html'
    }, 500); // 200мс задержка
});

playButton.addEventListener('click', function() {
    playButtonSound(); // Воспроизводим звук
    
    // Добавляем небольшую задержку перед переходом, чтобы звук успел воспроизвестись
    setTimeout(() => {
        window.location.href='game.html'
    }, 500); // 200мс задержка
});

addTeamBtn.addEventListener('click', function() {
    playButtonSound(); // Воспроизводим звук
});

// Класс для управления текстовыми блоками
class ChangeableText {
    constructor(element, initialText = '') {
        this.textElement = element; // Получаем готовый элемент, а не создаем новый
        this.previousRandomIndex = -1;
        // Устанавливаем начальный текст
        this.setInitialText(initialText);
        this.setupEventListeners();
    }

    setInitialText(initialText) {
        // Если текст не передан, выбираем случайный
        const textToSet = initialText || this.getRandomText();
        this.textElement.textContent = textToSet;
        
        // Сохраняем в localStorage сразу после установки
        this.saveToLocalStorage();
    }

    getRandomText() {
        const randomIndex = this.getUniqueRandomIndex();
        return textVariants[randomIndex];
    }

    getUniqueRandomIndex() {
        if (textVariants.length <= 1) return 0;
        
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * textVariants.length);
        } while (randomIndex === this.previousRandomIndex);
        
        this.previousRandomIndex = randomIndex;
        return randomIndex;
    }

    setRandomText() {
        const newText = this.getRandomText();
        this.textElement.textContent = newText;
        this.saveToLocalStorage();
        
        // Обновляем общий список команд и их очки
        TeamManager.updateTeamsListInStorage();
    }

    setupEventListeners() {
        // Для десктопов
        this.textElement.addEventListener('dblclick', () => {
            this.setRandomText();
            this.animateTextChange();
        });
        
        // Для мобильных устройств
        let lastTap = 0;
        this.textElement.addEventListener('touchend', (event) => {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            
            if (tapLength < 300 && tapLength > 0) {
                this.setRandomText();
                this.animateTextChange();
                event.preventDefault();
            }
            lastTap = currentTime;
        });
    }

    animateTextChange() {
        this.textElement.style.opacity = 0;
        setTimeout(() => {
            this.textElement.style.opacity = 1;
            this.textElement.style.transition = 'opacity 0.3s ease';
        }, 50);
    }

    saveToLocalStorage() {
        const teamId = this.textElement.parentElement.id; // Получаем ID из родителя
        localStorage.setItem(teamId, this.textElement.textContent);
        // Обновляем очки команды (если их нет - устанавливаем 0)
        TeamManager.updateTeamScore(this.textElement.textContent, 0);
    }
}

// Главный контроллер для управления командами
class TeamManager {
    constructor() {
        this.maxTeams = 5;
        this.minTeams = 2;
        this.teamsContainer = document.querySelector('.main-team-block');
        this.addTeamBtn = document.getElementById('add-team-btn');
        this.teams = [];
        
        this.init();
    }

    init() {
        this.loadTeams();
        this.addTeamBtn.addEventListener('click', () => this.addNewTeam());
    }

    // Метод для получения списка команд с их очками
    static getTeamsWithScores() {
        const teams = {};
        Object.keys(localStorage)
            .filter(key => key.startsWith('team-'))
            .sort()
            .forEach(key => {
                const teamName = localStorage.getItem(key);
                if (teamName) {
                    // Получаем очки команды или устанавливаем 0, если их нет
                    teams[teamName] = parseInt(localStorage.getItem(`score-${teamName}`)) || 0;
                }
            });
        return teams;
    }

    // Метод для получения списка команд с количеством раундов
    static getTeamsWithRounds() {
        const teamsRounds = JSON.parse(localStorage.getItem('teamsRounds')) || {};
        // Обновляем список, добавляя новые команды с 0 раундов
        Object.keys(localStorage)
            .filter(key => key.startsWith('team-'))
            .forEach(key => {
                const teamName = localStorage.getItem(key);
                if (teamName && !teamsRounds.hasOwnProperty(teamName)) {
                    teamsRounds[teamName] = 0;
                }
            });
        return teamsRounds;
    }

    // Метод для обновления очков команды
    static updateTeamScore(teamName, score) {
        localStorage.setItem(`score-${teamName}`, score.toString());
    }

    // Метод для обновления количества раундов команды
    static updateTeamRounds(teamName, rounds) {
        const teamsRounds = this.getTeamsWithRounds();
        teamsRounds[teamName] = rounds;
        localStorage.setItem('teamsRounds', JSON.stringify(teamsRounds));
    }

    loadTeams() {
        const savedTeams = Object.keys(localStorage)
            .filter(key => key.startsWith('team-'))
            .sort();
        
        if (savedTeams.length > 0) {
            // Загружаем сохраненные команды
            savedTeams.forEach(teamId => {
                const savedText = localStorage.getItem(teamId);
                this.createTeamElement(teamId, savedText);
                // Устанавливаем начальные значения (0) для загруженной команды
                if (savedText) {
                    TeamManager.updateTeamScore(savedText, 0);
                    TeamManager.updateTeamRounds(savedText, 0);
                }
            });
            
            // Добавляем недостающие команды до минимального количества
            while (this.teams.length < this.minTeams) {
                this.addNewTeam();
            }
        } else {
            // Создаем новые команды - они автоматически сохранятся
            for (let i = 0; i < this.minTeams; i++) {
                this.addNewTeam();
            }
        }
    }

    // Статический метод для обновления списков команд в localStorage
    static updateTeamsListsInStorage() {
        const teamsWithScores = this.getTeamsWithScores();
        const teamsWithRounds = this.getTeamsWithRounds();
        
        localStorage.setItem('teamsWithScores', JSON.stringify(teamsWithScores));
        localStorage.setItem('teamsRounds', JSON.stringify(teamsWithRounds));
    }

    // Добавляем метод для сохранения списков команд
    saveTeamsLists() {
        TeamManager.updateTeamsListsInStorage();
    }

    createTeamElement(teamId, initialText = '') {
        if (this.teams.length >= this.maxTeams) return;
        
        const teamItem = document.createElement('div');
        teamItem.className = 'team-item';
        teamItem.id = teamId;
        
        const textElement = document.createElement('div');
        textElement.className = 'changeable-text';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-team-btn';
        deleteBtn.textContent = 'X';
        deleteBtn.addEventListener('click', () => this.removeTeam(teamItem));

        deleteBtn.addEventListener('click', function() {
            playButtonSound();
        });
        
        teamItem.appendChild(textElement);
        teamItem.appendChild(deleteBtn);
        
        this.teamsContainer.insertBefore(teamItem, this.addTeamBtn);
        
        const team = new ChangeableText(
            textElement,
            initialText
        );
        
        this.teams.push({
            id: teamId,
            element: teamItem,
            text: team
        });
        
        this.updateButtonsVisibility();
        this.saveTeamsLists();
    }

    addNewTeam() {
        if (this.teams.length >= this.maxTeams) return;
        
        const newId = `team-${Date.now()}`;
        this.createTeamElement(newId);
    }

    removeTeam(teamElement) {
        if (this.teams.length <= this.minTeams) return;
        
        const teamIndex = this.teams.findIndex(t => t.element === teamElement);
        if (teamIndex !== -1) {
            const teamName = this.teams[teamIndex].text.textElement.textContent;
            
            teamElement.remove();
            const [removedTeam] = this.teams.splice(teamIndex, 1);
            
            localStorage.removeItem(removedTeam.id);
            localStorage.removeItem(`score-${teamName}`);
            
            // Удаляем информацию о раундах для этой команды
            const teamsRounds = TeamManager.getTeamsWithRounds();
            delete teamsRounds[teamName];
            localStorage.setItem('teamsRounds', JSON.stringify(teamsRounds));
            
            this.updateButtonsVisibility();
            this.saveTeamsLists();
        }
    }

    updateButtonsVisibility() {
        this.addTeamBtn.style.display = this.teams.length >= this.maxTeams ? 'none' : 'block';
        
        this.teams.forEach(team => {
            const deleteBtn = team.element.querySelector('.delete-team-btn');
            if (deleteBtn) {
                deleteBtn.style.display = this.teams.length > this.minTeams ? 'block' : 'none';
            }
        });
    }
}

let teamManager;

document.addEventListener('DOMContentLoaded', () => {
    new TeamManager();

    // Выводим в консоль оба списка
    console.log('Список команд с очками:', TeamManager.getTeamsWithScores());
    console.log('Список команд с раундами:', TeamManager.getTeamsWithRounds());
});