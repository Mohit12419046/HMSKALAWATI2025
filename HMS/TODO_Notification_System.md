# Notification System Implementation Plan

## Overview
Implement a system that forwards comprehensive patient data to all user roles (admin, doctor, nurse, receptionist) when a patient is created and admitted, including all patient conditions (symptoms, vitals, medications, etc.).

## Current State Analysis
- Patient creation route exists but doesn't notify users
- Admission route exists but doesn't forward comprehensive data
- Notification system with real-time updates and email functionality already implemented
- User roles: admin, doctor, nurse, receptionist

## Implementation Plan

### 1. Create Helper Functions
- `getAllActiveUsers()`: Fetch all active users
- `sendPatientNotificationToAllUsers(patientId, notificationType, priority)`: Send notifications to all users
- `sendPatientDataEmailToAllUsers(patientId, includeAllData)`: Send comprehensive email to all users

### 2. Modify Patient Creation Route (`/api/patients`)
- After successful patient creation, trigger notifications to all users
- Send basic patient info via notifications and email

### 3. Modify Admission Route (`/api/admissions`)
- After successful admission, trigger comprehensive notifications
- Include all patient data: vitals, symptoms, medications, appointments, billing, etc.
- Send detailed email with complete patient profile

### 4. Notification Types
- `patient_created`: When new patient is registered
- `patient_admitted`: When patient is admitted with full data

### 5. Email Content
- Patient basic information
- Admission details (if applicable)
- Current medications
- Recent vitals
- Active symptoms
- Upcoming appointments
- Billing status

## Testing Requirements
- Test patient creation notifications
- Test admission notifications with comprehensive data
- Verify email delivery to all user roles
- Test real-time notifications via Socket.io

## Dependencies
- Existing notification system
- Email transporter setup
- User and patient models
- All related data models (Admission, Vital, Symptom, Medication, etc.)
