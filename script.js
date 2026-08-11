document.addEventListener("DOMContentLoaded", () => {
    
    // --- 1. LÓGICA DEL HORARIO ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    
    cells.forEach((cell, index) => {
        const savedValue = localStorage.getItem(`app_aglucem_cell_${index}`);
        if (savedValue !== null) {
            cell.innerText = savedValue;
        }

        cell.addEventListener("input", () => {
            localStorage.setItem(`app_aglucem_cell_${index}`, cell.innerText);
        });
    });

    // --- 2. LÓGICA DE LA AGENDA ---
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn'); // Conectado al Botón Flotante

    let tasks = JSON.parse(localStorage.getItem('app_aglucem_tasks')) || [
        { text: "Configurar app Chemini", done: false }
    ];

    function renderTasks() {
        taskList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            const styleCrossed = task.done ? 'text-decoration: line-through; color: #999;' : '';
            
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
                <input type="text" class="task-input" value="${task.text}" oninput="updateTask(${index}, this.value)" style="${styleCrossed}" placeholder="Escribe aquí tu tarea...">
                <button class="btn-delete" onclick="deleteTask(${index})">✖</button>
            `;
            
            taskList.appendChild(li);
        });
        
        localStorage.setItem('app_aglucem_tasks', JSON.stringify(tasks));
    }

    window.toggleTask = function(index) {
        tasks[index].done = !tasks[index].done;
        renderTasks();
    };

    window.updateTask = function(index, newText) {
        tasks[index].text = newText;
        localStorage.setItem('app_aglucem_tasks', JSON.stringify(tasks));
    };

    window.deleteTask = function(index) {
        tasks.splice(index, 1);
        renderTasks();
    };

    // Al presionar el botón flotante se añade una tarea nueva
    btnAdd.addEventListener('click', () => {
        tasks.unshift({ text: "", done: false }); 
        renderTasks();
        
        setTimeout(() => {
            const firstInput = document.querySelector('.task-list .task-input');
            if (firstInput) {
                firstInput.focus();
                // Desplaza la vista hacia arriba para ver la nueva tarea en móviles
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
    });

    // Cierre automático de acordeones (opcional para estilo app: si abres uno, se cierran los demás)
    const detailsElements = document.querySelectorAll("details.menu-dropdown");
    detailsElements.forEach((targetDetail) => {
        targetDetail.addEventListener("click", () => {
            detailsElements.forEach((detail) => {
                if (detail !== targetDetail) {
                    detail.removeAttribute("open");
                }
            });
        });
    });

    renderTasks();
});
