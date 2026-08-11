document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================
    // 1. LÓGICA DEL HORARIO (Guardado automático)
    // =========================================
    
    // Seleccionamos todas las celdas de la tabla que son editables
    const cells = document.querySelectorAll("td[contenteditable='true']");
    
    cells.forEach((cell, index) => {
        // Cargar datos guardados previamente desde el localStorage
        const savedValue = localStorage.getItem(`aglucem_cell_${index}`);
        if (savedValue !== null) {
            cell.innerText = savedValue;
        }

        // Guardar automáticamente cada vez que el usuario escribe algo nuevo
        cell.addEventListener("input", () => {
            localStorage.setItem(`aglucem_cell_${index}`, cell.innerText);
        });
    });

    // =========================================
    // 2. LÓGICA DE LA AGENDA (Gestión de Tareas)
    // =========================================
    
    const taskList = document.getElementById('taskList');
    const btnAdd = document.getElementById('addTaskBtn');

    // Cargar tareas existentes o iniciar un arreglo vacío por defecto
    let tasks = JSON.parse(localStorage.getItem('aglucem_tasks')) || [
        { text: "Configurar despliegue de agentes en Chemini", done: false },
        { text: "Revisar repositorio de IA", done: false }
    ];

    // Función principal para renderizar la lista de tareas en el HTML
    function renderTasks() {
        taskList.innerHTML = '';
        
        tasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = 'task-item';
            
            // Si la tarea está marcada como hecha, aplicamos estilo tachado
            const styleCrossed = task.done ? 'text-decoration: line-through; color: #999;' : '';
            
            // Estructura de cada elemento de la lista (checkbox, texto, botón borrar)
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''} onchange="toggleTask(${index})">
                <input type="text" class="task-input" value="${task.text}" oninput="updateTask(${index}, this.value)" style="${styleCrossed}" placeholder="Escribe aquí tu tarea...">
                <button class="btn-delete" onclick="deleteTask(${index})" title="Eliminar tarea">✖</button>
            `;
            
            taskList.appendChild(li);
        });
        
        // Guardar el estado actual de las tareas en localStorage
        localStorage.setItem('aglucem_tasks', JSON.stringify(tasks));
    }

    // Funciones globales vinculadas al objeto window 
    // (Necesario porque las llamamos directamente desde los eventos onchange/oninput/onclick en el HTML generado arriba)
    
    window.toggleTask = function(index) {
        tasks[index].done = !tasks[index].done; // Cambia entre verdadero/falso
        renderTasks();
    };

    window.updateTask = function(index, newText) {
        tasks[index].text = newText;
        localStorage.setItem('aglucem_tasks', JSON.stringify(tasks)); // Solo guardamos, sin re-renderizar para no perder el foco mientras se escribe
    };

    window.deleteTask = function(index) {
        tasks.splice(index, 1); // Elimina el elemento del arreglo
        renderTasks();
    };

    // Evento para el botón "+ Nueva Tarea"
    btnAdd.addEventListener('click', () => {
        // Agregamos una tarea vacía al inicio de la lista
        tasks.unshift({ text: "", done: false }); 
        renderTasks();
        
        // Ponemos el cursor (foco) en el nuevo input generado tras un pequeño retraso
        setTimeout(() => {
            const firstInput = document.querySelector('.task-list .task-input');
            if (firstInput) firstInput.focus();
        }, 50);
    });

    // Renderizamos las tareas al cargar la página por primera vez
    renderTasks();
});
