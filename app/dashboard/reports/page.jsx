// app/dashboard/reports/page.jsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, File, UserPlus, UserMinus, ArrowLeft, FileDown } from "lucide-react";
import moment from "moment";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Register all necessary Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const sharedChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
    },
  },
};

export default function ReportsPage() {
  const [reportsList, setReportsList] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [kpiStats, setKpiStats] = useState({
    totalApplications: 0,
    assignedApplications: 0,
    unassignedApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [reportType, setReportType] = useState("all");
  
  const reportRef = useRef(null);

  /**
   * Fetches the initial KPI stats from the applications table.
   * This is shown on the main report list view.
   */
  const fetchInitialKpiStats = async () => {
  try {
    // Fetch total count of all applications
    const { count: totalApplications, error: totalError } = await supabaseBrowser
      .from("applications")
      .select("id", { count: "exact", head: true });

    // Fetch count of assigned applications (where assigned_to is not null)
    const { count: assignedApplications, error: assignedError } = await supabaseBrowser
      .from("applications")
      .select("id", { count: "exact", head: true })
      .not("assigned_to", "is", null);

    if (totalError || assignedError) {
      console.error("Error fetching initial KPI stats:", totalError || assignedError);
      return;
    }

    const unassignedApplications = totalApplications - assignedApplications;

    setKpiStats({
      totalApplications,
      assignedApplications,
      unassignedApplications,
    });

  } catch (error) {
    console.error("Error in fetchInitialKpiStats:", error);
  }
};

  /**
   * Fetches the list of pre-generated reports from the 'cron_reports' table.
   */
  const fetchReportsList = async () => {
    setLoading(true);
    try {
      const supabase = supabaseBrowser; 
      let query = supabase.from("cron_reports").select("*");

      if (reportType !== "all") {
        query = query.eq('type', reportType);
      }
      
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching reports from Supabase:", error.message);
        setReportsList([]);
      } else {
        setReportsList(data || []);
      }
    } catch (error) {
      console.error("Error in fetchReportsList:", error);
      setReportsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialKpiStats();
    fetchReportsList();
  }, [reportType]);

  const handleReportClick = (report) => {
    setSelectedReport(report);
  };
  
  const handleExportPdf = async () => {
    if (!reportRef.current) return;
    setIsExporting(true);
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const reportDate = moment(selectedReport.created_at).format('DD-MM-YYYY');
    pdf.save(`${selectedReport.type.replace(/\s/g, '-')}-${reportDate}.pdf`);
    setIsExporting(false);
  };

  /**
   * Renders the KPI cards with data from the selected report (detailed view)
   * or initial stats (list view).
   */
  const renderKpiCards = (stats) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <Card className="border-l-6 border-l-yellow-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
          <File className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalApplications ?? 0}</div>
        </CardContent>
      </Card>
      <Card className="border-l-6 border-l-green-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Assigned Applications</CardTitle>
          <UserPlus className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.assignedApplications ?? 0}</div>
        </CardContent>
      </Card>
      <Card className="border-l-6 border-l-red-500 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Un-assigned Applications</CardTitle>
          <UserMinus className="h-5 w-5 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.unassignedApplications ?? 0}</div>
        </CardContent>
      </Card>
    </div>
  );

  const pieChartOptions = {
    ...sharedChartOptions,
    plugins: {
      ...sharedChartOptions.plugins,
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const total = context.dataset.data.reduce((sum, value) => sum + value, 0);
            const currentValue = context.raw;
            const percentage = total > 0 ? ((currentValue / total) * 100).toFixed(1) : 0;
            return `${label}: ${currentValue} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="p-4 md:p-6 min-h-screen">
      {!selectedReport ? (
        // Report List View
        <>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
            <div className="flex space-x-2">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {renderKpiCards(kpiStats)}
          {loading ? (
            <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-sm">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-4">
              {reportsList.length > 0 ? (
                reportsList.map((report) => (
                  <Card
                    key={report.id}
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
                    onClick={() => handleReportClick(report)}
                  >
                    <CardContent className="flex items-center p-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                        report.type === 'weekly' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {report.type} Report
                      </span>
                      <span className="ml-4 text-sm font-medium text-gray-700">{report.data.date_range}</span>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center text-gray-500 mt-10">No reports found.</div>
              )}
            </div>
          )}
        </>
      ) : (
        // Detailed Report View
        <div ref={reportRef} className=" p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button 
                className="p-2 mr-4 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setSelectedReport(null)}
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800 capitalize">
                  {selectedReport.type} Report
                </h1>
                <span className="ml-0 text-sm text-gray-500">{selectedReport.data.date_range}</span>
              </div>
            </div>
            <Button 
              onClick={handleExportPdf} 
              disabled={isExporting}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition-colors duration-200"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export as PDF
                </>
              )}
            </Button>
          </div>

          {renderKpiCards({
            totalApplications: selectedReport.data.total_applications_count,
            assignedApplications: selectedReport.data.assigned_applications_count,
            unassignedApplications: selectedReport.data.unassigned_applications_count,
          })}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 shadow-sm">
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <Bar data={selectedReport.data.charts_data.bar} options={{ ...sharedChartOptions, title: { display: true, text: "Applications Over Time" } }} />
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Assigned vs Un-assigned</CardTitle>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <Pie data={selectedReport.data.charts_data.pie} options={pieChartOptions} />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}