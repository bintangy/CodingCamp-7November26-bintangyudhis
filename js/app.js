document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // 1. Data Storage & Theme Feature
    // ---------------------------------------------------------
    let tasks = JSON.parse(localStorage.getItem('dashboard_tasks')) || [];
    let links = JSON.parse(localStorage.getItem('dashboard_links')) || [];
    let sortMode = localStorage.getItem('dashboard_sort') || 'default';
    
    function saveTasks() { localStorage.setItem('dashboard_tasks', JSON.stringify(tasks)); }
    function saveLinks() { localStorage.setItem('dashboard_links', JSON.stringify(links)); }

    // FEATURE 1: Light / Dark Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    let isDarkMode = localStorage.getItem('dashboard_theme') === 'dark';
    
    function applyTheme() {
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeToggle.textContent = isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode';
    }
    
    applyTheme(); // Initial call
    
    themeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        localStorage.setItem('dashboard_theme', isDarkMode ? 'dark' : 'light');
        applyTheme();
    });

    // ---------------------------------------------------------
    // 2. Greeting Widget
    // ---------------------------------------------------------
    const timeEl = document.getElementById('greeting-time');
    const dateEl = document.getElementById('greeting-date');
    const textEl = document.getElementById('greeting-text');

    function updateGreeting() {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('en-US', { hour12: false });
        dateEl.textContent = now.toLocaleDateString('en-US', { 
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
        });
        
        const hour = now.getHours();
        if (hour >= 5 && hour < 12) textEl.textContent = "Good morning";
        else if (hour >= 12 && hour < 17) textEl.textContent = "Good afternoon";
        else if (hour >= 17 && hour < 21) textEl.textContent = "Good evening";
        else textEl.textContent = "Good night";
    }
    
    setInterval(updateGreeting, 1000);
    updateGreeting();

    // ---------------------------------------------------------
    // 3. Focus Timer Widget (With Custom Time Feature)
    // ---------------------------------------------------------
    const timerDisplay = document.getElementById('timer-display');
    const timerInput = document.getElementById('timer-input');
    const btnSetTime = document.getElementById('btn-set-time');
    
    // FEATURE 2: Change Pomodoro Time
    let savedMinutes = parseInt(localStorage.getItem('dashboard_timer_mins')) || 25;
    let DEFAULT_TIME = savedMinutes * 60; 
    let timeLeft = DEFAULT_TIME;
    let timerInterval = null;
    timerInput.value = savedMinutes;

    function formatTime(seconds) {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    function updateTimerDisplay() {
        timerDisplay.textContent = formatTime(timeLeft);
    }

    btnSetTime.addEventListener('click', () => {
        const newMins = parseInt(timerInput.value);
        if (newMins > 0) {
            savedMinutes = newMins;
            DEFAULT_TIME = savedMinutes * 60;
            timeLeft = DEFAULT_TIME;
            localStorage.setItem('dashboard_timer_mins', savedMinutes);
            clearInterval(timerInterval);
            timerInterval = null;
            updateTimerDisplay();
        }
    });

    document.getElementById('btn-start').addEventListener('click', () => {
        if (timerInterval) return; 
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                clearInterval(timerInterval);
                timerInterval = null;
                alert('Focus session complete! Time for a break.');
            }
        }, 1000);
    });

    document.getElementById('btn-stop').addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
    });

    document.getElementById('btn-reset').addEventListener('click', () => {
        clearInterval(timerInterval);
        timerInterval = null;
        timeLeft = DEFAULT_TIME;
        updateTimerDisplay();
    });

    updateTimerDisplay();

    // ---------------------------------------------------------
    // 4. To-Do List Widget (With Sort Feature)
    // ---------------------------------------------------------
    const taskForm = document.getElementById('add-task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const sortSelect = document.getElementById('sort-tasks');
    
    sortSelect.value = sortMode;

    // FEATURE 3: Sort tasks
    sortSelect.addEventListener('change', (e) => {
        sortMode = e.target.value;
        localStorage.setItem('dashboard_sort', sortMode);
        renderTasks();
    });

    function renderTasks() {
        taskList.innerHTML = '';
        
        // Buat salinan array tasks untuk disorting
        let tasksToRender = [...tasks];
        
        if (sortMode === 'newest') {
            tasksToRender.reverse();
        } else if (sortMode === 'active') {
            tasksToRender.sort((a, b) => (a.done === b.done) ? 0 : a.done ? 1 : -1);
        } else if (sortMode === 'completed') {
            tasksToRender.sort((a, b) => (a.done === b.done) ? 0 : a.done ? -1 : 1);
        }

        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            
            const contentDiv = document.createElement('div');
            contentDiv.className = `task-content ${task.done ? 'done' : ''}`;
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.done;
            checkbox.addEventListener('change', () => {
                // Find actual task reference in main array to update
                const targetTask = tasks.find(t => t.id === task.id);
                if (targetTask) targetTask.done = checkbox.checked;
                saveTasks();
                renderTasks();
            });

            const textSpan = document.createElement('span');
            textSpan.textContent = task.text;

            contentDiv.append(checkbox, textSpan);

            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'task-actions';

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.className = 'edit';
            editBtn.addEventListener('click', () => {
                const newText = prompt('Edit your task:', task.text);
                if (newText !== null && newText.trim() !== '') {
                    const targetTask = tasks.find(t => t.id === task.id);
                    if (targetTask) targetTask.text = newText.trim();
                    saveTasks();
                    renderTasks();
                }
            });

            const delBtn = document.createElement('button');
            delBtn.innerHTML = '&times;';
            delBtn.className = 'danger';
            delBtn.title = 'Delete';
            delBtn.addEventListener('click', () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                renderTasks();
            });

            actionsDiv.append(editBtn, delBtn);
            li.append(contentDiv, actionsDiv);
            taskList.appendChild(li);
        });
    }

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ id: Date.now().toString(), text, done: false });
            saveTasks();
            taskInput.value = '';
            renderTasks();
        }
    });

    renderTasks();

    // ---------------------------------------------------------
    // 5. Quick Links Widget
    // ---------------------------------------------------------
    const linkForm = document.getElementById('add-link-form');
    const linkNameInput = document.getElementById('link-name');
    const linkUrlInput = document.getElementById('link-url');
    const linkList = document.getElementById('link-list');

    function renderLinks() {
        linkList.innerHTML = '';
        links.forEach(link => {
            const li = document.createElement('li');
            
            const a = document.createElement('a');
            a.href = link.url;
            a.textContent = link.name;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'link-item';

            const delBtn = document.createElement('button');
            delBtn.innerHTML = '&times;';
            delBtn.className = 'danger';
            delBtn.title = 'Delete Link';
            delBtn.addEventListener('click', () => {
                links = links.filter(l => l.id !== link.id);
                saveLinks();
                renderLinks();
            });

            li.append(a, delBtn);
            linkList.appendChild(li);
        });
    }

    linkForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = linkNameInput.value.trim();
        let url = linkUrlInput.value.trim();
        
        if (name && url) {
            if (!/^https?:\/\//i.test(url)) {
                url = 'https://' + url;
            }
            links.push({ id: Date.now().toString(), name, url });
            saveLinks();
            linkNameInput.value = '';
            linkUrlInput.value = '';
            renderLinks();
        }
    });

    renderLinks();
});
