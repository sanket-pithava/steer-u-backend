const { db } = require('../firebaseAdmin');
const { sendFeedbackEmail } = require('../services/emailService');

const submitFeedback = async (req, res) => {
    const { issueType, message, timestamp, contact } = req.body;

    if (!issueType || !message) {
        return res.status(400).json({ message: "Issue type and message are required." });
    }

    if (!contact || contact.trim() === "") {
        return res.status(400).json({ message: "Please enter your Email or Phone number." });
    }

    try {
        // 1️⃣ Save feedback to Firebase
        await db.collection('feedback').add({
            issueType,
            message,
            contact,  
            timestamp: new Date(timestamp || Date.now()),
            status: 'NEW',
        });

        // 2️⃣ Send feedback email to admin
        await sendFeedbackEmail({ issueType, message, contact, timestamp });

        return res.status(200).json({
            success: true,
            message: "Your feedback has been submitted successfully!"
        });

    } catch (error) {
        console.error("Error saving feedback or sending email:", error);
        return res.status(500).json({
            message: "Server error: could not save feedback or send email."
        });
    }
};

module.exports = {
    submitFeedback
};
