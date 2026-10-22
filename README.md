<div align="center">

<img src="public/icon.svg" width="92" alt="PACE logo" />

# PACE
### Run Smarter. Train Better.

**A modern running pace calculator & training companion.**

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/learn/pwa)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment_Planned-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

![Version](https://img.shields.io/badge/version-0.1.0-CBFA58?style=flat-square&labelColor=101B20)
![Status](https://img.shields.io/badge/status-active_development-f0ad4e?style=flat-square&labelColor=101B20)
![License](https://img.shields.io/badge/license-private-64748b?style=flat-square&labelColor=101B20)

**[🌐 Planned Website](https://pace.kritdev.app) · [📖 Features](#-features) · [⚡ Getting Started](#-getting-started) · [🗺️ Roadmap](#%EF%B8%8F-roadmap)**

</div>

---

## ✨ Overview

**PACE** is a mobile-first running companion built by **KRIT.DEV** for runners who want to plan smarter and race with confidence.

> **Every pace. Every progress.**  
> คำนวณเพซ วางแผนการแข่งขัน และเรียนรู้หลักการฝึกซ้อมในที่เดียว

Designed with a dark sport-tech aesthetic, bold performance metrics, and a signature **Volt Lime** accent.

## 📱 Features

| Module | Description | Status |
| :--- | :--- | :---: |
| 🏠 **Dashboard** | Running goals and quick access to tools | 🟢 Initial |
| ⏱️ **Pace Calculator** | Pace, finish time and treadmill speed | 🟢 Initial |
| 🏁 **Race Splits** | Even / negative / positive split simulations | 🟢 Initial |
| 📅 **Training Planner** | Educational weekly training schedule | 🟡 Prototype |
| 📚 **Running Academy** | Easy, long, tempo, interval and recovery fundamentals | 🟡 Draft |
| 📈 **Race Predictor** | Riegel-based finish-time estimates | 🟢 Initial |
| 👟 **Runner Profile** | Personal records and activity history | ⚪ Planned |
| 🤖 **AI Running Coach** | Personalized suggestions with safety rules | ⚪ Planned |

**Legend:** 🟢 Initial implementation · 🟡 Prototype / draft · ⚪ Planned

## 🧰 Tech Stack

<div align="center">

| Frontend | Language | UI Icons | Platform | Hosting |
| :---: | :---: | :---: | :---: | :---: |
| <img src="https://cdn.simpleicons.org/nextdotjs/white" width="38" alt="Next.js" /> | <img src="https://cdn.simpleicons.org/typescript" width="38" alt="TypeScript" /> | <img src="https://cdn.simpleicons.org/lucide" width="38" alt="Lucide" /> | <img src="https://cdn.simpleicons.org/pwa" width="38" alt="PWA" /> | <img src="https://cdn.simpleicons.org/vercel/white" width="38" alt="Vercel" /> |
| **Next.js 15** | **TypeScript 5** | **Lucide React** | **Web Manifest** | **Vercel (planned)** |

</div>

React 19 powers the interactive experience. The MVP currently uses plain CSS and local component state. PostgreSQL, Prisma, authentication, activity sync, and offline caching are **future phases**, not existing integrations.

## ⚡ Getting Started

**Prerequisites:** Node.js 20+ and npm.

```bash
git clone https://github.com/keng013/pace-running-app.git
cd pace-running-app
npm install
npm run dev
```

Open **http://localhost:3000**.

### Production build

```bash
npm run build
npm run start
```

> Build and deployment verification are pending. This README describes the current implementation, not a confirmed production release.

## 🗂️ Project Structure

```text
pace-running-app/
├── app/
│   ├── globals.css         # Sport-tech theme and responsive UI
│   ├── layout.tsx          # Metadata, viewport and root layout
│   └── page.tsx            # Six mobile-first app views
├── lib/
│   └── pace.ts             # Pace, prediction and split calculations
├── public/
│   ├── icon.svg            # PACE brand mark
│   └── manifest.webmanifest
├── eslint.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 🎨 Design System

| Token | Color | Purpose |
| :--- | :--- | :--- |
| Midnight Navy | `#101B20` | Main background |
| Volt Lime | `#CBFA58` | Primary accent and actions |
| Surface | `#1C2A30` | Cards and panels |
| Off White | `#F6F8F5` | Primary text |
| Muted Blue Gray | `#A6B8BC` | Secondary text |

**Design principles:** Mobile-first · Accessible contrast · Clear performance data · Minimal friction.

## 🧮 Calculation Engine

- **Pace:** seconds per kilometer
- **Finish time:** distance × pace
- **Speed:** 3,600 ÷ pace (seconds/km)
- **Race prediction:** `T₂ = T₁ × (D₂ / D₁)^1.06`
- **Splits:** per-kilometer segments normalized to the selected total finish time

Race predictions are estimates. Negative/positive split distributions are simulations, not validated personalized pacing prescriptions.

## 🗺️ Roadmap

- [x] Repository and initial project structure
- [x] Six responsive mobile views
- [x] Core pace calculation and race split engine
- [x] Initial race prediction
- [x] PWA web manifest
- [ ] Automated tests and CI checks
- [ ] Verify Vercel build and deploy
- [ ] Configure `pace.kritdev.app` domain and DNS
- [ ] Offline service worker and caching strategy
- [ ] Persistent runner profiles and workout logs
- [ ] Evidence-reviewed Running Academy content
- [ ] Adaptive training plans and AI coaching

## 🚀 Deployment

1. Import this repository at [Vercel](https://vercel.com/new).
2. Select the **Next.js** framework.
3. Deploy and inspect the build logs.
4. Add `pace.kritdev.app` under **Project Settings → Domains**.
5. Configure the DNS records requested by Vercel.

**Note:** A Vercel project and live domain have not yet been confirmed.

## ⚕️ Disclaimer

Training content is educational and not a substitute for professional medical advice or individualized coaching. Runners should adjust effort to their health, experience, environment and recovery needs.

---

<div align="center">

### Built with 💚 by **KRIT.DEV**

**PACE — Every pace. Every progress.**

<sub>© 2026 KRIT.DEV · Private project · All rights reserved</sub>

</div>
