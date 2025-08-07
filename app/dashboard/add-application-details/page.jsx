// app/dashboard/add-application-details/page.jsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { showToast } from "@/hooks/useToast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ApplicantForm from "./ApplicantForm";
import CoApplicantForm from "./CoApplicantForm";
import CarApplicationForm from "./CarApplicationForm";

const PhoneInput = dynamic(() => import("react-phone-input-2"), { ssr: false });

export default function AddApplicationDetailsPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("applicant");
  const [backButtonRoute, setBackButtonRoute] = useState("/dashboard/my-applications");
  const [loadingRole, setLoadingRole] = useState(true);

  // We'll manage the form data for each tab separately
  const [applicantData, setApplicantData] = useState({
    title: "",
    email: "",
    phone: "",
    notes: "",
  });

  const [coApplicantData, setCoApplicantData] = useState({
    // Initial state for co-applicant
  });

  const [carApplicationData, setCarApplicationData] = useState({
    // Initial state for car application
  });
  
  useEffect(() => {
    async function fetchUserRole() {
      setLoadingRole(true);
      try {
        const { data: { user } } = await supabaseBrowser.auth.getUser();
        if (user) {
          const { data: profileData, error: profileError } = await supabaseBrowser
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            // Default to salesrep view if profile fetching fails
            setBackButtonRoute("/dashboard/my-applications");
          } else if (profileData?.role === "admin" || profileData?.role === "superadmin") {
            setBackButtonRoute("/dashboard/applications");
          } else {
            // Default to salesrep view for any other role
            setBackButtonRoute("/dashboard/my-applications");
          }
        }
      } catch (error) {
        console.error("Authentication or role fetching error:", error);
        // Default to salesrep view on any error
        setBackButtonRoute("/dashboard/my-applications");
      } finally {
        setLoadingRole(false);
      }
    }

    fetchUserRole();
  }, []);

  const handleAddNewApplication = async () => {
    setSaving(true);
    try {
      if (!applicantData.title || !applicantData.email || !applicantData.phone) {
        throw new Error("Name, Email, and Phone are required!");
      }

      const { data: { user }, error: userError } = await supabaseBrowser.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated. Please sign in to create an application.");
      }

      // Consolidate data from all forms before submission
      const combinedData = {
        title: applicantData.title,
        email: applicantData.email,
        phone: applicantData.phone,
        notes: applicantData.notes,
        user_id: user.id,
        // Add co-applicant and car-application data here once implemented
      };

      const { error: insertError } = await supabaseBrowser
        .from("applications")
        .insert(combinedData);

      if (insertError) {
        throw new Error(insertError.message);
      }

      showToast({
        title: "Success",
        description: "Application created successfully!",
      });

      router.push(backButtonRoute);
    } catch (error) {
      console.error("Add new application error:", error);
      showToast({
        type: "error",
        title: "Error",
        description: error?.message || "Something went wrong while creating application!",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "applicant":
        return <ApplicantForm data={applicantData} setData={setApplicantData} />;
      case "co-applicant":
        return <CoApplicantForm data={coApplicantData} setData={setCoApplicantData} />;
      case "car-application":
        return <CarApplicationForm data={carApplicationData} setData={setCarApplicationData} />;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 md:p-6 bg-white min-h-screen">
      <div className=" mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <Link
            href={backButtonRoute}
            className="text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-md text-gray-500">Applications</h1>
        </div>

        {/* Tab Navigation Buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("applicant")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "applicant"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Applicant
          </button>
          <button
            onClick={() => setActiveTab("co-applicant")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "co-applicant"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Co-Applicant
          </button>
          <button
            onClick={() => setActiveTab("car-application")}
            className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
              activeTab === "car-application"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Car Application
          </button>
        </div>

        {/* Form content based on active tab */}
        <div className="p-6 space-y-6">
          {renderActiveTab()}
        </div>

        {/* Form buttons */}
        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => router.push(backButtonRoute)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            disabled={saving || activeTab !== "applicant"}
            onClick={handleAddNewApplication}
            className="bg-blue-500 text-white"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}
