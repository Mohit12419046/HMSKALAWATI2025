import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
import json
from datetime import datetime
from models import get_patients, get_caretakers, get_hospitality, get_checkups, get_bills

# Email configuration (you'll need to set these up)
SMTP_SERVER = "smtp.gmail.com"  # or your email provider
SMTP_PORT = 587
SENDER_EMAIL = "your-email@gmail.com"  # Replace with your email
SENDER_PASSWORD = "your-app-password"  # Replace with app password

# SMS configuration (Twilio example)
TWILIO_ACCOUNT_SID = "your-twilio-sid"  # Replace with your Twilio SID
TWILIO_AUTH_TOKEN = "your-twilio-token"  # Replace with your Twilio token
TWILIO_PHONE_NUMBER = "+1234567890"  # Replace with your Twilio number

def send_email_notification(recipient_email, subject, message, patient_data=None):
    """
    Send email notification to patient with their health data.
    """
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SENDER_EMAIL
        msg['To'] = recipient_email
        msg['Subject'] = subject

        # Email body
        body = f"""
        Dear Patient,

        {message}

        """

        if patient_data:
            body += f"""

        Patient Details:
        Name: {patient_data.get('name', 'N/A')}
        Date of Birth: {patient_data.get('dob', 'N/A')}
        Phone: {patient_data.get('phone', 'N/A')}
        Email: {patient_data.get('email', 'N/A')}

        """

        body += f"""

        Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

        Thank you for choosing our healthcare services.
        For any questions, please contact our support team.

        Best regards,
        Health Management System
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        text = msg.as_string()
        server.sendmail(SENDER_EMAIL, recipient_email, text)
        server.quit()

        return {"status": "success", "message": "Email sent successfully"}

    except Exception as e:
        return {"status": "error", "message": f"Failed to send email: {str(e)}"}

def send_sms_notification(phone_number, message):
    """
    Send SMS notification using Twilio.
    """
    try:
        url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
        data = {
            'From': TWILIO_PHONE_NUMBER,
            'To': phone_number,
            'Body': message
        }
        response = requests.post(url, data=data, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN))

        if response.status_code == 201:
            return {"status": "success", "message": "SMS sent successfully"}
        else:
            return {"status": "error", "message": f"Failed to send SMS: {response.text}"}

    except Exception as e:
        return {"status": "error", "message": f"Failed to send SMS: {str(e)}"}

def send_patient_report_email(patient_id, patient_data, report_data=None):
    """
    Send comprehensive patient report via email.
    """
    subject = f"Health Report for {patient_data.get('name', 'Patient')}"

    message = """
    Please find your comprehensive health report attached.

    This report includes:
    - Your personal and medical information
    - Caretaker/Family contact details
    - Hospital stay information
    - Medical checkup results
    - Billing details and statements

    Please review this information carefully. If you have any questions or concerns,
    please contact our healthcare team.
    """

    if report_data:
        message += f"""

        Recent Checkup Results:
        """
        for checkup in report_data.get('checkups', []):
            message += f"- {checkup.get('test_name', 'Test')}: {checkup.get('value', 'N/A')} {checkup.get('unit', '')}\n"

    return send_email_notification(patient_data.get('email'), subject, message, patient_data)

def send_appointment_reminder(patient_email, patient_name, appointment_details):
    """
    Send appointment reminder via email.
    """
    subject = "Appointment Reminder"

    message = f"""
    Dear {patient_name},

    This is a reminder for your upcoming appointment:

    Date & Time: {appointment_details.get('datetime', 'N/A')}
    Doctor: {appointment_details.get('doctor', 'N/A')}
    Type: {appointment_details.get('type', 'N/A')}
    Notes: {appointment_details.get('notes', 'N/A')}

    Please arrive 15 minutes early for your appointment.
    If you need to reschedule, please contact us as soon as possible.
    """

    return send_email_notification(patient_email, subject, message)

def send_bill_notification(patient_email, patient_name, bill_details):
    """
    Send bill notification via email.
    """
    subject = "Your Medical Bill Statement"

    message = f"""
    Dear {patient_name},

    Your bill statement is now available.

    Bill Date: {bill_details.get('bill_date', 'N/A')[:10]}
    Total Amount: ${bill_details.get('total_amount', 0):.2f}
    Payment Status: {bill_details.get('payment_status', 'N/A').title()}

    Please find the detailed bill attached to this email.
    Payment is due within 30 days of the bill date.

    For payment options or questions about this bill, please contact our billing department.
    """

    return send_email_notification(patient_email, subject, message)

def send_checkup_results(patient_email, patient_name, checkup_results):
    """
    Send checkup results via email and SMS.
    """
    subject = "Your Medical Checkup Results"

    message = f"""
    Dear {patient_name},

    Your medical checkup results are now available.

    Results Summary:
    """

    for result in checkup_results:
        status = result.get('result_status', 'Normal')
        message += f"- {result.get('test_name', 'Test')}: {result.get('value', 'N/A')} {result.get('unit', '')} ({status})\n"

    message += """

    Please review your results carefully. If you have any questions or concerns about these results,
    please contact your healthcare provider.

    For normal results, continue with your current treatment plan.
    For abnormal results, please schedule a follow-up appointment.
    """

    # Send email
    email_result = send_email_notification(patient_email, subject, message)

    # Send SMS if phone available
    sms_result = None
    if checkup_results and checkup_results[0].get('patient_phone'):
        sms_message = f"Medical checkup results available for {patient_name}. Please check your email for details."
        sms_result = send_sms_notification(checkup_results[0]['patient_phone'], sms_message)

    return {
        "email": email_result,
        "sms": sms_result
    }

def send_reports_to_all_patients():
    """
    Send comprehensive reports to all patients via email.
    """
    try:
        patients = get_patients()
        results = []

        for patient in patients:
            patient_id = patient['id']
            patient_name = patient['name']
            patient_email = patient['email']
            if not patient_email:
                results.append({
                    "patient_id": patient_id,
                    "patient_name": patient_name,
                    "status": "error",
                    "message": "No email address found"
                })
                continue

            try:
                # Gather all patient data
                caretakers = get_caretakers(patient_id)
                hospitality = get_hospitality(patient_id)
                checkups = get_checkups(patient_id)
                bills = get_bills(patient_id)

                # Send the comprehensive report
                result = send_patient_report_email(patient_id, patient, {
                    "caretakers": caretakers,
                    "hospitality": hospitality,
                    "checkups": checkups,
                    "bills": bills
                })

                results.append({
                    "patient_id": patient_id,
                    "patient_name": patient_name,
                    "email": patient_email,
                    "status": result.get("status"),
                    "message": result.get("message")
                })

            except Exception as e:
                results.append({
                    "patient_id": patient_id,
                    "patient_name": patient_name,
                    "email": patient_email,
                    "status": "error",
                    "message": f"Failed to send report: {str(e)}"
                })

        return {
            "status": "completed",
            "total_patients": len(patients),
            "results": results
        }

    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to send reports to all patients: {str(e)}"
        }

def send_comprehensive_patient_data_email(patient_id, patient_data, include_all_data=True):
    """
    Send comprehensive patient data via email with option to include all health records.
    """
    subject = f"Complete Health Data Report for {patient_data.get('name', 'Patient')}"

    message = f"""
    Dear {patient_data.get('name', 'Patient')},

    Please find your complete health data report attached.

    This comprehensive report includes:
    """

    if include_all_data:
        message += """
    - Personal Information
    - Emergency Contact Details
    - Caretaker/Family Information
    - Hospital Stay Records
    - Medical Checkup Results
    - Medication History
    - Vital Signs History
    - Symptom Logs
    - Appointment History
    - Billing and Payment Records
    - Wellness Scores and Trends
    - AI Health Insights
    - Community Participation
    - Quiz Performance and Learning Progress
    - Diet Plans and Nutritional Information
    - Medication Interaction Analysis
    """
    else:
        message += """
    - Personal Information
    - Emergency Contact Details
    - Recent Medical Checkup Results
    - Current Medications
    - Upcoming Appointments
    - Recent Billing Information
    """

    message += f"""

    This report provides a complete overview of your health journey and medical history.
    Please review this information carefully and keep it for your records.

    If you have any questions about the data or need clarification on any medical terms,
    please contact our healthcare team.

    Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

    Thank you for trusting us with your healthcare needs.

    Best regards,
    Health Management System Team
    """

    return send_email_notification(patient_data.get('email'), subject, message, patient_data)
