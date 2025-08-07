import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  planFilter: string;
  onPlanFilterChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
}

export const SearchAndFilter = ({
  searchTerm,
  onSearchChange,
  planFilter,
  onPlanFilterChange,
  statusFilter,
  onStatusFilterChange,
}: SearchAndFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-center">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search users by name, email, or phone..."
          className="pl-10 h-10 border-gray-300 focus:border-[#7e22ce] focus:ring-[#7e22ce]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      {/* <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="min-w-[150px] h-10 border-gray-300 focus:border-[#7e22ce] focus:ring-[#7e22ce]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
        </SelectContent>
      </Select> */}

      <Select value={planFilter} onValueChange={onPlanFilterChange}>
        <SelectTrigger className="min-w-[180px] h-10 border-gray-300 focus:border-[#7e22ce] focus:ring-[#7e22ce]">
          <div className="flex items-center">
            <SelectValue placeholder="Filter by plan" />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Plans</SelectItem>
          <SelectItem value="free">Free</SelectItem>
          <SelectItem value="Starter">Starter</SelectItem>
          <SelectItem value="Momentum">Momentum</SelectItem>
          <SelectItem value="Pro">Pro</SelectItem>
          <SelectItem value="Elite">Elite</SelectItem>
          <SelectItem value="Power">Power</SelectItem>
          <SelectItem value="Titan">Titan</SelectItem>
          <SelectItem value="vip">VIP</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
