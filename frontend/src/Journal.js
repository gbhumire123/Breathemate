import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [newEntry, setNewEntry] = useState('');
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

  const handleAddEntry = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/journal', { text: newEntry });
      setEntries([...entries, response.data]);
      setNewEntry('');
    } catch (error) {
      setError('Failed to add journal entry.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (id) => {
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
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Journal</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Write your thoughts here..."
        ></textarea>
        <button
          onClick={handleAddEntry}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 mt-2"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
      </div>
      <div className="w-full max-w-md">
        {entries.map((entry) => (
          <div key={entry.id} className="p-4 bg-white rounded shadow-md mb-2">
            <p>{entry.text}</p>
            <button
              onClick={() => handleDeleteEntry(entry.id)}
              className="text-red-500 hover:underline mt-2"
              disabled={loading}
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Journal;