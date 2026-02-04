const axios = require('axios');

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
        console.log("SteerU API Key:", steeruApiKey);
        console.log("SteerU API Endpoint:", steeruApiEndpoint);
        // Note: Strict check removed to allow dummy prediction if keys are missing
        if (steeruApiKey && steeruApiEndpoint) {
            // Convert date from DD-MM-YYYY to YYYY-MM-DD
            const dobParts = userDetails.dob.split('-');
            const formattedDob = `${dobParts[2]}-${dobParts[1].padStart(2, '0')}-${dobParts[0].padStart(2, '0')}`;

            const requestData = {
                birth_details: [{
                    date: formattedDob,
                    time: userDetails.timeOfBirth,
                    place: userDetails.placeOfBirth,
                    gender: userDetails.gender || "Male"
                }],
                questions: [questionText]
            };
            console.log("Sending data to SteerU Engine:", JSON.stringify(requestData, null, 2));

            const responseFromEngine = await axios.post(
                steeruApiEndpoint + "/analyzeAstro",
                requestData,
                {
                    headers: {
                        'Authorization': `Bearer ${steeruApiKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const prediction = responseFromEngine.data.analysis.answers[0];

            if (prediction) {
                return res.status(200).json({ success: true, prediction: prediction });
            }
        }

        // Fallback for missing keys or missing prediction
        console.log("Falling back to dummy prediction due to missing keys or engine response.");
        const dummyPrediction = `This is a dummy response: "${questionText}". Could not connect to the real engine. (Local testing mode or missing API configuration)`;
        res.status(200).json({ success: true, prediction: dummyPrediction });

    } catch (error) {
        console.error("Error connecting to SteerU Engine:", error.response ? JSON.stringify(error.response.data) : error.message);
        const dummyPrediction = `This is a dummy response: "${questionText}". Could not connect to the real engine. Error: ${error.message}`;
        res.status(200).json({ success: true, prediction: dummyPrediction });
    }
};

module.exports = {
    getPrediction,
};

