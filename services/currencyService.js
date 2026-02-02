const axios = require('axios');

const convertINRtoUSD = async (amountINR) => {
    try {
        // Using exchangerate-api.com free API
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/INR', {
            timeout: 5000
        });
        const rate = response.data.rates.USD; // INR to USD rate
        const usdAmount = amountINR * rate;
        return Math.round(usdAmount * 100) / 100; // Round to 2 decimal places
    } catch (error) {
        console.error('Error fetching currency rate:', error.message);
        // Fallback to fixed rate: 1 USD = 83 INR
        const fallbackRate = 1 / 83;
        return Math.round((amountINR * fallbackRate) * 100) / 100;
    }
};

module.exports = { convertINRtoUSD };