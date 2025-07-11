import React, { useState, useRef, useEffect } from 'react';

const RecordBreath = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [samples, setSamples] = useState([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingError, setRecordingError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setRecordingError('');
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Check if MediaRecorder is supported
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        console.log('webm/opus not supported, trying wav');
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus') 
          ? 'audio/webm;codecs=opus' 
          : 'audio/wav'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || 'audio/wav';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const newSample = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          duration: recordingTime,
          blob: audioBlob,
          url: audioUrl,
          status: 'recorded',
          source: 'microphone',
          mimeType: mimeType,
          size: audioBlob.size
        };
        
        setSamples(prev => [newSample, ...prev]);
        console.log('Recording saved:', newSample);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event.error);
        setRecordingError('Recording failed: ' + event.error);
        setIsRecording(false);
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      console.log('Recording started successfully');

    } catch (error) {
      console.error('Error starting recording:', error);
      let errorMessage = 'Unable to access microphone. ';
      
      if (error.name === 'NotAllowedError') {
        errorMessage += 'Please allow microphone access and try again.';
      } else if (error.name === 'NotFoundError') {
        errorMessage += 'No microphone found.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage += 'Audio recording not supported in this browser.';
      } else {
        errorMessage += error.message;
      }
      
      setRecordingError(errorMessage);
    }
  };

  const stopRecording = () => {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      console.log('Recording stopped');
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecordingError('Error stopping recording: ' + error.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid audio file (WAV, MP3, OGG)');
      return;
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      alert('File too large. Please select a file under 50MB.');
      return;
    }

    setUploadProgress(0);
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = () => {
      const duration = Math.floor(audio.duration);
      
      const newSample = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        duration: duration,
        blob: file,
        url: audioUrl,
        status: 'uploaded',
        source: 'file',
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
      
      setSamples(prev => [newSample, ...prev]);
      setUploadProgress(100);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      console.log('File uploaded:', newSample);
    };

    audio.onerror = () => {
      alert('Error loading audio file. Please try a different file.');
      setUploadProgress(0);
    };
  };

  const analyzeSample = async (sample) => {
    // Set status to analyzing
    setSamples(prev => prev.map(s => 
      s.id === sample.id 
        ? { ...s, status: 'analyzing' }
        : s
    ));

    try {
      // Simulate API call to Python ML model
      // In real implementation, this would call your backend endpoint
      // which runs the enhanced predict.py script
      
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

      // Enhanced mock results that match the new ML model output
      const enhancedResults = [
        {
          risk_percentage: 15,
          risk_level: "Low",
          confidence_level: "High",
          detected_issues: [],
          recommendation: "Continue regular health monitoring",
          urgency: "Routine",
          breathing_rate: 16.2,
          analysis_details: {
            wheezing_detected: false,
            crackling_detected: false,
            rhythm_regular: true,
            breath_consistent: true
          },
          medical_disclaimer: "This analysis is for screening purposes only. Always consult healthcare professionals for medical diagnosis."
        },
        {
          risk_percentage: 45,
          risk_level: "Moderate",
          confidence_level: "Medium",
          detected_issues: ["Irregular breathing pattern", "Inconsistent breath depth"],
          recommendation: "Schedule a medical check-up",
          urgency: "Within 1-2 weeks",
          breathing_rate: 22.8,
          analysis_details: {
            wheezing_detected: false,
            crackling_detected: false,
            rhythm_regular: false,
            breath_consistent: false
          },
          medical_disclaimer: "This analysis is for screening purposes only. Always consult healthcare professionals for medical diagnosis."
        },
        {
          risk_percentage: 78,
          risk_level: "High",
          confidence_level: "High",
          detected_issues: ["Possible wheezing detected", "Abnormally fast breathing rate", "Irregular breathing pattern"],
          recommendation: "Consult a pulmonologist immediately",
          urgency: "Urgent",
          breathing_rate: 28.5,
          analysis_details: {
            wheezing_detected: true,
            crackling_detected: false,
            rhythm_regular: false,
            breath_consistent: false
          },
          medical_disclaimer: "This analysis is for screening purposes only. Always consult healthcare professionals for medical diagnosis."
        },
        {
          risk_percentage: 32,
          risk_level: "Low-Moderate",
          confidence_level: "Medium",
          detected_issues: ["Inconsistent breath depth"],
          recommendation: "Monitor symptoms, consider medical consultation",
          urgency: "Within 1 month",
          breathing_rate: 19.1,
          analysis_details: {
            wheezing_detected: false,
            crackling_detected: false,
            rhythm_regular: true,
            breath_consistent: false
          },
          medical_disclaimer: "This analysis is for screening purposes only. Always consult healthcare professionals for medical diagnosis."
        }
      ];
      
      const randomResult = enhancedResults[Math.floor(Math.random() * enhancedResults.length)];
      
      setSamples(prev => prev.map(s => 
        s.id === sample.id 
          ? { ...s, analysis: randomResult, status: 'analyzed' }
          : s
      ));
    } catch (error) {
      console.error('Analysis failed:', error);
      setSamples(prev => prev.map(s => 
        s.id === sample.id 
          ? { ...s, status: 'error', error: 'Analysis failed. Please try again.' }
          : s
      ));
    }
  };

  const deleteSample = (id) => {
    setSamples(prev => prev.filter(s => s.id !== id));
  };

  const playSample = (sample) => {
    const audio = new Audio(sample.url);
    audio.play();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            Record Breathing Samples
          </h1>
          <p className="text-gray-400">
            Capture and analyze your breathing patterns with AI
          </p>
        </div>

        {/* Error Display */}
        {recordingError && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-center">{recordingError}</p>
            <button 
              onClick={() => setRecordingError('')}
              className="mt-2 text-red-300 hover:text-red-200 text-sm block mx-auto"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Recording Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Live Recording */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
                isRecording 
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                  : 'bg-cyan-400 hover:bg-cyan-300'
              }`}>
                <span className="text-white font-bold text-2xl">
                  {isRecording ? '●' : '🎤'}
                </span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Live Recording</h2>
              <p className="text-gray-400 mb-6">
                {isRecording 
                  ? `🔴 Recording... ${formatTime(recordingTime)}`
                  : "Click to start recording your breathing"
                }
              </p>

              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={recordingError !== ''}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white shadow-lg"
                    : "bg-cyan-400 hover:bg-cyan-300 text-gray-900"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? '⏹️ Stop Recording' : '🎙️ Start Recording'}
              </button>

              {isRecording && (
                <div className="mt-4 text-sm text-gray-400">
                  <p>Speak naturally or breathe near the microphone</p>
                  <div className="flex justify-center items-center mt-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping mr-2"></div>
                    <span>Recording in progress...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* File Upload */}
          <div className="bg-gray-800 rounded-lg p-8 border border-gray-700">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-lg bg-gray-700 flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-green-500 transition-colors">
                <span className="text-gray-400 text-2xl">📁</span>
              </div>

              <h2 className="text-xl font-bold text-white mb-2">Upload Audio File</h2>
              <p className="text-gray-400 mb-4">
                Select an audio file from your device
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Supported: WAV, MP3, OGG (Max 50MB)
              </p>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-green-400 text-sm mt-1">Uploading... {uploadProgress}%</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 rounded-lg font-medium bg-green-500 hover:bg-green-600 text-white transition-colors"
              >
                📎 Choose Audio File
              </button>
            </div>
          </div>
        </div>

        {/* Samples Collection */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Your Samples</h2>
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">{samples.length} samples</span>
              {samples.length > 0 && (
                <button 
                  onClick={() => setSamples([])}
                  className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded border border-red-400/30 hover:bg-red-500/10 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>

          {samples.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 border border-gray-700">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">🎵</div>
                <p className="text-gray-400 text-lg">No breathing samples yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Start by recording or uploading your first sample above
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {samples.map((sample) => (
                <div key={sample.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white font-medium">
                        {sample.source === 'file' ? sample.fileName : `Sample ${new Date(sample.timestamp).toLocaleTimeString()}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                        <span>⏱️ {formatTime(sample.duration)}</span>
                        <span>📁 {formatFileSize(sample.size || sample.fileSize)}</span>
                        <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                          sample.status === 'analyzed' ? 'bg-green-500/20 text-green-400' : 
                          sample.status === 'analyzing' ? 'bg-yellow-500/20 text-yellow-400' :
                          sample.status === 'uploaded' || sample.status === 'recorded' ? 'bg-blue-500/20 text-blue-400' : 'text-gray-400'
                        }`}>
                          {sample.status === 'analyzing' ? '🔄 Analyzing...' : 
                           sample.status === 'analyzed' ? '✅ Analyzed' :
                           sample.status === 'uploaded' ? '📤 Uploaded' :
                           sample.status === 'recorded' ? '🎙️ Recorded' : sample.status}
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                      title="Delete sample"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => playSample(sample)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-700 rounded-lg text-white hover:bg-gray-600 transition-colors"
                    >
                      <span>▶️</span>
                      <span>Play</span>
                    </button>
                    
                    <button
                      onClick={() => analyzeSample(sample)}
                      disabled={sample.status === 'analyzed' || sample.status === 'analyzing'}
                      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                        sample.status === 'analyzed'
                          ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                          : sample.status === 'analyzing'
                          ? 'bg-yellow-500/20 text-yellow-400 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                      }`}
                    >
                      {sample.status === 'analyzed' ? '✅ Analyzed' : 
                       sample.status === 'analyzing' ? '🔄 Analyzing...' : '🧠 Analyze'}
                    </button>
                  </div>

                  {/* Enhanced Analysis Results */}
                  {sample.analysis && (
                    <div className="mt-4 p-6 bg-gradient-to-r from-slate-700/50 to-slate-800/50 rounded-xl border border-slate-600">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-cyan-400 font-semibold text-lg flex items-center">
                          🧠 Medical AI Analysis
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          sample.analysis.confidence_level === 'High' ? 'bg-green-500/20 text-green-400' :
                          sample.analysis.confidence_level === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {sample.analysis.confidence_level} Confidence
                        </span>
                      </div>

                      {/* Risk Assessment */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Risk Level</p>
                          <div className="flex items-center space-x-2">
                            <span className={`text-lg font-bold ${
                              sample.analysis.risk_level === 'Low' ? 'text-green-400' :
                              sample.analysis.risk_level === 'Moderate' || sample.analysis.risk_level === 'Low-Moderate' ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {sample.analysis.risk_percentage}%
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              sample.analysis.risk_level === 'Low' ? 'bg-green-500/20 text-green-400' :
                              sample.analysis.risk_level === 'Moderate' || sample.analysis.risk_level === 'Low-Moderate' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {sample.analysis.risk_level}
                            </span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2 mt-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                sample.analysis.risk_percentage <= 25 ? 'bg-green-400' :
                                sample.analysis.risk_percentage <= 50 ? 'bg-yellow-400' :
                                sample.analysis.risk_percentage <= 75 ? 'bg-orange-400' :
                                'bg-red-400'
                              }`}
                              style={{ width: `${sample.analysis.risk_percentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Breathing Rate</p>
                          <div className="flex items-center space-x-2">
                            <span className="text-white text-lg font-bold">
                              {sample.analysis.breathing_rate}
                            </span>
                            <span className="text-gray-400 text-sm">bpm</span>
                          </div>
                          <p className={`text-xs mt-1 ${
                            sample.analysis.breathing_rate >= 12 && sample.analysis.breathing_rate <= 20 
                              ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {sample.analysis.breathing_rate >= 12 && sample.analysis.breathing_rate <= 20 
                              ? 'Normal range' : 'Outside normal range'}
                          </p>
                        </div>

                        <div className="bg-slate-800/50 p-4 rounded-lg">
                          <p className="text-gray-400 text-sm mb-1">Urgency</p>
                          <span className={`text-sm font-medium px-2 py-1 rounded ${
                            sample.analysis.urgency === 'Routine' ? 'bg-green-500/20 text-green-400' :
                            sample.analysis.urgency === 'Within 1 month' ? 'bg-yellow-500/20 text-yellow-400' :
                            sample.analysis.urgency === 'Within 1-2 weeks' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {sample.analysis.urgency}
                          </span>
                        </div>
                      </div>

                      {/* Detected Issues */}
                      {sample.analysis.detected_issues && sample.analysis.detected_issues.length > 0 && (
                        <div className="mb-6">
                          <h5 className="text-orange-400 font-medium mb-3 flex items-center">
                            ⚠️ Detected Issues
                          </h5>
                          <div className="space-y-2">
                            {sample.analysis.detected_issues.map((issue, index) => (
                              <div key={index} className="flex items-center space-x-2 bg-orange-500/10 p-2 rounded-lg">
                                <span className="text-orange-400">•</span>
                                <span className="text-orange-200 text-sm">{issue}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technical Analysis Details */}
                      {sample.analysis.analysis_details && (
                        <div className="mb-6">
                          <h5 className="text-cyan-400 font-medium mb-3">🔬 Technical Analysis</h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                              <div className={`text-2xl mb-1 ${
                                sample.analysis.analysis_details.wheezing_detected ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {sample.analysis.analysis_details.wheezing_detected ? '⚠️' : '✅'}
                              </div>
                              <p className="text-xs text-gray-400">Wheezing</p>
                              <p className={`text-xs font-medium ${
                                sample.analysis.analysis_details.wheezing_detected ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {sample.analysis.analysis_details.wheezing_detected ? 'Detected' : 'Clear'}
                              </p>
                            </div>

                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                              <div className={`text-2xl mb-1 ${
                                sample.analysis.analysis_details.crackling_detected ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {sample.analysis.analysis_details.crackling_detected ? '⚠️' : '✅'}
                              </div>
                              <p className="text-xs text-gray-400">Crackling</p>
                              <p className={`text-xs font-medium ${
                                sample.analysis.analysis_details.crackling_detected ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {sample.analysis.analysis_details.crackling_detected ? 'Detected' : 'Clear'}
                              </p>
                            </div>

                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                              <div className={`text-2xl mb-1 ${
                                sample.analysis.analysis_details.rhythm_regular ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {sample.analysis.analysis_details.rhythm_regular ? '✅' : '⚠️'}
                              </div>
                              <p className="text-xs text-gray-400">Rhythm</p>
                              <p className={`text-xs font-medium ${
                                sample.analysis.analysis_details.rhythm_regular ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {sample.analysis.analysis_details.rhythm_regular ? 'Regular' : 'Irregular'}
                              </p>
                            </div>

                            <div className="bg-slate-800/50 p-3 rounded-lg text-center">
                              <div className={`text-2xl mb-1 ${
                                sample.analysis.analysis_details.breath_consistent ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {sample.analysis.analysis_details.breath_consistent ? '✅' : '⚠️'}
                              </div>
                              <p className="text-xs text-gray-400">Consistency</p>
                              <p className={`text-xs font-medium ${
                                sample.analysis.analysis_details.breath_consistent ? 'text-green-400' : 'text-yellow-400'
                              }`}>
                                {sample.analysis.analysis_details.breath_consistent ? 'Consistent' : 'Variable'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Medical Recommendation */}
                      <div className="mb-4">
                        <h5 className="text-blue-400 font-medium mb-2 flex items-center">
                          🏥 Medical Recommendation
                        </h5>
                        <div className={`p-3 rounded-lg border ${
                          sample.analysis.risk_level === 'High' ? 'bg-red-500/10 border-red-500/30' :
                          sample.analysis.risk_level === 'Moderate' ? 'bg-yellow-500/10 border-yellow-500/30' :
                          'bg-green-500/10 border-green-500/30'
                        }`}>
                          <p className="text-white text-sm">{sample.analysis.recommendation}</p>
                        </div>
                      </div>

                      {/* Medical Disclaimer */}
                      {sample.analysis.medical_disclaimer && (
                        <div className="mt-4 p-3 bg-gray-600/20 rounded-lg border border-gray-500/30">
                          <p className="text-gray-300 text-xs flex items-center">
                            ⚖️ <span className="ml-2">{sample.analysis.medical_disclaimer}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-cyan-400 font-medium mb-4">📝 Recording Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-white font-medium mb-2">For Best Results:</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Record in a quiet environment</li>
                <li>• Keep microphone 6-12 inches away</li>
                <li>• Breathe naturally and normally</li>
                <li>• Record for at least 30 seconds</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-2">Supported Formats:</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• WAV (recommended)</li>
                <li>• MP3</li>
                <li>• OGG</li>
                <li>• Maximum file size: 50MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordBreath;