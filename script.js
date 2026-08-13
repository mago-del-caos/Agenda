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
// 2. VERIFICACIÓN DE SEGURIDAD (Sesión)
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
// EJECUCIÓN AL CARGAR EL HTML
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    // --- LÓGICA DE LOGIN Y REGISTRO ---
    const form = document.getElementById("authForm");
    if (form) {
        let isRegisterMode = false; // Ahora inicia correctamente en modo INICIO DE SESIÓN
        let failedAttempts = parseInt(localStorage.getItem("app_failed_attempts")) || 0;
        
        const nameGroup = document.getElementById("nameGroup");
        const loginTitle = document.getElementById("loginTitle");
        const toggleModeBtn = document.getElementById("toggleModeBtn");
        const mainSubmitBtn = document.getElementById("mainSubmitBtn");
        const errorMessage = document.getElementById("errorMessage");

        if (failedAttempts >= 3) {
            form.style.display = "none";
            toggleModeBtn.style.display = "none";
            document.getElementById("lockScreen").classList.remove("hidden");
        }

        toggleModeBtn.addEventListener("click", () => {
            isRegisterMode = !isRegisterMode;
            loginTitle.innerText = isRegisterMode ? "Crear Cuenta Escolar" : "Iniciar Sesión";
            toggleModeBtn.innerText = isRegisterMode ? "Ya tengo cuenta (Iniciar sesión)" : "Crear nueva cuenta (Registrarme)";
            mainSubmitBtn.innerText = isRegisterMode ? "Registrarme y Entrar" : "Ingresar";
            nameGroup.style.display = isRegisterMode ? "block" : "none";
            errorMessage.innerText = "";
        });

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("emailInput").value.trim();
            const pass = document.getElementById("passInput").value.trim();
            const name = document.getElementById("nameInput") ? document.getElementById("nameInput").value.trim() : "";

            if (!email.endsWith("@juventud.edu.mx")) {
                errorMessage.innerText = "Debes usar un correo con terminación @juventud.edu.mx";
                return;
            }

            if (isRegisterMode) {
                if (!name) { errorMessage.innerText = "Por favor, ingresa tu nombre."; return; }
                if (localStorage.getItem(`user_${email}`)) {
                    errorMessage.innerText = "Este correo ya está registrado. Toca 'Ya tengo cuenta'.";
                } else {
                    localStorage.setItem(`user_${email}`, pass);
                    localStorage.setItem(`name_${email}`, name);
                    localStorage.setItem("app_isLoggedIn", "true"); 
                    localStorage.setItem("app_currentUserEmail", email);
                    window.location.href = "/Agenda/novedades.html";
                }
            } else {
                const savedPass = localStorage.getItem(`user_${email}`);
                if (!savedPass) { errorMessage.innerText = "El correo no está registrado. Crea una cuenta primero."; return; }
                if (savedPass === pass) {
                    localStorage.setItem("app_failed_attempts", "0"); 
                    localStorage.setItem("app_isLoggedIn", "true"); 
                    localStorage.setItem("app_currentUserEmail", email);
                    window.location.href = "/Agenda/novedades.html"; 
                } else {
                    failedAttempts++;
                    localStorage.setItem("app_failed_attempts", failedAttempts.toString());
                    if (failedAttempts >= 3) {
                        form.style.display = "none";
                        toggleModeBtn.style.display = "none";
                        document.getElementById("lockScreen").classList.remove("hidden");
                    } else {
                        errorMessage.innerText = `Contraseña incorrecta. Intentos restantes: ${3 - failedAttempts}`;
                    }
                }
            }
        });
    }

    // --- SALUDO EN NOVEDADES ---
    const tituloNovedades = document.getElementById("tituloNovedades");
    if (tituloNovedades) {
        const currentUserEmail = localStorage.getItem("app_currentUserEmail");
        const currentUserName = localStorage.getItem(`name_${currentUserEmail}`);
        if (currentUserName) tituloNovedades.innerText = `Hola ${currentUserName}, mira las novedades del día de hoy`;
    }

    // --- LÓGICA DEL HORARIO ---
    const cells = document.querySelectorAll("td[contenteditable='true']");
    cells.forEach((cell, i) => {
        if(localStorage.getItem(`app_horario_${i}`)) cell.innerText = localStorage.getItem(`app_horario_${i}`);
        cell.addEventListener("input", () => localStorage.setItem(`app_horario_${i}`, cell.innerText));
    });

    // --- LÓGICA DE LA AGENDA ---
    const taskList = document.getElementById('taskList');
    if (taskList) {
        let tasks = JSON.parse(localStorage.getItem('app_agenda_tareas')) || [{ text: "Bienvenido a tu agenda escolar Ag lucem", done: false }];
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
        localStorage.removeItem("app_currentUserEmail");
        window.location.href = "/Agenda/index.html"; 
    });
});