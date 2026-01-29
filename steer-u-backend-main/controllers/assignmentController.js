// controllers/assignmentController.js

// Step 1: Apni firebaseAdmin.js file se 'db' (database connection) ko import karein
const { db } = require('../firebaseAdmin');

const submitAssignment = async (req, res) => {
    try {
        // Step 2: Frontend se assessment ka type aur jawaab lein
        const { assessmentType, answers } = req.body;
        
        // Step 3: JWT token se user ki ID nikalein
        const userId = req.user.uid;

        // Validation
        if (!assessmentType || !answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: "Assessment type aur saare answers zaroori hain." });
        }

        console.log(`User ${userId} ne '${assessmentType}' assessment submit kiya.`);
        
        // --- STEP 4: FIREBASE MEIN DATA SAVE KARNE KA ASLI LOGIC ---
        
        // Data ko ek object mein taiyaar karein
        const assignmentData = {
            userId: userId,
            type: assessmentType,
            answers: answers, // answers should be an array like [{ question: '...', answer: '...' }]
            submissionDate: new Date() // Submission ka time save karein
        };

        // Data ko 'assignments' collection mein ek naye document ke roop mein add karein
        const docRef = await db.collection('assignments').add(assignmentData);

        console.log("Assignment Firebase mein save ho gaya. Document ID:", docRef.id);
        // -----------------------------------------------------------

        // Step 5: Frontend ko success ka message bhejein
        res.status(201).json({ success: true, message: "Your assignment has been submitted successfully!" });

    } catch (error) {
        console.error("Assignment submit karne mein error:", error);
        res.status(500).json({ message: "Server error, assignment could not be submitted." });
    }
};

module.exports = {
    submitAssignment,
};

