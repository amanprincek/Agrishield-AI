# 🌾 AgriShield-AI

AgriShield-AI is a Smart Agriculture platform being developed for the **Smart India Hackathon (SIH)**.

The goal of the project is to help farmers monitor their fields, manage agricultural data, detect crop-related problems using AI, and receive useful alerts and recommendations.

The project is currently under active development.

---

# 📌 Table of Contents

1. [Project Overview](#-project-overview)
2. [Current Project Status](#-current-project-status)
3. [Technology Stack](#-technology-stack)
4. [Project Structure](#-project-structure)
5. [Prerequisites](#-prerequisites)
6. [Clone the Repository](#-clone-the-repository)
7. [Backend Setup](#-backend-setup)
8. [MySQL Database Setup](#-mysql-database-setup)
9. [Environment Variables](#-environment-variables)
10. [Running the Backend](#-running-the-backend)
11. [Running the Frontend](#-running-the-frontend)
12. [Testing the Application](#-testing-the-application)
13. [API Endpoints](#-api-endpoints)
14. [Database](#-database)
15. [Frontend Field Management](#-frontend-field-management)
16. [Git and GitHub Workflow](#-git-and-github-workflow)
17. [Creating a New Feature Branch](#-creating-a-new-feature-branch)
18. [Commit and Push](#-commit-and-push)
19. [Pull Request Workflow](#-pull-request-workflow)
20. [Keeping Local Main Updated](#-keeping-local-main-updated)
21. [Important Git Commands](#-important-git-commands)
22. [Development Rules](#-development-rules)
23. [Troubleshooting](#-troubleshooting)
24. [Future Modules](#-future-modules)

---

# 🌱 Project Overview

AgriShield-AI is being developed as an intelligent agriculture assistance platform.

The platform is intended to provide features such as:

- 🌾 Farmer and field management
- 🌱 Crop information management
- 🤖 AI-based crop/disease detection
- 🚨 Agricultural alerts
- 🌦️ Weather-related information
- 📊 Agricultural dashboard
- 💾 Structured database storage
- 🔮 Future AI-based recommendations

The current development focus is on establishing a strong backend, database and frontend foundation before implementing advanced AI modules.

---

# 🚧 Current Project Status

## Completed

### Git/GitHub

- Git repository established
- `main` branch established
- Feature-based Git workflow established
- Backend foundation branch completed
- Database foundation completed
- Field management branch completed
- Frontend foundation branch completed
- Pull Request based merging workflow established

### Backend

- FastAPI backend created
- Uvicorn development server configured
- MySQL connection implemented
- Environment variables configured using `.env`
- Field management APIs implemented
- CRUD operations implemented

### Database

- MySQL installed and configured
- Database connection tested
- `fields` table implemented
- Backend successfully connected to MySQL

### Frontend

- React + Vite frontend created
- Dashboard UI created
- Field management UI implemented
- Add Field implemented
- View Fields implemented
- Edit Field implemented
- Delete Field implemented
- Frontend connected to FastAPI backend
- Frontend connected indirectly to MySQL through backend

---

# 🛠 Technology Stack

## Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- npm

## Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

## Database

- MySQL 8.x
- MySQL Connector/Python

## Development Tools

- Git
- GitHub
- Visual Studio Code
- PowerShell

---

# 📁 Project Structure

Current project structure:

```text
Agrishield-AI/
│
├── backend/
│   ├── main.py
│   ├── database.py
│   └── ...
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   ├── package-lock.json
│   └── vite.config.js
│
├── .env
├── .gitignore
├── requirements.txt
└── README.md
