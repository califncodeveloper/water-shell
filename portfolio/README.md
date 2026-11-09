# Water Shell — Premium Product & App Portfolio Website

A modern, production-grade marketing and portfolio web application for **Water Shell**, showcasing domestic and commercial water purifiers, smart touch experiences, certified service booking, and mobile app download flows.

Built inside `portfolio/` as an independent web application without altering the existing mobile application, admin panel, or Firebase backend.

---

## 🌟 Key Highlights & Brand Identity

- **Brand Name:** Water Shell
- **Brand Colors:**
  - Deep Navy: `#1B1F5E` (Brand Core)
  - Forest Green: `#2E8B57` (Secondary Accent)
  - Vibrant Orange: `#F5A623` (High-Priority Action)
  - Pure White: `#FFFFFF`
  - Light Gray: `#F8FAFC` (Canvas Neutral)
- **Official Categories:**
  1. RO Water Purifiers
  2. Water Dispensers
  3. Booster Pumps
  4. SMPS Power Units
  5. Water Treatment Accessories & Filters
- **Flagship Product:** Aqua Touch (`AP-WP-061`, RO+UV+UF+TDS Smart Touch Controls, ₹15,999)
- **Fulfillment Model:** Direct machine delivery from Tambaram Base Hub to Chennai, Chengalpattu, Kanchipuram, and Pondicherry. Accessories & filters serviced via authorized local dealers.
- **Customer Helpline:**
  - Support Desk 1: `+91 88255 41297` (Sales & Orders)
  - Support Desk 2: `+91 86108 76009` (Service Escalation)
  - Tambaram Main Hub: `9789009889`
  - Mudichur Branch: `6383156647`
  - Guduvanchery Branch: `8682020588`

---

## 📱 Implemented Sections

1. **Header & Navigation:** Sticky glassmorphism header with official Water Shell logo, section anchors, click-to-call helpline pill, and "Get App" CTA.
2. **Hero Section:** "Pure Water. Smarter Living." headline, purity badges, primary/secondary CTAs, live flagship Aqua Touch showcase card with specs and floating badges, and an overlapping trust strip.
3. **About Water Shell:** Brand story, mission, engineering principles, and transparent explanation of the direct-delivery + local-dealer fulfillment ecosystem.
4. **Product Categories:** Interactive cards for the 5 official categories featuring counts, badges, bullet highlights, and category filter shortcuts.
5. **Featured Products Catalog:** Interactive explorer featuring all 61 active products with live search, category filtering, price sorting, technical specifications, quick view modal, and deep-link app ordering.
6. **Why Choose Water Shell:** 6 core value pillars highlighting multi-stage RO purification, mobile ordering, Tambaram origin dispatch, local dealer care, one-tap service, and human support.
7. **Mobile App Showcase:** Interactive smartphone mockup with screen switcher (Home, Catalog, Live Cart & Delivery Validation, Service Booking, Helpline Directory), Google Play & App Store buttons, direct APK download (`AquaPure.apk`), and scannable QR code.
8. **How It Works:** 4-step visual journey explaining product discovery, custom spec selection, mobile checkout, and certified technician installation.
9. **Customer Support & Branch Hubs:** Verified support desks, 3 physical hubs (Tambaram, Mudichur, Guduvanchery), delivery zone coverage cards, and instant callback request form.
10. **FAQ Section:** Categorized accordions addressing brand, products, mobile app, delivery zones, service booking, and dealer partnerships.
11. **Footer & Legal Modals:** Complete site map, catalog category links, verified phone numbers, and modal viewers for Privacy Policy, Terms & Conditions, and Delivery/Warranty Policy.

---

## 🛠️ Technology Stack

- **Framework:** React 19 + TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS 3 with custom brand tokens
- **Icons:** Lucide React
- **Asset Fallbacks:** Resilient image loading with local and hosted fallbacks

---

## 🚀 Commands

### 1. Install Dependencies
```bash
cd portfolio
npm install
```

### 2. Run Development Server
```bash
cd portfolio
npm run dev
```
The website will start at: `http://localhost:5174/`

### 3. Production Build
```bash
cd portfolio
npm run build
```
Build output is generated into `portfolio/dist/`.

### 4. Preview Production Build
```bash
cd portfolio
npm run preview
```

---

## ⚙️ Configuration & Store Setup

- **Android Deep Link Scheme:** `watershell://`
- **Product Deep Link:** `watershell://product/{productId}`
- **Production APK Location:** `portfolio/public/AquaPure.apk` (available for direct download from the website)
- **Google Play URL:** Configured in `portfolio/src/components/AppDownloadModal.tsx` (`https://play.google.com/store/apps/details?id=com.watershell.app`)
- **Apple App Store:** Placeholder badge configured for future iOS launch.

