// app/dashboard/seminar/page.jsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Info,
  Edit,
  View,
  FileText,
  Download,
  Archive,
  Search,
} from "lucide-react";
import ComingSoon from "@/components/ui/coming-soon";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Plus, X } from "lucide-react";
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
import DeleteModal from "../_components/DeleteModal";
import moment from "moment-timezone";
import ArchiveModal from "../_components/ArchivedConfirmationModal";
import { convert12HourTo24Hour } from "@/lib/dateTimeFormatter";
import { Eye, EyeOff } from "lucide-react";
const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });



export default function AdminPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newSem, setNewSem] = useState({
    id: crypto.randomUUID(),
    email: "",
    display_name: "",
    provider: "",
    provider_type: "",
    phone: "",
    created_at: "",
    subscription: "",
    status: "",
    full_name: "",
    city: "",
    state: "",
    zipCode: "",
    updated_at: "",
    role: "", // Initialize role for new admin
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [Isdelete, setDelete] = useState(false);
  const [pendingId, setPendingId] = useState(null);
  // NEW STATE: To store the full user object for deletion confirmation
  const [userToDelete, setUserToDelete] = useState(null);
  const confirmOpen = pendingId !== null;
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const totalPages = Math.ceil(total / limit);
   const [showPassword, setShowPassword] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editSem, setEditSem] = useState({
    id: "",
    email: "",
    display_name: "",
    provider: "",
    provider_type: "",
    phone: "",
    created_at: "",
    subscription: "",
    status: "",
    full_name: "",
    city: "",
    state: "",
    zipCode: "",
    updated_at: "",
    role: "",
  });
  const [deleteRefresh, setDeleteRefresh] = useState(null);

  const handleRefresh = () => {
    setPage(1);
    setDeleteRefresh(Math.random());
  };

  const handleFetchuser = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabaseBrowser
        .from("users")
        .select("*", { count: "exact" })
        .in("role", ["admin", "superadmin", "salesrep", "financerep"]);

      if (searchTerm) {
        query = query.or(
          `email.ilike.%${searchTerm}%,display_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        );
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.order("created_at", { ascending: true }).range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Supabase fetch error:", error);
        setError(error.message);
      } else {
        setAdmins(data);
        setTotal(count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch User data:", error);
      setError(error.message || "Failed to fetch User data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFetchuser();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, page, limit, deleteRefresh, handleFetchuser]);

  if (loading && admins.length === 0) {
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
    
    // We already have userToDelete state set from when setPendingId was called
    setPendingId(null); // closes dialog immediately
    setAdmins((prev) => prev.filter((s) => s.id !== id)); // optimistic UI


    setDelete(true);
    const response = await fetch(
      "https://yfcsinhfuscuczsdfpcb.supabase.co/functions/v1/delete-user",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: id,
         
        }),
      }

    );


    const result = await response.json();


    if (!response.ok) {
      console.error("Failed to delete user via function:", result);
      showToast({
        type: "error",
        title: "Error",
        description: result?.message || "Something went wrong during deletion!",
      });
      setAdmins((prev) => {
        const adminToRestore = admins.find((s) => s.id === id);
        return adminToRestore
          ? [...prev, adminToRestore].sort(
              (a, b) =>
                new Date(a.created_at || "").getTime() -
                new Date(b.created_at || "").getTime()
            )
          : prev;
      });
    } else {
      console.log("User deleted successfully:", result);
      showToast({
        title: "Success",
        description: "Admin Deleted!",
      });
      handleRefresh();
    }
    setDelete(false);
    setUserToDelete(null); // Clear the user to delete state after action
  }

  const hadleUpdateAdmin = async () => {
    setSaving(true);
    try {
      const { error: updateError } = await supabaseBrowser
        .from("users")
        .update({
          display_name: editSem?.display_name,
          full_name: editSem?.display_name,
          phone: editSem?.phone,
          role: editSem.role, // Update role during edit
        })
        .eq("id", editSem?.id);

      if (updateError) {
        throw new Error(updateError?.message);
      }

      setEditSem({
        id: "",
        email: "",
        display_name: "",
        provider: "",
        provider_type: "",
        phone: "",
        created_at: "",
        subscription: "",
        status: "",
        full_name: "",
        city: "",
        state: "",
        zipCode: "",
        updated_at: "",
        role: "",
      });
      setIsEditing(false);
      showToast({
        title: "Success",
        description: "Admin Updated!",
      });
      setPage(1);
      if (page == 1) {
        handleFetchuser();
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

  const handleEditForm = (user) => {
    setEditSem(user);
    setIsEditing(true);
  };

  const handleExportFile = async () => {
    try {
      const { data, error } = await supabaseBrowser
        .from("users")
        .select("*")
        .in("role", ["admin", "superadmin"]) 
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Failed to fetch data for export!");
      }
      await exportToExcel(data, "admin_users");
      showToast({
        title: "Success",
        description: "Data exported successfully!",
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

  const hadleAddNewAdmin = async () => {
  setSaving(true);
  try {
    if (
      !newSem.email ||
      !newSem.display_name ||
      !newSem.phone ||
      !newSem.password ||
      !newSem.role
    ) {
      throw new Error(
        "All fields (Email, Name, Role, Phone, Password) are required!"
      );
    }

    const { data, error: signUpError } = await supabaseBrowser.auth.signUp({
      email: newSem.email,
      password: newSem.password,
      options: {
        data: {
          full_name: newSem.display_name,
          phone: newSem.phone,
          role: newSem.role,
        },
        emailRedirectTo: `https://drivexfirm.ca/callback`,
      },
    });

    if (signUpError) {
      throw new Error(signUpError.message);
    }

    const userId = data?.user?.id;
    if (!userId) throw new Error("User creation succeeded but no user ID returned.");

    // ✅ Insert into the 'users' table
    const { error: insertError } = await supabaseBrowser
      .from("users")
      .insert([
        {
          id: userId, // or uid if your table uses 'uid'
          email: newSem.email,
          display_name: newSem.display_name,
          full_name: newSem.display_name,
          phone: newSem.phone,
          role: newSem.role,
          // add other fields if necessary
        },
      ]);

    if (insertError) {
      throw new Error("Failed to insert into users table: " + insertError.message);
    }

    setNewSem({
      id: crypto.randomUUID(),
      email: "",
      display_name: "",
      provider: "",
      provider_type: "",
      phone: "",
      created_at: "",
      subscription: "",
      status: "",
      full_name: "",
      city: "",
      state: "",
      zipCode: "",
      updated_at: "",
      role: "",
      password: "",
    });

    setDialogOpen(false);
    showToast({
      title: "Success",
      description: `${formatRole(newSem.role)} created successfully!`,
    });

    setPage(1);
    handleFetchuser();
  } catch (error) {
    console.error("Add new admin error:", error);
    showToast({
      type: "error",
      title: "Error",
      description: error?.message || "Something went wrong while creating admin!",
    });
  } finally {
    setSaving(false);
  }
};


  // Helper function to format role for display
  const formatRole = (role) => {
    if (!role) return "";
    if (role === "superadmin") return "Super Admin";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <>
      <div className="min-h-screen bg-white">

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          {/* Search Input */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative lg:w-[80%] md:w-[80%]  w-full"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Name, Email, or Phone..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-md w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              disabled={loading && admins.length === 0}
            />
          </form>

          {/* Add New Admin Button */}
          <button
            onClick={() => {
              setNewSem({ // Reset form when opening dialog
                id: crypto.randomUUID(),
                email: "",
                display_name: "",
                provider: "",
                provider_type: "",
                phone: "",
                created_at: "",
                subscription: "",
                status: "",
                full_name: "",
                city: "",
                state: "",
                zipCode: "",
                updated_at: "",
                role: "", // Reset role
                password: "",
              });
              setDialogOpen(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors duration-200 w-full sm:w-auto justify-center"
            title="Add New Admin"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Admin</span>
          </button>
        </div>

        {admins.length === 0 && !loading && !error ? (
          <div className="flex flex-col justify-center items-center text-gray-900 p-6 border rounded-lg bg-gray-50 mt-8">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              No Admin Users Found
            </h2>
            <p className="text-gray-500 text-center max-w-md">
              It looks like there are no administrative users matching your
              criteria. Click "Add New Admin" to get started or clear your
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
                    Email
                  </th>
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
                    Role
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admmin) => (
                  <tr key={admmin.id} className="hover:bg-gray-50">
                    <td className="break-words px-6 py-4 text-sm font-medium text-gray-900">
                      {admmin?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        {admmin?.display_name || admmin?.full_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        {formatRole(admmin?.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {admmin?.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-4 ">
                        <Trash2
                          className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer"
                          onClick={() => {
                            setPendingId(admmin.id);
                            setUserToDelete(admmin); // Store the user object here
                          }}
                        />
                        <button
                          disabled={loading}
                          onClick={() => {
                            handleEditForm(admmin);
                          }}
                          className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => {
                            setSelectedData(admmin);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Create New Admin
              </DialogTitle>
            </DialogHeader>

            {/* ─────────────── form fields ─────────────── */}
            <div className="space-y-4">
              {/* Email ---------------------------------------------------- */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newSem.email}
                  onChange={(e) =>
                    setNewSem({ ...newSem, email: e.target.value })
                  }
                  required
                />
              </div>

              {/* Name ----------------------------------------------------- */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newSem.display_name}
                  onChange={(e) => {
                    setNewSem({
                      ...newSem,
                      display_name: e.target.value,
                      full_name: e.target.value,
                    });
                  }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Role</label>
                <select
                  className="w-full h-11 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 px-3"
                  value={newSem.role || ""} // Ensure value is controlled
                  onChange={(e) =>
                    setNewSem({ ...newSem, role: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Select Role
                  </option>
                   <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                   <option value="salesrep">Sales Rep</option>
                    <option value="financerep">Finance Rep</option>

                 

                </select>
              </div>

              {/* Phone ----------------------------------------------------- */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <PhoneInput
                  country="ca"
                  value={newSem.phone}
                  onChange={(val, data) => {
                    const finalVal = val.startsWith("+") ? val : `+${val}`;
                    setNewSem({
                      ...newSem,
                      phone: finalVal,
                    });
                  }}
                  inputClass="!w-full !h-11 !text-sm !border !border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
                  buttonClass="!border-gray-300"
                  enableSearch
                />
              </div>

              {/* Password ----------------------------------------------------- */}
              <div className="space-y-1 relative"> {/* Add relative positioning here */}
                <label className="text-sm font-medium">Password</label>
           
              <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={newSem.password}
                      onChange={(e) => {
                    setNewSem({
                      ...newSem,
                      password: e.target.value,
                    });
                  }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 cursor-pointer"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                   </div>
              
            </div>

            {/* ─────────────── footer / actions ─────────────── */}
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
                  hadleAddNewAdmin();
                }}
                className="bg-blue-500 text-white"
              >
                {saving ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog
          open={confirmOpen}
          onOpenChange={(o) => {
            !o && setPendingId(null);
            !o && setUserToDelete(null); // Also clear userToDelete when dialog closes
          }}
        >
          <DialogContent className="sm:max-w-sm bg-white">
            <DialogHeader>
              <DialogTitle>Delete Admin?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-600 ">
              This action can’t be undone. The{" "}
              <span className="font-semibold">
                {formatRole(userToDelete?.role)}
              </span>{" "}
              user will be permanently removed.
            </p>

            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="cursor-pointer"
                disabled={Isdelete}
                onClick={() => {
                  setPendingId(null);
                  setUserToDelete(null); // Clear userToDelete when canceling
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={Isdelete}
                onClick={() => {
                  confirmDelete();
                }}
                className="cursor-pointer bg-red-500"
              >
                {Isdelete ? "Loading ..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Card className="max-w-md w-full mx-auto shadow-md border mt-5 p-4 rounded-2xl bg-white">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Admin Details
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700">
              <div className="font-medium">Email:</div>
              <div> {selectedData?.email}</div>

              <div className="font-medium">Name:</div>
              <div>
                {" "}
                {selectedData?.display_name || selectedData?.full_name}
              </div>
              <div className="font-medium">Role:</div>
              <div>
                <span className="flex items-center">
                  {formatRole(selectedData?.role)}
                </span>
              </div>

              <div className="font-medium">Phone:</div>
              <div>
                <span className="flex items-center">{selectedData?.phone}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Admin
            </DialogTitle>
          </DialogHeader>

          {/* ─────────────── form fields ─────────────── */}
          <div className="space-y-4">
            {/* Email ---------------------------------------------------- */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                value={editSem?.email}
                disabled
                onChange={(e) =>
                  setEditSem({ ...editSem, email: e.target.value })
                }
                required
              />
            </div>

            {/* Name ----------------------------------------------------- */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={editSem?.display_name}
                onChange={(e) => {
                  setEditSem({
                    ...editSem,
                    display_name: e.target.value,
                    full_name: e.target.value,
                  });
                }}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Role</label>
              <select
                className="w-full h-11 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 px-3"
                value={editSem.role || ""} // Use editSem.role here
                onChange={(e) =>
                  setEditSem({ ...editSem, role: e.target.value })
                }
                required
              >
                <option value="" disabled>
                  Select Role
                </option>
                 <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                 <option value="salesrep">Sales Rep</option>
                  <option value="financerep">Finanace Rep</option>
               
              </select>
            </div>

            {/* Phone ----------------------------------------------------- */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <PhoneInput
                country="ca"
                value={editSem.phone}
                onChange={(val, data) => {
                  const finalVal = val.startsWith("+") ? val : `+${val}`;
                  setEditSem({
                    ...editSem,
                    phone: finalVal,
                  });
                }}
                inputClass="!w-full !h-11 !text-sm !border !border-gray-300 !rounded-md focus:ring-2 focus:ring-blue-500"
                buttonClass="!border-gray-300"
                enableSearch
              />
            </div>
          </div>

          {/* ─────────────── footer / actions ─────────────── */}
          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false);
                setEditSem({
                  id: "",
                  email: "",
                  display_name: "",
                  provider: "",
                  provider_type: "",
                  phone: "",
                  created_at: "",
                  subscription: "",
                  status: "",
                  full_name: "",
                  city: "",
                  state: "",
                  zipCode: "",
                  updated_at: "",
                  role: "",
                });
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                hadleUpdateAdmin();
              }}
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