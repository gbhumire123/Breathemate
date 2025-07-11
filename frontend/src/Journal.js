import React, { useState } from 'react';

const Journal = () => {
  const [entries, setEntries] = useState([
    {
      id: '1',
      text: 'Feeling good today! My breathing feels much better.',
      date: new Date().toLocaleDateString(),
    },
    {
      id: '2', 
      text: 'Had a mild cough this morning, will monitor it.',
      date: new Date(Date.now() - 86400000).toLocaleDateString(),
    }
  ]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addEntry = async () => {
    if (text.trim()) {
      setLoading(true);
      setError(null);
      try {
        // For now, just add locally. You can uncomment the API call when backend is ready
        // const response = await axios.post('/api/journal', { text });
        const newEntry = {
          id: Date.now().toString(),
          text: text.trim(),
          date: new Date().toLocaleDateString(),
        };
        setEntries([newEntry, ...entries]);
        setText('');
        alert('Journal entry added!');
      } catch (error) {
        setError('Failed to add journal entry.');
      } finally {
        setLoading(false);
      }
    } else {
      alert('Please enter some text');
    }
  };

  const deleteEntry = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setLoading(true);
      setError(null);
      try {
        // For now, just delete locally. You can uncomment the API call when backend is ready
        // await axios.delete(`/api/journal/${id}`);
        setEntries(entries.filter((entry) => entry.id !== id));
      } catch (error) {
        setError('Failed to delete journal entry.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-cyan-400 mb-8 text-center">Health Journal</h1>
        
        {error && (
          <div className="bg-red-900 border border-red-500 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <textarea
            className="w-full p-4 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none"
            rows={4}
            placeholder="How are you feeling today? Record your symptoms, mood, or any observations..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={addEntry}
            disabled={loading}
            className="mt-4 bg-cyan-400 text-gray-900 font-bold py-3 px-6 rounded hover:bg-cyan-300 transition-colors disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Entry'}
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800 rounded-lg p-6 border-l-4 border-cyan-400"
            >
              <p className="text-gray-200 mb-3 leading-relaxed">{entry.text}</p>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">{entry.date}</span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center text-gray-400 py-12">
            <p>No journal entries yet. Start by adding your first entry above!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;