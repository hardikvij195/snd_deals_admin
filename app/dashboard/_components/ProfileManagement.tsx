"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader } from "lucide-react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../store/reducers/userSlice";
import { useAppDispatch } from "../../../store/hooks";
import { showToast } from "../../../hooks/useToast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabaseBrowser } from "../../../lib/supabaseBrowser";
import moment from "moment-timezone";

// This enum maps status keys to displayable values
const statusEnum: any = {
  payment_successful: "Successful",
  payment_pending: "Pending",
  payment_failed: "Failed",
  expired: "Expired",
};

const ProfileManagement = () => {
  const dispatch = useAppDispatch();
  const user = useSelector(selectCurrentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resetButton, setResetButton] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState<any>(null);
  
  // State to hold the user data fetched directly from Supabase
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fullName: "",
    userId: "",
    displayNname: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    status: "active",
    createdAt: "",
    updateAt: "",
  });

  // Fetch the full user object from Supabase on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabaseBrowser.auth.getUser();
        if (error) throw error;
        
        const fetchedUser = data.user;
        setSupabaseUser(fetchedUser);

        // Populate formData with data from Supabase user_metadata
        setFormData({
          fullName: fetchedUser?.user_metadata?.full_name || "",
          userId: fetchedUser?.id || "",
          displayNname: fetchedUser?.user_metadata?.display_name || "",
          email: fetchedUser?.email || "",
          phone: fetchedUser?.user_metadata?.phone || "",
          address: fetchedUser?.user_metadata?.address || "",
          city: fetchedUser?.user_metadata?.city || "",
          state: fetchedUser?.user_metadata?.state || "",
          zipCode: fetchedUser?.user_metadata?.zip_code || "",
          status: "active", // This status is not in user metadata, defaulting
          createdAt: fetchedUser?.created_at || "",
          updateAt: fetchedUser?.updated_at || "",
        });
      } catch (error) {
        console.error("[ProfileManagement] Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [user]);

  // Fetch subscription details on mount
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabaseBrowser
          .from("user_subscription")
          .select("*, subscription(*)")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .single();

        if (error) {
          console.error("Error fetching subscription:", error);
          setSubscriptionPlan(null);
          return;
        }
        setSubscriptionPlan(data);
      } catch (error) {
        console.error("[ProfileManagement] Error fetching subscription details:", error);
        setSubscriptionPlan(null);
      }
    };
    fetchSubscriptionDetails();
  }, [user]);

  const handleSave = async () => {
    try {
      const updateData: Record<string, string> = {};
      const currentUserMetadata = supabaseUser?.user_metadata || {};

      // Only include fields that have changed
      if (formData.fullName !== currentUserMetadata.full_name) updateData.full_name = formData.fullName;
      if (formData.displayNname !== currentUserMetadata.display_name) updateData.display_name = formData.displayNname;
      if (formData.phone !== currentUserMetadata.phone) updateData.phone = formData.phone;
      if (formData.address !== currentUserMetadata.address) updateData.address = formData.address;
      if (formData.city !== currentUserMetadata.city) updateData.city = formData.city;
      if (formData.state !== currentUserMetadata.state) updateData.state = formData.state;
      if (formData.zipCode !== currentUserMetadata.zip_code) updateData.zip_code = formData.zipCode;

      if (Object.keys(updateData).length > 0) {
        // Use supabase.auth.updateUser to update the user's metadata
        const { data, error } = await supabaseBrowser.auth.updateUser({
          data: updateData,
        });

        if (error) {
          throw new Error(error.message);
        }

        console.log("[ProfileManagement] updateData:", data);
        showToast({
          title: "Profile Updated",
          description: "Your profile information has been saved successfully",
          type: "success",
        });
        
        // Update the local state with the new data
        setSupabaseUser(data.user);
        
      } else {
        showToast({
          title: "No Changes",
          description: "No profile changes were made",
        });
      }

      setIsEditing(false);
    } catch (error: any) {
      showToast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        type: "error",
      });
    }
  };

  const handleCancel = () => {
    // Reset form data to the original Supabase user metadata
    setFormData({
      fullName: supabaseUser?.user_metadata?.full_name || "",
      userId: supabaseUser?.id || "",
      displayNname: supabaseUser?.user_metadata?.display_name || "",
      email: supabaseUser?.email || "",
      phone: supabaseUser?.user_metadata?.phone || "",
      address: supabaseUser?.user_metadata?.address || "",
      city: supabaseUser?.user_metadata?.city || "",
      state: supabaseUser?.user_metadata?.state || "",
      zipCode: supabaseUser?.user_metadata?.zip_code || "",
      status: "active",
      createdAt: supabaseUser?.created_at || "",
      updateAt: supabaseUser?.updated_at || "",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
       <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">Loading...</h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we fetch your profile.
        </p>
      </div>
    );
  }

  // Ensure user is loaded before rendering
  if (!supabaseUser) return null;

  const handleForgotPassword = async () => {
    setResetButton(true);

    try {
      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(
        supabaseUser?.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw new Error(error.message);

      showToast({
        title: "Success",
        description: `Reset link sent to ${supabaseUser.email}. Please check your inbox.`,
      });
    } catch (err: any) {
      showToast({
        type: "error",
        title: "Error",
        description: err?.message || "Something went wrong.",
      });
    } finally {
      setResetButton(false);
    }
  };

  return (
    <div className="space-y-6 lg:p-6 md:p-6 p-2">
      <Card>
        <CardHeader>
          <CardTitle className="space-x-1">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold"></h1>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                >
                  Edit Profile
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button onClick={() => handleCancel()} variant="outline">
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleSave()}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={formData.userId}
                disabled={true}
                placeholder="USR0001"
                readOnly
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Your Name"
              />
            </div>
      
            <div className="space-y-4">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                  disabled={true}
                placeholder="(555) 123-4567"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={true}
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                disabled={!isEditing}
                placeholder="123 Main St"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                disabled={!isEditing}
                placeholder="Your City"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                disabled={!isEditing}
                placeholder="State"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="zipCode">ZIP Code</Label>
              <Input
                id="zipCode"
                value={formData.zipCode}
                onChange={(e) =>
                  setFormData({ ...formData, zipCode: e.target.value })
                }
                disabled={!isEditing}
                placeholder="12345"
              />
            </div>
            <div className="space-y-4">
              <Label htmlFor="joinDate">Join Date</Label>
              <div className="w-full px-3 py-2 border border-input rounded-md bg-muted text-sm text-muted-foreground">
                {formData.createdAt
                  ? moment(formData.createdAt)
                      .tz("America/Toronto")
                      .format("MMMM D, YYYY h:mm A z")
                  : "N/A"}{" "}
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="lastLogin">Last Login</Label>
              <div className="w-full px-3 py-2 border border-input rounded-md bg-muted text-sm text-muted-foreground">
                {formData.updateAt
                  ? moment(formData.updateAt)
                      .tz("America/Toronto")
                      .format("MMMM D, YYYY h:mm A z")
                  : "N/A"}{" "}
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span>Manage Password</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-5">
            <Button
              variant="outline"
              size="lg"
              className="
                w-48                      
                border-blue-600 text-blue-600
                flex items-center justify-center gap-2
                cursor-pointer
                hover:text-blue-800
              "
              disabled={resetButton}
              onClick={() => {
                handleForgotPassword();
              }}
            >
              {resetButton ? (
                <> Loading ...</>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Change&nbsp;Password
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileManagement;
