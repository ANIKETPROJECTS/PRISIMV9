import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  History, 
  Calendar, 
  User, 
  Filter, 
  Search,
  ChevronRight,
  Clock,
  FileEdit,
  Plus,
  Trash2,
  RotateCcw,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";

interface HistoryEntry {
  id: number;
  entityType: string;
  entityId: number;
  entityName: string;
  action: string;
  changes: string | null;
  userId: number | null;
  userName: string | null;
  createdAt: string;
}

const ACTION_ICONS: Record<string, typeof Plus> = {
  create: Plus,
  update: FileEdit,
  delete: Trash2,
  cancel: X,
  revision: RotateCcw,
};

const ACTION_COLORS: Record<string, string> = {
  create: "bg-green-500/10 text-green-600 dark:text-green-400",
  update: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  delete: "bg-red-500/10 text-red-600 dark:text-red-400",
  cancel: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  revision: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

function parseChanges(changes: string | null): { field: string; from: string; to: string }[] {
  if (!changes) return [];
  try {
    const parsed = JSON.parse(changes);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([field, value]) => ({
        field,
        from: '-',
        to: String(value),
      }));
    }
  } catch {
    return [{ field: 'details', from: '-', to: changes }];
  }
  return [];
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);

  const queryParams = new URLSearchParams();
  if (entityFilter !== "all") queryParams.set("entityType", entityFilter);
  if (actionFilter !== "all") queryParams.set("action", actionFilter);
  if (dateFrom) queryParams.set("from", dateFrom);
  if (dateTo) queryParams.set("to", dateTo);
  const queryString = queryParams.toString();

  const { data: historyData = [], isLoading } = useQuery<HistoryEntry[]>({
    queryKey: ["/api/history", entityFilter, actionFilter, dateFrom, dateTo],
    queryFn: async () => {
      const url = queryString ? `/api/history?${queryString}` : "/api/history";
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch history");
      return res.json();
    },
  });

  const filteredHistory = historyData.filter(entry => {
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch = 
        entry.entityName?.toLowerCase().includes(searchLower) ||
        entry.action?.toLowerCase().includes(searchLower) ||
        entry.userName?.toLowerCase().includes(searchLower) ||
        entry.entityType?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    if (entityFilter !== "all" && entry.entityType !== entityFilter) return false;
    if (actionFilter !== "all" && entry.action !== actionFilter) return false;
    return true;
  });

  const groupedByDate = filteredHistory.reduce((acc, entry) => {
    const date = format(new Date(entry.createdAt), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, HistoryEntry[]>);

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => b.localeCompare(a));

  const entityTypes = [...new Set(historyData.map(e => e.entityType))];
  const actionTypes = [...new Set(historyData.map(e => e.action))];

  const clearFilters = () => {
    setSearch("");
    setEntityFilter("all");
    setActionFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters = search || entityFilter !== "all" || actionFilter !== "all" || dateFrom || dateTo;

  return (
    <div className="flex flex-col h-full">
      <Header title="Activity History" />

      <div className="flex-1 p-6 overflow-hidden flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="button-clear-filters">
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, user, or type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-history-search"
                />
              </div>
              <Select value={entityFilter} onValueChange={setEntityFilter}>
                <SelectTrigger data-testid="select-entity-type">
                  <SelectValue placeholder="Entity Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entities</SelectItem>
                  {entityTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger data-testid="select-action-type">
                  <SelectValue placeholder="Action Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map(action => (
                    <SelectItem key={action} value={action}>
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                  data-testid="input-date-from"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredHistory.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity found"
              description={hasActiveFilters 
                ? "Try adjusting your filters to see more results."
                : "Activity history will appear here as changes are made."}
            />
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6">
                {sortedDates.map(date => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-3 sticky top-0 bg-background py-2 z-10">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold text-muted-foreground">
                        {format(new Date(date), "EEEE, MMMM d, yyyy")}
                      </span>
                      <Badge variant="secondary" className="ml-2">
                        {groupedByDate[date].length} changes
                      </Badge>
                    </div>
                    <div className="space-y-2 pl-6 border-l-2 border-muted ml-2">
                      {groupedByDate[date].map(entry => {
                        const ActionIcon = ACTION_ICONS[entry.action] || FileEdit;
                        const actionColor = ACTION_COLORS[entry.action] || ACTION_COLORS.update;
                        
                        return (
                          <Card 
                            key={`${entry.entityType}-${entry.id}`}
                            className="cursor-pointer hover-elevate"
                            onClick={() => setSelectedEntry(entry)}
                            data-testid={`history-entry-${entry.id}`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center gap-4">
                                <div className={`p-2 rounded-full ${actionColor}`}>
                                  <ActionIcon className="h-4 w-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="font-medium">{entry.entityName || `${entry.entityType} #${entry.entityId}`}</span>
                                    <Badge variant="outline" className="text-xs">
                                      {entry.entityType}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs capitalize">
                                      {entry.action}
                                    </Badge>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {format(new Date(entry.createdAt), "h:mm a")}
                                    </span>
                                    {entry.userName && (
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {entry.userName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      <Dialog open={!!selectedEntry} onOpenChange={() => setSelectedEntry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Change Details
            </DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Entity</p>
                  <p className="font-medium">{selectedEntry.entityName || `${selectedEntry.entityType} #${selectedEntry.entityId}`}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge variant="outline">{selectedEntry.entityType}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Action</p>
                  <Badge variant="secondary" className="capitalize">{selectedEntry.action}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-medium">{format(new Date(selectedEntry.createdAt), "PPpp")}</p>
                </div>
                {selectedEntry.userName && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Changed By</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {selectedEntry.userName}
                    </p>
                  </div>
                )}
              </div>

              {selectedEntry.changes && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Changes</p>
                  <div className="bg-muted rounded-md p-3 space-y-2">
                    {parseChanges(selectedEntry.changes).map((change, i) => (
                      <div key={i} className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="font-medium">{change.field}:</span>
                        {change.from !== '-' && (
                          <>
                            <span className="text-red-500 line-through">{change.from}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </>
                        )}
                        <span className="text-green-600 dark:text-green-400">{change.to}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
