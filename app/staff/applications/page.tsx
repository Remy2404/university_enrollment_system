"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ClipboardList, 
  Search, 
  Filter, 
  Eye, 
  CheckSquare, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw 
} from "lucide-react";

import { BentoCard } from "../../components/ui/BentoCard";
import { Button } from "../../components/ui/Button";
import { StatusBadge, EnrollmentStatus } from "../../components/ui/StatusBadge";
import { LoadingState } from "../../components/ui/States";

import { applicationService } from "@/src/services/application";
import { facultyService } from "@/src/services/program";
import { Application, Faculty } from "@/src/types";
import { PaginatedResponse } from "@/src/lib/api-client";

export default function StaffApplicationsPage() {
  const router = useRouter();
  
  // Data lists
  const [applications, setApplications] = useState<Application[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  
  // Filtering & Pagination State
  const [search, setSearch] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(5); // 5 items per page

  const [isLoading, setIsLoading] = useState(true);

  // Load faculties on mount
  useEffect(() => {
    const loadFaculties = async () => {
      try {
        const facs = await facultyService.getAll();
        setFaculties(facs);
      } catch (e) {
        toast.error("Failed to load program faculties.");
      }
    };
    loadFaculties();
  }, []);

  // Fetch applications on query changes
  useEffect(() => {
    fetchApplicationsList();
  }, [currentPage, selectedFaculty, selectedStatus]);

  const fetchApplicationsList = async () => {
    setIsLoading(true);
    try {
      // Build filter payload
      const filters: Record<string, any> = {};
      
      if (selectedFaculty) {
        filters["programSelection.facultyId"] = selectedFaculty;
      }
      if (selectedStatus) {
        filters["status"] = selectedStatus;
      }
      if (search.trim()) {
        filters["personalInfo.fullName"] = { operator: "contains", value: search.trim() };
      }

      // JSON Server v1 pagination response shape
      const response = await applicationService.getAll({
        page: currentPage,
        limit,
        filters,
        sort: "-updatedAt"
      }) as any as PaginatedResponse<Application>;

      // Handle both paginated and non-paginated fallbacks
      if (response && response.data) {
        setApplications(response.data);
        setTotalPages(response.pages || 1);
        setTotalItems(response.items || response.data.length);
      } else if (Array.isArray(response)) {
        // Fallback for non-paginated API returns
        setApplications(response);
        setTotalPages(1);
        setTotalItems(response.length);
      }
    } catch (e) {
      toast.error("Failed to load applications list.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchApplicationsList();
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedFaculty("");
    setSelectedStatus("");
    setCurrentPage(1);
    // Timeout/Callback to wait state reset if immediate trigger isn't desired
    setTimeout(() => {
      fetchApplicationsList();
    }, 50);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-academic-blue flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary-navy" />
          Enrollment Applications Queue
        </h1>
        <p className="text-sm text-slate-gray mt-1">
          Search, filter, and review student application details and document uploads
        </p>
      </div>

      {/* Filter and Search Panel */}
      <BentoCard className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-cool-gray absolute left-3 top-3.5" />
            <input
              type="text"
              placeholder="Search by student name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-bento-sm h-11 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-navy"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cool-gray shrink-0" />
            <select
              value={selectedFaculty}
              onChange={(e) => {
                setSelectedFaculty(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-bento-sm h-11 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-navy"
            >
              <option value="">All Faculties</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-bento-sm h-11 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary-navy"
            >
              <option value="">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="pending_review">Pending Review</option>
              <option value="need_correction">Need Correction</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" variant="primary" className="flex-1 justify-center h-11 text-xs">
              Apply Filters
            </Button>
            <Button 
              type="button" 
              variant="secondary" 
              onClick={handleResetFilters}
              className="h-11 px-3"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </BentoCard>

      {/* Applications Data Table */}
      <BentoCard className="overflow-hidden p-0">
        {isLoading ? (
          <div className="p-8">
            <LoadingState rows={5} />
          </div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-gray space-y-2">
            <ClipboardList className="w-12 h-12 text-cool-gray mx-auto" />
            <h4 className="font-bold text-academic-blue">No Applications Found</h4>
            <p className="text-xs">No records match your selected search and filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-[#E2E8F0] text-xs font-bold text-cool-gray">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Target Faculty</th>
                  <th className="py-4 px-6">Shift</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Last Updated</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-academic-blue divide-y divide-[#E2E8F0]">
                {applications.map((app) => {
                  const facName = faculties.find(f => f.id === app.programSelection?.facultyId)?.name || "Not Selected";
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-primary-navy">
                        {app.id}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        {app.personalInfo.fullName || "Draft Applicant"}
                      </td>
                      <td className="py-4 px-6 truncate max-w-[180px]">
                        {facName}
                      </td>
                      <td className="py-4 px-6 capitalize">
                        {app.programSelection?.shift || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={app.status as EnrollmentStatus} />
                      </td>
                      <td className="py-4 px-6 text-cool-gray">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right space-x-2 shrink-0">
                        <Button 
                          variant="secondary" 
                          onClick={() => router.push(`/staff/review/${app.id}`)}
                          className="h-8 px-2 text-xs"
                          title="Review Details"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Review
                        </Button>
                        <Button 
                          variant="secondary" 
                          onClick={() => router.push(`/staff/verify/${app.id}`)}
                          className="h-8 px-2 text-xs border-emerald-200 text-success-green hover:bg-emerald-50"
                          title="Verify Documents"
                        >
                          <CheckSquare className="w-3.5 h-3.5 mr-1" />
                          Verify Docs
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {applications.length > 0 && (
          <div className="flex items-center justify-between border-t border-[#E2E8F0] px-6 py-4 bg-slate-50 text-xs">
            <span className="text-cool-gray">
              Showing page <strong className="text-academic-blue">{currentPage}</strong> of <strong className="text-academic-blue">{totalPages}</strong> ({totalItems} total items)
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 w-8 p-0 justify-center text-xs"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="h-8 w-8 p-0 justify-center text-xs"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </BentoCard>
    </div>
  );
}
