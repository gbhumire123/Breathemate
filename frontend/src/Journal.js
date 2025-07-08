import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const JournalScreen = () => {
  const [entries, setEntries] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('/api/journal');
        setEntries(response.data);
      } catch (error) {
        setError('Failed to fetch journal entries.');
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  const addEntry = async () => {
    if (text.trim()) {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.post('/api/journal', { text });
        setEntries([response.data, ...entries]);
        setText('');
      } catch (error) {
        setError('Failed to add journal entry.');
      } finally {
        setLoading(false);
      }
    }
  };

  const deleteEntry = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`/api/journal/${id}`);
      setEntries(entries.filter((entry) => entry.id !== id));
    } catch (error) {
      setError('Failed to delete journal entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Journal</Text>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TextInput
        style={styles.input}
        placeholder="How are you feeling today?"
        placeholderTextColor="#aaa"
        value={text}
        onChangeText={setText}
      />

      <TouchableOpacity style={styles.button} onPress={addEntry} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Entry'}</Text>
      </TouchableOpacity>

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.entryContainer}>
            <Text style={styles.entryText}>{item.text}</Text>
            <Text style={styles.entryDate}>{item.date}</Text>
            <TouchableOpacity onPress={() => deleteEntry(item.id)}>
              <Text style={styles.deleteText}>{loading ? 'Deleting...' : 'Delete'}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f0f',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#00ffff',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#00ffff',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#0f0f0f',
    fontWeight: 'bold',
  },
  entryContainer: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  entryText: {
    color: '#fff',
    fontSize: 16,
  },
  entryDate: {
    color: '#aaa',
    fontSize: 12,
    marginBottom: 5,
  },
  deleteText: {
    color: '#ff0055',
    fontSize: 14,
    textAlign: 'right',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default JournalScreen;