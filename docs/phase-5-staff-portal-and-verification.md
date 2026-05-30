# Phase 5: Staff Dashboard & Review Portal

## 1. Overview
Build the administrative review system for university admission staff, including the applications tracker table, student application detailed review tabs, and document verification tools.

---

## 2. Target Files & Folders
- **Pages:**
  - `app/staff/dashboard/page.tsx` (Staff Dashboard home)
  - `app/staff/review/[id]/page.tsx` (Application Review Page)
  - `app/staff/verify/[id]/page.tsx` (Document Verification Page)
- **Components:**
  - `app/components/ui/DataTable.tsx` (Table component with sorting, pagination, and select rows)
  - `app/components/ui/SearchFilterBar.tsx` (Filtering controller bar)
  - `app/components/ui/ConfirmationDialog.tsx` (Modal verification dialogue)

---

## 3. Specifications

### 3.1 Staff Bento Dashboard
- **Dashboard Stats Bento Cards:**
  1. **Total Applications:** Large count number with subtext showing percentage growth.
  2. **Pending Review:** Highlighted card displaying total backlog queue.
  3. **Approved Applications:** Total count.
  4. **Rejected Applications:** Total count.
  5. **Missing Documents:** Total count of applications with pending files.
  6. **Applications by Faculty:** Simple bar distribution layout.
- **Recent Applications Data Table:**
  - Columns: *Student Name*, *Application ID*, *Program/Major*, *Submitted Date*, *Status Badge*, *Action Link*.
  - Status color codes mapping (Green for Approved, Red for Rejected, Amber for Pending/Need Correction).
  - Search field matching by Name or ID, filters by Faculty and Status.

### 3.2 Application Review Page
- **Layout:** Two-column split interface:
  - **Left Panel (70%):** Tabbed content area showing application files:
    - **Overview:** General student details summary, enrollment metadata.
    - **Personal Info:** Personal, Guardian, and Contact fields.
    - **Academic Info:** High school, grades, graduation details.
    - **Program Selection:** Faculty, Major, Study shift.
    - **Documents:** Quick preview links of all uploaded documents.
    - **Review Notes:** List of comments left by reviewers.
  - **Right Panel (30%):** Action box:
    - Current Status display.
    - Textarea for adding comments or instructions.
    - CTA Actions: "Approve Application" (Primary Green), "Request Correction" (Amber), "Reject" (Red).
- **Confirmation Modals:** Triggered upon clicking any review action to prevent accidental status changes.

### 3.3 Document Verification Page
- **UI Layout:** Split screen:
  - **Left Side List:** Selected student documents checklist with current status badges. Clicking a document loads it into the viewer.
  - **Right Side Previewer:** Visual container rendering PDF/Image files.
  - **Verification Panel:**
    - Action inputs for the active document:
      - "Mark as Valid" (Approved state).
      - "Mark as Invalid" (Rejected state, requires a text description of the issue).
      - Button: "Request Re-upload" (sends alert notification to student).

---

## 4. Verification Checklist
- [ ] Data table correctly handles search queries, dropdown filtering, and pagination.
- [ ] Tab switching transitions smoothly and renders clean, form-locked information layouts.
- [ ] Status actions require a double confirmation modal (Poka-Yoke principle).
- [ ] Marking a document as invalid disables the "Mark as Valid" action and prompts for a failure reason.
- [ ] Responsive design hides non-critical columns on table on tablet/mobile screens.
