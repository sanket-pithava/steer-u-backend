const { db } = require('../firebaseAdmin');

// Function 1: Data Save Karne Ke Liye (No Change Needed Here)
const savePrediction = async (req, res) => {
    try {
        const { question, answer, details } = req.body;
        const userId = req.user.uid;

        if (!question || !answer) {
            return res.status(400).json({ message: "Question and answer are required." });
        }

        const predictionData = {
            userId: userId,
            question: question,
            answer: answer,
            details: details || {},
            savedAt: new Date() // Timestamp for sorting
        };

        const docRef = await db.collection('predictions').add(predictionData);
        console.log("Prediction saved to Firebase. Document ID:", docRef.id);

        res.status(201).json({ success: true, message: "Prediction saved successfully." });

    } catch (error) {
        console.error("Error saving prediction:", error);
        res.status(500).json({ message: "Server error, could not save prediction." });
    }
};

// Function 2: Data Fetch Karne Ke Liye (UPDATED - Removed orderBy, Added JS Sort)
const getMyPredictions = async (req, res) => {
    try {
        const userId = req.user.uid;
        const predictionsRef = db.collection('predictions');

        // --- CHANGE: .orderBy() HATA DIYA GAYA ---
        const snapshot = await predictionsRef
                                .where('userId', '==', userId)
                                .get();

        if (snapshot.empty) {
            console.log('No matching predictions found.');
            return res.status(200).json([]);
        }

        const userPredictions = [];
        snapshot.forEach(doc => {
            // Convert Firestore Timestamp to JS Date if necessary for sorting
            const data = doc.data();
            const savedAtDate = data.savedAt && typeof data.savedAt.toDate === 'function'
                ? data.savedAt.toDate()
                : new Date(0); // Default date if savedAt is missing/invalid

            userPredictions.push({
                id: doc.id,
                ...data,
                // Ensure savedAt is a comparable value (like JS Date) for sorting
                savedAtComparable: savedAtDate
            });
        });

        // --- CHANGE: JAVASCRIPT SORTING ADD KI GAYI ---
        userPredictions.sort((a, b) => {
            // Sort by the comparable date, newest first
            return b.savedAtComparable - a.savedAtComparable;
        });

        // Remove the temporary comparable field before sending the response (optional)
        const responseData = userPredictions.map(({ savedAtComparable, ...rest }) => rest);


        res.status(200).json(responseData); // Send sorted data without the temp field

    } catch (error) {
        console.error("Error fetching predictions:", error);
        res.status(500).json({ message: "Server error, could not fetch predictions." });
    }
};


// Updated Exports (No Change from previous update)
module.exports = {
    savePrediction,
    getMyPredictions,
};
