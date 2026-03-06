import { useEffect, useState } from 'react';
import api from '../api/api';

export default function SubmissionList({ date }) {
  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError('');
    api
      .get(`/history/${date}`)
      .then((res) => {
        const rows = res.data.data;
        setSubmissions(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setError('Failed to load submission history.'))
      .finally(() => setLoading(false));
  }, [date]);

  const formatTime = (timestamp) => {
    if (!timestamp) return '—';
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card">
      <h2 className="card-title">Submission History</h2>
      {date && <p className="card-subtitle">Date: {date}</p>}
      {!date && <p className="placeholder-text">Click a heatmap cell to view submissions.</p>}
      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && submissions.length > 0 && (
        <div className="submission-table-wrapper">
          <table className="submission-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Platform</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub, i) => (
                <tr key={sub.submission_id || i}>
                  <td>
                    {sub.url ? (
                      <a href={sub.url} target="_blank" rel="noopener noreferrer" className="problem-link">
                        {sub.title || 'Untitled'}
                      </a>
                    ) : (
                      sub.title || 'Untitled'
                    )}
                  </td>
                  <td>
                    <span className="platform-badge">{sub.platform_name}</span>
                  </td>
                  <td className="submission-time">{formatTime(sub.submitted_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && date && submissions.length === 0 && (
        <p className="placeholder-text">No submissions found for this date.</p>
      )}
    </div>
  );
}
