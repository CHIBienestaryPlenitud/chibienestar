/* ==========================================
   Bienestar y Plenitud Integral - Application Logic
   ========================================== */

// Definición de Categorías por Tipo
const categories = {
    ingreso: [
        { value: 'sueldo', label: 'Sueldo / Salario', icon: 'fa-money-bill-wave' },
        { value: 'inversion', label: 'Inversiones', icon: 'fa-chart-line' },
        { value: 'negocio', label: 'Negocio Propio', icon: 'fa-briefcase' },
        { value: 'otros-ingresos', label: 'Otros Ingresos', icon: 'fa-hand-holding-dollar' }
    ],
    egreso: [
        { value: 'vivienda', label: 'Alquiler / Vivienda', icon: 'fa-house' },
        { value: 'alimentacion', label: 'Alimentación', icon: 'fa-utensils' },
        { value: 'transporte', label: 'Transporte', icon: 'fa-car' },
        { value: 'servicios', label: 'Servicios Básicos', icon: 'fa-bolt' },
        { value: 'ocio', label: 'Ocio y Diversión', icon: 'fa-gamepad' },
        { value: 'salud', label: 'Salud', icon: 'fa-heart-pulse' },
        { value: 'educacion', label: 'Educación', icon: 'fa-graduation-cap' },
        { value: 'otros-egresos', label: 'Otros Egresos', icon: 'fa-ellipsis' }
    ]
};

// Estado Global
let state = {
    timeframe: 'semanal', // 'semanal' o 'mensual'
    transactions: [],
    videos: [],
    meditations: [],
    searchQuery: '',
    categoryFilter: 'all'
};

// Referencias a los Gráficos de Chart.js
let barChartInstance = null;
let doughnutChartInstance = null;

// Helper para formatear fechas relativas para los Mock Data
const getRelativeDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
};

// Datos Iniciales (Mock Data) para mejorar la primera impresión
const defaultTransactions = [
    { id: 't1', type: 'ingreso', amount: 1200.00, description: 'Sueldo Quincenal', category: 'sueldo', date: getRelativeDate(3), recurring: true },
    { id: 't2', type: 'egreso', amount: 450.00, description: 'Alquiler Departamento', category: 'vivienda', date: getRelativeDate(5), recurring: true },
    { id: 't3', type: 'egreso', amount: 95.00, description: 'Compra de Supermercado', category: 'alimentacion', date: getRelativeDate(1), recurring: false },
    { id: 't4', type: 'egreso', amount: 25.00, description: 'Suscripciones (Netflix/Spotify)', category: 'servicios', date: getRelativeDate(4), recurring: true },
    { id: 't5', type: 'ingreso', amount: 150.00, description: 'Freelance Diseño Web', category: 'negocio', date: getRelativeDate(2), recurring: false },
    { id: 't6', type: 'egreso', amount: 45.00, description: 'Carga de Combustible', category: 'transporte', date: getRelativeDate(0), recurring: false },
    { id: 't7', type: 'egreso', amount: 60.00, description: 'Cena de Fin de Semana', category: 'ocio', date: getRelativeDate(2), recurring: false }
];

// Videos por defecto sobre Educación Financiera
const defaultVideos = [
    { id: 'v1', youtubeId: '3-M2J2t_GQA', title: 'Finanzas Personales para Principiantes', desc: 'Aprende los conceptos básicos para organizar tu dinero desde cero, presupuestos y control.' },
    { id: 'v2', youtubeId: '9gKqG1tF1tA', title: 'Entendiendo el Flujo de Caja', desc: 'Cómo funciona el flujo de efectivo y por qué es clave para la salud financiera de tu hogar.' },
    { id: 'v3', youtubeId: '_f8iMvT7Tjo', title: 'La Regla del 50/30/20', desc: 'Un método sencillo y estructurado para dividir tus ingresos mensuales en necesidades, deseos y ahorro.' },
    { id: 'v4', youtubeId: 'v5gHj5t2k0E', title: 'Estrategias Prácticas de Ahorro', desc: 'Aprende métodos realistas para reducir gastos superfluos y armar tu fondo de emergencia.' },
    { id: 'v5', youtubeId: 'BELLIAkMGZk', title: 'Cómo Multiplicar tus Ingresos', desc: 'Consejos clave sobre mentalidad, inversiones básicas y diversificación del flujo de dinero.' }
];

// Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Establecer fecha por defecto en el formulario (hoy)
    document.getElementById('date').value = new Date().toISOString().split('T')[0];

    // Cargar datos
    loadTransactions();
    loadVideos();
    loadMeditations();
    
    // Inyectar categorías iniciales en el formulario
    updateCategories();
    
    // Inyectar categorías en el filtro de búsqueda
    populateFilterCategories();

    // Renderizar Dashboard y Videos
    updateDashboard();
    renderVideos();
    renderMeditations();
});

// Cargar transacciones de localStorage o asignar iniciales
function loadTransactions() {
    const saved = localStorage.getItem('cashflow_transactions');
    if (saved) {
        state.transactions = JSON.parse(saved);
    } else {
        state.transactions = defaultTransactions;
        saveTransactions();
    }
}

// Guardar transacciones en localStorage
function saveTransactions() {
    localStorage.setItem('cashflow_transactions', JSON.stringify(state.transactions));
}

// Actualiza las categorías del Formulario según el tipo seleccionado (Ingreso/Egreso)
function updateCategories() {
    const type = document.getElementById('type').value;
    const categorySelect = document.getElementById('category');
    
    categorySelect.innerHTML = '';
    categories[type].forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        categorySelect.appendChild(option);
    });
}

// Inyecta dinámicamente las categorías en el dropdown de filtros del historial
function populateFilterCategories() {
    const filterSelect = document.getElementById('category-filter');
    filterSelect.innerHTML = '<option value="all">Todas las categorías</option>';
    
    // Unir ambas listas de categorías
    const allCats = [...categories.ingreso, ...categories.egreso];
    // Evitar duplicados por valor
    const uniqueCats = Array.from(new Map(allCats.map(item => [item.value, item])).values());
    
    uniqueCats.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.value;
        option.textContent = cat.label;
        filterSelect.appendChild(option);
    });
}

// Alternar entre pestaña semanal y mensual
function changeTimeframe(timeframe) {
    state.timeframe = timeframe;
    
    // Actualizar clases activas en UI
    document.getElementById('btn-semanal').classList.toggle('active', timeframe === 'semanal');
    document.getElementById('btn-mensual').classList.toggle('active', timeframe === 'mensual');
    
    updateDashboard();
}

// Comprueba si una fecha pertenece a la semana en curso (Lunes - Domingo)
function isCurrentWeek(dateStr) {
    const transactionDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    
    // Lunes actual
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1; // Ajuste si hoy es Domingo (0)
    
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return transactionDate >= startOfWeek && transactionDate <= endOfWeek;
}

// Comprueba si una fecha pertenece al mes en curso
function isCurrentMonth(dateStr) {
    const transactionDate = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    return transactionDate.getMonth() === today.getMonth() && 
           transactionDate.getFullYear() === today.getFullYear();
}

// Obtener transacciones filtradas por periodo y criterios de búsqueda
function getFilteredTransactions() {
    return state.transactions.filter(t => {
        // 1. Filtrar por Periodo (Semanal vs Mensual)
        let inPeriod = false;
        if (state.timeframe === 'semanal') {
            inPeriod = isCurrentWeek(t.date);
        } else {
            inPeriod = isCurrentMonth(t.date);
        }
        
        // Si no está en el periodo seleccionado, descartar
        if (!inPeriod) return false;

        // 2. Filtrar por barra de búsqueda
        const matchesSearch = t.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
                              t.amount.toString().includes(state.searchQuery);
        
        // 3. Filtrar por categoría
        const matchesCategory = state.categoryFilter === 'all' || t.category === state.categoryFilter;

        return matchesSearch && matchesCategory;
    });
}

// Actualizar todo el Dashboard (KPIs, Listas y Gráficos)
function updateDashboard() {
    const filtered = getFilteredTransactions();
    
    // Ordenar transacciones por fecha descendente
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Calcular totales
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    filtered.forEach(t => {
        if (t.type === 'ingreso') {
            totalIncome += t.amount;
            incomeCount++;
        } else {
            totalExpense += t.amount;
            expenseCount++;
        }
    });

    const netFlow = totalIncome - totalExpense;

    // Actualizar textos e importes en pantalla
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('income-count').textContent = `${incomeCount} transacción${incomeCount !== 1 ? 'es' : ''}`;
    
    document.getElementById('total-expense').textContent = formatCurrency(totalExpense);
    document.getElementById('expense-count').textContent = `${expenseCount} transacción${expenseCount !== 1 ? 'es' : ''}`;
    
    const balanceEl = document.getElementById('total-balance');
    balanceEl.textContent = formatCurrency(netFlow);
    
    // Cambiar clases del saldo neto según sea positivo o negativo
    balanceEl.className = 'kpi-value ' + (netFlow >= 0 ? 'text-success' : 'text-danger');
    
    // Actualizar indicador de tendencia de flujo
    const trendEl = document.getElementById('balance-trend');
    if (netFlow > 0) {
        trendEl.innerHTML = `<i class="fa-solid fa-arrow-trend-up text-success"></i> Superávit en el periodo`;
    } else if (netFlow < 0) {
        trendEl.innerHTML = `<i class="fa-solid fa-arrow-trend-down text-danger"></i> Déficit en el periodo`;
    } else {
        trendEl.innerHTML = `<i class="fa-solid fa-circle-info"></i> Flujo de efectivo neutro`;
    }

    // Renderizar lista en el historial
    renderList(filtered);

    // Actualizar gráficos analíticos
    renderCharts(filtered, totalIncome, totalExpense);
}

// Formateador de Moneda
function formatCurrency(value) {
    return new Intl.NumberFormat('es-US', {
        style: 'currency',
        currency: 'USD'
    }).format(value);
}

// Formateador de Fecha legible
function formatDateReadable(dateStr) {
    const options = { day: '2-digit', month: 'short' };
    // Ajustar para evitar problemas de zona horaria local al instanciar
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-ES', options);
}

// Buscar icono y datos de la categoría
function getCategoryMeta(catValue) {
    const allCats = [...categories.ingreso, ...categories.egreso];
    const cat = allCats.find(c => c.value === catValue);
    return cat || { label: 'Otro', icon: 'fa-ellipsis' };
}

// Renderizar la lista de transacciones en la interfaz
function renderList(transactions) {
    const listContainer = document.getElementById('transaction-list');
    listContainer.innerHTML = '';

    if (transactions.length === 0) {
        listContainer.innerHTML = '<li class="empty-list-msg">No se encontraron movimientos para los filtros seleccionados.</li>';
        return;
    }

    transactions.forEach(t => {
        const meta = getCategoryMeta(t.category);
        const li = document.createElement('li');
        li.className = 'transaction-item';
        
        li.innerHTML = `
            <div class="item-left">
                <div class="item-icon ${t.type}">
                    <i class="fa-solid ${meta.icon}"></i>
                </div>
                <div class="item-details">
                    <span class="item-title">${t.description}</span>
                    <div class="item-meta">
                        <span>${meta.label}</span>
                        <span>${formatDateReadable(t.date)}</span>
                        ${t.recurring ? '<span class="text-success"><i class="fa-solid fa-rotate"></i> Fijo</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="item-right">
                <span class="item-amount ${t.type}">
                    ${t.type === 'ingreso' ? '+' : '-'}${formatCurrency(t.amount)}
                </span>
                <button class="btn-delete" onclick="deleteTransaction('${t.id}')" title="Eliminar del flujo">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;
        
        listContainer.appendChild(li);
    });
}

// Agregar nueva transacción desde el formulario
function handleFormSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('type').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const description = document.getElementById('description').value.trim();
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;
    const recurring = document.getElementById('recurring').checked;

    if (!description || isNaN(amount) || amount <= 0) return;

    const newTransaction = {
        id: 'trans-' + Date.now(),
        type,
        amount,
        description,
        category,
        date,
        recurring
    };

    state.transactions.push(newTransaction);
    saveTransactions();
    
    // Limpiar formulario excepto fecha
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    
    // Actualizar dashboard
    updateDashboard();
}

// Eliminar transacción por ID
function deleteTransaction(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveTransactions();
    updateDashboard();
}

// Filtrar transacciones en base a entradas
function filterTransactions() {
    state.searchQuery = document.getElementById('search-input').value;
    state.categoryFilter = document.getElementById('category-filter').value;
    updateDashboard();
}

// Inicializar y Renderizar Gráficos con Chart.js
function renderCharts(transactions, totalIncome, totalExpense) {
    // Destruir gráficos anteriores para evitar problemas de re-renderizado al pasar el mouse
    if (barChartInstance) barChartInstance.destroy();
    if (doughnutChartInstance) doughnutChartInstance.destroy();

    // 1. Gráfico Comparativo de Barras: Ingresos vs Egresos
    const ctxBar = document.getElementById('bar-chart').getContext('2d');
    barChartInstance = new Chart(ctxBar, {
        type: 'bar',
        data: {
            labels: ['Ingresos', 'Egresos'],
            datasets: [{
                data: [totalIncome, totalExpense],
                backgroundColor: [
                    'rgba(20, 184, 166, 0.8)', // Verde Aqua
                    'rgba(249, 115, 22, 0.8)'   // Naranja
                ],
                borderColor: [
                    '#14b8a6', // Verde Aqua
                    '#f97316'  // Naranja
                ],
                borderWidth: 1.5,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return ' ' + formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: '#475569', font: { family: 'Inter', size: 11, weight: '500' } }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: { color: '#475569', font: { family: 'Inter', size: 10 } }
                }
            }
        }
    });

    // 2. Gráfico de Dona: Distribución de Gastos (Egresos) por Categoría
    const expenses = transactions.filter(t => t.type === 'egreso');
    const categoryTotals = {};
    
    expenses.forEach(e => {
        const meta = getCategoryMeta(e.category);
        categoryTotals[meta.label] = (categoryTotals[meta.label] || 0) + e.amount;
    });

    const labels = Object.keys(categoryTotals);
    const data = Object.values(categoryTotals);

    // Paleta de colores degradados en naranja para los gastos (egresos)
    const colorPalette = [
        'rgba(249, 115, 22, 0.85)', // Naranja principal
        'rgba(251, 146, 60, 0.85)', // Naranja intermedio claro
        'rgba(234, 88, 12, 0.85)',  // Naranja oscuro
        'rgba(253, 186, 116, 0.85)',// Naranja muy claro
        'rgba(254, 215, 170, 0.85)',// Naranja pastel suave
        'rgba(194, 65, 12, 0.85)'   // Naranja tierra profundo
    ];

    const ctxDoughnut = document.getElementById('doughnut-chart').getContext('2d');
    
    if (labels.length === 0) {
        // Si no hay gastos, mostrar un estado vacío en el gráfico de dona
        doughnutChartInstance = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Sin gastos registrados'],
                datasets: [{
                    data: [1],
                    backgroundColor: ['rgba(0, 0, 0, 0.04)'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                }
            }
        });
    } else {
        doughnutChartInstance = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colorPalette.slice(0, labels.length),
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return ' ' + context.label + ': ' + formatCurrency(context.parsed);
                            }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// ==========================================
// Videos Education / YouTube Management
// ==========================================

// Cargar videos de localStorage
function loadVideos() {
    const saved = localStorage.getItem('cashflow_videos');
    if (saved) {
        state.videos = JSON.parse(saved);
        
        // Asegurar que los nuevos videos solicitados estén presentes
        const newIds = ['v5gHj5t2k0E', 'BELLIAkMGZk'];
        let updated = false;
        
        newIds.forEach(id => {
            const exists = state.videos.some(v => v.youtubeId === id);
            if (!exists) {
                // Encontrar el video correspondiente en defaultVideos
                const videoData = defaultVideos.find(v => v.youtubeId === id);
                if (videoData) {
                    state.videos.push(videoData);
                    updated = true;
                }
            }
        });
        
        if (updated) {
            saveVideos();
        }
    } else {
        state.videos = defaultVideos;
        saveVideos();
    }
}

// Guardar videos en localStorage
function saveVideos() {
    localStorage.setItem('cashflow_videos', JSON.stringify(state.videos));
}

// Extraer ID de YouTube desde un link
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Renderizar la rejilla de videos
function renderVideos() {
    const grid = document.getElementById('videos-grid');
    grid.innerHTML = '';

    if (state.videos.length === 0) {
        grid.innerHTML = '<p class="empty-list-msg" style="grid-column: 1/-1;">No tienes videos agregados. ¡Pega un enlace de YouTube arriba para añadir uno!</p>';
        return;
    }

    state.videos.forEach(v => {
        const card = document.createElement('div');
        card.className = 'video-card-item';
        
        // Obtener url de miniatura (mqdefault para mejor velocidad)
        const thumbnailUrl = `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`;
        
        card.innerHTML = `
            <div class="video-thumbnail-container" onclick="playVideo('${v.youtubeId}')">
                <img src="${thumbnailUrl}" alt="${v.title}" class="video-thumbnail">
                <div class="play-overlay">
                    <i class="fa-solid fa-circle-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${v.title}</h3>
                <p class="video-desc">${v.desc || 'Video sobre finanzas y flujo de efectivo.'}</p>
                <div class="video-footer">
                    <button class="btn-watch" onclick="playVideo('${v.youtubeId}')">
                        <i class="fa-solid fa-play"></i> Ver ahora
                    </button>
                    <button class="btn-delete-video" onclick="deleteVideo('${v.id}')" title="Eliminar video">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Agregar video personalizado
function addCustomVideo() {
    const urlInput = document.getElementById('video-url');
    const titleInput = document.getElementById('video-title');
    
    const url = urlInput.value.trim();
    let title = titleInput.value.trim();
    
    if (!url) {
        alert('Por favor, ingresa un enlace de YouTube válido.');
        return;
    }
    
    const youtubeId = getYouTubeId(url);
    if (!youtubeId) {
        alert('No se pudo reconocer el ID del video de YouTube. Verifica el formato del enlace.');
        return;
    }

    if (!title) {
        title = 'Video de Finanzas Personalizado';
    }

    const newVideo = {
        id: 'vid-' + Date.now(),
        youtubeId,
        title,
        desc: 'Video agregado por el usuario desde enlace de YouTube.'
    };

    state.videos.push(newVideo);
    saveVideos();
    renderVideos();

    // Limpiar inputs
    urlInput.value = '';
    titleInput.value = '';
}

// Eliminar video
function deleteVideo(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este video de tu lista de recursos?')) {
        state.videos = state.videos.filter(v => v.id !== id);
        saveVideos();
        renderVideos();
    }
}

// Reproducir video (abrir modal)
function playVideo(youtubeId) {
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    
    iframe.src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1`;
    modal.classList.add('active');
}

// Cerrar modal
function closeVideoModal(e) {
    // Si viene de un evento click, asegurarse de que no se hace click dentro de la tarjeta
    if (e && e.target && e.target.closest('.modal-content') && !e.target.classList.contains('close-modal')) {
        return;
    }
    
    const modal = document.getElementById('video-modal');
    const iframe = document.getElementById('video-iframe');
    
    iframe.src = '';
    modal.classList.remove('active');
}

// ==========================================
// Meditaciones / YouTube Management (Salud Espiritual)
// ==========================================

const defaultMeditations = [
    {
        id: 'med-1',
        youtubeId: '18Wf8N5yK3o',
        title: 'Meditación Guiada para la Calma Mental',
        desc: 'Ideal para relajarse en momentos de estrés, reducir la ansiedad y reconectar con la respiración.'
    },
    {
        id: 'med-2',
        youtubeId: '3_G4E7vK-gY',
        title: 'Armonización de Cuencos Tibetanos',
        desc: 'Frecuencias de sanación y cuencos tibetanos ideales para meditar en silencio o conciliar el sueño.'
    },
    {
        id: 'med-3',
        youtubeId: 'zP_65t89K-c',
        title: 'Meditación Zen de Atención Plena',
        desc: 'Práctica sencilla de mindfulness basada en contar respiraciones y aquietar los pensamientos.'
    },
    {
        id: 'med-4',
        youtubeId: 'v5gHj5t2k0E',
        title: 'Meditación Guiada para la Salud',
        desc: 'Enfocada en revitalizar tu energía física, restaurar el bienestar corporal y reconectar con la salud integral.'
    },
    {
        id: 'med-5',
        youtubeId: 'SDuHjz_oxP4',
        title: 'Meditación de Gratitud y Agradecimiento',
        desc: 'Conéctate con la abundancia y el aprecio sincero por la vida, calmando la mente y abriendo el corazón.'
    },
    {
        id: 'med-6',
        youtubeId: 'MIU_JOeU9gs',
        title: 'Sanación a través de Sonidos',
        desc: 'Frecuencias armónicas y sonidos de sanación diseñados para relajar profundamente y equilibrar la mente.'
    }
];

// Cargar meditaciones de localStorage
function loadMeditations() {
    const saved = localStorage.getItem('chi_meditations');
    if (saved) {
        state.meditations = JSON.parse(saved);
        
        // Asegurar que los nuevos videos solicitados estén presentes
        const newIds = ['v5gHj5t2k0E', 'SDuHjz_oxP4', 'MIU_JOeU9gs'];
        let updated = false;
        
        newIds.forEach(id => {
            const exists = state.meditations.some(m => m.youtubeId === id);
            if (!exists) {
                const medData = defaultMeditations.find(m => m.youtubeId === id);
                if (medData) {
                    state.meditations.push(medData);
                    updated = true;
                }
            }
        });
        
        if (updated) {
            saveMeditations();
        }
    } else {
        state.meditations = defaultMeditations;
        saveMeditations();
    }
}

// Guardar meditaciones en localStorage
function saveMeditations() {
    localStorage.setItem('chi_meditations', JSON.stringify(state.meditations));
}

// Cargar comentarios de localStorage
function getComments(youtubeId) {
    const saved = localStorage.getItem(`comments_${youtubeId}`);
    return saved ? JSON.parse(saved) : [];
}

// Guardar comentario en localStorage
function saveComment(youtubeId, commentText) {
    const comments = getComments(youtubeId);
    const newComment = {
        id: 'comm-' + Date.now(),
        text: commentText,
        date: new Date().toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    };
    comments.push(newComment);
    localStorage.setItem(`comments_${youtubeId}`, JSON.stringify(comments));
    return newComment;
}

// Añadir comentario desde el formulario
function handleCommentSubmit(e, youtubeId) {
    e.preventDefault();
    e.stopPropagation();
    
    const form = e.target;
    const input = form.querySelector('.comment-input');
    const text = input.value.trim();
    
    if (!text) return;
    
    saveComment(youtubeId, text);
    input.value = '';
    
    // Volver a renderizar la lista de comentarios para esta meditación
    renderCommentsList(youtubeId);
    
    // Actualizar también el contador en el botón de toggle
    const toggleSpan = form.closest('.meditation-info').querySelector('.meditation-comments-toggle span');
    if (toggleSpan) {
        toggleSpan.textContent = `Ver Experiencias (${getComments(youtubeId).length})`;
    }
}

// Renderizar la lista de comentarios de una meditación
function renderCommentsList(youtubeId) {
    const commentsContainer = document.getElementById(`comments-list-${youtubeId}`);
    if (!commentsContainer) return;
    
    const comments = getComments(youtubeId);
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<li class="no-comments-msg">No hay experiencias compartidas aún. ¡Escribe la tuya abajo!</li>';
        return;
    }
    
    commentsContainer.innerHTML = comments.map(c => `
        <li class="comment-item">
            <span class="comment-text">${escapeHtml(c.text)}</span>
            <span class="comment-meta"><i class="fa-solid fa-sparkles text-spiritual"></i> ${c.date}</span>
        </li>
    `).join('');
    
    // Hacer scroll al final de la lista
    commentsContainer.scrollTop = commentsContainer.scrollHeight;
}

// Helper para escapar HTML y evitar inyecciones XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

// Alternar panel de comentarios
function toggleComments(e, youtubeId) {
    e.stopPropagation();
    
    const panel = document.getElementById(`comments-panel-${youtubeId}`);
    const toggleBtn = e.currentTarget;
    const isExpanded = panel.classList.toggle('active');
    
    if (isExpanded) {
        renderCommentsList(youtubeId);
        toggleBtn.innerHTML = `<span>Ocultar Experiencias (${getComments(youtubeId).length})</span> <i class="fa-solid fa-chevron-up"></i>`;
    } else {
        toggleBtn.innerHTML = `<span>Ver Experiencias (${getComments(youtubeId).length})</span> <i class="fa-solid fa-chevron-down"></i>`;
    }
}

// Agregar meditación personalizada (del canal de CHI)
function addCustomMeditation() {
    const urlInput = document.getElementById('meditation-url');
    const titleInput = document.getElementById('meditation-title');
    
    const url = urlInput.value.trim();
    let title = titleInput.value.trim();
    
    if (!url) {
        alert('Por favor, ingresa un enlace de YouTube válido.');
        return;
    }
    
    const youtubeId = getYouTubeId(url);
    if (!youtubeId) {
        alert('No se pudo reconocer el ID del video de YouTube. Verifica el formato del enlace.');
        return;
    }
    
    if (!title) {
        title = 'Meditación Guiada Comunidad';
    }
    
    const newMeditation = {
        id: 'med-' + Date.now(),
        youtubeId,
        title,
        desc: 'Meditación agregada por el usuario desde canal de la comunidad de YouTube.'
    };
    
    state.meditations.push(newMeditation);
    saveMeditations();
    renderMeditations();
    
    // Limpiar inputs
    urlInput.value = '';
    titleInput.value = '';
}

// Eliminar meditación personalizada
function deleteMeditation(e, id) {
    e.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta meditación?')) {
        state.meditations = state.meditations.filter(m => m.id !== id);
        saveMeditations();
        renderMeditations();
    }
}

// Renderizar la rejilla de meditaciones
function renderMeditations() {
    const grid = document.getElementById('meditations-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    if (!state.meditations || state.meditations.length === 0) {
        grid.innerHTML = '<p class="empty-list-msg" style="grid-column: 1/-1;">No hay meditaciones registradas.</p>';
        return;
    }
    
    state.meditations.forEach(m => {
        const card = document.createElement('div');
        card.className = 'meditation-card glass-card';
        card.setAttribute('onclick', `playVideo('${m.youtubeId}')`);
        
        const commentsCount = getComments(m.youtubeId).length;
        const thumbnailUrl = `https://img.youtube.com/vi/${m.youtubeId}/mqdefault.jpg`;
        
        card.innerHTML = `
            <div class="meditation-thumbnail-wrapper">
                <img src="${thumbnailUrl}" alt="${m.title}" class="meditation-thumbnail">
                <div class="meditation-play-overlay">
                    <i class="fa-solid fa-circle-play"></i>
                </div>
            </div>
            <div class="meditation-info">
                <h4 class="meditation-title">${m.title}</h4>
                <p class="meditation-desc">${m.desc || 'Meditación guiada para tu bienestar integral.'}</p>
                
                <!-- Toggle de Comentarios / Experiencias -->
                <div class="meditation-comments-toggle" onclick="toggleComments(event, '${m.youtubeId}')">
                    <span>Ver Experiencias (${commentsCount})</span>
                    <i class="fa-solid fa-chevron-down"></i>
                </div>
                
                <!-- Panel de Comentarios -->
                <div class="meditation-comments-panel" id="comments-panel-${m.youtubeId}" onclick="event.stopPropagation()">
                    <ul class="comments-list" id="comments-list-${m.youtubeId}">
                        <!-- Inyectados por JS -->
                    </ul>
                    <form class="comment-form" onsubmit="handleCommentSubmit(event, '${m.youtubeId}')">
                        <input type="text" class="comment-input" placeholder="Comparte tu experiencia..." required autocomplete="off">
                        <button type="submit" class="btn-submit-comment" title="Compartir">
                            <i class="fa-solid fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        `;
        
        // Agregar botón de borrar para meditaciones personalizadas
        if (m.id.startsWith('med-') && !defaultMeditations.some(dm => dm.id === m.id)) {
            const footer = document.createElement('div');
            footer.style.padding = '0 1rem 1rem 1rem';
            footer.style.display = 'flex';
            footer.style.justifyContent = 'flex-end';
            footer.style.marginTop = '-0.5rem';
            footer.innerHTML = `
                <button class="btn-delete-video" onclick="deleteMeditation(event, '${m.id}')" title="Eliminar meditación" style="background: transparent; border: none; color: var(--color-text-muted); cursor: pointer; font-size: 0.8rem; transition: var(--transition-fast);">
                    <i class="fa-solid fa-trash-can"></i> Eliminar
                </button>
            `;
            footer.querySelector('button').addEventListener('mouseenter', function() { this.style.color = '#ef4444'; });
            footer.querySelector('button').addEventListener('mouseleave', function() { this.style.color = 'var(--color-text-muted)'; });
            card.appendChild(footer);
        }
        
        grid.appendChild(card);
    });
}

// ==========================================
// Secciones de Salud - Navigation & Anim
// ==========================================

function switchSection(sectionName) {
    // Ocultar todas las secciones
    document.getElementById('section-inicio').style.display = 'none';
    document.getElementById('section-financiera').style.display = 'none';
    document.getElementById('section-emocional').style.display = 'none';
    document.getElementById('section-espiritual').style.display = 'none';

    // Desactivar todos los botones de la barra nav
    document.getElementById('btn-inicio').classList.remove('active');
    document.getElementById('btn-financiera').classList.remove('active');
    document.getElementById('btn-emocional').classList.remove('active');
    document.getElementById('btn-espiritual').classList.remove('active');

    // Activar sección y botón seleccionado
    if (sectionName === 'inicio') {
        document.getElementById('section-inicio').style.display = 'flex';
        document.getElementById('btn-inicio').classList.add('active');
        triggerInicioAnimation();
    } else if (sectionName === 'financiera') {
        document.getElementById('section-financiera').style.display = 'grid';
        document.getElementById('btn-financiera').classList.add('active');
        triggerFinancieraAnimation();
        // Actualizar gráficos por si acaso
        setTimeout(() => {
            updateDashboard();
        }, 100);
    } else if (sectionName === 'emocional') {
        document.getElementById('section-emocional').style.display = 'block';
        document.getElementById('btn-emocional').classList.add('active');
        triggerEmocionalAnimation();
    } else if (sectionName === 'espiritual') {
        document.getElementById('section-espiritual').style.display = 'block';
        document.getElementById('btn-espiritual').classList.add('active');
        triggerEspiritualAnimation();
        // Renderizar meditaciones actualizadas al cambiar de sección
        setTimeout(() => {
            renderMeditations();
        }, 100);
    }
}

// Animación 0: Inicio (Partículas de destellos de luz)
function triggerInicioAnimation() {
    const btn = document.getElementById('btn-inicio');
    
    // Brillo de contorno (dura 10s)
    btn.classList.add('glow-inicio');
    setTimeout(() => btn.classList.remove('glow-inicio'), 10000);

    // Lanzar destellos y estrellas
    const particles = ['✨', '⭐', '💫', '✨', '⭐', '💫'];
    spawnParticles(btn, particles);
}

// Animación 1: Salud Financiera (Monedas, billetes, destellos)
function triggerFinancieraAnimation() {
    const btn = document.getElementById('btn-financiera');
    
    // Brillo de contorno (dura 10s)
    btn.classList.add('glow-financiera');
    setTimeout(() => btn.classList.remove('glow-financiera'), 10000);

    // Lanzar partículas
    const particles = ['💵', '🪙', '✨', '💵', '🪙', '✨', '💵', '🪙', '✨'];
    spawnParticles(btn, particles);
}

// Animación 2: Salud Emocional (Cerebro brillante, corazón rojo, carita triste a feliz)
function triggerEmocionalAnimation() {
    const btn = document.getElementById('btn-emocional');
    
    // Brillo de contorno (dura 10s)
    btn.classList.add('glow-emocional');
    setTimeout(() => btn.classList.remove('glow-emocional'), 10000);

    // Lanzar cerebros y corazones con brillo
    const particles = ['🧠', '❤️', '✨', '🧠', '❤️', '✨'];
    spawnParticles(btn, particles);

    // Lanzar carita de triste a feliz
    spawnChangingFace(btn);
}

// Animación 3: Salud Espiritual (Monje tibetano caminando y meditando)
function triggerEspiritualAnimation() {
    const btn = document.getElementById('btn-espiritual');
    
    // Brillo de contorno (dura 10s)
    btn.classList.add('glow-espiritual');
    setTimeout(() => btn.classList.remove('glow-espiritual'), 10000);

    // Lanzar el monje animado
    spawnMonk(btn);
}

// Generador de partículas de dispersión genérico (Velocidad a la mitad, duración 10s)
function spawnParticles(btn, list) {
    const rect = btn.getBoundingClientRect();
    
    list.forEach((char, i) => {
        const particle = document.createElement('div');
        particle.className = 'sparkle-particle';
        particle.textContent = char;
        
        // Calcular dirección de dispersión radial
        const angle = (Math.PI * 2 / list.length) * i + (Math.random() - 0.5) * 0.4;
        const velocity = 1.75 + Math.random() * 2; // Velocidad a la mitad
        const xVel = Math.cos(angle) * velocity;
        const yVel = Math.sin(angle) * velocity - 1.25; // Desplazamiento vertical a la mitad
        
        // Posicionar en el centro del botón
        particle.style.left = `${rect.left + rect.width / 2 + window.scrollX}px`;
        particle.style.top = `${rect.top + rect.height / 2 + window.scrollY}px`;
        
        document.body.appendChild(particle);
        
        let posX = rect.left + rect.width / 2;
        let posY = rect.top + rect.height / 2;
        let opacity = 1;
        let scale = 0.8;
        
        const anim = setInterval(() => {
            posX += xVel;
            posY += yVel;
            opacity -= 0.003; // Reducción de opacidad lenta para durar 10s
            scale += 0.001;  // Expansión más lenta
            
            particle.style.left = `${posX + window.scrollX}px`;
            particle.style.top = `${posY + window.scrollY}px`;
            particle.style.opacity = opacity;
            particle.style.transform = `scale(${scale})`;
            
            if (opacity <= 0) {
                clearInterval(anim);
                particle.remove();
            }
        }, 30);
    });
}

// Generador de la carita triste a feliz (Transición extendida a 10s)
function spawnChangingFace(btn) {
    const rect = btn.getBoundingClientRect();
    const face = document.createElement('div');
    face.className = 'changing-face-particle';
    face.textContent = '😢';
    
    // Posicionar ligeramente arriba del botón
    face.style.left = `${rect.left + rect.width / 2 - 15 + window.scrollX}px`;
    face.style.top = `${rect.top - 30 + window.scrollY}px`;
    
    document.body.appendChild(face);

    // Cambiar a neutral a los 3.3 segundos
    setTimeout(() => { 
        face.textContent = '😐'; 
    }, 3300);
    
    // Cambiar a feliz a los 6.6 segundos
    setTimeout(() => { 
        face.textContent = '😊'; 
    }, 6600);
    
    // Eliminar del DOM a los 10 segundos
    setTimeout(() => { 
        face.remove(); 
    }, 10000);
}

// Generador del Monje Tibetano (Caminata a mitad de distancia, meditación hasta 10s)
function spawnMonk(btn) {
    // Eliminar monje previo si existe para evitar duplicados
    const existingMonk = document.querySelector('.monk-container');
    if (existingMonk) existingMonk.remove();

    const rect = btn.getBoundingClientRect();
    const monkContainer = document.createElement('div');
    monkContainer.className = 'monk-container walking';
    
    // Desplazamiento a la mitad (caminata de 25px a 5px en lugar de 50px a 10px)
    const startLeft = rect.right + 25 + window.scrollX;
    const destLeft = rect.right + 5 + window.scrollX;
    const topPos = rect.top - 2 + window.scrollY;

    monkContainer.style.left = `${startLeft}px`;
    monkContainer.style.top = `${topPos}px`;
    
    monkContainer.innerHTML = `
        <div class="monk-aura"></div>
        <div class="monk-character">
            <div class="monk-head"></div>
            <div class="monk-tunic"></div>
            <div class="monk-legs">
                <div class="leg left-leg"></div>
                <div class="leg right-leg"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(monkContainer);

    // Caminata lenta hacia el botón
    setTimeout(() => {
        monkContainer.style.left = `${destLeft}px`;
    }, 50);

    // Detenerse (sitting/meditating) tras 1.5 segundos
    setTimeout(() => {
        monkContainer.classList.remove('walking');
        monkContainer.classList.add('meditating');
    }, 1500);

    // Desvanecer y retirar a los 10 segundos
    setTimeout(() => {
        monkContainer.style.opacity = '0';
        setTimeout(() => monkContainer.remove(), 800);
    }, 10000);
}
