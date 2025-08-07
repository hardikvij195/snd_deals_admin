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

// The AddApplicataion import is no longer needed here.

// Import PhoneInput as it will be used for contact details
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

export default function ApplicationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [saving, setSaving] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  const confirmOpen = pendingId !== null;
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const totalPages = Math.ceil(total / limit);

  const [isEditing, setIsEditing] = useState(false);
  const [editApplication, setEditApplication] = useState({
    id: "",
    title: "",
    email: "",
    phone: "",
    notes: "",
    user_id: null,
    created_at: "",
    updated_at: "",
  });
  const [deleteRefresh, setDeleteRefresh] = useState(null);

  const handleRefresh = () => {
    setPage(1);
    setDeleteRefresh(Math.random());
  };

  const handleFetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabaseBrowser
        .from("applications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
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

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFetchApplications();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, page, limit, deleteRefresh, handleFetchApplications]);

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

  if (loading && applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Loading Applications...</h2>
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

  async function confirmDelete() {
    if (!pendingId) return;

    const id = pendingId;
    setPendingId(null);
    setApplications((prev) => prev.filter((s) => s.id !== id));

    const { error } = await supabaseBrowser
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      showToast({
        title: "Error",
        description: "Something went wrong while deleting!",
      });
      handleRefresh();
    } else {
      showToast({
        title: "Success",
        description: "Application deleted successfully!",
      });
      handleRefresh();
    }
  }

  const handleEditForm = (application) => {
    setEditApplication(application);
    setIsEditing(true);
  };

  const handleExportFile = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch data for export!");
      }
      await exportToExcel(data, "applications");
      showToast({
        title: "Success",
        description: "Application data exported successfully!",
      });
    } catch (error) {
      console.error("Export error:", error);
      showToast({
        type: "error",
        title: "Error",
        description: error?.message || "Something went wrong during export!",
      });
    }
  };

  const handleUpdateApplication = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await supabaseBrowser
        .from("applications")
        .update({
          title: editApplication.title,
          email: editApplication.email,
          phone: editApplication.phone,
          notes: editApplication.notes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editApplication.id);

      if (updateError) {
        throw new Error(updateError.message);
      }

      setEditApplication({
        id: "",
        title: "",
        email: "",
        phone: "",
        notes: "",
        user_id: null,
        created_at: "",
        updated_at: "",
      });
      setIsEditing(false);
      showToast({
        title: "Success",
        description: "Application updated successfully!",
      });
      setPage(1);
      if (page === 1) {
        handleFetchApplications();
      }
    } catch (error) {
      showToast({
        type: "error",
        title: "Error",
        description: error?.message || "Something went wrong!",
      });
    } finally {
      setSaving(false);
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

          {/* This button now navigates to the new page */}
          <button
            onClick={() => router.push('/dashboard/add-application-details')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors duration-200 w-full sm:w-auto justify-center"
            title="Add New Application"
          >
            <Plus className="h-5 w-5" />
            <span>Add Application</span>
          </button>
        </div>

        {filteredApplications.length === 0 && !loading && !error ? (
          <div className="flex flex-col justify-center items-center text-gray-900 p-6 border rounded-lg bg-gray-50 mt-8">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              No Applications Found
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              It looks like there are no applications matching your
              criteria. Click "Add Application" to get started or clear your
              search.
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
                        <Trash2
                          className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer"
                          onClick={() => setPendingId(app.id)}
                        />
                        <button
                          disabled={loading}
                          onClick={() => {
                            handleEditForm(app);
                          }}
                          className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => {
                            setSelectedData(app);
                            setIsOpen(true);
                          }}
                          className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Info className="w-4 h-4" />
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

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={confirmOpen}
          onOpenChange={(o) => !o && setPendingId(null)}
        >
          <DialogContent className="sm:max-w-sm bg-white">
            <DialogHeader>
              <DialogTitle>Delete Application?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-600">
              This action can’t be undone. The application entry will be permanently
              removed.
            </p>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => setPendingId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                className="cursor-pointer bg-red-500"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Details Modal */}
        <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <Card className="max-w-md w-full mx-auto shadow-md border mt-5 p-4 rounded-2xl bg-white">
            <CardContent className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Application Details
              </h2>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700">
                <div className="font-medium">Name:</div>
                <div> {selectedData?.title}</div>

                <div className="font-medium">Email:</div>
                <div> {selectedData?.email || "N/A"}</div>

                <div className="font-medium">Phone:</div>
                <div> {selectedData?.phone || "N/A"}</div>

                <div className="font-medium col-span-2">Notes:</div>
                <div className="col-span-2 break-words">{selectedData?.notes || "N/A"}</div>
              </div>
            </CardContent>
          </Card>
        </Modal>

        {/* Edit Application Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Edit Application
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editApplication.title}
                  onChange={(e) =>
                    setEditApplication({ ...editApplication, title: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={editApplication.email}
                  onChange={(e) =>
                    setEditApplication({ ...editApplication, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <PhoneInput
                  country="ca"
                  value={editApplication.phone}
                  onChange={(val) => {
                    const finalVal = val.startsWith("+") ? val : `+${val}`;
                    setEditApplication({
                      ...editApplication,
                      phone: finalVal,
                    });
                  }}
                  inputClass="!w-full !h-11 !text-sm !border !border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
                  buttonClass="!border-gray-300"
                  enableSearch
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                  value={editApplication.notes}
                  onChange={(e) =>
                    setEditApplication({ ...editApplication, notes: e.target.value })
                  }
                ></textarea>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditApplication({
                    id: "",
                    title: "",
                    email: "",
                    phone: "",
                    notes: "",
                    user_id: null,
                    created_at: "",
                    updated_at: "",
                  });
                }}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={handleUpdateApplication}
                className="bg-blue-500 text-white"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}