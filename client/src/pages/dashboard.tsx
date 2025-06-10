import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import TaskCard from "@/components/task-card";
import PinModal from "@/components/pin-modal";
import CelebrationAnimation from "@/components/celebration-animation";
import { getAvatarClass, getInitial } from "@/lib/utils";
import { ListTodo, Settings, ArrowLeft, Calendar, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Star, Flame } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const [view, setView] = useState<"today" | "week">("today");
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{ points: number; taskTitle: string } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showEditPinModal, setShowEditPinModal] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<number | null>(null);
  const { household, currentPerson, people, selectProfile, verifyAdminPin, logout } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard", household?.id, currentDate.toISOString().split('T')[0]],
    queryFn: async () => {
      const dateParam = currentDate.toISOString().split('T')[0];
      const response = await fetch(`/api/dashboard?householdId=${household?.id}&date=${dateParam}`);
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      return response.json();
    },
    enabled: !!household?.id,
  });

  const completeTaskMutation = useMutation({
    mutationFn: async ({ instanceId, personId }: { instanceId: number; personId: number }) => {
      const response = await apiRequest("POST", `/api/tasks/${instanceId}/complete`, { personId });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate all dashboard queries with proper keys
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.refetchQueries({ queryKey: ["/api/dashboard", household?.id, currentDate.toISOString().split('T')[0]] });
      
      if (data.pointsEarned) {
        setCelebrationData({
          points: data.pointsEarned,
          taskTitle: data.taskTitle
        });
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ListTodo className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (!people || people.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-white" />
          </div>
          <p className="text-slate-600">No family members found. Please log in again.</p>
        </div>
      </div>
    );
  }

  const taskInstances = dashboardData?.taskInstances || [];
  const allTasks = taskInstances;

  const handleCompleteTask = (instanceId: number) => {
    if (currentPerson) {
      completeTaskMutation.mutate({ instanceId, personId: currentPerson.id });
    }
  };

  const handleAdminAccess = async (pin: string) => {
    const isValid = await verifyAdminPin(pin);
    if (isValid) {
      setShowAdminModal(false);
      setLocation("/admin");
    }
    return isValid;
  };

  const handlePersonClick = (personId: number) => {
    setSelectedPersonId(selectedPersonId === personId ? null : personId);
  };

  const handleTaskEdit = (taskId: number) => {
    setTaskToEdit(taskId);
    setShowEditPinModal(true);
  };

  const handleEditPinVerify = async (pin: string) => {
    const isValid = await verifyAdminPin(pin);
    if (isValid && taskToEdit) {
      setLocation(`/admin?editTask=${taskToEdit}`);
      setShowEditPinModal(false);
      setTaskToEdit(null);
      return true;
    }
    return false;
  };

  const generateWeekView = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start from Sunday
    
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(weekStart.getDate() + i);
      
      // Filter tasks for this day - exclude completed tasks
      const dayTasks = taskInstances.filter((task: any) => {
        if (task.isCompleted) return false;
        const taskDate = new Date(task.dueDate);
        return (
          taskDate.toDateString() === currentDay.toDateString() &&
          (!selectedPersonId || task.assignedTo === selectedPersonId)
        );
      });
      
      weekDays.push({
        dayName: currentDay.toLocaleDateString('en-US', { weekday: 'long' }),
        date: currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        isToday: currentDay.toDateString() === today.toDateString(),
        tasks: dayTasks,
        taskCount: dayTasks.length
      });
    }
    
    return weekDays;
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'today') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    }
    setCurrentDate(newDate);
  };

  // Get tasks for display - server already filters by date, just filter by person and completion
  const tasksToShow = (selectedPersonId 
    ? allTasks.filter((ti: any) => ti.assignedTo === selectedPersonId)
    : allTasks
  ).filter((ti: any) => {
    // Only show incomplete tasks (server already filtered by date)
    return !ti.isCompleted;
  });

  // Calculate stats for each person - server already filtered by date
  const peopleWithStats = people.map((person: any) => {
    const personTasks = allTasks.filter((ti: any) => {
      return ti.assignedTo === person.id;
    });
    const completedTasks = personTasks.filter((ti: any) => ti.isCompleted);
    const incompleteTasks = personTasks.filter((ti: any) => !ti.isCompleted);
    const progress = personTasks.length > 0 ? Math.round((completedTasks.length / personTasks.length) * 100) : 0;
    
    return {
      ...person,
      tasksToday: incompleteTasks.length, // Only show incomplete tasks in the count
      completedToday: completedTasks.length,
      progressToday: progress
    };
  });

  const selectedPerson = selectedPersonId ? people.find(p => p.id === selectedPersonId) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-purple-600 rounded-xl flex items-center justify-center">
                <ListTodo className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Chory</h1>
                <p className="text-xs text-slate-500">{household?.name} Family</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {selectedPerson && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPersonId(null)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to All
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdminModal(true)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Person Boxes - 4 across, 25% each */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {peopleWithStats.map((person) => (
            <Card 
              key={person.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md",
                selectedPersonId === person.id 
                  ? "border-2 border-primary bg-primary/5" 
                  : "border border-slate-200 hover:border-primary/50",
                selectedPersonId && selectedPersonId !== person.id ? "opacity-75" : ""
              )}
              onClick={() => handlePersonClick(person.id)}
            >
              <CardContent className={cn(
                "text-center transition-all duration-200",
                selectedPersonId ? "p-3" : "p-4"
              )}>
                {selectedPersonId ? (
                  // Compact view for all people when someone is selected
                  <div className="flex items-center justify-center space-x-2">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      getAvatarClass(person.avatar)
                    )}>
                      <span className="text-white text-sm font-bold">
                        {getInitial(person.nickname)}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-slate-700">{person.nickname}</span>
                  </div>
                ) : (
                  // Full view
                  <>
                    <div className={cn(
                      "w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg",
                      getAvatarClass(person.avatar)
                    )}>
                      <span className="text-white text-xl font-bold">
                        {getInitial(person.nickname)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-slate-800 mb-3">{person.nickname}</h3>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Today's Tasks</span>
                        <span className="text-xs font-medium text-slate-800">
                          {person.completedToday}/{person.tasksToday}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${person.progressToday}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Stats with Icons */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center justify-center space-x-1 bg-amber-50 rounded-lg p-2">
                        <Star className="w-3 h-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">{person.totalPoints || 0}</span>
                      </div>
                      <div className="flex items-center justify-center space-x-1 bg-orange-50 rounded-lg p-2">
                        <Flame className="w-3 h-3 text-orange-600" />
                        <span className="text-xs font-medium text-orange-700">{person.currentStreak || 0}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Header for tasks section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {selectedPerson ? `${selectedPerson.nickname}'s Tasks` : 'All Family Tasks'}
            </h2>
            <p className="text-slate-600">
              {selectedPerson ? `Personal task list` : 'Household tasks for everyone'}
            </p>
          </div>

          {/* Navigation for all views */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium text-slate-600 px-3">
              {view === 'today' 
                ? currentDate.toLocaleDateString()
                : `Week of ${currentDate.toLocaleDateString()}`
              }
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* View Toggle */}
        <Tabs value={view} onValueChange={(v) => setView(v as "today" | "week")}>
          <div className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white rounded-xl p-1 shadow-sm">
              <TabsTrigger value="today" className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Day</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center space-x-2">
                <CalendarDays className="w-4 h-4" />
                <span>Week</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="today" className="space-y-4 mt-0">
            {tasksToShow.length === 0 ? (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center py-8 text-slate-500">
                    <ListTodo className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No tasks for today!</h3>
                    <p>{selectedPerson ? `${selectedPerson.nickname} has no tasks` : 'All family tasks are completed'}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tasksToShow.map((taskInstance: any) => {
                const taskPerson = people.find(p => p.id === taskInstance.assignedTo);
                const isOverdue = new Date(taskInstance.dueDate) < new Date() && !taskInstance.isCompleted;
                
                return (
                  <Card key={taskInstance.id} className={cn(
                    "overflow-hidden border",
                    isOverdue ? "border-red-200 bg-red-50" : "border-slate-200"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-4">
                        {/* Show person info only in "all tasks" view */}
                        {!selectedPerson && (
                          <div className="flex items-center space-x-3">
                            <div className="flex -space-x-2">
                              {/* Primary assignee */}
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center border-2 border-white",
                                getAvatarClass(taskPerson?.avatar || "")
                              )}>
                                <span className="text-white font-semibold text-xs">
                                  {getInitial(taskPerson?.nickname || "")}
                                </span>
                              </div>
                              {/* Secondary assignees */}
                              {taskInstance.task?.secondaryAssignees?.map((assigneeId: number, index: number) => {
                                const secondaryPerson = people.find(p => p.id === assigneeId);
                                return secondaryPerson ? (
                                  <div key={assigneeId} className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 border-white",
                                    getAvatarClass(secondaryPerson.avatar)
                                  )}>
                                    <span className="text-white font-semibold text-xs">
                                      {getInitial(secondaryPerson.nickname)}
                                    </span>
                                  </div>
                                ) : null;
                              })}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-slate-700">
                                {taskPerson?.nickname}
                                {taskInstance.task?.secondaryAssignees?.length > 0 && 
                                  ` +${taskInstance.task.secondaryAssignees.length}`
                                }
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Task Details */}
                        <div className="flex-1">
                          <TaskCard
                            taskInstance={taskInstance}
                            onComplete={() => handleCompleteTask(taskInstance.id)}
                            onEdit={handleTaskEdit}
                            isLoading={completeTaskMutation.isPending}
                            canComplete={!taskInstance.isCompleted && !!selectedPerson}
                          />
                        </div>
                        
                        {/* Overdue Badge */}
                        {isOverdue && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          <TabsContent value="week" className="space-y-6 mt-0">
            {generateWeekView().map((day: any, index: number) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-primary" />
                      <span className="text-lg font-semibold">{day.dayName}</span>
                      <span className="text-sm text-slate-500">{day.date}</span>
                    </div>
                    <Badge variant={day.isToday ? "default" : "secondary"}>
                      {day.taskCount} tasks
                    </Badge>
                  </div>
                  
                  {day.tasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">No tasks for this day</p>
                  ) : (
                    <div className="space-y-3">
                      {day.tasks.map((taskInstance: any) => {
                        const taskPerson = people.find(p => p.id === taskInstance.assignedTo);
                        const isOverdue = new Date(taskInstance.dueDate) < new Date() && !taskInstance.isCompleted;
                        
                        return (
                          <div key={taskInstance.id} className={cn(
                            "flex items-center space-x-4 p-3 rounded-lg border",
                            isOverdue ? "bg-red-50 border-red-200" : "bg-slate-50 border-slate-200"
                          )}>
                            {!selectedPerson && (
                              <div className="flex items-center space-x-2">
                                <div className="flex -space-x-1">
                                  {/* Primary assignee */}
                                  <div className={cn(
                                    "w-8 h-8 rounded-full flex items-center justify-center border-2 border-white",
                                    getAvatarClass(taskPerson?.avatar || "")
                                  )}>
                                    <span className="text-white text-sm font-semibold">
                                      {getInitial(taskPerson?.nickname || "")}
                                    </span>
                                  </div>
                                  {/* Secondary assignees */}
                                  {taskInstance.task?.secondaryAssignees?.map((assigneeId: number) => {
                                    const secondaryPerson = people.find(p => p.id === assigneeId);
                                    return secondaryPerson ? (
                                      <div key={assigneeId} className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center border-2 border-white",
                                        getAvatarClass(secondaryPerson.avatar)
                                      )}>
                                        <span className="text-white font-bold text-xs">
                                          {getInitial(secondaryPerson.nickname)}
                                        </span>
                                      </div>
                                    ) : null;
                                  })}
                                </div>
                                <span className="text-sm font-medium text-slate-700">
                                  {taskPerson?.nickname}
                                  {taskInstance.task?.secondaryAssignees?.length > 0 && 
                                    ` +${taskInstance.task.secondaryAssignees.length}`
                                  }
                                </span>
                              </div>
                            )}
                            <div className="flex-1">
                              <TaskCard
                                taskInstance={taskInstance}
                                onComplete={() => handleCompleteTask(taskInstance.id)}
                                onEdit={handleTaskEdit}
                                isLoading={completeTaskMutation.isPending}
                                canComplete={!taskInstance.isCompleted}
                              />
                            </div>
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      {/* Admin PIN Modal */}
      <PinModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onVerify={handleAdminAccess}
        title="Admin Access"
        description="Enter your 4-digit PIN to continue"
      />

      {/* Edit Task PIN Modal */}
      <PinModal
        isOpen={showEditPinModal}
        onClose={() => {
          setShowEditPinModal(false);
          setTaskToEdit(null);
        }}
        onVerify={handleEditPinVerify}
        title="Edit Task"
        description="Enter your admin PIN to edit this task"
      />

      {/* Celebration Animation */}
      <CelebrationAnimation
        isVisible={showCelebration}
        points={celebrationData?.points || 0}
        taskTitle={celebrationData?.taskTitle || ""}
      />
    </div>
  );
}