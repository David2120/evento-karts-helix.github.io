/* HELIX STUDIO KARTS CHAMPIONSHIP */

document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.querySelector('.registration-section');
    const registrationForm = document.getElementById('registration-form');
    const charNameInput = document.getElementById('char-name');
    const raceSelect = document.getElementById('race-assign-select');
    const feedbackMessage = document.getElementById('registration-feedback');
    const racesContainer = document.getElementById('races-container');
    const finalWinnersList = document.getElementById('final-winners-list');
    const liveUpdateNotice = document.getElementById('live-update-notice');
    const pageSubtitle = document.querySelector('.subtitle');
    let eventData = {};

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

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pilotName = charNameInput.value.trim();
        const raceId = parseInt(raceSelect.value);

        if (!pilotName) { showFeedback('Por favor, introduce tu nombre de piloto.', 'error'); return; }

        const race = eventData.races.find(r => r.id === raceId);
        if (!race) { showFeedback('Ha ocurrido un error, por favor recarga la página.', 'error'); return; }

        if (race.pilots.length >= 5) { showFeedback(`${race.name} está llena. Intenta en otra.`, 'error'); return; }

        const isAlreadyRegistered = eventData.races.some(r => r.pilots.some(p => p.toLowerCase() === pilotName.toLowerCase()));
        if (isAlreadyRegistered) { showFeedback('Ya estás inscrito en una carrera.', 'error'); return; }

        race.pilots.push(pilotName);
        saveData();
        renderUI();
        charNameInput.value = '';
        showFeedback(`¡Éxito! Te has inscrito en ${race.name}.`, 'success');
    });

    function renderUI() {
        if (eventData.status === 'closed') {
            registrationSection.style.display = 'none';
            pageSubtitle.textContent = 'Clasificación en Directo';
        } else {
            registrationSection.style.display = 'block';
            pageSubtitle.textContent = 'Inscripciones Abiertas y Clasificación en Directo';
        }

        const racesContainer = document.getElementById('races-container');
        racesContainer.innerHTML = '';
        let finalWinners = [];

        eventData.races.forEach(race => {
            if (race.winner) finalWinners.push(race.winner);

            const raceCard = document.createElement('div');
            raceCard.className = 'race-card card';
            let pilotsListHTML = `<p><i>Plazas disponibles (${5 - race.pilots.length})</i></p>`;
            if (race.pilots.length > 0) {
                pilotsListHTML = `<ol>${race.pilots.map(p => `<li class="${p === race.winner ? 'winner' : ''}">${p}</li>`).join('')}</ol>`;
            }
            raceCard.innerHTML = `<h3>${race.name}</h3><p class="race-counter">(${race.pilots.length}/5)</p>${pilotsListHTML}`;
            racesContainer.appendChild(raceCard);
        });

        finalWinnersList.innerHTML = finalWinners.length > 0 ? finalWinners.map(w => `<li>${w}</li>`).join('') : '<li>Aún no hay ganadores clasificados.</li>';

        const availableRaces = eventData.races.filter(r => r && Array.isArray(r.pilots) && r.pilots.length < 5);
        if (availableRaces.length > 0) {
            raceSelect.innerHTML = availableRaces.map(r => `<option value="${r.id}">${r.name} (${5 - r.pilots.length} plazas libres)</option>`).join('');
            registrationForm.querySelector('button').disabled = false;
        } else {
            raceSelect.innerHTML = '<option>Todas las carreras están llenas</option>';
            registrationForm.querySelector('button').disabled = true;
        }
    }

    function showFeedback(message, type) { }

    window.addEventListener('storage', (event) => {
        if (event.key === 'helixKartsData') {
            liveUpdateNotice.classList.remove('hidden');
            setTimeout(() => {
                loadData();
                renderUI();
                liveUpdateNotice.classList.add('hidden');
            }, 500);
        }
    });

    loadData();
    renderUI();
});