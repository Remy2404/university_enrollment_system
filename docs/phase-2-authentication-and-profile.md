# Phase 2: Authentication & Profile Management

## 1. Overview
Implement user account registration, login screens, student profile editing, app settings, and the basic notification logs view.

---

## 2. Target Files & Folders
- **Pages:**
  - `app/login/page.tsx` (Login page)
  - `app/register/page.tsx` (Registration page)
  - `app/student/profile/page.tsx` (Student Profile view)
  - `app/student/settings/page.tsx` (Settings configurations)
  - `app/student/notifications/page.tsx` (Notifications list log)
- **Components:**
  - `app/components/ui/NotificationCard.tsx` (Card for notification list item)

---

## 3. Specifications

### 3.1 Login Page
- **Layout:** Split layout on desktop (Left: Clean academic illustration/brand; Right: Center-aligned login box). Single column on mobile.
- **Fields:** Email, Password.
- **Actions:**
  - `Login` button (disabled during submission).
  - "Forgot password?" text link.
  - "Create student account" text link redirecting to register.
- **UX Rules:**
  - Include show/hide password toggle.
  - Form validation with inline error messages (near corresponding inputs).
  - Clear error states for wrong password/non-existent user.

### 3.2 Student Registration Page
- **Fields:** Full name, Email, Phone number, Password, Confirm password.
- **Actions:**
  - `Create account` button.
  - "Already have an account? Log in" redirect link.
- **Validation Constraints:**
  - All fields are required.
  - Valid email format validation.
  - Password strength helper text (e.g., must contain minimum 8 characters).
  - Confirm password field matches password exactly.

### 3.3 Student Profile Page
- **Sections:**
  - **Basic Information:** Photo placeholder, Full Name, Gender, Date of Birth, National ID.
  - **Contact Information:** Phone number, Email (disabled or verified badge), Current Address.
  - **Account Security:** Change password form (Current password, new password, confirm new password).
  - **Notification Preferences:** Checkboxes (Email notifications, SMS notifications, Application updates).
- **Actions:** "Save Changes" (Primary Navy button), "Cancel".

### 3.4 Notifications Page
- **UI Structure:** Log-style list of messages.
- **States:** Read vs Unread indicators (Unread showing a soft blue dot or soft blue card border).
- **Filtering System:** Quick tabs or dropdown to filter by category:
  - *All*, *Unread*, *System*, *Application Status*, *Documents*.
- **Sample Notification Card Types:**
  - Success (Green icon: e.g., "Application submitted successfully.")
  - Informational (Blue icon: e.g., "Your documents are under review.")
  - Alert/Warning (Amber/Red icon: e.g., "Your high school certificate was rejected.")

---

## 4. Verification Checklist
- [ ] Split screen layout scales smoothly from desktop to mobile.
- [ ] Password visibility toggle functions correctly on both login and register screens.
- [ ] Register form prevents submission when passwords do not match.
- [ ] Unread/Read states for notifications are visually distinct.
- [ ] All inputs are strictly validated client-side.
- [ ] No hardcoded configuration strings or secrets are left in pages.
