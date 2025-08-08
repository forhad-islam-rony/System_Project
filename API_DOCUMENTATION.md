# 🔌 API Documentation - Healthcare System

## 📋 **BASE CONFIGURATION**

**Base URL**: `http://localhost:5000/api/v1`  
**Content-Type**: `application/json`  
**Authentication**: Bearer Token (JWT)

---

## 🔐 **AUTHENTICATION ENDPOINTS**

### **POST** `/auth/register`
Register a new user (patient or doctor)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "role": "patient",          // "patient" or "doctor"
  "gender": "male",           // "male", "female", "other"
  "photo": "https://...",     // Optional profile photo URL
  "phone": "+8801234567890"   // Optional phone number
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User successfully created"
}
```

**Response (Error - 400):**
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### **POST** `/auth/login`
User authentication

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Successfully logged in",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "user_object_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    "photo": "https://..."
  }
}
```

### **GET** `/auth/blood-donors`
Search for blood donors by location and blood type

**Query Parameters:**
- `district` (string): Geographic district
- `location` (string): Specific location within district
- `bloodType` (string): Required blood type (A+, A-, B+, B-, AB+, AB-, O+, O-)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Blood donors found",
  "data": [
    {
      "_id": "donor_id",
      "name": "Jane Smith",
      "bloodType": "O+",
      "district": "Dhaka",
      "location": "Dhanmondi",
      "phone": "+8801234567890"
    }
  ]
}
```

---

## 🩺 **MEDICAL CHATBOT ENDPOINTS**

### **POST** `/chatbot/start-session`
Start a new medical consultation session

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "chat_session_id",
    "message": "Chat session started successfully",
    "initialMessage": "Hello! I'm your medical AI assistant..."
  }
}
```

### **POST** `/chatbot/send-message`
Send a message in an active chat session

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "sessionId": "chat_session_id",
  "message": "I have a headache and fever for 2 days"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "response": "Based on your symptoms of headache and fever...",
    "messageType": "text",           // "text" or "emergency_alert"
    "isEmergency": false,
    "contextFound": true,
    "timestamp": "2025-01-26T10:30:00Z"
  }
}
```

### **POST** `/chatbot/upload-report`
Upload and analyze medical documents

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request (FormData):**
- `sessionId`: Active chat session ID
- `medicalReport`: Medical document file (PDF, DOC, image)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "fileName": "blood_test_report.pdf",
    "extractedText": "Blood Test Results: WBC: 8000...",
    "analysis": "Your blood test results show...",
    "uploadedAt": "2025-01-26T10:30:00Z"
  }
}
```

### **POST** `/chatbot/symptom-check`
Quick symptom assessment

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "symptoms": "severe chest pain, difficulty breathing, sweating"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "assessment": "These symptoms require immediate medical attention...",
    "severity": "HIGH",              // "LOW", "MEDIUM", "HIGH", "EMERGENCY"
    "isEmergency": true,
    "recommendations": [
      "Seek immediate emergency care",
      "Call ambulance if symptoms persist"
    ]
  }
}
```

---

## 👩‍⚕️ **DOCTOR MANAGEMENT ENDPOINTS**

### **GET** `/doctors`
Get list of all approved doctors

**Query Parameters:**
- `specialization` (string): Filter by doctor specialization
- `page` (number): Pagination page number
- `limit` (number): Number of doctors per page

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "doctor_id",
      "name": "Dr. Sarah Wilson",
      "specialization": "Cardiology",
      "qualifications": ["MBBS", "MD Cardiology"],
      "experiences": [
        {
          "position": "Senior Cardiologist",
          "hospital": "City Hospital",
          "years": "2018-Present"
        }
      ],
      "ticketPrice": 1500,
      "timeSlots": ["09:00-10:00", "10:00-11:00"],
      "averageRating": 4.5,
      "totalRating": 45,
      "isAvailable": true
    }
  ]
}
```

### **GET** `/doctors/:id`
Get specific doctor details

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "_id": "doctor_id",
    "name": "Dr. Sarah Wilson",
    "specialization": "Cardiology",
    "about": "Experienced cardiologist with 10+ years...",
    "reviews": [
      {
        "_id": "review_id",
        "user": {
          "name": "Patient Name",
          "photo": "https://..."
        },
        "rating": 5,
        "reviewText": "Excellent doctor, very caring..."
      }
    ]
  }
}
```

---

## 📅 **APPOINTMENT BOOKING ENDPOINTS**

### **POST** `/bookings/create`
Create a new appointment booking

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "doctor": "doctor_object_id",
  "appointmentDate": "2025-01-28",
  "appointmentTime": "10:00-11:00",
  "problem": "Regular checkup for blood pressure monitoring"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "_id": "booking_id",
    "doctor": "doctor_object_id",
    "user": "user_object_id",
    "appointmentDate": "2025-01-28T00:00:00Z",
    "appointmentTime": "10:00-11:00",
    "status": "pending",
    "visitType": "first",
    "fee": 1500
  }
}
```

### **GET** `/bookings/user-bookings`
Get user's appointment history

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "booking_id",
      "doctor": {
        "name": "Dr. Sarah Wilson",
        "specialization": "Cardiology"
      },
      "appointmentDate": "2025-01-28T00:00:00Z",
      "appointmentTime": "10:00-11:00",
      "status": "approved",
      "fee": 1500
    }
  ]
}
```

---

## 💊 **PHARMACY ENDPOINTS**

### **GET** `/medicines`
Get list of all available medicines

**Query Parameters:**
- `category` (string): Filter by medicine category
- `search` (string): Search in medicine names
- `page` (number): Pagination
- `limit` (number): Items per page

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "medicine_id",
      "productName": "Panadol Extra",
      "genericName": "Paracetamol",
      "category": "Painkillers",
      "price": 120,
      "dosageMg": 500,
      "photo": "https://...",
      "description": {
        "text": "Effective pain relief and fever reducer",
        "keyBenefits": "Fast-acting, long-lasting relief",
        "recommendedFor": "Headache, fever, body ache"
      },
      "usageInstruction": "Take 1-2 tablets every 4-6 hours",
      "sideEffects": "Rare: nausea, dizziness",
      "storage": "Store in cool, dry place"
    }
  ]
}
```

### **POST** `/cart/add`
Add medicine to shopping cart

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "medicineId": "medicine_object_id",
  "quantity": 2
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Medicine added to cart",
  "data": {
    "cart": {
      "items": [
        {
          "medicine": "medicine_object_id",
          "quantity": 2,
          "price": 120
        }
      ],
      "totalAmount": 240
    }
  }
}
```

---

## 🚑 **AMBULANCE SERVICE ENDPOINTS**

### **POST** `/ambulance/request`
Request emergency ambulance service

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "patientName": "John Doe",
  "contactNumber": "+8801234567890",
  "emergencyType": "Heart Attack",
  "location": {
    "address": "123 Main Street, Dhanmondi, Dhaka",
    "coordinates": {
      "latitude": 23.7465,
      "longitude": 90.3765
    }
  },
  "additionalInfo": "Patient is conscious but experiencing chest pain"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Ambulance request submitted successfully",
  "data": {
    "requestId": "ambulance_request_id",
    "status": "pending",
    "estimatedArrival": "15-20 minutes",
    "driverContact": "+8801234567891"
  }
}
```

### **GET** `/ambulance/status/:requestId`
Check ambulance request status

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "requestId": "ambulance_request_id",
    "status": "assigned",           // "pending", "assigned", "en_route", "completed"
    "driver": {
      "name": "Driver Name",
      "phone": "+8801234567891",
      "vehicleNumber": "DHA-1234"
    },
    "estimatedArrival": "10 minutes",
    "currentLocation": {
      "latitude": 23.7365,
      "longitude": 90.3665
    }
  }
}
```

---

## 📝 **COMMUNITY POSTS ENDPOINTS**

### **POST** `/posts/create`
Create a new community post

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "My experience with Dr. Smith",
  "content": "I had an excellent consultation with Dr. Smith...",
  "division": "Dhaka",
  "category": "Doctor Review",
  "images": ["https://image1.url", "https://image2.url"]
}
```

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Post created successfully and pending moderation",
  "data": {
    "_id": "post_id",
    "title": "My experience with Dr. Smith",
    "status": "pending",
    "createdAt": "2025-01-26T10:30:00Z"
  }
}
```

### **GET** `/posts`
Get community posts

**Query Parameters:**
- `division` (string): Filter by geographic division
- `category` (string): Filter by post category
- `status` (string): Filter by moderation status
- `page` (number): Pagination
- `limit` (number): Posts per page

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "post_id",
      "title": "My experience with Dr. Smith",
      "content": "I had an excellent consultation...",
      "user": {
        "name": "Anonymous User",
        "photo": "https://..."
      },
      "division": "Dhaka",
      "category": "Doctor Review",
      "likes": 15,
      "comments": 3,
      "views": 120,
      "createdAt": "2025-01-26T10:30:00Z"
    }
  ]
}
```

---

## 🔧 **ADMIN ENDPOINTS**

### **GET** `/admin/dashboard-stats`
Get admin dashboard statistics

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (Success - 200):**
```json
{
  "success": true,
  "data": {
    "totalPatients": 1250,
    "totalDoctors": 85,
    "totalAppointments": 3500,
    "totalEarnings": 525000,
    "recentAppointments": [
      {
        "user": {"name": "Patient Name"},
        "doctor": {"name": "Dr. Smith"},
        "appointmentDate": "2025-01-26",
        "status": "approved"
      }
    ]
  }
}
```

---

## ⚠️ **ERROR RESPONSES**

### **Common Error Codes:**

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "No token, authorization denied"
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Not authorized as admin"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details for debugging"
}
```

### **Validation Errors (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Valid email is required"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

---

## 📊 **RATE LIMITS & QUOTAS**

- **General API**: 100 requests per minute per IP
- **AI Chatbot**: 20 requests per minute per user
- **File Upload**: 5 uploads per minute per user
- **Authentication**: 10 attempts per minute per IP

## 🔐 **SECURITY HEADERS**

**Required Headers for Protected Routes:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Optional Security Headers:**
```
X-Requested-With: XMLHttpRequest
User-Agent: YourApp/1.0.0
```

---

*For additional API endpoints or detailed error handling, refer to the individual controller documentation within the codebase.*
