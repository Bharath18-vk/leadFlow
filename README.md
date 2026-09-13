# LeadFlow — Local-First WhatsApp Outreach CRM

**LeadFlow** is a modern, high-velocity, local-first WhatsApp outreach and sales CRM built for freelancers, consultants, and growth operators. It bridges the gap between spreadsheet lead lists and real sales conversations without sacrificing control, safety, or privacy.

![LeadFlow CRM](https://img.shields.io/badge/Local--First-100%25-emerald?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-Zero%20Telemetry-blue?style=flat-square)
![Safety](https://img.shields.io/badge/WhatsApp-Human--Controlled-green?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square)
![Vite](https://img.shields.io/badge/Vite-8.x-purple?style=flat-square)

---

## ⚡ Key Highlights

- **Zero Bot Automation / 100% Account Safe**: LeadFlow **never** sends automated WhatsApp messages, never uses unofficial WhatsApp APIs, and never automates the Send button. It formats personalized messages and opens conversation tabs for you to review and manually click Send.
- **Local-First & Private**: All data is stored directly in your browser's `localStorage`. No cloud databases, no user accounts, no monthly fees, and zero risk of external data leaks.
- **Lossless Spreadsheet Re-Importing**: Update your prospect lists from Google Maps or scrapers anytime. LeadFlow merges source data into existing leads while preserving all notes, stage history, deal quotes, custom message revisions, and contact attempts.
- **Full Sales CRM Lifecycle**: Manage leads across 10 pipeline stages (`New`, `Contacted`, `Replied`, `Interested`, `Demo Sent`, `Follow-up`, `Negotiating`, `Won`, `Lost`, `Not Interested`).
- **Commercial Revenue & Deal Tracking**: Record quoted values and final deal revenues in Indian Rupee (₹) or custom currencies.
- **Real-Time Analytics & BI**: Track Won Revenue, Active Pipeline Value, full conversion funnel with zero-denominator protection, and Tier Performance analysis.
- **Backup & Disaster Recovery**: Atomic JSON exports, schema migration versioning, and real-time data integrity scanner.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (tested on Node 20 / 22 / 26)
- npm or pnpm

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/leadflow.git
cd leadflow

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 🛠 Project Structure

```
├── docs/
│   └── USER_GUIDE.md           # Comprehensive user operator manual
├── src/
│   ├── components/             # Reusable UI & CRM components
│   │   ├── dashboard/          # Metric cards, sales funnels, velocity
│   │   ├── leads/              # Lead table, cards, filters, detail inspector
│   │   └── ui/                 # Buttons, modals, badge components
│   ├── lib/
│   │   ├── analytics.ts        # Analytics calculations & conversion math
│   │   ├── backup.ts           # JSON backup generation & schema validator
│   │   ├── dataIntegrity.ts    # Real-time health scanner
│   │   ├── storage.ts          # Versioned LocalStorage abstraction
│   │   └── whatsapp.ts         # Phone normalization & deep link builder
│   ├── pages/                  # Dashboard, Leads, Follow-ups, Analytics, Settings
│   ├── services/               # Excel/CSV parser & 24-field exporter
│   └── types/                  # Strict TypeScript interfaces
├── test_e2e_phase4.mjs         # Phase 4 Playwright analytics tests
├── test_e2e_full_regression.mjs# Full Phases 1-5 Playwright regression suite
└── test_phase5_data_safety.ts  # Backup & data integrity unit tests
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `O` | Open WhatsApp conversation |
| `M` | Mark lead as Contacted |
| `C` | Copy message to clipboard |
| `P` | Copy phone number to clipboard |
| `J` or `↓` | Navigate to next lead |
| `K` or `↑` | Navigate to previous lead |
| `Esc` | Close Lead Detail Inspector |

---

## 🚢 Static Production Deployment

LeadFlow has zero server dependencies. Build the production bundle and deploy to any static hosting provider:

```bash
npm run build
```

This generates static assets inside the `dist/` folder.

- **Vercel**: Run `npx vercel` or connect your GitHub repository.
- **Netlify**: Drag and drop the `dist/` folder or configure build command `npm run build` with publish directory `dist`.
- **Cloudflare Pages**: Set build command `npm run build` and build output directory `dist`.
- **GitHub Pages**: Deploy `dist/` using the standard GitHub Pages Action.

---

## 🔒 Security & Privacy Architecture

- **No Remote Telemetry**: Zero external tracking or analytics scripts.
- **No Unofficial APIs**: Uses official WhatsApp URI schemes (`https://api.whatsapp.com/send`).
- **Sandboxed**: Leads and client data never leave your personal computer.

---

## 📄 License

MIT © LeadFlow
