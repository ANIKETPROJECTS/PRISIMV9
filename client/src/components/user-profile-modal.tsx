import { useQuery } from "@tanstack/react-query";
import { User, Mail, Phone, Building2, Shield, X, Clock, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth-context";

interface UserProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileModal({ open, onOpenChange }: UserProfileModalProps) {
  const { user, company } = useAuth();
  const [, setLocation] = useLocation();

  interface UserProfile {
    fullName?: string;
    email?: string;
    mobile?: string;
    lastLogin?: string;
  }

  const { data: userProfile } = useQuery<UserProfile>({
    queryKey: ["/api/users", user?.id, "profile"],
    enabled: !!user?.id && open,
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Admin</Badge>;
      case "gst":
        return <Badge variant="secondary">GST</Badge>;
      case "non_gst":
        return <Badge variant="outline">Non-GST</Badge>;
      default:
        return null;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge variant="default" className="bg-green-600">Active</Badge>
    ) : (
      <Badge variant="secondary">Inactive</Badge>
    );
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleGoToUserManagement = () => {
    onOpenChange(false);
    setLocation("/utility/users");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Profile
          </DialogTitle>
          <DialogDescription>
            View your profile information
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-2xl font-medium bg-primary/10 text-primary">
              {user?.username?.slice(0, 2).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-semibold">{user?.username}</h3>
              {user?.role && getRoleBadge(user.role)}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span>{company?.name || "No company"}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Username</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{user?.username || "-"}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Full Name</label>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userProfile?.fullName || "-"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Role</label>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">{user?.role || "-"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Company</label>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{company?.name || "-"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Mobile Number</label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userProfile?.mobile || "-"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email</label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userProfile?.email || "-"}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">User Status</label>
              <div className="flex items-center gap-2">
                {getStatusBadge(user?.isActive ?? true)}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Last Login</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{userProfile?.lastLogin || "Current session"}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            data-testid="button-close-profile"
          >
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button
            type="button"
            onClick={handleGoToUserManagement}
            data-testid="button-goto-user-management"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
