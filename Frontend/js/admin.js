let flightsData = [];
let isEditMode = false;
let editId = null;

async function fetchFlights() {
    try {
        const res = await fetch(`${API}/admin/flights`);
        flightsData = await res.json();
        renderFlights(flightsData);
    } catch (e) {
        console.error("Failed to fetch flights", e);
    }
}

function renderFlights(flights) {
    const tbody = document.getElementById('flights-body');
    tbody.innerHTML = flights.map(f => `
        <tr>
            <td>${f.segment_id}</td>
            <td>${f.origin_code}</td>
            <td>${f.destination_code}</td>
            <td>${f.distance_km}</td>
            <td>${f.duration_min}</td>
            <td>$${f.base_cost_usd}</td>
            <td>${f.airline_code}</td>
            <td>${f.aircraft_code}</td>
            <td>
                <button class="action-btn edit-btn" onclick="openModal('${f.segment_id}')">Edit</button>
                <button class="action-btn del-btn" onclick="deleteFlight('${f.segment_id}')">Delete</button>
            </td>
        </tr>
    `).join('');
}

document.getElementById('search-input').addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = flightsData.filter(f => 
        f.segment_id.toLowerCase().includes(term) ||
        f.origin_code.toLowerCase().includes(term) ||
        f.destination_code.toLowerCase().includes(term)
    );
    renderFlights(filtered);
});

function openModal(id = null) {
    isEditMode = !!id;
    const form = document.getElementById('flight-form');
    form.reset();

    if (isEditMode) {
        editId = id;
        document.getElementById('modal-title').innerText = 'Edit Flight';
        document.getElementById('segment_id').disabled = true;
        const flight = flightsData.find(f => f.segment_id === id);
        
        document.getElementById('segment_id').value = flight.segment_id;
        document.getElementById('origin_code').value = flight.origin_code;
        document.getElementById('destination_code').value = flight.destination_code;
        document.getElementById('distance_km').value = flight.distance_km;
        document.getElementById('duration_min').value = flight.duration_min;
        document.getElementById('base_cost_usd').value = flight.base_cost_usd;
        document.getElementById('airline_code').value = flight.airline_code;
        document.getElementById('aircraft_code').value = flight.aircraft_code;
    } else {
        document.getElementById('modal-title').innerText = 'Add New Flight';
        document.getElementById('segment_id').disabled = false;
    }
    
    document.getElementById('flight-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('flight-modal').style.display = 'none';
}

document.getElementById('flight-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const flight = {
        segment_id: document.getElementById('segment_id').value,
        origin_code: document.getElementById('origin_code').value,
        destination_code: document.getElementById('destination_code').value,
        distance_km: parseInt(document.getElementById('distance_km').value),
        duration_min: parseInt(document.getElementById('duration_min').value),
        base_cost_usd: parseInt(document.getElementById('base_cost_usd').value),
        airline_code: document.getElementById('airline_code').value,
        aircraft_code: document.getElementById('aircraft_code').value,
    };
    
    try {
        if (isEditMode) {
            await fetch(`${API}/admin/flights/${editId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flight)
            });
        } else {
            await fetch(`${API}/admin/flights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(flight)
            });
        }
        closeModal();
        fetchFlights();
    } catch (e) {
        console.error("Error saving flight", e);
        alert("Failed to save flight.");
    }
});

async function deleteFlight(id) {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    try {
        await fetch(`${API}/admin/flights/${id}`, { method: 'DELETE' });
        fetchFlights();
    } catch (e) {
        console.error("Error deleting flight", e);
    }
}

// Ensure the page functions load once app is ready
function onAppReady() {
    fetchFlights();
}
