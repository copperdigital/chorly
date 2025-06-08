import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (pin: string) => Promise<boolean>;
  title: string;
  description: string;
}

export default function PinModal({ isOpen, onClose, onVerify, title, description }: PinModalProps) {
  const [pin, setPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) return;

    setIsLoading(true);
    setError("");
    
    const isValid = await onVerify(pin);
    
    if (!isValid) {
      setError("Invalid PIN. Please try again.");
      setPin("");
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="text-white text-xl" />
          </div>
          <DialogTitle className="text-xl font-semibold text-slate-800">{title}</DialogTitle>
          <p className="text-slate-600 text-sm mt-2">{description}</p>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex justify-center space-x-3">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                type="password"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-semibold border-2 border-slate-200 focus:border-primary"
                value={pin[index] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.length <= 1 && /^\d*$/.test(value)) {
                    const newPin = pin.split("");
                    newPin[index] = value;
                    setPin(newPin.join(""));
                    
                    // Auto-focus next input
                    if (value && index < 3) {
                      const nextInput = e.target.parentElement?.children[index + 1] as HTMLInputElement;
                      nextInput?.focus();
                    }
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !pin[index] && index > 0) {
                    const prevInput = e.target.parentElement?.children[index - 1] as HTMLInputElement;
                    prevInput?.focus();
                  }
                }}
              />
            ))}
          </div>
          
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
              disabled={pin.length !== 4 || isLoading}
            >
              {isLoading ? "Verifying..." : "Access"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
