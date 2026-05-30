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
- [x] **1.5 Setup Initial Prototype Data (Superseded)**
  - [x] Build the initial local fixture used during UI prototyping
  - [x] Retire the fixture after the Supabase integration replaced the prototype API

---

## Phase 2: Authentication & Profile Management
- [x] **2.1 Implement Auth Pages**
  - [x] Create Login page split layout with email/password input and password visibility toggle
  - [x] Create Student Registration page with password strength validator and matching checks
- [x] **2.2 Implement Student Profile Page**
  - [x] Create Basic Info section with student details forms
  - [x] Create Contact Info section with email/phone/address inputs
  - [x] Create Account Security section with change password forms
  - [x] Create Notification Preferences checkbox controls
- [x] **2.3 Implement Settings Page**
  - [x] Setup account general configurations
  - [x] Create settings forms and active widgets
- [x] **2.4 Implement Notifications Log Page**
  - [x] Build notification log page using `NotificationCard` items
  - [x] Add filtering tabs (All, Unread, System, Application, Documents)
  - [x] Support unread status visual indicator

---

## Phase 3: Student Enrollment & Document Upload
- [x] **3.1 Implement Enrollment Form Stepper**
  - [x] Build `ProgressStepper` horizontal navigation header
  - [x] Step 1: Personal Info (name, DOB, gender, nationality, student photo)
  - [x] Step 2: Contact Info (phone, email, address, province/city select)
  - [x] Step 3: Academic Background (high school name, grade, certificate number)
  - [x] Step 4: Program Selection (cascading Faculty -> Department -> Major selectors)
  - [x] Step 5: Parent/Guardian Info (relationship, phone number, address)
  - [x] Step 6: Review & Submit (data validation summary, submit prompt confirmation modal)
- [x] **3.2 Implement Document Upload Page**
  - [x] Build `FileUploadDropzone` supporting drag-and-drop actions
  - [x] Create checklist items for all 5 required documents (ID, Certificate, Photo, etc.)
  - [x] Display document status badges with corresponding status colors
  - [x] Implement file upload simulated progress bar
  - [x] Add Preview, Replace, and Delete actions
  - [x] Add validation to restrict file type (PDF, JPG, PNG) and file size (<5MB)

---

## Phase 4: Student Dashboard & Application Tracking
- [x] **4.1 Build Student Dashboard Bento Grid**
  - [x] Setup bento layout panel
  - [x] Add Application Status card
  - [x] Add Enrollment Progress circular bar card
  - [x] Add Required Documents verification status card
  - [x] Add Selected Program summary card
  - [x] Add Important Dates calendar preview card
  - [x] Add Recent Notifications log card
  - [x] Add Next Step panel card
  - [x] Add Quick Actions grid card
- [x] **4.2 Build Application Status Timeline Page**
  - [x] Implement `ApplicationTimeline` (visual vertical steps indicating Draft -> Submitted -> Review -> Decision -> Enrolled)
  - [x] Add timeline nodes visual styles (completed, current active, pending, error/rejected)
  - [x] Implement Reviewer Comments box component showing feedback comments
  - [x] Support quick correction action redirection trigger

---

## Phase 5: Staff Dashboard & Review Portal
- [x] **5.1 Build Staff Dashboard Bento Grid**
  - [x] Add stats cards: Total Applications, Pending, Approved, Rejected, Missing Documents, and Faculty distributions
  - [x] Build Recent Applications data table
  - [x] Implement search field, filters by faculty, and status controls
- [x] **5.2 Build Application Review Page**
  - [x] Create two-column split layout template
  - [x] Implement detail tabs (Overview, Personal, Academic, Program, Documents, Review Notes)
  - [x] Create right-side status controller box with Approve, Request Correction, and Reject actions
  - [x] Integrate safety Double Confirmation modals
- [x] **5.3 Build Document Verification Page**
  - [x] Create document list sidebar picker
  - [x] Create central document preview panel
  - [x] Create verification control box (Mark Valid, Mark Invalid with reason textarea, Request Re-upload)

---

## Phase 6: Admin Management & Analytics
- [x] **6.1 Build Program Management Page**
  - [x] Create Faculty and Majors data list tables
  - [x] Implement modal forms for adding/editing faculties and majors
  - [x] Implement Active/Inactive status controls
  - [x] Build Academic Period manager (active academic year selectors, enrollment dates inputs)
- [x] **6.2 Build Reports & Analytics Dashboard**
  - [x] Add KPI metric cards (Total Registered, Completed rate, Pending, Rejections)
  - [x] Create charts using CSS/SVG (Enrollment by Faculty, Enrollment by Major, trend comparison lines)
  - [x] Create reports generation table list with Export PDF/CSV trigger actions

---

## Phase 7: Supabase Integration
- [x] **7.1 Add Supabase Client Infrastructure**
  - [x] Add browser, server, and proxy session clients
  - [x] Add the authenticated user provider and role-aware portal shell
- [x] **7.2 Replace Prototype Data Access**
  - [x] Replace browser storage sessions with Supabase Auth
  - [x] Replace JSON Server calls with typed service-layer queries and RPC calls
  - [x] Connect private document uploads and signed preview URLs
- [x] **7.3 Add Local Database Migration**
  - [x] Add notifications, preferences, hardened application RPCs, RLS policies, and grants
- [ ] **7.4 Complete Remote Deployment**
  - [ ] Restore Supabase MCP authentication
  - [x] Apply the checked-in migration and regenerate TypeScript database types
  - [ ] Write the project URL and publishable key to `.env.local`
  - [ ] Run authenticated browser workflow verification
