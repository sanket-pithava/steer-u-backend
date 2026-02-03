const { db } = require("../firebaseAdmin");
const { sendFeedbackEmail } = require("../services/emailService");

const submitFeedback = async (req, res) => {
  const { issueType, message, timestamp, contact } = req.body;

  // Validation
  if (!issueType || !message) {
    return res.status(400).json({
      message: "Issue type and message are required.",
    });
  }

  if (!contact || contact.trim() === "") {
    return res.status(400).json({
      message: "Please enter your Email or Phone number.",
    });
  }

  try {
    // Save feedback to Firestore
    await db.collection("feedback").add({
      issueType,
      message,
      contact,
      timestamp: new Date(timestamp || Date.now()),
      status: "NEW",
      createdAt: new Date(),
    });

    // Send email to admin
    await sendFeedbackEmail({
      issueType,
      message,
      contact,
      timestamp,
    });

    return res.status(200).json({
      success: true,
      message: "Your feedback has been submitted successfully!",
    });
  } catch (error) {
    console.error("❌ Feedback Error:", error);
    return res.status(500).json({
      message: "Server error: could not save feedback or send email.",
    });
  }
};

module.exports = { submitFeedback };
