const { db } = require('../firebaseAdmin');
const {
  sendPatientConfirmation,
  sendDoctorNotification,
} = require('../services/emailService');

const createBooking = async (req, res) => {
  try {
    const { bookingDetails } = req.body;
    // req.user.uid should be available due to jwtProtect middleware
    const userId = req.user.uid;

    if (!bookingDetails) {
      return res.status(400).json({ message: 'Booking details are required.' });
    }

    // --- ⭐ NEW: Logic for Compatibility Question Transaction ⭐ ---
    // The frontend sends 'plan: "Compatibility Question"' for this transaction.
    if (bookingDetails.plan === "Compatibility Question") {
        
        // Check for fields critical to a paid question transaction
        if (!bookingDetails.paymentId || !bookingDetails.question) {
             return res.status(400).json({ 
                 message: 'Compatibility Question transaction details (paymentId, question) are missing.' 
             });
        }
        
        // Prepare the data with a clear type identifier
        const transactionData = {
          ...bookingDetails,
          userId: userId,
          type: 'Compatibility_Question', // Clearly mark the transaction type
          bookedAt: new Date(),
        };
        
        // Save the transaction record to Firebase (This fixes the frontend error)
        await db.collection('bookings').add(transactionData);

        // Success response for a question transaction (No email required)
        return res.status(201).json({ success: true, message: 'Question transaction saved successfully.' });
    }

    // --- 🌍 EXISTING: Logic for Consultation Booking (Doctor, Email, Meet Link) ---

    // Extract fields needed for consultation and email
    const userEmail = bookingDetails.patientEmail;
    const doctorEmail = bookingDetails.doctorEmail;
    const meetLink = bookingDetails.meetLink;

    // Run the necessary validation checks for a consultation
    if (!userEmail || !doctorEmail || !meetLink) {
      return res.status(400).json({
        message: 'Patient email, Doctor email, or Meet Link is missing for consultation booking.',
      });
    }

    // 1. Consultation Booking को database में save करें
    const bookingData = {
      ...bookingDetails,
      userId: userId,
      type: 'Consultation_Booking', // Mark the transaction type
      bookedAt: new Date(),
    };
    await db.collection('bookings').add(bookingData);

    // 2. Email Bhejein (SendGrid)
    try {
      await sendPatientConfirmation(userEmail, meetLink, bookingDetails);
      await sendDoctorNotification(doctorEmail, meetLink, bookingDetails);
    
    } catch (emailError) {
      console.error(
        'Booking saved, but failed to send confirmation email:',
        emailError.message
      );
      // Still return success status (201) if booking saved, but warn user about email
      return res.status(201).json({
        success: true,
        message: 'Booking created, but failed to send confirmation email. Please contact support.',
      });
    }

    // 3. Final Success Response for Consultation
    res
      .status(201)
      .json({ success: true, message: 'Booking created and confirmation email sent!' });
  } catch (error) {
    console.error('Error in createBooking main try block:', error);
    res
      .status(500)
      .json({ message: error.message || 'Server error, could not save booking.' });
  }
};

// User ki saari bookings fetch karne ke liye (No Change)
const getMyBookings = async (req, res) => {
  // ... (Your getMyBookings function remains unchanged) ...
  try {
    const userId = req.user.uid;
    const bookingsRef = db.collection('bookings');

    const snapshot = await bookingsRef
      .where('userId', '==', userId)
      .get();

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const userBookings = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      const bookedAtDate =
        data.bookedAt && typeof data.bookedAt.toDate === 'function'
          ? data.bookedAt.toDate()
          : new Date(0);

      userBookings.push({
        id: doc.id,
        ...data,
        bookedAtComparable: bookedAtDate,
      });
    });

    userBookings.sort((a, b) => {
      return b.bookedAtComparable - a.bookedAtComparable;
    });

    const responseData = userBookings.map(
      ({ bookedAtComparable, ...rest }) => rest
    );

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error, could not fetch bookings.' });
  }
};


module.exports = {
  createBooking,
  getMyBookings,
};
