// controllers/pricingController.js
const { db } = require('../firebaseAdmin');
const { convertINRtoUSD } = require('../services/currencyService');

const getPricing = async (req, res) => {
    try {
        const uid = req.user.uid;
        const userDoc = await db.collection('users').doc(uid).get();

        if (!userDoc.exists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userData = userDoc.data();
        const country = userData.country || 'India'; // Default to India if not detected

        const basePriceINR = 1800;
        const finalPriceINR = basePriceINR * 4; // 7200 INR

        let currency, price;

        if (country === 'India') {
            currency = 'INR';
            price = finalPriceINR;
        } else {
            currency = 'USD';
            price = await convertINRtoUSD(finalPriceINR);
        }

        res.json({
            country,
            currency,
            price
        });
    } catch (error) {
        console.error('Error in getPricing:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { getPricing };