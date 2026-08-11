/* =========================================
   Identidad Gráfica - Instituto Juventud
   Basado en el manual oficial
   ========================================= */
:root {
    --ij-verde: #009944;
    --ij-amarillo: #FFD100;
    --ij-azul: #032A60;
    --ij-rojo: #E2231A;
    
    /* Colores UI Android */
    --fondo-app: #f2f2f2;
    --superficie: #ffffff;
    --texto-principal: #1f1f1f;
    --texto-secundario: #5f6368;
    --divisor: #e0e0e0;
}

body {
    font-family: Roboto, 'Segoe UI', Tahoma, sans-serif;
    background-color: var(--fondo-app);
    color: var(--texto-principal);
    margin: 0;
    padding: 0;
    padding-bottom: 80px; /* Espacio para el FAB */
}

/* =========================================
   App Bar (Encabezado)
   ========================================= */
.app-bar {
    background-color: var(--ij-azul);
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    position: sticky;
    top: 0;
    z-index: 1000;
    border-bottom: 4px solid var(--ij-amarillo);
}

.header-logo {
    max-height: 40px;
    width: auto;
}

/* =========================================
   Contenedor Principal
   ========================================= */
.app-container {
    max-width: 600px; /* Ancho optimizado para simular móvil/tablet */
    margin: 16px auto;
    padding: 0 16px;
}

.section-title {
    font-size: 1.1rem;
    color: var(--ij-azul);
    margin: 24px 0 12px 4px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Elevación estilo Material Design */
.card-elevation {
    background: var(--superficie);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24);
    overflow: hidden;
}

/* =========================================
   Menús Desplegables (Lista Android)
   ========================================= */
.menu-list {
    background: var(--superficie);
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
    margin-top: 10px;
    overflow: hidden;
}

.menu-dropdown {
    border-bottom: 1px solid var(--divisor);
}

.menu-dropdown:last-child {
    border-bottom: none;
}

.menu-dropdown summary {
    padding: 18px 20px;
    font-size: 1.1rem;
    font-weight: 500;
    cursor: pointer;
    list-style: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: background 0.2s;
}

.menu-dropdown summary::-webkit-details-marker {
    display: none; /* Oculta la flecha nativa en Chrome/Safari */
}

/* Flecha personalizada */
.menu-dropdown summary::after {
    content: '▼';
    font-size: 0.8rem;
    color: var(--ij-verde);
    transition: transform 0.3s;
}

.menu-dropdown[open] summary::after {
    transform: rotate(180deg);
}

.menu-dropdown summary:active {
    background-color: rgba(0, 153, 68, 0.1);
}

.dropdown-content {
    padding: 10px 20px 20px;
    background-color: #fafafa;
}

.dropdown-content a {
    display: block;
    background-color: var(--ij-verde);
    color: white;
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0,153,68,0.3);
}

.dropdown-content a:active {
    background-color: #007a36;
}

/* =========================================
   Horario de Clases (Tabla App)
   ========================================= */
.table-responsive {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    min-width: 500px;
}

th, td {
    padding: 12px 8px;
    text-align: center;
    border: 1px solid var(--divisor);
    font-size: 0.9rem;
}

th {
    background-color: var(--ij-azul);
    color: white;
    font-weight: 500;
}

td[contenteditable="true"]:focus {
    background-color: rgba(255, 209, 0, 0.15); /* Feedback amarillo claro */
    outline: 2px solid var(--ij-amarillo);
}

.hora-col {
    font-weight: 500;
    color: var(--ij-azul);
    background-color: #fafafa;
    font-size: 0.8rem;
}

/* =========================================
   Agenda
   ========================================= */
.agenda-container {
    padding: 8px 0;
}

.task-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.task-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid var(--divisor);
}

.task-item:last-child {
    border-bottom: none;
}

.task-checkbox {
    margin-right: 16px;
    transform: scale(1.3);
    accent-color: var(--ij-verde);
}

.task-input {
    flex-grow: 1;
    border: none;
    font-size: 1rem;
    color: var(--texto-principal);
    background: transparent;
    outline: none;
}

.task-input:focus {
    border-bottom: 1px solid var(--ij-verde);
}

.btn-delete {
    background: transparent;
    border: none;
    color: var(--ij-rojo);
    font-size: 1.2rem;
    padding: 8px;
    margin-left: 8px;
}

/* =========================================
   FAB (Floating Action Button)
   ========================================= */
.fab-button {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    background-color: var(--ij-rojo);
    color: white;
    border-radius: 50%;
    border: none;
    font-size: 28px;
    line-height: 1;
    box-shadow: 0 4px 10px rgba(226, 35, 26, 0.4);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s, box-shadow 0.2s;
    z-index: 100;
}

.fab-button:active {
    transform: scale(0.95);
    box-shadow: 0 2px 5px rgba(226, 35, 26, 0.4);
}
