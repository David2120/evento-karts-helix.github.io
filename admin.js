/* HELIX STUDIO KARTS CHAMPIONSHIP */

document.addEventListener('DOMContentLoaded', () => {
    const ADMIN_USERNAME = "helix_admin";
    const ADMIN_PASSWORD = "SuperSecretPassword123";

    let eventData = {};

    function authenticate() {
        const user = prompt("Usuario:");
        const pass = prompt("Contraseña:");
        if (user === ADMIN_USERNAME && pass === ADMIN_PASSWORD) {
            document.getElementById('admin-wrapper').classList.remove('hidden');
            initializeAdminPanel();
        } else {
            document.body.innerHTML = `<h1 style="color: red; text-align: center; margin-top: 50px;">ACCESO DENEGADO</h1>`;
        }
    }

    function initializeAdminPanel() {
        loadData();
        setupEventListeners();
        renderAdminUI();
    }

    function saveData() {
        localStorage.setItem('helixKartsData', JSON.stringify(eventData));
    }

    function loadData() {
        const savedData = localStorage.getItem('helixKartsData');
        if (savedData) {
            eventData = JSON.parse(savedData);
            if (!eventData.status || !Array.isArray(eventData.races)) {
                eventData = createInitialData();
            }
        } else {
            eventData = createInitialData();
        }
    }

    function createInitialData() {
        return {
            status: 'open',
            races: Array.from({ length: 5 }, (_, i) => ({
                id: i + 1,
                name: `Carrera ${i + 1}`,
                pilots: [],
                winner: ''
            }))
        };
    }

    function setupEventListeners() {
        document.getElementById('toggle-registration-btn').addEventListener('click', () => {
            if (eventData.status === 'open') {
                if (confirm('¿Seguro que quieres cerrar las inscripciones? Los usuarios ya no podrán registrarse.')) {
                    eventData.status = 'closed';
                }
            } else {
                if (confirm('¿Seguro que quieres reabrir las inscripciones?')) {
                    eventData.status = 'open';
                }
            }
            saveData();
            renderAdminUI();
        });

        document.getElementById('reset-data-btn').addEventListener('click', () => {
            if (confirm('¿ESTÁS SEGURO? Esto borrará TODOS los datos y reabrirá las inscripciones.')) {
                eventData = createInitialData();
                saveData();
                renderAdminUI();
            }
        });

        document.getElementById('races-admin-container').addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-pilot-btn')) {
                const raceId = parseInt(e.target.dataset.raceid);
                const pilotName = e.target.dataset.pilot;
                const race = eventData.races.find(r => r.id === raceId);
                if (race && confirm(`¿Eliminar a ${pilotName} de ${race.name}?`)) {
                    race.pilots = race.pilots.filter(p => p !== pilotName);
                    if (race.winner === pilotName) race.winner = '';
                    saveData();
                    renderAdminUI();
                }
            }
        });
        document.getElementById('winner-declaration-container').addEventListener('change', (e) => {
            if (e.target.tagName === 'SELECT') {
                const raceId = parseInt(e.target.dataset.raceid);
                const winnerName = e.target.value;
                const race = eventData.races.find(r => r.id === raceId);
                if (race) {
                    race.winner = winnerName;
                    saveData();
                    renderAdminUI();
                }
            }
        });
    }

    function renderAdminUI() {
        const toggleBtn = document.getElementById('toggle-registration-btn');
        if (eventData.status === 'open') {
            toggleBtn.textContent = 'Cerrar Inscripciones y Empezar Evento';
            toggleBtn.classList.remove('status-closed');
            toggleBtn.classList.add('status-open');
        } else {
            toggleBtn.textContent = 'Reabrir Inscripciones';
            toggleBtn.classList.add('status-closed');
            toggleBtn.classList.remove('status-open');
        }

        const racesAdminContainer = document.getElementById('races-admin-container');
        const winnerDeclarationContainer = document.getElementById('winner-declaration-container');
        racesAdminContainer.innerHTML = '';
        winnerDeclarationContainer.innerHTML = '';

        eventData.races.forEach(race => {
            let pilotsListHTML = race.pilots.length > 0 ? `<ul>${race.pilots.map(p => `<li>${p} <button class="remove-pilot-btn" data-raceid="${race.id}" data-pilot="${p}">×</button></li>`).join('')}</ul>` : `<p><i>Sin pilotos</i></p>`;
            racesAdminContainer.innerHTML += `<div class="admin-race-list"><h4>${race.name} (${race.pilots.length}/5)</h4>${pilotsListHTML}</div>`;

            let optionsHTML = '<option value="">-- Declarar Ganador --</option>';
            race.pilots.forEach(pilot => { optionsHTML += `<option value="${pilot}" ${pilot === race.winner ? 'selected' : ''}>${pilot}</option>`; });
            winnerDeclarationContainer.innerHTML += `<div class="form-group"><label>Ganador ${race.name}:</label><select data-raceid="${race.id}">${optionsHTML}</select></div>`;
        });
    }

    authenticate();
});