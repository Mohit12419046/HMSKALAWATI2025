# TODO: Make Login Page Workable with Any Email/Password

## Current Task: Modify Login Endpoint to Bypass Authentication

### Steps:
1. [ ] Modify `/api/login` endpoint in `HMS/app.py` to accept any email/password combination
2. [ ] Return success response with dummy user object
3. [ ] Test login functionality with any credentials

### Information Gathered:
- Frontend sends POST to `http://127.0.0.1:5000/api/login` with email/password
- Current endpoint validates against users table with hashed passwords
- Need to bypass validation and always return success

### Dependent Files:
- `HMS/app.py` (modify login endpoint)

### Followup Steps:
- Test login with any email/password combination
- Verify dashboard loads after login
