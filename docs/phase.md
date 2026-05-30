# University Enrollment System - Implementation Phases

This document outlines the phased implementation plan for the University Enrollment System, derived from the core [UI/UX Specification](file:///d:/university_enrollment_system/docs/index.md). 

The project is split into 6 distinct implementation phases to ensure progressive enhancement, thorough testing, and structured delivery.

---

## Phases Overview

| Phase | Title | Description | Target Files | Status |
|---|---|---|---|---|
| **Phase 1** | [Setup, Design System & Landing Page](file:///d:/university_enrollment_system/docs/phase-1-design-system-and-landing.md) | Base styles, theme variables, core components, and the public landing page. | `phase-1-design-system-and-landing.md` | `[x] Completed` |
| **Phase 2** | [Authentication & Profile Management](file:///d:/university_enrollment_system/docs/phase-2-authentication-and-profile.md) | User authentication screens, student profile, settings, and notification system. | `phase-2-authentication-and-profile.md` | `[x] Completed` |
| **Phase 3** | [Student Enrollment & Document Upload](file:///d:/university_enrollment_system/docs/phase-3-enrollment-form-and-documents.md) | Multi-step enrollment stepper form and document dropzone upload interface. | `phase-3-enrollment-form-and-documents.md` | `[x] Completed` |
| **Phase 4** | [Student Dashboard & Application Tracking](file:///d:/university_enrollment_system/docs/phase-4-student-dashboard-and-tracking.md) | Student bento grid dashboard and application tracking timeline. | `phase-4-student-dashboard-and-tracking.md` | `[x] Completed` |
| **Phase 5** | [Staff Dashboard & Review Portal](file:///d:/university_enrollment_system/docs/phase-5-staff-portal-and-verification.md) | Admission staff dashboards, detail review screen, and verification panel. | `phase-5-staff-portal-and-verification.md` | `[x] Completed` |
| **Phase 6** | [Admin Management & Analytics](file:///d:/university_enrollment_system/docs/phase-6-admin-management-and-analytics.md) | Academic program setup, enrollment period controller, and charts. | `phase-6-admin-management-and-analytics.md` | `[x] Completed` |

---

## Global Design System & Core Guidelines

All phases must strictly adhere to the following specifications defined in the master [Specification](file:///d:/university_enrollment_system/docs/index.md):

### 1. Theme & Colors (Modern Academic Minimalism)
- **Primary Navy:** `#1E3A8A` (Action and navigation color)
- **Deep Academic Blue:** `#172554`
- **Soft Blue:** `#DBEAFE`
- **Backgrounds:** Main Background `#F8FAFC` (light gray), Cards `#FFFFFF` (white cards)
- **Borders:** `#E2E8F0`
- **State Badges:**
  - **Success / Approved:** Emerald Green (`#059669` text, `#D1FAE5` background)
  - **Pending / Warning / Need Correction:** Amber (`#D97706` text, `#FEF3C7` background)
  - **Error / Rejected / Missing:** Red (`#DC2626` text, `#FEE2E2` background)
  - **Draft / Inactive:** Slate/Cool Gray (`#475569` text, `#F8FAFC` background)

### 2. Typography (Inter / Plus Jakarta Sans / Geist Sans)
- **Page Title:** `30px - 36px`, weight `700`
- **Section Title:** `22px - 24px`, weight `600`
- **Card Title:** `16px - 18px`, weight `600`
- **Body Text:** `14px - 16px`, weight `400` (Slate Gray `#475569`)
- **Helper Text:** `12px - 13px` (Cool Gray `#64748B`)

### 3. Layout Styles & Spacing
- **Sidebar Layout:** Left sidebar navigation (desktop), collapsible (tablet), bottom drawer (mobile).
- **Bento Grid Cards:** Rounded corners `16px - 24px`, soft shadows, light border.
- **Spacing Guidelines:**
  - Page Padding: `24px - 32px`
  - Card Padding: `20px - 24px`
  - Section Gap: `24px`
  - Form Field Gap: `16px`

### 4. Mock Database API (json-server)
A mock database configuration is provided in the root [db.json](file:///d:/university_enrollment_system/db.json) file. This JSON database seeds the system with mock users (students, staff, admin), faculties, majors, active applications with various states (draft, submitted, approved, etc.), documents, notifications, and analytics stats.

To run the mock API server locally:
```bash
npx json-server --watch db.json --port 3001
```

All application endpoints support full CRUD operations:
- `/users` - Student, staff, and admin accounts
- `/faculties` - Academic faculties
- `/majors` - Fields of study under faculties
- `/applications` - Enrollment applications containing form progress data
- `/documents` - Uploaded verification documents checklist
- `/notifications` - Action notifications triggered by status changes
- `/systemStats` - Application analytics metrics

---

## Progress Tracking

For tracking task lists and marking off individual steps, use the [Task Board](file:///d:/university_enrollment_system/docs/task.md).
