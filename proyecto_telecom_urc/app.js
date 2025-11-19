// URL base de tu API de Flask
const API_URL = 'http://localhost:5000/aplicar';

// Función que se llama al hacer clic en el botón "Analizar y Vincular"
async function analizarCV() {
    const cvTextarea = document.getElementById('cv-text');
    const resultsOutput = document.getElementById('results-output');
    const loading = document.getElementById('loading');
    const cv_texto = cvTextarea.value.trim();

    if (!cv_texto) {
        alert("Por favor, pega el texto de tu CV antes de analizar.");
        return;
    }

    // 1. Mostrar estado de carga y limpiar resultados anteriores
    resultsOutput.innerHTML = '';
    loading.classList.remove('hidden');

    try {
        // 2. Petición POST a la API de Cognilink
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cv_texto: cv_texto })
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}. ¿Está corriendo la API (api_app.py) con 'python api_app.py'?`);
        }

        const data = await response.json();
        
        // 3. Ocultar carga y mostrar resultados
        loading.classList.add('hidden');
        renderizarResultados(data);

    } catch (error) {
        loading.classList.add('hidden');
        resultsOutput.innerHTML = `<p style="color: red;">¡Error de conexión! ${error.message}</p>`;
        console.error("Error al conectar con la API:", error);
    }
}


// Función para mostrar los resultados de forma atractiva con el nuevo medidor circular y botones
function renderizarResultados(data) {
    const resultsOutput = document.getElementById('results-output');
    resultsOutput.innerHTML = '';

    if (data.length === 0) {
        resultsOutput.innerHTML = '<p class="alert alert-warning">No se encontraron vacantes para analizar. Verifica los datos.</p>';
        return;
    }

    data.forEach(item => {
        const vacante = item.vacante;
        const puntaje = item.puntaje_match;
        const color = puntaje >= 75 ? '#28a745' : puntaje >= 40 ? '#ffc107' : '#dc3545'; // Verde, Amarillo, Rojo
        const progress = puntaje * 3.6; // 360 grados / 100 = 3.6

        const card = document.createElement('div');
        card.className = 'vacante-card';
        
        // Círculo de progreso con gradiente cónico
        const circleStyle = `
            background: conic-gradient(${color} ${progress}deg, #f0f0f0 ${progress}deg);
        `;

        let htmlContent = `
            <div class="match-circle" style="${circleStyle}">
                ${puntaje}%
            </div>

            <h3>${vacante.titulo} en ${vacante.empresa}</h3>
            <p><strong>Requisitos Técnicos:</strong> ${vacante.requisitos_tecnicos.join(', ')}</p>
            <p><strong>Requisitos Blandos:</strong> ${vacante.requisitos_blandos.join(', ')}</p>
            <p style="font-style: italic;">"${vacante.descripcion}"</p>
            <hr>
            <p><strong>Habilidades Cumplidas Detectadas:</strong> ${item.habilidades_cumplidas.join(', ') || 'Ninguna detectada.'}</p>
        `;

        // Añadir sección de cursos recomendados si hay brechas
        if (item.habilidades_faltantes.length > 0) {
            htmlContent += `
                <div class="recomendaciones">
                    <p style="font-weight: bold; color: #dc3545;">🚨 Brecha de Habilidades: Necesitas reforzar: ${item.habilidades_faltantes.map(h => h.toUpperCase()).join(', ')}</p>
                    <p style="margin-top: 15px; font-weight: bold;">Plan de Crecimiento Cognilink:</p>
                    
                    ${item.cursos_recomendados.map(c => 
                        `<div class="curso-item">
                            <span>${c.titulo_curso} (Habilidad: ${c.habilidad})</span>
                            <a href="#" class="course-link" target="_blank">Ver Curso en ${c.proveedor}</a>
                        </div>`
                    ).join('')}
                    ${item.cursos_recomendados.length === 0 ? '<p class="text-muted">No encontramos cursos específicos para estas brechas en nuestro catálogo simulado.</p>' : ''}
                </div>
            `;
        } else {
            htmlContent += `<p style="color: #28a745; font-weight: bold; margin-top: 15px;">¡Listo! Cumples con todas las habilidades requeridas para aplicar.</p>`;
        }
        
        card.innerHTML = htmlContent;
        resultsOutput.appendChild(card);
    });
}