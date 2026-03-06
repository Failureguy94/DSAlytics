import { useEffect, useState } from 'react';
import api from '../api/api';

export default function HandleManager() {
  const [handles, setHandles] = useState([]);
  const [form, setForm] = useState({ platform: '', handle: '' });
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchHandles = () => {
    api
      .get('/handles')
      .then((res) => setHandles(res.data))
      .catch(() => setError('Failed to load handles.'));
  };

  useEffect(() => {
    fetchHandles();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/handles', form);
      setForm({ platform: '', handle: '' });
      fetchHandles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add handle.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    setError('');
    try {
      await api.delete(`/handles/${id}`);
      fetchHandles();
    } catch {
      setError('Failed to delete handle.');
    }
  };

  const handleSync = async (id) => {
    setSyncStatus((prev) => ({ ...prev, [id]: 'syncing' }));
    try {
      await api.post(`/sync/${id}`);
      setSyncStatus((prev) => ({ ...prev, [id]: 'done' }));
      setTimeout(() => setSyncStatus((prev) => ({ ...prev, [id]: null })), 3000);
    } catch {
      setSyncStatus((prev) => ({ ...prev, [id]: 'error' }));
    }
  };

  const getSyncLabel = (id) => {
    const status = syncStatus[id];
    if (status === 'syncing') return 'Syncing...';
    if (status === 'done') return 'Synced!';
    if (status === 'error') return 'Failed';
    return 'Sync';
  };

  return (
    <div className="card">
      <h2 className="card-title">Handle Manager</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleAdd} className="handle-form">
        <input
          name="platform"
          value={form.platform}
          onChange={handleChange}
          placeholder="Platform (e.g. codeforces)"
          required
        />
        <input
          name="handle"
          value={form.handle}
          onChange={handleChange}
          placeholder="Handle / Username"
          required
        />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Adding...' : 'Add Handle'}
        </button>
      </form>

      {handles.length === 0 ? (
        <p className="placeholder-text">No handles added yet.</p>
      ) : (
        <ul className="handle-list">
          {handles.map((h) => (
            <li key={h.id} className="handle-item">
              <div className="handle-info">
                <span className="platform-badge">{h.platform}</span>
                <span className="handle-name">{h.handle}</span>
              </div>
              <div className="handle-actions">
                <button
                  className={`btn btn-sync ${syncStatus[h.id] === 'done' ? 'btn-success' : syncStatus[h.id] === 'error' ? 'btn-danger' : ''}`}
                  onClick={() => handleSync(h.id)}
                  disabled={syncStatus[h.id] === 'syncing'}
                >
                  {getSyncLabel(h.id)}
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(h.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
