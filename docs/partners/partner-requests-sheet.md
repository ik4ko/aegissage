# Partner Requests: email and Sheet setup

The organization request form (on `/partners` and the `/for-organizations` pages) sends each request two ways. Either can be set up without the other.

## 1. Email (already works if contact alerts work)

Uses the same Vercel environment variables as the contact form:

- `RESEND_API_KEY`
- `NOTIFY_EMAIL_TO` (contact@aegissage.com)
- `NOTIFY_EMAIL_FROM` (optional)

The subject line reads `Organization request — {organization} ({town})`. Reply-to is the person who sent it.

## 2. "Partner Requests" tab in your Google Sheet

1. Open the leads Sheet. Add a tab named exactly **Partner Requests**.
2. Extensions → Apps Script. Create a new file named `PartnerRequests.gs` and paste the code below.
3. In Apps Script: Project Settings → Script properties → add `PARTNER_REQUESTS_SECRET` with a long random value (for example, 40 random letters and numbers).
4. Deploy → New deployment → type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Copy the web app URL.
5. In Vercel → Project → Settings → Environment Variables, add for Production and Preview:
   - `PARTNER_REQUESTS_WEBHOOK_URL` = the web app URL
   - `PARTNER_REQUESTS_WEBHOOK_SECRET` = the same random value as step 3
6. Redeploy. Send one test request from the preview site and check that a row appears.

If your project already has a `doPost` for leads, do **not** paste a second `doPost`. Instead, deploy this as a **separate** Apps Script project bound to the same Sheet, so each has its own URL.

```javascript
/**
 * Receives organization requests from aegissage.com and appends them to the
 * "Partner Requests" tab. The site signs each request with HMAC-SHA256 over
 * `${timestamp}.${payload}` (timestamp in milliseconds). Requests that are
 * unsigned, wrongly signed or older than 5 minutes are ignored.
 * No personal information about seniors is ever sent: the site refuses it.
 */
var PARTNER_COLUMNS = [
  'received_at', 'organization', 'organization_type', 'town', 'contact_name', 'role',
  'email', 'phone', 'requests', 'timing', 'message', 'source_page', 'status', 'notes'
];

function doPost(e) {
  var out = ContentService.createTextOutput('ok');
  try {
    var envelope = JSON.parse(e.postData.contents);
    var secret = PropertiesService.getScriptProperties().getProperty('PARTNER_REQUESTS_SECRET');
    if (!secret || !envelope.payload || !envelope.timestamp || !envelope.signature) return out;

    var age = Math.abs(Date.now() - Number(envelope.timestamp));
    if (!(age < 5 * 60 * 1000)) return out;

    var raw = Utilities.computeHmacSha256Signature(envelope.timestamp + '.' + envelope.payload, secret);
    var expected = raw.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
    if (expected !== envelope.signature) return out;

    var p = JSON.parse(envelope.payload);
    if (p.kind !== 'partner_request') return out;

    var sheet = SpreadsheetApp.getActive().getSheetByName('Partner Requests');
    if (sheet.getLastRow() === 0) sheet.appendRow(PARTNER_COLUMNS);
    sheet.appendRow([
      p.receivedAt, p.organization, p.organizationType, p.town, p.contactName, p.role,
      p.email, p.phone, p.requests, p.timing, p.message, p.sourcePage, 'new', ''
    ]);
  } catch (err) {
    console.error(err);
  }
  return out;
}
```

The `status` and `notes` columns are for you: change `new` to `replied`, `booked` or `done` as you go.
