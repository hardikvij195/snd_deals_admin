import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw, Download } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { usePathname } from "next/navigation";
import { exportToExcel } from "@/lib/exportToExcel";
import { showToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import { exportDashboardToExcel } from "@/lib/exportDashboard";
import { RootState } from "@/store/store";

interface NavbarProps {
  sidebarCollapsed?: boolean;
  setSidebarCollapsed?: (collapsed: boolean) => void;
  setSidebarOpen?: (open: boolean) => void;
  collapsed?: boolean;
  setCollapsed?: (collapsed: boolean) => void;
}
const pathName: any = {
  "/dashboard": "Dashboard",
  "/dashboard/teammanagement": "Team Management",
  "/dashboard/financemanager": "Finanace Manager",
  "/dashboard/subscription": "Manage Subscription",
  "/dashboard/dealforms": "Deal Forms",
  "/dashboard/dealboard": "Deals",
  "/dashboard/applications": "Applications",
  "/dashboard/reports": "Reports",
  "/dashboard/my-applications": "My Applications",
  "/dashboard/add-application-details": "Add New Application",
  "/dashboard/applications-board":"Applications",
  "/dashboard/my-deals" :"Deals",
  "/dashboard/profile" :"Profile"
};

const Navbar = ({ setCollapsed, collapsed }: NavbarProps) => {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const [seminarId, setSeminarId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("seminarId");
    setSeminarId(id);
  }, []);
  console.log(seminarId);

  const handleRefresh = () => {
    // Custom logic to refresh data or reload the page
    window.location.reload();
  };

  const handleExportUserFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("users")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "users");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExportSubscriptionFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("user_subscription")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error("Something went wrong!");
      }

      await exportToExcel(data, "subscription");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExportInvoiceFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("invoice")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "invoices");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  useEffect(() => {
    const fetchUserRole = async () => {
      const {
        data: { user },
      } = await supabaseBrowser.auth.getUser();

      if (user) {
        const { data, error } = await supabaseBrowser
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (!error && data?.role) {
          setUserRole(data.role);
        }
      }
    };

    fetchUserRole();
  }, []);

  const handleExportContactUsFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("contact_us_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "contact_inquiries");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExporSeminartSignupFile = async (
    seminarId: string,
    tab: string
  ) => {
    try {
      if (tab == "signup") {
        const { data, error } = await supabaseBrowser
          .from("seminar_signup")
          .select("* ,seminars(*)", { count: "exact" })
          .eq("seminar_id", seminarId)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error("Something went wrong!");
        }

        await exportToExcel(data, "saminar_signup");
      } else {
        const { data, error } = await supabaseBrowser
          .from("seminar_registration")
          .select("* ,seminars(*)", { count: "exact" })
          .eq("saminarId", seminarId)
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error("Something went wrong!");
        }
        await exportToExcel(data, "saminar_registration");
      }
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExporSeminartFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("seminars")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "saminars");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExporVipTiertFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("vip_tiers")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "viptiers");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExportSignUpFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("seminar_signup")
        .select("* ,seminars(*)", { count: "exact" })
        .eq("seminar_id", seminarId)
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "saminar_signup");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExportRegistrationFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("seminar_registration")
        .select("*", { count: "exact" })
        .eq("saminarId", seminarId)
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "saminar_registration");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };

  const handleExportToolFile = async () => {
    try {
      const { data, error, count } = await supabaseBrowser
        .from("details")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false });
      if (error) {
        throw new Error("Something went wrong!");
      }
      await exportToExcel(data, "invoices");
    } catch (error) {
      showToast({
        title: "Error",
        description: "Something went wrong!",
      });
    }
  };
  const stats = useSelector((state: RootState) => state.dashboard);
  const tab = useSelector((state: RootState) => state.dashboard.SeminarTabName);

  const handleExport = async () => {
    // Your export logic here (e.g., trigger CSV/PDF export)
    if (pathname == "/dashboard") {
      return await exportDashboardToExcel(stats);
    } else if (pathname == "/dashboard/users") {
      return await handleExportUserFile();
    } else if (pathname == "/dashboard/subscription") {
      await handleExportSubscriptionFile();
    } else if (pathname == "/dashboard/invoices") {
      await handleExportInvoiceFile();
    } else if (pathname == "/dashboard/contactus") {
      await handleExportContactUsFile();
    } else if (pathname == "/dashboard/seminar") {
      await handleExporSeminartFile();
    } else if (pathname == "/dashboard/viptier") {
      await handleExporVipTiertFile();
    } else if (pathname == "/dashboard/details") {
      await handleExportToolFile();
    } else if (pathname == "/dashboard/details") {
      const codeType = localStorage.getItem("subRoute");
      if (codeType == "registration") {
        await handleExportRegistrationFile();
      } else {
        await handleExportSignUpFile();
      }
    }

    console.log(pathname, "pathnamepathname");
  };
  console.log(pathName[pathname], "hololo");

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed?.(!collapsed)}
          className="h-10 w-8"
        >
          {collapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </Button>
        <span className="lg:text-lg md:text-md text-sm font-bold text-gray-800">
          {(() => {
            const title =
              pathName[pathname] ||
              (pathname.startsWith("/dashboard/users/") &&
                pathname.split("/").length === 4 &&
                pathName["/dashboard/users/[id]"]) ||
              "";

            if (pathname === "/dashboard" && userRole) {
              const roleMapping: {
                superadmin: string;
                admin: string;
                salesrep: string;
                financerep: string;
              } = {
                superadmin: "Super Admin",
                admin: "Admin",
                salesrep: "Sales",
                financerep: "Finance",
              };

              // The fix is here: tell TypeScript that userRole is a key of roleMapping
              const formattedRole =
                roleMapping[userRole as keyof typeof roleMapping] || userRole;

              return `${title} - ${formattedRole}`;
            }

            return title;
          })()}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        {pathName[pathname] !== "Training Videos" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="cursor-pointer text-gray-600 hover:text-gray-900"
            aria-label="Export"
          >
            <Download className="w-5 h-5" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          className="cursor-pointer text-gray-600 hover:text-gray-900"
          aria-label="Refresh"
        >
          <RefreshCw className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
