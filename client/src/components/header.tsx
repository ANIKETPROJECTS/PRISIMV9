import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Building2, Clock } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
    <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4">
      <SidebarTrigger data-testid="button-sidebar-toggle" />
      
      {/* Left side: Live Time (Day + Time in 12-hour format with seconds) */}
      <div className="flex items-center gap-1.5 text-sm" data-testid="header-live-time">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono font-medium">
          {formatDayOnly(liveDateTime)} {formatTime12Hour(liveDateTime)}
        </span>
      </div>

      {title && (
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      )}

      <div className="flex items-center gap-2 ml-auto">
        {showCompanySelector && companies.length > 0 && (
          <Select 
            value={company?.id?.toString() || ""} 
            onValueChange={(value) => {
              const selected = companies.find(c => c.id.toString() === value);
              setCompany(selected || null);
            }}
          >
            <SelectTrigger className="w-[180px] smooth-hover" data-testid="header-company-select">
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

        {/* Right side: Locked Live Date (no picker, auto-updates at midnight) */}
        {showDatePicker && (
          <div 
            className="flex items-center gap-2 px-3 py-2 border rounded-md bg-muted/30 text-sm smooth-hover cursor-default"
            data-testid="header-locked-date"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{formatDateLocked(liveDateTime)}</span>
          </div>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
