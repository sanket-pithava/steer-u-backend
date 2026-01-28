// services/emailService.js
const sgMail = require('@sendgrid/mail');

// 1. SendGrid API Key ko set karein
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const SENDER_EMAIL = process.env.EMAIL_USER;

/**
 * Sends a confirmation email to the patient.
 */
const sendPatientConfirmation = async (
  patientEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot } = bookingDetails;

  const msg = {
  to: patientEmail, // Patient email
  from: SENDER_EMAIL, // Verified sender email (from EMAIL_USER)
  subject: `Booking Confirmed: ${doctor} on ${date}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
        <h2 style="color: #f76822; text-align: center;">Booking Confirmed!</h2>
        <p>Hi <strong>${pseudoName}</strong>,</p>
        <p>Your therapy session booking with <strong>${doctor}</strong> is confirmed.</p>

        <h3 style="color: #6b2400;">Session Details:</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li><strong>Doctor:</strong> ${doctor}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${slot}</li>
        </ul>

        <h3 style="color: #6b2400;">Google Meet Link:</h3>
        <p>To join the session, please click the link below:</p>
        <a 
          href="${hangoutLink}" 
          style="display:inline-block; background-color: #f76822; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;"
        >
          Join Google Meet
        </a>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

        <div style="text-align: center;">
          <p style="color: #333; font-size: 14px; margin-bottom: 8px;">
            🌐 <a href="https://steer-u.com/" target="_blank" style="color: #f76822; text-decoration: none;">steer-u.com</a> helps you get
            <strong>Future Predictions</strong> (2 free questions) & online 
            <strong>Psychological Counselling</strong> services (free tips & paid online sessions) 
            — with <strong>confidentiality guaranteed</strong>.
          </p>

          <p style="font-size: 15px; font-weight: bold; color: #6b2400; margin-top: 15px;">
            You can write the next episode of your life!<br/>
            <span style="color: #f76822;">Steer Your Happiness!</span>
          </p>

          <div style="margin-top: 20px;">
            <p style="font-size: 13px; color: #555;">Connect with us:</p>

            <!-- Facebook -->
            <a href="https://www.facebook.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Facebook" />
            </a>

            <!-- Instagram -->
            <a href="https://www.instagram.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Instagram" />
            </a>

            <!-- LinkedIn -->
            <a href="https://www.linkedin.com/company/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="LinkedIn" />
            </a>

            <!-- Twitter -->
            <a href="https://x.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Twitter" />
            </a>
          </div>

          <p style="margin-top: 15px; font-size: 13px; color: #777;">
            📧 <a href="mailto:admin@steer-u.com" style="color: #f76822; text-decoration: none;">admin@steer-u.com</a>
          </p>
        </div>
      </div>
    </div>
  `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Patient confirmation email sent to: ${patientEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${patientEmail}:`, error);
    if (error.response) {
      console.error(error.response.body); // SendGrid se mila specific error
    }
    throw error; // Error ko aage pass karein
  }
};

/**
 * Sends a notification email to the doctor.
 */
const sendDoctorNotification = async (
  doctorEmail,
  hangoutLink,
  bookingDetails
) => {
  const { pseudoName, doctor, date, slot, patientEmail, mobile } = bookingDetails;

  const msg = {
  to: patientEmail, // Patient email
  from: SENDER_EMAIL, // Verified sender email (from EMAIL_USER)
  subject: `Booking Confirmed: ${doctor} on ${date}`,
  html: `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f9f9f9; padding: 20px;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; padding: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        
        <h2 style="color: #f76822; text-align: center;">Booking Confirmed!</h2>
        <p>Hi <strong>${pseudoName}</strong>,</p>
        <p>Your therapy session booking with <strong>${doctor}</strong> is confirmed.</p>

        <h3 style="color: #6b2400;">Session Details:</h3>
        <ul style="list-style: none; padding-left: 0;">
          <li><strong>Doctor:</strong> ${doctor}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${slot}</li>
        </ul>

        <h3 style="color: #6b2400;">Google Meet Link:</h3>
        <p>To join your online session, click the link below:</p>
        <a 
          href="${hangoutLink}" 
          style="display: inline-block; background-color: #f76822; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;"
        >
          Join Google Meet
        </a>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />

        <div style="text-align: center;">
          <p style="color: #333; font-size: 14px; margin-bottom: 8px;">
            🌐 <a href="https://steer-u.com/" target="_blank" style="color: #f76822; text-decoration: none;">steer-u.com</a> helps you get
            <strong>Future Predictions</strong> (2 free questions) & online 
            <strong>Psychological Counselling</strong> services (free tips & paid online sessions) 
            — with <strong>confidentiality guaranteed</strong>.
          </p>

          <p style="font-size: 15px; font-weight: bold; color: #6b2400; margin-top: 15px;">
            You can write the next episode of your life!<br/>
            <span style="color: #f76822;">Steer Your Happiness!</span>
          </p>

          <div style="margin-top: 20px;">
            <p style="font-size: 13px; color: #555;">Connect with us:</p>

            <a href="https://www.facebook.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Facebook" />
            </a>

            <a href="https://www.instagram.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Instagram" />
            </a>

            <a href="https://www.linkedin.com/company/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="LinkedIn" />
            </a>

            <a href="https://x.com/steeruofficial" style="margin: 0 6px;">
              <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAAv0lEQVR42mNgGAU0A9S/w8DgPwMKzQxAcRX+YpD0zAwDA6L///+HyK7BMDIAHhwQHwPSUG4sKsoMyAjgcAQYoJBBkpF2iKqYmJhMzAw5v9/f/9AyMAAAXyIRMT8oJAVxHwNQAAAwPsDqEY5ITyE2gIx8gAEqULUoZAGFBYqzK4wXDEAwMdQNvCIFAoA0oJD8YCE+YDQwkA8ACDd3Sz6CgmNgAAAABJRU5ErkJggg==" width="24" height="24" alt="Twitter" />
            </a>
          </div>
          <p style="margin-top: 15px; font-size: 13px; color: #777;">
            📧 <a href="mailto:admin@steer-u.com" style="color: #f76822; text-decoration: none;">admin@steer-u.com</a>
          </p>
        </div>
      </div>
    </div>
    `,
  };

  try {
    await sgMail.send(msg);
    console.log(`Doctor notification email sent to: ${doctorEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${doctorEmail}:`, error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw error; // Error ko aage pass karein
  }
};
/**
 * Sends feedback/support notification to Admin
 */
const sendFeedbackNotification = async ({ issueType, message, contact, timestamp }) => {

  const msg = {
    to: "admin@steer-u.com", // 👈 change if needed
    from: SENDER_EMAIL,
    subject: "New Support Feedback Received",
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>New Feedback Received</h2>

        <p><strong>Issue Type:</strong> ${issueType}</p>
        <p><strong>Message:</strong> ${message}</p>
        <p><strong>Contact:</strong> ${contact}</p>
        <p><strong>Time:</strong> ${new Date(timestamp).toLocaleString()}</p>

        <hr/>
        <p>Steer-U Support System</p>
      </div>
    `
  };

  await sgMail.send(msg);
  console.log("Support feedback email sent to admin.");
};


module.exports = {
  sendPatientConfirmation,
  sendDoctorNotification,
  sendFeedbackNotification
};

