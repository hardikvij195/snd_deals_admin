"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { showToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Trash2,
  Info,
  Edit,
  FileText,
  Search,
  Plus,
  Loader2,
  Lock,
} from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PaginationBar from "../_components/Pagination";

// Define the Deal status options
const statusOptions = [
  "New",
  "Contacted",
  "Proposal Sent",
  "Negotiation",
  "Closed - Won",
  "Closed - Lost",
];

export default function DealsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [userUid, setUserUid] = useState(null);

  // Pagination state
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / limit);

  // Modals and Forms state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [currentDeal, setCurrentDeal] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // State to refresh the table after an action
  const [refresh, setRefresh] = useState(false);

  // Fetch the current user on component mount to get the user_id
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user }, error } = await supabaseBrowser.auth.getUser();
        if (error) throw error;
        setUserUid(user?.id || null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to get user data.");
      } finally {
        setIsAuthLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleFetchDeals = useCallback(async () => {
    setLoading(true);
    if (!userUid) {
      setLoading(false);
      return;
    }

    try {
      let query = supabaseBrowser
        .from("deals")
        .select("*", { count: "exact" })
        .eq("user_id", userUid)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(
          `deal_id.ilike.%${searchTerm}%,customer_name.ilike.%${searchTerm}%`
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
        setDeals(data || []);
        setTotal(count || 0);
      }
    } catch (error) {
      console.error("Failed to fetch deals data:", error);
      setError(error.message || "Failed to fetch deals data");
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchTerm, userUid]);

  useEffect(() => {
    const handler = setTimeout(() => {
      handleFetchDeals();
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, page, limit, refresh, handleFetchDeals]);

  // Handle Add, Edit, View, Delete actions
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const newDeal = {
        user_id: userUid,
        deal_id: currentDeal.deal_id,
        customer_name: currentDeal.customer_name,
        deal_amount: parseFloat(currentDeal.deal_amount),
        date: currentDeal.date,
        status: currentDeal.status,
        notes: currentDeal.notes,
      };

      const { error } = await supabaseBrowser
        .from("deals")
        .insert([newDeal]);

      if (error) throw new Error(error.message);

      showToast({ title: "Success", description: "Deal added successfully!" });
      setIsAddModalOpen(false);
      setRefresh(prev => !prev);
    } catch (error) {
      showToast({ title: "Error", description: error.message || "Failed to add deal.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { error } = await supabaseBrowser
        .from("deals")
        .update({
          deal_id: currentDeal.deal_id,
          customer_name: currentDeal.customer_name,
          deal_amount: parseFloat(currentDeal.deal_amount),
          date: currentDeal.date,
          status: currentDeal.status,
          notes: currentDeal.notes,
        })
        .eq("id", currentDeal.id)
        .eq("user_id", userUid);

      if (error) throw new Error(error.message);

      showToast({ title: "Success", description: "Deal updated successfully!" });
      setIsEditModalOpen(false);
      setRefresh(prev => !prev);
    } catch (error) {
      showToast({ title: "Error", description: error.message || "Failed to update deal.", type: "error" });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentDeal) return;

    const { error } = await supabaseBrowser
      .from("deals")
      .delete()
      .eq("id", currentDeal.id)
      .eq("user_id", userUid);

    if (error) {
      showToast({ title: "Error", description: "Failed to delete deal.", type: "error" });
    } else {
      showToast({ title: "Success", description: "Deal deleted successfully!" });
      setIsDeleteModalOpen(false);
      setRefresh(prev => !prev);
    }
  };

  // Loading state for authentication
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
        <h2 className="text-lg font-semibold text-gray-800">Loading User Information...</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we verify your access rights.
        </p>
      </div>
    );
  }

  // Handle case where user is not authenticated or not found
  if (!userUid) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <Lock className="h-16 w-16 mb-4 text-red-500" />
        <h2 className="text-2xl font-bold text-red-700">Access Denied</h2>
        <p className="text-lg text-gray-600 mt-2">You must be logged in to view this page.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <form onSubmit={(e) => e.preventDefault()} className="relative lg:w-[80%] md:w-[80%] w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Deal ID or Customer Name..."
            className="pl-9 pr-4 py-2 border rounded-md w-full"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />
        </form>
      </div>
      
      <button
        onClick={() => {
          setCurrentDeal({
            deal_id: "",
            customer_name: "",
            deal_amount: "",
            date: "",
            status: "",
            notes: "",
          });
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-50 rounded-full p-4 bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-colors"
        title="Add New Deal"
      >
        <Plus className="h-6 w-6" />
      </button>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-6 text-center h-[50vh]">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <h2 className="text-lg font-semibold text-gray-800">Loading Deals...</h2>
          <p className="text-sm text-gray-500 mt-2 max-w-sm">
            Please wait while we fetch your deals.
          </p>
        </div>
      ) : deals.length === 0 ? (
        <div className="flex flex-col justify-center items-center text-gray-900 p-6 border rounded-lg bg-gray-50 mt-8">
          <FileText className="w-16 h-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No Deals Found</h2>
          <p className="text-gray-500 text-center max-w-md">
            It looks like there are no deals matching your criteria.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md lg:w-full md:w-full w-[320px]">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deal ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{deal.deal_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{deal.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {/* Updated line to safely format the amount */}
                    ${typeof deal.deal_amount === 'number' ? deal.deal_amount.toFixed(2) : deal.deal_amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{deal.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1 text-blue-500" />
                      {new Date(deal.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center gap-4">
                      <Trash2
                        className="h-4 w-4 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        onClick={() => {
                          setCurrentDeal(deal);
                          setIsDeleteModalOpen(true);
                        }}
                      />
                      <button
                        onClick={() => {
                          setCurrentDeal(deal);
                          setIsEditModalOpen(true);
                        }}
                        className="cursor-pointer p-2 rounded-md bg-gray-100 text-gray-600 hover:bg-gray-200"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setCurrentDeal(deal);
                          setIsViewModalOpen(true);
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

      {/* Add Deal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dealId">Deal ID</Label>
              <Input
                id="dealId"
                name="deal_id"
                placeholder="Enter Deal ID"
                value={currentDeal?.deal_id || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, deal_id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customer_name"
                placeholder="Enter Customer Name"
                value={currentDeal?.customer_name || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealAmount">Deal Amount</Label>
              <Input
                id="dealAmount"
                name="deal_amount"
                type="number"
                placeholder="Enter Deal Amount"
                value={currentDeal?.deal_amount || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, deal_amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                placeholder="Select Date"
                value={currentDeal?.date || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={currentDeal?.status || ""}
                onValueChange={(value) => setCurrentDeal(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                 <SelectContent className="bg-white !bg-opacity-100 border shadow-md rounded-md">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add notes about the deal"
                rows={4}
                value={currentDeal?.notes || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading} className="bg-blue-500 text-white">
                {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Deal Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle>Edit Deal</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dealId">Deal ID</Label>
              <Input
                id="dealId"
                name="deal_id"
                placeholder="Enter Deal ID"
                value={currentDeal?.deal_id || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, deal_id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                name="customer_name"
                placeholder="Enter Customer Name"
                value={currentDeal?.customer_name || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, customer_name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dealAmount">Deal Amount</Label>
              <Input
                id="dealAmount"
                name="deal_amount"
                type="number"
                placeholder="Enter Deal Amount"
                value={currentDeal?.deal_amount || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, deal_amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                placeholder="Select Date"
                value={currentDeal?.date?.split('T')[0] || ""} // Split to handle ISO date format
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                name="status"
                value={currentDeal?.status || ""}
                onValueChange={(value) => setCurrentDeal(prev => ({ ...prev, status: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
               <SelectContent className="!bg-white !bg-opacity-100 border shadow-md rounded-md">
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add notes about the deal"
                rows={4}
                value={currentDeal?.notes || ""}
                onChange={(e) => setCurrentDeal(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Deal Modal */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)}>
        <Card className="max-w-md w-full mx-auto shadow-md border mt-5 p-4 rounded-2xl bg-white">
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Deal Details</h2>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm text-gray-700">
              <div className="font-medium">Deal ID:</div>
              <div>{currentDeal?.deal_id}</div>
              <div className="font-medium">Customer Name:</div>
              <div>{currentDeal?.customer_name}</div>
              <div className="font-medium">Amount:</div>
              {/* Corrected line to safely format the amount */}
              <div>
                {currentDeal?.deal_amount !== null && currentDeal?.deal_amount !== undefined
                  ? `$${parseFloat(currentDeal.deal_amount).toFixed(2)}`
                  : 'N/A'
                }
              </div>
              <div className="font-medium">Date:</div>
              <div>{currentDeal?.date ? new Date(currentDeal.date).toLocaleDateString() : 'N/A'}</div>
              <div className="font-medium">Status:</div>
              <div>{currentDeal?.status}</div>
              <div className="font-medium col-span-2">Notes:</div>
              <div className="col-span-2 break-words">{currentDeal?.notes || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-sm bg-white">
          <DialogHeader>
            <DialogTitle>Delete Deal?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This action can’t be undone. The deal entry will be permanently removed.
          </p>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} className="bg-red-500">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
