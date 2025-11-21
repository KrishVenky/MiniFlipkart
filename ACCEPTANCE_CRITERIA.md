# MF-13: Onboarding Acceptance Criteria

## Overview
This document defines acceptance criteria for user onboarding and login flows in Mini Flipkart.

## Current Implementation Analysis

### Frontend Components
- **Location**: `frontend/Components/Signin.js`
- **Current Features**:
  - Email/password login form
  - Basic email validation (requires @ and .com)
  - Password length validation (minimum 4 characters)
  - Google sign-in placeholder
  - Loading states during authentication

### Backend Routes
- **Location**: `backend/routes/auth.js`
- **Current Endpoints**:
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login
  - `GET /api/auth/me` - Get current user
  - `PUT /api/auth/updatepassword` - Update password

## Acceptance Criteria

### Registration Flow (AC-1)
**Given** a new user visits the signup page
**When** they provide valid name, email, and password (min 6 chars)
**Then**:
- User account is created in database
- JWT token is returned
- User is redirected to home page
- Session persists across page refreshes

### Login Flow (AC-2)
**Given** a registered user visits the signin page
**When** they provide correct email and password
**Then**:
- JWT token is returned
- User data is stored in session
- User is redirected to home page
- Previous cart/wishlist state is restored

### Error Handling (AC-3)
**Given** invalid credentials are submitted
**When** login/registration fails
**Then**:
- Clear error message is displayed
- Form remains accessible for retry
- No sensitive information is exposed in errors

### Social Authentication (AC-4)
**Given** user clicks "Sign in with Google"
**When** OAuth flow completes
**Then**:
- User account is created/linked if needed
- Session is established
- User is redirected appropriately

## Entry Conditions
- MongoDB connection established
- JWT_SECRET configured in environment
- Frontend can reach backend API

## Exit Conditions
- All acceptance tests pass
- Documentation updated
- Code review approved

## Dependencies
- User model schema defined
- Authentication middleware functional
- Frontend API client configured

