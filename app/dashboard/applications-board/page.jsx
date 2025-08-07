// app/dashboard/applications/page.jsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Calendar,
  Trash2,
  Info,
  Edit,
  FileText,
  Search,
  Plus,
} from "lucide-react";
import ComingSoon from "@/components/ui/coming-soon";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Modal from "../_components/Modal";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { showToast } from "@/hooks/useToast";
import { exportToExcel } from "@/lib/exportToExcel";
import PaginationBar from "../_components/Pagination";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

export default function ApplicationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // States for button UI and functionality
  const [assigningId, setAssigningId] = useState(null);
  const [assignedApps, setAssignedApps] = useState(new Set());

  // State for new application form - simplified fields
  const [newApplication, setNewApplication] = useState({
    id: crypto.randomUUID(), // This will be overwritten by Supabase's auto-generation
    title: "", // e.g., "John Doe's Application"
    email: "",
    phone: "",
    notes: "",
    user_id: null, // Will be set by handleAddNewApplication
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const confirmOpen = pendingId !== null;
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false); // For view details modal
  const [selectedData, setSelectedData] = useState(null); // Data for view details modal
  const totalPages = Math.ceil(total / limit);

  const [isEditing, setIsEditing] = useState(false);
  // State for editing application form - simplified fields
  const [editApplication, setEditApplication] = useState({
    id: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
    user_id: null, // Stored but not updated
    created_at: "",
    updated_at: "",
  });
  const [deleteRefresh, setDeleteRefresh] = useState(null); // To trigger data refresh after delete

  // Function to refresh data, typically after an action
  const handleRefresh = () => {
    setPage(1); // Reset to first page on refresh
    setDeleteRefresh(Math.random()); // Trigger useEffect
  };

  // Function to fetch applications from Supabase
  const handleFetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabaseBrowser
        .from("applications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false }); // Order by creation date

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%` // Search by relevant application fields
        );
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase fetch error:", error);
        setError(error.message);
      } else {
        setApplications(data || []);
        setTotal(count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch application data:", error);
      setError(error.message || "Failed to fetch application data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  // Effect to fetch data on initial load and when dependencies change
  useEffect(() => {
    const handler = setTimeout(() => {
      handleFetchApplications();
    }, 500); // Debounce search term

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, page, limit, deleteRefresh, handleFetchApplications]);

  // Filter applications based on search term (client-side, if needed for complex filtering)
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return applications.filter(
      (app) =>
        app.title.toLowerCase().includes(lowercasedSearchTerm) ||
        app.email.toLowerCase().includes(lowercasedSearchTerm) ||
        app.phone.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [applications, searchTerm]);

  // Loading and Error states for initial render
  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">
          Loading Applications...
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we fetch the latest application data for you.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <ComingSoon />
      </div>
    );
  }

  // --- UPDATED `handleAssignToMe` FUNCTION ---
  const handleAssignToMe = async (application) => {
    if (assigningId || application.assigned_to) {
      return;
    }

    setAssigningId(application.id);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabaseBrowser.auth.getUser();

      if (userError || !user) {
        showToast({
          type: "error",
          title: "Authentication Error",
          description: "Please sign in to assign applications.",
        });
        setAssigningId(null);
        return;
      }

      const { error: updateError } = await supabaseBrowser
        .from("applications")
        .update({
          assigned_to: user.id,
          assigned_date: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assigned_status: "Assigned", // <-- This is the new line
        })
        .eq("id", application.id);

      if (updateError) {
        console.error("Error assigning application:", updateError);
        showToast({
          type: "error",
          title: "Assignment Failed",
          description: updateError.message || "Could not assign application.",
        });
        setAssigningId(null);
      } else {
        showToast({
          title: "Success",
          description: `Application "${application.title}" assigned to you!`,
        });

        setAssigningId(null);
        handleRefresh();
      }
    } catch (error) {
      console.error("Unexpected error during assignment:", error);
      showToast({
        type: "error",
        title: "Error",
        description:
          error.message || "An unexpected error occurred during assignment.",
      });
      setAssigningId(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white p-4 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative lg:w-[80%] md:w-[80%] w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Name, Email, or Phone..."
              className="pl-9 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              disabled={loading && applications.length === 0}
            />
          </form>
        </div>

        {filteredApplications.length === 0 && !loading && !error ? (
          <div className="flex flex-col justify-center items-center text-gray-900 p-6 border rounded-lg bg-gray-50 mt-8">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              No Applications Found
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              It looks like there are no applications matching your criteria.
              Click "Add Application" to get started or clear your search.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow-md lg:w-full md:w-full w-[320px]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Phone
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Created At
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="break-words px-6 py-4 text-sm font-medium text-gray-900">
                      {app?.title}
                    </td>
                    <td className="px-6 py-4 break-words text-sm text-gray-900">
                      {app?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {app?.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1 text-blue-500" />
                        {new Date(app?.created_at || "").toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-4 ">
                        <button
                          className={`p-2 rounded-md shadow-md text-white ${
                            app.assigned_to || assigningId === app.id
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-500 hover:bg-blue-600"
                          }`}
                          onClick={() => handleAssignToMe(app)}
                          disabled={app.assigned_to || assigningId === app.id}
                        >
                          {assigningId === app.id
                            ? "Assigning..."
                            : app.assigned_to
                            ? "Assigned"
                            : "Assign To Me"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-auto p-4">
              <PaginationBar
                page={page}
                setPage={setPage}
                totalPage={totalPages}
                totalRecord={total}
                limit={limit}
                setLimit={setLimit}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}