# Phase 3: Student Enrollment & Document Upload

## 1. Overview
Build the core data collection systems: the multi-step enrollment wizard (stepper) and the document upload dropzone interface.

---

## 2. Target Files & Folders
- **Pages:**
  - `app/student/enrollment-form/page.tsx` (Interactive multi-step enrollment form)
  - `app/student/documents/page.tsx` (Required documents management page)
- **Components:**
  - `app/components/ui/ProgressStepper.tsx` (Horizontal visual progress indicators)
  - `app/components/ui/FileUploadDropzone.tsx` (Drag-and-drop file selector component)
  - `app/components/ui/DocumentStatusCard.tsx` (Card rendering current document verification status)

---

## 3. Specifications

### 3.1 Stepper Enrollment Form
Use a wizard layout wrapping all fields inside 6 progress steps.
- **Navigation Controls:** "Back" (Secondary style), "Save Draft" (Outline style), "Next / Submit Application" (Primary Navy style).
- **Step Components:**
  1. **Personal Information:**
     - Fields: Full name, Gender (select/radio), Date of birth (date picker), Nationality, National ID number.
     - Student photo crop/upload dropzone wrapper.
  2. **Contact Information:**
     - Fields: Phone number, Email, Current address, Province/City (select dropdown).
  3. **Academic Background:**
     - Fields: High school name, Graduation year (number/select), Grade/Score, Certificate number.
  4. **Program Selection (Cascading Logic):**
     - Select Faculty -> Select Department -> Select Major (filtered by selection).
     - Select Study shift (Morning, Afternoon, Evening), Select Academic year.
  5. **Parent/Guardian Information:**
     - Fields: Guardian name, Guardian phone number, Relationship, Guardian address.
  6. **Review and Submit:**
     - Render clean summary cards for all categories.
     - Validation summary list (displays a checklist of steps completed vs steps with errors).
     - "Submit Application" action triggers confirmation modal.

### 3.2 Document Upload Page
- **Requirements Checklist:**
  - National ID card
  - High school certificate
  - Birth certificate
  - Student photo
  - Application form
- **UI Components per Document Card:**
  - Drag-and-drop file upload dropzone.
  - Progress bar animation showing upload simulation.
  - Status badge (visual indicator matching colors defined in [phase.md](file:///d:/university_enrollment_system/docs/phase.md#1-theme--colors-modern-academic-minimalism)):
    - `Not Uploaded` (Gray)
    - `Uploaded` (Blue)
    - `Under Review` (Amber)
    - `Valid` (Green)
    - `Invalid` (Red)
  - Options: Preview file (modal), Replace file, Delete file.
- **UX Constraints:**
  - Acceptable formats: `PDF`, `JPG`, `PNG` (show clear instructions).
  - Maximum file size: `5MB` (reject file with inline warning alert if exceeded).
  - Display reject reasons clearly when status is `Invalid` (with a prompt to re-upload).

---

## 4. Verification Checklist
- [x] Steps must enforce mandatory fields validation before moving forward.
- [x] Faculty select change updates Major select choices dynamically.
- [x] Review step shows accurate information inputted from previous steps.
- [x] Dropzone accepts drag-and-drop files and rejects unsupported file extensions.
- [x] Large files (>5MB) trigger an error message and block uploading.
- [x] Status badges colors correspond correctly to specification rules.
