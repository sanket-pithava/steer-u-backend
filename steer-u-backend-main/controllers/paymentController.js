const Razorpay = require('razorpay');
const crypto = require('crypto');

let razorpay;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } else {
    console.warn('⚠ Razorpay credentials (KEY_ID or KEY_SECRET) missing. Payment routes will fail.');
  }
} catch (err) {
  console.error('Failed to initialize Razorpay:', err.message);
}

/**
 * @desc    Create a new Razorpay order
 * @route   POST /api/payment/create-order
 */
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || !receipt) {
      return res.status(400).json({ message: 'Amount and receipt are required' });
    }

    const options = {
      amount: amount * 100, // Amount ko paisa mein convert karein
      currency,
      receipt,
    };

    if (!razorpay) {
      console.error('Razorpay is not initialized');
      return res.status(500).json({ message: 'Payment gateway configuration error' });
    }

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ message: 'Error creating Razorpay order' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error('Error in createOrder:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Verify a Razorpay payment
 * @route   POST /api/payment/verify
 */
const verifyPayment = (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment authentic hai. Ab aap iski details database mein save kar sakte hain.
      // e.g., await db.collection('payments').add({ ... });

      // Frontend ko success ka response bhejein
      res.status(200).json({
        message: 'Payment verified successfully',
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id
      });
    } else {
      res.status(400).json({ message: 'Invalid signature. Payment verification failed.' });
    }
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
};
