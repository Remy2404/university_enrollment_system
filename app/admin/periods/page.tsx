"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  X,
  Clock
} from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/States";

import { periodService } from "@/src/services/program";
import { EnrollmentPeriod } from "@/src/types";

export default function AdminPeriodsPage() {
  const [periods, setPeriods] = useState<EnrollmentPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form fields state
  const [form, setForm] = useState({
    academicYear: "",
    startDate: "",
    endDate: "",
    status: "inactive" as "active" | "inactive"
  });

  useEffect(() => {
    loadPeriods();
  }, []);

  async function loadPeriods() {
    setIsLoading(true);
    try {
      const data = await periodService.getAll();
      setPeriods(data);
    } catch {
      toast.error("Failed to load enrollment periods.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    setActiveId(null);
    setForm({
      academicYear: "2026-2027",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: "inactive"
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: EnrollmentPeriod) => {
    setModalMode("edit");
    setActiveId(item.id);
    setForm({
      academicYear: item.academicYear,
      startDate: item.startDate,
      endDate: item.endDate,
      status: item.status
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.academicYear || !form.startDate || !form.endDate) {
      toast.error("Please fill in all fields.");
      return;
    }

    try {
      // If setting this period to active, deactivate other active periods
      if (form.status === "active") {
        const otherActives = periods.filter(p => p.status === "active" && p.id !== activeId);
        await Promise.all(otherActives.map(p => periodService.update(p.id, { status: "inactive" })));
      }

      if (modalMode === "add") {
        await periodService.create(form);
        toast.success("Enrollment period created.");
      } else if (activeId) {
        await periodService.update(activeId, form);
        toast.success("Enrollment period updated.");
      }
      setModalOpen(false);
      loadPeriods();
    } catch {
      toast.error("Failed to save enrollment period.");
    }
  };

  const handleToggleStatus = async (item: EnrollmentPeriod) => {
    const nextStatus = item.status === "active" ? "inactive" : "active";
    try {
      // If setting this period active, turn off other active periods first
      if (nextStatus === "active") {
        const otherActives = periods.filter(p => p.status === "active" && p.id !== item.id);
        await Promise.all(otherActives.map(p => periodService.update(p.id, { status: "inactive" })));
      }

      await periodService.update(item.id, { status: nextStatus });
      toast.success(`Period academic year ${item.academicYear} marked ${nextStatus}.`);
      loadPeriods();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this enrollment period?")) {
      try {
        await periodService.delete(id);
        toast.success("Period deleted.");
        loadPeriods();
      } catch {
        toast.error("Failed to delete period.");
      }
    }
  };

  if (isLoading) {
    return <LoadingState rows={4} />;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary-navy" />
            Academic Intake Periods
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            Open, close, and configure active calendar dates for university registrations
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} className="h-10 text-xs">
          <Plus className="w-4 h-4 mr-1" />
          Add Enrollment Period
        </Button>
      </div>

      {/* Grid of Periods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {periods.map((item) => {
          const isActive = item.status === "active";
          return (
            <BentoCard 
              key={item.id} 
              className={`p-5 flex flex-col justify-between space-y-4 border ${
                isActive ? "border-primary-navy/40 bg-soft-blue/5" : "border-slate-200"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-academic-blue">
                    Academic Year {item.academicYear}
                  </span>
                  <button 
                    onClick={() => handleToggleStatus(item)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[10px] border cursor-pointer ${
                      isActive 
                        ? "bg-success-light text-success-green border-success-light" 
                        : "bg-gray-100 text-cool-gray border-gray-200"
                    }`}
                  >
                    {isActive ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                    {item.status.toUpperCase()}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-gray pt-1">
                  <div>
                    <span className="text-[10px] text-cool-gray block uppercase font-bold">Start Date</span>
                    <span className="font-semibold text-academic-blue flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cool-gray" />
                      {new Date(item.startDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-cool-gray block uppercase font-bold">End Date</span>
                    <span className="font-semibold text-academic-blue flex items-center gap-1 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cool-gray" />
                      {new Date(item.endDate).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <Button variant="secondary" onClick={() => handleOpenEdit(item)} className="flex-1 justify-center text-[10px] h-8 px-2">
                  <Edit className="w-3 h-3 mr-1" /> Edit Calendar
                </Button>
                <Button 
                  variant="secondary" 
                  onClick={() => handleDelete(item.id)}
                  disabled={isActive}
                  className="flex-1 justify-center text-[10px] h-8 px-2 border-red-100 text-error-red hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Delete
                </Button>
              </div>
            </BentoCard>
          );
        })}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-bento border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-academic-blue">
              <h3 className="text-md font-bold">
                {modalMode === "add" ? "Add Period" : "Edit Calendar dates"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-cool-gray hover:text-primary-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-gray mb-1 block">Academic Intake Year</label>
                <input 
                  type="text" 
                  value={form.academicYear} 
                  onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  placeholder="2026-2027"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-gray mb-1 block">Start Date</label>
                  <input 
                    type="date" 
                    value={form.startDate} 
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-gray mb-1 block">End Date</label>
                  <input 
                    type="date" 
                    value={form.endDate} 
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-gray mb-1 block">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as EnrollmentPeriod["status"] })}
                  className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-primary-navy"
                >
                  <option value="inactive">Inactive</option>
                  <option value="active">Active (Intake Open)</option>
                </select>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <Button type="submit" variant="primary" className="flex-1 justify-center h-10">
                  Save Intake
                </Button>
                <Button type="button" variant="secondary" className="flex-1 justify-center h-10" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
