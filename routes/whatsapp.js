const express = require('express');
const { sendTextMessage } = require('../services/WhatsAppService');

const router = express.Router();

// Environment variables required for verification and sending messages
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const ADMIN_TOKEN = process.env.WHATSAPP_ADMIN_TOKEN;

// Meta Webhook Verification
// Add this URL in Meta App Dashboard as the webhook callback URL:
//   GET  /api/whatsapp/webhook
router.get('/webhook', (req, res) => {
  try {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  } catch (error) {
    return res.sendStatus(403);
  }
});

// Receive WhatsApp messages/events
//   POST /api/whatsapp/webhook
router.post('/webhook', async (req, res) => {
  try {
    const entry = req.body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // Acknowledge webhook delivery ASAP
    res.sendStatus(200);

    if (!message) {
      return;
    }

    // Only handle text messages for now
    const fromNumber = message.from;
    const textBody = message.text?.body?.trim();

    if (textBody) {
      // Basic auto-reply logic (customize as needed)
      const lower = textBody.toLowerCase();
      let reply = `Thanks for contacting Teofly! You said: "${textBody}"`;

      if (lower.includes('hi') || lower.includes('hello')) {
        reply = 'Hello! 👋 How can we help you today?\n\nOptions:\n1) Pricing\n2) Booking\n3) Portfolio\n4) Contact';
      } else if (lower.startsWith('1') || lower.includes('price')) {
        reply = 'Our pricing varies by service (wedding, portrait, commercial, etc.). Share your date, location, and style, and we will send a quote.';
      } else if (lower.startsWith('2') || lower.includes('book')) {
        reply = 'To book, please send your preferred date, location, and service type. We will confirm availability and next steps.';
      } else if (lower.startsWith('3') || lower.includes('portfolio')) {
        reply = 'You can view our portfolio here: https://teoflys-frontend.vercel.app';
      } else if (lower.startsWith('4') || lower.includes('contact')) {
        reply = 'You can also reach us via email at hello@teofly.com or here on WhatsApp.';
      }

      try {
        await sendTextMessage(fromNumber, reply);
      } catch (sendError) {
        // Swallow to avoid webhook retries; log for server visibility
        console.error('Failed to send WhatsApp reply:', sendError?.response?.data || sendError.message);
      }
    }
  } catch (error) {
    // Acknowledge even on error to prevent repeated deliveries
    try { res.sendStatus(200); } catch (_) {}
  }
});

module.exports = router;

// Admin-only test sender
router.post('/send', async (req, res) => {
  try {
    const adminHeader = req.headers['x-whatsapp-admin-token'];
    if (!ADMIN_TOKEN || adminHeader !== ADMIN_TOKEN) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { to, body } = req.body || {};
    if (!to || !body) {
      return res.status(400).json({ error: 'Missing "to" or "body"' });
    }

    const data = await sendTextMessage(to, body);
    return res.json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ error: error?.response?.data || error.message });
  }
});


