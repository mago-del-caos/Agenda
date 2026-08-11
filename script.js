document.addEventListener("DOMContentLoaded", () => {
    
    // --- NAVEGACIÓN ENTRE PÁGINAS (SPA) ---
    const navButtons = document.querySelectorAll(".nav-btn");
    const pages = document.querySelectorAll(".page-view");

    navButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            // Quitar clase active de todos los botones y ocultar páginas
            navButtons.forEach(b => b.classList.remove("active"));
            pages.forEach(p => p.classList.remove("active"));
            
            // Activar botón presionado y mostrar la página correspondiente
            btn.classList.add("active");
            const targetId = btn.getAttribute("data-target");
            document.getElementById(targetId).classList.add("active");

            // Centrar el botón presionado en el menú desplazable
            btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        });
    });

    // --- LÓGICA DEL HORARIO (Guardado local) ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    cells.forEach((cell, index) => {
        const savedValue = localStorage.getItem(`app_horario_${index}`);
        if (savedValue !== null) cell.innerText = savedValue;

        cell.addEventListener("input", () => {
            localStorage.setItem(`app_horario_${index}`, cell.innerText);
        });
    });

    // --- LÓGICA DE LA AGENDA ---
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn');
    
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
});
