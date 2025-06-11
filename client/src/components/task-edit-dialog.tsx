import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AdminPinDialog from "./admin-pin-dialog";

interface TaskEditDialogProps {
  task: any;
  open: boolean;
  onClose: () => void;
}

export default function TaskEditDialog({ task, open, onClose }: TaskEditDialogProps) {
  const { toast } = useToast();
  const { household } = useAuth();
  const queryClient = useQueryClient();
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const { data: familyMembers = [] } = useQuery({
    queryKey: ["/api/family-members"],
  });

  const [editTask, setEditTask] = useState({
    name: "",
    description: "",
    points: "",
    estimatedMinutes: "",
    scheduleType: "daily" as "daily" | "weekly" | "monthly" | "custom",
    scheduleValue: "",
    endDate: "",
    startDate: "",
    assigneeIds: [] as number[],
  });

  useEffect(() => {
    if (task && open) {
      setEditTask({
        name: task.name || "",
        description: task.description || "",
        points: task.points?.toString() || "",
        estimatedMinutes: task.estimatedMinutes?.toString() || "",
        scheduleType: task.scheduleType || "daily",
        scheduleValue: task.scheduleValue?.toString() || "",
        endDate: task.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
        startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : "",
        assigneeIds: task.assignees?.map((a: any) => a.id) || [],
      });
    }
  }, [task, open]);

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", `/api/tasks/${task.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/all"] });
      toast({ title: "Success", description: "Task updated!" });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is admin or needs PIN verification
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    if (!session.isAdmin && !isAdmin) {
      setShowPinDialog(true);
      return;
    }

    updateTaskMutation.mutate({
      ...editTask,
      points: editTask.points ? parseInt(editTask.points) : 0,
      estimatedMinutes: editTask.estimatedMinutes ? parseInt(editTask.estimatedMinutes) : 0,
      scheduleValue: editTask.scheduleValue ? parseInt(editTask.scheduleValue) : null,
      startDate: new Date(editTask.startDate),
      endDate: editTask.endDate ? new Date(editTask.endDate) : null,
      assigneeIds: editTask.assigneeIds,
    });
  };

  const handlePinSuccess = () => {
    setIsAdmin(true);
    setShowPinDialog(false);
    // Update session storage to remember admin status
    const session = JSON.parse(sessionStorage.getItem('session') || '{}');
    session.isAdmin = true;
    sessionStorage.setItem('session', JSON.stringify(session));
    
    // Retry the submission
    updateTaskMutation.mutate({
      ...editTask,
      points: editTask.points ? parseInt(editTask.points) : 0,
      estimatedMinutes: editTask.estimatedMinutes ? parseInt(editTask.estimatedMinutes) : 0,
      scheduleValue: editTask.scheduleValue ? parseInt(editTask.scheduleValue) : null,
      startDate: new Date(editTask.startDate),
      endDate: editTask.endDate ? new Date(editTask.endDate) : null,
      assigneeIds: editTask.assigneeIds,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskName">Task Name *</Label>
              <Input
                id="taskName"
                value={editTask.name}
                onChange={(e) => setEditTask({ ...editTask, name: e.target.value })}
                placeholder="Make bed"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskDescription">Description</Label>
              <Textarea
                id="taskDescription"
                value={editTask.description}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                placeholder="Straighten sheets, fluff pillows, organize room"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taskPoints">Points</Label>
                <Input
                  id="taskPoints"
                  type="number"
                  value={editTask.points}
                  onChange={(e) => setEditTask({ ...editTask, points: e.target.value })}
                  placeholder="25"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskMinutes">Time (minutes)</Label>
                <Input
                  id="taskMinutes"
                  type="number"
                  value={editTask.estimatedMinutes}
                  onChange={(e) => setEditTask({ ...editTask, estimatedMinutes: e.target.value })}
                  placeholder="10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule</Label>
              <Select 
                value={editTask.scheduleType}
                onValueChange={(value: any) => setEditTask({ ...editTask, scheduleType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editTask.scheduleType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="scheduleValue">Every X days</Label>
                <Input
                  id="scheduleValue"
                  type="number"
                  value={editTask.scheduleValue}
                  onChange={(e) => setEditTask({ ...editTask, scheduleValue: e.target.value })}
                  placeholder="3"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={editTask.startDate}
                onChange={(e) => setEditTask({ ...editTask, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={editTask.endDate}
                onChange={(e) => setEditTask({ ...editTask, endDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Assign to Family Members</Label>
              <div className="grid grid-cols-2 gap-2">
                {familyMembers.map((member: any) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`assignee-${member.id}`}
                      checked={editTask.assigneeIds.includes(member.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setEditTask({
                            ...editTask,
                            assigneeIds: [...editTask.assigneeIds, member.id]
                          });
                        } else {
                          setEditTask({
                            ...editTask,
                            assigneeIds: editTask.assigneeIds.filter(id => id !== member.id)
                          });
                        }
                      }}
                    />
                    <Label
                      htmlFor={`assignee-${member.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {member.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateTaskMutation.isPending}>
                {updateTaskMutation.isPending ? "Updating..." : "Update Task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AdminPinDialog
        open={showPinDialog}
        onClose={() => setShowPinDialog(false)}
        onSuccess={handlePinSuccess}
      />
    </>
  );
}