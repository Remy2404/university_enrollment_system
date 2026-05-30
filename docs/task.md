# University Enrollment System - Implementation Task Board

This task board tracks the progress of the University Enrollment System implementation across all 6 phases.

## Phase 1: Setup, Design System & Landing Page
- [x] **1.1 Setup Base Design System & Styles**
  - [x] Configure Tailwind CSS variables / custom stylesheet theme in [globals.css](file:///d:/university_enrollment_system/app/globals.css)
  - [x] Set up Inter / Plus Jakarta Sans / Geist Sans font variables
  - [x] Define global colors (navy, slate gray, cool gray, success green, warning amber, error red)
- [x] **1.2 Create Base UI Layout Components**
  - [x] Implement `AppSidebar` (responsive desktop sidebar, collapsible tablet menu, mobile bottom drawer)
  - [x] Implement `TopBar` (user profile dropdown, system status indicator)
- [x] **1.3 Build Shared Core UI Components**
  - [x] Implement `BentoCard` (16px-24px rounded corners, subtle shadows, hover transitions)
  - [x] Implement `StatusBadge` (styled colors for Approved, Pending, Rejected, Draft, and Submitted states)
  - [x] Implement `Button` (primary, secondary, danger variations)
  - [x] Implement `States` components (`EmptyState`, `LoadingState`, `ErrorState`)
- [x] **1.4 Implement Landing Page**
  - [x] Implement Hero section with title, subtitle, and CTA actions
  - [x] Implement Enrollment Steps visual card section
  - [x] Implement Available Programs preview cards
  - [x] Implement Requirements Summary list
  - [x] Implement Important Dates timeline preview
  - [x] Implement Footer with academic branding
- [x] **1.5 Setup & Validate Mock Database**
  - [x] Configure [db.json](file:///d:/university_enrollment_system/db.json) with comprehensive seed data (users, applications, documents, faculties, majors)
  - [x] Verify mock server runs via `json-server` and exposes all necessary endpoints
  - [x] Test mock database CRUD functionality for applications and documents

---

## Phase 2: Authentication & Profile Management
- [ ] **2.1 Implement Auth Pages**
  - [ ] Create Login page split layout with email/password input and password visibility toggle
  - [ ] Create Student Registration page with password strength validator and matching checks
- [ ] **2.2 Implement Student Profile Page**
  - [ ] Create Basic Info section with student details forms
  - [ ] Create Contact Info section with email/phone/address inputs
  - [ ] Create Account Security section with change password forms
  - [ ] Create Notification Preferences checkbox controls
- [ ] **2.3 Implement Settings Page**
  - [ ] Setup account general configurations
  - [ ] Create settings forms and active widgets
- [ ] **2.4 Implement Notifications Log Page**
  - [ ] Build notification log page using `NotificationCard` items
  - [ ] Add filtering tabs (All, Unread, System, Application, Documents)
  - [ ] Support unread status visual indicator

---

## Phase 3: Student Enrollment & Document Upload
- [ ] **3.1 Implement Enrollment Form Stepper**
  - [ ] Build `ProgressStepper` horizontal navigation header
  - [ ] Step 1: Personal Info (name, DOB, gender, nationality, student photo)
  - [ ] Step 2: Contact Info (phone, email, address, province/city select)
  - [ ] Step 3: Academic Background (high school name, grade, certificate number)
  - [ ] Step 4: Program Selection (cascading Faculty -> Department -> Major selectors)
  - [ ] Step 5: Parent/Guardian Info (relationship, phone number, address)
  - [ ] Step 6: Review & Submit (data validation summary, submit prompt confirmation modal)
- [ ] **3.2 Implement Document Upload Page**
  - [ ] Build `FileUploadDropzone` supporting drag-and-drop actions
  - [ ] Create checklist items for all 5 required documents (ID, Certificate, Photo, etc.)
  - [ ] Display document status badges with corresponding status colors
  - [ ] Implement file upload simulated progress bar
  - [ ] Add Preview, Replace, and Delete actions
  - [ ] Add validation to restrict file type (PDF, JPG, PNG) and file size (<5MB)

---

## Phase 4: Student Dashboard & Application Tracking
- [ ] **4.1 Build Student Dashboard Bento Grid**
  - [ ] Setup bento layout panel
  - [ ] Add Application Status card
  - [ ] Add Enrollment Progress circular bar card
  - [ ] Add Required Documents verification status card
  - [ ] Add Selected Program summary card
  - [ ] Add Important Dates calendar preview card
  - [ ] Add Recent Notifications log card
  - [ ] Add Next Step panel card
  - [ ] Add Quick Actions grid card
- [ ] **4.2 Build Application Status Timeline Page**
  - [ ] Implement `ApplicationTimeline` (visual vertical steps indicating Draft -> Submitted -> Review -> Decision -> Enrolled)
  - [ ] Add timeline nodes visual styles (completed, current active, pending, error/rejected)
  - [ ] Implement Reviewer Comments box component showing feedback comments
  - [ ] Support quick correction action redirection trigger

---

## Phase 5: Staff Dashboard & Review Portal
- [ ] **5.1 Build Staff Dashboard Bento Grid**
  - [ ] Add stats cards: Total Applications, Pending, Approved, Rejected, Missing Documents, and Faculty distributions
  - [ ] Build Recent Applications data table
  - [ ] Implement search field, filters by faculty, and status controls
- [ ] **5.2 Build Application Review Page**
  - [ ] Create two-column split layout template
  - [ ] Implement detail tabs (Overview, Personal, Academic, Program, Documents, Review Notes)
  - [ ] Create right-side status controller box with Approve, Request Correction, and Reject actions
  - [ ] Integrate safety Double Confirmation modals
- [ ] **5.3 Build Document Verification Page**
  - [ ] Create document list sidebar picker
  - [ ] Create central document preview panel
  - [ ] Create verification control box (Mark Valid, Mark Invalid with reason textarea, Request Re-upload)

---

## Phase 6: Admin Management & Analytics
- [ ] **6.1 Build Program Management Page**
  - [ ] Create Faculty and Majors data list tables
  - [ ] Implement modal forms for adding/editing faculties and majors
  - [ ] Implement Active/Inactive status controls
  - [ ] Build Academic Period manager (active academic year selectors, enrollment dates inputs)
- [ ] **6.2 Build Reports & Analytics Dashboard**
  - [ ] Add KPI metric cards (Total Registered, Completed rate, Pending, Rejections)
  - [ ] Create charts using CSS/SVG (Enrollment by Faculty, Enrollment by Major, trend comparison lines)
  - [ ] Create reports generation table list with Export PDF/CSV trigger actions
