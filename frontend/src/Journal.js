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
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl p-6 border border-green-400/20">
        <h1 className="text-2xl font-bold text-white mb-2">Health Journal 📝</h1>
        <p className="text-gray-300">
          Track your daily health observations, symptoms, and progress
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Add New Entry */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 className="text-lg font-semibold text-white mb-4">Add New Entry</h2>
        <textarea
          className="w-full p-4 bg-slate-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 resize-none transition-colors"
          rows={4}
          placeholder="How are you feeling today? Record your symptoms, mood, or any observations..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex justify-between items-center mt-4">
          <span className="text-gray-400 text-sm">
            {text.length}/500 characters
          </span>
          <button
            onClick={addEntry}
            disabled={loading || !text.trim()}
            className="bg-cyan-400 text-gray-900 font-semibold py-3 px-6 rounded-lg hover:bg-cyan-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Adding...' : '✍️ Add Entry'}
          </button>
        </div>
      </div>

      {/* Entries List */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Your Entries</h2>
          <span className="text-gray-400 text-sm">{entries.length} entries</span>
        </div>

        {entries.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-white/10">
            <div className="text-center">
              <div className="text-gray-400 text-6xl mb-4">📔</div>
              <p className="text-gray-400 text-lg">No journal entries yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Start by adding your first entry above to track your health journey!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <p className="text-gray-200 leading-relaxed mb-2">{entry.text}</p>
                    <div className="flex items-center space-x-4">
                      <span className="text-gray-400 text-sm flex items-center">
                        📅 {entry.date}
                      </span>
                      <span className="text-gray-400 text-sm flex items-center">
                        🕒 {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    disabled={loading}
                    className="text-red-400 hover:text-red-300 font-medium p-2 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl p-6 border border-blue-400/20">
        <h3 className="text-blue-400 font-semibold mb-4">💡 Journaling Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="text-white font-medium mb-2">What to Track</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Breathing quality and comfort</li>
              <li>• Energy levels throughout the day</li>
              <li>• Sleep quality and duration</li>
              <li>• Physical symptoms or changes</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-2">Best Practices</h4>
            <ul className="text-gray-400 space-y-1">
              <li>• Write entries consistently</li>
              <li>• Be specific and detailed</li>
              <li>• Note environmental factors</li>
              <li>• Track medication or treatment effects</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Journal;