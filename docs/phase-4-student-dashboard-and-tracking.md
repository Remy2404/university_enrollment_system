# Phase 4: Student Dashboard & Application Tracking

## 1. Overview
Build the main dashboard for registered students using a modern Bento Grid layout, and implement the application progress timeline tracking interface.

---

## 2. Target Files & Folders
- **Pages:**
  - `app/student/dashboard/page.tsx` (Student Bento Dashboard)
  - `app/student/status/page.tsx` (Application Status timeline page)
- **Components:**
  - `app/components/ui/ApplicationTimeline.tsx` (Visual vertical stepper/timeline showing status stages)

---

## 3. Specifications

### 3.1 Student Bento Dashboard
Arrange the main portal home as a bento layout of grids (2-column on tablet, 3 or 4-column on desktop, single-column on mobile).
- **Required Bento Grid Cards:**
  1. **Application Status Card:** Large bold badge showing current status (e.g. *Pending Review*, *Need Correction*) with a relative helper text.
  2. **Enrollment Progress Card:** Circular progress indicator or clean track bar displaying percentage completed (e.g., *65% completed*).
  3. **Required Documents Card:** List of uploaded documents status, showing a red warning badge if any are missing or rejected.
  4. **Selected Program Card:** Displays academic details: Faculty name, Major selection, study shift.
  5. **Important Dates Card:** Small calendar log card showing deadlines, interview times, or announcement dates.
  6. **Recent Notifications Card:** List of top 3 recent system/status notification logs.
  7. **Next Step Action Card:** Large primary panel indicating what the student must do next (e.g., "Upload high school certificate to resume review process").
  8. **Quick Actions Card:** Grid of links: *Continue Application*, *View Details*, *Upload Files*, *Contact Helpdesk*.

### 3.2 Application Status Page
- **Timeline Structure:** Vertical step tracker showing the stages of the application:
  1. **Draft:** Initial creation and forms editing.
  2. **Submitted:** Application locked and sent for review.
  3. **Document Review:** Admission office checks uploads validity.
  4. **Admission Review:** Faculty reviews academic qualification.
  5. **Approved or Rejected:** Final decision status.
  6. **Enrollment Completed:** Active student registration.
- **Visual Styles for Timeline Nodes:**
  - *Completed Node:* Emerald Green background circle with a check icon.
  - *Current Node:* Glowing Blue background ring with pulse animation.
  - *Pending Node:* Neutral Gray dotted outline dot.
  - *Error Node:* Red background circle with exclamation icon (for Rejected or Correction Required).
- **Details Card Panel:**
  - Current Status Badge.
  - Timestamp of submission and last status change.
  - **Reviewer Comment box:** Text area displaying review notes if requested correction or rejected (e.g. "Sok Dara: Photo uploaded is too dark. Please re-upload a clear selfie with a white background.").
  - **Action Button Trigger:** E.g., "Re-upload Document" linking back to the Document page.

---

## 4. Verification Checklist
- [x] Bento Grid cards adjust columns count correctly at breakpoints (`sm`, `md`, `lg`).
- [x] Circular progress indicator shows accurate completion percentages.
- [x] Timeline steps highlight the current status and hide future step contents.
- [x] Reviewer comments display conditionally only if present in application state data.
- [x] Actions from dashboard redirect to correct form steps or pages.
