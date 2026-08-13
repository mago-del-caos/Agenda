// ==========================================
// 1. VERIFICACIÓN DE SEGURIDAD (Sesión Permanente)
// ==========================================
const currentPath = window.location.pathname;
const isLoginPage = currentPath.endsWith("index.html") || currentPath.endsWith("/Agenda/") || currentPath.endsWith("/Agenda");

if (!localStorage.getItem("app_isLoggedIn") && !isLoginPage) {
    window.location.href = "index.html";
}

// ==========================================
// 2. SISTEMA PWA Y ACTUALIZADOR FORZADO
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Agenda/sw.js', { scope: '/Agenda/' }).then((registration) => {
            console.log('[Araknia PWA] Motor registrado con éxito.');
            registration.update();
        }).catch((error) => {
            console.log('[Araknia PWA] Error al registrar el motor:', error);
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                console.log("[Araknia PWA] Actualización detectada. Reiniciando...");
                window.location.reload();
                refreshing = true;
            }
        });
    });
}

// ==========================================
// EJECUCIÓN AL CARGAR LAS PÁGINAS HTML
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 3. SALUDO PERSONALIZADO EN NOVEDADES ---
    const tituloNovedades = document.getElementById("tituloNovedades");
    if (tituloNovedades) {
        const currentUserEmail = localStorage.getItem("app_currentUserEmail");
        const currentUserName = localStorage.getItem(`name_${currentUserEmail}`);
        if (currentUserName) {
            tituloNovedades.innerText = `Hola ${currentUserName}, mira las novedades del día de hoy`;
        }
    }

    // --- 4. LÓGICA DEL HORARIO (Guardado automático) ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    if (cells.length > 0) {
        cells.forEach((cell, index) => {
            const savedValue = localStorage.getItem(`app_horario_${index}`);
            if (savedValue !== null) cell.innerText = savedValue;

            cell.addEventListener("input", () => {
                localStorage.setItem(`app_horario_${index}`, cell.innerText);
            });
        });
    }

    // --- 5. LÓGICA DE LA AGENDA (Guardado en memoria) ---
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn');
    
    if (taskList) {
        let tasks = JSON.parse(localStorage.getItem('app_agenda_tareas')) || [
            { text: "Bienvenido a tu agenda escolar Ag lucem", done: false }
        ];

        function renderTasks() {
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'task-item';
                
                const styleCrossed = task.done ? 'text-decoration: line-through; color: #94A3B8;' : '';
                
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
                    <input type="text" class="task-input" value="${task.text}" oninput="updateTask(${index}, this.value)" style="${styleCrossed}" placeholder="Escribe una nueva tarea...">
                    <button class="btn-delete" onclick="deleteTask(${index})" title="Eliminar tarea">✖</button>
                `;
                taskList.appendChild(li);
            });
            localStorage.setItem('app_agenda_tareas', JSON.stringify(tasks));
        }

        window.toggleTask = function(index) {
            tasks[index].done = !tasks[index].done;
            renderTasks();
        };

        window.updateTask = function(index, newText) {
            tasks[index].text = newText;
            localStorage.setItem('app_agenda_tareas', JSON.stringify(tasks));
        };

        window.deleteTask = function(index) {
            tasks.splice(index, 1);
            renderTasks();
        };

        if(btnAdd){
            btnAdd.addEventListener('click', () => {
                tasks.unshift({ text: "", done: false }); 
                renderTasks();
                
                setTimeout(() => {
                    const firstInput = document.querySelector('.task-list .task-input');
                    if (firstInput) {
                        firstInput.focus();
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                    }
                }, 50);
            });
        }
        renderTasks();
    }
    
    // --- 6. AUTO-SCROLL EN EL MENÚ SUPERIOR ---
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav) {
        activeNav.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    }

    // ==========================================
    // 7. MÓDULO GLOBAL DE AJUSTES Y CERRAR SESIÓN
    // ==========================================
    const btnAjustes = document.getElementById('btnAjustes');
    const panelAjustes = document.getElementById('panelAjustes');
    const colorApp = document.getElementById('colorApp');
    const modoOscuro = document.getElementById('modoOscuro');
    const btnCerrarSesion = document.getElementById('btnCerrarSesion');

    // A. Aplicar preferencias guardadas sin importar en qué pantalla estemos
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado === 'dark') {
        if(modoOscuro) modoOscuro.checked = true;
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    const colorGuardado = localStorage.getItem('colorPreferido');
    if (colorGuardado) {
        if(colorApp) colorApp.value = colorGuardado;
        document.documentElement.style.setProperty('--ij-azul-fuerte', colorGuardado);
    }

    // B. Lógica de los botones (solo si existen en el HTML actual)
    if (btnAjustes && panelAjustes) {
        btnAjustes.addEventListener('click', () => {
            panelAjustes.classList.toggle('hidden');
        });
    }

    if (colorApp) {
        colorApp.addEventListener('input', (e) => {
            const nuevoColor = e.target.value;
            document.documentElement.style.setProperty('--ij-azul-fuerte', nuevoColor);
            localStorage.setItem('colorPreferido', nuevoColor);
        });
    }

    if (modoOscuro) {
        modoOscuro.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('tema', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('tema', 'light');
            }
        });
    }

    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener('click', () => {
            // Eliminar las llaves de seguridad de la sesión
            localStorage.removeItem("app_isLoggedIn");
            localStorage.removeItem("app_currentUserEmail");
            
            // Redirigir al inicio de sesión
            window.location.href = "index.html";
        });
    }
});