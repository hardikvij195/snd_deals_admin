"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  File,
  RatioIcon,
  Handshake,
  DollarSign,
  CreditCard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { AppDispatch } from "@/store/store";
import { useDispatch } from "react-redux";
import { setDashboardStats } from "@/store/features/dashboard/dashboardSlice";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  Filler
);

export default function AdminDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const [stats, setStats] = useState({
    totalApplications: 0,
  });
  const [dealsstats, setDealsStats] = useState({
    totalApplications: 0,
     assignedDeals: 0,
  unassignedDeals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const {
        data: applicationsArray,
        count: applicationsCount,
        error: applicationsError,
      } = await supabaseBrowser
        .from("applications")
        .select("id", { count: "exact" });

      if (applicationsError) {
        console.error("Error fetching applications count:", applicationsError);
        return;
      }

      const totalApplications = applicationsCount || 0;

      const fullStats = {
        totalApplications,
        totalUsers: 0, // Placeholder until you implement
        activeSubscribers: 0, // Placeholder
        totalRevenue: 0, // Placeholder
        chartData: [],
        chartLabels: [], // ✅ Add this
        SeminarTabName: "", // Placeholder or proper chart data
      };

      setStats(fullStats);
      dispatch(setDashboardStats(fullStats));
    };

    fetchStats();
  }, [dispatch]);

  useEffect(() => {
    const fetchDealsStats = async () => {
      // 1. Fetch total count of deals
      const { count: dealsCount, error: dealsCountError } =
        await supabaseBrowser
          .from("deals")
          .select("id", { count: "exact", head: true });

      if (dealsCountError) {
        console.error("Error fetching total deals count:", dealsCountError);
        return;
      }

      // 2. Fetch count of assigned deals (assigned_to is not NULL)
      const { count: assignedDealsCount, error: assignedError } =
        await supabaseBrowser
          .from("deals")
          .select("id", { count: "exact", head: true })
          .not("assigned_to", "is", null);

      if (assignedError) {
        console.error("Error fetching assigned deals count:", assignedError);
        return;
      }

      // 3. Fetch count of unassigned deals (assigned_to is NULL)
      const { count: unassignedDealsCount, error: unassignedError } =
        await supabaseBrowser
          .from("deals")
          .select("id", { count: "exact", head: true })
          .is("assigned_to", null);

      if (unassignedError) {
        console.error(
          "Error fetching unassigned deals count:",
          unassignedError
        );
        return;
      }

      // 4. Consolidate stats and update state
      const fullStats = {
        totalApplications: dealsCount || 0,
        assignedDeals: assignedDealsCount || 0,
        unassignedDeals: unassignedDealsCount || 0,
        totalUsers: 0,
        activeSubscribers: 0,
        totalRevenue: 0,
        chartData: [],
        chartLabels: [],
        SeminarTabName: "",
      };

      setDealsStats(fullStats);
      dispatch(setDashboardStats(fullStats));
    };

    fetchDealsStats();
  }, [dispatch]);

  return (
    <div className="flex min-h-screen ">
      <main className="flex-1 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-l-8 border-l-yellow-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
              <CardTitle className="text-sm font-medium">
                Total Applications
              </CardTitle>
              <File className="h-5 w-5 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalApplications}
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-8 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assigned Deals
              </CardTitle>
              <CreditCard className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dealsstats.assignedDeals}
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </CardContent>
          </Card>

          <Card className="border-l-8 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Un-Assigned Deals
              </CardTitle>
              <CreditCard className="h-5 w-5 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dealsstats.unassignedDeals}
              </div>
              <Link
                href="/dashboard/invoices"
                className="text-sm text-blue-600 hover:underline"
              >
                View Details
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
