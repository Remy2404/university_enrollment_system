"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  GraduationCap, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  BookOpen, 
  Building2, 
  Layers,
  X
} from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { LoadingState } from "../../components/ui/States";

import { facultyService, departmentService, majorService } from "@/src/services/program";
import { Faculty, Department, Major } from "@/src/types";

type ProgramTab = "faculties" | "departments" | "majors";

export default function AdminProgramsPage() {
  const [activeTab, setActiveTab] = useState<ProgramTab>("faculties");
  const [isLoading, setIsLoading] = useState(true);

  // Lists state
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [activeId, setActiveId] = useState<string | null>(null);

  // Form Fields State
  const [facultyForm, setFacultyForm] = useState({ name: "", code: "", description: "", status: "active" as "active" | "inactive" });
  const [departmentForm, setDepartmentForm] = useState({ facultyId: "", name: "", description: "", status: "active" as "active" | "inactive" });
  const [majorForm, setMajorForm] = useState({ departmentId: "", name: "", description: "", status: "active" as "active" | "inactive" });

  // Delete Confirm State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "faculty" | "department" | "major"; id: string } | null>(null);

  useEffect(() => {
    loadAllProgramData();
  }, []);

  async function loadAllProgramData() {
    setIsLoading(true);
    try {
      const [facs, depts, majs] = await Promise.all([
        facultyService.getAll(),
        departmentService.getAll(),
        majorService.getAll()
      ]);
      setFaculties(facs);
      setDepartments(depts);
      setMajors(majs);
    } catch {
      toast.error("Failed to load academic program data.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setModalMode("add");
    setActiveId(null);
    if (activeTab === "faculties") {
      setFacultyForm({ name: "", code: "", description: "", status: "active" });
    } else if (activeTab === "departments") {
      setDepartmentForm({ facultyId: faculties[0]?.id || "", name: "", description: "", status: "active" });
    } else {
      setMajorForm({ departmentId: departments[0]?.id || "", name: "", description: "", status: "active" });
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (item: Faculty | Department | Major) => {
    setModalMode("edit");
    setActiveId(item.id);
    if (activeTab === "faculties") {
      const faculty = item as Faculty;
      setFacultyForm({ name: faculty.name, code: faculty.code, description: faculty.description, status: faculty.status });
    } else if (activeTab === "departments") {
      const department = item as Department;
      setDepartmentForm({ facultyId: department.facultyId, name: department.name, description: department.description, status: department.status });
    } else {
      const major = item as Major;
      setMajorForm({ departmentId: major.departmentId, name: major.name, description: major.description, status: major.status });
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === "faculties") {
        if (!facultyForm.name || !facultyForm.code) {
          toast.error("Please fill in Name and Code.");
          return;
        }
        if (modalMode === "add") {
          await facultyService.create(facultyForm);
          toast.success("Faculty created.");
        } else if (activeId) {
          await facultyService.update(activeId, facultyForm);
          toast.success("Faculty updated.");
        }
      } else if (activeTab === "departments") {
        if (!departmentForm.name || !departmentForm.facultyId) {
          toast.error("Please fill in Name and Select parent Faculty.");
          return;
        }
        if (modalMode === "add") {
          await departmentService.create(departmentForm);
          toast.success("Department created.");
        } else if (activeId) {
          await departmentService.update(activeId, departmentForm);
          toast.success("Department updated.");
        }
      } else {
        if (!majorForm.name || !majorForm.departmentId) {
          toast.error("Please fill in Name and Select parent Department.");
          return;
        }
        if (modalMode === "add") {
          await majorService.create(majorForm);
          toast.success("Major created.");
        } else if (activeId) {
          await majorService.update(activeId, majorForm);
          toast.success("Major updated.");
        }
      }
      setModalOpen(false);
      loadAllProgramData();
    } catch {
      toast.error("Failed to save changes.");
    }
  };

  const handleToggleStatus = async (type: "faculty" | "department" | "major", item: { id: string; status: "active" | "inactive" }) => {
    const nextStatus = item.status === "active" ? "inactive" : "active";
    try {
      if (type === "faculty") {
        await facultyService.update(item.id, { status: nextStatus });
        toast.success(`Faculty marked ${nextStatus}.`);
      } else if (type === "department") {
        await departmentService.update(item.id, { status: nextStatus });
        toast.success(`Department marked ${nextStatus}.`);
      } else {
        await majorService.update(item.id, { status: nextStatus });
        toast.success(`Major marked ${nextStatus}.`);
      }
      loadAllProgramData();
    } catch {
      toast.error("Status update failed.");
    }
  };

  const handleDeleteTrigger = (type: "faculty" | "department" | "major", id: string) => {
    setDeleteTarget({ type, id });
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "faculty") {
        await facultyService.delete(deleteTarget.id);
        toast.success("Faculty deleted.");
      } else if (deleteTarget.type === "department") {
        await departmentService.delete(deleteTarget.id);
        toast.success("Department deleted.");
      } else {
        await majorService.delete(deleteTarget.id);
        toast.success("Major deleted.");
      }
      setDeleteConfirmOpen(false);
      setDeleteTarget(null);
      loadAllProgramData();
    } catch {
      toast.error("Failed to delete resource.");
    }
  };

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary-navy" />
            Academic Program Manager
          </h1>
          <p className="text-sm text-slate-gray mt-1">
            Setup Faculties, Departments, and Majors linked to student application choices
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenAdd} className="h-10 text-xs">
          <Plus className="w-4 h-4 mr-1" />
          Add New {activeTab === "faculties" ? "Faculty" : activeTab === "departments" ? "Department" : "Major"}
        </Button>
      </div>

      {/* Tabs list */}
      <div className="flex border-b border-[#E2E8F0] space-x-2">
        {([
          { id: "faculties", label: "Faculties", icon: Building2 },
          { id: "departments", label: "Departments", icon: Layers },
          { id: "majors", label: "Majors", icon: BookOpen },
        ] satisfies { id: ProgramTab; label: string; icon: typeof Building2 }[]).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
                active 
                  ? "border-primary-navy text-primary-navy bg-white" 
                  : "border-transparent text-slate-gray hover:text-primary-navy hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content Panels */}
      <BentoCard className="p-0 overflow-hidden">
        
        {/* Panel 1: Faculties Table */}
        {activeTab === "faculties" && (
          <table className="w-full text-left border-collapse text-xs text-academic-blue">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-cool-gray font-bold">
                <th className="py-4 px-6">Faculty Code</th>
                <th className="py-4 px-6">Faculty Name</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {faculties.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="py-4 px-6 font-mono font-bold text-primary-navy">{item.code}</td>
                  <td className="py-4 px-6 font-bold">{item.name}</td>
                  <td className="py-4 px-6 text-slate-gray truncate max-w-[200px]">{item.description}</td>
                  <td className="py-4 px-6">
                    <button 
                      onClick={() => handleToggleStatus("faculty", item)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[10px] cursor-pointer ${
                        item.status === "active" 
                          ? "bg-success-light text-success-green border-success-light" 
                          : "bg-gray-100 text-cool-gray border-gray-200"
                      }`}
                    >
                      {item.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {item.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <Button variant="secondary" className="h-7 px-2 text-[10px]" onClick={() => handleOpenEdit(item)}>
                      <Edit className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="secondary" className="h-7 px-2 text-[10px] border-red-100 text-error-red hover:bg-red-50" onClick={() => handleDeleteTrigger("faculty", item.id)}>
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Panel 2: Departments Table */}
        {activeTab === "departments" && (
          <table className="w-full text-left border-collapse text-xs text-academic-blue">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-cool-gray font-bold">
                <th className="py-4 px-6">Department Name</th>
                <th className="py-4 px-6">Parent Faculty</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {departments.map((item) => {
                const facName = faculties.find(f => f.id === item.facultyId)?.name || "Unknown Faculty";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold">{item.name}</td>
                    <td className="py-4 px-6 font-semibold text-primary-navy truncate max-w-[150px]">{facName}</td>
                    <td className="py-4 px-6 text-slate-gray truncate max-w-[200px]">{item.description}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleToggleStatus("department", item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[10px] cursor-pointer ${
                          item.status === "active" 
                            ? "bg-success-light text-success-green border-success-light" 
                            : "bg-gray-100 text-cool-gray border-gray-200"
                        }`}
                      >
                        {item.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Button variant="secondary" className="h-7 px-2 text-[10px]" onClick={() => handleOpenEdit(item)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="secondary" className="h-7 px-2 text-[10px] border-red-100 text-error-red hover:bg-red-50" onClick={() => handleDeleteTrigger("department", item.id)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Panel 3: Majors Table */}
        {activeTab === "majors" && (
          <table className="w-full text-left border-collapse text-xs text-academic-blue">
            <thead>
              <tr className="bg-slate-50 border-b border-[#E2E8F0] text-cool-gray font-bold">
                <th className="py-4 px-6">Major Name</th>
                <th className="py-4 px-6">Parent Department</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {majors.map((item) => {
                const deptName = departments.find(d => d.id === item.departmentId)?.name || "Unknown Department";
                return (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6 font-bold">{item.name}</td>
                    <td className="py-4 px-6 font-semibold text-primary-navy truncate max-w-[150px]">{deptName}</td>
                    <td className="py-4 px-6 text-slate-gray truncate max-w-[200px]">{item.description}</td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handleToggleStatus("major", item)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold border text-[10px] cursor-pointer ${
                          item.status === "active" 
                            ? "bg-success-light text-success-green border-success-light" 
                            : "bg-gray-100 text-cool-gray border-gray-200"
                        }`}
                      >
                        {item.status === "active" ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        {item.status.toUpperCase()}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Button variant="secondary" className="h-7 px-2 text-[10px]" onClick={() => handleOpenEdit(item)}>
                        <Edit className="w-3 h-3 mr-1" /> Edit
                      </Button>
                      <Button variant="secondary" className="h-7 px-2 text-[10px] border-red-100 text-error-red hover:bg-red-50" onClick={() => handleDeleteTrigger("major", item.id)}>
                        <Trash2 className="w-3 h-3 mr-1" /> Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

      </BentoCard>

      {/* CRUD Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-bento border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Title */}
            <div className="flex justify-between items-center border-b border-[#E2E8F0] pb-3 text-academic-blue">
              <h3 className="text-md font-bold">
                {modalMode === "add" ? "Create New" : "Edit Details"} — {
                  activeTab === "faculties" ? "Faculty" : activeTab === "departments" ? "Department" : "Major"
                }
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-cool-gray hover:text-primary-navy">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-4 text-xs">
              
              {/* Faculty Fields */}
              {activeTab === "faculties" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="font-bold text-slate-gray mb-1 block">Faculty Code</label>
                      <input 
                        type="text" 
                        value={facultyForm.code} 
                        onChange={(e) => setFacultyForm({ ...facultyForm, code: e.target.value })}
                        className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy uppercase"
                        placeholder="ENG"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="font-bold text-slate-gray mb-1 block">Faculty Name</label>
                      <input 
                        type="text" 
                        value={facultyForm.name} 
                        onChange={(e) => setFacultyForm({ ...facultyForm, name: e.target.value })}
                        className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                        placeholder="Faculty of Engineering"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Description</label>
                    <textarea 
                      value={facultyForm.description} 
                      onChange={(e) => setFacultyForm({ ...facultyForm, description: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Department Fields */}
              {activeTab === "departments" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Select Parent Faculty</label>
                    <select
                      value={departmentForm.facultyId}
                      onChange={(e) => setDepartmentForm({ ...departmentForm, facultyId: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-primary-navy"
                    >
                      {faculties.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Department Name</label>
                    <input 
                      type="text" 
                      value={departmentForm.name} 
                      onChange={(e) => setDepartmentForm({ ...departmentForm, name: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                      placeholder="Department of Computer Science"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Description</label>
                    <textarea 
                      value={departmentForm.description} 
                      onChange={(e) => setDepartmentForm({ ...departmentForm, description: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Major Fields */}
              {activeTab === "majors" && (
                <div className="space-y-3">
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Select Parent Department</label>
                    <select
                      value={majorForm.departmentId}
                      onChange={(e) => setMajorForm({ ...majorForm, departmentId: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm bg-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-primary-navy"
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Major Name</label>
                    <input 
                      type="text" 
                      value={majorForm.name} 
                      onChange={(e) => setMajorForm({ ...majorForm, name: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                      placeholder="Software Engineering"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-gray mb-1 block">Description</label>
                    <textarea 
                      value={majorForm.description} 
                      onChange={(e) => setMajorForm({ ...majorForm, description: e.target.value })}
                      className="w-full p-2.5 border border-[#E2E8F0] rounded-bento-sm focus:outline-none focus:ring-1 focus:ring-primary-navy"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <Button type="submit" variant="primary" className="flex-1 justify-center h-10">
                  Save Changes
                </Button>
                <Button type="button" variant="secondary" className="flex-1 justify-center h-10" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-bento border border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150 text-xs">
            <h3 className="text-sm font-bold text-error-red flex items-center gap-1.5">
              <Trash2 className="w-5 h-5" />
              Confirm Permanent Deletion
            </h3>
            <p className="text-slate-gray leading-relaxed">
              Are you sure you want to permanently delete this {deleteTarget.type}? All mapped mappings below this node will fail reference checks.
            </p>
            <div className="flex gap-3 pt-2">
              <Button variant="primary" className="flex-1 bg-error-red hover:bg-error-red/90 border-none justify-center" onClick={handleDeleteConfirm}>
                Yes, Delete
              </Button>
              <Button variant="secondary" className="flex-1 justify-center" onClick={() => setDeleteConfirmOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
