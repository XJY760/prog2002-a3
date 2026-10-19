async function searchEvents() {
  const search = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusFilter').value;
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const res = await fetch(`${API_BASE}/events?${params.toString()}`);
  const json = await res.json();
  const box = document.getElementById('results');
  box.innerHTML = '';
  if (!json.data.length) { box.innerHTML = '<p>No events found.</p>'; return; }
  json.data.forEach(e => {
    box.innerHTML += `
      <div class="card">
        <h3>${e.event_name}</h3>
        <p>${e.event_date.split('T')[0]} | ${e.event_location} | ${e.event_status}</p>
        <a href="event-detail.html?id=${e.event_id}"><button>View</button></a>
      </div>`;
  });
}
searchEvents();