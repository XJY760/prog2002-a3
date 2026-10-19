const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');

const weatherCodeMap = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
  55: 'Dense drizzle', 61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
  80: 'Light showers', 81: 'Moderate showers', 82: 'Violent showers', 95: 'Thunderstorm'
};

async function loadEvent() {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  const json = await res.json();
  if (!json.success) { alert('Event not found'); return; }
  const e = json.data;

  document.getElementById('eventInfo').innerHTML = `
    <h1>${e.event_name}</h1>
    <p>${e.event_description || ''}</p>
    <p><strong>Date:</strong> ${e.event_date.split('T')[0]}</p>
    <p><strong>Location:</strong> ${e.event_location}</p>
    <p><strong>Status:</strong> ${e.event_status}</p>
    <p><strong>Category:</strong> ${e.category_name || 'N/A'}</p>`;

  const tbody = document.querySelector('#regTable tbody');
  tbody.innerHTML = '';
  (e.registrations || []).forEach(r => {
    tbody.innerHTML += `<tr>
      <td>${r.user_name}</td><td>${r.user_email}</td>
      <td>${r.number_of_tickets}</td>
      <td>${new Date(r.registration_date).toLocaleString()}</td>
    </tr>`;
  });

  const btn = document.getElementById('registerBtn');
  btn.disabled = false;
  btn.onclick = () => window.location.href = `register.html?eventId=${eventId}`;
}

async function loadWeather() {
  try {
    const res = await fetch(`${API_BASE}/events/${eventId}/weather`);
    const json = await res.json();
    if (!json.success) return;
    const d = json.data.daily;
    document.getElementById('weather').innerHTML = `
      <h3>Weather Forecast</h3>
      <p>${weatherCodeMap[d.weather_code[0]] || 'Unknown'} |
         Max ${d.temperature_2m_max[0]}°C | Min ${d.temperature_2m_min[0]}°C</p>`;
  } catch (e) { }
}

loadEvent();
loadWeather();