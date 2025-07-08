import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';

const Dashboard = () => {
  const [audioFile, setAudioFile] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleSaveJournal = () => {
    alert('Journal entry saved!');
  };

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
      className="min-h-screen flex flex-col bg-gray-900 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex items-center justify-between p-4 bg-gray-800">
        <h1 className="text-2xl font-bold">BreatheMate</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </header>
      <div className="flex flex-row flex-grow">
        <nav className="w-1/4 bg-gray-800 p-4">
          <ul className="space-y-4">
            <li className="hover:text-neon-green cursor-pointer">Home</li>
            <li className="hover:text-neon-green cursor-pointer">Journal</li>
            <li className="hover:text-neon-green cursor-pointer">Settings</li>
          </ul>
        </nav>
        <main className="flex-grow p-6">
          <h2 className="text-3xl font-bold mb-4">Welcome, User!</h2>
          <section className="mb-6">
            <h3 className="text-2xl font-bold mb-2">Breathing Analysis</h3>
            <div className="bg-gray-800 p-4 rounded shadow-md">
              <canvas id="breathingChart" width="400" height="200"></canvas>
            </div>
          </section>
          <section>
            <h3 className="text-2xl font-bold mb-2">Journal Entry</h3>
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-neon-green"
              rows="5"
            ></textarea>
            <button
              onClick={handleSaveJournal}
              className="mt-4 bg-neon-green text-gray-900 font-bold py-2 px-4 rounded shadow-lg hover:bg-neon-green-light"
            >
              Save
            </button>
          </section>
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
        </main>
      </div>
    </motion.div>
  );
};

export default Dashboard;