"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  ArrowRight,
  UserPlus,
  LogIn,
  CheckCircle2,
  Calendar,
  FileText,
  ShieldCheck,
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from "lucide-react";
import { Button } from "./components/ui/Button";
import { BentoCard } from "./components/ui/BentoCard";

export default function LandingPage() {
  const [showRequirements, setShowRequirements] = useState(false);

  const steps = [
    {
      num: "01",
      title: "Create Account",
      desc: "Register a secure student account with your email and phone number.",
      icon: UserPlus,
    },
    {
      num: "02",
      title: "Complete Forms",
      desc: "Fill in personal, contact, and academic details in our progressive stepper wizard.",
      icon: FileText,
    },
    {
      num: "03",
      title: "Upload Documents",
      desc: "Drag and drop high school certificate, ID, birth certificate, and student photo.",
      icon: CheckCircle2,
    },
    {
      num: "04",
      title: "Track Status",
      desc: "Watch real-time status updates from staff review to final admission approval.",
      icon: ShieldCheck,
    },
  ];

  const programs = [
    {
      faculty: "Faculty of Information Technology",
      code: "FIT",
      majors: ["Software Engineering", "Computer Science", "Information Systems", "Cybersecurity"],
      count: 4,
      color: "from-blue-550 to-indigo-650",
    },
    {
      faculty: "Faculty of Business Administration",
      code: "FBA",
      majors: ["Business Management", "Accounting & Finance", "Marketing"],
      count: 3,
      color: "from-amber-500 to-orange-600",
    },
    {
      faculty: "Faculty of Engineering",
      code: "FE",
      majors: ["Civil Engineering", "Electrical Engineering"],
      count: 2,
      color: "from-emerald-500 to-teal-600",
    },
    {
      faculty: "Faculty of Law & Public Affairs",
      code: "FLPA",
      majors: ["Jurisprudence", "Public Administration"],
      count: 2,
      color: "from-red-500 to-rose-600",
    },
    {
      faculty: "Faculty of Education",
      code: "FED",
      majors: ["TEFL", "Educational Leadership"],
      count: 2,
      color: "from-purple-500 to-pink-600",
    },
  ];

  const requirements = [
    { name: "National ID Card or Passport", desc: "Clear scan of front and back (PDF, JPG, PNG)" },
    { name: "High School Graduation Certificate", desc: "Scan of original certificate or temporary transcript" },
    { name: "Birth Certificate", desc: "Certified copy scan" },
    { name: "Recent Student Photo", desc: "4x6 size with clear white background" },
    { name: "Completed Application Form", desc: "Generated automatically upon stepper completion" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-35 w-full bg-white/80 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-primary-navy">
            <GraduationCap className="w-8 h-8 text-primary-navy" />
            <span className="text-xl tracking-tight font-extrabold text-primary-navy">UES Academia</span>
          </Link>

          {/* Visitor Menu Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-gray">
            <a href="#process" className="hover:text-primary-navy transition-colors">Process</a>
            <a href="#programs" className="hover:text-primary-navy transition-colors">Programs</a>
            <a href="#requirements" className="hover:text-primary-navy transition-colors">Requirements</a>
            <a href="#dates" className="hover:text-primary-navy transition-colors">Important Dates</a>
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="secondary" className="h-9 px-4 text-xs font-semibold">
                <LogIn className="w-4 h-4 mr-1.5" />
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" className="h-9 px-4 text-xs font-semibold">
                Apply Now
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 bg-gradient-to-b from-white to-slate-50 border-b border-[#E2E8F0]">
        <div className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(#DBEAFE_1.5px,transparent_1.5px)] [background-size:24px_24px] pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-soft-blue text-xs font-bold rounded-full text-primary-navy mb-6 uppercase tracking-wider">
            Online Enrollment Portal v2.0
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-academic-blue leading-tight mb-6">
            Start Your University <br />
            <span className="bg-gradient-to-r from-primary-navy to-indigo-700 bg-clip-text text-transparent">
              Enrollment Online
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-slate-gray leading-relaxed mb-10">
            Submit your application details, upload required documentation checklist, and track your admission progress in a single, student-friendly platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="primary" className="w-full sm:w-auto px-8 h-12 text-base font-semibold shadow-md">
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <a href="#requirements" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto px-8 h-12 text-base font-semibold">
                View Requirements
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* 3. Steps Section */}
      <section id="process" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-academic-blue mb-3">Simple 4-Step Process</h2>
          <p className="text-slate-gray max-w-md mx-auto">
            Our enrollment system guides you transparently through every stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <BentoCard key={step.num} className="relative pt-10">
                <div className="absolute top-4 right-6 text-3xl font-extrabold text-slate-100">
                  {step.num}
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-soft-blue text-primary-navy mb-5">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-academic-blue mb-2">{step.title}</h3>
                <p className="text-sm text-slate-gray leading-relaxed">{step.desc}</p>
              </BentoCard>
            );
          })}
        </div>
      </section>

      {/* 4. Programs Section */}
      <section id="programs" className="py-20 px-6 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-academic-blue mb-3">Explore Available Programs</h2>
            <p className="text-slate-gray max-w-md mx-auto">
              Choose from our five accredited academic faculties for the upcoming semester.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((prog) => (
              <BentoCard key={prog.code} className="hover:border-primary-navy/40">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 bg-slate-100 rounded-md text-slate-gray">
                    {prog.code}
                  </span>
                  <span className="text-xs text-cool-gray font-semibold">
                    {prog.count} Majors
                  </span>
                </div>
                <h3 className="text-lg font-bold text-academic-blue mb-4 leading-snug">
                  {prog.faculty}
                </h3>
                <ul className="space-y-2 border-t border-slate-50 pt-4">
                  {prog.majors.map((major) => (
                    <li key={major} className="flex items-center gap-2 text-sm text-slate-gray">
                      <ChevronRight className="w-4 h-4 text-cool-gray" />
                      {major}
                    </li>
                  ))}
                </ul>
              </BentoCard>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Requirements Section */}
      <section id="requirements" className="py-20 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-primary-navy uppercase tracking-wider mb-2 block">
              Admission Guidelines
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-academic-blue mb-6">
              Check Required Admission Documents
            </h2>
            <p className="text-slate-gray leading-relaxed mb-8">
              Ensure you have scanned digital copies of these credentials ready before starting the enrollment stepper form. Original files will be verified by the registrar&apos;s office.
            </p>
            <Button
              variant="secondary"
              onClick={() => setShowRequirements(!showRequirements)}
              className="font-semibold"
            >
              {showRequirements ? "Hide Details" : "Show File Constraints"}
            </Button>
          </div>

          <div className="space-y-4">
            {requirements.map((req) => (
              <div
                key={req.name}
                className="flex gap-4 p-4 rounded-bento bg-white border border-[#E2E8F0] shadow-xs"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-success-green">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-academic-blue mb-0.5">{req.name}</h3>
                  <p className="text-xs text-slate-gray">{req.desc}</p>
                  {showRequirements && (
                    <p className="text-[11px] text-primary-navy mt-1.5 font-semibold bg-soft-blue/40 px-2 py-0.5 rounded inline-block">
                      Constraints: File size &lt; 5MB. Formats: PDF, JPG, PNG only.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Important Dates Section */}
      <section id="dates" className="py-20 px-6 bg-white border-t border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-academic-blue mb-3">Academic Timeline</h2>
            <p className="text-slate-gray max-w-md mx-auto">
              Please note these upcoming deadline periods for the 2026-2027 enrollment campaign.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <BentoCard className="border-l-4 border-l-primary-navy">
              <Calendar className="w-8 h-8 text-primary-navy mb-4" />
              <h3 className="text-md font-bold text-academic-blue mb-2">Registration Opens</h3>
              <p className="text-xs text-cool-gray mb-3">June 1, 2026</p>
              <p className="text-sm text-slate-gray">
                Applications portal opens for online registration, details filing, and document checklists.
              </p>
            </BentoCard>

            <BentoCard className="border-l-4 border-l-warning-amber">
              <Calendar className="w-8 h-8 text-warning-amber mb-4" />
              <h3 className="text-md font-bold text-academic-blue mb-2">Document Verification Deadline</h3>
              <p className="text-xs text-cool-gray mb-3">August 15, 2026</p>
              <p className="text-sm text-slate-gray">
                All uploaded documents must be verified and corrected if marked invalid by admission staff reviewers.
              </p>
            </BentoCard>

            <BentoCard className="border-l-4 border-l-success-green">
              <Calendar className="w-8 h-8 text-success-green mb-4" />
              <h3 className="text-md font-bold text-academic-blue mb-2">Classes Commencement</h3>
              <p className="text-xs text-cool-gray mb-3">September 1, 2026</p>
              <p className="text-sm text-slate-gray">
                Inauguration day and official start of the first semester classes for all approved enrollments.
              </p>
            </BentoCard>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary-navy to-academic-blue text-white text-center">
        <div className="max-w-3xl mx-auto">
          <GraduationCap className="w-16 h-16 text-soft-blue mx-auto mb-6" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight">
            Ready to Begin Your Academic Journey?
          </h2>
          <p className="text-soft-blue/80 text-md max-w-xl mx-auto mb-8">
            Create your account today. The application processes take less than 15 minutes to fill.
          </p>
          <Link href="/register">
            <Button variant="secondary" className="px-8 h-12 text-base font-semibold border-white text-primary-navy hover:bg-white/90">
              Apply Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 text-white font-bold mb-4">
              <GraduationCap className="w-6 h-6 text-soft-blue" />
              <span>UES Academia</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Modern academic online enrollment portal, supporting streamlined student admissions and Registrar validations.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Contact Office</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-slate-500" />
                admissions@ues.edu.kh
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-slate-500" />
                +855 (0) 23 888 999
              </li>
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500" />
                Russian Federation Blvd, Phnom Penh, Cambodia
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-bold mb-4 uppercase tracking-wider">Accreditation</h4>
            <p className="text-sm leading-relaxed">
              Officially recognized and accredited by the Ministry of Education, Youth and Sport of Cambodia.
            </p>
            <p className="text-xs text-slate-500 mt-4">
              © {new Date().getFullYear()} University Enrollment System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
