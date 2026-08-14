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
// 3. SISTEMA PWA (Actualizador Automático)
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
    const btnActualizarApp = document.getElementById('btnActualizarApp');

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

    // 💥 NUEVO: BOTÓN DE ACTUALIZACIÓN CON BARRA DE 10 SEGUNDOS
    if (btnActualizarApp) {
        btnActualizarApp.addEventListener('click', () => {
            if (confirm("¿Forzar actualización? El sistema se limpiará y recargará en 10 segundos.")) {
                
                const progressContainer = document.getElementById('updateProgressContainer');
                const progressBar = document.getElementById('updateProgressBar');
                const progressText = document.getElementById('updateProgressText');

                // Mostrar la barra visualmente y deshabilitar botones
                progressContainer.classList.remove('hidden');
                btnActualizarApp.disabled = true;
                btnActualizarApp.style.opacity = '0.5';
                if (btnCerrarSesion) btnCerrarSesion.style.display = 'none';

                // 1. Iniciar la limpieza pesada en segundo plano
                (async () => {
                    try {
                        if ('serviceWorker' in navigator) {
                            const registrations = await navigator.serviceWorker.getRegistrations();
                            for (let registration of registrations) {
                                await registration.unregister();
                            }
                        }
                        if ('caches' in window) {
                            const cacheNames = await caches.keys();
                            for (let name of cacheNames) {
                                await caches.delete(name);
                            }
                        }
                    } catch (error) {
                        console.error("Error limpiando memoria:", error);
                    }
                })();

                // 2. Controlar la barra de 10 segundos (10,000 ms)
                let progress = 0;
                const totalTime = 10000; 
                const intervalTime = 100; // Actualizamos cada 100 milisegundos para que sea fluido
                const increment = (intervalTime / totalTime) * 100;

                const progressTimer = setInterval(() => {
                    progress += increment;
                    
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(progressTimer);
                        progressText.innerText = "¡Sistema listo! Reiniciando...";
                        progressBar.style.width = "100%";
                        
                        // Recargar la página limpia
                        setTimeout(() => {
                            window.location.reload(true);
                        }, 500);
                    } else {
                        progressBar.style.width = `${progress}%`;
                        progressText.innerText = `Limpiando e instalando... ${Math.floor(progress)}%`;
                    }
                }, intervalTime);
            }
        });
    }

    // ==========================================
    // 5. MÓDULOS DE PRODUCTIVIDAD
    // ==========================================
    
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

    const quickNotes = document.getElementById('quickNotes');
    if (quickNotes) {
        quickNotes.value = localStorage.getItem('app_notas_rapidas') || '';
        quickNotes.addEventListener('input', () => localStorage.setItem('app_notas_rapidas', quickNotes.value));
    }

    const prioridades = ['prio1', 'prio2', 'prio3'];
    prioridades.forEach(prio => {
        const input = document.getElementById(prio);
        if (input) {
            input.value = localStorage.getItem(`app_${prio}`) || '';
            input.addEventListener('input', () => localStorage.setItem(`app_${prio}`, input.value));
        }
    });

    const habitosContainer = document.getElementById('habitosContainer');
    if (habitosContainer) {
        habitosContainer.innerHTML = ''; 
        
        for (let i = 1; i <= 3; i++) {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.alignItems = 'center';
            row.style.gap = '8px';
            row.style.marginBottom = '15px';
            row.style.flexWrap = 'wrap';
            
            row.innerHTML = `
                <input type="text" id="habitoNombre${i}" placeholder="Escribe tu hábito ${i}..." style="flex: 1; min-width: 150px; padding: 10px; border-radius: 8px; border: 1px solid var(--borde); font-family: var(--fuente-app); background: var(--fondo-app); color: var(--texto-oscuro);">
                <div style="display: flex; align-items: center; gap: 5px; background: var(--fondo-app); padding: 5px; border-radius: 8px; border: 1px solid var(--borde);">
                    <button id="btnHabitoMinus${i}" style="border: none; background: transparent; font-size: 1.2rem; cursor: pointer;">➖</button>
                    <span id="habitoCount${i}" style="font-weight: bold; width: 45px; text-align: center; color: var(--texto-oscuro);">0/33</span>
                    <button id="btnHabitoPlus${i}" style="border: none; background: transparent; font-size: 1.2rem; cursor: pointer;">➕</button>
                </div>
                <button id="btnHabitoClear${i}" style="border: none; background: transparent; font-size: 1.4rem; cursor: pointer;" title="Borrar Hábito">🗑️</button>
            `;
            habitosContainer.appendChild(row);

            const inputNombre = document.getElementById(`habitoNombre${i}`);
            const textCount = document.getElementById(`habitoCount${i}`);
            const btnMinus = document.getElementById(`btnHabitoMinus${i}`);
            const btnPlus = document.getElementById(`btnHabitoPlus${i}`);
            const btnClear = document.getElementById(`btnHabitoClear${i}`);

            inputNombre.value = localStorage.getItem(`app_habito_nombre_${i}`) || '';
            let count = parseInt(localStorage.getItem(`app_habito_count_${i}`)) || 0;
            textCount.innerText = `${count}/33`;

            inputNombre.addEventListener('input', () => localStorage.setItem(`app_habito_nombre_${i}`, inputNombre.value));

            btnPlus.addEventListener('click', () => {
                if (count < 33) {
                    count++;
                    localStorage.setItem(`app_habito_count_${i}`, count);
                    textCount.innerText = `${count}/33`;
                    
                    if (count === 33) {
                        setTimeout(() => alert(`🎉 ¡FELICIDADES!\nHas completado los 33 días de tu hábito: "${inputNombre.value}".\n¡Ya es parte de ti!`), 300);
                    }
                }
            });

            btnMinus.addEventListener('click', () => {
                if (count > 0) {
                    count--;
                    localStorage.setItem(`app_habito_count_${i}`, count);
                    textCount.innerText = `${count}/33`;
                }
            });

            btnClear.addEventListener('click', () => {
                if (confirm('¿Estás seguro de borrar este hábito y reiniciar su contador?')) {
                    count = 0;
                    inputNombre.value = '';
                    localStorage.removeItem(`app_habito_nombre_${i}`);
                    localStorage.removeItem(`app_habito_count_${i}`);
                    textCount.innerText = `0/33`;
                }
            });
        }
    }

    const timerDisplay = document.getElementById('timerDisplay');
    const btnStartTimer = document.getElementById('btnStartTimer');
    const btnPauseTimer = document.getElementById('btnPauseTimer');
    const btnResetTimer = document.getElementById('btnResetTimer');
    const btnDescanso = document.getElementById('btnDescanso');

    if (timerDisplay) {
        let timerInterval;
        let timeLeft = 25 * 60; 
        let isRunning = false;

        const updateDisplay = () => {
            const min = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const sec = (timeLeft % 60).toString().padStart(2, '0');
            timerDisplay.innerText = `${min}:${sec}`;
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
                    alert("⏰ ¡Tiempo de enfoque terminado! Toma un descanso.");
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
