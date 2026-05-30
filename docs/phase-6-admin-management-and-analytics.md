# Phase 6: Admin Management & Analytics

## 1. Overview
Build system settings, program controls, academic period configurations, and analytical reports panels for system administrators.

---

## 2. Target Files & Folders
- **Pages:**
  - `app/admin/programs/page.tsx` (Faculties, departments, and majors manager)
  - `app/admin/analytics/page.tsx` (Analytics dashboards and reports)
- **Components:**
  - `app/components/ui/KPIStatCard.tsx` (Dashboard statistic visual component)
  - `app/components/ui/ProgramCard.tsx` (Visual card for faculty or academic major display)

---

## 3. Specifications

### 3.1 Program Management Page
- **Functional Modules:**
  - **Faculty List:** Table displaying active faculties (e.g. *Faculty of Information Technology*), departments count, and status.
  - **Major Management:** List of majors mapped to departments (e.g. *Software Engineering* under *IT*).
  - **Academic Period Manager:** Panel to open/close enrollment periods, set current active Academic Year, and dates.
- **CRUD Operations:**
  - Standard Add, Edit, Delete modals for Faculty and Major entities.
  - Active/Inactive toggles.
- **UX Controls:**
  - Tables include searching, program sorting, and filter status.
  - Deleting an entity with existing enrollments prompts a safety warnings block.

### 3.2 Reports and Analytics Page
Visual grid showing analytical reports of current enrollments.
- **KPI Stat Cards:**
  - Total Registered Students
  - Completed Enrollments Rate (percentage and absolute numbers)
  - Pending Approval Stack
  - Rejection Rate
- **Chart Components (Mocked with aesthetic CSS layouts or SVG charts):**
  - **Enrollment by Faculty:** Horizontal/vertical bar chart showing numbers distribution.
  - **Enrollment by Major:** Donut or pie chart showing student percentages.
  - **Year-over-Year Summary:** Trend line or double bar chart comparing current performance with past years.
- **Reporting Grid:**
  - List of recent daily reports, logs, and statistics tables.
  - Button: "Export PDF Report" / "Export CSV" (triggers mock download prompt).

---

## 4. Verification Checklist
- [ ] CRUD dialogs validate all fields before submitting (non-empty name, positive values).
- [ ] Active academic period banner reflects changes globally if modified in settings.
- [ ] Admin pages are restricted to Admin role permissions (simulated check).
- [ ] Chart displays render cleanly and scale properly inside Bento Card containers.
- [ ] Deletion safety guard verifies that a department cannot be deleted if active majors are mapped to it.
