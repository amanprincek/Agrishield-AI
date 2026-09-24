import { useState, useEffect, useCallback } from 'react';
import './App.css';
import {
  Sprout,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Layers,
  Compass,
  User,
  Maximize2,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Radio,
  LogOut,
  Send,
  CloudSun,
} from 'lucide-react';

const EMPTY_FORM = {
  farmer_name: 'Aman Kumar',
  name: '',
  location: '',
  latitude: '25.435800',
  longitude: '81.846300',
  crop: 'Wheat',
  area_acres: '4.5',
};

const API_BASE = '/api';

export default function App() {
  // =========================
  // Notification system
  // =========================
  const [notification, setNotification] = useState(null);

  const notify = useCallback((message, type = 'info') => {
    setNotification({ message, type });
    window.setTimeout(() => setNotification(null), 4000);
  }, []);

  // =========================
  // Authentication
  // =========================
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem('agrishield_farmer') || 'Aman Kumar';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('agrishield_logged_in') === 'true';
  });

  const [loginForm, setLoginForm] = useState({
    farmer_name: 'Aman Kumar',
    email: 'aman@agrishield.ai',
    password: 'password123',
  });

  // =========================
  // Fields
  // =========================
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [savingField, setSavingField] = useState(false);
  const [deletingFieldId, setDeletingFieldId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // =========================
  // Analysis
  // =========================
  const [analyzingField, setAnalyzingField] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // =========================
  // IoT Demo
  // =========================
  const [showIoTTester, setShowIoTTester] = useState(false);

  const [iotPayload, setIotPayload] = useState({
    temperature: '31.5',
    humidity: '78.0',
    soil_moisture: '22.0',
  });

  // =========================
  // API Helper (memoized for exhaustive-deps)
  // =========================
  const apiRequest = useCallback(async (url, options = {}) => {
    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    let data;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const detail =
        data?.detail ||
        data?.message ||
        `Request failed with status ${response.status}`;

      throw new Error(detail);
    }

    return data;
  }, []);

  // =========================
  // Fetch Fields (memoized)
  // =========================
  const fetchFields = useCallback(async () => {
    setLoading(true);

    try {
      const data = await apiRequest('/fields');
      setFields(Array.isArray(data) ? data : []);
    } catch (error) {
      notify(`Unable to load fields: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [apiRequest, notify]);

  // Initial load when logged in — async pattern avoids setState-in-effect lint
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    let active = true;

    const load = async () => {
      if (!active) return;
      await fetchFields();
    };

    load();

    return () => {
      active = false;
    };
  }, [isLoggedIn, fetchFields]);

  // =========================
  // Login (hardened demo auth)
  // =========================
  const handleLogin = (e) => {
    e.preventDefault();

    const name = loginForm.farmer_name.trim();
    const email = loginForm.email.trim();
    const password = loginForm.password.trim();

    if (name.length < 2) {
      notify('Please enter a valid farmer name (at least 2 characters).', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      notify('Please enter a valid email address.', 'error');
      return;
    }

    if (password.length < 4) {
      notify('Please enter a password (at least 4 characters). This is demo authentication.', 'error');
      return;
    }

    setCurrentUser(name);
    setIsLoggedIn(true);

    localStorage.setItem('agrishield_farmer', name);
    localStorage.setItem('agrishield_logged_in', 'true');
    notify(`Welcome, ${name}!`, 'success');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAnalysisResult(null);
    setAnalyzingField(null);
    setCurrentUser('Aman Kumar');

    localStorage.removeItem('agrishield_logged_in');
    localStorage.removeItem('agrishield_farmer');
    notify('Logged out. Demo session cleared.', 'info');
  };

  const selectQuickProfile = (name) => {
    setLoginForm({
      farmer_name: name,
      email: `${name.toLowerCase().replace(/\s+/g, '')}@agrishield.ai`,
      password: 'password123',
    });
  };

  // =========================
  // Add Field
  // =========================
  const handleOpenAddModal = () => {
    setEditingField(null);

    setFormData({
      farmer_name: currentUser,
      name: '',
      location: 'Kanpur, Uttar Pradesh',
      latitude: '26.449900',
      longitude: '80.331900',
      crop: 'Wheat',
      area_acres: '5.0',
    });

    setShowModal(true);
  };

  // =========================
  // Edit Field
  // =========================
  const handleOpenEditModal = (field) => {
    setEditingField(field);

    setFormData({
      farmer_name: field.farmer_name || currentUser,
      name: field.name || '',
      location: field.location || '',
      latitude:
        field.latitude !== null && field.latitude !== undefined
          ? String(field.latitude)
          : '25.435800',
      longitude:
        field.longitude !== null && field.longitude !== undefined
          ? String(field.longitude)
          : '81.846300',
      crop: field.crop || 'Wheat',
      area_acres:
        field.area_acres !== null && field.area_acres !== undefined
          ? String(field.area_acres)
          : '0',
    });

    setShowModal(true);
  };

  // =========================
  // Delete Field
  // =========================
  const handleDeleteField = async (fieldId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this field record?'
    );

    if (!confirmed) {
      return;
    }

    setDeletingFieldId(fieldId);

    try {
      await apiRequest(`/fields/${fieldId}`, {
        method: 'DELETE',
      });

      setFields((previousFields) =>
        previousFields.filter((field) => field.id !== fieldId)
      );

      if (analysisResult?.field_id === fieldId) {
        setAnalysisResult(null);
        setAnalyzingField(null);
      }

      notify('Field deleted successfully.', 'success');
    } catch (error) {
      notify(`Failed to delete field: ${error.message}`, 'error');
    } finally {
      setDeletingFieldId(null);
    }
  };

  // =========================
  // Create / Update Field
  // =========================
  const handleSubmitField = async (e) => {
    e.preventDefault();

    const latitude = Number.parseFloat(formData.latitude);
    const longitude = Number.parseFloat(formData.longitude);
    const areaAcres = Number.parseFloat(formData.area_acres);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      !Number.isFinite(areaAcres)
    ) {
      notify('Please enter valid latitude, longitude and area values.', 'error');
      return;
    }

    const payload = {
      farmer_name: formData.farmer_name.trim() || currentUser,
      name: formData.name.trim(),
      location: formData.location.trim(),
      latitude,
      longitude,
      crop: formData.crop,
      area_acres: areaAcres,
    };

    if (!payload.name || !payload.location) {
      notify('Please fill in Field Name and Location.', 'error');
      return;
    }

    setSavingField(true);

    try {
      if (editingField) {
        const updated = await apiRequest(
          `/fields/${editingField.id}`,
          {
            method: 'PUT',
            body: JSON.stringify(payload),
          }
        );

        setFields((previousFields) =>
          previousFields.map((field) =>
            field.id === updated.id ? updated : field
          )
        );

        if (analyzingField?.id === updated.id) {
          setAnalyzingField(updated);
        }

        setShowModal(false);
        setEditingField(null);

        notify('Field updated successfully.', 'success');
      } else {
        const created = await apiRequest('/fields', {
          method: 'POST',
          body: JSON.stringify(payload),
        });

        setFields((previousFields) => [created, ...previousFields]);

        setShowModal(false);

        notify('Field registered successfully.', 'success');
      }
    } catch (error) {
      notify(`Failed to save field: ${error.message}`, 'error');
    } finally {
      setSavingField(false);
    }
  };

  // =========================
  // Analyze Field
  // =========================
  const handleAnalyzeField = async (field) => {
    setAnalyzingField(field);
    setAnalysisLoading(true);
    setAnalysisResult(null);
    setShowIoTTester(false);

    try {
      const data = await apiRequest(`/prediction/${field.id}`, {
        method: 'POST',
      });

      setAnalysisResult(data);
    } catch (error) {
      notify(`Unable to analyze field: ${error.message}`, 'error');
      setAnalysisResult(null);
    } finally {
      setAnalysisLoading(false);
    }
  };

  // =========================
  // IoT Telemetry
  // =========================
  const handleSendIotAndReanalyze = async (e) => {
    e.preventDefault();

    if (!analyzingField) {
      return;
    }

    const temperature = Number.parseFloat(iotPayload.temperature);
    const humidity = Number.parseFloat(iotPayload.humidity);
    const soilMoisture = Number.parseFloat(iotPayload.soil_moisture);

    if (
      !Number.isFinite(temperature) ||
      !Number.isFinite(humidity) ||
      !Number.isFinite(soilMoisture)
    ) {
      notify('Please enter valid IoT sensor values.', 'error');
      return;
    }

    try {
      await apiRequest('/iot/data', {
        method: 'POST',
        body: JSON.stringify({
          field_id: analyzingField.id,
          temperature,
          humidity,
          soil_moisture: soilMoisture,
        }),
      });

      notify('ESP32 telemetry recorded.', 'success');
      await handleAnalyzeField(analyzingField);
    } catch (error) {
      notify(`Failed to submit IoT telemetry: ${error.message}`, 'error');
    }
  };

  // =========================
  // Login Screen
  // =========================
  if (!isLoggedIn) {
    return (
      <div className="auth-container" id="auth_container">
        {notification && (
          <div className={`toast toast-${notification.type}`} role="status">
            {notification.message}
          </div>
        )}
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-icon">🌾</div>

            <h2>AgriShield AI</h2>

            <p>Smart India Hackathon • Farmer Portal Login</p>
            <p style={{ fontSize: 11, color: '#64748b', marginTop: 6 }}>
              Demo authentication — no password verification
            </p>
          </div>

          <form onSubmit={handleLogin} noValidate>
            <div className="form-group">
              <label>Farmer Name</label>

              <input
                type="text"
                id="login_farmer_name"
                required
                value={loginForm.farmer_name}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    farmer_name: e.target.value,
                  })
                }
                placeholder="e.g. Ramesh Kumar"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>

              <input
                type="email"
                id="login_email"
                required
                value={loginForm.email}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    email: e.target.value,
                  })
                }
                placeholder="farmer@agrishield.ai"
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                id="login_password"
                required
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm({
                    ...loginForm,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              id="btn_login_submit"
              style={{
                width: '100%',
                justifyContent: 'center',
                marginTop: 12,
              }}
            >
              Enter Farmer Dashboard
            </button>
          </form>

          <div className="quick-profiles">
            <p>Demo Farmer Profiles (SIH Presentation):</p>

            <div className="profile-chips">
              <button
                type="button"
                className="profile-chip"
                onClick={() => selectQuickProfile('Aman Kumar')}
              >
                Aman Kumar (Prayagraj)
              </button>

              <button
                type="button"
                className="profile-chip"
                onClick={() => selectQuickProfile('Ramesh Singh')}
              >
                Ramesh Singh (Lucknow)
              </button>

              <button
                type="button"
                className="profile-chip"
                onClick={() => selectQuickProfile('Suresh Patel')}
              >
                Suresh Patel (Kanpur)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalAcres = fields.reduce(
    (total, field) => total + Number(field.area_acres || 0),
    0
  );

  const cropCount = Array.from(
    new Set(fields.map((field) => field.crop).filter(Boolean))
  ).length;

  return (
    <div className="app-container" id="app_root">
      {notification && (
        <div className={`toast toast-${notification.type}`} role="status">
          {notification.message}
        </div>
      )}
      {/* =========================
          Sidebar
      ========================= */}
      <aside className="sidebar" id="app_sidebar">
        <div className="logo-section">
          <div className="logo-icon">🌱</div>

          <div className="logo-text">
            <h1>AgriShield AI</h1>
            <p>Smart India Hackathon</p>
          </div>
        </div>

        <nav className="nav-links">
          <button className="nav-item active" id="nav_fields">
            <Layers size={18} />
            <span>Field Management</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <button
            className="nav-item"
            id="btn_logout"
            onClick={handleLogout}
          >
            <LogOut size={16} />
            <span>Switch Farmer / Logout</span>
          </button>
        </div>
      </aside>

      {/* =========================
          Main Dashboard
      ========================= */}
      <main className="main-content" id="app_main">
        <header className="top-bar">
          <div className="top-bar-title">
            <h2>Agricultural Field Dashboard</h2>

            <p>End-to-End AI Crop Risk Prediction & Environmental Intelligence</p>
          </div>

          <div className="user-control">
            <div className="user-badge" id="user_badge">
              <User size={16} />
              <span>Farmer: {currentUser}</span>
            </div>
          </div>
        </header>

        {/* =========================
            Statistics
        ========================= */}
        <div className="stats-grid">
          <div className="stat-card" id="stat_total_fields">
            <div className="stat-title">Registered Fields</div>
            <div className="stat-value">{fields.length}</div>
          </div>

          <div className="stat-card" id="stat_total_acres">
            <div className="stat-title">Total Cultivated Area</div>
            <div className="stat-value">{totalAcres.toFixed(1)} Acres</div>
          </div>

          <div className="stat-card" id="stat_crops_cultivated">
            <div className="stat-title">Crop Varieties</div>
            <div className="stat-value">{cropCount}</div>
          </div>
        </div>

        {/* =========================
            Field Header
        ========================= */}
        <div className="section-header">
          <h3>My Agricultural Fields ({fields.length})</h3>

          <button
            className="btn-primary"
            id="btn_add_field"
            onClick={handleOpenAddModal}
          >
            <Plus size={16} />
            <span>Register Field</span>
          </button>
        </div>

        {/* =========================
            Field List
        ========================= */}
        {loading ? (
          <p>Loading agricultural plots...</p>
        ) : fields.length === 0 ? (
          <div
            className="field-card"
            style={{
              textAlign: 'center',
              padding: 40,
            }}
          >
            <p>No fields registered yet. Click &apos;Register Field&apos; above to register your first agricultural plot.</p>
            <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
              Your fields will appear here once you add them.
            </p>
          </div>
        ) : (
          <div className="fields-grid" id="fields_grid">
            {fields.map((field) => (
              <div
                className="field-card"
                key={field.id}
                id={`field_card_${field.id}`}
              >
                <div className="field-card-header">
                  <span className="field-name">{field.name}</span>

                  <span className="crop-badge">{field.crop}</span>
                </div>

                <div className="field-detail-row">
                  <User size={15} />

                  <span>Farmer: {field.farmer_name || currentUser}</span>
                </div>

                <div className="field-detail-row">
                  <MapPin size={15} />

                  <span>{field.location}</span>
                </div>

                <div className="field-detail-row">
                  <Maximize2 size={15} />

                  <span>Area: {field.area_acres} Acres</span>
                </div>

                <div className="field-coords">
                  <Compass
                    size={13}
                    style={{
                      display: 'inline',
                      marginRight: 4,
                      verticalAlign: 'middle',
                    }}
                  />
                  {field.latitude}° N, {field.longitude}° E
                </div>

                <button
                  className="btn-analyze"
                  id={`btn_analyze_${field.id}`}
                  onClick={() => handleAnalyzeField(field)}
                >
                  <Activity size={15} />
                  <span>Analyze Field</span>
                </button>

                <div className="field-actions">
                  <button
                    type="button"
                    className="btn-outline"
                    id={`btn_edit_${field.id}`}
                    onClick={() => handleOpenEditModal(field)}
                    disabled={deletingFieldId === field.id}
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  <button
                    type="button"
                    className="btn-outline btn-delete"
                    id={`btn_delete_${field.id}`}
                    onClick={() => handleDeleteField(field.id)}
                    disabled={deletingFieldId === field.id}
                  >
                    <Trash2 size={14} />

                    {deletingFieldId === field.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* =========================
          Add / Edit Modal
      ========================= */}
      {showModal && (
        <div className="modal-overlay" id="field_modal">
          <div className="modal-card">
            <div className="modal-header">
              <h4>{editingField ? 'Edit Field Record' : 'Register Agricultural Field'}</h4>

              <button
                type="button"
                className="btn-outline"
                style={{
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  flex: 'none',
                }}
                onClick={() => {
                  if (!savingField) {
                    setShowModal(false);
                  }
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitField} noValidate>
              <div className="form-group">
                <label>Farmer Name</label>

                <input
                  type="text"
                  required
                  value={formData.farmer_name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      farmer_name: e.target.value,
                    })
                  }
                  placeholder="e.g. Ramesh Kumar"
                />
              </div>

              <div className="form-group">
                <label>Field Name</label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. North Canal Plot"
                />
              </div>

              <div className="form-group">
                <label>Location / District</label>

                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. Kanpur, Uttar Pradesh"
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Latitude (°N)</label>

                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: e.target.value,
                      })
                    }
                    placeholder="26.449900"
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Longitude (°E)</label>

                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: e.target.value,
                      })
                    }
                    placeholder="80.331900"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Crop Cultivated</label>

                  <select
                    value={formData.crop}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        crop: e.target.value,
                      })
                    }
                  >
                    <option value="Wheat">Wheat</option>
                    <option value="Rice / Paddy">Rice / Paddy</option>
                    <option value="Mustard">Mustard</option>
                    <option value="Maize">Maize</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label>Area (Acres)</label>

                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={formData.area_acres}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        area_acres: e.target.value,
                      })
                    }
                    placeholder="e.g. 5.0"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setShowModal(false)}
                  disabled={savingField}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                  id="btn_save_field"
                  disabled={savingField}
                >
                  {savingField ? (editingField ? 'Updating...' : 'Saving...') : 'Save Field'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================
          Analysis Modal
      ========================= */}
      {(analysisLoading || analysisResult) && (
        <div className="modal-overlay" id="analysis_modal">
          <div className="modal-card analysis-modal-card">
            <div className="modal-header">
              <div>
                <h4>Field Intelligence & Risk Assessment</h4>

                <p
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                  }}
                >
                  {analyzingField
                    ? `${analyzingField.name} (${analyzingField.crop}) • ${analyzingField.location}`
                    : 'Analyzing...'}
                </p>
              </div>

              <button
                type="button"
                className="btn-outline"
                style={{
                  border: 'none',
                  fontSize: 18,
                  cursor: 'pointer',
                  padding: '4px 8px',
                  flex: 'none',
                }}
                onClick={() => {
                  setAnalysisResult(null);
                  setAnalyzingField(null);
                  setShowIoTTester(false);
                }}
              >
                ✕
              </button>
            </div>

            {analysisLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 0',
                }}
              >
                <Activity
                  size={32}
                  className="animate-spin"
                  style={{
                    margin: '0 auto 12px',
                  }}
                />

                <p style={{ fontWeight: 600 }}>Running Risk Prediction Pipeline...</p>

                <p
                  style={{
                    fontSize: 13,
                    color: '#64748b',
                    marginTop: 4,
                  }}
                >
                  Aggregating Live Weather, NDVI & IoT Telemetry
                </p>
              </div>
            ) : (
              analysisResult && (
                <div>
                  <div className={`risk-banner ${analysisResult.risk_level}`} id="risk_banner">
                    <div>
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#475569',
                          marginBottom: 4,
                        }}
                      >
                        CROP RISK SCORE
                      </div>

                      <div className="risk-score-display">
                        <span className="risk-score-number">{analysisResult.risk_score}</span>

                        <span className="risk-score-max">/ 100</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className={`risk-badge ${analysisResult.risk_level}`} id="risk_badge">
                        {analysisResult.risk_level} • {analysisResult.risk_label}
                      </span>

                      <p
                        style={{
                          fontSize: 12,
                          color: '#475569',
                          marginTop: 6,
                          maxWidth: 280,
                        }}
                      >
                        {analysisResult.risk_description}
                      </p>
                    </div>
                  </div>

                  <div className="source-badges-row">
                    <div className={`source-badge ${analysisResult.data_sources.weather}`}>
                      <CloudSun size={14} />

                      <span>
                        Live Weather — Open-Meteo (
                        {analysisResult.data_sources.weather === 'live' ? 'Live GPS' : 'Demo Fallback'})
                      </span>
                    </div>

                    <div className={`source-badge ${analysisResult.data_sources.ndvi}`}>
                      <Sprout size={14} />

                      <span>NDVI — Demo</span>
                    </div>

                    <div className={`source-badge ${analysisResult.data_sources.iot}`}>
                      <Radio size={14} />

                      <span>
                        {analysisResult.data_sources.iot === 'esp32'
                          ? 'IoT — ESP32 Telemetry'
                          : 'IoT — Demo'}
                      </span>
                    </div>
                  </div>

                  <h5
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      marginBottom: 10,
                    }}
                  >
                    Environmental Snapshot
                  </h5>

                  <div className="env-snapshot-grid">
                    <div className="env-card">
                      <div className="env-card-label">Temperature</div>

                      <div className="env-card-val">
                        {analysisResult.environmental_snapshot.temperature}°C
                      </div>
                    </div>

                    <div className="env-card">
                      <div className="env-card-label">Humidity</div>

                      <div className="env-card-val">
                        {analysisResult.environmental_snapshot.humidity}%
                      </div>
                    </div>

                    <div className="env-card">
                      <div className="env-card-label">Rainfall</div>

                      <div className="env-card-val">
                        {analysisResult.environmental_snapshot.rainfall} mm
                      </div>
                    </div>

                    <div className="env-card">
                      <div className="env-card-label">Soil Moisture</div>

                      <div className="env-card-val">
                        {analysisResult.environmental_snapshot.soil_moisture}%
                      </div>
                    </div>

                    <div className="env-card">
                      <div className="env-card-label">Vegetation (NDVI)</div>

                      <div className="env-card-val">
                        {analysisResult.environmental_snapshot.ndvi}
                      </div>
                    </div>
                  </div>

                  <div className="recommendations-box">
                    <h5>Preventive Measures & Agronomic Action</h5>

                    <ul className="recommendations-list">
                      {analysisResult.recommendations.map((recommendation, index) => (
                        <li key={index} className="recommendation-item">
                          {analysisResult.risk_score <= 50 ? (
                            <CheckCircle2
                              size={16}
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            />
                          ) : (
                            <AlertTriangle
                              size={16}
                              style={{
                                flexShrink: 0,
                                marginTop: 2,
                              }}
                            />
                          )}

                          <span>{recommendation}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="iot-tester-box">
                    <div className="iot-tester-header">
                      <span>ESP32 Hardware Telemetry Tester (SIH Demonstration Tool)</span>

                      <button
                        type="button"
                        className="btn-outline"
                        style={{
                          padding: '2px 8px',
                          fontSize: 11,
                          flex: 'none',
                        }}
                        onClick={() => setShowIoTTester((previous) => !previous)}
                      >
                        {showIoTTester ? 'Hide' : 'Test Hardware Ingestion'}
                      </button>
                    </div>

                    {showIoTTester && (
                      <form onSubmit={handleSendIotAndReanalyze} style={{ marginTop: 10 }} noValidate>
                        <div className="form-row">
                          <div
                            className="form-group"
                            style={{
                              flex: 1,
                              marginBottom: 8,
                            }}
                          >
                            <label style={{ fontSize: 11 }}>Temp (°C)</label>

                            <input
                              type="number"
                              step="0.1"
                              value={iotPayload.temperature}
                              onChange={(e) =>
                                setIotPayload({
                                  ...iotPayload,
                                  temperature: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div
                            className="form-group"
                            style={{
                              flex: 1,
                              marginBottom: 8,
                            }}
                          >
                            <label style={{ fontSize: 11 }}>Humidity (%)</label>

                            <input
                              type="number"
                              step="0.1"
                              value={iotPayload.humidity}
                              onChange={(e) =>
                                setIotPayload({
                                  ...iotPayload,
                                  humidity: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div
                            className="form-group"
                            style={{
                              flex: 1,
                              marginBottom: 8,
                            }}
                          >
                            <label style={{ fontSize: 11 }}>Soil Moisture (%)</label>

                            <input
                              type="number"
                              step="0.1"
                              value={iotPayload.soil_moisture}
                              onChange={(e) =>
                                setIotPayload({
                                  ...iotPayload,
                                  soil_moisture: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="btn-primary"
                          style={{
                            fontSize: 12,
                            padding: '6px 12px',
                            width: '100%',
                            justifyContent: 'center',
                          }}
                        >
                          <Send size={13} />

                          <span>Send ESP32 Telemetry & Re-run Risk Model</span>
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
