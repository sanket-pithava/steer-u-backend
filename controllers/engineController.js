const axios = require('axios');

/**
 * Analyze birth chart and answer questions
 * POST /analyze_astro
 * Requires: Bearer token authentication
 * Body: {
 *   birth_details: { date, time, place, gender },
 *   questions: [string],
 *   skip_llm: boolean (optional)
 * }
 */
const analyzeAstro = async (req, res) => {
    const { birth_details, questions, skip_llm } = req.body;

    // Validation
    if (!birth_details) {
        return res.status(400).json({ 
            message: "Birth details are required.",
            required_fields: ["date", "time", "place", "gender"]
        });
    }

    if (!birth_details.date) {
        return res.status(400).json({ message: "Date of birth (YYYY-MM-DD) is required." });
    }
    if (!birth_details.time) {
        return res.status(400).json({ message: "Time of birth (HH:MM) is required." });
    }
    if (!birth_details.place) {
        return res.status(400).json({ message: "Place of birth is required." });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: "Questions array is required and must contain at least one question." });
    }

    try {
        const steeruApiKey = process.env.SECRET_STEERU_API_KEY;
        const steeruApiEndpoint = process.env.STEERU_API_ENDPOINT;

        console.log("🔍 SteerU API Endpoint:", steeruApiEndpoint);
        console.log("🔐 SteerU API Key configured:", !!steeruApiKey);

        // Convert date from DD-MM-YYYY to YYYY-MM-DD if needed
        let formattedDate = birth_details.date;
        if (birth_details.date && birth_details.date.includes('-')) {
            const dateParts = birth_details.date.split('-');
            if (dateParts.length === 3 && dateParts[2].length === 4) {
                // Format is DD-MM-YYYY, convert to YYYY-MM-DD
                formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
                console.log(`📅 Date converted from ${birth_details.date} to ${formattedDate}`);
            }
        }

        // If API keys are configured, use the real engine
        if (steeruApiKey && steeruApiEndpoint) {
            const requestData = {
                birth_details: {
                    date: formattedDate,
                    time: birth_details.time,
                    place: birth_details.place,
                    gender: birth_details.gender || "Male"
                },
                questions: questions,
                skip_llm: skip_llm || false
            };

            console.log("📤 Sending to SteerU Engine:", JSON.stringify(requestData, null, 2));

            try {
                const responseFromEngine = await axios.post(
                    `${steeruApiEndpoint}/analyze_astro`,
                    requestData,
                    {
                        headers: {
                            'Authorization': `Bearer ${steeruApiKey}`,
                            'Content-Type': 'application/json'
                        },
                        timeout: 30000 // 30 second timeout
                    }
                );

                if (responseFromEngine.data && responseFromEngine.data.analysis && responseFromEngine.data.analysis.answers) {
                    console.log("✅ Engine response received successfully");
                    return res.status(200).json({
                        success: true,
                        analysis: {
                            answers: responseFromEngine.data.analysis.answers
                        }
                    });
                } else {
                    console.log("⚠️ Unexpected engine response structure");
                    throw new Error("Invalid response structure from engine");
                }

            } catch (engineError) {
                console.error("❌ Engine error:", engineError.message);
                // Fallback to dummy response if engine fails
                console.log("↩️ Falling back to dummy response");
                const dummyAnswers = questions.map(q => 
                    `Dummy response for: "${q}". Could not reach the astro engine. Error: ${engineError.message}`
                );
                return res.status(200).json({
                    success: true,
                    fallback: true,
                    analysis: {
                        answers: dummyAnswers
                    }
                });
            }
        }

        // Fallback if API keys are not configured
        console.log("↩️ No API keys configured. Using dummy fallback response.");
        const dummyAnswers = questions.map(q => 
            `Dummy response for: "${q}". Engine API is not configured. Please set STEERU_API_ENDPOINT and SECRET_STEERU_API_KEY environment variables.`
        );
        
        res.status(200).json({
            success: true,
            fallback: true,
            analysis: {
                answers: dummyAnswers
            }
        });

    } catch (error) {
        console.error("❌ Unexpected error in analyzeAstro:", error.message);
        return res.status(500).json({
            success: false,
            message: "An error occurred while processing your request.",
            error: error.message
        });
    }
};

/**
 * Legacy endpoint for backwards compatibility
 * This maps to the old getPrediction function signature
 */
const getPrediction = async (req, res) => {
    const { questionText, userDetails } = req.body;

    if (!questionText) {
        return res.status(400).json({ message: "The question text is required." });
    }
    if (!userDetails) {
        return res.status(400).json({ message: "User details are missing." });
    }
    if (!userDetails.dob) {
        return res.status(400).json({ message: "Date of Birth (DOB) is required." });
    }
    if (!userDetails.timeOfBirth) {
        return res.status(400).json({ message: "Time of Birth is required." });
    }
    if (!userDetails.placeOfBirth) {
        return res.status(400).json({ message: "Place of Birth is required." });
    }

    try {
        const steeruApiKey = process.env.SECRET_STEERU_API_KEY;
        const steeruApiEndpoint = process.env.STEERU_API_ENDPOINT;

        if (steeruApiKey && steeruApiEndpoint) {
            // Convert date from DD-MM-YYYY to YYYY-MM-DD
            const dobParts = userDetails.dob.split('-');
            const formattedDob = `${dobParts[2]}-${dobParts[1].padStart(2, '0')}-${dobParts[0].padStart(2, '0')}`;

            const requestData = {
                birth_details: {
                    date: formattedDob,
                    time: userDetails.timeOfBirth,
                    place: userDetails.placeOfBirth,
                    gender: userDetails.gender || "Male"
                },
                questions: [questionText],
                skip_llm: false
            };

            console.log("📤 Sending data to SteerU Engine:", JSON.stringify(requestData, null, 2));

            const responseFromEngine = await axios.post(
                `${steeruApiEndpoint}/analyze_astro`,
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${steeruApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            const prediction = responseFromEngine.data.analysis.answers[0];

            if (prediction) {
                return res.status(200).json({ success: true, prediction: prediction });
            }
        }

        // Fallback for missing keys or missing prediction
        console.log("↩️ Falling back to dummy prediction due to missing keys or engine response.");
        const dummyPrediction = `Dummy response: "${questionText}". Could not connect to the real engine. (Local testing mode or missing API configuration)`;
        res.status(200).json({ success: true, prediction: dummyPrediction, fallback: true });

    } catch (error) {
        console.error("❌ Error connecting to SteerU Engine:", error.response?.data || error.message);
        const dummyPrediction = `Dummy response: "${questionText}". Engine error: ${error.message}`;
        res.status(200).json({ success: true, prediction: dummyPrediction, fallback: true });
    }
};

module.exports = {
    analyzeAstro,
    getPrediction,
};

