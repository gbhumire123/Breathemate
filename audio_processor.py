"""
Smart Background Noise Filter for BreatheMate
Removes background noise from breathing recordings using advanced signal processing
"""

import librosa
import numpy as np
import scipy.signal
import noisereduce as nr
from pydub import AudioSegment
from pydub.silence import split_on_silence, detect_nonsilent
import webrtcvad
import soundfile as sf
from sklearn.preprocessing import StandardScaler
import logging
from typing import Tuple, Optional, Dict, Any
import io
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SmartNoiseFilter:
    """Advanced noise filtering for breathing audio recordings"""
    
    def __init__(self, sample_rate: int = 44100):
        self.sample_rate = sample_rate
        self.vad = webrtcvad.Vad(2)  # Aggressiveness level 2 (0-3)
        self.noise_profile = None
        
    def load_audio(self, audio_data: bytes, format: str = 'webm') -> Tuple[np.ndarray, int]:
        """Load audio from bytes with format detection"""
        try:
            # Create temporary file for pydub to process
            with tempfile.NamedTemporaryFile(suffix=f'.{format}', delete=False) as temp_file:
                temp_file.write(audio_data)
                temp_file.flush()
                
                # Load with pydub
                audio = AudioSegment.from_file(temp_file.name, format=format)
                
                # Convert to mono and set sample rate
                audio = audio.set_channels(1).set_frame_rate(self.sample_rate)
                
                # Convert to numpy array
                audio_array = np.array(audio.get_array_of_samples(), dtype=np.float32)
                audio_array = audio_array / np.max(np.abs(audio_array))  # Normalize
                
                # Clean up temp file
                os.unlink(temp_file.name)
                
                return audio_array, self.sample_rate
                
        except Exception as e:
            logger.error(f"Error loading audio: {e}")
            # Fallback to librosa
            try:
                audio_array, sr = librosa.load(io.BytesIO(audio_data), sr=self.sample_rate)
                return audio_array, sr
            except Exception as e2:
                logger.error(f"Fallback audio loading failed: {e2}")
                raise
    
    def estimate_noise_profile(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Estimate noise profile from silent segments"""
        try:
            # Convert to AudioSegment for silence detection
            audio_int16 = (audio * 32767).astype(np.int16)
            audio_segment = AudioSegment(
                audio_int16.tobytes(),
                frame_rate=sr,
                sample_width=2,
                channels=1
            )
            
            # Detect silent segments (potential noise-only regions)
            silent_chunks = split_on_silence(
                audio_segment,
                min_silence_len=200,  # 200ms minimum silence
                silence_thresh=audio_segment.dBFS - 20,  # 20dB below average
                keep_silence=100  # Keep 100ms of silence
            )
            
            if len(silent_chunks) > 0:
                # Use first silent chunk as noise profile
                noise_segment = silent_chunks[0][:1000]  # First 1 second
                noise_array = np.array(noise_segment.get_array_of_samples(), dtype=np.float32)
                noise_array = noise_array / 32767.0
            else:
                # Fallback: use first 0.5 seconds as noise estimate
                noise_length = min(int(0.5 * sr), len(audio) // 4)
                noise_array = audio[:noise_length]
            
            return noise_array
            
        except Exception as e:
            logger.warning(f"Noise profile estimation failed: {e}")
            # Simple fallback: use first 0.5 seconds
            noise_length = min(int(0.5 * sr), len(audio) // 4)
            return audio[:noise_length]
    
    def spectral_subtraction(self, audio: np.ndarray, noise_profile: np.ndarray, 
                           alpha: float = 2.0, beta: float = 0.01) -> np.ndarray:
        """Apply spectral subtraction noise reduction"""
        try:
            # Compute STFTs
            n_fft = 2048
            hop_length = 512
            
            # Audio STFT
            audio_stft = librosa.stft(audio, n_fft=n_fft, hop_length=hop_length)
            audio_mag = np.abs(audio_stft)
            audio_phase = np.angle(audio_stft)
            
            # Noise STFT
            noise_stft = librosa.stft(noise_profile, n_fft=n_fft, hop_length=hop_length)
            noise_mag = np.abs(noise_stft)
            
            # Estimate noise spectrum (average over time)
            noise_spectrum = np.mean(noise_mag, axis=1, keepdims=True)
            
            # Spectral subtraction
            clean_mag = audio_mag - alpha * noise_spectrum
            
            # Apply spectral floor to avoid artifacts
            clean_mag = np.maximum(clean_mag, beta * audio_mag)
            
            # Reconstruct signal
            clean_stft = clean_mag * np.exp(1j * audio_phase)
            clean_audio = librosa.istft(clean_stft, hop_length=hop_length)
            
            return clean_audio
            
        except Exception as e:
            logger.warning(f"Spectral subtraction failed: {e}")
            return audio
    
    def adaptive_wiener_filter(self, audio: np.ndarray, noise_power_ratio: float = 0.1) -> np.ndarray:
        """Apply adaptive Wiener filtering"""
        try:
            # Compute spectrogram
            f, t, Zxx = scipy.signal.stft(audio, fs=self.sample_rate, nperseg=1024)
            
            # Estimate signal and noise power
            signal_power = np.mean(np.abs(Zxx) ** 2, axis=1, keepdims=True)
            noise_power = noise_power_ratio * signal_power
            
            # Wiener filter
            wiener_gain = signal_power / (signal_power + noise_power)
            
            # Apply filter
            filtered_stft = Zxx * wiener_gain
            
            # Reconstruct signal
            _, filtered_audio = scipy.signal.istft(filtered_stft, fs=self.sample_rate)
            
            return filtered_audio
            
        except Exception as e:
            logger.warning(f"Wiener filtering failed: {e}")
            return audio
    
    def voice_activity_detection(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Remove non-speech segments using WebRTC VAD"""
        try:
            # Convert to 16kHz for WebRTC VAD
            if sr != 16000:
                audio_16k = librosa.resample(audio, orig_sr=sr, target_sr=16000)
            else:
                audio_16k = audio
            
            # Convert to 16-bit PCM
            audio_int16 = (audio_16k * 32767).astype(np.int16)
            
            # Process in 30ms frames
            frame_duration = 30  # ms
            frame_size = int(16000 * frame_duration / 1000)
            
            speech_frames = []
            for i in range(0, len(audio_int16) - frame_size, frame_size):
                frame = audio_int16[i:i + frame_size]
                
                # Check if frame contains speech
                if self.vad.is_speech(frame.tobytes(), 16000):
                    speech_frames.extend(frame)
                else:
                    # Add silence or reduced volume for non-speech
                    speech_frames.extend((frame * 0.1).astype(np.int16))
            
            # Convert back to float and resample to original rate
            speech_audio = np.array(speech_frames, dtype=np.float32) / 32767.0
            
            if sr != 16000:
                speech_audio = librosa.resample(speech_audio, orig_sr=16000, target_sr=sr)
            
            return speech_audio
            
        except Exception as e:
            logger.warning(f"VAD processing failed: {e}")
            return audio
    
    def breathing_specific_filter(self, audio: np.ndarray, sr: int) -> np.ndarray:
        """Apply breathing-specific filtering"""
        try:
            # Breathing typically occurs in 0.1 - 5 Hz range
            # But we want to preserve speech frequencies (80-8000 Hz) for voice analysis
            
            # High-pass filter to remove very low frequency noise
            sos_hp = scipy.signal.butter(4, 20, btype='high', fs=sr, output='sos')
            audio = scipy.signal.sosfilt(sos_hp, audio)
            
            # Low-pass filter to remove high frequency noise above human voice
            sos_lp = scipy.signal.butter(4, 8000, btype='low', fs=sr, output='sos')
            audio = scipy.signal.sosfilt(sos_lp, audio)
            
            # Notch filter for common electrical noise (50/60 Hz)
            for freq in [50, 60]:
                sos_notch = scipy.signal.iirnotch(freq, 30, fs=sr)
                audio = scipy.signal.sosfilt(sos_notch, audio)
            
            return audio
            
        except Exception as e:
            logger.warning(f"Breathing-specific filtering failed: {e}")
            return audio
    
    def normalize_audio(self, audio: np.ndarray) -> np.ndarray:
        """Normalize audio while preserving dynamics"""
        try:
            # RMS normalization
            rms = np.sqrt(np.mean(audio ** 2))
            if rms > 0:
                target_rms = 0.1  # Target RMS level
                audio = audio * (target_rms / rms)
            
            # Prevent clipping
            max_val = np.max(np.abs(audio))
            if max_val > 0.95:
                audio = audio * (0.95 / max_val)
            
            return audio
            
        except Exception as e:
            logger.warning(f"Audio normalization failed: {e}")
            return audio
    
    def process_audio(self, audio_data: bytes, format: str = 'webm') -> Tuple[bytes, Dict[str, Any]]:
        """Main processing pipeline with smart noise filtering"""
        try:
            # Load audio
            audio, sr = self.load_audio(audio_data, format)
            original_length = len(audio)
            
            logger.info(f"Processing audio: {len(audio)} samples at {sr} Hz")
            
            # Step 1: Estimate noise profile
            noise_profile = self.estimate_noise_profile(audio, sr)
            
            # Step 2: Apply noisereduce library (fast and effective)
            audio_nr = nr.reduce_noise(y=audio, sr=sr, stationary=False, prop_decrease=0.8)
            
            # Step 3: Spectral subtraction for additional noise reduction
            audio_ss = self.spectral_subtraction(audio_nr, noise_profile)
            
            # Step 4: Breathing-specific filtering
            audio_breathing = self.breathing_specific_filter(audio_ss, sr)
            
            # Step 5: Voice activity detection (optional, preserves speech)
            audio_vad = self.voice_activity_detection(audio_breathing, sr)
            
            # Step 6: Adaptive Wiener filtering
            audio_wiener = self.adaptive_wiener_filter(audio_vad)
            
            # Step 7: Final normalization
            audio_final = self.normalize_audio(audio_wiener)
            
            # Convert back to bytes
            audio_int16 = (audio_final * 32767).astype(np.int16)
            audio_segment = AudioSegment(
                audio_int16.tobytes(),
                frame_rate=sr,
                sample_width=2,
                channels=1
            )
            
            # Export as WAV for better quality
            output_buffer = io.BytesIO()
            audio_segment.export(output_buffer, format="wav")
            processed_audio_bytes = output_buffer.getvalue()
            
            # Calculate processing metrics
            noise_reduction_db = 20 * np.log10(np.std(audio) / (np.std(audio_final) + 1e-10))
            snr_improvement = self._calculate_snr_improvement(audio, audio_final)
            
            processing_info = {
                "original_length_seconds": original_length / sr,
                "sample_rate": sr,
                "noise_reduction_db": float(noise_reduction_db),
                "snr_improvement_db": float(snr_improvement),
                "processing_steps": [
                    "Noise profile estimation",
                    "Primary noise reduction",
                    "Spectral subtraction",
                    "Breathing-specific filtering",
                    "Voice activity detection",
                    "Adaptive Wiener filtering",
                    "Audio normalization"
                ],
                "output_format": "wav",
                "quality_score": self._calculate_quality_score(audio_final)
            }
            
            logger.info(f"Processing complete. Noise reduction: {noise_reduction_db:.2f} dB")
            
            return processed_audio_bytes, processing_info
            
        except Exception as e:
            logger.error(f"Audio processing failed: {e}")
            raise
    
    def _calculate_snr_improvement(self, original: np.ndarray, processed: np.ndarray) -> float:
        """Calculate SNR improvement in dB"""
        try:
            # Simple SNR estimation
            signal_power_orig = np.mean(original ** 2)
            signal_power_proc = np.mean(processed ** 2)
            
            # Estimate noise floor
            noise_floor_orig = np.percentile(np.abs(original), 10) ** 2
            noise_floor_proc = np.percentile(np.abs(processed), 10) ** 2
            
            snr_orig = 10 * np.log10(signal_power_orig / (noise_floor_orig + 1e-10))
            snr_proc = 10 * np.log10(signal_power_proc / (noise_floor_proc + 1e-10))
            
            return snr_proc - snr_orig
            
        except Exception:
            return 0.0
    
    def _calculate_quality_score(self, audio: np.ndarray) -> float:
        """Calculate audio quality score (0-100)"""
        try:
            # Simple quality metrics
            dynamic_range = np.max(audio) - np.min(audio)
            rms_level = np.sqrt(np.mean(audio ** 2))
            peak_to_rms = np.max(np.abs(audio)) / (rms_level + 1e-10)
            
            # Normalize metrics to 0-100 scale
            quality_score = min(100, max(0, 
                50 + 20 * np.log10(dynamic_range + 1e-10) + 
                30 * (1 - abs(peak_to_rms - 3) / 10)
            ))
            
            return float(quality_score)
            
        except Exception:
            return 75.0  # Default quality score