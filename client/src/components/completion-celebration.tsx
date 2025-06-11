import { useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CompletionCelebrationProps {
  show: boolean;
  taskName: string;
  points: number;
  onClose: () => void;
}

export default function CompletionCelebration({ 
  show, 
  taskName, 
  points, 
  onClose 
}: CompletionCelebrationProps) {
  useEffect(() => {
    if (show) {
      // Auto-close after 5 seconds
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center border-0 bg-white rounded-2xl p-8">
        <div className="animate-bounce-gentle">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Great Job!</h3>
          <p className="text-gray-600 mb-4">
            You completed "{taskName}" and earned {points} points!
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg font-bold">
              +{points} pts
            </div>
            <div className="text-2xl">⭐</div>
          </div>
          
          <Button 
            onClick={onClose}
            className="btn-primary px-6 py-3"
          >
            Awesome!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
