import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Users, CheckSquare, Gift, Settings, Edit } from "lucide-react";
import TaskEditDialog from "@/components/task-edit-dialog";

export default function Admin() {
  const [, setLocation] = useLocation();
  const { household } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: familyMembers = [] } = useQuery({
    queryKey: ["/api/family-members"],
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks/all"],
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ["/api/rewards"],
  });

  // New member form
  const [newMember, setNewMember] = useState({
    name: "",
    role: "child" as "parent" | "child",
    color: "#6366F1",
    age: "",
  });

  // Edit task state
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // New task form  
  const [newTask, setNewTask] = useState({
    name: "",
    description: "",
    points: "",
    estimatedMinutes: "",
    scheduleType: "daily" as "daily" | "weekly" | "monthly" | "custom",
    scheduleValue: "",
    endDate: "",
    startDate: new Date().toISOString().split('T')[0],
    assigneeIds: [] as number[],
  });

  // New reward form
  const [newReward, setNewReward] = useState({
    name: "",
    description: "",
    pointsCost: "",
  });

  // Household settings form
  const [householdSettings, setHouseholdSettings] = useState({
    name: household?.name || "",
    adminPin: "",
  });

  // Mutations
  const createMemberMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/family-members", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      setNewMember({ name: "", role: "child", color: "#6366F1", age: "" });
      toast({ title: "Success", description: "Family member added!" });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/family-members/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/family-members"] });
      toast({ title: "Success", description: "Family member removed." });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/tasks", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks/all"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setNewTask({
        name: "", description: "", points: "", estimatedMinutes: "",
        scheduleType: "daily", scheduleValue: "", endDate: "", 
        startDate: new Date().toISOString().split('T')[0], assigneeIds: []
      });
      toast({ title: "Success", description: "Task created!" });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Success", description: "Task deleted." });
    },
  });

  const createRewardMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/rewards", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rewards"] });
      setNewReward({ name: "", description: "", pointsCost: "" });
      toast({ title: "Success", description: "Reward created!" });
    },
  });

  const updateHouseholdMutation = useMutation({
    mutationFn: (data: any) => apiRequest("PATCH", "/api/household", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/session"] });
      toast({ title: "Success", description: "Household settings updated!" });
    },
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    createMemberMutation.mutate({
      ...newMember,
      age: newMember.age ? parseInt(newMember.age) : null,
    });
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    // Force today's date if no start date is provided
    const startDate = newTask.startDate || new Date().toISOString().split('T')[0];
    
    createTaskMutation.mutate({
      ...newTask,
      points: newTask.points ? parseInt(newTask.points) : 0,
      estimatedMinutes: newTask.estimatedMinutes ? parseInt(newTask.estimatedMinutes) : 0,
      scheduleValue: newTask.scheduleValue ? parseInt(newTask.scheduleValue) : null,
      startDate: new Date(startDate),
      endDate: newTask.endDate ? new Date(newTask.endDate) : null,
    });
  };

  const handleCreateReward = (e: React.FormEvent) => {
    e.preventDefault();
    createRewardMutation.mutate({
      ...newReward,
      pointsCost: parseInt(newReward.pointsCost),
    });
  };

  const handleUpdateHousehold = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {};
    if (householdSettings.name) updateData.name = householdSettings.name;
    if (householdSettings.adminPin) updateData.adminPin = householdSettings.adminPin;
    
    if (Object.keys(updateData).length > 0) {
      updateHouseholdMutation.mutate(updateData);
    }
  };

  const colors = [
    "#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", 
    "#10B981", "#06B6D4", "#84CC16", "#F97316", "#6B7280"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => setLocation("/")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-500">{household?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Members</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="rewards" className="flex items-center space-x-2">
              <Gift className="w-4 h-4" />
              <span>Rewards</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>

          {/* Family Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Member */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Add Family Member</span>
                  </CardTitle>
                  <CardDescription>
                    Add a new member to your family household
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="memberName">Name</Label>
                      <Input
                        id="memberName"
                        value={newMember.name}
                        onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                        placeholder="Emma Johnson"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="memberRole">Role</Label>
                      <Select 
                        value={newMember.role}
                        onValueChange={(value: "parent" | "child") => setNewMember({ ...newMember, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Parent</SelectItem>
                          <SelectItem value="child">Child</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="memberAge">Age (optional)</Label>
                      <Input
                        id="memberAge"
                        type="number"
                        value={newMember.age}
                        onChange={(e) => setNewMember({ ...newMember, age: e.target.value })}
                        placeholder="12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex flex-wrap gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewMember({ ...newMember, color })}
                            className={`w-8 h-8 rounded-full border-2 ${
                              newMember.color === color ? 'border-gray-900' : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={createMemberMutation.isPending}
                    >
                      {createMemberMutation.isPending ? "Adding..." : "Add Member"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Members */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Members</CardTitle>
                  <CardDescription>
                    Manage your family members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {familyMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: member.color }}
                          >
                            {member.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.name}</p>
                            <p className="text-sm text-gray-500">
                              {member.role} {member.age && `(${member.age})`}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMemberMutation.mutate(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Task */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Create New Task</span>
                  </CardTitle>
                  <CardDescription>
                    Add a new chore or task for your family
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="taskName">Task Name</Label>
                      <Input
                        id="taskName"
                        value={newTask.name}
                        onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                        placeholder="Make bed"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taskDescription">Description</Label>
                      <Textarea
                        id="taskDescription"
                        value={newTask.description}
                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                        placeholder="Straighten sheets, fluff pillows, organize room"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="taskPoints">Points</Label>
                        <Input
                          id="taskPoints"
                          type="number"
                          value={newTask.points}
                          onChange={(e) => setNewTask({ ...newTask, points: e.target.value })}
                          placeholder="25"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taskMinutes">Time (minutes)</Label>
                        <Input
                          id="taskMinutes"
                          type="number"
                          value={newTask.estimatedMinutes}
                          onChange={(e) => setNewTask({ ...newTask, estimatedMinutes: e.target.value })}
                          placeholder="10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Schedule</Label>
                      <Select 
                        value={newTask.scheduleType}
                        onValueChange={(value: any) => setNewTask({ ...newTask, scheduleType: value })}
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

                    {newTask.scheduleType === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="scheduleValue">Every X days</Label>
                        <Input
                          id="scheduleValue"
                          type="number"
                          value={newTask.scheduleValue}
                          onChange={(e) => setNewTask({ ...newTask, scheduleValue: e.target.value })}
                          placeholder="3"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={newTask.startDate}
                        onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date (optional)</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={newTask.endDate}
                        onChange={(e) => setNewTask({ ...newTask, endDate: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Assign To</Label>
                      <div className="space-y-2">
                        {familyMembers.map((member: any) => (
                          <div key={member.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`assignee-${member.id}`}
                              checked={newTask.assigneeIds.includes(member.id)}
                              onChange={(e) => {
                                const isChecked = e.target.checked;
                                const newAssigneeIds = isChecked
                                  ? [...newTask.assigneeIds, member.id]
                                  : newTask.assigneeIds.filter(id => id !== member.id);
                                setNewTask({ ...newTask, assigneeIds: newAssigneeIds });
                              }}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`assignee-${member.id}`} className="text-sm font-medium text-gray-700">
                              {member.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={createTaskMutation.isPending}
                    >
                      {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Tasks</CardTitle>
                  <CardDescription>
                    Manage your family tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tasks.map((task: any) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{task.name}</p>
                          <p className="text-sm text-gray-500">
                            Starts: {new Date(task.startDate).toLocaleDateString()} • 
                            {task.points} pts • {task.estimatedMinutes} min • {task.scheduleType}
                            {task.scheduleType === 'custom' && task.scheduleValue && ` (every ${task.scheduleValue} days)`}
                            {task.endDate && ` • Ends: ${new Date(task.endDate).toLocaleDateString()}`}
                          </p>
                          {task.assignees && task.assignees.length > 0 && (
                            <p className="text-sm text-blue-600 font-medium">
                              Assigned to: {task.assignees.map((assignee: any) => assignee.name).join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setIsEditDialogOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTaskMutation.mutate(task.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add New Reward */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Create New Reward</span>
                  </CardTitle>
                  <CardDescription>
                    Add rewards that family members can earn
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateReward} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rewardName">Reward Name</Label>
                      <Input
                        id="rewardName"
                        value={newReward.name}
                        onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                        placeholder="Extra screen time"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rewardDescription">Description</Label>
                      <Textarea
                        id="rewardDescription"
                        value={newReward.description}
                        onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                        placeholder="30 minutes of extra screen time"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rewardCost">Points Cost</Label>
                      <Input
                        id="rewardCost"
                        type="number"
                        value={newReward.pointsCost}
                        onChange={(e) => setNewReward({ ...newReward, pointsCost: e.target.value })}
                        placeholder="100"
                        required
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full btn-primary"
                      disabled={createRewardMutation.isPending}
                    >
                      {createRewardMutation.isPending ? "Creating..." : "Create Reward"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Current Rewards */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Rewards</CardTitle>
                  <CardDescription>
                    Available rewards for family members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rewards.map((reward: any) => (
                      <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{reward.name}</p>
                          <p className="text-sm text-gray-500">
                            {reward.pointsCost} points
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Family Settings</CardTitle>
                <CardDescription>
                  Configure your family household settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateHousehold} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="familyName">Family Name</Label>
                    <Input
                      id="familyName"
                      value={householdSettings.name}
                      onChange={(e) => setHouseholdSettings({ ...householdSettings, name: e.target.value })}
                      placeholder="The Johnson Family"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="adminPin">Admin PIN</Label>
                    <Input
                      id="adminPin"
                      type="password"
                      value={householdSettings.adminPin}
                      onChange={(e) => setHouseholdSettings({ ...householdSettings, adminPin: e.target.value })}
                      placeholder="Enter new 4-digit PIN"
                      maxLength={4}
                    />
                    <p className="text-xs text-gray-500">
                      Leave blank to keep current PIN
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-primary"
                    disabled={updateHouseholdMutation.isPending}
                  >
                    {updateHouseholdMutation.isPending ? "Updating..." : "Update Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={selectedTask}
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}
