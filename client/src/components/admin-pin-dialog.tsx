import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Shield } from "lucide-react";

interface AdminPinDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminPinDialog({ open, onClose, onSuccess }: AdminPinDialogProps) {
  const [pin, setPin] = useState("");
  const [, setLocation] = useLocation();
  const { authenticateAdmin, isAuthenticatingAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length >= 4) {
      try {
        await authenticateAdmin(pin);
        onClose();
        setPin("");
        if (onSuccess) {
          onSuccess();
        } else {
          setLocation("/admin");
        }
      } catch (error) {
        // Error is handled by the hook
      }
    }
  };

  const handleClose = () => {
    setPin("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span>Admin Access</span>
          </DialogTitle>
          <DialogDescription>
            Enter your admin PIN to access family management settings.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adminPin">Admin PIN</Label>
            <Input
              id="adminPin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter 4-digit PIN"
              className="h-12 text-center text-xl tracking-widest"
              maxLength={4}
              autoFocus
            />
            <p className="text-xs text-gray-500 text-center">
              Default PIN is 1234
            </p>
          </div>
          
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pin.length < 4 || isAuthenticatingAdmin}
              className="flex-1 btn-primary"
            >
              {isAuthenticatingAdmin ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Verifying...</span>
                </div>
              ) : (
                "Access Admin"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
