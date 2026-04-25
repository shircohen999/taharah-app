'use strict';
// ═══════════════════════════════════════════════════════
// Vercel serverless function — daily email notifications
// Called by a cron job (cron-job.org) once per day
// ═══════════════════════════════════════════════════════

const { initializeApp, getApps, cert } = require('firebase-admin/app');
const { getFirestore }                  = require('firebase-admin/firestore');
const nodemailer                        = require('nodemailer');

// ── Date helpers ─────────────────────────────────────────────────────────
const ad   = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const iso  = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const diff = (a, b) => Math.round((new Date(a) - new Date(b)) / 864e5);

function nextHebSameDay(from) {
  try {
    const fmt = d => new Intl.DateTimeFormat('he-u-ca-hebrew-nu-latn', { day: 'numeric' }).format(d);
    const target = fmt(from);
    for (let i = 25; i <= 35; i++) if (fmt(ad(from, i)) === target) return ad(from, i);
  } catch (_) {}
  return ad(from, 30);
}

// ── Firebase Admin — singleton ───────────────────────────────────────────
function getDb() {
  if (!getApps().length) {
    const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    initializeApp({ credential: cert(sa) });
  }
  return getFirestore();
}

// ── Gmail transporter ────────────────────────────────────────────────────
function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

// ── Calculate which events fire today for a user ─────────────────────────
function calcEvents(cycles, prefs, today) {
  const todayIso = iso(today);
  const events   = [];
  const isHe     = (prefs.lang || 'he') !== 'en';
  const ND       = { hpstDays:0, sefirahDays:0, tvilaDays:0, prishaDays:1, nextDays:2, bedikaDays:0 };
  const off      = key => prefs[key] !== undefined ? prefs[key] : ND[key];

  const sorted = [...cycles].sort((a, b) => new Date(a.date) - new Date(b.date));

  sorted.forEach(c => {
    const start    = new Date(c.date);
    const hpstDate = c.hpst ? new Date(c.hpst) : ad(start, 4);
    const sef      = ad(hpstDate, 1);
    const tvila    = ad(hpstDate, 7);
    const hO = off('hpstDays'), sO = off('sefirahDays'), tO = off('tvilaDays'),
          pO = off('prishaDays'), bO = off('bedikaDays');

    if (prefs.hpst !== false && iso(ad(hpstDate, -hO)) === todayIso)
      events.push(isHe
        ? { title: hO===0?'הפסק טהרה היום':`הפסק טהרה בעוד ${hO} ימים`,      body: 'זמן להפסק טהרה' }
        : { title: hO===0?'Hefsek Tahara today':`Hefsek Tahara in ${hO} days`, body: 'Time for Hefsek Tahara' });

    if (prefs.sefirah !== false && iso(ad(sef, -sO)) === todayIso)
      events.push(isHe
        ? { title: sO===0?'תחילת ספירת 7 נקיים':`ספירת 7 נקיים בעוד ${sO} ימים`, body: 'היום מתחילה ספירת 7 ימים נקיים' }
        : { title: sO===0?'Starting 7 Clean Days':`7 Clean Days in ${sO} days`,    body: 'Today begins the 7 clean days count' });

    if (prefs.bedika !== false) {
      for (let i = 0; i < 7; i++) {
        if (iso(ad(ad(sef, i), -bO)) === todayIso)
          events.push(isHe
            ? { title: `בדיקה — יום ${i+1} מתוך 7`,    body: `היום בדיקה של יום ${i+1} בספירת 7 הנקיים` }
            : { title: `Bedikah — Day ${i+1} of 7`,     body: `Today is bedikah day ${i+1} of 7 clean days` });
      }
      if (iso(ad(tvila, -bO)) === todayIso)
        events.push(isHe
          ? { title: 'בדיקה — ליל הטבילה',      body: 'הלילה ליל הטבילה — לזכור בדיקה אחרונה' }
          : { title: 'Bedikah — Mikveh Night',   body: 'Tonight is mikveh night — remember the final bedikah' });
    }

    if (prefs.tvila !== false && iso(ad(tvila, -tO)) === todayIso)
      events.push(isHe
        ? { title: tO===0?'ליל הטבילה':`ליל הטבילה בעוד ${tO} ימים`, body: 'הלילה הוא ליל הטבילה. ברכה והצלחה!' }
        : { title: tO===0?'Mikveh Night':`Mikveh night in ${tO} days`, body: 'Tonight is mikveh night. Best wishes!' });

    if (prefs.prisha !== false) {
      if (iso(ad(ad(start, 30), -pO)) === todayIso)
        events.push(isHe
          ? { title: 'עונת פרישה',       body: 'עונה בינונית (30 יום)' }
          : { title: 'Onah (Prisha)',    body: 'Average onah (30 days)' });
      if (iso(ad(nextHebSameDay(start), -pO)) === todayIso)
        events.push(isHe
          ? { title: 'עונת החודש',       body: 'עונת החודש מתקרבת' }
          : { title: 'Monthly Onah',     body: 'Monthly onah approaching' });
    }
  });

  // Next expected period
  if (prefs.next !== false && sorted.length >= 2) {
    const nO   = off('nextDays');
    const gaps = sorted.slice(1).map((c, i) => diff(c.date, sorted[i].date));
    const wavg = gaps.reduce((s,g,i)=>s+g*(i+1),0) / gaps.reduce((s,_,i)=>s+i+1,0);
    const nextV = ad(new Date(sorted[sorted.length - 1].date), Math.round(wavg));
    if (iso(ad(nextV, -nO)) === todayIso)
      events.push(isHe
        ? { title: nO===0?'ווסת צפוי היום':nO===1?'ווסת צפוי מחר':`ווסת צפוי בעוד ${nO} ימים`, body: 'תזכורת ווסת משוער' }
        : { title: nO===0?'Expected period today':nO===1?'Expected period tomorrow':`Expected period in ${nO} days`, body: 'Estimated period reminder' });
  }

  return events;
}

// ── Email HTML template ───────────────────────────────────────────────────
function buildHtml(events, lang) {
  const he  = lang !== 'en';
  const dir = he ? 'rtl' : 'ltr';
  const rows = events.map(e => `
    <div style="background:#FBE7EE;border-radius:12px;padding:14px 18px;margin:10px 0;">
      <div style="font-weight:700;font-size:15px;color:#231A1D;margin-bottom:4px;">${e.title}</div>
      <div style="font-size:13px;color:#7A6B6F;">${e.body}</div>
    </div>`).join('');

  return `<!DOCTYPE html>
<html dir="${dir}" lang="${he ? 'he' : 'en'}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${he ? 'לוח הטהרה — תזכורת' : 'Tahara Calendar — Reminder'}</title></head>
<body style="margin:0;padding:20px 0;background:#F7F2EE;font-family:Arial,sans-serif;">
<div style="max-width:440px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
  <div style="background:#B14068;padding:22px 28px;">
    <div style="font-size:22px;font-weight:700;color:#fff;">${he ? 'לוח הטהרה 🌙' : 'Tahara Calendar 🌙'}</div>
    <div style="font-size:12px;color:rgba(255,255,255,0.8);margin-top:4px;">${he ? 'תזכורת יומית אישית' : 'Your daily personal reminder'}</div>
  </div>
  <div style="padding:22px 28px;">
    ${rows}
    <hr style="border:none;border-top:0.5px solid #EFE7E1;margin:20px 0;"/>
    <div style="font-size:10px;color:#B0A0A4;text-align:center;line-height:1.7;">
      ${he ? '⚠️ כלי עזר אישי בלבד — אינו תחליף לייעוץ הלכתי או רפואי' : '⚠️ Personal reference tool only — not a substitute for halachic or medical guidance'}<br/>
      ${he ? '© 2026 שיר וגילה כהן · 054-464-1746' : '© 2026 Shir &amp; Gila Cohen · 054-464-1746'}
    </div>
  </div>
</div>
</body></html>`;
}

// ── Handler ───────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST')
    return res.status(405).json({ error: 'Method not allowed' });

  // Verify CRON_SECRET to prevent unauthorized triggers
  const secret = req.headers['x-cron-secret'];
  if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET)
    return res.status(401).json({ error: 'Unauthorized' });

  try {
    const db          = getDb();
    const transporter = getTransporter();
    const today       = new Date(); today.setHours(0, 0, 0, 0);
    const from        = `לוח הטהרה <${process.env.GMAIL_USER}>`;

    const snap = await db.collection('notif_users')
      .where('notifEmail', '==', true)
      .get();

    const results = [];

    for (const doc of snap.docs) {
      const prefs = doc.data();
      const uid   = doc.id;
      if (!prefs.email) continue;

      const cyclesSnap = await db.collection('users').doc(uid).collection('cycles').get();
      const cycles     = cyclesSnap.docs.map(d => d.data());
      const events     = calcEvents(cycles, prefs, today);

      if (!events.length) {
        results.push({ uid, email: prefs.email, sent: false, reason: 'no events today' });
        continue;
      }

      const lang    = prefs.lang || 'he';
      const isHe    = lang !== 'en';
      const subject = events.length === 1
        ? events[0].title
        : isHe ? `${events.length} תזכורות להיום` : `${events.length} reminders today`;

      try {
        await transporter.sendMail({
          from,
          to: prefs.email,
          subject,
          html: buildHtml(events, lang),
        });
        results.push({ uid, email: prefs.email, sent: true, events: events.length });
      } catch (e) {
        results.push({ uid, email: prefs.email, sent: false, error: e.message });
      }
    }

    return res.json({ ok: true, date: iso(today), processed: snap.size, results });
  } catch (err) {
    console.error('[send-notifications]', err);
    return res.status(500).json({ error: err.message });
  }
};
