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
        
        // Обновляем общий список команд
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

    // Метод для получения списка команд
    static getTeamsList() {
        return Object.keys(localStorage)
            .filter(key => key.startsWith('team-'))
            .sort()
            .map(key => localStorage.getItem(key))
            .filter(Boolean); // Фильтруем возможные null/undefined
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

    // Статический метод для обновления списка команд в localStorage
    static updateTeamsListInStorage() {
        const teamsList = this.getTeamsList();
        localStorage.setItem('teamsList', JSON.stringify(teamsList));
    }

    // Добавляем метод для сохранения списка команд
    saveTeamsList() {
        const teamsList = TeamManager.getTeamsList();
        localStorage.setItem('teamsList', JSON.stringify(teamsList));
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
            playButtonSound(); // Воспроизводим звук
        });
        
        teamItem.appendChild(textElement);
        teamItem.appendChild(deleteBtn);
        
        this.teamsContainer.insertBefore(teamItem, this.addTeamBtn);
        
        // Создаем экземпляр ChangeableText - текст сохранится автоматически в конструкторе
        const team = new ChangeableText(
            textElement,
            initialText // Передаем либо сохраненный текст, либо undefined (будет случайный)
        );
        
        this.teams.push({
            id: teamId,
            element: teamItem,
            text: team
        });
        
        this.updateButtonsVisibility();
        this.saveTeamsList();
    }

    addNewTeam() {
        if (this.teams.length >= this.maxTeams) return;
        
        const newId = `team-${Date.now()}`;
        this.createTeamElement(newId); // Текст сохранится автоматически
    }

    removeTeam(teamElement) {
        if (this.teams.length <= this.minTeams) return;
        
        const teamIndex = this.teams.findIndex(t => t.element === teamElement);
        if (teamIndex !== -1) {
            // Удаляем из DOM
            teamElement.remove();
            
            // Удаляем из массива
            const [removedTeam] = this.teams.splice(teamIndex, 1);
            
            // Удаляем из localStorage
            localStorage.removeItem(removedTeam.id);
            
            this.updateButtonsVisibility();
            this.saveTeamsList();
        }
    }

    updateButtonsVisibility() {
        // Показываем/скрываем кнопку добавления
        this.addTeamBtn.style.display = this.teams.length >= this.maxTeams ? 'none' : 'block';
        
        // Показываем/скрываем кнопки удаления
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

// Для тестирования - выводим список команд в консоль
    console.log('Список команд:', TeamManager.getTeamsList());
});