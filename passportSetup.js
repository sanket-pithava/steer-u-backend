const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config(); // Load environment variables

// Google Strategy Configuration - Only if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET &&
  process.env.GOOGLE_CLIENT_ID !== 'dummy-client-id') {
  passport.use(
    new GoogleStrategy({
      // Yeh values .env file se aayengi
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // Jaise: http://localhost:5000/api/auth/google/callback
      scope: ['profile', 'email'], // Google se user ki profile aur email maangne ke liye
    },
      (accessToken, refreshToken, profile, done) => {
        // Jab Google authentication successful hota hai, toh Passport.js is profile object ko leta hai.
        // Hum simply is profile ko aage ki processing ke liye bhej dete hain.
        // Yeh profile object 'req.user' mein available hoga.
        return done(null, profile);
      })
  );
  console.log('✓ Google OAuth Strategy initialized');
  console.log('Registered Strategies:', Object.keys(passport._strategies));
} else {
  console.warn('⚠ Google OAuth credentials not configured. Google login will not work.');
}

// Session Management (Passport ko zaroori hai, bhale hi hum aage JWT use kar rahe hon)
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = passport;
