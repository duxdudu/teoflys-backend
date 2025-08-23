const axios = require('axios');

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID; // From Meta > WhatsApp > API Setup

/**
 * Send a simple text message via WhatsApp Cloud API
 * @param {string} toE164 Without plus sign country code or as given by webhook (e.g., "15551234567")
 * @param {string} body   Message text body
 */
async function sendTextMessage(toE164, body) {
  if (!ACCESS_TOKEN || !PHONE_NUMBER_ID) {
    throw new Error('WhatsApp API credentials are not configured. Set WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID.');
  }

  const url = `https://graph.facebook.com/v21.0/${PHONE_NUMBER_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: toE164,
    type: 'text',
    text: { body }
  };

  const headers = {
    Authorization: `Bearer ${ACCESS_TOKEN}`,
    'Content-Type': 'application/json'
  };

  const response = await axios.post(url, payload, { headers });
  return response.data;
}

module.exports = {
  sendTextMessage,
};


