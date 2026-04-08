# Yoga Studio Booking System

## Overview
This web application allows users to browse yoga courses, view session details, and make bookings. It also provides organiser functionality to manage courses, sessions, and users.
The system was developed as part of the Web Application Development coursework.

controllers/   → request handling logic  
routes/        → route definitions  
models/        → database interaction  
views/         → Mustache templates  
public/        → CSS and static assets  
services/      → booking logic  
middlewares/   → authentication and access control  

---

## Features

### Public Users
- View upcoming yoga courses
- View course details including:
  - Description
  - Dates
  - Session times
  - Location
  - Price

### Registered Users
- Register and log in
- Book:
  - Full courses
  - Individual sessions (if drop-ins allowed)
- View booking confirmation
- Cancel bookings

### Organisers
- Create, edit, and delete courses
- Add, update, and delete sessions
- View participants for:
  - Courses
  - Individual sessions
- Promote users to organisers
- Remove users

---

## Technologies Used

- Node.js
- Express.js
- Mustache (templating engine)
- NeDB (database)
- Express-session (authentication)

---


## Running the Project Locally

### Clone the repository
git clone https://github.com/mollystirling/yoga-booking-system.git
Navigate into the folder
cd yoga-booking-system


### Install dependencies
npm install


### Start the application
npm start


### Open in browser
http://localhost:3000


## Deployment (Render)


## Live application:
https://yoga-booking-system-j2ye.onrender.com/

This application is deployed using Render as a Web Service connected to the GitHub repository.


## Build command:
npm install


## Start command:
npm start


## The server is configured to use:
const PORT = process.env.PORT || 3000;
