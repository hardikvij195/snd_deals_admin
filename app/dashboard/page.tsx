"use client";
import React, { useEffect, useState } from "react";
import { User, File, RatioIcon } from "lucide-react";
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

  return (
    <div className="flex min-h-screen ">
      <main className="flex-1 ">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-md shadow">
            <div className="flex items-center gap-2 mb-2">
              <File className="text-blue-500" />
              <span className="font-semibold">Applications</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalApplications}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
