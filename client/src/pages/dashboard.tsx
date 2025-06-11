import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, addDays, subDays, startOfWeek, endOfWeek } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Settings, Home, Calendar, Trophy } from "lucide-react";
import FamilyMemberCard from "@/components/family-member-card";
import TaskItem from "@/components/task-item";
import CompletionCelebration from "@/components/completion-celebration";
import AdminPinDialog from "@/components/admin-pin-dialog";

export default function Dashboard() {
  const { household, member, selectMember } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week'>('day');
  const [selectedMember, setSelectedMember] = useState<number | null>(member?.id || null);
  const [showAdminDialog, setShowAdminDialog] = useState(false);
  const [celebration, setCelebration] = useState<{
    show: boolean;
    taskName: string;
    points: number;
  }>({ show: false, taskName: "", points: 0 });

  // Fetch family members
  const { data: familyMembers = [] } = useQuery({
    queryKey: ["/api/family-members"],
  });

  // Fetch tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ["/api/tasks", format(currentDate, "yyyy-MM-dd"), selectedMember, view],
    queryFn: () => {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const params = new URLSearchParams();
      params.append('date', dateStr);
      params.append('view', view);
      if (selectedMember) params.append('memberId', selectedMember.toString());
      
      return fetch(`/api/tasks?${params.toString()}`).then(res => res.json());
    },
  });

  // Fetch leaderboard
  const { data: leaderboard = [] } = useQuery({
    queryKey: ["/api/leaderboard"],
  });

  const handleMemberSelect = (memberId: number | null) => {
    setSelectedMember(memberId);
    selectMember(memberId);
  };

  const handleDateChange = (direction: 'prev' | 'next') => {
    if (view === 'day') {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addDays(currentDate, 7) : subDays(currentDate, 7));
    }
  };

  const onTaskComplete = (taskName: string, points: number) => {
    setCelebration({ show: true, taskName, points });
  };

  const formatDateDisplay = () => {
    if (view === 'day') {
      const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
      return isToday ? `Today, ${format(currentDate, 'MMMM d')}` : format(currentDate, 'MMMM d, yyyy');
    } else {
      const start = startOfWeek(currentDate);
      const end = endOfWeek(currentDate);
      return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
    }
  };

  const overdTasks = tasks.filter((task: any) => task.isOverdue);
  const todayTasks = tasks.filter((task: any) => !task.isOverdue);
  const completedCount = todayTasks.filter((task: any) => task.isCompleted).length;

  // Group tasks by day for week view
  const groupTasksByDay = () => {
    if (view === 'day') return null;
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const groupedTasks: { [key: string]: any[] } = {};
    
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i);
      const dayKey = format(day, 'yyyy-MM-dd');
      groupedTasks[dayKey] = tasks.filter((task: any) => 
        format(new Date(task.startDate), 'yyyy-MM-dd') === dayKey
      );
    }
    
    return groupedTasks;
  };

  const weeklyTaskGroups = groupTasksByDay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                <Home className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{household?.name}</h1>
                <p className="text-sm text-gray-500">Chore Champions!</p>
              </div>
            </div>

            <Button 
              onClick={() => setShowAdminDialog(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Admin</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Family Members Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
            </svg>
            Family Members
          </h2>
          <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
            {familyMembers.map((familyMember: any) => (
              <FamilyMemberCard
                key={familyMember.id}
                member={familyMember}
                isSelected={selectedMember === familyMember.id}
                isCompact={selectedMember !== null}
                onSelect={() => {
                  if (selectedMember === familyMember.id) {
                    handleMemberSelect(null); // Deselect if clicking the same member
                  } else {
                    handleMemberSelect(familyMember.id);
                  }
                }}
              />
            ))}
          </div>
        </section>

        {/* View Navigation */}
        <section className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="bg-white rounded-lg p-1 shadow-md border border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setView('day')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === 'day' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Day View
                </button>
                <button
                  onClick={() => setView('week')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    view === 'week' 
                      ? 'bg-primary text-white shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Week View
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleDateChange('prev')}
                className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">{formatDateDisplay()}</h3>
                <p className="text-sm text-gray-500">{format(currentDate, 'EEEE')}</p>
              </div>
              <button
                onClick={() => handleDateChange('next')}
                className="p-2 rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 text-gray-600 hover:text-gray-900"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </section>

        {/* Task Lists */}
        <section>
          {/* Overdue Tasks */}
          {overdTasks.length > 0 && (
            <div className="mb-6">
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                  </svg>
                  <h3 className="text-lg font-semibold text-red-700">Overdue Tasks</h3>
                </div>
                
                <div className="space-y-4">
                  {overdTasks.map((task: any) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showDoneButton={selectedMember !== null}
                      onComplete={onTaskComplete}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Day View - Today's Tasks */}
          {view === 'day' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  Today's Tasks
                </h3>
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-primary">
                    {completedCount}/{todayTasks.length} completed
                  </span>
                </div>
              </div>

              {todayTasks.length > 0 ? (
                <div className="space-y-4">
                  {todayTasks.map((task: any) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showDoneButton={selectedMember !== null}
                      onComplete={onTaskComplete}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl p-8 text-center shadow-lg border border-gray-100">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No tasks for today!
                  </h3>
                  <p className="text-gray-600">
                    {selectedMember 
                      ? "You're all caught up! Great work!" 
                      : "Select a family member to see their tasks, or check back later."}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Week View - Tasks Grouped by Day */}
          {view === 'week' && weeklyTaskGroups && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-primary" />
                  This Week's Tasks
                </h3>
              </div>

              <div className="grid gap-4">
                {Object.entries(weeklyTaskGroups).map(([dateKey, dayTasks]) => {
                  const dayDate = new Date(dateKey);
                  const isToday = format(dayDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const dayTasksFiltered = dayTasks.filter((task: any) => !task.isOverdue);
                  
                  return (
                    <div key={dateKey} className={`bg-white rounded-lg p-4 shadow-sm border ${isToday ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className={`font-semibold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
                          {format(dayDate, 'EEEE, MMM d')}
                          {isToday && <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded-full">Today</span>}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {dayTasksFiltered.length} task{dayTasksFiltered.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {dayTasksFiltered.length > 0 ? (
                        <div className="space-y-3">
                          {dayTasksFiltered.map((task: any, index: number) => (
                            <TaskItem
                              key={`${task.id}-${dateKey}-${index}`}
                              task={task}
                              showDoneButton={selectedMember !== null}
                              onComplete={onTaskComplete}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">No tasks scheduled</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Leaderboard */}
        {leaderboard.length > 0 && (
          <section className="mt-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <Trophy className="w-5 h-5 mr-3 text-yellow-500" />
                  Weekly Leaderboard
                </h3>
              </div>

              <div className="space-y-4">
                {leaderboard.slice(0, 3).map((entry: any, index: number) => (
                  <div
                    key={entry.member.id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      index === 0
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          index === 0
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                            : index === 1
                            ? 'bg-gray-400'
                            : 'bg-orange-400'
                        }`}
                      >
                        {index + 1}
                      </div>
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                        style={{ background: entry.member.color }}
                      >
                        {entry.member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{entry.member.name}</h4>
                        <p className="text-sm text-gray-600">
                          {index === 0 ? 'Chore Champion! 🏆' : 'Great work! 💪'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${
                        index === 0 ? 'text-yellow-600' : 'text-gray-700'
                      }`}>
                        {entry.weeklyPoints} pts
                      </div>
                      <div className="text-sm text-gray-500">+{entry.weeklyIncrease} this week</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Modals */}
      <CompletionCelebration
        show={celebration.show}
        taskName={celebration.taskName}
        points={celebration.points}
        onClose={() => setCelebration({ show: false, taskName: "", points: 0 })}
      />

      <AdminPinDialog
        open={showAdminDialog}
        onClose={() => setShowAdminDialog(false)}
      />
    </div>
  );
}
