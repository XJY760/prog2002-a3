# PROG2002 A3 - Charity Event Website

This is a complete dynamic website developed for the PROG2002 Assessment 3. It includes a client-side website for users to browse and register for charity events, and an admin-side website for staff to manage event data (CRUD).

## Team Members
- {xiejiayu} - [ 202300408028]
- [liuziyu] - [202300408029]

## Technologies Used
- **Backend**: Node.js, Express.js, MySQL
- **Frontend**: HTML, CSS, Vanilla JavaScript, DOM, Fetch API
- **Database**: MySQL (charity_events)

## Project Structure
- `/api` - Backend RESTful API (Node.js + Express)
- `/client-side` - User-facing website (Home, Search, Event Details, Registration)
- `/admin-side` - Admin dashboard (List, Add, Edit, Delete Events)

## How to Run the Project Locally
1. **Database**: 
   Import the provided `charity_events.sql` file into MySQL using phpMyAdmin or MySQL Workbench.
2. **API Backend**:
   Open a terminal and navigate to the `api` folder.
   Run `npm install` to install dependencies.
   Create a `.env` file with your database credentials.
   Run `npm start` to start the server on port 3000.
3. **Client-side Website**:
   Open the `client-side/index.html` file using Live Server (or any local web server).
4. **Admin-side Website**:
   Open the `admin-side/index.html` file using Live Server.