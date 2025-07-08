import React, { useState, useEffect } from 'react';
import { Chart } from 'chart.js';
import axios from 'axios';

const Report = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/prediction-history');
        setHistory(response.data);
      } catch (error) {
        setError('Failed to fetch prediction history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    if (history.length > 0) {
      const ctx = document.getElementById('predictionChart').getContext('2d');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: history.map((item) => item.date),
          datasets: [
            {
              label: 'Prediction Risk Level',
              data: history.map((item) => item.riskLevel),
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }, [history]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Report</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      <div className="w-full max-w-md">
        <canvas id="predictionChart"></canvas>
      </div>
    </div>
  );
};

export default Report;