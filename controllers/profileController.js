// controllers/ProfileController.js
const { db } = require('../firebaseAdmin');

// User ki profile details fetch karne ka logic
const getProfile = async (req, res) => {
    try {
        const userId = req.user.uid; 
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            console.log(`No profile found for user ${userId}. Returning default profile.`);
            
            // ⭐ FIX FOR AUTO-LOGOUT: userId and email ko explicit return karen
            return res.status(200).json({
                phone: userId, 
                // Agar JWT se email milta hai to use karein, warna khali rakhein.
                email: req.user.email || "", 
                uid: userId, 
                dob: "",
                placeOfBirth: "",
                timeOfBirth: "",
                gender: "male" 
            });
        }

        res.status(200).json(doc.data());

    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error while fetching profile." });
    }
};

// User ki profile update karne ka logic (No Change)
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const profileData = req.body; 

        const userRef = db.collection('users').doc(userId);
        
        const dataToUpdate = {
            ...profileData,
            updatedAt: new Date()
        };

        await userRef.set(dataToUpdate, { merge: true });

        console.log(`Profile for user ${userId} updated.`);
        res.status(200).json({ success: true, message: "Profile updated successfully!" });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};

// --- ⭐ Intake Form Submission Status Check ⭐ ---
const checkIntakeStatus = async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // चेक करें कि इस यूज़र के लिए 'intakeForms' collection में कोई एंट्री मौजूद है या नहीं।
        const snapshot = await db.collection('intakeForms')
                                 .where('userId', '==', userId)
                                 .limit(1)
                                 .get();
        
        const hasSubmittedIntake = !snapshot.empty;
        
        res.status(200).json({ 
            success: true,
            hasSubmittedIntake: hasSubmittedIntake
        });

    } catch (error) {
        console.error("Error checking intake status:", error);
        res.status(500).json({ 
            success: false, 
            message: "Server error while checking intake status.",
            hasSubmittedIntake: false 
        });
    }
};
// --------------------------------------------------

module.exports = {
    getProfile,
    updateProfile,
    checkIntakeStatus, 
};
