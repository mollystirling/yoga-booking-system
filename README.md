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

## Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd <your-project-folder>