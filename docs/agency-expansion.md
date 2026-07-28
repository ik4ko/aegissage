# Agency / downline expansion — technical outline

**Status: NOT BUILT. Documentation only.**

Nothing in this document is implemented. There is no `/for-agents` route, no
agent table, no lead-routing code, and no CRM connection in this repository.
This file exists so that when the work is scoped, it starts from a design that
already accounts for the regulatory surface rather than retrofitting it.

## Timing

**Do not launch agent recruiting during AEP** (October 15 – December 7). AEP is
when the client-facing side of this business is at capacity and when CMS
marketing scrutiny is highest. Recruiting content competes for the same pages,
the same phone number, and the same compliance attention.

Target a post-AEP build window.

---

## 1. Route outline

| Route | Purpose | Access |
| --- | --- | --- |
| `/for-agents` | Public recruiting page: what the agency offers, who it suits | Public, indexable |
| `/for-agents/apply` | Application form | Public, `noindex` |
| `/for-agents/thanks` | Confirmation | `noindex` |
| `/admin/agents` | Internal review queue | Authenticated, `noindex`, robots-disallowed |

`/for-agents` must not dilute the consumer funnel. It should not appear in the
main nav during AEP, should not replace any existing consumer CTA, and should
carry its own distinct CTA ("apply", not "call Eric").

---

## 2. Agent application fields

Collect the minimum needed to decide whether to have a conversation.

**Identity and contact**
- Full legal name, preferred name
- Email, phone
- Business entity name (if applying as an entity) and entity type

**Licensing** — the gating information
- Resident state and resident license number
- Non-resident states currently licensed
- License expiration dates
- Any prior license suspension, revocation, or pending regulatory action
  (yes/no plus free text — this is a disclosure question, not a screening
  question to automate)

**Carrier and certification status**
- Current carrier appointments
- Current FMO/IMO relationship, if any
- AHIP or equivalent certification: completed / not completed, plan year
- Carrier-specific product certifications, plan year

**Insurance and history**
- E&O carrier and policy expiration
- Years selling Medicare products
- Approximate current book size (band, not exact figure)

**Explicitly do NOT collect on a public form**
- Social Security number or full date of birth
- Bank or commission-payment details
- Any consumer's information — an applicant must never paste a client list
  into a recruiting form

### Storage note

Applicant data is business-contact data, not consumer PHI, but it still
warrants the same discipline as the existing contact table: Supabase with RLS
on, no service-role key in the browser, and a retention policy. Keep applicant
records in a **separate table from `contacts`** — mixing recruiting records
with Medicare beneficiary enquiries creates an access-control problem that is
much harder to unwind later than to avoid now.

---

## 3. Tracking models

### `agents`
- identity, contact, status (`applied` → `in_review` → `contracted` → `inactive`)
- responsible producer flag
- onboarding checklist completion

### `agent_licenses`
- agent, state, license number, line of authority, issue date, **expiration date**
- status (`active` / `lapsed` / `pending`)
- Needs an expiration-driven reminder job. A lapsed license that nobody noticed
  is the single most common avoidable compliance failure in this model.

### `agent_appointments`
- agent, carrier, state, appointment date, status
- Appointment is per-carrier **and** per-state. A carrier appointment in NJ says
  nothing about NY.

### `agent_certifications`
- agent, type (`AHIP` / carrier product), plan year, completion date, evidence file
- Plan-year scoped — resets annually, and a prior year's completion is not
  evidence for the current year.

### `agent_documents`
- agent, document type (E&O certificate, W-9, contract, background disclosure)
- upload reference, effective date, expiration date, reviewed-by, reviewed-at

### `lead_handoffs` — audit log
Append-only. One row per lead shared with any agent:
- lead reference, from, to, timestamp, reason for routing
- **consent record**: which consent the consumer gave, its exact wording, and
  when it was captured
- actor (who performed the handoff)

Append-only matters. If a consumer later disputes who contacted them and why,
a mutable log is not evidence.

---

## 4. Lead-routing rules

Routing must be deterministic and explainable — if a consumer asks "why did
this person call me", there has to be an answer.

Proposed precedence:
1. **Licensing filter.** Only agents licensed *and* appointed in the
   consumer's state are eligible. Non-negotiable, evaluated first.
2. **Consent filter.** Only leads with valid one-to-one consent naming the
   receiving party are eligible for handoff at all.
3. **Geography.** Prefer an agent with local presence in the consumer's county
   or metro.
4. **Capacity.** Round-robin among remaining eligible agents, capped per agent
   per day.
5. **Fallback.** No eligible agent → the lead stays with Eric. It is never
   routed to someone unlicensed in that state, and it is never sold.

### One-to-one consent — the hard requirement

**No lead may be shared with any third party without prior express written
consent that names the specific recipient.** A generic "we may share your
information with our partners" checkbox does not satisfy this.

Practically this means:
- The consent language must name the receiving agent or agency.
- Consent must be a separate, unticked checkbox — never bundled with the
  consent to receive a reply, and never pre-checked.
- The exact wording shown, the timestamp, and the page URL must be stored with
  the lead.
- Revocation must be honoured and recorded.

The current consumer contact form already promises *"I do not sell or share
your information with anyone."* **If lead sharing is ever introduced, that
sentence must change before the first share occurs**, and the change cannot be
applied retroactively to consumers who submitted under the old promise. Those
records are not shareable. Ever.

---

## 5. Compensation and overrides

Out of scope for the technical outline beyond one point: override and
compensation structures for Medicare business are constrained by CMS
compensation rules, including caps on initial and renewal amounts and rules
about what may be paid to whom. Do not model commission splits in code before
the contractual and regulatory structure is settled — the data model should
follow the agreement, not the other way round.

---

## 6. Review required before ANY of this is built

Every item below needs sign-off from someone qualified. This is not a
checklist an engineer can clear alone.

- [ ] **Business-entity licensing** — whether the agency itself must hold an
      entity license in each state of operation, and in which states
- [ ] **Designated Responsible Licensed Producer (DRLP)** — most states require
      a named individual producer responsible for the entity's compliance, per
      state, and requirements differ
- [ ] **State appointments** — carrier appointments for the entity and each
      producer, state by state
- [ ] **CMS training and testing** — AHIP or carrier equivalent, per plan year,
      for every producer, before any marketing or sales activity
- [ ] **Carrier and FMO/IMO contracts** — hierarchy placement, release rules,
      and whether existing contracts permit building a downline at all
- [ ] **E&O coverage** — entity-level and producer-level, adequate limits,
      evidence collected before contracting
- [ ] **Privacy and consent procedures** — one-to-one consent capture, TCPA
      compliance for calls and texts, DNC scrubbing, revocation handling,
      record retention
- [ ] **Compensation and override rules** — CMS compensation limits, override
      permissibility, payment structure
- [ ] **TPMO disclosure obligations** — whether the disclosure text and any
      required TPMO identification changes when operating as an agency rather
      than an individual producer
- [ ] **Call recording** — CMS requires recording of certain Medicare sales
      calls in their entirety; retention, storage security, and consumer
      notification all need a documented procedure

---

## 7. Explicitly out of scope

Do not build, and do not design toward:

- selling or reselling Medicare leads
- paying or accepting referral fees for Medicare business without legal review
- public agent-routing or "get matched with multiple agents" flows
- CRM integrations
- any recruiting launch during AEP
