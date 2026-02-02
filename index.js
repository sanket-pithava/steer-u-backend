const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables FIRST
dotenv.config();

//  DIAGNOSTIC LOGS: Check if environment variables are loaded on start
console.log(`[ENV DEBUG] EMAIL_USER status on startup: ${process.env.EMAIL_USER ? 'LOADED' : 'NOT LOADED'}`);
console.log(`[ENV DEBUG] TWILIO_SID status on startup: ${process.env.TWILIO_ACCOUNT_SID ? 'LOADED' : 'NOT LOADED'}`);

// YEH SABSE ZAROORI STEP HAI:
// Firebase Admin ko initialize karein taaki server database se connect ho sake.
// Yeh line aapke firebaseAdmin.js file ko run karti hai.
require('./firebaseAdmin');

// CRITICAL: Load passport config BEFORE routes
require('./config/passport');

// Initialize Express app
const app = express();

// Trust proxy for IP detection
app.set('trust proxy', true);

// Middlewares
app.use(cors());
app.use(express.json());

// Initialize Passport
const passport = require('passport');
app.use(passport.initialize());

// DEBUG: Verify strategies are loaded
console.log('✅ Registered Passport Strategies:', Object.keys(passport._strategies));

// --- ROUTES IMPORTS ---
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const engineRoutes = require('./routes/engineRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const counselingRoutes = require('./routes/counselingRoutes');
const profileRoutes = require('./routes/profileRoutes');
const compatibilityRoutes = require('./routes/CompatibilityRoutes');
const customQuestionRoutes = require('./routes/customQuestionRoutes');
const intakeFormRoutes = require('./routes/intakeFormRoutes');
const supportRoutes = require('./routes/supportRoutes');
const pricingRoutes = require('./routes/pricingRoutes');

// Test Route
app.get('/', (req, res) => {
    res.send('Astro App Backend is running!');
});

// --- API ROUTES MOUNTING ---
app.use('/api/auth', authRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/engine', engineRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/counseling', counselingRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/custom-questions', customQuestionRoutes);
app.use('/api/intake-form', intakeFormRoutes);
app.use('/api/support', supportRoutes);
app.use('/api/pricing', pricingRoutes);

//  CRITICAL: Mount the new Support Route
// This connects the path /api/support/ to your supportRoutes file.
// Puraane commented code ko waise hi rehne diya hai
/*
const { protect } = require('./Middleware/authMiddleware');
app.get('/api/profile', protect, (req, res) => {
    res.json({
        message: `Welcome user with UID: ${req.user.uid}`,
        email: req.user.email,
    });
});
*/

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
