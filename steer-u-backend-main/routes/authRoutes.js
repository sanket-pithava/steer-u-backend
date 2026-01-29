const express = require('express');
const passport = require('passport');
const {
    sendOtpPhone,
    sendOtpEmail,
    verifyAuthOtp,
    socialLoginSuccess,
    verifyFirebaseToken
} = require('../controllers/authController');
const router = express.Router();
router.post('/send-otp-phone', sendOtpPhone);
router.post('/send-otp-email', sendOtpEmail);
router.post('/verify-otp', verifyAuthOtp);

router.post('/verify-firebase-token', verifyFirebaseToken);

router.get('/google', (req, res, next) => {
    console.log('Attempting Google Login. Available strategies:', Object.keys(passport._strategies));
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    console.log('Google callback hit. Available strategies:', Object.keys(passport._strategies));
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login/error'
    })(req, res, next);
}, socialLoginSuccess);

module.exports = router;
