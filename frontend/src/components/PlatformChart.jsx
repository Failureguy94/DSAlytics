import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../api/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function PlatformChart({ date }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    setLoading(true);
    setError('');
    api
      .get(`/heatmap/${date}/platforms`)
      .then((res) => setData(res.data))
      .catch(() => setError('Failed to load platform data.'))
      .finally(() => setLoading(false));
  }, [date]);

  return (
    <div className="card">
      <h2 className="card-title">Platform Breakdown</h2>
      {date && <p className="card-subtitle">Date: {date}</p>}
      {!date && <p className="placeholder-text">Click a heatmap cell to view platform breakdown.</p>}
      {loading && <p className="loading-text">Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="platform"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ platform, percent }) =>
                `${platform} ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [value, name]} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
      {!loading && !error && date && data.length === 0 && (
        <p className="placeholder-text">No platform data for this date.</p>
      )}
    </div>
  );
}
