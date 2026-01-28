const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

console.log('[PASSPORT CONFIG] Loading Google OAuth Strategy...');
console.log('[PASSPORT CONFIG] GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET');
console.log('[PASSPORT CONFIG] GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT SET');
console.log('[PASSPORT CONFIG] GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('[PASSPORT CONFIG] ERROR: Google OAuth credentials not found in environment!');
} else {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback",
            },
            (accessToken, refreshToken, profile, done) => {
                return done(null, profile);
            }
        )
    );
    console.log('[PASSPORT CONFIG] ✅ Google Strategy registered successfully');
}

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

console.log('[PASSPORT CONFIG] Passport configuration complete');
