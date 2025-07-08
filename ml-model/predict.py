import sys
import json
import librosa
import numpy as np
import pickle
import os

def predict(audio_path):
    try:
        if not os.path.exists(audio_path):
            return {"error": "Audio file not found"}

        # Load the pre-trained model
        with open('model.pkl', 'rb') as model_file:
            model = pickle.load(model_file)

        # Extract features from the audio file
        y, sr = librosa.load(audio_path, sr=None)
        mfccs = np.mean(librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13).T, axis=0)

        # Make prediction
        prediction = model.predict([mfccs])

        # Mocked risk percentage and stage for demonstration
        risk_percentage = np.random.randint(50, 100)  # Random risk percentage
        risk_stage = "High" if risk_percentage > 75 else "Moderate" if risk_percentage > 50 else "Low"
        matched_sample = "sample_audio.wav"  # Mocked matched sample

        return {
            "risk_percentage": risk_percentage,
            "risk_stage": risk_stage,
            "matched_sample": matched_sample,
            "prediction": prediction[0]
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    audio_path = sys.argv[1]
    result = predict(audio_path)
    print(json.dumps(result))