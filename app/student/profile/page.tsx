"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Lock,
  Save,
  X,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Globe,
} from "lucide-react";
import { Button } from "../../components/ui/Button";
import { BentoCard } from "../../components/ui/BentoCard";
import { LoadingState } from "../../components/ui/States";
import { profileService } from "@/src/services/profile";
import { userService } from "@/src/services/user";
import { useAuth } from "@/src/providers/auth-provider";
import { applicationService, documentService } from "@/src/services/application";
import { createClient } from "@/src/lib/supabase/client";
import type { Application } from "@/src/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: isAuthLoading, refreshProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profile, setProfile] = useState({
    fullName: "",
    gender: "Male",
    dateOfBirth: "",
    nationalId: "",
    nationality: "Cambodian",
    phone: "",
    email: "",
    address: "",
    city: "",
  });

  const [appRecord, setAppRecord] = useState<Application | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  async function fetchProfileData(uid: string) {
    try {
      const [details, app] = await Promise.all([
        profileService.getByStudentId(uid),
        applicationService.getByStudentId(uid)
      ]);

      setAppRecord(app);

      const appPersonal = app?.personalInfo;
      const appContact = app?.contactInfo;

      setProfile({
        fullName: user?.name || appPersonal?.fullName || "",
        gender: details.gender || appPersonal?.gender || "Male",
        dateOfBirth: details.dateOfBirth || appPersonal?.dateOfBirth || "",
        nationalId: details.nationalId || appPersonal?.nationalId || "",
        nationality: details.nationality || appPersonal?.nationality || "Cambodian",
        phone: details.phone || user?.phoneNumber || appContact?.phone || "",
        email: user?.email || details.email || appContact?.email || "",
        address: details.address || appContact?.address || "",
        city: details.city || appContact?.city || "",
      });
    } catch {
      toast.error("Failed to load profile.");
    } finally {
      setIsLoading(false);
    }
  }

  // Load avatar preview URL
  useEffect(() => {
    if (user?.avatarUrl) {
      if (user.avatarUrl.startsWith("http")) {
        const timeoutId = window.setTimeout(() => {
          setAvatarPreviewUrl(user.avatarUrl ?? "");
        }, 0);
        return () => window.clearTimeout(timeoutId);
      } else {
        const fetchAvatarUrl = async () => {
          try {
            const supabase = createClient();
            const { data } = await supabase.storage
              .from("application-documents")
              .createSignedUrl(user.avatarUrl, 60 * 60);
            setAvatarPreviewUrl(data?.signedUrl ?? "");
          } catch (err) {
            console.error("Failed to load avatar url", err);
            setAvatarPreviewUrl("");
          }
        };
        const timeoutId = window.setTimeout(() => void fetchAvatarUrl(), 0);
        return () => window.clearTimeout(timeoutId);
      }
    } else {
      const timeoutId = window.setTimeout(() => {
        setAvatarPreviewUrl("");
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }
  }, [user?.avatarUrl]);

  const handleAvatarClick = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await handleAvatarUpload(file);
      }
    };
    fileInput.click();
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setIsSaving(true);
    const loadingToastId = toast.loading("Uploading profile photo...");
    try {
      let app = appRecord;
      if (!app) {
        app = await applicationService.getOrCreateDraft({
          studentId: user.id,
          studentName: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
        });
        setAppRecord(app);
      }

      const doc = await documentService.upload({
        applicationId: app.id,
        studentId: user.id,
        type: "student_photo",
        file,
      });

      if (doc.storagePath) {
        await userService.update(user.id, {
          name: profile.fullName,
          phoneNumber: profile.phone,
          avatarUrl: doc.storagePath,
        });
        await refreshProfile();
        toast.dismiss(loadingToastId);
        toast.success("Profile photo uploaded successfully.");
      } else {
        throw new Error("Missing storage path in uploaded document");
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      toast.dismiss(loadingToastId);
      toast.error(err instanceof Error ? err.message : "Failed to upload profile photo.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isAuthLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }

    const timeoutId = window.setTimeout(() => void fetchProfileData(user.id), 0);
    return () => window.clearTimeout(timeoutId);
    // The loader is route-context bound and intentionally invoked only on auth changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoading, router, user]);

  const handleSave = async () => {
    if (!user) return;

    // Field validation
    if (profile.fullName.trim().length < 2) {
      toast.error("Full name must be at least 2 characters.");
      return;
    }
    if (profile.phone.trim().length < 8) {
      toast.error("Phone number must be at least 8 digits.");
      return;
    }

    setIsSaving(true);

    try {
      await Promise.all([
        userService.update(user.id, {
          name: profile.fullName,
          phoneNumber: profile.phone,
        }),
        profileService.update(user.id, {
          studentId: user.id,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
          nationalId: profile.nationalId,
          nationality: profile.nationality,
          phone: profile.phone,
          email: profile.email,
          address: profile.address,
          city: profile.city,
        }),
      ]);
      await refreshProfile();

      toast.success("Profile updated successfully.");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword) {
      toast.error("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await userService.changePassword(currentPassword, newPassword);
      toast.success("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingState rows={5} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue">My Profile</h1>
          <p className="text-sm text-slate-gray mt-1">
            View and manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <Button variant="primary" onClick={() => setIsEditing(true)}>
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>
              <X className="w-4 h-4 mr-1.5" />
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              <Save className="w-4 h-4 mr-1.5" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Avatar & Name Header */}
      <BentoCard className="flex items-center gap-6">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-soft-blue text-2xl font-bold text-primary-navy border-2 border-primary-navy/10 overflow-hidden">
            {avatarPreviewUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={avatarPreviewUrl} alt={profile.fullName} className="h-full w-full object-cover" />
            ) : (
              profile.fullName
                ? profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()
                : "SD"
            )}
          </div>
          {isEditing && (
            <button 
              type="button"
              onClick={handleAvatarClick}
              disabled={isSaving}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-navy text-white shadow-sm hover:bg-academic-blue transition-colors focus:outline-none"
              aria-label="Upload profile photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div>
          <h2 className="text-xl font-bold text-academic-blue">
            {profile.fullName || "Student Profile"}
          </h2>
          <p className="text-sm text-slate-gray">{profile.email}</p>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-success-light text-success-green text-xs font-semibold rounded-full mt-2">
            <CheckCircle2 className="w-3 h-3" />
            Verified Student
          </span>
        </div>
      </BentoCard>

      {/* Basic Information */}
      <BentoCard>
        <h3 className="text-lg font-bold text-academic-blue mb-6 flex items-center gap-2">
          <User className="w-5 h-5 text-primary-navy" />
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Full Name <span className="text-error-red">*</span>
            </label>
            <input
              type="text"
              value={profile.fullName}
              disabled={!isEditing}
              onChange={(e) =>
                setProfile({ ...profile, fullName: e.target.value })
              }
              className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Gender
            </label>
            <select
              value={profile.gender}
              disabled={!isEditing}
              onChange={(e) =>
                setProfile({ ...profile, gender: e.target.value })
              }
              className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="date"
                value={profile.dateOfBirth}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, dateOfBirth: e.target.value })
                }
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Nationality
            </label>
            <div className="relative">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="text"
                value={profile.nationality}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, nationality: e.target.value })
                }
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              National ID Number
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="text"
                value={profile.nationalId}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, nationalId: e.target.value })
                }
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
            </div>
          </div>
        </div>
      </BentoCard>

      {/* Contact Information */}
      <BentoCard>
        <h3 className="text-lg font-bold text-academic-blue mb-6 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary-navy" />
          Contact Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Phone Number <span className="text-error-red">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="tel"
                value={profile.phone}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, phone: e.target.value })
                }
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Email Address
              <span className="ml-2 inline-flex items-center gap-1 text-xs text-success-green font-medium">
                <CheckCircle2 className="w-3 h-3" /> Verified
              </span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="email"
                value={profile.email}
                disabled
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type="text"
                value={profile.address}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, address: e.target.value })
                }
                className="w-full h-11 pl-11 pr-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              City / Province
            </label>
            <input
              type="text"
              value={profile.city}
              disabled={!isEditing}
              onChange={(e) =>
                setProfile({ ...profile, city: e.target.value })
              }
              className="w-full h-11 px-4 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
            />
          </div>
        </div>
      </BentoCard>

      {/* Account Security */}
      <BentoCard>
        <h3 className="text-lg font-bold text-academic-blue mb-6 flex items-center gap-2">
          <Lock className="w-5 h-5 text-primary-navy" />
          Account Security
        </h3>
        <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
              >
                {showCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-academic-blue mb-1.5">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cool-gray" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full h-11 pl-11 pr-12 text-sm border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] text-academic-blue placeholder:text-cool-gray/60 focus:outline-none focus:ring-2 focus:ring-primary-navy/30 focus:border-primary-navy transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-cool-gray hover:text-primary-navy transition-colors"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <Button type="submit" variant="primary" isLoading={isSaving}>
            <Lock className="w-4 h-4 mr-1.5" />
            Update Password
          </Button>
        </form>
      </BentoCard>
    </div>
  );
}
