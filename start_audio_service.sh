#!/bin/bash

# BreatheMate Audio Processing Service Startup Script

echo "🫁 Starting BreatheMate Audio Processing Service..."

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/upgrade dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Check if all dependencies are installed correctly
echo "Verifying dependencies..."
python -c "
import librosa
import pydub
import noisereduce
import flask
import numpy as np
import scipy
print('✅ All dependencies installed successfully!')
"

if [ $? -ne 0 ]; then
    echo "❌ Error installing dependencies. Please check requirements.txt"
    exit 1
fi

# Start the audio processing service
echo "🚀 Starting audio processing API on http://localhost:5001"
echo "Press Ctrl+C to stop the service"
echo ""

# Set environment variables
export FLASK_ENV=development
export PORT=5001

# Start the Flask application
python audio_api.py