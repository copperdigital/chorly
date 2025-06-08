import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { getAvatarClass, getInitial, getAvatarOptions } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import { ArrowLeft, Users, ListTodo, Gift, Plus, Edit, Trash2, Shield, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("people");
  const [showPersonDialog, setShowPersonDialog] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [editingPerson, setEditingPerson] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [editingReward, setEditingReward] = useState<any>(null);
  
  const { household, currentPerson } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Queries
  const { data: people } = useQuery({
    queryKey: ["/api/admin/people", household?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/people/${household?.id}`);
      if (!response.ok) throw new Error('Failed to fetch people');
      return response.json();
    },
    enabled: !!household?.id,
  });

  const { data: tasks } = useQuery({
    queryKey: ["/api/admin/tasks", household?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/tasks/${household?.id}`);
      if (!response.ok) throw new Error('Failed to fetch tasks');
      return response.json();
    },
    enabled: !!household?.id,
  });

  const { data: rewards } = useQuery({
    queryKey: ["/api/admin/rewards", household?.id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/rewards/${household?.id}`);
      if (!response.ok) throw new Error('Failed to fetch rewards');
      return response.json();
    },
    enabled: !!household?.id,
  });

  // Check URL parameters for task editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editTaskId = urlParams.get('editTask');
    
    if (editTaskId && tasks && tasks.length > 0) {
      const taskToEdit = tasks.find((task: any) => task.id === Number(editTaskId));
      if (taskToEdit) {
        setActiveTab('tasks');
        setEditingTask(taskToEdit);
        setShowTaskDialog(true);
        // Clear the URL parameter
        window.history.replaceState({}, '', '/admin');
      }
    }
  }, [tasks]);

  // Mutations
  const createPersonMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/admin/people", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/people"] });
      setShowPersonDialog(false);
      setEditingPerson(null);
      toast({ title: "Person created successfully!" });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await apiRequest("PUT", `/api/admin/people/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/people"] });
      setShowPersonDialog(false);
      setEditingPerson(null);
      toast({ title: "Person updated successfully!" });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert date string to proper format and clean up data
      const taskData = {
        title: data.title,
        description: data.description,
        estimatedMinutes: Number(data.estimatedMinutes),
        points: Number(data.points),
        assignedTo: Number(data.assignedTo),
        isRecurring: Boolean(data.isRecurring),
        recurrenceType: data.isRecurring ? data.recurrenceType : null,
        recurrenceInterval: data.isRecurring ? Number(data.recurrenceInterval) : null,
        customDays: data.isRecurring && data.recurrenceType === "custom" ? Number(data.customDays) : null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        startDate: null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        secondaryAssignees: [],
        isActive: true,
        dueDateType: "by_date",
        priority: 1,
        householdId: Number(data.householdId),
      };
      
      console.log("Sending task data:", taskData);
      const response = await apiRequest("POST", "/api/admin/tasks", taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks", household?.id] });
      setShowTaskDialog(false);
      setEditingTask(null);
      toast({ title: "Task created successfully!" });
    },
    onError: (error: any) => {
      console.error("Task creation error:", error);
      toast({ title: "Failed to create task", description: error.message, variant: "destructive" });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      // Convert date string to proper format and clean up data
      const taskData = {
        title: data.title,
        description: data.description,
        estimatedMinutes: Number(data.estimatedMinutes),
        points: Number(data.points),
        assignedTo: Number(data.assignedTo),
        isRecurring: Boolean(data.isRecurring),
        recurrenceType: data.isRecurring ? data.recurrenceType : null,
        recurrenceInterval: data.isRecurring ? Number(data.recurrenceInterval) : null,
        customDays: data.isRecurring && data.recurrenceType === "custom" ? Number(data.customDays) : null,
        dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
        startDate: null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null,
        secondaryAssignees: [],
        isActive: true,
        dueDateType: "by_date",
        priority: 1,
        householdId: Number(data.householdId),
      };
      
      const response = await apiRequest("PUT", `/api/admin/tasks/${id}`, taskData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks", household?.id] });
      setShowTaskDialog(false);
      setEditingTask(null);
      toast({ title: "Task updated successfully!" });
    },
    onError: (error: any) => {
      console.error("Task update error:", error);
      toast({ title: "Failed to update task", description: error.message, variant: "destructive" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/tasks", household?.id] });
      toast({ title: "Task deleted successfully!" });
    },
  });

  const PersonForm = ({ person, onSubmit }: { person?: any; onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      nickname: person?.nickname || "",
      pin: person?.pin || "",
      isAdmin: person?.isAdmin || false,
      avatar: person?.avatar || "bg-blue-500",
      householdId: household?.id || 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nickname">Nickname</Label>
          <Input
            id="nickname"
            value={formData.nickname}
            onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
            required
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isAdmin"
            checked={formData.isAdmin}
            onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
          />
          <Label htmlFor="isAdmin">Admin privileges</Label>
        </div>
        {formData.isAdmin && (
          <div>
            <Label htmlFor="pin">4-Digit PIN (Admin only)</Label>
            <Input
              id="pin"
              type="password"
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              required
            />
          </div>
        )}
        <div>
          <Label htmlFor="avatar">Avatar Color</Label>
          <Select value={formData.avatar} onValueChange={(value) => setFormData({ ...formData, avatar: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getAvatarOptions().map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-4 h-4 rounded-full", option.class)}></div>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" className="w-full">
          {person ? "Update Person" : "Create Person"}
        </Button>
      </form>
    );
  };

  const TaskForm = ({ task, onSubmit }: { task?: any; onSubmit: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      title: task?.title || "",
      description: task?.description || "",
      estimatedMinutes: task?.estimatedMinutes || 5,
      points: task?.points || 10,
      assignedTo: task?.assignedTo || (people && people.length > 0 ? people[0].id : 0),
      isRecurring: task?.isRecurring || false,
      recurrenceType: task?.recurrenceType || "daily",
      recurrenceInterval: task?.recurrenceInterval || 1,
      customDays: task?.customDays || 7,
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
      endDate: task?.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
      householdId: household?.id || 0,
    });

    // Reset form data when task prop changes
    useEffect(() => {
      setFormData({
        title: task?.title || "",
        description: task?.description || "",
        estimatedMinutes: task?.estimatedMinutes || 5,
        points: task?.points || 10,
        assignedTo: task?.assignedTo || (people && people.length > 0 ? people[0].id : 0),
        isRecurring: task?.isRecurring || false,
        recurrenceType: task?.recurrenceType || "daily",
        recurrenceInterval: task?.recurrenceInterval || 1,
        customDays: task?.customDays || 7,
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : "",
        endDate: task?.endDate ? new Date(task.endDate).toISOString().split('T')[0] : "",
        householdId: household?.id || 0,
      });
    }, [task, people, household?.id]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimatedMinutes">Duration (minutes)</Label>
            <Input
              id="estimatedMinutes"
              type="number"
              min="1"
              value={formData.estimatedMinutes}
              onChange={(e) => setFormData({ ...formData, estimatedMinutes: Number(e.target.value) })}
              required
            />
          </div>
          <div>
            <Label htmlFor="points">Points</Label>
            <Input
              id="points"
              type="number"
              min="1"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: Number(e.target.value) })}
              required
            />
          </div>
        </div>
        <div>
          <Label htmlFor="assignedTo">Assigned To</Label>
          <Select value={String(formData.assignedTo)} onValueChange={(value) => setFormData({ ...formData, assignedTo: Number(value) })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {people?.map((person: any) => (
                <SelectItem key={person.id} value={String(person.id)}>
                  {person.nickname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isRecurring"
            checked={formData.isRecurring}
            onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
          />
          <Label htmlFor="isRecurring">Recurring task</Label>
        </div>
        {formData.isRecurring && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="recurrenceType">Recurrence</Label>
              <Select value={formData.recurrenceType} onValueChange={(value) => setFormData({ ...formData, recurrenceType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="custom">Every X days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {formData.recurrenceType === "custom" && (
              <div>
                <Label htmlFor="customDays">Every X Days</Label>
                <Input
                  id="customDays"
                  type="number"
                  min="1"
                  max="365"
                  value={formData.customDays}
                  onChange={(e) => setFormData({ ...formData, customDays: Number(e.target.value) })}
                  placeholder="e.g., 14 for fortnight"
                />
              </div>
            )}

            <div>
              <Label htmlFor="endDate">End Date (optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                placeholder="Leave empty for indefinite recurrence"
              />
              <p className="text-xs text-slate-500 mt-1">When to stop recurring this task</p>
            </div>

          </div>
        )}
        <Button type="submit" className="w-full">
          {task ? "Update Task" : "Create Task"}
        </Button>
      </form>
    );
  };

  if (!currentPerson?.isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="w-12 h-12 mx-auto text-slate-400 mb-4" />
            <h2 className="text-xl font-semibold text-slate-800 mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">You need admin privileges to access this area.</p>
            <Button onClick={() => setLocation("/")} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => setLocation("/")} className="text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Admin Panel</h1>
                <p className="text-xs text-slate-500">{household?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                getAvatarClass(currentPerson.avatar)
              )}>
                <span className="text-white text-sm font-semibold">
                  {getInitial(currentPerson.nickname)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Admin</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-white rounded-xl p-1 shadow-sm">
            <TabsTrigger value="people" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>People</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <ListTodo className="w-4 h-4" />
              <span>ListTodo</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Family Members</h2>
              <Dialog open={showPersonDialog} onOpenChange={setShowPersonDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingPerson(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Person
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPerson ? "Edit Person" : "Add New Person"}</DialogTitle>
                    <DialogDescription>
                      {editingPerson ? "Edit family member details" : "Add a new family member to your household"}
                    </DialogDescription>
                  </DialogHeader>
                  <PersonForm
                    person={editingPerson}
                    onSubmit={(data) => {
                      if (editingPerson) {
                        updatePersonMutation.mutate({ id: editingPerson.id, data });
                      } else {
                        createPersonMutation.mutate(data);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {people?.map((person: any) => (
                <Card key={person.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center",
                        getAvatarClass(person.avatar)
                      )}>
                        <span className="text-white font-semibold">
                          {getInitial(person.nickname)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">{person.nickname}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {person.isAdmin ? (
                            <Badge variant="default" className="bg-primary">
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <User className="w-3 h-3 mr-1" />
                              Member
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <span>Streak: {person.currentStreak}</span>
                          <span>Points: {person.totalPoints}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPerson(person);
                          setShowPersonDialog(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">ListTodo</h2>
              <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingTask(null)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Task
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingTask ? "Edit Task" : "Add New Task"}</DialogTitle>
                    <DialogDescription>
                      {editingTask ? "Edit task details and scheduling" : "Create a new task with due dates and recurring options"}
                    </DialogDescription>
                  </DialogHeader>
                  <TaskForm
                    task={editingTask}
                    onSubmit={(data) => {
                      if (editingTask) {
                        updateTaskMutation.mutate({ id: editingTask.id, data });
                      } else {
                        createTaskMutation.mutate(data);
                      }
                    }}
                  />
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {tasks?.map((task: any) => (
                <Card key={task.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-slate-800">{task.title}</h3>
                          <Badge variant="outline">{task.points} pts</Badge>
                          {task.isRecurring && (
                            <Badge variant="secondary">{task.recurrenceType}</Badge>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mt-1">{task.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                          <span>{task.estimatedMinutes} min</span>
                          <span>
                            Assigned to: {people?.find((p: any) => p.id === task.assignedTo)?.nickname}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTask(task);
                            setShowTaskDialog(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteTaskMutation.mutate(task.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rewards" className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-slate-800">Rewards</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Reward
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-xl font-semibold text-slate-600 mb-2">Rewards Coming Soon!</h3>
                  <p className="text-slate-500">
                    This feature will allow you to create and manage reward items that family members can claim with their points.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
