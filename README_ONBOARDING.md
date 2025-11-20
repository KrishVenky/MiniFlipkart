# User Onboarding Guide

## Overview
This guide covers the user onboarding and authentication flows in Mini Flipkart.

## Registration Flow

### Step 1: Access Signup Page
Navigate to `/signup` to access the registration form.

### Step 2: Fill Registration Form
- **Name**: Full name (2-50 characters)
- **Email**: Valid email address
- **Password**: Minimum 6 characters

### Step 3: Submit Form
Click "Sign up" button to create your account.

### Step 4: Automatic Login
Upon successful registration, you are automatically logged in and redirected to the home page.

## Login Flow

### Step 1: Access Signin Page
Navigate to `/` or `/signin` to access the login form.

### Step 2: Enter Credentials
- **Email**: Your registered email address
- **Password**: Your account password

### Step 3: Submit Form
Click "Sign in" button or press Enter to log in.

### Step 4: Redirect
Upon successful login, you are redirected to the home page with your session restored.

## Features

### Accessibility
- Full keyboard navigation support
- ARIA labels for screen readers
- Focus management
- Error announcements

### Validation
- Real-time form validation
- Clear error messages
- Client and server-side validation

### Security
- Password hashing with bcrypt
- JWT token-based authentication
- Session management
- Rate limiting on auth endpoints

## API Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### POST /api/auth/login
Login with existing credentials.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token-here",
  "data": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

## Error Handling

### Common Errors
- **400 Bad Request**: Validation errors or duplicate email
- **401 Unauthorized**: Invalid credentials
- **429 Too Many Requests**: Rate limit exceeded
- **500 Server Error**: Internal server error

### Error Response Format
```json
{
  "success": false,
  "error": "Error message here"
}
```

## Testing

### Frontend Tests
Run frontend tests:
```bash
cd frontend
npm test
```

### Backend Tests
Run backend tests:
```bash
cd backend
npm test
```

## Troubleshooting

### Cannot Register
- Check email format is valid
- Ensure password is at least 6 characters
- Verify email is not already registered

### Cannot Login
- Verify email and password are correct
- Check if account exists
- Clear browser cache and cookies

### Session Issues
- Clear browser storage
- Check JWT token expiration
- Verify backend is running

