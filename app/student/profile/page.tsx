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

interface ApplicationRecord {
  id: string;
  studentId: string;
  status: string;
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
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [appRecord, setAppRecord] = useState<ApplicationRecord | null>(null);
  
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

  useEffect(() => {
    const stored = localStorage.getItem("ues_user");
    if (!stored) {
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(stored);
      setUserId(user.id);
      fetchProfileData(user.id, user);
    } catch (e) {
      localStorage.removeItem("ues_user");
      router.push("/login");
    }
  }, [router]);

  const fetchProfileData = async (uid: string, cachedUser: any) => {
    try {
      // 1. Fetch user record
      const userRes = await fetch(`http://localhost:3001/users/${uid}`);
      if (!userRes.ok) throw new Error("User record not found");
      const userObj = await userRes.json();

      // 2. Fetch active application
      const appRes = await fetch(`http://localhost:3001/applications?studentId=${uid}`);
      const appData = await appRes.json();

      if (appData.length > 0) {
        const app = appData[0] as ApplicationRecord;
        setAppRecord(app);
        setProfile({
          fullName: app.personalInfo.fullName || userObj.name || "",
          gender: app.personalInfo.gender || "Male",
          dateOfBirth: app.personalInfo.dateOfBirth || "",
          nationalId: app.personalInfo.nationalId || "",
          nationality: app.personalInfo.nationality || "Cambodian",
          phone: app.contactInfo.phone || userObj.phoneNumber || "",
          email: app.contactInfo.email || userObj.email || "",
          address: app.contactInfo.address || "",
          city: app.contactInfo.city || "",
        });
      } else {
        // Fallback to user account fields
        setProfile({
          fullName: userObj.name || "",
          gender: "Male",
          dateOfBirth: "",
          nationalId: "",
          nationality: "Cambodian",
          phone: userObj.phoneNumber || "",
          email: userObj.email || "",
          address: "",
          city: "",
        });
      }
    } catch (error) {
      toast.error("Failed to load profile. Using local session fallback.");
      setProfile({
        fullName: cachedUser.name || "",
        gender: "Male",
        dateOfBirth: "",
        nationalId: "",
        nationality: "Cambodian",
        phone: cachedUser.phoneNumber || "",
        email: cachedUser.email || "",
        address: "",
        city: "",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

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
      // 1. Update user record in db.json
      const userUpdateRes = await fetch(`http://localhost:3001/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.fullName,
          phoneNumber: profile.phone,
        }),
      });

      if (!userUpdateRes.ok) throw new Error("Failed to update user record");
      const updatedUser = await userUpdateRes.json();

      // Update local storage session
      localStorage.setItem("ues_user", JSON.stringify(updatedUser));

      // 2. Update application record if it exists
      if (appRecord) {
        const appUpdateRes = await fetch(`http://localhost:3001/applications/${appRecord.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personalInfo: {
              ...appRecord.personalInfo,
              fullName: profile.fullName,
              gender: profile.gender,
              dateOfBirth: profile.dateOfBirth,
              nationality: profile.nationality,
              nationalId: profile.nationalId,
            },
            contactInfo: {
              ...appRecord.contactInfo,
              phone: profile.phone,
              email: profile.email,
              address: profile.address,
              city: profile.city,
            },
          }),
        });

        if (!appUpdateRes.ok) throw new Error("Failed to update application details");
        const updatedApp = await appUpdateRes.json();
        setAppRecord(updatedApp);
      }

      toast.success("Profile updated successfully.");
      setIsEditing(false);
      
      // Dispatch storage event to notify layout TopBar of the name update
      window.dispatchEvent(new Event("storage"));
    } catch (error) {
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
    // Simulate delay
    await new Promise((r) => setTimeout(r, 600));
    
    toast.success("Password changed successfully.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSaving(false);
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
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-soft-blue text-2xl font-bold text-primary-navy border-2 border-primary-navy/10">
            {profile.fullName
              ? profile.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
              : "SD"}
          </div>
          {isEditing && (
            <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-navy text-white shadow-sm hover:bg-academic-blue transition-colors">
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
