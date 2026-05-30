export interface User {
  id: string;
  name: string;
  email: string;
  role: "student" | "staff" | "admin";
  phoneNumber: string;
  avatarUrl: string;
}

export interface StudentProfile {
  id: string;
  studentId: string;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  nationalId: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

export interface Faculty {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
}

export interface Department {
  id: string;
  facultyId: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export interface Major {
  id: string;
  departmentId: string;
  name: string;
  description: string;
  status: "active" | "inactive";
}

export interface EnrollmentPeriod {
  id: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

export interface Application {
  id: string;
  studentId: string;
  status: "draft" | "submitted" | "pending_review" | "need_correction" | "approved" | "rejected";
  progress: number;
  personalInfo: {
    fullName: string;
    gender: string;
    dateOfBirth: string;
    nationality: string;
    nationalId: string;
    photoUrl: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    address: string;
    city: string;
  };
  academicBackground: {
    highSchoolName: string;
    graduationYear: number | null;
    grade: string;
    certificateNumber: string;
  };
  programSelection: {
    facultyId: string;
    departmentId: string;
    majorId: string;
    shift: string;
    academicYear: string;
  };
  guardianInfo: {
    name: string;
    phone: string;
    relationship: string;
    address: string;
  };
  submittedAt: string | null;
  updatedAt: string;
  reviewerComments: string;
}

export interface ApplicationDocument {
  id: string;
  applicationId: string;
  studentId: string;
  type: "national_id" | "high_school_certificate" | "birth_certificate" | "student_photo" | "application_form";
  name: string;
  url: string;
  status: "not_uploaded" | "uploaded" | "under_review" | "valid" | "invalid";
  uploadedAt: string | null;
  rejectReason: string;
}

export interface ReviewNote {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  comment: string;
  createdAt: string;
}

export interface ApplicationTimelineEvent {
  id: string;
  applicationId: string;
  status: string;
  title: string;
  description: string;
  actorName: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "success" | "info" | "warning" | "error";
  read: boolean;
  createdAt: string;
}
