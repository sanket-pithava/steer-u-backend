const { db } = require('../firebaseAdmin');

// User ki profile details fetch karne ka logic
const getProfile = async (req, res) => {
    try {
        const userId = req.user.uid; // Yeh token se milega
        const userRef = db.collection('users').doc(userId);
        const doc = await userRef.get();

        if (!doc.exists) {
            return res.status(404).json({ message: "User profile not found." });
        }

        res.status(200).json(doc.data());
    } catch (error) {
        console.error("Error fetching profile:", error);
        res.status(500).json({ message: "Server error while fetching profile." });
    }
};

// User ki profile update karne ka logic
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.uid;
        const profileData = req.body; // Frontend se naya data lein

        const userRef = db.collection('users').doc(userId);
        
        // set() with merge:true ka matlab hai ki sirf diye gaye fields ko update karo, baaki ko mat chhedo
        await userRef.set(profileData, { merge: true });

        console.log(`Profile for user ${userId} updated.`);
        res.status(200).json({ success: true, message: "Profile updated successfully!" });

    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Server error while updating profile." });
    }
};

module.exports = {
    getProfile,
    updateProfile,
};
