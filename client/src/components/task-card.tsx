import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/utils";
import { Clock, Check, Lock, Plus, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";

interface TaskCardProps {
  taskInstance: {
    id: number;
    isCompleted: boolean;
    isSecondary: boolean;
    pointsEarned: number;
    task: {
      id: number;
      title: string;
      description: string;
      estimatedMinutes: number;
      points: number;
      isRecurring: boolean;
    };
  };
  onComplete: () => void;
  onEdit?: (taskId: number) => void;
  isLoading?: boolean;
  canComplete?: boolean;
  isSecondary?: boolean;
  primaryComplete?: boolean;
  lastCompletedDate?: string;
}

export default function TaskCard({
  taskInstance,
  onComplete,
  onEdit,
  isLoading = false,
  canComplete = true,
  isSecondary = false,
  primaryComplete = false,
  lastCompletedDate,
}: TaskCardProps) {
  const { task, isCompleted } = taskInstance;
  const points = isSecondary ? Math.floor(task.points * 0.5) : task.points;
  const { currentPerson } = useAuth();

  return (
    <div className={cn(
      "flex items-center space-x-4 p-4 rounded-lg transition-colors",
      isCompleted 
        ? "bg-slate-50" 
        : canComplete 
          ? "bg-white border-2 border-dashed border-primary hover:bg-slate-50" 
          : "bg-slate-50 opacity-50"
    )}>
      <Button
        size="sm"
        variant="ghost"
        className={cn(
          "w-6 h-6 rounded-full border-2 p-0",
          isCompleted
            ? "border-secondary bg-secondary text-white"
            : canComplete
              ? "border-primary bg-white hover:bg-primary hover:text-white"
              : "border-slate-300 bg-white cursor-not-allowed"
        )}
        onClick={onComplete}
        disabled={!canComplete || isCompleted || isLoading}
      >
        {isCompleted ? (
          <Check className="w-3 h-3" />
        ) : canComplete ? (
          <Plus className="w-3 h-3" />
        ) : (
          <Lock className="w-3 h-3 text-slate-400" />
        )}
      </Button>

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className={cn(
              "font-medium",
              isCompleted 
                ? "line-through text-slate-500" 
                : "text-slate-800"
            )}>
              {task.title}
            </h4>
          </div>
          {currentPerson?.isAdmin && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task.id);
              }}
              className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <Badge 
            variant={isCompleted ? "secondary" : "outline"}
            className={cn(
              "text-xs font-medium",
              isCompleted 
                ? "bg-secondary/10 text-secondary" 
                : isSecondary
                  ? "bg-accent/10 text-accent"
                  : "bg-primary/10 text-primary"
            )}
          >
            +{points} pts
          </Badge>
          {task.isRecurring && lastCompletedDate && (
            <span className="text-xs text-slate-400">
              Last: {new Date(lastCompletedDate).toLocaleDateString()}
            </span>
          )}
        </div>
        
        {task.description && (
          <p className="text-sm text-slate-500 mt-1">{task.description}</p>
        )}
        
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-slate-400 flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {formatDuration(task.estimatedMinutes)}
          </span>
          
          <span className={cn(
            "text-xs font-medium",
            isCompleted 
              ? "text-secondary" 
              : canComplete 
                ? "text-primary" 
                : "text-slate-400"
          )}>
            {isCompleted 
              ? "✓ Completed" 
              : canComplete 
                ? "Tap to complete" 
                : isSecondary && !primaryComplete
                  ? "Complete primary tasks first"
                  : "Not available"}
          </span>
        </div>
      </div>
    </div>
  );
}
