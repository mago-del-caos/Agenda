// --- VERIFICACIÓN DE SEGURIDAD ---
// Si no hay una sesión activa, lo regresa a la pantalla de Login (index.html)
if (!sessionStorage.getItem("isLoggedIn") && window.location.pathname.indexOf("index.html") === -1) {
    window.location.href = "index.html";
}
document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LÓGICA DEL HORARIO (Solo se ejecuta si existe la tabla) ---
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

    // --- 2. LÓGICA DE LA AGENDA (Solo se ejecuta si existe la lista) ---
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn');
    
    if (taskList) {
        let tasks = JSON.parse(localStorage.getItem('app_agenda_tareas')) || [
            { text: "Bienvenido a tu nueva agenda", done: false }
        ];

        function renderTasks() {
            taskList.innerHTML = '';
            tasks.forEach((task, index) => {
                const li = document.createElement('li');
                li.className = 'task-item';
                
                const styleCrossed = task.done ? 'text-decoration: line-through; color: #94A3B8;' : '';
                
                li.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
                    <input type="text" class="task-input" value="${task.text}" oninput="updateTask(${index}, this.value)" style="${styleCrossed}" placeholder="Nueva tarea...">
                    <button class="btn-delete" onclick="deleteTask(${index})">✖</button>
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
    
    // --- 3. AUTO-SCROLL EN EL MENÚ ---
    // Centra automáticamente el botón activo en el menú de navegación horizontal
    const activeNav = document.querySelector('.nav-btn.active');
    if (activeNav) {
        activeNav.scrollIntoView({ behavior: 'auto', inline: 'center', block: 'nearest' });
    }
});
