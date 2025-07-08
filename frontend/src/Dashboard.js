import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

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
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-4xl font-extrabold text-white mb-6">Dashboard</h1>
      {error && <motion.p className="text-red-500 mb-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{error}</motion.p>}
      <motion.div className="mb-4" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
        <input
          type="file"
          accept="audio/*"
          onChange={handleAudioChange}
          className="p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </motion.div>
      <motion.button
        onClick={handleAudioUpload}
        className="bg-white text-blue-600 font-bold py-2 px-4 rounded shadow-lg hover:bg-blue-100"
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {loading ? 'Uploading...' : 'Upload Audio'}
      </motion.button>
      {predictionResult && (
        <motion.div
          className="mt-6 p-6 bg-white rounded shadow-md w-3/4 text-center"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
        >
          <h2 className="text-2xl font-bold text-blue-600">Prediction Result</h2>
          <p className="text-lg text-gray-700 mt-2">{predictionResult}</p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Dashboard;