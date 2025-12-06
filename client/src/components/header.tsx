import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Building2, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import type { Company } from "@shared/schema";

const routeTitles: Record<string, string> = {
  "/": "Booking",
  "/leaves": "Leaves Entry",
  "/chalan": "Chalan Entry",
  "/chalan/revise": "Chalan Revise",
  "/masters/customers": "Customer Master",
  "/masters/projects": "Project Master",
  "/masters/rooms": "Room Master",
  "/masters/editors": "Editor Master",
  "/reports/conflict": "Conflict Report",
  "/reports/booking": "Booking Report",
  "/reports/editor": "Editor Report",
  "/reports/chalan": "Chalan Report",
  "/utility/user-rights": "User Rights",
  "/utility/users": "User Management",
};

interface HeaderProps {
  title?: string;
  showDatePicker?: boolean;
  showCompanySelector?: boolean;
}

export function Header({ 
  title, 
  showDatePicker = true, 
  showCompanySelector = true 
}: HeaderProps) {
  const { company, setCompany } = useAuth();
  const [liveDateTime, setLiveDateTime] = useState(new Date());
  const [location] = useLocation();

  const pageTitle = title || routeTitles[location] || "PRISM";

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["/api/companies"],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime12Hour = (date: Date) => {
    return format(date, "h:mm:ss a");
  };

  const formatDayOnly = (date: Date) => {
    return format(date, "EEEE");
  };

  const formatDateLocked = (date: Date) => {
    return format(date, "MMMM do, yyyy");
  };

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b header-light-blue px-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      
      <Separator orientation="vertical" className="h-6" />
      
      <span className="font-semibold text-foreground" data-testid="header-page-title">
        {pageTitle}
      </span>
      
      <div className="flex-1" />

      {/* Right side: Day+Time, Date, Company selector, Theme toggle */}
      <div className="flex items-center gap-4">
        {/* Live Day + Time (no box) */}
        <div className="flex items-center gap-1.5 text-sm" data-testid="header-live-time">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {formatDayOnly(liveDateTime)}, {formatTime12Hour(liveDateTime)}
          </span>
        </div>

        {/* Date (no box) */}
        {showDatePicker && (
          <div 
            className="flex items-center gap-1.5 text-sm"
            data-testid="header-locked-date"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDateLocked(liveDateTime)}</span>
          </div>
        )}

        {/* Company Selector - keeps the box styling */}
        {showCompanySelector && companies.length > 0 && (
          <Select 
            value={company?.id?.toString() || ""} 
            onValueChange={(value) => {
              const selected = companies.find(c => c.id.toString() === value);
              setCompany(selected || null);
            }}
          >
            <SelectTrigger className="w-[180px] smooth-hover bg-white/50 dark:bg-white/10" data-testid="header-company-select">
              <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
