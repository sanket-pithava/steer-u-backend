const axios = require('axios');

const getCountryFromIP = async (ip) => {
    try {
        // Using ipapi.com free API (1000 requests/day)
        const response = await axios.get(`http://ipapi.com/json/${ip}`, {
            timeout: 5000 // 5 second timeout
        });
        const data = response.data;
        if (data.country_name) {
            return data.country_name; // e.g., "India", "United States"
        }
        return 'Unknown';
    } catch (error) {
        console.error('Error fetching country from IP:', error.message);
        return 'Unknown';
    }
};

module.exports = { getCountryFromIP };