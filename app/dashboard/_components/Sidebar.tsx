"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  CreditCard,
  FileText,
  LayoutDashboard,
  ChartColumnDecreasing,
  File,
  LogOut,
  BookUser,
  BarChart3,
  Loader,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ collapsed }: SidebarProps) {
  const user = useSelector((state: any) => state?.admin?.user);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start a timer to stop loading after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Clear the timeout if the component unmounts
    return () => clearTimeout(timer);
  }, []);

  async function handleLogout() {
    const { error } = await supabaseBrowser.auth.signOut();
    if (error) return console.error("Sign-out failed:", error.message);
    router.push("/");
  }

  const getMenuItems = () => {
    switch (user?.role) {
      case "superadmin":
        return [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Applications", href: "/dashboard/applications", icon: File },
          { title: "Deals", href: "/dashboard/dealboard", icon: ChartColumnDecreasing },
          { title: "Teams", href: "/dashboard/teammanagement", icon: Users },
          { title: "Report", href: "/dashboard/reports", icon: BarChart3 },
        ];
      case "admin":
        return [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "Applications", href: "/dashboard/applications", icon: File },
          { title: "Deals", href: "/dashboard/dealboard", icon: ChartColumnDecreasing },
          { title: "Report", href: "/dashboard/reports", icon: BarChart3 },
        ];
      case "salesrep":
        return [
          { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
          { title: "My Applications", href: "/dashboard/my-applications", icon: FileText },
        ];
      case "financerep":
        return [
          { title: "Applications Board", href: "/dashboard/applications-board", icon: File },
          { title: "My Deals", href: "/dashboard/my-deals", icon: CreditCard },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  // Show a loader if the user object is not yet available or if the loading state is true
  if (!user || isLoading) {
    return (
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col items-center justify-center bg-white border-r border-gray-200 transition-all duration-300",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <Loader className="h-6 w-6 animate-spin text-gray-500" />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* ─────── BRAND ─────── */}
      <div className="p-4 border-b border-gray-200">
        <Link
          href="/dashboard"
          className="flex items-center justify-center space-x-3"
        >
          {collapsed ? (
            <img
              src="/Logo.png"
              alt="DriveX"
              className="h-8 w-auto object-contain"
            />
          ) : (
            <img
              src="/Logo.png"
              alt="DriveX"
              className="max-h-[60px] w-auto object-contain"
            />
          )}
        </Link>
      </div>

      {/* ─────── NAV LINKS ─────── */}
      <nav className="flex-1 mt-6 overflow-y-auto">
        <TooltipProvider delayDuration={80}>
          {menuItems.map(({ title, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Tooltip key={href}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "group mx-2 flex items-center rounded-lg px-4 py-3 text-sm transition-colors",
                      active
                        ? "bg-[#F4F8FF] text-[#2563EB] font-semibold"
                        : "hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
                    {!collapsed && <span className="font-medium">{title}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right" className="bg-gray-800 text-white">
                    {title}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </nav>

      {/* ─────── LOG OUT ─────── */}
      <div className="p-2 border-t border-gray-200">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full h-12 cursor-pointer text-red-600 hover:text-red-800"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Log out</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start h-12 cursor-pointer text-red-600 hover:text-red-800"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            Log out
          </Button>
        )}
      </div>
    </aside>
  );
}