// controllers/authController.js
require('dotenv').config();
const twilio = require('twilio');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const { db } = require('../firebaseAdmin'); 

const admin = require('firebase-admin'); // Firebase Admin SDK

// --- Twilio init (SMS fallback/primary) ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
let twilioClient = null;

if (accountSid && authToken) {
    twilioClient = twilio(accountSid, authToken);
} else {
    console.warn('Twilio credentials not found. SMS OTP will be logged to console.');
}

// --- SendGrid init (preferred over SMTP) ---
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// --- SMTP transporter (fallback) — use 587 STARTTLS, NO verify() ---
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // STARTTLS on 587
    auth: process.env.EMAIL_USER && process.env.EMAIL_PASS ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    } : undefined,
    pool: true,
    maxConnections: 3,
    maxMessages: 50,
    connectionTimeout: 10000,
    greetingTimeout: 7000,
    socketTimeout: 20000,
});

const fromAddress = `"Steer-U" <${process.env.EMAIL_USER}>`;


// --- OTP store (5 minutes expiry) ---
const OTP_TTL_MS = 5 * 60 * 1000;
const otpStore = new Map(); // key -> { otp, expiresAt }

// ---  REFERRAL UTILITY FUNCTION  ---
const generateReferralCode = (length = 8) => {
    // Generate a simple unique alphanumeric code
    return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
};

// --- JWT ---
const generateToken = (uid) => {
    const secret = process.env.JWT_SECRET || 'fallback-secret-key-123';
    return jwt.sign({ uid }, secret, { expiresIn: '30d' });
};

// --- OTP helpers ---
const generateAndStoreOtp = (identifier) => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(identifier, { otp, expiresAt: Date.now() + OTP_TTL_MS });
    setTimeout(() => {
        const rec = otpStore.get(identifier);
        if (rec && rec.otp === otp) {
            otpStore.delete(identifier);
            console.log(`OTP for ${identifier} expired.`);
        }
    }, OTP_TTL_MS);
    return otp;
};

const getStoredOtp = (identifier) => {
    const rec = otpStore.get(identifier);
    if (!rec) return null;
    if (Date.now() > rec.expiresAt) {
        otpStore.delete(identifier);
        return null;
    }
    return rec.otp;
};

// --- Email send (prefers SendGrid HTTP, falls back to SMTP) ---
async function sendEmail(toEmail, subject, text, html) {
    if (process.env.SENDGRID_API_KEY) {
        await sgMail.send({
            to: toEmail,
            from: fromAddress,
            subject,
            text,
            html,
        });
        console.log(`Email via SendGrid sent to ${toEmail}`);
        return;
    }

    if (transporter.options.auth) {
        await transporter.sendMail({
            from: fromAddress,
            to: toEmail,
            subject,
            text,
            html,
        });
        console.log(`Email via SMTP sent to ${toEmail}`);
        return;
    }

    throw new Error('No email provider configured');
}

// --- 1) Phone OTP (UNCHANGED) ---
const sendOtpPhone = async (req, res) => {
    const { phone, email } = req.body;
// ... (Logic remains unchanged) ...
    if (!phone || phone.length !== 10) {
        return res.status(400).json({ message: 'Please provide a valid 10-digit phone number.' });
    }

    const otp = generateAndStoreOtp(phone);

    try {
        if (!twilioClient) {
            console.log('>>>>>>>>>> OTP (Twilio Not Configured) <<<<<<<<<<');
            console.log(`OTP for phone number ${phone} is: ${otp}`);
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
            return res.status(200).json({ message: 'A dummy OTP has been generated in the backend console (Phone).' });
        }

        await twilioClient.messages.create({
            body: `Your verification code is: ${otp}`,
            from: twilioPhoneNumber,
            to: `+91${phone}`,
        });
        console.log(`OTP SMS sent successfully to ${phone}`);
        return res.status(200).json({ message: 'OTP has been sent to your mobile number.' });
    } catch (error) {
        console.error('Error sending SMS OTP:', error.message);
        
        if (email) {
            try {
                await sendEmail(
                    email,
                    'Steer-U Login Verification OTP',
                    `Your Steer-U login verification code is: ${otp}`,
                    `<p>Your Steer-U login verification code is: <b>${otp}</b></p>`
                );
                return res.status(200).json({ message: 'SMS failed. OTP sent to your email.' });
            } catch (_) {}
        }

        console.log('>>>>>>>>>> OTP (Twilio Failed) <<<<<<<<<<');
        console.log(`OTP for phone number ${phone} is: ${otp}`);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        return res.status(500).json({ message: 'Failed to send OTP SMS. Check console for OTP.' });
    }
};

// --- 2) Email OTP (STANDARD OTP FLOW RESTORED) ---
const sendOtpEmail = async (req, res) => {
// ... (Logic remains unchanged) ...
    const { email, phone } = req.body;
    if (!email || !email.includes('@')) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    const normalized = email.toLowerCase();
    const otp = generateAndStoreOtp(normalized);

    try {
        await sendEmail(
            normalized,
            'Steer-U Login Verification OTP',
            `Your Steer-U login verification code is: ${otp}`,
            `<p>Your Steer-U login verification code is: <b>${otp}</b></p>`
        );
        return res.status(200).json({ message: 'OTP has been sent to your email address.' });
    } catch (error) {
        console.error('Error in sending OTP email:', error.message);

        if (phone && twilioClient) {
            try {
                await twilioClient.messages.create({
                    body: `Your verification code is: ${otp}`,
                    from: twilioPhoneNumber,
                    to: phone.startsWith('+') ? phone : `+91${phone}`,
                });
                return res.status(200).json({ message: 'Email failed. OTP sent via SMS.' });
            } catch (_) {}
        }

        return res.status(500).json({ message: 'Failed to send OTP email. Try phone OTP.' });
    }
};

// --- 3) Verify Standard OTP + upsert Firebase profile (For Email OTP) ---
const verifyAuthOtp = async (req, res) => {
    const { phone, email, otp, name } = req.body;
    const identifier = phone || (email ? email.toLowerCase() : null);

    if (!identifier || !otp) {
        return res.status(400).json({ message: 'Authentication identifier (phone or email) and OTP are required.' });
    }

    const storedOtp = getStoredOtp(identifier);
    if (!storedOtp || otp !== storedOtp) {
        return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    otpStore.delete(identifier);

    const uid = identifier;
    const token = generateToken(uid);

    try {
        if (name && email) {
            const userRef = db.collection('users').doc(uid);
            
            // Fetch existing data to check if profile exists
            const doc = await userRef.get();
            const exists = doc.exists;
            
            let userData = {
                uid,
                name,
                email: email.toLowerCase(),
                phone: phone || null,
                updatedAt: new Date(),
            };
            
            //  CRITICAL FIX 1: Add default referral fields only if the profile is NEW
            if (!exists) {
                userData.referralCode = generateReferralCode();
                userData.hasUsedFreeQuestion = false;
                userData.referralCredits = 0; 
                console.log(`New user profile created for ${uid} with referral defaults.`);
            }

            await userRef.set(userData, { merge: true });
            console.log(`User profile for ${uid} saved/updated in Firebase.`);
        }

        return res.status(200).json({
            message: 'Authentication Successful!',
            token,
            user: { uid, name: name || null, email: email || null, phone: phone || null },
        });
    } catch (error) {
        console.error('Error during authentication process (Firebase save failed):', error);
        return res.status(200).json({
            message: 'Authentication successful, but profile saving failed.',
            token,
            user: { uid },
        });
    }
};


// --- 4) NAYA FUNCTION: Verify Firebase ID Token (Fix for Email Link / Mobile OTP) ---
const verifyFirebaseToken = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ message: 'Firebase ID Token is required for login verification.' });
    }

    try {
        // 1. Firebase Admin SDK se ID Token ko verify karein
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const uid = decodedToken.uid;
        
        // 🚨 FIX: phone_number undefined हो सकता है (Email Link के लिए), इसलिए null सेट करें।
        const phoneNumber = decodedToken.phone_number || null; 
        
        // Login method decide करें
        const loginMethod = phoneNumber ? 'firebase_phone' : 'firebase_email_link';
        
        // 2. Apne Custom JWT ko generate karein
        const customJwt = generateToken(uid);

        // 3. Optional: Firestore mein user profile ko upsert karein
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        const exists = doc.exists;
        
        let userData = {
            uid: uid,
            phone: phoneNumber, // Now this is null or string, fixing the Firestore error.
            email: decodedToken.email || null,
            loginMethod: loginMethod, 
            updatedAt: new Date(),
        };
        
        // 🌟 CRITICAL FIX 2: Add default referral fields only if the profile is NEW
        if (!exists) {
            userData.referralCode = generateReferralCode();
            userData.hasUsedFreeQuestion = false;
            userData.referralCredits = 0; 
            console.log(`New user profile created for Firebase UID ${uid} with referral defaults.`);
        }
        
        await userRef.set(userData, { merge: true });
        console.log(`User profile for Firebase UID ${uid} saved/updated in Firestore. Login Method: ${loginMethod}`);


        // 4. Custom JWT wapas bhej dein
        return res.status(200).json({
            message: 'Login Successful!',
            token: customJwt,
            user: { uid, phone: phoneNumber, email: decodedToken.email || null },
        });

    } catch (error) {
        console.error('Error verifying Firebase ID Token:', error.message);
        return res.status(401).json({ message: 'Invalid or expired Firebase ID Token.' });
    }
};


// --- 5) Social login success (Google) (COOP Fix applied) ---
const socialLoginSuccess = async (req, res) => {
    const socialUser = req.user;
    const uid = `google_${socialUser.id}`;
    const email = socialUser.emails?.[0]?.value || null;
    const name = socialUser.displayName || socialUser.name?.givenName || null;
    const token = generateToken(uid);

    // IMPORTANT: Frontend Origin ko URL Fragment ke liye use karein
    const frontendOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173'; 
    
    // Redirect URL mein Token ko fragment (#) ke roop mein bhej rahe hain
    const redirectUrl = `${frontendOrigin}/login-success#token=${token}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email || '')}`;
    
    try {
        const userRef = db.collection('users').doc(uid);
        const doc = await userRef.get();
        const exists = doc.exists;
        
        let userData = {
            uid, 
            name, 
            email, 
            loginMethod: 'google', 
            updatedAt: new Date() 
        };
        
        // 🌟 CRITICAL FIX 3: Add default referral fields only if the profile is NEW
        if (!exists) {
            userData.referralCode = generateReferralCode();
            userData.hasUsedFreeQuestion = false;
            userData.referralCredits = 0; 
            console.log(`New social user profile created for ${uid} with referral defaults.`);
        }
        
        await userRef.set(userData, { merge: true });
        
        // Success hone par, browser ko fragment URL par redirect karein
        return res.redirect(redirectUrl);

    } catch (error) {
        console.error('Error saving social user profile to Firebase:', error);
        
        // Error hone par bhi frontend ko error fragment ke saath redirect karein
        const errorRedirectUrl = `${frontendOrigin}/login-success#error=${encodeURIComponent(error.message)}`;
        return res.redirect(errorRedirectUrl);
    }
};

module.exports = {
    sendOtpPhone,
    sendOtpEmail,
    verifyAuthOtp,
    socialLoginSuccess,
    verifyFirebaseToken, 
};
