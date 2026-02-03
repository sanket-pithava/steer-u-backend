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
        // Save feedback to database
        await db.collection('feedback').add({
            issueType,
            message,
            contact,
            timestamp: new Date(timestamp || Date.now()),
            status: 'NEW',
        });

        // Send email notification to admin
        try {
            await sendFeedbackNotification({
                contact,
                issueType,
                message,
                timestamp: timestamp || Date.now()
            });
        } catch (emailError) {
            // Log email error but don't fail the request
            console.error("Failed to send feedback notification email:", emailError);
        }

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
