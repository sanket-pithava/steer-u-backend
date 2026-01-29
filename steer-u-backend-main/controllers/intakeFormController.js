// controllers/intakeFormController.js
const { db } = require('../firebaseAdmin');
const saveIntakeForm = async (req, res) => {
    try {
        const formData = req.body; // Frontend se poora form data lein
        const userId = req.user.uid; // Token se user ID lein

        if (!formData || !formData.name || !formData.phone) {
            return res.status(400).json({ message: "Name and Phone are required." });
        }

        const intakeData = {
            userId: userId,
            ...formData, // Form ka saara data (name, email, address, etc.)
            submittedAt: new Date()
        };

        const docRef = await db.collection('counselingIntakeForms').add(intakeData);
        console.log("Counselling Intake Form saved to Firebase. Document ID:", docRef.id);

        res.status(201).json({ success: true, message: "Your form has been submitted successfully!" });

    } catch (error) {
        console.error("Error saving intake form:", error);
        res.status(500).json({ message: "Server error, could not save your form." });
    }
};

module.exports = {
    saveIntakeForm,
};
