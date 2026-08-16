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