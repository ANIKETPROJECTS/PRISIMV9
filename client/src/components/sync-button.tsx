import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SyncButtonProps {
  queryKeys?: string[];
  onSync?: () => Promise<void>;
  className?: string;
}

export function SyncButton({ queryKeys, onSync, className }: SyncButtonProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleSync = async () => {
    setIsRefreshing(true);
    try {
      if (onSync) {
        await onSync();
      } else if (queryKeys && queryKeys.length > 0) {
        await Promise.all(
          queryKeys.map((key) =>
            queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === "string" &&
                query.queryKey[0].startsWith(key),
            })
          )
        );
      } else {
        await queryClient.invalidateQueries();
      }
      toast({
        title: "Data refreshed",
        description: "Latest data has been loaded.",
        variant: "info",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Could not refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleSync}
      disabled={isRefreshing}
      className={className}
      data-testid="button-sync"
    >
      <RefreshCw
        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
      />
    </Button>
  );
}
