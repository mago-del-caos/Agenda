// ==========================================
// 1. VERIFICACIÓN DE SEGURIDAD (Sesión Permanente)
// ==========================================
const currentPath = window.location.pathname;
const isLoginPage = currentPath.indexOf("index.html") !== -1 || currentPath === "/Agenda/" || currentPath === "/Agenda";

// Usamos localStorage para que la sesión no se borre al cerrar la app
if (!localStorage.getItem("app_isLoggedIn") && !isLoginPage) {
    window.location.href = "index.html";
}

// ==========================================
// 2. SISTEMA PWA Y ACTUALIZADOR FORZADO
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/Agenda/sw.js', { scope: '/Agenda/' }).then((registration) => {
            console.log('Service Worker (PWA) registrado con éxito.');
            registration.update();
        }).catch((error) => {
            console.log('Error al registrar el Service Worker:', error);
        });

        let refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
                alert("Se ha detectado una actualización del sistema escolar. Reiniciando...");
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
        
        // Si hay un nombre registrado, lo muestra
        if (currentUserName) {
            tituloNovedades.innerText = `Hola ${currentUserName}, mira las novedades del día de hoy`;
        }
    }

    // --- 4. LÓGICA DEL HORARIO ---
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

    // --- 5. LÓGICA DE LA AGENDA ---
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
});