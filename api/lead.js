// Sends each website estimate request to Gage by email (via Resend).
// Vercel environment variables:
//   RESEND_API_KEY  required
//   LEAD_FROM       sender on a domain verified in Resend, e.g. "Ladson Concrete Website <leads@magolabs.in>"
//   LEAD_TO         where leads go (defaults to ladsonconcrete@gmail.com); comma separate for more than one

const esc = (v) => String(v == null ? '' : v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const clip = (v, n) => String(v == null ? '' : v).trim().slice(0, n);

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
    ['Project', clip(d.type, 40)],
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
    return res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok: false });
  }
};
