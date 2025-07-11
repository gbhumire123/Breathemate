import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const RecordBreath = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [samples, setSamples] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      const audioChunks = [];
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
        
        // Add to samples collection
        const newSample = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          blob: audioBlob,
          url: audioUrl,
          status: 'recorded'
        };
        setSamples(prev => [newSample, ...prev]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const analyzeSample = async (sample) => {
    // Simulate analysis - replace with actual API call to your ML model
    const mockResults = [
      { pattern: 'Normal breathing', confidence: 95, recommendation: 'Breathing patterns appear healthy' },
      { pattern: 'Shallow breathing', confidence: 78, recommendation: 'Try deeper breathing exercises' },
      { pattern: 'Irregular rhythm', confidence: 82, recommendation: 'Consider consulting a healthcare provider' },
      { pattern: 'Rapid breathing', confidence: 89, recommendation: 'Practice relaxation techniques' }
    ];
    
    const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)];
    
    // Update the sample with analysis results
    setSamples(prev => prev.map(s => 
      s.id === sample.id 
        ? { ...s, analysis: randomResult, status: 'analyzed' }
        : s
    ));
    
    setAnalysisResult(randomResult);
  };

  const deleteSample = (id) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-4xl font-bold text-cyan-400 mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Record Breathing Samples
        </motion.h1>

        {/* Recording Section */}
        <motion.div 
          className="bg-gray-800 rounded-lg p-8 mb-8 text-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="mb-6">
            <div className={`w-32 h-32 mx-auto rounded-full border-4 flex items-center justify-center mb-4 ${
              isRecording 
                ? 'border-red-500 bg-red-500/20 animate-pulse' 
                : 'border-cyan-400 bg-cyan-400/10'
            }`}>
              <div className={`w-16 h-16 rounded-full ${
                isRecording ? 'bg-red-500' : 'bg-cyan-400'
              }`} />
            </div>
            
            {isRecording && (
              <div className="text-2xl font-mono text-red-400">
                {formatTime(recordingTime)}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p className="text-gray-300 mb-4">
              {isRecording 
                ? "Recording your breathing... Take slow, natural breaths" 
                : "Click to start recording your breathing pattern"
              }
            </p>
            
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              className={`px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-cyan-400 hover:bg-cyan-300 text-gray-900'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isRecording ? 'Stop Recording' : 'Start Recording'}
            </motion.button>
          </div>
        </motion.div>

        {/* Samples Collection */}
        <motion.div 
          className="bg-gray-800 rounded-lg p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-cyan-400 mb-6">Recorded Samples</h2>
          
          {samples.length === 0 ? (
            <div className="text-center text-gray-400 py-12">
              <p>No breathing samples recorded yet</p>
              <p className="text-sm mt-2">Start by recording your first breathing sample above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {samples.map((sample) => (
                <motion.div
                  key={sample.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-white">
                        Sample {new Date(sample.timestamp).toLocaleTimeString()}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Duration: {formatTime(sample.duration)} | 
                        Status: <span className={`${
                          sample.status === 'analyzed' ? 'text-green-400' : 'text-yellow-400'
                        }`}>{sample.status}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="flex space-x-4 mb-3">
                    <audio 
                      controls 
                      src={sample.url}
                      className="flex-1"
                    />
                    <button
                      onClick={() => analyzeSample(sample)}
                      disabled={sample.status === 'analyzed'}
                      className="bg-cyan-400 text-gray-900 px-4 py-2 rounded font-medium hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sample.status === 'analyzed' ? 'Analyzed' : 'Analyze'}
                    </button>
                  </div>

                  {sample.analysis && (
                    <div className="bg-gray-600 rounded p-3 mt-3">
                      <h4 className="font-medium text-cyan-400 mb-2">Analysis Result</h4>
                      <p className="text-white mb-1">
                        <strong>Pattern:</strong> {sample.analysis.pattern}
                      </p>
                      <p className="text-white mb-1">
                        <strong>Confidence:</strong> {sample.analysis.confidence}%
                      </p>
                      <p className="text-gray-300">
                        <strong>Recommendation:</strong> {sample.analysis.recommendation}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default RecordBreath;