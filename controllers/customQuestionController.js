// controllers/customQuestionController.js
const { db } = require('../firebaseAdmin');

const saveCustomQuestions = async (req, res) => {
    try {
        const { packageDetails, questionsList, paymentId } = req.body;
        const userId = req.user.uid;

        if (!packageDetails || !questionsList || !paymentId) {
            return res.status(400).json({ message: "Package, questions, and payment ID are required." });
        }

        const customPackageData = {
            userId: userId,
            package: packageDetails,
            questions: questionsList,
            paymentId: paymentId,
            savedAt: new Date()
        };

        const docRef = await db.collection('customQuestionPackages').add(customPackageData);
        console.log("Custom package saved to Firebase. Document ID:", docRef.id);

        res.status(201).json({ success: true, message: "Your custom questions have been submitted successfully!" });

    } catch (error) {
        console.error("Error saving custom questions:", error);
        res.status(500).json({ message: "Server error, could not save your questions." });
    }
};

module.exports = {
    saveCustomQuestions,
};
