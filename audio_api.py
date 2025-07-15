"""
Flask API for Smart Audio Processing
Provides endpoints for noise filtering and audio enhancement
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import io
import base64
import logging
import numpy as np
import scipy.signal
import webrtcvad
from audio_processor import SmartNoiseFilter
from typing import Dict, Any
import time

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend integration

# Initialize noise filter
noise_filter = SmartNoiseFilter()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "BreatheMate Audio Processor",
        "version": "1.0.0",
        "timestamp": time.time()
    })

@app.route('/process-audio', methods=['POST'])
def process_audio():
    """Process audio with smart noise filtering"""
    try:
        start_time = time.time()
        
        # Check if request has audio data
        if 'audio' not in request.files and 'audio_data' not in request.json:
            return jsonify({
                "error": "No audio data provided",
                "message": "Please provide audio file or base64 encoded audio data"
            }), 400
        
        # Get processing options
        options = request.json.get('options', {}) if request.json else {}
        audio_format = options.get('format', 'webm')
        quality_level = options.get('quality', 'standard')  # standard, high, premium
        
        # Handle file upload
        if 'audio' in request.files:
            audio_file = request.files['audio']
            audio_data = audio_file.read()
            
            # Detect format from filename
            if audio_file.filename:
                file_ext = audio_file.filename.split('.')[-1].lower()
                if file_ext in ['wav', 'mp3', 'webm', 'm4a']:
                    audio_format = file_ext
        
        # Handle base64 encoded data
        elif request.json and 'audio_data' in request.json:
            try:
                audio_data = base64.b64decode(request.json['audio_data'])
            except Exception as e:
                return jsonify({
                    "error": "Invalid base64 audio data",
                    "message": str(e)
                }), 400
        
        # Adjust processing based on quality level
        if quality_level == 'premium':
            noise_filter.sample_rate = 48000
        elif quality_level == 'high':
            noise_filter.sample_rate = 44100
        else:
            noise_filter.sample_rate = 22050
        
        logger.info(f"Processing audio: format={audio_format}, quality={quality_level}")
        
        # Process audio
        processed_audio, processing_info = noise_filter.process_audio(audio_data, audio_format)
        
        # Calculate processing time
        processing_time = time.time() - start_time
        processing_info['processing_time_seconds'] = processing_time
        
        # Encode processed audio as base64 for JSON response
        processed_audio_b64 = base64.b64encode(processed_audio).decode('utf-8')
        
        logger.info(f"Audio processing completed in {processing_time:.2f}s")
        
        return jsonify({
            "success": True,
            "processed_audio": processed_audio_b64,
            "processing_info": processing_info,
            "original_format": audio_format,
            "output_format": "wav",
            "quality_level": quality_level
        })
        
    except Exception as e:
        logger.error(f"Audio processing error: {e}")
        return jsonify({
            "error": "Audio processing failed",
            "message": str(e)
        }), 500

@app.route('/process-audio-file', methods=['POST'])
def process_audio_file():
    """Process audio and return as downloadable file"""
    try:
        if 'audio' not in request.files:
            return jsonify({
                "error": "No audio file provided"
            }), 400
        
        audio_file = request.files['audio']
        audio_data = audio_file.read()
        
        # Detect format
        audio_format = 'webm'
        if audio_file.filename:
            file_ext = audio_file.filename.split('.')[-1].lower()
            if file_ext in ['wav', 'mp3', 'webm', 'm4a']:
                audio_format = file_ext
        
        # Process audio
        processed_audio, processing_info = noise_filter.process_audio(audio_data, audio_format)
        
        # Create response file
        audio_buffer = io.BytesIO(processed_audio)
        audio_buffer.seek(0)
        
        return send_file(
            audio_buffer,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'filtered_{audio_file.filename or "audio"}.wav'
        )
        
    except Exception as e:
        logger.error(f"File processing error: {e}")
        return jsonify({
            "error": "File processing failed",
            "message": str(e)
        }), 500

@app.route('/analyze-noise', methods=['POST'])
def analyze_noise():
    """Analyze noise characteristics without processing"""
    try:
        if 'audio' not in request.files and 'audio_data' not in request.json:
            return jsonify({
                "error": "No audio data provided"
            }), 400
        
        # Get audio data (same logic as process_audio)
        if 'audio' in request.files:
            audio_file = request.files['audio']
            audio_data = audio_file.read()
            audio_format = 'webm'
            if audio_file.filename:
                file_ext = audio_file.filename.split('.')[-1].lower()
                if file_ext in ['wav', 'mp3', 'webm', 'm4a']:
                    audio_format = file_ext
        else:
            audio_data = base64.b64decode(request.json['audio_data'])
            audio_format = request.json.get('format', 'webm')
        
        # Load and analyze audio
        audio_array, sr = noise_filter.load_audio(audio_data, audio_format)
        noise_profile = noise_filter.estimate_noise_profile(audio_array, sr)
        
        # Calculate noise characteristics
        noise_level_db = 20 * np.log10(np.std(noise_profile) + 1e-10)
        signal_level_db = 20 * np.log10(np.std(audio_array) + 1e-10)
        estimated_snr = signal_level_db - noise_level_db
        
        # Frequency analysis
        freqs, psd = scipy.signal.welch(audio_array, fs=sr, nperseg=1024)
        dominant_freq = freqs[np.argmax(psd)]
        
        analysis_result = {
            "audio_duration_seconds": len(audio_array) / sr,
            "sample_rate": sr,
            "noise_level_db": float(noise_level_db),
            "signal_level_db": float(signal_level_db),
            "estimated_snr_db": float(estimated_snr),
            "dominant_frequency_hz": float(dominant_freq),
            "recommended_processing": {
                "noise_reduction_needed": estimated_snr < 10,
                "spectral_filtering_recommended": dominant_freq < 100 or dominant_freq > 8000,
                "voice_activity_detection_recommended": estimated_snr < 5
            }
        }
        
        return jsonify({
            "success": True,
            "analysis": analysis_result
        })
        
    except Exception as e:
        logger.error(f"Noise analysis error: {e}")
        return jsonify({
            "error": "Noise analysis failed",
            "message": str(e)
        }), 500

@app.route('/settings', methods=['GET', 'POST'])
def audio_settings():
    """Get or update audio processing settings"""
    if request.method == 'GET':
        return jsonify({
            "current_settings": {
                "sample_rate": noise_filter.sample_rate,
                "vad_aggressiveness": noise_filter.vad.get_mode() if hasattr(noise_filter.vad, 'get_mode') else 2,
                "processing_steps": [
                    "Noise profile estimation",
                    "Primary noise reduction", 
                    "Spectral subtraction",
                    "Breathing-specific filtering",
                    "Voice activity detection",
                    "Adaptive Wiener filtering",
                    "Audio normalization"
                ]
            }
        })
    
    elif request.method == 'POST':
        try:
            settings = request.json
            
            # Update sample rate if provided
            if 'sample_rate' in settings:
                new_rate = int(settings['sample_rate'])
                if new_rate in [16000, 22050, 44100, 48000]:
                    noise_filter.sample_rate = new_rate
                else:
                    return jsonify({
                        "error": "Invalid sample rate",
                        "message": "Supported rates: 16000, 22050, 44100, 48000"
                    }), 400
            
            # Update VAD settings if provided
            if 'vad_aggressiveness' in settings:
                aggressiveness = int(settings['vad_aggressiveness'])
                if 0 <= aggressiveness <= 3:
                    noise_filter.vad = webrtcvad.Vad(aggressiveness)
                else:
                    return jsonify({
                        "error": "Invalid VAD aggressiveness",
                        "message": "Must be between 0-3"
                    }), 400
            
            return jsonify({
                "success": True,
                "message": "Settings updated successfully",
                "updated_settings": {
                    "sample_rate": noise_filter.sample_rate,
                    "vad_aggressiveness": aggressiveness if 'vad_aggressiveness' in settings else 2
                }
            })
            
        except Exception as e:
            return jsonify({
                "error": "Settings update failed",
                "message": str(e)
            }), 500

@app.errorhandler(413)
def file_too_large(error):
    """Handle file size errors"""
    return jsonify({
        "error": "File too large",
        "message": "Audio file must be smaller than 50MB"
    }), 413

@app.errorhandler(500)
def internal_error(error):
    """Handle internal server errors"""
    logger.error(f"Internal server error: {error}")
    return jsonify({
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }), 500

if __name__ == '__main__':
    # Set max file size to 50MB
    app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
    
    # Run server
    port = int(os.environ.get('PORT', 5001))
    debug = os.environ.get('FLASK_ENV') == 'development'
    
    logger.info(f"Starting BreatheMate Audio Processor on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)