"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Trash2,
  Info,
  Edit,
  FileText,
  Search,
  Plus,
  Lock,
} from "lucide-react";
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
import { showToast } from "@/hooks/useToast";
import PaginationBar from "../_components/Pagination";


export default function ApplicationPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State for creating a new application
  const [newApp, setNewApp] = useState({
    id: crypto.randomUUID(),
    title: "", // Corrected field name from 'name' to 'title'
    email: "",
    phone: "",
    created_at: new Date().toISOString(),
  });
  const [saving, setSaving] = useState(false);

  // State for handling delete confirmation
  const [pendingId, setPendingId] = useState(null);
  const confirmOpen = pendingId !== null;

  // State for pagination
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / limit);

  // State for viewing application details in a modal
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // State for editing an application
  const [isEditing, setIsEditing] = useState(false);
  const [editApp, setEditApp] = useState({
    id: "",
    title: "", // Corrected field name from 'name' to 'title'
    email: "",
    phone: "",
    created_at: "",
  });
  const [deleteRefresh, setDeleteRefresh] = useState(0);

  // State for role-based access control
  const [userRole, setUserRole] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);


  /**
   * Fetches the user's role from the session to determine access rights.
   */
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const { data: { session }, error } = await supabaseBrowser.auth.getSession();
        if (error) {
          console.error("Error fetching session:", error);
          setIsAuthLoading(false);
          return;
        }

        if (session) {
          const userUid = session.user?.id;
          if (userUid) {
            const { data: userData, error: userError } = await supabaseBrowser
              .from('users')
              .select('role')
              .eq('id', userUid)
              .single();

            if (userError) {
              console.error("Error fetching user role:", userError);
            } else if (userData) {
              setUserRole(userData.role);
            }
          }
        }
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUserRole();
  }, []);

  /**
   * Refreshes the data table by resetting the page and triggering a re-fetch.
   */
  const handleRefresh = useCallback(() => {
    setPage(1);
    setDeleteRefresh(Math.random());
  }, []);

  /**
   * Fetches the list of applications from the Supabase 'applications' table.
   */
  const handleFetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabaseBrowser
        .from("applications")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`
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
      setError("Failed to fetch application data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  // Effect hook to fetch data whenever page, limit, searchTerm, or a refresh is triggered.
  useEffect(() => {
    // Only fetch data if the user has the required roles
    if (userRole === "admin" || userRole === "superadmin") {
      const handler = setTimeout(() => {
        handleFetchApplications();
      }, 500);

      return () => {
        clearTimeout(handler);
      };
    } else {
      setLoading(false);
    }
  }, [page, deleteRefresh, limit, searchTerm, userRole, handleFetchApplications]);


  // Memoized filter logic for searching applications by name or email.
  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) {
      return applications;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return applications.filter(
      (application) =>
        application.title.toLowerCase().includes(lowercasedSearchTerm) ||
        application.email.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [applications, searchTerm]);

  // Loading state UI
  if (loading || isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we fetch the latest data for you.
        </p>
      </div>
    );
  }

  // Access denied UI
  if (userRole !== "admin" && userRole !== "superadmin") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center text-red-500">
        <Lock className="h-16 w-16 mb-4" />
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-lg">You do not have the necessary permissions to view this page.</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col items-center justify-center p-6 text-center text-red-500">
          <Info className="h-16 w-16 mb-4" />
          <h2 className="text-2xl font-bold">Error</h2>
          <p className="text-lg">{error}</p>
        </div>
      </div>
    );
  }

  /**
   * Confirms and performs the deletion of an application.
   */
  async function confirmDelete() {
    if (!pendingId) return;

    const id = pendingId;
    setPendingId(null);

    const { error } = await supabaseBrowser
      .from("applications")
      .delete()
      .eq("id", id);

    if (error) {
      showToast({
        title: "Error",
        description: "Something went wrong while deleting!",
      });
    } else {
      showToast({
        title: "Success",
        description: "Application deleted successfully!",
      });
      handleRefresh();
    }
  }

  const handleEditForm = (application) => {
    setEditApp(application);
    setIsEditing(true);
  };

  /**
   * Updates an existing application record in Supabase.
   */
  const handleUpdateApplication = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await supabaseBrowser
        .from("applications")
        .update({
          title: editApp?.title, // Corrected field name from 'name' to 'title'
          email: editApp?.email,
          phone: editApp?.phone,
        })
        .eq("id", editApp?.id)
        .select()
        .single();
      if (updateError) {
        throw new Error(updateError.message);
      }

      showToast({
        title: "Success",
        description: "Application updated successfully!",
      });
      handleRefresh();
      setIsEditing(false);
      setEditApp({
        id: "",
        title: "",
        email: "",
        phone: "",
        created_at: "",
      });
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

  // Main JSX rendering block
  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Search input field */}
        <div className="relative flex-1 mb-5 ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Name, Applicant Name, Date, Phone or Email..."
            className="pl-9"
            value={searchTerm}
            disabled={loading}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Floating action button to add a new application */}
        <div className=" bg-white">
          <button
            onClick={() => navigation.navigate("/dashboard/add-application-details")}
            className="fixed bottom-6 right-6 z-50 rounded-full p-4 bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            title="Add application"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {/* Conditional rendering for no data found */}
        {filteredApplications.length === 0 && !loading ? (
          <div className="flex flex-col justify-center items-center text-gray-900 p-6">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {searchTerm
                ? "No results found for your search."
                : "No Data Found"}
            </h2>
            {searchTerm && (
              <p className="text-sm text-gray-500">
                Try adjusting your search term or clearing it.
              </p>
            )}
          </div>
        ) : (
          /* Table to display application data */
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
                    Created
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
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="break-words px-6 py-4 text-sm font-medium text-gray-900">
                      {application.title}
                    </td>
                    <td className="px-6 py-4 break-words text-sm text-gray-900">
                      {application.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {application.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-4">
                        {/* Action buttons */}
                        <Trash2
                          className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer"
                          onClick={() => setPendingId(application.id)}
                        />
                        <button
                          disabled={loading}
                          onClick={() => handleEditForm(application)}
                          className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => {
                            setSelectedData(application);
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
            <div className="mt-auto">
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

        {/* Modal for creating a new application */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Create New Application
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newApp.title} // Corrected field name
                  onChange={(e) =>
                    setNewApp({ ...newApp, title: e.target.value }) // Corrected field name
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newApp.email}
                  onChange={(e) =>
                    setNewApp({ ...newApp, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={newApp.phone}
                  onChange={(e) =>
                    setNewApp({ ...newApp, phone: e.target.value })
                  }
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  const { error } = await supabaseBrowser
                    .from("applications")
                    .insert({
                      id: newApp.id,
                      title: newApp.title, // Corrected field name
                      email: newApp.email,
                      phone: newApp.phone,
                    });
                  if (error) {
                    showToast({
                      title: "Error",
                      description: "Something went wrong while saving!",
                    });
                  } else {
                    setDialogOpen(false);
                    setNewApp({
                      id: crypto.randomUUID(),
                      title: "", // Corrected field name
                      email: "",
                      phone: "",
                      created_at: new Date().toISOString(),
                    });
                    showToast({
                      title: "Success",
                      description: "Application added successfully!",
                    });
                    handleRefresh();
                  }
                  setSaving(false);
                }}
                className="bg-blue-500 text-white"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal for confirming deletion */}
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
                className="cursor-pointer bg-red-500 text-white"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Modal for viewing application details */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Card className="max-w-md w-full mx-auto shadow-md border mt-5 p-4 rounded-2xl bg-white">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Application Details
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700">
              <div className="font-medium">Name:</div>
              <div> {selectedData?.title}</div> {/* Corrected field name */}
              <div className="font-medium">Email:</div>
              <div>{selectedData?.email}</div>
              <div className="font-medium">Phone:</div>
              <div>{selectedData?.phone}</div>
              <div className="font-medium">Created:</div>
              <div>{new Date(selectedData?.created_at || "").toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      {/* Modal for editing an application */}
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
                value={editApp?.title} // Corrected field name
                onChange={(e) =>
                  setEditApp({ ...editApp, title: e.target.value }) // Corrected field name
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editApp?.email}
                onChange={(e) =>
                  setEditApp({ ...editApp, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={editApp?.phone}
                onChange={(e) =>
                  setEditApp({ ...editApp, phone: e.target.value })
                }
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditApp({
                  id: "",
                  title: "", // Corrected field name
                  email: "",
                  phone: "",
                  created_at: "",
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
    </>
  );
}
