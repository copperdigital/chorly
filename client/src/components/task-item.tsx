import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type TaskWithAssignees } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Calendar, Users, Check, AlertTriangle, Edit3 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import AdminPinDialog from "./admin-pin-dialog";
import TaskEditDialog from "./task-edit-dialog";

interface TaskItemProps {
  task: TaskWithAssignees;
  showDoneButton: boolean;
  onComplete: (taskName: string, points: number) => void;
  isAdmin?: boolean;
}

export default function TaskItem({ task, showDoneButton, onComplete, isAdmin = false }: TaskItemProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const completeMutation = useMutation({
    mutationFn: () => apiRequest("POST", `/api/tasks/${task.id}/complete`, {
      dueDate: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      queryClient.invalidateQueries({ queryKey: ["/api/leaderboard"] });
      onComplete(task.name, task.points);
      toast({
        title: "Task completed!",
        description: `You earned ${task.points} points for completing "${task.name}"!`,
      });
    },
  });

  // Calculate if task is overdue
  const today = new Date();
  const taskDate = new Date(task.createdAt);
  const daysOverdue = differenceInDays(today, taskDate);
  const isOverdue = daysOverdue > 0 && !task.isCompleted;
  const isCompleted = task.isCompleted || false;

  return (
    <>
      <Card className={`relative overflow-hidden transition-all duration-300 ${
        isCompleted ? 'bg-green-50 border-green-200' : 
        isOverdue ? 'bg-red-50 border-red-200' : 
        'bg-white border-gray-200 hover:shadow-md'
      }`}>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1 pr-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isCompleted ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {task.name}
                    {isCompleted && <span className="ml-2 text-green-600">✓</span>}
                    {isOverdue && <span className="ml-2 text-red-500">⚠️</span>}
                  </h3>
                  
                  {task.description && (
                    <p className="text-gray-600 text-sm mb-3 leading-relaxed">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex -space-x-2">
                    {task.assignees.map((assignee: any, index: number) => (
                      <div
                        key={assignee.id}
                        className="relative group"
                        style={{ zIndex: task.assignees.length - index }}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white shadow-md flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: assignee.color }}
                        >
                          {assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 whitespace-nowrap">
                          {assignee.name}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center space-x-1 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="capitalize">{task.scheduleType}</span>
                  {task.scheduleValue && task.scheduleType === 'custom' && (
                    <span>(every {task.scheduleValue} days)</span>
                  )}
                </div>

                {task.estimatedMinutes > 0 && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimatedMinutes} min</span>
                  </div>
                )}

                {isOverdue && (
                  <div className="flex items-center space-x-1 text-red-600 font-medium">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{daysOverdue} day{daysOverdue === 1 ? '' : 's'} overdue</span>
                  </div>
                )}

                {isCompleted && task.completedBy && task.completedAt && (
                  <div className="text-green-600 text-xs">
                    Completed by {task.completedBy.name} on {format(new Date(task.completedAt), 'MMM d')}
                  </div>
                )}
              </div>
            </div>

            <div className="text-right">
              <div className={`text-lg font-bold mb-2 ${
                isCompleted ? 'text-green-600' : isOverdue ? 'text-red-600' : 'text-blue-600'
              }`}>
                +{task.points} pts
              </div>
              
              {task.endDate && (
                <div className="text-xs text-gray-500 mb-2">
                  End: {new Date(task.endDate).toLocaleDateString()}
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isAdmin) {
                      setShowEditDialog(true);
                    } else {
                      setShowAdminDialog(true);
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Edit3 className="w-4 h-4" />
                </Button>

                {showDoneButton && !isCompleted && (
                  <Button
                    onClick={() => completeMutation.mutate()}
                    disabled={completeMutation.isPending}
                    className="btn-success flex items-center space-x-1"
                  >
                    {completeMutation.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{completeMutation.isPending ? 'Completing...' : 'DONE'}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AdminPinDialog
        open={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
        onSuccess={() => {
          setShowAdminDialog(false);
          setShowEditDialog(true);
        }}
      />

      <TaskEditDialog
        task={task}
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
      />
    </>
  );
}