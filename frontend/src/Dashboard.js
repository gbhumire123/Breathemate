import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAudioUpload = async () => {
    if (!audioFile) {
      setError('Please record or upload an audio file first.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const response = await axios.post('/api/upload-audio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setPredictionResult(response.data.prediction);
    } catch (error) {
      setError('Failed to upload audio file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudioChange = (e) => {
    setAudioFile(e.target.files[0]);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <input type="file" accept="audio/*" onChange={handleAudioChange} />
      </div>
      <button
        onClick={handleAudioUpload}
        className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        disabled={loading}
      >
        {loading ? 'Uploading...' : 'Upload Audio'}
      </button>
      {predictionResult && (
        <div className="mt-4 p-4 bg-white rounded shadow-md">
          <h2 className="text-xl font-bold">Prediction Result</h2>
          <p>{predictionResult}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;