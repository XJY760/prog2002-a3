async function loadHome() {
  const res = await fetch(`${API_BASE}/events?status=Active`);
  const json = await res.json();
  const box = document.getElementById('eventList');
  box.innerHTML = '';
  json.data.forEach(e => {
    box.innerHTML += `
      <div class="card">
        <h3>${e.event_name}</h3>
        <p>${e.event_description || ''}</p>
        <p><strong>Date:</strong> ${e.event_date.split('T')[0]} | <strong>Location:</strong> ${e.event_location}</p>
        <a href="event-detail.html?id=${e.event_id}"><button>View Details</button></a>
      </div>`;
  });
}
loadHome();