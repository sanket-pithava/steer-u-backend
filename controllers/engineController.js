const axios = require('axios');

const getPrediction = async (req, res) => {
    const { questionText, userDetails } = req.body;
    if (!questionText || !userDetails || !userDetails.dob || !userDetails.timeOfBirth || !userDetails.placeOfBirth) {
        return res.status(400).json({ message: "All birth details and the question are required." });
    }

    try {
        
        const steeruApiKey = process.env.SECRET_STEERU_API_KEY;
        const steeruApiEndpoint = process.env.STEERU_API_ENDPOINT;

        if (!steeruApiKey || !steeruApiEndpoint) {
            console.error("SteerU API Key or Endpoint is not defined in the .env file.");
            return res.status(500).json({ message: "Engine configuration error." });
        }

        const requestData = {
            birth_details: {
                date: userDetails.dob,
                time: userDetails.timeOfBirth,
                place: userDetails.placeOfBirth,
                gender: userDetails.gender || "Male"
            },
            questions: [questionText]
        };
        console.log("Sending data to SteerU Engine:", JSON.stringify(requestData, null, 2));

        const responseFromEngine = await axios.post(
            steeruApiEndpoint,
            requestData,
            {
                headers: {
                    'Authorization': `Bearer ${steeruApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const prediction = responseFromEngine.data.analysis.answers[0];

        if (!prediction) {
            throw new Error("Prediction not found in the engine response.");
        }
        
        res.status(200).json({ success: true, prediction: prediction });

    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        // Hindi: "SteerU Engine se connect karne mein error:"
        console.error("Error connecting to SteerU Engine:", errorMessage);
        const dummyPrediction = `This is a dummy response: "${questionText}". Could not connect to the real engine. Error: ${errorMessage}`;
        res.status(200).json({ success: true, prediction: dummyPrediction });
    }
};

module.exports = {
    getPrediction,
};
