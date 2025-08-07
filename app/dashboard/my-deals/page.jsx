// app/dashboard/mydeals/page.jsx
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, FileText, Search, Loader2, Filter, ArrowDownWideNarrow, ChevronDown } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import { Input } from "@/components/ui/input";
import { showToast } from "@/hooks/useToast";
import PaginationBar from "../_components/Pagination";

export default function MyDeals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userUid, setUserUid] = useState(null);

  // Pagination state
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / limit);

  // State for the "Claim" button
  const [assigningId, setAssigningId] = useState(null);
  const [refresh, setRefresh] = useState(null);

  // Placeholder states for filter dropdowns
  const [filterByUser, setFilterByUser] = useState(null);
  const [sortByDate, setSortByDate] = useState(null);
  const [sortByStatus, setSortByStatus] = useState(null);

  // Fetch the current user on component mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabaseBrowser.auth.getUser();
      setUserUid(user?.id || null);
    };
    fetchUser();
  }, []);

  // Function to fetch deals from Supabase with pagination and search
  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabaseBrowser
        .from('deals')
        .select('*', { count: "exact" })
        .order("created_at", { ascending: false });

      // Add a search filter if a search term is present
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,appId.ilike.%${searchTerm}%`);
      }

      // Add pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        setDeals(data);
        setTotal(count || 0);
      }
    } catch (error) {
      console.error("Error fetching deals:", error.message);
      setError("Failed to fetch deals. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, page, limit]);

  // Fetch deals on initial load and whenever dependencies change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDeals();
    }, 500);

    return () => clearTimeout(handler);
  }, [fetchDeals, refresh]);

  // Filter deals into assigned and unassigned after fetching
  const myAssignedDeals = useMemo(
    () => deals.filter(deal => deal.assigned_to === userUid),
    [deals, userUid]
  );
  
  // This is the updated logic to filter unassigned deals with 'initial' status
  const unassignedDeals = useMemo(
    () => deals.filter(deal =>  deal.status === "initial"),
    [deals]
  );

  // Helper function to format the status with a specific color
  const getStatusClasses = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Negotiation":
        return "bg-yellow-100 text-yellow-800";
      case "Assigned":
      case "Received":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle the 'Claim' action for unassigned deals
  const handleClaimDeal = async (deal) => {
    if (assigningId || !userUid) {
      return;
    }

    setAssigningId(deal.id);

    try {
      const { error } = await supabaseBrowser
        .from('deals')
        .update({
          assigned_to: userUid,
          status: "Assigned",
          updated_at: new Date().toISOString(),
          assigned_date: new Date().toISOString(),
        })
        .eq('id', deal.id);

      if (error) {
        throw error;
      }

      showToast({ title: "Success", description: "Deal claimed successfully!" });
      setAssigningId(null);
      setRefresh(Math.random());
    } catch (error) {
      console.error("Error claiming deal:", error.message);
      showToast({
        type: "error",
        title: "Assignment Failed",
        description: error.message || "Failed to claim deal. Please try again.",
      });
      setAssigningId(null);
    }
  };

  const renderDealTable = (deals, isAssigned) => (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md w-full">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Application/Deal Title
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Application ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {isAssigned ? "Date Assigned" : "Date Received"}
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {isAssigned ? "Current Status" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {deals.map(deal => (
            <tr key={deal.id} className="hover:bg-gray-50">
              <td className="break-words px-6 py-4 text-sm font-medium text-gray-900">{deal?.customer_name}</td>
              <td className="px-6 py-4 break-words text-sm text-gray-900">{deal?.deal_id}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span className="flex items-center">
                    <Calendar size={16} className="mr-1 text-blue-500" />
                    {new Date(deal?.created_at || "").toLocaleDateString()}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {isAssigned ? (
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(deal.status)}`}>
                    {deal.status}
                  </span>
                ) : (
                  <button
                    className={`p-2 rounded-md shadow-md text-white ${
                      assigningId === deal.id
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-500 hover:bg-blue-600"
                    }`}
                    onClick={() => handleClaimDeal(deal)}
                    disabled={assigningId === deal.id}
                  >
                    {assigningId === deal.id
                      ? "Assigning..."
                      : "Claim Deal"}
                  </button>
                )}
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
  );

  if (loading && deals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">
          Loading Deals...
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          Please wait while we fetch the latest deals for you.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-white p-4 md:p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Deal Assignments</h1>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search deals by title or ID"
              className="pl-9 pr-4 py-2 border rounded-md w-full"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              disabled={loading && deals.length === 0}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg border hover:bg-gray-200">
                <span>Filter by User</span>
                <ChevronDown size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg border hover:bg-gray-200">
                <span>Sort by Date</span>
                <ChevronDown size={16} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg border hover:bg-gray-200">
                <span>Sort by Status</span>
                <ChevronDown size={16} />
            </button>
        </div>

        {deals.length === 0 && !loading && !error ? (
          <div className="flex flex-col justify-center items-center text-gray-900 p-6 border rounded-lg bg-gray-50 mt-8">
            <FileText className="w-16 h-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Deals Found</h2>
            <p className="text-gray-500 text-center max-w-md">
              It looks like there are no deals matching your criteria.
            </p>
          </div>
        ) : (
          <>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Deals</h2>
              {myAssignedDeals.length > 0 ? (
                renderDealTable(myAssignedDeals, true)
              ) : (
                <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
                  No assigned deals found for you.
                </div>
              )}
            </div>

            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Unassigned Deals</h2>
              {unassignedDeals.length > 0 ? (
                renderDealTable(unassignedDeals, false)
              ) : (
                <div className="p-4 bg-white rounded-lg shadow-md text-center text-gray-500">
                  No unassigned deals found with 'initial' status.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
