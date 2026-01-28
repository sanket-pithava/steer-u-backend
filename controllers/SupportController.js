const { db } = require('../firebaseAdmin');
const { sendFeedbackNotification } = require('../services/emailService');

const submitFeedback = async (req, res) => {
    const { issueType, message, timestamp, contact } = req.body;
    if (!issueType || !message) {
        return res.status(400).json({ message: "Issue type and message are required." });
    }

    if (!contact || contact.trim() === "") {
        return res.status(400).json({ message: "Please enter your Email or Phone number." });
    }

    try {
        const feedbackData = {
            issueType,
            message,
            contact,
            timestamp: new Date(timestamp || Date.now()),
            status: 'NEW',
        };

        // Save to Firestore
        await db.collection('feedback').add(feedbackData);

        // Send Email Notification to Admin (don't await so user doesn't wait for email)
        sendFeedbackNotification({
            issueType,
            message,
            contact,
            timestamp: feedbackData.timestamp
        }).catch(err => console.error("Background email error:", err));

        return res.status(200).json({
            success: true,
            message: "Your feedback has been submitted successfully!"
        });

    } catch (error) {
        console.error("Error saving feedback:", error);
        return res.status(500).json({
            message: "Server error: could not save feedback."
        });
    }
};

module.exports = {
    submitFeedback
};
