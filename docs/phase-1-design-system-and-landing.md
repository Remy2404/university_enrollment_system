# Phase 1: Setup, Design System & Landing Page

## 1. Overview
Establish the foundational styling system, custom CSS typography definitions, core reusable layout components, and build the public landing page.

---

## 2. Target Files & Folders
- **Styles:** [globals.css](file:///d:/university_enrollment_system/app/globals.css) (Setup of CSS variables, font family, core utility classes)
- **Layouts:** `app/components/layout/`
  - `AppSidebar.tsx` (Responsive navigation sidebar)
  - `TopBar.tsx` (Top navigation/user menu bar)
- **Base UI:** `app/components/ui/`
  - `BentoCard.tsx` (Modern card wrapper with `16px-24px` radius, subtle shadow, light border)
  - `StatusBadge.tsx` (Aesthetic status rendering badge)
  - `Button.tsx` (Standard primary/secondary/danger button styles)
  - `States.tsx` (`EmptyState`, `LoadingState`, `ErrorState` components)
- **Landing Page:**
  - `app/landing/page.tsx` or updating the root [page.tsx](file:///d:/university_enrollment_system/app/page.tsx) to render the landing page.

---

## 3. Specifications

### 3.1 Design System Integration
Configure Tailwind CSS or vanilla CSS utility styles using the specified palette:
- **Primary Navy:** `#1E3A8A`
- **Deep Academic Blue:** `#172554`
- **Soft Blue:** `#DBEAFE`
- **Slate Gray:** `#475569`
- **Cool Gray:** `#64748B`
- **Light Gray / Background:** `#F8FAFC`
- **Border Color:** `#E2E8F0`

### 3.2 Layout & Navigation (Public Navigation)
Implement the top navigation for anonymous visitors:
- Links: `Home`, `Programs`, `Enrollment Process`, `Requirements`, `Contact`.
- Action Buttons: `Login` (Secondary style), `Apply Now` (Primary navy button, links to registration).

### 3.3 Landing Page Sections
- **Hero Section:**
  - Title: *"Start Your University Enrollment Online"*
  - Subtitle: *"Apply, upload documents, and track your admission status in one simple platform."*
  - CTA Buttons: "Apply Now" (Primary), "View Requirements" (Secondary).
  - Background styling: Light background with academic illustrations or abstract soft blue patterns.
- **Enrollment Steps:** A 3 or 4 step visual card flow outlining the process (Account Creation -> Fill Form & Upload Docs -> Verification -> Enrollment Completed).
- **Available Programs Preview:** Cards highlighting key faculties (e.g., IT, Business, Engineering) with quick counts of majors.
- **Requirements Summary:** Quick list of required documents (National ID, High School Certificate, Birth Certificate, Student Photo).
- **Important Dates:** Cards showing upcoming deadlines for enrollment periods.
- **Footer:** Academic branding, quick links, contact address.

---

## 4. Verification Checklist
- [ ] Theme colors match the specified hex values exactly.
- [ ] Typography scale is respected: Page Titles `30-36px` bold, body `14-16px` slate gray.
- [ ] Landing page is fully responsive (fits 3-4 columns on desktop, 2 on tablet, 1 column vertical list on mobile).
- [ ] Hover/focus visual feedback implemented for all interactive cards and buttons.
- [ ] CSS files are cleaned of dead styles (Zero Muda rule).
