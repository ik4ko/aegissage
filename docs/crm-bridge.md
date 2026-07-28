# Website → Agent Factory lead bridge

**Status: LIVE and verified end to end on 2026-07-28.**

A submission on aegissage.com reaches the Agent Factory Website Lead Inbox in
about three seconds. Verified by running the whole path against production —
form POST, contact row, outbox row, Resend alert, signed delivery, CRM lead,
audit event, replay rejection, operator-authenticated dashboard read — then
deleting every synthetic record by explicit id.

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

## Verified state (2026-07-28)

Applied and checked directly against both live databases:

| Table | Project | RLS | Policies | Result |
| --- | --- | --- | --- | --- |
| `contacts` | website | on | 0 | service-role only ✅ |
| `quiz_responses` | website | on | 0 | service-role only ✅ |
| `lead_sync_outbox` | website | on | 0 | applied ✅ |
| `notification_deliveries` | website | on | 0 | applied ✅ |
| `sms_opt_outs` | website | on | 0 | applied ✅ |
| `ag_website_leads` | CRM | on | 1 (`service_role`) | applied ✅ |
| `ag_website_lead_events` | CRM | on | 1 (`service_role`) | applied ✅ |

Zero policies is the design, not an oversight: RLS on with no policy means
`anon` and `authenticated` can do nothing at all, and only the service role —
which bypasses RLS and never leaves the server — has access. Supabase's
advisor reports these as `rls_enabled_no_policy` INFO notices. They are
expected. Do not "fix" them by adding a policy.

Migrations were applied through the Supabase MCP server, which supplied the
access the CLI lacked. Migration history now shows `lead_ops`,
`touch_updated_at_invoker_and_revoke` and
`notification_deliveries_destination` on the website, and
`20260727_website_leads` on the CRM.

### Advisor findings this bridge introduced, and their fixes

- `touch_updated_at` was `SECURITY DEFINER`, so it was callable by `anon` and
  `authenticated` at `/rest/v1/rpc/touch_updated_at`. It only ever sets
  `NEW.updated_at`, so it is now `SECURITY INVOKER` with `EXECUTE` revoked
  from `public`, `anon` and `authenticated`. Both WARNs cleared.

Every other advisor warning on the Agent Factory project predates this work
(broadcast trigger functions, `rls_auto_enable`, permissive INSERT policies on
`agents`/`logs`/`memory`/`tasks`). The two new tables added no new lints and
those pre-existing ones were deliberately left alone.

## Vercel Deployment Protection — resolved, with a trap worth knowing

Protection is still enabled on the Agent Factory project, which is correct for
an internal dashboard. `/` and `/dashboard` still answer 302 to
`vercel.com/sso-api`. The ingest route gets through because the dispatcher
sends `x-vercel-protection-bypass`.

**The trap:** a protected deployment does not answer a server-to-server POST
with a redirect. It answers **401** with a JSON body containing
`"protection":{"vercel_auth_enabled":true}`. Only browser GETs get the 302.

The dispatcher originally recognised the 302 only, so the 401 fell into its
permanent-failure bucket and would have burned all eight attempts at once,
marking real leads `dead` on the first try. It now classifies that response by
body rather than status and treats it as retryable. Verified live:

```
POST /api/website-leads/ingest                       → 401 Protected deployment
POST + x-vercel-protection-bypass                    → 401 {"error":"Missing signature"}
POST + bypass + bogus signature                      → 401 {"error":"Invalid signature"}
```

The second and third are the application answering, which is the proof the
bypass works. The bypass is transport only — the HMAC is still what proves a
request genuine.

## Vercel Hobby cron limit — worked around, not blocking

Vercel rejected a 5-minute cron: Hobby accounts allow one run per day. A daily
sweep would leave a lead queued for up to 24 hours.

So delivery now happens in `after()` inside `/api/contact` — it runs once the
response is flushed, so the visitor still never waits on a cross-project call,
and the lead moves within seconds. `vercel.json` keeps a daily cron purely as
the retry safety net. On Pro, restore `*/5 * * * *`.

## End-to-end verification, 2026-07-28

Run against production, not a preview. Every step confirmed by querying the
databases directly rather than trusting a 200.

| # | Step | Result |
| --- | --- | --- |
| 1 | Form POST with valid consent | `200 {"ok":true,"persisted":true}` |
| 2 | `contacts` row written | ✅ granular consent columns populated |
| 3 | `lead_sync_outbox` row created | ✅ `pending` → `delivered` |
| 4 | Resend alert | ✅ `notify_status = sent` |
| 5 | `notification_deliveries` audit | ✅ email `sent`, SMS `skipped` |
| 6 | Signed delivery reaches CRM | ✅ ~3s after submit |
| 7 | Exactly one `ag_website_leads` row | ✅ |
| 8 | `website_submission_id` preserved | ✅ matches the contact id |
| 9 | `ag_website_lead_events` records it | ✅ `ingested` |
| 10 | Replay the same delivery | ✅ `duplicate_ingest_ignored`, still 1 lead |
| 11 | Outbox re-armed and re-driven | ✅ redelivered to the same `remote_id` |
| 12 | Lead visible in Website Lead Inbox | ✅ via operator-authenticated API |
| 13 | Unauthenticated inbox read | ✅ `401 Unauthorized` |
| 14 | Unauthenticated dashboard page | ✅ `307 → /login` |
| 15 | Invalid signature | ✅ `401 Invalid signature` |
| 16 | Missing / false consent | ✅ `400`, nothing written |
| 17 | SMS attempted | ✅ no — `skipped`, Twilio absent |

Steps 10 and 11 were driven by re-arming the synthetic outbox row and letting
the next submission's `after()` drain claim it, since the production
`CRON_SECRET` is stored Sensitive in Vercel and is not retrievable by
`vercel env pull`. Same code path as the cron, same result.

All synthetic records were then deleted by explicit id. Final counts: website
`contacts` 2 (both pre-existing, neither synthetic), `lead_sync_outbox` 0,
`notification_deliveries` 0; CRM `ag_website_leads` 0, `ag_website_lead_events`
0, `ag_clients` 0 — untouched throughout.

If you ever need to clean up again, both predicates are required. Never delete
on `name like` alone:

```sql
select id, name, created_at from public.contacts
 where source = 'synthetic-e2e' and name like 'SYNTHETIC-E2E-%';
```

## Env vars

| Var | Where | Set? | Purpose |
| --- | --- | --- | --- |
| `CRM_INGEST_URL` | website | ✅ | dashboard ingest endpoint |
| `CRM_INGEST_SECRET` | website | ✅ | HMAC signing key |
| `CRM_INGEST_BYPASS_TOKEN` | website | ✅ | Vercel Protection Bypass for Automation |
| `CRON_SECRET` | website | ✅ | authorises the drain worker |
| `RESEND_API_KEY` / `NOTIFY_EMAIL_TO` | website | ✅ | advisor email alert |
| `WEBSITE_LEAD_INGEST_SECRET` | dashboard | ✅ | must equal `CRM_INGEST_SECRET` |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_FROM_NUMBER` | website | ❌ | SMS provider |
| `NOTIFY_SMS_TO` | website | ❌ | **internal** alerts to Eric only |

None of these may be prefixed `NEXT_PUBLIC_`. A signing secret in the browser
lets anyone forge leads into the CRM. All of them are stored Sensitive in
Vercel, so `vercel env pull` returns empty strings for them — that is the
platform protecting the values, not a misconfiguration.

## What activating SMS would still require

Nothing sends today. Every SMS path returns `skipped` with
`twilio_not_configured`, and the audit row records that rather than silently
doing nothing. To turn it on:

1. A Twilio account, and a number provisioned for A2P messaging.
2. `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` on the
   website project.
3. `NOTIFY_SMS_TO` — Eric's own number — for internal alerts only. Setting
   just this plus the Twilio triple enables **internal** alerts and nothing
   client-facing.
4. For any client-facing message: A2P 10DLC brand and campaign registration.
   US carriers filter unregistered application-to-person traffic.
5. A standalone SMS consent checkbox in the form whose wording discloses
   automated messaging, message frequency, and STOP/HELP. The column
   (`consent_sms`) and the send-time gate already exist and default to false.

Existing rows are **not** backfilled from the old combined consent, and must
not be. The old wording did not disclose automated messaging, and inferring
SMS permission from a historical checkbox is the exact TCPA failure mode.

## Does the Agent Factory dashboard see synced leads?

**Yes.** `WebsiteLeadInbox` is mounted in the Medicare room
(`src/components/dashboard/medicare-room-client.tsx`) and reads
`/api/website-leads`, which is gated by the same `requireMedicareOperator`
guard as the rest of that room. Confirmed live with an authenticated session:
both synthetic leads came back with status, consent flags, source page,
timestamps and their event counts.

The inbox sorts oldest-first by design — a lead queue defaulting to
newest-first is how enquiries rot at the bottom of a list. It shows per-lead
consent chips (Reply / SMS / Marketing), the full status vocabulary, an
overdue flag past a 4-hour SLA, and a count of leads whose advisor alert
failed.

`/api/website-leads` is a separate route from `/api/website-leads/ingest`, and
only the `/ingest` child is exempt in `src/proxy.ts`. The machine lane cannot
read leads; the operator lane cannot be reached without a session. The
`/api/medicare-crm` authorization boundary was not widened.

## What is deliberately not automated

No client-facing message is sent automatically, in any state, without an
explicit consent record. The acknowledgement path exists but is consent-gated
at send time by re-reading `contacts.consent_sms`. Follow-up nudges go to
**Eric**, not to the lead — a person who has not replied gets a human, not a
drip campaign.
