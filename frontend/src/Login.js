import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/login', { email, password });
      localStorage.setItem('token', response.data.token);
      alert('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      setError('Login failed! Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <motion.div 
        className="bg-gray-800 p-8 rounded-lg shadow-2xl w-96 border border-cyan-400"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-2xl font-bold text-cyan-400 mb-6 text-center">Login to BreatheMate</h1>
        {error && (
          <motion.p 
            className="text-red-500 mb-4 text-center" 
            initial={{ scale: 0.8 }} 
            animate={{ scale: 1 }}
          >
            {error}
          </motion.p>
        )}
        <motion.form 
          onSubmit={handleLogin} 
          className="space-y-4"
          initial={{ y: -20 }} 
          animate={{ y: 0 }} 
          transition={{ duration: 0.3 }}
        >
          <div>
            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <motion.button
            type="submit"
            className="w-full bg-cyan-400 text-gray-900 font-bold py-3 px-4 rounded shadow-lg hover:bg-cyan-300 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </motion.form>
        <div className="mt-6">
          <button className="w-full bg-gray-700 text-white py-3 px-4 rounded border border-gray-600 hover:bg-gray-600 transition-colors">
            Sign in with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginScreen;