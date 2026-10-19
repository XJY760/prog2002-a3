const express = require('express');
const cors = require('cors');
const db = require('./event_db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/events', async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let sql = `SELECT e.*, c.category_name FROM charity_event e
               LEFT JOIN event_category c ON e.category_id = c.category_id WHERE 1=1`;
    const params = [];
    if (search) { sql += ' AND e.event_name LIKE ?'; params.push(`%${search}%`); }
    if (category) { sql += ' AND e.category_id = ?'; params.push(category); }
    if (status) { sql += ' AND e.event_status = ?'; params.push(status); }
    sql += ' ORDER BY e.event_date DESC';
    const [rows] = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/events/:id', async (req, res) => {
  try {
    const [eventRows] = await db.query(
      `SELECT e.*, c.category_name FROM charity_event e
       LEFT JOIN event_category c ON e.category_id = c.category_id
       WHERE e.event_id = ?`, [req.params.id]);
    if (eventRows.length === 0)
      return res.status(404).json({ success: false, message: 'Event not found' });

    const [regRows] = await db.query(
      `SELECT * FROM registration WHERE event_id = ?
       ORDER BY registration_date DESC`, [req.params.id]);

    res.json({ success: true, data: { ...eventRows[0], registrations: regRows } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}); app.post('/api/events', async (req, res) => {
  try {
    const { event_name, event_description, event_date, event_location,
      event_status, category_id, latitude, longitude } = req.body;
    if (!event_name || !event_date || !event_location)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const [result] = await db.query(
      `INSERT INTO charity_event
       (event_name,event_description,event_date,event_location,event_status,category_id,latitude,longitude)
       VALUES (?,?,?,?,?,?,?,?)`,
      [event_name, event_description, event_date, event_location,
        event_status || 'Active', category_id || null, latitude || null, longitude || null]);
    res.status(201).json({ success: true, message: 'Event created', event_id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { event_name, event_description, event_date, event_location,
      event_status, category_id } = req.body;
    const [result] = await db.query(
      `UPDATE charity_event SET event_name=?, event_description=?, event_date=?,
       event_location=?, event_status=?, category_id=? WHERE event_id=?`,
      [event_name, event_description, event_date, event_location,
        event_status, category_id, req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const [regs] = await db.query(
      'SELECT COUNT(*) AS count FROM registration WHERE event_id = ?', [req.params.id]);
    if (regs[0].count > 0)
      return res.status(400).json({
        success: false,
        message: `Cannot delete: ${regs[0].count} registration(s) exist for this event.`
      });
    const [result] = await db.query('DELETE FROM charity_event WHERE event_id = ?', [req.params.id]);
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}); app.post('/api/registrations', async (req, res) => {
  try {
    const { event_id, user_name, user_email, user_phone, number_of_tickets } = req.body;
    if (!event_id || !user_name || !user_email || !user_phone || !number_of_tickets)
      return res.status(400).json({ success: false, message: 'Missing required fields' });

    const [result] = await db.query(
      `INSERT INTO registration (event_id,user_name,user_email,user_phone,number_of_tickets)
       VALUES (?,?,?,?,?)`,
      [event_id, user_name, user_email, user_phone, number_of_tickets]);
    res.status(201).json({
      success: true, message: 'Registration successful',
      registration_id: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ success: false, message: 'This email already registered for this event.' });
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/categories', async (req, res) => {
  const [rows] = await db.query('SELECT * FROM event_category');
  res.json({ success: true, data: rows });
});

app.get('/api/events/:id/weather', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT latitude, longitude FROM charity_event WHERE event_id = ?', [req.params.id]);
    if (!rows[0] || !rows[0].latitude)
      return res.status(404).json({ success: false, message: 'Location not available' });
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${rows[0].latitude}&longitude=${rows[0].longitude}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Australia%2FSydney`;
    const r = await fetch(url);
    const data = await r.json();
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));