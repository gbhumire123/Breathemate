import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
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
    <View style={styles.container}>
      <BlurView intensity={50} style={styles.blurContainer}>
        <Text style={styles.title}>Login</Text>
        {error && <motion.p className="text-red-500 mb-4" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>{error}</motion.p>}
        <motion.form onSubmit={handleLogin} className="w-3/4" initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.3 }}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            required
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#aaa"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            required
          />
          <motion.button
            type="submit"
            className="bg-neon-green text-gray-900 font-bold py-2 px-4 rounded shadow-lg hover:bg-neon-green-light w-full"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>
        </motion.form>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f0f',
  },
  blurContainer: {
    width: '80%',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#00ffff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#00ffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 40,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    color: '#fff',
  },
  button: {
    backgroundColor: '#00ffff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
  },
});

export default LoginScreen;