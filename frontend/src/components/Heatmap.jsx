import { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import { Tooltip } from 'react-tooltip';
import 'react-calendar-heatmap/dist/styles.css';
import api from '../api/api';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function normalizeValues(raw) {
  if (!Array.isArray(raw)) {
    console.warn('[Heatmap] Expected an array from /heatmap, got:', typeof raw, raw);
    return [];
  }

  return raw.reduce((acc, entry) => {
    if (!entry || typeof entry !== 'object') {
      console.warn('[Heatmap] Skipping non-object entry:', entry);
      return acc;
    }

    const date = typeof entry.activity_date === 'string'
      ? entry.activity_date.trim().slice(0, 10)
      : null;
    const count = Number(entry.total_count);

    if (!date || !DATE_REGEX.test(date)) {
      console.warn('[Heatmap] Skipping entry with invalid date:', entry);
      return acc;
    }

    if (isNaN(count)) {
      console.warn('[Heatmap] Skipping entry with non-numeric count:', entry);
      return acc;
    }

    acc.push({ date, count });
    return acc;
  }, []);
}

export default function Heatmap({ onDateSelect }) {
  const [values, setValues] = useState(null);
  const [error, setError] = useState('');

  const today = new Date();
  const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());

  useEffect(() => {
    api
      .get('/heatmap')
      .then((res) => {
        const payload = res.data.data;
        console.log('[Heatmap] Raw payload from /heatmap:', payload);
        const normalized = normalizeValues(payload);
        console.log('[Heatmap] Normalized values:', normalized);
        setValues(normalized);
      })
      .catch((err) => {
        console.error('[Heatmap] Failed to fetch /heatmap:', err);
        setError('Failed to load heatmap data.');
        setValues([]);
      });
  }, []);

  return (
    <div className="card">
      <h2 className="card-title">Activity Heatmap</h2>
      {error && <p className="error-message">{error}</p>}
      {values === null ? (
        <p className="loading-text">Loading heatmap...</p>
      ) : (
        <div className="heatmap-wrapper">
          <CalendarHeatmap
            startDate={startDate}
            endDate={today}
            values={values}
            classForValue={(value) => {
              if (!value || value.count === 0) return 'color-empty';
              if (value.count < 3) return 'color-scale-1';
              if (value.count < 6) return 'color-scale-2';
              if (value.count < 10) return 'color-scale-3';
              return 'color-scale-4';
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) return {};
              return {
                'data-tooltip-id': 'heatmap-tooltip',
                'data-tooltip-content': `${value.date}: ${value.count} submission${value.count !== 1 ? 's' : ''}`,
              };
            }}
            onClick={(value) => {
              if (value && value.date) {
                onDateSelect(value.date);
              }
            }}
          />
          <Tooltip id="heatmap-tooltip" />
        </div>
      )}
    </div>
  );
}
