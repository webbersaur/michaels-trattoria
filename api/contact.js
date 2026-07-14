// Vercel serverless function — receives the private-feedback form from the Rate Us
// modal and emails it via Resend. Zero-dependency (uses global fetch).
//
// Env vars (set in the Vercel project "michaels"):
//   RESEND_API_KEY     - Resend API key (secret). Required.
//   CONTACT_TO_EMAIL   - where feedback is delivered. Defaults to the owner's address.
//   CONTACT_FROM_EMAIL - verified sender on the shared webbersaurus.com Resend domain.
//
// This replaces a Formspree endpoint (formspree.io/f/michaelstrattoria@att.net) that
// was not a valid Formspree form ID and was almost certainly discarding submissions.

const OWNER_EMAIL = 'michaelstrattoria@att.net';
const PHONE = '(203) 269-5303';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || OWNER_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Michael's Trattoria <noreply@webbersaurus.com>";

  if (!apiKey) {
    console.error('Feedback form not configured: missing RESEND_API_KEY');
    return res.status(500).json({ error: `Form is not configured. Please call us at ${PHONE}.` });
  }

  // Vercel parses JSON bodies automatically; guard for string bodies too.
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (_) { body = {}; }
  }
  body = body || {};

  const name = (body.name || '').toString().trim();
  const email = (body.email || '').toString().trim();
  const phone = (body.phone || '').toString().trim();
  const message = (body.message || '').toString().trim();
  const honeypot = (body.company || '').toString().trim(); // hidden spam trap

  // Silently accept and drop bot submissions.
  if (honeypot) return res.status(200).json({ ok: true });

  if (!name || !message) {
    return res.status(400).json({ error: 'Please add your name and a short message.' });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
  ));

  const fields = [['Name', name], ['Email', email || '—'], ['Phone', phone || '—']];
  const rows = fields
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;font-weight:bold;vertical-align:top">${k}</td><td style="padding:4px 0">${esc(v)}</td></tr>`)
    .join('');

  const heading = "Private feedback — Michael's Trattoria";

  const html = `
    <h2 style="margin:0 0 12px">${heading}</h2>
    <table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows}</table>
    <p style="font-family:Arial,sans-serif;font-size:14px;margin:16px 0 4px"><strong>What happened</strong></p>
    <p style="font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;margin:0">${esc(message)}</p>
  `;

  const text = `${heading}

${fields.map(([k, v]) => `${k}: ${v}`).join('\n')}

What happened:
${message}`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        ...(email ? { reply_to: `${name} <${email}>` } : {}),
        subject: `Private feedback from ${name}`,
        html,
        text,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ error: `We could not send your message. Please call us at ${PHONE}.` });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Feedback handler error', err);
    return res.status(500).json({ error: `Something went wrong. Please call us at ${PHONE}.` });
  }
};
