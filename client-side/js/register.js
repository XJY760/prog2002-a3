const params = new URLSearchParams(window.location.search);
const eventId = params.get('eventId');
if (!eventId) alert('No event selected');

async function loadEvent() {
  const res = await fetch(`${API_BASE}/events/${eventId}`);
  const json = await res.json();
  if (!json.success) { alert('Event not found'); return; }
  const e = json.data;
  document.getElementById('eventSummary').innerHTML = `
    <h3>${e.event_name}</h3>
    <p>${e.event_description || ''}</p>
    <p>Date: ${e.event_date.split('T')[0]} | Location: ${e.event_location}</p>`;
}
loadEvent();

document.getElementById('regForm').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const name = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const phone = document.getElementById('userPhone').value.trim();
  const tickets = parseInt(document.getElementById('numTickets').value);

  if (name.length < 2) return alert('Please enter a valid name');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert('Invalid email');
  if (!/^[0-9+\-\s]{8,}$/.test(phone)) return alert('Invalid phone');
  if (!tickets || tickets < 1) return alert('Tickets must be at least 1');

  const res = await fetch(`${API_BASE}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_id: eventId, user_name: name, user_email: email,
      user_phone: phone, number_of_tickets: tickets
    })
  });
  const json = await res.json();
  const msg = document.getElementById('msg');
  if (json.success) {
    msg.innerHTML = `<p style="color:green">✅ Registration successful! ID: ${json.registration_id}</p>`;
    document.getElementById('regForm').reset();
    setTimeout(() => window.location.href = `event-detail.html?id=${eventId}`, 2000);
  } else {
    msg.innerHTML = `<p style="color:red">❌ ${json.message}</p>`;
  }
});