git1. PROJECT TREE

```text
Agrishield-AI/
├── .env
├── .gitignore
├── README.md
├── Setup.md
├── requirements.txt
├── backend/
│   ├── database.py
│   └── main.py
├── database/
│   └── schema.sql
├── frontend/
│   ├── .gitignore
│   ├── README.md
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
```

2. BACKEND FILES

FILE: backend/database.py
```python
import os

import mysql.connector
from dotenv import load_dotenv


load_dotenv()


def get_db_connection():
    connection = mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME")
    )

    return connection


if __name__ == "__main__":
    connection = get_db_connection()

    if connection.is_connected():
        print("MySQL connection successful!")

    connection.close()
```

FILE: backend/main.py
```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from backend.database import get_db_connection


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Field(BaseModel):
    name: str
    location: str
    crop: str
    area_acres: float




@app.get("/")
def root():
    return {"message": "Agrishield-AI Backend is running"}


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": "Agrishield-AI"
    }


@app.post("/api/fields")
def create_field(field: Field):
    connection = get_db_connection()
    cursor = connection.cursor()

    query = """
        INSERT INTO fields (name, location, crop, area_acres)
        VALUES (%s, %s, %s, %s)
    """

    values = (
        field.name,
        field.location,
        field.crop,
        field.area_acres
    )

    cursor.execute(query, values)
    connection.commit()

    field_id = cursor.lastrowid

    cursor.close()
    connection.close()

    return {
        "id": field_id,
        **field.model_dump()
    }


@app.get("/api/fields")
def get_fields():
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    cursor.execute("SELECT * FROM fields ORDER BY id")

    fields = cursor.fetchall()

    cursor.close()
    connection.close()

    return fields


@app.get("/api/fields/{field_id}")
def get_field(field_id: int):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    query = "SELECT * FROM fields WHERE id = %s"

    cursor.execute(query, (field_id,))

    field = cursor.fetchone()

    cursor.close()
    connection.close()

    if field is None:
        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

@app.delete("/api/fields/{field_id}")
def delete_field(field_id: int):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM fields WHERE id = %s",
        (field_id,)
    )

    connection.commit()

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

    cursor.close()
    connection.close()

    return {
        "message": "Field deleted successfully",
        "id": field_id
    }

@app.put("/api/fields/{field_id}")
def update_field(field_id: int, field: Field):
    connection = get_db_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE fields
        SET name = %s,
            location = %s,
            crop = %s,
            area_acres = %s
        WHERE id = %s
        """,
        (
            field.name,
            field.location,
            field.crop,
            field.area_acres,
            field_id
        )
    )

    connection.commit()

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        raise HTTPException(
            status_code=404,
            detail="Field not found"
        )

    cursor.execute(
        "SELECT id, name, location, crop, area_acres FROM fields WHERE id = %s",
        (field_id,)
    )

    updated_field = cursor.fetchone()

    cursor.close()
    connection.close()

    return updated_field

    return field
```

3. FRONTEND FILES

FILE: frontend/.gitignore
```gitignore
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?
```

FILE: frontend/README.md
```md
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
```

FILE: frontend/eslint.config.js
```js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
```

FILE: frontend/index.html
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>frontend</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

FILE: frontend/package.json
```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.2.8",
    "react-dom": "^19.2.8"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/react": "^19.2.17",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^6.0.4",
    "eslint": "^10.8.0",
    "eslint-plugin-react-hooks": "^7.1.1",
    "eslint-plugin-react-refresh": "^0.5.3",
    "globals": "^17.7.0",
    "vite": "^8.2.0"
  }
}
```

FILE: frontend/src/App.css
```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f7f4;
  color: #1f2937;
}

.app {
  min-height: 100vh;
  display: flex;
}

/* Sidebar */

.sidebar {
  width: 240px;
  min-height: 100vh;
  background: #173f2a;
  color: white;
  padding: 28px 18px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 10px 35px;
}

.logo-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: #7ccf58;
  color: #173f2a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  font-weight: bold;
}

.logo h2 {
  font-size: 20px;
}

.logo span {
  font-size: 11px;
  color: #b9d6c0;
}

.nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  text-decoration: none;
  color: #c8dccd;
  padding: 13px 14px;
  border-radius: 9px;
  font-size: 15px;
}

.nav-item:hover,
.nav-item.active {
  background: #285b3c;
  color: white;
}

/* Main */

.main-content {
  flex: 1;
  padding: 35px 45px;
  max-width: 1400px;
}

/* Topbar */

.topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.topbar h1 {
  font-size: 30px;
  margin-bottom: 6px;
}

.topbar p {
  color: #6b7280;
}

.profile-button {
  border: none;
  background: white;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* Stats */

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.stat-card span {
  display: block;
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-card strong {
  font-size: 30px;
  color: #173f2a;
}

/* Welcome */

.welcome-card {
  background: #dcefd9;
  border-radius: 16px;
  padding: 35px;
  margin-bottom: 30px;
}

.welcome-card h2 {
  font-size: 25px;
  margin-bottom: 10px;
  color: #173f2a;
}

.welcome-card p {
  max-width: 650px;
  line-height: 1.6;
  color: #4b6350;
  margin-bottom: 22px;
}

.primary-button {
  background: #2f7d46;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.primary-button:hover {
  background: #25663a;
}

/* Recent fields */

.recent-section {
  background: white;
  border-radius: 14px;
  padding: 25px;
  min-height: 250px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.section-header h2 {
  font-size: 20px;
}

.section-header button {
  border: none;
  background: transparent;
  color: #2f7d46;
  cursor: pointer;
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 45px 20px;
}

.empty-state h3 {
  margin-bottom: 8px;
  color: #374151;
}

.empty-state p {
  color: #6b7280;
}

/* Responsive */

@media (max-width: 800px) {
  .sidebar {
    width: 190px;
  }

  .main-content {
    padding: 25px;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .app {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    min-height: auto;
  }

  .nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .main-content {
    padding: 20px;
  }
}

.field-form-card {
  background: white;
  border-radius: 14px;
  padding: 28px;
  margin-bottom: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.field-form-card .section-header {
  margin-bottom: 25px;
}

.field-form-card .section-header p {
  color: #6b7280;
  margin-top: 5px;
}

.field-form-card .section-header button {
  border: none;
  background: #f3f4f6;
  padding: 9px 15px;
  border-radius: 7px;
  cursor: pointer;
}

.field-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 15px;
  outline: none;
}

.form-group input:focus {
  border-color: #2f7d46;
}

.field-form .primary-button {
  width: fit-content;
}

@media (max-width: 700px) {
  .field-form {
    grid-template-columns: 1fr;
  }
}

.delete-button {
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  background: #fee2e2;
  color: #b91c1c;
  font-weight: 600;
}

.delete-button:hover {
  background: #fecaca;
}
```

FILE: frontend/src/App.jsx
```jsx
import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [fields, setFields] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    crop: '',
    area_acres: '',
  })

  // =========================
  // FETCH ALL FIELDS
  // =========================
  const fetchFields = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/fields'
      )

      if (!response.ok) {
        throw new Error('Failed to fetch fields')
      }

      const data = await response.json()

      setFields(data)
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  // =========================
  // DELETE FIELD
  // =========================
  const handleDelete = async (fieldId) => {
    console.log('DELETE CLICKED:', fieldId)

    const confirmed = window.confirm(
      'Are you sure you want to delete this field?'
    )

    if (!confirmed) {
      return
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/fields/${fieldId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete field')
      }

      await fetchFields()

      alert('Field deleted successfully!')
    } catch (error) {
      console.error('Delete error:', error)

      alert('Failed to delete field.')
    }
  }

  // =========================
  // EDIT FIELD
  // =========================
  const handleEdit = (field) => {
    setEditingField(field)

    setFormData({
      name: field.name,
      location: field.location,
      crop: field.crop,
      area_acres: field.area_acres,
    })

    setShowForm(true)
  }

  // =========================
  // LOAD FIELDS ON PAGE LOAD
  // =========================
  useEffect(() => {
    fetchFields()
  }, [])

  // =========================
  // HANDLE INPUT CHANGE
  // =========================
  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // =========================
  // CREATE / UPDATE FIELD
  // =========================
  const handleSubmit = async (event) => {
    event.preventDefault()

    try {
      const isEditing = editingField !== null

      const url = isEditing
        ? `http://127.0.0.1:8000/api/fields/${editingField.id}`
        : 'http://127.0.0.1:8000/api/fields'

      const method = isEditing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          area_acres: Number(formData.area_acres),
        }),
      })

      if (!response.ok) {
        throw new Error(
          isEditing
            ? 'Failed to update field'
            : 'Failed to create field'
        )
      }

      const result = await response.json()

      console.log(
        isEditing ? 'Field updated:' : 'Field created:',
        result
      )

      await fetchFields()

      alert(
        isEditing
          ? 'Field updated successfully!'
          : 'Field added successfully!'
      )

      setFormData({
        name: '',
        location: '',
        crop: '',
        area_acres: '',
      })

      setEditingField(null)
      setShowForm(false)
    } catch (error) {
      console.error('Submit error:', error)

      alert(
        editingField
          ? 'Failed to update field.'
          : 'Failed to add field.'
      )
    }
  }

  // =========================
  // CANCEL FORM
  // =========================
  const handleCancel = () => {
    setShowForm(false)
    setEditingField(null)

    setFormData({
      name: '',
      location: '',
      crop: '',
      area_acres: '',
    })
  }

  return (
    <div className="app">

      {/* =========================
          SIDEBAR
      ========================= */}
      <aside className="sidebar">

        <div className="logo">

          <div className="logo-icon">
            A
          </div>

          <div>
            <h2>AgriShield</h2>
            <span>AI Agriculture</span>
          </div>

        </div>

        <nav className="nav">

          <a
            className="nav-item active"
            href="#"
          >
            Dashboard
          </a>

          <a
            className="nav-item"
            href="#"
          >
            My Fields
          </a>

          <a
            className="nav-item"
            href="#"
          >
            AI Detection
          </a>

          <a
            className="nav-item"
            href="#"
          >
            Alerts
          </a>

          <a
            className="nav-item"
            href="#"
          >
            Settings
          </a>

        </nav>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}
      <main className="main-content">

        {/* TOPBAR */}
        <header className="topbar">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              Welcome back to AgriShield-AI
            </p>

          </div>

          <button className="profile-button">
            Aman
          </button>

        </header>

        {/* =========================
            STATISTICS
        ========================= */}
        <section className="stats">

          <div className="stat-card">

            <span>
              Total Fields
            </span>

            <strong>
              {fields.length}
            </strong>

          </div>

          <div className="stat-card">

            <span>
              Healthy Crops
            </span>

            <strong>
              0
            </strong>

          </div>

          <div className="stat-card">

            <span>
              Active Alerts
            </span>

            <strong>
              0
            </strong>

          </div>

        </section>

        {/* =========================
            WELCOME CARD
        ========================= */}
        {!showForm && (
          <section className="welcome-card">

            <div>

              <h2>
                Protect your crops with AI
              </h2>

              <p>
                Monitor your fields, detect crop problems
                and make better agricultural decisions
                with AgriShield-AI.
              </p>

              <button
                className="primary-button"
                onClick={() => {
                  setEditingField(null)
                  setShowForm(true)
                }}
              >
                Add Your First Field
              </button>

            </div>

          </section>
        )}

        {/* =========================
            ADD / EDIT FORM
        ========================= */}
        {showForm && (
          <section className="field-form-card">

            <div className="section-header">

              <div>

                <h2>
                  {editingField
                    ? 'Edit Field'
                    : 'Add New Field'}
                </h2>

                <p>
                  {editingField
                    ? 'Update your field details below.'
                    : 'Enter your field details below.'}
                </p>

              </div>

              <button
                onClick={handleCancel}
              >
                Cancel
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="field-form"
            >

              {/* FIELD NAME */}
              <div className="form-group">

                <label>
                  Field Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. North Field"
                  required
                />

              </div>

              {/* LOCATION */}
              <div className="form-group">

                <label>
                  Location
                </label>

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Prayagraj"
                  required
                />

              </div>

              {/* CROP */}
              <div className="form-group">

                <label>
                  Crop
                </label>

                <input
                  type="text"
                  name="crop"
                  value={formData.crop}
                  onChange={handleChange}
                  placeholder="e.g. Wheat"
                  required
                />

              </div>

              {/* AREA */}
              <div className="form-group">

                <label>
                  Area (Acres)
                </label>

                <input
                  type="number"
                  name="area_acres"
                  value={formData.area_acres}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  min="0"
                  step="0.01"
                  required
                />

              </div>

              {/* SUBMIT */}
              <button
                className="primary-button"
                type="submit"
              >
                {editingField
                  ? 'Update Field'
                  : 'Save Field'}
              </button>

            </form>

          </section>
        )}

        {/* =========================
            RECENT FIELDS
        ========================= */}
        <section className="recent-section">

          <div className="section-header">

            <h2>
              Recent Fields
            </h2>

            <button>
              View All
            </button>

          </div>

          {/* NO FIELDS */}
          {fields.length === 0 ? (

            <div className="empty-state">

              <h3>
                No fields added yet
              </h3>

              <p>
                Add your first field to start
                monitoring your crops.
              </p>

            </div>

          ) : (

            /* FIELDS EXIST */
            <div className="fields-list">

              {fields.map((field) => (

                <div
                  className="field-card"
                  key={field.id}
                >

                  {/* FIELD DETAILS */}
                  <div>

                    <h3>
                      {field.name}
                    </h3>

                    <p>
                      {field.location}
                    </p>

                  </div>

                  {/* FIELD INFORMATION + ACTIONS */}
                  <div className="field-info">

                    <span>
                      {field.crop}
                    </span>

                    <span>
                      {field.area_acres} acres
                    </span>

                    {/* EDIT */}
                    <button
                      className="edit-button"
                      onClick={() =>
                        handleEdit(field)
                      }
                    >
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      className="delete-button"
                      onClick={() =>
                        handleDelete(field.id)
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </main>

    </div>
  )
}

export default App
```

FILE: frontend/src/index.css
```css
:root {
  --text: #6b6375;
  --text-h: #08060d;
  --bg: #fff;
  --border: #e5e4e7;
  --code-bg: #f4f3ec;
  --accent: #aa3bff;
  --accent-bg: rgba(170, 59, 255, 0.1);
  --accent-border: rgba(170, 59, 255, 0.5);
  --social-bg: rgba(244, 243, 236, 0.5);
  --shadow:
    rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

  --sans: system-ui, 'Segoe UI', Roboto, sans-serif;
  --heading: system-ui, 'Segoe UI', Roboto, sans-serif;
  --mono: ui-monospace, Consolas, monospace;

  font: 18px/145% var(--sans);
  letter-spacing: 0.18px;
  color-scheme: light dark;
  color: var(--text);
  background: var(--bg);
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #9ca3af;
    --text-h: #f3f4f6;
    --bg: #16171d;
    --border: #2e303a;
    --code-bg: #1f2028;
    --accent: #c084fc;
    --accent-bg: rgba(192, 132, 252, 0.15);
    --accent-border: rgba(192, 132, 252, 0.5);
    --social-bg: rgba(47, 48, 58, 0.5);
    --shadow:
      rgba(0, 0, 0, 0.4) 0 10px 15px -3px, rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
  }

  #social .button-icon {
    filter: invert(1) brightness(2);
  }
}

body {
  margin: 0;
}

#root {
  width: 1126px;
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  border-inline: 1px solid var(--border);
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

h1,
h2 {
  font-family: var(--heading);
  font-weight: 500;
  color: var(--text-h);
}

h1 {
  font-size: 56px;
  letter-spacing: -1.68px;
  margin: 32px 0;
  @media (max-width: 1024px) {
    font-size: 36px;
    margin: 20px 0;
  }
}
h2 {
  font-size: 24px;
  line-height: 118%;
  letter-spacing: -0.24px;
  margin: 0 0 8px;
  @media (max-width: 1024px) {
    font-size: 20px;
  }
}
p {
  margin: 0;
}

code,
.counter {
  font-family: var(--mono);
  display: inline-flex;
  border-radius: 4px;
  color: var(--text-h);
}

code {
  font-size: 15px;
  line-height: 135%;
  padding: 4px 8px;
  background: var(--code-bg);
}
```

FILE: frontend/src/main.jsx
```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

FILE: frontend/vite.config.js
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

4. DATABASE FILES

FILE: database/schema.sql
```sql
CREATE TABLE IF NOT EXISTS fields (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    crop VARCHAR(100) NOT NULL,
    area_acres DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

5. PROJECT CONFIGURATION

FILE: .gitignore
```gitignore
# Python virtual environments
.venv/
venv/
env/

# Python cache
__pycache__/
*.py[cod]

# Node.js
node_modules/

# Environment variables
.env
.env.*

# IDE settings
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db
```

FILE: .env
```env
DB_HOST=<REDACTED>
DB_USER=<REDACTED>
DB_PASSWORD=<REDACTED>
DB_NAME=<REDACTED>
```

FILE: requirements.txt
```txt
annotated-doc==0.0.5
annotated-types==0.8.0
anyio==4.14.2
click==8.4.2
colorama==0.4.6
fastapi==0.141.1
h11==0.16.0
idna==3.18
mysql-connector-python==26.7.0
pydantic==2.13.4
pydantic_core==2.46.4
python-dotenv==1.2.2
starlette==0.16.0
typing-inspection==0.4.4
typing_extensions==4.16.0
uvicorn==0.52.3
```

FILE: README.md
```md
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
```

# 🌾 AgriShield AI

### Multimodal Early Disease & Pest Risk Forecast Platform

> **Predict early. Act early. Protect crops. 🌱**

AgriShield AI is an AI-powered agricultural early-warning platform designed to help farmers and agricultural officers identify **increasing disease and pest risk before major crop damage occurs**.

Instead of waiting for visible symptoms, AgriShield AI combines multiple sources of agricultural information — **weather conditions, satellite-derived crop health indicators, and field-level IoT data** — to estimate disease and pest risk and provide actionable early warnings.

---

## 🎯 The Problem

Crop diseases and pest attacks are often identified only after visible symptoms appear.

By that time:

* 🌱 Crop damage may already have started
* 💰 Farmers may face economic losses
* 🧪 Excessive pesticide use may occur
* 👨‍🌾 Early intervention becomes more difficult
* 🏞️ Agricultural officers cannot manually inspect every field

AgriShield AI aims to move agriculture from **late detection to early warning**.

---

## 💡 Our Solution

AgriShield AI combines multiple data sources:

```text
        🌦️ Weather Data
              +
        🛰️ Satellite Data
              +
        🌡️ IoT Field Data
              ↓
        Data Processing
              ↓
        🧠 Risk Engine
              ↓
     Disease / Pest Risk
              ↓
       ⚠️ Early Warning
              ↓
    ┌──────────┴──────────┐
    ↓                     ↓
 👨‍🌾 Farmer            🧑‍💼 Officer
 Dashboard              Dashboard
```

The system estimates risk as:

🟢 **Low Risk**

🟡 **Moderate Risk**

🔴 **High Risk**

and provides recommendations for timely field inspection and preventive action.

---

## 🚀 Key Features

### 🌡️ IoT Field Monitoring

Monitor field-level environmental conditions such as:

* Temperature
* Humidity
* Soil Moisture
* Leaf Wetness *(future hardware integration)*

The current prototype uses a **simulated IoT data layer**, which will later be replaced by real ESP32-based hardware.

### 🌦️ Weather Intelligence

Weather information can be used to identify environmental conditions that may favor disease and pest development.

### 🛰️ Satellite-Based Crop Health

Satellite-derived vegetation indicators such as:

* NDVI
* EVI

can help identify changes in crop health and vegetation stress.

### 🧠 AI-Based Risk Prediction

The platform combines multiple factors to estimate:

* Disease risk
* Pest risk
* Risk level
* Contributing environmental factors

The initial prototype uses a transparent risk-scoring approach, with trained machine-learning models planned for later versions.

### 🗺️ Disease Risk Map

Agricultural officers can view risk across different areas:

```text
🟢 Low Risk
🟡 Moderate Risk
🔴 High Risk
```

This can help prioritize field inspections.

### 🔔 Early Alerts

Farmers can receive warnings when environmental and crop-health indicators suggest increasing risk.

### 📱 Farmer Dashboard

Designed to present complex agricultural information in a simple and actionable way.

---

# 🏗️ System Architecture

```text
                          AGRISHIELD AI
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
         🌦️ Weather       🛰️ Satellite       🌡️ IoT
            API             NDVI/EVI         Simulator
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                        ⚙️ FastAPI Backend
                               │
                        Data Processing
                               │
                     🧠 Risk Prediction Engine
                               │
                     ┌─────────┴─────────┐
                     ↓                   ↓
               👨‍🌾 Farmer          🧑‍💼 Officer
                Dashboard             Dashboard
```

### Future Hardware Architecture

```text
🌱 Agricultural Field
        ↓
   Sensors
        ↓
      ESP32
        ↓
      Wi-Fi
        ↓
    FastAPI Backend
        ↓
   Risk Prediction
```

The software is being designed so that the current simulated IoT layer can later be replaced with real ESP32 hardware without redesigning the complete system.

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Uvicorn

### Database

* MySQL

### AI / Machine Learning

* Python
* NumPy
* Pandas
* Scikit-learn
* XGBoost *(planned)*

### IoT

* ESP32 *(future hardware)*
* BME280
* Soil Moisture Sensor
* Leaf Wetness Sensor *(optional)*

### GIS / Satellite

* Sentinel-2
* NDVI / EVI
* Leaflet
* OpenStreetMap
* Google Earth Engine *(planned)*

### External Data

* Weather APIs
* Satellite APIs / Earth observation services

---

# 📂 Project Structure

```text
AgriShield-AI/
│
├── frontend/          # React frontend
│
├── backend/           # FastAPI backend
│
├── ml/                # Machine learning & risk engine
│
├── iot/               # IoT simulator & future ESP32 integration
│
├── satellite/         # Satellite & NDVI/EVI processing
│
├── data/              # Datasets and sample data
│
├── docs/              # Documentation
│
└── README.md
```

---

# 🔄 Development Roadmap

### Phase 1 — Foundation

* [x] GitHub repository
* [x] Team collaboration setup
* [x] Python environment
* [x] FastAPI backend setup
* [ ] React frontend setup

### Phase 2 — Core Backend

* [ ] API architecture
* [ ] MySQL integration
* [ ] Field management
* [ ] Sensor data APIs
* [ ] Weather data APIs

### Phase 3 — IoT

* [ ] Simulated sensor data
* [ ] ESP32 integration
* [ ] Temperature monitoring
* [ ] Humidity monitoring
* [ ] Soil moisture monitoring

### Phase 4 — Satellite & GIS

* [ ] Satellite data integration
* [ ] NDVI calculation
* [ ] Crop-health visualization
* [ ] Interactive risk map

### Phase 5 — AI / Risk Engine

* [ ] Initial rule-based risk engine
* [ ] Dataset preparation
* [ ] ML model
* [ ] Disease risk prediction
* [ ] Pest risk prediction

### Phase 6 — User Applications

* [ ] Farmer dashboard
* [ ] Officer dashboard
* [ ] Alerts
* [ ] Recommendations
* [ ] Final system integration

### Phase 7 — Real-World Prototype

* [ ] Hardware deployment
* [ ] Field testing
* [ ] Model validation
* [ ] Performance evaluation

---

# 👨‍💻 Team AgriShield

### Team Members

| Member     | Role                              |
| ---------- | --------------------------------- |
| **Aman**   | IoT & Data Integration            |
| **Aditya** | AI / Machine Learning             |
| **Alice**  | Satellite / GIS                   |
| **Ajay**   | Backend Development               |
| **Ayushi** | Frontend Development              |
| **Aastha** | Agriculture Research & Validation |

> **Six minds. One mission. Smarter agriculture. 🌾**

---

# 🌱 Our Vision

We envision a future where farmers don't have to wait until crop diseases become visible before taking action.

AgriShield AI aims to transform agricultural monitoring from:

```text
Detect Damage
      ↓
React
```

to:

```text
Monitor
   ↓
Predict Risk
   ↓
Warn Early
   ↓
Act
   ↓
Protect Crops
```

---

# ⚠️ Current Prototype Status

AgriShield AI is currently under active development as a **Smart India Hackathon prototype**.

The initial software prototype uses simulated IoT data where physical hardware is not yet available.

Predictions in the early prototype should be treated as **risk estimates, not guaranteed disease diagnoses**.

Future versions will incorporate real sensor data, validated agricultural datasets, satellite observations, and trained machine-learning models.

---

## 🤝 Contributing

This project is currently being developed by the AgriShield AI team for Smart India Hackathon.

Team members should work through feature branches and merge completed work into the main branch after review.

---

## 📜 License

This project is currently intended for educational, research, and Smart India Hackathon development purposes.

---

### 🌾 AgriShield AI

**Predict Early. Act Early. Protect Agriculture.**
```

FILE: Setup.md
```md
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
```

# 🌾 AgriShield AI

### Multimodal Early Disease & Pest Risk Forecast Platform

> **Predict early. Act early. Protect crops. 🌱**

AgriShield AI is an AI-powered agricultural early-warning platform designed to help farmers and agricultural officers identify **increasing disease and pest risk before major crop damage occurs**.

Instead of waiting for visible symptoms, AgriShield AI combines multiple sources of agricultural information — **weather conditions, satellite-derived crop health indicators, and field-level IoT data** — to estimate disease and pest risk and provide actionable early warnings.

---

## 🎯 The Problem

Crop diseases and pest attacks are often identified only after visible symptoms appear.

By that time:

* 🌱 Crop damage may already have started
* 💰 Farmers may face economic losses
* 🧪 Excessive pesticide use may occur
* 👨‍🌾 Early intervention becomes more difficult
* 🏞️ Agricultural officers cannot manually inspect every field

AgriShield AI aims to move agriculture from **late detection to early warning**.

---

## 💡 Our Solution

AgriShield AI combines multiple data sources:

```text
        🌦️ Weather Data
              +
        🛰️ Satellite Data
              +
        🌡️ IoT Field Data
              ↓
        Data Processing
              ↓
        🧠 Risk Engine
              ↓
     Disease / Pest Risk
              ↓
       ⚠️ Early Warning
              ↓
    ┌──────────┴──────────┐
    ↓                     ↓
 👨‍🌾 Farmer            🧑‍💼 Officer
 Dashboard              Dashboard
```

The system estimates risk as:

🟢 **Low Risk**

🟡 **Moderate Risk**

🔴 **High Risk**

and provides recommendations for timely field inspection and preventive action.

---

## 🚀 Key Features

### 🌡️ IoT Field Monitoring

Monitor field-level environmental conditions such as:

* Temperature
* Humidity
* Soil Moisture
* Leaf Wetness *(future hardware integration)*

The current prototype uses a **simulated IoT data layer**, which will later be replaced by real ESP32-based hardware.

### 🌦️ Weather Intelligence

Weather information can be used to identify environmental conditions that may favor disease and pest development.

### 🛰️ Satellite-Based Crop Health

Satellite-derived vegetation indicators such as:

* NDVI
* EVI

can help identify changes in crop health and vegetation stress.

### 🧠 AI-Based Risk Prediction

The platform combines multiple factors to estimate:

* Disease risk
* Pest risk
* Risk level
* Contributing environmental factors

The initial prototype uses a transparent risk-scoring approach, with trained machine-learning models planned for later versions.

### 🗺️ Disease Risk Map

Agricultural officers can view risk across different areas:

```text
🟢 Low Risk
🟡 Moderate Risk
🔴 High Risk
```

This can help prioritize field inspections.

### 🔔 Early Alerts

Farmers can receive warnings when environmental and crop-health indicators suggest increasing risk.

### 📱 Farmer Dashboard

Designed to present complex agricultural information in a simple and actionable way.

---

# 🏗️ System Architecture

```text
                          AGRISHIELD AI
                               │
              ┌────────────────┼────────────────┐
              ↓                ↓                ↓
         🌦️ Weather       🛰️ Satellite       🌡️ IoT
            API             NDVI/EVI         Simulator
              │                │                │
              └────────────────┼────────────────┘
                               ↓
                        ⚙️ FastAPI Backend
                               │
                        Data Processing
                               │
                     🧠 Risk Prediction Engine
                               │
                     ┌─────────┴─────────┐
                     ↓                   ↓
               👨‍🌾 Farmer          🧑‍💼 Officer
                Dashboard             Dashboard
```

### Future Hardware Architecture

```text
🌱 Agricultural Field
        ↓
   Sensors
        ↓
      ESP32
        ↓
      Wi-Fi
        ↓
    FastAPI Backend
        ↓
   Risk Prediction
```

The software is being designed so that the current simulated IoT layer can later be replaced with real ESP32 hardware without redesigning the complete system.

---

# 🛠️ Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### Backend

* Python
* FastAPI
* Uvicorn

### Database

* MySQL

### AI / Machine Learning

* Python
* NumPy
* Pandas
* Scikit-learn
* XGBoost *(planned)*

### IoT

* ESP32 *(future hardware)*
* BME280
* Soil Moisture Sensor
* Leaf Wetness Sensor *(optional)*

### GIS / Satellite

* Sentinel-2
* NDVI / EVI
* Leaflet
* OpenStreetMap
* Google Earth Engine *(planned)*

### External Data

* Weather APIs
* Satellite APIs / Earth observation services

---

# 📂 Project Structure

```text
AgriShield-AI/
│
├── frontend/          # React frontend
│
├── backend/           # FastAPI backend
│
├── ml/                # Machine learning & risk engine
│
├── iot/               # IoT simulator & future ESP32 integration
│
├── satellite/         # Satellite & NDVI/EVI processing
│
├── data/              # Datasets and sample data
│
├── docs/              # Documentation
│
└── README.md
```

---

# 🔄 Development Roadmap

### Phase 1 — Foundation

* [x] GitHub repository
* [x] Team collaboration setup
* [x] Python environment
* [x] FastAPI backend setup
* [ ] React frontend setup

### Phase 2 — Core Backend

* [ ] API architecture
* [ ] MySQL integration
* [ ] Field management
* [ ] Sensor data APIs
* [ ] Weather data APIs

### Phase 3 — IoT

* [ ] Simulated sensor data
* [ ] ESP32 integration
* [ ] Temperature monitoring
* [ ] Humidity monitoring
* [ ] Soil moisture monitoring

### Phase 4 — Satellite & GIS

* [ ] Satellite data integration
* [ ] NDVI calculation
* [ ] Crop-health visualization
* [ ] Interactive risk map

### Phase 5 — AI / Risk Engine

* [ ] Initial rule-based risk engine
* [ ] Dataset preparation
* [ ] ML model
* [ ] Disease risk prediction
* [ ] Pest risk prediction

### Phase 6 — User Applications

* [ ] Farmer dashboard
* [ ] Officer dashboard
* [ ] Alerts
* [ ] Recommendations
* [ ] Final system integration

### Phase 7 — Real-World Prototype

* [ ] Hardware deployment
* [ ] Field testing
* [ ] Model validation
* [ ] Performance evaluation

---

# 👨‍💻 Team AgriShield

### Team Members

| Member     | Role                              |
| ---------- | --------------------------------- |
| **Aman**   | IoT & Data Integration            |
| **Aditya** | AI / Machine Learning             |
| **Alice**  | Satellite / GIS                   |
| **Ajay**   | Backend Development               |
| **Ayushi** | Frontend Development              |
| **Aastha** | Agriculture Research & Validation |

> **Six minds. One mission. Smarter agriculture. 🌾**

---

# 🌱 Our Vision

We envision a future where farmers don't have to wait until crop diseases become visible before taking action.

AgriShield AI aims to transform agricultural monitoring from:

```text
Detect Damage
      ↓
React
```

to:

```text
Monitor
   ↓
Predict Risk
   ↓
Warn Early
   ↓
Act
   ↓
Protect Crops
```

---

# ⚠️ Current Prototype Status

AgriShield AI is currently under active development as a **Smart India Hackathon prototype**.

The initial software prototype uses simulated IoT data where physical hardware is not yet available.

Predictions in the early prototype should be treated as **risk estimates, not guaranteed disease diagnoses**.

Future versions will incorporate real sensor data, validated agricultural datasets, satellite observations, and trained machine-learning models.

---

## 🤝 Contributing

This project is currently being developed by the AgriShield AI team for Smart India Hackathon.

Team members should work through feature branches and merge completed work into the main branch after review.

---

## 📜 License

This project is currently intended for educational, research, and Smart India Hackathon development purposes.

---

### 🌾 AgriShield AI

**Predict Early. Act Early. Protect Agriculture.**
```

6. API INVENTORY (Current)

- GET / — root endpoint; returns backend running message.
- GET /api/health — health check; returns status and project name.
- POST /api/fields — create a field record from name, location, crop, and area_acres.
- GET /api/fields — list all field records in id order.
- GET /api/fields/{field_id} — fetch a single field by id; currently the endpoint queries the DB but the implementation in backend/main.py does not return the fetched record (needs a fix to return the `field` object). If the field is not found it raises 404.
- DELETE /api/fields/{field_id} — delete a field by id; returns 404 if missing.
- PUT /api/fields/{field_id} — update a field by id; returns 404 if missing and then returns the updated record.

7. DATABASE INVENTORY (Current)

- table: fields
  - columns:
    - id INT AUTO_INCREMENT PRIMARY KEY
    - name VARCHAR(100) NOT NULL
    - location VARCHAR(255) NOT NULL
    - crop VARCHAR(100) NOT NULL
    - area_acres DECIMAL(10, 2) NOT NULL
    - created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  - primary key:
    - id

8. FRONTEND-BACKEND CONNECTIONS (Current)

- GET http://127.0.0.1:8000/api/fields
  - purpose: fetch all field records for the dashboard list

- POST http://127.0.0.1:8000/api/fields
  - purpose: create a new field from the form submission

- PUT http://127.0.0.1:8000/api/fields/{editingField.id}
  - purpose: update an existing field after editing

- DELETE http://127.0.0.1:8000/api/fields/{fieldId}
  - purpose: delete a field from the interface


9. DOCUMENT UPDATE LOG

- Document: progress-report-17-august.md
- Updated: 2026-08-19T22:35:06+05:30
- Summary of change: appended clarifying notes to the API inventory (noting a missing return in GET /api/fields/{field_id}), and added the "Outstanding work" list below to track next development priorities.

10. OUTSTANDING WORK / PRIORITIZED NEXT ITEMS

The following items are not implemented in the current codebase and are recommended next work items. They are ordered roughly by priority for the next development iterations.

Priority: High
- Fix GET /api/fields/{field_id} to return the fetched record (backend/main.py currently fetches the field but does not return it).
- Add input validation and error responses for all backend endpoints (consistent response format, validation errors).
- Implement database migrations (e.g., using a migration tool) and schema versioning instead of ad-hoc SQL files.
- Add connection pooling or reuse for database connections (avoid opening/closing per request where appropriate).
- Secrets management: remove plaintext secrets in .env from repositories and integrate a secure secrets workflow for deployment.
- Add automated tests: unit tests for backend endpoints and integration tests for DB interactions.
- Add server-side logging and structured error logging.

Priority: Medium
- Add authentication & authorization (e.g., user accounts, token-based auth) for protecting API endpoints and multi-user support.
- Implement pagination, filtering and sorting for GET /api/fields on the backend and update frontend to support them.
- Improve frontend UX: loading states, error handling, form validation, and responsive behavior across devices.
- Add frontend routing (React Router) and separate pages for Dashboard, Fields, AI Detection, Alerts, and Settings.
- Implement API rate limiting and basic security hardening (e.g., input sanitization, CORS policy updates for production domains).
- Add CI pipeline (lint, test, build) and automated deployment pipeline.

Priority: Low / Future
- Containerize backend and frontend (Dockerfiles, docker-compose) for local development and consistent deployments.
- Add HTTPS and production-ready configuration (reverse proxy, environment-specific settings).
- Implement ML/data pipeline: dataset layout, training scripts, model versioning, and integration points for risk prediction.
- Implement IoT simulator and device ingestion APIs (sensor data endpoints, ingestion queue).
- Satellite / GIS integration: NDVI/EVI processing, map visualization on frontend (e.g., Leaflet), tiling and geo-indexing.
- Alerts system & notification channels (email/SMS/push) and alert scheduling logic.
- Accessibility improvements and localization support for frontend UI.

11. RECOMMENDED SHORT-TERM SPRINT (example)

Sprint goal: stabilize backend and get test coverage to safely extend features.
- Fix GET /api/fields/{field_id} bug and add unit tests for all CRUD endpoints.
- Add input validation and consistent error responses (Pydantic + FastAPI exception handlers).
- Implement DB migrations and add a staging database script.
- Add simple CI to run tests on each push.

---

End of updated report.
