# Sheet writer: add found_via, ai_source, has_part_a_b

The script that writes leads into your Google Sheet is not in this repository.
The site posts each lead, signed, to `CRM_INGEST_URL`. Whatever receives that
post writes the Sheet. This page is what to paste there.

## What the site sends

Inside the JSON body, under `attribution`:

| Sheet column   | JSON field              | Values |
|----------------|-------------------------|--------|
| `found_via`    | `attribution.foundVia`  | `chatgpt`, `claude`, `perplexity`, `gemini`, `google`, `referral`, `other`, or absent |
| `ai_source`    | `attribution.aiSource`  | detected from the referrer or `utm_source` (for example `chatgpt`, `perplexity`), or absent |
| `has_part_a_b` | `attribution.partsAB`   | `both`, `one`, `not-yet`, `not-sure`, or absent |

`found_via` is what the person chose. `ai_source` is what the browser showed.
They can disagree; keep both. All three are optional, so blank cells are normal.

## Paste this into the Apps Script project

Open the Sheet, then Extensions → Apps Script. Add this at the bottom of the
file that contains `doPost`:

```javascript
/** Sheet column header -> field name inside payload.attribution */
var AEGIS_ATTRIBUTION_COLUMNS = {
  found_via: 'foundVia',
  ai_source: 'aiSource',
  has_part_a_b: 'partsAB'
};

/**
 * Writes the three attribution values onto one row, by header name.
 * Adds any missing header to the end of row 1 the first time it runs.
 * Never moves or renames an existing column.
 */
function writeAegisAttribution_(sheet, rowNumber, payload) {
  var attribution = (payload && payload.attribution) || {};
  var lastCol = Math.max(sheet.getLastColumn(), 1);
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(String);

  Object.keys(AEGIS_ATTRIBUTION_COLUMNS).forEach(function (header) {
    var col = headers.indexOf(header) + 1;
    if (col === 0) {
      col = headers.length + 1;
      sheet.getRange(1, col).setValue(header);
      headers.push(header);
    }
    var value = attribution[AEGIS_ATTRIBUTION_COLUMNS[header]];
    // Plain text only, capped, and never a formula.
    var text = value ? String(value).slice(0, 80).replace(/^[=+\-@]/, "'$&") : '';
    sheet.getRange(rowNumber, col).setValue(text);
  });
}
```

Then, in `doPost`, find the line that adds the lead's row. It will look like
`sheet.appendRow([...])`. Add one line directly under it:

```javascript
sheet.appendRow(row);                                        // already there
writeAegisAttribution_(sheet, sheet.getLastRow(), payload);  // add this
```

`payload` is whatever your script calls the parsed body, usually
`JSON.parse(e.postData.contents)`. Use your variable name.

Then: Deploy → Manage deployments → pencil icon → Version: **New version** →
Deploy. Without a new version the live web app keeps running the old code.

## Check it

1. Submit the contact form on the Vercel preview. Choose "ChatGPT" under
   "How did you find us?" and "Both" for Part A and Part B.
2. The new row should show `chatgpt` and `both`. `ai_source` stays blank
   unless you arrived from an AI site or with `?utm_source=chatgpt.com`.
3. If the three headers appear but the cells are blank, the script is reading
   a different object. Log `Object.keys(payload)` once and check for
   `attribution`.

## If something else sits between the site and the Sheet

If `CRM_INGEST_URL` points at another service that then writes the Sheet, the
snippet goes wherever the Sheet row is written, and the three fields have to
be passed through that service unchanged. Nothing in this repository needs to
change either way.

Two leads arriving in the same second could, in theory, get each other's
values, because `getLastRow()` is read after `appendRow()`. If your `doPost`
does not already use `LockService`, wrap both lines in
`var lock = LockService.getScriptLock(); lock.waitLock(10000); … lock.releaseLock();`.
