"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Trash2,
  Info,
  Edit,
  FileText,
  Archive,
  Search,
  Phone,
  Mail,
  MessageCircle,
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Plus } from "lucide-react";
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
import ArchiveModal from "../_components/ArchivedConfirmationModal";
import { Textarea } from "@/components/ui/textarea";

export default function FinanceManagerPage() {
  const router = useRouter();
  const [financeData, setFinanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [newFinance, setNewFinance] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
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
  const [editFinance, setEditFinance] = useState({
    id: "",
    name: "",
    email: "",
    phoneNumber: "",
    message: "",
  });
  const [isOpenDeleted, setIsOpenDeleted] = useState(false);
  const [rowData, setRowData] = useState(null);
  const [deleteRefresh, setDeleteRefresh] = useState(null);

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveRowData, setArchiveRowData] = useState(null);

  const handleArchiveClick = (row) => {
    setArchiveRowData(row);
    setIsArchiveModalOpen(true);
  };

  const handleRefresh = () => {
    setPage(1);
    setDeleteRefresh(Math.random());
  };

  const handleFetchFinanceData = async () => {
    setLoading(true);
    try {
      let query = supabaseBrowser
        .from("finance")
        .select("*", { count: "exact" })
        .order("createdat", { ascending: false });

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error(error);
        setError(error.message);
      } else {
        setFinanceData(data || []);
        setTotal(count || 0);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to fetch finance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchFinanceData();
  }, [page, deleteRefresh, limit]);

  const filteredFinanceData = useMemo(() => {
    if (!searchTerm.trim()) {
      return financeData;
    }
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    return financeData.filter(
      (data) =>
        data.name.toLowerCase().includes(lowercasedSearchTerm) ||
        data.email.toLowerCase().includes(lowercasedSearchTerm) ||
        data.phoneNumber.toLowerCase().includes(lowercasedSearchTerm)
    );
  }, [financeData, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we fetch the latest data for you.
        </p>
      </div>
    );
  }

  async function confirmDelete() {
    if (!pendingId) return;

    const id = pendingId;
    setPendingId(null);
    setFinanceData((prev) => prev.filter((s) => s.id !== id));

    const { error } = await supabaseBrowser
      .from("finance")
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
        description: "Finance Data deleted successfully!",
      });
      handleRefresh();
    }
  }

  const handleEditForm = (data) => {
    setEditFinance({
      id: data.id,
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      message: data.message,
    });
    setIsEditing(true);
  };

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="relative flex-1 mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Name, Email or Phone..."
            className="pl-9"
            value={searchTerm}
            disabled={loading}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="bg-white">
          <button
            onClick={() => setDialogOpen(true)}
            className="fixed bottom-6 right-6 z-50 rounded-full p-4 bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300"
            title="Add Finance Entry"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {filteredFinanceData.length === 0 && !loading ? (
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
                    Message
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
                {filteredFinanceData.map((data) => (
                  <tr key={data.id} className="hover:bg-gray-50">
                    <td className="break-words px-6 py-4 text-sm font-medium text-gray-900">
                      {data?.name}
                    </td>
                    <td className="break-words px-6 py-4 text-sm text-gray-900">
                      {data?.email}
                    </td>
                    <td className="break-words px-6 py-4 text-sm text-gray-900">
                      {data?.phoneNumber}
                    </td>
                    <td className="break-words px-6 py-4 text-sm text-gray-900">
                      {data?.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="flex items-center">
                        <Calendar size={16} className="mr-1 text-blue-500" />
                        {data?.createdat?.split("T")?.[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-4">
                        <Trash2
                          className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer"
                          onClick={() => setPendingId(data.id)}
                        />
                        <button
                          disabled={loading}
                          onClick={() => {
                            handleEditForm(data);
                          }}
                          className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          disabled={loading}
                          onClick={() => {
                            setSelectedData(data);
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-lg bg-white">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-center gap-2">
                Add New Entry
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newFinance.name}
                  onChange={(e) =>
                    setNewFinance({ ...newFinance, name: e.target.value })
                  }
                  placeholder="Enter Name"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newFinance.email}
                  onChange={(e) =>
                    setNewFinance({ ...newFinance, email: e.target.value })
                  }
                  placeholder="Enter Email"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  type="tel"
                  value={newFinance.phoneNumber}
                  onChange={(e) =>
                    setNewFinance({ ...newFinance, phoneNumber: e.target.value })
                  }
                  placeholder="Enter Phone Number"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Message</label>
                <Textarea
                  value={newFinance.message}
                  onChange={(e) =>
                    setNewFinance({ ...newFinance, message: e.target.value })
                  }
                  placeholder="Enter Message"
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
                    .from("finance")
                    .insert({
                      name: newFinance.name,
                      email: newFinance.email,
                      phoneNumber: newFinance.phoneNumber,
                      message: newFinance.message,
                      createdat: new Date().toISOString(),
                    });

                  if (error) {
                    showToast({
                      title: "Error",
                      description: "Something went wrong while saving!",
                    });
                  } else {
                    setDialogOpen(false);
                    setNewFinance({
                      name: "",
                      email: "",
                      phoneNumber: "",
                      message: "",
                    });
                    showToast({
                      title: "Success",
                      description: "Finance entry added successfully!",
                    });
                    handleRefresh();
                  }
                  setSaving(false);
                }}
                className="bg-blue-600 text-white"
              >
                {saving ? "Saving…" : "Save"}

              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={confirmOpen}
          onOpenChange={(o) => !o && setPendingId(null)}
        >
          <DialogContent className="sm:max-w-sm bg-white">
            <DialogHeader>
              <DialogTitle>Delete Finance entry?</DialogTitle>
            </DialogHeader>

            <p className="text-sm text-gray-600">
              This action can’t be undone. The finance entry will be permanently
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
                className="cursor-pointer bg-red-500 border-2 border-red-800"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <DeleteModal
        rowData={rowData}
        isOpen={isOpenDeleted}
        setIsOpen={setIsOpenDeleted}
        setRowData={setRowData}
        name="finance"
        handleRefresh={handleRefresh}
      />

      <ArchiveModal
        isOpen={isArchiveModalOpen}
        setIsOpen={setIsArchiveModalOpen}
        rowData={archiveRowData}
        setRowData={setArchiveRowData}
        handleRefresh={handleRefresh}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <Card className="max-w-md w-full mx-auto shadow-md border mt-5 p-4 rounded-2xl bg-white">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Finance Details
            </h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700">
              <div className="font-medium">Name:</div>
              <div> {selectedData?.name}</div>

              <div className="font-medium">Email:</div>
              <div>
                <span className="flex items-center">
                  <Mail size={16} className="mr-1 text-blue-500" />
                  {selectedData?.email}
                </span>
              </div>

              <div className="font-medium">Phone:</div>
              <div>
                <span className="flex items-center">
                  <Phone size={16} className="mr-1 text-blue-500" />
                  {selectedData?.phoneNumber}
                </span>
              </div>

              <div className="font-medium">Message:</div>
              <div>
                <span className="flex items-center">
                  <MessageCircle size={16} className="mr-1 text-blue-500" />
                  {selectedData?.message}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Finance Entry
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Name</label>
              <Input
                value={editFinance?.name}
                onChange={(e) =>
                  setEditFinance({ ...editFinance, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={editFinance?.email}
                onChange={(e) =>
                  setEditFinance({ ...editFinance, email: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Phone</label>
              <Input
                type="tel"
                value={editFinance?.phoneNumber}
                onChange={(e) =>
                  setEditFinance({ ...editFinance, phoneNumber: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Message</label>
              <Input
                value={editFinance?.message}
                onChange={(e) =>
                  setEditFinance({ ...editFinance, message: e.target.value })
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
                setEditFinance({
                  id: "",
                  name: "",
                  email: "",
                  phoneNumber: "",
                  message: "",
                });
              }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              disabled={saving}
              onClick={async () => {
                setSaving(true);
                const { error } = await supabaseBrowser
                  .from("finance")
                  .update({
                    name: editFinance?.name,
                    email: editFinance?.email,
                    phoneNumber: editFinance?.phoneNumber,
                    message: editFinance?.message,
                  })
                  .eq("id", editFinance?.id);

                if (error) {
                  showToast({
                    title: "Error",
                    description: "Something went wrong!",
                  });
                } else {
                  showToast({
                    title: "Success",
                    description: "Finance entry updated successfully!",
                  });
                  handleRefresh();
                  setIsEditing(false);
                  setEditFinance({
                    id: "",
                    name: "",
                    email: "",
                    phoneNumber: "",
                    message: "",
                  });
                }
                setSaving(false);
              }}
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}