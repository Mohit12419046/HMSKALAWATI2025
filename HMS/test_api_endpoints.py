import requests
import json

BASE_URL = "http://127.0.0.1:5000/api"

def test_get_patients():
    """Test GET /api/patients"""
    try:
        response = requests.get(f"{BASE_URL}/patients")
        print(f"GET /api/patients: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Retrieved {len(data)} patients")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_get_patients: {e}")
        return False

def test_post_patient():
    """Test POST /api/patients"""
    test_patient = {
        "name": "Test Patient",
        "email": "test@example.com",
        "phone": "1234567890",
        "dateOfBirth": "1990-01-01",
        "gender": "Male",
        "bloodType": "O+",
        "allergies": ["Peanuts"],
        "chronicConditions": ["None"],
        "emergencyContact": {
            "name": "Emergency Contact",
            "phone": "0987654321",
            "relationship": "Spouse"
        },
        "insurance": {
            "provider": "Test Insurance",
            "policyNumber": "POL123",
            "coverage": "Full"
        },
        "medicalHistory": ["No major issues"],
        "currentMedications": ["None"],
        "preferredDoctor": "Dr. Smith",
        "registrationDate": "2024-01-01"
    }

    try:
        response = requests.post(f"{BASE_URL}/patients", json=test_patient)
        print(f"POST /api/patients: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"Created patient with ID: {data.get('id')}")
            return data.get('id')
        else:
            print(f"Error: {response.text}")
            return None
    except Exception as e:
        print(f"Exception in test_post_patient: {e}")
        return None

def test_post_vital(patient_id):
    """Test POST /api/vitals"""
    test_vital = {
        "patientId": patient_id,
        "type": "Blood Pressure",
        "value": "120/80",
        "unit": "mmHg",
        "recordedAt": "2024-01-01T10:00:00Z"
    }

    try:
        response = requests.post(f"{BASE_URL}/vitals", json=test_vital)
        print(f"POST /api/vitals: {response.status_code}")
        if response.status_code == 201:
            print("Vital recorded successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_post_vital: {e}")
        return False

def test_post_symptom(patient_id):
    """Test POST /api/symptoms"""
    test_symptom = {
        "patientId": patient_id,
        "name": "Headache",
        "severity": 3,
        "onset": "sudden",
        "frequency": "occasional",
        "location": "head",
        "category": "neurological",
        "reportedAt": "2024-01-01T10:00:00Z"
    }

    try:
        response = requests.post(f"{BASE_URL}/symptoms", json=test_symptom)
        print(f"POST /api/symptoms: {response.status_code}")
        if response.status_code == 201:
            print("Symptom recorded successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_post_symptom: {e}")
        return False

def test_post_medication(patient_id):
    """Test POST /api/meds"""
    test_med = {
        "patientId": patient_id,
        "name": "Aspirin",
        "dose": "100mg",
        "schedule": "Once daily",
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "notes": "For headache",
        "prescribedAt": "2024-01-01T10:00:00Z"
    }

    try:
        response = requests.post(f"{BASE_URL}/meds", json=test_med)
        print(f"POST /api/meds: {response.status_code}")
        if response.status_code == 201:
            print("Medication recorded successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_post_medication: {e}")
        return False

def test_post_appointment(patient_id):
    """Test POST /api/appointments"""
    test_appt = {
        "patientId": patient_id,
        "doctor": "Dr. Smith",
        "datetime": "2024-01-15T14:00:00Z",
        "type": "follow-up",
        "notes": "Follow-up visit",
        "scheduledAt": "2024-01-01T10:00:00Z"
    }

    try:
        response = requests.post(f"{BASE_URL}/appointments", json=test_appt)
        print(f"POST /api/appointments: {response.status_code}")
        if response.status_code == 201:
            print("Appointment recorded successfully")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_post_appointment: {e}")
        return False

def test_get_all_vitals():
    """Test GET /api/vitals"""
    try:
        response = requests.get(f"{BASE_URL}/vitals")
        print(f"GET /api/vitals: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Retrieved {len(data)} vitals with patient info")
            return True
        else:
            print(f"Error: {response.text}")
            return False
    except Exception as e:
        print(f"Exception in test_get_all_vitals: {e}")
        return False

def main():
    print("Starting API endpoint tests...")
    print("=" * 50)

    # Test GET patients
    if not test_get_patients():
        print("Failed to get patients")
        return

    # Test POST patient
    patient_id = test_post_patient()
    if not patient_id:
        print("Failed to create test patient")
        return

    print(f"Created test patient with ID: {patient_id}")
    print("=" * 50)

    # Test POST endpoints
    tests = [
        ("Vitals", lambda: test_post_vital(patient_id)),
        ("Symptoms", lambda: test_post_symptom(patient_id)),
        ("Medications", lambda: test_post_medication(patient_id)),
        ("Appointments", lambda: test_post_appointment(patient_id)),
    ]

    for test_name, test_func in tests:
        print(f"Testing {test_name}...")
        if not test_func():
            print(f"Failed {test_name} test")
        print("-" * 30)

    # Test GET all vitals
    print("Testing GET all vitals...")
    if not test_get_all_vitals():
        print("Failed GET all vitals test")

    print("=" * 50)
    print("API testing completed!")

if __name__ == "__main__":
    main()
