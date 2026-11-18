# Workshops: adding sessions, and the RSVP email and Sheet

## Add a session

1. Get the host's confirmation in writing (email is fine).
2. Add one entry to `workshops` in `lib/workshops.ts` (the example is at the top of that file). Dates must fall between December 8, 2026 and February 28, 2027; `npm run test:workshops` checks this.
3. Open a PR. On the preview, check `/workshops` and the flyer at `/workshops/flyer/{id}`.

Past sessions drop off the page by themselves within an hour of ending.

The blank flyer at `/workshops/flyer` has lines for date, time and place, for a host who wants to print before the date is in the config.

## Where RSVPs go

Each RSVP is sent three ways. Any one working is enough; the visitor is told to call only if all three fail.

1. **Supabase `contacts`**, `source = workshop-rsvp`, with the consent record (`consent_text_version = workshop-rsvp-2026-11`, time, SMS consent exactly as ticked, user agent, IP). The session, number attending, language and Part A/B answer are in `context`. Nothing to set up.
2. **Email** to `NOTIFY_EMAIL_TO`, same Resend variables as the contact form. Subject: `Workshop RSVP — {name} ({count}) — {session}`.
3. **"Workshops" tab in your Google Sheet**, set up below.

## "Workshops" Sheet tab

1. Open the leads Sheet. Add a tab named exactly **Workshops**.
2. Extensions → Apps Script. Create a **separate** Apps Script project bound to the same Sheet (do not add a second `doPost` to an existing one). Paste the code below.
3. Project Settings → Script properties → add `WORKSHOP_RSVP_SECRET` with a long random value.
4. Deploy → New deployment → **Web app**. Execute as: **Me**. Who has access: **Anyone**. Copy the URL.
5. Vercel → Project → Settings → Environment Variables, for Production and Preview:
   - `WORKSHOP_RSVP_WEBHOOK_URL` = the web app URL
   - `WORKSHOP_RSVP_WEBHOOK_SECRET` = the same value as step 3
6. Redeploy and send one test RSVP from the preview.

```javascript
/**
 * Receives workshop RSVPs from aegissage.com and appends them to the
 * "Workshops" tab. Signed with HMAC-SHA256 over `${timestamp}.${payload}`
 * (timestamp in ms). Unsigned, wrongly signed or stale (> 5 min) requests
 * are ignored. No Medicare number, SSN or date of birth is ever sent.
 */
var WORKSHOP_COLUMNS = [
  'received_at', 'workshop_id', 'session', 'name', 'phone', 'email', 'attending',
  'language', 'has_part_a_b', 'town', 'texting_ok', 'consent_version', 'source_page',
  'status', 'notes'
];

function doPost(e) {
  var out = ContentService.createTextOutput('ok');
  try {
    var envelope = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('WORKSHOP_RSVP_SECRET');
    if (!secret || !envelope.payload || !envelope.timestamp || !envelope.signature) return out;

    var age = Math.abs(Date.now() - Number(envelope.timestamp));
    if (!(age < 5 * 60 * 1000)) return out;

    var raw = Utilities.computeHmacSha256Signature(envelope.timestamp + '.' + envelope.payload, secret);
    var expected = raw.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
    if (expected !== envelope.signature) return out;

    var p = JSON.parse(envelope.payload);
    if (p.kind !== 'workshop_rsvp') return out;

    var sheet = SpreadsheetApp.getActive().getSheetByName('Workshops');
    if (sheet.getLastRow() === 0) sheet.appendRow(WORKSHOP_COLUMNS);
    sheet.appendRow([
      p.receivedAt, p.workshopId, p.session, p.name, p.phone, p.email, p.attendees,
      p.language, p.partsAB, p.town, p.consentSms, p.consentVersion, p.sourcePage, 'new', ''
    ]);
  } catch (err) {
    console.error(err);
  }
  return out;
}
```

Use `status` for your own tracking: `new` → `confirmed` → `attended` / `no-show`.

## At the session

- Educational only: no plan or company names, no plan presentation, no applications, no sign-in sheet that collects contact details (an optional one is fine).
- One-on-one help afterward, same day, same place, is allowed only after a Scope of Appointment is agreed and recorded (in writing, in person).
- Never take a Medicare number, SSN or date of birth at the talk.
