// Sends each website estimate request to Gage by email (via Resend).
// Vercel environment variables:
//   RESEND_API_KEY  required
//   LEAD_FROM       sender on a domain verified in Resend, e.g. "Ladson Concrete Website <leads@magolabs.in>"
//   LEAD_TO         where leads go (defaults to ladsonconcrete@gmail.com); comma separate for more than one

//   AUTOREPLY_FROM  optional sender for the customer auto-reply; defaults to "Gage Ladson, Ladson Concrete" on the LEAD_FROM address
//   AUTOREPLY_REPLY_TO optional; where customer replies go (defaults to ladsonconcrete@gmail.com)
//   SITE_URL        optional; defaults to https://www.ladsonconcretefl.com (used for the logo in the auto-reply)

const PHONE_DISPLAY = '(904) 631-5038';
const PHONE_TEL = '+19046315038';

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

// Branded "here's what happens next" email sent to the customer, signed by Gage.
function autoReply({ name, email, d, photoCount }) {
  const site = (process.env.SITE_URL || 'https://www.ladsonconcretefl.com').replace(/\/$/, '');
  const fromAddr = (/<([^>]+)>/.exec(process.env.LEAD_FROM || '') || [])[1] || (process.env.LEAD_FROM || '').trim();
  const from = process.env.AUTOREPLY_FROM || `Gage Ladson, Ladson Concrete <${fromAddr}>`;
  const replyTo = process.env.AUTOREPLY_REPLY_TO || 'ladsonconcrete@gmail.com';

  const first = name.split(/\s+/)[0];
  const project = clip(d.type, 80);
  const town = clip(d.town, 80);
  const isOther = /^other\b/i.test(project) || /^not picked$/i.test(project);
  const what = !project || isOther ? 'project' : project.toLowerCase();
  const job = `your ${what}` + (town ? ` in ${town}` : '');

  const summary = [
    ['Name', name],
    ['Phone', clip(d.phone, 30)],
    ['Project', project],
    ['Rough size', clip(d.size, 60)],
    ['Where', town],
    ['When', clip(d.when, 60)],
    ['Details', clip(d.msg, 600)],
    ['Photos', photoCount ? `${photoCount} attached` : ''],
  ].filter((r) => r[1]);

  const photoStep = photoCount
    ? 'Thanks for the photos, they help a lot. If you have a wide shot of the whole area or close-ups of any cracks or old concrete, just reply to this email with them.'
    : 'Want a faster, more accurate price? Reply to this email with a few photos of the area: one wide shot plus close-ups of any cracks or old concrete.';

  const steps = [
    ['I\'ll call you within 1 business day', `I\'ll call you at ${esc(clip(d.phone, 30))} to talk through the job. We\'re open Monday to Friday, 9 AM to 5 PM.`],
    ['Send a few photos', esc(photoStep)],
    ['Free on-site estimate', 'We\'ll set up a time that suits you, I\'ll come out, measure up and give you a real price. No cost and no pressure.'],
  ];

  const teal = '#0d6f86';
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;background:#f3f4f2">
<div style="display:none;max-height:0;overflow:hidden">Got your request, ${esc(first)}. Here's what happens next.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f2"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;background:#ffffff;border-radius:10px;overflow:hidden;font-family:Arial,Helvetica,sans-serif;color:#1a2125">
  <tr><td style="background:#ffffff;padding:24px 28px 8px;border-top:6px solid #20b9cf">
    <img src="${site}/assets/logo.png" alt="Ladson Concrete" width="150" style="display:block;width:150px;height:auto;border:0">
  </td></tr>
  <tr><td style="padding:16px 28px 4px">
    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#161c20">Thanks, ${esc(first)}. I got your request.</h1>
    <p style="margin:0 0 8px;font-size:16px;line-height:1.55">Thanks for reaching out about ${esc(job)}. Here's exactly what happens next:</p>
  </td></tr>
  <tr><td style="padding:8px 28px 4px">
    ${steps.map((s, i) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px"><tr>
      <td width="40" valign="top"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:${teal};color:#fff;font-weight:bold;text-align:center;font-size:15px">${i + 1}</div></td>
      <td valign="top" style="font-size:15px;line-height:1.5"><b style="font-size:16px;color:#161c20">${s[0]}</b><br>${s[1]}</td>
    </tr></table>`).join('')}
  </td></tr>
  <tr><td style="padding:4px 28px 22px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#161c20;border-radius:8px"><tr><td style="padding:18px 20px;color:#ffffff;font-size:15px;line-height:1.5">
      <b style="font-size:16px">Need it sooner?</b><br>Give us a call and we'll get you sorted.<br>
      <a href="tel:${PHONE_TEL}" style="display:inline-block;margin-top:12px;background:#20b9cf;color:#0f1417;text-decoration:none;font-weight:bold;font-size:17px;padding:12px 22px;border-radius:6px">Call ${PHONE_DISPLAY}</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:0 28px 8px">
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#5d676d"><b>Your request</b></p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px">
      ${summary.map((r) => `<tr><td style="padding:7px 12px 7px 0;color:#5d676d;vertical-align:top;white-space:nowrap;border-bottom:1px solid #e6e8e6">${r[0]}</td><td style="padding:7px 0;border-bottom:1px solid #e6e8e6">${esc(r[1]).replace(/\n/g, '<br>')}</td></tr>`).join('')}
    </table>
  </td></tr>
  <tr><td style="padding:22px 28px 26px;font-size:16px;line-height:1.5">
    Talk soon,<br><b>Gage Ladson</b><br><span style="color:#5d676d">Owner, Ladson Concrete, LLC</span>
  </td></tr>
  <tr><td style="background:#f3f4f2;padding:16px 28px;font-size:12px;line-height:1.5;color:#5d676d">
    Ladson Concrete, LLC &middot; Bryceville, FL &middot; Serving Jacksonville and Northeast Florida<br>
    <a href="${site}" style="color:${teal}">${site.replace(/^https?:\/\//, '')}</a> &middot; <a href="tel:${PHONE_TEL}" style="color:${teal}">${PHONE_DISPLAY}</a><br>
    You're getting this one-time email because you asked for an estimate on our website.
  </td></tr>
</table>
</td></tr></table></body></html>`;

  const text = [
    `Thanks, ${first}. I got your request.`,
    '',
    `Thanks for reaching out about ${job}. Here's exactly what happens next:`,
    '',
    `1. I'll call you within 1 business day at ${clip(d.phone, 30)} (Mon to Fri, 9 AM to 5 PM).`,
    `2. ${photoStep}`,
    '3. Free on-site estimate: we\'ll set up a time that suits you, I\'ll come out, measure up and give you a real price. No cost and no pressure.',
    '',
    `Need it sooner? Call ${PHONE_DISPLAY}.`,
    '',
    'Your request:',
    ...summary.map((r) => `${r[0]}: ${r[1]}`),
    '',
    'Talk soon,',
    'Gage Ladson',
    'Owner, Ladson Concrete, LLC',
    site.replace(/^https?:\/\//, ''),
  ].join('\n');

  return {
    from,
    to: [email],
    reply_to: replyTo,
    subject: `Got your request, ${first}. Here's what happens next`,
    html,
    text,
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  let d = req.body || {};
  if (typeof d === 'string') { try { d = JSON.parse(d); } catch (e) { d = {}; } }

  // spam trap: real visitors never fill the hidden "company" field
  if (d.company) return res.status(200).json({ ok: true });

  const name = clip(d.name, 80);
  const phone = clip(d.phone, 30);
  if (!name || phone.replace(/\D/g, '').length < 10) return res.status(400).json({ ok: false, error: 'Name and phone required' });

  const rows = [
    ['Project', clip(d.type, 80)],
    ['Rough size', clip(d.size, 60)],
    ['Where', clip(d.town, 80)],
    ['When', clip(d.when, 60)],
    ['Email', clip(d.email, 120)],
    ['Details', clip(d.msg, 2000)],
  ].filter((r) => r[1]);

  const photos = Array.isArray(d.photos) ? d.photos.slice(0, 5) : [];
  const attachments = photos
    .map((p, i) => {
      const m = /^data:image\/(jpeg|png|webp);base64,(.+)$/.exec(String(p && p.data));
      if (!m) return null;
      return { filename: `job-photo-${i + 1}.${m[1] === 'jpeg' ? 'jpg' : m[1]}`, content: m[2] };
    })
    .filter(Boolean);

  const tel = '+1' + phone.replace(/\D/g, '').slice(-10);
  const html = `
  <div style="font-family:Arial,sans-serif;font-size:16px;color:#111;max-width:560px">
    <h2 style="margin:0 0 6px">New estimate request</h2>
    <p style="margin:0 0 18px;color:#555">From the ${esc(clip(d.source, 40) || 'website')} on your website</p>
    <p style="font-size:20px;margin:0 0 4px"><b>${esc(name)}</b></p>
    <p style="margin:0 0 18px"><a href="tel:${tel}" style="font-size:20px;color:#0a7f91"><b>${esc(phone)}</b></a> &nbsp; <a href="sms:${tel}" style="color:#0a7f91">Text back</a></p>
    <table style="border-collapse:collapse;width:100%">
      ${rows.map((r) => `<tr><td style="padding:8px 10px 8px 0;color:#666;vertical-align:top;white-space:nowrap">${r[0]}</td><td style="padding:8px 0;border-bottom:1px solid #eee">${esc(r[1]).replace(/\n/g, '<br>')}</td></tr>`).join('')}
    </table>
    ${attachments.length ? `<p style="margin-top:18px"><b>${attachments.length} photo${attachments.length > 1 ? 's' : ''} attached.</b></p>` : ''}
  </div>`;

  const to = (process.env.LEAD_TO || 'ladsonconcrete@gmail.com').split(',').map((s) => s.trim()).filter(Boolean);
  const body = {
    from: process.env.LEAD_FROM,
    to,
    subject: `New estimate request: ${clip(d.type, 40) || 'Concrete'}${d.town ? ', ' + clip(d.town, 40) : ''} (${name})`,
    html,
    attachments,
  };
  const email = clip(d.email, 120);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) body.reply_to = email;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      console.error('Resend error', r.status, await r.text());
      return res.status(502).json({ ok: false });
    }

    // Auto-reply to the customer (only when they left a valid email).
    // A failure here never blocks the lead, Gage already has it.
    if (body.reply_to) {
      try {
        const ar = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(autoReply({ name, email, d, photoCount: attachments.length })),
        });
        if (!ar.ok) console.error('Auto-reply error', ar.status, await ar.text());
      } catch (e) {
        console.error('Auto-reply failed', e);
      }
    }

    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
};
