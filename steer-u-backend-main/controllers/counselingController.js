const { db } = require('../firebaseAdmin');

const saveSymptoms = async (req, res) => {
    try {
        const { rating, symptoms } = req.body;
        const userId = req.user.uid;

        if (!rating || !symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
            return res.status(400).json({ message: "Rating and at least one symptom are required." });
        }

        const counselingEntry = {
            userId: userId,
            feelingRating: rating,
            selectedSymptoms: symptoms,
            savedAt: new Date()
        };

        const docRef = await db.collection('counselingData').add(counselingEntry);
        console.log("Counseling data saved to Firebase. Document ID:", docRef.id);

        res.status(201).json({ success: true, message: "Your feelings and symptoms have been saved." });

    } catch (error) {
        console.error("Error saving counseling data:", error);
        res.status(500).json({ message: "Server error, could not save your data." });
    }
};

module.exports = {
    saveSymptoms,
};
