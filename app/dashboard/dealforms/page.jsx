"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { showToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define the Deal status options
const statusOptions = [
  "initiated",
  "Submitted",
  "Under-Review",
  "Approved",
  "Rejected",

];

export default function AddDealForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    dealId: "",
    customerName: "",
    dealAmount: "",
    date: "",
    status: "",
    notes: "",
  });

  // Fetch the current user on component mount to get the user_id
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
      showToast({
        title: "Error",
        description: "User not authenticated. Please log in.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    try {
      const newDeal = {
        user_id: user.id,
        deal_id: formData.dealId,
        customer_name: formData.customerName,
        deal_amount: parseFloat(formData.dealAmount),
        date: formData.date,
        status: formData.status,
        notes: formData.notes,
      };

      const { data, error } = await supabaseBrowser
        .from("deals")
        .insert([newDeal])
        .select();

      if (error) {
        throw new Error(error.message);
      }

      showToast({
        title: "Success",
        description: "Deal added successfully!",
        type: "success",
      });

      // Clear the form and redirect
      setFormData({
        dealId: "",
        customerName: "",
        dealAmount: "",
        date: "",
        status: "",
        notes: "",
      });
      router.push("/dashboard/deals");
    } catch (error) {
      showToast({
        title: "Error",
        description: error.message || "Failed to add deal.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/dashboard/deals");
  };

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-2xl shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">New Deal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dealId">Deal ID</Label>
                <Input
                  id="dealId"
                  name="dealId"
                  placeholder="Enter Deal ID"
                  value={formData.dealId}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  placeholder="Enter Customer Name"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dealAmount">Deal Amount</Label>
                <Input
                  id="dealAmount"
                  name="dealAmount"
                  type="number"
                  placeholder="Enter Deal Amount"
                  value={formData.dealAmount}
                  onChange={handleChange}
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
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  name="status"
                  onValueChange={(value) => handleSelectChange("status", value)}
                  required
                  value={formData.status}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-1 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add notes about the deal"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
