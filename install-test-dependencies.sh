#!/bin/bash

# Healthcare System - Test Dependencies Installation Script
# This script installs all required testing dependencies for both backend and frontend

echo "🏥 Healthcare System - Installing Test Dependencies"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install Node.js and npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"
echo ""

# Install root dependencies
print_status "Installing root dependencies..."
if npm install; then
    print_success "Root dependencies installed successfully"
else
    print_error "Failed to install root dependencies"
    exit 1
fi
echo ""

# Install Backend testing dependencies
print_status "Installing Backend testing dependencies..."
cd Backend

if npm install; then
    print_success "Backend dependencies installed successfully"
else
    print_error "Failed to install Backend dependencies"
    exit 1
fi

# Install specific backend testing packages
print_status "Installing Backend test-specific packages..."
if npm install --save-dev jest@^29.7.0 @jest/globals@^29.7.0 supertest@^7.0.0 mongodb-memory-server@^10.1.2; then
    print_success "Backend testing packages installed successfully"
else
    print_error "Failed to install Backend testing packages"
    exit 1
fi

cd ..
echo ""

# Install Frontend testing dependencies
print_status "Installing Frontend testing dependencies..."
cd Frontend

if npm install; then
    print_success "Frontend dependencies installed successfully"
else
    print_error "Failed to install Frontend dependencies"
    exit 1
fi

# Install specific frontend testing packages
print_status "Installing Frontend test-specific packages..."
if npm install --save-dev vitest@^2.1.6 @testing-library/react@^16.1.0 @testing-library/jest-dom@^6.6.3 @testing-library/user-event@^14.5.2 jsdom@^26.0.0; then
    print_success "Frontend testing packages installed successfully"
else
    print_error "Failed to install Frontend testing packages"
    exit 1
fi

cd ..
echo ""

# Verify installations
print_status "Verifying installations..."

# Check Backend
cd Backend
if npm list jest > /dev/null 2>&1; then
    print_success "Backend Jest installation verified"
else
    print_error "Backend Jest installation failed"
fi

cd ../Frontend
if npm list vitest > /dev/null 2>&1; then
    print_success "Frontend Vitest installation verified"
else
    print_error "Frontend Vitest installation failed"
fi

cd ..

echo ""
print_success "All testing dependencies installed successfully!"
echo ""
print_status "Next steps:"
echo "  1. Run all tests: npm test"
echo "  2. Run backend tests: npm run test:backend"
echo "  3. Run frontend tests: npm run test:frontend"
echo "  4. Run tests with coverage: npm run test:coverage"
echo ""
print_status "For more information, see TESTING_GUIDE.md"
