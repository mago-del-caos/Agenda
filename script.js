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
// 2. VERIFICACIÓN DE SEGURIDAD Y ACCESO (Con persistencia permanente)
// ==========================================
const AGLUCEM_API = "https://aglucem-api.adrian-camelot32.workers.dev";
const currentPath = window.location.pathname;
const isLoginPage = currentPath.endsWith("index.html") || currentPath.endsWith("/Agenda/") || currentPath.endsWith("/Agenda");
const aglucemToken = localStorage.getItem("aglucem_token");

// Limpieza del acceso anterior (el de utilería)
localStorage.removeItem("app_isLoggedIn");
localStorage.removeItem("app_currentUserEmail");

function aglucemAlLogin() {
    localStorage.removeItem("aglucem_token");
    localStorage.removeItem("aglucem_user");
    sessionStorage.removeItem("aglucem_me");
    if (!isLoginPage) window.location.replace("/Agenda/index.html");
}

// Sin token no hay acceso; con token se valida contra la API (la sesión
// no caduca sola: solo termina al cerrar sesión o si el admin bloquea).
if (!isLoginPage) {
    if (!aglucemToken) {
        window.location.replace("/Agenda/index.html");
    } else {
        fetch(AGLUCEM_API + "/auth/me", { headers: { Authorization: "Bearer " + aglucemToken } })
            .then(r => { if (!r.ok) throw new Error("401"); return r.json(); })
            .then(user => {
                localStorage.setItem("aglucem_user", JSON.stringify(user));
                sessionStorage.setItem("aglucem_me", JSON.stringify(user));
                document.dispatchEvent(new CustomEvent("aglucem-sesion", { detail: user }));
            })
            .catch(() => aglucemAlLogin());
    }
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
        const agUser = JSON.parse(localStorage.getItem("aglucem_user") || "null");
        if (agUser && agUser.nombre) tituloNovedades.innerText = `Hola ${agUser.nombre}, mira las novedades del día de hoy`;
    }

    // --- FOTO DE PERFIL A LA IZQUIERDA: mitad en el banner, mitad fuera ---
    // Solo la foto, sin nombre y sin botón de salir (salir es desde Ajustes).
    function aglucemPastilla(user) {
        if (!user || document.getElementById("aglucem-sesion")) return;
        const div = document.createElement("div");
        div.id = "aglucem-sesion";
        div.style.cssText = "display:flex;gap:8px;align-items:center;justify-content:flex-start;padding:0 14px;margin-top:-30px;position:relative;z-index:6;font-family:sans-serif;font-size:.85rem";
        const perfil = document.createElement("a");
        perfil.href = "/Agenda/ajustes.html";
        perfil.title = "Mi cuenta";
        perfil.style.cssText = "display:block;border-radius:50%;text-decoration:none;line-height:0";
        if (user.foto) {
            const img = document.createElement("img");
            img.src = user.foto; img.alt = "";
            img.style.cssText = "width:60px;height:60px;border-radius:50%;object-fit:cover;border:3px solid #FFD100;box-shadow:0 4px 14px rgba(0,0,0,.3);background:#fff";
            perfil.appendChild(img);
        } else {
            const ini = document.createElement("span");
            ini.textContent = (user.apodo || user.usuario || "?").trim().charAt(0).toUpperCase();
            ini.style.cssText = "width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#8E6CC8,#5B3E99);color:#fff;border:3px solid #FFD100;box-shadow:0 4px 14px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:1.5rem;line-height:1";
            perfil.appendChild(ini);
        }
        div.appendChild(perfil);
        // Se coloca justo debajo del banner, a la izquierda; si una página no
        // tuviera banner, queda flotando arriba a la derecha como respaldo.
        const banner = document.querySelector("header.app-header") || document.querySelector("header");
        if (banner && banner.parentNode) {
            banner.parentNode.insertBefore(div, banner.nextSibling);
        } else {
            div.style.cssText += ";position:fixed;top:10px;right:10px;z-index:9999;padding:0;margin-top:0";
            document.body.appendChild(div);
        }
        // Botón «Zona docente» en la navegación: SOLO docentes y administradores.
        try {
            const nav = document.querySelector(".app-nav");
            if (nav && (user.rol === "docente" || user.rol === "admin") && !document.getElementById("navZonaDocente")) {
                const a = document.createElement("a");
                a.id = "navZonaDocente";
                a.href = "/Agenda/zona-docente.html";
                a.textContent = "Zona docente";
                const enZona = location.pathname.includes("zona-docente") || location.pathname.includes("organizador");
                a.className = "nav-btn" + (enZona ? " active" : "");
                a.style.cssText = "background:#FFD100;color:#032A60;font-weight:800";
                const ajustes = nav.querySelector('a[href="/Agenda/ajustes.html"]');
                if (ajustes) nav.insertBefore(a, ajustes); else nav.appendChild(a);
                if (enZona && a.scrollIntoView) { /* la vista activa ya se maneja sola */ }
            }
        } catch { /* la navegación queda como está */ }
    }
    aglucemPastilla(JSON.parse(localStorage.getItem("aglucem_user") || "null"));
    document.addEventListener("aglucem-sesion", (e) => {
        const vieja = document.getElementById("aglucem-sesion");
        if (vieja) vieja.remove();
        aglucemPastilla(e.detail);
    });

    // --- LÓGICA DEL HORARIO ---
    // Se guarda en el servidor, atado a la cuenta: el mismo horario se ve en
    // todos los dispositivos. El guardado local queda como caché instantánea.
    const cells = document.querySelectorAll("td[contenteditable='true']");
    if (cells.length) {
        cells.forEach((cell, i) => {
            const v = localStorage.getItem(`app_horario_${i}`);
            if (v) cell.innerText = v;
        });
        const tokenHorario = localStorage.getItem("aglucem_token");
        let guardarTimer = null;
        const estadoHorario = (txt) => {
            const el = document.getElementById("horarioEstado");
            if (el) el.textContent = txt;
        };
        const guardarHorarioServidor = (manual) => {
            if (!tokenHorario) { estadoHorario("Sin sesión: quedó solo en este dispositivo."); return Promise.resolve(false); }
            estadoHorario("Guardando en el servidor…");
            const celdas = Array.from(cells).map((c) => c.innerText);
            const enviar = (metodo) => fetch(AGLUCEM_API + "/horario", {
                method: metodo,
                headers: { Authorization: "Bearer " + tokenHorario, "Content-Type": "application/json" },
                body: JSON.stringify({ celdas })
            });
            // Algunas redes (escuelas, oficinas) bloquean el método PUT:
            // si falla, se reintenta con POST, que el servidor acepta igual.
            return enviar("PUT").catch(() => enviar("POST")).then((r) => {
                if (r.ok) {
                    const h = new Date();
                    estadoHorario("✓ Guardado en el servidor " + String(h.getHours()).padStart(2, "0") + ":" + String(h.getMinutes()).padStart(2, "0") + " — ya se ve en todos tus dispositivos.");
                    return true;
                }
                estadoHorario("No se pudo guardar en el servidor; quedó en este dispositivo.");
                return false;
            }).catch(() => {
                estadoHorario("Sin conexión: quedó guardado en este dispositivo.");
                return false;
            });
        };
        // Botón explícito «Guardar horario» de la página
        window.aglucemGuardarHorario = () => guardarHorarioServidor(true);
        if (tokenHorario) {
            fetch(AGLUCEM_API + "/horario", { headers: { Authorization: "Bearer " + tokenHorario } })
                .then((r) => (r.ok ? r.json() : null))
                .then((data) => {
                    if (!data) return;
                    if (Array.isArray(data.celdas) && data.celdas.some((v) => v)) {
                        data.celdas.forEach((v, i) => {
                            if (cells[i]) cells[i].innerText = v || "";
                            localStorage.setItem(`app_horario_${i}`, v || "");
                        });
                        estadoHorario("✓ Horario sincronizado con el servidor.");
                    } else if (Array.from(cells).some((c) => c.innerText.trim())) {
                        // Primera vez: lo que ya había en este dispositivo sube a la cuenta
                        guardarHorarioServidor();
                    } else {
                        estadoHorario("Escribe tu horario y pulsa «Guardar horario».");
                    }
                })
                .catch(() => {});
        }
        cells.forEach((cell, i) => {
            cell.addEventListener("input", () => {
                localStorage.setItem(`app_horario_${i}`, cell.innerText);
                estadoHorario("Cambios sin guardar — pulsa «Guardar horario».");
                clearTimeout(guardarTimer);
                guardarTimer = setTimeout(() => guardarHorarioServidor(), 4000);
            });
        });
    }

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
        const t = localStorage.getItem("aglucem_token");
        const salir = () => { localStorage.removeItem("aglucem_token"); localStorage.removeItem("aglucem_user"); sessionStorage.removeItem("aglucem_me"); window.location.href = "/Agenda/index.html"; };
        if (t) fetch(AGLUCEM_API + "/auth/logout", { method: "POST", headers: { Authorization: "Bearer " + t } }).finally(salir);
        else salir();
    });

    // 💥 BOTÓN DE ACTUALIZACIÓN CON BARRA DE 10 SEGUNDOS
    if (btnActualizarApp) {
        btnActualizarApp.addEventListener('click', () => {
            if (confirm("¿Forzar actualización? El sistema se limpiará y recargará en 10 segundos.")) {
                
                const progressContainer = document.getElementById('updateProgressContainer');
                const progressBar = document.getElementById('updateProgressBar');
                const progressText = document.getElementById('updateProgressText');

                if (progressContainer) progressContainer.classList.remove('hidden');
                btnActualizarApp.disabled = true;
                btnActualizarApp.style.opacity = '0.5';
                if (btnCerrarSesion) btnCerrarSesion.style.display = 'none';

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

                let progress = 0;
                const totalTime = 10000; 
                const intervalTime = 100;
                const increment = (intervalTime / totalTime) * 100;

                const progressTimer = setInterval(() => {
                    progress += increment;
                    
                    if (progress >= 100) {
                        progress = 100;
                        clearInterval(progressTimer);
                        if (progressText) progressText.innerText = "¡Sistema listo! Reiniciando...";
                        if (progressBar) progressBar.style.width = "100%";
                        
                        setTimeout(() => {
                            window.location.reload(true);
                        }, 500);
                    } else {
                        if (progressBar) progressBar.style.width = `${progress}%`;
                        if (progressText) progressText.innerText = `Limpiando e instalando... ${Math.floor(progress)}%`;
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

        if (btnStartTimer) {
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
        }

        if (btnPauseTimer) {
            btnPauseTimer.addEventListener('click', () => {
                clearInterval(timerInterval);
                isRunning = false;
            });
        }

        if (btnResetTimer) {
            btnResetTimer.addEventListener('click', () => {
                clearInterval(timerInterval);
                isRunning = false;
                timeLeft = 25 * 60;
                updateDisplay();
            });
        }

        if (btnDescanso) {
            btnDescanso.addEventListener('click', () => {
                clearInterval(timerInterval);
                isRunning = false;
                timeLeft = 5 * 60;
                updateDisplay();
            });
        }
    }
});
