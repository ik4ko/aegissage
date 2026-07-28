# Website → Agent Factory lead bridge

**Status: website side COMPLETE and deployed. CRM side WRITTEN but NOT APPLIED.
The bridge is NOT live.**

Leads are being captured and queued right now. Nothing is being delivered to
the CRM, and nothing is being lost — the outbox holds them until the remaining
steps below are done, then drains automatically.

## The two projects

| | Website | Agent Factory |
| --- | --- | --- |
| Supabase ref | `oofxhxsjfyuqegicczbu` | `grtnjhwekvkyawacunde` |
| Repo | `ik4ko/aegissage` | `C:\Developer\my agent factory` |
| Tables | `contacts`, `lead_sync_outbox`, `notification_deliveries`, `sms_opt_outs` | `ag_website_leads`, `ag_website_lead_events` |

## Why it does not post to `/api/medicare-crm`

That route is guarded by `requireMedicareOperator`, which carries this comment
in the dashboard source:

> Medicare data is PHI-adjacent and must stay on the operator-session lane.
> This intentionally rejects the global MACHINE_API_TOKEN lane, which is
> broader than the Medicare CRM's authorization boundary.

That boundary is correct. A public website must not hold a credential that can
read `ag_clients`, which contains `date_of_birth` and
`medicare_beneficiary_identifier`. So the bridge does not widen it — it adds a
separate, narrower door.

`/api/website-leads/ingest` can write to `ag_website_leads` and
`ag_website_lead_events` and nothing else, reads nothing back, and uses its own
secret. Compromising the website's signing key yields the ability to create
junk leads, not to read a book of business.

## Why leads do not go into `ag_clients`

`ag_clients` is a qualified book of business. A web submission is a stranger
who may never become a client. Writing one straight in would pollute the book
and put an unverified record beside real PHI. A human promotes a lead via
`converted_client_id` after qualification — a decision, not an insert.

## Flow

```
visitor submits form
  → POST /api/contact (website)
      1. validate + consent check
      2. INSERT public.contacts            ← durable record, happens first
      3. sendContactAlert (Resend + internal SMS)
      4. INSERT notification_deliveries    ← audit row per channel
      5. INSERT lead_sync_outbox           ← delivery intent, snapshotted
  → returns 200 to the visitor (never waits on the CRM)

cron / manual
  → GET /api/internal/sync-leads  (Bearer CRON_SECRET)
      claim due rows → POST signed payload → mark delivered | back off | dead
```

## Wire contract

`lib/crm/contract.ts` is the source of truth. A copy of the schema and
signature verification lives in the ingest route. **Change both in the same
commit** or deliveries start failing validation.

- `POST` JSON, headers `x-aegissage-signature`, `x-aegissage-timestamp`,
  `x-aegissage-idempotency-key`
- Signature: `HMAC-SHA256(secret, "${timestamp}.${rawBody}")`, hex. The
  timestamp is inside the signed material so a captured request cannot be
  replayed; the receiver rejects anything older than 300s.
- Comparison is constant-time on both sides.

### Response handling

| Status | Website behaviour |
| --- | --- |
| 2xx | delivered |
| **409** | **delivered** — receiver reports the idempotency key already exists. Retrying forever would be the bug. |
| 400/401/403 | permanent — burn attempts immediately, mark `dead` |
| 408/429/5xx | retry with backoff |

Backoff: 1, 5, 15, 60, 180, 360, 720, 1440 minutes, then `dead`. A dead row
keeps its `last_error` and stays visible for a human to re-drive.

## Remaining steps to make this live

1. **Apply the website migration** `supabase/migrations/20260727000000_lead_ops.sql`
   to `oofxhxsjfyuqegicczbu`.
   *Until this runs, `enqueueLeadSync` logs a failure and returns false. The
   contact form still works and still stores + notifies — only the outbox row
   is skipped.*
2. **Apply the CRM migration** `20260727_website_leads.sql` to
   `grtnjhwekvkyawacunde`.
3. **Exempt the ingest route** in the dashboard's `src/proxy.ts`, alongside
   `/api/orchestrator/cron` and `/api/loops/tick`:
   ```ts
   '/api/website-leads/ingest',
   ```
   It self-authorizes by signature; without the exemption the operator-session
   gate returns 401 to every delivery.
4. **Generate one shared secret** (`openssl rand -hex 32`) and set it as:
   - website Vercel → `CRM_INGEST_SECRET`
   - dashboard Vercel → `WEBSITE_LEAD_INGEST_SECRET`
5. **Set `CRM_INGEST_URL`** on the website to the dashboard's deployed
   `/api/website-leads/ingest`.
6. **Set `CRON_SECRET`** on the website and add a Vercel Cron hitting
   `/api/internal/sync-leads` every 5 minutes.
7. **Deploy the dashboard**, then verify:
   ```bash
   curl -s "https://<website>/api/internal/sync-leads" -H "Authorization: Bearer $CRON_SECRET"
   # expect {"ok":true,"configured":true,"claimed":N,"delivered":N,...}
   ```
8. **Run Supabase security advisors** on both projects after the migrations.

## Env vars

| Var | Where | Public? | Purpose |
| --- | --- | --- | --- |
| `CRM_INGEST_URL` | website | no | dashboard ingest endpoint |
| `CRM_INGEST_SECRET` | website | no | HMAC signing key |
| `CRON_SECRET` | website | no | authorises the drain worker |
| `WEBSITE_LEAD_INGEST_SECRET` | dashboard | no | must equal `CRM_INGEST_SECRET` |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | website | no | SMS provider |
| `NOTIFY_SMS_TO` | website | no | **internal** alerts to Eric only |

None of these may be prefixed `NEXT_PUBLIC_`. A signing secret in the browser
lets anyone forge leads into the CRM.

## Does the desktop Agent Factory app see synced leads?

**Not yet, and not automatically.** Its Medicare CRM screen reads
`/api/medicare-crm`, which queries eight `ag_` tables and does not know
`ag_website_leads` exists. Adding leads to that response — or mounting the
`LeadInbox` component — is a dashboard-side change that has not been made.

The data will be in the database and correct. The existing UI simply will not
render it until someone wires it in.

## What is deliberately not automated

No client-facing message is sent automatically, in any state, without an
explicit consent record. The acknowledgement path exists but is consent-gated
at send time by re-reading `contacts.consent_sms`. Follow-up nudges go to
**Eric**, not to the lead — a person who has not replied gets a human, not a
drip campaign.
