# LeadFlow User Guide & Operator Manual

Welcome to **LeadFlow** — a local-first, human-controlled WhatsApp outreach CRM designed for independent professionals, sales operators, and agencies.

---

## 1. Safety & Architecture Philosophy

LeadFlow is built on **three foundational pillars**:

1. **100% Local-First & Private**:
   - All lead datasets, phone numbers, notes, follow-up dates, and revenue values stay entirely in your browser's local sandbox (`localStorage`).
   - No external database, no cloud sync, and no third-party telemetry.
2. **Strict Human Control**:
   - LeadFlow **never** sends automated WhatsApp messages.
   - LeadFlow **never** scrapes WhatsApp or clicks Send automatically.
   - It prepares and opens the standard WhatsApp Web deep link (`https://api.whatsapp.com/send/?phone=...&text=...`), allowing you to review the chat and manually press Send inside WhatsApp.
3. **Lossless Data Preservation**:
   - Re-importing updated Excel spreadsheets refreshes business data without wiping notes, follow-up dates, contact attempt counts, custom messages, or quoted deal values.

---

## 2. Step-by-Step Workflow

### Step 1: Lead Ingestion
- Click **"Import Excel"** in the top navigation bar.
- Select your `.xlsx` or `.csv` lead file.
- LeadFlow automatically normalizes business names, validates phone numbers (international & Indian formats), maps lead scores/tiers, and preserves any extra custom columns in `rawFields`.

### Step 2: Queue & Outreach
- Open the **Leads** or **Outreach Queue** view.
- Click any lead row or press `Enter` to open the **Lead Inspector**.
- Review the prefilled message. You can customize the text directly; any edits are preserved as `customMessage`.
- Click **"Open WhatsApp"** (or press `O`).
- A new tab opens directly to the WhatsApp conversation with the message prefilled.
- Review and hit **Send** inside WhatsApp.
- Return to LeadFlow and click **"Mark Contacted"** (or press `M`). The lead status advances to `Contacted`, timestamps are logged, and `contactAttempts` increments.

### Step 3: Follow-Up & Sales Pipeline
- Advance leads through all 10 CRM lifecycle stages:
  - `New` → `Contacted` → `Replied` → `Interested` → `Demo Sent` → `Follow-up` → `Negotiating` → `Won` → `Lost` → `Not Interested`.
- Set scheduled follow-up dates (`Tomorrow`, `In 3 days`, `In 7 days`, or custom date picker).
- View the dedicated **Follow-ups** tab to see urgent overdue and upcoming reminders.

### Step 4: Commercial Revenue Tracking
- Track deal values directly inside the Lead Inspector:
  - **Quoted Amount**: What you pitched.
  - **Deal Value**: Closed transaction amount.
- Mark lead as **Won** to immediately capture closed revenue into business intelligence dashboards.

### Step 5: Business Intelligence & Performance
- Navigate to the **Analytics** view to monitor:
  - **Won Revenue** & **Active Pipeline Value**.
  - **Full Conversion Funnel** with strict zero-denominator safeguards (no `NaN%`).
  - **Tier Performance Breakdown** (Tier A, Tier B, Tier C conversion rates & closed revenue).
  - **Daily Outreach Velocity Chart** tracking contacts logged over time.
  - Interactive drill-down: click any KPI card or stage to filter the Leads view instantly.

### Step 6: Backup, Export & Disaster Recovery
- Go to the **Settings** view:
  - **Full JSON Backup**: Download a timestamped snapshot of your entire CRM.
  - **Restore from JSON**: Restore previously saved backups with confirmation safeguards.
  - **Export to Excel**: Export all 24 CRM fields (including notes, stages, and timestamps) into an `.xlsx` workbook.
  - **Data Integrity Diagnostics**: Real-time scanner checking for phone formatting anomalies, malformed dates, or unvalued won deals.
  - **Clear Data**: Safely wipe browser storage when switching workspaces or starting fresh.

---

## 3. Keyboard Shortcuts Cheat Sheet

| Key | Action |
|---|---|
| `O` | Open WhatsApp conversation |
| `M` | Mark lead as Contacted |
| `C` | Copy message to clipboard |
| `P` | Copy phone number to clipboard |
| `J` or `↓` | Select next lead |
| `K` or `↑` | Select previous lead |
| `Esc` | Close Lead Inspector |

---

## 4. Privacy & Compliance Notice

LeadFlow respects WhatsApp Terms of Service and user privacy:
- It relies entirely on official WhatsApp URI schemes (`https://api.whatsapp.com/send`).
- It has no browser extensions, bot scripts, or background workers.
- You retain complete ownership and sovereignty over your sales records.
