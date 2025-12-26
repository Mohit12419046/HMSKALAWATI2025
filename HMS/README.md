# Health Management System (HMS)

A comprehensive web-based Health Management System built with Flask (backend) and vanilla JavaScript (frontend). It allows users to track vitals, symptoms, medications, appointments, and more, with advanced features like AI insights, communities, quizzes, and wellness tracking.

## Features

### Core Features
- **Vitals Tracking**: Log blood pressure, heart rate, temperature, etc.
- **Symptoms Logging**: Record symptoms with severity and notes.
- **Medications Management**: Track prescriptions, doses, and schedules.
- **Appointments Scheduling**: Book and manage doctor appointments.
- **Reports Generation**: Generate PDF health reports.

### Advanced Features
- **Patient Management**: Add and manage patient records, caretakers, hospitality, checkups, and bills.
- **Role-Based Access Control (RBAC)**: Support for patient, doctor, admin, caretaker roles.
- **Two-Factor Authentication (2FA)**: OTP-based login via phone.
- **Data Encryption**: Placeholder for HIPAA-compliant data handling.
- **AI-Assisted Health Insights**: Rule-based risk assessment and personalized recommendations.
- **Predictive Diagnosis**: Basic symptom pattern analysis.
- **Smart Appointment Scheduler**: Preference-based recommendations.
- **Personalized Health Tips and Wellness Score**: Calculate and track wellness scores.
- **Advanced Analytics Dashboard**: Trend analysis and predictive insights.
- **Smart Medicine Reminders**: Adaptive reminder system.
- **Healthcare Chatbot**: Basic Q&A for common health questions.
- **Patient Communities and Support Groups**: Discussion forums with moderation.
- **Daily Health Quizzes and Gamified Learning**: Quizzes with scoring and badges.
- **Dark/Light Mode Toggle**: Theme switching.
- **Voice Navigation**: Speech recognition for accessibility.
- **Enhanced Data Visualizations**: Interactive charts.
- **AI Diet Planner**: Personalized meal recommendations.
- **Drug Interaction Checker**: Real-time interaction alerts.
- **Predictive Analytics Dashboard for Doctors**: Patient risk trends.
- **Voice-to-Text for Prescriptions**: Speech-to-text integration.
- **Emergency SOS Button**: Location sharing and automated notifications.
- **Real-time Health Tracking Integration**: API for wearables (e.g., Fitbit).

## Installation

### Prerequisites
- Python 3.8+
- pip
- Optional: GCC for C extension build

### Setup
1. Clone or download the project.
2. Navigate to the `HMS` directory.
3. Run the installation script:
   ```bash
   ./install.sh
   ```
   This will:
   - Create a virtual environment.
   - Install dependencies from `requirements.txt`.
   - Build the optional C extension for health calculations.
   - Initialize the database.
   - Start the Flask backend on port 5000.
   - Serve the frontend on port 8000.

### Manual Setup (if install.sh fails)
1. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Build C extension (optional):
   ```bash
   cd cmodules
   python setup.py build_ext --inplace
   cd ..
   ```
4. Initialize database:
   ```bash
   python -c "from models import init_db; init_db()"
   ```
5. Run the backend:
   ```bash
   python app.py
   ```
6. Open `index.html` in a browser or serve it with a simple HTTP server:
   ```bash
   python -m http.server 8000
   ```

## API Documentation

The backend provides a RESTful API. Base URL: `http://127.0.0.1:5000/api`

### Authentication
- **Login**: `POST /api/login` - Body: `{email, password}` - Returns user object.
- **Generate OTP**: `POST /api/generate-otp` - Body: `{phone}` - Sends OTP.
- **Verify OTP**: `POST /api/verify-otp` - Body: `{phone, otp}` - Returns user if valid.

### Core Endpoints
- **Vitals**:
  - `POST /api/vitals` - Add vital: `{user_id, type, value, unit}`
  - `GET /api/vitals/<user_id>` - Get vitals for user.
- **Symptoms**:
  - `POST /api/symptoms` - Add symptom: `{user_id, name, system, severity, notes}`
  - `GET /api/symptoms/<user_id>` - Get symptoms.
- **Medications**:
  - `POST /api/meds` - Add med: `{user_id, name, dose, schedule, start_date, end_date, notes}`
  - `GET /api/meds/<user_id>` - Get meds.
- **Appointments**:
  - `POST /api/appointments` - Add appt: `{user_id, doctor, datetime, type, notes}`
  - `GET /api/appointments/<user_id>` - Get appts.
- **Reports**:
  - `GET /api/report/<user_id>` - Generate PDF report.
  - `GET /api/patient-report/<patient_id>` - Enhanced patient report PDF.

### Advanced Endpoints
- **Patients**: `GET/POST /api/patients`, `GET /api/patients/<id>`
- **Caretakers**: `POST /api/caretakers`, `GET /api/caretakers/<patient_id>`
- **Hospitality**: `POST /api/hospitality`, `GET /api/hospitality/<patient_id>`
- **Checkups**: `POST /api/checkups`, `GET /api/checkups/<patient_id>`
- **Bills**: `POST /api/bills`, `GET /api/bills/<patient_id>`
- **User Roles**: `GET /api/user-roles/<user_id>`, `POST /api/user-roles`
- **Communities**: `GET/POST /api/communities`, `POST /api/communities/<id>/join`, etc.
- **Quizzes**: `GET/POST /api/quizzes`, etc.
- **AI Insights**: `GET /api/ai-insights/<user_id>`, `POST /api/ai-insights`
- **Wellness Scores**: `GET /api/wellness-scores/<user_id>`, `POST /api/wellness-scores/<user_id>/calculate`
- **Emergency Contacts**: `GET/POST /api/emergency-contacts`
- **Medication Interactions**: `POST /api/medication-interactions`
- **Diet Plans**: `GET/POST /api/diet-plans`, etc.
- **Notifications**: Various endpoints for sending emails/SMS.

For full details, see the code in `app.py`.

## User Guides

### Getting Started
1. Open the frontend in your browser (e.g., `http://127.0.0.1:8000`).
2. Navigate using the header buttons: Dashboard, Vitals, Symptoms, etc.
3. Log in or use the default user (ID 1).

### Adding Data
- **Vitals**: Click "Vitals", fill form, submit.
- **Symptoms**: Select system, enter details.
- **Medications**: Add name, dose, schedule.
- **Appointments**: Book with doctor and datetime.

### Advanced Features
- **Communities**: Join or create communities, post discussions.
- **Quizzes**: Take daily quizzes for gamified learning.
- **Wellness Score**: View and calculate scores.
- **Reports**: Generate PDFs for records.

### Accessibility
- Use voice navigation for hands-free interaction.
- Toggle dark/light mode in settings (future implementation).

## Production Deployment

### Using Gunicorn
1. Install Gunicorn:
   ```bash
   pip install gunicorn
   ```
2. Run:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

### Docker (Optional)
Create a `Dockerfile`:
```
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python -c "from models import init_db; init_db()"
EXPOSE 5000
CMD ["python", "app.py"]
```
Build and run:
```bash
docker build -t hms .
docker run -p 5000:5000 hms
```

### Security Notes
- Use HTTPS in production.
- Store secrets securely (e.g., via environment variables).
- Implement proper encryption for sensitive data.
- Regular security audits recommended.

## Contributing
- Fork the repo, make changes, submit PRs.
- Ensure tests pass (run `python test_db.py` for basic checks).

## License
MIT License.
