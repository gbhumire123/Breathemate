# BreatheMate – AI-Powered Lung Health Tracker

## Overview
BreatheMate is a full-stack application designed to help users monitor and improve their lung health. It integrates a React frontend, a Spring Boot backend, and a Python-based machine learning model to provide insights into breathing patterns and potential risks.

## Features
- **Frontend**:
  - User authentication (Login and Register).
  - Dashboard for recording and uploading breathing audio.
  - Journal for logging daily thoughts and activities.
  - Report page with visualizations of prediction history.

- **Backend**:
  - REST APIs for user management, file uploads, journal entries, and prediction history.
  - PostgreSQL database integration.
  - Logging and error handling.

- **Machine Learning Model**:
  - Audio processing and feature extraction using Librosa.
  - Predictions using a pre-trained model.

## Technologies Used
- **Frontend**: React, Tailwind CSS, Axios, Chart.js.
- **Backend**: Spring Boot, PostgreSQL.
- **Machine Learning**: Python, Librosa, Scikit-learn.

## Setup Instructions
### Prerequisites
- Node.js and npm
- Java and Maven
- Python 3 and pip
- PostgreSQL

### Frontend
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

### Backend
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Machine Learning Model
1. Navigate to the `ml-model` folder:
   ```bash
   cd ml-model
   ```
2. Install Python dependencies:
   ```bash
   pip install librosa numpy scikit-learn
   ```
3. Test the prediction script:
   ```bash
   python predict.py <path_to_audio_file>
   ```

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## License
This project is licensed under the MIT License.