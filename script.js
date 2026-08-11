// ==========================================
// 1. VERIFICACIÓN DE SEGURIDAD (Obliga al Login)
// ==========================================
// Si el alumno no ha iniciado sesión y no está en la página de login, lo expulsa.
// Se añade la validación para la ruta principal /Agenda/ de GitHub Pages.
const currentPath = window.location.pathname;
const isLoginPage = currentPath.indexOf("index.html") !== -1 || currentPath === "/Agenda/" || currentPath === "/Agenda";

if (!sessionStorage.getItem("isLoggedIn") && !isLoginPage) {
    window.location.href = "index.html";
}

// ==========================================
// 2. SISTEMA PWA Y ACTUALIZADOR FORZADO
// ==========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Le indicamos explícitamente la ruta y el scope de GitHub Pages
        navigator.serviceWorker.register('/Agenda/sw.js', { scope: '/Agenda/' }).then((registration) => {
            console.log('Service Worker (PWA) registrado con éxito.');
            
            // Obliga al navegador a buscar si hay una nueva versión del sw.js en el servidor
            registration.update();
        }).catch((error) => {
            console.log('Error al registrar el Service Worker:', error);
        });

        // Detecta si se instaló una nueva versión de la app y recarga la página
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
    
    // --- 3. LÓGICA DEL HORARIO (Solo se ejecuta si existe la tabla de horario) ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    if (cells.length > 0) {
        cells.forEach((cell, index) => {
            // Carga los datos previamente guardados
            const savedValue = localStorage.getItem(`app_horario_${index}`);
            if (savedValue !== null) cell.innerText = savedValue;

            // Guarda automáticamente cada letra que el alumno escribe
            cell.addEventListener("input", () => {
                localStorage.setItem(`app_horario_${index}`, cell.innerText);
            });
        });
    }

    // --- 4. LÓGICA DE LA AGENDA (Solo se ejecuta si existe la lista de tareas) ---
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn');
    
    if (taskList) {
        // Carga tareas guardadas o inicia con una tarea de bienvenida
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
            // Guarda el arreglo actualizado en el almacenamiento del teléfono
            localStorage.setItem('app_agenda_tareas', JSON.stringify(tasks));
        }

        // Funciones globales (window) para que el HTML pueda llamarlas desde los botones
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

        // Evento del Botón Flotante (+)
        if(btnAdd){
            btnAdd.addEventListener('click', () => {
                tasks.unshift({ text: "", done: false }); // Añade tarea vacía arriba
                renderTasks();
                
                // Pone el cursor automáticamente en la nueva tarea
                setTimeout(() => {
                    const firstInput = document.querySelector('.task-list .task-input');
                    if (firstInput) {
                        firstInput.focus();
                        window.scrollTo({ top: 0, behavior: 'smooth' }); // Sube la pantalla
                    }
                }, 50);
            });
        }

        // Dibuja las tareas al entrar a la página
        renderTasks();
    }
    
    // --- 5. AUTO-SCROLL EN EL MENÚ SUPERIOR ---
    // Si el alumno está en un celular pequeño, centra el botón activo del menú para que no quede escondido
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav) {
        activeNav.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    }
});
