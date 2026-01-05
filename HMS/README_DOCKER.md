# Health Management System - Docker Deployment

This guide explains how to deploy the Health Management System using Docker.

## Prerequisites

1. **Install Docker**: Download and install Docker from https://docker.com
2. **Install Docker Compose** (optional, for easier deployment)

## Quick Start with Docker Compose

1. **Navigate to the project directory**:
   ```bash
   cd HMS
   ```

2. **Build and run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Open your browser and go to: http://localhost:5000
   - The application will be running in a Docker container

## Manual Docker Commands

If you prefer to use Docker directly:

1. **Build the Docker image**:
   ```bash
   docker build -t hms-app .
   ```

2. **Run the container**:
   ```bash
   docker run -p 5000:5000 -v $(pwd)/data:/app/data hms-app
   ```

3. **Access the application**:
   - Open your browser and go to: http://localhost:5000

## Docker Configuration

### Dockerfile Features:
- Uses Python 3.9 slim image for smaller size
- Installs all required Python dependencies
- Exposes port 5000 for the Flask application
- Includes proper environment variables for Flask

### docker-compose.yml Features:
- Automatic container building
- Port mapping (5000:5000)
- Volume mounting for persistent data
- Health checks to ensure the app is running
- Automatic restart policy

## Data Persistence

The application data (SQLite database) is stored in the `./data` directory, which is mounted as a volume in the container. This ensures your data persists between container restarts.

## Troubleshooting

1. **Port already in use**: Change the port mapping in docker-compose.yml
2. **Permission issues**: Make sure Docker has proper permissions
3. **Build fails**: Check that all required files are present

## Production Deployment

For production deployment, consider:
- Using environment variables for configuration
- Setting up proper logging
- Adding SSL/TLS certificates
- Using a reverse proxy like Nginx
- Setting up database backups

## API Endpoints

Once running, the application provides these endpoints:
- `GET /` - Main application interface
- `POST /api/login` - User authentication
- `GET/POST /api/patients` - Patient management
- `GET/POST /api/vitals` - Vital signs tracking
- `GET/POST /api/symptoms` - Symptom logging
- `GET/POST /api/medications` - Medication management
- `GET/POST /api/appointments` - Appointment scheduling
- `GET /api/report/<user_id>` - Health reports

The Health Management System is now containerized and ready for deployment! 🚀
