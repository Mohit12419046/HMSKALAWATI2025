# Health Management System (HMS)

A comprehensive web-based Health Management System built with Flask (backend) and vanilla JavaScript (frontend). It provides hospitals with tools to manage patient records, admissions, inventory, billing, and generate AI-assisted health reports.

## Features

### Core Features
- **Patient Management**: Complete patient registration with demographics, medical history, insurance, and emergency contacts
- **Admission Management**: Track patient admissions with ward, room, bed assignments and diagnosis details
- **Vitals Tracking**: Log and monitor blood pressure, heart rate, temperature, blood glucose, and other vital signs
- **Symptoms Logging**: Record symptoms with severity levels, categories, and detailed descriptions
- **Medications Management**: Track prescriptions, dosages, schedules, and medication history
- **Appointments Scheduling**: Book and manage doctor appointments with department and priority settings
- **Inventory Management**: Manage medical supplies, medications, and equipment with stock tracking
- **Billing System**: Generate invoices, track payments, and manage insurance claims
- **Reports Generation**: Generate comprehensive PDF health reports for patients
- **Emergency Alerts**: Real-time monitoring of critical vitals and symptoms with colorful alerts

### Advanced Features
- **AI Health Reports**: Generate AI-assisted health analysis based on symptoms
- **Analytics Dashboard**: Interactive charts and graphs for trends analysis
- **Real-time Monitoring**: Live vitals display and emergency alert system
- **Comprehensive Forms**: Detailed forms for all aspects of patient care
- **Responsive Design**: Mobile-friendly interface with professional styling
- **Data Export**: JSON-based patient record storage (KALAWATI RECORD system)

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
- **Login**: `POST /api/login` - Body: `{email, password}` - Returns user object (accepts any email/password combination).

### Patient Management
- **Patients**:
  - `POST /api/patients` - Create patient: `{name, email, phone, dateOfBirth, gender, bloodType, allergies[], chronicConditions[], emergencyContact{...}, insurance{...}, medicalHistory[], currentMedications[], preferredDoctor, registrationDate}`
  - `GET /api/patients` - Get all patients

### Admission Management
- **Admissions**:
  - `POST /api/admissions` - Create admission: `{patientId, ward, room, bed, floor, admissionType, diagnosis, chiefComplaint, admissionDate}`
  - `GET /api/admissions` - Get all admissions with patient details

### Inventory Management
- **Inventory**:
  - `POST /api/inventory` - Add item: `{name, genericName, category, subcategory, description, manufacturer, quantity, unit, costPrice, sellingPrice, expiryDate, batchNumber, supplier, location, reorderLevel, maximumStock}`
  - `GET /api/inventory` - Get all inventory items

### Billing System
- **Billing**:
  - `POST /api/billing` - Create bill: `{patientId, invoiceNumber, date, description, amount, type, status, dueDate, paymentMethod, insuranceClaim}`
  - `GET /api/billing` - Get all bills with patient details

### Health Tracking
- **Vitals**:
  - `POST /api/vitals` - Add vital: `{patientId, type, value, unit, recordedAt, method, location, position}`
  - `GET /api/vitals/<user_id>` - Get vitals for user
  - `GET /api/vitals` - Get all vitals with patient details

- **Symptoms**:
  - `POST /api/symptoms` - Add symptom: `{patientId, name, description, severity, onset, frequency, location, category, reportedAt}`
  - `GET /api/symptoms/<user_id>` - Get symptoms for user
  - `GET /api/symptoms` - Get all symptoms with patient details

- **Medications**:
  - `POST /api/meds` - Add medication: `{patientId, name, genericName, dosage, route, frequency, duration, indication, instructions, startDate, endDate}`
  - `GET /api/meds/<user_id>` - Get medications for user

- **Appointments**:
  - `POST /api/appointments` - Book appointment: `{patientId, datetime, duration, type, priority, department, room, chiefComplaint, preparationInstructions, scheduledAt}`
  - `GET /api/appointments/<user_id>` - Get appointments for user
  - `GET /api/appointments` - Get all appointments with patient details

### Reports & Analytics
- **Reports**:
  - `GET /api/report/<user_id>` - Generate PDF health report

- **AI Reports**:
  - `POST /api/ai-reports` - Generate AI health analysis: `{patientId, symptoms}`

### Data Export
- **KALAWATI RECORD**: Comprehensive patient data is automatically saved to `KALAWATI RECORD.json` on all patient-related operations, including vitals, symptoms, medications, appointments, admissions, and billing history.

For full request/response details and field descriptions, see the code in `app.py`.

## User Guides

### Getting Started
1. Start the Flask backend: `python app.py`
2. Open `index.html` in your browser or serve it with `python -m http.server 8000`
3. Navigate using the header buttons: Dashboard, Patients, Admissions, Vitals, Symptoms, Medications, Appointments, Inventory, Billing, Reports, AI Reports, Graphs
4. Login with any email/password combination (authentication is simplified for demo purposes)

### Dashboard Overview
- View real-time statistics: total patients, current admissions, today's appointments, monthly revenue
- Monitor live vitals: blood pressure, blood glucose, body temperature
- See emergency alerts for critical vitals and symptoms
- Quick actions: add patient, new admission, book appointment, update inventory
- Department overview and recent activity feed

### Patient Management
- **Add Patient**: Complete registration form with demographics, medical history, insurance, emergency contacts, and family members
- **View Patients**: Browse all registered patients with search and filtering
- **Patient Records**: Comprehensive data including vitals, symptoms, medications, appointments, admissions, and billing history

### Admission Management
- **New Admission**: Admit patients with ward, room, bed assignments and diagnosis details
- **Track Admissions**: Monitor current admissions and patient status

### Health Tracking
- **Vitals**: Log blood pressure, heart rate, temperature, blood glucose, and other vital signs with detailed metadata
- **Symptoms**: Record symptoms with severity levels, categories, and descriptions
- **Medications**: Track prescriptions with dosages, routes, frequencies, and schedules
- **Appointments**: Book appointments with department, priority, and preparation instructions

### Administrative Functions
- **Inventory**: Manage medical supplies, medications, and equipment with stock levels and reorder points
- **Billing**: Generate invoices, track payments, and manage insurance claims
- **Reports**: Generate PDF health reports for patients
- **AI Reports**: Get AI-assisted health analysis based on symptoms
- **Analytics**: View interactive charts and graphs for trends analysis

### Data Export
- All patient data is automatically saved to `KALAWATI RECORD.json` for comprehensive record keeping
- Includes complete patient history across all modules

### Emergency Monitoring
- Real-time alerts for critical vitals (high blood pressure, fever, tachycardia, abnormal blood sugar)
- Colorful emergency notifications with patient details and timestamps
- Live monitoring dashboard with continuous updates

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
