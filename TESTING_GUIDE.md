# Healthcare System - Testing Guide

## 🧪 Testing Overview

This healthcare system now includes comprehensive testing for both backend and frontend components. This guide explains how to run tests, understand test coverage, and add new tests.

## 📁 Test Structure

```
System_Project/
├── Backend/
│   ├── __tests__/
│   │   ├── authController.test.js          # Authentication unit tests
│   │   ├── userController.test.js          # User management unit tests
│   │   ├── doctorController.test.js        # Doctor management unit tests
│   │   └── integration/
│   │       ├── auth.integration.test.js    # Auth API integration tests
│   │       └── user.integration.test.js    # User API integration tests
│   └── package.json                        # Jest configuration
├── Frontend/
│   ├── src/
│   │   ├── components/__tests__/
│   │   │   ├── SpecialityMenu.test.jsx     # Speciality menu component tests
│   │   │   └── Navbar.test.jsx             # Navigation component tests
│   │   ├── context/__tests__/
│   │   │   └── AuthContext.test.jsx        # Authentication context tests
│   │   └── test/
│   │       └── setup.js                    # Test setup configuration
│   ├── vitest.config.js                    # Vitest configuration
│   └── package.json                        # Testing dependencies
└── package.json                            # Root scripts for running all tests
```

## 🚀 Running Tests

### Quick Start - Run All Tests
```bash
# Install all dependencies
npm run install:all

# Run all tests (backend + frontend)
npm test
```

### Backend Tests
```bash
# Run backend tests only
npm run test:backend

# Run backend tests in watch mode
npm run test:backend:watch

# Run backend tests with coverage
npm run test:backend:coverage
```

### Frontend Tests
```bash
# Run frontend tests only
npm run test:frontend

# Run frontend tests in watch mode (interactive)
npm run test:frontend:watch

# Run frontend tests with coverage
npm run test:frontend:coverage
```

### Individual Test Directories
```bash
# Backend directory
cd Backend
npm test

# Frontend directory  
cd Frontend
npm test
```

## 🔍 Test Categories

### 1. Backend Unit Tests

#### Authentication Controller Tests (`authController.test.js`)
- **User Registration Tests**
  - ✅ Successfully register new patient
  - ✅ Successfully register new doctor
  - ✅ Reject invalid roles
  - ✅ Reject duplicate emails
  - ✅ Handle registration errors gracefully

- **User Login Tests**
  - ✅ Successfully login patient with valid credentials
  - ✅ Successfully login doctor with valid credentials
  - ✅ Reject invalid email
  - ✅ Reject invalid password
  - ✅ Handle login errors gracefully

#### User Controller Tests (`userController.test.js`)
- **Profile Management Tests**
  - ✅ Successfully update user profile
  - ✅ Handle user not found (404)
  - ✅ Handle update errors gracefully
  - ✅ Successfully delete user
  - ✅ Successfully retrieve single user
  - ✅ Successfully retrieve all users

#### Doctor Controller Tests (`doctorController.test.js`)
- **Doctor Management Tests**
  - ✅ Successfully update doctor profile when authorized
  - ✅ Return 404 when doctor not found
  - ✅ Return 403 when unauthorized to update
  - ✅ Handle update errors gracefully
  - ✅ Successfully delete doctor
  - ✅ Successfully retrieve single doctor with reviews
  - ✅ Successfully retrieve all doctors with specialization filtering

### 2. Backend Integration Tests

#### Authentication API Tests (`auth.integration.test.js`)
- **Registration Endpoint Tests**
  - ✅ Complete patient registration flow
  - ✅ Complete doctor registration flow
  - ✅ Input validation and error handling
  - ✅ Database integration verification

- **Login Endpoint Tests**
  - ✅ Complete login flow for patients and doctors
  - ✅ JWT token generation and validation
  - ✅ Password verification
  - ✅ Authentication flow integration

#### User Management API Tests (`user.integration.test.js`)
- **CRUD Operations Tests**
  - ✅ Complete user lifecycle (Create, Read, Update, Delete)
  - ✅ Database operations verification
  - ✅ Error handling for edge cases
  - ✅ Data persistence verification

### 3. Frontend Component Tests

#### SpecialityMenu Component Tests (`SpecialityMenu.test.jsx`)
- **Rendering Tests**
  - ✅ Renders main heading and description correctly
  - ✅ Renders all speciality items from data
  - ✅ Renders speciality images with correct alt text
  - ✅ Creates correct navigation links for each speciality

- **Functionality Tests**
  - ✅ Applies correct CSS classes for styling and animations
  - ✅ Has responsive design classes
  - ✅ Handles URL encoding for special characters
  - ✅ Maintains accessibility attributes

#### Navbar Component Tests (`Navbar.test.jsx`)
- **Navigation Tests**
  - ✅ Renders all navigation links correctly
  - ✅ Creates correct href attributes
  - ✅ Renders hospital icon and brand name

- **Authentication State Tests**
  - ✅ Shows login/signup links when not authenticated
  - ✅ Shows user menu when authenticated as patient
  - ✅ Shows doctor-specific navigation for doctors
  - ✅ Shows admin navigation for admins

- **User Interface Tests**
  - ✅ Displays user photo when available
  - ✅ Displays default avatar when photo not available
  - ✅ Renders mobile menu toggle button
  - ✅ Handles logout functionality correctly

#### AuthContext Tests (`AuthContext.test.jsx`)
- **Context State Management Tests**
  - ✅ Provides initial auth state correctly
  - ✅ Loads user data from localStorage
  - ✅ Handles invalid JSON gracefully

- **Authentication Flow Tests**
  - ✅ Handles successful login correctly
  - ✅ Handles logout correctly
  - ✅ Persists state changes to localStorage
  - ✅ Handles localStorage errors gracefully

## 📊 Test Coverage

### Current Coverage Goals
- **Backend Controllers**: 90%+ line coverage
- **Frontend Components**: 85%+ line coverage
- **Critical Paths**: 100% coverage for authentication and user management

### Viewing Coverage Reports
```bash
# Backend coverage (generates HTML report)
npm run test:backend:coverage

# Frontend coverage (generates HTML report)  
npm run test:frontend:coverage

# View coverage reports
# Backend: Backend/coverage/lcov-report/index.html
# Frontend: Frontend/coverage/index.html
```

## 🛠️ Testing Technologies

### Backend Testing Stack
- **Jest**: Test framework for Node.js
- **Supertest**: HTTP assertion library for API testing
- **MongoDB Memory Server**: In-memory MongoDB for isolated testing
- **Jest Mocks**: For mocking dependencies and external services

### Frontend Testing Stack
- **Vitest**: Fast Vite-native test framework
- **React Testing Library**: React component testing utilities
- **Jest DOM**: Custom Jest matchers for DOM testing
- **User Event**: User interaction simulation
- **JSDOM**: DOM implementation for Node.js testing

## 🔧 Test Configuration

### Backend Jest Configuration (`Backend/package.json`)
```json
{
  "jest": {
    "testEnvironment": "node",
    "transform": {},
    "extensionsToTreatAsEsm": [".js"],
    "testMatch": [
      "**/__tests__/**/*.js",
      "**/?(*.)+(spec|test).js"
    ],
    "collectCoverageFrom": [
      "Controllers/**/*.js",
      "Routes/**/*.js", 
      "services/**/*.js"
    ]
  }
}
```

### Frontend Vitest Configuration (`Frontend/vitest.config.js`)
```javascript
{
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    coverage: {
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/main.jsx', 'src/**/*.test.{js,jsx}']
    }
  }
}
```

## ✅ Test Best Practices

### Writing Good Tests
1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **Test Behavior, Not Implementation**: Focus on what the code does, not how
3. **Use Descriptive Test Names**: Tests should read like specifications
4. **Isolate Tests**: Each test should be independent and not rely on others
5. **Mock External Dependencies**: Use mocks for databases, APIs, file systems

### Backend Test Guidelines
- Use MongoDB Memory Server for database tests
- Mock external APIs and services
- Test both success and error scenarios
- Verify database state changes
- Test authentication and authorization

### Frontend Test Guidelines
- Use React Testing Library for component tests
- Test user interactions, not implementation details
- Mock context providers and external dependencies
- Test accessibility attributes
- Test responsive behavior

## 🚨 Common Issues and Solutions

### Backend Issues
```bash
# MongoDB Memory Server issues
npm install mongodb-memory-server --save-dev

# ES Module issues with Jest
# Use "type": "module" in package.json
# Configure Jest with extensionsToTreatAsEsm

# Mock import issues
# Use vi.mock() for ES modules
```

### Frontend Issues
```bash
# CSS import errors
# Mock CSS imports in test setup

# React Router issues
# Wrap components with BrowserRouter in tests

# Context provider issues
# Provide mock context values in tests
```

## 📝 Adding New Tests

### Backend Test Example
```javascript
import { jest } from '@jest/globals';
import { myFunction } from '../Controllers/myController.js';

describe('My Controller Tests', () => {
  test('should handle valid input correctly', async () => {
    // Arrange
    const req = { body: { data: 'test' } };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    
    // Act
    await myFunction(req, res);
    
    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });
});
```

### Frontend Test Example
```javascript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

## 🎯 Next Steps

1. **Expand Test Coverage**: Add tests for remaining controllers and components
2. **End-to-End Tests**: Consider adding Cypress or Playwright for E2E testing
3. **Performance Tests**: Add performance testing for critical paths
4. **Visual Regression Tests**: Consider visual testing for UI components
5. **API Contract Tests**: Add contract testing between frontend and backend

## 📞 Support

For questions about testing:
1. Check existing test files for patterns and examples
2. Review this documentation for best practices
3. Run tests with `--verbose` flag for detailed output
4. Use watch mode during development for rapid feedback

---

*This testing setup ensures the healthcare system maintains high quality and reliability while supporting continuous integration and deployment practices.*
