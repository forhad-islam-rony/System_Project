# 🚀 Installation Guide - Healthcare System

## 📋 **PREREQUISITES**

Before installing the Healthcare System, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v8.0.0 or higher) - Comes with Node.js
- **MongoDB** (v5.0 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- **Git** - [Download here](https://git-scm.com/downloads)

### **Optional but Recommended:**
- **MongoDB Atlas Account** - For cloud database (production)
- **Cloudinary Account** - For image storage
- **Google AI Studio Account** - For Gemini AI API key

---

## 📦 **INSTALLATION STEPS**

### **Step 1: Clone the Repository**

```bash
# Clone the project repository
git clone https://github.com/your-username/healthcare-system.git

# Navigate to project directory
cd healthcare-system
```

### **Step 2: Install Dependencies**

```bash
# Install root dependencies (if any)
npm install

# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install

# Return to project root
cd ..
```

### **Step 3: Environment Configuration**

#### **Backend Environment Setup**

Create a `.env` file in the `Backend` directory:

```bash
cd Backend
touch .env
```

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### **Frontend Environment Setup**

Create a `.env` file in the `Frontend` directory:

```bash
cd Frontend
touch .env
```

Add the following to `Frontend/.env`:


### **Step 4: Database Setup**

#### **Option A: Local MongoDB**

1. Start MongoDB service:
```bash
# On Windows
net start MongoDB

# On macOS (with Homebrew)
brew services start mongodb-community

# On Linux (systemd)
sudo systemctl start mongod
```

2. Create the database:
```bash
# Connect to MongoDB
mongosh

# Create database and collections
use healthcare-system
```

#### **Option B: MongoDB Atlas (Recommended for Production)**

1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create a database user
4. Get your connection string
5. Replace the `MONGODB_URI` in your `.env` file

### **Step 5: API Keys Setup**

#### **Google Gemini AI API Key**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `Backend/.env` file as `GEMINI_API_KEY`

#### **Cloudinary Setup (Optional)**

1. Create account at [Cloudinary](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret from dashboard
3. Add them to your `Backend/.env` file

---

## 🏃‍♂️ **RUNNING THE APPLICATION**

### **Development Mode**

#### **Option 1: Run Both Services Separately**

**Terminal 1 - Backend:**
```bash
cd Backend
npm run dev
# Server will start at http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd Frontend
npm run dev
# Frontend will start at http://localhost:5173
```

#### **Option 2: Using Concurrent Scripts (if configured)**

```bash
# From project root
npm run dev
# Starts both backend and frontend simultaneously
```

### **Production Mode**

#### **Backend Production Build:**
```bash
cd Backend
npm start
```

#### **Frontend Production Build:**
```bash
cd Frontend
npm run build
npm run preview
```

---

## 🔧 **CONFIGURATION**

### **Backend Configuration**

The main configuration files are:

- `Backend/index.js` - Main server file
- `Backend/.env` - Environment variables
- `Backend/config/cloudinary.js` - Cloudinary configuration

### **Frontend Configuration**

- `Frontend/src/config.js` - API endpoints configuration
- `Frontend/vite.config.js` - Vite build configuration
- `Frontend/tailwind.config.js` - Styling configuration

---

## 📊 **VERIFICATION**

### **Test Backend API**

```bash
# Test server health
curl http://localhost:5000/api/v1/health

# Expected response:
# {"success": true, "message": "Server is running"}
```

### **Test Database Connection**

Check your terminal for messages like:
```
✅ Database connected successfully
✅ Server is running on port 5000
```

### **Test Frontend**

1. Open browser and navigate to `http://localhost:5173`
2. You should see the healthcare system homepage
3. Test user registration and login functionality

### **Test AI Integration**

1. Register/login as a user
2. Navigate to the Medical Chatbot
3. Start a conversation
4. If Gemini API is configured correctly, you should receive AI responses

---

## 🐛 **TROUBLESHOOTING**

### **Common Issues**

#### **Port Already in Use**

```bash
# Kill process on port 5000
npx kill-port 5000

# Kill process on port 5173
npx kill-port 5173
```

#### **MongoDB Connection Issues**

```bash
# Check if MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"

# For MongoDB Atlas, verify:
# - Correct connection string
# - Database user permissions
# - IP whitelist settings
```

#### **Missing Dependencies**

```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### **Environment Variables Not Loading**

```bash
# Verify .env file location and syntax
# Ensure no spaces around = in .env
# Restart the server after .env changes
```

#### **Gemini AI API Issues**

```bash
# Test your API key
curl -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY"
```

### **Log Files**

- Backend logs: Check terminal where backend is running
- Frontend logs: Check browser console (F12)
- MongoDB logs: Check MongoDB log files

---

## 🔐 **SECURITY CONSIDERATIONS**

### **Development Environment**

- Keep `.env` files out of version control
- Use strong, unique JWT secret keys
- Regularly update dependencies

### **Production Environment**

- Use HTTPS for all communications
- Implement rate limiting
- Set up proper database authentication
- Use environment-specific configurations
- Regular security audits

---

## 📚 **NEXT STEPS**

After successful installation:

1. **Read Documentation**: Review `API_DOCUMENTATION.md`
2. **Explore Features**: Test all major functionalities
3. **Run Tests**: Execute the test suite (when available)
4. **Customize**: Modify configurations for your needs
5. **Deploy**: Follow deployment guides for production

---

## 🆘 **GETTING HELP**

If you encounter issues during installation:

1. **Check this guide** for troubleshooting steps
2. **Review error messages** carefully
3. **Check logs** for detailed error information
4. **Verify prerequisites** are properly installed
5. **Contact support** if issues persist

---

## ✅ **SUCCESS CHECKLIST**

- [ ] Node.js and npm installed
- [ ] Repository cloned
- [ ] Dependencies installed (Backend & Frontend)
- [ ] Environment variables configured
- [ ] Database connection established
- [ ] Backend server running (port 5000)
- [ ] Frontend server running (port 5173)
- [ ] Can access homepage
- [ ] User registration works
- [ ] AI chatbot responds
- [ ] No console errors

**Congratulations! Your Healthcare System is now ready for use! 🎉**
