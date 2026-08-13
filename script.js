// ==========================================
// 1. CARGA INICIAL DE PREFERENCIAS VISUALES
// ==========================================
const temaGuardado = localStorage.getItem('tema');
if (temaGuardado === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

const colorGuardado = localStorage.getItem('colorPreferido');
if (colorGuardado) document.documentElement.style.setProperty('--ij-azul-fuerte', colorGuardado);

const fuenteGuardada = localStorage.getItem('fuentePreferida');
if (fuenteGuardada) document.documentElement.style.setProperty('--fuente-app', fuenteGuardada);

// ==========================================
// 2. VERIFICACIÓN DE SEGURIDAD
// ==========================================
const currentPath = window.location.pathname;
const isLoginPage = currentPath.endsWith("index.html") || currentPath.endsWith("/Agenda/") || currentPath.endsWith("/Agenda");

if (!localStorage.getItem("app_isLoggedIn") && !isLoginPage) {
    window.location.href = "/Agenda/index.html"; 
}

// ==========================================
// 3. SISTEMA PWA (Actualizador)
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Agenda/sw.js', { scope: '/Agenda/' })
            .then(reg => reg.update())
            .catch(err => console.log('Error PWA:', err));

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                alert("Actualización detectada. Reiniciando el sistema...");
                window.location.reload();
                refreshing = true;
            }
        });
    });
}

// ==========================================
// 4. EJECUCIÓN AL CARGAR EL HTML 
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- SALUDO EN NOVEDADES ---
    const tituloNovedades = document.getElementById("tituloNovedades");
    if (tituloNovedades) {
        const currentUserName = localStorage.getItem(`name_${localStorage.getItem("app_currentUserEmail")}`);
        if (currentUserName) tituloNovedades.innerText = `Hola ${currentUserName}, mira las novedades del día de hoy`;
    }

    // --- LÓGICA DEL HORARIO ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    cells.forEach((cell, i) => {
        if(localStorage.getItem(`app_horario_${i}`)) cell.innerText = localStorage.getItem(`app_horario_${i}`);
        cell.addEventListener("input", () => localStorage.setItem(`app_horario_${i}`, cell.innerText));
    });

    // --- LÓGICA DE LA AGENDA (PENDIENTES) ---
    const taskList = document.getElementById('taskList');
    if (taskList) {
        let tasks = JSON.parse(localStorage.getItem('app_agenda_tareas')) || [{ text: "Bienvenido a tu centro de productividad", done: false }];
        window.renderTasks = function() {
            taskList.innerHTML = '';
            tasks.forEach((t, i) => {
                const styleCrossed = t.done ? 'text-decoration: line-through; color: #94A3B8;' : '';
                taskList.innerHTML += `<li class="task-item">
                    <input type="checkbox" class="task-checkbox" ${t.done ? 'checked' : ''} onchange="toggleTask(${i})">
                    <input type="text" class="task-input" value="${t.text}" oninput="updateTask(${i}, this.value)" style="${styleCrossed}">
                    <button class="btn-delete" onclick="deleteTask(${i})">✖</button>
                </li>`;
            });
            localStorage.setItem('app_agenda_tareas', JSON.stringify(tasks));
        }
        window.toggleTask = function(i) { tasks[i].done = !tasks[i].done; renderTasks(); };
        window.updateTask = function(i, val) { tasks[i].text = val; localStorage.setItem('app_agenda_tareas', JSON.stringify(tasks)); };
        window.deleteTask = function(i) { tasks.splice(i, 1); renderTasks(); };
        
        const btnAdd = document.getElementById('addTaskBtn');
        if(btnAdd) btnAdd.addEventListener('click', () => { tasks.unshift({ text: "", done: false }); renderTasks(); });
        renderTasks();
    }
    
    // --- SCROLL DEL MENÚ ---
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav) activeNav.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });

    // --- LÓGICA DE LA PESTAÑA DE AJUSTES ---
    const colorApp = document.getElementById('colorApp');
    const modoOscuro = document.getElementById('modoOscuro');
    const fuenteApp = document.getElementById('fuenteApp');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');

    if (modoOscuro) modoOscuro.checked = (localStorage.getItem('tema') === 'dark');
    if (colorApp) colorApp.value = localStorage.getItem('colorPreferido') || '#032A60';
    if (fuenteApp) fuenteApp.value = localStorage.getItem('fuentePreferida') || "'Segoe UI', sans-serif";

    if (colorApp) colorApp.addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--ij-azul-fuerte', e.target.value);
        localStorage.setItem('colorPreferido', e.target.value);
    });
    if (fuenteApp) fuenteApp.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--fuente-app', e.target.value);
        localStorage.setItem('fuentePreferida', e.target.value);
    });
    if (modoOscuro) modoOscuro.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('tema', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('tema', 'light');
        }
    });
    if (btnCerrarSesion) btnCerrarSesion.addEventListener('click', () => {
        localStorage.removeItem("app_isLoggedIn");
        window.location.href = "/Agenda/index.html"; 
    });


    // ==========================================
    // 5. MÓDULOS DE PRODUCTIVIDAD (NUEVOS)
    // ==========================================
    
    // A. Mostrar/Ocultar Paneles
    const setupToggle = (btnId, panelId) => {
        const btn = document.getElementById(btnId);
        const panel = document.getElementById(panelId);
        if (btn && panel) {
            btn.addEventListener('click', () => panel.classList.toggle('hidden'));
        }
    };
    setupToggle('btnPomodoro', 'panelPomodoro');
    setupToggle('btnNotas', 'panelNotas');
    setupToggle('btnHabitos', 'panelHabitos');

    // B. Notas Rápidas (Autoguardado)
    const quickNotes = document.getElementById('quickNotes');
    if (quickNotes) {
        quickNotes.value = localStorage.getItem('app_notas_rapidas') || '';
        quickNotes.addEventListener('input', () => localStorage.setItem('app_notas_rapidas', quickNotes.value));
    }

    // C. Top 3 Prioridades (Autoguardado)
    const prioridades = ['prio1', 'prio2', 'prio3'];
    prioridades.forEach(prio => {
        const input = document.getElementById(prio);
        if (input) {
            input.value = localStorage.getItem(`app_${prio}`) || '';
            input.addEventListener('input', () => localStorage.setItem(`app_${prio}`, input.value));
        }
    });

    // D. Hábitos (Reinicio Diario a Medianoche)
    const habitos = ['habito1', 'habito2', 'habito3'];
    const hoy = new Date().toDateString(); // Ej: "Thu Aug 13 2026"
    const fechaGuardada = localStorage.getItem('app_habitos_fecha');

    if (fechaGuardada !== hoy) {
        // Es un nuevo día, borramos los checks
        habitos.forEach(h => localStorage.removeItem(`app_${h}`));
        localStorage.setItem('app_habitos_fecha', hoy);
    }
    
    habitos.forEach(h => {
        const checkbox = document.getElementById(h);
        if (checkbox) {
            checkbox.checked = localStorage.getItem(`app_${h}`) === 'true';
            checkbox.addEventListener('change', () => localStorage.setItem(`app_${h}`, checkbox.checked));
        }
    });

    // E. Temporizador Pomodoro
    const timerDisplay = document.getElementById('timerDisplay');
    const btnStartTimer = document.getElementById('btnStartTimer');
    const btnPauseTimer = document.getElementById('btnPauseTimer');
    const btnResetTimer = document.getElementById('btnResetTimer');
    const btnDescanso = document.getElementById('btnDescanso');

    if (timerDisplay) {
        let timerInterval;
        let timeLeft = 25 * 60; // Inicia en 25 minutos
        let isRunning = false;

        const updateDisplay = () => {
            const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const sec = (timeLeft % 60).toString().padStart(2, '0');
            timerDisplay.innerText = `${min}:${sec}`;
        };

        const playChime = () => {
            // Sonido suave nativo
            alert("⏰ ¡Tiempo terminado!");
        };

        btnStartTimer.addEventListener('click', () => {
            if (isRunning) return;
            isRunning = true;
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateDisplay();
                } else {
                    clearInterval(timerInterval);
                    isRunning = false;
                    playChime();
                }
            }, 1000);
        });

        btnPauseTimer.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
        });

        btnResetTimer.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 25 * 60;
            updateDisplay();
        });

        btnDescanso.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 5 * 60;
            updateDisplay();
        });
    }

});
