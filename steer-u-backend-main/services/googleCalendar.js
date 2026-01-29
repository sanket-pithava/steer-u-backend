const { google } = require('googleapis');
const dayjs = require('dayjs');

// 1. Google credentials file ka path (yeh file backend root mein honi chahiye)
const KEYFILEPATH = './google-credentials.json';
const SCOPES = ['https://www.googleapis.com/auth/calendar'];

// 2. Service account ko authorize karein
const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

// 3. Calendar object banayein
const calendar = google.calendar({ version: 'v3', auth });

// 4. Apni Calendar ID yahan paste karein
const CALENDAR_ID =
  '92ae383607073ce31918866946fe4b01557bdea2e55951a5fdd9c1c5c60984ca@group.calendar.google.com';

/**
 * Google Calendar par GMeet ke saath event create karta hai
 * @param {object} bookingDetails - Frontend se aaya hua poora data
 */
async function createGoogleMeetEvent(bookingDetails) {
  try {
    const { date, slot, pseudoName, doctor, patientEmail } = bookingDetails;
    // date aa raha hai "Mon Sep 29 2025"
    // slot aa raha hai "12:00 PM"

    // --- Date/Time Logic (using dayjs) ---
    const hourString = slot.split(':')[0]; // "12"
    const minuteString = slot.split(':')[1].split(' ')[0]; // "00"
    const period = slot.split(' ')[1]; // "PM"

    let hour = parseInt(hourString);
    const minute = parseInt(minuteString);

    if (period === 'PM' && hour !== 12) {
      hour += 12; // 1 PM -> 13
    }
    if (period === 'AM' && hour === 12) {
      hour = 0; // 12 AM -> 00
    }
    // 12 PM special case (12 PM hi rehta hai)
    if (period === 'PM' && hour === 12) {
      hour = 12;
    }
    // --- End of Date/Time Logic ---

    const startTime = dayjs(new Date(date))
      .hour(hour)
      .minute(minute)
      .second(0);
    const endTime = startTime.add(1, 'hour'); // 1 ghante ka session

    console.log('Creating Google Calendar event for:', startTime.toISOString());

    const event = {
      summary: `Therapy Session: ${doctor} & ${pseudoName}`,
      description: `Online therapy session.\nPatient: ${pseudoName}\nDoctor: ${doctor}\nPatient Email: ${patientEmail}`,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'Asia/Kolkata',
      },
      // Yeh automatically Google Meet link banata hai
      conferenceData: {
        createRequest: {
          requestId: `astro-booking-${Date.now()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      // ⭐️ CHANGE: Humne 'attendees' aur 'sendNotifications' ko hata diya hai
      // taaki 403 error na aaye.
    };

    const response = await calendar.events.insert({
      calendarId: CALENDAR_ID,
      resource: event,
      conferenceDataVersion: 1, // GMeet link ke liye zaroori
    });

    console.log(
      'Google Calendar event created. Link:',
      response.data.hangoutLink
    );
    
    // ⭐️ CHANGE: Hum poora response data (jismein 'hangoutLink' hai) return kar rahe hain
    return response.data;

  } catch (error) {
    console.error('Google Calendar event create karne mein error:', error.message);
    throw new Error('Could not create calendar event');
  }
}

module.exports = { createGoogleMeetEvent };
